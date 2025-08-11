//frontend\pages\pet_dashboard.js
"use client";

import { MessageSquare, User, ChevronRight, Plus, PawPrint, Heart, HelpCircle, Settings, Home } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import CryptoJS from "crypto-js";
import { fetchPetDashboard } from "../utils/api";

const SECRET_KEY = "asdasdasd";

const encryptData = (data) => {
  return CryptoJS.AES.encrypt(JSON.stringify(data), SECRET_KEY).toString();
};

const decryptData = (encryptedData) => {
  const bytes = CryptoJS.AES.decrypt(encryptedData, SECRET_KEY);
  return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
};

// Improved image URL handling with fallback
const getPetImageUrl = (imageName) => {
  if (!imageName) return "/pet-placeholder.jpg"; // Local fallback image
  // Use relative path for production, absolute for development
  const baseUrl = process.env.NODE_ENV === 'development' 
    ? 'http://localhost:8000' 
    : '';
  return `${baseUrl}/uploads/pet_images/${imageName}?t=${Date.now()}`;
};

// Status colors mapping
const statusColors = {
  'lost': { bg: 'bg-red-100', text: 'text-red-800', icon: '🔍' },
  'found': { bg: 'bg-green-100', text: 'text-green-800', icon: '🏠' },
  'safe at home': { bg: 'bg-blue-100', text: 'text-blue-800', icon: '❤️' },
  'rehome': { bg: 'bg-purple-100', text: 'text-purple-800', icon: '🔄' },
  'default': { bg: 'bg-gray-100', text: 'text-gray-800', icon: '🐾' }
};

