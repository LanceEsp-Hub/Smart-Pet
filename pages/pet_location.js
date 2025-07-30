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

// Calapan Cathedral coordinates
const CALAPAN_CATHEDRAL = {
  longitude: 121.1797,
  latitude: 13.4112
};

// Expanded Calapan City bounds (larger area coverage)
const CALAPAN_BOUNDS = {
  north: 13.5000,  // Increased from 13.4500
  south: 13.3200,  // Decreased from 13.3700
  east: 121.2800,  // Increased from 121.2200
  west: 121.0800   // Decreased from 121.1400
};

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

  // Check if coordinates are within expanded Calapan City bounds
  const isWithinCalapanBounds = (lat, lng) => {
    return lat >= CALAPAN_BOUNDS.south && 
           lat <= CALAPAN_BOUNDS.north && 
           lng >= CALAPAN_BOUNDS.west && 
           lng <= CALAPAN_BOUNDS.east;
  };

  // Initialize Mapbox map when showMap is true
  useEffect(() => {
    if (!showMap || !mapContainer.current) return;

    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [CALAPAN_CATHEDRAL.longitude, CALAPAN_CATHEDRAL.latitude], // Always center on Calapan Cathedral
      zoom: 13, // Slightly reduced zoom to show larger area
      maxBounds: [
        [CALAPAN_BOUNDS.west, CALAPAN_BOUNDS.south], // Southwest corner
        [CALAPAN_BOUNDS.east, CALAPAN_BOUNDS.north]  // Northeast corner
      ]
    });

    mapRef.current = map;

    // Add a marker for Calapan Cathedral as reference
    const cathedralMarker = new mapboxgl.Marker({
      color: '#FF6B6B',
      scale: 0.8
    })
      .setLngLat([CALAPAN_CATHEDRAL.longitude, CALAPAN_CATHEDRAL.latitude])
      .setPopup(new mapboxgl.Popup().setHTML('<strong>Calapan Cathedral</strong><br>Reference Point'))
      .addTo(map);

    // Handle map clicks
    map.on('click', (e) => {
      const coords = [e.lngLat.lng, e.lngLat.lat];
      
      // Check if clicked location is within expanded Calapan bounds
      if (!isWithinCalapanBounds(e.lngLat.lat, e.lngLat.lng)) {
        setError("Please select a location within the Calapan City area only.");
        return;
      }
      
      setError(""); // Clear any previous errors
      placeMarker(coords, map);
      reverseGeocode(coords);
      setCoordinates({
        latitude: e.lngLat.lat,
        longitude: e.lngLat.lng
      });
      setIsReadOnly(true);
    });

    // If there are saved coordinates within Calapan bounds, show them
    if (coordinates && isWithinCalapanBounds(coordinates.latitude, coordinates.longitude)) {
      placeMarker([coordinates.longitude, coordinates.latitude], map);
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
        return "Your pet's current location in Calapan area (address)";
      case "Lost":
        return "Last seen in Calapan area near (address)";
      case "Pet I Found":
        return "Found in Calapan area near (address)";
      case "Rehome Pet":
        return "Pet location in Calapan area (address)";
      default:
        return "Pet location in Calapan area (address)";
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
      setError("Please enter or select a location in the Calapan City area");
      return;
    }

    // Check if coordinates are within expanded Calapan bounds before saving
    if (coordinates && !isWithinCalapanBounds(coordinates.latitude, coordinates.longitude)) {
      setError("Please select a location within the Calapan City area only.");
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

    const marker = new mapboxgl.Marker({
      color: '#8B5CF6'
    })
      .setLngLat(coords)
      .addTo(map);

    markerRef.current = marker;
    setSelectedLocation(coords);
  };

  const reverseGeocode = async (coords) => {
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${coords[0]},${coords[1]}.json?access_token=${mapboxgl.accessToken}&country=PH&proximity=${CALAPAN_CATHEDRAL.longitude},${CALAPAN_CATHEDRAL.latitude}`
      );
      const data = await response.json();
      if (data.features && data.features.length > 0) {
        // Filter results to prefer Calapan locations
        const calapanFeature = data.features.find(feature => 
          feature.place_name.toLowerCase().includes('calapan') ||
          feature.context?.some(ctx => ctx.text?.toLowerCase().includes('calapan'))
        ) || data.features[0];
        
        setAddress(calapanFeature.place_name);
        setError("");
      } else {
        setError("Could not determine address for this location");
        setAddress(`Calapan Area - ${coords[1].toFixed(4)}, ${coords[0].toFixed(4)}`);
      }
    } catch (err) {
      setError("Error fetching address");
      setAddress(`Calapan Area - ${coords[1].toFixed(4)}, ${coords[0].toFixed(4)}`);
    }
  };

  const getCurrentLocation = async () => {
    setIsLoading(true);
    setError("");
    setIsReadOnly(false);
    toast.dismiss();

    // Basic environment checks
    if (typeof window === 'undefined' || !navigator.geolocation) {
      const msg = "Geolocation is not supported in this browser";
      toast.error(msg);
      setError(msg);
      setIsLoading(false);
      return;
    }

    if (window.location.protocol !== 'https:') {
      const msg = "Geolocation requires HTTPS for security";
      toast.error(msg);
      setError(msg);
      setIsLoading(false);
      return;
    }

    // Simple loading message
    toast.loading("Detecting your location...", { duration: 8000 });

    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    };

    try {
      const position = await new Promise((resolve, reject) => {
        const timeoutId = setTimeout(() => {
          reject(new Error('TIMEOUT'));
        }, options.timeout + 2000);

        navigator.geolocation.getCurrentPosition(
          (pos) => {
            clearTimeout(timeoutId);
            resolve(pos);
          },
          (err) => {
            clearTimeout(timeoutId);
            reject(err);
          },
          options
        );
      });

      toast.dismiss();
      toast.success("Location found!");

      // Check if user's current location is within expanded Calapan bounds
      if (!isWithinCalapanBounds(position.coords.latitude, position.coords.longitude)) {
        setError("Your current location is outside the Calapan City area. Please select a location within the area manually.");
        setIsLoading(false);
        return;
      }

      const coords = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      };

      setCoordinates(coords);

      try {
        await reverseGeocode([coords.longitude, coords.latitude]);
      } catch (geocodeErr) {
        setAddress(`Calapan Area - ${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)}`);
      }

      if (showMap && mapRef.current) {
        mapRef.current.flyTo({
          center: [coords.longitude, coords.latitude],
          zoom: 14
        });
        placeMarker([coords.longitude, coords.latitude], mapRef.current);
      }

    } catch (error) {
      toast.dismiss();
      
      // Simplified error handling - just recommend map for any error
      toast.error(
        <div>
          <p>Couldn't get your location automatically</p>
          <button 
            onClick={() => setShowMap(true)}
            className="mt-2 px-3 py-1 text-sm bg-white text-red-600 rounded"
          >
            Select from map instead
          </button>
        </div>,
        { duration: 5000 }
      );

      setError("LOCATION_UNAVAILABLE");
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

      <div className="h-[2px] bg-purple-600 mx-12 my-8"></div>

      <div className="max-w-2xl mx-auto px-4 text-center">
        <h1 className="text-[2.5rem] font-bold text-[#1A237E] mb-6">
          {getQuestionText()}
        </h1>

        <p className="text-gray-600 mb-4">
          Please provide a specific address within the <strong>Calapan City area, Oriental Mindoro</strong>.
        </p>
        <p className="text-sm text-gray-500 mb-8">
          We will never share your exact location to the public.
        </p>

        <div className="max-w-md mx-auto">
          {!showMap ? (
            <>
              <input
                type="text"
                placeholder={getPlaceholderText()}
                className="w-full p-3 border rounded-lg mb-4 text-[#1A237E]"
                value={address}
                onChange={handleAddressChange}
                readOnly={isReadOnly}
              />

              {coordinates && (
                <div className="text-[#1A237E] mb-4 p-2 bg-gray-100 rounded text-sm text-left">
                  <p><strong>Coordinates:</strong></p>
                  <p>Latitude: {coordinates.latitude.toFixed(6)}</p>
                  <p>Longitude: {coordinates.longitude.toFixed(6)}</p>
                  <p className="text-green-600 text-xs mt-1">✓ Within Calapan City area</p>
                </div>
              )}

              <div className="flex flex-col gap-3 mb-4">
                <button
                  onClick={handleUseCurrentLocation}
                  className="text-purple-600 hover:text-purple-700 flex items-center justify-center gap-2 w-full p-3 border border-purple-200 rounded-lg cursor-pointer"
                  disabled={isLoading}
                >
                  <span>📍</span>
                  {isLoading ? "Getting location..." : `Use current location (Calapan area)`}
                </button>

                <button
                  onClick={handleManualLocationClick}
                  className="text-purple-600 hover:text-purple-700 flex items-center justify-center gap-2 w-full p-3 border border-purple-200 rounded-lg cursor-pointer"
                >
                  <span>🗺️</span> Select from Calapan City area map
                </button>
              </div>

              {error && (
                <div className="mb-2 p-2 bg-red-50 rounded">
                  <p className="text-red-500 text-sm">{error}</p>
                  {address && <p className="text-gray-700 mt-1 text-sm">Current: {address}</p>}
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

              <div className="mb-4 p-3 bg-blue-50 rounded-lg text-sm">
                <p className="text-blue-800">
                  <strong>🏛️ Map centered on Calapan Cathedral</strong>
                </p>
                <p className="text-blue-600">
                  Red marker shows the cathedral. Click anywhere in the Calapan City area to select your location.
                </p>
              </div>

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
                    <p className="text-green-600 text-sm mt-1">✓ Within Calapan City area</p>
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

// // const getCurrentLocation = async () => {
// //   setIsLoading(true);
// //   setError("");
// //   setIsReadOnly(false);
// //   toast.dismiss();

// //   // Enhanced environment checks
// //   if (typeof window === 'undefined' || !navigator.geolocation) {
// //     const msg = "Geolocation is not supported in this browser";
// //     toast.error(msg);
// //     setError(msg);
// //     setIsLoading(false);
// //     return;
// //   }

// //   if (window.location.protocol !== 'https:') {
// //     const msg = "Geolocation requires HTTPS for security";
// //     toast.error(msg);
// //     setError(msg);
// //     setIsLoading(false);
// //     return;
// //   }

// //   // Device detection
// //   const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
// //   const deviceType = isMobile ? "phone" : "computer";

// //   // Device-specific loading message
// //   toast.loading(
// //     <div>
// //       <p>Detecting your {deviceType}'s location...</p>
// //       {!isMobile && (
// //         <small className="block mt-1">
// //           On computers, ensure you're connected to WiFi
// //         </small>
// //       )}
// //     </div>,
// //     { duration: 8000 }
// //   );

// //   // Optimized options for each device type
// //   const options = {
// //     enableHighAccuracy: isMobile, // High accuracy only for mobile
// //     timeout: isMobile ? 10000 : 15000, // Longer timeout for laptops
// //     maximumAge: 0
// //   };

// //   try {
// //     const position = await new Promise((resolve, reject) => {
// //       const timeoutId = setTimeout(() => {
// //         reject(new Error('TIMEOUT'));
// //       }, options.timeout + 2000);

// //       // Remove Vercel cold start timeout (not needed for client-side geolocation)
// //       navigator.geolocation.getCurrentPosition(
// //         (pos) => {
// //           clearTimeout(timeoutId);
// //           resolve(pos);
// //         },
// //         (err) => {
// //           clearTimeout(timeoutId);
// //           reject(err);
// //         },
// //         options
// //       );
// //     });

// //     toast.dismiss();
// //     toast.success(
// //       <div>
// //         <p>Location found!</p>
// //         {position.coords.accuracy && (
// //           <small>Accuracy: ~{Math.round(position.coords.accuracy)} meters</small>
// //         )}
// //       </div>
// //     );

// //     const coords = {
// //       latitude: position.coords.latitude,
// //       longitude: position.coords.longitude,
// //       accuracy: position.coords.accuracy
// //     };

// //     setCoordinates(coords);

// //     // Reverse geocoding with better error handling
// //     try {
// //       await Promise.race([
// //         reverseGeocode([coords.longitude, coords.latitude]),
// //         new Promise((_, reject) => setTimeout(() => reject(new Error('GEOCODE_TIMEOUT')), 5000))
// //       ]);
// //     } catch (geocodeErr) {
// //       console.warn("Reverse geocode failed:", geocodeErr);
// //       setAddress(
// //         `Near: ${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)}` +
// //         (coords.accuracy ? ` (Accuracy: ~${Math.round(coords.accuracy)}m)` : "")
// //       );
// //     }

// //     // Update map if visible
// //     if (showMap && mapRef.current) {
// //       mapRef.current.flyTo({
// //         center: [coords.longitude, coords.latitude],
// //         zoom: coords.accuracy > 1000 ? 12 : 14
// //       });
// //       placeMarker([coords.longitude, coords.latitude], mapRef.current);
// //     }

// //   } catch (error) {
// //     toast.dismiss();
// //     let errorMessage = "Location service failed";
// //     let userMessage = "We couldn't access your location";
// //     let showMapOption = true;

// //     // Enhanced error handling
// //     if (error.code === 1) { // PERMISSION_DENIED
// //       errorMessage = "PERMISSION_DENIED";
// //       userMessage = (
// //         <div>
// //           <p>Location permission was denied</p>
// //           <button 
// //             onClick={() => window.location.reload()}
// //             className="mt-2 px-3 py-1 text-sm bg-white text-blue-600 rounded"
// //           >
// //             Refresh and try again
// //           </button>
// //         </div>
// //       );
// //     } 
// //     else if (error.code === 2) { // POSITION_UNAVAILABLE
// //       errorMessage = "POSITION_UNAVAILABLE";
// //       userMessage = !isMobile 
// //         ? "Couldn't determine location from network signals. Ensure you're connected to WiFi."
// //         : "Location services unavailable. Check your device's GPS/WiFi.";
// //     }
// //     else if (error.code === 3 || error.message === 'TIMEOUT') {
// //       errorMessage = "TIMEOUT";
// //       userMessage = "Location request timed out. Try again in an area with better signal.";
// //     }
// //     else if (error.message === 'GEOCODE_TIMEOUT') {
// //       errorMessage = "GEOCODE_TIMEOUT";
// //       showMapOption = false;
// //     }

// //     console.error("Geolocation error:", error);

// //     if (showMapOption) {
// //       toast.error(
// //         <div>
// //           <div>{userMessage}</div>
// //           <button 
// //             onClick={() => setShowMap(true)}
// //             className="mt-2 px-3 py-1 text-sm bg-white text-red-600 rounded"
// //           >
// //             Select from map instead
// //           </button>
// //         </div>,
// //         { duration: 8000 }
// //       );
// //     }

// //     setError(errorMessage);
// //   } finally {
// //     setIsLoading(false);
// //   }
// // };

// const getCurrentLocation = async () => {
//   setIsLoading(true);
//   setError("");
//   setIsReadOnly(false);
//   toast.dismiss();

//   // Basic environment checks
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

//   // Simple loading message
//   toast.loading("Detecting your location...", { duration: 8000 });

//   const options = {
//     enableHighAccuracy: true,
//     timeout: 10000,
//     maximumAge: 0
//   };

//   try {
//     const position = await new Promise((resolve, reject) => {
//       const timeoutId = setTimeout(() => {
//         reject(new Error('TIMEOUT'));
//       }, options.timeout + 2000);

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
//     toast.success("Location found!");

//     const coords = {
//       latitude: position.coords.latitude,
//       longitude: position.coords.longitude
//     };

//     setCoordinates(coords);

//     try {
//       await reverseGeocode([coords.longitude, coords.latitude]);
//     } catch (geocodeErr) {
//       setAddress(`Near: ${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)}`);
//     }

//     if (showMap && mapRef.current) {
//       mapRef.current.flyTo({
//         center: [coords.longitude, coords.latitude],
//         zoom: 14
//       });
//       placeMarker([coords.longitude, coords.latitude], mapRef.current);
//     }

//   } catch (error) {
//     toast.dismiss();
    
//     // Simplified error handling - just recommend map for any error
//     toast.error(
//       <div>
//         <p>Couldn't get your location automatically</p>
//         <button 
//           onClick={() => setShowMap(true)}
//           className="mt-2 px-3 py-1 text-sm bg-white text-red-600 rounded"
//         >
//           Select from map instead
//         </button>
//       </div>,
//       { duration: 5000 }
//     );

//     setError("LOCATION_UNAVAILABLE");
//   } finally {
//     setIsLoading(false);
//   }
// };
  


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
