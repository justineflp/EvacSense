package com.evacsense.service;

import com.evacsense.model.User;
import com.evacsense.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class FaceRecognitionService {

    @Autowired
    private UserRepository userRepository;

    // Transient in-memory retry store: userId -> failed attempts count
    private final Map<String, Integer> retryAttemptsStore = new ConcurrentHashMap<>();

    public static class FaceVerifyResult {
        public boolean success;
        public float confidence;
        public int attemptsRemaining;
        public String message;

        public FaceVerifyResult(boolean success, float confidence, int attemptsRemaining, String message) {
            this.success = success;
            this.confidence = confidence;
            this.attemptsRemaining = attemptsRemaining;
            this.message = message;
        }
    }

    @org.springframework.beans.factory.annotation.Value("${rapidapi.key:b1d590e0e9msh474429247598414p196a7bjsn5ff8ffce118f}")
    private String rapidApiKey;

    @org.springframework.beans.factory.annotation.Value("${rapidapi.host:face-comparison1.p.rapidapi.com}")
    private String rapidApiHost;

    @org.springframework.beans.factory.annotation.Value("${rapidapi.url:https://face-comparison1.p.rapidapi.com/face_comparison}")
    private String rapidApiUrl;

    public FaceVerifyResult verifyFace(String userId, String livePhotoBase64) {
        int attempts = retryAttemptsStore.getOrDefault(userId, 0);

        if (attempts >= 3) {
            return new FaceVerifyResult(
                    false,
                    0.0f,
                    0,
                    "Maximum biometric attempts exceeded. Account flagged for manual marshal verification.");
        }

        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty() || userOpt.get().getPhotoBase64() == null || userOpt.get().getPhotoBase64().isEmpty()) {
            return new FaceVerifyResult(
                    false,
                    0.0f,
                    3,
                    "Verification failed: No registered baseline student photo found. Please register your face in the Dashboard first.");
        }

        String storedPhotoBase64 = userOpt.get().getPhotoBase64();

        // Strip "data:image/...;base64," prefixes if present
        if (storedPhotoBase64.contains(",")) {
            storedPhotoBase64 = storedPhotoBase64.split(",")[1];
        }
        if (livePhotoBase64 != null && livePhotoBase64.contains(",")) {
            livePhotoBase64 = livePhotoBase64.split(",")[1];
        }

        try {
            org.springframework.web.client.RestTemplate restTemplate = new org.springframework.web.client.RestTemplate();
            org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
            headers.setContentType(org.springframework.http.MediaType.APPLICATION_JSON);
            headers.set("subscriptionkey", "API_KEY");

            Map<String, String> payload = new java.util.HashMap<>();
            payload.put("encoded_image1", storedPhotoBase64);
            payload.put("encoded_image2", livePhotoBase64);

            org.springframework.http.HttpEntity<Map<String, String>> request = new org.springframework.http.HttpEntity<>(
                    payload, headers);

            String mxFaceUrl = "https://faceapi.mxface.ai/api/v3/face/verify";
            org.springframework.http.ResponseEntity<Map> response = restTemplate.postForEntity(mxFaceUrl, request,
                    Map.class);
            Map<String, Object> body = response.getBody();

            System.out.println("=== MXFACE RAW RESPONSE ===");
            System.out.println(body);
            System.out.println("===========================");

            if (response.getStatusCode().is2xxSuccessful() && body != null) {
                boolean verified = false;
                float confidence = 0.0f;

                if (body.containsKey("matchResult")) {
                    verified = body.get("matchResult").toString().equals("1")
                            || body.get("matchResult").toString().equals("true");
                }

                if (body.containsKey("matchedFaces")) {
                    java.util.List<Map<String, Object>> matched = (java.util.List<Map<String, Object>>) body
                            .get("matchedFaces");
                    if (!matched.isEmpty() && matched.get(0).containsKey("confidence")) {
                        confidence = Float.parseFloat(matched.get(0).get("confidence").toString());
                        if (confidence <= 1.0f && confidence > 0) {
                            confidence *= 100.0f;
                        }
                    }
                } else if (body.containsKey("confidence")) {
                    confidence = Float.parseFloat(body.get("confidence").toString());
                }

                confidence = Math.round(confidence * 100.0f) / 100.0f;

                // Fallback to our threshold if matchResult isn't 1 but confidence is high
                if (verified || confidence >= 70.0f) {
                    retryAttemptsStore.remove(userId);
                    return new FaceVerifyResult(true, confidence, 3,
                            "Facial biometric verified successfully.");
                } else {
                    attempts += 1;
                    retryAttemptsStore.put(userId, attempts);
                    return new FaceVerifyResult(false, confidence, Math.max(0, 3 - attempts),
                            attempts >= 3 ? "Verification failed 3 times. Locked out. (Score: " + confidence + "%)"
                                    : "Face does not match registered photo (Score: " + confidence
                                            + "%). Try better lighting.");
                }
            } else {
                return new FaceVerifyResult(false, 0.0f, 3, "API returned an unexpected response.");
            }
        } catch (org.springframework.web.client.HttpClientErrorException e) {
            System.err.println("=== MXFACE HTTP ERROR ===");
            System.err.println(e.getResponseBodyAsString());
            System.err.println("=========================");
            return new FaceVerifyResult(false, 0.0f, 3,
                    "API Error: " + e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            return new FaceVerifyResult(false, 0.0f, 3, "Failed to connect to MxFace API: " + e.getMessage());
        }
    }

    public void resetRetryAttempts(String userId) {
        retryAttemptsStore.remove(userId);
    }

    public void resetAllRetryAttempts() {
        retryAttemptsStore.clear();
    }
}
