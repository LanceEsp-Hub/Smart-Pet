// "use client"
// import Link from "next/link"
// import { useRouter } from "next/router"

// const AdminSidebar = () => {
//   const router = useRouter()

//   const menuItems = [
//     { path: "/admin/dashboard", icon: "📊", label: "Dashboard" },
//     { path: "/admin/users_management", icon: "👥", label: "Users" },
//     { path: "/admin/pet_management", icon: "🐾", label: "Pets" },
//     { path: "/admin/pet_health_management", icon: "🏠", label: "Adoptions" },
//     { path: "/admin/user_adoption_form", icon: "📝", label: "Forms" },
//   ]

//   return (
//     <div className="w-64 bg-gray-100 h-screen fixed left-0 top-0 p-4 z-10">
//       <div className="mb-8 p-2">
//         <h1 className="text-xl font-bold">Admin Panel</h1>
//       </div>

//       <nav>
//         <ul className="space-y-2">
//           {menuItems.map((item) => (
//             <li key={item.path}>
//               <Link href={item.path}>
//                 <div
//                   className={`flex items-center p-2 rounded-md hover:bg-gray-200 cursor-pointer transition-colors ${
//                     router.pathname === item.path ? "bg-gray-200 font-medium" : ""
//                   }`}
//                 >
//                   <span className="mr-3">{item.icon}</span>
//                   <span>{item.label}</span>
//                 </div>
//               </Link>
//             </li>
//           ))}
//         </ul>
//       </nav>
//     </div>
//   )
// }

// export default AdminSidebar


"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

const AdminSidebar = () => {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)

  const menuItems = [
    {
      path: "/admin/dashboard",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z"
          />
        </svg>
      ),
      label: "Dashboard",
      description: "Overview & Analytics",
    },
    {
      path: "/admin/users_management",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
          />
        </svg>
      ),
      label: "Users",
      description: "Manage Accounts",
    },
    {
      path: "/admin/pet_management",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
      ),
      label: "Pets",
      description: "Pet Profiles & Care",
    },
    {
      path: "/admin/pet_health_management",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          />
        </svg>
      ),
      label: "Adoptions",
      description: "Adoption Management",
    },
    {
      path: "/admin/user_adoption_form",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      ),
      label: "Pet Tracker Management",
      description: "Application Forms",
    },
        {
      path: "/admin/pet_tracker_management",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      ),
      label: "Forms",
      description: "Pet Tracker Management",
    },
  ]

  return (
    <div
      className={`${
        isCollapsed ? "w-20" : "w-72"
      } bg-white border-r border-gray-200 h-screen fixed left-0 top-0 z-50 transition-all duration-300 ease-in-out shadow-xl`}
    >
      {/* Header */}
      <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="flex items-center justify-between">
          <div className={`flex items-center space-x-3 ${isCollapsed ? "justify-center" : ""}`}>
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 rounded-2xl flex items-center justify-center shadow-lg">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            </div>
            {!isCollapsed && (
              <div>
                <h1 className="text-xl font-bold text-gray-900 tracking-tight">PetCare Admin</h1>
                <p className="text-sm text-gray-600 font-medium">Management Portal</p>
              </div>
            )}
          </div>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2.5 rounded-xl hover:bg-white hover:shadow-md transition-all duration-200 group"
          >
            <svg
              className={`w-5 h-5 text-gray-600 group-hover:text-gray-800 transition-transform duration-300 ${
                isCollapsed ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-4 flex-1 overflow-y-auto">
        {!isCollapsed && (
          <div className="mb-6">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider px-3">Navigation</p>
            <div className="mt-2 h-px bg-gradient-to-r from-gray-200 to-transparent"></div>
          </div>
        )}

        <ul className="space-y-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.path
            return (
              <li key={item.path}>
                <Link href={item.path}>
                  <div
                    className={`relative flex items-center p-4 rounded-2xl transition-all duration-200 group cursor-pointer ${
                      isActive
                        ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/25 transform scale-[1.02]"
                        : "text-gray-700 hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50 hover:shadow-md hover:scale-[1.01]"
                    } ${isCollapsed ? "justify-center" : ""}`}
                  >
                    {/* Active indicator */}
                    {isActive && (
                      <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-white rounded-r-full"></div>
                    )}

                    <div
                      className={`${
                        isActive ? "text-white" : "text-gray-500 group-hover:text-blue-600"
                      } transition-colors duration-200 ${isCollapsed ? "" : "mr-4"}`}
                    >
                      {item.icon}
                    </div>

                    {!isCollapsed && (
                      <div className="flex-1 min-w-0">
                        <span className={`font-semibold text-sm block ${isActive ? "text-white" : "text-gray-900"}`}>
                          {item.label}
                        </span>
                        <p className={`text-xs mt-0.5 ${isActive ? "text-blue-100" : "text-gray-500"} truncate`}>
                          {item.description}
                        </p>
                      </div>
                    )}

                    {/* Hover arrow */}
                    {!isCollapsed && !isActive && (
                      <svg
                        className="w-4 h-4 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all duration-200 opacity-0 group-hover:opacity-100"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    )}
                  </div>
                </Link>
              </li>
            )
          })}
        </ul>

        {/* Quick Stats */}
        {!isCollapsed && (
          <div className="mt-8 p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border border-green-100">
            <h3 className="text-sm font-bold text-green-800 mb-3">Quick Stats</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-green-700">Active Users</span>
                <span className="text-sm font-bold text-green-800">1,234</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-green-700">Total Pets</span>
                <span className="text-sm font-bold text-green-800">856</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-green-700">Pending</span>
                <span className="text-sm font-bold text-orange-600">23</span>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Settings */}
      <div className="p-4 border-t border-gray-100">
        <Link href="/admin/settings">
          <div
            className={`flex items-center p-3 rounded-xl text-gray-700 hover:bg-gray-50 hover:shadow-md transition-all duration-200 group ${
              isCollapsed ? "justify-center" : ""
            }`}
          >
            <svg
              className={`w-5 h-5 text-gray-500 group-hover:text-gray-700 group-hover:rotate-90 transition-all duration-300 ${
                isCollapsed ? "" : "mr-3"
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {!isCollapsed && <span className="font-semibold text-sm">Settings</span>}
          </div>
        </Link>
      </div>

      {/* User Profile */}
      <div className="p-4 border-t border-gray-100 bg-gradient-to-r from-gray-50 to-blue-50">
        <div className={`flex items-center ${isCollapsed ? "justify-center" : "space-x-3"}`}>
          <div className="relative">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">AD</span>
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
          </div>

          {!isCollapsed && (
            <>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm text-gray-900 truncate">Admin User</p>
                <p className="text-xs text-gray-600 truncate">admin@petcare.com</p>
              </div>

              <div className="flex space-x-1">
                <button className="p-2 rounded-lg hover:bg-white hover:shadow-md transition-all duration-200 group">
                  <svg
                    className="w-4 h-4 text-gray-500 group-hover:text-red-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminSidebar
