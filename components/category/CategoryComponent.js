"use client";
import  React,{ useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { ChevronDown, ChevronUp } from "react-feather";
import ReactPaginate from "react-paginate";
import ProductCard from "@/components/ProductCard";
import Addtocart from "@/components/AddToCart";
import { ToastContainer, toast } from 'react-toastify';


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
  const [sortOption, setSortOption] = useState('');
  const itemsPerPage = 5;
  const handlePageClick = ({ selected }) => {
    setCurrentPage(selected);
  };
  const [isCategoriesExpanded, setIsCategoriesExpanded] = useState(true);
  const [isBrandsExpanded, setIsBrandsExpanded] = useState(true);
  const [expandedFilters, setExpandedFilters] = useState({}); 
  const [isFiltersExpanded, setIsFiltersExpanded] = useState(true);
  const [wishlist, setWishlist] = useState([]); 
  const toggleFilters = () => setIsFiltersExpanded(!isFiltersExpanded);
  const toggleCategories = () => {
    setIsCategoriesExpanded(!isCategoriesExpanded);
  };
  const toggleBrands = () => setIsBrandsExpanded(!isBrandsExpanded);
  const toggleFilterGroup = (id) => {
    setExpandedFilters(prev => ({ ...prev, [id]: !prev[id] }));
  };
  const [nofound,setNofound]=useState(false);

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
      }else{
        setNofound(true);
      }
    } catch (error) {
      // console.error('Error fetching initial data:', error);
      toast.error("Error fetching initial data",error);
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

  const sortedProducts = getSortedProducts();

  const fetchFilteredProducts = async (categoryData) => {
    try {
      setLoading(true);
      
      const query = new URLSearchParams();
      const categoryId = categoryData.category.map(category => category._id);
      const categoryIds = selectedFilters.categories.length > 0
      ? selectedFilters.categories
      : categoryData.allCategoryIds;
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
      toast.error('Error fetching filtered products',error);
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
              {/* <button
                onClick={() => onFilterChange('categories', category._id)}
                className={`flex-1 text-left p-2 rounded hover:bg-gray-100 text-gray-700 ${
                  selectedFilters.includes(category._id) 
                    ? 'bg-blue-100 font-medium' 
                    : ''
                }`}
              >
                {category.category_name}
              </button> */}
               <Link
                href={`/category/${slug}/${category.category_slug}`}
              
                className="p-2 hover:bg-gray-100 rounded inline-flex items-center"
              >{category.category_name}
                {/* {expandedCategories.includes(category._id) ? (
                  <ChevronUp size={16} />
                ) : (
                  <ChevronDown size={16} />
                )} */}
              </Link>
              
              {/* {category.subCategories?.length > 0 && (
                <Link
                href={`/category/${category._id}`}
                onClick={(e) => {
                  e.preventDefault(); // Optional: prevent navigation if you only want toggle
                  toggleCategory(category._id);
                }}
                className="p-2 hover:bg-gray-100 rounded inline-flex items-center"
              >{category.category_name}
                {expandedCategories.includes(category._id) ? (
                  <ChevronUp size={16} />
                ) : (
                  <ChevronDown size={16} />
                )}
              </Link>
              
              )} */}
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

  if (loading) {
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
    <div className="container mx-auto px-4 py-2 pb-3 max-w-7xl">
      {!loading && !nofound && categoryData.products.length > 0 ? (
        <>
       <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <h1 className="text-3xl font-bold mb-3 text-gray-600 pl-1">{categoryData.main_category.category_name}</h1>
        </div>
        <div className="lg:col-span-3">
          {/* Sorting and Count */}
          <div className="mb-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <p className="text-sm text-gray-600">{products.length} products found</p>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600">Sort by:</span>
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="px-4 py-2 border rounded-md text-sm bg-white shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Featured</option>
                <option value="price-low-high">Price: Low to High</option>
                <option value="price-high-low">Price: High to Low</option>
                <option value="name-a-z">Name: A-Z</option>
                <option value="name-z-a">Name: Z-A</option>
              </select>
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-col md:flex-row gap-4 md:gap-6">
        {/* Filters Sidebar */}
       
        <div className="w-full md:w-[250px] shrink-0">
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

          {/* Categories Tree */}
          <div className="bg-white p-4 rounded-lg shadow-sm border mb-3">
            <h3 className="text-base font-semibold mb-3 text-gray-700">Categories</h3>
            {categoryData.categoryTree?.length > 0 ? (
              <CategoryTree categories={categoryData.categoryTree} selectedFilters={selectedFilters.categories}
              onFilterChange={handleFilterChange} />
            ) : (
              <p className="text-gray-500 text-sm">No subcategories</p>
            )}
          </div>

          {/* Price Filter */}
          <div className="bg-white p-4 rounded-lg shadow-sm border mb-3">
            <h3 className="text-base font-semibold mb-4 text-gray-700">Price Range</h3>
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
                className="w-full range accent-blue-600"
              />
              <div className="flex justify-between text-sm text-gray-600">
                <span>₹{selectedFilters.price.min}</span>
                <span>₹{selectedFilters.price.max}</span>
              </div>
            </div>
          </div>

          {/* Brand Filter */}
          <div className="bg-white p-4 rounded-lg shadow-sm border mb-3">
              <div className="flex items-center justify-between pb-2">
                <h3 className="text-base font-semibold text-gray-700">Brands</h3>
                <button onClick={toggleBrands} className="text-gray-500 hover:text-gray-700">
                  {isBrandsExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </button>
              </div>
              {isBrandsExpanded && (
                <ul className="mt-2 space-y-2">
                  {categoryData.brands.map(brand => (
                    <li key={brand._id} className="flex items-center">
                      <button
                        onClick={() => handleFilterChange('brands', brand._id)}
                        className={`flex items-center w-full text-left p-2 rounded-md text-sm ${
                          selectedFilters.brands.includes(brand._id) 
                            ? 'bg-blue-50 text-blue-600' 
                            : 'text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        {brand.image && (
                          <div className="w-6 h-6 mr-2 relative">
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
            
          <div className="bg-white p-4 rounded-lg shadow-sm border mb-3 border-gray-100">
            <div className="pb-2 mb-2">
              <h3 className="text-base font-semibold text-gray-700">Product Filters</h3>
            </div>
            {isFiltersExpanded && (
              <div className="space-y-4">
                {Object.values(filterGroups).map(group => (
                  <div key={group._id} className="border-b border-gray-100 last:border-0 pb-4 last:pb-0">
                    {/* Filter Group Header */}
                    <button  onClick={() => toggleFilterGroup(group._id)} className="flex justify-between items-center w-full group">
                      <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors">{group.name}</span>
                      <ChevronDown 
                        size={18}
                        className={`text-gray-400 transition-transform duration-200 ${
                          expandedFilters[group._id] ? 'rotate-180' : ''
                        }`}
                      />
                    </button>

                    {/* Filter Options */}
                    {expandedFilters[group._id] && (
                      <ul className="mt-3 space-y-2 pl-1">
                        {group.filters.map(filter => (
                          <li key={filter._id} className="flex items-center">
                            <label className="flex items-center space-x-2 w-full cursor-pointer hover:bg-gray-50 rounded p-2 transition-colors">
                              <input
                                type="checkbox"
                                checked={selectedFilters.filters.includes(filter._id)}
                                onChange={() => handleFilterChange('filters', filter._id)}
                                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                              />
                              <span className="text-sm text-gray-600">{filter.filter_name}</span>
                              {filter.count && (
                                <span className="text-xs text-gray-400 ml-auto">
                                  ({filter.count})
                                </span>
                              )}
                            </label>
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
        {/* Products Section */}
        <div className="flex-1">
          {!loading && products.length > 0 ? (
            <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
              {getSortedProducts()
                .slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage)
                .map(product => (
                  <div key={product._id} className="group relative bg-white rounded-lg border hover:border-blue-200 transition-all shadow-sm hover:shadow-md">
                    <div className="relative aspect-square bg-gray-50">
                      {product.images?.[0] && (
                        <Image src={product.images[0].startsWith('http')  ? product.images[0]  : `/uploads/products/${product.images[0]}`} alt={product.name} fill className="object-contain p-2 md:p-4 transition-transform duration-300 group-hover:scale-105" 
                        sizes="(max-width: 640px) 50vw, 33vw, 25vw"
                        unoptimized  />
                      )}
                      <div >
                        {product.special_price &&
                          product.special_price !== product.price && (100 - (product.special_price / product.price) * 100) > 0 && (
                            <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded z-10">{Math.round(100 - (product.special_price / product.price) * 100)}% OFF</span>
                        )}
                      </div>

                      <div className="absolute top-2 right-2">
                        <ProductCard productId={product._id} />
                      </div>
                    </div>

                    <div className="p-2 md:p-4">
                      <Link href={`/product/${product.slug}`} className="block mb-1 md:mb-2">
                        <h3 className="text-xs sm:text-sm font-medium text-gray-800 hover:text-blue-600 line-clamp-2">
                          {product.name}
                        </h3>
                      </Link>
                      
                      <div className="flex items-center gap-2 mb-3">
                        {product.special_price && product.special_price !== product.price && (
                          <span className="text-xs text-gray-500 line-through">₹{product.price.toLocaleString()}</span>
                        )}
                        <span className="text-base font-semibold text-blue-600">₹{(product.special_price || product.price).toLocaleString()}</span>
                      </div>

                      <Addtocart productId={product._id} className="w-full text-xs sm:text-sm py-1.5"  />
                    </div>
                  </div>
                ))}
            </div>
            </>
          ): (
            <div className="text-center  py-10">
              <img 
                src="/images/no-productbox.png" 
                alt="No Products" 
                className="mx-auto mb-4 w-32 h-32 md:w-40 md:h-40 object-contain" 
              />
            </div>
          )}
          {pageCount > 0 && (
            <ReactPaginate 
            breakLabel="..."
            pageCount={pageCount}
            marginPagesDisplayed={1}
            pageRangeDisplayed={3}
            onPageChange={handlePageClick}
            containerClassName="flex justify-center mt-6 gap-1 flex-wrap"
            pageClassName="mx-0.5"
            pageLinkClassName="block px-2 py-1 text-xs sm:text-sm rounded border hover:bg-gray-500 min-w-[32px] text-center"
            activeClassName="bg-blue-600 text-white"
            previousClassName="mx-0.5"
            nextClassName="mx-0.5"
            previousLinkClassName="px-2 py-1 text-xs sm:text-sm rounded border hover:bg-gray-500"
            nextLinkClassName="px-2 py-1 text-xs sm:text-sm rounded border hover:bg-gray-500"
            />
          )}
        </div>
      </div>
        </>
      ) : (
        <div className="text-center py-10">
              <img 
                src="/images/no-productbox.png" 
                alt="No Products" 
                className="mx-auto mb-4 w-32 h-32 md:w-40 md:h-40 object-contain" 
              />
        </div>
      )}
      
      {/* Pagination */}
       <ToastContainer />
    </div>
  );
}