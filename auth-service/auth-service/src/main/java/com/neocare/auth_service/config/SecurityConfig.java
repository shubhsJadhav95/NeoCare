package com.neocare.auth_service.config;//package config;
//
//import org.springframework.context.annotation.Bean;
//import org.springframework.context.annotation.Configuration;
//import org.springframework.security.config.annotation.web.builders.HttpSecurity;
//import org.springframework.security.web.SecurityFilterChain;
//import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
//import org.springframework.security.crypto.password.PasswordEncoder;
//
//@Configuration
//public class SecurityConfig {
//
//    // Custom security rules
//    @Bean
//    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
//        http
//                .csrf(csrf -> csrf.disable()) // disable CSRF for APIs
//                .authorizeHttpRequests(auth -> auth
//                        .requestMatchers("/api/auth/**").permitAll() // allow register/login without auth
//                        .anyRequest().permitAll() // allow everything else (you can restrict later)
//                )
//                .formLogin(login -> login.disable())  // disable default login form
//                .httpBasic(basic -> basic.disable()); // disable HTTP basic auth
//
//        return http.build();
//    }
//
//    // Password encoder for hashing passwords
//    @Bean
//    public PasswordEncoder passwordEncoder() {
//        return new BCryptPasswordEncoder();
//    }
//}
