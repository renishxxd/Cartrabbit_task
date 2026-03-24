import React, { useState, useEffect } from 'react';
import { User, Search, LogOut, Users, CircleDashed, Phone } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import UserProfile from './UserProfile';
import CreateGroupModal from './CreateGroupModal';

const Sidebar = ({ activeChat, setActiveChat, onLogout, refreshTrigger, onOpenStatus, onOpenCalls }) => {
  const [conversations, setConversations] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [localRefresh, setLocalRefresh] = useState(0);
  const [filter, setFilter] = useState('all');
  const { user } = useAuth();

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const { data } = await api.get('/messages/conversations');
        if (data.success) {
          setConversations(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch conversations', error);
      }
    };
    fetchConversations();
  }, [refreshTrigger, localRefresh]);

  useEffect(() => {
    const searchUsers = async () => {
      if (!searchQuery.trim()) {
        setSearchResults([]);
        setIsSearching(false);
        return;
      }
      setIsSearching(true);
      try {
        const { data } = await api.get(`/users/search?username=${searchQuery}`);
        if (data.success) {
          setSearchResults(data.data);
        }
      } catch (error) {
        console.error('Search error', error);
      }
    };

    const delayDebounceFn = setTimeout(() => {
      searchUsers();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const handleSelectUser = (selectedUser) => {
    setActiveChat(selectedUser);
    setSearchQuery('');
    setSearchResults([]);
    setIsSearching(false);
  };

  const unreadCount = conversations.filter(c => c.unreadCount > 0).length;
  const favsCount = conversations.filter(c => c.isFavourite).length;
  const groupsCount = conversations.filter(c => c.isGroup).length;

  const filters = [
    { id: 'all', label: 'All' },
    { id: 'unread', label: `Unread ${unreadCount > 0 ? unreadCount : ''}`.trim() },
    { id: 'favourites', label: `Favourites ${favsCount > 0 ? favsCount : ''}`.trim() },
    { id: 'groups', label: `Groups ${groupsCount > 0 ? groupsCount : ''}`.trim() }
  ];

  let listToRender = isSearching ? searchResults : conversations;
  
  if (!isSearching && filter !== 'all') {
    if (filter === 'unread') listToRender = listToRender.filter(c => c.unreadCount > 0);
    if (filter === 'favourites') listToRender = listToRender.filter(c => c.isFavourite);
    if (filter === 'groups') listToRender = listToRender.filter(c => c.isGroup);
  }

  return (
    <div className={`sidebar-container ${activeChat ? 'hide-on-mobile' : 'full-width-mobile'}`} style={{
      width: '30%',
      minWidth: '300px',
      maxWidth: '400px',
      backgroundColor: 'var(--bg-sidebar)',
      borderRight: '1px solid var(--divider)',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      zIndex: 2,
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* UserProfile slide-over */}
      {showProfile && <UserProfile onClose={() => setShowProfile(false)} />}
      {showCreateGroup && <CreateGroupModal onClose={() => setShowCreateGroup(false)} onGroupCreated={() => setLocalRefresh(prev => prev + 1)} />}

      {/* Sidebar Header */}
      <div style={{
        padding: '16px',
        backgroundColor: 'var(--bg-sidebar)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid var(--divider)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            title="View Profile"
            onClick={() => setShowProfile(true)}
            style={{ 
              width: '40px', 
              height: '40px', 
              borderRadius: '50%', 
              backgroundColor: 'var(--accent)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              cursor: 'pointer',
              overflow: 'hidden',
              flexShrink: 0
            }}
          >
            {user?.avatar
              ? <img src={user.avatar} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <User size={24} color="#fff" />
            }
          </div>
          <h2 style={{ fontSize: '18px', fontWeight: '500', color: 'var(--text)', margin: 0 }}>Chats</h2>
        </div>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <button onClick={onOpenCalls} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }} title="Calls">
            <Phone size={20} />
          </button>
          <button onClick={onOpenStatus} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }} title="Status">
            <CircleDashed size={20} />
          </button>
          <button onClick={() => setShowCreateGroup(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }} title="New Group">
            <Users size={20} />
          </button>
          <button onClick={onLogout} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }} title="Logout">
            <LogOut size={20} />
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div style={{ padding: '8px 16px', borderBottom: '1px solid var(--divider)', backgroundColor: 'var(--bg-main)' }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center',
          backgroundColor: 'var(--bg-sidebar)',
          borderRadius: '8px',
          padding: '6px 12px'
        }}>
          <Search size={18} color="var(--text-secondary)" style={{ marginRight: '12px' }} />
          <input 
            type="text"
            placeholder="Search username to start chat"
            value={searchQuery}
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
        </div>
      </div>

      {/* Filter Pills */}
      {!isSearching && (
        <div style={{ display: 'flex', gap: '8px', padding: '0 16px 8px 16px', overflowX: 'auto', backgroundColor: 'var(--bg-main)', borderBottom: '1px solid var(--divider)' }}>
          {filters.map(f => (
            <div 
              key={f.id}
              onClick={() => setFilter(f.id)}
              style={{
                padding: '6px 16px',
                backgroundColor: filter === f.id ? 'rgba(0, 168, 132, 0.1)' : 'var(--bg-sidebar)',
                color: filter === f.id ? 'var(--accent)' : 'var(--text-secondary)',
                borderRadius: '16px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                border: filter === f.id ? '1px solid var(--accent)' : '1px solid var(--divider)'
              }}
            >
              {f.label}
            </div>
          ))}
        </div>
      )}

      {/* Users/Conversations List */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {listToRender.length === 0 ? (
          <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '14px' }}>
            {isSearching ? 'No users found' : 'No conversations yet. Search for a username to start chatting!'}
          </div>
        ) : (
          listToRender.map(user => {
            const isActive = activeChat && activeChat.id === user.id;
            return (
              <div 
                key={user.id} 
                onClick={() => handleSelectUser(user)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '12px 16px',
                  cursor: 'pointer',
                  backgroundColor: isActive ? 'var(--bg-chat)' : 'transparent',
                  transition: 'background-color 0.2s',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.03)'
                }}
                onMouseEnter={(e) => {
                  if (!isActive) e.currentTarget.style.backgroundColor = 'var(--bg-chat)';
                }}
                onMouseLeave={(e) => {
                  if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <div style={{ 
                  width: '48px', 
                  height: '48px', 
                  borderRadius: '50%', 
                  backgroundColor: 'var(--bg-main)', 
                  marginRight: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  overflow: 'hidden'
                }}>
                  {user.avatar
                    ? <img src={user.avatar} alt={user.username} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <User size={24} color="var(--text-secondary)" />
                  }
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'baseline',
                    marginBottom: '4px'
                  }}>
                    <h3 style={{ fontSize: '16px', fontWeight: '500', margin: 0, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.username}</h3>
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)', flexShrink: 0, marginLeft: '8px' }}>
                      {user.lastSeen || ''}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <p style={{ 
                      fontSize: '14px', 
                      color: 'var(--text-secondary)', 
                      margin: 0,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      flex: 1
                    }}>
                      {user.lastMessage || 'New user'}
                    </p>
                    {user.unreadCount > 0 && !isActive && (
                      <span style={{ 
                        backgroundColor: '#25D366', 
                        color: 'white', 
                        borderRadius: '12px', 
                        padding: '2px 8px', 
                        fontSize: '12px',
                        fontWeight: '600',
                        marginLeft: '8px',
                        minWidth: '20px',
                        textAlign: 'center'
                      }}>
                        {user.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Sidebar;
