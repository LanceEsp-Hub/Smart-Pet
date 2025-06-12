// import { useRef, useState, useEffect } from 'react';
// import { useRouter } from 'next/router';
// import { Download, ArrowLeft } from 'lucide-react';
// import html2canvas from 'html2canvas';
// import { getPetFlyerData } from "../utils/api";

// function getPetImageUrl(imageName) {
//   if (!imageName) return "https://via.placeholder.com/400";
//   return `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/uploads/pet_images/${imageName}?t=${Date.now()}`;
// }

// export default function PetFlyerGenerator() {
//   const router = useRouter();
//   const { id } = router.query;
//   const flyerRef = useRef(null);
//   const [isGenerating, setIsGenerating] = useState(false);
//   const [flyerData, setFlyerData] = useState(null);
//   const [loading, setLoading] = useState(true);

//   // Fetch flyer data when component mounts
//   useEffect(() => {
//     if (!id) return;
  
//     const fetchFlyerData = async () => {
//       try {
//         const response = await getPetFlyerData(id);
//         if (response.success) {
//           setFlyerData(response.data);
//         } else {
//           throw new Error('Failed to load flyer data');
//         }
//       } catch (error) {
//         console.error('Error:', error);
//         alert(error.message || 'Failed to load pet data for flyer');
//       } finally {
//         setLoading(false);
//       }
//     };
  
//     fetchFlyerData();
//   }, [id]);

//   const generateFlyer = async () => {
//     if (!flyerRef.current || !flyerData) return;
    
//     setIsGenerating(true);
//     try {
//       // Load all images first
//       const images = flyerRef.current.querySelectorAll('img');
//       await Promise.all(Array.from(images).map(img => {
//         if (!img.complete) {
//           return new Promise((resolve, reject) => {
//             img.onload = resolve;
//             img.onerror = reject;
//           });
//         }
//         return Promise.resolve();
//       }));
  
//       const canvas = await html2canvas(flyerRef.current, {
//         scale: 2,
//         logging: true,  // Enable logging to see any issues
//         useCORS: true,
//         backgroundColor: '#ffffff',
//         allowTaint: true,  // Allow cross-origin images to be tainted
//         proxy: `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/uploads/pet_images/` // Proxy for CORS
//       });
      
//       const link = document.createElement('a');
//       link.download = `Missing-${flyerData.pet.name}-Flyer.png`;
//       link.href = canvas.toDataURL('image/png');
//       link.click();
      
//     } catch (error) {
//       console.error('Error generating flyer:', error);
//       alert('Failed to generate flyer: ' + error.message);
//     } finally {
//       setIsGenerating(false);
//     }
//   };

//   if (loading) return <div>Loading pet data...</div>;
//   if (!flyerData) return <div>No pet data available</div>;

//   return (
//     <div className="flyer-container">
//       <button 
//         onClick={generateFlyer}
//         disabled={isGenerating}
//         className="download-button"
//       >
//         {isGenerating ? 'Generating...' : (
//           <>
//             <Download size={16} />
//             Download Flyer
//           </>
//         )}
//       </button>

//       {/* Visible flyer preview */}
//       <div className="flyer-preview">
//         <div ref={flyerRef} className="flyer-template">
//           <div style={{
//             width: '8.5in',
//             height: '11in',
//             padding: '0.5in',
//             backgroundColor: 'white',
//             fontFamily: 'Arial, sans-serif'
//           }}>
//             <h1 style={{ color: 'red', textAlign: 'center', fontSize: '36px' }}>MISSING PET</h1>
//             <h2 style={{ textAlign: 'center', fontSize: '28px' }}>{flyerData.pet.name}</h2>
            
//             <div style={{ display: 'flex', marginTop: '20px' }}>
//               <div style={{ flex: 1, border: '2px solid #333', padding: '10px' }}>
//                 {flyerData.pet.image ? (
//                     <img 
//   src={getPetImageUrl(flyerData.pet.image)} 
//   alt={flyerData.pet.name}
//   style={{ width: '100%', height: '300px', objectFit: 'cover' }}
//   crossOrigin="anonymous"  // Important for CORS
//   onError={(e) => {
//     e.target.onerror = null;  // Prevent infinite loop
//     e.target.src = "https://via.placeholder.com/400";
//     e.target.style.objectFit = 'contain';
//   }}
// />
//                 ) : (
//                   <div style={{
//                     width: '100%',
//                     height: '300px',
//                     backgroundColor: '#f0f0f0',
//                     display: 'flex',
//                     alignItems: 'center',
//                     justifyContent: 'center'
//                   }}>
//                     No Image Available
//                   </div>
//                 )}
//               </div>
              
//               <div style={{ flex: 1, padding: '0 20px' }}>
//                 <h3 style={{ borderBottom: '2px solid #333' }}>Pet Details</h3>
//                 <p><strong>Type:</strong> {flyerData.pet.type}</p>
//                 <p><strong>Breed:</strong> {flyerData.pet.breed}</p>
//                 <p><strong>Color:</strong> {flyerData.pet.color}</p>
//                 <p><strong>Last Seen:</strong> {flyerData.pet.last_seen}</p>
//                 <p><strong>Date Missing:</strong> {flyerData.pet.date_lost}</p>
                
//                 <h3 style={{ borderBottom: '2px solid #333', marginTop: '20px' }}>Contact</h3>
//                 <p><strong>Name:</strong> {flyerData.owner.name}</p>
//                 <p><strong>Phone:</strong> {flyerData.owner.phone}</p>
//                 <p><strong>Email:</strong> {flyerData.owner.email}</p>
//               </div>
//             </div>
            
