# Files to Copy from CVSaathi - Complete Checklist

## ✅ Already Copied
- ✅ `src/i18n.ts` - Translation file (4010 lines)
- ✅ `supabase/` - All SQL migration files
- ✅ Database schema files

---

## 🔴 Critical Files (Must Copy for Website to Work)

### 1. Core Utilities & Constants

#### `src/lib/constants.ts`
**Purpose:** App-wide constants, colors, routes  
**Web Compatibility:** ✅ Direct copy (no changes needed)  
**Action:** Copy as-is

#### `src/lib/utils.ts`
**Purpose:** Utility functions (cn, class merging)  
**Web Compatibility:** ✅ Direct copy (already web-compatible)  
**Action:** Copy as-is

#### `src/lib/validation.ts`
**Purpose:** Form validation schemas using Zod  
**Web Compatibility:** ⚠️ Needs minor fix (document.createElement for web)  
**Action:** Copy and fix `sanitizeHtml` function

**Fix Needed:**
```typescript
// Change from:
export const sanitizeHtml = (html: string): string => {
  const temp = document.createElement('div');
  temp.textContent = html;
  return temp.innerHTML;
};

// This is already web-compatible, but verify it works
```

---

### 2. TypeScript Type Definitions

#### `src/types/resume.ts`
**Purpose:** Resume and Template type definitions  
**Web Compatibility:** ✅ Direct copy  
**Action:** Copy as-is

#### `src/types/cvTypes.ts`
**Purpose:** CV analysis types  
**Web Compatibility:** ✅ Direct copy  
**Action:** Copy as-is

---

### 3. Services (API Layer)

#### `src/services/subscriptionService.ts`
**Purpose:** Subscription management, pricing plans, feature access  
**Web Compatibility:** ⚠️ Remove React Native Alert, use web alternative  
**Action:** Copy and replace `Alert.alert` with web notifications

**Changes Needed:**
```typescript
// Replace:
import { Alert } from 'react-native';
Alert.alert('Title', 'Message');

// With:
// Use toast/notification library (sonner is already installed)
import { toast } from 'sonner';
toast.error('Message');
```

#### `src/services/usageTrackingService.ts`
**Purpose:** Track feature usage for subscription limits  
**Web Compatibility:** ✅ Mostly compatible, check AsyncStorage usage  
**Action:** Copy and replace AsyncStorage with localStorage if needed

#### `src/services/userStatsService.ts`
**Purpose:** User statistics management  
**Web Compatibility:** ✅ Direct copy  
**Action:** Copy as-is

#### `src/services/aiCareerService.ts`
**Purpose:** AI Career Companion service  
**Web Compatibility:** ✅ Direct copy  
**Action:** Copy as-is

#### `src/services/razorpayService.ts`
**Purpose:** Payment integration  
**Web Compatibility:** ⚠️ Needs web Razorpay SDK  
**Action:** Copy and adapt for web Razorpay Checkout

**Changes Needed:**
- Replace `react-native-razorpay` with web Razorpay Checkout
- Use Razorpay web SDK instead of React Native package

---

### 4. React Hooks

#### `src/hooks/useSubscription.ts`
**Purpose:** Subscription management hook  
**Web Compatibility:** ⚠️ Replace AsyncStorage with localStorage  
**Action:** Copy and adapt storage

**Changes Needed:**
```typescript
// Replace:
import AsyncStorage from '@react-native-async-storage/async-storage';
await AsyncStorage.setItem('key', 'value');
const value = await AsyncStorage.getItem('key');

// With:
localStorage.setItem('key', 'value');
const value = localStorage.getItem('key');
```

#### `src/hooks/useUserStats.ts`
**Purpose:** User statistics hook  
**Web Compatibility:** ✅ Direct copy  
**Action:** Copy as-is

#### `src/hooks/useFeatureGate.ts`
**Purpose:** Feature gating based on subscription  
**Web Compatibility:** ✅ Direct copy  
**Action:** Copy as-is

