"use client"

import {
  MessageSquare,
  Plus,
  ShoppingBag,
  AlertCircle,
  Home,
  Heart,
  CheckCircle,
  Settings,
  Search,
  Flag,
  HelpCircle,
  Info,
  MapPin,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Navbar from "../components/Navbar"
import Footer from "../components/Footer"
import CryptoJS from "crypto-js"
import { fetchPetDashboard } from "../utils/api"

// Add these constants after the imports
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://fkpimtcxncgwtdsfyrjb.supabase.co"
const PET_IMAGES_BUCKET = "pet-images"

const SECRET_KEY = "asdasdasd"

const encryptData = (data) => {
  return CryptoJS.AES.encrypt(JSON.stringify(data), SECRET_KEY).toString()
}

const decryptData = (encryptedData) => {
  const bytes = CryptoJS.AES.decrypt(encryptedData, SECRET_KEY)
  return JSON.parse(bytes.toString(CryptoJS.enc.Utf8))
}

const getPetImageUrl = (imageName) => {
  if (!imageName) return "https://via.placeholder.com/100"
  // Handle the format "1/main.jpg" -> "https://fkpimtcxncgwtdsfyrjb.supabase.co/storage/v1/object/public/pet-images/1/main.jpg"
  return `${SUPABASE_URL}/storage/v1/object/public/${PET_IMAGES_BUCKET}/${imageName}`
}

export default function Dashboard() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userData, setUserData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [pets, setPets] = useState([])
  const [dataLoaded, setDataLoaded] = useState(false)
  const [expandedPets, setExpandedPets] = useState({})
  const [currentDateTime, setCurrentDateTime] = useState(new Date())

  const handlePetCardClick = (e) => {
    // Find the closest card element (in case children are clicked)
    const card = e.currentTarget

    // Get all the data attributes
    const petData = {
      id: card.dataset.id,
      name: card.dataset.name,
      type: card.dataset.type,
      gender: card.dataset.gender,
      description: card.dataset.description,
      date: card.dataset.date,
      address: card.dataset.address,
      status: card.dataset.status,
      image: card.dataset.image,
    }

    // Navigate to pet profile page with the ID
    router.push(`/pet_profile/${petData.id}`)
  }

  const togglePetDetails = (petId, e) => {
    e.stopPropagation() // Prevent card click navigation
    setExpandedPets((prev) => ({
      ...prev,
      [petId]: !prev[petId],
    }))
  }

  const getStatusStyle = (status) => {
    const statusLower = status?.toLowerCase() || ""
    if (statusLower.includes("missing") || statusLower.includes("lost")) {
      return "bg-red-100 text-red-600 border-red-200"
    } else if (statusLower.includes("rehome") || statusLower.includes("rehoming")) {
      return "bg-yellow-100 text-yellow-600 border-yellow-200"
    } else if (statusLower.includes("safe") || statusLower.includes("home")) {
      return "bg-green-100 text-green-600 border-green-200"
    } else if (statusLower.includes("adoption")) {
      return "bg-blue-100 text-blue-600 border-blue-200"
    }
    return "bg-gray-100 text-gray-600 border-gray-200"
  }

  const getPetStatusCounts = () => {
    const counts = { missing: 0, rehome: 0, safe: 0, adoption: 0 }
    pets.forEach((pet) => {
      const status = pet.status?.toLowerCase() || ""
      if (status.includes("missing") || status.includes("lost")) {
        counts.missing++
      } else if (status.includes("rehome") || status.includes("rehoming")) {
        counts.rehome++
      } else if (status.includes("safe") || status.includes("home") || status.includes("rehome")) {
        counts.safe++
      } else if (status.includes("adoption")) {
        counts.adoption++
      }
    })
    return counts
  }

  const getDateLabel = (status) => {
    const statusLower = status?.toLowerCase() || ""
    if (statusLower.includes("missing") || statusLower.includes("lost")) {
      return "Date missing"
    } else if (statusLower.includes("pet i found") || statusLower.includes("found")) {
      return "Date Found"
    } else if (statusLower.includes("safe") || statusLower.includes("home") || statusLower.includes("rehome")) {
      return "Date added"
    }
    return "Date added"
  }

  const getLocationLabel = (status) => {
    const statusLower = status?.toLowerCase() || ""
    if (statusLower.includes("pet i found") || statusLower.includes("found")) {
      return "Location: found"
    } else if (statusLower.includes("missing") || statusLower.includes("lost")) {
      return "Last seen:"
    } else if (statusLower.includes("rehome") || statusLower.includes("safe") || statusLower.includes("home")) {
      return "Home:"
    }
    return "Location:"
  }

  useEffect(() => {
    const authenticate = () => {
      try {
        const urlParams = new URLSearchParams(window.location.search)
        const token = urlParams.get("token") || searchParams.get("token")
        const userId = urlParams.get("user_id") || searchParams.get("user_id")
        const user = urlParams.get("user") || searchParams.get("user")
        const roles = urlParams.get("roles") || searchParams.get("roles")

        if (token && userId && user) {
          sessionStorage.setItem("auth_token", token)
          sessionStorage.setItem("user_id", userId)
          sessionStorage.setItem("user", user)
          sessionStorage.setItem("roles", roles ? encryptData(roles) : encryptData("user"))
          window.history.replaceState({}, "", window.location.pathname)
        }

        const storedToken = sessionStorage.getItem("auth_token")
        const storedUserData = sessionStorage.getItem("user")
        const storedUserId = sessionStorage.getItem("user_id")
        const encryptedRoles = sessionStorage.getItem("roles")

        if (!storedToken || !storedUserData || !storedUserId) {
          throw new Error("Missing authentication data")
        }

        const storedRoles = decryptData(encryptedRoles)
        if (storedRoles === "admin") {
          router.push("/admin_dashboard")
          return
        } else if (storedRoles === "user") {
          setIsAuthenticated(true)
          fetchPetDashboard(storedToken)
            .then((data) => {
              setUserData(data.user)
              setPets(data.pets || [])
              setDataLoaded(true)
            })
            .catch((error) => {
              console.error("Dashboard load failed:", error)
              setDataLoaded(true) // Set to true even on error to prevent infinite loading
            })
        } else {
          throw new Error("Invalid role")
        }
      } catch (error) {
        console.error("Authentication error:", error)
        router.push("/login")
      } finally {
        setIsLoading(false)
      }
    }

    authenticate()
  }, [router, searchParams])

  useEffect(() => {
    const updateDateTime = () => {
      setCurrentDateTime(new Date())
    }
    updateDateTime()
    const interval = setInterval(updateDateTime, 60000) // Update every minute
    return () => clearInterval(interval)
  }, [])

  if (isLoading || !dataLoaded) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-purple-50 to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">{isLoading ? "Authenticating..." : "Loading your dashboard..."}</p>
          {!isLoading && !dataLoaded && (
            <p className="text-gray-500 text-sm mt-2">Please wait while we fetch your data...</p>
          )}
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-center space-x-2">
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-500">Loading user data</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: "0.2s" }}></div>
              <span className="text-sm text-gray-500">Loading pet information</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  const statusCounts = getPetStatusCounts()

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start space-y-4 sm:space-y-0">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-purple-700 mb-2 text-black">Pet Dashboard</h1>
              <p className="text-sm sm:text-base text-gray-600 text-black">Manage your pets and track their status.</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-2 sm:p-3 text-center sm:text-right">
              <div className="text-base sm:text-lg font-medium text-black">
                {currentDateTime.toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </div>
              <div className="text-gray-500 text-xs sm:text-sm text-black">
                {currentDateTime.toLocaleTimeString("en-US", {
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6 lg:space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <Link
                href="/pet_name"
                className="bg-purple-50 hover:bg-purple-100 rounded-xl p-3 sm:p-4 transition-colors flex items-center"
              >
                <div className="bg-purple-100 p-2 sm:p-3 rounded-lg mr-2 sm:mr-3">
                  <Plus className="text-purple-600 w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <span className="font-medium text-sm sm:text-base text-black">Add New Pet</span>
              </Link>
              <Link
                href="/shop"
                className="bg-blue-50 hover:bg-blue-100 rounded-xl p-3 sm:p-4 transition-colors flex items-center"
              >
                <div className="bg-blue-100 p-2 sm:p-3 rounded-lg mr-2 sm:mr-3">
                  <ShoppingBag className="text-blue-600 w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <span className="font-medium text-sm sm:text-base text-black">Visit Shop</span>
              </Link>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 space-y-3 sm:space-y-0">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-800 text-black">Your Pets</h2>
                <div className="flex flex-wrap gap-1 sm:gap-2 overflow-x-auto">
                  <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-600 whitespace-nowrap">
                    Missing
                  </span>
                  <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-600 whitespace-nowrap">
                    Rehome
                  </span>
                  <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-600 whitespace-nowrap">
                    Safe
                  </span>
                  <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-600 whitespace-nowrap">
                    Adoption
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {pets.length === 0 ? (
                  <div className="col-span-full text-center py-12 sm:py-16">
                    <div className="w-20 sm:w-24 h-20 sm:h-24 mx-auto mb-4 sm:mb-6 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full flex items-center justify-center overflow-hidden shadow-md">
                      <Plus className="w-10 sm:w-12 h-10 sm:h-12 text-purple-400" />
                    </div>
                    <p className="text-gray-500 text-base sm:text-lg font-medium text-black">No pets found</p>
                    <p className="text-gray-400 text-xs sm:text-sm mt-2 text-black">
                      Add your first pet to get started!
                    </p>
                  </div>
                ) : (
                  pets.map((pet) => (
                    <div key={pet.id} className="border rounded-lg overflow-hidden">
                      <div
                        className="p-3 sm:p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                        onClick={handlePetCardClick}
                        data-id={pet.id}
                        data-name={pet.name}
                        data-type={pet.type}
                        data-gender={pet.gender}
                        data-description={pet.description}
                        data-date={pet.date}
                        data-address={pet.address}
                        data-status={pet.status}
                        data-image={pet.image}
                      >
                        <div className="w-full h-24 sm:h-28 md:h-32 bg-gray-100 rounded-lg flex items-center justify-center mb-2 sm:mb-3 relative overflow-hidden">
                          {pet.image ? (
                            <img
                              src={getPetImageUrl(pet.image) || "/placeholder.svg"}
                              alt={pet.name}
                              className="w-full h-full object-cover aspect-square"
                              onError={(e) => {
                                e.target.onerror = null
                                e.target.src = "https://via.placeholder.com/100"
                              }}
                            />
                          ) : (
                            <span className="text-gray-400 text-xs text-black">No Image</span>
                          )}
                          <span
                            className={`absolute top-1 sm:top-2 right-1 sm:right-2 w-3 sm:w-4 h-3 sm:h-4 rounded-full border-2 border-white ${
                              pet.status?.toLowerCase().includes("missing") ||
                              pet.status?.toLowerCase().includes("lost")
                                ? "bg-red-500"
                                : pet.status?.toLowerCase().includes("rehome") ||
                                    pet.status?.toLowerCase().includes("rehoming")
                                  ? "bg-yellow-500"
                                  : pet.status?.toLowerCase().includes("adoption")
                                    ? "bg-blue-500"
                                    : pet.status?.toLowerCase().includes("safe") ||
                                        pet.status?.toLowerCase().includes("home")
                                      ? "bg-green-500"
                                      : "bg-gray-500"
                            }`}
                          ></span>
                        </div>

                        <div className="text-center">
                          <h3 className="font-medium text-sm sm:text-base text-black mb-2">
                            {pet.name || "Unnamed Pet"}
                          </h3>
                          <div className="flex flex-wrap gap-1 justify-center mb-2">
                            {pet.type && (
                              <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-xs">
                                {pet.type}
                              </span>
                            )}
                            <span className={`px-2 py-0.5 rounded-full text-xs ${getStatusStyle(pet.status)}`}>
                              {pet.status || "Status not specified"}
                            </span>
                          </div>
                          {pet.date && (
                            <p className="text-xs text-gray-500 text-black">
                              {getDateLabel(pet.status)}: {new Date(pet.date).toLocaleDateString()}
                            </p>
                          )}
                        </div>

                        <div className="flex justify-center mt-2 sm:mt-3">
                          <button
                            onClick={(e) => togglePetDetails(pet.id, e)}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            {expandedPets[pet.id] ? (
                              <ChevronUp className="w-4 sm:w-5 h-4 sm:h-5" />
                            ) : (
                              <ChevronDown className="w-4 sm:w-5 h-4 sm:h-5 animate-pulse" />
                            )}
                          </button>
                        </div>
                      </div>

                      {expandedPets[pet.id] && (
                        <div className="px-3 sm:px-4 pb-3 sm:pb-4 border-t bg-gray-50">
                          <div className="mt-2 sm:mt-3">
                            {pet.description && (
                              <div className="mb-2 sm:mb-3">
                                <p className="text-xs font-medium text-gray-500 text-black mb-1">Description:</p>
                                <p className="text-xs sm:text-sm text-gray-600 text-black">{pet.description}</p>
                              </div>
                            )}
                            {pet.address && (
                              <div className="bg-gray-100 rounded-lg p-2 sm:p-3 mb-2 sm:mb-3">
                                <div className="flex items-center text-gray-600">
                                  <MapPin className="w-3 sm:w-4 h-3 sm:h-4 mr-1 sm:mr-2 flex-shrink-0" />
                                  <span className="text-xs sm:text-sm text-black">
                                    {getLocationLabel(pet.status)} {pet.address}
                                  </span>
                                </div>
                              </div>
                            )}
                            <div className="flex justify-center">
                              <button className="text-blue-600 flex items-center hover:text-blue-700 text-xs sm:text-sm">
                                <MapPin className="w-3 sm:w-4 h-3 sm:h-4 mr-1" />
                                View Details
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6 lg:space-y-8">
            {/* Status Summary */}
            <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-gray-800 text-black">Pet Status</h2>
              <div className="space-y-2 sm:space-y-3">
                <div className="flex items-center justify-between p-2 sm:p-3 rounded-lg bg-red-100 text-red-600">
                  <div className="flex items-center">
                    <AlertCircle className="mr-2 w-4 sm:w-5 h-4 sm:h-5" />
                    <span className="text-sm sm:text-base">Missing Pets</span>
                  </div>
                  <span className="font-bold text-sm sm:text-base">{statusCounts.missing}</span>
                </div>
                <div className="flex items-center justify-between p-2 sm:p-3 rounded-lg bg-yellow-100 text-yellow-600">
                  <div className="flex items-center">
                    <Home className="mr-2 w-4 sm:w-5 h-4 sm:h-5" />
                    <span className="text-sm sm:text-base">Need Rehoming</span>
                  </div>
                  <span className="font-bold text-sm sm:text-base">{statusCounts.rehome}</span>
                </div>
                <div className="flex items-center justify-between p-2 sm:p-3 rounded-lg bg-blue-100 text-blue-600">
                  <div className="flex items-center">
                    <Heart className="mr-2 w-4 sm:w-5 h-4 sm:h-5" />
                    <span className="text-sm sm:text-base">In Adoption</span>
                  </div>
                  <span className="font-bold text-sm sm:text-base">{statusCounts.adoption}</span>
                </div>
                <div className="flex items-center justify-between p-2 sm:p-3 rounded-lg bg-green-100 text-green-600">
                  <div className="flex items-center">
                    <CheckCircle className="mr-2 w-4 sm:w-5 h-4 sm:h-5" />
                    <span className="text-sm sm:text-base">Safe at Home</span>
                  </div>
                  <span className="font-bold text-sm sm:text-base">{statusCounts.safe}</span>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3 text-gray-800 text-black">Quick Links</h2>
              <div className="space-y-1 sm:space-y-2">
                <Link
                  href="/conversations"
                  className="flex items-center p-1.5 sm:p-2 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <div className="bg-purple-100 p-1.5 sm:p-2 rounded-lg mr-2 sm:mr-3">
                    <MessageSquare className="text-purple-600 w-3 sm:w-4 h-3 sm:h-4" />
                  </div>
                  <span className="text-xs sm:text-sm text-black">Messages</span>
                </Link>
                <Link
                  href="/settings/account_information"
                  className="flex items-center p-1.5 sm:p-2 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <div className="bg-blue-100 p-1.5 sm:p-2 rounded-lg mr-2 sm:mr-3">
                    <Settings className="text-blue-600 w-3 sm:w-4 h-3 sm:h-4" />
                  </div>
                  <span className="text-xs sm:text-sm text-black">Account Settings</span>
                </Link>
                <Link href="#" className="flex items-center p-1.5 sm:p-2 hover:bg-gray-50 rounded-lg transition-colors">
                  <div className="bg-red-100 p-1.5 sm:p-2 rounded-lg mr-2 sm:mr-3">
                    <Search className="text-red-600 w-3 sm:w-4 h-3 sm:h-4" />
                  </div>
                  <span className="text-xs sm:text-sm text-black">Lost Pet Tips</span>
                </Link>
                <Link href="#" className="flex items-center p-1.5 sm:p-2 hover:bg-gray-50 rounded-lg transition-colors">
                  <div className="bg-green-100 p-1.5 sm:p-2 rounded-lg mr-2 sm:mr-3">
                    <Flag className="text-green-600 w-3 sm:w-4 h-3 sm:h-4" />
                  </div>
                  <span className="text-xs sm:text-sm text-black">Found Pet Tips</span>
                </Link>
                <Link
                  href="/help"
                  className="flex items-center p-1.5 sm:p-2 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <div className="bg-yellow-100 p-1.5 sm:p-2 rounded-lg mr-2 sm:mr-3">
                    <HelpCircle className="text-yellow-600 w-3 sm:w-4 h-3 sm:h-4" />
                  </div>
                  <span className="text-xs sm:text-sm text-black">How to Help</span>
                </Link>
                <Link href="#" className="flex items-center p-1.5 sm:p-2 hover:bg-gray-50 rounded-lg transition-colors">
                  <div className="bg-indigo-100 p-1.5 sm:p-2 rounded-lg mr-2 sm:mr-3">
                    <Info className="text-indigo-600 w-3 sm:w-4 h-3 sm:h-4" />
                  </div>
                  <span className="text-xs sm:text-sm text-black">How PetCare Works</span>
                </Link>
                <Link href="#" className="flex items-center p-1.5 sm:p-2 hover:bg-gray-50 rounded-lg transition-colors">
                  <div className="bg-gray-100 p-1.5 sm:p-2 rounded-lg mr-2 sm:mr-3">
                    <Info className="text-gray-600 w-3 sm:w-4 h-3 sm:h-4" />
                  </div>
                  <span className="text-xs sm:text-sm text-black">About PetCare</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}







// "use client"

// import {
//   MessageSquare,
//   Plus,
//   ShoppingBag,
//   AlertCircle,
//   Home,
//   Heart,
//   CheckCircle,
//   Settings,
//   Search,
//   Flag,
//   HelpCircle,
//   Info,
//   MapPin,
//   ChevronDown,
//   ChevronUp,
// } from "lucide-react"
// import Link from "next/link"
// import { useEffect, useState } from "react"
// import { useRouter, useSearchParams } from "next/navigation"
// import Navbar from "../components/Navbar"
// import Footer from "../components/Footer"
// import CryptoJS from "crypto-js"
// import { fetchPetDashboard } from "../utils/api"

// // Add these constants after the imports
// const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://fkpimtcxncgwtdsfyrjb.supabase.co"
// const PET_IMAGES_BUCKET = "pet-images"

// const SECRET_KEY = "asdasdasd"

// const encryptData = (data) => {
//   return CryptoJS.AES.encrypt(JSON.stringify(data), SECRET_KEY).toString()
// }

// const decryptData = (encryptedData) => {
//   const bytes = CryptoJS.AES.decrypt(encryptedData, SECRET_KEY)
//   return JSON.parse(bytes.toString(CryptoJS.enc.Utf8))
// }

// const getPetImageUrl = (imageName) => {
//   if (!imageName) return "https://via.placeholder.com/100"
//   // Handle the format "1/main.jpg" -> "https://fkpimtcxncgwtdsfyrjb.supabase.co/storage/v1/object/public/pet-images/1/main.jpg"
//   return `${SUPABASE_URL}/storage/v1/object/public/${PET_IMAGES_BUCKET}/${imageName}`
// }

// export default function Dashboard() {
//   const router = useRouter()
//   const searchParams = useSearchParams()
//   const [isAuthenticated, setIsAuthenticated] = useState(false)
//   const [userData, setUserData] = useState(null)
//   const [isLoading, setIsLoading] = useState(true)
//   const [pets, setPets] = useState([])
//   const [dataLoaded, setDataLoaded] = useState(false)
//   const [expandedPets, setExpandedPets] = useState({})
//   const [currentDateTime, setCurrentDateTime] = useState(new Date())

//   const handlePetCardClick = (e) => {
//     // Find the closest card element (in case children are clicked)
//     const card = e.currentTarget

//     // Get all the data attributes
//     const petData = {
//       id: card.dataset.id,
//       name: card.dataset.name,
//       type: card.dataset.type,
//       gender: card.dataset.gender,
//       description: card.dataset.description,
//       date: card.dataset.date,
//       address: card.dataset.address,
//       status: card.dataset.status,
//       image: card.dataset.image,
//     }

//     // Navigate to pet profile page with the ID
//     router.push(`/pet_profile/${petData.id}`)
//   }

//   const togglePetDetails = (petId, e) => {
//     e.stopPropagation() // Prevent card click navigation
//     setExpandedPets((prev) => ({
//       ...prev,
//       [petId]: !prev[petId],
//     }))
//   }

//   const getStatusStyle = (status) => {
//     const statusLower = status?.toLowerCase() || ""
//     if (statusLower.includes("missing") || statusLower.includes("lost")) {
//       return "bg-red-100 text-red-600 border-red-200"
//     } else if (statusLower.includes("rehome") || statusLower.includes("rehoming")) {
//       return "bg-yellow-100 text-yellow-600 border-yellow-200"
//     } else if (statusLower.includes("safe") || statusLower.includes("home")) {
//       return "bg-green-100 text-green-600 border-green-200"
//     } else if (statusLower.includes("adoption")) {
//       return "bg-blue-100 text-blue-600 border-blue-200"
//     }
//     return "bg-gray-100 text-gray-600 border-gray-200"
//   }

//   const getPetStatusCounts = () => {
//     const counts = { missing: 0, rehome: 0, safe: 0, adoption: 0 }
//     pets.forEach((pet) => {
//       const status = pet.status?.toLowerCase() || ""
//       if (status.includes("missing") || status.includes("lost")) {
//         counts.missing++
//       } else if (status.includes("rehome") || status.includes("rehoming")) {
//         counts.rehome++
//       } else if (status.includes("safe") || status.includes("home")) {
//         counts.safe++
//       } else if (status.includes("adoption")) {
//         counts.adoption++
//       }
//     })
//     return counts
//   }

//   const getDateLabel = (status) => {
//     const statusLower = status?.toLowerCase() || ""
//     if (statusLower.includes("missing") || statusLower.includes("lost")) {
//       return "Date missing"
//     } else if (statusLower.includes("pet i found") || statusLower.includes("found")) {
//       return "Date Found"
//     } else if (statusLower.includes("safe") || statusLower.includes("home") || statusLower.includes("rehome")) {
//       return "Date added"
//     }
//     return "Date added"
//   }

//   const getLocationLabel = (status) => {
//     const statusLower = status?.toLowerCase() || ""
//     if (statusLower.includes("pet i found") || statusLower.includes("found")) {
//       return "Location: found"
//     } else if (statusLower.includes("missing") || statusLower.includes("lost")) {
//       return "Last seen:"
//     } else if (statusLower.includes("rehome") || statusLower.includes("safe") || statusLower.includes("home")) {
//       return "Home:"
//     }
//     return "Location:"
//   }

//   useEffect(() => {
//     const authenticate = () => {
//       try {
//         const urlParams = new URLSearchParams(window.location.search)
//         const token = urlParams.get("token") || searchParams.get("token")
//         const userId = urlParams.get("user_id") || searchParams.get("user_id")
//         const user = urlParams.get("user") || searchParams.get("user")
//         const roles = urlParams.get("roles") || searchParams.get("roles")

//         if (token && userId && user) {
//           sessionStorage.setItem("auth_token", token)
//           sessionStorage.setItem("user_id", userId)
//           sessionStorage.setItem("user", user)
//           sessionStorage.setItem("roles", roles ? encryptData(roles) : encryptData("user"))
//           window.history.replaceState({}, "", window.location.pathname)
//         }

//         const storedToken = sessionStorage.getItem("auth_token")
//         const storedUserData = sessionStorage.getItem("user")
//         const storedUserId = sessionStorage.getItem("user_id")
//         const encryptedRoles = sessionStorage.getItem("roles")

//         if (!storedToken || !storedUserData || !storedUserId) {
//           throw new Error("Missing authentication data")
//         }

//         const storedRoles = decryptData(encryptedRoles)
//         if (storedRoles === "admin") {
//           router.push("/admin_dashboard")
//           return
//         } else if (storedRoles === "user") {
//           setIsAuthenticated(true)
//           fetchPetDashboard(storedToken)
//             .then((data) => {
//               setUserData(data.user)
//               setPets(data.pets || [])
//               setDataLoaded(true)
//             })
//             .catch((error) => {
//               console.error("Dashboard load failed:", error)
//               setDataLoaded(true) // Set to true even on error to prevent infinite loading
//             })
//         } else {
//           throw new Error("Invalid role")
//         }
//       } catch (error) {
//         console.error("Authentication error:", error)
//         router.push("/login")
//       } finally {
//         setIsLoading(false)
//       }
//     }

//     authenticate()
//   }, [router, searchParams])

//   useEffect(() => {
//     const updateDateTime = () => {
//       setCurrentDateTime(new Date())
//     }
//     updateDateTime()
//     const interval = setInterval(updateDateTime, 60000) // Update every minute
//     return () => clearInterval(interval)
//   }, [])

//   if (isLoading || !dataLoaded) {
//     return (
//       <div className="flex justify-center items-center h-screen bg-gradient-to-br from-purple-50 to-blue-50">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
//           <p className="text-gray-600 font-medium">{isLoading ? "Authenticating..." : "Loading your dashboard..."}</p>
//           {!isLoading && !dataLoaded && (
//             <p className="text-gray-500 text-sm mt-2">Please wait while we fetch your data...</p>
//           )}
//           <div className="mt-4 space-y-2">
//             <div className="flex items-center justify-center space-x-2">
//               <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
//               <span className="text-sm text-gray-500">Loading user data</span>
//             </div>
//             <div className="flex items-center justify-center space-x-2">
//               <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: "0.2s" }}></div>
//               <span className="text-sm text-gray-500">Loading pet information</span>
//             </div>
//           </div>
//         </div>
//       </div>
//     )
//   }

//   if (!isAuthenticated) {
//     return null
//   }

//   const statusCounts = getPetStatusCounts()

//   return (
//     <div className="min-h-screen bg-gray-50">
//       <Navbar />

//       <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
//         <div className="mb-8">
//           <div className="flex justify-between items-start">
//             <div>
//               <h1 className="text-3xl font-bold text-purple-700 mb-2 text-black">Pet Dashboard</h1>
//               <p className="text-gray-600 text-black">Manage your pets and track their status.</p>
//             </div>
//             <div className="bg-white rounded-lg shadow-sm p-3 text-right">
//               <div className="text-lg font-medium text-black">
//                 {currentDateTime.toLocaleDateString("en-US", {
//                   weekday: "long",
//                   year: "numeric",
//                   month: "long",
//                   day: "numeric",
//                 })}
//               </div>
//               <div className="text-gray-500 text-sm text-black">
//                 {currentDateTime.toLocaleTimeString("en-US", {
//                   hour: "numeric",
//                   minute: "2-digit",
//                 })}
//               </div>
//             </div>
//           </div>
//         </div>

//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//           {/* Left Column */}
//           <div className="lg:col-span-2 space-y-8">
//             <div className="grid grid-cols-2 gap-4">
//               <Link
//                 href="/pet_name"
//                 className="bg-purple-50 hover:bg-purple-100 rounded-xl p-4 transition-colors flex items-center"
//               >
//                 <div className="bg-purple-100 p-3 rounded-lg mr-3">
//                   <Plus className="text-purple-600 w-5 h-5" />
//                 </div>
//                 <span className="font-medium text-black">Add New Pet</span>
//               </Link>
//               <Link
//                 href="/shop"
//                 className="bg-blue-50 hover:bg-blue-100 rounded-xl p-4 transition-colors flex items-center"
//               >
//                 <div className="bg-blue-100 p-3 rounded-lg mr-3">
//                   <ShoppingBag className="text-blue-600 w-5 h-5" />
//                 </div>
//                 <span className="font-medium text-black">Visit Shop</span>
//               </Link>
//             </div>

//             <div className="bg-white rounded-xl shadow-sm p-6">
//               <div className="flex justify-between items-center mb-4">
//                 <h2 className="text-xl font-semibold text-gray-800 text-black">Your Pets</h2>
//                 <div className="flex space-x-2">
//                   <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-600">Missing</span>
//                   <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-600">Rehome</span>
//                   <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-600">Safe</span>
//                   <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-600">Adoption</span>
//                 </div>
//               </div>

//               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//                 {pets.length === 0 ? (
//                   <div className="col-span-full text-center py-16">
//                     <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full flex items-center justify-center overflow-hidden shadow-md">
//                       <Plus className="w-12 h-12 text-purple-400" />
//                     </div>
//                     <p className="text-gray-500 text-lg font-medium text-black">No pets found</p>
//                     <p className="text-gray-400 text-sm mt-2 text-black">Add your first pet to get started!</p>
//                   </div>
//                 ) : (
//                   pets.map((pet) => (
//                     <div key={pet.id} className="border rounded-lg overflow-hidden">
//                       <div
//                         className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
//                         onClick={handlePetCardClick}
//                         data-id={pet.id}
//                         data-name={pet.name}
//                         data-type={pet.type}
//                         data-gender={pet.gender}
//                         data-description={pet.description}
//                         data-date={pet.date}
//                         data-address={pet.address}
//                         data-status={pet.status}
//                         data-image={pet.image}
//                       >
//                         <div className="w-full h-32 bg-gray-100 rounded-lg flex items-center justify-center mb-3 relative overflow-hidden">
//                           {pet.image ? (
//                             <img
//                               src={getPetImageUrl(pet.image) || "/placeholder.svg"}
//                               alt={pet.name}
//                               className="w-full h-full object-cover"
//                               onError={(e) => {
//                                 e.target.onerror = null
//                                 e.target.src = "https://via.placeholder.com/100"
//                               }}
//                             />
//                           ) : (
//                             <span className="text-gray-400 text-xs text-black">No Image</span>
//                           )}
//                           <span
//                             className={`absolute top-2 right-2 w-4 h-4 rounded-full border-2 border-white ${
//                               pet.status?.toLowerCase().includes("missing") ||
//                               pet.status?.toLowerCase().includes("lost")
//                                 ? "bg-red-500"
//                                 : pet.status?.toLowerCase().includes("rehome") ||
//                                     pet.status?.toLowerCase().includes("rehoming")
//                                   ? "bg-yellow-500"
//                                   : pet.status?.toLowerCase().includes("adoption")
//                                     ? "bg-blue-500"
//                                     : pet.status?.toLowerCase().includes("safe") ||
//                                         pet.status?.toLowerCase().includes("home")
//                                       ? "bg-green-500"
//                                       : "bg-gray-500"
//                             }`}
//                           ></span>
//                         </div>

//                         <div className="text-center">
//                           <h3 className="font-medium text-black mb-2">{pet.name || "Unnamed Pet"}</h3>
//                           <div className="flex flex-wrap gap-1 justify-center mb-2">
//                             {pet.type && (
//                               <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-xs">
//                                 {pet.type}
//                               </span>
//                             )}
//                             <span className={`px-2 py-0.5 rounded-full text-xs ${getStatusStyle(pet.status)}`}>
//                               {pet.status || "Status not specified"}
//                             </span>
//                           </div>
//                           {pet.date && (
//                             <p className="text-xs text-gray-500 text-black">
//                               {getDateLabel(pet.status)}: {new Date(pet.date).toLocaleDateString()}
//                             </p>
//                           )}
//                         </div>

//                         <div className="flex justify-center mt-3">
//                           <button
//                             onClick={(e) => togglePetDetails(pet.id, e)}
//                             className="text-gray-400 hover:text-gray-600"
//                           >
//                             {expandedPets[pet.id] ? (
//                               <ChevronUp className="w-5 h-5" />
//                             ) : (
//                               <ChevronDown className="w-5 h-5 animate-pulse" />
//                             )}
//                           </button>
//                         </div>
//                       </div>

//                       {expandedPets[pet.id] && (
//                         <div className="px-4 pb-4 border-t bg-gray-50">
//                           <div className="mt-3">
//                             {pet.description && (
//                               <div className="mb-3">
//                                 <p className="text-xs font-medium text-gray-500 text-black mb-1">Description:</p>
//                                 <p className="text-sm text-gray-600 text-black">{pet.description}</p>
//                               </div>
//                             )}
//                             {pet.address && (
//                               <div className="bg-gray-100 rounded-lg p-3 mb-3">
//                                 <div className="flex items-center text-gray-600">
//                                   <MapPin className="w-4 h-4 mr-2" />
//                                   <span className="text-sm text-black">
//                                     {getLocationLabel(pet.status)} {pet.address}
//                                   </span>
//                                 </div>
//                               </div>
//                             )}
//                             <div className="flex justify-center">
//                               <button className="text-blue-600 flex items-center hover:text-blue-700">
//                                 <MapPin className="w-4 h-4 mr-1" />
//                                 View Details
//                               </button>
//                             </div>
//                           </div>
//                         </div>
//                       )}
//                     </div>
//                   ))
//                 )}
//               </div>
//             </div>
//           </div>

//           <div className="space-y-8">
//             {/* Status Summary */}
//             <div className="bg-white rounded-xl shadow-sm p-6">
//               <h2 className="text-xl font-semibold mb-4 text-gray-800 text-black">Pet Status</h2>
//               <div className="space-y-3">
//                 <div className="flex items-center justify-between p-3 rounded-lg bg-red-100 text-red-600">
//                   <div className="flex items-center">
//                     <AlertCircle className="mr-2 w-5 h-5" />
//                     <span>Missing Pets</span>
//                   </div>
//                   <span className="font-bold">{statusCounts.missing}</span>
//                 </div>
//                 <div className="flex items-center justify-between p-3 rounded-lg bg-yellow-100 text-yellow-600">
//                   <div className="flex items-center">
//                     <Home className="mr-2 w-5 h-5" />
//                     <span>Need Rehoming</span>
//                   </div>
//                   <span className="font-bold">{statusCounts.rehome}</span>
//                 </div>
//                 <div className="flex items-center justify-between p-3 rounded-lg bg-blue-100 text-blue-600">
//                   <div className="flex items-center">
//                     <Heart className="mr-2 w-5 h-5" />
//                     <span>In Adoption</span>
//                   </div>
//                   <span className="font-bold">{statusCounts.adoption}</span>
//                 </div>
//                 <div className="flex items-center justify-between p-3 rounded-lg bg-green-100 text-green-600">
//                   <div className="flex items-center">
//                     <CheckCircle className="mr-2 w-5 h-5" />
//                     <span>Safe at Home</span>
//                   </div>
//                   <span className="font-bold">{statusCounts.safe}</span>
//                 </div>
//               </div>
//             </div>

//             {/* Quick Links */}
//             <div className="bg-white rounded-xl shadow-sm p-6">
//               <h2 className="text-xl font-semibold mb-3 text-gray-800 text-black">Quick Links</h2>
//               <div className="space-y-2">
//                 <Link
//                   href="/conversations"
//                   className="flex items-center p-2 hover:bg-gray-50 rounded-lg transition-colors"
//                 >
//                   <div className="bg-purple-100 p-2 rounded-lg mr-3">
//                     <MessageSquare className="text-purple-600 w-4 h-4" />
//                   </div>
//                   <span className="text-sm text-black">Messages</span>
//                 </Link>
//                 <Link
//                   href="/settings/account_information"
//                   className="flex items-center p-2 hover:bg-gray-50 rounded-lg transition-colors"
//                 >
//                   <div className="bg-blue-100 p-2 rounded-lg mr-3">
//                     <Settings className="text-blue-600 w-4 h-4" />
//                   </div>
//                   <span className="text-sm text-black">Account Settings</span>
//                 </Link>
//                 <Link href="#" className="flex items-center p-2 hover:bg-gray-50 rounded-lg transition-colors">
//                   <div className="bg-red-100 p-2 rounded-lg mr-3">
//                     <Search className="text-red-600 w-4 h-4" />
//                   </div>
//                   <span className="text-sm text-black">Lost Pet Tips</span>
//                 </Link>
//                 <Link href="#" className="flex items-center p-2 hover:bg-gray-50 rounded-lg transition-colors">
//                   <div className="bg-green-100 p-2 rounded-lg mr-3">
//                     <Flag className="text-green-600 w-4 h-4" />
//                   </div>
//                   <span className="text-sm text-black">Found Pet Tips</span>
//                 </Link>
//                 <Link href="/help" className="flex items-center p-2 hover:bg-gray-50 rounded-lg transition-colors">
//                   <div className="bg-yellow-100 p-2 rounded-lg mr-3">
//                     <HelpCircle className="text-yellow-600 w-4 h-4" />
//                   </div>
//                   <span className="text-sm text-black">How to Help</span>
//                 </Link>
//                 <Link href="#" className="flex items-center p-2 hover:bg-gray-50 rounded-lg transition-colors">
//                   <div className="bg-indigo-100 p-2 rounded-lg mr-3">
//                     <Info className="text-indigo-600 w-4 h-4" />
//                   </div>
//                   <span className="text-sm text-black">How PetCare Works</span>
//                 </Link>
//                 <Link href="#" className="flex items-center p-2 hover:bg-gray-50 rounded-lg transition-colors">
//                   <div className="bg-gray-100 p-2 rounded-lg mr-3">
//                     <Info className="text-gray-600 w-4 h-4" />
//                   </div>
//                   <span className="text-sm text-black">About PetCare</span>
//                 </Link>
//               </div>
//             </div>
//           </div>
//         </div>
//       </main>

//       <Footer />
//     </div>
//   )
// }





// // "use client"

// // import {
// //   MessageSquare,
// //   Plus,
// //   ShoppingBag,
// //   AlertCircle,
// //   Home,
// //   Heart,
// //   CheckCircle,
// //   Settings,
// //   Search,
// //   Flag,
// //   HelpCircle,
// //   Info,
// //   MapPin,
// //   ChevronDown,
// //   ChevronUp,
// //   Share2,
// // } from "lucide-react"
// // import Link from "next/link"
// // import { useEffect, useState } from "react"
// // import { useRouter, useSearchParams } from "next/navigation"
// // import Navbar from "../components/Navbar"
// // import Footer from "../components/Footer"
// // import CryptoJS from "crypto-js"
// // import { fetchPetDashboard } from "../utils/api"

// // // Add these constants after the imports
// // const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://fkpimtcxncgwtdsfyrjb.supabase.co"
// // const PET_IMAGES_BUCKET = "pet-images"

// // const SECRET_KEY = "asdasdasd"

// // const encryptData = (data) => {
// //   return CryptoJS.AES.encrypt(JSON.stringify(data), SECRET_KEY).toString()
// // }

// // const decryptData = (encryptedData) => {
// //   const bytes = CryptoJS.AES.decrypt(encryptedData, SECRET_KEY)
// //   return JSON.parse(bytes.toString(CryptoJS.enc.Utf8))
// // }

// // const getPetImageUrl = (imageName) => {
// //   if (!imageName) return "https://via.placeholder.com/100"
// //   // Handle the format "1/main.jpg" -> "https://fkpimtcxncgwtdsfyrjb.supabase.co/storage/v1/object/public/pet-images/1/main.jpg"
// //   return `${SUPABASE_URL}/storage/v1/object/public/${PET_IMAGES_BUCKET}/${imageName}`
// // }

// // export default function Dashboard() {
// //   const router = useRouter()
// //   const searchParams = useSearchParams()
// //   const [isAuthenticated, setIsAuthenticated] = useState(false)
// //   const [userData, setUserData] = useState(null)
// //   const [isLoading, setIsLoading] = useState(true)
// //   const [pets, setPets] = useState([])
// //   const [dataLoaded, setDataLoaded] = useState(false)
// //   const [expandedPets, setExpandedPets] = useState({})
// //   const [currentDateTime, setCurrentDateTime] = useState(new Date())

// //   const handlePetCardClick = (e) => {
// //     // Find the closest card element (in case children are clicked)
// //     const card = e.currentTarget

// //     // Get all the data attributes
// //     const petData = {
// //       id: card.dataset.id,
// //       name: card.dataset.name,
// //       type: card.dataset.type,
// //       gender: card.dataset.gender,
// //       description: card.dataset.description,
// //       date: card.dataset.date,
// //       address: card.dataset.address,
// //       status: card.dataset.status,
// //       image: card.dataset.image,
// //     }

// //     // Navigate to pet profile page with the ID
// //     router.push(`/pet_profile/${petData.id}`)
// //   }

// //   const togglePetDetails = (petId, e) => {
// //     e.stopPropagation() // Prevent card click navigation
// //     setExpandedPets((prev) => ({
// //       ...prev,
// //       [petId]: !prev[petId],
// //     }))
// //   }

// //   const getStatusStyle = (status) => {
// //     const statusLower = status?.toLowerCase() || ""
// //     if (statusLower.includes("missing") || statusLower.includes("lost")) {
// //       return "bg-red-100 text-red-600 border-red-200"
// //     } else if (statusLower.includes("rehome") || statusLower.includes("rehoming")) {
// //       return "bg-yellow-100 text-yellow-600 border-yellow-200"
// //     } else if (statusLower.includes("safe") || statusLower.includes("home")) {
// //       return "bg-green-100 text-green-600 border-green-200"
// //     } else if (statusLower.includes("adoption")) {
// //       return "bg-blue-100 text-blue-600 border-blue-200"
// //     }
// //     return "bg-gray-100 text-gray-600 border-gray-200"
// //   }

// //   const getPetStatusCounts = () => {
// //     const counts = { missing: 0, rehome: 0, safe: 0, adoption: 0 }
// //     pets.forEach((pet) => {
// //       const status = pet.status?.toLowerCase() || ""
// //       if (status.includes("missing") || status.includes("lost")) {
// //         counts.missing++
// //       } else if (status.includes("rehome") || status.includes("rehoming")) {
// //         counts.rehome++
// //       } else if (status.includes("safe") || status.includes("home")) {
// //         counts.safe++
// //       } else if (status.includes("adoption")) {
// //         counts.adoption++
// //       }
// //     })
// //     return counts
// //   }

// //   useEffect(() => {
// //     const authenticate = () => {
// //       try {
// //         const urlParams = new URLSearchParams(window.location.search)
// //         const token = urlParams.get("token") || searchParams.get("token")
// //         const userId = urlParams.get("user_id") || searchParams.get("user_id")
// //         const user = urlParams.get("user") || searchParams.get("user")
// //         const roles = urlParams.get("roles") || searchParams.get("roles")

// //         if (token && userId && user) {
// //           sessionStorage.setItem("auth_token", token)
// //           sessionStorage.setItem("user_id", userId)
// //           sessionStorage.setItem("user", user)
// //           sessionStorage.setItem("roles", roles ? encryptData(roles) : encryptData("user"))
// //           window.history.replaceState({}, "", window.location.pathname)
// //         }

// //         const storedToken = sessionStorage.getItem("auth_token")
// //         const storedUserData = sessionStorage.getItem("user")
// //         const storedUserId = sessionStorage.getItem("user_id")
// //         const encryptedRoles = sessionStorage.getItem("roles")

// //         if (!storedToken || !storedUserData || !storedUserId) {
// //           throw new Error("Missing authentication data")
// //         }

// //         const storedRoles = decryptData(encryptedRoles)
// //         if (storedRoles === "admin") {
// //           router.push("/admin_dashboard")
// //           return
// //         } else if (storedRoles === "user") {
// //           setIsAuthenticated(true)
// //           fetchPetDashboard(storedToken)
// //             .then((data) => {
// //               setUserData(data.user)
// //               setPets(data.pets || [])
// //               setDataLoaded(true)
// //             })
// //             .catch((error) => {
// //               console.error("Dashboard load failed:", error)
// //               setDataLoaded(true) // Set to true even on error to prevent infinite loading
// //             })
// //         } else {
// //           throw new Error("Invalid role")
// //         }
// //       } catch (error) {
// //         console.error("Authentication error:", error)
// //         router.push("/login")
// //       } finally {
// //         setIsLoading(false)
// //       }
// //     }

// //     authenticate()
// //   }, [router, searchParams])

// //   useEffect(() => {
// //     const updateDateTime = () => {
// //       setCurrentDateTime(new Date())
// //     }
// //     updateDateTime()
// //     const interval = setInterval(updateDateTime, 60000) // Update every minute
// //     return () => clearInterval(interval)
// //   }, [])

// //   if (isLoading || !dataLoaded) {
// //     return (
// //       <div className="flex justify-center items-center h-screen bg-gradient-to-br from-purple-50 to-blue-50">
// //         <div className="text-center">
// //           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
// //           <p className="text-gray-600 font-medium">{isLoading ? "Authenticating..." : "Loading your dashboard..."}</p>
// //           {!isLoading && !dataLoaded && (
// //             <p className="text-gray-500 text-sm mt-2">Please wait while we fetch your data...</p>
// //           )}
// //           <div className="mt-4 space-y-2">
// //             <div className="flex items-center justify-center space-x-2">
// //               <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
// //               <span className="text-sm text-gray-500">Loading user data</span>
// //             </div>
// //             <div className="flex items-center justify-center space-x-2">
// //               <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: "0.2s" }}></div>
// //               <span className="text-sm text-gray-500">Loading pet information</span>
// //             </div>
// //           </div>
// //         </div>
// //       </div>
// //     )
// //   }

// //   if (!isAuthenticated) {
// //     return null
// //   }

// //   const statusCounts = getPetStatusCounts()

// //   return (
// //     <div className="min-h-screen bg-gray-50">
// //       <Navbar />

// //       <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
// //         <div className="mb-8">
// //           <div className="flex justify-between items-start">
// //             <div>
// //               <h1 className="text-3xl font-bold text-purple-700 mb-2 text-black">Pet Dashboard</h1>
// //               <p className="text-gray-600 text-black">Manage your pets and track their status.</p>
// //             </div>
// //             <div className="bg-white rounded-lg shadow-sm p-3 text-right">
// //               <div className="text-lg font-medium text-black">
// //                 {currentDateTime.toLocaleDateString("en-US", {
// //                   weekday: "long",
// //                   year: "numeric",
// //                   month: "long",
// //                   day: "numeric",
// //                 })}
// //               </div>
// //               <div className="text-gray-500 text-sm text-black">
// //                 {currentDateTime.toLocaleTimeString("en-US", {
// //                   hour: "numeric",
// //                   minute: "2-digit",
// //                 })}
// //               </div>
// //             </div>
// //           </div>
// //         </div>

// //         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
// //           {/* Left Column */}
// //           <div className="lg:col-span-2 space-y-8">
// //             <div className="grid grid-cols-2 gap-4">
// //               <Link
// //                 href="/pet_name"
// //                 className="bg-purple-50 hover:bg-purple-100 rounded-xl p-4 transition-colors flex items-center"
// //               >
// //                 <div className="bg-purple-100 p-3 rounded-lg mr-3">
// //                   <Plus className="text-purple-600 w-5 h-5" />
// //                 </div>
// //                 <span className="font-medium text-black">Add New Pet</span>
// //               </Link>
// //               <Link
// //                 href="/shop/shop"
// //                 className="bg-blue-50 hover:bg-blue-100 rounded-xl p-4 transition-colors flex items-center"
// //               >
// //                 <div className="bg-blue-100 p-3 rounded-lg mr-3">
// //                   <ShoppingBag className="text-blue-600 w-5 h-5" />
// //                 </div>
// //                 <span className="font-medium text-black">Visit Shop</span>
// //               </Link>
// //             </div>

// //             <div className="bg-white rounded-xl shadow-sm p-6">
// //               <div className="flex justify-between items-center mb-4">
// //                 <h2 className="text-xl font-semibold text-gray-800 text-black">Your Pets</h2>
// //                 <div className="flex space-x-2">
// //                   <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-600">Missing</span>
// //                   <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-600">Rehome</span>
// //                   <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-600">Safe</span>
// //                   <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-600">Adoption</span>
// //                 </div>
// //               </div>

// //               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
// //                 {pets.length === 0 ? (
// //                   <div className="col-span-full text-center py-16">
// //                     <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full flex items-center justify-center overflow-hidden shadow-md">
// //                       <Plus className="w-12 h-12 text-purple-400" />
// //                     </div>
// //                     <p className="text-gray-500 text-lg font-medium text-black">No pets found</p>
// //                     <p className="text-gray-400 text-sm mt-2 text-black">Add your first pet to get started!</p>
// //                   </div>
// //                 ) : (
// //                   pets.map((pet) => (
// //                     <div key={pet.id} className="border rounded-lg overflow-hidden">
// //                       <div
// //                         className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
// //                         onClick={handlePetCardClick}
// //                         data-id={pet.id}
// //                         data-name={pet.name}
// //                         data-type={pet.type}
// //                         data-gender={pet.gender}
// //                         data-description={pet.description}
// //                         data-date={pet.date}
// //                         data-address={pet.address}
// //                         data-status={pet.status}
// //                         data-image={pet.image}
// //                       >
// //                         <div className="w-full h-32 bg-gray-100 rounded-lg flex items-center justify-center mb-3 relative overflow-hidden">
// //                           {pet.image ? (
// //                             <img
// //                               src={getPetImageUrl(pet.image) || "/placeholder.svg"}
// //                               alt={pet.name}
// //                               className="w-full h-full object-cover"
// //                               onError={(e) => {
// //                                 e.target.onerror = null
// //                                 e.target.src = "https://via.placeholder.com/100"
// //                               }}
// //                             />
// //                           ) : (
// //                             <span className="text-gray-400 text-xs text-black">No Image</span>
// //                           )}
// //                           <span
// //                             className={`absolute top-2 right-2 w-4 h-4 rounded-full border-2 border-white ${
// //                               pet.status?.toLowerCase().includes("missing") ||
// //                               pet.status?.toLowerCase().includes("lost")
// //                                 ? "bg-red-500"
// //                                 : pet.status?.toLowerCase().includes("rehome") ||
// //                                     pet.status?.toLowerCase().includes("rehoming")
// //                                   ? "bg-yellow-500"
// //                                   : pet.status?.toLowerCase().includes("adoption")
// //                                     ? "bg-blue-500"
// //                                     : pet.status?.toLowerCase().includes("safe") ||
// //                                         pet.status?.toLowerCase().includes("home")
// //                                       ? "bg-green-500"
// //                                       : "bg-gray-500"
// //                             }`}
// //                           ></span>
// //                         </div>

// //                         <div className="text-center">
// //                           <h3 className="font-medium text-black mb-2">{pet.name || "Unnamed Pet"}</h3>
// //                           <div className="flex flex-wrap gap-1 justify-center mb-2">
// //                             {pet.type && (
// //                               <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-xs">
// //                                 {pet.type}
// //                               </span>
// //                             )}
// //                             <span className={`px-2 py-0.5 rounded-full text-xs ${getStatusStyle(pet.status)}`}>
// //                               {pet.status || "Status not specified"}
// //                             </span>
// //                           </div>
// //                           {pet.date && (
// //                             <p className="text-xs text-gray-500 text-black">
// //                               Added: {new Date(pet.date).toLocaleDateString()}
// //                             </p>
// //                           )}
// //                         </div>

// //                         <div className="flex justify-center mt-3">
// //                           <button
// //                             onClick={(e) => togglePetDetails(pet.id, e)}
// //                             className="text-gray-400 hover:text-gray-600"
// //                           >
// //                             {expandedPets[pet.id] ? (
// //                               <ChevronUp className="w-5 h-5" />
// //                             ) : (
// //                               <ChevronDown className="w-5 h-5" />
// //                             )}
// //                           </button>
// //                         </div>
// //                       </div>

// //                       {expandedPets[pet.id] && (
// //                         <div className="px-4 pb-4 border-t bg-gray-50">
// //                           <div className="mt-3">
// //                             {pet.description && (
// //                               <p className="text-sm text-gray-600 mb-3 text-black">{pet.description}</p>
// //                             )}
// //                             {pet.address && (
// //                               <div className="bg-gray-100 rounded-lg p-3 mb-3">
// //                                 <div className="flex items-center text-gray-600">
// //                                   <MapPin className="w-4 h-4 mr-2" />
// //                                   <span className="text-sm text-black">{pet.address}</span>
// //                                 </div>
// //                               </div>
// //                             )}
// //                             <div className="flex justify-between text-sm">
// //                               <button className="text-purple-600 flex items-center hover:text-purple-700">
// //                                 <Share2 className="w-4 h-4 mr-1" />
// //                                 Share
// //                               </button>
// //                               <button className="text-blue-600 flex items-center hover:text-blue-700">
// //                                 <MapPin className="w-4 h-4 mr-1" />
// //                                 View Details
// //                               </button>
// //                             </div>
// //                           </div>
// //                         </div>
// //                       )}
// //                     </div>
// //                   ))
// //                 )}
// //               </div>
// //             </div>
// //           </div>

// //           <div className="space-y-8">
// //             {/* Status Summary */}
// //             <div className="bg-white rounded-xl shadow-sm p-6">
// //               <h2 className="text-xl font-semibold mb-4 text-gray-800 text-black">Pet Status</h2>
// //               <div className="space-y-3">
// //                 <div className="flex items-center justify-between p-3 rounded-lg bg-red-100 text-red-600">
// //                   <div className="flex items-center">
// //                     <AlertCircle className="mr-2 w-5 h-5" />
// //                     <span>Missing Pets</span>
// //                   </div>
// //                   <span className="font-bold">{statusCounts.missing}</span>
// //                 </div>
// //                 <div className="flex items-center justify-between p-3 rounded-lg bg-yellow-100 text-yellow-600">
// //                   <div className="flex items-center">
// //                     <Home className="mr-2 w-5 h-5" />
// //                     <span>Need Rehoming</span>
// //                   </div>
// //                   <span className="font-bold">{statusCounts.rehome}</span>
// //                 </div>
// //                 <div className="flex items-center justify-between p-3 rounded-lg bg-blue-100 text-blue-600">
// //                   <div className="flex items-center">
// //                     <Heart className="mr-2 w-5 h-5" />
// //                     <span>In Adoption</span>
// //                   </div>
// //                   <span className="font-bold">{statusCounts.adoption}</span>
// //                 </div>
// //                 <div className="flex items-center justify-between p-3 rounded-lg bg-green-100 text-green-600">
// //                   <div className="flex items-center">
// //                     <CheckCircle className="mr-2 w-5 h-5" />
// //                     <span>Safe at Home</span>
// //                   </div>
// //                   <span className="font-bold">{statusCounts.safe}</span>
// //                 </div>
// //               </div>
// //             </div>

// //             {/* Quick Links */}
// //             <div className="bg-white rounded-xl shadow-sm p-6">
// //               <h2 className="text-xl font-semibold mb-3 text-gray-800 text-black">Quick Links</h2>
// //               <div className="space-y-2">
// //                 <Link
// //                   href="/conversations"
// //                   className="flex items-center p-2 hover:bg-gray-50 rounded-lg transition-colors"
// //                 >
// //                   <div className="bg-purple-100 p-2 rounded-lg mr-3">
// //                     <MessageSquare className="text-purple-600 w-4 h-4" />
// //                   </div>
// //                   <span className="text-sm text-black">Messages</span>
// //                 </Link>
// //                 <Link
// //                   href="/settings/account_information"
// //                   className="flex items-center p-2 hover:bg-gray-50 rounded-lg transition-colors"
// //                 >
// //                   <div className="bg-blue-100 p-2 rounded-lg mr-3">
// //                     <Settings className="text-blue-600 w-4 h-4" />
// //                   </div>
// //                   <span className="text-sm text-black">Account Settings</span>
// //                 </Link>
// //                 <Link href="#" className="flex items-center p-2 hover:bg-gray-50 rounded-lg transition-colors">
// //                   <div className="bg-red-100 p-2 rounded-lg mr-3">
// //                     <Search className="text-red-600 w-4 h-4" />
// //                   </div>
// //                   <span className="text-sm text-black">Lost Pet Tips</span>
// //                 </Link>
// //                 <Link href="#" className="flex items-center p-2 hover:bg-gray-50 rounded-lg transition-colors">
// //                   <div className="bg-green-100 p-2 rounded-lg mr-3">
// //                     <Flag className="text-green-600 w-4 h-4" />
// //                   </div>
// //                   <span className="text-sm text-black">Found Pet Tips</span>
// //                 </Link>
// //                 <Link href="/help" className="flex items-center p-2 hover:bg-gray-50 rounded-lg transition-colors">
// //                   <div className="bg-yellow-100 p-2 rounded-lg mr-3">
// //                     <HelpCircle className="text-yellow-600 w-4 h-4" />
// //                   </div>
// //                   <span className="text-sm text-black">How to Help</span>
// //                 </Link>
// //                 <Link href="#" className="flex items-center p-2 hover:bg-gray-50 rounded-lg transition-colors">
// //                   <div className="bg-indigo-100 p-2 rounded-lg mr-3">
// //                     <Info className="text-indigo-600 w-4 h-4" />
// //                   </div>
// //                   <span className="text-sm text-black">How PetCare Works</span>
// //                 </Link>
// //                 <Link href="#" className="flex items-center p-2 hover:bg-gray-50 rounded-lg transition-colors">
// //                   <div className="bg-gray-100 p-2 rounded-lg mr-3">
// //                     <Info className="text-gray-600 w-4 h-4" />
// //                   </div>
// //                   <span className="text-sm text-black">About PetCare</span>
// //                 </Link>
// //               </div>
// //             </div>
// //           </div>
// //         </div>
// //       </main>

// //       <Footer />
// //     </div>
// //   )
// // }




// // // // //frontend\pages\pet_dashboard.js
// // // // "use client"

// // // // import { MessageSquare, User, ChevronRight } from "lucide-react"
// // // // import Link from "next/link"
// // // // import { useEffect, useState } from "react"
// // // // import { useRouter, useSearchParams } from "next/navigation"
// // // // import Navbar from "../components/Navbar"
// // // // import Footer from "../components/Footer"
// // // // import CryptoJS from "crypto-js"
// // // // import { fetchPetDashboard } from "../utils/api"

// // // // // Add these constants after the imports
// // // // const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://fkpimtcxncgwtdsfyrjb.supabase.co"
// // // // const PET_IMAGES_BUCKET = "pet-images"

// // // // const SECRET_KEY = "asdasdasd"

// // // // const encryptData = (data) => {
// // // //   return CryptoJS.AES.encrypt(JSON.stringify(data), SECRET_KEY).toString()
// // // // }

// // // // const decryptData = (encryptedData) => {
// // // //   const bytes = CryptoJS.AES.decrypt(encryptedData, SECRET_KEY)
// // // //   return JSON.parse(bytes.toString(CryptoJS.enc.Utf8))
// // // // }

// // // // const getPetImageUrl = (imageName) => {
// // // //   if (!imageName) return "https://via.placeholder.com/100"
// // // //   // Handle the format "1/main.jpg" -> "https://fkpimtcxncgwtdsfyrjb.supabase.co/storage/v1/object/public/pet-images/1/main.jpg"
// // // //   return `${SUPABASE_URL}/storage/v1/object/public/${PET_IMAGES_BUCKET}/${imageName}`
// // // // }

// // // // export default function Dashboard() {
// // // //   const router = useRouter()
// // // //   const searchParams = useSearchParams()
// // // //   const [isAuthenticated, setIsAuthenticated] = useState(false)
// // // //   const [userData, setUserData] = useState(null)
// // // //   const [isLoading, setIsLoading] = useState(true)
// // // //   const [pets, setPets] = useState([])
// // // //   const [dataLoaded, setDataLoaded] = useState(false)

// // // //   const handlePetCardClick = (e) => {
// // // //     // Find the closest card element (in case children are clicked)
// // // //     const card = e.currentTarget

// // // //     // Get all the data attributes
// // // //     const petData = {
// // // //       id: card.dataset.id,
// // // //       name: card.dataset.name,
// // // //       type: card.dataset.type,
// // // //       gender: card.dataset.gender,
// // // //       description: card.dataset.description,
// // // //       date: card.dataset.date,
// // // //       address: card.dataset.address,
// // // //       status: card.dataset.status,
// // // //       image: card.dataset.image,
// // // //     }

// // // //     // Navigate to pet profile page with the ID
// // // //     router.push(`/pet_profile/${petData.id}`)
// // // //   }

// // // //   useEffect(() => {
// // // //     const authenticate = () => {
// // // //       try {
// // // //         const urlParams = new URLSearchParams(window.location.search)
// // // //         const token = urlParams.get("token") || searchParams.get("token")
// // // //         const userId = urlParams.get("user_id") || searchParams.get("user_id")
// // // //         const user = urlParams.get("user") || searchParams.get("user")
// // // //         const roles = urlParams.get("roles") || searchParams.get("roles")

// // // //         if (token && userId && user) {
// // // //           sessionStorage.setItem("auth_token", token)
// // // //           sessionStorage.setItem("user_id", userId)
// // // //           sessionStorage.setItem("user", user)
// // // //           sessionStorage.setItem("roles", roles ? encryptData(roles) : encryptData("user"))
// // // //           window.history.replaceState({}, "", window.location.pathname)
// // // //         }

// // // //         const storedToken = sessionStorage.getItem("auth_token")
// // // //         const storedUserData = sessionStorage.getItem("user")
// // // //         const storedUserId = sessionStorage.getItem("user_id")
// // // //         const encryptedRoles = sessionStorage.getItem("roles")

// // // //         if (!storedToken || !storedUserData || !storedUserId) {
// // // //           throw new Error("Missing authentication data")
// // // //         }

// // // //         const storedRoles = decryptData(encryptedRoles)
// // // //         if (storedRoles === "admin") {
// // // //           router.push("/admin_dashboard")
// // // //           return
// // // //         } else if (storedRoles === "user") {
// // // //           setIsAuthenticated(true)
// // // //           fetchPetDashboard(storedToken)
// // // //             .then((data) => {
// // // //               setUserData(data.user)
// // // //               setPets(data.pets || [])
// // // //               setDataLoaded(true)
// // // //             })
// // // //             .catch((error) => {
// // // //               console.error("Dashboard load failed:", error)
// // // //               setDataLoaded(true) // Set to true even on error to prevent infinite loading
// // // //             })
// // // //         } else {
// // // //           throw new Error("Invalid role")
// // // //         }
// // // //       } catch (error) {
// // // //         console.error("Authentication error:", error)
// // // //         router.push("/login")
// // // //       } finally {
// // // //         setIsLoading(false)
// // // //       }
// // // //     }

// // // //     authenticate()
// // // //   }, [router, searchParams])

// // // //   if (isLoading || !dataLoaded) {
// // // //     return (
// // // //       <div className="flex justify-center items-center h-screen bg-gradient-to-br from-purple-50 to-blue-50">
// // // //         <div className="text-center">
// // // //           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
// // // //           <p className="text-gray-600 font-medium">
// // // //             {isLoading ? "Authenticating..." : "Loading your dashboard..."}
// // // //           </p>
// // // //           {!isLoading && !dataLoaded && (
// // // //             <p className="text-gray-500 text-sm mt-2">Please wait while we fetch your data...</p>
// // // //           )}
// // // //           <div className="mt-4 space-y-2">
// // // //             <div className="flex items-center justify-center space-x-2">
// // // //               <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
// // // //               <span className="text-sm text-gray-500">Loading user data</span>
// // // //             </div>
// // // //             <div className="flex items-center justify-center space-x-2">
// // // //               <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
// // // //               <span className="text-sm text-gray-500">Loading pet information</span>
// // // //             </div>
// // // //           </div>
// // // //         </div>
// // // //       </div>
// // // //     )
// // // //   }

// // // //   if (!isAuthenticated) {
// // // //     return null
// // // //   }

// // // //   return (
// // // //     <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
// // // //       <Navbar />

// // // //       <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
// // // //         <div className="mb-12">
// // // //           <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
// // // //             Dashboard
// // // //           </h1>
// // // //           {userData && (
// // // //             <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
// // // //               <p className="text-lg text-gray-700">
// // // //                 Welcome back, <span className="font-bold text-purple-700">{userData.name}</span>!
// // // //                 <span className="text-gray-500 ml-2">Ready to manage your pets?</span>
// // // //               </p>
// // // //             </div>
// // // //           )}
// // // //         </div>

// // // //         <div className="grid lg:grid-cols-3 gap-8">
// // // //           <div className="lg:col-span-2">
// // // //             <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8 gap-4">
// // // //               <h2 className="text-2xl font-bold text-gray-800">Your Pets</h2>
// // // //               <Link href="/pet_name">
// // // //                 <button className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full hover:from-purple-700 hover:to-blue-700 transform hover:scale-105 transition-all duration-200 shadow-lg font-medium">
// // // //                   <span className="flex items-center gap-2">
// // // //                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
// // // //                       <path
// // // //                         strokeLinecap="round"
// // // //                         strokeLinejoin="round"
// // // //                         strokeWidth={2}
// // // //                         d="M12 6v6m0 0v6m0-6h6m-6 0H6"
// // // //                       />
// // // //                     </svg>
// // // //                     Add a Pet
// // // //                   </span>
// // // //                 </button>
// // // //               </Link>
// // // //             </div>

// // // //             <div className="space-y-6">
// // // //               {pets.length === 0 ? (
// // // //                 <div className="text-center py-16 bg-white/50 backdrop-blur-sm rounded-3xl border border-white/20">
// // // //                   <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full flex items-center justify-center overflow-hidden shadow-md">
// // // //                     <svg className="w-12 h-12 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
// // // //                       <path
// // // //                         strokeLinecap="round"
// // // //                         strokeLinejoin="round"
// // // //                         strokeWidth={1.5}
// // // //                         d="M12 6v6m0 0v6m0-6h6m-6 0H6"
// // // //                       />
// // // //                     </svg>
// // // //                   </div>
// // // //                   <p className="text-gray-500 text-lg font-medium">No pets found</p>
// // // //                   <p className="text-gray-400 text-sm mt-2">Add your first pet to get started!</p>
// // // //                 </div>
// // // //               ) : (
// // // //                 pets.map((pet) => (
// // // //                   <div
// // // //                     key={pet.id}
// // // //                     className="group bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl hover:bg-white/80 cursor-pointer transform hover:-translate-y-1 transition-all duration-300"
// // // //                     onClick={handlePetCardClick}
// // // //                     // Hidden data attributes
// // // //                     data-id={pet.id}
// // // //                     data-name={pet.name}
// // // //                     data-type={pet.type}
// // // //                     data-gender={pet.gender}
// // // //                     data-description={pet.description}
// // // //                     data-date={pet.date}
// // // //                     data-address={pet.address}
// // // //                     data-status={pet.status}
// // // //                     data-image={pet.image}
// // // //                   >
// // // //                     <div className="flex items-center justify-between">
// // // //                       <div className="flex items-center space-x-6">
// // // //                         <div className="relative">
// // // //                           <div className="w-28 h-28 md:w-32 md:h-32 bg-gradient-to-br from-purple-100 to-blue-100 rounded-2xl flex items-center justify-center overflow-hidden shadow-md">
// // // //                             {pet.image ? (
// // // //                               <img
// // // //                                 src={getPetImageUrl(pet.image) || "/placeholder.svg"}
// // // //                                 alt={pet.name}
// // // //                                 className="w-full h-full object-cover"
// // // //                                 onError={(e) => {
// // // //                                   e.target.onerror = null
// // // //                                   e.target.src = "https://via.placeholder.com/100"
// // // //                                 }}
// // // //                               />
// // // //                             ) : (
// // // //                               <span className="text-purple-400 text-sm font-medium">No Image</span>
// // // //                             )}
// // // //                           </div>
// // // //                           <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full border-2 border-white shadow-sm"></div>
// // // //                         </div>
// // // //                         <div className="flex-1 min-w-0">
// // // //                           <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-purple-700 transition-colors">
// // // //                             {pet.name || "Unnamed Pet"}
// // // //                           </h3>
// // // //                           <div className="flex flex-wrap gap-2 text-sm">
// // // //                             {pet.type && (
// // // //                               <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full font-medium">
// // // //                                 {pet.type}
// // // //                               </span>
// // // //                             )}
// // // //                             <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">
// // // //                               {pet.status || "Status not specified"}
// // // //                             </span>
// // // //                           </div>
// // // //                         </div>
// // // //                       </div>
// // // //                       <div className="flex-shrink-0">
// // // //                         <ChevronRight className="h-6 w-6 text-gray-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all duration-200" />
// // // //                       </div>
// // // //                     </div>
// // // //                   </div>
// // // //                 ))
// // // //               )}
// // // //             </div>
// // // //           </div>

// // // //           <div className="space-y-8">
// // // //             <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
// // // //               <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
// // // //                 <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"></div>
// // // //                 Quick Access
// // // //               </h2>
// // // //               <div className="space-y-3">
// // // //                 <Link
// // // //                   href="/conversations"
// // // //                   className="group flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl hover:from-purple-100 hover:to-blue-100 transition-all duration-200 border border-purple-100"
// // // //                 >
// // // //                   <div className="flex items-center space-x-3">
// // // //                     <div className="p-2 bg-white rounded-lg shadow-sm">
// // // //                       <MessageSquare className="h-5 w-5 text-purple-600" />
// // // //                     </div>
// // // //                     <span className="font-medium text-gray-700 group-hover:text-purple-700">Messages</span>
// // // //                   </div>
// // // //                   <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all duration-200" />
// // // //                 </Link>

// // // //                 <Link
// // // //                   href="/settings/account_information"
// // // //                   className="group flex items-center justify-between p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl hover:from-emerald-100 hover:to-teal-100 transition-all duration-200 border border-emerald-100"
// // // //                 >
// // // //                   <div className="flex items-center space-x-3">
// // // //                     <div className="p-2 bg-white rounded-lg shadow-sm">
// // // //                       <User className="h-5 w-5 text-emerald-600" />
// // // //                     </div>
// // // //                     <span className="font-medium text-gray-700 group-hover:text-emerald-700">Account Settings</span>
// // // //                   </div>
// // // //                   <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all duration-200" />
// // // //                 </Link>

// // // //                 <Link
// // // //                   href="/notifications"
// // // //                   className="group flex items-center justify-between p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl hover:from-orange-100 hover:to-red-100 transition-all duration-200 border border-orange-100"
// // // //                 >
// // // //                   <div className="flex items-center space-x-3">
// // // //                     <div className="p-2 bg-white rounded-lg shadow-sm">
// // // //                       <svg className="h-5 w-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
// // // //                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5z" />
// // // //                         <path
// // // //                           strokeLinecap="round"
// // // //                           strokeLinejoin="round"
// // // //                           strokeWidth={2}
// // // //                           d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M9 11h.01"
// // // //                         />
// // // //                       </svg>
// // // //                     </div>
// // // //                     <span className="font-medium text-gray-700 group-hover:text-orange-700">Notifications</span>
// // // //                   </div>
// // // //                   <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-orange-600 group-hover:translate-x-1 transition-all duration-200" />
// // // //                 </Link>

// // // //                 <Link
// // // //                   href="/help"
// // // //                   className="group flex items-center justify-between p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl hover:from-indigo-100 hover:to-purple-100 transition-all duration-200 border border-indigo-100"
// // // //                 >
// // // //                   <div className="flex items-center space-x-3">
// // // //                     <div className="p-2 bg-white rounded-lg shadow-sm">
// // // //                       <svg className="h-5 w-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
// // // //                         <path
// // // //                           strokeLinecap="round"
// // // //                           strokeLinejoin="round"
// // // //                           strokeWidth={2}
// // // //                           d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
// // // //                         />
// // // //                       </svg>
// // // //                     </div>
// // // //                     <span className="font-medium text-gray-700 group-hover:text-indigo-700">Help & Support</span>
// // // //                   </div>
// // // //                   <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all duration-200" />
// // // //                 </Link>

// // // //                 <Link
// // // //                   href="/privacy"
// // // //                   className="group flex items-center justify-between p-4 bg-gradient-to-r from-pink-50 to-rose-50 rounded-xl hover:from-pink-100 hover:to-rose-100 transition-all duration-200 border border-pink-100"
// // // //                 >
// // // //                   <div className="flex items-center space-x-3">
// // // //                     <div className="p-2 bg-white rounded-lg shadow-sm">
// // // //                       <svg className="h-5 w-5 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
// // // //                         <path
// // // //                           strokeLinecap="round"
// // // //                           strokeLinejoin="round"
// // // //                           strokeWidth={2}
// // // //                           d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
// // // //                         />
// // // //                       </svg>
// // // //                     </div>
// // // //                     <span className="font-medium text-gray-700 group-hover:text-pink-700">Privacy Settings</span>
// // // //                   </div>
// // // //                   <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-pink-600 group-hover:translate-x-1 transition-all duration-200" />
// // // //                 </Link>
// // // //               </div>
// // // //             </div>
// // // //           </div>
// // // //         </div>
// // // //       </main>

// // // //       <Footer />
// // // //     </div>
// // // //   )
// // // // }











// // // //frontend\pages\pet_dashboard.js
// // // "use client"

// // // import { MessageSquare, User, ChevronRight } from "lucide-react"
// // // import Link from "next/link"
// // // import { useEffect, useState } from "react"
// // // import { useRouter, useSearchParams } from "next/navigation"
// // // import Navbar from "../components/Navbar"
// // // import Footer from "../components/Footer"
// // // import CryptoJS from "crypto-js"
// // // import { fetchPetDashboard } from "../utils/api"

// // // // Add these constants after the imports
// // // const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://fkpimtcxncgwtdsfyrjb.supabase.co"
// // // const PET_IMAGES_BUCKET = "pet-images"

// // // const SECRET_KEY = "asdasdasd"

// // // const encryptData = (data) => {
// // //   return CryptoJS.AES.encrypt(JSON.stringify(data), SECRET_KEY).toString()
// // // }

// // // const decryptData = (encryptedData) => {
// // //   const bytes = CryptoJS.AES.decrypt(encryptedData, SECRET_KEY)
// // //   return JSON.parse(bytes.toString(CryptoJS.enc.Utf8))
// // // }

// // // const getPetImageUrl = (imageName) => {
// // //   if (!imageName) return "https://via.placeholder.com/100"
// // //   // Handle the format "1/main.jpg" -> "https://fkpimtcxncgwtdsfyrjb.supabase.co/storage/v1/object/public/pet-images/1/main.jpg"
// // //   return `${SUPABASE_URL}/storage/v1/object/public/${PET_IMAGES_BUCKET}/${imageName}`
// // // }

// // // export default function Dashboard() {
// // //   const router = useRouter()
// // //   const searchParams = useSearchParams()
// // //   const [isAuthenticated, setIsAuthenticated] = useState(false)
// // //   const [userData, setUserData] = useState(null)
// // //   const [isLoading, setIsLoading] = useState(true)
// // //   const [pets, setPets] = useState([])

// // //   const handlePetCardClick = (e) => {
// // //     // Find the closest card element (in case children are clicked)
// // //     const card = e.currentTarget

// // //     // Get all the data attributes
// // //     const petData = {
// // //       id: card.dataset.id,
// // //       name: card.dataset.name,
// // //       type: card.dataset.type,
// // //       gender: card.dataset.gender,
// // //       description: card.dataset.description,
// // //       date: card.dataset.date,
// // //       address: card.dataset.address,
// // //       status: card.dataset.status,
// // //       image: card.dataset.image,
// // //     }

// // //     // Navigate to pet profile page with the ID
// // //     router.push(`/pet_profile/${petData.id}`)
// // //   }

// // //   useEffect(() => {
// // //     const authenticate = () => {
// // //       try {
// // //         const urlParams = new URLSearchParams(window.location.search)
// // //         const token = urlParams.get("token") || searchParams.get("token")
// // //         const userId = urlParams.get("user_id") || searchParams.get("user_id")
// // //         const user = urlParams.get("user") || searchParams.get("user")
// // //         const roles = urlParams.get("roles") || searchParams.get("roles")

// // //         if (token && userId && user) {
// // //           sessionStorage.setItem("auth_token", token)
// // //           sessionStorage.setItem("user_id", userId)
// // //           sessionStorage.setItem("user", user)
// // //           sessionStorage.setItem("roles", roles ? encryptData(roles) : encryptData("user"))
// // //           window.history.replaceState({}, "", window.location.pathname)
// // //         }

// // //         const storedToken = sessionStorage.getItem("auth_token")
// // //         const storedUserData = sessionStorage.getItem("user")
// // //         const storedUserId = sessionStorage.getItem("user_id")
// // //         const encryptedRoles = sessionStorage.getItem("roles")

// // //         if (!storedToken || !storedUserData || !storedUserId) {
// // //           throw new Error("Missing authentication data")
// // //         }

// // //         const storedRoles = decryptData(encryptedRoles)
// // //         if (storedRoles === "admin") {
// // //           router.push("/admin_dashboard")
// // //           return
// // //         } else if (storedRoles === "user") {
// // //           setIsAuthenticated(true)
// // //           fetchPetDashboard(storedToken)
// // //             .then((data) => {
// // //               setUserData(data.user)
// // //               setPets(data.pets || [])
// // //             })
// // //             .catch((error) => {
// // //               console.error("Dashboard load failed:", error)
// // //             })
// // //         } else {
// // //           throw new Error("Invalid role")
// // //         }
// // //       } catch (error) {
// // //         console.error("Authentication error:", error)
// // //         router.push("/login")
// // //       } finally {
// // //         setIsLoading(false)
// // //       }
// // //     }

// // //     authenticate()
// // //   }, [router, searchParams])

// // //   if (isLoading) {
// // //     return (
// // //       <div className="flex justify-center items-center h-screen bg-gradient-to-br from-purple-50 to-blue-50">
// // //         <div className="text-center">
// // //           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
// // //           <p className="text-gray-600 font-medium">Loading your dashboard...</p>
// // //         </div>
// // //       </div>
// // //     )
// // //   }

// // //   if (!isAuthenticated) {
// // //     return null
// // //   }

// // //   return (
// // //     <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
// // //       <Navbar />

// // //       <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
// // //         <div className="mb-12">
// // //           <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
// // //             Dashboard
// // //           </h1>
// // //           {userData && (
// // //             <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
// // //               <p className="text-lg text-gray-700">
// // //                 Welcome back, <span className="font-bold text-purple-700">{userData.name}</span>!
// // //                 <span className="text-gray-500 ml-2">Ready to manage your pets?</span>
// // //               </p>
// // //             </div>
// // //           )}
// // //         </div>

// // //         <div className="grid lg:grid-cols-3 gap-8">
// // //           <div className="lg:col-span-2">
// // //             <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8 gap-4">
// // //               <h2 className="text-2xl font-bold text-gray-800">Your Pets</h2>
// // //               <Link href="/pet_name">
// // //                 <button className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full hover:from-purple-700 hover:to-blue-700 transform hover:scale-105 transition-all duration-200 shadow-lg font-medium">
// // //                   <span className="flex items-center gap-2">
// // //                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
// // //                       <path
// // //                         strokeLinecap="round"
// // //                         strokeLinejoin="round"
// // //                         strokeWidth={2}
// // //                         d="M12 6v6m0 0v6m0-6h6m-6 0H6"
// // //                       />
// // //                     </svg>
// // //                     Add a Pet
// // //                   </span>
// // //                 </button>
// // //               </Link>
// // //             </div>

// // //             <div className="space-y-6">
// // //               {pets.length === 0 ? (
// // //                 <div className="text-center py-16 bg-white/50 backdrop-blur-sm rounded-3xl border border-white/20">
// // //                   <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full flex items-center justify-center overflow-hidden shadow-md">
// // //                     <svg className="w-12 h-12 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
// // //                       <path
// // //                         strokeLinecap="round"
// // //                         strokeLinejoin="round"
// // //                         strokeWidth={1.5}
// // //                         d="M12 6v6m0 0v6m0-6h6m-6 0H6"
// // //                       />
// // //                     </svg>
// // //                   </div>
// // //                   <p className="text-gray-500 text-lg font-medium">No pets found</p>
// // //                   <p className="text-gray-400 text-sm mt-2">Add your first pet to get started!</p>
// // //                 </div>
// // //               ) : (
// // //                 pets.map((pet) => (
// // //                   <div
// // //                     key={pet.id}
// // //                     className="group bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl hover:bg-white/80 cursor-pointer transform hover:-translate-y-1 transition-all duration-300"
// // //                     onClick={handlePetCardClick}
// // //                     // Hidden data attributes
// // //                     data-id={pet.id}
// // //                     data-name={pet.name}
// // //                     data-type={pet.type}
// // //                     data-gender={pet.gender}
// // //                     data-description={pet.description}
// // //                     data-date={pet.date}
// // //                     data-address={pet.address}
// // //                     data-status={pet.status}
// // //                     data-image={pet.image}
// // //                   >
// // //                     <div className="flex items-center justify-between">
// // //                       <div className="flex items-center space-x-6">
// // //                         <div className="relative">
// // //                           <div className="w-28 h-28 md:w-32 md:h-32 bg-gradient-to-br from-purple-100 to-blue-100 rounded-2xl flex items-center justify-center overflow-hidden shadow-md">
// // //                             {pet.image ? (
// // //                               <img
// // //                                 src={getPetImageUrl(pet.image) || "/placeholder.svg"}
// // //                                 alt={pet.name}
// // //                                 className="w-full h-full object-cover"
// // //                                 onError={(e) => {
// // //                                   e.target.onerror = null
// // //                                   e.target.src = "https://via.placeholder.com/100"
// // //                                 }}
// // //                               />
// // //                             ) : (
// // //                               <span className="text-purple-400 text-sm font-medium">No Image</span>
// // //                             )}
// // //                           </div>
// // //                           <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full border-2 border-white shadow-sm"></div>
// // //                         </div>
// // //                         <div className="flex-1 min-w-0">
// // //                           <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-purple-700 transition-colors">
// // //                             {pet.name || "Unnamed Pet"}
// // //                           </h3>
// // //                           <div className="flex flex-wrap gap-2 text-sm">
// // //                             {pet.type && (
// // //                               <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full font-medium">
// // //                                 {pet.type}
// // //                               </span>
// // //                             )}
// // //                             <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">
// // //                               {pet.status || "Status not specified"}
// // //                             </span>
// // //                           </div>
// // //                         </div>
// // //                       </div>
// // //                       <div className="flex-shrink-0">
// // //                         <ChevronRight className="h-6 w-6 text-gray-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all duration-200" />
// // //                       </div>
// // //                     </div>
// // //                   </div>
// // //                 ))
// // //               )}
// // //             </div>
// // //           </div>

// // //           <div className="space-y-8">
// // //             <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
// // //               <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
// // //                 <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"></div>
// // //                 Quick Access
// // //               </h2>
// // //               <div className="space-y-3">
// // //                 <Link
// // //                   href="/conversations"
// // //                   className="group flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl hover:from-purple-100 hover:to-blue-100 transition-all duration-200 border border-purple-100"
// // //                 >
// // //                   <div className="flex items-center space-x-3">
// // //                     <div className="p-2 bg-white rounded-lg shadow-sm">
// // //                       <MessageSquare className="h-5 w-5 text-purple-600" />
// // //                     </div>
// // //                     <span className="font-medium text-gray-700 group-hover:text-purple-700">Messages</span>
// // //                   </div>
// // //                   <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all duration-200" />
// // //                 </Link>

// // //                 <Link
// // //                   href="/settings/account_information"
// // //                   className="group flex items-center justify-between p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl hover:from-emerald-100 hover:to-teal-100 transition-all duration-200 border border-emerald-100"
// // //                 >
// // //                   <div className="flex items-center space-x-3">
// // //                     <div className="p-2 bg-white rounded-lg shadow-sm">
// // //                       <User className="h-5 w-5 text-emerald-600" />
// // //                     </div>
// // //                     <span className="font-medium text-gray-700 group-hover:text-emerald-700">Account Settings</span>
// // //                   </div>
// // //                   <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all duration-200" />
// // //                 </Link>

// // //                 <Link
// // //                   href="/notifications"
// // //                   className="group flex items-center justify-between p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl hover:from-orange-100 hover:to-red-100 transition-all duration-200 border border-orange-100"
// // //                 >
// // //                   <div className="flex items-center space-x-3">
// // //                     <div className="p-2 bg-white rounded-lg shadow-sm">
// // //                       <svg className="h-5 w-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
// // //                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5z" />
// // //                         <path
// // //                           strokeLinecap="round"
// // //                           strokeLinejoin="round"
// // //                           strokeWidth={2}
// // //                           d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M9 11h.01"
// // //                         />
// // //                       </svg>
// // //                     </div>
// // //                     <span className="font-medium text-gray-700 group-hover:text-orange-700">Notifications</span>
// // //                   </div>
// // //                   <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-orange-600 group-hover:translate-x-1 transition-all duration-200" />
// // //                 </Link>

// // //                 <Link
// // //                   href="/help"
// // //                   className="group flex items-center justify-between p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl hover:from-indigo-100 hover:to-purple-100 transition-all duration-200 border border-indigo-100"
// // //                 >
// // //                   <div className="flex items-center space-x-3">
// // //                     <div className="p-2 bg-white rounded-lg shadow-sm">
// // //                       <svg className="h-5 w-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
// // //                         <path
// // //                           strokeLinecap="round"
// // //                           strokeLinejoin="round"
// // //                           strokeWidth={2}
// // //                           d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
// // //                         />
// // //                       </svg>
// // //                     </div>
// // //                     <span className="font-medium text-gray-700 group-hover:text-indigo-700">Help & Support</span>
// // //                   </div>
// // //                   <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all duration-200" />
// // //                 </Link>

// // //                 <Link
// // //                   href="/privacy"
// // //                   className="group flex items-center justify-between p-4 bg-gradient-to-r from-pink-50 to-rose-50 rounded-xl hover:from-pink-100 hover:to-rose-100 transition-all duration-200 border border-pink-100"
// // //                 >
// // //                   <div className="flex items-center space-x-3">
// // //                     <div className="p-2 bg-white rounded-lg shadow-sm">
// // //                       <svg className="h-5 w-5 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
// // //                         <path
// // //                           strokeLinecap="round"
// // //                           strokeLinejoin="round"
// // //                           strokeWidth={2}
// // //                           d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
// // //                         />
// // //                       </svg>
// // //                     </div>
// // //                     <span className="font-medium text-gray-700 group-hover:text-pink-700">Privacy Settings</span>
// // //                   </div>
// // //                   <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-pink-600 group-hover:translate-x-1 transition-all duration-200" />
// // //                 </Link>
// // //               </div>
// // //             </div>
// // //           </div>
// // //         </div>
// // //       </main>

// // //       <Footer />
// // //     </div>
// // //   )
// // // }



















// // // // //frontend\pages\pet_dashboard.js
// // // // "use client"

// // // // import { MessageSquare, User, ChevronRight } from "lucide-react"
// // // // import Link from "next/link"
// // // // import { useEffect, useState } from "react"
// // // // import { useRouter, useSearchParams } from "next/navigation"
// // // // import Navbar from "../components/Navbar"
// // // // import Footer from "../components/Footer"
// // // // import CryptoJS from "crypto-js"
// // // // import { fetchPetDashboard } from "../utils/api"

// // // // // Add these constants after the imports
// // // // const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://fkpimtcxncgwtdsfyrjb.supabase.co"
// // // // const PET_IMAGES_BUCKET = "pet-images"

// // // // const SECRET_KEY = "asdasdasd"

// // // // const encryptData = (data) => {
// // // //   return CryptoJS.AES.encrypt(JSON.stringify(data), SECRET_KEY).toString()
// // // // }

// // // // const decryptData = (encryptedData) => {
// // // //   const bytes = CryptoJS.AES.decrypt(encryptedData, SECRET_KEY)
// // // //   return JSON.parse(bytes.toString(CryptoJS.enc.Utf8))
// // // // }

// // // // const getPetImageUrl = (imageName) => {
// // // //   if (!imageName) return "https://via.placeholder.com/100"
// // // //   // Handle the format "1/main.jpg" -> "https://fkpimtcxncgwtdsfyrjb.supabase.co/storage/v1/object/public/pet-images/1/main.jpg"
// // // //   return `${SUPABASE_URL}/storage/v1/object/public/${PET_IMAGES_BUCKET}/${imageName}`
// // // // }

// // // // export default function Dashboard() {
// // // //   const router = useRouter()
// // // //   const searchParams = useSearchParams()
// // // //   const [isAuthenticated, setIsAuthenticated] = useState(false)
// // // //   const [userData, setUserData] = useState(null)
// // // //   const [isLoading, setIsLoading] = useState(true)
// // // //   const [pets, setPets] = useState([])

// // // //   const handlePetCardClick = (e) => {
// // // //     // Find the closest card element (in case children are clicked)
// // // //     const card = e.currentTarget

// // // //     // Get all the data attributes
// // // //     const petData = {
// // // //       id: card.dataset.id,
// // // //       name: card.dataset.name,
// // // //       type: card.dataset.type,
// // // //       gender: card.dataset.gender,
// // // //       description: card.dataset.description,
// // // //       date: card.dataset.date,
// // // //       address: card.dataset.address,
// // // //       status: card.dataset.status,
// // // //       image: card.dataset.image,
// // // //     }

// // // //     // Navigate to pet profile page with the ID
// // // //     router.push(`/pet_profile/${petData.id}`)
// // // //   }

// // // //   useEffect(() => {
// // // //     const authenticate = () => {
// // // //       try {
// // // //         const urlParams = new URLSearchParams(window.location.search)
// // // //         const token = urlParams.get("token") || searchParams.get("token")
// // // //         const userId = urlParams.get("user_id") || searchParams.get("user_id")
// // // //         const user = urlParams.get("user") || searchParams.get("user")
// // // //         const roles = urlParams.get("roles") || searchParams.get("roles")

// // // //         if (token && userId && user) {
// // // //           sessionStorage.setItem("auth_token", token)
// // // //           sessionStorage.setItem("user_id", userId)
// // // //           sessionStorage.setItem("user", user)
// // // //           sessionStorage.setItem("roles", roles ? encryptData(roles) : encryptData("user"))
// // // //           window.history.replaceState({}, "", window.location.pathname)
// // // //         }

// // // //         const storedToken = sessionStorage.getItem("auth_token")
// // // //         const storedUserData = sessionStorage.getItem("user")
// // // //         const storedUserId = sessionStorage.getItem("user_id")
// // // //         const encryptedRoles = sessionStorage.getItem("roles")

// // // //         if (!storedToken || !storedUserData || !storedUserId) {
// // // //           throw new Error("Missing authentication data")
// // // //         }

// // // //         const storedRoles = decryptData(encryptedRoles)
// // // //         if (storedRoles === "admin") {
// // // //           router.push("/admin_dashboard")
// // // //           return
// // // //         } else if (storedRoles === "user") {
// // // //           setIsAuthenticated(true)
// // // //           fetchPetDashboard(storedToken)
// // // //             .then((data) => {
// // // //               setUserData(data.user)
// // // //               setPets(data.pets || [])
// // // //             })
// // // //             .catch((error) => {
// // // //               console.error("Dashboard load failed:", error)
// // // //             })
// // // //         } else {
// // // //           throw new Error("Invalid role")
// // // //         }
// // // //       } catch (error) {
// // // //         console.error("Authentication error:", error)
// // // //         router.push("/login")
// // // //       } finally {
// // // //         setIsLoading(false)
// // // //       }
// // // //     }

// // // //     authenticate()
// // // //   }, [router, searchParams])

// // // //   if (isLoading) {
// // // //     return <div className="flex justify-center items-center h-screen">Loading...</div>
// // // //   }

// // // //   if (!isAuthenticated) {
// // // //     return null
// // // //   }

// // // //   return (
// // // //     <div className="min-h-screen bg-white">
// // // //       <Navbar />

// // // //       <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
// // // //         <h1 className="text-3xl font-bold text-[#1A237E] mb-8">Dashboard</h1>

// // // //         {userData && (
// // // //           <div className="mb-8">
// // // //             <p className="text-lg text-gray-700">
// // // //               Welcome back, <span className="font-semibold">{userData.name}</span>!
// // // //             </p>
// // // //           </div>
// // // //         )}

// // // //         <div className="grid md:grid-cols-3 gap-8">
// // // //           <div className="md:col-span-2">
// // // //             <div className="flex justify-between items-center mb-6">
// // // //               <h2 className="text-xl font-semibold text-[#1A237E]">Your Pets</h2>
// // // //               <Link href="/pet_name">
// // // //                 <button className="px-4 py-2 text-purple-700 border border-purple-700 rounded-full hover:bg-purple-50">
// // // //                   Add a Pet
// // // //                 </button>
// // // //               </Link>
// // // //             </div>

// // // //             {/* Pet Cards - Simplified Display */}
// // // //             <div className="space-y-4">
// // // //               {pets.length === 0 ? (
// // // //                 <div className="text-center py-8">
// // // //                   <p className="text-gray-500">No pets found</p>
// // // //                 </div>
// // // //               ) : (
// // // //                 pets.map((pet) => (
// // // //                   <div
// // // //                     key={pet.id}
// // // //                     className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md cursor-pointer"
// // // //                     onClick={handlePetCardClick}
// // // //                     // Hidden data attributes
// // // //                     data-id={pet.id}
// // // //                     data-name={pet.name}
// // // //                     data-type={pet.type}
// // // //                     data-gender={pet.gender}
// // // //                     data-description={pet.description}
// // // //                     data-date={pet.date}
// // // //                     data-address={pet.address}
// // // //                     data-status={pet.status}
// // // //                     data-image={pet.image}
// // // //                   >
// // // //                     <div className="flex items-center space-x-4">
// // // //                       <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
// // // //                         {pet.image ? (
// // // //                           <img
// // // //                             src={getPetImageUrl(pet.image) || "/placeholder.svg"}
// // // //                             alt={pet.name}
// // // //                             className="w-full h-full object-cover"
// // // //                             onError={(e) => {
// // // //                               e.target.onerror = null
// // // //                               e.target.src = "https://via.placeholder.com/100"
// // // //                             }}
// // // //                           />
// // // //                         ) : (
// // // //                           <span className="text-gray-400">No Image</span>
// // // //                         )}
// // // //                       </div>
// // // //                       <div>
// // // //                         <h3 className="font-semibold">{pet.name || "Unnamed Pet"}</h3>
// // // //                         <p className="text-sm text-gray-600">
// // // //                           {pet.type && <span>{pet.type} • </span>}
// // // //                           {pet.status || "Status not specified"}
// // // //                         </p>
// // // //                       </div>
// // // //                     </div>
// // // //                     <ChevronRight className="h-6 w-6 text-gray-400" />
// // // //                   </div>
// // // //                 ))
// // // //               )}
// // // //             </div>
// // // //           </div>

// // // //           {/* Sidebar - Kept simple */}
// // // //           <div className="space-y-8">
// // // //             <div>
// // // //               <h2 className="text-xl font-semibold text-[#1A237E] mb-4">Inbox</h2>
// // // //               <Link
// // // //                 href="/conversations"
// // // //                 className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md"
// // // //               >
// // // //                 <div className="flex items-center space-x-2">
// // // //                   <MessageSquare className="h-5 w-5 text-gray-600" />
// // // //                   <span>Messages</span>
// // // //                 </div>
// // // //                 <ChevronRight className="h-6 w-6 text-gray-400" />
// // // //               </Link>
// // // //             </div>

// // // //             <div>
// // // //               <h2 className="text-xl font-semibold text-[#1A237E] mb-4">Account</h2>
// // // //               <Link
// // // //                 href="/settings/account_information"
// // // //                 className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md"
// // // //               >
// // // //                 <div className="flex items-center space-x-2">
// // // //                   <User className="h-5 w-5 text-gray-600" />
// // // //                   <span>Profile</span>
// // // //                 </div>
// // // //                 <ChevronRight className="h-6 w-6 text-gray-400" />
// // // //               </Link>
// // // //             </div>
// // // //           </div>
// // // //         </div>
// // // //       </main>

// // // //       <Footer />
// // // //     </div>
// // // //   )
// // // // }
