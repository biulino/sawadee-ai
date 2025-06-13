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

INSERT INTO tenants (tenant_key, name, domain, primary_color, secondary_color) VALUES
('default', 'Default Hotel', 'localhost', '#3B82F6', '#1E40AF'),
('cappadocia', 'Cappadocia Hotels', 'cappadocia.hotelsaas.com', '#8B5A3C', '#5D4037'),
('luxury', 'Luxury Suites', 'luxury.hotelsaas.com', '#8E24AA', '#6A1B9A'),
('boutique', 'Boutique Collection', 'boutique.hotelsaas.com', '#00ACC1', '#00838F')
ON CONFLICT (tenant_key) DO NOTHING;
