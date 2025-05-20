import React, { useState, useEffect } from "react";
import { FaPlus, FaMinus, FaEdit } from "react-icons/fa";
import { Icon } from '@iconify/react';

export default function BlogComponent() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [blogData, setBlogData] = useState({
    name: "",
    image: null,
    description: "",
    status: "Active",
  });
  const [selectedCategories, setSelectedCategories] = useState(new Set());
  const [imagePreview, setImagePreview] = useState(null);
  const [categories, setCategories] = useState([]);
  const [expandedCategories, setExpandedCategories] = useState({});
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [blogs, setBlogs] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [blogToDelete, setBlogToDelete] = useState(null);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  // Edit Modal
   const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editBlogData, setEditBlogData] = useState({
    id: "",
    name: "",
    image: null,
    existingImage: "",
    description: "",
    status: "Active",
  });
  const [editSelectedCategories, setEditSelectedCategories] = useState(new Set());

  const filteredBlogs = blogs.filter((blog) =>
    blog.blog_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalEntries = filteredBlogs.length;
  const startEntry = (currentPage - 1) * itemsPerPage + 1;
  const endEntry = Math.min(currentPage * itemsPerPage, totalEntries);

  useEffect(() => {
    fetchCategories();
    fetchBlogs();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/categories/get");
      const result = await response.json();
      if (result.error) {
        console.error("API Error:", result.error);
      } else {
        setCategories(buildCategoryTree(result));
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchBlogs = async () => {
    try {
      const response = await fetch("/api/blogs/get");
      const text = await response.text();
      if (!text) {
        console.error("Empty response from API");
        return;
      }
      const result = JSON.parse(text);
      if (result.success) {
        setBlogs(result.data);
      } else {
        console.error("API Error:", result.error);
      }
    } catch (error) {
      console.error("Error fetching blogs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditInputChange = (e) => {
    setEditBlogData({ ...editBlogData, [e.target.name]: e.target.value });
  };

  const handleEditImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEditBlogData({ 
        ...editBlogData, 
        image: file,
        existingImage: "" 
      });
    }
  };

  const handleEditCategoryChange = (category, isChecked) => {
    const updatedSelection = new Set(editSelectedCategories);

    const toggleChildren = (children, select) => {
      children.forEach((child) => {
        if (select) {
          updatedSelection.add(child._id);
        } else {
          updatedSelection.delete(child._id);
        }
        if (child.children.length > 0) {
          toggleChildren(child.children, select);
        }
      });
    };

    if (isChecked) {
      updatedSelection.add(category._id);
      toggleChildren(category.children, true);
    } else {
      updatedSelection.delete(category._id);
      toggleChildren(category.children, false);
    }

    const toggleParents = (parentId) => {
      if (!parentId || parentId === "none") return;
      const parent = findCategoryById(categories, parentId);
      if (parent) {
        const allChildrenSelected = parent.children.every((child) =>
          updatedSelection.has(child._id)
        );
        if (allChildrenSelected) {
          updatedSelection.add(parent._id);
        } else {
          updatedSelection.delete(parent._id);
        }
        toggleParents(parent.parentid);
      }
    };

    toggleParents(category.parentid);
    setEditSelectedCategories(updatedSelection);
  };


  const buildCategoryTree = (categories, parentId = "none") => {
    return categories
      .filter((category) => category.parentid === parentId)
      .map((category) => ({
        ...category,
        children: buildCategoryTree(categories, category._id),
      }));
  };

  const toggleCategory = (id) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleInputChange = (e) => {
    setBlogData({ ...blogData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setBlogData({ ...blogData, image: file });
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleCategoryChange = (category, isChecked) => {
    const updatedSelection = new Set(selectedCategories);

    const toggleChildren = (children, select) => {
      children.forEach((child) => {
        if (select) {
          updatedSelection.add(child._id);
        } else {
          updatedSelection.delete(child._id);
        }
        if (child.children.length > 0) {
          toggleChildren(child.children, select);
        }
      });
    };

    if (isChecked) {
      updatedSelection.add(category._id);
      toggleChildren(category.children, true);
    } else {
      updatedSelection.delete(category._id);
      toggleChildren(category.children, false);
    }

    const toggleParents = (parentId) => {
      if (!parentId || parentId === "none") return;
      const parent = findCategoryById(categories, parentId);
      if (parent) {
        const allChildrenSelected = parent.children.every((child) =>
          updatedSelection.has(child._id)
        );
        if (allChildrenSelected) {
          updatedSelection.add(parent._id);
        } else {
          updatedSelection.delete(parent._id);
        }
        toggleParents(parent.parentid);
      }
    };

    toggleParents(category.parentid);
    setSelectedCategories(updatedSelection);
  };

  const findCategoryById = (categories, id) => {
    for (const category of categories) {
      if (category._id === id) return category;
      const found = findCategoryById(category.children, id);
      if (found) return found;
    }
    return null;
  };

  const renderCategoryTree = (categories, level = 0, isEditMode = false) => {
    return categories.map((category) => (
      <div key={category._id} style={{ paddingLeft: `${level * 20}px` }}>
        <div className="flex items-center cursor-pointer p-2">
          {category.children.length > 0 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                toggleCategory(category._id);
              }}
              className="mr-2 text-blue-500"
            >
              {expandedCategories[category._id] ? <FaMinus /> : <FaPlus />}
            </button>
          )}
           <input
            type="checkbox"
            value={category._id}
            checked={isEditMode 
              ? editSelectedCategories.has(category._id) 
              : selectedCategories.has(category._id)}
            onChange={(e) => isEditMode 
              ? handleEditCategoryChange(category, e.target.checked)
              : handleCategoryChange(category, e.target.checked)}
            className="mr-2"
          />
          <span
            className={`font-semibold ${
              selectedCategories.has(category._id) ? "text-blue-500" : "text-black"
            }`}
          >
            {category.category_name}
          </span>
        </div>
        {expandedCategories[category._id] && renderCategoryTree(category.children, level + 1)}
      </div>
    ));
  };

   const handleEditSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("id", editBlogData.id);
    formData.append("name", editBlogData.name);
    formData.append("description", editBlogData.description);
    formData.append("category", Array.from(editSelectedCategories)[0]);
    formData.append("status", editBlogData.status);
    if (editBlogData.image) {
      formData.append("image", editBlogData.image);
    }
    formData.append("existingImage", editBlogData.existingImage);

    try {
      const response = await fetch("/api/blogs/update", {
        method: "PUT",
        body: formData,
      });

      const result = await response.json();
      if (result.success) {
        setAlertMessage("Blog updated successfully!");
        setShowAlert(true);
        setIsEditModalOpen(false);
        setEditBlogData({ 
          id: "",
          name: "", 
          image: null, 
          existingImage: "",
          description: "", 
          status: "Active" 
        });
        setEditSelectedCategories(new Set());
   
        fetchBlogs();

        setTimeout(() => {
          setShowAlert(false);
        }, 3000);
      } else {
        setAlertMessage("Error: " + result.error);
        setShowAlert(true);

        setTimeout(() => {
          setShowAlert(false);
        }, 3000);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      setAlertMessage("Failed to update blog.");
      setShowAlert(true);

      setTimeout(() => {
        setShowAlert(false);
      }, 3000);
    }
  };

  
  const handleEdit = (blog) => {
    setEditBlogData({
      id: blog._id,
      name: blog.blog_name,
      description: blog.description,
      status: blog.status,
      existingImage: blog.image || ""
    });
    
    // Set selected categories for edit
    const newSelected = new Set();
    if (blog.category && blog.category._id) {
      newSelected.add(blog.category._id);
    }
    setEditSelectedCategories(newSelected);
    
    setIsEditModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (selectedCategories.size === 0) {
      setAlertMessage("Please select at least one category");
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 3000);
      return;
    }

    const formData = new FormData();
    formData.append("name", blogData.name);
    formData.append("description", blogData.description);
    formData.append("category", Array.from(selectedCategories)[0]);
    formData.append("status", blogData.status);
    if (blogData.image) {
      formData.append("image", blogData.image);
    }

    try {
      const response = await fetch("/api/blogs/add", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      if (result.success) {
        setAlertMessage("Blog added successfully!");
        setShowAlert(true);
        setIsModalOpen(false);
        setBlogData({ name: "", image: null, description: "", status: "Active" });
        setSelectedCategories(new Set());
        setImagePreview(null);
        fetchBlogs();

        setTimeout(() => {
          setShowAlert(false);
        }, 3000);
      } else {
        setAlertMessage("Error: " + result.error);
        setShowAlert(true);
        setTimeout(() => {
          setShowAlert(false);
        }, 3000);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      setAlertMessage("Failed to add blog.");
      setShowAlert(true);
      setTimeout(() => {
        setShowAlert(false);
      }, 3000);
    }
  };

  const handleDelete = async () => {
    if (!blogToDelete) return;
    
    try {
      const response = await fetch(`/api/blogs/delete?id=${blogToDelete}`, {
        method: 'PUT',
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
  
      const result = await response.json();
      if (result.success) {
        setAlertMessage('Blog status updated to Inactive successfully!');
        fetchBlogs();
      } else {
        setAlertMessage('Error: ' + result.error);
      }
      
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 3000);
      setShowConfirmationModal(false);
      setBlogToDelete(null);
    } catch (error) {
      console.error('Error updating blog status:', error);
      setAlertMessage('Failed to update blog status.');
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 3000);
    }
  };

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const renderPagination = () => {
    const pageNumbers = [];
    for (let i = 1; i <= Math.ceil(filteredBlogs.length / itemsPerPage); i++) {
      pageNumbers.push(i);
    }

    if (pageNumbers.length <= 1) return null;

    return (
      <div className="flex justify-between items-center mt-4">
        <div className="text-sm text-gray-600">
          Showing {startEntry} to {endEntry} of {totalEntries} entries
        </div>

        <ul className="pagination flex items-center space-x-1" role="navigation" aria-label="Pagination">
          <li className="page-item">
            <button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1.5 border border-gray-300 rounded-md bg-white text-black hover:bg-gray-100"
              aria-label="Previous page"
            >
              «
            </button>
          </li>
          
          {pageNumbers.map((number) => (
            <li key={number} className={`page-item ${currentPage === number ? 'bg-blue-500 text-white' : ''}`}>
              <button
                onClick={() => paginate(number)}
                className="px-3 py-1.5 border border-gray-300 rounded-md bg-white text-black hover:bg-gray-100"
                aria-label={`Page ${number}`}
              >
                {number}
              </button>
            </li>
          ))}
          
          <li className="page-item">
            <button
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === pageNumbers.length}
              className="px-3 py-1.5 border border-gray-300 rounded-md bg-white text-black hover:bg-gray-100"
              aria-label="Next page"
            >
              »
            </button>
          </li>
        </ul>
      </div>
    );
  };

  return (
    <div className="container mx-auto">
      <div className="flex justify-between items-center mb-5 mt-5">
        <h2 className="text-2xl font-bold">Blog List</h2>
      </div>
      
      {showAlert && (
        <div className="bg-green-500 text-white px-4 py-2 rounded-md mb-4">
          {alertMessage}
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <p>Loading...</p>
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-lg p-5 overflow-x-auto">
          <div className="flex justify-between items-center mb-5">
            <input
              type="text"
              placeholder="Search Blog..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border px-3 py-2 rounded-md w-64"
            />
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition"
            >
              + Add Blog
            </button>
          </div>
          <hr className="border-t border-gray-200 mb-4" />
          {filteredBlogs.length === 0 ? (
            <div className="text-center py-8">
              <p>No blogs found</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full border border-gray-300">
                  <thead>
                    <tr className="bg-gray-200">
                      <th className="p-2 text-left">Name</th>
                      <th className="p-2 text-left">Description</th>
                      <th className="p-2 text-left">Category</th>
                      <th className="p-2 text-left">Status</th>
                      <th className="p-2 text-left">Image</th>
                      <th className="p-2 text-left">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBlogs
                      .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                      .map((blog) => (
                        <tr key={blog._id} className="border-b hover:bg-gray-50">
                          <td className="p-2 font-bold">{blog.blog_name}</td>
                          <td className="p-2" title={blog.description}>
                            {blog.description.length > 50 
                              ? `${blog.description.substring(0, 50)}...` 
                              : blog.description}
                          </td>
                          <td className="p-2">
                            {blog.category ? blog.category.category_name : "No Category"}
                          </td>
                          <td className="p-2 font-semibold">
                            <span className={blog.status === "Active" ? "text-green-500" : "text-red-500"}>
                              {blog.status}
                            </span>
                          </td>
                          <td className="p-2">
                            {blog.image && (
                              <img 
                                src={blog.image} 
                                alt="Blog" 
                                className="h-8 object-contain" 
                              />
                            )}
                          </td>
                          <td className="p-2">
                            <div className="flex items-center gap-2">
                               <button
                      onClick={() => handleEdit(blog)}
                      className="w-7 h-7 bg-blue-100 text-blue-600 rounded-full inline-flex items-center justify-center"
                      title="Edit"
                    >
                      <FaEdit className="mr-1" />
                    </button>
                              <button
                                onClick={() => {
                                  setBlogToDelete(blog._id);
                                  setShowConfirmationModal(true);
                                }}
                                className="w-7 h-7 bg-pink-100 text-pink-600 rounded-full inline-flex items-center justify-center hover:bg-pink-200 transition"
                                title="Delete"
                              >
                                <Icon icon="mingcute:delete-2-line" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
              {renderPagination()}
            </>
          )}
        </div>
      )}

      {/* Add Blog Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-lg w-full max-w-3xl mx-4 max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center border-b-2 border-gray-300 px-6 py-4">
              <h2 className="text-xl font-semibold text-gray-900">Add Blog</h2>
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
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="blog_name" className="block mb-1 text-sm font-semibold text-gray-700">
                    Blog Name
                  </label>
                  <input
                    name="name"
                    value={blogData.name}
                    onChange={handleInputChange}
                    id="blog_name"
                    className="w-full rounded-md border p-2 focus:ring-2 focus:ring-blue-400"
                    placeholder="Enter Blog Name"
                    required
                  />
                </div>

                <div>
                  <label className="block mb-1 text-sm font-semibold text-gray-700">Upload Image</label>
                  <input
                    type="file"
                    onChange={handleImageChange}
                    accept="image/*"
                    className="block w-full text-sm text-gray-600
                      file:mr-3 file:py-1 file:px-3
                      file:rounded-md file:border-0
                      file:text-sm file:font-semibold
                      file:bg-blue-50 file:text-blue-700
                      hover:file:bg-blue-100"
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
                  <label htmlFor="description" className="block mb-1 text-sm font-semibold text-gray-700">
                    Blog Description
                  </label>
                  <textarea
                    name="description"
                    value={blogData.description}
                    onChange={handleInputChange}
                    id="description"
                    className="w-full rounded-md border p-2 focus:ring-2 focus:ring-blue-400"
                    placeholder="Enter Blog Description"
                    rows={4}
                    required
                  />
                </div>

                <div>
                  <label className="block mb-1 text-sm font-semibold text-gray-700">Select Categories</label>
                  <div className="border border-gray-300 rounded-md max-h-40 overflow-y-auto p-2">
                    {categories.length > 0 ? (
                      renderCategoryTree(categories)
                    ) : (
                      <p className="text-gray-500">No categories available</p>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="status" className="block mb-1 text-sm font-semibold text-gray-700">
                    Status
                  </label>
                  <select
                    name="status"
                    id="status"
                    value={blogData.status}
                    onChange={handleInputChange}
                    className="w-full rounded-md border border-gray-300 p-2 focus:ring-2 focus:ring-blue-400"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="inline-block bg-blue-600 text-white px-5 py-2 rounded-md text-sm font-semibold hover:bg-blue-700 transition"
                >
                  Add Blog
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Blog Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-5 rounded-lg w-96 relative max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold text-center">Edit Blog</h2>
            <button
              onClick={() => setIsEditModalOpen(false)}
              className="absolute top-3 right-3 text-red-500 text-xl"
            >
              ×
            </button>
            <form onSubmit={handleEditSubmit} className="mt-4">
              <input
                name="name"
                value={editBlogData.name}
                onChange={handleEditInputChange}
                className="w-full border p-2 mb-2 rounded"
                placeholder="Blog Name"
                required
              />

              <input
                type="file"
                onChange={handleEditImageChange}
                className="w-full border p-2 mb-2"
              />
              {editBlogData.existingImage && !editBlogData.image && (
                <img src={editBlogData.existingImage} alt="Current" className="h-16 mx-auto" />
              )}
              {editBlogData.image && (
                <img src={URL.createObjectURL(editBlogData.image)} alt="New" className="h-16 mx-auto" />
              )}

              <textarea
                name="description"
                value={editBlogData.description}
                onChange={handleEditInputChange}
                className="w-full border p-2 mb-2 rounded"
                placeholder="Blog Description"
                required
              />

              <div className="border p-2 rounded-md mb-2">
                <p className="font-semibold mb-1">Select Categories:</p>
                {renderCategoryTree(categories, 0, true)}
              </div>

              <select
                name="status"
                value={editBlogData.status}
                onChange={handleEditInputChange}
                className="w-full border p-2 mb-2 rounded"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>

              <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded w-full mt-2">
                Update Blog
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Confirm Deletion</h3>
            <p className="mb-6">Are you sure you want to delete this blog?</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowConfirmationModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}