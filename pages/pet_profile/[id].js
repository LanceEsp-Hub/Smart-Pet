
//frontend\pages\pet_profile\[id].js

"use client"

import { useRouter } from "next/router"
import { useState, useEffect } from "react"
import {
  MapPin,
  Edit,
  FileText,
  Trash2,
  CheckCircle,
  Search,
  Home,
  AlertTriangle,
  Camera,
  Calendar,
  Info,
} from "lucide-react"
import toast, { Toaster } from "react-hot-toast"
import Navbar from "../../components/Navbar"
import Footer from "../../components/Footer"
import { fetchPetDetails, deletePet, updatePetStatus, togglePublishPet } from "../../utils/api"
import { XCircle, Upload } from "lucide-react"

export default function PetProfile() {
  const router = useRouter()
  const { id } = router.query
  const [pet, setPet] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [userId, setUserId] = useState(null)
  const [showMissingImagesModal, setShowMissingImagesModal] = useState(false)

  useEffect(() => {
    const token = sessionStorage.getItem("auth_token")
    const userId = sessionStorage.getItem("user_id")
    const petStatus = localStorage.getItem("petStatus")

    if (!token || !userId) {
      router.push("/login")
    } else {
      setUserId(userId)
    }

    if (id) {
      const loadPet = async () => {
        try {
          const data = await fetchPetDetails(id)
          if (petStatus) {
            data.status = petStatus
          }
          setPet(data)
        } catch (error) {
          console.error("Failed to load pet:", error)
          setError(error.message)
        } finally {
          setLoading(false)
        }
      }
      loadPet()
    }
  }, [id, router])

  const getDateLabel = () => {
    if (!pet) return ""
    switch (pet.status) {
      case "Pet I Found":
        return `Reported found ${pet.date}`
      case "Lost":
        return `Reported lost ${pet.date}`
      case "Safe at Home":
      default:
        return `Birthdate: ${pet.date}`
    }
  }

  const handleMarkReunited = async () => {
    try {
      await toast.promise(updatePetStatus(id, "Reunited"), {
        loading: "Updating...",
        success: () => {
          setPet((prev) => ({ ...prev, status: "Reunited" }))
          return "Pet marked as reunited!"
        },
        error: "Failed to update",
      })
    } catch (error) {
      console.error(error)
    }
  }

  const handleMarkFound = async () => {
    try {
      await toast.promise(updatePetStatus(id, "Safe at Home"), {
        loading: "Updating...",
        success: () => {
          setPet((prev) => ({ ...prev, status: "Safe at Home" }))
          return "Pet marked as found!"
        },
        error: "Failed to update",
      })
    } catch (error) {
      console.error(error)
    }
  }

  const handleTogglePublish = async () => {
    try {
      const result = await togglePublishPet(pet.id, true)
      setPet((prev) => ({
        ...prev,
        is_published: result.is_published,
        admin_approved: false, // Reset approval when publishing
      }))
      toast.success(result.message)
    } catch (error) {
      toast.error(error.message)
    }
  }

  const handleUnpublish = async () => {
    try {
      const result = await togglePublishPet(pet.id, false) // false means unpublish
      setPet((prev) => ({
        ...prev,
        is_published: false,
        admin_approved: false, // Ensure UI updates immediately
      }))
      toast.success(result.message)
    } catch (error) {
      toast.error(error.message)
      console.error("Unpublish failed:", error)
    }
  }

  const handleReportAsLost = async () => {
    try {
      const result = await updatePetStatus(pet.id, "Lost")
      setPet((prev) => ({ ...prev, status: "Lost", is_published: false }))
      toast.success("Pet reported as lost")
    } catch (error) {
      toast.error(error.message)
    }
  }

  const handleRemovePet = async () => {
    if (confirm("Are you sure you want to remove this pet? This action cannot be undone.")) {
      try {
        const token = sessionStorage.getItem("auth_token")
        if (!token) {
          throw new Error("Authentication required")
        }

        await toast.promise(deletePet(id, token), {
          loading: "Removing pet...",
          success: "Pet removed successfully",
          error: (err) => err.message || "Failed to remove pet",
        })

        router.push("/pet_dashboard")
      } catch (error) {
        console.error("Delete failed:", error)
      }
    }
  }

  // Add this function before any handler that uses it
  const checkRequiredImages = () => {
    if (!pet || !pet.additional_images) return false

    const requiredImages = ["fur.jpg", "face.jpg", "side.jpg"]
    const currentImages = pet.additional_images || []

    return requiredImages.every((img) => currentImages.includes(img))
  }

  const handleGenerateFingerprint = async () => {
    try {
      if (!pet) {
        throw new Error("Pet data not loaded")
      }

      if (!checkRequiredImages()) {
        setShowMissingImagesModal(true)
        return
      }

      const token = sessionStorage.getItem("auth_token")
      if (!token) {
        throw new Error("Authentication required")
      }

      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/pets/${pet.id}/generate-fingerprint`

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: pet.status.toLowerCase(), // Ensure status is lowercase
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      toast.success("Fingerprint generated successfully!")

      // Refresh pet data to show the fingerprint status
      const updatedPet = await fetchPetDetails(id)
      setPet(updatedPet)
    } catch (error) {
      console.error("Fingerprint generation failed:", error)
      toast.error(error.message || "Failed to generate fingerprint")
    }
  }

  // Loading state with a modern spinner
  if (loading)
    return (
      <div className="fixed inset-0 bg-white flex items-center justify-center z-50">
        <div className="flex flex-col items-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-emerald-200 rounded-full"></div>
            <div className="absolute top-0 left-0 w-16 h-16 border-4 border-emerald-500 rounded-full animate-spin border-t-transparent"></div>
          </div>
          <p className="mt-4 text-gray-600">Loading pet profile...</p>
        </div>
      </div>
    )

  if (error)
    return (
      <div className="container mx-auto p-6 text-center">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
          <div className="flex items-center">
            <AlertTriangle className="h-6 w-6 text-red-500 mr-3" />
            <p className="text-red-700">Error: {error}</p>
          </div>
        </div>
      </div>
    )

  if (!pet)
    return (
      <div className="container mx-auto p-6 text-center">
        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
          <p className="text-yellow-700">Pet not found</p>
        </div>
      </div>
    )

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case "Lost":
        return "bg-red-100 text-red-700"
      case "Pet I Found":
        return "bg-blue-100 text-blue-700"
      case "Safe at Home":
        return "bg-green-100 text-green-700"
      case "Reunited":
        return "bg-purple-100 text-purple-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <Navbar />

      {pet.status === "Lost" && (
        <div className="bg-red-50 border-b border-red-100 py-3">
          <div className="container mx-auto px-4 flex items-center justify-between">
            <p className="text-red-700 flex items-center">
              <AlertTriangle size={18} className="mr-2" />
              You have a lost pet.
            </p>
            <a href="/search" className="text-red-700 font-medium hover:underline flex items-center">
              <Search size={16} className="mr-1" />
              Search for similar pets
            </a>
          </div>
        </div>
      )}

      {/* Missing Images Modal */}
      {showMissingImagesModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-xl max-w-md w-full shadow-xl">
            <div className="flex items-center mb-4 text-amber-600">
              <Camera size={24} className="mr-3" />
              <h3 className="text-lg font-medium">Missing Images</h3>
            </div>
            <p className="mb-6 text-gray-600">
              Please upload all required additional images (fur.jpg, face.jpg, side.jpg) before generating a
              fingerprint.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowMissingImagesModal(false)}
                className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors text-gray-700"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setShowMissingImagesModal(false)
                  router.push(`/edit_pet_details/${pet.id}`)
                }}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors shadow-sm"
              >
                Upload Images
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
          <div className="md:flex">
            {/* Pet Image Section */}
            <div className="md:w-2/5 relative">
              {pet.image ? (
                <img
                  src={getPetImageUrl(pet.image) || "/placeholder.svg"}
                  alt={pet.name}
                  className="w-full h-full object-cover aspect-square md:aspect-auto md:h-full"
                  onError={(e) => {
                    e.target.onerror = null
                    e.target.src = "https://via.placeholder.com/400"
                  }}
                />
              ) : (
                <div className="w-full h-64 md:h-full bg-gray-100 flex items-center justify-center">
                  <Camera size={48} className="text-gray-400" />
                  <p className="text-gray-500 ml-2">No Image Available</p>
                </div>
              )}

              {/* Status Badge */}
              <div
                className={`absolute top-4 right-4 ${getStatusColor(pet.status)} px-3 py-1 rounded-full text-sm font-medium shadow-sm`}
              >
                {pet.status}
              </div>
            </div>

            {/* Pet Details Section */}
            <div className="md:w-3/5 p-6">
              <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-800 mb-1">{pet.name}</h1>
                <p className="text-gray-500 flex items-center">
                  <Calendar size={16} className="mr-2" />
                  {getDateLabel()}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Type</p>
                  <p className="font-medium text-gray-800">{pet.type || "-"}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Gender</p>
                  <p className="font-medium text-gray-800">{pet.gender || "-"}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Status</p>
                  <p className="font-medium text-gray-800">{pet.status || "-"}</p>
                </div>
              </div>

              {pet.description && (
                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-gray-800 mb-2 flex items-center">
                    <Info size={18} className="mr-2 text-emerald-500" />
                    Description
                  </h2>
                  <p className="text-gray-600 bg-gray-50 p-4 rounded-lg border border-gray-100">{pet.description}</p>
                </div>
              )}

              {pet.address && (
                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-gray-800 mb-2 flex items-center">
                    <MapPin size={18} className="mr-2 text-emerald-500" />
                    Last Seen Location
                  </h2>
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 flex items-start">
                    <MapPin size={18} className="mr-2 text-gray-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-600">{pet.address}</span>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 mb-6">
                {/* Safe at Home or Reunited status */}
                {(pet.status === "Safe at Home" || pet.status === "Reunited") && (
                  <>
                    <button
                      onClick={handleReportAsLost}
                      className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors border border-red-100"
                    >
                      <AlertTriangle size={16} />
                      Report as Lost
                    </button>
                    <button
                      onClick={() => router.push(`/edit_pet_details/${pet.id}`)}
                      className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition-colors border border-emerald-100"
                    >
                      <Edit size={16} />
                      Edit Details
                    </button>
                  </>
                )}

                {/* Status-specific buttons */}
                {pet.status === "Lost" && (
                  <button
                    onClick={handleMarkFound}
                    className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors border border-green-100"
                  >
                    <Home size={16} />
                    Mark as Found
                  </button>
                )}

                {pet.status === "Pet I Found" && (
                  <button
                    onClick={handleMarkReunited}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors border border-purple-100"
                  >
                    <CheckCircle size={16} />
                    Mark as Reunited
                  </button>
                )}
              </div>

              {/* Publication Status Card */}
              <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 mb-6">
                <h3 className="font-medium text-lg mb-4 flex items-center">
                  <Upload size={18} className="mr-2 text-emerald-500" />
                  Publication Status
                </h3>

                {pet.is_published ? (
                  <>
                    <div className="flex flex-wrap items-center gap-4 mb-3">
                      <button
                        onClick={handleUnpublish}
                        className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors border border-red-200"
                      >
                        <XCircle size={16} />
                        Unpublish
                      </button>

                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-500">Admin:</span>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            pet.admin_approved ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {pet.admin_approved ? "Approved" : "Pending Review"}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">
                      {pet.admin_approved ? "This listing is publicly visible" : "Under admin review (24-48 hours)"}
                    </p>
                  </>
                ) : (
                  <button
                    onClick={handleTogglePublish}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-colors border border-emerald-200"
                  >
                    <Upload size={16} />
                    Publish This Pet
                  </button>
                )}
              </div>

              {/* Advanced Actions */}
              <div className="border-t border-gray-100 pt-6 flex flex-wrap gap-3">
                <button
                  onClick={() => router.push(`/edit_pet_details/${pet.id}`)}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <Edit size={16} />
                  Edit pet details
                </button>

                {pet.status === "Lost" && (
  <button 
    onClick={() => {
      // Create a temporary link to the flyer page
      const link = document.createElement('a');
      link.href = `/pet_flyer?id=${pet.id}`;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.click();
    }}
    className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
  >
    <FileText size={16} />
    Generate Pet Flyer
  </button>
)}

                <button
                  onClick={handleRemovePet}
                  className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors"
                >
                  <Trash2 size={16} />
                  Remove Pet
                </button>

                {/* Fingerprint Button */}
                <button
                  onClick={handleGenerateFingerprint}
                  disabled={pet?.has_generated_fingerprint}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    pet?.has_generated_fingerprint
                      ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                      : "bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-100"
                  }`}
                >
                  <FileText size={16} />
                  {pet?.has_generated_fingerprint ? "Fingerprint Generated" : "Generate Fingerprint"}
                </button>

                {/* Find Similar Pets Button */}
                <button
                  onClick={() => router.push(`/pet_profile/${id}/similar`)}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition-colors border border-emerald-100"
                >
                  <Search size={16} />
                  Find Similar Pets
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
      <Toaster position="bottom-right" />
    </div>
  )
}

