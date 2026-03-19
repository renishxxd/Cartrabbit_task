import React from 'react';

const SubmitButton = ({ children, isLoading, onClick, disabled, type = 'submit' }) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      style={{
        width: '100%',
        padding: '12px',
        backgroundColor: disabled || isLoading ? 'var(--msg-sent)' : 'var(--accent)',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        fontSize: '16px',
        fontWeight: 'bold',
        cursor: disabled || isLoading ? 'not-allowed' : 'pointer',
        transition: 'background-color 0.2s ease',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        opacity: disabled || isLoading ? 0.7 : 1
      }}
      onMouseOver={(e) => {
        if (!disabled && !isLoading) {
          e.currentTarget.style.backgroundColor = '#00c399';
        }
      }}
      onMouseOut={(e) => {
        if (!disabled && !isLoading) {
          e.currentTarget.style.backgroundColor = 'var(--accent)';
        }
      }}
    >
      {isLoading ? (
        <div style={{
          width: '20px',
          height: '20px',
          border: '2px solid rgba(255,255,255,0.3)',
          borderTop: '2px solid white',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
        }} />
      ) : (
        children
      )}
      
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </button>
  );
};

export default SubmitButton;
