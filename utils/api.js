// //frontend\utils\api.jsa
// //frontend\utils\api.js
// const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";



// const handleResponse = async (response) => {
//   const data = await response.json().catch(() => ({}));
  
//   if (!response.ok) {
//     const errorMessage = 
//       data.detail?.map?.(error => error.msg).join(", ") ||
//       data.detail ||
//       data.message ||
//       `Request failed with status ${response.status}`;
    
//     console.error("API Error:", {
//       status: response.status,
//       message: errorMessage,
//       data: data
//     });
    
//     throw new Error(errorMessage);
//   }
  
//   return data;
// };

// // export async function registerUser(userData) {
// //   const response = await fetch(`${API_URL}/api/register`, {
// //       method: "POST",
// //       headers: {
// //           "Content-Type": "application/json",
// //       },
// //       body: JSON.stringify(userData),
// //   });

// //   return response.json();
// // }
// export async function registerUser(userData) {
//   try {
//     console.log("Registering user:", userData);
    
//     const response = await fetch(`${API_URL}/api/register`, {  // Single /api
//       method: "POST",
//       credentials: 'include',  // For cookies/sessions if needed
//       headers: {
//         "Content-Type": "application/json",
//         "Accept": "application/json",
//       },
//       body: JSON.stringify(userData),
//     });
    
//     if (!response.ok) {
//       const errorData = await response.json();
//       throw new Error(errorData.detail || "Registration failed");
//     }
    
//     return await response.json();
//   } catch (error) {
//     console.error("Registration error:", error);
//     throw error;
//   }
// }


// // export async function loginUser(userData) {
// //   const response = await fetch(`${API_URL}/api/login`, {
// //       method: "POST",
// //       headers: {
// //           "Content-Type": "application/json",
// //       },
// //       body: JSON.stringify(userData),
// //   });

// //   return response.json();
// // }

// export async function loginUser(userData) {
//   try {
//     console.log("Logging in user:", { email: userData.email });
    
//     const response = await fetch(`${API_URL}/api/login`, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify(userData),
//     });
    
//     const result = await handleResponse(response);
//     console.log("Login successful:", result);
//     return result;
//   } catch (error) {
//     console.error("Error logging in user:", error);
//     throw error;
//   }
// }


// export async function sendPasswordResetEmail(email) {
//   try {
//     const response = await fetch(`${API_URL}/api/forgot-password`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ email }),
//     });
//     return handleResponse(response);
//   } catch (error) {
//     console.error("Error sending password reset email:", error);
//     throw error;
//   }
// }

// export async function resetPassword({ token, password }) {
//   try {
//     const response = await fetch(
//       `${API_URL}/api/reset-password?token=${encodeURIComponent(token)}&new_password=${encodeURIComponent(password)}`,
//       {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//       }
//     );
//     return handleResponse(response);
//   } catch (error) {
//     console.error("Error resetting password:", error);
//     throw error;
//   }
// }


// export async function createPet(petData) {
//   try {
//     const response = await fetch(`${API_URL}/api/pets/`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(petData),
//     });
//     return handleResponse(response);
//   } catch (error) {
//     console.error("Error creating pet:", error);
//     throw error;
//   }
// }


// export async function uploadPetImage(file) {
//   const formData = new FormData();
//   formData.append('file', file);
  
//   try {
//       const response = await fetch(`${API_URL}/api/pets/upload-image`, {
//           method: "POST",
//           body: formData,
//       });
//       return await response.json();
//   } catch (error) {
//       return Promise.reject(error);
//   }
// }

// export async function verifyPetImage(file) {
//   const formData = new FormData();
//   formData.append('file', file);
  
//   try {
//       const response = await fetch(`${API_URL}/api/pets/verify-pet-image`, {
//           method: "POST",
//           body: formData,
//       });
      
//       // Always parse the response as JSON
//       const data = await response.json();
      
//       // The backend now always returns 200, so we just return the data
//       return data;
      
//   } catch (error) {
//       // Network errors or failed JSON parsing
//       console.error("Verification request failed:", error);
//       return {
//           is_valid: false,
//           message: "Could not connect to verification service",
//           error: true
//       };
//   }
// }


// export const fetchPetDashboard = async (token) => {
//   try {
//     const userId = sessionStorage.getItem("user_id");
//     if (!userId) throw new Error("User ID not available");
    
//     const response = await fetch(
//       `${API_URL}/api/pets/dashboard?user_id=${userId}`,
//       {
//         method: 'GET',
//         headers: { 'Authorization': `Bearer ${token}` },
//       }
//     );
//     return handleResponse(response);
//   } catch (error) {
//     console.error("Error fetching pet dashboard:", error);
//     throw error;
//   }
// };



// export const getImageUrl = (imagePath) => {
//   if (!imagePath) return "/placeholder.jpg";
  
//   // Handle full URLs (if stored in DB)
//   if (imagePath.startsWith('http')) return imagePath;
  
//   // Handle cases where imagePath is in the new format (pet_id/filename)
//   if (imagePath.includes('/')) {
//     const [petId, filename] = imagePath.split('/');
//     // For both development and production
//     return `/uploads/pet_images/${petId}/${filename}`;
//   }

//   // Handle old format (timestamp filenames) - backward compatibility
//   if (API_URL.includes('localhost') || API_URL.includes('127.0.0.1')) {
//     return `${API_URL}/uploads/pet_images/${imagePath}`;
//   }
  
//   // Production - old format
//   return `/uploads/pet_images/${imagePath}`;
// };

// // Add admin approval status to fetchPetDetails response handling
// export async function fetchPetDetails(id) {
//   try {
//     const token = sessionStorage.getItem('auth_token');
//     const response = await fetch(`${API_URL}/api/pets/${id}`, {
//       method: 'GET',
//       headers: {
//         'Authorization': `Bearer ${token}`,
//       },
//     });

//     if (!response.ok) {
//       const errorData = await response.json();
//       throw new Error(errorData.detail || 'Failed to fetch pet details');
//     }

//     return await response.json();
//   } catch (error) {
//     console.error('Error fetching pet details:', error);
//     throw error;
//   }
// }



// // Update in frontend/utils/api.js
// export async function deletePet(petId, token) {
//   try {
//     const userId = sessionStorage.getItem("user_id");
//     if (!userId) throw new Error("User ID not available");
    
//     const response = await fetch(`${API_URL}/api/pets/${petId}?user_id=${userId}`, {
//       method: "DELETE",
//       headers: {
//         "Authorization": `Bearer ${token}`,
//       },
//     });
//     return handleResponse(response);
//   } catch (error) {
//     console.error("Error deleting pet:", error);
//     throw error;
//   }
// }
// export async function updatePetStatus(petId, status) {
//   const response = await fetch(`${API_URL}/api/pets/${petId}/status`, {
//     method: "PATCH",
//     headers: {
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify({ status }),
//   });
//   return handleResponse(response);
// }

// export async function togglePublishPet(petId, publishStatus) {
//   try {
//     const token = sessionStorage.getItem("auth_token");
//     const response = await fetch(`${API_URL}/api/pets/${petId}/publish`, {
//       method: "PATCH",
//       headers: {
//         "Content-Type": "application/json",
//         "Authorization": `Bearer ${token}`,
//       },
//       body: JSON.stringify({
//         publish: publishStatus
//       }),
//     });

//     if (!response.ok) {
//       const errorData = await response.json();
//       throw new Error(errorData.detail || "Failed to update publish status");
//     }

//     return await response.json();
//   } catch (error) {
//     console.error("Error toggling publish status:", error);
//     throw error;
//   }
// }

// // Add this function (similar to togglePublishPet but more specific)
// export async function unpublishPet(petId) {
//   try {
//     const token = sessionStorage.getItem("auth_token");
//     const response = await fetch(`${API_URL}/api/pets/${petId}/publish`, {
//       method: "PATCH",
//       headers: {
//         "Content-Type": "application/json",
//         "Authorization": `Bearer ${token}`,
//       },
//       body: JSON.stringify({
//         publish: false // Explicitly set to false
//       }),
//     });

//     if (!response.ok) {
//       const errorData = await response.json();
//       throw new Error(errorData.detail || "Failed to unpublish pet");
//     }

//     return await response.json();
//   } catch (error) {
//     console.error("Error unpublishing pet:", error);
//     throw error;
//   }
// }


// // Update pet details
// export const updatePetDetails = async (petId, petData) => {
//   try {
//     const token = sessionStorage.getItem("auth_token");
//     const response = await fetch(`${API_URL}/api/pets/${petId}`, {
//       method: "PATCH",
//       headers: {
//         "Content-Type": "application/json",
//         "Authorization": `Bearer ${token}`
//       },
//       body: JSON.stringify(petData)
//     });
//     return handleResponse(response);
//   } catch (error) {
//     console.error("Error updating pet:", error);
//     throw error;
//   }
// };






// // utils/api.js
// export async function getAddress(token, user_id) {
//   try {
//     const response = await fetch(`${API_URL}/api/user/${user_id}/address`, {
//       method: 'GET',
//       headers: {
//         'Authorization': `Bearer ${token}`,
//       },
//     });
    
//     if (response.status === 404) {
//       return null; // No address exists
//     }
    
//     if (!response.ok) {
//       const errorData = await response.json();
//       throw new Error(errorData.detail || 'Failed to fetch address');
//     }
    
//     return await response.json();
//   } catch (error) {
//     console.error('Error fetching address:', error);
//     throw error;
//   }
// }

// export async function updateAddress(token, user_id, addressData) {
//   try {
//     const response = await fetch(`${API_URL}/api/user/${user_id}/address`, {
//       method: 'PATCH',
//       headers: {
//         'Authorization': `Bearer ${token}`,
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify(addressData),
//     });
    
//     if (!response.ok) {
//       const errorData = await response.json();
//       throw new Error(errorData.detail || 'Failed to update address');
//     }
    
//     return await response.json();
//   } catch (error) {
//     console.error('Error updating address:', error);
//     throw error;
//   }
// }



// // Add to your existing api.js
// export async function getUserProfile(token, user_id) {
//   try {
//     const response = await fetch(`${API_URL}/api/user/${user_id}`, {
//       method: 'GET',
//       headers: {
//         'Authorization': `Bearer ${token}`,
//       },
//     });
    
