import React, { useEffect, useRef, useState, useCallback } from 'react';
import axios from 'axios';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import './ChatHomePage.css';

const BACKEND_URI = "http://localhost:8084"; // Gateway
const WEBSOCKET_URL = "http://localhost:8082/ws"; // Direct to Chat Service

function ChatHomePage() {
  const jwtToken = localStorage.getItem('jwtToken');
  const currentUserId = localStorage.getItem('currentUserId');
  const currentUserPhone = localStorage.getItem('currentUserPhone') || "User";

  const [users, setUsers] = useState([]);
  const [currentRecipientId, setCurrentRecipientId] = useState(null);
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [messages, setMessages] = useState({}); // { conversationId: [messages] }
  const [inputMessage, setInputMessage] = useState('');

  const stompClientRef = useRef(null);
  const messagesEndRef = useRef(null);
  const currentConversationIdRef = useRef(null);

  // Sync ref with state so the WS callback always has the right ID
  useEffect(() => {
    currentConversationIdRef.current = currentConversationId;
  }, [currentConversationId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  // --- 1. Load Contacts ---
  useEffect(() => {
    if (!jwtToken) return;
    axios.get(`${BACKEND_URI}/api/v1/users/getAllUsers`, {
      headers: { Authorization: `Bearer ${jwtToken}` }
    })
    .then(res => setUsers(res.data || []))
    .catch(err => console.error("Failed to load users", err));
  }, [jwtToken]);

  // --- 2. WebSocket Connection & Subscription ---
  useEffect(() => {
    if (!jwtToken || !currentUserId) return;

    const client = new Client({
      webSocketFactory: () => new SockJS(WEBSOCKET_URL),
      connectHeaders: { Authorization: `Bearer ${jwtToken}` },
      reconnectDelay: 5000,
      debug: (str) => console.log("STOMP Debug:", str),
    });

    client.onConnect = () => {
      console.log("✅ Connected to WebSocket");

      // CRITICAL: Subscribe with Authorization header so the Interceptor sets the Principal
      client.subscribe('/user/queue/messages', (frame) => {
        const msg = JSON.parse(frame.body);
        //console.log("📩 Received Message:", msg);

        setMessages(prev => {
          const cid = msg.conversationId;
          const existing = prev[cid] || [];
          // Avoid duplicates (if backend sends to both)
          if (existing.find(m => m.id === msg.id)) return prev;
          return { ...prev, [cid]: [...existing, msg] };
        });

        if (msg.conversationId === currentConversationIdRef.current) {
          setTimeout(scrollToBottom, 100);
        }
      }, { Authorization: `Bearer ${jwtToken}` });
    };

    client.activate();
    stompClientRef.current = client;

    return () => client.deactivate();
  }, [jwtToken, currentUserId]);

  // --- 3. Start/Switch Chat ---
  const startChat = async (recipientId) => {
    if (!jwtToken) return;
    setCurrentRecipientId(recipientId);

    try {
      // Get/Create conversation
      const convoRes = await axios.post(`${BACKEND_URI}/api/v1/chat/conversation/one-to-one/${recipientId}`, {}, {
        headers: { Authorization: `Bearer ${jwtToken}` }
      });
      const convId = convoRes.data?.id;
      setCurrentConversationId(convId);

      // Load history
      const msgRes = await axios.get(`${BACKEND_URI}/api/v1/chat/messages/${convId}`, {
        headers: { Authorization: `Bearer ${jwtToken}` }
      });
      setMessages(prev => ({ ...prev, [convId]: msgRes.data || [] }));
      setTimeout(scrollToBottom, 100);
    } catch (err) {
      console.error("Chat init error", err);
    }
  };

  // --- 4. Send Message ---
  const sendMessage = () => {
    const client = stompClientRef.current;
    if (!client?.connected || !inputMessage.trim() || !currentConversationId) return;

    const payload = {
      conversationId: currentConversationId,
      recipientId: currentRecipientId,
      content: inputMessage.trim()
    };

    client.publish({
      destination: "/app/chat.sendMessage",
      headers: {
        "content-type": "application/json",
        "Authorization": `Bearer ${jwtToken}`
      },
      body: JSON.stringify(payload)
    });

    setInputMessage('');
  };

  const currentMessages = messages[currentConversationId] || [];

  return (
    <div className="chat-container">
      <div className="sidebar">
        <div className="sidebar-header">
          <div className="user-profile">
            <div className="avatar">{currentUserPhone.charAt(0)}</div>
            <div className="user-info">
              <span className="phone-label">My Number:</span>
              <span className="phone-number">{currentUserPhone}</span>
            </div>
          </div>
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>

        <div className="user-list">
          <h3 className="section-title">Contacts</h3>
          {users.filter(u => u.id !== currentUserId).map(u => (
            <div key={u.id} onClick={() => startChat(u.id)}
                 className={`user-item ${currentRecipientId === u.id ? 'active' : ''}`}>
              <div className="item-avatar">{u.phone.charAt(0)}</div>
              <div className="item-details">
                <p className="item-phone">{u.phone}</p>
                <span className="item-status">online</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="main-chat">
        {currentRecipientId ? (
          <>
            <div className="chat-header">
              <span className="chat-title">Chatting with {users.find(u => u.id === currentRecipientId)?.phone}</span>
            </div>

            <div className="message-area">
              {currentMessages.map((m, i) => (
                <div key={i} className={`msg-wrapper ${m.senderId === currentUserId ? 'sent' : 'received'}`}>
                  <div className="msg-bubble">
                    {m.content}
                    <span className="msg-time">
                      {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <div className="input-area">
              <input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Type your message..."
              />
              <button onClick={sendMessage} className="send-btn">Send</button>
            </div>
          </>
        ) : (
          <div className="empty-state">
            <p>Select a contact to start messaging</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ChatHomePage;