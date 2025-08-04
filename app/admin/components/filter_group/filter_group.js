"use client";

import React, { useEffect, useState } from "react";
import { FaPlus, FaMinus, FaEdit } from "react-icons/fa";
import ReactPaginate from "react-paginate";
import { Icon } from '@iconify/react';

export default function FiltergroupComponent() {
  const [filterGroups, setFilterGroups] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [newFiltergroup, setNewFiltergroup] = useState({
    filtergroup_name: "",
    status: "Active",
    _id: null
  });
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [filterGroupToDelete, setFilterGroupToDelete] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 5;

  const fetchFilterGroups = async () => {
    try {
      const response = await fetch("/api/filter_group");
      const data = await response.json();
      setFilterGroups(data.data);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching filter groups:", error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFilterGroups();
  }, []);

  const handlePageClick = ({ selected }) => {
    setCurrentPage(selected);
  };

  const handleInputChange = (e) => {
    setNewFiltergroup({ ...newFiltergroup, [e.target.name]: e.target.value });
  };

  const handleAddFiltergroup = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("filtergroup_name", newFiltergroup.filtergroup_name);
    formData.append("status", newFiltergroup.status);
    
    if (newFiltergroup._id) {
      formData.append("filtergroupId", newFiltergroup._id);
    }

    try {
      const url = newFiltergroup._id 
        ? "/api/filter_group/update" 
        : "/api/filter_group/add";
        
      const response = await fetch(url, {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      if (response.ok) {
        setIsModalOpen(false);
        fetchFilterGroups();
        setNewFiltergroup({
          filtergroup_name: "",
          status: "Active",
          _id: null
        });
        setSuccessMessage(newFiltergroup._id 
          ? "Filter group updated successfully" 
          : "Filter group added successfully");
        setShowSuccessModal(true);
      } else {
        console.error("Error:", result.error);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleDeleteFiltergroup = async (filtergroupId) => {
    try {
      const response = await fetch("/api/filter_group/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filtergroupId }),
      });

      const result = await response.json();
      if (response.ok) {
        setSuccessMessage("Filter group deleted successfully");
        setShowSuccessModal(true);
        fetchFilterGroups();
      } else {
        console.error("Error:", result.error);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setShowConfirmationModal(false);
      setFilterGroupToDelete(null);
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
  const handleEditFiltergroup = (filtergroup) => {
    setNewFiltergroup({
      filtergroup_name: filtergroup.filtergroup_name,
      status: filtergroup.status,
      _id: filtergroup._id
    });
    setIsModalOpen(true);
  };

  const flattenFilterGroups = (groups, parentId = "none", level = 0, result = []) => {
    groups.forEach((group) => {
      result.push({ ...group, level });
    });
    return result;
  };

  const renderFilterGroupRows = () => {
    const flattenedGroups = flattenFilterGroups(filterGroups);
    const filteredGroups = flattenedGroups.filter((group) =>
      group.filtergroup_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      group.filtergroup_slug.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return filteredGroups
      .slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage)
      .map((group, index) => (
        <tr key={group._id} className="text-center border-b">
          <td className="p-2">{group.filtergroup_name}</td>
          <td className="p-2">{group.filtergroup_slug}</td>
          <td className="p-2 font-semibold">
            {group.status === "Active" ? (
              <span className="bg-green-100 text-green-600 px-6 py-1.5 rounded-full font-medium text-sm">Active</span>
            ) : (
              <span className="bg-red-100 text-red-600 px-6 py-1.5 rounded-full font-medium text-sm">Inactive</span>
            )}
          </td>
          <td className="px-4 py-2">
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => handleEditFiltergroup(group)}
                className="w-8 h-8 bg-red-100 text-red-600 rounded-full flex items-center justify-center hover:bg-red-200"
                title="Edit"
              >
                <FaEdit className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  setFilterGroupToDelete(group._id);
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

  const flattenedGroups = flattenFilterGroups(filterGroups);
  const filteredGroups = flattenedGroups.filter((group) =>
    group.filtergroup_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    group.filtergroup_slug.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const pageCount = Math.ceil(filteredGroups.length / itemsPerPage);
  const startEntry = currentPage * itemsPerPage + 1;
  const endEntry = Math.min((currentPage + 1) * itemsPerPage, filteredGroups.length);

  return (
    <div className="container mx-auto">
      <div className="flex justify-between items-center mb-5 mt-5">
        <h2 className="text-2xl font-bold">Filter Group List</h2>
      </div>

      {isLoading ? (
        <p>Loading filter groups...</p>
      ) : (
        <div className="bg-white shadow-md rounded-lg p-5 overflow-x-auto">
          <div className="flex justify-between mb-5">
            <input
              type="text"
              placeholder="Search filter group..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border px-3 py-2 rounded-md w-64"
            />
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-red-500 text-white px-4 py-2 rounded-md"
            >
              + Add Filter Group
            </button>
          </div>

          <table className="w-full border border-gray-300">
            <thead>
              <tr className="bg-gray-200">
                <th className="p-2">Filter Group Name</th>
                <th className="p-2">Filter Group Slug</th>
                <th className="p-2">Status</th>
                <th className="p-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredGroups.length > 0 ? (
                renderFilterGroupRows()
              ) : (
                <tr>
                  <td colSpan="4" className="text-center p-4">
                    No filter groups found
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          <div className="flex justify-between items-center mt-4">
            <div className="text-sm text-gray-600">
              Showing {startEntry} to {endEntry} of {filteredGroups.length} entries
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
              activeLinkClassName={"bg-red-500 text-black"}
              breakLinkClassName={`px-3 py-1.5 border border-gray-300 rounded-md text-black bg-white hover:bg-gray-100`}
            />
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
     {isModalOpen && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 overflow-y-auto">
    <div className="bg-white rounded-2xl shadow-lg w-full max-w-md mx-4 max-h-[90vh] flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center border-b px-6 py-4">
        <h2 className="text-xl font-semibold text-gray-900">
          {newFiltergroup._id ? "Edit" : "Add"} Filter Group
        </h2>
        <button
          onClick={() => {
            setIsModalOpen(false);
            setNewFiltergroup({
              filtergroup_name: "",
              status: "Active",
              _id: null
            });
          }}
          className="text-gray-400 hover:text-gray-700"
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

      {/* Body */}
      <div className="px-6 py-6 overflow-y-auto flex-grow">
        <form onSubmit={handleAddFiltergroup} className="space-y-5">
          {/* Filter Group Name */}
          <div>
            <label htmlFor="filtergroup_name" className="block mb-1 text-sm font-semibold text-gray-700">
              Filter Group Name
            </label>
            <input
              type="text"
              id="filtergroup_name"
              name="filtergroup_name"
              value={newFiltergroup.filtergroup_name}
              onChange={handleInputChange}
              className="w-full rounded-md border p-2 focus:ring-2 focus:ring-red-400"
              placeholder="Enter Filter Group Name"
              required
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
              value={newFiltergroup.status}
              onChange={handleInputChange}
              className="w-full rounded-md border p-2 focus:ring-2 focus:ring-red-400"
              required
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="inline-block bg-red-600 text-white px-5 py-2 rounded-md text-sm font-semibold hover:bg-red-700 transition"
          >
            {newFiltergroup._id ? "Update" : "Add"} Filter Group
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
            <h2 className="text-xl font-bold mb-4">Delete Filter Group</h2>
            <p className="mb-4">Are you sure you want to delete this filter group?</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowConfirmationModal(false)}
                className="bg-gray-300 px-4 py-2 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteFiltergroup(filterGroupToDelete)}
                className="bg-red-500 px-4 py-2 rounded-md text-white"
              >
                Delete
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
                className="bg-red-500 px-4 py-2 rounded-md text-white"
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