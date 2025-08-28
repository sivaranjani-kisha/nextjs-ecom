"use client";
import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function SingleBannerPage() {
  const [banner, setBanner] = useState(null);
  const [newBanner, setNewBanner] = useState({
    banner_image: null,
    redirect_url: "",
    status: "Active",
  });
  const [error, setError] = useState("");
  const [imageError, setImageError] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingStates, setEditingStates] = useState({
    redirect_url: "",
    status: "Active",
    banner_image: null,
    hasChanges: false,
    error: "",
  });

  // Fetch single banner
  const fetchBanner = async () => {
    try {
      const res = await fetch("/api/singlebanner-two");
      const data = await res.json();
      console.log("API Response:", data);

      if (data.success) {
        if (data.banners && data.banners.length > 0) {
          // If we have a banner, set it and hide the add form
          setBanner(data.banners[0]);
          setShowAddForm(false);
          
          // Set editing states
          setEditingStates({
            redirect_url: data.banners[0].redirect_url || "",
            status: data.banners[0].status || "Active",
            banner_image: null,
            hasChanges: false,
            error: "",
          });
        } else {
          // If no banner exists, show the add form
          setBanner(null);
          setShowAddForm(true);
        }
      }
    } catch (err) {
      setError("Failed to fetch banner");
    }
  };

  useEffect(() => {
    fetchBanner();
  }, []);

  // Save (create/replace single)
  const handleSave = async () => {
    setError("");
    setImageError("");

    if (!newBanner.banner_image) {
      setImageError("Please choose an image (1900x400).");
      return;
    }
    if (!newBanner.redirect_url) {
      setError("Redirect URL is required.");
      return;
    }

    const formData = new FormData();
    formData.append("banner_image", newBanner.banner_image);
    formData.append("redirect_url", newBanner.redirect_url);
    formData.append("status", newBanner.status);

    try {
      const res = await fetch("/api/singlebanner-two", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        setNewBanner({ banner_image: null, redirect_url: "", status: "Active" });
        fetchBanner(); // Refresh the banner
      } else {
        if (data.message.includes("1900x400")) {
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
  const handleUpdate = async (field, value) => {
    if (!banner) return;
    
    setError("");
    setImageError("");

    const formData = new FormData();
    formData.append("id", banner._id);

    if (field === "banner_image") {
      formData.append("banner_image", value);
    } else if (field === "redirect_url") {
      formData.append("redirect_url", value);
    } else if (field === "status") {
      formData.append("status", value);
    }

    try {
      const res = await fetch("/api/singlebanner-two", {
        method: "PUT",
        body: formData,
      });
      const data = await res.json();

      if (data.success) {
        setEditingStates(prev => ({
          ...prev,
          [field]: field === "banner_image" ? null : value,
          hasChanges: false,
          error: "",
        }));
        fetchBanner(); // Refresh the banner
      } else {
        if (data.message.includes("1900x400")) {
          setEditingStates(prev => ({
            ...prev,
            error: data.message,
          }));
        } else {
          setError(data.message || "Update failed.");
        }
      }
    } catch (err) {
      setError("Failed to update banner");
    }
  };

  // Handle input changes
  const handleInputChange = (field, value) => {
    setEditingStates(prev => ({
      ...prev,
      [field]: value,
      hasChanges: true,
      error: "",
    }));
  };

  // Delete banner
  const handleDelete = async () => {
    if (!banner) return;

    try {
      await fetch("/api/singlebanner-two", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: banner._id }),
      });
      fetchBanner(); // Refresh the banner
      closeDeleteModal();
    } catch (err) {
      setError("Failed to delete banner");
      closeDeleteModal();
    }
  };

  const openDeleteModal = () => {
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
  };

  return (
    <div className="container mx-auto">
      <div className="flex justify-between items-center mb-5 mt-5">
        <h2 className="text-2xl font-bold">Single Banner Manager</h2>
        <Link
          href="/admin/homesettings"
          className="flex items-center gap-2 bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-800 transition"
        >
          <ArrowLeft size={18} /> Back
        </Link>
      </div>

      <div className="bg-white shadow-md rounded-lg p-5 overflow-x-auto">
        {error && <p className="text-red-500 mb-4">{error}</p>}

        {/* Add New (create/replace) - Only show if no banner exists */}
        {!banner && (
          <div className="mb-6">
            {!showAddForm ? (
              <button
                onClick={() => setShowAddForm(true)}
                className="bg-green-600 text-white px-4 py-2 rounded"
              >
                + Add New Banner
              </button>
            ) : (
              <div className="border p-4 rounded-lg space-y-3">
                <h3 className="font-medium text-lg">Add Banner</h3>

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
                  <input
                    type="text"
                    placeholder="Redirect URL"
                    value={newBanner.redirect_url}
                    onChange={(e) =>
                      setNewBanner({ ...newBanner, redirect_url: e.target.value })
                    }
                    className="border px-2 py-1 rounded w-full"
                  />
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
                      setNewBanner({ banner_image: null, redirect_url: "", status: "Active" });
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
        )}

        {/* Existing Banner */}
        {banner && (
          <div className="flex flex-col md:flex-row items-center gap-4 border p-4 rounded-lg">
            <img
              src={banner.banner_image}
              alt="banner"
              className="w-48 h-20 object-cover rounded"
            />

            {/* URL */}
            <div className="flex flex-col md:flex-row gap-2 items-center flex-grow">
              <input
                type="text"
                value={editingStates.redirect_url || ""}
                onChange={(e) =>
                  handleInputChange("redirect_url", e.target.value)
                }
                className="border px-2 py-1 rounded flex-grow"
              />
              <button
                onClick={() =>
                  handleUpdate("redirect_url", editingStates.redirect_url)
                }
                disabled={!editingStates.hasChanges}
                className={`p-2 rounded ${
                  editingStates.hasChanges
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
                value={editingStates.status || "Active"}
                onChange={(e) =>
                  handleInputChange("status", e.target.value)
                }
                className="border px-2 py-1 rounded"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
              <button
                onClick={() =>
                  handleUpdate("status", editingStates.status)
                }
                disabled={!editingStates.hasChanges}
                className={`p-2 rounded ${
                  editingStates.hasChanges
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
                      handleInputChange("banner_image", e.target.files[0]);
                    }
                  }}
                  className="border rounded w-40 text-sm px-2 py-1"
                />
                {editingStates.error && (
                  <p className="text-red-500 text-sm mt-1">
                    {editingStates.error}
                  </p>
                )}
              </div>

              <button
                onClick={() =>
                  handleUpdate("banner_image", editingStates.banner_image)
                }
                disabled={!editingStates.banner_image}
                className={`p-2 rounded ${
                  editingStates.banner_image
                    ? "bg-blue-500 text-white"
                    : "bg-gray-300 text-gray-500"
                }`}
              >
                ✔
              </button>
            </div>

            {/* Delete */}
            <button
              onClick={openDeleteModal}
              className="bg-red-500 text-white p-2 rounded"
            >
              🗑
            </button>
          </div>
        )}
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