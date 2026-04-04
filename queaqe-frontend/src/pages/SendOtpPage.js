import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API_GATEWAY_BASE_URL = 'http://localhost:8084';
console.log(`API Gateway Base URL: ${API_GATEWAY_BASE_URL}`);

/**
 * SendOtpPage Component
 * Allows users to input a phone number and request an OTP.
 */
function SendOtpPage() {
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false); // State for loading indicator
  const navigate = useNavigate();

  /**
   * Handles the OTP sending process.
   * Sends a POST request to the API Gateway's send-otp endpoint using native fetch API.
   */
  const handleSendOtp = async () => {
    setMessage(''); // Clear previous messages
    if (!phone) {
      setMessage('Error: Please enter your phone number.');
      return;
    }

    setIsLoading(true); // Start loading
    console.log(`Attempting to send OTP to phone: ${phone}`);

    try {
      // Construct the full URL using the API Gateway base URL
      const fullUrl = `${API_GATEWAY_BASE_URL}/api/v1/auth/send-otp`;
      console.log(`Requesting URL: ${fullUrl}`);

      const response = await fetch(fullUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone }), // Send phone as JSON
      });

      console.log("Raw response object:", response);

      if (response.ok) {
        // Response is successful (2xx status code)
        // Attempt to parse response as JSON.
        // If the backend sends "OTP sent" as plain text with Content-Type: text/plain,
        // .json() will throw an error, so we catch it and use .text() instead.
        let successMessage = 'OTP sent successfully!';
        try {
          const data = await response.json();
          // Assume the backend now sends a JSON object like { "message": "OTP sent successfully!" }
          successMessage = data.message || successMessage;
        } catch (jsonError) {
          // If the response is not valid JSON, but still a 2xx status, treat it as plain text
          const textData = await response.text();
          successMessage = textData || successMessage;
          console.warn("Successful response was not JSON. Raw text:", textData);
        }
        setMessage(successMessage);
        console.log("Setting message after success: " + successMessage);
        navigate('/verify-otp', { state: { phone } });

      } else {
        // Response is not successful (e.g., 4xx or 5xx status code)
        let errorMsg = 'Failed to send OTP.';
        try {
          // Attempt to parse error response as JSON for detailed messages
          const errorData = await response.json();
          errorMsg = errorData.message || errorData.error || errorMsg; // Common fields for error messages
        } catch (jsonError) {
          // If error response is not JSON, use the status text or a generic message
          errorMsg = response.statusText || errorMsg;
        }
        setMessage(`Error: ${errorMsg}`);
        console.error("API Error Response Status:", response.status, "Message:", errorMsg);
      }
    } catch (error) {
      // Network errors (e.g., CORS, no connection to API Gateway, DNS issues)
      console.error("Network or fetch error:", error);
      setMessage(`Network error: ${error.message || 'Could not connect to the API Gateway.'}`);
    } finally {
      setIsLoading(false); // End loading
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h2>Login / Request OTP</h2>
      <input type="text"  placeholder="Enter phone number"  value={phone}  onChange={(e) => setPhone(e.target.value)}  style={{ padding: '8px',  marginRight: '10px',  border: '1px solid #ccc' }} />
      <button  onClick={handleSendOtp} style={{ padding: '8px 15px',  cursor: 'pointer',  backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px'}} > Send OTP </button>
      {message && ( <p style={{ color: message.startsWith('Error') ? 'red' : 'green' }}> {message}</p> )}
    </div>
  );
}

export default SendOtpPage;
