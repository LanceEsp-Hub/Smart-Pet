import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import CryptoJS from "crypto-js";

const SECRET_KEY = "asdasdasd";

const encryptData = (data) => {
  return CryptoJS.AES.encrypt(JSON.stringify(data), SECRET_KEY).toString();
};

const decryptData = (encryptedData) => {
  const bytes = CryptoJS.AES.decrypt(encryptedData, SECRET_KEY);
  return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
};

export default function AdminVouchersPage() {
  const router = useRouter();
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState(null);
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    description: "",
    discount_type: "percentage",
    discount_value: "",
    min_order_amount: "0",
    max_discount: "",
    free_shipping: false,
    usage_limit: "",
    start_date: "",
    end_date: "",
    is_active: true
  });

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const authenticate = () => {
      try {
        const storedToken = sessionStorage.getItem("auth_token");
        const storedUserData = sessionStorage.getItem("user");
        const storedUserId = sessionStorage.getItem("user_id");
        const encryptedRoles = sessionStorage.getItem("roles");

        if (!storedToken || !storedUserData || !storedUserId) {
          throw new Error("Missing authentication data");
        }

        const storedRoles = decryptData(encryptedRoles);
        if (storedRoles === "admin") {
          setIsAuthenticated(true);
          fetchVouchers();
        } else {
          throw new Error("Access denied. Admin privileges required.");
        }
      } catch (error) {
        console.error("Authentication error:", error);
        router.push("/login");
      } finally {
        setIsLoading(false);
      }
    };

    authenticate();
  }, [router]);

  const fetchVouchers = async () => {
    try {
      setLoading(true);
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://newback-production-a0cc.up.railway.app";
      const token = sessionStorage.getItem("token");
      const response = await fetch(`${API_URL}/api/vouchers/`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch vouchers');
      }
      const data = await response.json();
      setVouchers(data);
    } catch (err) {
      console.error("Error fetching vouchers:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://newback-production-a0cc.up.railway.app";
      const url = editingVoucher 
        ? `${API_URL}/api/vouchers/${editingVoucher.id}`
        : `${API_URL}/api/vouchers/`;
      
      const method = editingVoucher ? 'PUT' : 'POST';
      
      const token = sessionStorage.getItem("token");
      const response = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          discount_value: parseFloat(formData.discount_value),
          min_order_amount: parseFloat(formData.min_order_amount),
          max_discount: formData.max_discount ? parseFloat(formData.max_discount) : null,
          usage_limit: formData.usage_limit ? parseInt(formData.usage_limit) : null,
          start_date: new Date(formData.start_date).toISOString(),
          end_date: new Date(formData.end_date).toISOString()
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to save voucher');
      }

      setShowCreateModal(false);
      setEditingVoucher(null);
      resetForm();
      fetchVouchers();
      alert(editingVoucher ? 'Voucher updated successfully!' : 'Voucher created successfully!');
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleDelete = async (voucherId) => {
    if (!confirm('Are you sure you want to delete this voucher?')) return;
    
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://newback-production-a0cc.up.railway.app";
      const token = sessionStorage.getItem("token");
      const response = await fetch(`${API_URL}/api/vouchers/${voucherId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = errorData.detail || 'Failed to delete voucher';
        
        // If the error suggests deactivating instead, offer that option
        if (errorMessage.includes('Consider deactivating instead')) {
          if (confirm(`${errorMessage}\n\nWould you like to deactivate this voucher instead?`)) {
            await handleDeactivate(voucherId);
            return;
          }
        }
        
        throw new Error(errorMessage);
      }

      fetchVouchers();
      alert('Voucher deleted successfully!');
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleDeactivate = async (voucherId) => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://newback-production-a0cc.up.railway.app";
      const token = sessionStorage.getItem("token");
      const response = await fetch(`${API_URL}/api/vouchers/${voucherId}/deactivate`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to deactivate voucher');
      }

      fetchVouchers();
      alert('Voucher deactivated successfully!');
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleEdit = (voucher) => {
    setEditingVoucher(voucher);
    setFormData({
      code: voucher.code,
      name: voucher.name,
      description: voucher.description || "",
      discount_type: voucher.discount_type,
      discount_value: voucher.discount_value.toString(),
      min_order_amount: voucher.min_order_amount.toString(),
      max_discount: voucher.max_discount ? voucher.max_discount.toString() : "",
      free_shipping: voucher.free_shipping,
      usage_limit: voucher.usage_limit ? voucher.usage_limit.toString() : "",
      start_date: new Date(voucher.start_date).toISOString().split('T')[0],
      end_date: new Date(voucher.end_date).toISOString().split('T')[0],
      is_active: voucher.is_active
    });
    setShowCreateModal(true);
  };

  const resetForm = () => {
    setFormData({
      code: "",
      name: "",
      description: "",
      discount_type: "percentage",
      discount_value: "",
      min_order_amount: "0",
      max_discount: "",
      free_shipping: false,
      usage_limit: "",
      start_date: "",
      end_date: "",
      is_active: true
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (voucher) => {
    const now = new Date();
    const startDate = new Date(voucher.start_date);
    const endDate = new Date(voucher.end_date);
    
    if (!voucher.is_active) return 'bg-red-100 text-red-800';
    if (now < startDate) return 'bg-yellow-100 text-yellow-800';
    if (now > endDate) return 'bg-gray-100 text-gray-800';
    if (voucher.usage_limit && voucher.used_count >= voucher.usage_limit) return 'bg-red-100 text-red-800';
    return 'bg-green-100 text-green-800';
  };

  const getStatusText = (voucher) => {
    const now = new Date();
    const startDate = new Date(voucher.start_date);
    const endDate = new Date(voucher.end_date);
    
    if (!voucher.is_active) return 'Inactive';
    if (now < startDate) return 'Pending';
    if (now > endDate) return 'Expired';
    if (voucher.usage_limit && voucher.used_count >= voucher.usage_limit) return 'Limit Reached';
    return 'Active';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-700 mx-auto"></div>
            <p className="mt-4 text-gray-600">Authenticating...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-700 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading vouchers...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              <strong className="font-bold">Error:</strong>
              <span className="block sm:inline"> {error}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Voucher Management</h1>
              <p className="mt-2 text-gray-600">Create and manage discount vouchers</p>
            </div>
            <button
              onClick={() => {
                setEditingVoucher(null);
                resetForm();
                setShowCreateModal(true);
              }}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Create Voucher
            </button>
          </div>
        </div>

        {/* Vouchers List */}
        {vouchers.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto h-12 w-12 text-gray-400">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
              </svg>
            </div>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No vouchers found</h3>
            <p className="mt-1 text-sm text-gray-500">Create your first voucher to get started.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {vouchers.map((voucher) => (
              <div key={voucher.id} className="bg-white shadow rounded-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        {voucher.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Code: <span className="font-mono bg-gray-100 px-2 py-1 rounded">{voucher.code}</span>
                      </p>
                      <p className="text-sm text-gray-600 mt-1">{voucher.description}</p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(voucher)}`}>
                        {getStatusText(voucher)}
                      </span>
                      <div className="text-right">
                        <div className="text-lg font-semibold text-gray-900">
                          {voucher.discount_type === 'percentage' ? `${voucher.discount_value}%` : `$${voucher.discount_value}`}
                        </div>
                        {voucher.free_shipping && (
                          <div className="text-sm text-green-600">Free Shipping</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="px-6 py-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-500">Valid Period:</span>
                      <p className="text-gray-900">
                        {formatDate(voucher.start_date)} - {formatDate(voucher.end_date)}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-500">Usage:</span>
                      <p className="text-gray-900">
                        {voucher.used_count} / {voucher.usage_limit || '∞'}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-500">Min Order:</span>
                      <p className="text-gray-900">${voucher.min_order_amount}</p>
                    </div>
                  </div>
                </div>

                <div className="px-6 py-4 bg-gray-50">
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-500">
                      Created: {formatDate(voucher.created_at)}
                    </div>
                    <div className="flex space-x-3">
                      <button
                        onClick={() => handleEdit(voucher)}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                      >
                        Edit
                      </button>
                      {voucher.is_active && (
                        <button
                          onClick={() => handleDeactivate(voucher.id)}
                          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                        >
                          Deactivate
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(voucher.id)}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6">
              {editingVoucher ? 'Edit Voucher' : 'Create New Voucher'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Voucher Code *</label>
                  <input
                    type="text"
                    name="code"
                    value={formData.code}
                    onChange={(e) => setFormData({...formData, code: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows="3"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Discount Type *</label>
                  <select
                    name="discount_type"
                    value={formData.discount_type}
                    onChange={(e) => setFormData({...formData, discount_type: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  >
                    <option value="percentage">Percentage</option>
                    <option value="fixed">Fixed Amount</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Discount Value * ({formData.discount_type === 'percentage' ? '%' : '$'})
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="discount_value"
                    value={formData.discount_value}
                    onChange={(e) => setFormData({...formData, discount_value: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Min Order Amount</label>
                  <input
                    type="number"
                    step="0.01"
                    name="min_order_amount"
                    value={formData.min_order_amount}
                    onChange={(e) => setFormData({...formData, min_order_amount: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              {formData.discount_type === 'percentage' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Discount ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    name="max_discount"
                    value={formData.max_discount}
                    onChange={(e) => setFormData({...formData, max_discount: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Leave empty for no limit"
                  />
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Usage Limit</label>
                  <input
                    type="number"
                    name="usage_limit"
                    value={formData.usage_limit}
                    onChange={(e) => setFormData({...formData, usage_limit: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Leave empty for unlimited"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date *</label>
                  <input
                    type="date"
                    name="start_date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date *</label>
                  <input
                    type="date"
                    name="end_date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>
                
                <div className="flex items-center space-x-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="free_shipping"
                      checked={formData.free_shipping}
                      onChange={(e) => setFormData({...formData, free_shipping: e.target.checked})}
                      className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Free Shipping</span>
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="is_active"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                      className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Active</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingVoucher(null);
                    resetForm();
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                >
                  {editingVoucher ? 'Update Voucher' : 'Create Voucher'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 
