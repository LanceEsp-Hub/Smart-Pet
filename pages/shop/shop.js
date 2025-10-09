import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import { getProductImageUrl } from "../../utils/supabase";
import toast from "react-hot-toast";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

export default function UserProductPage() {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantities, setQuantities] = useState({}); // Track quantity per product
  const [cart, setCart] = useState({}); // Track cart items by product_id
  const [cartItemCount, setCartItemCount] = useState(0); // Track total items in cart
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const fetchProductsAndCart = async () => {
      try {
        // Fetch products
        const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://newback-production-a0cc.up.railway.app";
      const response = await fetch(`${API_URL}/api/ecommerce/products`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const allProducts = await response.json();
        const activeProducts = allProducts.filter(product => product.is_active);
        setProducts(activeProducts);
        setFilteredProducts(activeProducts); // Initialize filtered products
        
        // Initialize quantities to 1 for each product
        const initialQuantities = {};
        activeProducts.forEach(product => {
          initialQuantities[product.product_id] = 1;
        });
        setQuantities(initialQuantities);

        // Fetch categories
        const categoriesRes = await fetch(`${API_URL}/api/ecommerce/categories`);
        if (categoriesRes.ok) {
          const categoriesData = await categoriesRes.json();
          setCategories(categoriesData);
        }

        // Fetch cart for the user
        const userId = sessionStorage.getItem("user_id");
        const token = sessionStorage.getItem("auth_token");
        if (userId && token) {
          const cartRes = await fetch(`${API_URL}/api/ecommerce/cart?user_id=${userId}`, {
            headers: {
              "Authorization": `Bearer ${token}`
            }
          });
          if (cartRes.ok) {
            const cartData = await cartRes.json();
            // Map product_id to quantity
            const cartMap = {};
            let totalItems = 0;
            (cartData.items || []).forEach(item => {
              cartMap[item.product.product_id] = item.quantity;
              totalItems += item.quantity;
            });
            setCart(cartMap);
            setCartItemCount(totalItems);
          }
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProductsAndCart();
  }, []);

  // Filter products based on search, category, and price range
  useEffect(() => {
    let filtered = products;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (selectedCategory) {
      filtered = filtered.filter(product => 
        product.category_id === parseInt(selectedCategory)
      );
    }

    // Price range filter
    if (minPrice || maxPrice) {
      filtered = filtered.filter(product => {
        const price = product.discounted_price || product.price;
        const min = minPrice ? parseFloat(minPrice) : 0;
        const max = maxPrice ? parseFloat(maxPrice) : Infinity;
        return price >= min && price <= max;
      });
    }

    setFilteredProducts(filtered);
  }, [products, searchTerm, selectedCategory, minPrice, maxPrice]);

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setMinPrice('');
    setMaxPrice('');
  };

  const handleQuantityChange = (productId, value, maxQty) => {
    setQuantities(prev => ({
      ...prev,
      [productId]: Math.max(1, Math.min(maxQty, value)) // Clamp between 1 and maxQty
    }));
  };

  const addToCart = async (productId, quantity) => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://newback-production-a0cc.up.railway.app";
      const userId = sessionStorage.getItem("user_id");
      const token = sessionStorage.getItem("auth_token");
      if (!userId || !token) {
        toast.error("You must be logged in to add items to the cart.");
        return;
      }
      const response = await fetch(`${API_URL}/api/ecommerce/cart/items?user_id=${userId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          product_id: productId,
          quantity: quantity
        }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Backend error:", errorData);
        toast.error(errorData.detail || "Failed to add to cart");
        return;
      }
      toast.success("Product added to cart successfully!");
      // Update cart state after adding
      const cartRes = await fetch(`${API_URL}/api/ecommerce/cart?user_id=${userId}`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (cartRes.ok) {
        const cartData = await cartRes.json();
        const cartMap = {};
        let totalItems = 0;
        (cartData.items || []).forEach(item => {
          cartMap[item.product.product_id] = item.quantity;
          totalItems += item.quantity;
        });
        setCart(cartMap);
        setCartItemCount(totalItems);
      }
    } catch (err) {
      console.error("Error adding to cart:", err);
      toast.error("Failed to add to cart");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-700"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-red-500 text-xl">{error}</div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <Navbar />
      <nav className="flex justify-between items-center p-4 bg-white shadow-md mb-8">
        <div className="text-2xl font-bold text-purple-700">
          Petco <span className="text-black">Love Care</span>
        </div>
        <div className="flex space-x-4">
          <a href="#" className="text-gray-600 hover:text-purple-700">Home</a>
          <a href="#" className="text-gray-600 hover:text-purple-700">Products</a>
          <a href="/shop/vouchers" className="text-gray-600 hover:text-purple-700">My Vouchers</a>
          <button 
            onClick={() => router.push('/shop/cart')}
            className="text-gray-600 hover:text-purple-700 flex items-center gap-1"
          >
            Cart
            {cartItemCount > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center min-w-[20px]">
                {cartItemCount > 99 ? '99+' : cartItemCount}
              </span>
            )}
          </button>
          <a href="#" className="text-gray-600 hover:text-purple-700">Account</a>
        </div>
        <button 
          onClick={() => router.push('/shop/cart')}
          className="relative bg-purple-700 text-white p-3 rounded-full hover:bg-purple-800 transition-colors duration-200 shadow-lg hover:shadow-xl"
          title="View Cart"
        >
          {/* Cart Icon */}
          <svg 
            className="w-6 h-6" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5M17 13v6a2 2 0 01-2 2H9a2 2 0 01-2 2V13m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4" 
            />
          </svg>
          
          {/* Item Count Badge */}
          {cartItemCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center min-w-[24px] shadow-md">
              {cartItemCount > 99 ? '99+' : cartItemCount}
            </span>
          )}
        </button>
      </nav>
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-4xl font-bold text-gray-800">Our Products</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-600">{filteredProducts.length} products found</span>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 bg-purple-700 text-white rounded-lg hover:bg-purple-800 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
              </svg>
              Filters
            </button>
          </div>
        </div>

        {/* Filter Section */}
        {showFilters && (
          <div className="bg-white p-6 rounded-lg shadow-md mb-6 border">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Search Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">All Categories</option>
                  <optgroup label="🐕 Pet Categories">
                    {categories
                      .filter(cat => cat.name === "Dog Products" || cat.name === "Cat Products")
                      .sort((a, b) => a.name.localeCompare(b.name))
                      .map((category) => (
                      <option key={category.category_id} value={category.category_id}>
                        {category.name === "Dog Products" ? "🐕 " : "🐱 "}{category.name}
                      </option>
                    ))}
                  </optgroup>
                  {categories.filter(cat => cat.name !== "Dog Products" && cat.name !== "Cat Products").length > 0 && (
                    <optgroup label="📦 Other Categories">
                      {categories
                        .filter(cat => cat.name !== "Dog Products" && cat.name !== "Cat Products")
                        .sort((a, b) => a.name.localeCompare(b.name))
                        .map((category) => (
                        <option key={category.category_id} value={category.category_id}>
                          {category.name}
                        </option>
                      ))}
                    </optgroup>
                  )}
                </select>
              </div>

              {/* Price Range Filters */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Min Price</label>
                <input
                  type="number"
                  placeholder="₱0"
                  min="0"
                  step="0.01"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Max Price</label>
                <input
                  type="number"
                  placeholder="₱999"
                  min="0"
                  step="0.01"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Filter Actions */}
            <div className="flex justify-between items-center mt-4 pt-4 border-t">
              <div className="flex gap-2 text-sm text-gray-600">
                {searchTerm && <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded">Search: "{searchTerm}"</span>}
                {selectedCategory && (
                  <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded">
                    Category: {categories.find(cat => cat.category_id === parseInt(selectedCategory))?.name}
                  </span>
                )}
                {(minPrice || maxPrice) && (
                  <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded">
                    Price: ₱{minPrice || '0'} - ₱{maxPrice || '∞'}
                  </span>
                )}
              </div>
              <button
                onClick={clearFilters}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          </div>
        )}

        {/* Quick Search Bar (always visible) */}
        <div className="mb-6">
          <div className="relative mb-4">
            <input
              type="text"
              placeholder="Quick search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            <svg className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          {/* Quick Filter Buttons */}
          <div className="flex flex-wrap gap-2 mb-4">
            <button
              onClick={() => {
                setSelectedCategory('');
                setSearchTerm('');
                setMinPrice('');
                setMaxPrice('');
              }}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                !selectedCategory && !searchTerm && !minPrice && !maxPrice
                  ? 'bg-purple-700 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Products
            </button>
            
            {categories
              .filter(cat => cat.name === "Dog Products" || cat.name === "Cat Products")
              .sort((a, b) => a.name.localeCompare(b.name))
              .map((category) => (
              <button
                key={category.category_id}
                onClick={() => {
                  setSelectedCategory(category.category_id.toString());
                  setSearchTerm('');
                  setMinPrice('');
                  setMaxPrice('');
                }}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedCategory === category.category_id.toString()
                    ? 'bg-purple-700 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category.name === "Dog Products" ? "🐕 " : "🐱 "}{category.name}
              </button>
            ))}

            <button
              onClick={() => {
                setSelectedCategory('');
                setSearchTerm('');
                setMinPrice('');
                setMaxPrice('25');
              }}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                maxPrice === '25' && !minPrice && !selectedCategory && !searchTerm
                  ? 'bg-purple-700 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              💰 Under ₱25
            </button>

            <button
              onClick={() => {
                setSelectedCategory('');
                setSearchTerm('');
                setMinPrice('25');
                setMaxPrice('50');
              }}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                minPrice === '25' && maxPrice === '50' && !selectedCategory && !searchTerm
                  ? 'bg-purple-700 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              💎 ₱25 - ₱50
            </button>
          </div>
        </div>
        {products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-xl">No active products available.</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <div className="mb-4">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-1.009-5.824-2.562M15 6.306a7.962 7.962 0 00-6 0m6 0V4a2 2 0 00-2-2h-2a2 2 0 00-2 2v2.306" />
              </svg>
              <p className="text-gray-500 text-xl mb-2">No products found matching your filters</p>
              <p className="text-gray-400">Try adjusting your search criteria or clearing filters</p>
            </div>
            <button
              onClick={clearFilters}
              className="px-6 py-3 bg-purple-700 text-white rounded-lg hover:bg-purple-800 transition-colors"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => {
              const inCartQty = cart[product.product_id] || 0;
              const maxQty = product.stock_quantity - inCartQty;
              return (
                <div 
                  key={product.product_id} 
                  className="bg-white p-4 rounded-lg shadow hover:shadow-lg transition"
                >
                  <div className="relative h-48 w-full mb-4">
                    <Image
                      src={getProductImageUrl(product.image_url)}
                      alt={product.name}
                      layout="fill"
                      objectFit="cover"
                      className="rounded-t-lg"
                    />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-800">{product.name}</h2>
                  <div className="flex items-center mt-2">
                    {product.discounted_price ? (
                      <>
                        <span className="text-lg font-bold text-purple-700">
                          ₱{product.discounted_price}
                        </span>
                        <span className="ml-2 text-sm text-gray-500 line-through">
                          ₱{product.price}
                        </span>
                      </>
                    ) : (
                      <span className="text-lg font-bold text-gray-800">
                        ₱{product.price}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {product.stock_quantity > 0 
                      ? `${product.stock_quantity} available` 
                      : 'Out of stock'}
                  </p>
                  {inCartQty > 0 && (
                    <p className="text-xs text-green-600 mt-1">In cart: {inCartQty}</p>
                  )}
                  {/* Quantity selector */}
                  <div className="flex items-center mt-2">
                    <label htmlFor={`quantity-${product.product_id}`} className="mr-2">Qty:</label>
                    <input
                      id={`quantity-${product.product_id}`}
                      type="number"
                      min={1}
                      max={maxQty > 0 ? maxQty : 1}
                      value={quantities[product.product_id] || 1}
                      onChange={e => handleQuantityChange(product.product_id, Math.min(maxQty > 0 ? maxQty : 1, Number(e.target.value)), maxQty > 0 ? maxQty : 1)}
                      className="w-16 p-1 border rounded"
                      disabled={product.stock_quantity <= 0 || maxQty <= 0}
                    />
                  </div>
                  <button
                    onClick={() => addToCart(product.product_id, quantities[product.product_id] || 1)}
                    disabled={product.stock_quantity <= 0 || maxQty <= 0}
                    className={`mt-4 w-full py-2 rounded-lg font-medium transition 
                      ${product.stock_quantity <= 0 || maxQty <= 0
                        ? 'bg-gray-300 cursor-not-allowed'
                        : 'bg-purple-700 hover:bg-purple-800 text-white'
                      }`}
                  >
                    {product.stock_quantity <= 0
                      ? 'Out of Stock'
                      : maxQty <= 0
                        ? 'Max in Cart'
                        : 'Add to Cart'}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
