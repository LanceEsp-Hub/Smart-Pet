// "use client";
// import { useState, useEffect } from "react";
// import { Upload } from "lucide-react";
// import toast, { Toaster } from "react-hot-toast";
// import { useRouter } from "next/navigation";
// import Navbar from "../components/Navbar";
// import Footer from "../components/Footer";

// export default function UploadPetPhoto() {
//     const [selectedFile, setSelectedFile] = useState(null);
//     const [previewUrl, setPreviewUrl] = useState(null);
//     const [isUploading, setIsUploading] = useState(false);
//     const [isLoading, setIsLoading] = useState(true);
//     const [userId, setUserId] = useState(null);
//     const router = useRouter();

//     useEffect(() => {
//         // Check if session data exists
//         const token = sessionStorage.getItem("auth_token");
//         const userId = sessionStorage.getItem("user_id");
        
//         if (!token || !userId) {
//             router.push("/login");
//         } else {
//             setUserId(userId);
//             setIsLoading(false);
//         }
//     }, [router]);

//     if (isLoading) {
//         return <div>Loading...</div>;
//     }

//     // Handle file selection
//     const handleFileChange = (event) => {
//         const file = event.target.files?.[0];
//         if (file) {
//             if (file.type.startsWith("image/")) {
//                 setSelectedFile(file);
//                 setPreviewUrl(URL.createObjectURL(file));
//                 toast.success("File selected successfully!");
//             } else {
//                 toast.error("Please upload a valid image file (JPEG, PNG, JPG).");
//             }
//         }
//     };

//     // Handle file upload
//     const handleUpload = async () => {
//         if (!selectedFile) {
//             toast.error("Please select a file first.");
//             return;
//         }

//         setIsUploading(true);

//         try {
//             // Store only the file name in localStorage
//             localStorage.setItem('petImageName', selectedFile.name);
//             localStorage.setItem('petImageFile', JSON.stringify({
//                 name: selectedFile.name,
//                 type: selectedFile.type,
//                 size: selectedFile.size,
//                 lastModified: selectedFile.lastModified
//             }));
//             localStorage.setItem('user_id', userId);

//             toast.promise(
//                 new Promise((resolve) => {
//                     setTimeout(() => {
//                         resolve("Image ready for upload!");
//                     }, 1000);
//                 }),
//                 {
//                     loading: "Preparing image...",
//                     success: (message) => `${message}`,
//                     error: "Failed to prepare image. Please try again.",
//                 }
//             ).then(() => {
//                 // Redirect to next page
//                 router.push("/pet_name");
//             });
//         } catch (error) {
//             toast.error("Error processing image. Please try again.");
//         } finally {
//             setIsUploading(false);
//         }
//     };

//     return (
//         <div className="min-h-screen bg-white">
//             {/* Add Navbar */}
//             <Navbar />

//             {/* Alert Banner */}
//             <div className="bg-[#C84E00] text-white text-center py-3">
//                 <p>
//                     You have a lost pet.{" "}
//                     <a href="/search" className="underline">
//                         Click to Search
//                     </a>
//                 </p>
//             </div>

//             {/* Purple Line */}
//             <div className="h-[2px] bg-purple-600 mx-12 my-8" />

//             <div className="max-w-2xl mx-auto px-4 text-center">
//                 <h1 className="text-[2.5rem] font-bold text-[#1A237E] mb-6">Add pet photo</h1>
                
//                 {/* Display user_id */}
//                 <div className="mb-4">
//                     <p className="text-gray-600">User ID: <span className="font-semibold">{userId}</span></p>
//                 </div>

//                 <p className="text-gray-600 mb-12">
//                     Photo quality will affect your search results. Please select a clear image of one pet looking directly
//                     at the camera.
//                 </p>

//                 <div className="border border-gray-200 rounded-lg p-16">
//                     <div className="flex flex-col items-center">
//                         {/* Upload Icon */}
//                         <div className="w-16 h-16 mb-4">
//                             <Upload className="w-full h-full text-purple-600" />
//                         </div>

//                         {/* Upload Section */}
//                         <h2 className="text-black text-xl mb-2">Photo Upload</h2>
//                         <p className="text-gray-500">
//                             Drag and drop to upload or{" "}
//                             <label htmlFor="file-upload" className="text-purple-600 cursor-pointer">
//                                 browse
//                             </label>
//                         </p>

//                         {/* Hidden File Input */}
//                         <input
//                             id="file-upload"
//                             type="file"
//                             accept="image/*"
//                             className="hidden"
//                             onChange={handleFileChange}
//                             disabled={isUploading}
//                         />

//                         {/* Preview Image */}
//                         {previewUrl && (
//                             <div className="mt-6">
//                                 <img
//                                     src={previewUrl}
//                                     alt="Preview"
//                                     className="max-w-full h-auto rounded-lg"
//                                     loading="lazy"
//                                 />
//                                 <p className="text-sm text-gray-500 mt-2">{selectedFile?.name}</p>
//                             </div>
//                         )}

//                         {/* Upload Button */}
//                         <button
//                             onClick={handleUpload}
//                             disabled={isUploading || !selectedFile}
//                             className="mt-6 bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
//                         >
//                             {isUploading ? "Saving..." : "Save Photo & Continue"}
//                         </button>
//                     </div>
//                 </div>
//             </div>

//             {/* Add Footer */}
//             <Footer />

//             {/* Toaster for Notifications */}
//             <Toaster position="bottom-right" />
//         </div>
//     );
// }