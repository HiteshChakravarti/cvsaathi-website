# i18n (Internationalization) Setup Guide

## ✅ What Has Been Done

- ✅ `src/i18n.ts` file copied from CVSaathi (4010 lines)
- ✅ Contains translations for multiple languages
- ✅ Ready to use once dependencies are installed

---

## 📋 Setup Steps

### Step 1: Install i18next Dependencies

```bash
cd C:\Users\Hitesh\Aipoweredresumebuilder
npm install i18next react-i18next
```

**Required Packages:**
- `i18next` - Core internationalization framework
- `react-i18next` - React bindings for i18next

**Version Compatibility:**
- `i18next`: `^25.3.2` (matches CVSaathi)
- `react-i18next`: `^15.6.1` (matches CVSaathi)

---

### Step 2: Import i18n in Main Entry Point

**Modify:** `src/main.tsx`

```typescript
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import "./styles/globals.css";
import "./i18n"; // Import i18n configuration

createRoot(document.getElementById("root")!).render(<App />);
```

**Files to Modify:**
- `src/main.tsx`

---

### Step 3: Create Language Context (Optional but Recommended)

**Create:** `src/contexts/LanguageContext.tsx`

```typescript
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface LanguageContextType {
  currentLanguage: string;
  changeLanguage: (language: string) => void;
  availableLanguages: Array<{ code: string; name: string; nativeName: string }>;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const availableLanguages = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी' },
  // Add more languages as needed
];

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { i18n } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState('en');

  useEffect(() => {
    // Load saved language preference from localStorage (web) instead of AsyncStorage
    const loadLanguage = () => {
      try {
        const savedLanguage = localStorage.getItem('userLanguage');
        if (savedLanguage && availableLanguages.find(lang => lang.code === savedLanguage)) {
          setCurrentLanguage(savedLanguage);
          i18n.changeLanguage(savedLanguage);
        }
      } catch (error) {
        console.error('Error loading language preference:', error);
      }
    };

    loadLanguage();
  }, [i18n]);

  const changeLanguage = (language: string) => {
    try {
      setCurrentLanguage(language);
      i18n.changeLanguage(language);
      localStorage.setItem('userLanguage', language); // Use localStorage for web
    } catch (error) {
      console.error('Error saving language preference:', error);
    }
  };

  return (
    <LanguageContext.Provider value={{
      currentLanguage,
      changeLanguage,
      availableLanguages
    }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
```

**Files to Create:**
- `src/contexts/LanguageContext.tsx`

**Note:** This uses `localStorage` instead of `AsyncStorage` (which is React Native specific).

---

### Step 4: Wrap App with LanguageProvider

**Modify:** `src/App.tsx`

```typescript
import React from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { LanguageProvider } from "./contexts/LanguageContext";
import { AuthProvider } from "./contexts/AuthContext"; // When ready
import { LandingPage } from "./pages/LandingPage";
import { DashboardRoutes } from "./dashboard/DashboardRoutes";
import { ProtectedRoute } from "./routes/ProtectedRoute";

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route
              path="/app/*"
              element={
                <ProtectedRoute>
                  <DashboardRoutes />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </LanguageProvider>
  );
}
```

**Files to Modify:**
- `src/App.tsx`

---

### Step 5: Use Translations in Components

**Example:** Using `useTranslation` hook

```typescript
import React from 'react';
import { useTranslation } from 'react-i18next';

export const MyComponent = () => {
  const { t } = useTranslation();

  return (
    <div>
      <h1>{t('welcome')}</h1>
      <p>{t('dashboard')}</p>
      <button>{t('cancel')}</button>
    </div>
  );
};
```

**Example:** Using with interpolation

```typescript
const { t } = useTranslation();
const message = t('deleteResumeConfirmation', { title: 'My Resume' });
// Output: "Are you sure you want to delete "My Resume"?"
```

---

## 🌍 Available Languages

The `i18n.ts` file includes translations for:

1. **English (en)** - Default
2. **Hindi (hi)** - हिन्दी
3. **Bengali (bn)** - বাংলা
4. **Telugu (te)** - తెలుగు
5. **Tamil (ta)** - தமிழ்
6. **Marathi (mr)** - मराठी
7. And more...