function getPetImageUrl(imageName) {
  if (!imageName) return "https://via.placeholder.com/400"
  return `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/uploads/pet_images/${imageName}?t=${Date.now()}`
}


// "use client";
// import { useRouter } from 'next/router';
// import { useState, useEffect } from 'react';
// import { MapPin, Edit, FileText, Trash2, CheckCircle, Search, Home, AlertTriangle } from "lucide-react";
// import toast, { Toaster } from "react-hot-toast";
// import Navbar from "../../components/Navbar";
// import Footer from "../../components/Footer";
// import { fetchPetDetails, deletePet, updatePetStatus, togglePublishPet, unpublishPet, generateFingerprint } from '../../utils/api';
// import { XCircle, Upload, Clock } from "lucide-react";

// export default function PetProfile() {
//   const router = useRouter();
//   const { id } = router.query;
//   const [pet, setPet] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [userId, setUserId] = useState(null);
//   const [showMissingImagesModal, setShowMissingImagesModal] = useState(false);

//   useEffect(() => {
//     const token = sessionStorage.getItem("auth_token");
//     const userId = sessionStorage.getItem("user_id");
//     const petStatus = localStorage.getItem('petStatus');
    
//     if (!token || !userId) {
//       router.push("/login");
//     } else {
//       setUserId(userId);
//     }

