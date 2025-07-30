"use client"

import { useState, useEffect } from "react"
import { getUserReports, updateReportStatus } from "../../utils/api"
import AdminSidebar from "../../components/AdminSidebar"

export default function UserReports() {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [statusFilter, setStatusFilter] = useState("pending")
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
  })

  const fetchReports = async () => {
    try {
      setLoading(true)
      const data = await getUserReports(statusFilter, pagination.page, pagination.limit)
      setReports(data.data)
      setPagination((prev) => ({ ...prev, total: data.total }))
      setError(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReports()
  }, [statusFilter, pagination.page])

  const handleStatusUpdate = async (reportId, newStatus) => {
    try {
      await updateReportStatus(reportId, newStatus)
      fetchReports()
    } catch (err) {
      setError(err.message)
    }
  }

  const getReasonBadgeColor = (reason) => {
    const colors = {
      harassment: "bg-red-100 text-red-800",
      spam: "bg-yellow-100 text-yellow-800",
      inappropriate_content: "bg-orange-100 text-orange-800",
      fake_profile: "bg-purple-100 text-purple-800",
      other: "bg-gray-100 text-gray-800",
    }
    return colors[reason] || colors.other
  }

  const getStatusBadgeColor = (status) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800",
      reviewed: "bg-blue-100 text-blue-800",
      resolved: "bg-green-100 text-green-800",
      dismissed: "bg-gray-100 text-gray-800",
    }
    return colors[status] || colors.pending
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      <AdminSidebar />

      <div className="flex-1 ml-64 container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
            User Reports Management
          </h1>
          <p className="text-gray-600">Review and manage user reports</p>
        </div>

        {/* Status Filter */}
        <div className="mb-6 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">Filter by Status</label>
          <div className="flex flex-wrap gap-2">
            {["pending", "reviewed", "resolved", "dismissed"].map((status) => (
              <button
                key={status}
                onClick={() => {
                  setStatusFilter(status)
                  setPagination((prev) => ({ ...prev, page: 1 }))
                }}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  statusFilter === status
                    ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
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
            {/* Reports Table */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden mb-6">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gradient-to-r from-purple-500 to-blue-500 text-white">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider">
                        Report Details
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider">Reporter</th>
                      <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider">
                        Reported User
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider">Reason</th>
                      <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {reports.map((report) => (
                      <tr key={report.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="text-sm">
                            <div className="font-medium text-gray-900">Report #{report.id}</div>
                            <div className="text-gray-500 mt-1">{new Date(report.created_at).toLocaleDateString()}</div>
                            {report.description && (
                              <div className="text-gray-600 mt-2 max-w-xs">
                                <p className="truncate">{report.description}</p>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm">
                            <div className="font-medium text-gray-900">{report.reporter_name}</div>
                            <div className="text-gray-500">{report.reporter_email}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm">
                            <div className="font-medium text-gray-900">{report.reported_user_name}</div>
                            <div className="text-gray-500">{report.reported_user_email}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getReasonBadgeColor(report.reason)}`}
                          >
                            {report.reason.replace("_", " ")}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(report.status)}`}
                          >
                            {report.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex space-x-2">
                            {report.status === "pending" && (
                              <>
                                <button
                                  onClick={() => handleStatusUpdate(report.id, "reviewed")}
                                  className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs transition-colors"
                                >
                                  Review
                                </button>
                                <button
                                  onClick={() => handleStatusUpdate(report.id, "resolved")}
                                  className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-xs transition-colors"
                                >
                                  Resolve
                                </button>
                                <button
                                  onClick={() => handleStatusUpdate(report.id, "dismissed")}
                                  className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded text-xs transition-colors"
                                >
                                  Dismiss
                                </button>
                              </>
                            )}
                            {report.status === "reviewed" && (
                              <>
                                <button
                                  onClick={() => handleStatusUpdate(report.id, "resolved")}
                                  className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-xs transition-colors"
                                >
                                  Resolve
                                </button>
                                <button
                                  onClick={() => handleStatusUpdate(report.id, "dismissed")}
                                  className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded text-xs transition-colors"
                                >
                                  Dismiss
                                </button>
                              </>
                            )}
                          </div>
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
                  of <span className="font-medium">{pagination.total}</span> reports
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
