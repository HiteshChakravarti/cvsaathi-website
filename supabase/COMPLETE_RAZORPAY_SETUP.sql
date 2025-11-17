-- =========================================================================
-- COMPLETE RAZORPAY INTEGRATION SETUP
-- Copy and paste this entire SQL into Supabase SQL Editor
-- =========================================================================

-- Create the timestamp trigger function first (if it doesn't exist)
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =========================================================================
-- PAYMENT TABLES
-- =========================================================================

-- Create payment_orders table for tracking Razorpay orders
CREATE TABLE IF NOT EXISTS public.payment_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id TEXT NOT NULL UNIQUE, -- Razorpay order ID
  user_id UUID REFERENCES auth.users,
  amount INTEGER NOT NULL, -- Amount in paise
  currency TEXT DEFAULT 'INR',
  receipt TEXT,
  status TEXT NOT NULL DEFAULT 'created' CHECK (status IN ('created', 'attempted', 'paid', 'cancelled')),
  payment_id TEXT, -- Razorpay payment ID (after successful payment)
  verified_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create payment_verifications table for tracking signature verifications
CREATE TABLE IF NOT EXISTS public.payment_verifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  payment_id TEXT NOT NULL,
  order_id TEXT NOT NULL,
  signature TEXT NOT NULL,
  verified BOOLEAN NOT NULL,
  verified_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create user_subscriptions table (enhanced version of subscriptions)
CREATE TABLE IF NOT EXISTS public.user_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  plan_id TEXT NOT NULL, -- Will reference pricing_plans(plan_id) if it exists
  plan_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired', 'trial')),
  billing_cycle TEXT NOT NULL DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'yearly')),
  current_period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  trial_start TIMESTAMP WITH TIME ZONE,
  trial_end TIMESTAMP WITH TIME ZONE,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  external_subscription_id TEXT, -- Razorpay subscription ID or payment ID
  payment_method TEXT,
  auto_renew BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create payments table for tracking individual payments
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  subscription_id UUID REFERENCES public.user_subscriptions,
  payment_id TEXT NOT NULL UNIQUE, -- Razorpay payment ID
  order_id TEXT NOT NULL REFERENCES public.payment_orders(order_id),
  amount INTEGER NOT NULL, -- Amount in paise
  currency TEXT DEFAULT 'INR',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  payment_method TEXT,
  description TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- =========================================================================
-- ROW LEVEL SECURITY (RLS)
-- =========================================================================

-- Enable RLS on new tables
ALTER TABLE public.payment_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for payment_orders
DROP POLICY IF EXISTS "Users can view their own payment orders" ON public.payment_orders;
CREATE POLICY "Users can view their own payment orders" 
  ON public.payment_orders 
  FOR SELECT 
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role can manage payment orders" ON public.payment_orders;
CREATE POLICY "Service role can manage payment orders" 
  ON public.payment_orders 
  FOR ALL 
  USING (auth.jwt()->>'role' = 'service_role');

-- RLS Policies for payment_verifications
DROP POLICY IF EXISTS "Service role can manage payment verifications" ON public.payment_verifications;
CREATE POLICY "Service role can manage payment verifications" 
  ON public.payment_verifications 
  FOR ALL 
  USING (auth.jwt()->>'role' = 'service_role');

-- RLS Policies for user_subscriptions
DROP POLICY IF EXISTS "Users can view their own subscriptions" ON public.user_subscriptions;
CREATE POLICY "Users can view their own subscriptions" 
  ON public.user_subscriptions 
  FOR SELECT 
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role can manage subscriptions" ON public.user_subscriptions;
CREATE POLICY "Service role can manage subscriptions" 
  ON public.user_subscriptions 
  FOR ALL 
  USING (auth.jwt()->>'role' = 'service_role');

-- RLS Policies for payments
DROP POLICY IF EXISTS "Users can view their own payments" ON public.payments;
CREATE POLICY "Users can view their own payments" 
  ON public.payments 
  FOR SELECT 
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role can manage payments" ON public.payments;
CREATE POLICY "Service role can manage payments" 
  ON public.payments 
  FOR ALL 
  USING (auth.jwt()->>'role' = 'service_role');

-- =========================================================================
-- INDEXES FOR PERFORMANCE
-- =========================================================================

