# Backend Implementation Steps - AI Interview Prep

## 📋 Overview

This guide provides step-by-step instructions to add `interview_session` support to your `ai-career-companion` edge function.

**Estimated Time**: 2.5-3.5 hours  
**Prerequisites**: Access to Supabase Edge Functions, OpenAI API key configured

---

## 🎯 Goal

Add a new context type `interview_session` that:
1. Receives interview metadata (role, experience, difficulty)
2. Manages interview session state
3. Generates AI-driven questions dynamically
4. Provides structured feedback at the end
5. Returns responses in `BrainEnvelope<InterviewTurnResponse>` format

---

## 📝 Step-by-Step Implementation

### STEP 1: Understand Current Edge Function Structure ⏱️ 10 mins

**Action**: Review your current `ai-career-companion` edge function

**What to check**:
- [ ] How does it currently handle `contextType`?
- [ ] What's the current request body structure?
- [ ] What's the current response format?
- [ ] Where is the OpenAI API call made?

**Expected structure** (based on your codebase):
```typescript
// Current request
{
  message: string,
  language: string,
  context: {
    context: string,  // 'general', 'resume', 'interview', etc.
    // ... other context data
  }
}

// Current response
{
  items: [
    {
      id: string,
      type: 'message',
      content: string
    }
  ]
}
```

**Checkpoint**: ✅ You understand how your edge function currently works

---

### STEP 2: Add Interview Session Handler Branch ⏱️ 30 mins

**File**: Your `ai-career-companion` edge function

**Action**: Add conditional branch for `interview_session` context

**Code to add** (after you parse `contextType`):

```typescript
// In your main handler, after parsing requestBody
const { message, context } = requestBody;
const language = requestBody.language || 'en';
const contextType = context?.context || context || 'general';

// ADD THIS BRANCH:
if (contextType === 'interview_session') {
  try {
    // Extract interview-specific data
    const meta = context.meta || {};
    const sessionState = context.session_state ?? null;

    // Call interview handler
    const interviewResult = await handleInterviewSession({
      message,
      language,
      meta: {
        target_role: meta.target_role || 'General',
        experience_level: meta.experience_level || '0-2 years',
        difficulty: meta.difficulty || 'standard',
        questions_target: meta.questions_target || 8,
      },
      sessionState,
    });

    // Return in BrainEnvelope format
    const responseBody = {
      brain: 'estel',
      mode: 'interview_session',
      status: 'success',
      payload: interviewResult,
    };

    return new Response(JSON.stringify(responseBody), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Interview session error:', error);
    
    // Return error in BrainEnvelope format
    const errorBody = {
      brain: 'estel',
      mode: 'interview_session',
      status: 'error',
      message: error.message || 'Interview session failed. Please try again.',
    };

    return new Response(JSON.stringify(errorBody), {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    });
  }
}

// Continue with your existing handlers for other context types...
```

**Checkpoint**: ✅ Edge function recognizes `interview_session` context and returns error envelope

