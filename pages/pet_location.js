// "use client";

// import { useRouter } from "next/navigation";
// import { useState, useRef, useEffect } from "react";
// import { Upload } from "lucide-react";
// import toast, { Toaster } from "react-hot-toast";
// import Navbar from "../components/Navbar";
// import Footer from "../components/Footer";

// export default function PetLocation() {
//   const router = useRouter();
//   const [isUploading, setIsUploading] = useState(false);
//   const [address, setAddress] = useState("");
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState("");
//   const [showMap, setShowMap] = useState(false);
//   const [petStatus, setPetStatus] = useState("");

  
//   const autocompleteRef = useRef(null);
//   const inputRef = useRef(null);
//   const mapRef = useRef(null);
//   const markerRef = useRef(null);

//   // Load Google Maps API script when map is shown
//   useEffect(() => {
//     const status = localStorage.getItem('petStatus');
//     setPetStatus(status || "");

//     if (showMap && !window.google) {
//       const script = document.createElement("script");
//       script.src = `https://maps.googleapis.com/maps/api/js?key=YOUR_GOOGLE_MAPS_API_KEY&libraries=places`;
//       script.async = true;
//       script.onload = initializeMap;
//       document.body.appendChild(script);
//     } else if (showMap && window.google) {
//       initializeMap();
//     }
//   }, [showMap]);

//   const saveToLocalStorage = () => {
//   localStorage.setItem('petAddress', address);
// };

// // Create a function to get the appropriate question text
// const getQuestionText = () => {
//   switch(petStatus) {
//     case "Safe at Home":
//       return "Where is your pet located?";
//     case "Lost":
//       return "Where did you last see your pet?";
//     case "Pet I Found":
//       return "Where did you find this pet?";
//     case "Rehome Pet":
//       return "Where is your pet located?";
//     default:
//       return "Where did you find them?";
//   }
// };

// // Create a function to get the appropriate placeholder text
// const getPlaceholderText = () => {
//   switch(petStatus) {
//     case "Safe at Home":
//       return "Your pet's current location (address)";
//     case "Lost":
//       return "Last seen near (address)";
//     case "Pet I Found":
//       return "Found near (address)";
//     case "Rehome Pet":
//       return "Found near (address)";
//     default:
//       return "Your pet's current location (address)";
//   }
// };

// const handleGoBack = () => {
//   // Remove the pet address from localStorage
//   localStorage.removeItem('petAddress');
//   // Navigate back
//   router.back();
// };

// const handleContinue = async () => {
//   if (!address) {
//     setError("Please enter or select a location");
//     return;
//   }

//   setIsUploading(true);

//   try {
//     await toast.promise(
//       new Promise(async (resolve, reject) => {
//         try {
//           await saveToLocalStorage();
//           setTimeout(() => {
//             resolve();
//           }, 1000);
//         } catch (error) {
//           reject(error);
//         }
//       }),
//       {
//         loading: "Saving location...",
//         success: "Location saved successfully!",
//         error: "Failed to save location"
//       }
//     );
//     router.push("/pet_description");
//   } catch (error) {
//     console.error("Error:", error);
//   } finally {
//     setIsUploading(false);
//   }
// };

//   const initializeMap = () => {
//     if (!mapRef.current || !window.google) return;

//     const map = new window.google.maps.Map(mapRef.current, {
//       center: { lat: 0, lng: 0 },
//       zoom: 2,
//     });

//     if (navigator.geolocation) {
//       navigator.geolocation.getCurrentPosition(
//         (position) => {
//           const userLocation = {
//             lat: position.coords.latitude,
//             lng: position.coords.longitude,
//           };
//           map.setCenter(userLocation);
//           map.setZoom(14);
//           placeMarker(userLocation, map);
//         },
//         () => {
//           map.setCenter({ lat: 20, lng: 0 });
//           map.setZoom(2);
//         }
//       );
//     }

//     if (inputRef.current) {
//       autocompleteRef.current = new window.google.maps.places.Autocomplete(
//         inputRef.current,
//         { types: ["geocode"] }
//       );

