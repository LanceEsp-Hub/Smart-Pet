// //frontend\pages\pet_dashboard.js

// "use client";

// import { Bell, MessageSquare, User, ChevronRight } from "lucide-react";
// import Link from "next/link";
// import { useEffect, useState } from "react";
// import { useRouter, useSearchParams } from "next/navigation";
// import Navbar from "../components/Navbar";
// import Footer from "../components/Footer";
// import CryptoJS from "crypto-js";
// import { fetchPetDashboard } from "../utils/api";


// const SECRET_KEY = "asdasdasd";

// const encryptData = (data) => {
//   return CryptoJS.AES.encrypt(JSON.stringify(data), SECRET_KEY).toString();
// };

// const decryptData = (encryptedData) => {
//   const bytes = CryptoJS.AES.decrypt(encryptedData, SECRET_KEY);
//   return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
// };

// export default function Dashboard() {
//   const router = useRouter();
//   const searchParams = useSearchParams();
//   const [isAuthenticated, setIsAuthenticated] = useState(false);
//   const [userData, setUserData] = useState(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const [pets, setPets] = useState([]);

//   useEffect(() => {
//     const authenticate = () => {
//       try {
//         // Get parameters from URL if they exist (for OAuth redirect)
//         const urlParams = new URLSearchParams(window.location.search);
//         const token = urlParams.get('token') || searchParams.get('token');
//         const userId = urlParams.get('user_id') || searchParams.get('user_id');
//         const user = urlParams.get('user') || searchParams.get('user');
//         const roles = urlParams.get('roles') || searchParams.get('roles');
  
//         // If coming from OAuth redirect, save to sessionStorage
//         if (token && userId && user) {
//           sessionStorage.setItem("auth_token", token);
//           sessionStorage.setItem("user_id", userId);
//           sessionStorage.setItem("user", user);
//           sessionStorage.setItem("roles", roles ? encryptData(roles) : encryptData("user"));
          
//           // Clean the URL
//           window.history.replaceState({}, '', window.location.pathname);
//         }
  
//         // Check sessionStorage for auth data
//         const storedToken = sessionStorage.getItem("auth_token");
//         const storedUserData = sessionStorage.getItem("user");
//         const storedUserId = sessionStorage.getItem("user_id");
//         const encryptedRoles = sessionStorage.getItem("roles");
  
//         if (!storedToken || !storedUserData || !storedUserId) {
//           throw new Error("Missing authentication data");
//         }
  
//         // Handle role-based routing
//         const storedRoles = decryptData(encryptedRoles);
//         if (storedRoles === "admin") {
//           router.push("/pet_status");  // Admins go to pet_status
//           return;
//         } else if (storedRoles === "user") {
//           setIsAuthenticated(true);  
  
//           // Fetch pet dashboard data
//           fetchPetDashboard(storedToken)
//             .then((data) => {
//               setUserData(data.user);   // Set the user data from response
//               setPets(data.pets || []);  // Set the pet data from response
//             })
//             .catch((error) => {
//               console.error("Dashboard load failed:", error);
//             });
  
//         } else {
//           throw new Error("Invalid role");
//         }
  
//       } catch (error) {
//         console.error("Authentication error:", error);
//         router.push("/login");
//       } finally {
//         setIsLoading(false);
//       }
//     };
  
//     authenticate();
//   }, [router, searchParams]);
  

//   if (isLoading) {
//     return <div>Loading...</div>;
//   }

//   if (!isAuthenticated) {
//     return null;
//   }

  
//   return (
//     <div className="min-h-screen bg-white">
//       {/* Add Navbar */}
//       <Navbar />

//       <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
//         <h1 className="text-3xl font-bold text-[#1A237E] mb-8">Dashboard</h1>

//         {/* Display user data if available */}
//         {userData && (
//           <div className="mb-8">
//             <p className="text-lg text-gray-700">
//               Welcome back, <span className="font-semibold">{userData.name}</span>!
//             </p>
//             <p className="text-sm text-gray-500">{userData.email}</p>
//           </div>
//         )}

//         <div className="grid md:grid-cols-3 gap-8">
//           {/* Pets Section */}
//           <div className="md:col-span-2">
//             <div className="flex justify-between items-center mb-6">
//               <h2 className="text-xl font-semibold text-[#1A237E]">Pets</h2>
//               <Link href="/pet_name">
//                 <button className="px-4 py-2 text-purple-700 border border-purple-700 rounded-full hover:bg-purple-50">
//                   Add a Pet
//                 </button>
//               </Link>
//             </div>

