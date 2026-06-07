package com.teamates.controller;

import com.teamates.model.Gender;
import com.teamates.model.User;
import com.teamates.service.UserService;
import com.teamates.dto.UserMapper;
import com.teamates.dto.UserResponseDTO;
import com.teamates.exception.NotFoundException;
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
    private final UserMapper userMapper;

    @PostMapping("/complete-profile")
    public ResponseEntity<UserResponseDTO> completeProfile(@RequestBody CompleteProfileRequest request) {
        User currentUser = userService.getCurrentUser();
        User updated = userService.completeProfile(currentUser,
                request.gender(), request.birthDate());
        return ResponseEntity.ok(userMapper.toDto(updated));
    }

    @GetMapping("/{userId}")
    public ResponseEntity<UserResponseDTO> getUser(@PathVariable UUID userId) {
        User user = userService.getUserById(userId)
                .orElseThrow(() -> new NotFoundException("User not found"));
        return ResponseEntity.ok(userMapper.toDto(user));
    }

    @PatchMapping
    public ResponseEntity<UserResponseDTO> updateUser(@RequestBody UpdateUserRequest request) {
        User currentUser = userService.getCurrentUser();
        User updated = userService.updateUser(currentUser,
                request.firstName(), request.lastName(), request.phone());
        return ResponseEntity.ok(userMapper.toDto(updated));
    }

    @DeleteMapping
    public ResponseEntity<Void> deleteUser() {
        User currentUser = userService.getCurrentUser();
        userService.deleteUser(currentUser.getUserId());
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