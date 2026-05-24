package com.teamates.service;

import com.teamates.model.User;
import com.teamates.model.UserIdentity;
import com.teamates.repository.UserIdentityRepository;
import com.teamates.repository.UserRepository;
import com.teamates.model.Gender;
import com.teamates.model.Registration;
import com.teamates.model.Session;
import com.teamates.repository.RegistrationRepository;
import com.teamates.repository.SessionRepository;
import com.teamates.exception.NotFoundException;
import java.util.List;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final UserIdentityRepository userIdentityRepository;
    private final RegistrationRepository registrationRepository;
    private final SessionRepository sessionRepository;

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

    public User saveUser(User user) {
        return userRepository.save(user);
    }

    public Optional<User> getUserById(java.util.UUID userId) {
        return userRepository.findById(userId);
    }

    public boolean isProfileComplete(User user) {
        return user.getGender() != null &&
                user.getBirthDate() != null;
    }

    public User updateUser(User user, String firstName, String lastName, String phone) {
        if (firstName != null) user.setFirstName(firstName);
        if (lastName != null) user.setLastName(lastName);
        if (phone != null) user.setPhone(phone);
        return userRepository.save(user);
    }

    public User completeProfile(User user, Gender gender, LocalDate birthDate) {
        if (isProfileComplete(user)) {
            throw new IllegalArgumentException("Profile already completed");
        }
        if (gender == null || birthDate == null) {
            throw new IllegalArgumentException("Gender and birth date are required");
        }
        user.setGender(gender);
        user.setBirthDate(birthDate);
        return userRepository.save(user);
    }

    @Transactional
    public void deleteUser(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found"));

        // get all registrations for this user
        List<Registration> allRegistrations = registrationRepository.findByUserUserId(userId);

        for (Registration reg : allRegistrations) {
            Session session = reg.getSession();

            if (session.getHost().getUserId().equals(userId)) {
                handleHostDeletion(session, reg, userId);
            } else {
                registrationRepository.delete(reg);
            }
        }

        userRepository.delete(user);
    }

    private void handleHostDeletion(Session session, Registration hostReg, UUID userId) {
        List<Registration> sessionRegistrations = registrationRepository
                .findBySessionSessionIdOrderByRegisteredAtAsc(session.getSessionId());

        List<Registration> otherRegistrations = sessionRegistrations.stream()
                .filter(r -> !r.getUser().getUserId().equals(userId))
                .toList();

        if (otherRegistrations.isEmpty()) {
            // no other players → delete the session
            registrationRepository.deleteAll(sessionRegistrations);
            sessionRepository.delete(session);
        } else {
            // transfer host to next registered user
            User newHost = otherRegistrations.get(0).getUser();
            session.setHost(newHost);
            sessionRepository.save(session);
            registrationRepository.delete(hostReg);
        }
    }
}