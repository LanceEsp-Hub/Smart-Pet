//frontend\pages\pet_profile\[id]\similar.js
"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/router"
import { ArrowLeft, Search, Fingerprint, MapPin, MessageSquare, X } from "lucide-react"
import { findSimilarPets, generatePetFingerprint } from "../../../utils/api"
import toast from "react-hot-toast"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"

// Add this CSS animation to the top of the file, right after the imports
const fadeInKeyframes = `
@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}
.animate-fadeIn {
  animation: fadeIn 0.3s ease-out forwards;
}
`

function getPetImageUrl(imageName) {
  if (!imageName) return "https://via.placeholder.com/400"
  // Use Supabase URL construction for pet images
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://fkpimtcxncgwtdsfyrjb.supabase.co"
  const petImagesBucket = process.env.NEXT_PUBLIC_SUPABASE_PET_BUCKET || "pet-images"
  return `${supabaseUrl}/storage/v1/object/public/${petImagesBucket}/${imageName}`
}

// Updated LoadingSpinner with emerald color scheme
function LoadingSpinner() {
  return (
    <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-emerald-200 rounded-full"></div>
          <div className="absolute top-0 left-0 w-20 h-20 border-4 border-emerald-500 rounded-full animate-spin border-t-transparent"></div>

          {/* Paw print icon in the center */}
          <div className="absolute inset-0 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-emerald-500"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M8.5 13.5C9.88071 13.5 11 12.3807 11 11C11 9.61929 9.88071 8.5 8.5 8.5C7.11929 8.5 6 9.61929 6 11C6 12.3807 7.11929 13.5 8.5 13.5Z"
                fill="currentColor"
              />
              <path
                d="M15.5 13.5C16.8807 13.5 18 12.3807 18 11C18 9.61929 16.8807 8.5 15.5 8.5C14.1193 8.5 13 9.61929 13 11C13 12.3807 14.1193 13.5 15.5 13.5Z"
                fill="currentColor"
              />
              <path
                d="M15.5 19.5C16.8807 19.5 18 18.3807 18 17C18 15.6193 16.8807 14.5 15.5 14.5C14.1193 14.5 13 15.6193 13 17C13 18.3807 14.1193 19.5 15.5 19.5Z"
                fill="currentColor"
              />
              <path
                d="M8.5 19.5C9.88071 19.5 11 18.3807 11 17C11 15.6193 9.88071 14.5 8.5 14.5C7.11929 14.5 6 15.6193 6 17C6 18.3807 7.11929 19.5 8.5 19.5Z"
                fill="currentColor"
              />
              <path
                d="M12 8C13.1046 8 14 7.10457 14 6C14 4.89543 13.1046 4 12 4C10.8954 4 10 4.89543 10 6C10 7.10457 10.8954 8 12 8Z"
                fill="currentColor"
              />
            </svg>
          </div>
        </div>
        <div className="mt-6 text-center">
          <h3 className="text-lg font-medium text-gray-800">Finding matches</h3>
          <p className="text-gray-500 mt-1">Looking for similar pets...</p>
        </div>
      </div>
    </div>
  )
}

