package com.neocare.auth_service.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class DoctorSignupDTO extends UserSignupDTO {
    private String specialization;
    private String licenseNumber;
}
