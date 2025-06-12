"use client"

import { useState, useEffect } from "react"
import { getNotificationSettings, updateNotificationSettings } from "../../utils/api"
import SettingsSidebar from "../../components/SettingsSidebar"
import Navbar from "../../components/Navbar"
import Footer from "../../components/Footer"

const NotificationsPage = () => {
  const [settings, setSettings] = useState({
    new_messages: false,
    account_updates: false,
    pet_reminders: false,
    marketing_emails: false,
    push_notifications: false,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [isUpdating, setIsUpdating] = useState(false)

  // Descriptions for each notification type
  const notificationDescriptions = {
    new_messages: "Get notified when you receive new messages from other users or our support team.",
    account_updates: "Receive important updates about your account, security, and privacy.",
    pet_reminders: "Get reminders about your pet's vaccinations, medications, and appointments.",
    marketing_emails: "Receive promotional offers, new features, and other marketing communications.",
    push_notifications: "Allow push notifications on your browser or mobile device.",
  }

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const token = sessionStorage.getItem("auth_token")
        const user_id = sessionStorage.getItem("user_id")
        const data = await getNotificationSettings(token, user_id)
        setSettings(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setIsLoading(false)
      }
    }
    loadSettings()
  }, [])

  const handleToggle = async (field) => {
    setIsUpdating(true)
    const newSettings = { ...settings, [field]: !settings[field] }
    setSettings(newSettings)

    try {
      const token = sessionStorage.getItem("auth_token")
      const user_id = sessionStorage.getItem("user_id")
      await updateNotificationSettings(token, user_id, newSettings)
      setSuccess("Settings saved successfully!")
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError(err.message)
      // Revert on error
      setSettings((prev) => ({ ...prev, [field]: !prev[field] }))
      setTimeout(() => setError(null), 3000)
    } finally {
      setIsUpdating(false)
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
              <h1 className="text-xl font-semibold text-gray-800">Notification Settings</h1>
              <p className="text-sm text-gray-500 mt-1">Manage how and when you receive notifications</p>
            </div>

            <div className="p-6">
              {isLoading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                </div>
              ) : (
                <>
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

                  <div className="space-y-6">
                    <div className="border-b border-gray-200 pb-4">
                      <h2 className="text-lg font-medium text-gray-800 mb-4">Communication Preferences</h2>
                      <div className="space-y-4">
                        {["new_messages", "account_updates"].map((key) => (
                          <div key={key} className="flex items-start justify-between">
                            <div>
                              <label htmlFor={key} className="font-medium text-gray-700">
                                {key === "new_messages" ? "New Messages" : "Account Updates"}
                              </label>
                              <p className="text-sm text-gray-500 mt-1">{notificationDescriptions[key]}</p>
                            </div>
                            <div className="relative inline-block w-12 align-middle select-none mt-1">
                              <input
                                type="checkbox"
                                id={key}
                                checked={settings[key]}
                                onChange={() => !isUpdating && handleToggle(key)}
                                className="opacity-0 absolute h-0 w-0"
                                disabled={isUpdating}
                              />
                              <label
                                htmlFor={key}
                                className={`block overflow-hidden h-6 rounded-full cursor-pointer transition-colors duration-200 ease-in-out ${
                                  settings[key] ? "bg-blue-600" : "bg-gray-300"
                                }`}
                              >
                                <span
                                  className={`block h-6 w-6 rounded-full bg-white shadow transform transition-transform duration-200 ease-in-out ${
                                    settings[key] ? "translate-x-6" : "translate-x-0"
                                  }`}
                                ></span>
                              </label>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="border-b border-gray-200 pb-4">
                      <h2 className="text-lg font-medium text-gray-800 mb-4">Pet Care</h2>
                      <div className="space-y-4">
                        {["pet_reminders"].map((key) => (
                          <div key={key} className="flex items-start justify-between">
                            <div>
                              <label htmlFor={key} className="font-medium text-gray-700">
                                Pet Reminders
                              </label>
                              <p className="text-sm text-gray-500 mt-1">{notificationDescriptions[key]}</p>
                            </div>
                            <div className="relative inline-block w-12 align-middle select-none mt-1">
                              <input
                                type="checkbox"
                                id={key}
                                checked={settings[key]}
                                onChange={() => !isUpdating && handleToggle(key)}
                                className="opacity-0 absolute h-0 w-0"
                                disabled={isUpdating}
                              />
                              <label
                                htmlFor={key}
                                className={`block overflow-hidden h-6 rounded-full cursor-pointer transition-colors duration-200 ease-in-out ${
                                  settings[key] ? "bg-blue-600" : "bg-gray-300"
                                }`}
                              >
                                <span
                                  className={`block h-6 w-6 rounded-full bg-white shadow transform transition-transform duration-200 ease-in-out ${
                                    settings[key] ? "translate-x-6" : "translate-x-0"
                                  }`}
                                ></span>
                              </label>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="border-b border-gray-200 pb-4">
                      <h2 className="text-lg font-medium text-gray-800 mb-4">Marketing</h2>
                      <div className="space-y-4">
                        {["marketing_emails"].map((key) => (
                          <div key={key} className="flex items-start justify-between">
                            <div>
                              <label htmlFor={key} className="font-medium text-gray-700">
                                Marketing Emails
                              </label>
                              <p className="text-sm text-gray-500 mt-1">{notificationDescriptions[key]}</p>
                            </div>
                            <div className="relative inline-block w-12 align-middle select-none mt-1">
                              <input
                                type="checkbox"
                                id={key}
                                checked={settings[key]}
                                onChange={() => !isUpdating && handleToggle(key)}
                                className="opacity-0 absolute h-0 w-0"
                                disabled={isUpdating}
                              />
                              <label
                                htmlFor={key}
                                className={`block overflow-hidden h-6 rounded-full cursor-pointer transition-colors duration-200 ease-in-out ${
                                  settings[key] ? "bg-blue-600" : "bg-gray-300"
                                }`}
                              >
                                <span
                                  className={`block h-6 w-6 rounded-full bg-white shadow transform transition-transform duration-200 ease-in-out ${
                                    settings[key] ? "translate-x-6" : "translate-x-0"
                                  }`}
                                ></span>
                              </label>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h2 className="text-lg font-medium text-gray-800 mb-4">Device Settings</h2>
                      <div className="space-y-4">
                        {["push_notifications"].map((key) => (
                          <div key={key} className="flex items-start justify-between">
                            <div>
                              <label htmlFor={key} className="font-medium text-gray-700">
                                Push Notifications
                              </label>
                              <p className="text-sm text-gray-500 mt-1">{notificationDescriptions[key]}</p>
                            </div>
                            <div className="relative inline-block w-12 align-middle select-none mt-1">
                              <input
                                type="checkbox"
                                id={key}
                                checked={settings[key]}
                                onChange={() => !isUpdating && handleToggle(key)}
                                className="opacity-0 absolute h-0 w-0"
                                disabled={isUpdating}
                              />
                              <label
                                htmlFor={key}
                                className={`block overflow-hidden h-6 rounded-full cursor-pointer transition-colors duration-200 ease-in-out ${
                                  settings[key] ? "bg-blue-600" : "bg-gray-300"
                                }`}
                              >
                                <span
                                  className={`block h-6 w-6 rounded-full bg-white shadow transform transition-transform duration-200 ease-in-out ${
                                    settings[key] ? "translate-x-6" : "translate-x-0"
                                  }`}
                                ></span>
                              </label>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
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

export default NotificationsPage