//       autocompleteRef.current.addListener("place_changed", () => {
//         const place = autocompleteRef.current.getPlace();
//         if (place.geometry) {
//           map.setCenter(place.geometry.location);
//           map.setZoom(16);
//           placeMarker(place.geometry.location, map);
//           setAddress(place.formatted_address);
//         }
//       });
//     }

//     map.addListener("click", (e) => {
//       placeMarker(e.latLng, map);
//       reverseGeocode(e.latLng);
//     });
//   };

//   const placeMarker = (location, map) => {
//     if (markerRef.current) {
//       markerRef.current.setMap(null);
//     }

//     const marker = new window.google.maps.Marker({
//       position: location,
//       map: map,
//       draggable: true,
//     });

//     marker.addListener("dragend", () => {
//       reverseGeocode(marker.getPosition());
//     });

//     markerRef.current = marker;
//     reverseGeocode(location);
//   };

//   const reverseGeocode = (latLng) => {
//     const geocoder = new window.google.maps.Geocoder();
//     geocoder.geocode({ location: latLng }, (results, status) => {
//       if (status === "OK" && results[0]) {
//         setAddress(results[0].formatted_address);
//         setError("");
//       } else {
//         setError("Could not determine address for this location");
//         setAddress(`Near coordinates: ${latLng.lat().toFixed(4)}, ${latLng.lng().toFixed(4)}`);
//       }
//     });
//   };

//   const getCurrentLocation = () => {
//     setIsLoading(true);
//     setError("");
    
//     if (navigator.geolocation) {
//       navigator.geolocation.getCurrentPosition(
//         async (position) => {
//           try {
//             const { latitude, longitude } = position.coords;
//             try {
//               const response = await fetch(
//                 `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=YOUR_GOOGLE_MAPS_API_KEY`
//               );
//               const data = await response.json();
//               if (data.results?.length > 0) {
//                 setAddress(data.results[0].formatted_address);
//               } else {
//                 await tryOpenStreetMap(latitude, longitude);
//               }
//             } catch (googleError) {
//               await tryOpenStreetMap(latitude, longitude);
//             }
//           } catch (err) {
//             setError("Could not determine address for this location. Please enter it manually.");
//           } finally {
//             setIsLoading(false);
//           }
//         },
//         (error) => {
//           setIsLoading(false);
//           if (error.code === error.PERMISSION_DENIED) {
//             setError("Location access was denied. Please enable location permissions or enter address manually.");
//           } else {
//             setError("Unable to retrieve your location. Error: " + error.message);
//           }
//         },
//         { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
//       );
//     } else {
//       setIsLoading(false);
//       setError("Geolocation is not supported by your browser");
//     }
//   };

//   const tryOpenStreetMap = async (latitude, longitude) => {
//     try {
//       const response = await fetch(
//         `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
//       );
//       const data = await response.json();
//       if (data.display_name) {
//         setAddress(data.display_name);
//       } else {
//         setError("Could not find address for these coordinates. Please enter it manually.");
//         setAddress(`Near coordinates: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
//       }
//     } catch (osmError) {
//       setError("All geocoding services failed. Please enter address manually.");
//       setAddress(`Near coordinates: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
//     }
//   };

//   const handleUseCurrentLocation = () => {
//     getCurrentLocation();
//   };

//   const handleManualLocationClick = () => {
//     setShowMap(true);
//   };

//   const handleMapBack = () => {
//     setShowMap(false);
//   };

//   return (
//     <div className="min-h-screen bg-white">
//       <Navbar />
//       <div className="bg-[#C84E00] text-white text-center py-3">
//         <p>
//           You have a lost pet.{" "}
//           <a href="/search" className="underline">
//             Click to Search
//           </a>
//         </p>
//       </div>

//       <div className="h-[2px] bg-purple-600 mx-12 my-8"></div>

//       <div className="max-w-2xl mx-auto px-4 text-center">
//       <h1 className="text-[2.5rem] font-bold text-[#1A237E] mb-6">
//         {getQuestionText()}
//       </h1>

//         <p className="text-gray-600 mb-8">
//           Please provide a specific address. We will never share your exact location to the public.
//         </p>

