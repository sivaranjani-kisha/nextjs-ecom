'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { HiHome } from 'react-icons/hi';
import { FaGreaterThan } from "react-icons/fa";

export default function ProductBreadcrumb({ product }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategoryHierarchy = async () => {
      try {
        if (!product?.category) {
          console.warn('No category ID found in product');
          return;
        }

        // First fetch all categories
        const allCategoriesRes = await fetch('/api/categories/breadcrumb');
        const allCategories = await allCategoriesRes.json();

        // Find current category
        const currentCategory = allCategories.find(
          cat => cat._id === product.category
        );

        if (!currentCategory) {
          console.warn('Category not found for product');
          return;
        }

        // Build hierarchy array
        const hierarchy = [currentCategory];
        
        // Find parent category if exists
        if (currentCategory.parentid) {
          const parentCategory = allCategories.find(
            cat => cat._id === currentCategory.parentid
          );
          if (parentCategory) {
            hierarchy.unshift(parentCategory); // Add to beginning
          }
        }

        setCategories(hierarchy);
      } catch (error) {
        console.error('Error fetching category data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryHierarchy();
  }, [product]);

  if (loading) {
    return (
      <div className="flex items-center text-sm mb-6">
        <div className="h-4 w-4 bg-gray-200 rounded mr-2"></div>
        <div className="h-4 w-20 bg-gray-200 rounded"></div>
        <span className="mx-2 text-gray-300">/</span>
        <div className="h-4 w-24 bg-gray-200 rounded"></div>
      </div>
    );
  }

  return (
    <div className="flex items-center text-sm mb-6 overflow-hidden">
      {/* Home Link */}
      <Link 
        href="/" 
        className="text-gray-500 hover:text-blue-500 transition-colors flex items-center whitespace-nowrap"
      >
        <HiHome className="h-4 w-4 mr-2" />
        Home
      </Link>
      
      {/* Category Hierarchy */}
      {categories.map((category, index) => (
        <div key={category._id} className="flex items-center">
          <span className="mx-2 text-gray-300"><FaGreaterThan /></span>
          {index < categories.length - 1 ? (
            <Link
              href={`/category/${category.category_slug || category._id}`}
              className="text-gray-500 hover:text-blue-500 whitespace-nowrap"
            >
              {category.category_name}
            </Link>
          ) : (
            <span className="text-gray-500 whitespace-nowrap">
              {category.category_name}
            </span>
          )}
        </div>
      ))}

      {/* Product Name */}
      <span className="mx-2 text-gray-300"><FaGreaterThan /></span>
      <span className="text-gray-700 font-medium truncate max-w-[200px]">
        {product.name}
      </span>
    </div>
  );
}