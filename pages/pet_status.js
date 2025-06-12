"use client";

import { useState, useEffect } from "react";
import { Home, Search, SignpostBig } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { useRouter } from "next/navigation"; // For redirection
import Navbar from "../components/Navbar"; // Import Navbar
import Footer from "../components/Footer"; // Import Footer

export default function PetType() {
    const router = useRouter();
    const [isUploading, setIsUploading] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [userId, setUserId] = useState(null);

    useEffect(() => {
        // Check if session data exists
        const token = sessionStorage.getItem("auth_token");
        const userId = sessionStorage.getItem("user_id");
        
        if (!token || !userId) {
            router.push("/login");
        } else {
            setUserId(userId);
            setIsLoading(false);
        }
    }, [router]);

    if (isLoading) {
        return <div>Loading...</div>;
    }

    // Simulate upload process
    const handleOptionClick = async (option) => {
        setIsUploading(true);
    
        // Show loading toaster
        toast.promise(
            new Promise((resolve) => {
                setTimeout(() => {
                    // Save status directly to localStorage
                    localStorage.setItem('petStatus', option);
                    
                    resolve(`Pet marked as ${option}!`);
                }, 2000); // Simulate a 2-second upload process
            }),
            {
                loading: "Uploading...",
                success: (message) => `${message}`,
                error: "Upload failed. Please try again.",
            }
        ).then(() => {
            // Redirect to /pet_location after upload is complete
            router.push("/pet_location");
        }).finally(() => {
            setIsUploading(false);
        });
    };

    const handleGoBack = () => {
        // Remove pet status from localStorage
        localStorage.removeItem('petStatus');
        
        // Navigate back
        router.back();
    };

    return (
        <div className="min-h-screen bg-white">
            {/* Add Navbar */}
            <Navbar />

            {/* Alert Banner */}
            <div className="bg-[#C84E00] text-white text-center py-3">
                <p>
                    You have a lost pet.{" "}
                    <a href="/search" className="underline">
                        Click to Search
                    </a>
                </p>
            </div>

            {/* Purple Line */}
            <div className="h-[2px] bg-purple-600 mx-12 my-8" />

            <div className="max-w-2xl mx-auto px-4 text-center text-black">
                <h1 className="text-[2.5rem] font-bold text-[#1A237E] mb-12">Nice pic! This pet is:</h1>

                {/* Display user_id */}
                <div className="mb-4">
                    <p className="text-gray-600">User ID: <span className="font-semibold">{userId}</span></p>
                </div>

                <div className="max-w-md mx-auto mb-8">
                    <button
                        onClick={handleGoBack}
                        disabled={isUploading}
                        className="w-full flex items-center justify-center gap-2 p-4 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        ← Go Back
                    </button>
                </div>
                
                <div className="max-w-md mx-auto space-y-4">
                    {/* Safe at Home Button */}
                    <button
                        onClick={() => handleOptionClick("Safe at Home")}
                        disabled={isUploading}
                        className="w-full flex items-center justify-center gap-2 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Home className="h-5 w-5" />
                        <span>Safe at Home</span>
                    </button>

                    {/* Lost Button */}
                    <button
                        onClick={() => handleOptionClick("Lost")}
                        disabled={isUploading}
                        className="w-full flex items-center justify-center gap-2 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <SignpostBig className="h-5 w-5" />
                        <span>Lost</span>
                    </button>

                    {/* Pet I Found Button */}
                    <button
                        onClick={() => handleOptionClick("Pet I Found")}
                        disabled={isUploading}
                        className="w-full flex items-center justify-center gap-2 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Search className="h-5 w-5" />
                        <span>Found</span>
                    </button>

                    <button
                        onClick={() => handleOptionClick("Rehome Pet")}
                        disabled={isUploading}
                        className="w-full flex items-center justify-center gap-2 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Search className="h-5 w-5" />
                        <span>Rehome Pet</span>
                    </button>
                </div>
            </div>

            {/* Add Footer */}
            <Footer />

            {/* Toaster for Notifications */}
            <Toaster position="bottom-right" />
        </div>
    );
}