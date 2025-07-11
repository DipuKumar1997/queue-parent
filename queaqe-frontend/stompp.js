import { Client } from '@stomp/stompjs';

const client = new Client({
  brokerURL: 'ws://localhost:8082/ws',  // direct to chat-service
  connectHeaders: {
    'X-User-Id': 'your-user-id-here',  // example: '4a27349e-dc7f-486a-ad24-5670fe0a8d02'
    'X-User-Phone': '7352931499',
    'X-User-Username': 'YourUsername'
  },
  debug: (str) => console.log(str),
  onConnect: () => {
    console.log('✅ Connected directly to chat service');

    // Send /app/chat.addUser to mark as online
    client.publish({
      destination: '/app/chat.addUser',
      body: JSON.stringify({})
    });

    // Subscribe to receive messages
    client.subscribe('/user/queue/messages', (msg) => {
      console.log('📥 New message:', msg.body);
    });

    // Example send
    client.publish({
      destination: '/app/chat.sendMessage',
      body: JSON.stringify({
        conversationId: '685add6c363f0ef98be2f1f8',
        recipientId: 'ea07a618-9d1f-4408-bd2d-c5e691485431',
        content: 'Hello direct!'
      })
    });
  },
  onStompError: (frame) => {
    console.error('❌ STOMP error', frame);
  }
});

client.activate();
