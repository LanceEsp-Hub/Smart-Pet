"use client"

import { useState, useEffect } from "react"
import Navbar from "../../components/Navbar"
import Footer from "../../components/Footer"
import SettingsSidebar from "../../components/SettingsSidebar"
import { getAddress, updateAddress } from "../../utils/api"

const AddressPage = () => {
  const [formData, setFormData] = useState({
    street: "",
    barangay: "",
    city: "",
    state: "",
    zip_code: "",
    country: "",
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [hasAddress, setHasAddress] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = sessionStorage.getItem("auth_token")
        const user_id = sessionStorage.getItem("user_id")
        const address = await getAddress(token, user_id)

        if (address) {
          setFormData(address)
          setHasAddress(true)
        }
      } catch (err) {
        setError(err.message)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    // Clear any previous success/error messages when form is edited
    setSuccess(null)
    setError(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    setSuccess(null)

    try {
      const token = sessionStorage.getItem("auth_token")
      const user_id = sessionStorage.getItem("user_id")
      await updateAddress(token, user_id, formData)
      setHasAddress(true)
      setSuccess("Address saved successfully")
    } catch (err) {
      setError(err.message || "Failed to update address")
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
              <h1 className="text-xl font-semibold text-gray-800">Address</h1>
              <p className="text-sm text-gray-500 mt-1">Manage your shipping and billing address</p>
            </div>

            <div className="p-6">
              {isLoading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                </div>
              ) : (
                <>
                  {!hasAddress && (
                    <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-md text-sm mb-6">
                      <div className="flex">
                        <svg
                          className="h-5 w-5 text-amber-400 mr-2"
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
                        <span>Please set up your address information</span>
                      </div>
                    </div>
                  )}

                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm mb-6">
                      {error}
                    </div>
                  )}

                  {success && (
                    <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md text-sm mb-6">
                      {success}
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label htmlFor="street" className="block text-sm font-medium text-gray-700">
                          Street Address
                        </label>
                        <input
                          id="street"
                          type="text"
                          name="street"
                          value={formData.street}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="barangay" className="block text-sm font-medium text-gray-700">
                          Barangay
                        </label>
                        <input
                          id="barangay"
                          type="text"
                          name="barangay"
                          value={formData.barangay}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                          City
                        </label>
                        <input
                          id="city"
                          type="text"
                          name="city"
                          value={formData.city}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="state" className="block text-sm font-medium text-gray-700">
                          State/Province
                        </label>
                        <input
                          id="state"
                          type="text"
                          name="state"
                          value={formData.state}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="zip_code" className="block text-sm font-medium text-gray-700">
                          ZIP/Postal Code
                        </label>
                        <input
                          id="zip_code"
                          type="text"
                          name="zip_code"
                          value={formData.zip_code}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="country" className="block text-sm font-medium text-gray-700">
                          Country
                        </label>
                        <input
                          id="country"
                          type="text"
                          name="country"
                          value={formData.country}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
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
                        {isSubmitting ? "Saving..." : "Save Address"}
                      </button>
                    </div>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}

export default AddressPage
