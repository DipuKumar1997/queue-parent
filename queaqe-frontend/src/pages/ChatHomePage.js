
//final ISSUE

import React, { useEffect, useRef, useState, useCallback } from 'react';
import axios from 'axios';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

const BACKEND_URI_PROTECTED = process.env.REACT_APP_BACKEND_URI_PROTECTED || "http://localhost:8084";
const CHAT_API_BASE_URL = `${BACKEND_URI_PROTECTED}/api/v1/chat`;
const WEBSOCKET_URL = "http://localhost:8082/ws";

const Modal = ({ message, onClose }) => (
  <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full text-center">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Notification</h3>
      <p className="text-gray-700 mb-6">{message}</p>
      <button
        onClick={onClose}
        className="bg-blue-600 text-white py-2 px-5 rounded-full hover:bg-blue-700 transition-colors duration-200 shadow-md"
      >
        Got it!
      </button>
    </div>
  </div>
);

const Toast = ({ message, duration = 2500, onClose }) => {
  useEffect(() => {
    const t = setTimeout(onClose, duration);
    return () => clearTimeout(t);
  }, [duration, onClose]);

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-800 text-white px-6 py-3 rounded-full shadow-lg z-50 text-sm animate-fade-in-up">
      {message}
    </div>
  );
};

function ChatHomePage() {
  const jwtToken = localStorage.getItem('jwtToken');
  const currentUserId = localStorage.getItem('currentUserId');

  const [users, setUsers] = useState([]);
  const [currentRecipientId, setCurrentRecipientId] = useState(null);
  const [currentConversationId, setCurrentConversationId] = useState(null);

  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');

  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const stompClientRef = useRef(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const showToastMessage = (msg) => {
    setToastMessage(msg);
    setShowToast(true);
  };

  // 1) Load all users
  useEffect(() => {
    const loadUsers = async () => {
      try {
        if (!jwtToken || !currentUserId) return;

        const res = await axios.get(`${BACKEND_URI_PROTECTED}/api/v1/users/getAllUsers`, {
          headers: { Authorization: `Bearer ${jwtToken}` }
        });
        setUsers(res.data || []);
      } catch (err) {
        setErrorMessage(`Failed to load users: ${err.response?.data?.message || err.message}`);
        setShowErrorModal(true);
      }
    };

    loadUsers();
  }, [jwtToken, currentUserId]);

  // 2) Connect WebSocket once (private messages via /user/queue/messages) [web:13]
  useEffect(() => {
    if (!jwtToken || !currentUserId) return;

    const client = new Client({
      webSocketFactory: () => new SockJS(WEBSOCKET_URL),
      connectHeaders: {
        Authorization: `Bearer ${jwtToken}` // must be in STOMP CONNECT headers for your interceptor
      },
      reconnectDelay: 5000,
      debug: () => {}
    });

    client.onConnect = () => {
      client.subscribe('/user/queue/messages', (frame) => {
        const msg = JSON.parse(frame.body);
        setMessages((prev) => [...prev, msg]);
        scrollToBottom();
      });

      // optional: notify backend you are online (your controller ignores payload and uses Principal)
      client.publish({ destination: '/app/chat.addUser', body: '{}' });
    };

    client.onStompError = (frame) => {
      setErrorMessage(`WebSocket error: ${frame.headers?.message || 'Unknown error'}`);
      setShowErrorModal(true);
    };

    client.activate();
    stompClientRef.current = client;

    return () => {
      try { client.deactivate(); } catch {}
      stompClientRef.current = null;
    };
  }, [jwtToken, currentUserId, scrollToBottom]);

  // 3) Start chat: create/get conversation + load history (REST only when user clicks)
  const startChat = async (recipientId) => {
    try {
      if (!jwtToken || !currentUserId) return;

      setCurrentRecipientId(recipientId);
      setCurrentConversationId(null);
      setMessages([]);

      const convoRes = await axios.post(
        `${CHAT_API_BASE_URL}/conversation/one-to-one/${recipientId}`,
        {},
        { headers: { Authorization: `Bearer ${jwtToken}` } }
      );

      const conversationId = convoRes.data?.id;
      setCurrentConversationId(conversationId);

      const msgRes = await axios.get(`${CHAT_API_BASE_URL}/messages/${conversationId}`, {
        headers: { Authorization: `Bearer ${jwtToken}` }
      });

      setMessages(msgRes.data || []);
      setTimeout(scrollToBottom, 0);
    } catch (err) {
      setErrorMessage(`Failed to start chat: ${err.response?.data?.message || err.message}`);
      setShowErrorModal(true);
    }
  };

  // 4) Send message (NO senderId from client; server derives it from Principal) [web:13]
  // const sendMessage = () => {
  //   console.log("sending with conversationId=", currentConversationId, "recipientId=", currentRecipientId);

  //   const client = stompClientRef.current;

  //   if (!client?.connected) {
  //     setErrorMessage("WebSocket is not connected.");
  //     setShowErrorModal(true);
  //     return;
  //   }
  //   if (!currentConversationId || !currentRecipientId) {
  //     showToastMessage("Select a user to chat.");
  //     return;
  //   }
  //   if (!inputMessage.trim()) {
  //     showToastMessage("Message cannot be empty.");
  //     return;
  //   }

  //   const payload = {
  //     conversationId: currentConversationId,
  //     recipientId: currentRecipientId,
  //     content: inputMessage.trim()
  //   };

  //   client.publish({
  //     destination: '/app/chat.sendMessage',
  //     body: JSON.stringify(payload)
  //   });

  //   setInputMessage('');
  // };
  const sendMessage = () => {
    console.log(
      "sending with conversationId=",
      currentConversationId,
      "recipientId=",
      currentRecipientId
    );

    const client = stompClientRef.current;

    if (!client || !client.connected) {
      setErrorMessage("WebSocket is not connected.");
      setShowErrorModal(true);
      return;
    }

  const content = (inputMessage || "").trim();
  if (!currentConversationId || !currentRecipientId) {
    showToastMessage("Select a user to chat.");
    return;
  }
  if (!content) {
    showToastMessage("Message cannot be empty.");
    return;
  }

  // IMPORTANT: do not send senderId; server must take it from Principal
  const payload = {
    conversationId: currentConversationId,
    recipientId: currentRecipientId,
    content
  };

  client.publish({
    destination: "/app/chat.sendMessage", // must match setApplicationDestinationPrefixes("/app") [web:33]
    headers: { "content-type": "application/json" }, // good practice with stompjs publish [web:21]
    body: JSON.stringify(payload)
  });

  setInputMessage("");
};


  const getRecipientInfo = (id) => {
    const u = users.find(x => x.id === id);
    return u ? u.phone : 'Unknown User';
  };

  const getCurrentUserInfo = () => {
    const u = users.find(x => x.id === currentUserId);
    return u ? u.phone : 'Loading...';
  };

  return (
    <div className="flex h-screen bg-gray-100 font-inter antialiased">
      {showErrorModal && <Modal message={errorMessage} onClose={() => setShowErrorModal(false)} />}
      {showToast && <Toast message={toastMessage} onClose={() => setShowToast(false)} />}

      {/* Left Pane: User List */}
      <div className="w-1/4 bg-white border-r border-gray-200 flex flex-col shadow-lg rounded-l-xl overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md">
          <h3 className="text-2xl font-bold">Chats</h3>
          <div className="flex items-center space-x-3">
            <div className="relative group">
              <button className="bg-blue-500 text-white py-1.5 px-3 rounded-full text-sm font-medium hover:bg-blue-600 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9.293 12.293a1 1 0 001.414 1.414L12 11.414V15a1 1 0 102 0v-4.586l1.293 1.293a1 1 0 001.414-1.414l-3-3a1 1 0 00-1.414 0l-3 3z" clipRule="evenodd" />
                </svg>
              </button>
              <div className="absolute left-1/2 transform -translate-x-1/2 top-full mt-2 w-max px-3 py-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                Current User: {getCurrentUserInfo()}
              </div>
            </div>

            <button
              onClick={() => {}}
              className="bg-red-500 text-white py-1.5 px-4 rounded-full text-sm font-medium hover:bg-red-600 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-red-400"
            >
              Logout
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {users.filter(u => u.id !== currentUserId).length === 0 ? (
            <p className="p-6 text-gray-500 text-center text-base italic">No other users found to chat with.</p>
          ) : (
            users
              .filter(u => u.id !== currentUserId)
              .map(u => (
                <div
                  key={u.id}
                  onClick={() => startChat(u.id)}
                  className={`flex items-center p-4 cursor-pointer border-b border-gray-100 transition-all duration-200 ease-in-out
                    ${currentRecipientId === u.id ? 'bg-blue-50 font-semibold border-l-4 border-blue-500' : 'hover:bg-gray-50'}`}
                >
                  <div className="w-12 h-12 rounded-full bg-blue-500 text-white flex items-center justify-center text-xl font-bold mr-4 shadow-md flex-shrink-0">
                    {u.phone?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-900 text-lg">{u.phone}</p>
                    <p className="text-gray-600 text-sm">Click to chat</p>
                  </div>
                </div>
              ))
          )}
        </div>
      </div>

      {/* Right Pane: Chat Area */}
      <div className="w-3/4 flex flex-col bg-white rounded-r-xl shadow-lg overflow-hidden">
        {currentRecipientId ? (
          <>
            <div className="p-4 border-b border-gray-200 flex items-center bg-gradient-to-r from-green-500 to-green-600 text-white shadow-md">
              <div className="w-12 h-12 rounded-full bg-green-700 text-white flex items-center justify-center text-xl font-bold mr-4 shadow-md flex-shrink-0">
                {getRecipientInfo(currentRecipientId).charAt(0).toUpperCase()}
              </div>

              <h3 className="text-xl font-semibold">{getRecipientInfo(currentRecipientId)}</h3>

              {stompClientRef.current?.connected ? (
                <span className="ml-auto text-white text-sm flex items-center opacity-90">
                  <span className="h-3 w-3 rounded-full bg-green-300 mr-2 animate-pulse shadow-sm"></span> Online
                </span>
              ) : (
                <span className="ml-auto text-white text-sm flex items-center opacity-90">
                  <span className="h-3 w-3 rounded-full bg-red-300 mr-2 shadow-sm"></span> Offline
                </span>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50 custom-scrollbar">
              {messages.length === 0 ? (
                <p className="text-gray-500 text-center text-base italic mt-12">No messages yet. Start the conversation!</p>
              ) : (
                messages.map((m, idx) => (
                  <div
                    key={idx}
                    className={`flex ${m.senderId === currentUserId ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[75%] py-3 px-4 rounded-xl shadow-md text-base break-words
                      ${m.senderId === currentUserId
                        ? 'bg-blue-500 text-white rounded-br-none'
                        : 'bg-gray-200 text-gray-800 rounded-bl-none'
                      }`}
                    >
                      {m.content}
                      <p className={`text-xs mt-1 ${m.senderId === currentUserId ? 'text-blue-200' : 'text-gray-600'} text-right`}>
                        {m.timestamp ? new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                      </p>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 bg-white border-t border-gray-200 flex items-center gap-3 shadow-inner">
              <input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              className="flex-1 rounded-full border border-gray-300 py-3 px-5"
              placeholder="Type your message..."
            />
              <button
                onClick={sendMessage}
                className="bg-blue-600 text-white rounded-full p-3.5 hover:bg-blue-700 transition-colors shadow-lg flex items-center justify-center
                           transform active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                </svg>
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-500 text-xl p-8 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 text-blue-400 mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            <p className="font-semibold text-gray-700">👋 Welcome to your chat!</p>
            <p className="mt-2 text-lg">Select a user from the left sidebar to start a conversation.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ChatHomePage;