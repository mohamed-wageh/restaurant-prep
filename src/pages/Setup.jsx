import { useState, useEffect, useMemo } from "react";
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../firebase";

function Setup() {
  const [activeTab, setActiveTab] = useState("departments");
  const [departments, setDepartments] = useState([]);
  const [ingredients, setIngredients] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Drawer states
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState("add"); // 'add' or 'edit'
  const [editingItem, setEditingItem] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    unit: "",
    departmentId: "",
  });

  // Search and filter
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDept, setFilterDept] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const deptSnapshot = await getDocs(collection(db, "departments"));
      const deptList = deptSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setDepartments(deptList);

      const ingSnapshot = await getDocs(collection(db, "ingredients"));
      const ingList = ingSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setIngredients(ingList);

      const menuSnapshot = await getDocs(collection(db, "menuItems"));
      const menuList = menuSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMenuItems(menuList);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Filtered and searched data
  const filteredData = useMemo(() => {
    let data = [];

    if (activeTab === "departments") {
      data = departments;
    } else if (activeTab === "ingredients") {
      data = ingredients;
      if (filterDept) {
        data = data.filter((ing) => ing.departmentId === filterDept);
      }
    } else {
      data = menuItems;
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      data = data.filter((item) => item.name.toLowerCase().includes(query));
    }

    return data;
  }, [activeTab, departments, ingredients, menuItems, searchQuery, filterDept]);

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage);
  }, [filteredData, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchQuery, filterDept]);

  const openDrawer = (mode, item = null) => {
    setDrawerMode(mode);
    setEditingItem(item);
    if (mode === "edit" && item) {
      if (activeTab === "departments") {
        setFormData({ name: item.name, unit: "", departmentId: "" });
      } else if (activeTab === "ingredients") {
        setFormData({
          name: item.name,
          unit: item.unit || "",
          departmentId: item.departmentId || "",
        });
      } else {
        setFormData({ name: item.name, unit: "", departmentId: "" });
      }
    } else {
      setFormData({ name: "", unit: "", departmentId: "" });
    }
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setEditingItem(null);
    setFormData({ name: "", unit: "", departmentId: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (activeTab === "departments") {
        if (drawerMode === "add") {
          await addDoc(collection(db, "departments"), {
            name: formData.name.trim(),
          });
        } else {
          await updateDoc(doc(db, "departments", editingItem.id), {
            name: formData.name.trim(),
          });
        }
      } else if (activeTab === "ingredients") {
        if (drawerMode === "add") {
          await addDoc(collection(db, "ingredients"), {
            name: formData.name.trim(),
            unit: formData.unit.trim(),
            departmentId: formData.departmentId,
          });
        } else {
          await updateDoc(doc(db, "ingredients", editingItem.id), {
            name: formData.name.trim(),
            unit: formData.unit.trim(),
            departmentId: formData.departmentId,
          });
        }
      } else {
        if (drawerMode === "add") {
          await addDoc(collection(db, "menuItems"), {
            name: formData.name.trim(),
          });
        } else {
          await updateDoc(doc(db, "menuItems", editingItem.id), {
            name: formData.name.trim(),
          });
        }
      }

      closeDrawer();
      loadData();
    } catch (error) {
      console.error("Error saving:", error);
      alert("Error saving. Please try again.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;

    try {
      if (activeTab === "departments") {
        await deleteDoc(doc(db, "departments", id));
      } else if (activeTab === "ingredients") {
        await deleteDoc(doc(db, "ingredients", id));
      } else {
        await deleteDoc(doc(db, "menuItems", id));
      }
      loadData();
    } catch (error) {
      console.error("Error deleting:", error);
      alert("Error deleting. Please try again.");
    }
  };

  const getDepartmentName = (deptId) => {
    const dept = departments.find((d) => d.id === deptId);
    return dept ? dept.name : "Unknown";
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Setup / Settings</h1>
        <p className="page-subtitle">
          Manage departments, ingredients, and menu items
        </p>
      </div>

      {/* Tabs */}
      <div className="tabs-container">
        <div className="tabs">
          <button
            className={`tab ${activeTab === "departments" ? "active" : ""}`}
            onClick={() => setActiveTab("departments")}
          >
            🏢 Departments ({departments.length})
          </button>
          <button
            className={`tab ${activeTab === "ingredients" ? "active" : ""}`}
            onClick={() => setActiveTab("ingredients")}
          >
            🥘 Ingredients ({ingredients.length})
          </button>
          <button
            className={`tab ${activeTab === "menuItems" ? "active" : ""}`}
            onClick={() => setActiveTab("menuItems")}
          >
            📋 Menu Items ({menuItems.length})
          </button>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="search-filter-bar">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            className="search-input"
            placeholder={`Search ${activeTab}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button className="clear-search" onClick={() => setSearchQuery("")}>
              ✕
            </button>
          )}
        </div>

        {activeTab === "ingredients" && (
          <select
            className="filter-select"
            value={filterDept}
            onChange={(e) => setFilterDept(e.target.value)}
          >
            <option value="">All Departments</option>
            {departments.map((dept) => (
              <option key={dept.id} value={dept.id}>
                {dept.name}
              </option>
            ))}
          </select>
        )}

        <button
          className="btn btn-primary add-button"
          onClick={() => openDrawer("add")}
        >
          ➕ Add New
        </button>
      </div>

      {/* Items Grid */}
      {filteredData.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon">
              {activeTab === "departments"
                ? "🏢"
                : activeTab === "ingredients"
                ? "🥘"
                : "📋"}
            </div>
            <p>
              {searchQuery || filterDept
                ? "No items found matching your search."
                : `No ${activeTab} yet. Click "Add New" to create one.`}
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className="items-grid">
            {paginatedData.map((item) => (
              <div key={item.id} className="item-card">
                <div className="item-card-header">
                  <h3 className="item-name">{item.name}</h3>
                  <div className="item-actions">
                    <button
                      className="icon-btn edit-btn"
                      onClick={() => openDrawer("edit", item)}
                      title="Edit"
                    >
                      ✏️
                    </button>
                    <button
                      className="icon-btn delete-btn"
                      onClick={() => handleDelete(item.id)}
                      title="Delete"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
                <div className="item-card-body">
                  {activeTab === "ingredients" && (
                    <>
                      <div className="item-detail">
                        <span className="item-label">Unit:</span>
                        <span className="item-value">{item.unit}</span>
                      </div>
                      <div className="item-detail">
                        <span className="item-label">Department:</span>
                        <span className="item-value">
                          {getDepartmentName(item.departmentId)}
                        </span>
                      </div>
                    </>
                  )}
                  {activeTab === "departments" && (
                    <div className="item-detail">
                      <span className="item-badge">
                        {
                          ingredients.filter(
                            (ing) => ing.departmentId === item.id
                          ).length
                        }{" "}
                        ingredients
                      </span>
                    </div>
                  )}
                  {activeTab === "menuItems" && (
                    <div className="item-detail">
                      <span className="item-badge">Menu Item</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              <button
                className="pagination-btn"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                ← Previous
              </button>
              <span className="pagination-info">
                Page {currentPage} of {totalPages} ({filteredData.length} items)
              </span>
              <button
                className="pagination-btn"
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}

      {/* Drawer */}
      {drawerOpen && (
        <>
          <div className="drawer-backdrop" onClick={closeDrawer}></div>
          <div className="drawer">
            <div className="drawer-header">
              <h2 className="drawer-title">
                {drawerMode === "add" ? "Add" : "Edit"}{" "}
                {activeTab === "departments"
                  ? "Department"
                  : activeTab === "ingredients"
                  ? "Ingredient"
                  : "Menu Item"}
              </h2>
              <button className="drawer-close" onClick={closeDrawer}>
                ✕
              </button>
            </div>
            <div className="drawer-body">
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label">
                    {activeTab === "departments"
                      ? "Department Name"
                      : activeTab === "ingredients"
                      ? "Ingredient Name"
                      : "Menu Item Name"}
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                    autoFocus
                  />
                </div>

                {activeTab === "ingredients" && (
                  <>
                    <div className="form-group">
                      <label className="form-label">Unit</label>
                      <input
                        type="text"
                        className="form-input"
                        value={formData.unit}
                        onChange={(e) =>
                          setFormData({ ...formData, unit: e.target.value })
                        }
                        placeholder="e.g., piece, slice, kg"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Department</label>
                      <select
                        className="form-select"
                        value={formData.departmentId}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            departmentId: e.target.value,
                          })
                        }
                        required
                      >
                        <option value="">Select a department</option>
                        {departments.map((dept) => (
                          <option key={dept.id} value={dept.id}>
                            {dept.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </>
                )}

                <div className="drawer-actions">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={closeDrawer}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {drawerMode === "add" ? "Add" : "Save"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Setup;
