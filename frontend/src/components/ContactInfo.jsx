import React from 'react';
import { User, X, BellOff, Slash, ThumbsDown, Heart } from 'lucide-react';
import api from '../services/api';

const ContactInfo = ({ activeChat, onClose, setRefreshTrigger }) => {

  const handleBlockUser = async () => {
    try {
      await api.post(`/users/block/${activeChat.id}`);
      alert('User blocked successfully.');
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
    } catch (e) {
      alert('Failed to submit report');
    }
  };

  const ActionButton = ({ icon, text, onClick, danger }) => (
    <div 
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        padding: '16px 24px',
        cursor: 'pointer',
        color: danger ? 'var(--danger, #F25C54)' : 'var(--text)',
        transition: 'background-color 0.2s',
        borderBottom: '1px solid var(--divider)'
      }}
      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-chat)'}
      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
    >
      {icon}
      <span style={{ fontSize: '15px' }}>{text}</span>
    </div>
  );

  return (
    <div style={{
      width: '350px',
      backgroundColor: 'var(--bg-sidebar)',
      display: 'flex',
      flexDirection: 'column',
      borderLeft: '1px solid var(--divider)',
      height: '100%',
      animation: 'slideIn 0.3s ease-out'
    }}>
      {/* Header */}
      <div style={{
        padding: '16px 24px',
        display: 'flex',
        alignItems: 'center',
        gap: '24px',
        backgroundColor: 'var(--bg-sidebar)',
        borderBottom: '1px solid var(--divider)'
      }}>
        <X size={24} color="var(--text-secondary)" style={{ cursor: 'pointer' }} onClick={onClose} />
        <h2 style={{ fontSize: '16px', fontWeight: '500', color: 'var(--text)', margin: 0 }}>Contact info</h2>
      </div>

      {/* Main Profile Area */}
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        padding: '32px 24px',
        backgroundColor: 'var(--bg-main)',
        marginBottom: '8px'
      }}>
        <div style={{ 
          width: '200px', 
          height: '200px', 
          borderRadius: '50%', 
          backgroundColor: 'var(--bg-sidebar)', 
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '20px',
          overflow: 'hidden'
        }}>
          {activeChat.avatar ? (
            <img src={activeChat.avatar} alt={activeChat.username} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <User size={100} color="var(--text-secondary)" />
          )}
        </div>
        <h2 style={{ fontSize: '24px', color: 'var(--text)', margin: '0 0 8px 0', fontWeight: '400' }}>
          {activeChat.username}
        </h2>
        {activeChat.about && (
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: 0, textAlign: 'center' }}>
            {activeChat.about}
          </p>
        )}
      </div>

      {/* About Section */}
      <div style={{ padding: '16px 24px', backgroundColor: 'var(--bg-main)', borderBottom: '1px solid var(--divider)' }}>
        <p style={{ fontSize: '12px', color: 'var(--accent)', fontWeight: '500', marginBottom: '6px' }}>ABOUT</p>
        <p style={{ fontSize: '15px', color: 'var(--text)', margin: 0 }}>
          {activeChat.about || 'Hey there! I am using PingChat.'}
        </p>
      </div>

      {/* Actions container with scrolling */}
      <div style={{ flex: 1, backgroundColor: 'var(--bg-main)', overflowY: 'auto' }}>
        <ActionButton 
          icon={<Heart size={20} />} 
          text="Add to favourites" 
          onClick={() => {
            api.post(`/users/favourite/${activeChat.id}`);
            alert('Toggled favourites');
          }}
        />
        <div style={{ height: '8px', backgroundColor: 'var(--bg-sidebar)' }} />
        
        <ActionButton 
          icon={<Slash size={20} />} 
          text={`Block ${activeChat.username}`} 
          onClick={handleBlockUser} 
          danger 
        />
        <ActionButton 
          icon={<ThumbsDown size={20} />} 
          text={`Report ${activeChat.username}`} 
          onClick={handleReportUser} 
          danger 
        />
      </div>

      <style>{`
        @keyframes slideIn {
          from { margin-right: -350px; opacity: 0; }
          to { margin-right: 0; opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default ContactInfo;
