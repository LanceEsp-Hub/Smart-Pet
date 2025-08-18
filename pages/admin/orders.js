import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { getApiUrl } from "../../utils/apiUtils";
import CryptoJS from "crypto-js";
import toast from "react-hot-toast";
import AdminSidebar from "../../components/AdminSidebar";
import * as XLSX from 'xlsx';

const SECRET_KEY = "asdasdasd";

const encryptData = (data) => {
  return CryptoJS.AES.encrypt(JSON.stringify(data), SECRET_KEY).toString();
};

const decryptData = (encryptedData) => {
  const bytes = CryptoJS.AES.decrypt(encryptedData, SECRET_KEY);
  return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
};

export default function AdminOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingOrder, setProcessingOrder] = useState(null);
  const [denyReason, setDenyReason] = useState("");
  const [showDenyModal, setShowDenyModal] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
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
          fetchOrders();
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

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const API_URL = getApiUrl();
      const response = await fetch(`${API_URL}/api/checkout/admin/orders`);
      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }
      const data = await response.json();
      console.log("Fetched orders:", data);
      setOrders(data);
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveOrder = async (orderId) => {
    try {
      setProcessingOrder(orderId);
      const API_URL = getApiUrl();
      const response = await fetch(`${API_URL}/api/checkout/admin/orders/${orderId}/approve`, {
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
      fetchOrders(); // Refresh the list
    } catch (err) {
      toast.error(`Error: ${err.message}`);
    } finally {
      setProcessingOrder(null);
    }
  };

  const handleDenyOrder = async (orderId, reason) => {
    try {
      setProcessingOrder(orderId);
      const API_URL = getApiUrl();
      const response = await fetch(`${API_URL}/api/checkout/admin/orders/${orderId}/deny?reason=${encodeURIComponent(reason)}`, {
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
      fetchOrders(); // Refresh the list
    } catch (err) {
      toast.error(`Error: ${err.message}`);
    } finally {
      setProcessingOrder(null);
    }
  };

  const openDenyModal = (orderId) => {
    setSelectedOrderId(orderId);
    setShowDenyModal(true);
  };

  const openReceiptModal = (order) => {
    setSelectedOrder(order);
    setShowReceiptModal(true);
  };

  const downloadReceipt = () => {
    if (!selectedOrder) return;

    const receiptContent = generateReceiptHTML(selectedOrder);
    
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

  const downloadOrdersReport = () => {
    try {
      // Create workbook and worksheet
      const workbook = XLSX.utils.book_new();
      
      // Define headers
      const headers = [
        'Order ID',
        'Customer Name', 
        'Order Date',
        'Status',
        'Total Amount',
        'Delivery Fee',
        'Payment Method',
        'Delivery Type',
        'Items Count',
        'Admin Notes'
      ];

      // Prepare data rows
      const dataRows = [];
      orders.forEach((order) => {
        // Format date properly
        const orderDate = new Date(order.order_date);
        const formattedDate = orderDate.toISOString().replace('T', ' ').substring(0, 19);

        // Create row data in the same order as headers
        const rowData = [
          order.id,                                    // Order ID
          order.user_name || `User ${order.user_id}`, // Customer Name
          formattedDate,                              // Order Date
          order.status,                               // Status
          parseFloat(order.total_amount).toFixed(2),  // Total Amount
          parseFloat(order.delivery_fee || 0).toFixed(2),  // Delivery Fee
          order.payment_method,                       // Payment Method
          order.delivery_type,                        // Delivery Type
          order.items_count,                          // Items Count
          order.admin_notes || ''                     // Admin Notes
        ];

        dataRows.push(rowData);
      });

      // Create the complete data array with title, spacing, headers, and data
      const completeData = [
        ['Smart Pet Orders Report'], // Title row
        [], // Empty row for spacing
        headers, // Headers row
        ...dataRows // Data rows
      ];

      // Create worksheet from the complete data
      const worksheet = XLSX.utils.aoa_to_sheet(completeData);

      // Set column widths
      worksheet['!cols'] = [
        { width: 10 }, // Order ID
        { width: 20 }, // Customer Name
        { width: 20 }, // Order Date
        { width: 12 }, // Status
        { width: 15 }, // Total Amount
        { width: 15 }, // Delivery Fee
        { width: 18 }, // Payment Method
        { width: 15 }, // Delivery Type
        { width: 12 }, // Items Count
        { width: 30 }  // Admin Notes
      ];

      // Set row heights
      worksheet['!rows'] = [
        { hpt: 40 }, // Title row height
        { hpt: 20 }, // Spacing row height
        { hpt: 25 }, // Header row height
        ...dataRows.map(() => ({ hpt: 20 })) // Data row heights
      ];

      // Merge cells A1:K1 for the title
      if (!worksheet['!merges']) worksheet['!merges'] = [];
      worksheet['!merges'].push({ s: { r: 0, c: 0 }, e: { r: 0, c: headers.length - 1 } });

      // Apply styles using a more compatible approach
      // Title cell (A1) styling
      if (!worksheet['A1']) worksheet['A1'] = {};
      worksheet['A1'].s = {
        font: { 
          name: 'Arial',
          sz: 26, 
          bold: true,
          color: { rgb: "000000" }
        },
        alignment: { 
          horizontal: 'center', 
          vertical: 'center',
          wrapText: true
        },
        fill: { 
          fgColor: { rgb: "FFFFFF" }
        }
      };

      // Header row styling (row 3)
      headers.forEach((_, index) => {
        const cellRef = XLSX.utils.encode_cell({ r: 2, c: index });
        if (!worksheet[cellRef]) worksheet[cellRef] = {};
        worksheet[cellRef].s = {
          font: { 
            name: 'Arial',
            sz: 14, 
            bold: true,
            color: { rgb: "000000" }
          },
          alignment: { 
            horizontal: 'center', 
            vertical: 'center',
            wrapText: true
          },
          fill: { 
            fgColor: { rgb: "E0E0E0" }
          },
          border: {
            top: { style: 'thin', color: { rgb: "000000" } },
            bottom: { style: 'thin', color: { rgb: "000000" } },
            left: { style: 'thin', color: { rgb: "000000" } },
            right: { style: 'thin', color: { rgb: "000000" } }
          }
        };
      });

      // Data rows styling
      dataRows.forEach((_, rowIndex) => {
        headers.forEach((_, colIndex) => {
          const cellRef = XLSX.utils.encode_cell({ r: rowIndex + 3, c: colIndex });
          if (worksheet[cellRef]) {
            if (!worksheet[cellRef].s) worksheet[cellRef].s = {};
            worksheet[cellRef].s = {
              font: { 
                name: 'Arial',
                sz: 14,
                color: { rgb: "000000" }
              },
              alignment: { 
                vertical: 'center',
                wrapText: true
              },
              border: {
                top: { style: 'thin', color: { rgb: "CCCCCC" } },
                bottom: { style: 'thin', color: { rgb: "CCCCCC" } },
                left: { style: 'thin', color: { rgb: "CCCCCC" } },
                right: { style: 'thin', color: { rgb: "CCCCCC" } }
              }
            };
          }
        });
      });

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Orders Report');

      // Generate and download file with better options
      const excelBuffer = XLSX.write(workbook, { 
        bookType: 'xlsx', 
        type: 'array',
        compression: true
      });
      const blob = new Blob([excelBuffer], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `orders_report_${new Date().toISOString().split('T')[0]}.xlsx`;
      link.click();
      URL.revokeObjectURL(url);
      
      toast.success('Orders report downloaded successfully!');
    } catch (error) {
      console.error('Error downloading report:', error);
      toast.error('Error downloading report. Please try again.');
    }
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

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar />
      <div className="ml-64">
        {(isLoading || loading) ? (
          <div className="py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-700 mx-auto"></div>
                <p className="mt-4 text-gray-600">
                  {isLoading ? "Authenticating..." : "Loading orders..."}
                </p>
              </div>
            </div>
          </div>
        ) : error ? (
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
        ) : (
        <div className="py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

            {/* Header */}
            <div className="mb-8">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Order Management</h1>
                  <p className="mt-2 text-gray-600">Review and manage customer orders</p>
                </div>
                {orders.length > 0 && (
                  <div className="flex space-x-3">
                    <button
                      onClick={downloadOrdersReport}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Download Report
                    </button>
                    <button
                      onClick={() => router.push('/admin/charts')}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      View Charts
                    </button>
                  </div>
                )}
              </div>
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
                <p className="mt-1 text-sm text-gray-500">There are no orders to review at this time.</p>
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
                            Customer: {order.user_name || `User ${order.user_id}`} | Placed on {formatDate(order.order_date)}
                          </p>
                          <p className="text-sm text-gray-500">
                            Items: {order.items_count} | Payment: {order.payment_method}
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
                      
                      {/* Voucher Information */}
                      {order.voucher_used && (
                        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded">
                          <span className="font-medium text-green-800">Voucher Applied:</span>
                          <p className="text-green-700 mt-1">{order.voucher_code} - {order.voucher_discount}</p>
                        </div>
                      )}
                      
                      {order.admin_notes && (
                        <div className="mt-4 p-3 bg-gray-50 rounded">
                          <span className="font-medium text-gray-500">Admin Notes:</span>
                          <p className="text-gray-900 mt-1">{order.admin_notes}</p>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="px-6 py-4 bg-gray-50">
                      <div className="flex justify-between items-center">
                        <button
                          onClick={() => router.push(`/admin/orders/${order.id}`)}
                          className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                        >
                          View Details
                        </button>
                        
                        {/* Debug info */}
                        <div className="text-xs text-gray-500 mb-2">
                          Debug: Status = "{order.status}", Order ID = {order.id}
                        </div>
                        
                        {order.status === 'pending' && (
                          <div className="flex space-x-3">
                            <button
                              onClick={() => handleApproveOrder(order.id)}
                              disabled={processingOrder === order.id}
                              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                            >
                              {processingOrder === order.id ? "Processing..." : "Approve"}
                            </button>
                            <button
                              onClick={() => openDenyModal(order.id)}
                              disabled={processingOrder === order.id}
                              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                            >
                              {processingOrder === order.id ? "Processing..." : "Deny"}
                            </button>
                          </div>
                        )}
                        
                        {order.status === 'approved' && (
                          <button
                            onClick={() => openReceiptModal(order)}
                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Receipt
                          </button>
                        )}
                        
                        {order.status !== 'pending' && order.status !== 'approved' && (
                          <div className="text-sm text-gray-500">
                            Order is {order.status} - no actions available
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        )}

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
                onClick={() => handleDenyOrder(selectedOrderId, denyReason)}
                disabled={!denyReason.trim()}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
              >
                Deny Order
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      {showReceiptModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Order Receipt</h2>
              <div className="flex space-x-3">
                <button
                  onClick={downloadReceipt}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H7a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-9a2 2 0 00-2-2H9a2 2 0 00-2 2v9a2 2 0 002 2z" />
                  </svg>
                  Print/Download
                </button>
                <button
                  onClick={() => {
                    setShowReceiptModal(false);
                    setSelectedOrder(null);
                  }}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                >
                  Close
                </button>
              </div>
            </div>

            {/* Receipt Content */}
            <div className="p-8" id="receipt-content">
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
                    <span className="ml-2 text-gray-900">#{selectedOrder.id}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700">Customer:</span>
                    <span className="ml-2 text-gray-900">{selectedOrder.user_name || `User ${selectedOrder.user_id}`}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700">Order Date:</span>
                    <span className="ml-2 text-gray-900">{formatDate(selectedOrder.order_date)}</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <span className="font-semibold text-gray-700">Status:</span>
                    <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedOrder.status)}`}>
                      {getStatusDisplay(selectedOrder.status)}
                    </span>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700">Payment Method:</span>
                    <span className="ml-2 text-gray-900">{selectedOrder.payment_method}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700">Delivery Type:</span>
                    <span className="ml-2 text-gray-900 capitalize">{selectedOrder.delivery_type}</span>
                  </div>
                </div>
              </div>

              {/* Delivery Address */}
              {selectedOrder.shipping_address && selectedOrder.delivery_type === 'delivery' && (
                <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-md">
                  <h3 className="text-lg font-semibold text-blue-900 mb-3">Delivery Address</h3>
                  <div className="text-blue-800">
                    <p>{selectedOrder.shipping_address.street}</p>
                    <p>{selectedOrder.shipping_address.barangay}, {selectedOrder.shipping_address.city}</p>
                    <p>{selectedOrder.shipping_address.state} {selectedOrder.shipping_address.zip_code}</p>
                    <p>{selectedOrder.shipping_address.country}</p>
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
                      {selectedOrder.items && selectedOrder.items.length > 0 ? (
                        selectedOrder.items.map((item, index) => (
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
              {selectedOrder.voucher_used && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
                  <h4 className="font-semibold text-green-800 mb-2">Voucher Applied</h4>
                  <p className="text-green-700">
                    <span className="font-medium">{selectedOrder.voucher_code}</span> - {selectedOrder.voucher_discount}
                  </p>
                </div>
              )}

              {/* Totals */}
              <div className="border-t border-gray-300 pt-6">
                <div className="flex justify-end">
                  <div className="w-64 space-y-2">
                    {selectedOrder.delivery_fee > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Delivery Fee:</span>
                        <span className="text-gray-900">${parseFloat(selectedOrder.delivery_fee).toFixed(2)}</span>
                      </div>
                    )}
                    {selectedOrder.voucher_used && (
                      <div className="flex justify-between text-sm text-green-600">
                        <span>Voucher Discount:</span>
                        <span>-{selectedOrder.voucher_discount}</span>
                      </div>
                    )}
                    <div className="border-t border-gray-300 pt-2">
                      <div className="flex justify-between text-lg font-semibold">
                        <span className="text-gray-900">Total Amount:</span>
                        <span className="text-gray-900">${parseFloat(selectedOrder.total_amount).toFixed(2)}</span>
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
            </div>
          </div>
        </div>
        )}
      </div>
    </div>
  );
} 

