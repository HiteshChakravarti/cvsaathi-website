import { useState, useEffect, useRef, useMemo } from "react";
import { ArrowLeft, Camera, Edit2, Mail, MapPin, Globe, Linkedin, Github, Twitter, Check, X, Copy, Download, Play, Award, TrendingUp, FileText, Mic, Brain, Star, Lock, Share2, ExternalLink, Plus, Trash2, Eye, Loader2, Upload } from "lucide-react";
import { Button } from "../../components/ui/button";
import { toast } from "sonner";
import { useUserProfile } from "../../hooks/useUserProfile";
import { useResumes } from "../../hooks/useResumes";
import { useInterviewSessions } from "../../hooks/useInterviewSessions";
import { useUserStats } from "../../hooks/useUserStats";
import { useAuth } from "../../contexts/AuthContext";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { supabase } from "../../lib/supabaseClient";

interface ProfilePageProps {
  isDark: boolean;
  onBack: () => void;
}

export function ProfilePage({ isDark, onBack }: ProfilePageProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const { profile, loading: profileLoading, saving, updateProfile } = useUserProfile();
  const { resumes, loading: resumesLoading } = useResumes();
  const { sessions: interviewSessions, loading: interviewsLoading } = useInterviewSessions();
  const { stats, loading: statsLoading } = useUserStats(user?.id);
  
  // Profile picture and background image (localStorage)
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
  const profilePicInputRef = useRef<HTMLInputElement>(null);
  const backgroundImageInputRef = useRef<HTMLInputElement>(null);
  
  // Map profile data to component format
  const [profileData, setProfileData] = useState({
    name: "",
    headline: "",
    bio: "",
    location: "",
    email: "",
    website: "",
    linkedin: "",
    github: "",
    twitter: "",
    currentRole: "",
    targetRole: "",
    experience: "",
    industry: "",
    workPreference: "",
    noticePeriod: "",
    status: "open",
  });

  // Load profile picture and background image from localStorage
  useEffect(() => {
    if (user?.id) {
      const savedPic = localStorage.getItem(`profile_pic_${user.id}`);
      const savedBg = localStorage.getItem(`profile_bg_${user.id}`);
      if (savedPic) setProfilePic(savedPic);
      if (savedBg) setBackgroundImage(savedBg);
    }
  }, [user?.id]);

  // Update local state when profile loads
  useEffect(() => {
    if (profile) {
      const fullName = profile.full_name || 
        (profile.first_name && profile.last_name 
          ? `${profile.first_name} ${profile.last_name}` 
          : profile.first_name || "");
      
      setProfileData({
        name: fullName,
        headline: profile.job_title || "",
        bio: profile.bio || "",
        location: profile.location || "",
        email: profile.email || "",
        website: profile.website || "",
        linkedin: profile.linkedin || "",
        github: profile.github || "",
        twitter: "",
        currentRole: profile.job_title ? `${profile.job_title}${profile.company ? ` at ${profile.company}` : ''}` : "",
        targetRole: "",
        experience: profile.experience || "",
        industry: "",
        workPreference: "",
        noticePeriod: "",
        status: "open",
      });
    }
  }, [profile]);

  // Handle profile picture upload
  const handleProfilePicUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error(t('dashboard.profile.imageSizeError', { size: 5 }));
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      if (user?.id) {
        localStorage.setItem(`profile_pic_${user.id}`, base64String);
        setProfilePic(base64String);
        toast.success(t('dashboard.profile.profilePicUpdated'));
      }
    };
    reader.readAsDataURL(file);
  };

  // Handle background image upload
  const handleBackgroundImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error(t('dashboard.profile.imageSizeError', { size: 10 }));
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      if (user?.id) {
        localStorage.setItem(`profile_bg_${user.id}`, base64String);
        setBackgroundImage(base64String);
        toast.success(t('dashboard.profile.backgroundImageUpdated'));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveProfilePic = () => {
    if (user?.id) {
      localStorage.removeItem(`profile_pic_${user.id}`);
      setProfilePic(null);
      toast.success(t('dashboard.profile.profilePicRemoved'));
    }
  };

  const handleRemoveBackgroundImage = () => {
    if (user?.id) {
      localStorage.removeItem(`profile_bg_${user.id}`);
      setBackgroundImage(null);
      toast.success(t('dashboard.profile.backgroundImageRemoved'));
    }
  };

  const [skills, setSkills] = useState<Array<{ name: string; level: number }>>([]);
  const [education, setEducation] = useState<Array<{ id?: string; degree: string; institution: string; year: string; logo: string }>>([]);
  const [editingSkill, setEditingSkill] = useState<number | null>(null);
  const [editingEducation, setEditingEducation] = useState<number | null>(null);
  const [showAddSkill, setShowAddSkill] = useState(false);
  const [showAddEducation, setShowAddEducation] = useState(false);
  const [newSkill, setNewSkill] = useState({ name: "", level: 50 });
  const [newEducation, setNewEducation] = useState({ degree: "", institution: "", year: "", logo: "from-teal-500 to-cyan-500" });

  // Load skills from profile
  useEffect(() => {
    if (profile?.skills) {
      try {
        // Try parsing as JSON first
        const parsed = JSON.parse(profile.skills);
        if (Array.isArray(parsed)) {
          setSkills(parsed);
        } else {
          // If it's a string, try comma-separated
          const skillNames = profile.skills.split(',').map(s => s.trim()).filter(Boolean);
          setSkills(skillNames.map(name => ({ name, level: 50 })));
        }
      } catch {
        // If not JSON, treat as comma-separated string
        const skillNames = profile.skills.split(',').map(s => s.trim()).filter(Boolean);
        setSkills(skillNames.map(name => ({ name, level: 50 })));
      }
    }
  }, [profile?.skills]);

  // Load education from profile (stored as JSON in a field, or we'll use localStorage for now)
  useEffect(() => {
    if (user?.id) {
      const savedEducation = localStorage.getItem(`profile_education_${user.id}`);
      if (savedEducation) {
        try {
          setEducation(JSON.parse(savedEducation));
        } catch {
          // If parsing fails, use empty array
        }
      }
    }
  }, [user?.id]);

  const achievements = [
    { id: 1, name: t('dashboard.profile.achievementsList.firstResume.name'), description: t('dashboard.profile.achievementsList.firstResume.description'), unlocked: true, icon: FileText },
    { id: 2, name: t('dashboard.profile.achievementsList.aiExplorer.name'), description: t('dashboard.profile.achievementsList.aiExplorer.description'), unlocked: true, icon: Brain },
    { id: 3, name: t('dashboard.profile.achievementsList.interviewMaster.name'), description: t('dashboard.profile.achievementsList.interviewMaster.description'), unlocked: true, icon: Mic },
    { id: 4, name: t('dashboard.profile.achievementsList.skillChampion.name'), description: t('dashboard.profile.achievementsList.skillChampion.description'), unlocked: true, icon: TrendingUp },
    { id: 5, name: t('dashboard.profile.achievementsList.profilePro.name'), description: t('dashboard.profile.achievementsList.profilePro.description'), unlocked: false, icon: Star },
    { id: 6, name: t('dashboard.profile.achievementsList.atsExpert.name'), description: t('dashboard.profile.achievementsList.atsExpert.description'), unlocked: false, icon: Award },
  ];

  // Format resumes for display
  const formattedResumes = resumes?.slice(0, 2).map((resume) => ({
    id: resume.id,
    name: resume.name || t('dashboard.profile.untitledResume'),
    date: resume.updated_at ? new Date(resume.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : "N/A",
    atsScore: 0, // ATS score not stored in resume data
    downloads: 0, // Downloads not tracked
  })) || [];

  // Format interview sessions for display
  const formattedInterviews = interviewSessions?.slice(0, 3).map((session) => {
    const score = session.confidence_score || 0;
    const durationMinutes = session.session_duration_minutes || 0;
    const dateValue = session.completed_at || session.started_at || session.created_at;
    return {
      id: session.id,
      role: session.role || t('dashboard.profile.interviewPractice'),
      company: session.industry || t('dashboard.profile.general'),
      date: dateValue ? new Date(dateValue).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : "N/A",
      score: Math.round(score),
      duration: `${Math.floor(durationMinutes / 60)}:${String(durationMinutes % 60).padStart(2, '0')}`,
    };
  }) || [];

  // Skill gap analysis results
  const [skillGapResults, setSkillGapResults] = useState<Array<{
    id: string;
    skill: string;
    score: number;
    percentile: number;
    date: string;
  }>>([]);
  const [loadingSkillGaps, setLoadingSkillGaps] = useState(true);

  // Fetch skill gap analysis results
  useEffect(() => {
    const fetchSkillGapResults = async () => {
      if (!user?.id) {
        setLoadingSkillGaps(false);
        return;
      }

      try {
        setLoadingSkillGaps(true);
        const { data, error } = await supabase
          .from('skill_gap_analyses')
          .select('id, target_role, analysis_date, created_at, analysis_data')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(3);

        if (error) {
          console.error('Error fetching skill gap results:', error);
          setSkillGapResults([]);
          return;
        }

        if (data && data.length > 0) {
          const formattedResults = data.map((analysis) => {
            let overallScore = 75; // Default
            let matchPercentage = 75;

            // Parse analysis_data to get score
            if (analysis.analysis_data) {
              try {
                const parsed = typeof analysis.analysis_data === 'string' 
                  ? JSON.parse(analysis.analysis_data) 
                  : analysis.analysis_data;
                overallScore = parsed.overallScore || parsed.matchPercentage || 75;
                matchPercentage = parsed.matchPercentage || overallScore;
              } catch (e) {
                console.error('Error parsing analysis data:', e);
              }
            }

            const date = analysis.analysis_date || analysis.created_at;
            const percentile = Math.round(matchPercentage);

            return {
              id: analysis.id,
              skill: analysis.target_role || 'Skill Analysis',
              score: Math.round(overallScore),
              percentile: percentile,
              date: date ? new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A',
            };
          });

          setSkillGapResults(formattedResults);
        } else {
          setSkillGapResults([]);
        }
      } catch (error) {
        console.error('Error fetching skill gap results:', error);
        setSkillGapResults([]);
      } finally {
        setLoadingSkillGaps(false);
      }
    };

    fetchSkillGapResults();
  }, [user?.id]);

  const publicProfileUrl = `cvsaathi.com/${profileData.name.toLowerCase().replace(' ', '-')}`;

  const handleEdit = (field: string) => {
    setIsEditing(field);
  };

  const handleSave = async (field: string, value: string) => {
    try {
      // Map component fields to database fields
      const dbFieldMap: Record<string, string> = {
        name: 'full_name',
        headline: 'job_title',
        bio: 'bio',
        location: 'location',
        website: 'website',
        linkedin: 'linkedin',
        github: 'github',
        currentRole: 'job_title',
        experience: 'experience',
      };

      const dbField = dbFieldMap[field] || field;
      
      // Update local state immediately for better UX
      setProfileData({ ...profileData, [field]: value });
      setIsEditing(null);

      // Prepare update object
      const updateData: any = {};
      
      if (field === 'name') {
        // Split name into first_name and last_name
        const nameParts = value.trim().split(' ');
        updateData.first_name = nameParts[0] || '';
        updateData.last_name = nameParts.slice(1).join(' ') || '';
        updateData.full_name = value;
      } else if (field === 'headline') {
        updateData.job_title = value;
      } else if (dbField) {
        updateData[dbField] = value;
      }

      // Save to database
      await updateProfile(updateData);
      toast.success(t('dashboard.profile.updateSuccess'));
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error(t('dashboard.profile.updateFailed'));
      // Revert local state on error
      setIsEditing(field);
    }
  };

  const handleCancel = () => {
    setIsEditing(null);
    setEditingSkill(null);
    setEditingEducation(null);
    setShowAddSkill(false);
    setShowAddEducation(false);
    setNewSkill({ name: "", level: 50 });
    setNewEducation({ degree: "", institution: "", year: "", logo: "from-teal-500 to-cyan-500" });
  };

  // Save skills to profile
  const saveSkills = async () => {
    try {
      const skillsJson = JSON.stringify(skills);
      await updateProfile({ skills: skillsJson });
      toast.success(t('dashboard.profile.skillsUpdated'));
    } catch (error) {
      console.error('Error saving skills:', error);
      toast.error(t('dashboard.profile.skillsUpdateFailed'));
    }
  };

  // Add new skill
  const handleAddSkill = () => {
    if (newSkill.name.trim()) {
      const updatedSkills = [...skills, { name: newSkill.name.trim(), level: newSkill.level }];
      setSkills(updatedSkills);
      setNewSkill({ name: "", level: 50 });
      setShowAddSkill(false);
      saveSkills();
    }
  };

  // Update skill
  const handleUpdateSkill = (index: number, field: 'name' | 'level', value: string | number) => {
    const updatedSkills = [...skills];
    updatedSkills[index] = { ...updatedSkills[index], [field]: value };
    setSkills(updatedSkills);
    setEditingSkill(null);
    saveSkills();
  };

  // Delete skill
  const handleDeleteSkill = (index: number) => {
    const updatedSkills = skills.filter((_, i) => i !== index);
    setSkills(updatedSkills);
    saveSkills();
  };

  // Save education to localStorage
  const saveEducation = () => {
    if (user?.id) {
      localStorage.setItem(`profile_education_${user.id}`, JSON.stringify(education));
      toast.success(t('dashboard.profile.educationUpdated'));
    }
  };

  // Add new education
  const handleAddEducation = () => {
    if (newEducation.degree.trim() && newEducation.institution.trim()) {
      const updatedEducation = [...education, { ...newEducation, id: Date.now().toString() }];
      setEducation(updatedEducation);
      setNewEducation({ degree: "", institution: "", year: "", logo: "from-teal-500 to-cyan-500" });
      setShowAddEducation(false);
      saveEducation();
    }
  };

  // Update education
  const handleUpdateEducation = (index: number, field: string, value: string) => {
    const updatedEducation = [...education];
    updatedEducation[index] = { ...updatedEducation[index], [field]: value };
    setEducation(updatedEducation);
    setEditingEducation(null);
    saveEducation();
  };

  // Delete education
  const handleDeleteEducation = (index: number) => {
    const updatedEducation = education.filter((_, i) => i !== index);
    setEducation(updatedEducation);
    saveEducation();
  };

  const copyProfileUrl = () => {
    navigator.clipboard.writeText(`https://${publicProfileUrl}`).then(() => {
      toast.success("Profile URL copied to clipboard!");
    }).catch(() => {
      const textArea = document.createElement('textarea');
      textArea.value = `https://${publicProfileUrl}`;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      toast.success("Profile URL copied to clipboard!");
    });
  };

  const shareProfile = () => {
    toast.info(t('dashboard.profile.shareOptionsComingSoon'));
  };

  const connectLinkedIn = () => {
    toast.info(t('dashboard.profile.linkedInIntegrationComingSoon'));
  };

  // Calculate profile completion dynamically
  const profileCompletion = useMemo(() => {
    let completion = 0;
    
    // Profile photo: 10%
    if (profilePic) completion += 10;
    
    // Bio: 15%
    if (profileData.bio && profileData.bio.trim().length > 0) completion += 15;
    
    // Name: 10%
    if (profileData.name && profileData.name.trim().length > 0) completion += 10;
    
    // Skills: 20% (max 20%, based on having skills)
    if (skills.length > 0) {
      completion += Math.min(20, skills.length * 5); // 5% per skill, max 20%
    }
    
    // Education: 15% (max 15%, based on having education)
    if (education.length > 0) {
      completion += Math.min(15, education.length * 7.5); // 7.5% per entry, max 15%
    }
    
    // Resume: 15% (max 15%, based on having resumes)
    if (resumes && resumes.length > 0) {
      completion += Math.min(15, resumes.length * 15); // 15% per resume, max 15%
    }
    
    // LinkedIn: 10%
    if (profileData.linkedin && profileData.linkedin.trim().length > 0) completion += 10;
    
    // Location: 5%
    if (profileData.location && profileData.location.trim().length > 0) completion += 5;
    
    return Math.min(100, Math.round(completion));
  }, [profilePic, profileData.bio, profileData.name, profileData.linkedin, profileData.location, skills.length, education.length, resumes]);

  const statusColors = {
    'actively-looking': 'from-green-500 to-emerald-500',
    'open': 'from-yellow-500 to-orange-500',
    'not-looking': 'from-red-500 to-pink-500',
  };

  // Show loading state
  if (profileLoading) {
    return (
      <div className={`min-h-screen transition-colors duration-500 flex items-center justify-center ${
        isDark 
          ? 'bg-slate-900' 
          : 'bg-gradient-to-br from-gray-50 via-teal-50/30 to-gray-50'
      }`}>
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-teal-500" />
          <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-500 ${
      isDark 
        ? 'bg-slate-900' 
        : 'bg-gradient-to-br from-gray-50 via-teal-50/30 to-gray-50'
    }`}>
      {/* Header */}
      <header className={`border-b transition-colors duration-500 sticky top-0 z-50 ${
        isDark 
          ? 'border-white/10 bg-slate-900/80 backdrop-blur-xl'
          : 'border-gray-200 bg-white/80 backdrop-blur-xl'
      }`}>
        <div className="px-8 py-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              onClick={onBack}
              variant="ghost"
              className={`${isDark ? 'hover:bg-white/5' : 'hover:bg-gray-100'}`}
            >
              <ArrowLeft className="size-5 mr-2" />
              {t('dashboard.profile.backToDashboard')}
            </Button>
            <h1 className={`text-3xl ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {t('dashboard.profile.title')}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              className={`${isDark ? 'border-white/10 hover:bg-white/5 text-white' : 'border-gray-200 hover:bg-gray-50 text-gray-900'}`}
              onClick={async () => {
                try {
                  await signOut();
                  navigate('/');
                } catch (e) {
                  toast.error(t('dashboard.profile.logoutFailed'));
                }
              }}
            >
              {t('dashboard.profile.logout')}
            </Button>
            <Button
              onClick={shareProfile}
              variant="outline"
              className={`${isDark ? 'border-white/10 hover:bg-white/5' : 'border-gray-200 hover:bg-gray-50'}`}
            >
              <Share2 className="size-4 mr-2" />
              {t('dashboard.profile.shareProfile')}
            </Button>
            <Button
              onClick={() => {
                // Navigate to settings page - this will be handled by the parent router
                window.location.href = '/app/settings';
              }}
              className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white"
            >
              <Edit2 className="size-4 mr-2" />
              {t('dashboard.profile.editProfile')}
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-8 py-8">
        <div className="grid grid-cols-12 gap-6">
          {/* Left Column - Main Content */}
          <div className="col-span-8 space-y-6">
            {/* Hero Section */}
            <div className={`rounded-2xl overflow-hidden border ${
              isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'
            }`}>
              {/* Cover Photo */}
              <div 
                className="relative h-48 bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-500 group overflow-hidden"
                style={backgroundImage ? { backgroundImage: `url(${backgroundImage})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
              >
                <input
                  type="file"
                  ref={backgroundImageInputRef}
                  onChange={handleBackgroundImageUpload}
                  accept="image/*"
                  className="hidden"
                />
                <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => backgroundImageInputRef.current?.click()}
                    className={`p-2 rounded-lg transition-all ${
                      isDark ? 'bg-black/50 hover:bg-black/70' : 'bg-white/50 hover:bg-white/70'
                    }`}
                  >
                    <Camera className="size-5" />
                  </button>
                  {backgroundImage && (
                    <button
                      onClick={handleRemoveBackgroundImage}
                      className={`p-2 rounded-lg transition-all ${
                        isDark ? 'bg-red-500/50 hover:bg-red-500/70' : 'bg-red-500/50 hover:bg-red-500/70'
                      }`}
                    >
                      <Trash2 className="size-5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Profile Info */}
              <div className="relative px-8 pb-8">
                {/* Avatar */}
                <div className="relative -mt-16 mb-4 group inline-block">
                  <input
                    type="file"
                    ref={profilePicInputRef}
                    onChange={handleProfilePicUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  {profilePic ? (
                    <img
                      src={profilePic}
                      alt="Profile"
                      className="w-32 h-32 rounded-full object-cover border-4 border-white dark:border-slate-900"
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 border-4 border-white dark:border-slate-900 flex items-center justify-center text-white text-3xl font-bold">
                      {profileData.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
                    </div>
                  )}
                  <div className="absolute bottom-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => profilePicInputRef.current?.click()}
                      className={`p-2 rounded-full transition-all ${
                        isDark ? 'bg-teal-500 hover:bg-teal-600' : 'bg-teal-500 hover:bg-teal-600'
                      } text-white`}
                    >
                      <Camera className="size-4" />
                    </button>
                    {profilePic && (
                      <button
                        onClick={handleRemoveProfilePic}
                        className="p-2 rounded-full bg-red-500 hover:bg-red-600 text-white"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Name & Headline */}
                <div className="space-y-2 mb-4">
                  {isEditing === 'name' ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        defaultValue={profileData.name}
                        placeholder={t('dashboard.profile.yourName')}
                        className={`text-3xl px-3 py-1 rounded-lg border ${
                          isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-gray-200 text-gray-900'
                        }`}
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleSave('name', e.currentTarget.value);
                          }
                          if (e.key === 'Escape') {
                            handleCancel();
                          }
                        }}
                        onBlur={(e) => {
                          if (e.target.value !== profileData.name) {
                            handleSave('name', e.target.value);
                          } else {
                            handleCancel();
                          }
                        }}
                      />
                      <Button size="sm" onClick={(e) => {
                        const input = e.currentTarget.parentElement?.querySelector('input');
                        if (input) handleSave('name', input.value);
                      }}>
                        <Check className="size-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={handleCancel}>
                        <X className="size-4" />
                      </Button>
                    </div>
                  ) : (
                    <h2 
                      className={`text-3xl group cursor-pointer inline-flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}
                      onClick={() => handleEdit('name')}
                    >
                      {profileData.name || t('dashboard.profile.yourName')}
                      <Edit2 className="size-4 opacity-0 group-hover:opacity-50 transition-opacity" />
                    </h2>
                  )}

                  {isEditing === 'headline' ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        defaultValue={profileData.headline}
                        placeholder={t('dashboard.profile.addHeadline')}
                        className={`text-lg px-3 py-1 rounded-lg border ${
                          isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-gray-200 text-gray-900'
                        }`}
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleSave('headline', e.currentTarget.value);
                          }
                          if (e.key === 'Escape') {
                            handleCancel();
                          }
                        }}
                        onBlur={(e) => {
                          if (e.target.value !== profileData.headline) {
                            handleSave('headline', e.target.value);
                          } else {
                            handleCancel();
                          }
                        }}
                      />
                      <Button size="sm" onClick={(e) => {
                        const input = e.currentTarget.parentElement?.querySelector('input');
                        if (input) handleSave('headline', input.value);
                      }}>
                        <Check className="size-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={handleCancel}>
                        <X className="size-4" />
                      </Button>
                    </div>
                  ) : (
                    <p 
                      className={`text-lg group cursor-pointer inline-flex items-center gap-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}
                      onClick={() => handleEdit('headline')}
                    >
                      {profileData.headline || t('dashboard.profile.addHeadline')}
                      <Edit2 className="size-3 opacity-0 group-hover:opacity-50 transition-opacity" />
                    </p>
                  )}
                </div>

                {/* Status Badge */}
                <div className="mb-4">
                  <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm bg-gradient-to-r ${statusColors[profileData.status as keyof typeof statusColors]} text-white`}>
                    {t(`dashboard.profile.statusLabels.${profileData.status}`)}
                  </span>
                </div>

                {/* Contact Info */}
                <div className={`flex flex-wrap items-center gap-4 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {isEditing === 'location' ? (
                    <div className="flex items-center gap-2">
                      <MapPin className="size-4" />
                      <input
                        type="text"
                        defaultValue={profileData.location}
                        className={`px-2 py-1 rounded border ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSave('location', e.currentTarget.value);
                          if (e.key === 'Escape') handleCancel();
                        }}
                        onBlur={(e) => handleSave('location', e.target.value)}
                      />
                    </div>
                  ) : (
                    <div 
                      className="flex items-center gap-1 cursor-pointer group"
                      onClick={() => handleEdit('location')}
                    >
                      <MapPin className="size-4" />
                      <span>{profileData.location || t('dashboard.profile.addLocation')}</span>
                      <Edit2 className="size-3 opacity-0 group-hover:opacity-50 transition-opacity" />
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Mail className="size-4" />
                    {profileData.email}
                  </div>
                  {isEditing === 'website' ? (
                    <div className="flex items-center gap-2">
                      <Globe className="size-4" />
                      <input
                        type="text"
                        defaultValue={profileData.website}
                        placeholder="yourwebsite.com"
                        className={`px-2 py-1 rounded border ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSave('website', e.currentTarget.value);
                          if (e.key === 'Escape') handleCancel();
                        }}
                        onBlur={(e) => handleSave('website', e.target.value)}
                      />
                    </div>
                  ) : (
                    <div 
                      className="flex items-center gap-1 cursor-pointer group"
                      onClick={() => handleEdit('website')}
                    >
                      <Globe className="size-4" />
                      <span>{profileData.website || t('dashboard.profile.addWebsite')}</span>
                      <Edit2 className="size-3 opacity-0 group-hover:opacity-50 transition-opacity" />
                    </div>
                  )}
                </div>

                {/* Social Links */}
                <div className="flex items-center gap-3 mt-4">
                  {isEditing === 'linkedin' ? (
                    <div className="flex items-center gap-2">
                      <Linkedin className="size-5 text-blue-500" />
                      <input
                        type="text"
                        defaultValue={profileData.linkedin}
                        placeholder="linkedin.com/in/username"
                        className={`px-2 py-1 rounded border text-sm ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSave('linkedin', e.currentTarget.value);
                          if (e.key === 'Escape') handleCancel();
                        }}
                        onBlur={(e) => handleSave('linkedin', e.target.value)}
                      />
                    </div>
                  ) : (
                    <div 
                      className={`p-2 rounded-lg transition-all cursor-pointer group ${
                        isDark ? 'bg-white/5 hover:bg-white/10' : 'bg-gray-100 hover:bg-gray-200'
                      }`}
                      onClick={() => handleEdit('linkedin')}
                    >
                      {profileData.linkedin ? (
                        <a href={`https://${profileData.linkedin}`} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
                          <Linkedin className="size-5 text-blue-500" />
                        </a>
                      ) : (
                        <Linkedin className="size-5 text-blue-500" />
                      )}
                    </div>
                  )}
                  {isEditing === 'github' ? (
                    <div className="flex items-center gap-2">
                      <Github className="size-5" />
                      <input
                        type="text"
                        defaultValue={profileData.github}
                        placeholder="github.com/username"
                        className={`px-2 py-1 rounded border text-sm ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSave('github', e.currentTarget.value);
                          if (e.key === 'Escape') handleCancel();
                        }}
                        onBlur={(e) => handleSave('github', e.target.value)}
                      />
                    </div>
                  ) : (
                    <div 
                      className={`p-2 rounded-lg transition-all cursor-pointer group ${
                        isDark ? 'bg-white/5 hover:bg-white/10' : 'bg-gray-100 hover:bg-gray-200'
                      }`}
                      onClick={() => handleEdit('github')}
                    >
                      {profileData.github ? (
                        <a href={`https://${profileData.github}`} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
                          <Github className="size-5" />
                        </a>
                      ) : (
                        <Github className="size-5" />
                      )}
                    </div>
                  )}
                </div>

                {/* Public Profile URL */}
                <div className={`mt-6 p-4 rounded-lg border ${
                  isDark ? 'bg-teal-500/10 border-teal-500/20' : 'bg-teal-50 border-teal-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Globe className="size-5 text-teal-500" />
                      <div>
                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('dashboard.profile.yourPublicProfile')}</p>
                        <p className={`${isDark ? 'text-white' : 'text-gray-900'}`}>{publicProfileUrl}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="ghost" onClick={copyProfileUrl}>
                        <Copy className="size-4" />
                      </Button>
                      <Button size="sm" variant="ghost">
                        <ExternalLink className="size-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* About Me */}
            <div className={`rounded-2xl border p-6 ${
              isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'
            }`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-xl ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('dashboard.profile.aboutMe')}</h3>
                <Button size="sm" variant="ghost" onClick={() => handleEdit('bio')}>
                  <Edit2 className="size-4" />
                </Button>
              </div>
              {isEditing === 'bio' ? (
                <div className="space-y-2">
                  <textarea
                    defaultValue={profileData.bio}
                    placeholder={t('dashboard.profile.bioPlaceholder')}
                    rows={4}
                    className={`w-full px-3 py-2 rounded-lg border resize-none ${
                      isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-gray-200 text-gray-900'
                    }`}
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Escape') {
                        handleCancel();
                      }
                    }}
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={(e) => {
                      const textarea = e.currentTarget.parentElement?.parentElement?.querySelector('textarea');
                      if (textarea) handleSave('bio', textarea.value);
                    }}>
                      <Check className="size-4 mr-2" />
                      {t('dashboard.profile.save')}
                    </Button>
                    <Button size="sm" variant="ghost" onClick={handleCancel}>
                      <X className="size-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <p 
                  className={`${isDark ? 'text-gray-400' : 'text-gray-600'} leading-relaxed cursor-pointer group`}
                  onClick={() => handleEdit('bio')}
                >
                  {profileData.bio || t('dashboard.profile.clickToAddBio')}
                </p>
              )}
            </div>

            {/* LinkedIn Integration */}
            <div className={`rounded-2xl border p-6 ${
              isDark ? 'bg-gradient-to-r from-blue-500/10 to-blue-600/10 border-blue-500/20' : 'bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-blue-500">
                    <Linkedin className="size-6 text-white" />
                  </div>
                  <div>
                    <h3 className={`${isDark ? 'text-white' : 'text-gray-900'}`}>{t('dashboard.profile.connectLinkedIn')}</h3>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {t('dashboard.profile.linkedInDescription')}
                    </p>
                  </div>
                </div>
                <Button onClick={connectLinkedIn} className="bg-blue-600 hover:bg-blue-700 text-white">
                  <Linkedin className="size-4 mr-2" />
                  {t('dashboard.profile.connectLinkedInButton')}
                </Button>
              </div>
            </div>

            {/* Career Information */}
            <div className={`rounded-2xl border p-6 ${
              isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'
            }`}>
              <h3 className={`text-xl mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('dashboard.profile.careerInformation')}</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('dashboard.profile.currentRole')}</label>
                  <p className={`mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>{profileData.currentRole}</p>
                </div>
                <div>
                  <label className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('dashboard.profile.targetRole')}</label>
                  <p className={`mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>{profileData.targetRole}</p>
                </div>
                <div>
                  <label className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('dashboard.profile.experienceLevel')}</label>
                  <p className={`mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>{profileData.experience}</p>
                </div>
                <div>
                  <label className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('dashboard.profile.workPreference')}</label>
                  <p className={`mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>{profileData.workPreference}</p>
                </div>
              </div>
            </div>

            {/* Skills & Expertise */}
            <div className={`rounded-2xl border p-6 ${
              isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'
            }`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-xl ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('dashboard.profile.skillsAndExpertise')}</h3>
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={() => {
                    setShowAddSkill(!showAddSkill);
                    setShowAddEducation(false);
                  }}
                >
                  <Plus className="size-4 mr-2" />
                  {t('dashboard.profile.addSkill')}
                </Button>
              </div>

              {/* Add Skill Form */}
              {showAddSkill && (
                <div className={`mb-4 p-4 rounded-lg border ${
                  isDark ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'
                }`}>
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder={t('dashboard.profile.skillName')}
                      value={newSkill.name}
                      onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-gray-200 text-gray-900'
                      }`}
                      autoFocus
                    />
                    <div className="flex items-center gap-3">
                      <label className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        {t('dashboard.profile.proficiency', { level: newSkill.level })}
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={newSkill.level}
                        onChange={(e) => setNewSkill({ ...newSkill, level: parseInt(e.target.value) })}
                        className="flex-1"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={handleAddSkill}>
                        <Check className="size-4 mr-2" />
                        Add
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setShowAddSkill(false)}>
                        <X className="size-4 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                {skills.length > 0 ? skills.map((skill, index) => (
                  <div key={index} className="group">
                    {editingSkill === index ? (
                      <div className="space-y-3">
                        <input
                          type="text"
                          defaultValue={skill.name}
                          className={`w-full px-3 py-2 rounded-lg border ${
                            isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-gray-200 text-gray-900'
                          }`}
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleUpdateSkill(index, 'name', e.currentTarget.value);
                            }
                            if (e.key === 'Escape') {
                              setEditingSkill(null);
                            }
                          }}
                          onBlur={(e) => handleUpdateSkill(index, 'name', e.target.value)}
                        />
                        <div className="flex items-center gap-3">
                          <label className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            {t('dashboard.profile.level', { level: skill.level })}
                          </label>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={skill.level}
                            onChange={(e) => handleUpdateSkill(index, 'level', parseInt(e.target.value))}
                            className="flex-1"
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => setEditingSkill(null)}>
                            <Check className="size-4 mr-2" />
                            Done
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => handleDeleteSkill(index)}>
                            <Trash2 className="size-4 mr-2" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <span 
                              className={`cursor-pointer ${isDark ? 'text-white' : 'text-gray-900'}`}
                              onClick={() => setEditingSkill(index)}
                            >
                              {skill.name}
                            </span>
                            <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{skill.level}%</span>
                          </div>
                          <div className={`h-2 rounded-full overflow-hidden ${isDark ? 'bg-white/10' : 'bg-gray-200'}`}>
                            <div 
                              className="h-full bg-gradient-to-r from-teal-500 to-cyan-500 transition-all duration-500"
                              style={{ width: `${skill.level}%` }}
                            />
                          </div>
                        </div>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="h-7 w-7 p-0"
                            onClick={() => setEditingSkill(index)}
                          >
                            <Edit2 className="size-3" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="h-7 w-7 p-0 text-red-500"
                            onClick={() => handleDeleteSkill(index)}
                          >
                            <Trash2 className="size-3" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )) : (
                  <div className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    <p>{t('dashboard.profile.noSkillsYet')}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Education & Certifications */}
            <div className={`rounded-2xl border p-6 ${
              isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'
            }`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-xl ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('dashboard.profile.educationAndCertifications')}</h3>
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={() => {
                    setShowAddEducation(!showAddEducation);
                    setShowAddSkill(false);
                  }}
                >
                  <Plus className="size-4 mr-2" />
                  {t('dashboard.profile.addEducation')}
                </Button>
              </div>

              {/* Add Education Form */}
              {showAddEducation && (
                <div className={`mb-4 p-4 rounded-lg border ${
                  isDark ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'
                }`}>
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder={t('dashboard.profile.degreePlaceholder')}
                      value={newEducation.degree}
                      onChange={(e) => setNewEducation({ ...newEducation, degree: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-gray-200 text-gray-900'
                      }`}
                      autoFocus
                    />
                    <input
                      type="text"
                      placeholder={t('dashboard.profile.institutionPlaceholder')}
                      value={newEducation.institution}
                      onChange={(e) => setNewEducation({ ...newEducation, institution: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-gray-200 text-gray-900'
                      }`}
                    />
                    <input
                      type="text"
                      placeholder={t('dashboard.profile.yearPlaceholder')}
                      value={newEducation.year}
                      onChange={(e) => setNewEducation({ ...newEducation, year: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-gray-200 text-gray-900'
                      }`}
                    />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={handleAddEducation}>
                        <Check className="size-4 mr-2" />
                        Add
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setShowAddEducation(false)}>
                        <X className="size-4 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                {education.length > 0 ? education.map((edu, index) => (
                  <div key={edu.id || index} className="group flex items-start gap-4">
                    {editingEducation === index ? (
                      <div className="flex-1 space-y-3">
                        <input
                          type="text"
                          defaultValue={edu.degree}
                          className={`w-full px-3 py-2 rounded-lg border ${
                            isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-gray-200 text-gray-900'
                          }`}
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleUpdateEducation(index, 'degree', e.currentTarget.value);
                            }
                            if (e.key === 'Escape') {
                              setEditingEducation(null);
                            }
                          }}
                          onBlur={(e) => handleUpdateEducation(index, 'degree', e.target.value)}
                        />
                        <input
                          type="text"
                          defaultValue={edu.institution}
                          className={`w-full px-3 py-2 rounded-lg border ${
                            isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-gray-200 text-gray-900'
                          }`}
                          onBlur={(e) => handleUpdateEducation(index, 'institution', e.target.value)}
                        />
                        <input
                          type="text"
                          defaultValue={edu.year}
                          className={`w-full px-3 py-2 rounded-lg border ${
                            isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-gray-200 text-gray-900'
                          }`}
                          onBlur={(e) => handleUpdateEducation(index, 'year', e.target.value)}
                        />
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => setEditingEducation(null)}>
                            <Check className="size-4 mr-2" />
                            Done
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => handleDeleteEducation(index)}>
                            <Trash2 className="size-4 mr-2" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${edu.logo} flex items-center justify-center text-white flex-shrink-0`}>
                          <Award className="size-6" />
                        </div>
                        <div className="flex-1">
                          <h4 
                            className={`cursor-pointer ${isDark ? 'text-white' : 'text-gray-900'}`}
                            onClick={() => setEditingEducation(index)}
                          >
                            {edu.degree}
                          </h4>
                          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{edu.institution}</p>
                          <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>{edu.year}</p>
                        </div>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="h-7 w-7 p-0"
                            onClick={() => setEditingEducation(index)}
                          >
                            <Edit2 className="size-3" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="h-7 w-7 p-0 text-red-500"
                            onClick={() => handleDeleteEducation(index)}
                          >
                            <Trash2 className="size-3" />
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                )) : (
                  <div className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    <p>{t('dashboard.profile.noEducationYet')}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Resume Gallery */}
            <div className={`rounded-2xl border p-6 ${
              isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'
            }`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-xl ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('dashboard.profile.resumeGallery')}</h3>
                <Button 
                  size="sm" 
                  className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white"
                  onClick={() => navigate('/app/resume-builder')}
                >
                  <Plus className="size-4 mr-2" />
                  {t('dashboard.profile.createResume')}
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {formattedResumes.length > 0 ? formattedResumes.map((resume) => (
                  <div key={resume.id} className={`p-4 rounded-xl border transition-all hover:scale-[1.02] cursor-pointer ${
                    isDark ? 'bg-white/5 border-white/10 hover:border-teal-500/50' : 'bg-gray-50 border-gray-200 hover:border-teal-500'
                  }`}>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <FileText className="size-5 text-teal-500" />
                        <div>
                          <h4 className={`text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>{resume.name}</h4>
                          <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>{resume.date}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-xs">
                        <span className={`px-2 py-1 rounded-full ${
                          resume.atsScore >= 90 ? 'bg-green-500/20 text-green-500' : 'bg-yellow-500/20 text-yellow-500'
                        }`}>
                          {t('dashboard.profile.atsScore', { score: resume.atsScore })}
                        </span>
                        <span className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          {t('dashboard.profile.downloads', { count: resume.downloads })}
                        </span>
                      </div>
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0">
                          <Eye className="size-3" />
                        </Button>
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0">
                          <Download className="size-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )) : (
                  <div className={`col-span-2 text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {resumesLoading ? (
                      <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                    ) : (
                      <p>{t('dashboard.profile.noResumesYet')}</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Interview Recordings */}
            <div className={`rounded-2xl border p-6 ${
              isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'
            }`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-xl ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('dashboard.profile.interviewRecordings')}</h3>
                <Button 
                  size="sm" 
                  className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white"
                  onClick={() => navigate('/app/interview-prep')}
                >
                  <Mic className="size-4 mr-2" />
                  {t('dashboard.profile.newInterview')}
                </Button>
              </div>
              <div className="space-y-3">
                {formattedInterviews.length > 0 ? formattedInterviews.map((interview) => (
                  <div key={interview.id} className={`p-4 rounded-xl border transition-all hover:scale-[1.01] cursor-pointer ${
                    isDark ? 'bg-white/5 border-white/10 hover:border-blue-500/50' : 'bg-gray-50 border-gray-200 hover:border-blue-500'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
                          <Play className="size-5 text-white" />
                        </div>
                        <div>
                          <h4 className={`${isDark ? 'text-white' : 'text-gray-900'}`}>{interview.role}</h4>
                          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            {interview.company} • {interview.date}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{interview.duration}</div>
                          <div className={`px-2 py-1 rounded-full text-xs ${
                            interview.score >= 90 ? 'bg-green-500/20 text-green-500' : 'bg-blue-500/20 text-blue-500'
                          }`}>
                            {t('dashboard.profile.score', { score: interview.score })}
                          </div>
                        </div>
                        <Button size="sm" variant="ghost">
                          <Play className="size-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )) : (
                  <div className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {interviewsLoading ? (
                      <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                    ) : (
                      <p>{t('dashboard.profile.noInterviewsYet')}</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Skill Test Results */}
            <div className={`rounded-2xl border p-6 ${
              isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'
            }`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-xl ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('dashboard.profile.skillTestResults')}</h3>
                <Button 
                  size="sm" 
                  className="bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                  onClick={() => navigate('/app/skill-gap')}
                >
                  <TrendingUp className="size-4 mr-2" />
                  {t('dashboard.profile.takeTest')}
                </Button>
              </div>
              <div className="space-y-3">
                {loadingSkillGaps ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-purple-500" />
                  </div>
                ) : skillGapResults.length > 0 ? (
                  skillGapResults.map((test) => (
                    <div key={test.id} className={`p-4 rounded-xl border ${
                      isDark ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className={`${isDark ? 'text-white' : 'text-gray-900'}`}>{test.skill}</h4>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                              test.percentile >= 95 ? 'bg-purple-500/20 text-purple-500' : 
                              test.percentile >= 85 ? 'bg-blue-500/20 text-blue-500' :
                              'bg-yellow-500/20 text-yellow-500'
                            }`}>
                              {t('dashboard.profile.topPercent', { percent: 100 - test.percentile })}
                            </span>
                          </div>
                          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{test.date}</p>
                        </div>
                        <div className="text-right">
                          <div className={`text-2xl bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent`}>
                            {test.score}
                          </div>
                          <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>{t('dashboard.profile.scoreLabel')}</div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    <p>{t('dashboard.profile.noSkillTestsYet')}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="col-span-4 space-y-6">
            {/* Profile Strength Card with Estel */}
            <div className={`rounded-2xl border p-6 sticky top-24 ${
              isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'
            }`}>
              <h3 className={`text-lg mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('dashboard.profile.profileStrength')}</h3>
              
              {/* Circular Progress with Estel */}
              <div className="relative flex items-center justify-center mb-6">
                <svg className="transform -rotate-90" width="160" height="160">
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    className={isDark ? 'text-white/10' : 'text-gray-200'}
                  />
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    stroke="url(#gradient)"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 70}`}
                    strokeDashoffset={`${2 * Math.PI * 70 * (1 - profileCompletion / 100)}`}
                    strokeLinecap="round"
                    className="transition-all duration-1000"
                  />
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#14b8a6" />
                      <stop offset="100%" stopColor="#06b6d4" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className={`text-4xl ${isDark ? 'text-white' : 'text-gray-900'}`}>{profileCompletion}%</div>
                    <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('dashboard.profile.complete')}</div>
                  </div>
                </div>
              </div>

              {/* Estel Mascot */}
              <div className="flex justify-center mb-4 -mt-2">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center">
                    <span className="text-3xl">🐘</span>
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center">
                    <Star className="size-3 text-white" />
                  </div>
                </div>
              </div>

              {/* Checklist */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  {profilePic ? (
                    <Check className="size-4 text-green-500" />
                  ) : (
                    <div className={`size-4 rounded border ${isDark ? 'border-white/20' : 'border-gray-300'}`}></div>
                  )}
                  <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('dashboard.profile.profilePhotoAdded')}</span>
                </div>
                <div className="flex items-center gap-2">
                  {profileData.bio && profileData.bio.trim().length > 0 ? (
                    <Check className="size-4 text-green-500" />
                  ) : (
                    <div className={`size-4 rounded border ${isDark ? 'border-white/20' : 'border-gray-300'}`}></div>
                  )}
                  <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('dashboard.profile.bioCompleted')}</span>
                </div>
                <div className="flex items-center gap-2">
                  {skills.length > 0 ? (
                    <Check className="size-4 text-green-500" />
                  ) : (
                    <div className={`size-4 rounded border ${isDark ? 'border-white/20' : 'border-gray-300'}`}></div>
                  )}
                  <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {t('dashboard.profile.skillsAdded', { count: skills.length })}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`size-4 rounded border ${isDark ? 'border-white/20' : 'border-gray-300'}`}></div>
                  <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('dashboard.profile.addMoreProjects')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`size-4 rounded border ${isDark ? 'border-white/20' : 'border-gray-300'}`}></div>
                  <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('dashboard.profile.uploadCertificate')}</span>
                </div>
                <div className="flex items-center gap-2">
                  {profileData.linkedin && profileData.linkedin.trim().length > 0 ? (
                    <Check className="size-4 text-green-500" />
                  ) : (
                    <div className={`size-4 rounded border ${isDark ? 'border-white/20' : 'border-gray-300'}`}></div>
                  )}
                  <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('dashboard.profile.connectLinkedInChecklist')}</span>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className={`rounded-2xl border p-6 ${
              isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'
            }`}>
              <h3 className={`text-lg mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('dashboard.profile.quickStats')}</h3>
              <div className="space-y-4">
                <div className={`p-3 rounded-lg ${isDark ? 'bg-teal-500/10' : 'bg-teal-50'}`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('dashboard.profile.resumes')}</span>
                    <FileText className="size-4 text-teal-500" />
                  </div>
                  <div className={`text-2xl ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {statsLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : stats?.resumesCreated || 0}
                  </div>
                </div>
                <div className={`p-3 rounded-lg ${isDark ? 'bg-purple-500/10' : 'bg-purple-50'}`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('dashboard.profile.aiSessions')}</span>
                    <Brain className="size-4 text-purple-500" />
                  </div>
                  <div className={`text-2xl ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {statsLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : stats?.aiSessionsCompleted || 0}
                  </div>
                </div>
                <div className={`p-3 rounded-lg ${isDark ? 'bg-blue-500/10' : 'bg-blue-50'}`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('dashboard.profile.interviews')}</span>
                    <Mic className="size-4 text-blue-500" />
                  </div>
                  <div className={`text-2xl ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {statsLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : stats?.interviewsCompleted || 0}
                  </div>
                </div>
                <div className={`p-3 rounded-lg ${isDark ? 'bg-green-500/10' : 'bg-green-50'}`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('dashboard.profile.profileComplete')}</span>
                    <TrendingUp className="size-4 text-green-500" />
                  </div>
                  <div className={`text-2xl ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {statsLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : `${stats?.profileCompleteness || 0}%`}
                  </div>
                </div>
              </div>
            </div>

            {/* Achievements & Badges with Estel */}
            <div className={`rounded-2xl border p-6 ${
              isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'
            }`}>
              <h3 className={`text-lg mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('dashboard.profile.achievements')}</h3>
              
              {/* Estel celebrating */}
              <div className="flex justify-center mb-4">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
                    <span className="text-2xl">🐘</span>
                  </div>
                  <div className="absolute -top-1 -right-1">
                    <span className="text-2xl animate-bounce">🎉</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {achievements.map((achievement) => {
                  const Icon = achievement.icon;
                  return (
                    <div
                      key={achievement.id}
                      className={`p-3 rounded-xl border text-center transition-all hover:scale-105 ${
                        achievement.unlocked
                          ? isDark
                            ? 'bg-gradient-to-br from-teal-500/20 to-cyan-500/20 border-teal-500/30'
                            : 'bg-gradient-to-br from-teal-50 to-cyan-50 border-teal-200'
                          : isDark
                          ? 'bg-white/5 border-white/10 opacity-50'
                          : 'bg-gray-50 border-gray-200 opacity-50'
                      }`}
                    >
                      {achievement.unlocked ? (
                        <Icon className="size-6 mx-auto mb-2 text-teal-500" />
                      ) : (
                        <Lock className="size-6 mx-auto mb-2 text-gray-400" />
                      )}
                      <p className={`text-xs ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {achievement.name}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recent Activity */}
            <div className={`rounded-2xl border p-6 ${
              isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'
            }`}>
              <h3 className={`text-lg mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('dashboard.profile.recentActivity')}</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-teal-500 mt-2"></div>
                  <div className="flex-1">
                    <p className={`text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {t('dashboard.profile.updatedResume')}
                    </p>
                    <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-purple-500 mt-2"></div>
                  <div className="flex-1">
                    <p className={`text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {t('dashboard.profile.completedAICoaching')}
                    </p>
                    <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>5 hours ago</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
                  <div className="flex-1">
                    <p className={`text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {t('dashboard.profile.practicedInterview')}
                    </p>
                    <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>1 day ago</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-green-500 mt-2"></div>
                  <div className="flex-1">
                    <p className={`text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {t('dashboard.profile.earnedBadge', { badge: t('dashboard.profile.achievementsList.interviewMaster.name') })}
                    </p>
                    <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>2 days ago</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
