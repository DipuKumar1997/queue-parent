// import React, { useState, useEffect } from 'react';
// import { useNavigate, useLocation } from 'react-router-dom';
// import axios from 'axios';

// const BACKEND_URI_PROTECTED = process.env.REACT_APP_BACKEND_URI_PROTECTED;
// const AUTH_SERVICE_BASE_URL = `${BACKEND_URI_PROTECTED}/api/v1/auth`;
// const CHAT_SERVICE_BASE_URL = `${BACKEND_URI_PROTECTED}/api/v1/users`;

// console.log("AUTH_SERVICE_BASE_URL"+AUTH_SERVICE_BASE_URL);
// console.log("CHAT_SERVICE_BASE_URL"+CHAT_SERVICE_BASE_URL);
// function VerifyOtpPage() {
//   const [otp, setOtp] = useState('');
//   const [message, setMessage] = useState('');
//   const navigate = useNavigate();
//   const location = useLocation();
//   const phone = location.state?.phone || '';

//   useEffect(() => {
//     if (!phone) {
//       setMessage('Phone number not provided. Please go back to the login page.');
//     }
//   }, [phone]);

//   const handleVerifyOtp = async () => {
//     setMessage('');

//     if (!otp.trim() || !phone.trim()) {
//       setMessage('Please enter OTP and ensure phone number is present.');
//       return;
//     }
//     console.log("Payload:", { phone, otp });  // Make sure variables are as expected


//     try {
//       const authResponse = await axios.post(`${AUTH_SERVICE_BASE_URL}/verify-otp`, {
//         phone,
//         otp
//       });
//       console.log(authResponse);
//     //   console.log(authResponse);
      
//       const { accessToken } = authResponse.data;
//       console.log(authResponse.data.user);
//       const userId=authResponse.data.user.id;

//       console.log("accessToken " + accessToken);
//       console.log("currentUserId "+ userId);

//       if (accessToken && userId) {
//         localStorage.setItem('jwtToken', accessToken);
//         localStorage.setItem('currentUserId', userId);

//         setMessage('OTP verified successfully! Provisioning chat user...');
// //  username: username || phone
//         try {
//           await axios.post(`${CHAT_SERVICE_BASE_URL}/provision`, {
//             id: userId,
//             phone: phone,
//           }, {
//             headers: {
//               'Content-Type': 'application/json',
//               'Authorization': `Bearer ${accessToken}`
//             }
//           });

//           setMessage('User provisioned. Redirecting to chat...');
//         } catch (provisionErr) {
//           console.error('Provisioning failed:', provisionErr);
//           setMessage(`Warning: Chat provisioning failed. Proceeding to chat.`);
//         }

//         navigate('/chat');
//       } else {
//         setMessage('Error: Access token or user ID not received.');
//       }

//     } catch (err) {
//       if (err.response) {
//         setMessage(`Error: ${err.response.data.message || 'Failed to verify OTP.'}`);
//       } else if (err.request) {
//         setMessage('Network error: No response from server.');
//       } else {
//         setMessage(`Error: ${err.message}`);
//       }
//       console.error('Verify OTP error:', err);
//     }
//   };

//   return (
//     <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
//       <h2>Verify OTP</h2>
//       {phone
//         ? <p>OTP sent to: <strong>{phone}</strong></p>
//         : <p style={{ color: 'red' }}>No phone number provided. Go back to <a href="/">Login</a>.</p>
//       }

//       <input type="text" placeholder="Enter OTP" value={otp} onChange={(e) => setOtp(e.target.value)} style={{ padding: '8px', marginRight: '10px', border: '1px solid #ccc' }}/>
//       <button onClick={handleVerifyOtp} disabled={!phone} style={{ cursor: phone ? 'pointer' : 'not-allowed', padding: '8px 15px',backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px'}}>
//         Verify OTP
//       </button>

//       {message && (
//         <p style={{ color: message.startsWith('Error') || message.startsWith('Warning') ? 'red' : 'green' }}>
//           {message}
//         </p>
//       )}
//     </div>
//   );
// }

// export default VerifyOtpPage;


import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

