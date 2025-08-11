/**
 * Utility function to get the API URL with HTTPS enforcement
 * This ensures that all API calls use HTTPS to prevent mixed content errors
 */
export const getApiUrl = () => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://newback-production-a0cc.up.railway.app";
  // Ensure HTTPS is used
  if (apiUrl.startsWith('http://')) {
    return apiUrl.replace('http://', 'https://');
  }
  return apiUrl;
};

/**
 * Helper function to make authenticated API requests
 */
export const makeAuthenticatedRequest = async (endpoint, options = {}) => {
  const API_URL = getApiUrl();
  const token = sessionStorage.getItem("auth_token");
  
  const defaultOptions = {
    headers: {
      "Content-Type": "application/json",
      ...(token && { "Authorization": `Bearer ${token}` }),
      ...options.headers,
    },
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...defaultOptions,
    ...options,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
  }

  return response.json();
};
