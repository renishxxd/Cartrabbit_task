import React, { useState, useEffect, useRef } from 'react';
import { Send, Paperclip, Smile, X, Loader, Mic, Trash2 } from 'lucide-react';
import EmojiPicker from 'emoji-picker-react';
import api from '../services/api';
import { useSocket } from '../services/useSocket';

const MessageInput = ({ inputText, setInputText, handleSend, activeChat }) => {
  const { socket } = useSocket();
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  
  const pickerRef = useRef(null);
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerIntervalRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isRecording) {
      discardRecording();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeChat]);

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
    
    // Stop typing immediately when sent
    if (isTyping && socket && activeChat) {
      socket.emit('stop_typing', { to: activeChat.id, isGroup: activeChat.isGroup });
      setIsTyping(false);
      clearTimeout(typingTimeoutRef.current);
    }
  };

  const handleInputChange = (e) => {
    setInputText(e.target.value);

    // Typing Indicator Logic
    if (socket && activeChat) {
      if (!isTyping) {
        setIsTyping(true);
        socket.emit('typing', { to: activeChat.id, isGroup: activeChat.isGroup });
      }

      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
        socket.emit('stop_typing', { to: activeChat.id, isGroup: activeChat.isGroup });
      }, 2000);
    }
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSendClick();
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        stream.getTracks().forEach(track => track.stop()); // release mic
        if (audioBlob.size > 0 && !window.discardRecordingInProgress) {
          sendVoiceMessage(audioBlob);
        }
      };

      mediaRecorderRef.current.start(200);
      setIsRecording(true);
      setRecordingTime(0);
      window.discardRecordingInProgress = false;
      
      timerIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
    } catch (err) {
      alert('Microphone access denied or not available.');
    }
  };

  const stopRecordingAndSend = () => {
    if (mediaRecorderRef.current && isRecording) {
      clearInterval(timerIntervalRef.current);
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const discardRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      clearInterval(timerIntervalRef.current);
      window.discardRecordingInProgress = true;
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setRecordingTime(0);
    }
  };

  const sendVoiceMessage = async (blob) => {
    setIsUploading(true);
    const file = new File([blob], `voice-message-${Date.now()}.webm`, { type: 'audio/webm' });
    const formData = new FormData();
    formData.append('media', file);

    try {
      const { data } = await api.post('/messages/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      const mediaData = {
        url: data.data.url,
        type: 'audio',
        metadata: {
          filename: data.data.filename,
          size: data.data.size,
          format: data.data.format
        }
      };
      
      handleSend('', mediaData);
    } catch (err) {
      console.error("Upload failed", err);
      alert('Failed to send voice message');
    }
    setIsUploading(false);
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
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
        <div style={{ display: 'flex', alignItems: 'center', width: '100%', minHeight: '24px' }}>
          {isRecording ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#ff4d4f', animation: 'pulse 1.5s infinite' }} />
                <span style={{ color: 'var(--text)', fontSize: '15px', fontFamily: 'monospace' }}>
                  {formatTime(recordingTime)}
                </span>
              </div>
              <Trash2 
                size={20} 
                color="var(--text-secondary)" 
                style={{ cursor: 'pointer', transition: 'color 0.2s' }} 
                onClick={discardRecording}
                onMouseEnter={e => e.currentTarget.style.color = '#ff4d4f'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
              />
            </div>
          ) : (
            <input 
              type="text"
              value={inputText}
              onChange={handleInputChange}
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
          )}
        </div>
      </div>

      <button 
        onClick={isRecording ? stopRecordingAndSend : (inputText.trim() || selectedFile ? onSendClick : startRecording)}
        disabled={isUploading}
        style={{ 
          background: (inputText.trim() || selectedFile || isRecording) ? 'var(--accent)' : 'var(--bg-chat)', 
          border: 'none', 
          cursor: isUploading ? 'default' : 'pointer', 
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
        {isUploading ? (
          <Loader size={18} style={{ animation: 'spin 1s linear infinite' }} />
        ) : (inputText.trim() || selectedFile || isRecording) ? (
          <Send size={18} style={{ marginLeft: '2px' }} />
        ) : (
          <Mic size={18} />
        )}
      </button>
    </div>
  );
};

export default MessageInput;
