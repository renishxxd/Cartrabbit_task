import React, { useState, useEffect } from 'react';
import { X, User, Check } from 'lucide-react';
import api from '../services/api';

const CreateGroupModal = ({ onClose, onGroupCreated }) => {
  const [groupName, setGroupName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const searchUsers = async () => {
      if (!searchQuery.trim()) {
        setSearchResults([]);
        return;
      }
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

  const toggleUserSelection = (userToToggle) => {
    if (selectedUsers.find(u => u.id === userToToggle.id)) {
      setSelectedUsers(selectedUsers.filter(u => u.id !== userToToggle.id));
    } else {
      setSelectedUsers([...selectedUsers, userToToggle]);
    }
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim() || selectedUsers.length === 0) {
      alert("Please provide a group name and select at least one user.");
      return;
    }

    setIsLoading(true);
    try {
      const participantIds = selectedUsers.map(u => u.id);
      const { data } = await api.post('/groups', {
        name: groupName,
        participants: participantIds
      });
      if (data.success) {
        onGroupCreated();
        onClose();
      }
    } catch (error) {
      alert("Failed to create group");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.7)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        width: '400px',
        backgroundColor: 'var(--bg-main)',
        borderRadius: '8px',
        overflow: 'hidden',
        display: 'flex', flexDirection: 'column'
      }}>
        <div style={{
          padding: '16px',
          backgroundColor: 'var(--bg-sidebar)',
          borderBottom: '1px solid var(--divider)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between'
        }}>
          <h2 style={{ fontSize: '18px', color: 'var(--text)', margin: 0 }}>Create New Group</h2>
          <X size={24} color="var(--text-secondary)" cursor="pointer" onClick={onClose} />
        </div>

        <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <input
              type="text"
              placeholder="Group Name"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: 'var(--bg-sidebar)',
                border: 'none',
                borderRadius: '8px',
                color: 'var(--text)',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div>
            <input
              type="text"
              placeholder="Search users to add..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: 'var(--bg-sidebar)',
                border: 'none',
                borderRadius: '8px',
                color: 'var(--text)',
                outline: 'none',
                box: 'border-box'
              }}
            />
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {selectedUsers.map(u => (
              <div key={u.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'var(--accent)', padding: '4px 12px', borderRadius: '16px' }}>
                <span style={{ color: 'white', fontSize: '12px' }}>{u.username}</span>
                <X size={14} color="white" cursor="pointer" onClick={() => toggleUserSelection(u)} />
              </div>
            ))}
          </div>

          <div style={{ flex: 1, minHeight: '200px', maxHeight: '200px', overflowY: 'auto' }}>
            {searchResults.map(user => {
              const isSelected = selectedUsers.some(u => u.id === user.id);
              return (
                <div key={user.id} onClick={() => toggleUserSelection(user)} style={{
                  display: 'flex', alignItems: 'center', padding: '12px', cursor: 'pointer',
                  borderBottom: '1px solid var(--divider)',
                  backgroundColor: isSelected ? 'rgba(0, 168, 132, 0.1)' : 'transparent'
                }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--bg-sidebar)', marginRight: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {user.avatar ? <img src={user.avatar} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} /> : <User size={20} color="var(--text-secondary)" />}
                  </div>
                  <div style={{ flex: 1, color: 'var(--text)' }}>{user.username}</div>
                  {isSelected && <Check size={20} color="var(--accent)" />}
                </div>
              );
            })}
          </div>

          <button
            onClick={handleCreateGroup}
            disabled={isLoading || selectedUsers.length === 0 || !groupName.trim()}
            style={{
              padding: '12px',
              backgroundColor: 'var(--accent)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 'bold',
              cursor: (isLoading || selectedUsers.length === 0 || !groupName.trim()) ? 'not-allowed' : 'pointer',
              opacity: (isLoading || selectedUsers.length === 0 || !groupName.trim()) ? 0.5 : 1
            }}
          >
            {isLoading ? 'Creating...' : 'Create Group'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateGroupModal;
