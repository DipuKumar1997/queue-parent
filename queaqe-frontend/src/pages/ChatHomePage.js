// import React, { useState, useEffect, useRef, useCallback } from 'react';
// import { useNavigate } from 'react-router-dom';
// import axios from 'axios';
// import SockJS from 'sockjs-client';
// import { Client } from '@stomp/stompjs';
// //http://localhost:8084/api/v1/users/getAllUsers

// const BACKEND_URI_PROTECTED = process.env.REACT_APP_BACKEND_URI_PROTECTED || "http://localhost:8084";
// const CHAT_SERVICE_BASE_URL = `${BACKEND_URI_PROTECTED}/api/v1/users`;
// const CHAT_API_BASE_URL = `${BACKEND_URI_PROTECTED}/api/v1/chat`;

// const Modal = ({ message, onClose }) => {
//   return (
//     <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
//       <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full text-center">
//         <h3 className="text-lg font-semibold text-gray-800 mb-4">Notification</h3>
//         <p className="text-gray-700 mb-6">{message}</p>
//         <button
//           onClick={onClose}
//           className="bg-blue-600 text-white py-2 px-5 rounded-full hover:bg-blue-700 transition-colors duration-200 shadow-md"
//         >
//           Got it!
//         </button>
//       </div>
//     </div>
//   );
// };

// function ChatHomePage() {
//   const [users, setUsers] = useState([]);
//   const [messages, setMessages] = useState([]);
//   const [inputMessage, setInputMessage] = useState('');
//   const [currentConversationId, setCurrentConversationId] = useState(null);
//   const [currentRecipientId, setCurrentRecipientId] = useState(null);
//   const [currentUser, setCurrentUser] = useState(null);
//   const navigate = useNavigate();
//   const jwtToken = localStorage.getItem('jwtToken');
//   const userIdd = localStorage.getItem('currentUserId');
//   const messagesEndRef = useRef(null);
//   const stompClientRef = useRef(null);

//   const scrollToBottom = () => {
//     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   };

//   useEffect(() => {
//     const fetchAuthUserAndUsers = async () => {
//       try {
//         if (jwtToken) {
//           setCurrentUser(userIdd);
//         } else {
//           return;
//         }

//         const usersRes = await axios.get(`http://localhost:8084/api/v1/users/getAllUsers`, {
//           headers: { Authorization: `Bearer ${jwtToken}` }
//         });
//         console.log("response coming in userRes")
//         console.log(usersRes);
//         setUsers(usersRes.data.filter(user => user.id !== userIdd));
//       } catch (err) {
//         console.error('Error fetching users:', err);
//         if (err.response && (err.response.status === 401 || err.response.status === 403)) {
//         //   localStorage.clear();
//         //   navigate('/');
//         }
//       }
//     };

//     fetchAuthUserAndUsers();
//   }, [jwtToken, userIdd]);

//   const connectWebSocket = useCallback((conversationId) => {
//     if (!jwtToken) return;

//     if (stompClientRef.current?.connected) {
//       stompClientRef.current.deactivate();
//     }
//     console.log("successfully hhit at this point ");
//     //${BACKEND_URI_PROTECTED}/ws
//     const client = new Client({
//       webSocketFactory: () => new SockJS(`http://localhost:8082/ws`),
//       connectHeaders: {
//         Authorization: `Bearer ${jwtToken}`
//       },
      
//       onConnect: () => {
//         console.log('Connected via STOMP');

//         client.subscribe('/user/queue/messages', (msg) => {
//           const body = JSON.parse(msg.body);
//           setMessages(prev => {
//             if (body.conversationId === conversationId) {
//               return [...prev, body];
//             }
//             return prev;
//           });
//         });

//         client.publish({
//           destination: '/app/chat.addUser',
//           body: JSON.stringify({})
//         });
//       },
//       onStompError: (frame) => {
//         console.error('STOMP Error:', frame.headers['message']);
//         console.error(frame.body);
//       },
//       onDisconnect: () => {
//         stompClientRef.current = null;
//       },
//       reconnectDelay: 5000
//     });

//     client.activate();
//     stompClientRef.current = client;
//   }, [jwtToken]);

//   useEffect(() => {
//     scrollToBottom();
//   }, [messages]);

//   const startChat = async (recipientId) => {
//     try {
//         console.log("hitting this ");
//         console.log("Recipient ID received in startChat:", recipientId); // Add this explicit log
//         console.log("Constructed URL:", `${CHAT_API_BASE_URL}/conversation/one-to-one/${recipientId}`); 

//       const res = await axios.post(`${CHAT_API_BASE_URL}/conversation/one-to-one/${recipientId}`, {}, {
//         headers: { Authorization: `Bearer ${jwtToken}` }
//       });

//       const conversationId = res.data.id;
//       setCurrentConversationId(conversationId);
//       setCurrentRecipientId(recipientId);
//       console.log("controlee came here in")
//       console.log(conversationId)
//       const messagesRes = await axios.get(`${CHAT_API_BASE_URL}/messages/${conversationId}`, {
//         headers: { Authorization: `Bearer ${jwtToken}` }
//       });
//       console.log(messagesRes)
//       setMessages(messagesRes.data);
//       console.log("call came here to call the things")
//       console.log(conversationId);
//       connectWebSocket(conversationId);
//     } catch (err) {
//       console.error('Error starting chat:', err);
//       if (err.response && (err.response.status === 401 || err.response.status === 403)) {
//         console.log("error =+++++++++")
//         console.log(err);
//         console.log("errro end =++++++++")
//         // localStorage.clear();
//         // navigate('/');
//       }
//     }
//   };

//   const sendMessage = () => {
//     const client = stompClientRef.current;
//     if (client && client.connected && currentConversationId && inputMessage.trim()) {
//       const messagePayload = {
//         conversationId: currentConversationId,
//         recipientId: currentRecipientId,
//         content: inputMessage,
//       };
//       client.publish({
//         destination: '/app/chat.sendMessage',
//         body: JSON.stringify(messagePayload)
//       });
//       setInputMessage('');
//     } else {
//       alert("WebSocket not connected or no conversation selected.");
//     }
//   };

//   const logout = () => {
//     // stompClientRef.current?.deactivate();
//     // localStorage.clear();
//     // navigate('/');
//   };

//   const getRecipientInfo = (id) => {
//     const recipient = users.find(u => u.id === id);
//     return recipient ? recipient.phone : 'Unknown User';
//   };

//   return (
//     <div className="flex h-screen bg-gray-100 font-inter">
//       <div className="w-1/4 bg-white border-r border-gray-200 flex flex-col shadow-md rounded-l-lg">
//         <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
//           <h3 className="text-xl font-semibold text-gray-800">Chats</h3>
//           <button onClick={logout} className="bg-red-500 text-white py-1.5 px-4 rounded-full text-sm font-medium hover:bg-red-600 transition-colors shadow-sm">
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
//                 className={`flex items-center p-3 cursor-pointer border-b border-gray-100 hover:bg-blue-50 ${currentRecipientId === u.id ? 'bg-blue-100 font-medium' : ''}`}
//               >
//                 <div className="w-10 h-10 rounded-full bg-blue-400 text-white flex items-center justify-center text-lg font-bold mr-3 shadow-sm">
//                   {u.phone?.charAt(0) || 'U'}
//                 </div>
//                 <div className="flex-1">
//                   <p className="text-gray-800 text-base">{u.phone}</p>
//                   <p className="text-gray-500 text-xs">Click to chat</p>
//                 </div>
//               </div>
//             ))
//           )}
//         </div>
//       </div>

//       <div className="w-3/4 flex flex-col bg-gray-50 rounded-r-lg shadow-md">
//         {currentRecipientId ? (
//           <>
//             <div className="p-4 border-b border-gray-200 flex items-center bg-white shadow-sm">
//               <div className="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center text-lg font-bold mr-3 shadow-sm">
//                 {getRecipientInfo(currentRecipientId).charAt(0)}
//               </div>
//               <h3 className="text-lg font-semibold text-gray-800">{getRecipientInfo(currentRecipientId)}</h3>
//               {stompClientRef.current?.connected ? (
//                 <span className="ml-auto text-green-500 text-sm flex items-center">
//                   <span className="h-2 w-2 rounded-full bg-green-500 mr-1 animate-pulse"></span> Online
//                 </span>
//               ) : (
//                 <span className="ml-auto text-red-500 text-sm flex items-center">
//                   <span className="h-2 w-2 rounded-full bg-red-500 mr-1"></span> Offline
//                 </span>
//               )}
//             </div>

//             <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-100">
//               {messages.length === 0 ? (
//                 <p className="text-gray-500 text-center text-sm italic mt-8">No messages yet. Start the conversation!</p>
//               ) : (
//                 messages.map((m, idx) => (
//                   <div key={idx} className={`flex ${m.senderId === currentUser ? 'justify-end' : 'justify-start'}`}>
//                     <div className={`max-w-[70%] rounded-lg py-2 px-3 shadow-md text-sm break-words ${m.senderId === currentUser ? 'bg-green-200 text-gray-800 rounded-br-none' : 'bg-white text-gray-800 rounded-bl-none'}`}>
//                       {m.content}
//                       <p className="text-xs text-gray-500 mt-1 text-right">
//                         {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
//                       </p>
//                     </div>
//                   </div>
//                 ))
//               )}
//               <div ref={messagesEndRef} />
//             </div>

//             <div className="p-4 bg-white border-t border-gray-200 flex items-center gap-2 shadow-inner">
//               <input
//                 value={inputMessage}
//                 onChange={(e) => setInputMessage(e.target.value)}
//                 onKeyPress={(e) => { if (e.key === 'Enter') sendMessage(); }}
//                 className="flex-1 rounded-full border border-gray-300 py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-800"
//                 placeholder="Type your message..."
//               />
//               <button
//                 onClick={sendMessage}
//                 className="bg-blue-500 text-white rounded-full p-3 hover:bg-blue-600 transition-colors shadow-md flex items-center justify-center"
//               >
//                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
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


//implemation by gemini by certain improvment 

// import React, { useState, useEffect, useRef, useCallback } from 'react';
// import { useNavigate } from 'react-router-dom';
// import axios from 'axios';
// import SockJS from 'sockjs-client';
// import { Client } from '@stomp/stompjs';

// // Base URLs for your backend services
// const BACKEND_URI_PROTECTED = process.env.REACT_APP_BACKEND_URI_PROTECTED || "http://localhost:8084";
// const CHAT_API_BASE_URL = `${BACKEND_URI_PROTECTED}/api/v1/chat`;
// // Using 8082 for WebSocket as per your provided code
// const WEBSOCKET_URL = "http://localhost:8082/ws";

// // Custom Modal Component for alerts
// const Modal = ({ message, onClose }) => {
//   return (
//     <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
//       <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full text-center">
//         <h3 className="text-lg font-semibold text-gray-800 mb-4">Notification</h3>
//         <p className="text-gray-700 mb-6">{message}</p>
//         <button
//           onClick={onClose}
//           className="bg-blue-600 text-white py-2 px-5 rounded-full hover:bg-blue-700 transition-colors duration-200 shadow-md"
//         >
//           Got it!
//         </button>
//       </div>
//     </div>
//   );
// };

// function ChatHomePage() {
//   // State variables for managing chat data and UI
//   const [users, setUsers] = useState([]); // List of other users available for chat
//   const [messages, setMessages] = useState([]); // Messages in the current conversation
//   const [inputMessage, setInputMessage] = useState(''); // Current message being typed
//   const [currentConversationId, setCurrentConversationId] = useState(null); // ID of the active conversation
//   const [currentRecipientId, setCurrentRecipientId] = useState(null); // ID of the user currently chatting with
//   const [currentUser, setCurrentUser] = useState(null); // ID of the authenticated user
//   const [showErrorModal, setShowErrorModal] = useState(false); // State for showing custom error modal
//   const [errorMessage, setErrorMessage] = useState(''); // Message to display in the error modal

