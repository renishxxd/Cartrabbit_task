import React, { useEffect, useState } from 'react';
import { Phone, PhoneMissed, Video, ArrowLeft, MoreVertical, Search, PhoneIncoming, PhoneOutgoing } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const CallsTab = ({ onBack, setActiveChat }) => {
  const [calls, setCalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchCalls();
  }, []);

  const fetchCalls = async () => {
    try {
      const { data } = await api.get('/calls');
      if (data.success) {
        setCalls(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch calls:', error);
    } finally {
      setLoading(false);
    }
  };

  const startCall = (userToCall, isVideo) => {
    if (window.makeCall) {
      window.makeCall(userToCall.id || userToCall._id, isVideo, userToCall.username);
    }
  };

  return (
    <div className="status-tab" style={{
      width: '30%',
      minWidth: '300px',
      maxWidth: '400px',
      backgroundColor: 'var(--bg-sidebar)',
      borderRight: '1px solid var(--divider)',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      zIndex: 10,
      position: 'relative'
    }}>
      {/* Header */}
      <div style={{
        backgroundColor: 'var(--bg-sidebar)',
        padding: '20px 16px 16px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: '24px',
        borderBottom: '1px solid var(--divider)'
      }}>
        <ArrowLeft size={24} color="var(--text-secondary)" style={{ cursor: 'pointer' }} onClick={onBack} />
        <h2 style={{ color: 'var(--text)', fontSize: '18px', fontWeight: '500', margin: 0 }}>Calls</h2>
      </div>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        {/* Create Link - Similar to WhatsApp */}
        <div style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '16px', borderBottom: '1px solid rgba(255,255,255,0.03)', cursor: 'pointer' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#00A884', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Phone size={20} color="white" style={{ transform: 'rotate(-45deg)' }} />
          </div>
          <div>
            <h3 style={{ color: 'var(--text)', margin: '0 0 4px 0', fontSize: '16px', fontWeight: '500' }}>Create call link</h3>
            <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '14px' }}>Share a link for your WhatsApp call</p>
          </div>
        </div>

        <div style={{ padding: '16px 16px 8px 16px' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: 0 }}>Recent</p>
        </div>

        {/* Call List */}
        {loading ? (
          <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading calls...</div>
        ) : calls.length === 0 ? (
          <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '14px' }}>No recent calls</div>
        ) : (
          calls.map(call => {
            const isCaller = call.callerId._id === user._id;
            const otherUser = isCaller ? call.receiverId : call.callerId;
            const isMissed = call.status === 'missed' && !isCaller;
            
            return (
              <div key={call._id} style={{
                display: 'flex',
                alignItems: 'center',
                padding: '12px 16px',
                cursor: 'pointer',
                transition: 'background-color 0.2s',
                borderBottom: '1px solid rgba(255, 255, 255, 0.03)'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-chat)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              onClick={() => setActiveChat({ id: otherUser._id, username: otherUser.username, avatar: otherUser.avatar, isGroup: false })}
              >
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', overflow: 'hidden', marginRight: '16px', flexShrink: 0, backgroundColor: 'var(--bg-main)' }}>
                  <img src={otherUser.avatar || 'https://ui-avatars.com/api/?name=' + otherUser.username} alt={otherUser.username} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                
                <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <h3 style={{ 
                    fontSize: '16px', 
                    fontWeight: '500', 
                    margin: 0, 
                    color: isMissed ? '#ff4d4f' : 'var(--text)', 
                    whiteSpace: 'nowrap', 
                    overflow: 'hidden', 
                    textOverflow: 'ellipsis' 
                  }}>
                    {otherUser.username}
                  </h3>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {isCaller ? (
                      <PhoneOutgoing size={14} color={call.status === 'missed' ? "var(--text-secondary)" : "#00A884"} />
                    ) : (
                      <PhoneIncoming size={14} color={call.status === 'missed' ? "#ff4d4f" : "#00A884"} />
                    )}
                    <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                      {new Date(call.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}, {new Date(call.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '20px', marginLeft: '16px', alignItems: 'center' }}>
                  <div title={call.callType === 'video' ? 'Video call' : 'Voice call'} onClick={(e) => { e.stopPropagation(); startCall(otherUser, call.callType === 'video'); }}>
                    {call.callType === 'video' ? (
                      <Video size={20} color="var(--accent)" style={{ cursor: 'pointer' }} />
                    ) : (
                      <Phone size={20} color="var(--accent)" style={{ cursor: 'pointer' }} />
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

export default CallsTab;
