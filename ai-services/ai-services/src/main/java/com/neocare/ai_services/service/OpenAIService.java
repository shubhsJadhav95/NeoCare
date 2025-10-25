package com.neocare.ai_services.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.*;

@Service
public class OpenAIService {

    @Value("${openai.api.key:}")
    private String apiKey;

    @Value("${openai.api.vision.model:gpt-4o}")
    private String visionModel;

    @Value("${openai.api.max.tokens:1000}")
    private int maxTokens;

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    private static final String OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

    public OpenAIService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
        this.objectMapper = new ObjectMapper();
    }

    /**
     * Analyze an uploaded image using OpenAI Vision API
     */
    public String analyzeImage(MultipartFile imageFile, String prompt) throws IOException {
        // Validate API key early
        if (!isConfigured()) {
            throw new IOException("OPENAI_API_KEY not configured. Set the OPENAI_API_KEY environment variable or openai.api.key property.");
        }

        // Validate file
        if (imageFile == null || imageFile.isEmpty()) {
            throw new IOException("Image file is required and cannot be empty.");
        }

        // Convert image to base64
        String base64Image = Base64.getEncoder().encodeToString(imageFile.getBytes());
        String imageType = imageFile.getContentType();
        if (imageType == null || !imageType.startsWith("image/")) {
            imageType = "image/jpeg";
        }
        
        // Default prompt
        String analysisPrompt = (prompt != null && !prompt.isEmpty()) 
            ? prompt 
            : "Analyze this medical/health-related image. Provide detailed observations about any visible health indicators, measurements, or relevant medical information.";

        // Build request
        Map<String, Object> requestBody = buildVisionRequest(base64Image, imageType, analysisPrompt);

        // Make API call
        return callOpenAIAPI(requestBody);
    }

    /**
     * Analyze multiple images together
     */
    public String analyzeMultipleImages(List<MultipartFile> imageFiles, String prompt) throws IOException {
        if (!isConfigured()) {
            throw new IOException("OPENAI_API_KEY not configured.");
        }

        List<Map<String, Object>> imageContents = new ArrayList<>();
        
        // Add text prompt
        if (prompt == null || prompt.isEmpty()) {
            prompt = "Analyze these medical/health-related images together. Provide comprehensive observations and extract any visible measurements or health indicators.";
        }
        
        Map<String, Object> textContent = new HashMap<>();
        textContent.put("type", "text");
        textContent.put("text", prompt);
        imageContents.add(textContent);
        
        // Add all images
        for (MultipartFile imageFile : imageFiles) {
            String base64Image = Base64.getEncoder().encodeToString(imageFile.getBytes());
            String imageType = imageFile.getContentType();
            
            Map<String, Object> imageContent = new HashMap<>();
            imageContent.put("type", "image_url");
            
            Map<String, String> imageUrl = new HashMap<>();
            imageUrl.put("url", "data:" + imageType + ";base64," + base64Image);
            imageContent.put("image_url", imageUrl);
            
            imageContents.add(imageContent);
        }
        
        // Build request
        Map<String, Object> requestBody = buildMultiImageRequest(imageContents);
        
        // Make API call
        return callOpenAIAPI(requestBody);
    }

    /**
     * Extract specific health metrics from an image
     */
    public Map<String, Object> extractHealthMetrics(MultipartFile imageFile) throws IOException {
        String prompt = "Extract all visible health metrics from this image. " +
                       "Look for: heart rate (BPM), oxygen saturation (SpO2), blood pressure, temperature, " +
                       "respiratory rate, or any other vital signs. " +
                       "Return the data in a structured format with metric names and their values.";
        
        String response = analyzeImage(imageFile, prompt);
        
        Map<String, Object> metrics = new HashMap<>();
        metrics.put("raw_analysis", response);
        metrics.put("timestamp", new Date().toString());
        
        return metrics;
    }

    /**
     * Build request payload for single image
     */
    private Map<String, Object> buildVisionRequest(String base64Image, String imageType, String prompt) {
        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("model", visionModel);
        requestBody.put("max_tokens", maxTokens);
        
        List<Map<String, Object>> messages = new ArrayList<>();
        Map<String, Object> message = new HashMap<>();
        message.put("role", "user");
        
        List<Map<String, Object>> content = new ArrayList<>();
        
        Map<String, Object> textContent = new HashMap<>();
        textContent.put("type", "text");
        textContent.put("text", prompt);
        content.add(textContent);
        
        Map<String, Object> imageContent = new HashMap<>();
        imageContent.put("type", "image_url");
        
        Map<String, String> imageUrl = new HashMap<>();
        imageUrl.put("url", "data:" + imageType + ";base64," + base64Image);
        imageContent.put("image_url", imageUrl);
        
        content.add(imageContent);
        message.put("content", content);
        messages.add(message);
        
        requestBody.put("messages", messages);
        
        return requestBody;
    }

    /**
     * Build request payload for multiple images
     */
    private Map<String, Object> buildMultiImageRequest(List<Map<String, Object>> imageContents) {
        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("model", visionModel);
        requestBody.put("max_tokens", maxTokens);
        
        List<Map<String, Object>> messages = new ArrayList<>();
        Map<String, Object> message = new HashMap<>();
        message.put("role", "user");
        message.put("content", imageContents);
        messages.add(message);
        
        requestBody.put("messages", messages);
        
        return requestBody;
    }

    /**
     * Make the actual API call to OpenAI
     */
    private String callOpenAIAPI(Map<String, Object> requestBody) throws IOException {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(apiKey);
            
            HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(requestBody, headers);
            
            ResponseEntity<String> response = restTemplate.exchange(
                OPENAI_API_URL,
                HttpMethod.POST,
                requestEntity,
                String.class
            );
            
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                JsonNode jsonResponse = objectMapper.readTree(response.getBody());
                
                if (jsonResponse.has("choices") && jsonResponse.get("choices").size() > 0) {
                    JsonNode firstChoice = jsonResponse.get("choices").get(0);
                    if (firstChoice.has("message") && firstChoice.get("message").has("content")) {
                        return firstChoice.get("message").get("content").asText();
                    }
                }
            }
            
            return "Unable to analyze the image. Please try again.";
            
        } catch (HttpStatusCodeException httpEx) {
            String body = httpEx.getResponseBodyAsString();
            String status = httpEx.getStatusCode().toString();
            String reason = httpEx.getStatusText();
            String message = "OpenAI API error (" + status + ") " + reason;
            if (body != null && !body.isEmpty()) {
                try {
                    JsonNode err = objectMapper.readTree(body);
                    if (err.has("error") && err.get("error").has("message")) {
                        message += ": " + err.get("error").get("message").asText();
                    } else {
                        message += ": " + body;
                    }
                } catch (Exception parseIgnored) {
                    message += ": " + body;
                }
            }
            throw new IOException(message, httpEx);
        } catch (Exception e) {
            throw new IOException("Error calling OpenAI API: " + e.getMessage(), e);
        }
    }

    /**
     * Validate API key configuration
     */
    public boolean isConfigured() {
        return apiKey != null && !apiKey.isEmpty() && !apiKey.equals("your-api-key-here");
    }

    public String translateText(String text, String targetLang) throws IOException {
        if (!isConfigured()) {
            throw new IOException("OPENAI_API_KEY not configured.");
        }
        if (text == null) text = "";
        if (targetLang == null || targetLang.isEmpty()) targetLang = "en";

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("model", visionModel);
        requestBody.put("max_tokens", maxTokens);

        List<Map<String, Object>> messages = new ArrayList<>();

        Map<String, Object> system = new HashMap<>();
        system.put("role", "system");
        system.put("content", "You are a translation engine. Translate the user's text into " + targetLang + ". Return only the translated text without any explanations.");
        messages.add(system);

        Map<String, Object> user = new HashMap<>();
        user.put("role", "user");
        user.put("content", text);
        messages.add(user);

        requestBody.put("messages", messages);

        return callOpenAIAPI(requestBody);
    }
}
