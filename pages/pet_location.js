
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

  // const getCurrentLocation = () => {
  //   setIsLoading(true);
  //   setError("");
  //   setIsReadOnly(false);
  
  //   if (navigator.geolocation) {
  //     navigator.geolocation.getCurrentPosition(
  //       async (position) => {
  //         try {
  //           const coords = [position.coords.longitude, position.coords.latitude];
  //           await reverseGeocode(coords);
  //           setCoordinates({
  //             latitude: position.coords.latitude,
  //             longitude: position.coords.longitude
  //           });
  //           setIsReadOnly(true);
  //         } catch (err) {
  //           setError("Could not determine address for this location. Please enter it manually.");
  //         } finally {
  //           setIsLoading(false);
  //           if (showMap && mapRef.current) {
  //             mapRef.current.flyTo({
  //               center: [position.coords.longitude, position.coords.latitude],
  //               zoom: 14
  //             });
  //             placeMarker([position.coords.longitude, position.coords.latitude], mapRef.current);
  //           }
  //         }
  //       },
  //       (error) => {
  //         setIsLoading(false);
  //         if (error.code === error.PERMISSION_DENIED) {
  //           setError("Location access was denied. Please enable location permissions or enter address manually.");
  //         } else {
  //           setError("Unable to retrieve your location. Error: " + error.message);
  //         }
  //       },
  //       { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
  //     );
  //   } else {
  //     setIsLoading(false);
  //     setError("Geolocation is not supported by your browser");
  //   }
  // };



//   const getCurrentLocation = async () => {
//   setIsLoading(true);
//   setError("");
//   setIsReadOnly(false);
//   toast.dismiss();

//   // Enhanced environment checks
//   if (typeof window === 'undefined' || !navigator.geolocation) {
//     const msg = "Geolocation is not supported in this browser";
//     toast.error(msg);
//     setError(msg);
//     setIsLoading(false);
//     return;
//   }

//   if (window.location.protocol !== 'https:') {
//     const msg = "Geolocation requires HTTPS for security";
//     toast.error(msg);
//     setError(msg);
//     setIsLoading(false);
//     return;
//   }

//   // Device detection
//   const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
//   const deviceType = isMobile ? "phone" : "computer";

//   // Device-specific loading message
//   toast.loading(
//     <div>
//       <p>Detecting your {deviceType}'s location...</p>
//       {!isMobile && (
//         <small className="block mt-1">
//           On computers, ensure you're connected to WiFi
//         </small>
//       )}
//     </div>,
//     { duration: 8000 }
//   );

//   // Optimized options for each device type
//   const options = {
//     enableHighAccuracy: isMobile, // High accuracy only for mobile
//     timeout: isMobile ? 10000 : 15000, // Longer timeout for laptops
//     maximumAge: 0
//   };

//   try {
//     const position = await new Promise((resolve, reject) => {
//       const timeoutId = setTimeout(() => {
//         reject(new Error('TIMEOUT'));
//       }, options.timeout + 2000);

//       // Remove Vercel cold start timeout (not needed for client-side geolocation)
//       navigator.geolocation.getCurrentPosition(
//         (pos) => {
//           clearTimeout(timeoutId);
//           resolve(pos);
//         },
//         (err) => {
//           clearTimeout(timeoutId);
//           reject(err);
//         },
//         options
//       );
//     });

//     toast.dismiss();
//     toast.success(
//       <div>
//         <p>Location found!</p>
//         {position.coords.accuracy && (
//           <small>Accuracy: ~{Math.round(position.coords.accuracy)} meters</small>
//         )}
//       </div>
//     );

//     const coords = {
//       latitude: position.coords.latitude,
//       longitude: position.coords.longitude,
//       accuracy: position.coords.accuracy
//     };

//     setCoordinates(coords);

//     // Reverse geocoding with better error handling
//     try {
//       await Promise.race([
//         reverseGeocode([coords.longitude, coords.latitude]),
//         new Promise((_, reject) => setTimeout(() => reject(new Error('GEOCODE_TIMEOUT')), 5000))
//       ]);
//     } catch (geocodeErr) {
//       console.warn("Reverse geocode failed:", geocodeErr);
//       setAddress(
//         `Near: ${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)}` +
//         (coords.accuracy ? ` (Accuracy: ~${Math.round(coords.accuracy)}m)` : "")
//       );
//     }

//     // Update map if visible
//     if (showMap && mapRef.current) {
//       mapRef.current.flyTo({
//         center: [coords.longitude, coords.latitude],
//         zoom: coords.accuracy > 1000 ? 12 : 14
//       });
//       placeMarker([coords.longitude, coords.latitude], mapRef.current);
//     }

//   } catch (error) {
//     toast.dismiss();
//     let errorMessage = "Location service failed";
//     let userMessage = "We couldn't access your location";
//     let showMapOption = true;

