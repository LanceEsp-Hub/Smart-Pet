
"use client";

import { useState, useEffect } from 'react';
import { getPetHealthRecords } from '../../utils/api';
import AdminSidebar from '../../components/AdminSidebar';
import { FiSearch, FiChevronLeft, FiChevronRight, FiUser, FiHeart, FiActivity, FiClock, FiCheck, FiX, FiAlertTriangle, FiInfo } from 'react-icons/fi';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Modal from 'react-modal';

Modal.setAppElement('#root');

export default function PetHealthManagement() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0
  });
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const data = await getPetHealthRecords(pagination.page, pagination.limit, searchTerm);
      setRecords(data.data);
      setPagination(prev => ({ ...prev, total: data.total }));
      setError(null);
    } catch (err) {
      setError(err.message);
      toast.error(`Failed to fetch records: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [pagination.page, searchTerm]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim() === '' || searchTerm.length >= 2) {
      setPagination(prev => ({ ...prev, page: 1 }));
      fetchRecords();
    }
  };

  const openDetailModal = (record) => {
    setSelectedRecord(record);
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setSelectedRecord(null);
  };

  const getStatusColor = (status) => {
    switch(status.toLowerCase()) {
      case 'healthy': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="flex h-screen bg-white" id="root">
      <AdminSidebar />
      
      <div className="flex-1 overflow-y-auto p-8 ml-64 bg-white">
        <ToastContainer position="top-right" autoClose={5000} />
        
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Pet Health Management</h1>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-500">
              {pagination.total} records total
            </span>
          </div>
        </div>
        
        {/* Search Bar */}
        <form onSubmit={handleSearch} className="mb-8">
          <div className="relative max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search pets or owners..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              minLength={2}
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  setPagination(prev => ({ ...prev, page: 1 }));
                  fetchRecords();
                }}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <FiX className="text-gray-400 hover:text-gray-600" />
              </button>
            )}
          </div>
          {searchTerm.length === 1 && (
            <p className="mt-1 text-xs text-red-500">Please enter at least 2 characters</p>
          )}
        </form>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded">
            <div className="flex">
              <div className="flex-shrink-0">
                <FiAlertTriangle className="h-5 w-5 text-red-500" />
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
            {/* Health Records Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pet Info</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Health Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Temperament</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Compatibility</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Updated</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {records.map((record) => (
                      <tr 
                        key={record.pet_id} 
                        className="hover:bg-gray-50 transition-colors cursor-pointer"
                        onClick={() => openDetailModal(record)}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 bg-purple-100 rounded-lg flex items-center justify-center">
                              <FiHeart className="text-purple-600" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{record.pet_name}</div>
                              <div className="text-xs text-gray-500 capitalize">{record.pet_type} • {record.pet_gender}</div>
                            </div>
                          </div>
                          <div className="text-xs text-gray-400 mt-1">Owner: {record.owner_name}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(record.pet_status)}`}>
                              {record.pet_status}
                            </span>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            <span className="font-medium">Vaccinated:</span> {record.vaccinated || 'Unknown'}
                          </div>
                          <div className="text-xs text-gray-500">
                            <span className="font-medium">Spayed/Neutered:</span> {record.spayed_neutered || 'Unknown'}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-700 line-clamp-2">
                            {record.temperament_personality || 'Not specified'}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="grid grid-cols-2 gap-1 text-xs">
                            {record.good_with?.children && <span className="text-green-600 flex items-center"><FiCheck className="mr-1" /> Children</span>}
                            {record.good_with?.dogs && <span className="text-green-600 flex items-center"><FiCheck className="mr-1" /> Dogs</span>}
                            {record.good_with?.cats && <span className="text-green-600 flex items-center"><FiCheck className="mr-1" /> Cats</span>}
                            {record.good_with?.elderly && <span className="text-green-600 flex items-center"><FiCheck className="mr-1" /> Elderly</span>}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-500">
                            {new Date(record.updated_at || record.created_at).toLocaleDateString()}
                          </div>
                          <div className="text-xs text-gray-400">
                            {new Date(record.updated_at || record.created_at).toLocaleTimeString()}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-2">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{(pagination.page - 1) * pagination.limit + 1}</span> to{' '}
                  <span className="font-medium">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> of{' '}
                  <span className="font-medium">{pagination.total}</span> records
                </p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                  disabled={pagination.page === 1}
                  className={`px-4 py-2 border rounded-md flex items-center ${pagination.page === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}`}
                >
                  <FiChevronLeft className="mr-1" /> Previous
                </button>
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                  disabled={pagination.page * pagination.limit >= pagination.total}
                  className={`px-4 py-2 border rounded-md flex items-center ${pagination.page * pagination.limit >= pagination.total ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}`}
                >
                  Next <FiChevronRight className="ml-1" />
                </button>
              </div>
            </div>
          </>
        )}

        {/* Health Record Detail Modal */}
        <Modal
          isOpen={modalIsOpen}
          onRequestClose={closeModal}
          contentLabel="Health Record Details"
          className="modal"
          overlayClassName="modal-overlay"
        >
          {selectedRecord && (
            <div className="bg-white p-6 rounded-lg max-w-2xl mx-auto">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-800">{selectedRecord.pet_name}'s Health Details</h2>
                  <p className="text-sm text-gray-500">ID: {selectedRecord.pet_id}</p>
                </div>
                <button 
                  onClick={closeModal}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <FiX className="h-5 w-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-2 flex items-center">
                    <FiUser className="mr-2 text-purple-600" /> Basic Info
                  </h3>
                  <div className="text-black space-y-2 text-sm">
                    <p><span className="font-medium">Type:</span> {selectedRecord.pet_type}</p>
                    <p><span className="font-medium">Gender:</span> {selectedRecord.pet_gender}</p>
                    <p><span className="font-medium">Status:</span> 
                      <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${getStatusColor(selectedRecord.pet_status)}`}>
                        {selectedRecord.pet_status}
                      </span>
                    </p>
                    <p><span className="font-medium">Owner:</span> {selectedRecord.owner_name}</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-2 flex items-center">
                    <FiActivity className="mr-2 text-purple-600" /> Health Info
                  </h3>
                  <div className="text-black space-y-2 text-sm">
                    <p><span className="font-medium">Vaccinated:</span> {selectedRecord.vaccinated || 'Unknown'}</p>
                    <p><span className="font-medium">Spayed/Neutered:</span> {selectedRecord.spayed_neutered || 'Unknown'}</p>
                    <p><span className="font-medium">Energy Level:</span> {selectedRecord.energy_level || 'Not specified'}</p>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-800 mb-2 flex items-center">
                  <FiHeart className="mr-2 text-purple-600" /> Temperament
                </h3>
                <div className="text-black bg-gray-50 p-4 rounded-lg text-sm">
                  {selectedRecord.temperament_personality || 'No temperament information available'}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-2">Compatibility</h3>
                  <div className="text-black space-y-1 text-sm">
                    {selectedRecord.good_with?.children && <p className="text-green-600 flex items-center"><FiCheck className="mr-1" /> Good with children</p>}
                    {selectedRecord.good_with?.dogs && <p className="text-green-600 flex items-center"><FiCheck className="mr-1" /> Good with other dogs</p>}
                    {selectedRecord.good_with?.cats && <p className="text-green-600 flex items-center"><FiCheck className="mr-1" /> Good with cats</p>}
                    {selectedRecord.good_with?.elderly && <p className="text-green-600 flex items-center"><FiCheck className="mr-1" /> Good with elderly</p>}
                    {selectedRecord.good_with?.strangers && <p className="text-green-600 flex items-center"><FiCheck className="mr-1" /> Good with strangers</p>}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-2">Additional Info</h3>
                  <div className="text-black space-y-2 text-sm">
                    <p><span className="font-medium">Created:</span> {new Date(selectedRecord.created_at).toLocaleString()}</p>
                    <p><span className="font-medium">Last Updated:</span> {new Date(selectedRecord.updated_at).toLocaleString()}</p>
                    {selectedRecord.reason_for_adoption && (
                      <p><span className="font-medium">Adoption Reason:</span> {selectedRecord.reason_for_adoption}</p>
                    )}
                  </div>
                </div>
              </div>

              {selectedRecord.health_details && (
                <div className="mt-6">
                  <h3 className="text-lg font-medium text-gray-800 mb-2 flex items-center">
                    <FiInfo className="mr-2 text-purple-600" /> Health Details
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-lg text-sm">
                    {selectedRecord.health_details}
                  </div>
                </div>
              )}
            </div>
          )}
        </Modal>
      </div>

      <style jsx global>{`
        .modal {
          position: absolute;
          top: 50%;
          left: 50%;
          right: auto;
          bottom: auto;
          margin-right: -50%;
          transform: translate(-50%, -50%);
          background: white;
          padding: 0;
          border-radius: 8px;
          outline: none;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
          max-height: 90vh;
          overflow-y: auto;
          width: 90%;
          max-width: 800px;
        }
        
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          z-index: 1000;
        }
      `}</style>
    </div>
  );
}





















// import { useState, useEffect } from 'react';
// import { getPetHealthRecords } from '../../utils/api';
// import AdminSidebar from '../../components/AdminSidebar';

// export default function PetHealthManagement() {
//   const [records, setRecords] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [pagination, setPagination] = useState({
//     page: 1,
//     limit: 10,
//     total: 0
//   });

//   const fetchRecords = async () => {
//     try {
//       setLoading(true);
//       const data = await getPetHealthRecords(pagination.page, pagination.limit, searchTerm);
//       setRecords(data.data);
//       setPagination(prev => ({ ...prev, total: data.total }));
//       setError(null);
//     } catch (err) {
//       setError(err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchRecords();
//   }, [pagination.page, searchTerm]);

//   const handleSearch = (e) => {
//     e.preventDefault();
//     setPagination(prev => ({ ...prev, page: 1 }));
//     fetchRecords();
//   };

//   return (
//     <div className="flex h-screen">
//       <AdminSidebar />
      
//       <div className="flex-1 overflow-y-auto p-8 ml-64">
//         <h1 className="text-2xl font-bold text-gray-900 mb-6">Pet Health Management</h1>
        
//         {/* Search Bar */}
//         <form onSubmit={handleSearch} className="mb-6">
//           <div className="flex">
//             <input
//               type="text"
//               placeholder="Search by pet name, owner or health details..."
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//               className="flex-1 p-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-purple-500"
//             />
//             <button
//               type="submit"
//               className="bg-purple-600 text-white px-4 py-2 rounded-r-md hover:bg-purple-700"
//             >
//               Search
//             </button>
//           </div>
//         </form>

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
//             {/* Health Records Table */}
//             <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
//               <table className="min-w-full divide-y divide-gray-200">
//                 <thead className="bg-gray-50">
//                   <tr>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pet Info</th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Health Status</th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Temperament</th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Compatibility</th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Updated</th>
//                   </tr>
//                 </thead>
//                 <tbody className="bg-white divide-y divide-gray-200">
//                   {records.map((record) => (
//                     <tr key={record.pet_id} className="hover:bg-gray-50">
//                       <td className="px-6 py-4">
//                         <div className="text-sm font-medium text-gray-900">{record.pet_name}</div>
//                         <div className="text-sm text-gray-500 capitalize">{record.pet_type} • {record.pet_status}</div>
//                         <div className="text-xs text-gray-400 mt-1">Owner: {record.owner_name}</div>
//                         <div className="text-xs text-gray-400">ID: {record.pet_id}</div>
//                       </td>
//                       <td className="px-6 py-4">
//                         <div className="text-sm">
//                           <span className="font-medium">Vaccinated:</span> {record.vaccinated || 'Unknown'}
//                         </div>
//                         <div className="text-sm">
//                           <span className="font-medium">Spayed/Neutered:</span> {record.spayed_neutered || 'Unknown'}
//                         </div>
//                         <div className="text-sm">
//                           <span className="font-medium">Energy:</span> {record.energy_level || 'Not specified'}
//                         </div>
//                         {record.health_details && (
//                           <div className="text-xs text-gray-500 mt-1">
//                             Details: {record.health_details.substring(0, 50)}...
//                           </div>
//                         )}
//                       </td>
//                       <td className="px-6 py-4">
//                         {record.temperament_personality ? (
//                           <div className="text-sm text-gray-700">
//                             {record.temperament_personality.substring(0, 100)}...
//                           </div>
//                         ) : (
//                           <span className="text-sm text-gray-500">Not specified</span>
//                         )}
//                         {record.reason_for_adoption && (
//                           <div className="text-xs text-gray-500 mt-1">
//                             <span className="font-medium">Adoption reason:</span> {record.reason_for_adoption.substring(0, 50)}...
//                           </div>
//                         )}
//                       </td>
//                       <td className="px-6 py-4">
//                         <div className="grid grid-cols-2 gap-1 text-xs">
//                           {record.good_with.children && <span className="text-green-600">✓ Children</span>}
//                           {record.good_with.dogs && <span className="text-green-600">✓ Dogs</span>}
//                           {record.good_with.cats && <span className="text-green-600">✓ Cats</span>}
//                           {record.good_with.elderly && <span className="text-green-600">✓ Elderly</span>}
//                           {record.good_with.strangers && <span className="text-green-600">✓ Strangers</span>}
//                         </div>
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap">
//                         <div className="text-sm text-gray-500">
//                           {new Date(record.updated_at || record.created_at).toLocaleDateString()}
//                         </div>
//                         <div className="text-xs text-gray-400">
//                           {new Date(record.updated_at || record.created_at).toLocaleTimeString()}
//                         </div>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>

//             {/* Pagination */}
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm text-gray-700">
//                   Showing <span className="font-medium">{(pagination.page - 1) * pagination.limit + 1}</span> to{' '}
//                   <span className="font-medium">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> of{' '}
//                   <span className="font-medium">{pagination.total}</span> records
//                 </p>
//               </div>
//               <div className="flex space-x-2">
//                 <button
//                   onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
//                   disabled={pagination.page === 1}
//                   className="px-4 py-2 border rounded-md disabled:opacity-50"
//                 >
//                   Previous
//                 </button>
//                 <button
//                   onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
//                   disabled={pagination.page * pagination.limit >= pagination.total}
//                   className="px-4 py-2 border rounded-md disabled:opacity-50"
//                 >
//                   Next
//                 </button>
//               </div>
//             </div>
//           </>
//         )}
//       </div>
//     </div>
//   );
// }
