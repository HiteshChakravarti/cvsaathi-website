# AI Features Inventory - Frontend

## Overview
This document lists all AI features in the frontend, where they're used, and their current implementation status.

---

## 1. AI Companion Chat (Estel) ⭐ PRIMARY

### Location
- **Component**: `src/dashboard/components/AICoachPage.tsx`
- **Route**: `/app/ai-coach`
- **Service**: `src/services/aiCareerService.ts`
- **Hook**: `src/hooks/useAIConversations.ts`

### Features
✅ **Fully Implemented**
- Real-time chat with AI companion "Estel"
- Conversation history saved to `ai_chat_conversations` table
- Create new conversations
- Delete conversations
- Message persistence
- Quick prompts (6 predefined)
- Loading states
- Error handling

### Current Implementation
- Uses `AICareerService.sendMessage()` directly
- Saves messages to database in real-time
- Edge function: `ai-career-companion`
- **Status**: ✅ **WORKING** (confirmed by tests)

### Code Flow
```
User sends message
  → AICoachPage.handleSend()
  → aiService.sendMessage()
  → Edge Function: ai-career-companion
  → Response saved to database
  → Displayed in chat UI
```

---

## 2. Resume Builder AI Features

### Location
- **Component**: `src/dashboard/components/ResumeBuilderPage.tsx`
- **Route**: `/app/resume-builder`
- **Service**: Currently using **MOCK** implementation

### AI Features in Resume Builder

#### 2.1 AI Summary Generation
- **Location**: Line ~240-252
- **Function**: `generateWithAI('summary', context)`
- **Status**: ⚠️ **MOCK** - Returns hardcoded text
- **UI**: "AI Generate" button in Summary step

#### 2.2 AI Headline Generation
- **Location**: Line ~254-256
- **Function**: `generateWithAI('headline', context)`
- **Status**: ⚠️ **MOCK** - Returns hardcoded text
- **UI**: "AI Generate" button in Personal Info step

#### 2.3 AI Bullet Point Generation
- **Location**: Line ~258-260
- **Function**: `generateWithAI('bullet', context)`
- **Status**: ⚠️ **MOCK** - Returns hardcoded text
- **UI**: "AI Generate Bullet" button in Experience section

#### 2.4 AI Project Description
- **Location**: Line ~262-264
- **Function**: `generateWithAI('project-description', context)`
- **Status**: ⚠️ **MOCK** - Returns hardcoded text
- **UI**: In Projects section

#### 2.5 AI Resume Critique
- **Location**: Line ~1704 (critique step)
- **Function**: `generateCritique()`
- **Status**: ⚠️ **MOCK** - Calculates ATS score but no real AI analysis
- **UI**: "Analyze Resume" button in Critique step

### Current Implementation
```typescript
// Currently MOCK - needs real AI integration
const generateWithAI = async (type: string, context?: any) => {
  // Simulates AI with setTimeout
  await new Promise(resolve => setTimeout(resolve, 2000));
  // Returns hardcoded text based on type
}
```

### Needs Integration
- Should use `AICareerService.getResumeInsights()` for critique
- Should use `AICareerService.sendMessage()` for content generation
- Edge function: `ai-career-companion`

---

## 3. Interview Prep AI Features

### Location
- **Component**: `src/dashboard/components/AIInterviewPrepPage.tsx`
- **Route**: `/app/interview-prep`
- **Service**: Currently using **MOCK** implementation

### AI Features in Interview Prep

#### 3.1 AI Feedback Generation
- **Location**: Line ~440-472
- **Function**: `generateFeedback()` (local function)
- **Status**: ⚠️ **MOCK** - Calculates score but no real AI feedback
- **UI**: "Get AI Feedback" button after answering question

#### 3.2 AI Question Analysis
- **Location**: Not implemented
- **Status**: ❌ **NOT IMPLEMENTED**
- **Potential**: Could use `AICareerService.analyzeBehavioralQuestion()`

### Current Implementation
```typescript
// Currently MOCK - generates feedback based on answer length
const generateFeedback = (answer: string, question: Question) => {
  const score = Math.min(100, Math.max(40, answer.length / 10));
  // Returns hardcoded feedback structure
}
```

### Needs Integration
- Should use `AICareerService.analyzeBehavioralQuestion()` for detailed analysis
- Should use `AICareerService.sendMessage()` for personalized feedback
- Edge function: `ai-career-companion`

---

## 4. ATS Checker AI Features

### Location
- **Component**: `src/dashboard/components/ATSCheckerPage.tsx`
- **Route**: `/app/ats-checker`
- **Service**: Not using AI service currently

### AI Features in ATS Checker

#### 4.1 AI Recommendations
- **Location**: Line ~709
- **Status**: ⚠️ **UI EXISTS** but no AI integration
- **UI**: "Estel's AI Recommendations" section

