package com.neocare.pharmafast_services.service;

import com.neocare.pharmafast_services.model.DeliveryRequest;
import com.neocare.pharmafast_services.model.MedicalStore;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Service
public class PharmaFastService {

    @Value("${google.maps.api.key:}")
    private String googleMapsApiKey;

    private final RestTemplate restTemplate = new RestTemplate();

    /**
     * Find nearby medical stores: uses Google Places when API key is present; otherwise uses mock.
     */
    public List<MedicalStore> findNearbyStores(Double latitude, Double longitude, Double radiusKm) {
        if (googleMapsApiKey != null && !googleMapsApiKey.isEmpty()) {
            try {
                return findNearbyStoresWithPlaces(latitude, longitude, radiusKm);
            } catch (Exception ignored) {
                // fall through to mock if API fails
            }
        }
        return findNearbyStoresMock(latitude, longitude, radiusKm);
    }

    private List<MedicalStore> findNearbyStoresMock(Double latitude, Double longitude, Double radiusKm) {
        List<MedicalStore> stores = new ArrayList<>();
        String[] storeNames = {
            "Apollo Pharmacy",
            "MedPlus Health Services",
            "Wellness Forever",
            "Netmeds",
            "PharmEasy Store",
            "HealthKart Pharmacy",
            "1mg Store",
            "Cure+ Pharmacy"
        };
        Random random = new Random();
        int storeCount = 5 + random.nextInt(3); // 5-7 stores
        for (int i = 0; i < storeCount && i < storeNames.length; i++) {
            double angle = random.nextDouble() * 2 * Math.PI;
            double distance = random.nextDouble() * radiusKm;
            double latOffset = (distance * Math.cos(angle)) / 111.0;
            double lonOffset = (distance * Math.sin(angle)) / (111.0 * Math.cos(Math.toRadians(latitude)));
            double storeLat = latitude + latOffset;
            double storeLon = longitude + lonOffset;
            String status = i == 0 ? "accepted" : (i == 1 ? "pending" : getRandomStatus());
            MedicalStore store = new MedicalStore(
                i + 1,
                storeNames[i],
                String.format("Shop %d, %s, Near %s", 10 + i, getRandomStreet(i), "Location"),
                String.format("+91 %d", 9000000000L + random.nextInt(99999999)),
                storeLat,
                storeLon,
                distance,
                4.0 + random.nextDouble(),
                status
            );
            if ("accepted".equals(status)) {
                store.setEstimatedTime(String.format("%d mins", 20 + random.nextInt(30)));
            }
            stores.add(store);
        }
        return stores;
    }

    @SuppressWarnings("unchecked")
    private List<MedicalStore> findNearbyStoresWithPlaces(Double latitude, Double longitude, Double radiusKm) {
        List<MedicalStore> list = new ArrayList<>();
        String nearbyUrl = String.format(Locale.US,
            "https://maps.googleapis.com/maps/api/place/nearbysearch/json?key=%s&location=%f,%f&radius=%d&type=pharmacy",
            googleMapsApiKey, latitude, longitude, (int)Math.round(radiusKm * 1000));
        Map<String, Object> resp = restTemplate.getForObject(nearbyUrl, Map.class);
        if (resp == null || resp.get("results") == null) return list;
        List<Map<String, Object>> results = (List<Map<String, Object>>) resp.get("results");
        int id = 1;
        for (Map<String, Object> r : results) {
            Map<String, Object> geometry = (Map<String, Object>) r.get("geometry");
            Map<String, Object> loc = geometry != null ? (Map<String, Object>) geometry.get("location") : null;
            Double lat = loc != null ? toDouble(loc.get("lat")) : null;
            Double lon = loc != null ? toDouble(loc.get("lng")) : null;
            if (lat == null || lon == null) continue;
            String name = (String) r.getOrDefault("name", "Pharmacy");
            String address = (String) r.getOrDefault("vicinity", "");
            Double rating = toDouble(r.get("rating"));
            String placeId = (String) r.get("place_id");
            double distance = calculateDistance(latitude, longitude, lat, lon);
            MedicalStore store = new MedicalStore(id++, name, address, null, lat, lon, distance, rating != null ? rating : 4.2, "pending");
            // Enrich with details
            enrichWithPlaceDetails(store, placeId);
            list.add(store);
        }
        // Optionally sort by distance
        list.sort(Comparator.comparingDouble(MedicalStore::getDistance));
        // Mark first as accepted for demo UX
        if (!list.isEmpty()) {
            list.get(0).setStatus("accepted");
            list.get(0).setEstimatedTime("30 mins");
        }
        return list;
    }

    @SuppressWarnings("unchecked")
    private void enrichWithPlaceDetails(MedicalStore store, String placeId) {
        if (placeId == null) return;
        String detailsUrl = String.format(Locale.US,
            "https://maps.googleapis.com/maps/api/place/details/json?key=%s&place_id=%s&fields=formatted_address,formatted_phone_number,opening_hours,photos,rating,user_ratings_total,international_phone_number",
            googleMapsApiKey, placeId);
        Map<String, Object> resp = restTemplate.getForObject(detailsUrl, Map.class);
        if (resp == null || resp.get("result") == null) return;
        Map<String, Object> result = (Map<String, Object>) resp.get("result");
        String phone = (String) Optional.ofNullable(result.get("international_phone_number")).orElse(result.get("formatted_phone_number"));
        if (phone != null) store.setPhone(phone);
        if (result.get("formatted_address") != null) store.setAddress((String) result.get("formatted_address"));
        Object rating = result.get("rating");
        if (rating != null) store.setRating(toDouble(rating));
        // we could add hours/photos into extended DTO later
    }

    private Double toDouble(Object o) {
        if (o instanceof Number) return ((Number) o).doubleValue();
        try { return o != null ? Double.parseDouble(String.valueOf(o)) : null; } catch (Exception e) { return null; }
    }

    /**
     * Calculate distance between two coordinates using Haversine formula
     */
    public double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
        final int R = 6371; // Radius of the Earth in km

        double latDistance = Math.toRadians(lat2 - lat1);
        double lonDistance = Math.toRadians(lon2 - lon1);
        
        double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);
        
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        
        return R * c;
    }

    private String getRandomStatus() {
        String[] statuses = {"pending", "accepted", "rejected"};
        return statuses[new Random().nextInt(statuses.length)];
    }

    private String getRandomStreet(int index) {
        String[] streets = {"Main Road", "Market Street", "Gandhi Nagar", "Station Road", "MG Road"};
        return streets[index % streets.length];
    }

    /**
     * Get Google Maps embed URL for displaying stores
     */
    public String getMapEmbedUrl(Double latitude, Double longitude, List<MedicalStore> stores) {
        if (googleMapsApiKey == null || googleMapsApiKey.isEmpty()) {
            return null;
        }

        StringBuilder markers = new StringBuilder();
        markers.append(String.format("markers=color:red%%7Clabel:You%%7C%f,%f", latitude, longitude));

        for (MedicalStore store : stores) {
            String color = "accepted".equals(store.getStatus()) ? "green" : 
                          "pending".equals(store.getStatus()) ? "yellow" : "gray";
            markers.append(String.format("&markers=color:%s%%7C%f,%f", 
                color, store.getLatitude(), store.getLongitude()));
        }

        return String.format(
            "https://www.google.com/maps/embed/v1/view?key=%s&center=%f,%f&zoom=14&%s",
            googleMapsApiKey, latitude, longitude, markers.toString()
        );
    }
}
