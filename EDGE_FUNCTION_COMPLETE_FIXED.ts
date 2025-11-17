import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
};

const BRAIN_VERSION = "v1.0.0";

// --- Helper: Build Interview System Prompt ---
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
    "score_explanations": {
      "communication": "string (specific explanation tied to actual answers)",
      "content": "string (specific explanation tied to actual answers)",
      "confidence": "string (specific explanation tied to actual answers)",
      "overall": "string (specific explanation tied to actual answers)"
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
   
   **CRITICAL for feedback - Make it SPECIFIC and PERSONAL:**
   - **Strengths (2-4 items):** Reference 1-2 SPECIFIC questions from the transcript by question_id or question text
     * Example: "In Question 1 ('Tell me about yourself'), you clearly explained your background and motivation"
     * Example: "Your answer to Question 4 about problem-solving showed good analytical thinking"
     * Always tie strengths to actual answers the candidate gave
   
   - **Improvements (3-6 items):** Point out EXACTLY what was missing, referencing specific questions
     * Example: "In Question 2 about your experience, you mentioned 'improved performance' but didn't give numbers. Next time, say 'reduced errors by 20%' or 'increased efficiency by 15%'."
     * Example: "In Question 3, you used the STAR method but the Result section was vague. Be specific: 'This led to a 30% reduction in customer complaints'."
     * Avoid generic advice like "practice more" - instead say "In your answer to 'Tell me about yourself', you didn't mention any quantifiable achievements. Next time, include at least one metric (e.g., 'increased sales by 15%')."
     * Make each improvement point tied to a specific answer the candidate gave
   
   - **Scores (1-10 scale):** Use realistic ranges, not just 5, 7, 9
     * Scoring Guidelines:
       * 4-5.9 = Needs improvement (candidate struggled, many gaps)
       * 6-7.9 = Good (solid answers with room for improvement)
       * 8-10 = Strong (excellent answers, minor improvements needed)
     * Scores MUST match your written summary (don't say "excellent" and give 4/10)
     * Avoid using the same number for all scores – vary realistically (e.g., 6.5, 7, 5.5, 7.5)
     * Each score should reflect the actual performance you observed
   
   - **Score Explanations:** Provide specific explanations for each score
     * Example: "communication": "Clear structure and good pacing, but could use more pauses for emphasis"
     * Example: "content": "Good examples but lacked specific metrics. Only 2 out of 8 answers included numbers"
     * Example: "confidence": "Appeared confident in behavioral questions but hesitant in technical ones"
     * Example: "overall": "Solid foundation with good communication skills, but needs practice adding quantifiable results to answers"
     * Each explanation should reference specific examples from the transcript
   
   - **Skill Gaps:** ALWAYS tie to TARGET_ROLE and EXPERIENCE_LEVEL
     * Prefer concrete, job-related technical/functional skills over generic soft skills
     * Examples by role:
       * For "Software Engineer" → "basic SQL joins", "REST API design", "unit testing with Jest"
       * For "Business Analyst" → "SQL joins", "Excel pivot tables", "stakeholder requirement documentation"
       * For "Product Manager" → "user story writing", "roadmap prioritization frameworks", "A/B testing basics"
       * For "Data Scientist" → "pandas data manipulation", "statistical hypothesis testing", "model evaluation metrics"
       * For "DevOps Engineer" → "Docker containerization", "CI/CD pipeline setup", "Kubernetes basics"
     * Avoid generic traits like "hard work", "leadership", "communication" unless they're the PRIMARY gap
     * Make each skill gap actionable and learnable (not personality traits)
     * Each gap should be relevant to the ${meta.target_role} role at ${meta.experience_level} level
   
   - **Next Steps:** Provide actionable, specific recommendations
     * Example: "Practice adding 1-2 metrics to every answer (e.g., percentages, numbers, time saved)"
     * Example: "Revise STAR method - focus on making Results section specific and measurable"
     * Example: "Take SQL basics course to cover joins and subqueries (for ${meta.target_role} role)"
     * Tie next steps to the specific skill gaps identified

**IMPORTANT:**
- Never include commentary outside the JSON
- Never break JSON structure
- Never include trailing commas
- Always use double quotes for JSON
- For "language" = "hi" or "mr", respond in Hindi/Marathi but keep JSON keys in English only
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
}

**Example feedback response (when interview ends):**
{
  "type": "interview_turn",
  "session_state": {
    "phase": "wrap_up",
    "question_index": 7,
    "total_questions": ${meta.questions_target},
    "score_so_far": { "communication": 6.5, "content": 6, "confidence": 7 },
    "transcript": [
      { "question_id": "intro_1", "question": "Tell me about yourself", "answer": "I am a software engineer...", "topic": "introduction" },
      { "question_id": "tech_1", "question": "Explain a technical problem you solved", "answer": "I improved the system performance...", "topic": "technical" }
    ],
    "meta": { "target_role": "${meta.target_role}", "experience_level": "${meta.experience_level}", "difficulty": "${meta.difficulty}", "questions_target": ${meta.questions_target} }
  },
  "payload": {
    "kind": "feedback",
    "end_of_interview": true,
    "summary": "You completed the interview for ${meta.target_role}. Overall, your answers showed good understanding, but you need to add more specific examples and metrics to make them more impactful.",
    "strengths": [
      "In Question 1 ('Tell me about yourself'), you clearly explained your background and motivation for the ${meta.target_role} role",
      "Your answer to Question 4 about problem-solving showed good analytical thinking and structured approach"
    ],
    "improvements": [
      "In Question 2 about your experience, you mentioned 'improved performance' but didn't give numbers. Next time, say 'reduced errors by 20%' or 'increased efficiency by 15%'.",
      "In Question 3, you used the STAR method but the Result section was vague. Be specific: 'This led to a 30% reduction in customer complaints' or 'saved the company ₹50,000 annually'.",
      "In Question 5, you didn't mention any quantifiable achievements. For ${meta.target_role} roles, hiring managers want to see metrics. Try adding at least one number per answer."
    ],
    "scores": {
      "communication": 7,
      "content": 6,
      "confidence": 7,
      "overall": 6.5
    },
    "score_explanations": {
      "communication": "Clear structure and good pacing throughout, but could use more pauses for emphasis. Your answers were well-organized but sometimes rushed.",
      "content": "Good examples but lacked specific metrics. Only 2 out of 8 answers included numbers or quantifiable results. For ${meta.target_role} role, this is important.",
      "confidence": "Appeared confident in behavioral questions but hesitated slightly in technical ones. Overall good presence but could project more authority.",
      "overall": "Solid foundation with good communication skills, but needs practice adding quantifiable results to answers. With more specific examples, you'd score 8+."
    },
    "skill_gaps": [
      "Basic SQL joins and subqueries (for ${meta.target_role} role at ${meta.experience_level} level)",
      "Creating simple Excel reports with pivot tables",
      "Stakeholder requirement documentation and analysis"
    ],
    "next_steps": [
      "Practice adding 1-2 metrics to every answer (e.g., percentages, numbers, time saved, cost reduction)",
      "Revise STAR method - focus on making Results section specific and measurable with actual numbers",
      "Take SQL basics course to cover joins and subqueries (essential for ${meta.target_role} role)",
      "Practice technical questions specific to ${meta.target_role} to build more confidence"
    ]
  }
}`;
}

// --- Helper: Handle Interview Session ---
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

  // Build system prompt
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

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders
    });
  }

  const startTime = Date.now();
  const requestId = crypto.randomUUID();

  // Defaults so catch block can still build a sensible response
  let mode = "chat";
  let contextType = "general";
  let language = "en";
  let user = null;

  try {
    const requestBody = await req.json();

    console.log("AI Career Companion: Request received", {
      requestId
    });

    const { message, context, language: reqLanguage, mode: reqMode, user: reqUser } = requestBody ?? {};

    user = reqUser || null;

    // 🔹 CRITICAL FIX: Detect requested contextType EARLY (before validation)
    let requestedContextType = "general";
    if (typeof context === "string") {
      requestedContextType = context;
    } else if (context && typeof context === "object" && typeof context.context === "string") {
      requestedContextType = context.context;
    }

    // 🔹 Basic validation (skip strict check for interview_session first turn)
    if (
      requestedContextType !== "interview_session" &&
      (typeof message !== "string" || !message.trim())
    ) {
      const latencyMs = Date.now() - startTime;

      const errorResponse = {
        requestId,
        mode: null,
        contextType: null,
        brainVersion: BRAIN_VERSION,
        meta: {
          language: reqLanguage || "en",
          userId: user?.id ?? null,
          timestamp: new Date().toISOString(),
          latencyMs
        },
        error: {
          code: "INVALID_REQUEST",
          message: "Field 'message' is required and must be a non-empty string.",
          status: 400
        },
        items: [
          {
            id: "1",
            type: "message",
            content: "Your request is missing the main question or message. Please type what you need help with."
          }
        ]
      };

      return new Response(JSON.stringify(errorResponse), {
        status: 400,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      });
    }

    // ✅ Now set language/contextType/mode from the detected values
    language = typeof reqLanguage === "string" ? reqLanguage : "en";
    contextType = requestedContextType;
    mode = typeof reqMode === "string" && reqMode.length > 0 ? reqMode : mapContextTypeToMode(contextType);

    console.log("Context & mode detected:", {
      requestId,
      contextType,
      mode,
      language
    });

    // ===== Interview Session Handler (runs BEFORE generic AI call) =====
    if (contextType === "interview_session") {
      try {
        // Extract interview-specific data
        const meta = context?.meta || {};
        const sessionState = context?.session_state ?? null;

        // Call interview handler
        const interviewResult = await handleInterviewSession({
          message: message || "", // Allow empty message for first turn
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
          // Keep items for backward compatibility
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
    // ===== END Interview Session Handler =====

    const openAIApiKey = Deno.env.get("OPENAI_API_KEY");

    console.log("OpenAI API Key check:", openAIApiKey ? "Found" : "Not found");

    if (!openAIApiKey) {
      console.log("OpenAI API key not configured, returning error response");

      const latencyMs = Date.now() - startTime;

      const responsePayload = {
        requestId,
        mode,
        contextType,
        brainVersion: BRAIN_VERSION,
        meta: {
          language,
          userId: user?.id ?? null,
          timestamp: new Date().toISOString(),
          latencyMs
        },
        error: {
          code: "MISSING_OPENAI_KEY",
          message: "OpenAI API key is not configured. Please contact the administrator to set up the OPENAI_API_KEY environment variable.",
          status: 500
        },
        items: [
          {
            id: "1",
            type: "message",
            content: "The AI service is not configured correctly right now. Please try again later or contact support."
          }
        ]
      };

      return new Response(JSON.stringify(responsePayload), {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      });
    }

    // Build system & user prompts
    const systemMessage = getDetailedSystemMessage(contextType, language, mode);
    const contextualMessage = prepareContextualMessage(message, context, mode);

    console.log("Calling OpenAI with enhanced prompts...", {
      requestId,
      mode,
      contextType
    });

    const openAiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openAIApiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: systemMessage
          },
          {
            role: "user",
            content: contextualMessage
          }
        ],
        max_tokens: 4000,
        temperature: 0.2,
        top_p: 0.9,
        frequency_penalty: 0.3,
        presence_penalty: 0.1
      })
    });

    console.log("OpenAI API Response status:", openAiResponse.status);

    const latencyMs = Date.now() - startTime;

    if (!openAiResponse.ok) {
      const errorText = await openAiResponse.text();

      console.error("OpenAI API error:", openAiResponse.status, errorText);

      const responsePayload = {
        requestId,
        mode,
        contextType,
        brainVersion: BRAIN_VERSION,
        meta: {
          language,
          userId: user?.id ?? null,
          timestamp: new Date().toISOString(),
          latencyMs
        },
        error: {
          code: "OPENAI_ERROR",
          message: "Failed to connect to the AI service.",
          status: openAiResponse.status,
          details: errorText
        },
        items: [
          {
            id: "1",
            type: "message",
            content: "I'm facing a technical issue connecting to the AI service right now. Please try again in a few minutes."
          }
        ]
      };

      return new Response(JSON.stringify(responsePayload), {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      });
    }

    const data = await openAiResponse.json();

    console.log("OpenAI response received successfully", {
      requestId
    });

    const aiResponse = data.choices?.[0]?.message?.content ?? "";

    // Response type based on mode (still keeps `content` as text for now)
    const itemType = getItemTypeForMode(mode);

    const responsePayload = {
      requestId,
      mode,
      contextType,
      brainVersion: BRAIN_VERSION,
      meta: {
        language,
        userId: user?.id ?? null,
        timestamp: new Date().toISOString(),
        latencyMs
      },
      items: [
        {
          id: "1",
          type: itemType,
          // In future, this can become `data: {...}` with structured JSON
          content: aiResponse
        }
      ]
    };

    return new Response(JSON.stringify(responsePayload), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    });

  } catch (error) {
    console.error("Error in ai-career-companion function:", error);

    const latencyMs = Date.now() - startTime;

    const basicResponse = {
      requestId,
      mode,
      contextType,
      brainVersion: BRAIN_VERSION,
      meta: {
        language,
        userId: user?.id ?? null,
        timestamp: new Date().toISOString(),
        latencyMs
      },
      error: {
        code: "UNHANDLED_ERROR",
        message: "Unexpected error in AI career companion function.",
        status: 500,
        details: String(error?.message ?? error)
      },
      items: [
        {
          id: "1",
          type: "message",
          content: "I'm experiencing technical difficulties right now. Please try again in a moment."
        }
      ]
    };

    return new Response(JSON.stringify(basicResponse), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    });
  }
});

// --- Helper: map contextType -> mode (learning brain architecture) ---
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
    case "interview_session":  // ADDED
      return "interview_session";
    // "resume" / "interview" etc. still go through as chat-style for now
    default:
      return "chat";
  }
}

// --- Helper: derive item.type from mode ---
function getItemTypeForMode(mode) {
  switch(mode){
    case "ats_analysis":
      return "ats_analysis";
    case "resume_analysis":
      return "resume_analysis";
    case "interview_analysis":
      return "interview_analysis";
    case "skill_gap_analysis":
      return "skill_gap_analysis";
    case "interview_session":  // ADDED
      return "interview_turn";
    default:
      return "message";
  }
}

// --- Prompt builders (kept largely as-is, extended with mode param) ---
function getDetailedSystemMessage(contextType, language, mode) {
  const languageInstruction = getLanguageInstruction(language);

  const basePrompt = `You are an expert AI career coach with 20+ years of experience in recruitment, career development, HR strategy, and professional coaching. You work with Fortune 500 companies and have helped thousands of professionals advance their careers.

**Your expertise includes:**

- Resume writing and ATS optimization

- Interview preparation and negotiation strategies  

- Career planning and transition guidance

- Leadership development and professional branding

- Industry insights across technology, finance, healthcare, consulting, and more

- Salary negotiation and compensation analysis

- Personal branding and LinkedIn optimization

**Response Guidelines:**

- Provide comprehensive, detailed, and actionable advice

- Use specific examples, templates, and step-by-step guidance

- Include industry best practices and current market trends

- Format responses with clear headers, bullet points, and organized sections

- Give practical tips that can be implemented immediately

- Address both immediate needs and long-term career strategy

- Be encouraging while providing honest, constructive feedback

- Reference specific tools, resources, and methodologies when helpful

**Response Style:**

- Professional yet approachable tone

- Use markdown formatting for better readability

- Provide thorough explanations with context and rationale

- Include multiple perspectives and approaches when relevant

- Give both beginner and advanced level guidance

- Reference current industry standards and trends

${languageInstruction}`;

  if (contextType === "resume_analysis") {
    return `${basePrompt}

**RESUME ANALYSIS SPECIALIZATION:**

You are an expert resume analyst with deep understanding of:

- ATS (Applicant Tracking System) optimization and keyword analysis

- Content quality assessment and improvement strategies

- Industry-specific resume requirements and best practices

- Skills gap identification and market alignment

- Format optimization for both ATS and human readers

- Achievement quantification and impact demonstration

- Professional branding consistency

**ANALYSIS FRAMEWORK:**

Provide structured analysis with:

1. **Quantitative Scoring** (0-100 with sub-scores)

2. **Qualitative Assessment** (strengths and weaknesses)

3. **Specific Recommendations** (actionable improvements)

4. **Industry Context** (market relevance and trends)

5. **Implementation Steps** (priority order for changes)

**RESPONSE FORMAT:**

- Use clear headers and bullet points

- Include specific examples and templates

- Provide before/after suggestions

- Reference industry best practices

- Give time-sensitive recommendations

Format your response with clear sections and specific examples.`;
  }

  if (contextType === "ats_analysis") {
    return `${basePrompt}
**ATS ANALYSIS SPECIALIZATION:**

You are an expert ATS (Applicant Tracking System) analyst with deep understanding of:

- ATS parsing algorithms and keyword optimization

- Content quality assessment and improvement strategies

- Industry-specific resume requirements and best practices

- Skills gap identification and market alignment

- Format optimization for both ATS and human readers

- Achievement quantification and impact demonstration

- Professional branding consistency

**ATS SCORING CRITERIA:**

- **Content Quality (30 points):** Relevant experience, quantified achievements, skills alignment

- **Keyword Optimization (25 points):** Industry-specific terms, role-relevant keywords, skill matches

- **Format Compatibility (20 points):** ATS-friendly structure, clear sections, proper formatting

- **Professional Impact (15 points):** Achievement quantification, impact demonstration, value proposition

- **Completeness (10 points):** All key sections present, contact info, education, experience

**ANALYSIS FRAMEWORK:**

Provide structured analysis with:

1. **ATS SCORE: [X]%** - Overall ATS compatibility score (0-100)

   - Content Quality: [X]/30

   - Keyword Optimization: [X]/25

   - Format Compatibility: [X]/20

   - Professional Impact: [X]/15

   - Completeness: [X]/10

2. **CRITICAL ISSUES:** - Specific problems that will cause ATS rejection or low scores

   - List actual problems found in THIS resume

   - Reference specific sections or content

   - Explain the impact of each issue

3. **IMPROVEMENT SUGGESTIONS:** - Actionable content improvements

   - Provide specific recommendations based on THIS resume's content

   - Include before/after examples where helpful

   - Prioritize improvements by impact

4. **MISSING KEYWORDS:** - Industry-specific terms to add

   - Identify keywords relevant to THIS resume's target role

   - Suggest where to naturally incorporate them

   - Explain why each keyword matters

5. **FORMATTING RECOMMENDATIONS:** - ATS-friendly formatting suggestions

   - Address specific formatting issues found

   - Provide clear formatting guidelines

   - Explain ATS parsing requirements

6. **OVERALL ASSESSMENT:** - Comprehensive evaluation and next steps

   - Summarize key strengths and weaknesses

   - Provide priority action items

   - Estimate time to implement improvements

**CRITICAL ANALYSIS RULES:**

- Analyze the ACTUAL resume content provided, NOT generic templates

- Provide SPECIFIC feedback based on the content you see

- Reference ACTUAL sections, achievements, and skills from the resume

- Give ACTIONABLE recommendations that can be implemented immediately

- Focus on CONTENT QUALITY over generic formatting advice

- Be HONEST about strengths and weaknesses

**RESPONSE FORMAT:**

Use clear section headers exactly as shown above (ATS SCORE, CRITICAL ISSUES, etc.)

Provide specific examples from the actual resume content

Include actionable next steps

Be encouraging while providing honest feedback

Format your response with clear sections and specific examples.`;
  }

  if (contextType === "interview_analysis") {
    return `${basePrompt}

**INTERVIEW ANALYSIS SPECIALIZATION:**

You are an expert interview analyst specializing in:

- Performance evaluation across multiple dimensions

- Question pattern analysis and response quality

- Communication skills assessment

- Technical knowledge evaluation

- Problem-solving approach analysis

- Confidence and presentation assessment

- Time management and interview flow

**ANALYSIS FRAMEWORK:**

Provide comprehensive analysis with:

1. **Overall Performance Score** (0-100)

2. **Performance Metrics Breakdown:**

   - Communication Skills (0-100)

   - Technical Knowledge (0-100)

   - Problem-Solving Ability (0-100)

   - Confidence Level (0-100)

   - Time Management (0-100)

3. **Question Pattern Analysis:**

   - Technical Questions (count and performance)

   - Behavioral Questions (count and performance)

   - Situational Questions (count and performance)

4. **Strengths and Weaknesses** (specific examples)

5. **Improvement Areas** (prioritized list)

6. **Actionable Recommendations** (specific steps)

**RESPONSE FORMAT:**

- Use clear metrics and scores

- Provide specific examples from responses

- Include actionable improvement steps

- Reference industry best practices

- Give practice recommendations

Format your response with clear sections and specific examples.`;
  }

  if (contextType === "resume") {
    return `${basePrompt}

**RESUME SPECIALIZATION:**

You are specifically focused on resume optimization, ATS compatibility, and professional document enhancement. You understand:

- Modern ATS systems and keyword optimization strategies

- Industry-specific resume requirements and best practices

- Formatting standards that pass both ATS and human review

- Achievement quantification and impact demonstration techniques

- Section optimization (summary, experience, skills, education)

- Cover letter and LinkedIn profile alignment strategies

- Personal branding consistency across all professional documents

Provide detailed, section-by-section analysis with specific improvement recommendations, keyword suggestions, and formatting guidance. Include before/after examples when helpful.`;
  }

  if (contextType === "interview") {
    return `${basePrompt}

**INTERVIEW SPECIALIZATION:**

You are specifically focused on interview preparation, behavioral question mastery, and interview strategy. You understand:

- STAR method and advanced storytelling techniques

- Company research strategies and culture assessment

- Behavioral, technical, and case interview preparation

- Salary negotiation tactics and market research

- Follow-up strategies and relationship building

- Industry-specific interview formats and expectations

- Virtual interview best practices and technology setup

- Executive presence and communication skills

Provide comprehensive preparation strategies, sample questions with model answers, company research frameworks, and post-interview action plans. Include role-playing scenarios and practice exercises.`;
  }

  if (contextType === "skill_gap_analysis") {
    return `${basePrompt}

**SKILL GAP ANALYSIS SPECIALIZATION:**

You are specifically focused on comprehensive skill gap analysis and career development planning. You understand:

- Technical and soft skill requirements across industries

- Skill level assessment (beginner/intermediate/advanced/expert)

- Market demand analysis and salary benchmarking

- Learning path development and resource recommendations

- Career progression timelines and milestones

- Industry-specific skill requirements and trends

- Certification and training program evaluation

- Mentorship and networking opportunities

Provide detailed skill gap analysis including:

- **Role Overview** (experience level, salary range, market demand)

- **Required Skills** (with importance levels and skill levels)

- **Recommended Skills** (for career advancement)

- **Skill Gap Analysis** (current vs. required levels)

- **Learning Recommendations** (specific courses, projects, resources)

- **Career Development Timeline** (short-term and long-term goals)

**RESPONSE FORMAT:**

- Use clear headers and bullet points

- Provide specific examples and resources

- Include both Indian and global market perspectives

- Give actionable, step-by-step guidance

- Reference current industry trends and best practices

Format your response with clear sections and specific examples.`;
  }

  return basePrompt;
}

function getLanguageInstruction(language) {
  switch(language){
    case "hi":
      return "CRITICAL LANGUAGE INSTRUCTION: You MUST respond ENTIRELY in Hindi (हिंदी).Even if the user types in English,respond in hindi.Use proper Devanagari script for ALL text including headings, bullet points, and examples. Provide culturally relevant examples for the Indian job market. Do NOT use any English words except for technical terms that have no Hindi equivalent. Structure your response with clear Hindi headers and maintain professional Hindi terminology throughout.";

    case "mr":
      return "CRITICAL LANGUAGE INSTRUCTION: You MUST respond ENTIRELY in Marathi (मराठी). Even if the user types in English,respond in Marathi.Use proper Devanagari script for ALL text including headings, bullet points, and examples. Provide culturally relevant examples for the Indian job market, particularly Maharashtra. Do NOT use any English words except for technical terms that have no Marathi equivalent. Structure your response with clear Marathi headers and maintain professional Marathi terminology throughout.";

    case "bn":
      return "CRITICAL LANGUAGE INSTRUCTION: You MUST respond ENTIRELY in Bengali (বাংলা). Use proper Bengali script for ALL text including headings, bullet points, and examples. Provide culturally relevant examples for the South Asian job market, particularly Bengal and Bangladesh. Do NOT use any English words except for technical terms that have no Bengali equivalent. Structure your response with clear Bengali headers and maintain professional Bengali terminology throughout.";

    case "gu":
      return "CRITICAL LANGUAGE INSTRUCTION: You MUST respond ENTIRELY in Gujarati (ગુજરાતી). Use proper Gujarati script for ALL text including headings, bullet points, and examples. Provide culturally relevant examples for the Indian job market, particularly Gujarat. Do NOT use any English words except for technical terms that have no Gujarati equivalent. Structure your response with clear Gujarati headers and maintain professional Gujarati terminology throughout.";

    default:
      return "IMPORTANT: Respond in clear, professional English. Provide examples relevant to global job markets with emphasis on US, UK, and international opportunities.";
  }
}

function prepareContextualMessage(message, context, mode) {
  let contextualMessage = message;

  // Add conversation history for continuity
  if (context?.conversationHistory && context.conversationHistory.length > 0) {
    const recentHistory = context.conversationHistory.slice(-3).join("\n- ");
    contextualMessage = `Recent conversation context:\n- ${recentHistory}\n\nCurrent question: ${message}`;
  }

  // Add specific context data
  if (context?.contextData) {
    const { currentQuestion, selectedRole, selectedCity, selectedIndustry } = context.contextData;

    if (selectedRole || selectedCity || selectedIndustry) {
      contextualMessage += `\n\n**Additional Context:**`;

      if (selectedRole) contextualMessage += `\n- Target Role: ${selectedRole}`;

      if (selectedCity) contextualMessage += `\n- Location: ${selectedCity}`;

      if (selectedIndustry) {
        contextualMessage += `\n- Industry: ${selectedIndustry}`;
      }
    }

    if (currentQuestion !== undefined) {
      contextualMessage += `\n- Currently working on question ${currentQuestion + 1} of ${context.contextData.totalQuestions}`;
    }
  }

  // Resume Analysis Context
  if (context?.context === "resume_analysis") {
    const resumeData = context.resumeSections;
    const analysisType = context.analysisType;

    contextualMessage = `RESUME ANALYSIS REQUEST: ${message}

**RESUME DATA TO ANALYZE:**

${JSON.stringify(resumeData, null, 2)}

**ANALYSIS TYPE:** ${analysisType}

Please provide a comprehensive ${analysisType} analysis including:

1. **Score Assessment** (0-100 with detailed breakdown)

2. **Strengths** (what's working well)

3. **Areas for Improvement** (specific issues found)

4. **Actionable Recommendations** (step-by-step improvements)

5. **Industry-Specific Insights** (market alignment)

6. **Keyword Optimization** (ATS-friendly suggestions)

Format the response with clear sections and specific examples.`;
  }

  // Interview Analysis Context
  if (context?.context === "interview_analysis") {
    const interviewSession = context.interviewSession;
    const analysisType = context.analysisType;

    contextualMessage = `INTERVIEW ANALYSIS REQUEST: ${message}

**INTERVIEW SESSION DATA:**

${JSON.stringify(interviewSession, null, 2)}

**ANALYSIS TYPE:** ${analysisType}

Please provide a comprehensive ${analysisType} analysis including:

1. **Overall Performance Score** (0-100)

2. **Performance Metrics Breakdown** (communication, technical, problem-solving, confidence, time management)

3. **Question Pattern Analysis** (technical, behavioral, situational questions)

4. **Strengths and Weaknesses** (specific examples from responses)

5. **Improvement Areas** (prioritized list)

6. **Actionable Recommendations** (specific practice steps)

Format the response with clear sections and specific examples.`;
  }

  // ATS Analysis Context
  if (context?.context === "ats_analysis") {
    const resumeContent = context.resumeContent || context.resumeText || message;
    const targetRole = context.targetRole || "Not specified";
    const targetIndustry = context.targetIndustry || "Not specified";

    contextualMessage = `ATS RESUME ANALYSIS REQUEST

**RESUME CONTENT TO ANALYZE:**

${resumeContent}

**TARGET ROLE:** ${targetRole}

**TARGET INDUSTRY:** ${targetIndustry}

**ANALYSIS REQUIREMENTS:**

Please provide a comprehensive ATS analysis with the following structure:

**ATS SCORE: [X]%**

Provide an overall score out of 100 with breakdown:

- Content Quality: [X]/30

- Keyword Optimization: [X]/25

- Format Compatibility: [X]/20

- Professional Impact: [X]/15

- Completeness: [X]/10

**CRITICAL ISSUES:**

List SPECIFIC problems found in THIS resume that will cause ATS rejection:

- Reference actual sections and content from the resume above

- Explain the impact of each issue

- Prioritize by severity

**IMPROVEMENT SUGGESTIONS:**

Provide ACTIONABLE improvements based on THIS resume's content:

- Give specific recommendations (not generic advice)

- Include before/after examples where helpful

- Explain WHY each change improves ATS compatibility

**MISSING KEYWORDS:**

Identify keywords relevant to THIS resume's target role:

- List industry-specific terms missing from the resume

- Suggest where to incorporate them naturally

- Explain their importance for ATS matching

**FORMATTING RECOMMENDATIONS:**

Address specific formatting issues found in THIS resume:

- Identify ATS-incompatible formatting elements

- Provide clear formatting guidelines

- Explain ATS parsing requirements

**OVERALL ASSESSMENT:**

Provide comprehensive evaluation:

- Summarize key strengths of THIS resume

- Highlight main areas for improvement

- Give priority action items

- Estimate implementation timeline

**CRITICAL:** Analyze the ACTUAL resume content provided above. Reference specific sections, achievements, skills, and content from THIS resume. Do NOT provide generic template advice.`;
  }

  // Add resume data if available (for general resume context)
  if (context?.resumeSections && context?.context !== "resume_analysis") {
    contextualMessage += `\n\n**Resume Context:**\n${JSON.stringify(context.resumeSections, null, 2)}`;
  }

  // Skill Gap Analysis context
  if (context?.context === "skill_gap_analysis") {
    const userProfile = context.userProfile || {};
    const { userType, targetRole, targetIndustry, experienceLevel, currentRole, educationBackground, location } = userProfile;

    contextualMessage = `SKILL GAP ANALYSIS REQUEST: ${message}

**USER PROFILE:**

- User Type: ${userType || "Not specified"}

- Target Role: ${targetRole || "Not specified"}

- Target Industry: ${targetIndustry || "Not specified"}

- Experience Level: ${experienceLevel || "Not specified"}

- Current Role: ${currentRole || "Not specified"}

- Education Background: ${educationBackground || "Not specified"}

- Location: ${location || "Not specified"}

**SPECIFIC FOCUS BASED ON USER TYPE:**`;

    if (userType) {
      switch(userType){
        case "fresher":
          contextualMessage += `

- Focus on foundational skills and entry-level requirements

- Emphasize practical projects and hands-on learning

- Include soft skills development

- Provide beginner-friendly resources`;
          break;

        case "growth":
          contextualMessage += `

- Focus on advanced skills and leadership development

- Emphasize industry-specific expertise

- Include management and strategic thinking skills

- Provide mid-to-senior level resources`;
          break;

        case "transition":
          contextualMessage += `

- Focus on transferable skills and new domain knowledge

- Emphasize bridging skills between current and target role

- Include industry-specific certifications

- Provide transition-focused resources`;
          break;

        case "explore":
          contextualMessage += `

- Focus on diverse skill sets and multiple career paths

- Emphasize discovery and experimentation

- Include broad skill categories

- Provide exploratory resources`;
          break;

        case "assessment":
          contextualMessage += `

- Focus on current skill evaluation and benchmarking

- Emphasize skill validation and certification

- Include assessment methods and tools

- Provide evaluation-focused resources`;
          break;

        case "market":
          contextualMessage += `

- Focus on market trends and industry analysis

- Emphasize salary data and job market conditions

- Include company insights and hiring trends

- Provide market-focused resources`;
          break;
      }
    }

    contextualMessage += `

Please provide a comprehensive skill gap analysis including:

1. Required skills with importance levels (critical/high/medium/low)

2. Recommended skills for career advancement

3. Specific skill levels needed (beginner/intermediate/advanced/expert)

4. Salary ranges and experience requirements

5. Learning recommendations with resources and timeframes

6. Career development timeline

Format the response in a structured, easy-to-read format with clear sections.`;
  }

  return contextualMessage;
}

