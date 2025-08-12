/**
 * Override process.env.NEXT_PUBLIC_API_URL to ensure HTTPS
 */
if (typeof window !== 'undefined') {
  const originalEnv = process.env.NEXT_PUBLIC_API_URL;
  if (originalEnv && originalEnv.startsWith('http://')) {
    console.log('Environment variable contains HTTP, forcing HTTPS');
    Object.defineProperty(process.env, 'NEXT_PUBLIC_API_URL', {
      get: function() {
        return originalEnv.replace('http://', 'https://');
      },
      set: function(value) {
        if (value && value.startsWith('http://')) {
          value = value.replace('http://', 'https://');
        }
        originalEnv = value;
      }
    });
  }
}

/**
 * Utility function to get the API URL with HTTPS enforcement
 * This ensures that all API calls use HTTPS to prevent mixed content errors
 */
export const getApiUrl = () => {
  // Always use HTTPS for the production API
  const productionUrl = "https://newback-production-a0cc.up.railway.app";
  
  // Try to get the environment variable
  let apiUrl = process.env.NEXT_PUBLIC_API_URL;
  
  console.log('Environment API URL:', apiUrl);
  
  // If no environment variable is set, use the production URL
  if (!apiUrl) {
    apiUrl = productionUrl;
    console.log('Using production API URL:', apiUrl);
  }
  
  // Force HTTPS for production environment
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
    // In production, always use HTTPS
    if (apiUrl.startsWith('http://')) {
      apiUrl = apiUrl.replace('http://', 'https://');
      console.log('Production: Forced HTTPS:', apiUrl);
    }
    
    // If it's not HTTPS, use the production URL
    if (!apiUrl.startsWith('https://')) {
      apiUrl = productionUrl;
      console.log('Production: Using fallback HTTPS URL:', apiUrl);
    }
  } else {
    // In development, allow HTTP for localhost
    if (apiUrl.startsWith('http://')) {
      const httpsUrl = apiUrl.replace('http://', 'https://');
      console.log('Development: Converted HTTP to HTTPS:', httpsUrl);
      return httpsUrl;
    }
  }
  
  // Final validation - ensure HTTPS
  if (!apiUrl.startsWith('https://')) {
    apiUrl = `https://${apiUrl.replace(/^https?:\/\//, '')}`;
    console.log('Final HTTPS enforcement:', apiUrl);
  }
  
  console.log('Final API URL:', apiUrl);
  return apiUrl;
};

/**
 * Global fetch interceptor to ensure HTTPS
 */
const originalFetch = global.fetch || window.fetch;

if (typeof window !== 'undefined') {
  window.fetch = function(url, options) {
    let finalUrl = url;
    
    // Convert HTTP to HTTPS if needed
    if (typeof url === 'string' && url.startsWith('http://')) {
      finalUrl = url.replace('http://', 'https://');
      console.log('Global fetch interceptor: Converting HTTP to HTTPS:', finalUrl);
    }
    
    // Additional check for any URLs containing our API domain
    if (typeof url === 'string' && url.includes('newback-production-a0cc.up.railway.app')) {
      if (url.startsWith('http://')) {
        finalUrl = url.replace('http://', 'https://');
        console.log('Global fetch interceptor: Converting API HTTP to HTTPS:', finalUrl);
      }
    }
    
    return originalFetch(finalUrl, options);
  };
}

/**
 * Global URL interceptor to catch and fix HTTP URLs
 */
if (typeof window !== 'undefined') {
  // Intercept all fetch calls
  const originalFetch = window.fetch;
  window.fetch = function(url, options) {
    let finalUrl = url;
    
    if (typeof url === 'string') {
      // Convert any HTTP URLs to HTTPS
      if (url.startsWith('http://')) {
        finalUrl = url.replace('http://', 'https://');
        console.log('URL Interceptor: Converted HTTP to HTTPS:', finalUrl);
      }
      
      // Special handling for our API domain
      if (url.includes('newback-production-a0cc.up.railway.app')) {
        if (url.startsWith('http://')) {
          finalUrl = url.replace('http://', 'https://');
          console.log('API URL Interceptor: Converted HTTP to HTTPS:', finalUrl);
        }
      }
      
      // Special handling for checkout endpoint
      if (url.includes('/api/checkout')) {
        if (url.startsWith('http://')) {
          finalUrl = url.replace('http://', 'https://');
          console.log('Checkout URL Interceptor: Converted HTTP to HTTPS:', finalUrl);
        }
      }
    }
    
    return originalFetch(finalUrl, options);
  };
  
  // Intercept XMLHttpRequest
  const originalXHROpen = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function(method, url, ...args) {
    let finalUrl = url;
    
    if (typeof url === 'string') {
      if (url.startsWith('http://')) {
        finalUrl = url.replace('http://', 'https://');
        console.log('XHR Interceptor: Converted HTTP to HTTPS:', finalUrl);
      }
      
      // Special handling for checkout endpoint
      if (url.includes('/api/checkout')) {
        if (url.startsWith('http://')) {
          finalUrl = url.replace('http://', 'https://');
          console.log('XHR Checkout Interceptor: Converted HTTP to HTTPS:', finalUrl);
        }
      }
    }
    
    return originalXHROpen.call(this, method, finalUrl, ...args);
  };
}

/**
 * Helper function to make authenticated API requests
 */
export const makeAuthenticatedRequest = async (endpoint, options = {}) => {
  const API_URL = getApiUrl();
  const token = sessionStorage.getItem("auth_token");
  
  const fullUrl = `${API_URL}${endpoint}`;
  console.log('makeAuthenticatedRequest called with:', { endpoint, fullUrl, API_URL });
  
  // Final check to ensure HTTPS
  let finalUrl = fullUrl;
  if (fullUrl.startsWith('http://')) {
    finalUrl = fullUrl.replace('http://', 'https://');
    console.log('makeAuthenticatedRequest: Converting to HTTPS:', finalUrl);
  }
  
  // Additional validation
  try {
    const urlObj = new URL(finalUrl);
    if (urlObj.protocol !== 'https:') {
      finalUrl = finalUrl.replace('http://', 'https://');
      console.log('URL validation: Forced HTTPS:', finalUrl);
    }
  } catch (e) {
    console.error('URL validation error:', e);
  }
  
  const defaultOptions = {
    headers: {
      "Content-Type": "application/json",
      ...(token && { "Authorization": `Bearer ${token}` }),
      ...options.headers,
    },
  };

  console.log('Final checkout URL:', finalUrl);
  console.log('About to make fetch request to:', finalUrl);

  const response = await fetch(finalUrl, {
    ...defaultOptions,
    ...options,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
  }

  return response.json();
};

/**
 * Utility function to ensure any URL uses HTTPS
 */
export const ensureHttps = (url) => {
  if (!url) return url;
  if (url.startsWith('http://')) {
    return url.replace('http://', 'https://');
  }
  if (!url.startsWith('https://')) {
    return `https://${url.replace(/^https?:\/\//, '')}`;
  }
  return url;
};
