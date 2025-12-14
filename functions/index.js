const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

const db = admin.firestore();

/**
 * Firebase Callable Function: generatePrepList
 * 
 * Calculates the total raw ingredients needed for an order,
 * grouped by department.
 * 
 * Input: { order: [{ menuItemId: string, quantity: number }, ...] }
 * Output: { report: [{ departmentName: string, ingredients: [...] }, ...] }
 */
exports.generatePrepList = functions.https.onCall(async (data, context) => {
  try {
    const { order } = data;

    // Validate input
    if (!order || !Array.isArray(order) || order.length === 0) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Order must be a non-empty array'
      );
    }

    // Initialize Map to store ingredient totals
    // Key: ingredientId, Value: totalQuantity
    const ingredientTotals = new Map();

    // Loop through each item in the order
    for (const item of order) {
      const { menuItemId, quantity } = item;

      if (!menuItemId || !quantity || quantity <= 0) {
        continue; // Skip invalid items
      }

      // Query recipeItems to find all ingredients for this menuItemId
      const recipeItemsSnapshot = await db
        .collection('recipeItems')
        .where('menuItemId', '==', menuItemId)
        .get();

      // Process each recipe item
      recipeItemsSnapshot.forEach((doc) => {
        const recipeData = doc.data();
        const { ingredientId, quantity: recipeQuantity } = recipeData;

        if (!ingredientId || !recipeQuantity) {
          return; // Skip invalid recipe items
        }

        // Calculate total needed: recipe quantity * order quantity
        const totalNeeded = recipeQuantity * quantity;

        // Aggregate in the Map
        if (ingredientTotals.has(ingredientId)) {
          const currentTotal = ingredientTotals.get(ingredientId);
          ingredientTotals.set(ingredientId, currentTotal + totalNeeded);
        } else {
          ingredientTotals.set(ingredientId, totalNeeded);
        }
      });
    }

    // If no ingredients found, return empty report
    if (ingredientTotals.size === 0) {
      return { report: [] };
    }

    // Fetch details for all needed ingredients
    const ingredientIds = Array.from(ingredientTotals.keys());
    const ingredientsPromises = ingredientIds.map((id) =>
      db.collection('ingredients').doc(id).get()
    );
    const ingredientDocs = await Promise.all(ingredientsPromises);

    // Build ingredient details map
    const ingredientDetails = new Map();
    const departmentIds = new Set();

    ingredientDocs.forEach((doc, index) => {
      if (doc.exists) {
        const data = doc.data();
        const ingredientId = ingredientIds[index];
        ingredientDetails.set(ingredientId, {
          id: ingredientId,
          name: data.name || 'Unknown',
          unit: data.unit || '',
          departmentId: data.departmentId || null
        });
        if (data.departmentId) {
          departmentIds.add(data.departmentId);
        }
      }
    });

    // Fetch department details
    const departmentPromises = Array.from(departmentIds).map((id) =>
      db.collection('departments').doc(id).get()
    );
    const departmentDocs = await Promise.all(departmentPromises);

    // Build department details map
    const departmentDetails = new Map();
    departmentDocs.forEach((doc) => {
      if (doc.exists) {
        const data = doc.data();
        departmentDetails.set(doc.id, data.name || 'Unknown');
      }
    });

    // Group ingredients by department
    const departmentGroups = new Map();

    ingredientTotals.forEach((totalQuantity, ingredientId) => {
      const ingredient = ingredientDetails.get(ingredientId);
      if (!ingredient) return;

      const departmentId = ingredient.departmentId;
      const departmentName = departmentId
        ? departmentDetails.get(departmentId) || 'Unassigned'
        : 'Unassigned';

      if (!departmentGroups.has(departmentName)) {
        departmentGroups.set(departmentName, []);
      }

      departmentGroups.get(departmentName).push({
        name: ingredient.name,
        totalQuantity: totalQuantity,
        unit: ingredient.unit
      });
    });

    // Convert Map to array format for response
    const report = Array.from(departmentGroups.entries()).map(([departmentName, ingredients]) => ({
      departmentName,
      ingredients: ingredients.sort((a, b) => a.name.localeCompare(b.name))
    }));

    // Sort departments alphabetically
    report.sort((a, b) => a.departmentName.localeCompare(b.departmentName));

    return { report };
  } catch (error) {
    console.error('Error generating prep list:', error);
    throw new functions.https.HttpsError(
      'internal',
      'Failed to generate prep list: ' + error.message
    );
  }
});

