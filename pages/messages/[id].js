
// "use client";

// import { useState, useEffect, useRef } from 'react';
// import { useRouter } from 'next/router';
// import { sendMessage, getConversation, uploadMessageImage, sendMessageWithImage } from '../../utils/api';
// import styles from './[id].module.css';
// import Navbar from "@/components/Navbar";
// import Footer from "@/components/Footer";

// export default function MessagePage() {
//   const router = useRouter();
//   const { id: receiverId } = router.query;
//   const [message, setMessage] = useState('');
//   const [isSending, setIsSending] = useState(false);
//   const [error, setError] = useState(null);
//   const [conversation, setConversation] = useState([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [currentUserId, setCurrentUserId] = useState(null);
//   const [selectedImage, setSelectedImage] = useState(null);
//   const [imagePreview, setImagePreview] = useState(null);
//   const fileInputRef = useRef(null);

// // // Image URL helper - matches your working pet images function
// // function getMessageImageUrl(imageName) {
// //   if (!imageName) return "https://via.placeholder.com/400";
// //   return `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/uploads/messages/${imageName}?t=${Date.now()}`;
// // }

//   useEffect(() => {
//     if (typeof window !== 'undefined') {
//       setCurrentUserId(parseInt(window.sessionStorage.getItem("user_id")));
//     }
//   }, []);

//   useEffect(() => {
//     if (!receiverId || !currentUserId) return;

//     const loadConversation = async () => {
//       try {
//         setIsLoading(true);
//         const data = await getConversation(receiverId);
//         setConversation(data.messages);
//       } catch (err) {
//         setError(err.message);
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     loadConversation();
//   }, [receiverId, currentUserId]);

//   const handleImageSelect = (e) => {
//     const file = e.target.files[0];
//     if (!file) return;

//     // Validate file type
//     if (!file.type.match('image.*')) {
//       setError('Please select an image file');
//       return;
//     }

//     // Validate file size (5MB max)
//     if (file.size > 5 * 1024 * 1024) {
//       setError('Image size must be less than 5MB');
//       return;
//     }

//     setSelectedImage(file);
//     setImagePreview(URL.createObjectURL(file));
//     setError(null);
//   };

//   const removeSelectedImage = () => {
//     setSelectedImage(null);
//     setImagePreview(null);
//     if (fileInputRef.current) fileInputRef.current.value = '';
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!message.trim() && !selectedImage) return;

//     try {
//       setIsSending(true);
//       let imageUrl = null;

//       if (selectedImage) {
//         const uploadResult = await uploadMessageImage(selectedImage);
//         imageUrl = uploadResult.filename;
//       }

//       if (imageUrl) {
//         await sendMessageWithImage(receiverId, message, imageUrl);
//       } else {
//         await sendMessage(receiverId, message);
//       }

//       setMessage('');
//       setSelectedImage(null);
//       setImagePreview(null);
      
//       // Refresh conversation
//       const data = await getConversation(receiverId);
//       setConversation(data.messages);
//     } catch (err) {
//       setError(err.message);
//     } finally {
//       setIsSending(false);
//       if (fileInputRef.current) fileInputRef.current.value = '';
//     }
//   };

//   if (isLoading) {
//     return <div className={styles.loading}>Loading conversation...</div>;
//   }

//   return (
//     <div>
//       <Navbar />
//       <div className={styles.container}>
//         <h1>Conversation with User {receiverId}</h1>
        
//         {error && <div className={styles.error}>{error}</div>}
        
//         <div className={styles.messagesContainer}>
//           {conversation.map((msg) => (
//             <div key={msg.id} className={`${styles.message} ${msg.sender_id === currentUserId ? styles.sent : styles.received}`}>
//               <div className={styles.messageContent}>
//                 {msg.text && <p>{msg.text}</p>}
//                 {msg.image_url && (
//   <img
//     src={msg.image_url}
//     alt="Message attachment"
//     className="max-w-full h-auto"
//     onError={(e) => {
//       e.target.onerror = null;
//     }}
//   />
// )}
//                 <span className={styles.timestamp}>
//                   {new Date(msg.timestamp).toLocaleString()}
//                 </span>
//               </div>
//             </div>
//           ))}
//         </div>
        
//         <form onSubmit={handleSubmit} className={styles.messageForm}>
//           {imagePreview && (
//             <div className={styles.imagePreviewContainer}>
//               <img src={imagePreview} alt="Preview" className={styles.imagePreview} />
//               <button 
//                 type="button" 
//                 onClick={removeSelectedImage}
//                 className={styles.removeImageButton}
//               >
//                 ×
//               </button>
//             </div>
//           )}
          
//           <div className={styles.inputContainer}>
//             <input
//               type="file"
//               ref={fileInputRef}
//               onChange={handleImageSelect}
//               accept="image/*"
//               style={{ display: 'none' }}
//               id="message-image-upload"
//             />
//             <label htmlFor="message-image-upload" className={styles.uploadButton}>
//               📷
//             </label>
            
