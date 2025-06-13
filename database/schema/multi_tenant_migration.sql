-- Add tenants table
CREATE TABLE IF NOT EXISTS tenants (
    id SERIAL PRIMARY KEY,
    tenant_key VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    domain VARCHAR(255),
    logo VARCHAR(500),
    primary_color VARCHAR(7),
    secondary_color VARCHAR(7),
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add tenant_id columns to existing tables
ALTER TABLE hotels ADD COLUMN IF NOT EXISTS tenant_id BIGINT;
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS tenant_id BIGINT;
ALTER TABLE reservations ADD COLUMN IF NOT EXISTS tenant_id BIGINT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS tenant_id BIGINT;
ALTER TABLE checkin_records ADD COLUMN IF NOT EXISTS tenant_id BIGINT;

-- Add foreign key constraints
ALTER TABLE hotels ADD CONSTRAINT fk_hotels_tenant 
    FOREIGN KEY (tenant_id) REFERENCES tenants(id);
    
ALTER TABLE rooms ADD CONSTRAINT fk_rooms_tenant 
    FOREIGN KEY (tenant_id) REFERENCES tenants(id);
    
ALTER TABLE reservations ADD CONSTRAINT fk_reservations_tenant 
    FOREIGN KEY (tenant_id) REFERENCES tenants(id);
    
ALTER TABLE users ADD CONSTRAINT fk_users_tenant 
    FOREIGN KEY (tenant_id) REFERENCES tenants(id);
    
ALTER TABLE checkin_records ADD CONSTRAINT fk_checkin_records_tenant 
    FOREIGN KEY (tenant_id) REFERENCES tenants(id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_hotels_tenant_id ON hotels(tenant_id);
CREATE INDEX IF NOT EXISTS idx_rooms_tenant_id ON rooms(tenant_id);
CREATE INDEX IF NOT EXISTS idx_reservations_tenant_id ON reservations(tenant_id);
CREATE INDEX IF NOT EXISTS idx_users_tenant_id ON users(tenant_id);
CREATE INDEX IF NOT EXISTS idx_checkin_records_tenant_id ON checkin_records(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenants_tenant_key ON tenants(tenant_key);
CREATE INDEX IF NOT EXISTS idx_tenants_domain ON tenants(domain);

-- Insert default tenant for existing data
INSERT INTO tenants (tenant_key, name, domain, primary_color, secondary_color) 
VALUES ('default', 'Default Hotel', 'localhost', '#3B82F6', '#1E40AF')
ON CONFLICT (tenant_key) DO NOTHING;

-- Update existing records to use default tenant
UPDATE hotels SET tenant_id = (SELECT id FROM tenants WHERE tenant_key = 'default') WHERE tenant_id IS NULL;
UPDATE rooms SET tenant_id = (SELECT id FROM tenants WHERE tenant_key = 'default') WHERE tenant_id IS NULL;
UPDATE reservations SET tenant_id = (SELECT id FROM tenants WHERE tenant_key = 'default') WHERE tenant_id IS NULL;
UPDATE users SET tenant_id = (SELECT id FROM tenants WHERE tenant_key = 'default') WHERE tenant_id IS NULL;
UPDATE checkin_records SET tenant_id = (SELECT id FROM tenants WHERE tenant_key = 'default') WHERE tenant_id IS NULL;

-- Make tenant_id NOT NULL for required tables
ALTER TABLE hotels ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE rooms ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE reservations ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE checkin_records ALTER COLUMN tenant_id SET NOT NULL;

-- Add sample SaaS tenants
INSERT INTO tenants (tenant_key, name, domain, primary_color, secondary_color) VALUES
('cappadocia', 'Cappadocia Hotels', 'cappadocia.hotelsaas.com', '#8B5A3C', '#5D4037'),
('luxury', 'Luxury Suites', 'luxury.hotelsaas.com', '#8E24AA', '#6A1B9A'),
('boutique', 'Boutique Collection', 'boutique.hotelsaas.com', '#00ACC1', '#00838F')
ON CONFLICT (tenant_key) DO NOTHING;