export default function SimilarPetsPage() {
  const router = useRouter()
  const { id } = router.query
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [sourcePet, setSourcePet] = useState(null)
  const [fingerprintExists, setFingerprintExists] = useState(false)
  const [distanceFilter, setDistanceFilter] = useState("no limit")
  const [threshold, setThreshold] = useState(0.65)
  const [selectedPet, setSelectedPet] = useState(null)
  const [showModal, setShowModal] = useState(false)
  // Add this state variable at the top of the component with other state variables
  const [loadingStartTime, setLoadingStartTime] = useState(0)

  // Add the style tag right after the imports
  useEffect(() => {
    // Add the animation styles to the document
    const style = document.createElement("style")
    style.textContent = fadeInKeyframes
    document.head.appendChild(style)

    return () => {
      // Clean up on unmount
      document.head.removeChild(style)
    }
  }, [])

  // Replace the existing useEffect that loads data with this version
  useEffect(() => {
    if (id) {
      const loadData = async () => {
        try {
          setLoading(true)
          setLoadingStartTime(Date.now()) // Record when loading started

          const { matches } = await findSimilarPets(id, distanceFilter, threshold)
          setMatches(matches)
          setFingerprintExists(true)

          const sourceRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/pets/${id}`)
          if (sourceRes.ok) {
            setSourcePet(await sourceRes.json())
          }
        } catch (error) {
          if (error.response?.status === 404) {
            setFingerprintExists(false)
          } else {
            toast.error(error.message)
          }
        } finally {
          // Calculate how long loading has been active
          const loadingDuration = Date.now() - loadingStartTime
          const minimumLoadingTime = 1000 // 1 second in milliseconds

          // If loading was too fast, wait until we reach the minimum time
          if (loadingDuration < minimumLoadingTime) {
            setTimeout(() => {
              setLoading(false)
            }, minimumLoadingTime - loadingDuration)
          } else {
            // If loading already took longer than the minimum time, set loading to false immediately
            setLoading(false)
          }
        }
      }
      loadData()
    }
  }, [id, distanceFilter, threshold])

  const handleGenerateFingerprint = async () => {
    try {
      setLoading(true)
      setLoadingStartTime(Date.now())
      await generatePetFingerprint(id)
      toast.success("Fingerprint generated successfully!")
      router.reload()
    } catch (error) {
      toast.error(error.message || "Failed to generate fingerprint")
    } finally {
      const loadingDuration = Date.now() - loadingStartTime
      const minimumLoadingTime = 1000

      if (loadingDuration < minimumLoadingTime) {
        setTimeout(() => {
          setLoading(false)
        }, minimumLoadingTime - loadingDuration)
      } else {
        setLoading(false)
      }
    }
  }

  const handlePetClick = (pet) => {
    setSelectedPet(pet)
    setShowModal(true)
  }

  const handleMessageUser = () => {
    try {
      if (!selectedPet?.user?.id) {
        throw new Error('No user ID found for this pet')
      }
      router.push(`/messages/${selectedPet.user.id}`)
    } catch (error) {
      console.error('Failed to navigate to messages:', error)
      // Optional: Show user feedback (toast, alert, etc.)
    }
  }

  const handleDistanceChange = (e) => {
    setDistanceFilter(e.target.value)
  }

  const handleThresholdChange = (e) => {
    setThreshold(Number.parseFloat(e.target.value))
  }

  // Show loading spinner when loading
  if (loading) {
    return <LoadingSpinner />
  }

  // Update the styling for the no fingerprint found section
  if (!fingerprintExists) {
    return (
      <div>
        <Navbar />
        <div className="container mx-auto p-6 max-w-2xl text-center">
          <div className="bg-amber-50 border-l-4 border-amber-400 p-6 mb-8 rounded-r-lg shadow-sm">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Fingerprint className="h-8 w-8 text-amber-500" />
              </div>
              <div className="ml-4">
                <p className="text-amber-800 font-medium">
                  No fingerprint found for this pet. Generate one to find similar pets.
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={handleGenerateFingerprint}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:bg-emerald-300 mx-auto shadow-md transition-all duration-200 font-medium"
          >
            {loading ? "Generating..." : "Generate Fingerprint"}
            <Fingerprint size={18} />
          </button>
        </div>
        <Footer />
      </div>
    )
  }

  // Update the main container styling to match the provided structure
  return (
<div className="min-h-screen bg-white">      <Navbar />

<div className="w-full px-4 sm:px-6 lg:px-8">
<div className="mx-auto w-full max-w-7xl p-6">  {/* Container */}

<div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-emerald-600 hover:text-emerald-800 font-medium transition-colors"
          >
            <ArrowLeft size={18} />
            Back to Pet Profile
          </button>

          {sourcePet && (
            <div className="mt-6 flex items-center gap-5 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
              <img
                src={getPetImageUrl(sourcePet.image) || "/placeholder.svg"}
                alt={sourcePet.name}
                className="w-20 h-20 rounded-full object-cover border-4 border-emerald-100 shadow-md"
              />
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Pets Similar to {sourcePet.name}</h1>
                <p className="text-gray-600 flex items-center gap-2">
                  <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-sm font-medium">
                    {sourcePet.type}
                  </span>
                  {sourcePet.breed && (
                    <span className="inline-block px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-medium">
                      {sourcePet.breed}
                    </span>
                  )}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Filters Section */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">Filter Results</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="distance" className="block text-sm font-medium text-gray-700 mb-2">
                Maximum Distance
              </label>
              <select
                id="distance"
                value={distanceFilter}
                onChange={handleDistanceChange}
                className="block w-full rounded-lg border-gray-200 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm p-3"
              >
                <option value="5m">Nearby (5 meters)</option>
                <option value="1km">Within 1 km</option>
                <option value="3km">Within 3 km</option>
                <option value="5km">Within 5 km</option>
                <option value="no limit">No distance limit</option>
              </select>
            </div>

            <div>
              <label htmlFor="threshold" className="block text-sm font-medium text-gray-700 mb-2">
                Similarity Threshold ({Math.round(threshold * 100)}%)
              </label>
              <input
                type="range"
                id="threshold"
                min="0.5"
                max="1.0"
                step="0.05"
                value={threshold}
                onChange={handleThresholdChange}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 accent-emerald-500"
              />
              <div className="flex justify-between mt-1 text-xs text-gray-500">
                <span>50%</span>
                <span>75%</span>
                <span>100%</span>
              </div>
            </div>
          </div>
        </div>

        {matches.length === 0 ? (
          <div className="bg-white rounded-xl p-10 text-center shadow-sm border border-gray-100">
            <Search size={64} className="mx-auto text-gray-300 mb-6" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">No similar pets found</h3>
            <p className="mt-2 text-gray-500 max-w-md mx-auto">
              We couldn't find any pets with similar features in this area. Try adjusting the filters or expanding your
              search radius.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {matches.map((pet) => (
              <div
                key={pet.pet_id}
                className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 hover:shadow-md transition-all duration-200 cursor-pointer transform hover:-translate-y-1"
                onClick={() => handlePetClick(pet)}
              >
                <div className="relative pb-[75%]">
                  <img
                    src={getPetImageUrl(`${pet.pet_id || "/placeholder.svg"}/main.jpg`)}
                    alt={pet.name}
                    className="absolute h-full w-full object-cover"
                  />
                  {pet.distance_km !== undefined && (
                    <div className="absolute bottom-3 right-3 bg-black bg-opacity-60 text-white px-3 py-1 rounded-full text-sm flex items-center">
                      <MapPin size={14} className="mr-1" />
                      {pet.distance_km < 1
                        ? `${Math.round(pet.distance_km * 1000)}m`
                        : `${pet.distance_km.toFixed(1)}km`}
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-lg text-gray-800">{pet.name}</h3>
                  <div className="mt-3">
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div className="bg-emerald-500 h-3 rounded-full" style={{ width: `${pet.score * 100}%` }}></div>
                    </div>
                    <div className="flex justify-between mt-2">
                      <p className="text-sm font-medium text-emerald-700 flex items-center">
                        <Fingerprint size={16} className="mr-1" />
                        {Math.round(pet.score * 100)}% match
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pet Details Modal */}
        {showModal && selectedPet && (
          <div className="fixed inset-0 bg-white/80 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
            <div
              className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl animate-fadeIn border border-gray-100"
              style={{ animationDuration: "0.3s" }}
            >
              <div className="relative">
                <img
                  src={getPetImageUrl(`${selectedPet.pet_id || "/placeholder.svg"}/main.jpg`)}
                  alt={selectedPet.name}
                  className="w-full h-80 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>

                <div className="absolute bottom-0 left-0 p-6 text-white">
                  <h2 className="text-3xl font-bold">{selectedPet.name}</h2>
                  <div className="flex items-center mt-2">
                    <div className="bg-emerald-500/80 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium">
                      {Math.round(selectedPet.score * 100)}% match
                    </div>
                    {selectedPet.distance_km !== undefined && (
                      <div className="flex items-center ml-3 text-white/90 text-sm">
                        <MapPin size={14} className="mr-1" />
                        {selectedPet.distance_km < 1
                          ? `${Math.round(selectedPet.distance_km * 1000)}m away`
                          : `${selectedPet.distance_km.toFixed(1)}km away`}
                      </div>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => setShowModal(false)}
                  className="absolute top-4 right-4 bg-black/30 backdrop-blur-sm text-white p-2 rounded-full hover:bg-black/50 transition-all"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-8">
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-emerald-50/70 backdrop-blur-sm p-4 rounded-lg flex items-center">
                    <div className="w-10 h-10 rounded-full bg-emerald-100/80 flex items-center justify-center mr-3">
                      <svg
                        className="w-5 h-5 text-emerald-600"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z"
                          fill="currentColor"
                        />
                        <path d="M12 14.5C6.99 14.5 3 17.86 3 22H21C21 17.86 17.01 14.5 12 14.5Z" fill="currentColor" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-700 text-xs uppercase tracking-wide">Gender</h3>
                      <p className="text-gray-800 capitalize font-medium">{selectedPet.gender || "Unknown"}</p>
                    </div>
                  </div>
                  <div className="bg-emerald-50/70 backdrop-blur-sm p-4 rounded-lg flex items-center">
                    <div className="w-10 h-10 rounded-full bg-emerald-100/80 flex items-center justify-center mr-3">
                      <svg
                        className="w-5 h-5 text-emerald-600"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M12 6V12L16 14"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-700 text-xs uppercase tracking-wide">Posted On</h3>
                      <p className="text-gray-800 font-medium">{new Date(selectedPet.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="bg-emerald-50/70 backdrop-blur-sm p-4 rounded-lg flex items-center">
                    <div className="w-10 h-10 rounded-full bg-emerald-100/80 flex items-center justify-center mr-3">
                      <svg
                        className="w-5 h-5 text-emerald-600"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M20.42 4.58C19.76 3.91 18.91 3.44 18 3.21C17.09 2.97 16.14 2.99 15.24 3.25C14.33 3.51 13.5 4.02 12.83 4.69L12 5.53L11.18 4.69C10.5 4.02 9.67 3.51 8.77 3.25C7.86 2.99 6.91 2.97 6 3.21C5.09 3.44 4.24 3.91 3.58 4.58C2.91 5.24 2.44 6.09 2.21 7C1.97 7.91 1.99 8.86 2.25 9.77C2.51 10.68 3.02 11.51 3.69 12.18L12 20.5L20.31 12.18C20.98 11.51 21.49 10.68 21.75 9.77C22.01 8.86 22.03 7.91 21.79 7C21.56 6.09 21.09 5.24 20.42 4.58Z"
                          fill="currentColor"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-700 text-xs uppercase tracking-wide">Status</h3>
                      <p className="text-gray-800 capitalize font-medium">{selectedPet.status || "Unknown"}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6 mb-6">
                  <div className="bg-gray-50/70 backdrop-blur-sm p-5 rounded-lg">
                    <h3 className="font-semibold text-gray-700 text-xs uppercase tracking-wide mb-2">Description</h3>
                    <p className="text-gray-800">{selectedPet.description || "No description available"}</p>
                  </div>

                  {selectedPet.address && (
                    <div className="bg-gray-50/70 backdrop-blur-sm p-5 rounded-lg">
                      <h3 className="font-semibold text-gray-700 text-xs uppercase tracking-wide mb-2">Location</h3>
                      <p className="text-gray-800 flex items-start">
                        <MapPin size={18} className="mr-2 mt-1 flex-shrink-0 text-emerald-500" />
                        <span>{selectedPet.address}</span>
                      </p>
                    </div>
                  )}
                </div>

                {selectedPet.user && (
                  <div className="pt-5 border-t border-gray-200/70">
                    <div className="flex flex-wrap md:flex-nowrap items-center justify-between gap-6">
                      <div className="flex items-center">
                        <h3 className="font-semibold text-gray-700 text-xs uppercase tracking-wide mr-4">Posted By</h3>
                        <div className="flex items-center">
                          {selectedPet.user.profile_picture ? (
                            <img
                              src={getPetImageUrl(selectedPet.user.profile_picture) || "/placeholder.svg"}
                              alt={selectedPet.user.name}
                              className="w-14 h-14 rounded-full mr-4 border-2 border-emerald-100/50 object-cover"
                            />
                          ) : (
                            <div className="w-14 h-14 rounded-full mr-4 bg-gradient-to-br from-emerald-400/90 to-emerald-600/90 backdrop-blur-sm flex items-center justify-center text-white text-xl font-bold">
                              {selectedPet.user.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <span className="text-gray-800 font-medium block">{selectedPet.user.name}</span>
                            <span className="text-gray-500 text-sm">Pet Owner</span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={handleMessageUser}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500/90 to-emerald-600/90 backdrop-blur-sm text-white rounded-lg hover:from-emerald-600/90 hover:to-emerald-700/90 transition-all shadow-md font-medium"
                      >
                        <MessageSquare size={18} />
                        Message Owner
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        <Footer />
      </div>
      </div>

    </div>
  )
}


// "use client"
// import { useState, useEffect } from "react"
// import { useRouter } from "next/router"
// import { ArrowLeft, Search, Fingerprint, MapPin, MessageSquare, X } from "lucide-react"
// import { findSimilarPets, generatePetFingerprint } from "../../../utils/api"
// import toast from "react-hot-toast"
// import Navbar from "@/components/Navbar"
// import Footer from "@/components/Footer"

// function getPetImageUrl(imageName) {
//   if (!imageName) return ""
//   return `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/uploads/pet_images/${imageName}?t=${Date.now()}`
// }

// function LoadingSpinner() {
//   return (
//     <div>
//       <div>
//         <div></div>
//       </div>
//       <div>
//         <h3>Finding matches</h3>
//         <p>Looking for similar pets...</p>
//       </div>
//     </div>
//   )
// }

// export default function SimilarPetsPage() {
//   const router = useRouter()
//   const { id } = router.query
//   const [matches, setMatches] = useState([])
//   const [loading, setLoading] = useState(true)
//   const [sourcePet, setSourcePet] = useState(null)
//   const [fingerprintExists, setFingerprintExists] = useState(false)
//   const [distanceFilter, setDistanceFilter] = useState("no limit")
//   const [threshold, setThreshold] = useState(0.65)
//   const [selectedPet, setSelectedPet] = useState(null)
//   const [showModal, setShowModal] = useState(false)
//   const [loadingStartTime, setLoadingStartTime] = useState(0)

//   useEffect(() => {
//     if (id) {
//       const loadData = async () => {
//         try {
//           setLoading(true)
//           setLoadingStartTime(Date.now())

//           const { matches } = await findSimilarPets(id, distanceFilter, threshold)
//           setMatches(matches)
//           setFingerprintExists(true)

//           const sourceRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/pets/${id}`)
//           if (sourceRes.ok) {
//             setSourcePet(await sourceRes.json())
//           }
//         } catch (error) {
//           if (error.response?.status === 404) {
//             setFingerprintExists(false)
//           } else {
//             toast.error(error.message)
//           }
//         } finally {
//           const loadingDuration = Date.now() - loadingStartTime
//           const minimumLoadingTime = 9000

//           if (loadingDuration < minimumLoadingTime) {
//             setTimeout(() => {
//               setLoading(false)
//             }, minimumLoadingTime - loadingDuration)
//           } else {
//             setLoading(false)
//           }
//         }
//       }
//       loadData()
//     }
//   }, [id, distanceFilter, threshold])

//   const handleGenerateFingerprint = async () => {
//     try {
//       setLoading(true)
//       await generatePetFingerprint(id)
//       toast.success("Fingerprint generated successfully!")
//       router.reload()
//     } catch (error) {
//       toast.error(error.message || "Failed to generate fingerprint")
//     } finally {
//       setLoading(false)
//     }
//   }

//   const handlePetClick = (pet) => {
//     setSelectedPet(pet)
//     setShowModal(true)
//   }

//   const handleMessageUser = () => {
//     if (selectedPet?.user?.id) {
//       router.push(`/messages/new?recipient=${selectedPet.user.id}`)
//     }
//   }

//   const handleDistanceChange = (e) => {
//     setDistanceFilter(e.target.value)
//   }

//   const handleThresholdChange = (e) => {
//     setThreshold(Number.parseFloat(e.target.value))
//   }

//   if (loading) {
//     return <LoadingSpinner />
//   }

//   if (!fingerprintExists) {
//     return (
//       <div>
//         <div>
//           <div>
//             <Fingerprint />
//           </div>
//           <div>
//             <p>No fingerprint found for this pet. Generate one to find similar pets.</p>
//           </div>
//         </div>

//         <button onClick={handleGenerateFingerprint} disabled={loading}>
//           {loading ? "Generating..." : "Generate Fingerprint"}
//           <Fingerprint />
//         </button>
//       </div>
//     )
//   }

//   return (
//     <div>
//       <Navbar />

//       <div>
//         <button onClick={() => router.back()}>
//           <ArrowLeft />
//           Back to Pet Profile
//         </button>

//         {sourcePet && (
//           <div>
//             <img
//               src={getPetImageUrl(sourcePet.image) || ""}
//               alt={sourcePet.name}
//             />
//             <div>
//               <h1>Pets Similar to {sourcePet.name}</h1>
//               <p>
//                 <span>{sourcePet.type}</span>
//                 {sourcePet.breed && <span>{sourcePet.breed}</span>}
//               </p>
//             </div>
//           </div>
//         )}
//       </div>

//       <div>
//         <h2>Filter Results</h2>
//         <div>
//           <div>
//             <label htmlFor="distance">Maximum Distance</label>
//             <select
//               id="distance"
//               value={distanceFilter}
//               onChange={handleDistanceChange}
//             >
//               <option value="5m">Nearby (5 meters)</option>
//               <option value="1km">Within 1 km</option>
//               <option value="3km">Within 3 km</option>
//               <option value="5km">Within 5 km</option>
//               <option value="no limit">No distance limit</option>
//             </select>
//           </div>

//           <div>
//             <label htmlFor="threshold">Similarity Threshold ({Math.round(threshold * 100)}%)</label>
//             <input
//               type="range"
//               id="threshold"
//               min="0.5"
//               max="1.0"
//               step="0.05"
//               value={threshold}
//               onChange={handleThresholdChange}
//             />
//             <div>
//               <span>50%</span>
//               <span>75%</span>
//               <span>100%</span>
//             </div>
//           </div>
//         </div>
//       </div>

//       {loading ? (
//         <LoadingSpinner />
//       ) : matches.length === 0 ? (
//         <div>
//           <Search />
//           <h3>No similar pets found</h3>
//           <p>
//             We couldn't find any pets with similar features in this area. Try adjusting the filters or expanding your search radius.
//           </p>
//         </div>
//       ) : (
//         <div>
//           {matches.map((pet) => (
//             <div key={pet.pet_id} onClick={() => handlePetClick(pet)}>
//               <div>
//                 <img
//                   src={getPetImageUrl(`${pet.pet_id || ""}/main.jpg`)}
//                   alt={pet.name}
//                 />
//                 {pet.distance_km !== undefined && (
//                   <div>
//                     <MapPin />
//                     {pet.distance_km < 1 ? `${Math.round(pet.distance_km * 1000)}m` : `${pet.distance_km.toFixed(1)}km`}
//                   </div>
//                 )}
//               </div>
//               <div>
//                 <h3>{pet.name}</h3>
//                 <div>
//                   <div>
//                     <div style={{ width: `${pet.score * 100}%` }}></div>
//                   </div>
//                   <div>
//                     <p>
//                       <Fingerprint />
//                       {Math.round(pet.score * 100)}% match
//                     </p>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>
//       )}

//       {showModal && selectedPet && (
//         <div>
//           <div>
//             <img
//               src={getPetImageUrl(`${selectedPet.pet_id || ""}/main.jpg`)}
//               alt={selectedPet.name}
//             />
//             <div>
//               <h2>{selectedPet.name}</h2>
//               <div>
//                 <div>
//                   {Math.round(selectedPet.score * 100)}% match
//                 </div>
//                 {selectedPet.distance_km !== undefined && (
//                   <div>
//                     <MapPin />
//                     {selectedPet.distance_km < 1
//                       ? `${Math.round(selectedPet.distance_km * 1000)}m away`
//                       : `${selectedPet.distance_km.toFixed(1)}km away`}
//                   </div>
//                 )}
//               </div>
//             </div>

//             <button onClick={() => setShowModal(false)}>
//               <X />
//             </button>
//           </div>

//           <div>
//             <div>
//               <div>
//                 <div>
//                   <div>
//                     <h3>Gender</h3>
//                     <p>{selectedPet.gender || "Unknown"}</p>
//                   </div>
//                 </div>
//               </div>
//               <div>
//                 <div>
//                   <div>
//                     <h3>Posted On</h3>
//                     <p>{new Date(selectedPet.date).toLocaleDateString()}</p>
//                   </div>
//                 </div>
//               </div>
//               <div>
//                 <div>
//                   <div>
//                     <h3>Status</h3>
//                     <p>{selectedPet.status || "Unknown"}</p>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             <div>
//               <div>
//                 <h3>Description</h3>
//                 <p>{selectedPet.description || "No description available"}</p>
//               </div>

//               {selectedPet.address && (
//                 <div>
//                   <h3>Location</h3>
//                   <p>
//                     <MapPin />
//                     <span>{selectedPet.address}</span>
//                   </p>
//                 </div>
//               )}
//             </div>

//             {selectedPet.user && (
//               <div>
//                 <div>
//                   <div>
//                     <h3>Posted By</h3>
//                     <div>
//                       {selectedPet.user.profile_picture ? (
//                         <img
//                           src={getPetImageUrl(selectedPet.user.profile_picture) || ""}
//                           alt={selectedPet.user.name}
//                         />
//                       ) : (
//                         <div>
//                           {selectedPet.user.name.charAt(0).toUpperCase()}
//                         </div>
//                       )}
//                       <div>
//                         <span>{selectedPet.user.name}</span>
//                         <span>Pet Owner</span>
//                       </div>
//                     </div>
//                   </div>
//                   <button onClick={handleMessageUser}>
//                     <MessageSquare />
//                     Message Owner
//                   </button>
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>
//       )}
//       <Footer />
//     </div>
//   )
// }
