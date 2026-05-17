package com.teamates.controller;

import com.teamates.auth.AuthProvider;
import com.teamates.auth.AuthProviderRegistry;
import com.teamates.auth.AuthResult;
import com.teamates.model.User;
import com.teamates.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthProviderRegistry authProviderRegistry;
    private final UserService userService;

    @PostMapping("/{provider}")
    public ResponseEntity<User> login(
            @PathVariable String provider,
            @RequestBody TokenRequest request) {
        try {
            AuthProvider authProvider = authProviderRegistry.getProvider(provider);
            if (authProvider == null) {
                return ResponseEntity.status(400).build();
            }

            AuthResult result = authProvider.verify(request.token());

            User user = userService.getOrCreateUser(
                    provider,
                    result.providerSub(),
                    result.email(),
                    result.firstName(),
                    result.lastName()
            );

            return ResponseEntity.ok(user);

        } catch (Exception e) {
            return ResponseEntity.status(401).build();
        }
    }

    public record TokenRequest(String token) {}
}