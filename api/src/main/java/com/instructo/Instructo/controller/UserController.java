package com.instructo.Instructo.controller;

import com.instructo.Instructo.model.Language;
import com.instructo.Instructo.model.LanguageRequest;
import com.instructo.Instructo.model.UserModel;
import com.instructo.Instructo.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/user")
public class UserController {

    @Autowired
    private UserService userService;

    @PutMapping("/update")
    public ResponseEntity<?> updateUser(@RequestBody UserModel updatedUser) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String loggedInUsername = authentication.getName();

        UserModel existingUser = userService.findByUserName(loggedInUsername);
        if (existingUser == null) {
            return new ResponseEntity<>("User not found", HttpStatus.NOT_FOUND);
        }

        // Update the fields you allow to change
        existingUser.setUsername(updatedUser.getUsername());
        existingUser.setPassword(updatedUser.getPassword());

        userService.saveNewUser(existingUser);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @PostMapping("/addLanguage")
    public ResponseEntity<?> addLanguage(@RequestBody LanguageRequest languageRequest) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String loggedInUsername = authentication.getName();

        Language newLanguage = new Language(languageRequest.getLanguage(), languageRequest.getLevel());
        boolean added = userService.addLanguageToUser(loggedInUsername, newLanguage);

        if (added) {
            return ResponseEntity.ok("Language added successfully");
        } else {
            return new ResponseEntity<>("Failed to add language", HttpStatus.BAD_REQUEST);
        }
    }


    @DeleteMapping("/delete")
    public ResponseEntity<?> deleteUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String loggedInUsername = authentication.getName();

        userService.deleteByUsername(loggedInUsername);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}
