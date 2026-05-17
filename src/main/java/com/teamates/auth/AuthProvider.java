package com.teamates.auth;

public interface AuthProvider {
    String getProviderName();
    AuthResult verify(String token) throws Exception;
}