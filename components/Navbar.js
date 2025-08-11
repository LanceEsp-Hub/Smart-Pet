"use client"

import Link from "next/link"
import { useRouter } from "next/router"
import { Bell, MessageSquare, User } from "react-feather"
import { useState, useEffect } from "react"
import CryptoJS from "crypto-js"
import { useSearchParams } from "next/navigation"
import { markAllNotificationsAsRead } from "../utils/api" // Add this import

const SECRET_KEY = "asdasdasd"

const encryptData = (data) => {
  return CryptoJS.AES.encrypt(JSON.stringify(data), SECRET_KEY).toString()
}

const decryptData = (encryptedData) => {
  const bytes = CryptoJS.AES.decrypt(encryptedData, SECRET_KEY)
  return JSON.parse(bytes.toString(CryptoJS.enc.Utf8))
}

const markNotificationAsRead = async (token, notificationId) => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL || "https://newback-production-a0cc.up.railway.app"}/api/notifications/${notificationId}/read`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    },
  )

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.detail || "Failed to mark notification as read")
  }

  return await response.json()
}

export default function Navbar() {
  const router = useRouter()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  const [hasNewMessages, setHasNewMessages] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userData, setUserData] = useState(null)
  const [userRole, setUserRole] = useState(null)
  const searchParams = useSearchParams()
  const [unreadCount, setUnreadCount] = useState(0)
  const [notifications, setNotifications] = useState([])
  const [loadingNotifications, setLoadingNotifications] = useState(false)
  const [notificationError, setNotificationError] = useState(null)

  const fetchNotifications = async () => {
    try {
      setLoadingNotifications(true)
      setNotificationError(null)

      const token = sessionStorage.getItem("auth_token")
      const userId = sessionStorage.getItem("user_id")

      if (!token || !userId) {
        throw new Error("Authentication required")
      }

      // Fetch recent notifications first
      const notifResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "https://newback-production-a0cc.up.railway.app"}/api/notifications/user/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )

      if (!notifResponse.ok) {
        // Try to get the actual error message from the response
        const errorData = await notifResponse.json().catch(() => ({}))
        const errorMessage = errorData.detail || "Failed to fetch notifications"
        console.error("Backend error:", errorMessage)
        throw new Error(errorMessage)
      }

      const notifData = await notifResponse.json()
      setNotifications(notifData?.notifications || [])

      // Only fetch unread count if notifications were successful
      const countResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "https://newback-production-a0cc.up.railway.app"}/api/notifications/unread-count/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )

      if (!countResponse.ok) {
        console.warn("Failed to fetch notification count (non-critical)")
      } else {
        const countData = await countResponse.json()
        setUnreadCount(countData?.unread_count || 0)
      }
    } catch (error) {
      console.error("Error in fetchNotifications:", error)
      setNotificationError(error.message)
      setUnreadCount(0)
      setNotifications([])
    } finally {
      setLoadingNotifications(false)
    }
  }

  useEffect(() => {
    try {
      const token = searchParams.get("token")
      const userId = searchParams.get("user_id")
      const user = searchParams.get("user")
      const roles = searchParams.get("roles")

      if (token && userId && user && roles) {
        sessionStorage.setItem("auth_token", token)
        sessionStorage.setItem("user_id", userId)
        sessionStorage.setItem("user", user)
        sessionStorage.setItem("roles", encryptData(roles))
        setUserRole(roles)
      }

      const storedToken = sessionStorage.getItem("auth_token")
      const storedUserData = sessionStorage.getItem("user")
      const storedUserId = sessionStorage.getItem("user_id")
      const encryptedRoles = sessionStorage.getItem("roles")

      if (!storedToken || !storedUserData || !storedUserId || !encryptedRoles) {
        setIsAuthenticated(false)
        router.push("/login")
        return
      }

      const storedRoles = decryptData(encryptedRoles)
      setUserRole(storedRoles)

      if (storedRoles === "user" || storedRoles === "admin") {
        setIsAuthenticated(true)
        setUserData(JSON.parse(storedUserData))
        fetchNotifications()
      } else {
        setIsAuthenticated(false)
        router.push("/login")
      }
    } catch (error) {
      console.error("Error during authentication check:", error)
      setIsAuthenticated(false)
      router.push("/login")
    }
  }, [router, searchParams])

  if (!isAuthenticated) {
    return null
  }

  const toggleDropdown = (e) => {
    if (e) e.stopPropagation()
    setIsDropdownOpen(!isDropdownOpen)
  }

  const toggleNotifications = (e) => {
    if (e) e.stopPropagation()
    setIsNotificationsOpen(!isNotificationsOpen)
    if (!isNotificationsOpen) {
      fetchNotifications()
    }
  }

  const handleDashboardNavigation = (e) => {
    e.preventDefault()
    const dashboardUrl = userRole === "admin" ? "/admin_dashboard" : "/admin_dashboard"
    router.push(dashboardUrl)
  }

  const handleLogout = () => {
    sessionStorage.removeItem("auth_token")
    sessionStorage.removeItem("user_id")
    sessionStorage.removeItem("roles")
    sessionStorage.removeItem("user")

    localStorage.clear()
    sessionStorage.clear()

    setIsAuthenticated(false)
    router.push("/login")
  }

  const formatNotificationDate = (dateString) => {
    try {
      if (!dateString) return "Just now"
      const date = new Date(dateString)
      return date.toLocaleString()
    } catch {
      return "Just now"
    }
  }

  const markAsRead = async (notificationId) => {
    try {
      const token = sessionStorage.getItem("auth_token")
      if (!token) {
        throw new Error("Authentication token not found")
      }

      await markNotificationAsRead(token, notificationId)

      // Update local state
      setNotifications((prevNotifications) =>
        prevNotifications.map((notif) => (notif.id === notificationId ? { ...notif, is_read: true } : notif)),
      )

      // Update unread count
      setUnreadCount((prev) => Math.max(0, prev - 1))
    } catch (error) {
      console.error("Error marking notification as read:", error)
      throw error
    }
  }

  // components/Navbar.js
  const markAllAsRead = async () => {
    try {
      const token = sessionStorage.getItem("auth_token")
      const userId = sessionStorage.getItem("user_id")

      await markAllNotificationsAsRead(token, userId)

      // Update UI
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
      setUnreadCount(0)
    } catch (error) {
      console.error("Mark all failed:", error)
      alert(error.message)
    }
  }

  return (
    <div className="bg-white/95 backdrop-blur-md shadow-lg border-b border-white/20 sticky top-0 z-50">
      <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex justify-center items-center py-3 text-sm text-white/90">
            <div className="flex items-center space-x-6">
              <Link href="/" className="hover:text-white transition-colors font-medium">
                Smartpet Love
              </Link>
              <span className="text-white/60">•</span>
              <Link href="/adopt" className="hover:text-white transition-colors font-medium">
                Smartpet Love Adopt
              </Link>
              <span className="text-white/60">•</span>
              <Link href="/care" className="hover:text-white transition-colors font-medium">
                Smartpet Love Care
              </Link>
            </div>
          </div>
        </div>
      </div>

      <nav className="border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center py-4">
            {/* Logo */}
            <div className="flex items-center">
              <div className="relative">
                <img
                  src="/logo.png"
                  alt="Smartpet Love Lost"
                  className="h-12 w-auto transition-transform hover:scale-105"
                />
              </div>
            </div>

            <div className="hidden lg:flex items-center space-x-8">
              <Link
                href="/lost-pet-tips"
                className="text-gray-700 hover:text-purple-600 font-medium transition-colors duration-200 relative group"
              >
                Lost Pet Tips
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-purple-600 group-hover:w-full transition-all duration-200"></span>
              </Link>
              <Link
                href="/found-pet-tips"
                className="text-gray-700 hover:text-purple-600 font-medium transition-colors duration-200 relative group"
              >
                Found Pet Tips
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-purple-600 group-hover:w-full transition-all duration-200"></span>
              </Link>
              <Link
                href="/how-to-help"
                className="text-gray-700 hover:text-purple-600 font-medium transition-colors duration-200 relative group"
              >
                How to Help
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-purple-600 group-hover:w-full transition-all duration-200"></span>
              </Link>
              <Link
                href="/about"
                className="text-gray-700 hover:text-purple-600 font-medium transition-colors duration-200 relative group"
              >
                About
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-purple-600 group-hover:w-full transition-all duration-200"></span>
              </Link>
            </div>

            <div className="flex items-center space-x-6 relative">
              {/* Notification Icon with Enhanced Dropdown */}
              <div className="relative">
                <div className="flex items-center">
                  <div
                    className="relative p-2 rounded-full hover:bg-purple-50 transition-colors duration-200 cursor-pointer group"
                    onClick={toggleNotifications}
                  >
                    <Bell className="h-6 w-6 text-gray-600 group-hover:text-purple-600 transition-colors" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 h-5 w-5 bg-gradient-to-r from-red-500 to-pink-500 rounded-full text-white text-xs flex items-center justify-center font-bold shadow-lg animate-pulse">
                        {unreadCount}
                      </span>
                    )}
                  </div>
                </div>
                {isNotificationsOpen && (
                  <div
                    className="absolute right-0 mt-3 w-80 bg-white/95 backdrop-blur-md border border-gray-200 rounded-2xl shadow-2xl z-50 overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 border-b flex justify-between items-center">
                      <h3 className="font-bold text-gray-800">Notifications</h3>
                      <div className="flex space-x-3">
                        <button
                          onClick={async (e) => {
                            e.stopPropagation()
                            try {
                              await markAllAsRead()
                            } catch (error) {
                              alert(error.message)
                            }
                          }}
                          className="text-xs text-purple-600 hover:text-purple-800 font-medium transition-colors"
                        >
                          Mark All Read
                        </button>
                        <button
                          onClick={() => setIsNotificationsOpen(false)}
                          className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {loadingNotifications ? (
                        <div className="p-6 text-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
                        </div>
                      ) : notificationError ? (
                        <div className="p-4 text-center text-sm text-red-500 bg-red-50 m-2 rounded-lg">
                          {notificationError}
                        </div>
                      ) : notifications?.length > 0 ? (
                        notifications.map((notification) => (
                          <div
                            key={notification?.id}
                            className={`p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${!notification?.is_read ? "bg-blue-50 border-l-4 border-l-blue-500" : ""}`}
                          >
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <p className="font-semibold text-gray-800 text-sm">
                                  {notification?.title || "Notification"}
                                </p>
                                <p className="text-xs text-gray-600 mt-1">{notification?.message || ""}</p>
                                <p className="text-xs text-gray-400 mt-2">
                                  {formatNotificationDate(notification?.created_at)}
                                </p>
                              </div>
                              {!notification?.is_read && (
                                <button
                                  onClick={async (e) => {
                                    e.stopPropagation()
                                    try {
                                      await markAsRead(notification.id)
                                    } catch (error) {
                                      alert(error.message)
                                    }
                                  }}
                                  className="text-xs text-blue-600 hover:text-blue-800 ml-3 px-2 py-1 bg-blue-100 rounded-full transition-colors"
                                >
                                  Mark Read
                                </button>
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-6 text-center text-sm text-gray-500">
                          <div className="w-12 h-12 mx-auto mb-3 bg-gray-100 rounded-full flex items-center justify-center">
                            <Bell className="w-6 h-6 text-gray-400" />
                          </div>
                          No notifications
                        </div>
                      )}
                    </div>
                    <div className="p-3 bg-gray-50 text-center border-t">
                      <Link
                        href="/notifications"
                        className="text-sm text-purple-600 hover:text-purple-800 font-medium transition-colors"
                        onClick={() => setIsNotificationsOpen(false)}
                      >
                        View All Notifications
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              <div className="relative">
                <div
                  className="p-2 rounded-full hover:bg-purple-50 transition-colors duration-200 cursor-pointer group"
                  onClick={() => router.push("/conversations")}
                >
                  <MessageSquare className="h-6 w-6 text-gray-600 group-hover:text-purple-600 transition-colors" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-3 w-3 bg-gradient-to-r from-red-500 to-pink-500 rounded-full">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    </span>
                  )}
                </div>
              </div>

              <div className="relative">
                <div
                  className="p-2 rounded-full hover:bg-purple-50 transition-colors duration-200 cursor-pointer group"
                  onClick={toggleDropdown}
                >
                  <User className="h-6 w-6 text-gray-600 group-hover:text-purple-600 transition-colors" />
                </div>
                {isDropdownOpen && (
                  <div
                    className="absolute right-0 mt-3 w-64 bg-white/95 backdrop-blur-md border border-gray-200 rounded-2xl shadow-2xl z-50 overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* User Info Section */}
                    <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 border-b">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                          {userData?.name?.charAt(0)?.toUpperCase() || "U"}
                        </div>
                        <div>
                          <p className="font-bold text-gray-800">{userData?.name || "User"}</p>
                          <p className="text-xs text-gray-500">{userData?.email || ""}</p>
                        </div>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="py-2">
                      <Link
                        href="/pet_dashboard"
                        className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition-colors group"
                        onClick={(e) => {
                          e.stopPropagation()
                          setIsDropdownOpen(false)
                        }}
                      >
                        <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3 group-hover:bg-purple-200 transition-colors">
                          <svg
                            className="w-4 h-4 text-purple-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"
                            />
                          </svg>
                        </div>
                        Pet Dashboard
                      </Link>

                      {/* ... existing code for other menu items with similar styling ... */}
                      <Link
                        href="/settings/account_information"
                        className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition-colors group"
                        onClick={(e) => {
                          e.stopPropagation()
                          setIsDropdownOpen(false)
                        }}
                      >
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3 group-hover:bg-blue-200 transition-colors">
                          <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                          </svg>
                        </div>
                        Account Settings
                      </Link>

                      {/* ... existing code for other links ... */}
                      <Link
                        href="/adoption_application"
                        className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition-colors group"
                        onClick={(e) => {
                          e.stopPropagation()
                          setIsDropdownOpen(false)
                        }}
                      >
                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3 group-hover:bg-green-200 transition-colors">
                          <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                          </svg>
                        </div>
                        Adoption Form
                      </Link>

                      <Link
                        href="/rehome_pets"
                        className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition-colors group"
                        onClick={(e) => {
                          e.stopPropagation()
                          setIsDropdownOpen(false)
                        }}
                      >
                        <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center mr-3 group-hover:bg-orange-200 transition-colors">
                          <svg
                            className="w-4 h-4 text-orange-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                            />
                          </svg>
                        </div>
                        Rehome Pets
                      </Link>

                      <Link
                        href="/adopted_pets"
                        className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition-colors group"
                        onClick={(e) => {
                          e.stopPropagation()
                          setIsDropdownOpen(false)
                        }}
                      >
                        <div className="w-8 h-8 bg-pink-100 rounded-lg flex items-center justify-center mr-3 group-hover:bg-pink-200 transition-colors">
                          <svg className="w-4 h-4 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                            />
                          </svg>
                        </div>
                        Adopted Pets
                      </Link>
                    </div>

                    {/* Logout Button */}
                    <div className="border-t border-gray-100 p-2">
                      <button
                        className="flex items-center w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors group rounded-lg"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleLogout()
                        }}
                      >
                        <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center mr-3 group-hover:bg-red-200 transition-colors">
                          <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                            />
                          </svg>
                        </div>
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
  )
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



// // // "use client";

// // // import Link from "next/link";
// // // import { useRouter } from "next/router";
// // // import { Bell, MessageSquare, User } from "react-feather";
// // // import { useState, useEffect } from "react";
// // // import CryptoJS from "crypto-js";
// // // import { useSearchParams } from "next/navigation";
// // // import { markAllNotificationsAsRead, getUserNotifications } from '../utils/api';  // Add this import

// // // const SECRET_KEY = "asdasdasd";

// // // const encryptData = (data) => {
// // //   return CryptoJS.AES.encrypt(JSON.stringify(data), SECRET_KEY).toString();
// // // };

// // // const decryptData = (encryptedData) => {
// // //   const bytes = CryptoJS.AES.decrypt(encryptedData, SECRET_KEY);
// // //   return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
// // // };

// // // const markNotificationAsRead = async (token, notificationId) => {
// // //   const response = await fetch(
// // //     `${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"}/api/notifications/${notificationId}/read`,
// // //     {
// // //       method: 'PATCH',
// // //       headers: {
// // //         'Authorization': `Bearer ${token}`,
// // //         'Content-Type': 'application/json'
// // //       }
// // //     }
// // //   );
  
// // //   if (!response.ok) {
// // //     const errorData = await response.json();
// // //     throw new Error(errorData.detail || 'Failed to mark notification as read');
// // //   }
  
// // //   return await response.json();
// // // };

// // // export default function Navbar() {
// // //     const router = useRouter();
// // //     const [isDropdownOpen, setIsDropdownOpen] = useState(false);
// // //     const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
// // //     const [hasNewMessages, setHasNewMessages] = useState(false);
// // //     const [isAuthenticated, setIsAuthenticated] = useState(false);
// // //     const [userData, setUserData] = useState(null);
// // //     const [userRole, setUserRole] = useState(null);
// // //     const searchParams = useSearchParams();
// // //     const [unreadCount, setUnreadCount] = useState(0);
// // //     const [notifications, setNotifications] = useState([]);
// // //     const [loadingNotifications, setLoadingNotifications] = useState(false);
// // //     const [notificationError, setNotificationError] = useState(null);

// // //     const fetchNotifications = async () => {
// // //   try {
// // //     setLoadingNotifications(true);
// // //     setNotificationError(null);
    
// // //     const token = sessionStorage.getItem("auth_token");
// // //     const userId = sessionStorage.getItem("user_id");
    
// // //     if (!token || !userId) {
// // //       throw new Error("Authentication required");
// // //     }

// // //     // Fetch recent notifications first
// // //     const notifResponse = await fetch(
// // //       `${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"}/api/notifications/user/${userId}`,
// // //       {
// // //         headers: {
// // //           'Authorization': `Bearer ${token}`
// // //         }
// // //       }
// // //     );
    
// // //     if (!notifResponse.ok) {
// // //       // Try to get the actual error message from the response
// // //       const errorData = await notifResponse.json().catch(() => ({}));
// // //       const errorMessage = errorData.detail || "Failed to fetch notifications";
// // //       console.error("Backend error:", errorMessage);
// // //       throw new Error(errorMessage);
// // //     }
    
// // //     const notifData = await notifResponse.json();
// // //     setNotifications(notifData?.notifications || []);
    
// // //     // Only fetch unread count if notifications were successful
// // //     const countResponse = await fetch(
// // //       `${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"}/api/notifications/unread-count/${userId}`,
// // //       {
// // //         headers: {
// // //           'Authorization': `Bearer ${token}`
// // //         }
// // //       }
// // //     );
    
// // //     if (!countResponse.ok) {
// // //       console.warn("Failed to fetch notification count (non-critical)");
// // //     } else {
// // //       const countData = await countResponse.json();
// // //       setUnreadCount(countData?.unread_count || 0);
// // //     }
    
// // //   } catch (error) {
// // //     console.error("Error in fetchNotifications:", error);
// // //     setNotificationError(error.message);
// // //     setUnreadCount(0);
// // //     setNotifications([]);
// // //   } finally {
// // //     setLoadingNotifications(false);
// // //   }
// // // };

// // //     useEffect(() => {
// // //        try {
// // //          const token = searchParams.get("token");
// // //          const userId = searchParams.get("user_id");
// // //          const user = searchParams.get("user");
// // //          const roles = searchParams.get("roles");
   
// // //          if (token && userId && user && roles) {
// // //            sessionStorage.setItem("auth_token", token);
// // //            sessionStorage.setItem("user_id", userId);
// // //            sessionStorage.setItem("user", user);
// // //            sessionStorage.setItem("roles", encryptData(roles));
// // //            setUserRole(roles);
// // //          }
   
// // //          const storedToken = sessionStorage.getItem("auth_token");
// // //          const storedUserData = sessionStorage.getItem("user");
// // //          const storedUserId = sessionStorage.getItem("user_id");
// // //          const encryptedRoles = sessionStorage.getItem("roles");
   
// // //          if (!storedToken || !storedUserData || !storedUserId || !encryptedRoles) {
// // //            setIsAuthenticated(false);
// // //            router.push("/login");
// // //            return;
// // //          }
   
// // //          const storedRoles = decryptData(encryptedRoles);
// // //          setUserRole(storedRoles);
   
// // //          if (storedRoles === "user" || storedRoles === "admin") {
// // //            setIsAuthenticated(true);
// // //            setUserData(JSON.parse(storedUserData));
// // //            fetchNotifications();
// // //          } else {
// // //            setIsAuthenticated(false);
// // //            router.push("/login");
// // //          }
// // //        } catch (error) {
// // //          console.error("Error during authentication check:", error);
// // //          setIsAuthenticated(false);
// // //          router.push("/login");
// // //        }
// // //      }, [router, searchParams]);
   
// // //     if (!isAuthenticated) {
// // //         return null;
// // //     }

// // //     const toggleDropdown = (e) => {
// // //         if (e) e.stopPropagation();
// // //         setIsDropdownOpen(!isDropdownOpen);
// // //     };

// // //     const toggleNotifications = (e) => {
// // //         if (e) e.stopPropagation();
// // //         setIsNotificationsOpen(!isNotificationsOpen);
// // //         if (!isNotificationsOpen) {
// // //           fetchNotifications();
// // //         }
// // //     };

// // //     const handleDashboardNavigation = (e) => {
// // //         e.preventDefault();
// // //         const dashboardUrl = userRole === "admin" ? "/admin_dashboard" : "/admin_dashboard";
// // //         router.push(dashboardUrl);
// // //     };

// // //     const handleLogout = () => {
// // //         sessionStorage.removeItem("auth_token");
// // //         sessionStorage.removeItem("user_id");
// // //         sessionStorage.removeItem("roles");
// // //         sessionStorage.removeItem("user");

// // //         localStorage.clear();
// // //         sessionStorage.clear();

// // //         setIsAuthenticated(false);
// // //         router.push("/login");
// // //     };

// // //     const formatNotificationDate = (dateString) => {
// // //       try {
// // //         if (!dateString) return "Just now";
// // //         const date = new Date(dateString);
// // //         return date.toLocaleString();
// // //       } catch {
// // //         return "Just now";
// // //       }
// // //     };

// // //     const markAsRead = async (notificationId) => {
// // //         try {
// // //           const token = sessionStorage.getItem('auth_token');
// // //           if (!token) {
// // //             throw new Error('Authentication token not found');
// // //           }
      
// // //           await markNotificationAsRead(token, notificationId);
          
// // //           // Update local state
// // //           setNotifications(prevNotifications => 
// // //             prevNotifications.map(notif => 
// // //               notif.id === notificationId ? { ...notif, is_read: true } : notif
// // //             )
// // //           );
          
// // //           // Update unread count
// // //           setUnreadCount(prev => Math.max(0, prev - 1));
          
// // //         } catch (error) {
// // //           console.error('Error marking notification as read:', error);
// // //           throw error;
// // //         }
// // //       };
    
// // //       // components/Navbar.js
// // //       const markAllAsRead = async () => {
// // //         try {
// // //           const token = sessionStorage.getItem('auth_token');
// // //           const userId = sessionStorage.getItem('user_id');
          
// // //           await markAllNotificationsAsRead(token, userId);
          
// // //           // Update UI
// // //           setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
// // //           setUnreadCount(0);
          
// // //         } catch (error) {
// // //           console.error('Mark all failed:', error);
// // //           alert(error.message);
// // //         }
// // //       };

   
// // //     return (
// // //         <div className="bg-white">
// // //             {/* Top Navigation */}
// // //             <div className="border-b">
// // //                 <div className="max-w-7xl mx-auto px-4 sm:px-6">
// // //                     <div className="flex justify-center items-center py-2 text-sm text-gray-600">
// // //                         <div className="flex items-center space-x-4">
// // //                             <Link href="/">Smartpet Love</Link>
// // //                             <span>|</span>
// // //                             <Link href="/adopt">Smartpet Love Adopt</Link>
// // //                             <span>|</span>
// // //                             <Link href="/care">Smartpet Love Care</Link>
// // //                         </div>
// // //                     </div>
// // //                 </div>
// // //             </div>

// // //             {/* Main Navigation */}
// // //             <nav className="border-b">
// // //                 <div className="max-w-7xl mx-auto px-4 sm:px-6">
// // //                     <div className="flex justify-between items-center py-4">
// // //                         {/* Logo */}
// // //                         <div className="flex items-center">
// // //                             <img
// // //                                 src="/logo.png"
// // //                                 alt="Smartpet Love Lost"
// // //                                 className="h-19 w-auto"
// // //                             />
// // //                         </div>

// // //                         {/* Navigation Links */}
// // //                         <div className="hidden md:flex items-center space-x-8">
// // //                             <Link href="/lost-pet-tips" className="text-gray-700 hover:text-purple-700">
// // //                                 Lost Pet Tips
// // //                             </Link>
// // //                             <Link href="/found-pet-tips" className="text-gray-700 hover:text-purple-700">
// // //                                 Found Pet Tips
// // //                             </Link>
// // //                             <Link href="/how-to-help" className="text-gray-700 hover:text-purple-700">
// // //                                 How to Help
// // //                             </Link>
// // //                             <Link href="/about" className="text-gray-700 hover:text-purple-700">
// // //                                 About
// // //                             </Link>
// // //                         </div>

// // //                         {/* Icons */}
// // //                         <div className="flex items-center space-x-4 relative">
// // //                             {/* Notification Icon with Dropdown */}
// // //                             <div className="relative">
// // //                                 <div className="flex items-center">
// // //                                     <Bell 
// // //                                         className="h-6 w-6 text-gray-600 cursor-pointer hover:text-purple-700" 
// // //                                         onClick={toggleNotifications}
// // //                                     />
// // //                                     {unreadCount > 0 && (
// // //                                         <span className="ml-1 h-5 w-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center">
// // //                                             {unreadCount}
// // //                                         </span>
// // //                                     )}
// // //                                 </div>
// // //                                 {isNotificationsOpen && (
// // //                                     <div 
// // //                                         className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50"
// // //                                         onClick={(e) => e.stopPropagation()}
// // //                                     >
// // //                                         <div className="p-3 border-b flex justify-between items-center">
// // //                                             <h3 className="font-medium text-sm">Notifications</h3>
// // //                                             <div className="flex space-x-2">
// // //                                                 <button 
// // //                                                     onClick={async (e) => {
// // //                                                         e.stopPropagation();
// // //                                                         try {
// // //                                                             await markAllAsRead();
// // //                                                         } catch (error) {
// // //                                                             alert(error.message);
// // //                                                         }
// // //                                                     }}
// // //                                                     className="text-xs text-blue-500 hover:text-blue-700"
// // //                                                 >
// // //                                                     Mark All Read
// // //                                                 </button>
// // //                                                 <button 
// // //                                                     onClick={() => setIsNotificationsOpen(false)}
// // //                                                     className="text-xs text-gray-500 hover:text-gray-700"
// // //                                                 >
// // //                                                     Close
// // //                                                 </button>
// // //                                             </div>
// // //                                         </div>
// // //                                         <div className="max-h-60 overflow-y-auto">
// // //                                             {loadingNotifications ? (
// // //                                                 <div className="p-4 text-center">
// // //                                                     <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-700 mx-auto"></div>
// // //                                                 </div>
// // //                                             ) : notificationError ? (
// // //                                                 <div className="p-3 text-center text-sm text-red-500">
// // //                                                     {notificationError}
// // //                                                 </div>
// // //                                             ) : notifications?.length > 0 ? (
// // //                                                 notifications.map((notification) => (
// // //                                                     <div 
// // //                                                         key={notification?.id} 
// // //                                                         className={`p-3 border-b ${!notification?.is_read ? 'bg-blue-50' : ''}`}
// // //                                                     >
// // //                                                         <div className="flex justify-between">
// // //                                                             <div>
// // //                                                                 <p className="font-medium text-sm">{notification?.title || "Notification"}</p>
// // //                                                                 <p className="text-xs text-gray-600">{notification?.message || ""}</p>
// // //                                                                 <p className="text-xs text-gray-400 mt-1">
// // //                                                                     {formatNotificationDate(notification?.created_at)}
// // //                                                                 </p>
// // //                                                             </div>
// // //                                                             {!notification?.is_read && (
// // //                                                                 <button
// // //                                                                     onClick={async (e) => {
// // //                                                                         e.stopPropagation();
// // //                                                                         try {
// // //                                                                             await markAsRead(notification.id);
// // //                                                                         } catch (error) {
// // //                                                                             alert(error.message);
// // //                                                                         }
// // //                                                                     }}
// // //                                                                     className="text-xs text-blue-500 hover:text-blue-700 ml-2 whitespace-nowrap"
// // //                                                                 >
// // //                                                                     Mark Read
// // //                                                                 </button>
// // //                                                             )}
// // //                                                         </div>
// // //                                                     </div>
// // //                                                 ))
// // //                                             ) : (
// // //                                                 <div className="p-3 text-center text-sm text-gray-500">
// // //                                                     No notifications
// // //                                                 </div>
// // //                                             )}
// // //                                         </div>
// // //                                         <div className="p-2 border-t text-center">
// // //                                             <Link 
// // //                                                 href="/notifications" 
// // //                                                 className="text-xs text-blue-500 hover:underline"
// // //                                                 onClick={() => setIsNotificationsOpen(false)}
// // //                                             >
// // //                                                 View All
// // //                                             </Link>
// // //                                         </div>
// // //                                     </div>
// // //                                 )}
// // //                             </div>

                            

// // // {/* Message Icon with Unread Count */}
// // // <div className="relative">
// // //   <MessageSquare 
// // //     className="h-6 w-6 text-gray-600 cursor-pointer hover:text-purple-700 transition-colors duration-200" 
// // //     onClick={() => router.push('/conversations')}
// // //   />
// // //   {unreadCount > 0 && (
// // //     <span className="absolute -top-2 -right-2 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
// // //       <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
// // //     </span>
// // //   )}
// // // </div>





                            

// // //                             {/* User Icon with Dropdown */}
// // //                             <div className="relative">
// // //                                 <User
// // //                                     className="h-6 w-6 text-gray-600 cursor-pointer hover:text-purple-700"
// // //                                     onClick={toggleDropdown}
// // //                                 />
// // //                                 {isDropdownOpen && (
// // //                                     <div 
// // //                                         className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50"
// // //                                         onClick={(e) => e.stopPropagation()}
// // //                                     >
// // //                                         {/* Display User Info */}
// // //                                         <div className="p-4">
// // //                                             <p className="text-sm font-semibold">
// // //                                                 {userData?.name || "User"}
// // //                                             </p>
// // //                                             <p className="text-xs text-gray-500">
// // //                                                 {userData?.email || ""}
// // //                                             </p>
// // //                                         </div>
// // //                                         <hr />
// // //                                         <Link
// // //                                             href="/pet_dashboard"
// // //                                             className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
// // //                                             onClick={(e) => {
// // //                                                 e.stopPropagation();
// // //                                                 setIsDropdownOpen(false);
// // //                                             }}
// // //                                         >
// // //                                             Pet Dashboard
// // //                                         </Link>
// // //                                         <Link
// // //                                             href="/settings/account_information"
// // //                                             className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
// // //                                             onClick={(e) => {
// // //                                                 e.stopPropagation();
// // //                                                 setIsDropdownOpen(false);
// // //                                             }}
// // //                                         >
// // //                                             Account Settings
// // //                                         </Link>
// // //                                         <Link
// // //                                             href="/adoption_application"
// // //                                             className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
// // //                                             onClick={(e) => {
// // //                                                 e.stopPropagation();
// // //                                                 setIsDropdownOpen(false);
// // //                                             }}
// // //                                         >
// // //                                             Adoption Form
// // //                                         </Link>
// // //                                         <Link
// // //                                             href="/rehome_pets"
// // //                                             className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
// // //                                             onClick={(e) => {
// // //                                                 e.stopPropagation();
// // //                                                 setIsDropdownOpen(false);
// // //                                             }}
// // //                                         >
// // //                                              Rehome Pets
// // //                                         </Link>
// // //                                                                                 <Link
// // //                                             href="/adopted_pets"
// // //                                             className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
// // //                                             onClick={(e) => {
// // //                                                 e.stopPropagation();
// // //                                                 setIsDropdownOpen(false);
// // //                                             }}
// // //                                         >
// // //                                              Adopted Pets
// // //                                         </Link>
// // //                                         {/* <a
// // // // href={userRole === "user" ? "/pet_dashboard" : "/pet_dashboard"}      
// // // href="pet_dashboard"
// // //                                       className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
// // //                                             onClick={(e) => {
// // //                                                 e.preventDefault();
// // //                                                 handleDashboardNavigation(e);
// // //                                                 setIsDropdownOpen(false);
// // //                                             }}
// // //                                         >
// // //                                             Pet Dashboard
// // //                                         </a> */}
// // //                                         <button
// // //                                             className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
// // //                                             onClick={(e) => {
// // //                                                 e.stopPropagation();
// // //                                                 handleLogout();
// // //                                             }}
// // //                                         >
// // //                                             Logout
// // //                                         </button>
// // //                                     </div>
// // //                                 )}
// // //                             </div>
// // //                         </div>
// // //                     </div>
// // //                 </div>
// // //             </nav>
// // //         </div>
// // //     );
// // // }
