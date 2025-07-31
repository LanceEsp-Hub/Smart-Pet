
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { FiPlus, FiList, FiTrash2, FiEdit, FiClock, FiCheck, FiX } from 'react-icons/fi';
import { createAdminAnnouncement, getUniqueAnnouncements, deleteAnnouncement } from '../../utils/api';
import Modal from 'react-modal';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AdminSidebar from '../../components/AdminSidebar';


const AnnouncementManager = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [announcements, setAnnouncements] = useState([]);
  const [loadingAnnouncements, setLoadingAnnouncements] = useState(true);
  const [viewMode, setViewMode] = useState('create');
  const [daysBack, setDaysBack] = useState(7);
  const [limit, setLimit] = useState(20);
  const [deleteModalIsOpen, setDeleteModalIsOpen] = useState(false);
  const [announcementToDelete, setAnnouncementToDelete] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [currentAnnouncement, setCurrentAnnouncement] = useState(null);

  const fetchUniqueAnnouncements = useCallback(async () => {
    try {
      setLoadingAnnouncements(true);
      const data = await getUniqueAnnouncements(daysBack, limit);
      setAnnouncements(data);
    } catch (err) {
      toast.error(err.message || 'Failed to load announcements');
    } finally {
      setLoadingAnnouncements(false);
    }
  }, [daysBack, limit]);

  useEffect(() => {
    if (viewMode === 'view') {
      fetchUniqueAnnouncements();
    }
  }, [viewMode, daysBack, limit, fetchUniqueAnnouncements]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      toast.error('Title is required');
      return false;
    }
    if (!formData.message.trim()) {
      toast.error('Message is required');
      return false;
    }
    if (formData.title.length > 100) {
      toast.error('Title must be 100 characters or less');
      return false;
    }
    if (formData.message.length > 500) {
      toast.error('Message must be 500 characters or less');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const result = await createAdminAnnouncement(
        formData.title,
        formData.message
      );

      if (result.success) {
        toast.success('Announcement published successfully!');
        setFormData({ title: '', message: '' });
        fetchUniqueAnnouncements();
        setViewMode('view');
      } else {
        toast.error(result.message || 'Failed to create announcement');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to create announcement');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = (announcement) => {
    setAnnouncementToDelete(announcement);
    setDeleteModalIsOpen(true);
  };

  const confirmDelete = async () => {
    try {
      const result = await deleteAnnouncement(announcementToDelete.id);
      if (result.success) {
        toast.success('Announcement deleted successfully');
        fetchUniqueAnnouncements();
      } else {
        toast.error(result.message || 'Failed to delete announcement');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to delete announcement');
    } finally {
      setDeleteModalIsOpen(false);
      setAnnouncementToDelete(null);
    }
  };

  const handleEditClick = (announcement) => {
    setCurrentAnnouncement(announcement);
    setFormData({
      title: announcement.title,
      message: announcement.message
    });
    setEditMode(true);
    setViewMode('create');
  };

  const cancelEdit = () => {
    setEditMode(false);
    setCurrentAnnouncement(null);
    setFormData({ title: '', message: '' });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="flex h-screen bg-gray-50" id="root">
      <AdminSidebar />
      
      <div className="flex-1 overflow-y-auto p-8 ml-64">
        <ToastContainer position="top-right" autoClose={5000} />
        
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Announcements Management</h1>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">
              {announcements.length} {announcements.length === 1 ? 'announcement' : 'announcements'}
            </span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => {
                  setViewMode('create');
                  cancelEdit();
                }}
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm flex items-center justify-center space-x-2 ${
                  viewMode === 'create' 
                    ? 'border-purple-500 text-purple-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <FiPlus className="h-4 w-4" />
                <span>Create Announcement</span>
              </button>
              <button
                onClick={() => setViewMode('view')}
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm flex items-center justify-center space-x-2 ${
                  viewMode === 'view' 
                    ? 'border-purple-500 text-purple-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <FiList className="h-4 w-4" />
                <span>View Announcements</span>
              </button>
            </nav>
          </div>

          <div className="p-6">
            {viewMode === 'create' ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="title"
                    name="title"
                    type="text"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    maxLength={100}
                    placeholder="Enter announcement title"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    {formData.title.length}/100 characters
                  </div>
                </div>
                
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                    Message <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={6}
                    required
                    maxLength={500}
                    placeholder="Enter announcement message"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    {formData.message.length}/500 characters
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 pt-2">
                  {editMode && (
                    <button
                      type="button"
                      onClick={cancelEdit}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                    >
                      Cancel
                    </button>
                  )}
                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className={`px-6 py-2 rounded-lg text-white font-medium flex items-center ${
                      isSubmitting
                        ? 'bg-purple-400 cursor-not-allowed' 
                        : 'bg-purple-600 hover:bg-purple-700 transition'
                    }`}
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </>
                    ) : editMode ? (
                      'Update Announcement'
                    ) : (
                      'Publish Announcement'
                    )}
                  </button>
                </div>
              </form>
            ) : (
              <div>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                  <div className="flex items-center space-x-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Time Range</label>
                      <select 
                        value={daysBack}
                        onChange={(e) => setDaysBack(Number(e.target.value))}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value="1">Last 24 hours</option>
                        <option value="7">Last 7 days</option>
                        <option value="30">Last 30 days</option>
                        <option value="90">Last 90 days</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Show</label>
                      <select
                        value={limit}
                        onChange={(e) => setLimit(Number(e.target.value))}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value="10">10</option>
                        <option value="20">20</option>
                        <option value="50">50</option>
                        <option value="100">100</option>
                      </select>
                    </div>
                  </div>
                </div>

                {loadingAnnouncements ? (
                  <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-500"></div>
                  </div>
                ) : announcements.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="mx-auto h-24 w-24 text-gray-400">
                      <FiList className="w-full h-full" />
                    </div>
                    <h3 className="mt-2 text-lg font-medium text-gray-900">No announcements</h3>
                    <p className="mt-1 text-sm text-gray-500">Get started by creating a new announcement.</p>
                    <div className="mt-6">
                      <button
                        onClick={() => setViewMode('create')}
                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                      >
                        <FiPlus className="-ml-1 mr-2 h-5 w-5" />
                        New Announcement
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {announcements.map((announcement) => (
                      <div 
                        key={`${announcement.id}-${announcement.created_at}`} 
                        className="p-6 border border-gray-200 rounded-xl bg-white hover:shadow-sm transition"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-xl font-semibold text-gray-800">{announcement.title}</h3>
                            <p className="text-sm text-gray-500 mt-1 flex items-center">
                              <FiClock className="mr-1.5" />
                              {formatDate(announcement.created_at)}
                            </p>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEditClick(announcement)}
                              className="p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-full transition"
                              title="Edit"
                            >
                              <FiEdit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteClick(announcement)}
                              className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full transition"
                              title="Delete"
                            >
                              <FiTrash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                        <div className="mt-4 text-gray-700 whitespace-pre-line">
                          {announcement.message}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalIsOpen}
        onRequestClose={() => setDeleteModalIsOpen(false)}
        contentLabel="Delete Announcement"
        className="modal"
        overlayClassName="modal-overlay"
      >
        <div className="bg-white p-6 rounded-lg max-w-md mx-auto">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-xl font-bold text-gray-800">Delete Announcement</h2>
            <button 
              onClick={() => setDeleteModalIsOpen(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <FiX className="h-5 w-5" />
            </button>
          </div>

          <p className="mb-6 text-gray-600">Are you sure you want to delete this announcement? This action cannot be undone.</p>
          
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setDeleteModalIsOpen(false)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              onClick={confirmDelete}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center"
            >
              <FiTrash2 className="mr-2" />
              Delete
            </button>
          </div>
        </div>
      </Modal>

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
          border-radius: 12px;
          outline: none;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
          max-height: 90vh;
          overflow-y: auto;
          width: 90%;
          max-width: 500px;
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
};

export default AnnouncementManager;



// "use client";

// import React, { useState, useEffect, useCallback } from 'react';
// import { useRouter } from 'next/router';
// import { createAdminAnnouncement, getUniqueAnnouncements  } from '../../utils/api';

// const AnnouncementManager = () => {
//   const router = useRouter();
//   const [formData, setFormData] = useState({
//     title: '',
//     message: ''
//   });
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [error, setError] = useState('');
//   const [success, setSuccess] = useState('');
//   const [announcements, setAnnouncements] = useState([]);
//   const [loadingAnnouncements, setLoadingAnnouncements] = useState(true);
//   const [viewMode, setViewMode] = useState('create'); // 'create' or 'view'
//   const [daysBack, setDaysBack] = useState(7);
//   const [limit, setLimit] = useState(20);

//   // Fetch announcements when view mode changes or on component mount
//   useEffect(() => {
//     if (viewMode === 'view') {
//       fetchUniqueAnnouncements();
//     }
//   }, [viewMode, daysBack, limit]);

//   const fetchUniqueAnnouncements = useCallback(async () => {
//   try {
//     setLoadingAnnouncements(true);
//     const data = await getUniqueAnnouncements(daysBack, limit);
//     setAnnouncements(data);
//     setError('');
//   } catch (err) {
//     setError(err.message || 'Failed to load announcements');
//   } finally {
//     setLoadingAnnouncements(false);
//   }
// }, [daysBack, limit]); // Add dependencies here

// useEffect(() => {
//   if (viewMode === 'view') {
//     fetchUniqueAnnouncements();
//   }
// }, [viewMode, daysBack, limit, fetchUniqueAnnouncements]); // Add fetchUniqueAnnouncements to dependencies


//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({
//       ...prev,
//       [name]: value
//     }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError('');
//     setSuccess('');
    
//     if (!formData.title.trim() || !formData.message.trim()) {
//       setError('Title and message are required');
//       return;
//     }

//     setIsSubmitting(true);

//     try {
//       const result = await createAdminAnnouncement(
//         formData.title,
//         formData.message
//       );

//       if (result.success) {
//         setSuccess(result.message);
//         setFormData({ title: '', message: '' });
//         // Refresh the announcements list after creation
//         fetchAnnouncements();
//         setTimeout(() => setViewMode('view'), 2000);
//       } else {
//         setError(result.message || 'Failed to create announcement');
//       }
//     } catch (err) {
//       setError(err.message || 'Failed to create announcement');
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   const formatDate = (dateString) => {
//     return new Date(dateString).toLocaleString();
//   };

//   return (
//     <div className="max-w-4xl mx-auto p-4">
//       <h1 className="text-2xl font-bold mb-6">Announcements Management</h1>

//       <div className="flex space-x-4 mb-6">
//         <button
//           onClick={() => setViewMode('create')}
//           className={`px-4 py-2 rounded ${viewMode === 'create' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
//         >
//           Create Announcement
//         </button>
//         <button
//           onClick={() => setViewMode('view')}
//           className={`px-4 py-2 rounded ${viewMode === 'view' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
//         >
//           View Announcements
//         </button>
//       </div>

//       {error && (
//         <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
//           {error}
//         </div>
//       )}
      
//       {success && (
//         <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
//           {success}
//         </div>
//       )}

//       {viewMode === 'create' ? (
//         <form onSubmit={handleSubmit} className="space-y-4 mb-8">
//           <div className="form-group">
//             <label htmlFor="title" className="block mb-1 font-medium">
//               Title:
//             </label>
//             <input
//               id="title"
//               name="title"
//               type="text"
//               value={formData.title}
//               onChange={handleChange}
//               required
//               maxLength="100"
//               className="w-full p-2 border rounded"
//             />
//           </div>
          
//           <div className="form-group">
//             <label htmlFor="message" className="block mb-1 font-medium">
//               Message:
//             </label>
//             <textarea
//               id="message"
//               name="message"
//               value={formData.message}
//               onChange={handleChange}
//               rows="6"
//               required
//               maxLength="500"
//               className="w-full p-2 border rounded"
//             />
//             <div className="text-sm text-gray-500 mt-1">
//               {formData.message.length}/500 characters
//             </div>
//           </div>
          
//           <div className="pt-2">
//             <button 
//               type="submit" 
//               disabled={isSubmitting || success}
//               className={`px-4 py-2 rounded text-white ${
//                 isSubmitting || success 
//                   ? 'bg-gray-400 cursor-not-allowed' 
//                   : 'bg-blue-600 hover:bg-blue-700'
//               }`}
//             >
//               {isSubmitting ? 'Publishing...' : 'Publish Announcement'}
//             </button>
//           </div>
//         </form>
//       ) : (
//         <div>
//           <div className="mb-4 flex gap-4">
//             <div>
//               <label className="block mb-1">Days to show:</label>
//               <select 
//                 value={daysBack}
//                 onChange={(e) => setDaysBack(Number(e.target.value))}
//                 className="p-2 border rounded"
//               >
//                 <option value="1">Last 1 day</option>
//                 <option value="7">Last 7 days</option>
//                 <option value="30">Last 30 days</option>
//               </select>
//             </div>
            
//             <div>
//               <label className="block mb-1">Max results:</label>
//               <select
//                 value={limit}
//                 onChange={(e) => setLimit(Number(e.target.value))}
//                 className="p-2 border rounded"
//               >
//                 <option value="10">10</option>
//                 <option value="20">20</option>
//                 <option value="50">50</option>
//                 <option value="100">100</option>
//               </select>
//             </div>
//           </div>

//           {loadingAnnouncements ? (
//             <div className="text-center py-8">Loading announcements...</div>
//           ) : announcements.length === 0 ? (
//             <div className="text-center py-8">No announcements found</div>
//           ) : (
//             <div className="space-y-4">
// {announcements.map((announcement) => (
//       <div 
//         key={`${announcement.title}-${announcement.created_at}`} 
//         className="p-4 border rounded bg-white mb-4"
//       >
//         <h3 className="font-bold text-lg">{announcement.title}</h3>
//         <p className="text-gray-600 text-sm mb-2">
//           {formatDate(announcement.created_at)}
//         </p>
//         <p className="mb-2">{announcement.message}</p>

//       </div>
//               ))}
//             </div>
//           )}
//         </div>
//       )}
//     </div>
//   );
// };

// export default AnnouncementManager;
