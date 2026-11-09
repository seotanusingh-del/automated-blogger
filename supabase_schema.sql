-- SQL to create the necessary tables for Automated-Blogger workflow integration

-- 1. Table for tracking user blog requests (Trigger for n8n)
CREATE TABLE IF NOT EXISTS requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_name TEXT,
    company_email TEXT,
    company_website TEXT,
    blog_type TEXT DEFAULT 'airlines',
    keyword TEXT,
    topic TEXT,
    tfn TEXT,
    tfn_number TEXT,
    airline_name TEXT,
    city TEXT,
    country TEXT,
    status TEXT DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'error'
    payload JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Aliases for requests table as requested by the user
CREATE OR REPLACE VIEW "User blog request" AS SELECT * FROM requests;
CREATE OR REPLACE VIEW user_blog_requests AS SELECT * FROM requests;
CREATE OR REPLACE VIEW request AS SELECT * FROM requests;

-- 2. Table for storing generated blog posts (Output from n8n)
CREATE TABLE IF NOT EXISTS blogs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id TEXT, -- Corresponds to requests.id
    title TEXT,
    content TEXT, -- HTML content
    content_html TEXT, -- Alias for content
    banner_url TEXT,
    image_url TEXT, -- Alias for banner_url
    airline_name TEXT,
    city TEXT,
    keyword TEXT,
    status TEXT DEFAULT 'draft',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Realtime for blogs table to notify the UI
ALTER PUBLICATION supabase_realtime ADD TABLE blogs;
ALTER PUBLICATION supabase_realtime ADD TABLE requests;
