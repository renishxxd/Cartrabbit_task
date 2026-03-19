import React, { useRef, useEffect, useState } from 'react';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';
import { User, MoreVertical, Search, X, Info, CheckSquare, BellOff, Clock, Heart, XCircle, ThumbsDown, Slash, MinusCircle, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const DropdownItem = ({ icon, text, onClick }) => (
  <div 
    onClick={onClick}
    style={{
      padding: '12px 16px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      cursor: 'pointer',
      color: 'var(--text)',
      fontSize: '14px',
      transition: 'background-color 0.2s',
    }}
    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-chat)'}
    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
  >
    {icon}
    <span>{text}</span>
  </div>
);

const ChatWindow = ({ activeChat, setActiveChat, messages, setMessages, inputText, setInputText, handleSend, setRefreshTrigger, setShowContactInfo }) => {
  const messagesEndRef = useRef(null);
  const { user } = useAuth();
  
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectedMessages, setSelectedMessages] = useState([]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  // Clear search and dropdown if we switch chats
  useEffect(() => {
    setIsSearching(false);
    setSearchQuery('');
    setShowDropdown(false);
    setIsSelecting(false);
    setSelectedMessages([]);
  }, [activeChat]);

  const handleBlockUser = async () => {
    try {
      await api.post(`/users/block/${activeChat.id}`);
      alert('User blocked successfully. They can no longer send you messages.');
      setShowDropdown(false);
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to block user');
    }
  };

  const handleReportUser = async () => {
    const reason = prompt('Please provide a reason for reporting this user:');
    if (!reason) return;
    try {
      await api.post(`/users/report/${activeChat.id}`, { reason });
      alert('Report submitted successfully.');
      setShowDropdown(false);
    } catch (e) {
      alert('Failed to submit report');
    }
  };


  const handleFavourite = async () => {
    try {
      const { data } = await api.post(`/users/favourite/${activeChat.id}`);
      alert(data.isFavourite ? 'Chat added to favourites.' : 'Chat removed from favourites.');
      setShowDropdown(false);
    } catch (e) {
      alert('Failed to toggle favourite');
    }
  };

  const handleDisappearing = async () => {
    const hours = prompt('Set disappearing messages timer in hours (e.g. 24). Enter 0 to turn off:');
    if (hours === null) return;
    const timer = parseInt(hours) * 3600;
    if (isNaN(timer)) return alert('Invalid number');
    
    try {
      await api.put(`/messages/disappearing/${activeChat.id}`, { timer });
      alert(timer === 0 ? 'Disappearing messages turned off.' : `Messages will now disappear after ${hours} hours.`);
      setShowDropdown(false);
    } catch (e) {
      alert('Failed to update disappearing messages setting');
    }
  };

  const handleClearChat = async () => {
    if (!window.confirm('Are you sure you want to clear this entire chat history?')) return;
    try {
      await api.delete(`/messages/clear/${activeChat.id}`);
      setMessages([]);
      setRefreshTrigger(prev => prev + 1);
      setShowDropdown(false);
    } catch (e) {
      alert('Failed to clear chat');
    }
  };

  const handleDeleteChat = async () => {
    if (!window.confirm('Are you sure you want to completely delete this chat?')) return;
    try {
      await api.delete(`/messages/delete/${activeChat.id}`);
      setMessages([]);
      setActiveChat(null);
      setRefreshTrigger(prev => prev + 1);
      setShowDropdown(false);
    } catch (e) {
      alert('Failed to delete chat');
    }
  };

  const deleteSelectedMessages = () => {
    const newMessages = messages.filter(msg => !selectedMessages.includes(msg.id));
    setMessages(newMessages);
    setIsSelecting(false);
    setSelectedMessages([]);
    alert('Simulated local delete for ' + selectedMessages.length + ' messages!');
  };

  const toggleSelectMessage = (id) => {
    setSelectedMessages(prev => 
      prev.includes(id) 
        ? prev.filter(msgId => msgId !== id)
        : [...prev, id]
    );
  };

  if (!activeChat) {
    return (
      <div style={{
        flex: 1,
        backgroundColor: 'var(--bg-main)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--text-secondary)',
        borderBottom: '6px solid var(--accent)'
      }}>
        <div style={{ 
          width: '160px', 
          height: '160px', 
          borderRadius: '50%', 
          backgroundColor: 'var(--bg-sidebar)', 
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '32px'
        }}>
          <User size={80} opacity={0.3} />
        </div>
        <h2 style={{ color: 'var(--text)', fontWeight: '300', fontSize: '32px', marginBottom: '16px' }}>PingChat Web</h2>
        <p style={{ fontSize: '14px', maxWidth: '400px', textAlign: 'center', lineHeight: '1.5' }}>
          Select a chat from the sidebar to start messaging. Your device needs to stay connected to sync messages seamlessly.
        </p>
      </div>
    );
  }

  const filteredMessages = searchQuery.trim() !== '' 
    ? messages.filter(msg => msg.text.toLowerCase().includes(searchQuery.toLowerCase()))
    : messages;

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', minWidth: 0 }}>
      {/* Chat Header */}
      {isSelecting ? (
        <div style={{
          padding: '10px 16px',
          backgroundColor: 'var(--bg-sidebar)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          zIndex: 2,
          borderBottom: '1px solid var(--divider)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <X 
              size={24} 
              color="var(--text-secondary)" 
              style={{ cursor: 'pointer' }} 
              onClick={() => { setIsSelecting(false); setSelectedMessages([]); }}
            />
            <span style={{ color: 'var(--text)', fontSize: '16px' }}>
              {selectedMessages.length} selected
            </span>
          </div>
          <div style={{ display: 'flex', gap: '24px' }}>
            {selectedMessages.length > 0 && (
              <Trash2 
                size={20} 
                color="var(--text-secondary)" 
                style={{ cursor: 'pointer' }}
                onClick={deleteSelectedMessages}
              />
            )}
          </div>
        </div>
      ) : (
        <div style={{
          padding: '10px 16px',
          backgroundColor: 'var(--bg-sidebar)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          zIndex: 2,
          borderBottom: isSearching ? 'none' : '1px solid var(--divider)'
        }}>
        <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
          <div style={{ 
            width: '40px', 
            height: '40px', 
            borderRadius: '50%', 
            backgroundColor: 'var(--bg-main)', 
            marginRight: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            flexShrink: 0
          }}>
            {activeChat.avatar
              ? <img src={activeChat.avatar} alt={activeChat.username} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <User size={24} color="var(--text-secondary)" />
            }
          </div>
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: '500', margin: '0 0 2px 0', color: 'var(--text)' }}>
              {activeChat.username}
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
              {activeChat.isOnline ? 'online' : `last seen ${activeChat.lastSeen}`}
            </p>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '24px', color: 'var(--text-secondary)', alignItems: 'center', position: 'relative' }}>
          <Search 
            size={20} 
            style={{ 
              cursor: 'pointer',
              color: isSearching ? 'var(--accent)' : 'var(--text-secondary)',
              transition: 'color 0.2s'
            }} 
            onClick={() => {
              setIsSearching(!isSearching);
              if (isSearching) setSearchQuery('');
              setShowDropdown(false);
            }}
          />
          <MoreVertical 
            size={20} 
            style={{ cursor: 'pointer' }} 
            onClick={() => setShowDropdown(!showDropdown)}
          />
          
          {showDropdown && (
            <div style={{
              position: 'absolute',
              top: '40px',
              right: '0',
              backgroundColor: 'var(--bg-sidebar)',
              borderRadius: '8px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.5)',
              padding: '8px 0',
              width: '240px',
              zIndex: 100,
              display: 'flex',
              flexDirection: 'column'
            }}>
              <DropdownItem icon={<Info size={16}/>} text="Contact info" onClick={() => { setShowContactInfo(true); setShowDropdown(false); }} />
              <DropdownItem icon={<CheckSquare size={16}/>} text="Select messages" onClick={() => { setIsSelecting(true); setShowDropdown(false); }} />
              <DropdownItem icon={<Clock size={16}/>} text="Disappearing messages" onClick={handleDisappearing} />
              <DropdownItem icon={<Heart size={16}/>} text="Add to favourites" onClick={handleFavourite} />
              <DropdownItem 
                icon={<XCircle size={16}/>} 
                text="Close chat" 
                onClick={() => {
                  setShowDropdown(false);
                  setActiveChat(null);
                }} 
              />
              
              <div style={{ height: '1px', backgroundColor: 'var(--divider)', margin: '8px 0' }} />
              
              <DropdownItem icon={<ThumbsDown size={16}/>} text="Report" onClick={handleReportUser} />
              <DropdownItem icon={<Slash size={16}/>} text="Block" onClick={handleBlockUser} />
              <DropdownItem icon={<MinusCircle size={16}/>} text="Clear chat" onClick={handleClearChat} />
              <DropdownItem icon={<Trash2 size={16}/>} text="Delete chat" onClick={handleDeleteChat} />
            </div>
          )}
        </div>
      </div>
      )}
      
      {/* In-Chat Search Bar */}
      {isSearching && (
        <div style={{
          padding: '10px 16px',
          backgroundColor: 'var(--bg-sidebar)',
          borderBottom: '1px solid var(--divider)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          zIndex: 1
        }}>
          <Search size={16} color="var(--text-secondary)" />
          <input 
            type="text"
            placeholder="Search within this chat..."
            value={searchQuery}
            autoFocus
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              color: 'var(--text)',
              fontSize: '14px',
              outline: 'none'
            }}
          />
          <X 
            size={18} 
            color="var(--text-secondary)" 
            style={{ cursor: 'pointer' }} 
            onClick={() => {
              setIsSearching(false);
              setSearchQuery('');
            }}
          />
        </div>
      )}

      {/* Messages Area */}
      <div style={{ 
        flex: 1, 
        backgroundColor: '#0B141A', 
        backgroundImage: `linear-gradient(rgba(11, 20, 26, 0.95), rgba(11, 20, 26, 0.95)), url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')`,
        backgroundSize: 'cover',
        backgroundRepeat: 'repeat',
        backgroundPosition: 'center',
        padding: '24px 8%', 
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {filteredMessages.length === 0 && searchQuery !== '' ? (
          <div style={{ textAlign: 'center', color: 'var(--text-secondary)', marginTop: '20px' }}>
            No messages found matching "{searchQuery}"
          </div>
        ) : (
          filteredMessages.map(msg => (
            <MessageBubble 
              key={msg.id} 
              message={msg} 
              isOwn={msg.senderId === user?._id || msg.senderId === 'me'} 
              isSelecting={isSelecting}
              isSelected={selectedMessages.includes(msg.id)}
              onToggleSelect={toggleSelectMessage}
            />
          ))
        )}
        {/* Invisible div for auto-scroll */}
        <div ref={messagesEndRef} style={{ height: '1px' }} />
      </div>

      {/* Input Area */}
      <MessageInput 
        inputText={inputText}
        setInputText={setInputText}
        handleSend={handleSend}
      />
    </div>
  );
};

export default ChatWindow;
