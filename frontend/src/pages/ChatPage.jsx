import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import ChatWindow from '../components/ChatWindow';
import ContactInfo from '../components/ContactInfo';
import GroupInfoModal from '../components/GroupInfoModal';
import StatusTab from '../components/StatusTab';
import api from '../services/api';
import { useSocket } from '../services/useSocket';
import { useAuth } from '../context/AuthContext';
import { MessageCircle } from 'lucide-react';

const ChatPage = () => {
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [refreshTrigger, setRefreshTrigger] = useState(0); 
  const [showContactInfo, setShowContactInfo] = useState(false);
  const [showStatusTab, setShowStatusTab] = useState(false);
  
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
        // Mark as read when opening
        await api.put(`/messages/mark-read/${activeChat.id}`);
        setRefreshTrigger(prev => prev + 1);
      } catch (err) {
        console.error("Failed to load history", err);
      }
    };
    fetchHistory();
  }, [activeChat]);

  useEffect(() => {
    if (!socket) return;
    
    const handleNewMessage = (newMessage) => {
      const isRelevant = activeChat && (
        newMessage.conversationId === activeChat.id ||
        newMessage.senderId === activeChat.id || 
        newMessage.senderId === user._id || 
        newMessage.senderId === 'me'
      );
        
      if (isRelevant) {
        setMessages(prev => [...prev, newMessage]);
        // If it's the active chat, mark it as read immediately
        if (newMessage.senderId === activeChat?.id) {
          api.put(`/messages/mark-read/${activeChat.id}`).catch(err => console.error(err));
        }
      } else if (newMessage.senderId !== user._id && newMessage.senderId !== 'me') {
        // Not active chat, but we received it, mark as delivered
        socket.emit('message_delivered', { messageId: newMessage.id, senderId: newMessage.senderId });
      }
      
      setRefreshTrigger(prev => prev + 1);
    };

    const handleMessageStatusUpdate = ({ messageId, status }) => {
      setMessages(prev => prev.map(msg => 
        msg.id === messageId ? { ...msg, status } : msg
      ));
    };

    const handleMessagesRead = (payload) => {
      if (!payload || !activeChat) return;
      // Only show blue ticks if the person reading them is the one we are actively chatting with
      if (activeChat.id === payload.readerId) {
        setMessages(prev => prev.map(msg => 
          (msg.status === 'sent' || msg.status === 'delivered') ? { ...msg, status: 'read' } : msg
        ));
      }
    };

    const handleMessageEdited = ({ messageId, newText, isEdited }) => {
      setMessages(prev => prev.map(msg => 
        msg.id === messageId ? { ...msg, text: newText, isEdited } : msg
      ));
      setRefreshTrigger(prev => prev + 1);
    };

    const handleMessageDeleted = ({ messageId, isDeleted }) => {
      setMessages(prev => prev.map(msg => 
        msg.id === messageId ? { ...msg, text: '🚫 This message was deleted', mediaUrl: null, mediaType: null, isDeleted } : msg
      ));
      setRefreshTrigger(prev => prev + 1);
    };

    const handleMessageReacted = ({ messageId, reactions }) => {
      setMessages(prev => prev.map(msg => 
        msg.id === messageId ? { ...msg, reactions } : msg
      ));
      setRefreshTrigger(prev => prev + 1);
    };

    const handleProfileUpdated = () => {
      setRefreshTrigger(prev => prev + 1);
    };

    socket.on('newMessage', handleNewMessage);
    socket.on('message_status_update', handleMessageStatusUpdate);
    socket.on('messages_read', handleMessagesRead);
    socket.on('message_edited', handleMessageEdited);
    socket.on('message_deleted', handleMessageDeleted);
    socket.on('message_reacted', handleMessageReacted);
    socket.on('profile_updated', handleProfileUpdated);
    socket.on('group_updated', handleProfileUpdated);
    
    return () => {
      socket.off('newMessage', handleNewMessage);
      socket.off('message_status_update', handleMessageStatusUpdate);
      socket.off('messages_read', handleMessagesRead);
      socket.off('message_edited', handleMessageEdited);
      socket.off('message_deleted', handleMessageDeleted);
      socket.off('message_reacted', handleMessageReacted);
      socket.off('profile_updated', handleProfileUpdated);
      socket.off('group_updated', handleProfileUpdated);
    };
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
        {showStatusTab ? (
          <StatusTab onBack={() => setShowStatusTab(false)} />
        ) : (
          <>
            <Sidebar 
              activeChat={activeChat} 
              setActiveChat={setActiveChat} 
              onLogout={logout}
              refreshTrigger={refreshTrigger}
              onOpenStatus={() => setShowStatusTab(true)}
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
            {showContactInfo && activeChat && !activeChat.isGroup && (
              <ContactInfo 
                activeChat={activeChat} 
                onClose={() => setShowContactInfo(false)}
                setRefreshTrigger={setRefreshTrigger}
              />
            )}
            {showContactInfo && activeChat && activeChat.isGroup && (
              <GroupInfoModal 
                groupId={activeChat.id} 
                onClose={() => setShowContactInfo(false)}
                onGroupUpdated={(left) => {
                  setRefreshTrigger(prev => prev + 1);
                  if (left) setActiveChat(null);
                }}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ChatPage;
