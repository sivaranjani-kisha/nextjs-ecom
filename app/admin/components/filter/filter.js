"use client";

import React, { useEffect, useState } from "react";
import { FaPlus, FaMinus } from "react-icons/fa";
import dynamic from 'next/dynamic';
import ReactPaginate from "react-paginate";
const Select = dynamic(() => import('react-select'), { ssr: false });
import { combinations } from '@/utils/combinations';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function FilterComponent() {
  const [Filter, setFilter] = useState([]);
    const [Filtergroup, setFiltergroup] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [newFilter, setNewFilter] = useState({
    filter_name: "",
    status: "Active",
    filter_group: "",
  });
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [FilterToDelete, setFilterToDelete] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false); // State for success modal
  const [successMessage, setSuccessMessage] = useState(""); // State for success message

  const [currentPage, setCurrentPage] = useState(0);
    const [validationError, setValidationError] = useState(null);

  const itemsPerPage = 5; // 5 records per page

  const fetchFilter = async () => {
    try {
      const response = await fetch("/api/filter");
      const data = await response.json();
      setFilter(data.data);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching Filter:", error);
      setIsLoading(false);
    }
  };

  const fetchFiltergroup = async () => {
    try {
      const response = await fetch("/api/filter_group");
      const res = await response.json();
      const data = res.data;
        console.log(data);
        const brandOptions = data.map((cat) => ({
          value: cat._id,
          label: cat.filtergroup_name,
        }));
        setFiltergroup(brandOptions);
    } catch (error) {
      console.error("Error fetching Filtergroup:", error);
    }
  };

  const handleFiltergroupChange = (selectedOptions) => {
    console.log(selectedOptions);
    setNewFilter((prev) => ({
      ...prev,
      filter_group: selectedOptions.value,
    }));
  };
  useEffect(() => {
    fetchFilter();
    fetchFiltergroup();
  }, []);

  // Handle page change
  const handlePageClick = ({ selected }) => {
    setCurrentPage(selected);
  };



  // Handle input change
  const handleInputChange = (e) => {
    setNewFilter({ ...newFilter, [e.target.name]: e.target.value });
  };

  // Handle category submission
  const handleAddFilter = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("filter_name", newFilter.filter_name);
    formData.append("status", newFilter.status);
    formData.append("filter_group", newFilter.filter_group);
    try {
      const response = await fetch("/api/filter/add", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      if (response.ok) {
        setIsModalOpen(false);
        fetchFilter(); // Refresh the list

        // Reset form
        setNewFilter({
          filter_name: "",
          status: "Active",
          filter_group: "",
        });
      } else {
        console.error("Error adding Filter:", result.error);
          toast.error(result.error);
      }
    } catch (error) {
      toast.error(result.error);
    }
  };

  // Handle category deletion
  const handleDeleteFilter = async (filterId) => {
    try {
      const response = await fetch("/api/filter/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filterId }),
      });

      const result = await response.json();
      if (response.ok) {
        setSuccessMessage("Filter Deleted Successfully"); // Set success message
        setShowSuccessModal(true); // Show success modal
        fetchFilter(); // Refresh the list
      } else {
        console.error("Error:", result.error);
        alert("Failed to delete category.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred.");
    } finally {
      setShowConfirmationModal(false); // Close confirmation modal
      setFilterToDelete(null); // Reset category to delete
    }
  };

  const flattenCategories = (Filter, parentId = "none", level = 0, result = []) => {
    Filter.forEach((Filter) => {
        result.push({ ...Filter, level });
      });
    return result;
  };

  // Render category rows with pagination
  const renderFilterRows = () => {
    console.log(flattenCategories(Filter));
    const flattenedCategories = flattenCategories(Filter);
    const filteredCategories = flattenedCategories.filter((Filter) =>
      Filter.filter_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    Filter.filter_slug.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return filteredCategories
      .slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage)
      .map((Filter, index) => (
        <tr key={Filter._id} className="text-center border-b">
           <td className="p-2">{Filter.filter_name}</td>
          <td className="p-2">{Filter.filter_slug}</td>
          <td className="p-2">
            {(Filter.filter_group_name)}
          </td>
          <td className="p-2 font-semibold">
            {Filter.status === "Active" ? (
              <span className="text-green-500">Active</span>
            ) : (
              <span className="text-red-500">Inactive</span>
            )}
          </td>
          <td className="p-2 font-semibold">
            <button
              onClick={() => {
                setFilterToDelete(Filter._id);
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

  const flattenedCategories = flattenCategories(Filter);
  const filteredCategories = flattenedCategories.filter((Filters) =>
    Filters.filter_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
  Filters.filter_slug.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const pageCount = Math.ceil(filteredCategories.length / itemsPerPage);

  const ValidationModal = ({ message, onClose }) => (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <p className="text-red-500">{message}</p>
        <button
          onClick={onClose}
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
        >
          Close
        </button>
      </div>
    </div>
  );
  
  const closeModal = () => {
    setValidationError(null);
  };
  return (
    <div className="container mx-auto mt-10 p-5">
         <ToastContainer />
            {validationError && <ValidationModal message={validationError} onClose={closeModal} />}
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-2xl font-bold">Filter List</h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded-md"
        >
          + Add Filter
        </button>
      </div>

      {/* Search Box */}
      <div className="flex justify-start mb-5">
        <input
          type="text"
          placeholder="Search Filter..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="border px-3 py-2 rounded-md w-64"
        />
      </div>

      {isLoading ? (
        <p>Loading Filters...</p>
      ) : (
        <div className="bg-white shadow-md rounded-lg p-5 overflow-x-auto">
          <table className="w-full border border-gray-300">
            <thead>
              <tr className="bg-gray-200">
                <th className="p-2">filter Name</th>
                <th className="p-2">filter Slug</th>
                <th className="p-2">filter group</th>
                <th className="p-2">Status</th>
                <th className="p-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredCategories.length > 0 ? (
                renderFilterRows()
              ) : (
                <tr>
                  <td colSpan="6" className="text-center p-4">
                    No Filters found
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

      {/* Modal for Adding Filter */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-5 rounded-lg w-96 relative">
            <h2 className="text-lg font-bold text-center">Add 
            Filter
            </h2>
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-3 right-3 text-red-500 text-xl"
            >
              ×
            </button>
            <form onSubmit={handleAddFilter} className="mt-4">
              <input
                name="filter_name"
                value={newFilter.filter_name}
                onChange={handleInputChange}
                className="w-full border p-2 mb-3 rounded"
                placeholder="Filter Name"
                required
              />

              <Select
                options={Filtergroup}
                onChange={handleFiltergroupChange}
                placeholder="Select Filter group..."
                className="w-full  p-0 mb-3 "
              />

              <select
                name="status"
                value={newFilter.status}
                onChange={handleInputChange}
                className="w-full border p-2 mb-3 rounded"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>

              <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded w-full mt-2">
                Add Filter
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmationModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-xl font-bold mb-4">Delete Filter</h2>
            <p className="mb-4">Are you sure you want to delete this Filter?</p>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowConfirmationModal(false)}
                className="bg-gray-300 px-4 py-2 rounded-md"
              >
                No, Close
              </button>
              <button
                onClick={() => handleDeleteFilter(FilterToDelete)}
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