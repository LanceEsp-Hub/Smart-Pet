"use client"

import { useState } from "react"
import { Menu, X } from "lucide-react"

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <div className="relative">
      <nav className="bg-white shadow-md">
        <div className="flex justify-center items-center px-6 py-2 border-b">
          <div className="text-gray-600 text-xs space-x-4">
            <a href="/lost" className="hover:text-purple-700">
              Petco Love Lost
            </a>
            <a href="/adopt" className="hover:text-purple-700">
              Petco Love Adopt
            </a>
            <a href="/care" className="hover:text-purple-700">
              Petco Love Care
            </a>
          </div>
        </div>
        <div className="flex justify-between items-center p-4">
          <button className="text-gray-600 focus:outline-none" onClick={() => setIsMenuOpen(true)}>
            <Menu size={24} />
          </button>
          <div className="text-2xl font-bold text-purple-700">
            Petco <span className="text-black">love</span>
          </div>
          <button className="bg-purple-700 text-white px-6 py-2 rounded-full">Donate</button>
        </div>
      </nav>

      {isMenuOpen && (
        <div className="fixed inset-0 bg-white z-50 transition-transform duration-300 transform translate-x-0">
          <div className="flex justify-between items-center p-4 border-b">
            <div className="text-2xl font-bold text-purple-700">
              Petco <span className="text-black">love</span>
            </div>
            <button className="text-gray-600 focus:outline-none" onClick={() => setIsMenuOpen(false)}>
              <X size={24} />
            </button>
          </div>
          <div className="p-4">
            <h2 className="text-xl font-bold mb-4">Menu</h2>
            <ul className="space-y-4">
              <li>
                <h3 className="font-semibold">About</h3>
                <ul className="ml-4 mt-2 space-y-2">
                  <li>
                    <a href="#" className="text-gray-600 hover:text-purple-700">
                      Who We Are
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-gray-600 hover:text-purple-700">
                      What We Do
                    </a>
                  </li>
                </ul>
              </li>
              <li>
                <h3 className="font-semibold">Shelter Partners</h3>
                <ul className="ml-4 mt-2 space-y-2">
                  <li>
                    <a href="#" className="text-gray-600 hover:text-purple-700">
                      Vaccines
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-gray-600 hover:text-purple-700">
                      Grant Opportunities
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-gray-600 hover:text-purple-700">
                      Adopt at Petco
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-gray-600 hover:text-purple-700">
                      Toolkits
                    </a>
                  </li>
                </ul>
              </li>
              <li>
                <h3 className="font-semibold">Our Family</h3>
                <ul className="ml-4 mt-2 space-y-2">
                  <li>
                    <a href="#" className="text-gray-600 hover:text-purple-700">
                      Petco Love Lost
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-gray-600 hover:text-purple-700">
                      Petco Love Adopt
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-gray-600 hover:text-purple-700">
                      Petco Love Care
                    </a>
                  </li>
                </ul>
              </li>
            </ul>
          </div>
        </div>
      )}

      <section className="flex flex-col md:flex-row items-center text-left p-12 bg-purple-700 text-white">
        <div className="md:w-1/2 p-6">
          <h1 className="text-5xl font-bold">Love changes lives.</h1>
          <p className="mt-4 text-lg">
            Petco Love, a national nonprofit, improves the lives of pets and their people. With nearly $400M invested,
            we're creating a lifesaving nation.
          </p>
        </div>
        <div className="md:w-1/2 p-6 flex justify-center">
          <img
            src="https://via.placeholder.com/500"
            alt="Woman hugging dog"
            className="rounded-lg shadow-lg w-full max-w-md"
          />
        </div>
      </section>

      <section className="bg-white py-16 px-8 text-center">
        <h2 className="text-4xl font-bold mb-6">Paws up if you're down to help us</h2>
        <p className="text-xl mb-8">
          We harness the power of love to make communities and pet families closer, stronger, and healthier.
        </p>
      </section>

      <section className="bg-gray-100 py-16 px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-lg shadow-md p-4">
              <img
                src={`https://via.placeholder.com/300x200?text=Image+${i}`}
                alt={`Image ${i}`}
                className="w-full h-auto rounded"
              />
            </div>
          ))}
        </div>
      </section>

      <section className="bg-purple-700 text-white py-16 px-8 text-center">
        <h2 className="text-4xl font-bold mb-6">The challenge</h2>
        <p className="text-xl">All pets deserve Love. We help them find it.</p>
      </section>

      <section className="bg-white py-16 px-8">
        <div className="grid grid-cols-2 gap-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-gray-100 rounded-lg shadow-md p-4">
              <img
                src={`https://via.placeholder.com/400x300?text=Image+${i}`}
                alt={`Image ${i}`}
                className="w-full h-auto rounded"
              />
            </div>
          ))}
        </div>
      </section>

      <footer className="bg-gray-800 text-white py-12 px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-bold mb-4">Contact</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="hover:text-purple-400">
                  Email
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-purple-400">
                  Phone
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-purple-400">
                  Address
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold mb-4">About</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="hover:text-purple-400">
                  Our Mission
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-purple-400">
                  Team
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-purple-400">
                  Careers
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold mb-4">More</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="hover:text-purple-400">
                  Blog
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-purple-400">
                  Press
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-purple-400">
                  Partners
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="hover:text-purple-400">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-purple-400">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-purple-400">
                  Cookie Policy
                </a>
              </li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  )
}
