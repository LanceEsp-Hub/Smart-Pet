"use client";

import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { Upload } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet marker icons
if (typeof window !== 'undefined') {
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  });
}

export default function PetLocation() {
  const router = useRouter();
  const [isUploading, setIsUploading] = useState(false);
  const [address, setAddress] = useState("");
  const [coordinates, setCoordinates] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showMap, setShowMap] = useState(false);
  const [petStatus, setPetStatus] = useState("");
  const [isReadOnly, setIsReadOnly] = useState(false);

  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);

  useEffect(() => {
    const status = localStorage.getItem('petStatus');
    setPetStatus(status || "");
    
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

  useEffect(() => {
    if (!showMap || !mapContainer.current) return;

    const map = L.map(mapContainer.current).setView(
      coordinates ? [coordinates.latitude, coordinates.longitude] : [0, 20],
      coordinates ? 14 : 2
    );

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    mapRef.current = map;

    map.on('click', (e) => {
      const coords = [e.latlng.lng, e.latlng.lat];
      placeMarker([e.latlng.lat, e.latlng.lng], map);
      reverseGeocode(coords);
      setCoordinates({
        latitude: e.latlng.lat,
        longitude: e.latlng.lng
      });
      setIsReadOnly(true);
    });

    if (coordinates) {
      map.flyTo([coordinates.latitude, coordinates.longitude], 14);
      placeMarker([coordinates.latitude, coordinates.longitude], map);
    } else if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLocation = [position.coords.latitude, position.coords.longitude];
          map.flyTo(userLocation, 14);
          placeMarker(userLocation, map);
        },
        () => {
          map.flyTo([0, 20], 2);
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
    localStorage.setItem('petAddress', address);
    if (coordinates) {
      localStorage.setItem('latitude', coordinates.latitude.toString());
      localStorage.setItem('longitude', coordinates.longitude.toString());
    } else {
      localStorage.removeItem('latitude');
      localStorage.removeItem('longitude');
    }
  };

  const getQuestionText = () => {
    switch(petStatus) {
      case "Safe at Home": return "Where is your pet located?";
      case "Lost": return "Where did you last see your pet?";
      case "Pet I Found": return "Where did you find this pet?";
      case "Rehome Pet": return "Where is your pet located?";
      default: return "Where did you find them?";
    }
  };

  const getPlaceholderText = () => {
    switch(petStatus) {
      case "Safe at Home": return "Your pet's current location (address)";
      case "Lost": return "Last seen near (address)";
      case "Pet I Found": return "Found near (address)";
      case "Rehome Pet": return "Found near (address)";
      default: return "Your pet's current location (address)";
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
        new Promise(async (resolve) => {
          await saveToLocalStorage();
          setTimeout(resolve, 1000);
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
      map.removeLayer(markerRef.current);
    }
    const marker = L.marker(coords).addTo(map);
    markerRef.current = marker;
  };

  const reverseGeocode = async (coords) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords[1]}&lon=${coords[0]}&zoom=18&addressdetails=1`
      );
      const data = await response.json();
      if (data.display_name) {
        setAddress(data.display_name);
        setError("");
      } else {
        setError("Could not determine address");
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
            setError("Could not determine address");
          } finally {
            setIsLoading(false);
            if (showMap && mapRef.current) {
              mapRef.current.flyTo([position.coords.latitude, position.coords.longitude], 14);
              placeMarker([position.coords.latitude, position.coords.longitude], mapRef.current);
            }
          }
        },
        (error) => {
          setIsLoading(false);
          setError(error.code === error.PERMISSION_DENIED 
            ? "Location access denied" 
            : "Unable to retrieve location");
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    } else {
      setIsLoading(false);
      setError("Geolocation not supported");
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
        <p>You have a lost pet. <a href="/search" className="underline">Click to Search</a></p>
      </div>

      <div className="h-[2px] bg-purple-600 mx-12 my-8"></div>

      <div className="max-w-2xl mx-auto px-4 text-center">
        <h1 className="text-[2.5rem] font-bold text-[#1A237E] mb-6">
          {getQuestionText()}
        </h1>

        <p className="text-gray-600 mb-8">
          Please provide a specific address. We will never share your exact location.
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
//   const [coordinates, setCoordinates] = useState(null);
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState("");
//   const [showMap, setShowMap] = useState(false);
//   const [petStatus, setPetStatus] = useState("");
//   const [selectedLocation, setSelectedLocation] = useState(null);
//   const [isReadOnly, setIsReadOnly] = useState(false);

//   const mapContainer = useRef(null);
//   const mapRef = useRef(null);
//   const markerRef = useRef(null);

//   useEffect(() => {
//     const status = localStorage.getItem('petStatus');
//     setPetStatus(status || "");
    
//     // Load saved location data if exists
//     const savedLocation = localStorage.getItem('petAddress');
//     const savedLat = localStorage.getItem('latitude');
//     const savedLng = localStorage.getItem('longitude');
    
//     if (savedLocation) {
//       setAddress(savedLocation);
//       setIsReadOnly(true);
//     }
    
//     if (savedLat && savedLng) {
//       setCoordinates({
//         latitude: parseFloat(savedLat),
//         longitude: parseFloat(savedLng)
//       });
//     }
//   }, []);

//   // Initialize Mapbox map when showMap is true
//   useEffect(() => {
//     if (!showMap || !mapContainer.current) return;

//     const map = new mapboxgl.Map({
//       container: mapContainer.current,
//       style: 'mapbox://styles/mapbox/streets-v11',
//       center: coordinates ? [coordinates.longitude, coordinates.latitude] : [0, 0],
//       zoom: coordinates ? 14 : 1
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
//       const coords = [e.lngLat.lng, e.lngLat.lat];
//       placeMarker(coords, map);
//       reverseGeocode(coords);
//       setCoordinates({
//         latitude: e.lngLat.lat,
//         longitude: e.lngLat.lng
//       });
//       setIsReadOnly(true);
//     });

//     // Center map on saved coordinates if available
//     if (coordinates) {
//       map.flyTo({
//         center: [coordinates.longitude, coordinates.latitude],
//         zoom: 14
//       });
//       placeMarker([coordinates.longitude, coordinates.latitude], map);
//     } else if (navigator.geolocation) {
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
//     // Save each piece of data separately
//     localStorage.setItem('petAddress', address);
//     if (coordinates) {
//       localStorage.setItem('latitude', coordinates.latitude.toString());
//       localStorage.setItem('longitude', coordinates.longitude.toString());
//     } else {
//       // Clear coordinates if they don't exist
//       localStorage.removeItem('latitude');
//       localStorage.removeItem('longitude');
//     }
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
//     localStorage.removeItem('latitude');
//     localStorage.removeItem('longitude');
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
//     setIsReadOnly(false);
  
//     if (navigator.geolocation) {
//       navigator.geolocation.getCurrentPosition(
//         async (position) => {
//           try {
//             const coords = [position.coords.longitude, position.coords.latitude];
//             await reverseGeocode(coords);
//             setCoordinates({
//               latitude: position.coords.latitude,
//               longitude: position.coords.longitude
//             });
//             setIsReadOnly(true);
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

//   const handleAddressChange = (e) => {
//     setAddress(e.target.value);
//     if (e.target.value !== address) {
//       setCoordinates(null);
//       setIsReadOnly(false);
//     }
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
//                 onChange={handleAddressChange}
//                 readOnly={isReadOnly}
//               />

//               {coordinates && (
//                 <div className="mb-4 p-2 bg-gray-100 rounded text-sm text-left">
//                   <p>Coordinates:</p>
//                   <p>Latitude: {coordinates.latitude.toFixed(6)}</p>
//                   <p>Longitude: {coordinates.longitude.toFixed(6)}</p>
//                 </div>
//               )}

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
//                 {coordinates && (
//                   <>
//                     <p className="font-medium mt-2">Coordinates:</p>
//                     <p className="text-gray-700">Latitude: {coordinates.latitude.toFixed(6)}</p>
//                     <p className="text-gray-700">Longitude: {coordinates.longitude.toFixed(6)}</p>
//                   </>
//                 )}
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
