
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

//  const getCurrentLocation = async () => {
//   setIsLoading(true);
//   setError("");
//   setIsReadOnly(false);
//   toast.dismiss();

//   // Check if we're running in a browser environment (important for Vercel)
//   if (typeof window === 'undefined' || !navigator.geolocation) {
//     const msg = "Geolocation is not available in this environment";
//     console.error(msg);
//     toast.error(msg);
//     setError(msg);
//     setIsLoading(false);
//     return;
//   }

//   // Check if we're on HTTPS (required for geolocation in most browsers)
//   if (window.location.protocol !== 'https:') {
//     const msg = "Geolocation requires HTTPS. You're currently on: " + window.location.protocol;
//     console.error(msg);
//     toast.error("Please use HTTPS for location services");
//     setError(msg);
//     setIsLoading(false);
//     return;
//   }

//   // Show permission guidance specific to Vercel deployments
//   toast.loading(
//     <div>
//       <p>Waiting for location access...</p>
//       <small>Check for a browser permission prompt</small>
//     </div>,
//     { duration: 8000 }
//   );

//   const options = {
//     enableHighAccuracy: true,
//     timeout: 10000,
//     maximumAge: 0
//   };

//   try {
//     const position = await new Promise((resolve, reject) => {
//       // Primary timeout
//       const timeoutId = setTimeout(() => {
//         reject(new Error('TIMEOUT'));
//       }, options.timeout + 2000);

//       // Secondary timeout for Vercel cold starts
//       const vercelTimeoutId = setTimeout(() => {
//         reject(new Error('VERCEL_TIMEOUT'));
//       }, 5000);

//       navigator.geolocation.getCurrentPosition(
//         (pos) => {
//           clearTimeout(timeoutId);
//           clearTimeout(vercelTimeoutId);
//           resolve(pos);
//         },
//         (err) => {
//           clearTimeout(timeoutId);
//           clearTimeout(vercelTimeoutId);
//           reject(err);
//         },
//         options
//       );
//     });

//     toast.dismiss();
//     toast.success("Location obtained!");

//     const coords = {
//       latitude: position.coords.latitude,
//       longitude: position.coords.longitude
//     };

//     setCoordinates(coords);

//     // Try reverse geocoding (with Vercel-friendly timeout)
//     try {
//       await Promise.race([
//         reverseGeocode([coords.longitude, coords.latitude]),
//         new Promise((_, reject) => setTimeout(() => reject(new Error('GEOCODE_TIMEOUT')), 3000))
//       ]);
//     } catch (geocodeErr) {
//       console.warn("Reverse geocode failed, using coordinates:", geocodeErr);
//       setAddress(`Near: ${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)}`);
//     }

//     // Update map if visible
//     if (showMap && mapRef.current) {
//       mapRef.current.flyTo({
//         center: [coords.longitude, coords.latitude],
//         zoom: 14
//       });
//       placeMarker([coords.longitude, coords.latitude], mapRef.current);
//     }

//   } catch (error) {
//     toast.dismiss();
//     let errorMessage = "Location service failed";
//     let userMessage = "We couldn't access your location";

//     // Special handling for Vercel-specific issues
//     if (error.message === 'VERCEL_TIMEOUT') {
//       errorMessage = "Vercel cold start delay detected";
//       userMessage = "Location service is warming up. Please try again in a moment";
//     } 
//     // Standard geolocation errors
//     else if (error.code === 1) {
//       errorMessage = "PERMISSION_DENIED";
//       userMessage = "Please enable location permissions in your browser settings";
//     } else if (error.code === 2) {
//       errorMessage = "POSITION_UNAVAILABLE";
//       userMessage = "Location services unavailable (check GPS/WiFi)";
//     } else if (error.code === 3 || error.message === 'TIMEOUT') {
//       errorMessage = "TIMEOUT";
//       userMessage = "Location request timed out. Try again in better signal area";
//     } else if (error.message === 'GEOCODE_TIMEOUT') {
//       errorMessage = "Reverse geocode timeout";
//       // Don't show this as an error to user - we already have coords
//     }

//     console.error("Geolocation error:", errorMessage, error);

//     // Only show error toast if it's not a geocode timeout
//     if (error.message !== 'GEOCODE_TIMEOUT') {
//       toast.error(
//         <div>
//           <p>{userMessage}</p>
//           <button 
//             onClick={() => setShowMap(true)}
//             className="mt-2 px-3 py-1 text-sm bg-white text-red-600 rounded"
//           >
//             Select from map instead
//           </button>
//         </div>,
//         { duration: 5000 }
//       );
//     }

//     setError(errorMessage);
//   } finally {
//     setIsLoading(false);
//   }
// };
//working codeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee


