import React, { useState, useEffect } from "react";
import { FaPlus, FaMinus } from "react-icons/fa";

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
  const [itemsPerPage] = useState(5); // Number of items per page

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

  const renderCategoryTree = (categories, level = 0) => {
    console.log(categories)
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
            checked={selectedCategories.has(category._id)}
            onChange={(e) => handleCategoryChange(category, e.target.checked)}
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

  const handleSubmit = async (e) => {
    e.preventDefault();

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
    const handleDelete = async (id) => {
      try {
        const response = await fetch(`/api/blogs/delete?id=${id}`, {
          method: 'PUT',
        });
    
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
    
        const result = await response.json();
        if (result.success) {
          setAlertMessage('Blog status updated to Inactive successfully!');
        } else {
          setAlertMessage('Error: ' + result.error);
        }
        
        setShowAlert(true);
        setTimeout(() => setShowAlert(false), 3000);
    
        fetchBlogs && fetchBlogs(); // Ensure fetchBlogs exists before calling
      } catch (error) {
        console.error('Error updating blog status:', error);
        setAlertMessage('Failed to update blog status.');
        setShowAlert(true);
        setTimeout(() => setShowAlert(false), 3000);
      }
    };
    
    const filteredBlogs = blogs.filter((blog) =>
      blog.blog_name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Pagination logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredBlogs.slice(indexOfFirstItem, indexOfLastItem);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const renderPagination = () => {
      const pageNumbers = [];
      for (let i = 1; i <= Math.ceil(filteredBlogs.length / itemsPerPage); i++) {
        pageNumbers.push(i);
      }

      return (
        <ul className="pagination flex justify-center mt-4" role="navigation" aria-label="Pagination">
          <li className="page-item">
            <button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className="page-link px-3 py-2 border rounded mx-1"
              aria-label="Previous page"
            >
              Previous
            </button>
          </li>
          {pageNumbers.map((number) => (
            <li key={number} className={`page-item ${currentPage === number ? 'active' : ''}`}>
              <button
                onClick={() => paginate(number)}
                className="page-link px-3 py-2 border rounded mx-1"
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
              className="page-link px-3 py-2 border rounded mx-1"
              aria-label="Next page"
            >
              Next
            </button>
          </li>
        </ul>
      );
    };

    return (
      <div className="container mx-auto ">
       
        <div className="flex justify-between items-center mb-1 ">
          <h2 className="text-2xl font-bold">Blog List</h2>
          
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded-md"
          >
            + Add Blog
          </button>
        </div>
         {showAlert && (
          <div className="bg-green-500 text-white px-4 py-2 rounded-md mb-4">
            {alertMessage}
          </div>
        )}
        <div className="flex justify-start mb-5">
          <input
            type="text"
            placeholder="Search Blog..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border px-3 py-2 rounded-md w-64"
          />
        </div>

        {isLoading ? (
          <p>Loading...</p>
        ) : (
          <div className="bg-white shadow-md rounded-lg p-5 overflow-x-auto">
            <table className="w-full border border-gray-300">
              <thead>
                <tr className="bg-gray-200">
                  <th className="p-2">Name</th>
                  <th className="p-2">Description</th>
                  <th className="p-2">Category</th>
                  <th className="p-2">Status</th>
                  <th className="p-2">Image</th>
                  <th className="p-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((blog) => (
                  <tr key={blog._id} className="text-center border-b">
                    <td className="p-2 font-bold">{blog.blog_name}</td>
                  <td className="p-2" title={blog.description}>
                    {blog.description.length > 30 ? blog.description.substring(0, 50) + "..." : blog.description}
                  </td>

                 <td className="p-2">{blog.category ? blog.category.category_name : "No Category"}</td>


                    <td className="p-2 font-semibold">
                      <span className={blog.status === "Active" ? "text-green-500" : "text-red-500"}>
                        {blog.status}
                      </span>
                    </td>
                    <td className="p-2">
                      {blog.image && <img src={blog.image} alt="Blog" className="h-10 mx-auto" />}
                    </td>
                    <td className="p-2 font-semibold">
                      <button
                        onClick={() => handleDelete(blog._id)} // Call handleDelete with the blog ID
                        className="bg-red-500 text-white px-3 py-1 rounded"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {renderPagination()}
          </div>
        )}

        {isModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white p-5 rounded-lg w-96 relative max-h-[90vh] overflow-y-auto">
              <h2 className="text-lg font-bold text-center">Add Blog</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-3 right-3 text-red-500 text-xl"
              >
                ×
              </button>
              <form onSubmit={handleSubmit} className="mt-4">
                <input
                  name="name"
                  value={blogData.name}
                  onChange={handleInputChange}
                  className="w-full border p-2 mb-2 rounded"
                  placeholder="Blog Name"
                  required
                />

                <input
                  type="file"
                  onChange={handleImageChange}
                  className="w-full border p-2 mb-2"
                />
                {imagePreview && <img src={imagePreview} alt="Preview" className="h-16 mx-auto" />}

                <textarea
                  name="description"
                  value={blogData.description}
                  onChange={handleInputChange}
                  className="w-full border p-2 mb-2 rounded"
                  placeholder="Blog Description"
                  required
                />

                <div className="border p-2 rounded-md mb-2">
                  <p className="font-semibold mb-1">Select Categories:</p>
                  {renderCategoryTree(categories)}
                </div>

                <select
                  name="status"
                  value={blogData.status}
                  onChange={handleInputChange}
                  className="w-full border p-2 mb-2 rounded"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>

                <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded w-full mt-2">
                  Add Blog
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }