"use client";

import React, { useEffect, useState } from "react";
import { FaPlus, FaMinus } from "react-icons/fa";
import ReactPaginate from "react-paginate";

export default function FiltergroupComponent() {
  const [Filtergroup, setFiltergroup] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [newFiltergroup, setNewFiltergroup] = useState({
    filtergroup_name: "",
    status: "Active",
  });
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [FiltergroupToDelete, setFiltergroupToDelete] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false); // State for success modal
  const [successMessage, setSuccessMessage] = useState(""); // State for success message

  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 5; // 5 records per page

  const fetchFiltergroup = async () => {
    try {
      const response = await fetch("/api/filter_group");
      const data = await response.json();
      setFiltergroup(data.data);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching Filtergroup:", error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFiltergroup();
  }, []);

  // Handle page change
  const handlePageClick = ({ selected }) => {
    setCurrentPage(selected);
  };



  // Handle input change
  const handleInputChange = (e) => {
    setNewFiltergroup({ ...newFiltergroup, [e.target.name]: e.target.value });
  };

  // Handle category submission
  const handleAddFiltergroup = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("filtergroup_name", newFiltergroup.filtergroup_name);
    formData.append("status", newFiltergroup.status);
    try {
      const response = await fetch("/api/filter_group/add", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      if (response.ok) {
        setIsModalOpen(false);
        fetchFiltergroup(); // Refresh the list

        // Reset form
        setNewFiltergroup({
          filtergroup_name: "",
          status: "Active",
        });
      } else {
        console.error("Error adding Filtergroup:", result.error);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  // Handle category deletion
  const handleDeleteFiltergroup = async (filtergroupId) => {
    try {
      const response = await fetch("/api/filter_group/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filtergroupId }),
      });

      const result = await response.json();
      if (response.ok) {
        setSuccessMessage("Filtergroup Deleted Successfully"); // Set success message
        setShowSuccessModal(true); // Show success modal
        fetchFiltergroup(); // Refresh the list
      } else {
        console.error("Error:", result.error);
        alert("Failed to delete category.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred.");
    } finally {
      setShowConfirmationModal(false); // Close confirmation modal
      setFiltergroupToDelete(null); // Reset category to delete
    }
  };

  const flattenCategories = (Filtergroup, parentId = "none", level = 0, result = []) => {
    Filtergroup.forEach((Filtergroups) => {
        result.push({ ...Filtergroups, level });
      });
    return result;
  };

  // Render category rows with pagination
  const renderFiltergroupRows = () => {
    console.log(flattenCategories(Filtergroup));
    const flattenedCategories = flattenCategories(Filtergroup);
    const filteredCategories = flattenedCategories.filter((Filtergroups) =>
        Filtergroups.filtergroup_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    Filtergroups.filtergroup_slug.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return filteredCategories
      .slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage)
      .map((Filtergroup, index) => (
        <tr key={Filtergroup._id} className="text-center border-b">
           <td className="p-2">{Filtergroup.filtergroup_name}</td>
          <td className="p-2">{Filtergroup.filtergroup_slug}</td>
          <td className="p-2 font-semibold">
            {Filtergroup.status === "Active" ? (
              <span className="text-green-500">Active</span>
            ) : (
              <span className="text-red-500">Inactive</span>
            )}
          </td>
          <td className="p-2 font-semibold">
            <button
              onClick={() => {
                setFiltergroupToDelete(Filtergroup._id);
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

  const flattenedCategories = flattenCategories(Filtergroup);
  const filteredCategories = flattenedCategories.filter((Filtergroups) =>
    Filtergroups.filtergroup_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
  Filtergroups.filtergroup_slug.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const pageCount = Math.ceil(filteredCategories.length / itemsPerPage);

  return (
    <div className="container mx-auto mt-10 p-5">
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-2xl font-bold">Filter group List</h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded-md"
        >
          + Add Filter group 
        </button>
      </div>

      {/* Search Box */}
      <div className="flex justify-start mb-5">
        <input
          type="text"
          placeholder="Search Filter group..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="border px-3 py-2 rounded-md w-64"
        />
      </div>

      {isLoading ? (
        <p>Loading Filter groups...</p>
      ) : (
        <div className="bg-white shadow-md rounded-lg p-5 overflow-x-auto">
          <table className="w-full border border-gray-300">
            <thead>
              <tr className="bg-gray-200">
                <th className="p-2">Filtergroup Name</th>
                <th className="p-2">Filtergroup Slug</th>
                <th className="p-2">Status</th>
                <th className="p-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredCategories.length > 0 ? (
                renderFiltergroupRows()
              ) : (
                <tr>
                  <td colSpan="6" className="text-center p-4">
                    No Filter groups found
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
            Filter group
            </h2>
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-3 right-3 text-red-500 text-xl"
            >
              ×
            </button>
            <form onSubmit={handleAddFiltergroup} className="mt-4">
              <input
                name="filtergroup_name"
                value={newFiltergroup.filtergroup_name}
                onChange={handleInputChange}
                className="w-full border p-2 mb-2 rounded"
                placeholder="Filter group Name"
                required
              />


              <select
                name="status"
                value={newFiltergroup.status}
                onChange={handleInputChange}
                className="w-full border p-2 mb-2 rounded"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>

              <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded w-full mt-2">
                Add Filter group
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmationModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-xl font-bold mb-4">Delete Filter group</h2>
            <p className="mb-4">Are you sure you want to delete this Filter group?</p>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowConfirmationModal(false)}
                className="bg-gray-300 px-4 py-2 rounded-md"
              >
                No, Close
              </button>
              <button
                onClick={() => handleDeleteFiltergroup(FiltergroupToDelete)}
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