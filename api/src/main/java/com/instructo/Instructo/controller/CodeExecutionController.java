package com.instructo.Instructo.controller;

import com.instructo.Instructo.model.CodeRequest;
import com.instructo.Instructo.service.CodeExecutionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/code")
public class CodeExecutionController {

    @Autowired
    private CodeExecutionService codeExecutionService;

    @PostMapping("/submit/{language}")
    public String submitCode(@PathVariable String language, @RequestBody CodeRequest codeRequest) {
        return codeExecutionService.submitCode(language, codeRequest);
    }
}