#### `src/hooks/useAnalytics.ts`
**Purpose:** Analytics tracking  
**Web Compatibility:** ✅ Direct copy  
**Action:** Copy as-is

---

## 🟡 Important Files (Should Copy for Full Functionality)

### 5. Additional Services

#### `src/services/skillGapAnalysisService.ts`
**Purpose:** Skill gap analysis  
**Web Compatibility:** ✅ Direct copy  
**Action:** Copy as-is

#### `src/services/resumeExportService.ts`
**Purpose:** Resume PDF export  
**Web Compatibility:** ⚠️ May need web PDF library  
**Action:** Copy and verify PDF generation works on web

#### `src/services/aiTranslationService.ts`
**Purpose:** AI translation service  
**Web Compatibility:** ✅ Direct copy  
**Action:** Copy as-is

#### `src/services/configService.ts`
**Purpose:** App configuration service  
**Web Compatibility:** ✅ Direct copy  
**Action:** Copy as-is

---

### 6. Utility Functions

#### `src/utils/pdfGenerator.ts`
**Purpose:** PDF generation utilities  
**Web Compatibility:** ⚠️ May need web PDF library (jsPDF, pdfkit)  
**Action:** Copy and adapt for web PDF libraries

#### `src/utils/templateManager.ts`
**Purpose:** Template management  
**Web Compatibility:** ✅ Direct copy  
**Action:** Copy as-is

---

## 🟢 Optional Files (Nice to Have)

### 7. Additional Hooks

- `src/hooks/useResumes.ts` - Resume management
- `src/hooks/useTemplates.ts` - Template management
- `src/hooks/useProfile.ts` - Profile management
- `src/hooks/useOnboarding.ts` - Onboarding flow

### 8. Additional Services

- `src/services/privacyService.ts` - Privacy settings
- `src/services/syncService.ts` - Data synchronization
- `src/services/trialService.ts` - Trial management

---

## 📋 Quick Copy Script

### Priority 1: Core Files (Copy These First)

```bash
# Core utilities
cp C:\Users\Hitesh\CVSaathi\src\lib\constants.ts C:\Users\Hitesh\Aipoweredresumebuilder\src\lib\
cp C:\Users\Hitesh\CVSaathi\src\lib\utils.ts C:\Users\Hitesh\Aipoweredresumebuilder\src\lib\
cp C:\Users\Hitesh\CVSaathi\src\lib\validation.ts C:\Users\Hitesh\Aipoweredresumebuilder\src\lib\

# Types
cp C:\Users\Hitesh\CVSaathi\src\types\resume.ts C:\Users\Hitesh\Aipoweredresumebuilder\src\types\
cp C:\Users\Hitesh\CVSaathi\src\types\cvTypes.ts C:\Users\Hitesh\Aipoweredresumebuilder\src\types\

# Services
cp C:\Users\Hitesh\CVSaathi\src\services\subscriptionService.ts C:\Users\Hitesh\Aipoweredresumebuilder\src\services\
cp C:\Users\Hitesh\CVSaathi\src\services\usageTrackingService.ts C:\Users\Hitesh\Aipoweredresumebuilder\src\services\
cp C:\Users\Hitesh\CVSaathi\src\services\userStatsService.ts C:\Users\Hitesh\Aipoweredresumebuilder\src\services\
cp C:\Users\Hitesh\CVSaathi\src\services\aiCareerService.ts C:\Users\Hitesh\Aipoweredresumebuilder\src\services\

# Hooks
cp C:\Users\Hitesh\CVSaathi\src\hooks\useSubscription.ts C:\Users\Hitesh\Aipoweredresumebuilder\src\hooks\
cp C:\Users\Hitesh\CVSaathi\src\hooks\useUserStats.ts C:\Users\Hitesh\Aipoweredresumebuilder\src\hooks\
cp C:\Users\Hitesh\CVSaathi\src\hooks\useFeatureGate.ts C:\Users\Hitesh\Aipoweredresumebuilder\src\hooks\
cp C:\Users\Hitesh\CVSaathi\src\hooks\useAnalytics.ts C:\Users\Hitesh\Aipoweredresumebuilder\src\hooks\
```

