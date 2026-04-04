import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import SendOtpPage from './pages/SendOtpPage';
import VerifyOtpPage from './pages/VerifyOtpPage';
import ChatHomePage from './pages/ChatHomePage';
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SendOtpPage />} />
        <Route path="/verify-otp" element={<VerifyOtpPage />} />
        <Route path="/chat" element={<ChatHomePage />} />
      </Routes>
    </Router>
  );
}
export default App;
