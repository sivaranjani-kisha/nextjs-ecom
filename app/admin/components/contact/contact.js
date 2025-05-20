import React, { useEffect, useState } from "react";

export default function ContactComponent() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [contactToDelete, setContactToDelete] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [contactToEdit, setContactToEdit] = useState(null);

  const contactsPerPage = 5;

  useEffect(() => {
    fetch("/api/contact/get")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setContacts(data.data);
        }
      })
      .catch((error) => console.error("Error fetching contacts:", error))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`/api/contact/delete`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });

      const result = await response.json();
      if (result.success) {
        setContacts(
          contacts.map((contact) =>
            contact._id === id ? { ...contact, status: "inactive" } : contact
          )
        );
        showAlert("Contact status updated to Inactive", "success");
      } else {
        showAlert(result.message || "Failed to update contact status", "error");
      }
    } catch (error) {
      console.error("Error updating contact status:", error);
      showAlert("Error updating contact status", "error");
    } finally {
      setShowConfirmationModal(false);
    }
  };

  const handleEdit = async (id) => {
    try {
      const response = await fetch(`/api/contact/update`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(contactToEdit),
      });

      const result = await response.json();
      if (result.success) {
        setContacts(
          contacts.map((contact) =>
            contact._id === id ? contactToEdit : contact
          )
        );
        showAlert("Contact updated successfully", "success");
      } else {
        showAlert(result.message || "Failed to update contact", "error");
      }
    } catch (error) {
      console.error("Error updating contact:", error);
      showAlert("Error updating contact", "error");
    } finally {
      setShowEditModal(false);
    }
  };

  const showAlert = (message, type) => {
    setAlertMessage(message);
    setAlertType(type);
    setTimeout(() => {
      setAlertMessage("");
      setAlertType("");
    }, 3000);
  };

  const filteredContacts = contacts.filter((contact) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      contact.email_address.toLowerCase().includes(searchLower) ||
      contact.name.toLowerCase().includes(searchLower) ||
      contact.mobile_number.toLowerCase().includes(searchLower)
    );
  });

  const indexOfLastContact = currentPage * contactsPerPage;
  const indexOfFirstContact = indexOfLastContact - contactsPerPage;
  const currentContacts = filteredContacts.slice(indexOfFirstContact, indexOfLastContact);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const totalPages = Math.ceil(filteredContacts.length / contactsPerPage);
  const startEntry = indexOfFirstContact + 1;
  const endEntry = Math.min(indexOfLastContact, filteredContacts.length);

  return (
    <div className="container mx-auto">
      <div className="flex justify-between items-center mb-5 mt-5">
        <h2 className="text-2xl font-bold">Contact List</h2>
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

      {loading ? (
        <p>Loading contacts...</p>
      ) : (
        <div className="bg-white shadow-md rounded-lg p-5 overflow-x-auto">
          <div className="flex justify-start mb-5">
            <input
              type="text"
              placeholder="Search Contact..."
              className="border px-3 py-2 rounded-md w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <hr className="border-t border-gray-200 mb-4" />
          {filteredContacts.length === 0 ? (
            <p className="text-center">No contacts found</p>
          ) : (
            <>
              <table className="w-full border border-gray-300">
                <thead>
                  <tr className="bg-gray-200 text-center">
                    <th className="p-2">Email Address</th>
                    <th className="p-2">Name</th>
                    <th className="p-2">Mobile Number</th>
                    <th className="p-2">Message</th>
                  </tr>
                </thead>
                <tbody>
                  {currentContacts.map((contact) => (
                    <tr key={contact._id} className="text-center border-b">
                      <td className="p-2 font-bold">{contact.email_address}</td>
                      <td className="p-2">{contact.name}</td>
                      <td className="p-2">{contact.mobile_number}</td>
                      <td className="p-2">{contact.message}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination Section */}
              <div className="flex justify-between items-center mt-4 flex-wrap gap-2">
                <div className="text-sm text-gray-600">
                  Showing {startEntry} to {endEntry} of {filteredContacts.length} entries
                </div>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`px-3 py-1.5 border rounded-md ${
                      currentPage === 1
                        ? "text-gray-400 cursor-not-allowed bg-gray-100"
                        : "text-black bg-white hover:bg-gray-100"
                    }`}
                  >
                    «
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => paginate(i + 1)}
                      className={`px-3 py-1.5 border rounded-md ${
                        currentPage === i + 1
                          ? "bg-blue-500 text-white"
                          : "text-black bg-white hover:bg-gray-100"
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`px-3 py-1.5 border rounded-md ${
                      currentPage === totalPages
                        ? "text-gray-400 cursor-not-allowed bg-gray-100"
                        : "text-black bg-white hover:bg-gray-100"
                    }`}
                  >
                    »
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmationModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-xl font-bold mb-4">Delete Contact</h2>
            <p className="mb-4">Are you sure you want to delete this contact?</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowConfirmationModal(false)}
                className="bg-gray-300 px-4 py-2 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(contactToDelete)}
                className="bg-red-500 px-4 py-2 rounded-md text-white"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && contactToEdit && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-xl font-bold mb-4">Edit Contact</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleEdit(contactToEdit._id);
              }}
            >
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Email Address</label>
                <input
                  type="email"
                  value={contactToEdit.email_address || ""}
                  onChange={(e) =>
                    setContactToEdit({ ...contactToEdit, email_address: e.target.value })
                  }
                  className="border px-3 py-2 rounded-md w-full"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Name</label>
                <input
                  type="text"
                  value={contactToEdit.name || ""}
                  onChange={(e) =>
                    setContactToEdit({ ...contactToEdit, name: e.target.value })
                  }
                  className="border px-3 py-2 rounded-md w-full"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Mobile Number</label>
                <input
                  type="text"
                  value={contactToEdit.mobile_number || ""}
                  onChange={(e) =>
                    setContactToEdit({ ...contactToEdit, mobile_number: e.target.value })
                  }
                  className="border px-3 py-2 rounded-md w-full"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">User Type</label>
                <select
                  value={contactToEdit.user_type || ""}
                  onChange={(e) =>
                    setContactToEdit({ ...contactToEdit, user_type: e.target.value })
                  }
                  className="border px-3 py-2 rounded-md w-full"
                >
                  <option value="">Select Type</option>
                  <option value="Admin">Admin</option>
                  <option value="Customer">Customer</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Status</label>
                <input
                  type="text"
                  value={contactToEdit.status || ""}
                  onChange={(e) =>
                    setContactToEdit({ ...contactToEdit, status: e.target.value })
                  }
                  className="border px-3 py-2 rounded-md w-full"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="bg-gray-300 px-4 py-2 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 px-4 py-2 rounded-md text-white"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
