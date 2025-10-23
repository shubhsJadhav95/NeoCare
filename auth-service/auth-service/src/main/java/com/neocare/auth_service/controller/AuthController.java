package com.neocare.auth_service.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.neocare.auth_service.dto.*;
import com.neocare.auth_service.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @GetMapping("/test")
    public ResponseEntity<?> test() {
        return ResponseEntity.ok(java.util.Map.of("message", "Auth service is running!"));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody java.util.Map<String, String> loginRequest) {
        try {
            String email = loginRequest.get("email");
            String password = loginRequest.get("password");
            
            System.out.println("Login attempt for email: " + email);
            
            if (email == null || password == null) {
                return ResponseEntity.badRequest().body(java.util.Map.of("message", "Email and password are required"));
            }
            
            return authService.login(email, password);
        } catch (Exception e) {
            System.err.println("Login error: " + e.getClass().getName() + " - " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(java.util.Map.of(
                "message", "Login failed: " + e.getMessage(),
                "error", e.getClass().getSimpleName()
            ));
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody java.util.Map<String, Object> requestBody) {
        try {
            System.out.println("Received registration request: " + requestBody);
            
            String role = (String) requestBody.get("role");
            
            if (role == null || role.isEmpty()) {
                return ResponseEntity.badRequest().body(java.util.Map.of("message", "Role is required"));
            }

            System.out.println("Processing registration for role: " + role);

            switch (role.toLowerCase()) {
                case "patient":
                    PatientSignupDTO patientDTO = objectMapper.convertValue(requestBody, PatientSignupDTO.class);
                    System.out.println("Converted to PatientDTO: " + patientDTO);
                    return authService.registerPatient(patientDTO);
                case "doctor":
                    DoctorSignupDTO doctorDTO = objectMapper.convertValue(requestBody, DoctorSignupDTO.class);
                    System.out.println("Converted to DoctorDTO: " + doctorDTO);
                    return authService.registerDoctor(doctorDTO);
                case "labassistant":
                    LabAssistantSignupDTO labDTO = objectMapper.convertValue(requestBody, LabAssistantSignupDTO.class);
                    System.out.println("Converted to LabAssistantDTO: " + labDTO);
                    return authService.registerLabAssistant(labDTO);
                case "pharmacy":
                    PharmacySignupDTO pharmacyDTO = objectMapper.convertValue(requestBody, PharmacySignupDTO.class);
                    System.out.println("Converted to PharmacyDTO: " + pharmacyDTO);
                    return authService.registerPharmacy(pharmacyDTO);
                default:
                    return ResponseEntity.badRequest().body(java.util.Map.of("message", "Invalid user role: " + role));
            }
        } catch (Exception e) {
            System.err.println("Registration error: " + e.getClass().getName() + " - " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(java.util.Map.of(
                "message", "Registration failed: " + e.getMessage(),
                "error", e.getClass().getSimpleName()
            ));
        }
    }
}
