import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { getApiUrl } from "../../utils/apiUtils";
import CryptoJS from "crypto-js";

const SECRET_KEY = "asdasdasd";

const encryptData = (data) => {
  return CryptoJS.AES.encrypt(JSON.stringify(data), SECRET_KEY).toString();
};

const decryptData = (encryptedData) => {
  const bytes = CryptoJS.AES.decrypt(encryptedData, SECRET_KEY);
  return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
};

export default function DeliverySettingsPage() {
  const router = useRouter();
  const [settings, setSettings] = useState({
    delivery_fee: 50.00,
    free_shipping_threshold: null,
    is_active: true
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const authenticate = () => {
      try {
        const storedToken = sessionStorage.getItem("auth_token");
        const storedUserData = sessionStorage.getItem("user");
        const storedUserId = sessionStorage.getItem("user_id");
        const encryptedRoles = sessionStorage.getItem("roles");

        if (!storedToken || !storedUserData || !storedUserId) {
          throw new Error("Missing authentication data");
        }

        const storedRoles = decryptData(encryptedRoles);
        if (storedRoles === "admin") {
          setIsAuthenticated(true);
          fetchSettings();
        } else {
          throw new Error("Access denied. Admin privileges required.");
        }
      } catch (error) {
        console.error("Authentication error:", error);
        router.push("/login");
      } finally {
        setIsLoading(false);
      }
    };

    authenticate();
  }, [router]);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const API_URL = getApiUrl();
      const response = await fetch(`${API_URL}/api/ecommerce/admin/delivery-settings`);
      if (!response.ok) {
        throw new Error("Failed to fetch delivery settings");
      }
      const data = await response.json();
      setSettings({
        delivery_fee: data.delivery_fee || 50.00,
        free_shipping_threshold: data.free_shipping_threshold || null,
        is_active: data.is_active !== false
      });
    } catch (error) {
      console.error("Error fetching settings:", error);
      setMessage("Error loading delivery settings");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      const API_URL = getApiUrl();
      const response = await fetch(`${API_URL}/api/ecommerce/admin/delivery-settings`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          delivery_fee: parseFloat(settings.delivery_fee),
          free_shipping_threshold: settings.free_shipping_threshold ? parseFloat(settings.free_shipping_threshold) : null,
          is_active: settings.is_active
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to update delivery settings");
      }

      setMessage("Delivery settings updated successfully!");
    } catch (error) {
      console.error("Error updating settings:", error);
      setMessage(`Error: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-700 mx-auto"></div>
            <p className="mt-4 text-gray-600">Authenticating...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-700 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading delivery settings...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Delivery Settings</h1>
          <p className="mt-2 text-gray-600">Manage delivery fees and shipping thresholds</p>
        </div>

        {/* Settings Form */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Update Delivery Settings</h2>
          </div>
          <div className="px-6 py-4">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Delivery Fee */}
              <div>
                <label htmlFor="delivery_fee" className="block text-sm font-medium text-gray-700 mb-2">
                  Delivery Fee ($)
                </label>
                <input
                  type="number"
                  id="delivery_fee"
                  name="delivery_fee"
                  step="0.01"
                  min="0"
                  value={settings.delivery_fee}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
                <p className="mt-1 text-sm text-gray-500">
                  Standard delivery fee applied to all delivery orders
                </p>
              </div>

              {/* Free Shipping Threshold */}
              <div>
                <label htmlFor="free_shipping_threshold" className="block text-sm font-medium text-gray-700 mb-2">
                  Free Shipping Threshold ($)
                </label>
                <input
                  type="number"
                  id="free_shipping_threshold"
                  name="free_shipping_threshold"
                  step="0.01"
                  min="0"
                  value={settings.free_shipping_threshold || ""}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Leave empty to disable"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Orders above this amount get free shipping (optional)
                </p>
              </div>

              {/* Active Status */}
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="is_active"
                  name="is_active"
                  checked={settings.is_active}
                  onChange={handleChange}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
                <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
                  Enable these delivery settings
                </label>
              </div>

              {/* Message */}
              {message && (
                <div className={`p-4 rounded-md ${
                  message.includes("Error") 
                    ? "bg-red-100 border border-red-400 text-red-700" 
                    : "bg-green-100 border border-green-400 text-green-700"
                }`}>
                  {message}
                </div>
              )}

              {/* Submit Button */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2 bg-purple-700 text-white rounded-md hover:bg-purple-800 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? "Saving..." : "Save Settings"}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Information Section */}
        <div className="mt-8 bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">How It Works</h2>
          </div>
          <div className="px-6 py-4">
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-900">Delivery Fee</h3>
                <p className="text-sm text-gray-600 mt-1">
                  This fee is automatically applied to all delivery orders. The fee is added to the order total before any voucher discounts are applied.
                </p>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-900">Free Shipping Threshold</h3>
                <p className="text-sm text-gray-600 mt-1">
                  If set, orders with a subtotal above this amount will automatically get free shipping. This applies before voucher discounts.
                </p>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-900">Voucher Integration</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Vouchers with "Free Shipping" will override these settings and provide free shipping regardless of order amount.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Back Button */}
        <div className="mt-8 text-center">
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            Back to Admin
          </button>
        </div>
      </div>
    </div>
  );
} 