**Test**: 
- Send a test request with `context: { context: 'interview_session' }`
- Should return error envelope (since handler doesn't exist yet)

---

### STEP 3: Create Interview Handler Function ⏱️ 45 mins

**File**: Same edge function file (add before main handler)

**Action**: Create `handleInterviewSession` function

**Code to add**:

```typescript
// Add this function BEFORE your main serve() handler

async function handleInterviewSession({
  message,
  language,
  meta,
  sessionState,
}: {
  message: string;
  language: string;
  meta: {
    target_role: string;
    experience_level: string;
    difficulty: 'easy' | 'standard' | 'hard';
    questions_target: number;
  };
  sessionState: any | null;
}): Promise<any> {
  const isFirstTurn = sessionState === null;

  // Build system prompt (we'll create this in next step)
  const systemPrompt = buildInterviewSystemPrompt(meta, language);

  // Prepare user payload
  const userPayload = {
    candidate_answer: isFirstTurn ? null : message,
    session_state: sessionState,
    meta: meta,
    instructions: isFirstTurn
      ? 'Start the mock interview. Initialize session_state, greet briefly, and ask the first question only.'
      : 'Candidate has answered. Update session_state and either ask the next question OR return final feedback if interview is complete.',
  };

  // Get OpenAI API key
  const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
  if (!openAIApiKey) {
    throw new Error('OPENAI_API_KEY is not configured');
  }

  // Call OpenAI
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini', // or whatever model you're using
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: JSON.stringify(userPayload),
        },
      ],
      response_format: { type: 'json_object' }, // CRITICAL: Force JSON output
      max_tokens: 4000,
      temperature: 0.7, // Slightly higher for variety in questions
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  const rawContent = data.choices?.[0]?.message?.content;

  if (!rawContent) {
    throw new Error('No response from OpenAI');
  }

  // Parse JSON response
  let parsedResponse;
  try {
    parsedResponse = JSON.parse(rawContent);
  } catch (parseError) {
    console.error('Failed to parse OpenAI response:', rawContent);
    throw new Error('Invalid JSON response from AI');
  }

  // Validate response structure (basic check)
  if (!parsedResponse.type || !parsedResponse.session_state || !parsedResponse.payload) {
    throw new Error('Invalid response structure from AI');
  }

  return parsedResponse;
}
```

**Checkpoint**: ✅ Handler function exists and calls OpenAI

**Test**: 
- Function compiles without errors
- (Can't test fully until system prompt is added)

---

### STEP 4: Create System Prompt Builder ⏱️ 1 hour

**File**: Same edge function file (add before `handleInterviewSession`)

**Action**: Create `buildInterviewSystemPrompt` function

**Code to add**:

```typescript
// Add this function BEFORE handleInterviewSession

function buildInterviewSystemPrompt(
  meta: {
    target_role: string;
    experience_level: string;
    difficulty: 'easy' | 'standard' | 'hard';
    questions_target: number;
  },
  language: string
): string {
  const languageInstruction = language === 'hi' 
    ? 'Respond in Hindi (हिंदी) where appropriate, but keep JSON keys in English.'
    : language === 'mix'
    ? 'You may use simple English with light Hinglish flavor, but keep JSON keys in English only.'
    : 'Use clear, simple English. Avoid complex vocabulary.';

  return `You are Estel, the AI Career Companion inside the CVSaathi app.

You are now acting as an INTERVIEWER for a mock interview.

The candidate is from India, often from Tier-2 or emerging cities.

You must keep your tone supportive, clear, and non-judgmental.

Avoid difficult English; use simple, understandable language.

${languageInstruction}

**Your job:**
- Run a realistic mock interview for the given TARGET_ROLE: "${meta.target_role}" and EXPERIENCE_LEVEL: "${meta.experience_level}"
- Ask one question at a time
- Decide when to go deeper, when to change topic, and when to end
- Then give structured feedback and skill-gap hints

**You MUST ALWAYS respond with VALID JSON ONLY**, matching this exact schema:

{
  "type": "interview_turn",
  "session_state": {
    "phase": "intro" | "behavioural" | "technical" | "wrap_up",
    "question_index": number (0-based),
    "total_questions": number (approximately ${meta.questions_target}),
    "score_so_far": {
      "communication": number (0-10, running average),
      "content": number (0-10, running average),
      "confidence": number (0-10, running average)
    },
    "transcript": [
      {
        "question_id": "string (unique ID)",
        "question": "string",
        "answer": "string (only if answered)",
        "topic": "string"
      }
    ],
    "meta": {
      "target_role": "${meta.target_role}",
      "experience_level": "${meta.experience_level}",
      "difficulty": "${meta.difficulty}",
      "questions_target": ${meta.questions_target}
    }
  },
  "payload": {
    // EITHER a question:
    "kind": "question",
    "end_of_interview": false,
    "question_id": "string",
    "question": "string",
    "topic": "string",
    "difficulty": "easy" | "medium" | "hard",
    "phase": "intro" | "behavioural" | "technical" | "wrap_up",
    "helper_hint": "string (optional, what interviewer is looking for)"
    
    // OR feedback (when interview ends):
    "kind": "feedback",
    "end_of_interview": true,
    "summary": "string (2-3 sentences)",
    "strengths": ["string", "string", ...],
    "improvements": ["string", "string", ...],
    "scores": {
      "communication": number (1-10),
      "content": number (1-10),
      "confidence": number (1-10),
      "overall": number (1-10)
    },
    "skill_gaps": ["string", "string", ...],
    "next_steps": ["string", "string", ...]
  }
}

**Input you receive** (as JSON in user message):
{
  "candidate_answer": string | null,
  "session_state": object | null,
  "meta": { ... },
  "instructions": string
}

**Behavior rules:**

1. **If session_state is null (first turn):**
   - Initialize a new InterviewSessionState
   - Set total_questions to approximately ${meta.questions_target}
   - Phase should start as "intro"
   - Give a VERY SHORT greeting (1 sentence max) inside the first question's wording
   - Return payload.kind = "question" with the FIRST question only
   - question_index = 0

2. **If session_state is NOT null and interview not complete:**
   - Use candidate_answer + current phase + difficulty + meta.target_role to decide next question
   - Update score_so_far internally (rough sense of communication, content, confidence)
   - Append the last Q and answer to transcript
   - Increment question_index
   - Keep language simple and direct
   - Return payload.kind = "question" with next question

3. **When interview should end (question_index + 1 >= total_questions OR performance is clear):**
   - Instead of a new question, return payload.kind = "feedback"
   - Summarize how candidate did (2-3 sentences)
   - Provide 2-4 strengths
   - Provide 3-6 improvement points with concrete guidance
   - Provide scores from 1-10
   - Provide skill_gaps[] that can be used for Skill Gap Analysis
   - Provide next_steps[] (e.g., "Revise basic joins", "Practice STAR format")

**IMPORTANT:**
- Never include commentary outside the JSON
- Never break JSON structure
- Never include trailing commas
- Always use double quotes for JSON
- For "language" = "mix", you may use simple English with light Hinglish flavor, but keep JSON keys in English only
- Questions should be relevant to ${meta.target_role} role and ${meta.experience_level} experience level
- Difficulty level: ${meta.difficulty} (adjust question complexity accordingly)

**Example first turn response:**
{
  "type": "interview_turn",
  "session_state": {
    "phase": "intro",
    "question_index": 0,
    "total_questions": ${meta.questions_target},
    "score_so_far": { "communication": 0, "content": 0, "confidence": 0 },
    "transcript": [],
    "meta": { "target_role": "${meta.target_role}", "experience_level": "${meta.experience_level}", "difficulty": "${meta.difficulty}", "questions_target": ${meta.questions_target} }
  },
  "payload": {
    "kind": "question",
    "end_of_interview": false,
    "question_id": "intro_1",
    "question": "Hello! Let's start. Can you tell me a bit about yourself and why you're interested in the ${meta.target_role} role?",
    "topic": "introduction",
    "difficulty": "medium",
    "phase": "intro"
  }
}`;
}
```

**Checkpoint**: ✅ System prompt function exists and returns prompt string

**Test**: 
- Function returns a string
- Prompt includes all meta values
- JSON schema is clear

---

### STEP 5: Test First Turn (Start Interview) ⏱️ 30 mins

**Action**: Test the complete flow with a first-turn request

**Test Request** (use Postman, curl, or Supabase Edge Function test):

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

**Expected Response**:

```json
{
  "brain": "estel",
  "mode": "interview_session",
  "status": "success",
  "payload": {
    "type": "interview_turn",
    "session_state": {
      "phase": "intro",
      "question_index": 0,
      "total_questions": 8,
      "score_so_far": {
        "communication": 0,
        "content": 0,
        "confidence": 0
      },
      "transcript": [],
      "meta": {
        "target_role": "Business Analyst",
        "experience_level": "0-2 years",
        "difficulty": "standard",
        "questions_target": 8
      }
    },
    "payload": {
      "kind": "question",
      "end_of_interview": false,
      "question_id": "intro_1",
      "question": "Hello! Let's start. Can you tell me a bit about yourself...",
      "topic": "introduction",
      "difficulty": "medium",
      "phase": "intro"
    }
  }
}
```

**Checklist**:
- [ ] Request is accepted (no 400/500 errors)
- [ ] Response has `brain: 'estel'` and `mode: 'interview_session'`
- [ ] Response has `status: 'success'`
- [ ] `payload.session_state` exists and has correct structure
- [ ] `payload.payload.kind === 'question'`
- [ ] Question is relevant to role and experience level
- [ ] JSON is valid (can be parsed)

**If errors occur**:
- Check OpenAI API key is set
- Check model name is correct
- Check JSON parsing in handler
- Check system prompt format
- Review console logs for errors

**Checkpoint**: ✅ First turn works and returns valid question

---

### STEP 6: Test Subsequent Turn (Answer Question) ⏱️ 30 mins

**Action**: Test answering a question and getting the next one

**Test Request** (use `session_state` from Step 5 response):

```json
{
  "message": "I'm a recent graduate with a degree in Business Administration. I've always been interested in analyzing data and solving business problems. During my studies, I worked on several projects where I analyzed market trends and created reports. I'm excited about this role because it combines my analytical skills with the opportunity to work with real business challenges.",
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
      "phase": "intro",
      "question_index": 0,
      "total_questions": 8,
      "score_so_far": {
        "communication": 0,
        "content": 0,
        "confidence": 0
      },
      "transcript": [],
      "meta": {
        "target_role": "Business Analyst",
        "experience_level": "0-2 years",
        "difficulty": "standard",
        "questions_target": 8
      }
    }
  }
}
```

**Expected Response**:

```json
{
  "brain": "estel",
  "mode": "interview_session",
  "status": "success",
  "payload": {
    "type": "interview_turn",
    "session_state": {
      "phase": "behavioural" or "technical",
      "question_index": 1,
      "total_questions": 8,
      "score_so_far": {
        "communication": 6,
        "content": 5,
        "confidence": 6
      },
      "transcript": [
        {
          "question_id": "intro_1",
          "question": "...",
          "answer": "I'm a recent graduate...",
          "topic": "introduction"
        }
      ],
      "meta": { ... }
    },
    "payload": {
      "kind": "question",
      "end_of_interview": false,
      "question_id": "behavioural_1",
      "question": "Can you tell me about a time when...",
      "topic": "problem-solving",
      "difficulty": "medium",
      "phase": "behavioural"
    }
  }
}
```

**Checklist**:
- [ ] Request is accepted
- [ ] `session_state.question_index` is incremented (1, 2, 3...)
- [ ] `session_state.transcript` includes previous Q&A
- [ ] `session_state.score_so_far` is updated (not all zeros)
- [ ] New question is returned
- [ ] Question is relevant and follows up appropriately

**Checkpoint**: ✅ Subsequent turns work and return next questions

---

### STEP 7: Test End of Interview (Feedback) ⏱️ 30 mins

**Action**: Test when interview ends (after 8 questions or when AI decides)

**Test Request** (use `session_state` from Step 6, but with `question_index: 7`):

```json
{
  "message": "My answer to question 8...",
  "language": "en",
  "context": {
    "context": "interview_session",
    "meta": { ... },
    "session_state": {
      "phase": "technical",
      "question_index": 7,
      "total_questions": 8,
      "score_so_far": {
        "communication": 7,
        "content": 6,
        "confidence": 7
      },
      "transcript": [
        // ... 7 previous Q&As
      ],
      "meta": { ... }
    }
  }
}
```

**Expected Response**:

```json
{
  "brain": "estel",
  "mode": "interview_session",
  "status": "success",
  "payload": {
    "type": "interview_turn",
    "session_state": {
      "phase": "wrap_up",
      "question_index": 8,
      "total_questions": 8,
      "score_so_far": {
        "communication": 7,
        "content": 6,
        "confidence": 7
      },
      "transcript": [
        // ... all 8 Q&As
      ],
      "meta": { ... }
    },
    "payload": {
      "kind": "feedback",
      "end_of_interview": true,
      "summary": "You communicated clearly, but your BA fundamentals and SQL basics need work.",
      "strengths": [
        "Structured answers when you know the topic",
        "Good use of examples from your current role"
      ],
      "improvements": [
        "Revise core SQL joins and basic tables",
        "Practice breaking down problem statements step-by-step"
      ],
      "scores": {
        "communication": 7,
        "content": 6,
        "confidence": 7,
        "overall": 6
      },
      "skill_gaps": [
        "SQL basics (JOINs, GROUP BY)",
        "Writing clear problem statements",
        "Stakeholder communication"
      ],
      "next_steps": [
        "Redo the Skill Gap Analysis for Business Analyst role",
        "Focus next 7 days on SQL + case-based questions"
      ]
    }
  }
}
```

**Checklist**:
- [ ] Request is accepted
- [ ] `payload.payload.kind === 'feedback'`
- [ ] `payload.payload.end_of_interview === true`
- [ ] `summary` exists and is meaningful
- [ ] `strengths` array has 2-4 items
- [ ] `improvements` array has 3-6 items
- [ ] `scores` object has all 4 scores (1-10)
- [ ] `skill_gaps` array exists (can be empty)
- [ ] `next_steps` array exists (can be empty)

**Checkpoint**: ✅ End of interview returns feedback correctly

---

### STEP 8: Test Error Handling ⏱️ 20 mins

**Action**: Test error scenarios

**Test Cases**:

1. **Missing OpenAI API Key**:
   - Should return error envelope with `status: 'error'`
   - Should have helpful error message

2. **Invalid JSON from AI**:
   - Should catch JSON parse error
   - Should return error envelope

3. **Invalid Request** (missing meta):
   - Should handle gracefully
   - Should return error or use defaults

**Expected Error Response**:

```json
{
  "brain": "estel",
  "mode": "interview_session",
  "status": "error",
  "message": "Interview session failed. Please try again."
}
```

**Checklist**:
- [ ] Errors return error envelope (not crash)
- [ ] Error messages are user-friendly
- [ ] Status code is 500 for server errors
- [ ] CORS headers are still present

**Checkpoint**: ✅ Error handling works correctly

---

### STEP 9: Test Different Scenarios ⏱️ 30 mins

**Action**: Test with different inputs

**Test Cases**:

1. **Different Roles**:
   - [ ] "Software Engineer"
   - [ ] "Operations Executive"
   - [ ] "Data Analyst"

2. **Different Experience Levels**:
   - [ ] "0-2 years" (fresher)
   - [ ] "3-5 years" (mid-level)
   - [ ] "6+ years" (senior)

3. **Different Difficulties**:
   - [ ] "easy"
   - [ ] "standard"
   - [ ] "hard"

4. **Different Question Targets**:
   - [ ] 5 questions
   - [ ] 8 questions
   - [ ] 10 questions

**Checklist**:
- [ ] Questions adapt to role
- [ ] Questions adapt to experience level
- [ ] Difficulty affects question complexity
- [ ] Question count matches target (approximately)

**Checkpoint**: ✅ System works with various inputs

---

### STEP 10: Final Validation ⏱️ 20 mins

**Action**: Complete end-to-end test

**Test Flow**:
1. Start interview (first turn)
2. Answer question 1 (second turn)
3. Answer question 2 (third turn)
4. Continue until feedback is returned
5. Verify all responses are valid JSON
6. Verify session_state is maintained correctly

**Final Checklist**:
- [ ] All responses are valid JSON
- [ ] All responses match `BrainEnvelope<InterviewTurnResponse>` format
- [ ] Session state is maintained across turns
- [ ] Questions are relevant and appropriate
- [ ] Feedback is comprehensive and useful
- [ ] Error handling works
- [ ] No console errors
- [ ] Performance is acceptable (< 5 seconds per turn)

**Checkpoint**: ✅ Backend is complete and ready for frontend integration

---

## 📋 Implementation Checklist

### Core Implementation:
- [ ] STEP 1: Understand current edge function structure
- [ ] STEP 2: Add interview session handler branch
- [ ] STEP 3: Create interview handler function
- [ ] STEP 4: Create system prompt builder
- [ ] STEP 5: Test first turn (start interview)
- [ ] STEP 6: Test subsequent turn (answer question)
- [ ] STEP 7: Test end of interview (feedback)
- [ ] STEP 8: Test error handling
- [ ] STEP 9: Test different scenarios
- [ ] STEP 10: Final validation

### Code Quality:
- [ ] Code is properly formatted
- [ ] Error handling is comprehensive
- [ ] Console logging for debugging
- [ ] Comments where needed

### Documentation:
- [ ] Response format is documented
- [ ] Error cases are documented
- [ ] Sample requests/responses saved

---

## 🚨 Common Issues & Solutions

### Issue 1: OpenAI returns non-JSON
**Solution**: 
- Ensure `response_format: { type: 'json_object' }` is set
- Check system prompt emphasizes JSON-only output
- Add JSON validation before returning

### Issue 2: Session state not maintained
**Solution**:
- Verify `session_state` is passed correctly in request
- Check that AI includes previous state in response
- Validate session_state structure

### Issue 3: Questions not relevant to role
**Solution**:
- Strengthen system prompt with role-specific instructions
- Include role in meta clearly
- Test with different roles

### Issue 4: Interview doesn't end
**Solution**:
- Check `question_index` is incrementing
- Verify `total_questions` is set correctly
- Add explicit instruction to end at question_index + 1 >= total_questions

---

## ✅ Completion Criteria

**Backend is complete when**:
1. ✅ All 10 steps are checked off
2. ✅ First turn returns valid question
3. ✅ Subsequent turns return next questions
4. ✅ End of interview returns feedback
5. ✅ Error handling works
6. ✅ Response format matches `BrainEnvelope<InterviewTurnResponse>`
7. ✅ All test scenarios pass

---

## 📤 Next Steps After Backend Completion

Once backend is complete:
1. **Share sample responses** with frontend developer (me)
2. **Confirm response format** matches plan
3. **Test together** when frontend is ready
4. **Fix any mismatches** if needed

---

## 🎯 Ready to Start?

**Begin with STEP 1** and work through each step sequentially.

**Estimated total time**: 2.5-3.5 hours

**Questions?** Review the plan document or ask before proceeding.

**Good luck!** 🚀

