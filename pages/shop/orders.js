import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { getApiUrl } from "../../utils/apiUtils";
import toast from "react-hot-toast";

export default function OrdersPage() {
  const router = useRouter();
  const userId = typeof window !== 'undefined' ? sessionStorage.getItem("user_id") : null;
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderDetails, setOrderDetails] = useState(null);
  const [loadingReceipt, setLoadingReceipt] = useState(false);

  // Fetch user's orders
  useEffect(() => {
    if (!userId) {
      router.push('/login');
      return;
    }

    const fetchOrders = async () => {
      try {
        setLoading(true);
        const API_URL = getApiUrl();
        const token = sessionStorage.getItem("auth_token");
        const response = await fetch(`${API_URL}/api/checkout/orders/${userId}`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        if (!response.ok) {
          throw new Error('Failed to fetch orders');
        }
        const data = await response.json();
        setOrders(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [userId, router]);

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

  // Open receipt modal and fetch order details
  const openReceiptModal = async (order) => {
    try {
      setLoadingReceipt(true);
      setSelectedOrder(order);
      setShowReceiptModal(true);
      
      // Fetch detailed order information
      const API_URL = getApiUrl();
      const token = sessionStorage.getItem("auth_token");
      const response = await fetch(`${API_URL}/api/checkout/order/${order.id}`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch order details');
      }
      const details = await response.json();
      setOrderDetails(details);
    } catch (err) {
      console.error('Error fetching order details:', err);
      toast.error('Failed to load order details for receipt');
      setShowReceiptModal(false);
    } finally {
      setLoadingReceipt(false);
    }
  };

  // Download/Print receipt
  const downloadReceipt = () => {
    if (!orderDetails) return;

    const receiptContent = generateReceiptHTML(orderDetails);
    
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    printWindow.document.write(receiptContent);
    printWindow.document.close();
    printWindow.print();
  };

  // Generate receipt HTML
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
            <p><strong>Customer ID:</strong> ${order.user_id}</p>
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
            ${order.voucher_usage && order.voucher_usage.discount_amount > 0 ? `<p><strong>Discount:</strong> -$${parseFloat(order.voucher_usage.discount_amount).toFixed(2)}</p>` : ''}
            ${order.voucher_usage && order.voucher_usage.shipping_discount > 0 ? `<p><strong>Shipping Discount:</strong> -$${parseFloat(order.voucher_usage.shipping_discount).toFixed(2)}</p>` : ''}
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-700 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading orders...</p>
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
          <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
          <p className="mt-2 text-gray-600">View your order history and track your purchases</p>
        </div>

        {/* Orders List */}
        {orders.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto h-12 w-12 text-gray-400">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No orders found</h3>
            <p className="mt-1 text-sm text-gray-500">You haven't placed any orders yet.</p>
            <div className="mt-6">
              <button
                onClick={() => router.push('/shop')}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700"
              >
                Start Shopping
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.id} className="bg-white shadow rounded-lg overflow-hidden">
                {/* Order Header */}
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        Order #{order.id}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Placed on {formatDate(order.order_date)}
                      </p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {getStatusDisplay(order.status)}
                      </span>
                      <span className="text-lg font-semibold text-gray-900">
                        ${parseFloat(order.total_amount).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Order Details */}
                <div className="px-6 py-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-500">Payment Method:</span>
                      <p className="text-gray-900">{order.payment_method}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-500">Order Date:</span>
                      <p className="text-gray-900">{formatDate(order.order_date)}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-500">Total Amount:</span>
                      <p className="text-gray-900 font-semibold">${parseFloat(order.total_amount).toFixed(2)}</p>
                    </div>
                  </div>
                  
                  {/* Denial Reason - Only show for denied orders */}
                  {order.status === 'denied' && order.admin_notes && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                      <div className="flex items-start">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-red-800">Order Denied</h3>
                          <div className="mt-1 text-sm text-red-700">
                            {order.admin_notes.includes('Reason:') 
                              ? order.admin_notes.split('Reason:')[1].trim()
                              : order.admin_notes
                            }
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="px-6 py-4 bg-gray-50">
                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={() => router.push(`/shop/order/${order.id}`)}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                    >
                      View Details
                    </button>
                    {order.status === 'approved' && (
                      <button
                        onClick={() => openReceiptModal(order)}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Receipt
                      </button>
                    )}
                    {order.status === 'delivered' && (
                      <button className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500">
                        Write Review
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Back to Shopping */}
        <div className="mt-8 text-center">
          <button
            onClick={() => router.push('/shop')}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700"
          >
            Continue Shopping
          </button>
        </div>
      </div>

      {/* Receipt Modal */}
      {showReceiptModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Order Receipt</h2>
              <div className="flex space-x-3">
                {!loadingReceipt && orderDetails && (
                  <button
                    onClick={downloadReceipt}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H7a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-9a2 2 0 00-2-2H9a2 2 0 00-2 2v9a2 2 0 002 2z" />
                    </svg>
                    Print/Download
                  </button>
                )}
                <button
                  onClick={() => {
                    setShowReceiptModal(false);
                    setSelectedOrder(null);
                    setOrderDetails(null);
                  }}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                >
                  Close
                </button>
              </div>
            </div>

            {/* Receipt Content */}
            <div className="p-8">
              {loadingReceipt ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600">Loading receipt details...</p>
                </div>
              ) : orderDetails ? (
                <>
                  {/* Company Header */}
                  <div className="text-center border-b-2 border-gray-300 pb-6 mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Smart Pet Store</h1>
                    <h2 className="text-xl text-gray-600 mt-2">Order Receipt</h2>
                  </div>

                  {/* Order Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="space-y-3">
                      <div>
                        <span className="font-semibold text-gray-700">Order ID:</span>
                        <span className="ml-2 text-gray-900">#{orderDetails.id}</span>
                      </div>
                      <div>
                        <span className="font-semibold text-gray-700">Customer ID:</span>
                        <span className="ml-2 text-gray-900">{orderDetails.user_id}</span>
                      </div>
                      <div>
                        <span className="font-semibold text-gray-700">Order Date:</span>
                        <span className="ml-2 text-gray-900">{formatDate(orderDetails.order_date)}</span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <span className="font-semibold text-gray-700">Status:</span>
                        <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(orderDetails.status)}`}>
                          {getStatusDisplay(orderDetails.status)}
                        </span>
                      </div>
                      <div>
                        <span className="font-semibold text-gray-700">Payment Method:</span>
                        <span className="ml-2 text-gray-900">{orderDetails.payment_method}</span>
                      </div>
                      <div>
                        <span className="font-semibold text-gray-700">Delivery Type:</span>
                        <span className="ml-2 text-gray-900 capitalize">{orderDetails.delivery_type}</span>
                      </div>
                    </div>
                  </div>

                  {/* Delivery Address */}
                  {orderDetails.shipping_address && orderDetails.delivery_type === 'delivery' && (
                    <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-md">
                      <h3 className="text-lg font-semibold text-blue-900 mb-3">Delivery Address</h3>
                      <div className="text-blue-800">
                        <p>{orderDetails.shipping_address.street}</p>
                        <p>{orderDetails.shipping_address.barangay}, {orderDetails.shipping_address.city}</p>
                        <p>{orderDetails.shipping_address.state} {orderDetails.shipping_address.zip_code}</p>
                        <p>{orderDetails.shipping_address.country}</p>
                      </div>
                    </div>
                  )}

                  {/* Items Table */}
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h3>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200 border border-gray-300">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-300">
                              Product
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-300">
                              Quantity
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-300">
                              Unit Price
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Subtotal
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {orderDetails.items && orderDetails.items.length > 0 ? (
                            orderDetails.items.map((item, index) => (
                              <tr key={index}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border-r border-gray-300">
                                  {item.product_name}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border-r border-gray-300">
                                  {item.quantity}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border-r border-gray-300">
                                  ${parseFloat(item.unit_price).toFixed(2)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  ${parseFloat(item.subtotal).toFixed(2)}
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">
                                No items available
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Voucher Information */}
                  {orderDetails.voucher_usage && (
                    <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
                      <h4 className="font-semibold text-green-800 mb-2">Voucher Applied</h4>
                      <div className="text-green-700">
                        <p><span className="font-medium">{orderDetails.voucher_usage.voucher.code}</span> - {orderDetails.voucher_usage.voucher.name}</p>
                        {orderDetails.voucher_usage.discount_amount > 0 && (
                          <p>Discount: -${parseFloat(orderDetails.voucher_usage.discount_amount).toFixed(2)}</p>
                        )}
                        {orderDetails.voucher_usage.shipping_discount > 0 && (
                          <p>Shipping Discount: -${parseFloat(orderDetails.voucher_usage.shipping_discount).toFixed(2)}</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Totals */}
                  <div className="border-t border-gray-300 pt-6">
                    <div className="flex justify-end">
                      <div className="w-64 space-y-2">
                        {orderDetails.delivery_fee > 0 && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Delivery Fee:</span>
                            <span className="text-gray-900">${parseFloat(orderDetails.delivery_fee).toFixed(2)}</span>
                          </div>
                        )}
                        {orderDetails.voucher_usage && orderDetails.voucher_usage.discount_amount > 0 && (
                          <div className="flex justify-between text-sm text-green-600">
                            <span>Discount:</span>
                            <span>-${parseFloat(orderDetails.voucher_usage.discount_amount).toFixed(2)}</span>
                          </div>
                        )}
                        {orderDetails.voucher_usage && orderDetails.voucher_usage.shipping_discount > 0 && (
                          <div className="flex justify-between text-sm text-green-600">
                            <span>Shipping Discount:</span>
                            <span>-${parseFloat(orderDetails.voucher_usage.shipping_discount).toFixed(2)}</span>
                          </div>
                        )}
                        <div className="border-t border-gray-300 pt-2">
                          <div className="flex justify-between text-lg font-semibold">
                            <span className="text-gray-900">Total Amount:</span>
                            <span className="text-gray-900">${parseFloat(orderDetails.total_amount).toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="mt-12 text-center text-sm text-gray-500 border-t border-gray-300 pt-6">
                    <p className="font-medium">Thank you for your business!</p>
                    <p className="mt-1">Generated on: {new Date().toLocaleDateString()}</p>
                  </div>
                </>
              ) : (
                <div className="text-center py-12">
                  <div className="text-red-600">
                    <p>Failed to load receipt details.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 
