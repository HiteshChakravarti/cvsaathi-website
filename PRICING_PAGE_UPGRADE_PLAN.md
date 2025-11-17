# Pricing Page Upgrade & Payment Gateway Integration Plan

## 📋 Overview
Update the pricing page to match the new plan structure and integrate live Razorpay payment gateway.

---

## 🎯 New Plan Structure (From Image)

### Plan 1: Free Plan
- **Price:** ₹0/month
- **Description:** "Perfect for getting started"
- **Features:**
  - AI career coaching: 3 sessions/month
  - Resume builder: 3 resumes with critique & ATS
  - Resume templates: 10 free templates
  - PDF export: 3 PDFs with watermark
  - Interview prep: 2 complete sessions/month
  - Languages: All languages (EN/HI/MR)
  - Basic profile setup: Available
  - ATS checker: 1 analysis/month
  - Skill gap analysis: 1 analysis/month
  - WhatsApp export: With watermark

### Plan 2: Starter Plan
- **Price:** ₹99/month
- **Description:** "Great for job seekers"
- **Features:**
  - AI career coaching: 15 sessions/month
  - Resume builder: 10 resumes with critique & ATS
  - Resume templates: 15 templates
  - PDF export: 10 PDFs without watermark
  - Interview prep: 15 complete sessions/month
  - Languages: All languages (EN/HI/MR)
  - ATS checker: 5 analyses/month
  - Skill gap analysis: 8 analyses/month
  - WhatsApp export: Clean export
  - Email support: Available

### Plan 3: Professional Plan (Most Popular)
- **Price:** ₹199/month
- **Description:** "For serious career growth"
- **Features:**
  - Unlimited AI career coaching
  - Resume builder: Unlimited resumes with critique & ATS
  - All premium templates: Unlimited access
  - Unlimited interview prep
  - Unlimited ATS checker + detailed reports
  - Unlimited skill gap analysis
  - PDF export: Unlimited without watermark
  - Advanced formatting: Available
  - Priority support: Available
  - WhatsApp notifications: Available
  - Advanced analytics: Available

---

## 🔑 Required Environment Variables (.env)

Add these to your `.env` file:

```env
# Razorpay Configuration
VITE_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx  # Your Razorpay Key ID (from Razorpay Dashboard)
VITE_RAZORPAY_SECRET_KEY=xxxxxxxxxxxxxxxxxxxx  # Your Razorpay Secret Key (for backend verification)

# Backend API Endpoint (if using Supabase Edge Function for payment)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Payment Webhook URL (for Razorpay webhooks)
VITE_RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
```

