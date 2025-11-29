# Landing Page CTAs & Buttons Analysis

## Summary
This document lists all buttons and CTAs on the landing page, indicating which route to auth pages and their current status.

---

## ✅ ACTIVE CTAs (Routing to Auth Pages)

### 1. **Navigation Bar** (`src/components/Navigation.tsx`)
   - **Desktop:**
     - ✅ **"Sign In"** → `/auth/signin` (Line 74-80)
     - ✅ **"Get Started Free"** → `/auth/signup` (Line 83-89)
   - **Mobile Menu:**
     - ✅ **"Sign In"** → `/auth/signin` (Line 122-125)
     - ✅ **"Get Started Free"** → `/auth/signup` (Line 127-130)

### 2. **Hero Section** (`src/components/Hero.tsx`)
   - ✅ **"Get Template"** → `/auth/signup` (Line 148-157)
   - ⚠️ **"See Our Services"** → Scrolls to `#templates` (Line 160-172) - **NOT auth route**

### 3. **Estel Companion Section** (`src/components/EstelCompanion.tsx`)
   - ✅ **"Start Chatting with Estel"** → `/auth/signup` (Line 107-116)

### 4. **Features Bento Section** (`src/components/FeaturesBentoModern.tsx`)
   - ✅ **"Get Started"** → `/auth/signup` (Line 265-274)
   - ⚠️ **"See Our Services"** → Scrolls to `#templates` (Line 278-288) - **NOT auth route**

### 5. **Final CTA Section** (`src/components/FinalCTA.tsx`)
   - ✅ **"Get Started Free"** → `/auth/signup` (Line 97-105)
   - ⚠️ **"View Pricing"** → No route (Line 109-115) - **NOT auth route, should route to `#pricing`**

### 6. **Pricing Section** (`src/components/PricingSnapshot.tsx`)
   - ✅ **"Current Plan"** (Free Plan) → `/auth/signup` (Line 213-224)
   - ✅ **"Upgrade Now"** (Starter Plan) → `/auth/signup` (Line 213-224)
   - ✅ **"Select Plan"** (Professional Plan) → `/auth/signup` (Line 213-224)

---

## ❌ INACTIVE / MISSING ROUTES

### 1. **CTA Section** (`src/components/CTA.tsx`)
   - ❌ **"Create Your Resume Free"** → No route (Line 85-96) - **SHOULD route to `/auth/signup`**
   - ❌ **"Talk to Sales"** → No route (Line 106-112) - **SHOULD route to contact/sales page**

### 2. **Final CTA Section** (`src/components/FinalCTA.tsx`)
   - ❌ **"View Pricing"** → No route (Line 109-115) - **SHOULD route to `#pricing`**

### 3. **Footer** (`src/components/Footer.tsx`)
   - ❌ **"Subscribe"** button → No functionality (Line 202-208) - **SHOULD handle newsletter subscription**

---

## 📊 Statistics

- **Total CTAs Found:** 15 buttons
- **Active Auth Routes:** 9 buttons (60%)
- **Inactive/Missing Routes:** 6 buttons (40%)
  - 3 should route to `/auth/signup`
  - 1 should route to `#pricing`
  - 1 should route to contact/sales
  - 1 needs newsletter functionality

---

## 🔧 Recommended Actions

### High Priority (User Experience)
1. **Fix "Create Your Resume Free" in CTA section** → Route to `/auth/signup`
2. **Fix "View Pricing" in FinalCTA** → Route to `#pricing` or `/app/pricing`
3. **Add newsletter subscription handler** in Footer

### Medium Priority (Conversion Optimization)
4. **"Talk to Sales"** → Route to `/company/contact` or open contact modal
5. **Consider adding "Sign In" links** in sections where users might already have accounts

### Low Priority (Nice to Have)
6. **Add analytics tracking** to all CTA clicks
7. **A/B test** different CTA copy variations

---

## 📝 Notes

- All pricing plan buttons correctly route to `/auth/signup` (good for conversion)
- Navigation has both Sign In and Sign Up options (good UX)
- Some CTAs use scroll behavior (`#templates`) which is fine for UX, but consider adding auth routes as alternatives
- Footer newsletter subscription is currently non-functional

---

## ✅ Verification Checklist

- [x] Navigation Sign In/Sign Up buttons work
- [x] Hero "Get Template" button works
- [x] Estel Companion CTA works
- [x] Features section "Get Started" works
- [x] Final CTA "Get Started Free" works
- [x] All pricing plan buttons work
- [ ] CTA section "Create Your Resume Free" needs route
- [ ] Final CTA "View Pricing" needs route
- [ ] Footer newsletter needs functionality

