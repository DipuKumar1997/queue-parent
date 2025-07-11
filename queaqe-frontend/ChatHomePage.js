// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import axios from 'axios';
// import SockJS from 'sockjs-client';
// import { Client } from '@stomp/stompjs';

// const BACKEND_URI_PROTECTED = process.env.REACT_APP_BACKEND_URI_PROTECTED;
// const CHAT_SERVICE_BASE_URL = `${BACKEND_URI_PROTECTED}/api/v1/users`;
// const CHAT_API_BASE_URL = `${BACKEND_URI_PROTECTED}/api/v1/chat`;

// function ChatHomePage() {
//   const [users, setUsers] = useState([]);
//   const [messages, setMessages] = useState([]);
//   const [inputMessage, setInputMessage] = useState('');
//   const [stompClient, setStompClient] = useState(null);
//   const [currentConversationId, setCurrentConversationId] = useState(null);
//   const [currentRecipientId, setCurrentRecipientId] = useState(null);
//   const navigate = useNavigate();
//   const jwtToken = localStorage.getItem('jwtToken');

//   useEffect(() => {
//     const fetchUsers = async () => {
//       try {
//         const usersRes = await axios.get(`${CHAT_SERVICE_BASE_URL}/getAllUsers`, {
//           headers: { Authorization: `Bearer ${jwtToken}` }
//         });
//         console.log(usersRes);
//         setUsers(usersRes.data);
//       } catch (err) {
//         console.error('Error fetching users:', err);
//       }
//     };
//     fetchUsers();
//   }, [jwtToken]);

//   const startChat = async (recipientId) => {
//     try {
//       const res = await axios.post(`${CHAT_API_BASE_URL}/conversation/one-to-one/${recipientId}`, {}, {
//         headers: { Authorization: `Bearer ${jwtToken}` }
//       });
//       const conversationId = res.data.id;
//       setCurrentConversationId(conversationId);
//       setCurrentRecipientId(recipientId);
//       connectWebSocket();
//     } catch (err) {
//       console.error('Error starting chat:', err);
//     }
//   };

//   const connectWebSocket = () => {
//     if (stompClient) {
//       stompClient.deactivate();
//     }

//     const client = new Client({
//       webSocketFactory: () => new SockJS(`${BACKEND_URI_PROTECTED}/ws`),
//       connectHeaders: {
//         Authorization: `Bearer ${jwtToken}`
//       },
//       onConnect: () => {
//         console.log('✅ Connected to WebSocket');
//         client.subscribe('/user/queue/messages', (msg) => {
//           const body = JSON.parse(msg.body);
//           setMessages(prev => [...prev, body]);
//         });

//         // Send addUser signal
//         client.publish({
//           destination: '/app/chat.addUser',
//           body: JSON.stringify({})
//         });
//       },
//       onStompError: (frame) => {
//         console.error('Broker error:', frame.headers['message']);
//       }
//     });

//     client.activate();
//     setStompClient(client);
//     setMessages([]);
//   };

//   const sendMessage = () => {
//     if (stompClient && currentConversationId && inputMessage.trim()) {
//       stompClient.publish({
//         destination: '/app/chat.sendMessage',
//         body: JSON.stringify({
//           conversationId: currentConversationId,
//           recipientId: currentRecipientId,
//           content: inputMessage
//         })
//       });
//       setInputMessage('');
//     }
//   };

//   const logout = () => {
//     localStorage.clear();
//     navigate('/');
//   };

//   return (
//     <div style={{ display: 'flex', height: '100vh' }}>
//       <div style={{ width: '25%', borderRight: '1px solid #ddd', overflowY: 'auto' }}>
//         <div style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>
//           <h3>Users</h3>
//           <button onClick={logout} style={{ background: '#f44336', color: 'white', padding: '6px 12px', border: 'none', borderRadius: '4px' }}>
//             Logout
//           </button>
//         </div>
//         {users.map(u => (
//           <div
//             key={u.id}
//             onClick={() => startChat(u.id)}
//             style={{
//               padding: '10px',
//               cursor: 'pointer',
//               backgroundColor: currentRecipientId === u.id ? '#f1f1f1' : 'white'
//             }}
//           >
//             { u.phone}
//           </div>
//         ))}
//       </div>

