import { useEffect, useState } from "react";
import { getApiUrl, makeAuthenticatedRequest } from "../utils/apiUtils";

export default function DebugCheckoutPage() {
  const [debugInfo, setDebugInfo] = useState({});
  const [testResults, setTestResults] = useState([]);

  useEffect(() => {
    const runCheckoutTests = async () => {
      const results = [];
      
      // Test 1: Check environment variable
      const envUrl = process.env.NEXT_PUBLIC_API_URL;
      results.push({
        test: 'Environment Variable',
        result: envUrl,
        success: !envUrl || envUrl.startsWith('https://'),
        error: null
      });

      // Test 2: Check getApiUrl function
      const apiUrl = getApiUrl();
      results.push({
        test: 'getApiUrl() Function',
        result: apiUrl,
        success: apiUrl.startsWith('https://'),
        error: null
      });

      // Test 3: Test direct URL construction
      const directUrl = `${process.env.NEXT_PUBLIC_API_URL || "https://newback-production-a0cc.up.railway.app"}/api/checkout`;
      results.push({
        test: 'Direct URL Construction',
        result: directUrl,
        success: directUrl.startsWith('https://'),
        error: null
      });

      // Test 4: Test makeAuthenticatedRequest
      try {
        console.log('Testing makeAuthenticatedRequest...');
        // This should fail but show us the URL being used
        await makeAuthenticatedRequest('/api/checkout', {
          method: 'POST',
          body: JSON.stringify({ test: true })
        });
        results.push({
          test: 'makeAuthenticatedRequest',
          result: 'Request made successfully',
          success: true,
          error: null
        });
      } catch (error) {
        results.push({
          test: 'makeAuthenticatedRequest',
          result: 'Request failed (expected)',
          success: true, // We expect this to fail
          error: error.message
        });
      }

      setTestResults(results);
    };

    runCheckoutTests();
  }, []);

  const testDirectFetch = async () => {
    try {
      // Test the exact URL that's causing the issue
      const testUrl = 'http://newback-production-a0cc.up.railway.app/api/checkout/';
      console.log('Testing direct fetch with HTTP URL:', testUrl);
      
      const response = await fetch(testUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ test: true })
      });
      
      console.log('Direct fetch response:', response);
      alert('Direct fetch test completed! Check console for details.');
    } catch (error) {
      console.error('Direct fetch test error:', error);
      alert(`Direct fetch test failed: ${error.message}`);
    }
  };

  const testHttpsFetch = async () => {
    try {
      // Test with HTTPS URL
      const testUrl = 'https://newback-production-a0cc.up.railway.app/api/checkout/';
      console.log('Testing direct fetch with HTTPS URL:', testUrl);
      
      const response = await fetch(testUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ test: true })
      });
      
      console.log('HTTPS fetch response:', response);
      alert('HTTPS fetch test completed! Check console for details.');
    } catch (error) {
      console.error('HTTPS fetch test error:', error);
      alert(`HTTPS fetch test failed: ${error.message}`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Checkout Debug Information</h1>
      
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-xl font-semibold mb-4">Checkout Tests</h2>
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
        <h2 className="text-xl font-semibold mb-4">Manual Tests</h2>
        <div className="space-y-4">
          <button
            onClick={testDirectFetch}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 mr-4"
          >
            Test HTTP URL (Should be intercepted)
          </button>
          <button
            onClick={testHttpsFetch}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Test HTTPS URL
          </button>
        </div>
        <p className="text-sm text-gray-600 mt-2">
          These tests will help identify if our interceptors are working correctly.
        </p>
      </div>

      <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
        <strong>Note:</strong> Check the browser console for detailed logging of URL conversions and any errors.
      </div>
    </div>
  );
}