//     if (id) {
//       const loadPet = async () => {
//         try {
//           const data = await fetchPetDetails(id);
//           if (petStatus) {
//             data.status = petStatus;
//           }
//           setPet(data);
//         } catch (error) {
//           console.error("Failed to load pet:", error);
//           setError(error.message);
//         } finally {
//           setLoading(false);
//         }
//       };
//       loadPet();
//     }
//   }, [id, router]);

//   const getDateLabel = () => {
//     if (!pet) return "";
//     switch(pet.status) {
//       case "Pet I Found":
//         return `Reported found ${pet.date}`;
//       case "Lost":
//         return `Reported lost ${pet.date}`;
//       case "Safe at Home":
//       default:
//         return `Birthdate: ${pet.date}`;
//     }
//   };

//   const handleMarkReunited = async () => {
//     try {
//       await updatePetStatus(id, "Reunited");
//       setPet(prev => ({ ...prev, status: "Reunited" }));
//       toast.success("Pet marked as reunited!");
//     } catch (error) {
//       console.error(error);
//       toast.error("Failed to update");
//     }
//   };

//   const handleMarkFound = async () => {
//     try {
//       await updatePetStatus(id, "Safe at Home");
//       setPet(prev => ({ ...prev, status: "Safe at Home" }));
//       toast.success("Pet marked as found!");
//     } catch (error) {
//       console.error(error);
//       toast.error("Failed to update");
//     }
//   };

