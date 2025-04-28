import { useState, useEffect } from "react";

export default function DesignComponent() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [bannerType, setBannerType] = useState("topbanner");
  const [bgImageSize, setBgImageSize] = useState({ width: 1680, height: 499 });
  const [bannerImageSize, setBannerImageSize] = useState({ width: 291, height: 147 });
  const [bgImage, setBgImage] = useState(null);
  const [bannerImage, setBannerImage] = useState(null);
  const [title, setTitle] = useState("");
  const [redirectUrl, setRedirectUrl] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [status, setStatus] = useState("active");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  
  // New state for table data and pagination
  const [banners, setBanners] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterBannerType, setFilterBannerType] = useState("");
  const [isLoadingBanners, setIsLoadingBanners] = useState(false);
  const [categoryImages, setCategoryImages] = useState({});
  const [categoryRedirectUrls, setCategoryRedirectUrls] = useState({});
  const itemsPerPage = 10;

  const bannerOptions = [
    { 
      value: "topbanner", 
      label: "Top Banner", 
      bgSize: { width: 1680, height: 499 },
      bannerSize: { width: 291, height: 147 }
    },
    { 
      value: "flashsale", 
      label: "Flash Sale", 
      bgSize: { width: 828, height: 250 },
      bannerSize: { width: 285, height: 173 }
    },
    { 
      value: "categorybanner", 
      label: "Category Banner", 
      categorySize: { width: 400, height: 400 } // Adjust dimensions as needed
    }
  ];

  // Fetch banners from API
  const fetchBanners = async () => {
    setIsLoadingBanners(true);
    try {
      let url = `/api/design/get?page=${currentPage}&limit=${itemsPerPage}`;
      
      if (searchTerm) {
        url += `&search=${searchTerm}`;
      }
      if (filterStatus) {
        url += `&status=${filterStatus}`;
      }
      if (filterBannerType) {
        url += `&bannerType=${filterBannerType}`;
      }
      
      const res = await fetch(url);
      const data = await res.json();
      
      if (res.ok) {
        setBanners(data.data);
        setTotalPages(data.pagination.pages);
        setTotalItems(data.pagination.total);
      } else {
        setErrors({ error: data.error || "Failed to fetch banners" });
      }
    } catch (err) {
      setErrors({ error: "Failed to fetch banners" });
      console.error(err);
    } finally {
      setIsLoadingBanners(false);
    }
  };
  const handleCategoryImageChange = (e, index) => {
    const file = e.target.files[0];
    setCategoryImages(prev => ({ ...prev, [index]: file }));
  };
  
  const handleCategoryRedirectUrlChange = (e, index) => {
    const value = e.target.value;
    setCategoryRedirectUrls(prev => ({ ...prev, [index]: value }));
  };
  
  // Load banners on component mount and when filters change
  useEffect(() => {
    fetchBanners();
  }, [currentPage, searchTerm, filterStatus, filterBannerType]);

  useEffect(() => {
    let timer;
    if (message) {
      timer = setTimeout(() => {
        setMessage("");
      }, 5000);
    }
    return () => clearTimeout(timer);
  }, [message]);

  const handleBannerChange = (e) => {
    const selectedType = e.target.value;
    setBannerType(selectedType);
    const selectedOption = bannerOptions.find(option => option.value === selectedType);
    setBgImageSize(selectedOption.bgSize);
    setBannerImageSize(selectedOption.bannerSize);
  };

  const handleBgImageChange = (e) => {
    const selectedImage = e.target.files[0];
    if (!selectedImage) return;
    
    setErrors(prev => ({ ...prev, bgImage: "" }));
    setBgImage(selectedImage);
  };

  const handleBannerImageChange = (e) => {
    const selectedImage = e.target.files[0];
    if (!selectedImage) return;
    
    setErrors(prev => ({ ...prev, bannerImage: "" }));
    setBannerImage(selectedImage);
  };

  const resetForm = () => {
    setBannerType("topbanner");
    setBgImageSize({ width: 1680, height: 499 });
    setBannerImageSize({ width: 291, height: 147 });
    setBgImage(null);
    setBannerImage(null);
    setTitle("");
    setRedirectUrl("");
    setStartDate("");
    setEndDate("");
    setStatus("active");
    setErrors({});
  };

  const openModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    const newErrors = {};
    
    // Common validations
    if (!startDate) newErrors.startDate = "Start date is required";
    if (!endDate) newErrors.endDate = "End date is required";
    if (endDate && startDate && endDate < startDate) newErrors.endDate = "End date must be after the start date";
  
    const validBannerTypes = bannerOptions.map(option => option.value);
    if (!validBannerTypes.includes(bannerType)) {
      newErrors.bannerType = "Invalid banner type";
    }
  
    // Banner type specific validations
    if (bannerType === 'categorybanner') {
      for (let i = 1; i <= 4; i++) {
        if (!categoryImages[i]) newErrors[`image${i}`] = `Image ${i} is required`;
        if (!categoryRedirectUrls[i]) newErrors[`redirectUrl${i}`] = `Redirect URL ${i} is required`;
      }
    }
    else {
      if (!bgImage) newErrors.bgImage = "Background image is required";
      if (!redirectUrl) newErrors.redirectUrl = "Redirect URL is required";
    }
  
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
  
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("title", title);
      formData.append("bannerType", bannerType);
      formData.append("startDate", startDate);
      formData.append("endDate", endDate);
      formData.append("status", status);
  
      if (bannerType === 'categorybanner') {
        for (let i = 1; i <= 4; i++) {
          formData.append(`image${i}`, categoryImages[i]);
          formData.append(`redirectUrl${i}`, categoryRedirectUrls[i]);
        }
      } else {
        formData.append("redirectUrl", redirectUrl);
        formData.append("bgImage", bgImage);
        if (bannerImage) formData.append("bannerImage", bannerImage);
      }
  
      const res = await fetch("/api/design/add", {
        method: "POST",
        body: formData,
      });
  
      const data = await res.json();
  
      if (res.ok) {
        setMessage(data.message || "Banner added successfully");
        resetForm();
        setIsModalOpen(false);
        setErrors({});
        fetchBanners();
      } else {
        setErrors(data.errors || { error: data.message || "Failed to add banner" });
      }
    } catch (err) {
      setErrors({ error: "Something went wrong, please try again." });
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  return (
    <div className="container mx-auto ">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-2xl font-bold">Design Banner List</h2>
        <button
          onClick={openModal}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition"
        >
          + Add Design Banner
        </button>
      </div>

      {message && (
        <div className="bg-green-500 text-white px-4 py-2 rounded-md mb-4">
          {message}
        </div>
      )}

      {errors.error && (
        <div className="bg-red-500 text-white px-4 py-2 rounded-md mb-4">
          {errors.error}
        </div>
      )}

      {/* Search and Filter Section */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Banner Type</label>
            <select
              value={filterBannerType}
              onChange={(e) => {
                setFilterBannerType(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Types</option>
              {bannerOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Banners Table */}
      <div className="bg-white shadow-md rounded-lg p-5 overflow-x-auto">
  <table className="w-full border border-gray-300">
    <thead>
      <tr className="bg-gray-200">
      <th className="p-2">Type</th>
        <th className="p-2">Title</th>
        <th className="p-2">From</th>
        <th className="p-2">To</th>
     
        <th className="p-2">Status</th>
        <th className="p-2">Action</th>
      </tr>
    </thead>
    <tbody>
      {banners.length > 0 ? (
        banners.map((banner) => (
          <tr key={banner._id} className="text-center border-b">
             <td className="p-2">
              {bannerOptions.find(opt => opt.value === banner.bannerType)?.label || banner.bannerType}
            </td>
            <td className="p-2 font-bold">{banner.title}</td>
            <td className="p-2">{formatDate(banner.startDate)}</td>
            <td className="p-2">{formatDate(banner.endDate)}</td>
           
            <td className="p-2 font-semibold">
              <span className={banner.status === 'active' ? 'text-green-500' : 'text-red-500'}>
                {banner.status.charAt(0).toUpperCase() + banner.status.slice(1)}
              </span>
            </td>
            <td className="p-2">
              <button className="bg-red-500 text-white px-3 py-1 rounded">Delete</button>
            </td>
          </tr>
        ))
      ) : (
        <tr>
          <td colSpan="6" className="p-4 text-center">
            No banners found
          </td>
        </tr>
      )}
    </tbody>
  </table>

  {/* Pagination */}
  {totalPages > 1 && (
    <div className="pagination flex justify-center mt-4">
      <button
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`px-3 py-2 border rounded mx-1 ${
          currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'hover:bg-gray-100'
        }`}
      >
        Previous
      </button>
      
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
        <button
          key={page}
          onClick={() => handlePageChange(page)}
          className={`px-3 py-2 border rounded mx-1 ${
            currentPage === page ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'
          }`}
        >
          {page}
        </button>
      ))}
      
      <button
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`px-3 py-2 border rounded mx-1 ${
          currentPage === totalPages ? 'text-gray-400 cursor-not-allowed' : 'hover:bg-gray-100'
        }`}
      >
        Next
      </button>
    </div>
  )}
</div>
      {/* Add Banner Modal (existing code remains the same) */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-8 rounded-lg shadow-lg w-[800px] max-w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold mb-4 text-center">Add Design Banner</h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block mb-2 font-medium">Type of Banner*</label>
                <select
                  value={bannerType}
                  onChange={handleBannerChange}
                  className="border p-2 rounded w-full mb-3"
                >
                  {bannerOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {errors.bannerType && <span className="text-red-500 text-sm">{errors.bannerType}</span>}
              </div>
              <div>
                <label className="block mb-2 font-medium">Title*</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="border p-2 rounded w-full mb-3"
                  placeholder="Enter banner title"
                />
                {errors.title && <span className="text-red-500 text-sm">{errors.title}</span>}
              </div>
            </div>

            {bannerType === 'categorybanner' ? (
  <div className="space-y-4">
    {[1, 2, 3, 4].map((num) => (
      <div key={num} className="grid grid-cols-2 gap-4 border p-4 rounded-lg">
        <div>
          <label className="block mb-2 font-medium">
            Image {num}* (Size: 400x400)
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleCategoryImageChange(e, num)}
            className="border p-2 rounded w-full"
          />
          {errors[`image${num}`] && (
            <span className="text-red-500 text-sm">{errors[`image${num}`]}</span>
          )}
          {categoryImages[num] && (
            <div className="mt-2 text-sm text-gray-500">
              Selected: {categoryImages[num].name} 
              ({(categoryImages[num].size / 1024).toFixed(2)} KB)
            </div>
          )}
        </div>
        <div>
          <label className="block mb-2 font-medium">Redirect URL {num}*</label>
          <input
            type="text"
            value={categoryRedirectUrls[num] || ""}
            onChange={(e) => handleCategoryRedirectUrlChange(e, num)}
            className="border p-2 rounded w-full"
            placeholder="https://example.com"
          />
          {errors[`redirectUrl${num}`] && (
            <span className="text-red-500 text-sm">{errors[`redirectUrl${num}`]}</span>
          )}
        </div>
      </div>
    ))}
  </div>
) : (
              <>
                <div className="mb-3">
                  <label className="block mb-2 font-medium">
                    Banner Background Image* (Size: {bgImageSize.width}x{bgImageSize.height})
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleBgImageChange}
                    className="border p-2 rounded w-full"
                  />
                  {errors.bgImage && <span className="text-red-500 text-sm">{errors.bgImage}</span>}
                  {bgImage && (
                    <div className="mt-2 text-sm text-gray-500">
                      Selected: {bgImage.name} ({(bgImage.size / 1024).toFixed(2)} KB)
                    </div>
                  )}
                </div>

                <div className="mb-3">
                  <label className="block mb-2 font-medium">
                    Banner Image* (Size: {bannerImageSize.width}x{bannerImageSize.height})
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleBannerImageChange}
                    className="border p-2 rounded w-full"
                  />
                  {errors.bannerImage && <span className="text-red-500 text-sm">{errors.bannerImage}</span>}
                  {bannerImage && (
                    <div className="mt-2 text-sm text-gray-500">
                      Selected: {bannerImage.name} ({(bannerImage.size / 1024).toFixed(2)} KB)
                    </div>
                  )}
                </div>

                <div>
                  <label className="block mb-2 font-medium">Redirect URL*</label>
                  <input
                    type="text"
                    value={redirectUrl}
                    onChange={(e) => setRedirectUrl(e.target.value)}
                    className="border p-2 rounded w-full mb-3"
                    placeholder="https://example.com"
                  />
                  {errors.redirectUrl && <span className="text-red-500 text-sm">{errors.redirectUrl}</span>}
                </div>
              </>
            )}

            {/* Common fields (status, dates) */}
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block mb-2 font-medium">Start Date*</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                  className="border p-2 rounded w-full mb-3"
                />
                {errors.startDate && <span className="text-red-500 text-sm">{errors.startDate}</span>}
              </div>
              <div>
                <label className="block mb-2 font-medium">End Date*</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={startDate || new Date().toISOString().split("T")[0]}
                  className="border p-2 rounded w-full mb-3"
                />
                {errors.endDate && <span className="text-red-500 text-sm">{errors.endDate}</span>}
              </div>
            </div>

            <div>
              <label className="block mb-2 font-medium">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="border p-2 rounded w-full mb-3"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setErrors({});
                }}
                className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded-md transition"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </span>
                ) : (
                  "Save"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}