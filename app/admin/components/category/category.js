"use client";

import React, { useEffect, useState } from "react";
import { FaPlus, FaMinus } from "react-icons/fa";
import ReactPaginate from "react-paginate";

export default function CategoryComponent() {
  const [categories, setCategories] = useState([]);
  const [expandedCategories, setExpandedCategories] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [newCategory, setNewCategory] = useState({
    category_name: "",
    parentid: "none",
    status: "Active",
    image: null,
    //show_on_home: "No"
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [alertMessage, setAlertMessage] = useState(""); // State for alert message
  const [showAlert, setShowAlert] = useState(false); // State to control alert visibility

  // Pagination state
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 5; // 5 records per page

  // Fetch categories from API
  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/categories/get");
      const data = await response.json();
      setCategories(data);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching categories:", error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Handle page change
  const handlePageClick = ({ selected }) => {
    setCurrentPage(selected);
  };

  // Toggle subcategories
  const toggleCategory = (categoryId) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));
  };

  // Handle input change
  const handleInputChange = (e) => {
    setNewCategory({ ...newCategory, [e.target.name]: e.target.value });
  };

  // Handle image upload
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewCategory((prev) => ({ ...prev, image: file }));
      setImagePreview(URL.createObjectURL(file)); // Preview the image
    }
  };

  // Check if category name already exists
  const isCategoryNameExists = (categoryName) => {
    return categories.some(
      (category) => category.category_name.toLowerCase() === categoryName.toLowerCase()
    );
  };

  // Handle category submission
  const handleAddCategory = async (e) => {
    e.preventDefault();

    // Check if category name already exists
    if (isCategoryNameExists(newCategory.category_name)) {
      setAlertMessage("Category name already exists!");
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 3000); // Hide alert after 3 seconds
      return; // Stop further execution
    }

    const formData = new FormData();
    formData.append("category_name", newCategory.category_name);
    formData.append("parentid", newCategory.parentid);
    formData.append("status", newCategory.status);
    //formData.append("show_on_home", newCategory.show_on_home);
    if (newCategory.image) {
      formData.append("image", newCategory.image);
    }

    try {
      const response = await fetch("/api/categories/add", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      if (response.ok) {
        setIsModalOpen(false);
        fetchCategories(); // Refresh the list

        // Reset form
        setNewCategory({
          category_name: "",
          parentid: "none",
          status: "Active",
         // show_on_home:"No",
          image: null,
        });
        setImagePreview(null);

        // Show success alert
        setAlertMessage("Category added successfully!");
        setShowAlert(true);
        setTimeout(() => setShowAlert(false), 3000); // Hide alert after 3 seconds
      } else {
        console.error("Error adding category:", result.error);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  // Handle category deletion
  const handleDeleteCategory = async (categoryId) => {
    try {
      const response = await fetch("/api/categories/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categoryId }),
      });

      const result = await response.json();
      if (response.ok) {
        fetchCategories(); // Refresh the list

        // Show success alert
        setAlertMessage("Category deleted successfully!");
        setShowAlert(true);
        setTimeout(() => setShowAlert(false), 3000); // Hide alert after 3 seconds
      } else {
        console.error("Error:", result.error);
        alert("Failed to delete category.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred.");
    } finally {
      setShowConfirmationModal(false); // Close confirmation modal
      setCategoryToDelete(null); // Reset category to delete
    }
  };

  // Build category tree
  const buildCategoryTree = (categories, parentId = "none") => {
    return categories
      .filter((category) => category.parentid === parentId)
      .map((category) => ({
        ...category,
        children: buildCategoryTree(categories, category._id),
      }));
  };

  // Flatten category tree for pagination
  const flattenCategories = (categories, parentId = "none", level = 0, result = []) => {
    categories
      .filter((category) => category.parentid === parentId)
      .forEach((category) => {
        result.push({ ...category, level });
        if (expandedCategories[category._id]) {
          flattenCategories(categories, category._id, level + 1, result);
        }
      });
    return result;
  };

  // Render category tree for dropdown
  const renderCategoryTree = (categories, level = 0) => {
    return categories.map((category) => (
      <div key={category._id} className="ml-4">
        <div
           className={`p-2 cursor-pointer ${
            newCategory.parentid === category._id ? "text-blue-500 font-semibold" : "text-black"
          }`}
          onClick={() => setNewCategory({ ...newCategory, parentid: category._id })}
        >
          {category.children.length > 0 && (
            <button type="button"
              onClick={(e) => {
                e.stopPropagation();
                toggleCategory(category._id);
              }}
              className="mr-2 text-blue-500"
            >
              {expandedCategories[category._id] ? <FaMinus /> : <FaPlus />}
            </button>
          )}
          <span className={`font-semibold ${newCategory.parentid === category.category_name ? "text-blue-500" : ""}`}>
            {category.category_name}
          </span>
        </div>
        {expandedCategories[category._id] && renderCategoryTree(category.children, level + 1)}
      </div>
    ));
  };
  const getParentCategoryName = (parentId) => {
    if (parentId === "none") return "No Parent";
    const parentCategory = categories.find((category) => category._id === parentId);
    return parentCategory ? parentCategory.category_name : "Unknown";
  };
  // Render category rows with pagination
  const renderCategoryRows = () => {
    const flattenedCategories = flattenCategories(categories);
    const filteredCategories = flattenedCategories.filter((category) =>
      category.category_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      category.category_slug.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return filteredCategories
      .slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage)
      .map((category, index) => (
        <tr key={category._id} className="text-center border-b">
          <td className="p-2 font-bold flex items-center">
            {categories.some((cat) => cat.parentid === category._id) && (
              <button type="button"
                onClick={() => toggleCategory(category._id)}
                className="mr-2 text-blue-500"
              >
                {expandedCategories[category.category_name] ? <FaMinus /> : <FaPlus />}
              </button>
            )}
            <span style={{ paddingLeft: `${category.level * 20}px` }}>{category.category_name}</span>
          </td>
          <td className="p-2">{category.category_slug}</td>
          <td className="p-2">{getParentCategoryName(category.parentid)}</td>
          <td className="p-2">
            {category.image ? (
              <img src={`${category.image}`} alt="Category" className="h-10 mx-auto" />
            ) : (
              "No Image"
            )}
          </td>
          <td className="p-2 font-semibold">
            {category.status === "Active" ? (
              <span className="text-green-500">Active</span>
            ) : (
              <span className="text-red-500">Inactive</span>
            )}
          </td>
          <td className="p-2 font-semibold">
            <button
              onClick={() => {
                setCategoryToDelete(category._id);
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

  // Calculate page count based on filtered and flattened categories
  const flattenedCategories = flattenCategories(categories);
  const filteredCategories = flattenedCategories.filter((category) =>
    category.category_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    category.category_slug.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const pageCount = Math.ceil(filteredCategories.length / itemsPerPage);

  return (
    <div className="container mx-auto ">
      {/* Alert Message */}
      {showAlert && (
        <div className="bg-green-500 text-white px-4 py-2 rounded-md mb-4">
          {alertMessage}
        </div>
      )}

      <div className="flex justify-between items-center mb-1 ">
        <h2 className="text-2xl font-bold">Category List</h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded-md"
        >
          + Add Category
        </button>
      </div>

      {/* Search Box */}
      <div className="flex justify-start mb-5">
        <input
          type="text"
          placeholder="Search Category..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="border px-3 py-2 rounded-md w-64"
        />
      </div>

      {isLoading ? (
        <p>Loading categories...</p>
      ) : (
        <div className="bg-white shadow-md rounded-lg p-5 overflow-x-auto">
          <table className="w-full border border-gray-300">
            <thead>
              <tr className="bg-gray-200">
                <th className="p-2">Category Name</th>
                <th className="p-2">Category Slug</th>
                <th className="p-2">Parent</th>
                <th className="p-2">Image</th>
                <th className="p-2">Status</th>
                <th className="p-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredCategories.length > 0 ? (
                renderCategoryRows()
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
          <div className="bg-white p-5 rounded-lg w-96 relative max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold text-center">Add Category</h2>
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-3 right-3 text-red-500 text-xl"
            >
              ×
            </button>
            <form onSubmit={handleAddCategory} className="mt-4">
              <input
                name="category_name"
                value={newCategory._id}
                onChange={handleInputChange}
                className="w-full border p-2 mb-2 rounded"
                placeholder="Category Name"
                required
              />

              {/* Category Selection Tree */}
              <div className="border p-2 mb-2 rounded max-h-40 overflow-y-auto">
                <div>
                  <div
                    className={`p-2 cursor-pointer font-semibold ${newCategory.parentid === "none" ? "text-blue-500" : ""}`}
                    onClick={() => setNewCategory({ ...newCategory, parentid: "none" })}
                  >
                    <span className="text-black">Category</span>
                  </div>
                  {renderCategoryTree(buildCategoryTree(categories))}
                </div>
              </div>

              <input
                type="file"
                onChange={handleImageChange}
                className="w-full border p-2 mb-2"
              />
              {imagePreview && <img src={imagePreview} alt="Preview" className="h-16 mx-auto" />}

              <select
                name="status"
                value={newCategory.status}
                onChange={handleInputChange}
                className="w-full border p-2 mb-2 rounded"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
              {/* <div className="mb-4">
    <label className="block text-sm font-medium text-gray-700 mb-1">
      Show on Home Page
    </label>
    <div className="flex space-x-4">
      <label className="inline-flex items-center">
        <input
          type="radio"
          name="show_on_home"
          value="Yes"
          checked={newCategory.show_on_home === "Yes"}
          onChange={handleInputChange}
          className="form-radio h-4 w-4 text-blue-600"
        />
        <span className="ml-2">Yes</span>
      </label>
      <label className="inline-flex items-center">
        <input
          type="radio"
          name="show_on_home"
          value="No"
          checked={newCategory.show_on_home === "No"}
          onChange={handleInputChange}
          className="form-radio h-4 w-4 text-blue-600"
        />
        <span className="ml-2">No</span>
      </label>
    </div>
  </div> */}

              <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded w-full mt-2">
                Add Category
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmationModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-xl font-bold mb-4">Delete Category</h2>
            <p className="mb-4">Are you sure you want to delete this category?</p>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowConfirmationModal(false)}
                className="bg-gray-300 px-4 py-2 rounded-md"
              >
                No, Close
              </button>
              <button
                onClick={() => handleDeleteCategory(categoryToDelete)}
                className="bg-red-500 px-4 py-2 rounded-md text-white"
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