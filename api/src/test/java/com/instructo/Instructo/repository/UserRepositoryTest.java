package com.instructo.Instructo.repository;

import com.instructo.Instructo.model.UserModel;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
class UserRepositoryTest {

    @Autowired
    private UserRepository userRepository;

    private static final String TEST_USERNAME = "testuser";
    private static final String TEST_PASSWORD = "password123";

    @BeforeEach
    void setup() {
        // Clean up any existing test user
        userRepository.deleteByUsername(TEST_USERNAME);
    }

    @Test
    void testLoadByUsername_UserExists() {
        // Create and save a test user
        UserModel user = new UserModel();
        user.setUsername(TEST_USERNAME);
        user.setPassword(TEST_PASSWORD);
        userRepository.save(user);

        // Test loadByUsername
        UserModel foundUser = userRepository.findByusername(TEST_USERNAME);
        
        // Assertions
        assertNotNull(foundUser, "User should not be null");
        assertEquals(TEST_USERNAME, foundUser.getUsername(), "Username should match");
        assertEquals(TEST_PASSWORD, foundUser.getPassword(), "Password should match");
    }

    @Test
    void testLoadByUsername_UserNotFound() {
        // Test with non-existent username
        UserModel foundUser = userRepository.findByusername("nonexistentuser");
        assertNull(foundUser, "User should be null for non-existent username");
    }

    @Test
    void testLoadByUsername_CaseSensitivity() {
        // Create and save a test user
        UserModel user = new UserModel();
        user.setUsername(TEST_USERNAME);
        user.setPassword(TEST_PASSWORD);
        userRepository.save(user);

        // Test with different case
        UserModel foundUser = userRepository.findByusername(TEST_USERNAME.toUpperCase());
        assertNull(foundUser, "Username search should be case sensitive");
    }

    @AfterEach
    void cleanup() {
        // Clean up test user
        userRepository.deleteByUsername(TEST_USERNAME);
    }
}
