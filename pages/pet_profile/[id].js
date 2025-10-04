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
  Navigation,
  Sparkles,
  X,
} from "lucide-react"
import toast, { Toaster } from "react-hot-toast"
import Navbar from "../../components/Navbar"
import Footer from "../../components/Footer"
import {
  fetchPetDetails,
  deletePet,
  updatePetStatus,
  togglePublishPet,
  pairDeviceWithPet,
  updatePairDeviceWithPet,
  getPetDeviceInfo,
  getPetCurrentLocation,
  toggleDeviceActivation,
} from "../../utils/api"
import { XCircle, Upload } from "lucide-react"

// Add these constants after the imports
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://fkpimtcxncgwtdsfyrjb.supabase.co"
const PET_IMAGES_BUCKET = "pet-images"

function getPetImageUrl(imageName) {
  if (!imageName) return "https://via.placeholder.com/100"
  // Handle the format "1/main.jpg" -> "https://fkpimtcxncgwtdsfyrjb.supabase.co/storage/v1/object/public/pet-images/1/main.jpg"
  return `${SUPABASE_URL}/storage/v1/object/public/${PET_IMAGES_BUCKET}/${imageName}`
}

export default function PetProfile() {
  const router = useRouter()
  const { id } = router.query
  const [pet, setPet] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [userId, setUserId] = useState(null)
  const [showMissingImagesModal, setShowMissingImagesModal] = useState(false)
  const [showPairModal, setShowPairModal] = useState(false)
  const [showLocationModal, setShowLocationModal] = useState(false)
  const [uniqueCode, setUniqueCode] = useState("")
  const [pairingLoading, setPairingLoading] = useState(false)
  const [deviceInfo, setDeviceInfo] = useState(null)
  const [currentLocation, setCurrentLocation] = useState(null)
  const [locationLoading, setLocationLoading] = useState(false)
  const [isUpdateMode, setIsUpdateMode] = useState(false)
  const [deviceActivationLoading, setDeviceActivationLoading] = useState(false)
  const [showCompleteProfileModal, setShowCompleteProfileModal] = useState(false)

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

          // Check if pet has paired device
          try {
            const deviceData = await getPetDeviceInfo(id)
            setDeviceInfo(deviceData)
          } catch (error) {
            // Pet doesn't have paired device, that's okay
            setDeviceInfo(null)
          }

          // Check if profile is incomplete and show modal
          const isIncomplete = !data.description || !data.address || !data.image
          if (isIncomplete) {
            setTimeout(() => setShowCompleteProfileModal(true), 1000)
          }
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

    // Remove time from date display
    const dateOnly = pet.date ? pet.date.split("T")[0] : pet.date

    switch (pet.status) {
      case "Pet I Found":
        return `Reported found ${dateOnly}`
      case "Lost":
        return `Reported lost ${dateOnly}`
      case "Safe at Home":
      case "Rehome Pet":
      default:
        return `Birthdate: ${dateOnly}`
    }
  }

  const getLocationLabel = () => {
    if (!pet) return "Location"

    switch (pet.status) {
      case "Lost":
        return "Last Seen Location"
      case "Pet I Found":
        return "Found Location"
      case "Safe at Home":
        return "Home Location"
      case "Rehome Pet":
        return "Current Location"
      default:
        return "Location"
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

      // Check if pet status allows fingerprint generation
      const allowedStatuses = ["Lost", "Pet I Found"]
      if (!allowedStatuses.includes(pet.status)) {
        toast.error(
          `Fingerprint generation is only available for pets with 'Lost' or 'Pet I Found' status. Current status: ${pet.status}`,
        )
        return
      }

      // Check if pet type allows fingerprint generation
      const allowedTypes = ["Dog", "Cat", "dog", "cat"]
      if (!allowedTypes.includes(pet.type)) {
        toast.error(`Fingerprint generation is only available for dogs and cats. Current type: ${pet.type}`)
        return
      }

      if (!checkRequiredImages()) {
        setShowMissingImagesModal(true)
        return
      }

      const token = sessionStorage.getItem("auth_token")
      if (!token) {
        throw new Error("Authentication required")
      }

      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || "https://newback-production-a0cc.up.railway.app"}/api/pets/${pet.id}/generate-fingerprint`

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: pet.status, // Send the status as stored in database
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

  const handlePairDevice = async () => {
    if (!uniqueCode.trim()) {
      toast.error("Please enter a unique code")
      return
    }

    setPairingLoading(true)
    try {
      let result
      if (isUpdateMode) {
        result = await updatePairDeviceWithPet(uniqueCode.trim(), pet.id, userId)
      } else {
        result = await pairDeviceWithPet(uniqueCode.trim(), pet.id, userId)
      }

      toast.success(result.message)
      setShowPairModal(false)
      setUniqueCode("")
      setIsUpdateMode(false)

      // Refresh device info
      try {
        const deviceData = await getPetDeviceInfo(id)
        setDeviceInfo(deviceData)
      } catch (error) {
        setDeviceInfo(null)
      }

      // Optionally refresh pet data
      const updatedPet = await fetchPetDetails(id)
      setPet(updatedPet)
    } catch (error) {
      toast.error(error.message)
    } finally {
      setPairingLoading(false)
    }
  }

  const handleViewLocation = async () => {
    setLocationLoading(true)
    setShowLocationModal(true)

    try {
      const locationData = await getPetCurrentLocation(pet.id)
      setCurrentLocation(locationData)
    } catch (error) {
      toast.error(error.message)
      setCurrentLocation(null)
    } finally {
      setLocationLoading(false)
    }
  }

  const handleUpdatePairing = () => {
    setIsUpdateMode(true)
    setUniqueCode(deviceInfo?.unique_code || "")
    setShowPairModal(true)
  }

  const handleToggleDeviceActivation = async (isActive) => {
    setDeviceActivationLoading(true)
    try {
      const result = await toggleDeviceActivation(pet.id, isActive)
      toast.success(result.message)

      // Update device info state
      setDeviceInfo((prev) => ({
        ...prev,
        is_active: isActive,
      }))

      // Refresh device info from server
      try {
        const deviceData = await getPetDeviceInfo(id)
        setDeviceInfo(deviceData)
      } catch (error) {
        console.error("Failed to refresh device info:", error)
      }
    } catch (error) {
      toast.error(error.message)
    } finally {
      setDeviceActivationLoading(false)
    }
  }

  // Check if buttons should be hidden based on pet status
  const shouldHideAdvancedButtons = () => {
    return pet?.status === "Rehome Pet" || pet?.status === "Safe at Home"
  }

  // Check if should show pair button
  const shouldShowPairButton = () => {
    return !deviceInfo && pet?.status === "Lost"
  }

  // Check if should show location button
  const shouldShowLocationButton = () => {
    return deviceInfo && pet?.status === "Lost"
  }

  // Loading state with a modern spinner
  if (loading)
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-emerald-50 to-blue-50 flex items-center justify-center z-50">
        <div className="flex flex-col items-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-emerald-100 rounded-full"></div>
            <div className="absolute top-0 left-0 w-20 h-20 border-4 border-emerald-500 rounded-full animate-spin border-t-transparent"></div>
          </div>
          <p className="mt-6 text-gray-700 font-medium text-lg">Loading pet profile...</p>
        </div>
      </div>
    )

  if (error)
    return (
      <div className="container mx-auto p-6 text-center">
        <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-center">
            <AlertTriangle className="h-8 w-8 text-red-500 mr-3" />
            <p className="text-red-700 text-lg font-medium">Error: {error}</p>
          </div>
        </div>
      </div>
    )

  if (!pet)
    return (
      <div className="container mx-auto p-6 text-center">
        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-6 rounded-lg shadow-sm">
          <p className="text-yellow-700 text-lg font-medium">Pet not found</p>
        </div>
      </div>
    )

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case "Lost":
        return "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg shadow-red-200"
      case "Pet I Found":
        return "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-200"
      case "Safe at Home":
        return "bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg shadow-green-200"
      case "Reunited":
        return "bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg shadow-purple-200"
      case "Rehome Pet":
        return "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-200"
      default:
        return "bg-gradient-to-r from-gray-500 to-gray-600 text-white shadow-lg"
    }
  }

  return (
    <div className="bg-gradient-to-br from-gray-50 via-white to-emerald-50 min-h-screen">
      <Navbar />

      {pet.status === "Lost" && (
        <div className="bg-gradient-to-r from-red-500 to-red-600 border-b border-red-400 py-4 shadow-lg">
          <div className="container mx-auto px-4 flex items-center justify-between">
            <p className="text-white flex items-center font-medium">
              <AlertTriangle size={20} className="mr-2 animate-pulse" />
              You have a lost pet.
            </p>
            <a
              href="/search"
              className="text-white font-semibold hover:underline flex items-center bg-white/20 px-4 py-2 rounded-lg hover:bg-white/30 transition-all"
            >
              <Search size={18} className="mr-2" />
              Search for similar pets
            </a>
          </div>
        </div>
      )}

      {/* Complete Profile Modal */}
      {showCompleteProfileModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-md p-4 animate-fadeIn">
          <div className="bg-white p-8 rounded-2xl max-w-lg w-full shadow-2xl transform animate-slideUp">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center text-emerald-600">
                <div className="bg-emerald-100 p-3 rounded-full mr-4">
                  <Sparkles size={28} className="animate-pulse" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-800">Complete Your Pet Profile</h3>
                  <p className="text-sm text-gray-500 mt-1">Help others find your pet faster</p>
                </div>
              </div>
              <button
                onClick={() => setShowCompleteProfileModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-full"
              >
                <X size={24} />
              </button>
            </div>

            <div className="bg-gradient-to-br from-emerald-50 to-blue-50 p-6 rounded-xl mb-6 border border-emerald-100">
              <p className="text-gray-700 leading-relaxed mb-4">
                A complete profile significantly increases the chances of reuniting with your pet. Add missing details
                like photos, description, and location to help your community assist you better.
              </p>
              <div className="space-y-2">
                {!pet.image && (
                  <div className="flex items-center text-amber-700 bg-amber-50 px-3 py-2 rounded-lg">
                    <Camera size={16} className="mr-2" />
                    <span className="text-sm font-medium">Missing: Pet photo</span>
                  </div>
                )}
                {!pet.description && (
                  <div className="flex items-center text-amber-700 bg-amber-50 px-3 py-2 rounded-lg">
                    <Info size={16} className="mr-2" />
                    <span className="text-sm font-medium">Missing: Description</span>
                  </div>
                )}
                {!pet.address && (
                  <div className="flex items-center text-amber-700 bg-amber-50 px-3 py-2 rounded-lg">
                    <MapPin size={16} className="mr-2" />
                    <span className="text-sm font-medium">Missing: Location</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowCompleteProfileModal(false)}
                className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all font-medium"
              >
                Maybe Later
              </button>
              <button
                onClick={() => {
                  setShowCompleteProfileModal(false)
                  router.push(`/edit_pet_details/${pet.id}`)
                }}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-lg shadow-emerald-200 font-semibold flex items-center justify-center gap-2"
              >
                <Edit size={18} />
                Complete Profile Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Missing Images Modal */}
      {showMissingImagesModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-md p-4">
          <div className="bg-white p-8 rounded-2xl max-w-md w-full shadow-2xl">
            <div className="flex items-center mb-6 text-amber-600">
              <div className="bg-amber-100 p-3 rounded-full mr-4">
                <Camera size={28} />
              </div>
              <h3 className="text-2xl font-bold text-gray-800">Missing Images</h3>
            </div>
            <p className="mb-6 text-gray-600 leading-relaxed">
              Please upload all required additional images (fur.jpg, face.jpg, side.jpg) before generating a
              fingerprint. These images help create an accurate identification profile.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowMissingImagesModal(false)}
                className="flex-1 px-6 py-3 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all text-gray-700 font-medium"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setShowMissingImagesModal(false)
                  router.push(`/edit_pet_details/${pet.id}`)
                }}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-lg shadow-emerald-200 font-semibold"
              >
                Upload Images
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pair Device Modal */}
      {showPairModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-md p-4">
          <div className="bg-white p-8 rounded-2xl max-w-md w-full shadow-2xl">
            <div className="flex items-center mb-6 text-emerald-600">
              <div className="bg-emerald-100 p-3 rounded-full mr-4">
                <MapPin size={28} />
              </div>
              <h3 className="text-2xl font-bold text-gray-800">
                {isUpdateMode ? "Update Pet Tracker" : "Pair Pet Tracker"}
              </h3>
            </div>
            <p className="mb-6 text-gray-600 leading-relaxed">
              {isUpdateMode
                ? `Update the tracker device for ${pet.name}.`
                : `Enter the unique code of your pet tracker device to pair it with ${pet.name}.`}
            </p>
            <div className="mb-6">
              <label htmlFor="uniqueCode" className="block text-sm font-semibold text-gray-700 mb-3">
                Device Unique Code
              </label>
              <input
                type="text"
                id="uniqueCode"
                value={uniqueCode}
                onChange={(e) => setUniqueCode(e.target.value)}
                placeholder="Enter unique code (e.g., LILYGO-7A83-B2)"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                disabled={pairingLoading}
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowPairModal(false)
                  setUniqueCode("")
                  setIsUpdateMode(false)
                }}
                disabled={pairingLoading}
                className="flex-1 px-6 py-3 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all text-gray-700 font-medium disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handlePairDevice}
                disabled={pairingLoading || !uniqueCode.trim()}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-lg shadow-emerald-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {pairingLoading
                  ? isUpdateMode
                    ? "Updating..."
                    : "Pairing..."
                  : isUpdateMode
                    ? "Update Device"
                    : "Pair Device"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Location Modal */}
      {showLocationModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-md p-4">
          <div className="bg-white p-8 rounded-2xl max-w-md w-full shadow-2xl">
            <div className="flex items-center mb-6 text-blue-600">
              <div className="bg-blue-100 p-3 rounded-full mr-4">
                <Navigation size={28} />
              </div>
              <h3 className="text-2xl font-bold text-gray-800">Current Pet Location</h3>
            </div>

            {locationLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
                <span className="ml-4 text-gray-600 font-medium">Loading location...</span>
              </div>
            ) : currentLocation ? (
              <div className="space-y-4">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-100">
                  <p className="text-sm text-blue-600 font-semibold mb-3">Latest Location:</p>
                  <p className="font-bold text-gray-800 text-lg">Latitude: {currentLocation.latitude}</p>
                  <p className="font-bold text-gray-800 text-lg">Longitude: {currentLocation.longitude}</p>
                  <p className="text-sm text-gray-500 mt-3 pt-3 border-t border-blue-200">
                    Last updated: {new Date(currentLocation.timestamp).toLocaleString()}
                  </p>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      const url = `https://www.google.com/maps?q=${currentLocation.latitude},${currentLocation.longitude}`
                      window.open(url, "_blank")
                    }}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg shadow-blue-200 font-semibold"
                  >
                    View on Google Maps
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <MapPin size={64} className="mx-auto text-gray-300 mb-4" />
                <p className="text-gray-600 font-medium text-lg">No location data available</p>
                <p className="text-sm text-gray-500 mt-2">
                  The device may be offline or hasn't sent location data yet.
                </p>
              </div>
            )}

            <div className="flex justify-end mt-6">
              <button
                onClick={() => {
                  setShowLocationModal(false)
                  setCurrentLocation(null)
                }}
                className="px-6 py-3 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all text-gray-700 font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
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
                <div className="w-full h-64 md:h-full bg-gradient-to-br from-gray-100 to-gray-200 flex flex-col items-center justify-center">
                  <Camera size={64} className="text-gray-400 mb-3" />
                  <p className="text-gray-500 font-medium">No Image Available</p>
                </div>
              )}

              {/* Status Badge */}
              <div
                className={`absolute top-6 right-6 ${getStatusColor(pet.status)} px-4 py-2 rounded-full text-sm font-bold backdrop-blur-sm`}
              >
                {pet.status}
              </div>
            </div>

            {/* Pet Details Section */}
            <div className="md:w-3/5 p-8">
              <div className="mb-8">
                <h1 className="text-4xl font-bold text-gray-900 mb-2">{pet.name}</h1>
                <p className="text-gray-500 flex items-center text-lg">
                  <Calendar size={18} className="mr-2" />
                  {getDateLabel()}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-4 rounded-xl border border-emerald-200">
                  <p className="text-xs text-emerald-700 uppercase tracking-wide font-bold mb-2">Type</p>
                  <p className="font-bold text-gray-900 text-lg">{pet.type || "-"}</p>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
                  <p className="text-xs text-blue-700 uppercase tracking-wide font-bold mb-2">Gender</p>
                  <p className="font-bold text-gray-900 text-lg">{pet.gender || "-"}</p>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl border border-purple-200">
                  <p className="text-xs text-purple-700 uppercase tracking-wide font-bold mb-2">Status</p>
                  <p className="font-bold text-gray-900 text-lg">{pet.status || "-"}</p>
                </div>
              </div>

              {pet.description && (
                <div className="mb-8">
                  <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center">
                    <div className="bg-emerald-100 p-2 rounded-lg mr-3">
                      <Info size={20} className="text-emerald-600" />
                    </div>
                    Description
                  </h2>
                  <p className="text-gray-700 bg-gradient-to-br from-gray-50 to-gray-100 p-5 rounded-xl border border-gray-200 leading-relaxed">
                    {pet.description}
                  </p>
                </div>
              )}

              {pet.address && (
                <div className="mb-8">
                  <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center">
                    <div className="bg-blue-100 p-2 rounded-lg mr-3">
                      <MapPin size={20} className="text-blue-600" />
                    </div>
                    {getLocationLabel()}
                  </h2>
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-5 rounded-xl border border-blue-200 flex items-start">
                    <MapPin size={20} className="mr-3 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700 font-medium">{pet.address}</span>
                  </div>
                </div>
              )}

              {/* Device Info Display */}
              {deviceInfo ? (
                <div className="mb-8">
                  <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center">
                    <div className="bg-emerald-100 p-2 rounded-lg mr-3">
                      <MapPin size={20} className="text-emerald-600" />
                    </div>
                    Paired Device
                  </h2>
                  <div className="bg-gradient-to-br from-emerald-50 to-green-50 p-5 rounded-xl border-2 border-emerald-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-bold text-emerald-900 text-lg">Device: {deviceInfo.unique_code}</p>
                        <p className="text-sm text-emerald-700 font-medium mt-1">
                          Status: {deviceInfo.is_active ? "Active" : "Inactive"} •
                          {deviceInfo.is_online ? " Online" : " Offline"}
                        </p>
                        {deviceInfo.paired_at && (
                          <p className="text-xs text-emerald-600 mt-2">
                            Paired: {new Date(deviceInfo.paired_at).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={handleUpdatePairing}
                          className="px-4 py-2 bg-emerald-600 text-white text-sm font-semibold rounded-lg hover:bg-emerald-700 transition-all shadow-md"
                        >
                          Update
                        </button>

                        {/* Device Activation Controls for Safe at Home pets */}
                        {pet.status === "Safe at Home" && (
                          <div className="flex space-x-1">
                            <button
                              onClick={() => handleToggleDeviceActivation(true)}
                              disabled={deviceActivationLoading || deviceInfo.is_active}
                              className={`px-3 py-2 text-xs font-bold rounded-lg transition-all ${
                                deviceInfo.is_active
                                  ? "bg-green-100 text-green-800 cursor-not-allowed"
                                  : "bg-green-600 text-white hover:bg-green-700 shadow-md"
                              } disabled:opacity-50`}
                            >
                              {deviceActivationLoading && !deviceInfo.is_active ? "..." : "ON"}
                            </button>
                            <button
                              onClick={() => handleToggleDeviceActivation(false)}
                              disabled={deviceActivationLoading || !deviceInfo.is_active}
                              className={`px-3 py-2 text-xs font-bold rounded-lg transition-all ${
                                !deviceInfo.is_active
                                  ? "bg-red-100 text-red-800 cursor-not-allowed"
                                  : "bg-red-600 text-white hover:bg-red-700 shadow-md"
                              } disabled:opacity-50`}
                            >
                              {deviceActivationLoading && deviceInfo.is_active ? "..." : "OFF"}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mb-8">
                  <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center">
                    <div className="bg-gray-100 p-2 rounded-lg mr-3">
                      <MapPin size={20} className="text-gray-600" />
                    </div>
                    Paired Device
                  </h2>
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-5 rounded-xl border-2 border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-700 font-medium">No device paired with this pet</p>
                      </div>
                      <button
                        onClick={() => setShowPairModal(true)}
                        className="px-5 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-sm font-semibold rounded-lg hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-lg shadow-emerald-200"
                      >
                        Pair Device
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 mb-8">
                {/* Safe at Home or Reunited status */}
                {(pet.status === "Safe at Home" || pet.status === "Reunited") && (
                  <>
                    <button
                      onClick={handleReportAsLost}
                      className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-red-50 to-red-100 text-red-700 rounded-xl hover:from-red-100 hover:to-red-200 transition-all border-2 border-red-200 font-semibold shadow-sm"
                    >
                      <AlertTriangle size={18} />
                      Report as Lost
                    </button>
                    <button
                      onClick={() => router.push(`/edit_pet_details/${pet.id}`)}
                      className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-lg shadow-emerald-200 font-semibold"
                    >
                      <Edit size={18} />
                      Edit Details
                    </button>
                  </>
                )}

                {/* Status-specific buttons */}
                {pet.status === "Lost" && (
                  <button
                    onClick={handleMarkFound}
                    className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-green-50 to-green-100 text-green-700 rounded-xl hover:from-green-100 hover:to-green-200 transition-all border-2 border-green-200 font-semibold shadow-sm"
                  >
                    <Home size={18} />
                    Mark as Found
                  </button>
                )}

                {pet.status === "Pet I Found" && (
                  <button
                    onClick={handleMarkReunited}
                    className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-purple-50 to-purple-100 text-purple-700 rounded-xl hover:from-purple-100 hover:to-purple-200 transition-all border-2 border-purple-200 font-semibold shadow-sm"
                  >
                    <CheckCircle size={18} />
                    Mark as Reunited
                  </button>
                )}
              </div>

              {/* Publication Status Card */}
              <div className="bg-gradient-to-br from-white to-gray-50 p-6 rounded-2xl shadow-md border-2 border-gray-200 mb-8">
                <h3 className="text-gray-900 font-bold text-xl mb-5 flex items-center">
                  <div className="bg-emerald-100 p-2 rounded-lg mr-3">
                    <Upload size={20} className="text-emerald-600" />
                  </div>
                  Publication Status
                </h3>

                {pet.is_published ? (
                  <>
                    <div className="flex flex-wrap items-center gap-4 mb-4">
                      <button
                        onClick={handleUnpublish}
                        className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-red-50 to-red-100 text-red-600 rounded-xl hover:from-red-100 hover:to-red-200 transition-all border-2 border-red-200 font-semibold shadow-sm"
                      >
                        <XCircle size={18} />
                        Unpublish
                      </button>

                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-gray-600">Admin:</span>
                        <span
                          className={`px-4 py-2 rounded-full text-sm font-bold shadow-sm ${
                            pet.admin_approved
                              ? "bg-gradient-to-r from-green-500 to-green-600 text-white"
                              : "bg-gradient-to-r from-yellow-400 to-yellow-500 text-white"
                          }`}
                        >
                          {pet.admin_approved ? "Approved" : "Pending Review"}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 font-medium">
                      {pet.admin_approved ? "This listing is publicly visible" : "Under admin review (24-48 hours)"}
                    </p>
                  </>
                ) : (
                  <button
                    onClick={handleTogglePublish}
                    className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-lg shadow-emerald-200 font-semibold"
                  >
                    <Upload size={18} />
                    Publish This Pet
                  </button>
                )}
              </div>

              {/* Advanced Actions */}
              <div className="border-t-2 border-gray-200 pt-8 flex flex-wrap gap-3">
                <button
                  onClick={() => router.push(`/edit_pet_details/${pet.id}`)}
                  className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-lg shadow-emerald-200 font-semibold"
                >
                  <Edit size={18} />
                  Edit pet details
                </button>

                {pet.status === "Lost" && (
                  <button
                    onClick={() => {
                      // Create a temporary link to the flyer page
                      const link = document.createElement("a")
                      link.href = `/pet_flyer?id=${pet.id}`
                      link.target = "_blank"
                      link.rel = "noopener noreferrer"
                      link.click()
                    }}
                    className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 rounded-xl hover:from-blue-100 hover:to-blue-200 transition-all border-2 border-blue-200 font-semibold shadow-sm"
                  >
                    <FileText size={18} />
                    Generate Pet Flyer
                  </button>
                )}

                <button
                  onClick={handleRemovePet}
                  className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-red-50 to-red-100 text-red-700 rounded-xl hover:from-red-100 hover:to-red-200 transition-all border-2 border-red-200 font-semibold shadow-sm"
                >
                  <Trash2 size={18} />
                  Remove Pet
                </button>

                {/* Conditional Device Buttons */}
                {shouldShowPairButton() && (
                  <button
                    onClick={() => setShowPairModal(true)}
                    className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-emerald-50 to-emerald-100 text-emerald-700 rounded-xl hover:from-emerald-100 hover:to-emerald-200 transition-all border-2 border-emerald-200 font-semibold shadow-sm"
                  >
                    <MapPin size={18} />
                    Pair with Pet Tracker
                  </button>
                )}

                {shouldShowLocationButton() && (
                  <button
                    onClick={handleViewLocation}
                    className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 rounded-xl hover:from-blue-100 hover:to-blue-200 transition-all border-2 border-blue-200 font-semibold shadow-sm"
                  >
                    <Navigation size={18} />
                    View Current Pet Location
                  </button>
                )}

                {/* Conditionally render Fingerprint and Find Similar buttons */}
                {!shouldHideAdvancedButtons() && (
                  <>
                    {/* Fingerprint Button - Hidden for Rehome Pet and Safe at Home */}
                    <button
                      onClick={handleGenerateFingerprint}
                      disabled={pet?.has_generated_fingerprint}
                      className={`flex items-center gap-2 px-5 py-3 rounded-xl transition-all font-semibold shadow-sm ${
                        pet?.has_generated_fingerprint
                          ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                          : "bg-gradient-to-r from-purple-50 to-purple-100 text-purple-700 hover:from-purple-100 hover:to-purple-200 border-2 border-purple-200"
                      }`}
                    >
                      <FileText size={18} />
                      {pet?.has_generated_fingerprint ? "Fingerprint Generated" : "Generate Fingerprint"}
                    </button>

                    {/* Find Similar Pets Button - Hidden for Rehome Pet and Safe at Home */}
                    <button
                      onClick={() => router.push(`/pet_profile/${id}/similar`)}
                      className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-emerald-50 to-emerald-100 text-emerald-700 rounded-xl hover:from-emerald-100 hover:to-emerald-200 transition-all border-2 border-emerald-200 font-semibold shadow-sm"
                    >
                      <Search size={18} />
                      Find Similar Pets
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
      <Toaster
        position="bottom-right"
        toastOptions={{
          success: {
            style: {
              background: "#10b981",
              color: "white",
              fontWeight: "600",
            },
          },
          error: {
            style: {
              background: "#ef4444",
              color: "white",
              fontWeight: "600",
            },
          },
        }}
      />
    </div>
  )
}


// Pet profile page component will go here
// //frontend\pages\pet_profile\[id].js

// "use client"

// import { useRouter } from "next/router"
// import { useState, useEffect } from "react"
// import {
//   MapPin,
//   Edit,
//   FileText,
//   Trash2,
//   CheckCircle,
//   Search,
//   Home,
//   AlertTriangle,
//   Camera,
//   Calendar,
//   Info,
//   Navigation,
// } from "lucide-react"
// import toast, { Toaster } from "react-hot-toast"
// import Navbar from "../../components/Navbar"
// import Footer from "../../components/Footer"
// import {
//   fetchPetDetails,
//   deletePet,
//   updatePetStatus,
//   togglePublishPet,
//   pairDeviceWithPet,
//   updatePairDeviceWithPet,
//   getPetDeviceInfo,
//   getPetCurrentLocation,
//   toggleDeviceActivation,
// } from "../../utils/api"
// import { XCircle, Upload } from "lucide-react"

// // Add these constants after the imports
// const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://fkpimtcxncgwtdsfyrjb.supabase.co"
// const PET_IMAGES_BUCKET = "pet-images"

// function getPetImageUrl(imageName) {
//   if (!imageName) return "https://via.placeholder.com/100"
//   // Handle the format "1/main.jpg" -> "https://fkpimtcxncgwtdsfyrjb.supabase.co/storage/v1/object/public/pet-images/1/main.jpg"
//   return `${SUPABASE_URL}/storage/v1/object/public/${PET_IMAGES_BUCKET}/${imageName}`
// }

// export default function PetProfile() {
//   const router = useRouter()
//   const { id } = router.query
//   const [pet, setPet] = useState(null)
//   const [loading, setLoading] = useState(true)
//   const [error, setError] = useState(null)
//   const [userId, setUserId] = useState(null)
//   const [showMissingImagesModal, setShowMissingImagesModal] = useState(false)
//   const [showPairModal, setShowPairModal] = useState(false)
//   const [showLocationModal, setShowLocationModal] = useState(false)
//   const [uniqueCode, setUniqueCode] = useState("")
//   const [pairingLoading, setPairingLoading] = useState(false)
//   const [deviceInfo, setDeviceInfo] = useState(null)
//   const [currentLocation, setCurrentLocation] = useState(null)
//   const [locationLoading, setLocationLoading] = useState(false)
//   const [isUpdateMode, setIsUpdateMode] = useState(false)
//   const [deviceActivationLoading, setDeviceActivationLoading] = useState(false)

//   useEffect(() => {
//     const token = sessionStorage.getItem("auth_token")
//     const userId = sessionStorage.getItem("user_id")
//     const petStatus = localStorage.getItem("petStatus")

//     if (!token || !userId) {
//       router.push("/login")
//     } else {
//       setUserId(userId)
//     }

//     if (id) {
//       const loadPet = async () => {
//         try {
//           const data = await fetchPetDetails(id)
//           if (petStatus) {
//             data.status = petStatus
//           }
//           setPet(data)

//           // Check if pet has paired device
//           try {
//             const deviceData = await getPetDeviceInfo(id)
//             setDeviceInfo(deviceData)
//           } catch (error) {
//             // Pet doesn't have paired device, that's okay
//             setDeviceInfo(null)
//           }
//         } catch (error) {
//           console.error("Failed to load pet:", error)
//           setError(error.message)
//         } finally {
//           setLoading(false)
//         }
//       }
//       loadPet()
//     }
//   }, [id, router])

//   const getDateLabel = () => {
//     if (!pet) return ""

//     // Remove time from date display
//     const dateOnly = pet.date ? pet.date.split("T")[0] : pet.date

//     switch (pet.status) {
//       case "Pet I Found":
//         return `Reported found ${dateOnly}`
//       case "Lost":
//         return `Reported lost ${dateOnly}`
//       case "Safe at Home":
//       case "Rehome Pet":
//       default:
//         return `Birthdate: ${dateOnly}`
//     }
//   }

//   const getLocationLabel = () => {
//     if (!pet) return "Location"

//     switch (pet.status) {
//       case "Lost":
//         return "Last Seen Location"
//       case "Pet I Found":
//         return "Found Location"
//       case "Safe at Home":
//         return "Home Location"
//       case "Rehome Pet":
//         return "Current Location"
//       default:
//         return "Location"
//     }
//   }

//   const handleMarkReunited = async () => {
//     try {
//       await toast.promise(updatePetStatus(id, "Reunited"), {
//         loading: "Updating...",
//         success: () => {
//           setPet((prev) => ({ ...prev, status: "Reunited" }))
//           return "Pet marked as reunited!"
//         },
//         error: "Failed to update",
//       })
//     } catch (error) {
//       console.error(error)
//     }
//   }

//   const handleMarkFound = async () => {
//     try {
//       await toast.promise(updatePetStatus(id, "Safe at Home"), {
//         loading: "Updating...",
//         success: () => {
//           setPet((prev) => ({ ...prev, status: "Safe at Home" }))
//           return "Pet marked as found!"
//         },
//         error: "Failed to update",
//       })
//     } catch (error) {
//       console.error(error)
//     }
//   }

//   const handleTogglePublish = async () => {
//     try {
//       const result = await togglePublishPet(pet.id, true)
//       setPet((prev) => ({
//         ...prev,
//         is_published: result.is_published,
//         admin_approved: false, // Reset approval when publishing
//       }))
//       toast.success(result.message)
//     } catch (error) {
//       toast.error(error.message)
//     }
//   }

//   const handleUnpublish = async () => {
//     try {
//       const result = await togglePublishPet(pet.id, false) // false means unpublish
//       setPet((prev) => ({
//         ...prev,
//         is_published: false,
//         admin_approved: false, // Ensure UI updates immediately
//       }))
//       toast.success(result.message)
//     } catch (error) {
//       toast.error(error.message)
//       console.error("Unpublish failed:", error)
//     }
//   }

//   const handleReportAsLost = async () => {
//     try {
//       const result = await updatePetStatus(pet.id, "Lost")
//       setPet((prev) => ({ ...prev, status: "Lost", is_published: false }))
//       toast.success("Pet reported as lost")
//     } catch (error) {
//       toast.error(error.message)
//     }
//   }

//   const handleRemovePet = async () => {
//     if (confirm("Are you sure you want to remove this pet? This action cannot be undone.")) {
//       try {
//         const token = sessionStorage.getItem("auth_token")
//         if (!token) {
//           throw new Error("Authentication required")
//         }

//         await toast.promise(deletePet(id, token), {
//           loading: "Removing pet...",
//           success: "Pet removed successfully",
//           error: (err) => err.message || "Failed to remove pet",
//         })

//         router.push("/pet_dashboard")
//       } catch (error) {
//         console.error("Delete failed:", error)
//       }
//     }
//   }

//   // Add this function before any handler that uses it
//   const checkRequiredImages = () => {
//     if (!pet || !pet.additional_images) return false

//     const requiredImages = ["fur.jpg", "face.jpg", "side.jpg"]
//     const currentImages = pet.additional_images || []

//     return requiredImages.every((img) => currentImages.includes(img))
//   }

//   const handleGenerateFingerprint = async () => {
//     try {
//       if (!pet) {
//         throw new Error("Pet data not loaded")
//       }

//       // Check if pet status allows fingerprint generation
//       const allowedStatuses = ["Lost", "Pet I Found"]
//       if (!allowedStatuses.includes(pet.status)) {
//         toast.error(`Fingerprint generation is only available for pets with 'Lost' or 'Pet I Found' status. Current status: ${pet.status}`)
//         return
//       }

//       // Check if pet type allows fingerprint generation
//       const allowedTypes = ["Dog", "Cat", "dog", "cat"]
//       if (!allowedTypes.includes(pet.type)) {
//         toast.error(`Fingerprint generation is only available for dogs and cats. Current type: ${pet.type}`)
//         return
//       }

//       if (!checkRequiredImages()) {
//         setShowMissingImagesModal(true)
//         return
//       }

//       const token = sessionStorage.getItem("auth_token")
//       if (!token) {
//         throw new Error("Authentication required")
//       }

//       const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || "https://newback-production-a0cc.up.railway.app"}/api/pets/${pet.id}/generate-fingerprint`

//       const response = await fetch(apiUrl, {
//         method: "POST",
//         headers: {
//           Authorization: `Bearer ${token}`,
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           status: pet.status, // Send the status as stored in database
//         }),
//       })

//       if (!response.ok) {
//         const errorData = await response.json().catch(() => ({}))
//         throw new Error(errorData.detail || `HTTP error! status: ${response.status}`)
//       }

//       const data = await response.json()
//       toast.success("Fingerprint generated successfully!")

//       // Refresh pet data to show the fingerprint status
//       const updatedPet = await fetchPetDetails(id)
//       setPet(updatedPet)
//     } catch (error) {
//       console.error("Fingerprint generation failed:", error)
//       toast.error(error.message || "Failed to generate fingerprint")
//     }
//   }

//   const handlePairDevice = async () => {
//     if (!uniqueCode.trim()) {
//       toast.error("Please enter a unique code")
//       return
//     }

//     setPairingLoading(true)
//     try {
//       let result
//       if (isUpdateMode) {
//         result = await updatePairDeviceWithPet(uniqueCode.trim(), pet.id, userId)
//       } else {
//         result = await pairDeviceWithPet(uniqueCode.trim(), pet.id, userId)
//       }

//       toast.success(result.message)
//       setShowPairModal(false)
//       setUniqueCode("")
//       setIsUpdateMode(false)

//       // Refresh device info
//       try {
//         const deviceData = await getPetDeviceInfo(id)
//         setDeviceInfo(deviceData)
//       } catch (error) {
//         setDeviceInfo(null)
//       }

//       // Optionally refresh pet data
//       const updatedPet = await fetchPetDetails(id)
//       setPet(updatedPet)
//     } catch (error) {
//       toast.error(error.message)
//     } finally {
//       setPairingLoading(false)
//     }
//   }

//   const handleViewLocation = async () => {
//     setLocationLoading(true)
//     setShowLocationModal(true)

//     try {
//       const locationData = await getPetCurrentLocation(pet.id)
//       setCurrentLocation(locationData)
//     } catch (error) {
//       toast.error(error.message)
//       setCurrentLocation(null)
//     } finally {
//       setLocationLoading(false)
//     }
//   }

//   const handleUpdatePairing = () => {
//     setIsUpdateMode(true)
//     setUniqueCode(deviceInfo?.unique_code || "")
//     setShowPairModal(true)
//   }

//   const handleToggleDeviceActivation = async (isActive) => {
//     setDeviceActivationLoading(true)
//     try {
//       const result = await toggleDeviceActivation(pet.id, isActive)
//       toast.success(result.message)

//       // Update device info state
//       setDeviceInfo((prev) => ({
//         ...prev,
//         is_active: isActive,
//       }))

//       // Refresh device info from server
//       try {
//         const deviceData = await getPetDeviceInfo(id)
//         setDeviceInfo(deviceData)
//       } catch (error) {
//         console.error("Failed to refresh device info:", error)
//       }
//     } catch (error) {
//       toast.error(error.message)
//     } finally {
//       setDeviceActivationLoading(false)
//     }
//   }

//   // Check if buttons should be hidden based on pet status
//   const shouldHideAdvancedButtons = () => {
//     return pet?.status === "Rehome Pet" || pet?.status === "Safe at Home"
//   }

//   // Check if should show pair button
//   const shouldShowPairButton = () => {
//     return !deviceInfo && pet?.status === "Lost"
//   }

//   // Check if should show location button
//   const shouldShowLocationButton = () => {
//     return deviceInfo && pet?.status === "Lost"
//   }

//   // Loading state with a modern spinner
//   if (loading)
//     return (
//       <div className="fixed inset-0 bg-white flex items-center justify-center z-50">
//         <div className="flex flex-col items-center">
//           <div className="relative">
//             <div className="w-16 h-16 border-4 border-emerald-200 rounded-full"></div>
//             <div className="absolute top-0 left-0 w-16 h-16 border-4 border-emerald-500 rounded-full animate-spin border-t-transparent"></div>
//           </div>
//           <p className="mt-4 text-gray-600">Loading pet profile...</p>
//         </div>
//       </div>
//     )

//   if (error)
//     return (
//       <div className="container mx-auto p-6 text-center">
//         <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
//           <div className="flex items-center">
//             <AlertTriangle className="h-6 w-6 text-red-500 mr-3" />
//             <p className="text-red-700">Error: {error}</p>
//           </div>
//         </div>
//       </div>
//     )

//   if (!pet)
//     return (
//       <div className="container mx-auto p-6 text-center">
//         <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
//           <p className="text-yellow-700">Pet not found</p>
//         </div>
//       </div>
//     )

//   // Get status color
//   const getStatusColor = (status) => {
//     switch (status) {
//       case "Lost":
//         return "bg-red-100 text-red-700"
//       case "Pet I Found":
//         return "bg-blue-100 text-blue-700"
//       case "Safe at Home":
//         return "bg-green-100 text-green-700"
//       case "Reunited":
//         return "bg-purple-100 text-purple-700"
//       case "Rehome Pet":
//         return "bg-orange-100 text-orange-700"
//       default:
//         return "bg-gray-100 text-gray-700"
//     }
//   }

//   return (
//     <div className="bg-gray-50 min-h-screen">
//       <Navbar />

//       {pet.status === "Lost" && (
//         <div className="bg-red-50 border-b border-red-100 py-3">
//           <div className="container mx-auto px-4 flex items-center justify-between">
//             <p className="text-red-700 flex items-center">
//               <AlertTriangle size={18} className="mr-2" />
//               You have a lost pet.
//             </p>
//             <a href="/search" className="text-red-700 font-medium hover:underline flex items-center">
//               <Search size={16} className="mr-1" />
//               Search for similar pets
//             </a>
//           </div>
//         </div>
//       )}

//       {/* Missing Images Modal */}
//       {showMissingImagesModal && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
//           <div className="bg-white p-6 rounded-xl max-w-md w-full shadow-xl">
//             <div className="flex items-center mb-4 text-amber-600">
//               <Camera size={24} className="mr-3" />
//               <h3 className="text-lg font-medium">Missing Images</h3>
//             </div>
//             <p className="mb-6 text-gray-600">
//               Please upload all required additional images (fur.jpg, face.jpg, side.jpg) before generating a
//               fingerprint.
//             </p>
//             <div className="flex justify-end space-x-3">
//               <button
//                 onClick={() => setShowMissingImagesModal(false)}
//                 className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors text-gray-700"
//               >
//                 Close
//               </button>
//               <button
//                 onClick={() => {
//                   setShowMissingImagesModal(false)
//                   router.push(`/edit_pet_details/${pet.id}`)
//                 }}
//                 className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors shadow-sm"
//               >
//                 Upload Images
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Pair Device Modal */}
//       {showPairModal && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
//           <div className="bg-white p-6 rounded-xl max-w-md w-full shadow-xl">
//             <div className="flex items-center mb-4 text-emerald-600">
//               <MapPin size={24} className="mr-3" />
//               <h3 className="text-lg font-medium">{isUpdateMode ? "Update Pet Tracker" : "Pair Pet Tracker"}</h3>
//             </div>
//             <p className="mb-4 text-gray-600">
//               {isUpdateMode
//                 ? `Update the tracker device for ${pet.name}.`
//                 : `Enter the unique code of your pet tracker device to pair it with ${pet.name}.`}
//             </p>
//             <div className="mb-6">
//               <label htmlFor="uniqueCode" className="block text-sm font-medium text-gray-700 mb-2">
//                 Device Unique Code
//               </label>
//               <input
//                 type="text"
//                 id="uniqueCode"
//                 value={uniqueCode}
//                 onChange={(e) => setUniqueCode(e.target.value)}
//                 placeholder="Enter unique code (e.g., LILYGO-7A83-B2)"
//                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
//                 disabled={pairingLoading}
//               />
//             </div>
//             <div className="flex justify-end space-x-3">
//               <button
//                 onClick={() => {
//                   setShowPairModal(false)
//                   setUniqueCode("")
//                   setIsUpdateMode(false)
//                 }}
//                 disabled={pairingLoading}
//                 className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors text-gray-700 disabled:opacity-50"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={handlePairDevice}
//                 disabled={pairingLoading || !uniqueCode.trim()}
//                 className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
//               >
//                 {pairingLoading
//                   ? isUpdateMode
//                     ? "Updating..."
//                     : "Pairing..."
//                   : isUpdateMode
//                     ? "Update Device"
//                     : "Pair Device"}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Location Modal */}
//       {showLocationModal && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
//           <div className="bg-white p-6 rounded-xl max-w-md w-full shadow-xl">
//             <div className="flex items-center mb-4 text-blue-600">
//               <Navigation size={24} className="mr-3" />
//               <h3 className="text-lg font-medium">Current Pet Location</h3>
//             </div>

//             {locationLoading ? (
//               <div className="flex items-center justify-center py-8">
//                 <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
//                 <span className="ml-2 text-gray-600">Loading location...</span>
//               </div>
//             ) : currentLocation ? (
//               <div className="space-y-4">
//                 <div className="bg-gray-50 p-4 rounded-lg">
//                   <p className="text-sm text-gray-600 mb-2">Latest Location:</p>
//                   <p className="font-medium">Latitude: {currentLocation.latitude}</p>
//                   <p className="font-medium">Longitude: {currentLocation.longitude}</p>
//                   <p className="text-sm text-gray-500 mt-2">
//                     Last updated: {new Date(currentLocation.timestamp).toLocaleString()}
//                   </p>
//                 </div>
//                 <div className="flex space-x-2">
//                   <button
//                     onClick={() => {
//                       const url = `https://www.google.com/maps?q=${currentLocation.latitude},${currentLocation.longitude}`
//                       window.open(url, "_blank")
//                     }}
//                     className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
//                   >
//                     View on Google Maps
//                   </button>
//                 </div>
//               </div>
//             ) : (
//               <div className="text-center py-8">
//                 <MapPin size={48} className="mx-auto text-gray-400 mb-4" />
//                 <p className="text-gray-600">No location data available</p>
//                 <p className="text-sm text-gray-500 mt-2">
//                   The device may be offline or hasn't sent location data yet.
//                 </p>
//               </div>
//             )}

//             <div className="flex justify-end mt-6">
//               <button
//                 onClick={() => {
//                   setShowLocationModal(false)
//                   setCurrentLocation(null)
//                 }}
//                 className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors text-gray-700"
//               >
//                 Close
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       <main className="container mx-auto px-4 py-8">
//         <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
//           <div className="md:flex">
//             {/* Pet Image Section */}
//             <div className="md:w-2/5 relative">
//               {pet.image ? (
//                 <img
//                   src={getPetImageUrl(pet.image) || "/placeholder.svg"}
//                   alt={pet.name}
//                   className="w-full h-full object-cover aspect-square md:aspect-auto md:h-full"
//                   onError={(e) => {
//                     e.target.onerror = null
//                     e.target.src = "https://via.placeholder.com/400"
//                   }}
//                 />
//               ) : (
//                 <div className="w-full h-64 md:h-full bg-gray-100 flex items-center justify-center">
//                   <Camera size={48} className="text-gray-400" />
//                   <p className="text-gray-500 ml-2">No Image Available</p>
//                 </div>
//               )}

//               {/* Status Badge */}
//               <div
//                 className={`absolute top-4 right-4 ${getStatusColor(pet.status)} px-3 py-1 rounded-full text-sm font-medium shadow-sm`}
//               >
//                 {pet.status}
//               </div>
//             </div>

//             {/* Pet Details Section */}
//             <div className="md:w-3/5 p-6">
//               <div className="mb-6">
//                 <h1 className="text-3xl font-bold text-gray-800 mb-1">{pet.name}</h1>
//                 <p className="text-gray-500 flex items-center">
//                   <Calendar size={16} className="mr-2" />
//                   {getDateLabel()}
//                 </p>
//               </div>

//               <div className="grid grid-cols-3 gap-4 mb-6">
//                 <div className="bg-gray-50 p-3 rounded-lg">
//                   <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Type</p>
//                   <p className="font-medium text-gray-800">{pet.type || "-"}</p>
//                 </div>
//                 <div className="bg-gray-50 p-3 rounded-lg">
//                   <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Gender</p>
//                   <p className="font-medium text-gray-800">{pet.gender || "-"}</p>
//                 </div>
//                 <div className="bg-gray-50 p-3 rounded-lg">
//                   <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Status</p>
//                   <p className="font-medium text-gray-800">{pet.status || "-"}</p>
//                 </div>
//               </div>

//               {pet.description && (
//                 <div className="mb-6">
//                   <h2 className="text-lg font-semibold text-gray-800 mb-2 flex items-center">
//                     <Info size={18} className="mr-2 text-emerald-500" />
//                     Description
//                   </h2>
//                   <p className="text-gray-600 bg-gray-50 p-4 rounded-lg border border-gray-100">{pet.description}</p>
//                 </div>
//               )}

//               {pet.address && (
//                 <div className="mb-6">
//                   <h2 className="text-lg font-semibold text-gray-800 mb-2 flex items-center">
//                     <MapPin size={18} className="mr-2 text-emerald-500" />
//                     {getLocationLabel()}
//                   </h2>
//                   <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 flex items-start">
//                     <MapPin size={18} className="mr-2 text-gray-500 mt-0.5 flex-shrink-0" />
//                     <span className="text-gray-600">{pet.address}</span>
//                   </div>
//                 </div>
//               )}

//               {/* Device Info Display */}
//               {deviceInfo ? (
//                 <div className="mb-6">
//                   <h2 className="text-lg font-semibold text-gray-800 mb-2 flex items-center">
//                     <MapPin size={18} className="mr-2 text-emerald-500" />
//                     Paired Device
//                   </h2>
//                   <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-100">
//                     <div className="flex items-center justify-between">
//                       <div>
//                         <p className="font-medium text-emerald-800">Device: {deviceInfo.unique_code}</p>
//                         <p className="text-sm text-emerald-600">
//                           Status: {deviceInfo.is_active ? "Active" : "Inactive"} •
//                           {deviceInfo.is_online ? " Online" : " Offline"}
//                         </p>
//                         {deviceInfo.paired_at && (
//                           <p className="text-xs text-emerald-500 mt-1">
//                             Paired: {new Date(deviceInfo.paired_at).toLocaleDateString()}
//                           </p>
//                         )}
//                       </div>
//                       <div className="flex space-x-2">
//                         <button
//                           onClick={handleUpdatePairing}
//                           className="px-3 py-1 bg-emerald-600 text-white text-sm rounded hover:bg-emerald-700 transition-colors"
//                         >
//                           Update
//                         </button>

//                         {/* Device Activation Controls for Safe at Home pets */}
//                         {pet.status === "Safe at Home" && (
//                           <div className="flex space-x-1">
//                             <button
//                               onClick={() => handleToggleDeviceActivation(true)}
//                               disabled={deviceActivationLoading || deviceInfo.is_active}
//                               className={`px-2 py-1 text-xs rounded transition-colors ${
//                                 deviceInfo.is_active
//                                   ? "bg-green-100 text-green-800 cursor-not-allowed"
//                                   : "bg-green-600 text-white hover:bg-green-700"
//                               } disabled:opacity-50`}
//                             >
//                               {deviceActivationLoading && !deviceInfo.is_active ? "..." : "ON"}
//                             </button>
//                             <button
//                               onClick={() => handleToggleDeviceActivation(false)}
//                               disabled={deviceActivationLoading || !deviceInfo.is_active}
//                               className={`px-2 py-1 text-xs rounded transition-colors ${
//                                 !deviceInfo.is_active
//                                   ? "bg-red-100 text-red-800 cursor-not-allowed"
//                                   : "bg-red-600 text-white hover:bg-red-700"
//                               } disabled:opacity-50`}
//                             >
//                               {deviceActivationLoading && deviceInfo.is_active ? "..." : "OFF"}
//                             </button>
//                           </div>
//                         )}
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               ) : (
//                 <div className="mb-6">
//                   <h2 className="text-lg font-semibold text-gray-800 mb-2 flex items-center">
//                     <MapPin size={18} className="mr-2 text-emerald-500" />
//                     Paired Device
//                   </h2>
//                   <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
//                     <div className="flex items-center justify-between">
//                       <div>
//                         <p className="text-gray-600">No device paired with this pet</p>
//                       </div>
//                       <button
//                         onClick={() => setShowPairModal(true)}
//                         className="px-4 py-2 bg-emerald-600 text-white text-sm rounded hover:bg-emerald-700 transition-colors"
//                       >
//                         Pair Device
//                       </button>
//                     </div>
//                   </div>
//                 </div>
//               )}

//               {/* Action Buttons */}
//               <div className="flex flex-wrap gap-3 mb-6">
//                 {/* Safe at Home or Reunited status */}
//                 {(pet.status === "Safe at Home" || pet.status === "Reunited") && (
//                   <>
//                     <button
//                       onClick={handleReportAsLost}
//                       className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors border border-red-100"
//                     >
//                       <AlertTriangle size={16} />
//                       Report as Lost
//                     </button>
//                     <button
//                       onClick={() => router.push(`/edit_pet_details/${pet.id}`)}
//                       className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition-colors border border-emerald-100"
//                     >
//                       <Edit size={16} />
//                       Edit Details
//                     </button>
//                   </>
//                 )}

//                 {/* Status-specific buttons */}
//                 {pet.status === "Lost" && (
//                   <button
//                     onClick={handleMarkFound}
//                     className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors border border-green-100"
//                   >
//                     <Home size={16} />
//                     Mark as Found
//                   </button>
//                 )}

//                 {pet.status === "Pet I Found" && (
//                   <button
//                     onClick={handleMarkReunited}
//                     className="flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors border border-purple-100"
//                   >
//                     <CheckCircle size={16} />
//                     Mark as Reunited
//                   </button>
//                 )}
//               </div>

//               {/* Publication Status Card */}
//               <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 mb-6">
//                 <h3 className="text-black font-medium text-lg mb-4 flex items-center">
//                   <Upload size={18} className="text-black mr-2 text-emerald-500" />
//                   Publication Status
//                 </h3>

//                 {pet.is_published ? (
//                   <>
//                     <div className="flex flex-wrap items-center gap-4 mb-3">
//                       <button
//                         onClick={handleUnpublish}
//                         className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors border border-red-200"
//                       >
//                         <XCircle size={16} />
//                         Unpublish
//                       </button>

//                       <div className="flex items-center gap-2">
//                         <span className="text-sm font-medium text-gray-500">Admin:</span>
//                         <span
//                           className={`px-3 py-1 rounded-full text-xs font-medium ${
//                             pet.admin_approved ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
//                           }`}
//                         >
//                           {pet.admin_approved ? "Approved" : "Pending Review"}
//                         </span>
//                       </div>
//                     </div>
//                     <p className="text-sm text-gray-600">
//                       {pet.admin_approved ? "This listing is publicly visible" : "Under admin review (24-48 hours)"}
//                     </p>
//                   </>
//                 ) : (
//                   <button
//                     onClick={handleTogglePublish}
//                     className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-colors border border-emerald-200"
//                   >
//                     <Upload size={16} />
//                     Publish This Pet
//                   </button>
//                 )}
//               </div>

//               {/* Advanced Actions */}
//               <div className="border-t border-gray-100 pt-6 flex flex-wrap gap-3">
//                 <button
//                   onClick={() => router.push(`/edit_pet_details/${pet.id}`)}
//                   className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
//                 >
//                   <Edit size={16} />
//                   Edit pet details
//                 </button>

//                 {pet.status === "Lost" && (
//                   <button
//                     onClick={() => {
//                       // Create a temporary link to the flyer page
//                       const link = document.createElement("a")
//                       link.href = `/pet_flyer?id=${pet.id}`
//                       link.target = "_blank"
//                       link.rel = "noopener noreferrer"
//                       link.click()
//                     }}
//                     className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
//                   >
//                     <FileText size={16} />
//                     Generate Pet Flyer
//                   </button>
//                 )}

//                 <button
//                   onClick={handleRemovePet}
//                   className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors"
//                 >
//                   <Trash2 size={16} />
//                   Remove Pet
//                 </button>

//                 {/* Conditional Device Buttons */}
//                 {shouldShowPairButton() && (
//                   <button
//                     onClick={() => setShowPairModal(true)}
//                     className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition-colors border border-emerald-100"
//                   >
//                     <MapPin size={16} />
//                     Pair with Pet Tracker
//                   </button>
//                 )}

//                 {shouldShowLocationButton() && (
//                   <button
//                     onClick={handleViewLocation}
//                     className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors border border-blue-100"
//                   >
//                     <Navigation size={16} />
//                     View Current Pet Location
//                   </button>
//                 )}

//                 {/* Conditionally render Fingerprint and Find Similar buttons */}
//                 {!shouldHideAdvancedButtons() && (
//                   <>
//                     {/* Fingerprint Button - Hidden for Rehome Pet and Safe at Home */}
//                     <button
//                       onClick={handleGenerateFingerprint}
//                       disabled={pet?.has_generated_fingerprint}
//                       className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
//                         pet?.has_generated_fingerprint
//                           ? "bg-gray-100 text-gray-500 cursor-not-allowed"
//                           : "bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-100"
//                       }`}
//                     >
//                       <FileText size={16} />
//                       {pet?.has_generated_fingerprint ? "Fingerprint Generated" : "Generate Fingerprint"}
//                     </button>

//                     {/* Find Similar Pets Button - Hidden for Rehome Pet and Safe at Home */}
//                     <button
//                       onClick={() => router.push(`/pet_profile/${id}/similar`)}
//                       className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition-colors border border-emerald-100"
//                     >
//                       <Search size={16} />
//                       Find Similar Pets
//                     </button>
//                   </>
//                 )}
//               </div>
//             </div>
//           </div>
//         </div>
//       </main>

//       <Footer />
//       <Toaster position="bottom-right" />
//     </div>
//   )
// }

































///MAIN CODE LATEST!!
// // Pet profile page component will go here
// //frontend\pages\pet_profile\[id].js

// "use client"

// import { useRouter } from "next/router"
// import { useState, useEffect } from "react"
// import {
//   MapPin,
//   Edit,
//   FileText,
//   Trash2,
//   CheckCircle,
//   Search,
//   Home,
//   AlertTriangle,
//   Camera,
//   Calendar,
//   Info,
//   Navigation,
// } from "lucide-react"
// import toast, { Toaster } from "react-hot-toast"
// import Navbar from "../../components/Navbar"
// import Footer from "../../components/Footer"
// import {
//   fetchPetDetails,
//   deletePet,
//   updatePetStatus,
//   togglePublishPet,
//   pairDeviceWithPet,
//   updatePairDeviceWithPet,
//   getPetDeviceInfo,
//   getPetCurrentLocation,
//   toggleDeviceActivation,
// } from "../../utils/api"
// import { XCircle, Upload } from "lucide-react"

// // Add these constants after the imports
// const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://fkpimtcxncgwtdsfyrjb.supabase.co"
// const PET_IMAGES_BUCKET = "pet-images"

// function getPetImageUrl(imageName) {
//   if (!imageName) return "https://via.placeholder.com/100"
//   // Handle the format "1/main.jpg" -> "https://fkpimtcxncgwtdsfyrjb.supabase.co/storage/v1/object/public/pet-images/1/main.jpg"
//   return `${SUPABASE_URL}/storage/v1/object/public/${PET_IMAGES_BUCKET}/${imageName}`
// }

// export default function PetProfile() {
//   const router = useRouter()
//   const { id } = router.query
//   const [pet, setPet] = useState(null)
//   const [loading, setLoading] = useState(true)
//   const [error, setError] = useState(null)
//   const [userId, setUserId] = useState(null)
//   const [showMissingImagesModal, setShowMissingImagesModal] = useState(false)
//   const [showPairModal, setShowPairModal] = useState(false)
//   const [showLocationModal, setShowLocationModal] = useState(false)
//   const [uniqueCode, setUniqueCode] = useState("")
//   const [pairingLoading, setPairingLoading] = useState(false)
//   const [deviceInfo, setDeviceInfo] = useState(null)
//   const [currentLocation, setCurrentLocation] = useState(null)
//   const [locationLoading, setLocationLoading] = useState(false)
//   const [isUpdateMode, setIsUpdateMode] = useState(false)
//   const [deviceActivationLoading, setDeviceActivationLoading] = useState(false)

//   useEffect(() => {
//     const token = sessionStorage.getItem("auth_token")
//     const userId = sessionStorage.getItem("user_id")
//     const petStatus = localStorage.getItem("petStatus")

//     if (!token || !userId) {
//       router.push("/login")
//     } else {
//       setUserId(userId)
//     }

//     if (id) {
//       const loadPet = async () => {
//         try {
//           const data = await fetchPetDetails(id)
//           if (petStatus) {
//             data.status = petStatus
//           }
//           setPet(data)

//           // Check if pet has paired device
//           try {
//             const deviceData = await getPetDeviceInfo(id)
//             setDeviceInfo(deviceData)
//           } catch (error) {
//             // Pet doesn't have paired device, that's okay
//             setDeviceInfo(null)
//           }
//         } catch (error) {
//           console.error("Failed to load pet:", error)
//           setError(error.message)
//         } finally {
//           setLoading(false)
//         }
//       }
//       loadPet()
//     }
//   }, [id, router])

//   const getDateLabel = () => {
//     if (!pet) return ""

//     // Remove time from date display
//     const dateOnly = pet.date ? pet.date.split("T")[0] : pet.date

//     switch (pet.status) {
//       case "Pet I Found":
//         return `Reported found ${dateOnly}`
//       case "Lost":
//         return `Reported lost ${dateOnly}`
//       case "Safe at Home":
//       case "Rehome Pet":
//       default:
//         return `Birthdate: ${dateOnly}`
//     }
//   }

//   const getLocationLabel = () => {
//     if (!pet) return "Location"

//     switch (pet.status) {
//       case "Lost":
//         return "Last Seen Location"
//       case "Pet I Found":
//         return "Found Location"
//       case "Safe at Home":
//         return "Home Location"
//       case "Rehome Pet":
//         return "Current Location"
//       default:
//         return "Location"
//     }
//   }

//   const handleMarkReunited = async () => {
//     try {
//       await toast.promise(updatePetStatus(id, "Reunited"), {
//         loading: "Updating...",
//         success: () => {
//           setPet((prev) => ({ ...prev, status: "Reunited" }))
//           return "Pet marked as reunited!"
//         },
//         error: "Failed to update",
//       })
//     } catch (error) {
//       console.error(error)
//     }
//   }

//   const handleMarkFound = async () => {
//     try {
//       await toast.promise(updatePetStatus(id, "Safe at Home"), {
//         loading: "Updating...",
//         success: () => {
//           setPet((prev) => ({ ...prev, status: "Safe at Home" }))
//           return "Pet marked as found!"
//         },
//         error: "Failed to update",
//       })
//     } catch (error) {
//       console.error(error)
//     }
//   }

//   const handleTogglePublish = async () => {
//     try {
//       const result = await togglePublishPet(pet.id, true)
//       setPet((prev) => ({
//         ...prev,
//         is_published: result.is_published,
//         admin_approved: false, // Reset approval when publishing
//       }))
//       toast.success(result.message)
//     } catch (error) {
//       toast.error(error.message)
//     }
//   }

//   const handleUnpublish = async () => {
//     try {
//       const result = await togglePublishPet(pet.id, false) // false means unpublish
//       setPet((prev) => ({
//         ...prev,
//         is_published: false,
//         admin_approved: false, // Ensure UI updates immediately
//       }))
//       toast.success(result.message)
//     } catch (error) {
//       toast.error(error.message)
//       console.error("Unpublish failed:", error)
//     }
//   }

//   const handleReportAsLost = async () => {
//     try {
//       const result = await updatePetStatus(pet.id, "Lost")
//       setPet((prev) => ({ ...prev, status: "Lost", is_published: false }))
//       toast.success("Pet reported as lost")
//     } catch (error) {
//       toast.error(error.message)
//     }
//   }

//   const handleRemovePet = async () => {
//     if (confirm("Are you sure you want to remove this pet? This action cannot be undone.")) {
//       try {
//         const token = sessionStorage.getItem("auth_token")
//         if (!token) {
//           throw new Error("Authentication required")
//         }

//         await toast.promise(deletePet(id, token), {
//           loading: "Removing pet...",
//           success: "Pet removed successfully",
//           error: (err) => err.message || "Failed to remove pet",
//         })

//         router.push("/pet_dashboard")
//       } catch (error) {
//         console.error("Delete failed:", error)
//       }
//     }
//   }

//   // Add this function before any handler that uses it
//   const checkRequiredImages = () => {
//     if (!pet || !pet.additional_images) return false

//     const requiredImages = ["fur.jpg", "face.jpg", "side.jpg"]
//     const currentImages = pet.additional_images || []

//     return requiredImages.every((img) => currentImages.includes(img))
//   }

//   const handleGenerateFingerprint = async () => {
//     try {
//       if (!pet) {
//         throw new Error("Pet data not loaded")
//       }

//       if (!checkRequiredImages()) {
//         setShowMissingImagesModal(true)
//         return
//       }

//       const token = sessionStorage.getItem("auth_token")
//       if (!token) {
//         throw new Error("Authentication required")
//       }

//       const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/pets/${pet.id}/generate-fingerprint`

//       const response = await fetch(apiUrl, {
//         method: "POST",
//         headers: {
//           Authorization: `Bearer ${token}`,
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           status: pet.status.toLowerCase(), // Ensure status is lowercase
//         }),
//       })

//       if (!response.ok) {
//         const errorData = await response.json().catch(() => ({}))
//         throw new Error(errorData.detail || `HTTP error! status: ${response.status}`)
//       }

//       const data = await response.json()
//       toast.success("Fingerprint generated successfully!")

//       // Refresh pet data to show the fingerprint status
//       const updatedPet = await fetchPetDetails(id)
//       setPet(updatedPet)
//     } catch (error) {
//       console.error("Fingerprint generation failed:", error)
//       toast.error(error.message || "Failed to generate fingerprint")
//     }
//   }

//   const handlePairDevice = async () => {
//     if (!uniqueCode.trim()) {
//       toast.error("Please enter a unique code")
//       return
//     }

//     setPairingLoading(true)
//     try {
//       let result
//       if (isUpdateMode) {
//         result = await updatePairDeviceWithPet(uniqueCode.trim(), pet.id, userId)
//       } else {
//         result = await pairDeviceWithPet(uniqueCode.trim(), pet.id, userId)
//       }

//       toast.success(result.message)
//       setShowPairModal(false)
//       setUniqueCode("")
//       setIsUpdateMode(false)

//       // Refresh device info
//       try {
//         const deviceData = await getPetDeviceInfo(id)
//         setDeviceInfo(deviceData)
//       } catch (error) {
//         setDeviceInfo(null)
//       }

//       // Optionally refresh pet data
//       const updatedPet = await fetchPetDetails(id)
//       setPet(updatedPet)
//     } catch (error) {
//       toast.error(error.message)
//     } finally {
//       setPairingLoading(false)
//     }
//   }

//   const handleViewLocation = async () => {
//     setLocationLoading(true)
//     setShowLocationModal(true)

//     try {
//       const locationData = await getPetCurrentLocation(pet.id)
//       setCurrentLocation(locationData)
//     } catch (error) {
//       toast.error(error.message)
//       setCurrentLocation(null)
//     } finally {
//       setLocationLoading(false)
//     }
//   }

//   const handleUpdatePairing = () => {
//     setIsUpdateMode(true)
//     setUniqueCode(deviceInfo?.unique_code || "")
//     setShowPairModal(true)
//   }

//   const handleToggleDeviceActivation = async (isActive) => {
//     setDeviceActivationLoading(true)
//     try {
//       const result = await toggleDeviceActivation(pet.id, isActive)
//       toast.success(result.message)

//       // Update device info state
//       setDeviceInfo((prev) => ({
//         ...prev,
//         is_active: isActive,
//       }))

//       // Refresh device info from server
//       try {
//         const deviceData = await getPetDeviceInfo(id)
//         setDeviceInfo(deviceData)
//       } catch (error) {
//         console.error("Failed to refresh device info:", error)
//       }
//     } catch (error) {
//       toast.error(error.message)
//     } finally {
//       setDeviceActivationLoading(false)
//     }
//   }

//   // Check if buttons should be hidden based on pet status
//   const shouldHideAdvancedButtons = () => {
//     return pet?.status === "Rehome Pet" || pet?.status === "Safe at Home"
//   }

//   // Check if should show pair button
//   const shouldShowPairButton = () => {
//     return !deviceInfo && pet?.status === "Lost"
//   }

//   // Check if should show location button
//   const shouldShowLocationButton = () => {
//     return deviceInfo && pet?.status === "Lost"
//   }

//   // Loading state with a modern spinner
//   if (loading)
//     return (
//       <div className="fixed inset-0 bg-white flex items-center justify-center z-50">
//         <div className="flex flex-col items-center">
//           <div className="relative">
//             <div className="w-16 h-16 border-4 border-emerald-200 rounded-full"></div>
//             <div className="absolute top-0 left-0 w-16 h-16 border-4 border-emerald-500 rounded-full animate-spin border-t-transparent"></div>
//           </div>
//           <p className="mt-4 text-gray-600">Loading pet profile...</p>
//         </div>
//       </div>
//     )

//   if (error)
//     return (
//       <div className="container mx-auto p-6 text-center">
//         <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
//           <div className="flex items-center">
//             <AlertTriangle className="h-6 w-6 text-red-500 mr-3" />
//             <p className="text-red-700">Error: {error}</p>
//           </div>
//         </div>
//       </div>
//     )

//   if (!pet)
//     return (
//       <div className="container mx-auto p-6 text-center">
//         <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
//           <p className="text-yellow-700">Pet not found</p>
//         </div>
//       </div>
//     )

//   // Get status color
//   const getStatusColor = (status) => {
//     switch (status) {
//       case "Lost":
//         return "bg-red-100 text-red-700"
//       case "Pet I Found":
//         return "bg-blue-100 text-blue-700"
//       case "Safe at Home":
//         return "bg-green-100 text-green-700"
//       case "Reunited":
//         return "bg-purple-100 text-purple-700"
//       case "Rehome Pet":
//         return "bg-orange-100 text-orange-700"
//       default:
//         return "bg-gray-100 text-gray-700"
//     }
//   }

//   return (
//     <div className="bg-gray-50 min-h-screen">
//       <Navbar />

//       {pet.status === "Lost" && (
//         <div className="bg-red-50 border-b border-red-100 py-3">
//           <div className="container mx-auto px-4 flex items-center justify-between">
//             <p className="text-red-700 flex items-center">
//               <AlertTriangle size={18} className="mr-2" />
//               You have a lost pet.
//             </p>
//             <a href="/search" className="text-red-700 font-medium hover:underline flex items-center">
//               <Search size={16} className="mr-1" />
//               Search for similar pets
//             </a>
//           </div>
//         </div>
//       )}

//       {/* Missing Images Modal */}
//       {showMissingImagesModal && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
//           <div className="bg-white p-6 rounded-xl max-w-md w-full shadow-xl">
//             <div className="flex items-center mb-4 text-amber-600">
//               <Camera size={24} className="mr-3" />
//               <h3 className="text-lg font-medium">Missing Images</h3>
//             </div>
//             <p className="mb-6 text-gray-600">
//               Please upload all required additional images (fur.jpg, face.jpg, side.jpg) before generating a
//               fingerprint.
//             </p>
//             <div className="flex justify-end space-x-3">
//               <button
//                 onClick={() => setShowMissingImagesModal(false)}
//                 className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors text-gray-700"
//               >
//                 Close
//               </button>
//               <button
//                 onClick={() => {
//                   setShowMissingImagesModal(false)
//                   router.push(`/edit_pet_details/${pet.id}`)
//                 }}
//                 className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors shadow-sm"
//               >
//                 Upload Images
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Pair Device Modal */}
//       {showPairModal && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
//           <div className="bg-white p-6 rounded-xl max-w-md w-full shadow-xl">
//             <div className="flex items-center mb-4 text-emerald-600">
//               <MapPin size={24} className="mr-3" />
//               <h3 className="text-lg font-medium">{isUpdateMode ? "Update Pet Tracker" : "Pair Pet Tracker"}</h3>
//             </div>
//             <p className="mb-4 text-gray-600">
//               {isUpdateMode
//                 ? `Update the tracker device for ${pet.name}.`
//                 : `Enter the unique code of your pet tracker device to pair it with ${pet.name}.`}
//             </p>
//             <div className="mb-6">
//               <label htmlFor="uniqueCode" className="block text-sm font-medium text-gray-700 mb-2">
//                 Device Unique Code
//               </label>
//               <input
//                 type="text"
//                 id="uniqueCode"
//                 value={uniqueCode}
//                 onChange={(e) => setUniqueCode(e.target.value)}
//                 placeholder="Enter unique code (e.g., LILYGO-7A83-B2)"
//                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
//                 disabled={pairingLoading}
//               />
//             </div>
//             <div className="flex justify-end space-x-3">
//               <button
//                 onClick={() => {
//                   setShowPairModal(false)
//                   setUniqueCode("")
//                   setIsUpdateMode(false)
//                 }}
//                 disabled={pairingLoading}
//                 className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors text-gray-700 disabled:opacity-50"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={handlePairDevice}
//                 disabled={pairingLoading || !uniqueCode.trim()}
//                 className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
//               >
//                 {pairingLoading
//                   ? isUpdateMode
//                     ? "Updating..."
//                     : "Pairing..."
//                   : isUpdateMode
//                     ? "Update Device"
//                     : "Pair Device"}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Location Modal */}
//       {showLocationModal && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
//           <div className="bg-white p-6 rounded-xl max-w-md w-full shadow-xl">
//             <div className="flex items-center mb-4 text-blue-600">
//               <Navigation size={24} className="mr-3" />
//               <h3 className="text-lg font-medium">Current Pet Location</h3>
//             </div>

//             {locationLoading ? (
//               <div className="flex items-center justify-center py-8">
//                 <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
//                 <span className="ml-2 text-gray-600">Loading location...</span>
//               </div>
//             ) : currentLocation ? (
//               <div className="space-y-4">
//                 <div className="bg-gray-50 p-4 rounded-lg">
//                   <p className="text-sm text-gray-600 mb-2">Latest Location:</p>
//                   <p className="font-medium">Latitude: {currentLocation.latitude}</p>
//                   <p className="font-medium">Longitude: {currentLocation.longitude}</p>
//                   <p className="text-sm text-gray-500 mt-2">
//                     Last updated: {new Date(currentLocation.timestamp).toLocaleString()}
//                   </p>
//                 </div>
//                 <div className="flex space-x-2">
//                   <button
//                     onClick={() => {
//                       const url = `https://www.google.com/maps?q=${currentLocation.latitude},${currentLocation.longitude}`
//                       window.open(url, "_blank")
//                     }}
//                     className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
//                   >
//                     View on Google Maps
//                   </button>
//                 </div>
//               </div>
//             ) : (
//               <div className="text-center py-8">
//                 <MapPin size={48} className="mx-auto text-gray-400 mb-4" />
//                 <p className="text-gray-600">No location data available</p>
//                 <p className="text-sm text-gray-500 mt-2">
//                   The device may be offline or hasn't sent location data yet.
//                 </p>
//               </div>
//             )}

//             <div className="flex justify-end mt-6">
//               <button
//                 onClick={() => {
//                   setShowLocationModal(false)
//                   setCurrentLocation(null)
//                 }}
//                 className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors text-gray-700"
//               >
//                 Close
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       <main className="container mx-auto px-4 py-8">
//         <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
//           <div className="md:flex">
//             {/* Pet Image Section */}
//             <div className="md:w-2/5 relative">
//               {pet.image ? (
//                 <img
//                   src={getPetImageUrl(pet.image) || "/placeholder.svg"}
//                   alt={pet.name}
//                   className="w-full h-full object-cover aspect-square md:aspect-auto md:h-full"
//                   onError={(e) => {
//                     e.target.onerror = null
//                     e.target.src = "https://via.placeholder.com/400"
//                   }}
//                 />
//               ) : (
//                 <div className="w-full h-64 md:h-full bg-gray-100 flex items-center justify-center">
//                   <Camera size={48} className="text-gray-400" />
//                   <p className="text-gray-500 ml-2">No Image Available</p>
//                 </div>
//               )}

//               {/* Status Badge */}
//               <div
//                 className={`absolute top-4 right-4 ${getStatusColor(pet.status)} px-3 py-1 rounded-full text-sm font-medium shadow-sm`}
//               >
//                 {pet.status}
//               </div>
//             </div>

//             {/* Pet Details Section */}
//             <div className="md:w-3/5 p-6">
//               <div className="mb-6">
//                 <h1 className="text-3xl font-bold text-gray-800 mb-1">{pet.name}</h1>
//                 <p className="text-gray-500 flex items-center">
//                   <Calendar size={16} className="mr-2" />
//                   {getDateLabel()}
//                 </p>
//               </div>

//               <div className="grid grid-cols-3 gap-4 mb-6">
//                 <div className="bg-gray-50 p-3 rounded-lg">
//                   <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Type</p>
//                   <p className="font-medium text-gray-800">{pet.type || "-"}</p>
//                 </div>
//                 <div className="bg-gray-50 p-3 rounded-lg">
//                   <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Gender</p>
//                   <p className="font-medium text-gray-800">{pet.gender || "-"}</p>
//                 </div>
//                 <div className="bg-gray-50 p-3 rounded-lg">
//                   <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Status</p>
//                   <p className="font-medium text-gray-800">{pet.status || "-"}</p>
//                 </div>
//               </div>

//               {pet.description && (
//                 <div className="mb-6">
//                   <h2 className="text-lg font-semibold text-gray-800 mb-2 flex items-center">
//                     <Info size={18} className="mr-2 text-emerald-500" />
//                     Description
//                   </h2>
//                   <p className="text-gray-600 bg-gray-50 p-4 rounded-lg border border-gray-100">{pet.description}</p>
//                 </div>
//               )}

//               {pet.address && (
//                 <div className="mb-6">
//                   <h2 className="text-lg font-semibold text-gray-800 mb-2 flex items-center">
//                     <MapPin size={18} className="mr-2 text-emerald-500" />
//                     {getLocationLabel()}
//                   </h2>
//                   <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 flex items-start">
//                     <MapPin size={18} className="mr-2 text-gray-500 mt-0.5 flex-shrink-0" />
//                     <span className="text-gray-600">{pet.address}</span>
//                   </div>
//                 </div>
//               )}

//               {/* Device Info Display */}
//               {deviceInfo && (
//                 <div className="mb-6">
//                   <h2 className="text-lg font-semibold text-gray-800 mb-2 flex items-center">
//                     <MapPin size={18} className="mr-2 text-emerald-500" />
//                     Paired Device
//                   </h2>
//                   <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-100">
//                     <div className="flex items-center justify-between">
//                       <div>
//                         <p className="font-medium text-emerald-800">Device: {deviceInfo.unique_code}</p>
//                         <p className="text-sm text-emerald-600">
//                           Status: {deviceInfo.is_active ? "Active" : "Inactive"} •
//                           {deviceInfo.is_online ? " Online" : " Offline"}
//                         </p>
//                         {deviceInfo.paired_at && (
//                           <p className="text-xs text-emerald-500 mt-1">
//                             Paired: {new Date(deviceInfo.paired_at).toLocaleDateString()}
//                           </p>
//                         )}
//                       </div>
//                       <div className="flex space-x-2">
//                         <button
//                           onClick={handleUpdatePairing}
//                           className="px-3 py-1 bg-emerald-600 text-white text-sm rounded hover:bg-emerald-700 transition-colors"
//                         >
//                           Update
//                         </button>

//                         {/* Device Activation Controls for Safe at Home pets */}
//                         {pet.status === "Safe at Home" && (
//                           <div className="flex space-x-1">
//                             <button
//                               onClick={() => handleToggleDeviceActivation(true)}
//                               disabled={deviceActivationLoading || deviceInfo.is_active}
//                               className={`px-2 py-1 text-xs rounded transition-colors ${
//                                 deviceInfo.is_active
//                                   ? "bg-green-100 text-green-800 cursor-not-allowed"
//                                   : "bg-green-600 text-white hover:bg-green-700"
//                               } disabled:opacity-50`}
//                             >
//                               {deviceActivationLoading && !deviceInfo.is_active ? "..." : "ON"}
//                             </button>
//                             <button
//                               onClick={() => handleToggleDeviceActivation(false)}
//                               disabled={deviceActivationLoading || !deviceInfo.is_active}
//                               className={`px-2 py-1 text-xs rounded transition-colors ${
//                                 !deviceInfo.is_active
//                                   ? "bg-red-100 text-red-800 cursor-not-allowed"
//                                   : "bg-red-600 text-white hover:bg-red-700"
//                               } disabled:opacity-50`}
//                             >
//                               {deviceActivationLoading && deviceInfo.is_active ? "..." : "OFF"}
//                             </button>
//                           </div>
//                         )}
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               )}

             

//               {/* Action Buttons */}
//               <div className="flex flex-wrap gap-3 mb-6">
//                 {/* Safe at Home or Reunited status */}
//                 {(pet.status === "Safe at Home" || pet.status === "Reunited") && (
//                   <>
//                     <button
//                       onClick={handleReportAsLost}
//                       className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors border border-red-100"
//                     >
//                       <AlertTriangle size={16} />
//                       Report as Lost
//                     </button>
//                     <button
//                       onClick={() => router.push(`/edit_pet_details/${pet.id}`)}
//                       className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition-colors border border-emerald-100"
//                     >
//                       <Edit size={16} />
//                       Edit Details
//                     </button>
//                   </>
//                 )}

//                 {/* Status-specific buttons */}
//                 {pet.status === "Lost" && (
//                   <button
//                     onClick={handleMarkFound}
//                     className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors border border-green-100"
//                   >
//                     <Home size={16} />
//                     Mark as Found
//                   </button>
//                 )}

//                 {pet.status === "Pet I Found" && (
//                   <button
//                     onClick={handleMarkReunited}
//                     className="flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors border border-purple-100"
//                   >
//                     <CheckCircle size={16} />
//                     Mark as Reunited
//                   </button>
//                 )}
//               </div>

//               {/* Publication Status Card */}
//               <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 mb-6">
//                 <h3 className="text-black font-medium text-lg mb-4 flex items-center">
//                   <Upload size={18} className="text-black mr-2 text-emerald-500" />
//                   Publication Status
//                 </h3>

//                 {pet.is_published ? (
//                   <>
//                     <div className="flex flex-wrap items-center gap-4 mb-3">
//                       <button
//                         onClick={handleUnpublish}
//                         className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors border border-red-200"
//                       >
//                         <XCircle size={16} />
//                         Unpublish
//                       </button>

//                       <div className="flex items-center gap-2">
//                         <span className="text-sm font-medium text-gray-500">Admin:</span>
//                         <span
//                           className={`px-3 py-1 rounded-full text-xs font-medium ${
//                             pet.admin_approved ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
//                           }`}
//                         >
//                           {pet.admin_approved ? "Approved" : "Pending Review"}
//                         </span>
//                       </div>
//                     </div>
//                     <p className="text-sm text-gray-600">
//                       {pet.admin_approved ? "This listing is publicly visible" : "Under admin review (24-48 hours)"}
//                     </p>
//                   </>
//                 ) : (
//                   <button
//                     onClick={handleTogglePublish}
//                     className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-colors border border-emerald-200"
//                   >
//                     <Upload size={16} />
//                     Publish This Pet
//                   </button>
//                 )}
//               </div>

//               {/* Advanced Actions */}
//               <div className="border-t border-gray-100 pt-6 flex flex-wrap gap-3">
//                 <button
//                   onClick={() => router.push(`/edit_pet_details/${pet.id}`)}
//                   className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
//                 >
//                   <Edit size={16} />
//                   Edit pet details
//                 </button>

//                 {pet.status === "Lost" && (
//                   <button
//                     onClick={() => {
//                       // Create a temporary link to the flyer page
//                       const link = document.createElement("a")
//                       link.href = `/pet_flyer?id=${pet.id}`
//                       link.target = "_blank"
//                       link.rel = "noopener noreferrer"
//                       link.click()
//                     }}
//                     className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
//                   >
//                     <FileText size={16} />
//                     Generate Pet Flyer
//                   </button>
//                 )}

//                 <button
//                   onClick={handleRemovePet}
//                   className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors"
//                 >
//                   <Trash2 size={16} />
//                   Remove Pet
//                 </button>

//                 {/* Conditional Device Buttons */}
//                 {shouldShowPairButton() && (
//                   <button
//                     onClick={() => setShowPairModal(true)}
//                     className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition-colors border border-emerald-100"
//                   >
//                     <MapPin size={16} />
//                     Pair with Pet Tracker
//                   </button>
//                 )}

//                 {shouldShowLocationButton() && (
//                   <button
//                     onClick={handleViewLocation}
//                     className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors border border-blue-100"
//                   >
//                     <Navigation size={16} />
//                     View Current Pet Location
//                   </button>
//                 )}

//                 {/* Conditionally render Fingerprint and Find Similar buttons */}
//                 {!shouldHideAdvancedButtons() && (
//                   <>
//                     {/* Fingerprint Button - Hidden for Rehome Pet and Safe at Home */}
//                     <button
//                       onClick={handleGenerateFingerprint}
//                       disabled={pet?.has_generated_fingerprint}
//                       className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
//                         pet?.has_generated_fingerprint
//                           ? "bg-gray-100 text-gray-500 cursor-not-allowed"
//                           : "bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-100"
//                       }`}
//                     >
//                       <FileText size={16} />
//                       {pet?.has_generated_fingerprint ? "Fingerprint Generated" : "Generate Fingerprint"}
//                     </button>

//                     {/* Find Similar Pets Button - Hidden for Rehome Pet and Safe at Home */}
//                     <button
//                       onClick={() => router.push(`/pet_profile/${id}/similar`)}
//                       className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition-colors border border-emerald-100"
//                     >
//                       <Search size={16} />
//                       Find Similar Pets
//                     </button>
//                   </>
//                 )}
//               </div>
//             </div>
//           </div>
//         </div>
//       </main>

//       <Footer />
//       <Toaster position="bottom-right" />
//     </div>
//   )
// }
















































// //MAIN CODE WITH PET TRACKER!
// // Pet profile page component will go here
// //frontend\pages\pet_profile\[id].js

// "use client"

// import { useRouter } from "next/router"
// import { useState, useEffect } from "react"
// import {
//   MapPin,
//   Edit,
//   FileText,
//   Trash2,
//   CheckCircle,
//   Search,
//   Home,
//   AlertTriangle,
//   Camera,
//   Calendar,
//   Info,
//   Navigation,
// } from "lucide-react"
// import toast, { Toaster } from "react-hot-toast"
// import Navbar from "../../components/Navbar"
// import Footer from "../../components/Footer"
// import {
//   fetchPetDetails,
//   deletePet,
//   updatePetStatus,
//   togglePublishPet,
//   pairDeviceWithPet,
//   updatePairDeviceWithPet,
//   getPetDeviceInfo,
//   getPetCurrentLocation,
//   toggleDeviceActivation,
// } from "../../utils/api"
// import { XCircle, Upload } from "lucide-react"

// export default function PetProfile() {
//   const router = useRouter()
//   const { id } = router.query
//   const [pet, setPet] = useState(null)
//   const [loading, setLoading] = useState(true)
//   const [error, setError] = useState(null)
//   const [userId, setUserId] = useState(null)
//   const [showMissingImagesModal, setShowMissingImagesModal] = useState(false)
//   const [showPairModal, setShowPairModal] = useState(false)
//   const [showLocationModal, setShowLocationModal] = useState(false)
//   const [uniqueCode, setUniqueCode] = useState("")
//   const [pairingLoading, setPairingLoading] = useState(false)
//   const [deviceInfo, setDeviceInfo] = useState(null)
//   const [currentLocation, setCurrentLocation] = useState(null)
//   const [locationLoading, setLocationLoading] = useState(false)
//   const [isUpdateMode, setIsUpdateMode] = useState(false)
//   const [deviceActivationLoading, setDeviceActivationLoading] = useState(false)

//   useEffect(() => {
//     const token = sessionStorage.getItem("auth_token")
//     const userId = sessionStorage.getItem("user_id")
//     const petStatus = localStorage.getItem("petStatus")

//     if (!token || !userId) {
//       router.push("/login")
//     } else {
//       setUserId(userId)
//     }

//     if (id) {
//       const loadPet = async () => {
//         try {
//           const data = await fetchPetDetails(id)
//           if (petStatus) {
//             data.status = petStatus
//           }
//           setPet(data)

//           // Check if pet has paired device
//           try {
//             const deviceData = await getPetDeviceInfo(id)
//             setDeviceInfo(deviceData)
//           } catch (error) {
//             // Pet doesn't have paired device, that's okay
//             setDeviceInfo(null)
//           }
//         } catch (error) {
//           console.error("Failed to load pet:", error)
//           setError(error.message)
//         } finally {
//           setLoading(false)
//         }
//       }
//       loadPet()
//     }
//   }, [id, router])

//   // Add these constants after the imports
// const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://fkpimtcxncgwtdsfyrjb.supabase.co"
// const PET_IMAGES_BUCKET = "pet-images"

//   const getDateLabel = () => {
//     if (!pet) return ""

//     // Remove time from date display
//     const dateOnly = pet.date ? pet.date.split("T")[0] : pet.date

//     switch (pet.status) {
//       case "Pet I Found":
//         return `Reported found ${dateOnly}`
//       case "Lost":
//         return `Reported lost ${dateOnly}`
//       case "Safe at Home":
//       case "Rehome Pet":
//       default:
//         return `Birthdate: ${dateOnly}`
//     }
//   }

//   const getLocationLabel = () => {
//     if (!pet) return "Location"

//     switch (pet.status) {
//       case "Lost":
//         return "Last Seen Location"
//       case "Pet I Found":
//         return "Found Location"
//       case "Safe at Home":
//         return "Home Location"
//       case "Rehome Pet":
//         return "Current Location"
//       default:
//         return "Location"
//     }
//   }

//   const handleMarkReunited = async () => {
//     try {
//       await toast.promise(updatePetStatus(id, "Reunited"), {
//         loading: "Updating...",
//         success: () => {
//           setPet((prev) => ({ ...prev, status: "Reunited" }))
//           return "Pet marked as reunited!"
//         },
//         error: "Failed to update",
//       })
//     } catch (error) {
//       console.error(error)
//     }
//   }

//   const handleMarkFound = async () => {
//     try {
//       await toast.promise(updatePetStatus(id, "Safe at Home"), {
//         loading: "Updating...",
//         success: () => {
//           setPet((prev) => ({ ...prev, status: "Safe at Home" }))
//           return "Pet marked as found!"
//         },
//         error: "Failed to update",
//       })
//     } catch (error) {
//       console.error(error)
//     }
//   }

//   const handleTogglePublish = async () => {
//     try {
//       const result = await togglePublishPet(pet.id, true)
//       setPet((prev) => ({
//         ...prev,
//         is_published: result.is_published,
//         admin_approved: false, // Reset approval when publishing
//       }))
//       toast.success(result.message)
//     } catch (error) {
//       toast.error(error.message)
//     }
//   }

//   const handleUnpublish = async () => {
//     try {
//       const result = await togglePublishPet(pet.id, false) // false means unpublish
//       setPet((prev) => ({
//         ...prev,
//         is_published: false,
//         admin_approved: false, // Ensure UI updates immediately
//       }))
//       toast.success(result.message)
//     } catch (error) {
//       toast.error(error.message)
//       console.error("Unpublish failed:", error)
//     }
//   }

//   const handleReportAsLost = async () => {
//     try {
//       const result = await updatePetStatus(pet.id, "Lost")
//       setPet((prev) => ({ ...prev, status: "Lost", is_published: false }))
//       toast.success("Pet reported as lost")
//     } catch (error) {
//       toast.error(error.message)
//     }
//   }

//   const handleRemovePet = async () => {
//     if (confirm("Are you sure you want to remove this pet? This action cannot be undone.")) {
//       try {
//         const token = sessionStorage.getItem("auth_token")
//         if (!token) {
//           throw new Error("Authentication required")
//         }

//         await toast.promise(deletePet(id, token), {
//           loading: "Removing pet...",
//           success: "Pet removed successfully",
//           error: (err) => err.message || "Failed to remove pet",
//         })

//         router.push("/pet_dashboard")
//       } catch (error) {
//         console.error("Delete failed:", error)
//       }
//     }
//   }

//   // Add this function before any handler that uses it
//   const checkRequiredImages = () => {
//     if (!pet || !pet.additional_images) return false

//     const requiredImages = ["fur.jpg", "face.jpg", "side.jpg"]
//     const currentImages = pet.additional_images || []

//     return requiredImages.every((img) => currentImages.includes(img))
//   }

//   const handleGenerateFingerprint = async () => {
//     try {
//       if (!pet) {
//         throw new Error("Pet data not loaded")
//       }

//       if (!checkRequiredImages()) {
//         setShowMissingImagesModal(true)
//         return
//       }

//       const token = sessionStorage.getItem("auth_token")
//       if (!token) {
//         throw new Error("Authentication required")
//       }

//       const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/pets/${pet.id}/generate-fingerprint`

//       const response = await fetch(apiUrl, {
//         method: "POST",
//         headers: {
//           Authorization: `Bearer ${token}`,
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           status: pet.status.toLowerCase(), // Ensure status is lowercase
//         }),
//       })

//       if (!response.ok) {
//         const errorData = await response.json().catch(() => ({}))
//         throw new Error(errorData.detail || `HTTP error! status: ${response.status}`)
//       }

//       const data = await response.json()
//       toast.success("Fingerprint generated successfully!")

//       // Refresh pet data to show the fingerprint status
//       const updatedPet = await fetchPetDetails(id)
//       setPet(updatedPet)
//     } catch (error) {
//       console.error("Fingerprint generation failed:", error)
//       toast.error(error.message || "Failed to generate fingerprint")
//     }
//   }

//   const handlePairDevice = async () => {
//     if (!uniqueCode.trim()) {
//       toast.error("Please enter a unique code")
//       return
//     }

//     setPairingLoading(true)
//     try {
//       let result
//       if (isUpdateMode) {
//         result = await updatePairDeviceWithPet(uniqueCode.trim(), pet.id, userId)
//       } else {
//         result = await pairDeviceWithPet(uniqueCode.trim(), pet.id, userId)
//       }

//       toast.success(result.message)
//       setShowPairModal(false)
//       setUniqueCode("")
//       setIsUpdateMode(false)

//       // Refresh device info
//       try {
//         const deviceData = await getPetDeviceInfo(id)
//         setDeviceInfo(deviceData)
//       } catch (error) {
//         setDeviceInfo(null)
//       }

//       // Optionally refresh pet data
//       const updatedPet = await fetchPetDetails(id)
//       setPet(updatedPet)
//     } catch (error) {
//       toast.error(error.message)
//     } finally {
//       setPairingLoading(false)
//     }
//   }

//   const handleViewLocation = async () => {
//     setLocationLoading(true)
//     setShowLocationModal(true)

//     try {
//       const locationData = await getPetCurrentLocation(pet.id)
//       setCurrentLocation(locationData)
//     } catch (error) {
//       toast.error(error.message)
//       setCurrentLocation(null)
//     } finally {
//       setLocationLoading(false)
//     }
//   }

//   const handleUpdatePairing = () => {
//     setIsUpdateMode(true)
//     setUniqueCode(deviceInfo?.unique_code || "")
//     setShowPairModal(true)
//   }

//   const handleToggleDeviceActivation = async (isActive) => {
//     setDeviceActivationLoading(true)
//     try {
//       const result = await toggleDeviceActivation(pet.id, isActive)
//       toast.success(result.message)

//       // Update device info state
//       setDeviceInfo((prev) => ({
//         ...prev,
//         is_active: isActive,
//       }))

//       // Refresh device info from server
//       try {
//         const deviceData = await getPetDeviceInfo(id)
//         setDeviceInfo(deviceData)
//       } catch (error) {
//         console.error("Failed to refresh device info:", error)
//       }
//     } catch (error) {
//       toast.error(error.message)
//     } finally {
//       setDeviceActivationLoading(false)
//     }
//   }

//   // Check if buttons should be hidden based on pet status
//   const shouldHideAdvancedButtons = () => {
//     return pet?.status === "Rehome Pet" || pet?.status === "Safe at Home"
//   }

//   // Check if should show pair button
//   const shouldShowPairButton = () => {
//     return !deviceInfo && pet?.status === "Lost"
//   }

//   // Check if should show location button
//   const shouldShowLocationButton = () => {
//     return deviceInfo && pet?.status === "Lost"
//   }

//   // Loading state with a modern spinner
//   if (loading)
//     return (
//       <div className="fixed inset-0 bg-white flex items-center justify-center z-50">
//         <div className="flex flex-col items-center">
//           <div className="relative">
//             <div className="w-16 h-16 border-4 border-emerald-200 rounded-full"></div>
//             <div className="absolute top-0 left-0 w-16 h-16 border-4 border-emerald-500 rounded-full animate-spin border-t-transparent"></div>
//           </div>
//           <p className="mt-4 text-gray-600">Loading pet profile...</p>
//         </div>
//       </div>
//     )

//   if (error)
//     return (
//       <div className="container mx-auto p-6 text-center">
//         <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
//           <div className="flex items-center">
//             <AlertTriangle className="h-6 w-6 text-red-500 mr-3" />
//             <p className="text-red-700">Error: {error}</p>
//           </div>
//         </div>
//       </div>
//     )

//   if (!pet)
//     return (
//       <div className="container mx-auto p-6 text-center">
//         <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
//           <p className="text-yellow-700">Pet not found</p>
//         </div>
//       </div>
//     )

//   // Get status color
//   const getStatusColor = (status) => {
//     switch (status) {
//       case "Lost":
//         return "bg-red-100 text-red-700"
//       case "Pet I Found":
//         return "bg-blue-100 text-blue-700"
//       case "Safe at Home":
//         return "bg-green-100 text-green-700"
//       case "Reunited":
//         return "bg-purple-100 text-purple-700"
//       case "Rehome Pet":
//         return "bg-orange-100 text-orange-700"
//       default:
//         return "bg-gray-100 text-gray-700"
//     }
//   }

//   return (
//     <div className="bg-gray-50 min-h-screen">
//       <Navbar />

//       {pet.status === "Lost" && (
//         <div className="bg-red-50 border-b border-red-100 py-3">
//           <div className="container mx-auto px-4 flex items-center justify-between">
//             <p className="text-red-700 flex items-center">
//               <AlertTriangle size={18} className="mr-2" />
//               You have a lost pet.
//             </p>
//             <a href="/search" className="text-red-700 font-medium hover:underline flex items-center">
//               <Search size={16} className="mr-1" />
//               Search for similar pets
//             </a>
//           </div>
//         </div>
//       )}

//       {/* Missing Images Modal */}
//       {showMissingImagesModal && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
//           <div className="bg-white p-6 rounded-xl max-w-md w-full shadow-xl">
//             <div className="flex items-center mb-4 text-amber-600">
//               <Camera size={24} className="mr-3" />
//               <h3 className="text-lg font-medium">Missing Images</h3>
//             </div>
//             <p className="mb-6 text-gray-600">
//               Please upload all required additional images (fur.jpg, face.jpg, side.jpg) before generating a
//               fingerprint.
//             </p>
//             <div className="flex justify-end space-x-3">
//               <button
//                 onClick={() => setShowMissingImagesModal(false)}
//                 className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors text-gray-700"
//               >
//                 Close
//               </button>
//               <button
//                 onClick={() => {
//                   setShowMissingImagesModal(false)
//                   router.push(`/edit_pet_details/${pet.id}`)
//                 }}
//                 className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors shadow-sm"
//               >
//                 Upload Images
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Pair Device Modal */}
//       {showPairModal && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
//           <div className="bg-white p-6 rounded-xl max-w-md w-full shadow-xl">
//             <div className="flex items-center mb-4 text-emerald-600">
//               <MapPin size={24} className="mr-3" />
//               <h3 className="text-lg font-medium">{isUpdateMode ? "Update Pet Tracker" : "Pair Pet Tracker"}</h3>
//             </div>
//             <p className="mb-4 text-gray-600">
//               {isUpdateMode
//                 ? `Update the tracker device for ${pet.name}.`
//                 : `Enter the unique code of your pet tracker device to pair it with ${pet.name}.`}
//             </p>
//             <div className="mb-6">
//               <label htmlFor="uniqueCode" className="block text-sm font-medium text-gray-700 mb-2">
//                 Device Unique Code
//               </label>
//               <input
//                 type="text"
//                 id="uniqueCode"
//                 value={uniqueCode}
//                 onChange={(e) => setUniqueCode(e.target.value)}
//                 placeholder="Enter unique code (e.g., LILYGO-7A83-B2)"
//                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
//                 disabled={pairingLoading}
//               />
//             </div>
//             <div className="flex justify-end space-x-3">
//               <button
//                 onClick={() => {
//                   setShowPairModal(false)
//                   setUniqueCode("")
//                   setIsUpdateMode(false)
//                 }}
//                 disabled={pairingLoading}
//                 className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors text-gray-700 disabled:opacity-50"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={handlePairDevice}
//                 disabled={pairingLoading || !uniqueCode.trim()}
//                 className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
//               >
//                 {pairingLoading
//                   ? isUpdateMode
//                     ? "Updating..."
//                     : "Pairing..."
//                   : isUpdateMode
//                     ? "Update Device"
//                     : "Pair Device"}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Location Modal */}
//       {showLocationModal && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
//           <div className="bg-white p-6 rounded-xl max-w-md w-full shadow-xl">
//             <div className="flex items-center mb-4 text-blue-600">
//               <Navigation size={24} className="mr-3" />
//               <h3 className="text-lg font-medium">Current Pet Location</h3>
//             </div>

//             {locationLoading ? (
//               <div className="flex items-center justify-center py-8">
//                 <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
//                 <span className="ml-2 text-gray-600">Loading location...</span>
//               </div>
//             ) : currentLocation ? (
//               <div className="space-y-4">
//                 <div className="bg-gray-50 p-4 rounded-lg">
//                   <p className="text-sm text-gray-600 mb-2">Latest Location:</p>
//                   <p className="font-medium">Latitude: {currentLocation.latitude}</p>
//                   <p className="font-medium">Longitude: {currentLocation.longitude}</p>
//                   <p className="text-sm text-gray-500 mt-2">
//                     Last updated: {new Date(currentLocation.timestamp).toLocaleString()}
//                   </p>
//                 </div>
//                 <div className="flex space-x-2">
//                   <button
//                     onClick={() => {
//                       const url = `https://www.google.com/maps?q=${currentLocation.latitude},${currentLocation.longitude}`
//                       window.open(url, "_blank")
//                     }}
//                     className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
//                   >
//                     View on Google Maps
//                   </button>
//                 </div>
//               </div>
//             ) : (
//               <div className="text-center py-8">
//                 <MapPin size={48} className="mx-auto text-gray-400 mb-4" />
//                 <p className="text-gray-600">No location data available</p>
//                 <p className="text-sm text-gray-500 mt-2">
//                   The device may be offline or hasn't sent location data yet.
//                 </p>
//               </div>
//             )}

//             <div className="flex justify-end mt-6">
//               <button
//                 onClick={() => {
//                   setShowLocationModal(false)
//                   setCurrentLocation(null)
//                 }}
//                 className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors text-gray-700"
//               >
//                 Close
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       <main className="container mx-auto px-4 py-8">
//         <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
//           <div className="md:flex">
//             {/* Pet Image Section */}
//             <div className="md:w-2/5 relative">
//               {pet.image ? (
//                 <img
//                   src={getPetImageUrl(pet.image) || "/placeholder.svg"}
//                   alt={pet.name}
//                   className="w-full h-full object-cover aspect-square md:aspect-auto md:h-full"
//                   onError={(e) => {
//                     e.target.onerror = null
//                     e.target.src = "https://via.placeholder.com/400"
//                   }}
//                 />
//               ) : (
//                 <div className="w-full h-64 md:h-full bg-gray-100 flex items-center justify-center">
//                   <Camera size={48} className="text-gray-400" />
//                   <p className="text-gray-500 ml-2">No Image Available</p>
//                 </div>
//               )}

//               {/* Status Badge */}
//               <div
//                 className={`absolute top-4 right-4 ${getStatusColor(pet.status)} px-3 py-1 rounded-full text-sm font-medium shadow-sm`}
//               >
//                 {pet.status}
//               </div>
//             </div>

//             {/* Pet Details Section */}
//             <div className="md:w-3/5 p-6">
//               <div className="mb-6">
//                 <h1 className="text-3xl font-bold text-gray-800 mb-1">{pet.name}</h1>
//                 <p className="text-gray-500 flex items-center">
//                   <Calendar size={16} className="mr-2" />
//                   {getDateLabel()}
//                 </p>
//               </div>

//               <div className="grid grid-cols-3 gap-4 mb-6">
//                 <div className="bg-gray-50 p-3 rounded-lg">
//                   <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Type</p>
//                   <p className="font-medium text-gray-800">{pet.type || "-"}</p>
//                 </div>
//                 <div className="bg-gray-50 p-3 rounded-lg">
//                   <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Gender</p>
//                   <p className="font-medium text-gray-800">{pet.gender || "-"}</p>
//                 </div>
//                 <div className="bg-gray-50 p-3 rounded-lg">
//                   <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Status</p>
//                   <p className="font-medium text-gray-800">{pet.status || "-"}</p>
//                 </div>
//               </div>

//               {pet.description && (
//                 <div className="mb-6">
//                   <h2 className="text-lg font-semibold text-gray-800 mb-2 flex items-center">
//                     <Info size={18} className="mr-2 text-emerald-500" />
//                     Description
//                   </h2>
//                   <p className="text-gray-600 bg-gray-50 p-4 rounded-lg border border-gray-100">{pet.description}</p>
//                 </div>
//               )}

//               {pet.address && (
//                 <div className="mb-6">
//                   <h2 className="text-lg font-semibold text-gray-800 mb-2 flex items-center">
//                     <MapPin size={18} className="mr-2 text-emerald-500" />
//                     {getLocationLabel()}
//                   </h2>
//                   <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 flex items-start">
//                     <MapPin size={18} className="mr-2 text-gray-500 mt-0.5 flex-shrink-0" />
//                     <span className="text-gray-600">{pet.address}</span>
//                   </div>
//                 </div>
//               )}

//               {/* Device Info Display */}
//               {deviceInfo && (
//                 <div className="mb-6">
//                   <h2 className="text-lg font-semibold text-gray-800 mb-2 flex items-center">
//                     <MapPin size={18} className="mr-2 text-emerald-500" />
//                     Paired Device
//                   </h2>
//                   <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-100">
//                     <div className="flex items-center justify-between">
//                       <div>
//                         <p className="font-medium text-emerald-800">Device: {deviceInfo.unique_code}</p>
//                         <p className="text-sm text-emerald-600">
//                           Status: {deviceInfo.is_active ? "Active" : "Inactive"} •
//                           {deviceInfo.is_online ? " Online" : " Offline"}
//                         </p>
//                         {deviceInfo.paired_at && (
//                           <p className="text-xs text-emerald-500 mt-1">
//                             Paired: {new Date(deviceInfo.paired_at).toLocaleDateString()}
//                           </p>
//                         )}
//                       </div>
//                       <div className="flex space-x-2">
//                         <button
//                           onClick={handleUpdatePairing}
//                           className="px-3 py-1 bg-emerald-600 text-white text-sm rounded hover:bg-emerald-700 transition-colors"
//                         >
//                           Update
//                         </button>

//                         {/* Device Activation Controls for Safe at Home pets */}
//                         {pet.status === "Safe at Home" && (
//                           <div className="flex space-x-1">
//                             <button
//                               onClick={() => handleToggleDeviceActivation(true)}
//                               disabled={deviceActivationLoading || deviceInfo.is_active}
//                               className={`px-2 py-1 text-xs rounded transition-colors ${
//                                 deviceInfo.is_active
//                                   ? "bg-green-100 text-green-800 cursor-not-allowed"
//                                   : "bg-green-600 text-white hover:bg-green-700"
//                               } disabled:opacity-50`}
//                             >
//                               {deviceActivationLoading && !deviceInfo.is_active ? "..." : "ON"}
//                             </button>
//                             <button
//                               onClick={() => handleToggleDeviceActivation(false)}
//                               disabled={deviceActivationLoading || !deviceInfo.is_active}
//                               className={`px-2 py-1 text-xs rounded transition-colors ${
//                                 !deviceInfo.is_active
//                                   ? "bg-red-100 text-red-800 cursor-not-allowed"
//                                   : "bg-red-600 text-white hover:bg-red-700"
//                               } disabled:opacity-50`}
//                             >
//                               {deviceActivationLoading && deviceInfo.is_active ? "..." : "OFF"}
//                             </button>
//                           </div>
//                         )}
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               )}

