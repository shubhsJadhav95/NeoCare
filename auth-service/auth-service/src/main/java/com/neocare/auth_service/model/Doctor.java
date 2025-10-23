package com.neocare.auth_service.model;

import jakarta.persistence.Entity;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
public class Doctor extends User {
    private String specialization;
    private String licenseNumber;
}
