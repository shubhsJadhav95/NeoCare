package com.neocare.auth_service.service;

import com.neocare.auth_service.dto.*;
import com.neocare.auth_service.helper.PasswordUtil;
import com.neocare.auth_service.model.*;
import com.neocare.auth_service.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final LabAssistantRepository labAssistantRepository;
    private final PharmacyRepository pharmacyRepository;

    public ResponseEntity<?> login(String email, String password) {
        try {
            System.out.println("Attempting login for: " + email);
            
            // Try to find user in each repository
            var patient = patientRepository.findByEmail(email);
            if (patient.isPresent()) {
                if (PasswordUtil.matches(password, patient.get().getPassword())) {
                    return ResponseEntity.ok(java.util.Map.of(
                        "message", "Login successful",
                        "role", "PATIENT",
                        "token", "patient_" + patient.get().getId() + "_" + System.currentTimeMillis(),
                        "user", java.util.Map.of(
                            "id", patient.get().getId(),
                            "name", patient.get().getName(),
                            "email", patient.get().getEmail(),
                            "role", patient.get().getRole()
                        )
                    ));
                } else {
                    return ResponseEntity.status(401).body(java.util.Map.of("message", "Invalid credentials"));
                }
            }
            
            var doctor = doctorRepository.findByEmail(email);
            if (doctor.isPresent()) {
                if (PasswordUtil.matches(password, doctor.get().getPassword())) {
                    return ResponseEntity.ok(java.util.Map.of(
                        "message", "Login successful",
                        "role", "DOCTOR",
                        "token", "doctor_" + doctor.get().getId() + "_" + System.currentTimeMillis(),
                        "user", java.util.Map.of(
                            "id", doctor.get().getId(),
                            "name", doctor.get().getName(),
                            "email", doctor.get().getEmail(),
                            "role", doctor.get().getRole()
                        )
                    ));
                } else {
                    return ResponseEntity.status(401).body(java.util.Map.of("message", "Invalid credentials"));
                }
            }
            
            var labAssistant = labAssistantRepository.findByEmail(email);
            if (labAssistant.isPresent()) {
                if (PasswordUtil.matches(password, labAssistant.get().getPassword())) {
                    return ResponseEntity.ok(java.util.Map.of(
                        "message", "Login successful",
                        "role", "LAB_ASSISTANT",
                        "token", "labassistant_" + labAssistant.get().getId() + "_" + System.currentTimeMillis(),
                        "user", java.util.Map.of(
                            "id", labAssistant.get().getId(),
                            "name", labAssistant.get().getName(),
                            "email", labAssistant.get().getEmail(),
                            "role", labAssistant.get().getRole()
                        )
                    ));
                } else {
                    return ResponseEntity.status(401).body(java.util.Map.of("message", "Invalid credentials"));
                }
            }
            
            var pharmacy = pharmacyRepository.findByEmail(email);
            if (pharmacy.isPresent()) {
                if (PasswordUtil.matches(password, pharmacy.get().getPassword())) {
                    return ResponseEntity.ok(java.util.Map.of(
                        "message", "Login successful",
                        "role", "PHARMACY",
                        "token", "pharmacy_" + pharmacy.get().getId() + "_" + System.currentTimeMillis(),
                        "user", java.util.Map.of(
                            "id", pharmacy.get().getId(),
                            "name", pharmacy.get().getName(),
                            "email", pharmacy.get().getEmail(),
                            "role", pharmacy.get().getRole()
                        )
                    ));
                } else {
                    return ResponseEntity.status(401).body(java.util.Map.of("message", "Invalid credentials"));
                }
            }
            
            return ResponseEntity.status(404).body(java.util.Map.of("message", "User not found"));
        } catch (Exception e) {
            System.err.println("Login error: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    public ResponseEntity<?> registerPatient(PatientSignupDTO dto) {
        try {
            System.out.println("Registering patient with email: " + dto.getEmail());
            
            if (patientRepository.findByEmail(dto.getEmail()).isPresent()) {
                return ResponseEntity.badRequest().body(java.util.Map.of("message", "Email already registered"));
            }

            Patient patient = new Patient();
            patient.setName(dto.getName());
            patient.setEmail(dto.getEmail());
            patient.setPassword(PasswordUtil.encode(dto.getPassword()));
            patient.setGender(dto.getGender());
            patient.setPhoto(dto.getPhoto());
            patient.setRole("PATIENT");
            patient.setPhoneNumber(dto.getPhoneNumber());
            patient.setBloodGroup(dto.getBloodGroup());

            patientRepository.save(patient);
            System.out.println("Patient registered successfully: " + dto.getEmail());
            return ResponseEntity.ok(java.util.Map.of("message", "Patient registered successfully!"));
        } catch (Exception e) {
            System.err.println("Error registering patient: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    public ResponseEntity<?> registerDoctor(DoctorSignupDTO dto) {
        if (doctorRepository.findByEmail(dto.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body("Email already registered");
        }

        Doctor doctor = new Doctor();
        doctor.setName(dto.getName());
        doctor.setEmail(dto.getEmail());
        doctor.setPassword(PasswordUtil.encode(dto.getPassword()));
        doctor.setGender(dto.getGender());
        doctor.setPhoto(dto.getPhoto());
        doctor.setRole("DOCTOR");
        doctor.setSpecialization(dto.getSpecialization());
        doctor.setLicenseNumber(dto.getLicenseNumber());

        doctorRepository.save(doctor);
        return ResponseEntity.ok("Doctor registered successfully!");
    }

    public ResponseEntity<?> registerLabAssistant(LabAssistantSignupDTO dto) {
        if (labAssistantRepository.findByEmail(dto.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body("Email already registered");
        }

        LabAssistant labAssistant = new LabAssistant();
        labAssistant.setName(dto.getName());
        labAssistant.setEmail(dto.getEmail());
        labAssistant.setPassword(PasswordUtil.encode(dto.getPassword()));
        labAssistant.setGender(dto.getGender());
        labAssistant.setPhoto(dto.getPhoto());
        labAssistant.setRole("LAB_ASSISTANT");
        labAssistant.setLabName(dto.getLabName());
        labAssistant.setLabRegNumber(dto.getLabRegNumber());

        labAssistantRepository.save(labAssistant);
        return ResponseEntity.ok("Lab Assistant registered successfully!");
    }

    public ResponseEntity<?> registerPharmacy(PharmacySignupDTO dto) {
        if (pharmacyRepository.findByEmail(dto.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body("Email already registered");
        }

        Pharmacy pharmacy = new Pharmacy();
        pharmacy.setName(dto.getName());
        pharmacy.setEmail(dto.getEmail());
        pharmacy.setPassword(PasswordUtil.encode(dto.getPassword()));
        pharmacy.setGender(dto.getGender());
        pharmacy.setPhoto(dto.getPhoto());
        pharmacy.setRole("PHARMACY");
        pharmacy.setPharmacyName(dto.getPharmacyName());
        pharmacy.setPharmacyRegNo(dto.getPharmacyRegNo());

        pharmacyRepository.save(pharmacy);
        return ResponseEntity.ok("Pharmacy registered successfully!");
    }
}
