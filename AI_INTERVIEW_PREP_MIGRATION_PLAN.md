# AI-Powered Interview Prep - Migration Plan

## 📊 Complexity Assessment

### Overall Complexity: **MEDIUM** (4-6 hours total)

**Why it's manageable:**
- ✅ Edge function already exists and handles AI calls
- ✅ Frontend already has interview prep UI structure
- ✅ Database tables already support session storage
- ✅ AI service pattern already established

**Why it needs planning:**
- ⚠️ Need to coordinate frontend ↔ backend response format
- ⚠️ State management needs refactoring
- ⚠️ UI flow needs updates (but structure exists)

---

## 🎯 Current State Analysis

### What We Have:
1. **Edge Function**: `ai-career-companion` - handles AI requests with context
2. **Frontend**: `AIInterviewPrepPage.tsx` - full UI with preset questions
3. **Database**: `interview_sessions` table - stores sessions
4. **Hooks**: `useInterviewSessions` - manages session CRUD
5. **AI Service**: `AICareerService` - calls edge function
6. **Questions**: Currently from `interview_questions` table (1000+ questions)

### What Needs to Change:
1. **Edge Function**: Add `interview_session` context handler
2. **Frontend**: Replace preset question flow with AI-driven session
3. **State Management**: Track session state, current turn, AI responses
4. **UI Flow**: Update to show AI questions and feedback dynamically

---

## 🔄 Migration Strategy

### Phase 1: Backend (Edge Function) - **YOUR PART** ⏱️ 2-3 hours

#### Task 1.1: Add Interview Session Handler
**File**: Edge function `ai-career-companion`

**What to add:**
```typescript
// In your edge function handler
if (contextType === 'interview_session') {
  const result = await handleInterviewSession({
    message,
    language,
    meta: context.meta,
    sessionState: context.session_state ?? null,
  });
  
  return new Response(JSON.stringify({
    brain: 'estel',
    mode: 'interview_session',
    status: 'success',
    payload: result,
  }), { headers: corsHeaders });
}
```

**Complexity**: ⭐⭐ (Medium)
- Need to add handler function
- Need to build system prompt
- Need to parse/validate JSON response

#### Task 1.2: Build System Prompt
**What to create:**
- System prompt that defines Estel as interviewer
- JSON schema enforcement
- Interview flow logic (intro → questions → feedback)
- Language support (English, Hinglish later)

**Complexity**: ⭐⭐⭐ (Medium-High)
- Prompt engineering for consistent JSON
- Interview logic in prompt
- Score tracking logic

#### Task 1.3: Response Format
**What to define:**
```typescript
type InterviewTurnResponse = {
  type: 'interview_turn';
  session_state: InterviewSessionState;
  payload: InterviewQuestionPayload | InterviewFeedbackPayload;
};
```

**Complexity**: ⭐ (Low)
- Just type definitions
- Match frontend expectations

---

### Phase 2: Frontend - **MY PART** ⏱️ 2-3 hours

#### Task 2.1: Create Type Definitions
**File**: `src/types/interview.ts` (NEW)

**What to create:**
- `InterviewMeta` - role, experience, difficulty, language
- `InterviewSessionState` - phase, index, scores, transcript
- `InterviewTurnPayload` - question or feedback
- `InterviewTurnResponse` - full response from edge function

**Complexity**: ⭐ (Low)
- Just TypeScript types
- Copy from plan document

#### Task 2.2: Update AI Service
**File**: `src/services/aiCareerService.ts`

**What to add:**
```typescript
async startInterviewSession(meta: InterviewMeta): Promise<InterviewTurnResponse>
async submitInterviewAnswer(answer: string, sessionState: InterviewSessionState): Promise<InterviewTurnResponse>
```

**Complexity**: ⭐⭐ (Low-Medium)
- Wrap existing edge function calls
- Handle response parsing
- Error handling

#### Task 2.3: Refactor Interview Prep Page
**File**: `src/dashboard/components/AIInterviewPrepPage.tsx`

**What to change:**
1. **Remove**: Preset question logic, `QUESTION_BANK`, `useInterviewQuestions` dependency
2. **Add**: Session state management (`sessionState`, `currentPayload`)
3. **Update**: `startInterview()` - call AI service instead of filtering questions
4. **Update**: `submitAnswer()` - send to AI, get next question/feedback
5. **Update**: UI rendering - show AI question or feedback based on `currentPayload.kind`

**Complexity**: ⭐⭐⭐ (Medium)
- Significant refactoring but structure exists
- Need to update state management
- Need to update UI conditionally