//         <div className="max-w-md mx-auto">
//           {!showMap ? (
//             <>
//               <input
//                 type="text"
//                 placeholder={getPlaceholderText()}
//                 className="w-full p-3 border rounded-lg mb-4"
//                 value={address}
//                 onChange={(e) => setAddress(e.target.value)}
//               />

//               <div className="flex flex-col gap-3 mb-4">
//                 <button
//                   onClick={handleUseCurrentLocation}
//                   className="text-purple-600 hover:text-purple-700 flex items-center justify-center gap-2 w-full p-3 border border-purple-200 rounded-lg cursor-pointer"
//                   disabled={isLoading}
//                 >
//                   <span>📍</span> 
//                   {isLoading ? "Getting location..." : `Use current ${petStatus === "Safe at Home" ? "home" : "location"}`}
//                 </button>

//                 <button
//                   onClick={handleManualLocationClick}
//                   className="text-purple-600 hover:text-purple-700 flex items-center justify-center gap-2 w-full p-3 border border-purple-200 rounded-lg cursor-pointer"
//                 >
//                   <span>🗺️</span> Select from map
//                 </button>
//               </div>

//               {error && (
//                 <div className="mb-2 p-2 bg-red-50 rounded">
//                   <p className="text-red-500">{error}</p>
//                   {address && <p className="text-gray-700 mt-1">We found: {address}</p>}
//                 </div>
//               )}

//             <div className="flex gap-4 w-full">
//               <button
//                 type="button"
//                 onClick={handleGoBack}
//                 className="px-8 py-3 w-full rounded-full bg-gray-200 text-gray-800 hover:bg-gray-300"
//               >
//                 Go Back
//               </button>
//               <button
//                 onClick={handleContinue}
//                 className={`px-8 py-3 w-full rounded-full ${
//                   address ? "bg-purple-600 text-white hover:bg-purple-700" : "bg-gray-100 text-gray-400"
//                 }`}
//                 disabled={!address || isUploading}
//               >
//                 {isUploading ? "Saving..." : "Continue"}
//               </button>
//             </div>

//             </>
//           ) : (
//             <div className="text-left">
//               <button
//                 onClick={handleMapBack}
//                 className="flex items-center gap-2 text-purple-600 mb-4"
//               >
//                 ← Back to address input
//               </button>

//               <input
//                 type="text"
//                 placeholder="Search for an address"
//                 className="w-full p-3 border rounded-lg mb-4"
//                 ref={inputRef}
//               />

//               <div 
//                 ref={mapRef} 
//                 className="h-64 w-full rounded-lg overflow-hidden border border-gray-200"
//                 style={{ minHeight: "300px" }}
//               />

//               <div className="mt-4 p-3 bg-gray-50 rounded-lg">
//                 <p className="font-medium">Selected Location:</p>
//                 <p className="text-gray-700">{address || "No location selected"}</p>
//               </div>

//               <button
//                 onClick={handleMapBack}
//                 className={`mt-4 px-8 py-3 w-full rounded-full ${
//                   address ? "bg-purple-600 text-white hover:bg-purple-700" : "bg-gray-100 text-gray-400"
//                 }`}
//                 disabled={!address}
//               >
//                 Confirm Location
//               </button>
//             </div>
//           )}
//         </div>
//       </div>
//       <Footer />
//       <Toaster position="bottom-right" />
//     </div>
//   );
// }




















// "use client";

// import { useRouter } from "next/navigation";
// import { useState, useRef, useEffect } from "react";
// import { Upload } from "lucide-react";
// import toast, { Toaster } from "react-hot-toast";
// import Navbar from "../components/Navbar";
// import Footer from "../components/Footer";
// import mapboxgl from "mapbox-gl";
// import "mapbox-gl/dist/mapbox-gl.css";

// // Initialize Mapbox
// mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

// export default function PetLocation() {
//   const router = useRouter();
//   const [isUploading, setIsUploading] = useState(false);
//   const [address, setAddress] = useState("");
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState("");
//   const [showMap, setShowMap] = useState(false);
//   const [petStatus, setPetStatus] = useState("");
//   const [selectedLocation, setSelectedLocation] = useState(null);

