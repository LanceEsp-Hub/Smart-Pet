/**
 * Utility function to get the API URL with HTTPS enforcement
 * This ensures that all API calls use HTTPS to prevent mixed content errors
 */
export const getApiUrl = () => {
  // Try to get the environment variable
  let apiUrl = process.env.NEXT_PUBLIC_API_URL;
  
  // Debug logging
  console.log('Environment API URL:', apiUrl);
  
  // If no environment variable is set, use the fallback
  if (!apiUrl) {
    apiUrl = "https://newback-production-a0cc.up.railway.app";
    console.log('Using fallback API URL:', apiUrl);
  }
  
  // Ensure HTTPS is used - multiple checks for robustness
  if (apiUrl.startsWith('http://')) {
    const httpsUrl = apiUrl.replace('http://', 'https://');
    console.log('Converted HTTP to HTTPS:', httpsUrl);
    return httpsUrl;
  }
  
  // Double-check and force HTTPS if needed
  if (!apiUrl.startsWith('https://')) {
    const httpsUrl = apiUrl.replace(/^http:\/\//, 'https://');
    console.log('Forced HTTPS conversion:', httpsUrl);
    return httpsUrl;
  }
  
  // Final validation - if somehow we still don't have HTTPS, force it
  if (!apiUrl.includes('https://')) {
    const httpsUrl = `https://${apiUrl.replace(/^https?:\/\//, '')}`;
    console.log('Final HTTPS enforcement:', httpsUrl);
    return httpsUrl;
  }
  
  console.log('Final API URL:', apiUrl);
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
