import React, { useState } from 'react';

const InputField = ({ label, type = 'text', name, value, onChange, placeholder, required = false, error }) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div style={{ marginBottom: '20px' }}>
      {label && (
        <label 
          htmlFor={name}
          style={{ 
            display: 'block', 
            marginBottom: '8px', 
            fontSize: '14px', 
            color: 'var(--text-secondary)',
            fontWeight: '500'
          }}
        >
          {label}
        </label>
      )}
      <input
        type={type}
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        style={{
          width: '100%',
          padding: '12px 16px',
          backgroundColor: 'var(--bg-chat)',
          border: `1px solid ${error ? '#ef4444' : isFocused ? 'var(--accent)' : 'transparent'}`,
          borderRadius: '8px',
          color: 'var(--text)',
          fontSize: '15px',
          outline: 'none',
          transition: 'all 0.2s ease',
          boxSizing: 'border-box'
        }}
      />
      {error && (
        <p style={{ color: '#ef4444', fontSize: '13px', marginTop: '6px', margin: '4px 0 0 0' }}>
          {error}
        </p>
      )}
    </div>
  );
};

export default InputField;
