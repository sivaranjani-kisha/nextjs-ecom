"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import DateRangePicker from "@/components/DateRangePicker";
import "react-toastify/dist/ReactToastify.css";

const OrdersTable = () => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [deliveryType, setDeliveryType] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [filtered, setFiltered] = useState([]);
  const itemsPerPage = 20;
  const router = useRouter();

  const [dateFilter, setDateFilter] = useState({
    startDate: null,
    endDate: null,
  });

  // 📌 Email modal states
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [oldStatus, setOldStatus] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      const res = await fetch("/api/allorders");
      const data = await res.json();
      setOrders(data);
      setFiltered(data);
      setIsLoading(false);
    };
    fetchOrders();
  }, []);

  // 🔎 Filters
  useEffect(() => {
    const applyFilters = () => {
      let updated = [...orders];

      if (status) {
        updated = updated.filter(
          (o) => o.order_status?.toLowerCase() === status.toLowerCase()
        );
      }

      if (deliveryType) {
        updated = updated.filter(
          (o) => o.delivery_type?.toLowerCase() === deliveryType.toLowerCase()
        );
      }

      if (paymentMethod) {
        updated = updated.filter(
          (o) => o.payment_method?.toLowerCase() === paymentMethod.toLowerCase()
        );
      }

      if (searchTerm.trim()) {
        const lower = searchTerm.toLowerCase();
        updated = updated.filter(
          (o) =>
            o.order_number?.toLowerCase().includes(lower) ||
            o.order_username?.toLowerCase().includes(lower)
        );
      }

      if (dateFilter?.startDate && dateFilter?.endDate) {
        const startDate = new Date(dateFilter.startDate);
        const endDate = new Date(dateFilter.endDate);
        endDate.setHours(23, 59, 59, 999);

        updated = updated.filter((o) => {
          const orderDate = new Date(o.createdAt);
          return orderDate >= startDate && orderDate <= endDate;
        });
      }

      setFiltered(updated);
    };

    applyFilters();
  }, [
    status,
    deliveryType,
    paymentMethod,
    searchTerm,
    orders,
    dateFilter?.startDate,
    dateFilter?.endDate,
  ]);

  // 📅 Handle date
  const handleDateChange = ({ startDate, endDate }) => {
    setDateFilter({ startDate, endDate });
    setCurrentPage(0);
  };

  const paginatedOrders = filtered.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  const pageCount = Math.ceil(filtered.length / itemsPerPage);

  const paginate = (pageIndex) => {
    if (pageIndex >= 0 && pageIndex < pageCount) {
      setCurrentPage(pageIndex);
    }
  };

  useEffect(() => {
    setCurrentPage(0);
  }, [status, deliveryType, paymentMethod, searchTerm, orders, dateFilter]);

  return (
    <div className="container mx-auto">
      <ToastContainer position="top-right" autoClose={5000} />

      <div className="flex justify-between items-center mb-5">
        <h2 className="text-2xl font-bold">All Orders</h2>
      </div>

      {isLoading ? (
        <p>Loading order...</p>
      ) : (
        <div className="bg-white shadow-md rounded-lg p-5 h-[500px] overflow-x-auto">
          {/* 🔍 Filters */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-end mb-4">
            {/* Search */}
            <div className="w-full">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search
              </label>
              <input
                type="text"
                placeholder="Search all orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-3 pr-3 py-2 border border-gray-300 rounded-md w-full text-sm focus:outline-none focus:ring-2 focus:ring-red-200"
              />
            </div>

            {/* Status */}
            <div className="w-full">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Order Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500 text-sm"
              >
                <option value="">All</option>
                <option value="pending">Pending</option>
                <option value="order placed">Order Placed</option>
                <option value="invoiced">Invoiced</option>
                <option value="cancelled">Cancelled</option>
                <option value="rejected">Rejected</option>
                <option value="completed">Completed</option>
                <option value="shipped">Shipped</option>
              </select>
            </div>

            {/* Delivery */}
            <div className="w-full">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Delivery Type
              </label>
              <select
                value={deliveryType}
                onChange={(e) => setDeliveryType(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500 text-sm"
              >
                <option value="">All</option>
                <option value="home">Home Delivery</option>
                <option value="store_pickup">Store Pickup</option>
              </select>
            </div>

            {/* Payment */}
            <div className="w-full">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Payment Method
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500 text-sm"
              >
                <option value="">All</option>
                <option value="online">Online</option>
                <option value="cash">COD</option>
              </select>
            </div>

            {/* Date */}
            <div className="w-full">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date Range
              </label>
              <DateRangePicker onDateChange={handleDateChange} />
            </div>
          </div>

          {/* 📋 Table */}
          <div className="overflow-x-auto">
            <table className="w-full border border-gray-300">
              <thead>
                <tr className="bg-gray-200">
                  <th className="p-2">Action</th>
                  <th className="p-2">Order Id</th>
                  <th className="p-2">Order Status</th>
                  <th className="p-2">Name</th>
                  <th className="p-2">Amount</th>
                  <th className="p-2">Date</th>
                </tr>
              </thead>
              <tbody>
                {paginatedOrders.length ? (
                  paginatedOrders.map((o, i) => (
                    <tr key={i} className="border-t">
                      <td className="p-2 border text-center">
                        <button
                          onClick={() =>
                            router.push(`/admin/Allorder/${o._id}`)
                          }
                          className="text-sm text-white bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded-md"
                        >
                          👁 View
                        </button>
                      </td>

                      <td className="p-2 border">{o.order_number}</td>

                      {/* Status dropdown */}
                      <td className="p-2 border">
                        <select
                          value={o.order_status}
                          onChange={async (e) => {
                            const newStatus = e.target.value;
                            const prevStatus = o.order_status;

                            try {
                              const res = await fetch(`/api/orders/${o._id}`, {
                                method: "PUT",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ status: newStatus }),
                              });

                              if (!res.ok) throw new Error();

                              toast.success("Order Status updated successfully");

                              setOrders((prev) =>
                                prev.map((ord) =>
                                  ord._id === o._id
                                    ? { ...ord, order_status: newStatus }
                                    : ord
                                )
                              );

                              // 📌 If Pending → Shipped, open modal
                              if (
                                prevStatus.toLowerCase() === "pending" &&
                                newStatus.toLowerCase() === "shipped"
                              ) {
                                setSelectedOrder({
                                  ...o,
                                  newStatus,
                                });
                                setOldStatus(prevStatus);
                                setShowEmailModal(true);
                              }
                            } catch (err) {
                              toast.error("Failed to update status");
                              e.target.value = prevStatus;
                            }
                          }}
                          className="border px-2 py-1 rounded-md text-sm"
                        >
                          <option value="pending">Pending</option>
                          <option value="shipped">Shipped</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>

                      <td className="p-2 border">{o.order_username}</td>
                      <td className="p-2 border">₹{o.order_amount}</td>
                      <td className="p-2 border">
                        {new Date(o.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="6"
                      className="text-center text-gray-500 p-4"
                    >
                      No orders found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex justify-between items-center mt-6 flex-wrap gap-3">
            <div className="text-sm text-gray-600">
              Showing{" "}
              {filtered.length === 0
                ? 0
                : currentPage * itemsPerPage + 1}{" "}
              to{" "}
              {Math.min(
                (currentPage + 1) * itemsPerPage,
                filtered.length
              )}{" "}
              of {filtered.length} entries
            </div>

            <div className="flex items-center space-x-1">
              <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 0}
                className="px-3 py-1.5 border rounded-md"
              >
                «
              </button>
              {Array.from({ length: pageCount }, (_, i) => (
                <button
                  key={i}
                  onClick={() => paginate(i)}
                  className={`px-3 py-1.5 border rounded-md ${
                    currentPage === i
                      ? "bg-red-500 text-white"
                      : "bg-white"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === pageCount - 1 || pageCount === 0}
                className="px-3 py-1.5 border rounded-md"
              >
                »
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 📧 Email Modal */}
      {showEmailModal && selectedOrder && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h3 className="text-lg font-semibold mb-4">Send Email?</h3>
            <p className="text-sm text-gray-600 mb-4">
              Order <b>{selectedOrder.order_number}</b> for user{" "}
              <b>{selectedOrder.order_username}</b> has been updated
              from <b>{oldStatus}</b> → <b>{selectedOrder.newStatus}</b>.
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowEmailModal(false)}
                className="px-4 py-2 bg-gray-300 rounded-md"
              >
                No
              </button>
              <button
                onClick={async () => {
                  try {
                    const res = await fetch("/api/order-send-mail", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        to: "estore.bharathelectronics.in",
                        to: "",
                        subject: `Order ${selectedOrder.order_number} Status Update`,
                        text: `Hi, Order ${selectedOrder.order_number} for ${selectedOrder.order_username} was updated from ${oldStatus} to ${selectedOrder.newStatus}.`,
                      }),
                    });

                    if (!res.ok) throw new Error("Failed to send mail");
                    toast.success("Email sent successfully!");
                  } catch (err) {
                    toast.error("Failed to send email");
                  } finally {
                    setShowEmailModal(false);
                  }
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-md"
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersTable;
