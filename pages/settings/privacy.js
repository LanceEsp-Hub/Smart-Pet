"use client"

import { useState, useEffect } from "react"
import { getUserPrivacySettings, changeUserPassword } from "../../utils/api"
import SettingsSidebar from "../../components/SettingsSidebar"
import Navbar from "../../components/Navbar"
import Footer from "../../components/Footer"
import { useRouter } from "next/router"

const PrivacyPage = () => {
  const router = useRouter()
  const [settings, setSettings] = useState({
    email: "",
    has_password: false,
    is_verified: false,
  })
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [attemptCount, setAttemptCount] = useState(0)
  const [passwordStrength, setPasswordStrength] = useState(0)
  const [countdown, setCountdown] = useState(0)

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const token = sessionStorage.getItem("auth_token")
        const user_id = sessionStorage.getItem("user_id")
        const data = await getUserPrivacySettings(token, user_id)
        setSettings(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setIsLoading(false)
      }
    }
    loadSettings()
  }, [])

  useEffect(() => {
    // Simple password strength checker
    const { newPassword } = passwordForm
    if (!newPassword) {
      setPasswordStrength(0)
      return
    }

    let strength = 0
    // Length check
    if (newPassword.length >= 8) strength += 1
    // Contains number
    if (/\d/.test(newPassword)) strength += 1
    // Contains lowercase
    if (/[a-z]/.test(newPassword)) strength += 1
    // Contains uppercase
    if (/[A-Z]/.test(newPassword)) strength += 1
    // Contains special char
    if (/[^A-Za-z0-9]/.test(newPassword)) strength += 1

    setPasswordStrength(strength)
  }, [passwordForm])

  useEffect(() => {
    // Countdown timer for forced logout
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1)
      }, 1000)
      return () => clearTimeout(timer)
    } else if (countdown === 0 && attemptCount >= 3) {
      forceLogout()
    }
  }, [countdown, attemptCount])

  const handlePasswordChange = (e) => {
    setPasswordForm({
      ...passwordForm,
      [e.target.name]: e.target.value,
    })
    // Clear any previous success/error messages when form is edited
    setSuccess(null)
    setError(null)
  }

  const forceLogout = () => {
    // Clear all session and local storage
    sessionStorage.removeItem("auth_token")
    sessionStorage.removeItem("user_id")
    sessionStorage.removeItem("roles")
    sessionStorage.removeItem("user")
    localStorage.clear()

    // Redirect to login page with message
    router.push({
      pathname: "/login",
      query: {
        message: "For security reasons, you've been logged out due to multiple failed password change attempts",
      },
    })
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    setSuccess(null)

    try {
      const token = sessionStorage.getItem("auth_token")
      const user_id = sessionStorage.getItem("user_id")

      if (passwordForm.newPassword !== passwordForm.confirmPassword) {
        throw new Error("Passwords don't match")
      }

      if (passwordStrength < 3) {
        throw new Error("Password is not strong enough")
      }

      await changeUserPassword(token, user_id, {
        current_password: passwordForm.currentPassword,
        new_password: passwordForm.newPassword,
      })

      // Reset attempt count on success
      setAttemptCount(0)
      setSuccess("Password changed successfully")
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })
    } catch (err) {
      const newAttemptCount = attemptCount + 1
      setAttemptCount(newAttemptCount)

      if (newAttemptCount >= 3) {
        setError("Too many failed attempts. You will be logged out for security reasons.")
        setCountdown(3) // Start 3 second countdown
      } else {
        setError(`${err.message} (${3 - newAttemptCount} attempts remaining)`)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const getPasswordStrengthText = () => {
    if (passwordStrength === 0) return ""
    if (passwordStrength === 1) return "Weak"
    if (passwordStrength === 2) return "Fair"
    if (passwordStrength === 3) return "Good"
    if (passwordStrength === 4) return "Strong"
    return "Very Strong"
  }

  const getPasswordStrengthColor = () => {
    if (passwordStrength === 0) return "bg-gray-200"
    if (passwordStrength === 1) return "bg-red-500"
    if (passwordStrength === 2) return "bg-orange-500"
    if (passwordStrength === 3) return "bg-yellow-500"
    if (passwordStrength === 4) return "bg-green-500"
    return "bg-green-600"
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
              <h1 className="text-xl font-semibold text-gray-800">Privacy & Security</h1>
              <p className="text-sm text-gray-500 mt-1">Manage your password and account security settings</p>
            </div>

            <div className="p-6">
              {isLoading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                </div>
              ) : (
                <div className="space-y-8">
                  {error && (
                    <div
                      className={`px-4 py-3 rounded-md text-sm ${
                        attemptCount >= 3
                          ? "bg-red-100 border border-red-300 text-red-800"
                          : "bg-red-50 border border-red-200 text-red-700"
                      }`}
                    >
                      <div className="flex items-center">
                        <svg
                          className="h-5 w-5 mr-2 text-red-500"
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
                        <span>{error}</span>
                      </div>
                      {attemptCount >= 3 && (
                        <div className="mt-2 font-medium">
                          Logging out in {countdown} second{countdown !== 1 ? "s" : ""}...
                        </div>
                      )}
                    </div>
                  )}

                  {success && (
                    <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md text-sm flex items-center">
                      <svg
                        className="h-5 w-5 mr-2 text-green-500"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span>{success}</span>
                    </div>
                  )}

                  <section className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg font-medium text-gray-800">Change Password</h2>
                      {attemptCount > 0 && attemptCount < 3 && (
                        <div className="flex items-center">
                          <span className="text-sm text-amber-600 font-medium">
                            {3 - attemptCount} attempt{3 - attemptCount !== 1 ? "s" : ""} remaining
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-md text-sm mb-4">
                      <div className="flex">
                        <svg
                          className="h-5 w-5 mr-2 text-blue-500"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span>
                          For security reasons, after 3 failed password change attempts, you will be automatically
                          logged out.
                        </span>
                      </div>
                    </div>

                    <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-md">
                      <div className="space-y-2">
                        <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
                          Current Password
                        </label>
                        <input
                          id="currentPassword"
                          type="password"
                          name="currentPassword"
                          value={passwordForm.currentPassword}
                          onChange={handlePasswordChange}
                          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                            attemptCount >= 3
                              ? "bg-gray-100 border-gray-300 text-gray-500 cursor-not-allowed"
                              : "border-gray-300"
                          }`}
                          required
                          disabled={attemptCount >= 3 || isSubmitting}
                        />
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                          New Password
                        </label>
                        <input
                          id="newPassword"
                          type="password"
                          name="newPassword"
                          value={passwordForm.newPassword}
                          onChange={handlePasswordChange}
                          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                            attemptCount >= 3
                              ? "bg-gray-100 border-gray-300 text-gray-500 cursor-not-allowed"
                              : "border-gray-300"
                          }`}
                          required
                          disabled={attemptCount >= 3 || isSubmitting}
                        />
                        {passwordForm.newPassword && (
                          <div className="mt-2">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-medium text-gray-700">Password Strength:</span>
                              <span
                                className={`text-xs font-medium ${
                                  passwordStrength < 3 ? "text-red-600" : "text-green-600"
                                }`}
                              >
                                {getPasswordStrengthText()}
                              </span>
                            </div>
                            <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className={`h-full ${getPasswordStrengthColor()}`}
                                style={{ width: `${(passwordStrength / 5) * 100}%` }}
                              ></div>
                            </div>
                            <ul className="text-xs text-gray-500 mt-2 space-y-1 list-disc pl-5">
                              <li className={passwordForm.newPassword.length >= 8 ? "text-green-600" : ""}>
                                At least 8 characters
                              </li>
                              <li className={/\d/.test(passwordForm.newPassword) ? "text-green-600" : ""}>
                                At least one number
                              </li>
                              <li className={/[A-Z]/.test(passwordForm.newPassword) ? "text-green-600" : ""}>
                                At least one uppercase letter
                              </li>
                              <li className={/[a-z]/.test(passwordForm.newPassword) ? "text-green-600" : ""}>
                                At least one lowercase letter
                              </li>
                              <li className={/[^A-Za-z0-9]/.test(passwordForm.newPassword) ? "text-green-600" : ""}>
                                At least one special character
                              </li>
                            </ul>
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                          Confirm Password
                        </label>
                        <input
                          id="confirmPassword"
                          type="password"
                          name="confirmPassword"
                          value={passwordForm.confirmPassword}
                          onChange={handlePasswordChange}
                          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                            passwordForm.newPassword &&
                            passwordForm.confirmPassword &&
                            passwordForm.newPassword !== passwordForm.confirmPassword
                              ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                              : "border-gray-300"
                          } ${attemptCount >= 3 ? "bg-gray-100 border-gray-300 text-gray-500 cursor-not-allowed" : ""}`}
                          required
                          disabled={attemptCount >= 3 || isSubmitting}
                        />
                        {passwordForm.newPassword &&
                          passwordForm.confirmPassword &&
                          passwordForm.newPassword !== passwordForm.confirmPassword && (
                            <p className="text-xs text-red-600 mt-1">Passwords don't match</p>
                          )}
                      </div>

                      <div className="pt-2">
                        <button
                          type="submit"
                          disabled={attemptCount >= 3 || isSubmitting}
                          className={`px-4 py-2 rounded-md text-white font-medium ${
                            attemptCount >= 3 || isSubmitting
                              ? "bg-blue-400 cursor-not-allowed"
                              : "bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          }`}
                        >
                          {isSubmitting ? "Changing Password..." : "Change Password"}
                        </button>
                      </div>
                    </form>
                  </section>
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

export default PrivacyPage
