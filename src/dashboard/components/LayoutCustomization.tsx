import React from 'react';
import {
  ChevronLeft, ChevronRight, Check, Palette, Type, AlignLeft, Columns,
  Layout, Eye, GripVertical, FileText, Briefcase, GraduationCap, Award,
  Code, Languages, Trophy
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { ResumeData } from './ResumeBuilderPage';

interface LayoutCustomizationProps {
  resumeData: ResumeData;
  setResumeData: (data: ResumeData) => void;
  isDark: boolean;
  prevStep: () => void;
  nextStep: () => void;
}

const accentColors = [
  { name: 'Teal', value: '#14b8a6' },
  { name: 'Purple', value: '#a855f7' },
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Pink', value: '#ec4899' },
  { name: 'Emerald', value: '#10b981' },
  { name: 'Orange', value: '#f97316' },
];

// Font families optimized for each template type
const fontFamilies: Record<string, Array<{ name: string; value: string; category: string }>> = {
  'modern-pro': [
    { name: 'Inter', value: 'Inter, sans-serif', category: 'Modern Sans' },
    { name: 'Poppins', value: 'Poppins, sans-serif', category: 'Modern Sans' },
    { name: 'Roboto', value: 'Roboto, sans-serif', category: 'Modern Sans' },
    { name: 'Open Sans', value: 'Open Sans, sans-serif', category: 'Modern Sans' },
    { name: 'Lato', value: 'Lato, sans-serif', category: 'Modern Sans' },
    { name: 'Montserrat', value: 'Montserrat, sans-serif', category: 'Modern Sans' },
  ],
  'classic': [
    { name: 'Georgia', value: 'Georgia, serif', category: 'Serif' },
    { name: 'Times New Roman', value: 'Times New Roman, serif', category: 'Serif' },
    { name: 'Garamond', value: 'Garamond, serif', category: 'Serif' },
    { name: 'Playfair Display', value: 'Playfair Display, serif', category: 'Serif' },
    { name: 'Merriweather', value: 'Merriweather, serif', category: 'Serif' },
    { name: 'Lora', value: 'Lora, serif', category: 'Serif' },
  ],
  'creative': [
    { name: 'Poppins', value: 'Poppins, sans-serif', category: 'Bold Sans' },
    { name: 'Montserrat', value: 'Montserrat, sans-serif', category: 'Bold Sans' },
    { name: 'Raleway', value: 'Raleway, sans-serif', category: 'Bold Sans' },
    { name: 'Nunito', value: 'Nunito, sans-serif', category: 'Bold Sans' },
    { name: 'Comfortaa', value: 'Comfortaa, sans-serif', category: 'Bold Sans' },
    { name: 'Quicksand', value: 'Quicksand, sans-serif', category: 'Bold Sans' },
  ],
  'technical': [
    { name: 'Courier New', value: 'Courier New, monospace', category: 'Monospace' },
    { name: 'Monaco', value: 'Monaco, monospace', category: 'Monospace' },
    { name: 'Consolas', value: 'Consolas, monospace', category: 'Monospace' },
    { name: 'Roboto Mono', value: 'Roboto Mono, monospace', category: 'Monospace' },
    { name: 'Source Code Pro', value: 'Source Code Pro, monospace', category: 'Monospace' },
    { name: 'Fira Code', value: 'Fira Code, monospace', category: 'Monospace' },
  ],
  'minimal': [
    { name: 'Helvetica', value: 'Helvetica, Arial, sans-serif', category: 'Minimal' },
    { name: 'Arial', value: 'Arial, sans-serif', category: 'Minimal' },
    { name: 'Inter', value: 'Inter, sans-serif', category: 'Minimal' },
    { name: 'Roboto', value: 'Roboto, sans-serif', category: 'Minimal' },
    { name: 'Lato', value: 'Lato, sans-serif', category: 'Minimal' },
    { name: 'Work Sans', value: 'Work Sans, sans-serif', category: 'Minimal' },
  ],
  'modern-two': [
    { name: 'Inter', value: 'Inter, sans-serif', category: 'Modern Sans' },
    { name: 'Roboto', value: 'Roboto, sans-serif', category: 'Modern Sans' },
    { name: 'Open Sans', value: 'Open Sans, sans-serif', category: 'Modern Sans' },
    { name: 'Lato', value: 'Lato, sans-serif', category: 'Modern Sans' },
    { name: 'Poppins', value: 'Poppins, sans-serif', category: 'Modern Sans' },
    { name: 'Nunito', value: 'Nunito, sans-serif', category: 'Modern Sans' },
  ],
  'academic': [
    { name: 'Times New Roman', value: 'Times New Roman, serif', category: 'Serif' },
    { name: 'Georgia', value: 'Georgia, serif', category: 'Serif' },
    { name: 'Garamond', value: 'Garamond, serif', category: 'Serif' },
    { name: 'Merriweather', value: 'Merriweather, serif', category: 'Serif' },
    { name: 'Crimson Text', value: 'Crimson Text, serif', category: 'Serif' },
    { name: 'Libre Baskerville', value: 'Libre Baskerville, serif', category: 'Serif' },
  ],
  'executive': [
    { name: 'Garamond', value: 'Garamond, serif', category: 'Serif' },
    { name: 'Georgia', value: 'Georgia, serif', category: 'Serif' },
    { name: 'Playfair Display', value: 'Playfair Display, serif', category: 'Serif' },
    { name: 'Cormorant Garamond', value: 'Cormorant Garamond, serif', category: 'Serif' },
    { name: 'Libre Baskerville', value: 'Libre Baskerville, serif', category: 'Serif' },
    { name: 'EB Garamond', value: 'EB Garamond, serif', category: 'Serif' },
  ],
};

const sectionLabels: Record<string, { label: string; icon: any }> = {
  summary: { label: 'Professional Summary', icon: FileText },
  experience: { label: 'Experience', icon: Briefcase },
  education: { label: 'Education', icon: GraduationCap },
  skills: { label: 'Skills', icon: Award },
  projects: { label: 'Projects', icon: Code },
  certifications: { label: 'Certifications', icon: Award },
  languages: { label: 'Languages', icon: Languages },
  awards: { label: 'Awards', icon: Trophy },
};

export function LayoutCustomization({
  resumeData,
  setResumeData,
  isDark,
  prevStep,
  nextStep,
}: LayoutCustomizationProps) {
  const availableFonts = fontFamilies[resumeData.templateId] || fontFamilies['modern-pro'];

  return (
    <div>
      <h2 className={`text-3xl mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
        Layout & Design
      </h2>
      <p className={`text-lg mb-8 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
        Customize your resume's appearance and structure
      </p>

      {/* Accent Color */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Palette className="size-5 text-purple-500" />
          <h3 className={`text-xl ${isDark ? 'text-white' : 'text-gray-900'}`}>Accent Color</h3>
        </div>
        <div className="grid grid-cols-6 gap-3 mb-4">
          {accentColors.map((color) => (
            <button
              key={color.value}
              onClick={() => setResumeData({ ...resumeData, layout: { ...resumeData.layout, accentColor: color.value } })}
              className={`p-4 rounded-xl border-2 transition-all ${
                resumeData.layout.accentColor === color.value
                  ? 'border-white scale-105 shadow-lg'
                  : 'border-white/10 hover:scale-102'
              }`}
              style={{ backgroundColor: color.value }}
            >
              {resumeData.layout.accentColor === color.value && (
                <Check className="size-6 text-white mx-auto mb-1" />
              )}
              <p className="text-white text-sm font-medium">{color.name}</p>
            </button>
          ))}
        </div>
        {/* Custom Color Picker */}
        <div className={`p-4 rounded-xl ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
          <label className={`block text-sm mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Custom Color
          </label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={resumeData.layout.accentColor}
              onChange={(e) => setResumeData({ ...resumeData, layout: { ...resumeData.layout, accentColor: e.target.value } })}
              className="w-16 h-12 rounded-lg border-2 border-white/20 cursor-pointer"
            />
            <input
              type="text"
              value={resumeData.layout.accentColor}
              onChange={(e) => setResumeData({ ...resumeData, layout: { ...resumeData.layout, accentColor: e.target.value } })}
              placeholder="#14b8a6"
              className={`flex-1 px-3 py-2 rounded-lg border ${
                isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-gray-200'
              }`}
            />
          </div>
        </div>
      </div>

      {/* Font Family */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Type className="size-5 text-purple-500" />
          <h3 className={`text-xl ${isDark ? 'text-white' : 'text-gray-900'}`}>Font Family</h3>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {availableFonts.map((font) => (
            <button
              key={font.value}
              onClick={() => setResumeData({ ...resumeData, layout: { ...resumeData.layout, fontFamily: font.value } })}
              className={`p-4 rounded-xl border-2 text-left transition-all ${
                resumeData.layout.fontFamily === font.value
                  ? 'border-purple-500 bg-purple-500/10'
                  : isDark
                    ? 'border-white/10 bg-white/5 hover:border-white/20'
                    : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
              style={{ fontFamily: font.value }}
            >
              <div className="flex items-center justify-between mb-1">
                <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {font.name}
                </p>
                {resumeData.layout.fontFamily === font.value && (
                  <Check className="size-4 text-purple-500" />
                )}
              </div>
              <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                {font.category}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Header Style */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <AlignLeft className="size-5 text-purple-500" />
          <h3 className={`text-xl ${isDark ? 'text-white' : 'text-gray-900'}`}>Header Style</h3>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[
            { value: 'centered', label: 'Centered', icon: AlignLeft },
            { value: 'left', label: 'Left Aligned', icon: AlignLeft },
            { value: 'two-column', label: 'Two Column', icon: Columns },
          ].map((style) => (
            <button
              key={style.value}
              onClick={() => setResumeData({ ...resumeData, layout: { ...resumeData.layout, headerStyle: style.value as any } })}
              className={`p-4 rounded-xl border-2 transition-all ${
                resumeData.layout.headerStyle === style.value
                  ? 'border-purple-500 bg-purple-500/10'
                  : isDark
                    ? 'border-white/10 bg-white/5 hover:border-white/20'
                    : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <style.icon className={`size-5 mb-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`} />
              <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {style.label}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Column Layout */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Columns className="size-5 text-purple-500" />
          <h3 className={`text-xl ${isDark ? 'text-white' : 'text-gray-900'}`}>Column Layout</h3>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[
            { value: 1, label: 'Single Column', description: 'Traditional layout' },
            { value: 2, label: 'Two Columns', description: 'Space efficient' },
          ].map((col) => (
            <button
              key={col.value}
              onClick={() => setResumeData({ ...resumeData, layout: { ...resumeData.layout, columns: col.value as 1 | 2 } })}
              className={`p-4 rounded-xl border-2 text-left transition-all ${
                resumeData.layout.columns === col.value
                  ? 'border-purple-500 bg-purple-500/10'
                  : isDark
                    ? 'border-white/10 bg-white/5 hover:border-white/20'
                    : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <p className={`font-semibold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {col.label}
              </p>
              <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                {col.description}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Font Size */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Type className="size-5 text-purple-500" />
          <h3 className={`text-xl ${isDark ? 'text-white' : 'text-gray-900'}`}>Font Size</h3>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[
            { value: 'small', label: 'Small', description: 'More content' },
            { value: 'medium', label: 'Medium', description: 'Balanced' },
            { value: 'large', label: 'Large', description: 'Easy to read' },
          ].map((size) => (
            <button
              key={size.value}
              onClick={() => setResumeData({ ...resumeData, layout: { ...resumeData.layout, fontSize: size.value as any } })}
              className={`p-4 rounded-xl border-2 transition-all ${
                resumeData.layout.fontSize === size.value
                  ? 'border-purple-500 bg-purple-500/10'
                  : isDark
                    ? 'border-white/10 bg-white/5 hover:border-white/20'
                    : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <p className={`font-semibold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {size.label}
              </p>
              <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                {size.description}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Spacing */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Layout className="size-5 text-purple-500" />
          <h3 className={`text-xl ${isDark ? 'text-white' : 'text-gray-900'}`}>Section Spacing</h3>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[
            { value: 'compact', label: 'Compact', description: 'Tight spacing' },
            { value: 'balanced', label: 'Balanced', description: 'Recommended' },
            { value: 'spacious', label: 'Spacious', description: 'More breathing room' },
          ].map((spacing) => (
            <button
              key={spacing.value}
              onClick={() => setResumeData({ ...resumeData, layout: { ...resumeData.layout, spacing: spacing.value as any } })}
              className={`p-4 rounded-xl border-2 transition-all ${
                resumeData.layout.spacing === spacing.value
                  ? 'border-purple-500 bg-purple-500/10'
                  : isDark
                    ? 'border-white/10 bg-white/5 hover:border-white/20'
                    : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <p className={`font-semibold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {spacing.label}
              </p>
              <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                {spacing.description}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Section Visibility */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Eye className="size-5 text-purple-500" />
          <h3 className={`text-xl ${isDark ? 'text-white' : 'text-gray-900'}`}>Section Visibility</h3>
        </div>
        <div className={`p-6 rounded-xl ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
          <div className="space-y-3">
            {Object.entries(sectionLabels).map(([key, { label, icon: Icon }]) => (
              <div
                key={key}
                className="flex items-center justify-between p-3 rounded-lg border border-white/10"
              >
                <div className="flex items-center gap-3">
                  <Icon className={`size-5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
                  <span className={isDark ? 'text-white' : 'text-gray-900'}>{label}</span>
                </div>
                <button
                  onClick={() => {
                    const newVisibility = {
                      ...resumeData.layout.sectionVisibility,
                      [key]: !resumeData.layout.sectionVisibility[key as keyof typeof resumeData.layout.sectionVisibility],
                    };
                    setResumeData({
                      ...resumeData,
                      layout: { ...resumeData.layout, sectionVisibility: newVisibility },
                    });
                  }}
                  className={`w-12 h-6 rounded-full transition-all ${
                    resumeData.layout.sectionVisibility[key as keyof typeof resumeData.layout.sectionVisibility]
                      ? 'bg-purple-500'
                      : 'bg-gray-300'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white transition-all ${
                      resumeData.layout.sectionVisibility[key as keyof typeof resumeData.layout.sectionVisibility]
                        ? 'translate-x-6'
                        : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Section Ordering */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <GripVertical className="size-5 text-purple-500" />
          <h3 className={`text-xl ${isDark ? 'text-white' : 'text-gray-900'}`}>Section Order</h3>
        </div>
        <div className={`p-6 rounded-xl ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
          <p className={`text-sm mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Reorder sections by moving them up or down
          </p>
          <div className="space-y-2">
            {resumeData.layout.sectionOrder.map((sectionId, index) => {
              const section = sectionLabels[sectionId];
              if (!section) return null;
              const Icon = section.icon;
              return (
                <div
                  key={sectionId}
                  className={`flex items-center justify-between p-3 rounded-lg border ${
                    isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <GripVertical className={`size-5 ${isDark ? 'text-gray-500' : 'text-gray-400'} cursor-move`} />
                    <Icon className={`size-5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
                    <span className={isDark ? 'text-white' : 'text-gray-900'}>{section.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        if (index > 0) {
                          const newOrder = [...resumeData.layout.sectionOrder];
                          [newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]];
                          setResumeData({
                            ...resumeData,
                            layout: { ...resumeData.layout, sectionOrder: newOrder },
                          });
                        }
                      }}
                      disabled={index === 0}
                      className={`p-1 rounded ${isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100'} disabled:opacity-30`}
                    >
                      <ChevronLeft className="size-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (index < resumeData.layout.sectionOrder.length - 1) {
                          const newOrder = [...resumeData.layout.sectionOrder];
                          [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
                          setResumeData({
                            ...resumeData,
                            layout: { ...resumeData.layout, sectionOrder: newOrder },
                          });
                        }
                      }}
                      disabled={index === resumeData.layout.sectionOrder.length - 1}
                      className={`p-1 rounded ${isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100'} disabled:opacity-30`}
                    >
                      <ChevronRight className="size-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          onClick={prevStep}
          className="bg-white/10 hover:bg-white/20 text-white border-0"
        >
          <ChevronLeft className="size-4 mr-2" />
          Back
        </Button>
        <Button
          onClick={nextStep}
          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0"
        >
          Continue
          <ChevronRight className="size-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}

