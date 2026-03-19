import React from 'react';

const AuthCard = ({ title, children, footer, error, success }) => {
  return (
    <div style={{
      backgroundColor: 'var(--bg-sidebar)',
      borderRadius: '12px',
      padding: '32px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.3), 0 1px 2px rgba(0,0,0,0.2)',
      width: '100%',
      maxWidth: '400px',
      boxSizing: 'border-box'
    }}>
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <h2 style={{ color: 'var(--text)', fontSize: '24px', fontWeight: '500', marginBottom: '8px' }}>
          {title}
        </h2>
        <div style={{ width: '40px', height: '4px', backgroundColor: 'var(--accent)', margin: '0 auto', borderRadius: '2px' }}></div>
      </div>

      {error && (
        <div style={{
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          borderLeft: '4px solid #ef4444',
          color: '#fca5a5',
          padding: '12px',
          borderRadius: '4px',
          marginBottom: '20px',
          fontSize: '14px'
        }}>
          {error}
        </div>
      )}

      {success && (
        <div style={{
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          borderLeft: '4px solid #10b981',
          color: '#6ee7b7',
          padding: '12px',
          borderRadius: '4px',
          marginBottom: '20px',
          fontSize: '14px'
        }}>
          {success}
        </div>
      )}

      {children}

      {footer && (
        <div style={{
          marginTop: '24px',
          textAlign: 'center',
          color: 'var(--text-secondary)',
          fontSize: '14px'
        }}>
          {footer}
        </div>
      )}
    </div>
  );
};

export default AuthCard;