//             {/* Pet Cards DISPLAY IT HERE*/}
//             <div className="space-y-4 text-black">
//               {[
//                 {
//                   name: "Unknown Name",
//                   status: "Add photos to found report",
//                   image: "https://via.placeholder.com/100",
//                 },
//                 {
//                   name: "aaa",
//                   status: "Add photos to lost report",
//                   image: "https://via.placeholder.com/100",
//                 }
//               ].map((pet, index) => (
//                 <div
//                   key={index}
//                   className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md"
//                 >
//                   <div className="flex items-center space-x-4">
//                     <img
//                       src={pet.image}
//                       alt={pet.name}
//                       className="w-20 h-20 rounded-lg"
//                     />
//                     <div>
//                       <h3 className="font-semibold">{pet.name}</h3>
//                       <p className="text-sm text-gray-600">{pet.status}</p>
//                     </div>
//                   </div>
//                   <ChevronRight className="h-6 w-6 text-gray-400" />
//                 </div>
//               ))}
//             </div>
//           </div>

//           <div>
//       {isAuthenticated ? (
//         <>
//           <h1>Welcome, {userData?.name}</h1>
//           <h2>Your Pets</h2>
//           <ul>
//             {pets.length === 0 ? (
//               <li>No pets found</li>
//             ) : (
//               pets.map((pet) => (
//                 <li key={pet.id}>
//                   <strong>{pet.name}</strong> - {pet.type}, {pet.gender}, {pet.status}
//                   {pet.description && <p>{pet.description}</p>}
//                   {pet.address && <p>Address: {pet.address}</p>}
//                   {pet.image && <img src={`data:image/jpeg;base64,${pet.image}`} alt={pet.name} />}
//                 </li>
//               ))
//             )}
//           </ul>
//         </>
//       ) : (
//         <p>You are not authenticated. Please log in.</p>
//       )}
//     </div>

//           {/* Sidebar */}
//           <div className="space-y-8 text-black">
//             {/* Inbox */}
//             <div>
//               <h2 className="text-xl font-semibold text-[#1A237E] mb-4">Inbox</h2>
//               <Link
//                 href="/messages"
//                 className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md"
//               >
//                 <div className="flex items-center space-x-2">
//                   <MessageSquare className="h-5 w-5 text-gray-600" />
//                   <span>Messages</span>
//                 </div>
//                 <ChevronRight className="h-6 w-6 text-gray-400" />
//               </Link>
//             </div>

//             {/* Account Settings */}
//             <div>
//               <h2 className="text-xl font-semibold text-[#1A237E] mb-4">Account Settings</h2>
//               <div className="space-y-2">
//                 <Link
//                   href="/settings/personal"
//                   className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md"
//                 >
//                   <div className="flex items-center space-x-2">
//                     <User className="h-5 w-5 text-gray-600" />
//                     <span>Personal Information</span>
//                   </div>
//                   <ChevronRight className="h-6 w-6 text-gray-400" />
//                 </Link>
//               </div>
//             </div>
//           </div>
//         </div>
//       </main>

//       {/* Add Footer */}
//       <Footer />
//     </div>
//   );
// }



































//////////////////////////////////////WORKING CODE IN COMMENT
// //frontend\pages\pet_dashboard.js
// "use client";

// import { MessageSquare, User, ChevronRight } from "lucide-react";
// import Link from "next/link";
// import { useEffect, useState } from "react";
// import { useRouter, useSearchParams } from "next/navigation";
// import Navbar from "../components/Navbar";
// import Footer from "../components/Footer";
// import CryptoJS from "crypto-js";
// import { fetchPetDashboard } from "../utils/api";

// const SECRET_KEY = "asdasdasd";

// const encryptData = (data) => {
//   return CryptoJS.AES.encrypt(JSON.stringify(data), SECRET_KEY).toString();
// };

// const decryptData = (encryptedData) => {
//   const bytes = CryptoJS.AES.decrypt(encryptedData, SECRET_KEY);
//   return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
// };

// const getPetImageUrl = (imageName) => {
//   if (!imageName) return "https://via.placeholder.com/100";
//   return `http://localhost:8000/uploads/pet_images/${imageName}?t=${Date.now()}`;
// };

// export default function Dashboard() {
//   const router = useRouter();
//   const searchParams = useSearchParams();
//   const [isAuthenticated, setIsAuthenticated] = useState(false);
//   const [userData, setUserData] = useState(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const [pets, setPets] = useState([]);