//     if (!response.ok) {
//       const errorData = await response.json();
//       throw new Error(errorData.detail || 'Failed to fetch user profile');
//     }
    
//     return await response.json();
//   } catch (error) {
//     console.error('Error fetching user profile:', error);
//     throw error;
//   }
// }

// export async function uploadProfilePicture(token, file) {
//   try {
//     const formData = new FormData();
//     formData.append('file', file);
    
//     const response = await fetch(`${API_URL}/api/user/upload-picture`, {
//       method: 'POST',
//       headers: {
//         'Authorization': `Bearer ${token}`,
//       },
//       body: formData,
//     });
    
//     if (!response.ok) {
//       const errorData = await response.json();
//       throw new Error(errorData.detail || 'Failed to upload profile picture');
//     }
    
//     return await response.json();
//   } catch (error) {
//     console.error('Error uploading profile picture:', error);
//     throw error;
//   }
// }

// export async function updateUserProfile(token, user_id, updateData) {
//   try {
//     const response = await fetch(`${API_URL}/api/user/${user_id}`, {
//       method: 'PATCH',
//       headers: {
//         'Authorization': `Bearer ${token}`,
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify(updateData),
//     });
    
//     if (!response.ok) {
//       const errorData = await response.json();
//       throw new Error(errorData.detail || 'Failed to update profile');
//     }
    
//     return await response.json();
//   } catch (error) {
//     console.error('Error updating user profile:', error);
//     throw error;
//   }
// }

// // Notification API functions
// export async function getNotificationSettings(token, user_id) {
//   try {
//     const response = await fetch(`${API_URL}/api/user/${user_id}/notifications`, {
//       method: 'GET',
//       headers: {
//         'Authorization': `Bearer ${token}`,
//       },
//     });

//     if (!response.ok) {
//       const errorData = await response.json();
//       throw new Error(errorData.detail || 'Failed to fetch notification settings');
//     }

//     return await response.json();
//   } catch (error) {
//     console.error('Error fetching notification settings:', error);
//     throw error;
//   }
// }

// export async function updateNotificationSettings(token, user_id, settings) {
//   try {
//     const response = await fetch(`${API_URL}/api/user/${user_id}/notifications`, {
//       method: 'PATCH',
//       headers: {
//         'Authorization': `Bearer ${token}`,
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify(settings),
//     });

//     if (!response.ok) {
//       const errorData = await response.json();
//       throw new Error(errorData.detail || 'Failed to update notification settings');
//     }

//     return await response.json();
//   } catch (error) {
//     console.error('Error updating notification settings:', error);
//     throw error;
//   }
// }



// // utils/api.js
// export async function getUserPrivacySettings(token, user_id) {
//   const response = await fetch(`${API_URL}/api/user/${user_id}/privacy-settings`, {
//     headers: {
//       'Authorization': `Bearer ${token}`
//     }
//   });
//   return handleResponse(response);
// }

// export async function changeUserPassword(token, user_id, password_data) {
//   const response = await fetch(`${API_URL}/api/user/${user_id}/change-password`, {
//     method: 'POST',
//     headers: {
//       'Authorization': `Bearer ${token}`,
//       'Content-Type': 'application/json'
//     },
//     body: JSON.stringify(password_data)
//   });
//   return handleResponse(response);
// }



// // frontend/utils/api.js
// export async function deleteUserAccount(token, user_id) {
//   try {
//     const response = await fetch(`${API_URL}/api/user/${user_id}`, {
//       method: 'DELETE',
//       headers: {
//         'Authorization': `Bearer ${token}`,
//         'Content-Type': 'application/json'
//       }
//     });

//     if (!response.ok) {
//       const errorData = await response.json();
//       throw new Error(errorData.detail || 'Failed to delete account');
//     }

//     return await response.json();
//   } catch (error) {
//     console.error('Error deleting account:', error);
//     throw error;
//   }
// }

// // Add to your existing api.js
// export async function getUnreadNotificationCount(token, user_id) {
//   const response = await fetch(`${API_URL}/api/notifications/unread-count/${user_id}`, {
//     headers: {
//       'Authorization': `Bearer ${token}`
//     }
//   });
//   return handleResponse(response);
// }

// export async function getUserNotifications(token, user_id) {
//   const response = await fetch(`${API_URL}/api/notifications/user/${user_id}`, {
//     headers: {
//       'Authorization': `Bearer ${token}`
//     }
//   });
//   return handleResponse(response);
// }

// // frontend/utils/api.js

// export async function checkNotificationSettings(token, user_id) {
//   const response = await fetch(`${API_URL}/api/notifications/check-settings/${user_id}`, {
//     headers: {
//       'Authorization': `Bearer ${token}`
//     }
//   });
//   return handleResponse(response);
// }


// export async function markNotificationAsRead(token, notificationId) {
//   const response = await fetch(`${API_URL}/api/notifications/${notificationId}/read`, {
//     method: 'PATCH',
//     headers: {
//       'Authorization': `Bearer ${token}`,
//       'Content-Type': 'application/json'
//     }
//   });
//   return handleResponse(response);
// }

// export async function markAllNotificationsAsRead(token, userId) {
//   const response = await fetch(`${API_URL}/api/notifications/mark-all-read/${userId}`, {
//     method: 'PATCH',
//     headers: {
//       'Authorization': `Bearer ${token}`,
//       'Content-Type': 'application/json'
//     }
//   });
  
//   if (!response.ok) {
//     const error = await response.json().catch(() => ({}));
//     throw new Error(error.message || 'Failed to mark all as read');
//   }
  
//   return response.json();
// }





// export async function updatePetImage(petId, file) {
//   const formData = new FormData();
//   formData.append('file', file);
  
//   try {
//     const token = sessionStorage.getItem('auth_token');
//     const response = await fetch(`${API_URL}/api/pets/${petId}/update-image`, {
//       method: 'POST',
//       headers: {
//         'Authorization': `Bearer ${token}`,
//       },
//       body: formData,
//     });

//     console.log('Image update response:', response);  // Debug log

//     if (!response.ok) {
//       const errorData = await response.json();
//       console.error('Image update error:', errorData);  // Debug log
//       throw new Error(errorData.detail || 'Failed to update pet image');
//     }

//     const result = await response.json();
//     console.log('Image update result:', result);  // Debug log
//     return result;
//   } catch (error) {
//     console.error('Error updating pet image:', error);  // Debug log
//     throw error;
//   }
// }

// export async function addAdditionalImage(petId, file, imageType) {
//   const formData = new FormData();
//   formData.append('file', file);
//   formData.append('image_type', imageType);
  
//   try {
//     const token = sessionStorage.getItem('auth_token');
//     const response = await fetch(`${API_URL}/api/pets/${petId}/add-additional-image`, {
//       method: 'POST',
//       headers: {
//         'Authorization': `Bearer ${token}`,
//       },
//       body: formData,
//     });
    
//     if (!response.ok) {
//       const errorData = await response.json();
//       // Return the error message in a consistent format
//       throw new Error(
//         errorData.detail || 
//         errorData.message || 
//         'Failed to add additional image'
//       );
//     }
    
//     return await response.json();
//   } catch (error) {
//     console.error('Error adding additional image:', error);
//     throw error;
//   }
// }


// export async function removeAdditionalImage(petId, index) {
//   try {
//     const token = sessionStorage.getItem('auth_token');
//     const response = await fetch(`${API_URL}/api/pets/${petId}/remove-additional-image?index=${index}`, {
//       method: 'DELETE',
//       headers: {
//         'Authorization': `Bearer ${token}`,
//       },
//     });
//     return handleResponse(response);
//   } catch (error) {
//     console.error('Error removing additional image:', error);
//     throw error;
//   }
// }


// // frontend/utils/api.js

// // Add these functions to your existing api.js

// export async function generatePetFingerprint(petId) {
//   try {
//     const token = sessionStorage.getItem("auth_token");
//     const response = await fetch(`${API_URL}/api/pets/${petId}/generate-fingerprint`, {
//       method: "POST",
//       headers: {
//         "Authorization": `Bearer ${token}`,
//       },
//     });

//     if (!response.ok) {
//       const errorData = await response.json();
//       throw new Error(errorData.detail || "Failed to generate fingerprint");
//     }

//     return await response.json();
//   } catch (error) {
//     console.error("Error generating fingerprint:", error);
//     throw error;
//   }
// }


// export const getPetFlyerData = async (petId) => {
//   try {
//     const token = sessionStorage.getItem('auth_token');  // Add auth if needed
//     const response = await fetch(`${API_URL}/api/pets/${petId}/flyer-data`, {
//       headers: token ? { 'Authorization': `Bearer ${token}` } : {}
//     });
    
//     if (!response.ok) {
//       const errorData = await response.json();
//       throw new Error(errorData.detail || 'Failed to fetch pet flyer data');
//     }
//     return await response.json();
//   } catch (error) {
//     console.error('Error fetching pet flyer data:', error);
//     throw error;
//   }
// };

// export const generateFlyerImage = async (htmlElement) => {
//   const html2canvas = (await import('html2canvas')).default;
//   return await html2canvas(htmlElement, {
//     scale: 2,
//     logging: false,
//     useCORS: true
//   });
// };


// // // frontend/utils/api.js
// // export async function findSimilarPets(petId, threshold = 0.65, limit = 10) {
// //   try {
// //     const token = sessionStorage.getItem("auth_token");
// //     const response = await fetch(
// //       `${API_URL}/api/pets/${petId}/find-similar?threshold=${threshold}&limit=${limit}`,
// //       {
// //         method: "GET",
// //         headers: {
// //           "Authorization": `Bearer ${token}`,
// //         },
// // export async function findSimilarPets(petId, distanceFilter = "no limit", threshold = 0.65, limit = 10) {
// //   try {
// //     const token = sessionStorage.getItem("auth_token");
// //     const response = await fetch(
// //       `${API_URL}/api/pets/${petId}/find-similar?threshold=${threshold}&limit=${limit}&max_distance=${distanceFilter}`,
// //       {
// //         method: "GET",
// //         headers: {
// //           "Authorization": `Bearer ${token}`,
// //         },


