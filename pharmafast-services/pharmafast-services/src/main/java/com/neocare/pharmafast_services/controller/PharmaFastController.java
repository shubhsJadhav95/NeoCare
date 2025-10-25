package controller;

import com.neocare.pharmafast_services.model.DeliveryRequest;
import com.neocare.pharmafast_services.model.MedicalStore;
import com.neocare.pharmafast_services.service.PharmaFastService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/pharmafast")
@CrossOrigin(origins = "*")
public class PharmaFastController {

    private static final Logger logger = LoggerFactory.getLogger(PharmaFastController.class);

    @Autowired
    private PharmaFastService pharmaFastService;

    /**
     * Submit delivery request and find nearby medical stores
     */
    @PostMapping(
            value = "/submit-request",
            consumes = MediaType.APPLICATION_JSON_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE
    )
    public ResponseEntity<?> submitDeliveryRequest(@RequestBody DeliveryRequest request) {
        logger.info("=== Delivery Request Received ===");
        logger.info("Customer: {}, Phone: {}", request.getDelivery().getName(), request.getDelivery().getPhone());
        logger.info("Location: {}, {}", request.getDelivery().getLatitude(), request.getDelivery().getLongitude());
        logger.info("Total Items: {}, Total Amount: ₹{}", request.getItems().size(), request.getTotal());

        try {
            Double latitude = request.getDelivery().getLatitude();
            Double longitude = request.getDelivery().getLongitude();

            if (latitude == null || longitude == null) {
                return ResponseEntity.badRequest()
                        .body(Map.of("success", false, "error", "Location coordinates are required"));
            }

            // Find nearby medical stores within 5km radius
            List<MedicalStore> nearbyStores = pharmaFastService.findNearbyStores(latitude, longitude, 5.0);

            // Get Google Maps embed URL
            String mapUrl = pharmaFastService.getMapEmbedUrl(latitude, longitude, nearbyStores);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("stores", nearbyStores);
            response.put("mapUrl", mapUrl);
            response.put("userLocation", Map.of(
                    "latitude", latitude,
                    "longitude", longitude,
                    "address", request.getDelivery().getAddress()
            ));
            response.put("requestId", UUID.randomUUID().toString());
            response.put("timestamp", new Date().toString());

            logger.info("Found {} nearby stores", nearbyStores.size());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            logger.error("Error processing delivery request", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "error", "Failed to process request: " + e.getMessage()));
        }
    }

    /**
     * Get nearby stores based on coordinates
     */
    @GetMapping("/nearby-stores")
    public ResponseEntity<?> getNearbyStores(
            @RequestParam Double latitude,
            @RequestParam Double longitude,
            @RequestParam(defaultValue = "5.0") Double radiusKm
    ) {
        logger.info("Finding stores near: {}, {} within {}km", latitude, longitude, radiusKm);

        try {
            List<MedicalStore> stores = pharmaFastService.findNearbyStores(latitude, longitude, radiusKm);

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "stores", stores,
                    "count", stores.size()
            ));
        } catch (Exception e) {
            logger.error("Error finding nearby stores", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "error", e.getMessage()));
        }
    }
}