//   const handlePetCardClick = (e) => {
//     // Find the closest card element (in case children are clicked)
//     const card = e.currentTarget;
    
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
//       image: card.dataset.image
//     };
  
//     // Navigate to pet profile page with the ID
//     router.push(`/pet_profile/${petData.id}`);
//   };

//   useEffect(() => {
//     const authenticate = () => {
//       try {
//         const urlParams = new URLSearchParams(window.location.search);
//         const token = urlParams.get('token') || searchParams.get('token');
//         const userId = urlParams.get('user_id') || searchParams.get('user_id');
//         const user = urlParams.get('user') || searchParams.get('user');
//         const roles = urlParams.get('roles') || searchParams.get('roles');
  
//         if (token && userId && user) {
//           sessionStorage.setItem("auth_token", token);
//           sessionStorage.setItem("user_id", userId);
//           sessionStorage.setItem("user", user);
//           sessionStorage.setItem("roles", roles ? encryptData(roles) : encryptData("user"));
//           window.history.replaceState({}, '', window.location.pathname);
//         }
  
//         const storedToken = sessionStorage.getItem("auth_token");
//         const storedUserData = sessionStorage.getItem("user");
//         const storedUserId = sessionStorage.getItem("user_id");
//         const encryptedRoles = sessionStorage.getItem("roles");
  
//         if (!storedToken || !storedUserData || !storedUserId) {
//           throw new Error("Missing authentication data");
//         }
  
//         const storedRoles = decryptData(encryptedRoles);
//         if (storedRoles === "admin") {
//           router.push("/admin_dashboard");
//           return;
//         } else if (storedRoles === "user") {
//           setIsAuthenticated(true);  
//           fetchPetDashboard(storedToken)
//             .then((data) => {
//               setUserData(data.user);
//               setPets(data.pets || []);
//             })
//             .catch((error) => {
//               console.error("Dashboard load failed:", error);
//             });
//         } else {
//           throw new Error("Invalid role");
//         }
//       } catch (error) {
//         console.error("Authentication error:", error);
//         router.push("/login");
//       } finally {
//         setIsLoading(false);
//       }
//     };
  
//     authenticate();
//   }, [router, searchParams]);

//   if (isLoading) {
//     return <div className="flex justify-center items-center h-screen">Loading...</div>;
//   }

//   if (!isAuthenticated) {
//     return null;
//   }

"use client";

import { MessageSquare, User, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { fetchPetDashboard } from "../utils/api";
import { encryptData, decryptData, getDecryptedUserId } from "../utils/auth";

const getPetImageUrl = (imageName) => {
  if (!imageName) return "https://via.placeholder.com/100";
  return `http://localhost:8000/uploads/pet_images/${imageName}?t=${Date.now()}`;
};

export default function Dashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pets, setPets] = useState([]);

  const handlePetCardClick = (e) => {
    const card = e.currentTarget;
    const petData = {
      id: card.dataset.id,
      name: card.dataset.name,
      type: card.dataset.type,
      gender: card.dataset.gender,
      description: card.dataset.description,
      date: card.dataset.date,
      address: card.dataset.address,
      status: card.dataset.status,
      image: card.dataset.image
    };
    router.push(`/pet_profile/${petData.id}`);
  };

useEffect(() => {
  const authenticate = async () => {
    try {
      const token = sessionStorage.getItem("auth_token");
      const encryptedUserId = sessionStorage.getItem("user_id");
      
      if (!token || !encryptedUserId) {
        throw new Error("Missing authentication data");
      }

      // Decrypt user ID
      const userId = decryptData(encryptedUserId);
      if (!userId) {
        throw new Error("Invalid user ID");
      }

      // Fetch dashboard data
      const data = await fetchPetDashboard(token);
      console.log("Dashboard data:", data);
      
      setUserData(JSON.parse(sessionStorage.getItem("user")));
      setPets(data.pets || []);
      setIsAuthenticated(true);

    } catch (error) {
      console.error("Authentication error:", error);
      router.push("/login");
    } finally {
      setIsLoading(false);
    }
  };

  authenticate();
}, [router]);

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (!isAuthenticated) {
    return null;
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
                src={getPetImageUrl(pet.image)} 
                alt={pet.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.onerror = null; 
                  e.target.src = "https://via.placeholder.com/100";
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
  );
}
