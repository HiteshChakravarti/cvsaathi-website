'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { 
  ArrowLeft, Mic, MicOff, Play, Pause, ChevronRight, ChevronLeft,
  Sparkles, Copy, CheckCircle, Trophy, Clock, Zap, Crown,
  Target, Briefcase, Building2, User, Volume2, X, Check,
  Lightbulb, TrendingUp, Star, Award, ThumbsUp, AlertCircle, Loader2, Trash2
} from 'lucide-react';
import { toast } from 'sonner';
import { useInterviewSessions, InterviewAnswer } from '../../hooks/useInterviewSessions';
import { useAICareerService } from '../../services/aiCareerService';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabaseClient';

// Question categories and types
type QuestionCategory = 'introduction' | 'technical' | 'behavioral' | 'situational' | 'closing';
type ExperienceLevel = 'fresher' | 'junior' | 'mid' | 'senior';
type Stage = 'setup' | 'interview' | 'results' | 'history';

interface Question {
  id: number;
  category: QuestionCategory;
  question: string;
  difficulty: ExperienceLevel;
  roles: string[];
  industries: string[];
  hints: string[];
  sampleAnswer: string;
  keyPoints: string[];
}

interface UserAnswer {
  questionId: number;
  answer: string;
  recording?: Blob;
  audioUrl?: string; // URL to saved audio in Supabase Storage
  timeSpent: number;
  feedback?: {
    score: number;
    strengths: string[];
    improvements: string[];
    detailedFeedback: string;
  };
}

interface AIInterviewPrepPageProps {
  onBack: () => void;
  isDark: boolean;
}

// Mock question bank
const QUESTION_BANK: Question[] = [
  // INTRODUCTION
  {
    id: 1,
    category: 'introduction',
    question: "Tell me about yourself and why you're interested in this position.",
    difficulty: 'fresher',
    roles: ['all'],
    industries: ['all'],
    hints: [
      'Start with your background and education',
      'Mention relevant skills and experiences',
      'Connect your interests to the role',
      'Keep it concise (2-3 minutes)'
    ],
    sampleAnswer: "I'm a recent graduate from XYZ University with a degree in Computer Science. During my studies, I developed strong programming skills in Java and Python through various projects, including a machine learning application that won our university hackathon. I'm particularly excited about this position because it combines my technical skills with the opportunity to work on innovative products. Your company's focus on cutting-edge technology and collaborative culture aligns perfectly with my career goals.",
    keyPoints: ['Background', 'Relevant skills', 'Achievements', 'Why this role']
  },
  {
    id: 2,
    category: 'introduction',
    question: "Walk me through your resume and highlight your most relevant experience.",
    difficulty: 'junior',
    roles: ['all'],
    industries: ['all'],
    hints: [
      'Follow chronological order',
      'Focus on achievements, not just duties',
      'Quantify your impact where possible',
      'Connect experiences to the target role'
    ],
    sampleAnswer: "I started my career at ABC Company as a Junior Developer, where I worked on developing and maintaining web applications using React and Node.js. During my 2 years there, I successfully delivered 15+ features and reduced page load time by 40%. I then moved to XYZ Corp as a Software Engineer, where I led a team of 3 developers on a critical project that increased user engagement by 60%. Most recently, I've been focusing on full-stack development and have expertise in cloud technologies like AWS.",
    keyPoints: ['Career progression', 'Key achievements', 'Technical skills', 'Leadership']
  },
  // TECHNICAL
  {
    id: 3,
    category: 'technical',
    question: "Explain a complex technical problem you solved and how you approached it.",
    difficulty: 'mid',
    roles: ['Software Engineer', 'Developer', 'Technical Lead'],
    industries: ['Technology', 'IT Services', 'SaaS'],
    hints: [
      'Use the STAR method (Situation, Task, Action, Result)',
      'Explain the technical details clearly',
      'Highlight your problem-solving process',
      'Mention the impact of your solution'
    ],
    sampleAnswer: "At my previous company, we faced a critical performance issue where our API response time increased to 5 seconds during peak hours, affecting 10,000+ users. I analyzed the system using profiling tools and discovered that N+1 database queries were the bottleneck. I implemented database query optimization using eager loading and added Redis caching for frequently accessed data. This reduced response time to under 500ms, improved user satisfaction by 75%, and saved $50K annually in infrastructure costs.",
    keyPoints: ['Problem identification', 'Technical approach', 'Implementation', 'Measurable results']
  },
  {
    id: 4,
    category: 'technical',
    question: "What technologies are you most comfortable with and why?",
    difficulty: 'junior',
    roles: ['Software Engineer', 'Developer', 'Full Stack Developer'],
    industries: ['Technology', 'IT Services'],
    hints: [
      'Mention your strongest tech stack',
      'Explain why you prefer these technologies',
      'Give examples of projects you built',
      'Show willingness to learn new technologies'
    ],
    sampleAnswer: "I'm most comfortable with the MERN stack - MongoDB, Express, React, and Node.js. I've used this stack extensively over the past 3 years to build scalable web applications. I particularly appreciate React's component-based architecture and hooks, which make code more maintainable. I've built 5+ production applications using this stack, including an e-commerce platform handling 50K daily users. That said, I'm always eager to learn new technologies and recently started exploring Next.js and TypeScript.",
    keyPoints: ['Primary tech stack', 'Reasoning', 'Practical experience', 'Growth mindset']
  },
  // BEHAVIORAL
  {
    id: 5,
    category: 'behavioral',
    question: "Describe a time when you had to work with a difficult team member. How did you handle it?",
    difficulty: 'mid',
    roles: ['all'],
    industries: ['all'],
    hints: [
      'Focus on the situation, not the person',
      'Explain your communication approach',
      'Highlight the resolution',
      'Show emotional intelligence'
    ],
    sampleAnswer: "During a critical project, I worked with a team member who consistently missed deadlines and was unresponsive to feedback. Instead of escalating immediately, I scheduled a one-on-one conversation to understand their perspective. I discovered they were overwhelmed with unclear requirements. Together, we broke down tasks into smaller, manageable pieces and set up daily check-ins. This approach improved their productivity by 80%, and we delivered the project on time. It taught me the importance of empathy and clear communication.",
    keyPoints: ['Situation', 'Your approach', 'Resolution', 'Learning']
  },
  {
    id: 6,
    category: 'behavioral',
    question: "Tell me about a time you failed. What did you learn from it?",
    difficulty: 'senior',
    roles: ['all'],
    industries: ['all'],
    hints: [
      'Choose a real failure, not a humble brag',
      'Take ownership without blaming others',
      'Focus on what you learned',
      'Explain how you applied those lessons'
    ],
    sampleAnswer: "Early in my career, I led a feature launch without proper testing because I was eager to meet an aggressive deadline. The feature had a critical bug that affected 30% of users, causing significant customer complaints. I immediately took ownership, rolled back the feature, and worked overtime with the team to fix it. This experience taught me that quality should never be compromised for speed. Since then, I've implemented rigorous testing protocols and code reviews in all my projects, resulting in a 95% reduction in production bugs.",
    keyPoints: ['Genuine failure', 'Accountability', 'Lessons learned', 'Changed behavior']
  },
  // SITUATIONAL
  {
    id: 7,
    category: 'situational',
    question: "How would you prioritize if you had multiple urgent tasks from different stakeholders?",
    difficulty: 'mid',
    roles: ['Project Manager', 'Product Manager', 'Team Lead'],
    industries: ['all'],
    hints: [
      'Explain your prioritization framework',
      'Mention stakeholder communication',
      'Consider business impact',
      'Show decision-making skills'
    ],
    sampleAnswer: "I would use a combination of impact and urgency to prioritize. First, I'd quickly assess each task's business impact, deadline, and dependencies. Then, I'd communicate with all stakeholders to understand their context and set clear expectations. For example, if Task A affects 1000 customers and Task B affects 10, I'd prioritize Task A. However, I'd negotiate timelines for Task B and provide regular updates. I'd also look for opportunities to delegate or parallelize work. This approach ensures transparency and maximizes business value.",
    keyPoints: ['Prioritization framework', 'Stakeholder management', 'Clear communication', 'Business focus']
  },
  {
    id: 8,
    category: 'situational',
    question: "If you disagreed with your manager's decision, what would you do?",
    difficulty: 'junior',
    roles: ['all'],
    industries: ['all'],
    hints: [
      'Show respect for authority',
      'Explain your approach to disagreement',
      'Focus on data and rationale',
      'Demonstrate flexibility'
    ],
    sampleAnswer: "I would first seek to understand my manager's reasoning by asking clarifying questions. If I still disagreed, I'd request a private meeting to share my concerns respectfully, backed by data and specific examples. For instance, if I believed a technical approach would cause issues, I'd present alternative solutions with pros/cons analysis. Ultimately, if my manager maintained their decision after hearing my perspective, I would support it fully while documenting any concerns. This approach has helped me build trust and occasionally influenced better decisions.",
    keyPoints: ['Understanding first', 'Respectful disagreement', 'Data-driven', 'Team player']
  },
  // MORE QUESTIONS
  {
    id: 9,
    category: 'technical',
    question: "How do you stay updated with the latest technology trends?",
    difficulty: 'fresher',
    roles: ['Software Engineer', 'Developer'],
    industries: ['Technology', 'IT Services'],
    hints: [
      'Mention specific resources you follow',
      'Talk about practical application',
      'Show continuous learning mindset',
      'Connect to career growth'
    ],
    sampleAnswer: "I actively follow tech blogs like Hacker News, Dev.to, and Medium. I subscribe to newsletters like JavaScript Weekly and React Status. I also participate in local developer meetups and attend conferences like React India. Most importantly, I dedicate 5 hours weekly to hands-on learning through side projects. Recently, I built a personal project using Next.js 14 to understand the new App Router. This combination of theory and practice helps me stay current and brings value to my team.",
    keyPoints: ['Learning resources', 'Community engagement', 'Hands-on practice', 'Application']
  },
  {
    id: 10,
    category: 'closing',
    question: "Why should we hire you? What makes you the best candidate?",
    difficulty: 'mid',
    roles: ['all'],
    industries: ['all'],
    hints: [
      'Connect your unique strengths to the role',
      'Use specific examples and achievements',
      'Show enthusiasm for the company',
      'Be confident but not arrogant'
    ],
    sampleAnswer: "I bring a unique combination of technical expertise, proven results, and cultural fit. With 5 years of full-stack development experience, I've consistently delivered high-impact projects like increasing system performance by 60% and leading a team that shipped 3 major features ahead of schedule. What sets me apart is my ability to bridge technical and business needs - I speak both languages fluently. I'm genuinely excited about your company's mission to democratize education through technology, and I'm confident I can contribute from day one while growing with the team.",
    keyPoints: ['Unique value proposition', 'Concrete achievements', 'Cultural alignment', 'Enthusiasm']
  }
];

