# Testing Razorpay Edge Function

## Quick Test in Browser Console

Open browser console (F12) and run this to test the edge function directly:

```javascript
// Get your session token
const { data: { session } } = await supabase.auth.getSession();
const token = session?.access_token;

// Test create-order action
const testRequest = {
  action: 'create-order',
  plan_id: 'starter',
  billing_cycle: 'monthly',
  amount: 9900  // ₹99 in paise
};

console.log('Sending request:', testRequest);

const response = await fetch(
  `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/razorpay-payments`,
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(testRequest)
  }
);

console.log('Status:', response.status);
const responseText = await response.text();
console.log('Response:', responseText);

try {
  const responseJson = JSON.parse(responseText);
  console.log('Parsed Response:', responseJson);
} catch (e) {
  console.log('Response is not JSON:', responseText);
}
```

## Expected Request Format

The edge function should accept:

```json
{
  "action": "create-order",
  "plan_id": "starter" | "professional",
  "billing_cycle": "monthly" | "yearly",
  "amount": 9900
}
```

## If Edge Function Uses Different Field Names

If your edge function expects different field names, update `src/services/paymentService.ts`:

### Option 1: If it expects camelCase
```typescript
const requestBody = {
  action: 'create-order',
  planId: request.plan_id,  // camelCase
  billingCycle: request.billing_cycle,  // camelCase
  amount: request.amount,
};
```

### Option 2: If it expects different action name
```typescript
const requestBody = {
  action: 'createOrder',  // or whatever your edge function expects
  plan_id: request.plan_id,
  billing_cycle: request.billing_cycle,
  amount: request.amount,
};
```

## Check Edge Function Code

Please verify your `razorpay-payments` edge function code and confirm:

1. What action names does it expect?
2. What field names does it expect? (snake_case vs camelCase)
3. What is the exact error message it returns?

This will help us match the request format exactly.

