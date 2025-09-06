"use client";
import { useEffect, useState,Fragment  } from "react";

export default function BrandBannerManager() {
  const [brands, setBrands] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [selectedBanner, setSelectedBanner] = useState(null);
  const [formData, setFormData] = useState({
    brandName: "",
    brandSlug: "",
    brandImage: null,
    bannerName: "",
    bannerImage: null,
    redirectUrl: "",
    status: "Active",
    bannerStatus: "Active",
  });
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch brands
  const fetchBrands = async () => {
    const res = await fetch("/api/brand/banner");
    const data = await res.json();
    if (data.success) setBrands(data.brands);
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  // Handle input change
  const handleInputChange = (key, value) => {
    setFormData({ ...formData, [key]: value });
  };

  // Open modal for brand / banner
  const openModal = (brand, banner = null) => {
    setSelectedBrand(brand);
    setSelectedBanner(banner);
    setFormData({
      brandName: brand.brand_name,
      brandSlug: brand.brand_slug,
      brandImage: null,
      bannerName: banner ? banner.banner_name : "",
      bannerImage: null,
      redirectUrl: banner ? banner.redirect_url : "",
      status: brand.status,
      bannerStatus: banner ? banner.banner_status : "Active",
    });
    setIsModalOpen(true);
  };

  // Save brand/banner
  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);

    const fd = new FormData();
    if (formData.brandImage) fd.append("brandImage", formData.brandImage);
    if (formData.bannerImage) fd.append("bannerImage", formData.bannerImage);
    fd.append("brand_name", formData.brandName);
    fd.append("brand_slug", formData.brandSlug);
    fd.append("status", formData.status);
    fd.append("banner_name", formData.bannerName);
    fd.append("redirect_url", formData.redirectUrl);
    fd.append("banner_status", formData.bannerStatus);

    if (selectedBrand) fd.append("brandId", selectedBrand._id);
    if (selectedBanner) fd.append("bannerId", selectedBanner._id);

    const res = await fetch("/api/brand/banner", {
      method: "POST",
      body: fd,
    });
    const data = await res.json();
    setLoading(false);

    if (data.success) {
      alert("Saved successfully!");
      closeModal();
      fetchBrands();
    } else {
      alert("Error saving data");
    }
  };

  // Delete brand or banner
  const handleDelete = async (brandId, bannerId = null) => {
    if (!confirm("Are you sure you want to delete?")) return;

    const res = await fetch("/api/brand/banner", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ brandId, bannerId }),
    });
    const data = await res.json();
    if (data.success) {
      alert("Deleted successfully!");
      fetchBrands();
    }
  };

  const closeModal = () => {
    setSelectedBrand(null);
    setSelectedBanner(null);
    setFormData({
      brandName: "",
      brandSlug: "",
      brandImage: null,
      bannerName: "",
      bannerImage: null,
      redirectUrl: "",
      status: "Active",
      bannerStatus: "Active",
    });
    setIsModalOpen(false);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Manage Brands & Banners</h2>
      </div>

      <table className="w-full border-collapse border border-gray-300 bg-white shadow">
        <thead className="bg-gray-100">
          <tr>
            <th className="border px-3 py-2 w-1/4">Brand / Banner</th>
            <th className="border px-3 py-2 w-1/4">Redirect URL</th>
            <th className="border px-3 py-2 w-1/6">Status</th>
            <th className="border px-3 py-2 w-1/6">Actions</th>
          </tr>
        </thead>
        <tbody key="tbody">
            {brands.map((brand) => (
                <Fragment key={brand._id}>

                {/* Brand row */}
                <tr key={brand._id + "-row"} className="bg-gray-50">
                    <td className="border px-3 py-2 font-bold">{brand.brand_name}</td>
                    <td colSpan={2}></td>
                    <td className="border px-3 py-2 text-right">
                    <button
                        onClick={() => openModal(brand)}
                        className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                    >
                        + Add Banner
                    </button>
                    </td>
                </tr>

                {/* Banner rows */}
                {brand.banners?.map((banner) => (
                    <tr key={banner._id + "-banner"}>
                    <td className="border px-3 py-2 text-center">
                        <img
                        src={banner.banner_image}
                        alt="banner"
                        className="h-12 w-24 object-contain mx-auto"
                        />
                    </td>
                    <td className="border px-3 py-2">{banner.redirect_url}</td>
                    <td className="border px-3 py-2 text-center">
                        <span
                        className={`px-2 py-1 text-xs rounded ${
                            banner.banner_status === "Active"
                            ? "bg-green-100 text-green-600"
                            : "bg-red-100 text-red-600"
                        }`}
                        >
                        {banner.banner_status}
                        </span>
                    </td>
                    <td className="border px-3 py-2 text-center">
                        <div className="space-x-2">
                        <button
                            onClick={() => openModal(brand, banner)}
                            className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                        >
                            Edit
                        </button>
                        <button
                            onClick={() => handleDelete(brand._id, banner._id)}
                            className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                        >
                            Delete
                        </button>
                        </div>
                    </td>
                    </tr>
                ))}
                </Fragment>
            ))}
        </tbody>

      </table>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg w-[500px] relative">
            <button
              onClick={closeModal}
              className="absolute top-2 right-2 text-gray-600 hover:text-black"
            >
              ✖
            </button>
            <h3 className="text-lg font-semibold mb-4">
              {selectedBanner
                ? "Edit Banner"
                : selectedBrand
                ? "Add Banner"
                : "Add Brand"}
            </h3>

            <form onSubmit={handleSave} className="space-y-3">
              <input
                type="text"
                placeholder="Banner Name"
                value={formData.bannerName}
                onChange={(e) => handleInputChange("bannerName", e.target.value)}
                className="w-full border px-2 py-1 rounded"
              />
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleInputChange("bannerImage", e.target.files[0])}
              />
              <input
                type="text"
                placeholder="Redirect URL"
                value={formData.redirectUrl}
                onChange={(e) => handleInputChange("redirectUrl", e.target.value)}
                className="w-full border px-2 py-1 rounded"
              />
              <select
                value={formData.bannerStatus}
                onChange={(e) => handleInputChange("bannerStatus", e.target.value)}
                className="w-full border px-2 py-1 rounded"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>

              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                {loading ? "Saving..." : "Save"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