// Experience levels
const EXPERIENCE_LEVELS = [
  { value: 'fresher', label: 'Fresher (0-2 years)', badge: 'Beginner', color: 'green' },
  { value: 'junior', label: 'Junior (2-4 years)', badge: 'Intermediate', color: 'blue' },
  { value: 'mid', label: 'Mid-level (4-7 years)', badge: 'Advanced', color: 'purple' },
  { value: 'senior', label: 'Senior (7+ years)', badge: 'Expert', color: 'red' }
];

// Roles
const ROLES = [
  'Software Engineer',
  'Full Stack Developer',
  'Frontend Developer',
  'Backend Developer',
  'DevOps Engineer',
  'Data Scientist',
  'Product Manager',
  'Project Manager',
  'Business Analyst',
  'UI/UX Designer',
  'Technical Lead',
  'Engineering Manager'
];

// Industries
const INDUSTRIES = [
  'Technology',
  'IT Services',
  'SaaS',
  'E-commerce',
  'Fintech',
  'Healthcare',
  'Education',
  'Media & Entertainment',
  'Consulting',
  'Startup',
  'Enterprise'
];

const CATEGORY_COLORS: Record<QuestionCategory, string> = {
  introduction: 'bg-gradient-to-r from-purple-500 to-pink-500',
  technical: 'bg-gradient-to-r from-blue-500 to-cyan-500',
  behavioral: 'bg-gradient-to-r from-green-500 to-emerald-500',
  situational: 'bg-gradient-to-r from-orange-500 to-red-500',
  closing: 'bg-gradient-to-r from-indigo-500 to-purple-500'
};

