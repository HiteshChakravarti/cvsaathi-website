import React from 'react';
import { ResumeData } from '../ResumeBuilderPage';
import { ModernProTemplate } from './ModernProTemplate';
import { ClassicTemplate } from './ClassicTemplate';
import { CreativeTemplate } from './CreativeTemplate';
import { TechnicalTemplate } from './TechnicalTemplate';
import { MinimalTemplate } from './MinimalTemplate';
import { ModernTwoColumnTemplate } from './ModernTwoColumnTemplate';
import { AcademicTemplate } from './AcademicTemplate';
import { ExecutiveTemplate } from './ExecutiveTemplate';

interface TemplateRendererProps {
  templateId: string;
  resumeData: ResumeData;
  isDark?: boolean;
}

export function TemplateRenderer({ templateId, resumeData, isDark = false }: TemplateRendererProps) {
  const commonProps = { resumeData, isDark };

  switch (templateId) {
    case 'modern-pro':
      return <ModernProTemplate {...commonProps} />;
    case 'classic':
      return <ClassicTemplate {...commonProps} />;
    case 'creative':
      return <CreativeTemplate {...commonProps} />;
    case 'technical':
      return <TechnicalTemplate {...commonProps} />;
    case 'minimal':
      return <MinimalTemplate {...commonProps} />;
    case 'modern-two':
      return <ModernTwoColumnTemplate {...commonProps} />;
    case 'academic':
      return <AcademicTemplate {...commonProps} />;
    case 'executive':
      return <ExecutiveTemplate {...commonProps} />;
    default:
      return <ModernProTemplate {...commonProps} />;
  }
}

