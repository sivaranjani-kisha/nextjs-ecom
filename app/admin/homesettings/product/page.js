"use client";
import { useEffect, useState } from "react";
import Select from "react-select";

export default function ProductManagerPage() {
  const [categories, setCategories] = useState([]);
  const [groupedCategories, setGroupedCategories] = useState({});
  const [selectedSub, setSelectedSub] = useState("");
  const [products, setProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  // 🔹 All ProductViews (for table)
  const [productViews, setProductViews] = useState([]);

  // 🔹 Modal state
  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState(null);

  // ✅ Load categories + product views
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/categories/get");
        const data = await res.json();

        if (Array.isArray(data)) {
          setCategories(data);

          // group by parent
          const parents = data.filter((cat) => cat.parentid === "none");
          const grouped = {};
          parents.forEach((parent) => {
            grouped[parent.category_name] = data.filter(
              (cat) => cat.parentid === parent._id
            );
          });
          setGroupedCategories(grouped);
        }
      } catch (err) {
        console.error("❌ Failed to load categories:", err);
      }
    };

    fetchCategories();
    fetchProductViews();
  }, []);

  // ✅ Load all ProductViews for table
  const fetchProductViews = async () => {
    try {
      const res = await fetch("/api/productview");
      const data = await res.json();

      if (data.success) {
        setProductViews(data.data || []);
      }
    } catch (err) {
      console.error("❌ Failed to fetch product views:", err);
    }
  };

  // ✅ Fetch products when sub category changes
  const handleSubChange = async (subId) => {
    setSelectedSub(subId);
    setProducts([]);
    setSelectedProducts([]);

    if (!subId) return;
    setLoading(true);

    try {
      const res = await fetch(`/api/products/category/${subId}`);
      const data = await res.json();

      if (data.success) {
        setProducts(data.products || []);
      } else {
        console.error("Failed to fetch products:", data.message);
      }
    } catch (err) {
      console.error("❌ Failed to fetch products:", err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Handle product selection
  const handleProductChange = (selected) => {
    if (!selected) {
      setSelectedProducts([]);
      return;
    }
    if (selected.some((opt) => opt.value === "all")) {
      if (selectedProducts.length === products.length) {
        setSelectedProducts([]); // unselect all
      } else {
        setSelectedProducts(
          products.map((prod) => ({
            value: prod._id,
            label: `${prod.name} (₹${prod.price})`,
          }))
        );
      }
    } else {
      setSelectedProducts(selected);
    }
  };

  // ✅ Open Edit Modal - FIXED
  const handleEditClick = async (id) => {
    try {
      const res = await fetch(`/api/productview/${id}`);
      const data = await res.json();

      if (data.success) {
        setEditData(data.data);
        const categoryId = data.data.category?._id || "";
        setSelectedSub(categoryId);
        
        // Load products for this category
        if (categoryId) {
          setLoading(true);
          try {
            const productsRes = await fetch(`/api/products/category/${categoryId}`);
            const productsData = await productsRes.json();
            
            if (productsData.success) {
              setProducts(productsData.products || []);
              
              // Set selected products after products are loaded
              setSelectedProducts(
                (data.data.products || []).map((p) => ({
                  value: p._id,
                  label: `${p.name} (₹${p.price})`,
                }))
              );
            }
          } catch (err) {
            console.error("❌ Failed to fetch products:", err);
          } finally {
            setLoading(false);
          }
        }
        
        setShowModal(true);
      }
    } catch (err) {
      console.error("❌ Error loading edit data:", err);
    }
  };

  // ✅ Open Add Modal
  const handleAddClick = () => {
    setEditData(null);
    setSelectedSub("");
    setProducts([]);
    setSelectedProducts([]);
    setShowModal(true);
  };

  // ✅ Save data (Add / Edit)
  const handleSave = async () => {
    if (!selectedSub) {
      alert("⚠️ Please select a Sub Category.");
      return;
    }
    if (selectedProducts.length === 0) {
      alert("⚠️ Please select at least one product.");
      return;
    }

    try {
      const url = editData
        ? `/api/productview/${editData._id}`
        : "/api/productview";
      const method = editData ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: selectedSub,
          products: selectedProducts.map((p) => p.value),
          status: editData?.status || "active",
        }),
      });

      const data = await res.json();

      if (data.success) {
        alert("✅ Saved successfully!");
        setShowModal(false);
        setEditData(null);
        fetchProductViews(); // 🔄 refresh list
      } else {
        alert("❌ Failed: " + (data.message || "Unknown error"));
      }
    } catch (err) {
      console.error("❌ Error saving products:", err);
      alert("Something went wrong while saving.");
    }
  };

  // ✅ Build product options
  const productOptions = [
    { value: "all", label: "🟢 Select All Products" },
    ...products.map((prod) => ({
      value: prod._id,
      label: `${prod.name} (₹${prod.price})`,
    })),
  ];

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">📦 ProductView Manager</h2>
        <button
          onClick={handleAddClick}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          ➕ Add ProductView
        </button>
      </div>

      {/* 🔹 Table of all records */}
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="border-b p-3 text-left font-medium text-gray-700">#</th>
              <th className="border-b p-3 text-left font-medium text-gray-700">Category</th>
              <th className="border-b p-3 text-left font-medium text-gray-700">Products</th>
              <th className="border-b p-3 text-left font-medium text-gray-700">Status</th>
              <th className="border-b p-3 text-left font-medium text-gray-700">Action</th>
            </tr>
          </thead>
          <tbody>
            {productViews.map((pv, idx) => (
              <tr key={pv._id} className="hover:bg-gray-50">
                <td className="border-b p-3">{idx + 1}</td>
                <td className="border-b p-3">
                  {pv.category?.category_name || "—"}
                </td>
                <td className="border-b p-3">
                  {pv.products?.slice(0, 3).map((p) => p.name).join(", ")}
                  {pv.products?.length > 3 && "..."}
                </td>
                <td className="border-b p-3">
                  <span className={`px-2 py-1 rounded-full text-xs ${pv.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {pv.status}
                  </span>
                </td>
                <td className="border-b p-3">
                  <button
                    onClick={() => handleEditClick(pv._id)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition-colors"
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}

            {productViews.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center p-6 text-gray-500">
                  No records found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 🔹 Edit / Add Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4 text-gray-800">
              {editData ? "✏️ Edit ProductView" : "➕ Add ProductView"}
            </h2>

            {/* Sub Category Selection */}
            <div className="mb-4">
              <label className="block font-medium mb-1 text-gray-700">
                Select Sub Category
              </label>
              <select
                value={selectedSub}
                onChange={(e) => handleSubChange(e.target.value)}
                className="border px-3 py-2 rounded w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">-- Choose Sub Category --</option>
                {Object.keys(groupedCategories).map((parent) => (
                  <optgroup key={parent} label={parent}>
                    {groupedCategories[parent].map((sub) => (
                      <option key={sub._id} value={sub._id}>
                        {sub.category_name}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>

            {/* Product Selection */}
            {loading && <p className="text-blue-600 mb-4">⏳ Loading products...</p>}
            {products.length > 0 && (
              <div className="mb-4">
                <label className="block font-medium mb-1 text-gray-700">Select Products</label>
                <Select
                  isMulti
                  options={productOptions}
                  value={selectedProducts}
                  onChange={handleProductChange}
                  className="react-select-container"
                  classNamePrefix="react-select"
                  isLoading={loading}
                />
                <p className="text-sm text-gray-500 mt-1">
                  {selectedProducts.length} product(s) selected
                </p>
              </div>
            )}

            {/* Status */}
            <div className="mb-6">
              <label className="block font-medium mb-1 text-gray-700">Status</label>
              <select
                value={editData?.status || "active"}
                onChange={(e) => {
                  if (editData) {
                    setEditData({ ...editData, status: e.target.value });
                  } else {
                    setEditData({ status: e.target.value });
                  }
                }}
                className="border px-3 py-2 rounded w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditData(null);
                }}
                className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .react-select-container :global(.react-select__control) {
          border: 1px solid #d1d5db;
          border-radius: 0.375rem;
          min-height: 42px;
        }
        .react-select-container :global(.react-select__control--is-focused) {
          border-color: #3b82f6;
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
        }
        .react-select-container :global(.react-select__menu) {
          z-index: 10;
        }
      `}</style>
    </div>
  );
}