//package com.queue.chat_service.chat;
//
//import org.springframework.messaging.handler.annotation.MessageMapping;
//import org.springframework.messaging.handler.annotation.Payload;
//import org.springframework.messaging.handler.annotation.SendTo;
//import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
//import org.springframework.stereotype.Controller;
//
//@Controller
//public class ChatController {
//
//    @MessageMapping("/chat-sendMessage")
//    @SendTo("/topic/public") //everytime it receive the message it is queued to this topic
//    public ChatMessage sendMessage(@Payload ChatMessage chatMessage){
//        return chatMessage;
//    }
//    @MessageMapping("/chat-adduser")
//    public ChatMessage adduser(@Payload ChatMessage chatMessage , SimpMessageHeaderAccessor headerAccessor){
//        //add userName to webSocket session
//        headerAccessor.getSessionAttributes().put("username",chatMessage.getSender());
//        return chatMessage;
//    }
//}
