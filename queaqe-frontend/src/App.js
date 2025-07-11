// import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import SendOtpPage from './pages/SendOtpPage';
import VerifyOtpPage from './pages/VerifyOtpPage';
import ChatHomePage from './pages/ChatHomePage';
// import ChatHomePage from '../ChatHomePage';
// import ChatComponent from './pages/test';

function App() {
  return (
    <Router>
      <Routes>
        {/* Default route for sending OTP */}
        <Route path="/" element={<SendOtpPage />} />
        {/* Route for verifying OTP */}
        <Route path="/verify-otp" element={<VerifyOtpPage />} />
        {/* Route for the chat home page - protected by check inside component */}
        <Route path="/chat" element={<ChatHomePage />} />
        {/* Fallback for any unmatched routes */}
        {/* <Route path="*" element={<Navigate to="/" replace />} /> */}
      </Routes>
    </Router>
  );
}

export default App;