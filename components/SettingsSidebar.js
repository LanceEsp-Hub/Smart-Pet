"use client"

import Link from "next/link"
import { useRouter } from "next/router"

const SettingsSidebar = () => {
  const router = useRouter()
  const currentPath = router.pathname

  // Menu items with icon names (using Lucide icon naming convention)
  const menuItems = [
    { name: "Basic Information", path: "/settings/account_information", icon: "User" },
    { name: "Address", path: "/settings/address", icon: "MapPin" },
    { name: "Notifications", path: "/settings/notifications", icon: "Bell" },
    { name: "Privacy", path: "/settings/privacy", icon: "Shield" },
    { name: "Delete Account", path: "/settings/delete_account", icon: "Trash2" },
  ]

  // Function to render the appropriate icon
  const renderIcon = (iconName) => {
    switch (iconName) {
      case "User":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        )
      case "MapPin":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
        )
      case "Bell":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
            <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
          </svg>
        )
      case "Shield":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
          </svg>
        )
      case "Trash2":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 6h18" />
            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
            <line x1="10" x2="10" y1="11" y2="17" />
            <line x1="14" x2="14" y1="11" y2="17" />
          </svg>
        )
      default:
        return null
    }
  }

  return (
    <div className="settings-sidebar bg-white rounded-lg shadow-sm border border-gray-100 w-64 overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100">
        <h2 className="text-lg font-semibold text-gray-800">Account Settings</h2>
      </div>
      <ul className="py-2">
        {menuItems.map((item) => (
          <li key={item.path} className="px-2">
            <Link
              href={item.path}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors
                ${
                  currentPath === item.path
                    ? "bg-gray-100 text-gray-900"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }
              `}
            >
              <span className={`${currentPath === item.path ? "text-gray-900" : "text-gray-500"}`}>
                {renderIcon(item.icon)}
              </span>
              {item.name}
              {item.name !== "Delete Account" && (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="ml-auto text-gray-400"
                >
                  <path d="m9 18 6-6-6-6" />
                </svg>
              )}
            </Link>
          </li>
        ))}
      </ul>
      <style jsx>{`
        .settings-sidebar {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
        }
      `}</style>
    </div>
  )
}

export default SettingsSidebar
