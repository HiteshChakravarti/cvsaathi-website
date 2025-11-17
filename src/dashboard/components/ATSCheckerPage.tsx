import type { DragEvent, ChangeEvent } from "react";
import { useState, useCallback, useRef, useEffect } from "react";
import { 
  ChevronLeft, Upload, FileText, CheckCircle, XCircle, AlertCircle, 
  Download, RefreshCw, Sparkles, TrendingUp, FileCheck, Eye, Zap, Loader2
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { toast } from "sonner";
import { AICareerService } from "../../services/aiCareerService";
import { useAuth } from "../../contexts/AuthContext";
import { supabase } from "../../lib/supabaseClient";
import { exportElementToPrint, exportElementToPdf } from "../../services/exportService";
import { exportATSReportWeb } from "../../lib/cvsaathi-export/atsReportGenerator";

interface ATSCheckerPageProps {
  isDark: boolean;
  onBack: () => void;
}

type PageState = 'upload' | 'analyzing' | 'results';

interface AnalysisResult {
  overallScore: number;
  scores: {
    keywords: number;
    formatting: number;
    sections: number;
    length: number;
    readability: number;
  };
  criticalIssues: string[];
  warnings: string[];
  passed: string[];
  foundKeywords: string[];
  missingKeywords: string[];
  suggestedKeywords: string[];
  fileName: string;
  fileSize: string;
  uploadDate: string;
}

export function ATSCheckerPage({ isDark, onBack }: ATSCheckerPageProps) {
  const { user } = useAuth();
  const [currentState, setCurrentState] = useState<PageState>('upload');
  const [progress, setProgress] = useState(0);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [aiRecommendations, setAiRecommendations] = useState<string[]>([]);
  const [loadingAI, setLoadingAI] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [resumeText, setResumeText] = useState<string>('');
  const [recentScans, setRecentScans] = useState<any[]>([]);
  const [loadingScans, setLoadingScans] = useState(false);
  const aiService = useRef(new AICareerService());
  const resultsRef = useRef<HTMLDivElement>(null);

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
      if (!user?.id) return;

      setLoadingScans(true);
      try {
        const { data, error } = await supabase
          .from('uploaded_resumes')
          .select('id, file_name, ats_score, analyzed_at, uploaded_at, analysis_results, analysis_status')
          .eq('user_id', user.id)
          .eq('analysis_status', 'completed')
          .order('analyzed_at', { ascending: false })
          .limit(6); // Get last 6 scans

        if (error) {
          console.error('Error fetching recent scans:', error);
          return;
        }

        if (data) {
          setRecentScans(data);
        }
      } catch (error) {
        console.error('Error fetching recent scans:', error);
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
      // Parse analysis results
      let parsedResults: any = null;
      if (scan.analysis_results) {
        try {
          parsedResults = typeof scan.analysis_results === 'string' 
            ? JSON.parse(scan.analysis_results) 
            : scan.analysis_results;
        } catch (parseError) {
          console.error('Error parsing analysis results:', parseError);
        }
      }

      if (parsedResults) {
        // Reconstruct AnalysisResult from stored data
        const result: AnalysisResult = {
          overallScore: parsedResults.overallScore || scan.ats_score || 0,
          scores: parsedResults.scores || {
            keywords: 0,
            formatting: 0,
            sections: 0,
            length: 0,
            readability: 0
          },
          criticalIssues: parsedResults.criticalIssues || [],
          warnings: parsedResults.warnings || [],
          passed: parsedResults.passed || [],
          foundKeywords: parsedResults.foundKeywords || [],
          missingKeywords: parsedResults.missingKeywords || [],
          suggestedKeywords: parsedResults.suggestedKeywords || [],
          fileName: scan.file_name || 'Unknown',
          fileSize: parsedResults.fileSize || 'Unknown',
          uploadDate: formatRelativeTime(scan.analyzed_at || scan.uploaded_at)
        };

        setAnalysisResult(result);
        setCurrentState('results');
        
        // Fetch AI recommendations for this result
        await fetchAIRecommendations(result);
        
        toast.success('Previous scan loaded!');
      } else {
        toast.error('Could not load scan results');
      }
    } catch (error: any) {
      console.error('Error loading previous scan:', error);
      toast.error('Failed to load previous scan');
    }
  };

  // Fetch AI recommendations
  const fetchAIRecommendations = async (result: AnalysisResult) => {
    setLoadingAI(true);
    try {
      const prompt = `Based on this ATS analysis:
- Overall Score: ${result.overallScore}%
- Critical Issues: ${result.criticalIssues.join(', ')}
- Warnings: ${result.warnings.join(', ')}
- Missing Keywords: ${result.missingKeywords.join(', ')}
- Found Keywords: ${result.foundKeywords.join(', ')}

Provide 5-7 specific, actionable recommendations to improve this resume's ATS compatibility. Focus on:
1. Fixing critical issues
2. Adding missing keywords naturally
3. Improving formatting
4. Enhancing content quality

Format as a numbered list, each recommendation should be one clear sentence.`;

      const response = await aiService.current.sendMessage(prompt, {
        contextType: 'resume',
        atsAnalysis: result,
        language: 'en',
      }, 'en');

      if (response && response.items && response.items.length > 0) {
        const content = response.items[0].content;
        // Parse recommendations (split by numbers or bullets)
        const recommendations = content
          .split(/\d+\.|[-•]/)
          .map(rec => rec.trim())
          .filter(rec => rec.length > 20) // Filter out empty/short items
          .slice(0, 7); // Limit to 7 recommendations
        
        setAiRecommendations(recommendations);
      }
    } catch (error: any) {
      console.error('Error fetching AI recommendations:', error);
      // Fallback recommendations
      setAiRecommendations([
        "Add missing keywords naturally throughout your resume",
        "Fix critical formatting issues identified in the analysis",
        "Ensure all sections are properly labeled and structured",
        "Optimize bullet points for ATS readability",
        "Include industry-specific terminology relevant to your target role"
      ]);
    } finally {
      setLoadingAI(false);
    }
  };

  // Extract text from file
  const extractTextFromFile = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (file.type === 'application/pdf') {
        // For PDF, we'll use AI to analyze the file content
        // In a production app, you'd use pdf.js or similar
        const reader = new FileReader();
        reader.onload = async (e) => {
          try {
            // For now, we'll send the file to AI for analysis
            // In production, extract text using pdf.js
            resolve('PDF content - will be analyzed by AI');
          } catch (error) {
            reject(error);
          }
        };
        reader.readAsArrayBuffer(file);
      } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
                 file.type === 'application/msword') {
        // For DOCX/DOC, we'll use AI to analyze
        const reader = new FileReader();
        reader.onload = async (e) => {
          try {
            // In production, extract text using mammoth.js or similar
            resolve('DOCX content - will be analyzed by AI');
          } catch (error) {
            reject(error);
          }
        };
        reader.readAsArrayBuffer(file);
      } else {
        reject(new Error('Unsupported file type'));
      }
    });
  };

  // Analysis function - now uses AI to analyze actual resume content
  const analyzeResume = async (file: File) => {
    setCurrentState('analyzing');
    setProgress(0);
    setAiRecommendations([]);
    setUploadedFile(file);

    try {
      // Step 1: Extract text (simulated progress)
      setProgress(10);
      let extractedText = '';
      
      try {
        // Try to extract text from file
        if (file.type === 'text/plain') {
          extractedText = await file.text();
        } else {
          // For PDF/DOCX, we'll analyze via AI
          // In production, use proper text extraction libraries
          extractedText = `Resume file: ${file.name}, Size: ${file.size} bytes`;
        }
      } catch (error) {
        console.warn('Could not extract text, using AI analysis:', error);
      }

      setProgress(30);

      // Step 2: Convert file to base64 for AI analysis (if file is small enough)
      let fileContentForAI = '';
      if (file.size < 5 * 1024 * 1024) { // 5MB limit
        try {
          const arrayBuffer = await file.arrayBuffer();
          const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
          fileContentForAI = `File encoded as base64: ${base64.substring(0, 1000)}...`;
        } catch (error) {
          console.warn('Could not encode file:', error);
        }
      }

      // Step 3: Use AI to analyze the resume
      const analysisPrompt = `You are an expert ATS (Applicant Tracking System) resume analyzer. Analyze the provided resume file for ATS compatibility.

File Information:
- Name: ${file.name}
- Size: ${(file.size / 1024).toFixed(1)} KB
- Type: ${file.type}
${extractedText ? `\nExtracted Text Content:\n${extractedText.substring(0, 5000)}\n` : ''}
${fileContentForAI ? `\nFile Content (partial): ${fileContentForAI}\n` : ''}

CRITICAL INSTRUCTIONS:
1. Analyze the ACTUAL resume content - do NOT make assumptions
2. Extract keywords ONLY from what is actually present in the resume
3. If the resume is about operations/business/management, identify operational keywords like:
   - Operations, Process Improvement, Supply Chain, Logistics, Vendor Management
   - Business Analysis, Project Management, Stakeholder Management
   - Quality Assurance, Compliance, Risk Management
4. If the resume is technical/IT, identify technical keywords
5. If the resume is sales/marketing, identify sales/marketing keywords
6. DO NOT assume tech keywords (JavaScript, React, etc.) if the resume is operational
7. Base ALL analysis on the actual content you can see in the resume

Please provide a comprehensive ATS analysis in the following JSON format (ONLY return valid JSON, no additional text):
{
  "overallScore": <number 0-100>,
  "scores": {
    "keywords": <number 0-100>,
    "formatting": <number 0-100>,
    "sections": <number 0-100>,
    "length": <number 0-100>,
    "readability": <number 0-100>
  },
  "criticalIssues": [<array of critical issues>],
  "warnings": [<array of warnings>],
  "passed": [<array of passed checks>],
  "foundKeywords": [<array of ACTUAL keywords found in the resume - be specific to the resume's field>],
  "missingKeywords": [<array of important keywords that are missing for this field/role>],
  "suggestedKeywords": [<array of suggested keywords relevant to this field/role>]
}

Remember: Extract keywords based on the ACTUAL resume content, not assumptions!`;

      setProgress(50);

      // Prepare file data for edge function
      let fileDataForAI: any = {
        name: file.name,
        size: file.size,
        type: file.type,
      };

      // If we have extracted text, include it
      if (extractedText && extractedText.length > 0 && !extractedText.includes('will be analyzed')) {
        fileDataForAI.content = extractedText;
      }

      // For PDF/DOCX, the edge function should handle file analysis
      // We'll send the file metadata and let the edge function process it
      const aiResponse = await aiService.current.sendMessage(analysisPrompt, {
        contextType: 'resume',
        resumeFile: fileDataForAI,
        requestType: 'ats_analysis',
        // Include file as base64 if small enough for edge function to process
        fileBase64: file.size < 2 * 1024 * 1024 ? await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => {
            const base64 = (reader.result as string).split(',')[1];
            resolve(base64);
          };
          reader.readAsDataURL(file);
        }).catch(() => '') : undefined
      }, 'en');

      setProgress(80);

      if (!aiResponse || !aiResponse.items || aiResponse.items.length === 0) {
        throw new Error('No response from AI service');
      }

      // Parse AI response
      const aiContent = aiResponse.items.map(item => item.content).join('\n');
      
      // Try to extract JSON from the response
      let parsedAnalysis: any = null;
      try {
        // Look for JSON in the response
        const jsonMatch = aiContent.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsedAnalysis = JSON.parse(jsonMatch[0]);
        } else {
          // If no JSON, parse the text response
          throw new Error('No JSON found in response');
        }
      } catch (parseError) {
        console.warn('Could not parse AI response as JSON, using fallback analysis');
        // Fallback: Use AI to extract keywords from the text response
        const keywordExtractionPrompt = `From this ATS analysis text, extract:
1. Found keywords (actual keywords mentioned in the resume)
2. Missing keywords (keywords that should be added)
3. Overall score (0-100)

Analysis text:
${aiContent}

Return as JSON: {"foundKeywords": [...], "missingKeywords": [...], "overallScore": <number>}`;

        const keywordResponse = await aiService.current.sendMessage(keywordExtractionPrompt, {
          contextType: 'resume',
          requestType: 'keyword_extraction'
        }, 'en');

        if (keywordResponse && keywordResponse.items && keywordResponse.items.length > 0) {
          const keywordContent = keywordResponse.items[0].content;
          const keywordJsonMatch = keywordContent.match(/\{[\s\S]*\}/);
          if (keywordJsonMatch) {
            parsedAnalysis = JSON.parse(keywordJsonMatch[0]);
          }
        }
      }

      setProgress(95);

      // Create result object
      const result: AnalysisResult = {
        overallScore: parsedAnalysis?.overallScore || 75,
        scores: {
          keywords: parsedAnalysis?.scores?.keywords || 70,
          formatting: parsedAnalysis?.scores?.formatting || 85,
          sections: parsedAnalysis?.scores?.sections || 80,
          length: parsedAnalysis?.scores?.length || 90,
          readability: parsedAnalysis?.scores?.readability || 75
        },
        criticalIssues: parsedAnalysis?.criticalIssues || [
          "Unable to fully analyze resume - please ensure file is readable"
        ],
        warnings: parsedAnalysis?.warnings || [
          "Some sections may need improvement"
        ],
        passed: parsedAnalysis?.passed || [
          "Resume uploaded successfully"
        ],
        foundKeywords: parsedAnalysis?.foundKeywords || [],
        missingKeywords: parsedAnalysis?.missingKeywords || [],
        suggestedKeywords: parsedAnalysis?.suggestedKeywords || [],
        fileName: file.name,
        fileSize: `${(file.size / 1024).toFixed(1)} KB`,
        uploadDate: new Date().toLocaleDateString()
      };

      // If no keywords found, try to extract from AI content
      if (result.foundKeywords.length === 0 && aiContent) {
        // Extract keywords from the AI response text
        const keywordPrompt = `Extract actual keywords that were found in the resume from this analysis: ${aiContent}. Return only the keywords as a JSON array.`;
        try {
          const keywordExtractResponse = await aiService.current.sendMessage(keywordPrompt, {
            contextType: 'resume',
            requestType: 'keyword_extraction'
          }, 'en');
          
          if (keywordExtractResponse && keywordExtractResponse.items && keywordExtractResponse.items.length > 0) {
            const keywordText = keywordExtractResponse.items[0].content;
            const keywordArrayMatch = keywordText.match(/\[[\s\S]*\]/);
            if (keywordArrayMatch) {
              result.foundKeywords = JSON.parse(keywordArrayMatch[0]);
            }
          }
        } catch (error) {
          console.warn('Could not extract keywords:', error);
        }
      }

      setProgress(100);
      setAnalysisResult(result);
      setCurrentState('results');
      
      // Save analysis to backend (uploaded_resumes table)
      if (user?.id) {
        try {
          const { error: saveError } = await supabase
            .from('uploaded_resumes')
            .insert({
              user_id: user.id,
              file_name: file.name,
              file_type: file.type,
              extracted_text: extractedText || '',
              ats_score: result.overallScore,
              analysis_results: JSON.stringify(result),
              analysis_status: 'completed',
              analyzed_at: new Date().toISOString(),
            });

          if (saveError) {
            console.error('Error saving ATS analysis to database:', saveError);
            // Don't show error to user - analysis still worked
          } else {
            console.log('ATS analysis saved to database successfully');
            // Refresh recent scans list
            const { data: scansData } = await supabase
              .from('uploaded_resumes')
              .select('id, file_name, ats_score, analyzed_at, uploaded_at, analysis_results, analysis_status')
              .eq('user_id', user.id)
              .eq('analysis_status', 'completed')
              .order('analyzed_at', { ascending: false })
              .limit(6);
            
            if (scansData) {
              setRecentScans(scansData);
            }
          }
        } catch (saveErr) {
          console.error('Error saving ATS analysis:', saveErr);
          // Don't show error to user - analysis still worked
        }
      }
      
      // Fetch AI recommendations after analysis
      await fetchAIRecommendations(result);
    } catch (error: any) {
      console.error('Error analyzing resume:', error);
      toast.error(`Failed to analyze resume: ${error?.message || 'Unknown error'}`);
      
      // Show error state but still allow user to see partial results
      setCurrentState('results');
    }
  };

  // Handle file upload
  const handleFileUpload = (file: File) => {
    if (file && (file.type === 'application/pdf' || 
        file.type === 'application/msword' || 
        file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        file.type === 'text/plain')) {
      analyzeResume(file);
    } else {
      toast.error('Please upload a PDF, DOC, DOCX, or TXT file');
    }
  };

  // Drag and drop handlers
  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileUpload(file);
    }
  }, []);

  const handleFileInput = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const resetToUpload = () => {
    setCurrentState('upload');
    setProgress(0);
    setAnalysisResult(null);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getScoreGradient = (score: number) => {
    if (score >= 80) return 'from-green-500 to-emerald-500';
    if (score >= 60) return 'from-yellow-500 to-orange-500';
    return 'from-red-500 to-pink-500';
  };

  return (
    <div className={`min-h-screen transition-colors duration-500 ${
      isDark 
        ? 'bg-slate-900' 
        : 'bg-gradient-to-br from-gray-50 via-pink-50/30 to-gray-50'
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
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center">
                  <FileCheck className="size-5 text-white" />
                </div>
                <div>
                  <h1 className={`text-xl ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    ATS Checker
                  </h1>
                  <p className="text-sm text-gray-400">
                    {currentState === 'upload' && 'Upload your resume to analyze'}
                    {currentState === 'analyzing' && 'Analyzing your resume...'}
                    {currentState === 'results' && 'Analysis complete'}
                  </p>
                </div>
              </div>
            </div>
            
            {currentState === 'results' && (
              <div className="flex items-center gap-3">
                <Button
                  onClick={resetToUpload}
                  className="bg-white/10 hover:bg-white/20 text-white border-0"
                >
                  <Upload className="size-4 mr-2" />
                  New Scan
                </Button>
                <Button
                  onClick={async () => {
                    if (!analysisResult) return;
                    const ok = await exportATSReportWeb(analysisResult as any, aiRecommendations);
                    if (!ok) {
                      // Fallback to element PDF, then print
                      if (resultsRef.current) {
                        await exportElementToPdf(resultsRef.current, `ATS_Report_${analysisResult.fileName || ''}.pdf`);
                      } else {
                        exportElementToPrint(resultsRef.current, { title: `ATS Report - ${analysisResult?.fileName || ''}` });
                      }
                    }
                  }}
                  className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white border-0">
                  <Download className="size-4 mr-2" />
                  Download Report
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-8">
        {/* STATE 1: UPLOAD */}
        {currentState === 'upload' && (
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <div className="w-48 h-48 mx-auto mb-6 relative">
                <div className="absolute inset-0 bg-gradient-to-br from-pink-500 to-rose-500 rounded-full blur-3xl opacity-20"></div>
                <img 
                  src="/ATS Checker.png" 
                  alt="Estel ATS Checker"
                  className="relative z-10 w-full h-full object-contain animate-float"
                />
              </div>
              <h2 className={`text-4xl mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Check Your Resume's <span className="bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent">ATS Score</span>
              </h2>
              <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Upload your resume and get instant feedback on how well it will perform with Applicant Tracking Systems
              </p>
            </div>

            {/* Upload Zone */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`relative rounded-2xl border-2 border-dashed transition-all duration-300 ${
                isDragging
                  ? 'border-pink-500 bg-pink-500/10 scale-102'
                  : isDark
                    ? 'border-white/20 bg-white/5 hover:border-pink-500/50 hover:bg-white/10'
                    : 'border-gray-300 bg-white hover:border-pink-500 hover:bg-pink-50'
              }`}
            >
              <label className="block p-12 text-center cursor-pointer">
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileInput}
                  className="hidden"
                />
                
                <div className={`w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center`}>
                  <Upload className="size-10 text-white" />
                </div>
                
                <h3 className={`text-2xl mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Drop your resume here
                </h3>
                <p className={`text-lg mb-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  or click to browse files
                </p>
                
                <div className="flex items-center justify-center gap-4 mb-6">
                  <div className={`px-4 py-2 rounded-lg ${isDark ? 'bg-white/5' : 'bg-gray-100'}`}>
                    <FileText className="size-5 inline mr-2 text-red-500" />
                    <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>PDF</span>
                  </div>
                  <div className={`px-4 py-2 rounded-lg ${isDark ? 'bg-white/5' : 'bg-gray-100'}`}>
                    <FileText className="size-5 inline mr-2 text-blue-500" />
                    <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>DOC</span>
                  </div>
                  <div className={`px-4 py-2 rounded-lg ${isDark ? 'bg-white/5' : 'bg-gray-100'}`}>
                    <FileText className="size-5 inline mr-2 text-blue-500" />
                    <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>DOCX</span>
                  </div>
                </div>
                
                <p className="text-sm text-gray-500">Maximum file size: 5MB</p>
              </label>
            </div>

            {/* Recent Scans */}
            {recentScans.length > 0 && (
              <div className="mt-12">
                <h3 className={`text-xl mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Recent Scans
                </h3>
                {loadingScans ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="size-6 animate-spin text-pink-500" />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {recentScans.map((scan) => {
                      const score = scan.ats_score || 0;
                      const scanDate = scan.analyzed_at || scan.uploaded_at;
                      
                      return (
                        <button
                          key={scan.id}
                          onClick={() => loadPreviousScan(scan)}
                          className={`p-4 rounded-xl border text-left transition-all hover:scale-105 ${
                            isDark
                              ? 'bg-white/5 border-white/10 hover:border-white/20'
                              : 'bg-white border-gray-200 hover:border-pink-300 hover:shadow-lg'
                          }`}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <FileText className={`size-5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
                            <span className={`text-2xl font-semibold ${getScoreColor(score)}`}>
                              {score}
                            </span>
                          </div>
                          <p className={`text-sm mb-1 truncate ${isDark ? 'text-white' : 'text-gray-900'}`} title={scan.file_name}>
                            {scan.file_name || 'Unknown File'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatRelativeTime(scanDate)}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* STATE 2: ANALYZING */}
        {currentState === 'analyzing' && (
          <div className="max-w-2xl mx-auto text-center">
            <div className="w-64 h-64 mx-auto mb-8 relative">
              <div className="absolute inset-0 bg-gradient-to-br from-pink-500 to-rose-500 rounded-full blur-3xl opacity-30 animate-pulse"></div>
              <img 
                src="/ATS Checker.png" 
                alt="Estel Analyzing"
                className="relative z-10 w-full h-full object-contain animate-bounce"
                style={{ animationDuration: '2s' }}
              />
            </div>
            
            <h2 className={`text-4xl mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Analyzing Your Resume...
            </h2>
            <p className={`text-lg mb-8 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {progress < 30 && "Scanning document structure..."}
              {progress >= 30 && progress < 60 && "Checking keyword optimization..."}
              {progress >= 60 && progress < 90 && "Analyzing ATS compatibility..."}
              {progress >= 90 && "Finalizing results..."}
            </p>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className={`h-3 rounded-full overflow-hidden ${isDark ? 'bg-white/10' : 'bg-gray-200'}`}>
                <div 
                  className="h-full bg-gradient-to-r from-pink-500 to-rose-500 transition-all duration-300 ease-out"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <p className={`text-sm mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {progress}% complete
              </p>
            </div>

            {/* Scanning Steps */}
            <div className="mt-8 space-y-3">
              {[
                { step: 'Format Analysis', done: progress > 25 },
                { step: 'Keyword Matching', done: progress > 50 },
                { step: 'Section Detection', done: progress > 75 },
                { step: 'ATS Compatibility', done: progress > 90 }
              ].map((item, index) => (
                <div 
                  key={index}
                  className={`flex items-center justify-center gap-3 ${
                    item.done ? 'opacity-100' : 'opacity-40'
                  } transition-opacity duration-300`}
                >
                  {item.done ? (
                    <CheckCircle className="size-5 text-green-500" />
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

        {/* STATE 3: RESULTS */}
        {currentState === 'results' && analysisResult && (
          <div className="max-w-7xl mx-auto" ref={resultsRef}>
            <div className="grid grid-cols-3 gap-6">
              {/* Left Panel - Overall Score */}
              <div className="col-span-1">
                <div className={`rounded-2xl border p-6 sticky top-6 ${
                  isDark
                    ? 'bg-white/5 border-white/10'
                    : 'bg-white border-gray-200'
                }`}>
                  <h3 className={`text-lg mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Overall ATS Score
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
                        strokeDashoffset={`${2 * Math.PI * 88 * (1 - analysisResult.overallScore / 100)}`}
                        strokeLinecap="round"
                        className="transition-all duration-1000 ease-out"
                      />
                      <defs>
                        <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" className="text-pink-500" stopColor="currentColor" />
                          <stop offset="100%" className="text-rose-500" stopColor="currentColor" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className={`text-5xl mb-1 ${getScoreColor(analysisResult.overallScore)}`}>
                        {analysisResult.overallScore}
                      </span>
                      <span className="text-sm text-gray-500">out of 100</span>
                    </div>
                  </div>

                  <div className={`p-4 rounded-xl mb-4 ${
                    isDark ? 'bg-white/5' : 'bg-gray-50'
                  }`}>
                    <div className="text-sm text-gray-500 mb-2">Status</div>
                    <div className={`text-lg ${
                      analysisResult.overallScore >= 80 ? 'text-green-500' :
                      analysisResult.overallScore >= 60 ? 'text-yellow-500' : 'text-red-500'
                    }`}>
                      {analysisResult.overallScore >= 80 ? '✓ Excellent' :
                       analysisResult.overallScore >= 60 ? '⚠ Good' : '✗ Needs Work'}
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">File Name:</span>
                      <span className={`truncate ml-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {analysisResult.fileName}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">File Size:</span>
                      <span className={isDark ? 'text-white' : 'text-gray-900'}>
                        {analysisResult.fileSize}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Analyzed:</span>
                      <span className={isDark ? 'text-white' : 'text-gray-900'}>
                        {analysisResult.uploadDate}
                      </span>
                    </div>
                  </div>

                  <Button className="w-full mt-6 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white border-0">
                    <Sparkles className="size-4 mr-2" />
                    Optimize with AI
                  </Button>
                </div>
              </div>

              {/* Right Panel - Detailed Results */}
              <div className="col-span-2 space-y-6">
                {/* Score Breakdown */}
                <div className={`rounded-2xl border p-6 ${
                  isDark
                    ? 'bg-white/5 border-white/10'
                    : 'bg-white border-gray-200'
                }`}>
                  <h3 className={`text-xl mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Score Breakdown
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    {(Object.entries(analysisResult.scores) as [string, number][]).map(([key, value]) => (
                      <div 
                        key={key}
                        className={`p-4 rounded-xl ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className={`capitalize ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            {key}
                          </span>
                          <span className={`text-2xl ${getScoreColor(value)}`}>
                            {value}
                          </span>
                        </div>
                        <div className={`h-2 rounded-full overflow-hidden ${isDark ? 'bg-white/10' : 'bg-gray-200'}`}>
                          <div 
                            className={`h-full bg-gradient-to-r ${getScoreGradient(value)} transition-all duration-1000`}
                            style={{ width: `${value}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Issues & Fixes */}
                <div className={`rounded-2xl border p-6 ${
                  isDark
                    ? 'bg-white/5 border-white/10'
                    : 'bg-white border-gray-200'
                }`}>
                  <h3 className={`text-xl mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Issues & Recommendations
                  </h3>

                  {/* Critical Issues */}
                  {analysisResult.criticalIssues.length > 0 && (
                    <div className="mb-6">
                      <div className="flex items-center gap-2 mb-3">
                        <XCircle className="size-5 text-red-500" />
                        <h4 className={`${isDark ? 'text-white' : 'text-gray-900'}`}>
                          Critical Issues ({analysisResult.criticalIssues.length})
                        </h4>
                      </div>
                      <div className="space-y-2">
                        {analysisResult.criticalIssues.map((issue, index) => (
                          <div 
                            key={index}
                            className={`flex items-start justify-between p-3 rounded-lg ${
                              isDark ? 'bg-red-500/10' : 'bg-red-50'
                            }`}
                          >
                            <span className={`text-sm flex-1 ${isDark ? 'text-red-200' : 'text-red-900'}`}>
                              {issue}
                            </span>
                            <Button 
                              size="sm"
                              className="ml-3 bg-red-500 hover:bg-red-600 text-white border-0 text-xs px-3 py-1 h-auto"
                            >
                              Fix Now
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Warnings */}
                  {analysisResult.warnings.length > 0 && (
                    <div className="mb-6">
                      <div className="flex items-center gap-2 mb-3">
                        <AlertCircle className="size-5 text-yellow-500" />
                        <h4 className={`${isDark ? 'text-white' : 'text-gray-900'}`}>
                          Warnings ({analysisResult.warnings.length})
                        </h4>
                      </div>
                      <div className="space-y-2">
                        {analysisResult.warnings.map((warning, index) => (
                          <div 
                            key={index}
                            className={`flex items-start justify-between p-3 rounded-lg ${
                              isDark ? 'bg-yellow-500/10' : 'bg-yellow-50'
                            }`}
                          >
                            <span className={`text-sm flex-1 ${isDark ? 'text-yellow-200' : 'text-yellow-900'}`}>
                              {warning}
                            </span>
                            <Button 
                              size="sm"
                              className="ml-3 bg-yellow-500 hover:bg-yellow-600 text-white border-0 text-xs px-3 py-1 h-auto"
                            >
                              Review
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Passed */}
                  {analysisResult.passed.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <CheckCircle className="size-5 text-green-500" />
                        <h4 className={`${isDark ? 'text-white' : 'text-gray-900'}`}>
                          Passed Checks ({analysisResult.passed.length})
                        </h4>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {analysisResult.passed.map((item, index) => (
                          <div 
                            key={index}
                            className={`p-3 rounded-lg ${
                              isDark ? 'bg-green-500/10' : 'bg-green-50'
                            }`}
                          >
                            <span className={`text-sm ${isDark ? 'text-green-200' : 'text-green-900'}`}>
                              {item}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Keywords Analysis */}
                <div className={`rounded-2xl border p-6 ${
                  isDark
                    ? 'bg-white/5 border-white/10'
                    : 'bg-white border-gray-200'
                }`}>
                  <h3 className={`text-xl mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Keyword Analysis
                  </h3>

                  {/* Found Keywords */}
                  <div className="mb-6">
                    <h4 className={`text-sm mb-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      ✓ Found Keywords ({analysisResult.foundKeywords.length})
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {analysisResult.foundKeywords.map((keyword, index) => (
                        <span
                          key={index}
                          className={`px-3 py-1 rounded-lg text-sm ${
                            isDark 
                              ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                              : 'bg-green-100 text-green-700 border border-green-200'
                          }`}
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Missing Keywords */}
                  <div className="mb-6">
                    <h4 className={`text-sm mb-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      ✗ Missing Keywords ({analysisResult.missingKeywords.length})
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {analysisResult.missingKeywords.map((keyword, index) => (
                        <button
                          key={index}
                          className={`group px-3 py-1 rounded-lg text-sm transition-all hover:scale-105 ${
                            isDark 
                              ? 'bg-red-500/20 text-red-300 border border-red-500/30 hover:bg-red-500/30'
                              : 'bg-red-100 text-red-700 border border-red-200 hover:bg-red-200'
                          }`}
                        >
                          {keyword}
                          <span className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity">+</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Suggested Keywords */}
                  <div>
                    <h4 className={`text-sm mb-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      💡 Suggested Keywords ({analysisResult.suggestedKeywords.length})
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {analysisResult.suggestedKeywords.map((keyword, index) => (
                        <span
                          key={index}
                          className={`px-3 py-1 rounded-lg text-sm ${
                            isDark 
                              ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                              : 'bg-blue-100 text-blue-700 border border-blue-200'
                          }`}
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* AI Recommendations */}
                <div className={`rounded-2xl border p-6 bg-gradient-to-br from-pink-500/10 to-rose-500/10 ${
                  isDark ? 'border-pink-500/20' : 'border-pink-200'
                }`}>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center flex-shrink-0">
                      <Sparkles className="size-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className={`text-lg mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Estel's AI Recommendations
                      </h3>
                      {loadingAI ? (
                        <div className="flex items-center gap-2 py-4">
                          <Loader2 className="size-4 animate-spin text-pink-500" />
                          <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            Generating personalized recommendations...
                          </span>
                        </div>
                      ) : aiRecommendations.length > 0 ? (
                        <ul className="space-y-2">
                          {aiRecommendations.map((rec, index) => (
                            <li key={index} className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                              • {rec}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <ul className="space-y-2">
                          <li className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            • Add a Professional Summary section at the top to improve ATS parsing
                          </li>
                          <li className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            • Include these high-impact keywords: Python, Docker, CI/CD
                          </li>
                          <li className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            • Standardize your date format throughout the document
                          </li>
                          <li className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            • Consider shortening bullet points to 1-2 lines for better readability
                          </li>
                        </ul>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
