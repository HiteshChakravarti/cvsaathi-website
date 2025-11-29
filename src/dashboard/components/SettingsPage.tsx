import * as React from "react";
import { useState, useRef, useEffect } from "react";
import {
  ArrowLeft,
  User,
  Bell,
  Lock,
  Palette,
  CreditCard,
  Globe,
  Shield,
  Settings,
  Zap,
  Link2,
  Download,
  Trash2,
  ChevronRight,
  Check,
  X,
  Moon,
  Sun,
  Monitor,
  Eye,
  Key,
  Smartphone,
  Clock,
  Database,
  HardDrive,
  RefreshCw,
  AlertTriangle,
  Upload,
  FileText,
  Loader2,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { EdgeFunctionTest } from "../../components/EdgeFunctionTest";
import { AIServicesTest } from "../../components/AIServicesTest";
import { useUserProfile } from "../../hooks/useUserProfile";
import { useUserPreferences } from "../../hooks/useUserPreferences";
import { useAuth } from "../../contexts/AuthContext";
import { supabase } from "../../lib/supabaseClient";
import { useTranslation } from "react-i18next";

interface SettingsPageProps {
  isDark: boolean;
  onBack: () => void;
  onThemeChange?: (isDark: boolean) => void;
}

type SettingsTab =
  | "profile"
  | "account"
  | "notifications"
  | "appearance"
  | "subscription"
  | "privacy"
  | "integrations"
  | "preferences"
  | "advanced";

export function SettingsPage({ isDark, onBack, onThemeChange }: SettingsPageProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { profile, loading: profileLoading, updateProfile } = useUserProfile();
  const { preferences, loading: preferencesLoading, updatePreferences } = useUserPreferences();
  
  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");
  const [saving, setSaving] = useState(false);
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Profile form state
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    bio: '',
  });

  // Notification preferences state
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(false);
  const [jobAlerts, setJobAlerts] = useState(true);

  // Privacy preferences state
  const [analyticsTracking, setAnalyticsTracking] = useState(true);
  const [dataSharing, setDataSharing] = useState(false);
  const [personalizedRecommendations, setPersonalizedRecommendations] = useState(true);
  const [thirdPartySharing, setThirdPartySharing] = useState(false);

  // Appearance state
  const [themeMode, setThemeMode] = useState<"light" | "dark" | "auto">("light");
  const [language, setLanguage] = useState("en");

  // Account state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  // Load profile picture from localStorage
  useEffect(() => {
    if (user?.id) {
      const savedPic = localStorage.getItem(`profile_pic_${user.id}`);
      if (savedPic) {
        setProfilePic(savedPic);
      }
    }
  }, [user?.id]);

  // Load profile data when profile is fetched
  useEffect(() => {
    if (profile) {
      setProfileData({
        firstName: profile.first_name || '',
        lastName: profile.last_name || '',
        email: profile.email || user?.email || '',
        phone: profile.phone || '',
        bio: profile.bio || '',
      });
    }
  }, [profile, user?.email]);

  // Load preferences when fetched
  useEffect(() => {
    if (preferences) {
      setEmailNotifications(preferences.email_notifications ?? true);
      setPushNotifications(preferences.push_notifications ?? true);
      setAnalyticsTracking(preferences.analytics_tracking ?? true);
      setDataSharing(preferences.data_sharing ?? false);
      setTwoFactorEnabled(preferences.two_factor_enabled ?? false);
    }
  }, [preferences]);

  const tabs = [
    { id: "profile" as SettingsTab, name: t('dashboard.settings.tabs.profile'), icon: User },
    { id: "account" as SettingsTab, name: t('dashboard.settings.tabs.account'), icon: Settings },
    { id: "notifications" as SettingsTab, name: t('dashboard.settings.tabs.notifications'), icon: Bell },
    // Appearance tab hidden
    { id: "subscription" as SettingsTab, name: t('dashboard.settings.tabs.subscription'), icon: CreditCard },
    { id: "privacy" as SettingsTab, name: t('dashboard.settings.tabs.privacy'), icon: Shield },
    { id: "integrations" as SettingsTab, name: t('dashboard.settings.tabs.integrations'), icon: Link2 },
    // Preferences (Job Preferences) tab hidden
    { id: "advanced" as SettingsTab, name: t('dashboard.settings.tabs.advanced'), icon: AlertTriangle },
  ];

  // Handle profile picture upload (frontend only - localStorage)
  const handleProfilePicUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      if (user?.id) {
        localStorage.setItem(`profile_pic_${user.id}`, base64String);
        setProfilePic(base64String);
        toast.success(t('dashboard.settings.profilePicUpdated'));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveProfilePic = () => {
    if (user?.id) {
      localStorage.removeItem(`profile_pic_${user.id}`);
      setProfilePic(null);
      toast.success("Profile picture removed!");
    }
  };

  // Save all settings to backend
  const handleSave = async () => {
    if (!user?.id) {
      toast.error(t('dashboard.settings.pleaseLogin'));
      return;
    }

    setSaving(true);
    try {
      // Save profile data
      await updateProfile({
        first_name: profileData.firstName,
        last_name: profileData.lastName,
        phone: profileData.phone,
        bio: profileData.bio,
      });

      // Save preferences
      await updatePreferences({
        email_notifications: emailNotifications,
        push_notifications: pushNotifications,
        analytics_tracking: analyticsTracking,
        data_sharing: dataSharing,
        two_factor_enabled: twoFactorEnabled,
      });

      // Save password if changed
      if (newPassword && newPassword.length > 0) {
        if (newPassword !== confirmPassword) {
          toast.error(t('dashboard.settings.passwordMismatch'));
        setSaving(false);
        return;
      }
      if (newPassword.length < 6) {
        toast.error(t('dashboard.settings.passwordTooShort'));
        setSaving(false);
        return;
      }
      
      const { error: passwordError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (passwordError) {
        toast.error(t('dashboard.settings.passwordUpdateFailed', { error: passwordError.message }));
      } else {
        toast.success(t('dashboard.settings.passwordUpdated'));
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    }

    toast.success(t('dashboard.settings.savedSuccessfully'));
  } catch (error: any) {
    console.error("Error saving settings:", error);
    toast.error(t('dashboard.settings.saveFailed', { error: error?.message || t('dashboard.settings.unknownError') }));
    } finally {
      setSaving(false);
    }
  };

  const handleThemeChange = (mode: "light" | "dark" | "auto") => {
    setThemeMode(mode);
    if (mode === "auto") {
      onThemeChange?.(false);
    } else {
      onThemeChange?.(mode === "dark");
    }
    toast.success(t('dashboard.settings.themeChanged', { mode }));
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-500 ${
        isDark ? "bg-slate-900" : "bg-gradient-to-br from-gray-50 via-teal-50/30 to-gray-50"
      }`}
    >
      <header
        className={`border-b transition-colors duration-500 ${
          isDark
            ? "border-white/10 bg-slate-900/80 backdrop-blur-xl"
            : "border-gray-200 bg-white/80 backdrop-blur-xl"
        }`}
      >
        <div className="px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={onBack}
                className={`p-2 rounded-xl transition-all duration-300 ${
                  isDark ? "hover:bg-white/5" : "hover:bg-gray-100"
                }`}
              >
                <ArrowLeft className={`size-5 ${isDark ? "text-white" : "text-gray-900"}`} />
              </button>
              <div>
                <h1 className={`text-3xl ${isDark ? "text-white" : "text-gray-900"}`}>{t('dashboard.settings.title')}</h1>
                <p className={`text-sm mt-1 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                  {t('dashboard.settings.description')}
                </p>
              </div>
            </div>
            <Button
              onClick={handleSave}
              disabled={saving || profileLoading || preferencesLoading}
              className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white"
            >
              {saving ? (
                <>
                  <Loader2 className="size-4 mr-2 animate-spin" />
                  {t('dashboard.settings.saving')}
                </>
              ) : (
                t('dashboard.settings.saveChanges')
              )}
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        <aside
          className={`w-80 border-r min-h-screen ${
            isDark ? "border-white/10 bg-slate-900/50" : "border-gray-200 bg-white/50"
          }`}
        >
          <div className="p-6">
            <nav className="space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                      activeTab === tab.id
                        ? isDark
                          ? "bg-teal-500/20 text-teal-400 border border-teal-500/30"
                          : "bg-teal-50 text-teal-600 border border-teal-200"
                        : isDark
                          ? "text-gray-400 hover:bg-white/5 hover:text-white"
                          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                    }`}
                  >
                    <Icon className="size-5" />
                    <span className="flex-1 text-left">{tab.name}</span>
                    <ChevronRight
                      className={`size-4 transition-transform ${activeTab === tab.id ? "rotate-90" : ""}`}
                    />
                  </button>
                );
              })}
            </nav>
          </div>
        </aside>

        <main className="flex-1 p-8">
          <div className="max-w-3xl">
            {activeTab === "profile" && (
              <div className="space-y-6 animate-in slide-in-from-right duration-300">
                {profileLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-teal-500" />
                  </div>
                ) : (
                  <>
                    <div>
                      <h2 className={`text-2xl mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>
                        {t('dashboard.settings.profile.title')}
                      </h2>
                      <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                        {t('dashboard.settings.profile.description')}
                      </p>
                    </div>

                    <div
                      className={`p-6 rounded-2xl border ${
                        isDark ? "bg-white/5 border-white/10" : "bg-white border-gray-200"
                      }`}
                    >
                      <label className={`block mb-4 ${isDark ? "text-white" : "text-gray-900"}`}>
                        {t('dashboard.settings.profile.profilePicture')}
                      </label>
                      <div className="flex items-center gap-6">
                        <div className="relative">
                          {profilePic ? (
                            <img
                              src={profilePic}
                              alt="Profile"
                              className="w-24 h-24 rounded-full object-cover border-2 border-teal-500"
                            />
                          ) : (
                            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center text-white text-2xl font-bold">
                              {profileData.firstName?.[0]?.toUpperCase() || profileData.lastName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
                            </div>
                          )}
                        </div>
                        <div className="flex gap-3">
                          <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleProfilePicUpload}
                            accept="image/*"
                            className="hidden"
                          />
                          <Button
                            variant="outline"
                            className={isDark ? "border-white/10" : ""}
                            onClick={() => fileInputRef.current?.click()}
                          >
                            <Upload className="size-4 mr-2" />
                            {t('dashboard.settings.profile.uploadPhoto')}
                          </Button>
                          {profilePic && (
                            <Button
                              variant="outline"
                              className={`${isDark ? "border-white/10 text-red-400" : "text-red-600"}`}
                              onClick={handleRemoveProfilePic}
                            >
                              <Trash2 className="size-4 mr-2" />
                              {t('dashboard.settings.profile.remove')}
                            </Button>
                          )}
                        </div>
                      </div>
                      <p className={`text-xs mt-2 ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                        {t('dashboard.settings.profile.profilePicStoredLocally')}
                      </p>
                    </div>

                    <div
                      className={`p-6 rounded-2xl border ${
                        isDark ? "bg-white/5 border-white/10" : "bg-white border-gray-200"
                      }`}
                    >
                      <h3 className={`mb-4 ${isDark ? "text-white" : "text-gray-900"}`}>
                        {t('dashboard.settings.profile.personalInformation')}
                      </h3>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className={`block text-sm mb-2 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                              {t('dashboard.settings.profile.firstName')}
                            </label>
                            <input
                              type="text"
                              value={profileData.firstName}
                              onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                              className={`w-full px-4 py-2 rounded-lg border transition-colors ${
                                isDark
                                  ? "bg-white/5 border-white/10 text-white"
                                  : "bg-white border-gray-200 text-gray-900"
                              }`}
                            />
                          </div>
                          <div>
                            <label className={`block text-sm mb-2 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                              {t('dashboard.settings.profile.lastName')}
                            </label>
                            <input
                              type="text"
                              value={profileData.lastName}
                              onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                              className={`w-full px-4 py-2 rounded-lg border transition-colors ${
                                isDark
                                  ? "bg-white/5 border-white/10 text-white"
                                  : "bg-white border-gray-200 text-gray-900"
                              }`}
                            />
                          </div>
                        </div>
                        <div>
                          <label className={`block text-sm mb-2 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                            {t('dashboard.settings.profile.emailAddress')}
                          </label>
                          <input
                            type="email"
                            value={profileData.email}
                            disabled
                            className={`w-full px-4 py-2 rounded-lg border transition-colors ${
                              isDark
                                ? "bg-white/5 border-white/10 text-gray-500"
                                : "bg-gray-50 border-gray-200 text-gray-500"
                            }`}
                          />
                          <p className={`text-xs mt-1 ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                            {t('dashboard.settings.profile.emailCannotBeChanged')}
                          </p>
                        </div>
                        <div>
                          <label className={`block text-sm mb-2 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                            {t('dashboard.settings.profile.phoneNumber')}
                          </label>
                          <input
                            type="tel"
                            value={profileData.phone}
                            onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                            className={`w-full px-4 py-2 rounded-lg border transition-colors ${
                              isDark
                                ? "bg-white/5 border-white/10 text-white"
                                : "bg-white border-gray-200 text-gray-900"
                            }`}
                          />
                        </div>
                        <div>
                          <label className={`block text-sm mb-2 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                            {t('dashboard.settings.profile.bio')}
                          </label>
                          <textarea
                            rows={4}
                            value={profileData.bio}
                            onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                            className={`w-full px-4 py-2 rounded-lg border transition-colors ${
                              isDark
                                ? "bg-white/5 border-white/10 text-white"
                                : "bg-white border-gray-200 text-gray-900"
                            }`}
                            placeholder={t('dashboard.settings.profile.bioPlaceholder')}
                          />
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {activeTab === "account" && (
              <div className="space-y-6 animate-in slide-in-from-right duration-300">
                <div>
                  <h2 className={`text-2xl mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>
                    {t('dashboard.settings.account.title')}
                  </h2>
                  <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                    {t('dashboard.settings.account.description')}
                  </p>
                </div>

                <div
                  className={`p-6 rounded-2xl border ${
                    isDark ? "bg-white/5 border-white/10" : "bg-white border-gray-200"
                  }`}
                >
                  <h3 className={`mb-4 ${isDark ? "text-white" : "text-gray-900"}`}>
                    {t('dashboard.settings.account.changePassword')}
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className={`block text-sm mb-2 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                        {t('dashboard.settings.account.newPassword')}
                      </label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder={t('dashboard.settings.account.newPasswordPlaceholder')}
                        className={`w-full px-4 py-2 rounded-lg border transition-colors ${
                          isDark
                            ? "bg-white/5 border-white/10 text-white"
                            : "bg-white border-gray-200 text-gray-900"
                        }`}
                      />
                    </div>
                    {newPassword && (
                      <div>
                        <label className={`block text-sm mb-2 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                          {t('dashboard.settings.account.confirmNewPassword')}
                        </label>
                        <input
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className={`w-full px-4 py-2 rounded-lg border transition-colors ${
                            isDark
                              ? "bg-white/5 border-white/10 text-white"
                              : "bg-white border-gray-200 text-gray-900"
                          }`}
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div
                  className={`p-6 rounded-2xl border ${
                    isDark ? "bg-white/5 border-white/10" : "bg-white border-gray-200"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className={`mb-1 ${isDark ? "text-white" : "text-gray-900"}`}>
                        {t('dashboard.settings.account.twoFactorAuth')}
                      </h3>
                      <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                        {t('dashboard.settings.account.twoFactorDescription')}
                      </p>
                    </div>
                    <button
                      onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
                      className={`relative w-12 h-6 rounded-full transition-colors ${
                        twoFactorEnabled
                          ? "bg-gradient-to-r from-teal-500 to-cyan-500"
                          : isDark
                          ? "bg-white/10"
                          : "bg-gray-200"
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                          twoFactorEnabled ? "translate-x-6" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>
                </div>

                <div
                  className={`p-6 rounded-2xl border ${
                    isDark ? "bg-red-500/10 border-red-500/30" : "bg-red-50 border-red-200"
                  }`}
                >
                  <h3 className={`mb-4 ${isDark ? "text-red-400" : "text-red-600"}`}>{t('dashboard.settings.account.dangerZone')}</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className={isDark ? "text-white" : "text-gray-900"}>{t('dashboard.settings.account.deleteAccount')}</p>
                        <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                          {t('dashboard.settings.account.deleteAccountDescription')}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                      >
                        <Trash2 className="size-4 mr-2" />
                        {t('dashboard.settings.account.delete')}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "notifications" && (
              <div className="space-y-6 animate-in slide-in-from-right duration-300">
                <div>
                  <h2 className={`text-2xl mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>
                    {t('dashboard.settings.notifications.title')}
                  </h2>
                  <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                    {t('dashboard.settings.notifications.description')}
                  </p>
                </div>

                <div
                  className={`p-6 rounded-2xl border ${
                    isDark ? "bg-white/5 border-white/10" : "bg-white border-gray-200"
                  }`}
                >
                  <h3 className={`mb-4 ${isDark ? "text-white" : "text-gray-900"}`}>
                    {t('dashboard.settings.notifications.emailNotifications')}
                  </h3>
                  <div className="space-y-4">
                    <label className="flex items-center justify-between cursor-pointer">
                      <div>
                        <span className={isDark ? "text-white" : "text-gray-900"}>{t('dashboard.settings.notifications.emailNotifications')}</span>
                        <p className={`text-xs mt-1 ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                          {t('dashboard.settings.notifications.emailNotificationsDescription')}
                        </p>
                      </div>
                      <button
                        onClick={() => setEmailNotifications(!emailNotifications)}
                        className={`relative w-12 h-6 rounded-full transition-colors ${
                          emailNotifications
                            ? "bg-gradient-to-r from-teal-500 to-cyan-500"
                            : isDark
                            ? "bg-white/10"
                            : "bg-gray-200"
                        }`}
                      >
                        <span
                          className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                            emailNotifications ? "translate-x-6" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </label>
                    <label className="flex items-center justify-between cursor-pointer">
                      <div>
                        <span className={isDark ? "text-white" : "text-gray-900"}>{t('dashboard.settings.notifications.jobAlerts')}</span>
                        <p className={`text-xs mt-1 ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                          {t('dashboard.settings.notifications.jobAlertsDescription')}
                        </p>
                      </div>
                      <button
                        onClick={() => setJobAlerts(!jobAlerts)}
                        className={`relative w-12 h-6 rounded-full transition-colors ${
                          jobAlerts
                            ? "bg-gradient-to-r from-teal-500 to-cyan-500"
                            : isDark
                            ? "bg-white/10"
                            : "bg-gray-200"
                        }`}
                      >
                        <span
                          className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                            jobAlerts ? "translate-x-6" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </label>
                    <label className="flex items-center justify-between cursor-pointer">
                      <div>
                        <span className={isDark ? "text-white" : "text-gray-900"}>{t('dashboard.settings.notifications.weeklyDigest')}</span>
                        <p className={`text-xs mt-1 ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                          {t('dashboard.settings.notifications.weeklyDigestDescription')}
                        </p>
                      </div>
                      <button
                        onClick={() => setWeeklyDigest(!weeklyDigest)}
                        className={`relative w-12 h-6 rounded-full transition-colors ${
                          weeklyDigest
                            ? "bg-gradient-to-r from-teal-500 to-cyan-500"
                            : isDark
                            ? "bg-white/10"
                            : "bg-gray-200"
                        }`}
                      >
                        <span
                          className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                            weeklyDigest ? "translate-x-6" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </label>
                  </div>
                </div>

                <div
                  className={`p-6 rounded-2xl border ${
                    isDark ? "bg-white/5 border-white/10" : "bg-white border-gray-200"
                  }`}
                >
                  <h3 className={`mb-4 ${isDark ? "text-white" : "text-gray-900"}`}>
                    {t('dashboard.settings.notifications.pushNotifications')}
                  </h3>
                  <label className="flex items-center justify-between cursor-pointer">
                    <div>
                      <span className={isDark ? "text-white" : "text-gray-900"}>{t('dashboard.settings.notifications.pushNotifications')}</span>
                      <p className={`text-xs mt-1 ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                        {t('dashboard.settings.notifications.pushNotificationsDescription')}
                      </p>
                    </div>
                    <button
                      onClick={() => setPushNotifications(!pushNotifications)}
                      className={`relative w-12 h-6 rounded-full transition-colors ${
                        pushNotifications
                          ? "bg-gradient-to-r from-teal-500 to-cyan-500"
                          : isDark
                          ? "bg-white/10"
                          : "bg-gray-200"
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                          pushNotifications ? "translate-x-6" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </label>
                </div>
              </div>
            )}

            {activeTab === "appearance" && (
              <div className="space-y-6 animate-in slide-in-from-right duration-300">
                <div>
                  <h2 className={`text-2xl mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>
                    {t('dashboard.settings.appearance.title')}
                  </h2>
                  <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                    {t('dashboard.settings.appearance.description')}
                  </p>
                </div>

                <div
                  className={`p-6 rounded-2xl border ${
                    isDark ? "bg-white/5 border-white/10" : "bg-white border-gray-200"
                  }`}
                >
                  <h3 className={`mb-4 ${isDark ? "text-white" : "text-gray-900"}`}>{t('dashboard.settings.appearance.theme')}</h3>
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { mode: "light" as const, icon: Sun, label: t('dashboard.settings.appearance.light') },
                      { mode: "dark" as const, icon: Moon, label: t('dashboard.settings.appearance.dark') },
                      { mode: "auto" as const, icon: Monitor, label: t('dashboard.settings.appearance.auto') },
                    ].map((theme) => {
                      const Icon = theme.icon;
                      return (
                        <button
                          key={theme.mode}
                          onClick={() => handleThemeChange(theme.mode)}
                          className={`p-4 rounded-xl border-2 transition-all ${
                            themeMode === theme.mode
                              ? "border-teal-500 bg-teal-500/10"
                              : isDark
                              ? "border-white/10 hover:border-white/20"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <Icon
                            className={`size-8 mx-auto mb-2 ${
                              themeMode === theme.mode
                                ? "text-teal-500"
                                : isDark
                                ? "text-gray-400"
                                : "text-gray-600"
                            }`}
                          />
                          <p
                            className={`text-sm ${
                              themeMode === theme.mode
                                ? "text-teal-500"
                                : isDark
                                ? "text-white"
                                : "text-gray-900"
                            }`}
                          >
                            {theme.label}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div
                  className={`p-6 rounded-2xl border ${
                    isDark ? "bg-white/5 border-white/10" : "bg-white border-gray-200"
                  }`}
                >
                  <h3 className={`mb-4 ${isDark ? "text-white" : "text-gray-900"}`}>{t('dashboard.settings.appearance.language')}</h3>
                  <select
                    className={`w-full px-4 py-2 rounded-lg border ${
                      isDark
                        ? "bg-white/5 border-white/10 text-white"
                        : "bg-white border-gray-200 text-gray-900"
                    }`}
                  >
                    <option>{t('dashboard.settings.appearance.englishUS')}</option>
                    <option>{t('dashboard.settings.appearance.spanish')}</option>
                    <option>{t('dashboard.settings.appearance.french')}</option>
                    <option>{t('dashboard.settings.appearance.german')}</option>
                  </select>
                </div>
              </div>
            )}

            {activeTab === "subscription" && (
              <div className="space-y-6 animate-in slide-in-from-right duration-300">
                <div>
                  <h2 className={`text-2xl mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>
                    {t('dashboard.settings.subscription.title')}
                  </h2>
                  <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                    {t('dashboard.settings.subscription.description')}
                  </p>
                </div>

                <div
                  className={`p-6 rounded-2xl border bg-gradient-to-br from-teal-500/10 to-cyan-500/10 ${
                    isDark ? "border-teal-500/30" : "border-teal-200"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className={`text-xl mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>
                        {t('dashboard.settings.subscription.freePlan')}
                      </h3>
                      <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                        {t('dashboard.settings.subscription.currentlyOnFreePlan')}
                      </p>
                    </div>
                    <Button
                      onClick={() => navigate("/app/pricing")}
                      className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white"
                    >
                      {t('dashboard.settings.subscription.upgradeToPro')}
                    </Button>
                  </div>
                </div>

              </div>
            )}

            {activeTab === "privacy" && (
              <div className="space-y-6 animate-in slide-in-from-right duration-300">
                <div>
                  <h2 className={`text-2xl mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>
                    {t('dashboard.settings.privacy.title')}
                  </h2>
                  <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                    {t('dashboard.settings.privacy.description')}
                  </p>
                </div>

                <div
                  className={`p-6 rounded-2xl border ${
                    isDark ? "bg-white/5 border-white/10" : "bg-white border-gray-200"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center`}
                      >
                        <Eye className="size-5 text-white" />
                      </div>
                      <div>
                        <h3 className={`${isDark ? "text-white" : "text-gray-900"}`}>{t('dashboard.settings.privacy.activityLog')}</h3>
                        <p className={`text-sm mt-1 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                          {t('dashboard.settings.privacy.activityLogDescription')}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${isDark ? "bg-white/10 text-gray-300" : "bg-gray-100 text-gray-700"}`}
                    >
                      {t('dashboard.settings.privacy.planned')}
                    </span>
                  </div>
                </div>

                <div
                  className={`p-6 rounded-2xl border ${
                    isDark ? "bg-white/5 border-white/10" : "bg-white border-gray-200"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center`}
                      >
                        <Smartphone className="size-5 text-white" />
                      </div>
                      <div>
                        <h3 className={`${isDark ? "text-white" : "text-gray-900"}`}>{t('dashboard.settings.privacy.connectedDevices')}</h3>
                        <p className={`text-sm mt-1 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                          {t('dashboard.settings.privacy.connectedDevicesDescription')}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${isDark ? "bg-white/10 text-gray-300" : "bg-gray-100 text-gray-700"}`}
                    >
                      {t('dashboard.settings.privacy.planned')}
                    </span>
                  </div>
                </div>

                <div
                  className={`p-6 rounded-2xl border ${
                    isDark ? "bg-white/5 border-white/10" : "bg-white border-gray-200"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center`}
                      >
                        <Shield className="size-5 text-white" />
                      </div>
                      <div>
                        <h3 className={`${isDark ? "text-white" : "text-gray-900"}`}>{t('dashboard.settings.privacy.activeSessions')}</h3>
                        <p className={`text-sm mt-1 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                          {t('dashboard.settings.privacy.activeSessionsDescription')}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${isDark ? "bg-white/10 text-gray-300" : "bg-gray-100 text-gray-700"}`}
                    >
                      {t('dashboard.settings.privacy.planned')}
                    </span>
                  </div>
                </div>

                <div
                  className={`p-6 rounded-2xl border ${
                    isDark ? "bg-white/5 border-white/10" : "bg-white border-gray-200"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-blue-500 flex items-center justify-center`}
                      >
                        <Clock className="size-5 text-white" />
                      </div>
                      <div>
                        <h3 className={`${isDark ? "text-white" : "text-gray-900"}`}>{t('dashboard.settings.privacy.loginHistory')}</h3>
                        <p className={`text-sm mt-1 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                          {t('dashboard.settings.privacy.loginHistoryDescription')}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${isDark ? "bg-white/10 text-gray-300" : "bg-gray-100 text-gray-700"}`}
                    >
                      {t('dashboard.settings.privacy.planned')}
                    </span>
                  </div>
                </div>

                <div
                  className={`p-6 rounded-2xl border ${
                    isDark ? "bg-white/5 border-white/10" : "bg-white border-gray-200"
                  }`}
                >
                  <h3 className={`mb-4 ${isDark ? "text-white" : "text-gray-900"}`}>{t('dashboard.settings.privacy.dataPrivacyControls')}</h3>
                  <div className="space-y-4">
                    <label className="flex items-center justify-between cursor-pointer">
                      <div>
                        <span className={isDark ? "text-white" : "text-gray-900"}>{t('dashboard.settings.privacy.allowAnalyticsTracking')}</span>
                        <p className={`text-xs mt-1 ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                          {t('dashboard.settings.privacy.analyticsTrackingDescription')}
                        </p>
                      </div>
                      <button
                        onClick={() => setAnalyticsTracking(!analyticsTracking)}
                        className={`relative w-12 h-6 rounded-full transition-colors ${
                          analyticsTracking
                            ? "bg-gradient-to-r from-teal-500 to-cyan-500"
                            : isDark
                            ? "bg-white/10"
                            : "bg-gray-200"
                        }`}
                      >
                        <span
                          className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                            analyticsTracking ? "translate-x-6" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </label>
                    <label className="flex items-center justify-between cursor-pointer">
                      <div>
                        <span className={isDark ? "text-white" : "text-gray-900"}>{t('dashboard.settings.privacy.shareAnonymizedData')}</span>
                        <p className={`text-xs mt-1 ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                          {t('dashboard.settings.privacy.shareAnonymizedDataDescription')}
                        </p>
                      </div>
                      <button
                        onClick={() => setDataSharing(!dataSharing)}
                        className={`relative w-12 h-6 rounded-full transition-colors ${
                          dataSharing
                            ? "bg-gradient-to-r from-teal-500 to-cyan-500"
                            : isDark
                            ? "bg-white/10"
                            : "bg-gray-200"
                        }`}
                      >
                        <span
                          className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                            dataSharing ? "translate-x-6" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </label>
                    <label className="flex items-center justify-between cursor-pointer">
                      <div>
                        <span className={isDark ? "text-white" : "text-gray-900"}>{t('dashboard.settings.privacy.allowPersonalizedRecommendations')}</span>
                        <p className={`text-xs mt-1 ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                          {t('dashboard.settings.privacy.personalizedRecommendationsDescription')}
                        </p>
                      </div>
                      <button
                        onClick={() => setPersonalizedRecommendations(!personalizedRecommendations)}
                        className={`relative w-12 h-6 rounded-full transition-colors ${
                          personalizedRecommendations
                            ? "bg-gradient-to-r from-teal-500 to-cyan-500"
                            : isDark
                            ? "bg-white/10"
                            : "bg-gray-200"
                        }`}
                      >
                        <span
                          className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                            personalizedRecommendations ? "translate-x-6" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </label>
                    <label className="flex items-center justify-between cursor-pointer">
                      <div>
                        <span className={isDark ? "text-white" : "text-gray-900"}>{t('dashboard.settings.privacy.thirdPartyDataSharing')}</span>
                        <p className={`text-xs mt-1 ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                          {t('dashboard.settings.privacy.thirdPartyDataSharingDescription')}
                        </p>
                      </div>
                      <button
                        onClick={() => setThirdPartySharing(!thirdPartySharing)}
                        className={`relative w-12 h-6 rounded-full transition-colors ${
                          thirdPartySharing
                            ? "bg-gradient-to-r from-teal-500 to-cyan-500"
                            : isDark
                            ? "bg-white/10"
                            : "bg-gray-200"
                        }`}
                      >
                        <span
                          className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                            thirdPartySharing ? "translate-x-6" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </label>
                  </div>
                </div>

                <div
                  className={`p-6 rounded-2xl border ${
                    isDark ? "bg-white/5 border-white/10" : "bg-white border-gray-200"
                  }`}
                >
                  <h3 className={`mb-4 ${isDark ? "text-white" : "text-gray-900"}`}>{t('dashboard.settings.privacy.legalDocuments')}</h3>
                  <div className="space-y-3">
                    <button
                      onClick={() => {
                        const newWindow = window.open('', '_blank');
                        if (newWindow) {
                          newWindow.document.write(`
                            <!DOCTYPE html>
                            <html>
                            <head>
                              <title>Privacy Policy - CVSaathi</title>
                              <style>
                                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 20px; color: #333; background-color: #f8fafc; }
                                .container { background: white; padding: 40px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
                                h1 { color: #4f46e5; border-bottom: 3px solid #4f46e5; padding-bottom: 10px; }
                                h2 { color: #374151; margin-top: 30px; border-left: 4px solid #4f46e5; padding-left: 15px; }
                                .highlight { background: #fef3c7; padding: 15px; border-left: 4px solid #f59e0b; margin: 15px 0; border-radius: 4px; }
                              </style>
                            </head>
                            <body>
                              <div class="container">
                                <h1>Privacy Policy for CVSaathi</h1>
                                <p><strong>Effective Date:</strong> ${new Date().toLocaleDateString()}</p>
                                <div class="highlight">
                                  <strong>Quick Summary:</strong> CVSaathi is committed to protecting your privacy. We collect information to provide career services, never sell your data, and give you full control over your information.
                                </div>
                                <h2>1. Introduction</h2>
                                <p>CVSaathi ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our application and related services.</p>
                                <h2>2. Information We Collect</h2>
                                <p>We collect information you voluntarily provide when using our App:</p>
                                <ul>
                                  <li><strong>Account Information:</strong> Name, email address, phone number</li>
                                  <li><strong>Professional Information:</strong> Work history, education, skills, career goals</li>
                                  <li><strong>Resume Content:</strong> Personal details, work experience, education, projects, skills</li>
                                </ul>
                                <h2>3. How We Use Your Information</h2>
                                <p>We use the information we collect to:</p>
                                <ul>
                                  <li>Provide, maintain, and improve our services</li>
                                  <li>Process transactions and manage subscriptions</li>
                                  <li>Communicate with you about updates and support</li>
                                  <li>Enhance AI coaching capabilities</li>
                                </ul>
                                <h2>4. Data Security</h2>
                                <p>We implement industry-standard security measures including encryption, access controls, and secure infrastructure.</p>
                                <h2>5. Your Privacy Rights</h2>
                                <p>You have the right to access, update, delete, and export your personal data at any time.</p>
                                <h2>6. Contact Information</h2>
                                <p>For questions about this Privacy Policy, please contact us at: privacy@cvsaathi.com</p>
                              </div>
                            </body>
                            </html>
                          `);
                        }
                      }}
                      className={`w-full flex items-center justify-between p-4 rounded-lg border transition-colors ${
                        isDark
                          ? "bg-white/5 border-white/10 hover:bg-white/10"
                          : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Shield className={`size-5 ${isDark ? "text-teal-400" : "text-teal-600"}`} />
                        <div className="text-left">
                          <p className={isDark ? "text-white" : "text-gray-900"}>{t('dashboard.settings.privacy.privacyPolicy')}</p>
                          <p className={`text-xs ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                            {t('dashboard.settings.privacy.privacyPolicyDescription')}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className={`size-5 ${isDark ? "text-gray-400" : "text-gray-600"}`} />
                    </button>
                    <button
                      onClick={() => {
                        const newWindow = window.open('', '_blank');
                        if (newWindow) {
                          newWindow.document.write(`
                            <!DOCTYPE html>
                            <html>
                            <head>
                              <title>Terms of Service - CVSaathi</title>
                              <style>
                                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 20px; color: #333; background-color: #f8fafc; }
                                .container { background: white; padding: 40px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
                                h1 { color: #4f46e5; border-bottom: 3px solid #4f46e5; padding-bottom: 10px; }
                                h2 { color: #374151; margin-top: 30px; border-left: 4px solid #4f46e5; padding-left: 15px; }
                              </style>
                            </head>
                            <body>
                              <div class="container">
                                <h1>Terms of Service</h1>
                                <p><strong>Effective Date:</strong> ${new Date().toLocaleDateString()}</p>
                                <h2>1. Acceptance of Terms</h2>
                                <p>By using CVSaathi, you agree to be bound by these Terms of Service. If you do not agree, please do not use our services.</p>
                                <h2>2. Service Description</h2>
                                <p>CVSaathi provides AI-powered career development services including resume building, interview preparation, and career coaching.</p>
                                <h2>3. User Responsibilities</h2>
                                <p>You agree to provide accurate information and use our services for lawful purposes only.</p>
                                <h2>4. AI-Generated Content</h2>
                                <p>Our AI provides guidance for informational purposes only. You are responsible for reviewing and verifying all content.</p>
                                <h2>5. Limitation of Liability</h2>
                                <p>CVSaathi is provided "as is" without warranties. We do not guarantee employment or career success outcomes.</p>
                                <h2>6. Contact Information</h2>
                                <p>For questions about these Terms, please contact us at: support@cvsaathi.com</p>
                              </div>
                            </body>
                            </html>
                          `);
                        }
                      }}
                      className={`w-full flex items-center justify-between p-4 rounded-lg border transition-colors ${
                        isDark
                          ? "bg-white/5 border-white/10 hover:bg-white/10"
                          : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <FileText className={`size-5 ${isDark ? "text-teal-400" : "text-teal-600"}`} />
                        <div className="text-left">
                          <p className={isDark ? "text-white" : "text-gray-900"}>{t('dashboard.settings.privacy.termsOfService')}</p>
                          <p className={`text-xs ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                            {t('dashboard.settings.privacy.termsOfServiceDescription')}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className={`size-5 ${isDark ? "text-gray-400" : "text-gray-600"}`} />
                    </button>
                  </div>
                </div>

                <div
                  className={`p-6 rounded-2xl border ${
                    isDark ? "bg-white/5 border-white/10" : "bg-white border-gray-200"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className={`mb-1 ${isDark ? "text-white" : "text-gray-900"}`}>
                        {t('dashboard.settings.privacy.exportYourData')}
                      </h3>
                      <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                        {t('dashboard.settings.privacy.exportDataDescription')}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      className={isDark ? "border-white/10" : ""}
                      onClick={() => toast.success(t('dashboard.settings.privacy.dataExportStarted'))}
                    >
                      <Download className="size-4 mr-2" />
                      {t('dashboard.settings.privacy.export')}
                    </Button>
                  </div>
                </div>

                <div
                  className={`p-6 rounded-2xl border ${
                    isDark ? "bg-white/5 border-white/10" : "bg-white border-gray-200"
                  }`}
                >
                  <h3 className={`mb-4 ${isDark ? "text-white" : "text-gray-900"}`}>{t('dashboard.settings.privacy.cookiePreferences')}</h3>
                  <div className="space-y-4">
                    {[
                      { label: t('dashboard.settings.privacy.essentialCookies'), checked: true, disabled: true },
                      { label: t('dashboard.settings.privacy.performanceCookies'), checked: true, disabled: false },
                      { label: t('dashboard.settings.privacy.functionalCookies'), checked: false, disabled: false },
                      { label: t('dashboard.settings.privacy.marketingCookies'), checked: false, disabled: false },
                    ].map((item, i) => (
                      <label
                        key={i}
                        className={`flex items-center justify-between ${
                          item.disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"
                        }`}
                      >
                        <div>
                          <span className={isDark ? "text-white" : "text-gray-900"}>{item.label}</span>
                          {item.disabled && (
                            <p className={`text-xs mt-1 ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                              {t('dashboard.settings.privacy.requiredForBasicFunctionality')}
                            </p>
                          )}
                        </div>
                        <button
                          disabled={item.disabled}
                          className={`relative w-12 h-6 rounded-full transition-colors ${
                            item.checked
                              ? "bg-gradient-to-r from-teal-500 to-cyan-500"
                              : isDark
                              ? "bg-white/10"
                              : "bg-gray-200"
                          }`}
                        >
                          <span
                            className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                              item.checked ? "translate-x-6" : "translate-x-0"
                            }`}
                          />
                        </button>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "integrations" && (
              <div className="space-y-6 animate-in slide-in-from-right duration-300">
                <div>
                  <h2 className={`text-2xl mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>
                    {t('dashboard.settings.integrations.title')}
                  </h2>
                  <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                    {t('dashboard.settings.integrations.description')}
                  </p>
                </div>

                <p className={`text-center text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                  {t('dashboard.settings.integrations.noIntegrationsAvailable')}
                </p>
              </div>
            )}

            {activeTab === "preferences" && (
              <div className="space-y-6 animate-in slide-in-from-right duration-300">
                <div>
                  <h2 className={`text-2xl mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>
                    {t('dashboard.settings.preferences.title')}
                  </h2>
                  <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                    {t('dashboard.settings.preferences.description')}
                  </p>
                </div>

                <div
                  className={`p-6 rounded-2xl border ${
                    isDark ? "bg-white/5 border-white/10" : "bg-white border-gray-200"
                  }`}
                >
                  <h3 className={`mb-4 ${isDark ? "text-white" : "text-gray-900"}`}>
                    {t('dashboard.settings.preferences.jobSearchSettings')}
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className={`block text-sm mb-2 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                        {t('dashboard.settings.preferences.desiredJobTitle')}
                      </label>
                      <input
                        type="text"
                        defaultValue="Software Engineer"
                        className={`w-full px-4 py-2 rounded-lg border transition-colors ${
                          isDark
                            ? "bg-white/5 border-white/10 text-white"
                            : "bg-white border-gray-200 text-gray-900"
                        }`}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm mb-2 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                        {t('dashboard.settings.preferences.preferredIndustry')}
                      </label>
                      <select
                        className={`w-full px-4 py-2 rounded-lg border ${
                          isDark
                            ? "bg-white/5 border-white/10 text-white"
                            : "bg-white border-gray-200 text-gray-900"
                        }`}
                      >
                        <option>{t('dashboard.settings.preferences.technology')}</option>
                        <option>{t('dashboard.settings.preferences.finance')}</option>
                        <option>{t('dashboard.settings.preferences.healthcare')}</option>
                        <option>{t('dashboard.settings.preferences.education')}</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "advanced" && (
              <div className="space-y-6 animate-in slide-in-from-right duration-300">
                <div>
                  <h2 className={`text-2xl mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>
                    {t('dashboard.settings.advanced.title')}
                  </h2>
                  <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                    {t('dashboard.settings.advanced.description')}
                  </p>
                </div>

                <div
                  className={`p-6 rounded-2xl border ${
                    isDark ? "bg-white/5 border-white/10" : "bg-white border-gray-200"
                  }`}
                >
                  <h3 className={`mb-4 ${isDark ? "text-white" : "text-gray-900"}`}>
                    {t('dashboard.settings.advanced.apiAccess')}
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm mb-2 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                        {t('dashboard.settings.advanced.apiKey')}
                      </label>
                      <input
                        type="text"
                        defaultValue="your_api_key_here"
                        className={`w-full px-4 py-2 rounded-lg border transition-colors ${
                          isDark
                            ? "bg-white/5 border-white/10 text-white"
                            : "bg-white border-gray-200 text-gray-900"
                        }`}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm mb-2 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                        {t('dashboard.settings.advanced.databaseConnection')}
                      </label>
                      <input
                        type="text"
                        defaultValue="your_database_connection_here"
                        className={`w-full px-4 py-2 rounded-lg border transition-colors ${
                          isDark
                            ? "bg-white/5 border-white/10 text-white"
                            : "bg-white border-gray-200 text-gray-900"
                        }`}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm mb-2 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                        {t('dashboard.settings.advanced.hardDriveStorage')}
                      </label>
                      <input
                        type="text"
                        defaultValue="your_hard_drive_storage_here"
                        className={`w-full px-4 py-2 rounded-lg border transition-colors ${
                          isDark
                            ? "bg-white/5 border-white/10 text-white"
                            : "bg-white border-gray-200 text-gray-900"
                        }`}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm mb-2 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                        {t('dashboard.settings.advanced.refreshInterval')}
                      </label>
                      <input
                        type="text"
                        defaultValue="your_refresh_interval_here"
                        className={`w-full px-4 py-2 rounded-lg border transition-colors ${
                          isDark
                            ? "bg-white/5 border-white/10 text-white"
                            : "bg-white border-gray-200 text-gray-900"
                        }`}
                      />
                    </div>
                  </div>
                </div>

                <div
                  className={`p-6 rounded-2xl border ${
                    isDark ? "bg-white/5 border-white/10" : "bg-white border-gray-200"
                  }`}
                >
                  <h3 className={`mb-4 ${isDark ? "text-white" : "text-gray-900"}`}>
                    {t('dashboard.settings.advanced.systemLogs')}
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className={`text-sm ${isDark ? "text-white" : "text-gray-900"}`}>
                          {t('dashboard.settings.advanced.viewSystemLogs')}
                        </p>
                        <p className={`text-xs mt-1 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                          {t('dashboard.settings.advanced.systemLogsDescription')}
                        </p>
                      </div>
                      <Button variant="outline" className={isDark ? "border-white/10" : ""}>
                        <RefreshCw className="size-4 mr-2" />
                        {t('dashboard.settings.advanced.viewLogs')}
                      </Button>
                    </div>
                  </div>
                </div>

                <div
                  className={`p-6 rounded-2xl border ${
                    isDark ? "bg-white/5 border-white/10" : "bg-white border-gray-200"
                  }`}
                >
                  <h3 className={`mb-4 ${isDark ? "text-white" : "text-gray-900"}`}>
                    {t('dashboard.settings.advanced.dataExport')}
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className={`text-sm ${isDark ? "text-white" : "text-gray-900"}`}>
                          {t('dashboard.settings.privacy.exportDataDescription')}
                        </p>
                        <p className={`text-xs mt-1 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                          For backup and portability
                        </p>
                      </div>
                      <Button variant="outline" className={isDark ? "border-white/10" : ""}>
                        <Download className="size-4 mr-2" />
                        {t('dashboard.settings.advanced.exportData')}
                      </Button>
                    </div>
                  </div>
                </div>

                <div
                  className={`p-6 rounded-2xl border ${
                    isDark ? "bg-white/5 border-white/10" : "bg-white border-gray-200"
                  }`}
                >
                  <h3 className={`mb-4 ${isDark ? "text-white" : "text-gray-900"}`}>
                    {t('dashboard.settings.advanced.sessionManagement')}
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className={`text-sm ${isDark ? "text-white" : "text-gray-900"}`}>
                          Manage active sessions and device connections
                        </p>
                        <p className={`text-xs mt-1 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                          For security and device management
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        className={`${isDark ? "border-white/10 text-red-400" : "text-red-600"}`}
                        onClick={() => toast.success("All sessions terminated")}
                      >
                        <X className="size-4 mr-2" />
                        End All Sessions
                      </Button>
                    </div>
                  </div>
                </div>

                <div
                  className={`p-6 rounded-2xl border ${
                    isDark ? "bg-white/5 border-white/10" : "bg-white border-gray-200"
                  }`}
                >
                  <h3 className={`mb-4 ${isDark ? "text-white" : "text-gray-900"}`}>
                    Security Keys
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className={`text-sm ${isDark ? "text-white" : "text-gray-900"}`}>
                          Manage security keys and two-factor authentication
                        </p>
                        <p className={`text-xs mt-1 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                          For enhanced account security
                        </p>
                      </div>
                      <Button variant="outline" className={isDark ? "border-white/10" : ""}>
                        <Key className="size-4 mr-2" />
                        Manage Keys
                      </Button>
                    </div>
                  </div>
                </div>

                <div
                  className={`p-6 rounded-2xl border ${
                    isDark ? "bg-white/5 border-white/10" : "bg-white border-gray-200"
                  }`}
                >
                  <h3 className={`mb-4 ${isDark ? "text-white" : "text-gray-900"}`}>
                    Privacy Settings
                  </h3>
                  <div className="space-y-4">
                    {[
                      { label: "Allow analytics tracking", checked: true },
                      { label: "Share anonymized usage data", checked: false },
                      { label: "Allow personalized recommendations", checked: true },
                      { label: "Third-party data sharing", checked: false },
                    ].map((item, i) => (
                      <label key={i} className="flex items-center justify-between cursor-pointer">
                        <span className={isDark ? "text-white" : "text-gray-900"}>{item.label}</span>
                        <button
                          className={`relative w-12 h-6 rounded-full transition-colors ${
                            item.checked
                              ? "bg-gradient-to-r from-teal-500 to-cyan-500"
                              : isDark
                              ? "bg-white/10"
                              : "bg-gray-200"
                          }`}
                        >
                          <span
                            className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                              item.checked ? "translate-x-6" : "translate-x-0"
                            }`}
                          />
                        </button>
                      </label>
                    ))}
                  </div>
                </div>

                <div
                  className={`p-6 rounded-2xl border ${
                    isDark ? "bg-white/5 border-white/10" : "bg-white border-gray-200"
                  }`}
                >
                  <h3 className={`mb-4 ${isDark ? "text-white" : "text-gray-900"}`}>
                    Advanced Privacy Controls
                  </h3>
                  <div className="space-y-4">
                    {[
                      { label: "Enable advanced privacy mode", checked: false },
                      { label: "Block all third-party cookies", checked: false },
                      { label: "Enable strict content filtering", checked: false },
                      { label: "Disable browser fingerprinting", checked: false },
                    ].map((item, i) => (
                      <label key={i} className="flex items-center justify-between cursor-pointer">
                        <span className={isDark ? "text-white" : "text-gray-900"}>{item.label}</span>
                        <button
                          className={`relative w-12 h-6 rounded-full transition-colors ${
                            item.checked
                              ? "bg-gradient-to-r from-teal-500 to-cyan-500"
                              : isDark
                              ? "bg-white/10"
                              : "bg-gray-200"
                          }`}
                        >
                          <span
                            className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                              item.checked ? "translate-x-6" : "translate-x-0"
                            }`}
                          />
                        </button>
                      </label>
                    ))}
                  </div>
                </div>

                <div
                  className={`p-6 rounded-2xl border ${
                    isDark ? "bg-white/5 border-white/10" : "bg-white border-gray-200"
                  }`}
                >
                  <h3 className={`mb-4 ${isDark ? "text-white" : "text-gray-900"}`}>
                    Advanced Security
                  </h3>
                  <div className="space-y-4">
                    {[
                      { label: "Enable two-factor authentication", checked: false },
                      { label: "Enable biometric authentication", checked: false },
                      { label: "Enable advanced security keys", checked: false },
                      { label: "Enable advanced encryption", checked: false },
                    ].map((item, i) => (
                      <label key={i} className="flex items-center justify-between cursor-pointer">
                        <span className={isDark ? "text-white" : "text-gray-900"}>{item.label}</span>
                        <button
                          className={`relative w-12 h-6 rounded-full transition-colors ${
                            item.checked
                              ? "bg-gradient-to-r from-teal-500 to-cyan-500"
                              : isDark
                              ? "bg-white/10"
                              : "bg-gray-200"
                          }`}
                        >
                          <span
                            className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                              item.checked ? "translate-x-6" : "translate-x-0"
                            }`}
                          />
                        </button>
                      </label>
                    ))}
                  </div>
                </div>

                <div
                  className={`p-6 rounded-2xl border ${
                    isDark ? "bg-white/5 border-white/10" : "bg-white border-gray-200"
                  }`}
                >
                  <h3 className={`mb-4 ${isDark ? "text-white" : "text-gray-900"}`}>
                    Edge Function & AI Service Test
                  </h3>
                  <p className={`text-sm mb-4 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                    Verify that Supabase edge functions are connected and AI services are working correctly
                  </p>
                  <EdgeFunctionTest />
                </div>

                <div
                  className={`p-6 rounded-2xl border ${
                    isDark ? "bg-white/5 border-white/10" : "bg-white border-gray-200"
                  }`}
                >
                  <h3 className={`mb-4 ${isDark ? "text-white" : "text-gray-900"}`}>
                    AI Services & Data Verification
                  </h3>
                  <p className={`text-sm mb-4 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                    Test all AI services and verify Supabase data connections (Interview Sessions, Conversations, Resumes)
                  </p>
                  <AIServicesTest />
                </div>

                <div
                  className={`p-6 rounded-2xl border ${
                    isDark ? "bg-white/5 border-white/10" : "bg-white border-gray-200"
                  }`}
                >
                  <h3 className={`mb-4 ${isDark ? "text-white" : "text-gray-900"}`}>
                    System Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm mb-2 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                        App Version
                      </label>
                      <p className={`text-sm ${isDark ? "text-white" : "text-gray-900"}`}>1.0.0</p>
                    </div>
                    <div>
                      <label className={`block text-sm mb-2 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                        System Language
                      </label>
                      <p className={`text-sm ${isDark ? "text-white" : "text-gray-900"}`}>English (US)</p>
                    </div>
                    <div>
                      <label className={`block text-sm mb-2 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                        Theme
                      </label>
                      <p className={`text-sm ${isDark ? "text-white" : "text-gray-900"}`}>{themeMode}</p>
                    </div>
                    <div>
                      <label className={`block text-sm mb-2 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                        Last Updated
                      </label>
                      <p className={`text-sm ${isDark ? "text-white" : "text-gray-900"}`}>2023-10-27</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}