// export async function findSimilarPets(petId, distanceFilter = "no limit", threshold = 0.65) {
//   try {
//     const token = sessionStorage.getItem("auth_token");
//     const response = await fetch(
//       `${API_URL}/api/pets/${petId}/find-similar?threshold=${threshold}&max_distance=${distanceFilter}`,
//       {
//         method: "GET",
//         headers: {
//           "Authorization": `Bearer ${token}`,
//         },
//       }
//     );

//     if (!response.ok) {
//       const errorData = await response.json();
//       throw new Error(errorData.detail || "Failed to find similar pets");
//     }

//     return await response.json();
//   } catch (error) {
//     console.error("Error finding similar pets:", error);
//     throw error;
//   }
// }


// // frontend/utils/api.js
// export async function checkFingerprintExists(petId) {
//   try {
//     const token = sessionStorage.getItem("auth_token");
//     const response = await fetch(
//       `${API_URL}/api/pets/${petId}/check-fingerprint`,
//       {
//         method: "GET",
//         headers: {
//           "Authorization": `Bearer ${token}`,
//         },
//       }
//     );

//     if (!response.ok) {
//       throw new Error("Failed to check fingerprint status");
//     }

//     return await response.json();
//   } catch (error) {
//     console.error("Error checking fingerprint:", error);
//     throw error;
//   }
// }








// export const sendMessage = async (receiverId, text) => {
//   try {
//     const token = sessionStorage.getItem("auth_token");
//     const senderId = sessionStorage.getItem("user_id");
    
//     if (!token || !senderId) {
//       throw new Error("Authentication data missing");
//     }

//     // First get or create conversation
//     const convResponse = await fetch(`${API_URL}/api/messages/start-conversation`, {
//       method: "POST",
//       headers: {
//         "Authorization": `Bearer ${token}`,
//         "Content-Type": "application/json"
//       },
//       body: JSON.stringify({
//         user1_id: senderId,
//         user2_id: receiverId
//       })
//     });

//     if (!convResponse.ok) {
//       const errorData = await convResponse.json();
//       throw new Error(errorData.detail || "Failed to start conversation");
//     }

//     const { conversation_id } = await convResponse.json();

//     // Then send message
//     const response = await fetch(`${API_URL}/api/messages/send`, {
//       method: "POST",
//       headers: {
//         "Authorization": `Bearer ${token}`,
//         "Content-Type": "application/json"
//       },
//       body: JSON.stringify({
//         conversation_id,
//         sender_id: senderId,
//         text: text
//       })
//     });

//     if (!response.ok) {
//       const errorData = await response.json();
//       throw new Error(errorData.detail || "Failed to send message");
//     }

//     return await response.json();
//   } catch (error) {
//     console.error("Error sending message:", error);
//     throw error;
//   }
// };

// export const getConversation = async (receiverId) => {
//   try {
//     const token = sessionStorage.getItem("auth_token");
//     const userId = sessionStorage.getItem("user_id");
    
//     if (!token || !userId) {
//       throw new Error("Authentication data missing");
//     }

//     // First get conversation ID
//     const convResponse = await fetch(`${API_URL}/api/messages/start-conversation`, {
//       method: "POST",
//       headers: {
//         "Authorization": `Bearer ${token}`,
//         "Content-Type": "application/json"
//       },
//       body: JSON.stringify({
//         user1_id: userId,
//         user2_id: receiverId
//       })
//     });

//     if (!convResponse.ok) {
//       const errorData = await convResponse.json();
//       throw new Error(errorData.detail || "Failed to get conversation");
//     }

//     const { conversation_id } = await convResponse.json();

//     // Then get messages
//     const response = await fetch(`${API_URL}/api/messages/conversation/${conversation_id}?user_id=${userId}`, {
//       method: "GET",
//       headers: {
//         "Authorization": `Bearer ${token}`
//       }
//     });

//     if (!response.ok) {
//       const errorData = await response.json();
//       throw new Error(errorData.detail || "Failed to fetch messages");
//     }

//     return await response.json();
//   } catch (error) {
//     console.error("Error fetching conversation:", error);
//     throw error;
//   }
// };

// // Keep these exactly the same - they don't need changes
// export const uploadMessageImage = async (file) => {
//   try {
//     const token = sessionStorage.getItem("auth_token");
//     if (!token) throw new Error("No authentication token found");

//     const formData = new FormData();
//     formData.append("file", file);

//     const response = await fetch(`${API_URL}/api/messages/upload-image`, {
//       method: "POST",
//       headers: {
//         "Authorization": `Bearer ${token}`
//       },
//       body: formData
//     });

//     if (!response.ok) {
//       const errorData = await response.json();
//       throw new Error(errorData.detail || "Failed to upload image");
//     }

//     return await response.json();
//   } catch (error) {
//     console.error("Error uploading image:", error);
//     throw error;
//   }
// };

// export const sendMessageWithImage = async (receiverId, text, imageUrl) => {
//   try {
//     const token = sessionStorage.getItem("auth_token");
//     const userId = sessionStorage.getItem("user_id");
    
//     if (!token || !userId) {
//       throw new Error("Authentication data missing");
//     }

//     // First get or create conversation
//     const convResponse = await fetch(`${API_URL}/api/messages/start-conversation`, {
//       method: "POST",
//       headers: {
//         "Authorization": `Bearer ${token}`,
//         "Content-Type": "application/json"
//       },
//       body: JSON.stringify({
//         user1_id: userId,
//         user2_id: receiverId
//       })
//     });

//     if (!convResponse.ok) {
//       const errorData = await convResponse.json();
//       throw new Error(errorData.detail || "Failed to start conversation");
//     }

//     const { conversation_id } = await convResponse.json();

//     // Then send message with image
//     const response = await fetch(`${API_URL}/api/messages/send-with-image`, {
//       method: "POST",
//       headers: {
//         "Authorization": `Bearer ${token}`,
//         "Content-Type": "application/json"
//       },
//       body: JSON.stringify({
//         conversation_id,
//         sender_id: userId,
//         text: text,
//         image_url: imageUrl
//       })
//     });

//     if (!response.ok) {
//       const errorData = await response.json();
//       throw new Error(errorData.detail || "Failed to send message");
//     }

//     return await response.json();
//   } catch (error) {
//     console.error("Error sending message:", error);
//     throw error;
//   }
// };


// // export const getUserConversations = async () => {
// //   try {
// //     const token = sessionStorage.getItem('auth_token');
// //     const userId = sessionStorage.getItem('user_id');
    
// //     if (!token || !userId) {
// //       throw new Error('Authentication required');
// //     }

// //     const response = await fetch(
// //       `${API_URL}/api/messages/conversations?current_user_id=${userId}`, 
// //       {
// //         headers: {
// //           'Authorization': `Bearer ${token}`
// //         }
// //       }
// //     );

// //     if (!response.ok) {
// //       const error = await response.json();
// //       throw new Error(error.detail || 'Failed to load conversations');
// //     }

// //     return await response.json();
// //   } catch (err) {
// //     console.error('Conversation load error:', err);
// //     throw err;
// //   }
// // };

// export const getUserConversations = async (otherUserId = null) => {
//   try {
//     const token = sessionStorage.getItem('auth_token');
//     const userId = sessionStorage.getItem('user_id');
    
//     if (!token || !userId) {
//       throw new Error('Authentication required');
//     }

//     // Build URL with optional other_user_id parameter
//     let url = `${API_URL}/api/messages/conversations?current_user_id=${userId}`;
//     if (otherUserId !== null) {
//       url += `&other_user_id=${otherUserId}`;
//     }

//     const response = await fetch(url, {
//       headers: {
//         'Authorization': `Bearer ${token}`
//       }
//     });

//     if (!response.ok) {
//       const error = await response.json();
//       throw new Error(error.detail || 'Failed to load conversations');
//     }

//     return await response.json();
//   } catch (err) {
//     console.error('Conversation load error:', err);
//     throw err;
//   }
// };


// // export const getConversations = async (userId) => {
// //   try {
// //     const token = sessionStorage.getItem("auth_token");
// //     if (!token) {
// //       throw new Error("No authentication token found");
// //     }
// //     if (!userId) {
// //       throw new Error("User ID is required");
// //     }

// //     const response = await fetch(`${API_URL}/api/messages/conversations/${userId}`, {
// //       method: "GET",
// //       headers: {
// //         "Authorization": `Bearer ${token}`,
// //         "Content-Type": "application/json"
// //       }
// //     });

// //     if (!response.ok) {
// //       let errorData;
// //       try {
// //         errorData = await response.json();
// //       } catch (e) {
// //         throw new Error(`HTTP error! status: ${response.status}`);
// //       }
      
// //       // Handle different error response formats
// //       const errorMessage = errorData.detail?.error || 
// //                          errorData.detail?.message ||
// //                          errorData.detail ||
// //                          errorData.message ||
// //                          "Failed to fetch conversations";
      
// //       throw new Error(errorMessage);
// //     }

// //     return await response.json();
// //   } catch (error) {
// //     console.error("API Error:", error);
// //     throw new Error(error.message || "Network request failed");
// //   }
// // };



// export const fetchRehomePets = async (filters = {}) => {
//   try {
//     const token = sessionStorage.getItem("auth_token");
//     const currentUserId = parseInt(sessionStorage.getItem("user_id")) || null;

//     // Sanitize filters: remove default "all" or empty values
//     const params = new URLSearchParams();
    
//     // Add current user ID to exclude their own pets
//     if (currentUserId) {
//       params.append('user_id', currentUserId);
//     }
    
//     // Add other filters
//     Object.entries(filters).forEach(([key, value]) => {
//       if (value && value !== "all") {
//         params.append(key, value);
//       }
//     });

//     const response = await fetch(`${API_URL}/api/pets/rehome/?${params.toString()}`, {
//       method: "GET",
//       headers: {
//         "Authorization": `Bearer ${token}`,
//         "Content-Type": "application/json"
//       }
//     });

//     return handleResponse(response);
//   } catch (error) {
//     console.error("Error fetching rehome pets:", error);
//     throw error;
//   }
// };