//             {flyerData.pet.description && (
//               <div style={{ marginTop: '20px' }}>
//                 <h3 style={{ borderBottom: '2px solid #333' }}>Description</h3>
//                 <p>{flyerData.pet.description}</p>
//               </div>
//             )}
            
//             <p style={{ 
//               textAlign: 'center', 
//               marginTop: '20px', 
//               fontStyle: 'italic' 
//             }}>
//               If found, please contact immediately. Reward may be available!
//             </p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
"use client"


import { useRef, useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Download, ArrowLeft } from 'lucide-react';
import html2canvas from 'html2canvas';
import { getPetFlyerData } from "../utils/api";

function getPetImageUrl(imageName) {
  if (!imageName) return "https://via.placeholder.com/400";
  return `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/uploads/pet_images/${imageName}?t=${Date.now()}`;
}

export default function PetFlyerGenerator() {
  const router = useRouter();
  const { id } = router.query;
  const flyerRef = useRef(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [flyerData, setFlyerData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
  
    const fetchFlyerData = async () => {
      try {
        const response = await getPetFlyerData(id);
        if (response.success) {
          setFlyerData(response.data);
        } else {
          throw new Error('Failed to load flyer data');
        }
      } catch (error) {
        console.error('Error:', error);
        alert(error.message || 'Failed to load pet data for flyer');
      } finally {
        setLoading(false);
      }
    };
  
    fetchFlyerData();
  }, [id]);

  const generateFlyer = async () => {
    if (!flyerRef.current || !flyerData) return;
    
    setIsGenerating(true);
    try {
      const images = flyerRef.current.querySelectorAll('img');
      await Promise.all(Array.from(images).map(img => {
        if (!img.complete) {
          return new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
          });
        }
        return Promise.resolve();
      }));
  
      const canvas = await html2canvas(flyerRef.current, {
        scale: 2,
        logging: true,
        useCORS: true,
        backgroundColor: '#ffffff',
        allowTaint: true,
        proxy: `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/uploads/pet_images/`
      });
      
      const link = document.createElement('a');
      link.download = `Missing-${flyerData.pet.name}-Flyer.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      
    } catch (error) {
      console.error('Error generating flyer:', error);
      alert('Failed to generate flyer: ' + error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4 text-lg font-medium text-gray-700">Loading pet data...</p>
      </div>
    </div>
  );
  
  if (!flyerData) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center p-6 bg-white rounded-lg shadow-md max-w-md">
        <h2 className="text-xl font-bold text-gray-800 mb-4">No Pet Data Available</h2>
        <button 
          onClick={() => router.back()}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
        >
          <ArrowLeft size={16} />
          Go Back
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <button 
            onClick={() => router.back()}
            className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
          >
            <ArrowLeft size={16} />
            Back
          </button>
          
          <button 
            onClick={generateFlyer}
            disabled={isGenerating}
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
              isGenerating 
                ? 'bg-blue-400 cursor-not-allowed' 
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
          >
            {isGenerating ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating...
              </>
            ) : (
              <>
                <Download size={16} />
                Download Flyer
              </>
            )}
          </button>
        </div>

        <div className="flex justify-center">
          <div ref={flyerRef} className="flyer-template bg-white shadow-xl rounded-lg overflow-hidden">
            <div className="w-[8.5in] h-[11in] p-8 flex flex-col items-center">
              <h1 className="text-4xl font-bold text-red-600 mb-2">MISSING PET</h1>
              <h2 className="text-3xl font-semibold text-gray-800 mb-8">{flyerData.pet.name}</h2>
              
              <div className="flex w-full gap-6 mb-8">
                <div className="flex-1 border-2 border-gray-800 rounded-lg overflow-hidden">
                  {flyerData.pet.image ? (
                    <img 
                      src={getPetImageUrl(flyerData.pet.image)} 
                      alt={flyerData.pet.name}
                      className="w-full h-72 object-cover"
                      crossOrigin="anonymous"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://via.placeholder.com/400";
                        e.target.className = "w-full h-72 object-contain bg-gray-100";
                      }}
                    />
                  ) : (
                    <div className="w-full h-72 bg-gray-100 flex items-center justify-center">
                      <p className="text-gray-500">No Image Available</p>
                    </div>
                  )}
                </div>
                
                <div className="flex-1">
                  <h3 className="text-xl font-bold border-b-2 border-gray-800 pb-2 mb-4">Pet Details</h3>
                  <div className="space-y-3">
                    <p><span className="font-semibold">Type:</span> {flyerData.pet.type}</p>
                    <p><span className="font-semibold">Breed:</span> {flyerData.pet.breed}</p>
                    <p><span className="font-semibold">Color:</span> {flyerData.pet.color}</p>
                    <p><span className="font-semibold">Last Seen:</span> {flyerData.pet.last_seen}</p>
                    <p><span className="font-semibold">Date Missing:</span> {flyerData.pet.date_lost}</p>
                  </div>
                  
                  <h3 className="text-xl font-bold border-b-2 border-gray-800 pb-2 mt-6 mb-4">Contact</h3>
                  <div className="space-y-3">
                    <p><span className="font-semibold">Name:</span> {flyerData.owner.name}</p>
                    <p><span className="font-semibold">Phone:</span> {flyerData.owner.phone}</p>
                    <p><span className="font-semibold">Email:</span> {flyerData.owner.email}</p>
                  </div>
                </div>
              </div>
              
              {flyerData.pet.description && (
                <div className="w-full mb-8">
                  <h3 className="text-xl font-bold border-b-2 border-gray-800 pb-2 mb-4">Description</h3>
                  <p className="text-gray-700">{flyerData.pet.description}</p>
                </div>
              )}
              
              <p className="text-center italic text-gray-700 mt-4">
                If found, please contact immediately. Reward may be available!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}