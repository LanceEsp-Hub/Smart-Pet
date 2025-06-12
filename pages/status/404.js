"use client"

import { useRouter } from "next/router"
import { useState, useEffect } from "react"
import { Home, Search, ArrowLeft, PawPrint } from "lucide-react"
import Head from "next/head"

export default function Custom404() {
  const router = useRouter()
  const [isLoaded, setIsLoaded] = useState(false)
  const [pawPosition, setPawPosition] = useState({ x: 50, y: 50 })
  const [pawTrail, setPawTrail] = useState([])

  // Animation effect when component mounts
  useEffect(() => {
    setIsLoaded(true)

    // Create random paw prints
    const interval = setInterval(() => {
      const newX = Math.random() * 80 + 10 // 10% to 90% of screen width
      const newY = Math.random() * 60 + 20 // 20% to 80% of screen height

      setPawPosition({ x: newX, y: newY })
      setPawTrail((prev) => {
        const newTrail = [...prev, { x: newX, y: newY, id: Date.now() }]
        // Keep only the last 5 paw prints
        return newTrail.slice(-5)
      })
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  return (
    <>
      <Head>
        <title>Page Not Found | Pet Finder</title>
      </Head>

      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white flex flex-col items-center justify-center px-4 relative overflow-hidden">
        {/* Animated paw prints */}
        {pawTrail.map((paw, index) => (
          <div
            key={paw.id}
            className="absolute opacity-20 animate-fade-in-out"
            style={{
              left: `${paw.x}%`,
              top: `${paw.y}%`,
              animationDelay: `${index * 0.2}s`,
              transform: `rotate(${Math.random() * 60 - 30}deg) scale(${0.5 + Math.random() * 0.5})`,
            }}
          >
            <PawPrint size={24} className="text-purple-400" />
          </div>
        ))}

        {/* Main content */}
        <div
          className={`max-w-md w-full text-center transition-all duration-700 transform ${isLoaded ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}
        >
          {/* Pet animation */}
          <div className="relative w-64 h-64 mx-auto mb-6">
            {/* Dog silhouette */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-40 h-40 relative">
                {/* Dog body */}
                <div className="absolute w-32 h-24 bg-purple-500 rounded-3xl bottom-0 left-4 animate-breathe"></div>

                {/* Dog head */}
                <div className="absolute w-20 h-20 bg-purple-500 rounded-full top-0 left-10 animate-breathe"></div>

                {/* Dog ears */}
                <div className="absolute w-10 h-14 bg-purple-500 rounded-full -top-2 left-6 transform -rotate-12 animate-ear"></div>
                <div className="absolute w-10 h-14 bg-purple-500 rounded-full -top-2 right-6 transform rotate-12 animate-ear"></div>

                {/* Dog tail */}
                <div className="absolute w-4 h-12 bg-purple-500 rounded-full -bottom-2 -right-2 origin-bottom animate-wag"></div>

                {/* Dog face */}
                <div className="absolute w-14 h-10 bg-white rounded-full top-6 left-13 transform translate-x-3"></div>

                {/* Dog eyes */}
                <div className="absolute w-2 h-2 bg-gray-800 rounded-full top-10 left-14"></div>
                <div className="absolute w-2 h-2 bg-gray-800 rounded-full top-10 right-14"></div>

                {/* Dog nose */}
                <div className="absolute w-4 h-3 bg-gray-800 rounded-full top-14 left-18 transform translate-x-0"></div>

                {/* Question mark */}
                <div className="absolute -top-8 right-0 text-4xl font-bold text-purple-500 animate-bounce">?</div>
              </div>
            </div>

            {/* 404 text with animation */}
            <div className="absolute bottom-0 left-0 right-0 text-center">
              <h1 className="text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-purple-400 animate-pulse">
                404
              </h1>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-800 mb-4">Oops! Page Not Found</h2>
          <p className="text-gray-600 mb-8">
            Looks like this page has gone missing, just like a lost pet. Don't worry, we can help you find your way
            back!
          </p>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => router.push("/")}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-500 text-white rounded-lg hover:from-purple-700 hover:to-purple-600 transition-all shadow-md hover:shadow-lg"
            >
              <Home size={18} />
              Go Home
            </button>

            <button
              onClick={() => router.back()}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-white text-purple-600 border border-purple-200 rounded-lg hover:bg-purple-50 transition-all shadow-sm hover:shadow-md"
            >
              <ArrowLeft size={18} />
              Go Back
            </button>

            <button
              onClick={() => router.push("/search")}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-white text-purple-600 border border-purple-200 rounded-lg hover:bg-purple-50 transition-all shadow-sm hover:shadow-md"
            >
              <Search size={18} />
              Search
            </button>
          </div>
        </div>

        {/* Paw print trail at bottom */}
        <div className="absolute bottom-8 left-0 right-0 flex justify-center space-x-4 opacity-50">
          {[...Array(5)].map((_, i) => (
            <PawPrint
              key={i}
              size={i % 2 === 0 ? 20 : 16}
              className={`text-purple-400 transform ${i % 2 === 0 ? "rotate-12" : "-rotate-12"}`}
            />
          ))}
        </div>
      </div>

      {/* Custom animations */}
      <style jsx>{`
        @keyframes breathe {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.03); }
        }
        
        @keyframes wag {
          0%, 100% { transform: rotate(-10deg); }
          50% { transform: rotate(10deg); }
        }
        
        @keyframes ear {
          0%, 100% { transform: rotate(var(--rotation, -12deg)); }
          50% { transform: rotate(calc(var(--rotation, -12deg) - 5deg)); }
        }
        
        @keyframes fade-in-out {
          0% { opacity: 0; transform: translateY(10px) scale(0.9); }
          20% { opacity: 0.2; transform: translateY(0) scale(1); }
          80% { opacity: 0.2; transform: translateY(0) scale(1); }
          100% { opacity: 0; transform: translateY(-10px) scale(0.9); }
        }
        
        .animate-breathe {
          animation: breathe 3s infinite ease-in-out;
        }
        
        .animate-wag {
          animation: wag 0.5s infinite ease-in-out;
        }
        
        .animate-ear {
          --rotation: ${(props) => (props.children % 2 === 0 ? "-12deg" : "12deg")};
          animation: ear 3s infinite ease-in-out;
        }
        
        .animate-fade-in-out {
          animation: fade-in-out 4s forwards;
        }
      `}</style>
    </>
  )
}