//       <div style={{ width: '75%', padding: '10px', display: 'flex', flexDirection: 'column' }}>
//         <div style={{ flex: 1, overflowY: 'auto', border: '1px solid #ddd', marginBottom: '10px', padding: '10px' }}>
//           {messages.map((m, idx) => (
//             <div key={idx} style={{ marginBottom: '5px' }}>
//               <strong>{m.senderId}: </strong>{m.content}
//             </div>
//           ))}
//         </div>
//         {currentConversationId ? (
//           <div style={{ display: 'flex' }}>
//             <input
//               value={inputMessage}
//               onChange={(e) => setInputMessage(e.target.value)}
//               style={{ flex: 1, padding: '8px' }}
//               placeholder="Type your message..."
//             />
//             <button onClick={sendMessage} style={{ padding: '8px 15px' }}>Send</button>
//           </div>
//         ) : (
//           <p>Select a user to start chatting</p>
//         )}
//       </div>
//     </div>
//   );
// }

// export default ChatHomePage;



// import React, { useState, useEffect, useRef, useCallback } from 'react';
// import { useNavigate } from 'react-router-dom';
// import axios from 'axios';
// import SockJS from 'sockjs-client';
// import { Client } from '@stomp/stompjs';


{/* <script src="[https://cdn.tailwindcss.com](https://cdn.tailwindcss.com)"></script> */}
// <link href="[https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap](https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap)" rel="stylesheet">


// This code assumes Tailwind is available in the environment.

// const BACKEND_URI_PROTECTED = process.env.REACT_APP_BACKEND_URI_PROTECTED || "http://localhost:8084"; // Default for local dev
// const CHAT_SERVICE_BASE_URL = `${BACKEND_URI_PROTECTED}/api/v1/users`;
// const CHAT_API_BASE_URL = `${BACKEND_URI_PROTECTED}/api/v1/chat`;

// function ChatHomePage() {
//   const [users, setUsers] = useState([]);
//   const [messages, setMessages] = useState([]);
//   const [inputMessage, setInputMessage] = useState('');
//   const [stompClient, setStompClient] = useState(null);
//   const [currentConversationId, setCurrentConversationId] = useState(null);
//   const [currentRecipientId, setCurrentRecipientId] = useState(null);
//   const [currentUser, setCurrentUser] = useState(null); // To store authenticated user's ID
//   const navigate = useNavigate();
//   const jwtToken = localStorage.getItem('jwtToken');
//     const userIdd = localStorage.getItem('currentUserId');
//   const messagesEndRef = useRef(null); // Ref for auto-scrolling messages

//   // Scroll to the latest message
//   const scrollToBottom = () => {
//     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   };

//   // Effect to fetch authenticated user's details and all other users
//   useEffect(() => {
//     const fetchAuthUserAndUsers = async () => {
//       try {
        
//         if (jwtToken!=null) {
//           try {
//             // axios.post
//             // const decoded = JSON.parse(atob(tokenParts[1]));
//             setCurrentUser(userIdd); // Assuming 'userId' claim in your JWT
//           } catch (error) {
//             console.error("Failed to decode JWT token:", error);
//             // Handle invalid token (e.g., redirect to login)
//             localStorage.clear();
//             navigate('/');
//             return;
//           }
//         } else {
//             console.log("errro +++++++++++++++++")
//           // No token or invalid format, redirect to login
//         //   localStorage.clear();
//         //   navigate('/');
//           return;
//         }


//         // Fetch all other users
//         const usersRes = await axios.get(`${CHAT_SERVICE_BASE_URL}/getAllUsers`, {
//           headers: { Authorization: `Bearer ${jwtToken}` }
//         });
//         console.log('Fetched users:', usersRes.data);
//         // Filter out the current authenticated user from the list of users
//         setUsers(usersRes.data.filter(user => user.id !== currentUser));
//       } catch (err) {
//         console.error('Error fetching users:', err);
//         console.log("error in ------------")
//         // Handle unauthorized or token expired errors
//         if (err.response && (err.response.status === 401 || err.response.status === 403)) {
//         //   localStorage.clear();
//         //   navigate('/');
//         }
//       }
//     };
//     if (jwtToken) {
//       fetchAuthUserAndUsers();
//     } else {
//       navigate('/'); // Redirect to login if no token
//     }
//   }, [jwtToken, currentUser, navigate]); // Rerun if token or currentUser changes

//   // Consolidated WebSocket connection logic
//   const connectWebSocket = useCallback(() => {
//     if (!jwtToken) return;

//     if (stompClient && stompClient.connected) {
//       console.log('STOMP client already connected, deactivating old one.');
//       stompClient.deactivate(); // Deactivate existing client to avoid multiple connections
//     }

//     const client = new Client({
//       webSocketFactory: () => new SockJS(`${BACKEND_URI_PROTECTED}/ws`),
//       connectHeaders: {
//         Authorization: `Bearer ${jwtToken}`
//       },
//       debug: (str) => { // Debugging for STOMP connection
//         console.log('STOMP Debug:', str);
//       },
//       reconnectDelay: 5000, // Reconnect after 5 seconds
//       heartbeatIncoming: 4000,
//       heartbeatOutgoing: 4000,

