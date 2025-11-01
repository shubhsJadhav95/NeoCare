package com.neocare.ai_services.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@RestController
@RequestMapping("/api/chat")
@CrossOrigin(origins = "http://localhost:5173")
public class OllamaController {

    @Autowired
    private RestTemplate restTemplate;

    @Value("${spring.ai.ollama.chat.base-url:http://localhost:11434}")
    private String ollamaBaseUrl;

    @Value("${spring.ai.ollama.chat.model:OussamaELALLAM/MedExpert}")
    private String model;

    // In-memory storage for user conversations (can be replaced with database later)
    private final Map<String, List<Map<String, Object>>> userConversations = new ConcurrentHashMap<>();

    @PostMapping("/message")
    public ResponseEntity<Map<String, String>> chat(@RequestBody Map<String, String> request) {
        try {
            String message = request.get("message");
            if (message == null || message.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Message cannot be empty"));
            }

            // Call Ollama API
            String ollamaResponse = callOllamaAPI(message);

            return ResponseEntity.ok(Map.of("response", ollamaResponse));

        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Failed to process request: " + e.getMessage()));
        }
    }

    @PostMapping("/save-conversation")
    public ResponseEntity<Map<String, String>> saveConversation(@RequestBody Map<String, Object> request) {
        try {
            String userEmail = request.get("userEmail").toString();
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> messages = (List<Map<String, Object>>) request.get("messages");

            if (userEmail == null || messages == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "User email and messages are required"));
            }

            userConversations.put(userEmail, new ArrayList<>(messages));

            return ResponseEntity.ok(Map.of("message", "Conversation saved successfully"));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Failed to save conversation: " + e.getMessage()));
        }
    }

    @GetMapping("/get-conversation/{userEmail}")
    public ResponseEntity<Map<String, Object>> getConversation(@PathVariable String userEmail) {
        try {
            List<Map<String, Object>> messages = userConversations.get(userEmail);

            if (messages == null) {
                // Return default welcome message if no conversation exists
                messages = Arrays.asList(Map.of(
                    "id", 1,
                    "text", "Hello! I'm Dr.NEO, your AI healthcare assistant. How can I help you today?",
                    "sender", "bot",
                    "timestamp", new Date().toString()
                ));
            }

            return ResponseEntity.ok(Map.of("messages", messages));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Failed to retrieve conversation: " + e.getMessage()));
        }
    }

    @DeleteMapping("/clear-conversation/{userEmail}")
    public ResponseEntity<Map<String, String>> clearConversation(@PathVariable String userEmail) {
        try {
            userConversations.remove(userEmail);
            return ResponseEntity.ok(Map.of("message", "Conversation cleared successfully"));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Failed to clear conversation: " + e.getMessage()));
        }
    }

    private String callOllamaAPI(String message) {
        try {
            // Prepare the request payload for Ollama
            Map<String, Object> requestPayload = Map.of(
                "model", model,
                "prompt", message,
                "stream", false
            );

            // Make HTTP request to Ollama
            try {
                ResponseEntity<String> response = restTemplate.postForEntity(
                    ollamaBaseUrl + "/api/generate",
                    requestPayload,
                    String.class
                );

                if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                    // Parse JSON response to extract the "response" field
                    String body = response.getBody();
                    // Simple JSON parsing to extract response field
                    String responseMarker = "\"response\":\"";
                    int startIndex = body.indexOf(responseMarker);
                    if (startIndex != -1) {
                        startIndex += responseMarker.length();
                        int endIndex = body.indexOf("\"", startIndex);
                        if (endIndex != -1) {
                            return body.substring(startIndex, endIndex).replace("\\n", "\n").replace("\\\"", "\"");
                        }
                    }
                }
            } catch (Exception e) {
                // If direct API call fails, return fallback message
                throw e;
            }

            return "I'm sorry, I couldn't process your request at the moment. Please try again later.";

        } catch (Exception e) {
            // Fallback response if Ollama is not available
            return "Thank you for your question: \"" + message + "\". " +
                   "This is a healthcare AI assistant. Please note that I'm here to provide general information and support. " +
                   "For specific medical advice, diagnosis, or treatment, please consult with qualified healthcare professionals. " +
                   "If you have a medical emergency, contact your local emergency services immediately.";
        }
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of(
            "status", "AI Service is running",
            "model", model,
            "ollama_url", ollamaBaseUrl
        ));
    }
}
