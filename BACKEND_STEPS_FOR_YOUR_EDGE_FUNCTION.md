# Backend Implementation Steps - For Your Edge Function

## Your Current Edge Function Structure

**Key Observations:**
- ✅ Uses Deno `serve()` function
- ✅ Has CORS headers defined
- ✅ Parses `requestBody` with `message`, `context`, `language`, `mode`, `user`
- ✅ Detects `contextType` from `context.context` or `context` as string
- ✅ Has `mapContextTypeToMode()` helper
- ✅ Has `getDetailedSystemMessage()` and `prepareContextualMessage()` functions
- ✅ Returns response with `requestId`, `mode`, `contextType`, `brainVersion`, `meta`, `items[]`
- ✅ Uses `gpt-4o-mini` model
- ✅ Has error handling with structured responses

---

## STEP 1: Understand Current Edge Function Structure ⏱️ 10 mins

### What Your Code Currently Does:

1. **Request Parsing**:
   ```typescript
   const { message, context, language: reqLanguage, mode: reqMode, user: reqUser } = requestBody ?? {};
   ```

2. **Context Type Detection**:
   ```typescript
   contextType = "general";
   if (typeof context === "string") {
     contextType = context;
   } else if (context && typeof context === "object" && typeof context.context === "string") {
     contextType = context.context;
   }
   ```

3. **Mode Mapping**:
   ```typescript
   mode = typeof reqMode === "string" && reqMode.length > 0 ? reqMode : mapContextTypeToMode(contextType);
   ```

4. **System Prompt**:
   - Calls `getDetailedSystemMessage(contextType, language, mode)`
   - Has specializations for: `resume_analysis`, `ats_analysis`, `interview_analysis`, `skill_gap_analysis`, `resume`, `interview`, `skill_gap_analysis`

5. **OpenAI Call**:
   ```typescript
   const openAiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
     method: "POST",
     headers: {
       Authorization: `Bearer ${openAIApiKey}`,
       "Content-Type": "application/json"
     },
     body: JSON.stringify({
       model: "gpt-4o-mini",
       messages: [...],
       max_tokens: 4000,
       temperature: 0.2,
       // NO response_format: { type: 'json_object' } currently
     })
   });
   ```

6. **Response Format**:
   ```typescript
   {
     requestId,
     mode,
     contextType,
     brainVersion: BRAIN_VERSION,
     meta: { language, userId, timestamp, latencyMs },
     items: [{ id: "1", type: itemType, content: aiResponse }]
   }
   ```

**Checkpoint**: ✅ You understand your current structure

---

## STEP 2: Add Interview Session Handler Branch ⏱️ 30 mins

### Where to Add: 
**Inside the main `try` block, AFTER contextType detection, BEFORE the existing OpenAI call**

### Code to Add:

```typescript
// After this line:
// contextType = "general";
// if (typeof context === "string") { ... }

// ADD THIS BRANCH:
if (contextType === "interview_session") {
  try {
    // Extract interview-specific data
    const meta = context?.meta || {};
    const sessionState = context?.session_state ?? null;

    // Call interview handler
    const interviewResult = await handleInterviewSession({
      message,
      language,
      meta: {
        target_role: meta.target_role || "General",
        experience_level: meta.experience_level || "0-2 years",
        difficulty: meta.difficulty || "standard",
        questions_target: meta.questions_target || 8,
      },
      sessionState,
      requestId,
      user,
    });

    // Calculate latency
    const latencyMs = Date.now() - startTime;

    // Return in your existing response format, but with interview payload
    const responsePayload = {
      requestId,
      mode: "interview_session",
      contextType: "interview_session",
      brainVersion: BRAIN_VERSION,
      meta: {
        language,
        userId: user?.id ?? null,
        timestamp: new Date().toISOString(),
        latencyMs,
      },
      // NEW: Add interview payload
      interviewPayload: interviewResult,
      // Keep items for backward compatibility (optional)
      items: [
        {
          id: "1",
          type: "interview_turn",
          content: JSON.stringify(interviewResult), // For backward compatibility
        },
      ],
    };

    return new Response(JSON.stringify(responsePayload), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Interview session error:", error);
    const latencyMs = Date.now() - startTime;

    const errorResponse = {
      requestId,
      mode: "interview_session",
      contextType: "interview_session",
      brainVersion: BRAIN_VERSION,
      meta: {
        language,
        userId: user?.id ?? null,
        timestamp: new Date().toISOString(),
        latencyMs,
      },
      error: {
        code: "INTERVIEW_SESSION_ERROR",
        message: error?.message || "Interview session failed. Please try again.",
        status: 500,
        details: String(error),
      },
      items: [
        {
          id: "1",
          type: "message",
          content: "I'm experiencing technical difficulties with the interview session. Please try again in a moment.",
        },
      ],
    };

    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  }
}

// Continue with your existing code (the OpenAI call for other context types)...
```

**Also Update `mapContextTypeToMode()` function:**

```typescript
function mapContextTypeToMode(contextType) {
  switch(contextType){
    case "ats_analysis":
      return "ats_analysis";
    case "resume_analysis":
      return "resume_analysis";
    case "interview_analysis":
      return "interview_analysis";
    case "skill_gap_analysis":
      return "skill_gap_analysis";
    case "interview_session":  // ADD THIS
      return "interview_session";
    default:
      return "chat";
  }
}
```

