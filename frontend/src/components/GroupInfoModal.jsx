import React, { useState, useEffect } from 'react';
import { X, User, UserPlus, LogOut, Trash2 } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const GroupInfoModal = ({ groupId, onClose, onGroupUpdated }) => {
  const { user } = useAuth();
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    fetchGroupDetails();
  }, [groupId]);

  const fetchGroupDetails = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/groups/${groupId}`);
      if (data.success) {
        setGroup(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch group details', error);
      alert('Error fetching group details');
      onClose();
    } finally {
      setLoading(false);
    }
  };

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
          // Filter out existing participants
          const existingIds = group?.participants.map(p => p._id.toString()) || [];
          setSearchResults(data.data.filter(u => !existingIds.includes(u._id.toString())));
        }
      } catch (error) {
        console.error('Search error', error);
      }
    };

    const delayDebounceFn = setTimeout(() => {
      searchUsers();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, group]);

  const handleAddUser = async (userId) => {
    try {
      await api.put(`/groups/${groupId}/add`, { userId });
      setSearchQuery('');
      setSearchResults([]);
      fetchGroupDetails();
      onGroupUpdated();
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to add user');
    }
  };

  const handleRemoveUser = async (userId) => {
    if (!window.confirm('Remove user from group?')) return;
    try {
      await api.put(`/groups/${groupId}/remove`, { userId });
      fetchGroupDetails();
      onGroupUpdated();
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to remove user');
    }
  };

  const handleLeaveGroup = async () => {
    if (!window.confirm('Are you sure you want to leave this group?')) return;
    try {
      await api.put(`/groups/${groupId}/remove`, { userId: user._id });
      onGroupUpdated(true); // pass true to indicate we left, so clear active chat
      onClose();
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to leave group');
    }
  };

  if (loading || !group) {
    return (
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: 'white' }}>Loading...</div>
      </div>
    );
  }

  const isAdmin = group.groupAdmin._id.toString() === user._id.toString();

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        width: '400px', maxHeight: '90vh', backgroundColor: 'var(--bg-main)',
        borderRadius: '8px', overflow: 'hidden', display: 'flex', flexDirection: 'column'
      }}>
        <div style={{
          padding: '16px', backgroundColor: 'var(--bg-sidebar)', borderBottom: '1px solid var(--divider)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between'
        }}>
          <h2 style={{ fontSize: '18px', color: 'var(--text)', margin: 0 }}>Group Info</h2>
          <X size={24} color="var(--text-secondary)" cursor="pointer" onClick={onClose} />
        </div>

        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', borderBottom: '1px solid var(--divider)' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: 'var(--bg-sidebar)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
            {group.groupAvatar ? <img src={group.groupAvatar} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} /> : <User size={40} color="var(--text-secondary)" />}
          </div>
          <h3 style={{ margin: 0, color: 'var(--text)', fontSize: '20px' }}>{group.groupName}</h3>
          <p style={{ margin: '8px 0 0 0', color: 'var(--text-secondary)', fontSize: '14px' }}>Group • {group.participants.length} participants</p>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
          {isAdmin && (
            <div style={{ marginBottom: '24px' }}>
              <p style={{ margin: '0 0 8px 0', color: 'var(--accent)', fontSize: '14px', fontWeight: '500' }}>Add participants</p>
              <input
                type="text"
                placeholder="Search username to add..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%', padding: '10px', backgroundColor: 'var(--bg-sidebar)',
                  border: 'none', borderRadius: '8px', color: 'var(--text)', outline: 'none', boxSizing: 'border-box'
                }}
              />
              {isSearching && searchResults.length > 0 && (
                <div style={{ marginTop: '8px', border: '1px solid var(--divider)', borderRadius: '8px', overflow: 'hidden' }}>
                  {searchResults.map(u => (
                    <div key={u._id} style={{ display: 'flex', alignItems: 'center', padding: '8px 12px', borderBottom: '1px solid var(--divider)' }}>
                      <span style={{ color: 'var(--text)', flex: 1 }}>{u.username}</span>
                      <UserPlus size={18} color="var(--accent)" cursor="pointer" onClick={() => handleAddUser(u._id)} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <p style={{ margin: '0 0 12px 0', color: 'var(--accent)', fontSize: '14px', fontWeight: '500' }}>Participants</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {group.participants.map(p => {
              const isPAdmin = p._id.toString() === group.groupAdmin._id.toString();
              return (
                <div key={p._id} style={{ display: 'flex', alignItems: 'center', padding: '8px', backgroundColor: 'var(--bg-sidebar)', borderRadius: '8px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--bg-main)', marginRight: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {p.avatar ? <img src={p.avatar} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} /> : <User size={16} color="var(--text-secondary)" />}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: 'var(--text)', fontSize: '14px' }}>{p.username} {p._id.toString() === user._id.toString() && '(You)'}</div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>{isPAdmin ? 'Group Admin' : p.email}</div>
                  </div>
                  {isAdmin && p._id.toString() !== user._id.toString() && (
                    <Trash2 size={16} color="#ff4d4f" cursor="pointer" onClick={() => handleRemoveUser(p._id)} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ padding: '16px', borderTop: '1px solid var(--divider)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px', color: '#ff4d4f' }} onClick={handleLeaveGroup}>
          <LogOut size={20} />
          <span style={{ fontWeight: '500' }}>Exit group</span>
        </div>
      </div>
    </div>
  );
};

export default GroupInfoModal;
