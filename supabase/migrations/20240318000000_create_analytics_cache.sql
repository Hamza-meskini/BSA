-- Create analytics_cache table
CREATE TABLE IF NOT EXISTS analytics_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand TEXT NOT NULL,
    period TEXT NOT NULL,
    result JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(brand, period)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_analytics_cache_brand_period ON analytics_cache(brand, period);

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