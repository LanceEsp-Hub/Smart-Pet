// pages/_app.js
import { Toaster } from "react-hot-toast";
import "../styles/globals.css"; // Adjust the path to your global styles
import { useEffect } from 'react'

// HTTPS enforcement script that runs immediately
if (typeof window !== 'undefined') {
  // Force HTTPS for all API URLs
  const forceHttps = () => {
    // Override fetch
    const originalFetch = window.fetch;
    window.fetch = function(url, options) {
      let finalUrl = url;
      
      if (typeof url === 'string') {
        if (url.startsWith('http://')) {
          finalUrl = url.replace('http://', 'https://');
          console.log('_app.js: Converted HTTP to HTTPS:', finalUrl);
        }
        
        // Special handling for our API domain
        if (url.includes('newback-production-a0cc.up.railway.app')) {
          if (url.startsWith('http://')) {
            finalUrl = url.replace('http://', 'https://');
            console.log('_app.js: API URL converted to HTTPS:', finalUrl);
          }
        }
      }
      
      return originalFetch(finalUrl, options);
    };

    // Override XMLHttpRequest
    const originalXHROpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function(method, url, ...args) {
      let finalUrl = url;
      
      if (typeof url === 'string') {
        if (url.startsWith('http://')) {
          finalUrl = url.replace('http://', 'https://');
          console.log('_app.js: XHR converted HTTP to HTTPS:', finalUrl);
        }
      }
      
      return originalXHROpen.call(this, method, finalUrl, ...args);
    };

    console.log('_app.js: HTTPS enforcement initialized');
  };

  // Run immediately
  forceHttps();
}

export default function App({ Component, pageProps }) {
  useEffect(() => {
    // Additional HTTPS enforcement on component mount
    if (typeof window !== 'undefined') {
      console.log('_app.js: Component mounted, ensuring HTTPS enforcement');
      
      // Double-check that our interceptors are working
      const testUrl = 'http://newback-production-a0cc.up.railway.app/api/test';
      console.log('_app.js: Testing URL conversion with:', testUrl);
      
      // This should be intercepted and logged
      fetch(testUrl).catch(() => {
        // Expected to fail, but should be converted to HTTPS first
        console.log('_app.js: Test fetch completed (expected to fail)');
      });
    }
  }, []);

  return (
        <>
            <Toaster
                position="top-center" // Position of the toasts
                reverseOrder={false} // New toasts appear at the bottom
                toastOptions={{
                    duration: 3000, // Duration of the toast (3 seconds)
                    style: {
                        background: "#363636",
                        color: "#fff",
                    },
                }}
            />
            <Component {...pageProps} />
        </>
    );
}
