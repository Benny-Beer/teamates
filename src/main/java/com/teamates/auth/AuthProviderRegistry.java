package com.teamates.auth;

import org.springframework.stereotype.Component;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Component
public class AuthProviderRegistry {

    private final Map<String, AuthProvider> providers;

    public AuthProviderRegistry(List<AuthProvider> providerList) {
        this.providers = providerList.stream()
                .collect(Collectors.toMap(AuthProvider::getProviderName, p -> p));
    }

    public AuthProvider getProvider(String name) {
        return providers.get(name);
    }
}