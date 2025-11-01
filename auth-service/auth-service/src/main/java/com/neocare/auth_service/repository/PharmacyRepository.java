package com.neocare.auth_service.repository;

import com.neocare.auth_service.model.Pharmacy;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PharmacyRepository extends JpaRepository<Pharmacy, Long> {
    Optional<Pharmacy> findByEmail(String email);
}
