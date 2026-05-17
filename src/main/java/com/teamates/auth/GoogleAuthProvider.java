package com.teamates.auth;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import java.util.Collections;

@Component
public class GoogleAuthProvider implements AuthProvider {

    @Value("${google.client.id}")
    private String googleClientId;

    @Override
    public String getProviderName() {
        return "google";
    }

    @Override
    public AuthResult verify(String token) throws Exception {
        GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(
                new NetHttpTransport(), new GsonFactory())
                .setAudience(Collections.singletonList(googleClientId))
                .build();

        GoogleIdToken idToken = verifier.verify(token);
        if (idToken == null) {
            throw new Exception("Invalid Google token");
        }

        GoogleIdToken.Payload payload = idToken.getPayload();

        return new AuthResult(
                payload.getSubject(),
                payload.getEmail(),
                (String) payload.get("given_name"),
                (String) payload.get("family_name")
        );
    }
}