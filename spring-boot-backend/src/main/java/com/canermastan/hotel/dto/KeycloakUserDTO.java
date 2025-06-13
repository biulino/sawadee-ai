package com.canermastan.hotel.dto;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.fasterxml.jackson.annotation.JsonIgnore;

/**
 * DTO that represents a Keycloak user according to the Keycloak Admin REST API
 */
public class KeycloakUserDTO {
    private String id;
    private String username;
    private String firstName;
    private String lastName;
    private String email;
    private boolean enabled = true;
    private boolean emailVerified = true;
    private List<Map<String, Object>> credentials = new ArrayList<>();
    private Map<String, List<String>> attributes = new HashMap<>();
    
    @JsonIgnore
    private String password; // Temporarily store password for credential creation
    
    public KeycloakUserDTO() {
    }
    
    public KeycloakUserDTO(String username, String email, String firstName, String lastName, String password) {
        this.username = username;
        this.email = email;
        this.firstName = firstName;
        this.lastName = lastName;
        this.password = password;
        
        if (password != null && !password.isEmpty()) {
            // Set password credential
            Map<String, Object> credential = new HashMap<>();
            credential.put("type", "password");
            credential.put("value", password);
            credential.put("temporary", false);
            this.credentials.add(credential);
            
            System.out.println("Added credential with password: " + password);
        } else {
            System.out.println("WARNING: Empty password provided to KeycloakUserDTO");
        }
    }
    
    // Getters and setters
    public String getId() {
        return id;
    }
    
    public void setId(String id) {
        this.id = id;
    }
    
    public String getUsername() {
        return username;
    }
    
    public void setUsername(String username) {
        this.username = username;
    }
    
    public String getFirstName() {
        return firstName;
    }
    
    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }
    
    public String getLastName() {
        return lastName;
    }
    
    public void setLastName(String lastName) {
        this.lastName = lastName;
    }
    
    public String getEmail() {
        return email;
    }
    
    public void setEmail(String email) {
        this.email = email;
    }
    
    public boolean isEnabled() {
        return enabled;
    }
    
    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }
    
    public boolean isEmailVerified() {
        return emailVerified;
    }
    
    public void setEmailVerified(boolean emailVerified) {
        this.emailVerified = emailVerified;
    }
    
    public List<Map<String, Object>> getCredentials() {
        return credentials;
    }
    
    public void setCredentials(List<Map<String, Object>> credentials) {
        this.credentials = credentials;
    }
    
    public Map<String, List<String>> getAttributes() {
        return attributes;
    }
    
    public void setAttributes(Map<String, List<String>> attributes) {
        this.attributes = attributes;
    }
    
    public void addAttribute(String key, String value) {
        List<String> values = attributes.getOrDefault(key, new ArrayList<>());
        values.add(value);
        attributes.put(key, values);
    }
    
    // Add password getter/setter
    @JsonIgnore
    public String getPassword() {
        return password;
    }
    
    @JsonIgnore
    public void setPassword(String password) {
        this.password = password;
        
        // Also update credentials if password changes
        if (password != null && !password.isEmpty()) {
            boolean hasPasswordCredential = false;
            
            // Check if password credential already exists
            for (Map<String, Object> cred : credentials) {
                if ("password".equals(cred.get("type"))) {
                    cred.put("value", password);
                    hasPasswordCredential = true;
                    break;
                }
            }
            
            // If no password credential exists, create one
            if (!hasPasswordCredential) {
                Map<String, Object> credential = new HashMap<>();
                credential.put("type", "password");
                credential.put("value", password);
                credential.put("temporary", false);
                this.credentials.add(credential);
            }
        }
    }
} 