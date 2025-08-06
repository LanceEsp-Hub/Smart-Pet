
// // //frontend\pages\rehome_pets.js
// // "use client";


// // import { useState, useEffect } from 'react';
// // import { useRouter } from 'next/router';
// // import Link from 'next/link';
// // import { Search } from 'lucide-react';
// // import Navbar from '../components/Navbar';
// // import Footer from '../components/Footer';
// // import toast from 'react-hot-toast';
// // import { fetchRehomePets, checkAdoptionStatus, adoptPet } from '../utils/api';

// // export default function RehomePets() {
// //   const [pets, setPets] = useState([]);
// //   const [loading, setLoading] = useState(true);
// //   const [selectedPet, setSelectedPet] = useState(null);
// //   const [canAdopt, setCanAdopt] = useState(false);
// //   const [currentUserId, setCurrentUserId] = useState(null);
// //   const [showModal, setShowModal] = useState(false);


// //   const [filters, setFilters] = useState({
// //     type: 'all',
// //     gender: 'all',
// //     location: ''
// //   });
// //   const router = useRouter();

// //   useEffect(() => {
// //     if (typeof window !== 'undefined') {
// //       setCurrentUserId(parseInt(window.sessionStorage.getItem("user_id")));
// //     }
// //   }, []);



// // useEffect(() => {
// //   const fetchRehomePetsData = async () => {
// //     try {
// //       setLoading(true);
// //       const data = await fetchRehomePets(filters);
// //       setPets(data);
// //     } catch (error) {
// //       toast.error(error.message);
// //     } finally {
// //       setLoading(false);
// //     }
// //   };
  
// //   fetchRehomePetsData();
// // }, [filters]);

// // const handlePetClick = async (pet) => {
// //   setSelectedPet(pet);
// //   if (currentUserId) {
// //     try {
// //       const { can_adopt } = await checkAdoptionStatus(pet.id, currentUserId);
// //       setCanAdopt(can_adopt);
// //     } catch (error) {
// //       toast.error("Couldn't verify adoption status");
// //     }
// //   }
// //   setShowModal(true);
// // };

// // const handleAdopt = async () => {
// //   try {
// //     if (!currentUserId) {
// //       toast.error('Please log in to adopt a pet');
// //       router.push('/login');
// //       return;
// //     }

// //     const result = await adoptPet(selectedPet.id, currentUserId);
    
// //     if (result.success) {
// //       toast.success('Adoption request submitted successfully!');
// //       // Optionally refresh the pets list
// //       const updatedPets = await fetchRehomePets(filters);
// //       setPets(updatedPets);
// //     } else {
// //       toast.error(result.message || 'Adoption request failed');
// //     }
    
// //     setShowModal(false);
// //   } catch (error) {
// //     toast.error(error.message);
// //     console.error('Adoption error:', error);
// //   }
// // };

  

// //   const handleFilterChange = (newFilters) => {
// //     setFilters(prev => ({ ...prev, ...newFilters }));
// //   };

// //   return (
// //     <div className="min-h-screen flex flex-col">
// //       <Navbar />
      
// // <main className="flex-1 container mx-auto px-4 py-8">
// //   <div className="mb-8">
// //     <h1 className="text-3xl font-bold text-gray-900 mb-2">Pets Available for Rehoming</h1>
// //     <p className="text-gray-600">
// //       Find loving homes for these pets in need
// //     </p>
// //   </div>

// //   {/* Filters */}
// //   <div className="bg-white rounded-lg shadow p-4 mb-8">
// //     <div className="flex flex-col md:flex-row gap-4">
// //       <div className="flex-1">
// //         <label className="block text-sm font-medium text-gray-700 mb-1">Pet Type</label>
// //         <select
// //           value={filters.type}
// //           onChange={(e) => handleFilterChange({ type: e.target.value })}
// //           className="w-full p-2 border border-gray-300 rounded-md"
// //         >
// //           <option value="">All Types</option>
// //           <option value="dog">Dogs</option>
// //           <option value="cat">Cats</option>
// //           <option value="bird">Birds</option>
// //           <option value="rabbit">Rabbits</option>
// //           <option value="other">Other</option>
// //         </select>
// //       </div>
      
