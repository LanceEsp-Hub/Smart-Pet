
"use client"
import { useRouter } from "next/router"
import { useState, useEffect, useRef } from "react"
import {
  Save,
  ArrowLeft,
  Camera,
  Trash2,
  Loader2,
  Info,
  MapPin,
  Calendar,
  Tag,
  User,
  FileText,
  CheckCircle,
  X,
  AlertTriangle,
} from "lucide-react"
import toast, { Toaster } from "react-hot-toast"
import Navbar from "../../components/Navbar"
import Footer from "../../components/Footer"

import {
  fetchPetDetails,
  updatePetDetails,
  updatePetImage,
  addAdditionalImage,
  removeAdditionalImage,
  verifyPetImage,
  clearAdditionalImages,
  generateFingerprint, // Comment this out for now
} from "../../utils/api"

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://fkpimtcxncgwtdsfyrjb.supabase.co"
const PET_IMAGES_BUCKET = "pet-images"

function getPetImageUrl(imageName) {
  if (!imageName) return "https://via.placeholder.com/100"
  // Handle the format "1/main.jpg" -> "https://fkpimtcxncgwtdsfyrjb.supabase.co/storage/v1/object/public/pet-images/1/main.jpg"
  return `${SUPABASE_URL}/storage/v1/object/public/${PET_IMAGES_BUCKET}/${imageName}`
}

