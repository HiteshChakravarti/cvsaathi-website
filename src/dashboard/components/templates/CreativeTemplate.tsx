import React from 'react';
import { ResumeData } from '../ResumeBuilderPage';
import { getSpacingClass, getFontSizeClasses, renderHeader, shouldShowSection } from './templateUtils';
import { renderSection } from './sectionRenderers';

interface TemplateProps {
  resumeData: ResumeData;
  isDark?: boolean;
}

export function CreativeTemplate({ resumeData, isDark }: TemplateProps) {
  const accentColor = resumeData.layout.accentColor || '#ec4899';
  const fontFamily = resumeData.layout.fontFamily || 'Poppins, sans-serif';
  const fontSize = resumeData.layout.fontSize || 'medium';
  const spacing = resumeData.layout.spacing || 'balanced';
  const fontSizeClasses = getFontSizeClasses(fontSize);
  const spacingClass = getSpacingClass(spacing);

  return (
    <div className="p-12 h-full overflow-y-auto" style={{ fontFamily }}>
      {renderHeader(resumeData, accentColor, fontSize, 'creative')}
      
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
              templateStyle: 'creative',
            })}
          </React.Fragment>
        );
      })}
    </div>
  );
}
