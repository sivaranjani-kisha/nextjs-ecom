"use client";

import React, { useEffect, useState } from "react";
import ReactPaginate from "react-paginate";
import { FaPlus, FaMinus, FaEdit } from "react-icons/fa";
import DateRangePicker from '@/components/DateRangePicker';
import EditProductModal from "./EditProductModal";
import { Icon } from '@iconify/react';
import Link from 'next/link';

export default function CategoryComponent() {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
const [SelectedProduct, setSelectedProduct ] = useState("");
  //  Filter
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFilter, setDateFilter] = useState('');

  const [showAlert, setShowAlert] = useState(false);

  const [showEditModal, setShowEditModal] = useState(false);
const [editingProduct, setEditingProduct] = useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 5; // 5 records per page

  // Fetch categories from API
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

  
// Add this function to handle edit click
const handleEditProduct = (product) => {
  console.log("handleEditProduct called for product:", product);
  setSelectedProduct(product);
  setShowEditModal(true);
  setEditingProduct(product._id);
  console.log("showEditModal after setting:", true);
};

  // Handle page change
  const handlePageClick = ({ selected }) => {
    setCurrentPage(selected);
  };
 const handleDateChange = ({ startDate, endDate }) => {
    setDateFilter({ startDate, endDate });
    setCurrentPage(1); // Reset to first page when date changes
  };

  // Handle category deletion 
  const handleDeleteProduct = async (categoryId) => {
    try {
      const response = await fetch("/api/categories/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categoryId }),
      });

      const result = await response.json();
      if (response.ok) {
        setSuccessMessage("Category and subcategories set to inactive.");
        setShowSuccessModal(true); // Show success modal
        fetchProducts(); // Refresh the list
      } else {
        console.error("Error:", result.error);
        alert("Failed to delete category.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred.");
    } finally {
      setShowConfirmationModal(false);
      setProductToDelete(null);
    }
  };

   const clearDateFilter = () => {
    setDateFilter({
      startDate: null,
      endDate: null
    });
    setCurrentPage(1);
  };

   // Handle page change
  const paginate = (pageIndex) => {
    if (pageIndex >= 0 && pageIndex < pageCount) {
      setCurrentPage(pageIndex);
    }
  };


  // Flatten category tree for pagination
  const flattenProducts = (products, level = 0, result = []) => {
    products
      .filter((product) => product.item_code != 'none')
      .forEach((product) => {
        result.push({ ...product, level });
      });
    return result;
  };

  // Render category rows with pagination
  const renderfilteredProductRows = () => {
    const flattenedProducts= flattenProducts(products);
    const filteredProducts = flattenedProducts.filter((product) => {
    const matchesSearch =
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (product.slug && product.slug.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesStatus =
        statusFilter === "" || product.status.toLowerCase() === statusFilter.toLowerCase();

        // Apply date filter
  let matchesDate = true;
  if (dateFilter.startDate && dateFilter.endDate && product.createdAt) {
    const orderDate = new Date(product.createdAt);
    const startDate = new Date(dateFilter.startDate);
    const endDate = new Date(dateFilter.endDate);
    matchesDate = orderDate >= startDate && orderDate <= endDate;
  }

      return matchesSearch && matchesStatus && matchesDate;
    });

    return filteredProducts
      .slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage)
      .map((product, index) => (
        <tr key={product._id} className="text-center border-b">
         <td className="p-2 text-center align-middle">
          <a
            href={`/admin/product/${product.slug}`}
            className="block mx-auto text-center truncate max-w-xs text-sm  hover:underline"
            title={product.name} // Tooltip for full name
          >
            {product.name}
          </a>
        </td>

          <td className="p-2">{product.price}</td>
          <td className="p-2">{product.special_price}</td>
          <td className="p-2">{product.quantity}</td>
          {/* <td className="p-2">
        {product.hasVariants ? (
          product.variants && product.variants[0]?.attributes?.length ? (
            <span className="text-green-500">{product.variants[0].attributes.length}</span>
          ) : (
            <span className="text-red-500">No attributes</span>
          )
        ) : (
          <span className="text-red-500">0 variants</span>
        )}
      </td> */}
          <td className="p-2 font-semibold">
            {product.status === "Active" ? (
              <span className="bg-green-100 text-green-600 px-6 py-1.5 rounded-full font-medium text-sm">Active</span>
            ) : (
              <span className="bg-red-100 text-red-600 px-6 py-1.5 rounded-full font-medium text-sm">Inactive</span>
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

   const flattenedProducts= flattenProducts(products);
    const filteredProducts = flattenedProducts.filter((product) => {
    const matchesSearch =
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (product.slug && product.slug.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesStatus =
        statusFilter === "" || product.status.toLowerCase() === statusFilter.toLowerCase();

       // Apply date filter
  let matchesDate = true;
  if (dateFilter.startDate && dateFilter.endDate && product.createdAt) {
    const orderDate = new Date(product.createdAt);
    const startDate = new Date(dateFilter.startDate);
    const endDate = new Date(dateFilter.endDate);
    matchesDate = orderDate >= startDate && orderDate <= endDate;
  }

      return matchesSearch && matchesStatus && matchesDate;
    });

  const pageCount = Math.ceil(filteredProducts.length / itemsPerPage);

  

  return (
    <div className="container mx-auto p-4">
      {/* Alert Message */}
      {showAlert && (
        <div className="bg-green-500 text-white px-4 py-2 rounded-md mb-4">
          {alertMessage}
        </div>
      )}

      <div className="flex justify-between items-center mb-5">
        <h2 className="text-2xl font-bold">Product List</h2>
      </div>

      {isLoading ? (
        <p>Loading Products...</p>
      ) : (
        <div className="bg-white shadow-md rounded-lg p-5 h-[500px] overflow-x-auto">
          {/* Search and Add Category */}
  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end mb-4">
  {/* Search Filter */}
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
    <input
      type="text"
      placeholder="Search Product..."
      value={searchQuery}
      onChange={(e) => {
        setSearchQuery(e.target.value);
        setCurrentPage(1);
      }}
      className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
    />
  </div>

  {/* Status Filter */}
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
    <select
      value={statusFilter}
      onChange={(e) => {
        setStatusFilter(e.target.value);
        setCurrentPage(1);
      }}
      className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
    >
      <option value="">All Statuses</option>
      <option value="Active">Active</option>
      <option value="Inactive">Inactive</option>
    </select>
  </div>

  {/* Date Range Picker */}
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
    <div className="flex items-center gap-2">
      <div className="flex-1">
        <DateRangePicker onDateChange={handleDateChange} />
      </div>
      {/* Optional clear button */}
      {/* {(dateFilter.startDate || dateFilter.endDate) && (
        <button
          onClick={clearDateFilter}
          className="p-2 text-sm text-red-600 hover:text-red-800 bg-red-50 rounded-md"
          title="Clear date filter"
        >
          <Icon icon="mdi:close-circle-outline" className="w-5 h-5" />
        </button>
      )} */}
    </div>
  </div>

  {/* Add Product Button */}
  <div className="flex justify-end">
    <Link
      href="/admin/product/create"
      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium shadow-sm transition duration-150"
    >
      + Add Product
    </Link>
  </div>
</div>


          <hr className="border-t border-gray-200 mb-4" />

          {/* Categories Table */}
          <table className="w-full border border-gray-300">
            <thead>
              <tr className="bg-gray-200">
                <th className="p-2">Name</th>
                <th className="p-2">Price</th>
                <th className="p-2 whitespace-nowrap">Spl Price</th>
                <th className="p-2">Quantity</th>
                {/* <th className="p-2">inventory</th> */}
                <th className="p-2">Status</th>
                <th className="p-2">Action</th>
              </tr>
            </thead>
             <tbody>
              {filteredProducts.length > 0 ? (
                renderfilteredProductRows()
              ) : (
                <tr>
                  <td colSpan="6" className="text-center p-4">
                    No Products found
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="flex justify-between items-center mt-6 flex-wrap gap-3">
            <div className="text-sm text-gray-600">
              Showing {Math.min(currentPage * itemsPerPage + 1, filteredProducts.length)} to{" "}
              {Math.min((currentPage + 1) * itemsPerPage,filteredProducts.length)} of{" "}
              {filteredProducts.length} entries
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

              {Array.from({ length: pageCount }, (_, i) => {
  const isFirst = i === 0;
  const isLast = i === pageCount - 1;
  const isNearCurrent = Math.abs(currentPage - i) <= 1;

  if (isFirst || isLast || isNearCurrent) {
    return (
      <button
        key={i}
        onClick={() => paginate(i)}
        className={`px-3 py-1.5 border border-gray-300 rounded-md ${
          currentPage === i
            ? "bg-blue-500 text-white"
            : "text-black bg-white hover:bg-gray-100"
        }`}
        aria-label={`Page ${i + 1}`}
        aria-current={currentPage === i ? "page" : undefined}
      >
        {i + 1}
      </button>
    );
  }

  // Add ellipsis only once between distant buttons
  if (
    (i === currentPage - 2 && i > 1) ||
    (i === currentPage + 2 && i < pageCount - 2)
  ) {
    return (
      <span key={`ellipsis-${i}`} className="px-2 text-gray-500">
        ...
      </span>
    );
  }

  return null;
})}


              <button
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === pageCount - 1}
                className={`px-3 py-1.5 border border-gray-300 rounded-md ${
                  currentPage === pageCount - 1
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


    

      {/* Confirmation Modal */}
      {showConfirmationModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-xl font-bold mb-4">Delete Product</h2>
            <p className="mb-4">Are you sure you want to delete this Product?</p>

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


      {showEditModal && SelectedProduct && (
  <EditProductModal
    product={SelectedProduct}
    onClose={() => {
      setShowEditModal(false);
      setEditingProduct(null);
      setSelectedProduct(null);
      fetchProducts();
    }}
  />
)}

    </div>
  );
}