//   const mapContainer = useRef(null);
//   const mapRef = useRef(null);
//   const markerRef = useRef(null);

//   useEffect(() => {
//     const status = localStorage.getItem('petStatus');
//     setPetStatus(status || "");
//   }, []);

//   // Initialize Mapbox map when showMap is true
//   useEffect(() => {
//     if (!showMap || !mapContainer.current) return;

//     const map = new mapboxgl.Map({
//       container: mapContainer.current,
//       style: 'mapbox://styles/mapbox/streets-v11',
//       center: [0, 0], // Default center
//       zoom: 1
//     });

//     mapRef.current = map;

//     // Add geolocate control
//     map.addControl(
//       new mapboxgl.GeolocateControl({
//         positionOptions: {
//           enableHighAccuracy: true
//         },
//         trackUserLocation: true,
//         showUserLocation: true
//       })
//     );

//     // Handle map clicks
//     map.on('click', (e) => {
//       placeMarker([e.lngLat.lng, e.lngLat.lat], map);
//       reverseGeocode([e.lngLat.lng, e.lngLat.lat]);
//     });

//     // Center map on user's location if available
//     if (navigator.geolocation) {
//       navigator.geolocation.getCurrentPosition(
//         (position) => {
//           const userLocation = [position.coords.longitude, position.coords.latitude];
//           map.flyTo({
//             center: userLocation,
//             zoom: 14
//           });
//           placeMarker(userLocation, map);
//         },
//         () => {
//           map.flyTo({
//             center: [0, 20],
//             zoom: 2
//           });
//         }
//       );
//     }

//     return () => {
//       if (mapRef.current) {
//         mapRef.current.remove();
//         mapRef.current = null;
//       }
//     };
//   }, [showMap]);

//   const saveToLocalStorage = () => {
//     localStorage.setItem('petAddress', address);
//   };

//   const getQuestionText = () => {
//     switch(petStatus) {
//       case "Safe at Home":
//         return "Where is your pet located?";
//       case "Lost":
//         return "Where did you last see your pet?";
//       case "Pet I Found":
//         return "Where did you find this pet?";
//       case "Rehome Pet":
//         return "Where is your pet located?";
//       default:
//         return "Where did you find them?";
//     }
//   };

//   const getPlaceholderText = () => {
//     switch(petStatus) {
//       case "Safe at Home":
//         return "Your pet's current location (address)";
//       case "Lost":
//         return "Last seen near (address)";
//       case "Pet I Found":
//         return "Found near (address)";
//       case "Rehome Pet":
//         return "Found near (address)";
//       default:
//         return "Your pet's current location (address)";
//     }
//   };

//   const handleGoBack = () => {
//     localStorage.removeItem('petAddress');
//     router.back();
//   };

//   const handleContinue = async () => {
//     if (!address) {
//       setError("Please enter or select a location");
//       return;
//     }

//     setIsUploading(true);

//     try {
//       await toast.promise(
//         new Promise(async (resolve, reject) => {
//           try {
//             await saveToLocalStorage();
//             setTimeout(() => {
//               resolve();
//             }, 1000);
//           } catch (error) {
//             reject(error);
//           }
//         }),
//         {
//           loading: "Saving location...",
//           success: "Location saved successfully!",
//           error: "Failed to save location"
//         }
//       );
//       router.push("/pet_description");
//     } catch (error) {
//       console.error("Error:", error);
//     } finally {
//       setIsUploading(false);
//     }
//   };

//   const placeMarker = (coords, map) => {
//     if (markerRef.current) {
//       markerRef.current.remove();
//     }

//     const marker = new mapboxgl.Marker()
//       .setLngLat(coords)
//       .addTo(map);

//     markerRef.current = marker;
//     setSelectedLocation(coords);
//   };

