# AI-Powered Interview Prep - Migration Plan V2 (Refined)

## ✅ Plan Confirmation

**Status**: Plan is aligned with architecture and Estel "learning brain" model.

**Key Points Confirmed**:
- ✅ Pure AI-run interview session powered by Estel
- ✅ New `interview_session` context in Edge function
- ✅ Frontend moves from preset questions → AI-driven turns
- ✅ Clear `InterviewTurnResponse` contract
- ✅ Optional DB persistence (not blocking core loop)

---

## 🔧 Refinements Applied

### 1. Explicit Brain Envelope (Reusable Pattern)

**File**: `src/types/brain.ts` (NEW)

```typescript
// Generic brain envelope for all Estel features
export type BrainEnvelope<TPayload> = {
  brain: 'estel';                         // for interview, resume, chat etc.
  mode: 'interview_session' | 'chat' | 'resume_review' | string;
  status: 'success' | 'error';
  message?: string;                       // for error / warnings
  payload?: TPayload;                     // main data
};

// For interview specifically
export type EstelInterviewEnvelope = BrainEnvelope<InterviewTurnResponse>;
```

**Why**: Ensures consistency across all Estel features (chat, resume, interview, etc.)

---

### 2. Locked Request Shape

**Frontend will send exactly this:**

#### First Turn (Start Interview):
```json
{
  "message": "",
  "language": "en",
  "context": {
    "context": "interview_session",
    "meta": {
      "target_role": "Business Analyst",
      "experience_level": "0-2 years",
      "difficulty": "standard",
      "questions_target": 8
    },
    "session_state": null
  }
}
```

#### Subsequent Turns (Answering):
```json
{
  "message": "My answer to the last question...",
  "language": "en",
  "context": {
    "context": "interview_session",
    "meta": {
      "target_role": "Business Analyst",
      "experience_level": "0-2 years",
      "difficulty": "standard",
      "questions_target": 8
    },
    "session_state": {
      /* last session_state from AI response */
    }
  }
}
```

---

### 3. Final InterviewTurnResponse Contract

**File**: `src/types/interview.ts` (NEW)

```typescript
export type InterviewPhase = 'intro' | 'behavioural' | 'technical' | 'wrap_up';

export type InterviewMeta = {
  target_role: string;
  experience_level: string;
  difficulty: 'easy' | 'standard' | 'hard';
  questions_target: number;
};

export type InterviewTranscriptItem = {
  question_id: string;
  question: string;
  answer?: string;
  topic: string;
};

export type InterviewSessionState = {
  phase: InterviewPhase;
  question_index: number;
  total_questions: number;
  score_so_far: {
    communication: number;
    content: number;
    confidence: number;
  };
  transcript: InterviewTranscriptItem[];
  meta: InterviewMeta;
};

export type InterviewQuestionPayload = {
  kind: 'question';
  end_of_interview: false;
  question_id: string;
  question: string;
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
  phase: InterviewPhase;
  helper_hint?: string;
};

export type InterviewFeedbackPayload = {
  kind: 'feedback';
  end_of_interview: true;
  summary: string;
  strengths: string[];
  improvements: string[];
  scores: {
    communication: number;
    content: number;
    confidence: number;
    overall: number;
  };
  skill_gaps?: string[];
  next_steps?: string[];
};

export type InterviewTurnPayload =
  | InterviewQuestionPayload
  | InterviewFeedbackPayload;

export type InterviewTurnResponse = {
  type: 'interview_turn';
  session_state: InterviewSessionState;
  payload: InterviewTurnPayload;
};
```

---

### 4. Edge Function Branch (Refined)

**Backend Implementation**:

```typescript
if (contextType === 'interview_session') {
  try {
    const result = await handleInterviewSession({
      message,
      language,
      meta: context.meta,
      sessionState: context.session_state ?? null,
    });

    const responseBody: BrainEnvelope<InterviewTurnResponse> = {
      brain: 'estel',
      mode: 'interview_session',
      status: 'success',
      payload: result,
    };

    return new Response(JSON.stringify(responseBody), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    const errorBody: BrainEnvelope<null> = {
      brain: 'estel',
      mode: 'interview_session',
      status: 'error',
      message: 'Interview session failed. Please try again.',
    };

    return new Response(JSON.stringify(errorBody), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}
```

