import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
//http://localhost:8084/api/v1/users/getAllUsers

const BACKEND_URI_PROTECTED = process.env.REACT_APP_BACKEND_URI_PROTECTED || "http://localhost:8084";
const CHAT_SERVICE_BASE_URL = `${BACKEND_URI_PROTECTED}/api/v1/users`;
const CHAT_API_BASE_URL = `${BACKEND_URI_PROTECTED}/api/v1/chat`;

function ChatHomePage() {
  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [currentRecipientId, setCurrentRecipientId] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();
  const jwtToken = localStorage.getItem('jwtToken');
  const userIdd = localStorage.getItem('currentUserId');
  const messagesEndRef = useRef(null);
  const stompClientRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const fetchAuthUserAndUsers = async () => {
      try {
        if (jwtToken) {
          setCurrentUser(userIdd);
        } else {
          return;
        }

        const usersRes = await axios.get(`http://localhost:8084/api/v1/users/getAllUsers`, {
          headers: { Authorization: `Bearer ${jwtToken}` }
        });
        console.log("response coming in userRes")
        console.log(usersRes);
        setUsers(usersRes.data.filter(user => user.id !== userIdd));
      } catch (err) {
        console.error('Error fetching users:', err);
        if (err.response && (err.response.status === 401 || err.response.status === 403)) {
        //   localStorage.clear();
        //   navigate('/');
        }
      }
    };

    fetchAuthUserAndUsers();
  }, [jwtToken, userIdd]);

  const connectWebSocket = useCallback((conversationId) => {
    if (!jwtToken) return;

    if (stompClientRef.current?.connected) {
      stompClientRef.current.deactivate();
    }

    const client = new Client({
      webSocketFactory: () => new SockJS(`${BACKEND_URI_PROTECTED}/ws`),
      connectHeaders: {
        Authorization: `Bearer ${jwtToken}`
      },
      onConnect: () => {
        console.log('Connected via STOMP');

        client.subscribe('/user/queue/messages', (msg) => {
          const body = JSON.parse(msg.body);
          setMessages(prev => {
            if (body.conversationId === conversationId) {
              return [...prev, body];
            }
            return prev;
          });
        });

        client.publish({
          destination: '/app/chat.addUser',
          body: JSON.stringify({})
        });
      },
      onStompError: (frame) => {
        console.error('STOMP Error:', frame.headers['message']);
        console.error(frame.body);
      },
      onDisconnect: () => {
        stompClientRef.current = null;
      },
      reconnectDelay: 5000
    });

    client.activate();
    stompClientRef.current = client;
  }, [jwtToken]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const startChat = async (recipientId) => {
    try {
        console.log("hitting this ");
        console.log("Recipient ID received in startChat:", recipientId); // Add this explicit log
        console.log("Constructed URL:", `${CHAT_API_BASE_URL}/conversation/one-to-one/${recipientId}`); 

      const res = await axios.post(`${CHAT_API_BASE_URL}/conversation/one-to-one/${recipientId}`, {}, {
        headers: { Authorization: `Bearer ${jwtToken}` }
      });

      const conversationId = res.data.id;
      setCurrentConversationId(conversationId);
      setCurrentRecipientId(recipientId);
      console.log("controlee came here in")
      console.log(conversationId)
      const messagesRes = await axios.get(`${CHAT_API_BASE_URL}/messages/${conversationId}`, {
        headers: { Authorization: `Bearer ${jwtToken}` }
      });
      console.log(messagesRes)
      setMessages(messagesRes.data);
      console.log("call came here to call the things")
      console.log(conversationId);
      connectWebSocket(conversationId);
    } catch (err) {
      console.error('Error starting chat:', err);
      if (err.response && (err.response.status === 401 || err.response.status === 403)) {
        console.log("error =+++++++++")
        console.log(err);
        console.log("errro end =++++++++")
        // localStorage.clear();
        // navigate('/');
      }
    }
  };

  const sendMessage = () => {
    const client = stompClientRef.current;
    if (client && client.connected && currentConversationId && inputMessage.trim()) {
      const messagePayload = {
        conversationId: currentConversationId,
        recipientId: currentRecipientId,
        content: inputMessage,
      };
      client.publish({
        destination: '/app/chat.sendMessage',
        body: JSON.stringify(messagePayload)
      });
      setInputMessage('');
    } else {
      alert("WebSocket not connected or no conversation selected.");
    }
  };

  const logout = () => {
    // stompClientRef.current?.deactivate();
    // localStorage.clear();
    // navigate('/');
  };

  const getRecipientInfo = (id) => {
    const recipient = users.find(u => u.id === id);
    return recipient ? recipient.phone : 'Unknown User';
  };

  return (
    <div className="flex h-screen bg-gray-100 font-inter">
      <div className="w-1/4 bg-white border-r border-gray-200 flex flex-col shadow-md rounded-l-lg">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
          <h3 className="text-xl font-semibold text-gray-800">Chats</h3>
          <button onClick={logout} className="bg-red-500 text-white py-1.5 px-4 rounded-full text-sm font-medium hover:bg-red-600 transition-colors shadow-sm">
            Logout
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {users.length === 0 ? (
            <p className="p-4 text-gray-500 text-center">No other users found.</p>
          ) : (
            users.map(u => (
              <div
                key={u.id}
                onClick={() => startChat(u.id)}
                className={`flex items-center p-3 cursor-pointer border-b border-gray-100 hover:bg-blue-50 ${currentRecipientId === u.id ? 'bg-blue-100 font-medium' : ''}`}
              >
                <div className="w-10 h-10 rounded-full bg-blue-400 text-white flex items-center justify-center text-lg font-bold mr-3 shadow-sm">
                  {u.phone?.charAt(0) || 'U'}
                </div>
                <div className="flex-1">
                  <p className="text-gray-800 text-base">{u.phone}</p>
                  <p className="text-gray-500 text-xs">Click to chat</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="w-3/4 flex flex-col bg-gray-50 rounded-r-lg shadow-md">
        {currentRecipientId ? (
          <>
            <div className="p-4 border-b border-gray-200 flex items-center bg-white shadow-sm">
              <div className="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center text-lg font-bold mr-3 shadow-sm">
                {getRecipientInfo(currentRecipientId).charAt(0)}
              </div>
              <h3 className="text-lg font-semibold text-gray-800">{getRecipientInfo(currentRecipientId)}</h3>
              {stompClientRef.current?.connected ? (
                <span className="ml-auto text-green-500 text-sm flex items-center">
                  <span className="h-2 w-2 rounded-full bg-green-500 mr-1 animate-pulse"></span> Online
                </span>
              ) : (
                <span className="ml-auto text-red-500 text-sm flex items-center">
                  <span className="h-2 w-2 rounded-full bg-red-500 mr-1"></span> Offline
                </span>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-100">
              {messages.length === 0 ? (
                <p className="text-gray-500 text-center text-sm italic mt-8">No messages yet. Start the conversation!</p>
              ) : (
                messages.map((m, idx) => (
                  <div key={idx} className={`flex ${m.senderId === currentUser ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] rounded-lg py-2 px-3 shadow-md text-sm break-words ${m.senderId === currentUser ? 'bg-green-200 text-gray-800 rounded-br-none' : 'bg-white text-gray-800 rounded-bl-none'}`}>
                      {m.content}
                      <p className="text-xs text-gray-500 mt-1 text-right">
                        {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 bg-white border-t border-gray-200 flex items-center gap-2 shadow-inner">
              <input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => { if (e.key === 'Enter') sendMessage(); }}
                className="flex-1 rounded-full border border-gray-300 py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-800"
                placeholder="Type your message..."
              />
              <button
                onClick={sendMessage}
                className="bg-blue-500 text-white rounded-full p-3 hover:bg-blue-600 transition-colors shadow-md flex items-center justify-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                </svg>
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500 text-lg">
            <p>👋 Select a user from the left to start chatting!</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ChatHomePage;
