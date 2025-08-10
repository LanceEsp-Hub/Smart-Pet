import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import { getProductImageUrl } from "../../utils/supabase";

export default function ProductPage() {
  const router = useRouter();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [categoryFormData, setCategoryFormData] = useState({
    name: "",
    description: "",
    parent_category_id: "",
    image_url: ""
  });
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    discounted_price: "",
    stock_quantity: "",
    category_id: "",
    sku: "",
    weight: "",
    dimensions: "",
    is_active: true,
    image: null,
  });
  const [createFormData, setCreateFormData] = useState({
    name: "",
    description: "",
    price: "",
    discounted_price: "",
    stock_quantity: "",
    category_id: "",
    sku: "",
    weight: "",
    dimensions: "",
    is_active: true,
    image: null,
  });

  useEffect(() => {
    const initializeData = async () => {
      try {
        const token = sessionStorage.getItem("token");
        const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://newback-production-a0cc.up.railway.app";
        
        // Fetch products
        const productsRes = await fetch(`${API_URL}/api/ecommerce/admin/products`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const productsData = await productsRes.json();
        setProducts(productsData);

        // Fetch categories
        const categoriesRes = await fetch(`${API_URL}/api/ecommerce/categories`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const categoriesData = await categoriesRes.json();
        
        // Check if Dog Products and Cat Products categories exist
        const dogCategory = categoriesData.find(cat => cat.name === "Dog Products");
        const catCategory = categoriesData.find(cat => cat.name === "Cat Products");
        
        // Create missing categories
        if (!dogCategory) {
          await createCategory("Dog Products", "Products designed for dogs");
        }
        if (!catCategory) {
          await createCategory("Cat Products", "Products designed for cats");
        }
        
        // Refresh categories if we created new ones
        if (!dogCategory || !catCategory) {
          const updatedCategoriesRes = await fetch(`${API_URL}/api/ecommerce/categories`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          const updatedCategoriesData = await updatedCategoriesRes.json();
          setCategories(updatedCategoriesData);
        } else {
          setCategories(categoriesData);
        }
        
      } catch (err) {
        console.error("Failed to initialize data", err);
      }
    };

    initializeData();
  }, []);

  // Helper function to create a category
  const createCategory = async (name, description) => {
    try {
      const token = sessionStorage.getItem("token");
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://newback-production-a0cc.up.railway.app";
      const response = await fetch(`${API_URL}/api/ecommerce/categories`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: name,
          description: description,
          parent_category_id: null,
          image_url: null
        }),
      });
      
      if (response.ok) {
        console.log(`Created category: ${name}`);
      } else {
        const error = await response.json();
        console.error(`Failed to create category ${name}:`, error);
      }
    } catch (err) {
      console.error(`Error creating category ${name}:`, err);
    }
  };

  // Handle category form changes
  const handleCategoryChange = (e) => {
    const { name, value } = e.target;
    setCategoryFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle category form submission
  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    
    try {
      const token = sessionStorage.getItem("token");
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://newback-production-a0cc.up.railway.app";
      const response = await fetch(`${API_URL}/api/ecommerce/categories`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: categoryFormData.name,
          description: categoryFormData.description || null,
          parent_category_id: categoryFormData.parent_category_id || null,
          image_url: categoryFormData.image_url || null
        }),
      });

      if (response.ok) {
        const result = await response.json();
        alert(`Category "${categoryFormData.name}" created successfully!`);
        
        // Reset form and close modal
        setCategoryFormData({
          name: "",
          description: "",
          parent_category_id: "",
          image_url: ""
        });
        setShowCategoryModal(false);
        
        // Refresh categories list
        const categoriesRes = await fetch(`${API_URL}/api/ecommerce/categories`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const categoriesData = await categoriesRes.json();
        setCategories(categoriesData);
      } else {
        const error = await response.json();
        console.error("Error:", error);
        alert(`Failed to create category: ${error.detail || "Unknown error"}`);
      }
    } catch (err) {
      console.error("Request failed:", err);
      alert(`Failed to create category: ${err.message}`);
    }
  };

  const handleEditClick = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name ?? "",
      description: product.description ?? "",
      price: product.price?.toString() ?? "",
      discounted_price: product.discounted_price?.toString() ?? "",
      stock_quantity: product.stock_quantity?.toString() ?? "",
      category_id: product.category_id?.toString() ?? "",
      sku: product.sku ?? "",
      weight: product.weight?.toString() ?? "",
      dimensions: product.dimensions ?? "",
      is_active: product.is_active ?? true,
      image: null,
    });
  };

  const handleChange = (e) => {
    const { name, type, value, checked, files } = e.target;
    if (type === "checkbox") {
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else if (type === "file") {
      setFormData((prev) => ({ ...prev, [name]: files[0] }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    const formDataToSend = new FormData();
    for (const key in formData) {
      if (formData[key] !== null && formData[key] !== "") {
        formDataToSend.append(key, formData[key]);
      }
    }

    try {
      const token = sessionStorage.getItem("token");
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://newback-production-a0cc.up.railway.app";
      const response = await fetch(
        `${API_URL}/api/ecommerce/admin/products/${editingProduct.product_id}`,
        {
          method: "PUT",
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formDataToSend,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to update product: ${JSON.stringify(errorData)}`);
      }

      setEditingProduct(null);
      const updated = await fetch(`${API_URL}/api/ecommerce/admin/products`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const updatedProducts = await updated.json();
      setProducts(updatedProducts);
    } catch (err) {
      console.error("Update error:", err);
    }
  };

  const handleDelete = async (product_id) => {
    try {
      const token = sessionStorage.getItem("token");
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://newback-production-a0cc.up.railway.app";
      const response = await fetch(
        `${API_URL}/api/ecommerce/admin/products/${product_id}`,
        {
          method: "DELETE",
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to delete: ${error}`);
      }

      setProducts((prev) => prev.filter((p) => p.product_id !== product_id));
    } catch (error) {
      console.error("Delete error:", error.message);
    }
  };

  const handleCreateChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === "checkbox") {
      setCreateFormData({ ...createFormData, [name]: checked });
    } else if (type === "file") {
      setCreateFormData({ ...createFormData, image: files[0] });
    } else {
      setCreateFormData({ ...createFormData, [name]: value });
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();

    const data = new FormData();
    Object.entries(createFormData).forEach(([key, value]) => {
      if (value !== null && value !== "") data.append(key, value);
    });

    try {
      const token = sessionStorage.getItem("token");
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://newback-production-a0cc.up.railway.app";
      const response = await fetch(`${API_URL}/api/ecommerce/admin/products`, {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: data,
      });

      if (response.ok) {
        const result = await response.json();
        alert("Product created successfully!");
        console.log(result);
        
        // Reset form and close modal
        setCreateFormData({
          name: "",
          description: "",
          price: "",
          discounted_price: "",
          stock_quantity: "",
          category_id: "",
          sku: "",
          weight: "",
          dimensions: "",
          is_active: true,
          image: null,
        });
        setShowCreateModal(false);
        
        // Refresh products list
        const updated = await fetch(`${API_URL}/api/ecommerce/admin/products`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const updatedProducts = await updated.json();
        setProducts(updatedProducts);
      } else {
        const error = await response.json();
        console.error("Error:", error);
        alert(`Failed to create product: ${error.detail || "Unknown error"}`);
      }
    } catch (err) {
      console.error("Request failed:", err);
      alert(`Failed to create product: ${err.message}`);
    }
  };

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <nav className="flex justify-between items-center p-4 bg-white shadow-md mb-8">
        <div className="text-2xl font-bold text-purple-700">
          Petco <span className="text-black">Love Care</span>
        </div>
        <div className="flex space-x-4">
          <a href="#" className="text-gray-600">Petco Love</a>
          <a href="#" className="text-gray-600">Lost</a>
          <a href="#" className="text-gray-600">Adopt</a>
          <a href="#" className="text-gray-600">Care</a>
        </div>
        <button className="bg-purple-700 text-white px-6 py-2 rounded-full">Get Vaccines</button>
      </nav>

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-4xl font-bold text-gray-800">All Products</h1>
        <div className="flex gap-3">
          <button
            onClick={() => setShowCategoryModal(true)}
            className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-3 rounded-lg font-semibold flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            Create Category
          </button>
          <button
            onClick={async () => {
              await createCategory("Dog Products", "Products designed for dogs");
              await createCategory("Cat Products", "Products designed for cats");
              // Refresh categories
              const token = sessionStorage.getItem("token");
              const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://newback-production-a0cc.up.railway.app";
              const categoriesRes = await fetch(`${API_URL}/api/ecommerce/categories`, {
                headers: {
                  'Authorization': `Bearer ${token}`
                }
              });
              const categoriesData = await categoriesRes.json();
              setCategories(categoriesData);
              alert("Default categories created/refreshed!");
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg font-semibold flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            Pet Categories
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Product
          </button>
        </div>
      </div>

      {products.length === 0 ? (
        <p className="text-gray-500">No products available.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {products.map((product) => (
            <div key={product.product_id} className="bg-white p-4 rounded-lg shadow">
              <Image
                src={getProductImageUrl(product.image_url)}
                alt={product.name}
                width={300}
                height={200}
              />
              <h2 className="text-xl font-semibold text-gray-800">{product.name}</h2>
              <p className="text-gray-600 mt-1">
                ${product.discounted_price ?? product.price}
              </p>
              <p className="text-sm text-gray-500">Stock: {product.stock_quantity}</p>
              {!product.is_active && (
                <p className="text-red-600 font-semibold">Not Available</p>
              )}
              <div className="flex gap-4 mt-2">
                <button
                  onClick={() => handleEditClick(product)}
                  className="text-blue-600 underline"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(product.product_id)}
                  className="text-red-600 underline"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editingProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white p-6 rounded-md shadow-lg w-full max-w-xl">
            <h2 className="text-xl font-semibold mb-4">Edit Product</h2>
            <form onSubmit={handleUpdate} encType="multipart/form-data">
              <input type="text" name="name" placeholder="Product Name" required value={formData.name} onChange={handleChange} className="w-full border p-2 rounded mb-2" />
              <textarea name="description" placeholder="Description" required value={formData.description} onChange={handleChange} className="w-full border p-2 rounded mb-2" />
              <input type="number" name="price" step="0.01" placeholder="Price" required value={formData.price} onChange={handleChange} className="w-full border p-2 rounded mb-2" />
              <input type="number" name="discounted_price" step="0.01" placeholder="Discounted Price" value={formData.discounted_price} onChange={handleChange} className="w-full border p-2 rounded mb-2" />
              <input type="number" name="stock_quantity" placeholder="Stock Quantity" required value={formData.stock_quantity} onChange={handleChange} className="w-full border p-2 rounded mb-2" />
              <select name="category_id" value={formData.category_id} onChange={handleChange} className="w-full border p-2 rounded mb-2">
                <option value="">Select Category</option>
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
              <input type="text" name="sku" placeholder="SKU" required value={formData.sku} onChange={handleChange} className="w-full border p-2 rounded mb-2" />
              <input type="number" name="weight" step="0.01" placeholder="Weight" value={formData.weight} onChange={handleChange} className="w-full border p-2 rounded mb-2" />
              <input type="text" name="dimensions" placeholder="Dimensions" value={formData.dimensions} onChange={handleChange} className="w-full border p-2 rounded mb-2" />
              <label className="flex items-center space-x-2 mb-2">
                <input type="checkbox" name="is_active" checked={formData.is_active} onChange={handleChange} />
                <span>Active</span>
              </label>
              <input type="file" name="image" accept="image/*" onChange={handleChange} className="mb-4" />
              <div className="flex justify-between">
                <button type="submit" className="bg-purple-700 text-white px-4 py-2 rounded">Save</button>
                <button type="button" onClick={() => setEditingProduct(null)} className="text-gray-500 underline">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white p-6 rounded-md shadow-lg w-full max-w-xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4 text-green-700">Create New Product</h2>
            <form onSubmit={handleCreateSubmit} encType="multipart/form-data">
              <div className="space-y-3">
                <input 
                  type="text" 
                  name="name" 
                  placeholder="Product Name" 
                  required 
                  value={createFormData.name} 
                  onChange={handleCreateChange} 
                  className="w-full border border-gray-300 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500" 
                />
                <textarea 
                  name="description" 
                  placeholder="Description" 
                  required 
                  value={createFormData.description} 
                  onChange={handleCreateChange} 
                  rows="3"
                  className="w-full border border-gray-300 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500" 
                />
                <div className="grid grid-cols-2 gap-3">
                  <input 
                    type="number" 
                    name="price" 
                    step="0.01" 
                    placeholder="Price" 
                    required 
                    value={createFormData.price} 
                    onChange={handleCreateChange} 
                    className="w-full border border-gray-300 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500" 
                  />
                  <input 
                    type="number" 
                    name="discounted_price" 
                    step="0.01" 
                    placeholder="Discounted Price (Optional)" 
                    value={createFormData.discounted_price} 
                    onChange={handleCreateChange} 
                    className="w-full border border-gray-300 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500" 
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <input 
                    type="number" 
                    name="stock_quantity" 
                    placeholder="Stock Quantity" 
                    required 
                    value={createFormData.stock_quantity} 
                    onChange={handleCreateChange} 
                    className="w-full border border-gray-300 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500" 
                  />
                  <select 
                    name="category_id" 
                    value={createFormData.category_id} 
                    onChange={handleCreateChange} 
                    className="w-full border border-gray-300 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500" 
                  >
                    <option value="">Select Category</option>
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
                <input 
                  type="text" 
                  name="sku" 
                  placeholder="SKU" 
                  required 
                  value={createFormData.sku} 
                  onChange={handleCreateChange} 
                  className="w-full border border-gray-300 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500" 
                />
                <div className="grid grid-cols-2 gap-3">
                  <input 
                    type="number" 
                    name="weight" 
                    step="0.01" 
                    placeholder="Weight (Optional)" 
                    value={createFormData.weight} 
                    onChange={handleCreateChange} 
                    className="w-full border border-gray-300 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500" 
                  />
                  <input 
                    type="text" 
                    name="dimensions" 
                    placeholder="Dimensions (Optional)" 
                    value={createFormData.dimensions} 
                    onChange={handleCreateChange} 
                    className="w-full border border-gray-300 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500" 
                  />
                </div>
                <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-md">
                  <input 
                    type="checkbox" 
                    name="is_active" 
                    checked={createFormData.is_active} 
                    onChange={handleCreateChange}
                    className="w-4 h-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  />
                  <span className="text-gray-700">Product is active</span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Product Image</label>
                  <input 
                    type="file" 
                    name="image" 
                    accept="image/*" 
                    required 
                    onChange={handleCreateChange} 
                    className="w-full border border-gray-300 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500" 
                  />
                </div>
              </div>
              <div className="flex justify-between mt-6 pt-4 border-t">
                <button 
                  type="button" 
                  onClick={() => {
                    setShowCreateModal(false);
                    setCreateFormData({
                      name: "",
                      description: "",
                      price: "",
                      discounted_price: "",
                      stock_quantity: "",
                      category_id: "",
                      sku: "",
                      weight: "",
                      dimensions: "",
                      is_active: true,
                      image: null,
                    });
                  }} 
                  className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  Create Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Category Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white p-6 rounded-md shadow-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4 text-orange-700">Create New Category</h2>
            <form onSubmit={handleCategorySubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category Name *</label>
                  <input 
                    type="text" 
                    name="name" 
                    placeholder="e.g., Bird Products, Fish Supplies, etc." 
                    required 
                    value={categoryFormData.name} 
                    onChange={handleCategoryChange} 
                    className="w-full border border-gray-300 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500" 
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea 
                    name="description" 
                    placeholder="Brief description of this category (optional)" 
                    value={categoryFormData.description} 
                    onChange={handleCategoryChange} 
                    rows="3"
                    className="w-full border border-gray-300 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500" 
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Parent Category</label>
                  <select 
                    name="parent_category_id" 
                    value={categoryFormData.parent_category_id} 
                    onChange={handleCategoryChange} 
                    className="w-full border border-gray-300 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500" 
                  >
                    <option value="">No Parent (Top Level Category)</option>
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
                  <p className="text-xs text-gray-500 mt-1">Select a parent category to create a subcategory</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Image URL</label>
                  <input 
                    type="url" 
                    name="image_url" 
                    placeholder="https://example.com/category-image.jpg (optional)" 
                    value={categoryFormData.image_url} 
                    onChange={handleCategoryChange} 
                    className="w-full border border-gray-300 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500" 
                  />
                </div>
              </div>

              <div className="flex justify-between mt-6 pt-4 border-t">
                <button 
                  type="button" 
                  onClick={() => {
                    setShowCategoryModal(false);
                    setCategoryFormData({
                      name: "",
                      description: "",
                      parent_category_id: "",
                      image_url: ""
                    });
                  }} 
                  className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-6 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  Create Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
