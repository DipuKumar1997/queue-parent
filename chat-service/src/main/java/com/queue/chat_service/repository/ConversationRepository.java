package com.queue.chat_service.repository;

//import com.chat.app.model.Conversation;
import com.queue.chat_service.model.Conversation;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import java.util.List;
import java.util.Optional;
import java.util.Set;

public interface ConversationRepository extends MongoRepository<Conversation, String> {

    // Find conversation by participants (order-independent for one-to-one)
    // The $all operator checks if all elements in the 'participants' array are present.
    // $size check ensures it's exactly two participants for one-to-one.
    @Query("{ 'participants' : { $all : ?0, $size : ?1 } }")
    Optional<Conversation> findByParticipantsAndSize(Set<String> participants, int size);


    // Find conversations where a specific user is a participant, sorted by last message timestamp
    List<Conversation> findByParticipantsContainingOrderByLastMessageTimestampDesc(String userId);

}