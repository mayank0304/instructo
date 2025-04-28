package com.instructo.Instructo.service;

import java.util.Map;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

@Service
public class LangchainService {

    private final RestTemplate restTemplate;
    private final String BASE_URL = "http://localhost:5000";

    public LangchainService() {
        this.restTemplate = new RestTemplate();
    }

    // 1. Quiz Generation
    public String generateQuiz(String language) {
        String url = UriComponentsBuilder.fromHttpUrl(
            BASE_URL + "/quiz/generate"
        )
            .queryParam("language", language)
            .toUriString();

        ResponseEntity<String> response = restTemplate.getForEntity(
            url,
            String.class
        );
        return response.getBody();
    }

    // 2. Quiz Evaluation
    public String evaluateQuiz(Map<String, Object> requestBody) {
        String url = BASE_URL + "/quiz/evaluate";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(
            requestBody,
            headers
        );
        ResponseEntity<String> response = restTemplate.postForEntity(
            url,
            request,
            String.class
        );

        return response.getBody();
    }

    // 3. Code Review
    public String reviewCode(Map<String, Object> requestBody) {
        String url = BASE_URL + "/code/review";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(
            requestBody,
            headers
        );
        ResponseEntity<String> response = restTemplate.postForEntity(
            url,
            request,
            String.class
        );

        return response.getBody();
    }

    // 4. Code Chat
    public String chatWithCode(Map<String, Object> requestBody) {
        String url = BASE_URL + "/code/chat";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(
            requestBody,
            headers
        );
        ResponseEntity<String> response = restTemplate.postForEntity(
            url,
            request,
            String.class
        );

        return response.getBody();
    }

    // 5. Generate Incomplete Code Challenge
    public String generateIncompleteCode(Map<String, Object> requestBody) {
        String url = BASE_URL + "/challenge/incomplete-code";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(
            requestBody,
            headers
        );
        ResponseEntity<String> response = restTemplate.postForEntity(
            url,
            request,
            String.class
        );

        return response.getBody();
    }

    // 6. Generate Output-Based Challenge
    public String generateOutputChallenge(Map<String, Object> requestBody) {
        String url = BASE_URL + "/challenge/output-based";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(
            requestBody,
            headers
        );
        ResponseEntity<String> response = restTemplate.postForEntity(
            url,
            request,
            String.class
        );

        return response.getBody();
    }

    // 7. Generate Problem-Solving Challenge
    public String generateProblemSolvingChallenge(
        Map<String, Object> requestBody
    ) {
        String url = BASE_URL + "/challenge/problem-solving";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(
            requestBody,
            headers
        );
        ResponseEntity<String> response = restTemplate.postForEntity(
            url,
            request,
            String.class
        );

        return response.getBody();
    }

    // 8. Submit Challenge Solution
    public String submitSolution(Map<String, Object> requestBody) {
        String url = BASE_URL + "/challenge/submit-solution";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(
            requestBody,
            headers
        );
        ResponseEntity<String> response = restTemplate.postForEntity(
            url,
            request,
            String.class
        );

        return response.getBody();
    }
}
