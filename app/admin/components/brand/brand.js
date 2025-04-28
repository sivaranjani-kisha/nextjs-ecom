"use client";

import React, { useEffect, useState } from "react";
import { FaPlus, FaMinus } from "react-icons/fa";
import ReactPaginate from "react-paginate";

export default function brandComponent() {
  const [brand, setBrand] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [newBrand, setNewBrand] = useState({
    brand_name: "",
    status: "Active",
    image: null,
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [brandToDelete, setBrandToDelete] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false); // State for success modal
  const [successMessage, setSuccessMessage] = useState(""); // State for success message

  // Pagination state
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 5; // 5 records per page

  // Fetch categories from API
  const fetchBrand = async () => {
    try {
      const response = await fetch("/api/brand");
      const data = await response.json();
      setBrand(data.data);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching brand:", error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBrand();
  }, []);

  // Handle page change
  const handlePageClick = ({ selected }) => {
    setCurrentPage(selected);
  };



  // Handle input change
  const handleInputChange = (e) => {
    setNewBrand({ ...newBrand, [e.target.name]: e.target.value });
  };

  // Handle image upload
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewBrand((prev) => ({ ...prev, image: file }));
      setImagePreview(URL.createObjectURL(file)); // Preview the image
    }
  };

  // Handle category submission
  const handleAddBrand = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("brand_name", newBrand.brand_name);
    formData.append("status", newBrand.status);
    if (newBrand.image) {
      formData.append("image", newBrand.image);
    }

    try {
      const response = await fetch("/api/brand/add", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      if (response.ok) {
        setIsModalOpen(false);
        fetchBrand(); // Refresh the list

        // Reset form
        setNewBrand({
          brand_name: "",
          status: "Active",
          image: null,
        });
        setImagePreview(null);
      } else {
        console.error("Error adding brand:", result.error);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  // Handle category deletion
  const handleDeleteBrand = async (brandId) => {
    try {
      const response = await fetch("/api/brand/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brandId }),
      });

      const result = await response.json();
      if (response.ok) {
        setSuccessMessage("Brand Deleted Successfully"); // Set success message
        setShowSuccessModal(true); // Show success modal
        fetchBrand(); // Refresh the list
      } else {
        console.error("Error:", result.error);
        alert("Failed to delete category.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred.");
    } finally {
      setShowConfirmationModal(false); // Close confirmation modal
      setBrandToDelete(null); // Reset category to delete
    }
  };

  const flattenCategories = (brand, parentId = "none", level = 0, result = []) => {
    brand.forEach((category) => {
        result.push({ ...category, level });
      });
    return result;
  };

  // Render category rows with pagination
  const renderBrandRows = () => {
    console.log(flattenCategories(brand));
    const flattenedCategories = flattenCategories(brand);
    const filteredCategories = flattenedCategories.filter((brand) =>
      brand.brand_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      brand.brand_slug.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return filteredCategories
      .slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage)
      .map((brand, index) => (
        <tr key={brand._id} className="text-center border-b">
           <td className="p-2">{brand.brand_name}</td>
          <td className="p-2">{brand.brand_slug}</td>
          <td className="p-2">
            {brand.image ? (
              <img src={`/uploads/brands/${brand.image}`} alt="brand" className="h-10 mx-auto" />
            ) : (
              "No Image"
            )}
          </td>
          <td className="p-2 font-semibold">
            {brand.status === "Active" ? (
              <span className="text-green-500">Active</span>
            ) : (
              <span className="text-red-500">Inactive</span>
            )}
          </td>
          <td className="p-2 font-semibold">
            <button
              onClick={() => {
                setBrandToDelete(brand._id);
                setShowConfirmationModal(true);
              }}
              className="bg-red-500 text-white px-3 py-1 rounded"
            >
              Delete
            </button>
          </td>
        </tr>
      ));
  };

  const flattenedCategories = flattenCategories(brand);
  const filteredCategories = flattenedCategories.filter((brand) =>
    brand.brand_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    brand.brand_slug.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const pageCount = Math.ceil(filteredCategories.length / itemsPerPage);

  return (
    <div className="container mx-auto">
      <div className="flex justify-between items-center mb-1">
        <h2 className="text-2xl font-bold">Brand List</h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded-md"
        >
          + Add brand
        </button>
      </div>

      {/* Search Box */}
      <div className="flex justify-start mb-5">
        <input
          type="text"
          placeholder="Search Brand..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="border px-3 py-2 rounded-md w-64"
        />
      </div>

      {isLoading ? (
        <p>Loading Brands...</p>
      ) : (
        <div className="bg-white shadow-md rounded-lg p-5 overflow-x-auto">
          <table className="w-full border border-gray-300">
            <thead>
              <tr className="bg-gray-200">
                <th className="p-2">brand Name</th>
                <th className="p-2">brand Slug</th>
                <th className="p-2">Image</th>
                <th className="p-2">Status</th>
                <th className="p-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredCategories.length > 0 ? (
                renderBrandRows()
              ) : (
                <tr>
                  <td colSpan="6" className="text-center p-4">
                    No categories found
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Pagination */}
          <ReactPaginate
            previousLabel={"Previous"}
            nextLabel={"Next"}
            breakLabel={"..."}
            pageCount={pageCount}
            marginPagesDisplayed={2}
            pageRangeDisplayed={5}
            onPageChange={handlePageClick}
            containerClassName={"pagination flex justify-center mt-4"}
            activeClassName={"active"}
            pageClassName={"page-item"}
            pageLinkClassName={"page-link px-3 py-2 border rounded mx-1"}
            previousClassName={"page-item"}
            nextClassName={"page-item"}
            previousLinkClassName={"page-link px-3 py-2 border rounded mx-1"}
            nextLinkClassName={"page-link px-3 py-2 border rounded mx-1"}
            breakClassName={"page-item"}
            breakLinkClassName={"page-link px-3 py-2 border rounded mx-1"}
          />
        </div>
      )}

      {/* Modal for Adding Category */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-5 rounded-lg w-96 relative">
            <h2 className="text-lg font-bold text-center">Add 
              Brand
            </h2>
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-3 right-3 text-red-500 text-xl"
            >
              ×
            </button>
            <form onSubmit={handleAddBrand} className="mt-4">
              <input
                name="brand_name"
                value={newBrand.brand_name}
                onChange={handleInputChange}
                className="w-full border p-2 mb-2 rounded"
                placeholder="Brand Name"
                required
              />

              <input
                type="file"
                onChange={handleImageChange}
                className="w-full border p-2 mb-2"
              />
              {imagePreview && <img src={imagePreview} alt="Preview" className="h-16 mx-auto" />}

              <select
                name="status"
                value={newBrand.status}
                onChange={handleInputChange}
                className="w-full border p-2 mb-2 rounded"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>

              <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded w-full mt-2">
                Add Brand
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmationModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-xl font-bold mb-4">Delete Brand</h2>
            <p className="mb-4">Are you sure you want to delete this Brand?</p>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowConfirmationModal(false)}
                className="bg-gray-300 px-4 py-2 rounded-md"
              >
                No, Close
              </button>
              <button
                onClick={() => handleDeleteBrand(brandToDelete)}
                className="bg-red-500 px-4 py-2 rounded-md text-white"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-xl font-bold mb-4">Success</h2>
            <p className="mb-4">{successMessage}</p>

            <div className="flex justify-end">
              <button
                onClick={() => setShowSuccessModal(false)}
                className="bg-blue-500 px-4 py-2 rounded-md text-white"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}