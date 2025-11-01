package com.neocare.auth_service.model;

import jakarta.persistence.Entity;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
public class Patient extends User {
    private String phoneNumber;
    private String bloodGroup;
}
