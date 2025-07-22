// utils/auth.js
import CryptoJS from "crypto-js";

const SECRET_KEY = "asdasdasd"; // Should ideally come from environment variables

export const encryptData = (data) => {
  return CryptoJS.AES.encrypt(JSON.stringify(data), SECRET_KEY).toString();
};

export const decryptData = (encryptedData) => {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedData, SECRET_KEY);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    return JSON.parse(decrypted);
  } catch (error) {
    console.error("Decryption error:", error);
    return null;
  }
};

// Helper function to get decrypted user ID
export const getDecryptedUserId = () => {
  if (typeof window === 'undefined') return null; // For server-side rendering
  
  const encryptedId = sessionStorage.getItem("user_id");
  if (!encryptedId) return null;
  
  return decryptData(encryptedId);
};