//   const handleTogglePublish = async () => {
//     try {
//       const result = await togglePublishPet(pet.id, true);
//       setPet(prev => ({ 
//         ...prev, 
//         is_published: result.is_published,
//         admin_approved: false
//       }));
//       toast.success(result.message);
//     } catch (error) {
//       toast.error(error.message);
//     }
//   };

//   const handleUnpublish = async () => {
//     try {
//       const result = await togglePublishPet(pet.id, false);
//       setPet(prev => ({ 
//         ...prev, 
//         is_published: false,
//         admin_approved: false
//       }));
//       toast.success(result.message);
//     } catch (error) {
//       toast.error(error.message);
//       console.error("Unpublish failed:", error);
//     }
//   };

//   const handleReportAsLost = async () => {
//     try {
//       const result = await updatePetStatus(pet.id, "Lost");
//       setPet(prev => ({ ...prev, status: "Lost", is_published: false }));
//       toast.success("Pet reported as lost");
//     } catch (error) {
//       toast.error(error.message);
//     }
//   };

//   const handleRemovePet = async () => {
//     if (confirm("Are you sure you want to remove this pet? This action cannot be undone.")) {
//       try {
//         const token = sessionStorage.getItem("auth_token");
//         if (!token) {
//           throw new Error("Authentication required");
//         }