const BACKEND_URI_PROTECTED = process.env.REACT_APP_BACKEND_URI_PROTECTED;
const AUTH_SERVICE_BASE_URL = `${BACKEND_URI_PROTECTED}/api/v1/auth`;
const CHAT_SERVICE_BASE_URL = `${BACKEND_URI_PROTECTED}/api/v1/users`;

console.log("AUTH_SERVICE_BASE_URL", AUTH_SERVICE_BASE_URL);
console.log("CHAT_SERVICE_BASE_URL", CHAT_SERVICE_BASE_URL);

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
    console.log("Payload:", { phone, otp });

    try {
      // Step 1: Verify OTP and get the token
      const authResponse = await axios.post(`${AUTH_SERVICE_BASE_URL}/verify-otp`, {
        phone,
        otp
      });
      console.log('Auth Response:', authResponse);

      const { accessToken, user } = authResponse.data;
      const userId = user?.id; // Safely access user.id

      if (accessToken && userId) {
        // Step 2: Store the token and userId in localStorage
        localStorage.setItem('jwtToken', accessToken);
        localStorage.setItem('currentUserId', userId);

        setMessage('OTP verified successfully! Provisioning chat user...');

        try {
          // Step 3: Retrieve token from localStorage for the provisioning call
          const storedToken = localStorage.getItem('jwtToken');
          console.log("TOKEN BEING SENT:", storedToken);
          const storedUserId = localStorage.getItem('currentUserId');

          if (!storedToken || !storedUserId) {
            setMessage('Error: JWT token or User ID not found in local storage after saving.');
            return;
          }
            console.log("JWT Token:", storedToken);
            console.log("Full Axios Headers:", {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${storedToken}`
            });

          // await axios.post(`http://localhost:8084/api/v1/users/provision`, {
          //   id: storedUserId, // Use userId from localStorage
          //   phone: phone,
          // }, {
          //   headers: {
          //     'Content-Type': 'application/json',
          //     'Authorization': `Bearer ${storedToken}` // Use token from localStorage
          //   }, withCredentials: true // ✅ ADD THIS
          // });

          setMessage('User provisioned. Redirecting to chat...');
        } catch (provisionErr) {
          console.error('Provisioning failed:', provisionErr);
          // Check if it's an authorization error specifically
          if (provisionErr.response && provisionErr.response.status === 401) {
            setMessage('Warning: Chat provisioning failed due to unauthorized access. Token issue?');
          } else if (provisionErr.response && provisionErr.response.status === 403) {
            setMessage('Warning: Chat provisioning failed due to forbidden access. Permissions issue?');
          } else if (provisionErr.response && provisionErr.response.status === 400) {
            setMessage('Warning: Chat provisioning failed due to bad request. Data issue?');
          } else {
             setMessage(`Warning: Chat provisioning failed: ${provisionErr.message}. Proceeding to chat.`);
          }
        }

        // Even if provisioning warns, still navigate if the main auth was successful
        navigate('/chat'); 
      } else {
        setMessage('Error: Access token or user ID not received from OTP verification.');
      }

    } catch (err) {
      if (err.response) {
        setMessage(`Error: ${err.response.data.message || 'Failed to verify OTP.'}`);
      } else if (err.request) {
        setMessage('Network error: No response from server.');
      } else {
        setMessage(`Error: ${err.message}`);
      }
      console.error('Verify OTP error:', err);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h2>Verify OTP</h2>
      {phone
        ? <p>OTP sent to: <strong>{phone}</strong></p>
        : <p style={{ color: 'red' }}>No phone number provided. Go back to <a href="/">Login</a>.</p>
      }

      <input
        type="text"
        placeholder="Enter OTP"
        value={otp}
        onChange={(e) => setOtp(e.target.value)}
        style={{ padding: '8px', marginRight: '10px', border: '1px solid #ccc' }}
      />
      <button
        onClick={handleVerifyOtp}
        disabled={!phone}
        style={{
          cursor: phone ? 'pointer' : 'not-allowed',
          padding: '8px 15px',
          backgroundColor: '#28a745',
          color: 'white',
          border: 'none',
          borderRadius: '4px'
        }}
      >
        Verify OTP
      </button>

      {message && (
        <p style={{ color: message.startsWith('Error') || message.startsWith('Warning') ? 'red' : 'green' }}>
          {message}
        </p>
      )}
    </div>
  );
}

export default VerifyOtpPage;