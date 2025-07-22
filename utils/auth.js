import CryptoJS from "crypto-js";

const SECRET_KEY = "asdasdasd"; // Use the same key as in your login component

export const encryptData = (data) => {
  return CryptoJS.AES.encrypt(JSON.stringify(data), SECRET_KEY).toString();
};

export const decryptData = (encryptedData) => {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedData, SECRET_KEY);
    return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
  } catch (error) {
    console.error("Decryption failed:", error);
    return null;
  }
};

export const getDecryptedUserId = () => {
  const encryptedId = sessionStorage.getItem("user_id");
  return encryptedId ? decryptData(encryptedId) : null;
};
