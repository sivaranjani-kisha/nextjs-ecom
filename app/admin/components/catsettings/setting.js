"use client";
import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function CategoryBannerPage() {
  const [banners, setBanners] = useState([]);
  const [categories, setCategories] = useState([]);
  const [newBanner, setNewBanner] = useState({
    banner_image: null,
    category_id: "",
    status: "Active",
  });
  const [error, setError] = useState("");
  const [imageError, setImageError] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [bannerToDelete, setBannerToDelete] = useState(null);
  const [editingStates, setEditingStates] = useState({});
  const [loading, setLoading] = useState(true);

  // Fetch banners and categories
  const fetchData = async () => {
    try {
      setLoading(true);
      const [bannersRes, categoriesRes] = await Promise.all([
        fetch("/api/catbanner"),
        fetch("/api/categories/active")
      ]);
      
      const bannersData = await bannersRes.json();
      const categoriesData = await categoriesRes.json();
      
      if (bannersData.success) {
        setBanners(bannersData.banners);
        // Initialize editing states
        const states = {};
        bannersData.banners.forEach((banner) => {
          states[banner._id] = {
            category_id: banner.category?._id || "",
            status: banner.status || "Active",
            banner_image: null,
            hasChanges: false,
            error: "",
          };
        });
        setEditingStates(states);
      }
      
      if (categoriesData.success) {
        setCategories(categoriesData.categories);
      }
    } catch (err) {
      setError("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Get available categories (not used in existing banners)
  const getAvailableCategories = () => {
    const usedCategoryIds = banners.map(banner => banner.category?._id);
    return categories.filter(category => !usedCategoryIds.includes(category._id));
  };

  // Save new banner
  const handleSave = async () => {
    setError("");
    setImageError("");

    if (!newBanner.banner_image) {
      setImageError("Please choose an image.");
      return;
    }
    if (!newBanner.category_id) {
      setError("Category is required.");
      return;
    }

    const formData = new FormData();
    formData.append("banner_image", newBanner.banner_image);
    formData.append("category_id", newBanner.category_id);
    formData.append("status", newBanner.status);

    try {
      const res = await fetch("/api/catbanner", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        setNewBanner({ banner_image: null, category_id: "", status: "Active" });
        setShowAddForm(false);
        fetchData();
      } else {
        if (data.message.includes("1920x550")) {
          setImageError(data.message);
        } else {
          setError(data.message || "Something went wrong.");
        }
      }
    } catch (err) {
      setError("Failed to save banner");
    }
  };

  // Update banner
  const handleUpdate = async (id, field, value) => {
    setError("");
    setImageError("");

    const formData = new FormData();
    formData.append("id", id);

    if (field === "banner_image") {
      formData.append("banner_image", value);
    } else if (field === "category_id") {
      formData.append("category_id", value);
    } else if (field === "status") {
      formData.append("status", value);
    }

    try {
      const res = await fetch("/api/catbanner", {
        method: "PUT",
        body: formData,
      });
      const data = await res.json();

      if (data.success) {
        // Reset editing state
        setEditingStates((prev) => ({
          ...prev,
          [id]: {
            ...prev[id],
            [field]: field === "banner_image" ? null : value,
            hasChanges: false,
            error: "",
          },
        }));
        fetchData();
      } else {
        if (data.message.includes("1920x550")) {
          setEditingStates((prev) => ({
            ...prev,
            [id]: {
              ...prev[id],
              error: data.message,
            },
          }));
        } else {
          setError(data.message || "Update failed.");
        }
      }
    } catch (err) {
      setError("Failed to update banner");
    }
  };

  // Handle input changes for existing banners
  const handleInputChange = (id, field, value) => {
    setEditingStates((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value,
        hasChanges: true,
        error: "",
      },
    }));
  };

  // Delete banner
  const handleDelete = async () => {
    if (!bannerToDelete) return;

    try {
      await fetch("/api/catbanner", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: bannerToDelete._id }),
      });
      fetchData();
      closeDeleteModal();
    } catch (err) {
      setError("Failed to delete banner");
      closeDeleteModal();
    }
  };

  const openDeleteModal = (banner) => {
    setBannerToDelete(banner);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setBannerToDelete(null);
  };

  if (loading) {
    return (
      <div className="container mx-auto flex justify-center items-center h-64">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto">
      <div className="flex justify-between items-center mb-5 mt-5">
        <h2 className="text-2xl font-bold">Category Banner Manager</h2>
        <Link
          href="/admin/homesettings"
          className="flex items-center gap-2 bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-800 transition"
        >
          <ArrowLeft size={18} /> Back
        </Link>
      </div>

      <div className="bg-white shadow-md rounded-lg p-5 overflow-x-auto">
        {error && <p className="text-red-500 mb-4">{error}</p>}

        {/* Add New Banner */}
        <div className="mb-6">
          {!showAddForm ? (
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-green-600 text-white px-4 py-2 rounded"
              disabled={getAvailableCategories().length === 0}
            >
              + Add New Banner
            </button>
          ) : (
            <div className="border p-4 rounded-lg space-y-3">
              <h3 className="font-medium text-lg">Add New Banner</h3>

              <div>
                <input
                  type="file"
                  onChange={(e) =>
                    setNewBanner({ ...newBanner, banner_image: e.target.files[0] })
                  }
                  className="border px-2 py-1 rounded w-full"
                />
                {imageError && <p className="text-red-500 text-sm mt-1">{imageError}</p>}
              </div>

              <div>
                <select
                  value={newBanner.category_id}
                  onChange={(e) =>
                    setNewBanner({ ...newBanner, category_id: e.target.value })
                  }
                  className="border px-2 py-1 rounded w-full"
                >
                  <option value="">Select Category</option>
                  {getAvailableCategories().map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.category_name}
                    </option>
                  ))}
                </select>
                {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
              </div>

              <select
                value={newBanner.status}
                onChange={(e) =>
                  setNewBanner({ ...newBanner, status: e.target.value })
                }
                className="border px-2 py-1 rounded w-full"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>

              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  className="bg-blue-600 text-white px-4 py-2 rounded"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setNewBanner({ banner_image: null, category_id: "", status: "Active" });
                    setShowAddForm(false);
                  }}
                  className="bg-gray-500 text-white px-4 py-2 rounded"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Existing Banners */}
        <div className="space-y-4">
          {banners.map((banner) => (
            <div
              key={banner._id}
              className="flex flex-col md:flex-row items-center gap-4 border p-4 rounded-lg"
            >
              <img
                src={banner.banner_image}
                alt="banner"
                className="w-48 h-20 object-cover rounded"
              />

              {/* Category Info */}
              <div className="flex flex-col">
                <span className="font-semibold">{banner.category?.category_name}</span>
                <span className="text-sm text-gray-500">{banner.category?.category_slug}</span>
              </div>

              {/* Category Selection */}
              <div className="flex flex-col md:flex-row gap-2 items-center flex-grow">
                <select
                  value={editingStates[banner._id]?.category_id || ""}
                  onChange={(e) =>
                    handleInputChange(banner._id, "category_id", e.target.value)
                  }
                  className="border px-2 py-1 rounded flex-grow"
                >
                  <option value={banner.category?._id}>
                    {banner.category?.category_name}
                  </option>
                  {categories
                    .filter(cat => cat._id !== banner.category?._id)
                    .map((category) => (
                      <option key={category._id} value={category._id}>
                        {category.category_name}
                      </option>
                    ))}
                </select>
                <button
                  onClick={() =>
                    handleUpdate(banner._id, "category_id", editingStates[banner._id]?.category_id)
                  }
                  disabled={!editingStates[banner._id]?.hasChanges}
                  className={`p-2 rounded ${
                    editingStates[banner._id]?.hasChanges
                      ? "bg-blue-500 text-white"
                      : "bg-gray-300 text-gray-500"
                  }`}
                >
                  ✔
                </button>
              </div>

              {/* Status */}
              <div className="flex flex-col md:flex-row gap-2 items-center">
                <select
                  value={editingStates[banner._id]?.status || "Active"}
                  onChange={(e) =>
                    handleInputChange(banner._id, "status", e.target.value)
                  }
                  className="border px-2 py-1 rounded"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
                <button
                  onClick={() =>
                    handleUpdate(banner._id, "status", editingStates[banner._id]?.status)
                  }
                  disabled={!editingStates[banner._id]?.hasChanges}
                  className={`p-2 rounded ${
                    editingStates[banner._id]?.hasChanges
                      ? "bg-blue-500 text-white"
                      : "bg-gray-300 text-gray-500"
                  }`}
                >
                  ✔
                </button>
              </div>

              {/* Update Image */}
              <div className="flex flex-col md:flex-row gap-2 items-center">
                <div className="flex flex-col">
                  <input
                    type="file"
                    onChange={(e) => {
                      if (e.target.files[0]) {
                        handleInputChange(banner._id, "banner_image", e.target.files[0]);
                      }
                    }}
                    className="border rounded w-40 text-sm px-2 py-1"
                  />
                  {editingStates[banner._id]?.error && (
                    <p className="text-red-500 text-sm mt-1">
                      {editingStates[banner._id].error}
                    </p>
                  )}
                </div>

                <button
                  onClick={() =>
                    handleUpdate(banner._id, "banner_image", editingStates[banner._id]?.banner_image)
                  }
                  disabled={!editingStates[banner._id]?.banner_image}
                  className={`p-2 rounded ${
                    editingStates[banner._id]?.banner_image
                      ? "bg-blue-500 text-white"
                      : "bg-gray-300 text-gray-500"
                  }`}
                >
                  ✔
                </button>
              </div>

              {/* Delete */}
              <button
                onClick={() => openDeleteModal(banner)}
                className="bg-red-500 text-white p-2 rounded"
              >
                🗑
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-96">
            <h3 className="text-xl font-semibold mb-4">Confirm Delete</h3>
            <p className="mb-6">Are you sure you want to delete this banner?</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={closeDeleteModal}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="bg-red-600 text-white px-4 py-2 rounded"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}