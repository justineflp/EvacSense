package com.evacsense.service;

import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class FaceRecognitionService {

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

    public FaceVerifyResult verifyFace(String userId, String photoBase64) {
        int attempts = retryAttemptsStore.getOrDefault(userId, 0);

        if (attempts >= 3) {
            return new FaceVerifyResult(
                    false,
                    0.0f,
                    0,
                    "Maximum biometric attempts exceeded. Account flagged for manual marshal verification."
            );
        }

        boolean isMockFailure = "MOCK_FAIL".equals(photoBase64) || (photoBase64 != null && photoBase64.contains("fail"));

        if (isMockFailure) {
            attempts += 1;
            retryAttemptsStore.put(userId, attempts);

            // Simulate low confidence mismatch (e.g. 40% - 82%)
            float confidence = (float) (40.0 + Math.random() * 42.0);
            confidence = Math.round(confidence * 100.0f) / 100.0f; // format to 2 decimal places

            return new FaceVerifyResult(
                    false,
                    confidence,
                    Math.max(0, 3 - attempts),
                    attempts >= 3
                            ? "Verification failed 3 times. Locked out."
                            : "Biometric mismatch (Confidence: " + confidence + "%). Please retry in a well-lit area."
            );
        }

        // Generate successful mock confidence score between 95.0% and 99.8%
        float confidence = (float) (95.0 + Math.random() * 4.8);
        confidence = Math.round(confidence * 100.0f) / 100.0f;

        // Reset attempts on successful verification
        retryAttemptsStore.remove(userId);

        return new FaceVerifyResult(
                true,
                confidence,
                3,
                "Biometric identity verified with " + confidence + "% confidence match."
        );
    }

    public void resetRetryAttempts(String userId) {
        retryAttemptsStore.remove(userId);
    }
}
