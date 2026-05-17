package com.teamates.auth;

public record AuthResult(
        String providerSub,
        String email,
        String firstName,
        String lastName
) {}