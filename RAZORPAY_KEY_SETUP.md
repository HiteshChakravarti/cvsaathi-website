# Razorpay Key Setup Guide

## 🔑 Two Different Keys

Razorpay provides **two different keys**:

### 1. **Key ID** (Public Key) - For Frontend
- **Variable Name:** `VITE_RAZORPAY_KEY_ID`
- **Format:** `rzp_test_xxxxxxxxxxxxx` (test) or `rzp_live_xxxxxxxxxxxxx` (live)
- **Used in:** Frontend code to initialize Razorpay checkout
- **Safe to expose:** Yes (it's public)

### 2. **Secret Key** (Private Key) - For Backend Only
- **Variable Name:** `RAZORPAY_KEY_SECRET` (in edge function environment)
- **Format:** `xxxxxxxxxxxxxxxxxxxx` (longer string)
- **Used in:** Backend/edge function for API calls and signature verification
- **Safe to expose:** ❌ **NEVER** put this in frontend code!

---

## 📍 Where to Find Your Keys

### In Razorpay Dashboard:

1. **Go to:** [Razorpay Dashboard](https://dashboard.razorpay.com)
2. **Navigate to:** Settings → API Keys
3. **You'll see:**
   - **Key ID:** `rzp_test_xxxxxxxxxxxxx` ← This is what you need for frontend
   - **Key Secret:** `xxxxxxxxxxxxxxxxxxxx` ← This goes in edge function only

---

## ✅ Correct .env Setup

### Frontend `.env` file:
```env
# Razorpay Key ID (Public Key - Safe for frontend)
VITE_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
```

### Backend Edge Function Environment (Supabase Dashboard):
```env
# Razorpay Key ID (for edge function)
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx

# Razorpay Secret Key (NEVER in frontend!)
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxx
```

---

## 🔍 How to Get Your Key ID

If you only have the Secret Key, you need to:

1. **Log into Razorpay Dashboard**
2. **Go to:** Settings → API Keys
3. **Find the Key ID** next to your Secret Key
4. **Copy the Key ID** (starts with `rzp_test_` or `rzp_live_`)

---

## ⚠️ Important Security Notes

- ✅ **Key ID** can be in frontend `.env` file
- ❌ **Secret Key** should NEVER be in frontend
- ✅ **Secret Key** should only be in backend/edge function environment variables
- ✅ Both keys are needed, but in different places

---

## 🧪 Test Mode vs Live Mode

- **Test Mode Keys:** Start with `rzp_test_`
- **Live Mode Keys:** Start with `rzp_live_`

Make sure you're using test mode keys for development!

