package com.neocare.auth_service.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserSignupDTO {
    private String name;
    private String email;
    private String password;
    private String photo;   // Cloudinary URL
    private String gender;
    private String role;    // patient | doctor | labAssistant | pharmacy
}
