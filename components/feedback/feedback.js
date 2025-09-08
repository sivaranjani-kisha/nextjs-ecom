"use client";

import { useState } from "react";
import { FaPhoneAlt, FaEnvelope } from "react-icons/fa";


export default function ContactForm() {
  const [form, setForm] = useState({
    name: "",
    email_address: "",
    mobile_number: "",
    city: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [responseMsg, setResponseMsg] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setResponseMsg("");

  try {
    const res = await fetch("/api/feedback/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();

    if (res.ok) {
      setResponseMsg("Message sent successfully!");
      setForm({ name: "", email_address: "", mobile_number: "", city: "", message: "" });

      // Clear message after 2 seconds
      setTimeout(() => {
        setResponseMsg("");
      }, 2000);
    } else {
      setResponseMsg(data.message || "Something went wrong");
    }
  } catch (error) {
    setResponseMsg("Server error");
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <div className="grid grid-cols-1 md:grid-cols-1 gap-10">
        
        {/* Contact Details (Moved to Left) */}
        {/* <div>
          <h2 className="text-3xl font-bold mb-6">Feedback</h2>
          <p className="font-semibold">You may contact us using the information below:</p>
          <p className="mt-1"><b>Registered Address: </b>383, 100 Feet Road, Gandhipuram, Coimbatore, Tamilnadu 641012</p>
          <p className="mt-1"><b>Operational Address:</b> 383, 100 Feet Road, Gandhipuram, Coimbatore, Tamilnadu 641012</p>
          <p className="mt-1"><b>Telephone No: </b> 9842344323</p>
          <p className="mt-1"><b>E-Mail ID: </b>customercare@bharathelectronics.in</p>
          <p className="mt-1"><b>Merchant Legal Entity Name:</b> Bharath Electronics and Appliances</p>
        </div> */}

        {/* Write Us Form (Now on Right) */}
        <div>
          <h1 className="text-3xl font-bold mb-6 text-center text-primary"> Thank you for Purchasing at Bharath Electronics & Appliances! </h1>
          <h2 className="text-3xl font-bold mb-6 text-center"> Bharath Electronics – Feedback </h2>
          <h3 className="text-center">Use the form below to get in touch with the sales team</h3>

          <form onSubmit={handleSubmit} className="px-8 mt-6">
            {/* Name */}
            <div className="mb-4">
              <label className="block font-medium mb-1">
                Name<span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>

            {/* Email */}
            <div className="mb-4">
              <label className="block font-medium mb-1">
                Email<span className="text-red-600">*</span>
              </label>
              <input
                type="email"
                name="email_address"
                value={form.email_address}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>

            {/* Phone */}
            <div className="mb-4">
              <label className="block font-medium mb-1">
                Phone <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                name="mobile_number"
                value={form.mobile_number}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>

            {/* invoice_number */}
            <div className="mb-4">
              <label className="block font-medium mb-1">
                Invoice Number <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                name="invoice_number"
                value={form.invoice_number}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>

            {/* product */}
            <div className="mb-4">
              <label className="block font-medium mb-1">
                Products <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                name="products"
                value={form.products}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>

            {/* City */}
            <div className="mb-4">
              <label className="block font-medium mb-1">
                City <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                name="city"
                value={form.city}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>

            {/* Message - Full Width */}
            <div className="md:col-span-2 mb-4">
              <label className="block font-medium mb-1">
                Feedback<span className="text-red-600">*</span>
              </label>
              <textarea
                name="feedback"
                value={form.feedback}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2 h-28"
              ></textarea>
            </div>

            {/* Submit Button - Full Width */}
            <div className="md:col-span-2">
              <button
                type="submit"
                disabled={loading}
                className="bg-red-600 text-white px-6 py-2 rounded-md"
              >
                {loading ? "Submitting..." : "Submit"}
              </button>

              {responseMsg && (
                <p className="text-green-600 font-medium mt-2">{responseMsg}</p>
              )}
            </div>
          </form>
        </div>

      </div>
    </div>

  );
}