### Where to Get Razorpay Keys:
1. Go to [Razorpay Dashboard](https://dashboard.razorpay.com)
2. Navigate to **Settings** → **API Keys**
3. Copy your **Key ID** (starts with `rzp_test_` for test mode or `rzp_live_` for live mode)
4. Copy your **Secret Key** (keep this secure, only use in backend)
5. For webhooks: **Settings** → **Webhooks** → Create webhook and get secret

---

## 🔄 Payment Flow

### Current Flow (Needs Update):
1. User clicks "Upgrade Now" / "Select Plan"
2. Frontend directly opens Razorpay checkout ❌ (Not secure)

### Recommended Secure Flow:
1. User clicks "Upgrade Now" / "Select Plan"
2. **Frontend calls backend** to create payment order
3. Backend creates order in `payment_orders` table
4. Backend returns Razorpay order details
5. Frontend opens Razorpay checkout with order_id
6. User completes payment
7. Razorpay redirects back with payment_id and signature
8. **Frontend calls backend** to verify payment
9. Backend verifies signature with Razorpay
10. Backend activates subscription via `activate_user_subscription` function
11. Frontend refreshes subscription status

---

## 🔌 Backend API Endpoints Needed

### Option 1: Supabase Edge Functions (Recommended)
Create these edge functions:

#### 1. `create-payment-order`
**Purpose:** Create Razorpay order before checkout
**Request:**
```json
{
  "plan_id": "starter" | "professional",
  "billing_cycle": "monthly" | "yearly",
  "amount": 9900  // in paise (₹99 = 9900 paise)
}
```
**Response:**
```json
{
  "order_id": "order_xxxxx",
  "razorpay_order_id": "order_xxxxx",
  "amount": 9900,
  "currency": "INR"
}
```

#### 2. `verify-payment`
**Purpose:** Verify payment signature and activate subscription
**Request:**
```json
{
  "razorpay_payment_id": "pay_xxxxx",
  "razorpay_order_id": "order_xxxxx",
  "razorpay_signature": "signature_xxxxx",
  "plan_id": "starter",
  "billing_cycle": "monthly"
}
```
**Response:**
```json
{
  "success": true,
  "subscription_id": "uuid",
  "message": "Subscription activated successfully"
}
```

### Option 2: Direct Supabase RPC Functions
If you prefer using database functions directly:

#### 1. `create_razorpay_order`
- Creates order in `payment_orders` table
- Returns order details for Razorpay checkout

#### 2. `verify_razorpay_payment`
- Verifies payment signature
- Calls `activate_user_subscription` function
- Updates payment status

---

## 📝 Implementation Checklist

### Phase 1: Update Plan Structure ✅
- [ ] Update `PricingPage.tsx` with new plan data
- [ ] Match features exactly as shown in image
- [ ] Update pricing: ₹0, ₹99, ₹199
- [ ] Add "Most Popular" badge to Professional plan
- [ ] Update button text: "Current Plan", "Upgrade Now", "Select Plan"

### Phase 2: Payment Integration 🔄
- [ ] Add Razorpay Key ID to `.env`
- [ ] Create backend API/Edge Function for order creation
- [ ] Update `handleSubscribe` to call backend first
- [ ] Integrate Razorpay checkout with order_id
- [ ] Create payment verification endpoint
- [ ] Handle payment success callback
- [ ] Handle payment failure/cancellation
- [ ] Refresh subscription status after payment

### Phase 3: Keep Existing Features ✅
- [ ] Keep "Compare Plans" table (update with new plan features)
- [ ] Keep FAQ section (update if needed)
- [ ] Keep billing cycle toggle (Monthly/Annual) - if needed
- [ ] Keep dark mode support

### Phase 4: Testing 🧪
- [ ] Test with Razorpay test mode
- [ ] Test payment success flow
- [ ] Test payment failure flow
- [ ] Test subscription activation
- [ ] Test plan switching
- [ ] Verify subscription limits work correctly

---

## 🎨 UI Updates Needed

### Pricing Cards:
- Match exact feature list from image
- Show correct pricing (₹0, ₹99, ₹199)
- Highlight Professional plan with "Most Popular" badge
- Update button states (Current Plan vs Upgrade Now)

### Compare Plans Table:
- Update with new plan features
- Show correct limits for each plan
- Match feature names from image

### FAQ:
- Keep existing FAQs
- Update if any pricing/plan questions need changes

---

## 🔐 Security Considerations

1. **Never expose Secret Key in frontend** - Only Key ID should be in `.env`
2. **Always verify payment signature** - Use backend to verify with Razorpay
3. **Use HTTPS** - Required for Razorpay in production
4. **Validate amounts** - Backend should validate amount matches plan price
5. **Idempotency** - Handle duplicate payment attempts gracefully

---

## 📊 Database Schema (Already Exists)

Based on `COMPLETE_RAZORPAY_SETUP.sql`, you already have:
- ✅ `payment_orders` table
- ✅ `payments` table
- ✅ `user_subscriptions` table
- ✅ `activate_user_subscription` function

**No database changes needed!** ✅

---

## 🚀 Next Steps

1. **Confirm Plan Structure** - Review the plan features above
2. **Get Razorpay Keys** - Set up Razorpay account and get keys
3. **Choose Backend Approach** - Edge Functions vs RPC Functions
4. **Implement Payment Flow** - Start with order creation
5. **Test Thoroughly** - Use Razorpay test mode first

---

## ❓ Questions to Discuss

1. **Billing Cycle:** Do you want Monthly/Annual toggle, or just Monthly for now?
2. **Backend Approach:** Edge Functions or RPC Functions?
3. **Webhook vs Polling:** Use Razorpay webhooks or verify on frontend callback?
4. **Trial Period:** Any trial periods for Starter/Professional plans?
5. **Plan Switching:** Allow downgrades, or only upgrades?
6. **Payment Methods:** Any specific payment methods to enable/disable?

---

Let me know your preferences and I'll start implementing! 🚀

