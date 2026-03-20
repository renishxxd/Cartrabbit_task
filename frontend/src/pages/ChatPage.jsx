import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import ChatWindow from '../components/ChatWindow';
import ContactInfo from '../components/ContactInfo';
import api from '../services/api';
import { useSocket } from '../services/useSocket';
import { useAuth } from '../context/AuthContext';
import { MessageCircle } from 'lucide-react';

const ChatPage = () => {
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [refreshTrigger, setRefreshTrigger] = useState(0); 
  const [showContactInfo, setShowContactInfo] = useState(false); // New state
  
  const { socket } = useSocket();
  const { logout, user } = useAuth();

  useEffect(() => {
    if (!activeChat) {
      setMessages([]);
      setShowContactInfo(false);
      return;
    }
    
    // Close contact info on chat change
    setShowContactInfo(false);
    
    const fetchHistory = async () => {
      try {
        const { data } = await api.get(`/messages/${activeChat.id}`);
        if (data.success) {
          setMessages(data.data);
        }
      } catch (err) {
        console.error("Failed to load history", err);
      }
    };
    fetchHistory();
  }, [activeChat]);

  useEffect(() => {
    if (!socket || !activeChat) return;
    
    const handleNewMessage = (newMessage) => {
      const isRelevant = 
        newMessage.senderId === activeChat.id || 
        newMessage.senderId === user._id || 
        newMessage.senderId === 'me';
        
      if (isRelevant) {
        setMessages(prev => [...prev, newMessage]);
      }
      
      setRefreshTrigger(prev => prev + 1);
    };

    socket.on('newMessage', handleNewMessage);
    
    return () => socket.off('newMessage', handleNewMessage);
  }, [socket, activeChat, user]);

  const handleSend = async (textOverride, mediaData) => {
    const textToSend = textOverride !== undefined ? textOverride : inputText.trim();
    if ((!textToSend && !mediaData) || !activeChat) return;
    
    if (textOverride === undefined) setInputText('');
    
    try {
      const payload = { text: textToSend };
      if (mediaData) {
        payload.mediaUrl = mediaData.url;
        payload.mediaType = mediaData.type;
        payload.mediaMetadata = mediaData.metadata;
      }

      const { data } = await api.post(`/messages/send/${activeChat.id}`, payload);
      if (data.success) {
        setMessages(prev => [...prev, data.data]);
        setRefreshTrigger(prev => prev + 1);
      }
    } catch (err) {
      console.error("Send failed", err);
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column',
      height: '100vh', 
      width: '100vw', 
      backgroundColor: 'var(--bg-main)',
      position: 'fixed',
      top: 0,
      left: 0,
      zIndex: 1000
    }}>
      {/* Native-like Title Bar */}
      <div style={{
        height: '32px',
        backgroundColor: 'var(--bg-sidebar)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 16px',
        gap: '8px',
        borderBottom: '1px solid var(--divider)',
        userSelect: 'none',
        WebkitAppRegion: 'drag'
      }}>
        <MessageCircle size={14} color="var(--accent)" fill="var(--accent)" />
        <span style={{ fontSize: '12px', fontWeight: '500', color: 'var(--text-secondary)' }}>PingChat</span>
      </div>

      {/* Main Chat Layout Container */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        <Sidebar 
          activeChat={activeChat} 
          setActiveChat={setActiveChat} 
          onLogout={logout}
          refreshTrigger={refreshTrigger}
        />
        <ChatWindow 
          activeChat={activeChat} 
          setActiveChat={setActiveChat}
          messages={messages}
          setMessages={setMessages}
          inputText={inputText}
          setInputText={setInputText}
          handleSend={handleSend}
          setRefreshTrigger={setRefreshTrigger}
          setShowContactInfo={setShowContactInfo}
        />
        {showContactInfo && activeChat && (
          <ContactInfo 
            activeChat={activeChat} 
            onClose={() => setShowContactInfo(false)}
            setRefreshTrigger={setRefreshTrigger}
          />
        )}
      </div>
    </div>
  );
};

export default ChatPage;
