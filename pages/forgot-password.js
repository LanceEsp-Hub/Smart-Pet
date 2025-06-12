//frontend\pages\forgot-password.js

"use client";

import { useState } from "react";
import { sendPasswordResetEmail } from "../utils/api";
import Link from "next/link";

export default function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log("Submit button clicked"); // Debugging line

        if (!email) {
            setMessage("Please enter your email address.");
            return;
        }

        try {
            console.log("Sending password reset email to:", email); // Debugging line
            const response = await sendPasswordResetEmail(email);
            setMessage("Password reset email sent. Please check your inbox.");
        } catch (error) {
            console.error("Error:", error); // Debugging line
            setMessage(error.message || "Failed to send password reset email.");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
                <h1 className="text-2xl font-bold mb-6 text-center">Forgot Password</h1>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                            Email
                        </label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        Send Reset Link
                    </button>
                </form>
                {message && <p className="mt-4 text-center text-sm text-gray-600">{message}</p>}
                <div className="mt-4 text-center">
                    <Link href="/login" className="text-sm text-blue-500 hover:text-blue-700">
                        Back to Login
                    </Link>
                </div>
            </div>
        </div>
    );
}