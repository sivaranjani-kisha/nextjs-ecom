"use client";

import React, { useEffect, useState } from "react";
import { FaPlus, FaMinus, FaEdit } from "react-icons/fa";
import ReactPaginate from "react-paginate";
import { Icon } from '@iconify/react';
import dynamic from 'next/dynamic';
const Select = dynamic(() => import('react-select'), { ssr: false });
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function FilterComponent() {
  const [filters, setFilters] = useState([]);
  const [filterGroups, setFilterGroups] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [newFilter, setNewFilter] = useState({
    filter_name: "",
    status: "Active",
    filter_group: "",
    _id: null
  });
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [filterToDelete, setFilterToDelete] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 5;

  const fetchFilters = async () => {
    try {
      const response = await fetch("/api/filter");
      const data = await response.json();
      setFilters(data.data);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching filters:", error);
      setIsLoading(false);
    }
  };

  const fetchFilterGroups = async () => {
    try {
      const response = await fetch("/api/filter_group");
      const res = await response.json();
      const data = res.data;
      const groupOptions = data.map((group) => ({
        value: group._id,
        label: group.filtergroup_name,
      }));
      setFilterGroups(groupOptions);
    } catch (error) {
      console.error("Error fetching filter groups:", error);
    }
  };

  useEffect(() => {
    fetchFilters();
    fetchFilterGroups();
  }, []);

  const handlePageClick = ({ selected }) => {
    setCurrentPage(selected);
  };

  const handleInputChange = (e) => {
    setNewFilter({ ...newFilter, [e.target.name]: e.target.value });
  };

  const handleFilterGroupChange = (selectedOption) => {
    setNewFilter({
      ...newFilter,
      filter_group: selectedOption.value
    });
  };

  const handleAddFilter = async (e) => {
  e.preventDefault();

  const formData = new FormData();
formData.append("filter_name", newFilter.filter_name);
formData.append("status", newFilter.status);
formData.append("filter_group", newFilter.filter_group);

  if (newFilter._id) {
    formData.filterId = newFilter._id;
  }

  try {
    const url = newFilter._id 
      ? "/api/filter/update" 
      : "/api/filter/add";
      
   const response = await fetch("/api/filter/add", {
  method: "POST",
  body: formData,
  headers: { "Content-Type": "application/x-www-form-urlencoded" },
});

    const result = await response.json();
    if (response.ok) {
      setIsModalOpen(false);
      fetchFilters();
      setNewFilter({
        filter_name: "",
        status: "Active",
        filter_group: "",
        _id: null
      });
      setSuccessMessage(newFilter._id 
        ? "Filter updated successfully" 
        : "Filter added successfully");
      setShowSuccessModal(true);
    } else {
      console.error("Error:", result.error);
      toast.error(result.error);
    }
  } catch (error) {
    console.error("Error:", error);
    toast.error("An error occurred");
  }
};
// Add this useEffect hook near your other hooks
useEffect(() => {
  if (showSuccessModal) {
    const timer = setTimeout(() => {
      setShowSuccessModal(false);
    }, 2000); // 2000 milliseconds = 2 seconds

    return () => clearTimeout(timer); // Clean up the timer if the component unmounts
  }
}, [showSuccessModal]);
  // const handleAddFilter = async (e) => {
  //   e.preventDefault();

  //   const formData = new FormData();
  //   formData.append("filter_name", newFilter.filter_name);
  //   formData.append("status", newFilter.status);
  //   formData.append("filter_group", newFilter.filter_group);
    
  //   if (newFilter._id) {
  //     formData.append("filterId", newFilter._id);
  //   }

  //   try {
  //     const url = newFilter._id 
  //       ? "/api/filter/update" 
  //       : "/api/filter/add";
        
  //     const response = await fetch(url, {
  //       method: "POST",
  //       body: formData,
  //     });

  //     const result = await response.json();
  //     if (response.ok) {
  //       setIsModalOpen(false);
  //       fetchFilters();
  //       setNewFilter({
  //         filter_name: "",
  //         status: "Active",
  //         filter_group: "",
  //         _id: null
  //       });
  //       setSuccessMessage(newFilter._id 
  //         ? "Filter updated successfully" 
  //         : "Filter added successfully");
  //       setShowSuccessModal(true);
  //     } else {
  //       console.error("Error:", result.error);
  //       toast.error(result.error);
  //     }
  //   } catch (error) {
  //     console.error("Error:", error);
  //     toast.error("An error occurred");
  //   }
  // };

  const handleDeleteFilter = async (filterId) => {
    try {
      const response = await fetch("/api/filter/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filterId }),
      });

      const result = await response.json();
      if (response.ok) {
        setSuccessMessage("Filter deleted successfully");
        setShowSuccessModal(true);
        fetchFilters();
      } else {
        console.error("Error:", result.error);
        toast.error(result.error);
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("An error occurred");
    } finally {
      setShowConfirmationModal(false);
      setFilterToDelete(null);
    }
  };

  const handleEditFilter = (filter) => {
    setNewFilter({
      filter_name: filter.filter_name,
      status: filter.status,
      filter_group: filter.filter_group?._id || filter.filter_group,
      _id: filter._id
    });
    setIsModalOpen(true);
  };

  const flattenFilters = (filters, parentId = "none", level = 0, result = []) => {
    filters.forEach((filter) => {
      result.push({ ...filter, level });
    });
    return result;
  };

  const renderFilterRows = () => {
    const flattenedFilters = flattenFilters(filters);
    const filteredFilters = flattenedFilters.filter((filter) =>
      filter.filter_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      filter.filter_slug.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return filteredFilters
      .slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage)
      .map((filter, index) => (
        <tr key={filter._id} className="text-center border-b">
          <td className="p-2">{filter.filter_name}</td>
          <td className="p-2">{filter.filter_slug}</td>
          <td className="p-2">
            {filter.filter_group?.filtergroup_name || filter.filter_group_name || "N/A"}
          </td>
         
          <td className="p-2 font-semibold">
            {filter.status === "Active" ? (
              <span className="bg-green-100 text-green-600 px-6 py-1.5 rounded-full font-medium text-sm">Active</span>
            ) : (
              <span className="bg-red-100 text-red-600 px-6 py-1.5 rounded-full font-medium text-sm">Inactive</span>
            )}
          </td>
          <td className="px-4 py-2">
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => handleEditFilter(filter)}
                className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center hover:bg-blue-200"
                title="Edit"
              >
                <FaEdit className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  setFilterToDelete(filter._id);
                  setShowConfirmationModal(true);
                }}
                className="w-8 h-8 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center hover:bg-pink-200"
                title="Delete"
              >
                <Icon icon="mingcute:delete-2-line" className="w-4 h-4" />
              </button>
            </div>
          </td>
        </tr>
      ));
  };

  const flattenedFilters = flattenFilters(filters);
  const filteredFilters = flattenedFilters.filter((filter) =>
    filter.filter_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    filter.filter_slug.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const pageCount = Math.ceil(filteredFilters.length / itemsPerPage);
  const startEntry = currentPage * itemsPerPage + 1;
  const endEntry = Math.min((currentPage + 1) * itemsPerPage, filteredFilters.length);

  return (
    <div className="container mx-auto">
      <div className="flex justify-between items-center mb-5 mt-5">
        <h2 className="text-2xl font-bold">Filter List</h2>
      </div>

      {isLoading ? (
        <p>Loading filters...</p>
      ) : (
        <div className="bg-white shadow-md rounded-lg p-5 overflow-x-auto">
          <div className="flex justify-between mb-5">
            <input
              type="text"
              placeholder="Search filter..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border px-3 py-2 rounded-md w-64"
            />
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-blue-500 text-white px-4 py-2 rounded-md"
            >
              + Add Filter
            </button>
          </div>

          <table className="w-full border border-gray-300">
            <thead>
              <tr className="bg-gray-200">
                <th className="p-2">Filter Name</th>
                <th className="p-2">Filter Slug</th>
                <th className="p-2">Filter Group</th>
                <th className="p-2">Status</th>
                <th className="p-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredFilters.length > 0 ? (
                renderFilterRows()
              ) : (
                <tr>
                  <td colSpan="5" className="text-center p-4">
                    No filters found
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          <div className="flex justify-between items-center mt-4">
            <div className="text-sm text-gray-600">
              Showing {startEntry} to {endEntry} of {filteredFilters.length} entries
            </div>
            <ReactPaginate
              previousLabel={"«"}
              nextLabel={"»"}
              breakLabel={"..."}
              pageCount={pageCount}
              onPageChange={handlePageClick}
              forcePage={currentPage}
              containerClassName={"flex items-center space-x-1"}
              pageLinkClassName={`px-3 py-1.5 border border-gray-300 rounded-md text-black bg-white hover:bg-gray-100`}
              previousLinkClassName={`px-3 py-1.5 border border-gray-300 rounded-md ${
                currentPage === 0 ? "text-gray-400 cursor-not-allowed" : "text-black bg-white hover:bg-gray-100"
              }`}
              nextLinkClassName={`px-3 py-1.5 border border-gray-300 rounded-md ${
                currentPage === pageCount - 1 ? "text-gray-400 cursor-not-allowed" : "text-black bg-white hover:bg-gray-100"
              }`}
              activeLinkClassName={"bg-blue-500 text-black"}
              breakLinkClassName={`px-3 py-1.5 border border-gray-300 rounded-md text-black bg-white hover:bg-gray-100`}
            />
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-lg w-full max-w-3xl mx-4 max-h-[90vh] flex flex-col">
            {/* Header with close button */}
            <div className="flex justify-between items-center border-b-2 border-gray-300 px-6 py-4">
              <h2 className="text-xl font-semibold text-gray-900">
                {newFilter._id ? "Edit Filter" : "Add Filter"}
              </h2>
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
              <form onSubmit={handleAddFilter} className="space-y-5">
                {/* Filter Name */}
                <div>
                  <label htmlFor="filter_name" className="block mb-1 text-sm font-semibold text-gray-700">
                    Filter Name
                  </label>
                  <input
                    name="filter_name"
                    value={newFilter.filter_name}
                    onChange={handleInputChange}
                    id="filter_name"
                    className="w-full rounded-md border p-2 focus:ring-2 focus:ring-blue-400"
                    placeholder="Enter Filter Name"
                    required
                  />
                </div>

                {/* Filter Group */}
                <div>
                  <label htmlFor="filter_group" className="block mb-1 text-sm font-semibold text-gray-700">
                    Filter Group
                  </label>
                  <Select
                    options={filterGroups}
                    onChange={handleFilterGroupChange}
                    value={filterGroups.find(option => option.value === newFilter.filter_group)}
                    placeholder="Select Filter Group..."
                    className="w-full"
                    required
                    id="filter_group"
                  />
                </div>

                {/* Status */}
                <div>
                  <label htmlFor="status" className="block mb-1 text-sm font-semibold text-gray-700">
                    Status
                  </label>
                  <select
                    name="status"
                    id="status"
                    value={newFilter.status}
                    onChange={handleInputChange}
                    className="w-full rounded-md border border-gray-300 p-2 focus:ring-2 focus:ring-blue-400"
                    required
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="inline-block bg-blue-600 text-white px-5 py-2 rounded-md text-sm font-semibold hover:bg-blue-700 transition"
                >
                  {newFilter._id ? "Update" : "Add"} Filter
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
            <h2 className="text-xl font-bold mb-4">Delete Filter</h2>
            <p className="mb-4">Are you sure you want to delete this filter?</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowConfirmationModal(false)}
                className="bg-gray-300 px-4 py-2 rounded-md"
              >
                No, Close
              </button>
              <button
                onClick={() => handleDeleteFilter(filterToDelete)}
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

      <ToastContainer />
    </div>
  );
}