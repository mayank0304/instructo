package com.instructo.Instructo.service;

import com.instructo.Instructo.model.Language;
import com.instructo.Instructo.model.UserModel;
import com.instructo.Instructo.repository.UserRepository;
import org.bson.types.ObjectId;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    private static final Logger log = LoggerFactory.getLogger(UserService.class);

    private static final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @Autowired
    private UserRepository userRepository;

    public void saveUser(UserModel user) {
        userRepository.save(user);
    }

    public void updateUser(UserModel user) {
        userRepository.save(user); // assuming password is already hashed or updated
    }


    public boolean saveNewUser(UserModel user) {
        try {
            if (userRepository.findByusername(user.getUsername()) != null) {
                log.error("Username already exists: {}", user.getUsername());
                return false;
            }
            user.setPassword(passwordEncoder.encode(user.getPassword()));
            userRepository.save(user);
            return true;
        } catch (Exception e) {
            log.error("Error Occurred for: {}", user.getUsername(), e);
            return false;
        }
    }


    public void deleteByUsername(String username) {
        userRepository.deleteByUsername(username);
    }

    public UserModel findByUserName(String username) {
        return userRepository.findByusername(username);
    }


    public List<UserModel> getAll() {
        return userRepository.findAll();
    }

    public Optional<UserModel> getUserById(ObjectId id) {
        return userRepository.findById(id);
    }

    public void deleteById(ObjectId id) {
        userRepository.deleteById(id);
    }

    public boolean addLanguageToUser(String username, Language newLanguage) {
        UserModel user = userRepository.findByusername(username);
        if (user != null) {
            List<Language> languages = user.getLanguages();
            languages.add(newLanguage);
            user.setLanguages(languages);
            userRepository.save(user);
            return true;
        }
        return false;
    }

    public boolean removeLanguageFromUser(String username, String languageName) {
        UserModel user = userRepository.findByusername(username);
        if (user != null) {
            List<Language> languages = user.getLanguages();
            languages.removeIf(lang -> lang.getLanguage().equalsIgnoreCase(languageName));
            user.setLanguages(languages);
            userRepository.save(user);
            return true;
        }
        return false;
    }


}
