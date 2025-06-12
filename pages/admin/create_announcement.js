// import React, { useState } from 'react';
// import { useRouter } from 'next/router';
// import { createAdminAnnouncement } from '../../utils/api';

// const CreateAnnouncement = () => {
//   const router = useRouter();
//   const [formData, setFormData] = useState({
//     title: '',
//     message: '',
//     isUrgent: false
//   });
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [error, setError] = useState('');
//   const [success, setSuccess] = useState('');

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
//         formData.message,
//         formData.isUrgent
//       );

//       if (result.success) {
//         setSuccess(result.message);
//         // Clear form and prevent resubmission
//         setFormData({ title: '', message: '', isUrgent: false });
//         setTimeout(() => router.push('/admin'), 2000);
//       } else {
//         setError(result.message);
//       }
//     } catch (err) {
//       setError(err.message || 'Failed to create announcement');
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   return (
//     <div>
//       <h1>Create System Announcement</h1>
      
//       {error && <div style={{ color: 'red' }}>{error}</div>}
//       {success && <div style={{ color: 'green' }}>{success}</div>}

//       <form onSubmit={handleSubmit}>
//         <div>
//           <label>Title:</label>
//           <input
//             type="text"
//             value={title}
//             onChange={(e) => setTitle(e.target.value)}
//             required
//           />
//         </div>
        
//         <div>
//           <label>Message:</label>
//           <textarea
//             value={message}
//             onChange={(e) => setMessage(e.target.value)}
//             rows="6"
//             required
//             maxLength="500"
//           />
//           <div>{message.length}/500 characters</div>
//         </div>
        
//         <div>
//           <input
//             type="checkbox"
//             id="isUrgent"
//             checked={isUrgent}
//             onChange={(e) => setIsUrgent(e.target.checked)}
//           />
//           <label htmlFor="isUrgent">Mark as urgent announcement</label>
//         </div>
        
//         <div>
// <button 
//           type="submit" 
//           disabled={isSubmitting || success}
//         >
//           {isSubmitting ? 'Publishing...' : 'Publish Announcement'}
//         </button>        </div>
//       </form>
//     </div>
//   );
// };

// export default CreateAnnouncement;


// "use client";

// import React, { useState } from 'react';
// import { useRouter } from 'next/router';
// import { createAdminAnnouncement } from '../../utils/api';

// const CreateAnnouncement = () => {
//   const router = useRouter();
//   const [formData, setFormData] = useState({
//     title: '',
//     message: ''
//   });
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [error, setError] = useState('');
//   const [success, setSuccess] = useState('');

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
//         // Clear form and prevent resubmission
//         setFormData({ title: '', message: '' });
//         setTimeout(() => router.push('/admin'), 2000);
//       } else {
//         setError(result.message || 'Failed to create announcement');
//       }
//     } catch (err) {
//       setError(err.message || 'Failed to create announcement');
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   return (
//     <div className="max-w-2xl mx-auto p-4">
//       <h1 className="text-2xl font-bold mb-6">Create System Announcement</h1>
      
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

//       <form onSubmit={handleSubmit} className="space-y-4">
//         <div className="form-group">
//           <label htmlFor="title" className="block mb-1 font-medium">
//             Title:
//           </label>
//           <input
//             id="title"
//             name="title"
//             type="text"
//             value={formData.title}
//             onChange={handleChange}
//             required
//             maxLength="100"
//             className="w-full p-2 border rounded"
//           />
//         </div>
        
//         <div className="form-group">
//           <label htmlFor="message" className="block mb-1 font-medium">
//             Message:
//           </label>
//           <textarea
//             id="message"
//             name="message"
//             value={formData.message}
//             onChange={handleChange}
//             rows="6"
//             required
//             maxLength="500"
//             className="w-full p-2 border rounded"
//           />
//           <div className="text-sm text-gray-500 mt-1">
//             {formData.message.length}/500 characters
//           </div>
//         </div>
        
//         <div className="pt-2">
//           <button 
//             type="submit" 
//             disabled={isSubmitting || success}
//             className={`px-4 py-2 rounded text-white ${
//               isSubmitting || success 
//                 ? 'bg-gray-400 cursor-not-allowed' 
//                 : 'bg-blue-600 hover:bg-blue-700'
//             }`}
//           >
//             {isSubmitting ? 'Publishing...' : 'Publish Announcement'}
//           </button>
//         </div>
//       </form>
//     </div>
//   );
// };

// export default CreateAnnouncement;


"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { createAdminAnnouncement, getUniqueAnnouncements  } from '../../utils/api';

const AnnouncementManager = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [announcements, setAnnouncements] = useState([]);
  const [loadingAnnouncements, setLoadingAnnouncements] = useState(true);
  const [viewMode, setViewMode] = useState('create'); // 'create' or 'view'
  const [daysBack, setDaysBack] = useState(7);
  const [limit, setLimit] = useState(20);

  // Fetch announcements when view mode changes or on component mount
  useEffect(() => {
    if (viewMode === 'view') {
      fetchUniqueAnnouncements();
    }
  }, [viewMode, daysBack, limit]);

  const fetchUniqueAnnouncements = async () => {
    try {
      setLoadingAnnouncements(true);
      const data = await getUniqueAnnouncements(daysBack, limit);
      setAnnouncements(data);
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to load announcements');
    } finally {
      setLoadingAnnouncements(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!formData.title.trim() || !formData.message.trim()) {
      setError('Title and message are required');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await createAdminAnnouncement(
        formData.title,
        formData.message
      );

      if (result.success) {
        setSuccess(result.message);
        setFormData({ title: '', message: '' });
        // Refresh the announcements list after creation
        fetchAnnouncements();
        setTimeout(() => setViewMode('view'), 2000);
      } else {
        setError(result.message || 'Failed to create announcement');
      }
    } catch (err) {
      setError(err.message || 'Failed to create announcement');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Announcements Management</h1>

      <div className="flex space-x-4 mb-6">
        <button
          onClick={() => setViewMode('create')}
          className={`px-4 py-2 rounded ${viewMode === 'create' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
        >
          Create Announcement
        </button>
        <button
          onClick={() => setViewMode('view')}
          className={`px-4 py-2 rounded ${viewMode === 'view' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
        >
          View Announcements
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}
      
      {success && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
          {success}
        </div>
      )}

      {viewMode === 'create' ? (
        <form onSubmit={handleSubmit} className="space-y-4 mb-8">
          <div className="form-group">
            <label htmlFor="title" className="block mb-1 font-medium">
              Title:
            </label>
            <input
              id="title"
              name="title"
              type="text"
              value={formData.title}
              onChange={handleChange}
              required
              maxLength="100"
              className="w-full p-2 border rounded"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="message" className="block mb-1 font-medium">
              Message:
            </label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              rows="6"
              required
              maxLength="500"
              className="w-full p-2 border rounded"
            />
            <div className="text-sm text-gray-500 mt-1">
              {formData.message.length}/500 characters
            </div>
          </div>
          
          <div className="pt-2">
            <button 
              type="submit" 
              disabled={isSubmitting || success}
              className={`px-4 py-2 rounded text-white ${
                isSubmitting || success 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isSubmitting ? 'Publishing...' : 'Publish Announcement'}
            </button>
          </div>
        </form>
      ) : (
        <div>
          <div className="mb-4 flex gap-4">
            <div>
              <label className="block mb-1">Days to show:</label>
              <select 
                value={daysBack}
                onChange={(e) => setDaysBack(Number(e.target.value))}
                className="p-2 border rounded"
              >
                <option value="1">Last 1 day</option>
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
              </select>
            </div>
            
            <div>
              <label className="block mb-1">Max results:</label>
              <select
                value={limit}
                onChange={(e) => setLimit(Number(e.target.value))}
                className="p-2 border rounded"
              >
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </select>
            </div>
          </div>

          {loadingAnnouncements ? (
            <div className="text-center py-8">Loading announcements...</div>
          ) : announcements.length === 0 ? (
            <div className="text-center py-8">No announcements found</div>
          ) : (
            <div className="space-y-4">
{announcements.map((announcement) => (
      <div 
        key={`${announcement.title}-${announcement.created_at}`} 
        className="p-4 border rounded bg-white mb-4"
      >
        <h3 className="font-bold text-lg">{announcement.title}</h3>
        <p className="text-gray-600 text-sm mb-2">
          {formatDate(announcement.created_at)}
        </p>
        <p className="mb-2">{announcement.message}</p>

      </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AnnouncementManager;