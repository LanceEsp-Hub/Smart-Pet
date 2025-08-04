
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/router"
import Link from "next/link"
import { Search, Heart, MapPin, Calendar, Phone, MessageCircle, X, Filter, Star, Award, Shield } from "lucide-react"
import Navbar from "../components/Navbar"
import Footer from "../components/Footer"
import toast from "react-hot-toast"
import { fetchRehomePets, checkAdoptionStatus, adoptPet } from "../utils/api"

export default function RehomePets() {
  const [pets, setPets] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedPet, setSelectedPet] = useState(null)
  const [canAdopt, setCanAdopt] = useState(false)
  const [currentUserId, setCurrentUserId] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")
  const [showFilters, setShowFilters] = useState(false)

  const [filters, setFilters] = useState({
    type: "all",
    gender: "all",
    location: "",
    good_with: "",
    energy_level: "",
  })
  const router = useRouter()

  useEffect(() => {
    if (typeof window !== "undefined") {
      setCurrentUserId(Number.parseInt(window.sessionStorage.getItem("user_id")))
    }
  }, [])

  // useEffect(() => {
  //   const fetchRehomePetsData = async () => {
  //     try {
  //       setLoading(true)
  //       const data = await fetchRehomePets(filters)
  //       setPets(data)
  //     } catch (error) {
  //       toast.error(error.message)
  //     } finally {
  //       setLoading(false)
  //     }
  //   }

  //   fetchRehomePetsData()
  // }, [filters])

  useEffect(() => {
  const fetchRehomePetsData = async () => {
    try {
      setLoading(true);
      console.log("Fetching with filters:", filters);
      const data = await fetchRehomePets(filters);
      console.log("Received data:", data);
      
      // Verify data structure
      if (data && data.length > 0) {
        console.log("First pet structure:", {
          id: data[0].id,
          image: data[0].image,
          health_info: data[0].health_info
        });
      }
      
      setPets(data || []); // Ensure we always set an array
    } catch (error) {
      console.error("Fetch error:", error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  fetchRehomePetsData();
}, [filters]);

  const handlePetClick = async (pet) => {
    setSelectedPet(pet)
    setActiveTab("overview")
    if (currentUserId) {
      try {
        const { can_adopt } = await checkAdoptionStatus(pet.id, currentUserId)
        setCanAdopt(can_adopt)
      } catch (error) {
        toast.error("Couldn't verify adoption status")
      }
    }
    setShowModal(true)
  }

  const handleAdopt = async () => {
    try {
      if (!currentUserId) {
        toast.error("Please log in to adopt a pet")
        router.push("/login")
        return
      }

      const result = await adoptPet(selectedPet.id, currentUserId)

      if (result.success) {
        toast.success("Adoption request submitted successfully!")
        const updatedPets = await fetchRehomePets(filters)
        setPets(updatedPets)
      } else {
        toast.error(result.message || "Adoption request failed")
      }

      setShowModal(false)
    } catch (error) {
      toast.error(error.message)
      console.error("Adoption error:", error)
    }
  }

  const handleFilterChange = (newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }))
  }

  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://fkpimtcxncgwtdsfyrjb.supabase.co"
  const PET_IMAGES_BUCKET = "pet-images"

const getImageUrl = (pet, filename = "main.jpg") => {
  if (!pet || !pet.id) return "/default-pet.jpg";
  
  // Handle cases where pet.image might be "1/main.jpg" or just the filename
  const imagePath = pet.image ? pet.image : `${pet.id}/${filename}`;
  
  return `${SUPABASE_URL}/storage/v1/object/public/${PET_IMAGES_BUCKET}/${imagePath}`;
}

  const tabs = [
    { id: "overview", label: "Overview", icon: Star },
    { id: "health", label: "Health", icon: Shield },
    { id: "details", label: "Details", icon: Award },
    { id: "contact", label: "Contact", icon: MessageCircle },
  ]

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-50 via-white to-pink-50">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
            Find Your Perfect Companion
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Give these loving pets a second chance at happiness. Every pet deserves a forever home.
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Find Your Match</h2>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
            >
              <Filter className="h-4 w-4" />
              Filters
            </button>

          </div>

          <div className={`${showFilters ? "block" : "hidden"} lg:block`}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Pet Type</label>
                <select
                  value={filters.type}
                  onChange={(e) => handleFilterChange({ type: e.target.value })}
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                >
                  <option value="">All Types</option>
                  <option value="dog">Dogs</option>
                  <option value="cat">Cats</option>
                  <option value="bird">Birds</option>
                  <option value="rabbit">Rabbits</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                <select
                  value={filters.gender}
                  onChange={(e) => handleFilterChange({ gender: e.target.value })}
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                >
                  <option value="">Any Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search location..."
                    value={filters.location}
                    onChange={(e) => handleFilterChange({ location: e.target.value })}
                    className="w-full p-3 pl-10 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  />
                  <Search className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Good With</label>
                <select
                  value={filters.good_with}
                  onChange={(e) => handleFilterChange({ good_with: e.target.value })}
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                >
                  <option value="">Any</option>
                  <option value="children">Children</option>
                  <option value="dogs">Dogs</option>
                  <option value="cats">Cats</option>
                  <option value="elderly">Elderly</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Energy Level</label>
                <select
                  value={filters.energy_level}
                  onChange={(e) => handleFilterChange({ energy_level: e.target.value })}
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                >
                  <option value="">Any</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() =>
                  handleFilterChange({
                    type: "",
                    gender: "",
                    location: "",
                    good_with: "",
                    energy_level: "",
                  })
                }
                className="text-sm text-purple-600 hover:text-purple-800 font-medium transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          </div>
        </div>

        {/* Pets Grid */}
        // {loading ? (
        //   <div className="flex justify-center items-center h-64">
        //     <div className="relative">
        //       <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200"></div>
        //       <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-600 border-t-transparent absolute top-0"></div>
        //     </div>
        //   </div>
        // ) : pets.length > 0 ? (
        //   <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        //     {pets.map((pet) => (
        //       <div
        //         key={pet.id}
        //         className="group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 cursor-pointer border border-gray-100"
        //         onClick={() => handlePetClick(pet)}
        //       >
        //         <div className="relative h-56 bg-gradient-to-br from-purple-100 to-pink-100 overflow-hidden">
        //           {pet.image ? (
        //             <img
        //               src={getImageUrl(pet) || "/placeholder.svg"}
        //               alt={pet.name}
        //               className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
        //               onError={(e) => {
        //                 e.target.onerror = null
        //                 e.target.src = "/default-pet.jpg"
        //               }}
        //             />
        //           ) : (
        //             <div className="flex items-center justify-center h-full">
        //               <img src="/default-pet.jpg" alt="Default pet" className="w-full h-full object-cover" />
        //             </div>
        //           )}

        //           <div className="absolute top-3 right-3">
        //             <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-white/90 text-purple-700 backdrop-blur-sm capitalize shadow-lg">
        //               {pet.type}
        //             </span>
        //           </div>

        //           {pet.additional_images?.length > 0 && (
        //             <div className="absolute bottom-3 right-3 bg-black/50 backdrop-blur-sm px-2 py-1 rounded-full text-xs text-white">
        //               +{pet.additional_images.length} photos
        //             </div>
        //           )}

        //           <div className="absolute top-3 left-3">
        //             <button className="p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-colors">
        //               <Heart className="h-4 w-4 text-gray-600 hover:text-red-500 transition-colors" />
        //             </button>
        //           </div>
        //         </div>

        //         <div className="p-6">
        //           <div className="flex justify-between items-start mb-3">
        //             <h3 className="text-xl font-bold text-gray-900 group-hover:text-purple-600 transition-colors">
        //               {pet.name}
        //             </h3>
        //           </div>

        //           <div className="flex items-center text-sm text-gray-500 mb-4">
        //             <span className="capitalize font-medium">{pet.gender}</span>
        //             <span className="mx-2">•</span>
        //             <MapPin className="h-4 w-4 mr-1" />
        //             <span>{pet.location}</span>
        //           </div>

        //           <div className="flex flex-wrap gap-2 mb-4">
        //             {pet.health_info?.vaccinated === "Yes" && (
        //               <span className="inline-flex items-center text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200">
        //                 ✓ Vaccinated
        //               </span>
        //             )}
        //             {pet.health_info?.spayed_neutered === "Yes" && (
        //               <span className="inline-flex items-center text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200">
        //                 ✓ Fixed
        //               </span>
        //             )}
        //             {pet.health_info?.energy_level && (
        //               <span className="inline-flex items-center text-xs font-medium text-blue-700 bg-blue-50 px-2 py-1 rounded-lg border border-blue-200">
        //                 {pet.health_info.energy_level} energy
        //               </span>
        //             )}
        //           </div>

        //           <div className="flex flex-wrap gap-1">
        //             {pet.health_info?.good_with?.children && (
        //               <span className="inline-flex items-center text-xs font-medium text-purple-700 bg-purple-50 px-2 py-1 rounded-lg border border-purple-200">
        //                 ✓ Kids
        //               </span>
        //             )}
        //             {pet.health_info?.good_with?.dogs && (
        //               <span className="inline-flex items-center text-xs font-medium text-purple-700 bg-purple-50 px-2 py-1 rounded-lg border border-purple-200">
        //                 ✓ Dogs
        //               </span>
        //             )}
        //             {pet.health_info?.good_with?.cats && (
        //               <span className="inline-flex items-center text-xs font-medium text-purple-700 bg-purple-50 px-2 py-1 rounded-lg border border-purple-200">
        //                 ✓ Cats
        //               </span>
        //             )}
        //           </div>
        //         </div>
        //       </div>
        //     ))}
        //   </div>
        // ) : (
        //   <div className="text-center py-16">
        //     <div className="max-w-md mx-auto">
        //       <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
        //         <Search className="h-12 w-12 text-purple-400" />
        //       </div>
        //       <h3 className="text-2xl font-bold text-gray-900 mb-2">No pets found</h3>
        //       <p className="text-gray-500 mb-6">Try adjusting your search or filter criteria to find more pets</p>
        //       <button
        //         onClick={() =>
        //           handleFilterChange({
        //             type: "",
        //             gender: "",
        //             location: "",
        //             good_with: "",
        //             energy_level: "",
        //           })
        //         }
        //         className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all font-medium"
        //       >
        //         Reset All Filters
        //       </button>
        //     </div>
        //   </div>
        // )}
{!loading && pets.length > 0 ? (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
    {pets.map((pet) => {
      // Debug individual pet
      console.log(`Rendering pet ${pet.id}`, {
        name: pet.name,
        image: pet.image,
        health: pet.health_info
      });

      return (
        <div
          key={pet.id}
          className="group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 cursor-pointer border border-gray-100"
          onClick={() => handlePetClick(pet)}
        >
          {/* Image Section */}
          <div className="relative h-56 bg-gradient-to-br from-purple-100 to-pink-100 overflow-hidden">
            <img
              src={getImageUrl(pet)}
              alt={pet.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "/default-pet.jpg";
                console.warn(`Failed to load image for pet ${pet.id}`);
              }}
            />

            {/* Type Badge */}
            <div className="absolute top-3 right-3">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-white/90 text-purple-700 backdrop-blur-sm capitalize shadow-lg">
                {pet.type}
              </span>
            </div>

            {/* Additional Images Badge */}
            {pet.additional_images?.length > 0 && (
              <div className="absolute bottom-3 right-3 bg-black/50 backdrop-blur-sm px-2 py-1 rounded-full text-xs text-white">
                +{pet.additional_images.length} photos
              </div>
            )}
          </div>

          {/* Info Section */}
          <div className="p-6">
            <h3 className="text-xl font-bold text-gray-900 group-hover:text-purple-600 transition-colors mb-3">
              {pet.name}
            </h3>

            <div className="flex items-center text-sm text-gray-500 mb-4">
              <span className="capitalize font-medium">{pet.gender}</span>
              <span className="mx-2">•</span>
              <MapPin className="h-4 w-4 mr-1" />
              <span>{pet.location}</span>
            </div>

            {/* Health Info Section */}
            {pet.health_info && (
              <>
                <div className="flex flex-wrap gap-2 mb-4">
                  {pet.health_info.vaccinated === "Yes" && (
                    <span className="inline-flex items-center text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200">
                      ✓ Vaccinated
                    </span>
                  )}
                  {pet.health_info.spayed_neutered === "Yes" && (
                    <span className="inline-flex items-center text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200">
                      ✓ Fixed
                    </span>
                  )}
                  {pet.health_info.energy_level && (
                    <span className="inline-flex items-center text-xs font-medium text-blue-700 bg-blue-50 px-2 py-1 rounded-lg border border-blue-200">
                      {pet.health_info.energy_level} energy
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap gap-1">
                  {pet.health_info.good_with?.children && (
                    <span className="inline-flex items-center text-xs font-medium text-purple-700 bg-purple-50 px-2 py-1 rounded-lg border border-purple-200">
                      ✓ Kids
                    </span>
                  )}
                  {pet.health_info.good_with?.dogs && (
                    <span className="inline-flex items-center text-xs font-medium text-purple-700 bg-purple-50 px-2 py-1 rounded-lg border border-purple-200">
                      ✓ Dogs
                    </span>
                  )}
                  {pet.health_info.good_with?.cats && (
                    <span className="inline-flex items-center text-xs font-medium text-purple-700 bg-purple-50 px-2 py-1 rounded-lg border border-purple-200">
                      ✓ Cats
                    </span>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      );
    })}
  </div>
) : !loading && pets.length === 0 ? (
  <div className="text-center py-16">
    <div className="max-w-md mx-auto">
      <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <Search className="h-12 w-12 text-purple-400" />
      </div>
      <h3 className="text-2xl font-bold text-gray-900 mb-2">No pets found</h3>
      <p className="text-gray-500 mb-6">Try adjusting your search criteria</p>
    </div>
  </div>
) : (
  <div className="flex justify-center items-center h-64">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
  </div>
)}

        {/* Enhanced Modal with Tabs */}
        {showModal && selectedPet && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 text-white">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-3xl font-bold mb-2">{selectedPet.name}</h2>
                    <div className="flex items-center gap-4 text-purple-100">
                      <span className="capitalize">
                        {selectedPet.type} • {selectedPet.gender}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {selectedPet.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(selectedPet.date).toLocaleDateString()}
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
                {activeTab === "overview" && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div>
                      <div className="h-80 bg-gray-100 rounded-2xl overflow-hidden mb-6">
                        {selectedPet.image ? (
                          <img
                            src={getImageUrl(selectedPet) || "/placeholder.svg"}
                            alt={selectedPet.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.onerror = null
                              e.target.src = "/default-pet.jpg"
                            }}
                          />
                        ) : (
                          <img src="/default-pet.jpg" alt="Default pet" className="w-full h-full object-cover" />
                        )}
                      </div>

                      {selectedPet.additional_images?.length > 0 && (
                        <div>
                          <h3 className="font-semibold mb-3">More Photos</h3>
                          <div className="grid grid-cols-4 gap-3">
                            {selectedPet.additional_images.map((img, index) => (
                              <div key={index} className="h-20 bg-gray-100 rounded-lg overflow-hidden">
                                <img
                                  src={getImageUrl(selectedPet, img) || "/placeholder.svg"}
                                  alt={`${selectedPet.name} ${index + 1}`}
                                  className="w-full h-full object-cover hover:scale-110 transition-transform cursor-pointer"
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="text-black space-y-6">
                      {selectedPet.description && (
                        <div>
                          <h3 className="text-lg font-semibold mb-3">About {selectedPet.name}</h3>
                          <p className="text-gray-700 leading-relaxed">{selectedPet.description}</p>
                        </div>
                      )}

                      {selectedPet.health_info?.reason_for_adoption && (
                        <div>
                          <h3 className="text-lg font-semibold mb-3">Why I Need a New Home</h3>
                          <p className="text-gray-700 leading-relaxed">{selectedPet.health_info.reason_for_adoption}</p>
                        </div>
                      )}

                      <div>
                        <h3 className="text-lg font-semibold mb-3">Quick Facts</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-purple-50 p-4 rounded-xl">
                            <p className="text-sm text-purple-600 font-medium">Type</p>
                            <p className="text-gray-900 capitalize font-semibold">{selectedPet.type}</p>
                          </div>
                          <div className="bg-pink-50 p-4 rounded-xl">
                            <p className="text-sm text-pink-600 font-medium">Gender</p>
                            <p className="text-gray-900 capitalize font-semibold">{selectedPet.gender}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "health" && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-200">
                        <h3 className="text-lg font-semibold text-emerald-800 mb-4">Medical Status</h3>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-emerald-700">Vaccinated</span>
                            <span
                              className={`font-semibold ${selectedPet.health_info?.vaccinated === "Yes" ? "text-emerald-600" : "text-gray-500"}`}
                            >
                              {selectedPet.health_info?.vaccinated || "Unknown"}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-emerald-700">Spayed/Neutered</span>
                            <span
                              className={`font-semibold ${selectedPet.health_info?.spayed_neutered === "Yes" ? "text-emerald-600" : "text-gray-500"}`}
                            >
                              {selectedPet.health_info?.spayed_neutered || "Unknown"}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-blue-50 p-6 rounded-2xl border border-blue-200">
                        <h3 className="text-lg font-semibold text-blue-800 mb-4">Energy & Personality</h3>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-blue-700">Energy Level</span>
                            <span className="font-semibold text-blue-600 capitalize">
                              {selectedPet.health_info?.energy_level || "Not specified"}
                            </span>
                          </div>
                          {selectedPet.health_info?.temperament_personality && (
                            <div>
                              <span className="text-blue-700 block mb-2">Personality</span>
                              <p className="text-blue-800 text-sm">{selectedPet.health_info.temperament_personality}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="bg-purple-50 p-6 rounded-2xl border border-purple-200">
                      <h3 className="text-lg font-semibold text-purple-800 mb-4">Good With</h3>
                      <div className="flex flex-wrap gap-3">
                        {selectedPet.health_info?.good_with?.children && (
                          <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-purple-100 text-purple-800 border border-purple-300">
                            ✓ Children
                          </span>
                        )}
                        {selectedPet.health_info?.good_with?.dogs && (
                          <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-purple-100 text-purple-800 border border-purple-300">
                            ✓ Dogs
                          </span>
                        )}
                        {selectedPet.health_info?.good_with?.cats && (
                          <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-purple-100 text-purple-800 border border-purple-300">
                            ✓ Cats
                          </span>
                        )}
                        {selectedPet.health_info?.good_with?.elderly && (
                          <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-purple-100 text-purple-800 border border-purple-300">
                            ✓ Elderly
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "details" && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="bg-gray-50 p-6 rounded-2xl">
                        <h4 className="font-semibold text-gray-800 mb-2">Pet Type</h4>
                        <p className="text-gray-600 capitalize">{selectedPet.type}</p>
                      </div>
                      <div className="bg-gray-50 p-6 rounded-2xl">
                        <h4 className="font-semibold text-gray-800 mb-2">Gender</h4>
                        <p className="text-gray-600 capitalize">{selectedPet.gender}</p>
                      </div>
                      <div className="bg-gray-50 p-6 rounded-2xl">
                        <h4 className="font-semibold text-gray-800 mb-2">Location</h4>
                        <p className="text-gray-600">{selectedPet.location}</p>
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-2xl border border-purple-200">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">Listing Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Date Posted</p>
                          <p className="font-semibold text-gray-800">
                            {new Date(selectedPet.date).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Pet ID</p>
                          <p className="font-semibold text-gray-800">#{selectedPet.id}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "contact" && (
                  <div className="space-y-6">
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-2xl border border-purple-200">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">Pet Owner</h3>
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold text-xl">
                          {selectedPet.owner_info?.name?.charAt(0) || "U"}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800 text-lg">
                            {selectedPet.owner_info?.name || "Pet Owner"}
                          </p>
                          {selectedPet.owner_info?.phone && (
                            <p className="text-gray-600">{selectedPet.owner_info.phone}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">


                      {selectedPet.user_id && (
                        <Link
                          href={`/messages/${selectedPet.user_id}`}
                          className="flex items-center justify-center gap-3 bg-blue-600 text-white px-6 py-4 rounded-xl hover:bg-blue-700 transition-colors font-medium"
                        >
                          <MessageCircle className="h-5 w-5" />
                          Send Message
                        </Link>
                      )}
                    </div>

                    <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl">
                      <p className="text-amber-800 text-sm">
                        <strong>Safety Tip:</strong> Always meet in a public place and bring a friend when meeting a pet
                        for the first time.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                <div className="flex gap-3 justify-end">
                  {canAdopt ? (
                    <button
                      onClick={handleAdopt}
                      className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all font-medium shadow-lg"
                    >
                      Submit Adoption Request
                    </button>
                  ) : (
                    <div className="text-sm text-amber-700 bg-amber-50 px-4 py-3 rounded-xl border border-amber-200">
                      {currentUserId
                        ? "You need an approved application to adopt this pet"
                        : "Please log in to adopt this pet"}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}




































// "use client"

// import { useState, useEffect } from "react"
// import { useRouter } from "next/router"
// import Link from "next/link"
// import { Search, Heart, MapPin, Calendar, Phone, MessageCircle, X, Filter, Star, Award, Shield } from "lucide-react"
// import Navbar from "../components/Navbar"
// import Footer from "../components/Footer"
// import toast from "react-hot-toast"
// import { fetchRehomePets, checkAdoptionStatus, adoptPet } from "../utils/api"

// export default function RehomePets() {
//   const [pets, setPets] = useState([])
//   const [loading, setLoading] = useState(true)
//   const [selectedPet, setSelectedPet] = useState(null)
//   const [canAdopt, setCanAdopt] = useState(false)
//   const [currentUserId, setCurrentUserId] = useState(null)
//   const [showModal, setShowModal] = useState(false)
//   const [activeTab, setActiveTab] = useState("overview")
//   const [showFilters, setShowFilters] = useState(false)

//   const [filters, setFilters] = useState({
//     type: "all",
//     gender: "all",
//     location: "",
//     good_with: "",
//     energy_level: "",
//   })
//   const router = useRouter()

//   useEffect(() => {
//     if (typeof window !== "undefined") {
//       setCurrentUserId(Number.parseInt(window.sessionStorage.getItem("user_id")))
//     }
//   }, [])

//   // useEffect(() => {
//   //   const fetchRehomePetsData = async () => {
//   //     try {
//   //       setLoading(true)
//   //       const data = await fetchRehomePets(filters)
//   //       setPets(data)
//   //     } catch (error) {
//   //       toast.error(error.message)
//   //     } finally {
//   //       setLoading(false)
//   //     }
//   //   }

//   //   fetchRehomePetsData()
//   // }, [filters])

//     useEffect(() => {
//     const fetchRehomePetsData = async () => {
//       try {
//         setLoading(true)
//         console.log("Fetching rehome pets with filters:", filters)
//         const data = await fetchRehomePets(filters)
//         console.log("Received pets data:", data)
//         setPets(data)
//       } catch (error) {
//         console.error("Error fetching rehome pets:", error)
//         toast.error(error.message)
//       } finally {
//         setLoading(false)
//       }
//     }

//     fetchRehomePetsData()
//   }, [filters])

//   const handlePetClick = async (pet) => {
//     setSelectedPet(pet)
//     setActiveTab("overview")
//     if (currentUserId) {
//       try {
//         const { can_adopt } = await checkAdoptionStatus(pet.id, currentUserId)
//         setCanAdopt(can_adopt)
//       } catch (error) {
//         toast.error("Couldn't verify adoption status")
//       }
//     }
//     setShowModal(true)
//   }

//   const handleAdopt = async () => {
//     try {
//       if (!currentUserId) {
//         toast.error("Please log in to adopt a pet")
//         router.push("/login")
//         return
//       }

//       const result = await adoptPet(selectedPet.id, currentUserId)

//       if (result.success) {
//         toast.success("Adoption request submitted successfully!")
//         const updatedPets = await fetchRehomePets(filters)
//         setPets(updatedPets)
//       } else {
//         toast.error(result.message || "Adoption request failed")
//       }

//       setShowModal(false)
//     } catch (error) {
//       toast.error(error.message)
//       console.error("Adoption error:", error)
//     }
//   }

//   const handleFilterChange = (newFilters) => {
//     setFilters((prev) => ({ ...prev, ...newFilters }))
//   }

//   const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://fkpimtcxncgwtdsfyrjb.supabase.co"
//   const PET_IMAGES_BUCKET = "pet-images"

//   const getImageUrl = (pet, filename = "main.jpg") => {
//     if (!pet || !pet.id) return "https://via.placeholder.com/100"
//     // Handle the format "1/main.jpg" -> "https://fkpimtcxncgwtdsfyrjb.supabase.co/storage/v1/object/public/pet-images/1/main.jpg"
//     const imagePath = `${pet.id}/${filename}`
//     return `${SUPABASE_URL}/storage/v1/object/public/${PET_IMAGES_BUCKET}/${imagePath}`
//   }


//   const tabs = [
//     { id: "overview", label: "Overview", icon: Star },
//     { id: "health", label: "Health", icon: Shield },
//     { id: "details", label: "Details", icon: Award },
//     { id: "contact", label: "Contact", icon: MessageCircle },
//   ]

//   return (
//     <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-50 via-white to-pink-50">
//       <Navbar />

//       <main className="flex-1 container mx-auto px-4 py-8">
//         {/* Hero Section */}
//         <div className="text-center mb-12">
//           <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
//             Find Your Perfect Companion
//           </h1>
//           <p className="text-xl text-gray-600 max-w-2xl mx-auto">
//             Give these loving pets a second chance at happiness. Every pet deserves a forever home.
//           </p>
//         </div>

//         {/* Filters */}
//         <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 mb-8">
//           <div className="flex items-center justify-between mb-4">
//             <h2 className="text-lg font-semibold text-gray-800">Find Your Match</h2>
//             <button
//               onClick={() => setShowFilters(!showFilters)}
//               className="lg:hidden flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
//             >
//               <Filter className="h-4 w-4" />
//               Filters
//             </button>
//           </div>

//           <div className={`${showFilters ? "block" : "hidden"} lg:block`}>
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">Pet Type</label>
//                 <select
//                   value={filters.type}
//                   onChange={(e) => handleFilterChange({ type: e.target.value })}
//                   className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
//                 >
//                   <option value="">All Types</option>
//                   <option value="dog">Dogs</option>
//                   <option value="cat">Cats</option>
//                   <option value="bird">Birds</option>
//                   <option value="rabbit">Rabbits</option>
//                   <option value="other">Other</option>
//                 </select>
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
//                 <select
//                   value={filters.gender}
//                   onChange={(e) => handleFilterChange({ gender: e.target.value })}
//                   className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
//                 >
//                   <option value="">Any Gender</option>
//                   <option value="male">Male</option>
//                   <option value="female">Female</option>
//                 </select>
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
//                 <div className="relative">
//                   <input
//                     type="text"
//                     placeholder="Search location..."
//                     value={filters.location}
//                     onChange={(e) => handleFilterChange({ location: e.target.value })}
//                     className="w-full p-3 pl-10 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
//                   />
//                   <Search className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
//                 </div>
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">Good With</label>
//                 <select
//                   value={filters.good_with}
//                   onChange={(e) => handleFilterChange({ good_with: e.target.value })}
//                   className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
//                 >
//                   <option value="">Any</option>
//                   <option value="children">Children</option>
//                   <option value="dogs">Dogs</option>
//                   <option value="cats">Cats</option>
//                   <option value="elderly">Elderly</option>
//                 </select>
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">Energy Level</label>
//                 <select
//                   value={filters.energy_level}
//                   onChange={(e) => handleFilterChange({ energy_level: e.target.value })}
//                   className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
//                 >
//                   <option value="">Any</option>
//                   <option value="low">Low</option>
//                   <option value="medium">Medium</option>
//                   <option value="high">High</option>
//                 </select>
//               </div>
//             </div>

//             <div className="mt-6 flex justify-end">
//               <button
//                 onClick={() =>
//                   handleFilterChange({
//                     type: "",
//                     gender: "",
//                     location: "",
//                     good_with: "",
//                     energy_level: "",
//                   })
//                 }
//                 className="text-sm text-purple-600 hover:text-purple-800 font-medium transition-colors"
//               >
//                 Clear All Filters
//               </button>
//             </div>
//           </div>
//         </div>

//         {/* Pets Grid */}
//         {loading ? (
//           <div className="flex justify-center items-center h-64">
//             <div className="relative">
//               <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200"></div>
//               <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-600 border-t-transparent absolute top-0"></div>
//             </div>
//           </div>
//         ) : pets.length > 0 ? (
//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
//             {console.log("Rendering pets:", pets)}
//             {pets.map((pet) => (
//               <div
//                 key={pet.id}
//                 className="group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 cursor-pointer border border-gray-100"
//                 onClick={() => handlePetClick(pet)}
//               >
//                 <div className="relative h-56 bg-gradient-to-br from-purple-100 to-pink-100 overflow-hidden">
//                   {pet.image ? (
//                     <img
//                       src={getImageUrl(pet) || "/placeholder.svg"}
//                       alt={pet.name}
//                       className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
//                       onError={(e) => {
//                         e.target.onerror = null
//                         e.target.src = "/default-pet.jpg"
//                       }}
//                     />
//                   ) : (
//                     <div className="flex items-center justify-center h-full">
//                       <img src="/default-pet.jpg" alt="Default pet" className="w-full h-full object-cover" />
//                     </div>
//                   )}

//                   <div className="absolute top-3 right-3">
//                     <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-white/90 text-purple-700 backdrop-blur-sm capitalize shadow-lg">
//                       {pet.type}
//                     </span>
//                   </div>

//                   {pet.additional_images?.length > 0 && (
//                     <div className="absolute bottom-3 right-3 bg-black/50 backdrop-blur-sm px-2 py-1 rounded-full text-xs text-white">
//                       +{pet.additional_images.length} photos
//                     </div>
//                   )}

//                   <div className="absolute top-3 left-3">
//                     <button className="p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-colors">
//                       <Heart className="h-4 w-4 text-gray-600 hover:text-red-500 transition-colors" />
//                     </button>
//                   </div>
//                 </div>

//                 <div className="p-6">
//                   <div className="flex justify-between items-start mb-3">
//                     <h3 className="text-xl font-bold text-gray-900 group-hover:text-purple-600 transition-colors">
//                       {pet.name}
//                     </h3>
//                   </div>

//                   <div className="flex items-center text-sm text-gray-500 mb-4">
//                     <span className="capitalize font-medium">{pet.gender}</span>
//                     <span className="mx-2">•</span>
//                     <MapPin className="h-4 w-4 mr-1" />
//                     <span>{pet.location}</span>
//                   </div>

//                   <div className="flex flex-wrap gap-2 mb-4">
//                     {pet.health_info?.vaccinated === "Yes" && (
//                       <span className="inline-flex items-center text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200">
//                         ✓ Vaccinated
//                       </span>
//                     )}
//                     {pet.health_info?.spayed_neutered === "Yes" && (
//                       <span className="inline-flex items-center text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200">
//                         ✓ Fixed
//                       </span>
//                     )}
//                     {pet.health_info?.energy_level && (
//                       <span className="inline-flex items-center text-xs font-medium text-blue-700 bg-blue-50 px-2 py-1 rounded-lg border border-blue-200">
//                         {pet.health_info.energy_level} energy
//                       </span>
//                     )}
//                   </div>

//                   <div className="flex flex-wrap gap-1">
//                     {pet.health_info?.good_with?.children && (
//                       <span className="inline-flex items-center text-xs font-medium text-purple-700 bg-purple-50 px-2 py-1 rounded-lg border border-purple-200">
//                         ✓ Kids
//                       </span>
//                     )}
//                     {pet.health_info?.good_with?.dogs && (
//                       <span className="inline-flex items-center text-xs font-medium text-purple-700 bg-purple-50 px-2 py-1 rounded-lg border border-purple-200">
//                         ✓ Dogs
//                       </span>
//                     )}
//                     {pet.health_info?.good_with?.cats && (
//                       <span className="inline-flex items-center text-xs font-medium text-purple-700 bg-purple-50 px-2 py-1 rounded-lg border border-purple-200">
//                         ✓ Cats
//                       </span>
//                     )}
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         ) : (
//           <div className="text-center py-16">
//             <div className="max-w-md mx-auto">
//               <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
//                 <Search className="h-12 w-12 text-purple-400" />
//               </div>
//               <h3 className="text-2xl font-bold text-gray-900 mb-2">No pets found</h3>
//               <p className="text-gray-500 mb-6">Try adjusting your search or filter criteria to find more pets</p>
//               <button
//                 onClick={() =>
//                   handleFilterChange({
//                     type: "",
//                     gender: "",
//                     location: "",
//                     good_with: "",
//                     energy_level: "",
//                   })
//                 }
//                 className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all font-medium"
//               >
//                 Reset All Filters
//               </button>
//             </div>
//           </div>
//         )}

//         {/* Enhanced Modal with Tabs */}
//         {showModal && selectedPet && (
//           <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
//             <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
//               {/* Modal Header */}
//               <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 text-white">
//                 <div className="flex justify-between items-start">
//                   <div>
//                     <h2 className="text-3xl font-bold mb-2">{selectedPet.name}</h2>
//                     <div className="flex items-center gap-4 text-purple-100">
//                       <span className="capitalize">
//                         {selectedPet.type} • {selectedPet.gender}
//                       </span>
//                       <span className="flex items-center gap-1">
//                         <MapPin className="h-4 w-4" />
//                         {selectedPet.location}
//                       </span>
//                       <span className="flex items-center gap-1">
//                         <Calendar className="h-4 w-4" />
//                         {new Date(selectedPet.date).toLocaleDateString()}
//                       </span>
//                     </div>
//                   </div>
//                   <button
//                     onClick={() => setShowModal(false)}
//                     className="p-2 hover:bg-white/20 rounded-full transition-colors"
//                   >
//                     <X className="h-6 w-6" />
//                   </button>
//                 </div>
//               </div>

//               {/* Tabs */}
//               <div className="border-b border-gray-200 bg-gray-50">
//                 <div className="flex overflow-x-auto">
//                   {tabs.map((tab) => {
//                     const Icon = tab.icon
//                     return (
//                       <button
//                         key={tab.id}
//                         onClick={() => setActiveTab(tab.id)}
//                         className={`flex items-center gap-2 px-6 py-4 font-medium text-sm whitespace-nowrap transition-colors ${
//                           activeTab === tab.id
//                             ? "text-purple-600 border-b-2 border-purple-600 bg-white"
//                             : "text-gray-500 hover:text-gray-700"
//                         }`}
//                       >
//                         <Icon className="h-4 w-4" />
//                         {tab.label}
//                       </button>
//                     )
//                   })}
//                 </div>
//               </div>

//               {/* Tab Content */}
//               <div className="p-6 overflow-y-auto max-h-[60vh]">
//                 {activeTab === "overview" && (
//                   <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
//                     <div>
//                       <div className="h-80 bg-gray-100 rounded-2xl overflow-hidden mb-6">
//                         {selectedPet.image ? (
//                           <img
//                             src={getImageUrl(selectedPet) || "/placeholder.svg"}
//                             alt={selectedPet.name}
//                             className="w-full h-full object-cover"
//                             onError={(e) => {
//                               e.target.onerror = null
//                               e.target.src = "/default-pet.jpg"
//                             }}
//                           />
//                         ) : (
//                           <img src="/default-pet.jpg" alt="Default pet" className="w-full h-full object-cover" />
//                         )}
//                       </div>

//                       {selectedPet.additional_images?.length > 0 && (
//                         <div>
//                           <h3 className="font-semibold mb-3">More Photos</h3>
//                           <div className="grid grid-cols-4 gap-3">
//                             {selectedPet.additional_images.map((img, index) => (
//                               <div key={index} className="h-20 bg-gray-100 rounded-lg overflow-hidden">
//                                 <img
//                                   src={getImageUrl(selectedPet, img) || "/placeholder.svg"}
//                                   alt={`${selectedPet.name} ${index + 1}`}
//                                   className="w-full h-full object-cover hover:scale-110 transition-transform cursor-pointer"
//                                 />
//                               </div>
//                             ))}
//                           </div>
//                         </div>
//                       )}
//                     </div>

//                     <div className="space-y-6">
//                       {selectedPet.description && (
//                         <div>
//                           <h3 className="text-lg font-semibold mb-3">About {selectedPet.name}</h3>
//                           <p className="text-gray-700 leading-relaxed">{selectedPet.description}</p>
//                         </div>
//                       )}

//                       {selectedPet.health_info?.reason_for_adoption && (
//                         <div>
//                           <h3 className="text-lg font-semibold mb-3">Why I Need a New Home</h3>
//                           <p className="text-gray-700 leading-relaxed">{selectedPet.health_info.reason_for_adoption}</p>
//                         </div>
//                       )}

//                       <div>
//                         <h3 className="text-lg font-semibold mb-3">Quick Facts</h3>
//                         <div className="grid grid-cols-2 gap-4">
//                           <div className="bg-purple-50 p-4 rounded-xl">
//                             <p className="text-sm text-purple-600 font-medium">Type</p>
//                             <p className="text-gray-900 capitalize font-semibold">{selectedPet.type}</p>
//                           </div>
//                           <div className="bg-pink-50 p-4 rounded-xl">
//                             <p className="text-sm text-pink-600 font-medium">Gender</p>
//                             <p className="text-gray-900 capitalize font-semibold">{selectedPet.gender}</p>
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 )}

//                 {activeTab === "health" && (
//                   <div className="space-y-6">
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                       <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-200">
//                         <h3 className="text-lg font-semibold text-emerald-800 mb-4">Medical Status</h3>
//                         <div className="space-y-3">
//                           <div className="flex justify-between">
//                             <span className="text-emerald-700">Vaccinated</span>
//                             <span
//                               className={`font-semibold ${selectedPet.health_info?.vaccinated === "Yes" ? "text-emerald-600" : "text-gray-500"}`}
//                             >
//                               {selectedPet.health_info?.vaccinated || "Unknown"}
//                             </span>
//                           </div>
//                           <div className="flex justify-between">
//                             <span className="text-emerald-700">Spayed/Neutered</span>
//                             <span
//                               className={`font-semibold ${selectedPet.health_info?.spayed_neutered === "Yes" ? "text-emerald-600" : "text-gray-500"}`}
//                             >
//                               {selectedPet.health_info?.spayed_neutered || "Unknown"}
//                             </span>
//                           </div>
//                         </div>
//                       </div>

//                       <div className="bg-blue-50 p-6 rounded-2xl border border-blue-200">
//                         <h3 className="text-lg font-semibold text-blue-800 mb-4">Energy & Personality</h3>
//                         <div className="space-y-3">
//                           <div className="flex justify-between">
//                             <span className="text-blue-700">Energy Level</span>
//                             <span className="font-semibold text-blue-600 capitalize">
//                               {selectedPet.health_info?.energy_level || "Not specified"}
//                             </span>
//                           </div>
//                           {selectedPet.health_info?.temperament_personality && (
//                             <div>
//                               <span className="text-blue-700 block mb-2">Personality</span>
//                               <p className="text-blue-800 text-sm">{selectedPet.health_info.temperament_personality}</p>
//                             </div>
//                           )}
//                         </div>
//                       </div>
//                     </div>

//                     <div className="bg-purple-50 p-6 rounded-2xl border border-purple-200">
//                       <h3 className="text-lg font-semibold text-purple-800 mb-4">Good With</h3>
//                       <div className="flex flex-wrap gap-3">
//                         {selectedPet.health_info?.good_with?.children && (
//                           <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-purple-100 text-purple-800 border border-purple-300">
//                             ✓ Children
//                           </span>
//                         )}
//                         {selectedPet.health_info?.good_with?.dogs && (
//                           <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-purple-100 text-purple-800 border border-purple-300">
//                             ✓ Dogs
//                           </span>
//                         )}
//                         {selectedPet.health_info?.good_with?.cats && (
//                           <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-purple-100 text-purple-800 border border-purple-300">
//                             ✓ Cats
//                           </span>
//                         )}
//                         {selectedPet.health_info?.good_with?.elderly && (
//                           <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-purple-100 text-purple-800 border border-purple-300">
//                             ✓ Elderly
//                           </span>
//                         )}
//                       </div>
//                     </div>
//                   </div>
//                 )}

//                 {activeTab === "details" && (
//                   <div className="space-y-6">
//                     <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//                       <div className="bg-gray-50 p-6 rounded-2xl">
//                         <h4 className="font-semibold text-gray-800 mb-2">Pet Type</h4>
//                         <p className="text-gray-600 capitalize">{selectedPet.type}</p>
//                       </div>
//                       <div className="bg-gray-50 p-6 rounded-2xl">
//                         <h4 className="font-semibold text-gray-800 mb-2">Gender</h4>
//                         <p className="text-gray-600 capitalize">{selectedPet.gender}</p>
//                       </div>
//                       <div className="bg-gray-50 p-6 rounded-2xl">
//                         <h4 className="font-semibold text-gray-800 mb-2">Location</h4>
//                         <p className="text-gray-600">{selectedPet.location}</p>
//                       </div>
//                     </div>

//                     <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-2xl border border-purple-200">
//                       <h3 className="text-lg font-semibold text-gray-800 mb-4">Listing Information</h3>
//                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                         <div>
//                           <p className="text-sm text-gray-500 mb-1">Date Posted</p>
//                           <p className="font-semibold text-gray-800">
//                             {new Date(selectedPet.date).toLocaleDateString("en-US", {
//                               year: "numeric",
//                               month: "long",
//                               day: "numeric",
//                             })}
//                           </p>
//                         </div>
//                         <div>
//                           <p className="text-sm text-gray-500 mb-1">Pet ID</p>
//                           <p className="font-semibold text-gray-800">#{selectedPet.id}</p>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 )}

//                 {activeTab === "contact" && (
//                   <div className="space-y-6">
//                     <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-2xl border border-purple-200">
//                       <h3 className="text-lg font-semibold text-gray-800 mb-4">Pet Owner</h3>
//                       <div className="flex items-center gap-4">
//                         <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold text-xl">
//                           {selectedPet.owner_info?.name?.charAt(0) || "U"}
//                         </div>
//                         <div>
//                           <p className="font-semibold text-gray-800 text-lg">
//                             {selectedPet.owner_info?.name || "Pet Owner"}
//                           </p>
//                           {selectedPet.owner_info?.phone && (
//                             <p className="text-gray-600">{selectedPet.owner_info.phone}</p>
//                           )}
//                         </div>
//                       </div>
//                     </div>

//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                       {selectedPet.owner_info?.phone && (
//                         <a
//                           href={`tel:${selectedPet.owner_info.phone}`}
//                           className="flex items-center justify-center gap-3 bg-emerald-600 text-white px-6 py-4 rounded-xl hover:bg-emerald-700 transition-colors font-medium"
//                         >
//                           <Phone className="h-5 w-5" />
//                           Call Owner
//                         </a>
//                       )}

//                       {selectedPet.user_id && (
//                         <Link
//                           href={`/messages/${selectedPet.user_id}`}
//                           className="flex items-center justify-center gap-3 bg-blue-600 text-white px-6 py-4 rounded-xl hover:bg-blue-700 transition-colors font-medium"
//                         >
//                           <MessageCircle className="h-5 w-5" />
//                           Send Message
//                         </Link>
//                       )}
//                     </div>

//                     <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl">
//                       <p className="text-amber-800 text-sm">
//                         <strong>Safety Tip:</strong> Always meet in a public place and bring a friend when meeting a pet
//                         for the first time.
//                       </p>
//                     </div>
//                   </div>
//                 )}
//               </div>

//               {/* Modal Footer */}
//               <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
//                 <div className="flex gap-3 justify-end">
//                   {canAdopt ? (
//                     <button
//                       onClick={handleAdopt}
//                       className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all font-medium shadow-lg"
//                     >
//                       Submit Adoption Request
//                     </button>
//                   ) : (
//                     <div className="text-sm text-amber-700 bg-amber-50 px-4 py-3 rounded-xl border border-amber-200">
//                       {currentUserId
//                         ? "You need an approved application to adopt this pet"
//                         : "Please log in to adopt this pet"}
//                     </div>
//                   )}
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}
//       </main>

//       <Footer />
//     </div>
//   )
// }