//   // React Router hook for navigation (e.g., logout redirect)
//   const navigate = useNavigate();

//   // Retrieve JWT token and current user ID from localStorage
//   const jwtToken = localStorage.getItem('jwtToken');
//   const userIdd = localStorage.getItem('currentUserId'); // Note: 'userIdd' is used as in original code

//   // Refs for DOM elements and STOMP client instance
//   const messagesEndRef = useRef(null); // Ref to scroll to the latest message
//   const stompClientRef = useRef(null); // Ref to hold the STOMP client instance
//   const currentConversationIdRef = useRef(currentConversationId); // Ref to hold the latest conversation ID for WebSocket subscription

//   // Update the ref whenever currentConversationId changes
//   useEffect(() => {
//     currentConversationIdRef.current = currentConversationId;
//   }, [currentConversationId]);

//   // Function to scroll to the bottom of the messages container
//   const scrollToBottom = () => {
//     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   };

//   // Effect to fetch authenticated user details and other users on component mount
//   useEffect(() => {
//     const fetchAuthUserAndUsers = async () => {
//       try {
//         if (jwtToken && userIdd) {
//           setCurrentUser(userIdd); // Set the current user ID
//         } else {
//           // If no token or user ID, clear local storage and navigate to login (commented out as per original)
//           // localStorage.clear();
//           // navigate('/');
//           return;
//         }

//         // Fetch all users from the backend
//         const usersRes = await axios.get(`${BACKEND_URI_PROTECTED}/api/v1/users/getAllUsers`, {
//           headers: { Authorization: `Bearer ${jwtToken}` }
//         });
//         // Filter out the current user from the list of users to chat with
//         setUsers(usersRes.data.filter(user => user.id !== userIdd));
//       } catch (err) {
//         console.error('Error fetching users:', err);
//         // Handle unauthorized/forbidden errors (commented out as per original)
//         // if (err.response && (err.response.status === 401 || err.response.status === 403)) {
//         //   localStorage.clear();
//         //   navigate('/');
//         // }
//       }
//     };

//     fetchAuthUserAndUsers();
//   }, [jwtToken, userIdd, navigate]); // Dependencies for this effect

//   // Callback to connect to WebSocket and subscribe to message queue
//   const connectWebSocket = useCallback(() => {
//     if (!jwtToken || !userIdd) {
//       console.warn("JWT Token or User ID not available for WebSocket connection.");
//       return;
//     }

//     // If an existing STOMP client is active, deactivate it before creating a new one
//     if (stompClientRef.current?.connected) {
//       stompClientRef.current.deactivate();
//       console.log('Deactivated previous STOMP client.');
//     }

//     const client = new Client({
//       webSocketFactory: () => new SockJS(WEBSOCKET_URL), // Use SockJS for WebSocket connection
//       connectHeaders: {
//         Authorization: `Bearer ${jwtToken}` // Pass JWT token for authentication
//       },
//       debug: (str) => {
//         // console.log('STOMP Debug:', str); // Uncomment for detailed STOMP debugging
//       },
//       onConnect: () => {
//         console.log('Connected via STOMP');

//         // Subscribe to the user-specific message queue
//         client.subscribe(`/user/queue/messages`, (msg) => {
//           const body = JSON.parse(msg.body);
//           console.log("Received message:", body);

//           // Only update messages if the received message belongs to the currently active conversation
//           // Use currentConversationIdRef.current to get the latest conversation ID
//           if (body.conversationId === currentConversationIdRef.current) {
//             setMessages(prev => [...prev, body]);
//           } else {
//             console.log("Received message for a different conversation, ignoring:", body.conversationId);
//           }
//         });

//         // Publish a message to add the user to the chat (if required by backend)
//         client.publish({
//           destination: '/app/chat.addUser',
//           body: JSON.stringify({ userId: userIdd }) // Send user ID if backend expects it
//         });
//       },
//       onStompError: (frame) => {
//         console.error('STOMP Error:', frame.headers['message']);
//         console.error(frame.body);
//         setErrorMessage(`WebSocket Error: ${frame.headers['message'] || 'Connection failed.'}`);
//         setShowErrorModal(true);
//       },
//       onDisconnect: () => {
//         console.log('STOMP Disconnected.');
//         stompClientRef.current = null; // Clear the ref on disconnect
//       },
//       reconnectDelay: 5000 // Attempt to reconnect every 5 seconds
//     });

//     client.activate(); // Activate the STOMP client to establish connection
//     stompClientRef.current = client; // Store the client instance in the ref
//   }, [jwtToken, userIdd]); // Dependencies for this useCallback

//   // Effect to scroll to the bottom whenever messages array updates
//   useEffect(() => {
//     scrollToBottom();
//   }, [messages]);

//   // Effect to connect WebSocket when component mounts or JWT token/userIdd changes
//   // This ensures a WebSocket connection is always attempted when the user is authenticated
//   useEffect(() => {
//     if (jwtToken && userIdd) {
//       connectWebSocket();
//     }
//     // Cleanup function to deactivate STOMP client on unmount
//     return () => {
//       if (stompClientRef.current?.connected) {
//         stompClientRef.current.deactivate();
//         console.log('STOMP client deactivated on component unmount.');
//       }
//     };
//   }, [jwtToken, userIdd, connectWebSocket]);

//   // Function to start a new chat or load an existing conversation
//   const startChat = async (recipientId) => {
//     try {
//       // Set the current recipient ID
//       setCurrentRecipientId(recipientId);
//       // Clear messages when switching conversations
//       setMessages([]);
//       setInputMessage(''); // Clear input field

//       // Request to get or create a one-to-one conversation
//       const res = await axios.post(`${CHAT_API_BASE_URL}/conversation/one-to-one/${recipientId}`, {}, {
//         headers: { Authorization: `Bearer ${jwtToken}` }
//       });

//       const conversationId = res.data.id;
//       setCurrentConversationId(conversationId); // Set the current conversation ID

//       // Fetch historical messages for the new conversation
//       const messagesRes = await axios.get(`${CHAT_API_BASE_URL}/messages/${conversationId}`, {
//         headers: { Authorization: `Bearer ${jwtToken}` }
//       });
//       setMessages(messagesRes.data); // Set the fetched messages

//       // Ensure WebSocket is connected and ready for this conversation
//       // The connectWebSocket is already called on mount, so it should be active.
//       // If it's not connected for some reason, we can try activating it again.
//       if (!stompClientRef.current?.connected) {
//         console.log("WebSocket not connected when starting chat, attempting to reconnect...");
//         connectWebSocket(); // Reconnect if not connected
//       }
//       // No need to pass conversationId to connectWebSocket here, as the subscription uses the ref.

//     } catch (err) {
//       console.error('Error starting chat:', err);
//       setErrorMessage(`Failed to start chat: ${err.response?.data?.message || err.message}`);
//       setShowErrorModal(true);
//       // Handle unauthorized/forbidden errors (commented out as per original)
//       // if (err.response && (err.response.status === 401 || err.response.status === 403)) {
//       //   localStorage.clear();
//       //   navigate('/');
//       // }
//     }
//   };

//   // Function to send a message
//   const sendMessage = () => {
//     const client = stompClientRef.current;

//     // Check if WebSocket is connected, a conversation is selected, and message is not empty
//     if (!client || !client.connected) {
//       setErrorMessage("WebSocket is not connected. Please ensure you are online and try again.");
//       setShowErrorModal(true);
//       return;
//     }

//     if (!currentConversationId) {
//       setErrorMessage("No conversation selected. Please select a user to chat with.");
//       setShowErrorModal(true);
//       return;
//     }

//     if (!inputMessage.trim()) {
//       setErrorMessage("Message cannot be empty.");
//       setShowErrorModal(true);
//       return;
//     }

//     // Construct the message payload
//     const messagePayload = {
//       conversationId: currentConversationId,
//       recipientId: currentRecipientId,
//       content: inputMessage.trim(), // Trim whitespace from message content
//       senderId: currentUser // Include senderId for proper message display
//     };

//     // Publish the message to the STOMP broker
//     client.publish({
//       destination: '/app/chat.sendMessage',
//       body: JSON.stringify(messagePayload)
//     });

//     // Optimistically update the UI with the sent message
//     setMessages(prev => [...prev, {
//       senderId: currentUser,
//       content: inputMessage.trim(),
//       timestamp: new Date().toISOString(), // Use current time for optimistic display
//       conversationId: currentConversationId
//     }]);

//     setInputMessage(''); // Clear the input field after sending
//   };

//   // Logout function (commented out as per original request)
//   const logout = () => {
//     // stompClientRef.current?.deactivate();
//     // localStorage.clear();
//     // navigate('/');
//   };

//   // Helper function to get recipient's phone number for display
//   const getRecipientInfo = (id) => {
//     const recipient = users.find(u => u.id === id);
//     return recipient ? recipient.phone : 'Unknown User';
//   };

//   return (
//     <div className="flex h-screen bg-gray-100 font-inter antialiased">
     
//       {showErrorModal && <Modal message={errorMessage} onClose={() => setShowErrorModal(false)} />}

      
//       <div className="w-1/4 bg-white border-r border-gray-200 flex flex-col shadow-lg rounded-l-xl overflow-hidden">
//         <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md">
//           <h3 className="text-2xl font-bold">Chats</h3>
//           <button
//             onClick={logout}
//             className="bg-red-500 text-white py-1.5 px-4 rounded-full text-sm font-medium hover:bg-red-600 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-red-400"
//           >
//             Logout
//           </button>
//         </div>
//         <div className="flex-1 overflow-y-auto custom-scrollbar">
//           {users.length === 0 ? (
//             <p className="p-6 text-gray-500 text-center text-base italic">No other users found to chat with.</p>
//           ) : (
//             users.map(u => (
//               <div
//                 key={u.id}
//                 onClick={() => startChat(u.id)}
//                 className={`flex items-center p-4 cursor-pointer border-b border-gray-100 transition-all duration-200 ease-in-out
//                   ${currentRecipientId === u.id ? 'bg-blue-50 font-semibold border-l-4 border-blue-500' : 'hover:bg-gray-50'}`}
//               >
//                 <div className="w-12 h-12 rounded-full bg-blue-500 text-white flex items-center justify-center text-xl font-bold mr-4 shadow-md flex-shrink-0">
//                   {u.phone?.charAt(0).toUpperCase() || 'U'}
//                 </div>
//                 <div className="flex-1">
//                   <p className="text-gray-900 text-lg">{u.phone}</p>
//                   <p className="text-gray-600 text-sm">Click to chat</p>
//                 </div>
//               </div>
//             ))
//           )}
//         </div>
//       </div>

      
//       <div className="w-3/4 flex flex-col bg-white rounded-r-xl shadow-lg overflow-hidden">
//         {currentRecipientId ? (
//           <>
            
