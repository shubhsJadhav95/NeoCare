package com.neocare.auth_service.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class PatientSignupDTO extends UserSignupDTO {
    private String phoneNumber;
    private String bloodGroup;
}