---

## 🔧 Required Adaptations

### 1. AsyncStorage → localStorage
**Files Affected:**
- `useSubscription.ts`
- Any service using AsyncStorage

**Pattern:**
```typescript
// Before (React Native)
import AsyncStorage from '@react-native-async-storage/async-storage';
await AsyncStorage.setItem('key', 'value');
const value = await AsyncStorage.getItem('key');

// After (Web)
localStorage.setItem('key', 'value');
const value = localStorage.getItem('key');
```

### 2. Alert → Toast/Notification
**Files Affected:**
- `subscriptionService.ts`
- Any service using `Alert.alert`

**Pattern:**
```typescript
// Before (React Native)
import { Alert } from 'react-native';
Alert.alert('Title', 'Message');

// After (Web - using sonner)
import { toast } from 'sonner';
toast.error('Message');
// or
toast.success('Message');
```

### 3. Razorpay Integration
**Files Affected:**
- `razorpayService.ts`

**Changes:**
- Remove `react-native-razorpay`
- Use Razorpay Checkout (web SDK)
- Load Razorpay script in HTML

### 4. PDF Generation
**Files Affected:**
- `resumeExportService.ts`
- `utils/pdfGenerator.ts`

**Changes:**
- Use `jsPDF` or `pdfkit` for web
- Remove React Native PDF libraries

---

## 📦 Required NPM Packages

### Already Installed
- ✅ `sonner` - For toast notifications
- ✅ `clsx` - For className utilities
- ✅ `tailwind-merge` - For Tailwind class merging

### Need to Install
```bash
npm install zod                    # For validation
npm install jspdf                 # For PDF generation (if needed)
npm install @razorpay/checkout    # For Razorpay web integration
```

---

## ✅ Verification Checklist

After copying files:

- [ ] All imports resolve correctly
- [ ] No React Native dependencies in web code
- [ ] AsyncStorage replaced with localStorage
- [ ] Alert replaced with toast/notifications
- [ ] Razorpay adapted for web
- [ ] PDF generation works on web
- [ ] TypeScript compiles without errors
- [ ] All services can connect to Supabase

---

## 🚀 Quick Start Priority

### Phase 1: Essential (Do First)
1. Copy `lib/constants.ts`
2. Copy `lib/utils.ts`
3. Copy `lib/validation.ts` (fix sanitizeHtml if needed)
4. Copy `types/resume.ts` and `types/cvTypes.ts`
5. Copy `services/subscriptionService.ts` (fix Alert)
6. Copy `services/usageTrackingService.ts`
7. Copy `hooks/useSubscription.ts` (fix AsyncStorage)
8. Copy `hooks/useFeatureGate.ts`

### Phase 2: Important (Do Next)
9. Copy `services/aiCareerService.ts`
10. Copy `services/userStatsService.ts`
11. Copy `hooks/useUserStats.ts`
12. Copy `hooks/useAnalytics.ts`

### Phase 3: Nice to Have (Do Later)
13. Copy remaining services
14. Copy remaining hooks
15. Copy utility functions

---

## 📝 Notes

- **Storage:** All AsyncStorage usage must be replaced with localStorage
- **Alerts:** All Alert.alert must be replaced with toast notifications
- **PDF:** May need different PDF library for web
- **Razorpay:** Requires web SDK integration
- **File Upload:** Web uses `<input type="file">` instead of document picker
- **Navigation:** Already using react-router-dom (correct for web)

---

**Next Step:** Start copying files from Phase 1, then adapt for web compatibility.

