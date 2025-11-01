package com.neocare.auth_service.repository;

import com.neocare.auth_service.model.LabAssistant;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface LabAssistantRepository extends JpaRepository<LabAssistant, Long> {
    Optional<LabAssistant> findByEmail(String email);
}
