package com.neocare.auth_service.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class PharmacySignupDTO extends UserSignupDTO {
    private String pharmacyName;
    private String pharmacyRegNo;
}
