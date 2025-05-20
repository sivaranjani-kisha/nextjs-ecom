import React, { useState, useEffect } from "react";
import axios from "axios";
import { Icon } from '@iconify/react';

export default function UserComponent() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    email: "",
    password: "",
    confirmPassword: "",
    user_type: "user",
    status: "Active",
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get("/api/users/get");
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleDelete = async (userId) => {
    try {
      const response = await axios.delete(`/api/users/delete`, {
        data: { userId },
      });
  
      if (response.data.success) {
        setAlertMessage("✅ User set to inactive successfully!");
        setShowAlert(true);
        setTimeout(() => setShowAlert(false), 3000);
        fetchUsers();
      } else {
        setAlertMessage("❌ Error setting user to inactive");
        setShowAlert(true);
        setTimeout(() => setShowAlert(false), 3000);
      }
    } catch (error) {
      setAlertMessage("❌ Error setting user to inactive");
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 3000);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setAlertMessage("⚠️ Passwords do not match");
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 3000);
      return;
    }
    try {
      await axios.post("/api/users/add", {
        ...formData,
        user_type: "user",
        status: formData.status,
      });
      setAlertMessage("✅ User added successfully!");
      setShowAlert(true);
      setTimeout(() => {
        setShowAlert(false);
        setIsModalOpen(false);
      }, 3000);
      fetchUsers();
      setFormData({
        name: "",
        mobile: "",
        email: "",
        password: "",
        confirmPassword: "",
        user_type: "user",
        status: "Active",
      });
    } catch (error) {
      setAlertMessage(error.response?.data?.message || "❌ Error adding user");
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 3000);
    }
  };

  const filteredUsers = users.filter(user => {
    const name = user.name || "";
    const email = user.email || "";
    const mobile = user.mobile || "";

    return (
      name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mobile.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  // Pagination calculations
  const totalEntries = filteredUsers.length;
  const indexOfLastUser = currentPage * itemsPerPage;
  const indexOfFirstUser = indexOfLastUser - itemsPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const startEntry = indexOfFirstUser + 1;
  const endEntry = Math.min(indexOfLastUser, totalEntries);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

 const renderPagination = () => {
  const pageNumbers = [];
  for (let i = 1; i <= Math.ceil(filteredUsers.length / itemsPerPage); i++) {
    pageNumbers.push(i);
  }

  return (
    <div className="flex justify-between items-center mt-4">
      {/* Left side: Entry text */}
      <div className="text-sm text-gray-600">
        Showing {startEntry} to {endEntry} of {filteredUsers.length} entries
      </div>

      {/* Right side: Pagination */}
      <div className="pagination flex items-center space-x-1">
        {/* Previous Button */}
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

        {/* Page Number Buttons */}
        {Array.from({ length: Math.ceil(filteredUsers.length / itemsPerPage) }, (_, i) => (
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
        ))}

        {/* Next Button */}
        <button
          onClick={() => paginate(currentPage + 1)}
          disabled={currentPage === Math.ceil(filteredUsers.length / itemsPerPage)}
          className={`px-3 py-1.5 border border-gray-300 rounded-md ${
            currentPage === Math.ceil(filteredUsers.length / itemsPerPage)
              ? "text-gray-400 cursor-not-allowed"
              : "text-black bg-white hover:bg-gray-100"
          }`}
          aria-label="Next page"
        >
          »
        </button>
      </div>
    </div>
  );
};


  return (
    <div className="container mx-auto">
      <div className="flex justify-between items-center mb-5 mt-5">
        <h2 className="text-2xl font-bold">User List</h2>
      </div>
 <hr className="border-t border-gray-200 mb-4" />
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <>
          <div className="bg-white shadow-md rounded-lg p-5 overflow-x-auto">
            <div className="flex justify-between items-center mb-5 w-full">
              <input
                type="text"
                placeholder="Search User..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="border px-3 py-2 rounded-md w-64"
              />
              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-blue-500 text-white px-4 py-2 rounded-md"
              >
                + Add User
              </button>
            </div>
            <hr className="border-t border-gray-200 mb-4" />
            <table className="w-full border border-gray-300">
              <thead>
                <tr className="bg-gray-200">
                  <th className="p-2">Email Address</th>
                  <th className="p-2">Display Name</th>
                  <th className="p-2">Mobile Number</th>
                  <th className="p-2">User Type</th>
                  <th className="p-2">Status</th>
                  <th className="p-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {currentUsers.length > 0 ? (
                  currentUsers.map((user, index) => (
                    <tr key={index} className="text-center border-b">
                      <td className="p-2 font-bold">{user.email}</td>
                      <td className="p-2">{user.name}</td>
                      <td className="p-2">{user.mobile}</td>
                      <td className="p-2 font-semibold">{user.user_type}</td>
                      <td className="p-2 font-semibold">
                        {user.status === "Active" ? (
                          <span className="text-green-500">Active</span>
                        ) : (
                          <span className="text-red-500">Inactive</span>
                        )}
                      </td>
                      <td className="p-2">
                        <div className="flex items-center gap-2 justify-center">
                          <button
                            onClick={() => handleDelete(user._id)}
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
                    <td colSpan="6" className="p-2 text-center text-gray-500">No users found.</td>
                  </tr>
                )}
              </tbody>
            </table>
            {renderPagination()}
          </div>
        </>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-5 rounded-lg w-96 relative max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold text-center">Add User</h2>
            <button onClick={() => setIsModalOpen(false)} className="absolute top-3 right-3 text-red-500 text-xl">×</button>
            {showAlert && <div className="bg-green-500 text-white px-4 py-2 rounded-md mb-4 text-center">{alertMessage}</div>}
            <form onSubmit={handleSubmit} className="mt-4">
              <input type="text" name="name" placeholder="Name" value={formData.name} onChange={handleChange} className="w-full border p-2 mb-2 rounded" required />
              <input type="text" name="mobile" placeholder="Mobile Number" value={formData.mobile} onChange={handleChange} className="w-full border p-2 mb-2 rounded" required />
              <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} className="w-full border p-2 mb-2 rounded" required />
              <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} className="w-full border p-2 mb-2 rounded" required />
              <input type="password" name="confirmPassword" placeholder="Confirm Password" value={formData.confirmPassword} onChange={handleChange} className="w-full border p-2 mb-2 rounded" required />
              <select name="status" value={formData.status} onChange={handleChange} className="w-full border p-2 mb-2 rounded" required>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
              <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded w-full mt-2">Add User</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}