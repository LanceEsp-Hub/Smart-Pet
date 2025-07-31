
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { getPetsForManagement, managePet } from '../../utils/api';
import AdminSidebar from '../../components/AdminSidebar';
import { FiCheck, FiX, FiEye, FiMapPin, FiUser, FiMail, FiClock, FiFilter, FiChevronLeft, FiChevronRight, FiImage } from 'react-icons/fi';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Modal from 'react-modal';

Modal.setAppElement('#root');

const statusOptions = [
  { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'approved', label: 'Approved', color: 'bg-green-100 text-green-800' },
  { value: 'rejected', label: 'Rejected', color: 'bg-red-100 text-red-800' }
];

const petStatusColors = {
  'Safe at Home': 'bg-green-100 text-green-800',
  'Lost': 'bg-yellow-100 text-yellow-800',
  'Found': 'bg-blue-100 text-blue-800'
};

// Add this function to handle pet image URLs
const getPetImageUrl = (imageName) => {
  if (!imageName) return "https://via.placeholder.com/100";
  return `http://localhost:8000/uploads/pet_images/${imageName}?t=${Date.now()}`;
};

export default function PetManagement() {
  const router = useRouter();
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0
  });
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedPet, setSelectedPet] = useState(null);
  const [selectedAction, setSelectedAction] = useState('');
  const [imagePreview, setImagePreview] = useState({ open: false, url: '' });

  const fetchPets = async () => {
    try {
      setLoading(true);
      const data = await getPetsForManagement(
        statusFilter,
        pagination.page,
        pagination.limit
      );
      setPets(data.data);
      setPagination(prev => ({
        ...prev,
        total: data.total
      }));
      setError(null);
    } catch (err) {
      setError(err.message);
      toast.error(`Failed to fetch pets: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPets();
  }, [statusFilter, pagination.page]);

  const openConfirmationModal = (petId, action) => {
    setSelectedPet(petId);
    setSelectedAction(action);
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setSelectedPet(null);
    setSelectedAction('');
  };

  const handleAction = async () => {
    try {
      await managePet(selectedPet, selectedAction);
      toast.success(`Pet ${selectedAction}d successfully`);
      fetchPets();
      closeModal();
    } catch (err) {
      toast.error(`Failed to ${selectedAction} pet: ${err.message}`);
      setError(err.message);
    }
  };

  const openImagePreview = (imageUrl) => {
    setImagePreview({ open: true, url: imageUrl });
  };

  const closeImagePreview = () => {
    setImagePreview({ open: false, url: '' });
  };

  const getActionLabel = (action) => {
    switch(action) {
      case 'approve': return 'Approve';
      case 'reject': return 'Reject';
      case 'unpublish': return 'Unpublish';
      default: return '';
    }
  };

  const getActionDescription = (action) => {
    switch(action) {
      case 'approve': return 'This pet will be visible to all users';
      case 'reject': return 'This pet will be rejected and hidden from users';
      case 'unpublish': return 'This pet will be unpublished and hidden from users';
      default: return '';
    }
  };

  return (
    <div className="flex h-screen bg-white" id="root">
      <AdminSidebar />
      
      <div className="flex-1 overflow-y-auto p-8 ml-64 bg-white">
        <ToastContainer position="top-right" autoClose={5000} />
        
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Pet Management</h1>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-500">
              {pagination.total} pets total
            </span>
          </div>
        </div>
        
        {/* Status Filter */}
        <div className="mb-8">
          <div className="flex items-center mb-2">
            <FiFilter className="text-gray-400 mr-2" />
            <span className="text-sm font-medium text-gray-700">Filter by status:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {statusOptions.map((status) => (
              <button
                key={status.value}
                onClick={() => {
                  setStatusFilter(status.value);
                  setPagination(prev => ({ ...prev, page: 1 }));
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  statusFilter === status.value 
                    ? `${status.color} border border-transparent`
                    : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {status.label}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded">
            <div className="flex">
              <div className="flex-shrink-0">
                <FiX className="h-5 w-5 text-red-500" />
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
            {/* Pets Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pet</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Owner</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {pets.map((pet) => (
                      <tr key={pet.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="relative group">
                              <img 
                                className="h-12 w-12 rounded-lg object-cover cursor-pointer"
                                src={getPetImageUrl(pet.image)}
                                alt={pet.name}
                                onClick={() => openImagePreview(getPetImageUrl(pet.image))}
                              />
                              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded-lg transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                                <FiEye className="text-white text-lg" />
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{pet.name}</div>
                              <div className="text-xs text-gray-500">ID: {pet.id}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center text-sm text-gray-900 capitalize">
                            <FiUser className="mr-2 text-gray-400" />
                            {pet.type} • {pet.gender}
                          </div>
                          <div className="flex items-center text-sm text-gray-500 mt-1">
                            <FiMapPin className="mr-2 text-gray-400" />
                            {pet.address || 'No address'}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">{pet.owner_name}</div>
                          <div className="text-sm text-gray-500">{pet.owner_email}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col space-y-2">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              petStatusColors[pet.status] || 'bg-gray-100 text-gray-800'
                            }`}>
                              {pet.status}
                            </span>
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              pet.has_generated_fingerprint ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {pet.has_generated_fingerprint ? 'Fingerprint generated' : 'Fingerprint pending'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex flex-col space-y-2">
                            {statusFilter === 'pending' && (
                              <>
                                <button
                                  onClick={() => openConfirmationModal(pet.id, 'approve')}
                                  className="flex items-center text-green-600 hover:text-green-800"
                                >
                                  <FiCheck className="mr-1" /> Approve
                                </button>
                                <button
                                  onClick={() => openConfirmationModal(pet.id, 'reject')}
                                  className="flex items-center text-red-600 hover:text-red-800"
                                >
                                  <FiX className="mr-1" /> Reject
                                </button>
                              </>
                            )}
                            {statusFilter === 'approved' && (
                              <button
                                onClick={() => openConfirmationModal(pet.id, 'unpublish')}
                                className="flex items-center text-yellow-600 hover:text-yellow-800"
                              >
                                <FiX className="mr-1" /> Unpublish
                              </button>
                            )}
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
                  <span className="font-medium">{pagination.total}</span> pets
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

        {/* Confirmation Modal */}
        <Modal
          isOpen={modalIsOpen}
          onRequestClose={closeModal}
          contentLabel="Confirmation Modal"
          className="modal"
          overlayClassName="modal-overlay"
        >
          <div className="bg-white p-6 rounded-lg max-w-md mx-auto mt-20">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Confirm {getActionLabel(selectedAction)}</h2>
            <p className="text-gray-600 mb-6">
              {getActionDescription(selectedAction)}
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={closeModal}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAction}
                className={`px-4 py-2 rounded-md text-white ${
                  selectedAction === 'reject' ? 'bg-red-600 hover:bg-red-700' :
                  selectedAction === 'unpublish' ? 'bg-yellow-600 hover:bg-yellow-700' :
                  'bg-green-600 hover:bg-green-700'
                }`}
              >
                {getActionLabel(selectedAction)}
              </button>
            </div>
          </div>
        </Modal>

        {/* Image Preview Modal */}
        <Modal
          isOpen={imagePreview.open}
          onRequestClose={closeImagePreview}
          contentLabel="Image Preview"
          className="modal"
          overlayClassName="modal-overlay"
        >
          <div className="bg-white p-4 rounded-lg max-w-3xl mx-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-800">Pet Image Preview</h2>
              <button 
                onClick={closeImagePreview}
                className="text-gray-500 hover:text-gray-700"
              >
                <FiX className="h-5 w-5" />
              </button>
            </div>
            <div className="flex justify-center">
              <img 
                src={imagePreview.url} 
                alt="Pet preview" 
                className="max-h-[70vh] max-w-full object-contain rounded-lg"
              />
            </div>
          </div>
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



















// "use client";

// import { useState, useEffect } from 'react';
// import { useRouter } from 'next/router';
// import { getPetsForManagement, managePet } from '../../utils/api';
// import AdminSidebar from '../../components/AdminSidebar'; // Adjusted path

// export default function PetManagement() {
//   const router = useRouter();
//   const [pets, setPets] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [statusFilter, setStatusFilter] = useState('pending');
//   const [pagination, setPagination] = useState({
//     page: 1,
//     limit: 10,
//     total: 0
//   });

//   const fetchPets = async () => {
//     try {
//       setLoading(true);
//       const data = await getPetsForManagement(
//         statusFilter,
//         pagination.page,
//         pagination.limit
//       );
//       setPets(data.data);
//       setPagination(prev => ({
//         ...prev,
//         total: data.total
//       }));
//       setError(null);
//     } catch (err) {
//       setError(err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchPets();
//   }, [fetchPets, statusFilter, pagination.page]);

//   const handleAction = async (petId, action) => {
//     try {
//       await managePet(petId, action);
//       fetchPets(); // Refresh the list
//     } catch (err) {
//       setError(err.message);
//     }
//   };

//   return (
//     <div className="flex h-screen">
//       <AdminSidebar />
      
//       <div className="flex-1 overflow-y-auto p-8 ml-64">
//         <h1 className="text-2xl font-bold text-gray-900 mb-6">Pet Management</h1>
        
//         {/* Status Filter */}
//         <div className="mb-6 flex space-x-2">
//           {['pending', 'approved', 'rejected'].map((status) => (
//             <button
//               key={status}
//               onClick={() => {
//                 setStatusFilter(status);
//                 setPagination(prev => ({ ...prev, page: 1 }));
//               }}
//               className={`px-4 py-2 rounded-md ${
//                 statusFilter === status ? 'bg-purple-600 text-white' : 'bg-gray-200'
//               }`}
//             >
//               {status.charAt(0).toUpperCase() + status.slice(1)}
//             </button>
//           ))}
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
//             {/* Pets Table */}
//             <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
//               <table className="min-w-full divide-y divide-gray-200">
//                 // Update your table columns to include the new fields
// <thead className="bg-gray-50">
//   <tr>
//     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pet</th>
//     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type/Gender</th>
//     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
//     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Owner</th>
//     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fingerprint</th>
//     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
//     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
//   </tr>
// </thead>

// <tbody className="bg-white divide-y divide-gray-200">
//   {pets.map((pet) => (
//     <tr key={pet.id} className="hover:bg-gray-50">
//       <td className="px-6 py-4 whitespace-nowrap">
//         <div className="flex items-center">
//           {pet.image && (
//             <div className="flex-shrink-0 h-10 w-10">
//               <img className="h-10 w-10 rounded-full object-cover" src={pet.image} alt={pet.name} />
//             </div>
//           )}
//           <div className="ml-4">
//             <div className="text-sm font-medium text-gray-900">{pet.name}</div>
//             <div className="text-sm text-gray-500">ID: {pet.id}</div>
//           </div>
//         </div>
//       </td>
//       <td className="px-6 py-4 whitespace-nowrap">
//         <div className="text-sm text-gray-900 capitalize">{pet.type}</div>
//         <div className="text-sm text-gray-500 capitalize">{pet.gender}</div>
//       </td>
//       <td className="px-6 py-4">
//         <div className="text-sm text-gray-900">{pet.address}</div>
//         {pet.latitude && pet.longitude && (
//           <div className="text-xs text-gray-500">
//             {pet.latitude.toFixed(4)}, {pet.longitude.toFixed(4)}
//           </div>
//         )}
//       </td>
//       <td className="px-6 py-4 whitespace-nowrap">
//         <div className="text-sm text-gray-900">{pet.owner_name}</div>
//         <div className="text-sm text-gray-500">{pet.owner_email}</div>
//       </td>
//       <td className="px-6 py-4 whitespace-nowrap">
//         <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
//           pet.has_generated_fingerprint ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
//         }`}>
//           {pet.has_generated_fingerprint ? 'Generated' : 'Pending'}
//         </span>
//       </td>
//       <td className="px-6 py-4 whitespace-nowrap">
//         <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
//           pet.status === 'Safe at Home' ? 'bg-green-100 text-green-800' :
//           pet.status === 'Lost' ? 'bg-yellow-100 text-yellow-800' :
//           'bg-blue-100 text-blue-800'
//         }`}>
//           {pet.status}
//         </span>
//         <div className="text-xs text-gray-500 mt-1">
//           {pet.admin_approved ? 'Approved' : 'Pending approval'}
//         </div>
//       </td>
//       <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
//         {statusFilter === 'pending' && (
//           <>
//             <button
//               onClick={() => handleAction(pet.id, 'approve')}
//               className="text-green-600 hover:text-green-900 mr-3"
//             >
//               Approve
//             </button>
//             <button
//               onClick={() => handleAction(pet.id, 'reject')}
//               className="text-red-600 hover:text-red-900"
//             >
//               Reject
//             </button>
//           </>
//         )}
//         {statusFilter === 'approved' && (
//           <button
//             onClick={() => handleAction(pet.id, 'unpublish')}
//             className="text-yellow-600 hover:text-yellow-900"
//           >
//             Unpublish
//           </button>
//         )}
//       </td>
//     </tr>
//   ))}
// </tbody>
//               </table>
//             </div>

//             {/* Pagination */}
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm text-gray-700">
//                   Showing <span className="font-medium">{(pagination.page - 1) * pagination.limit + 1}</span> to{' '}
//                   <span className="font-medium">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> of{' '}
//                   <span className="font-medium">{pagination.total}</span> pets
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
