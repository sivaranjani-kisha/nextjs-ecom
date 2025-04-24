"use client";
import  React,{ useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { ChevronDown, ChevronUp } from "react-feather";
import { FaPlus, FaMinus } from "react-icons/fa";
import ReactPaginate from "react-paginate";
import ProductCard from "@/components/ProductCard";
import Addtocart from "@/components/AddToCart";

export default function CategoryPage() {
  const [categoryData, setCategoryData] = useState({
    category: null,
    brands: [],
    filters: []
  });
  const [products, setProducts] = useState([]);
  const [selectedFilters, setSelectedFilters] = useState({
    categories: [],
    brands: [],
    price: { min: 0, max: 100000 },
    filters: []
  });
  const [priceRange, setPriceRange] = useState([0, 100000]);
  const [filterGroups, setFilterGroups] = useState({});
  const [loading, setLoading] = useState(true);
  const { slug } = useParams();

    const [currentPage, setCurrentPage] = useState(0);
    const [sortOption, setSortOption] = useState(''); // Add this with your other state declarations
    const itemsPerPage = 5; // 5 records per page
  
    const handlePageClick = ({ selected }) => {
      setCurrentPage(selected);
    };

    const [isCategoriesExpanded, setIsCategoriesExpanded] = useState(true);
    const [isBrandsExpanded, setIsBrandsExpanded] = useState(true);
    const [expandedFilters, setExpandedFilters] = useState({}); 
  // State to toggle the main "Filters" section
  const [isFiltersExpanded, setIsFiltersExpanded] = useState(true);
  const [wishlist, setWishlist] = useState([]); 
  // Toggle functions
  const toggleFilters = () => setIsFiltersExpanded(!isFiltersExpanded);


    // Toggle function
    const toggleCategories = () => {
      setIsCategoriesExpanded(!isCategoriesExpanded);
    };
    const toggleBrands = () => setIsBrandsExpanded(!isBrandsExpanded);
    const toggleFilterGroup = (id) => {
      setExpandedFilters(prev => ({ ...prev, [id]: !prev[id] }));
    };
  useEffect(() => {
    if (slug) {
      fetchInitialData();
    }
  }, [slug]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      
      // Fetch category data (brands, filters, etc.)
      const categoryRes = await fetch(`/api/categories/${slug}`);
      const categoryData = await categoryRes.json();
   
      setCategoryData({
        ...categoryData,
        categoryTree: categoryData.category, // Hierarchical categoryData
        allCategoryIds: categoryData.allCategoryIds
      });
      
      // Set initial price range based on products in category
      if (categoryData.products?.length > 0) {
        const prices = categoryData.products.map(p => p.special_price );
        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);
        setPriceRange([minPrice, maxPrice]);
        setSelectedFilters(prev => ({
          ...prev,
          price: { min: minPrice, max: maxPrice }
        }));
      }
      
      // Organize filters by their groups
      const groups = {};
      categoryData.filters.forEach(filter => {
        const groupId = filter.filter_group_name;
        
        if (groupId) {
          if (!groups[groupId]) {
            groups[groupId] = {
              _id: groupId,
              name: filter.filter_group_name,
              slug: filter.filter_group_name.toLowerCase().replace(/\s+/g, '-'),
              filters: []
            };
          }
          groups[groupId].filters.push(filter);
        }
      });
      setFilterGroups(groups);
      
      // Fetch initial products
      if (categoryData.products?.length > 0) {
      await fetchFilteredProducts(categoryData);
      }
    } catch (error) {
      console.error('Error fetching initial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSortedProducts = () => {
    const sortedProducts = [...products];
    
    switch(sortOption) {
      case 'price-low-high':
        return sortedProducts.sort((a, b) => 
          (a.special_price ) - (b.special_price )
        );
      case 'price-high-low':
        return sortedProducts.sort((a, b) => 
          (b.special_price ) - (a.special_price )
        );
      case 'name-a-z':
        return sortedProducts.sort((a, b) => 
          a.name.localeCompare(b.name)
        );
      case 'name-z-a':
        return sortedProducts.sort((a, b) => 
          b.name.localeCompare(a.name)
        );
      default:
        return sortedProducts;
    }
  };

  const handleWishlistToggle = (productId) => {
    setWishlist(prev => 
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };
  
  const sortedProducts = getSortedProducts();

  const fetchFilteredProducts = async (categoryData) => {
    try {
      setLoading(true);
      
      const query = new URLSearchParams();
      const categoryId = categoryData.category.map(category => category._id);
      // query.set('categoryIds', categoryId.join(','));
      // const categoryIds = selectedFilters.categories.length > 0 
      // ? selectedFilters.categories 
      // : category?.map(c => c._id);
      const categoryIds = selectedFilters.categories.length > 0
      ? selectedFilters.categories
      : categoryData.allCategoryIds; // Use precomputed allCategoryIds from API

    query.set('categoryIds', categoryIds.join(','));

    query.set('categoryIds', categoryIds.join(','));

      
      if (selectedFilters.brands.length > 0) {
        query.set('brands', selectedFilters.brands.join(','));
      }
      
      query.set('minPrice', selectedFilters.price.min);
      query.set('maxPrice', selectedFilters.price.max);
      
      if (selectedFilters.filters.length > 0) {
        query.set('filters', selectedFilters.filters.join(','));
      }
      
      const res =await fetch(`/api/product/filter/main?${query}`);
      const data = await res.json();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching filtered products:', error);
    } finally {
      setLoading(false);
    }
  };
 

  const handleFilterChange = (type, value) => {
    setSelectedFilters(prev => {
      const newFilters = { ...prev };
      
      if (type === 'brands') {
        newFilters.brands = prev.brands.includes(value)
          ? prev.brands.filter(item => item !== value)
          : [...prev.brands, value];
      } else if (type === 'price') {
        newFilters.price = value;
      } else  if (type === 'categories') {
        newFilters.categories = prev.categories.includes(value)
          ? prev.categories.filter(item => item !== value)
          : [...prev.categories, value];
      }
       else {
        newFilters.filters = prev.filters.includes(value)
          ? prev.filters.filter(item => item !== value)
          : [...prev.filters, value];
      }
      return newFilters;
    });
  };

  const handlePriceChange = (values) => {
    setSelectedFilters(prev => ({
      ...prev,
      price: { min: values[0], max: values[1] }
    }));
  };

  const CategoryTree = ({ 
    categories, 
    level = 0, 
    selectedFilters, 
    onFilterChange 
  }) => {
    const [expandedCategories, setExpandedCategories] = useState([]);
  
    const toggleCategory = (categoryId) => {
      setExpandedCategories(prev => 
        prev.includes(categoryId)
          ? prev.filter(id => id !== categoryId)
          : [...prev, categoryId]
      );
    };
  
    return (
      <div className="space-y-2">
        {categories.map((category) => (
          <div key={category._id}>
            <div className={`flex items-center gap-2 ${level > 0 ? `ml-${level * 4}` : ''}`}>
              <button
                onClick={() => onFilterChange('categories', category._id)}
                className={`flex-1 text-left p-2 rounded hover:bg-gray-100 ${
                  selectedFilters.includes(category._id) 
                    ? 'bg-blue-100 font-medium' 
                    : ''
                }`}
              >
                {category.category_name}
              </button>
              
              {category.subCategories?.length > 0 && (
                <button
                  onClick={() => toggleCategory(category._id)}
                  className="p-2 hover:bg-gray-100 rounded"
                >
                  {expandedCategories.includes(category._id) ? (
                    <ChevronUp size={16} />
                  ) : (
                    <ChevronDown size={16} />
                  )}
                </button>
              )}
            </div>
            
            {category.subCategories?.length > 0 && 
              expandedCategories.includes(category._id) && (
                <CategoryTree 
                  categories={category.subCategories} 
                  level={level + 1}
                  selectedFilters={selectedFilters}
                  onFilterChange={onFilterChange}
                />
              )}
          </div>
        ))}
      </div>
    );
  };

  useEffect(() => {
    if (categoryData.main_category && categoryData.category) {
      fetchFilteredProducts( categoryData);
    }
  }, [selectedFilters, categoryData.main_category, categoryData.category]);

  const clearAllFilters = () => {
    setSelectedFilters({
      categories: [],
      brands: [],
      price: { min: priceRange[0], max: priceRange[1] },
      filters: []
    });
  };

  if (loading && !categoryData.category) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (!categoryData.category) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold">Category not found</h1>
      </div>
    );
  }
  const pageCount = Math.ceil(products.length / itemsPerPage);
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">{categoryData.category.category_name}</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Active Filters */}
          {(selectedFilters.brands.length > 0 || 
          selectedFilters.categories.length > 0 ||
           selectedFilters.filters.length > 0 ||
           selectedFilters.price.min !== priceRange[0] || 
           selectedFilters.price.max !== priceRange[1]) && (
            <div className="bg-white p-4 rounded shadow">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold">Active Filters</h3>
                <button 
                  onClick={clearAllFilters}
                  className="text-blue-600 text-sm hover:underline"
                >
                  Clear all
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedFilters.categories.map(categoryId => {
                  const category = categoryData.category?.find(c => c._id === categoryId);
                  return category ? (
                    <span 
                      key={categoryId}
                      className="bg-gray-100 px-2 py-1 rounded text-sm flex items-center"
                    >
                      {category.category_name}
                      <button 
                        onClick={() => handleFilterChange('categories', categoryId)}
                        className="ml-1 text-gray-500 hover:text-gray-700"
                      >
                        ×
                      </button>
                    </span>
                  ) : null;
                })}
                {selectedFilters.brands.map(brandId => {
                  const brand = categoryData.brands.find(b => b._id === brandId);
                  return brand ? (
                    <span 
                      key={brandId}
                      className="bg-gray-100 px-2 py-1 rounded text-sm flex items-center"
                    >
                      {brand.brand_name}
                      <button 
                        onClick={() => handleFilterChange('brands', brandId)}
                        className="ml-1 text-gray-500 hover:text-gray-700"
                      >
                        ×
                      </button>
                    </span>
                  ) : null;
                })}
                
                {selectedFilters.filters.map(filterId => {
                  const filter = Object.values(filterGroups)
                    .flatMap(g => g.filters)
                    .find(f => f._id === filterId);
                  return filter ? (
                    <span 
                      key={filterId}
                      className="bg-gray-100 px-2 py-1 rounded text-sm flex items-center"
                    >
                      {filter.filter_name}
                      <button 
                        onClick={() => handleFilterChange('filters', filterId)}
                        className="ml-1 text-gray-500 hover:text-gray-700"
                      >
                        ×
                      </button>
                    </span>
                  ) : null;
                })}
                
                {(selectedFilters.price.min !== priceRange[0] || 
                 selectedFilters.price.max !== priceRange[1]) && (
                  <span className="bg-gray-100 px-2 py-1 rounded text-sm flex items-center">
                    ₹{selectedFilters.price.min} - ₹{selectedFilters.price.max}
                    <button 
                      onClick={() => setSelectedFilters(prev => ({
                        ...prev,
                        price: { min: priceRange[0], max: priceRange[1] }
                      }))}
                      className="ml-1 text-gray-500 hover:text-gray-700"
                    >
                      ×
                    </button>
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Category Filter */}
          {/* <div className="bg-white p-4 rounded shadow">
            <h3 className="text-lg font-semibold mb-4">Subcategories</h3>
            <ul className="space-y-2">
              {categoryData.category?.map(subCategory => (
                <li key={subCategory._id}>
                  <button
                    onClick={() => handleFilterChange('categories', subCategory._id)}
                    className={`block w-full text-left p-2 rounded ${
                      selectedFilters.categories.includes(subCategory._id)
                        ? 'bg-blue-100 font-medium'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    {subCategory.category_name}
                  </button>
                </li>
              ))}
            </ul>
          </div> */}
          {/* Categories Tree */}
          <div className="bg-white p-4 rounded shadow border">
            <h3 className="text-lg font-semibold mb-4 pb-4 border-b-2">Categories</h3>
            {categoryData.categoryTree?.length > 0 ? (
              <CategoryTree categories={categoryData.categoryTree} selectedFilters={selectedFilters.categories}
              onFilterChange={handleFilterChange} />
            ) : (
              <p className="text-gray-500">No subcategories</p>
            )}
          </div>
          {/* <div className="bg-white p-4 rounded shadow">
            <h3 className="text-lg font-semibold mb-4">Categories</h3>
            <ul className="space-y-2">
              <li key='Categories'>
                <div className="flex items-center justify-between gap-2">
                  <button
                    type="button"
                    className={`flex-1 text-left p-2 rounded hover:bg-gray-100`}
                    onClick={toggleCategories} // Add click handler
                  >
                    {categoryData.main_category?.category_name || slug}
                  </button>
                  {categoryData.category?.length > 0 && (
                    <button 
                      className="p-2 hover:bg-gray-100 rounded"
                      onClick={toggleCategories}
                    >
                      {isCategoriesExpanded ? (
                        <ChevronUp size={16} />
                      ) : (
                        <ChevronDown size={16} />
                      )}
                    </button>
                  )}
                </div>
                {isCategoriesExpanded && categoryData.category?.length > 0 && (
                  <ul className="ml-4 mt-2 border-l-2 border-gray-100 pl-4">
                    {categoryData.category.map(subCategory => (
                      <li key={subCategory._id}>
                        <button
                          onClick={() => handleFilterChange('categories', subCategory._id)}
                          className={`block w-full text-left p-2 rounded ${
                            selectedFilters.categories.includes(subCategory._id)
                              ? 'bg-blue-100 font-medium'
                              : 'hover:bg-gray-100'
                          }`}
                        >
                          {subCategory.category_name}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            </ul>
          </div> */}

          {/* Price Filter */}
          <div className="bg-white p-4 rounded shadow border">
            <h3 className="text-lg font-semibold mb-4 pb-4 border-b-2">Price Range</h3>
            <div className="space-y-4">
              <input
                type="range"
                min={priceRange[0]}
                max={priceRange[1]}
                step="100"
                value={selectedFilters.price.max}
                onChange={(e) => handlePriceChange([
                  selectedFilters.price.min, 
                  parseInt(e.target.value)
                ])}
                className="w-full"
              />
              <div className="flex justify-between text-sm">
                <span>₹{selectedFilters.price.min}</span>
                <span>₹{selectedFilters.price.max}</span>
              </div>
            </div>
          </div>

          {/* Brand Filter */}
          {/* <div className="bg-white p-4 rounded shadow">
            <h3 className="text-lg font-semibold mb-4">Brands</h3>
            <ul className="space-y-2">
              {categoryData.brands.map(brand => (
                <li key={brand._id}>
                  <button
                    onClick={() => handleFilterChange('brands', brand._id)}
                    className={`flex items-center w-full text-left p-2 rounded ${
                      selectedFilters.brands.includes(brand._id) 
                        ? 'bg-blue-100 font-medium' 
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    {brand.image && (
                      <div className="w-8 h-8 mr-2 relative">
                        <Image
                          src={brand.image.startsWith('http') ? brand.image : `/uploads/brands/${brand.image}`}
                          alt={brand.brand_name}
                          fill
                          className="object-contain"
                          unoptimized
                        />
                      </div>
                    )}
                    <span>{brand.brand_name}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div> */}
          <div className="bg-white p-4 rounded shadow border">
            <div className="flex items-center justify-between pb-4 border-b-2">
              <h3 className="text-lg font-semibold">Brands</h3>
              <button onClick={toggleBrands}>
                {isBrandsExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
            </div>

            {isBrandsExpanded && (
              <ul className="mt-2 space-y-2">
                {categoryData.brands.map(brand => (
                  <li key={brand._id}>
                    <button
                      onClick={() => handleFilterChange('brands', brand._id)}
                      className={`flex items-center w-full text-left p-2 rounded ${selectedFilters.brands.includes(brand._id) ? 'bg-blue-100 font-medium' : 'hover:bg-gray-100'}`}
                    >
                      {brand.image && (
                        <div className="w-8 h-8 mr-2 relative">
                          <Image
                            src={brand.image.startsWith('http') ? brand.image : `/uploads/brands/${brand.image}`}
                            alt={brand.brand_name}
                            fill
                            className="object-contain"
                            unoptimized
                          />
                        </div>
                      )}
                      <span>{brand.brand_name}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Dynamic Filters */}
          {/* {Object.values(filterGroups).map(group => (
            <div key={group._id} className="bg-white p-4 rounded shadow">
              <h3 className="text-lg font-semibold mb-4">{group.name}</h3>
              <ul className="space-y-2">
                {group.filters.map(filter => (
                  <li key={filter._id}>
                    <button
                      onClick={() => handleFilterChange('filters', filter._id)}
                      className={`block w-full text-left p-2 rounded ${
                        selectedFilters.filters.includes(filter._id)
                          ? 'bg-blue-100 font-medium'
                          : 'hover:bg-gray-100'
                      }`}
                    >
                      {filter.filter_name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))} */}
          {/* Main Filters Toggle */}
            <div className="bg-white p-4 rounded shadow border">
              <div className="flex items-center justify-between pb-4 border-b-2">
                <h3 className="text-lg font-semibold">Filters</h3>
                {/* <button onClick={toggleFilters}>
                  {isFiltersExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button> */}
              </div>

              {/* Show Filter Groups only when Main Filters are Expanded */}
              {isFiltersExpanded && (
                <div className="mt-2 space-y-2">
                  {Object.values(filterGroups).map(group => (
                    <div key={group._id} className="pl-4 mb-4">
                      {/* Filter Group Header */}
                      <div className="flex items-center justify-between">
                        <h4 className="text-md font-semibold">{group.name}</h4>
                        <button onClick={() => toggleFilterGroup(group._id)}>
                          {expandedFilters[group._id] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>
                      </div>

                      {/* Filters inside the group (only show when expanded) */}
                      {expandedFilters[group._id] && (
                        <ul className="mt-2 space-y-2 pl-4 border-l-2 border-gray-200">
                          {group.filters.map(filter => (
                            <li key={filter._id}>
                              <button
                                onClick={() => handleFilterChange('filters', filter._id)}
                                className={`block w-full text-left p-2 rounded ${selectedFilters.filters.includes(filter._id) ? 'bg-blue-100 font-medium' : 'hover:bg-gray-100'}`}
                              >
                                {filter.filter_name}
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
        </div>

        {/* Products Grid */}
        <div className="lg:col-span-3">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium">No products found matching your filters</h3>
              <button 
                onClick={clearAllFilters}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <>
              <div className="mb-4 flex justify-between items-center">
                <p>{products.length} products found</p>
                <div className="flex items-center">
                  <label htmlFor="sort" className="mr-2 text-sm font-medium">Sort by:</label>
                  <select
                    id="sort"
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value)}
                    className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg px-4 py-2 pr-8 text-sm text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer shadow-sm"
                  >
                    <option value="">Default</option>
                    <option value="price-low-high">Price - Low to High</option>
                    <option value="price-high-low">Price - High to Low</option>
                    <option value="name-a-z">Name - (A-Z)</option>
                    <option value="name-z-a">Name - (Z-A)</option>
                  </select>
                </div>
              </div>
              
              {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {getSortedProducts().slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage).map(product => (
                  <div key={product._id} className="bg-white p-4 rounded-lg shadow hover:border-blue-700 transition-shadow border cursor-pointer">
                    <div className="relative h-48 mb-4">
                      {product.images?.[0] && (
                        <Image
                          src={
                            product.images[0].startsWith('http') 
                              ? product.images[0] 
                              : `/uploads/products/${product.images[0]}`
                          }
                          alt={product.name}
                          fill
                          className="object-contain cursor-pointer"
                          unoptimized
                        />
                      )}
                    </div>
                    <h3 className="text-lg font-semibold mb-2 line-clamp-2">
                      <Link href={`/products/${product.slug}`}>
                        {product.name}
                      </Link>
                    </h3>
                    <div className="flex items-center gap-2 mb-4">
                      {product.special_price && product.special_price !== product.price && (
                        <span className="text-gray-500 line-through">
                          ₹{product.price.toLocaleString()}
                        </span>
                      )}
                      <span className="text-xl font-bold text-blue-600">
                        ₹{(product.special_price || product.price).toLocaleString()}
                      </span>
                    </div>
                    <button className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition-colors">
                      Add to Cart
                    </button>
                  </div>
                ))}
              </div> */}

<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {getSortedProducts().slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage).map(product => (
    <div
      key={product._id}
      className="group flex flex-col h-full bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 border border-gray-100 hover:border-blue-200 relative"
    >
      {/* Image Section with Top Badges and Lowered Image */}
      <div className="relative h-52 w-full bg-white overflow-hidden flex justify-center">
        {/* Discount Badge - Top Left */}
        {product.special_price && product.special_price !== product.price && (
          <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded z-10">
            {Math.round(100 - (product.special_price / product.price * 100))}% OFF
          </span>
        )}

        {/* Wishlist Button - Top Right */}
        {/* <button className="absolute top-2 right-2 z-10" onClick={() => handleWishlistToggle(product._id)}>
          <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${wishlist.includes(product._id) ? 'text-red-500 fill-current' : 'text-gray-400 hover:text-red-500'}`} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={wishlist.includes(product._id) ? 0 : 1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
          </svg>
        </button> class="p-1 rounded-full bg-white shadow hover:text-red-500"*/}
        {/* <button
          className="absolute top-2 right-2 z-10 rounded-full bg-white shadow hover:text-red-500"
          onClick={() => handleWishlistToggle(product._id)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`lucide lucide-heart h-6 w-6 ${
              wishlist.includes(product._id)
                ? 'text-red-500 fill-current'
                : 'text-gray-400 hover:text-red-500'
            }`}
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
          >
            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
          </svg>
        </button> */}

<div className="absolute top-2 right-2 z-10  hover:text-red-500">
  <ProductCard productId={product._id} />
</div>

        {/* Product Image - Lowered slightly */}
        {product.images?.[0] && (
          <div className="mt-8"> {/* this pushes image down inside container */}
            <Image
              src={
                product.images[0].startsWith('http')
                  ? product.images[0]
                  : `/uploads/products/${product.images[0]}`
              }
              alt={product.name}
              width={160}
              height={160}
              className="object-contain transition-transform duration-500 group-hover:scale-105 max-h-44"
              unoptimized style={{ width: '15rem', height: '13rem' }}
            />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col flex-grow p-4">
        <Link href={`/product/${product.slug}`}>
          <h3 className="text-md font-semibold text-gray-800 mb-2 hover:text-blue-600 transition-colors line-clamp-2 min-h-[3rem]">
            {product.name}
          </h3>
        </Link>

        {/* Price */}
        <div className="mt-auto mb-3">
          <div className="flex items-center gap-2">
            {product.special_price && product.special_price !== product.price ? (
              <>
                <span className="text-lg font-bold text-blue-600">
                  Rs. {product.special_price.toLocaleString()}
                </span>
                <span className="text-gray-500 line-through text-sm">
                  MRP: {product.price.toLocaleString()}
                </span>
              </>
            ) : (
              <span className="text-lg font-bold text-gray-800">
                ₹{product.price.toLocaleString()}
              </span>
            )}
          </div>
        </div>

        {/* Add to Cart + WhatsApp */}
        <div className="flex items-center justify-between gap-3">
          
            <Addtocart productId={product._id} />
          

          {/* WhatsApp Icon */}
          <a
            href={`https://wa.me/?text=${encodeURIComponent(`Check this out: ${product.name}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-green-500 hover:bg-green-600 text-white p-2 rounded-full transition-colors duration-300"
          >
            <svg
              className="w-5 h-5"
              viewBox="0 0 32 32"
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
            >
              <path d="M16.003 2.667C8.64 2.667 2.667 8.64 2.667 16c0 2.773.736 5.368 2.009 7.629L2 30l6.565-2.643A13.254 13.254 0 0016.003 29.333C23.36 29.333 29.333 23.36 29.333 16c0-7.36-5.973-13.333-13.33-13.333zm7.608 18.565c-.32.894-1.87 1.749-2.574 1.865-.657.104-1.479.148-2.385-.148-.55-.175-1.256-.412-2.162-.812-3.8-1.648-6.294-5.77-6.49-6.04-.192-.269-1.55-2.066-1.55-3.943 0-1.878.982-2.801 1.33-3.168.346-.364.75-.456 1.001-.456.25 0 .5.002.719.013.231.01.539-.088.845.643.32.768 1.085 2.669 1.18 2.863.096.192.16.423.03.683-.134.26-.2.423-.39.65-.192.231-.413.512-.589.689-.192.192-.391.401-.173.788.222.392.986 1.625 2.116 2.636 1.454 1.298 2.682 1.7 3.075 1.894.393.192.618.173.845-.096.23-.27.975-1.136 1.237-1.527.262-.392.524-.32.894-.192.375.13 2.35 1.107 2.75 1.308.393.205.656.308.75.48.096.173.096 1.003-.224 1.897z" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  ))}
</div>

              






              
            </>
          )}
        </div>
      </div>
      {/* Pagination */}
      <ReactPaginate
        breakLabel={<span className="text-gray-400 px-4">...</span>}
        pageCount={pageCount}
        marginPagesDisplayed={1}
        pageRangeDisplayed={3}
        onPageChange={handlePageClick}
        containerClassName={"flex items-center justify-center mt-12 gap-1"}
        
        // Page numbers
        pageClassName={"relative"}
        pageLinkClassName={
          "block w-10 h-10 flex items-center justify-center rounded-full text-sm font-medium transition-all duration-300 " +
          "bg-gradient-to-b from-white to-gray-50 border border-gray-200 text-gray-600 shadow-sm hover:shadow-md " +
          "hover:from-blue-50 hover:to-blue-100 hover:border-blue-200 hover:text-blue-600 mx-1"
        }
        activeClassName={"transform active:scale-95"}
        activeLinkClassName={
          "!bg-gradient-to-b !from-blue-600 !to-blue-700 !text-white !border-blue-700 !shadow-lg"
        }

        // Arrows
        previousClassName={"mr-2"}
        nextClassName={"ml-2"}
        previousLinkClassName={
          "w-10 h-10 flex items-center justify-center rounded-full transition-all duration-300 " +
          "bg-gradient-to-b from-white to-gray-50 border border-gray-200 text-gray-600 shadow-sm " +
          "hover:shadow-md hover:from-blue-50 hover:to-blue-100 hover:border-blue-200 hover:text-blue-600"
        }
        nextLinkClassName={
          "w-10 h-10 flex items-center justify-center rounded-full transition-all duration-300 " +
          "bg-gradient-to-b from-white to-gray-50 border border-gray-200 text-gray-600 shadow-sm " +
          "hover:shadow-md hover:from-blue-50 hover:to-blue-100 hover:border-blue-200 hover:text-blue-600"
        }
        
        // Break dots
        breakClassName={"mx-1"}
        breakLinkClassName={"text-gray-400 hover:text-gray-600"}

        // Custom arrow icons with hover effect
        previousLabel={
          <div className="group flex items-center">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-5 w-5 text-gray-500 group-hover:text-blue-600 transition-colors"
              viewBox="0 0 20 20" 
              fill="currentColor"
            >
              <path 
                fillRule="evenodd" 
                d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" 
                clipRule="evenodd" 
              />
            </svg>
          </div>
        }
        nextLabel={
          <div className="group flex items-center">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-5 w-5 text-gray-500 group-hover:text-blue-600 transition-colors"
              viewBox="0 0 20 20" 
              fill="currentColor"
            >
              <path 
                fillRule="evenodd" 
                d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" 
                clipRule="evenodd" 
              />
            </svg>
          </div>
        }
      />
    </div>
  );
}