//             <div className="p-4 border-b border-gray-200 flex items-center bg-gradient-to-r from-green-500 to-green-600 text-white shadow-md">
//               <div className="w-12 h-12 rounded-full bg-green-700 text-white flex items-center justify-center text-xl font-bold mr-4 shadow-md flex-shrink-0">
//                 {getRecipientInfo(currentRecipientId).charAt(0).toUpperCase()}
//               </div>
//               <h3 className="text-xl font-semibold">{getRecipientInfo(currentRecipientId)}</h3>
//               {stompClientRef.current?.connected ? (
//                 <span className="ml-auto text-white text-sm flex items-center opacity-90">
//                   <span className="h-3 w-3 rounded-full bg-green-300 mr-2 animate-pulse shadow-sm"></span> Online
//                 </span>
//               ) : (
//                 <span className="ml-auto text-white text-sm flex items-center opacity-90">
//                   <span className="h-3 w-3 rounded-full bg-red-300 mr-2 shadow-sm"></span> Offline
//                 </span>
//               )}
//             </div>

            
//             <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50 custom-scrollbar">
//               {messages.length === 0 ? (
//                 <p className="text-gray-500 text-center text-base italic mt-12">No messages yet. Start the conversation!</p>
//               ) : (
//                 messages.map((m, idx) => (
//                   <div
//                     key={idx}
//                     className={`flex ${m.senderId === currentUser ? 'justify-end' : 'justify-start'}`}
//                   >
//                     <div className={`max-w-[75%] py-3 px-4 rounded-xl shadow-md text-base break-words
//                       ${m.senderId === currentUser
//                         ? 'bg-blue-500 text-white rounded-br-none' // User's message: blue, right-aligned
//                         : 'bg-gray-200 text-gray-800 rounded-bl-none' // Other's message: gray, left-aligned
//                       }`}
//                     >
//                       {m.content}
//                       <p className={`text-xs mt-1 ${m.senderId === currentUser ? 'text-blue-200' : 'text-gray-600'} text-right`}>
//                         {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
//                       </p>
//                     </div>
//                   </div>
//                 ))
//               )}
//               <div ref={messagesEndRef} /> 
//             </div>

          
//             <div className="p-4 bg-white border-t border-gray-200 flex items-center gap-3 shadow-inner">
//               <input
//                 value={inputMessage}
//                 onChange={(e) => setInputMessage(e.target.value)}
//                 onKeyPress={(e) => { if (e.key === 'Enter') sendMessage(); }}
//                 className="flex-1 rounded-full border border-gray-300 py-3 px-5 focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-800 text-base placeholder-gray-500"
//                 placeholder="Type your message..."
//               />
//               <button
//                 onClick={sendMessage}
//                 className="bg-blue-600 text-white rounded-full p-3.5 hover:bg-blue-700 transition-colors shadow-lg flex items-center justify-center
//                            transform active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
//               >
//                 <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
//                   <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
//                 </svg>
//               </button>
//             </div>
//           </>
//         ) : (
//           // Welcome message when no chat is selected
//           <div className="flex-1 flex flex-col items-center justify-center text-gray-500 text-xl p-8 text-center">
//             <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 text-blue-400 mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
//               <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
//             </svg>
//             <p className="font-semibold text-gray-700">👋 Welcome to your chat!</p>
//             <p className="mt-2 text-lg">Select a user from the left sidebar to start a conversation.</p>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// export default ChatHomePage;



//ISSUE-4 phone number in place if UUID

// import React, { useState, useEffect, useRef, useCallback } from 'react';
// import { useNavigate } from 'react-router-dom';
// import axios from 'axios';
// import SockJS from 'sockjs-client';
// import { Client } from '@stomp/stompjs';

// // Base URLs for your backend services
// const BACKEND_URI_PROTECTED = process.env.REACT_APP_BACKEND_URI_PROTECTED || "http://localhost:8084";
// const CHAT_API_BASE_URL = `${BACKEND_URI_PROTECTED}/api/v1/chat`;
// const WEBSOCKET_URL = "http://localhost:8082/ws";

// // Custom Modal Component for general alerts (e.g., WebSocket connection errors)
// const Modal = ({ message, onClose }) => {
//   return (
//     <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
//       <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full text-center">
//         <h3 className="text-lg font-semibold text-gray-800 mb-4">Notification</h3>
//         <p className="text-gray-700 mb-6">{message}</p>
//         <button
//           onClick={onClose}
//           className="bg-blue-600 text-white py-2 px-5 rounded-full hover:bg-blue-700 transition-colors duration-200 shadow-md"
//         >
//           Got it!
//         </button>
//       </div>
//     </div>
//   );
// };

// // Custom Toast Component for temporary notifications (e.g., empty message)
// const Toast = ({ message, duration = 3000, onClose }) => {
//   useEffect(() => {
//     const timer = setTimeout(() => {
//       onClose();
//     }, duration);
//     return () => clearTimeout(timer);
//   }, [duration, onClose]);

//   return (
//     <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-800 text-white px-6 py-3 rounded-full shadow-lg z-50 text-sm animate-fade-in-up">
//       {message}
//     </div>
//   );
// };

// function ChatHomePage() {
//   // State variables for managing chat data and UI
//   const [users, setUsers] = useState([]);
//   const [messages, setMessages] = useState([]);
//   const [inputMessage, setInputMessage] = useState('');
//   const [currentConversationId, setCurrentConversationId] = useState(null);
//   const [currentRecipientId, setCurrentRecipientId] = useState(null);
//   const [currentUser, setCurrentUser] = useState(null);
//   const [showErrorModal, setShowErrorModal] = useState(false);
//   const [errorMessage, setErrorMessage] = useState('');
//   const [showToast, setShowToast] = useState(false); // State for showing toast
//   const [toastMessage, setToastMessage] = useState(''); // Message for toast

//   // React Router hook for navigation
//   const navigate = useNavigate();

//   // Retrieve JWT token and current user ID from localStorage
//   const jwtToken = localStorage.getItem('jwtToken');
//   const userIdd = localStorage.getItem('currentUserId');

//   // Refs for DOM elements and STOMP client instance
//   const messagesEndRef = useRef(null);
//   const stompClientRef = useRef(null);
//   const currentConversationIdRef = useRef(currentConversationId); // Ref for WebSocket subscription

//   // Update the ref whenever currentConversationId changes
//   useEffect(() => {
//     currentConversationIdRef.current = currentConversationId;
//   }, [currentConversationId]);

//   // Function to scroll to the bottom of the messages container
//   const scrollToBottom = () => {
//     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   };

//   // Helper function to parse the problematic senderId field
//   const getActualSenderId = (messageSenderIdField) => {
//     try {
//       // Attempt to parse if it's a JSON string
//       const parsed = JSON.parse(messageSenderIdField);
//       return parsed.senderId || messageSenderIdField; // Return inner senderId or original if not found
//     } catch (e) {
//       // If parsing fails, it's already a plain ID
//       return messageSenderIdField;
//     }
//   };

//   // Effect to fetch authenticated user details and other users on component mount
//   useEffect(() => {
//     const fetchAuthUserAndUsers = async () => {
//       try {
//         if (jwtToken && userIdd) {
//           setCurrentUser(userIdd);
//         } else {
//           // localStorage.clear();
//           // navigate('/');
//           return;
//         }

//         const usersRes = await axios.get(`${BACKEND_URI_PROTECTED}/api/v1/users/getAllUsers`, {
//           headers: { Authorization: `Bearer ${jwtToken}` }
//         });
//         setUsers(usersRes.data.filter(user => user.id !== userIdd));
//       } catch (err) {
//         console.error('Error fetching users:', err);
//         if (err.response && (err.response.status === 401 || err.response.status === 403)) {
//           // localStorage.clear();
//           // navigate('/');
//         }
//       }
//     };

//     fetchAuthUserAndUsers();
//   }, [jwtToken, userIdd, navigate]);

//   // Callback to connect to WebSocket and subscribe to message queue
//   const connectWebSocket = useCallback(() => {
//     if (!jwtToken || !userIdd) {
//       console.warn("JWT Token or User ID not available for WebSocket connection.");
//       return;
//     }

//     if (stompClientRef.current?.connected) {
//       stompClientRef.current.deactivate();
//       console.log('Deactivated previous STOMP client.');
//     }

//     const client = new Client({
//       webSocketFactory: () => new SockJS(WEBSOCKET_URL),
//       connectHeaders: {
//         Authorization: `Bearer ${jwtToken}`
//       },
//       debug: (str) => {
//         // console.log('STOMP Debug:', str);
//       },
//       onConnect: () => {
//         console.log('Connected via STOMP');

//         client.subscribe(`/user/queue/messages`, (msg) => {
//           const body = JSON.parse(msg.body);
//           console.log("Received message:", body);

//           // Process the incoming message's senderId
//           const processedMessage = {
//             ...body,
//             senderId: getActualSenderId(body.senderId) // Parse the senderId here
//           };

//           if (processedMessage.conversationId === currentConversationIdRef.current) {
//             setMessages(prev => [...prev, processedMessage]);
//           } else {
//             console.log("Received message for a different conversation, ignoring:", processedMessage.conversationId);
//           }
//         });

//         client.publish({
//           destination: '/app/chat.addUser',
//           body: JSON.stringify({ userId: userIdd })
//         });
//       },
//       onStompError: (frame) => {
//         console.error('STOMP Error:', frame.headers['message']);
//         console.error(frame.body);
//         setErrorMessage(`WebSocket Error: ${frame.headers['message'] || 'Connection failed.'}`);
//         setShowErrorModal(true);
//       },
//       onDisconnect: () => {
//         console.log('STOMP Disconnected.');
//         stompClientRef.current = null;
//       },
//       reconnectDelay: 5000
//     });

//     client.activate();
//     stompClientRef.current = client;
//   }, [jwtToken, userIdd]);

//   // Effect to scroll to the bottom whenever messages array updates
//   useEffect(() => {
//     scrollToBottom();
//   }, [messages]);

//   // Effect to connect WebSocket when component mounts or JWT token/userIdd changes
//   useEffect(() => {
//     if (jwtToken && userIdd) {
//       connectWebSocket();
//     }
//     return () => {
//       if (stompClientRef.current?.connected) {
//         stompClientRef.current.deactivate();
//         console.log('STOMP client deactivated on component unmount.');
//       }
//     };
//   }, [jwtToken, userIdd, connectWebSocket]);

//   // Function to start a new chat or load an existing conversation
//   const startChat = async (recipientId) => {
//     try {
//       setCurrentRecipientId(recipientId);
//       setMessages([]);
//       setInputMessage('');

//       const res = await axios.post(`${CHAT_API_BASE_URL}/conversation/one-to-one/${recipientId}`, {}, {
//         headers: { Authorization: `Bearer ${jwtToken}` }
//       });

//       const conversationId = res.data.id;
//       setCurrentConversationId(conversationId);

//       const messagesRes = await axios.get(`${CHAT_API_BASE_URL}/messages/${conversationId}`, {
//         headers: { Authorization: `Bearer ${jwtToken}` }
//       });

//       // Process historical messages' senderId
//       const processedMessages = messagesRes.data.map(m => ({
//         ...m,
//         senderId: getActualSenderId(m.senderId) // Parse the senderId here
//       }));
//       setMessages(processedMessages);

//       if (!stompClientRef.current?.connected) {
//         console.log("WebSocket not connected when starting chat, attempting to reconnect...");
//         connectWebSocket();
//       }

//     } catch (err) {
//       console.error('Error starting chat:', err);
//       setErrorMessage(`Failed to start chat: ${err.response?.data?.message || err.message}`);
//       setShowErrorModal(true);
//     }
//   };

//   // Function to show a toast message
//   const showToastMessage = (message) => {
//     setToastMessage(message);
//     setShowToast(true);
//     // The Toast component itself handles the timer to hide it
//   };

//   // Function to send a message
//   const sendMessage = () => {
//     const client = stompClientRef.current;

