import React from 'react';
import { ResumeData } from '../ResumeBuilderPage';

export interface SectionRenderer {
  id: string;
  label: string;
  render: () => React.ReactNode;
}

export function getSpacingClass(spacing: 'compact' | 'balanced' | 'spacious'): string {
  switch (spacing) {
    case 'compact':
      return 'mb-4';
    case 'balanced':
      return 'mb-6';
    case 'spacious':
      return 'mb-8';
    default:
      return 'mb-6';
  }
}

export function getFontSizeClasses(fontSize: 'small' | 'medium' | 'large') {
  return {
    h1: fontSize === 'small' ? 'text-3xl' : fontSize === 'medium' ? 'text-4xl' : 'text-5xl',
    h2: fontSize === 'small' ? 'text-lg' : fontSize === 'medium' ? 'text-xl' : 'text-2xl',
    h3: fontSize === 'small' ? 'text-base' : fontSize === 'medium' ? 'text-lg' : 'text-xl',
    body: fontSize === 'small' ? 'text-xs' : fontSize === 'medium' ? 'text-sm' : 'text-base',
    small: fontSize === 'small' ? 'text-xs' : fontSize === 'medium' ? 'text-sm' : 'text-base',
  };
}

export function renderHeader(
  resumeData: ResumeData,
  accentColor: string,
  fontSize: 'small' | 'medium' | 'large',
  customStyle?: 'classic' | 'creative' | 'technical' | 'minimal' | 'academic' | 'executive'
) {
  const fontSizeClasses = getFontSizeClasses(fontSize);
  const headerStyle = resumeData.layout.headerStyle || 'centered';

  const contactInfo = (
    <div className={`flex items-center gap-4 ${fontSizeClasses.small} text-gray-600 flex-wrap`}>
      {resumeData.personalInfo.email && <span>{resumeData.personalInfo.email}</span>}
      {resumeData.personalInfo.phone && resumeData.personalInfo.email && <span>•</span>}
      {resumeData.personalInfo.phone && <span>{resumeData.personalInfo.phone}</span>}
      {resumeData.personalInfo.location && (resumeData.personalInfo.email || resumeData.personalInfo.phone) && <span>•</span>}
      {resumeData.personalInfo.location && <span>{resumeData.personalInfo.location}</span>}
      {resumeData.personalInfo.linkedin && <span>•</span>}
      {resumeData.personalInfo.linkedin && <span>LinkedIn</span>}
    </div>
  );

  // Creative template has special header style
  if (customStyle === 'creative') {
    return (
      <div 
        className="mb-6 pb-4 rounded-lg p-6 text-center"
        style={{ backgroundColor: `${accentColor}15` }}
      >
        <h1 className={`${fontSizeClasses.h1} font-extrabold mb-2`} style={{ color: accentColor }}>
          {resumeData.personalInfo.fullName || 'Your Name'}
        </h1>
        {resumeData.personalInfo.headline && (
          <p className={`${fontSizeClasses.body} text-gray-700 mb-3 font-semibold`}>{resumeData.personalInfo.headline}</p>
        )}
        {contactInfo}
      </div>
    );
  }

  // Technical template has special header style
  if (customStyle === 'technical') {
    return (
      <div className="mb-6 pb-4 border-b-4" style={{ borderColor: accentColor }}>
        <h1 className={`${fontSizeClasses.h1} font-bold mb-2`} style={{ color: accentColor }}>
          {resumeData.personalInfo.fullName || 'YOUR_NAME'}
        </h1>
        {resumeData.personalInfo.headline && (
          <p className={`${fontSizeClasses.body} text-gray-600 mb-3`}>{resumeData.personalInfo.headline}</p>
        )}
        {contactInfo}
      </div>
    );
  }

  // Minimal template has special header style
  if (customStyle === 'minimal') {
    return (
      <div className="mb-8 pb-3 border-b" style={{ borderColor: accentColor }}>
        <h1 className={`${fontSizeClasses.h1} font-light mb-1 tracking-tight`} style={{ color: accentColor }}>
          {resumeData.personalInfo.fullName || 'Your Name'}
        </h1>
        {resumeData.personalInfo.headline && (
          <p className={`${fontSizeClasses.small} text-gray-600 mb-2 font-light`}>{resumeData.personalInfo.headline}</p>
        )}
        <div className={`flex items-center gap-3 ${fontSizeClasses.small} text-gray-500 flex-wrap font-light`}>
          {resumeData.personalInfo.email && <span>{resumeData.personalInfo.email}</span>}
          {resumeData.personalInfo.phone && resumeData.personalInfo.email && <span>/</span>}
          {resumeData.personalInfo.phone && <span>{resumeData.personalInfo.phone}</span>}
          {resumeData.personalInfo.location && (resumeData.personalInfo.email || resumeData.personalInfo.phone) && <span>/</span>}
          {resumeData.personalInfo.location && <span>{resumeData.personalInfo.location}</span>}
        </div>
      </div>
    );
  }

  // Academic template has special header style
  if (customStyle === 'academic') {
    return (
      <div className="mb-6 pb-4 border-b-2 text-center" style={{ borderColor: accentColor }}>
        <h1 className={`${fontSizeClasses.h1} font-bold mb-2`} style={{ color: accentColor }}>
          {resumeData.personalInfo.fullName || 'Your Name'}
        </h1>
        {resumeData.personalInfo.headline && (
          <p className={`${fontSizeClasses.body} text-gray-700 mb-3 italic`}>{resumeData.personalInfo.headline}</p>
        )}
        <div className={`flex items-center justify-center gap-3 ${fontSizeClasses.small} text-gray-700 flex-wrap`}>
          {resumeData.personalInfo.email && <span>{resumeData.personalInfo.email}</span>}
          {resumeData.personalInfo.phone && resumeData.personalInfo.email && <span>|</span>}
          {resumeData.personalInfo.phone && <span>{resumeData.personalInfo.phone}</span>}
          {resumeData.personalInfo.location && (resumeData.personalInfo.email || resumeData.personalInfo.phone) && <span>|</span>}
          {resumeData.personalInfo.location && <span>{resumeData.personalInfo.location}</span>}
        </div>
      </div>
    );
  }

  // Executive template has special header style
  if (customStyle === 'executive') {
    return (
      <div className="mb-8 pb-6 border-b-4 text-center" style={{ borderColor: accentColor }}>
        <h1 className={`${fontSizeClasses.h1} font-bold mb-3 tracking-wide`} style={{ color: accentColor }}>
          {resumeData.personalInfo.fullName || 'Your Name'}
        </h1>
        {resumeData.personalInfo.headline && (
          <p className={`${fontSizeClasses.body} text-gray-700 mb-4 font-semibold`}>{resumeData.personalInfo.headline}</p>
        )}
        <div className={`flex items-center justify-center gap-4 ${fontSizeClasses.small} text-gray-600 flex-wrap`}>
          {resumeData.personalInfo.email && <span className="font-medium">{resumeData.personalInfo.email}</span>}
          {resumeData.personalInfo.phone && resumeData.personalInfo.email && <span className="text-gray-400">|</span>}
          {resumeData.personalInfo.phone && <span className="font-medium">{resumeData.personalInfo.phone}</span>}
          {resumeData.personalInfo.location && (resumeData.personalInfo.email || resumeData.personalInfo.phone) && <span className="text-gray-400">|</span>}
          {resumeData.personalInfo.location && <span className="font-medium">{resumeData.personalInfo.location}</span>}
        </div>
      </div>
    );
  }

  // Classic template has special header style
  if (customStyle === 'classic') {
    return (
      <div className="mb-6 pb-4 border-b-2" style={{ borderColor: accentColor }}>
        <h1 className={`${fontSizeClasses.h1} font-bold mb-2`} style={{ color: accentColor }}>
          {resumeData.personalInfo.fullName || 'Your Name'}
        </h1>
        {resumeData.personalInfo.headline && (
          <p className={`${fontSizeClasses.body} text-gray-700 mb-3 italic`}>{resumeData.personalInfo.headline}</p>
        )}
        <div className={`flex items-center gap-4 ${fontSizeClasses.small} text-gray-700 flex-wrap`}>
          {resumeData.personalInfo.email && <span>{resumeData.personalInfo.email}</span>}
          {resumeData.personalInfo.phone && resumeData.personalInfo.email && <span>|</span>}
          {resumeData.personalInfo.phone && <span>{resumeData.personalInfo.phone}</span>}
          {resumeData.personalInfo.location && (resumeData.personalInfo.email || resumeData.personalInfo.phone) && <span>|</span>}
          {resumeData.personalInfo.location && <span>{resumeData.personalInfo.location}</span>}
        </div>
      </div>
    );
  }

  if (headerStyle === 'two-column') {
    return (
      <div className="grid grid-cols-2 gap-4 mb-6 pb-4 border-b-2" style={{ borderColor: accentColor }}>
        <div>
          <h1 className={`${fontSizeClasses.h1} font-bold mb-2`} style={{ color: accentColor }}>
            {resumeData.personalInfo.fullName || 'Your Name'}
          </h1>
          {resumeData.personalInfo.headline && (
            <p className={`${fontSizeClasses.body} text-gray-600`}>{resumeData.personalInfo.headline}</p>
          )}
        </div>
        <div className="text-right">
          {contactInfo}
        </div>
      </div>
    );
  }

  if (headerStyle === 'left') {
    return (
      <div className="mb-6 pb-4 border-b-2 text-left" style={{ borderColor: accentColor }}>
        <h1 className={`${fontSizeClasses.h1} font-bold mb-2`} style={{ color: accentColor }}>
          {resumeData.personalInfo.fullName || 'Your Name'}
        </h1>
        {resumeData.personalInfo.headline && (
          <p className={`${fontSizeClasses.body} text-gray-600 mb-2`}>{resumeData.personalInfo.headline}</p>
        )}
        {contactInfo}
      </div>
    );
  }

  // Default: centered
  return (
    <div className="text-center mb-6 pb-4 border-b-2" style={{ borderColor: accentColor }}>
      <h1 className={`${fontSizeClasses.h1} font-bold mb-2`} style={{ color: accentColor }}>
        {resumeData.personalInfo.fullName || 'Your Name'}
      </h1>
      {resumeData.personalInfo.headline && (
        <p className={`${fontSizeClasses.body} text-gray-600 mb-3`}>{resumeData.personalInfo.headline}</p>
      )}
      {contactInfo}
    </div>
  );
}

export function shouldShowSection(sectionId: string, resumeData: ResumeData): boolean {
  const visibility = resumeData.layout.sectionVisibility;
  
  switch (sectionId) {
    case 'summary':
      return visibility.summary && !!resumeData.summary;
    case 'experience':
      return visibility.experience && resumeData.experiences.length > 0 && resumeData.experiences.some(e => e.company || e.title);
    case 'education':
      return visibility.education && resumeData.education.length > 0 && resumeData.education.some(e => e.institution || e.degree);
    case 'skills':
      return visibility.skills && (resumeData.technicalSkills.length > 0 || resumeData.softSkills.length > 0);
    case 'projects':
      return visibility.projects && resumeData.projects.length > 0 && resumeData.projects.some(p => p.name || p.description);
    case 'certifications':
      return visibility.certifications && resumeData.certifications.length > 0;
    case 'languages':
      return visibility.languages && resumeData.languages.length > 0;
    case 'awards':
      return visibility.awards && resumeData.awards.length > 0;
    default:
      return true;
  }
}

