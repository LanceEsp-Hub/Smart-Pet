import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import { getProductImageUrl } from "../../utils/supabase";
import toast from "react-hot-toast";

export default function CartPage() {
  const router = useRouter();
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const userId = typeof window !== 'undefined' ? sessionStorage.getItem("user_id") : null;
  const cartOrderRef = useRef([]); // Store the original order of cart_item_ids

  // Fetch cart on mount
  useEffect(() => {
    const fetchCart = async () => {
      if (!userId) {
        setError("You must be logged in to view your cart.");
        setLoading(false);
        return;
      }
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://newback-production-a0cc.up.railway.app";
    const res = await fetch(`${API_URL}/api/ecommerce/cart?user_id=${userId}`);
        if (!res.ok) throw new Error("Failed to fetch cart");
        const data = await res.json();
        setCart(data.items || []);
        // Store the original order on first fetch
        if (cartOrderRef.current.length === 0 && data.items) {
          cartOrderRef.current = data.items.map(item => item.cart_item_id);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchCart();
  }, [userId]);

  // Update quantity in cart
  const updateQuantity = async (cartItemId, newQuantity) => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://newback-production-a0cc.up.railway.app";
      const token = sessionStorage.getItem("auth_token");
      const res = await fetch(`${API_URL}/api/ecommerce/cart/items/${cartItemId}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ quantity: newQuantity })
      });
      if (!res.ok) throw new Error("Failed to update quantity");
      // Refresh cart
      const cartRes = await fetch(`${API_URL}/api/ecommerce/cart?user_id=${userId}`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (cartRes.ok) {
        const data = await cartRes.json();
        setCart(data.items || []);
        // Do not update cartOrderRef so order stays as first fetch
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  // Delete item from cart
  const deleteItem = async (cartItemId) => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://newback-production-a0cc.up.railway.app";
      const token = sessionStorage.getItem("auth_token");
      const res = await fetch(`${API_URL}/api/ecommerce/cart/items/${cartItemId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error("Failed to delete item");
      setCart(prev => prev.filter(item => item.cart_item_id !== cartItemId));
      cartOrderRef.current = cartOrderRef.current.filter(id => id !== cartItemId);
    } catch (err) {
      toast.error(err.message);
    }
  };

  // Calculate total price
  const totalPrice = cart.reduce(
    (sum, item) =>
      sum +
      (item.product.discounted_price
        ? Number(item.product.discounted_price)
        : Number(item.product.price)) *
        item.quantity,
    0
  );

  // Helper to get per-item total
  const getItemTotal = (item) => {
    const price = item.product.discounted_price
      ? Number(item.product.discounted_price)
      : Number(item.product.price);
    return price * item.quantity;
  };

  if (loading) return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  if (error) return <div className="flex justify-center items-center min-h-screen text-red-500">{error}</div>;

  return (
    <div className="max-w-3xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">My Cart</h1>
      {cart.length === 0 ? (
        <div className="text-gray-500 text-xl text-center">Your cart is empty.</div>
      ) : (
        <>
          <div className="space-y-6">
            {cartOrderRef.current
              .map(id => cart.find(item => item.cart_item_id === id))
              .filter(Boolean)
              .map(item => (
                <div key={item.cart_item_id} className="flex items-center bg-white p-4 rounded shadow">
                  <img
                    src={getProductImageUrl(item.product.image_url)}
                    alt={item.product.name}
                    className="w-24 h-24 object-cover rounded mr-4"
                  />
                  <div className="flex-1">
                    <h2 className="text-xl font-semibold">{item.product.name}</h2>
                    <div className="text-gray-600">
                      {item.product.discounted_price ? (
                        <div className="flex items-center space-x-2">
                          <span className="text-green-600 font-semibold">
                            ${item.product.discounted_price}
                          </span>
                          <span className="text-gray-400 line-through">
                            ${item.product.price}
                          </span>
                          <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
                            {Math.round(((item.product.price - item.product.discounted_price) / item.product.price) * 100)}% OFF
                          </span>
                        </div>
                      ) : (
                        <span>${item.product.price}</span>
                      )}
                    </div>
                    <div className="flex items-center mt-2">
                      <button
                        onClick={() => updateQuantity(item.cart_item_id, Math.max(1, item.quantity - 1))}
                        disabled={item.quantity <= 1}
                        className="px-2 py-1 bg-gray-200 rounded-l disabled:opacity-50"
                      >-</button>
                      <input
                        type="number"
                        min={1}
                        max={item.product.stock_quantity}
                        value={item.quantity}
                        onChange={e => {
                          let val = Math.max(1, Math.min(item.product.stock_quantity, Number(e.target.value)));
                          updateQuantity(item.cart_item_id, val);
                        }}
                        className="w-12 text-center border-t border-b"
                      />
                      <button
                        onClick={() => updateQuantity(item.cart_item_id, Math.min(item.product.stock_quantity, item.quantity + 1))}
                        disabled={item.quantity >= item.product.stock_quantity}
                        className="px-2 py-1 bg-gray-200 rounded-r disabled:opacity-50"
                      >+</button>
                      <span className="ml-2 text-xs text-gray-500">(Stock: {item.product.stock_quantity})</span>
                    </div>
                    {/* Per-item total price */}
                    <div className="mt-2 text-sm font-semibold">
                      {item.product.discounted_price ? (
                        <div className="flex items-center space-x-2">
                          <span className="text-green-600">
                            Item Total: ${getItemTotal(item).toFixed(2)}
                          </span>
                          <span className="text-gray-400 line-through text-xs">
                            ${(item.product.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-gray-700">
                          Item Total: ${getItemTotal(item).toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => deleteItem(item.cart_item_id)}
                    className="ml-4 px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                  >Delete</button>
                </div>
              ))}
          </div>
          <div className="flex justify-end mt-6">
            <div className="text-xl font-bold">
              Total: ${totalPrice.toFixed(2)}
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <button
              className="bg-purple-700 text-white px-8 py-3 rounded-full hover:bg-purple-800 transition font-semibold disabled:opacity-50"
              disabled={cart.length === 0}
              onClick={() => router.push('/shop/checkout')}
            >
              Checkout
            </button>
          </div>
        </>
      )}
    </div>
  );
}
