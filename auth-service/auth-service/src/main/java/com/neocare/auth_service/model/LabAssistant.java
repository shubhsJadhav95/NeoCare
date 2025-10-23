package com.neocare.auth_service.model;

import jakarta.persistence.Entity;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
public class LabAssistant extends User {
    private String labName;
    private String labRegNumber;
}
