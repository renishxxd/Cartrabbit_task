import React, { useState, useEffect } from 'react';
import { ArrowLeft, User, Plus, X } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const StatusTab = ({ onBack }) => {
  const { user } = useAuth();
  const [statusesGrouped, setStatusesGrouped] = useState([]);
  const [activeUserIdx, setActiveUserIdx] = useState(null);
  const [activeStatusIdx, setActiveStatusIdx] = useState(0);
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [newStatusText, setNewStatusText] = useState('');
  const [newStatusBg, setNewStatusBg] = useState('#0B141A');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchStatuses();
  }, []);

  const fetchStatuses = async () => {
    try {
      const { data } = await api.get('/status');
      if (data.success) {
        setStatusesGrouped(data.data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddStatus = async () => {
    if (!newStatusText.trim()) return;
    setIsLoading(true);
    try {
      await api.post('/status', {
        content: newStatusText,
        type: 'text',
        backgroundColor: newStatusBg
      });
      setShowAddForm(false);
      setNewStatusText('');
      fetchStatuses();
    } catch (e) {
      alert('Error adding status');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (activeUserIdx === null) return;
    
    let timer = setTimeout(() => {
      const currentGroup = statusesGrouped[activeUserIdx];
      if (activeStatusIdx < currentGroup.statuses.length - 1) {
        setActiveStatusIdx(prev => prev + 1);
      } else {
        if (activeUserIdx < statusesGrouped.length - 1) {
          setActiveUserIdx(prev => prev + 1);
          setActiveStatusIdx(0);
        } else {
          setActiveUserIdx(null);
        }
      }
    }, 5000); // 5 sec per status
    
    return () => clearTimeout(timer);
  }, [activeUserIdx, activeStatusIdx, statusesGrouped]);

  const bgColors = ['#0B141A', '#FF5722', '#E91E63', '#9C27B0', '#3F51B5', '#009688', '#FF9800'];

  return (
    <div style={{ flex: 1, display: 'flex', backgroundColor: 'var(--bg-main)', height: '100%', zIndex: 10 }}>
      {/* Left Menu / List */}
      <div style={{ width: '400px', backgroundColor: 'var(--bg-sidebar)', borderRight: '1px solid var(--divider)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '24px 16px', display: 'flex', alignItems: 'center', gap: '24px', borderBottom: '1px solid var(--divider)' }}>
          <ArrowLeft size={24} color="var(--text-secondary)" cursor="pointer" onClick={onBack} />
          <h2 style={{ color: 'var(--text)', fontSize: '20px', margin: 0 }}>Status</h2>
        </div>
        
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {/* My Status */}
          <div style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer' }} onClick={() => setShowAddForm(true)}>
            <div style={{ position: 'relative' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'var(--bg-main)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {user?.avatar ? <img src={user.avatar} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} /> : <User size={24} color="var(--text)" />}
              </div>
              <div style={{ position: 'absolute', bottom: -2, right: -2, backgroundColor: 'var(--accent)', borderRadius: '50%', padding: '2px' }}>
                <Plus size={16} color="white" />
              </div>
            </div>
            <div>
              <div style={{ color: 'var(--text)', fontSize: '16px', fontWeight: '500' }}>My status</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Click to add status update</div>
            </div>
          </div>
          
          <div style={{ padding: '16px 16px 8px 16px', color: 'var(--accent)', fontSize: '14px', textTransform: 'uppercase' }}>Recent updates</div>

          {statusesGrouped.map((group, idx) => (
            <div key={group.user._id} onClick={() => { setShowAddForm(false); setActiveUserIdx(idx); setActiveStatusIdx(0); }} style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer', backgroundColor: activeUserIdx === idx ? 'var(--bg-chat)' : 'transparent' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', border: '2px solid var(--accent)', padding: '2px' }}>
                <div style={{ width: '100%', height: '100%', borderRadius: '50%', backgroundColor: 'var(--bg-main)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                  {group.user.avatar ? <img src={group.user.avatar} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <User size={24} color="white" />}
                </div>
              </div>
              <div>
                <div style={{ color: 'var(--text)', fontSize: '16px' }}>{group.user.username === user.username ? 'My status' : group.user.username}</div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
                  {new Date(group.statuses[0].createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right View Area */}
      <div style={{ flex: 1, backgroundColor: '#0B141A', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
        {showAddForm ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: '500px' }}>
             <h3 style={{ color: 'white' }}>Create Text Status</h3>
             <textarea 
               value={newStatusText}
               onChange={e => setNewStatusText(e.target.value)}
               placeholder="Type a status..."
               style={{ width: '100%', height: '200px', padding: '24px', backgroundColor: newStatusBg, color: 'white', fontSize: '24px', border: 'none', borderRadius: '12px', resize: 'none', textAlign: 'center', outline: 'none' }}
             />
             <div style={{ display: 'flex', gap: '8px', marginTop: '24px' }}>
               {bgColors.map(c => (
                 <div key={c} onClick={() => setNewStatusBg(c)} style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: c, cursor: 'pointer', border: newStatusBg === c ? '2px solid white' : 'none' }} />
               ))}
             </div>
             <div style={{ display: 'flex', gap: '16px', marginTop: '32px' }}>
               <button onClick={() => setShowAddForm(false)} style={{ padding: '12px 24px', backgroundColor: 'transparent', color: 'white', border: '1px solid white', borderRadius: '24px', cursor: 'pointer' }}>Cancel</button>
               <button onClick={handleAddStatus} disabled={isLoading || !newStatusText.trim()} style={{ padding: '12px 24px', backgroundColor: 'var(--accent)', color: 'white', border: 'none', borderRadius: '24px', cursor: 'pointer' }}>{isLoading ? 'Posting...' : 'Send Status'}</button>
             </div>
          </div>
        ) : activeUserIdx !== null ? (
          <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', backgroundColor: statusesGrouped[activeUserIdx].statuses[activeStatusIdx].backgroundColor || '#0B141A' }}>
            <div style={{ padding: '24px', display: 'flex', gap: '8px' }}>
               {statusesGrouped[activeUserIdx].statuses.map((_, i) => (
                 <div key={i} style={{ flex: 1, height: '4px', backgroundColor: i <= activeStatusIdx ? 'white' : 'rgba(255,255,255,0.3)', borderRadius: '2px' }} />
               ))}
            </div>
            <div style={{ position: 'absolute', top: '40px', right: '40px' }}>
              <X size={32} color="white" cursor="pointer" onClick={() => setActiveUserIdx(null)} />
            </div>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
               <h1 style={{ color: 'white', fontSize: '48px', textAlign: 'center', maxWidth: '800px', wordBreak: 'break-word' }}>
                 {statusesGrouped[activeUserIdx].statuses[activeStatusIdx].content}
               </h1>
            </div>
            <div style={{ padding: '24px', textAlign: 'center', color: 'rgba(255,255,255,0.7)' }}>
              {new Date(statusesGrouped[activeUserIdx].statuses[activeStatusIdx].createdAt).toLocaleString()}
            </div>
          </div>
        ) : (
          <div style={{ color: 'var(--text-secondary)' }}>Click on a contact to view their status update</div>
        )}
      </div>
    </div>
  );
};

export default StatusTab;
