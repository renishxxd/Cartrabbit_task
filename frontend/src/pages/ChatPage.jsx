import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import ChatWindow from '../components/ChatWindow';
import ContactInfo from '../components/ContactInfo';
import api from '../services/api';
import { useSocket } from '../services/useSocket';
import { useAuth } from '../context/AuthContext';

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

  const handleSend = async () => {
    if (!inputText.trim() || !activeChat) return;
    
    const textToSend = inputText.trim();
    setInputText('');
    
    try {
      const { data } = await api.post(`/messages/send/${activeChat.id}`, {
        text: textToSend
      });
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
      height: '100vh', 
      width: '100vw', 
      backgroundColor: 'var(--bg-main)',
      position: 'fixed',
      top: 0,
      left: 0,
      zIndex: 1000
    }}>
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
  );
};

export default ChatPage;