#### Task 2.4: Update Session Saving
**File**: `src/hooks/useInterviewSessions.ts`

**What to update:**
- Save session state to database after each turn (optional - can be frontend-only)
- Save final feedback when interview ends
- Map AI response format to database format

**Complexity**: ⭐⭐ (Low-Medium)
- Database structure already supports it
- Just need to map AI response to DB format

---

## 📋 Detailed Task Breakdown

### BACKEND TASKS (Your Part)

#### ✅ Task B1: Edge Function Handler (1-2 hours)
**File**: Your edge function

**Steps:**
1. Add `if (contextType === 'interview_session')` branch
2. Create `handleInterviewSession()` function
3. Build system prompt (copy from plan)
4. Call OpenAI with JSON mode
5. Parse and return response

**Dependencies**: None (uses existing edge function structure)

**Testing**: 
- Test with Postman/curl
- Verify JSON response format
- Check error handling

---

#### ✅ Task B2: System Prompt (1 hour)
**File**: Inside edge function handler

**Steps:**
1. Copy system prompt from plan
2. Customize for your model (GPT-4o-mini)
3. Test prompt with sample inputs
4. Verify JSON output format

**Dependencies**: Task B1

**Testing**:
- Test first turn (session_state = null)
- Test subsequent turns (with session_state)
- Test end of interview (feedback payload)

---

### FRONTEND TASKS (My Part)

#### ✅ Task F1: Type Definitions (15 mins)
**File**: `src/types/interview.ts` (NEW)

**Steps:**
1. Create file with all TypeScript types
2. Export types for use in components

**Dependencies**: None

---

#### ✅ Task F2: AI Service Methods (30 mins)
**File**: `src/services/aiCareerService.ts`

**Steps:**
1. Add `startInterviewSession(meta)` method
2. Add `submitInterviewAnswer(answer, sessionState)` method
3. Handle response parsing
4. Add error handling

**Dependencies**: Task F1 (types)

---

#### ✅ Task F3: Refactor Interview Page (2 hours)
**File**: `src/dashboard/components/AIInterviewPrepPage.tsx`

**Steps:**
1. Remove preset question logic
2. Add session state hooks
3. Update `startInterview()` to call AI service
4. Update `submitAnswer()` to call AI service
5. Update UI to show AI questions/feedback
6. Add loading states
7. Add error handling

**Dependencies**: Task F1, F2

**Complexity**: This is the main work

---

#### ✅ Task F4: Session Persistence (30 mins)
**File**: `src/hooks/useInterviewSessions.ts` + `AIInterviewPrepPage.tsx`

**Steps:**
1. Save session to DB when interview starts
2. Update session after each turn (optional - can be frontend-only)
3. Save final feedback when interview ends
4. Map AI response to database format

**Dependencies**: Task F3

---

## ⏱️ Time Estimate

### Backend (Your Part):
- **Task B1**: 1-2 hours
- **Task B2**: 1 hour
- **Testing**: 30 mins
- **Total**: **2.5-3.5 hours**

### Frontend (My Part):
- **Task F1**: 15 mins
- **Task F2**: 30 mins
- **Task F3**: 2 hours
- **Task F4**: 30 mins
- **Testing**: 30 mins
- **Total**: **3.5-4 hours**

### Combined Total: **6-7.5 hours**

**Can we do it today?** 
- ✅ **YES** if we work in parallel
- ✅ Backend can be done independently
- ✅ Frontend can start after types are defined
- ⚠️ Need to coordinate response format before final integration

---

## 🔗 Dependencies & Coordination Points

### Critical Coordination:
1. **Response Format**: Need to agree on exact JSON structure before starting
2. **Error Handling**: How to handle AI failures, timeouts, invalid JSON
3. **Session State**: What to store in DB vs keep in frontend only

### Dependency Flow:
```
Backend (You):
  B1 (Handler) → B2 (Prompt) → Testing

Frontend (Me):
  F1 (Types) → F2 (Service) → F3 (Page) → F4 (DB) → Testing

Integration:
  Backend ready → Frontend ready → Test together → Fix issues
```

---

## 🎯 Response Format Agreement

### What Frontend Expects:

