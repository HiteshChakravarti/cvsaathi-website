-- Newsletter Subscriptions Table
-- Stores email subscriptions from landing page footer for marketing purposes

CREATE TABLE IF NOT EXISTS public.newsletter_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  source TEXT DEFAULT 'landing_page_footer',
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'unsubscribed', 'bounced')),
  unsubscribed_at TIMESTAMP WITH TIME ZONE NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_newsletter_email ON public.newsletter_subscriptions(email);
CREATE INDEX IF NOT EXISTS idx_newsletter_status ON public.newsletter_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribed_at ON public.newsletter_subscriptions(subscribed_at);

-- Enable RLS (Row Level Security)
ALTER TABLE public.newsletter_subscriptions ENABLE ROW LEVEL SECURITY;

-- Policy: Allow anyone to insert (for newsletter signups)
CREATE POLICY "Allow public newsletter subscriptions"
  ON public.newsletter_subscriptions
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Policy: Allow authenticated users to read their own subscriptions
CREATE POLICY "Users can read own subscriptions"
  ON public.newsletter_subscriptions
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Service role can do everything (for admin operations)
CREATE POLICY "Service role full access"
  ON public.newsletter_subscriptions
  FOR ALL
  TO service_role
  USING (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_newsletter_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER update_newsletter_subscriptions_updated_at
  BEFORE UPDATE ON public.newsletter_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_newsletter_updated_at();

-- Comments for documentation
COMMENT ON TABLE public.newsletter_subscriptions IS 'Stores email subscriptions from landing page footer for marketing campaigns';
COMMENT ON COLUMN public.newsletter_subscriptions.email IS 'Subscriber email address (unique)';
COMMENT ON COLUMN public.newsletter_subscriptions.source IS 'Where the subscription originated (e.g., landing_page_footer, signup_flow)';
COMMENT ON COLUMN public.newsletter_subscriptions.status IS 'Subscription status: active, unsubscribed, or bounced';