// //       <div className="flex-1">
// //         <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
// //         <select
// //           value={filters.gender}
// //           onChange={(e) => handleFilterChange({ gender: e.target.value })}
// //           className="w-full p-2 border border-gray-300 rounded-md"
// //         >
// //           <option value="">Any Gender</option>
// //           <option value="male">Male</option>
// //           <option value="female">Female</option>
// //         </select>
// //       </div>
      
// //       <div className="flex-1">
// //         <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
// //         <div className="relative">
// //           <input
// //             type="text"
// //             placeholder="Search location..."
// //             value={filters.location}
// //             onChange={(e) => handleFilterChange({ location: e.target.value })}
// //             className="w-full p-2 pl-10 border border-gray-300 rounded-md"
// //           />
// //           <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
// //         </div>
// //       </div>

// //       {/* New filters */}
// //       <div className="flex-1">
// //         <label className="block text-sm font-medium text-gray-700 mb-1">Good With</label>
// //         <select
// //           value={filters.good_with}
// //           onChange={(e) => handleFilterChange({ good_with: e.target.value })}
// //           className="w-full p-2 border border-gray-300 rounded-md"
// //         >
// //           <option value="">Any</option>
// //           <option value="children">Children</option>
// //           <option value="dogs">Dogs</option>
// //           <option value="cats">Cats</option>
// //           <option value="elderly">Elderly</option>
// //         </select>
// //       </div>

// //       <div className="flex-1">
// //         <label className="block text-sm font-medium text-gray-700 mb-1">Energy Level</label>
// //         <select
// //           value={filters.energy_level}
// //           onChange={(e) => handleFilterChange({ energy_level: e.target.value })}
// //           className="w-full p-2 border border-gray-300 rounded-md"
// //         >
// //           <option value="">Any</option>
// //           <option value="low">Low</option>
// //           <option value="medium">Medium</option>
// //           <option value="high">High</option>
// //         </select>
// //       </div>
// //     </div>
// //     <div className="mt-4 flex justify-end">
// //       <button 
// //         onClick={() => handleFilterChange({ 
// //           type: '', 
// //           gender: '', 
// //           location: '',
// //           good_with: '',
// //           energy_level: ''
// //         })}
// //         className="text-sm text-purple-600 hover:text-purple-800"
// //       >
// //         Clear Filters
// //       </button>
// //     </div>
// //   </div>

