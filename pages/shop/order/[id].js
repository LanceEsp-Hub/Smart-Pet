import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { getApiUrl } from "../../../utils/apiUtils";

export default function OrderDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const userId = typeof window !== 'undefined' ? sessionStorage.getItem("user_id") : null;
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch order details
  useEffect(() => {
    if (!userId || !id) return;

    const fetchOrder = async () => {
      try {
        setLoading(true);
        const API_URL = getApiUrl();
        const response = await fetch(`${API_URL}/api/checkout/order/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch order details');
        }
        const data = await response.json();
        setOrder(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id, userId]);

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get status display name
  const getStatusDisplay = (status) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  // Helper function to get product image URL
  const getProductImageUrl = (imagePath) => {
    if (!imagePath) return null;
    
    // If it's already a full URL, return as is
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    
    // If it's a relative path starting with /uploads, construct the full URL
    if (imagePath.startsWith('/uploads/')) {
      const API_URL = getApiUrl();
      return `${API_URL}${imagePath}`;
    }
    
    // If it's just a filename, use the dedicated product image endpoint
    const API_URL = getApiUrl();
    return `${API_URL}/api/ecommerce/product-image/${imagePath}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-700 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading order details...</p>
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

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-900">Order not found</h3>
            <p className="mt-2 text-gray-600">The order you're looking for doesn't exist.</p>
            <button
              onClick={() => router.push('/orders')}
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700"
            >
              Back to Orders
            </button>
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Order #{order.id}</h1>
              <p className="mt-2 text-gray-600">Order details and tracking information</p>
            </div>
            <button
              onClick={() => router.push('/orders')}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Back to Orders
            </button>
          </div>
        </div>

        {/* Order Status */}
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-medium text-gray-900">Order Status</h2>
                <p className="text-sm text-gray-500">Placed on {formatDate(order.order_date)}</p>
              </div>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                {getStatusDisplay(order.status)}
              </span>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Order Summary</h2>
          </div>
          <div className="px-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Order Information</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Order ID:</span>
                    <span className="font-medium">#{order.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Order Date:</span>
                    <span className="font-medium">{formatDate(order.order_date)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment Method:</span>
                    <span className="font-medium">{order.payment_method}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Delivery Type:</span>
                    <span className="font-medium capitalize">{order.delivery_type}</span>
                  </div>
                  {order.delivery_type === 'delivery' && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Shipping Fee:</span>
                      <span className="font-medium">${parseFloat(order.delivery_fee || 0).toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Amount:</span>
                    <span className="font-medium text-lg">${parseFloat(order.total_amount).toFixed(2)}</span>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Shipping Information</h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-600">Shipping Address:</span>
                    {order.shipping_address ? (
                      <div className="mt-1 text-gray-900">
                        <p>{order.shipping_address.street}</p>
                        <p>{order.shipping_address.barangay}, {order.shipping_address.city}</p>
                        <p>{order.shipping_address.state}, {order.shipping_address.zip_code}</p>
                        <p>{order.shipping_address.country}</p>
                      </div>
                    ) : (
                      <p className="text-gray-500">Address not available</p>
                    )}
                  </div>
                  <div className="mt-4">
                    <span className="text-gray-600">Billing Address:</span>
                    {order.billing_address ? (
                      <div className="mt-1 text-gray-900">
                        <p>{order.billing_address.street}</p>
                        <p>{order.billing_address.barangay}, {order.billing_address.city}</p>
                        <p>{order.billing_address.state}, {order.billing_address.zip_code}</p>
                        <p>{order.billing_address.country}</p>
                      </div>
                    ) : (
                      <p className="text-gray-500">Address not available</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Discounts and Voucher Information */}
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Discounts & Vouchers</h2>
          </div>
          <div className="px-6 py-4">
            <div className="space-y-4">
              {/* Product Discounts */}
              {order.items && order.items.some(item => item.discount_applied > 0) && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Product Discounts</h3>
                  <div className="space-y-2">
                    {order.items.filter(item => item.discount_applied > 0).map((item) => (
                      <div key={item.item_id} className="flex justify-between text-sm">
                        <span className="text-gray-600">{item.product_name}:</span>
                        <span className="text-green-600 font-medium">-${item.discount_applied.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Voucher Information */}
              {order.voucher_usage && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Applied Voucher</h3>
                  <div className="bg-green-50 border border-green-200 rounded-md p-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-green-800 font-medium">{order.voucher_usage.voucher.name}</p>
                        <p className="text-green-600 text-sm">{order.voucher_usage.voucher.description}</p>
                        <p className="text-green-600 text-sm">
                          {order.voucher_usage.voucher.discount_type === 'percentage' 
                            ? `${order.voucher_usage.voucher.discount_value}% OFF`
                            : `$${order.voucher_usage.voucher.discount_value} OFF`
                          }
                        </p>
                      </div>
                      <div className="text-right">
                        {order.voucher_usage.discount_amount > 0 && (
                          <p className="text-green-800 font-medium">
                            -${order.voucher_usage.discount_amount.toFixed(2)}
                          </p>
                        )}
                        {order.voucher_usage.shipping_discount > 0 && (
                          <p className="text-green-600 text-sm">
                            Free Shipping (-${order.voucher_usage.shipping_discount.toFixed(2)})
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* No Discounts Applied */}
              {(!order.items || !order.items.some(item => item.discount_applied > 0)) && !order.voucher_usage && (
                <div className="text-center py-4">
                  <p className="text-gray-500 text-sm">No discounts or vouchers were applied to this order.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Order Items</h2>
          </div>
          <div className="px-6 py-4">
            {order.items && order.items.length > 0 ? (
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div key={item.item_id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                    {item.product_image && (
                      <div className="flex-shrink-0">
                        <img
                          src={getProductImageUrl(item.product_image)}
                          alt={item.product_name}
                          className="h-16 w-16 object-cover rounded"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-gray-900 truncate">
                        {item.product_name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Quantity: {item.quantity}
                      </p>
                      <p className="text-sm text-gray-500">
                        Unit Price: ${item.unit_price.toFixed(2)}
                      </p>
                      {item.discount_applied > 0 && (
                        <p className="text-sm text-green-600">
                          Discount: ${item.discount_applied.toFixed(2)}
                        </p>
                      )}
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <p className="text-sm font-medium text-gray-900">
                        ${item.subtotal.toFixed(2)}
                      </p>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        item.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        item.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                        item.status === 'shipped' ? 'bg-purple-100 text-purple-800' :
                        item.status === 'delivered' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="mx-auto h-12 w-12 text-gray-400">
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No items found</h3>
                <p className="mt-1 text-sm text-gray-500">Order items are not available.</p>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4">
            <div className="flex justify-end space-x-3">
              {order.status === 'delivered' && (
                <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700">
                  Write Review
                </button>
              )}
              <button
                onClick={() => router.push('/')}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
