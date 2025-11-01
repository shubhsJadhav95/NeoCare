package com.neocare.ai_services.controller;

import com.neocare.ai_services.dto.ImageAnalysisResponse;
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
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/openai")
public class OpenAIController {

    private static final Logger logger = LoggerFactory.getLogger(OpenAIController.class);

    @Autowired
    private OpenAIService openAIService;

    /**
     * Health check endpoint
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> health() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "OpenAI Service is running");
        response.put("configured", openAIService.isConfigured());
        
        if (!openAIService.isConfigured()) {
            response.put("message", "OpenAI API key not configured. Set OPENAI_API_KEY environment variable.");
        }
        
        return ResponseEntity.ok(response);
    }

    /**
     * Analyze a single image
     */
    @PostMapping(
        value = "/analyze-image",
        consumes = MediaType.MULTIPART_FORM_DATA_VALUE,
        produces = MediaType.APPLICATION_JSON_VALUE
    )
    public ResponseEntity<?> analyzeImage(
            @RequestParam("image") MultipartFile image,
            @RequestParam(value = "prompt", required = false) String prompt
    ) {
        try {
            // Validate file
            if (image == null || image.isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "error", "Image file is required"));
            }

            // Validate file type
            String contentType = image.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "error", "File must be an image"));
            }

            // Analyze image
            String analysis = openAIService.analyzeImage(image, prompt);

            // Build response
            ImageAnalysisResponse response = new ImageAnalysisResponse();
            response.setSuccess(true);
            response.setAnalysis(analysis);
            response.setFileName(image.getOriginalFilename());
            response.setFileSize(image.getSize());
            response.setTimestamp(new Date().toString());

            return ResponseEntity.ok(response);

        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("success", false, "error", "Failed to analyze image: " + e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("success", false, "error", "Unexpected error: " + e.getMessage()));
        }
    }

    /**
     * Translate text to target language
     */
    @PostMapping(
        value = "/translate",
        consumes = MediaType.APPLICATION_JSON_VALUE,
        produces = MediaType.APPLICATION_JSON_VALUE
    )
    public ResponseEntity<?> translate(@RequestBody Map<String, String> body) {
        try {
            String text = body.getOrDefault("text", "");
            String targetLang = body.getOrDefault("targetLang", "en");
            String translated = openAIService.translateText(text, targetLang);
            return ResponseEntity.ok(Map.of("translatedText", translated));
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Analyze multiple images together
     */
    @PostMapping(
        value = "/analyze-multiple-images",
        consumes = MediaType.MULTIPART_FORM_DATA_VALUE,
        produces = MediaType.APPLICATION_JSON_VALUE
    )
    public ResponseEntity<?> analyzeMultipleImages(
            @RequestParam("images") List<MultipartFile> images,
            @RequestParam(value = "prompt", required = false) String prompt
    ) {
        logger.info("=== Analyze Multiple Images Request ===");
        logger.info("Number of files received: {}", images != null ? images.size() : 0);
        logger.info("Prompt: {}", prompt);
        
        try {
            // Validate files
            if (images == null || images.isEmpty()) {
                logger.error("No images provided in request");
                return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "error", "At least one image is required"));
            }
            
            // Log file details
            for (int i = 0; i < images.size(); i++) {
                MultipartFile file = images.get(i);
                logger.info("File {}: name={}, size={}, type={}", 
                    i, file.getOriginalFilename(), file.getSize(), file.getContentType());
            }

            // Filter only image files
            List<MultipartFile> imageFiles = images.stream()
                .filter(f -> f.getContentType() != null && f.getContentType().startsWith("image/"))
                .toList();

            if (imageFiles.isEmpty()) {
                logger.error("No valid image files found after filtering");
                return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "error", "No valid image files found"));
            }
            
            logger.info("Valid image files after filtering: {}", imageFiles.size());
            
            // Check if service is configured
            if (!openAIService.isConfigured()) {
                logger.error("OpenAI service is not configured - API key missing");
                return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body(Map.of("success", false, "error", "OpenAI API key not configured. Set OPENAI_API_KEY environment variable."));
            }

            // Analyze images
            logger.info("Calling OpenAI service to analyze {} images", imageFiles.size());
            String analysis = openAIService.analyzeMultipleImages(imageFiles, prompt);
            logger.info("Analysis completed successfully");

            // Build response
            ImageAnalysisResponse response = new ImageAnalysisResponse();
            response.setSuccess(true);
            response.setAnalysis(analysis);
            response.setFileName(imageFiles.size() + " images");
            response.setFileSize(imageFiles.stream().mapToLong(MultipartFile::getSize).sum());
            response.setTimestamp(new Date().toString());

            return ResponseEntity.ok(response);

        } catch (IOException e) {
            logger.error("IOException during image analysis", e);
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of(
                    "success", false, 
                    "error", "Failed to analyze images: " + e.getMessage(),
                    "type", "IOException"
                ));
        } catch (Exception e) {
            logger.error("Unexpected error during image analysis", e);
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of(
                    "success", false, 
                    "error", "Unexpected error: " + e.getMessage(),
                    "type", e.getClass().getSimpleName(),
                    "details", e.toString()
                ));
        }
    }

    /**
     * Extract health metrics from an image
     */
    @PostMapping(
        value = "/extract-metrics",
        consumes = MediaType.MULTIPART_FORM_DATA_VALUE,
        produces = MediaType.APPLICATION_JSON_VALUE
    )
    public ResponseEntity<?> extractMetrics(
            @RequestParam("image") MultipartFile image
    ) {
        try {
            if (image == null || image.isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "error", "Image file is required"));
            }

            Map<String, Object> metrics = openAIService.extractHealthMetrics(image);
            metrics.put("success", true);
            metrics.put("fileName", image.getOriginalFilename());
            metrics.put("fileSize", image.getSize());

            return ResponseEntity.ok(metrics);

        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("success", false, "error", "Failed to extract metrics: " + e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("success", false, "error", "Unexpected error: " + e.getMessage()));
        }
    }

    /**
     * Test image upload (no analysis)
     */
    @PostMapping(
        value = "/test-upload",
        consumes = MediaType.MULTIPART_FORM_DATA_VALUE,
        produces = MediaType.APPLICATION_JSON_VALUE
    )
    public ResponseEntity<?> testUpload(
            @RequestParam("image") MultipartFile image
    ) {
        try {
            if (image == null || image.isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "error", "Image file is required"));
            }

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("fileName", image.getOriginalFilename());
            response.put("fileSize", image.getSize());
            response.put("contentType", image.getContentType());
            response.put("message", "Image uploaded successfully");

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("success", false, "error", "Upload test failed: " + e.getMessage()));
        }
    }
}
