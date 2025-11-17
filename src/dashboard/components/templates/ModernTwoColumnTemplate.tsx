import React from 'react';
import { ResumeData } from '../ResumeBuilderPage';
import { getSpacingClass, getFontSizeClasses, renderHeader, shouldShowSection } from './templateUtils';
import { renderSection } from './sectionRenderers';

interface TemplateProps {
  resumeData: ResumeData;
  isDark?: boolean;
}

export function ModernTwoColumnTemplate({ resumeData, isDark }: TemplateProps) {
  const accentColor = resumeData.layout.accentColor || '#14b8a6';
  const fontFamily = resumeData.layout.fontFamily || 'Inter, sans-serif';
  const fontSize = resumeData.layout.fontSize || 'medium';
  const spacing = resumeData.layout.spacing || 'balanced';
  const fontSizeClasses = getFontSizeClasses(fontSize);
  const spacingClass = getSpacingClass(spacing);

  // For two-column layout, we need special handling
  const columns = resumeData.layout.columns || 1;
  
  if (columns === 2) {
    return (
      <div className="p-12 h-full overflow-y-auto" style={{ fontFamily }}>
        <div className="grid grid-cols-3 gap-8">
          {/* Left Column - 1/3 width */}
          <div className="col-span-1">
            {/* Header in left column */}
            <div className="mb-6">
              <h1 className={`${fontSizeClasses.h1} font-bold mb-2`} style={{ color: accentColor }}>
                {resumeData.personalInfo.fullName || 'Your Name'}
              </h1>
              {resumeData.personalInfo.headline && (
                <p className={`${fontSizeClasses.body} text-gray-600 mb-3`}>{resumeData.personalInfo.headline}</p>
              )}
              <div className={`${fontSizeClasses.small} text-gray-600 space-y-1`}>
                {resumeData.personalInfo.email && <div>{resumeData.personalInfo.email}</div>}
                {resumeData.personalInfo.phone && <div>{resumeData.personalInfo.phone}</div>}
                {resumeData.personalInfo.location && <div>{resumeData.personalInfo.location}</div>}
              </div>
            </div>
            
            {/* Skills, Languages, Certifications in left column */}
            {resumeData.layout.sectionOrder.map((sectionId) => {
              if (!shouldShowSection(sectionId, resumeData)) return null;
              if (['skills', 'languages', 'certifications'].includes(sectionId)) {
                return (
                  <React.Fragment key={sectionId}>
                    {renderSection({
                      sectionId,
                      resumeData,
                      accentColor,
                      fontSizeClasses,
                      spacingClass,
                      templateStyle: 'modern-two',
                    })}
                  </React.Fragment>
                );
              }
              return null;
            })}
          </div>
          
          {/* Right Column - 2/3 width */}
          <div className="col-span-2">
            {/* Main content sections */}
            {resumeData.layout.sectionOrder.map((sectionId) => {
              if (!shouldShowSection(sectionId, resumeData)) return null;
              if (!['skills', 'languages', 'certifications'].includes(sectionId)) {
                return (
                  <React.Fragment key={sectionId}>
                    {renderSection({
                      sectionId,
                      resumeData,
                      accentColor,
                      fontSizeClasses,
                      spacingClass,
                      templateStyle: 'modern-two',
                    })}
                  </React.Fragment>
                );
              }
              return null;
            })}
          </div>
        </div>
      </div>
    );
  }

  // Single column layout
  return (
    <div className="p-12 h-full overflow-y-auto" style={{ fontFamily }}>
      {renderHeader(resumeData, accentColor, fontSize)}
      
      {/* Render sections in order */}
      {resumeData.layout.sectionOrder.map((sectionId) => {
        if (!shouldShowSection(sectionId, resumeData)) return null;
        return (
          <React.Fragment key={sectionId}>
            {renderSection({
              sectionId,
              resumeData,
              accentColor,
              fontSizeClasses,
              spacingClass,
              templateStyle: 'modern-two',
            })}
          </React.Fragment>
        );
      })}
    </div>
  );
}
