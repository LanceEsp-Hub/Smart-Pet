




//frontend\pages\pet_dashboard.js
"use client"

import { MessageSquare, User, ChevronRight } from "lucide-react"
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
            })
            .catch((error) => {
              console.error("Dashboard load failed:", error)
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

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="text-3xl font-bold text-[#1A237E] mb-8">Dashboard</h1>

        {userData && (
          <div className="mb-8">
            <p className="text-lg text-gray-700">
              Welcome back, <span className="font-semibold">{userData.name}</span>!
            </p>
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-[#1A237E]">Your Pets</h2>
              <Link href="/pet_name">
                <button className="px-4 py-2 text-purple-700 border border-purple-700 rounded-full hover:bg-purple-50">
                  Add a Pet
                </button>
              </Link>
            </div>

            {/* Pet Cards - Simplified Display */}
            <div className="space-y-4">
              {pets.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No pets found</p>
                </div>
              ) : (
                pets.map((pet) => (
                  <div
                    key={pet.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md cursor-pointer"
                    onClick={handlePetCardClick}
                    // Hidden data attributes
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
                    <div className="flex items-center space-x-4">
                      <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                        {pet.image ? (
                          <img
                            src={getPetImageUrl(pet.image) || "/placeholder.svg"}
                            alt={pet.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.onerror = null
                              e.target.src = "https://via.placeholder.com/100"
                            }}
                          />
                        ) : (
                          <span className="text-gray-400">No Image</span>
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold">{pet.name || "Unnamed Pet"}</h3>
                        <p className="text-sm text-gray-600">
                          {pet.type && <span>{pet.type} • </span>}
                          {pet.status || "Status not specified"}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="h-6 w-6 text-gray-400" />
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Sidebar - Kept simple */}
          <div className="space-y-8">
            <div>
              <h2 className="text-xl font-semibold text-[#1A237E] mb-4">Inbox</h2>
              <Link
                href="/conversations"
                className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md"
              >
                <div className="flex items-center space-x-2">
                  <MessageSquare className="h-5 w-5 text-gray-600" />
                  <span>Messages</span>
                </div>
                <ChevronRight className="h-6 w-6 text-gray-400" />
              </Link>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-[#1A237E] mb-4">Account</h2>
              <Link
                href="/settings/account_information"
                className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md"
              >
                <div className="flex items-center space-x-2">
                  <User className="h-5 w-5 text-gray-600" />
                  <span>Profile</span>
                </div>
                <ChevronRight className="h-6 w-6 text-gray-400" />
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