```typescript
// First turn (start interview)
{
  brain: 'estel',
  mode: 'interview_session',
  status: 'success',
  payload: {
    type: 'interview_turn',
    session_state: {
      phase: 'intro',
      question_index: 0,
      total_questions: 8,
      score_so_far: { communication: 0, content: 0, confidence: 0 },
      transcript: [],
      meta: { target_role: '...', experience_level: '...', ... }
    },
    payload: {
      kind: 'question',
      end_of_interview: false,
      question_id: 'intro_1',
      question: 'Tell me about yourself...',
      topic: 'introduction',
      difficulty: 'medium',
      phase: 'intro',
      helper_hint: 'Focus on...' // optional
    }
  }
}

// Subsequent turns (answer submitted)
// Same structure, but session_state updated, new question in payload

// Final turn (interview ends)
{
  // ... same envelope
  payload: {
    kind: 'feedback',
    end_of_interview: true,
    summary: '...',
    strengths: ['...'],
    improvements: ['...'],
    scores: { communication: 7, content: 6, confidence: 7, overall: 6 },
    skill_gaps: ['SQL basics', '...'],
    next_steps: ['...']
  }
}
```

### What Backend Should Return:
- ✅ Exact same structure as above
- ✅ Always valid JSON
- ✅ `status: 'success'` or `status: 'error'`
- ✅ Error messages in `message` field if status is error

---

## 🚨 Risks & Mitigation

### Risk 1: AI Returns Invalid JSON
**Mitigation**: 
- Use `response_format: { type: "json_object" }` in OpenAI call
- Add JSON validation in edge function
- Return error response if JSON invalid

### Risk 2: AI Doesn't Follow Schema
**Mitigation**:
- Strong system prompt with schema
- Validate response structure in edge function
- Fallback to error response

### Risk 3: Session State Gets Too Large
**Mitigation**:
- Keep transcript in session_state (needed for context)
- Can truncate old questions if needed
- Store in DB periodically, not every turn

### Risk 4: Frontend/Backend Mismatch
**Mitigation**:
- Agree on response format first
- Share TypeScript types
- Test with sample responses

---

## ✅ Success Criteria

### Backend:
- [ ] Edge function handles `interview_session` context
- [ ] Returns valid JSON matching schema
- [ ] Handles first turn (null session_state)
- [ ] Handles subsequent turns (with session_state)
- [ ] Returns feedback when interview ends
- [ ] Error handling works

### Frontend:
- [ ] Can start interview with meta (role, experience, etc.)
- [ ] Shows AI-generated questions one at a time
- [ ] Can submit answers and get next question
- [ ] Shows final feedback with scores
- [ ] Saves session to database
- [ ] Error handling and loading states work

### Integration:
- [ ] End-to-end flow works
- [ ] Questions are relevant to role/experience
- [ ] Feedback is useful
- [ ] No console errors
- [ ] Performance is acceptable

---

## 🚀 Execution Plan

### Step 1: Agreement (15 mins)
- [ ] Review this plan together
- [ ] Agree on response format
- [ ] Confirm time estimates
- [ ] Decide on error handling approach

### Step 2: Parallel Work
**You (Backend):**
- [ ] Implement edge function handler
- [ ] Build system prompt
- [ ] Test with sample requests

**Me (Frontend):**
- [ ] Create type definitions
- [ ] Add AI service methods
- [ ] Start refactoring interview page

### Step 3: Integration (1 hour)
- [ ] Connect frontend to backend
- [ ] Test end-to-end flow
- [ ] Fix any mismatches
- [ ] Polish error handling

### Step 4: Testing & Polish (30 mins)
- [ ] Test different roles/experience levels
- [ ] Test error scenarios
- [ ] Verify database saving
- [ ] UI polish

---

## 📝 Questions to Discuss

1. **Session State Storage**: 
   - Store in DB after each turn? Or only at end?
   - Keep full transcript in frontend only?

2. **Error Recovery**:
   - If AI fails mid-interview, allow resume?
   - Or restart from beginning?

3. **Question Count**:
   - Fixed number (e.g., 8 questions)?
   - Or AI decides when to end?

4. **Language Support**:
   - Start with English only?
   - Or include Hinglish from start?

5. **Audio Recording**:
   - Keep audio recording feature?
   - Or remove for now (text-only)?

---

## 🎯 Recommendation

**Start with MVP:**
1. ✅ English only
2. ✅ Fixed question count (8 questions)
3. ✅ Text answers only (no audio for now)
4. ✅ Store session only at end (not every turn)
5. ✅ Simple error handling (restart on failure)

**Then enhance:**
- Add Hinglish support
- Add audio recording
- Add session resume
- Add AI-determined question count

---

## ✅ Ready to Proceed?

**If you agree:**
1. I'll create the type definitions (F1)
2. You start on edge function handler (B1)
3. We coordinate on response format
4. I'll implement frontend (F2, F3, F4)
5. We test together

**Estimated completion**: Today if we work in parallel! 🚀