//       onConnect: () => {
//         console.log('✅ Connected to WebSocket');
//         // Subscribe to user-specific queue for private messages
//         client.subscribe('/user/queue/messages', (msg) => {
//           const body = JSON.parse(msg.body);
//           console.log('Received message:', body);
//           setMessages(prev => {
//             // Only add if it belongs to the current conversation
//             if (body.conversationId === currentConversationId) {
//                 return [...prev, body];
//             }
//             return prev; // Or show notification for other conversations
//           });
//         });

//         // Send addUser signal after successful connection
//         client.publish({
//           destination: '/app/chat.addUser',
//           body: JSON.stringify({}) // Backend will use principal to get userId
//         });
//       },
//       onStompError: (frame) => {
//         console.error('Broker error:', frame.headers['message']);
//         console.error('Details:', frame.body);
//         alert(`Broker error: ${frame.headers['message'] || 'Unknown'}. Check console for details.`);
//       },
//       onDisconnect: (frame) => {
//         console.log('❌ Disconnected from WebSocket:', frame);
//         // Optionally try to reconnect here if needed, or clear client
//         setStompClient(null);
//       }
//     });

//     client.activate(); // Activate the STOMP client
//     setStompClient(client);

//     // Clean up on component unmount
//     return () => {
//       if (client && client.connected) {
//         console.log('Deactivating STOMP client on unmount.');
//         client.deactivate();
//       }
//     };
//   }, [jwtToken, currentConversationId]); // Re-run if jwtToken or currentConversationId changes

//   // Effect to manage WebSocket connection lifecycle
//   useEffect(() => {
//     const cleanup = connectWebSocket(); // Establish connection on mount
//     return cleanup; // Return cleanup function
//   }, [connectWebSocket]);


//   // Effect to scroll messages into view whenever messages state changes
//   useEffect(() => {
//     scrollToBottom();
//   }, [messages]);


//   const startChat = async (recipientId) => {
//     try {
  
//       const res = await axios.post(`${CHAT_API_BASE_URL}/conversation/one-to-one/${recipientId}`, {}, {
//         headers: { Authorization: `Bearer ${jwtToken}` }
//       });
//       const conversationId = res.data.id;
//       setCurrentConversationId(conversationId);
//       setCurrentRecipientId(recipientId);

//       // Fetch existing messages for the new conversation
//       const messagesRes = await axios.get(`${CHAT_API_BASE_URL}/messages/${conversationId}`, {
//         headers: { Authorization: `Bearer ${jwtToken}` }
//       });
//       setMessages(messagesRes.data);
//       console.log('Fetched messages for conversation:', messagesRes.data);

//     } catch (err) {
//       console.error('Error starting chat or fetching messages:', err);
//       if (err.response && (err.response.status === 401 || err.response.status === 403)) {
//         localStorage.clear();
//         navigate('/');
//       }
//     }
//   };

//   const sendMessage = () => {
//     if (stompClient && stompClient.connected && currentConversationId && inputMessage.trim()) {
//       const messagePayload = {
//         conversationId: currentConversationId,
//         recipientId: currentRecipientId,
//         content: inputMessage,
//         // senderId will be populated by the backend @AuthenticationPrincipal
//         // timestamp will be populated by the backend
//       };
//       stompClient.publish({
//         destination: '/app/chat.sendMessage',
//         body: JSON.stringify(messagePayload)
//       });
//       setInputMessage('');
//     } else {
//       console.warn("Cannot send message: STOMP client not connected, no conversation selected, or empty message.");
//       if (!stompClient || !stompClient.connected) {
//         alert("WebSocket not connected. Please try again or check your network.");
//       } else if (!currentConversationId) {
//         alert("Please select a user to start a conversation.");
//       }
//     }
//   };

//   const logout = () => {
//     if (stompClient && stompClient.connected) {
//       stompClient.deactivate(); // Disconnect STOMP client on logout
//     }
//     localStorage.clear();
//     navigate('/');
//   };

//   // Helper to get recipient's name/phone for display
//   const getRecipientInfo = (id) => {
//     const recipient = users.find(u => u.id === id);
//     return recipient ? recipient.phone : 'Unknown User';
//   };

