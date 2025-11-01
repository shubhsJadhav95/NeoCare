package com.neocare.auth_service.security;

import com.neocare.auth_service.model.User;
import com.neocare.auth_service.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private LabAssistantRepository labAssistantRepository;

    @Autowired
    private PharmacyRepository pharmacyRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = findUserByEmail(username);

        if (user == null) {
            throw new UsernameNotFoundException("User not found: " + username);
        }

        return org.springframework.security.core.userdetails.User.builder()
                .username(user.getEmail())
                .password(user.getPassword())
                .roles(user.getRole())
                .build();
    }

    private User findUserByEmail(String email) {
        // Check each repository for the user
        var patient = patientRepository.findByEmail(email);
        if (patient.isPresent()) {
            return patient.get();
        }

        var doctor = doctorRepository.findByEmail(email);
        if (doctor.isPresent()) {
            return doctor.get();
        }

        var labAssistant = labAssistantRepository.findByEmail(email);
        if (labAssistant.isPresent()) {
            return labAssistant.get();
        }

        var pharmacy = pharmacyRepository.findByEmail(email);
        if (pharmacy.isPresent()) {
            return pharmacy.get();
        }

        return null;
    }
}
