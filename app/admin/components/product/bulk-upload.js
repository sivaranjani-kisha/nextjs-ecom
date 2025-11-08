"use client";

import React, { useRef, useEffect, useState } from "react";
import Link from "next/link";
import { ToastContainer, toast } from "react-toastify";

export default function BulkUploadPage() {
  const [excelFile, setExcelFile]                                   = useState(null);
  const [excelFileMovement, setExcelFileMovement]                   = useState(null);
  const [productFilterValue, setProductFilterValue]                 = useState(null);
  const [categoryUpload, setCategoryUpload]                         = useState(null);
  const [imageZip, setImageZip]                                     = useState(null);
  const [overviewZip, setOverviewZip]                               = useState(null);
  const [message, setMessage]                                       = useState("");
  const [isLoading, setIsLoading]                                   = useState(false);
  const [activeUploadType, setActiveUploadType]                     = useState(null);
  const [isFilterUploadLoading, setIsFilterUploadLoading]           = useState(false);
  const [isFilterGroupUploadLoading, setIsFilterGroupUploadLoading] = useState(false);
  const overviewFormRef                                             = useRef(null);
  const filterValueFormRef                                          = useRef(null);
  const movementFormRef                                             = useRef(null);
  const filterGroupFormRef                                          = useRef(null);
  const filterFormRef                                               = useRef(null);
  const categoryFormRef                                             = useRef(null);
  
  

  const validateFile = (file, allowedExtensions) => {
    if (!file) return false;
    const fileName = file.name.toLowerCase();
    return allowedExtensions.some((ext) => fileName.endsWith(ext));
  };
  
  useEffect(() => {
    import("react-toastify/dist/ReactToastify.css");
  }, []);

  const validateFilterFile = (file) => {
    if (!file) return false;
    const name = file.name.toLowerCase();
    return name.endsWith(".xlsx") || name.endsWith(".csv");
  };

  const handleFilterSubmit = async (e) => {
    e.preventDefault();

    if (!excelFile || !validateFilterFile(excelFile)) {
      toast.error("Please upload a valid Excel (.xlsx) or CSV (.csv) file.");
      return;
    }

    const formData = new FormData();
    formData.append("excel", excelFile);

    setIsFilterUploadLoading(true);

    try {
      const res = await fetch("/api/filter/bulk_upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok || res.status === 207) {
        // 207 = partial success
        toast.success(data.message);

        // show detailed row errors if any
        if (data.details && data.details.length > 0) {
          data.details.forEach((error) => {
            toast.error(`Row ${error.row}: ${error.error}`);
          });
        }

        // reset form
        setExcelFile(null);
        const fileInput = document.querySelector('input[type="file"]');
        if (fileInput) fileInput.value = "";
      } else {
        toast.error(data.error || "Upload failed");
      }

      filterFormRef.current?.reset();
      setExcelFile(null);

    } catch (err) {
      console.error("Upload error:", err);
      toast.error("Upload failed. Please try again.");
    } finally {
      setIsFilterUploadLoading(false);
    }
  };

  const validateGroupFilterFile = (file) => {
    if (!file) return false;
    const name = file.name.toLowerCase();
    return name.endsWith(".xlsx") || name.endsWith(".csv");
  };

  const handleFilterGroupSubmit = async (e) => {
    e.preventDefault();

    if (!excelFile || !validateGroupFilterFile(excelFile)) {
      toast.error("Please upload a valid Excel (.xlsx) or CSV (.csv) file.");
      return;
    }

    const formData = new FormData();
    formData.append("excel", excelFile);

    setIsFilterGroupUploadLoading(true);

    try {
      const res = await fetch("/api/filter_group/bulk-upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok || res.status === 207) {
        // 207 means partial success
        if (res.status === 201) {
          toast.success(data.message);
        } else {
          toast.success(data.message);
          // Show detailed errors if any
          if (data.details && data.details.length > 0) {
            data.details.forEach(error => {
              toast.error(`Row ${error.row}: ${error.error}`);
            });
          }
        }
  
        setExcelFile(null);
        const fileInput = document.querySelector('input[type="file"]');
        if (fileInput) fileInput.value = '';
      } else {
        toast.error(data.error || "Upload failed");
      }

      filterGroupFormRef.current?.reset();
      setExcelFile(null);

    } catch (err) {
      toast.error("Upload failed. Please try again.");
      console.error("Upload error:", err);
    } finally {
      setIsFilterGroupUploadLoading(false);
    }
    
  };

  const handleFilterGroupSampleDownload = () => {
    const link = document.createElement("a");
    link.href = `/uploads/files/sample_filter.xlsx?t=${Date.now()}`;
    link.download = "FilterGroupSample.xlsx";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSampleDownload = () => {
    const link = document.createElement("a");
    link.href = `/uploads/files/sample_filter_upload.xlsx?t=${Date.now()}`;
    link.download = "FilterUploadSample.xlsx";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadSampleMovement = () => {
    const link = document.createElement("a");
    link.href = `/uploads/files/sample_bulk_upload.xlsx?t=${Date.now()}`;
    link.download = "MovementUploadSample.xlsx";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadCategories = () => {
    const link    = document.createElement("a");
    link.href     = `/uploads/files/sampleCategory.xlsx?t=${Date.now()}`;
    link.download = "Category_Bulk_Upload_Sample.xlsx";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  const handleSubmit = async (e, uploadType) => {
    e.preventDefault();

    const form        = e.target;
    const formData    = new FormData(form);

    if(uploadType == "overview") {

      // Validate required files - only Excel is required now
      if (!excelFile || !validateFile(excelFile, [".xlsx", ".csv"])) {
        toast.error("Please upload a valid Excel (.xlsx) or CSV (.csv) file.");
        return;
      }

      // Validate optional image ZIP file
      if (imageZip && !validateFile(imageZip, [".zip"])) {
        toast.error("Please upload a valid .zip file for product images.");
        return;
      }

      // Validate optional Overview ZIP file
      if (overviewZip && !validateFile(overviewZip, [".zip"])) {
        toast.error("Please upload a valid .zip file for overview images.");
        return;
      }

      setIsLoading(true);
      setMessage(null);

      // const formData = new FormData();
      formData.append("excel", excelFile);
      if (imageZip) formData.append("images", imageZip);
      if (overviewZip) formData.append("overview", overviewZip);

      try {
        const response = await fetch("/api/product/bulk-upload", {
          method: "POST",
          body: formData,
        });

        const data = await response.json();

        if (response.ok) {
          toast.success(data.message);
        } else {
          toast.error(data.error);
        }

        overviewFormRef.current?.reset();
        setExcelFile(null);
        
      } catch (error) {
        toast.error(error);
      } finally {
        setIsLoading(false);
      }

    }else if (uploadType == "movement") {
      if(!excelFileMovement || !validateFile(excelFileMovement, ['.xlsx', '.csv'])) {
        toast.error("Please upload a valid Excel (.xlsx) or CSV (.csv) file.");
        return;
      }
    
      setIsLoading(true);
      setActiveUploadType(uploadType);
      setMessage(null);
      formData.append("excel", excelFileMovement);
  
      try {
        const response = await fetch('/api/product/bulk-upload', {
          method: "PATCH",
          body: formData,
        });
  
        const data = await response.json();
  
        if (response.ok) {
          toast.success(data.message);
        } else {
          toast.error(data.error);
        }

        movementFormRef.current?.reset();
        setExcelFileMovement(null);
  
      }catch (error){
        toast.error(error);
      }finally {
        setIsLoading(false);
        setActiveUploadType(uploadType);
      }

    }else if (uploadType == "filter_values") {

      if(!productFilterValue || !validateFile(productFilterValue, ['.xlsx', '.csv'])) {
        toast.error("Please upload a valid Excel (.xlsx) or CSV (.csv) file.");
        return;
      }

      setIsLoading(true);
      setActiveUploadType(uploadType);
      setMessage(null);
      formData.append("excel", productFilterValue);

      try {
        const response = await fetch('/api/product/bulk-upload/filter', {
          method: "POST",
          body: formData,
        });

        const data    = await response.json();

        if(response.ok) {
          toast.success(data.message);
        }else {
          toast.error(data.error);
        }

        filterValueFormRef.current?.reset();
        setProductFilterValue(null);

      }catch(error) {
        toast.error(error);
      }finally {
        setIsLoading(false);
        setActiveUploadType(uploadType);
      }

    }else if (uploadType == "category"){
        // Read and parse the uploaded Excel/CSV on the client,
        // then call the single-category API per row.
        if(!productFilterValue || !validateFile(productFilterValue, ['.xlsx', '.csv'])) {
          toast.error("Please upload a valid Excel (.xlsx) or CSV (.csv) file.");
          return;
        } 
        
        setIsLoading(true);
        setActiveUploadType(uploadType);
        setMessage(null);
        
        try {
          const file = productFilterValue;
          const name = file.name.toLowerCase();
          const arrayBuffer = await file.arrayBuffer();
          const XLSX = await import('xlsx');
          let rows = [];

          if (name.endsWith('.csv')) {
            const csvText = new TextDecoder('utf-8').decode(arrayBuffer);
            const workbook = XLSX.read(csvText, { type: 'string' });
            rows = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
          } else {
            const data = new Uint8Array(arrayBuffer);
            const workbook = XLSX.read(data, { type: 'array' });
            rows = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
          }

          const results = { added: 0, skipped: 0, errors: [] };

          for (const [idx, row] of rows.entries()) {
            // Support common header name variations; adapt if your sheet headers differ.
            const category_name = (row.SubCatgoryName || row.subcatgoryname || row.SubCatgoryName || '').toString().trim();
            const parentid = (row.ParentName || row.parentname || row.parentname || 'none').toString().trim() || 'none';
            /////alert(`Category: ${category_name}, Parent: ${parentid}`);
            const status = (row.Status || row.status || 'Active').toString().trim() || 'Active';
            const show_on_home = (row.ShowOnHome || row.show_on_home || 'No').toString().trim() || 'No';

            if (!category_name) {
              results.errors.push({ row: idx + 2, error: "Missing CategoryName" });
              continue;
            }

            const fd = new FormData();
            fd.append('category_name', category_name);
            fd.append('parentid_new', parentid);
            fd.append('status', status);
            fd.append('show_on_home', show_on_home);

            try {
              const res = await fetch('/api/categories/add', { method: 'POST', body: fd });
              const data = await res.json();
              if (res.ok) {
                results.added++;
              } else {
                // If server says category exists, count as skipped, otherwise record error
                const msg = (data && data.error) ? data.error.toString().toLowerCase() : '';
                if (res.status === 400 && msg.includes('already exists')) {
                  results.skipped++;
                } else {
                  results.errors.push({ row: idx + 2, error: data.error || 'Unknown error' });
                }
              }
            } catch (err) {
              results.errors.push({ row: idx + 2, error: err.message || 'Network error' });
            }
          }

          if (results.added) toast.success(`${results.added} categories added.`);
          if (results.skipped) toast.info(`${results.skipped} categories skipped (already exist).`);
          if (results.errors.length) {
            results.errors.forEach(e => toast.error(`Row ${e.row}: ${e.error}`));
          }

          filterValueFormRef.current?.reset();
          setProductFilterValue(null);

        } catch (err) {
          console.error("Category bulk upload error:", err);
          toast.error("Upload failed. " + (err.message || ""));
        } finally {
          setIsLoading(false);
          setActiveUploadType(null);
        }
    }else if (uploadType == "category_product") {
      if(!categoryUpload || !validateFile(categoryUpload, ['.xlsx', '.csv'])) {
        toast.error("Please upload a valid Excel (.xlsx) or CSV (.csv) file.");
        return;
      }

      setIsLoading(true);
      setActiveUploadType(uploadType);
      setMessage(null);
      formData.append("excel", categoryUpload);

      try{
        const response = await fetch('/api/product/bulk-upload/category', {
          method: 'POST',
          body: formData,
        });

        const data    = await response.json();

        if(response.ok) {
          toast.success(data.message);
        }else {
          toast.error(data.error);
        }

        categoryFormRef.current?.reset();
        setCategoryUpload(null);

      }catch(error){
        toast.error(error);
      }finally {
        setIsLoading(false);
        setActiveUploadType(uploadType);
      }

    }

  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = `/uploads/files/SampleFormat.xlsx?t=${Date.now()}`;
    link.download = 'SampleFormat.xlsx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleZipDownload = () => {
    const link = document.createElement('a');
    link.href = `/uploads/files/Sample.zip?t=${Date.now()}`;
    link.download = 'Sample.zip';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadFilterValues = () => {
    const link = document.createElement('a');
    link.href = `/uploads/files/filter_values_bulk_upload_new.xlsx?t=${Date.now()}`;
    link.download = 'filter_values_bulk_upload_new.xlsx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadCategoryValues = () => {
    const link = document.createElement('a');
    link.href = `/uploads/files/NewCategoryBulkUploadSample.xlsx?t=${Date.now()}`;
    link.download = 'NewCategoryBulkUploadSample.xlsx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const handleDownloadProductCategoryValues = () => {
    const link = document.createElement('a');
    link.href = `/uploads/files/SampleFormatProductCategoryValues.xlsx?t=${Date.now()}`;
    link.download = 'SampleFormatProductCategoryValues.xlsx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Bulk Product Upload</h1>
          <p className="text-gray-600">Upload products in bulk using Excel/CSV and ZIP files</p>
        </div>

        <form ref={overviewFormRef} onSubmit={(e) => handleSubmit(e, "overview")} className="bg-white rounded-xl shadow-lg overflow-hidden p-6 space-y-8">
          <Link
            href="/admin/product/status_bulk"
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium shadow-sm transition duration-150 inline-block"
          >
            Status bulkupload
          </Link>
          
          {/* Excel File Section */}
          <div className="border border-gray-200 rounded-lg p-6 hover:border-blue-500 transition-colors">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Excel/CSV File
              </h3>
              <p className="text-sm text-gray-500 mt-1">Upload your product data file</p>
            </div>
            <div className="space-y-4">
              <input
                type="file"
                accept=".xlsx,.csv"
                onChange={(e) => setExcelFile(e.target.files?.[0] || null)}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-red-100"
                required
              />
              <button
                type="button"   // <-- Add this
                onClick={handleDownload}
                className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 transition-colors"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download Sample Format
              </button>

            </div>
          </div>

          {/* Product Images Section - Now Optional */}
          <div className="border border-gray-200 rounded-lg p-6 hover:border-blue-500 transition-colors">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Product Images (ZIP)
                <span className="text-xs font-normal text-gray-500 bg-gray-100 px-2 py-1 rounded-full">Optional</span>
              </h3>
              <p className="text-sm text-gray-500 mt-1">Upload compressed product images (optional). If not provided, existing images will be preserved.</p>
            </div>
            <div className="space-y-4">
              <input
                type="file"
                accept=".zip"
                onChange={(e) => setImageZip(e.target.files?.[0] || null)}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-blue-700 hover:file:bg-red-100"
              />
              <button
                type="button"   // <-- Add this
                onClick={handleZipDownload}
                className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 transition-colors"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download Sample ZIP
              </button>
            </div>
          </div>

          {/* Overview Images Section */}
          <div className="border border-gray-200 rounded-lg p-6 hover:border-blue-500 transition-colors">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Overview Images (ZIP)
                <span className="text-xs font-normal text-gray-500 bg-gray-100 px-2 py-1 rounded-full">Optional</span>
              </h3>
              <p className="text-sm text-gray-500 mt-1">Upload additional overview images (optional). If not provided, existing images will be preserved.</p>
            </div>
            <input
              type="file"
              accept=".zip"
              onChange={(e) => setOverviewZip(e.target.files?.[0] || null)}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-blue-700 hover:file:bg-red-100"
            />
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-start gap-3 mt-8">
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isLoading && activeUploadType == "overview" ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Uploading...
                </span>
              ) : (
                'Start Upload'
              )}
            </button>
          </div>
        </form>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl mt-6 shadow-lg overflow-hidden p-6 space-y-8">
          {/* Filter Bulk Upload section */}
          <div className="border border-gray-200 rounded-lg p-6 hover:border-blue-500 transition-colors">
            <div className="mb-4">
              <h2 className="text-md font-semibold text-blue-600 mb-6 border-b pb-2">
                Filter Bulk Upload
              </h2>
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Excel/CSV File
              </h3>
              <p className="text-sm text-gray-500 mt-1">Upload your product data file</p>
            </div>
            <div className="space-y-4">
              <input
                type="file"
                accept=".xlsx,.csv"
                onChange={(e) => setExcelFile(e.target.files?.[0] || null)}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-red-100"
                required
              />
              <button
                type="button"   // <-- Add this
                onClick={handleSampleDownload}
                className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 transition-colors"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download Sample Format
              </button>
              <div className="flex mt-5 justify-between">
          <button
            onClick={handleFilterSubmit}
            disabled={isFilterUploadLoading}
            className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none disabled:opacity-50 transition-colors flex items-center"
          >
            {isFilterUploadLoading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Uploading...
              </>
            ) : (
              "Upload Filter"
            )}
          </button>
        </div>

            </div>
          </div>
        </form>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl mt-6 shadow-lg overflow-hidden p-6 space-y-8">
          <div className="border border-gray-200 rounded-lg p-6 hover:border-blue-500 transition-colors">
            <div className="mb-4">
                <h2 className="text-md font-semibold text-blue-600 mb-6 border-b pb-2">
                Filter Group Bulk Upload
              </h2>
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Excel/CSV File
              </h3>
              <p className="text-sm text-gray-500 mt-1">Upload your product data file</p>
            </div>
            <div className="space-y-4">
              <input
                type="file"
                accept=".xlsx,.csv"
                onChange={(e) => setExcelFile(e.target.files?.[0] || null)}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                required
              />
              <button
                onClick={handleFilterGroupSampleDownload}
                className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 transition-colors"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download Sample Format
              </button>
              <div className="flex mt-5 justify-between">
          <button
            onClick={handleFilterGroupSubmit}
            disabled={isFilterGroupUploadLoading}
            className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none disabled:opacity-50 transition-colors flex items-center"
          >
            {isFilterGroupUploadLoading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Uploading...
              </>
            ) : (
              "Upload Filter Groups"
            )}
          </button>
        </div>

            </div>
          </div>
        </form>

        <form ref={movementFormRef} onSubmit={(e) => handleSubmit(e, "movement")} className="bg-white rounded-xl mt-6 shadow-lg overflow-hidden p-6 space-y-8">
          {/* Bulk UPload Movement Section */}
          <div className="border border-gray-200 rounded-lg p-6 hover:border-blue-500 transition-colors">
            <div className="mb-4">
              <h2 className="text-md font-semibold text-blue-600 mb-6 border-b pb-2">Movement Type Bulk Upload</h2>
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Excel/CSV File
              </h3>
              <p className="text-sm text-gray-500 mt-1">Upload your product movement file</p>
            </div>
            <div className="space-y-4">
              <input type="file" accept=".xlsx,.csv" onChange={(e) => setExcelFileMovement(e.target.files?.[0] || null)} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-red-100" required />
            </div>

            <button type="button" onClick={handleDownloadSampleMovement} className="inline-flex items-center pt-5 text-sm text-blue-600 hover:text-blue-800 transition-colors" >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download Sample Format
            </button>
          </div>

          <div className="flex mt-5 justify-between">
            <button
              type="submit"
              disabled={isLoading}
              className="bg-[#3B82F6] hover:bg-[#3B82F6] text-white px-3 py-2 rounded-md flex items-center gap-2"
            >
              {isLoading && activeUploadType == "movement" ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Uploading...
                </span>
              ) : (
                'Upload Movement'
              )}
            </button>

          </div>
        </form>

        <form ref={filterValueFormRef} onSubmit={(e) => handleSubmit(e, "filter_values")} className="bg-white rounded-xl mt-6 shadow-lg overflow-hidden p-6 space-y-8">
          <div className="border border-gray-200 rounded-lg p-6 hover:border-blue-500 transition-colors">
            <div className="mb-4">
              <h2 className="text-md font-semibold text-blue-600 mb-6 border-b pb-2">Filter Values Bulk Upload <small className="items-start"> (size,capacity,type,etc,..)</small> </h2>
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Excel/CSV File
              </h3>
              <p className="text-sm text-gray-500 mt-1">Upload your product filter values file</p>
            </div>
            <div className="space-y-4">
              <input type="file" accept=".xlsx,.csv" onChange={(e) => setProductFilterValue(e.target.files?.[0] || null)} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-red-100" required />
            </div>

            <button type="button" onClick={handleDownloadFilterValues} className="inline-flex items-center pt-5 text-sm text-blue-600 hover:text-blue-800 transition-colors" >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download Sample Format
            </button>
          </div>

          <div className="flex mt-5 justify-between">
            <button
              type="submit"
              disabled={isLoading}
              className="bg-[#3B82F6] hover:bg-[#3B82F6] text-white px-3 py-2 rounded-md flex items-center gap-2"
            >
              {isLoading && activeUploadType == "filter_values" ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Uploading...
                </span>
              ) : (
                'Upload Product Filter Values'
              )}
            </button>

          </div>
        </form>

        <form ref={filterValueFormRef} onSubmit={(e) => handleSubmit(e, "category")} className="bg-white rounded-xl mt-6 shadow-lg overflow-hidden p-6 space-y-8">
          <div className="border border-gray-200 rounded-lg p-6 hover:border-blue-500 transition-colors">
            <div className="mb-4">
              <h2 className="text-md font-semibold text-blue-600 mb-6 border-b pb-2">New Category Bulk Upload  </h2>
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Excel/CSV File
              </h3>
              <p className="text-sm text-gray-500 mt-1">Please upload your category fields along with their corresponding values.</p>
            </div>
            <div className="space-y-4">
              <input type="file" accept=".xlsx,.csv" onChange={(e) => setProductFilterValue(e.target.files?.[0] || null)} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-red-100" required />
            </div>

            <button type="button" onClick={handleDownloadCategoryValues} className="inline-flex items-center pt-5 text-sm text-blue-600 hover:text-blue-800 transition-colors" >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download Sample Format
            </button>
          </div>

          <div className="flex mt-5 justify-between">
            <button
              type="submit"
              disabled={isLoading}
              className="bg-[#3B82F6] hover:bg-[#3B82F6] text-white px-3 py-2 rounded-md flex items-center gap-2"
            >
              {isLoading && activeUploadType == "filter_values" ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Uploading...
                </span>
              ) : (
                'Upload New Categories'
              )}
            </button>

          </div>
        </form>

        <form ref={categoryFormRef} onSubmit={(e) => handleSubmit(e, "category_product")} className="bg-white rounded-xl mt-6 shadow-lg overflow-hidden p-6 space-y-8">
          <div className="border border-gray-200 rounded-lg p-6 hover:border-blue-500 transition-colors">
            <div className="mb-4">
              <h2 className="text-md font-semibold text-blue-600 mb-6 border-b pb-2">Category Bulk Upload</h2>
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Excel/CSV File
              </h3>
              <p className="text-sm text-gray-500 mt-1">Upload your Category file</p>
            </div>
            <div className="space-y-4">
              <input type="file" accept=".xlsx,.csv" onChange={(e) => setCategoryUpload(e.target.files?.[0] || null)} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-red-100" required />
            </div>

            <button type="button" onClick={handleDownloadCategories} className="inline-flex items-center pt-5 text-sm text-blue-600 hover:text-blue-800 transition-colors" >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download Sample Format
            </button>
          </div>

          <div className="flex mt-5 justify-between">
            <button
              type="submit"
              disabled={isLoading}
              className="bg-[#3B82F6] hover:bg-[#3B82F6] text-white px-3 py-2 rounded-md flex items-center gap-2"
            >
              {isLoading && activeUploadType == "category_product" ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Uploading...
                </span>
              ) : (
                'Upload Category'
              )}
            </button>

          </div>
        </form>

        <ToastContainer position="top-right" autoClose={5000} />
      </div>
    </div>
  );
}