// //   {/* Pets Grid */}
// //   {loading ? (
// //     <div className="flex justify-center items-center h-64">
// //       <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
// //     </div>
// //   ) : pets.length > 0 ? (
// //     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
// //       {pets.map((pet) => (
// //         <div 
// //           key={pet.id} 
// //           className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
// //           onClick={() => handlePetClick(pet)}
// //         >
// //           <div>
// //             <div className="relative h-48 bg-gray-200">
// //               {pet.image ? (
// //                 <img 
// //                   src={pet.image} 
// //                   alt={pet.name}
// //                   className="w-full h-full object-cover"
// //                   onError={(e) => {
// //                     e.target.onerror = null; 
// //                     e.target.src = '/default-pet.jpg';
// //                   }}
// //                 />
// //               ) : (
// //                 <div className="flex items-center justify-center h-full text-gray-500">
// //                   <img src="/default-pet.jpg" alt="Default pet" className="w-full h-full object-cover" />
// //                 </div>
// //               )}
// //               {pet.additional_images?.length > 0 && (
// //                 <div className="absolute bottom-2 right-2 bg-white bg-opacity-80 px-2 py-1 rounded-full text-xs">
// //                   +{pet.additional_images.length} more
// //                 </div>
// //               )}
// //             </div>
// //             <div className="p-4">
// //               <div className="flex justify-between items-start">
// //                 <h3 className="text-lg font-semibold text-gray-900">{pet.name}</h3>
// //                 <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 capitalize">
// //                   {pet.type}
// //                 </span>
// //               </div>
// //               <div className="mt-2 flex items-center text-sm text-gray-500">
// //                 <span className="capitalize">{pet.gender}</span>
// //                 <span className="mx-1">•</span>
// //                 <span>{pet.location}</span>
// //               </div>
// //               <div className="mt-3 flex flex-wrap gap-1">
// //                 {pet.health_info?.vaccinated === 'Yes' && (
// //                   <span className="inline-flex items-center text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded">
// //                     ✓ Vaccinated
// //                   </span>
// //                 )}
// //                 {pet.health_info?.spayed_neutered === 'Yes' && (
// //                   <span className="inline-flex items-center text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded">
// //                     ✓ Spayed/Neutered
// //                   </span>
// //                 )}
// //                 {pet.health_info?.energy_level && (
// //                   <span className="inline-flex items-center text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
// //                     {pet.health_info.energy_level} energy
// //                   </span>
// //                 )}
// //                 {pet.health_info?.good_with?.children && (
// //                   <span className="inline-flex items-center text-xs text-purple-600 bg-purple-50 px-2 py-0.5 rounded">
// //                     ✓ Kids
// //                   </span>
// //                 )}
// //                 {pet.health_info?.good_with?.dogs && (
// //                   <span className="inline-flex items-center text-xs text-purple-600 bg-purple-50 px-2 py-0.5 rounded">
// //                     ✓ Dogs
// //                   </span>
// //                 )}
// //                 {pet.health_info?.good_with?.cats && (
// //                   <span className="inline-flex items-center text-xs text-purple-600 bg-purple-50 px-2 py-0.5 rounded">
// //                     ✓ Cats
// //                   </span>
// //                 )}
// //               </div>
// //             </div>
// //           </div>
// //         </div>
// //       ))}
// //     </div>
// //   ) : (
// //     <div className="text-center py-12">
// //       <h3 className="text-lg font-medium text-gray-900">No pets found</h3>
// //       <p className="mt-1 text-sm text-gray-500">
// //         Try adjusting your search or filter criteria
// //       </p>
// //       <button 
// //         onClick={() => handleFilterChange({ 
// //           type: '', 
// //           gender: '', 
// //           location: '',
// //           good_with: '',
// //           energy_level: ''
// //         })}
// //         className="mt-4 text-sm text-purple-600 hover:text-purple-800"
// //       >
// //         Reset all filters
// //       </button>
// //     </div>
// //   )}

// //   {/* Adoption Modal */}
// //   {showModal && selectedPet && (
// //     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
// //       <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
// //         <div className="p-6">
// //           <div className="flex justify-between items-start mb-4">
// //             <h2 className="text-2xl font-bold">{selectedPet.name}</h2>
// //             <button 
// //               onClick={() => setShowModal(false)}
// //               className="text-gray-500 hover:text-gray-700"
// //             >
// //               ✕
// //             </button>
// //           </div>

// //           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
// //             <div>
// //               <div className="h-64 bg-gray-200 rounded-lg overflow-hidden">
// //                 {selectedPet.image ? (
// //                   <img
// //                     src={selectedPet.image}
// //                     alt={selectedPet.name}
// //                     className="w-full h-full object-cover"
// //                     onError={(e) => {
// //                       e.target.onerror = null; 
// //                       e.target.src = '/default-pet.jpg';
// //                     }}
// //                   />
// //                 ) : (
// //                   <img src="/default-pet.jpg" alt="Default pet" className="w-full h-full object-cover" />
// //                 )}
// //               </div>
              
// //               {/* Additional Images */}
// //               {selectedPet.additional_images?.length > 0 && (
// //                 <div className="mt-4">
// //                   <h3 className="font-medium mb-2">More Photos</h3>
// //                   <div className="grid grid-cols-3 gap-2">
// //                     {selectedPet.additional_images.map((img, index) => (
// //                       <div key={index} className="h-24 bg-gray-200 rounded overflow-hidden">
// //                         <img 
// //                           src={img} 
// //                           alt={`${selectedPet.name} ${index + 1}`}
// //                           className="w-full h-full object-cover"
// //                         />
// //                       </div>
// //                     ))}
// //                   </div>
// //                 </div>
// //               )}
              
// //               {/* Owner info */}
// //               <div className="mt-4 bg-gray-50 p-3 rounded-lg">
// //                 <h3 className="font-semibold text-sm mb-1">Posted by</h3>
// //                 <p className="text-gray-700">{selectedPet.owner_info?.name}</p>
// //                 {selectedPet.owner_info?.phone && (
// //                   <a 
// //                     href={`tel:${selectedPet.owner_info.phone}`}
// //                     className="text-gray-500 text-sm hover:text-purple-600"
// //                   >
// //                     {selectedPet.owner_info.phone}
// //                   </a>
// //                 )}
// //               </div>
// //             </div>