**To add more languages:**
- Edit `src/i18n.ts`
- Add new language object to `resources` object
- Follow the same structure as existing languages

---

## 📝 Key Translation Keys

### Common
- `loading`, `error`, `success`
- `cancel`, `delete`, `save`
- `copied`, `messageCopied`

### Navigation
- `home`, `dashboard`, `profile`
- `aiCoach`, `progress`, `jobs`

### Dashboard
- `welcomeBack`, `featuredTools`
- `myResume`, `findJobs`
- `overallProgress`, `thisWeekActivity`

### Forms
- `firstName`, `lastName`, `email`
- `password`, `confirmPassword`
- `saveChanges`, `cancel`

**For complete list, see `src/i18n.ts` (4010 lines of translations)**

---

## 🔧 Language Switching

### Option 1: Using Language Context (Recommended)

```typescript
import { useLanguage } from '../contexts/LanguageContext';

const MyComponent = () => {
  const { currentLanguage, changeLanguage, availableLanguages } = useLanguage();

  return (
    <select 
      value={currentLanguage} 
      onChange={(e) => changeLanguage(e.target.value)}
    >
      {availableLanguages.map(lang => (
        <option key={lang.code} value={lang.code}>
          {lang.nativeName}
        </option>
      ))}
    </select>
  );
};
```

### Option 2: Direct i18n API

```typescript
import { useTranslation } from 'react-i18next';

const MyComponent = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('userLanguage', lang);
  };

  return (
    <button onClick={() => changeLanguage('hi')}>
      Switch to Hindi
    </button>
  );
};
```

---

## ✅ Verification Checklist

- [ ] Install `i18next` and `react-i18next` packages
- [ ] Import `./i18n` in `src/main.tsx`
- [ ] Create `LanguageContext` (optional)
- [ ] Wrap App with `LanguageProvider` (if using context)
- [ ] Test translations in a component
- [ ] Test language switching
- [ ] Verify language preference persists (localStorage)

---

## 🧪 Testing

### Test 1: Basic Translation
```typescript
import { useTranslation } from 'react-i18next';

const TestComponent = () => {
  const { t } = useTranslation();
  return <div>{t('welcome')}</div>; // Should show "Welcome"
};
```

### Test 2: Language Switch
```typescript
import { useTranslation } from 'react-i18next';

const TestComponent = () => {
  const { t, i18n } = useTranslation();
  
  const switchToHindi = () => {
    i18n.changeLanguage('hi');
  };

  return (
    <div>
      <p>{t('welcome')}</p>
      <button onClick={switchToHindi}>Switch to Hindi</button>
    </div>
  );
};
```

### Test 3: Interpolation
```typescript
const { t } = useTranslation();
const message = t('deleteResumeConfirmation', { title: 'Test Resume' });
console.log(message); // Should show: "Are you sure you want to delete "Test Resume"?"
```

---

## 🔍 Troubleshooting

### "Cannot find module 'i18next'"
- Run `npm install i18next react-i18next`
- Restart dev server

### "Translations not showing"
- Verify `import './i18n'` is in `main.tsx`
- Check browser console for i18n errors
- Verify translation keys exist in `i18n.ts`

### "Language not persisting"
- Check localStorage is enabled in browser
- Verify `localStorage.setItem('userLanguage', lang)` is called
- Check browser DevTools → Application → Local Storage

### "Translation key not found"
- Check key exists in `src/i18n.ts`
- Verify key spelling matches exactly
- Check if key is nested (use dot notation: `t('section.key')`)

---

## 📚 Additional Resources

- [i18next Documentation](https://www.i18next.com/)
- [react-i18next Documentation](https://react.i18next.com/)
- Translation file: `src/i18n.ts`

---

## 🚀 Next Steps

1. **Install packages** (Step 1)
2. **Import i18n** (Step 2)
3. **Create Language Context** (Step 3 - optional)
4. **Wrap App** (Step 4)
5. **Start using translations** in components

---

**Note:** The i18n.ts file is already copied and ready to use. Just install dependencies and import it!

