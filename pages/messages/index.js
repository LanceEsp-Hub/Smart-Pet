"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getUserConversations } from '@/utils/api';

export default function MessagesPage() {
  const router = useRouter();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await getUserConversations();
        
        // Make sure response has the expected structure
        if (response && Array.isArray(response.conversations)) {
          setConversations(response.conversations);
        } else {
          throw new Error('Invalid response format');
        }
      } catch (err) {
        setError(err.message || 'Failed to load conversations');
        console.error('Error loading conversations:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div>Loading conversations...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>Messages</h1>
      {conversations.length === 0 ? (
        <p>No conversations found</p>
      ) : (
        <div>
          {conversations.map((conv) => {
            const currentUserId = parseInt(
              typeof window !== 'undefined' ? window.sessionStorage.getItem("user_id") : '0'
            );
            const otherUser = currentUserId === conv.user1 ? conv.user2_ref : conv.user1_ref;
            
            if (!otherUser) return null;

            return (
              <div 
                key={conv.id}
                onClick={() => router.push(`/messages/${otherUser.id}`)}
                style={{ padding: '10px', borderBottom: '1px solid #ccc', cursor: 'pointer' }}
              >
                <p>{otherUser.name}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}