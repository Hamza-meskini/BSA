-- Drop existing table and related objects if they exist
DROP TRIGGER IF EXISTS cleanup_expired_cache_trigger ON analytics_cache;
DROP FUNCTION IF EXISTS cleanup_expired_cache();
DROP TABLE IF EXISTS analytics_cache;

-- Create analytics_cache table
CREATE TABLE analytics_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand TEXT NOT NULL,
    period TEXT NOT NULL,
    result JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '24 hours'),
    UNIQUE(brand, period)
);

-- Create indexes for faster lookups
CREATE INDEX idx_analytics_cache_brand_period ON analytics_cache(brand, period);
CREATE INDEX idx_analytics_cache_expires_at ON analytics_cache(expires_at);

-- Add RLS policies
ALTER TABLE analytics_cache ENABLE ROW LEVEL SECURITY;

-- Allow read access to authenticated users
CREATE POLICY "Allow read access to authenticated users" ON analytics_cache
    FOR SELECT
    TO authenticated
    USING (true);

-- Allow insert/update access to authenticated users
CREATE POLICY "Allow insert/update access to authenticated users" ON analytics_cache
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Create a function to clean up expired cache entries
CREATE OR REPLACE FUNCTION cleanup_expired_cache()
RETURNS trigger AS $$
BEGIN
    -- Delete expired entries
    DELETE FROM analytics_cache WHERE expires_at < NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to automatically clean up expired entries
CREATE TRIGGER cleanup_expired_cache_trigger
    AFTER INSERT OR UPDATE ON analytics_cache
    EXECUTE FUNCTION cleanup_expired_cache();

-- Create a function to automatically update expires_at on insert/update
CREATE OR REPLACE FUNCTION update_expires_at()
RETURNS trigger AS $$
BEGIN
    NEW.expires_at = NOW() + INTERVAL '24 hours';
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to automatically update expires_at
CREATE TRIGGER update_expires_at_trigger
    BEFORE INSERT OR UPDATE ON analytics_cache
    FOR EACH ROW
    EXECUTE FUNCTION update_expires_at();

-- Create a function to get cached results with automatic expiration check
CREATE OR REPLACE FUNCTION get_cached_result(p_brand TEXT, p_period TEXT)
RETURNS JSONB AS $$
DECLARE
    v_result JSONB;
BEGIN
    -- First clean up expired entries
    DELETE FROM analytics_cache WHERE expires_at < NOW();
    
    -- Then get the result
    SELECT result INTO v_result
    FROM analytics_cache
    WHERE brand = p_brand
    AND period = p_period
    AND expires_at > NOW();
    
    RETURN v_result;
END;
$$ LANGUAGE plpgsql; 