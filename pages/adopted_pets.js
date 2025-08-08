
"use client";

import { useState, useEffect } from "react"
import { getUserAdoptions, updateAdoptionStatus } from "../utils/api"
import { useRouter } from "next/router"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import Link from "next/link"
import {
  Heart,
  MessageCircle,
  Calendar,
  User,
  Check,
  X,
  Clock,
  Search,
  ChevronDown,
  Shield,
  Star,
  Phone,
} from "lucide-react"

export default function AdoptedPets() {
  const [adoptions, setAdoptions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [viewMode, setViewMode] = useState("owner") // 'owner' or 'adopter'
  const [statusFilter, setStatusFilter] = useState("all")
  const [currentUserId, setCurrentUserId] = useState(null)
  const [selectedAdoption, setSelectedAdoption] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [activeTab, setActiveTab] = useState("details")
  const router = useRouter()

  useEffect(() => {
    if (typeof window !== "undefined") {
      const userId = Number.parseInt(window.sessionStorage.getItem("user_id"))
      setCurrentUserId(userId)

      if (!userId) {
        router.push("/login")
      }
    }
  }, [router])

  useEffect(() => {
    if (!currentUserId) return

    const fetchAdoptions = async () => {
      try {
        setLoading(true)
        const data = await getUserAdoptions(currentUserId, viewMode, statusFilter === "all" ? null : statusFilter)
        setAdoptions(data)
        setError(null)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchAdoptions()
  }, [viewMode, statusFilter, currentUserId])

  const handleStatusUpdate = async (adoptionId, newStatus) => {
    try {
      await updateAdoptionStatus(adoptionId, newStatus)
      const data = await getUserAdoptions(currentUserId, viewMode, statusFilter === "all" ? null : statusFilter)
      setAdoptions((prev) =>
        prev.map((adoption) =>
          adoption.id === adoptionId
            ? { ...adoption, status: newStatus, updated_at: new Date().toISOString() }
            : adoption,
        ),
      )
    } catch (err) {
      setError(err.message)
    }
  }

  // Add these constants after the imports
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://fkpimtcxncgwtdsfyrjb.supabase.co"
  const PET_IMAGES_BUCKET = "pet-images"

  function getImageUrl(imageName) {
    if (!imageName) return "https://via.placeholder.com/100"
    // Handle the format "1/main.jpg" -> "https://fkpimtcxncgwtdsfyrjb.supabase.co/storage/v1/object/public/pet-images/1/main.jpg"
    return `${SUPABASE_URL}/storage/v1/object/public/${PET_IMAGES_BUCKET}/${imageName}`
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-amber-100 text-amber-800 border-amber-200"
      case "approved":
        return "bg-emerald-100 text-emerald-800 border-emerald-200"
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4" />
      case "successful":
        return <Check className="h-4 w-4" />
      case "cancelled":
        return <X className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const tabs = [
    { id: "details", label: "Details", icon: Star },
    { id: "communication", label: "Communication", icon: MessageCircle },
    { id: "timeline", label: "Timeline", icon: Calendar },
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex justify-center items-center">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200"></div>
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-600 border-t-transparent absolute top-0"></div>
        </div>
      </div>
    )
  }

  if (!currentUserId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex justify-center items-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="h-8 w-8 text-white" />
          </div>
          <p className="text-gray-600">Loading user information...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
            {viewMode === "owner" ? "Adoption Requests" : "Your Applications"}
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {viewMode === "owner" ? "Manage adoption requests for your pets" : "Track your pet adoption applications"}
          </p>
        </div>

        {/* Controls */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-gray-100 rounded-xl p-1">
              <button
                onClick={() => setViewMode("owner")}
                className={`px-6 py-3 rounded-lg font-medium transition-all ${
                  viewMode === "owner" ? "bg-white text-purple-600 shadow-md" : "text-gray-600 hover:text-gray-800"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  As Owner
                </div>
              </button>
              <button
                onClick={() => setViewMode("adopter")}
                className={`px-6 py-3 rounded-lg font-medium transition-all ${
                  viewMode === "adopter" ? "bg-white text-purple-600 shadow-md" : "text-gray-600 hover:text-gray-800"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Heart className="h-4 w-4" />
                  As Adopter
                </div>
              </button>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium text-gray-700">Filter by Status:</label>
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="appearance-none bg-white border border-gray-200 rounded-xl px-4 py-3 pr-10 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="successful">Successful</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                <ChevronDown className="absolute right-3 top-3.5 h-5 w-5 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-2xl mb-6">
            <div className="flex items-center gap-3">
              <X className="h-5 w-5" />
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Content */}
        {adoptions.length === 0 ? (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Heart className="h-12 w-12 text-purple-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">No adoptions found</h3>
              <p className="text-gray-500 mb-6">
                {viewMode === "owner"
                  ? "No adoption requests found for your pets"
                  : "You haven't applied to adopt any pets yet"}
              </p>
              <Link
                href="/rehome_pets"
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all font-medium inline-flex items-center gap-2"
              >
                <Search className="h-4 w-4" />
                Browse Available Pets
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {adoptions.map((adoption) => (
              <div
                key={adoption.id}
                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-100"
              >
                <div className="p-6">
                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* Pet Image */}
                    <div className="w-full lg:w-64 flex-shrink-0">
                      <div className="relative h-48 lg:h-56 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl overflow-hidden">
                        <img
                          src={getImageUrl(adoption.pet_image) || "/placeholder.svg"}
                          alt={adoption.pet_name}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            e.target.onerror = null
                            e.target.src = "/default-pet.jpg"
                          }}
                        />
                        <div className="absolute top-3 right-3">
                          <span
                            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                              adoption.status,
                            )}`}
                          >
                            {getStatusIcon(adoption.status)}
                            {adoption.status.charAt(0).toUpperCase() + adoption.status.slice(1)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h2 className="text-2xl font-bold text-gray-900 mb-1">{adoption.pet_name}</h2>
                          <p className="text-gray-600 capitalize">{adoption.pet_type}</p>
                        </div>
                        <button
                          onClick={() => {
                            setSelectedAdoption(adoption)
                            setShowModal(true)
                            setActiveTab("details")
                          }}
                          className="text-purple-600 hover:text-purple-800 font-medium"
                        >
                          View Details
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div className="bg-gray-50 p-4 rounded-xl">
                          <div className="flex items-center gap-2 mb-2">
                            <User className="h-4 w-4 text-gray-500" />
                            <p className="text-sm text-gray-500">{viewMode === "owner" ? "Adopter" : "Owner"}</p>
                          </div>
                          <p className="font-semibold text-gray-900">
                            {viewMode === "owner" ? adoption.adopter_name : adoption.owner_name}
                          </p>
                        </div>

                        <div className="bg-gray-50 p-4 rounded-xl">
                          <div className="flex items-center gap-2 mb-2">
                            <Calendar className="h-4 w-4 text-gray-500" />
                            <p className="text-sm text-gray-500">Request Date</p>
                          </div>
                          <p className="font-semibold text-gray-900">
                            {new Date(adoption.created_at).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </p>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-wrap gap-3">
                        <Link
                          href={`/messages/${viewMode === "owner" ? adoption.adopter_id : adoption.owner_id}`}
                          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors font-medium"
                        >
                          <MessageCircle className="h-4 w-4" />
                          Chat with {viewMode === "owner" ? "Adopter" : "Owner"}
                        </Link>

                        {viewMode === "owner" && adoption.status === "pending" && (
                          <>
                            <button
                              onClick={() => handleStatusUpdate(adoption.id, "approved")}
                              className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-xl hover:bg-emerald-700 transition-colors font-medium"
                            >
                              <Check className="h-4 w-4" />
                              Approve
                            </button>
                            <button
                              onClick={() => handleStatusUpdate(adoption.id, "cancelled")}
                              className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-xl hover:bg-red-700 transition-colors font-medium"
                            >
                              <X className="h-4 w-4" />
                              Reject
                            </button>
                          </>
                        )}

                        {viewMode === "adopter" && adoption.status === "pending" && (
                          <button
                            onClick={() => handleStatusUpdate(adoption.id, "cancelled")}
                            className="flex items-center gap-2 bg-gray-200 text-gray-700 px-4 py-2 rounded-xl hover:bg-gray-300 transition-colors font-medium"
                          >
                            <X className="h-4 w-4" />
                            Cancel Request
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Detailed Modal */}
        {showModal && selectedAdoption && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 text-white">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-3xl font-bold mb-2">{selectedAdoption.pet_name}</h2>
                    <div className="flex items-center gap-4 text-purple-100">
                      <span className="capitalize">{selectedAdoption.pet_type}</span>
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-white/20 backdrop-blur-sm`}
                      >
                        {getStatusIcon(selectedAdoption.status)}
                        {selectedAdoption.status.charAt(0).toUpperCase() + selectedAdoption.status.slice(1)}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowModal(false)}
                    className="p-2 hover:bg-white/20 rounded-full transition-colors"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
              </div>

              {/* Tabs */}
              <div className="border-b border-gray-200 bg-gray-50">
                <div className="flex overflow-x-auto">
                  {tabs.map((tab) => {
                    const Icon = tab.icon
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-6 py-4 font-medium text-sm whitespace-nowrap transition-colors ${
                          activeTab === tab.id
                            ? "text-purple-600 border-b-2 border-purple-600 bg-white"
                            : "text-gray-500 hover:text-gray-700"
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        {tab.label}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Tab Content */}
              <div className="p-6 overflow-y-auto max-h-[60vh]">
                {activeTab === "details" && (
                  <div className="space-y-8">
                    {/* Pet and Basic Info */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      <div>
                        <div className="h-80 bg-gray-100 rounded-2xl overflow-hidden mb-6">
                          <img
                            src={getImageUrl(selectedAdoption.pet_image) || "/placeholder.svg"}
                            alt={selectedAdoption.pet_name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.onerror = null
                              e.target.src = "/default-pet.jpg"
                            }}
                          />
                        </div>
                      </div>

                      <div className="space-y-6">
                        <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-2xl border border-purple-200">
                          <h3 className="text-lg font-semibold text-gray-800 mb-4">
                            {viewMode === "owner" ? "Adopter Information" : "Owner Information"}
                          </h3>
                          <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold text-xl">
                              {(viewMode === "owner"
                                ? selectedAdoption.adopter_name
                                : selectedAdoption.owner_name
                              )?.charAt(0) || "U"}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-800 text-lg">
                                {viewMode === "owner" ? selectedAdoption.adopter_name : selectedAdoption.owner_name}
                              </p>
                              <p className="text-gray-600">
                                {viewMode === "owner" ? "Potential Adopter" : "Pet Owner"}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-gray-50 p-4 rounded-xl">
                            <p className="text-sm text-gray-500 mb-1">Request Date</p>
                            <p className="font-semibold text-gray-800">
                              {new Date(selectedAdoption.created_at).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })}
                            </p>
                          </div>
                          <div className="bg-gray-50 p-4 rounded-xl">
                            <p className="text-sm text-gray-500 mb-1">Status</p>
                            <p className="font-semibold text-gray-800 capitalize">{selectedAdoption.status}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Adoption Form Details */}
                    {selectedAdoption.adoption_form && (
                      <div className="space-y-6">
                        <div className="border-t border-gray-200 pt-6">
                          <h3 className="text-2xl font-bold text-gray-900 mb-6">Adoption Application Details</h3>
                        </div>

                        {/* Applicant Information */}
                        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
                          <h4 className="text-lg font-semibold text-blue-900 mb-4 flex items-center gap-2">
                            <User className="h-5 w-5" />
                            Applicant Information
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {selectedAdoption.adoption_form.full_name && (
                              <div className="bg-white p-4 rounded-xl">
                                <p className="text-sm text-gray-500 mb-1">Full Name</p>
                                <p className="font-semibold text-gray-800">
                                  {selectedAdoption.adoption_form.full_name}
                                </p>
                              </div>
                            )}
                            {selectedAdoption.adoption_form.contact_info && (
                              <div className="bg-white p-4 rounded-xl">
                                <p className="text-sm text-gray-500 mb-1">Contact Information</p>
                                <p className="font-semibold text-gray-800">
                                  {selectedAdoption.adoption_form.contact_info}
                                </p>
                              </div>
                            )}
                            {selectedAdoption.adoption_form.housing_type && (
                              <div className="bg-white p-4 rounded-xl">
                                <p className="text-sm text-gray-500 mb-1">Housing Type</p>
                                <p className="font-semibold text-gray-800 capitalize">
                                  {selectedAdoption.adoption_form.housing_type}
                                </p>
                              </div>
                            )}
                            {selectedAdoption.adoption_form.landlord_allows_pets !== null && (
                              <div className="bg-white p-4 rounded-xl">
                                <p className="text-sm text-gray-500 mb-1">Landlord Allows Pets</p>
                                <p className="font-semibold text-gray-800">
                                  {selectedAdoption.adoption_form.landlord_allows_pets ? "Yes" : "No"}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Household Details */}
                        <div className="bg-green-50 border border-green-200 rounded-2xl p-6">
                          <h4 className="text-lg font-semibold text-green-900 mb-4 flex items-center gap-2">
                            <Heart className="h-5 w-5" />
                            Household Details
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {selectedAdoption.adoption_form.household_members && (
                              <div className="bg-white p-4 rounded-xl">
                                <p className="text-sm text-gray-500 mb-1">Household Members</p>
                                <p className="font-semibold text-gray-800">
                                  {selectedAdoption.adoption_form.household_members}
                                </p>
                              </div>
                            )}
                            {selectedAdoption.adoption_form.pet_allergies !== null && (
                              <div className="bg-white p-4 rounded-xl">
                                <p className="text-sm text-gray-500 mb-1">Pet Allergies</p>
                                <p className="font-semibold text-gray-800">
                                  {selectedAdoption.adoption_form.pet_allergies ? "Yes" : "No"}
                                </p>
                              </div>
                            )}
                            {selectedAdoption.adoption_form.allergy_types && (
                              <div className="bg-white p-4 rounded-xl col-span-full">
                                <p className="text-sm text-gray-500 mb-1">Allergy Types</p>
                                <p className="font-semibold text-gray-800">
                                  {selectedAdoption.adoption_form.allergy_types}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Pet Care Plan */}
                        <div className="bg-purple-50 border border-purple-200 rounded-2xl p-6">
                          <h4 className="text-lg font-semibold text-purple-900 mb-4 flex items-center gap-2">
                            <Calendar className="h-5 w-5" />
                            Pet Care Plan
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {selectedAdoption.adoption_form.primary_caregiver && (
                              <div className="bg-white p-4 rounded-xl">
                                <p className="text-sm text-gray-500 mb-1">Primary Caregiver</p>
                                <p className="font-semibold text-gray-800">
                                  {selectedAdoption.adoption_form.primary_caregiver}
                                </p>
                              </div>
                            )}
                            {selectedAdoption.adoption_form.expense_responsibility && (
                              <div className="bg-white p-4 rounded-xl">
                                <p className="text-sm text-gray-500 mb-1">Expense Responsibility</p>
                                <p className="font-semibold text-gray-800">
                                  {selectedAdoption.adoption_form.expense_responsibility}
                                </p>
                              </div>
                            )}
                            {selectedAdoption.adoption_form.daily_alone_time && (
                              <div className="bg-white p-4 rounded-xl">
                                <p className="text-sm text-gray-500 mb-1">Daily Alone Time</p>
                                <p className="font-semibold text-gray-800">
                                  {selectedAdoption.adoption_form.daily_alone_time}
                                </p>
                              </div>
                            )}
                            {selectedAdoption.adoption_form.emergency_care && (
                              <div className="bg-white p-4 rounded-xl">
                                <p className="text-sm text-gray-500 mb-1">Emergency Care Plan</p>
                                <p className="font-semibold text-gray-800">
                                  {selectedAdoption.adoption_form.emergency_care}
                                </p>
                              </div>
                            )}
                            {selectedAdoption.adoption_form.alone_time_plan && (
                              <div className="bg-white p-4 rounded-xl col-span-full">
                                <p className="text-sm text-gray-500 mb-1">Alone Time Plan</p>
                                <p className="font-semibold text-gray-800">
                                  {selectedAdoption.adoption_form.alone_time_plan}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Pet Experience */}
                        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
                          <h4 className="text-lg font-semibold text-amber-900 mb-4 flex items-center gap-2">
                            <Star className="h-5 w-5" />
                            Pet Experience
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {selectedAdoption.adoption_form.current_pets && (
                              <div className="bg-white p-4 rounded-xl">
                                <p className="text-sm text-gray-500 mb-1">Current Pets</p>
                                <p className="font-semibold text-gray-800">
                                  {selectedAdoption.adoption_form.current_pets}
                                </p>
                              </div>
                            )}
                            {selectedAdoption.adoption_form.past_pets && (
                              <div className="bg-white p-4 rounded-xl">
                                <p className="text-sm text-gray-500 mb-1">Past Pets</p>
                                <p className="font-semibold text-gray-800">
                                  {selectedAdoption.adoption_form.past_pets}
                                </p>
                              </div>
                            )}
                            {selectedAdoption.adoption_form.past_pets_outcome && (
                              <div className="bg-white p-4 rounded-xl col-span-full">
                                <p className="text-sm text-gray-500 mb-1">Past Pets Outcome</p>
                                <p className="font-semibold text-gray-800">
                                  {selectedAdoption.adoption_form.past_pets_outcome}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Adoption Readiness */}
                        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6">
                          <h4 className="text-lg font-semibold text-rose-900 mb-4 flex items-center gap-2">
                            <Check className="h-5 w-5" />
                            Adoption Readiness
                          </h4>
                          <div className="space-y-4">
                            {selectedAdoption.adoption_form.adoption_reason && (
                              <div className="bg-white p-4 rounded-xl">
                                <p className="text-sm text-gray-500 mb-1">Reason for Adoption</p>
                                <p className="font-semibold text-gray-800">
                                  {selectedAdoption.adoption_form.adoption_reason}
                                </p>
                              </div>
                            )}
                            {selectedAdoption.adoption_form.household_agreement !== null && (
                              <div className="bg-white p-4 rounded-xl">
                                <p className="text-sm text-gray-500 mb-1">Household Agreement</p>
                                <p className="font-semibold text-gray-800">
                                  {selectedAdoption.adoption_form.household_agreement
                                    ? "Yes, everyone agrees"
                                    : "No, there are concerns"}
                                </p>
                              </div>
                            )}
                            {selectedAdoption.adoption_form.household_disagreement_reason && (
                              <div className="bg-white p-4 rounded-xl">
                                <p className="text-sm text-gray-500 mb-1">Disagreement Reason</p>
                                <p className="font-semibold text-gray-800">
                                  {selectedAdoption.adoption_form.household_disagreement_reason}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Form Status */}
                        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6">
                          <h4 className="text-lg font-semibold text-gray-900 mb-4">Application Status</h4>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-white p-4 rounded-xl">
                              <p className="text-sm text-gray-500 mb-1">Form Status</p>
                              <p className="font-semibold text-gray-800 capitalize">
                                {selectedAdoption.adoption_form.status || "Submitted"}
                              </p>
                            </div>
                            <div className="bg-white p-4 rounded-xl">
                              <p className="text-sm text-gray-500 mb-1">Form ID</p>
                              <p className="font-semibold text-gray-800">#{selectedAdoption.adoption_form.id}</p>
                            </div>
                            {selectedAdoption.adoption_form.created_at && (
                              <div className="bg-white p-4 rounded-xl">
                                <p className="text-sm text-gray-500 mb-1">Submitted Date</p>
                                <p className="font-semibold text-gray-800">
                                  {new Date(selectedAdoption.adoption_form.created_at).toLocaleDateString("en-US", {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                  })}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* No Form Message */}
                    {!selectedAdoption.adoption_form && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6 text-center">
                        <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <X className="h-8 w-8 text-yellow-600" />
                        </div>
                        <h4 className="text-lg font-semibold text-yellow-900 mb-2">No Adoption Form Available</h4>
                        <p className="text-yellow-700">
                          The adopter hasn't submitted a detailed adoption form yet, or the form data is not available.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "communication" && (
                  <div className="space-y-6">
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-200">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">Contact Options</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Link
                          href={`/messages/${viewMode === "owner" ? selectedAdoption.adopter_id : selectedAdoption.owner_id}`}
                          className="flex items-center justify-center gap-3 bg-blue-600 text-white px-6 py-4 rounded-xl hover:bg-blue-700 transition-colors font-medium"
                        >
                          <MessageCircle className="h-5 w-5" />
                          Send Message
                        </Link>
                        <button className="flex items-center justify-center gap-3 bg-emerald-600 text-white px-6 py-4 rounded-xl hover:bg-emerald-700 transition-colors font-medium">
                          <Phone className="h-5 w-5" />
                          Schedule Call
                        </button>
                      </div>
                    </div>

                    <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl">
                      <p className="text-amber-800 text-sm">
                        <strong>Communication Guidelines:</strong> Keep all communication respectful and focused on the
                        pet's wellbeing. Share relevant information about care requirements and living situations.
                      </p>
                    </div>
                  </div>
                )}

                {activeTab === "timeline" && (
                  <div className="space-y-6">
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-2xl border border-purple-200">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">Adoption Timeline</h3>
                      <div className="space-y-4">
                        <div className="flex items-center gap-4">
                          <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                            <Check className="h-4 w-4 text-white" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">Application Submitted</p>
                            <p className="text-sm text-gray-500">
                              {new Date(selectedAdoption.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        {selectedAdoption.status !== "pending" && (
                          <div className="flex items-center gap-4">
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                selectedAdoption.status === "successful" ? "bg-emerald-600" : "bg-red-600"
                              }`}
                            >
                              {selectedAdoption.status === "successful" ? (
                                <Check className="h-4 w-4 text-white" />
                              ) : (
                                <X className="h-4 w-4 text-white" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-gray-800">
                                Application {selectedAdoption.status === "successful" ? "Approved" : "Rejected"}
                              </p>
                              <p className="text-sm text-gray-500">
                                {selectedAdoption.updated_at
                                  ? new Date(selectedAdoption.updated_at).toLocaleDateString()
                                  : "Recently"}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                <div className="flex gap-3 justify-end">
                  {viewMode === "owner" && selectedAdoption.status === "pending" && (
                    <>
                      <button
                        onClick={() => {
                          handleStatusUpdate(selectedAdoption.id, "approved") // Changed to "approved"
                          setShowModal(false)
                        }}
                        className="bg-emerald-600 text-white px-6 py-3 rounded-xl hover:bg-emerald-700 transition-colors font-medium"
                      >
                        Approve Application
                      </button>
                      <button
                        onClick={() => {
                          handleStatusUpdate(selectedAdoption.id, "rejected") // Changed to "rejected"
                          setShowModal(false)
                        }}
                        className="bg-red-600 text-white px-6 py-3 rounded-xl hover:bg-red-700 transition-colors font-medium"
                      >
                        Reject Application
                      </button>
                    </>
                  )}

                  {viewMode === "adopter" && selectedAdoption.status === "pending" && (
                    <button
                      onClick={() => {
                        handleStatusUpdate(selectedAdoption.id, "cancelled")
                        setShowModal(false)
                      }}
                      className="bg-gray-200 text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-300 transition-colors font-medium"
                    >
                      Cancel Application
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  )
}