//               {/* Action Buttons */}
//               <div className="flex flex-wrap gap-3 mb-6">
//                 {/* Safe at Home or Reunited status */}
//                 {(pet.status === "Safe at Home" || pet.status === "Reunited") && (
//                   <>
//                     <button
//                       onClick={handleReportAsLost}
//                       className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors border border-red-100"
//                     >
//                       <AlertTriangle size={16} />
//                       Report as Lost
//                     </button>
//                     <button
//                       onClick={() => router.push(`/edit_pet_details/${pet.id}`)}
//                       className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition-colors border border-emerald-100"
//                     >
//                       <Edit size={16} />
//                       Edit Details
//                     </button>
//                   </>
//                 )}

//                 {/* Status-specific buttons */}
//                 {pet.status === "Lost" && (
//                   <button
//                     onClick={handleMarkFound}
//                     className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors border border-green-100"
//                   >
//                     <Home size={16} />
//                     Mark as Found
//                   </button>
//                 )}

//                 {pet.status === "Pet I Found" && (
//                   <button
//                     onClick={handleMarkReunited}
//                     className="flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors border border-purple-100"
//                   >
//                     <CheckCircle size={16} />
//                     Mark as Reunited
//                   </button>
//                 )}
//               </div>

//               {/* Publication Status Card */}
//               <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 mb-6">
//                 <h3 className="text-black font-medium text-lg mb-4 flex items-center">
//                   <Upload size={18} className="text-black mr-2 text-emerald-500" />
//                   Publication Status
//                 </h3>