### Needs Integration
- Should use `AICareerService.getResumeInsights()` for ATS analysis
- Edge function: `ai-career-companion`

---

## 5. Skill Gap Analysis AI Features

### Location
- **Component**: `src/dashboard/components/SkillGapAnalysisPage.tsx`
- **Route**: `/app/skill-gap`
- **Service**: Not using AI service currently

### AI Features in Skill Gap Analysis

#### 5.1 AI Skill Recommendations
- **Status**: ❌ **NOT IMPLEMENTED**
- **Potential**: Could use `AICareerService.sendMessage()` for personalized skill recommendations

---

## 6. Landing Page AI Mentions

### Location
- **Component**: `src/components/EstelCompanion.tsx`
- **Route**: `/` (Landing page)
- **Purpose**: Marketing/Information only

### Features
- Estel mascot display
- AI companion description
- No actual AI functionality (just UI)

---

## Summary Table

| Feature | Component | Status | Edge Function | Database |
|---------|-----------|--------|---------------|----------|
| **AI Companion Chat** | AICoachPage | ✅ **WORKING** | ✅ ai-career-companion | ✅ ai_chat_conversations |
| Resume Summary Gen | ResumeBuilderPage | ⚠️ **MOCK** | ❌ Not connected | ❌ Not saved |
| Resume Headline Gen | ResumeBuilderPage | ⚠️ **MOCK** | ❌ Not connected | ❌ Not saved |
| Resume Bullet Gen | ResumeBuilderPage | ⚠️ **MOCK** | ❌ Not connected | ❌ Not saved |
| Resume Critique | ResumeBuilderPage | ⚠️ **MOCK** | ❌ Not connected | ❌ Not saved |
| Interview Feedback | AIInterviewPrepPage | ⚠️ **MOCK** | ❌ Not connected | ✅ interview_sessions |
| ATS Recommendations | ATSCheckerPage | ⚠️ **UI ONLY** | ❌ Not connected | ❌ Not saved |
| Skill Recommendations | SkillGapAnalysisPage | ❌ **NOT IMPLEMENTED** | ❌ Not connected | ❌ Not saved |

---

## Services Available

### 1. AICareerService
**File**: `src/services/aiCareerService.ts`

**Methods**:
- `sendMessage(message, context, language)` - ✅ Used in AICoachPage
- `analyzeBehavioralQuestion(question, userBackground, language)` - ❌ Not used
- `getResumeInsights(resumeData, language)` - ❌ Not used

### 2. useAICareerService Hook
**File**: `src/services/aiCareerService.ts` (lines 204-257)

**Features**:
- Wraps AICareerService with `useAICallGuard`
- Checks subscription limits
- Tracks usage
- **Status**: ❌ **NOT USED** - AICoachPage uses service directly

---

## Recommendations

### Priority 1: Resume Builder AI Integration
1. Replace `generateWithAI()` mock with real `AICareerService.sendMessage()`
2. Add context about resume section being edited
3. Save AI-generated content to resume data
4. Show loading states during generation

### Priority 2: Interview Prep AI Integration
1. Replace `generateFeedback()` mock with `AICareerService.analyzeBehavioralQuestion()`
2. Use actual question and user answer for analysis
3. Save detailed feedback to interview session

### Priority 3: ATS Checker AI Integration
1. Use `AICareerService.getResumeInsights()` for analysis
2. Display real AI recommendations
3. Save analysis results

### Priority 4: Use Guarded Service Hook
1. Update AICoachPage to use `useAICareerService()` instead of direct service
2. This will add subscription checks and usage tracking
3. Better error handling for plan limits

---

## Edge Function Details

**Function Name**: `ai-career-companion`
**URL**: `{SUPABASE_URL}/functions/v1/ai-career-companion`
**Status**: ✅ **WORKING** (confirmed by tests)

**Request Format**:
```json
{
  "message": "User message",
  "context": {
    "language": "en",
    "contextType": "resume" | "interview" | "general",
    "contextData": {}
  }
}
```

**Response Format**:
```json
{
  "items": [
    {
      "id": "unique-id",
      "type": "message" | "suggestion",
      "content": "AI response text"
    }
  ]
}
```

---

## Next Steps for Discussion

1. **Which AI features should we prioritize?**
   - Resume Builder AI generation?
   - Interview Prep feedback?
   - ATS Checker recommendations?

2. **Should we use the guarded service hook everywhere?**
   - Adds subscription checks
   - Tracks usage automatically
   - Better error handling

3. **What context should we send to AI?**
   - User profile data?
   - Resume sections?
   - Interview question details?

4. **How should we handle AI generation states?**
   - Loading indicators?
   - Error recovery?
   - Retry mechanisms?