// export const submitAdoptionApplication = async (formData) => {
//   try {
//     const token = sessionStorage.getItem("auth_token");
//     if (!token) {
//       throw new Error('Authentication required');
//     }

//     const response = await fetch(`${API_URL}/api/pets/adoption-application`, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         "Authorization": `Bearer ${token}`
//       },
//       body: JSON.stringify({
//         ...formData,
//         user_id: Number(formData.user_id) // Ensure it's a number
//       })
//     });
    
//     if (!response.ok) {
//       const errorData = await response.json();
//       const errorMessage = errorData.detail || 
//                          errorData.message || 
//                          'Failed to submit application';
//       throw new Error(errorMessage);
//     }
    
//     return await response.json();
//   } catch (error) {
//     console.error("Application error:", error);
//     throw new Error(error.message || "Failed to submit application");
//   }
// };

// export const getUserApplications = async () => {
//   try {
//     const token = sessionStorage.getItem("auth_token");
//     const response = await fetch(`${API_URL}/api/pets/my-adoption-applications`, {
//       method: "GET",
//       headers: {
//         "Authorization": `Bearer ${token}`
//       }
//     });
    
//     if (!response.ok) {
//       throw new Error('Failed to fetch applications');
//     }
    
//     return await response.json();
//   } catch (error) {
//     console.error("Fetch error:", error);
//     throw error;
//   }
// };




// // frontend/utils/api.js
// export const checkAdoptionStatus = async (petId, userId) => {
//   try {
//     const response = await fetch(`${API_URL}/api/pets/pet/${petId}/adoption-status?user_id=${userId}`);
//     if (!response.ok) {
//       throw new Error('Failed to check adoption status');
//     }
//     return await response.json();
//   } catch (error) {
//     console.error("Check status error:", error);
//     throw error;
//   }
// };

// // frontend/utils/api.js
// export const adoptPet = async (petId, userId) => {
//   try {
//     const token = sessionStorage.getItem("auth_token");
//     if (!token) {
//       throw new Error('Authentication required');
//     }

//     const response = await fetch(`${API_URL}/api/pets/pet/${petId}/adopt?user_id=${userId}`, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         "Authorization": `Bearer ${token}`
//       },
//       body: JSON.stringify({ user_id: userId })
//     });

//     const data = await response.json();
    
//     if (!response.ok) {
//       let errorMsg = 'Failed to submit adoption';
//       if (typeof data.message === 'string') {
//         errorMsg = data.message;
//       } else if (typeof data.detail === 'string') {
//         errorMsg = data.detail;
//       } else if (typeof data.detail === 'object') {
//         errorMsg = JSON.stringify(data.detail);
//       }
//       throw new Error(errorMsg);
//     }
    
    
//     return data;
//   } catch (error) {
//     console.error("Adoption error:", error);
//     throw new Error(
//       typeof error.message === 'string' ? error.message : JSON.stringify(error.message)
//     );
//   }
  
// };




// export const getUserAdoptions = async (userId, role, status = null) => {
//   try {
//     const token = sessionStorage.getItem("auth_token");
//     const params = new URLSearchParams({ user_id: userId, role });
    
//     if (status) {
//       params.append('status', status);
//     }

//     const response = await fetch(`${API_URL}/api/pets/adoptions/?${params.toString()}`, {
//       method: "GET",
//       headers: {
//         "Authorization": `Bearer ${token}`,
//         "Content-Type": "application/json"
//       }
//     });

//     return handleResponse(response);
//   } catch (error) {
//     console.error("Error fetching adoptions:", error);
//     throw error;
//   }
// };

// export const updateAdoptionStatus = async (adoptionId, status) => {
//   try {
//     const token = sessionStorage.getItem("auth_token");
//     const response = await fetch(`${API_URL}/api/pets/adoptions/${adoptionId}/status`, {
//       method: "PATCH",
//       headers: {
//         "Content-Type": "application/json",
//         "Authorization": `Bearer ${token}`
//       },
//       body: JSON.stringify({ status })
//     });
    
//     return handleResponse(response);
//   } catch (error) {
//     console.error("Error updating adoption status:", error);
//     throw error;
//   }
// };

// export const getAdminStats = async (timeRange = 'all') => {
//   try {
//     const token = sessionStorage.getItem("auth_token");
//     const response = await fetch(`${API_URL}/admin/stats?time_range=${timeRange}`, {
//       method: "GET",
//       headers: {
//         "Authorization": `Bearer ${token}`,
//         "Content-Type": "application/json"
//       }
//     });
//     return handleResponse(response);
//   } catch (error) {
//     console.error("Error fetching admin stats:", error);
//     throw error;
//   }
// };





// export const getAdminDashboardStats = async (timeRange = 'all') => {
//   try {
//     const token = sessionStorage.getItem("auth_token");
//     const response = await fetch(`${API_URL}/admin/dashboard-stats?time_range=${timeRange}`, {
//       method: "GET",
//       headers: {
//         "Authorization": `Bearer ${token}`,
//         "Content-Type": "application/json"
//       }
//     });
//     return handleResponse(response);
//   } catch (error) {
//     console.error("Error fetching admin stats:", error);
//     throw error;
//   }
// };

// export const getAdminRecentActivity = async () => {
//   try {
//     const token = sessionStorage.getItem("auth_token");
//     const response = await fetch(`${API_URL}/admin/recent-activity`, {
//       method: "GET",
//       headers: {
//         "Authorization": `Bearer ${token}`,
//         "Content-Type": "application/json"
//       }
//     });
//     return handleResponse(response);
//   } catch (error) {
//     console.error("Error fetching recent activity:", error);
//     throw error;
//   }
// };

// export const getPetsForManagement = async (status = "pending", page = 1, limit = 10) => {
//   try {
//     const token = sessionStorage.getItem("auth_token");
//     const response = await fetch(
//       `${API_URL}/admin/pet-management?status=${status}&page=${page}&limit=${limit}`,
//       {
//         method: "GET",
//         headers: {
//           "Authorization": `Bearer ${token}`,
//           "Content-Type": "application/json"
//         }
//       }
//     );
//     return handleResponse(response);
//   } catch (error) {
//     console.error("Error fetching pets for management:", error);
//     throw error;
//   }
// };

// export const managePet = async (petId, action) => {
//   try {
//     const token = sessionStorage.getItem("auth_token");
//     const response = await fetch(
//       `${API_URL}/admin/pet-management/${petId}?action=${action}`,
//       {
//         method: "PATCH",
//         headers: {
//           "Authorization": `Bearer ${token}`,
//           "Content-Type": "application/json"
//         }
//       }
//     );
//     return handleResponse(response);
//   } catch (error) {
//     console.error("Error managing pet:", error);
//     throw error;
//   }
// };


// export const getAdoptionForms = async (status = null, page = 1, limit = 10, search = '') => {
//   try {
//     const token = sessionStorage.getItem("auth_token");
//     const url = `${API_URL}/admin/adoption-forms?page=${page}&limit=${limit}${
//       status ? `&status=${status}` : ''
//     }${search ? `&search=${encodeURIComponent(search)}` : ''}`;
    
//     const response = await fetch(url, {
//       method: "GET",
//       headers: {
//         "Authorization": `Bearer ${token}`,
//         "Content-Type": "application/json"
//       }
//     });
//     return handleResponse(response);
//   } catch (error) {
//     console.error("Error fetching adoption forms:", error);
//     throw error;
//   }
// };

// export const getAdminUsers = async (page = 1, limit = 10, search = '') => {
//   try {
//     const token = sessionStorage.getItem("auth_token");
//     const url = `${API_URL}/admin/users?page=${page}&limit=${limit}${
//       search ? `&search=${encodeURIComponent(search)}` : ''
//     }`;
//     const response = await fetch(url, {
//       method: "GET",
//       headers: {
//         "Authorization": `Bearer ${token}`,
//         "Content-Type": "application/json"
//       }
//     });
//     return handleResponse(response);
//   } catch (error) {
//     console.error("Error fetching users:", error);
//     throw error;
//   }
// };

// export const updateUserStatus = async (userId, action) => {
//   try {
//     const token = sessionStorage.getItem("auth_token");
//     const response = await fetch(`${API_URL}/admin/users/${userId}/status`, {
//       method: "PATCH",
//       headers: {
//         "Authorization": `Bearer ${token}`,
//         "Content-Type": "application/json"
//       },
//       body: JSON.stringify({ action })
//     });
//     return handleResponse(response);
//   } catch (error) {
//     console.error("Error updating user status:", error);
//     throw error;
//   }
// };

// export const getPetHealthRecords = async (page = 1, limit = 10, search = '') => {
//   try {
//     const token = sessionStorage.getItem("auth_token");
//     const url = `${API_URL}/admin/pet-health?page=${page}&limit=${limit}${
//       search ? `&search=${encodeURIComponent(search)}` : ''
//     }`;
//     const response = await fetch(url, {
//       method: "GET",
//       headers: {
//         "Authorization": `Bearer ${token}`,
//         "Content-Type": "application/json"
//       }
//     });
//     return handleResponse(response);
//   } catch (error) {
//     console.error("Error fetching pet health records:", error);
//     throw error;
//   }
// };


// export const createAdminAnnouncement = async (title, message) => {
//   try {
//     const token = sessionStorage.getItem("auth_token");
//     const response = await fetch(`${API_URL}/admin/announcements`, {
//       method: "POST",
//       headers: {
//         "Authorization": `Bearer ${token}`,
//         "Content-Type": "application/json"
//       },
//       body: JSON.stringify({
//         title: title,
//         message: message,
//         send_as_notification: true  // Kept this as true since you always want notifications
//       })
//     });
//     return handleResponse(response);
//   } catch (error) {
//     console.error("Error creating announcement:", error);
//     throw error;
//   }
// };

// // utils/api.js
// export const getUniqueAnnouncements = async (days = 7, limit = 20) => {
//   try {
//     const token = sessionStorage.getItem("auth_token");
//     const response = await fetch(
//       `${API_URL}/admin/announcements/unique?days=${days}&limit=${limit}`,
//       {
//         method: "GET",
//         headers: {
//           "Authorization": `Bearer ${token}`,
//           "Content-Type": "application/json"
//         }
//       }
//     );
//     return await handleResponse(response);
//   } catch (error) {
//     console.error("Error fetching unique announcements:", error);
//     throw error;
//   }
// };