//   return (
//     <div className="flex h-screen bg-gray-100 font-inter"> {/* Apply Inter font */}
//       {/* Sidebar - User List */}
//       <div className="w-1/4 bg-white border-r border-gray-200 flex flex-col shadow-md rounded-l-lg">
//         <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
//           <h3 className="text-xl font-semibold text-gray-800">Chats</h3>
//           <button
//             onClick={logout}
//             className="bg-red-500 text-white py-1.5 px-4 rounded-full text-sm font-medium hover:bg-red-600 transition-colors shadow-sm"
//           >
//             Logout
//           </button>
//         </div>
//         <div className="flex-1 overflow-y-auto">
//           {users.length === 0 ? (
//             <p className="p-4 text-gray-500 text-center">No other users found.</p>
//           ) : (
//             users.map(u => (
//               <div
//                 key={u.id}
//                 onClick={() => startChat(u.id)}
//                 className={`flex items-center p-3 cursor-pointer border-b border-gray-100 last:border-b-0 hover:bg-blue-50 transition-colors ${
//                   currentRecipientId === u.id ? 'bg-blue-100 font-medium' : ''
//                 }`}
//               >
//                 <div className="w-10 h-10 rounded-full bg-blue-400 text-white flex items-center justify-center text-lg font-bold mr-3 shadow-sm">
//                   {u.phone ? u.phone.charAt(0) : 'U'}
//                 </div>
//                 <div className="flex-1">
//                   <p className="text-gray-800 text-base">{u.phone}</p>
//                   {/* You could add last message snippet here */}
//                   <p className="text-gray-500 text-xs">Click to chat</p>
//                 </div>
//               </div>
//             ))
//           )}
//         </div>
//       </div>

//       {/* Main Chat Area */}
//       <div className="w-3/4 flex flex-col bg-gray-50 rounded-r-lg shadow-md">
//         {currentRecipientId ? (
//           <>
//             {/* Chat Header */}
//             <div className="p-4 border-b border-gray-200 flex items-center bg-white shadow-sm">
//               <div className="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center text-lg font-bold mr-3 shadow-sm">
//                 {getRecipientInfo(currentRecipientId).charAt(0)}
//               </div>
//               <h3 className="text-lg font-semibold text-gray-800">{getRecipientInfo(currentRecipientId)}</h3>
//               {stompClient && stompClient.connected ? (
//                 <span className="ml-auto text-green-500 text-sm flex items-center">
//                   <span className="h-2 w-2 rounded-full bg-green-500 mr-1 animate-pulse"></span> Online
//                 </span>
//               ) : (
//                 <span className="ml-auto text-red-500 text-sm flex items-center">
//                   <span className="h-2 w-2 rounded-full bg-red-500 mr-1"></span> Offline
//                 </span>
//               )}
//             </div>

//             {/* Messages Display */}
//             <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-100" style={{ backgroundImage: 'url([https://placehold.co/600x400/F0F0F0/888888?text=Chat+Background](https://placehold.co/600x400/F0F0F0/888888?text=Chat+Background))', backgroundSize: 'cover', backgroundRepeat: 'no-repeat', backgroundPosition: 'center' }}>
//               {messages.length === 0 ? (
//                 <p className="text-gray-500 text-center text-sm italic mt-8">No messages yet. Start the conversation!</p>
//               ) : (
//                 messages.map((m, idx) => (
//                   <div
//                     key={idx}
//                     className={`flex ${m.senderId === currentUser ? 'justify-end' : 'justify-start'}`}
//                   >
//                     <div
//                       className={`max-w-[70%] rounded-lg py-2 px-3 shadow-md text-sm break-words ${
//                         m.senderId === currentUser
//                           ? 'bg-green-200 text-gray-800 rounded-br-none'
//                           : 'bg-white text-gray-800 rounded-bl-none'
//                       }`}
//                     >
//                       {m.content}
//                       <p className="text-xs text-gray-500 mt-1 text-right">
//                         {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
//                       </p>
//                     </div>
//                   </div>
//                 ))
//               )}
//               <div ref={messagesEndRef} /> {/* For auto-scrolling */}
//             </div>

//             {/* Message Input */}
//             <div className="p-4 bg-white border-t border-gray-200 flex items-center gap-2 shadow-inner">
//               <input
//                 value={inputMessage}
//                 onChange={(e) => setInputMessage(e.target.value)}
//                 onKeyPress={(e) => { if (e.key === 'Enter') sendMessage(); }} // Send on Enter key press
//                 className="flex-1 rounded-full border border-gray-300 py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-800"
//                 placeholder="Type your message..."
//               />
//               <button
//                 onClick={sendMessage}
//                 className="bg-blue-500 text-white rounded-full p-3 hover:bg-blue-600 transition-colors shadow-md flex items-center justify-center"
//               >
//                 <svg xmlns="[http://www.w3.org/2000/svg](http://www.w3.org/2000/svg)" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
//                   <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
//                 </svg>
//               </button>
//             </div>
//           </>
//         ) : (
//           <div className="flex-1 flex items-center justify-center text-gray-500 text-lg">
//             <p>👋 Select a user from the left to start chatting!</p>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// export default ChatHomePage;


