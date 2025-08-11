import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Chart } from 'chart.js/auto';
import { getApiUrl } from "../../utils/apiUtils";

export default function AdminChartsPage() {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [charts, setCharts] = useState({});

  // Check if user is admin (you can enhance this with proper auth)
  const isAdmin = typeof window !== 'undefined' ? sessionStorage.getItem("is_admin") === "true" : false;
  
  // Temporary: Allow access for testing (remove this in production)
  const allowAccess = true;

  useEffect(() => {
    if (!allowAccess && !isAdmin) {
      router.push('/login');
      return;
    }

    fetchOrders();
  }, [isAdmin, router]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const API_URL = getApiUrl();
      const response = await fetch(`${API_URL}/api/checkout/admin/orders`);
      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }
      const data = await response.json();
      setOrders(data);
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (orders.length > 0) {
      createCharts();
    }
  }, [orders]);

  // Cleanup charts on unmount
  useEffect(() => {
    return () => {
      Object.values(charts).forEach(chart => {
        if (chart && typeof chart.destroy === 'function') {
          chart.destroy();
        }
      });
    };
  }, [charts]);

  const createCharts = () => {
    // Destroy existing charts first
    Object.values(charts).forEach(chart => {
      if (chart && typeof chart.destroy === 'function') {
        chart.destroy();
      }
    });

    // Prepare data for charts
    const statusData = {};
    const paymentData = {};
    const deliveryData = {};
    const monthlyData = {};
    const productSalesData = {};

    orders.forEach(order => {
      // Status distribution
      statusData[order.status] = (statusData[order.status] || 0) + 1;
      
      // Payment method distribution
      paymentData[order.payment_method] = (paymentData[order.payment_method] || 0) + 1;
      
      // Delivery type distribution
      deliveryData[order.delivery_type] = (deliveryData[order.delivery_type] || 0) + 1;
      
      // Monthly order distribution
      const orderDate = new Date(order.order_date);
      const monthYear = `${orderDate.getFullYear()}-${String(orderDate.getMonth() + 1).padStart(2, '0')}`;
      monthlyData[monthYear] = (monthlyData[monthYear] || 0) + 1;
      
             // Product sales distribution - only count approved orders
       if (order.status === 'approved' && order.items && order.items.length > 0) {
         order.items.forEach(item => {
           const productName = item.product_name || `Product ${item.product_id}`;
           if (productSalesData[productName]) {
             productSalesData[productName].quantity += item.quantity;
             productSalesData[productName].revenue += item.subtotal;
           } else {
             productSalesData[productName] = {
               quantity: item.quantity,
               revenue: item.subtotal
             };
           }
         });
       }
    });

    const newCharts = {};

    // Create Status Distribution Chart
    const statusCtx = document.getElementById('statusChart');
    if (statusCtx) {
      newCharts.statusChart = new Chart(statusCtx, {
        type: 'pie',
        data: {
          labels: Object.keys(statusData),
          datasets: [{
            data: Object.values(statusData),
            backgroundColor: [
              '#FF6384',
              '#36A2EB',
              '#FFCE56',
              '#4BC0C0',
              '#9966FF',
              '#FF9F40'
            ]
          }]
        },
        options: {
          responsive: true,
          plugins: {
            title: {
              display: true,
              text: 'Order Status Distribution'
            }
          }
        }
      });
    }

    // Create Payment Method Chart
    const paymentCtx = document.getElementById('paymentChart');
    if (paymentCtx) {
      newCharts.paymentChart = new Chart(paymentCtx, {
        type: 'doughnut',
        data: {
          labels: Object.keys(paymentData),
          datasets: [{
            data: Object.values(paymentData),
            backgroundColor: [
              '#FF6384',
              '#36A2EB',
              '#FFCE56',
              '#4BC0C0'
            ]
          }]
        },
        options: {
          responsive: true,
          plugins: {
            title: {
              display: true,
              text: 'Payment Method Distribution'
            }
          }
        }
      });
    }

    // Create Delivery Type Chart
    const deliveryCtx = document.getElementById('deliveryChart');
    if (deliveryCtx) {
      newCharts.deliveryChart = new Chart(deliveryCtx, {
        type: 'pie',
        data: {
          labels: Object.keys(deliveryData),
          datasets: [{
            data: Object.values(deliveryData),
            backgroundColor: [
              '#FF6384',
              '#36A2EB'
            ]
          }]
        },
        options: {
          responsive: true,
          plugins: {
            title: {
              display: true,
              text: 'Delivery Type Distribution'
            }
          }
        }
      });
    }

    // Create Monthly Orders Chart
    const monthlyCtx = document.getElementById('monthlyChart');
    if (monthlyCtx) {
      newCharts.monthlyChart = new Chart(monthlyCtx, {
        type: 'bar',
        data: {
          labels: Object.keys(monthlyData).sort(),
          datasets: [{
            label: 'Orders',
            data: Object.keys(monthlyData).sort().map(key => monthlyData[key]),
            backgroundColor: '#36A2EB',
            borderColor: '#2693E6',
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          plugins: {
            title: {
              display: true,
              text: 'Monthly Orders'
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                stepSize: 1
              }
            }
          }
        }
      });
    }

    // Create Product Sales Chart
    const productSalesCtx = document.getElementById('productSalesChart');
    if (productSalesCtx && Object.keys(productSalesData).length > 0) {
      // Sort products by revenue (descending) and take top 10
      const sortedProducts = Object.entries(productSalesData)
        .sort(([,a], [,b]) => b.revenue - a.revenue)
        .slice(0, 10);
      
      newCharts.productSalesChart = new Chart(productSalesCtx, {
        type: 'bar',
        data: {
          labels: sortedProducts.map(([name]) => name.length > 20 ? name.substring(0, 20) + '...' : name),
          datasets: [{
            label: 'Revenue ($)',
            data: sortedProducts.map(([,data]) => data.revenue),
            backgroundColor: '#FF6384',
            borderColor: '#FF6384',
            borderWidth: 1
          }]
        },
                 options: {
           responsive: true,
           plugins: {
             title: {
               display: true,
               text: 'Top 10 Products by Revenue (Approved Orders Only)'
             },
             tooltip: {
               callbacks: {
                 afterLabel: function(context) {
                   const productName = sortedProducts[context.dataIndex][0];
                   const productData = sortedProducts[context.dataIndex][1];
                   return [
                     `Quantity Sold: ${productData.quantity}`,
                     `Revenue: $${productData.revenue.toFixed(2)}`,
                     `Status: Approved Orders Only`
                   ];
                 }
               }
             }
           },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                callback: function(value) {
                  return '$' + value.toFixed(2);
                }
              }
            }
          }
        }
      });
    }

    setCharts(newCharts);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-700 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading charts...</p>
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
              <h1 className="text-3xl font-bold text-gray-900">Order Analytics</h1>
              <p className="mt-2 text-gray-600">Visualize order data and trends</p>
            </div>
            <button
              onClick={() => router.push('/admin/orders')}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Orders
            </button>
          </div>
        </div>

                 {/* Charts Grid */}
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
           {/* Status Distribution */}
           <div className="bg-white p-6 rounded-lg shadow">
             <canvas id="statusChart"></canvas>
           </div>

           {/* Payment Method Distribution */}
           <div className="bg-white p-6 rounded-lg shadow">
             <canvas id="paymentChart"></canvas>
           </div>

           {/* Delivery Type Distribution */}
           <div className="bg-white p-6 rounded-lg shadow">
             <canvas id="deliveryChart"></canvas>
           </div>

           {/* Monthly Orders */}
           <div className="bg-white p-6 rounded-lg shadow">
             <canvas id="monthlyChart"></canvas>
           </div>

           {/* Product Sales */}
           <div className="bg-white p-6 rounded-lg shadow lg:col-span-2">
             <canvas id="productSalesChart"></canvas>
           </div>
         </div>

        {/* Summary Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Orders</p>
                <p className="text-2xl font-semibold text-gray-900">{orders.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                <p className="text-2xl font-semibold text-gray-900">
                  ${orders.reduce((sum, order) => sum + parseFloat(order.total_amount), 0).toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-8 w-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Pending Orders</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {orders.filter(order => order.status === 'pending').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-8 w-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Approved Orders</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {orders.filter(order => order.status === 'approved').length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 