//         await deletePet(id, token);
//         toast.success("Pet removed successfully");
//         router.push("/pet_dashboard");
//       } catch (error) {
//         console.error("Delete failed:", error);
//         toast.error(error.message || "Failed to remove pet");
//       }
//     }
//   };

//   const checkRequiredImages = () => {
//     if (!pet || !pet.additional_images) return false;
    
//     const requiredImages = ['fur.jpg', 'face.jpg', 'side.jpg'];
//     const currentImages = pet.additional_images || [];
    
//     return requiredImages.every(img => currentImages.includes(img));
//   };

//   const handleGenerateFingerprint = async () => {
//     try {
//       if (!pet) {
//         throw new Error("Pet data not loaded");
//       }

//       if (!checkRequiredImages()) {
//         setShowMissingImagesModal(true);
//         return;
//       }

//       const token = sessionStorage.getItem("auth_token");
//       if (!token) {
//         throw new Error("Authentication required");
//       }

//       const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/pets/${pet.id}/generate-fingerprint`;
      
//       const response = await fetch(apiUrl, {
//         method: "POST",
//         headers: {
//           "Authorization": `Bearer ${token}`,
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           status: pet.status.toLowerCase()
//         })
//       });

//       if (!response.ok) {
//         const errorData = await response.json().catch(() => ({}));
//         throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
//       }

//       const data = await response.json();
//       toast.success("Fingerprint generated successfully!");
      
//       const updatedPet = await fetchPetDetails(id);
//       setPet(updatedPet);
//     } catch (error) {
//       console.error("Fingerprint generation failed:", error);
//       toast.error(error.message || "Failed to generate fingerprint");
//     }
//   };

//   if (loading) return <div>Loading...</div>;
//   if (error) return <div>Error: {error}</div>;
//   if (!pet) return <div>Pet not found</div>;

//   return (
//     <div>
//       <Navbar />

//       {pet.status === "Lost" && (
//         <div>
//           <p>You have a lost pet. <a href="/search">Click to Search</a></p>
//         </div>
//       )}

//       {showMissingImagesModal && (
//         <div>
//           <div>
//             <h3>Missing Images</h3>
//             <p>
//               Please upload all required additional images (fur.jpg, face.jpg, side.jpg) before generating a fingerprint.
//             </p>
//             <div>
//               <button onClick={() => setShowMissingImagesModal(false)}>
//                 Close
//               </button>
//               <button onClick={() => {
//                 setShowMissingImagesModal(false);
//                 router.push(`/edit_pet_details/${pet.id}`);
//               }}>
//                 Upload Images
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       <main>
//         <div>
//           <div>
//             {pet.image ? (
//               <img
//                 src={getPetImageUrl(pet.image)}
//                 alt={pet.name}
//                 onError={(e) => {
//                   e.target.onerror = null;
//                   e.target.src = "";
//                 }}
//               />
//             ) : (
//               <div>No Image Available</div>
//             )}
//           </div>

