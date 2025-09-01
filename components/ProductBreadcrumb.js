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

      console.log('Building hierarchy for category ID:', product.category);

      // Fetch all categories
      const allCategoriesRes = await fetch('/api/categories/breadcrumb');
      const allCategories = await allCategoriesRes.json();
      
      console.log('All categories from API:', allCategories);

      // Helper function to find category by ID
      const findCategoryById = (id) => {
        return allCategories.find(cat => 
          String(cat._id) === String(id) || 
          (cat._id && cat._id.toString() === String(id))
        );
      };

      // Function to find the deepest category path
      const findDeepestCategoryPath = (categoryId, allCategories) => {
        let currentCategory = findCategoryById(categoryId);
        if (!currentCategory) return [];

        const hierarchy = [currentCategory];
        
        // If this category has children, find the deepest path
        const children = allCategories.filter(cat => 
          cat.parentid && String(cat.parentid) === String(categoryId)
        );

        if (children.length > 0) {
          // For simplicity, just take the first child
          const childHierarchy = findDeepestCategoryPath(children[0]._id, allCategories);
          hierarchy.push(...childHierarchy);
        }

        return hierarchy;
      };

      // Build hierarchy using the deepest path function
      const hierarchy = findDeepestCategoryPath(product.category, allCategories);

      console.log('Found current category:', hierarchy[0]);
      console.log('Final hierarchy:', hierarchy);

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
            <Link 
            href={`/category/${category.category_slug || category._id}`}
            className="text-gray-500 whitespace-nowrap hover:text-blue-500">
              {category.category_name}
            </Link>
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