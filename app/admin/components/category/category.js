"use client";

import React, { useEffect, useState, useMemo } from "react";
import { FaPlus, FaMinus, FaEdit } from "react-icons/fa";
import { Icon } from '@iconify/react';
import DateRangePicker from '@/components/DateRangePicker';

export default function CategoryComponent() {
  const [categories, setCategories] = useState([]);
  const [expandedCategories, setExpandedCategories] = useState({});
  const [showUpdateAlert, setShowUpdateAlert] = useState(false);
const [updateAlertMessage, setUpdateAlertMessage] = useState('');

  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState(""); // "active" | "inactive" | ""
  const [searchQuery, setSearchQuery] = useState("");
  const [imageError, setImageError] = useState("");
  const [newCategory, setNewCategory] = useState({
    category_name: "",
    parentid: "none",
    status: "Active",
    image: null,
  });
  const [categoryToUpdate, setCategoryToUpdate] = useState({
    _id: "",
    category_name: "",
    parentid: "none",
    status: "Active",
    image: null,
    existingImage: null,
  });

  const [dateFilter, setDateFilter] = useState({
    startDate: null,
    endDate: null
  });
  
  const clearDateFilter = () => {
    setDateFilter({
      startDate: null,
      endDate: null
    });
    setCurrentPage(0);
  };

  const [imagePreview, setImagePreview] = useState(null);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [alertMessage, setAlertMessage] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 10;

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
  // const handleImageChange = (e) => {
  //   const file = e.target.files[0];
  //   if (file) {
  //     setNewCategory((prev) => ({ ...prev, image: file }));
  //     setImagePreview(URL.createObjectURL(file));
  //   }
  // };
const handleImageChange = async (e) => {
  const file = e.target.files[0];
  setImageError("");
  
  if (!file) {
    setImageError("Image is required");
    return;
  }

  // Check image dimensions
  const img = new Image();
  img.src = URL.createObjectURL(file);
  
  img.onload = function() {
    if (this.width !== 260 || this.height !== 240) {
      setImageError("Image must be exactly 260px width and 240px height");
      setNewCategory(prev => ({ ...prev, image: null }));
      setImagePreview(null);
    } else {
      setNewCategory(prev => ({ ...prev, image: file }));
      setImagePreview(img.src);
    }
  };
  
  img.onerror = function() {
    setImageError("Invalid image file");
  };
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
      // Check if image is provided
      if (!newCategory.image) {
        setAlertMessage("Image is required and must be 260px width and 240px height");
        setShowAlert(true);
        setTimeout(() => setShowAlert(false), 3000);
        return;
      }

    // Check if category name already exists
    if (isCategoryNameExists(newCategory.category_name)) {
      setAlertMessage("Category name already exists!");
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 3000);
      return;
    }

    const formData = new FormData();
    formData.append("category_name", newCategory.category_name);
    formData.append("parentid", newCategory.parentid);
    formData.append("status", newCategory.status);
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
        fetchCategories();

        // Reset form
        setNewCategory({
          category_name: "",
          parentid: "none",
          status: "Active",
          image: null,
        });
        setImagePreview(null);

        // Show success alert
        setAlertMessage("Category added successfully!");
        setShowAlert(true);
        setTimeout(() => setShowAlert(false), 3000);
      } else {
        console.error("Error adding category:", result.error);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  // Handle category update
  // const handleUpdateCategory = async (e) => {
  //   e.preventDefault();

  //   const formData = new FormData();
  //   formData.append("_id", categoryToUpdate._id);
  //   formData.append("category_name", categoryToUpdate.category_name);
  //   formData.append("parentid", categoryToUpdate.parentid);
  //   formData.append("status", categoryToUpdate.status);
  //   // if (categoryToUpdate.image instanceof File) {
  //   //   formData.append("image", categoryToUpdate.image);
  //   // }
  //    if (categoryToUpdate.image instanceof File) {
  //   const img = new Image();
  //   img.src = URL.createObjectURL(categoryToUpdate.image);
    
  //   await new Promise((resolve) => {
  //     img.onload = function() {
  //       if (this.width !== 96 || this.height !== 89) {
  //         setAlertMessage("Image must be exactly 96px width and 89px height");
  //         setShowAlert(true);
  //         setTimeout(() => setShowAlert(false), 3000);
  //         resolve(false);
  //       } else {
  //         resolve(true);
  //       }
  //     };
      
  //     img.onerror = function() {
  //       setAlertMessage("Invalid image file");
  //       setShowAlert(true);
  //       setTimeout(() => setShowAlert(false), 3000);
  //       resolve(false);
  //     };
  //   });
  // }

  //   formData.append("existingImage", categoryToUpdate.existingImage || "");

  //   try {
  //     const response = await fetch("/api/categories/update", {
  //       method: "PUT",
  //       body: formData,
  //     });

  //     const result = await response.json();
  //     if (response.ok) {
  //       setIsUpdateModalOpen(false);
  //       fetchCategories();
  //       setAlertMessage("Category updated successfully!");
  //       setShowAlert(true);
  //       setTimeout(() => setShowAlert(false), 3000);
  //     } else {
  //       console.error("Error updating category:", result.error);
  //       setAlertMessage(result.error || "Failed to update category");
  //       setShowAlert(true);
  //       setTimeout(() => setShowAlert(false), 3000);
  //     }
  //   } catch (error) {
  //     console.error("Error:", error);
  //     setAlertMessage("Failed to update category");
  //     setShowAlert(true);
  //     setTimeout(() => setShowAlert(false), 3000);
  //   }
  // };
const handleUpdateCategory = async (e) => {
  e.preventDefault();

  const formData = new FormData();
  formData.append("_id", categoryToUpdate._id);
  formData.append("category_name", categoryToUpdate.category_name);
  formData.append("parentid", categoryToUpdate.parentid);
  formData.append("status", categoryToUpdate.status);

  // Check image dimension if a new image is uploaded
  if (categoryToUpdate.image instanceof File) {
    const img = new Image();
    img.src = URL.createObjectURL(categoryToUpdate.image);

    const isValid = await new Promise((resolve) => {
      img.onload = function () {
        if (this.width !== 260 || this.height !== 240) {
          setAlertMessage("Image must be exactly 260px width and 240px height");
          setShowAlert(true);
          setTimeout(() => setShowAlert(false), 3000);
          resolve(false);
        } else {
          resolve(true);
        }
      };

      img.onerror = function () {
        setAlertMessage("Invalid image file");
        setShowAlert(true);
        setTimeout(() => setShowAlert(false), 3000);
        resolve(false);
      };
    });

    if (!isValid) return; // ❌ Block submission if image is invalid

    formData.append("image", categoryToUpdate.image); // ✅ Add only after validation
  }

  formData.append("existingImage", categoryToUpdate.existingImage || "");

  try {
    const response = await fetch("/api/categories/update", {
      method: "PUT",
      body: formData,
    });

    const result = await response.json();
    if (response.ok) {
      setIsUpdateModalOpen(false);
      fetchCategories();
      setAlertMessage("Category updated successfully!");
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 3000);
    } else {
      console.error("Error updating category:", result.error);
      setAlertMessage(result.error || "Failed to update category");
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 3000);
    }
  } catch (error) {
    console.error("Error:", error);
    setAlertMessage("Failed to update category");
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 3000);
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
        fetchCategories();
        setAlertMessage("Category deleted successfully!");
        setShowAlert(true);
        setTimeout(() => setShowAlert(false), 3000);
      } else {
        console.error("Error:", result.error);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setShowConfirmationModal(false);
      setCategoryToDelete(null);
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
            (newCategory.parentid === category._id || categoryToUpdate.parentid === category._id) 
              ? "text-red-500 font-semibold" 
              : "text-black"
          }`}
          onClick={() => {
            if (isUpdateModalOpen) {
              setCategoryToUpdate({...categoryToUpdate, parentid: category._id});
            } else {
              setNewCategory({...newCategory, parentid: category._id});
            }
          }}
        >
          {category.children.length > 0 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                toggleCategory(category._id);
              }}
              className="mr-2 text-red-500"
            >
              {expandedCategories[category._id] ? <FaMinus /> : <FaPlus />}
            </button>
          )}
          <span className={`font-semibold ${
            (newCategory.parentid === category._id || categoryToUpdate.parentid === category._id) 
              ? "text-red-500" 
              : ""
          }`}>
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

  // Filter categories based on search, status, and date
  const filteredCategories = useMemo(() => {
    const flattened = flattenCategories(categories);
    return flattened.filter((category) => {
      // Search filter
      const matchesSearch = 
        category.category_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (category.category_slug && category.category_slug.toLowerCase().includes(searchQuery.toLowerCase()));
      
      // Status filter
      const matchesStatus = 
        statusFilter === "" || category.status.toLowerCase() === statusFilter.toLowerCase();
      
      // Date filter
      let matchesDate = true;
      if (dateFilter.startDate && dateFilter.endDate && category.createdAt) {
        const categoryDate = new Date(category.createdAt);
        const startDate = new Date(dateFilter.startDate);
        const endDate = new Date(dateFilter.endDate);
        endDate.setHours(23, 59, 59, 999); // Include the entire end day
        
        matchesDate = categoryDate >= startDate && categoryDate <= endDate;
      }
      
      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [categories, searchQuery, statusFilter, dateFilter.startDate, dateFilter.endDate, expandedCategories]);

  // Handle date change
  const handleDateChange = ({ startDate, endDate }) => {
    setDateFilter({ startDate, endDate });
    setCurrentPage(0);
  };

  // Pagination logic
  const pageCount = Math.ceil(filteredCategories.length / itemsPerPage);
  const paginatedCategories = filteredCategories.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  // Handle page change
  const paginate = (pageIndex) => {
    if (pageIndex >= 0 && pageIndex < pageCount) {
      setCurrentPage(pageIndex);
    }
  };

  // Reset current page when filters change
  useEffect(() => {
    setCurrentPage(0);
  }, [searchQuery, statusFilter, dateFilter]);

  // Render category rows
  const renderCategoryRows = () => {
    if (paginatedCategories.length === 0) {
      return (
        <tr>
          <td colSpan="6" className="text-center p-4">
            No categories found
          </td>
        </tr>
      );
    }

    return paginatedCategories.map((category) => (
      <tr key={category._id} className="text-center border-b">
        <td className="flex items-center p-2">
          {categories.some((cat) => cat.parentid === category._id) && (
            <button
              type="button"
              onClick={() => toggleCategory(category._id)}
              className="mr-2 text-red-500"
              aria-label="Expand/Collapse"
            >
              {expandedCategories[category._id] ? <FaMinus /> : <FaPlus />}
            </button>
          )}
          <span style={{ paddingLeft: `${category.level * 20}px` }} className="font-medium">
            {category.category_name}
          </span>
        </td>
        <td>
          <span className="text-primary-600">
            {category.category_slug || 'N/A'}
          </span>
        </td>
        <td>{getParentCategoryName(category.parentid)}</td>
        <td>
          {category.image ? (
            <img src={category.image} alt="Category" className="h-8 mx-auto rounded-lg" />
          ) : (
            'No Image'
          )}
        </td>
        <td>
          {category.status === 'Active' ? (
            <span className="bg-green-100 text-green-600 px-6 py-1.5 rounded-full font-medium text-sm">
              Active
            </span>
          ) : (
            <span className="bg-red-100 text-red-600 px-6 py-1.5 rounded-full font-medium text-sm">
              Inactive
            </span>
          )}
        </td>
        <td>
          <div className="flex items-center gap-2 justify-center">
            <button
              onClick={() => {
                setCategoryToUpdate({
                  ...category,
                  existingImage: category.image || null
                });
                setIsUpdateModalOpen(true);
              }}
              className="w-7 h-7 bg-red-100 text-red-600 rounded-full inline-flex items-center justify-center"
              title="Edit"
            >
              <FaEdit className="w-3 h-3" />
            </button>
            <button
              onClick={() => {
                setCategoryToDelete(category._id);
                setShowConfirmationModal(true);
              }}
              className="w-7 h-7 bg-pink-100 text-pink-600 rounded-full inline-flex items-center justify-center"
              title="Delete"
            >
              <Icon icon="mingcute:delete-2-line" />
            </button>
          </div>
        </td>
      </tr>
    ));
  };

  return (
    <div className="container mx-auto">
      {/* Alert Message */}
      {/* {showAlert && (
        <div className="bg-green-500 text-white px-4 py-2 rounded-md mb-4 mt-5">
          {alertMessage}
        </div>
      )} */}

      <div className="flex justify-between items-center mb-5">
        <h2 className="text-2xl font-bold">Category List</h2>
       
      </div>

      {isLoading ? (
        <p>Loading categories...</p>
      ) : (
        <div className="bg-white shadow-md rounded-lg p-5 h-[500px] overflow-x-auto">
          {/* Search and Filter Section */}
        {/* Search and Filter Section */}
{/* Search and Filter Section */}
<div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end mb-4">

  {/* Search Input */}
  <div className="w-full">
    <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
    <div className="relative">
      <span className="absolute inset-y-0 left-0 flex items-center pl-3">
        <svg
          className="w-4 h-4 text-gray-500"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-4.35-4.35M16.65 16.65A7.5 7.5 0 1116.65 2.5a7.5 7.5 0 010 15z"
          />
        </svg>
      </span>
      <input
        type="text"
        placeholder="Search Category..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="pl-10 pr-3 py-2 border border-gray-300 rounded-md w-full text-sm focus:outline-none focus:ring-2 focus:ring-red-200"
      />
    </div>
  </div>

  {/* Status Filter */}
  <div className="w-full">
    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
    <select
      value={statusFilter}
      onChange={(e) => setStatusFilter(e.target.value)}
      className="w-full p-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500 text-sm"
    >
      <option value="">All Statuses</option>
      <option value="Active">Active</option>
      <option value="Inactive">Inactive</option>
    </select>
  </div>

  {/* Date Range Picker */}
  <div className="w-full col-span-1 md:col-span-1">
    <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
    <div className="relative w-full max-w-sm">
      <DateRangePicker onDateChange={handleDateChange} />
      {/* {dateFilter.startDate && dateFilter.endDate && (
        <button 
          onClick={clearDateFilter}
          className="mt-2 text-sm text-red-600 hover:text-red-800"
        >
          Clear date filter
        </button>
      )} */}
    </div>
  </div>
  <div>
   <button
          onClick={() => setIsModalOpen(true)}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium shadow-sm transition duration-150"
        >
          + Add Category
        </button>
</div>
</div>



          {/* Categories Table */}
          <div className="overflow-x-auto">
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
                {renderCategoryRows()}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex justify-between items-center mt-6 flex-wrap gap-3">
            <div className="text-sm text-gray-600">
              Showing {filteredCategories.length === 0 ? 0 : currentPage * itemsPerPage + 1} to{" "}
              {Math.min((currentPage + 1) * itemsPerPage, filteredCategories.length)} of{" "}
              {filteredCategories.length} entries
            </div>

            <div className="pagination flex items-center space-x-1">
              <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 0}
                className={`px-3 py-1.5 border border-gray-300 rounded-md ${
                  currentPage === 0
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-black bg-white hover:bg-gray-100"
                }`}
                aria-label="Previous page"
              >
                «
              </button>

              {Array.from({ length: pageCount }, (_, i) => (
                <button
                  key={i}
                  onClick={() => paginate(i)}
                  className={`px-3 py-1.5 border border-gray-300 rounded-md ${
                    currentPage === i
                      ? "bg-red-500 text-white"
                      : "text-black bg-white hover:bg-gray-100"
                  }`}
                  aria-label={`Page ${i + 1}`}
                  aria-current={currentPage === i ? "page" : undefined}
                >
                  {i + 1}
                </button>
              ))}

              <button
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === pageCount - 1 || pageCount === 0}
                className={`px-3 py-1.5 border border-gray-300 rounded-md ${
                  currentPage === pageCount - 1 || pageCount === 0
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-black bg-white hover:bg-gray-100"
                }`}
                aria-label="Next page"
              >
                »
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Category Modal */}
     {isModalOpen && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 overflow-y-auto">
        <div className="bg-white rounded-2xl shadow-lg w-full max-w-3xl mx-4 max-h-[90vh] flex flex-col">
          <div className="flex justify-between items-center border-b-2 border-gray-300 px-6 py-4">
            <h2 className="text-xl font-semibold text-gray-900">Add Category</h2>
            <button
              onClick={() => setIsModalOpen(false)}
              className="text-gray-400 hover:text-gray-700 focus:outline-none"
              aria-label="Close modal"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="px-6 py-6 overflow-y-auto flex-grow">
            <form onSubmit={handleAddCategory} className="space-y-5">
              {/* ALERT MESSAGE – moved here */}
              {showAlert && (
                <div className="bg-green-500 text-white px-4 py-2 rounded-md">
                  {alertMessage}
                </div>
              )}

              <div>
                <label htmlFor="category_name" className="block mb-1 text-sm font-semibold text-gray-700">
                  Category Name
                </label>
                <input
                  name="category_name"
                  value={newCategory.category_name}
                  onChange={handleInputChange}
                  id="category_name"
                  className="w-full rounded-md border p-2 focus:ring-2 focus:ring-red-400"
                  placeholder="Enter Category Name"
                  required
                />
              </div>

              <div>
                <label className="block mb-1 text-sm font-semibold text-gray-700">Parent Category</label>
                <div className="border border-gray-300 rounded-md max-h-40 overflow-y-auto p-2">
                  <div>
                    <div
                      className={`p-2 cursor-pointer rounded-md font-semibold ${
                        newCategory.parentid === "none"
                          ? "bg-red-100 text-red-600"
                          : "text-gray-800 hover:bg-gray-100"
                      }`}
                      onClick={() => setNewCategory({ ...newCategory, parentid: "none" })}
                    >
                      Category
                    </div>
                    {renderCategoryTree(buildCategoryTree(categories))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block mb-1 text-sm font-semibold text-gray-700">Upload Image (260px X 240px)</label>
                <input
                  type="file"
                  onChange={handleImageChange}
                  className="block w-full text-sm text-gray-600
                    file:mr-3 file:py-1 file:px-3
                    file:rounded-md file:border-0
                    file:text-sm file:font-semibold
                    file:bg-red-50 file:text-red-700
                    hover:file:bg-red-100"
                />
                {imagePreview && (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="mt-3 h-16 rounded-md object-contain mx-auto"
                  />
                )}
              </div>

              <div>
                <label htmlFor="status" className="block mb-1 text-sm font-semibold text-gray-700">
                  Status
                </label>
                <select
                  name="status"
                  id="status"
                  value={newCategory.status}
                  onChange={handleInputChange}
                  className="w-full rounded-md border border-gray-300 p-2 focus:ring-2 focus:ring-red-400"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <button
                type="submit"
                className="inline-block bg-red-600 text-white px-5 py-2 rounded-md text-sm font-semibold hover:bg-red-700 transition"
              >
                Add Category
              </button>
            </form>
          </div>
        </div>
      </div>
    )}


      {/* Update Category Modal */}
     {isUpdateModalOpen && categoryToUpdate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-lg w-full max-w-3xl mx-4 max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center border-b-2 border-gray-300 px-6 py-4">
              <h2 className="text-xl font-semibold text-gray-900">Update Category</h2>
              <button
                onClick={() => setIsUpdateModalOpen(false)}
                className="text-gray-400 hover:text-gray-700 focus:outline-none"
                aria-label="Close modal"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none"
                  viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="px-6 py-6 overflow-y-auto flex-grow">
              <form onSubmit={handleUpdateCategory} className="space-y-5">

                {/* ✅ Alert Message Above Category Name */}
                {showUpdateAlert && (
                  <div className="bg-green-500 text-white px-4 py-2 rounded-md -mt-2">
                    {updateAlertMessage}
                  </div>
                )}

                <div>
                  <label htmlFor="update_category_name" className="block mb-1 text-sm font-semibold text-gray-700">
                    Category Name
                  </label>
                  <input
                    name="category_name"
                    value={categoryToUpdate.category_name}
                    onChange={(e) => setCategoryToUpdate({ ...categoryToUpdate, category_name: e.target.value })}
                    id="update_category_name"
                    className="w-full rounded-md border p-2 focus:ring-2 focus:ring-red-400"
                    placeholder="Enter Category Name"
                    required
                  />
                </div>

                <div>
                  <label className="block mb-1 text-sm font-semibold text-gray-700">Parent Category</label>
                  <div className="border border-gray-300 rounded-md max-h-40 overflow-y-auto p-2">
                    <div>
                      <div
                        className={`p-2 cursor-pointer rounded-md font-semibold ${
                          categoryToUpdate.parentid === "none"
                            ? "bg-red-100 text-red-600"
                            : "text-gray-800 hover:bg-gray-100"
                        }`}
                        onClick={() => setCategoryToUpdate({ ...categoryToUpdate, parentid: "none" })}
                      >
                        Category
                      </div>
                      {renderCategoryTree(buildCategoryTree(categories))}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block mb-1 text-sm font-semibold text-gray-700">Upload Image (260px X 240px)</label>
                  <input
                    type="file"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        setCategoryToUpdate((prev) => ({ ...prev, image: file }));
                        setImagePreview(URL.createObjectURL(file));
                      }
                    }}
                    className="block w-full text-sm text-gray-600
                      file:mr-3 file:py-1 file:px-3
                      file:rounded-md file:border-0
                      file:text-sm file:font-semibold
                      file:bg-red-50 file:text-red-700
                      hover:file:bg-red-100"
                  />
                  {categoryToUpdate.image && (
                    <img
                      src={
                        categoryToUpdate.image instanceof File
                          ? URL.createObjectURL(categoryToUpdate.image)
                          : categoryToUpdate.image
                      }
                      alt="Preview"
                      className="mt-3 h-16 rounded-md object-contain mx-auto"
                    />
                  )}
                </div>

                <div>
                  <label htmlFor="update_status" className="block mb-1 text-sm font-semibold text-gray-700">
                    Status
                  </label>
                  <select
                    name="status"
                    id="update_status"
                    value={categoryToUpdate.status}
                    onChange={(e) => setCategoryToUpdate({ ...categoryToUpdate, status: e.target.value })}
                    className="w-full rounded-md border border-gray-300 p-2 focus:ring-2 focus:ring-red-400"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="inline-block bg-red-600 text-white px-5 py-2 rounded-md text-sm font-semibold hover:bg-red-700 transition"
                >
                  Update Category
                </button>
              </form>
            </div>
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