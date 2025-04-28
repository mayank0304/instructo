package com.instructo.Instructo.controller;

import com.instructo.Instructo.service.LangchainService;
import java.util.Map;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/langchain")
public class LangchainController {

    private final LangchainService langchainService;

    @Autowired
    public LangchainController(LangchainService langchainService) {
        this.langchainService = langchainService;
    }

    // 1. Quiz Generation - GET
    @GetMapping("/quiz/generate")
    public String generateQuiz(@RequestParam String language) {
        return langchainService.generateQuiz(language);
    }

    // 2. Quiz Evaluation - POST
    @PostMapping("/quiz/evaluate")
    public String evaluateQuiz(@RequestBody Map<String, Object> requestBody) {
        return langchainService.evaluateQuiz(requestBody);
    }

    // 3. Code Review - POST
    @PostMapping("/code/review")
    public String reviewCode(@RequestBody Map<String, Object> requestBody) {
        return langchainService.reviewCode(requestBody);
    }

    // 4. Code Chat - POST
    @PostMapping("/code/chat")
    public String chatWithCode(@RequestBody Map<String, Object> requestBody) {
        return langchainService.chatWithCode(requestBody);
    }

    // 5. Generate Incomplete Code Challenge - POST
    @PostMapping("/challenge/incomplete-code")
    public String generateIncompleteCode(
        @RequestBody Map<String, Object> requestBody
    ) {
        return langchainService.generateIncompleteCode(requestBody);
    }

    // 6. Generate Output-Based Challenge - POST
    @PostMapping("/challenge/output-based")
    public String generateOutputChallenge(
        @RequestBody Map<String, Object> requestBody
    ) {
        return langchainService.generateOutputChallenge(requestBody);
    }

    // 7. Generate Problem-Solving Challenge - POST
    @PostMapping("/challenge/problem-solving")
    public String generateProblemSolvingChallenge(
        @RequestBody Map<String, Object> requestBody
    ) {
        return langchainService.generateProblemSolvingChallenge(requestBody);
    }

    // 8. Submit Challenge Solution - POST
    @PostMapping("/challenge/submit-solution")
    public String submitSolution(@RequestBody Map<String, Object> requestBody) {
        return langchainService.submitSolution(requestBody);
    }
}