**Checkpoint**: ✅ Edge function recognizes `interview_session` context

**Test**: Send request with `context: { context: "interview_session" }` - should hit error (handler doesn't exist yet)

---

## STEP 3: Create Interview Handler Function ⏱️ 45 mins

### Where to Add:
**Before the `serve()` function, after helper functions**

### Code to Add:

```typescript
// Add this function BEFORE serve() function

async function handleInterviewSession({
  message,
  language,
  meta,
  sessionState,
  requestId,
  user,
}: {
  message: string;
  language: string;
  meta: {
    target_role: string;
    experience_level: string;
    difficulty: "easy" | "standard" | "hard";
    questions_target: number;
  };
  sessionState: any | null;
  requestId: string;
  user: any | null;
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
      ? "Start the mock interview. Initialize session_state, greet briefly, and ask the first question only."
      : "Candidate has answered. Update session_state and either ask the next question OR return final feedback if interview is complete.",
  };

  // Get OpenAI API key
  const openAIApiKey = Deno.env.get("OPENAI_API_KEY");
  if (!openAIApiKey) {
    throw new Error("OPENAI_API_KEY is not configured");
  }

  console.log("Calling OpenAI for interview session", {
    requestId,
    isFirstTurn,
    targetRole: meta.target_role,
  });

  // Call OpenAI with JSON mode
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${openAIApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: JSON.stringify(userPayload),
        },
      ],
      response_format: { type: "json_object" }, // CRITICAL: Force JSON output
      max_tokens: 4000,
      temperature: 0.7, // Slightly higher for question variety
      top_p: 0.9,
      frequency_penalty: 0.3,
      presence_penalty: 0.1,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("OpenAI API error for interview:", response.status, errorText);
    throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  const rawContent = data.choices?.[0]?.message?.content;

  if (!rawContent) {
    throw new Error("No response from OpenAI");
  }

  // Parse JSON response
  let parsedResponse;
  try {
    parsedResponse = JSON.parse(rawContent);
  } catch (parseError) {
    console.error("Failed to parse OpenAI response:", rawContent);
    throw new Error("Invalid JSON response from AI");
  }

  // Validate response structure (basic check)
  if (!parsedResponse.type || !parsedResponse.session_state || !parsedResponse.payload) {
    console.error("Invalid response structure:", parsedResponse);
    throw new Error("Invalid response structure from AI");
  }

  console.log("Interview session response parsed successfully", {
    requestId,
    questionIndex: parsedResponse.session_state?.question_index,
    payloadKind: parsedResponse.payload?.kind,
  });

  return parsedResponse;
}
```

**Checkpoint**: ✅ Handler function exists and calls OpenAI

**Test**: Function compiles (can't test fully until system prompt is added)

---

## STEP 4: Create System Prompt Builder ⏱️ 1 hour

### Where to Add:
**Before `handleInterviewSession()` function, after other helper functions**

### Code to Add:

```typescript
// Add this function BEFORE handleInterviewSession()

function buildInterviewSystemPrompt(
  meta: {
    target_role: string;
    experience_level: string;
    difficulty: "easy" | "standard" | "hard";
    questions_target: number;
  },
  language: string
): string {
  const languageInstruction = getLanguageInstruction(language);

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

**Note**: This function uses your existing `getLanguageInstruction(language)` function, so it will work with Hindi, Marathi, Bengali, Gujarati, etc.

**Checkpoint**: ✅ System prompt function exists and returns prompt string

**Test**: 
- Function returns a string
- Prompt includes all meta values
- JSON schema is clear

---

## ✅ Summary of Changes

### Files Modified:
1. **Edge Function** (main file):
   - Added `if (contextType === "interview_session")` branch
   - Added `handleInterviewSession()` function
   - Added `buildInterviewSystemPrompt()` function
   - Updated `mapContextTypeToMode()` to include `interview_session`

### Key Differences from Your Current Code:
1. **Response Format**: 
   - Your current: `{ requestId, mode, contextType, items: [{ content: string }] }`
   - Interview: Adds `interviewPayload` field with structured JSON
   - Still keeps `items[]` for backward compatibility

2. **OpenAI Call**:
   - Added `response_format: { type: "json_object" }` (CRITICAL)
   - Changed `temperature: 0.7` (higher for question variety)

3. **Error Handling**:
   - Uses your existing error response structure
   - Adds `INTERVIEW_SESSION_ERROR` code

---

## 🧪 Quick Test After Step 4

**Test Request**:
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
  "requestId": "...",
  "mode": "interview_session",
  "contextType": "interview_session",
  "brainVersion": "v1.0.0",
  "meta": { ... },
  "interviewPayload": {
    "type": "interview_turn",
    "session_state": { ... },
    "payload": {
      "kind": "question",
      "question": "...",
      ...
    }
  },
  "items": [ ... ]
}
```

---

## ✅ Next Steps

After completing Steps 1-4:
1. Test first turn (Step 5 from full guide)
2. Test subsequent turns (Step 6)
3. Test end of interview (Step 7)
4. Test error handling (Step 8)

Then confirm completion and I'll start frontend implementation!