//   const reverseGeocode = async (coords) => {
//     try {
//       const response = await fetch(
//         `https://api.mapbox.com/geocoding/v5/mapbox.places/${coords[0]},${coords[1]}.json?access_token=${mapboxgl.accessToken}`
//       );
//       const data = await response.json();
//       if (data.features && data.features.length > 0) {
//         setAddress(data.features[0].place_name);
//         setError("");
//       } else {
//         setError("Could not determine address for this location");
//         setAddress(`Near coordinates: ${coords[1].toFixed(4)}, ${coords[0].toFixed(4)}`);
//       }
//     } catch (err) {
//       setError("Error fetching address");
//       setAddress(`Near coordinates: ${coords[1].toFixed(4)}, ${coords[0].toFixed(4)}`);
//     }
//   };

//   const getCurrentLocation = () => {
//     setIsLoading(true);
//     setError("");
  
//     if (navigator.geolocation) {
//       navigator.geolocation.getCurrentPosition(
//         async (position) => {
//           try {
//             const coords = [position.coords.longitude, position.coords.latitude];
//             await reverseGeocode(coords);
//           } catch (err) {
//             setError("Could not determine address for this location. Please enter it manually.");
//           } finally {
//             setIsLoading(false);
//             if (showMap && mapRef.current) {
//               mapRef.current.flyTo({
//                 center: [position.coords.longitude, position.coords.latitude],
//                 zoom: 14
//               });
//               placeMarker([position.coords.longitude, position.coords.latitude], mapRef.current);
//             }
//           }
//         },
//         (error) => {
//           setIsLoading(false);
//           if (error.code === error.PERMISSION_DENIED) {
//             setError("Location access was denied. Please enable location permissions or enter address manually.");
//           } else {
//             setError("Unable to retrieve your location. Error: " + error.message);
//           }
//         },
//         { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
//       );
//     } else {
//       setIsLoading(false);
//       setError("Geolocation is not supported by your browser");
//     }
//   };

//   const handleUseCurrentLocation = () => {
//     getCurrentLocation();
//   };

//   const handleManualLocationClick = () => {
//     setShowMap(true);
//   };

//   const handleMapBack = () => {
//     setShowMap(false);
//   };

//   return (
//     <div className="min-h-screen bg-white">
//       <Navbar />
//       <div className="bg-[#C84E00] text-white text-center py-3">
//         <p>
//           You have a lost pet.{" "}
//           <a href="/search" className="underline">
//             Click to Search
//           </a>
//         </p>
//       </div>

//       <div className="h-[2px] bg-purple-600 mx-12 my-8"></div>

//       <div className="max-w-2xl mx-auto px-4 text-center">
//         <h1 className="text-[2.5rem] font-bold text-[#1A237E] mb-6">
//           {getQuestionText()}
//         </h1>

//         <p className="text-gray-600 mb-8">
//           Please provide a specific address. We will never share your exact location to the public.
//         </p>

//         <div className="max-w-md mx-auto">
//           {!showMap ? (
//             <>
//               <input
//                 type="text"
//                 placeholder={getPlaceholderText()}
//                 className="w-full p-3 border rounded-lg mb-4"
//                 value={address}
//                 onChange={(e) => setAddress(e.target.value)}
//               />

//               <div className="flex flex-col gap-3 mb-4">
//                 <button
//                   onClick={handleUseCurrentLocation}
//                   className="text-purple-600 hover:text-purple-700 flex items-center justify-center gap-2 w-full p-3 border border-purple-200 rounded-lg cursor-pointer"
//                   disabled={isLoading}
//                 >
//                   <span>📍</span>
//                   {isLoading ? "Getting location..." : `Use current ${petStatus === "Safe at Home" ? "home" : "location"}`}
//                 </button>

//                 <button
//                   onClick={handleManualLocationClick}
//                   className="text-purple-600 hover:text-purple-700 flex items-center justify-center gap-2 w-full p-3 border border-purple-200 rounded-lg cursor-pointer"
//                 >
//                   <span>🗺️</span> Select from map
//                 </button>
//               </div>

//               {error && (
//                 <div className="mb-2 p-2 bg-red-50 rounded">
//                   <p className="text-red-500">{error}</p>
//                   {address && <p className="text-gray-700 mt-1">We found: {address}</p>}
//                 </div>
//               )}

