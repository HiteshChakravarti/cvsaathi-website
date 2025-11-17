// Shared types for CV functionality to avoid circular dependencies

export interface CVAnalysis {
  skills: string[];
  experience: number;
  education: string[];
  contactInfo: {
    email?: string;
    phone?: string;
    location?: string;
  };
  summary: string;
  recommendations: string[];
  score: number;
}

export interface ImportedCV {
  id: string;
  userId: string;
  fileName: string;
  originalFormat: 'pdf' | 'docx' | 'txt' | 'rtf' | 'jpg' | 'jpeg' | 'png';
  fileSize: number;
  fileUrl: string;
  uploadDate: Date;
  analysisData?: CVAnalysis;
  enhancedVersion?: string;
  tags: string[];
  isActive: boolean;
}

export interface UploadProgress {
  progress: number;
  status: 'uploading' | 'processing' | 'analyzing' | 'completed' | 'error';
  message: string;
}

export interface AnalysisResult {
  success: boolean;
  analysis?: CVAnalysis;
  error?: string;
  processingTime?: number;
}

export interface TextExtractionResult {
  success: boolean;
  text?: string;
  error?: string;
}

export interface SkillAnalysis {
  technicalSkills: string[];
  softSkills: string[];
  industrySkills: string[];
  skillGaps: string[];
  recommendations: string[];
}

export interface ATSOptimization {
  score: number;
  issues: string[];
  suggestions: string[];
  keywords: string[];
  missingKeywords: string[];
}
