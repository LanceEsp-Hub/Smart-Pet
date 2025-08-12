import { useEffect, useState } from "react";
import { getApiUrl, ensureHttps } from "../utils/apiUtils";

export default function DebugApiPage() {
  const [debugInfo, setDebugInfo] = useState({});

  useEffect(() => {
    const info = {
      envVar: process.env.NEXT_PUBLIC_API_URL,
      getApiUrlResult: getApiUrl(),
      ensureHttpsResult: ensureHttps(process.env.NEXT_PUBLIC_API_URL),
      windowLocation: typeof window !== 'undefined' ? window.location.href : 'N/A',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'N/A'
    };
    
    console.log('Debug API Info:', info);
    setDebugInfo(info);
  }, []);

  const testApiCall = async () => {
    try {
      const API_URL = getApiUrl();
      console.log('Testing API call with URL:', API_URL);
      
      const response = await fetch(`${API_URL}/api/health`);
      const data = await response.json();
      console.log('API test response:', data);
      alert('API test successful! Check console for details.');
    } catch (error) {
      console.error('API test failed:', error);
      alert(`API test failed: ${error.message}`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">API Debug Information</h1>
      
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-xl font-semibold mb-4">Environment Variables</h2>
        <div className="space-y-2">
          <div><strong>NEXT_PUBLIC_API_URL:</strong> {debugInfo.envVar || 'Not set'}</div>
          <div><strong>getApiUrl() result:</strong> {debugInfo.getApiUrlResult || 'Not available'}</div>
          <div><strong>ensureHttps() result:</strong> {debugInfo.ensureHttpsResult || 'Not available'}</div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-xl font-semibold mb-4">Browser Information</h2>
        <div className="space-y-2">
          <div><strong>Current URL:</strong> {debugInfo.windowLocation}</div>
          <div><strong>User Agent:</strong> {debugInfo.userAgent}</div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-xl font-semibold mb-4">Test API Connection</h2>
        <button
          onClick={testApiCall}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Test API Connection
        </button>
      </div>

      <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
        <strong>Note:</strong> Check the browser console for detailed debugging information.
      </div>
    </div>
  );
}
