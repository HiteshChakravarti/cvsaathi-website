import React from 'react';
import { ResumeData } from '../ResumeBuilderPage';
import { getSpacingClass, getFontSizeClasses, renderHeader, shouldShowSection } from './templateUtils';

interface BaseTemplateRendererProps {
  resumeData: ResumeData;
  isDark?: boolean;
  sectionRenderer: (sectionId: string, accentColor: string, fontSizeClasses: ReturnType<typeof getFontSizeClasses>, spacingClass: string) => React.ReactNode;
  defaultFontFamily?: string;
  defaultAccentColor?: string;
}

export function BaseTemplateRenderer({
  resumeData,
  isDark,
  sectionRenderer,
  defaultFontFamily = 'Inter, sans-serif',
  defaultAccentColor = '#14b8a6',
}: BaseTemplateRendererProps) {
  const accentColor = resumeData.layout.accentColor || defaultAccentColor;
  const fontFamily = resumeData.layout.fontFamily || defaultFontFamily;
  const fontSize = resumeData.layout.fontSize || 'medium';
  const spacing = resumeData.layout.spacing || 'balanced';
  const fontSizeClasses = getFontSizeClasses(fontSize);
  const spacingClass = getSpacingClass(spacing);

  return (
    <div className="p-12 h-full overflow-y-auto" style={{ fontFamily }}>
      {renderHeader(resumeData, accentColor, fontSize)}
      
      {/* Render sections in order */}
      {resumeData.layout.sectionOrder.map((sectionId) => {
        if (!shouldShowSection(sectionId, resumeData)) return null;
        return <React.Fragment key={sectionId}>{sectionRenderer(sectionId, accentColor, fontSizeClasses, spacingClass)}</React.Fragment>;
      })}
    </div>
  );
}