// //             <div>
// //               <div className="space-y-4">
// //                 <div>
// //                   <h3 className="font-semibold">Details</h3>
// //                   <div className="grid grid-cols-2 gap-2 mt-2">
// //                     <div>
// //                       <p className="text-sm text-gray-500">Type</p>
// //                       <p className="text-gray-700 capitalize">{selectedPet.type}</p>
// //                     </div>
// //                     <div>
// //                       <p className="text-sm text-gray-500">Gender</p>
// //                       <p className="text-gray-700 capitalize">{selectedPet.gender}</p>
// //                     </div>
// //                     <div>
// //                       <p className="text-sm text-gray-500">Location</p>
// //                       <p className="text-gray-700">{selectedPet.location}</p>
// //                     </div>
// //                     <div>
// //                       <p className="text-sm text-gray-500">Date Posted</p>
// //                       <p className="text-gray-700">
// //                         {new Date(selectedPet.date).toLocaleDateString()}
// //                       </p>
// //                     </div>
// //                   </div>
// //                 </div>

// //                 {selectedPet.health_info?.reason_for_adoption && (
// //                   <div>
// //                     <h3 className="font-semibold">Reason for Rehoming</h3>
// //                     <p className="text-gray-700">{selectedPet.health_info.reason_for_adoption}</p>
// //                   </div>
// //                 )}

// //                 {selectedPet.description && (
// //                   <div>
// //                     <h3 className="font-semibold">About</h3>
// //                     <p className="text-gray-700">{selectedPet.description}</p>
// //                   </div>
// //                 )}

// //                 <div>
// //                   <h3 className="font-semibold">Health & Personality</h3>
// //                   <div className="mt-2 flex flex-wrap gap-2">
// //                     {selectedPet.health_info?.vaccinated && (
// //                       <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
// //                         Vaccinated: {selectedPet.health_info.vaccinated}
// //                       </span>
// //                     )}
// //                     {selectedPet.health_info?.spayed_neutered && (
// //                       <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
// //                         Spayed/Neutered: {selectedPet.health_info.spayed_neutered}
// //                       </span>
// //                     )}
// //                     {selectedPet.health_info?.energy_level && (
// //                       <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
// //                         Energy: {selectedPet.health_info.energy_level}
// //                       </span>
// //                     )}
// //                     {selectedPet.health_info?.good_with?.children && (
// //                       <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
// //                         ✓ Good with kids
// //                       </span>
// //                     )}
// //                     {selectedPet.health_info?.good_with?.dogs && (
// //                       <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
// //                         ✓ Good with dogs
// //                       </span>
// //                     )}
// //                     {selectedPet.health_info?.good_with?.cats && (
// //                       <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
// //                         ✓ Good with cats
// //                       </span>
// //                     )}
// //                     {selectedPet.health_info?.good_with?.elderly && (
// //                       <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
// //                         ✓ Good with elderly
// //                       </span>
// //                     )}
// //                   </div>
                  
// //                   {selectedPet.health_info?.temperament_personality && (
// //                     <div className="mt-3">
// //                       <p className="text-sm text-gray-700">
// //                         <span className="font-medium">Personality:</span> {selectedPet.health_info.temperament_personality}
// //                       </p>
// //                     </div>
// //                   )}
// //                 </div>
// //               </div>

// // {/* Inside the modal's action buttons section, replace or add to the existing buttons */}
// // <div className="mt-6 flex gap-3 flex-wrap">
// //   {canAdopt ? (
// //     <button
// //       onClick={handleAdopt}
// //       className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition-colors"
// //     >
// //       Adopt Me
// //     </button>
// //   ) : (
// //     <div className="text-sm text-yellow-600 bg-yellow-50 p-2 rounded">
// //       {currentUserId 
// //         ? "You need an approved application to adopt this pet"
// //         : "Please log in to adopt this pet"}
// //     </div>
// //   )}
  
// //   {selectedPet.owner_info?.phone && (
// //     <a 
// //       href={`tel:${selectedPet.owner_info.phone}`}
// //       className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300 transition-colors"
// //     >
// //       Call Owner
// //     </a>
// //   )}
  
