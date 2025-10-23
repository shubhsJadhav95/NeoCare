package com.neocare.auth_service.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class LabAssistantSignupDTO extends UserSignupDTO {
    private String labName;
    private String labRegNumber;
}
