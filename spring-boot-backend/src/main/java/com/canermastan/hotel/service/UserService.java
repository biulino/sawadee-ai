package com.canermastan.hotel.service;

import com.canermastan.hotel.entity.User;
import com.canermastan.hotel.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class UserService {
    
    private static final Logger logger = LoggerFactory.getLogger(UserService.class);
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private UserPreferencesService userPreferencesService;
    
    public User createUser(User user) {
        logger.info("Creating new user: {}", user.getUsername());
        validateUser(user);
        User savedUser = userRepository.save(user);
        
        // Create default preferences for the new user
        userPreferencesService.createDefaultPreferences(savedUser);
        
        return savedUser;
    }
    
    public User createUser(String externalId, String username, String email, String firstName, String lastName) {
        User user = new User();
        user.setExternalId(externalId);
        user.setUsername(username);
        user.setEmail(email);
        user.setFirstName(firstName);
        user.setLastName(lastName);
        return createUser(user);
    }
    
    public Optional<User> getUserById(Long id) {
        return userRepository.findById(id);
    }
    
    public Optional<User> getUserByUsername(String username) {
        return userRepository.findByUsername(username);
    }
    
    public Optional<User> getUserByEmail(String email) {
        return userRepository.findByEmail(email);
    }
    
    public Optional<User> getUserByExternalId(String externalId) {
        return userRepository.findByExternalId(externalId);
    }
    
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }
    
    public User updateUser(Long userId, String username, String email, String firstName, String lastName) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            user.setUsername(username);
            user.setEmail(email);
            user.setFirstName(firstName);
            user.setLastName(lastName);
            
            validateUser(user);
            logger.info("Updated user: {}", userId);
            return userRepository.save(user);
        }
        throw new RuntimeException("User not found with id: " + userId);
    }
    
    public User updateUserProfile(Long userId, String firstName, String lastName, String email) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            user.setFirstName(firstName);
            user.setLastName(lastName);
            user.setEmail(email);
            
            validateUser(user);
            logger.info("Updated user profile: {}", userId);
            return userRepository.save(user);
        }
        throw new RuntimeException("User not found with id: " + userId);
    }
    
    public void deleteUser(Long userId) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isPresent()) {
            userRepository.deleteById(userId);
            logger.info("Deleted user: {}", userId);
        } else {
            throw new RuntimeException("User not found with id: " + userId);
        }
    }
    
    public boolean existsByUsername(String username) {
        return userRepository.existsByUsername(username);
    }
    
    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }
    
    public boolean existsByExternalId(String externalId) {
        return userRepository.existsByExternalId(externalId);
    }
    
    public List<User> searchUsersByName(String name) {
        return userRepository.findByNameContaining(name);
    }
    
    public List<User> getUsersByFirstName(String firstName) {
        return userRepository.findByFirstNameContainingIgnoreCase(firstName);
    }
    
    public List<User> getUsersByLastName(String lastName) {
        return userRepository.findByLastNameContainingIgnoreCase(lastName);
    }
    
    public List<User> getUsersRegisteredSince(LocalDateTime date) {
        return userRepository.findByCreatedAtAfter(date);
    }
    
    public List<User> getUsersRegisteredInPeriod(LocalDateTime startDate, LocalDateTime endDate) {
        return userRepository.findByCreatedAtBetween(startDate, endDate);
    }
    
    public Long countUsersRegisteredSince(LocalDateTime date) {
        return userRepository.countUsersRegisteredSince(date);
    }
    
    public List<User> getUsersWithEmail() {
        return userRepository.findUsersWithEmail();
    }
    
    public List<User> getUsersWithoutEmail() {
        return userRepository.findUsersWithoutEmail();
    }
    
    public User getOrCreateUserByExternalId(String externalId, String username, String email, 
                                          String firstName, String lastName) {
        Optional<User> existingUser = getUserByExternalId(externalId);
        if (existingUser.isPresent()) {
            return existingUser.get();
        } else {
            return createUser(externalId, username, email, firstName, lastName);
        }
    }
    
    private void validateUser(User user) {
        if (user.getUsername() == null || user.getUsername().trim().isEmpty()) {
            throw new IllegalArgumentException("Username is required");
        }
        
        if (user.getExternalId() == null || user.getExternalId().trim().isEmpty()) {
            throw new IllegalArgumentException("External ID is required");
        }
        
        if (user.getUsername().length() < 3) {
            throw new IllegalArgumentException("Username must be at least 3 characters long");
        }
        
        if (user.getUsername().length() > 50) {
            throw new IllegalArgumentException("Username must be 50 characters or less");
        }
        
        if (user.getEmail() != null && !user.getEmail().isEmpty()) {
            if (!user.getEmail().matches("^[A-Za-z0-9+_.-]+@([A-Za-z0-9.-]+\\.[A-Za-z]{2,})$")) {
                throw new IllegalArgumentException("Invalid email format");
            }
        }
        
        // Check for duplicate username (excluding current user)
        Optional<User> existingUser = getUserByUsername(user.getUsername());
        if (existingUser.isPresent() && !existingUser.get().getId().equals(user.getId())) {
            throw new IllegalArgumentException("Username already exists: " + user.getUsername());
        }
        
        // Check for duplicate email (excluding current user)
        if (user.getEmail() != null && !user.getEmail().isEmpty()) {
            Optional<User> existingEmailUser = getUserByEmail(user.getEmail());
            if (existingEmailUser.isPresent() && !existingEmailUser.get().getId().equals(user.getId())) {
                throw new IllegalArgumentException("Email already exists: " + user.getEmail());
            }
        }
        
        // Check for duplicate external ID (excluding current user)
        Optional<User> existingExternalUser = getUserByExternalId(user.getExternalId());
        if (existingExternalUser.isPresent() && !existingExternalUser.get().getId().equals(user.getId())) {
            throw new IllegalArgumentException("External ID already exists: " + user.getExternalId());
        }
    }
}