export default function Dashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pets, setPets] = useState([]);

  const handlePetCardClick = (petId) => {
    router.push(`/pet_profile/${petId}`);
  };

  useEffect(() => {
    const authenticate = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token') || searchParams.get('token');
        const userId = urlParams.get('user_id') || searchParams.get('user_id');
        const user = urlParams.get('user') || searchParams.get('user');
        const roles = urlParams.get('roles') || searchParams.get('roles');
  
        if (token && userId && user) {
          sessionStorage.setItem("auth_token", token);
          sessionStorage.setItem("user_id", userId);
          sessionStorage.setItem("user", user);
          sessionStorage.setItem("roles", roles ? encryptData(roles) : encryptData("user"));
          window.history.replaceState({}, '', window.location.pathname);
        }
  
        const storedToken = sessionStorage.getItem("auth_token");
        const storedUserData = sessionStorage.getItem("user");
        const storedUserId = sessionStorage.getItem("user_id");
        const encryptedRoles = sessionStorage.getItem("roles");
  
        if (!storedToken || !storedUserData || !storedUserId) {
          throw new Error("Missing authentication data");
        }
  
        const storedRoles = decryptData(encryptedRoles);
        if (storedRoles === "admin") {
          router.push("/admin_dashboard");
          return;
        } else if (storedRoles === "user") {
          setIsAuthenticated(true);  
          const data = await fetchPetDashboard(storedToken);
          setUserData(data.user);
          setPets(data.pets || []);
        } else {
          throw new Error("Invalid role");
        }
      } catch (error) {
        console.error("Authentication error:", error);
        router.push("/login");
      } finally {
        setIsLoading(false);
      }
    };
  
    authenticate();
  }, [router, searchParams]);

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-lg text-gray-700">Loading your dashboard...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 py-8 w-full">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-[#1A237E]">Dashboard</h1>
          {userData && (
            <p className="text-base md:text-lg text-gray-600 mt-1">
              Welcome back, <span className="font-semibold text-purple-700">{userData.name}</span>
            </p>
          )}
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Main Content Area - Pets Section */}
          <div className="w-full md:w-2/3">
            <div className="bg-white rounded-xl shadow-sm p-4 md:p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 md:mb-6 gap-3">
                <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                  <PawPrint className="mr-2 text-purple-600" size={20} />
                  Your Pets
                </h2>
                <Link href="/pet_name" className="w-full sm:w-auto">
                  <button className="w-full sm:w-auto px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center">
                    <Plus className="mr-1" size={18} />
                    Add Pet
                  </button>
                </Link>
              </div>

              {pets.length === 0 ? (
                <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
                  <PawPrint className="mx-auto text-gray-300" size={40} />
                  <p className="mt-2 text-gray-500">No pets added yet</p>
                  <Link href="/pet_name" className="inline-block mt-4">
                    <button className="px-4 py-2 text-purple-600 border border-purple-600 rounded-lg hover:bg-purple-50 transition-colors">
                      Add your first pet
                    </button>
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {pets.map((pet) => {
                    const status = pet.status?.toLowerCase() || 'default';
                    const { bg, text, icon } = statusColors[status] || statusColors['default'];
                    
                    return (
                      <div 
                        key={pet.id}
                        onClick={() => handlePetCardClick(pet.id)}
                        className="bg-white border rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                      >
                        {/* Square Image Container with proper aspect ratio */}
                        <div className="relative aspect-square w-full bg-gray-100">
                          <img 
                            src={getPetImageUrl(pet.image)} 
                            alt={pet.name || "Pet image"}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = "/pet-placeholder.jpg";
                            }}
                          />
                          <span className={`absolute top-2 right-2 px-2 py-1 text-xs rounded-full ${bg} ${text}`}>
                            {icon} {pet.status || 'Unknown'}
                          </span>
                        </div>
                        
                        <div className="p-3 md:p-4">
                          <div className="flex justify-between items-start">
                            <h3 className="font-semibold text-gray-900 text-lg">
                              {pet.name || "Unnamed Pet"}
                            </h3>
                          </div>
                          <div className="mt-1 flex items-center text-sm text-gray-500">
                            {pet.type && <span>{pet.type}</span>}
                            {pet.gender && (
                              <span className="ml-2">• {pet.gender}</span>
                            )}
                          </div>
                          {pet.description && (
                            <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                              {pet.description}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar - Quick Actions */}
          <div className="w-full md:w-1/3">
            <div className="bg-white rounded-xl shadow-sm p-4 md:p-6 space-y-4 sticky top-4">
              <h2 className="text-lg font-semibold text-gray-800">Quick Actions</h2>
              
              <Link
                href="/conversations"
                className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <MessageSquare className="h-5 w-5 text-purple-600" />
                  </div>
                  <span className="text-gray-700">Messages</span>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </Link>
              
              <Link
                href="/favorites"
                className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-pink-100 rounded-lg">
                    <Heart className="h-5 w-5 text-pink-600" />
                  </div>
                  <span className="text-gray-700">Favorites</span>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </Link>
              
              <Link
                href="/help"
                className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <HelpCircle className="h-5 w-5 text-blue-600" />
                  </div>
                  <span className="text-gray-700">Help Center</span>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </Link>
              
              <Link
                href="/settings/account_information"
                className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <User className="h-5 w-5 text-yellow-600" />
                  </div>
                  <span className="text-gray-700">Profile Settings</span>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}




















// //frontend\pages\pet_dashboard.js
// "use client"

// import { MessageSquare, User, ChevronRight } from "lucide-react"
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
//             })
//             .catch((error) => {
//               console.error("Dashboard load failed:", error)
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

//   if (isLoading) {
//     return <div className="flex justify-center items-center h-screen">Loading...</div>
//   }

//   if (!isAuthenticated) {
//     return null
//   }

//   return (
//     <div className="min-h-screen bg-white">
//       <Navbar />

//       <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
//         <h1 className="text-3xl font-bold text-[#1A237E] mb-8">Dashboard</h1>

//         {userData && (
//           <div className="mb-8">
//             <p className="text-lg text-gray-700">
//               Welcome back, <span className="font-semibold">{userData.name}</span>!
//             </p>
//           </div>
//         )}

//         <div className="grid md:grid-cols-3 gap-8">
//           <div className="md:col-span-2">
//             <div className="flex justify-between items-center mb-6">
//               <h2 className="text-xl font-semibold text-[#1A237E]">Your Pets</h2>
//               <Link href="/pet_name">
//                 <button className="px-4 py-2 text-purple-700 border border-purple-700 rounded-full hover:bg-purple-50">
//                   Add a Pet
//                 </button>
//               </Link>
//             </div>

//             {/* Pet Cards - Simplified Display */}
//             <div className="space-y-4">
//               {pets.length === 0 ? (
//                 <div className="text-center py-8">
//                   <p className="text-gray-500">No pets found</p>
//                 </div>
//               ) : (
//                 pets.map((pet) => (
//                   <div
//                     key={pet.id}
//                     className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md cursor-pointer"
//                     onClick={handlePetCardClick}
//                     // Hidden data attributes
//                     data-id={pet.id}
//                     data-name={pet.name}
//                     data-type={pet.type}
//                     data-gender={pet.gender}
//                     data-description={pet.description}
//                     data-date={pet.date}
//                     data-address={pet.address}
//                     data-status={pet.status}
//                     data-image={pet.image}
//                   >
//                     <div className="flex items-center space-x-4">
//                       <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
//                         {pet.image ? (
//                           <img
//                             src={getPetImageUrl(pet.image) || "/placeholder.svg"}
//                             alt={pet.name}
//                             className="w-full h-full object-cover"
//                             onError={(e) => {
//                               e.target.onerror = null
//                               e.target.src = "https://via.placeholder.com/100"
//                             }}
//                           />
//                         ) : (
//                           <span className="text-gray-400">No Image</span>
//                         )}
//                       </div>
//                       <div>
//                         <h3 className="font-semibold">{pet.name || "Unnamed Pet"}</h3>
//                         <p className="text-sm text-gray-600">
//                           {pet.type && <span>{pet.type} • </span>}
//                           {pet.status || "Status not specified"}
//                         </p>
//                       </div>
//                     </div>
//                     <ChevronRight className="h-6 w-6 text-gray-400" />
//                   </div>
//                 ))
//               )}
//             </div>
//           </div>

//           {/* Sidebar - Kept simple */}
//           <div className="space-y-8">
//             <div>
//               <h2 className="text-xl font-semibold text-[#1A237E] mb-4">Inbox</h2>
//               <Link
//                 href="/conversations"
//                 className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md"
//               >
//                 <div className="flex items-center space-x-2">
//                   <MessageSquare className="h-5 w-5 text-gray-600" />
//                   <span>Messages</span>
//                 </div>
//                 <ChevronRight className="h-6 w-6 text-gray-400" />
//               </Link>
//             </div>

//             <div>
//               <h2 className="text-xl font-semibold text-[#1A237E] mb-4">Account</h2>
//               <Link
//                 href="/settings/account_information"
//                 className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md"
//               >
//                 <div className="flex items-center space-x-2">
//                   <User className="h-5 w-5 text-gray-600" />
//                   <span>Profile</span>
//                 </div>
//                 <ChevronRight className="h-6 w-6 text-gray-400" />
//               </Link>
//             </div>
//           </div>
//         </div>
//       </main>

//       <Footer />
//     </div>
//   )
// }