//               <div className="flex gap-4 w-full">
//                 <button
//                   type="button"
//                   onClick={handleGoBack}
//                   className="px-8 py-3 w-full rounded-full bg-gray-200 text-gray-800 hover:bg-gray-300"
//                 >
//                   Go Back
//                 </button>
//                 <button
//                   onClick={handleContinue}
//                   className={`px-8 py-3 w-full rounded-full ${
//                     address ? "bg-purple-600 text-white hover:bg-purple-700" : "bg-gray-100 text-gray-400"
//                   }`}
//                   disabled={!address || isUploading}
//                 >
//                   {isUploading ? "Saving..." : "Continue"}
//                 </button>
//               </div>
//             </>
//           ) : (
//             <div className="text-left">
//               <button
//                 onClick={handleMapBack}
//                 className="flex items-center gap-2 text-purple-600 mb-4"
//               >
//                 ← Back to address input
//               </button>

//               <div
//                 ref={mapContainer}
//                 className="h-64 w-full rounded-lg overflow-hidden border border-gray-200"
//                 style={{ minHeight: "400px" }}
//               />

//               <div className="mt-4 p-3 bg-gray-50 rounded-lg">
//                 <p className="font-medium">Selected Location:</p>
//                 <p className="text-gray-700">{address || "No location selected"}</p>
//               </div>

//               <button
//                 onClick={handleMapBack}
//                 className={`mt-4 px-8 py-3 w-full rounded-full ${
//                   address ? "bg-purple-600 text-white hover:bg-purple-700" : "bg-gray-100 text-gray-400"
//                 }`}
//                 disabled={!address}
//               >
//                 Confirm Location
//               </button>
//             </div>
//           )}
//         </div>
//       </div>
//       <Footer />
//       <Toaster position="bottom-right" />
//     </div>
//   );
// }



"use client";

import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { Upload } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

// Initialize Mapbox
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

