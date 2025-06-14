-- Create main application database
CREATE DATABASE IF NOT EXISTS sawadee_hotel;

-- Create Keycloak database
CREATE DATABASE IF NOT EXISTS keycloak;

-- Create test database for development
CREATE DATABASE IF NOT EXISTS sawadee_hotel_test;

-- Grant permissions (adjust as needed for your setup)
GRANT ALL PRIVILEGES ON DATABASE sawadee_hotel TO postgres;
GRANT ALL PRIVILEGES ON DATABASE keycloak TO postgres;
GRANT ALL PRIVILEGES ON DATABASE sawadee_hotel_test TO postgres;
