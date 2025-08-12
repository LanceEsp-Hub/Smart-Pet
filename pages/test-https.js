import { useEffect, useState } from "react";
import { getApiUrl } from "../utils/apiUtils";

export default function TestHttpsPage() {
  const [testResults, setTestResults] = useState([]);

  useEffect(() => {
    const runTests = async () => {
      const results = [];
      
      // Test 1: Check getApiUrl function
      try {
        const apiUrl = getApiUrl();
        results.push({
          test: 'getApiUrl() function',
          result: apiUrl,
          success: apiUrl.startsWith('https://'),
          error: null
        });
      } catch (error) {
        results.push({
          test: 'getApiUrl() function',
          result: null,
          success: false,
          error: error.message
        });
      }

      // Test 2: Test fetch interceptor with HTTP URL
      try {
        const testUrl = 'http://newback-production-a0cc.up.railway.app/api/test';
        console.log('Testing fetch interceptor with:', testUrl);
        
        // This should be intercepted and converted to HTTPS
        const response = await fetch(testUrl);
        results.push({
          test: 'Fetch interceptor with HTTP URL',
          result: 'Request made (should be converted to HTTPS)',
          success: true,
          error: null
        });
      } catch (error) {
        results.push({
          test: 'Fetch interceptor with HTTP URL',
          result: null,
          success: false,
          error: error.message
        });
      }

      // Test 3: Test direct environment variable
      try {
        const envUrl = process.env.NEXT_PUBLIC_API_URL;
        results.push({
          test: 'Environment variable directly',
          result: envUrl,
          success: !envUrl || envUrl.startsWith('https://'),
          error: null
        });
      } catch (error) {
        results.push({
          test: 'Environment variable directly',
          result: null,
          success: false,
          error: error.message
        });
      }

      // Test 4: Test URL construction
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || "https://newback-production-a0cc.up.railway.app";
        const testEndpoint = `${baseUrl}/api/checkout`;
        results.push({
          test: 'URL construction',
          result: testEndpoint,
          success: testEndpoint.startsWith('https://'),
          error: null
        });
      } catch (error) {
        results.push({
          test: 'URL construction',
          result: null,
          success: false,
          error: error.message
        });
      }

      setTestResults(results);
    };

    runTests();
  }, []);

  const runManualTest = async () => {
    try {
      // Test the exact URL that's causing the issue
      const testUrl = 'http://newback-production-a0cc.up.railway.app/api/checkout/';
      console.log('Manual test: Attempting to fetch:', testUrl);
      
      const response = await fetch(testUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ test: true })
      });
      
      alert('Manual test completed! Check console for details.');
    } catch (error) {
      console.error('Manual test error:', error);
      alert(`Manual test failed: ${error.message}`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">HTTPS Enforcement Test</h1>
      
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-xl font-semibold mb-4">Test Results</h2>
        <div className="space-y-4">
          {testResults.map((result, index) => (
            <div key={index} className={`p-4 rounded border ${result.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
              <div className="font-semibold">{result.test}</div>
              <div className="text-sm text-gray-600 mt-1">
                <strong>Result:</strong> {result.result || 'N/A'}
              </div>
              {result.error && (
                <div className="text-sm text-red-600 mt-1">
                  <strong>Error:</strong> {result.error}
                </div>
              )}
              <div className={`text-sm mt-1 ${result.success ? 'text-green-600' : 'text-red-600'}`}>
                <strong>Status:</strong> {result.success ? 'PASS' : 'FAIL'}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-xl font-semibold mb-4">Manual Test</h2>
        <button
          onClick={runManualTest}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Test HTTP to HTTPS Conversion
        </button>
        <p className="text-sm text-gray-600 mt-2">
          This will attempt to make a request to an HTTP URL to test if our interceptor converts it to HTTPS.
        </p>
      </div>

      <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
        <strong>Note:</strong> Check the browser console for detailed logging of URL conversions.
      </div>
    </div>
  );
}
