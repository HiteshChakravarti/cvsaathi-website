import { useState, useEffect, useRef } from "react";
import { 
  ChevronLeft, ChevronRight, Save, Download, Eye, ZoomIn, ZoomOut,
  Sparkles, Check, AlertCircle, FileText, Briefcase, GraduationCap,
  Award, Code, Palette, FileCheck, Share2, Mail, Link2, BookOpen,
  TrendingUp, Users, Target, Plus, X, Trash2, GripVertical, Wand2,
  CheckCircle, XCircle, ArrowRight, Upload, Linkedin, Github, Globe,
  MapPin, Phone, AtSign, Calendar, DollarSign, Trophy, Languages,
  Mic, Heart, RefreshCw, MessageCircle, Stars, Zap, ArrowLeft, Layout,
  Type, AlignLeft, Columns, Loader2
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { exportElementToPrint, exportElementToPdf } from "../../services/exportService";
import { exportResumeWeb } from "../../lib/cvsaathi-export/pdfGenerator";
import { toast } from "sonner";
import { useResumes } from "../../hooks/useResumes";
import { AICareerService } from "../../services/aiCareerService";
import { useAuth } from "../../contexts/AuthContext";
import { supabase } from "../../lib/supabaseClient";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, PieChart, Pie, Cell
} from "recharts";
import { TemplateRenderer } from "./templates/TemplateRenderer";
import { LayoutCustomization } from "./LayoutCustomization";
import { useTranslation } from "react-i18next";

interface ResumeBuilderPageProps {
  isDark: boolean;
  onBack: () => void;
}

type Step = 'welcome' | 'template' | 'personal' | 'summary' | 'experience' | 'education' | 'skills' | 'projects' | 'additional' | 'layout' | 'critique' | 'ats' | 'export';

interface PersonalInfo {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  portfolio: string;
  github: string;
  headline: string;
}

interface Experience {
  id: string;
  company: string;
  title: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  bullets: string[];
}

interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  graduationYear: string;
  gpa: string;
  showGpa: boolean;
  honors: string[];
}

interface Project {
  id: string;
  name: string;
  description: string;
  technologies: string[];
  link: string;
  date: string;
}

export interface ResumeData {
  templateId: string;
  personalInfo: PersonalInfo;
  summary: string;
  experiences: Experience[];
  education: Education[];
  technicalSkills: string[];
  softSkills: string[];
  projects: Project[];
  certifications: string[];
  languages: string[];
  awards: string[];
  customSections: any[];
  lastStep?: string; // Save current step for restoration
  layout: {
    accentColor: string;
    fontFamily: string;
    spacing: 'compact' | 'balanced' | 'spacious';
    headerStyle: 'centered' | 'left' | 'two-column';
    columns: 1 | 2;
    fontSize: 'small' | 'medium' | 'large';
    sectionVisibility: {
      summary: boolean;
      experience: boolean;
      education: boolean;
      skills: boolean;
      projects: boolean;
      certifications: boolean;
      languages: boolean;
      awards: boolean;
    };
    sectionOrder: string[]; // Array of section IDs in display order
  };
}

const getTemplates = (t: any) => [
  { id: 'modern-pro', name: t('dashboard.resumeBuilder.templates.modernPro'), category: 'modern', categoryLabel: t('dashboard.resumeBuilder.templateCategories.modern'), atsScore: 95, description: t('dashboard.resumeBuilder.templateDescriptions.modernPro') },
  { id: 'classic', name: t('dashboard.resumeBuilder.templates.classic'), category: 'classic', categoryLabel: t('dashboard.resumeBuilder.templateCategories.classic'), atsScore: 98, description: t('dashboard.resumeBuilder.templateDescriptions.classic') },
  { id: 'creative', name: t('dashboard.resumeBuilder.templates.creative'), category: 'creative', categoryLabel: t('dashboard.resumeBuilder.templateCategories.creative'), atsScore: 85, description: t('dashboard.resumeBuilder.templateDescriptions.creative') },
  { id: 'technical', name: t('dashboard.resumeBuilder.templates.technical'), category: 'technical', categoryLabel: t('dashboard.resumeBuilder.templateCategories.technical'), atsScore: 96, description: t('dashboard.resumeBuilder.templateDescriptions.technical') },
  { id: 'minimal', name: t('dashboard.resumeBuilder.templates.minimal'), category: 'modern', categoryLabel: t('dashboard.resumeBuilder.templateCategories.modern'), atsScore: 97, description: t('dashboard.resumeBuilder.templateDescriptions.minimal') },
  { id: 'modern-two', name: t('dashboard.resumeBuilder.templates.modernTwo'), category: 'modern', categoryLabel: t('dashboard.resumeBuilder.templateCategories.modern'), atsScore: 93, description: t('dashboard.resumeBuilder.templateDescriptions.modernTwo') },
  { id: 'academic', name: t('dashboard.resumeBuilder.templates.academic'), category: 'classic', categoryLabel: t('dashboard.resumeBuilder.templateCategories.classic'), atsScore: 99, description: t('dashboard.resumeBuilder.templateDescriptions.academic') },
  { id: 'executive', name: t('dashboard.resumeBuilder.templates.executive'), category: 'executive', categoryLabel: t('dashboard.resumeBuilder.templateCategories.executive'), atsScore: 94, description: t('dashboard.resumeBuilder.templateDescriptions.executive') }
];

const getSteps = (t: any) => [
  { id: 'welcome', title: t('dashboard.resumeBuilder.steps.welcome'), icon: FileText },
  { id: 'template', title: t('dashboard.resumeBuilder.steps.template'), icon: Palette },
  { id: 'personal', title: t('dashboard.resumeBuilder.steps.personal'), icon: Users },
  { id: 'summary', title: t('dashboard.resumeBuilder.steps.summary'), icon: FileText },
  { id: 'experience', title: t('dashboard.resumeBuilder.steps.experience'), icon: Briefcase },
  { id: 'education', title: t('dashboard.resumeBuilder.steps.education'), icon: GraduationCap },
  { id: 'skills', title: t('dashboard.resumeBuilder.steps.skills'), icon: Award },
  { id: 'projects', title: t('dashboard.resumeBuilder.steps.projects'), icon: Code },
  { id: 'additional', title: t('dashboard.resumeBuilder.steps.additional'), icon: Plus },
  { id: 'layout', title: t('dashboard.resumeBuilder.steps.layout'), icon: Palette },
  { id: 'critique', title: t('dashboard.resumeBuilder.steps.critique'), icon: Sparkles },
  { id: 'ats', title: t('dashboard.resumeBuilder.steps.ats'), icon: FileCheck },
  { id: 'export', title: t('dashboard.resumeBuilder.steps.export'), icon: Download }
];

const accentColors = [
  { name: 'Teal', value: '#14b8a6' },
  { name: 'Purple', value: '#a855f7' },
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Pink', value: '#ec4899' },
  { name: 'Emerald', value: '#10b981' },
  { name: 'Orange', value: '#f97316' },
];

