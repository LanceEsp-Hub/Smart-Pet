import { useEffect, useState } from "react";
import Link from "next/link";


export default function Home() {
    return (
      <div>
        <nav class="flex justify-between items-center p-4 bg-white shadow-md">
          <div class="text-2xl font-bold text-purple-700">Petco <span class="text-black">Love Care</span></div>
          <div class="flex space-x-4">
            <a href="#" class="text-gray-600">Petco Love</a>
            <a href="#" class="text-gray-600">Petco Love Lost</a>
            <a href="#" class="text-gray-600">Petco Love Adopt</a>
            <a href="#" class="text-gray-600">Petco Love Care</a>
          </div>
          <div class="flex space-x-4">
            <a href="#" class="text-gray-600">Vaccines</a>
            <a href="#" class="text-gray-600">Pet Cancer</a>
            <a href="#" class="text-gray-600">About</a>
          </div>
          <button class="bg-purple-700 text-white px-6 py-2 rounded-full">Get Vaccines</button>
        </nav>
  
        <section class="flex flex-col md:flex-row items-center text-left p-12 bg-purple-100 text-gray-900">
          <div class="md:w-1/2 p-6">
            <h1 class="text-5xl font-bold text-gray-900">Pet care that’s accessible</h1>
            <p class="mt-4 text-lg text-gray-700">Petco Love Care champions pet health by facilitating access to affordable pet care, free pet vaccines, cancer resources, and other veterinary support.</p>
          </div>
          <div class="md:w-1/2 p-6 flex justify-center">
            <img src="https://via.placeholder.com/500" alt="Pet care service" class="rounded-lg shadow-lg w-full max-w-md"></img>
          </div>
        </section>
  
        <section class="flex flex-col md:flex-row items-center text-left p-12 bg-purple-100 text-gray-900">
          <div class="md:w-1/2 p-6">
            <h1 class="text-5xl font-bold text-gray-900">Your <span class="italic">love</span> story starts here.</h1>
            <p class="mt-4 text-lg text-gray-700">Find adoptable pets near you with a simple search.</p>
            <div class="mt-4">
              <input type="text" placeholder="Search by city or zip" class="w-full p-3 border rounded-lg" />
              <a href="#" class="text-purple-700 mt-2 block">Use current location</a>
            </div>
            <div class="flex space-x-4 mt-4">
              <button class="bg-white border border-gray-300 px-6 py-2 rounded-full">Dog</button>
              <button class="bg-white border border-gray-300 px-6 py-2 rounded-full">Cat</button>
              <button class="bg-white border border-gray-300 px-6 py-2 rounded-full">Other</button>
            </div>
            <button class="bg-purple-700 text-white px-6 py-3 rounded-full mt-4">Let's go!</button>
          </div>
          <div class="md:w-1/2 p-6 flex justify-center">
            <img src="https://via.placeholder.com/500" alt="Adoptable pet" class="rounded-lg shadow-lg w-full max-w-md"></img>
          </div>
        </section>
      </div>
    );
  }