"use client";
import  React,{ useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { ChevronDown, ChevronUp } from "react-feather";
import ProductCard from "@/components/ProductCard";
import Addtocart from "@/components/AddToCart";
import ReactPaginate from "react-paginate";
import { ToastContainer, toast } from 'react-toastify';

export default function CategoryPage() {
  const [categoryData, setCategoryData] = useState({
    category: null,
    brands: [],
    filters: []
  });
  const [products, setProducts] = useState([]);
  const [selectedFilters, setSelectedFilters] = useState({
    brands: [],
    price: { min: 0, max: 100000 },
    filters: []
  });
  const [priceRange, setPriceRange] = useState([0, 100000]);
  const [filterGroups, setFilterGroups] = useState({});
  const [loading, setLoading] = useState(true);
  const [isBrandsExpanded, setIsBrandsExpanded] = useState(true);
  const [expandedFilters, setExpandedFilters] = useState({}); 
    // State to toggle the main "Filters" section
  const [isFiltersExpanded, setIsFiltersExpanded] = useState(true);
  const [wishlist, setWishlist] = useState([]); 
  const [sortOption, setSortOption] = useState('');
    // Toggle functions
  const toggleFilters = () => setIsFiltersExpanded(!isFiltersExpanded);
  
  const { sub_slug } = useParams();
  const { slug } = useParams();

  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 5; // 5 records per page
  
  const handlePageClick = ({ selected }) => {
    setCurrentPage(selected);
  };
  const toggleBrands = () => setIsBrandsExpanded(!isBrandsExpanded);
  const toggleFilterGroup = (id) => {
    setExpandedFilters(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const [nofound,setNofound]=useState(false);
  useEffect(() => {
    if (sub_slug) {
      fetchInitialData();
    }
  }, [sub_slug]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      
      // Fetch category data (brands, filters, etc.)
      const categoryRes = await fetch(`/api/categories/${slug}/${sub_slug}`);
      const categoryData = await categoryRes.json();
      setCategoryData(categoryData);
      
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
      if (categoryData.products?.length > 0) {
        await fetchFilteredProducts(categoryData);
      }else{
        setNofound(true);
      }
      // Fetch initial products
      await fetchFilteredProducts(categoryData.category._id);
    } catch (error) {
      toast.error('Error fetching initial data:', error);
    } finally {
      setLoading(false);
    }
  };



  const fetchFilteredProducts = async (categoryId) => {
    try {
      setLoading(true);
      
      const query = new URLSearchParams();
      query.set('categoryId', categoryId);
      
      if (selectedFilters.brands.length > 0) {
        query.set('brands', selectedFilters.brands.join(','));
      }
      
      query.set('minPrice', selectedFilters.price.min);
      query.set('maxPrice', selectedFilters.price.max);
      
      if (selectedFilters.filters.length > 0) {
        query.set('filters', selectedFilters.filters.join(','));
      }
      
      const res =await fetch(`/api/product/filter?${query}`);
      const data = await res.json();
      setProducts(data);
    } catch (error) {
      toast.error('Error fetching filtered products:', error);
    } finally {
      setLoading(false);
    }
  };
  const pageCount = Math.ceil(products.length / itemsPerPage);

  const getSortedProducts = () => {
    const sortedProducts = [...products];
    
    switch(sortOption) {
      case 'price-low-high':
        return sortedProducts.sort((a, b) => 
          (a.special_price ) - (b.special_price )
        );
      case 'price-high-low':
        return sortedProducts.sort((a, b) => 
          (b.special_price) - (a.special_price)
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


  const handleFilterChange = (type, value) => {
    setSelectedFilters(prev => {
      const newFilters = { ...prev };
      
      if (type === 'brands') {
        newFilters.brands = prev.brands.includes(value)
          ? prev.brands.filter(item => item !== value)
          : [...prev.brands, value];
      } else if (type === 'price') {
        newFilters.price = value;
      } else {
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

  useEffect(() => {
    if (categoryData.category?._id) {
      fetchFilteredProducts(categoryData.category._id);
    }
  }, [selectedFilters]);

  const clearAllFilters = () => {
    setSelectedFilters({
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
 
  return(
    <div className="container mx-auto px-4 py-2 pb-3 max-w-7xl">
      <ToastContainer/>
      {!loading && !nofound && categoryData.products.length > 0 ? (
        <>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1 space-y-6">
        <h1 className="text-3xl font-bold mb-3 text-gray-600 pl-1">{categoryData.category.category_name}</h1>
        </div>
        <div className="lg:col-span-3">
          {/* Sorting and Count */}
          <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
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
    </div>
  );
}

