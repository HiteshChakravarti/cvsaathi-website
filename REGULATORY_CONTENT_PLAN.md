# Regulatory Content Structure Plan

## 📋 Content Analysis from Mobile App

Based on the provided images, I've identified the following regulatory content that needs to be placed on the website:

### 1. **Privacy Policy** (Main Comprehensive Page)
**Sections identified:**
- Introduction
- Information We Collect
  - Personal Information You Provide
  - Automatically Collected Information
  - Camera and Microphone Data
- How We Use Your Information
- Information Sharing and Disclosure
- Data Security
- Your Privacy Rights
- Indian Privacy Compliance
- International Compliance (GDPR, CCPA, COPPA, PIPEDA)
- Children's Privacy
- Contact Information
- Policy Dates (Effective Date, Last Updated)

**Location:** `/support/privacy-policy`

---

### 2. **Terms of Service** (Main Legal Page)
**Sections identified:**
- Acceptance of Terms
- Description of Service
- AI Career Guidance Disclaimer
- User Responsibilities
- Limitations of Liability
- Subscription and Payment
- Intellectual Property
- Privacy and Data
- Acceptable Use
- Service Availability
- Termination
- Changes to Terms
- Contact Information

**Location:** `/support/terms-of-use`

---

### 3. **Indian Privacy Compliance** (Dedicated Page)
**Sections:**
- Digital Personal Data Protection Act 2023 (DPDP Act)
  - Data Processing
  - User Rights
  - Data Localization
  - Consent Management
  - Data Minimization
- Information Technology Act 2000
  - Secure Data Handling
  - Grievance Redressal
  - Data Breach Notification
  - Reasonable Security Practices
- RBI Guidelines for Digital Payments
  - Secure Payment Processing
  - Data Encryption
  - Audit Trails
  - Fraud Prevention
- Contact Information
  - Grievance Officer: grievance@cvsaathi.com
  - Data Protection Officer: dpo-india@cvsaathi.com

**Location:** `/support/indian-compliance`

---

### 4. **Global Privacy Laws** (International Compliance)
**Sections:**
- GDPR (European Union)
  - Lawful Basis
  - Data Subject Rights
  - Privacy by Design
  - Data Protection Impact Assessments
  - Data Protection Officer
- CCPA (California, USA)
  - Right to Know
  - Right to Delete
  - Right to Opt-Out
  - Non-Discrimination
  - Authorized Agent
- COPPA (USA)
  - Age Verification
  - Parental Consent
  - Limited Data Collection
  - Secure Storage
- PIPEDA (Canada)
  - Consent
  - Purpose Limitation
  - Individual Access
  - Safeguards

**Location:** `/support/global-compliance`

---

### 5. **Data Protection Measures** (Security Details)
**Sections:**
- Encryption
  - Data in Transit: TLS 1.3
  - Data at Rest: AES-256
  - End-to-End Encryption
  - Key Management
- Access Controls
  - Multi-Factor Authentication
  - Role-Based Access
  - Regular Audits
  - Zero Trust
- Infrastructure Security
  - Secure Hosting
  - Network Security
  - Regular Updates
  - Backup Systems
- Monitoring & Incident Response
  - 24/7 Monitoring
  - Incident Response
  - Breach Notification
  - Security Testing
- Contact: security@cvsaathi.com

**Location:** `/support/data-protection`

---

### 6. **Data Retention Policy** (Detailed Retention Periods)
**Sections:**
- Account Data
  - Profile Information: While account active
  - Login Credentials: Until account deletion
  - Preferences: While account active
  - Contact Information: While account active
- Resume & Career Data
  - Resume Content: While account active
  - Interview Sessions: 2 years after last session
  - Skill Analyses: 3 years for improvement tracking
  - Career Goals: While account active
- Usage Data
  - App Usage Logs: 1 year for analytics
  - Performance Data: 6 months
  - Error Logs: 3 months
  - Analytics Data: Aggregated and anonymized after 1 year
- Payment Data
  - Transaction Records: 7 years (legal requirement)
  - Payment Methods: While subscription active
  - Billing History: 7 years
  - Refund Records: 7 years
- Communication Data
  - Support Tickets: 2 years after resolution
  - Feedback: 3 years for product improvement
  - Marketing Communications: Until opt-out
  - Legal Communications: 7 years
- Automatic Deletion
  - Inactive Accounts: 3 years of inactivity
  - Account Deletion: 30 days
  - Retention Expiry: Automatic deletion
  - Legal Hold: Extended if legally required

**Location:** `/support/data-retention`

---

### 7. **Your Data Rights** (GDPR & DPDP Act Rights)
**Sections:**
- Right to Access
- Right to Rectification
- Right to Erasure (Right to be Forgotten)
- Right to Data Portability
- Right to Restrict Processing
- Right to Object
- How to Exercise Rights
  - Contact: privacy@cvsaathi.com
  - In-app features: "Download My Data" and "Delete Account"

**Location:** `/support/data-rights`

---

### 8. **Grievance Officer** (India Compliance)
**Content:**
- Contact Information
  - Grievance Officer: grievance@cvsaathi.com
  - Data Protection Officer: dpo-india@cvsaathi.com
- Response Time Commitment
- How to File a Grievance

**Location:** `/support/grievance-officer`

---

