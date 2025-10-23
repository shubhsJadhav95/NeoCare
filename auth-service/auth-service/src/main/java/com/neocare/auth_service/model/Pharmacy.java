package com.neocare.auth_service.model;

import jakarta.persistence.Entity;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
public class Pharmacy extends User {
    private String pharmacyName;
    private String pharmacyRegNo;
}
