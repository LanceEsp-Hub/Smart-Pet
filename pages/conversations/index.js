// "use client";

// import { useState, useEffect } from 'react';
// import { useRouter } from 'next/navigation';
// import { getUserConversations } from '@/utils/api';
// import Navbar from "@/components/Navbar";
// import Footer from "@/components/Footer";

// export default function ConversationsPage() {
//   const router = useRouter();
//   const [conversations, setConversations] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     const fetchConversations = async () => {
//       try {
//         const data = await getUserConversations();
//         setConversations(data.conversations || []);
//       } catch (err) {
//         setError(err.message || 'Failed to load conversations');
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchConversations();
//   }, []);

//   if (loading) return <div className="p-4">Loading conversations...</div>;
//   if (error) return <div className="p-4 text-red-500">Error: {error}</div>;

//   return (
//     <div>     <Navbar />
    
//     <div className="p-4 max-w-md mx-auto">
//       <h1 className="text-xl font-bold mb-4">Messages</h1>
      
//       {conversations.length === 0 ? (
//         <p>No conversations found</p>
//       ) : (
//         <div className="space-y-2">
//           {conversations.map((conv) => (
//             <div
//               key={conv.conversation_id}
//               onClick={() => router.push(`/messages/${conv.other_user.id}`)}
//               className="flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
//             >
//               <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center mr-3">
//                 {conv.other_user.profile_picture ? (
//                   <img
//                     src={conv.other_user.profile_picture}
//                     alt={conv.other_user.name}
//                     className="w-full h-full rounded-full object-cover"
//                   />
//                 ) : (
//                   <span className="font-medium">
//                     {conv.other_user.name.charAt(0).toUpperCase()}
//                   </span>
//                 )}
//               </div>
//               <div>
//                 <p className="font-medium">{conv.other_user.name}</p>
//               </div>
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//         <Footer />
    
//     </div>

//   );
// }


"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { getUserConversations } from "@/utils/api"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"

export default function ConversationsPage() {
  const router = useRouter()
  const [conversations, setConversations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const data = await getUserConversations()
        setConversations(data.conversations || [])
      } catch (err) {
        setError(err.message || "Failed to load conversations")
      } finally {
        setLoading(false)
      }
    }

    fetchConversations()
  }, [])

  if (loading) {
    return (
      <div className="fixed inset-0 bg-white flex flex-col items-center justify-center z-50">
        <div className="flex flex-col items-center">
          <svg
            className="animate-spin h-12 w-12 text-indigo-600 mb-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <p className="text-indigo-600 font-medium text-xl">Loading conversations...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="p-6 text-center bg-red-50 rounded-lg border border-red-100 text-red-600 m-4 max-w-md w-full">
            Error: {error}
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-white">
      <Navbar />

      <div className="flex-grow flex flex-col p-6">
        <div className="max-w-md mx-auto w-full flex-1">
          <h1 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-3">Messages</h1>

          {conversations.length === 0 ? (
            <div className="flex items-center justify-center h-[10vh]">
              <p className="text-center py-8 text-gray-500">No conversations found</p>
            </div>
          ) : (
            <div className="space-y-3 min-h-[50vh] py-4">
              {conversations.map((conv) => (
                <div
                  key={conv.conversation_id}
                  onClick={() => router.push(`/messages/${conv.other_user.id}`)}
                  className="flex items-center p-4 border border-gray-200 rounded-xl hover:bg-gray-50 hover:shadow-md cursor-pointer transition-all duration-200"
                >
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center mr-4 shadow-sm">
                    {conv.other_user.profile_picture ? (
                      <img
                        src={conv.other_user.profile_picture || "/placeholder.svg"}
                        alt={conv.other_user.name}
                        className="w-full h-full rounded-full object-cover border-2 border-white"
                      />
                    ) : (
                      <span className="font-semibold text-white text-lg">
                        {conv.other_user.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800">{conv.other_user.name}</p>
                    <p className="text-sm text-gray-500 mt-1">Tap to view conversation</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  )
}
