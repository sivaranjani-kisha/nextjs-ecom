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
      const res = await fetch(`/api/product/view?category=${subId}`);
      const data = await res.json();

      if (data.success) {
        setProducts(data.products || []);
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

  // ✅ Open Edit Modal
  const handleEditClick = async (id) => {
    try {
      const res = await fetch(`/api/productview/${id}`);
      const data = await res.json();

      if (data.success) {
        setEditData(data.data);
        setSelectedSub(data.data.category?._id || "");
        setSelectedProducts(
          (data.data.products || []).map((p) => ({
            value: p._id,
            label: `${p.name} (₹${p.price})`,
          }))
        );
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
        : "/api/productview/add";
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
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">📦 ProductView Manager</h2>
        <button
          onClick={handleAddClick}
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          ➕ Add ProductView
        </button>
      </div>

      {/* 🔹 Table of all records */}
      <table className="w-full border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-3 py-2">#</th>
            <th className="border px-3 py-2">Category</th>
            <th className="border px-3 py-2">Products</th>
            <th className="border px-3 py-2">Status</th>
            <th className="border px-3 py-2">Action</th>
          </tr>
        </thead>
        <tbody>
          {productViews.map((pv, idx) => (
            <tr key={pv._id}>
              <td className="border px-3 py-2">{idx + 1}</td>
              <td className="border px-3 py-2">
                {pv.category?.category_name || "—"}
              </td>
              <td className="border px-3 py-2">
                {pv.products?.map((p) => p.name).join(", ")}
              </td>
              <td className="border px-3 py-2">{pv.status}</td>
              <td className="border px-3 py-2">
                <button
                  onClick={() => handleEditClick(pv._id)}
                  className="bg-blue-600 text-white px-3 py-1 rounded"
                >
                  Edit
                </button>
              </td>
            </tr>
          ))}

          {productViews.length === 0 && (
            <tr>
              <td colSpan={5} className="text-center py-3 text-gray-500">
                No records found
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* 🔹 Edit / Add Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-2xl">
            <h2 className="text-xl font-bold mb-4">
              {editData ? "✏️ Edit ProductView" : "➕ Add ProductView"}
            </h2>

            {/* Sub Category Selection */}
            <div className="mb-4">
              <label className="block font-medium mb-1">
                Select Sub Category
              </label>
              <select
                value={selectedSub}
                onChange={(e) => handleSubChange(e.target.value)}
                className="border px-3 py-2 rounded w-full"
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
            {loading && <p className="text-blue-600">⏳ Loading products...</p>}
            {products.length > 0 && (
              <div className="mb-4">
                <label className="block font-medium mb-1">Select Products</label>
                <Select
                  isMulti
                  options={productOptions}
                  value={selectedProducts}
                  onChange={handleProductChange}
                />
              </div>
            )}

            {/* Status */}
            <div className="mb-4">
              <label className="block font-medium mb-1">Status</label>
              <select
                value={editData?.status || "active"}
                onChange={(e) =>
                  setEditData({ ...editData, status: e.target.value })
                }
                className="border px-3 py-2 rounded w-full"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditData(null);
                }}
                className="bg-gray-400 text-white px-4 py-2 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="bg-green-600 text-white px-4 py-2 rounded"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
