"use client"

import { useState, useEffect } from "react"
import { Wrench, Clock, Calendar, Mail, Bell, PawPrint } from "lucide-react"
import Head from "next/head"

export default function Maintenance() {
  const [isLoaded, setIsLoaded] = useState(false)
  const [timeLeft, setTimeLeft] = useState({
    hours: 2,
    minutes: 30,
    seconds: 0,
  })
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [toolRotation, setToolRotation] = useState(0)

  // Animation effect when component mounts
  useEffect(() => {
    setIsLoaded(true)

    // Tool rotation animation
    const toolInterval = setInterval(() => {
      setToolRotation((prev) => (prev + 5) % 360)
    }, 100)

    // Countdown timer
    const countdownInterval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 }
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 }
        } else if (prev.hours > 0) {
          return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 }
        }
        return prev
      })
    }, 1000)

    return () => {
      clearInterval(toolInterval)
      clearInterval(countdownInterval)
    }
  }, [])

  const handleSubmit = (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate sending notification request
    setTimeout(() => {
      setIsSubmitting(false)
      setSubmitSuccess(true)
      setEmail("")
    }, 1500)
  }

  // Format time with leading zeros
  const formatTime = (value) => {
    return value.toString().padStart(2, "0")
  }

  return (
    <>
      <Head>
        <title>Scheduled Maintenance | Pet Finder</title>
      </Head>

      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex flex-col items-center justify-center px-4 relative overflow-hidden">
        {/* Background elements */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Animated paw prints */}
          {[...Array(10)].map((_, i) => (
            <div
              key={i}
              className="absolute opacity-10"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                transform: `rotate(${Math.random() * 360}deg) scale(${0.5 + Math.random() * 0.5})`,
              }}
            >
              <PawPrint size={24} className="text-green-400" />
            </div>
          ))}

          {/* Tool icons */}
          {[...Array(5)].map((_, i) => (
            <div
              key={`tool-${i}`}
              className="absolute opacity-5"
              style={{
                left: `${15 + i * 20}%`,
                top: `${10 + (i % 3) * 30}%`,
                transform: `rotate(${Math.random() * 40 - 20}deg)`,
              }}
            >
              <Wrench size={30 + i * 5} className="text-green-500" />
            </div>
          ))}
        </div>

        {/* Main content */}
        <div
          className={`max-w-lg w-full text-center transition-all duration-700 transform ${
            isLoaded ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
          }`}
        >
          {/* Maintenance illustration */}
          <div className="relative w-64 h-64 mx-auto mb-6">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-48 h-48 relative">
                {/* Turtle body */}
                <div className="absolute w-32 h-24 bg-green-500 rounded-full bottom-0 left-8"></div>

                {/* Turtle shell */}
                <div className="absolute w-40 h-32 bg-green-700 rounded-full top-0 left-4 overflow-hidden">
                  {/* Shell pattern */}
                  <div className="absolute w-36 h-28 bg-green-600 rounded-full top-2 left-2"></div>
                  <div className="absolute w-6 h-6 bg-green-800 rounded-full top-4 left-6"></div>
                  <div className="absolute w-6 h-6 bg-green-800 rounded-full top-4 right-6"></div>
                  <div className="absolute w-6 h-6 bg-green-800 rounded-full bottom-4 left-6"></div>
                  <div className="absolute w-6 h-6 bg-green-800 rounded-full bottom-4 right-6"></div>
                  <div className="absolute w-8 h-8 bg-green-800 rounded-full top-12 left-16"></div>
                </div>

                {/* Turtle head */}
                <div className="absolute w-12 h-10 bg-green-500 rounded-full top-14 left-0 animate-turtle-head"></div>

                {/* Turtle eye */}
                <div className="absolute w-3 h-3 bg-white rounded-full top-16 left-2">
                  <div className="absolute w-1.5 h-1.5 bg-black rounded-full top-0.5 left-0.5"></div>
                </div>

                {/* Turtle legs */}
                <div className="absolute w-8 h-6 bg-green-500 rounded-full bottom-2 left-4 animate-turtle-leg"></div>
                <div className="absolute w-8 h-6 bg-green-500 rounded-full bottom-2 right-4 animate-turtle-leg delay-100"></div>
                <div className="absolute w-8 h-6 bg-green-500 rounded-full top-10 left-2 animate-turtle-leg delay-200"></div>
                <div className="absolute w-8 h-6 bg-green-500 rounded-full top-10 right-2 animate-turtle-leg delay-300"></div>

                {/* Turtle tail */}
                <div className="absolute w-6 h-4 bg-green-500 rounded-full bottom-4 right-0 animate-turtle-tail"></div>

                {/* Wrench */}
                <div
                  className="absolute top-0 right-0"
                  style={{ transform: `rotate(${toolRotation}deg)`, transformOrigin: "center" }}
                >
                  <Wrench size={24} className="text-gray-600" />
                </div>
              </div>
            </div>

            {/* Maintenance text */}
            <div className="absolute bottom-0 left-0 right-0 text-center">
              <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-green-400">
                Under Maintenance
              </h1>
            </div>
          </div>

          <h2 className="text-3xl font-bold text-gray-800 mb-4">We're Working On It!</h2>
          <p className="text-gray-600 mb-8">
            Our site is currently undergoing scheduled maintenance. Like our turtle friend, we're working slowly but
            surely to improve your experience. We'll be back soon!
          </p>

          {/* Countdown timer */}
          <div className="mb-8">
            <p className="text-sm text-gray-500 mb-2 flex items-center justify-center gap-1">
              <Clock size={16} />
              Estimated time remaining:
            </p>
            <div className="flex justify-center gap-4 text-2xl font-bold">
              <div className="bg-white p-3 rounded-lg shadow-sm w-16 border border-green-100">
                <div className="text-green-600">{formatTime(timeLeft.hours)}</div>
                <div className="text-xs text-gray-500 font-normal">Hours</div>
              </div>
              <div className="bg-white p-3 rounded-lg shadow-sm w-16 border border-green-100">
                <div className="text-green-600">{formatTime(timeLeft.minutes)}</div>
                <div className="text-xs text-gray-500 font-normal">Minutes</div>
              </div>
              <div className="bg-white p-3 rounded-lg shadow-sm w-16 border border-green-100">
                <div className="text-green-600">{formatTime(timeLeft.seconds)}</div>
                <div className="text-xs text-gray-500 font-normal">Seconds</div>
              </div>
            </div>
          </div>

          {/* Notification form */}
          <div className="bg-white p-6 rounded-xl shadow-md border border-green-100">
            {submitSuccess ? (
              <div className="text-green-600 flex flex-col items-center gap-2 py-4">
                <Bell size={32} />
                <p>Thank you! We'll notify you when we're back online.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="text-left">
                <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2">
                  <Bell size={18} className="text-green-500" />
                  Get Notified When We're Back
                </h3>

                <div className="flex gap-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Your email address"
                    required
                  />
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-400 text-white rounded-md hover:from-green-600 hover:to-green-500 transition-all shadow-sm disabled:opacity-70 whitespace-nowrap"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block mr-2"></div>
                        Sending...
                      </>
                    ) : (
                      "Notify Me"
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Maintenance details */}
          <div className="mt-8 bg-green-50 p-5 rounded-xl border border-green-100 text-left">
            <h3 className="text-lg font-semibold mb-3 text-gray-800">Maintenance Details</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <Calendar className="text-green-500 flex-shrink-0 mt-0.5" size={16} />
                <div>
                  <p className="font-medium text-gray-700">Scheduled Period</p>
                  <p className="text-gray-600">May 4, 2025, 5:00 AM - 8:00 AM UTC</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Wrench className="text-green-500 flex-shrink-0 mt-0.5" size={16} />
                <div>
                  <p className="font-medium text-gray-700">What's Happening</p>
                  <p className="text-gray-600">
                    We're upgrading our database and improving search functionality to help reunite more pets with their
                    owners.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Mail className="text-green-500 flex-shrink-0 mt-0.5" size={16} />
                <div>
                  <p className="font-medium text-gray-700">Questions?</p>
                  <p className="text-gray-600">
                    Email us at{" "}
                    <a href="mailto:support@petfinder.com" className="text-green-600 hover:underline">
                      support@petfinder.com
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="absolute bottom-4 text-center text-sm text-gray-500">
          <p>© 2025 Pet Finder. All rights reserved.</p>
        </div>
      </div>

      {/* Custom animations */}
      <style jsx>{`
        @keyframes turtle-head {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(-3px); }
        }
        
        @keyframes turtle-leg {
          0%, 100% { transform: translateX(0) rotate(0deg); }
          50% { transform: translateX(3px) rotate(10deg); }
        }
        
        @keyframes turtle-tail {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(10deg); }
        }
        
        .animate-turtle-head {
          animation: turtle-head 3s infinite ease-in-out;
        }
        
        .animate-turtle-leg {
          animation: turtle-leg 2s infinite ease-in-out;
        }
        
        .animate-turtle-tail {
          animation: turtle-tail 2s infinite ease-in-out;
        }
        
        .delay-100 {
          animation-delay: 0.1s;
        }
        
        .delay-200 {
          animation-delay: 0.2s;
        }
        
        .delay-300 {
          animation-delay: 0.3s;
        }
      `}</style>
    </>
  )
}