//                 {pet.is_published ? (
//                   <>
//                     <div className="flex flex-wrap items-center gap-4 mb-3">
//                       <button
//                         onClick={handleUnpublish}
//                         className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors border border-red-200"
//                       >
//                         <XCircle size={16} />
//                         Unpublish
//                       </button>

//                       <div className="flex items-center gap-2">
//                         <span className="text-sm font-medium text-gray-500">Admin:</span>
//                         <span
//                           className={`px-3 py-1 rounded-full text-xs font-medium ${
//                             pet.admin_approved ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
//                           }`}
//                         >
//                           {pet.admin_approved ? "Approved" : "Pending Review"}
//                         </span>
//                       </div>
//                     </div>
//                     <p className="text-sm text-gray-600">
//                       {pet.admin_approved ? "This listing is publicly visible" : "Under admin review (24-48 hours)"}
//                     </p>
//                   </>
//                 ) : (
//                   <button
//                     onClick={handleTogglePublish}
//                     className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-colors border border-emerald-200"
//                   >
//                     <Upload size={16} />
//                     Publish This Pet
//                   </button>
//                 )}
//               </div>

//               {/* Advanced Actions */}
//               <div className="border-t border-gray-100 pt-6 flex flex-wrap gap-3">
//                 <button
//                   onClick={() => router.push(`/edit_pet_details/${pet.id}`)}
//                   className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
//                 >
//                   <Edit size={16} />
//                   Edit pet details
//                 </button>

