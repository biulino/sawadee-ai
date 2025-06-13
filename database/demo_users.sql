-- Demo Users Setup for Authentication Testing
-- This script creates demo users for each role type

-- First, create demo users in your Keycloak instance
-- You can use these credentials to test the authentication system

/*
Demo User Accounts:

1. Customer User:
   Username: customer
   Password: customer123
   Email: customer@demo.com
   Role: client_customer

2. Hotel Owner:
   Username: hotelowner
   Password: hotel123
   Email: owner@demo.com
   Role: client_hotel_owner

3. Admin User:
   Username: admin
   Password: admin123
   Email: admin@demo.com
   Role: ADMIN

To create these users, you can either:
1. Use the Keycloak Admin Console (recommended)
2. Use the registration endpoint with appropriate userType
3. Use the KeycloakService.register() method programmatically

Example API calls to create demo users:

POST /api/auth/register
{
  "username": "customer",
  "email": "customer@demo.com",
  "password": "customer123",
  "firstName": "Demo",
  "lastName": "Customer",
  "userType": "CUSTOMER"
}

POST /api/auth/register
{
  "username": "hotelowner",
  "email": "owner@demo.com",
  "password": "hotel123",
  "firstName": "Hotel",
  "lastName": "Owner",
  "userType": "HOTEL_OWNER"
}

Note: Admin users typically need to be created directly in Keycloak
with the ADMIN realm role assigned.
*/