export function AIInterviewPrepPage({ onBack, isDark }: AIInterviewPrepPageProps) {
  const { user } = useAuth();
  const { sessions, createSession, updateSession, deleteSession, loading: sessionsLoading, refetch: refetchSessions } = useInterviewSessions();
  const { sendInterviewTurn } = useAICareerService();
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [generatingFeedback, setGeneratingFeedback] = useState(false);
  const [loadingQuestion, setLoadingQuestion] = useState(false);
  
  // AI Interview Session State
  const [aiSessionState, setAiSessionState] = useState<any | null>(null);
  const [currentAITurn, setCurrentAITurn] = useState<any | null>(null); // Current question or feedback from AI
  const [interviewMeta, setInterviewMeta] = useState<{
    target_role: string;
    experience_level: string;
    difficulty: 'easy' | 'standard' | 'hard';
    questions_target: number;
  } | null>(null);
  
  // History view state
  const [selectedHistorySession, setSelectedHistorySession] = useState<string | null>(null);
  const [historyFilters, setHistoryFilters] = useState({
    search: '',
    role: '',
    industry: '',
    minScore: 0,
    dateFrom: '',
    dateTo: '',
  });

  // Setup state
  const [stage, setStage] = useState<Stage>('setup');
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel>('fresher');
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [selectedIndustry, setSelectedIndustry] = useState<string>('');
  const [isPremium] = useState(false); // Mock premium status
  const [questionsUsedToday] = useState(3); // Mock usage
  const [dailyLimit] = useState(5); // Free tier limit

  // Interview state (for AI-driven flow)
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [showHints, setShowHints] = useState(false);
  const [showSampleAnswer, setShowSampleAnswer] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [interviewComplete, setInterviewComplete] = useState(false);

  // Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Safe clipboard copy function
  const copyToClipboard = async (text: string) => {
    try {
      // Try modern Clipboard API first
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        toast.success('Sample answer copied!');
      } else {
        // Fallback to older method
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
          document.execCommand('copy');
          toast.success('Sample answer copied!');
        } catch (err) {
          toast.error('Failed to copy. Please copy manually.');
        }
        textArea.remove();
      }
    } catch (err) {
      // Final fallback - show the text in a prompt
      toast.error('Please copy the text manually');
    }
  };

  // Map experience level to AI format
  const mapExperienceLevel = (level: ExperienceLevel): string => {
    switch (level) {
      case 'fresher': return '0-2 years';
      case 'junior': return '2-4 years';
      case 'mid': return '4-7 years';
      case 'senior': return '7+ years';
      default: return '0-2 years';
    }
  };

  // Start interview (AI-driven)
  const startInterview = async () => {
    if (!selectedRole || !selectedIndustry) {
      toast.error('Please select role and industry');
      return;
    }

    if (!isPremium && questionsUsedToday >= dailyLimit) {
      toast.error('Daily limit reached! Upgrade to Premium for unlimited questions.');
      return;
    }

    setLoadingQuestion(true);
    try {
      // Create interview session first
      let sessionId = currentSessionId;
      if (!sessionId) {
        try {
          const session = await createSession(selectedRole, selectedIndustry);
          sessionId = session.id;
          setCurrentSessionId(session.id);
          setSessionStartTime(new Date());
          console.log('Interview session created:', session.id);
        } catch (error: any) {
          console.warn('Session creation failed, but proceeding with interview:', error);
          setSessionStartTime(new Date());
        }
      }

      // Set interview metadata
      const meta = {
        target_role: selectedRole,
        experience_level: mapExperienceLevel(experienceLevel),
        difficulty: 'standard' as const,
        questions_target: 8,
      };
      setInterviewMeta(meta);

      // Call AI service for first turn (empty message, null session state)
      const firstTurn = await sendInterviewTurn('', meta, null, 'en');
      
      console.log('First AI turn received:', firstTurn);
      console.log('First turn structure check:', {
        hasFirstTurn: !!firstTurn,
        hasSessionState: !!firstTurn?.session_state,
        hasPayload: !!firstTurn?.payload,
        payloadKind: firstTurn?.payload?.kind,
        sessionStateKeys: firstTurn?.session_state ? Object.keys(firstTurn.session_state) : [],
        payloadKeys: firstTurn?.payload ? Object.keys(firstTurn.payload) : [],
      });

      // Validate response
      if (!firstTurn) {
        throw new Error('No response received from AI service');
      }
      
      if (!firstTurn.session_state) {
        console.error('Missing session_state in response:', firstTurn);
        throw new Error('Invalid response: missing session_state. Response structure: ' + JSON.stringify(Object.keys(firstTurn)));
      }
      
      if (!firstTurn.payload) {
        console.error('Missing payload in response:', firstTurn);
        throw new Error('Invalid response: missing payload. Response structure: ' + JSON.stringify(Object.keys(firstTurn)));
      }

      // Check if it's a question or feedback
      if (firstTurn.payload.kind === 'feedback') {
        // Interview ended immediately (shouldn't happen, but handle gracefully)
        setInterviewComplete(true);
        setCurrentAITurn(firstTurn);
        setStage('results');
        toast.info('Interview completed');
      } else {
        // It's a question - start the interview
        setAiSessionState(firstTurn.session_state);
        setCurrentAITurn(firstTurn);
        setStage('interview');
        toast.success('Interview started! Good luck! 🎤');
      }
    } catch (error: any) {
      console.error('Error starting interview:', error);
      toast.error(`Failed to start interview: ${error.message || 'Unknown error'}`);
    } finally {
      setLoadingQuestion(false);
    }
  };

  // Recording functions
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const url = URL.createObjectURL(audioBlob);
        setAudioURL(url);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

      toast.success('Recording started');
    } catch (err) {
      toast.error('Microphone access denied');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
      toast.success('Recording stopped');
    }
  };

  const playRecording = () => {
    if (audioURL) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      const audio = new Audio(audioURL);
      audioRef.current = audio;
      audio.play();
      setIsPlaying(true);
      audio.onended = () => setIsPlaying(false);
    }
  };

  const pauseRecording = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  // Upload audio to Supabase Storage
  const uploadAudioToStorage = async (audioBlob: Blob, questionId: number, sessionId: string): Promise<string | null> => {
    if (!user?.id) return null;

    try {
      const fileName = `${user.id}/${sessionId}/q${questionId}_${Date.now()}.wav`;
      const { data, error } = await supabase.storage
        .from('interview-recordings')
        .upload(fileName, audioBlob, {
          contentType: 'audio/wav',
          upsert: false,
        });

      if (error) {
        console.error('Error uploading audio:', error);
        return null;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('interview-recordings')
        .getPublicUrl(fileName);

      return urlData.publicUrl;
    } catch (error) {
      console.error('Error uploading audio to storage:', error);
      return null;
    }
  };

  // Submit answer (AI-driven)
  const submitAnswer = async () => {
    if (!currentAnswer && !audioURL) {
      toast.error('Please provide an answer or recording');
      return;
    }

    if (!interviewMeta || !aiSessionState || !currentAITurn) {
      toast.error('Interview session not initialized');
      return;
    }

    setGeneratingFeedback(true);
    setLoadingQuestion(true);
    setShowFeedback(false);
    
    try {
      let audioUrl: string | undefined;
      
      // Upload audio if recording exists
      if (audioURL && audioChunksRef.current.length > 0 && currentSessionId && currentAITurn.payload?.question_id) {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const uploadedUrl = await uploadAudioToStorage(
          audioBlob,
          currentAITurn.payload.question_id,
          currentSessionId
        );
        if (uploadedUrl) {
          audioUrl = uploadedUrl;
          toast.success('Audio recording saved!');
        }
      }

      // Save current answer
      const currentQuestionId = currentAITurn.payload?.question_id || `q_${aiSessionState.question_index}`;
      const newAnswer: UserAnswer = {
        questionId: currentQuestionId as any, // Store as string ID
        answer: currentAnswer,
        audioUrl,
        timeSpent: recordingTime,
      };
      setUserAnswers([...userAnswers, newAnswer]);

      // Send answer to AI and get next turn
      const nextTurn = await sendInterviewTurn(currentAnswer, interviewMeta, aiSessionState, 'en');
      
      console.log('Next AI turn received:', nextTurn);

      // Validate response
      if (!nextTurn || !nextTurn.session_state || !nextTurn.payload) {
        throw new Error('Invalid response from AI service');
      }

      // Update session state
      setAiSessionState(nextTurn.session_state);

      // Check if interview is complete (feedback received)
      if (nextTurn.payload.kind === 'feedback') {
        // Interview complete - save session and show results
        setInterviewComplete(true);
        setCurrentAITurn(nextTurn);
        
        // Save final answer with feedback
        const finalAnswer: UserAnswer = {
          ...newAnswer,
          feedback: {
            score: nextTurn.payload.scores?.overall || 0,
            strengths: nextTurn.payload.strengths || [],
            improvements: nextTurn.payload.improvements || [],
            detailedFeedback: nextTurn.payload.summary || '',
          }
        };
        setUserAnswers(prev => [...prev.slice(0, -1), finalAnswer]);

        // Save session to database
        await saveInterviewSession(nextTurn);
        
        setStage('results');
        toast.success('Interview completed!');
      } else {
        // It's another question - continue interview
        setCurrentAITurn(nextTurn);
        setCurrentAnswer('');
        setAudioURL(null);
        setRecordingTime(0);
        setShowHints(false);
        setShowSampleAnswer(false);
        toast.success('Answer submitted! Next question...');
      }
    } catch (error: any) {
      console.error('Error submitting answer:', error);
      toast.error(`Failed to submit answer: ${error.message || 'Unknown error'}`);
    } finally {
      setGeneratingFeedback(false);
      setLoadingQuestion(false);
    }
  };

  // Save interview session to database
  const saveInterviewSession = async (finalTurn: any) => {
    try {
      const durationMinutes = sessionStartTime 
        ? Math.round((new Date().getTime() - sessionStartTime.getTime()) / 60000)
        : 0;

      // Extract scores from final feedback
      const finalScores = finalTurn.payload?.scores || {};
      const totalScore = finalScores.overall || 0;
      const avgScore = finalScores.overall || 0;

      // Convert userAnswers to InterviewAnswer format and collect audio URLs
      const audioUrls: Record<string, string> = {};
      const interviewAnswers: InterviewAnswer[] = userAnswers.map((answer, index) => {
        const questionId = answer.questionId?.toString() || `q_${index}`;
        if (answer.audioUrl) {
          audioUrls[questionId] = answer.audioUrl;
        }
        return {
          questionId: index + 1, // Use index as questionId
          question: aiSessionState?.transcript?.[index]?.question || `Question ${index + 1}`,
          answer: answer.answer,
          audioUrl: answer.audioUrl,
          score: answer.feedback?.score,
          feedback: answer.feedback,
          timeSpent: answer.timeSpent,
        };
      });

      // If session wasn't created at start, create it now
      let sessionId = currentSessionId;
      if (!sessionId) {
        try {
          const newSession = await createSession(selectedRole || '', selectedIndustry || '');
          sessionId = newSession.id;
          setCurrentSessionId(sessionId);
          console.log('Session created on completion:', sessionId);
        } catch (createError) {
          console.warn('Could not create session on completion:', createError);
        }
      }

      // Update session with results if we have a session ID
      if (sessionId) {
        // Calculate estimated duration if not tracked
        const finalDuration = durationMinutes > 0 
          ? durationMinutes 
          : Math.max(1, Math.round(answeredCount * 2)); // Estimate 2 min per question
        
        await updateSession(sessionId, {
          questions: interviewAnswers.length > 0 ? interviewAnswers : undefined, // Only save if we have answers
          audio_urls: Object.keys(audioUrls).length > 0 ? audioUrls : undefined,
          total_score: totalScore > 0 ? Math.round(totalScore * 10) : undefined, // Convert to 0-100 scale
          average_score: avgScore > 0 ? Math.round(avgScore * 10) : undefined,
          duration_minutes: finalDuration,
          completed_at: new Date().toISOString(),
        });
        
        // Refresh sessions list to show in history
        await refetchSessions();
        
        toast.success('Interview session saved!');
      }
    } catch (error) {
      console.error('Error saving interview session:', error);
      toast.error('Failed to save session, but results are still available.');
    }
  };

  // Get current question from AI turn
  const currentQuestion = currentAITurn?.payload?.kind === 'question' ? {
    id: currentAITurn.payload.question_id,
    question: currentAITurn.payload.question,
    topic: currentAITurn.payload.topic,
    phase: currentAITurn.payload.phase,
    helper_hint: currentAITurn.payload.helper_hint,
  } : null;

  // Calculate progress from AI session state
  const progress = aiSessionState 
    ? ((aiSessionState.question_index + 1) / (aiSessionState.total_questions || 8)) * 100
    : 0;
  const answeredCount = userAnswers.length;
  const averageScore = currentAITurn?.payload?.kind === 'feedback' && currentAITurn.payload.scores
    ? currentAITurn.payload.scores.overall * 10 // Convert to 0-100 scale
    : 0;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`min-h-screen p-6 ${isDark ? 'bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900' : 'bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50'}`}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            onClick={onBack}
            className={`mb-6 inline-flex items-center gap-2 px-4 py-2 rounded-full shadow-sm transition-colors ${
              isDark
                ? 'bg-teal-600 text-white hover:bg-teal-500'
                : 'bg-white text-gray-800 border border-gray-300 hover:bg-gray-100'
            }`}
          >
            <ArrowLeft className="size-5" />
            <span className="font-medium">Back to Dashboard</span>
          </Button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className={`text-4xl mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                🎤 AI Interview Prep
              </h1>
              <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                Practice with AI-powered mock interviews
              </p>
            </div>
            
            {/* Usage tracker */}
            <div className={`px-6 py-3 rounded-xl ${isDark ? 'bg-white/10' : 'bg-white'} flex items-center gap-3`}>
              <div className={`w-10 h-10 rounded-full ${isPremium ? 'bg-gradient-to-br from-yellow-400 to-orange-500' : 'bg-gradient-to-br from-gray-400 to-gray-500'} flex items-center justify-center`}>
                {isPremium ? <Crown className="size-5 text-white" /> : <Zap className="size-5 text-white" />}
              </div>
              <div>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {isPremium ? 'Premium' : 'Free Plan'}
                </p>
                <p className={isDark ? 'text-white' : 'text-gray-900'}>
                  {isPremium ? 'Unlimited' : `${questionsUsedToday}/${dailyLimit} today`}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs for Setup/History */}
        <div className="mb-6 flex gap-4 border-b border-white/10">
          <button
            onClick={() => {
              setStage('setup');
              setSelectedHistorySession(null);
            }}
            className={`px-6 py-3 font-semibold transition-colors border-b-2 ${
              stage === 'setup' || stage === 'interview' || stage === 'results'
                ? isDark
                  ? 'border-purple-500 text-purple-400'
                  : 'border-purple-600 text-purple-600'
                : isDark
                  ? 'border-transparent text-gray-400 hover:text-white'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            New Interview
          </button>
          <button
            onClick={() => setStage('history')}
            className={`px-6 py-3 font-semibold transition-colors border-b-2 ${
              stage === 'history'
                ? isDark
                  ? 'border-purple-500 text-purple-400'
                  : 'border-purple-600 text-purple-600'
                : isDark
                  ? 'border-transparent text-gray-400 hover:text-white'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            History ({sessions.length})
          </button>
        </div>

        {/* STAGE: SETUP */}
        {stage === 'setup' && (
          <div className="space-y-6">
            {/* Experience Level */}
            <div className={`p-8 rounded-2xl ${isDark ? 'bg-white/5' : 'bg-white'}`}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <Target className="size-6 text-white" />
                </div>
                <div>
                  <h2 className={`text-2xl ${isDark ? 'text-white' : 'text-gray-900'}`}>Experience Level</h2>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Select your experience level</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                {EXPERIENCE_LEVELS.map((level) => (
                  <button
                    key={level.value}
                    onClick={() => setExperienceLevel(level.value as ExperienceLevel)}
                    className={`p-6 rounded-xl border-2 transition-all text-left ${
                      experienceLevel === level.value
                        ? `border-${level.color}-500 bg-${level.color}-500/10`
                        : isDark ? 'border-white/10 hover:border-white/20' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>{level.label}</span>
                      <span className={`px-3 py-1 rounded-full text-xs bg-${level.color}-500/20 text-${level.color}-500`}>
                        {level.badge}
                      </span>
                    </div>
                    {experienceLevel === level.value && (
                      <CheckCircle className={`size-5 text-${level.color}-500`} />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Role Selection */}
            <div className={`p-8 rounded-2xl ${isDark ? 'bg-white/5' : 'bg-white'}`}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                  <Briefcase className="size-6 text-white" />
                </div>
                <div>
                  <h2 className={`text-2xl ${isDark ? 'text-white' : 'text-gray-900'}`}>Target Role</h2>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>What position are you interviewing for? (e.g., Software Engineer, Product Manager, Data Scientist)</p>
                </div>
              </div>
              
              <input
                type="text"
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                placeholder="Enter your target role (e.g., Software Engineer, Product Manager)"
                className={`w-full px-4 py-3 rounded-xl border-2 ${
                  isDark ? 'bg-white/5 border-white/10 text-white placeholder-gray-500' : 'bg-gray-50 border-gray-200 placeholder-gray-400'
                } focus:outline-none focus:ring-2 focus:ring-purple-500`}
              />
              
              {/* Suggested roles (optional helper) */}
              <div className="mt-3">
                <p className={`text-xs mb-2 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Popular roles:</p>
                <div className="flex flex-wrap gap-2">
                  {ROLES.slice(0, 6).map((role) => (
                    <button
                      key={role}
                      onClick={() => setSelectedRole(role)}
                      className={`px-3 py-1 rounded-full text-xs transition-colors ${
                        isDark 
                          ? 'bg-white/10 hover:bg-white/20 text-gray-300' 
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                      }`}
                    >
                      {role}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Industry Selection */}
            <div className={`p-8 rounded-2xl ${isDark ? 'bg-white/5' : 'bg-white'}`}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                  <Building2 className="size-6 text-white" />
                </div>
                <div>
                  <h2 className={`text-2xl ${isDark ? 'text-white' : 'text-gray-900'}`}>Industry</h2>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Which industry is the company in? (e.g., Technology, Healthcare, Finance)</p>
                </div>
              </div>
              
              <input
                type="text"
                value={selectedIndustry}
                onChange={(e) => setSelectedIndustry(e.target.value)}
                placeholder="Enter the industry (e.g., Technology, Healthcare, Finance)"
                className={`w-full px-4 py-3 rounded-xl border-2 ${
                  isDark ? 'bg-white/5 border-white/10 text-white placeholder-gray-500' : 'bg-gray-50 border-gray-200 placeholder-gray-400'
                } focus:outline-none focus:ring-2 focus:ring-purple-500`}
              />
              
              {/* Suggested industries (optional helper) */}
              <div className="mt-3">
                <p className={`text-xs mb-2 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Popular industries:</p>
                <div className="flex flex-wrap gap-2">
                  {INDUSTRIES.slice(0, 6).map((industry) => (
                    <button
                      key={industry}
                      onClick={() => setSelectedIndustry(industry)}
                      className={`px-3 py-1 rounded-full text-xs transition-colors ${
                        isDark 
                          ? 'bg-white/10 hover:bg-white/20 text-gray-300' 
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                      }`}
                    >
                      {industry}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Start Button */}
            <Button
              onClick={startInterview}
              disabled={!selectedRole || !selectedIndustry || loadingQuestion}
              className="w-full py-6 text-lg bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0 disabled:opacity-50"
            >
              {loadingQuestion ? (
                <>
                  <Loader2 className="size-5 mr-2 animate-spin" />
                  Starting AI Interview...
                </>
              ) : (
                <>
                  <Play className="size-5 mr-2" />
                  Start AI-Powered Interview
                </>
              )}
            </Button>

            {!isPremium && (
              <div className={`p-6 rounded-xl ${isDark ? 'bg-yellow-500/10 border-2 border-yellow-500/20' : 'bg-yellow-50 border-2 border-yellow-200'}`}>
                <div className="flex items-start gap-3">
                  <AlertCircle className="size-5 text-yellow-500 mt-1" />
                  <div>
                    <p className={isDark ? 'text-yellow-400' : 'text-yellow-700'}>
                      Free users: {dailyLimit - questionsUsedToday} questions remaining today. 
                      <button className="ml-2 underline font-medium">Upgrade to Premium</button> for unlimited practice!
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* STAGE: INTERVIEW */}
        {stage === 'interview' && currentQuestion && (
          <div className="space-y-6">
            {/* Progress Bar */}
            {loadingQuestion ? (
              <div className={`p-6 rounded-2xl ${isDark ? 'bg-white/5' : 'bg-white'} text-center`}>
                <Loader2 className="size-8 animate-spin text-purple-500 mx-auto mb-2" />
                <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>AI is preparing the next question...</p>
              </div>
            ) : (
              <div className={`p-6 rounded-2xl ${isDark ? 'bg-white/5' : 'bg-white'}`}>
                <div className="flex items-center justify-between mb-3">
                  <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                    Question {aiSessionState?.question_index + 1 || 1} of {aiSessionState?.total_questions || 8}
                  </span>
                  <span className={isDark ? 'text-white' : 'text-gray-900'}>
                    {Math.round(progress)}% Complete
                  </span>
                </div>
                <div className={`h-3 rounded-full ${isDark ? 'bg-white/10' : 'bg-gray-200'}`}>
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Question Card */}
            <div className={`p-8 rounded-2xl ${isDark ? 'bg-white/5' : 'bg-white'}`}>
              {/* Phase Badge */}
              <div className="flex items-center gap-3 mb-6">
                <span className={`px-4 py-2 rounded-full text-white text-sm bg-gradient-to-r from-purple-500 to-pink-500`}>
                  {currentQuestion.phase ? currentQuestion.phase.charAt(0).toUpperCase() + currentQuestion.phase.slice(1).replace('_', ' ') : 'Interview'}
                </span>
                {currentQuestion.topic && (
                  <span className={`px-4 py-2 rounded-full text-sm ${isDark ? 'bg-white/10 text-gray-400' : 'bg-gray-100 text-gray-600'}`}>
                    {currentQuestion.topic}
                  </span>
                )}
              </div>

              {/* Question */}
              <h2 className={`text-2xl mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {currentQuestion.question}
              </h2>

              {/* Helper Hint (if provided by AI) */}
              {currentQuestion.helper_hint && (
                <div className={`p-4 rounded-xl mb-6 ${isDark ? 'bg-purple-500/10 border border-purple-500/20' : 'bg-purple-50 border border-purple-200'}`}>
                  <div className="flex items-start gap-2">
                    <Lightbulb className="size-5 text-purple-500 mt-0.5" />
                    <p className={`${isDark ? 'text-purple-300' : 'text-purple-700'}`}>
                      <strong>Hint:</strong> {currentQuestion.helper_hint}
                    </p>
                  </div>
                </div>
              )}

              {/* Answer Input */}
              <div className="mb-6">
                <label className={`block text-sm mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Your Answer
                </label>
                <textarea
                  value={currentAnswer}
                  onChange={(e) => setCurrentAnswer(e.target.value)}
                  placeholder="Type your answer here or record audio below..."
                  rows={8}
                  className={`w-full px-4 py-3 rounded-xl border-2 ${
                    isDark ? 'bg-white/5 border-white/10 text-white placeholder-gray-500' : 'bg-gray-50 border-gray-200 placeholder-gray-400'
                  }`}
                />
              </div>

              {/* Recording Controls */}
              <div className={`p-6 rounded-xl mb-6 ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
                <div className="flex items-center justify-between mb-4">
                  <span className={isDark ? 'text-white' : 'text-gray-900'}>Voice Recording</span>
                  {recordingTime > 0 && (
                    <span className={`flex items-center gap-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      <Clock className="size-4" />
                      {formatTime(recordingTime)}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  {!isRecording ? (
                    <Button
                      onClick={startRecording}
                      className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white border-0"
                    >
                      <Mic className="size-4 mr-2" />
                      Start Recording
                    </Button>
                  ) : (
                    <Button
                      onClick={stopRecording}
                      className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white border-0"
                    >
                      <MicOff className="size-4 mr-2" />
                      Stop Recording
                    </Button>
                  )}

                  {audioURL && (
                    <>
                      {!isPlaying ? (
                        <Button
                          onClick={playRecording}
                          className={isDark ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-gray-200 hover:bg-gray-300'}
                        >
                          <Play className="size-4 mr-2" />
                          Play
                        </Button>
                      ) : (
                        <Button
                          onClick={pauseRecording}
                          className={isDark ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-gray-200 hover:bg-gray-300'}
                        >
                          <Pause className="size-4 mr-2" />
                          Pause
                        </Button>
                      )}
                      <span className="text-sm text-green-500 flex items-center gap-2">
                        <CheckCircle className="size-4" />
                        Recording saved
                      </span>
                    </>
                  )}

                  {isRecording && (
                    <span className="flex items-center gap-2 text-red-500 animate-pulse">
                      <Volume2 className="size-4" />
                      Recording...
                    </span>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              {!showFeedback && !loadingQuestion && (
                <Button
                  onClick={submitAnswer}
                  disabled={(!currentAnswer && !audioURL) || generatingFeedback}
                  className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white border-0 disabled:opacity-50"
                >
                  {generatingFeedback ? (
                    <>
                      <Loader2 className="size-4 mr-2 animate-spin" />
                      Submitting Answer...
                    </>
                  ) : (
                    <>
                      <Sparkles className="size-4 mr-2" />
                      Submit Answer
                    </>
                  )}
                </Button>
              )}

              {/* AI Feedback (shown after answer submission, before next question) */}
              {showFeedback && userAnswers.length > 0 && userAnswers[userAnswers.length - 1]?.feedback && (
                <div className="space-y-4 mt-6">
                  {/* Score */}
                  <div className={`p-6 rounded-xl text-center ${isDark ? 'bg-gradient-to-br from-green-500/20 to-emerald-500/20' : 'bg-gradient-to-br from-green-50 to-emerald-50'}`}>
                    <div className="text-5xl mb-2">
                      {userAnswers[userAnswers.length - 1].feedback!.score >= 80 ? '🎉' : 
                       userAnswers[userAnswers.length - 1].feedback!.score >= 60 ? '👍' : '💪'}
                    </div>
                    <h3 className={`text-3xl mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {userAnswers[userAnswers.length - 1].feedback!.score}/100
                    </h3>
                    <p className="text-green-500">
                      {userAnswers[userAnswers.length - 1].feedback!.detailedFeedback}
                    </p>
                  </div>

                  {/* Strengths & Improvements */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className={`p-4 rounded-xl ${isDark ? 'bg-green-500/10' : 'bg-green-50'}`}>
                      <h4 className={`flex items-center gap-2 mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        <ThumbsUp className="size-4 text-green-500" />
                        Strengths
                      </h4>
                      <ul className="space-y-2">
                        {userAnswers[userAnswers.length - 1].feedback!.strengths.map((s, i) => (
                          <li key={i} className={`text-sm flex items-start gap-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            <Check className="size-4 text-green-500 mt-0.5" />
                            {s}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className={`p-4 rounded-xl ${isDark ? 'bg-orange-500/10' : 'bg-orange-50'}`}>
                      <h4 className={`flex items-center gap-2 mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        <TrendingUp className="size-4 text-orange-500" />
                        Improvements
                      </h4>
                      <ul className="space-y-2">
                        {userAnswers[userAnswers.length - 1].feedback!.improvements.map((imp, i) => (
                          <li key={i} className={`text-sm flex items-start gap-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            <Star className="size-4 text-orange-500 mt-0.5" />
                            {imp}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Navigation - simplified for AI-driven flow */}
            <div className="flex items-center justify-center">
              <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                {answeredCount} question{answeredCount !== 1 ? 's' : ''} answered
              </span>
            </div>
          </div>
        )}

        {/* STAGE: RESULTS */}
        {stage === 'results' && (
          <div className="space-y-6">
            {/* Celebration */}
            <div className={`p-12 rounded-2xl text-center ${isDark ? 'bg-gradient-to-br from-purple-500/20 to-pink-500/20' : 'bg-gradient-to-br from-purple-50 to-pink-50'}`}>
              <div className="text-8xl mb-4">🎉</div>
              <h2 className={`text-4xl mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Interview Complete!
              </h2>
              <p className={`text-xl ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                You answered {answeredCount} questions
              </p>
            </div>

            {/* Overall Score */}
            <div className={`p-8 rounded-2xl ${isDark ? 'bg-white/5' : 'bg-white'}`}>
              <h3 className={`text-2xl mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Your Performance
              </h3>

              <div className="grid grid-cols-3 gap-6 mb-8">
                <div className={`p-6 rounded-xl text-center ${isDark ? 'bg-gradient-to-br from-purple-500/20 to-pink-500/20' : 'bg-gradient-to-br from-purple-50 to-pink-50'}`}>
                  <Trophy className="size-12 mx-auto mb-3 text-purple-500" />
                  <p className={`text-4xl mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {averageScore}
                  </p>
                  <p className="text-purple-500">Average Score</p>
                </div>

                <div className={`p-6 rounded-xl text-center ${isDark ? 'bg-gradient-to-br from-green-500/20 to-emerald-500/20' : 'bg-gradient-to-br from-green-50 to-emerald-50'}`}>
                  <CheckCircle className="size-12 mx-auto mb-3 text-green-500" />
                  <p className={`text-4xl mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {answeredCount}/{aiSessionState?.total_questions || answeredCount}
                  </p>
                  <p className="text-green-500">Completed</p>
                </div>

                <div className={`p-6 rounded-xl text-center ${isDark ? 'bg-gradient-to-br from-blue-500/20 to-cyan-500/20' : 'bg-gradient-to-br from-blue-50 to-cyan-50'}`}>
                  <Clock className="size-12 mx-auto mb-3 text-blue-500" />
                  <p className={`text-4xl mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {(() => {
                      const totalSeconds = userAnswers.reduce((sum, a) => sum + a.timeSpent, 0);
                      const estimatedMinutes = totalSeconds > 0 
                        ? Math.round(totalSeconds / 60) 
                        : Math.max(1, Math.round((answeredCount * 2))); // Estimate 2 min per question if no time tracked
                      return estimatedMinutes;
                    })()}
                  </p>
                  <p className="text-blue-500">Minutes</p>
                </div>
              </div>

              {/* AI Feedback Summary */}
              {currentAITurn?.payload?.kind === 'feedback' && (
                <>
                  <h4 className={`text-xl mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Interview Summary
                  </h4>
                  
                  <div className={`p-6 rounded-xl mb-6 ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
                    <p className={`mb-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {currentAITurn.payload.summary}
                    </p>
                    
                    {/* Strengths & Improvements */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h5 className={`font-semibold mb-2 ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                          Strengths
                        </h5>
                        <ul className="space-y-1">
                          {currentAITurn.payload.strengths?.map((s: string, i: number) => (
                            <li key={i} className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                              ✓ {s}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h5 className={`font-semibold mb-2 ${isDark ? 'text-orange-400' : 'text-orange-600'}`}>
                          Areas for Improvement
                        </h5>
                        <ul className="space-y-1">
                          {currentAITurn.payload.improvements?.map((imp: string, i: number) => (
                            <li key={i} className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                              • {imp}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Skill Gaps */}
                    {currentAITurn.payload.skill_gaps && currentAITurn.payload.skill_gaps.length > 0 && (
                      <div className="mt-4">
                        <h5 className={`font-semibold mb-2 ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`}>
                          Skill Gaps Identified
                        </h5>
                        <ul className="space-y-1">
                          {currentAITurn.payload.skill_gaps.map((gap: string, i: number) => (
                            <li key={i} className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                              ⚠ {gap}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Next Steps */}
                    {currentAITurn.payload.next_steps && currentAITurn.payload.next_steps.length > 0 && (
                      <div className="mt-4">
                        <h5 className={`font-semibold mb-2 ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                          Recommended Next Steps
                        </h5>
                        <ul className="space-y-1">
                          {currentAITurn.payload.next_steps.map((step: string, i: number) => (
                            <li key={i} className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                              → {step}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Detailed Scores */}
                  {currentAITurn.payload.scores && (
                    <div>
                      <h4 className={`text-xl mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Detailed Scores
                      </h4>
                      <div className="space-y-3">
                        {Object.entries(currentAITurn.payload.scores).map(([key, value]: [string, any]) => {
                          const explanation = currentAITurn.payload.score_explanations?.[key];
                          const scoreValue = Math.round(value * 10);
                          const scoreLabel = scoreValue >= 80 ? 'Strong' : scoreValue >= 60 ? 'Good' : 'Needs Improvement';
                          const scoreColor = scoreValue >= 80 ? 'text-green-500' : scoreValue >= 60 ? 'text-yellow-500' : 'text-orange-500';
                          
                          return (
                            <div key={key} className={`p-4 rounded-xl ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
                              <div className="flex items-center justify-between mb-2">
                                <div>
                                  <span className={isDark ? 'text-white' : 'text-gray-900'}>
                                    {key.charAt(0).toUpperCase() + key.slice(1)}
                                  </span>
                                  {explanation && (
                                    <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                      {explanation}
                                    </p>
                                  )}
                                </div>
                                <div className="text-right">
                                  <span className={`text-lg font-semibold ${scoreColor}`}>
                                    {scoreValue}/100
                                  </span>
                                  <p className={`text-xs ${scoreColor}`}>
                                    {scoreLabel}
                                  </p>
                                </div>
                              </div>
                              <div className={`h-2 rounded-full ${isDark ? 'bg-white/10' : 'bg-gray-200'}`}>
                                <div
                                  className={`h-full rounded-full ${
                                    scoreValue >= 80 ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
                                    scoreValue >= 60 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                                    'bg-gradient-to-r from-orange-500 to-red-500'
                                  }`}
                                  style={{ width: `${scoreValue}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-4">
              <Button
                onClick={() => {
                  setStage('setup');
                  setUserAnswers([]);
                  setCurrentAnswer('');
                  setCurrentSessionId(null);
                  setSessionStartTime(null);
                  setAiSessionState(null);
                  setCurrentAITurn(null);
                  setInterviewMeta(null);
                  setInterviewComplete(false);
                  toast.success('Starting new practice session!');
                }}
                className={isDark ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-white hover:bg-gray-50'}
              >
                <Play className="size-4 mr-2" />
                Practice Again
              </Button>

              <Button
                onClick={onBack}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0"
              >
                Back to Dashboard
                <ChevronRight className="size-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* STAGE: HISTORY */}
        {stage === 'history' && (
          <div className="space-y-6">
            {/* Filters */}
            <div className={`p-6 rounded-2xl ${isDark ? 'bg-white/5' : 'bg-white'}`}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <input
                  type="text"
                  placeholder="Search sessions..."
                  value={historyFilters.search}
                  onChange={(e) => setHistoryFilters({ ...historyFilters, search: e.target.value })}
                  className={`px-4 py-2 rounded-xl border ${
                    isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-gray-50 border-gray-200'
                  }`}
                />
                <select
                  value={historyFilters.role}
                  onChange={(e) => setHistoryFilters({ ...historyFilters, role: e.target.value })}
                  className={`px-4 py-2 rounded-xl border ${
                    isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <option value="">All Roles</option>
                  {ROLES.map(role => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
                <select
                  value={historyFilters.industry}
                  onChange={(e) => setHistoryFilters({ ...historyFilters, industry: e.target.value })}
                  className={`px-4 py-2 rounded-xl border ${
                    isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <option value="">All Industries</option>
                  {INDUSTRIES.map(industry => (
                    <option key={industry} value={industry}>{industry}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input
                  type="number"
                  placeholder="Min Score"
                  min="0"
                  max="100"
                  value={historyFilters.minScore}
                  onChange={(e) => setHistoryFilters({ ...historyFilters, minScore: parseInt(e.target.value) || 0 })}
                  className={`px-4 py-2 rounded-xl border ${
                    isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-gray-50 border-gray-200'
                  }`}
                />
                <input
                  type="date"
                  value={historyFilters.dateFrom}
                  onChange={(e) => setHistoryFilters({ ...historyFilters, dateFrom: e.target.value })}
                  className={`px-4 py-2 rounded-xl border ${
                    isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-gray-50 border-gray-200'
                  }`}
                />
                <input
                  type="date"
                  value={historyFilters.dateTo}
                  onChange={(e) => setHistoryFilters({ ...historyFilters, dateTo: e.target.value })}
                  className={`px-4 py-2 rounded-xl border ${
                    isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-gray-50 border-gray-200'
                  }`}
                />
              </div>
            </div>

            {/* Session List or Detail View */}
            {selectedHistorySession ? (
              <SessionDetailView
                session={sessions.find(s => s.id === selectedHistorySession)!}
                onBack={() => setSelectedHistorySession(null)}
                onDelete={async () => {
                  await deleteSession(selectedHistorySession);
                  setSelectedHistorySession(null);
                  toast.success('Session deleted');
                }}
                isDark={isDark}
              />
            ) : (
              <SessionListView
                sessions={sessions}
                filters={historyFilters}
                onSelectSession={setSelectedHistorySession}
                onDelete={deleteSession}
                loading={sessionsLoading}
                isDark={isDark}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Session List View Component
function SessionListView({ 
  sessions, 
  filters, 
  onSelectSession, 
  onDelete, 
  loading,
  isDark 
}: {
  sessions: any[];
  filters: any;
  onSelectSession: (id: string) => void;
  onDelete: (id: string) => Promise<void>;
  loading: boolean;
  isDark: boolean;
}) {
  // Filter sessions
  const filteredSessions = sessions.filter(session => {
    if (filters.search && !session.target_roles?.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }
    if (filters.role && session.target_roles !== filters.role) {
      return false;
    }
    if (filters.industry && session.industry !== filters.industry) {
      return false;
    }
    if (filters.minScore && (session.average_score || 0) < filters.minScore) {
      return false;
    }
    if (filters.dateFrom && new Date(session.created_at) < new Date(filters.dateFrom)) {
      return false;
    }
    if (filters.dateTo && new Date(session.created_at) > new Date(filters.dateTo)) {
      return false;
    }
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="size-8 animate-spin text-purple-500" />
      </div>
    );
  }

  if (filteredSessions.length === 0) {
    return (
      <div className={`p-12 rounded-2xl text-center ${isDark ? 'bg-white/5' : 'bg-white'}`}>
        <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
          {sessions.length === 0 ? 'No interview sessions yet. Start practicing!' : 'No sessions match your filters.'}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {filteredSessions.map(session => (
        <div
          key={session.id}
          onClick={() => onSelectSession(session.id)}
          className={`p-6 rounded-2xl border cursor-pointer transition-all hover:scale-[1.02] ${
            isDark ? 'bg-white/5 border-white/10 hover:border-white/20' : 'bg-white border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className={`text-lg font-semibold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {session.target_roles || 'General Interview'}
              </h3>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {session.industry || 'General Industry'}
              </p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (confirm('Are you sure you want to delete this session?')) {
                  onDelete(session.id);
                }
              }}
              className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
            >
              <Trash2 className="size-4 text-red-500" />
            </button>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Score</span>
              <span className={`text-lg font-semibold ${
                (session.average_score || 0) >= 80 ? 'text-green-500' :
                (session.average_score || 0) >= 60 ? 'text-yellow-500' : 'text-red-500'
              }`}>
                {session.average_score || 0}%
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Duration</span>
              <span className={isDark ? 'text-white' : 'text-gray-900'}>
                {session.duration_minutes || 0} min
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Questions</span>
              <span className={isDark ? 'text-white' : 'text-gray-900'}>
                {session.questions?.length || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Date</span>
              <span className={isDark ? 'text-white' : 'text-gray-900'}>
                {new Date(session.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Session Detail View Component
function SessionDetailView({
  session,
  onBack,
  onDelete,
  isDark
}: {
  session: any;
  onBack: () => void;
  onDelete: () => Promise<void>;
  isDark: boolean;
}) {
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const audioRefs = useRef<Record<string, HTMLAudioElement>>({});

  const playAudio = (questionId: number, audioUrl: string) => {
    const id = questionId.toString();
    if (audioRefs.current[id]) {
      audioRefs.current[id].pause();
      delete audioRefs.current[id];
    }
    const audio = new Audio(audioUrl);
    audioRefs.current[id] = audio;
    audio.play();
    setPlayingAudioId(id);
    audio.onended = () => setPlayingAudioId(null);
  };

  const stopAudio = (questionId: number) => {
    const id = questionId.toString();
    if (audioRefs.current[id]) {
      audioRefs.current[id].pause();
      delete audioRefs.current[id];
      setPlayingAudioId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={`p-6 rounded-2xl ${isDark ? 'bg-white/5' : 'bg-white'} flex items-center justify-between`}>
        <div>
          <h2 className={`text-2xl font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {session.target_roles || 'General Interview'}
          </h2>
          <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
            {session.industry || 'General Industry'} • {new Date(session.created_at).toLocaleDateString()}
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={onBack}
            className={isDark ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-gray-100 hover:bg-gray-200'}
          >
            <ArrowLeft className="size-4 mr-2" />
            Back
          </Button>
          <Button
            onClick={async () => {
              if (confirm('Are you sure you want to delete this session?')) {
                await onDelete();
              }
            }}
            className="bg-red-500 hover:bg-red-600 text-white"
          >
            <Trash2 className="size-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className={`p-6 rounded-2xl text-center ${isDark ? 'bg-white/5' : 'bg-white'}`}>
          <p className={`text-3xl font-bold mb-1 ${
            (session.average_score || 0) >= 80 ? 'text-green-500' :
            (session.average_score || 0) >= 60 ? 'text-yellow-500' : 'text-red-500'
          }`}>
            {session.average_score || 0}%
          </p>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Average Score</p>
        </div>
        <div className={`p-6 rounded-2xl text-center ${isDark ? 'bg-white/5' : 'bg-white'}`}>
          <p className={`text-3xl font-bold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {session.questions?.length || 0}
          </p>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Questions</p>
        </div>
        <div className={`p-6 rounded-2xl text-center ${isDark ? 'bg-white/5' : 'bg-white'}`}>
          <p className={`text-3xl font-bold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {session.duration_minutes || 0}
          </p>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Minutes</p>
        </div>
      </div>

      {/* Questions & Answers */}
      <div className="space-y-4">
        {session.questions?.map((answer: any, index: number) => {
          const audioUrl = session.audio_urls?.[answer.questionId?.toString()];
          return (
            <div key={index} className={`p-6 rounded-2xl ${isDark ? 'bg-white/5' : 'bg-white'}`}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {answer.question || `Question ${index + 1}`}
                  </h3>
                  <p className={`mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {answer.answer}
                  </p>
                </div>
                {audioUrl && (
                  <button
                    onClick={() => {
                      if (playingAudioId === answer.questionId?.toString()) {
                        stopAudio(answer.questionId);
                      } else {
                        playAudio(answer.questionId, audioUrl);
                      }
                    }}
                    className="p-3 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 transition-colors"
                  >
                    {playingAudioId === answer.questionId?.toString() ? (
                      <Pause className="size-5 text-purple-400" />
                    ) : (
                      <Play className="size-5 text-purple-400" />
                    )}
                  </button>
                )}
              </div>
              
              {answer.feedback && (
                <div className={`mt-4 p-4 rounded-xl ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Score: {answer.score || 0}/100</span>
                  </div>
                  {answer.feedback.strengths && answer.feedback.strengths.length > 0 && (
                    <div className="mb-3">
                      <p className={`text-sm font-semibold mb-1 ${isDark ? 'text-green-400' : 'text-green-600'}`}>Strengths:</p>
                      <ul className="list-disc list-inside space-y-1">
                        {answer.feedback.strengths.map((strength: string, i: number) => (
                          <li key={i} className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{strength}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {answer.feedback.improvements && answer.feedback.improvements.length > 0 && (
                    <div>
                      <p className={`text-sm font-semibold mb-1 ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`}>Improvements:</p>
                      <ul className="list-disc list-inside space-y-1">
                        {answer.feedback.improvements.map((improvement: string, i: number) => (
                          <li key={i} className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{improvement}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {answer.feedback.detailedFeedback && (
                    <div className="mt-3">
                      <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{answer.feedback.detailedFeedback}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}