export default function EditPetDetails() {
  const router = useRouter()
  const { id } = router.query
  const [pet, setPet] = useState(null)
  const [loading, setLoading] = useState(true)
  const [newMainImage, setNewMainImage] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const fileInputRef = useRef(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState("")
  const [uploadProgress, setUploadProgress] = useState(0)
  const [newAdditionalImages, setNewAdditionalImages] = useState({})
  const [imagesToDelete, setImagesToDelete] = useState([])
  const [isClearing, setIsClearing] = useState(false)
  const [activeTab, setActiveTab] = useState("basic")
  const [showClearModal, setShowClearModal] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [showAdditionalPhotosModal, setShowAdditionalPhotosModal] = useState(false)
  const [isGeneratingFingerprint, setIsGeneratingFingerprint] = useState(false)

  const [formData, setFormData] = useState({
    name: "",
    type: "Dog",
    gender: "Male",
    description: "",
    address: "",
    date: "",
    status: "Safe at Home",
    healthInfo: {
      vaccinated: "",
      spayedNeutered: "",
      healthDetails: "",
      goodWith: {
        children: false,
        dogs: false,
        cats: false,
        elderly: false,
        strangers: false,
      },
      energyLevel: "",
      temperamentPersonality: "",
      reasonForAdoption: "",
    },
  })

  const statusOptions = ["Safe at Home", "Lost", "Pet I Found", "Reunited"]

  // // Load pet data
  // useEffect(() => {
  //   const loadPet = async () => {
  //     if (!id) return

  //     try {
  //       const petData = await fetchPetDetails(id)
  //       setPet(petData)
  //       setFormData({
  //         name: petData.name,
  //         type: petData.type,
  //         gender: petData.gender,
  //         description: petData.description || "",
  //         address: petData.address || "",
  //         date: petData.date ? new Date(petData.date).toISOString().slice(0, 16) : "",
  //         status: petData.status || "Safe at Home",
  //         healthInfo: {
  //           vaccinated: petData.health_info?.vaccinated || "",
  //           spayedNeutered: petData.health_info?.spayed_neutered || "",
  //           healthDetails: petData.health_info?.health_details || "",
  //           goodWith: {
  //             children: petData.health_info?.good_with_children || false,
  //             dogs: petData.health_info?.good_with_dogs || false,
  //             cats: petData.health_info?.good_with_cats || false,
  //             elderly: petData.health_info?.good_with_elderly || false,
  //             strangers: petData.health_info?.good_with_strangers || false,
  //           },
  //           energyLevel: petData.health_info?.energy_level || "",
  //           temperamentPersonality: petData.health_info?.temperament_personality || "",
  //           reasonForAdoption: petData.health_info?.reason_for_adoption || "",
  //         },
  //       })
 

  //       // Check if additional photos exist
  //       const hasAdditionalPhotos = petData.additional_images && petData.additional_images.length > 0
  //       if (!hasAdditionalPhotos) {
  //         setShowAdditionalPhotosModal(true)
  //       }

  //       setLoading(false)
  //     } catch (error) {
  //       console.error("Failed to load pet:", error)
  //       toast.error("Failed to load pet details")
  //       router.push("/dashboard")
  //     }
  //   }

  //   if (router.isReady) {
  //     loadPet()
  //   }
  // }, [id, router, router.isReady])
    // Load pet data
  // Load pet data
  useEffect(() => {
    const loadPet = async () => {
      if (!id) return

      try {
        const petData = await fetchPetDetails(id)
        setPet(petData)
        console.log("Pet health info from backend:", petData.health_info); // Debug log
        console.log("Raw good_with values:", {
          children: petData.health_info?.good_with?.children,
          dogs: petData.health_info?.good_with?.dogs,
          cats: petData.health_info?.good_with?.cats,
          elderly: petData.health_info?.good_with?.elderly,
          strangers: petData.health_info?.good_with?.strangers,
        }); // Debug log
        
        setFormData({
          name: petData.name,
          type: petData.type,
          gender: petData.gender,
          description: petData.description || "",
          address: petData.address || "",
          date: petData.date ? new Date(petData.date).toISOString().slice(0, 16) : "",
          status: petData.status || "Safe at Home",
          healthInfo: {
            vaccinated: petData.health_info?.vaccinated || "",
            spayedNeutered: petData.health_info?.spayed_neutered || "",
            healthDetails: petData.health_info?.health_details || "",
            goodWith: {
              children: petData.health_info?.good_with?.children === true || petData.health_info?.good_with?.children === "true" || false,
              dogs: petData.health_info?.good_with?.dogs === true || petData.health_info?.good_with?.dogs === "true" || false,
              cats: petData.health_info?.good_with?.cats === true || petData.health_info?.good_with?.cats === "true" || false,
              elderly: petData.health_info?.good_with?.elderly === true || petData.health_info?.good_with?.elderly === "true" || false,
              strangers: petData.health_info?.good_with?.strangers === true || petData.health_info?.good_with?.strangers === "true" || false,
            },
            energyLevel: petData.health_info?.energy_level || "",
            temperamentPersonality: petData.health_info?.temperament_personality || "",
            reasonForAdoption: petData.health_info?.reason_for_adoption || "",
          },
        })
        
        console.log("Form data goodWith:", {
          children: petData.health_info?.good_with?.children === true || petData.health_info?.good_with?.children === "true" || false,
          dogs: petData.health_info?.good_with?.dogs === true || petData.health_info?.good_with?.dogs === "true" || false,
          cats: petData.health_info?.good_with?.cats === true || petData.health_info?.good_with?.cats === "true" || false,
          elderly: petData.health_info?.good_with?.elderly === true || petData.health_info?.good_with?.elderly === "true" || false,
          strangers: petData.health_info?.good_with?.strangers === true || petData.health_info?.good_with?.strangers === "true" || false,
        }); // Debug log

        // Check if additional photos exist
        const hasAdditionalPhotos = petData.additional_images && petData.additional_images.length > 0
        if (!hasAdditionalPhotos) {
          setShowAdditionalPhotosModal(true)
        }

        setLoading(false)
      } catch (error) {
        console.error("Failed to load pet:", error)
        toast.error("Failed to load pet details")
        router.push("/dashboard")
      }
    }

    if (router.isReady) {
      loadPet()
    }
  }, [id, router, router.isReady])
  
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [previewUrl])

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // For health info fields
  const handleHealthInfoChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      healthInfo: {
        ...prev.healthInfo,
        [name]: value,
      },
    }))
  }

  // For goodWith checkboxes
  const handleGoodWithChange = (field) => {
    setFormData((prev) => ({
      ...prev,
      healthInfo: {
        ...prev.healthInfo,
        goodWith: {
          ...prev.healthInfo.goodWith,
          [field]: !prev.healthInfo.goodWith[field],
        },
      },
    }))
  }

  const handleClearAdditionalImages = async () => {
    try {
      setIsClearing(true)
      const result = await clearAdditionalImages(pet.id)

      // Update state
      setPet((prev) => ({
        ...prev,
        additional_images: [],
      }))
      setNewAdditionalImages({})
      setImagesToDelete([])

      toast.success(result.message || "Additional views cleared successfully")
    } catch (error) {
      toast.error(error.message || "Failed to clear additional views")
    } finally {
      setIsClearing(false)
      setShowClearModal(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      setIsSaving(true)
      toast.loading("Saving pet details...")

      // Prepare the data for backend - now includes healthInfo
      const petUpdateData = {
        name: formData.name,
        type: formData.type,
        gender: formData.gender,
        description: formData.description,
        address: formData.address,
        date: formData.date,
        status: formData.status,
        // Health Information
        health_info: {
          vaccinated: formData.healthInfo.vaccinated,
          spayed_neutered: formData.healthInfo.spayedNeutered,
          health_details: formData.healthInfo.healthDetails,
          good_with_children: formData.healthInfo.goodWith.children,
          good_with_dogs: formData.healthInfo.goodWith.dogs,
          good_with_cats: formData.healthInfo.goodWith.cats,
          good_with_elderly: formData.healthInfo.goodWith.elderly,
          good_with_strangers: formData.healthInfo.goodWith.strangers,
          energy_level: formData.healthInfo.energyLevel,
          temperament_personality: formData.healthInfo.temperamentPersonality,
          reason_for_adoption: formData.healthInfo.reasonForAdoption,
        },
      }

      // First save pet details and health info together
      await updatePetDetails(id, petUpdateData)

      // Process main image if there's a new one
      if (newMainImage) {
        await updatePetImage(id, newMainImage)
      }

      // Process additional images
      for (const [imageType, imageData] of Object.entries(newAdditionalImages)) {
        await addAdditionalImage(id, imageData.file, imageType)
      }

      // Process deletions
      for (const imageType of imagesToDelete) {
        const filename = `${imageType}.jpg`
        const index = pet.additional_images?.indexOf(filename)
        if (index >= 0) {
          await removeAdditionalImage(id, index)
        }
      }

      toast.dismiss()
      toast.success("Pet details updated successfully")

      // Switch to health tab
      setActiveTab("health")

      // Auto-generate fingerprint
      setTimeout(async () => {
        try {
          setIsGeneratingFingerprint(true)
          toast.loading("Generating pet fingerprint...")

          // Check if pet type is valid for fingerprint generation
          const validTypes = ["dog", "cat"]
          const validStatuses = ["lost", "pet i found"]

          if (!validTypes.includes(formData.type.toLowerCase())) {
            toast.dismiss()
            toast.success("Pet details saved! Please publish your pet to make it visible to the public!", {
              duration: 6000,
            })
            setTimeout(() => router.push(`/pet_profile/${id}`), 1500)
            return
          }

          if (!validStatuses.includes(formData.status.toLowerCase())) {
            toast.dismiss()
            toast.success("Pet details saved! Please publish your pet to make it visible to the public!", {
              duration: 6000,
            })
            setTimeout(() => router.push(`/pet_profile/${id}`), 1500)
            return
          }

          // Call the generateFingerprint function with status
          await generateFingerprint(id, formData.status)

          toast.dismiss()
          toast.success("Pet fingerprint generated successfully!")

          // Show publish notification and redirect
          setTimeout(() => {
            toast.success("Please publish your pet to make it visible to the public!", {
              duration: 6000,
            })
            router.push(`/pet_profile/${id}`)
          }, 1500)
        } catch (error) {
          console.error("Fingerprint generation error:", error)
          toast.dismiss()

          // Show appropriate error message based on the error
          if (error.message.includes("Missing required images")) {
            toast.error("Please add all required photos (main, face, side, fur) before generating fingerprint")
          } else if (error.message.includes("Pet type must be")) {
            toast.error("Fingerprint generation is only available for dogs and cats")
          } else if (error.message.includes("Status must be")) {
            toast.error("Fingerprint generation is only available for lost pets or found pets")
          } else {
            // Don't show error, just proceed to redirect
            setTimeout(() => {
              toast.success("Pet details saved! Please publish your pet to make it visible to the public!", {
                duration: 6000,
              })
              router.push(`/pet_profile/${id}`)
            }, 1000)
          }
        } finally {
          setIsGeneratingFingerprint(false)
        }
      }, 1000)
    } catch (error) {
      toast.dismiss()
      toast.error(error.message || "Failed to update pet")
      setIsSaving(false)
    }
  }

  const handleMainImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Reset input and state
    e.target.value = ""
    setPreviewUrl(null)
    setNewMainImage(null)

    // Basic client-side validation
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload a valid image file (JPEG, PNG)")
      return
    }

    try {
      setIsUploading(true)
      setUploadStatus("Verifying pet image...")
      setUploadProgress(10) // Initial progress

      // Progress simulation function
      const simulateProgress = async () => {
        await new Promise((resolve) => setTimeout(resolve, 500))
        setUploadProgress(30)
        setUploadStatus("Analyzing image...")

        await new Promise((resolve) => setTimeout(resolve, 700))
        setUploadProgress(70)
        setUploadStatus("Checking for pets...")

        await new Promise((resolve) => setTimeout(resolve, 800))
        setUploadProgress(95)

        await new Promise((resolve) => setTimeout(resolve, 1000))
        setUploadProgress(99)
      }

      // Start progress simulation (don't await yet)
      const progressPromise = simulateProgress()

      // Run verification concurrently with progress
      const verificationPromise = verifyPetImage(file)

      // Wait for both to complete
      const [response] = await Promise.all([verificationPromise, progressPromise])

      // Complete the progress
      setUploadProgress(100)
      setUploadStatus("Verification complete!")

      if (response.error) {
        // Handle specific error cases
        if (response.error === "invalid_file_type") {
          toast.error("Please upload a JPEG or PNG image")
        } else if (response.error === "invalid_image_format") {
          toast.error("The image file appears to be corrupted")
        } else {
          toast.error("Could not verify image. Please try another photo.")
        }
        return
      }

      if (!response.is_valid) {
        toast.error(response.message || "Please upload a clear photo of a cat or dog")
        return
      }

      // If we get here, verification passed
      const preview = URL.createObjectURL(file)
      setPreviewUrl(preview)
      setNewMainImage(file)
      toast.success("Pet image verified successfully!")

      // Brief delay before resetting progress
      await new Promise((resolve) => setTimeout(resolve, 1000))
    } catch (error) {
      console.error("Verification error:", error)
      toast.error("Image verification service is currently unavailable")
    } finally {
      setUploadProgress(0)
      setUploadStatus("")
      setIsUploading(false)
    }
  }

  const handleAddAdditionalImage = (e, imageType) => {
    const file = e.target.files[0]
    if (!file) return

    // Create preview URL
    const previewUrl = URL.createObjectURL(file)

    setNewAdditionalImages((prev) => ({
      ...prev,
      [imageType]: {
        file,
        previewUrl,
        filename: `${imageType}.jpg`,
      },
    }))
  }

  // Modified handler for removing images
  const handleRemoveImage = (imageType) => {
    // If it's an existing image, mark for deletion
    if (pet.additional_images?.includes(`${imageType}.jpg`)) {
      setImagesToDelete((prev) => [...prev, imageType])
    }

    // Remove from new images if it was just added
    setNewAdditionalImages((prev) => {
      const updated = { ...prev }
      delete updated[imageType]
      return updated
    })
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "Lost":
        return "from-red-500 to-red-600"
      case "Pet I Found":
        return "from-blue-500 to-blue-600"
      case "Reunited":
        return "from-purple-500 to-purple-600"
      case "Safe at Home":
      default:
        return "from-green-500 to-green-600"
    }
  }

  // Add this check early to prevent errors
  if (!router.isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading pet details...</p>
        </div>
      </div>
    )

  if (!pet)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full">
          <div className="text-yellow-500 text-center mb-4">
            <Info size={48} className="mx-auto" />
          </div>
          <h2 className="text-2xl font-bold text-center mb-4">Pet Not Found</h2>
          <p className="text-gray-600 text-center">The pet you're trying to edit doesn't exist or has been removed.</p>
          <button
            onClick={() => router.push("/pet_dashboard")}
            className="mt-6 w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg transition-colors"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    )

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Page Title with Back Button */}
        <div className="flex items-center mb-6">
          <button
            onClick={() => router.back()}
            className="text-black mr-3 p-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-black text-2xl font-bold">Edit {pet.name}</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Status Banner */}
          <div
            className={`py-3 px-6 bg-gradient-to-r ${getStatusColor(formData.status)} text-white rounded-xl shadow-sm`}
          >
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="font-medium">Current Status: {formData.status}</span>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">Change Status:</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="bg-white/20 border-0 text-white rounded-lg py-1 px-2 text-sm focus:ring-2 focus:ring-white/50"
                >
                  {statusOptions.map((option) => (
                    <option key={option} value={option} className="text-gray-800">
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="flex border-b border-gray-200">
              <button
                type="button"
                onClick={() => setActiveTab("basic")}
                className={`px-4 py-3 font-medium text-sm transition-colors ${
                  activeTab === "basic"
                    ? "text-purple-600 border-b-2 border-purple-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Basic Information
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("photos")}
                className={`px-4 py-3 font-medium text-sm transition-colors ${
                  activeTab === "photos"
                    ? "text-purple-600 border-b-2 border-purple-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Photos
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("details")}
                className={`px-4 py-3 font-medium text-sm transition-colors ${
                  activeTab === "details"
                    ? "text-purple-600 border-b-2 border-purple-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Additional Details
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("health")}
                className={`px-4 py-3 font-medium text-sm transition-colors ${
                  activeTab === "health"
                    ? "text-purple-600 border-b-2 border-purple-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Health & Behavior
              </button>
            </div>

            <div className="p-6">
              {/* Basic Information Tab */}
              {activeTab === "basic" && (
                <div className="space-y-6 text-black">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1.5">
                          <Tag size={16} className="text-purple-500" />
                          Pet Name*
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1.5">
                          <Tag size={16} className="text-purple-500" />
                          Pet Type*
                        </label>
                        <select
                          name="type"
                          value={formData.type}
                          onChange={handleChange}
                          className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                          required
                        >
                          <option value="Dog">Dog</option>
                          <option value="Cat">Cat</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1.5">
                          <User size={16} className="text-purple-500" />
                          Gender*
                        </label>
                        <select
                          name="gender"
                          value={formData.gender}
                          onChange={handleChange}
                          className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                          required
                        >
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1.5">
                          <Calendar size={16} className="text-purple-500" />
                          {formData.status === "Lost"
                            ? "Date Lost*"
                            : formData.status === "Pet I Found"
                              ? "Date Found*"
                              : "Birthdate*"}
                        </label>
                        <input
                          type="datetime-local"
                          name="date"
                          value={formData.date}
                          onChange={handleChange}
                          className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1.5">
                          <MapPin size={16} className="text-purple-500" />
                          {formData.status === "Lost" ? "Last Seen Location" : "Location"}
                        </label>
                        <input
                          type="text"
                          name="address"
                          value={formData.address}
                          onChange={handleChange}
                          className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                          placeholder={
                            formData.status === "Lost" ? "Where was your pet last seen?" : "Where is your pet located?"
                          }
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1.5">
                          <FileText size={16} className="text-purple-500" />
                          Description
                        </label>
                        <textarea
                          name="description"
                          value={formData.description}
                          onChange={handleChange}
                          className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                          rows="4"
                          placeholder="Describe your pet's appearance, personality, special markings, etc."
                        />
                      </div>
                    </div>
                  </div>

                  {/* Status-specific tips */}
                  {formData.status === "Lost" && (
                    <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100 mt-6">
                      <h3 className="font-semibold text-yellow-800 mb-2 flex items-center gap-2">
                        <Info size={18} />
                        Tips for Lost Pets
                      </h3>
                      <ul className="space-y-1 text-sm text-yellow-700">
                        <li className="flex items-start gap-2">
                          <CheckCircle className="flex-shrink-0 mt-0.5" size={14} />
                          <span>Provide a detailed description including distinctive features</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="flex-shrink-0 mt-0.5" size={14} />
                          <span>Add the exact location where your pet was last seen</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="flex-shrink-0 mt-0.5" size={14} />
                          <span>Upload clear, recent photos from multiple angles</span>
                        </li>
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Photos Tab */}
              {activeTab === "photos" && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-black text-lg font-semibold mb-2">Main Photo</h3>
                    <p className="text-sm text-gray-500 mb-4">
                      This is the primary photo that will be displayed for your pet.
                    </p>

                    <div className="max-w-sm mx-auto">
                      <div className="text-black relative aspect-square rounded-xl overflow-hidden border border-gray-200 shadow-sm">
                        {previewUrl ? (
                          <>
                            <img
                              src={previewUrl || "/placeholder.svg"}
                              alt="New pet photo preview"
                              className="object-cover w-full h-full"
                            />
                            <div className="absolute top-2 left-2 bg-white/80 text-xs font-medium px-2 py-1 rounded-full backdrop-blur-sm">
                              New Preview
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setPreviewUrl(null)
                                setNewMainImage(null)
                                if (fileInputRef.current) fileInputRef.current.value = ""
                              }}
                              className="absolute bottom-2 right-2 bg-white/80 p-2 rounded-full shadow-sm text-red-500 hover:bg-red-50 transition-colors backdrop-blur-sm"
                            >
                              <Trash2 size={16} />
                            </button>
                          </>
                        ) : pet.image ? (
                          <>
                            <img
                              src={getPetImageUrl(pet.image)}
                              alt="Current pet photo"
                              className="text-black object-cover w-full h-full"
                              onError={(e) => {
                                e.target.onerror = null
                                e.target.src = "/placeholder-pet.jpg"
                              }}
                              key={pet.image}
                            />
                            <div className="absolute top-2 left-2 bg-white/80 text-xs font-medium px-2 py-1 rounded-full backdrop-blur-sm">
                              Current Photo
                            </div>
                            <label className="absolute bottom-2 right-2 bg-white/80 p-2 rounded-full shadow-sm cursor-pointer hover:bg-gray-100 transition-colors backdrop-blur-sm">
                              <Camera size={16} />
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleMainImageUpload}
                                ref={fileInputRef}
                              />
                            </label>
                          </>
                        ) : (
                          <label className="w-full h-full flex items-center justify-center cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={handleMainImageUpload}
                              ref={fileInputRef}
                            />
                            <div className="text-center">
                              <Camera size={32} className="mx-auto text-gray-400 mb-2" />
                              <p className="text-sm text-gray-500">Upload Main Photo</p>
                              <p className="text-xs text-gray-400 mt-1">Click to browse</p>
                            </div>
                          </label>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-black text-lg font-semibold mb-2">Additional Photos</h3>
                    <p className="text-sm text-gray-500 mb-4">
                      Add up to three additional views to help identify your pet.
                    </p>

                    <div className="text-black grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {["face", "side", "fur"].map((type) => {
                        const filename = `${type}.jpg`
                        const isNewImage = newAdditionalImages[type]
                        const isExisting = pet.additional_images?.includes(filename) && !imagesToDelete.includes(type)
                        const imageUrl = isNewImage
                          ? newAdditionalImages[type].previewUrl
                          : getPetImageUrl(`${pet.id}/${filename}`)

                        return isNewImage || isExisting ? (
                          <div
                            key={type}
                            className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 group shadow-sm"
                          >
                            <img
                              src={imageUrl || "/placeholder.svg"}
                              alt={`${type} view of ${pet.name}`}
                              className="object-cover w-full h-full"
                              onError={(e) => {
                                e.target.onerror = null
                                e.target.src = "/default-pet.jpg"
                                e.target.className = "object-contain w-full h-full bg-gray-100 p-4"
                              }}
                            />

                            <div className="absolute top-2 left-2 bg-white/80 text-xs font-medium px-2 py-1 rounded-full capitalize backdrop-blur-sm">
                              {type} View
                            </div>

                            <button
                              type="button"
                              onClick={() => handleRemoveImage(type)}
                              className="absolute top-2 right-2 bg-white/80 p-1.5 rounded-full shadow-sm text-red-500 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 backdrop-blur-sm"
                              aria-label={`Remove ${type} view`}
                            >
                              <Trash2 size={16} strokeWidth={2} />
                            </button>
                          </div>
                        ) : (
                          <label
                            key={type}
                            className="aspect-square rounded-lg bg-gray-50 border-2 border-dashed border-gray-200 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 transition-colors"
                          >
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => handleAddAdditionalImage(e, type)}
                            />
                            <div className="flex flex-col items-center">
                              <Camera size={24} className="text-gray-400 mb-1" />
                              <p className="text-sm text-gray-500 capitalize">{type} View</p>
                              <p className="text-xs text-gray-400 mt-1">Click to upload</p>
                            </div>
                          </label>
                        )
                      })}
                    </div>

                    <div className="mt-6">
                      <button
                        type="button"
                        onClick={() => setShowClearModal(true)}
                        disabled={
                          isClearing || (!pet.additional_images?.length && !Object.keys(newAdditionalImages).length)
                        }
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isClearing ? (
                          <>
                            <Loader2 size={16} className="animate-spin" />
                            Clearing...
                          </>
                        ) : (
                          <>
                            <Trash2 size={16} />
                            Clear Additional Views
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Additional Details Tab */}
              {activeTab === "details" && (
                <div className="text-black space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Description</h3>
                    <p className="text-sm text-gray-500 mb-4">
                      Provide a detailed description of your pet to help with identification.
                    </p>

                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      rows="6"
                      placeholder="Describe your pet's appearance, personality, special markings, behavior, etc. The more details you provide, the better!"
                    />
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-2">Location</h3>
                    <p className="text-sm text-gray-500 mb-4">
                      {formData.status === "Lost"
                        ? "Where was your pet last seen? Be as specific as possible."
                        : "Where is your pet located?"}
                    </p>

                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      placeholder="Enter address or location"
                    />
                  </div>

                  {/* Status-specific guidance */}
                  {formData.status === "Lost" && (
                    <div className="bg-purple-50 p-5 rounded-xl border border-purple-100">
                      <h3 className="font-semibold text-lg mb-3 text-purple-800">Helpful Information for Lost Pets</h3>
                      <ul className="space-y-2 text-sm text-purple-700">
                        <li className="flex items-start gap-2">
                          <CheckCircle className="flex-shrink-0 mt-0.5" size={14} />
                          <span>Include any identifying features like scars, markings, or collar details</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="flex-shrink-0 mt-0.5" size={14} />
                          <span>Mention behaviors your pet might exhibit when approached by strangers</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="flex-shrink-0 mt-0.5" size={14} />
                          <span>Note any medical conditions or special needs your pet may have</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="flex-shrink-0 mt-0.5" size={14} />
                          <span>Include nearby landmarks or areas your pet might frequent</span>
                        </li>
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Health & Behavior Tab */}
              {activeTab === "health" && (
                <div className="space-y-8">
                  {/* Health Information Section */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4 text-gray-800">Health Information</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Vaccinated? *</label>
                        <div className="space-y-2">
                          {["Yes", "No", "Partial"].map((option) => (
                            <label key={option} className="flex items-center">
                              <input
                                type="radio"
                                name="vaccinated"
                                value={option}
                                checked={formData.healthInfo.vaccinated === option}
                                onChange={handleHealthInfoChange}
                                className="mr-2 text-purple-600 focus:ring-purple-500"
                              />
                              <span className="text-sm text-gray-700">{option}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Spayed/Neutered? *</label>
                        <div className="space-y-2">
                          {["Yes", "No"].map((option) => (
                            <label key={option} className="flex items-center">
                              <input
                                type="radio"
                                name="spayedNeutered"
                                value={option}
                                checked={formData.healthInfo.spayedNeutered === option}
                                onChange={handleHealthInfoChange}
                                className="mr-2 text-purple-600 focus:ring-purple-500"
                              />
                              <span className="text-sm text-gray-700">{option}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="text-black mt-6">
                      <label className="text-black block text-sm font-medium text-gray-700 mb-2">Health Details</label>
                      <textarea
                        name="healthDetails"
                        value={formData.healthInfo.healthDetails}
                        onChange={handleHealthInfoChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        rows="3"
                        placeholder="Enter any health conditions, medications, special needs, etc."
                      />
                    </div>
                  </div>

                  {/* Temperament & Behavior Section */}
                  <div className="border-t border-gray-200 pt-8">
                    <h3 className="text-lg font-semibold mb-4 text-gray-800">Temperament & Behavior</h3>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Good with (select all that apply):
                      </label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {[
                          { key: "children", label: "Children" },
                          { key: "dogs", label: "Dogs" },
                          { key: "cats", label: "Cats" },
                          { key: "elderly", label: "Elderly" },
                          { key: "strangers", label: "Strangers" },
                        ].map(({ key, label }) => (
                          <label key={key} className="flex items-center">
                            <input
                              type="checkbox"
                              checked={formData.healthInfo.goodWith[key]}
                              onChange={() => handleGoodWithChange(key)}
                              className="mr-2 text-purple-600 focus:ring-purple-500 rounded"
                            />
                            <span className="text-sm text-gray-700">{label}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="mt-6">
                      <label className="text-black block text-sm font-medium text-gray-700 mb-2">Energy Level</label>
                      <select
                        name="energyLevel"
                        value={formData.healthInfo.energyLevel}
                        onChange={handleHealthInfoChange}
                        className="text-black w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      >
                        <option value="">Select energy level</option>
                        <option value="Low">Low</option>
                        <option value="Moderate">Moderate</option>
                        <option value="High">High</option>
                        <option value="Very High">Very High</option>
                      </select>
                    </div>

                    <div className="mt-6">
                      <label className="text-black block text-sm font-medium text-gray-700 mb-2">Temperament & Personality</label>
                      <textarea
                        name="temperamentPersonality"
                        value={formData.healthInfo.temperamentPersonality}
                        onChange={handleHealthInfoChange}
                        className="text-black w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        rows="4"
                        placeholder="Describe the pet's personality, behavior traits, etc."
                      />
                    </div>
                  </div>

                  {/* Adoption Details Section */}
                  <div className="border-t border-gray-200 pt-8">
                    <h3 className="text-lg font-semibold mb-4 text-gray-800">Adoption Details</h3>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Reason for Adoption *</label>
                      <textarea
                        name="reasonForAdoption"
                        value={formData.healthInfo.reasonForAdoption}
                        onChange={handleHealthInfoChange}
                        className="text-black w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        rows="3"
                        placeholder="Please explain why you are looking to rehome this pet..."
                        required
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Save Button - Centered at the bottom of the form */}
          <div className="flex justify-center pt-4">
            <button
              type="submit"
              disabled={isSaving || isGeneratingFingerprint}
              className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-lg shadow-md transition-colors disabled:opacity-70"
            >
              {isSaving ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Saving Changes...
                </>
              ) : isGeneratingFingerprint ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Generating Fingerprint...
                </>
              ) : (
                <>
                  <Save size={20} />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </main>

      <Footer />

      {/* Additional Photos Required Modal */}
      {showAdditionalPhotosModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl max-w-md w-full shadow-lg animate-fade-in">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">Additional Photos Required</h3>
              <button
                type="button"
                onClick={() => setShowAdditionalPhotosModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mb-6">
              <div className="flex items-center gap-3 mb-4 text-blue-600">
                <Info size={24} />
                <p className="font-medium">Improve Search Accuracy</p>
              </div>
              <p className="text-gray-600">
                To make your pet search more accurate and help with identification, please add additional photos (face,
                side, and fur views) in the Photos tab before proceeding.
              </p>
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowAdditionalPhotosModal(false)
                  setActiveTab("photos")
                }}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
              >
                <Camera size={16} />
                Add Photos Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clear Additional Images Modal */}
      {showClearModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl max-w-md w-full shadow-lg animate-fade-in">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">Clear Additional Views?</h3>
              <button
                type="button"
                onClick={() => setShowClearModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mb-6">
              <div className="flex items-center gap-3 mb-4 text-amber-600">
                <AlertTriangle size={24} />
                <p className="font-medium">This action cannot be undone</p>
              </div>
              <p className="text-gray-600">
                Are you sure you want to clear all additional views? This will remove face, side and fur photos but keep
                the main image.
              </p>
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowClearModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleClearAdditionalImages}
                disabled={isClearing}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
              >
                {isClearing ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Clearing...
                  </>
                ) : (
                  <>
                    <Trash2 size={16} />
                    Clear Views
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Progress Indicator */}
      {isUploading && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl max-w-md w-full shadow-lg animate-fade-in">
            <h3 className="font-medium text-lg mb-3">{uploadStatus}</h3>
            <div className="w-full bg-gray-200 rounded-full h-2.5 mb-3">
              <div
                className="bg-gradient-to-r from-purple-500 to-purple-600 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-500 text-center">{uploadProgress}% complete</p>
          </div>
        </div>
      )}

      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 5000,
          style: {
            background: "#363636",
            color: "#fff",
            borderRadius: "8px",
            padding: "16px",
          },
          success: {
            iconTheme: {
              primary: "#10B981",
              secondary: "white",
            },
          },
          error: {
            iconTheme: {
              primary: "#EF4444",
              secondary: "white",
            },
          },
        }}
      />

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  )
}























































// // //frontend\pages\edit_pet_details\[id].js
// // "use client"
// import { useRouter } from "next/router"
// import { useState, useEffect, useRef } from "react"
// import {
//   Save,
//   ArrowLeft,
//   Camera,
//   Trash2,
//   Loader2,
//   Info,
//   MapPin,
//   Calendar,
//   Tag,
//   User,
//   FileText,
//   CheckCircle,
//   X,
//   AlertTriangle,
// } from "lucide-react"
// import toast, { Toaster } from "react-hot-toast"
// import Navbar from "../../components/Navbar"
// import Footer from "../../components/Footer"

// import {
//   fetchPetDetails,
//   updatePetDetails,
//   updatePetImage,
//   addAdditionalImage,
//   removeAdditionalImage,
//   verifyPetImage,
//   clearAdditionalImages,
// } from "../../utils/api"

// export default function EditPetDetails() {
//   const router = useRouter()
//   const { id } = router.query
//   const [pet, setPet] = useState(null)
//   const [loading, setLoading] = useState(true)
//   const [newMainImage, setNewMainImage] = useState(null)
//   const [previewUrl, setPreviewUrl] = useState(null)
//   const fileInputRef = useRef(null)
//   const [isUploading, setIsUploading] = useState(false)
//   const [uploadStatus, setUploadStatus] = useState("")
//   const [uploadProgress, setUploadProgress] = useState(0)
//   const [newAdditionalImages, setNewAdditionalImages] = useState({})
//   const [imagesToDelete, setImagesToDelete] = useState([])
//   const [isClearing, setIsClearing] = useState(false)
//   const [activeTab, setActiveTab] = useState("basic")
//   const [showClearModal, setShowClearModal] = useState(false)
//   const [isSaving, setIsSaving] = useState(false)

//   const [formData, setFormData] = useState({
//     name: "",
//     type: "Dog",
//     gender: "Male",
//     description: "",
//     address: "",
//     date: "",
//     status: "Safe at Home",
//     healthInfo: {  // Ensure healthInfo always exists
//       vaccinated: "",
//       spayedNeutered: "",
//       healthDetails: "",
//       goodWith: {
//         children: false,
//         dogs: false,
//         cats: false,
//         elderly: false,
//         strangers: false,
//       },
//       energyLevel: "",
//       temperamentPersonality: "",
//       reasonForAdoption: "",
//     }
//   })

//   const statusOptions = ["Safe at Home", "Lost", "Pet I Found", "Reunited"]

//   // Load pet data
//   useEffect(() => {
//     const loadPet = async () => {
//       if (!id) return
  
//       try {
//         const petData = await fetchPetDetails(id)
//         setPet(petData)
//         setFormData({
//           name: petData.name,
//           type: petData.type,
//           gender: petData.gender,
//           description: petData.description || "",
//           address: petData.address || "",
//           date: petData.date ? new Date(petData.date).toISOString().slice(0, 16) : "",
//           status: petData.status || "Safe at Home",
//           healthInfo: {
//             vaccinated: petData.health_info?.vaccinated || "",
//             spayedNeutered: petData.health_info?.spayed_neutered || "",
//             healthDetails: petData.health_info?.health_details || "",
//             goodWith: {
//               children: petData.health_info?.good_with_children || false,
//               dogs: petData.health_info?.good_with_dogs || false,
//               cats: petData.health_info?.good_with_cats || false,
//               elderly: petData.health_info?.good_with_elderly || false,
//               strangers: petData.health_info?.good_with_strangers || false,
//             },
//             energyLevel: petData.health_info?.energy_level || "",
//             temperamentPersonality: petData.health_info?.temperament_personality || "",
//             reasonForAdoption: petData.health_info?.reason_for_adoption || "",
//           }
//         })
//         setLoading(false)
//       } catch (error) {
//         console.error("Failed to load pet:", error)
//         toast.error("Failed to load pet details")
//         router.push("/dashboard")
//       }
//     }
  
//     if (router.isReady) {
//       loadPet()
//     }
//   }, [id, router, router.isReady])

//   useEffect(() => {
//     return () => {
//       if (previewUrl) {
//         URL.revokeObjectURL(previewUrl)
//       }
//     }
//   }, [previewUrl])

//   // Handle form input changes
//   const handleChange = (e) => {
//     const { name, value } = e.target
//     setFormData((prev) => ({ ...prev, [name]: value }))
//   }

//   // For health info fields
// const handleHealthInfoChange = (e) => {
//   const { name, value } = e.target
//   setFormData(prev => ({
//     ...prev,
//     healthInfo: {
//       ...prev.healthInfo,
//       [name]: value
//     }
//   }))
// }

// // For goodWith checkboxes
// const handleGoodWithChange = (field) => {
//   setFormData(prev => ({
//     ...prev,
//     healthInfo: {
//       ...prev.healthInfo,
//       goodWith: {
//         ...prev.healthInfo.goodWith,
//         [field]: !prev.healthInfo.goodWith[field]
//       }
//     }
//   }))
// }

//   const handleCheckboxChange = (category, field) => {
//     setFormData((prev) => ({
//       ...prev,
//       [category]: {
//         ...prev[category],
//         [field]: !prev[category][field],
//       },
//     }))
//   }

//   const handleClearAdditionalImages = async () => {
//     try {
//       setIsClearing(true)
//       const result = await clearAdditionalImages(pet.id)

//       // Update state
//       setPet((prev) => ({
//         ...prev,
//         additional_images: [],
//       }))
//       setNewAdditionalImages({})
//       setImagesToDelete([])

//       toast.success(result.message || "Additional views cleared successfully")
//     } catch (error) {
//       toast.error(error.message || "Failed to clear additional views")
//     } finally {
//       setIsClearing(false)
//       setShowClearModal(false)
//     }
//   }

//   // const handleSubmit = async (e) => {
//   //   e.preventDefault()

//   //   try {
//   //     setIsSaving(true)
//   //     toast.loading("Saving pet details...")

//   //     // First save regular pet details
//   //     await updatePetDetails(id, formData)

//   //     // Process main image if there's a new one
//   //     if (newMainImage) {
//   //       await updatePetImage(id, newMainImage)
//   //     }

//   //     // Process additional images
//   //     for (const [imageType, imageData] of Object.entries(newAdditionalImages)) {
//   //       await addAdditionalImage(id, imageData.file, imageType)
//   //     }

//   //     // Process deletions
//   //     for (const imageType of imagesToDelete) {
//   //       const filename = `${imageType}.jpg`
//   //       const index = pet.additional_images?.indexOf(filename)
//   //       if (index >= 0) {
//   //         await removeAdditionalImage(id, index)
//   //       }
//   //     }

//   //     toast.dismiss()
//   //     toast.success("Pet details updated successfully")
//   //     setTimeout(() => router.push(`/pet_profile/${id}`), 1000)
//   //   } catch (error) {
//   //     toast.dismiss()
//   //     toast.error(error.message || "Failed to update pet")
//   //     setIsSaving(false)
//   //   }
//   // }

//   const handleSubmit = async (e) => {
//     e.preventDefault()
  
//     try {
//       setIsSaving(true)
//       toast.loading("Saving pet details...")
  
//       // Prepare the data for backend - now includes healthInfo
//       const petUpdateData = {
//         name: formData.name,
//         type: formData.type,
//         gender: formData.gender,
//         description: formData.description,
//         address: formData.address,
//         date: formData.date,
//         status: formData.status,
//         // Health Information
//         health_info: {
//           vaccinated: formData.healthInfo.vaccinated,
//           spayed_neutered: formData.healthInfo.spayedNeutered,
//           health_details: formData.healthInfo.healthDetails,
//           good_with_children: formData.healthInfo.goodWith.children,
//           good_with_dogs: formData.healthInfo.goodWith.dogs,
//           good_with_cats: formData.healthInfo.goodWith.cats,
//           good_with_elderly: formData.healthInfo.goodWith.elderly,
//           good_with_strangers: formData.healthInfo.goodWith.strangers,
//           energy_level: formData.healthInfo.energyLevel,
//           temperament_personality: formData.healthInfo.temperamentPersonality,
//           reason_for_adoption: formData.healthInfo.reasonForAdoption,
//         }
//       }
  
//       // First save pet details and health info together
//       await updatePetDetails(id, petUpdateData)
  
//       // Process main image if there's a new one (unchanged)
//       if (newMainImage) {
//         await updatePetImage(id, newMainImage)
//       }
  
//       // Process additional images (unchanged)
//       for (const [imageType, imageData] of Object.entries(newAdditionalImages)) {
//         await addAdditionalImage(id, imageData.file, imageType)
//       }
  
//       // Process deletions (unchanged)
//       for (const imageType of imagesToDelete) {
//         const filename = `${imageType}.jpg`
//         const index = pet.additional_images?.indexOf(filename)
//         if (index >= 0) {
//           await removeAdditionalImage(id, index)
//         }
//       }
  
//       toast.dismiss()
//       toast.success("Pet details updated successfully")
//       setTimeout(() => router.push(`/pet_profile/${id}`), 1000)
//     } catch (error) {
//       toast.dismiss()
//       toast.error(error.message || "Failed to update pet")
//       setIsSaving(false)
//     }
//   }

//   const handleMainImageUpload = async (e) => {
//     const file = e.target.files[0]
//     if (!file) return

//     // Reset input and state
//     e.target.value = ""
//     setPreviewUrl(null)
//     setNewMainImage(null)

//     // Basic client-side validation
//     if (!file.type.startsWith("image/")) {
//       toast.error("Please upload a valid image file (JPEG, PNG)")
//       return
//     }

//     try {
//       setIsUploading(true)
//       setUploadStatus("Verifying pet image...")
//       setUploadProgress(10) // Initial progress

//       // Progress simulation function
//       const simulateProgress = async () => {
//         await new Promise((resolve) => setTimeout(resolve, 500))
//         setUploadProgress(30)
//         setUploadStatus("Analyzing image...")

//         await new Promise((resolve) => setTimeout(resolve, 700))
//         setUploadProgress(70)
//         setUploadStatus("Checking for pets...")

//         await new Promise((resolve) => setTimeout(resolve, 800))
//         setUploadProgress(95)

//         await new Promise((resolve) => setTimeout(resolve, 1000))
//         setUploadProgress(99)
//       }

//       // Start progress simulation (don't await yet)
//       const progressPromise = simulateProgress()

//       // Run verification concurrently with progress
//       const verificationPromise = verifyPetImage(file)

//       // Wait for both to complete
//       const [response] = await Promise.all([verificationPromise, progressPromise])

//       // Complete the progress
//       setUploadProgress(100)
//       setUploadStatus("Verification complete!")

//       if (response.error) {
//         // Handle specific error cases
//         if (response.error === "invalid_file_type") {
//           toast.error("Please upload a JPEG or PNG image")
//         } else if (response.error === "invalid_image_format") {
//           toast.error("The image file appears to be corrupted")
//         } else {
//           toast.error("Could not verify image. Please try another photo.")
//         }
//         return
//       }

//       if (!response.is_valid) {
//         toast.error(response.message || "Please upload a clear photo of a cat or dog")
//         return
//       }

//       // If we get here, verification passed
//       const preview = URL.createObjectURL(file)
//       setPreviewUrl(preview)
//       setNewMainImage(file)
//       toast.success("Pet image verified successfully!")

//       // Brief delay before resetting progress
//       await new Promise((resolve) => setTimeout(resolve, 1000))
//     } catch (error) {
//       console.error("Verification error:", error)
//       toast.error("Image verification service is currently unavailable")
//     } finally {
//       setUploadProgress(0)
//       setUploadStatus("")
//       setIsUploading(false)
//     }
//   }

//   const handleAddAdditionalImage = (e, imageType) => {
//     const file = e.target.files[0]
//     if (!file) return

//     // Create preview URL
//     const previewUrl = URL.createObjectURL(file)

//     setNewAdditionalImages((prev) => ({
//       ...prev,
//       [imageType]: {
//         file,
//         previewUrl,
//         filename: `${imageType}.jpg`,
//       },
//     }))
//   }

//   // Modified handler for removing images
//   const handleRemoveImage = (imageType) => {
//     // If it's an existing image, mark for deletion
//     if (pet.additional_images?.includes(`${imageType}.jpg`)) {
//       setImagesToDelete((prev) => [...prev, imageType])
//     }

//     // Remove from new images if it was just added
//     setNewAdditionalImages((prev) => {
//       const updated = { ...prev }
//       delete updated[imageType]
//       return updated
//     })
//   }

//   const getStatusColor = (status) => {
//     switch (status) {
//       case "Lost":
//         return "from-red-500 to-red-600"
//       case "Pet I Found":
//         return "from-blue-500 to-blue-600"
//       case "Reunited":
//         return "from-purple-500 to-purple-600"
//       case "Safe at Home":
//       default:
//         return "from-green-500 to-green-600"
//     }
//   }

//   // Add this check early to prevent errors
//   if (!router.isReady) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-50">
//         <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
//       </div>
//     )
//   }

//   if (loading)
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-50">
//         <div className="text-center">
//           <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
//           <p className="text-gray-600">Loading pet details...</p>
//         </div>
//       </div>
//     )

//   if (!pet)
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-50">
//         <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full">
//           <div className="text-yellow-500 text-center mb-4">
//             <Info size={48} className="mx-auto" />
//           </div>
//           <h2 className="text-2xl font-bold text-center mb-4">Pet Not Found</h2>
//           <p className="text-gray-600 text-center">The pet you're trying to edit doesn't exist or has been removed.</p>
//           <button
//             onClick={() => router.push("/pet_dashboard")}
//             className="mt-6 w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg transition-colors"
//           >
//             Return to Dashboard
//           </button>
//         </div>
//       </div>
//     )

//   return (
//     <div className="min-h-screen bg-gray-50">
//       <Navbar />

//       <main className="max-w-6xl mx-auto px-4 py-8">
//         {/* Page Title with Back Button */}
//         <div className="flex items-center mb-6">
//           <button
//             onClick={() => router.back()}
//             className="mr-3 p-2 rounded-full hover:bg-gray-100 transition-colors"
//             aria-label="Go back"
//           >
//             <ArrowLeft size={20} />
//           </button>
//           <h1 className="text-2xl font-bold">Edit {pet.name}</h1>
//         </div>

//         <form onSubmit={handleSubmit} className="space-y-6">
//           {/* Status Banner */}
//           <div
//             className={`py-3 px-6 bg-gradient-to-r ${getStatusColor(formData.status)} text-white rounded-xl shadow-sm`}
//           >
//             <div className="flex justify-between items-center">
//               <div className="flex items-center gap-2">
//                 <span className="font-medium">Current Status: {formData.status}</span>
//               </div>
//               <div className="flex items-center gap-2">
//                 <label className="text-sm font-medium">Change Status:</label>
//                 <select
//                   name="status"
//                   value={formData.status}
//                   onChange={handleChange}
//                   className="bg-white/20 border-0 text-white rounded-lg py-1 px-2 text-sm focus:ring-2 focus:ring-white/50"
//                 >
//                   {statusOptions.map((option) => (
//                     <option key={option} value={option} className="text-gray-800">
//                       {option}
//                     </option>
//                   ))}
//                 </select>
//               </div>
//             </div>
//           </div>

//           {/* Tabs */}
//           <div className="bg-white rounded-xl shadow-sm overflow-hidden">
//             <div className="flex border-b border-gray-200">
//               <button
//                 type="button"
//                 onClick={() => setActiveTab("basic")}
//                 className={`px-4 py-3 font-medium text-sm transition-colors ${
//                   activeTab === "basic"
//                     ? "text-purple-600 border-b-2 border-purple-600"
//                     : "text-gray-500 hover:text-gray-700"
//                 }`}
//               >
//                 Basic Information
//               </button>
//               <button
//                 type="button"
//                 onClick={() => setActiveTab("photos")}
//                 className={`px-4 py-3 font-medium text-sm transition-colors ${
//                   activeTab === "photos"
//                     ? "text-purple-600 border-b-2 border-purple-600"
//                     : "text-gray-500 hover:text-gray-700"
//                 }`}
//               >
//                 Photos
//               </button>
//               <button
//                 type="button"
//                 onClick={() => setActiveTab("details")}
//                 className={`px-4 py-3 font-medium text-sm transition-colors ${
//                   activeTab === "details"
//                     ? "text-purple-600 border-b-2 border-purple-600"
//                     : "text-gray-500 hover:text-gray-700"
//                 }`}
//               >
//                 Additional Details
//               </button>
//               <button
//                 type="button"
//                 onClick={() => setActiveTab("health")}
//                 className={`px-4 py-3 font-medium text-sm transition-colors ${
//                   activeTab === "health"
//                     ? "text-purple-600 border-b-2 border-purple-600"
//                     : "text-gray-500 hover:text-gray-700"
//                 }`}
//               >
//                 Health & Behavior
//               </button>
//             </div>

//             <div className="p-6">
//               {/* Basic Information Tab */}
//               {activeTab === "basic" && (
//                 <div className="space-y-6">
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                     <div className="space-y-4">
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1.5">
//                           <Tag size={16} className="text-purple-500" />
//                           Pet Name*
//                         </label>
//                         <input
//                           type="text"
//                           name="name"
//                           value={formData.name}
//                           onChange={handleChange}
//                           className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
//                           required
//                         />
//                       </div>

//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1.5">
//                           <Tag size={16} className="text-purple-500" />
//                           Pet Type*
//                         </label>
//                         <select
//                           name="type"
//                           value={formData.type}
//                           onChange={handleChange}
//                           className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
//                           required
//                         >
//                           <option value="Dog">Dog</option>
//                           <option value="Cat">Cat</option>
//                           <option value="Other">Other</option>
//                         </select>
//                       </div>

//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1.5">
//                           <User size={16} className="text-purple-500" />
//                           Gender*
//                         </label>
//                         <select
//                           name="gender"
//                           value={formData.gender}
//                           onChange={handleChange}
//                           className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
//                           required
//                         >
//                           <option value="Male">Male</option>
//                           <option value="Female">Female</option>
//                         </select>
//                       </div>
//                     </div>

//                     <div className="space-y-4">
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1.5">
//                           <Calendar size={16} className="text-purple-500" />
//                           {formData.status === "Lost"
//                             ? "Date Lost*"
//                             : formData.status === "Pet I Found"
//                               ? "Date Found*"
//                               : "Birthdate*"}
//                         </label>
//                         <input
//                           type="datetime-local"
//                           name="date"
//                           value={formData.date}
//                           onChange={handleChange}
//                           className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
//                           required
//                         />
//                       </div>

//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1.5">
//                           <MapPin size={16} className="text-purple-500" />
//                           {formData.status === "Lost" ? "Last Seen Location" : "Location"}
//                         </label>
//                         <input
//                           type="text"
//                           name="address"
//                           value={formData.address}
//                           onChange={handleChange}
//                           className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
//                           placeholder={
//                             formData.status === "Lost" ? "Where was your pet last seen?" : "Where is your pet located?"
//                           }
//                         />
//                       </div>

//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1.5">
//                           <FileText size={16} className="text-purple-500" />
//                           Description
//                         </label>
//                         <textarea
//                           name="description"
//                           value={formData.description}
//                           onChange={handleChange}
//                           className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
//                           rows="4"
//                           placeholder="Describe your pet's appearance, personality, special markings, etc."
//                         />
//                       </div>
//                     </div>
//                   </div>

//                   {/* Status-specific tips */}
//                   {formData.status === "Lost" && (
//                     <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100 mt-6">
//                       <h3 className="font-semibold text-yellow-800 mb-2 flex items-center gap-2">
//                         <Info size={18} />
//                         Tips for Lost Pets
//                       </h3>
//                       <ul className="space-y-1 text-sm text-yellow-700">
//                         <li className="flex items-start gap-2">
//                           <CheckCircle className="flex-shrink-0 mt-0.5" size={14} />
//                           <span>Provide a detailed description including distinctive features</span>
//                         </li>
//                         <li className="flex items-start gap-2">
//                           <CheckCircle className="flex-shrink-0 mt-0.5" size={14} />
//                           <span>Add the exact location where your pet was last seen</span>
//                         </li>
//                         <li className="flex items-start gap-2">
//                           <CheckCircle className="flex-shrink-0 mt-0.5" size={14} />
//                           <span>Upload clear, recent photos from multiple angles</span>
//                         </li>
//                       </ul>
//                     </div>
//                   )}
//                 </div>
//               )}

//               {/* Photos Tab */}
//               {activeTab === "photos" && (
//                 <div className="space-y-6">
//                   <div>
//                     <h3 className="text-lg font-semibold mb-2">Main Photo</h3>
//                     <p className="text-sm text-gray-500 mb-4">
//                       This is the primary photo that will be displayed for your pet.
//                     </p>

//                     <div className="max-w-sm mx-auto">
//                       <div className="relative aspect-square rounded-xl overflow-hidden border border-gray-200 shadow-sm">
//                         {previewUrl ? (
//                           <>
//                             <img
//                               src={previewUrl || "/placeholder.svg"}
//                               alt="New pet photo preview"
//                               className="object-cover w-full h-full"
//                             />
//                             <div className="absolute top-2 left-2 bg-white/80 text-xs font-medium px-2 py-1 rounded-full backdrop-blur-sm">
//                               New Preview
//                             </div>
//                             <button
//                               type="button"
//                               onClick={() => {
//                                 setPreviewUrl(null)
//                                 setNewMainImage(null)
//                                 if (fileInputRef.current) fileInputRef.current.value = ""
//                               }}
//                               className="absolute bottom-2 right-2 bg-white/80 p-2 rounded-full shadow-sm text-red-500 hover:bg-red-50 transition-colors backdrop-blur-sm"
//                             >
//                               <Trash2 size={16} />
//                             </button>
//                           </>
//                         ) : pet.image ? (
//                           <>
//                             <img
//                               src={`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/uploads/pet_images/${pet.image}?t=${Date.now()}`}
//                               alt="Current pet photo"
//                               className="object-cover w-full h-full"
//                               onError={(e) => {
//                                 e.target.onerror = null
//                                 e.target.src = "/placeholder-pet.jpg"
//                               }}
//                               key={pet.image}
//                             />
//                             <div className="absolute top-2 left-2 bg-white/80 text-xs font-medium px-2 py-1 rounded-full backdrop-blur-sm">
//                               Current Photo
//                             </div>
//                             <label className="absolute bottom-2 right-2 bg-white/80 p-2 rounded-full shadow-sm cursor-pointer hover:bg-gray-100 transition-colors backdrop-blur-sm">
//                               <Camera size={16} />
//                               <input
//                                 type="file"
//                                 accept="image/*"
//                                 className="hidden"
//                                 onChange={handleMainImageUpload}
//                                 ref={fileInputRef}
//                               />
//                             </label>
//                           </>
//                         ) : (
//                           <label className="w-full h-full flex items-center justify-center cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
//                             <input
//                               type="file"
//                               accept="image/*"
//                               className="hidden"
//                               onChange={handleMainImageUpload}
//                               ref={fileInputRef}
//                             />
//                             <div className="text-center">
//                               <Camera size={32} className="mx-auto text-gray-400 mb-2" />
//                               <p className="text-sm text-gray-500">Upload Main Photo</p>
//                               <p className="text-xs text-gray-400 mt-1">Click to browse</p>
//                             </div>
//                           </label>
//                         )}
//                       </div>
//                     </div>
//                   </div>

//                   <div className="border-t border-gray-200 pt-6">
//                     <h3 className="text-lg font-semibold mb-2">Additional Photos</h3>
//                     <p className="text-sm text-gray-500 mb-4">
//                       Add up to three additional views to help identify your pet.
//                     </p>

//                     <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
//                       {["face", "side", "fur"].map((type) => {
//                         const filename = `${type}.jpg`
//                         const isNewImage = newAdditionalImages[type]
//                         const isExisting = pet.additional_images?.includes(filename) && !imagesToDelete.includes(type)
//                         const imageUrl = isNewImage
//                           ? newAdditionalImages[type].previewUrl
//                           : `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/uploads/pet_images/${pet.id}/${filename}?t=${Date.now()}`

//                         return isNewImage || isExisting ? (
//                           <div
//                             key={type}
//                             className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 group shadow-sm"
//                           >
//                             <img
//                               src={imageUrl || "/placeholder.svg"}
//                               alt={`${type} view of ${pet.name}`}
//                               className="object-cover w-full h-full"
//                               onError={(e) => {
//                                 e.target.onerror = null
//                                 e.target.src = "/default-pet.jpg"
//                                 e.target.className = "object-contain w-full h-full bg-gray-100 p-4"
//                               }}
//                             />

//                             <div className="absolute top-2 left-2 bg-white/80 text-xs font-medium px-2 py-1 rounded-full capitalize backdrop-blur-sm">
//                               {type} View
//                             </div>

//                             <button
//                               type="button"
//                               onClick={() => handleRemoveImage(type)}
//                               className="absolute top-2 right-2 bg-white/80 p-1.5 rounded-full shadow-sm text-red-500 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 backdrop-blur-sm"
//                               aria-label={`Remove ${type} view`}
//                             >
//                               <Trash2 size={16} strokeWidth={2} />
//                             </button>
//                           </div>
//                         ) : (
//                           <label
//                             key={type}
//                             className="aspect-square rounded-lg bg-gray-50 border-2 border-dashed border-gray-200 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 transition-colors"
//                           >
//                             <input
//                               type="file"
//                               accept="image/*"
//                               className="hidden"
//                               onChange={(e) => handleAddAdditionalImage(e, type)}
//                             />
//                             <div className="flex flex-col items-center">
//                               <Camera size={24} className="text-gray-400 mb-1" />
//                               <p className="text-sm text-gray-500 capitalize">{type} View</p>
//                               <p className="text-xs text-gray-400 mt-1">Click to upload</p>
//                             </div>
//                           </label>
//                         )
//                       })}
//                     </div>

//                     <div className="mt-6">
//                       <button
//                         type="button"
//                         onClick={() => setShowClearModal(true)}
//                         disabled={
//                           isClearing || (!pet.additional_images?.length && !Object.keys(newAdditionalImages).length)
//                         }
//                         className="flex items-center gap-2 px-4 py-2 bg-white border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
//                       >
//                         {isClearing ? (
//                           <>
//                             <Loader2 size={16} className="animate-spin" />
//                             Clearing...
//                           </>
//                         ) : (
//                           <>
//                             <Trash2 size={16} />
//                             Clear Additional Views
//                           </>
//                         )}
//                       </button>
//                     </div>
//                   </div>
//                 </div>
//               )}

//               {/* Additional Details Tab */}
//               {activeTab === "details" && (
//                 <div className="space-y-6">
//                   <div>
//                     <h3 className="text-lg font-semibold mb-2">Description</h3>
//                     <p className="text-sm text-gray-500 mb-4">
//                       Provide a detailed description of your pet to help with identification.
//                     </p>

//                     <textarea
//                       name="description"
//                       value={formData.description}
//                       onChange={handleChange}
//                       className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
//                       rows="6"
//                       placeholder="Describe your pet's appearance, personality, special markings, behavior, etc. The more details you provide, the better!"
//                     />
//                   </div>

//                   <div>
//                     <h3 className="text-lg font-semibold mb-2">Location</h3>
//                     <p className="text-sm text-gray-500 mb-4">
//                       {formData.status === "Lost"
//                         ? "Where was your pet last seen? Be as specific as possible."
//                         : "Where is your pet located?"}
//                     </p>

//                     <input
//                       type="text"
//                       name="address"
//                       value={formData.address}
//                       onChange={handleChange}
//                       className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
//                       placeholder="Enter address or location"
//                     />
//                   </div>

//                   {/* Status-specific guidance */}
//                   {formData.status === "Lost" && (
//                     <div className="bg-purple-50 p-5 rounded-xl border border-purple-100">
//                       <h3 className="font-semibold text-lg mb-3 text-purple-800">Helpful Information for Lost Pets</h3>
//                       <ul className="space-y-2 text-sm text-purple-700">
//                         <li className="flex items-start gap-2">
//                           <CheckCircle className="flex-shrink-0 mt-0.5" size={14} />
//                           <span>Include any identifying features like scars, markings, or collar details</span>
//                         </li>
//                         <li className="flex items-start gap-2">
//                           <CheckCircle className="flex-shrink-0 mt-0.5" size={14} />
//                           <span>Mention behaviors your pet might exhibit when approached by strangers</span>
//                         </li>
//                         <li className="flex items-start gap-2">
//                           <CheckCircle className="flex-shrink-0 mt-0.5" size={14} />
//                           <span>Note any medical conditions or special needs your pet may have</span>
//                         </li>
//                         <li className="flex items-start gap-2">
//                           <CheckCircle className="flex-shrink-0 mt-0.5" size={14} />
//                           <span>Include nearby landmarks or areas your pet might frequent</span>
//                         </li>
//                       </ul>
//                     </div>
//                   )}
//                 </div>
//               )}

//               {/* Health & Behavior Tab */}
// {activeTab === "health" && (
//   <div className="space-y-8">
//     {/* Health Information Section */}
//     <div>
//       <h3 className="text-lg font-semibold mb-4 text-gray-800">Health Information</h3>

//       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-2">Vaccinated? *</label>
//           <div className="space-y-2">
//             {["Yes", "No", "Partial"].map((option) => (
//               <label key={option} className="flex items-center">
//                 <input
//                   type="radio"
//                   name="vaccinated"
//                   value={option}
//                   checked={formData.healthInfo.vaccinated === option}
//                   onChange={handleHealthInfoChange}
//                   className="mr-2 text-purple-600 focus:ring-purple-500"
//                 />
//                 <span className="text-sm text-gray-700">{option}</span>
//               </label>
//             ))}
//           </div>
//         </div>

//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-2">Spayed/Neutered? *</label>
//           <div className="space-y-2">
//             {["Yes", "No"].map((option) => (
//               <label key={option} className="flex items-center">
//                 <input
//                   type="radio"
//                   name="spayedNeutered"
//                   value={option}
//                   checked={formData.healthInfo.spayedNeutered === option}
//                   onChange={handleHealthInfoChange}
//                   className="mr-2 text-purple-600 focus:ring-purple-500"
//                 />
//                 <span className="text-sm text-gray-700">{option}</span>
//               </label>
//             ))}
//           </div>
//         </div>
//       </div>

//       <div className="mt-6">
//         <label className="block text-sm font-medium text-gray-700 mb-2">Health Details</label>
//         <textarea
//           name="healthDetails"
//           value={formData.healthInfo.healthDetails}
//           onChange={handleHealthInfoChange}
//           className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
//           rows="3"
//           placeholder="Enter any health conditions, medications, special needs, etc."
//         />
//       </div>
//     </div>

//     {/* Temperament & Behavior Section */}
//     <div className="border-t border-gray-200 pt-8">
//       <h3 className="text-lg font-semibold mb-4 text-gray-800">Temperament & Behavior</h3>

//       <div>
//         <label className="block text-sm font-medium text-gray-700 mb-3">
//           Good with (select all that apply):
//         </label>
//         <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
//           {[
//             { key: "children", label: "Children" },
//             { key: "dogs", label: "Dogs" },
//             { key: "cats", label: "Cats" },
//             { key: "elderly", label: "Elderly" },
//             { key: "strangers", label: "Strangers" },
//           ].map(({ key, label }) => (
//             <label key={key} className="flex items-center">
//               <input
//                 type="checkbox"
//                 checked={formData.healthInfo.goodWith[key]}
//                 onChange={() => handleGoodWithChange(key)}
//                 className="mr-2 text-purple-600 focus:ring-purple-500 rounded"
//               />
//               <span className="text-sm text-gray-700">{label}</span>
//             </label>
//           ))}
//         </div>
//       </div>

//       <div className="mt-6">
//         <label className="block text-sm font-medium text-gray-700 mb-2">Energy Level</label>
//         <select
//           name="energyLevel"
//           value={formData.healthInfo.energyLevel}
//           onChange={handleHealthInfoChange}
//           className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
//         >
//           <option value="">Select energy level</option>
//           <option value="Low">Low</option>
//           <option value="Moderate">Moderate</option>
//           <option value="High">High</option>
//           <option value="Very High">Very High</option>
//         </select>
//       </div>

//       <div className="mt-6">
//         <label className="block text-sm font-medium text-gray-700 mb-2">Temperament & Personality</label>
//         <textarea
//           name="temperamentPersonality"
//           value={formData.healthInfo.temperamentPersonality}
//           onChange={handleHealthInfoChange}
//           className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
//           rows="4"
//           placeholder="Describe the pet's personality, behavior traits, etc."
//         />
//       </div>
//     </div>

//     {/* Adoption Details Section */}
//     <div className="border-t border-gray-200 pt-8">
//       <h3 className="text-lg font-semibold mb-4 text-gray-800">Adoption Details</h3>

//       <div>
//         <label className="block text-sm font-medium text-gray-700 mb-2">Reason for Adoption *</label>
//         <textarea
//           name="reasonForAdoption"
//           value={formData.healthInfo.reasonForAdoption}
//           onChange={handleHealthInfoChange}
//           className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
//           rows="3"
//           placeholder="Please explain why you are looking to rehome this pet..."
//           required
//         />
//       </div>
//     </div>
//   </div>
// )}
//             </div>
//           </div>

//           {/* Save Button - Centered at the bottom of the form */}
//           <div className="flex justify-center pt-4">
//             <button
//               type="submit"
//               disabled={isSaving}
//               className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-lg shadow-md transition-colors disabled:opacity-70"
//             >
//               {isSaving ? (
//                 <>
//                   <Loader2 size={20} className="animate-spin" />
//                   Saving Changes...
//                 </>
//               ) : (
//                 <>
//                   <Save size={20} />
//                   Save Changes
//                 </>
//               )}
//             </button>
//           </div>
//         </form>
//       </main>

//       <Footer />

//       {/* Clear Additional Images Modal */}
//       {showClearModal && (
//         <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
//           <div className="bg-white p-6 rounded-xl max-w-md w-full shadow-lg animate-fade-in">
//             <div className="flex justify-between items-center mb-4">
//               <h3 className="text-xl font-bold text-gray-800">Clear Additional Views?</h3>
//               <button
//                 type="button"
//                 onClick={() => setShowClearModal(false)}
//                 className="text-gray-400 hover:text-gray-600 transition-colors"
//               >
//                 <X size={20} />
//               </button>
//             </div>

//             <div className="mb-6">
//               <div className="flex items-center gap-3 mb-4 text-amber-600">
//                 <AlertTriangle size={24} />
//                 <p className="font-medium">This action cannot be undone</p>
//               </div>
//               <p className="text-gray-600">
//                 Are you sure you want to clear all additional views? This will remove face, side and fur photos but keep
//                 the main image.
//               </p>
//             </div>

//             <div className="flex justify-end gap-3">
//               <button
//                 type="button"
//                 onClick={() => setShowClearModal(false)}
//                 className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
//               >
//                 Cancel
//               </button>
//               <button
//                 type="button"
//                 onClick={handleClearAdditionalImages}
//                 disabled={isClearing}
//                 className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
//               >
//                 {isClearing ? (
//                   <>
//                     <Loader2 size={16} className="animate-spin" />
//                     Clearing...
//                   </>
//                 ) : (
//                   <>
//                     <Trash2 size={16} />
//                     Clear Views
//                   </>
//                 )}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Progress Indicator */}
//       {isUploading && (
//         <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
//           <div className="bg-white p-6 rounded-xl max-w-md w-full shadow-lg animate-fade-in">
//             <h3 className="font-medium text-lg mb-3">{uploadStatus}</h3>
//             <div className="w-full bg-gray-200 rounded-full h-2.5 mb-3">
//               <div
//                 className="bg-gradient-to-r from-purple-500 to-purple-600 h-2.5 rounded-full transition-all duration-300"
//                 style={{ width: `${uploadProgress}%` }}
//               ></div>
//             </div>
//             <p className="text-sm text-gray-500 text-center">{uploadProgress}% complete</p>
//           </div>
//         </div>
//       )}

//       <Toaster
//         position="bottom-right"
//         toastOptions={{
//           duration: 5000,
//           style: {
//             background: "#363636",
//             color: "#fff",
//             borderRadius: "8px",
//             padding: "16px",
//           },
//           success: {
//             iconTheme: {
//               primary: "#10B981",
//               secondary: "white",
//             },
//           },
//           error: {
//             iconTheme: {
//               primary: "#EF4444",
//               secondary: "white",
//             },
//           },
//         }}
//       />

//       <style jsx>{`
//         @keyframes fade-in {
//           from { opacity: 0; transform: translateY(10px); }
//           to { opacity: 1; transform: translateY(0); }
//         }
//         .animate-fade-in {
//           animation: fade-in 0.3s ease-out forwards;
//         }
//       `}</style>
//     </div>
//   )
// }
