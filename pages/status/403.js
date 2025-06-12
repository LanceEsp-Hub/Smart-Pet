"use client"

import { useRouter } from "next/router"
import { useState, useEffect } from "react"
import { Home, LogIn, ArrowLeft, Lock, Shield } from "lucide-react"
import Head from "next/head"

export default function Custom403() {
  const router = useRouter()
  const [isLoaded, setIsLoaded] = useState(false)
  const [birdPosition, setBirdPosition] = useState({ x: 50, y: 30 })
  const [cageShake, setCageShake] = useState(false)

  // Animation effect when component mounts
  useEffect(() => {
    setIsLoaded(true)

    // Bird movement animation
    const birdInterval = setInterval(() => {
      setBirdPosition({
        x: 50 + Math.sin(Date.now() / 1000) * 5,
        y: 30 + Math.cos(Date.now() / 800) * 3,
      })
    }, 50)

    // Cage shake animation
    const shakeInterval = setInterval(() => {
      setCageShake(true)
      setTimeout(() => setCageShake(false), 300)
    }, 3000)

    return () => {
      clearInterval(birdInterval)
      clearInterval(shakeInterval)
    }
  }, [])

  return (
    <>
      <Head>
        <title>Access Denied | Pet Finder</title>
      </Head>

      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col items-center justify-center px-4 relative overflow-hidden">
        {/* Background elements */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Animated feathers */}
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute opacity-10 animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDuration: `${10 + Math.random() * 20}s`,
                animationDelay: `${i * 0.5}s`,
              }}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="text-blue-300"
                style={{
                  transform: `rotate(${Math.random() * 360}deg) scale(${0.5 + Math.random() * 0.5})`,
                }}
              >
                <path
                  d="M20.901 3.515C17.503 1.403 8.074 7.194 6.582 9.472C5.09 11.75 7.979 12.534 9.464 10.256C10.949 7.978 16.715 3.515 20.901 3.515Z"
                  fill="currentColor"
                  fillOpacity="0.2"
                />
              </svg>
            </div>
          ))}

          {/* Lock icons */}
          {[...Array(4)].map((_, i) => (
            <div
              key={`lock-${i}`}
              className="absolute opacity-5"
              style={{
                left: `${15 + i * 25}%`,
                top: `${20 + (i % 2) * 50}%`,
                transform: `rotate(${Math.random() * 20 - 10}deg) scale(${1 + Math.random() * 1})`,
              }}
            >
              <Lock size={40 + i * 10} className="text-blue-400" />
            </div>
          ))}
        </div>

        {/* Main content */}
        <div
          className={`max-w-md w-full text-center transition-all duration-700 transform ${
            isLoaded ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
          }`}
        >
          {/* Bird in cage animation */}
          <div className="relative w-64 h-64 mx-auto mb-6">
            {/* Cage */}
            <div
              className={`absolute inset-0 flex items-center justify-center transition-transform ${
                cageShake ? "animate-cage-shake" : ""
              }`}
            >
              <div className="w-48 h-56 relative">
                {/* Cage top */}
                <div className="absolute w-48 h-8 bg-blue-500 rounded-t-full top-0 left-0"></div>

                {/* Cage bars */}
                {[...Array(9)].map((_, i) => (
                  <div
                    key={`bar-${i}`}
                    className="absolute w-1 bg-blue-500 rounded-full"
                    style={{
                      height: "56px",
                      left: `${i * 6}px`,
                      top: "8px",
                    }}
                  ></div>
                ))}

                {/* Cage right side */}
                {[...Array(9)].map((_, i) => (
                  <div
                    key={`bar-right-${i}`}
                    className="absolute w-1 bg-blue-500 rounded-full"
                    style={{
                      height: "56px",
                      right: `${i * 6}px`,
                      top: "8px",
                    }}
                  ></div>
                ))}

                {/* Cage bottom */}
                <div className="absolute w-48 h-2 bg-blue-500 rounded-b-full bottom-0 left-0"></div>

                {/* Lock on cage */}
                <div className="absolute -right-4 top-24 text-yellow-500 animate-pulse">
                  <Lock size={24} />
                </div>

                {/* Bird inside cage */}
                <div
                  className="absolute w-20 h-20"
                  style={{
                    left: `${birdPosition.x - 10}%`,
                    top: `${birdPosition.y}%`,
                    transition: "all 0.3s ease-out",
                  }}
                >
                  {/* Bird body */}
                  <div className="absolute w-16 h-14 bg-blue-400 rounded-full"></div>

                  {/* Bird head */}
                  <div className="absolute w-10 h-10 bg-blue-400 rounded-full -top-4 left-3"></div>

                  {/* Bird eye */}
                  <div className="absolute w-2 h-2 bg-white rounded-full -top-1 left-7">
                    <div className="absolute w-1 h-1 bg-black rounded-full top-0.5 left-0.5"></div>
                  </div>

                  {/* Bird beak */}
                  <div className="absolute w-4 h-3 bg-yellow-500 clip-path-triangle -top-1 left-11"></div>

                  {/* Bird tail */}
                  <div className="absolute w-6 h-8 bg-blue-500 clip-path-triangle -bottom-2 -left-2 transform rotate-180"></div>

                  {/* Bird wing */}
                  <div className="absolute w-8 h-6 bg-blue-300 rounded-full top-2 left-2 animate-wing-flap"></div>
                </div>
              </div>
            </div>

            {/* 403 text with animation */}
            <div className="absolute bottom-0 left-0 right-0 text-center">
              <h1 className="text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-400 animate-pulse">
                403
              </h1>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-800 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-8">
            Sorry, this area is off-limits! Like our bird in the cage, this content is locked and requires proper
            permissions to access.
          </p>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => router.push("/login")}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg hover:from-blue-700 hover:to-blue-600 transition-all shadow-md hover:shadow-lg"
            >
              <LogIn size={18} />
              Sign In
            </button>

            <button
              onClick={() => router.push("/")}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-white text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-all shadow-sm hover:shadow-md"
            >
              <Home size={18} />
              Go Home
            </button>

            <button
              onClick={() => router.back()}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-white text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-all shadow-sm hover:shadow-md"
            >
              <ArrowLeft size={18} />
              Go Back
            </button>
          </div>

          {/* Security note */}
          <div className="mt-8 p-4 bg-blue-50 border border-blue-100 rounded-lg text-sm text-blue-700 flex items-start gap-3">
            <div className="mt-0.5">
              <Shield size={18} />
            </div>
            <p className="text-left">
              If you believe you should have access to this page, please contact your administrator or sign in with an
              account that has the required permissions.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="absolute bottom-4 text-center text-sm text-gray-500">
          <p>
            Need help? Contact{" "}
            <a href="mailto:support@petfinder.com" className="text-blue-500 hover:underline">
              support@petfinder.com
            </a>
          </p>
        </div>
      </div>

      {/* Custom animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(10deg); }
        }
        
        @keyframes cage-shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          50% { transform: translateX(5px); }
          75% { transform: translateX(-3px); }
        }
        
        @keyframes wing-flap {
          0%, 100% { transform: scaleY(1) rotate(5deg); }
          50% { transform: scaleY(0.8) rotate(-5deg); }
        }
        
        .animate-float {
          animation: float 10s infinite ease-in-out;
        }
        
        .animate-cage-shake {
          animation: cage-shake 0.3s ease-in-out;
        }
        
        .animate-wing-flap {
          animation: wing-flap 0.5s infinite ease-in-out;
        }
        
        .clip-path-triangle {
          clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
        }
      `}</style>
    </>
  )
}