//     if (!client || !client.connected) {
//       setErrorMessage("WebSocket is not connected. Please ensure you are online and try again.");
//       setShowErrorModal(true);
//       return;
//     }

//     if (!currentConversationId) {
//       showToastMessage("No conversation selected. Please select a user to chat with.");
//       return;
//     }

//     if (!inputMessage.trim()) {
//       showToastMessage("Message cannot be empty.");
//       return;
//     }

//     const messagePayload = {
//       conversationId: currentConversationId,
//       recipientId: currentRecipientId,
//       content: inputMessage.trim(),
//       senderId: currentUser // This is correct for optimistic update
//     };

//     client.publish({
//       destination: '/app/chat.sendMessage',
//       body: JSON.stringify(messagePayload)
//     });

//     // Optimistically update the UI with the sent message
//     setMessages(prev => [...prev, {
//       senderId: currentUser, // Use the plain currentUser ID here
//       content: inputMessage.trim(),
//       timestamp: new Date().toISOString(),
//       conversationId: currentConversationId
//     }]);

//     setInputMessage('');
//   };

//   // Logout function (commented out as per original request)
//   const logout = () => {
//     // stompClientRef.current?.deactivate();
//     // localStorage.clear();
//     // navigate('/');
//   };

//   // Helper function to get recipient's phone number for display
//   const getRecipientInfo = (id) => {
//     const recipient = users.find(u => u.id === id);
//     return recipient ? recipient.phone : 'Unknown User';
//   };

//   // Helper function to get current user's info for display
//   const getCurrentUserInfo = () => {
//     // Find the current user in the 'users' list (if they are also in it, e.g., for their own profile)
//     // Otherwise, use the userIdd from localStorage directly.
//     const user = users.find(u => u.id === currentUser);
//     return user ? user.phone : userIdd; // Assuming userIdd itself can be displayed or is a phone number
//   };

//   return (
//     <div className="flex h-screen bg-gray-100 font-inter antialiased">
//       {/* Custom Error Modal */}
//       {showErrorModal && <Modal message={errorMessage} onClose={() => setShowErrorModal(false)} />}

//       {/* Custom Toast Notification */}
//       {showToast && <Toast message={toastMessage} onClose={() => setShowToast(false)} />}

//       {/* Left Pane: User List */}
//       <div className="w-1/4 bg-white border-r border-gray-200 flex flex-col shadow-lg rounded-l-xl overflow-hidden">
//         <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md">
//           <h3 className="text-2xl font-bold">Chats</h3>
//           <div className="flex items-center space-x-3">
//             {/* Current User Info Button */}
//             <div className="relative group">
//               <button className="bg-blue-500 text-white py-1.5 px-3 rounded-full text-sm font-medium hover:bg-blue-600 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
//                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
//                   <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9.293 12.293a1 1 0 001.414 1.414L12 11.414V15a1 1 0 102 0v-4.586l1.293 1.293a1 1 0 001.414-1.414l-3-3a1 1 0 00-1.414 0l-3 3z" clipRule="evenodd" />
//                 </svg>
//               </button>
//               {/* Adjusted tooltip positioning */}
//               <div className="absolute left-1/2 transform -translate-x-1/2 top-full mt-2 w-max px-3 py-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
//                 Current User: {getCurrentUserInfo()}
//               </div>
//             </div>
//             <button
//               onClick={logout}
//               className="bg-red-500 text-white py-1.5 px-4 rounded-full text-sm font-medium hover:bg-red-600 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-red-400"
//             >
//               Logout
//             </button>
//           </div>
//         </div>
//         <div className="flex-1 overflow-y-auto custom-scrollbar">
//           {users.length === 0 ? (
//             <p className="p-6 text-gray-500 text-center text-base italic">No other users found to chat with.</p>
//           ) : (
//             users.map(u => (
//               <div
//                 key={u.id}
//                 onClick={() => startChat(u.id)}
//                 className={`flex items-center p-4 cursor-pointer border-b border-gray-100 transition-all duration-200 ease-in-out
//                   ${currentRecipientId === u.id ? 'bg-blue-50 font-semibold border-l-4 border-blue-500' : 'hover:bg-gray-50'}`}
//               >
//                 <div className="w-12 h-12 rounded-full bg-blue-500 text-white flex items-center justify-center text-xl font-bold mr-4 shadow-md flex-shrink-0">
//                   {u.phone?.charAt(0).toUpperCase() || 'U'}
//                 </div>
//                 <div className="flex-1">
//                   <p className="text-gray-900 text-lg">{u.phone}</p>
//                   <p className="text-gray-600 text-sm">Click to chat</p>
//                 </div>
//               </div>
//             ))
//           )}
//         </div>
//       </div>

//       {/* Right Pane: Chat Area */}
//       <div className="w-3/4 flex flex-col bg-white rounded-r-xl shadow-lg overflow-hidden">
//         {currentRecipientId ? (
//           <>
//             {/* Chat Header */}
//             <div className="p-4 border-b border-gray-200 flex items-center bg-gradient-to-r from-green-500 to-green-600 text-white shadow-md">
//               <div className="w-12 h-12 rounded-full bg-green-700 text-white flex items-center justify-center text-xl font-bold mr-4 shadow-md flex-shrink-0">
//                 {getRecipientInfo(currentRecipientId).charAt(0).toUpperCase()}
//               </div>
//               <h3 className="text-xl font-semibold">{getRecipientInfo(currentRecipientId)}</h3>
//               {stompClientRef.current?.connected ? (
//                 <span className="ml-auto text-white text-sm flex items-center opacity-90">
//                   <span className="h-3 w-3 rounded-full bg-green-300 mr-2 animate-pulse shadow-sm"></span> Online
//                 </span>
//               ) : (
//                 <span className="ml-auto text-white text-sm flex items-center opacity-90">
//                   <span className="h-3 w-3 rounded-full bg-red-300 mr-2 shadow-sm"></span> Offline
//                 </span>
//               )}
//             </div>

//             {/* Messages Display Area */}
//             <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50 custom-scrollbar">
//               {messages.length === 0 ? (
//                 <p className="text-gray-500 text-center text-base italic mt-12">No messages yet. Start the conversation!</p>
//               ) : (
//                 messages.map((m, idx) => (
//                   <div
//                     key={idx}
//                     className={`flex ${m.senderId === currentUser ? 'justify-end' : 'justify-start'}`}
//                   >
//                     <div className={`max-w-[75%] py-3 px-4 rounded-xl shadow-md text-base break-words
//                       ${m.senderId === currentUser
//                         ? 'bg-blue-500 text-white rounded-br-none'
//                         : 'bg-gray-200 text-gray-800 rounded-bl-none'
//                       }`}
//                     >
//                       {m.content}
//                       <p className={`text-xs mt-1 ${m.senderId === currentUser ? 'text-blue-200' : 'text-gray-600'} text-right`}>
//                         {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
//                       </p>
//                     </div>
//                   </div>
//                 ))
//               )}
//               <div ref={messagesEndRef} />
//             </div>

//             {/* Message Input Area */}
//             <div className="p-4 bg-white border-t border-gray-200 flex items-center gap-3 shadow-inner">
//               <input
//                 value={inputMessage}
//                 onChange={(e) => setInputMessage(e.target.value)}
//                 onKeyPress={(e) => { if (e.key === 'Enter') sendMessage(); }}
//                 className="flex-1 rounded-full border border-gray-300 py-3 px-5 focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-800 text-base placeholder-gray-500"
//                 placeholder="Type your message..."
//               />
//               <button
//                 onClick={sendMessage}
//                 className="bg-blue-600 text-white rounded-full p-3.5 hover:bg-blue-700 transition-colors shadow-lg flex items-center justify-center
//                            transform active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
//               >
//                 <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
//                   <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
//                 </svg>
//               </button>
//             </div>
//           </>
//         ) : (
//           <div className="flex-1 flex flex-col items-center justify-center text-gray-500 text-xl p-8 text-center">
//             <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 text-blue-400 mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
//               <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
//             </svg>
//             <p className="font-semibold text-gray-700">👋 Welcome to your chat!</p>
//             <p className="mt-2 text-lg">Select a user from the left sidebar to start a conversation.</p>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// export default ChatHomePage;

//ISSUE-4 getting error occur so blocking call 

// import React, { useState, useEffect, useRef, useCallback } from 'react';
// import { useNavigate } from 'react-router-dom';
// import axios from 'axios';
// import SockJS from 'sockjs-client';
// import { Client } from '@stomp/stompjs';

// // Base URLs for your backend services
// const BACKEND_URI_PROTECTED = process.env.REACT_APP_BACKEND_URI_PROTECTED || "http://localhost:8084";
// const CHAT_API_BASE_URL = `${BACKEND_URI_PROTECTED}/api/v1/chat`;
// const WEBSOCKET_URL = "http://localhost:8082/ws";

// // Custom Modal Component for general alerts (e.g., WebSocket connection errors)
// const Modal = ({ message, onClose }) => {
//   return (
//     <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
//       <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full text-center">
//         <h3 className="text-lg font-semibold text-gray-800 mb-4">Notification</h3>
//         <p className="text-gray-700 mb-6">{message}</p>
//         <button
//           onClick={onClose}
//           className="bg-blue-600 text-white py-2 px-5 rounded-full hover:bg-blue-700 transition-colors duration-200 shadow-md"
//         >
//           Got it!
//         </button>
//       </div>
//     </div>
//   );
// };

// // Custom Toast Component for temporary notifications (e.g., empty message)
// const Toast = ({ message, duration = 3000, onClose }) => {
//   useEffect(() => {
//     const timer = setTimeout(() => {
//       onClose();
//     }, duration);
//     return () => clearTimeout(timer);
//   }, [duration, onClose]);

//   return (
//     <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-800 text-white px-6 py-3 rounded-full shadow-lg z-50 text-sm animate-fade-in-up">
//       {message}
//     </div>
//   );
// };

// function ChatHomePage() {
//   // State variables for managing chat data and UI
//   const [users, setUsers] = useState([]);
//   const [messages, setMessages] = useState([]);
//   const [inputMessage, setInputMessage] = useState('');
//   const [currentConversationId, setCurrentConversationId] = useState(null);
//   const [currentRecipientId, setCurrentRecipientId] = useState(null);
//   const [currentUser, setCurrentUser] = useState(null);
//   const [currentUsersPhoneNumber, setCurrentUsersPhoneNumber] = useState(null); // New state for current user's phone number
//   const [showErrorModal, setShowErrorModal] = useState(false);
//   const [errorMessage, setErrorMessage] = useState('');
//   const [showToast, setShowToast] = useState(false); // State for showing toast
//   const [toastMessage, setToastMessage] = useState(''); // Message for toast

//   // React Router hook for navigation
//   const navigate = useNavigate();

//   // Retrieve JWT token and current user ID from localStorage
//   const jwtToken = localStorage.getItem('jwtToken');
//   const userIdd = localStorage.getItem('currentUserId');

//   // Refs for DOM elements and STOMP client instance
//   const messagesEndRef = useRef(null);
//   const stompClientRef = useRef(null);
//   const currentConversationIdRef = useRef(currentConversationId); // Ref for WebSocket subscription

//   // Update the ref whenever currentConversationId changes
//   useEffect(() => {
//     currentConversationIdRef.current = currentConversationId;
//   }, [currentConversationId]);

//   // Function to scroll to the bottom of the messages container
//   const scrollToBottom = () => {
//     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   };

//   // Helper function to parse the problematic senderId field
//   const getActualSenderId = (messageSenderIdField) => {
//     try {
//       // Attempt to parse if it's a JSON string
//       const parsed = JSON.parse(messageSenderIdField);
//       return parsed.senderId || messageSenderIdField; // Return inner senderId or original if not found
//     } catch (e) {
//       // If parsing fails, it's already a plain ID
//       return messageSenderIdField;
//     }
//   };

