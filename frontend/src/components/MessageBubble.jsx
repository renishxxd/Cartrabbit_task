import React, { useState } from 'react';
import { FileText, Download, Check, CheckCheck, Pencil, Trash2, X } from 'lucide-react';

const getDownloadUrl = (url) => {
  if (!url) return '';
  return url.replace('/upload/', '/upload/fl_attachment/');
};

const MessageBubble = ({ message, isOwn, isSelecting, isSelected, onToggleSelect, onEditSubmit, onDelete }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState('');

  const startEditing = () => {
    setEditText(message.text || '');
    setIsEditing(true);
  };

  const submitEdit = () => {
    if (editText.trim() && editText !== message.text) {
      onEditSubmit(message.id, editText.trim());
    }
    setIsEditing(false);
  };

  return (
    <div 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
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
        {isOwn && !message.isDeleted && isHovered && !isSelecting && !isEditing && (
          <div style={{
            position: 'absolute',
            top: '-12px',
            right: '0',
            backgroundColor: 'var(--bg-sidebar)',
            borderRadius: '12px',
            padding: '4px 8px',
            display: 'flex',
            gap: '8px',
            boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
            zIndex: 10
          }}>
            <Pencil size={14} color="var(--text-secondary)" style={{ cursor: 'pointer' }} onClick={startEditing} />
            <Trash2 size={14} color="var(--text-secondary)" style={{ cursor: 'pointer' }} onClick={() => onDelete(message.id)} />
          </div>
        )}

        {message.mediaUrl && !message.isDeleted && (
          <div style={{ marginBottom: message.text ? '8px' : '0' }}>
            {message.mediaType === 'image' && (
              <div style={{ position: 'relative', display: 'inline-block' }}>
                <img 
                  src={message.mediaUrl} 
                  alt="attachment" 
                  style={{ maxWidth: '100%', borderRadius: '8px', maxHeight: '300px', objectFit: 'contain', display: 'block' }} 
                />
                <a 
                  href={getDownloadUrl(message.mediaUrl)}
                  title="Download"
                  style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    backgroundColor: 'rgba(0,0,0,0.6)',
                    borderRadius: '50%',
                    padding: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    zIndex: 10
                  }}
                >
                  <Download size={16} />
                </a>
              </div>
            )}
            {message.mediaType === 'video' && (
              <div style={{ position: 'relative', display: 'inline-block' }}>
                <video 
                  src={message.mediaUrl} 
                  controls 
                  style={{ maxWidth: '100%', borderRadius: '8px', maxHeight: '300px', outline: 'none', display: 'block' }} 
                />
                <a 
                  href={getDownloadUrl(message.mediaUrl)}
                  title="Download"
                  style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    backgroundColor: 'rgba(0,0,0,0.6)',
                    borderRadius: '50%',
                    padding: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    zIndex: 10
                  }}
                >
                  <Download size={16} />
                </a>
              </div>
            )}
            {message.mediaType === 'audio' && (
              <audio 
                src={message.mediaUrl} 
                controls 
                style={{ width: '250px', maxWidth: '100%', outline: 'none' }} 
              />
            )}
            {message.mediaType === 'document' && (
              <a 
                href={getDownloadUrl(message.mediaUrl)} 
                target="_blank" 
                rel="noopener noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  backgroundColor: 'rgba(0,0,0,0.2)',
                  padding: '12px',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  color: 'var(--text)'
                }}
              >
                <div style={{ padding: '8px', backgroundColor: 'var(--accent)', borderRadius: '50%', display: 'flex' }}>
                  <FileText size={20} color="#fff" />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontSize: '14px', fontWeight: '500', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {message.mediaMetadata?.filename || 'Document'}
                  </p>
                  <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)' }}>
                    {message.mediaMetadata?.size ? (message.mediaMetadata.size / 1024).toFixed(1) + ' KB' : 'Unknown size'} • {message.mediaMetadata?.format?.toUpperCase() || 'FILE'}
                  </p>
                </div>
                <Download size={20} color="var(--text-secondary)" />
              </a>
            )}
          </div>
        )}
        {isEditing ? (
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: message.mediaUrl ? '8px' : '0' }}>
            <input 
              autoFocus
              value={editText}
              onChange={e => setEditText(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') submitEdit(); if (e.key === 'Escape') setIsEditing(false); }}
              style={{ flex: 1, padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--accent)', background: 'var(--bg-main)', color: 'var(--text)', outline: 'none' }}
            />
            <Check size={16} color="var(--accent)" style={{ cursor: 'pointer', flexShrink: 0 }} onClick={submitEdit} />
            <X size={16} color="var(--text-secondary)" style={{ cursor: 'pointer', flexShrink: 0 }} onClick={() => setIsEditing(false)} />
          </div>
        ) : (
          message.text && (
            <p style={{ 
              fontSize: '14px', 
              lineHeight: '1.4', 
              margin: '0 0 4px 0',
              color: message.isDeleted ? 'var(--text-secondary)' : 'var(--text)',
              fontStyle: message.isDeleted ? 'italic' : 'normal',
              wordWrap: 'break-word',
              whiteSpace: 'pre-wrap'
            }}>
              {message.text}
            </p>
          )
        )}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'flex-end', 
          alignItems: 'center', 
          gap: '4px',
          marginTop: '2px'
        }}>
          <span style={{ 
            fontSize: '11px', 
            color: 'var(--text-secondary)'
          }}>
            {message.time} {message.isEdited && !message.isDeleted && '(edited)'}
          </span>
          {isOwn && (
            <span style={{ display: 'flex', alignItems: 'center' }}>
              {(!message.status || message.status === 'sent') && <Check size={14} color="var(--text-secondary)" />}
              {message.status === 'delivered' && <CheckCheck size={14} color="var(--text-secondary)" />}
              {message.status === 'read' && <CheckCheck size={14} color="#53bdeb" />}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
