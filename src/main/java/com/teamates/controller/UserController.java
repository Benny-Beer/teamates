package com.teamates.controller;

import com.teamates.model.Gender;
import com.teamates.model.User;
import com.teamates.service.UserService;
import java.time.LocalDate;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.UUID;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @PostMapping("/{userId}/complete-profile")
    public ResponseEntity<User> completeProfile(@PathVariable UUID userId,
                                                @RequestBody CompleteProfileRequest request) {
        User user = userService.getUserById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user = userService.completeProfile(user, request.gender(), request.birthDate());
        return ResponseEntity.ok(user);
    }

    @GetMapping("/{userId}")
    public ResponseEntity<User> getUser(@PathVariable UUID userId) {
        return userService.getUserById(userId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/{userId}")
    public ResponseEntity<User> updateUser(@PathVariable UUID userId,
                                           @RequestBody UpdateUserRequest request) {
        User user = userService.getUserById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user = userService.updateUser(user, request.firstName(),
                request.lastName(), request.phone());
        return ResponseEntity.ok(user);
    }

    @DeleteMapping("/{userId}")
    public ResponseEntity<Void> deleteUser(@PathVariable UUID userId) {
        userService.deleteUser(userId);
        return ResponseEntity.noContent().build();
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

    // TEMPORARY - remove before production
    public record CreateTestUserRequest(
            String email,
            String firstName,
            String lastName
    ) {}

    public record UpdateUserRequest(
            String firstName,
            String lastName,
            String phone
    ) {}

    public record CompleteProfileRequest(
            Gender gender,
            LocalDate birthDate
    ) {}
}