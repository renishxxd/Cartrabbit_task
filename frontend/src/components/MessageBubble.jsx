import React from 'react';
import { FileText, Download } from 'lucide-react';

const getDownloadUrl = (url) => {
  if (!url) return '';
  return url.replace('/upload/', '/upload/fl_attachment/');
};

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
        {message.mediaUrl && (
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
        {message.text && (
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
        )}
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
