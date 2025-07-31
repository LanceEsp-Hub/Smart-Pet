
"use client";

import { useState, useEffect } from 'react';
import { getLoginLogs } from '../../utils/api';
import AdminSidebar from '../../components/AdminSidebar';
import { FiFilter, FiRefreshCw, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { BsCheckCircleFill, BsXCircleFill } from 'react-icons/bs';

export default function SecurityLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    email: '',
    status: '',
    attempt_type: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0
  });

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getLoginLogs(pagination.page, pagination.limit, filters);
      setLogs(data.data || []);
      setPagination(prev => ({ 
        ...prev, 
        total: data.total || 0 
      }));
    } catch (err) {
      setError(err.message || 'Failed to fetch logs');
      setLogs([]);
      setPagination(prev => ({ ...prev, total: 0 }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchLogs();
    }, 300); // Debounce the API calls
    
    return () => clearTimeout(timer);
  }, [pagination.page, filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const resetFilters = () => {
    setFilters({ email: '', status: '', attempt_type: '' });
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const formatAttemptType = (type) => {
    if (!type) return 'N/A';
    return type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar />
      
      <div className="flex-1 overflow-y-auto p-8 ml-64">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Security Logs</h1>
          <button 
            onClick={fetchLogs}
            className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <FiRefreshCw className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
        
        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="flex items-center mb-3">
            <FiFilter className="text-gray-500 mr-2" />
            <h3 className="text-sm font-medium text-gray-700">Filters</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="text"
                name="email"
                placeholder="Search by email"
                value={filters.email}
                onChange={handleFilterChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">All Statuses</option>
                <option value="success">Success</option>
                <option value="failed">Failed</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Attempt Type</label>
              <select
                name="attempt_type"
                value={filters.attempt_type}
                onChange={handleFilterChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">All Types</option>
                <option value="login">Login</option>
                <option value="logout">Logout</option>
                <option value="token_refresh">Token Refresh</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={resetFilters}
                className="w-full p-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <BsXCircleFill className="h-5 w-5 text-red-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : (
          <>
            {/* Logs Table */}
            <div className="bg-white shadow overflow-hidden rounded-lg">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">IP Address</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {logs.length > 0 ? (
                      logs.map((log) => (
                        <tr key={log.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{log.id}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {log.user_id || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{log.email}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <span className="bg-gray-100 px-2 py-1 rounded-md text-xs font-mono">
                              {log.ip_address || 'N/A'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              {log.status === 'success' ? (
                                <>
                                  <BsCheckCircleFill className="text-green-500 mr-2" />
                                  <span className="text-green-800">Success</span>
                                </>
                              ) : (
                                <>
                                  <BsXCircleFill className="text-red-500 mr-2" />
                                  <span className="text-red-800">Failed</span>
                                </>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-xs">
                              {formatAttemptType(log.attempt_type)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(log.created_at).toLocaleString()}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="px-6 py-4 text-center text-sm text-gray-500">
                          No logs found matching your criteria
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            {pagination.total > 0 && (
              <div className="flex items-center justify-between mt-4 px-4 py-3 bg-white border-t border-gray-200 sm:px-6 rounded-b-lg">
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing <span className="font-medium">{(pagination.page - 1) * pagination.limit + 1}</span> to{' '}
                      <span className="font-medium">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> of{' '}
                      <span className="font-medium">{pagination.total}</span> results
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                      <button
                        onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                        disabled={pagination.page === 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span className="sr-only">Previous</span>
                        <FiChevronLeft className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                        disabled={pagination.page * pagination.limit >= pagination.total}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span className="sr-only">Next</span>
                        <FiChevronRight className="h-5 w-5" />
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}


















// import { useState, useEffect } from 'react';
// import { getLoginLogs } from '../../utils/api';
// import AdminSidebar from '../../components/AdminSidebar';

// export default function SecurityLogs() {
//   const [logs, setLogs] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [filters, setFilters] = useState({
//     email: '',
//     status: '',
//     attempt_type: ''
//   });
//   const [pagination, setPagination] = useState({
//     page: 1,
//     limit: 10,
//     total: 0
//   });

//   const fetchLogs = async () => {
//     try {
//       setLoading(true);
//       setError(null);
//       const data = await getLoginLogs(pagination.page, pagination.limit, filters);
//       setLogs(data.data || []);
//       setPagination(prev => ({ 
//         ...prev, 
//         total: data.total || 0 
//       }));
//     } catch (err) {
//       setError(err.message || 'Failed to fetch logs');
//       setLogs([]);
//       setPagination(prev => ({ ...prev, total: 0 }));
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     const timer = setTimeout(() => {
//       fetchLogs();
//     }, 300); // Debounce the API calls
    
//     return () => clearTimeout(timer);
//   }, [pagination.page, filters]);

//   const handleFilterChange = (e) => {
//     const { name, value } = e.target;
//     setFilters(prev => ({ ...prev, [name]: value }));
//     setPagination(prev => ({ ...prev, page: 1 }));
//   };

//   const resetFilters = () => {
//     setFilters({ email: '', status: '', attempt_type: '' });
//     setPagination(prev => ({ ...prev, page: 1 }));
//   };

//   const formatAttemptType = (type) => {
//     if (!type) return 'N/A';
//     return type.split('_').map(word => 
//       word.charAt(0).toUpperCase() + word.slice(1)
//     ).join(' ');
//   };

//   return (
//     <div className="flex h-screen">
//       <AdminSidebar />
      
//       <div className="flex-1 overflow-y-auto p-8 ml-64">
//         <h1 className="text-2xl font-bold mb-6">Security Logs</h1>
        
//         {/* Filters */}
//         <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
//           <input
//             type="text"
//             name="email"
//             placeholder="Filter by email"
//             value={filters.email}
//             onChange={handleFilterChange}
//             className="p-2 border rounded"
//           />
//           <select
//             name="status"
//             value={filters.status}
//             onChange={handleFilterChange}
//             className="p-2 border rounded"
//           >
//             <option value="">All Statuses</option>
//             <option value="success">Success</option>
//             <option value="failed">Failed</option>
//           </select>
//           <select
//             name="attempt_type"
//             value={filters.attempt_type}
//             onChange={handleFilterChange}
//             className="p-2 border rounded"
//           >
//             <option value="">All Types</option>
//             <option value="login">Login</option>
//             <option value="logout">Logout</option>
//             <option value="token_refresh">Token Refresh</option>
//           </select>
//           <button
//             onClick={resetFilters}
//             className="p-2 bg-gray-200 rounded hover:bg-gray-300"
//           >
//             Clear Filters
//           </button>
//         </div>

//         {error && (
//           <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
//             {error}
//           </div>
//         )}

//         {loading ? (
//           <div className="flex justify-center items-center h-64">
//             <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
//           </div>
//         ) : (
//           <>
//             {/* Logs Table */}
//             <div className="overflow-x-auto">
//               <table className="min-w-full divide-y divide-gray-200">
//                 <thead className="bg-gray-50">
//                   <tr>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User ID</th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">IP Address</th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
//                   </tr>
//                 </thead>
//                 <tbody className="bg-white divide-y divide-gray-200">
//                   {logs.length > 0 ? (
//                     logs.map((log) => (
//                       <tr key={log.id} className="hover:bg-gray-50">
//                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{log.id}</td>
//                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                           {log.user_id || 'N/A'}
//                         </td>
//                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{log.email}</td>
//                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{log.ip_address || 'N/A'}</td>
//                         <td className="px-6 py-4 whitespace-nowrap">
//                           <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
//                             log.status === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
//                           }`}>
//                             {log.status}
//                           </span>
//                         </td>
//                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                           {formatAttemptType(log.attempt_type)}
//                         </td>
//                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                           {new Date(log.created_at).toLocaleString()}
//                         </td>
//                       </tr>
//                     ))
//                   ) : (
//                     <tr>
//                       <td colSpan="7" className="px-6 py-4 text-center text-sm text-gray-500">
//                         No logs found
//                       </td>
//                     </tr>
//                   )}
//                 </tbody>
//               </table>
//             </div>

//             {/* Pagination */}
//             {pagination.total > 0 && (
//               <div className="flex items-center justify-between mt-4">
//                 <div>
//                   <p className="text-sm text-gray-700">
//                     Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
//                     {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
//                     {pagination.total} records
//                   </p>
//                 </div>
//                 <div className="flex space-x-2">
//                   <button
//                     onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
//                     disabled={pagination.page === 1}
//                     className="px-4 py-2 border rounded disabled:opacity-50"
//                   >
//                     Previous
//                   </button>
//                   <button
//                     onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
//                     disabled={pagination.page * pagination.limit >= pagination.total}
//                     className="px-4 py-2 border rounded disabled:opacity-50"
//                   >
//                     Next
//                   </button>
//                 </div>
//               </div>
//             )}
//           </>
//         )}
//       </div>
//     </div>
//   );
// }
