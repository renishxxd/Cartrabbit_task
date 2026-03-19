import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthCard from '../components/AuthCard';
import InputField from '../components/InputField';
import SubmitButton from '../components/SubmitButton';
import api from '../services/api';

const Register = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    otp: ''
  });
  
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const validateStep1 = () => {
    const newErrors = {};
    
    if (!formData.username) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3 || formData.username.length > 20) {
      newErrors.username = 'Username must be between 3 and 20 characters';
    } else if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(formData.username)) {
      newErrors.username = 'Cannot start with a number. Only letters, numbers, and underscores allowed.';
    }
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/.test(formData.email)) {
      newErrors.email = 'Valid email is required';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(formData.password)) {
      newErrors.password = 'Must be 8+ chars and include 1 uppercase, 1 lowercase, 1 number, and 1 special character';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};
    if (!formData.otp) {
      newErrors.otp = 'OTP is required';
    } else if (formData.otp.length !== 6) {
      newErrors.otp = 'OTP must be 6 digits';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: ''
      });
    }
    setApiError('');
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!validateStep1()) return;

    setIsLoading(true);
    setApiError('');
    setSuccessMsg('');

    try {
      const { data } = await api.post('/auth/send-otp', {
        username: formData.username,
        email: formData.email,
      });
      
      setSuccessMsg(data.message || 'OTP sent to your email!');
      setStep(2);
    } catch (error) {
      setApiError(
        error.response && error.response.data.message
          ? error.response.data.message
          : 'Failed to send OTP. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!validateStep2()) return;

    setIsLoading(true);
    setApiError('');
    setSuccessMsg('');

    try {
      const { data } = await api.post('/auth/register', {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        otp: formData.otp
      });
      
      setSuccessMsg('Registration successful! Redirecting to login...');
      
      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 2000);
      
    } catch (error) {
      setApiError(
        error.response && error.response.data.message
          ? error.response.data.message
          : 'Registration failed. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const footer = (
    <span>
      Already have an account?{' '}
      <Link to="/login" style={{ fontWeight: '500' }}>
        Log in
      </Link>
    </span>
  );

  return (
    <AuthCard title={step === 1 ? "Create Account" : "Verify Email"} footer={footer} error={apiError} success={successMsg}>
      {step === 1 ? (
        <form onSubmit={handleSendOtp}>
          <InputField
            label="Username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            placeholder="Choose a username"
            error={errors.username}
          />
          <InputField
            label="Email Address"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter your email"
            error={errors.email}
          />
          <InputField
            label="Password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Create a password"
            error={errors.password}
          />
          <InputField
            label="Confirm Password"
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Confirm your password"
            error={errors.confirmPassword}
          />
          
          <div style={{ marginTop: '24px' }}>
            <SubmitButton isLoading={isLoading}>
              Send Verification Code
            </SubmitButton>
          </div>
        </form>
      ) : (
        <form onSubmit={handleRegister}>
          <p style={{ marginBottom: '20px', fontSize: '14px', color: 'var(--text-secondary)' }}>
            We've sent a 6-digit verification code to <strong>{formData.email}</strong>. Please enter it below.
          </p>
          <InputField
            label="Verification Code (OTP)"
            name="otp"
            value={formData.otp}
            onChange={handleChange}
            placeholder="Enter 6-digit code"
            error={errors.otp}
            maxLength="6"
          />
          
          <div style={{ marginTop: '24px', display: 'flex', gap: '12px' }}>
            <button
              type="button"
              onClick={() => {
                setStep(1);
                setSuccessMsg('');
                setApiError('');
              }}
              style={{
                flex: 1,
                padding: '12px',
                borderRadius: '8px',
                backgroundColor: 'transparent',
                border: '1px solid var(--text-secondary)',
                color: 'var(--text)',
                cursor: 'pointer',
                fontWeight: '500'
              }}
            >
              Back
            </button>
            <div style={{ flex: 2 }}>
              <SubmitButton isLoading={isLoading}>
                Verify & Register
              </SubmitButton>
            </div>
          </div>
        </form>
      )}
    </AuthCard>
  );
};

export default Register;
