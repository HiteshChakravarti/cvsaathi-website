# 🌍 Language Translation Implementation Plan

## 📋 Current Status Recap

### ✅ What We Have:
1. **i18n Infrastructure:**
   - `i18next` and `react-i18next` packages installed ✅
   - `src/i18n.ts` file with 4010+ lines of translations ✅
   - English (en), Hindi (hi), and Marathi (mr) translations exist ✅
   - i18n initialized in `main.tsx` ✅

2. **Existing Translations:**
   - Dashboard components (likely using translations)
   - Profile, Settings, Resume Builder sections
   - Common UI elements (buttons, labels, etc.)

### ❌ What's Missing:
1. **Landing Page Components:**
   - All text is hardcoded in English
   - Hero, Navigation, Features, CTA sections not translated
   - Footer, Pricing, FAQ sections not translated

2. **Language Switcher:**
   - No UI component to change language
   - No language persistence (localStorage)
   - No language preference saved to user profile

3. **Translation Keys:**
   - Missing keys for landing page content
   - Need to add Hindi/Marathi translations for:
     - Navigation menu items
     - Hero section text
     - Feature descriptions
     - CTA buttons
     - Footer content
     - Pricing plans
     - FAQ questions/answers

---

## 🎯 Implementation Plan

### Phase 1: Add Translation Keys for Landing Page

**Files to Update: `src/i18n.ts`**

Add new translation keys for:
- `landing.hero.*` - Hero section
- `landing.navigation.*` - Navigation menu
- `landing.features.*` - Feature descriptions
- `landing.cta.*` - Call-to-action buttons
- `landing.footer.*` - Footer content
- `landing.pricing.*` - Pricing section
- `landing.faq.*` - FAQ section

### Phase 2: Create Language Switcher Component

**New File: `src/components/LanguageSwitcher.tsx`**
- Dropdown/button to select language
- Shows current language flag/name
- Saves preference to localStorage
- Updates i18n language immediately

### Phase 3: Update Landing Page Components

**Components to Update:**
1. `src/components/Navigation.tsx` - Add language switcher + translate text
2. `src/components/Hero.tsx` - Translate all text
3. `src/components/FeaturesBentoModern.tsx` - Translate feature cards
4. `src/components/CTA.tsx` - Translate CTA text
5. `src/components/FinalCTA.tsx` - Translate final CTA
6. `src/components/Footer.tsx` - Translate footer links
7. `src/components/PricingSnapshot.tsx` - Translate pricing plans
8. `src/components/FAQ.tsx` - Translate FAQ
9. `src/components/EstelCompanion.tsx` - Translate Estel section
10. `src/components/HowItWorksModern.tsx` - Translate steps

### Phase 4: Language Persistence

**Update:**
- Save language preference to localStorage
- Load language on app start
- Optionally sync with user profile in Supabase

### Phase 5: Exclude Legal Documents

**Keep in English:**
- Privacy Policy
- Terms of Service
- Cookie Policy
- Refunds Policy
- Grievance Officer
- All legal/compliance pages

---

## 📝 Translation Keys Structure

```typescript
landing: {
  hero: {
    badge: "AI-Powered Career Growth Platform",
    title: "CVSaathi",
    description: "Craft your career story with AI...",
    getTemplate: "Get Template",
    seeServices: "See Our Services"
  },
  navigation: {
    whyChooseUs: "Why Choose Us",
    features: "Features",
    services: "Services",
    process: "Process",
    templates: "Templates",
    pricing: "Pricing",
    signIn: "Sign In",
    getStarted: "Get Started Free"
  },
  features: {
    resumeBuilder: {
      title: "Resume Builder",
      description: "Create beautiful, job-winning resumes..."
    },
    // ... more features
  },
  // ... more sections
}
```

---

## 🔧 Implementation Steps

1. **Add translation keys** to `i18n.ts` for all landing page content
2. **Create LanguageSwitcher component** with dropdown
3. **Update Navigation** to include language switcher
4. **Update all landing components** to use `useTranslation()` hook
5. **Add language persistence** to localStorage
6. **Test language switching** on all pages
7. **Verify legal pages** remain in English only

---

## ✅ Success Criteria

- [ ] Language switcher visible in navigation
- [ ] All landing page text changes when language is switched
- [ ] Language preference persists across page reloads
- [ ] Legal documents remain in English
- [ ] Dashboard components continue to work with translations
- [ ] Hindi and Marathi translations are complete and accurate

---

## 🚫 Exclusions (Keep in English)

- Privacy Policy (`/support/privacy-policy`)
- Terms of Service (`/support/terms-of-use`)
- Cookie Policy (`/support/cookie-policy`)
- Refunds (`/support/refunds`)
- Grievance Officer (`/support/grievance-officer`)
- All compliance pages

---

## 📊 Estimated Work

- **Translation Keys:** ~200-300 new keys
- **Components to Update:** ~10-12 components
- **New Components:** 1 (LanguageSwitcher)
- **Time Estimate:** 4-6 hours for full implementation

