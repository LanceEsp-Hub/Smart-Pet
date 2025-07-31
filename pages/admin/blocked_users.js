"use client"

import { useState, useEffect } from "react"
import { getBlockedUsers, unblockUser } from "../../utils/api"
import AdminSidebar from "../../components/AdminSidebar"

export default function BlockedUsers() {
  const [blockedUsers, setBlockedUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
  })

  const fetchBlockedUsers = async () => {
    try {
      setLoading(true)
      const data = await getBlockedUsers(pagination.page, pagination.limit, searchTerm)
      setBlockedUsers(data.data)
      setPagination((prev) => ({ ...prev, total: data.total }))
      setError(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBlockedUsers()
  }, [pagination.page, searchTerm])

  const handleUnblock = async (blockId) => {
    if (!confirm("Are you sure you want to unblock this user relationship?")) return

    try {
      await unblockUser(blockId)
      fetchBlockedUsers()
    } catch (err) {
      setError(err.message)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    setPagination((prev) => ({ ...prev, page: 1 }))
    fetchBlockedUsers()
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      <AdminSidebar />

      <div className="flex-1 ml-64 container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
            Blocked Users Management
          </h1>
          <p className="text-gray-600">Manage user blocking relationships</p>
        </div>

        {/* Search Bar */}
        <div className="mb-6 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6">
          <form onSubmit={handleSearch}>
            <div className="flex">
              <input
                type="text"
                placeholder="Search by blocker or blocked user name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 p-3 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <button
                type="submit"
                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-r-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200"
              >
                Search
              </button>
            </div>
          </form>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">{error}</div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : (
          <>
            {/* Blocked Users Table */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden mb-6">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gradient-to-r from-purple-500 to-blue-500 text-white">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider">Blocker</th>
                      <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider">Blocked User</th>
                      <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider">Blocked Date</th>
                      <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {blockedUsers.map((block) => (
                      <tr key={block.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            {block.blocker_profile_picture ? (
                              <img
                                className="h-10 w-10 rounded-full object-cover"
                                src={block.blocker_profile_picture || "/placeholder.svg"}
                                alt={block.blocker_name}
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-purple-200 flex items-center justify-center">
                                <span className="text-purple-600 font-medium">{block.blocker_name.charAt(0)}</span>
                              </div>
                            )}
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{block.blocker_name}</div>
                              <div className="text-sm text-gray-500">{block.blocker_email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            {block.blocked_user_profile_picture ? (
                              <img
                                className="h-10 w-10 rounded-full object-cover"
                                src={block.blocked_user_profile_picture || "/placeholder.svg"}
                                alt={block.blocked_user_name}
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-red-200 flex items-center justify-center">
                                <span className="text-red-600 font-medium">{block.blocked_user_name.charAt(0)}</span>
                              </div>
                            )}
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{block.blocked_user_name}</div>
                              <div className="text-sm text-gray-500">{block.blocked_user_email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{new Date(block.created_at).toLocaleDateString()}</div>
                          <div className="text-sm text-gray-500">{new Date(block.created_at).toLocaleTimeString()}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => handleUnblock(block.id)}
                            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm transition-colors duration-200"
                          >
                            Unblock
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-4">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{(pagination.page - 1) * pagination.limit + 1}</span> to{" "}
                  <span className="font-medium">{Math.min(pagination.page * pagination.limit, pagination.total)}</span>{" "}
                  of <span className="font-medium">{pagination.total}</span> blocked relationships
                </p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setPagination((prev) => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                  disabled={pagination.page === 1}
                  className="px-4 py-2 border rounded-md disabled:opacity-50 bg-white hover:bg-gray-50 transition-colors"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
                  disabled={pagination.page * pagination.limit >= pagination.total}
                  className="px-4 py-2 border rounded-md disabled:opacity-50 bg-white hover:bg-gray-50 transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
