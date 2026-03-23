import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthCard from '../components/AuthCard';
import InputField from '../components/InputField';
import SubmitButton from '../components/SubmitButton';
import api from '../services/api';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
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


  const handleRegister = async (e) => {
    e.preventDefault();
    if (!validateStep1()) return;

    setIsLoading(true);
    setApiError('');
    setSuccessMsg('');

    try {
      const { data } = await api.post('/auth/register', {
        username: formData.username,
        email: formData.email,
        password: formData.password
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
    <AuthCard title="Create Account" footer={footer} error={apiError} success={successMsg}>
      <form onSubmit={handleRegister}>
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
            Register
          </SubmitButton>
        </div>
      </form>
    </AuthCard>
  );
};

export default Register;