// export const getLoginLogs = async (page = 1, limit = 10, filters = {}) => {
//   try {
//     const token = sessionStorage.getItem("auth_token");
//     const params = new URLSearchParams({
//       page,
//       limit,
//       ...filters
//     });
    
//     const response = await fetch(`${API_URL}/admin/security/logs?${params}`, {
//       method: "GET",
//       headers: {
//         "Authorization": `Bearer ${token}`,
//         "Content-Type": "application/json"
//       }
//     });
//     return handleResponse(response);
//   } catch (error) {
//     console.error("Error fetching login logs:", error);
//     throw error;
//   }
// };





























// // frontend/utils/api.js
// export async function requestPasswordReset(email) {
//   const response = await fetch(`${API_URL}/forgot-password`, {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify({ email })
//   });
//   return handleResponse(response);
// }

// export async function submitPasswordReset(token, newPassword) {
//   const response = await fetch(`${API_URL}/reset-password`, {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify({ token, new_password: newPassword })
//   });
//   return handleResponse(response);
// }


// export async function clearAdditionalImages(petId) {
//   try {
//     const token = sessionStorage.getItem('auth_token');
//     const response = await fetch(`${API_URL}/api/pets/${petId}/clear-additional-images`, {
//       method: 'DELETE',
//       headers: {
//         'Authorization': `Bearer ${token}`,
//       },
//     });

//     if (!response.ok) {
//       const errorData = await response.json();
//       throw new Error(errorData.detail || 'Failed to clear additional images');
//     }

//     return await response.json();
//   } catch (error) {
//     console.error('Error clearing additional images:', error);
//     throw error;
//   }
// }



//frontend\utils\api.js
// frontend/utils/api.js

// Add this import at the top of the file
import { decryptData } from './auth';
// Configure API URL based on environment
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

// Helper function for consistent error handling
const handleResponse = async (response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMessage = 
      errorData.detail?.map?.(error => error.msg).join(", ") ||
      errorData.detail ||
      errorData.message ||
      "Request failed";
    throw new Error(errorMessage);
  }
  return response.json();
};

export async function registerUser(userData) {
  const response = await fetch(`${API_URL}/api/register`, {
      method: "POST",
      headers: {
          "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
  });

  return response.json();
}

export async function loginUser(userData) {
  const response = await fetch(`${API_URL}/api/login`, {
      method: "POST",
      headers: {
          "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
  });

  return response.json();
}


export async function sendPasswordResetEmail(email) {
  try {
    const response = await fetch(`${API_URL}/api/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    return handleResponse(response);
  } catch (error) {
    console.error("Error sending password reset email:", error);
    throw error;
  }
}

// export async function sendPasswordResetEmail(email) {
//   const response = await fetch(`${API_URL}/api/user/request-password-reset`, {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify({ email })
//   });
  
//   if (!response.ok) {
//     const error = await response.json();
//     throw new Error(error.detail || "Failed to send reset email");
//   }
//   return response.json();

// }



export async function submitPasswordReset(token, newPassword) {
  const response = await fetch(`${API_URL}/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, new_password: newPassword })
  });
  return handleResponse(response);
}



export async function resetPassword({ token, password }) {
  try {
    const response = await fetch(
      `${API_URL}/api/reset-password?token=${encodeURIComponent(token)}&new_password=${encodeURIComponent(password)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      }
    );
    return handleResponse(response);
  } catch (error) {
    console.error("Error resetting password:", error);
    throw error;
  }
}


export async function createPet(petData) {
  try {
    const response = await fetch(`${API_URL}/api/pets/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(petData),
    });
    return handleResponse(response);
  } catch (error) {
    console.error("Error creating pet:", error);
    throw error;
  }
}
















































export async function addDevice(unique_code) {
  try {
    const response = await fetch(`${API_URL}/api/pets/register-device`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        unique_code: unique_code
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      // Handle both error formats (detail object or message string)
      const errorMessage = errorData.detail?.message || errorData.detail || 'Registration failed';
      throw new Error(errorMessage);
    }

    const responseData = await response.json();
    
    // Return the full response data including status
    return {
      success: true,
      message: responseData.message,
      deviceData: responseData.data // Contains device_id, unique_code, and status
    };

  } catch (error) {
    console.error('Device registration error:', error);
    // Return error information in consistent format
    throw new Error(error.message || 'Failed to register device');
  }
}

export async function updateDeviceStatus(device_id, status) {
  try {
    const response = await fetch(`${API_URL}/api/pets/update-device-status/${device_id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        status: status
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail?.message || 'Status update failed');
    }

    return await response.json();
  } catch (error) {
    console.error('Device status update error:', error);
    throw error;
  }
}

export async function getDevices(params = {}) {
  try {
    const queryParams = new URLSearchParams();
    if (params.status) queryParams.append('status', params.status);
    if (params.skip) queryParams.append('skip', params.skip);
    if (params.limit) queryParams.append('limit', params.limit);

    const response = await fetch(`${API_URL}/api/pets/devices?${queryParams.toString()}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail?.message || 'Failed to fetch devices');
    }

    const data = await response.json();
    return data.data || []; // Return the array of devices
  } catch (error) {
    console.error('Fetch devices error:', error);
    throw error;
  }
}

export async function updateDeviceActiveStatus(device_id, is_active) {
  try {
    const response = await fetch(`${API_URL}/api/pets/update-device-active/${device_id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        is_active: is_active
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail?.message || 'Active status update failed');
    }

    return await response.json();
  } catch (error) {
    console.error('Device active status update error:', error);
    throw error;
  }
}

export async function getDeviceLocations(device_id) {
  try {
    const response = await fetch(`${API_URL}/api/pets/device-locations/${device_id}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail?.message || 'Failed to fetch locations');
    }

    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Fetch locations error:', error);
    throw error;
  }
}



export async function pairDeviceWithPet(unique_code, pet_id, user_id) {
  try {
    const response = await fetch(`${API_URL}/api/pets/pair-device`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        unique_code: unique_code,
        pet_id: pet_id,
        user_id: user_id,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      const errorMessage = errorData.detail?.message || errorData.detail || "Pairing failed"
      throw new Error(errorMessage)
    }

    const responseData = await response.json()

    return {
      success: true,
      message: responseData.message,
      deviceData: responseData.data,
    }
  } catch (error) {
    console.error("Device pairing error:", error)
    throw new Error(error.message || "Failed to pair device")
  }
}

export async function updatePairDeviceWithPet(unique_code, pet_id, user_id) {
  try {
    const response = await fetch(`${API_URL}/api/pets/update-pair-device`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        unique_code: unique_code,
        pet_id: pet_id,
        user_id: user_id,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      const errorMessage = errorData.detail?.message || errorData.detail || "Update pairing failed"
      throw new Error(errorMessage)
    }

    const responseData = await response.json()

    return {
      success: true,
      message: responseData.message,
      deviceData: responseData.data,
    }
  } catch (error) {
    console.error("Device update pairing error:", error)
    throw new Error(error.message || "Failed to update device pairing")
  }
}

// export async function getPetDeviceInfo(pet_id) {
//   try {
//     const response = await fetch(`${API_URL}/api/pets/${pet_id}/device-info`, {
//       method: "GET",
//       headers: {
//         Accept: "application/json",
//       },
//     })

//     if (!response.ok) {
//       const errorData = await response.json()
//       throw new Error(errorData.detail?.message || "Failed to fetch device info")
//     }

//     const data = await response.json()
//     return data.data || null
//   } catch (error) {
//     console.error("Fetch device info error:", error)
//     throw error
//   }
// }

export async function getPetDeviceInfo(pet_id) {
  try {
    const token = localStorage.getItem('token')
    
    const response = await fetch(`${API_URL}/api/pets/${pet_id}/device-info`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.detail?.message || "Failed to fetch device info")
    }

    const data = await response.json()
    return data.data || null
  } catch (error) {
    console.error("Fetch device info error:", error)
    throw error
  }
}

export async function getPetCurrentLocation(pet_id) {
  try {
    const response = await fetch(`${API_URL}/api/pets/${pet_id}/current-location`, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.detail?.message || "Failed to fetch current location")
    }

    const data = await response.json()
    return data.data || null
  } catch (error) {
    console.error("Fetch current location error:", error)
    throw error
  }
}

export async function toggleDeviceActivation(pet_id, is_active) {
  try {
    const response = await fetch(`${API_URL}/api/pets/${pet_id}/device-activation`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        is_active: is_active,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      const errorMessage = errorData.detail?.message || errorData.detail || "Device activation failed"
      throw new Error(errorMessage)
    }

    const responseData = await response.json()

    return {
      success: true,
      message: responseData.message,
      data: responseData.data,
    }
  } catch (error) {
    console.error("Device activation error:", error)
    throw new Error(error.message || "Failed to toggle device activation")
  }
}






































export async function uploadPetImage(file) {
  const formData = new FormData();
  formData.append('file', file);
  
  try {
      const response = await fetch(`${API_URL}/api/pets/upload-image`, {
          method: "POST",
          body: formData,
      });
      return await response.json();
  } catch (error) {
      return Promise.reject(error);
  }
}

export async function verifyPetImage(file) {
  const formData = new FormData();
  formData.append('file', file);
  
  try {
      const response = await fetch(`${API_URL}/api/pets/verify-pet-image`, {
          method: "POST",
          body: formData,
      });
      
      // Always parse the response as JSON
      const data = await response.json();
      
      // The backend now always returns 200, so we just return the data
      return data;
      
  } catch (error) {
      // Network errors or failed JSON parsing
      console.error("Verification request failed:", error);
      return {
          is_valid: false,
          message: "Could not connect to verification service",
          error: true
      };
  }
}