//           <div>
//             <div>
//               <h1>{pet.name}</h1>
//               <p>{getDateLabel()}</p>
//             </div>

//             <div>
//               <div>
//                 <p>Type</p>
//                 <p>{pet.type || '-'}</p>
//               </div>
//               <div>
//                 <p>Gender</p>
//                 <p>{pet.gender || '-'}</p>
//               </div>
//               <div>
//                 <p>Status</p>
//                 <p>{pet.status || '-'}</p>
//               </div>
//             </div>

//             {pet.description && (
//               <div>
//                 <h2>Description</h2>
//                 <p>{pet.description}</p>
//               </div>
//             )}

//             {pet.address && (
//               <div>
//                 <h2>Last Seen Location</h2>
//                 <div>
//                   <MapPin />
//                   <span>{pet.address}</span>
//                 </div>
//               </div>
//             )}

//             <div>
//               {(pet.status === "Safe at Home" || pet.status === "Reunited") && (
//                 <>
//                   <button onClick={handleReportAsLost}>
//                     <AlertTriangle />
//                     Report as Lost
//                   </button>
//                   <button onClick={() => router.push(`/edit_pet_details/${pet.id}`)}>
//                     <Edit />
//                     Edit Details
//                   </button>
//                 </>
//               )}

//               <div>
//                 <h3>Publication Status</h3>
                
//                 {pet.is_published ? (
//                   <>
//                     <div>
//                       <button onClick={handleUnpublish}>
//                         <XCircle />
//                         Unpublish
//                       </button>
                      
//                       <div>
//                         <span>Admin:</span>
//                         <span>
//                           {pet.admin_approved ? 'Approved' : 'Pending Review'}
//                         </span>
//                       </div>
//                     </div>
//                     <p>
//                       {pet.admin_approved 
//                         ? "This listing is publicly visible"
//                         : "Under admin review (24-48 hours)"}
//                     </p>
//                   </>
//                 ) : (
//                   <button onClick={handleTogglePublish}>
//                     <Upload />
//                     Publish This Pet
//                   </button>
//                 )}
//               </div>

//               {pet.status === "Lost" && (
//                 <button onClick={handleMarkFound}>
//                   <Home />
//                   Mark as Found
//                 </button>
//               )}

//               {pet.status === "Pet I Found" && (
//                 <button onClick={handleMarkReunited}>
//                   <CheckCircle />
//                   Mark as Reunited
//                 </button>
//               )}
//             </div>
//           </div>
//         </div>

//         <div>
//           <button onClick={() => router.push(`/edit_pet_details/${pet.id}`)}>
//             <Edit />
//             Edit pet details
//           </button>

//           {pet.status === "Lost" && (
//             <button>
//               <FileText />
//               View pet flyer
//             </button>
//           )}

//           <button onClick={handleRemovePet}>
//             <Trash2 />
//             Remove Pet
//           </button>

//           <button 
//             onClick={handleGenerateFingerprint}
//             disabled={pet?.has_generated_fingerprint}
//           >
//             <FileText />
//             {pet?.has_generated_fingerprint ? 'Fingerprint Generated' : 'Generate Fingerprint'}
//           </button>

//           <button onClick={() => router.push(`/pet_profile/${id}/similar`)}>
//             <Search />
//             Find Similar Pets
//           </button>
//         </div>
//       </main>

//       <Footer />
//       <Toaster />
//     </div>
//   );
// }

// function getPetImageUrl(imageName) {
//   if (!imageName) return "";
//   return `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/uploads/pet_images/${imageName}?t=${Date.now()}`;
// }