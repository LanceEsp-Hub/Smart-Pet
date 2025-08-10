import { useEffect, useState } from "react";

export default function UserVouchersPage() {
  const userId = typeof window !== 'undefined' ? sessionStorage.getItem("user_id") : null;
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) return;

    const fetchUserVouchers = async () => {
      try {
        setLoading(true);
        const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://newback-production-a0cc.up.railway.app";
    const token = sessionStorage.getItem("token");
    const response = await fetch(`${API_URL}/api/vouchers/user/${userId}`, {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });
        if (!response.ok) {
          throw new Error('Failed to fetch vouchers');
        }
        const data = await response.json();
        setVouchers(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserVouchers();
  }, [userId]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (voucher) => {
    const now = new Date();
    const startDate = new Date(voucher.start_date);
    const endDate = new Date(voucher.end_date);
    
    if (now < startDate) {
      return 'bg-blue-100 text-blue-800'; // Not yet active
    } else if (now > endDate) {
      return 'bg-red-100 text-red-800'; // Expired
    } else {
      return 'bg-green-100 text-green-800'; // Active
    }
  };

  const getStatusText = (voucher) => {
    const now = new Date();
    const startDate = new Date(voucher.start_date);
    const endDate = new Date(voucher.end_date);
    
    if (now < startDate) {
      return 'Not Yet Active';
    } else if (now > endDate) {
      return 'Expired';
    } else {
      return 'Active';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-700 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading your vouchers...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Vouchers</h1>
          <p className="mt-2 text-gray-600">View and use your available vouchers</p>
        </div>

        {vouchers.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto h-12 w-12 text-gray-400">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
              </svg>
            </div>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No vouchers available</h3>
            <p className="mt-1 text-sm text-gray-500">You don't have any vouchers assigned to your account yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vouchers.map((userVoucher) => {
              const voucher = userVoucher.voucher; // Access the nested voucher object
              return (
                <div key={userVoucher.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">{voucher.name}</h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(voucher)}`}>
                        {getStatusText(voucher)}
                      </span>
                    </div>
                    
                    <div className="mb-4">
                      <p className="text-sm text-gray-600 mb-2">{voucher.description}</p>
                      <div className="bg-purple-50 border border-purple-200 rounded-md p-3">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-purple-700">{voucher.code}</p>
                          <p className="text-sm text-purple-600">Voucher Code</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Discount:</span>
                        <span className="font-medium text-green-600">
                          {voucher.discount_type === 'percentage' 
                            ? `${voucher.discount_value}% OFF`
                            : `$${voucher.discount_value} OFF`
                          }
                        </span>
                      </div>
                      
                      {voucher.min_order_amount > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Min. Order:</span>
                          <span className="font-medium">${voucher.min_order_amount}</span>
                        </div>
                      )}
                      
                      {voucher.max_discount && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Max Discount:</span>
                          <span className="font-medium">${voucher.max_discount}</span>
                        </div>
                      )}
                      
                      {voucher.free_shipping && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Shipping:</span>
                          <span className="font-medium text-green-600">Free Shipping</span>
                        </div>
                      )}
                      
                      <div className="flex justify-between">
                        <span className="text-gray-600">Valid From:</span>
                        <span className="font-medium">{formatDate(voucher.start_date)}</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-gray-600">Valid Until:</span>
                        <span className="font-medium">{formatDate(voucher.end_date)}</span>
                      </div>
                      
                      {voucher.usage_limit && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Usage Limit:</span>
                          <span className="font-medium">{voucher.used_count}/{voucher.usage_limit}</span>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-xs text-gray-500 text-center">
                        Use this code during checkout to apply the discount
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Back to Shop Button */}
        <div className="mt-8 text-center">
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            Back to Shop
          </button>
        </div>
      </div>
    </div>
  );
} 