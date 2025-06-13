package com.canermastan.hotel.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import com.canermastan.hotel.dto.KeycloakUserDTO;
import com.canermastan.hotel.dto.LoginRequest;
import com.canermastan.hotel.dto.TokenResponse;
import com.canermastan.hotel.entity.User;
import com.canermastan.hotel.exception.AuthenticationException;
import com.canermastan.hotel.exception.ValidationException;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class KeycloakService {

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Value("${keycloak.auth-server-url:https://auth.canermastan.com}")
    private String keycloakServerUrl;

    @Value("${keycloak.realm:hotel-booking}")
    private String realm;

    @Value("${keycloak.admin-username}")
    private String adminUsername;

    @Value("${keycloak.admin-password}")
    private String adminPassword;    @Value("${keycloak.client-id}")
    private String clientId;

    @Value("${keycloak.client-secret}")
    private String clientSecret;

    public KeycloakService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
        this.objectMapper = new ObjectMapper();
    }

    public String getAdminAccessToken() {
        try {
            MultiValueMap<String, String> map = new LinkedMultiValueMap<>();
            map.add("client_id", "admin-cli");
            map.add("grant_type", "password");
            map.add("username", adminUsername);
            map.add("password", adminPassword);

            String tokenUrl = keycloakServerUrl + "/realms/master/protocol/openid-connect/token";
            System.out.println("Requesting admin token from: " + tokenUrl);
            System.out.println("Admin username: " + adminUsername);

            HttpHeaders headers = createHeaders();
            HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(map, headers);
            
            ResponseEntity<String> response = restTemplate.exchange(
                tokenUrl,
                HttpMethod.POST,
                request,
                String.class
            );

            String responseBody = response.getBody();
            System.out.println("Token response status: " + response.getStatusCode());
            
            String token = extractAccessTokenFromResponse(responseBody);
            System.out.println("Token obtained successfully: " + (token != null && !token.isEmpty()));
            
            return token;
        } catch (Exception e) {
            System.err.println("Error getting admin token: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    public String extractAccessTokenFromResponse(String response) {
        try {
            JsonNode jsonNode = objectMapper.readTree(response);
            return jsonNode.get("access_token").asText();
        } catch (Exception e) {
            System.err.println("Error extracting token: " + e.getMessage());
            e.printStackTrace();
            return null;
        }
    }

    private HttpHeaders createHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
        return headers;
    }

    /**
     * User entity'den KeycloakUserDTO'ya dönüştürme
     */
    private KeycloakUserDTO mapUserToKeycloakUserDTO(User user) {
        // Debug şifre bilgisini yazdır
        System.out.println("Password from User entity: " + (user.getPassword() != null ? "Not null" : "NULL"));
        
        KeycloakUserDTO dto = new KeycloakUserDTO(
            user.getUsername(),
            user.getEmail(),
            user.getFirstName(),
            user.getLastName(),
            user.getPassword()
        );
        
        return dto;
    }

    public String createUser(User user) {
        try {
            // Debug için şifre kontrolü
            if (user.getPassword() == null || user.getPassword().isEmpty()) {
                System.err.println("WARNING: User password is null or empty!");
            }
            
            String adminToken = getAdminAccessToken();
            if (adminToken == null || adminToken.isEmpty()) {
                throw new IllegalStateException("Failed to obtain valid admin token");
            }

            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "Bearer " + adminToken);
            headers.setContentType(MediaType.APPLICATION_JSON);

            // User entity'i Keycloak formatına dönüştür
            KeycloakUserDTO keycloakUser = mapUserToKeycloakUserDTO(user);

            // Debug için yazdır
            String userJson;
            try {
                userJson = objectMapper.writeValueAsString(keycloakUser);
                System.out.println("Creating user with data: " + userJson);
            } catch (JsonProcessingException e) {
                System.err.println("Error serializing user: " + e.getMessage());
            }

            HttpEntity<KeycloakUserDTO> entity = new HttpEntity<>(keycloakUser, headers);
            String url = keycloakServerUrl + "/admin/realms/" + realm + "/users";
            System.out.println("Sending request to: " + url);
            
            // Make the request and return the response
            ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);
            System.out.println("User creation successful with status: " + response.getStatusCode());
            
            // Kullanıcı ID'sini al
            // Keycloak POST yanıtında ID dönmediği için kullanıcıyı bulmamız gerekiyor
            String userId = getUserIdByUsername(user.getUsername(), adminToken);
            
            if (userId != null) {
                // Kullanıcıya "client_customer" rolünü ata
                assignClientCustomerRole(userId, adminToken);
            } else {
                System.err.println("Unable to find user ID for username: " + user.getUsername());
            }
            
            return response.getBody();
        } catch (Exception e) {
            System.err.println("Error creating user: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }
    
    /**
     * Username ile kullanıcı ID'sini bulur
     */
    private String getUserIdByUsername(String username, String adminToken) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "Bearer " + adminToken);
            
            String url = keycloakServerUrl + "/admin/realms/" + realm + "/users?username=" + username + "&exact=true";
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.GET, new HttpEntity<>(headers), String.class);
            
            if (response.getStatusCode().is2xxSuccessful()) {
                JsonNode users = objectMapper.readTree(response.getBody());
                if (users.isArray() && users.size() > 0) {
                    return users.get(0).get("id").asText();
                }
            }
            return null;
        } catch (Exception e) {
            System.err.println("Error getting user ID: " + e.getMessage());
            return null;
        }
    }
    
    /**
     * Keycloak client ID'sini client ismine göre bulur
     */
    private String getClientIdByClientId(String clientIdStr, String adminToken) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "Bearer " + adminToken);
            
            String url = keycloakServerUrl + "/admin/realms/" + realm + "/clients?clientId=" + clientIdStr;
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.GET, new HttpEntity<>(headers), String.class);
            
            if (response.getStatusCode().is2xxSuccessful()) {
                JsonNode clients = objectMapper.readTree(response.getBody());
                if (clients.isArray() && clients.size() > 0) {
                    return clients.get(0).get("id").asText();
                }
            }
            return null;
        } catch (Exception e) {
            System.err.println("Error getting client ID: " + e.getMessage());
            return null;
        }
    }
    
    /**
     * Kullanıcıya "client_customer" client rolünü atar
     */
    private void assignClientCustomerRole(String userId, String adminToken) {
        try {
            // Önce client'ın Keycloak tarafından atanmış ID'sini bul
            String actualClientId = getClientIdByClientId(clientId, adminToken);
            if (actualClientId == null) {
                System.err.println("Client not found: " + clientId);
                return;
            }
            
            System.out.println("Found client ID: " + actualClientId);
            
            // Sonra client role'ünü bul
            String roleName = "client_customer";
            String roleInfo = getClientRoleByName(actualClientId, roleName, adminToken);
            
            if (roleInfo == null) {
                System.err.println("Client role not found: " + roleName);
                return;
            }
            
            JsonNode roleNode;
            try {
                roleNode = objectMapper.readTree(roleInfo);
            } catch (Exception e) {
                System.err.println("Error parsing role info: " + e.getMessage());
                return;
            }
            
            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "Bearer " + adminToken);
            headers.setContentType(MediaType.APPLICATION_JSON);
            
            // Rol bilgilerini içeren array oluştur
            List<Map<String, String>> roles = new ArrayList<>();
            Map<String, String> role = new HashMap<>();
            role.put("id", roleNode.get("id").asText());
            role.put("name", roleNode.get("name").asText());
            roles.add(role);
            
            HttpEntity<List<Map<String, String>>> entity = new HttpEntity<>(roles, headers);
            String url = keycloakServerUrl + "/admin/realms/" + realm + "/users/" + userId + "/role-mappings/clients/" + actualClientId;
            
            System.out.println("Assigning client role to user: " + userId);
            System.out.println("Role assignment URL: " + url);
            
            ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);
            System.out.println("Role assignment response: " + response.getStatusCode());
        } catch (Exception e) {
            System.err.println("Error assigning client role: " + e.getMessage());
            e.printStackTrace();
        }
    }
    
    /**
     * Client rol adına göre rol bilgilerini getirir
     */
    private String getClientRoleByName(String clientId, String roleName, String adminToken) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "Bearer " + adminToken);
            
            String url = keycloakServerUrl + "/admin/realms/" + realm + "/clients/" + clientId + "/roles/" + roleName;
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.GET, new HttpEntity<>(headers), String.class);
            
            if (response.getStatusCode().is2xxSuccessful()) {
                return response.getBody();
            }
            return null;
        } catch (Exception e) {
            System.err.println("Error getting client role: " + e.getMessage());
            return null;
        }
    }

    /**
     * Kullanıcı girişi için token alır
     */
    public TokenResponse login(LoginRequest loginRequest) {
        if (loginRequest.getUsername() == null || loginRequest.getUsername().isEmpty()) {
            throw new ValidationException("Username is required");
        }
        
        if (loginRequest.getPassword() == null || loginRequest.getPassword().isEmpty()) {
            throw new ValidationException("Password is required");
        }
          try {
            MultiValueMap<String, String> formData = new LinkedMultiValueMap<>();
            formData.add("client_id", clientId);
            formData.add("client_secret", clientSecret);
            formData.add("username", loginRequest.getUsername());
            formData.add("password", loginRequest.getPassword());
            formData.add("grant_type", "password");
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
            
            HttpEntity<MultiValueMap<String, String>> entity = new HttpEntity<>(formData, headers);
            String tokenUrl = keycloakServerUrl + "/realms/" + realm + "/protocol/openid-connect/token";
            
            System.out.println("Sending login request to: " + tokenUrl);
            
            ResponseEntity<TokenResponse> response = restTemplate.postForEntity(
                tokenUrl,
                entity,
                TokenResponse.class
            );
            
            System.out.println("Login successful for user: " + loginRequest.getUsername());
            return response.getBody();
        } catch (HttpClientErrorException e) {
            throw new AuthenticationException("Invalid credentials", e);
        } catch (Exception e) {
            throw new AuthenticationException("Authentication failed: " + e.getMessage(), e);
        }
    }
    
    /**
     * Refresh token ile yeni token alır
     */
    public TokenResponse refreshToken(String refreshToken) {
        if (refreshToken == null || refreshToken.isEmpty()) {
            throw new ValidationException("Refresh token is required");
        }
        
        try {
            MultiValueMap<String, String> formData = new LinkedMultiValueMap<>();            formData.add("client_id", clientId);
            formData.add("client_secret", clientSecret);
            formData.add("grant_type", "refresh_token");
            formData.add("refresh_token", refreshToken);
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
            
            HttpEntity<MultiValueMap<String, String>> entity = new HttpEntity<>(formData, headers);
            String tokenUrl = keycloakServerUrl + "/realms/" + realm + "/protocol/openid-connect/token";
            
            ResponseEntity<TokenResponse> response = restTemplate.postForEntity(
                tokenUrl,
                entity,
                TokenResponse.class
            );
            
            return response.getBody();
        } catch (HttpClientErrorException e) {
            throw new AuthenticationException("Invalid refresh token", e);
        } catch (Exception e) {
            throw new AuthenticationException("Token refresh failed: " + e.getMessage(), e);
        }
    }
    
    /**
     * Logout yapar
     */
    public void logout(String refreshToken) {
        if (refreshToken == null || refreshToken.isEmpty()) {
            throw new ValidationException("Refresh token is required for logout");
        }
          try {
            MultiValueMap<String, String> formData = new LinkedMultiValueMap<>();
            formData.add("client_id", clientId);
            formData.add("client_secret", clientSecret);
            formData.add("refresh_token", refreshToken);
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
            
            HttpEntity<MultiValueMap<String, String>> entity = new HttpEntity<>(formData, headers);
            String logoutUrl = keycloakServerUrl + "/realms/" + realm + "/protocol/openid-connect/logout";
            
            restTemplate.postForEntity(logoutUrl, entity, String.class);
            
            System.out.println("Logout successful");
        } catch (Exception e) {
            throw new AuthenticationException("Logout failed: " + e.getMessage(), e);
        }
    }

    /**
     * Kullanıcıya "client_hotel_owner" client rolünü atar
     */
    private void assignClientHotelOwnerRole(String userId, String adminToken) {
        try {
            // Önce client'ın Keycloak tarafından atanmış ID'sini bul
            String actualClientId = getClientIdByClientId(clientId, adminToken);
            if (actualClientId == null) {
                System.err.println("Client not found: " + clientId);
                return;
            }
            
            System.out.println("Found client ID: " + actualClientId);
            
            // Sonra client role'ünü bul
            String roleName = "client_hotel_owner";
            String roleInfo = getClientRoleByName(actualClientId, roleName, adminToken);
            
            if (roleInfo == null) {
                System.err.println("Client role not found: " + roleName);
                return;
            }
            
            JsonNode roleNode;
            try {
                roleNode = objectMapper.readTree(roleInfo);
            } catch (Exception e) {
                System.err.println("Error parsing role info: " + e.getMessage());
                return;
            }
            
            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "Bearer " + adminToken);
            headers.setContentType(MediaType.APPLICATION_JSON);
            
            // Rol bilgilerini içeren array oluştur
            List<Map<String, String>> roles = new ArrayList<>();
            Map<String, String> role = new HashMap<>();
            role.put("id", roleNode.get("id").asText());
            role.put("name", roleNode.get("name").asText());
            roles.add(role);
            
            HttpEntity<List<Map<String, String>>> entity = new HttpEntity<>(roles, headers);
            String url = keycloakServerUrl + "/admin/realms/" + realm + "/users/" + userId + "/role-mappings/clients/" + actualClientId;
            
            System.out.println("Assigning client role to user: " + userId);
            System.out.println("Role assignment URL: " + url);
            
            ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);
            System.out.println("Role assignment response: " + response.getStatusCode());
        } catch (Exception e) {
            System.err.println("Error assigning client role: " + e.getMessage());
            e.printStackTrace();
        }
    }

    public String register(String username, String email, String password, String firstName, String lastName, String userType) {
        try {
            String adminToken = getAdminAccessToken();
            if (adminToken == null) {
                return "Admin token alınamadı";
            }

            // Kullanıcı oluşturma isteği
            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "Bearer " + adminToken);
            headers.setContentType(MediaType.APPLICATION_JSON);

            Map<String, Object> user = new HashMap<>();
            user.put("username", username);
            user.put("email", email);
            user.put("enabled", true);
            user.put("firstName", firstName);
            user.put("lastName", lastName);
            user.put("credentials", List.of(Map.of(
                "type", "password",
                "value", password,
                "temporary", false
            )));

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(user, headers);
            String url = keycloakServerUrl + "/admin/realms/" + realm + "/users";

            ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);
            System.out.println("User creation response: " + response.getStatusCode());

            if (response.getStatusCode().is2xxSuccessful()) {
                // Kullanıcı ID'sini al
                String userId = getUserIdByUsername(username, adminToken);
                if (userId != null) {
                    // Kullanıcı tipine göre rol atama
                    if ("HOTEL_OWNER".equals(userType)) {
                        assignClientHotelOwnerRole(userId, adminToken);
                    } else {
                        assignClientCustomerRole(userId, adminToken);
                    }
                    return "Kullanıcı başarıyla oluşturuldu ve rol atandı";
                }
            }
            return "Kullanıcı oluşturulamadı";
        } catch (Exception e) {
            e.printStackTrace();
            return "Hata: " + e.getMessage();
        }
    }
}