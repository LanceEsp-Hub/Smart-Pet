const getApiUrl = () => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://newback-production-a0cc.up.railway.app";
  // Ensure HTTPS is used
  if (apiUrl.startsWith('http://')) {
    return apiUrl.replace('http://', 'https://');
  }
  return apiUrl;
};

const API_URL = getApiUrl();

export const reportUser = async (reporterId, reportedUserId, reason, description = null) => {
  try {
    const token = sessionStorage.getItem("auth_token")
    if (!token) throw new Error("No authentication token found")

    const response = await fetch(`${API_URL}/api/security/report-user`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        reporter_id: Number.parseInt(reporterId),
        reported_user_id: Number.parseInt(reportedUserId),
        reason: reason,
        description: description,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.detail || "Failed to report user")
    }

    return await response.json()
  } catch (error) {
    console.error("Error reporting user:", error)
    throw error
  }
}

export const blockUser = async (blockerId, blockedUserId) => {
  try {
    const token = sessionStorage.getItem("auth_token")
    if (!token) throw new Error("No authentication token found")

    const response = await fetch(`${API_URL}/api/security/block-user`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        blocker_id: Number.parseInt(blockerId),
        blocked_user_id: Number.parseInt(blockedUserId),
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.detail || "Failed to block user")
    }

    return await response.json()
  } catch (error) {
    console.error("Error blocking user:", error)
    throw error
  }
}

export const unblockUser = async (blockerId, blockedUserId) => {
  try {
    const token = sessionStorage.getItem("auth_token")
    if (!token) throw new Error("No authentication token found")

    const response = await fetch(`${API_URL}/api/security/unblock-user`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        blocker_id: Number.parseInt(blockerId),
        blocked_user_id: Number.parseInt(blockedUserId),
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.detail || "Failed to unblock user")
    }

    return await response.json()
  } catch (error) {
    console.error("Error unblocking user:", error)
    throw error
  }
}

export const getBlockedUsers = async (userId) => {
  try {
    const token = sessionStorage.getItem("auth_token")
    if (!token) throw new Error("No authentication token found")

    const response = await fetch(`${API_URL}/api/security/blocked-users/${userId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.detail || "Failed to get blocked users")
    }

    return await response.json()
  } catch (error) {
    console.error("Error getting blocked users:", error)
    throw error
  }
}

export const checkBlockStatus = async (user1Id, user2Id) => {
  try {
    const token = sessionStorage.getItem("auth_token")
    if (!token) throw new Error("No authentication token found")

    const response = await fetch(`${API_URL}/api/security/check-block-status?user1_id=${user1Id}&user2_id=${user2Id}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.detail || "Failed to check block status")
    }

    return await response.json()
  } catch (error) {
    console.error("Error checking block status:", error)
    throw error
  }
}
