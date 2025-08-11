import Link from "next/link"

export default function Footer() {
  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="space-y-6">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full"></div>
              <h3 className="text-lg font-bold text-white uppercase tracking-wider">WHO WE ARE</h3>
            </div>
            <div className="space-y-4">
              <Link
                href="/about"
                className="block text-gray-300 hover:text-white transition-colors duration-200 hover:translate-x-1 transform"
              >
                <div className="flex items-center space-x-2">
                  <span className="w-1 h-1 bg-purple-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  <span>About</span>
                </div>
              </Link>
              <Link
                href="/contact"
                className="block text-gray-300 hover:text-white transition-colors duration-200 hover:translate-x-1 transform"
              >
                <div className="flex items-center space-x-2">
                  <span className="w-1 h-1 bg-purple-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  <span>Get in Touch</span>
                </div>
              </Link>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full"></div>
              <h3 className="text-lg font-bold text-white uppercase tracking-wider">OUR FAMILY</h3>
            </div>
            <div className="space-y-4">
              <Link
                href="https://SmartPetlove.org"
                className="block text-gray-300 hover:text-white transition-colors duration-200 hover:translate-x-1 transform"
              >
                <div className="flex items-center space-x-2">
                  <span className="w-1 h-1 bg-blue-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  <span>SmartPet Love</span>
                </div>
              </Link>
              <Link
                href="/adopt"
                className="block text-gray-300 hover:text-white transition-colors duration-200 hover:translate-x-1 transform"
              >
                <div className="flex items-center space-x-2">
                  <span className="w-1 h-1 bg-blue-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  <span>SmartPet Love Adopt</span>
                </div>
              </Link>
              <Link
                href="/care"
                className="block text-gray-300 hover:text-white transition-colors duration-200 hover:translate-x-1 transform"
              >
                <div className="flex items-center space-x-2">
                  <span className="w-1 h-1 bg-blue-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  <span>SmartPet Love Care</span>
                </div>
              </Link>
              <Link
                href="https://SmartPet.com"
                className="block text-gray-300 hover:text-white transition-colors duration-200 hover:translate-x-1 transform"
              >
                <div className="flex items-center space-x-2">
                  <span className="w-1 h-1 bg-blue-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  <span>SmartPet.com</span>
                </div>
              </Link>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full"></div>
              <h3 className="text-lg font-bold text-white uppercase tracking-wider">PET SEARCH</h3>
            </div>
            <div className="space-y-4">
              <Link
                href="/manage-pets"
                className="block text-gray-300 hover:text-white transition-colors duration-200 hover:translate-x-1 transform"
              >
                <div className="flex items-center space-x-2">
                  <span className="w-1 h-1 bg-emerald-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  <span>Manage Pets</span>
                </div>
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-gray-700">
          <div className="text-center space-y-6">
            <p className="text-gray-400 text-sm leading-relaxed max-w-4xl mx-auto">
              Use of this service, website, or application constitutes acceptance of all terms listed above. SmartPet
              Love Lost and its associated logos are trademarks of SmartPet Animal Supplies, Inc.™ 2023, SmartPet Love |
              SmartPet Animal Supplies, Inc. All rights reserved.
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center space-y-2 sm:space-y-0 sm:space-x-8">
              <Link
                href="/privacy"
                className="text-gray-300 hover:text-white transition-colors duration-200 font-medium"
              >
                Privacy Policy
              </Link>
              <span className="hidden sm:block text-gray-600">•</span>
              <Link href="/terms" className="text-gray-300 hover:text-white transition-colors duration-200 font-medium">
                Terms of Service
              </Link>
            </div>

            <div className="flex justify-center space-x-2 pt-4">
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: "0.2s" }}></div>
              <div
                className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"
                style={{ animationDelay: "0.4s" }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}












// import Link from "next/link";

// export default function Footer() {
//     return (
//         <footer className="bg-white border-t mt-16">
//             <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
//                 <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
//                     <div>
//                         <h3 className="text-sm font-semibold text-gray-900 uppercase mb-4">WHO WE ARE</h3>
//                         <ul className="space-y-2">
//                             <li>
//                                 <Link href="/about" className="text-gray-600 hover:text-purple-700">
//                                     About
//                                 </Link>
//                             </li>
//                             <li>
//                                 <Link href="/contact" className="text-gray-600 hover:text-purple-700">
//                                     Get in Touch
//                                 </Link>
//                             </li>
//                         </ul>
//                     </div>
//                     <div>
//                         <h3 className="text-sm font-semibold text-gray-900 uppercase mb-4">OUR FAMILY</h3>
//                         <ul className="space-y-2">
//                             <li>
//                                 <Link href="https://SmartPetlove.org" className="text-gray-600 hover:text-purple-700">
//                                     SmartPet Love
//                                 </Link>
//                             </li>
//                             <li>
//                                 <Link href="/adopt" className="text-gray-600 hover:text-purple-700">
//                                     SmartPet Love Adopt
//                                 </Link>
//                             </li>
//                             <li>
//                                 <Link href="/care" className="text-gray-600 hover:text-purple-700">
//                                     SmartPet Love Care
//                                 </Link>
//                             </li>
//                             <li>
//                                 <Link href="https://SmartPet.com" className="text-gray-600 hover:text-purple-700">
//                                     SmartPet.com
//                                 </Link>
//                             </li>
//                         </ul>
//                     </div>
//                     <div>
//                         <h3 className="text-sm font-semibold text-gray-900 uppercase mb-4">PET SEARCH</h3>
//                         <ul className="space-y-2">
//                             <li>
//                                 <Link href="/manage-pets" className="text-gray-600 hover:text-purple-700">
//                                     Manage Pets
//                                 </Link>
//                             </li>
//                         </ul>
//                     </div>
//                 </div>
//                 <div className="mt-8 pt-8 border-t text-center text-sm text-gray-600">
//                     <p>
//                         Use of this service, website, or application constitutes acceptance of all terms listed above. SmartPet Love
//                         Lost and its associated logos are trademarks of SmartPet Animal Supplies, Inc.™ 2023, SmartPet Love | SmartPet
//                         Animal Supplies, Inc. All rights reserved.
//                     </p>
//                     <div className="mt-4 flex justify-center items-center space-x-4">
//                         <Link href="/privacy" className="hover:text-purple-700">
//                             Privacy Policy
//                         </Link>
//                         <span>|</span>
//                         <Link href="/terms" className="hover:text-purple-700">
//                             Terms of Service
//                         </Link>
//                     </div>
//                 </div>
//             </div>
//         </footer>
//     );
// }
