package com.instructo.Instructo.service;

import com.instructo.Instructo.model.CodeRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.*;

@Service
public class CodeExecutionService {

    @Autowired
    private RestTemplate restTemplate;

    public String submitCode(String language, CodeRequest codeRequest) {
        String url = "http://localhost:8080/submit/" + language;

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<CodeRequest> request = new HttpEntity<>(codeRequest, headers);

        ResponseEntity<String> response = restTemplate.postForEntity(url, request, String.class);

        return response.getBody(); // Returning the body of the response
    }
}
