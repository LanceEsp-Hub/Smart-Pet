"use client"

import { useState, useEffect } from "react"
import { getUserProfile, uploadProfilePicture, updateUserProfile } from "../../utils/api"
import SettingsSidebar from "../../components/SettingsSidebar"
import Navbar from "../../components/Navbar"
import Footer from "../../components/Footer"

// Define API_URL (was missing in your original code)
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

const AccountInformationPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone_number: "",
    profile_picture: "",
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [previewUrl, setPreviewUrl] = useState(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        const token = sessionStorage.getItem("auth_token")
        const user_id = sessionStorage.getItem("user_id")

        if (!token || !user_id) {
          throw new Error("Authentication required")
        }

        const response = await getUserProfile(token, user_id)
        setFormData({
          name: response.name || "",
          email: response.email || "",
          phone_number: response.phone_number || "",
          // profile_picture: response.profile_picture || "",
          profile_picture: response.profile_picture_filename // If you change the API

        })

        if (response.profile_picture) {
          // setPreviewUrl(`${API_URL}/uploads/profile_pictures/${response.profile_picture}`)
              setPreviewUrl(response.profile_picture);

        }
      } catch (err) {
        setError(err.message)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    // Clear any previous success/error messages when form is edited
    setSuccess(null)
    setError(null)
  }

  // const handleFileUpload = async (e) => {
  //   try {
  //     const token = sessionStorage.getItem("auth_token")
  //     const file = e.target.files[0]

  //     if (!file) return

  //     // Show preview immediately
  //     const reader = new FileReader()
  //     reader.onload = (e) => {
  //       setPreviewUrl(e.target.result)
  //     }
  //     reader.readAsDataURL(file)

  //     // Upload to server
  //     setIsSubmitting(true)
  //     const uploadResult = await uploadProfilePicture(token, file)
  //     setFormData({ ...formData, profile_picture: uploadResult.filename })
  //     setSuccess("Profile picture uploaded successfully")
  //   } catch (err) {
  //     setError(err.message || "Failed to upload profile picture")
  //   } finally {
  //     setIsSubmitting(false)
  //   }
  // }

  const handleFileUpload = async (e) => {
  const uploadResult = await uploadProfilePicture(token, file);
  
  // Update both the preview and form data
  setPreviewUrl(uploadResult.url);
  setFormData(prev => ({
    ...prev,
    profile_picture: uploadResult.filename  // Store filename only
  }));
};

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    setSuccess(null)

    try {
      const token = sessionStorage.getItem("auth_token")
      const user_id = sessionStorage.getItem("user_id")

      const updatePayload = {
        name: formData.name,
        phone_number: formData.phone_number,
        profile_picture: formData.profile_picture,
      }

      await updateUserProfile(token, user_id, updatePayload)
      setSuccess("Profile updated successfully")
    } catch (err) {
      console.error("Update error:", err)
      setError(err.message || "Failed to update profile")
    } finally {
      setIsSubmitting(false)
    }
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
              <h1 className="text-xl font-semibold text-gray-800">Account Information</h1>
              <p className="text-sm text-gray-500 mt-1">Update your personal details and profile picture</p>
            </div>

            <div className="p-6">
              {isLoading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                      {error}
                    </div>
                  )}

                  {success && (
                    <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md text-sm">
                      {success}
                    </div>
                  )}

                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="md:w-2/3 space-y-6">
                      <div className="space-y-2">
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                          Full Name
                        </label>
                        <input
                          id="name"
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                          Email Address
                        </label>
                        <input
                          id="email"
                          type="email"
                          name="email"
                          value={formData.email}
                          disabled
                          className="w-full px-3 py-2 border border-gray-200 bg-gray-50 rounded-md shadow-sm text-gray-500 cursor-not-allowed"
                        />
                        <p className="text-xs text-gray-500">Your email address cannot be changed</p>
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700">
                          Phone Number
                        </label>
                        <input
                          id="phone_number"
                          type="tel"
                          name="phone_number"
                          value={formData.phone_number}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>

                    <div className="md:w-1/3">
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Profile Picture</label>
                        <div className="flex flex-col items-center">
                          <div className="w-32 h-32 mb-4 rounded-full overflow-hidden bg-gray-100 border border-gray-200 flex items-center justify-center">
                            {previewUrl ? (
                              <img
                                src={previewUrl || "/placeholder.svg"}
                                alt="Profile"
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.onerror = null
                                  e.target.src = "/default-profile.jpg"
                                }}
                              />
                            ) : (
                              <svg className="h-16 w-16 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                              </svg>
                            )}
                          </div>
                          <label
                            htmlFor="profile_picture"
                            className="cursor-pointer px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-500"
                          >
                            Change photo
                          </label>
                          <input
                            id="profile_picture"
                            type="file"
                            accept="image/*"
                            onChange={handleFileUpload}
                            className="hidden"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className={`px-4 py-2 rounded-md text-white font-medium ${
                        isSubmitting
                          ? "bg-blue-400 cursor-not-allowed"
                          : "bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      }`}
                    >
                      {isSubmitting ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />

      <style jsx>{`
        /* Add any additional custom styles here */
        @media (max-width: 768px) {
          .settings-container {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  )
}

export default AccountInformationPage
