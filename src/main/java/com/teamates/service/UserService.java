package com.teamates.service;

import com.teamates.model.User;
import com.teamates.model.UserIdentity;
import com.teamates.repository.UserIdentityRepository;
import com.teamates.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final UserIdentityRepository userIdentityRepository;

    public User getOrCreateUser(String provider, String providerSub,
                                String email, String firstName, String lastName
                                ) {

        Optional<UserIdentity> existingIdentity =
                userIdentityRepository.findByProviderAndProviderSub(provider, providerSub);

        if (existingIdentity.isPresent()) {
            return existingIdentity.get().getUser();
        }

        // 2. Check if a user with this email already exists
        Optional<User> existingUser = userRepository.findByEmail(email);

        User user;
        if (existingUser.isPresent()) {
            // User exists but signing in with a new provider
            // Just link the new identity to the existing user
            user = existingUser.get();
        } else {
            // Brand new user — create them
            User newUser = new User();
            newUser.setEmail(email);
            newUser.setFirstName(firstName);
            newUser.setLastName(lastName);
            user = userRepository.save(newUser);
        }

        // 3. Always create the new identity row
        UserIdentity newIdentity = new UserIdentity();
        newIdentity.setUser(user);
        newIdentity.setProvider(provider);
        newIdentity.setProviderSub(providerSub);
        userIdentityRepository.save(newIdentity);

        return user;
    }

    public Optional<User> getUserById(java.util.UUID userId) {
        return userRepository.findById(userId);
    }
}