//             <input
//               type="text"
//               value={message}
//               onChange={(e) => setMessage(e.target.value)}
//               placeholder="Type your message..."
//               className={styles.messageInput}
//             />
            
//             <button 
//               type="submit" 
//               disabled={isSending || (!message.trim() && !selectedImage)}
//               className={styles.sendButton}
//             >
//               {isSending ? 'Sending...' : 'Send'}
//             </button>
//           </div>
//         </form>
//       </div>
//       <Footer />
//     </div>
//   );
// }



//frontend\pages\messages\[id].js
"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { sendMessage, getConversation, uploadMessageImage, sendMessageWithImage } from '@/utils/api';
import styles from './[id].module.css';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function MessagePage() {
  const router = useRouter();
  const { id: receiverId } = router.query;
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState(null);
  const [conversation, setConversation] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentUserId(parseInt(window.sessionStorage.getItem("user_id")));
    }
  }, []);

  useEffect(() => {
    if (!receiverId || !currentUserId) return;

    const loadConversation = async () => {
      try {
        setIsLoading(true);
        const data = await getConversation(receiverId);
        setConversation(data.messages || []); // Ensure we always have an array
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    loadConversation();
  }, [receiverId, currentUserId]);

  useEffect(() => {
    scrollToBottom();
  }, [conversation]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.match('image.*')) {
      setError('Please select an image file (JPEG, PNG, GIF)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB');
      return;
    }

    setSelectedImage(file);
    setImagePreview(URL.createObjectURL(file));
    setError(null);
  };

  const removeSelectedImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim() && !selectedImage) return;

    try {
      setIsSending(true);
      let imageUrl = null;

      if (selectedImage) {
        const uploadResult = await uploadMessageImage(selectedImage);
        imageUrl = uploadResult.filename;
      }

      if (imageUrl) {
        await sendMessageWithImage(receiverId, message, imageUrl);
      } else {
        await sendMessage(receiverId, message);
      }

      setMessage('');
      setSelectedImage(null);
      setImagePreview(null);
      
      const data = await getConversation(receiverId);
      setConversation(data.messages);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSending(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading conversation...</p>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
    <Navbar />
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Chat with User {receiverId}</h1>
        {error && <div className={styles.error} onClick={() => setError(null)}>{error}</div>}
      </header>
      
      <div className={styles.messagesContainer}>
        {conversation.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIllustration}>💬</div>
            <p>No messages yet</p>
            <p>Start the conversation!</p>
          </div>
        ) : (
          conversation.map((msg) => (
            <div 
              key={msg.id} 
              className={`${styles.message} ${
                msg.sender_id === currentUserId ? styles.sent : styles.received
              }`}
            >
              <div className={styles.messageContent}>
                {msg.text && <p className={styles.messageText}>{msg.text}</p>}
                {msg.image_url && (
                  <div className={styles.imageWrapper}>
                    <img
                      src={msg.image_url}
                      alt="Message attachment"
                      className={styles.messageImage}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/image-placeholder.svg';
                      }}
                    />
                  </div>
                )}
                <span className={styles.timestamp}>
                  {new Date(msg.timestamp).toLocaleString()}
                </span>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
        </div>
        
        <form onSubmit={handleSubmit} className={styles.messageForm}>
          {imagePreview && (
            <div className={styles.imagePreviewContainer}>
              <img src={imagePreview} alt="Preview" className={styles.imagePreview} />
              <button 
                type="button" 
                onClick={removeSelectedImage}
                className={styles.removeImageButton}
                aria-label="Remove image"
              >
                ×
              </button>
            </div>
          )}
          
          <div className={styles.inputGroup}>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageSelect}
              accept="image/*"
              style={{ display: 'none' }}
              id="message-image-upload"
            />
            <label htmlFor="message-image-upload" className={styles.uploadButton} title="Attach image">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 5.5C13.38 5.5 14.5 6.62 14.5 8C14.5 9.38 13.38 10.5 12 10.5C10.62 10.5 9.5 9.38 9.5 8C9.5 6.62 10.62 5.5 12 5.5ZM12 3C9.79 3 8 4.79 8 7C8 9.21 9.79 11 12 11C14.21 11 16 9.21 16 7C16 4.79 14.21 3 12 3ZM19 19H5V17C5 14.34 8.33 13 12 13C15.67 13 19 14.34 19 17V19ZM21 19V17C21 13.28 16.05 11 12 11C7.95 11 3 13.28 3 17V19H21Z" fill="#666"/>
              </svg>
            </label>
            
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message..."
              className={styles.messageInput}
              aria-label="Message input"
            />
            
            <button 
              type="submit" 
              disabled={isSending || (!message.trim() && !selectedImage)}
              className={styles.sendButton}
              aria-label="Send message"
            >
              {isSending ? (
                <div className={styles.spinnerSmall}></div>
              ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" fill="white"/>
                </svg>
              )}
            </button>
          </div>
        </form>
      </div>
      <Footer />
    </div>
  );
}