CREATE INDEX IF NOT EXISTS idx_payment_orders_user_id ON public.payment_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_orders_order_id ON public.payment_orders(order_id);
CREATE INDEX IF NOT EXISTS idx_payment_verifications_payment_id ON public.payment_verifications(payment_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON public.user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON public.user_subscriptions(status, current_period_end);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON public.payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON public.payments(order_id);

-- =========================================================================
-- DATABASE FUNCTIONS
-- =========================================================================

-- Function to activate subscription after successful payment
CREATE OR REPLACE FUNCTION activate_user_subscription(
  p_user_id UUID,
  p_plan_id TEXT,
  p_plan_name TEXT,
  p_payment_id TEXT,
  p_order_id TEXT,
  p_amount INTEGER,
  p_billing_cycle TEXT DEFAULT 'monthly',
  p_start_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  p_end_date TIMESTAMP WITH TIME ZONE DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  subscription_id UUID;
  calculated_end_date TIMESTAMP WITH TIME ZONE;
  result JSONB;
BEGIN
  -- Calculate end date if not provided
  IF p_end_date IS NULL THEN
    IF p_billing_cycle = 'yearly' THEN
      calculated_end_date := p_start_date + INTERVAL '1 year';
    ELSE
      calculated_end_date := p_start_date + INTERVAL '1 month';
    END IF;
  ELSE
    calculated_end_date := p_end_date;
  END IF;

  -- Cancel any existing active subscriptions for this user
  UPDATE public.user_subscriptions 
  SET status = 'cancelled', cancelled_at = now(), updated_at = now()
  WHERE user_id = p_user_id AND status = 'active';

  -- Create new subscription
  INSERT INTO public.user_subscriptions (
    user_id,
    plan_id,
    plan_name,
    status,
    billing_cycle,
    current_period_start,
    current_period_end,
    external_subscription_id,
    metadata
  ) VALUES (
    p_user_id,
    p_plan_id,
    p_plan_name,
    'active',
    p_billing_cycle,
    p_start_date,
    calculated_end_date,
    p_payment_id,
    jsonb_build_object(
      'activated_via', 'razorpay_payment',
      'order_id', p_order_id,
      'payment_id', p_payment_id
    )
  ) RETURNING id INTO subscription_id;

  -- Record the payment
  INSERT INTO public.payments (
    user_id,
    subscription_id,
    payment_id,
    order_id,
    amount,
    status,
    description,
    metadata
  ) VALUES (
    p_user_id,
    subscription_id,
    p_payment_id,
    p_order_id,
    p_amount,
    'completed',
    CONCAT(p_plan_name, ' subscription (', p_billing_cycle, ')'),
    jsonb_build_object(
      'plan_id', p_plan_id,
      'billing_cycle', p_billing_cycle,
      'activated_at', p_start_date
    )
  );

  -- Update legacy subscriptions table for compatibility (if it exists)
  BEGIN
    INSERT INTO public.subscriptions (
      user_id,
      plan_name,
      status,
      billing_cycle,
      external_subscription_id,
      created_at,
      updated_at
    ) VALUES (
      p_user_id,
      p_plan_id,
      'active',
      p_billing_cycle,
      p_payment_id,
      p_start_date,
      now()
    )
    ON CONFLICT (user_id) DO UPDATE SET
      plan_name = EXCLUDED.plan_name,
      status = EXCLUDED.status,
      billing_cycle = EXCLUDED.billing_cycle,
      external_subscription_id = EXCLUDED.external_subscription_id,
      updated_at = now();
  EXCEPTION
    WHEN undefined_table THEN
      -- Subscriptions table doesn't exist, skip this step
      NULL;
  END;

  -- Build result
  result := jsonb_build_object(
    'subscription_id', subscription_id,
    'user_id', p_user_id,
    'plan_id', p_plan_id,
    'plan_name', p_plan_name,
    'status', 'active',
    'billing_cycle', p_billing_cycle,
    'start_date', p_start_date,
    'end_date', calculated_end_date,
    'payment_id', p_payment_id,
    'order_id', p_order_id
  );

  RETURN result;
END;
$$;

-- Function to get user's current subscription
CREATE OR REPLACE FUNCTION get_user_subscription(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  subscription_data JSONB;
BEGIN
  SELECT jsonb_build_object(
    'id', id,
    'plan_id', plan_id,
    'plan_name', plan_name,
    'status', status,
    'billing_cycle', billing_cycle,
    'current_period_start', current_period_start,
    'current_period_end', current_period_end,
    'trial_start', trial_start,
    'trial_end', trial_end,
    'auto_renew', auto_renew,
    'is_trial', CASE 
      WHEN trial_end IS NOT NULL AND trial_end > now() THEN true 
      ELSE false 
    END,
    'is_expired', CASE 
      WHEN current_period_end < now() THEN true 
      ELSE false 
    END
  ) INTO subscription_data
  FROM public.user_subscriptions
  WHERE user_id = p_user_id 
    AND status IN ('active', 'trial')
  ORDER BY created_at DESC
  LIMIT 1;

  -- Return default free plan if no subscription found
  IF subscription_data IS NULL THEN
    subscription_data := jsonb_build_object(
      'plan_id', 'free',
      'plan_name', 'Free',
      'status', 'active',
      'billing_cycle', 'monthly',
      'is_trial', false,
      'is_expired', false
    );
  END IF;

  RETURN subscription_data;
END;
$$;

-- Function to check if user has active subscription
CREATE OR REPLACE FUNCTION has_active_subscription(
  p_user_id UUID,
  p_plan_id TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  subscription_count INTEGER;
BEGIN
  IF p_plan_id IS NULL THEN
    -- Check for any active subscription
    SELECT COUNT(*)
    INTO subscription_count
    FROM public.user_subscriptions
    WHERE user_id = p_user_id
      AND status = 'active'
      AND current_period_end > now();
  ELSE
    -- Check for specific plan
    SELECT COUNT(*)
    INTO subscription_count
    FROM public.user_subscriptions
    WHERE user_id = p_user_id
      AND plan_id = p_plan_id
      AND status = 'active'
      AND current_period_end > now();
  END IF;

  RETURN subscription_count > 0;
END;
$$;

-- =========================================================================
-- TRIGGERS
-- =========================================================================

-- Add updated_at triggers (drop first if they exist)
DROP TRIGGER IF EXISTS set_timestamp_payment_orders ON public.payment_orders;
CREATE TRIGGER set_timestamp_payment_orders
    BEFORE UPDATE ON public.payment_orders
    FOR EACH ROW
    EXECUTE PROCEDURE trigger_set_timestamp();

DROP TRIGGER IF EXISTS set_timestamp_user_subscriptions ON public.user_subscriptions;
CREATE TRIGGER set_timestamp_user_subscriptions
    BEFORE UPDATE ON public.user_subscriptions
    FOR EACH ROW
    EXECUTE PROCEDURE trigger_set_timestamp();

DROP TRIGGER IF EXISTS set_timestamp_payments ON public.payments;
CREATE TRIGGER set_timestamp_payments
    BEFORE UPDATE ON public.payments
    FOR EACH ROW
    EXECUTE PROCEDURE trigger_set_timestamp();

-- =========================================================================
-- PERMISSIONS
-- =========================================================================

-- Grant permissions
GRANT ALL ON public.payment_orders TO authenticated;
GRANT ALL ON public.payment_verifications TO authenticated;
GRANT ALL ON public.user_subscriptions TO authenticated;
GRANT ALL ON public.payments TO authenticated;

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION activate_user_subscription TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_subscription TO authenticated;
GRANT EXECUTE ON FUNCTION has_active_subscription TO authenticated;
GRANT EXECUTE ON FUNCTION trigger_set_timestamp TO authenticated;

-- =========================================================================
-- VERIFICATION QUERIES (Optional - run these to test)
-- =========================================================================

-- Check if tables were created
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name LIKE '%payment%';

-- Check if functions were created
-- SELECT routine_name FROM information_schema.routines WHERE routine_schema = 'public' AND routine_name LIKE '%subscription%';

-- Test functions (replace with actual user UUID)
-- SELECT get_user_subscription('00000000-0000-0000-0000-000000000000'::uuid);
-- SELECT has_active_subscription('00000000-0000-0000-0000-000000000000'::uuid);
