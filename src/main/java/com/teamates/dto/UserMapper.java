package com.teamates.dto;

import com.teamates.model.User;
import org.springframework.stereotype.Component;

@Component
public class UserMapper {

    public UserResponseDTO toDto(User user) {
        return new UserResponseDTO(
                user.getUserId(),
                user.getFirstName(),
                user.getLastName(),
                user.getPhone(),
                user.getGender(),
                user.getGender() != null && user.getBirthDate() != null
        );
    }

    public UserPublicDTO toPublicDto(User user) {
        return new UserPublicDTO(
                user.getUserId(),
                user.getFirstName(),
                user.getLastName()
        );
    }
}

