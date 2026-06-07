package com.teamates.controller;

import com.teamates.auth.AuthProvider;
import com.teamates.auth.AuthProviderRegistry;
import com.teamates.auth.AuthResult;
import com.teamates.model.User;
import com.teamates.security.JwtService;
import com.teamates.service.UserService;
import com.teamates.dto.AuthResponseDTO;
import com.teamates.dto.UserMapper;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthProviderRegistry authProviderRegistry;
    private final UserService userService;
    private final JwtService jwtService;
    private final UserMapper userMapper;

    @PostMapping("/{provider}")
    public ResponseEntity<AuthResponseDTO> login(
            @PathVariable String provider,
            @RequestBody TokenRequest request,
            HttpServletResponse response) {
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

            // generate JWT
            String jwt = jwtService.generateToken(user.getUserId(), user.getEmail());

            // set JWT as HttpOnly cookie
            Cookie cookie = new Cookie("jwt", jwt);
            cookie.setHttpOnly(true);
            cookie.setPath("/");
            cookie.setMaxAge(604800); // 7 days in seconds
            response.addCookie(cookie);

            return ResponseEntity.ok(userMapper.toAuthDto(user));

        } catch (Exception e) {
            return ResponseEntity.status(401).build();
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletResponse response) {
        Cookie cookie = new Cookie("jwt", null);
        cookie.setHttpOnly(true);
        cookie.setPath("/");
        cookie.setMaxAge(0); // delete the cookie
        response.addCookie(cookie);
        return ResponseEntity.noContent().build();
    }

    public record TokenRequest(String token) {}
}