const getCurrentLocation = async () => {
  setIsLoading(true);
  setError("");
  setIsReadOnly(false);
  toast.dismiss();

  // Enhanced environment check
  if (typeof window === 'undefined' || !navigator.geolocation) {
    const msg = "Geolocation is not supported in this browser";
    console.error(msg);
    toast.error(msg);
    setError(msg);
    setIsLoading(false);
    return;
  }

  // Check HTTPS with better messaging
  if (window.location.protocol !== 'https:') {
    const msg = "Geolocation requires HTTPS for security";
    console.error(msg);
    toast.error(
      <div>
        <p>{msg}</p>
        <p className="text-sm">Current protocol: {window.location.protocol}</p>
      </div>
    );
    setError(msg);
    setIsLoading(false);
    return;
  }

  // Detect device type for tailored messaging
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  const deviceType = isMobile ? "phone" : "computer";

  // Device-specific guidance
  toast.loading(
    <div>
      <p>Detecting your {deviceType}'s location...</p>
      {!isMobile && (
        <small className="block mt-1">
          On computers, ensure WiFi is on for better accuracy
        </small>
      )}
    </div>,
    { duration: 8000 }
  );

  // Adjust accuracy based on device
  const options = {
    enableHighAccuracy: isMobile, // High accuracy only on mobile
    timeout: 15000, // Longer timeout for laptops
    maximumAge: 0
  };

  try {
    const position = await new Promise((resolve, reject) => {
      let timeoutId;
      let permissionCheckId;

      // Main timeout
      timeoutId = setTimeout(() => {
        reject(new Error('TIMEOUT'));
      }, options.timeout + 2000);

      // Special laptop permission check
      if (!isMobile) {
        permissionCheckId = setTimeout(() => {
          if (!document.hidden) {
            toast(
              <div>
                <p>Don't see a permission prompt?</p>
                <button 
                  onClick={() => window.location.reload()}
                  className="mt-1 px-2 py-1 text-xs bg-white text-blue-600 rounded"
                >
                  Refresh page to trigger it
                </button>
              </div>,
              { duration: 5000 }
            );
          }
        }, 3000);
      }

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          clearTimeout(timeoutId);
          clearTimeout(permissionCheckId);
          resolve(pos);
        },
        (err) => {
          clearTimeout(timeoutId);
          clearTimeout(permissionCheckId);
          reject(err);
        },
        options
      );
    });

    toast.dismiss();
    toast.success(
      <div>
        <p>Location found!</p>
        <p className="text-sm">
          Accuracy: {position.coords.accuracy.toFixed(0)} meters
        </p>
      </div>
    );

    const coords = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      accuracy: position.coords.accuracy
    };

    setCoordinates(coords);

    // Try reverse geocoding with laptop-specific fallback
    try {
      await Promise.race([
        reverseGeocode([coords.longitude, coords.latitude]),
        new Promise((_, reject) => setTimeout(() => reject(new Error('GEOCODE_TIMEOUT')), 5000))
      ]);
    } catch (geocodeErr) {
      console.warn("Reverse geocode failed:", geocodeErr);
      setAddress(
        isMobile 
          ? `Near coordinates: ${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)}`
          : `Approximate location (accuracy: ${coords.accuracy.toFixed(0)}m)`
      );
    }

    // Update map if visible
    if (showMap && mapRef.current) {
      mapRef.current.flyTo({
        center: [coords.longitude, coords.latitude],
        zoom: coords.accuracy > 1000 ? 12 : 14 // Adjust zoom based on accuracy
      });
      placeMarker([coords.longitude, coords.latitude], mapRef.current);
      
      // Add accuracy circle for laptops
      if (!isMobile && coords.accuracy > 50) {
        if (mapRef.current.getSource('accuracy-circle')) {
          mapRef.current.removeLayer('accuracy-circle');
          mapRef.current.removeSource('accuracy-circle');
        }
        
        mapRef.current.addSource('accuracy-circle', {
          type: 'geojson',
          data: {
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [coords.longitude, coords.latitude]
            },
            properties: {
              radius: coords.accuracy
            }
          }
        });
        
        mapRef.current.addLayer({
          id: 'accuracy-circle',
          type: 'circle',
          source: 'accuracy-circle',
          paint: {
            'circle-radius': {
              stops: [
                [0, 0],
                [20, ['get', 'radius']]
              ],
              base: 2
            },
            'circle-color': '#4285F4',
            'circle-opacity': 0.2,
            'circle-stroke-color': '#4285F4',
            'circle-stroke-width': 1
          }
        });
      }
    }

  } catch (error) {
    toast.dismiss();
    let errorMessage = "Location detection failed";
    let userMessage = "We couldn't determine your location";
    let showMapOption = true;

    // Enhanced error handling for laptops
    if (!isMobile) {
      if (error.code === 2) { // POSITION_UNAVAILABLE
        errorMessage = "Network location services unavailable";
        userMessage = (
          <div>
            <p>Your computer couldn't determine location from network signals</p>
            <ul className="list-disc pl-5 text-sm mt-1">
              <li>Ensure you're connected to WiFi</li>
              <li>Try in a different location</li>
              <li>Check browser location settings</li>
            </ul>
          </div>
        );
      } else if (error.code === 1) { // PERMISSION_DENIED
        errorMessage = "Location permission denied";
        userMessage = (
          <div>
            <p>You denied location access</p>
            <button 
              onClick={() => {
                // Guide user to browser settings
                if (navigator.permissions) {
                  navigator.permissions.query({name: 'geolocation'})
                    .then(permissionStatus => {
                      console.log("Permission status:", permissionStatus.state);
                    });
                }
                window.location.reload(); // Refresh to retrigger prompt
              }}
              className="mt-2 px-3 py-1 text-sm bg-white text-blue-600 rounded"
            >
              Refresh and try again
            </button>
          </div>
        );
      }
    }

    // Standard error handling
    if (error.code === 3 || error.message === 'TIMEOUT') {
      errorMessage = "Location request timed out";
      userMessage = "Taking too long to get location. Try moving to an area with better signal";
    } else if (error.message === 'GEOCODE_TIMEOUT') {
      errorMessage = "Reverse geocode timeout";
      showMapOption = false;
    }

    console.error("Geolocation error:", errorMessage, error);

    if (showMapOption) {
      toast.error(
        <div>
          <div className="mb-2">{userMessage}</div>
          <button 
            onClick={() => setShowMap(true)}
            className="mt-1 px-3 py-1 text-sm bg-white text-red-600 rounded"
          >
            Select from map instead
          </button>
        </div>,
        { duration: 8000 }
      );
    }

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
