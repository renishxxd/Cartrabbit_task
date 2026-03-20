import React, { useState, useEffect, useRef } from 'react';
import { Send, Paperclip, Smile, X, Loader } from 'lucide-react';
import EmojiPicker from 'emoji-picker-react';
import api from '../services/api';

const MessageInput = ({ inputText, setInputText, handleSend }) => {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const pickerRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const onEmojiClick = (emojiObject) => {
    setInputText(prev => prev + emojiObject.emoji);
  };

  const determineMediaType = (file) => {
    if (file.type.startsWith('image/')) return 'image';
    if (file.type.startsWith('video/')) return 'video';
    if (file.type.startsWith('audio/')) return 'audio';
    return 'document';
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
    // reset input so the same file can be selected again if removed
    e.target.value = null;
  };

  const onSendClick = async () => {
    if (!inputText.trim() && !selectedFile) return;

    let mediaData = null;
    if (selectedFile) {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('media', selectedFile);

      try {
        const { data } = await api.post('/messages/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        
        mediaData = {
          url: data.data.url,
          type: determineMediaType(selectedFile),
          metadata: {
            filename: data.data.filename,
            size: data.data.size,
            format: data.data.format
          }
        };
      } catch (err) {
        console.error("Upload failed", err);
        setIsUploading(false);
        alert('Failed to upload file');
        return; // Stop if upload fails
      }
      setIsUploading(false);
      setSelectedFile(null);
    }

    const textToSend = inputText.trim();
    setInputText(''); 
    handleSend(textToSend, mediaData);
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSendClick();
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
      <div style={{ position: 'relative' }} ref={pickerRef}>
        <button 
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: showEmojiPicker ? 'var(--accent)' : 'var(--text-secondary)', padding: '4px', display: 'flex' }}
        >
          <Smile size={24} />
        </button>
        {showEmojiPicker && (
          <div style={{ position: 'absolute', bottom: '50px', left: '0', zIndex: 1000, boxShadow: '0 4px 15px rgba(0,0,0,0.5)' }}>
            <EmojiPicker onEmojiClick={onEmojiClick} theme="dark" />
          </div>
        )}
      </div>
      <input 
        type="file" 
        ref={fileInputRef} 
        style={{ display: 'none' }} 
        onChange={handleFileChange}
      />
      <button 
        onClick={() => fileInputRef.current?.click()}
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: '4px', display: 'flex' }}
      >
        <Paperclip size={24} />
      </button>
      
      <div style={{ 
        flex: 1, 
        backgroundColor: 'var(--bg-chat)', 
        borderRadius: '8px', 
        padding: '10px 16px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
        position: 'relative'
      }}>
        {selectedFile && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '8px 12px',
            backgroundColor: 'var(--bg-main)',
            borderRadius: '6px',
            marginBottom: '8px',
            color: 'var(--text)'
          }}>
            <div style={{ width: '80%', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Paperclip size={16} color="var(--accent)" />
              <span style={{ fontSize: '13px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {selectedFile.name}
              </span>
            </div>
            <X 
              size={18} 
              color="var(--text-secondary)" 
              style={{ cursor: 'pointer' }} 
              onClick={() => setSelectedFile(null)} 
            />
          </div>
        )}
        <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
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
      </div>

      <button 
        onClick={onSendClick}
        disabled={(!inputText.trim() && !selectedFile) || isUploading}
        style={{ 
          background: (inputText.trim() || selectedFile) ? 'var(--accent)' : 'var(--bg-chat)', 
          border: 'none', 
          cursor: (inputText.trim() || selectedFile) && !isUploading ? 'pointer' : 'default', 
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
        {isUploading ? <Loader size={18} style={{ animation: 'spin 1s linear infinite' }} /> : <Send size={18} style={{ marginLeft: (inputText.trim() || selectedFile) ? '2px' : '0' }} />}
      </button>
    </div>
  );
};

export default MessageInput;