//   // Effect to fetch authenticated user details and other users on component mount
//   useEffect(() => {
//     const fetchAuthUserAndUsers = async () => {
//       try {
//         if (jwtToken && userIdd) {
//           setCurrentUser(userIdd);

//           // Fetch current user's own details to get their phone number
//           const currentUserRes = await axios.get(`${BACKEND_URI_PROTECTED}/api/v1/users/${userIdd}`, {
//             headers: { Authorization: `Bearer ${jwtToken}` }
//           });
//           // Assuming the API response for a single user contains a 'phone' field
//           setCurrentUsersPhoneNumber(currentUserRes.data.phone);

//         } else {
//           // If no token or user ID, clear local storage and navigate to login (commented out as per original)
//           // localStorage.clear();
//           // navigate('/');
//           return;
//         }

//         const usersRes = await axios.get(`${BACKEND_URI_PROTECTED}/api/v1/users/getAllUsers`, {
//           headers: { Authorization: `Bearer ${jwtToken}` }
//         });
//         setUsers(usersRes.data.filter(user => user.id !== userIdd));
//       } catch (err) {
//         console.error('Error fetching users:', err);
//         if (err.response && (err.response.status === 401 || err.response.status === 403)) {
//           // localStorage.clear();
//           // navigate('/');
//         }
//       }
//     };

//     fetchAuthUserAndUsers();
//   }, [jwtToken, userIdd, navigate]); // Added currentUsersPhoneNumber to dependencies to avoid lint warning, though not strictly necessary for logic here

//   // Callback to connect to WebSocket and subscribe to message queue
//   const connectWebSocket = useCallback(() => {
//     if (!jwtToken || !userIdd) {
//       console.warn("JWT Token or User ID not available for WebSocket connection.");
//       return;
//     }

//     if (stompClientRef.current?.connected) {
//       stompClientRef.current.deactivate();
//       console.log('Deactivated previous STOMP client.');
//     }

//     const client = new Client({
//       webSocketFactory: () => new SockJS(WEBSOCKET_URL),
//       connectHeaders: {
//         Authorization: `Bearer ${jwtToken}`
//       },
//       debug: (str) => {
//         // console.log('STOMP Debug:', str);
//       },
//       onConnect: () => {
//         console.log('Connected via STOMP');

//         client.subscribe(`/user/queue/messages`, (msg) => {
//           const body = JSON.parse(msg.body);
//           console.log("Received message:", body);

//           // Process the incoming message's senderId
//           const processedMessage = {
//             ...body,
//             senderId: getActualSenderId(body.senderId) // Parse the senderId here
//           };

//           if (processedMessage.conversationId === currentConversationIdRef.current) {
//             setMessages(prev => [...prev, processedMessage]);
//           } else {
//             console.log("Received message for a different conversation, ignoring:", processedMessage.conversationId);
//           }
//         });

//         client.publish({
//           destination: '/app/chat.addUser',
//           body: JSON.stringify({ userId: userIdd })
//         });
//       },
//       onStompError: (frame) => {
//         console.error('STOMP Error:', frame.headers['message']);
//         console.error(frame.body);
//         setErrorMessage(`WebSocket Error: ${frame.headers['message'] || 'Connection failed.'}`);
//         setShowErrorModal(true);
//       },
//       onDisconnect: () => {
//         console.log('STOMP Disconnected.');
//         stompClientRef.current = null;
//       },
//       reconnectDelay: 5000
//     });

//     client.activate();
//     stompClientRef.current = client;
//   }, [jwtToken, userIdd]);

//   // Effect to scroll to the bottom whenever messages array updates
//   useEffect(() => {
//     scrollToBottom();
//   }, [messages]);

//   // Effect to connect WebSocket when component mounts or JWT token/userIdd changes
//   useEffect(() => {
//     if (jwtToken && userIdd) {
//       connectWebSocket();
//     }
//     return () => {
//       if (stompClientRef.current?.connected) {
//         stompClientRef.current.deactivate();
//         console.log('STOMP client deactivated on component unmount.');
//       }
//     };
//   }, [jwtToken, userIdd, connectWebSocket]);

//   // Function to start a new chat or load an existing conversation
//   const startChat = async (recipientId) => {
//     try {
//       setCurrentRecipientId(recipientId);
//       setMessages([]);
//       setInputMessage('');

//       const res = await axios.post(`${CHAT_API_BASE_URL}/conversation/one-to-one/${recipientId}`, {}, {
//         headers: { Authorization: `Bearer ${jwtToken}` }
//       });

//       const conversationId = res.data.id;
//       setCurrentConversationId(conversationId);

//       const messagesRes = await axios.get(`${CHAT_API_BASE_URL}/messages/${conversationId}`, {
//         headers: { Authorization: `Bearer ${jwtToken}` }
//       });

//       // Process historical messages' senderId
//       const processedMessages = messagesRes.data.map(m => ({
//         ...m,
//         senderId: getActualSenderId(m.senderId) // Parse the senderId here
//       }));
//       setMessages(processedMessages);

//       if (!stompClientRef.current?.connected) {
//         console.log("WebSocket not connected when starting chat, attempting to reconnect...");
//         connectWebSocket();
//       }

//     } catch (err) {
//       console.error('Error starting chat:', err);
//       setErrorMessage(`Failed to start chat: ${err.response?.data?.message || err.message}`);
//       setShowErrorModal(true);
//     }
//   };

//   // Function to show a toast message
//   const showToastMessage = (message) => {
//     setToastMessage(message);
//     setShowToast(true);
//     // The Toast component itself handles the timer to hide it
//   };

//   // Function to send a message
//   const sendMessage = () => {
//     const client = stompClientRef.current;

//     if (!client || !client.connected) {
//       setErrorMessage("WebSocket is not connected. Please ensure you are online and try again.");
//       setShowErrorModal(true);
//       return;
//     }

//     if (!currentConversationId) {
//       showToastMessage("No conversation selected. Please select a user to chat with.");
//       return;
//     }

//     if (!inputMessage.trim()) {
//       showToastMessage("Message cannot be empty.");
//       return;
//     }

//     const messagePayload = {
//       conversationId: currentConversationId,
//       recipientId: currentRecipientId,
//       content: inputMessage.trim(),
//       senderId: currentUser // This is correct for optimistic update
//     };

//     client.publish({
//       destination: '/app/chat.sendMessage',
//       body: JSON.stringify(messagePayload)
//     });

//     // Optimistically update the UI with the sent message
//     setMessages(prev => [...prev, {
//       senderId: currentUser, // Use the plain currentUser ID here
//       content: inputMessage.trim(),
//       timestamp: new Date().toISOString(),
//       conversationId: currentConversationId
//     }]);

//     setInputMessage('');
//   };

//   // Logout function (commented out as per original request)
//   const logout = () => {
//     // stompClientRef.current?.deactivate();
//     // localStorage.clear();
//     // navigate('/');
//   };

//   // Helper function to get recipient's phone number for display
//   const getRecipientInfo = (id) => {
//     const recipient = users.find(u => u.id === id);
//     return recipient ? recipient.phone : 'Unknown User';
//   };

//   // Helper function to get current user's info for display
//   const getCurrentUserInfo = () => {
//     // Now directly return the stored phone number
//     return currentUsersPhoneNumber || 'Loading...';
//   };

//   return (
//     <div className="flex h-screen bg-gray-100 font-inter antialiased">
//       {/* Custom Error Modal */}
//       {showErrorModal && <Modal message={errorMessage} onClose={() => setShowErrorModal(false)} />}

//       {/* Custom Toast Notification */}
//       {showToast && <Toast message={toastMessage} onClose={() => setShowToast(false)} />}

//       {/* Left Pane: User List */}
//       <div className="w-1/4 bg-white border-r border-gray-200 flex flex-col shadow-lg rounded-l-xl overflow-hidden">
//         <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md">
//           <h3 className="text-2xl font-bold">Chats</h3>
//           <div className="flex items-center space-x-3">
//             {/* Current User Info Button */}
//             <div className="relative group">
//               <button className="bg-blue-500 text-white py-1.5 px-3 rounded-full text-sm font-medium hover:bg-blue-600 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
//                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
//                   <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9.293 12.293a1 1 0 001.414 1.414L12 11.414V15a1 1 0 102 0v-4.586l1.293 1.293a1 1 0 001.414-1.414l-3-3a1 1 0 00-1.414 0l-3 3z" clipRule="evenodd" />
//                 </svg>
//               </button>
//               {/* Adjusted tooltip positioning */}
//               <div className="absolute left-1/2 transform -translate-x-1/2 top-full mt-2 w-max px-3 py-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
//                 Current User: {getCurrentUserInfo()}
//               </div>
//             </div>
//             <button
//               onClick={logout}
//               className="bg-red-500 text-white py-1.5 px-4 rounded-full text-sm font-medium hover:bg-red-600 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-red-400"
//             >
//               Logout
//             </button>
//           </div>
//         </div>
//         <div className="flex-1 overflow-y-auto custom-scrollbar">
//           {users.length === 0 ? (
//             <p className="p-6 text-gray-500 text-center text-base italic">No other users found to chat with.</p>
//           ) : (
//             users.map(u => (
//               <div
//                 key={u.id}
//                 onClick={() => startChat(u.id)}
//                 className={`flex items-center p-4 cursor-pointer border-b border-gray-100 transition-all duration-200 ease-in-out
//                   ${currentRecipientId === u.id ? 'bg-blue-50 font-semibold border-l-4 border-blue-500' : 'hover:bg-gray-50'}`}
//               >
//                 <div className="w-12 h-12 rounded-full bg-blue-500 text-white flex items-center justify-center text-xl font-bold mr-4 shadow-md flex-shrink-0">
//                   {u.phone?.charAt(0).toUpperCase() || 'U'}
//                 </div>
//                 <div className="flex-1">
//                   <p className="text-gray-900 text-lg">{u.phone}</p>
//                   <p className="text-gray-600 text-sm">Click to chat</p>
//                 </div>
//               </div>
//             ))
//           )}
//         </div>
//       </div>

//       {/* Right Pane: Chat Area */}
//       <div className="w-3/4 flex flex-col bg-white rounded-r-xl shadow-lg overflow-hidden">
//         {currentRecipientId ? (
//           <>
//             {/* Chat Header */}
//             <div className="p-4 border-b border-gray-200 flex items-center bg-gradient-to-r from-green-500 to-green-600 text-white shadow-md">
//               <div className="w-12 h-12 rounded-full bg-green-700 text-white flex items-center justify-center text-xl font-bold mr-4 shadow-md flex-shrink-0">
//                 {getRecipientInfo(currentRecipientId).charAt(0).toUpperCase()}
//               </div>
//               <h3 className="text-xl font-semibold">{getRecipientInfo(currentRecipientId)}</h3>
//               {stompClientRef.current?.connected ? (
//                 <span className="ml-auto text-white text-sm flex items-center opacity-90">
//                   <span className="h-3 w-3 rounded-full bg-green-300 mr-2 animate-pulse shadow-sm"></span> Online
//                 </span>
//               ) : (
//                 <span className="ml-auto text-white text-sm flex items-center opacity-90">
//                   <span className="h-3 w-3 rounded-full bg-red-300 mr-2 shadow-sm"></span> Offline
//                 </span>
//               )}
//             </div>

