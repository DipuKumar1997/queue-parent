import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

const BACKEND_URI_PROTECTED = process.env.REACT_APP_BACKEND_URI_PROTECTED || "http://localhost:8084";
const AUTH_SERVICE_BASE_URL = `${BACKEND_URI_PROTECTED}/api/v1/auth`;

function VerifyOtpPage() {
  const [otp, setOtp] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const phone = location.state?.phone || '';

  useEffect(() => {
    if (!phone) {
      setMessage('Phone number not provided. Please go back to the login page.');
    }
  }, [phone]);

  const handleVerifyOtp = async () => {
    setMessage('');

    if (!otp.trim() || !phone.trim()) {
      setMessage('Please enter OTP and ensure phone number is present.');
      return;
    }

    try {
      // Step 1: Verify OTP
      const authResponse = await axios.post(`${AUTH_SERVICE_BASE_URL}/verify-otp`, {phone, otp });

      const { accessToken, user } = authResponse.data;
      const userId = user?.id;

      if (accessToken && userId) {
        // --- FOR ONLY LOCAL TESTING STORE ALL USER DATA ---
        localStorage.setItem('jwtToken', accessToken);
        localStorage.setItem('currentUserId', userId);
        // This line makes the "Logged in as" header work!
        localStorage.setItem('currentUserPhone', phone);

        setMessage('OTP verified! Provisioning chat...');

        try {
          // Step 2: Provision Chat User
          // Calling Gateway (8084) which routes to Chat Service with the authorization
          await axios.post(`${BACKEND_URI_PROTECTED}/api/v1/users/provision`, { id: userId,  phone: phone, }, {
            headers: { 'Content-Type': 'application/json',  'Authorization': `Bearer ${accessToken}`},
            withCredentials: true
          });

          console.log("Provisioning successful");
        } catch (provisionErr) {
          console.error('Provisioning failed but continuing to chat:', provisionErr);
          // We don't block the user if they are already authenticated but provisioning fails
        }

        // Redirect
        navigate('/chat');
      } else {
        setMessage('Error: Invalid response from server.');
      }

    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Failed to verify OTP.';
      setMessage(`Error: ${errorMsg}`);
      console.error('Verify OTP error:', err);
    }
  };

  return (
    <div style={{ padding: '40px',  fontFamily: 'Segoe UI, sans-serif',  maxWidth: '400px',  margin: '50px auto',  border: '1px solid #ddd',  borderRadius: '8px',  boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
      <h2 style={{ marginTop: 0, color: '#333' }}>Verify OTP</h2>
      {phone ? ( <p style={{ color: '#666' }}> We've sent a code to: <br/> <strong style={{ color: '#0084ff', fontSize: '1.1em' }}>{phone}</strong> </p> ) : ( <p style={{ color: 'red' }}>No phone number found.</p> )}

      <div style={{ marginTop: '20px' }}>
        <input  type="text"  placeholder="6-digit OTP"  value={otp}  onChange={(e) => setOtp(e.target.value)}  style={{ padding: '12px',  width: '100%',  boxSizing: 'border-box',  borderRadius: '4px',  border: '1px solid #ccc',  fontSize: '16px',  textAlign: 'center',  letterSpacing: '4px' }} />
        <button  onClick={handleVerifyOtp} disabled={!phone || otp.length < 4} style={{ width: '100%',  marginTop: '15px',  cursor: (phone && otp.length >= 4) ? 'pointer' : 'not-allowed',  padding: '12px',  backgroundColor: '#0084ff',  color: 'white',  border: 'none',  borderRadius: '4px',  fontWeight: 'bold',  transition: 'background 0.2s' }}
          onMouseOver={(e) => e.target.style.backgroundColor = '#0073e6'}
          onMouseOut={(e) => e.target.style.backgroundColor = '#0084ff'}
        >
          Verify & Continue
        </button>
      </div>

      {message && (
        <div style={{ marginTop: '20px',  padding: '10px',  borderRadius: '4px',  fontSize: '14px',  backgroundColor: message.startsWith('Error') ? '#fff1f0' : '#f6ffed',  color: message.startsWith('Error') ? '#cf1322' : '#389e0d',  border: `1px solid ${message.startsWith('Error') ? '#ffa39e' : '#b7eb8f'}` }}>
          {message}
        </div>
      )}
    </div>
  );
}

export default VerifyOtpPage;