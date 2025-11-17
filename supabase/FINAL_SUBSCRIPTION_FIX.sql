-- =====================================================
-- FINAL SUBSCRIPTION FIX
-- =====================================================
-- Based on your table schema analysis
-- payments.amount = INTEGER (paise) ✅
-- Function has 9 params with p_plan_name ✅
-- =====================================================

-- STEP 1: Reload PostgREST schema cache (CRITICAL!)
SELECT pg_notify('pgrst', 'reload schema');

-- STEP 2: Verify function signature one more time
SELECT 
    p.parameter_name,
    p.data_type,
    p.ordinal_position
FROM information_schema.parameters p
JOIN information_schema.routines r 
  ON p.specific_name = r.specific_name
WHERE r.routine_schema = 'public'
  AND r.routine_name = 'activate_user_subscription'
ORDER BY p.ordinal_position;

-- ✅ Should show 9 parameters with p_plan_name at position 3

-- =====================================================
-- If function is missing or incorrect, run this:
-- =====================================================

DROP FUNCTION IF EXISTS public.activate_user_subscription(
  uuid, text, text, text, text, integer, text, timestamp with time zone, timestamp with time zone
);

CREATE OR REPLACE FUNCTION public.activate_user_subscription(
  p_user_id UUID,
  p_plan_id TEXT,
  p_plan_name TEXT,
  p_payment_id TEXT,
  p_order_id TEXT,
  p_amount INTEGER,  -- ✅ INTEGER in paise (no conversion)
  p_billing_cycle TEXT,
  p_start_date TIMESTAMP WITH TIME ZONE,
  p_end_date TIMESTAMP WITH TIME ZONE
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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

  -- Cancel existing active subscriptions
  UPDATE public.user_subscriptions
  SET status = 'cancelled', cancelled_at = now(), updated_at = now()
  WHERE user_id = p_user_id AND status = 'active';

  -- Create new subscription
  INSERT INTO public.user_subscriptions (
    user_id, plan_id, plan_name, status, billing_cycle,
    current_period_start, current_period_end,
    external_subscription_id, metadata
  ) VALUES (
    p_user_id, p_plan_id, p_plan_name, 'active', p_billing_cycle,
    p_start_date, calculated_end_date, p_payment_id,
    jsonb_build_object('order_id', p_order_id, 'payment_id', p_payment_id)
  ) RETURNING id INTO subscription_id;

  -- Record payment (skip test payments)
  IF p_payment_id NOT LIKE 'test_payment_%' THEN
    INSERT INTO public.payments (
      user_id, subscription_id, payment_id, order_id,
      amount, status, description, metadata
    ) VALUES (
      p_user_id, subscription_id, p_payment_id, p_order_id,
      p_amount,  -- ✅ Store in paise directly
      'completed',
      CONCAT(p_plan_name, ' subscription (', p_billing_cycle, ')'),
      jsonb_build_object('plan_id', p_plan_id, 'billing_cycle', p_billing_cycle)
    );
  END IF;

  -- Update legacy table
  INSERT INTO public.subscriptions (
    user_id, plan_name, status, billing_cycle,
    external_subscription_id, created_at, updated_at
  ) VALUES (
    p_user_id, p_plan_id, 'active', p_billing_cycle,
    p_payment_id, p_start_date, now()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    plan_name = EXCLUDED.plan_name,
    status = EXCLUDED.status,
    billing_cycle = EXCLUDED.billing_cycle,
    external_subscription_id = EXCLUDED.external_subscription_id,
    updated_at = now();

  -- Build result
  result := jsonb_build_object(
    'subscription_id', subscription_id,
    'user_id', p_user_id,
    'plan_id', p_plan_id,
    'plan_name', p_plan_name,
    'status', 'active',
    'billing_cycle', p_billing_cycle,
    'start_date', p_start_date,
    'end_date', calculated_end_date
  );

  RETURN result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.activate_user_subscription(
  UUID, TEXT, TEXT, TEXT, TEXT, INTEGER, TEXT, TIMESTAMP WITH TIME ZONE, TIMESTAMP WITH TIME ZONE
) TO anon, authenticated, service_role;

-- ✅ Reload schema cache again after any changes
SELECT pg_notify('pgrst', 'reload schema');