//             {/* Messages Display Area */}
//             <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50 custom-scrollbar">
//               {messages.length === 0 ? (
//                 <p className="text-gray-500 text-center text-base italic mt-12">No messages yet. Start the conversation!</p>
//               ) : (
//                 messages.map((m, idx) => (
//                   <div
//                     key={idx}
//                     className={`flex ${m.senderId === currentUser ? 'justify-end' : 'justify-start'}`}
//                   >
//                     <div className={`max-w-[75%] py-3 px-4 rounded-xl shadow-md text-base break-words
//                       ${m.senderId === currentUser
//                         ? 'bg-blue-500 text-white rounded-br-none'
//                         : 'bg-gray-200 text-gray-800 rounded-bl-none'
//                       }`}
//                     >
//                       {m.content}
//                       <p className={`text-xs mt-1 ${m.senderId === currentUser ? 'text-blue-200' : 'text-gray-600'} text-right`}>
//                         {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
//                       </p>
//                     </div>
//                   </div>
//                 ))
//               )}
//               <div ref={messagesEndRef} />
//             </div>

//             {/* Message Input Area */}
//             <div className="p-4 bg-white border-t border-gray-200 flex items-center gap-3 shadow-inner">
//               <input
//                 value={inputMessage}
//                 onChange={(e) => setInputMessage(e.target.value)}
//                 onKeyPress={(e) => { if (e.key === 'Enter') sendMessage(); }}
//                 className="flex-1 rounded-full border border-gray-300 py-3 px-5 focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-800 text-base placeholder-gray-500"
//                 placeholder="Type your message..."
//               />
//               <button
//                 onClick={sendMessage}
//                 className="bg-blue-600 text-white rounded-full p-3.5 hover:bg-blue-700 transition-colors shadow-lg flex items-center justify-center
//                            transform active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
//               >
//                 <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
//                   <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
//                 </svg>
//               </button>
//             </div>
//           </>
//         ) : (
//           <div className="flex-1 flex flex-col items-center justify-center text-gray-500 text-xl p-8 text-center">
//             <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 text-blue-400 mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
//               <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
//             </svg>
//             <p className="font-semibold text-gray-700">👋 Welcome to your chat!</p>
//             <p className="mt-2 text-lg">Select a user from the left sidebar to start a conversation.</p>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// export default ChatHomePage;

//ISSUE-5 real time commiunication missing 

// import React, { useState, useEffect, useRef, useCallback } from 'react';
// import { useNavigate } from 'react-router-dom';
// import axios from 'axios';
// import SockJS from 'sockjs-client';
// import { Client } from '@stomp/stompjs';

// // Base URLs for your backend services
// const BACKEND_URI_PROTECTED = process.env.REACT_APP_BACKEND_URI_PROTECTED || "http://localhost:8084";
// const CHAT_API_BASE_URL = `${BACKEND_URI_PROTECTED}/api/v1/chat`;
// const WEBSOCKET_URL = "http://localhost:8082/ws";

// // Custom Modal Component for general alerts (e.g., WebSocket connection errors)
// const Modal = ({ message, onClose }) => {
//   return (
//     <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
//       <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full text-center">
//         <h3 className="text-lg font-semibold text-gray-800 mb-4">Notification</h3>
//         <p className="text-gray-700 mb-6">{message}</p>
//         <button
//           onClick={onClose}
//           className="bg-blue-600 text-white py-2 px-5 rounded-full hover:bg-blue-700 transition-colors duration-200 shadow-md"
//         >
//           Got it!
//         </button>
//       </div>
//     </div>
//   );
// };

// // Custom Toast Component for temporary notifications (e.g., empty message)
// const Toast = ({ message, duration = 3000, onClose }) => {
//   useEffect(() => {
//     const timer = setTimeout(() => {
//       onClose();
//     }, duration);
//     return () => clearTimeout(timer);
//   }, [duration, onClose]);

//   return (
//     <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-800 text-white px-6 py-3 rounded-full shadow-lg z-50 text-sm animate-fade-in-up">
//       {message}
//     </div>
//   );
// };

// function ChatHomePage() {
//   // State variables for managing chat data and UI
//   const [users, setUsers] = useState([]); // This will now hold ALL users including the current one
//   const [messages, setMessages] = useState([]);
//   const [inputMessage, setInputMessage] = useState('');
//   const [currentConversationId, setCurrentConversationId] = useState(null);
//   const [currentRecipientId, setCurrentRecipientId] = useState(null);
//   const [currentUser, setCurrentUser] = useState(null); // ID of the authenticated user
//   const [showErrorModal, setShowErrorModal] = useState(false);
//   const [errorMessage, setErrorMessage] = useState('');
//   const [showToast, setShowToast] = useState(false); // State for showing toast
//   const [toastMessage, setToastMessage] = useState(''); // Message for toast

//   // React Router hook for navigation
//   const navigate = useNavigate();

//   // Retrieve JWT token and current user ID from localStorage
//   const jwtToken = localStorage.getItem('jwtToken');
//   const userIdd = localStorage.getItem('currentUserId');

//   // Refs for DOM elements and STOMP client instance
//   const messagesEndRef = useRef(null);
//   const stompClientRef = useRef(null);
//   const currentConversationIdRef = useRef(currentConversationId); // Ref for WebSocket subscription

//   // Update the ref whenever currentConversationId changes
//   useEffect(() => {
//     currentConversationIdRef.current = currentConversationId;
//   }, [currentConversationId]);

//   // Function to scroll to the bottom of the messages container
//   const scrollToBottom = () => {
//     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   };

//   // Helper function to parse the problematic senderId field
//   const getActualSenderId = (messageSenderIdField) => {
//     try {
//       // Attempt to parse if it's a JSON string
//       const parsed = JSON.parse(messageSenderIdField);
//       return parsed.senderId || messageSenderIdField; // Return inner senderId or original if not found
//     } catch (e) {
//       // If parsing fails, it's already a plain ID
//       return messageSenderIdField;
//     }
//   };

//   // Effect to fetch authenticated user details and all users on component mount
//   useEffect(() => {
//     const fetchAuthUserAndUsers = async () => {
//       try {
//         if (jwtToken && userIdd) {
//           setCurrentUser(userIdd); // Set the current user ID
//         } else {
//           // localStorage.clear();
//           // navigate('/');
//           return;
//         }

//         // Fetch ALL users; we will filter for display later
//         const usersRes = await axios.get(`${BACKEND_URI_PROTECTED}/api/v1/users/getAllUsers`, {
//           headers: { Authorization: `Bearer ${jwtToken}` }
//         });
//         console.log(usersRes.data)
//         setUsers(usersRes.data); // Store all users, including the current one
//       } catch (err) {
//         console.error('Error fetching users:', err);
//         if (err.response && (err.response.status === 401 || err.response.status === 403)) {
//           // localStorage.clear();
//           // navigate('/');
//         }
//       }
//     };

//     fetchAuthUserAndUsers();
//   }, [jwtToken, userIdd, navigate]);

//   // Callback to connect to WebSocket and subscribe to message queue
//   const connectWebSocket = useCallback(() => {
//     if (!jwtToken || !userIdd) {
//       console.warn("JWT Token or User ID not available for WebSocket connection.");
//       return;
//     }

//     if (stompClientRef.current?.connected) {
//       stompClientRef.current.deactivate();
//       console.log('Deactivated previous STOMP client.');
//     }

//     const client = new Client({
//       webSocketFactory: () => new SockJS(WEBSOCKET_URL),
//       connectHeaders: {
//         Authorization: `Bearer ${jwtToken}`
//       },
//       debug: (str) => {
//         // console.log('STOMP Debug:', str);
//       },
//       onConnect: () => {
//         console.log('Connected via STOMP');

//         client.subscribe(`/user/queue/messages`, (msg) => {
//           const body = JSON.parse(msg.body);
//           console.log("Received message:", body);

//           // Process the incoming message's senderId
//           const processedMessage = {
//             ...body,
//             senderId: getActualSenderId(body.senderId) // Parse the senderId here
//           };

//           if (processedMessage.conversationId === currentConversationIdRef.current) {
//             setMessages(prev => [...prev, processedMessage]);
//           } else {
//             console.log("Received message for a different conversation, ignoring:", processedMessage.conversationId);
//           }
//         });

//         client.publish({
//           destination: '/app/chat.addUser',
//           body: JSON.stringify({ userId: userIdd })
//         });
//       },
//       onStompError: (frame) => {
//         console.error('STOMP Error:', frame.headers['message']);
//         console.error(frame.body);
//         setErrorMessage(`WebSocket Error: ${frame.headers['message'] || 'Connection failed.'}`);
//         setShowErrorModal(true);
//       },
//       onDisconnect: () => {
//         console.log('STOMP Disconnected.');
//         stompClientRef.current = null;
//       },
//       reconnectDelay: 5000
//     });

//     client.activate();
//     stompClientRef.current = client;
//   }, [jwtToken, userIdd]);

//   // Effect to scroll to the bottom whenever messages array updates
//   useEffect(() => {
//     scrollToBottom();
//   }, [messages]);

//   // Effect to connect WebSocket when component mounts or JWT token/userIdd changes
//   useEffect(() => {
//     if (jwtToken && userIdd) {
//       connectWebSocket();
//     }
//     return () => {
//       if (stompClientRef.current?.connected) {
//         stompClientRef.current.deactivate();
//         console.log('STOMP client deactivated on component unmount.');
//       }
//     };
//   }, [jwtToken, userIdd, connectWebSocket]);

//   // Function to start a new chat or load an existing conversation
//   const startChat = async (recipientId) => {
//     try {
//       setCurrentRecipientId(recipientId);
//       setMessages([]);
//       setInputMessage('');

//       const res = await axios.post(`${CHAT_API_BASE_URL}/conversation/one-to-one/${recipientId}`, {}, {
//         headers: { Authorization: `Bearer ${jwtToken}` }
//       });

//       const conversationId = res.data.id;
//       setCurrentConversationId(conversationId);

//       const messagesRes = await axios.get(`${CHAT_API_BASE_URL}/messages/${conversationId}`, {
//         headers: { Authorization: `Bearer ${jwtToken}` }
//       });

//       // Process historical messages' senderId
//       const processedMessages = messagesRes.data.map(m => ({
//         ...m,
//         senderId: getActualSenderId(m.senderId) // Parse the senderId here
//       }));
//       setMessages(processedMessages);

//       if (!stompClientRef.current?.connected) {
//         console.log("WebSocket not connected when starting chat, attempting to reconnect...");
//         connectWebSocket();
//       }

//     } catch (err) {
//       console.error('Error starting chat:', err);
//       setErrorMessage(`Failed to start chat: ${err.response?.data?.message || err.message}`);
//       setShowErrorModal(true);
//     }
//   };

//   // Function to show a toast message
//   const showToastMessage = (message) => {
//     setToastMessage(message);
//     setShowToast(true);
//     // The Toast component itself handles the timer to hide it
//   };

//   // Function to send a message
//   const sendMessage = () => {
//     const client = stompClientRef.current;

//     if (!client || !client.connected) {
//       setErrorMessage("WebSocket is not connected. Please ensure you are online and try again.");
//       setShowErrorModal(true);
//       return;
//     }

//     if (!currentConversationId) {
//       showToastMessage("No conversation selected. Please select a user to chat with.");
//       return;
//     }

//     if (!inputMessage.trim()) {
//       showToastMessage("Message cannot be empty.");
//       return;
//     }

//     const messagePayload = {
//       conversationId: currentConversationId,
//       recipientId: currentRecipientId,
//       content: inputMessage.trim(),
//       senderId: currentUser // This is correct for optimistic update
//     };

