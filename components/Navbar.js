"use client";

import Link from "next/link";
import { useRouter } from "next/router";
import { Bell, MessageSquare, User, Menu, X } from "react-feather";
import { useState, useEffect } from "react";
import CryptoJS from "crypto-js";
import { useSearchParams } from "next/navigation";
import { markAllNotificationsAsRead, getUserNotifications } from '../utils/api';

const SECRET_KEY = "asdasdasd";

const encryptData = (data) => {
  return CryptoJS.AES.encrypt(JSON.stringify(data), SECRET_KEY).toString();
};

const decryptData = (encryptedData) => {
  const bytes = CryptoJS.AES.decrypt(encryptedData, SECRET_KEY);
  return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
};

export default function Navbar() {
    const router = useRouter();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false);
    const [hasUnreadMessages, setHasUnreadMessages] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userData, setUserData] = useState(null);
    const [userRole, setUserRole] = useState(null);
    const searchParams = useSearchParams();
    const [notifications, setNotifications] = useState([]);
    const [loadingNotifications, setLoadingNotifications] = useState(false);

    // Fetch notifications
    const fetchNotifications = async () => {
      try {
        setLoadingNotifications(true);
        const token = sessionStorage.getItem("auth_token");
        const userId = sessionStorage.getItem("user_id");
        
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "https://newback-production-a0cc.up.railway.app"}/api/notifications/user/${userId}`,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        
        const data = await response.json();
        setNotifications(data?.notifications || []);
        setHasUnreadNotifications(data?.notifications?.some(n => !n.is_read));
      } catch (error) {
        console.error("Error fetching notifications:", error);
      } finally {
        setLoadingNotifications(false);
      }
    };

    // Authentication check
    useEffect(() => {
      try {
        const token = searchParams.get("token");
        const userId = searchParams.get("user_id");
        const user = searchParams.get("user");
        const roles = searchParams.get("roles");
  
        if (token && userId && user && roles) {
          sessionStorage.setItem("auth_token", token);
          sessionStorage.setItem("user_id", userId);
          sessionStorage.setItem("user", user);
          sessionStorage.setItem("roles", encryptData(roles));
          setUserRole(roles);
        }
  
        const storedToken = sessionStorage.getItem("auth_token");
        const storedUserData = sessionStorage.getItem("user");
        const storedUserId = sessionStorage.getItem("user_id");
        const encryptedRoles = sessionStorage.getItem("roles");
  
        if (!storedToken || !storedUserData || !storedUserId || !encryptedRoles) {
          setIsAuthenticated(false);
          router.push("/login");
          return;
        }
  
        const storedRoles = decryptData(encryptedRoles);
        setUserRole(storedRoles);
  
        if (storedRoles === "user" || storedRoles === "admin") {
          setIsAuthenticated(true);
          setUserData(JSON.parse(storedUserData));
          fetchNotifications();
        } else {
          setIsAuthenticated(false);
          router.push("/login");
        }
      } catch (error) {
        console.error("Authentication error:", error);
        setIsAuthenticated(false);
        router.push("/login");
      }
    }, [router, searchParams]);

    if (!isAuthenticated) return null;

    // Close dropdowns when clicking outside
    useEffect(() => {
      const handleClickOutside = () => {
        setIsDropdownOpen(false);
        setIsNotificationsOpen(false);
      };
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    const handleLogout = () => {
      sessionStorage.clear();
      localStorage.clear();
      setIsAuthenticated(false);
      router.push("/login");
    };

    return (
        <div className="bg-white sticky top-0 z-50">
            {/* Top Bar - Mobile Only */}
            <div className="md:hidden flex justify-between items-center px-4 py-3 border-b">
                <Link href="/">
                    <img src="/logo.png" alt="Logo" className="h-10" />
                </Link>
                <button 
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className="p-2 text-gray-600 hover:text-purple-700"
                >
                    {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Main Navigation */}
            <nav className="border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <div className="flex justify-between items-center py-4">
                        {/* Logo - Desktop */}
                        <div className="hidden md:flex items-center">
                            <Link href="/">
                                <img src="/logo.png" alt="Logo" className="h-16" />
                            </Link>
                        </div>

                        {/* Mobile Menu */}
                        <div className={`md:hidden fixed inset-0 bg-white z-40 transform ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out pt-16 px-4`}>
                            <div className="flex flex-col space-y-4 py-4">
                                <Link href="/lost-pet-tips" className="text-gray-700 hover:text-purple-700 py-2 border-b">
                                    Lost Pet Tips
                                </Link>
                                <Link href="/found-pet-tips" className="text-gray-700 hover:text-purple-700 py-2 border-b">
                                    Found Pet Tips
                                </Link>
                                <Link href="/how-to-help" className="text-gray-700 hover:text-purple-700 py-2 border-b">
                                    How to Help
                                </Link>
                                <Link href="/about" className="text-gray-700 hover:text-purple-700 py-2 border-b">
                                    About
                                </Link>
                            </div>
                        </div>

                        {/* Navigation Links - Desktop */}
                        <div className="hidden md:flex items-center space-x-8">
                            <Link href="/lost-pet-tips" className="text-gray-700 hover:text-purple-700">
                                Lost Pet Tips
                            </Link>
                            <Link href="/found-pet-tips" className="text-gray-700 hover:text-purple-700">
                                Found Pet Tips
                            </Link>
                            <Link href="/how-to-help" className="text-gray-700 hover:text-purple-700">
                                How to Help
                            </Link>
                            <Link href="/about" className="text-gray-700 hover:text-purple-700">
                                About
                            </Link>
                        </div>

                        {/* Icons */}
                        <div className="flex items-center space-x-4 md:space-x-6">
                            {/* Notification Icon */}
                            <div className="relative">
                                <button 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setIsNotificationsOpen(!isNotificationsOpen);
                                        fetchNotifications();
                                    }}
                                    className="p-1 relative"
                                >
                                    <Bell className="h-6 w-6 text-gray-600 hover:text-purple-700" />
                                    {hasUnreadNotifications && (
                                        <span className="absolute top-0 right-0">
                                            <span className="relative flex h-3 w-3">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                                            </span>
                                        </span>
                                    )}
                                </button>

                                {/* Notification Dropdown */}
                                {isNotificationsOpen && (
                                    <div 
                                        className="fixed md:absolute inset-0 md:inset-auto md:right-0 md:top-12 md:mt-2 w-full md:w-96 bg-white border border-gray-200 shadow-xl z-50 md:rounded-lg"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <div className="p-4 border-b flex justify-between items-center bg-gray-50">
                                            <h3 className="font-medium">Notifications</h3>
                                            <div className="flex space-x-3">
                                                <button 
                                                    onClick={() => markAllNotificationsAsRead()}
                                                    className="text-sm text-purple-600"
                                                >
                                                    Mark All Read
                                                </button>
                                                <button 
                                                    onClick={() => setIsNotificationsOpen(false)}
                                                    className="text-sm text-gray-500"
                                                >
                                                    Close
                                                </button>
                                            </div>
                                        </div>
                                        <div className="max-h-[60vh] overflow-y-auto">
                                            {loadingNotifications ? (
                                                <div className="p-6 text-center">
                                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
                                                </div>
                                            ) : notifications.length > 0 ? (
                                                notifications.map(notification => (
                                                    <div 
                                                        key={notification.id} 
                                                        className={`p-4 border-b ${!notification.is_read ? 'bg-blue-50' : ''}`}
                                                    >
                                                        <p className="font-medium">{notification.title}</p>
                                                        <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="p-6 text-center text-gray-500">
                                                    No notifications
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Messages Icon */}
                            <Link 
                                href="/conversations" 
                                className="p-1 relative"
                            >
                                <MessageSquare className="h-6 w-6 text-gray-600 hover:text-purple-700" />
                                {hasUnreadMessages && (
                                    <span className="absolute top-0 right-0">
                                        <span className="relative flex h-3 w-3">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                                        </span>
                                    </span>
                                )}
                            </Link>

                            {/* User Dropdown */}
                            <div className="relative">
                                <button 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setIsDropdownOpen(!isDropdownOpen);
                                    }}
                                    className="p-1"
                                >
                                    <User className="h-6 w-6 text-gray-600 hover:text-purple-700" />
                                </button>
                                {isDropdownOpen && (
                                    <div 
                                        className="fixed md:absolute inset-0 md:inset-auto md:right-0 md:top-12 bg-white border border-gray-200 shadow-xl z-50 md:rounded-lg md:w-56"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <div className="p-4 border-b">
                                            <p className="font-semibold">{userData?.name}</p>
                                            <p className="text-xs text-gray-500">{userData?.email}</p>
                                        </div>
                                        <div className="p-2">
                                            <Link
                                                href="/pet_dashboard"
                                                className="block px-4 py-2 text-sm hover:bg-gray-100"
                                                onClick={() => setIsDropdownOpen(false)}
                                            >
                                                Pet Dashboard
                                            </Link>
                                            <Link
                                                href="/settings"
                                                className="block px-4 py-2 text-sm hover:bg-gray-100"
                                                onClick={() => setIsDropdownOpen(false)}
                                            >
                                                Settings
                                            </Link>
                                            <button
                                                onClick={handleLogout}
                                                className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                                            >
                                                Logout
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </nav>
        </div>
    );
}






















// "use client";

// import Link from "next/link";
// import { useRouter } from "next/router";
// import { Bell, MessageSquare, User } from "react-feather";
// import { useState, useEffect } from "react";
// import CryptoJS from "crypto-js";
// import { useSearchParams } from "next/navigation";
// import { markAllNotificationsAsRead, getUserNotifications } from '../utils/api';  // Add this import

// const SECRET_KEY = "asdasdasd";

// const encryptData = (data) => {
//   return CryptoJS.AES.encrypt(JSON.stringify(data), SECRET_KEY).toString();
// };

// const decryptData = (encryptedData) => {
//   const bytes = CryptoJS.AES.decrypt(encryptedData, SECRET_KEY);
//   return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
// };

// const markNotificationAsRead = async (token, notificationId) => {
//   const response = await fetch(
//     `${process.env.NEXT_PUBLIC_API_URL || "https://newback-production-a0cc.up.railway.app"}/api/notifications/${notificationId}/read`,
//     {
//       method: 'PATCH',
//       headers: {
//         'Authorization': `Bearer ${token}`,
//         'Content-Type': 'application/json'
//       }
//     }
//   );
  
//   if (!response.ok) {
//     const errorData = await response.json();
//     throw new Error(errorData.detail || 'Failed to mark notification as read');
//   }
  
//   return await response.json();
// };

// export default function Navbar() {
//     const router = useRouter();
//     const [isDropdownOpen, setIsDropdownOpen] = useState(false);
//     const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
//     const [hasNewMessages, setHasNewMessages] = useState(false);
//     const [isAuthenticated, setIsAuthenticated] = useState(false);
//     const [userData, setUserData] = useState(null);
//     const [userRole, setUserRole] = useState(null);
//     const searchParams = useSearchParams();
//     const [unreadCount, setUnreadCount] = useState(0);
//     const [notifications, setNotifications] = useState([]);
//     const [loadingNotifications, setLoadingNotifications] = useState(false);
//     const [notificationError, setNotificationError] = useState(null);

//     const fetchNotifications = async () => {
//   try {
//     setLoadingNotifications(true);
//     setNotificationError(null);
    
//     const token = sessionStorage.getItem("auth_token");
//     const userId = sessionStorage.getItem("user_id");
    
//     if (!token || !userId) {
//       throw new Error("Authentication required");
//     }

//     // Fetch recent notifications first
//     const notifResponse = await fetch(
//       `${process.env.NEXT_PUBLIC_API_URL || "https://newback-production-a0cc.up.railway.app"}/api/notifications/user/${userId}`,
//       {
//         headers: {
//           'Authorization': `Bearer ${token}`
//         }
//       }
//     );
    
//     if (!notifResponse.ok) {
//       // Try to get the actual error message from the response
//       const errorData = await notifResponse.json().catch(() => ({}));
//       const errorMessage = errorData.detail || "Failed to fetch notifications";
//       console.error("Backend error:", errorMessage);
//       throw new Error(errorMessage);
//     }
    
//     const notifData = await notifResponse.json();
//     setNotifications(notifData?.notifications || []);
    
//     // Only fetch unread count if notifications were successful
//     const countResponse = await fetch(
//       `${process.env.NEXT_PUBLIC_API_URL || "https://newback-production-a0cc.up.railway.app"}/api/notifications/unread-count/${userId}`,
//       {
//         headers: {
//           'Authorization': `Bearer ${token}`
//         }
//       }
//     );
    
//     if (!countResponse.ok) {
//       console.warn("Failed to fetch notification count (non-critical)");
//     } else {
//       const countData = await countResponse.json();
//       setUnreadCount(countData?.unread_count || 0);
//     }
    
//   } catch (error) {
//     console.error("Error in fetchNotifications:", error);
//     setNotificationError(error.message);
//     setUnreadCount(0);
//     setNotifications([]);
//   } finally {
//     setLoadingNotifications(false);
//   }
// };

//     useEffect(() => {
//        try {
//          const token = searchParams.get("token");
//          const userId = searchParams.get("user_id");
//          const user = searchParams.get("user");
//          const roles = searchParams.get("roles");
   
//          if (token && userId && user && roles) {
//            sessionStorage.setItem("auth_token", token);
//            sessionStorage.setItem("user_id", userId);
//            sessionStorage.setItem("user", user);
//            sessionStorage.setItem("roles", encryptData(roles));
//            setUserRole(roles);
//          }
   
//          const storedToken = sessionStorage.getItem("auth_token");
//          const storedUserData = sessionStorage.getItem("user");
//          const storedUserId = sessionStorage.getItem("user_id");
//          const encryptedRoles = sessionStorage.getItem("roles");
   
//          if (!storedToken || !storedUserData || !storedUserId || !encryptedRoles) {
//            setIsAuthenticated(false);
//            router.push("/login");
//            return;
//          }
   
//          const storedRoles = decryptData(encryptedRoles);
//          setUserRole(storedRoles);
   
//          if (storedRoles === "user" || storedRoles === "admin") {
//            setIsAuthenticated(true);
//            setUserData(JSON.parse(storedUserData));
//            fetchNotifications();
//          } else {
//            setIsAuthenticated(false);
//            router.push("/login");
//          }
//        } catch (error) {
//          console.error("Error during authentication check:", error);
//          setIsAuthenticated(false);
//          router.push("/login");
//        }
//      }, [router, searchParams]);
   
//     if (!isAuthenticated) {
//         return null;
//     }

//     const toggleDropdown = (e) => {
//         if (e) e.stopPropagation();
//         setIsDropdownOpen(!isDropdownOpen);
//     };

//     const toggleNotifications = (e) => {
//         if (e) e.stopPropagation();
//         setIsNotificationsOpen(!isNotificationsOpen);
//         if (!isNotificationsOpen) {
//           fetchNotifications();
//         }
//     };

//     const handleDashboardNavigation = (e) => {
//         e.preventDefault();
//         const dashboardUrl = userRole === "admin" ? "/admin_dashboard" : "/admin_dashboard";
//         router.push(dashboardUrl);
//     };

//     const handleLogout = () => {
//         sessionStorage.removeItem("auth_token");
//         sessionStorage.removeItem("user_id");
//         sessionStorage.removeItem("roles");
//         sessionStorage.removeItem("user");

//         localStorage.clear();
//         sessionStorage.clear();

//         setIsAuthenticated(false);
//         router.push("/login");
//     };

//     const formatNotificationDate = (dateString) => {
//       try {
//         if (!dateString) return "Just now";
//         const date = new Date(dateString);
//         return date.toLocaleString();
//       } catch {
//         return "Just now";
//       }
//     };

//     const markAsRead = async (notificationId) => {
//         try {
//           const token = sessionStorage.getItem('auth_token');
//           if (!token) {
//             throw new Error('Authentication token not found');
//           }
      
//           await markNotificationAsRead(token, notificationId);
          
//           // Update local state
//           setNotifications(prevNotifications => 
//             prevNotifications.map(notif => 
//               notif.id === notificationId ? { ...notif, is_read: true } : notif
//             )
//           );
          
//           // Update unread count
//           setUnreadCount(prev => Math.max(0, prev - 1));
          
//         } catch (error) {
//           console.error('Error marking notification as read:', error);
//           throw error;
//         }
//       };
    
//       // components/Navbar.js
//       const markAllAsRead = async () => {
//         try {
//           const token = sessionStorage.getItem('auth_token');
//           const userId = sessionStorage.getItem('user_id');
          
//           await markAllNotificationsAsRead(token, userId);
          
//           // Update UI
//           setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
//           setUnreadCount(0);
          
//         } catch (error) {
//           console.error('Mark all failed:', error);
//           alert(error.message);
//         }
//       };

//     return (
//         <div className="bg-white">
//             {/* Top Navigation */}
//             <div className="border-b">
//                 <div className="max-w-7xl mx-auto px-4 sm:px-6">
//                     <div className="flex justify-center items-center py-2 text-sm text-gray-600">
//                         <div className="flex items-center space-x-4">
//                             <Link href="/">Smartpet Love</Link>
//                             <span>|</span>
//                             <Link href="/adopt">Smartpet Love Adopt</Link>
//                             <span>|</span>
//                             <Link href="/care">Smartpet Love Care</Link>
//                         </div>
//                     </div>
//                 </div>
//             </div>

//             {/* Main Navigation */}
//             <nav className="border-b">
//                 <div className="max-w-7xl mx-auto px-4 sm:px-6">
//                     <div className="flex justify-between items-center py-4">
//                         {/* Logo */}
//                         <div className="flex items-center">
//                             <img
//                                 src="/logo.png"
//                                 alt="Smartpet Love Lost"
//                                 className="h-19 w-auto"
//                             />
//                         </div>

//                         {/* Navigation Links */}
//                         <div className="hidden md:flex items-center space-x-8">
//                             <Link href="/lost-pet-tips" className="text-gray-700 hover:text-purple-700">
//                                 Lost Pet Tips
//                             </Link>
//                             <Link href="/found-pet-tips" className="text-gray-700 hover:text-purple-700">
//                                 Found Pet Tips
//                             </Link>
//                             <Link href="/how-to-help" className="text-gray-700 hover:text-purple-700">
//                                 How to Help
//                             </Link>
//                             <Link href="/about" className="text-gray-700 hover:text-purple-700">
//                                 About
//                             </Link>
//                         </div>

//                         {/* Icons */}
//                         <div className="flex items-center space-x-4 relative">
//                             {/* Notification Icon with Dropdown */}
//                             <div className="relative">
//                                 <div className="flex items-center">
//                                     <Bell 
//                                         className="h-6 w-6 text-gray-600 cursor-pointer hover:text-purple-700" 
//                                         onClick={toggleNotifications}
//                                     />
//                                     {unreadCount > 0 && (
//                                         <span className="ml-1 h-5 w-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center">
//                                             {unreadCount}
//                                         </span>
//                                     )}
//                                 </div>
//                                 {isNotificationsOpen && (
//                                     <div 
//                                         className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50"
//                                         onClick={(e) => e.stopPropagation()}
//                                     >
//                                         <div className="p-3 border-b flex justify-between items-center">
//                                             <h3 className="font-medium text-sm">Notifications</h3>
//                                             <div className="flex space-x-2">
//                                                 <button 
//                                                     onClick={async (e) => {
//                                                         e.stopPropagation();
//                                                         try {
//                                                             await markAllAsRead();
//                                                         } catch (error) {
//                                                             alert(error.message);
//                                                         }
//                                                     }}
//                                                     className="text-xs text-blue-500 hover:text-blue-700"
//                                                 >
//                                                     Mark All Read
//                                                 </button>
//                                                 <button 
//                                                     onClick={() => setIsNotificationsOpen(false)}
//                                                     className="text-xs text-gray-500 hover:text-gray-700"
//                                                 >
//                                                     Close
//                                                 </button>
//                                             </div>
//                                         </div>
//                                         <div className="max-h-60 overflow-y-auto">
//                                             {loadingNotifications ? (
//                                                 <div className="p-4 text-center">
//                                                     <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-700 mx-auto"></div>
//                                                 </div>
//                                             ) : notificationError ? (
//                                                 <div className="p-3 text-center text-sm text-red-500">
//                                                     {notificationError}
//                                                 </div>
//                                             ) : notifications?.length > 0 ? (
//                                                 notifications.map((notification) => (
//                                                     <div 
//                                                         key={notification?.id} 
//                                                         className={`p-3 border-b ${!notification?.is_read ? 'bg-blue-50' : ''}`}
//                                                     >
//                                                         <div className="flex justify-between">
//                                                             <div>
//                                                                 <p className="font-medium text-sm">{notification?.title || "Notification"}</p>
//                                                                 <p className="text-xs text-gray-600">{notification?.message || ""}</p>
//                                                                 <p className="text-xs text-gray-400 mt-1">
//                                                                     {formatNotificationDate(notification?.created_at)}
//                                                                 </p>
//                                                             </div>
//                                                             {!notification?.is_read && (
//                                                                 <button
//                                                                     onClick={async (e) => {
//                                                                         e.stopPropagation();
//                                                                         try {
//                                                                             await markAsRead(notification.id);
//                                                                         } catch (error) {
//                                                                             alert(error.message);
//                                                                         }
//                                                                     }}
//                                                                     className="text-xs text-blue-500 hover:text-blue-700 ml-2 whitespace-nowrap"
//                                                                 >
//                                                                     Mark Read
//                                                                 </button>
//                                                             )}
//                                                         </div>
//                                                     </div>
//                                                 ))
//                                             ) : (
//                                                 <div className="p-3 text-center text-sm text-gray-500">
//                                                     No notifications
//                                                 </div>
//                                             )}
//                                         </div>
//                                         <div className="p-2 border-t text-center">
//                                             <Link 
//                                                 href="/notifications" 
//                                                 className="text-xs text-blue-500 hover:underline"
//                                                 onClick={() => setIsNotificationsOpen(false)}
//                                             >
//                                                 View All
//                                             </Link>
//                                         </div>
//                                     </div>
//                                 )}
//                             </div>

                            

// {/* Message Icon with Unread Count */}
// <div className="relative">
//   <MessageSquare 
//     className="h-6 w-6 text-gray-600 cursor-pointer hover:text-purple-700 transition-colors duration-200" 
//     onClick={() => router.push('/conversations')}
//   />
//   {unreadCount > 0 && (
//     <span className="absolute -top-2 -right-2 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
//       <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
//     </span>
//   )}
// </div>





                            

//                             {/* User Icon with Dropdown */}
//                             <div className="relative">
//                                 <User
//                                     className="h-6 w-6 text-gray-600 cursor-pointer hover:text-purple-700"
//                                     onClick={toggleDropdown}
//                                 />
//                                 {isDropdownOpen && (
//                                     <div 
//                                         className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50"
//                                         onClick={(e) => e.stopPropagation()}
//                                     >
//                                         {/* Display User Info */}
//                                         <div className="p-4">
//                                             <p className="text-sm font-semibold">
//                                                 {userData?.name || "User"}
//                                             </p>
//                                             <p className="text-xs text-gray-500">
//                                                 {userData?.email || ""}
//                                             </p>
//                                         </div>
//                                         <hr />
//                                         <Link
//                                             href="/pet_dashboard"
//                                             className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
//                                             onClick={(e) => {
//                                                 e.stopPropagation();
//                                                 setIsDropdownOpen(false);
//                                             }}
//                                         >
//                                             Pet Dashboard
//                                         </Link>
//                                         <Link
//                                             href="/settings/account_information"
//                                             className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
//                                             onClick={(e) => {
//                                                 e.stopPropagation();
//                                                 setIsDropdownOpen(false);
//                                             }}
//                                         >
//                                             Account Settings
//                                         </Link>
//                                         <Link
//                                             href="/adoption_application"
//                                             className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
//                                             onClick={(e) => {
//                                                 e.stopPropagation();
//                                                 setIsDropdownOpen(false);
//                                             }}
//                                         >
//                                             Adoption Form
//                                         </Link>
//                                         <Link
//                                             href="/rehome_pets"
//                                             className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
//                                             onClick={(e) => {
//                                                 e.stopPropagation();
//                                                 setIsDropdownOpen(false);
//                                             }}
//                                         >
//                                              Rehome Pets
//                                         </Link>
//                                                                                 <Link
//                                             href="/adopted_pets"
//                                             className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
//                                             onClick={(e) => {
//                                                 e.stopPropagation();
//                                                 setIsDropdownOpen(false);
//                                             }}
//                                         >
//                                              Adopted Pets
//                                         </Link>
//                                         {/* <a
// // href={userRole === "user" ? "/pet_dashboard" : "/pet_dashboard"}      
// href="pet_dashboard"
//                                       className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
//                                             onClick={(e) => {
//                                                 e.preventDefault();
//                                                 handleDashboardNavigation(e);
//                                                 setIsDropdownOpen(false);
//                                             }}
//                                         >
//                                             Pet Dashboard
//                                         </a> */}
//                                         <button
//                                             className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
//                                             onClick={(e) => {
//                                                 e.stopPropagation();
//                                                 handleLogout();
//                                             }}
//                                         >
//                                             Logout
//                                         </button>
//                                     </div>
//                                 )}
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             </nav>
//         </div>
//     );
// }



// // "use client";

// // import Link from "next/link";
// // import { useRouter } from "next/router";
// // import { Bell, MessageSquare, User } from "react-feather";
// // import { useState, useEffect } from "react";
// // import CryptoJS from "crypto-js";
// // import { useSearchParams } from "next/navigation";
// // import { markAllNotificationsAsRead, getUserNotifications } from '../utils/api';  // Add this import

// // const SECRET_KEY = "asdasdasd";

// // const encryptData = (data) => {
// //   return CryptoJS.AES.encrypt(JSON.stringify(data), SECRET_KEY).toString();
// // };

// // const decryptData = (encryptedData) => {
// //   const bytes = CryptoJS.AES.decrypt(encryptedData, SECRET_KEY);
// //   return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
// // };

// // const markNotificationAsRead = async (token, notificationId) => {
// //   const response = await fetch(
// //     `${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"}/api/notifications/${notificationId}/read`,
// //     {
// //       method: 'PATCH',
// //       headers: {
// //         'Authorization': `Bearer ${token}`,
// //         'Content-Type': 'application/json'
// //       }
// //     }
// //   );
  
// //   if (!response.ok) {
// //     const errorData = await response.json();
// //     throw new Error(errorData.detail || 'Failed to mark notification as read');
// //   }
  
// //   return await response.json();
// // };

// // export default function Navbar() {
// //     const router = useRouter();
// //     const [isDropdownOpen, setIsDropdownOpen] = useState(false);
// //     const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
// //     const [hasNewMessages, setHasNewMessages] = useState(false);
// //     const [isAuthenticated, setIsAuthenticated] = useState(false);
// //     const [userData, setUserData] = useState(null);
// //     const [userRole, setUserRole] = useState(null);
// //     const searchParams = useSearchParams();
// //     const [unreadCount, setUnreadCount] = useState(0);
// //     const [notifications, setNotifications] = useState([]);
// //     const [loadingNotifications, setLoadingNotifications] = useState(false);
// //     const [notificationError, setNotificationError] = useState(null);

// //     const fetchNotifications = async () => {
// //   try {
// //     setLoadingNotifications(true);
// //     setNotificationError(null);
    
// //     const token = sessionStorage.getItem("auth_token");
// //     const userId = sessionStorage.getItem("user_id");
    
// //     if (!token || !userId) {
// //       throw new Error("Authentication required");
// //     }

// //     // Fetch recent notifications first
// //     const notifResponse = await fetch(
// //       `${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"}/api/notifications/user/${userId}`,
// //       {
// //         headers: {
// //           'Authorization': `Bearer ${token}`
// //         }
// //       }
// //     );
    
// //     if (!notifResponse.ok) {
// //       // Try to get the actual error message from the response
// //       const errorData = await notifResponse.json().catch(() => ({}));
// //       const errorMessage = errorData.detail || "Failed to fetch notifications";
// //       console.error("Backend error:", errorMessage);
// //       throw new Error(errorMessage);
// //     }
    
// //     const notifData = await notifResponse.json();
// //     setNotifications(notifData?.notifications || []);
    
// //     // Only fetch unread count if notifications were successful
// //     const countResponse = await fetch(
// //       `${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"}/api/notifications/unread-count/${userId}`,
// //       {
// //         headers: {
// //           'Authorization': `Bearer ${token}`
// //         }
// //       }
// //     );
    
// //     if (!countResponse.ok) {
// //       console.warn("Failed to fetch notification count (non-critical)");
// //     } else {
// //       const countData = await countResponse.json();
// //       setUnreadCount(countData?.unread_count || 0);
// //     }
    
// //   } catch (error) {
// //     console.error("Error in fetchNotifications:", error);
// //     setNotificationError(error.message);
// //     setUnreadCount(0);
// //     setNotifications([]);
// //   } finally {
// //     setLoadingNotifications(false);
// //   }
// // };

// //     useEffect(() => {
// //        try {
// //          const token = searchParams.get("token");
// //          const userId = searchParams.get("user_id");
// //          const user = searchParams.get("user");
// //          const roles = searchParams.get("roles");
   
// //          if (token && userId && user && roles) {
// //            sessionStorage.setItem("auth_token", token);
// //            sessionStorage.setItem("user_id", userId);
// //            sessionStorage.setItem("user", user);
// //            sessionStorage.setItem("roles", encryptData(roles));
// //            setUserRole(roles);
// //          }
   
// //          const storedToken = sessionStorage.getItem("auth_token");
// //          const storedUserData = sessionStorage.getItem("user");
// //          const storedUserId = sessionStorage.getItem("user_id");
// //          const encryptedRoles = sessionStorage.getItem("roles");
   
// //          if (!storedToken || !storedUserData || !storedUserId || !encryptedRoles) {
// //            setIsAuthenticated(false);
// //            router.push("/login");
// //            return;
// //          }
   
// //          const storedRoles = decryptData(encryptedRoles);
// //          setUserRole(storedRoles);
   
// //          if (storedRoles === "user" || storedRoles === "admin") {
// //            setIsAuthenticated(true);
// //            setUserData(JSON.parse(storedUserData));
// //            fetchNotifications();
// //          } else {
// //            setIsAuthenticated(false);
// //            router.push("/login");
// //          }
// //        } catch (error) {
// //          console.error("Error during authentication check:", error);
// //          setIsAuthenticated(false);
// //          router.push("/login");
// //        }
// //      }, [router, searchParams]);
   
// //     if (!isAuthenticated) {
// //         return null;
// //     }

// //     const toggleDropdown = (e) => {
// //         if (e) e.stopPropagation();
// //         setIsDropdownOpen(!isDropdownOpen);
// //     };

// //     const toggleNotifications = (e) => {
// //         if (e) e.stopPropagation();
// //         setIsNotificationsOpen(!isNotificationsOpen);
// //         if (!isNotificationsOpen) {
// //           fetchNotifications();
// //         }
// //     };

// //     const handleDashboardNavigation = (e) => {
// //         e.preventDefault();
// //         const dashboardUrl = userRole === "admin" ? "/admin_dashboard" : "/admin_dashboard";
// //         router.push(dashboardUrl);
// //     };

// //     const handleLogout = () => {
// //         sessionStorage.removeItem("auth_token");
// //         sessionStorage.removeItem("user_id");
// //         sessionStorage.removeItem("roles");
// //         sessionStorage.removeItem("user");

// //         localStorage.clear();
// //         sessionStorage.clear();

// //         setIsAuthenticated(false);
// //         router.push("/login");
// //     };

// //     const formatNotificationDate = (dateString) => {
// //       try {
// //         if (!dateString) return "Just now";
// //         const date = new Date(dateString);
// //         return date.toLocaleString();
// //       } catch {
// //         return "Just now";
// //       }
// //     };

// //     const markAsRead = async (notificationId) => {
// //         try {
// //           const token = sessionStorage.getItem('auth_token');
// //           if (!token) {
// //             throw new Error('Authentication token not found');
// //           }
      
// //           await markNotificationAsRead(token, notificationId);
          
// //           // Update local state
// //           setNotifications(prevNotifications => 
// //             prevNotifications.map(notif => 
// //               notif.id === notificationId ? { ...notif, is_read: true } : notif
// //             )
// //           );
          
// //           // Update unread count
// //           setUnreadCount(prev => Math.max(0, prev - 1));
          
// //         } catch (error) {
// //           console.error('Error marking notification as read:', error);
// //           throw error;
// //         }
// //       };
    
// //       // components/Navbar.js
// //       const markAllAsRead = async () => {
// //         try {
// //           const token = sessionStorage.getItem('auth_token');
// //           const userId = sessionStorage.getItem('user_id');
          
// //           await markAllNotificationsAsRead(token, userId);
          
// //           // Update UI
// //           setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
// //           setUnreadCount(0);
          
// //         } catch (error) {
// //           console.error('Mark all failed:', error);
// //           alert(error.message);
// //         }
// //       };

   
// //     return (
// //         <div className="bg-white">
// //             {/* Top Navigation */}
// //             <div className="border-b">
// //                 <div className="max-w-7xl mx-auto px-4 sm:px-6">
// //                     <div className="flex justify-center items-center py-2 text-sm text-gray-600">
// //                         <div className="flex items-center space-x-4">
// //                             <Link href="/">Smartpet Love</Link>
// //                             <span>|</span>
// //                             <Link href="/adopt">Smartpet Love Adopt</Link>
// //                             <span>|</span>
// //                             <Link href="/care">Smartpet Love Care</Link>
// //                         </div>
// //                     </div>
// //                 </div>
// //             </div>

// //             {/* Main Navigation */}
// //             <nav className="border-b">
// //                 <div className="max-w-7xl mx-auto px-4 sm:px-6">
// //                     <div className="flex justify-between items-center py-4">
// //                         {/* Logo */}
// //                         <div className="flex items-center">
// //                             <img
// //                                 src="/logo.png"
// //                                 alt="Smartpet Love Lost"
// //                                 className="h-19 w-auto"
// //                             />
// //                         </div>

// //                         {/* Navigation Links */}
// //                         <div className="hidden md:flex items-center space-x-8">
// //                             <Link href="/lost-pet-tips" className="text-gray-700 hover:text-purple-700">
// //                                 Lost Pet Tips
// //                             </Link>
// //                             <Link href="/found-pet-tips" className="text-gray-700 hover:text-purple-700">
// //                                 Found Pet Tips
// //                             </Link>
// //                             <Link href="/how-to-help" className="text-gray-700 hover:text-purple-700">
// //                                 How to Help
// //                             </Link>
// //                             <Link href="/about" className="text-gray-700 hover:text-purple-700">
// //                                 About
// //                             </Link>
// //                         </div>

// //                         {/* Icons */}
// //                         <div className="flex items-center space-x-4 relative">
// //                             {/* Notification Icon with Dropdown */}
// //                             <div className="relative">
// //                                 <div className="flex items-center">
// //                                     <Bell 
// //                                         className="h-6 w-6 text-gray-600 cursor-pointer hover:text-purple-700" 
// //                                         onClick={toggleNotifications}
// //                                     />
// //                                     {unreadCount > 0 && (
// //                                         <span className="ml-1 h-5 w-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center">
// //                                             {unreadCount}
// //                                         </span>
// //                                     )}
// //                                 </div>
// //                                 {isNotificationsOpen && (
// //                                     <div 
// //                                         className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50"
// //                                         onClick={(e) => e.stopPropagation()}
// //                                     >
// //                                         <div className="p-3 border-b flex justify-between items-center">
// //                                             <h3 className="font-medium text-sm">Notifications</h3>
// //                                             <div className="flex space-x-2">
// //                                                 <button 
// //                                                     onClick={async (e) => {
// //                                                         e.stopPropagation();
// //                                                         try {
// //                                                             await markAllAsRead();
// //                                                         } catch (error) {
// //                                                             alert(error.message);
// //                                                         }
// //                                                     }}
// //                                                     className="text-xs text-blue-500 hover:text-blue-700"
// //                                                 >
// //                                                     Mark All Read
// //                                                 </button>
// //                                                 <button 
// //                                                     onClick={() => setIsNotificationsOpen(false)}
// //                                                     className="text-xs text-gray-500 hover:text-gray-700"
// //                                                 >
// //                                                     Close
// //                                                 </button>
// //                                             </div>
// //                                         </div>
// //                                         <div className="max-h-60 overflow-y-auto">
// //                                             {loadingNotifications ? (
// //                                                 <div className="p-4 text-center">
// //                                                     <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-700 mx-auto"></div>
// //                                                 </div>
// //                                             ) : notificationError ? (
// //                                                 <div className="p-3 text-center text-sm text-red-500">
// //                                                     {notificationError}
// //                                                 </div>
// //                                             ) : notifications?.length > 0 ? (
// //                                                 notifications.map((notification) => (
// //                                                     <div 
// //                                                         key={notification?.id} 
// //                                                         className={`p-3 border-b ${!notification?.is_read ? 'bg-blue-50' : ''}`}
// //                                                     >
// //                                                         <div className="flex justify-between">
// //                                                             <div>
// //                                                                 <p className="font-medium text-sm">{notification?.title || "Notification"}</p>
// //                                                                 <p className="text-xs text-gray-600">{notification?.message || ""}</p>
// //                                                                 <p className="text-xs text-gray-400 mt-1">
// //                                                                     {formatNotificationDate(notification?.created_at)}
// //                                                                 </p>
// //                                                             </div>
// //                                                             {!notification?.is_read && (
// //                                                                 <button
// //                                                                     onClick={async (e) => {
// //                                                                         e.stopPropagation();
// //                                                                         try {
// //                                                                             await markAsRead(notification.id);
// //                                                                         } catch (error) {
// //                                                                             alert(error.message);
// //                                                                         }
// //                                                                     }}
// //                                                                     className="text-xs text-blue-500 hover:text-blue-700 ml-2 whitespace-nowrap"
// //                                                                 >
// //                                                                     Mark Read
// //                                                                 </button>
// //                                                             )}
// //                                                         </div>
// //                                                     </div>
// //                                                 ))
// //                                             ) : (
// //                                                 <div className="p-3 text-center text-sm text-gray-500">
// //                                                     No notifications
// //                                                 </div>
// //                                             )}
// //                                         </div>
// //                                         <div className="p-2 border-t text-center">
// //                                             <Link 
// //                                                 href="/notifications" 
// //                                                 className="text-xs text-blue-500 hover:underline"
// //                                                 onClick={() => setIsNotificationsOpen(false)}
// //                                             >
// //                                                 View All
// //                                             </Link>
// //                                         </div>
// //                                     </div>
// //                                 )}
// //                             </div>

                            

// // {/* Message Icon with Unread Count */}
// // <div className="relative">
// //   <MessageSquare 
// //     className="h-6 w-6 text-gray-600 cursor-pointer hover:text-purple-700 transition-colors duration-200" 
// //     onClick={() => router.push('/conversations')}
// //   />
// //   {unreadCount > 0 && (
// //     <span className="absolute -top-2 -right-2 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
// //       <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
// //     </span>
// //   )}
// // </div>





                            

// //                             {/* User Icon with Dropdown */}
// //                             <div className="relative">
// //                                 <User
// //                                     className="h-6 w-6 text-gray-600 cursor-pointer hover:text-purple-700"
// //                                     onClick={toggleDropdown}
// //                                 />
// //                                 {isDropdownOpen && (
// //                                     <div 
// //                                         className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50"
// //                                         onClick={(e) => e.stopPropagation()}
// //                                     >
// //                                         {/* Display User Info */}
// //                                         <div className="p-4">
// //                                             <p className="text-sm font-semibold">
// //                                                 {userData?.name || "User"}
// //                                             </p>
// //                                             <p className="text-xs text-gray-500">
// //                                                 {userData?.email || ""}
// //                                             </p>
// //                                         </div>
// //                                         <hr />
// //                                         <Link
// //                                             href="/pet_dashboard"
// //                                             className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
// //                                             onClick={(e) => {
// //                                                 e.stopPropagation();
// //                                                 setIsDropdownOpen(false);
// //                                             }}
// //                                         >
// //                                             Pet Dashboard
// //                                         </Link>
// //                                         <Link
// //                                             href="/settings/account_information"
// //                                             className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
// //                                             onClick={(e) => {
// //                                                 e.stopPropagation();
// //                                                 setIsDropdownOpen(false);
// //                                             }}
// //                                         >
// //                                             Account Settings
// //                                         </Link>
// //                                         <Link
// //                                             href="/adoption_application"
// //                                             className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
// //                                             onClick={(e) => {
// //                                                 e.stopPropagation();
// //                                                 setIsDropdownOpen(false);
// //                                             }}
// //                                         >
// //                                             Adoption Form
// //                                         </Link>
// //                                         <Link
// //                                             href="/rehome_pets"
// //                                             className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
// //                                             onClick={(e) => {
// //                                                 e.stopPropagation();
// //                                                 setIsDropdownOpen(false);
// //                                             }}
// //                                         >
// //                                              Rehome Pets
// //                                         </Link>
// //                                                                                 <Link
// //                                             href="/adopted_pets"
// //                                             className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
// //                                             onClick={(e) => {
// //                                                 e.stopPropagation();
// //                                                 setIsDropdownOpen(false);
// //                                             }}
// //                                         >
// //                                              Adopted Pets
// //                                         </Link>
// //                                         {/* <a
// // // href={userRole === "user" ? "/pet_dashboard" : "/pet_dashboard"}      
// // href="pet_dashboard"
// //                                       className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
// //                                             onClick={(e) => {
// //                                                 e.preventDefault();
// //                                                 handleDashboardNavigation(e);
// //                                                 setIsDropdownOpen(false);
// //                                             }}
// //                                         >
// //                                             Pet Dashboard
// //                                         </a> */}
// //                                         <button
// //                                             className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
// //                                             onClick={(e) => {
// //                                                 e.stopPropagation();
// //                                                 handleLogout();
// //                                             }}
// //                                         >
// //                                             Logout
// //                                         </button>
// //                                     </div>
// //                                 )}
// //                             </div>
// //                         </div>
// //                     </div>
// //                 </div>
// //             </nav>
// //         </div>
// //     );
// // }
