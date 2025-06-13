-- Sample tenant data for multi-tenant testing
-- Insert this data into your tenants table for testing

INSERT INTO tenants (tenant_key, name, domain, primary_color, secondary_color, logo, active, created_at, updated_at) VALUES
('sawadeeai', 'SawadeeAI Hotel', 'sawadeeai.localhost', '#2B6CB0', '#3182CE', NULL, true, NOW(), NOW()),
('kapadokya', 'Kapadokya Hotel', 'kapadokya.localhost', '#DC2626', '#B91C1C', NULL, true, NOW(), NOW()),
('admin', 'Hotel Management Admin', 'admin.localhost', '#7C3AED', '#5B21B6', NULL, true, NOW(), NOW());

-- Update existing tenants table if it already has data
-- UPDATE tenants SET tenant_key = 'sawadeeai' WHERE name = 'SawadeeAI Hotel';
-- UPDATE tenants SET tenant_key = 'kapadokya' WHERE name = 'Kapadokya Hotel';