//     client.publish({
//       destination: '/app/chat.sendMessage',
//       body: JSON.stringify(messagePayload)
//     });

//     // Optimistically update the UI with the sent message
//     setMessages(prev => [...prev, {
//       senderId: currentUser, // Use the plain currentUser ID here
//       content: inputMessage.trim(),
//       timestamp: new Date().toISOString(),
//       conversationId: currentConversationId
//     }]);

//     setInputMessage('');
//   };

//   // Logout function (commented out as per original request)
//   const logout = () => {
//     // stompClientRef.current?.deactivate();
//     // localStorage.clear();
//     // navigate('/');
//   };

//   // Helper function to get recipient's phone number for display
//   const getRecipientInfo = (id) => {
//     const recipient = users.find(u => u.id === id);
//     return recipient ? recipient.phone : 'Unknown User';
//   };

//   // Helper function to get current user's info for display
//   const getCurrentUserInfo = () => {
//     // Find the current user from the 'users' state (which now contains all users)
//     const user = users.find(u => u.id === currentUser);
//     return user ? user.phone : 'Loading...'; // Show phone number or 'Loading...'
//   };

//   return (
//     <div className="flex h-screen bg-gray-100 font-inter antialiased">
//       {/* Custom Error Modal */}
//       {showErrorModal && <Modal message={errorMessage} onClose={() => setShowErrorModal(false)} />}

//       {/* Custom Toast Notification */}
//       {showToast && <Toast message={toastMessage} onClose={() => setShowToast(false)} />}

//       {/* Left Pane: User List */}
//       <div className="w-1/4 bg-white border-r border-gray-200 flex flex-col shadow-lg rounded-l-xl overflow-hidden">
//         <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md">
//           <h3 className="text-2xl font-bold">Chats</h3>
//           <div className="flex items-center space-x-3">
//             {/* Current User Info Button */}
//             <div className="relative group">
//               <button className="bg-blue-500 text-white py-1.5 px-3 rounded-full text-sm font-medium hover:bg-blue-600 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
//                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
//                   <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9.293 12.293a1 1 0 001.414 1.414L12 11.414V15a1 1 0 102 0v-4.586l1.293 1.293a1 1 0 001.414-1.414l-3-3a1 1 0 00-1.414 0l-3 3z" clipRule="evenodd" />
//                 </svg>
//               </button>
//               {/* Adjusted tooltip positioning */}
//               <div className="absolute left-1/2 transform -translate-x-1/2 top-full mt-2 w-max px-3 py-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
//                 Current User: {getCurrentUserInfo()}
//               </div>
//             </div>
//             <button
//               onClick={logout}
//               className="bg-red-500 text-white py-1.5 px-4 rounded-full text-sm font-medium hover:bg-red-600 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-red-400"
//             >
//               Logout
//             </button>
//           </div>
//         </div>
//         <div className="flex-1 overflow-y-auto custom-scrollbar">
//           {users.length === 0 ? (
//             <p className="p-6 text-gray-500 text-center text-base italic">No other users found to chat with.</p>
//           ) : (
//             // Filter users here for display, excluding the current user
//             users.filter(u => u.id !== currentUser).map(u => (
//               <div
//                 key={u.id}
//                 onClick={() => startChat(u.id)}
//                 className={`flex items-center p-4 cursor-pointer border-b border-gray-100 transition-all duration-200 ease-in-out
//                   ${currentRecipientId === u.id ? 'bg-blue-50 font-semibold border-l-4 border-blue-500' : 'hover:bg-gray-50'}`}
//               >
//                 <div className="w-12 h-12 rounded-full bg-blue-500 text-white flex items-center justify-center text-xl font-bold mr-4 shadow-md flex-shrink-0">
//                   {u.phone?.charAt(0).toUpperCase() || 'U'}
//                 </div>
//                 <div className="flex-1">
//                   <p className="text-gray-900 text-lg">{u.phone}</p>
//                   <p className="text-gray-600 text-sm">Click to chat</p>
//                 </div>
//               </div>
//             ))
//           )}
//         </div>
//       </div>

//       {/* Right Pane: Chat Area */}
//       <div className="w-3/4 flex flex-col bg-white rounded-r-xl shadow-lg overflow-hidden">
//         {currentRecipientId ? (
//           <>
//             {/* Chat Header */}
//             <div className="p-4 border-b border-gray-200 flex items-center bg-gradient-to-r from-green-500 to-green-600 text-white shadow-md">
//               <div className="w-12 h-12 rounded-full bg-green-700 text-white flex items-center justify-center text-xl font-bold mr-4 shadow-md flex-shrink-0">
//                 {getRecipientInfo(currentRecipientId).charAt(0).toUpperCase()}
//               </div>
//               <h3 className="text-xl font-semibold">{getRecipientInfo(currentRecipientId)}</h3>
//               {stompClientRef.current?.connected ? (
//                 <span className="ml-auto text-white text-sm flex items-center opacity-90">
//                   <span className="h-3 w-3 rounded-full bg-green-300 mr-2 animate-pulse shadow-sm"></span> Online
//                 </span>
//               ) : (
//                 <span className="ml-auto text-white text-sm flex items-center opacity-90">
//                   <span className="h-3 w-3 rounded-full bg-red-300 mr-2 shadow-sm"></span> Offline
//                 </span>
//               )}
//             </div>

//             {/* Messages Display Area */}
//             <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50 custom-scrollbar">
//               {messages.length === 0 ? (
//                 <p className="text-gray-500 text-center text-base italic mt-12">No messages yet. Start the conversation!</p>
//               ) : (
//                 messages.map((m, idx) => (
//                   <div
//                     key={idx}
//                     className={`flex ${m.senderId === currentUser ? 'justify-end' : 'justify-start'}`}
//                   >
//                     <div className={`max-w-[75%] py-3 px-4 rounded-xl shadow-md text-base break-words
//                       ${m.senderId === currentUser
//                         ? 'bg-blue-500 text-white rounded-br-none'
//                         : 'bg-gray-200 text-gray-800 rounded-bl-none'
//                       }`}
//                     >
//                       {m.content}
//                       <p className={`text-xs mt-1 ${m.senderId === currentUser ? 'text-blue-200' : 'text-gray-600'} text-right`}>
//                         {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
//                       </p>
//                     </div>
//                   </div>
//                 ))
//               )}
//               <div ref={messagesEndRef} />
//             </div>

//             {/* Message Input Area */}
//             <div className="p-4 bg-white border-t border-gray-200 flex items-center gap-3 shadow-inner">
//               <input
//                 value={inputMessage}
//                 onChange={(e) => setInputMessage(e.target.value)}
//                 onKeyPress={(e) => { if (e.key === 'Enter') sendMessage(); }}
//                 className="flex-1 rounded-full border border-gray-300 py-3 px-5 focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-800 text-base placeholder-gray-500"
//                 placeholder="Type your message..."
//               />
//               <button
//                 onClick={sendMessage}
//                 className="bg-blue-600 text-white rounded-full p-3.5 hover:bg-blue-700 transition-colors shadow-lg flex items-center justify-center
//                            transform active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
//               >
//                 <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
//                   <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
//                 </svg>
//               </button>
//             </div>
//           </>
//         ) : (
//           <div className="flex-1 flex flex-col items-center justify-center text-gray-500 text-xl p-8 text-center">
//             <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 text-blue-400 mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
//               <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
//             </svg>
//             <p className="font-semibold text-gray-700">👋 Welcome to your chat!</p>
//             <p className="mt-2 text-lg">Select a user from the left sidebar to start a conversation.</p>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// export default ChatHomePage;


//final ISSUE

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

// Base URLs for your backend services
const BACKEND_URI_PROTECTED = process.env.REACT_APP_BACKEND_URI_PROTECTED || "http://localhost:8084";
const CHAT_API_BASE_URL = `${BACKEND_URI_PROTECTED}/api/v1/chat`;
const WEBSOCKET_URL = "http://localhost:8082/ws";

// Define a unique channel name for BroadcastChannel
const BROADCAST_CHANNEL_NAME = 'chat_messages_channel';

