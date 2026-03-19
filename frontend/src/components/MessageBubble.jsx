import React from 'react';

const MessageBubble = ({ message, isOwn, isSelecting, isSelected, onToggleSelect }) => {
  return (
    <div 
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: isOwn ? 'flex-end' : 'flex-start',
        marginBottom: '12px',
        width: '100%',
        padding: '0 8px',
        backgroundColor: isSelected ? 'rgba(0, 168, 132, 0.2)' : 'transparent',
        transition: 'background-color 0.2s'
      }}
      onClick={() => {
        if (isSelecting) {
          onToggleSelect(message.id);
        }
      }}
    >
      {isSelecting && (
        <div style={{ marginLeft: '8px', marginRight: isOwn ? 'auto' : '16px', cursor: 'pointer' }}>
          <div style={{
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            border: isSelected ? 'none' : '2px solid var(--text-secondary)',
            backgroundColor: isSelected ? 'var(--accent)' : 'transparent',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {isSelected && <div style={{ color: 'white', fontSize: '12px' }}>✓</div>}
          </div>
        </div>
      )}

      <div style={{
        backgroundColor: isOwn ? 'var(--msg-sent)' : 'var(--msg-received)',
        padding: '8px 12px',
        borderRadius: '8px',
        borderTopRightRadius: isOwn ? '0px' : '8px',
        borderTopLeftRadius: isOwn ? '8px' : '0px',
        maxWidth: '65%',
        marginRight: isSelecting && isOwn ? '16px' : '0',
        boxShadow: '0 1px 1px rgba(0,0,0,0.1)',
        position: 'relative'
      }}>
        <p style={{ 
          fontSize: '14px', 
          lineHeight: '1.4', 
          margin: '0 0 4px 0',
          color: 'var(--text)',
          wordWrap: 'break-word',
          whiteSpace: 'pre-wrap'
        }}>
          {message.text}
        </p>
        <span style={{ 
          fontSize: '11px', 
          color: 'var(--text-secondary)',
          display: 'block',
          textAlign: 'right',
          marginTop: '2px'
        }}>
          {message.time}
        </span>
      </div>
    </div>
  );
};

export default MessageBubble;
