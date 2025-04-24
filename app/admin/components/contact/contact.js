import React, { useEffect, useState } from "react";

export default function ContactComponent() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState("");
  const [currentPage, setCurrentPage] = useState(1); // Pagination state
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [contactToDelete, setContactToDelete] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [contactToEdit, setContactToEdit] = useState(null);
  const contactsPerPage = 5; // Limit of 5 contacts per page

  // Fetch contacts from API
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
        body: JSON.stringify({ id }), // Ensure the ID is passed correctly
      });

      const result = await response.json();
      if (result.success) {
        setContacts(
          contacts.map((contact) =>
            contact._id === id ? { ...contact, status: "inactive" } : contact
          )
        );
        setAlertMessage("Contact status updated to Inactive");
        setAlertType("success");

        // Clear the alert message after 3 seconds
        setTimeout(() => {
          setAlertMessage("");
          setAlertType("");
        }, 3000);
      } else {
        setAlertMessage(result.message || "Failed to update contact status");
        setAlertType("error");

        // Clear the alert message after 3 seconds
        setTimeout(() => {
          setAlertMessage("");
          setAlertType("");
        }, 3000);
      }
    } catch (error) {
      console.error("Error updating contact status:", error);
      setAlertMessage("Error updating contact status");
      setAlertType("error");

      // Clear the alert message after 3 seconds
      setTimeout(() => {
        setAlertMessage("");
        setAlertType("");
      }, 3000);
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
        setAlertMessage("Contact updated successfully");
        setAlertType("success");

        // Clear the alert message after 3 seconds
        setTimeout(() => {
          setAlertMessage("");
          setAlertType("");
        }, 3000);
      } else {
        setAlertMessage(result.message || "Failed to update contact");
        setAlertType("error");

        // Clear the alert message after 3 seconds
        setTimeout(() => {
          setAlertMessage("");
          setAlertType("");
        }, 3000);
      }
    } catch (error) {
      console.error("Error updating contact:", error);
      setAlertMessage("Error updating contact");
      setAlertType("error");

      // Clear the alert message after 3 seconds
      setTimeout(() => {
        setAlertMessage("");
        setAlertType("");
      }, 3000);
    } finally {
      setShowEditModal(false);
    }
  };

  // Filter contacts based on search term
  const filteredContacts = contacts.filter((contact) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      contact.email_address.toLowerCase().includes(searchLower) ||
      contact.name.toLowerCase().includes(searchLower) ||
      contact.mobile_number.toLowerCase().includes(searchLower)
    );
  });

  // Pagination logic
  const indexOfLastContact = currentPage * contactsPerPage;
  const indexOfFirstContact = indexOfLastContact - contactsPerPage;
  const currentContacts = filteredContacts.slice(
    indexOfFirstContact,
    indexOfLastContact
  );

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Total pages
  const totalPages = Math.ceil(filteredContacts.length / contactsPerPage);

  return (
    <div className="container mx-auto mt-10 p-5">
      <h2 className="text-2xl font-bold mb-5">Contact Enquiry List</h2>
      {alertMessage && (
        <div
          className={`mb-4 p-3 rounded-md ${
            alertType === "success" ? "bg-green-500" : "bg-red-500"
          } text-white`}
        >
          {alertMessage}
        </div>
      )}
      <div className="flex justify-start mb-5">
        <input
          type="text"
          placeholder="Search Contact..."
          className="border px-3 py-2 rounded-md w-64"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      {loading ? (
        <p>Loading contacts...</p>
      ) : (
        <div className="bg-white shadow-md rounded-lg p-5 overflow-x-auto">
          {filteredContacts.length === 0 ? (
            <p className="text-center">No contacts found</p>
          ) : (
            <>
              <table className="w-full border border-gray-300">
                <thead>
                  <tr className="bg-gray-200">
                    <th className="p-2">Email Address</th>
                    <th className="p-2">Display Name</th>
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
              {/* Pagination */}
              <ul
                className="pagination flex justify-center mt-4"
                role="navigation"
                aria-label="Pagination"
              >
                <li className="page-item">
                  <button
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="page-link px-3 py-2 border rounded mx-1"
                    aria-label="Previous page"
                    rel="prev"
                  >
                    Previous
                  </button>
                </li>
                {Array.from({ length: totalPages }, (_, index) => (
                  <li
                    key={index + 1}
                    className={`page-item ${
                      currentPage === index + 1 ? "active" : ""
                    }`}
                  >
                    <button
                      onClick={() => paginate(index + 1)}
                      className={`page-link px-3 py-2 border rounded mx-1 ${
                        currentPage === index + 1 ? "bg-blue-500 text-white" : ""
                      }`}
                      aria-label={`Page ${index + 1}`}
                    >
                      {index + 1}
                    </button>
                  </li>
                ))}
                <li className="page-item">
                  <button
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="page-link px-3 py-2 border rounded mx-1"
                    aria-label="Next page"
                    rel="next"
                  >
                    Next
                  </button>
                </li>
              </ul>
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
                No, Close
              </button>
              <button
                onClick={() => handleDelete(contactToDelete)}
                className="bg-red-500 px-4 py-2 rounded-md text-white"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Edit Modal */}
      {showEditModal && (
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
                  value={contactToEdit?.email_address || ""}
                  onChange={(e) =>
                    setContactToEdit({
                      ...contactToEdit,
                      email_address: e.target.value,
                    })
                  }
                  className="border px-3 py-2 rounded-md w-full"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Name</label>
                <input
                  type="text"
                  value={contactToEdit?.name || ""}
                  onChange={(e) =>
                    setContactToEdit({
                      ...contactToEdit,
                      name: e.target.value,
                    })
                  }
                  className="border px-3 py-2 rounded-md w-full"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Mobile Number</label>
                <input
                  type="text"
                  value={contactToEdit?.mobile_number || ""}
                  onChange={(e) =>
                    setContactToEdit({
                      ...contactToEdit,
                      mobile_number: e.target.value,
                    })
                  }
                  className="border px-3 py-2 rounded-md w-full"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">User Type</label>
                <select
                  type="text"
                  value={contactToEdit?.user_type || ""}
                  onChange={(e) =>
                    setContactToEdit({
                      ...contactToEdit,
                      mobile_number: e.target.value,
                    })
                  }
                  className="border px-3 py-2 rounded-md w-full"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Status</label>
                <input
                  type="text"
                  value={contactToEdit?.status || ""}
                  onChange={(e) =>
                    setContactToEdit({
                      ...contactToEdit,
                      status: e.target.value,
                    })
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