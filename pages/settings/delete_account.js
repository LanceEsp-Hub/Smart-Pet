"use client"

import { useState } from "react"
import { useRouter } from "next/router"
import { deleteUserAccount } from "../../utils/api"
import SettingsSidebar from "../../components/SettingsSidebar"
import Navbar from "../../components/Navbar"
import Footer from "../../components/Footer"

const DeleteAccountPage = () => {
  const router = useRouter()
  const [confirmation, setConfirmation] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState(null)
  const [showFinalConfirmation, setShowFinalConfirmation] = useState(false)

  const handleInitialConfirmation = () => {
    if (confirmation.toLowerCase() !== "delete") {
      setError('Please type "delete" to confirm')
      return
    }

    setError(null)
    setShowFinalConfirmation(true)
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    setError(null)

    try {
      const token = sessionStorage.getItem("auth_token")
      const user_id = sessionStorage.getItem("user_id")

      if (!token || !user_id) {
        throw new Error("Authentication required")
      }

      // Call the delete account API
      await deleteUserAccount(token, user_id)

      // Clear user data and redirect
      sessionStorage.removeItem("auth_token")
      sessionStorage.removeItem("user_id")
      sessionStorage.removeItem("roles")
      sessionStorage.removeItem("user")
      localStorage.clear()

      // Redirect to home page after deletion
      router.push("/")
    } catch (err) {
      console.error("Account deletion error:", err)
      setError(err.message || "Failed to delete account")
      setIsDeleting(false)
    }
  }

  const cancelDeletion = () => {
    setShowFinalConfirmation(false)
    setConfirmation("")
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <div className="flex-grow flex flex-col md:flex-row max-w-7xl mx-auto w-full px-4 py-8">
        <div className="w-full md:w-64 mb-6 md:mb-0 md:mr-8">
          <SettingsSidebar />
        </div>

        <div className="flex-grow">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="border-b border-gray-200 px-6 py-4">
              <h1 className="text-xl font-semibold text-gray-800">Delete Account</h1>
              <p className="text-sm text-gray-500 mt-1">Permanently delete your account and all associated data</p>
            </div>

            <div className="p-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm mb-6">
                  {error}
                </div>
              )}

              {!showFinalConfirmation ? (
                <div className="space-y-6">
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <svg
                          className="h-5 w-5 text-red-600"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <path
                            fillRule="evenodd"
                            d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-red-800">Warning: This action cannot be undone</h3>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h2 className="text-lg font-medium text-gray-900">What happens when you delete your account:</h2>
                    <ul className="list-disc pl-5 space-y-2 text-sm text-gray-600">
                      <li>All your personal information will be permanently deleted</li>
                      <li>All your pets' profiles and photos will be removed</li>
                      <li>Your account history and preferences will be erased</li>
                      <li>You will lose access to all services associated with this account</li>
                      <li>This action cannot be reversed or recovered</li>
                    </ul>
                  </div>

                  <div className="border-t border-gray-200 pt-6">
                    <div className="space-y-4">
                      <p className="text-sm text-gray-600">
                        To confirm that you want to delete your account, please type <strong>delete</strong> in the
                        field below:
                      </p>
                      <div className="max-w-md">
                        <input
                          type="text"
                          value={confirmation}
                          onChange={(e) => setConfirmation(e.target.value)}
                          placeholder='Type "delete" to confirm'
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        />
                      </div>
                      <button
                        onClick={handleInitialConfirmation}
                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                      >
                        Continue
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="bg-red-100 border-l-4 border-red-500 p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg
                          className="h-5 w-5 text-red-600"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-red-800">Final confirmation required</h3>
                        <div className="mt-2 text-sm text-red-700">
                          <p>
                            You are about to permanently delete your account. This action cannot be undone. Are you
                            absolutely sure you want to proceed?
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-4">
                    <button
                      onClick={cancelDeletion}
                      className="px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleDelete}
                      disabled={isDeleting}
                      className={`px-4 py-2 rounded-md text-white font-medium ${
                        isDeleting
                          ? "bg-red-400 cursor-not-allowed"
                          : "bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      }`}
                    >
                      {isDeleting ? "Deleting Account..." : "Yes, Delete My Account"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}

export default DeleteAccountPage
