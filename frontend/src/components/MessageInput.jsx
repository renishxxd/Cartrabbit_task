import React from 'react';
import { Send, Paperclip, Smile } from 'lucide-react';

const MessageInput = ({ inputText, setInputText, handleSend }) => {
  
  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div style={{
      backgroundColor: 'var(--bg-sidebar)',
      padding: '12px 16px',
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      zIndex: 2
    }}>
      <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: '4px' }}>
        <Smile size={24} />
      </button>
      <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: '4px' }}>
        <Paperclip size={24} />
      </button>
      
      <div style={{ 
        flex: 1, 
        backgroundColor: 'var(--bg-chat)', 
        borderRadius: '8px', 
        padding: '10px 16px',
        display: 'flex',
        alignItems: 'center'
      }}>
        <input 
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Type a message"
          style={{
            width: '100%',
            background: 'transparent',
            border: 'none',
            color: 'var(--text)',
            fontSize: '15px',
            outline: 'none'
          }}
        />
      </div>

      <button 
        onClick={handleSend}
        disabled={!inputText.trim()}
        style={{ 
          background: inputText.trim() ? 'var(--accent)' : 'var(--bg-chat)', 
          border: 'none', 
          cursor: inputText.trim() ? 'pointer' : 'default', 
          color: '#fff',
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'background-color 0.2s',
          flexShrink: 0
        }}
      >
        <Send size={18} style={{ marginLeft: inputText.trim() ? '2px' : '0' }} />
      </button>
    </div>
  );
};

export default MessageInput;