export function ResumeBuilderPage({ isDark, onBack }: ResumeBuilderPageProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [currentResumeId, setCurrentResumeId] = useState<string | undefined>();
  const { resumes, saveResume, loadResume, loading: resumeLoading, saving: resumeSaving } = useResumes();
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const aiService = useRef(new AICareerService());
  const previewPrintRef = useRef<HTMLDivElement>(null);
  const exportA4Ref = useRef<HTMLDivElement>(null);
  
  const steps = getSteps(t);
  const templates = getTemplates(t);
  const [currentStep, setCurrentStep] = useState<Step>('welcome');
  const [resumeData, setResumeData] = useState<ResumeData>({
    templateId: 'modern-pro',
    personalInfo: {
      fullName: '',
      email: '',
      phone: '',
      location: '',
      linkedin: '',
      portfolio: '',
      github: '',
      headline: ''
    },
    summary: '',
    experiences: [],
    education: [],
    technicalSkills: [],
    softSkills: [],
    projects: [],
    certifications: [],
    languages: [],
    awards: [],
    customSections: [],
    layout: {
      accentColor: '#14b8a6',
      fontFamily: 'Inter',
      spacing: 'balanced',
      headerStyle: 'centered',
      columns: 1,
      fontSize: 'medium',
      sectionVisibility: {
        summary: true,
        experience: true,
        education: true,
        skills: true,
        projects: true,
        certifications: true,
        languages: true,
        awards: true,
      },
      sectionOrder: ['summary', 'experience', 'education', 'skills', 'projects', 'certifications', 'languages', 'awards']
    }
  });

  const [showPreview, setShowPreview] = useState(true);
  const [previewMinimized, setPreviewMinimized] = useState(false);
  const [previewZoom, setPreviewZoom] = useState(100);
  const [estelMessage, setEstelMessage] = useState(t('dashboard.resumeBuilder.estelWelcome'));
  const [lastSaved, setLastSaved] = useState<Date>(new Date());
  const [aiGenerating, setAiGenerating] = useState(false);
  const [targetRole, setTargetRole] = useState('Software Engineer');
  const [yearsOfExperience, setYearsOfExperience] = useState('5+');
  const [industry, setIndustry] = useState('Technology');
  const [newSkill, setNewSkill] = useState('');
  const [newTech, setNewTech] = useState('');
  const [atsScore, setAtsScore] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [critiqueData, setCritiqueData] = useState({
    overall: 0,
    content: 0,
    formatting: 0,
    impact: 0,
    length: 0
  });
  const [detailedFeedback, setDetailedFeedback] = useState<string>('');

  // Auto-add first entry when reaching steps
  // Removed auto-add useEffect - users now click "Add First" buttons instead

  // Auto-save to database (includes current step)
  useEffect(() => {
    // Don't auto-save on welcome step
    if (currentStep === 'welcome') return;

    // Clear any pending save
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Debounce save - wait 2 seconds after last change
    saveTimeoutRef.current = setTimeout(async () => {
      try {
        const title = resumeData.personalInfo.fullName 
          ? `${resumeData.personalInfo.fullName}'s Resume`
          : 'Untitled Resume';
        
        // Include current step in resume data for restoration
        // Note: lastStep is metadata, stored in resume_data JSONB but not part of resume content
        const resumeDataWithStep = {
          ...resumeData,
          lastStep: currentStep, // Save current step for restoration
        };
        
        const saved = await saveResume(resumeDataWithStep, currentResumeId, title);
        
        if (saved && !currentResumeId) {
          setCurrentResumeId(saved.id);
        }
        
        setLastSaved(new Date());
        // Only show toast if user is actively editing (not on welcome step)
        if (currentStep !== 'welcome') {
          toast.success(t('dashboard.resumeBuilder.autoSaved'), { duration: 1000 });
        }
      } catch (error) {
        console.error('Auto-save failed:', error);
        // Don't show error toast for auto-save failures to avoid annoying users
      }
    }, 2000); // 2 second debounce

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [resumeData, currentResumeId, currentStep, saveResume]);

  // Format relative time for "Last saved" indicator
  const formatRelativeTime = (date: Date): string => {
    const now = new Date();
    const diffSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffSeconds < 60) return t('dashboard.resumeBuilder.justNow');
    const diffMinutes = Math.floor(diffSeconds / 60);
    if (diffMinutes < 60) return t('dashboard.resumeBuilder.minutesAgo', { n: diffMinutes });
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return t('dashboard.resumeBuilder.hoursAgo', { n: diffHours });
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return t('dashboard.resumeBuilder.daysAgo', { n: diffDays });
    return date.toLocaleDateString();
  };

  const currentStepIndex = steps.findIndex(s => s.id === currentStep);
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  const nextStep = () => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < steps.length) {
      setCurrentStep(steps[nextIndex].id as Step);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const prevStep = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(steps[prevIndex].id as Step);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (currentStep === 'template') {
      // If on template step, go back to welcome
      setCurrentStep('welcome');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

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

  const generateWithAI = async (type: string, context?: any) => {
    setAiGenerating(true);
    setEstelMessage(t('dashboard.resumeBuilder.aiThinking'));
    
    try {
      let prompt = '';
      let aiContext: any = {
        contextType: 'resume',
        resumeData: resumeData,
        language: 'en',
      };

      switch(type) {
        case 'summary':
          prompt = `Write a professional resume summary for a ${context?.title || 'professional'} with ${context?.years || '5+'} years of experience in ${context?.industry || 'technology'}. 
          Include their key skills: ${context?.skills?.join(', ') || 'various technical skills'}. 
          Make it compelling, ATS-friendly, and highlight their achievements. Keep it to 3-4 sentences.`;
          aiContext.resumeSection = 'summary';
          break;
        case 'headline':
          prompt = `Create a professional resume headline for a ${context?.title || 'professional'} with expertise in ${context?.skills?.join(', ') || 'various skills'}. 
          Make it attention-grabbing, include key skills, and keep it concise (one line, max 120 characters).`;
          aiContext.resumeSection = 'headline';
          break;
        case 'bullet':
          const companyInfo = context?.company ? ` at ${context.company}` : '';
          const locationInfo = context?.location ? ` in ${context.location}` : '';
          const dateInfo = context?.startDate || context?.endDate 
            ? ` (${context.startDate || ''}${context.endDate ? ` - ${context.endDate}` : ' - Present'})`
            : '';
          prompt = `Write 3-5 powerful, achievement-focused bullet points for a resume. 
          Job Title: ${context?.title || 'Position'}
          Company: ${context?.company || 'Company'}${locationInfo}${dateInfo}
          
          Requirements:
          - Generate exactly 3-5 bullet points
          - Each bullet should start with a strong action verb
          - Include specific metrics, numbers, and quantifiable results
          - Highlight impact, achievements, and responsibilities
          - Make each bullet point distinct and valuable
          - Keep each bullet to 1-2 sentences maximum
          
          Format: Return ONLY the bullet points, one per line, without numbering or bullets. Each line should be a complete, standalone bullet point.`;
          aiContext.resumeSection = 'experience_bullet';
          break;
        case 'project-description':
          prompt = `Write a compelling project description for a resume. 
          Project: ${context?.name || 'Project'}. 
          Technologies: ${context?.tech?.join(', ') || 'modern technologies'}. 
          Make it achievement-focused, include impact metrics, and highlight technical skills used. 
          Keep it to 2-3 sentences.`;
          aiContext.resumeSection = 'project_description';
          break;
        default:
          throw new Error('Unknown generation type');
      }

      const response = await aiService.current.sendMessage(prompt, aiContext, 'en');
      
      if (!response || !response.items || response.items.length === 0) {
        throw new Error('No response from AI');
      }

      let result = response.items.map(item => item.content).join('\n').trim();
      
      // Process bullet points: split into multiple bullets if type is 'bullet'
      if (type === 'bullet') {
        // Split by newlines and clean up each bullet point
        const bullets = result
          .split('\n')
          .map(line => line.trim())
          .filter(line => line.length > 0)
          .map(line => {
            // Remove leading numbers, dashes, or bullets if present
            return line.replace(/^[\d\-•*]\s*/, '').trim();
          })
          .filter(line => line.length > 0);
        
        // Return as array for bullet type, or join for other types
        result = bullets.length > 0 ? bullets : [result];
      }
      
      // Set success message based on type
      switch(type) {
        case 'summary':
          setEstelMessage(t('dashboard.resumeBuilder.aiSummarySuccess'));
          break;
        case 'headline':
          setEstelMessage(t('dashboard.resumeBuilder.aiHeadlineSuccess'));
          break;
        case 'bullet':
          setEstelMessage(t('dashboard.resumeBuilder.aiBulletSuccess'));
          break;
        case 'project-description':
          setEstelMessage(t('dashboard.resumeBuilder.aiProjectSuccess'));
          break;
      }
      
      setAiGenerating(false);
      return result;
    } catch (error: any) {
      console.error('AI generation error:', error);
      setEstelMessage(t('dashboard.resumeBuilder.aiError'));
      setAiGenerating(false);
      
      // Fallback to a basic template
      let fallback = '';
      switch(type) {
        case 'summary':
          fallback = `Results-driven ${context?.title || 'professional'} with ${context?.years || '5+'} years of experience in ${context?.industry || 'technology'}. Proven track record of delivering high-impact solutions.`;
          break;
        case 'headline':
          fallback = `${context?.title || 'Professional'} | ${context?.skills?.[0] || 'Expert'}`;
          break;
        case 'bullet':
          fallback = `Delivered ${context?.project || 'key project'} resulting in measurable improvements`;
          break;
        case 'project-description':
          fallback = `Developed ${context?.name || 'project'} using ${context?.tech?.join(', ') || 'modern technologies'}`;
          break;
      }
      return fallback;
    }
  };

  const addExperience = () => {
    const newExp: Experience = {
      id: Date.now().toString(),
      company: '',
      title: '',
      location: '',
      startDate: '',
      endDate: '',
      current: false,
      bullets: ['']
    };
    setResumeData({
      ...resumeData,
      experiences: [...resumeData.experiences, newExp]
    });
  };

  const updateExperience = (id: string, field: string, value: any) => {
    setResumeData({
      ...resumeData,
      experiences: resumeData.experiences.map(exp =>
        exp.id === id ? { ...exp, [field]: value } : exp
      )
    });
  };

  const removeExperience = (id: string) => {
    setResumeData({
      ...resumeData,
      experiences: resumeData.experiences.filter(exp => exp.id !== id)
    });
  };

  const addEducation = () => {
    const newEdu: Education = {
      id: Date.now().toString(),
      institution: '',
      degree: '',
      field: '',
      graduationYear: '',
      gpa: '',
      showGpa: false,
      honors: []
    };
    setResumeData({
      ...resumeData,
      education: [...resumeData.education, newEdu]
    });
  };

  const updateEducation = (id: string, field: string, value: any) => {
    setResumeData({
      ...resumeData,
      education: resumeData.education.map(edu =>
        edu.id === id ? { ...edu, [field]: value } : edu
      )
    });
  };

  const removeEducation = (id: string) => {
    setResumeData({
      ...resumeData,
      education: resumeData.education.filter(edu => edu.id !== id)
    });
  };

  const addProject = () => {
    const newProject: Project = {
      id: Date.now().toString(),
      name: '',
      description: '',
      technologies: [],
      link: '',
      date: ''
    };
    setResumeData({
      ...resumeData,
      projects: [...resumeData.projects, newProject]
    });
  };

  const updateProject = (id: string, field: string, value: any) => {
    setResumeData({
      ...resumeData,
      projects: resumeData.projects.map(proj =>
        proj.id === id ? { ...proj, [field]: value } : proj
      )
    });
  };

  const removeProject = (id: string) => {
    setResumeData({
      ...resumeData,
      projects: resumeData.projects.filter(proj => proj.id !== id)
    });
  };

  const addSkill = (type: 'technical' | 'soft', skill: string) => {
    if (!skill.trim()) return;
    
    if (type === 'technical') {
      setResumeData({
        ...resumeData,
        technicalSkills: [...resumeData.technicalSkills, skill]
      });
    } else {
      setResumeData({
        ...resumeData,
        softSkills: [...resumeData.softSkills, skill]
      });
    }
  };

  const removeSkill = (type: 'technical' | 'soft', index: number) => {
    if (type === 'technical') {
      setResumeData({
        ...resumeData,
        technicalSkills: resumeData.technicalSkills.filter((_, i) => i !== index)
      });
    } else {
      setResumeData({
        ...resumeData,
        softSkills: resumeData.softSkills.filter((_, i) => i !== index)
      });
    }
  };

  // Calculate ATS score based on resume data
  const calculateATSScore = () => {
    let score = 0;
    
    // Personal info (20 points)
    if (resumeData.personalInfo.fullName) score += 5;
    if (resumeData.personalInfo.email) score += 5;
    if (resumeData.personalInfo.phone) score += 5;
    if (resumeData.personalInfo.location) score += 5;
    
    // Summary (10 points)
    if (resumeData.summary && resumeData.summary.length >= 150) score += 10;
    
    // Experience (30 points)
    if (resumeData.experiences.length > 0) score += 10;
    if (resumeData.experiences.some(e => e.bullets.some(b => b.length > 50))) score += 10;
    if (resumeData.experiences.some(e => e.company && e.title)) score += 10;
    
    // Education (10 points)
    if (resumeData.education.length > 0) score += 10;
    
    // Skills (20 points)
    if (resumeData.technicalSkills.length >= 5) score += 10;
    if (resumeData.softSkills.length >= 3) score += 10;
    
    // Projects (10 points)
    if (resumeData.projects.length > 0) score += 10;
    
    return score;
  };

  // Helper function to render markdown-like text
  const renderMarkdownText = (text: string) => {
    if (!text) return null;
    
    // Split by lines and process
    const lines = text.split('\n');
    const elements: JSX.Element[] = [];
    let inCodeBlock = false;
    let codeBlockContent: string[] = [];
    let listItems: string[] = [];
    let currentListType: 'ul' | 'ol' | null = null;
    
    lines.forEach((line, index) => {
      const trimmed = line.trim();
      
      // Handle code blocks
      if (trimmed.startsWith('```')) {
        if (inCodeBlock) {
          // End code block
          elements.push(
            <pre key={`code-${index}`} className={`p-4 rounded-lg my-4 overflow-x-auto ${isDark ? 'bg-slate-800 text-gray-200' : 'bg-gray-100 text-gray-800'}`}>
              <code className="text-sm font-mono whitespace-pre-wrap">{codeBlockContent.join('\n')}</code>
            </pre>
          );
          codeBlockContent = [];
          inCodeBlock = false;
        } else {
          // Start code block
          inCodeBlock = true;
        }
        return;
      }
      
      if (inCodeBlock) {
        codeBlockContent.push(line);
        return;
      }
      
      // Handle headings
      if (trimmed.startsWith('### ')) {
        // Close any open list
        if (currentListType) {
          const ListTag = currentListType === 'ul' ? 'ul' : 'ol';
          elements.push(
            <ListTag key={`list-${index}`} className={`list-disc list-inside space-y-1 mb-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {listItems.map((item, i) => (
                <li key={i} className="text-sm">{item}</li>
              ))}
            </ListTag>
          );
          listItems = [];
          currentListType = null;
        }
        elements.push(
          <h3 key={`h3-${index}`} className={`text-xl font-semibold mt-6 mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {trimmed.replace(/^###\s+/, '')}
          </h3>
        );
        return;
      }
      
      if (trimmed.startsWith('#### ')) {
        // Close any open list
        if (currentListType) {
          const ListTag = currentListType === 'ul' ? 'ul' : 'ol';
          elements.push(
            <ListTag key={`list-${index}`} className={`list-disc list-inside space-y-1 mb-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {listItems.map((item, i) => (
                <li key={i} className="text-sm">{item}</li>
              ))}
            </ListTag>
          );
          listItems = [];
          currentListType = null;
        }
        elements.push(
          <h4 key={`h4-${index}`} className={`text-lg font-semibold mt-4 mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {trimmed.replace(/^####\s+/, '')}
          </h4>
        );
        return;
      }
      
      if (trimmed.startsWith('## ')) {
        // Close any open list
        if (currentListType) {
          const ListTag = currentListType === 'ul' ? 'ul' : 'ol';
          elements.push(
            <ListTag key={`list-${index}`} className={`list-disc list-inside space-y-1 mb-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {listItems.map((item, i) => (
                <li key={i} className="text-sm">{item}</li>
              ))}
            </ListTag>
          );
          listItems = [];
          currentListType = null;
        }
        elements.push(
          <h2 key={`h2-${index}`} className={`text-2xl font-bold mt-8 mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {trimmed.replace(/^##\s+/, '')}
          </h2>
        );
        return;
      }
      
      // Handle list items
      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        const listItem = trimmed.replace(/^[-*]\s+/, '');
        // Check if bold
        const boldMatch = listItem.match(/\*\*(.*?)\*\*/);
        if (boldMatch) {
          const beforeBold = listItem.substring(0, listItem.indexOf('**'));
          const boldText = boldMatch[1];
          const afterBold = listItem.substring(listItem.indexOf('**') + boldText.length + 4);
          listItems.push(
            <span key={`li-${index}`}>
              {beforeBold}<strong className={isDark ? 'text-white' : 'text-gray-900'}>{boldText}</strong>{afterBold}
            </span>
          );
        } else {
          listItems.push(listItem);
        }
        if (!currentListType) currentListType = 'ul';
        return;
      }
      
      if (trimmed.match(/^\d+\.\s/)) {
        const listItem = trimmed.replace(/^\d+\.\s+/, '');
        listItems.push(listItem);
        if (!currentListType) currentListType = 'ol';
        return;
      }
      
      // Close list if we hit a non-list line
      if (currentListType && trimmed) {
        const ListTag = currentListType === 'ul' ? 'ul' : 'ol';
        elements.push(
          <ListTag key={`list-${index}`} className={`list-disc list-inside space-y-1 mb-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            {listItems.map((item, i) => (
              <li key={i} className="text-sm">{typeof item === 'string' ? item : item}</li>
            ))}
          </ListTag>
        );
        listItems = [];
        currentListType = null;
      }
      
      // Handle regular paragraphs
      if (trimmed) {
        // Check for bold text
        const parts = trimmed.split(/(\*\*.*?\*\*)/g);
        elements.push(
          <p key={`p-${index}`} className={`mb-3 text-sm leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            {parts.map((part, i) => {
              if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={i} className={isDark ? 'text-white' : 'text-gray-900'}>{part.slice(2, -2)}</strong>;
              }
              return <span key={i}>{part}</span>;
            })}
          </p>
        );
      } else if (!trimmed && elements.length > 0) {
        // Empty line - add spacing
        elements.push(<div key={`spacer-${index}`} className="h-2" />);
      }
    });
    
    // Close any remaining list
    if (currentListType && listItems.length > 0) {
      const ListTag = currentListType === 'ul' ? 'ul' : 'ol';
      elements.push(
        <ListTag key="list-final" className={`list-disc list-inside space-y-1 mb-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
          {listItems.map((item, i) => (
            <li key={i} className="text-sm">{typeof item === 'string' ? item : item}</li>
          ))}
        </ListTag>
      );
    }
    
    return <div>{elements}</div>;
  };

  // Generate critique scores
  const generateCritique = async () => {
    setAiGenerating(true);
    setEstelMessage(t('dashboard.resumeBuilder.analyzingResume'));
    setDetailedFeedback(''); // Clear previous feedback
    
    try {
      // Use AI service to get resume insights
      const insights = await aiService.current.getResumeInsights(resumeData, 'en');
      
      console.log('AI Insights received:', insights);
      console.log('Detailed Feedback:', insights.detailedFeedback);
      
      // Calculate ATS score
      const atsScore = calculateATSScore();
      
      // Use AI insights for critique scores
      const overall = insights.score || atsScore;
      
      setCritiqueData({
        overall: overall,
        content: Math.min(100, Math.max(60, overall + (insights.improvements?.length || 0) * -2)),
        formatting: Math.min(100, Math.max(70, overall + 5)),
        impact: Math.min(100, Math.max(65, overall - (insights.improvements?.length || 0) * 3)),
        length: Math.min(100, Math.max(75, overall + 3))
      });
      
      setAtsScore(atsScore);
      
      // Store detailed feedback text
      if (insights.detailedFeedback) {
        setDetailedFeedback(insights.detailedFeedback);
        setEstelMessage(t('dashboard.resumeBuilder.analysisComplete'));
      } else {
        console.warn('No detailed feedback in insights:', insights);
        setEstelMessage(t('dashboard.resumeBuilder.analysisCompleteBasic'));
      }
      
    } catch (error: any) {
      console.error('AI critique error:', error);
      setEstelMessage(t('dashboard.resumeBuilder.analysisError'));
      
      // Fallback to basic calculation
      const overall = calculateATSScore();
      setCritiqueData({
        overall: overall,
        content: Math.min(100, overall + Math.random() * 10),
        formatting: Math.min(100, overall + Math.random() * 15),
        impact: Math.min(100, overall - Math.random() * 10),
        length: Math.min(100, overall + Math.random() * 5)
      });
      setAtsScore(overall);
      setDetailedFeedback('');
    } finally {
      setAiGenerating(false);
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-500 ${
      isDark ? 'bg-slate-900' : 'bg-gradient-to-br from-gray-50 via-purple-50/30 to-gray-50'
    }`}>
      {/* Header */}
      <header className={`border-b transition-colors duration-500 sticky top-0 z-50 ${
        isDark 
          ? 'border-white/10 bg-slate-900/80 backdrop-blur-xl'
          : 'border-gray-200 bg-white/80 backdrop-blur-xl'
      }`}>
        <div className="px-8 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <button
                onClick={onBack}
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
              >
                <ChevronLeft className="size-4" />
                <span className="text-sm">{t('dashboard.resumeBuilder.backToDashboard')}</span>
              </button>
              <div className={`h-6 w-px ${isDark ? 'bg-white/10' : 'bg-gray-200'}`}></div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center">
                  <FileText className="size-5 text-white" />
                </div>
                <div>
                  <h1 className={`text-xl ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {t('dashboard.resumeBuilder.title')}
                  </h1>
                  <p className="text-sm text-gray-400 flex items-center gap-2">
                    {resumeSaving ? (
                      <>
                        <Loader2 className="size-4 animate-spin" />
                        <span>{t('dashboard.resumeBuilder.saving')}</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="size-4 text-green-500" />
                        <span>
                          {t('dashboard.resumeBuilder.lastSaved', { time: formatRelativeTime(lastSaved) })}
                        </span>
                      </>
                    )}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {currentStep !== 'welcome' && (
                <>
                  <Button
                    onClick={() => setShowPreview(!showPreview)}
                    className="bg-white/10 hover:bg-white/20 text-white border-0"
                  >
                    <Eye className="size-4 mr-2" />
                    {showPreview ? t('dashboard.resumeBuilder.hidePreview') : t('dashboard.resumeBuilder.showPreview')}
                  </Button>
                  <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0">
                    <Save className="size-4 mr-2" />
                    {t('dashboard.resumeBuilder.saveDraft')}
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          {currentStep !== 'welcome' && (
            <div className="mb-2">
              <div className={`h-2 rounded-full overflow-hidden ${isDark ? 'bg-white/10' : 'bg-gray-200'}`}>
                <div 
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <div className="flex justify-between mt-2">
                {steps.filter(s => s.id !== 'welcome').map((step, index) => (
                  <button
                    key={step.id}
                    onClick={() => setCurrentStep(step.id as Step)}
                    className={`flex flex-col items-center gap-1 transition-all ${
                      currentStep === step.id
                        ? 'text-purple-500 scale-110'
                        : steps.findIndex(s => s.id === currentStep) > index
                          ? 'text-teal-500'
                          : 'text-gray-400'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs ${
                      currentStep === step.id
                        ? 'bg-purple-500 text-white'
                        : steps.findIndex(s => s.id === currentStep) > index
                          ? 'bg-teal-500 text-white'
                          : isDark ? 'bg-white/10' : 'bg-gray-200'
                    }`}>
                      {steps.findIndex(s => s.id === currentStep) > index ? (
                        <Check className="size-4" />
                      ) : (
                        <step.icon className="size-4" />
                      )}
                    </div>
                    <span className="text-xs hidden lg:block">{step.title}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex">
        {/* Left Panel - Form/Content */}
        <div className={`${showPreview && currentStep !== 'welcome' && !previewMinimized ? 'flex-1' : 'w-full'} ${showPreview && currentStep !== 'welcome' && !previewMinimized ? (currentStep === 'critique' ? 'max-w-4xl' : '') : 'max-w-6xl mx-auto'} p-8 transition-all duration-300`}>
          {/* Estel Coach */}
          {currentStep !== 'welcome' && (
            <div className={`mb-6 p-4 rounded-xl border-2 border-purple-500/30 ${
              isDark ? 'bg-purple-500/10' : 'bg-purple-50'
            }`}>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center flex-shrink-0 animate-bounce">
                  <Sparkles className="size-6 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {t('dashboard.resumeBuilder.estelTip')}
                    </span>
                    {aiGenerating && (
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                      </div>
                    )}
                  </div>
                  <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {estelMessage}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* STEP: WELCOME */}
          {currentStep === 'welcome' && (
            <div className="max-w-4xl mx-auto text-center py-12">
              <div className="w-64 h-64 mx-auto mb-8 relative">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full blur-3xl opacity-20 animate-pulse"></div>
                <img 
                  src="/Resume Builder.png" 
                  alt="Estel Resume Builder"
                  className="relative z-10 w-full h-full object-contain animate-float"
                />
              </div>

              <h1 className={`text-5xl mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {t('dashboard.resumeBuilder.welcomeTitle')} <span className="bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">{t('dashboard.resumeBuilder.minutes')}</span>
              </h1>
              <p className={`text-xl mb-12 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {t('dashboard.resumeBuilder.welcomeDescription')}
              </p>

              {/* Load Existing Resume - history panel (backend-aligned) */}
              {resumes.length > 0 && (
                <div className={`mb-8 p-6 rounded-2xl ${isDark ? 'bg-white/5 border border-white/10' : 'bg-white border border-gray-200'}`}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {t('dashboard.resumeBuilder.continueWorkingOn')}
                    </h3>
                    <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {resumes.length} {resumes.length === 1 ? t('dashboard.resumeBuilder.resume') : t('dashboard.resumeBuilder.resumes')}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-left">
                    {resumes.map((resume) => {
                      const savedSections = (resume as any).sections || {};
                      const savedLastStep = savedSections.lastStep || 'template';
                      const validStep = steps.find(s => s.id === savedLastStep) ? savedLastStep : 'template';

                      return (
                        <button
                          key={resume.id}
                          onClick={() => {
                            try {
                              // sections already contains full resume JSON from backend
                              const { lastStep, ...resumeContent } = savedSections;
                              setResumeData(resumeContent);
                              setCurrentResumeId(resume.id);
                              setCurrentStep(validStep as Step);
                              
                              const stepTitle = steps.find(s => s.id === validStep)?.title || t('dashboard.resumeBuilder.steps.template');
                              toast.success(t('dashboard.resumeBuilder.resumeLoaded', { step: stepTitle }));
                            } catch (error) {
                              console.error('Error loading resume from sections:', error);
                              toast.error(t('dashboard.resumeBuilder.loadFailed'));
                            }
                          }}
                          className={`group p-4 rounded-xl border-2 transition-all hover:scale-105 hover:shadow-lg ${
                            isDark 
                              ? 'bg-white/5 border-white/10 hover:border-purple-500/50' 
                              : 'bg-gray-50 border-gray-200 hover:border-purple-300 hover:shadow-md'
                          }`}
                        >
                          {/* Title */}
                          <p className={`font-semibold truncate mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {resume.name || t('dashboard.resumeBuilder.untitledResume')}
                          </p>

                          {/* Last updated & step */}
                          <div className="flex items-center justify-between text-xs">
                            <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                              {resume.updated_at ? new Date(resume.updated_at).toLocaleDateString('en-US', { 
                                month: 'short', 
                                day: 'numeric',
                                year: 'numeric'
                              }) : '—'}
                            </span>
                            {savedLastStep && (
                              <span className={`px-2 py-0.5 rounded ${
                                isDark ? 'bg-purple-500/20 text-purple-300' : 'bg-purple-100 text-purple-700'
                              }`}>
                                {steps.find(s => s.id === savedLastStep)?.title || t('dashboard.resumeBuilder.steps.template')}
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-3 gap-6">
                <button
                  onClick={() => {
                    // Start fresh - clear any existing resume ID
                    setCurrentResumeId(undefined);
                    // Reset to default resume data
                    setResumeData({
                      templateId: 'modern-pro',
                      personalInfo: {
                        fullName: '',
                        email: '',
                        phone: '',
                        location: '',
                        linkedin: '',
                        portfolio: '',
                        github: '',
                        headline: ''
                      },
                      summary: '',
                      experiences: [],
                      education: [],
                      technicalSkills: [],
                      softSkills: [],
                      projects: [],
                      certifications: [],
                      languages: [],
                      awards: [],
                      customSections: [],
                      layout: {
                        accentColor: '#14b8a6',
                        fontFamily: 'Inter',
                        spacing: 'balanced',
                        headerStyle: 'centered',
                        columns: 1,
                        fontSize: 'medium',
                        sectionVisibility: {
                          summary: true,
                          experience: true,
                          education: true,
                          skills: true,
                          projects: true,
                          certifications: true,
                          languages: true,
                          awards: true,
                        },
                        sectionOrder: ['summary', 'experience', 'education', 'skills', 'projects', 'certifications', 'languages', 'awards']
                      }
                    });
                    setCurrentStep('template');
                    setEstelMessage(t('dashboard.resumeBuilder.templateChoiceMessage'));
                  }}
                  className={`group p-8 rounded-2xl border-2 transition-all hover:scale-105 hover:shadow-2xl ${
                    isDark
                      ? 'border-white/10 bg-white/5 hover:border-purple-500/50'
                      : 'border-gray-200 bg-white hover:border-purple-300 hover:shadow-xl'
                  }`}
                >
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center transform group-hover:scale-110 transition-transform">
                    <FileText className="size-8 text-white" />
                  </div>
                  <h3 className={`text-xl mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {t('dashboard.resumeBuilder.startFromScratch')}
                  </h3>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {t('dashboard.resumeBuilder.startFromScratchDescription')}
                  </p>
                </button>

                <button
                  onClick={() => {
                    toast.info(t('dashboard.resumeBuilder.uploadComingSoon'));
                    setEstelMessage(t('dashboard.resumeBuilder.uploadComingSoonMessage'));
                  }}
                  className={`group p-8 rounded-2xl border-2 transition-all hover:scale-105 hover:shadow-2xl ${
                    isDark
                      ? 'border-white/10 bg-white/5 hover:border-purple-500/50'
                      : 'border-gray-200 bg-white hover:border-purple-300 hover:shadow-xl'
                  }`}
                >
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center transform group-hover:scale-110 transition-transform">
                    <Upload className="size-8 text-white" />
                  </div>
                  <h3 className={`text-xl mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {t('dashboard.resumeBuilder.importExisting')}
                  </h3>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {t('dashboard.resumeBuilder.importExistingDescription')}
                  </p>
                </button>

                <button
                  onClick={() => {
                    toast.info(t('dashboard.resumeBuilder.aiQuickBuildComingSoon'));
                    setEstelMessage(t('dashboard.resumeBuilder.aiQuickBuildComingSoonMessage'));
                  }}
                  className={`group p-8 rounded-2xl border-2 transition-all hover:scale-105 hover:shadow-2xl ${
                    isDark
                      ? 'border-white/10 bg-white/5 hover:border-purple-500/50'
                      : 'border-gray-200 bg-white hover:border-purple-300 hover:shadow-xl'
                  }`}
                >
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center transform group-hover:scale-110 transition-transform">
                    <Sparkles className="size-8 text-white" />
                  </div>
                  <h3 className={`text-xl mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {t('dashboard.resumeBuilder.aiQuickBuild')}
                  </h3>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {t('dashboard.resumeBuilder.aiQuickBuildDescription')}
                  </p>
                </button>
              </div>
            </div>
          )}

          {/* STEP: TEMPLATE SELECTION */}
          {currentStep === 'template' && (
            <div>
              <h2 className={`text-3xl mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {t('dashboard.resumeBuilder.chooseTemplate')}
              </h2>
              <p className={`text-lg mb-8 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {t('dashboard.resumeBuilder.selectTemplateDescription')}
              </p>

              {/* Filter Tags */}
              <div className="flex flex-wrap gap-2 mb-6">
                {[
                  { id: 'all', label: t('dashboard.resumeBuilder.templateCategories.all') },
                  { id: 'modern', label: t('dashboard.resumeBuilder.templateCategories.modern') },
                  { id: 'classic', label: t('dashboard.resumeBuilder.templateCategories.classic') },
                  { id: 'creative', label: t('dashboard.resumeBuilder.templateCategories.creative') },
                  { id: 'technical', label: t('dashboard.resumeBuilder.templateCategories.technical') },
                  { id: 'executive', label: t('dashboard.resumeBuilder.templateCategories.executive') }
                ].map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-4 py-2 rounded-lg text-sm transition-all ${
                      selectedCategory === cat.id
                        ? 'bg-purple-500 text-white'
                        : isDark
                          ? 'bg-white/5 text-gray-300 hover:bg-white/10'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Templates Grid */}
              <div className="grid grid-cols-2 gap-6">
                {templates
                  .filter(template => 
                    selectedCategory === 'all' || template.category === selectedCategory
                  )
                  .map((template) => (
                  <button
                    key={template.id}
                    onClick={() => {
                      setResumeData({ ...resumeData, templateId: template.id });
                      setEstelMessage(t('dashboard.resumeBuilder.templateSelectedMessage', {
                        name: template.name,
                        description: template.description.toLowerCase(),
                        score: template.atsScore
                      }));
                    }}
                    className={`group relative p-6 rounded-2xl border-2 transition-all hover:scale-105 text-left ${
                      resumeData.templateId === template.id
                        ? 'border-purple-500 bg-purple-500/10'
                        : isDark
                          ? 'border-white/10 bg-white/5 hover:border-purple-500/50'
                          : 'border-gray-200 bg-white hover:border-purple-300 hover:shadow-xl'
                    }`}
                  >
                    {/* Template Preview */}
                    <div className={`h-64 rounded-xl mb-4 flex items-center justify-center ${
                      isDark ? 'bg-white/5' : 'bg-gray-100'
                    }`}>
                      <FileText className="size-20 text-gray-400" />
                    </div>

                    {/* Template Info */}
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className={`text-lg mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {template.name}
                        </h3>
                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          {template.description}
                        </p>
                      </div>
                      {resumeData.templateId === template.id && (
                        <div className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center">
                          <Check className="size-4 text-white" />
                        </div>
                      )}
                    </div>

                    {/* ATS Score */}
                    <div className="flex items-center gap-2">
                      <div className={`flex-1 h-1.5 rounded-full ${isDark ? 'bg-white/10' : 'bg-gray-200'}`}>
                        <div 
                          className="h-full bg-gradient-to-r from-green-500 to-teal-500 rounded-full"
                          style={{ width: `${template.atsScore}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-green-500">{template.atsScore}% {t('dashboard.resumeBuilder.ats')}</span>
                    </div>

                    {/* Popular Badge */}
                    {['modern-pro', 'classic', 'technical'].includes(template.id) && (
                      <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-yellow-500 text-white text-xs">
                        {t('dashboard.resumeBuilder.popular')}
                      </div>
                    )}
                  </button>
                ))}
              </div>

              {/* Navigation */}
              <div className="flex justify-between mt-8">
                <Button
                  onClick={prevStep}
                  className="bg-white/10 hover:bg-white/20 text-white border-0"
                >
                  <ChevronLeft className="size-4 mr-2" />
                  {t('dashboard.resumeBuilder.buttons.previous')}
                </Button>
                <Button
                  onClick={nextStep}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0"
                >
                  {t('dashboard.resumeBuilder.continue')}
                  <ChevronRight className="size-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* STEP: PERSONAL INFO */}
          {currentStep === 'personal' && (
            <div>
              <h2 className={`text-3xl mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {t('dashboard.resumeBuilder.personalInfo.title')}
              </h2>
              <p className={`text-lg mb-8 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {t('dashboard.resumeBuilder.tellUsAboutYourself')}
              </p>

              <div className="space-y-6">
                {/* Full Name */}
                <div>
                  <label className={`block text-sm mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('dashboard.resumeBuilder.personalInfo.fullName')} *
                  </label>
                  <input
                    type="text"
                    value={resumeData.personalInfo.fullName}
                    onChange={(e) => setResumeData({
                      ...resumeData,
                      personalInfo: { ...resumeData.personalInfo, fullName: e.target.value }
                    })}
                    placeholder={t('dashboard.resumeBuilder.personalInfo.fullNamePlaceholder')}
                    className={`w-full px-4 py-3 rounded-xl border transition-colors ${
                      isDark
                        ? 'bg-white/5 border-white/10 text-white placeholder-gray-500'
                        : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'
                    }`}
                  />
                </div>

                {/* Professional Headline */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('dashboard.resumeBuilder.personalInfo.headline')} *
                    </label>
                    <button
                      onClick={async () => {
                        const result = await generateWithAI('headline', {
                          title: 'Software Engineer',
                          skills: ['React', 'Node.js'],
                          passion: 'Building Scalable Systems'
                        });
                        setResumeData({
                          ...resumeData,
                          personalInfo: { ...resumeData.personalInfo, headline: result }
                        });
                      }}
                      disabled={aiGenerating}
                      className="text-sm text-purple-500 hover:text-purple-600 flex items-center gap-1"
                    >
                      <Sparkles className="size-4" />
                      {t('dashboard.resumeBuilder.aiGenerate')}
                    </button>
                  </div>
                  <input
                    type="text"
                    value={resumeData.personalInfo.headline}
                    onChange={(e) => setResumeData({
                      ...resumeData,
                      personalInfo: { ...resumeData.personalInfo, headline: e.target.value }
                    })}
                    placeholder={t('dashboard.resumeBuilder.personalInfo.headlinePlaceholder')}
                    className={`w-full px-4 py-3 rounded-xl border transition-colors ${
                      isDark
                        ? 'bg-white/5 border-white/10 text-white placeholder-gray-500'
                        : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'
                    }`}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {resumeData.personalInfo.headline.length}/100 {t('dashboard.resumeBuilder.characters')}
                  </p>
                </div>

                {/* Email & Phone */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      <AtSign className="size-4 inline mr-1" />
                      {t('dashboard.resumeBuilder.personalInfo.email')} *
                    </label>
                    <input
                      type="email"
                      value={resumeData.personalInfo.email}
                      onChange={(e) => setResumeData({
                        ...resumeData,
                        personalInfo: { ...resumeData.personalInfo, email: e.target.value }
                      })}
                      placeholder={t('dashboard.resumeBuilder.personalInfo.emailPlaceholder')}
                      className={`w-full px-4 py-3 rounded-xl border transition-colors ${
                        isDark
                          ? 'bg-white/5 border-white/10 text-white placeholder-gray-500'
                          : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'
                      }`}
                    />
                    {resumeData.personalInfo.email && !resumeData.personalInfo.email.includes('@') && (
                      <p className="text-xs text-red-500 mt-1">{t('dashboard.resumeBuilder.invalidEmail')}</p>
                    )}
                  </div>

                  <div>
                    <label className={`block text-sm mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      <Phone className="size-4 inline mr-1" />
                      {t('dashboard.resumeBuilder.personalInfo.phone')} *
                    </label>
                    <input
                      type="tel"
                      value={resumeData.personalInfo.phone}
                      onChange={(e) => setResumeData({
                        ...resumeData,
                        personalInfo: { ...resumeData.personalInfo, phone: e.target.value }
                      })}
                      placeholder={t('dashboard.resumeBuilder.personalInfo.phonePlaceholder')}
                      className={`w-full px-4 py-3 rounded-xl border transition-colors ${
                        isDark
                          ? 'bg-white/5 border-white/10 text-white placeholder-gray-500'
                          : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'
                      }`}
                    />
                  </div>
                </div>

                {/* Location */}
                <div>
                    <label className={`block text-sm mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      <MapPin className="size-4 inline mr-1" />
                      {t('dashboard.resumeBuilder.personalInfo.location')} *
                    </label>
                    <input
                      type="text"
                      value={resumeData.personalInfo.location}
                      onChange={(e) => setResumeData({
                        ...resumeData,
                        personalInfo: { ...resumeData.personalInfo, location: e.target.value }
                      })}
                      placeholder={t('dashboard.resumeBuilder.personalInfo.locationPlaceholder')}
                    className={`w-full px-4 py-3 rounded-xl border transition-colors ${
                      isDark
                        ? 'bg-white/5 border-white/10 text-white placeholder-gray-500'
                        : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'
                    }`}
                  />
                </div>

                {/* Social Links */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className={`block text-sm mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      <Linkedin className="size-4 inline mr-1" />
                      {t('dashboard.resumeBuilder.personalInfo.linkedin')}
                    </label>
                    <input
                      type="url"
                      value={resumeData.personalInfo.linkedin}
                      onChange={(e) => setResumeData({
                        ...resumeData,
                        personalInfo: { ...resumeData.personalInfo, linkedin: e.target.value }
                      })}
                      placeholder={t('dashboard.resumeBuilder.personalInfo.linkedinPlaceholder')}
                      className={`w-full px-4 py-3 rounded-xl border transition-colors ${
                        isDark
                          ? 'bg-white/5 border-white/10 text-white placeholder-gray-500'
                          : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'
                      }`}
                    />
                  </div>

                  <div>
                    <label className={`block text-sm mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      <Github className="size-4 inline mr-1" />
                      {t('dashboard.resumeBuilder.personalInfo.github')}
                    </label>
                    <input
                      type="url"
                      value={resumeData.personalInfo.github}
                      onChange={(e) => setResumeData({
                        ...resumeData,
                        personalInfo: { ...resumeData.personalInfo, github: e.target.value }
                      })}
                      placeholder={t('dashboard.resumeBuilder.personalInfo.githubPlaceholder')}
                      className={`w-full px-4 py-3 rounded-xl border transition-colors ${
                        isDark
                          ? 'bg-white/5 border-white/10 text-white placeholder-gray-500'
                          : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'
                      }`}
                    />
                  </div>

                  <div>
                    <label className={`block text-sm mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      <Globe className="size-4 inline mr-1" />
                      {t('dashboard.resumeBuilder.personalInfo.portfolio')}
                    </label>
                    <input
                      type="url"
                      value={resumeData.personalInfo.portfolio}
                      onChange={(e) => setResumeData({
                        ...resumeData,
                        personalInfo: { ...resumeData.personalInfo, portfolio: e.target.value }
                      })}
                      placeholder={t('dashboard.resumeBuilder.personalInfo.portfolioPlaceholder')}
                      className={`w-full px-4 py-3 rounded-xl border transition-colors ${
                        isDark
                          ? 'bg-white/5 border-white/10 text-white placeholder-gray-500'
                          : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'
                      }`}
                    />
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <div className="flex justify-between mt-8">
                <Button
                  onClick={prevStep}
                  className="bg-white/10 hover:bg-white/20 text-white border-0"
                >
                  <ChevronLeft className="size-4 mr-2" />
                  {t('dashboard.resumeBuilder.buttons.previous')}
                </Button>
                <Button
                  onClick={nextStep}
                  disabled={!resumeData.personalInfo.fullName || !resumeData.personalInfo.email}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0 disabled:opacity-50"
                >
                  {t('dashboard.resumeBuilder.continue')}
                  <ChevronRight className="size-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* STEP: PROFESSIONAL SUMMARY */}
          {currentStep === 'summary' && (
            <div>
              <h2 className={`text-3xl mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {t('dashboard.resumeBuilder.summary.title')}
              </h2>
              <p className={`text-lg mb-8 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {t('dashboard.resumeBuilder.summary.description')}
              </p>

              {/* AI Generator Options */}
              <div className={`p-6 rounded-xl mb-6 ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
                <h3 className={`text-lg mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {t('dashboard.resumeBuilder.aiSummaryGenerator')}
                </h3>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className={`block text-sm mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {t('dashboard.resumeBuilder.targetRole')}
                    </label>
                    <input
                      type="text"
                      value={targetRole}
                      onChange={(e) => setTargetRole(e.target.value)}
                      placeholder={t('dashboard.resumeBuilder.targetRolePlaceholder')}
                      className={`w-full px-3 py-2 rounded-lg text-sm ${
                        isDark ? 'bg-white/5 border border-white/10 text-white' : 'bg-white border border-gray-200 text-gray-900'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {t('dashboard.resumeBuilder.yearsOfExperience')}
                    </label>
                    <input
                      type="text"
                      value={yearsOfExperience}
                      onChange={(e) => setYearsOfExperience(e.target.value)}
                      placeholder={t('dashboard.resumeBuilder.yearsOfExperiencePlaceholder')}
                      className={`w-full px-3 py-2 rounded-lg text-sm ${
                        isDark ? 'bg-white/5 border border-white/10 text-white' : 'bg-white border border-gray-200 text-gray-900'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {t('dashboard.resumeBuilder.industry')}
                    </label>
                    <input
                      type="text"
                      value={industry}
                      onChange={(e) => setIndustry(e.target.value)}
                      placeholder={t('dashboard.resumeBuilder.industryPlaceholder')}
                      className={`w-full px-3 py-2 rounded-lg text-sm ${
                        isDark ? 'bg-white/5 border border-white/10 text-white' : 'bg-white border border-gray-200 text-gray-900'
                      }`}
                    />
                  </div>
                </div>
                <Button
                  onClick={async () => {
                    const result = await generateWithAI('summary', {
                      title: targetRole || 'Software Engineer',
                      years: yearsOfExperience || '5+',
                      industry: industry || 'Technology'
                    });
                    setResumeData({ ...resumeData, summary: result });
                  }}
                  disabled={aiGenerating}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0"
                >
                  <Wand2 className="size-4 mr-2" />
                  {t('dashboard.resumeBuilder.generateSummaryWithAI')}
                </Button>
              </div>

              {/* Summary Textarea */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('dashboard.resumeBuilder.yourProfessionalSummary')}
                  </label>
                  <span className={`text-xs ${
                    resumeData.summary.length >= 150 && resumeData.summary.length <= 300
                      ? 'text-green-500'
                      : 'text-gray-500'
                  }`}>
                    {resumeData.summary.length}/300 {resumeData.summary.length >= 150 && resumeData.summary.length <= 300 ? t('dashboard.resumeBuilder.optimal') : ''}
                  </span>
                </div>
                <textarea
                  value={resumeData.summary}
                  onChange={(e) => setResumeData({ ...resumeData, summary: e.target.value })}
                  placeholder={t('dashboard.resumeBuilder.summaryPlaceholder')}
                  rows={6}
                  className={`w-full px-4 py-3 rounded-xl border transition-colors resize-none ${
                    isDark
                      ? 'bg-white/5 border-white/10 text-white placeholder-gray-500'
                      : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'
                  }`}
                />
              </div>

              {/* Tone Selector */}
              <div className="mt-4">
                <label className={`block text-sm mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('dashboard.resumeBuilder.tone')}
                </label>
                <div className="flex gap-2">
                  {[t('dashboard.resumeBuilder.professional'), t('dashboard.resumeBuilder.creative'), t('dashboard.resumeBuilder.technical')].map(tone => (
                    <button
                      key={tone}
                      className={`px-4 py-2 rounded-lg text-sm transition-all ${
                        isDark
                          ? 'bg-white/5 hover:bg-white/10 text-gray-300'
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                      }`}
                    >
                      {tone}
                    </button>
                  ))}
                </div>
              </div>

              {/* Navigation */}
              <div className="flex justify-between mt-8">
                <Button
                  onClick={prevStep}
                  className="bg-white/10 hover:bg-white/20 text-white border-0"
                >
                  <ChevronLeft className="size-4 mr-2" />
                  {t('dashboard.resumeBuilder.buttons.previous')}
                </Button>
                <Button
                  onClick={nextStep}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0"
                >
                  {t('dashboard.resumeBuilder.continue')}
                  <ChevronRight className="size-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* STEP: EXPERIENCE - Now with visible fields! */}
          {currentStep === 'experience' && (
            <div>
              <h2 className={`text-3xl mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {t('dashboard.resumeBuilder.workExperience')}
              </h2>
              <p className={`text-lg mb-8 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {t('dashboard.resumeBuilder.addExperienceDescription')}
              </p>

              {/* Show empty state if no experiences */}
              {resumeData.experiences.length === 0 && (
                <div className={`p-12 rounded-xl text-center mb-6 ${isDark ? 'bg-white/5' : 'bg-gradient-to-br from-purple-50 to-pink-50'}`}>
                  <Briefcase className={`size-16 mx-auto mb-4 ${isDark ? 'text-gray-400' : 'text-gray-400'}`} />
                  <h3 className={`text-xl mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {t('dashboard.resumeBuilder.noExperienceAdded')}
                  </h3>
                  <p className={`mb-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {t('dashboard.resumeBuilder.addFirstExperienceDescription')}
                  </p>
                  <Button
                    onClick={() => {
                      addExperience();
                      setEstelMessage(t('dashboard.resumeBuilder.addExperienceMessage'));
                    }}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0"
                  >
                    <Plus className="size-4 mr-2" />
                    {t('dashboard.resumeBuilder.addFirstExperience')}
                  </Button>
                </div>
              )}

              {/* Experience Entries */}
              <div className="space-y-6 mb-6">
                {resumeData.experiences.map((exp, index) => (
                  <div
                    key={exp.id}
                    className={`p-6 rounded-xl border-2 ${
                      isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <GripVertical className="size-5 text-gray-400 cursor-move" />
                        <h3 className={`text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {t('dashboard.resumeBuilder.experienceNumber', { n: index + 1 })}
                        </h3>
                      </div>
                      {resumeData.experiences.length > 1 && (
                        <button
                          onClick={() => removeExperience(exp.id)}
                          className="text-red-500 hover:text-red-600"
                        >
                          <Trash2 className="size-5" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className={`block text-sm mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          {t('dashboard.resumeBuilder.company')} *
                        </label>
                        <input
                          type="text"
                          value={exp.company}
                          onChange={(e) => updateExperience(exp.id, 'company', e.target.value)}
                          placeholder={t('dashboard.resumeBuilder.companyPlaceholder')}
                          className={`w-full px-3 py-2 rounded-lg ${
                            isDark ? 'bg-white/5 border border-white/10 text-white placeholder-gray-500' : 'bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400'
                          }`}
                        />
                      </div>
                      <div>
                        <label className={`block text-sm mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          {t('dashboard.resumeBuilder.jobTitle')} *
                        </label>
                        <input
                          type="text"
                          value={exp.title}
                          onChange={(e) => updateExperience(exp.id, 'title', e.target.value)}
                          placeholder={t('dashboard.resumeBuilder.jobTitlePlaceholder')}
                          className={`w-full px-3 py-2 rounded-lg ${
                            isDark ? 'bg-white/5 border border-white/10 text-white placeholder-gray-500' : 'bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400'
                          }`}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div>
                        <label className={`block text-sm mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          {t('dashboard.resumeBuilder.location')}
                        </label>
                        <input
                          type="text"
                          value={exp.location}
                          onChange={(e) => updateExperience(exp.id, 'location', e.target.value)}
                          placeholder={t('dashboard.resumeBuilder.locationPlaceholder')}
                          className={`w-full px-3 py-2 rounded-lg ${
                            isDark ? 'bg-white/5 border border-white/10 text-white placeholder-gray-500' : 'bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400'
                          }`}
                        />
                      </div>
                      <div>
                        <label className={`block text-sm mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          {t('dashboard.resumeBuilder.startDate')}
                        </label>
                        <input
                          type="month"
                          value={exp.startDate}
                          onChange={(e) => updateExperience(exp.id, 'startDate', e.target.value)}
                          className={`w-full px-3 py-2 rounded-lg ${
                            isDark ? 'bg-white/5 border border-white/10 text-white' : 'bg-gray-50 border border-gray-200 text-gray-900'
                          }`}
                        />
                      </div>
                      <div>
                        <label className={`block text-sm mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          {t('dashboard.resumeBuilder.endDate')}
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="month"
                            value={exp.endDate}
                            onChange={(e) => updateExperience(exp.id, 'endDate', e.target.value)}
                            disabled={exp.current}
                            className={`flex-1 px-3 py-2 rounded-lg ${
                              isDark ? 'bg-white/5 border border-white/10 text-white' : 'bg-gray-50 border border-gray-200 text-gray-900'
                            } ${exp.current ? 'opacity-50' : ''}`}
                          />
                        </div>
                        <label className="flex items-center gap-2 mt-2">
                          <input
                            type="checkbox"
                            checked={exp.current}
                            onChange={(e) => updateExperience(exp.id, 'current', e.target.checked)}
                            className="rounded"
                          />
                          <span className="text-sm text-gray-500">{t('dashboard.resumeBuilder.current')}</span>
                        </label>
                      </div>
                    </div>

                    {/* Bullets */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          {t('dashboard.resumeBuilder.achievementsAndResponsibilities')}
                        </label>
                        <button
                          onClick={async () => {
                            const result = await generateWithAI('bullet', { 
                              title: exp.title,
                              company: exp.company,
                              location: exp.location,
                              startDate: exp.startDate,
                              endDate: exp.current ? 'Present' : exp.endDate
                            });
                            // Result is now an array of bullet points
                            const bulletsArray = Array.isArray(result) ? result : [result];
                            const newBullets = [...exp.bullets, ...bulletsArray];
                            updateExperience(exp.id, 'bullets', newBullets);
                          }}
                          disabled={aiGenerating}
                          className="text-sm text-purple-500 hover:text-purple-600 flex items-center gap-1"
                        >
                          <Sparkles className="size-4" />
                          {t('dashboard.resumeBuilder.aiGenerateBullet')}
                        </button>
                      </div>
                      <div className="space-y-2">
                        {exp.bullets.map((bullet, bulletIndex) => (
                          <div key={bulletIndex} className="flex items-start gap-2">
                            <span className="text-gray-400 mt-3">•</span>
                            <textarea
                              value={bullet}
                              onChange={(e) => {
                                const newBullets = [...exp.bullets];
                                newBullets[bulletIndex] = e.target.value;
                                updateExperience(exp.id, 'bullets', newBullets);
                              }}
                              placeholder={t('dashboard.resumeBuilder.bulletPlaceholder')}
                              rows={2}
                              className={`flex-1 px-3 py-2 rounded-lg resize-none ${
                                isDark ? 'bg-white/5 border border-white/10 text-white placeholder-gray-500' : 'bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400'
                              }`}
                            />
                            {exp.bullets.length > 1 && (
                              <button
                                onClick={() => {
                                  const newBullets = exp.bullets.filter((_, i) => i !== bulletIndex);
                                  updateExperience(exp.id, 'bullets', newBullets);
                                }}
                                className="text-gray-400 hover:text-red-500 mt-2"
                              >
                                <X className="size-4" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                      <button
                        onClick={() => {
                          updateExperience(exp.id, 'bullets', [...exp.bullets, '']);
                        }}
                        className={`mt-2 text-sm flex items-center gap-1 ${
                          isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        <Plus className="size-4" />
                        {t('dashboard.resumeBuilder.addBulletPoint')}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Experience Button */}
              <Button
                onClick={() => {
                  addExperience();
                  setEstelMessage(t('dashboard.resumeBuilder.addExperienceMessage'));
                }}
                className={`w-full mb-6 border-2 ${
                  isDark 
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-purple-500/50' 
                    : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-purple-400'
                }`}
              >
                <Plus className="size-4 mr-2" />
                {t('dashboard.resumeBuilder.addAnotherExperience')}
              </Button>

              {/* Navigation */}
              <div className="flex justify-between">
                <Button
                  onClick={prevStep}
                  className="bg-white/10 hover:bg-white/20 text-white border-0"
                >
                  <ChevronLeft className="size-4 mr-2" />
                  {t('dashboard.resumeBuilder.buttons.previous')}
                </Button>
                <Button
                  onClick={nextStep}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0"
                >
                  {t('dashboard.resumeBuilder.continue')}
                  <ChevronRight className="size-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* STEP: EDUCATION */}
          {currentStep === 'education' && (
            <div>
              <h2 className={`text-3xl mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {t('dashboard.resumeBuilder.education')}
              </h2>
              <p className={`text-lg mb-8 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {t('dashboard.resumeBuilder.addEducationDescription')}
              </p>

              {/* Show empty state if no education */}
              {resumeData.education.length === 0 && (
                <div className={`p-12 rounded-xl text-center mb-6 ${isDark ? 'bg-white/5' : 'bg-gradient-to-br from-purple-50 to-pink-50'}`}>
                  <GraduationCap className={`size-16 mx-auto mb-4 ${isDark ? 'text-gray-400' : 'text-gray-400'}`} />
                  <h3 className={`text-xl mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {t('dashboard.resumeBuilder.noEducationAdded')}
                  </h3>
                  <p className={`mb-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {t('dashboard.resumeBuilder.addFirstEducationDescription')}
                  </p>
                  <Button
                    onClick={() => {
                      addEducation();
                      setEstelMessage(t('dashboard.resumeBuilder.addEducationMessage'));
                    }}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0"
                  >
                    <Plus className="size-4 mr-2" />
                    {t('dashboard.resumeBuilder.addFirstEducation')}
                  </Button>
                </div>
              )}

              {/* Education Entries */}
              <div className="space-y-6 mb-6">
                {resumeData.education.map((edu, index) => (
                  <div
                    key={edu.id}
                    className={`p-6 rounded-xl border-2 ${
                      isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <GripVertical className="size-5 text-gray-400 cursor-move" />
                        <h3 className={`text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {t('dashboard.resumeBuilder.educationNumber', { n: index + 1 })}
                        </h3>
                      </div>
                      {resumeData.education.length > 1 && (
                        <button
                          onClick={() => removeEducation(edu.id)}
                          className="text-red-500 hover:text-red-600"
                        >
                          <Trash2 className="size-5" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className={`block text-sm mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          {t('dashboard.resumeBuilder.institution')} *
                        </label>
                        <input
                          type="text"
                          value={edu.institution}
                          onChange={(e) => updateEducation(edu.id, 'institution', e.target.value)}
                          placeholder={t('dashboard.resumeBuilder.institutionPlaceholder')}
                          className={`w-full px-3 py-2 rounded-lg ${
                            isDark ? 'bg-white/5 border border-white/10 text-white placeholder-gray-500' : 'bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400'
                          }`}
                        />
                      </div>
                      <div>
                        <label className={`block text-sm mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          {t('dashboard.resumeBuilder.degree')} *
                        </label>
                        <select
                          value={edu.degree}
                          onChange={(e) => updateEducation(edu.id, 'degree', e.target.value)}
                          className={`w-full px-3 py-2 rounded-lg ${
                            isDark ? 'bg-white/5 border border-white/10 text-white' : 'bg-gray-50 border border-gray-200 text-gray-900'
                          }`}
                        >
                          <option value="">{t('dashboard.resumeBuilder.selectDegree')}</option>
                          <option value="B.Tech">B.Tech</option>
                          <option value="B.S.">B.S.</option>
                          <option value="M.Tech">M.Tech</option>
                          <option value="M.S.">M.S.</option>
                          <option value="MBA">MBA</option>
                          <option value="Ph.D.">Ph.D.</option>
                          <option value="Associate">Associate</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className={`block text-sm mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          {t('dashboard.resumeBuilder.fieldOfStudy')} *
                        </label>
                        <input
                          type="text"
                          value={edu.field}
                          onChange={(e) => updateEducation(edu.id, 'field', e.target.value)}
                          placeholder={t('dashboard.resumeBuilder.fieldOfStudyPlaceholder')}
                          className={`w-full px-3 py-2 rounded-lg ${
                            isDark ? 'bg-white/5 border border-white/10 text-white placeholder-gray-500' : 'bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400'
                          }`}
                        />
                      </div>
                      <div>
                        <label className={`block text-sm mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          {t('dashboard.resumeBuilder.graduationYear')}
                        </label>
                        <input
                          type="text"
                          value={edu.graduationYear}
                          onChange={(e) => updateEducation(edu.id, 'graduationYear', e.target.value)}
                          placeholder={t('dashboard.resumeBuilder.graduationYearPlaceholder')}
                          className={`w-full px-3 py-2 rounded-lg ${
                            isDark ? 'bg-white/5 border-white/10 text-white placeholder-gray-500' : 'bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400'
                          }`}
                        />
                      </div>
                    </div>

                    <div className="mb-4">
                      <label className="flex items-center gap-2 mb-2">
                        <input
                          type="checkbox"
                          checked={edu.showGpa}
                          onChange={(e) => updateEducation(edu.id, 'showGpa', e.target.checked)}
                          className="rounded"
                        />
                        <span className="text-sm text-gray-500">{t('dashboard.resumeBuilder.showGpa')}</span>
                      </label>
                      {edu.showGpa && (
                        <input
                          type="text"
                          value={edu.gpa}
                          onChange={(e) => updateEducation(edu.id, 'gpa', e.target.value)}
                          placeholder={t('dashboard.resumeBuilder.gpaPlaceholder')}
                          className={`w-full px-3 py-2 rounded-lg ${
                            isDark ? 'bg-white/5 border border-white/10 text-white placeholder-gray-500' : 'bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400'
                          }`}
                        />
                      )}
                    </div>

                    <div>
                      <label className={`block text-sm mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        {t('dashboard.resumeBuilder.honorsAndAwards')}
                      </label>
                      <input
                        type="text"
                        placeholder={t('dashboard.resumeBuilder.pressEnterToAdd')}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && e.currentTarget.value) {
                            updateEducation(edu.id, 'honors', [...edu.honors, e.currentTarget.value]);
                            e.currentTarget.value = '';
                          }
                        }}
                        className={`w-full px-3 py-2 rounded-lg ${
                          isDark ? 'bg-white/5 border border-white/10 text-white placeholder-gray-500' : 'bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400'
                        }`}
                      />
                      <div className="flex flex-wrap gap-2 mt-2">
                        {edu.honors.map((honor, i) => (
                          <span
                            key={i}
                            className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-500 text-sm flex items-center gap-2"
                          >
                            {honor}
                            <button
                              onClick={() => {
                                updateEducation(edu.id, 'honors', edu.honors.filter((_, idx) => idx !== i));
                              }}
                              className="hover:text-purple-600"
                            >
                              <X className="size-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Education Button */}
              <Button
                onClick={() => {
                  addEducation();
                  setEstelMessage(t('dashboard.resumeBuilder.addEducationMessage2'));
                }}
                className="w-full mb-6 bg-white/10 hover:bg-white/20 text-white border-0"
              >
                <Plus className="size-4 mr-2" />
                {t('dashboard.resumeBuilder.addAnotherEducation')}
              </Button>

              {/* Navigation */}
              <div className="flex justify-between">
                <Button
                  onClick={prevStep}
                  className="bg-white/10 hover:bg-white/20 text-white border-0"
                >
                  <ChevronLeft className="size-4 mr-2" />
                  {t('dashboard.resumeBuilder.buttons.previous')}
                </Button>
                <Button
                  onClick={nextStep}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0"
                >
                  {t('dashboard.resumeBuilder.continue')}
                  <ChevronRight className="size-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* STEP: SKILLS */}
          {currentStep === 'skills' && (
            <div>
              <h2 className={`text-3xl mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('dashboard.resumeBuilder.skills')}</h2>
              <p className={`text-lg mb-8 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('dashboard.resumeBuilder.showcaseYourSkills')}</p>
              <div className="mb-8">
                <h3 className={`text-xl mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('dashboard.resumeBuilder.technicalSkills')}</h3>
                <div className={`p-6 rounded-xl ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
                  <div className="flex gap-2 mb-4">
                    <input type="text" value={newTech} onChange={(e) => setNewTech(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && newTech.trim()) { addSkill('technical', newTech.trim()); setNewTech(''); }}} placeholder={t('dashboard.resumeBuilder.typeAndPressEnter')} className={`flex-1 px-4 py-3 rounded-xl border ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-gray-200'}`} />
                    <Button onClick={() => { if (newTech.trim()) { addSkill('technical', newTech.trim()); setNewTech(''); }}} className="bg-purple-500 hover:bg-purple-600 text-white border-0"><Plus className="size-4" /></Button>
                  </div>
                  <div className="mb-4">
                    <p className="text-sm text-gray-500 mb-2">{t('dashboard.resumeBuilder.suggested')}</p>
                    <div className="flex flex-wrap gap-2">
                      {['JavaScript', 'Python', 'React', 'Node.js', 'AWS', 'Docker'].map(skill => (
                        <button key={skill} onClick={() => { if (!resumeData.technicalSkills.includes(skill)) addSkill('technical', skill); }} className={`px-3 py-1 rounded-lg text-sm ${resumeData.technicalSkills.includes(skill) ? 'bg-green-500 text-white' : isDark ? 'bg-white/10 text-gray-300' : 'bg-gray-200 text-gray-700'}`}>{resumeData.technicalSkills.includes(skill) ? '✓ ' : '+ '}{skill}</button>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {resumeData.technicalSkills.map((skill: string, i: number) => (<span key={i} className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white flex items-center gap-2">{skill}<button onClick={() => removeSkill('technical', i)} className="hover:text-red-200"><X className="size-4" /></button></span>))}
                  </div>
                </div>
              </div>
              <div className="mb-8">
                <h3 className={`text-xl mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('dashboard.resumeBuilder.softSkills')}</h3>
                <div className={`p-6 rounded-xl ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
                  <div className="flex gap-2 mb-4">
                    <input type="text" value={newSkill} onChange={(e) => setNewSkill(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && newSkill.trim()) { addSkill('soft', newSkill.trim()); setNewSkill(''); }}} placeholder={t('dashboard.resumeBuilder.typeAndPressEnter')} className={`flex-1 px-4 py-3 rounded-xl border ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-gray-200'}`} />
                    <Button onClick={() => { if (newSkill.trim()) { addSkill('soft', newSkill.trim()); setNewSkill(''); }}} className="bg-purple-500 hover:bg-purple-600 text-white border-0"><Plus className="size-4" /></Button>
                  </div>
                  <div className="mb-4">
                    <p className="text-sm text-gray-500 mb-2">{t('dashboard.resumeBuilder.suggested')}</p>
                    <div className="flex flex-wrap gap-2">
                      {['Leadership', 'Communication', 'Problem Solving', 'Teamwork'].map(skill => (
                        <button key={skill} onClick={() => { if (!resumeData.softSkills.includes(skill)) addSkill('soft', skill); }} className={`px-3 py-1 rounded-lg text-sm ${resumeData.softSkills.includes(skill) ? 'bg-green-500 text-white' : isDark ? 'bg-white/10 text-gray-300' : 'bg-gray-200 text-gray-700'}`}>{resumeData.softSkills.includes(skill) ? '✓ ' : '+ '}{skill}</button>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {resumeData.softSkills.map((skill: string, i: number) => (<span key={i} className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500 text-white flex items-center gap-2">{skill}<button onClick={() => removeSkill('soft', i)} className="hover:text-red-200"><X className="size-4" /></button></span>))}
                  </div>
                </div>
              </div>
              <div className="flex justify-between">
                <Button onClick={prevStep} className="bg-white/10 hover:bg-white/20 text-white border-0">
                  <ChevronLeft className="size-4 mr-2" />
                  {t('dashboard.resumeBuilder.buttons.previous')}
                </Button>
                <Button onClick={nextStep} className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0">
                  {t('dashboard.resumeBuilder.continue')}
                  <ChevronRight className="size-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* STEP: PROJECTS */}
          {/* STEP: PROJECTS */}
          {currentStep === 'projects' && (
            <div>
              <h2 className={`text-3xl mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {t('dashboard.resumeBuilder.projects')}
              </h2>
              <p className={`text-lg mb-8 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {t('dashboard.resumeBuilder.showcaseYourBestWork')}
              </p>
              <div className="space-y-6 mb-6">
                {resumeData.projects.map((project: any, index: number) => (
                  <div key={project.id} className={`p-6 rounded-xl border-2 ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'}`}>
                    <div className="flex items-start justify-between mb-4">
                      <h3 className={isDark ? 'text-white' : 'text-gray-900'}>
                        {t('dashboard.resumeBuilder.projectNumber', { n: index + 1 })}
                      </h3>
                      {resumeData.projects.length > 1 && (
                        <button onClick={() => removeProject(project.id)} className="text-red-500">
                          <Trash2 className="size-5" />
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <input
                        type="text"
                        value={project.name}
                        onChange={(e) => updateProject(project.id, 'name', e.target.value)}
                        placeholder={t('dashboard.resumeBuilder.projectName')}
                        className={`px-3 py-2 rounded-lg ${isDark ? 'bg-white/5 border border-white/10 text-white' : 'bg-gray-50 border border-gray-200'}`}
                      />
                      <input
                        type="text"
                        value={project.date}
                        onChange={(e) => updateProject(project.id, 'date', e.target.value)}
                        placeholder={t('dashboard.resumeBuilder.date')}
                        className={`px-3 py-2 rounded-lg ${isDark ? 'bg-white/5 border border-white/10 text-white' : 'bg-gray-50 border border-gray-200'}`}
                      />
                    </div>
                    <textarea
                      value={project.description}
                      onChange={(e) => updateProject(project.id, 'description', e.target.value)}
                      placeholder={t('dashboard.resumeBuilder.description')}
                      rows={3}
                      className={`w-full px-3 py-2 rounded-lg mb-4 ${isDark ? 'bg-white/5 border border-white/10 text-white' : 'bg-gray-50 border border-gray-200'}`}
                    />
                    <input
                      type="text"
                      placeholder={t('dashboard.resumeBuilder.addTech')}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && e.currentTarget.value) {
                          updateProject(project.id, 'technologies', [...project.technologies, e.currentTarget.value]);
                          e.currentTarget.value = '';
                        }
                      }}
                      className={`w-full px-3 py-2 rounded-lg mb-2 ${isDark ? 'bg-white/5 border border-white/10 text-white' : 'bg-gray-50 border border-gray-200'}`}
                    />
                    <div className="flex flex-wrap gap-2">
                      {project.technologies.map((tech: string, i: number) => (
                        <span key={i} className="px-3 py-1 rounded-full bg-teal-500/20 text-teal-500 text-sm flex items-center gap-2">
                          {tech}
                          <button onClick={() => updateProject(project.id, 'technologies', project.technologies.filter((_: any, idx: number) => idx !== i))}>
                            <X className="size-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <Button onClick={addProject} className="w-full mb-6 bg-white/10 hover:bg-white/20 text-white border-0">
                <Plus className="size-4 mr-2" />
                {t('dashboard.resumeBuilder.addProject')}
              </Button>
              <div className="flex justify-between">
                <Button onClick={prevStep} className="bg-white/10 hover:bg-white/20 text-white border-0">
                  <ChevronLeft className="size-4 mr-2" />
                  {t('dashboard.resumeBuilder.buttons.previous')}
                </Button>
                <Button onClick={nextStep} className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0">
                  {t('dashboard.resumeBuilder.continue')}
                  <ChevronRight className="size-4 ml-2" />
                </Button>
              </div>
            </div>
          )}
          {/* STEP: ADDITIONAL */}
          {currentStep === 'additional' && (
            <div>
              <h2 className={`text-3xl mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {t('dashboard.resumeBuilder.additional')}
              </h2>
              <p className={`text-lg mb-8 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {t('dashboard.resumeBuilder.addCertificationsLanguagesAwards')}
              </p>
              <div className="space-y-6">
                {/* Certifications */}
                <div className={`p-6 rounded-xl ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
                  <h3 className={`mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    <Award className="size-5" />
                    {t('dashboard.resumeBuilder.certifications')}
                  </h3>
                  <input
                    type="text"
                    placeholder={t('dashboard.resumeBuilder.pressEnter')}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && e.currentTarget.value) {
                        setResumeData({ ...resumeData, certifications: [...resumeData.certifications, e.currentTarget.value] });
                        e.currentTarget.value = '';
                      }
                    }}
                    className={`w-full px-4 py-3 rounded-xl border mb-3 ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-gray-200'}`}
                  />
                  <div className="flex flex-wrap gap-2">
                    {resumeData.certifications.map((cert: string, i: number) => (
                      <span key={i} className="px-4 py-2 rounded-lg bg-gradient-to-r from-yellow-500 to-orange-500 text-white flex items-center gap-2">
                        {cert}
                        <button onClick={() => setResumeData({ ...resumeData, certifications: resumeData.certifications.filter((_: any, idx: number) => idx !== i) })}>
                          <X className="size-4" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Languages */}
                <div className={`p-6 rounded-xl ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
                  <h3 className={`mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    <Languages className="size-5" />
                    {t('dashboard.resumeBuilder.languages')}
                  </h3>
                  <input
                    type="text"
                    placeholder={t('dashboard.resumeBuilder.pressEnter')}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && e.currentTarget.value) {
                        setResumeData({ ...resumeData, languages: [...resumeData.languages, e.currentTarget.value] });
                        e.currentTarget.value = '';
                      }
                    }}
                    className={`w-full px-4 py-3 rounded-xl border mb-3 ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-gray-200'}`}
                  />
                  <div className="flex flex-wrap gap-2">
                    {resumeData.languages.map((lang: string, i: number) => (
                      <span key={i} className="px-4 py-2 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 text-white flex items-center gap-2">
                        {lang}
                        <button onClick={() => setResumeData({ ...resumeData, languages: resumeData.languages.filter((_: any, idx: number) => idx !== i) })}>
                          <X className="size-4" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Awards */}
                <div className={`p-6 rounded-xl ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
                  <h3 className={`mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    <Trophy className="size-5" />
                    {t('dashboard.resumeBuilder.awards')}
                  </h3>
                  <input
                    type="text"
                    placeholder={t('dashboard.resumeBuilder.pressEnter')}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && e.currentTarget.value) {
                        setResumeData({ ...resumeData, awards: [...resumeData.awards, e.currentTarget.value] });
                        e.currentTarget.value = '';
                      }
                    }}
                    className={`w-full px-4 py-3 rounded-xl border mb-3 ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-gray-200'}`}
                  />
                  <div className="flex flex-wrap gap-2">
                    {resumeData.awards.map((award: string, i: number) => (
                      <span key={i} className="px-4 py-2 rounded-lg bg-gradient-to-r from-pink-500 to-rose-500 text-white flex items-center gap-2">
                        {award}
                        <button onClick={() => setResumeData({ ...resumeData, awards: resumeData.awards.filter((_: any, idx: number) => idx !== i) })}>
                          <X className="size-4" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex justify-between mt-8">
                <Button onClick={prevStep} className="bg-white/10 hover:bg-white/20 text-white border-0">
                  <ChevronLeft className="size-4 mr-2" />
                  {t('dashboard.resumeBuilder.buttons.previous')}
                </Button>
                <Button onClick={nextStep} className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0">
                  {t('dashboard.resumeBuilder.continue')}
                  <ChevronRight className="size-4 ml-2" />
                </Button>
              </div>
            </div>
          )}
{currentStep === 'layout' && (
            <LayoutCustomization
              resumeData={resumeData}
              setResumeData={setResumeData}
              isDark={isDark}
              prevStep={prevStep}
              nextStep={nextStep}
            />
          )}
          {/* STEP: CRITIQUE */}
          {currentStep === 'critique' && (
            <div className="w-full overflow-x-hidden">
              <h2 className={`text-3xl mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {t('dashboard.resumeBuilder.aiCritique')}
              </h2>
              <p className={`text-lg mb-8 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {t('dashboard.resumeBuilder.getAIFeedback')}
              </p>
              
              {critiqueData.overall === 0 ? (
                <div className="text-center py-12">
                  <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <Sparkles className="size-16 text-white" />
                  </div>
                  <h3 className={`text-2xl mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {t('dashboard.resumeBuilder.readyForAIAnalysis')}
                  </h3>
                  <Button 
                    onClick={generateCritique} 
                    disabled={aiGenerating}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 px-8 py-4"
                  >
                    {aiGenerating ? (
                      <>
                        <Loader2 className="size-5 mr-2 animate-spin" />
                        {t('dashboard.resumeBuilder.analyzing')}
                      </>
                    ) : (
                      <>
                        <Wand2 className="size-5 mr-2" />
                        {t('dashboard.resumeBuilder.analyzeResume')}
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                <div className="space-y-6 w-full overflow-x-hidden">
                  {/* Estel's Tip Banner */}
                  {estelMessage && (
                    <div className={`p-4 rounded-xl mb-6 ${isDark ? 'bg-purple-500/20 border border-purple-500/30' : 'bg-purple-50 border border-purple-200'}`}>
                      <div className="flex items-start gap-3">
                        <Sparkles className="size-5 text-purple-500 mt-0.5 flex-shrink-0" />
                        <p className={`text-sm ${isDark ? 'text-purple-200' : 'text-purple-700'}`}>
                          {estelMessage}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Overall Score */}
                  <div className={`p-8 rounded-xl text-center ${isDark ? 'bg-white/5' : 'bg-purple-50'}`}>
                    <div className="text-6xl mb-4">{critiqueData.overall >= 80 ? '🎉' : '👍'}</div>
                    <h3 className={`text-4xl mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {Math.round(critiqueData.overall)}/100
                    </h3>
                    <p className="text-purple-500">
                      {critiqueData.overall >= 80 ? t('dashboard.resumeBuilder.excellent') : t('dashboard.resumeBuilder.good')}
                    </p>
                  </div>

                  {/* Category Scores */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { label: t('dashboard.resumeBuilder.content'), value: critiqueData.content },
                      { label: t('dashboard.resumeBuilder.formatting'), value: critiqueData.formatting },
                      { label: t('dashboard.resumeBuilder.impact'), value: critiqueData.impact },
                      { label: t('dashboard.resumeBuilder.length'), value: critiqueData.length }
                    ].map((cat) => (
                      <div key={cat.label} className={`p-4 rounded-xl ${isDark ? 'bg-white/5' : 'bg-white'}`}>
                        <p className="text-sm text-gray-500 mb-2 truncate">{cat.label}</p>
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`flex-1 h-2 rounded-full min-w-0 ${isDark ? 'bg-white/10' : 'bg-gray-200'}`}>
                            <div 
                              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full" 
                              style={{ width: `${cat.value}%` }}
                            ></div>
                          </div>
                          <span className={`text-lg flex-shrink-0 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {Math.round(cat.value)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Detailed Feedback */}
                  {detailedFeedback && (
                    <div className={`rounded-xl border p-6 max-h-[600px] overflow-y-auto overflow-x-hidden ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'}`}>
                      <h3 className={`text-xl mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {t('dashboard.resumeBuilder.detailedFeedback')}
                      </h3>
                      <div className={`prose prose-sm max-w-none break-words ${isDark ? 'prose-invert' : ''}`}>
                        <div className="word-break break-words overflow-wrap-anywhere">
                          {renderMarkdownText(detailedFeedback)}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Re-analyze Button */}
                  <Button 
                    onClick={generateCritique} 
                    disabled={aiGenerating}
                    className="w-full bg-white/10 hover:bg-white/20 text-white border-0"
                  >
                    {aiGenerating ? (
                      <>
                        <Loader2 className="size-4 mr-2 animate-spin" />
                        {t('dashboard.resumeBuilder.analyzing')}
                      </>
                    ) : (
                      <>
                        <RefreshCw className="size-4 mr-2" />
                        {t('dashboard.resumeBuilder.reAnalyze')}
                      </>
                    )}
                  </Button>
                </div>
              )}
              
              <div className="flex justify-between mt-8">
                <Button onClick={prevStep} className="bg-white/10 hover:bg-white/20 text-white border-0">
                  <ChevronLeft className="size-4 mr-2" />
                  {t('dashboard.resumeBuilder.buttons.previous')}
                </Button>
                <Button onClick={nextStep} className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0">
                  {t('dashboard.resumeBuilder.continue')}
                  <ChevronRight className="size-4 ml-2" />
                </Button>
              </div>
            </div>
          )}
          {/* STEP: ATS CHECK */}
          {currentStep === 'ats' && (
            <div>
              <h2 className={`text-3xl mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {t('dashboard.resumeBuilder.atsCheck')}
              </h2>
              <p className={`text-lg mb-8 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {t('dashboard.resumeBuilder.checkATSCompatibility')}
              </p>
              {atsScore === 0 ? (
                <div className="text-center py-12">
                  <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center">
                    <FileCheck className="size-16 text-white" />
                  </div>
                  <h3 className={`text-2xl mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {t('dashboard.resumeBuilder.checkATS')}
                  </h3>
                  <Button onClick={() => setAtsScore(calculateATSScore())} className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white border-0 px-8 py-4">
                    <FileCheck className="size-5 mr-2" />
                    {t('dashboard.resumeBuilder.runATSCheck')}
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className={`p-8 rounded-xl text-center ${atsScore >= 80 ? 'bg-green-50' : 'bg-yellow-50'}`}>
                    <div className="text-6xl mb-4">{atsScore >= 80 ? '🎉' : '👍'}</div>
                    <h3 className={`text-4xl mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {atsScore}/100
                    </h3>
                    <p className={atsScore >= 80 ? 'text-green-500' : 'text-yellow-500'}>
                      {atsScore >= 80 ? t('dashboard.resumeBuilder.excellent') : t('dashboard.resumeBuilder.good')}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className={`p-6 rounded-xl ${isDark ? 'bg-white/5' : 'bg-white'}`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-500">{t('dashboard.resumeBuilder.contact')}</span>
                        <CheckCircle className="size-5 text-green-500" />
                      </div>
                      <p className="text-2xl">{resumeData.personalInfo.email ? '100%' : '50%'}</p>
                    </div>
                    <div className={`p-6 rounded-xl ${isDark ? 'bg-white/5' : 'bg-white'}`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-500">{t('dashboard.resumeBuilder.skills')}</span>
                        {resumeData.technicalSkills.length >= 5 ? (
                          <CheckCircle className="size-5 text-green-500" />
                        ) : (
                          <AlertCircle className="size-5 text-yellow-500" />
                        )}
                      </div>
                      <p className="text-2xl">{resumeData.technicalSkills.length}</p>
                    </div>
                  </div>
                  <Button
                    onClick={() => {
                      setAtsScore(calculateATSScore());
                      toast.success(t('dashboard.resumeBuilder.updated'));
                    }}
                    className="w-full bg-white/10 hover:bg-white/20 text-white border-0"
                  >
                    <RefreshCw className="size-4 mr-2" />
                    {t('dashboard.resumeBuilder.reCheck')}
                  </Button>
                </div>
              )}
              <div className="flex justify-between mt-8">
                <Button onClick={prevStep} className="bg-white/10 hover:bg-white/20 text-white border-0">
                  <ChevronLeft className="size-4 mr-2" />
                  {t('dashboard.resumeBuilder.buttons.previous')}
                </Button>
                <Button onClick={nextStep} className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0">
                  {t('dashboard.resumeBuilder.continue')}
                  <ChevronRight className="size-4 ml-2" />
                </Button>
              </div>
            </div>
          )}
          {/* STEP: EXPORT */}
          {currentStep === 'export' && (
            <div>
              <h2 className={`text-3xl mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {t('dashboard.resumeBuilder.exportResume')}
              </h2>
              <p className={`text-lg mb-8 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {t('dashboard.resumeBuilder.downloadAndShare')}
              </p>
              <div className="text-center py-12 mb-8">
                <div className="text-8xl mb-6">🎉</div>
                <h3 className={`text-3xl mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {t('dashboard.resumeBuilder.amazingWork')}
                </h3>
                <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                  {t('dashboard.resumeBuilder.yourResumeIsReady')}
                </p>
              </div>
              <div style={{ position: 'fixed', left: '-10000px', top: 0, width: '210mm', height: '297mm', background: '#ffffff', overflow: 'hidden', zIndex: -1 }} ref={exportA4Ref}>
                <TemplateRenderer templateId={resumeData.templateId} resumeData={resumeData} isDark={false} />
              </div>
              <div className="grid grid-cols-2 gap-6 mb-8">
                <button
                  onClick={() => {
                    const fullName = resumeData.personalInfo.fullName || 'Resume';
                    const fileName = `${fullName.replace(/\s+/g, '_')}.pdf`;
                    const target = exportA4Ref.current || previewPrintRef.current;
                    exportElementToPdf(target, fileName);
                  }}
                  className={`p-8 rounded-xl border-2 hover:scale-105 transition-all ${isDark ? 'border-white/10 bg-white/5' : 'border-gray-200 bg-white'}`}
                >
                  <Download className="size-12 mx-auto mb-4 text-purple-500" />
                  <h4 className={isDark ? 'text-white' : 'text-gray-900'}>
                    {t('dashboard.resumeBuilder.downloadPDF')}
                  </h4>
                </button>
                <button
                  onClick={() => toast.info(t('dashboard.resumeBuilder.docxExportComingSoon'))}
                  className={`p-8 rounded-xl border-2 hover:scale-105 transition-all ${isDark ? 'border-white/10 bg-white/5' : 'border-gray-200 bg-white'}`}
                >
                  <FileText className="size-12 mx-auto mb-4 text-blue-500" />
                  <h4 className={isDark ? 'text-white' : 'text-gray-900'}>
                    {t('dashboard.resumeBuilder.downloadDOCX')}
                  </h4>
                </button>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    toast.success(t('dashboard.resumeBuilder.linkCopied'));
                  }}
                  className={`p-8 rounded-xl border-2 hover:scale-105 transition-all ${isDark ? 'border-white/10 bg-white/5' : 'border-gray-200 bg-white'}`}
                >
                  <Link2 className="size-12 mx-auto mb-4 text-teal-500" />
                  <h4 className={isDark ? 'text-white' : 'text-gray-900'}>
                    {t('dashboard.resumeBuilder.copyLink')}
                  </h4>
                </button>
                <button
                  onClick={() => {
                    toast.info(t('dashboard.resumeBuilder.emailSharingComingSoon'));
                  }}
                  className={`p-8 rounded-xl border-2 hover:scale-105 transition-all ${isDark ? 'border-white/10 bg-white/5' : 'border-gray-200 bg-white'}`}
                >
                  <Mail className="size-12 mx-auto mb-4 text-pink-500" />
                  <h4 className={isDark ? 'text-white' : 'text-gray-900'}>
                    {t('dashboard.resumeBuilder.emailResume')}
                  </h4>
                </button>
              </div>
              <div className="flex justify-between">
                <Button onClick={prevStep} className="bg-white/10 hover:bg-white/20 text-white border-0">
                  <ChevronLeft className="size-4 mr-2" />
                  {t('dashboard.resumeBuilder.buttons.previous')}
                </Button>
                <Button onClick={onBack} className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0">
                  {t('dashboard.resumeBuilder.backToDashboard')}
                  <ArrowRight className="size-4 ml-2" />
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Right Panel - Live Preview */}
        {showPreview && currentStep !== 'welcome' && (
          <div className={`${previewMinimized ? 'w-12' : currentStep === 'critique' ? 'w-[450px]' : 'w-[500px]'} border-l transition-all duration-300 sticky top-0 h-screen overflow-y-auto flex-shrink-0 ${
            isDark ? 'bg-slate-950 border-white/10' : 'bg-gray-100 border-gray-200'
          }`}>
            {previewMinimized ? (
              <div className="p-4 flex flex-col items-center gap-4">
                <button
                  onClick={() => setPreviewMinimized(false)}
                  className={`p-2 rounded-lg ${isDark ? 'hover:bg-white/5' : 'hover:bg-gray-200'}`}
                      title={t('dashboard.resumeBuilder.expandPreview')}
                >
                  <ChevronLeft className="size-5" />
                </button>
              </div>
            ) : (
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className={`text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {t('dashboard.resumeBuilder.livePreview')}
                  </h3>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPreviewZoom(Math.max(50, previewZoom - 10))}
                      className={`p-2 rounded-lg ${isDark ? 'hover:bg-white/5' : 'hover:bg-gray-200'}`}
                    >
                      <ZoomOut className="size-4" />
                    </button>
                    <span className="text-sm text-gray-500">{previewZoom}%</span>
                    <button
                      onClick={() => setPreviewZoom(Math.min(150, previewZoom + 10))}
                      className={`p-2 rounded-lg ${isDark ? 'hover:bg-white/5' : 'hover:bg-gray-200'}`}
                    >
                      <ZoomIn className="size-4" />
                    </button>
                    <button
                      onClick={() => setPreviewMinimized(true)}
                      className={`p-2 rounded-lg ${isDark ? 'hover:bg-white/5' : 'hover:bg-gray-200'}`}
                      title={t('dashboard.resumeBuilder.minimizePreview')}
                    >
                      <ChevronRight className="size-4" />
                    </button>
                  </div>
                </div>

              {/* Resume Preview */}
              <div className="flex justify-center">
                <div 
                  className="bg-white rounded-lg shadow-2xl overflow-hidden"
                  style={{ 
                    width: `${210 * (previewZoom / 100)}mm`,
                    height: `${297 * (previewZoom / 100)}mm`,
                    maxWidth: '100%',
                    maxHeight: 'calc(100vh - 200px)',
                    aspectRatio: '210 / 297'
                  }}
                >
                  {/* Template Renderer - dynamically renders based on templateId */}
                  <TemplateRenderer 
                    templateId={resumeData.templateId} 
                    resumeData={resumeData}
                    isDark={isDark}
                  />
                </div>
              </div>
              </div>
            )}
          </div>
        )}
      </main>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