export const fetchPetDashboard = async (token) => {
  try {
    const userId = sessionStorage.getItem("user_id");
    if (!userId) throw new Error("User ID not available");
    
    const response = await fetch(
      `${API_URL}/api/pets/dashboard?user_id=${userId}`,
      {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` },
      }
    );
    return handleResponse(response);
  } catch (error) {
    console.error("Error fetching pet dashboard:", error);
    throw error;
  }
};



export const getImageUrl = (imagePath) => {
  if (!imagePath) return "/placeholder.jpg";
  
  // Handle full URLs (if stored in DB)
  if (imagePath.startsWith('http')) return imagePath;
  
  // Handle cases where imagePath is in the new format (pet_id/filename)
  if (imagePath.includes('/')) {
    const [petId, filename] = imagePath.split('/');
    // For both development and production
    return `/uploads/pet_images/${petId}/${filename}`;
  }

  // Handle old format (timestamp filenames) - backward compatibility
  if (API_URL.includes('localhost') || API_URL.includes('127.0.0.1')) {
    return `${API_URL}/uploads/pet_images/${imagePath}`;
  }
  
  // Production - old format
  return `/uploads/pet_images/${imagePath}`;
};

// Add admin approval status to fetchPetDetails response handling
export async function fetchPetDetails(id) {
  try {
    const token = sessionStorage.getItem('auth_token');
    const response = await fetch(`${API_URL}/api/pets/${id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to fetch pet details');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching pet details:', error);
    throw error;
  }
}



// Update in frontend/utils/api.js
export async function deletePet(petId, token) {
  try {
    const userId = sessionStorage.getItem("user_id");
    if (!userId) throw new Error("User ID not available");
    
    const response = await fetch(`${API_URL}/api/pets/${petId}?user_id=${userId}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });
    return handleResponse(response);
  } catch (error) {
    console.error("Error deleting pet:", error);
    throw error;
  }
}
export async function updatePetStatus(petId, status) {
  const response = await fetch(`${API_URL}/api/pets/${petId}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ status }),
  });
  return handleResponse(response);
}