**Key Requirements**:
- ✅ Use `response_format: { type: 'json_object' }` in OpenAI call
- ✅ Wrap parsing in try/catch
- ✅ Return structured error envelope on failure

---

### 5. DB Persistence Strategy (V1)

**Must Have**:
- ✅ Save final summary + scores + skill_gaps at end of interview
- ✅ Store in `interview_sessions` table

**Nice to Have** (Future):
- ⏳ Per-turn transcript saving
- ⏳ Resume/resume-later functionality
- ⏳ Session history with full transcript

**Implementation**: Don't block rollout on heavy DB integration. Keep it simple for v1.

---

## 📋 Updated Task Breakdown

### BACKEND TASKS (Your Part) - 2.5-3.5 hours

#### ✅ Task B1: Edge Function Handler (1.5-2 hours)
1. Add `if (contextType === 'interview_session')` branch
2. Create `handleInterviewSession()` function
3. Use exact request/response shapes above
4. Implement error handling with `BrainEnvelope<null>`
5. Use `response_format: { type: 'json_object' }` in OpenAI call

#### ✅ Task B2: System Prompt (1 hour)
1. Build system prompt for Estel as interviewer
2. Enforce JSON schema strictly
3. Test with sample inputs
4. Verify JSON output format

#### ✅ Task B3: Testing (30 mins)
1. Test first turn (null session_state)
2. Test subsequent turns (with session_state)
3. Test end of interview (feedback payload)
4. Test error scenarios

---

### FRONTEND TASKS (My Part) - 3.5-4 hours

#### ✅ Task F1: Type Definitions (20 mins)
**File**: `src/types/brain.ts` (NEW) + `src/types/interview.ts` (NEW)

1. Create `BrainEnvelope<T>` generic type
2. Create all interview types (exact contract above)
3. Export `EstelInterviewEnvelope` type

#### ✅ Task F2: AI Service Methods (30 mins)
**File**: `src/services/aiCareerService.ts`

1. Add `startInterviewSession(meta: InterviewMeta): Promise<EstelInterviewEnvelope>`
2. Add `submitInterviewAnswer(answer: string, sessionState: InterviewSessionState): Promise<EstelInterviewEnvelope>`
3. Handle response parsing
4. Handle error responses (status: 'error')

#### ✅ Task F3: Refactor Interview Page (2 hours)
**File**: `src/dashboard/components/AIInterviewPrepPage.tsx`

**Remove**:
- Preset question logic
- `QUESTION_BANK` constant
- `useInterviewQuestions` dependency
- Question filtering logic

**Add**:
- Session state management (`sessionState`, `currentPayload`)
- Loading states for AI calls
- Error handling for AI failures

**Update**:
- `startInterview()` → calls `startInterviewSession(meta)`
- `submitAnswer()` → calls `submitInterviewAnswer(answer, sessionState)`
- UI rendering → branch on `currentPayload.kind`:
  - `'question'` → show question UI
  - `'feedback'` → show results screen

#### ✅ Task F4: Session Persistence (30 mins)
**File**: `src/hooks/useInterviewSessions.ts` + `AIInterviewPrepPage.tsx`

1. Save session to DB when interview starts (create record)
2. Update session with final feedback when interview ends
3. Map `InterviewFeedbackPayload` to database format
4. Save `skill_gaps` for future Skill Gap Analysis integration

---

## 🔗 Coordination Points

### 1. Response Format Agreement ✅
- **Backend returns**: `BrainEnvelope<InterviewTurnResponse>`
- **Frontend expects**: Same structure
- **Status**: Locked in plan above