//                 {pet.status === "Lost" && (
//                   <button
//                     onClick={() => {
//                       // Create a temporary link to the flyer page
//                       const link = document.createElement("a")
//                       link.href = `/pet_flyer?id=${pet.id}`
//                       link.target = "_blank"
//                       link.rel = "noopener noreferrer"
//                       link.click()
//                     }}
//                     className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
//                   >
//                     <FileText size={16} />
//                     Generate Pet Flyer
//                   </button>
//                 )}

//                 <button
//                   onClick={handleRemovePet}
//                   className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors"
//                 >
//                   <Trash2 size={16} />
//                   Remove Pet
//                 </button>

//                 {/* Conditional Device Buttons */}
//                 {shouldShowPairButton() && (
//                   <button
//                     onClick={() => setShowPairModal(true)}
//                     className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition-colors border border-emerald-100"
//                   >
//                     <MapPin size={16} />
//                     Pair with Pet Tracker
//                   </button>
//                 )}

//                 {shouldShowLocationButton() && (
//                   <button
//                     onClick={handleViewLocation}
//                     className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors border border-blue-100"
//                   >
//                     <Navigation size={16} />
//                     View Current Pet Location
//                   </button>
//                 )}

//                 {/* Conditionally render Fingerprint and Find Similar buttons */}
//                 {!shouldHideAdvancedButtons() && (
//                   <>
//                     {/* Fingerprint Button - Hidden for Rehome Pet and Safe at Home */}
//                     <button
//                       onClick={handleGenerateFingerprint}
//                       disabled={pet?.has_generated_fingerprint}
//                       className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
//                         pet?.has_generated_fingerprint
//                           ? "bg-gray-100 text-gray-500 cursor-not-allowed"
//                           : "bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-100"
//                       }`}
//                     >
//                       <FileText size={16} />
//                       {pet?.has_generated_fingerprint ? "Fingerprint Generated" : "Generate Fingerprint"}
//                     </button>

//                     {/* Find Similar Pets Button - Hidden for Rehome Pet and Safe at Home */}
//                     <button
//                       onClick={() => router.push(`/pet_profile/${id}/similar`)}
//                       className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition-colors border border-emerald-100"
//                     >
//                       <Search size={16} />
//                       Find Similar Pets
//                     </button>
//                   </>
//                 )}
//               </div>
//             </div>
//           </div>
//         </div>
//       </main>

//       <Footer />
//       <Toaster position="bottom-right" />
//     </div>
//   )
// }

// function getPetImageUrl(imageName) {
//   if (!imageName) return "https://via.placeholder.com/100"
//   // Handle the format "1/main.jpg" -> "https://fkpimtcxncgwtdsfyrjb.supabase.co/storage/v1/object/public/pet-images/1/main.jpg"
//   return `${SUPABASE_URL}/storage/v1/object/public/${PET_IMAGES_BUCKET}/${imageName}`
// }
















