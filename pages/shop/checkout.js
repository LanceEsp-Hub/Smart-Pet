import { useEffect, useState } from "react";
import { getApiUrl, makeAuthenticatedRequest } from "../../utils/apiUtils";
import toast from "react-hot-toast";

export default function CheckoutPage() {
  const userId = typeof window !== 'undefined' ? sessionStorage.getItem("user_id") : null;
  
  // Debug: Log the API URL on component mount
  useEffect(() => {
    const apiUrl = getApiUrl();
    console.log('Checkout page loaded with API URL:', apiUrl);
    console.log('Environment variable NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL);
  }, []);
  const [user, setUser] = useState(null);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [cart, setCart] = useState([]);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [newAddress, setNewAddress] = useState({
    street: "",
    barangay: "",
    city: "",
    state: "",
    zip_code: "",
    country: ""
  });
  const [addingAddress, setAddingAddress] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("Cash on Delivery");
  const [deliveryType, setDeliveryType] = useState("delivery");
  const [voucherCode, setVoucherCode] = useState("");
  const [appliedVoucher, setAppliedVoucher] = useState(null);
  const [voucherError, setVoucherError] = useState("");
  const [applyingVoucher, setApplyingVoucher] = useState(false);
  const [userVouchers, setUserVouchers] = useState([]);
  const [selectedVoucherId, setSelectedVoucherId] = useState("");
  const [loadingVouchers, setLoadingVouchers] = useState(false);
  const [deliveryFee, setDeliveryFee] = useState(50);
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(null);

  // Calculate item total
  const getItemTotal = (item) => {
    const price = item.product.discounted_price
      ? Number(item.product.discounted_price)
      : Number(item.product.price);
    return price * item.quantity;
  };

  // Calculate total price
  const subtotal = cart.reduce((sum, item) => sum + getItemTotal(item), 0);
  
  // Calculate voucher discount
  const voucherDiscount = appliedVoucher ? appliedVoucher.discount_amount : 0;
  const voucherShippingDiscount = appliedVoucher ? appliedVoucher.shipping_discount : 0;
  
  // Calculate delivery fee based on settings
  const calculatedDeliveryFee = (() => {
    if (deliveryType !== "delivery") return 0;
    
    // Check if order qualifies for free shipping
    if (freeShippingThreshold && subtotal >= freeShippingThreshold) {
      return 0; // Free shipping
    }
    
    return deliveryFee;
  })();
  
  // Calculate total price including delivery fee and voucher discounts
  const totalPrice = subtotal + calculatedDeliveryFee - voucherDiscount - voucherShippingDiscount;

  // Fetch user info
  useEffect(() => {
    if (!userId) return;
    const API_URL = getApiUrl();
    const token = sessionStorage.getItem("auth_token");
    fetch(`${API_URL}/api/user/${userId}`, {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data => setUser(data));
  }, [userId]);

  // Fetch addresses
  useEffect(() => {
    if (!userId) return;
    const API_URL = getApiUrl();
    const token = sessionStorage.getItem("auth_token");
    fetch(`${API_URL}/api/address/user/${userId}`, {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data => {
        console.log("Fetched addresses:", data);
        setAddresses(data);
        if (Array.isArray(data) && data.length > 0) setSelectedAddressId(data[0].id);
      });
  }, [userId]);

  // Fetch cart
  useEffect(() => {
    if (!userId) return;
    const API_URL = getApiUrl();
    const token = sessionStorage.getItem("auth_token");
    fetch(`${API_URL}/api/ecommerce/cart?user_id=${userId}`, {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data => setCart(data.items || []));
  }, [userId]);

  // Fetch user's vouchers
  useEffect(() => {
    if (!userId) return;
    
    const fetchUserVouchers = async () => {
      try {
        setLoadingVouchers(true);
        const API_URL = getApiUrl();
        const token = sessionStorage.getItem("auth_token");
        const response = await fetch(`${API_URL}/api/vouchers/user/${userId}`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        if (!response.ok) {
          throw new Error('Failed to fetch vouchers');
        }
        const data = await response.json();
        setUserVouchers(data);
      } catch (err) {
        console.error('Error fetching vouchers:', err);
      } finally {
        setLoadingVouchers(false);
      }
    };

    fetchUserVouchers();
  }, [userId]);

  // Fetch delivery settings
  useEffect(() => {
    const fetchDeliverySettings = async () => {
      try {
        const API_URL = getApiUrl();
        const response = await fetch(`${API_URL}/api/ecommerce/delivery-fee`);
        if (!response.ok) {
          throw new Error('Failed to fetch delivery settings');
        }
        const data = await response.json();
        setDeliveryFee(data.delivery_fee || 50);
        setFreeShippingThreshold(data.free_shipping_threshold);
      } catch (err) {
        console.error('Error fetching delivery settings:', err);
      }
    };

    fetchDeliverySettings();
  }, []);

  // Add new address handler
  const handleAddAddress = async (e) => {
    e.preventDefault();
    if (addresses.length >= 3) return;
    try {
      const API_URL = getApiUrl();
      const token = sessionStorage.getItem("auth_token");
      const res = await fetch(`${API_URL}/api/address/`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ ...newAddress, user_id: userId })
      });
      if (!res.ok) throw new Error("Failed to add address");
      const added = await res.json();
      setAddresses([...addresses, added]);
      setSelectedAddressId(added.id);
      setNewAddress({
        street: "",
        barangay: "",
        city: "",
        state: "",
        zip_code: "",
        country: ""
      });
      setAddingAddress(false);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const validateVoucher = async () => {
    if (!voucherCode.trim()) {
      setVoucherError("Please enter a voucher code");
      return;
    }

    try {
      setApplyingVoucher(true);
      setVoucherError("");
      
      const API_URL = getApiUrl();
      const token = sessionStorage.getItem("auth_token");
      const response = await fetch(`${API_URL}/api/vouchers/validate`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          code: voucherCode.trim(),
          user_id: userId,
          subtotal: subtotal,
          delivery_fee: deliveryFee
        })
      });

      const result = await response.json();
      
      if (result.is_valid) {
        setAppliedVoucher(result);
        setVoucherCode("");
        toast.success(`Voucher applied! ${result.message}`);
      } else {
        setVoucherError(result.message);
        setAppliedVoucher(null);
      }
    } catch (err) {
      setVoucherError("Failed to validate voucher. Please try again.");
      setAppliedVoucher(null);
    } finally {
      setApplyingVoucher(false);
    }
  };

  const removeVoucher = () => {
    setAppliedVoucher(null);
    setVoucherCode("");
    setVoucherError("");
    setSelectedVoucherId("");
  };

  const handleVoucherSelection = async () => {
    if (!selectedVoucherId) {
      setVoucherError("Please select a voucher");
      return;
    }

    try {
      setApplyingVoucher(true);
      setVoucherError("");
      
      // Find the selected voucher from userVouchers
      const selectedUserVoucher = userVouchers.find(uv => uv.id === parseInt(selectedVoucherId));
      if (!selectedUserVoucher) {
        setVoucherError("Selected voucher not found");
        return;
      }

      const voucher = selectedUserVoucher.voucher;
      
      // Validate the voucher
      const API_URL = getApiUrl();
      const token = sessionStorage.getItem("auth_token");
      const response = await fetch(`${API_URL}/api/vouchers/validate`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          code: voucher.code,
          user_id: userId,
          subtotal: subtotal,
          delivery_fee: deliveryFee
        })
      });

      const result = await response.json();
      
      if (result.is_valid) {
        setAppliedVoucher(result);
        setSelectedVoucherId("");
        toast.success(`Voucher applied! ${result.message}`);
      } else {
        setVoucherError(result.message);
        setAppliedVoucher(null);
      }
    } catch (err) {
      setVoucherError("Failed to apply voucher. Please try again.");
      setAppliedVoucher(null);
    } finally {
      setApplyingVoucher(false);
    }
  };

  const handlePlaceOrder = () => {
    // Validate form before showing modal
    if (deliveryType === "delivery" && (!selectedAddressId || addresses.length === 0)) {
      toast.error("Please select a shipping address for delivery orders.");
      return;
    }
    setShowModal(true);
  };

  const handleConfirmOrder = async () => {
    setPlacingOrder(true);
    try {
      const API_URL = getApiUrl();
      console.log('Checkout API URL:', API_URL);
      console.log('Full checkout endpoint:', `${API_URL}/api/checkout/`);
      
      // Validate that we're using HTTPS
      if (!API_URL.startsWith('https://')) {
        throw new Error('API URL must use HTTPS for security');
      }
      
      const token = sessionStorage.getItem("auth_token");
      console.log('About to make checkout request using makeAuthenticatedRequest');
      
      // Additional debugging to track the exact URL being used
      const finalUrl = `${API_URL}/api/checkout/`;
      console.log('Final checkout URL being used:', finalUrl);
      console.log('URL protocol:', new URL(finalUrl).protocol);
      
      // Prepare order data with proper data types
      const orderPayload = {
        user_id: parseInt(userId),
        address_id: parseInt(selectedAddressId),
        total_price: parseFloat(totalPrice),
        payment_method: paymentMethod,
        delivery_type: deliveryType,
        delivery_fee: parseFloat(calculatedDeliveryFee),
      };

      // Only include voucher_id if a voucher is applied
      if (appliedVoucher && appliedVoucher.voucher && appliedVoucher.voucher.id) {
        orderPayload.voucher_id = parseInt(appliedVoucher.voucher.id);
      }

      console.log('Order payload:', orderPayload);

      const orderData = await makeAuthenticatedRequest('/api/checkout/', {
        method: "POST",
        body: JSON.stringify(orderPayload),
      });
      console.log("Order created successfully:", orderData);
      setOrderSuccess(true);
      setCart([]);
      setShowModal(false);
    } catch (err) {
      console.error('Checkout error:', err);
      toast.error(err.message);
    } finally {
      setPlacingOrder(false);
    }
  };

  if (orderSuccess) {
    return (
      <div className="max-w-3xl mx-auto p-8">
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
          <strong className="font-bold">Success!</strong>
          <span className="block sm:inline"> Your order has been placed successfully. You will receive a confirmation email shortly.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Form */}
        <div className="space-y-6">
          {/* Delivery Type Selection */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Delivery Type</h2>
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="delivery"
                  value="delivery"
                  checked={deliveryType === "delivery"}
                  onChange={() => setDeliveryType("delivery")}
                  className="mr-3"
                />
                <span className="font-medium">Delivery</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="delivery"
                  value="pickup"
                  checked={deliveryType === "pickup"}
                  onChange={() => setDeliveryType("pickup")}
                  className="mr-3"
                />
                <span className="font-medium">Pickup</span>
              </label>
            </div>
          </div>

          {/* Shipping Address - Only for Delivery */}
          {deliveryType === "delivery" && (
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Shipping Address</h2>
              {addresses.length === 0 ? (
                <div className="text-red-500 mb-4">No addresses found. Please add an address for delivery.</div>
              ) : (
                <div className="space-y-3 mb-4">
                  {addresses.map(addr => (
                    <label key={addr.id} className="flex items-start">
                      <input
                        type="radio"
                        name="address"
                        value={addr.id}
                        checked={selectedAddressId === addr.id}
                        onChange={() => setSelectedAddressId(addr.id)}
                        className="mr-3 mt-1"
                      />
                      <div>
                        <div className="font-medium">{addr.street}</div>
                        <div className="text-gray-600">{addr.barangay}, {addr.city}, {addr.state} {addr.zip_code}</div>
                        <div className="text-gray-600">{addr.country}</div>
                      </div>
                    </label>
                  ))}
                </div>
              )}
              
              {/* Add New Address Button */}
              {addresses.length < 3 && !addingAddress && (
                <button
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  onClick={() => setAddingAddress(true)}
                  type="button"
                >
                  Add New Address
                </button>
              )}
              
              {/* Add Address Form */}
              {addingAddress && (
                <form className="mt-4 space-y-3" onSubmit={handleAddAddress}>
                  <input 
                    name="street" 
                    value={newAddress.street} 
                    onChange={e => setNewAddress({ ...newAddress, street: e.target.value })} 
                    placeholder="Street" 
                    className="p-2 border rounded w-full" 
                    required 
                  />
                  <input 
                    name="barangay" 
                    value={newAddress.barangay} 
                    onChange={e => setNewAddress({ ...newAddress, barangay: e.target.value })} 
                    placeholder="Barangay" 
                    className="p-2 border rounded w-full" 
                    required 
                  />
                  <input 
                    name="city" 
                    value={newAddress.city} 
                    onChange={e => setNewAddress({ ...newAddress, city: e.target.value })} 
                    placeholder="City" 
                    className="p-2 border rounded w-full" 
                    required 
                  />
                  <input 
                    name="state" 
                    value={newAddress.state} 
                    onChange={e => setNewAddress({ ...newAddress, state: e.target.value })} 
                    placeholder="State" 
                    className="p-2 border rounded w-full" 
                    required 
                  />
                  <input 
                    name="zip_code" 
                    value={newAddress.zip_code} 
                    onChange={e => setNewAddress({ ...newAddress, zip_code: e.target.value })} 
                    placeholder="Zip Code" 
                    className="p-2 border rounded w-full" 
                    required 
                  />
                  <input 
                    name="country" 
                    value={newAddress.country} 
                    onChange={e => setNewAddress({ ...newAddress, country: e.target.value })} 
                    placeholder="Country" 
                    className="p-2 border rounded w-full" 
                    required 
                  />
                  <div className="flex gap-2">
                    <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">Save Address</button>
                    <button type="button" className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500" onClick={() => setAddingAddress(false)}>Cancel</button>
                  </div>
                </form>
              )}
              
              {addresses.length >= 3 && (
                <div className="text-gray-500 mt-2">Maximum of 3 addresses allowed.</div>
              )}
            </div>
          )}

          {/* Payment Method */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Payment Method</h2>
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="payment"
                  value="Cash on Delivery"
                  checked={paymentMethod === "Cash on Delivery"}
                  onChange={() => setPaymentMethod("Cash on Delivery")}
                  className="mr-3"
                />
                <span className="font-medium">Cash on Delivery</span>
              </label>
              {/* Add more payment methods here if needed */}
            </div>
          </div>
        </div>

        {/* Right Column - Order Summary */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
            <div className="space-y-3">
              {cart.map(item => (
                <div key={item.cart_item_id} className="flex justify-between items-center">
                  <div>
                    <div className="font-medium">{item.product.name}</div>
                    <div className="text-gray-600">Qty: {item.quantity}</div>
                    {item.product.discounted_price && (
                      <div className="text-xs text-gray-500">
                        <span className="text-green-600 font-semibold">
                          ${item.product.discounted_price}
                        </span>
                        <span className="text-gray-400 line-through ml-2">
                          ${item.product.price}
                        </span>
                        <span className="text-red-600 ml-2">
                          {Math.round(((item.product.price - item.product.discounted_price) / item.product.price) * 100)}% OFF
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="font-medium">
                    {item.product.discounted_price ? (
                      <div className="text-right">
                        <div className="text-green-600">${getItemTotal(item).toFixed(2)}</div>
                        <div className="text-gray-400 line-through text-sm">
                          ${(item.product.price * item.quantity).toFixed(2)}
                        </div>
                      </div>
                    ) : (
                      <span>${getItemTotal(item).toFixed(2)}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {/* Voucher Section */}
            <div className="border-t pt-4 mt-4">
              <div className="mb-3">
                <h3 className="font-medium text-gray-900 mb-2">Have a voucher?</h3>
                
                {/* User's Vouchers Dropdown */}
                {userVouchers.length > 0 && (
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Your Vouchers:
                    </label>
                    <div className="flex space-x-2">
                      <select
                        value={selectedVoucherId}
                        onChange={(e) => setSelectedVoucherId(e.target.value)}
                        className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        disabled={applyingVoucher || loadingVouchers}
                      >
                        <option value="">Select a voucher...</option>
                        {userVouchers.map((userVoucher) => {
                          const voucher = userVoucher.voucher;
                          const now = new Date();
                          const startDate = new Date(voucher.start_date);
                          const endDate = new Date(voucher.end_date);
                          const isActive = now >= startDate && now <= endDate;
                          
                          return (
                            <option 
                              key={userVoucher.id} 
                              value={userVoucher.id}
                              disabled={!isActive}
                            >
                              {voucher.name} - {voucher.code} ({voucher.discount_type === 'percentage' ? `${voucher.discount_value}%` : `$${voucher.discount_value}`} OFF)
                              {!isActive && ' - Expired'}
                            </option>
                          );
                        })}
                      </select>
                      <button
                        type="button"
                        onClick={handleVoucherSelection}
                        disabled={applyingVoucher || !selectedVoucherId || loadingVouchers}
                        className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50"
                      >
                        {applyingVoucher ? "Applying..." : "Apply"}
                      </button>
                    </div>
                  </div>
                )}
                
                {/* Manual Voucher Code Entry */}
                <div className="mb-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Or enter voucher code manually:
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      placeholder="Enter voucher code"
                      value={voucherCode}
                      onChange={(e) => setVoucherCode(e.target.value)}
                      className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      disabled={applyingVoucher}
                    />
                    <button
                      type="button"
                      onClick={validateVoucher}
                      disabled={applyingVoucher || !voucherCode.trim()}
                      className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50"
                    >
                      {applyingVoucher ? "Applying..." : "Apply"}
                    </button>
                  </div>
                </div>
                
                {voucherError && (
                  <p className="text-red-600 text-sm mt-1">{voucherError}</p>
                )}
                
                {loadingVouchers && (
                  <p className="text-gray-600 text-sm mt-1">Loading your vouchers...</p>
                )}
              </div>
              
              {appliedVoucher && (
                <div className="bg-green-50 border border-green-200 rounded-md p-3 mb-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-green-800 font-medium">{appliedVoucher.voucher.name}</p>
                      <p className="text-green-600 text-sm">{appliedVoucher.voucher.description}</p>
                    </div>
                    <button
                      type="button"
                      onClick={removeVoucher}
                      className="text-green-600 hover:text-green-800"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="border-t pt-4 mt-4 space-y-2">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              {deliveryType === "delivery" && (
                <div className="flex justify-between">
                  <span>Delivery Fee:</span>
                  <span>${calculatedDeliveryFee.toFixed(2)}</span>
                </div>
              )}
              {appliedVoucher && appliedVoucher.discount_amount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount:</span>
                  <span>-${appliedVoucher.discount_amount.toFixed(2)}</span>
                </div>
              )}
              {appliedVoucher && appliedVoucher.shipping_discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Shipping Discount:</span>
                  <span>-${appliedVoucher.shipping_discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-xl font-bold border-t pt-2">
                <span>Total:</span>
                <span>${totalPrice.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Place Order Button */}
          <button
            className="w-full bg-purple-700 text-white px-8 py-4 rounded-lg hover:bg-purple-800 transition font-semibold text-lg disabled:opacity-50"
            disabled={placingOrder || (deliveryType === "delivery" && (!selectedAddressId || addresses.length === 0))}
            onClick={handlePlaceOrder}
          >
            {placingOrder ? "Processing..." : "Review & Place Order"}
          </button>
        </div>
      </div>

      {/* Review Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6">Review Your Order</h2>
            
            {/* Customer Information */}
            <div className="mb-6">
              <h3 className="font-semibold text-lg mb-2">Customer Information</h3>
              <div className="space-y-1">
                <div><span className="font-medium">Name:</span> {user?.name}</div>
                <div><span className="font-medium">Email:</span> {user?.email}</div>
              </div>
            </div>

            {/* Delivery Information */}
            <div className="mb-6">
              <h3 className="font-semibold text-lg mb-2">Delivery Information</h3>
              <div className="space-y-1">
                <div><span className="font-medium">Type:</span> {deliveryType === "delivery" ? "Delivery" : "Pickup"}</div>
                {deliveryType === "delivery" && selectedAddressId && (
                  <div>
                    <span className="font-medium">Address:</span>
                    {(() => {
                      const selectedAddr = addresses.find(addr => addr.id === selectedAddressId);
                      return selectedAddr ? (
                        <div className="mt-1 text-gray-600">
                          {selectedAddr.street}, {selectedAddr.barangay}, {selectedAddr.city}, {selectedAddr.state} {selectedAddr.zip_code}, {selectedAddr.country}
                        </div>
                      ) : null;
                    })()}
                  </div>
                )}
              </div>
            </div>

            {/* Payment Information */}
            <div className="mb-6">
              <h3 className="font-semibold text-lg mb-2">Payment Information</h3>
              <div><span className="font-medium">Method:</span> {paymentMethod}</div>
            </div>

            {/* Order Items */}
            <div className="mb-6">
              <h3 className="font-semibold text-lg mb-2">Order Items</h3>
              <div className="space-y-2">
                {cart.map(item => (
                  <div key={item.cart_item_id} className="flex justify-between">
                    <div>
                      <span>{item.product.name} x {item.quantity}</span>
                      {item.product.discounted_price && (
                        <div className="text-xs text-gray-500 mt-1">
                          <span className="text-green-600">
                            ${item.product.discounted_price}
                          </span>
                          <span className="text-gray-400 line-through ml-2">
                            ${item.product.price}
                          </span>
                          <span className="text-red-600 ml-2">
                            {Math.round(((item.product.price - item.product.discounted_price) / item.product.price) * 100)}% OFF
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      {item.product.discounted_price ? (
                        <div>
                          <div className="text-green-600 font-semibold">
                            ${getItemTotal(item).toFixed(2)}
                          </div>
                          <div className="text-gray-400 line-through text-sm">
                            ${(item.product.price * item.quantity).toFixed(2)}
                          </div>
                        </div>
                      ) : (
                        <span>${getItemTotal(item).toFixed(2)}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Voucher Information */}
            {appliedVoucher && (
              <div className="mb-6">
                <h3 className="font-semibold text-lg mb-2">Applied Voucher</h3>
                <div className="bg-green-50 border border-green-200 rounded-md p-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-green-800 font-medium">{appliedVoucher.voucher.name}</p>
                      <p className="text-green-600 text-sm">{appliedVoucher.voucher.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-green-800 font-medium">
                        {appliedVoucher.voucher.discount_type === 'percentage' 
                          ? `${appliedVoucher.voucher.discount_value}% OFF`
                          : `$${appliedVoucher.voucher.discount_value} OFF`
                        }
                      </p>
                      {appliedVoucher.voucher.free_shipping && (
                        <p className="text-green-600 text-sm">Free Shipping</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Order Summary */}
            <div className="mb-6 border-t pt-4 space-y-2">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              {deliveryType === "delivery" && (
                <div className="flex justify-between">
                  <span>Delivery Fee:</span>
                  <span>${calculatedDeliveryFee.toFixed(2)}</span>
                </div>
              )}
              {appliedVoucher && appliedVoucher.discount_amount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount:</span>
                  <span>-${appliedVoucher.discount_amount.toFixed(2)}</span>
                </div>
              )}
              {appliedVoucher && appliedVoucher.shipping_discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Shipping Discount:</span>
                  <span>-${appliedVoucher.shipping_discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-xl font-bold border-t pt-2">
                <span>Total:</span>
                <span>${totalPrice.toFixed(2)}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3">
              <button
                className="px-6 py-2 rounded bg-gray-300 hover:bg-gray-400 transition"
                onClick={() => setShowModal(false)}
                disabled={placingOrder}
              >
                Back to Edit
              </button>
              <button
                className="px-6 py-2 rounded bg-purple-700 text-white hover:bg-purple-800 transition"
                onClick={handleConfirmOrder}
                disabled={placingOrder}
              >
                {placingOrder ? "Placing Order..." : "Confirm Order"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
