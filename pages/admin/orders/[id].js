import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { getApiUrl } from "../../../utils/apiUtils";
import CryptoJS from "crypto-js";
import toast from "react-hot-toast";
import AdminSidebar from "../../../components/AdminSidebar";

const SECRET_KEY = "asdasdasd";

const decryptData = (encryptedData) => {
  const bytes = CryptoJS.AES.decrypt(encryptedData, SECRET_KEY);
  return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
};

export default function AdminOrderDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [processingOrder, setProcessingOrder] = useState(false);
  const [denyReason, setDenyReason] = useState("");
  const [showDenyModal, setShowDenyModal] = useState(false);

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
          if (id) {
            fetchOrder();
          }
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
  }, [router, id]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const API_URL = getApiUrl();
      const response = await fetch(`${API_URL}/api/checkout/admin/orders/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch order details');
      }
      const data = await response.json();
      setOrder(data);
    } catch (err) {
      console.error("Error fetching order:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveOrder = async () => {
    try {
      setProcessingOrder(true);
      const API_URL = getApiUrl();
      const response = await fetch(`${API_URL}/api/checkout/admin/orders/${id}/approve`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to approve order');
      }

      const result = await response.json();
      toast.success(result.message);
      fetchOrder(); // Refresh the order data
    } catch (err) {
      toast.error(`Error: ${err.message}`);
    } finally {
      setProcessingOrder(false);
    }
  };

  const handleDenyOrder = async (reason) => {
    try {
      setProcessingOrder(true);
      const API_URL = getApiUrl();
      const response = await fetch(`${API_URL}/api/checkout/admin/orders/${id}/deny?reason=${encodeURIComponent(reason)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to deny order');
      }

      const result = await response.json();
      let message = result.message;
      if (result.voucher_reversed) {
        message += " (Voucher usage has been reversed)";
      }
      toast.success(message);
      setShowDenyModal(false);
      setDenyReason("");
      fetchOrder(); // Refresh the order data
    } catch (err) {
      toast.error(`Error: ${err.message}`);
    } finally {
      setProcessingOrder(false);
    }
  };

  const downloadReceipt = () => {
    if (!order) return;

    const receiptContent = generateReceiptHTML(order);
    
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    printWindow.document.write(receiptContent);
    printWindow.document.close();
    printWindow.print();
  };

  const generateReceiptHTML = (order) => {
    const currentDate = new Date().toLocaleDateString();
    
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Receipt - Order #${order.id}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px; }
            .order-info { margin-bottom: 20px; }
            .items-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            .items-table th, .items-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            .items-table th { background-color: #f2f2f2; }
            .totals { text-align: right; margin-top: 20px; }
            .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Smart Pet Store</h1>
            <h2>Order Receipt</h2>
          </div>
          
          <div class="order-info">
            <p><strong>Order ID:</strong> #${order.id}</p>
            <p><strong>Customer:</strong> ${order.user_name || `User ${order.user_id}`}</p>
            <p><strong>Order Date:</strong> ${formatDate(order.order_date)}</p>
            <p><strong>Status:</strong> ${getStatusDisplay(order.status)}</p>
            <p><strong>Payment Method:</strong> ${order.payment_method}</p>
            <p><strong>Delivery Type:</strong> ${order.delivery_type}</p>
            ${order.shipping_address && order.delivery_type === 'delivery' ? `
              <p><strong>Delivery Address:</strong><br/>
                ${order.shipping_address.street}<br/>
                ${order.shipping_address.barangay}, ${order.shipping_address.city}<br/>
                ${order.shipping_address.state} ${order.shipping_address.zip_code}<br/>
                ${order.shipping_address.country}
              </p>
            ` : ''}
          </div>

          <table class="items-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Quantity</th>
                <th>Unit Price</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${order.items ? order.items.map(item => `
                <tr>
                  <td>${item.product_name}</td>
                  <td>${item.quantity}</td>
                  <td>$${parseFloat(item.unit_price).toFixed(2)}</td>
                  <td>$${parseFloat(item.subtotal).toFixed(2)}</td>
                </tr>
              `).join('') : '<tr><td colspan="4">No items available</td></tr>'}
            </tbody>
          </table>

          <div class="totals">
            ${order.delivery_fee > 0 ? `<p><strong>Delivery Fee:</strong> $${parseFloat(order.delivery_fee).toFixed(2)}</p>` : ''}
            ${order.voucher_used ? `<p><strong>Voucher Discount:</strong> -${order.voucher_discount}</p>` : ''}
            <p style="font-size: 18px;"><strong>Total Amount: $${parseFloat(order.total_amount).toFixed(2)}</strong></p>
          </div>

          <div class="footer">
            <p>Thank you for your business!</p>
            <p>Generated on: ${currentDate}</p>
          </div>
        </body>
      </html>
    `;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'denied':
        return 'bg-red-100 text-red-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusDisplay = (status) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

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
    
    // If it's just a filename, construct the URL using the product image endpoint
    const API_URL = getApiUrl();
    return `${API_URL}/api/ecommerce/product-image/${imagePath}`;
  };

  if (!isAuthenticated) {
    return null;
  }

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AdminSidebar />
        <div className="ml-64">
          <div className="py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-700 mx-auto"></div>
                <p className="mt-4 text-gray-600">
                  {isLoading ? "Authenticating..." : "Loading order details..."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AdminSidebar />
        <div className="ml-64">
          <div className="py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                  <strong className="font-bold">Error:</strong>
                  <span className="block sm:inline"> {error}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AdminSidebar />
        <div className="ml-64">
          <div className="py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center">
                <h3 className="text-lg font-medium text-gray-900">Order not found</h3>
                <p className="mt-2 text-gray-600">The order you're looking for doesn't exist.</p>
                <button
                  onClick={() => router.push('/admin/orders')}
                  className="mt-4 inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700"
                >
                  Back to Orders
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar />
      <div className="ml-64">
        <div className="py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Order #{order.id}</h1>
                  <p className="mt-2 text-gray-600">Admin order details and management</p>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={() => router.push('/admin/orders')}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Back to Orders
                  </button>
                  {order.status === 'approved' && (
                    <button
                      onClick={downloadReceipt}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Download Receipt
                    </button>
                  )}
                </div>
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

            {/* Admin Actions */}
            {order.status === 'pending' && (
              <div className="bg-white shadow rounded-lg mb-6">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900">Admin Actions</h2>
                </div>
                <div className="px-6 py-4">
                  <div className="flex space-x-3">
                    <button
                      onClick={handleApproveOrder}
                      disabled={processingOrder}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                    >
                      {processingOrder ? "Processing..." : "Approve Order"}
                    </button>
                    <button
                      onClick={() => setShowDenyModal(true)}
                      disabled={processingOrder}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                    >
                      {processingOrder ? "Processing..." : "Deny Order"}
                    </button>
                  </div>
                </div>
              </div>
            )}

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
                        <span className="text-gray-600">Customer:</span>
                        <span className="font-medium">{order.user_name || `User ${order.user_id}`}</span>
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

            {/* Voucher Information */}
            {order.voucher_used && (
              <div className="bg-white shadow rounded-lg mb-6">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900">Voucher Information</h2>
                </div>
                <div className="px-6 py-4">
                  <div className="bg-green-50 border border-green-200 rounded-md p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-green-800 font-medium">{order.voucher_code}</p>
                        <p className="text-green-600 text-sm">Voucher Applied</p>
                      </div>
                      <div className="text-right">
                        <p className="text-green-800 font-medium">-{order.voucher_discount}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Admin Notes */}
            {order.admin_notes && (
              <div className="bg-white shadow rounded-lg mb-6">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900">Admin Notes</h2>
                </div>
                <div className="px-6 py-4">
                  <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
                    <p className="text-gray-900">{order.admin_notes}</p>
                  </div>
                </div>
              </div>
            )}

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
                            Unit Price: ${parseFloat(item.unit_price).toFixed(2)}
                          </p>
                          {item.discount_applied > 0 && (
                            <p className="text-sm text-green-600">
                              Discount: ${parseFloat(item.discount_applied).toFixed(2)}
                            </p>
                          )}
                        </div>
                        <div className="flex-shrink-0 text-right">
                          <p className="text-sm font-medium text-gray-900">
                            ${parseFloat(item.subtotal).toFixed(2)}
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
          </div>
        </div>

        {/* Deny Modal */}
        {showDenyModal && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
              <h2 className="text-xl font-bold mb-4">Deny Order</h2>
              <p className="text-gray-600 mb-4">Please provide a reason for denying this order:</p>
              <textarea
                value={denyReason}
                onChange={(e) => setDenyReason(e.target.value)}
                placeholder="Enter reason for denial..."
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                rows="3"
              />
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowDenyModal(false);
                    setDenyReason("");
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDenyOrder(denyReason)}
                  disabled={!denyReason.trim()}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                >
                  Deny Order
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
