

"use client"

import { useState, useEffect, useCallback } from "react"
import { getSuccessStories, createSuccessStory, deleteSuccessStory } from "../../utils/api"
import AdminSidebar from "../../components/AdminSidebar"

const getPetImageUrl = (imageName) => {
  if (!imageName) return "https://via.placeholder.com/400x300?text=Pet+Love"
  return `http://localhost:8000/uploads/success_stories/${imageName}?t=${Date.now()}`
}

export default function SuccessStories() {
  const [stories, setStories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    cat_name: "",
    story: "",
  })
  const [files, setFiles] = useState([])
  const [filePreviews, setFilePreviews] = useState([])
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
  })

  const fetchStories = useCallback(async () => {
    try {
      setLoading(true)
      const data = await getSuccessStories(pagination.page, pagination.limit)
      setStories(data.data)
      setPagination((prev) => ({ ...prev, total: data.total }))
      setError(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [pagination.page, pagination.limit])

  useEffect(() => {
    fetchStories()
  }, [fetchStories])

  const handleChange = useCallback((e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (files.length === 0) {
      setError("Please select at least one image.")
      return
    }

    try {
      setLoading(true)
      const formDataToSend = new FormData()
      formDataToSend.append("name", formData.name)
      formDataToSend.append("cat_name", formData.cat_name)
      formDataToSend.append("story", formData.story)

      // Append each file
      files.forEach((file) => {
        formDataToSend.append("files", file)
      })

      await createSuccessStory(formDataToSend)
      await fetchStories()

      // Reset form
      setFormData({ name: "", cat_name: "", story: "" })
      setFiles([])
      setFilePreviews([])
      setShowCreateForm(false)
      setError(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (storyId) => {
    if (!confirm("Are you sure you want to delete this success story?")) return

    try {
      await deleteSuccessStory(storyId)
      fetchStories()
    } catch (err) {
      setError(err.message)
    }
  }

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files)

    if (selectedFiles.length === 0) return

    // Validate file types and sizes
    const validFiles = []
    const newPreviews = []

    for (const file of selectedFiles) {
      const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"]
      const maxSize = 5 * 1024 * 1024 // 5MB

      if (!validTypes.includes(file.type)) {
        setError(`Invalid file type: ${file.name}. Only images are allowed.`)
        continue
      }

      if (file.size > maxSize) {
        setError(`File too large: ${file.name}. Max size is 5MB.`)
        continue
      }

      validFiles.push(file)

      // Create preview URL
      const previewUrl = URL.createObjectURL(file)
      newPreviews.push({ name: file.name, url: previewUrl })
    }

    if (validFiles.length > 0) {
      setFiles([...files, ...validFiles])
      setFilePreviews([...filePreviews, ...newPreviews])
      setError(null)
    }
  }

  const removePreview = (index) => {
    const newFiles = [...files]
    const newPreviews = [...filePreviews]

    // Revoke the object URL to free memory
    if (newPreviews[index].url.startsWith("blob:")) {
      URL.revokeObjectURL(newPreviews[index].url)
    }

    newFiles.splice(index, 1)
    newPreviews.splice(index, 1)
    setFiles(newFiles)
    setFilePreviews(newPreviews)
  }

  const clearAllFiles = () => {
    filePreviews.forEach((preview) => {
      if (preview.url.startsWith("blob:")) {
        URL.revokeObjectURL(preview.url)
      }
    })
    setFiles([])
    setFilePreviews([])
  }

  // Clean up object URLs
  useEffect(() => {
    return () => {
      filePreviews.forEach((preview) => {
        if (preview.url.startsWith("blob:")) {
          URL.revokeObjectURL(preview.url)
        }
      })
    }
  }, [filePreviews])

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      <AdminSidebar />

      <div className="flex-1 ml-64 container mx-auto px-6 py-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
              Success Stories Management
            </h1>
            <p className="text-gray-600 text-lg">Manage adoption success stories and inspire others</p>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-4 rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold"
          >
            <svg className="w-5 h-5 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Add New Story
          </button>
        </div>

        {error && (
          <div className="max-w-4xl mx-auto mb-8 bg-red-50 border-l-4 border-red-400 p-4 rounded-r-lg shadow-sm">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3 flex-1">
                <p className="text-red-700 font-medium">{error}</p>
              </div>
              <button onClick={() => setError(null)} className="ml-3 text-red-400 hover:text-red-600 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Create Form Modal */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl border border-white/20">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-800 mb-2">Share a Success Story</h2>
                <p className="text-gray-600">Help inspire others by sharing this heartwarming adoption journey</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Owner Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white/70 backdrop-blur-sm"
                      placeholder="Enter the owner's name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Pet Name</label>
                    <input
                      type="text"
                      name="cat_name"
                      value={formData.cat_name}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white/70 backdrop-blur-sm"
                      placeholder="Enter the pet's name"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Success Story</label>
                  <textarea
                    name="story"
                    value={formData.story}
                    onChange={handleChange}
                    rows="6"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white/70 backdrop-blur-sm resize-none"
                    placeholder="Tell us about this wonderful adoption journey..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Upload Photos
                    <span className="text-xs text-gray-500 ml-2 font-normal">(Multiple images, max 5MB each)</span>
                  </label>

                  {/* Enhanced File Upload Area */}
                  <div className="relative">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      id="file-upload"
                    />
                    <label
                      htmlFor="file-upload"
                      className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-purple-300 rounded-xl cursor-pointer bg-gradient-to-br from-purple-50 to-blue-50 hover:from-purple-100 hover:to-blue-100 hover:border-purple-400 transition-all duration-300 group"
                    >
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <div className="w-16 h-16 mb-4 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                            />
                          </svg>
                        </div>
                        <p className="mb-2 text-lg text-gray-600 font-semibold">
                          <span className="text-purple-600">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-sm text-gray-500">PNG, JPG, GIF, WEBP up to 5MB each</p>
                        <p className="text-xs text-gray-400 mt-1">Select multiple images to tell the complete story</p>
                      </div>
                    </label>
                  </div>

                  {filePreviews.length > 0 && (
                    <div className="mt-8">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-lg font-semibold text-gray-700">Selected Images ({filePreviews.length})</h4>
                        <button
                          type="button"
                          onClick={clearAllFiles}
                          className="text-sm text-red-500 hover:text-red-700 font-medium transition-colors duration-200 px-3 py-1 rounded-lg hover:bg-red-50"
                        >
                          Clear All
                        </button>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {filePreviews.map((preview, index) => (
                          <div key={index} className="relative group">
                            <div className="aspect-square overflow-hidden rounded-xl border-2 border-gray-200 shadow-sm bg-white hover:shadow-lg transition-all duration-200">
                              <img
                                src={preview.url || "/placeholder.svg"}
                                alt={`Preview ${index + 1}`}
                                className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-300"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => removePreview(index)}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-red-600 shadow-lg hover:scale-110"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M6 18L18 6M6 6l12 12"
                                />
                              </svg>
                            </button>
                            <p className="text-xs text-gray-500 mt-2 truncate text-center font-medium">
                              {preview.name}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-4 pt-6">
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-8 py-4 rounded-xl transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:hover:shadow-lg"
                    disabled={files.length === 0 || loading}
                  >
                    {loading ? (
                      <div className="flex items-center justify-center">
                        <svg
                          className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Creating Story...
                      </div>
                    ) : (
                      "Create Success Story"
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateForm(false)
                      clearAllFiles()
                      setFormData({ name: "", cat_name: "", story: "" })
                      setError(null)
                    }}
                    className="flex-1 sm:flex-none bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white px-8 py-4 rounded-xl transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {loading && !showCreateForm ? (
          <div className="flex justify-center items-center h-64">
            <div className="flex items-center px-6 py-3 bg-white/80 backdrop-blur-sm rounded-full shadow-lg">
              <svg
                className="animate-spin -ml-1 mr-3 h-6 w-6 text-purple-600"
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
              <span className="text-gray-700 font-medium">Loading stories...</span>
            </div>
          </div>
        ) : (
          <>
            {/* Stories Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
              {stories.map((story) => (
                <div
                  key={story.id}
                  className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 group border border-white/20"
                >
                  {/* Images Grid */}
                  {story.image_filenames?.length > 0 && (
                    <div className="relative overflow-hidden">
                      <div
                        className={`grid gap-1 p-3 bg-gradient-to-br from-gray-50 to-gray-100 ${
                          story.image_filenames.length === 1
                            ? "grid-cols-1"
                            : story.image_filenames.length === 2
                              ? "grid-cols-2"
                              : story.image_filenames.length === 3
                                ? "grid-cols-2"
                                : "grid-cols-2"
                        }`}
                      >
                        {story.image_filenames.slice(0, 4).map((image, index) => (
                          <div
                            key={index}
                            className={`relative overflow-hidden rounded-lg ${
                              story.image_filenames.length === 3 && index === 0
                                ? "col-span-2"
                                : story.image_filenames.length > 4 && index === 3
                                  ? "relative"
                                  : ""
                            }`}
                            style={{ aspectRatio: story.image_filenames.length === 1 ? "16/10" : "1/1" }}
                          >
                            <img
                              src={getPetImageUrl(image) || "/placeholder.svg"}
                              alt={`${story.cat_name} ${index + 1}`}
                              className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500"
                            />
                            {story.image_filenames.length > 4 && index === 3 && (
                              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                <span className="text-white font-bold text-lg">
                                  +{story.image_filenames.length - 4}
                                </span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="p-6">
                    <div className="flex items-center mb-3">
                      <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full mr-3"></div>
                      <h3 className="text-xl font-bold text-gray-900">
                        {story.name} & {story.cat_name}
                      </h3>
                    </div>
                    <p className="text-gray-600 mb-6 line-clamp-3 leading-relaxed">{story.story}</p>

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500 font-medium bg-gray-100 px-3 py-1 rounded-full">
                        {new Date(story.created_at).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                      <button
                        onClick={() => handleDelete(story.id)}
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-105 opacity-0 group-hover:opacity-100"
                      >
                        <svg
                          className="w-4 h-4 inline-block mr-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination.total > 0 && (
              <div className="flex items-center justify-between bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-white/20">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">{(pagination.page - 1) * pagination.limit + 1}</span> to{" "}
                    <span className="font-medium">
                      {Math.min(pagination.page * pagination.limit, pagination.total)}
                    </span>{" "}
                    of <span className="font-medium">{pagination.total}</span> stories
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setPagination((prev) => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                    disabled={pagination.page === 1}
                    className="px-4 py-2 border rounded-lg disabled:opacity-50 bg-white hover:bg-gray-50 transition-colors shadow-sm disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
                    disabled={pagination.page * pagination.limit >= pagination.total}
                    className="px-4 py-2 border rounded-lg disabled:opacity-50 bg-white hover:bg-gray-50 transition-colors shadow-sm disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}

            {stories.length === 0 && !loading && (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-12 h-12 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">No Success Stories Yet</h3>
                <p className="text-gray-600 mb-6">Start sharing heartwarming adoption stories to inspire others!</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