export async function togglePublishPet(petId, publishStatus) {
  try {
    const token = sessionStorage.getItem("auth_token");
    const response = await fetch(`${API_URL}/api/pets/${petId}/publish`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({
        publish: publishStatus
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Failed to update publish status");
    }

    return await response.json();
  } catch (error) {
    console.error("Error toggling publish status:", error);
    throw error;
  }
}

// Add this function (similar to togglePublishPet but more specific)
export async function unpublishPet(petId) {
  try {
    const token = sessionStorage.getItem("auth_token");
    const response = await fetch(`${API_URL}/api/pets/${petId}/publish`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({
        publish: false // Explicitly set to false
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Failed to unpublish pet");
    }

    return await response.json();
  } catch (error) {
    console.error("Error unpublishing pet:", error);
    throw error;
  }
}


// Update pet details
export const updatePetDetails = async (petId, petData) => {
  try {
    const token = sessionStorage.getItem("auth_token");
    const response = await fetch(`${API_URL}/api/pets/${petId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(petData)
    });
    return handleResponse(response);
  } catch (error) {
    console.error("Error updating pet:", error);
    throw error;
  }
};






// utils/api.js
export async function getAddress(token, user_id) {
  try {
    const response = await fetch(`${API_URL}/api/user/${user_id}/address`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (response.status === 404) {
      return null; // No address exists
    }
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to fetch address');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching address:', error);
    throw error;
  }
}

export async function updateAddress(token, user_id, addressData) {
  try {
    const response = await fetch(`${API_URL}/api/user/${user_id}/address`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(addressData),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to update address');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error updating address:', error);
    throw error;
  }
}



// Add to your existing api.js
export async function getUserProfile(token, user_id) {
  try {
    const response = await fetch(`${API_URL}/api/user/${user_id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to fetch user profile');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
}

export async function uploadProfilePicture(token, file) {
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch(`${API_URL}/api/user/upload-picture`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to upload profile picture');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error uploading profile picture:', error);
    throw error;
  }
}

export async function updateUserProfile(token, user_id, updateData) {
  try {
    const response = await fetch(`${API_URL}/api/user/${user_id}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to update profile');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
}

// Notification API functions
export async function getNotificationSettings(token, user_id) {
  try {
    const response = await fetch(`${API_URL}/api/user/${user_id}/notifications`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to fetch notification settings');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching notification settings:', error);
    throw error;
  }
}

export async function updateNotificationSettings(token, user_id, settings) {
  try {
    const response = await fetch(`${API_URL}/api/user/${user_id}/notifications`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(settings),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to update notification settings');
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating notification settings:', error);
    throw error;
  }
}



// utils/api.js
export async function getUserPrivacySettings(token, user_id) {
  const response = await fetch(`${API_URL}/api/user/${user_id}/privacy-settings`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return handleResponse(response);
}

export async function changeUserPassword(token, user_id, password_data) {
  const response = await fetch(`${API_URL}/api/user/${user_id}/change-password`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(password_data)
  });
  return handleResponse(response);
}



// frontend/utils/api.js
export async function deleteUserAccount(token, user_id) {
  try {
    const response = await fetch(`${API_URL}/api/user/${user_id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to delete account');
    }

    return await response.json();
  } catch (error) {
    console.error('Error deleting account:', error);
    throw error;
  }
}

// Add to your existing api.js
export async function getUnreadNotificationCount(token, user_id) {
  const response = await fetch(`${API_URL}/api/notifications/unread-count/${user_id}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return handleResponse(response);
}

export async function getUserNotifications(token, user_id) {
  const response = await fetch(`${API_URL}/api/notifications/user/${user_id}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return handleResponse(response);
}

// frontend/utils/api.js

export async function checkNotificationSettings(token, user_id) {
  const response = await fetch(`${API_URL}/api/notifications/check-settings/${user_id}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return handleResponse(response);
}


export async function markNotificationAsRead(token, notificationId) {
  const response = await fetch(`${API_URL}/api/notifications/${notificationId}/read`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  return handleResponse(response);
}

export async function markAllNotificationsAsRead(token, userId) {
  const response = await fetch(`${API_URL}/api/notifications/mark-all-read/${userId}`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Failed to mark all as read');
  }
  
  return response.json();
}





export async function updatePetImage(petId, file) {
  const formData = new FormData();
  formData.append('file', file);
  
  try {
    const token = sessionStorage.getItem('auth_token');
    const response = await fetch(`${API_URL}/api/pets/${petId}/update-image`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    console.log('Image update response:', response);  // Debug log

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Image update error:', errorData);  // Debug log
      throw new Error(errorData.detail || 'Failed to update pet image');
    }

    const result = await response.json();
    console.log('Image update result:', result);  // Debug log
    return result;
  } catch (error) {
    console.error('Error updating pet image:', error);  // Debug log
    throw error;
  }
}

export async function addAdditionalImage(petId, file, imageType) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('image_type', imageType);
  
  try {
    const token = sessionStorage.getItem('auth_token');
    const response = await fetch(`${API_URL}/api/pets/${petId}/add-additional-image`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      // Return the error message in a consistent format
      throw new Error(
        errorData.detail || 
        errorData.message || 
        'Failed to add additional image'
      );
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error adding additional image:', error);
    throw error;
  }
}


export async function removeAdditionalImage(petId, index) {
  try {
    const token = sessionStorage.getItem('auth_token');
    const response = await fetch(`${API_URL}/api/pets/${petId}/remove-additional-image?index=${index}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Error removing additional image:', error);
    throw error;
  }
}


// frontend/utils/api.js

// Add these functions to your existing api.js

// export async function generatePetFingerprint(petId) {
//   try {
//     const token = sessionStorage.getItem("auth_token");
//     const response = await fetch(`${API_URL}/api/pets/${petId}/generate-fingerprint`, {
//       method: "POST",
//       headers: {
//         "Authorization": `Bearer ${token}`,
//       },
//     });

//     if (!response.ok) {
//       const errorData = await response.json();
//       throw new Error(errorData.detail || "Failed to generate fingerprint");
//     }

//     return await response.json();
//   } catch (error) {
//     console.error("Error generating fingerprint:", error);
//     throw error;
//   }
// }

export const generateFingerprint = async (petId, status) => {
  try {
    const token = localStorage.getItem("token") // or however you store your auth token

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/pets/${petId}/generate-fingerprint`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: status,
        }),
      },
    )

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.detail || "Failed to generate fingerprint")
    }

    return await response.json()
  } catch (error) {
    console.error("Generate fingerprint error:", error)
    throw error
  }
}


export const getPetFlyerData = async (petId) => {
  try {
    const token = sessionStorage.getItem('auth_token');  // Add auth if needed
    const response = await fetch(`${API_URL}/api/pets/${petId}/flyer-data`, {
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to fetch pet flyer data');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching pet flyer data:', error);
    throw error;
  }
};

export const generateFlyerImage = async (htmlElement) => {
  const html2canvas = (await import('html2canvas')).default;
  return await html2canvas(htmlElement, {
    scale: 2,
    logging: false,
    useCORS: true
  });
};


// // frontend/utils/api.js
// export async function findSimilarPets(petId, threshold = 0.65, limit = 10) {
//   try {
//     const token = sessionStorage.getItem("auth_token");
//     const response = await fetch(
//       `${API_URL}/api/pets/${petId}/find-similar?threshold=${threshold}&limit=${limit}`,
//       {
//         method: "GET",
//         headers: {
//           "Authorization": `Bearer ${token}`,
//         },
// export async function findSimilarPets(petId, distanceFilter = "no limit", threshold = 0.65, limit = 10) {
//   try {
//     const token = sessionStorage.getItem("auth_token");
//     const response = await fetch(
//       `${API_URL}/api/pets/${petId}/find-similar?threshold=${threshold}&limit=${limit}&max_distance=${distanceFilter}`,
//       {
//         method: "GET",
//         headers: {
//           "Authorization": `Bearer ${token}`,
//         },


export async function findSimilarPets(petId, distanceFilter = "no limit", threshold = 0.65) {
  try {
    const token = sessionStorage.getItem("auth_token");
    const response = await fetch(
      `${API_URL}/api/pets/${petId}/find-similar?threshold=${threshold}&max_distance=${distanceFilter}`,
      {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Failed to find similar pets");
    }

    return await response.json();
  } catch (error) {
    console.error("Error finding similar pets:", error);
    throw error;
  }
}


// frontend/utils/api.js
export async function checkFingerprintExists(petId) {
  try {
    const token = sessionStorage.getItem("auth_token");
    const response = await fetch(
      `${API_URL}/api/pets/${petId}/check-fingerprint`,
      {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to check fingerprint status");
    }

    return await response.json();
  } catch (error) {
    console.error("Error checking fingerprint:", error);
    throw error;
  }
}








export const sendMessage = async (receiverId, text) => {
  try {
    const token = sessionStorage.getItem("auth_token");
    const senderId = sessionStorage.getItem("user_id");
    
    if (!token || !senderId) {
      throw new Error("Authentication data missing");
    }

    // First get or create conversation
    const convResponse = await fetch(`${API_URL}/api/messages/start-conversation`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        user1_id: senderId,
        user2_id: receiverId
      })
    });

    if (!convResponse.ok) {
      const errorData = await convResponse.json();
      throw new Error(errorData.detail || "Failed to start conversation");
    }

    const { conversation_id } = await convResponse.json();

    // Then send message
    const response = await fetch(`${API_URL}/api/messages/send`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        conversation_id,
        sender_id: senderId,
        text: text
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Failed to send message");
    }

    return await response.json();
  } catch (error) {
    console.error("Error sending message:", error);
    throw error;
  }
};

export const getConversation = async (receiverId) => {
  try {
    const token = sessionStorage.getItem("auth_token");
    const userId = sessionStorage.getItem("user_id");
    
    if (!token || !userId) {
      throw new Error("Authentication data missing");
    }

    // First get conversation ID
    const convResponse = await fetch(`${API_URL}/api/messages/start-conversation`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        user1_id: userId,
        user2_id: receiverId
      })
    });

    if (!convResponse.ok) {
      const errorData = await convResponse.json();
      throw new Error(errorData.detail || "Failed to get conversation");
    }

    const { conversation_id } = await convResponse.json();

    // Then get messages
    const response = await fetch(`${API_URL}/api/messages/conversation/${conversation_id}?user_id=${userId}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Failed to fetch messages");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching conversation:", error);
    throw error;
  }
};

// Keep these exactly the same - they don't need changes
export const uploadMessageImage = async (file) => {
  try {
    const token = sessionStorage.getItem("auth_token");
    if (!token) throw new Error("No authentication token found");

    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`${API_URL}/api/messages/upload-image`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`
      },
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Failed to upload image");
    }

    return await response.json();
  } catch (error) {
    console.error("Error uploading image:", error);
    throw error;
  }
};

export const sendMessageWithImage = async (receiverId, text, imageUrl) => {
  try {
    const token = sessionStorage.getItem("auth_token");
    const userId = sessionStorage.getItem("user_id");
    
    if (!token || !userId) {
      throw new Error("Authentication data missing");
    }

    // First get or create conversation
    const convResponse = await fetch(`${API_URL}/api/messages/start-conversation`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        user1_id: userId,
        user2_id: receiverId
      })
    });

    if (!convResponse.ok) {
      const errorData = await convResponse.json();
      throw new Error(errorData.detail || "Failed to start conversation");
    }

    const { conversation_id } = await convResponse.json();

    // Then send message with image
    const response = await fetch(`${API_URL}/api/messages/send-with-image`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        conversation_id,
        sender_id: userId,
        text: text,
        image_url: imageUrl
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Failed to send message");
    }

    return await response.json();
  } catch (error) {
    console.error("Error sending message:", error);
    throw error;
  }
};


// export const getUserConversations = async () => {
//   try {
//     const token = sessionStorage.getItem('auth_token');
//     const userId = sessionStorage.getItem('user_id');
    
//     if (!token || !userId) {
//       throw new Error('Authentication required');
//     }

//     const response = await fetch(
//       `${API_URL}/api/messages/conversations?current_user_id=${userId}`, 
//       {
//         headers: {
//           'Authorization': `Bearer ${token}`
//         }
//       }
//     );

//     if (!response.ok) {
//       const error = await response.json();
//       throw new Error(error.detail || 'Failed to load conversations');
//     }

//     return await response.json();
//   } catch (err) {
//     console.error('Conversation load error:', err);
//     throw err;
//   }
// };

export const getUserConversations = async (otherUserId = null) => {
  try {
    const token = sessionStorage.getItem('auth_token');
    const userId = sessionStorage.getItem('user_id');
    
    if (!token || !userId) {
      throw new Error('Authentication required');
    }

    // Build URL with optional other_user_id parameter
    let url = `${API_URL}/api/messages/conversations?current_user_id=${userId}`;
    if (otherUserId !== null) {
      url += `&other_user_id=${otherUserId}`;
    }

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to load conversations');
    }

    return await response.json();
  } catch (err) {
    console.error('Conversation load error:', err);
    throw err;
  }
};


// export const getConversations = async (userId) => {
//   try {
//     const token = sessionStorage.getItem("auth_token");
//     if (!token) {
//       throw new Error("No authentication token found");
//     }
//     if (!userId) {
//       throw new Error("User ID is required");
//     }

//     const response = await fetch(`${API_URL}/api/messages/conversations/${userId}`, {
//       method: "GET",
//       headers: {
//         "Authorization": `Bearer ${token}`,
//         "Content-Type": "application/json"
//       }
//     });

//     if (!response.ok) {
//       let errorData;
//       try {
//         errorData = await response.json();
//       } catch (e) {
//         throw new Error(`HTTP error! status: ${response.status}`);
//       }
      
//       // Handle different error response formats
//       const errorMessage = errorData.detail?.error || 
//                          errorData.detail?.message ||
//                          errorData.detail ||
//                          errorData.message ||
//                          "Failed to fetch conversations";
      
//       throw new Error(errorMessage);
//     }

//     return await response.json();
//   } catch (error) {
//     console.error("API Error:", error);
//     throw new Error(error.message || "Network request failed");
//   }
// };



export const fetchRehomePets = async (filters = {}) => {
  try {
    const token = sessionStorage.getItem("auth_token");
    const currentUserId = parseInt(sessionStorage.getItem("user_id")) || null;

    // Sanitize filters: remove default "all" or empty values
    const params = new URLSearchParams();
    
    // Add current user ID to exclude their own pets
    if (currentUserId) {
      params.append('user_id', currentUserId);
    }
    
    // Add other filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== "all") {
        params.append(key, value);
      }
    });

    const response = await fetch(`${API_URL}/api/pets/rehome/?${params.toString()}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });

    return handleResponse(response);
  } catch (error) {
    console.error("Error fetching rehome pets:", error);
    throw error;
  }
};


export const submitAdoptionApplication = async (formData) => {
  try {
    const token = sessionStorage.getItem("auth_token");
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_URL}/api/pets/adoption-application`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
        ...formData,
        user_id: Number(formData.user_id) // Ensure it's a number
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      const errorMessage = errorData.detail || 
                         errorData.message || 
                         'Failed to submit application';
      throw new Error(errorMessage);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Application error:", error);
    throw new Error(error.message || "Failed to submit application");
  }
};

export const getUserApplications = async () => {
  try {
    const token = sessionStorage.getItem("auth_token");
    const response = await fetch(`${API_URL}/api/pets/my-adoption-applications`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch applications');
    }
    
    return await response.json();
  } catch (error) {
    console.error("Fetch error:", error);
    throw error;
  }
};




// frontend/utils/api.js
export const checkAdoptionStatus = async (petId, userId) => {
  try {
    const response = await fetch(`${API_URL}/api/pets/pet/${petId}/adoption-status?user_id=${userId}`);
    if (!response.ok) {
      throw new Error('Failed to check adoption status');
    }
    return await response.json();
  } catch (error) {
    console.error("Check status error:", error);
    throw error;
  }
};

// frontend/utils/api.js
export const adoptPet = async (petId, userId) => {
  try {
    const token = sessionStorage.getItem("auth_token");
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_URL}/api/pets/pet/${petId}/adopt?user_id=${userId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ user_id: userId })
    });

    const data = await response.json();
    
    if (!response.ok) {
      let errorMsg = 'Failed to submit adoption';
      if (typeof data.message === 'string') {
        errorMsg = data.message;
      } else if (typeof data.detail === 'string') {
        errorMsg = data.detail;
      } else if (typeof data.detail === 'object') {
        errorMsg = JSON.stringify(data.detail);
      }
      throw new Error(errorMsg);
    }
    
    
    return data;
  } catch (error) {
    console.error("Adoption error:", error);
    throw new Error(
      typeof error.message === 'string' ? error.message : JSON.stringify(error.message)
    );
  }
  
};




export const getUserAdoptions = async (userId, role, status = null) => {
  try {
    const token = sessionStorage.getItem("auth_token");
    const params = new URLSearchParams({ user_id: userId, role });
    
    if (status) {
      params.append('status', status);
    }

    const response = await fetch(`${API_URL}/api/pets/adoptions/?${params.toString()}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });

    return handleResponse(response);
  } catch (error) {
    console.error("Error fetching adoptions:", error);
    throw error;
  }
};

export const updateAdoptionStatus = async (adoptionId, status) => {
  try {
    const token = sessionStorage.getItem("auth_token");
    const response = await fetch(`${API_URL}/api/pets/adoptions/${adoptionId}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ status })
    });
    
    return handleResponse(response);
  } catch (error) {
    console.error("Error updating adoption status:", error);
    throw error;
  }
};

export const getAdminStats = async (timeRange = 'all') => {
  try {
    const token = sessionStorage.getItem("auth_token");
    const response = await fetch(`${API_URL}/admin/stats?time_range=${timeRange}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });
    return handleResponse(response);
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    throw error;
  }
};

export const getPetSimilarityTrends = async (days = 30) => {
  try {
    const token = sessionStorage.getItem("auth_token")
    const response = await fetch(`${API_URL}/admin/pet-similarity-trends?days=${days}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
    return handleResponse(response)
  } catch (error) {
    console.error("Error fetching pet similarity trends:", error)
    throw error
  }
}

export const testAdminConnection = async () => {
  try {
    const token = sessionStorage.getItem("auth_token")
    const response = await fetch(`${API_URL}/admin/test`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
    return handleResponse(response)
  } catch (error) {
    console.error("Error testing admin connection:", error)
    throw error
  }
}

export const getStorageDetails = async () => {
  try {
    const token = sessionStorage.getItem("auth_token")
    const response = await fetch(`${API_URL}/admin/storage-details`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
    return handleResponse(response)
  } catch (error) {
    console.error("Error fetching storage details:", error)
    throw error
  }
}


// export const getAdminDashboardStats = async (timeRange = 'all') => {
//   try {
//     const token = sessionStorage.getItem("auth_token");
//     const response = await fetch(`${API_URL}/admin/dashboard-stats?time_range=${timeRange}`, {
//       method: "GET",
//       headers: {
//         "Authorization": `Bearer ${token}`,
//         "Content-Type": "application/json"
//       }
//     });
//     return handleResponse(response);
//   } catch (error) {
//     console.error("Error fetching admin stats:", error);
//     throw error;
//   }
// };

export const getAdminDashboardStats = async (timeRange = "all") => {
  try {
    const token = sessionStorage.getItem("auth_token")
    const response = await fetch(`${API_URL}/admin/dashboard-stats?time_range=${timeRange}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
    return handleResponse(response)
  } catch (error) {
    console.error("Error fetching admin stats:", error)
    throw error
  }
}

export const getAdminRecentActivity = async () => {
  try {
    const token = sessionStorage.getItem("auth_token");
    const response = await fetch(`${API_URL}/admin/recent-activity`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });
    return handleResponse(response);
  } catch (error) {
    console.error("Error fetching recent activity:", error);
    throw error;
  }
};

export const getPetsForManagement = async (status = "pending", page = 1, limit = 10) => {
  try {
    const token = sessionStorage.getItem("auth_token");
    const response = await fetch(
      `${API_URL}/admin/pet-management?status=${status}&page=${page}&limit=${limit}`,
      {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      }
    );
    return handleResponse(response);
  } catch (error) {
    console.error("Error fetching pets for management:", error);
    throw error;
  }
};

export const managePet = async (petId, action) => {
  try {
    const token = sessionStorage.getItem("auth_token");
    const response = await fetch(
      `${API_URL}/admin/pet-management/${petId}?action=${action}`,
      {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      }
    );
    return handleResponse(response);
  } catch (error) {
    console.error("Error managing pet:", error);
    throw error;
  }
};


export const getAdoptionForms = async (status = null, page = 1, limit = 10, search = '') => {
  try {
    const token = sessionStorage.getItem("auth_token");
    const url = `${API_URL}/admin/adoption-forms?page=${page}&limit=${limit}${
      status ? `&status=${status}` : ''
    }${search ? `&search=${encodeURIComponent(search)}` : ''}`;
    
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });
    return handleResponse(response);
  } catch (error) {
    console.error("Error fetching adoption forms:", error);
    throw error;
  }
};

