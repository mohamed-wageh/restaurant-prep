import { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  query,
  where,
} from "firebase/firestore";
import { db } from "../firebase";

function Recipes() {
  const [menuItems, setMenuItems] = useState([]);
  const [ingredients, setIngredients] = useState([]);
  const [selectedMenuItem, setSelectedMenuItem] = useState(null);
  const [recipeItems, setRecipeItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [selectedIngredientId, setSelectedIngredientId] = useState("");
  const [ingredientQuantity, setIngredientQuantity] = useState(1);

  useEffect(() => {
    loadMenuItemsAndIngredients();
  }, []);

  useEffect(() => {
    if (selectedMenuItem) {
      loadRecipeItems(selectedMenuItem.id);
    }
  }, [selectedMenuItem]);

  const loadMenuItemsAndIngredients = async () => {
    setLoading(true);
    try {
      const menuSnapshot = await getDocs(collection(db, "menuItems"));
      const menuList = menuSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMenuItems(menuList);

      const ingSnapshot = await getDocs(collection(db, "ingredients"));
      const ingList = ingSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setIngredients(ingList);

      if (menuList.length > 0 && !selectedMenuItem) {
        setSelectedMenuItem(menuList[0]);
      }
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadRecipeItems = async (menuItemId) => {
    try {
      const q = query(
        collection(db, "recipeItems"),
        where("menuItemId", "==", menuItemId)
      );
      const snapshot = await getDocs(q);
      const recipeList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setRecipeItems(recipeList);
    } catch (error) {
      console.error("Error loading recipe items:", error);
    }
  };

  const handleAddIngredientToRecipe = async (e) => {
    e.preventDefault();
    if (!selectedIngredientId || !selectedMenuItem) return;

    try {
      await addDoc(collection(db, "recipeItems"), {
        menuItemId: selectedMenuItem.id,
        ingredientId: selectedIngredientId,
        quantity: parseFloat(ingredientQuantity) || 1,
      });
      setSelectedIngredientId("");
      setIngredientQuantity(1);
      loadRecipeItems(selectedMenuItem.id);
    } catch (error) {
      console.error("Error adding ingredient to recipe:", error);
    }
  };

  const handleDeleteRecipeItem = async (id) => {
    if (
      !window.confirm(
        "Are you sure you want to remove this ingredient from the recipe?"
      )
    )
      return;
    try {
      await deleteDoc(doc(db, "recipeItems", id));
      loadRecipeItems(selectedMenuItem.id);
    } catch (error) {
      console.error("Error deleting recipe item:", error);
    }
  };

  const getIngredientName = (ingredientId) => {
    const ing = ingredients.find((i) => i.id === ingredientId);
    return ing ? ing.name : "Unknown";
  };

  const getIngredientUnit = (ingredientId) => {
    const ing = ingredients.find((i) => i.id === ingredientId);
    return ing ? ing.unit : "";
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Recipe Builder</h1>
        <p className="page-subtitle">Define recipes for your menu items</p>
      </div>

      <div className="section">
        <h2 className="section-title">Select Menu Item</h2>
        {menuItems.length === 0 ? (
          <div className="empty-state">
            No menu items found. Please add menu items in the Setup page.
          </div>
        ) : (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
            {menuItems.map((item) => (
              <button
                key={item.id}
                className={`btn ${
                  selectedMenuItem?.id === item.id
                    ? "btn-primary"
                    : "btn-primary"
                }`}
                style={{
                  backgroundColor:
                    selectedMenuItem?.id === item.id ? "#3498db" : "#95a5a6",
                  opacity: selectedMenuItem?.id === item.id ? 1 : 0.7,
                }}
                onClick={() => setSelectedMenuItem(item)}
              >
                {item.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {selectedMenuItem && (
        <>
          <div className="section">
            <h2 className="section-title">
              Recipe for: {selectedMenuItem.name}
            </h2>

            <form onSubmit={handleAddIngredientToRecipe}>
              <div className="form-group">
                <label className="form-label">Add Ingredient to Recipe</label>
                <select
                  className="form-select"
                  value={selectedIngredientId}
                  onChange={(e) => setSelectedIngredientId(e.target.value)}
                  required
                >
                  <option value="">Select an ingredient</option>
                  {ingredients.map((ing) => (
                    <option key={ing.id} value={ing.id}>
                      {ing.name} ({ing.unit})
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Quantity</label>
                <input
                  type="number"
                  className="form-input"
                  value={ingredientQuantity}
                  onChange={(e) => setIngredientQuantity(e.target.value)}
                  min="0.01"
                  step="0.01"
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary">
                Add to Recipe
              </button>
            </form>
          </div>

          <div className="section">
            <h2 className="section-title">Current Recipe</h2>
            {recipeItems.length === 0 ? (
              <div className="empty-state">
                No ingredients in this recipe yet. Add ingredients above.
              </div>
            ) : (
              <ul className="list">
                {recipeItems.map((item) => (
                  <li key={item.id} className="list-item">
                    <div className="list-item-content">
                      <strong>{getIngredientName(item.ingredientId)}</strong> -{" "}
                      {item.quantity} {getIngredientUnit(item.ingredientId)}
                    </div>
                    <div className="list-item-actions">
                      <button
                        className="btn btn-danger btn-small"
                        onClick={() => handleDeleteRecipeItem(item.id)}
                      >
                        Remove
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default Recipes;
