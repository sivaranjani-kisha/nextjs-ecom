"use client";

import React, { useState, useEffect } from "react";
import { FaPlus, FaMinus } from "react-icons/fa";
import Select from "react-select";
import { Icon } from '@iconify/react';

export default function OfferComponent() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState("");
  const [selectedOfferType, setSelectedOfferType] = useState("");
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [expanded, setExpanded] = useState({});
  const [offers, setOffers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [offerData, setOfferData] = useState({
    offer_code: "",
    fest_offer_status: "",
    notes: "",
    from_date: "",
    to_date: "",
    offer_product_category: "",
    offer_product: [],
    offer_category: [],
    offer_type: "",
    percentage: "",
    fixed_price: "",
  });

  // Search and Pagination states
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const CategoryTree = ({ 
    categories, 
    products, 
    handleChange, 
    offerData 
  }) => {
    const [expandedCategories, setExpandedCategories] = useState({});

    const toggleCategory = (categoryId) => {
      setExpandedCategories((prev) => ({
        ...prev,
        [categoryId]: !prev[categoryId],
      }));
    };

    const buildTree = (categories, parentId = "none") => {
      return categories
        .filter((category) => category.parentid === parentId)
        .map((category) => ({
          ...category,
          children: buildTree(categories, category._id),
        }));
    };

    const categoryTree = buildTree(categories);

    const renderCategoryTree = (categories, level = 0) => {
      return categories.map((category) => (
        <div key={category._id} className={`ml-${level * 4} p-1`}>
          <div className="flex items-center cursor-pointer">
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
              name="offer_category"
              value={category._id}
              checked={offerData.offer_category.includes(category._id)}
              onChange={handleChange}
              className="mr-2"
            />
            <span className="font-semibold">{category.category_name}</span>
          </div>
          {expandedCategories[category._id] && (
            <>
              {renderCategoryTree(category.children, level + 1)}
            </>
          )}
        </div>
      ));
    };

    return <div className="border p-2 rounded-md">{renderCategoryTree(categoryTree)}</div>;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch products
        const productsResponse = await fetch("/api/product/get");
        if (!productsResponse.ok) {
          throw new Error("Failed to fetch products");
        }
        const productsData = await productsResponse.json();
        setProducts(productsData);

        // Fetch categories
        const categoriesResponse = await fetch("/api/categories/get");
        if (!categoriesResponse.ok) {
          throw new Error("Failed to fetch categories");
        }
        const categoriesData = await categoriesResponse.json();
        setCategories(categoriesData);

        // Fetch offers
        const offersResponse = await fetch("/api/offers/get");
        if (!offersResponse.ok) {
          throw new Error("Failed to fetch offers");
        }
        const offersData = await offersResponse.json();
        setOffers(offersData.data);
      } catch (error) {
        console.error("Error fetching data:", error);
        setAlertMessage("Failed to fetch data");
        setAlertType("error");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === "checkbox") {
      if (name === "offer_category") {
        const categoryId = value;
        const allCategories = getAllSubcategories(categoryId);

        setOfferData((prev) => ({
          ...prev,
          offer_category: checked
            ? [...prev.offer_category, ...allCategories]
            : prev.offer_category.filter((item) => !allCategories.includes(item)),
        }));
      }
    } else {
      setOfferData({ ...offerData, [name]: value });
    }
  };

  const handleDelete = async (offerId) => {
    try {
      const response = await fetch("/api/offers/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: offerId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete offer");
      }

      setAlertMessage("Offer deleted successfully!");
      setAlertType("success");
      setTimeout(() => setAlertMessage(""), 3000);

      // Refresh offers list after deletion
      const offersResponse = await fetch("/api/offers/get");
      if (!offersResponse.ok) {
        throw new Error("Failed to refresh offers list");
      }
      const offersData = await offersResponse.json();
      setOffers(offersData.data);
    } catch (error) {
      console.error("Error:", error);
      setAlertMessage(error.message || "Failed to delete offer");
      setAlertType("error");
      setTimeout(() => setAlertMessage(""), 3000);
    }
  };

  const getAllSubcategories = (categoryId) => {
    const category = categories.find((cat) => cat._id === categoryId);
    if (!category) return [categoryId];

    const subcategories = categories
      .filter((cat) => cat.parentid === categoryId)
      .flatMap((cat) => getAllSubcategories(cat._id));

    return [categoryId, ...subcategories];
  };

  const validateForm = () => {
    if (!offerData.offer_product_category) {
      setAlertMessage("Please select whether to apply to products or categories");
      setAlertType("error");
      return false;
    }

    if (offerData.offer_product_category === "product" && offerData.offer_product.length === 0) {
      setAlertMessage("Please select at least one product");
      setAlertType("error");
      return false;
    }

    if (offerData.offer_product_category === "category" && offerData.offer_category.length === 0) {
      setAlertMessage("Please select at least one category");
      setAlertType("error");
      return false;
    }

    if (!offerData.offer_type) {
      setAlertMessage("Please select an offer type");
      setAlertType("error");
      return false;
    }

    if (offerData.offer_type === "percentage" && !offerData.percentage) {
      setAlertMessage("Please enter a percentage value");
      setAlertType("error");
      return false;
    }

    if (offerData.offer_type === "fixed_price" && !offerData.fixed_price) {
      setAlertMessage("Please enter a fixed price");
      setAlertType("error");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      setTimeout(() => setAlertMessage(""), 3000);
      return;
    }

    try {
      const formattedData = {
        ...offerData,
        from_date: new Date(offerData.from_date),
        to_date: new Date(offerData.to_date),
      };

      const response = await fetch("/api/offers/post", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formattedData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Server error: ${response.status} ${response.statusText} - ${errorText}`
        );
      }

      const data = await response.json();
      setAlertMessage("Offer created successfully!");
      setAlertType("success");
      setTimeout(() => setAlertMessage(""), 3000);

      setIsModalOpen(false);
      setOfferData({
        offer_code: "",
        fest_offer_status: "",
        notes: "",
        from_date: "",
        to_date: "",
        offer_product_category: "",
        offer_product: [],
        offer_category: [],
        offer_type: "",
        percentage: "",
        fixed_price: "",
      });

      // Refresh offers list
      const offersResponse = await fetch("/api/offers/get");
      if (!offersResponse.ok) {
        throw new Error("Failed to refresh offers list");
      }
      const offersData = await offersResponse.json();
      setOffers(offersData.data);
    } catch (error) {
      console.error("Error:", error);
      setAlertMessage(error.message || "Failed to create offer");
      setAlertType("error");
      setTimeout(() => setAlertMessage(""), 3000);
    }
  };

  // Search functionality
  const filteredOffers = offers.filter((offer) =>
    offer.offer_code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredOffers.slice(indexOfFirstItem, indexOfLastItem);
  const startEntry = (currentPage - 1) * itemsPerPage + 1;
  const endEntry = Math.min(currentPage * itemsPerPage, filteredOffers.length);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="container mx-auto">
      <div className="flex justify-between items-center mb-5 mt-5">
        <h2 className="text-2xl font-bold">Offer List</h2>
      </div>
      {alertMessage && (
        <div
          className={`mb-4 p-3 rounded-md ${
            alertType === "success" ? "bg-green-500" : "bg-red-500"
          } text-white`}
        >
          {alertMessage}
        </div>
      )}

      {isLoading ? (
        <p>Loading offers...</p>
      ) : (
        <div className="bg-white shadow-md rounded-lg p-5 overflow-x-auto">
          <div className="flex justify-between items-center mb-5">
            {/* Search Box */}
            <div>
              <input
                type="text"
                placeholder="Search Offer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border px-3 py-2 rounded-md w-64"
              />
            </div>

            {/* Add Offer Button */}
            <div>
              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-blue-500 text-white px-4 py-2 rounded-md"
              >
                + Add Offer
              </button>
            </div>
          </div>
          <hr className="border-t border-gray-200 mb-4" />
          <table className="w-full border border-gray-300">
            <thead>
              <tr className="bg-gray-200">
                <th className="p-2">Offer Code</th>
                <th className="p-2">From</th>
                <th className="p-2">To</th>
                <th className="p-2">Type</th>
                <th className="p-2">Value</th>
                <th className="p-2">Status</th>
                <th className="p-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.length > 0 ? (
                currentItems.map((offer) => (
                  <tr key={offer._id} className="text-center border-b">
                    <td className="p-2 font-bold">{offer.offer_code}</td>
                    <td className="p-2">{offer.from_date.split("T")[0]}</td>
                    <td className="p-2">{offer.to_date.split("T")[0]}</td>
                    <td className="p-2">{offer.offer_type}</td>
                    <td className="p-2">
                      {offer.offer_type === "percentage"
                        ? `${offer.percentage}%`
                        : `₹${offer.fixed_price}`}
                    </td>
                    <td className="p-2 font-semibold">
                      {offer.fest_offer_status === "active" ? (
                        <span className="text-green-500">Active</span>
                      ) : (
                        <span className="text-red-500">Inactive</span>
                      )}
                    </td>
                    <td>
                      <div className="flex items-center gap-2 justify-center">
                        <button
                          onClick={() => {
                            handleDelete(offer._id);
                          }}
                          className="w-7 h-7 bg-pink-100 text-pink-600 rounded-full inline-flex items-center justify-center"
                          title="Delete"
                        >
                          <Icon icon="mingcute:delete-2-line" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="p-3 text-center">
                    No offers available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <div className="flex justify-between items-center mt-4">
            {/* Left side: Entry text */}
            <div className="text-sm text-gray-600">
              Showing {startEntry} to {endEntry} of {filteredOffers.length} entries
            </div>

            {/* Right side: Pagination */}
            <div className="pagination flex items-center space-x-1">
              <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-3 py-1.5 border border-gray-300 rounded-md ${
                  currentPage === 1
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-black bg-white hover:bg-gray-100"
                }`}
                aria-label="Previous page"
              >
                «
              </button>

              {Array.from(
                { length: Math.ceil(filteredOffers.length / itemsPerPage) },
                (_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => paginate(i + 1)}
                    className={`px-3 py-1.5 border border-gray-300 rounded-md ${
                      currentPage === i + 1
                        ? "bg-blue-500 text-white"
                        : "text-black bg-white hover:bg-gray-100"
                    }`}
                    aria-label={`Page ${i + 1}`}
                    aria-current={currentPage === i + 1 ? "page" : undefined}
                  >
                    {i + 1}
                  </button>
                )
              )}

              <button
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === Math.ceil(filteredOffers.length / itemsPerPage)}
                className={`px-3 py-1.5 border border-gray-300 rounded-md ${
                  currentPage === Math.ceil(filteredOffers.length / itemsPerPage)
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

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-lg w-full max-w-3xl mx-4 max-h-[90vh] flex flex-col">
            {/* Header with bottom border and close button */}
            <div className="flex justify-between items-center border-b-2 border-gray-300 px-6 py-4">
              <h2 className="text-xl font-semibold text-gray-900">Create Festival Offer</h2>
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

            {/* Scrollable body */}
            <div className="px-6 py-6 overflow-y-auto flex-grow">
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Offer Code */}
                <div>
                  <label htmlFor="offer_code" className="block mb-1 text-sm font-semibold text-gray-700">
                    Offer Code
                  </label>
                  <input
                    type="text"
                    name="offer_code"
                    id="offer_code"
                    value={offerData.offer_code}
                    onChange={handleChange}
                    className="w-full rounded-md border border-gray-300 p-2 focus:ring-2 focus:ring-blue-400"
                    required
                  />
                </div>

                {/* Offer Status */}
                <div>
                  <label htmlFor="fest_offer_status" className="block mb-1 text-sm font-semibold text-gray-700">
                    Offer Status
                  </label>
                  <select
                    name="fest_offer_status"
                    id="fest_offer_status"
                    value={offerData.fest_offer_status}
                    onChange={handleChange}
                    className="w-full rounded-md border border-gray-300 p-2 focus:ring-2 focus:ring-blue-400"
                    required
                  >
                    <option value="">Select Your Offer Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                {/* Note */}
                <div>
                  <label htmlFor="notes" className="block mb-1 text-sm font-semibold text-gray-700">
                    Note
                  </label>
                  <input
                    type="text"
                    name="notes"
                    id="notes"
                    value={offerData.notes}
                    onChange={handleChange}
                    className="w-full rounded-md border border-gray-300 p-2 focus:ring-2 focus:ring-blue-400"
                    required
                  />
                </div>

                {/* Date Range */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="from_date" className="block mb-1 text-sm font-semibold text-gray-700">
                      From Date
                    </label>
                    <input
                      type="date"
                      name="from_date"
                      id="from_date"
                      value={offerData.from_date}
                      onChange={handleChange}
                      className="w-full rounded-md border border-gray-300 p-2 focus:ring-2 focus:ring-blue-400"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="to_date" className="block mb-1 text-sm font-semibold text-gray-700">
                      To Date
                    </label>
                    <input
                      type="date"
                      name="to_date"
                      id="to_date"
                      value={offerData.to_date}
                      onChange={handleChange}
                      className="w-full rounded-md border border-gray-300 p-2 focus:ring-2 focus:ring-blue-400"
                      required
                    />
                  </div>
                </div>

                {/* Apply Offer To */}
                <div>
                  <label htmlFor="offer_product_category" className="block mb-1 text-sm font-semibold text-gray-700">
                    Apply Offer To
                  </label>
                  <select
                    name="offer_product_category"
                    id="offer_product_category"
                    value={offerData.offer_product_category}
                    onChange={(e) => {
                      handleChange(e);
                      setOfferData(prev => ({
                        ...prev,
                        offer_product: [],
                        offer_category: [],
                        [e.target.name]: e.target.value
                      }));
                    }}
                    className="w-full rounded-md border border-gray-300 p-2 focus:ring-2 focus:ring-blue-400"
                    required
                  >
                    <option value="">Select Apply To</option>
                    <option value="product">Specific Products</option>
                    <option value="category">Product Categories</option>
                  </select>
                </div>

                {/* Products Selection */}
                {offerData.offer_product_category === "product" && (
                  <div>
                    <label className="block mb-1 text-sm font-semibold text-gray-700">
                      Select Products
                    </label>
                    <Select
                      options={products.map(product => ({
                        value: product._id,
                        label: product.name
                      }))}
                      isMulti
                      placeholder="Search and select products..."
                      value={offerData.offer_product.map(p => ({
                        value: p,
                        label: products.find(prod => prod._id === p)?.name || p
                      }))}
                      onChange={(selectedOptions) => {
                        const selectedValues = selectedOptions.map(option => option.value);
                        setOfferData(prev => ({
                          ...prev,
                          offer_product: selectedValues
                        }));
                      }}
                      className="mt-1"
                      classNamePrefix="select"
                      styles={{
                        control: (base) => ({
                          ...base,
                          borderColor: '#d1d5db',
                          borderRadius: '0.375rem',
                          minHeight: '42px',
                          '&:hover': {
                            borderColor: '#d1d5db'
                          }
                        })
                      }}
                    />
                  </div>
                )}

                {/* Category Tree */}
                {offerData.offer_product_category === "category" && (
                  <div>
                    <label className="block mb-1 text-sm font-semibold text-gray-700">
                      Select Categories
                    </label>
                    <div className="border border-gray-300 rounded-md max-h-40 overflow-y-auto p-2">
                      <CategoryTree 
                        categories={categories} 
                        products={products} 
                        handleChange={handleChange} 
                        offerData={offerData}
                      />
                    </div>
                  </div>
                )}

                {/* Offer Type */}
                <div>
                  <label htmlFor="offer_type" className="block mb-1 text-sm font-semibold text-gray-700">
                    Offer Type
                  </label>
                  <select
                    name="offer_type"
                    id="offer_type"
                    value={offerData.offer_type}
                    onChange={(e) => {
                      handleChange(e);
                      setSelectedOfferType(e.target.value);
                    }}
                    className="w-full rounded-md border border-gray-300 p-2 focus:ring-2 focus:ring-blue-400"
                    required
                  >
                    <option value="">Select Offer Type</option>
                    <option value="percentage">Percentage</option>
                    <option value="fixed_price">Fixed Price</option>
                  </select>
                </div>

                {/* Percentage Input */}
                {selectedOfferType === "percentage" && (
                  <div>
                    <label htmlFor="percentage" className="block mb-1 text-sm font-semibold text-gray-700">
                      Percentage (%)
                    </label>
                    <input
                      type="number"
                      name="percentage"
                      id="percentage"
                      value={offerData.percentage}
                      onChange={handleChange}
                      className="w-full rounded-md border border-gray-300 p-2 focus:ring-2 focus:ring-blue-400"
                      required
                      min="1"
                      max="100"
                    />
                  </div>
                )}

                {/* Fixed Price Input */}
                {selectedOfferType === "fixed_price" && (
                  <div>
                    <label htmlFor="fixed_price" className="block mb-1 text-sm font-semibold text-gray-700">
                      Fixed Price (₹)
                    </label>
                    <input
                      type="number"
                      name="fixed_price"
                      id="fixed_price"
                      value={offerData.fixed_price}
                      onChange={handleChange}
                      className="w-full rounded-md border border-gray-300 p-2 focus:ring-2 focus:ring-blue-400"
                      required
                      min="1"
                    />
                  </div>
                )}

                {/* Submit Button */}
                <div className="pt-4">
                  <button
                    type="submit"
                    className="inline-block bg-blue-600 text-white px-5 py-2 rounded-md text-sm font-semibold hover:bg-blue-700 transition"
                  >
                    Save Offer
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}