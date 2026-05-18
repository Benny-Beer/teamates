package com.teamates.controller;

import com.teamates.model.User;
import com.teamates.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.UUID;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/{userId}")
    public ResponseEntity<User> getUser(@PathVariable UUID userId) {
        return userService.getUserById(userId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // TEMPORARY - remove before production
    @PostMapping("/test-create")
    public ResponseEntity<User> createTestUser(@RequestBody CreateTestUserRequest request) {
        User user = new User();
        user.setEmail(request.email());
        user.setFirstName(request.firstName());
        user.setLastName(request.lastName());
        return ResponseEntity.ok(userService.saveUser(user));
    }

    public record CreateTestUserRequest(
            String email,
            String firstName,
            String lastName
    ) {}
}