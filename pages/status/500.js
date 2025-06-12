"use client"

import { useRouter } from "next/router"
import { useState, useEffect } from "react"
import { Home, RefreshCw, Send, PawPrint, AlertTriangle } from "lucide-react"
import Head from "next/head"

export default function Custom500() {
  const router = useRouter()
  const [isLoaded, setIsLoaded] = useState(false)
  const [showContact, setShowContact] = useState(false)
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  // Animation effect when component mounts
  useEffect(() => {
    setIsLoaded(true)

    // Simulate yarn ball movement
    const yarnBall = document.getElementById("yarn-ball")
    if (yarnBall) {
      let position = 0
      let direction = 1

      const moveYarn = () => {
        position += direction * 0.5
        if (position > 20 || position < -20) {
          direction *= -1
        }
        yarnBall.style.transform = `translateX(${position}px)`
      }

      const interval = setInterval(moveYarn, 50)
      return () => clearInterval(interval)
    }
  }, [])

  const handleSubmit = (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate sending error report
    setTimeout(() => {
      setIsSubmitting(false)
      setSubmitSuccess(true)
      setEmail("")
      setMessage("")

      // Hide success message after 3 seconds
      setTimeout(() => {
        setSubmitSuccess(false)
        setShowContact(false)
      }, 3000)
    }, 1500)
  }

  return (
    <>
      <Head>
        <title>Server Error | Pet Finder</title>
      </Head>

      <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white flex flex-col items-center justify-center px-4 relative overflow-hidden">
        {/* Background elements */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Animated paw prints */}
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute opacity-10"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                transform: `rotate(${Math.random() * 360}deg) scale(${0.5 + Math.random() * 1})`,
              }}
            >
              <PawPrint size={30} className="text-orange-400" />
            </div>
          ))}

          {/* Animated yarn strings */}
          {[...Array(8)].map((_, i) => (
            <div
              key={`yarn-${i}`}
              className="absolute opacity-10 border-2 border-dashed border-orange-300 rounded-full"
              style={{
                width: `${100 + i * 50}px`,
                height: `${100 + i * 50}px`,
                left: `${Math.random() * 80}%`,
                top: `${Math.random() * 80}%`,
                animationDuration: `${20 + i * 5}s`,
                animationDelay: `${i * 0.5}s`,
              }}
            ></div>
          ))}
        </div>

        {/* Main content */}
        <div
          className={`max-w-md w-full text-center transition-all duration-700 transform ${
            isLoaded ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
          }`}
        >
          {/* Cat animation */}
          <div className="relative w-64 h-64 mx-auto mb-6">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-40 h-40 relative">
                {/* Cat body */}
                <div className="absolute w-32 h-20 bg-orange-400 rounded-3xl bottom-0 left-4 animate-cat-breathe"></div>

                {/* Cat head */}
                <div className="absolute w-24 h-22 bg-orange-400 rounded-full top-2 left-8 animate-cat-breathe"></div>

                {/* Cat ears */}
                <div className="absolute w-10 h-10 bg-orange-400 clip-path-triangle -top-4 left-10 transform -rotate-12 animate-cat-ear"></div>
                <div className="absolute w-10 h-10 bg-orange-400 clip-path-triangle -top-4 right-10 transform rotate-12 animate-cat-ear"></div>

                {/* Cat inner ears */}
                <div className="absolute w-6 h-6 bg-pink-200 clip-path-triangle -top-2 left-12 transform -rotate-12 animate-cat-ear"></div>
                <div className="absolute w-6 h-6 bg-pink-200 clip-path-triangle -top-2 right-12 transform rotate-12 animate-cat-ear"></div>

                {/* Cat tail */}
                <div className="absolute w-4 h-20 bg-orange-400 rounded-full -bottom-2 -right-10 origin-bottom animate-cat-tail"></div>

                {/* Cat face */}
                <div className="absolute w-16 h-12 bg-orange-200 rounded-full top-8 left-12"></div>

                {/* Cat eyes - closed when error */}
                <div className="absolute w-3 h-0.5 bg-gray-800 rounded-full top-12 left-14 animate-cat-blink"></div>
                <div className="absolute w-3 h-0.5 bg-gray-800 rounded-full top-12 right-14 animate-cat-blink"></div>

                {/* Cat nose */}
                <div className="absolute w-3 h-2 bg-pink-300 rounded-full top-14 left-18.5 transform translate-x-0"></div>

                {/* Cat whiskers */}
                <div className="absolute w-8 h-0.5 bg-gray-300 top-15 left-6 transform -rotate-12"></div>
                <div className="absolute w-8 h-0.5 bg-gray-300 top-16 left-6 transform -rotate-6"></div>
                <div className="absolute w-8 h-0.5 bg-gray-300 top-15 right-6 transform rotate-12"></div>
                <div className="absolute w-8 h-0.5 bg-gray-300 top-16 right-6 transform rotate-6"></div>

                {/* Yarn ball */}
                <div
                  id="yarn-ball"
                  className="absolute w-10 h-10 bg-red-400 rounded-full bottom-0 -left-12 animate-yarn-bounce shadow-md"
                ></div>

                {/* Error symbol */}
                <div className="absolute -top-10 right-0 text-4xl text-red-500 animate-pulse">
                  <AlertTriangle size={32} />
                </div>
              </div>
            </div>

            {/* 500 text with animation */}
            <div className="absolute bottom-0 left-0 right-0 text-center">
              <h1 className="text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-400 animate-pulse">
                500
              </h1>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-800 mb-4">Server Error</h2>
          <p className="text-gray-600 mb-8">
            Oops! Something went wrong on our end. Our cat seems to have tangled up our server's yarn. We're working to
            fix it!
          </p>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => router.reload()}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-400 text-white rounded-lg hover:from-orange-600 hover:to-orange-500 transition-all shadow-md hover:shadow-lg"
            >
              <RefreshCw size={18} />
              Try Again
            </button>

            <button
              onClick={() => router.push("/")}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-white text-orange-500 border border-orange-200 rounded-lg hover:bg-orange-50 transition-all shadow-sm hover:shadow-md"
            >
              <Home size={18} />
              Go Home
            </button>

            <button
              onClick={() => setShowContact((prev) => !prev)}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-white text-orange-500 border border-orange-200 rounded-lg hover:bg-orange-50 transition-all shadow-sm hover:shadow-md"
            >
              <Send size={18} />
              Report Issue
            </button>
          </div>

          {/* Contact form */}
          {showContact && (
            <div className="mt-8 bg-white p-6 rounded-xl shadow-md border border-orange-100 animate-fade-in">
              {submitSuccess ? (
                <div className="text-green-600 flex flex-col items-center gap-2">
                  <CheckCircle size={32} />
                  <p>Thank you! We've received your report.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="text-left">
                  <h3 className="text-lg font-semibold mb-4 text-gray-800">Report the Issue</h3>

                  <div className="mb-4">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Your Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="email@example.com"
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                      What Happened?
                    </label>
                    <textarea
                      id="message"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      rows={3}
                      placeholder="Describe what you were doing when the error occurred..."
                      required
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-400 text-white rounded-lg hover:from-orange-600 hover:to-orange-500 transition-all shadow-md disabled:opacity-70"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send size={16} />
                        Send Report
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          )}
        </div>

        {/* Footer note */}
        <div className="absolute bottom-4 text-center text-sm text-gray-500">
          <p>Our team has been automatically notified. We'll fix this as soon as possible!</p>
        </div>
      </div>

      {/* Custom animations */}
      <style jsx>{`
        @keyframes cat-breathe {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.02); }
        }
        
        @keyframes cat-tail {
          0%, 100% { transform: rotate(10deg); }
          50% { transform: rotate(-10deg); }
        }
        
        @keyframes cat-ear {
          0%, 100% { transform: rotate(var(--rotation, -12deg)); }
          30% { transform: rotate(calc(var(--rotation, -12deg) - 3deg)); }
        }
        
        @keyframes cat-blink {
          0%, 90%, 100% { height: 0.5px; }
          95% { height: 3px; border-radius: 50%; }
        }
        
        @keyframes yarn-bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-cat-breathe {
          animation: cat-breathe 4s infinite ease-in-out;
        }
        
        .animate-cat-tail {
          animation: cat-tail 2s infinite ease-in-out;
        }
        
        .animate-cat-ear {
          --rotation: ${(props) => (props.children % 2 === 0 ? "-12deg" : "12deg")};
          animation: cat-ear 3s infinite ease-in-out;
        }
        
        .animate-cat-blink {
          animation: cat-blink 4s infinite;
        }
        
        .animate-yarn-bounce {
          animation: yarn-bounce 0.8s infinite ease-in-out;
        }
        
        .animate-fade-in {
          animation: fade-in 0.3s ease-out forwards;
        }
        
        .clip-path-triangle {
          clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
        }
      `}</style>
    </>
  )
}

// Add this component for the success icon
function CheckCircle({ size = 24 }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
      <polyline points="22 4 12 14.01 9 11.01"></polyline>
    </svg>
  )
}