### 9. **Cookie Policy** (Separate Page)
**Content:**
- What are Cookies
- Types of Cookies We Use
- How We Use Cookies
- Managing Cookies
- Third-Party Cookies

**Location:** `/support/cookie-policy`

---

## 🗂️ Proposed Structure

### Option 1: Flat Structure (All in Support)
```
/support/
  ├── privacy-policy          (Main comprehensive Privacy Policy)
  ├── terms-of-use            (Complete Terms of Service)
  ├── cookie-policy           (Cookie Policy)
  ├── indian-compliance       (Indian Privacy Compliance)
  ├── global-compliance       (Global Privacy Laws)
  ├── data-protection         (Data Protection Measures)
  ├── data-retention          (Data Retention Policy)
  ├── data-rights             (Your Data Rights)
  ├── grievance-officer       (Grievance Officer Contact)
  └── refunds                 (Refunds & Cancellations)
```

### Option 2: Hierarchical Structure
```
/support/
  ├── privacy/
  │   ├── privacy-policy
  │   ├── indian-compliance
  │   ├── global-compliance
  │   ├── data-protection
  │   ├── data-retention
  │   └── data-rights
  ├── legal/
  │   ├── terms-of-use
  │   └── cookie-policy
  └── contact/
      ├── grievance-officer
      └── refunds
```

### Option 3: Combined Approach (Recommended)
```
/support/
  ├── privacy-policy          (Main page with links to sub-sections)
  │   ├── Section: Indian Compliance (link to /support/indian-compliance)
  │   ├── Section: Global Compliance (link to /support/global-compliance)
  │   ├── Section: Data Rights (link to /support/data-rights)
  │   └── Section: Data Protection (link to /support/data-protection)
  ├── terms-of-use            (Complete Terms of Service)
  ├── cookie-policy           (Cookie Policy)
  ├── indian-compliance      (Dedicated Indian Compliance page)
  ├── global-compliance       (Dedicated Global Compliance page)
  ├── data-protection         (Dedicated Data Protection page)
  ├── data-retention          (Dedicated Data Retention page)
  ├── data-rights             (Dedicated Data Rights page)
  ├── grievance-officer       (Grievance Officer page)
  └── refunds                 (Refunds & Cancellations)
```

---

## 🎯 Recommended Approach

**I recommend Option 3 (Combined Approach)** because:

1. **Main Privacy Policy** serves as the entry point with all key sections
2. **Dedicated pages** for complex topics (Indian Compliance, Data Rights, etc.)
3. **Easy navigation** - Users can read the main policy or dive deep into specific topics
4. **SEO friendly** - Each topic has its own URL
5. **Regulatory compliance** - All required information is accessible and clearly organized

---

## 📝 Footer Links Update

**Column 4 – Support & Legal** should link to:
- Help Center → `/support/help-center`
- FAQ → `#faq` (scrolls to FAQ section on landing page)
- Data & Privacy Policy → `/support/privacy-policy`
- Terms of Use → `/support/terms-of-use`
- Cookie Policy → `/support/cookie-policy`
- Refunds & Cancellations → `/support/refunds`
- Grievance Officer → `/support/grievance-officer`

**Additional links** (can be added to Privacy Policy page or footer):
- Indian Privacy Compliance → `/support/indian-compliance`
- Global Privacy Laws → `/support/global-compliance`
- Data Protection Measures → `/support/data-protection`
- Data Retention Policy → `/support/data-retention`
- Your Data Rights → `/support/data-rights`

---

## ✅ Implementation Checklist

- [ ] Create comprehensive Privacy Policy page
- [ ] Create complete Terms of Service page
- [ ] Create Indian Privacy Compliance page
- [ ] Create Global Privacy Laws page
- [ ] Create Data Protection Measures page
- [ ] Create Data Retention Policy page
- [ ] Create Your Data Rights page
- [ ] Create Grievance Officer page
- [ ] Create Cookie Policy page
- [ ] Create Refunds & Cancellations page
- [ ] Update footer links
- [ ] Add cross-links between related pages
- [ ] Ensure all contact emails are correct
- [ ] Add "Last Updated" dates
- [ ] Make pages printable/exportable (optional)

---

## 🤔 Questions for Discussion

1. **Structure Preference:** Which option do you prefer? (I recommend Option 3)

2. **Navigation:** Should we add a "Legal & Privacy" section in the footer with all these links, or keep them in "Support & Legal"?

3. **Main Privacy Policy:** Should it be one long scrollable page, or should it have anchor links to jump to sections?

4. **Contact Emails:** Are these the correct emails?
   - Grievance Officer: grievance@cvsaathi.com
   - Data Protection Officer: dpo-india@cvsaathi.com
   - Privacy Team: privacy@cvsaathi.com
   - Support: support@cvsaathi.com
   - Security: security@cvsaathi.com
   - Legal: legal@cvsaathi.com

5. **Dates:** What should be the "Effective Date" and "Last Updated" dates?

6. **Additional Pages:** Do you want a separate "Help Center" page, or should FAQ on the landing page suffice?

---

## 🚀 Next Steps

Once you approve the structure, I'll:
1. Create all the regulatory pages with the exact content from your mobile app
2. Update footer links
3. Add proper navigation between related pages
4. Ensure all regulatory requirements are met
5. Make it mobile-responsive and easy to read

**Ready to proceed?** Let me know your preferences and I'll implement everything!

