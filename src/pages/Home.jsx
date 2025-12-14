import { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";

function Home() {
  const [menuItems, setMenuItems] = useState([]);
  const [recipeItems, setRecipeItems] = useState([]);
  const [ingredients, setIngredients] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [order, setOrder] = useState([]);
  const [selectedMenuItemId, setSelectedMenuItemId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [prepList, setPrepList] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      // Load menu items
      const menuSnapshot = await getDocs(collection(db, "menuItems"));
      const menuList = menuSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMenuItems(menuList);
      if (menuList.length > 0) {
        setSelectedMenuItemId(menuList[0].id);
      }

      // Load recipe items
      const recipeSnapshot = await getDocs(collection(db, "recipeItems"));
      const recipeList = recipeSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setRecipeItems(recipeList);

      // Load ingredients
      const ingSnapshot = await getDocs(collection(db, "ingredients"));
      const ingList = ingSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setIngredients(ingList);

      // Load departments
      const deptSnapshot = await getDocs(collection(db, "departments"));
      const deptList = deptSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setDepartments(deptList);
    } catch (error) {
      console.error("Error loading data:", error);
      setError("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleAddToOrder = (e) => {
    e.preventDefault();
    if (!selectedMenuItemId) return;

    const menuItem = menuItems.find((item) => item.id === selectedMenuItemId);
    if (!menuItem) return;

    const orderItem = {
      menuItemId: selectedMenuItemId,
      menuItemName: menuItem.name,
      quantity: parseFloat(quantity) || 1,
    };

    setOrder([...order, orderItem]);
    setQuantity(1);
  };

  const handleRemoveFromOrder = (index) => {
    const newOrder = [...order];
    newOrder.splice(index, 1);
    setOrder(newOrder);
    setPrepList(null);
  };

  const handleClearOrder = () => {
    setOrder([]);
    setPrepList(null);
  };

  const handleGeneratePrepList = () => {
    if (order.length === 0) {
      setError("Please add items to the order first");
      return;
    }

    setGenerating(true);
    setError(null);
    setPrepList(null);

    try {
      // Initialize Map to store ingredient totals
      // Key: ingredientId, Value: totalQuantity
      const ingredientTotals = new Map();

      // Loop through each item in the order
      for (const orderItem of order) {
        const { menuItemId, quantity } = orderItem;

        if (!menuItemId || !quantity || quantity <= 0) {
          continue; // Skip invalid items
        }

        // Find all recipe items for this menuItemId
        const relevantRecipes = recipeItems.filter(
          (recipe) => recipe.menuItemId === menuItemId
        );

        // Process each recipe item
        relevantRecipes.forEach((recipe) => {
          const { ingredientId, quantity: recipeQuantity } = recipe;

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
        setPrepList({ report: [] });
        setGenerating(false);
        return;
      }

      // Build ingredient details map
      const ingredientDetails = new Map();
      const departmentIds = new Set();

      ingredientTotals.forEach((totalQuantity, ingredientId) => {
        const ingredient = ingredients.find((ing) => ing.id === ingredientId);
        if (ingredient) {
          ingredientDetails.set(ingredientId, {
            id: ingredientId,
            name: ingredient.name || "Unknown",
            unit: ingredient.unit || "",
            departmentId: ingredient.departmentId || null,
          });
          if (ingredient.departmentId) {
            departmentIds.add(ingredient.departmentId);
          }
        }
      });

      // Build department details map
      const departmentDetails = new Map();
      departments.forEach((dept) => {
        if (departmentIds.has(dept.id)) {
          departmentDetails.set(dept.id, dept.name || "Unknown");
        }
      });

      // Group ingredients by department
      const departmentGroups = new Map();

      ingredientTotals.forEach((totalQuantity, ingredientId) => {
        const ingredient = ingredientDetails.get(ingredientId);
        if (!ingredient) return;

        const departmentId = ingredient.departmentId;
        const departmentName = departmentId
          ? departmentDetails.get(departmentId) || "Unassigned"
          : "Unassigned";

        if (!departmentGroups.has(departmentName)) {
          departmentGroups.set(departmentName, []);
        }

        departmentGroups.get(departmentName).push({
          name: ingredient.name,
          totalQuantity: totalQuantity,
          unit: ingredient.unit,
        });
      });

      // Convert Map to array format for response
      const report = Array.from(departmentGroups.entries()).map(
        ([departmentName, ingredients]) => ({
          departmentName,
          ingredients: ingredients.sort((a, b) => a.name.localeCompare(b.name)),
        })
      );

      // Sort departments alphabetically
      report.sort((a, b) => a.departmentName.localeCompare(b.departmentName));

      setPrepList({ report });
    } catch (error) {
      console.error("Error generating prep list:", error);
      setError(
        "Failed to generate prep list: " + (error.message || "Unknown error")
      );
    } finally {
      setGenerating(false);
    }
  };

  const getMenuItemName = (menuItemId) => {
    const item = menuItems.find((m) => m.id === menuItemId);
    return item ? item.name : "Unknown";
  };

  // Format prep list as text (all departments)
  const formatPrepListText = () => {
    if (!prepList || !prepList.report) return "";

    let text = "PREP LIST REPORT\n";
    text += "=".repeat(50) + "\n\n";

    // Add order summary
    text += "ORDER SUMMARY:\n";
    order.forEach((item) => {
      text += `- ${item.menuItemName}: ${item.quantity}\n`;
    });
    text += "\n" + "=".repeat(50) + "\n\n";

    // Add ingredients by department
    prepList.report.forEach((dept) => {
      text += `\n${dept.departmentName.toUpperCase()}\n`;
      text += "-".repeat(30) + "\n";
      dept.ingredients.forEach((ing) => {
        text += `${ing.name}: ${ing.totalQuantity} ${ing.unit}\n`;
      });
      text += "\n";
    });

    return text;
  };

  // Format single department as text
  const formatDepartmentText = (department) => {
    if (!department) return "";

    let text = `${department.departmentName.toUpperCase()}\n`;
    text += "=".repeat(50) + "\n\n";

    // Add order summary
    text += "ORDER SUMMARY:\n";
    order.forEach((item) => {
      text += `- ${item.menuItemName}: ${item.quantity}\n`;
    });
    text += "\n" + "=".repeat(50) + "\n\n";

    // Add department ingredients
    text += `${department.departmentName.toUpperCase()}\n`;
    text += "-".repeat(30) + "\n";
    department.ingredients.forEach((ing) => {
      text += `${ing.name}: ${ing.totalQuantity} ${ing.unit}\n`;
    });

    return text;
  };

  // Copy all to clipboard
  const handleCopyToClipboard = async () => {
    try {
      const text = formatPrepListText();
      await navigator.clipboard.writeText(text);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 3000);
    } catch (error) {
      console.error("Failed to copy:", error);
      setError("Failed to copy to clipboard. Please try again.");
    }
  };

  // Copy single department to clipboard
  const handleCopyDepartment = async (department) => {
    try {
      const text = formatDepartmentText(department);
      await navigator.clipboard.writeText(text);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 3000);
    } catch (error) {
      console.error("Failed to copy:", error);
      setError("Failed to copy department to clipboard. Please try again.");
    }
  };

  // Export as PDF
  const handleExportPDF = () => {
    if (!prepList || !prepList.report) return;

    const doc = new jsPDF();

    // Title
    doc.setFontSize(18);
    doc.text("PREP LIST REPORT", 14, 20);

    // Order Summary
    doc.setFontSize(12);
    doc.text("Order Summary:", 14, 35);
    let yPos = 42;
    order.forEach((item) => {
      doc.setFontSize(10);
      doc.text(`- ${item.menuItemName}: ${item.quantity}`, 20, yPos);
      yPos += 7;
    });

    yPos += 10;

    // Ingredients by Department
    prepList.report.forEach((dept) => {
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFontSize(14);
      doc.setTextColor(99, 102, 241);
      doc.text(dept.departmentName.toUpperCase(), 14, yPos);
      yPos += 10;

      // Table data
      const tableData = dept.ingredients.map((ing) => [
        ing.name,
        `${ing.totalQuantity} ${ing.unit}`,
      ]);

      doc.autoTable({
        startY: yPos,
        head: [["Ingredient", "Quantity"]],
        body: tableData,
        theme: "striped",
        headStyles: {
          fillColor: [99, 102, 241],
          textColor: 255,
          fontStyle: "bold",
        },
        styles: {
          fontSize: 10,
        },
        margin: { left: 14, right: 14 },
      });

      yPos = doc.lastAutoTable.finalY + 15;
    });

    // Save PDF
    const date = new Date().toISOString().split("T")[0];
    doc.save(`prep-list-${date}.pdf`);
  };

  // Export as Excel
  const handleExportExcel = () => {
    if (!prepList || !prepList.report) return;

    // Create workbook
    const wb = XLSX.utils.book_new();

    // Order Summary Sheet
    const orderData = [
      ["Menu Item", "Quantity"],
      ...order.map((item) => [item.menuItemName, item.quantity]),
    ];
    const orderSheet = XLSX.utils.aoa_to_sheet(orderData);
    XLSX.utils.book_append_sheet(wb, orderSheet, "Order Summary");

    // Prep List Sheet
    const prepListData = [["Department", "Ingredient", "Quantity", "Unit"]];
    prepList.report.forEach((dept) => {
      dept.ingredients.forEach((ing) => {
        prepListData.push([
          dept.departmentName,
          ing.name,
          ing.totalQuantity,
          ing.unit,
        ]);
      });
    });
    const prepListSheet = XLSX.utils.aoa_to_sheet(prepListData);

    // Add auto filter
    prepListSheet["!autofilter"] = { ref: "A1:D1" };

    XLSX.utils.book_append_sheet(wb, prepListSheet, "Prep List");

    // Save Excel file
    const date = new Date().toISOString().split("T")[0];
    XLSX.writeFile(wb, `prep-list-${date}.xlsx`);
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Order Calculator</h1>
        <p className="page-subtitle">
          Build your catering order and generate prep lists
        </p>
      </div>

      {error && <div className="error-message">{error}</div>}
      {copySuccess && (
        <div className="success-message">
          ✅ Prep list copied to clipboard successfully!
        </div>
      )}

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{menuItems.length}</div>
          <div className="stat-label">Menu Items</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{order.length}</div>
          <div className="stat-label">Items in Order</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">
            {order.reduce((sum, item) => sum + item.quantity, 0)}
          </div>
          <div className="stat-label">Total Quantity</div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Build Order</h2>
          </div>
          <div className="card-body">
            <form onSubmit={handleAddToOrder}>
              <div className="form-group">
                <label className="form-label">Menu Item</label>
                <select
                  className="form-select"
                  value={selectedMenuItemId}
                  onChange={(e) => setSelectedMenuItemId(e.target.value)}
                  required
                >
                  {menuItems.length === 0 ? (
                    <option value="">No menu items available</option>
                  ) : (
                    <>
                      <option value="">Select a menu item</option>
                      {menuItems.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.name}
                        </option>
                      ))}
                    </>
                  )}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Quantity</label>
                <input
                  type="number"
                  className="form-input"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  min="1"
                  step="1"
                  required
                />
              </div>
              <button
                type="submit"
                className="btn btn-primary btn-block"
                disabled={menuItems.length === 0}
              >
                ➕ Add to Order
              </button>
            </form>
          </div>
        </div>
      </div>

      {order.length > 0 && (
        <div className="section">
          <div className="card-header">
            <h2 className="section-title">Current Order</h2>
            <button
              className="btn btn-danger btn-small"
              onClick={handleClearOrder}
            >
              🗑️ Clear All
            </button>
          </div>
          <ul className="list">
            {order.map((item, index) => (
              <li key={index} className="order-item">
                <div>
                  <strong>{item.menuItemName}</strong> - Quantity:{" "}
                  {item.quantity}
                </div>
                <button
                  className="btn btn-danger btn-small"
                  onClick={() => handleRemoveFromOrder(index)}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
          <div style={{ marginTop: "1.5rem" }}>
            <button
              className="btn btn-success btn-large btn-block"
              onClick={handleGeneratePrepList}
            >
              📊 Generate Prep List
            </button>
          </div>
        </div>
      )}

      {prepList && prepList.report && (
        <div className="section prep-list">
          <div className="prep-list-header">
            <h2 className="section-title">Prep List Report</h2>
            <div className="export-buttons">
              <button
                className="btn btn-primary btn-small"
                onClick={handleCopyToClipboard}
                title="Copy all departments to clipboard"
              >
                📋 Copy All
              </button>
              <button
                className="btn btn-success btn-small"
                onClick={handleExportPDF}
                title="Export as PDF"
              >
                📄 PDF
              </button>
              <button
                className="btn btn-success btn-small"
                onClick={handleExportExcel}
                title="Export as Excel"
              >
                📊 Excel
              </button>
            </div>
          </div>
          {prepList.report.length === 0 ? (
            <div className="empty-state">
              No ingredients needed for this order.
            </div>
          ) : (
            prepList.report.map((dept, index) => (
              <div key={index} className="department-group">
                <div className="department-header">
                  <span className="department-name">{dept.departmentName}</span>
                  <button
                    className="btn btn-primary btn-small department-copy-btn"
                    onClick={() => handleCopyDepartment(dept)}
                    title={`Copy ${dept.departmentName} to clipboard`}
                  >
                    📋 Copy
                  </button>
                </div>
                <div className="ingredient-list">
                  {dept.ingredients.map((ing, ingIndex) => (
                    <div key={ingIndex} className="ingredient-item">
                      <span className="ingredient-name">{ing.name}</span>
                      <span className="ingredient-quantity">
                        {ing.totalQuantity} {ing.unit}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {order.length === 0 && !prepList && (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon">📦</div>
            <p>
              Start building your order by selecting a menu item and quantity
              above.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;