### 2. Error Handling ✅
- **Backend**: Returns `BrainEnvelope<null>` with `status: 'error'`
- **Frontend**: Checks `envelope.status` before accessing `payload`
- **Status**: Defined in plan

### 3. Session State Flow ✅
- **Frontend**: Sends `session_state` from last response
- **Backend**: Receives and uses for context
- **Status**: Clear in request shape

---

## 🚨 Supabase Access Discussion

### My Access:
- ❌ **I do NOT have direct access to your Supabase instance**
- ✅ **I can only work with the codebase** (frontend code, types, services)
- ✅ **I can see your existing hooks** (`useInterviewSessions`, etc.) to understand DB structure

### How We Coordinate:

#### Option 1: You Test Backend First (Recommended)
1. **You implement edge function** and test with Postman/curl
2. **You share sample responses** (JSON) with me
3. **I implement frontend** using those samples
4. **We test together** when both are ready

#### Option 2: Mock Responses
1. **I create frontend** with mock `EstelInterviewEnvelope` responses
2. **You implement backend** to match
3. **We swap mocks for real** when ready

#### Option 3: Parallel Development
1. **We agree on exact JSON structure** (done in this plan)
2. **I implement frontend** expecting that structure
3. **You implement backend** returning that structure
4. **We test together** - should work if structures match

---

## 📝 Questions to Finalize

### 1. Language Support
- **MVP**: English only ✅
- **Future**: Hinglish support

### 2. Question Count
- **MVP**: Fixed (8 questions) ✅
- **Future**: AI decides when to end

### 3. Audio Recording
- **MVP**: Text answers only ✅
- **Future**: Add audio recording back

### 4. Session Persistence
- **MVP**: Save only at end ✅
- **Future**: Per-turn saving, resume functionality

### 5. Error Recovery
- **MVP**: Simple restart on failure ✅
- **Future**: Resume from last question

---

## ✅ Execution Plan

### Phase 1: Setup (15 mins)
- [ ] Review and confirm this refined plan
- [ ] Agree on MVP features (all marked ✅ above)
- [ ] Confirm response format is locked

### Phase 2: Parallel Development (3-4 hours)

**You (Backend)**:
- [ ] Implement edge function handler
- [ ] Build system prompt
- [ ] Test with sample requests
- [ ] Share sample response JSON (optional, for my reference)

**Me (Frontend)**:
- [ ] Create type definitions (`brain.ts`, `interview.ts`)
- [ ] Add AI service methods
- [ ] Refactor interview page
- [ ] Add session persistence (end only)

### Phase 3: Integration (1 hour)
- [ ] Connect frontend to backend
- [ ] Test end-to-end flow
- [ ] Fix any mismatches
- [ ] Verify error handling

### Phase 4: Testing & Polish (30 mins)
- [ ] Test different roles/experience levels
- [ ] Test error scenarios
- [ ] Verify database saving
- [ ] UI polish

---

## 🎯 Success Criteria

### Backend:
- [ ] Edge function handles `interview_session` context
- [ ] Returns `BrainEnvelope<InterviewTurnResponse>`
- [ ] Handles first turn (null session_state)
- [ ] Handles subsequent turns (with session_state)
- [ ] Returns feedback when interview ends
- [ ] Error handling returns `BrainEnvelope<null>`

### Frontend:
- [ ] Can start interview with meta
- [ ] Shows AI-generated questions one at a time
- [ ] Can submit answers and get next question
- [ ] Shows final feedback with scores
- [ ] Saves session to database at end
- [ ] Handles errors gracefully

### Integration:
- [ ] End-to-end flow works
- [ ] Questions are relevant to role/experience
- [ ] Feedback is useful
- [ ] Skill gaps saved for future use
- [ ] No console errors

---

## 🚀 Ready to Start?

**If you confirm**:
1. ✅ I'll create the type definitions first (F1)
2. ✅ You can start on edge function handler (B1)
3. ✅ We work in parallel
4. ✅ Estimated completion: Today! 🎉

**Next Step**: Confirm you're ready and I'll start with the type definitions!

