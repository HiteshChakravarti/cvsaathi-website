import { useState, useRef, useEffect } from "react";
import { 
  ChevronLeft, Sparkles, TrendingUp, Users, ArrowRight, Target, Briefcase, 
  BookOpen, Search, MapPin, GraduationCap, Award, CheckCircle, Clock,
  BarChart3, Download, Plus, X, Minus, Zap, Trophy, Calendar, ExternalLink, Loader2
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { toast } from "sonner";
import { AICareerService } from "../../services/aiCareerService";
import { useAuth } from "../../contexts/AuthContext";
import { supabase } from "../../lib/supabaseClient";
import { exportElementToPrint, exportElementToPdf } from "../../services/exportService";
import { exportSkillGapReportWeb } from "../../lib/cvsaathi-export/skillGapReportGenerator";
import { 
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid
} from "recharts";

interface SkillGapAnalysisPageProps {
  isDark: boolean;
  onBack: () => void;
}

type Step = 'user-type' | 'profile' | 'analyzing' | 'results';

interface UserProfile {
  userType: string;
  education: string;
  targetRole: string;
  industry: string;
  location: string;
  currentSkills: { name: string; level: number }[];
}

interface SkillGap {
  name: string;
  current: number;
  required: number;
  gap: number;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  category: 'Technical' | 'Soft Skills' | 'Domain Knowledge';
}

const userTypes = [
  {
    id: 'fresher',
    title: 'Fresher',
    description: 'Starting my career journey',
    icon: GraduationCap,
    gradient: 'from-teal-400 to-cyan-500'
  },
  {
    id: 'career-growth',
    title: 'Career Growth',
    description: 'Advancing in current field',
    icon: TrendingUp,
    gradient: 'from-purple-400 to-pink-500'
  },
  {
    id: 'career-switch',
    title: 'Career Switch',
    description: 'Transitioning to new role',
    icon: ArrowRight,
    gradient: 'from-blue-400 to-indigo-500'
  },
  {
    id: 'explorer',
    title: 'Explorer',
    description: 'Exploring opportunities',
    icon: Search,
    gradient: 'from-emerald-400 to-teal-500'
  },
  {
    id: 'skill-assessment',
    title: 'Skill Assessment',
    description: 'Evaluate my current skills',
    icon: Award,
    gradient: 'from-orange-400 to-red-500'
  },
  {
    id: 'market-insights',
    title: 'Market Insights',
    description: 'Understand industry trends',
    icon: BarChart3,
    gradient: 'from-pink-400 to-rose-500'
  }
];

const mockSkillDatabase = [
  'Python', 'JavaScript', 'React', 'Node.js', 'SQL', 'Data Analysis',
  'Machine Learning', 'Communication', 'Leadership', 'Project Management',
  'Problem Solving', 'Excel', 'Tableau', 'Power BI', 'Agile', 'Scrum',
  'Java', 'C++', 'AWS', 'Azure', 'Docker', 'Kubernetes', 'Git',
  'Critical Thinking', 'Teamwork', 'Time Management', 'Presentation Skills'
];

const educationOptions = ['B.Tech', 'MBA', 'M.Tech', 'BBA', 'BCA', 'MCA', 'B.Sc', 'M.Sc', 'B.Com', 'Other'];
const industryOptions = [
  'Technology', 'Finance', 'Healthcare', 'E-commerce', 'Consulting', 'Manufacturing', 
  'Education', 'Media', 'Retail', 'Real Estate', 'Hospitality', 'Transportation & Logistics',
  'Energy', 'Telecommunications', 'Aerospace', 'Automotive', 'Pharmaceuticals', 'FMCG',
  'Banking', 'Insurance', 'Legal', 'Construction', 'Agriculture', 'Government', 'Non-profit',
  'Entertainment', 'Sports', 'Fashion', 'Food & Beverage', 'Travel & Tourism', 'Other'
];
const locationOptions = ['Bangalore', 'Mumbai', 'Delhi', 'Hyderabad', 'Pune', 'Chennai', 'Remote', 'Other'];

export function SkillGapAnalysisPage({ isDark, onBack }: SkillGapAnalysisPageProps) {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState<Step>('user-type');
  const [progress, setProgress] = useState(0);
  const [profile, setProfile] = useState<UserProfile>({
    userType: '',
    education: '',
    targetRole: '',
    industry: '',
    location: '',
    currentSkills: []
  });

  const [skillInput, setSkillInput] = useState('');
  const [filteredSkills, setFilteredSkills] = useState<string[]>([]);
  const [skillLevel, setSkillLevel] = useState(3);
  const resultsRef = useRef<HTMLDivElement>(null);
  const [aiRecommendations, setAiRecommendations] = useState<any[]>([]);
  const [analysisResults, setAnalysisResults] = useState<any>(null);
  const [customIndustry, setCustomIndustry] = useState('');
  const [showCustomIndustry, setShowCustomIndustry] = useState(false);
  const [recentScans, setRecentScans] = useState<any[]>([]);
  const [loadingScans, setLoadingScans] = useState(false);
  const aiService = useRef(new AICareerService());

  // Set auth token for AI service
  useEffect(() => {
    if (user) {
      const setToken = async () => {
        try {
          const { data: { session }, error } = await supabase.auth.getSession();
          if (error) {
            console.error('Error getting session:', error);
            return;
          }
          if (session?.access_token) {
            aiService.current.setAuthToken(session.access_token);
          }
        } catch (error) {
          console.error('Error setting auth token:', error);
        }
      };
      setToken();
    }
  }, [user]);

  // Fetch recent scans
  useEffect(() => {
    const fetchRecentScans = async () => {
      if (!user?.id) {
        console.log('No user ID, skipping recent scans fetch');
        return;
      }

      setLoadingScans(true);
      try {
        console.log('Fetching recent skill gap analyses for user:', user.id);
        const { data, error } = await supabase
          .from('skill_gap_analyses')
          .select('id, target_role, target_industry, analysis_date, created_at, analysis_data')
          .eq('user_id', user.id)
          .order('analysis_date', { ascending: false, nullsFirst: false })
          .order('created_at', { ascending: false })
          .limit(6); // Get last 6 scans

        if (error) {
          console.error('Error fetching recent scans:', error);
          console.error('Error details:', JSON.stringify(error, null, 2));
          toast.error(`Failed to load recent analyses: ${error.message}`);
          return;
        }

        console.log('Fetched recent scans:', data);
        console.log('Number of scans:', data?.length || 0);
        
        if (data && data.length > 0) {
          setRecentScans(data);
          console.log('Recent scans set successfully');
        } else {
          console.log('No recent scans found');
          setRecentScans([]);
        }
      } catch (error: any) {
        console.error('Error fetching recent scans:', error);
        console.error('Error stack:', error.stack);
        toast.error(`Error loading recent analyses: ${error.message || 'Unknown error'}`);
      } finally {
        setLoadingScans(false);
      }
    };

    fetchRecentScans();
  }, [user?.id]);

  // Format relative time
  const formatRelativeTime = (dateString: string | null): string => {
    if (!dateString) return 'Unknown';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffSeconds < 60) return 'just now';
    const diffMinutes = Math.floor(diffSeconds / 60);
    if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    const diffWeeks = Math.floor(diffDays / 7);
    if (diffWeeks < 4) return `${diffWeeks} week${diffWeeks > 1 ? 's' : ''} ago`;
    const diffMonths = Math.floor(diffDays / 30);
    return `${diffMonths} month${diffMonths > 1 ? 's' : ''} ago`;
  };

  // Load previous scan results
  const loadPreviousScan = async (scan: any) => {
    try {
      // Parse analysis data
      let parsedData: any = null;
      if (scan.analysis_data) {
        try {
          parsedData = typeof scan.analysis_data === 'string' 
            ? JSON.parse(scan.analysis_data) 
            : scan.analysis_data;
        } catch (parseError) {
          console.error('Error parsing analysis data:', parseError);
        }
      }

      if (parsedData) {
        // Set analysis results
        setAnalysisResults(parsedData);
        
        // Set profile from stored data
        setProfile({
          userType: parsedData.userType || '',
          education: parsedData.education || '',
          targetRole: scan.target_role || '',
          industry: scan.target_industry || '',
          location: parsedData.location || '',
          currentSkills: parsedData.currentSkills || []
        });
        
        // Load recommendations if available
        if (parsedData.recommendations) {
          setAiRecommendations(Array.isArray(parsedData.recommendations) 
            ? parsedData.recommendations 
            : []);
        }
        
        // Go to results step
        setCurrentStep('results');
        
        toast.success('Previous analysis loaded!');
      } else {
        toast.error('Could not load analysis results');
      }
    } catch (error: any) {
      console.error('Error loading previous scan:', error);
      toast.error('Failed to load previous analysis');
    }
  };

  // Default/fallback results data (will be replaced by AI analysis)
  const defaultAnalysisResults = {
    overallScore: 75,
    matchPercentage: 75,
    skillDistribution: {
      technical: 70,
      softSkills: 75,
      domain: 70
    },
    skillGaps: [],
    radarData: [
      { skill: 'Technical', current: 70, required: 85 },
      { skill: 'Communication', current: 75, required: 80 },
      { skill: 'Leadership', current: 65, required: 80 },
      { skill: 'Domain Knowledge', current: 70, required: 75 },
      { skill: 'Problem Solving', current: 75, required: 85 },
      { skill: 'Teamwork', current: 80, required: 80 }
    ],
    demandData: [
      { month: 'Jan', demand: 70 },
      { month: 'Feb', demand: 72 },
      { month: 'Mar', demand: 75 },
      { month: 'Apr', demand: 78 },
      { month: 'May', demand: 80 },
      { month: 'Jun', demand: 85 }
    ],
    recommendations: [],
    topCompanies: [],
    salaryRange: { min: 60000, max: 120000, currency: '₹' },
    timeline: {
      '30days': [],
      '60days': [],
      '90days': []
    }
  };

  const handleUserTypeSelect = (type: string) => {
    setProfile({ ...profile, userType: type });
    setTimeout(() => setCurrentStep('profile'), 300);
  };

  const handleSkillInputChange = (value: string) => {
    setSkillInput(value);
    if (value.trim()) {
      const filtered = mockSkillDatabase.filter(skill => 
        skill.toLowerCase().includes(value.toLowerCase()) &&
        !profile.currentSkills.some(s => s.name === skill)
      );
      setFilteredSkills(filtered.slice(0, 5));
    } else {
      setFilteredSkills([]);
    }
  };

  const addSkill = (skillName: string) => {
    if (!profile.currentSkills.some(s => s.name === skillName)) {
      setProfile({
        ...profile,
        currentSkills: [...profile.currentSkills, { name: skillName, level: skillLevel }]
      });
      setSkillInput('');
      setFilteredSkills([]);
      setSkillLevel(3);
    }
  };

  const removeSkill = (skillName: string) => {
    setProfile({
      ...profile,
      currentSkills: profile.currentSkills.filter(s => s.name !== skillName)
    });
  };

  const startAnalysis = async () => {
    setCurrentStep('analyzing');
    setProgress(0);
    setAiRecommendations([]);
    setAnalysisResults(null);

    try {
      // Step 1: Generate skill gap analysis using AI
      setProgress(20);
      
      const finalIndustry = showCustomIndustry && customIndustry ? customIndustry : profile.industry;
      
      const skillGapPrompt = `You are an expert career advisor. Analyze the skill gaps for this user profile:

User Profile:
- User Type: ${profile.userType}
- Target Role: ${profile.targetRole}
- Industry: ${finalIndustry}
- Education: ${profile.education}
- Location: ${profile.location}
- Current Skills: ${profile.currentSkills.map(s => `${s.name} (Level ${s.level}/5)`).join(', ')}

Based on this profile, provide a comprehensive skill gap analysis in the following JSON format (ONLY return valid JSON, no additional text):
{
  "overallScore": <number 0-100>,
  "matchPercentage": <number 0-100>,
  "skillDistribution": {
    "technical": <number 0-100>,
    "softSkills": <number 0-100>,
    "domain": <number 0-100>
  },
  "skillGaps": [
    {
      "name": "<skill name>",
      "current": <number 0-5>,
      "required": <number 0-5>,
      "gap": <number>,
      "priority": "Critical" | "High" | "Medium" | "Low",
      "category": "Technical" | "Soft Skills" | "Domain Knowledge"
    }
  ],
  "radarData": [
    {
      "skill": "<skill category>",
      "current": <number 0-100>,
      "required": <number 0-100>
    }
  ],
  "topCompanies": [<array of top companies hiring for this role>],
  "salaryRange": {
    "min": <number>,
    "max": <number>,
    "currency": "₹"
  },
  "timeline": {
    "30days": [<array of tasks for first 30 days>],
    "60days": [<array of tasks for next 30 days>],
    "90days": [<array of tasks for final 30 days>]
  }
}

IMPORTANT:
- Analyze skill gaps based on the target role and industry
- Compare current skills with required skills for the target role
- Prioritize gaps based on importance for the role
- Be specific to the industry (e.g., if operational role, focus on operational skills, not tech)
- Generate realistic salary ranges for the location and role
- Provide actionable timeline items`;

      setProgress(40);
      
      const skillGapResponse = await aiService.current.sendMessage(skillGapPrompt, {
        contextType: 'general',
        skillGapAnalysis: {
          profile: { ...profile, industry: finalIndustry },
        },
        requestType: 'skill_gap_analysis',
        language: 'en',
      }, 'en');

      setProgress(60);

      // Log the full response for debugging
      console.log('Skill Gap AI Response:', skillGapResponse);
      console.log('Response has items?', !!skillGapResponse?.items);
      console.log('Items length:', skillGapResponse?.items?.length);
      console.log('First item:', skillGapResponse?.items?.[0]);
      console.log('First item content:', skillGapResponse?.items?.[0]?.content?.substring(0, 500));

      let parsedAnalysis: any = null;
      
      // Handle different response formats
      if (skillGapResponse) {
        // Check if response is already a parsed object (direct JSON response)
        if (skillGapResponse.skillGaps || skillGapResponse.overallScore) {
          console.log('Response is already a parsed object');
          parsedAnalysis = skillGapResponse;
        }
        // Check if response has items array (standard format)
        else if (skillGapResponse.items && skillGapResponse.items.length > 0) {
          const content = skillGapResponse.items[0].content;
          console.log('Extracted content length:', content?.length);
          console.log('Content preview:', content?.substring(0, 1000));
          
          try {
            // Helper function to fix common JSON issues (single quotes, trailing commas, etc.)
            const fixJSON = (jsonString: string): string => {
              let fixed = jsonString;
              
              // Replace all single-quoted strings with double-quoted strings
              // This handles cases like: '₹', 'text', etc.
              // Pattern: match '...' where ... can be any characters (including special chars)
              // and it appears in a JSON context (after : or , or [ or {)
              fixed = fixed.replace(/'/g, '"');
              
              // However, this might break escaped quotes, so we need to be careful
              // If we have \" it should stay as \"
              // But if we have '"' (which was '' before), we need to escape it
              // Actually, since we replaced all ', we might have created "" which should be \"
              // Let's fix double quotes that should be escaped
              fixed = fixed.replace(/""/g, '\\"');
              
              // Fix trailing commas
              fixed = fixed.replace(/,(\s*[}\]])/g, '$1');
              
              // Fix unquoted keys (but be careful not to break already quoted keys)
              fixed = fixed.replace(/([{,]\s*)([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:/g, '$1"$2":');
              
              return fixed;
            };
            
            // First, try to parse the entire content as JSON
            if (typeof content === 'string' && content.trim().startsWith('{')) {
              try {
                parsedAnalysis = JSON.parse(content);
                console.log('Parsed as direct JSON');
              } catch (e) {
                // If parsing fails, try fixing common JSON issues
                console.log('Direct parse failed, attempting to fix JSON...');
                try {
                  const fixed = fixJSON(content);
                  parsedAnalysis = JSON.parse(fixed);
                  console.log('Parsed after fixing JSON');
                } catch (e2) {
                  console.error('Failed to parse even after fixing:', e2);
                  throw e2;
                }
              }
            } else {
              // Try to extract JSON from response (might be wrapped in text)
              const jsonMatch = content.match(/\{[\s\S]*\}/);
              if (jsonMatch) {
                console.log('Found JSON match, length:', jsonMatch[0].length);
                try {
                  parsedAnalysis = JSON.parse(jsonMatch[0]);
                  console.log('Parsed from extracted JSON');
                } catch (e) {
                  // If parsing fails, try fixing common JSON issues
                  console.log('Extracted JSON parse failed, attempting to fix...');
                  try {
                    const fixed = fixJSON(jsonMatch[0]);
                    parsedAnalysis = JSON.parse(fixed);
                    console.log('Parsed after fixing extracted JSON');
                  } catch (e2) {
                    console.error('Failed to parse extracted JSON even after fixing:', e2);
                    throw e2;
                  }
                }
              } else {
                console.warn('No JSON match found in content. Content type:', typeof content);
                console.warn('Content sample:', content?.substring(0, 200));
              }
            }
            
            if (parsedAnalysis) {
              console.log('Parsed analysis:', parsedAnalysis);
              console.log('Parsed skill gaps:', parsedAnalysis?.skillGaps);
              console.log('Skill gaps is array?', Array.isArray(parsedAnalysis?.skillGaps));
            }
          } catch (parseError) {
            console.error('Error parsing skill gap analysis:', parseError);
            console.error('Parse error details:', {
              message: parseError instanceof Error ? parseError.message : 'Unknown error',
              content: content?.substring(0, 500)
            });
          }
        }
        // Check if response is a string that needs parsing
        else if (typeof skillGapResponse === 'string') {
          try {
            parsedAnalysis = JSON.parse(skillGapResponse);
            console.log('Parsed response as string JSON');
          } catch (e) {
            console.log('String parse failed, attempting to fix JSON...');
            try {
              // Helper function to fix common JSON issues
              const fixJSON = (jsonString: string): string => {
                let fixed = jsonString;
                // Replace all single quotes with double quotes
                fixed = fixed.replace(/'/g, '"');
                // Fix double quotes that should be escaped (from '' -> "")
                fixed = fixed.replace(/""/g, '\\"');
                // Fix trailing commas
                fixed = fixed.replace(/,(\s*[}\]])/g, '$1');
                // Fix unquoted keys
                fixed = fixed.replace(/([{,]\s*)([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:/g, '$1"$2":');
                return fixed;
              };
              const fixed = fixJSON(skillGapResponse);
              parsedAnalysis = JSON.parse(fixed);
              console.log('Parsed string response after fixing JSON');
            } catch (e2) {
              console.error('Failed to parse string response even after fixing:', e2);
            }
          }
        }
        else {
          console.error('Unexpected response structure:', {
            responseType: typeof skillGapResponse,
            hasItems: !!skillGapResponse?.items,
            itemsLength: skillGapResponse?.items?.length || 0,
            responseKeys: Object.keys(skillGapResponse || {})
          });
        }
      } else {
        console.error('No response received (null/undefined)');
      }

      // Use parsed analysis or fallback to default
      const results = parsedAnalysis || defaultAnalysisResults;
      
      console.log('Final results before merge:', results);
      console.log('Results skillGaps:', results.skillGaps);
      
      // Ensure all required fields exist
      const finalResults = {
        ...defaultAnalysisResults,
        ...results,
        skillGaps: Array.isArray(results.skillGaps) ? results.skillGaps : [],
        radarData: Array.isArray(results.radarData) ? results.radarData : defaultAnalysisResults.radarData,
        topCompanies: Array.isArray(results.topCompanies) ? results.topCompanies : [],
        timeline: results.timeline && typeof results.timeline === 'object' ? results.timeline : defaultAnalysisResults.timeline,
      };

      console.log('Final results after merge:', finalResults);
      console.log('Final skill gaps count:', finalResults.skillGaps.length);

      setProgress(80);
      setAnalysisResults(finalResults);

      // Step 2: Generate learning recommendations based on skill gaps
      const recommendationsPrompt = `Based on this skill gap analysis:
- User Type: ${profile.userType}
- Target Role: ${profile.targetRole}
- Industry: ${finalIndustry}
- Education: ${profile.education}
- Current Skills: ${profile.currentSkills.map(s => `${s.name} (Level ${s.level}/5)`).join(', ')}
- Skill Gaps: ${finalResults.skillGaps.map((g: any) => `${g.name} (Gap: ${g.gap}, Priority: ${g.priority})`).join(', ')}

Provide 5-7 personalized learning recommendations. For each recommendation, include:
1. Title (course/training name)
2. Provider (platform/institution)
3. Duration (e.g., "8 weeks")
4. Level (Beginner/Intermediate/Advanced)
5. Priority (Critical/High/Medium) based on skill gaps

Format as JSON array with these fields: title, provider, duration, level, priority.`;

      const recommendationsResponse = await aiService.current.sendMessage(recommendationsPrompt, {
        contextType: 'general',
        skillGapAnalysis: {
          profile: { ...profile, industry: finalIndustry },
          skillGaps: finalResults.skillGaps,
        },
        requestType: 'learning_recommendations',
        language: 'en',
      }, 'en');

      if (recommendationsResponse && recommendationsResponse.items && recommendationsResponse.items.length > 0) {
        const content = recommendationsResponse.items[0].content;
        try {
          const jsonMatch = content.match(/\[[\s\S]*\]/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            if (Array.isArray(parsed)) {
              setAiRecommendations(parsed);
            }
          } else {
            // Fallback: parse text recommendations
            const lines = content.split('\n').filter(line => line.trim().length > 0);
            const recommendations = lines.slice(0, 7).map((line, index) => ({
              title: line.replace(/^\d+\.\s*/, '').split(' - ')[0] || `Learning Path ${index + 1}`,
              provider: 'Recommended Platform',
              duration: '6-8 weeks',
              level: 'Intermediate',
              priority: index < 2 ? 'Critical' : index < 4 ? 'High' : 'Medium'
            }));
            setAiRecommendations(recommendations);
          }
        } catch (parseError) {
          console.error('Error parsing AI recommendations:', parseError);
        }
      }

      setProgress(100);
      setCurrentStep('results');
      
      // Save analysis to backend (skill_gap_analyses table)
      if (user?.id) {
        try {
          const { error: saveError } = await supabase
            .from('skill_gap_analyses')
            .insert({
              user_id: user.id,
              target_role: profile.targetRole,
              target_industry: finalIndustry,
              analysis_data: JSON.stringify(finalResults),
              recommendations: JSON.stringify(aiRecommendations),
              analysis_date: new Date().toISOString(),
            });

          if (saveError) {
            console.error('Error saving skill gap analysis to database:', saveError);
            // Don't show error to user - analysis still worked
          } else {
            console.log('Skill gap analysis saved to database successfully');
            // Refresh recent scans list
            const { data: scansData } = await supabase
              .from('skill_gap_analyses')
              .select('id, target_role, target_industry, analysis_date, created_at, analysis_data')
              .eq('user_id', user.id)
              .order('analysis_date', { ascending: false, nullsFirst: false })
              .order('created_at', { ascending: false })
              .limit(6);
            
            if (scansData) {
              setRecentScans(scansData);
            }
          }
        } catch (saveErr) {
          console.error('Error saving skill gap analysis:', saveErr);
          // Don't show error to user - analysis still worked
        }
      }
    } catch (error: any) {
      console.error('Error in skill gap analysis:', error);
      toast.error(`Failed to analyze skills: ${error?.message || 'Unknown error'}`);
      // Set default results on error
      setAnalysisResults(defaultAnalysisResults);
      setCurrentStep('results');
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Critical': return 'border-red-500 bg-red-500/10';
      case 'High': return 'border-orange-500 bg-orange-500/10';
      case 'Medium': return 'border-yellow-500 bg-yellow-500/10';
      default: return 'border-green-500 bg-green-500/10';
    }
  };

  const getPriorityTextColor = (priority: string) => {
    switch (priority) {
      case 'Critical': return 'text-red-500';
      case 'High': return 'text-orange-500';
      case 'Medium': return 'text-yellow-500';
      default: return 'text-green-500';
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-500 ${
      isDark 
        ? 'bg-slate-900' 
        : 'bg-gradient-to-br from-gray-50 via-teal-50/30 to-gray-50'
    }`}>
      {/* Header */}
      <header className={`border-b transition-colors duration-500 ${
        isDark 
          ? 'border-white/10 bg-slate-900/80 backdrop-blur-xl'
          : 'border-gray-200 bg-white/80 backdrop-blur-xl'
      }`}>
        <div className="px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={onBack}
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
              >
                <ChevronLeft className="size-4" />
                <span className="text-sm">Back to Dashboard</span>
              </button>
              <div className={`h-6 w-px ${isDark ? 'bg-white/10' : 'bg-gray-200'}`}></div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
                  <BarChart3 className="size-5 text-white" />
                </div>
                <div>
                  <h1 className={`text-xl ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Skill Gap Analysis
                  </h1>
                  <p className="text-sm text-gray-400">
                    {currentStep === 'user-type' && 'Tell us about yourself'}
                    {currentStep === 'profile' && 'Complete your profile'}
                    {currentStep === 'analyzing' && 'Analyzing your skills...'}
                    {currentStep === 'results' && 'Your personalized analysis'}
                  </p>
                </div>
              </div>
            </div>

            {/* Progress Indicator */}
            <div className="flex items-center gap-3">
              {['user-type', 'profile', 'analyzing', 'results'].map((step, index) => (
                <div key={step} className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm transition-all ${
                    currentStep === step
                      ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white scale-110'
                      : ['user-type', 'profile', 'analyzing', 'results'].indexOf(currentStep) > index
                        ? 'bg-teal-500/20 text-teal-500'
                        : isDark
                          ? 'bg-white/5 text-gray-500'
                          : 'bg-gray-200 text-gray-500'
                  }`}>
                    {index + 1}
                  </div>
                  {index < 3 && (
                    <div className={`w-12 h-0.5 ${
                      ['user-type', 'profile', 'analyzing', 'results'].indexOf(currentStep) > index
                        ? 'bg-teal-500'
                        : isDark ? 'bg-white/10' : 'bg-gray-200'
                    }`}></div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-8">
        {/* STEP 1: USER TYPE SELECTION */}
        {currentStep === 'user-type' && (
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className={`text-4xl mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Who Are <span className="bg-gradient-to-r from-teal-500 to-cyan-500 bg-clip-text text-transparent">You?</span>
              </h2>
              <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Help us understand your journey to provide personalized insights
              </p>
            </div>

            <div className="grid grid-cols-3 gap-6">
              {userTypes.map((type) => {
                const Icon = type.icon;
                return (
                  <button
                    key={type.id}
                    onClick={() => handleUserTypeSelect(type.id)}
                    className={`group relative p-8 rounded-2xl border-2 transition-all duration-300 hover:scale-105 hover:shadow-2xl ${
                      profile.userType === type.id
                        ? 'border-teal-500 bg-teal-500/10'
                        : isDark
                          ? 'border-white/10 bg-white/5 hover:border-teal-500/50 hover:bg-white/10'
                          : 'border-gray-200 bg-white hover:border-teal-300 hover:shadow-xl'
                    }`}
                  >
                    <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${type.gradient} flex items-center justify-center transform group-hover:scale-110 transition-transform`}>
                      <Icon className="size-8 text-white" />
                    </div>
                    <h3 className={`text-xl mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {type.title}
                    </h3>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {type.description}
                    </p>

                    {/* Estel peeking on hover */}
                    <div className="absolute -bottom-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 p-1">
                        <div className={`w-full h-full rounded-full ${isDark ? 'bg-slate-900' : 'bg-white'} flex items-center justify-center`}>
                          <Sparkles className="size-6 text-teal-500" />
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Recent Scans */}
            <div className="mt-12">
              <h3 className={`text-xl mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Recent Analyses
              </h3>
              {loadingScans ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="size-6 animate-spin text-teal-500" />
                  <span className={`ml-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Loading recent analyses...
                  </span>
                </div>
              ) : recentScans.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {recentScans.map((scan) => {
                    // Derive score from analysis_data if numeric columns are not present
                    let derivedScore = 0;
                    try {
                      const parsed = typeof scan.analysis_data === 'string'
                        ? JSON.parse(scan.analysis_data)
                        : scan.analysis_data;
                      derivedScore = parsed?.overallScore || parsed?.matchPercentage || 0;
                    } catch {}
                    const score = derivedScore;
                    
                    return (
                      <button
                        key={scan.id}
                        onClick={() => loadPreviousScan(scan)}
                        className={`p-4 rounded-xl border text-left transition-all hover:scale-105 ${
                          isDark
                            ? 'bg-white/5 border-white/10 hover:border-teal-500/50'
                            : 'bg-white border-gray-200 hover:border-teal-300 hover:shadow-lg'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <BarChart3 className={`size-5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
                          <span className={`text-2xl font-semibold ${
                            score >= 80 ? 'text-green-500' : 
                            score >= 60 ? 'text-yellow-500' : 
                            'text-red-500'
                          }`}>
                            {score}%
                          </span>
                        </div>
                        <p className={`text-sm mb-1 truncate ${isDark ? 'text-white' : 'text-gray-900'}`} title={scan.target_role}>
                          {scan.target_role || 'Unknown Role'}
                        </p>
                        <p className={`text-xs mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          {scan.target_industry || 'General'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatRelativeTime(scan.analysis_date || scan.created_at)}
                        </p>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className={`text-center py-8 rounded-xl border ${
                  isDark ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'
                }`}>
                  <BarChart3 className={`size-12 mx-auto mb-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    No recent analyses yet. Complete your first analysis to see it here!
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 2: PROFILE FORM */}
        {currentStep === 'profile' && (
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className={`text-4xl mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Tell Us About <span className="bg-gradient-to-r from-teal-500 to-cyan-500 bg-clip-text text-transparent">Yourself</span>
              </h2>
              <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Share your details to get accurate skill gap analysis
              </p>
            </div>

            <div className={`rounded-2xl border p-8 ${
              isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'
            }`}>
              <div className="space-y-6">
                {/* Education */}
                <div>
                  <label className={`block text-sm mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    <GraduationCap className="size-4 inline mr-2" />
                    Education
                  </label>
                  <select
                    value={profile.education}
                    onChange={(e) => setProfile({ ...profile, education: e.target.value })}
                    className={`w-full px-4 py-3 rounded-xl border transition-colors ${
                      isDark
                        ? 'bg-white/5 border-white/10 text-white'
                        : 'bg-white border-gray-200 text-gray-900'
                    }`}
                  >
                    <option value="">Select your education</option>
                    {educationOptions.map(edu => (
                      <option key={edu} value={edu}>{edu}</option>
                    ))}
                  </select>
                </div>

                {/* Target Role */}
                <div>
                  <label className={`block text-sm mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    <Target className="size-4 inline mr-2" />
                    Target Role
                  </label>
                  <input
                    type="text"
                    value={profile.targetRole}
                    onChange={(e) => setProfile({ ...profile, targetRole: e.target.value })}
                    placeholder="e.g., Business Analyst, Data Scientist"
                    className={`w-full px-4 py-3 rounded-xl border transition-colors ${
                      isDark
                        ? 'bg-white/5 border-white/10 text-white placeholder-gray-500'
                        : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'
                    }`}
                  />
                </div>

                {/* Industry */}
                <div>
                  <label className={`block text-sm mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    <Briefcase className="size-4 inline mr-2" />
                    Industry
                  </label>
                  {!showCustomIndustry ? (
                    <>
                      <select
                        value={profile.industry}
                        onChange={(e) => {
                          if (e.target.value === 'Other') {
                            setShowCustomIndustry(true);
                            setProfile({ ...profile, industry: '' });
                          } else {
                            setProfile({ ...profile, industry: e.target.value });
                          }
                        }}
                        className={`w-full px-4 py-3 rounded-xl border transition-colors ${
                          isDark
                            ? 'bg-white/5 border-white/10 text-white'
                            : 'bg-white border-gray-200 text-gray-900'
                        }`}
                      >
                        <option value="">Select industry</option>
                        {industryOptions.map(ind => (
                          <option key={ind} value={ind}>{ind}</option>
                        ))}
                      </select>
                    </>
                  ) : (
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={customIndustry}
                        onChange={(e) => setCustomIndustry(e.target.value)}
                        placeholder="Enter your industry (e.g., Supply Chain, Operations, etc.)"
                        className={`w-full px-4 py-3 rounded-xl border transition-colors ${
                          isDark
                            ? 'bg-white/5 border-white/10 text-white placeholder-gray-500'
                            : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'
                        }`}
                      />
                      <button
                        onClick={() => {
                          setShowCustomIndustry(false);
                          setCustomIndustry('');
                          setProfile({ ...profile, industry: '' });
                        }}
                        className={`text-sm ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
                      >
                        ← Back to dropdown
                      </button>
                    </div>
                  )}
                </div>

                {/* Location */}
                <div>
                  <label className={`block text-sm mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    <MapPin className="size-4 inline mr-2" />
                    Preferred Location
                  </label>
                  <select
                    value={profile.location}
                    onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                    className={`w-full px-4 py-3 rounded-xl border transition-colors ${
                      isDark
                        ? 'bg-white/5 border-white/10 text-white'
                        : 'bg-white border-gray-200 text-gray-900'
                    }`}
                  >
                    <option value="">Select location</option>
                    {locationOptions.map(loc => (
                      <option key={loc} value={loc}>{loc}</option>
                    ))}
                  </select>
                </div>

                {/* Current Skills */}
                <div>
                  <label className={`block text-sm mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    <Award className="size-4 inline mr-2" />
                    Current Skills
                  </label>
                  
                  {/* Skill Input */}
                  <div className="relative mb-4">
                    <input
                      type="text"
                      value={skillInput}
                      onChange={(e) => handleSkillInputChange(e.target.value)}
                      placeholder="Type a skill (e.g., Python, Leadership)"
                      className={`w-full px-4 py-3 rounded-xl border transition-colors ${
                        isDark
                          ? 'bg-white/5 border-white/10 text-white placeholder-gray-500'
                          : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'
                      }`}
                    />
                    
                    {/* Autocomplete Dropdown */}
                    {filteredSkills.length > 0 && (
                      <div className={`absolute z-10 w-full mt-2 rounded-xl border shadow-lg ${
                        isDark ? 'bg-slate-800 border-white/10' : 'bg-white border-gray-200'
                      }`}>
                        {filteredSkills.map(skill => (
                          <button
                            key={skill}
                            onClick={() => addSkill(skill)}
                            className={`w-full px-4 py-2 text-left hover:bg-teal-500/20 transition-colors first:rounded-t-xl last:rounded-b-xl ${
                              isDark ? 'text-white' : 'text-gray-900'
                            }`}
                          >
                            {skill}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Skill Level Slider */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        Skill Level
                      </span>
                      <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {skillLevel}/5
                      </span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="5"
                      value={skillLevel}
                      onChange={(e) => setSkillLevel(parseInt(e.target.value))}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Beginner</span>
                      <span>Expert</span>
                    </div>
                  </div>

                  {/* Add Skill Button */}
                  <Button
                    onClick={() => skillInput && addSkill(skillInput)}
                    disabled={!skillInput}
                    className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white border-0 mb-4"
                  >
                    <Plus className="size-4 mr-2" />
                    Add Skill
                  </Button>

                  {/* Skills List */}
                  {profile.currentSkills.length > 0 && (
                    <div className="space-y-2">
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-2`}>
                        Added Skills ({profile.currentSkills.length})
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {profile.currentSkills.map((skill) => (
                          <div
                            key={skill.name}
                            className={`group flex items-center gap-2 px-3 py-2 rounded-lg border ${
                              isDark
                                ? 'bg-teal-500/20 border-teal-500/30 text-teal-300'
                                : 'bg-teal-100 border-teal-200 text-teal-700'
                            }`}
                          >
                            <span className="text-sm">{skill.name}</span>
                            <span className="text-xs opacity-60">({skill.level}/5)</span>
                            <button
                              onClick={() => removeSkill(skill.name)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="size-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <div className="mt-8 flex gap-4">
                <Button
                  onClick={() => setCurrentStep('user-type')}
                  className="flex-1 bg-white/10 hover:bg-white/20 text-white border-0"
                >
                  <ChevronLeft className="size-4 mr-2" />
                  Back
                </Button>
                <Button
                  onClick={startAnalysis}
                  disabled={!profile.education || !profile.targetRole || (!profile.industry && !customIndustry) || profile.currentSkills.length === 0}
                  className="flex-1 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white border-0"
                >
                  <Sparkles className="size-4 mr-2" />
                  Analyze My Skills
                  <ArrowRight className="size-4 ml-2" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: ANALYZING */}
        {currentStep === 'analyzing' && (
          <div className="max-w-2xl mx-auto text-center">
            <div className="w-64 h-64 mx-auto mb-8 relative">
              <div className="absolute inset-0 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-full blur-3xl opacity-30 animate-pulse"></div>
              <img 
                src="/Skill Gap analysis.png" 
                alt="Estel Analyzing"
                className="relative z-10 w-full h-full object-contain"
                style={{ animation: 'bounce 2s infinite' }}
              />
            </div>
            
            <h2 className={`text-4xl mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Analyzing Your Skills...
            </h2>
            <p className={`text-lg mb-8 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {progress < 30 && "🔍 Scanning your profile..."}
              {progress >= 30 && progress < 60 && "📊 Comparing with 10,000+ job listings..."}
              {progress >= 60 && progress < 90 && "🎯 Identifying skill gaps..."}
              {progress >= 90 && "✨ Generating personalized recommendations..."}
            </p>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className={`h-3 rounded-full overflow-hidden ${isDark ? 'bg-white/10' : 'bg-gray-200'}`}>
                <div 
                  className="h-full bg-gradient-to-r from-teal-500 to-cyan-500 transition-all duration-300 ease-out"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <p className={`text-sm mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {progress}% complete
              </p>
            </div>

            {/* Analyzing Steps */}
            <div className="mt-8 space-y-3">
              {[
                { step: 'Profile Analysis', done: progress > 25 },
                { step: 'Market Research', done: progress > 50 },
                { step: 'Skill Matching', done: progress > 75 },
                { step: 'Report Generation', done: progress > 95 }
              ].map((item, index) => (
                <div 
                  key={index}
                  className={`flex items-center justify-center gap-3 ${
                    item.done ? 'opacity-100' : 'opacity-40'
                  } transition-opacity duration-300`}
                >
                  {item.done ? (
                    <CheckCircle className="size-5 text-teal-500" />
                  ) : (
                    <div className="size-5 rounded-full border-2 border-gray-400 animate-spin border-t-transparent"></div>
                  )}
                  <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                    {item.step}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 4: RESULTS DASHBOARD */}
        {currentStep === 'results' && analysisResults && (
          <div className="max-w-7xl mx-auto" ref={resultsRef}>
            <div className="grid grid-cols-3 gap-6">
              {/* Left Sidebar - Overall Score */}
              <div className="col-span-1 space-y-6">
                {/* Overall Score Card */}
                <div className={`rounded-2xl border p-6 sticky top-6 ${
                  isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'
                }`}>
                  <h3 className={`text-lg mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Overall Match Score
                  </h3>
                  
                  {/* Circular Progress */}
                  <div className="relative w-48 h-48 mx-auto mb-6">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle
                        cx="96"
                        cy="96"
                        r="88"
                        stroke={isDark ? 'rgba(255,255,255,0.1)' : 'rgb(229,231,235)'}
                        strokeWidth="16"
                        fill="none"
                      />
                      <circle
                        cx="96"
                        cy="96"
                        r="88"
                        stroke="url(#scoreGradient)"
                        strokeWidth="16"
                        fill="none"
                        strokeDasharray={`${2 * Math.PI * 88}`}
                        strokeDashoffset={`${2 * Math.PI * 88 * (1 - analysisResults.overallScore / 100)}`}
                        strokeLinecap="round"
                        className="transition-all duration-1000 ease-out"
                      />
                      <defs>
                        <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" className="text-teal-500" stopColor="currentColor" />
                          <stop offset="100%" className="text-cyan-500" stopColor="currentColor" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-5xl mb-1 bg-gradient-to-r from-teal-500 to-cyan-500 bg-clip-text text-transparent">
                        {analysisResults.overallScore}
                      </span>
                      <span className="text-sm text-gray-500">out of 100</span>
                    </div>
                  </div>

                  <div className={`p-4 rounded-xl mb-4 ${
                    isDark ? 'bg-white/5' : 'bg-gray-50'
                  }`}>
                    <div className="text-sm text-gray-500 mb-2">For Role</div>
                    <div className={`text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {profile.targetRole || 'Target Role'}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      {showCustomIndustry && customIndustry ? customIndustry : profile.industry}
                    </div>
                  </div>

                  {/* Skill Distribution */}
                  <div className="space-y-3">
                    <h4 className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      Skill Distribution
                    </h4>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>Technical</span>
                        <span className="text-teal-500">{analysisResults.skillDistribution.technical}%</span>
                      </div>
                      <div className={`h-2 rounded-full overflow-hidden ${isDark ? 'bg-white/10' : 'bg-gray-200'}`}>
                        <div 
                          className="h-full bg-gradient-to-r from-teal-500 to-cyan-500 transition-all duration-1000"
                          style={{ width: `${analysisResults.skillDistribution.technical}%` }}
                        ></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>Soft Skills</span>
                        <span className="text-purple-500">{analysisResults.skillDistribution.softSkills}%</span>
                      </div>
                      <div className={`h-2 rounded-full overflow-hidden ${isDark ? 'bg-white/10' : 'bg-gray-200'}`}>
                        <div 
                          className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-1000"
                          style={{ width: `${analysisResults.skillDistribution.softSkills}%` }}
                        ></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>Domain Knowledge</span>
                        <span className="text-blue-500">{analysisResults.skillDistribution.domain}%</span>
                      </div>
                      <div className={`h-2 rounded-full overflow-hidden ${isDark ? 'bg-white/10' : 'bg-gray-200'}`}>
                        <div 
                          className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-1000"
                          style={{ width: `${analysisResults.skillDistribution.domain}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={async () => {
                      const ok = await exportSkillGapReportWeb(
                        {
                          userType: profile.userType,
                          education: profile.education,
                          targetRole: profile.targetRole,
                          industry: profile.industry,
                          location: profile.location,
                          currentSkills: profile.currentSkills || []
                        },
                        analysisResults as any
                      );
                      if (!ok) {
                        if (resultsRef.current) {
                          await exportElementToPdf(resultsRef.current, `Skill_Gap_Report_${profile.targetRole || ''}.pdf`);
                        } else {
                          exportElementToPrint(resultsRef.current, { title: `Skill Gap Report - ${profile.targetRole || ''}` });
                        }
                      }
                    }}
                    className="w-full mt-6 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white border-0">
                    <Download className="size-4 mr-2" />
                    Download Report
                  </Button>
                </div>

                {/* Salary Insights */}
                <div className={`rounded-2xl border p-6 ${
                  isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'
                }`}>
                  <h4 className={`text-sm mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    💰 Salary Range
                  </h4>
                  <div className={`text-3xl mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {analysisResults.salaryRange.currency}{analysisResults.salaryRange.min/1000}K - {analysisResults.salaryRange.max/1000}K
                  </div>
                  <p className="text-sm text-gray-500">Per annum for this role</p>
                </div>
              </div>

              {/* Main Content - Right Panel */}
              <div className="col-span-2 space-y-6">
                {/* Skill Gaps */}
                <div className={`rounded-2xl border p-6 ${
                  isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'
                }`}>
                  <h3 className={`text-xl mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    🎯 Skill Gaps Identified
                  </h3>

                  <div className="space-y-4">
                    {analysisResults.skillGaps.map((gap, index) => (
                      <div
                        key={index}
                        className={`p-4 rounded-xl border-2 transition-all hover:scale-102 ${
                          getPriorityColor(gap.priority)
                        }`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className={`text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                {gap.name}
                              </h4>
                              <span className={`px-2 py-1 rounded-lg text-xs ${getPriorityTextColor(gap.priority)}`}>
                                {gap.priority}
                              </span>
                              <span className={`px-2 py-1 rounded-lg text-xs ${
                                isDark ? 'bg-white/10 text-gray-300' : 'bg-gray-100 text-gray-700'
                              }`}>
                                {gap.category}
                              </span>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <div className="text-xs text-gray-500 mb-1">Current Level</div>
                                <div className={`h-2 rounded-full overflow-hidden ${isDark ? 'bg-white/10' : 'bg-gray-200'}`}>
                                  <div 
                                    className="h-full bg-gray-400"
                                    style={{ width: `${(gap.current / 5) * 100}%` }}
                                  ></div>
                                </div>
                                <div className="text-xs text-gray-500 mt-1">{gap.current}/5</div>
                              </div>
                              
                              <div>
                                <div className="text-xs text-gray-500 mb-1">Required Level</div>
                                <div className={`h-2 rounded-full overflow-hidden ${isDark ? 'bg-white/10' : 'bg-gray-200'}`}>
                                  <div 
                                    className="h-full bg-gradient-to-r from-teal-500 to-cyan-500"
                                    style={{ width: `${(gap.required / 5) * 100}%` }}
                                  ></div>
                                </div>
                                <div className="text-xs text-gray-500 mt-1">{gap.required}/5</div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button 
                            size="sm"
                            className={`flex-1 ${
                              gap.priority === 'Critical' 
                                ? 'bg-red-500 hover:bg-red-600' 
                                : 'bg-teal-500 hover:bg-teal-600'
                            } text-white border-0`}
                          >
                            <BookOpen className="size-4 mr-2" />
                            Learn Now
                          </Button>
                          <Button 
                            size="sm"
                            className="bg-white/10 hover:bg-white/20 text-white border-0"
                          >
                            <Plus className="size-4 mr-2" />
                            Add to Plan
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Radar Chart */}
                <div className={`rounded-2xl border p-6 ${
                  isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'
                }`}>
                  <h3 className={`text-xl mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    📊 Skill Comparison Radar
                  </h3>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={analysisResults.radarData}>
                        <PolarGrid stroke={isDark ? 'rgba(255,255,255,0.1)' : 'rgb(229,231,235)'} />
                        <PolarAngleAxis 
                          dataKey="skill" 
                          tick={{ fill: isDark ? 'rgb(156,163,175)' : 'rgb(75,85,99)', fontSize: 12 }}
                        />
                        <PolarRadiusAxis 
                          angle={90} 
                          domain={[0, 100]}
                          tick={{ fill: isDark ? 'rgb(156,163,175)' : 'rgb(75,85,99)' }}
                        />
                        <Radar 
                          name="Your Skills" 
                          dataKey="current" 
                          stroke="#14b8a6" 
                          fill="#14b8a6" 
                          fillOpacity={0.3}
                        />
                        <Radar 
                          name="Required" 
                          dataKey="required" 
                          stroke="#6366f1" 
                          fill="#6366f1" 
                          fillOpacity={0.1}
                          strokeDasharray="5 5"
                        />
                        <Legend />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Learning Recommendations */}
                <div className={`rounded-2xl border p-6 ${
                  isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'
                }`}>
                  <h3 className={`text-xl mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    📚 Recommended Learning Paths
                  </h3>
                  
                  <div className="space-y-4">
                    {(aiRecommendations.length > 0 ? aiRecommendations : analysisResults.recommendations).map((rec, index) => (
                      <div
                        key={index}
                        className={`p-4 rounded-xl border transition-all hover:scale-102 ${
                          isDark 
                            ? 'bg-white/5 border-white/10 hover:border-teal-500/50' 
                            : 'bg-gray-50 border-gray-200 hover:border-teal-300 hover:shadow-lg'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className={`text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                {rec.title}
                              </h4>
                              <span className={`px-2 py-1 rounded-lg text-xs ${
                                rec.priority === 'Critical' 
                                  ? 'bg-red-500/20 text-red-500'
                                  : rec.priority === 'High'
                                    ? 'bg-orange-500/20 text-orange-500'
                                    : 'bg-yellow-500/20 text-yellow-500'
                              }`}>
                                {rec.priority} Priority
                              </span>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                              <span className="flex items-center gap-1">
                                <BookOpen className="size-4" />
                                {rec.provider}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="size-4" />
                                {rec.duration}
                              </span>
                              <span className="flex items-center gap-1">
                                <Award className="size-4" />
                                {rec.level}
                              </span>
                            </div>
                          </div>
                          <Button 
                            size="sm"
                            className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white border-0"
                          >
                            <ExternalLink className="size-4 mr-2" />
                            Enroll
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Market Demand Trend */}
                <div className={`rounded-2xl border p-6 ${
                  isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'
                }`}>
                  <h3 className={`text-xl mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    📈 Market Demand Trend
                  </h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={analysisResults.demandData}>
                        <CartesianGrid strokeDasharray="3 3" stroke={isDark ? 'rgba(255,255,255,0.1)' : 'rgb(229,231,235)'} />
                        <XAxis 
                          dataKey="month" 
                          tick={{ fill: isDark ? 'rgb(156,163,175)' : 'rgb(75,85,99)' }}
                        />
                        <YAxis 
                          tick={{ fill: isDark ? 'rgb(156,163,175)' : 'rgb(75,85,99)' }}
                        />
                        <Tooltip 
                          contentStyle={{
                            backgroundColor: isDark ? 'rgb(30,41,59)' : 'white',
                            border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgb(229,231,235)',
                            borderRadius: '8px'
                          }}
                        />
                        <Bar dataKey="demand" fill="url(#barGradient)" radius={[8, 8, 0, 0]} />
                        <defs>
                          <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#14b8a6" />
                            <stop offset="100%" stopColor="#06b6d4" />
                          </linearGradient>
                        </defs>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Top Companies */}
                <div className={`rounded-2xl border p-6 ${
                  isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'
                }`}>
                  <h3 className={`text-xl mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    🏢 Top Companies Hiring
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {analysisResults.topCompanies.map((company, index) => (
                      <div
                        key={index}
                        className={`px-4 py-2 rounded-lg border ${
                          isDark 
                            ? 'bg-white/5 border-white/10 text-white' 
                            : 'bg-gray-50 border-gray-200 text-gray-900'
                        }`}
                      >
                        {company}
                      </div>
                    ))}
                  </div>
                </div>

                {/* 30/60/90 Day Plan */}
                <div className={`rounded-2xl border p-6 bg-gradient-to-br from-teal-500/10 to-cyan-500/10 ${
                  isDark ? 'border-teal-500/20' : 'border-teal-200'
                }`}>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
                      <Calendar className="size-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className={`text-xl mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        🎯 Your Learning Roadmap
                      </h3>
                      
                      <div className="space-y-6">
                        {Object.entries(analysisResults.timeline as Record<string, string[]>).map(([period, tasks]) => (
                          <div key={period}>
                            <h4 className={`text-sm mb-3 ${isDark ? 'text-teal-300' : 'text-teal-700'}`}>
                              {period === '30days' ? '📅 First 30 Days' : period === '60days' ? '📅 Next 30 Days (60 total)' : '📅 Final 30 Days (90 total)'}
                            </h4>
                            <ul className="space-y-2">
                              {(tasks as string[]).map((task, index) => (
                                <li 
                                  key={index}
                                  className={`flex items-start gap-2 text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
                                >
                                  <CheckCircle className="size-4 text-teal-500 mt-0.5 flex-shrink-0" />
                                  {task}
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