export default function PetLocation() {
  const router = useRouter();
  const [isUploading, setIsUploading] = useState(false);
  const [address, setAddress] = useState("");
  const [coordinates, setCoordinates] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showMap, setShowMap] = useState(false);
  const [petStatus, setPetStatus] = useState("");
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [isReadOnly, setIsReadOnly] = useState(false);

  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);

  useEffect(() => {
    const status = localStorage.getItem('petStatus');
    setPetStatus(status || "");
    
    // Load saved location data if exists
    const savedLocation = localStorage.getItem('petAddress');
    const savedLat = localStorage.getItem('latitude');
    const savedLng = localStorage.getItem('longitude');
    
    if (savedLocation) {
      setAddress(savedLocation);
      setIsReadOnly(true);
    }
    
    if (savedLat && savedLng) {
      setCoordinates({
        latitude: parseFloat(savedLat),
        longitude: parseFloat(savedLng)
      });
    }
  }, []);

  // Initialize Mapbox map when showMap is true
  useEffect(() => {
    if (!showMap || !mapContainer.current) return;

    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: coordinates ? [coordinates.longitude, coordinates.latitude] : [0, 0],
      zoom: coordinates ? 14 : 1
    });

    mapRef.current = map;

    // Add geolocate control
    map.addControl(
      new mapboxgl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true
        },
        trackUserLocation: true,
        showUserLocation: true
      })
    );

    // Handle map clicks
    map.on('click', (e) => {
      const coords = [e.lngLat.lng, e.lngLat.lat];
      placeMarker(coords, map);
      reverseGeocode(coords);
      setCoordinates({
        latitude: e.lngLat.lat,
        longitude: e.lngLat.lng
      });
      setIsReadOnly(true);
    });

    // Center map on saved coordinates if available
    if (coordinates) {
      map.flyTo({
        center: [coordinates.longitude, coordinates.latitude],
        zoom: 14
      });
      placeMarker([coordinates.longitude, coordinates.latitude], map);
    } else if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLocation = [position.coords.longitude, position.coords.latitude];
          map.flyTo({
            center: userLocation,
            zoom: 14
          });
          placeMarker(userLocation, map);
        },
        () => {
          map.flyTo({
            center: [0, 20],
            zoom: 2
          });
        }
      );
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [showMap]);

  const saveToLocalStorage = () => {
    // Save each piece of data separately
    localStorage.setItem('petAddress', address);
    if (coordinates) {
      localStorage.setItem('latitude', coordinates.latitude.toString());
      localStorage.setItem('longitude', coordinates.longitude.toString());
    } else {
      // Clear coordinates if they don't exist
      localStorage.removeItem('latitude');
      localStorage.removeItem('longitude');
    }
  };

  const getQuestionText = () => {
    switch(petStatus) {
      case "Safe at Home":
        return "Where is your pet located?";
      case "Lost":
        return "Where did you last see your pet?";
      case "Pet I Found":
        return "Where did you find this pet?";
      case "Rehome Pet":
        return "Where is your pet located?";
      default:
        return "Where did you find them?";
    }
  };

  const getPlaceholderText = () => {
    switch(petStatus) {
      case "Safe at Home":
        return "Your pet's current location (address)";
      case "Lost":
        return "Last seen near (address)";
      case "Pet I Found":
        return "Found near (address)";
      case "Rehome Pet":
        return "Found near (address)";
      default:
        return "Your pet's current location (address)";
    }
  };

  const handleGoBack = () => {
    localStorage.removeItem('petAddress');
    localStorage.removeItem('latitude');
    localStorage.removeItem('longitude');
    router.back();
  };

  const handleContinue = async () => {
    if (!address) {
      setError("Please enter or select a location");
      return;
    }

    setIsUploading(true);

    try {
      await toast.promise(
        new Promise(async (resolve, reject) => {
          try {
            await saveToLocalStorage();
            setTimeout(() => {
              resolve();
            }, 1000);
          } catch (error) {
            reject(error);
          }
        }),
        {
          loading: "Saving location...",
          success: "Location saved successfully!",
          error: "Failed to save location"
        }
      );
      router.push("/pet_description");
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const placeMarker = (coords, map) => {
    if (markerRef.current) {
      markerRef.current.remove();
    }

    const marker = new mapboxgl.Marker()
      .setLngLat(coords)
      .addTo(map);

    markerRef.current = marker;
    setSelectedLocation(coords);
  };

  const reverseGeocode = async (coords) => {
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${coords[0]},${coords[1]}.json?access_token=${mapboxgl.accessToken}`
      );
      const data = await response.json();
      if (data.features && data.features.length > 0) {
        setAddress(data.features[0].place_name);
        setError("");
      } else {
        setError("Could not determine address for this location");
        setAddress(`Near coordinates: ${coords[1].toFixed(4)}, ${coords[0].toFixed(4)}`);
      }
    } catch (err) {
      setError("Error fetching address");
      setAddress(`Near coordinates: ${coords[1].toFixed(4)}, ${coords[0].toFixed(4)}`);
    }
  };

  const getCurrentLocation = () => {
    setIsLoading(true);
    setError("");
    setIsReadOnly(false);
  
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const coords = [position.coords.longitude, position.coords.latitude];
            await reverseGeocode(coords);
            setCoordinates({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            });
            setIsReadOnly(true);
          } catch (err) {
            setError("Could not determine address for this location. Please enter it manually.");
          } finally {
            setIsLoading(false);
            if (showMap && mapRef.current) {
              mapRef.current.flyTo({
                center: [position.coords.longitude, position.coords.latitude],
                zoom: 14
              });
              placeMarker([position.coords.longitude, position.coords.latitude], mapRef.current);
            }
          }
        },
        (error) => {
          setIsLoading(false);
          if (error.code === error.PERMISSION_DENIED) {
            setError("Location access was denied. Please enable location permissions or enter address manually.");
          } else {
            setError("Unable to retrieve your location. Error: " + error.message);
          }
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      setIsLoading(false);
      setError("Geolocation is not supported by your browser");
    }
  };

  const handleUseCurrentLocation = () => {
    getCurrentLocation();
  };

  const handleManualLocationClick = () => {
    setShowMap(true);
  };

  const handleMapBack = () => {
    setShowMap(false);
  };

  const handleAddressChange = (e) => {
    setAddress(e.target.value);
    if (e.target.value !== address) {
      setCoordinates(null);
      setIsReadOnly(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="bg-[#C84E00] text-white text-center py-3">
        <p>
          You have a lost pet.{" "}
          <a href="/search" className="underline">
            Click to Search
          </a>
        </p>
      </div>

      <div className="h-[2px] bg-purple-600 mx-12 my-8"></div>

      <div className="max-w-2xl mx-auto px-4 text-center">
        <h1 className="text-[2.5rem] font-bold text-[#1A237E] mb-6">
          {getQuestionText()}
        </h1>

        <p className="text-gray-600 mb-8">
          Please provide a specific address. We will never share your exact location to the public.
        </p>

        <div className="max-w-md mx-auto">
          {!showMap ? (
            <>
              <input
                type="text"
                placeholder={getPlaceholderText()}
                className="w-full p-3 border rounded-lg mb-4"
                value={address}
                onChange={handleAddressChange}
                readOnly={isReadOnly}
              />

              {coordinates && (
                <div className="mb-4 p-2 bg-gray-100 rounded text-sm text-left">
                  <p>Coordinates:</p>
                  <p>Latitude: {coordinates.latitude.toFixed(6)}</p>
                  <p>Longitude: {coordinates.longitude.toFixed(6)}</p>
                </div>
              )}

              <div className="flex flex-col gap-3 mb-4">
                <button
                  onClick={handleUseCurrentLocation}
                  className="text-purple-600 hover:text-purple-700 flex items-center justify-center gap-2 w-full p-3 border border-purple-200 rounded-lg cursor-pointer"
                  disabled={isLoading}
                >
                  <span>📍</span>
                  {isLoading ? "Getting location..." : `Use current ${petStatus === "Safe at Home" ? "home" : "location"}`}
                </button>

                <button
                  onClick={handleManualLocationClick}
                  className="text-purple-600 hover:text-purple-700 flex items-center justify-center gap-2 w-full p-3 border border-purple-200 rounded-lg cursor-pointer"
                >
                  <span>🗺️</span> Select from map
                </button>
              </div>

              {error && (
                <div className="mb-2 p-2 bg-red-50 rounded">
                  <p className="text-red-500">{error}</p>
                  {address && <p className="text-gray-700 mt-1">We found: {address}</p>}
                </div>
              )}

              <div className="flex gap-4 w-full">
                <button
                  type="button"
                  onClick={handleGoBack}
                  className="px-8 py-3 w-full rounded-full bg-gray-200 text-gray-800 hover:bg-gray-300"
                >
                  Go Back
                </button>
                <button
                  onClick={handleContinue}
                  className={`px-8 py-3 w-full rounded-full ${
                    address ? "bg-purple-600 text-white hover:bg-purple-700" : "bg-gray-100 text-gray-400"
                  }`}
                  disabled={!address || isUploading}
                >
                  {isUploading ? "Saving..." : "Continue"}
                </button>
              </div>
            </>
          ) : (
            <div className="text-left">
              <button
                onClick={handleMapBack}
                className="flex items-center gap-2 text-purple-600 mb-4"
              >
                ← Back to address input
              </button>

              <div
                ref={mapContainer}
                className="h-64 w-full rounded-lg overflow-hidden border border-gray-200"
                style={{ minHeight: "400px" }}
              />

              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <p className="font-medium">Selected Location:</p>
                <p className="text-gray-700">{address || "No location selected"}</p>
                {coordinates && (
                  <>
                    <p className="font-medium mt-2">Coordinates:</p>
                    <p className="text-gray-700">Latitude: {coordinates.latitude.toFixed(6)}</p>
                    <p className="text-gray-700">Longitude: {coordinates.longitude.toFixed(6)}</p>
                  </>
                )}
              </div>

              <button
                onClick={handleMapBack}
                className={`mt-4 px-8 py-3 w-full rounded-full ${
                  address ? "bg-purple-600 text-white hover:bg-purple-700" : "bg-gray-100 text-gray-400"
                }`}
                disabled={!address}
              >
                Confirm Location
              </button>
            </div>
          )}
        </div>
      </div>
      <Footer />
      <Toaster position="bottom-right" />
    </div>
  );
}