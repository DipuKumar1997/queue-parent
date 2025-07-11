import React, { useState } from 'react';

// Main App component
export default function App() {
  const [otpRecipient, setOtpRecipient] = useState('');
  const [message, setMessage] = useState('Enter a recipient and click "Send OTP".');
  const [messageType, setMessageType] = useState('info'); // 'info', 'success', 'error'

  // Function to handle sending OTP
  const handleSendOtp = async () => {
    setMessage('Sending OTP...');
    setMessageType('info');
    console.log(`Attempting to send OTP for: ${otpRecipient}`);
    console.log(`Sending POST request to: http://localhost:8084/api/v1/auth/send-otp`); // Adjust endpoint as per your Auth Service

    try {
      const response = await fetch('http://localhost:8084/api/v1/auth/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // If your frontend sends an Authorization header (e.g., JWT), include it here:
          // 'Authorization': 'Bearer your_jwt_token_here'
        },
        // Assuming your backend expects a JSON body like { "recipient": "user@example.com" }
        body: JSON.stringify({ recipient: otpRecipient }),
      });

      console.log('Response Status:', response.status);
      console.log('Response Headers:', response.headers);

      const data = await response.text(); // Get raw text, parse later if needed
      console.log('Response Body:', data);

      if (response.ok) { // Status codes 200-299
        setMessage(`OTP sent successfully! Response: ${data}`);
        setMessageType('success');
      } else {
        // If the request was blocked by CORS, 'response.ok' might be false,
        // or the fetch might throw an error directly.
        setMessage(`Error sending OTP! Status: ${response.status}. Body: ${data || 'No response body'}`);
        setMessageType('error');
        // Check for specific CORS error in console if this happens
        console.error('Non-OK response:', response);
      }
    } catch (error) {
      console.error('Fetch error:', error);
      setMessage(`Network error or CORS issue: ${error.message}. Check browser console for details.`);
      setMessageType('error');
      // This is where browser-specific CORS errors will appear
    }
  };

  // Determine message box styling based on messageType
  const messageBoxClasses = {
    info: 'bg-blue-100 border-blue-300 text-blue-800',
    success: 'bg-green-100 border-green-300 text-green-800',
    error: 'bg-red-100 border-red-300 text-red-800',
  };

  return (

    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4 font-inter">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-6 text-center">Send OTP Test</h1>
        <p className="text-gray-600 mb-6 text-center">
          This app sends a POST request to your API Gateway's auth service. Ensure your backend is running on
          <code className="bg-gray-100 p-1 rounded">http://localhost:8084</code>
          and the Auth Service on
          <code className="bg-gray-100 p-1 rounded">http://localhost:8081</code>
          with the correct endpoint (e.g., <code className="bg-gray-100 p-1 rounded">/api/v1/auth/send-otp</code>).
        </p>

        <div className="mb-4">
          <label htmlFor="otpRecipient" className="block text-gray-700 text-sm font-medium mb-2">
            Recipient (Email/Phone)
          </label>
          <input
            type="text"
            id="otpRecipient"
            className="shadow-sm appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
            placeholder="e.g., user@example.com or +1234567890"
            value={otpRecipient}
            onChange={(e) => setOtpRecipient(e.target.value)}
          />
        </div>

        <button
          onClick={handleSendOtp}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75"
        >
          Send OTP
        </button>

        <div className={`mt-6 p-4 border rounded-lg ${messageBoxClasses[messageType]} text-sm leading-relaxed whitespace-pre-wrap`}>
          {message}
        </div>

        <p className="text-xs text-gray-500 mt-4 text-center">
          Remember to open your browser's developer console (F12 or Cmd+Option+I) to see detailed network logs and potential CORS errors.
        </p>
      </div>
    </div>

    
  );
}