//     // Enhanced error handling
//     if (error.code === 1) { // PERMISSION_DENIED
//       errorMessage = "PERMISSION_DENIED";
//       userMessage = (
//         <div>
//           <p>Location permission was denied</p>
//           <button 
//             onClick={() => window.location.reload()}
//             className="mt-2 px-3 py-1 text-sm bg-white text-blue-600 rounded"
//           >
//             Refresh and try again
//           </button>
//         </div>
//       );
//     } 
//     else if (error.code === 2) { // POSITION_UNAVAILABLE
//       errorMessage = "POSITION_UNAVAILABLE";
//       userMessage = !isMobile 
//         ? "Couldn't determine location from network signals. Ensure you're connected to WiFi."
//         : "Location services unavailable. Check your device's GPS/WiFi.";
//     }
//     else if (error.code === 3 || error.message === 'TIMEOUT') {
//       errorMessage = "TIMEOUT";
//       userMessage = "Location request timed out. Try again in an area with better signal.";
//     }
//     else if (error.message === 'GEOCODE_TIMEOUT') {
//       errorMessage = "GEOCODE_TIMEOUT";
//       showMapOption = false;
//     }

//     console.error("Geolocation error:", error);

//     if (showMapOption) {
//       toast.error(
//         <div>
//           <div>{userMessage}</div>
//           <button 
//             onClick={() => setShowMap(true)}
//             className="mt-2 px-3 py-1 text-sm bg-white text-red-600 rounded"
//           >
//             Select from map instead
//           </button>
//         </div>,
//         { duration: 8000 }
//       );
//     }

//     setError(errorMessage);
//   } finally {
//     setIsLoading(false);
//   }
// };


