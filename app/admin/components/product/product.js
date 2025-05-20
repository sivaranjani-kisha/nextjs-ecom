"use client";

import React, { useEffect, useState } from "react";
import { FaPlus, FaMinus, FaEdit,  FaArrowRight,  FaArrowLeft } from "react-icons/fa";
import { ToastContainer, toast } from 'react-toastify';
import ReactPaginate from "react-paginate";
import dynamic from 'next/dynamic';
const Select = dynamic(() => import('react-select'), { ssr: false });
import Link from 'next/link';
import { Icon } from '@iconify/react';

export default function ProductComponent() { // Changed from CategoryComponent to ProductComponent
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  

  // Edit Modal
  const [editingProduct, setEditingProduct] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);


  // Pagination state
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 5;

  // Fetch products from API
  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/product/get");
      const data = await response.json();
      setProducts(data);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching products:", error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  
  // Open edit modal with product data
  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setShowEditModal(true);
  };

  // Handle page change
  const handlePageClick = ({ selected }) => {
    setCurrentPage(selected);
  };

  // Handle product deletion 
  const handleDeleteProduct = async (productId) => { // Changed parameter name from categoryId to productId
    try {
      const response = await fetch("/api/product/delete", { // Changed API endpoint
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }), // Changed from categoryId to productId
      });

      const result = await response.json();
      if (response.ok) {
        setSuccessMessage("Product has been deleted successfully.");
        setShowSuccessModal(true);
        fetchProducts();
      } else {
        console.error("Error:", result.error);
        alert("Failed to delete product.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred.");
    } finally {
      setShowConfirmationModal(false);
      setProductToDelete(null);
    }
  };

  // Flatten product list for pagination
  const flattenProducts = (products, result = []) => {
    products
      .filter((product) => product.item_code !== 'none')
      .forEach((product) => {
        result.push(product);
      });
    return result;
  };

  // Filter products based on search query
  const filteredProducts = flattenProducts(products).filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (product.slug && product.slug.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Pagination calculations
  const pageCount = Math.ceil(filteredProducts.length / itemsPerPage);
  const totalEntries = filteredProducts.length;
  const startEntry = currentPage * itemsPerPage + 1;
  const endEntry = Math.min((currentPage + 1) * itemsPerPage, totalEntries);

  // Render product rows with pagination
  const renderProductRows = () => {
    return filteredProducts
      .slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage)
      .map((product) => (
        <tr key={product._id} className="text-center border-b">
          <td className="p-2 font-bold flex items-center justify-center">
            {product.name.length > 30 ? `${product.name.slice(0, 30)}...` : product.name}
          </td>
          <td className="p-2">{product.price}</td>
          <td className="p-2">{product.special_price}</td>
          <td className="p-2">{product.quantity}</td>
          <td className="p-2">
            {product.hasVariants ? (
              product.variants && product.variants[0]?.attributes?.length ? (
                <span className="text-green-500">{product.variants[0].attributes.length}</span>
              ) : (
                <span className="text-red-500">No attributes</span>
              )
            ) : (
              <span className="text-red-500">0 variants</span>
            )}
          </td>
          <td className="p-2 font-semibold">
            {product.status === "Active" ? (
              <span className="text-green-500">Active</span>
            ) : (
              <span className="text-red-500">Inactive</span>
            )}
          </td>
          <td>
            <div className="flex items-center gap-2 justify-center">
               <button
              onClick={() => handleEditProduct(product)}
              className="w-7 h-7 bg-blue-100 text-blue-600 rounded-full inline-flex items-center justify-center"
               title="Edit"
            >
              <FaEdit className="w-3 h-3" />
            </button>
              <button
                onClick={() => {
                  setProductToDelete(product._id);
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
      <div className="flex justify-between items-center mb-5 mt-5">
        <h2 className="text-2xl font-bold">Product List</h2>
      </div>

      {isLoading ? (
        <p>Loading Products...</p>
      ) : (
        <div className="bg-white shadow-md rounded-lg p-5 overflow-x-auto">
          <div className="flex justify-between items-center mb-5">
            <input
              type="text"
              placeholder="Search Product..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border px-3 py-2 rounded-md w-64"
            />
            <div className="flex gap-4">
              <Link href="/admin/product/create" className="bg-blue-500 text-white px-4 py-2 rounded-md">
                + Add Product
              </Link>
            </div>
          </div>
          
          <table className="w-full border border-gray-300">
            <thead>
              <tr className="bg-gray-200">
                <th className="p-2">Name</th>
                <th className="p-2">Price</th>
                <th className="p-2">Spl Price</th>
                <th className="p-2">Quantity</th>
                <th className="p-2">Inventory</th>
                <th className="p-2">Status</th>
                <th className="p-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length > 0 ? (
                renderProductRows()
              ) : (
                <tr>
                  <td colSpan="7" className="text-center p-4">
                    No Products found
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          <div className="flex justify-between items-center mt-4">
            <div className="text-sm text-gray-600">
              Showing {startEntry} to {endEntry} of {totalEntries} entries
            </div>

            <ReactPaginate
              previousLabel={"«"}
              nextLabel={"»"}
              breakLabel={"..."}
              pageCount={pageCount}
              marginPagesDisplayed={2}
              pageRangeDisplayed={5}
              onPageChange={handlePageClick}
              containerClassName={"flex items-center space-x-1"}
              pageClassName={"page-item"}
              pageLinkClassName={
                "px-3 py-1.5 border border-gray-300 rounded-md bg-white text-black hover:bg-gray-100"
              }
              activeClassName={"bg-blue-500 text-white"}
              activeLinkClassName={"!bg-blue-500 !text-white"}
              previousClassName={"page-item"}
              previousLinkClassName={
                "px-3 py-1.5 border border-gray-300 rounded-md bg-white text-black hover:bg-gray-100"
              }
              nextClassName={"page-item"}
              nextLinkClassName={
                "px-3 py-1.5 border border-gray-300 rounded-md bg-white text-black hover:bg-gray-100"
              }
              breakClassName={"page-item"}
              breakLinkClassName={
                "px-3 py-1.5 border border-gray-300 rounded-md bg-white text-black"
              }
            />
          </div>
        </div>
      )}

        {/* Edit Product Modal */}
      {showEditModal && editingProduct && (
        <EditProductModal 
          product={editingProduct} 
          onClose={() => setShowEditModal(false)} 
          onUpdate={() => {
            fetchProducts(); // Refresh the list after update
            setShowEditModal(false);
          }}
        />
      )}

      {/* Confirmation Modal */}
      {showConfirmationModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-xl font-bold mb-4">Delete Product</h2>
            <p className="mb-4">Are you sure you want to delete this product?</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowConfirmationModal(false)}
                className="bg-gray-300 px-4 py-2 rounded-md"
              >
                No, Close
              </button>
              <button
                onClick={() => handleDeleteProduct(productToDelete)}
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

// Edit Product Modal Component
function EditProductModal({ product, onClose, onUpdate }) {
 const [formData, setFormData] = useState({
  ...product,
  filters: product.filters || [],
  featured_products: product.featured_products || [],
  product_highlights: product.product_highlights || []
});
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [filters, setFilters] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [expandedCategories, setExpandedCategories] = useState({});
  const [selectedCategory, setSelectedCategory] = useState(product.category || "");

  const steps = [
    { title: "Basic Information" },
    { title: "Images & Description" },
    { title: "Variants & Filters" },
    { title: "Others" },
  ];

  // Fetch necessary data for the form
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch categories
        const categoriesRes = await fetch("/api/categories/get");
        const categoriesData = await categoriesRes.json();
        setCategories(buildCategoryTree(categoriesData));

        // Fetch brands
        const brandsRes = await fetch("/api/brand");
        const brandsData = await brandsRes.json();
        setBrands(brandsData.data.map(brand => ({
          value: brand._id,
          label: brand.brand_name
        })));

        // Fetch filters
        const filtersRes = await fetch("/api/filter");
        const filtersData = await filtersRes.json();
        setFilters(filtersData.data.map(filter => ({
          value: filter._id,
          label: filter.filter_name
        })));

        // Fetch all products for related products
        const productsRes = await fetch("/api/product/get");
        const productsData = await productsRes.json();
        setAllProducts((productsData?.data || []).map(prod => ({
          value: prod._id,
          label: prod.name
        })));
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
      slug: name === "name" 
        ? value.toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-") 
        : prev.slug,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(`/api/product/update`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          category: selectedCategory
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Product updated successfully");
        onUpdate();
      } else {
        toast.error(data.error || "Failed to update product");
      }
    } catch (error) {
      toast.error("An error occurred while updating the product");
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle category expansion
  const toggleCategory = (id) => {
    setExpandedCategories(prev => ({
      ...prev,
      [id]: !prev[id],
    }));
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

  // Handle category selection
  const handleCategoryChange = (category) => {
    setSelectedCategory(category._id);
  };

  // Render category tree
  const renderCategoryTree = (categories, level = 0) => {
    return categories.map((category) => (
      <div key={category._id} style={{ paddingLeft: `${level * 20}px` }}>
        <div className="flex items-center cursor-pointer p-2 text-sm font-medium text-gray-700">
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
          {category.children.length == 0 && (
            <input
              type="checkbox"
              name="category"
              value={category._id}
              checked={selectedCategory === category._id}
              onChange={() => handleCategoryChange(category)}
              className="mr-2"
            />
          )}
          <span
            className={`font-medium ${
              selectedCategory === category._id ? "text-blue-500" : "text-gray-700"
            }`}
          >
            {category.category_name}
          </span>
        </div>
        {expandedCategories[category._id] && 
          renderCategoryTree(category.children, level + 1)}
      </div>
    ));
  };

  // Handle brand selection
  const handleBrandChange = (selectedOption) => {
    setFormData(prev => ({
      ...prev,
      brand: selectedOption.value,
    }));
  };

  // Handle filter selection
  const handleFilterChange = (selectedOptions) => {
    setFormData(prev => ({
      ...prev,
      filters: selectedOptions.map(option => option.value),
    }));
  };

  // Handle featured products selection
  const handleFeaturedChange = (selectedOptions) => {
    setFormData(prev => ({
      ...prev,
      featured_products: selectedOptions.map(option => option.value),
    }));
  };

  // Handle product highlights changes
  const handleHighlightChange = (index, value) => {
    const updatedHighlights = [...formData.product_highlights];
    updatedHighlights[index] = value;
    setFormData({ ...formData, product_highlights: updatedHighlights });
  };

  const addHighlight = () => {
    setFormData({ 
      ...formData, 
      product_highlights: [...formData.product_highlights, ''] 
    });
  };

  const removeHighlight = (index) => {
    const updatedHighlights = formData.product_highlights.filter((_, i) => i !== index);
    setFormData({ ...formData, product_highlights: updatedHighlights });
  };

  // Navigation between steps
  const nextStep = () => {
    if (currentStep < steps.length) setCurrentStep(prev => prev + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(prev => prev - 1);
  };

  // Step navigation component
  const StepNavigation = () => (
    <div className="flex justify-between mt-6">
      {currentStep > 1 && (
        <button
          type="button"
          onClick={prevStep}
          className="bg-gray-200 px-4 py-2 rounded flex items-center gap-2"
        >
          <FaArrowLeft /> Previous
        </button>
      )}
      {currentStep < steps.length ? (
        <button
          type="button"
          onClick={nextStep}
          className="bg-blue-500 text-white px-4 py-2 rounded flex items-center gap-2"
        >
          Next <FaArrowRight />
        </button>
      ) : (
        <button
          type="submit"
          className="bg-green-500 text-white px-4 py-2 rounded"
          disabled={isLoading}
        >
          {isLoading ? "Updating..." : "Update Product"}
        </button>
      )}
    </div>
  );

  // Progress stepper component
  const ProgressStepper = () => (
    <div className="mb-8">
      <div className="border-b border-gray-200">
        <nav className="flex justify-between space-x-4">
          {steps.map((tab, index) => (
            <button
              type="button"
              key={index}
              className={`py-2 px-4 text-sm font-medium focus:outline-none ${
                currentStep-1 === index
                  ? "border-b-2 border-blue-500 text-blue-600"
                  : "text-gray-600 hover:text-blue-500"
              }`}
            >
              {tab.title}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-11/12 max-w-6xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Edit Product</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <ProgressStepper />
          <ToastContainer />

          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Product Name*</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full border p-2 rounded"
                    required
                  />
                </div>
          
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Item Code</label>
                  <input 
                    type="text" 
                    name="item_code" 
                    value={formData.item_code} 
                    onChange={handleChange} 
                    className="w-full border p-2 rounded" 
                    required 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-md mb-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Categories</label>
                  <div className="border rounded-md max-h-60 overflow-y-auto">
                    {renderCategoryTree(categories)}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
                  <Select
                    options={brands}
                    onChange={handleBrandChange}
                    value={brands.find(b => b.value === formData.brand)}
                    placeholder="Select brand..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">MRP Price</label>
                  <input 
                    type="number" 
                    name="price" 
                    value={formData.price} 
                    onChange={handleChange} 
                    className="w-full border p-2 rounded" 
                    required 
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Selling Price</label>
                  <input 
                    type="number" 
                    name="special_price" 
                    value={formData.special_price} 
                    onChange={handleChange} 
                    className="w-full border p-2 rounded" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                  <input 
                    type="number" 
                    name="quantity" 
                    value={formData.quantity} 
                    onChange={handleChange} 
                    className="w-full border p-2 rounded" 
                    required 
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stock Status</label>
                  <select
                    name="stock_status"
                    value={formData.stock_status}
                    onChange={handleChange}
                    className="w-full border p-2 rounded"
                  >
                    <option value="In Stock">In Stock</option>
                    <option value="Out of Stock">Out of Stock</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Images & Description */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea 
                  name="description" 
                  value={formData.description} 
                  onChange={handleChange} 
                  className="w-full border p-2 rounded" 
                  rows="4"
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Overview Description</label>
                <textarea 
                  name="overviewdescription" 
                  value={formData.overviewdescription} 
                  onChange={handleChange} 
                  className="w-full border p-2 rounded" 
                  rows="4"
                ></textarea>
              </div>
            </div>
          )}

          {/* Step 3: Variants & Filters */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="border p-4 rounded">
                <label className="block text-sm font-medium text-gray-700 mb-1">Filter</label>
                <Select
                  options={filters}
                  isMulti
                  onChange={handleFilterChange}
                  value={filters.filter(f => (formData.filters || []).includes(f.value))}
                  placeholder="Select filters..."
                />
              </div>
            </div>
          )}

          {/* Step 4: Others */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Meta Title</label>
                <input
                  type="text"
                  name="meta_title"
                  value={formData.meta_title}
                  onChange={handleChange}
                  className="w-full border p-2 rounded"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Key Specifications</label>
                <textarea 
                  name="key_specifications" 
                  value={formData.key_specifications} 
                  onChange={handleChange} 
                  className="w-full border p-2 rounded" 
                  rows="3"
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Highlights</label>
                {(formData.product_highlights ?? []).map((highlight, index) => (
                  <div key={index} className="flex space-x-2 mb-2">
                    <input
                      type="text"
                      value={highlight}
                      onChange={(e) => handleHighlightChange(index, e.target.value)}
                      className="w-full border p-2 rounded"
                      placeholder={`Highlight #${index + 1}`}
                    />
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <button 
                          type="button"  
                          onClick={addHighlight}  
                          className="inline-flex items-center p-2 border border-transparent rounded-full shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                        > 
                          <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" />
                          </svg> 
                        </button>
                      </div>
                      <div>
                        <button 
                          type="button" 
                          onClick={() => removeHighlight(index)} 
                          className="inline-flex items-center p-2 border border-transparent rounded-full shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                          <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd"/>
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Featured Products</label>
                <Select
                  isMulti
                  options={allProducts}
                  onChange={handleFeaturedChange}
                  value={allProducts.filter(option => 
                    (formData.featured_products|| []).includes(option.value)
                  )}
                  placeholder="Select products for featured..."
                  closeMenuOnSelect={false}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Warranty</label>
                <input
                  type="number"
                  name="warranty"
                  placeholder="Warranty"
                  value={formData.warranty}
                  onChange={handleChange}
                  className="w-full border p-2 rounded mb-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Extended Warranty</label>
                <input
                  type="number"
                  name="extended_warranty"
                  placeholder="Extended Warranty"
                  value={formData.extended_warranty}
                  onChange={handleChange}
                  className="w-full border p-2 rounded mb-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full border p-2 rounded"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>
          )}

          <StepNavigation />
        </form>
      </div>
    </div>
  );
}