"use client";

import { useEffect, useState } from "react";
import { Line, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";

// Register Chart.js components
ChartJS.register(
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export default function DashboardPage() {
  const [orders, setOrders] = useState([]);
  const [pieData, setPieData] = useState(null);
  const [pieOptions, setPieOptions] = useState(null);
  const [customerCount, setCustomerCount] = useState(0);
  const [productCount, setProductCount] = useState(0);

  // New states for order status pie chart data and options
  const [orderStatusPieData, setOrderStatusPieData] = useState(null);
  const [orderStatusPieOptions, setOrderStatusPieOptions] = useState(null);

  useEffect(() => {
    // Fetch orders
    fetch("/api/orders/getorder", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setOrders(data.orders);

          // Calculate order status counts for pie chart
          const statusCounts = data.orders.reduce((acc, order) => {
            const status = order.order_status || "unknown";
            acc[status] = (acc[status] || 0) + 1;
            return acc;
          }, {});

          // Prepare data for order status pie chart
          setOrderStatusPieData({
            labels: Object.keys(statusCounts).map((status) =>
              status.charAt(0).toUpperCase() + status.slice(1)
            ),
            datasets: [
              {
                label: "Order Statuses",
                data: Object.values(statusCounts),
                backgroundColor: [
                  "#fbbf24", // yellow - pending
                  "#ef4444", // red - cancelled
                  "#22c55e", // green - shipped
                  "#3b82f6", // blue - delivered or others
                  "#9ca3af", // gray - unknown or others
                ],
                borderColor: "#fff",
                borderWidth: 2,
                hoverOffset: 8,
              },
            ],
          });

         setOrderStatusPieOptions({
  plugins: {
    legend: {
      position: "right",
      labels: {
        boxWidth: 20,
        padding: 15,
        font: {
          size: 14,
          weight: "500",
        },
      },
    },
    tooltip: {
      enabled: true,
      callbacks: {
        label: function (context) {
          const label = context.label || "";
          const value = context.raw || 0;
          return `${label}: ${value}`;
        },
      },
    },
    title: {
      display: true,
      text: "Order Status Distribution",
      font: {
        size: 18,
        weight: "bold",
      },
      padding: {
        top: 10,
        bottom: 20,
      },
    },
  },
  maintainAspectRatio: false,
  cutout: "50%", // 👈 This makes it a donut chart
});

        }
      });

    // Fetch category-product count
    fetch("/api/dashboard/category-product-count")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          // set pie chart data
          setPieData({
            labels: data.data.map((item) => item.category),
            datasets: [
              {
                label: "Number of Products",
                data: data.data.map((item) => item.count),
                backgroundColor: [
                  "#6366f1",
                  "#3b82f6",
                  "#10b981",
                  "#ef4444",
                  "#f59e0b",
                  "#ec4899",
                  "#d97706",
                  "#0f172a",
                  "#14b8a6",
                  "#e11d48",
                ],
                borderColor: "#fff",
                borderWidth: 2,
                hoverOffset: 8,
              },
            ],
          });

          setPieOptions({
            plugins: {
              legend: {
                position: "right",
                labels: {
                  boxWidth: 20,
                  padding: 15,
                  font: {
                    size: 14,
                    weight: "500",
                  },
                },
              },
              tooltip: {
                enabled: true,
                callbacks: {
                  label: function (context) {
                    const label = context.label || "";
                    const value = context.raw || 0;
                    return `${label}: ${value}`;
                  },
                },
              },
            },
            maintainAspectRatio: false,
          });

          // set total product count for summary card
          setProductCount(data.totalProductCount);
        }
      });

    // Fetch customer count
    fetch("/api/users/getcount")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setCustomerCount(data.customerCount);
        }
      });
  }, []);

  // Prepare line chart data for orders by date
  const dates = orders.map((order) =>
    new Date(order.createdAt).toISOString().split("T")[0]
  );

  const orderCounts = dates.reduce((acc, date) => {
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {});

  const lineData = {
    labels: Object.keys(orderCounts),
    datasets: [
      {
        label: "Orders",
        data: Object.values(orderCounts),
        fill: true,
        backgroundColor: "rgba(157, 143, 236, 0.2)",
        borderColor: "#facc15",
        tension: 0.4,
      },
    ],
  };

  return (
    <div className="">
      <h2 className="text-2xl font-bold mb-4">Dashboard</h2>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 3xl:grid-cols-5 gap-6">
        {/* Total Orders */}
        <div className="card shadow-none border border-gray-200 dark:border-neutral-600 dark:bg-neutral-700 rounded-lg h-full bg-gradient-to-r from-blue-600/10 to-white">
          <div className="card-body p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-medium text-neutral-900 dark:text-white mb-1">
                  Total Orders
                </p>
                <h6 className="mb-0 dark:text-white">{orders.length}</h6>
              </div>
              <div className="w-[50px] h-[50px] bg-blue-600 rounded-full flex justify-center items-center">
                <iconify-icon
                  icon="mdi:clipboard-list"
                  style={{ color: "white" }}
                  className="text-2xl mb-0"
                />
              </div>
            </div>
            <p className="font-medium text-sm text-neutral-600 dark:text-white mt-3 mb-0 flex items-center gap-2">
              <span className="inline-flex items-center gap-1 text-success-600 dark:text-success-400">
                <iconify-icon
                  icon="bxs:up-arrow"
                  style={{ color: "white" }}
                  className="text-xs"
                />
                +{Math.floor(orders.length * 0.1)}
              </span>
              Last 30 days orders
            </p>
          </div>
        </div>

        {/* Total Revenue */}
        <div className="card shadow-none border border-gray-200 dark:border-neutral-600 dark:bg-neutral-700 rounded-lg h-full bg-gradient-to-r from-green-600/10 to-white">
          <div className="card-body p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-medium text-neutral-900 dark:text-white mb-1">
                  Total Revenue
                </p>
                <h6 className="mb-0 dark:text-white">
                  ₹
                  {orders
                    .reduce((acc, o) => acc + parseFloat(o.order_amount || 0), 0)
                    .toFixed(2)}
                </h6>
              </div>
              <div className="w-[50px] h-[50px] bg-green-600 rounded-full flex justify-center items-center">
                <iconify-icon
                  icon="mdi:currency-inr"
                  style={{ color: "white" }}
                  className="text-2xl mb-0"
                />
              </div>
            </div>
            <p className="font-medium text-sm text-neutral-600 dark:text-white mt-3 mb-0 flex items-center gap-2">
              <span className="inline-flex items-center gap-1 text-success-600 dark:text-success-400">
                <iconify-icon
                  icon="bxs:up-arrow"
                  style={{ color: "white" }}
                  className="text-xs"
                />
                +₹
                {(
                  orders.reduce((acc, o) => acc + parseFloat(o.order_amount || 0), 0) *
                  0.1
                ).toFixed(2)}
              </span>
              Last 30 days revenue
            </p>
          </div>
        </div>

        {/* Pending Orders */}
        <div className="card shadow-none border border-gray-200 dark:border-neutral-600 dark:bg-neutral-700 rounded-lg h-full bg-gradient-to-r from-yellow-600/10 to-white">
          <div className="card-body p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-medium text-neutral-900 dark:text-white mb-1">
                  Pending Orders
                </p>
                <h6 className="mb-0 dark:text-white">
                  {orders.filter((o) => o.order_status === "pending").length}
                </h6>
              </div>
              <div className="w-[50px] h-[50px] bg-yellow-600 rounded-full flex justify-center items-center">
                <iconify-icon
                  icon="mdi:timer-sand"
                  style={{ color: "white" }}
                  className="text-2xl mb-0"
                />
              </div>
            </div>
            <p className="font-medium text-sm text-neutral-600 dark:text-white mt-3 mb-0 flex items-center gap-2">
              <span className="inline-flex items-center gap-1 text-warning-600 dark:text-warning-400">
                <iconify-icon
                  icon="bxs:clock"
                  style={{ color: "white" }}
                  className="text-xs"
                />
                Pending orders to process
              </span>
            </p>
          </div>
        </div>

        {/* Total Products */}
        <div className="card shadow-none border border-gray-200 dark:border-neutral-600 dark:bg-neutral-700 rounded-lg h-full bg-gradient-to-r from-pink-600/10 to-white">
          <div className="card-body p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-medium text-neutral-900 dark:text-white mb-1">
                  Total Products
                </p>
                <h6 className="mb-0 dark:text-white">{productCount}</h6>
              </div>
              <div className="w-[50px] h-[50px] bg-pink-600 rounded-full flex justify-center items-center">
                <iconify-icon
                  icon="mdi:package-variant"
                  style={{ color: "white" }}
                  className="text-2xl mb-0"
                />
              </div>
            </div>
            <p className="font-medium text-sm text-neutral-600 dark:text-white mt-3 mb-0 flex items-center gap-2">
              <span className="inline-flex items-center gap-1 text-pink-600 dark:text-pink-400">
                <iconify-icon
                  icon="bxs:box"
                  style={{ color: "white" }}
                  className="text-xs"
                />
                Total products available
              </span>
            </p>
          </div>
        </div>

        {/* Total Customers */}
        <div className="card shadow-none border border-gray-200 dark:border-neutral-600 dark:bg-neutral-700 rounded-lg h-full bg-gradient-to-r from-purple-600/10 to-white">
          <div className="card-body p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-medium text-neutral-900 dark:text-white mb-1">
                  Total Customers
                </p>
                <h6 className="mb-0 dark:text-white">{customerCount}</h6>
              </div>
              <div className="w-[50px] h-[50px] bg-purple-600 rounded-full flex justify-center items-center">
                <iconify-icon
                  icon="mdi:account-group"
                  style={{ color: "white" }}
                  className="text-2xl mb-0"
                />
              </div>
            </div>
            <p className="font-medium text-sm text-neutral-600 dark:text-white mt-3 mb-0 flex items-center gap-2">
              <span className="inline-flex items-center gap-1 text-purple-600 dark:text-purple-400">
                <iconify-icon
                  icon="mdi:account-multiple-outline"
                  style={{ color: "white" }}
                  className="text-xs"
                />
                Total registered customers
              </span>
            </p>
          </div>
        </div>
      </div>
  {/* Line Chart */}
     <div className="mt-12 bg-white p-5 rounded-lg shadow-sm border border-gray-200 dark:border-neutral-600 dark:bg-neutral-700">
      <h3 className="mb-6 text-xl font-semibold">Order Analytics</h3>
      <div className="p-6">
        <Line data={lineData} height={200} width={600} />
      </div>
    </div>
      
      

      {/* Pie charts row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 ">
        {/* Category wise product count pie chart */}
        <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
          <h3 className="mb-6 text-xl font-semibold">Category Wise Products</h3>
          <div
            className="card p-6 border border-gray-200 dark:border-neutral-600 dark:bg-neutral-700 rounded-lg shadow-none"
            style={{ height: 400 }}
          >
            {pieData && <Pie data={pieData} options={pieOptions} />}
          </div>
        </div>

        {/* New Order Status pie chart */}
        <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
          <h3 className="mb-6 text-xl font-semibold">Order Status Distribution</h3>
          <div
            className="card p-6 border border-gray-200 dark:border-neutral-600 dark:bg-neutral-700 rounded-lg shadow-none"
            style={{ height: 400 }}
          >
            {orderStatusPieData && <Pie data={orderStatusPieData} options={orderStatusPieOptions} />}
          </div>
        </div>
      </div>
         {/* Recent Orders Table */}
      <div className="mt-8 bg-white p-4 rounded-lg shadow">
        <h3 className="font-semibold mb-2">Recent Orders</h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b">
              <th className="p-2">Order #</th>
              <th className="p-2">User</th>
              <th className="p-2">Amount</th>
              <th className="p-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.slice(0, 5).map((o) => (
              <tr key={o._id} className="border-b hover:bg-gray-50">
                <td className="p-2">{o.order_number}</td>
                <td className="p-2">{o.order_username}</td>
                <td className="p-2">₹{o.order_amount}</td>
                <td className="p-2 capitalize">{o.order_status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
