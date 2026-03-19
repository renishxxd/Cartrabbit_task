import React, { useState, useRef } from 'react';
import { X, Camera, Check, Pencil, User } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const UserProfile = ({ onClose }) => {
  const { user, updateUser } = useAuth();

  const [username, setUsername] = useState(user?.username || '');
  const [about, setAbout] = useState(user?.about || 'Hey there! I am using PingChat.');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [editingUsername, setEditingUsername] = useState(false);
  const [editingAbout, setEditingAbout] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fileInputRef = useRef(null);

  const compressImage = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (e) => {
        const img = new Image();
        img.src = e.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const SIZE = 256;
          canvas.width = SIZE;
          canvas.height = SIZE;
          const ctx = canvas.getContext('2d');

          // Draw as square crop from center
          const minDim = Math.min(img.width, img.height);
          const sx = (img.width - minDim) / 2;
          const sy = (img.height - minDim) / 2;
          ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, SIZE, SIZE);

          resolve(canvas.toDataURL('image/jpeg', 0.75));
        };
        img.onerror = reject;
      };
      reader.onerror = reject;
    });
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const compressed = await compressImage(file);
      setAvatar(compressed);
    } catch (err) {
      setError('Failed to process image. Please try a different file.');
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      const { data } = await api.put('/users/profile', { username, about, avatar });
      if (data.success) {
        updateUser(data.data);
        onClose();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const EditableField = ({ label, value, setValue, editing, setEditing }) => (
    <div style={{
      padding: '16px 24px',
      borderBottom: '1px solid var(--divider)',
      backgroundColor: 'var(--bg-main)'
    }}>
      <p style={{ fontSize: '12px', color: 'var(--accent)', marginBottom: '8px', fontWeight: '500' }}>
        {label}
      </p>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {editing ? (
          <>
            <input
              autoFocus
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') setEditing(false); }}
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                borderBottom: '1px solid var(--accent)',
                color: 'var(--text)',
                fontSize: '16px',
                outline: 'none',
                paddingBottom: '4px'
              }}
            />
            <Check
              size={20}
              color="var(--accent)"
              style={{ cursor: 'pointer', flexShrink: 0 }}
              onClick={() => setEditing(false)}
            />
          </>
        ) : (
          <>
            <span style={{ flex: 1, fontSize: '16px', color: 'var(--text)' }}>{value}</span>
            <Pencil
              size={18}
              color="var(--text-secondary)"
              style={{ cursor: 'pointer', flexShrink: 0 }}
              onClick={() => setEditing(true)}
            />
          </>
        )}
      </div>
    </div>
  );

  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'var(--bg-main)',
      zIndex: 50,
      display: 'flex',
      flexDirection: 'column',
      animation: 'slideInLeft 0.25s ease-out'
    }}>
      {/* Header */}
      <div style={{
        padding: '16px 24px',
        backgroundColor: 'var(--accent)',
        display: 'flex',
        alignItems: 'center',
        gap: '24px'
      }}>
        <X size={24} color="#fff" style={{ cursor: 'pointer' }} onClick={onClose} />
        <h2 style={{ fontSize: '18px', fontWeight: '500', color: '#fff', margin: 0 }}>Profile</h2>
      </div>

      {/* Avatar upload section */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '40px 24px 32px',
        backgroundColor: 'var(--bg-sidebar)',
        borderBottom: '8px solid var(--bg-main)'
      }}>
        <div style={{ position: 'relative', cursor: 'pointer' }} onClick={() => fileInputRef.current?.click()}>
          <div style={{
            width: '160px',
            height: '160px',
            borderRadius: '50%',
            overflow: 'hidden',
            backgroundColor: 'var(--bg-main)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {avatar
              ? <img src={avatar} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <User size={80} color="var(--text-secondary)" />
            }
          </div>
          {/* Camera overlay */}
          <div style={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            width: '160px',
            height: '160px',
            borderRadius: '50%',
            backgroundColor: 'rgba(0,0,0,0.55)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            opacity: 0,
            transition: 'opacity 0.2s',
            left: 0,
          }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = 1}
            onMouseLeave={(e) => e.currentTarget.style.opacity = 0}
          >
            <Camera size={32} color="#fff" />
            <span style={{ color: '#fff', fontSize: '12px', fontWeight: '500' }}>CHANGE<br />PROFILE PHOTO</span>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleAvatarChange}
        />

        {/* Remove photo option */}
        {avatar && (
          <button
            onClick={() => setAvatar('')}
            style={{
              marginTop: '12px',
              background: 'none',
              border: 'none',
              color: '#F25C54',
              fontSize: '13px',
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            Remove profile photo
          </button>
        )}
      </div>

      {/* Editable Fields */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <div style={{ height: '24px' }} />
        <EditableField 
          label="YOUR NAME"
          value={username}
          setValue={setUsername}
          editing={editingUsername}
          setEditing={setEditingUsername}
        />
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', padding: '12px 24px 0' }}>
          This is not your username or pin. This name will be visible to your PingChat contacts.
        </p>

        <div style={{ height: '24px' }} />
        <EditableField 
          label="ABOUT"
          value={about}
          setValue={setAbout}
          editing={editingAbout}
          setEditing={setEditingAbout}
        />

        <div style={{ height: '24px' }} />
        <div style={{ padding: '0 24px' }}>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>Email</p>
          <p style={{ fontSize: '16px', color: 'var(--text)' }}>{user?.email}</p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div style={{ padding: '12px 24px', backgroundColor: '#FF4B4B22', color: '#FF4B4B', fontSize: '14px' }}>
          {error}
        </div>
      )}

      {/* Save Button */}
      <div style={{ padding: '16px 24px', borderTop: '1px solid var(--divider)' }}>
        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            width: '100%',
            padding: '14px',
            backgroundColor: 'var(--accent)',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            fontSize: '15px',
            fontWeight: '600',
            cursor: saving ? 'not-allowed' : 'pointer',
            opacity: saving ? 0.6 : 1,
            transition: 'opacity 0.2s'
          }}
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <style>{`
        @keyframes slideInLeft {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </div>
  );
};

export default UserProfile;