// Custom Modal Component for general alerts (e.g., WebSocket connection errors)
const Modal = ({ message, onClose }) => {
  return (
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
};

// Custom Toast Component for temporary notifications (e.g., empty message)
const Toast = ({ message, duration = 3000, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-800 text-white px-6 py-3 rounded-full shadow-lg z-50 text-sm animate-fade-in-up">
      {message}
    </div>
  );
};

function ChatHomePage() {
  // State variables for managing chat data and UI
  const [users, setUsers] = useState([]); // All users, including the current one
  const [displayedMessages, setDisplayedMessages] = useState([]); // Messages for the currently active conversation
  const [inputMessage, setInputMessage] = useState('');
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [currentRecipientId, setCurrentRecipientId] = useState(null);
  const [currentUser, setCurrentUser] = useState(null); // ID of the authenticated user
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Ref to store all messages received across all conversations
  // This helps in maintaining state even when switching conversations or tabs are backgrounded
  const allConversationMessagesRef = useRef({});

  // Ref for BroadcastChannel instance
  const broadcastChannelRef = useRef(null);

  // React Router hook for navigation
  const navigate = useNavigate();

  // Retrieve JWT token and current user ID from localStorage
  const jwtToken = localStorage.getItem('jwtToken');
  const userIdd = localStorage.getItem('currentUserId');

  // Refs for DOM elements and STOMP client instance
  const messagesEndRef = useRef(null);
  const stompClientRef = useRef(null);
  // Ref to hold the latest currentConversationId for WebSocket subscription callback
  const currentConversationIdRef = useRef(currentConversationId);

  // Update the ref whenever currentConversationId state changes
  useEffect(() => {
    currentConversationIdRef.current = currentConversationId;
  }, [currentConversationId]);

  // Function to scroll to the bottom of the messages container
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Helper function to parse the problematic senderId field from backend messages
  const getActualSenderId = (messageSenderIdField) => {
    try {
      // Attempt to parse if it's a JSON string (as per your backend's current structure)
      const parsed = JSON.parse(messageSenderIdField);
      return parsed.senderId || messageSenderIdField; // Return inner senderId or original if not found
    } catch (e) {
      // If parsing fails, it's already a plain ID
      return messageSenderIdField;
    }
  };

  // Function to process and store a message, then potentially update UI
  const processAndStoreMessage = useCallback((message) => {
    const processedMessage = {
      ...message,
      senderId: getActualSenderId(message.senderId) // Ensure senderId is parsed
    };

    // Store the message in the centralized ref
    allConversationMessagesRef.current = {
      ...allConversationMessagesRef.current,
      [processedMessage.conversationId]: [
        ...(allConversationMessagesRef.current[processedMessage.conversationId] || []),
        processedMessage
      ]
    };

    // If the message is for the currently active conversation, update the displayed messages state
    if (processedMessage.conversationId === currentConversationIdRef.current) {
      // Create a new array reference from the updated ref content
      setDisplayedMessages([...allConversationMessagesRef.current[processedMessage.conversationId]]);
      scrollToBottom(); // Scroll to bottom for new messages
    }
  }, []); // No dependencies needed for this callback as it uses refs and state setters

  // Effect to initialize BroadcastChannel and listen for messages
  useEffect(() => {
    if (typeof BroadcastChannel !== 'undefined') {
      broadcastChannelRef.current = new BroadcastChannel(BROADCAST_CHANNEL_NAME);

      broadcastChannelRef.current.onmessage = (event) => {
        const { type, payload } = event.data;
        if (type === 'new_chat_message' && payload) {
          console.log("BroadcastChannel: Received message from another tab:", payload);
          // Process and store the message received from another tab
          processAndStoreMessage(payload);
        }
      };

      return () => {
        if (broadcastChannelRef.current) {
          broadcastChannelRef.current.close();
          console.log("BroadcastChannel closed.");
        }
      };
    } else {
      console.warn("BroadcastChannel is not supported in this browser.");
    }
  }, [processAndStoreMessage]); // Dependency on processAndStoreMessage

  // Effect to fetch authenticated user details and all users on component mount
  useEffect(() => {
    const fetchAuthUserAndUsers = async () => {
      try {
        if (jwtToken && userIdd) {
          setCurrentUser(userIdd); // Set the current user ID
        } else {
          // If no token or user ID, clear local storage and navigate to login (commented out as per original)
          // localStorage.clear();
          // navigate('/');
          return;
        }

        // Fetch ALL users; we will filter for display later
        const usersRes = await axios.get(`${BACKEND_URI_PROTECTED}/api/v1/users/getAllUsers`, {
          headers: { Authorization: `Bearer ${jwtToken}` }
        });
        setUsers(usersRes.data); // Store all users, including the current one
      } catch (err) {
        console.error('Error fetching users:', err);
        if (err.response && (err.response.status === 401 || err.response.status === 403)) {
          // localStorage.clear();
          // navigate('/');
        }
      }
    };

    fetchAuthUserAndUsers();
  }, [jwtToken, userIdd, navigate]);

  // Callback to connect to WebSocket and subscribe to message queue
  const connectWebSocket = useCallback(() => {
    if (!jwtToken || !userIdd) {
      console.warn("JWT Token or User ID not available for WebSocket connection.");
      return;
    }

    // Deactivate existing client if active to ensure a clean connection
    if (stompClientRef.current?.connected) {
      stompClientRef.current.deactivate();
      console.log('Deactivated previous STOMP client.');
    }

    const client = new Client({
      webSocketFactory: () => new SockJS(WEBSOCKET_URL),
      connectHeaders: {
        Authorization: `Bearer ${jwtToken}`
      },
      debug: (str) => {
        // console.log('STOMP Debug:', str); // Uncomment for detailed STOMP debugging
      },
      onConnect: () => {
        console.log('Connected via STOMP');

        // Subscribe to the user-specific message queue for real-time updates
        client.subscribe(`/user/queue/messages`, (msg) => {
          const body = JSON.parse(msg.body);
          console.log("WebSocket: Received raw message:", body);

          // Process and store the message, then broadcast it
          processAndStoreMessage(body); // This will update local state if active
          if (broadcastChannelRef.current) {
            broadcastChannelRef.current.postMessage({ type: 'new_chat_message', payload: body });
            console.log("BroadcastChannel: Posted message from WebSocket.");
          }
        });

        // Publish a message to add the user to the chat (if required by backend)
        client.publish({
          destination: '/app/chat.addUser',
          body: JSON.stringify({ userId: userIdd })
        });
      },
      onStompError: (frame) => {
        console.error('STOMP Error:', frame.headers['message']);
        console.error(frame.body);
        setErrorMessage(`WebSocket Error: ${frame.headers['message'] || 'Connection failed.'}`);
        setShowErrorModal(true);
      },
      onDisconnect: () => {
        console.log('STOMP Disconnected.');
        stompClientRef.current = null; // Clear the ref on disconnect
      },
      reconnectDelay: 5000 // Attempt to reconnect every 5 seconds
    });

    client.activate(); // Activate the STOMP client to establish connection
    stompClientRef.current = client; // Store the client instance in the ref
  }, [jwtToken, userIdd, processAndStoreMessage]); // Dependency on processAndStoreMessage

  // Effect to connect WebSocket when component mounts or JWT token/userIdd changes
  useEffect(() => {
    if (jwtToken && userIdd) {
      connectWebSocket();
    }
    // Cleanup function to deactivate STOMP client on unmount
    return () => {
      if (stompClientRef.current?.connected) {
        stompClientRef.current.deactivate();
        console.log('STOMP client deactivated on component unmount.');
      }
    };
  }, [jwtToken, userIdd, connectWebSocket]);

  // Effect to handle tab visibility changes to sync messages
  // This is a fallback/reinforcement for browsers that heavily throttle background tabs
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log("Tab became visible. Attempting to sync messages for current conversation.");
        if (currentConversationIdRef.current && allConversationMessagesRef.current[currentConversationIdRef.current]) {
          // Force a re-render of displayed messages with the latest from the ref
          setDisplayedMessages([...allConversationMessagesRef.current[currentConversationIdRef.current]]);
          scrollToBottom(); // Scroll to bottom after syncing
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Function to start a new chat or load an existing conversation
  const startChat = async (recipientId) => {
    try {
      setCurrentRecipientId(recipientId);
      setInputMessage(''); // Clear input field

      // Request to get or create a one-to-one conversation
      const res = await axios.post(`${CHAT_API_BASE_URL}/conversation/one-to-one/${recipientId}`, {}, {
        headers: { Authorization: `Bearer ${jwtToken}` }
      });

      const conversationId = res.data.id;
      setCurrentConversationId(conversationId); // Set the current conversation ID

      // Check if messages for this conversation are already in our ref cache
      if (allConversationMessagesRef.current[conversationId]) {
        console.log("Messages found in cache for conversation:", conversationId);
        // Set displayed messages directly from the cache
        setDisplayedMessages([...allConversationMessagesRef.current[conversationId]]);
      } else {
        console.log("Fetching historical messages for conversation:", conversationId);
        // Fetch historical messages for the new conversation
        const messagesRes = await axios.get(`${CHAT_API_BASE_URL}/messages/${conversationId}`, {
          headers: { Authorization: `Bearer ${jwtToken}` }
        });

        // Process historical messages' senderId
        const processedHistoricalMessages = messagesRes.data.map(m => ({
          ...m,
          senderId: getActualSenderId(m.senderId)
        }));

        // Initialize the centralized ref with historical messages for this conversation
        allConversationMessagesRef.current = {
          ...allConversationMessagesRef.current,
          [conversationId]: processedHistoricalMessages
        };

        // Set the displayed messages for the UI
        setDisplayedMessages(processedHistoricalMessages);
      }

      // Ensure WebSocket is connected (it should already be from initial useEffect)
      if (!stompClientRef.current?.connected) {
        console.log("WebSocket not connected when starting chat, attempting to reconnect...");
        connectWebSocket();
      }

    } catch (err) {
      console.error('Error starting chat:', err);
      setErrorMessage(`Failed to start chat: ${err.response?.data?.message || err.message}`);
      setShowErrorModal(true);
    }
  };

  // Function to show a toast message
  const showToastMessage = (message) => {
    setToastMessage(message);
    setShowToast(true);
    // The Toast component itself handles the timer to hide it
  };

  // Function to send a message
  const sendMessage = () => {
    const client = stompClientRef.current;

    if (!client || !client.connected) {
      setErrorMessage("WebSocket is not connected. Please ensure you are online and try again.");
      setShowErrorModal(true);
      return;
    }

    if (!currentConversationId) {
      showToastMessage("No conversation selected. Please select a user to chat with.");
      return;
    }

    if (!inputMessage.trim()) {
      showToastMessage("Message cannot be empty.");
      return;
    }

    const messagePayload = {
      conversationId: currentConversationId,
      recipientId: currentRecipientId,
      content: inputMessage.trim(),
      senderId: currentUser // This is correct for optimistic update
    };

    client.publish({
      destination: '/app/chat.sendMessage',
      body: JSON.stringify(messagePayload)
    });

    // Optimistically update the UI with the sent message
    const optimisticMessage = {
      senderId: currentUser,
      content: inputMessage.trim(),
      timestamp: new Date().toISOString(),
      conversationId: currentConversationId
    };

    // Process and store the optimistic message, then broadcast it
    processAndStoreMessage(optimisticMessage); // This will update local state if active
    if (broadcastChannelRef.current) {
      broadcastChannelRef.current.postMessage({ type: 'new_chat_message', payload: optimisticMessage });
      console.log("BroadcastChannel: Posted optimistic message.");
    }

    setInputMessage(''); // Clear the input field after sending
  };

  // Logout function (commented out as per original request)
  const logout = () => {
    // stompClientRef.current?.deactivate();
    // localStorage.clear();
    // navigate('/');
  };

  // Helper function to get recipient's phone number for display
  const getRecipientInfo = (id) => {
    const recipient = users.find(u => u.id === id);
    return recipient ? recipient.phone : 'Unknown User';
  };

  // Helper function to get current user's info for display
  const getCurrentUserInfo = () => {
    // Find the current user from the 'users' state (which contains all users)
    const user = users.find(u => u.id === currentUser);
    return user ? user.phone : 'Loading...'; // Show phone number or 'Loading...'
  };

  return (
    <div className="flex h-screen bg-gray-100 font-inter antialiased">
      {/* Custom Error Modal */}
      {showErrorModal && <Modal message={errorMessage} onClose={() => setShowErrorModal(false)} />}

      {/* Custom Toast Notification */}
      {showToast && <Toast message={toastMessage} onClose={() => setShowToast(false)} />}

      {/* Left Pane: User List */}
      <div className="w-1/4 bg-white border-r border-gray-200 flex flex-col shadow-lg rounded-l-xl overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md">
          <h3 className="text-2xl font-bold">Chats</h3>
          <div className="flex items-center space-x-3">
            {/* Current User Info Button */}
            <div className="relative group">
              <button className="bg-blue-500 text-white py-1.5 px-3 rounded-full text-sm font-medium hover:bg-blue-600 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9.293 12.293a1 1 0 001.414 1.414L12 11.414V15a1 1 0 102 0v-4.586l1.293 1.293a1 1 0 001.414-1.414l-3-3a1 1 0 00-1.414 0l-3 3z" clipRule="evenodd" />
                </svg>
              </button>
              {/* Adjusted tooltip positioning */}
              <div className="absolute left-1/2 transform -translate-x-1/2 top-full mt-2 w-max px-3 py-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                Current User: {getCurrentUserInfo()}
              </div>
            </div>
            <button
              onClick={logout}
              className="bg-red-500 text-white py-1.5 px-4 rounded-full text-sm font-medium hover:bg-red-600 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-red-400"
            >
              Logout
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {users.length === 0 ? (
            <p className="p-6 text-gray-500 text-center text-base italic">No other users found to chat with.</p>
          ) : (
            // Filter users here for display, excluding the current user
            users.filter(u => u.id !== currentUser).map(u => (
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
            {/* Chat Header */}
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

            {/* Messages Display Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50 custom-scrollbar">
              {displayedMessages.length === 0 ? (
                <p className="text-gray-500 text-center text-base italic mt-12">No messages yet. Start the conversation!</p>
              ) : (
                displayedMessages.map((m, idx) => (
                  <div
                    key={idx}
                    className={`flex ${m.senderId === currentUser ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[75%] py-3 px-4 rounded-xl shadow-md text-base break-words
                      ${m.senderId === currentUser
                        ? 'bg-blue-500 text-white rounded-br-none'
                        : 'bg-gray-200 text-gray-800 rounded-bl-none'
                      }`}
                    >
                      {m.content}
                      <p className={`text-xs mt-1 ${m.senderId === currentUser ? 'text-blue-200' : 'text-gray-600'} text-right`}>
                        {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input Area */}
            <div className="p-4 bg-white border-t border-gray-200 flex items-center gap-3 shadow-inner">
              <input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => { if (e.key === 'Enter') sendMessage(); }}
                className="flex-1 rounded-full border border-gray-300 py-3 px-5 focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-800 text-base placeholder-gray-500"
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
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
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