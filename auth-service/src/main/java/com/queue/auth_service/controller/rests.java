package com.queue.auth_service.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class rests {
    @GetMapping("/")
    public String rests() {
        return "welcme back";
    }
}
