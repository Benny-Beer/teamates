package com.teamates.controller;

import com.teamates.model.Gender;
import com.teamates.model.User;
import com.teamates.service.UserService;
import com.teamates.dto.UserMapper;
import com.teamates.dto.UserResponseDTO;
import com.teamates.exception.NotFoundException;
import java.time.LocalDate;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Size;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.UUID;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Past;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final UserMapper userMapper;

    @PostMapping("/complete-profile")
    public ResponseEntity<UserResponseDTO> completeProfile(@Valid @RequestBody CompleteProfileRequest request) {
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

    @GetMapping("/me")
    public ResponseEntity<UserResponseDTO> getMe() {
        User currentUser = userService.getCurrentUser();
        return ResponseEntity.ok(userMapper.toDto(currentUser));
    }

    @PatchMapping
    public ResponseEntity<UserResponseDTO> updateUser(@Valid @RequestBody UpdateUserRequest request) {
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




    public record UpdateUserRequest(
            @Size(max = 50, message = "First name must be under 50 characters")
            String firstName,

            @Size(max = 50, message = "Last name must be under 50 characters")
            String lastName,

            @Size(max = 20, message = "Phone must be under 20 characters")
            String phone
    ) {}

    public record CompleteProfileRequest(
            @NotNull(message = "Gender is required")
            Gender gender,

            @NotNull(message = "Birth date is required")
            @Past(message = "Birth date must be in the past")
            LocalDate birthDate
    ) {}
}