// //   {/* New Chat with Owner button */}
// //   {selectedPet.user_id && (
// //     <Link 
// //       href={`/messages/${selectedPet.user_id}`}
// //       className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
// //     >
// //       Chat with Owner
// //     </Link>
// //   )}
// // </div>
// //             </div>
// //           </div>
// //         </div>
// //       </div>
// //     </div>
// //   )}
// // </main>
      
// //       <Footer />
// //     </div>
// //   );
// // }


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
        setLoading(true)
        console.log("Fetching rehome pets with filters:", filters)
        const data = await fetchRehomePets(filters)
        console.log("Received pets data:", data)
        setPets(data)
      } catch (error) {
        console.error("Error fetching rehome pets:", error)
        toast.error(error.message)
      } finally {
        setLoading(false)
      }
    }

    fetchRehomePetsData()
  }, [filters])

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
    if (!pet || !pet.id) return "https://via.placeholder.com/100"
    // Handle the format "1/main.jpg" -> "https://fkpimtcxncgwtdsfyrjb.supabase.co/storage/v1/object/public/pet-images/1/main.jpg"
    const imagePath = `${pet.id}/${filename}`
    return `${SUPABASE_URL}/storage/v1/object/public/${PET_IMAGES_BUCKET}/${imagePath}`
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
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200"></div>
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-600 border-t-transparent absolute top-0"></div>
            </div>
          </div>
        ) : pets.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {console.log("Rendering pets:", pets)}
            {pets.map((pet) => (
              <div
                key={pet.id}
                className="group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 cursor-pointer border border-gray-100"
                onClick={() => handlePetClick(pet)}
              >
                <div className="relative h-56 bg-gradient-to-br from-purple-100 to-pink-100 overflow-hidden">
                  {pet.image ? (
                    <img
                      src={getImageUrl(pet) || "/placeholder.svg"}
                      alt={pet.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      onError={(e) => {
                        e.target.onerror = null
                        e.target.src = "/default-pet.jpg"
                      }}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <img src="/default-pet.jpg" alt="Default pet" className="w-full h-full object-cover" />
                    </div>
                  )}

                  <div className="absolute top-3 right-3">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-white/90 text-purple-700 backdrop-blur-sm capitalize shadow-lg">
                      {pet.type}
                    </span>
                  </div>

                  {pet.additional_images?.length > 0 && (
                    <div className="absolute bottom-3 right-3 bg-black/50 backdrop-blur-sm px-2 py-1 rounded-full text-xs text-white">
                      +{pet.additional_images.length} photos
                    </div>
                  )}

                  <div className="absolute top-3 left-3">
                    <button className="p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-colors">
                      <Heart className="h-4 w-4 text-gray-600 hover:text-red-500 transition-colors" />
                    </button>
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-purple-600 transition-colors">
                      {pet.name}
                    </h3>
                  </div>

                  <div className="flex items-center text-sm text-gray-500 mb-4">
                    <span className="capitalize font-medium">{pet.gender}</span>
                    <span className="mx-2">•</span>
                    <MapPin className="h-4 w-4 mr-1" />
                    <span>{pet.location}</span>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {pet.health_info?.vaccinated === "Yes" && (
                      <span className="inline-flex items-center text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200">
                        ✓ Vaccinated
                      </span>
                    )}
                    {pet.health_info?.spayed_neutered === "Yes" && (
                      <span className="inline-flex items-center text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200">
                        ✓ Fixed
                      </span>
                    )}
                    {pet.health_info?.energy_level && (
                      <span className="inline-flex items-center text-xs font-medium text-blue-700 bg-blue-50 px-2 py-1 rounded-lg border border-blue-200">
                        {pet.health_info.energy_level} energy
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {pet.health_info?.good_with?.children && (
                      <span className="inline-flex items-center text-xs font-medium text-purple-700 bg-purple-50 px-2 py-1 rounded-lg border border-purple-200">
                        ✓ Kids
                      </span>
                    )}
                    {pet.health_info?.good_with?.dogs && (
                      <span className="inline-flex items-center text-xs font-medium text-purple-700 bg-purple-50 px-2 py-1 rounded-lg border border-purple-200">
                        ✓ Dogs
                      </span>
                    )}
                    {pet.health_info?.good_with?.cats && (
                      <span className="inline-flex items-center text-xs font-medium text-purple-700 bg-purple-50 px-2 py-1 rounded-lg border border-purple-200">
                        ✓ Cats
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="h-12 w-12 text-purple-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">No pets found</h3>
              <p className="text-gray-500 mb-6">Try adjusting your search or filter criteria to find more pets</p>
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
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all font-medium"
              >
                Reset All Filters
              </button>
            </div>
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

                    <div className="space-y-6">
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
                      {selectedPet.owner_info?.phone && (
                        <a
                          href={`tel:${selectedPet.owner_info.phone}`}
                          className="flex items-center justify-center gap-3 bg-emerald-600 text-white px-6 py-4 rounded-xl hover:bg-emerald-700 transition-colors font-medium"
                        >
                          <Phone className="h-5 w-5" />
                          Call Owner
                        </a>
                      )}

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
//   //       console.log("Fetching rehome pets with filters:", filters)
//   //       const data = await fetchRehomePets(filters)
//   //       console.log("Received pets data:", data)
//   //       setPets(data)
//   //     } catch (error) {
//   //       console.error("Error fetching rehome pets:", error)
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
//         const data = await fetchRehomePets(filters) // 🔁 replace this line
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
//     <div>
//       <Navbar />

//       <main>
//         {/* Hero Section */}
//         <div>
//           <h1>Find Your Perfect Companion</h1>
//           <p>Give these loving pets a second chance at happiness. Every pet deserves a forever home.</p>
//         </div>

//         {/* Filters */}
//         <div>
//           <div>
//             <h2>Find Your Match</h2>
//             <button onClick={() => setShowFilters(!showFilters)}>
//               <Filter />
//               Filters
//             </button>
//           </div>

//           <div style={{ display: showFilters ? "block" : "none" }}>
//             <div>
//               <div>
//                 <label>Pet Type</label>
//                 <select
//                   value={filters.type}
//                   onChange={(e) => handleFilterChange({ type: e.target.value })}
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
//                 <label>Gender</label>
//                 <select
//                   value={filters.gender}
//                   onChange={(e) => handleFilterChange({ gender: e.target.value })}
//                 >
//                   <option value="">Any Gender</option>
//                   <option value="male">Male</option>
//                   <option value="female">Female</option>
//                 </select>
//               </div>

//               <div>
//                 <label>Location</label>
//                 <div>
//                   <input
//                     type="text"
//                     placeholder="Search location..."
//                     value={filters.location}
//                     onChange={(e) => handleFilterChange({ location: e.target.value })}
//                   />
//                   <Search />
//                 </div>
//               </div>

//               <div>
//                 <label>Good With</label>
//                 <select
//                   value={filters.good_with}
//                   onChange={(e) => handleFilterChange({ good_with: e.target.value })}
//                 >
//                   <option value="">Any</option>
//                   <option value="children">Children</option>
//                   <option value="dogs">Dogs</option>
//                   <option value="cats">Cats</option>
//                   <option value="elderly">Elderly</option>
//                 </select>
//               </div>

//               <div>
//                 <label>Energy Level</label>
//                 <select
//                   value={filters.energy_level}
//                   onChange={(e) => handleFilterChange({ energy_level: e.target.value })}
//                 >
//                   <option value="">Any</option>
//                   <option value="low">Low</option>
//                   <option value="medium">Medium</option>
//                   <option value="high">High</option>
//                 </select>
//               </div>
//             </div>

//             <div>
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
//               >
//                 Clear All Filters
//               </button>
//             </div>
//           </div>
//         </div>

//         {/* Pets Grid */}
//         {loading ? (
//           <div>Loading...</div>
//         ) : pets.length > 0 ? (
//           <div>
//             {pets.map((pet) => (
//               <div key={pet.id} onClick={() => handlePetClick(pet)}>
//                 <div>
//                   {pet.image ? (
//                     <img
//                       src={getImageUrl(pet) || "/placeholder.svg"}
//                       alt={pet.name}
//                       onError={(e) => {
//                         e.target.onerror = null
//                         e.target.src = "/default-pet.jpg"
//                       }}
//                     />
//                   ) : (
//                     <img src="/default-pet.jpg" alt="Default pet" />
//                   )}

//                   <div>
//                     <span>{pet.type}</span>
//                   </div>

//                   {pet.additional_images?.length > 0 && (
//                     <div>+{pet.additional_images.length} photos</div>
//                   )}

//                   <div>
//                     <button>
//                       <Heart />
//                     </button>
//                   </div>
//                 </div>

//                 <div>
//                   <div>
//                     <h3>{pet.name}</h3>
//                   </div>

//                   <div>
//                     <span>{pet.gender}</span>
//                     <MapPin />
//                     <span>{pet.location}</span>
//                   </div>

//                   <div>
//                     {pet.health_info?.vaccinated === "Yes" && (
//                       <span>✓ Vaccinated</span>
//                     )}
//                     {pet.health_info?.spayed_neutered === "Yes" && (
//                       <span>✓ Fixed</span>
//                     )}
//                     {pet.health_info?.energy_level && (
//                       <span>{pet.health_info.energy_level} energy</span>
//                     )}
//                   </div>

//                   <div>
//                     {pet.health_info?.good_with?.children && (
//                       <span>✓ Kids</span>
//                     )}
//                     {pet.health_info?.good_with?.dogs && (
//                       <span>✓ Dogs</span>
//                     )}
//                     {pet.health_info?.good_with?.cats && (
//                       <span>✓ Cats</span>
//                     )}
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         ) : (
//           <div>
//             <div>
//               <Search />
//               <h3>No pets found</h3>
//               <p>Try adjusting your search or filter criteria to find more pets</p>
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
//               >
//                 Reset All Filters
//               </button>
//             </div>
//           </div>
//         )}

//         {/* Modal */}
//         {showModal && selectedPet && (
//           <div>
//             <div>
//               {/* Modal Header */}
//               <div>
//                 <div>
//                   <h2>{selectedPet.name}</h2>
//                   <div>
//                     <span>
//                       {selectedPet.type} • {selectedPet.gender}
//                     </span>
//                     <span>
//                       <MapPin />
//                       {selectedPet.location}
//                     </span>
//                     <span>
//                       <Calendar />
//                       {new Date(selectedPet.date).toLocaleDateString()}
//                     </span>
//                   </div>
//                 </div>
//                 <button onClick={() => setShowModal(false)}>
//                   <X />
//                 </button>
//               </div>

//               {/* Tabs */}
//               <div>
//                 <div>
//                   {tabs.map((tab) => {
//                     const Icon = tab.icon
//                     return (
//                       <button
//                         key={tab.id}
//                         onClick={() => setActiveTab(tab.id)}
//                       >
//                         <Icon />
//                         {tab.label}
//                       </button>
//                     )
//                   })}
//                 </div>
//               </div>

//               {/* Tab Content */}
//               <div>
//                 {activeTab === "overview" && (
//                   <div>
//                     <div>
//                       {selectedPet.image ? (
//                         <img
//                           src={getImageUrl(selectedPet) || "/placeholder.svg"}
//                           alt={selectedPet.name}
//                           onError={(e) => {
//                             e.target.onerror = null
//                             e.target.src = "/default-pet.jpg"
//                           }}
//                         />
//                       ) : (
//                         <img src="/default-pet.jpg" alt="Default pet" />
//                       )}
//                     </div>

//                     {selectedPet.additional_images?.length > 0 && (
//                       <div>
//                         <h3>More Photos</h3>
//                         <div>
//                           {selectedPet.additional_images.map((img, index) => (
//                             <div key={index}>
//                               <img
//                                 src={getImageUrl(selectedPet, img) || "/placeholder.svg"}
//                                 alt={`${selectedPet.name} ${index + 1}`}
//                               />
//                             </div>
//                           ))}
//                         </div>
//                       </div>
//                     )}

//                     <div>
//                       {selectedPet.description && (
//                         <div>
//                           <h3>About {selectedPet.name}</h3>
//                           <p>{selectedPet.description}</p>
//                         </div>
//                       )}

//                       {selectedPet.health_info?.reason_for_adoption && (
//                         <div>
//                           <h3>Why I Need a New Home</h3>
//                           <p>{selectedPet.health_info.reason_for_adoption}</p>
//                         </div>
//                       )}

//                       <div>
//                         <h3>Quick Facts</h3>
//                         <div>
//                           <div>
//                             <p>Type</p>
//                             <p>{selectedPet.type}</p>
//                           </div>
//                           <div>
//                             <p>Gender</p>
//                             <p>{selectedPet.gender}</p>
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 )}

//                 {activeTab === "health" && (
//                   <div>
//                     <div>
//                       <div>
//                         <h3>Medical Status</h3>
//                         <div>
//                           <div>
//                             <span>Vaccinated</span>
//                             <span>
//                               {selectedPet.health_info?.vaccinated || "Unknown"}
//                             </span>
//                           </div>
//                           <div>
//                             <span>Spayed/Neutered</span>
//                             <span>
//                               {selectedPet.health_info?.spayed_neutered || "Unknown"}
//                             </span>
//                           </div>
//                         </div>
//                       </div>

//                       <div>
//                         <h3>Energy & Personality</h3>
//                         <div>
//                           <div>
//                             <span>Energy Level</span>
//                             <span>
//                               {selectedPet.health_info?.energy_level || "Not specified"}
//                             </span>
//                           </div>
//                           {selectedPet.health_info?.temperament_personality && (
//                             <div>
//                               <span>Personality</span>
//                               <p>{selectedPet.health_info.temperament_personality}</p>
//                             </div>
//                           )}
//                         </div>
//                       </div>
//                     </div>

//                     <div>
//                       <h3>Good With</h3>
//                       <div>
//                         {selectedPet.health_info?.good_with?.children && (
//                           <span>✓ Children</span>
//                         )}
//                         {selectedPet.health_info?.good_with?.dogs && (
//                           <span>✓ Dogs</span>
//                         )}
//                         {selectedPet.health_info?.good_with?.cats && (
//                           <span>✓ Cats</span>
//                         )}
//                         {selectedPet.health_info?.good_with?.elderly && (
//                           <span>✓ Elderly</span>
//                         )}
//                       </div>
//                     </div>
//                   </div>
//                 )}

//                 {activeTab === "details" && (
//                   <div>
//                     <div>
//                       <div>
//                         <h4>Pet Type</h4>
//                         <p>{selectedPet.type}</p>
//                       </div>
//                       <div>
//                         <h4>Gender</h4>
//                         <p>{selectedPet.gender}</p>
//                       </div>
//                       <div>
//                         <h4>Location</h4>
//                         <p>{selectedPet.location}</p>
//                       </div>
//                     </div>

//                     <div>
//                       <h3>Listing Information</h3>
//                       <div>
//                         <div>
//                           <p>Date Posted</p>
//                           <p>
//                             {new Date(selectedPet.date).toLocaleDateString()}
//                           </p>
//                         </div>
//                         <div>
//                           <p>Pet ID</p>
//                           <p>#{selectedPet.id}</p>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 )}

//                 {activeTab === "contact" && (
//                   <div>
//                     <div>
//                       <h3>Pet Owner</h3>
//                       <div>
//                         <div>
//                           {selectedPet.owner_info?.name?.charAt(0) || "U"}
//                         </div>
//                         <div>
//                           <p>
//                             {selectedPet.owner_info?.name || "Pet Owner"}
//                           </p>
//                           {selectedPet.owner_info?.phone && (
//                             <p>{selectedPet.owner_info.phone}</p>
//                           )}
//                         </div>
//                       </div>
//                     </div>

//                     <div>
//                       {selectedPet.owner_info?.phone && (
//                         <a href={`tel:${selectedPet.owner_info.phone}`}>
//                           <Phone />
//                           Call Owner
//                         </a>
//                       )}

//                       {selectedPet.user_id && (
//                         <Link href={`/messages/${selectedPet.user_id}`}>
//                           <MessageCircle />
//                           Send Message
//                         </Link>
//                       )}
//                     </div>

//                     <div>
//                       <p>
//                         <strong>Safety Tip:</strong> Always meet in a public place and bring a friend when meeting a pet
//                         for the first time.
//                       </p>
//                     </div>
//                   </div>
//                 )}
//               </div>

//               {/* Modal Footer */}
//               <div>
//                 <div>
//                   {canAdopt ? (
//                     <button onClick={handleAdopt}>
//                       Submit Adoption Request
//                     </button>
//                   ) : (
//                     <div>
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