export const getAdminUsers = async (page = 1, limit = 10, search = '') => {
  try {
    const token = sessionStorage.getItem("auth_token");
    const url = `${API_URL}/admin/users?page=${page}&limit=${limit}${
      search ? `&search=${encodeURIComponent(search)}` : ''
    }`;
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });
    return handleResponse(response);
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
};

export const updateUserStatus = async (userId, action) => {
  try {
    const token = sessionStorage.getItem("auth_token");
    const response = await fetch(`${API_URL}/admin/users/${userId}/status`, {
      method: "PATCH",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ action })
    });
    return handleResponse(response);
  } catch (error) {
    console.error("Error updating user status:", error);
    throw error;
  }
};

export const getPetHealthRecords = async (page = 1, limit = 10, search = '') => {
  try {
    const token = sessionStorage.getItem("auth_token");
    const url = `${API_URL}/admin/pet-health?page=${page}&limit=${limit}${
      search ? `&search=${encodeURIComponent(search)}` : ''
    }`;
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });
    return handleResponse(response);
  } catch (error) {
    console.error("Error fetching pet health records:", error);
    throw error;
  }
};


export const createAdminAnnouncement = async (title, message) => {
  try {
    const token = sessionStorage.getItem("auth_token");
    const response = await fetch(`${API_URL}/admin/announcements`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        title: title,
        message: message,
        send_as_notification: true  // Kept this as true since you always want notifications
      })
    });
    return handleResponse(response);
  } catch (error) {
    console.error("Error creating announcement:", error);
    throw error;
  }
};

// utils/api.js
export const getUniqueAnnouncements = async (days = 7, limit = 20) => {
  try {
    const token = sessionStorage.getItem("auth_token");
    const response = await fetch(
      `${API_URL}/admin/announcements/unique?days=${days}&limit=${limit}`,
      {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      }
    );
    return await handleResponse(response);
  } catch (error) {
    console.error("Error fetching unique announcements:", error);
    throw error;
  }
};

export const getUserReports = async (status = "pending", page = 1, limit = 10) => {
  try {
    const token = sessionStorage.getItem("auth_token")
    const response = await fetch(`${API_URL}/admin/user-reports?status=${status}&page=${page}&limit=${limit}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
    return handleResponse(response)
  } catch (error) {
    console.error("Error fetching user reports:", error)
    throw error
  }
}

export const getUserReportsTrends = async (days = 30) => {
  try {
    const token = sessionStorage.getItem("auth_token")
    const response = await fetch(`${API_URL}/admin/user-reports-trends?days=${days}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
    return handleResponse(response)
  } catch (error) {
    console.error("Error fetching user reports trends:", error)
    throw error
  }
}

export const updateReportStatus = async (reportId, status) => {
  try {
    const token = sessionStorage.getItem("auth_token")
    const response = await fetch(`${API_URL}/admin/user-reports/${reportId}/status`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status }),
    })
    return handleResponse(response)
  } catch (error) {
    console.error("Error updating report status:", error)
    throw error
  }
}

export const getBlockedUsers = async (page = 1, limit = 10, search = "") => {
  try {
    const token = sessionStorage.getItem("auth_token")
    const url = `${API_URL}/admin/blocked-users?page=${page}&limit=${limit}${
      search ? `&search=${encodeURIComponent(search)}` : ""
    }`
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
    return handleResponse(response)
  } catch (error) {
    console.error("Error fetching blocked users:", error)
    throw error
  }
}

export const unblockUser = async (blockId) => {
  try {
    const token = sessionStorage.getItem("auth_token")
    const response = await fetch(`${API_URL}/admin/blocked-users/${blockId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
    return handleResponse(response)
  } catch (error) {
    console.error("Error unblocking user:", error)
    throw error
  }
}

export const getSuccessStories = async (page = 1, limit = 10) => {
  try {
    const token = sessionStorage.getItem("auth_token")
    const response = await fetch(`${API_URL}/admin/success-stories?page=${page}&limit=${limit}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
    return handleResponse(response)
  } catch (error) {
    console.error("Error fetching success stories:", error)
    throw error
  }
}

export const createSuccessStory = async (formData) => {
  try {
    const token = sessionStorage.getItem("auth_token");
    const response = await fetch(`${API_URL}/admin/success-stories`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        // Don't set Content-Type - let the browser set it with the boundary
      },
      body: formData, // Pass the FormData directly
    });
    return handleResponse(response);
  } catch (error) {
    console.error("Error creating success story:", error);
    throw error;
  }
};

export const deleteSuccessStory = async (storyId) => {
  try {
    const token = sessionStorage.getItem("auth_token")
    const response = await fetch(`${API_URL}/admin/success-stories/${storyId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
    return handleResponse(response)
  } catch (error) {
    console.error("Error deleting success story:", error)
    throw error
  }
}

export const getLoginLogs = async (page = 1, limit = 10, filters = {}) => {
  try {
    const token = sessionStorage.getItem("auth_token");
    const params = new URLSearchParams({
      page,
      limit,
      ...filters
    });
    
    const response = await fetch(`${API_URL}/admin/security/logs?${params}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });
    return handleResponse(response);
  } catch (error) {
    console.error("Error fetching login logs:", error);
    throw error;
  }
};

export const approveAdoptionForm = async (formId) => {
  try {
    const token = sessionStorage.getItem("auth_token")
    const response = await fetch(`${API_URL}/admin/adoption-forms/${formId}/approve`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
    return handleResponse(response)
  } catch (error) {
    console.error("Error approving adoption form:", error)
    throw error
  }
}

export const declineAdoptionForm = async (formId, reason = "") => {
  try {
    const token = sessionStorage.getItem("auth_token")
    const response = await fetch(`${API_URL}/admin/adoption-forms/${formId}/decline`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ reason }),
    })
    return handleResponse(response)
  } catch (error) {
    console.error("Error declining adoption form:", error)
    throw error
  }
}

export async function submitSuccessStory({ name, catName, story, images }) {
  const formData = new FormData();
  formData.append("name", name);
  formData.append("cat_name", catName);
  formData.append("story", story);

  images.forEach((imageFile) => {
    formData.append("files", imageFile);
  });

  try {
    const token = sessionStorage.getItem('auth_token');
    const response = await fetch(`${API_URL}/api/success-stories/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to submit success story');
    }

    return await response.json();
  } catch (error) {
    console.error("Error submitting success story:", error);
    throw error;
  }
}




export async function fetchSuccessStories() {
  try {
    const response = await fetch(`${API_URL}/api/success-stories/`);
    if (!response.ok) {
      throw new Error("Failed to fetch success stories");
    }
    return await response.json();
  } catch (error) {
    console.error("Fetch error:", error);
    throw error;
  }
}





















// frontend/utils/api.js
// export async function requestPasswordReset(email) {
//   const response = await fetch(`${API_URL}/forgot-password`, {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify({ email })
//   });
//   return handleResponse(response);
// }


export async function clearAdditionalImages(petId) {
  try {
    const token = sessionStorage.getItem('auth_token');
    const response = await fetch(`${API_URL}/api/pets/${petId}/clear-additional-images`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to clear additional images');
    }

    return await response.json();
  } catch (error) {
    console.error('Error clearing additional images:', error);
    throw error;
  }
}
