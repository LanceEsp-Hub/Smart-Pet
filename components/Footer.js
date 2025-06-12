import Link from "next/link";

export default function Footer() {
    return (
        <footer className="bg-white border-t mt-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div>
                        <h3 className="text-sm font-semibold text-gray-900 uppercase mb-4">WHO WE ARE</h3>
                        <ul className="space-y-2">
                            <li>
                                <Link href="/about" className="text-gray-600 hover:text-purple-700">
                                    About
                                </Link>
                            </li>
                            <li>
                                <Link href="/contact" className="text-gray-600 hover:text-purple-700">
                                    Get in Touch
                                </Link>
                            </li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-gray-900 uppercase mb-4">OUR FAMILY</h3>
                        <ul className="space-y-2">
                            <li>
                                <Link href="https://SmartPetlove.org" className="text-gray-600 hover:text-purple-700">
                                    SmartPet Love
                                </Link>
                            </li>
                            <li>
                                <Link href="/adopt" className="text-gray-600 hover:text-purple-700">
                                    SmartPet Love Adopt
                                </Link>
                            </li>
                            <li>
                                <Link href="/care" className="text-gray-600 hover:text-purple-700">
                                    SmartPet Love Care
                                </Link>
                            </li>
                            <li>
                                <Link href="https://SmartPet.com" className="text-gray-600 hover:text-purple-700">
                                    SmartPet.com
                                </Link>
                            </li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-gray-900 uppercase mb-4">PET SEARCH</h3>
                        <ul className="space-y-2">
                            <li>
                                <Link href="/manage-pets" className="text-gray-600 hover:text-purple-700">
                                    Manage Pets
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>
                <div className="mt-8 pt-8 border-t text-center text-sm text-gray-600">
                    <p>
                        Use of this service, website, or application constitutes acceptance of all terms listed above. SmartPet Love
                        Lost and its associated logos are trademarks of SmartPet Animal Supplies, Inc.™ 2023, SmartPet Love | SmartPet
                        Animal Supplies, Inc. All rights reserved.
                    </p>
                    <div className="mt-4 flex justify-center items-center space-x-4">
                        <Link href="/privacy" className="hover:text-purple-700">
                            Privacy Policy
                        </Link>
                        <span>|</span>
                        <Link href="/terms" className="hover:text-purple-700">
                            Terms of Service
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
