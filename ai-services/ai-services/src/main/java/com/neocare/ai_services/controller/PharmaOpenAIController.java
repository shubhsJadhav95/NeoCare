package com.neocare.ai_services.controller;

import com.neocare.ai_services.service.OpenAIService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.*;

@RestController
@RequestMapping("/api/pharma")
public class PharmaOpenAIController {

    private static final Logger logger = LoggerFactory.getLogger(PharmaOpenAIController.class);

    @Autowired
    private OpenAIService openAIService;

    /**
     * Analyze prescription image and extract medications with structured data
     */
    @PostMapping(
        value = "/analyze-prescription",
        consumes = MediaType.MULTIPART_FORM_DATA_VALUE,
        produces = MediaType.APPLICATION_JSON_VALUE
    )
    public ResponseEntity<?> analyzePrescription(@RequestParam("image") MultipartFile image) {
        logger.info("=== Analyze Prescription Request ===");
        logger.info("File: {}, Size: {}", image.getOriginalFilename(), image.getSize());

        try {
            if (image == null || image.isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "error", "Image file is required"));
            }

            String contentType = image.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "error", "File must be an image"));
            }

            if (!openAIService.isConfigured()) {
                return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body(Map.of("success", false, "error", "OpenAI API key not configured"));
            }

            String prompt = """
                Analyze this prescription image and extract ALL medications mentioned.
                
                For EACH medication found, provide the following in a structured format:
                
                MEDICATION 1:
                - Name: [Full medicine name]
                - Dosage: [Strength/dosage, e.g., 500mg, 10ml]
                - Form: [Tablet/Capsule/Syrup/Injection/etc.]
                - Price: [Estimated average price in INR (Indian Rupees), provide realistic market price]
                - Details: [Brief usage/indication if visible]
                
                MEDICATION 2:
                [Repeat same format]
                
                If you can suggest generic/substitute alternatives, add them as separate entries with:
                - Tag: Recommended Substitute
                
                List each medication separately and clearly. Be precise with dosages and forms.
                """;

            String analysis = openAIService.analyzeImage(image, prompt);
            logger.info("Analysis completed successfully");

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("analysis", analysis);
            response.put("fileName", image.getOriginalFilename());
            response.put("timestamp", new Date().toString());

            return ResponseEntity.ok(response);

        } catch (IOException e) {
            logger.error("IOException during prescription analysis", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("success", false, "error", "Failed to analyze prescription: " + e.getMessage()));
        } catch (Exception e) {
            logger.error("Unexpected error during prescription analysis", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("success", false, "error", "Unexpected error: " + e.getMessage()));
        }
    }
}