const getCurrentLocation = async () => {
  setIsLoading(true);
  setError("");
  setIsReadOnly(false);
  toast.dismiss();

  // 1. Environment Validation
  if (typeof window === 'undefined' || !navigator.geolocation) {
    const msg = "Geolocation is not supported in this browser";
    toast.error(msg);
    setError(msg);
    setIsLoading(false);
    return;
  }

  // 2. Check if HTTPS (required by some browsers)
  const isSecure = location.protocol === 'https:' || location.hostname === 'localhost';
  if (!isSecure) {
    const msg = "Location services require a secure connection (HTTPS)";
    toast.error(msg);
    setError(msg);
    setIsLoading(false);
    return;
  }

  // 3. Device Detection
  const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  const deviceType = isMobile ? "phone" : "computer";

  // 4. Enhanced Device-Specific Configuration
  const options = {
    enableHighAccuracy: false, // Set to false for laptops to use network location
    timeout: isMobile ? 15000 : 30000, // Even longer timeout for laptops
    maximumAge: isMobile ? 0 : 300000 // Allow 5-minute-old location for laptops
  };

  // 5. Check permissions first (if supported)
  if (navigator.permissions) {
    try {
      const permission = await navigator.permissions.query({name: 'geolocation'});
      if (permission.state === 'denied') {
        const msg = "Location permission is denied. Please enable it in browser settings.";
        toast.error(msg);
        setError("PERMISSION_DENIED");
        setIsLoading(false);
        return;
      }
    } catch (permError) {
      console.warn("Permission check failed:", permError);
    }
  }

  // 6. User Feedback with Network Check
  const networkInfo = navigator.connection ? 
    `Network: ${navigator.connection.effectiveType || 'unknown'}` : '';
    
  toast.loading(
    <div>
      <p>Detecting your {deviceType}'s location...</p>
      {!isMobile && (
        <div className="mt-2 text-sm bg-blue-50 p-2 rounded">
          <p className="font-medium">For computers:</p>
          <ul className="list-disc pl-5">
            <li>Must be connected to WiFi network</li>
            <li>Works best with multiple nearby WiFi networks</li>
            <li>Corporate networks may block location services</li>
            <li>Accuracy typically 100m-1km</li>
          </ul>
          {networkInfo && <p className="mt-1 text-xs text-gray-600">{networkInfo}</p>}
        </div>
      )}
    </div>,
    { duration: 15000 }
  );

  try {
    // 7. Multiple Attempts with Fallback Strategy
    let position;
    const maxAttempts = isMobile ? 1 : 2;
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        // Adjust options for second attempt on laptops
        const currentOptions = attempt === 2 ? {
          ...options,
          enableHighAccuracy: false,
          maximumAge: 600000 // 10 minutes for second attempt
        } : options;

        position = await new Promise((resolve, reject) => {
          const timeoutId = setTimeout(() => {
            reject(new Error('TIMEOUT'));
          }, currentOptions.timeout + 5000);

          navigator.geolocation.getCurrentPosition(
            (pos) => {
              clearTimeout(timeoutId);
              resolve(pos);
            },
            (err) => {
              clearTimeout(timeoutId);
              
              // Enhanced error classification
              if (!isMobile) {
                if (err.code === 2) {
                  err.message = 'LAPTOP_LOCATION_UNAVAILABLE';
                } else if (err.code === 3) {
                  err.message = 'LAPTOP_TIMEOUT';
                }
              }
              
              reject(err);
            },
            currentOptions
          );
        });

        // Success - break out of retry loop
        break;
        
      } catch (attemptError) {
        if (attempt === maxAttempts) {
          throw attemptError; // Last attempt failed
        }
        console.warn(`Attempt ${attempt} failed, trying again...`, attemptError);
        await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2s before retry
      }
    }

    // 8. Success Handling
    toast.dismiss();
    
    const accuracyText = position.coords.accuracy ? 
      `~${Math.round(position.coords.accuracy)}m` : 'unknown';
    
    toast.success(
      <div>
        <p>Location found! ({deviceType})</p>
        <small>Accuracy: {accuracyText}</small>
        {!isMobile && position.coords.accuracy > 1000 && (
          <div className="text-xs text-orange-600 mt-1">
            Large accuracy radius is normal for computers
          </div>
        )}
      </div>
    );

    const coords = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      accuracy: position.coords.accuracy
    };

    setCoordinates(coords);

    // 9. Reverse Geocoding with Extended Timeout
    try {
      await Promise.race([
        reverseGeocode([coords.longitude, coords.latitude]),
        new Promise((_, reject) => setTimeout(() => reject(new Error('GEOCODE_TIMEOUT')), 8000))
      ]);
    } catch (geocodeErr) {
      console.warn("Reverse geocode failed:", geocodeErr);
      setAddress(
        `Coordinates: ${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)}` +
        (coords.accuracy ? ` (±${Math.round(coords.accuracy)}m)` : "")
      );
    }

    // 10. Update Map Display with Device-Appropriate Zoom
    if (showMap && mapRef.current) {
      const zoom = isMobile ? 
        (coords.accuracy > 1000 ? 12 : 15) : // Phone zoom levels
        (coords.accuracy > 2000 ? 10 : 12);  // Laptop zoom levels (wider view)
        
      mapRef.current.flyTo({
        center: [coords.longitude, coords.latitude],
        zoom: zoom
      });
      placeMarker([coords.longitude, coords.latitude], mapRef.current);
    }

  } catch (error) {
    // 11. Enhanced Error Handling
    toast.dismiss();
    let errorMessage = "Location service failed";
    let userMessage = "We couldn't access your location";

    if (error.message === 'LAPTOP_LOCATION_UNAVAILABLE') {
      errorMessage = "NETWORK_LOCATION_UNAVAILABLE";
      userMessage = (
        <div>
          <p className="font-medium">Computer location unavailable</p>
          <div className="mt-2 p-3 bg-red-50 rounded text-sm">
            <p className="font-medium">Common causes:</p>
            <ul className="list-disc pl-5 mt-1">
              <li>Not connected to WiFi (ethernet won't work)</li>
              <li>Corporate/school network blocking location</li>
              <li>Rural area with few WiFi networks nearby</li>
              <li>VPN interfering with location detection</li>
            </ul>
            <p className="mt-2 font-medium">Solutions:</p>
            <ol className="list-decimal pl-5">
              <li>Connect to a different WiFi network</li>
              <li>Disable VPN temporarily</li>
              <li>Move to an area with more WiFi networks</li>
              <li>Use the map to select your location manually</li>
            </ol>
          </div>
        </div>
      );
    }
    else if (error.message === 'LAPTOP_TIMEOUT') {
      errorMessage = "LAPTOP_TIMEOUT";
      userMessage = (
        <div>
          <p>Location request timed out on your computer</p>
          <p className="text-sm mt-1">Laptop location detection can be slow. Try again or use the map.</p>
        </div>
      );
    }
    else if (error.code === 1) {
      errorMessage = "PERMISSION_DENIED";
      userMessage = (
        <div>
          <p>Location permission denied</p>
          <p className="text-sm mt-1">Please allow location access in your browser settings</p>
        </div>
      );
    }
    else if (error.code === 3 || error.message === 'TIMEOUT') {
      errorMessage = "TIMEOUT";
      userMessage = "Location request timed out. Please try again";
    }

    console.error("Geolocation error:", error);

    toast.error(
      <div>
        <div className="mb-2">{userMessage}</div>
        <div className="flex gap-2">
          <button 
            onClick={() => getCurrentLocation()}
            className="px-3 py-1 text-sm bg-white text-blue-600 rounded border border-blue-200 hover:bg-blue-50"
          >
            Try Again
          </button>
          <button 
            onClick={() => setShowMap(true)}
            className="px-3 py-1 text-sm bg-white text-red-600 rounded border border-red-200 hover:bg-red-50"
          >
            Use Map Instead
          </button>
        </div>
      </div>,
      { duration: 15000 }
    );

    setError(errorMessage);
  } finally {
    setIsLoading(false);
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
