package com.teamates.dto;

import com.teamates.model.Registration;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class RegistrationMapper {

    private final UserMapper userMapper;

    public RegistrationResponseDTO toDto(Registration registration) {
        return new RegistrationResponseDTO(
                registration.getRegistrationId(),
                userMapper.toPublicDto(registration.getUser()),
                registration.getRegisteredAt()
        );
    }
}
