import { 
  Document, 
  Packer, 
  Paragraph, 
  TextRun, 
  HeadingLevel, 
  AlignmentType,
  BorderStyle,
  WidthType,
  Table,
  TableRow,
  TableCell,
  ShadingType,
  VerticalAlign,
} from 'docx';
import { saveAs } from 'file-saver';
import { toast } from 'sonner';
import type { ResumeData } from '../dashboard/components/ResumeBuilderPage';
import type { ATSAnalysisResult } from '../lib/cvsaathi-export/atsReportGenerator';
import type { SkillGapResults, SkillGapProfile } from '../lib/cvsaathi-export/skillGapReportGenerator';

// Import types - these should match the interfaces in ResumeBuilderPage
type PersonalInfo = {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  portfolio: string;
  github: string;
  headline: string;
};

type Experience = {
  id: string;
  company: string;
  title: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  bullets: string[];
};

type Education = {
  id: string;
  institution: string;
  degree: string;
  field: string;
  graduationYear: string;
  gpa: string;
  showGpa: boolean;
  honors: string[];
};

type Project = {
  id: string;
  name: string;
  description: string;
  technologies: string[];
  link: string;
  date: string;
};

/**
 * Map web fonts to Word-compatible fonts
 */
function mapFontToWord(fontFamily: string, templateId: string): string {
  const baseFont = fontFamily.split(',')[0].trim().replace(/['"]/g, '');
  
  const fontMap: Record<string, string> = {
    // Modern Sans
    'Inter': 'Calibri',
    'Poppins': 'Calibri',
    'Roboto': 'Calibri',
    'Open Sans': 'Calibri',
    'Lato': 'Calibri',
    'Montserrat': 'Calibri',
    'Nunito': 'Calibri',
    'Raleway': 'Calibri',
    'Comfortaa': 'Calibri',
    'Quicksand': 'Calibri',
    'Work Sans': 'Calibri',
    
    // Serif
    'Georgia': 'Georgia',
    'Times New Roman': 'Times New Roman',
    'Garamond': 'Garamond',
    'Playfair Display': 'Garamond',
    'Merriweather': 'Georgia',
    'Lora': 'Georgia',
    'Crimson Text': 'Times New Roman',
    'Libre Baskerville': 'Times New Roman',
    'Cormorant Garamond': 'Garamond',
    'EB Garamond': 'Garamond',
    
    // Monospace
    'Courier New': 'Courier New',
    'Monaco': 'Courier New',
    'Consolas': 'Consolas',
    'Roboto Mono': 'Courier New',
    'Source Code Pro': 'Courier New',
    'Fira Code': 'Courier New',
    
    // System
    'Helvetica': 'Arial',
    'Arial': 'Arial',
  };
  
  // Template-specific defaults if font not found
  if (!fontMap[baseFont]) {
    if (templateId === 'classic' || templateId === 'academic' || templateId === 'executive') {
      return 'Times New Roman';
    }
    if (templateId === 'technical') {
      return 'Courier New';
    }
    return 'Calibri';
  }
  
  return fontMap[baseFont];
}

/**
 * Get font sizes based on layout fontSize preference
 */
function getFontSizes(fontSize: 'small' | 'medium' | 'large') {
  switch (fontSize) {
    case 'small':
      return {
        name: 28,      // 14pt
        headline: 20, // 10pt
        heading: 22,  // 11pt
        body: 20,     // 10pt
        small: 18,    // 9pt
      };
    case 'large':
      return {
        name: 36,      // 18pt
        headline: 26,  // 13pt
        heading: 28,   // 14pt
        body: 24,      // 12pt
        small: 22,     // 11pt
      };
    default: // medium
      return {
        name: 32,      // 16pt
        headline: 22,  // 11pt
        heading: 24,   // 12pt
        body: 22,      // 11pt
        small: 20,     // 10pt
      };
  }
}

/**
 * Get spacing based on layout spacing preference
 */
function getSpacing(spacing: 'compact' | 'balanced' | 'spacious') {
  switch (spacing) {
    case 'compact':
      return { before: 120, after: 120 };
    case 'spacious':
      return { before: 360, after: 360 };
    default: // balanced
      return { before: 240, after: 240 };
  }
}

/**
 * Convert hex color to 6-digit format (remove #)
 */
function hexToWordColor(hex: string): string {
  return hex.replace('#', '').toUpperCase();
}

/**
 * Get template-specific section title
 */
function getSectionTitle(sectionId: string, templateId: string): string {
  const titles: Record<string, Record<string, string>> = {
    summary: {
      'classic': 'PROFESSIONAL SUMMARY',
      'academic': 'ABSTRACT',
      'executive': 'EXECUTIVE SUMMARY',
      'technical': '> SUMMARY',
      'minimal': 'Summary',
      'creative': 'Summary',
      'modern-pro': 'Professional Summary',
      'modern-two': 'Professional Summary',
      'default': 'Professional Summary',
    },
    experience: {
      'classic': 'PROFESSIONAL EXPERIENCE',
      'executive': 'PROFESSIONAL EXPERIENCE',
      'technical': '> EXPERIENCE',
      'minimal': 'Experience',
      'creative': 'Experience',
      'modern-pro': 'Experience',
      'modern-two': 'Experience',
      'default': 'Experience',
    },
    education: {
      'classic': 'EDUCATION',
      'academic': 'EDUCATION',
      'executive': 'EDUCATION',
      'technical': '> EDUCATION',
      'minimal': 'Education',
      'creative': 'Education',
      'modern-pro': 'Education',
      'modern-two': 'Education',
      'default': 'Education',
    },
    skills: {
      'classic': 'SKILLS',
      'technical': '> SKILLS',
      'minimal': 'Skills',
      'creative': 'Skills',
      'modern-pro': 'Skills',
      'modern-two': 'Skills',
      'default': 'Skills',
    },
    projects: {
      'classic': 'PROJECTS',
      'technical': '> PROJECTS',
      'minimal': 'Projects',
      'creative': 'Projects',
      'modern-pro': 'Projects',
      'modern-two': 'Projects',
      'default': 'Projects',
    },
    certifications: {
      'classic': 'CERTIFICATIONS',
      'technical': '> CERTIFICATIONS',
      'minimal': 'Certifications',
      'creative': 'Certifications',
      'modern-pro': 'Certifications',
      'modern-two': 'Certifications',
      'default': 'Certifications',
    },
    languages: {
      'classic': 'LANGUAGES',
      'technical': '> LANGUAGES',
      'minimal': 'Languages',
      'creative': 'Languages',
      'modern-pro': 'Languages',
      'modern-two': 'Languages',
      'default': 'Languages',
    },
    awards: {
      'classic': 'AWARDS',
      'technical': '> AWARDS',
      'minimal': 'Awards',
      'creative': 'Awards',
      'modern-pro': 'Awards',
      'modern-two': 'Awards',
      'default': 'Awards',
    },
  };

  const sectionTitles = titles[sectionId] || {};
  return sectionTitles[templateId] || sectionTitles['default'] || sectionId.toUpperCase();
}

/**
 * Build section header paragraph based on template
 */
function buildSectionHeader(
  title: string,
  templateId: string,
  accentColor: string,
  fontSize: number,
  fontFamily: string
): Paragraph {
  const color = hexToWordColor(accentColor);
  
  // Creative template: colored background with white text
  if (templateId === 'creative') {
    return new Paragraph({
      children: [
        new TextRun({
          text: title,
          bold: true,
          size: fontSize,
          color: 'FFFFFF', // White text
          shading: {
            type: ShadingType.SOLID,
            color: color,
            fill: color,
          },
        }),
      ],
      spacing: { before: 240, after: 180 }, // More space after for creative
    });
  }

  // Classic, Academic, Executive: border bottom
  if (templateId === 'classic' || templateId === 'academic' || templateId === 'executive') {
    return new Paragraph({
      children: [
        new TextRun({
          text: title,
          bold: true,
          size: fontSize,
          color: color,
          font: fontFamily,
        }),
      ],
      heading: HeadingLevel.HEADING_1,
      border: {
        bottom: {
          color: color,
          size: templateId === 'executive' ? 8 : 4, // 4pt or 2pt
          style: BorderStyle.SINGLE,
        },
      },
      spacing: { before: 240, after: 120 },
      alignment: templateId === 'academic' ? AlignmentType.CENTER : AlignmentType.LEFT,
    });
  }

  // Technical: uppercase, monospace-like
  if (templateId === 'technical') {
    return new Paragraph({
      children: [
        new TextRun({
          text: title,
          bold: true,
          size: fontSize,
          color: color,
          font: fontFamily,
          allCaps: true,
        }),
      ],
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 240, after: 120 },
    });
  }

  // Minimal: light, simple
  if (templateId === 'minimal') {
    return new Paragraph({
      children: [
        new TextRun({
          text: title.toUpperCase(),
          size: fontSize - 4, // Smaller
          color: color,
          font: fontFamily,
        }),
      ],
      spacing: { before: 240, after: 120 },
    });
  }

  // Modern Pro, Modern Two Column - uppercase styling, colored, no underline
  if (templateId === 'modern-pro' || templateId === 'modern-two') {
    return new Paragraph({
      children: [
        new TextRun({
          text: title.toUpperCase(), // Uppercase the text (e.g., "PROFESSIONAL SUMMARY")
          bold: true,
          size: fontSize,
          color: color,
          font: fontFamily,
        }),
      ],
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 240, after: 120 },
    });
  }

  // Default: uppercase, colored, with underline
  return new Paragraph({
    children: [
      new TextRun({
        text: title.toUpperCase(),
        bold: true,
        size: fontSize,
        color: color,
        font: fontFamily,
      }),
    ],
    heading: HeadingLevel.HEADING_1,
    border: {
      bottom: {
        color: color,
        size: 4, // 2pt
        style: BorderStyle.SINGLE,
      },
    },
    spacing: { before: 240, after: 120 },
  });
}

/**
 * Export resume data to DOCX format with template-aware styling
 */
export async function exportResumeToDocx(
  resumeData: ResumeData,
  fileName: string = 'resume'
): Promise<void> {
  try {
    // Get styling preferences
    const accentColor = resumeData.layout.accentColor || '#14b8a6';
    const fontFamily = mapFontToWord(resumeData.layout.fontFamily || 'Inter, sans-serif', resumeData.templateId);
    const fontSize = resumeData.layout.fontSize || 'medium';
    const spacing = resumeData.layout.spacing || 'balanced';
    const headerStyle = resumeData.layout.headerStyle || 'centered';
    const columns = resumeData.layout.columns || 1;
    
    const fontSizes = getFontSizes(fontSize);
    const spacingConfig = getSpacing(spacing);
    const templateId = resumeData.templateId;

    // Handle two-column layout
    if (templateId === 'modern-two' && columns === 2) {
      try {
        console.log('Building two-column document...', { templateId, columns });
        const doc = buildTwoColumnDocument(
          resumeData,
          accentColor,
          fontSizes,
          fontFamily,
          spacingConfig
        );
        const blob = await Packer.toBlob(doc);
        const fullFileName = fileName.endsWith('.docx') ? fileName : `${fileName}.docx`;
        saveAs(blob, fullFileName);
        toast.success('DOCX downloaded successfully');
        return;
      } catch (error: any) {
        console.error('Two-column export error:', error);
        toast.error('Failed to export two-column layout. Please try again.');
        throw error;
      }
    }

    // Single column layout
    const children: Paragraph[] = [];

    // Build header section with template-aware styling
    children.push(...buildHeader(
      resumeData.personalInfo,
      accentColor,
      fontSizes,
      fontFamily,
      headerStyle,
      templateId,
      spacingConfig
    ));

    // Build sections based on visibility and order
    const sections = getOrderedSections(resumeData);
    
    for (const section of sections) {
      switch (section.id) {
        case 'summary':
          if (resumeData.layout.sectionVisibility.summary && resumeData.summary) {
            children.push(...buildSummary(
              resumeData.summary,
              templateId,
              accentColor,
              fontSizes,
              fontFamily,
              spacingConfig
            ));
          }
          break;
        case 'experience':
          if (resumeData.layout.sectionVisibility.experience && resumeData.experiences.length > 0) {
            children.push(...buildExperience(
              resumeData.experiences,
              templateId,
              accentColor,
              fontSizes,
              fontFamily,
              spacingConfig
            ));
          }
          break;
        case 'education':
          if (resumeData.layout.sectionVisibility.education && resumeData.education.length > 0) {
            children.push(...buildEducation(
              resumeData.education,
              templateId,
              accentColor,
              fontSizes,
              fontFamily,
              spacingConfig
            ));
          }
          break;
        case 'skills':
          if (resumeData.layout.sectionVisibility.skills && 
              (resumeData.technicalSkills.length > 0 || resumeData.softSkills.length > 0)) {
            children.push(...buildSkills(
              resumeData.technicalSkills,
              resumeData.softSkills,
              templateId,
              accentColor,
              fontSizes,
              fontFamily,
              spacingConfig
            ));
          }
          break;
        case 'projects':
          if (resumeData.layout.sectionVisibility.projects && resumeData.projects.length > 0) {
            children.push(...buildProjects(
              resumeData.projects,
              templateId,
              accentColor,
              fontSizes,
              fontFamily,
              spacingConfig
            ));
          }
          break;
        case 'certifications':
          if (resumeData.layout.sectionVisibility.certifications && resumeData.certifications.length > 0) {
            children.push(...buildCertifications(
              resumeData.certifications,
              templateId,
              accentColor,
              fontSizes,
              fontFamily,
              spacingConfig
            ));
          }
          break;
        case 'languages':
          if (resumeData.layout.sectionVisibility.languages && resumeData.languages.length > 0) {
            children.push(...buildLanguages(
              resumeData.languages,
              templateId,
              accentColor,
              fontSizes,
              fontFamily,
              spacingConfig
            ));
          }
          break;
        case 'awards':
          if (resumeData.layout.sectionVisibility.awards && resumeData.awards.length > 0) {
            children.push(...buildAwards(
              resumeData.awards,
              templateId,
              accentColor,
              fontSizes,
              fontFamily,
              spacingConfig
            ));
          }
          break;
      }
    }

    // Create document
    const doc = new Document({
      sections: [{
        properties: {
          page: {
            size: {
              orientation: 'portrait',
              width: '8.5in',
              height: '11in',
            },
            margin: {
              top: 720,    // 0.5 inch
              right: 720,
              bottom: 720,
              left: 720,
            },
          },
        },
        children,
      }],
    });

    // Generate and download
    const blob = await Packer.toBlob(doc);
    const fullFileName = fileName.endsWith('.docx') ? fileName : `${fileName}.docx`;
    saveAs(blob, fullFileName);
    toast.success('DOCX downloaded successfully');
  } catch (error: any) {
    console.error('DOCX export error:', error);
    toast.error('Failed to generate DOCX file. Please try again.');
    throw error;
  }
}

/**
 * Get ordered sections based on layout preferences
 */
function getOrderedSections(resumeData: ResumeData): Array<{ id: string; label: string }> {
  const sectionMap: Record<string, string> = {
    summary: 'PROFESSIONAL SUMMARY',
    experience: 'PROFESSIONAL EXPERIENCE',
    education: 'EDUCATION',
    skills: 'SKILLS',
    projects: 'PROJECTS',
    certifications: 'CERTIFICATIONS',
    languages: 'LANGUAGES',
    awards: 'AWARDS',
  };

  // Use custom order if available, otherwise use default
  const order = resumeData.layout.sectionOrder.length > 0
    ? resumeData.layout.sectionOrder
    : ['summary', 'experience', 'education', 'skills', 'projects', 'certifications', 'languages', 'awards'];

  return order.map(id => ({ id, label: sectionMap[id] || id.toUpperCase() }));
}

/**
 * Build two-column document layout
 */
function buildTwoColumnDocument(
  resumeData: ResumeData,
  accentColor: string,
  fontSizes: ReturnType<typeof getFontSizes>,
  fontFamily: string,
  spacingConfig: ReturnType<typeof getSpacing>
): Document {
  const color = hexToWordColor(accentColor);
  const templateId = 'modern-two';
  
  // Left column sections: header, skills, languages, certifications
  const leftColumnChildren: Paragraph[] = [];
  const rightColumnChildren: Paragraph[] = [];
  
  // Build header in left column
  const headerParagraphs = buildTwoColumnHeader(
    resumeData.personalInfo,
    accentColor,
    fontSizes,
    fontFamily,
    spacingConfig
  );
  leftColumnChildren.push(...headerParagraphs);
  
  // Build sections
  const sections = getOrderedSections(resumeData);
  
  for (const section of sections) {
    const leftColumnSections = ['skills', 'languages', 'certifications'];
    const isLeftColumn = leftColumnSections.includes(section.id);
    
    switch (section.id) {
      case 'summary':
        if (resumeData.layout.sectionVisibility.summary && resumeData.summary) {
          rightColumnChildren.push(...buildSummary(
            resumeData.summary,
            templateId,
            accentColor,
            fontSizes,
            fontFamily,
            spacingConfig
          ));
        }
        break;
      case 'experience':
        if (resumeData.layout.sectionVisibility.experience && resumeData.experiences.length > 0) {
          rightColumnChildren.push(...buildExperience(
            resumeData.experiences,
            templateId,
            accentColor,
            fontSizes,
            fontFamily,
            spacingConfig
          ));
        }
        break;
      case 'education':
        if (resumeData.layout.sectionVisibility.education && resumeData.education.length > 0) {
          rightColumnChildren.push(...buildEducation(
            resumeData.education,
            templateId,
            accentColor,
            fontSizes,
            fontFamily,
            spacingConfig
          ));
        }
        break;
      case 'skills':
        if (resumeData.layout.sectionVisibility.skills && 
            (resumeData.technicalSkills.length > 0 || resumeData.softSkills.length > 0)) {
          leftColumnChildren.push(...buildSkills(
            resumeData.technicalSkills,
            resumeData.softSkills,
            templateId,
            accentColor,
            fontSizes,
            fontFamily,
            spacingConfig
          ));
        }
        break;
      case 'projects':
        if (resumeData.layout.sectionVisibility.projects && resumeData.projects.length > 0) {
          rightColumnChildren.push(...buildProjects(
            resumeData.projects,
            templateId,
            accentColor,
            fontSizes,
            fontFamily,
            spacingConfig
          ));
        }
        break;
      case 'certifications':
        if (resumeData.layout.sectionVisibility.certifications && resumeData.certifications.length > 0) {
          leftColumnChildren.push(...buildCertifications(
            resumeData.certifications,
            templateId,
            accentColor,
            fontSizes,
            fontFamily,
            spacingConfig
          ));
        }
        break;
      case 'languages':
        if (resumeData.layout.sectionVisibility.languages && resumeData.languages.length > 0) {
          leftColumnChildren.push(...buildLanguages(
            resumeData.languages,
            templateId,
            accentColor,
            fontSizes,
            fontFamily,
            spacingConfig
          ));
        }
        break;
      case 'awards':
        if (resumeData.layout.sectionVisibility.awards && resumeData.awards.length > 0) {
          rightColumnChildren.push(...buildAwards(
            resumeData.awards,
            templateId,
            accentColor,
            fontSizes,
            fontFamily,
            spacingConfig
          ));
        }
        break;
    }
  }
  
  // Create table with two columns (no borders for seamless layout)
  const table = new Table({
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 33.33, type: WidthType.PERCENTAGE },
            children: leftColumnChildren,
            verticalAlign: VerticalAlign.TOP,
            margins: {
              top: 0,
              right: 360, // 0.25 inch gap between columns
              bottom: 0,
              left: 0,
            },
          }),
          new TableCell({
            width: { size: 66.67, type: WidthType.PERCENTAGE },
            children: rightColumnChildren,
            verticalAlign: VerticalAlign.TOP,
            margins: {
              top: 0,
              right: 0,
              bottom: 0,
              left: 0,
            },
          }),
        ],
      }),
    ],
  });
  
  return new Document({
    sections: [{
      properties: {
        page: {
          size: {
            orientation: 'portrait',
            width: '8.5in',
            height: '11in',
          },
          margin: {
            top: 720,
            right: 720,
            bottom: 720,
            left: 720,
          },
        },
      },
      children: [table],
    }],
  });
}

/**
 * Build header for two-column layout (simplified, goes in left column)
 */
function buildTwoColumnHeader(
  personalInfo: PersonalInfo,
  accentColor: string,
  fontSizes: ReturnType<typeof getFontSizes>,
  fontFamily: string,
  spacingConfig: ReturnType<typeof getSpacing>
): Paragraph[] {
  const paragraphs: Paragraph[] = [];
  const color = hexToWordColor(accentColor);
  
  // Name
  paragraphs.push(
    new Paragraph({
      children: [
        new TextRun({
          text: personalInfo.fullName || 'Your Name',
          bold: true,
          size: fontSizes.name,
          color: color,
          font: fontFamily,
        }),
      ],
      heading: HeadingLevel.TITLE,
      spacing: { after: 120 },
    })
  );
  
  // Headline
  if (personalInfo.headline) {
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: personalInfo.headline,
            size: fontSizes.body,
            font: fontFamily,
          }),
        ],
        spacing: { after: 120 },
      })
    );
  }
  
  // Contact info (stacked vertically)
  if (personalInfo.email) {
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: personalInfo.email,
            size: fontSizes.small,
            font: fontFamily,
          }),
        ],
        spacing: { after: 60 },
      })
    );
  }
  if (personalInfo.phone) {
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: personalInfo.phone,
            size: fontSizes.small,
            font: fontFamily,
          }),
        ],
        spacing: { after: 60 },
      })
    );
  }
  if (personalInfo.location) {
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: personalInfo.location,
            size: fontSizes.small,
            font: fontFamily,
          }),
        ],
        spacing: { after: spacingConfig.after },
      })
    );
  }
  
  return paragraphs;
}

/**
 * Build header section with template-aware styling
 */
function buildHeader(
  personalInfo: PersonalInfo,
  accentColor: string,
  fontSizes: ReturnType<typeof getFontSizes>,
  fontFamily: string,
  headerStyle: 'centered' | 'left' | 'two-column',
  templateId: string,
  spacingConfig: ReturnType<typeof getSpacing>
): Paragraph[] {
  const paragraphs: Paragraph[] = [];
  const color = hexToWordColor(accentColor);
  
  // Creative template has special header with background
  if (templateId === 'creative') {
    // Name with background shading
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: personalInfo.fullName || 'Your Name',
            bold: true,
            size: fontSizes.name + 4, // Slightly larger
            color: color,
            font: fontFamily,
          }),
        ],
        heading: HeadingLevel.TITLE,
        alignment: AlignmentType.CENTER,
        spacing: { after: 120 },
        shading: {
          type: ShadingType.SOLID,
          color: 'F5F5F5', // Light background (approximation of accentColor15)
          fill: 'F5F5F5',
        },
      })
    );

    // Headline
    if (personalInfo.headline) {
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: personalInfo.headline,
              size: fontSizes.headline,
              bold: true,
              font: fontFamily,
            }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 120 },
        })
      );
    }

    // Contact info
    const contactInfo1: string[] = [];
    if (personalInfo.email) contactInfo1.push(personalInfo.email);
    if (personalInfo.phone) contactInfo1.push(personalInfo.phone);
    if (personalInfo.location) contactInfo1.push(personalInfo.location);

    if (contactInfo1.length > 0) {
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: contactInfo1.join(' • '),
              size: fontSizes.body,
              font: fontFamily,
            }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: spacingConfig.after },
        })
      );
    }

    return paragraphs;
  }
  
  const alignment = headerStyle === 'centered' ? AlignmentType.CENTER : AlignmentType.LEFT;

  // Name
  paragraphs.push(
    new Paragraph({
      children: [
        new TextRun({
          text: personalInfo.fullName || 'Your Name',
          bold: true,
          size: fontSizes.name,
          color: color,
          font: fontFamily,
        }),
      ],
      heading: HeadingLevel.TITLE,
      alignment: alignment,
      spacing: { after: 120 },
    })
  );

  // Headline (if present) - before contact info for some templates
  if (personalInfo.headline && (templateId === 'minimal' || templateId === 'academic')) {
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: personalInfo.headline,
            size: fontSizes.headline,
            italics: templateId === 'academic',
            font: fontFamily,
          }),
        ],
        alignment: alignment,
        spacing: { after: 120 },
      })
    );
  }

  // Contact info line 1
  const contactInfo1: string[] = [];
  if (personalInfo.email) contactInfo1.push(personalInfo.email);
  if (personalInfo.phone) contactInfo1.push(personalInfo.phone);
  if (personalInfo.location) contactInfo1.push(personalInfo.location);

  if (contactInfo1.length > 0) {
    const separator = templateId === 'minimal' ? ' / ' : ' | ';
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: contactInfo1.join(separator),
            size: fontSizes.body,
            font: fontFamily,
          }),
        ],
        alignment: alignment,
        spacing: { after: 60 },
      })
    );
  }

  // Contact info line 2 (LinkedIn, Portfolio, GitHub)
  const contactInfo2: string[] = [];
  if (personalInfo.linkedin) contactInfo2.push(`LinkedIn: ${personalInfo.linkedin}`);
  if (personalInfo.portfolio) contactInfo2.push(`Portfolio: ${personalInfo.portfolio}`);
  if (personalInfo.github) contactInfo2.push(`GitHub: ${personalInfo.github}`);

  if (contactInfo2.length > 0) {
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: contactInfo2.join(' | '),
            size: fontSizes.small,
            font: fontFamily,
          }),
        ],
        alignment: alignment,
        spacing: { after: 240 },
      })
    );
  }

  // Headline (if present) - after contact info for most templates
  if (personalInfo.headline && templateId !== 'minimal' && templateId !== 'academic') {
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: personalInfo.headline,
            size: fontSizes.headline,
            italics: templateId === 'classic' || templateId === 'academic',
            bold: templateId === 'executive',
            font: fontFamily,
          }),
        ],
        alignment: alignment,
        spacing: { after: spacingConfig.after },
      })
    );
  }

  // Add border for templates that use it
  if (templateId === 'classic' || templateId === 'academic' || templateId === 'executive' || 
      templateId === 'minimal' || (templateId === 'modern-pro' && headerStyle === 'centered')) {
    const lastPara = paragraphs[paragraphs.length - 1];
    if (lastPara) {
      lastPara.border = {
        bottom: {
          color: color,
          size: templateId === 'executive' ? 8 : templateId === 'minimal' ? 2 : 4,
          style: BorderStyle.SINGLE,
        },
      };
      lastPara.spacing = { ...lastPara.spacing, after: spacingConfig.after };
    }
  }

  return paragraphs;
}

/**
 * Build summary section with template-aware styling
 */
function buildSummary(
  summary: string,
  templateId: string,
  accentColor: string,
  fontSizes: ReturnType<typeof getFontSizes>,
  fontFamily: string,
  spacingConfig: ReturnType<typeof getSpacing>
): Paragraph[] {
  const title = getSectionTitle('summary', templateId);
  const color = hexToWordColor(accentColor);

  return [
    buildSectionHeader(title, templateId, accentColor, fontSizes.heading, fontFamily),
    new Paragraph({
      children: [
        new TextRun({
          text: summary,
          size: fontSizes.body,
          font: fontFamily,
        }),
      ],
      spacing: { after: spacingConfig.after },
      alignment: templateId === 'academic' ? AlignmentType.JUSTIFIED : AlignmentType.LEFT,
    }),
  ];
}

/**
 * Build experience section with template-aware styling
 */
function buildExperience(
  experiences: Experience[],
  templateId: string,
  accentColor: string,
  fontSizes: ReturnType<typeof getFontSizes>,
  fontFamily: string,
  spacingConfig: ReturnType<typeof getSpacing>
): Paragraph[] {
  const paragraphs: Paragraph[] = [];
  const title = getSectionTitle('experience', templateId);
  const color = hexToWordColor(accentColor);

  paragraphs.push(buildSectionHeader(title, templateId, accentColor, fontSizes.heading, fontFamily));

  experiences.forEach((exp, index) => {
    // Creative template: colored box with background shading
    if (templateId === 'creative') {
      // Title and company in a box
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: exp.title || 'Job Title',
              bold: true,
              size: fontSizes.heading,
              font: fontFamily,
            }),
            new TextRun({
              text: exp.company ? ` | ${exp.company}` : '',
              size: fontSizes.heading,
              font: fontFamily,
            }),
          ],
          border: {
            left: {
              color: color,
              size: 8, // 4pt
              style: BorderStyle.SINGLE,
            },
            top: {
              color: color,
              size: 1,
              style: BorderStyle.SINGLE,
            },
            right: {
              color: color,
              size: 1,
              style: BorderStyle.SINGLE,
            },
            bottom: {
              color: color,
              size: 1,
              style: BorderStyle.SINGLE,
            },
          },
          shading: {
            type: ShadingType.SOLID,
            color: 'F5F5F5', // Light gray background (approximation of accentColor05)
            fill: 'F5F5F5',
          },
          spacing: { before: index === 0 ? 0 : 180, after: 60 },
        })
      );
    } else if (templateId === 'technical') {
      // Technical template: left border-4, uppercase title
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: (exp.title || 'JOB_TITLE').toUpperCase(),
              bold: true,
              size: fontSizes.heading,
              font: fontFamily,
            }),
          ],
          border: {
            left: {
              color: color,
              size: 8, // 4pt border
              style: BorderStyle.SINGLE,
            },
          },
          spacing: { before: index === 0 ? 0 : spacingConfig.before, after: 60 },
          indent: { left: 360 }, // Padding left
        })
      );
    } else if (templateId === 'modern-pro' || templateId === 'modern-two') {
      // Modern Pro: left border accent
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: exp.title || 'Job Title',
              bold: true,
              size: fontSizes.heading,
              font: fontFamily,
            }),
            new TextRun({
              text: exp.company ? ` | ${exp.company}` : '',
              size: fontSizes.heading,
              font: fontFamily,
            }),
          ],
          border: {
            left: {
              color: color,
              size: 4, // 2pt border
              style: BorderStyle.SINGLE,
            },
          },
          spacing: { before: index === 0 ? 0 : spacingConfig.before, after: 60 },
          indent: { left: 180 }, // Padding left
        })
      );
    } else {
      // Job title and company
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: exp.title || 'Job Title',
              bold: true,
              size: fontSizes.heading,
              font: fontFamily,
            }),
            new TextRun({
              text: exp.company ? ` | ${exp.company}` : '',
              size: fontSizes.heading,
              font: fontFamily,
            }),
          ],
          spacing: { before: index === 0 ? 0 : spacingConfig.before, after: 60 },
        })
      );
    }

    // Company (for technical template, shown separately)
    if (templateId === 'technical' && exp.company) {
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `${exp.company}${exp.location ? ` | ${exp.location}` : ''}`,
              bold: true,
              size: fontSizes.body,
              font: fontFamily,
            }),
          ],
          spacing: { after: 60 },
          indent: { left: 360 },
        })
      );
    }
    
    // Dates and location
    const dateRange = exp.current
      ? `${exp.startDate} - Present`
      : `${exp.startDate} - ${exp.endDate || 'Present'}`;
    
    let dateText: string;
    if (templateId === 'technical') {
      dateText = `[${exp.startDate || 'START'} - ${exp.current ? 'PRESENT' : exp.endDate || 'END'}]${exp.location && !exp.company ? ` | ${exp.location}` : ''}`;
    } else {
      dateText = `${dateRange}${exp.location ? ` | ${exp.location}` : ''}`;
    }
    
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: dateText,
            italics: templateId !== 'technical' && templateId !== 'minimal',
            size: templateId === 'minimal' ? fontSizes.small : fontSizes.small,
            font: fontFamily,
          }),
        ],
        spacing: { after: 120 },
        indent: templateId === 'modern-pro' || templateId === 'modern-two' ? { left: 180 } : 
                templateId === 'technical' ? { left: 360 } : undefined,
      })
    );

    // Bullet points
    if (exp.bullets && exp.bullets.length > 0) {
      exp.bullets.forEach((bullet) => {
        if (bullet.trim()) {
          // Technical template: colored bullet
          if (templateId === 'technical') {
            paragraphs.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: '• ',
                    size: fontSizes.body,
                    color: color,
                    font: fontFamily,
                  }),
                  new TextRun({
                    text: bullet,
                    size: fontSizes.body,
                    font: fontFamily,
                  }),
                ],
                spacing: { after: 60 },
                indent: { left: 360 },
              })
            );
          } else {
            paragraphs.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: '• ',
                    size: fontSizes.body,
                    font: fontFamily,
                  }),
                  new TextRun({
                    text: bullet,
                    size: fontSizes.body,
                    font: fontFamily,
                  }),
                ],
                spacing: { after: templateId === 'executive' ? 120 : 60 },
                indent: { 
                  left: templateId === 'modern-pro' || templateId === 'modern-two' ? 540 : 360
                },
              })
            );
          }
        }
      });
    }

    paragraphs.push(
      new Paragraph({
        spacing: { after: spacingConfig.after },
      })
    );
  });

  return paragraphs;
}

/**
 * Build education section with template-aware styling
 */
function buildEducation(
  education: Education[],
  templateId: string,
  accentColor: string,
  fontSizes: ReturnType<typeof getFontSizes>,
  fontFamily: string,
  spacingConfig: ReturnType<typeof getSpacing>
): Paragraph[] {
  const paragraphs: Paragraph[] = [];
  const title = getSectionTitle('education', templateId);

  paragraphs.push(buildSectionHeader(title, templateId, accentColor, fontSizes.heading, fontFamily));

  education.forEach((edu, index) => {
    // Degree and institution
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: edu.degree || 'Degree',
            bold: true,
            size: fontSizes.heading,
            font: fontFamily,
          }),
          new TextRun({
            text: edu.institution ? ` | ${edu.institution}` : '',
            size: fontSizes.heading,
            font: fontFamily,
          }),
        ],
        spacing: { before: index === 0 ? 0 : spacingConfig.before, after: 60 },
      })
    );

    // Field, graduation year, GPA
    const details: string[] = [];
    if (edu.field) details.push(edu.field);
    if (edu.graduationYear) details.push(edu.graduationYear);
    if (edu.showGpa && edu.gpa) details.push(`GPA: ${edu.gpa}`);

    if (details.length > 0) {
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: details.join(' | '),
              italics: templateId !== 'technical',
              size: fontSizes.small,
              font: fontFamily,
            }),
          ],
          spacing: { after: 120 },
        })
      );
    }

    // Honors
    if (edu.honors && edu.honors.length > 0) {
      edu.honors.forEach((honor) => {
        paragraphs.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `• ${honor}`,
                size: fontSizes.body,
                font: fontFamily,
              }),
            ],
            spacing: { after: 60 },
            indent: { left: 360 },
          })
        );
      });
    }

    paragraphs.push(
      new Paragraph({
        spacing: { after: spacingConfig.after },
      })
    );
  });

  return paragraphs;
}

/**
 * Build skills section with template-aware styling
 */
function buildSkills(
  technicalSkills: string[],
  softSkills: string[],
  templateId: string,
  accentColor: string,
  fontSizes: ReturnType<typeof getFontSizes>,
  fontFamily: string,
  spacingConfig: ReturnType<typeof getSpacing>
): Paragraph[] {
  const paragraphs: Paragraph[] = [];
  const title = getSectionTitle('skills', templateId);

  paragraphs.push(buildSectionHeader(title, templateId, accentColor, fontSizes.heading, fontFamily));

  if (technicalSkills.length > 0) {
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: 'Technical: ',
            bold: true,
            size: fontSizes.body,
            font: fontFamily,
          }),
          new TextRun({
            text: technicalSkills.join(', '),
            size: fontSizes.body,
            font: fontFamily,
          }),
        ],
        spacing: { after: 120 },
      })
    );
  }

  if (softSkills.length > 0) {
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: 'Soft Skills: ',
            bold: true,
            size: fontSizes.body,
            font: fontFamily,
          }),
          new TextRun({
            text: softSkills.join(', '),
            size: fontSizes.body,
            font: fontFamily,
          }),
        ],
        spacing: { after: spacingConfig.after },
      })
    );
  }

  return paragraphs;
}

/**
 * Build projects section with template-aware styling
 */
function buildProjects(
  projects: Project[],
  templateId: string,
  accentColor: string,
  fontSizes: ReturnType<typeof getFontSizes>,
  fontFamily: string,
  spacingConfig: ReturnType<typeof getSpacing>
): Paragraph[] {
  const paragraphs: Paragraph[] = [];
  const title = getSectionTitle('projects', templateId);
  const color = hexToWordColor(accentColor);

  paragraphs.push(buildSectionHeader(title, templateId, accentColor, fontSizes.heading, fontFamily));

  projects.forEach((project, index) => {
    // Project name
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: project.name || 'Project Name',
            bold: true,
            size: fontSizes.heading,
            font: fontFamily,
          }),
          ...(project.link
            ? [
                new TextRun({
                  text: ` | ${project.link}`,
                  size: fontSizes.small,
                  color: '0066CC',
                  font: fontFamily,
                }),
              ]
            : []),
        ],
        spacing: { before: index === 0 ? 0 : spacingConfig.before, after: 60 },
      })
    );

    // Date and technologies
    const details: string[] = [];
    if (project.date) details.push(project.date);
    if (project.technologies && project.technologies.length > 0) {
      details.push(project.technologies.join(', '));
    }

    if (details.length > 0) {
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: details.join(' | '),
              italics: true,
              size: fontSizes.small,
              font: fontFamily,
            }),
          ],
          spacing: { after: 120 },
        })
      );
    }

    // Description
    if (project.description) {
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: project.description,
              size: fontSizes.body,
              font: fontFamily,
            }),
          ],
          spacing: { after: spacingConfig.after },
        })
      );
    }
  });

  return paragraphs;
}

/**
 * Build certifications section with template-aware styling
 */
function buildCertifications(
  certifications: string[],
  templateId: string,
  accentColor: string,
  fontSizes: ReturnType<typeof getFontSizes>,
  fontFamily: string,
  spacingConfig: ReturnType<typeof getSpacing>
): Paragraph[] {
  const paragraphs: Paragraph[] = [];
  const title = getSectionTitle('certifications', templateId);

  paragraphs.push(buildSectionHeader(title, templateId, accentColor, fontSizes.heading, fontFamily));

  certifications.forEach((cert) => {
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `• ${cert}`,
            size: fontSizes.body,
            font: fontFamily,
          }),
        ],
        spacing: { after: 60 },
        indent: { left: 360 },
      })
    );
  });

  return paragraphs;
}

/**
 * Build languages section with template-aware styling
 */
function buildLanguages(
  languages: string[],
  templateId: string,
  accentColor: string,
  fontSizes: ReturnType<typeof getFontSizes>,
  fontFamily: string,
  spacingConfig: ReturnType<typeof getSpacing>
): Paragraph[] {
  const paragraphs: Paragraph[] = [];
  const title = getSectionTitle('languages', templateId);

  paragraphs.push(buildSectionHeader(title, templateId, accentColor, fontSizes.heading, fontFamily));

  paragraphs.push(
    new Paragraph({
      children: [
        new TextRun({
          text: languages.join(', '),
          size: fontSizes.body,
          font: fontFamily,
        }),
      ],
      spacing: { after: spacingConfig.after },
    })
  );

  return paragraphs;
}

/**
 * Build awards section with template-aware styling
 */
function buildAwards(
  awards: string[],
  templateId: string,
  accentColor: string,
  fontSizes: ReturnType<typeof getFontSizes>,
  fontFamily: string,
  spacingConfig: ReturnType<typeof getSpacing>
): Paragraph[] {
  const paragraphs: Paragraph[] = [];
  const title = getSectionTitle('awards', templateId);

  paragraphs.push(buildSectionHeader(title, templateId, accentColor, fontSizes.heading, fontFamily));

  awards.forEach((award) => {
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `• ${award}`,
            size: fontSizes.body,
            font: fontFamily,
          }),
        ],
        spacing: { after: 60 },
        indent: { left: 360 },
      })
    );
  });

  return paragraphs;
}

/**
 * Export ATS Analysis Report to DOCX format
 */
export async function exportATSReportToDocx(
  result: ATSAnalysisResult,
  recommendations: string[] = [],
  fileName: string = 'ATS_Report'
): Promise<void> {
  try {
    const children: Paragraph[] = [];
    const fontFamily = 'Calibri';
    const fontSizes = {
      title: 36,      // 18pt
      heading: 28,   // 14pt
      subheading: 24, // 12pt
      body: 22,       // 11pt
      small: 20,      // 10pt
    };

    // Title
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: 'ATS Compatibility Report',
            bold: true,
            size: fontSizes.title,
            font: fontFamily,
          }),
        ],
        heading: HeadingLevel.TITLE,
        spacing: { after: 120 },
      })
    );

    // Subtitle
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: 'Generated by Estel – AI Career Companion',
            size: fontSizes.small,
            color: '666666',
            font: fontFamily,
          }),
        ],
        spacing: { after: 360 },
      })
    );

    // Overall Score Section
    const scoreColor = result.overallScore >= 80 ? '16A34A' : 
                      result.overallScore >= 60 ? 'CA8A04' : 'DC2626';
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: 'Overall Score',
            bold: true,
            size: fontSizes.subheading,
            font: fontFamily,
          }),
        ],
        spacing: { before: 240, after: 120 },
      })
    );
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: result.overallScore.toString(),
            bold: true,
            size: 48, // 24pt
            color: scoreColor,
            font: fontFamily,
          }),
          new TextRun({
            text: ' / 100',
            size: fontSizes.body,
            color: '666666',
            font: fontFamily,
          }),
        ],
        spacing: { after: 180 },
      })
    );

    // File Details
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: 'File Details',
            bold: true,
            size: fontSizes.subheading,
            font: fontFamily,
          }),
        ],
        spacing: { before: 240, after: 120 },
      })
    );
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `File Name: ${result.fileName || 'Unknown'}`,
            size: fontSizes.body,
            font: fontFamily,
          }),
        ],
        spacing: { after: 60 },
      })
    );
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `File Size: ${result.fileSize || 'Unknown'}`,
            size: fontSizes.body,
            font: fontFamily,
          }),
        ],
        spacing: { after: 60 },
      })
    );
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `Analyzed: ${result.uploadDate || 'Unknown'}`,
            size: fontSizes.body,
            font: fontFamily,
          }),
        ],
        spacing: { after: 360 },
      })
    );

    // Score Breakdown
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: 'Score Breakdown',
            bold: true,
            size: fontSizes.heading,
            font: fontFamily,
          }),
        ],
        spacing: { before: 240, after: 180 },
      })
    );

    Object.entries(result.scores).forEach(([key, value]) => {
      const itemColor = value >= 80 ? '16A34A' : value >= 60 ? 'CA8A04' : 'DC2626';
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `${key.charAt(0).toUpperCase() + key.slice(1)}: `,
              size: fontSizes.body,
              font: fontFamily,
            }),
            new TextRun({
              text: value.toString(),
              bold: true,
              size: fontSizes.body,
              color: itemColor,
              font: fontFamily,
            }),
            new TextRun({
              text: ' / 100',
              size: fontSizes.body,
              color: '666666',
              font: fontFamily,
            }),
          ],
          spacing: { after: 120 },
        })
      );
    });

    // Critical Issues
    if (result.criticalIssues.length > 0) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `Critical Issues (${result.criticalIssues.length})`,
              bold: true,
              size: fontSizes.heading,
              color: 'DC2626',
              font: fontFamily,
            }),
          ],
          spacing: { before: 360, after: 120 },
        })
      );
      result.criticalIssues.forEach((issue) => {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: '• ',
                size: fontSizes.body,
                color: 'DC2626',
                font: fontFamily,
              }),
              new TextRun({
                text: issue,
                size: fontSizes.body,
                color: 'DC2626',
                font: fontFamily,
              }),
            ],
            spacing: { after: 60 },
            indent: { left: 360 },
          })
        );
      });
    }

    // Warnings
    if (result.warnings.length > 0) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `Warnings (${result.warnings.length})`,
              bold: true,
              size: fontSizes.heading,
              color: 'CA8A04',
              font: fontFamily,
            }),
          ],
          spacing: { before: 360, after: 120 },
        })
      );
      result.warnings.forEach((warning) => {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: '• ',
                size: fontSizes.body,
                color: 'CA8A04',
                font: fontFamily,
              }),
              new TextRun({
                text: warning,
                size: fontSizes.body,
                color: 'CA8A04',
                font: fontFamily,
              }),
            ],
            spacing: { after: 60 },
            indent: { left: 360 },
          })
        );
      });
    }

    // Passed Checks
    if (result.passed.length > 0) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `Passed Checks (${result.passed.length})`,
              bold: true,
              size: fontSizes.heading,
              color: '16A34A',
              font: fontFamily,
            }),
          ],
          spacing: { before: 360, after: 120 },
        })
      );
      result.passed.forEach((item) => {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: '• ',
                size: fontSizes.body,
                color: '16A34A',
                font: fontFamily,
              }),
              new TextRun({
                text: item,
                size: fontSizes.body,
                color: '16A34A',
                font: fontFamily,
              }),
            ],
            spacing: { after: 60 },
            indent: { left: 360 },
          })
        );
      });
    }

    // Found Keywords
    if (result.foundKeywords.length > 0) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `Found Keywords (${result.foundKeywords.length})`,
              bold: true,
              size: fontSizes.heading,
              color: '059669',
              font: fontFamily,
            }),
          ],
          spacing: { before: 360, after: 120 },
        })
      );
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: result.foundKeywords.join(', '),
              size: fontSizes.body,
              font: fontFamily,
            }),
          ],
          spacing: { after: 240 },
        })
      );
    }

    // Missing Keywords
    if (result.missingKeywords.length > 0) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `Missing Keywords (${result.missingKeywords.length})`,
              bold: true,
              size: fontSizes.heading,
              color: 'DC2626',
              font: fontFamily,
            }),
          ],
          spacing: { before: 240, after: 120 },
        })
      );
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: result.missingKeywords.join(', '),
              size: fontSizes.body,
              font: fontFamily,
            }),
          ],
          spacing: { after: 240 },
        })
      );
    }

    // Suggested Keywords
    if (result.suggestedKeywords.length > 0) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `Suggested Keywords (${result.suggestedKeywords.length})`,
              bold: true,
              size: fontSizes.heading,
              color: '2563EB',
              font: fontFamily,
            }),
          ],
          spacing: { before: 240, after: 120 },
        })
      );
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: result.suggestedKeywords.join(', '),
              size: fontSizes.body,
              font: fontFamily,
            }),
          ],
          spacing: { after: 240 },
        })
      );
    }

    // AI Recommendations
    if (recommendations.length > 0) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: 'AI Recommendations',
              bold: true,
              size: fontSizes.heading,
              font: fontFamily,
            }),
          ],
          spacing: { before: 360, after: 120 },
        })
      );
      recommendations.forEach((rec, index) => {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `${index + 1}. `,
                bold: true,
                size: fontSizes.body,
                font: fontFamily,
              }),
              new TextRun({
                text: rec,
                size: fontSizes.body,
                font: fontFamily,
              }),
            ],
            spacing: { after: 120 },
            indent: { left: 360 },
          })
        );
      });
    }

    // Footer
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `© ${new Date().getFullYear()} CVSaathi`,
            size: fontSizes.small,
            color: '666666',
            font: fontFamily,
          }),
        ],
        spacing: { before: 480 },
        alignment: AlignmentType.CENTER,
      })
    );

    // Create document
    const doc = new Document({
      sections: [{
        properties: {
          page: {
            size: {
              orientation: 'portrait',
              width: '8.5in',
              height: '11in',
            },
            margin: {
              top: 720,    // 0.5 inch
              right: 720,
              bottom: 720,
              left: 720,
            },
          },
        },
        children,
      }],
    });

    // Generate and download
    const blob = await Packer.toBlob(doc);
    const fullFileName = fileName.endsWith('.docx') ? fileName : `${fileName}.docx`;
    saveAs(blob, fullFileName);
    toast.success('ATS Report DOCX downloaded successfully');
  } catch (error: any) {
    console.error('ATS Report DOCX export error:', error);
    toast.error('Failed to generate DOCX file. Please try again.');
    throw error;
  }
}
/**
 * Export Skill Gap Analysis Report to DOCX format
 * This is a temporary file - will be merged into docxExportService.ts
 */
export async function exportSkillGapReportToDocx(
  profile: SkillGapProfile,
  results: SkillGapResults,
  aiRecommendations: any[] = [],
  fileName: string = 'Skill_Gap_Report'
): Promise<void> {
  try {
    const children: Paragraph[] = [];
    const fontFamily = 'Calibri';
    const fontSizes = {
      title: 36,      // 18pt
      heading: 28,   // 14pt
      subheading: 24, // 12pt
      body: 22,       // 11pt
      small: 20,      // 10pt
    };

    const score = results.overallScore ?? results.matchPercentage ?? 0;
    const scoreColor = score >= 80 ? '16A34A' : score >= 60 ? 'CA8A04' : 'DC2626';

    // Title
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: 'Skill Gap Analysis Report',
            bold: true,
            size: fontSizes.title,
            font: fontFamily,
          }),
        ],
        heading: HeadingLevel.TITLE,
        spacing: { after: 120 },
      })
    );

    // Subtitle
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: 'Generated by Estel – AI Career Companion',
            size: fontSizes.small,
            color: '666666',
            font: fontFamily,
          }),
        ],
        spacing: { after: 360 },
      })
    );

    // Overall Score Section
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: 'Overall Match Score',
            bold: true,
            size: fontSizes.subheading,
            font: fontFamily,
          }),
        ],
        spacing: { before: 240, after: 120 },
      })
    );
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: score.toString(),
            bold: true,
            size: 48, // 24pt
            color: scoreColor,
            font: fontFamily,
          }),
          new TextRun({
            text: ' / 100',
            size: fontSizes.body,
            color: '666666',
            font: fontFamily,
          }),
        ],
        spacing: { after: 180 },
      })
    );

    // Profile Summary
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: 'Target Profile',
            bold: true,
            size: fontSizes.subheading,
            font: fontFamily,
          }),
        ],
        spacing: { before: 240, after: 120 },
      })
    );
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `Target Role: ${profile.targetRole || 'Not specified'}`,
            size: fontSizes.body,
            font: fontFamily,
          }),
        ],
        spacing: { after: 60 },
      })
    );
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `Industry: ${profile.industry || 'Not specified'}`,
            size: fontSizes.body,
            font: fontFamily,
          }),
        ],
        spacing: { after: 60 },
      })
    );
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `Location: ${profile.location || 'Not specified'}`,
            size: fontSizes.body,
            font: fontFamily,
          }),
        ],
        spacing: { after: 60 },
      })
    );
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `Education: ${profile.education || 'Not specified'}`,
            size: fontSizes.body,
            font: fontFamily,
          }),
        ],
        spacing: { after: 360 },
      })
    );

    // Skill Distribution
    const dist = results.skillDistribution || { technical: 0, softSkills: 0, domain: 0 };
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: 'Skill Distribution',
            bold: true,
            size: fontSizes.heading,
            font: fontFamily,
          }),
        ],
        spacing: { before: 240, after: 180 },
      })
    );
    
    // Technical Skills
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: 'Technical Skills: ',
            bold: true,
            size: fontSizes.body,
            font: fontFamily,
          }),
          new TextRun({
            text: `${dist.technical}%`,
            bold: true,
            size: fontSizes.body,
            color: '14B8A6',
            font: fontFamily,
          }),
        ],
        spacing: { after: 120 },
      })
    );

    // Soft Skills
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: 'Soft Skills: ',
            bold: true,
            size: fontSizes.body,
            font: fontFamily,
          }),
          new TextRun({
            text: `${dist.softSkills}%`,
            bold: true,
            size: fontSizes.body,
            color: 'A855F7',
            font: fontFamily,
          }),
        ],
        spacing: { after: 120 },
      })
    );

    // Domain Knowledge
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: 'Domain Knowledge: ',
            bold: true,
            size: fontSizes.body,
            font: fontFamily,
          }),
          new TextRun({
            text: `${dist.domain}%`,
            bold: true,
            size: fontSizes.body,
            color: '3B82F6',
            font: fontFamily,
          }),
        ],
        spacing: { after: 360 },
      })
    );

    // Skill Gaps Table
    if (results.skillGaps && results.skillGaps.length > 0) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `Skill Gaps Identified (${results.skillGaps.length})`,
              bold: true,
              size: fontSizes.heading,
              font: fontFamily,
            }),
          ],
          spacing: { before: 240, after: 180 },
        })
      );

      // Create table for skill gaps
      const tableRows = results.skillGaps.map((gap) => {
        const priorityColor = gap.priority === 'Critical' ? 'DC2626' :
                             gap.priority === 'High' ? 'F97316' :
                             gap.priority === 'Medium' ? 'EAB308' : '6B7280';
        
        return new TableRow({
          children: [
            new TableCell({
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: gap.name,
                      bold: true,
                      size: fontSizes.body,
                      font: fontFamily,
                    }),
                  ],
                }),
              ],
              verticalAlign: VerticalAlign.TOP,
            }),
            new TableCell({
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: gap.category || 'N/A',
                      size: fontSizes.small,
                      font: fontFamily,
                    }),
                  ],
                }),
              ],
              verticalAlign: VerticalAlign.TOP,
            }),
            new TableCell({
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: gap.priority,
                      bold: true,
                      size: fontSizes.small,
                      color: priorityColor,
                      font: fontFamily,
                    }),
                  ],
                }),
              ],
              verticalAlign: VerticalAlign.TOP,
            }),
            new TableCell({
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: `${gap.current}/5`,
                      size: fontSizes.body,
                      font: fontFamily,
                    }),
                  ],
                }),
              ],
              verticalAlign: VerticalAlign.TOP,
            }),
            new TableCell({
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: `${gap.required}/5`,
                      size: fontSizes.body,
                      font: fontFamily,
                    }),
                  ],
                }),
              ],
              verticalAlign: VerticalAlign.TOP,
            }),
            new TableCell({
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: gap.gap.toString(),
                      bold: true,
                      size: fontSizes.body,
                      color: priorityColor,
                      font: fontFamily,
                    }),
                  ],
                }),
              ],
              verticalAlign: VerticalAlign.TOP,
            }),
          ],
        });
      });

      const skillGapsTable = new Table({
        rows: [
          // Header row
          new TableRow({
            children: [
              new TableCell({
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: 'Skill',
                        bold: true,
                        size: fontSizes.body,
                        font: fontFamily,
                      }),
                    ],
                  }),
                ],
                shading: {
                  type: ShadingType.SOLID,
                  color: 'F3F4F6',
                  fill: 'F3F4F6',
                },
              }),
              new TableCell({
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: 'Category',
                        bold: true,
                        size: fontSizes.body,
                        font: fontFamily,
                      }),
                    ],
                  }),
                ],
                shading: {
                  type: ShadingType.SOLID,
                  color: 'F3F4F6',
                  fill: 'F3F4F6',
                },
              }),
              new TableCell({
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: 'Priority',
                        bold: true,
                        size: fontSizes.body,
                        font: fontFamily,
                      }),
                    ],
                  }),
                ],
                shading: {
                  type: ShadingType.SOLID,
                  color: 'F3F4F6',
                  fill: 'F3F4F6',
                },
              }),
              new TableCell({
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: 'Current',
                        bold: true,
                        size: fontSizes.body,
                        font: fontFamily,
                      }),
                    ],
                  }),
                ],
                shading: {
                  type: ShadingType.SOLID,
                  color: 'F3F4F6',
                  fill: 'F3F4F6',
                },
              }),
              new TableCell({
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: 'Required',
                        bold: true,
                        size: fontSizes.body,
                        font: fontFamily,
                      }),
                    ],
                  }),
                ],
                shading: {
                  type: ShadingType.SOLID,
                  color: 'F3F4F6',
                  fill: 'F3F4F6',
                },
              }),
              new TableCell({
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: 'Gap',
                        bold: true,
                        size: fontSizes.body,
                        font: fontFamily,
                      }),
                    ],
                  }),
                ],
                shading: {
                  type: ShadingType.SOLID,
                  color: 'F3F4F6',
                  fill: 'F3F4F6',
                },
              }),
            ],
          }),
          ...tableRows,
        ],
      });

      children.push(skillGapsTable);
      children.push(
        new Paragraph({
          spacing: { after: 360 },
        })
      );
    }

    // Learning Recommendations
    const recommendations = aiRecommendations.length > 0 ? aiRecommendations : (results.recommendations || []);
    if (recommendations.length > 0) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: 'Recommended Learning Paths',
              bold: true,
              size: fontSizes.heading,
              font: fontFamily,
            }),
          ],
          spacing: { before: 240, after: 180 },
        })
      );

      recommendations.forEach((rec, index) => {
        // Handle both string recommendations and structured learning paths
        if (typeof rec === 'string') {
          children.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: `${index + 1}. `,
                  bold: true,
                  size: fontSizes.body,
                  font: fontFamily,
                }),
                new TextRun({
                  text: rec,
                  size: fontSizes.body,
                  font: fontFamily,
                }),
              ],
              spacing: { after: 120 },
              indent: { left: 360 },
            })
          );
        } else if (rec.title) {
          // Structured learning path
          children.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: `${index + 1}. ${rec.title}`,
                  bold: true,
                  size: fontSizes.body,
                  font: fontFamily,
                }),
              ],
              spacing: { after: 60 },
              indent: { left: 360 },
            })
          );
          const details: string[] = [];
          if (rec.provider) details.push(`Provider: ${rec.provider}`);
          if (rec.duration) details.push(`Duration: ${rec.duration}`);
          if (rec.level) details.push(`Level: ${rec.level}`);
          if (rec.priority) details.push(`Priority: ${rec.priority}`);
          
          if (details.length > 0) {
            children.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: details.join(' • '),
                    size: fontSizes.small,
                    color: '666666',
                    font: fontFamily,
                  }),
                ],
                spacing: { after: 120 },
                indent: { left: 540 },
              })
            );
          }
        }
      });
    }

    // 30/60/90 Day Learning Roadmap
    if (results.timeline && Object.keys(results.timeline).length > 0) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: '30/60/90 Day Learning Roadmap',
              bold: true,
              size: fontSizes.heading,
              font: fontFamily,
            }),
          ],
          spacing: { before: 360, after: 180 },
        })
      );

      const timelineOrder = ['30days', '60days', '90days'];
      timelineOrder.forEach((period) => {
        const tasks = results.timeline![period] || [];
        if (tasks.length > 0) {
          const periodLabel = period === '30days' ? 'First 30 Days' :
                            period === '60days' ? 'Next 30 Days (60 total)' :
                            'Final 30 Days (90 total)';
          
          children.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: periodLabel,
                  bold: true,
                  size: fontSizes.subheading,
                  color: '0891B2',
                  font: fontFamily,
                }),
              ],
              spacing: { before: period === '30days' ? 0 : 240, after: 120 },
            })
          );

          tasks.forEach((task) => {
            children.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: '✓ ',
                    size: fontSizes.body,
                    color: '14B8A6',
                    font: fontFamily,
                  }),
                  new TextRun({
                    text: task,
                    size: fontSizes.body,
                    font: fontFamily,
                  }),
                ],
                spacing: { after: 60 },
                indent: { left: 360 },
              })
            );
          });
        }
      });
    }

    // Salary Insights
    if (results.salaryRange) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: 'Salary Insights',
              bold: true,
              size: fontSizes.heading,
              font: fontFamily,
            }),
          ],
          spacing: { before: 360, after: 120 },
        })
      );
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `${results.salaryRange.currency}${Math.round((results.salaryRange.min || 0) / 1000)}K - ${Math.round((results.salaryRange.max || 0) / 1000)}K`,
              bold: true,
              size: fontSizes.subheading,
              font: fontFamily,
            }),
          ],
          spacing: { after: 60 },
        })
      );
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: 'Per annum',
              size: fontSizes.small,
              color: '666666',
              font: fontFamily,
            }),
          ],
          spacing: { after: 240 },
        })
      );
    }

    // Top Companies
    if ((results as any).topCompanies && (results as any).topCompanies.length > 0) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: 'Top Companies Hiring',
              bold: true,
              size: fontSizes.heading,
              font: fontFamily,
            }),
          ],
          spacing: { before: 240, after: 120 },
        })
      );
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: (results as any).topCompanies.join(', '),
              size: fontSizes.body,
              font: fontFamily,
            }),
          ],
          spacing: { after: 240 },
        })
      );
    }

    // Market Insights (from charts data)
    if ((results as any).radarData || (results as any).demandData) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: 'Market Insights',
              bold: true,
              size: fontSizes.heading,
              font: fontFamily,
            }),
          ],
          spacing: { before: 240, after: 120 },
        })
      );

      if ((results as any).radarData && (results as any).radarData.length > 0) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: 'Skill Comparison Summary:',
                bold: true,
                size: fontSizes.body,
                font: fontFamily,
              }),
            ],
            spacing: { after: 60 },
          })
        );
        (results as any).radarData.forEach((item: any) => {
          children.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: `• ${item.skill}: Current ${item.current}% | Required ${item.required}%`,
                  size: fontSizes.body,
                  font: fontFamily,
                }),
              ],
              spacing: { after: 40 },
              indent: { left: 360 },
            })
          );
        });
      }

      if ((results as any).demandData && (results as any).demandData.length > 0) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: 'Market Demand Trend:',
                bold: true,
                size: fontSizes.body,
                font: fontFamily,
              }),
            ],
            spacing: { before: 180, after: 60 },
          })
        );
        const trendText = (results as any).demandData
          .map((item: any) => `${item.month}: ${item.demand}%`)
          .join(' | ');
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: trendText,
                size: fontSizes.body,
                font: fontFamily,
              }),
            ],
            spacing: { after: 240 },
          })
        );
      }
    }

    // Footer
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `© ${new Date().getFullYear()} CVSaathi`,
            size: fontSizes.small,
            color: '666666',
            font: fontFamily,
          }),
        ],
        spacing: { before: 480 },
        alignment: AlignmentType.CENTER,
      })
    );

    // Create document
    const doc = new Document({
      sections: [{
        properties: {
          page: {
            size: {
              orientation: 'portrait',
              width: '8.5in',
              height: '11in',
            },
            margin: {
              top: 720,    // 0.5 inch
              right: 720,
              bottom: 720,
              left: 720,
            },
          },
        },
        children,
      }],
    });

    // Generate and download
    const blob = await Packer.toBlob(doc);
    const fullFileName = fileName.endsWith('.docx') ? fileName : `${fileName}.docx`;
    saveAs(blob, fullFileName);
    toast.success('Skill Gap Report DOCX downloaded successfully');
  } catch (error: any) {
    console.error('Skill Gap Report DOCX export error:', error);
    toast.error('Failed to generate DOCX file. Please try again.');
    throw error;
  }
}

/**
 * Export Performance Metrics Report to DOCX format
 */
export async function exportPerformanceMetricsToDocx(
  metrics: {
    stats: {
      profileCompleteness: number;
      resumesCreated: number;
      aiSessionsCompleted: number;
      interviewsCompleted: number;
      applicationsSubmitted: number;
      totalTimeSpent: number;
    };
    timeRange: '7d' | '30d' | '90d' | 'all';
    totalApplications: number;
    interviewSuccessPct: number;
    avgResponseDays: number;
    activityData: Array<{ date: string; resumes: number; interviews: number; aiSessions: number }>;
    successRateData: Array<{ week: string; applications: number; responses: number; interviews: number }>;
    goalProgress: Array<{ goal: string; current: number; target: number; percentage: number; status: string }>;
    radarData: Array<{ skill: string; current: number; target: number }>;
    weeklyActivity: number[][];
    skillDistribution: Array<{ name: string; value: number; color: string }>;
    recentAchievements: Array<{ id: number; title: string; description: string; date: string }>;
  },
  fileName: string = 'Performance_Metrics_Report'
): Promise<void> {
  try {
    const children: Paragraph[] = [];
    const fontFamily = 'Calibri';
    const fontSizes = {
      title: 36,      // 18pt
      heading: 28,   // 14pt
      subheading: 24, // 12pt
      body: 22,       // 11pt
      small: 20,      // 10pt
    };

    const timeRangeLabel = metrics.timeRange === '7d' ? 'Last 7 Days' :
                          metrics.timeRange === '30d' ? 'Last 30 Days' :
                          metrics.timeRange === '90d' ? 'Last 90 Days' : 'All Time';

    // Title
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: 'Performance Metrics Report',
            bold: true,
            size: fontSizes.title,
            font: fontFamily,
          }),
        ],
        heading: HeadingLevel.TITLE,
        spacing: { after: 120 },
      })
    );

    // Subtitle
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `Generated by Estel – AI Career Companion | ${timeRangeLabel} | ${new Date().toLocaleDateString()}`,
            size: fontSizes.small,
            color: '666666',
            font: fontFamily,
          }),
        ],
        spacing: { after: 360 },
      })
    );

    // Key Metrics Overview
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: 'Key Metrics Overview',
            bold: true,
            size: fontSizes.heading,
            font: fontFamily,
          }),
        ],
        spacing: { before: 240, after: 180 },
      })
    );

    // Key Metrics Table
    const keyMetricsTable = new Table({
      rows: [
        new TableRow({
          children: [
            new TableCell({
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: 'Metric',
                      bold: true,
                      size: fontSizes.body,
                      font: fontFamily,
                    }),
                  ],
                }),
              ],
              shading: {
                type: ShadingType.SOLID,
                color: 'F3F4F6',
                fill: 'F3F4F6',
              },
            }),
            new TableCell({
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: 'Value',
                      bold: true,
                      size: fontSizes.body,
                      font: fontFamily,
                    }),
                  ],
                }),
              ],
              shading: {
                type: ShadingType.SOLID,
                color: 'F3F4F6',
                fill: 'F3F4F6',
              },
            }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: 'Profile Strength',
                      size: fontSizes.body,
                      font: fontFamily,
                    }),
                  ],
                }),
              ],
              verticalAlign: VerticalAlign.TOP,
            }),
            new TableCell({
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: `${metrics.stats.profileCompleteness}%`,
                      bold: true,
                      size: fontSizes.body,
                      color: '14B8A6',
                      font: fontFamily,
                    }),
                  ],
                }),
              ],
              verticalAlign: VerticalAlign.TOP,
            }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: 'Total Applications',
                      size: fontSizes.body,
                      font: fontFamily,
                    }),
                  ],
                }),
              ],
              verticalAlign: VerticalAlign.TOP,
            }),
            new TableCell({
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: metrics.totalApplications.toString(),
                      bold: true,
                      size: fontSizes.body,
                      color: 'A855F7',
                      font: fontFamily,
                    }),
                  ],
                }),
              ],
              verticalAlign: VerticalAlign.TOP,
            }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: 'Interview Success Rate',
                      size: fontSizes.body,
                      font: fontFamily,
                    }),
                  ],
                }),
              ],
              verticalAlign: VerticalAlign.TOP,
            }),
            new TableCell({
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: `${metrics.interviewSuccessPct}%`,
                      bold: true,
                      size: fontSizes.body,
                      color: '3B82F6',
                      font: fontFamily,
                    }),
                  ],
                }),
              ],
              verticalAlign: VerticalAlign.TOP,
            }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: 'Average Response Time',
                      size: fontSizes.body,
                      font: fontFamily,
                    }),
                  ],
                }),
              ],
              verticalAlign: VerticalAlign.TOP,
            }),
            new TableCell({
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: `${metrics.avgResponseDays} days`,
                      bold: true,
                      size: fontSizes.body,
                      color: '10B981',
                      font: fontFamily,
                    }),
                  ],
                }),
              ],
              verticalAlign: VerticalAlign.TOP,
            }),
          ],
        }),
      ],
    });

    children.push(keyMetricsTable);
    children.push(
      new Paragraph({
        spacing: { after: 360 },
      })
    );

    // Goal Progress
    if (metrics.goalProgress && metrics.goalProgress.length > 0) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: 'Goal Progress',
              bold: true,
              size: fontSizes.heading,
              font: fontFamily,
            }),
          ],
          spacing: { before: 240, after: 180 },
        })
      );

      const goalProgressTable = new Table({
        rows: [
          new TableRow({
            children: [
              new TableCell({
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: 'Goal',
                        bold: true,
                        size: fontSizes.body,
                        font: fontFamily,
                      }),
                    ],
                  }),
                ],
                shading: {
                  type: ShadingType.SOLID,
                  color: 'F3F4F6',
                  fill: 'F3F4F6',
                },
              }),
              new TableCell({
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: 'Progress',
                        bold: true,
                        size: fontSizes.body,
                        font: fontFamily,
                      }),
                    ],
                  }),
                ],
                shading: {
                  type: ShadingType.SOLID,
                  color: 'F3F4F6',
                  fill: 'F3F4F6',
                },
              }),
              new TableCell({
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: 'Status',
                        bold: true,
                        size: fontSizes.body,
                        font: fontFamily,
                      }),
                    ],
                  }),
                ],
                shading: {
                  type: ShadingType.SOLID,
                  color: 'F3F4F6',
                  fill: 'F3F4F6',
                },
              }),
            ],
          }),
          ...metrics.goalProgress.map((goal) => {
            const statusColor = goal.status === 'completed' ? '16A34A' : 'CA8A04';
            return new TableRow({
              children: [
                new TableCell({
                  children: [
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: goal.goal,
                          size: fontSizes.body,
                          font: fontFamily,
                        }),
                      ],
                    }),
                  ],
                  verticalAlign: VerticalAlign.TOP,
                }),
                new TableCell({
                  children: [
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: `${goal.current} / ${goal.target} (${Math.round(goal.percentage)}%)`,
                          size: fontSizes.body,
                          font: fontFamily,
                        }),
                      ],
                    }),
                  ],
                  verticalAlign: VerticalAlign.TOP,
                }),
                new TableCell({
                  children: [
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: goal.status === 'completed' ? 'Completed' : 'In Progress',
                          bold: true,
                          size: fontSizes.body,
                          color: statusColor,
                          font: fontFamily,
                        }),
                      ],
                    }),
                  ],
                  verticalAlign: VerticalAlign.TOP,
                }),
              ],
            });
          }),
        ],
      });

      children.push(goalProgressTable);
      children.push(
        new Paragraph({
          spacing: { after: 360 },
        })
      );
    }

    // Activity Summary
    if (metrics.activityData && metrics.activityData.length > 0) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: 'Activity Trends Summary',
              bold: true,
              size: fontSizes.heading,
              font: fontFamily,
            }),
          ],
          spacing: { before: 240, after: 180 },
        })
      );

      const totalResumes = metrics.activityData.reduce((sum, d) => sum + d.resumes, 0);
      const totalInterviews = metrics.activityData.reduce((sum, d) => sum + d.interviews, 0);
      const totalAISessions = metrics.activityData.reduce((sum, d) => sum + d.aiSessions, 0);

      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `Total Resumes Created: ${totalResumes}`,
              size: fontSizes.body,
              font: fontFamily,
            }),
          ],
          spacing: { after: 60 },
        })
      );
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `Total Interviews Completed: ${totalInterviews}`,
              size: fontSizes.body,
              font: fontFamily,
            }),
          ],
          spacing: { after: 60 },
        })
      );
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `Total AI Sessions: ${totalAISessions}`,
              size: fontSizes.body,
              font: fontFamily,
            }),
          ],
          spacing: { after: 180 },
        })
      );

      // Recent activity highlights
      const recentActivity = metrics.activityData.slice(-7);
      if (recentActivity.length > 0) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: 'Recent Activity (Last 7 Days):',
                bold: true,
                size: fontSizes.subheading,
                font: fontFamily,
              }),
            ],
            spacing: { before: 120, after: 120 },
          })
        );

        recentActivity.forEach((day) => {
          if (day.resumes > 0 || day.interviews > 0 || day.aiSessions > 0) {
            children.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: `${day.date}: `,
                    bold: true,
                    size: fontSizes.body,
                    font: fontFamily,
                  }),
                  new TextRun({
                    text: `Resumes: ${day.resumes}, Interviews: ${day.interviews}, AI Sessions: ${day.aiSessions}`,
                    size: fontSizes.body,
                    font: fontFamily,
                  }),
                ],
                spacing: { after: 40 },
                indent: { left: 360 },
              })
            );
          }
        });
      }

      children.push(
        new Paragraph({
          spacing: { after: 360 },
        })
      );
    }

    // Application Success Funnel
    if (metrics.successRateData && metrics.successRateData.length > 0) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: 'Application Success Funnel',
              bold: true,
              size: fontSizes.heading,
              font: fontFamily,
            }),
          ],
          spacing: { before: 240, after: 180 },
        })
      );

      const funnelTable = new Table({
        rows: [
          new TableRow({
            children: [
              new TableCell({
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: 'Stage',
                        bold: true,
                        size: fontSizes.body,
                        font: fontFamily,
                      }),
                    ],
                  }),
                ],
                shading: {
                  type: ShadingType.SOLID,
                  color: 'F3F4F6',
                  fill: 'F3F4F6',
                },
              }),
              new TableCell({
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: 'Count',
                        bold: true,
                        size: fontSizes.body,
                        font: fontFamily,
                      }),
                    ],
                  }),
                ],
                shading: {
                  type: ShadingType.SOLID,
                  color: 'F3F4F6',
                  fill: 'F3F4F6',
                },
              }),
              new TableCell({
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: 'Conversion Rate',
                        bold: true,
                        size: fontSizes.body,
                        font: fontFamily,
                      }),
                    ],
                  }),
                ],
                shading: {
                  type: ShadingType.SOLID,
                  color: 'F3F4F6',
                  fill: 'F3F4F6',
                },
              }),
            ],
          }),
          ...metrics.successRateData.flatMap((data) => {
            const applications = data.applications;
            const responses = data.responses;
            const interviews = data.interviews;
            const responseRate = applications > 0 ? Math.round((responses / applications) * 100) : 0;
            const interviewRate = applications > 0 ? Math.round((interviews / applications) * 100) : 0;

            return [
              new TableRow({
                children: [
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: 'Applications',
                            size: fontSizes.body,
                            font: fontFamily,
                          }),
                        ],
                      }),
                    ],
                    verticalAlign: VerticalAlign.TOP,
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: applications.toString(),
                            bold: true,
                            size: fontSizes.body,
                            font: fontFamily,
                          }),
                        ],
                      }),
                    ],
                    verticalAlign: VerticalAlign.TOP,
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: '100%',
                            size: fontSizes.body,
                            font: fontFamily,
                          }),
                        ],
                      }),
                    ],
                    verticalAlign: VerticalAlign.TOP,
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: 'Responses',
                            size: fontSizes.body,
                            font: fontFamily,
                          }),
                        ],
                      }),
                    ],
                    verticalAlign: VerticalAlign.TOP,
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: responses.toString(),
                            bold: true,
                            size: fontSizes.body,
                            font: fontFamily,
                          }),
                        ],
                      }),
                    ],
                    verticalAlign: VerticalAlign.TOP,
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: `${responseRate}%`,
                            size: fontSizes.body,
                            color: responseRate >= 50 ? '16A34A' : responseRate >= 25 ? 'CA8A04' : 'DC2626',
                            font: fontFamily,
                          }),
                        ],
                      }),
                    ],
                    verticalAlign: VerticalAlign.TOP,
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: 'Interviews',
                            size: fontSizes.body,
                            font: fontFamily,
                          }),
                        ],
                      }),
                    ],
                    verticalAlign: VerticalAlign.TOP,
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: interviews.toString(),
                            bold: true,
                            size: fontSizes.body,
                            font: fontFamily,
                          }),
                        ],
                      }),
                    ],
                    verticalAlign: VerticalAlign.TOP,
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: `${interviewRate}%`,
                            size: fontSizes.body,
                            color: interviewRate >= 30 ? '16A34A' : interviewRate >= 15 ? 'CA8A04' : 'DC2626',
                            font: fontFamily,
                          }),
                        ],
                      }),
                    ],
                    verticalAlign: VerticalAlign.TOP,
                  }),
                ],
              }),
            ];
          }),
        ],
      });

      children.push(funnelTable);
      children.push(
        new Paragraph({
          spacing: { after: 360 },
        })
      );
    }

    // Skills Assessment
    if (metrics.radarData && metrics.radarData.length > 0) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: 'Skills Assessment',
              bold: true,
              size: fontSizes.heading,
              font: fontFamily,
            }),
          ],
          spacing: { before: 240, after: 180 },
        })
      );

      const skillsTable = new Table({
        rows: [
          new TableRow({
            children: [
              new TableCell({
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: 'Skill',
                        bold: true,
                        size: fontSizes.body,
                        font: fontFamily,
                      }),
                    ],
                  }),
                ],
                shading: {
                  type: ShadingType.SOLID,
                  color: 'F3F4F6',
                  fill: 'F3F4F6',
                },
              }),
              new TableCell({
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: 'Current',
                        bold: true,
                        size: fontSizes.body,
                        font: fontFamily,
                      }),
                    ],
                  }),
                ],
                shading: {
                  type: ShadingType.SOLID,
                  color: 'F3F4F6',
                  fill: 'F3F4F6',
                },
              }),
              new TableCell({
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: 'Target',
                        bold: true,
                        size: fontSizes.body,
                        font: fontFamily,
                      }),
                    ],
                  }),
                ],
                shading: {
                  type: ShadingType.SOLID,
                  color: 'F3F4F6',
                  fill: 'F3F4F6',
                },
              }),
              new TableCell({
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: 'Gap',
                        bold: true,
                        size: fontSizes.body,
                        font: fontFamily,
                      }),
                    ],
                  }),
                ],
                shading: {
                  type: ShadingType.SOLID,
                  color: 'F3F4F6',
                  fill: 'F3F4F6',
                },
              }),
            ],
          }),
          ...metrics.radarData.map((skill) => {
            const gap = skill.target - skill.current;
            const gapColor = gap <= 5 ? '16A34A' : gap <= 15 ? 'CA8A04' : 'DC2626';
            return new TableRow({
              children: [
                new TableCell({
                  children: [
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: skill.skill,
                          size: fontSizes.body,
                          font: fontFamily,
                        }),
                      ],
                    }),
                  ],
                  verticalAlign: VerticalAlign.TOP,
                }),
                new TableCell({
                  children: [
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: skill.current.toString(),
                          size: fontSizes.body,
                          font: fontFamily,
                        }),
                      ],
                    }),
                  ],
                  verticalAlign: VerticalAlign.TOP,
                }),
                new TableCell({
                  children: [
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: skill.target.toString(),
                          size: fontSizes.body,
                          font: fontFamily,
                        }),
                      ],
                    }),
                  ],
                  verticalAlign: VerticalAlign.TOP,
                }),
                new TableCell({
                  children: [
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: gap.toString(),
                          bold: true,
                          size: fontSizes.body,
                          color: gapColor,
                          font: fontFamily,
                        }),
                      ],
                    }),
                  ],
                  verticalAlign: VerticalAlign.TOP,
                }),
              ],
            });
          }),
        ],
      });

      children.push(skillsTable);
      children.push(
        new Paragraph({
          spacing: { after: 360 },
        })
      );
    }

    // Activity Heatmap Summary
    if (metrics.weeklyActivity && metrics.weeklyActivity.length > 0) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: 'Activity Heatmap Summary',
              bold: true,
              size: fontSizes.heading,
              font: fontFamily,
            }),
          ],
          spacing: { before: 240, after: 120 },
        })
      );

      let totalActivity = 0;
      let activeDays = 0;
      metrics.weeklyActivity.forEach((week) => {
        week.forEach((day) => {
          totalActivity += day;
          if (day > 0) activeDays++;
        });
      });

      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `Total Activity Points: ${totalActivity}`,
              size: fontSizes.body,
              font: fontFamily,
            }),
          ],
          spacing: { after: 60 },
        })
      );
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `Active Days: ${activeDays} out of ${metrics.weeklyActivity.length * 7}`,
              size: fontSizes.body,
              font: fontFamily,
            }),
          ],
          spacing: { after: 60 },
        })
      );
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `Average Daily Activity: ${(totalActivity / (metrics.weeklyActivity.length * 7)).toFixed(1)}`,
              size: fontSizes.body,
              font: fontFamily,
            }),
          ],
          spacing: { after: 240 },
        })
      );
    }

    // Skill Distribution
    if (metrics.skillDistribution && metrics.skillDistribution.length > 0) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: 'Activity Distribution',
              bold: true,
              size: fontSizes.heading,
              font: fontFamily,
            }),
          ],
          spacing: { before: 240, after: 120 },
        })
      );

      const total = metrics.skillDistribution.reduce((sum, s) => sum + s.value, 0);
      metrics.skillDistribution.forEach((skill) => {
        const percentage = total > 0 ? Math.round((skill.value / total) * 100) : 0;
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `${skill.name}: `,
                bold: true,
                size: fontSizes.body,
                font: fontFamily,
              }),
              new TextRun({
                text: `${skill.value} (${percentage}%)`,
                size: fontSizes.body,
                font: fontFamily,
              }),
            ],
            spacing: { after: 60 },
            indent: { left: 360 },
          })
        );
      });

      children.push(
        new Paragraph({
          spacing: { after: 360 },
        })
      );
    }

    // Recent Achievements
    if (metrics.recentAchievements && metrics.recentAchievements.length > 0) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: 'Recent Achievements',
              bold: true,
              size: fontSizes.heading,
              font: fontFamily,
            }),
          ],
          spacing: { before: 240, after: 180 },
        })
      );

      metrics.recentAchievements.forEach((achievement, index) => {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `${index + 1}. ${achievement.title}`,
                bold: true,
                size: fontSizes.body,
                font: fontFamily,
              }),
            ],
            spacing: { after: 60 },
            indent: { left: 360 },
          })
        );
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: achievement.description,
                size: fontSizes.body,
                font: fontFamily,
              }),
            ],
            spacing: { after: 40 },
            indent: { left: 540 },
          })
        );
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `Earned: ${achievement.date}`,
                size: fontSizes.small,
                color: '666666',
                font: fontFamily,
              }),
            ],
            spacing: { after: 120 },
            indent: { left: 540 },
          })
        );
      });
    }

    // Overall Statistics
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: 'Overall Statistics',
            bold: true,
            size: fontSizes.heading,
            font: fontFamily,
          }),
        ],
        spacing: { before: 360, after: 180 },
      })
    );

    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `Total Resumes Created: ${metrics.stats.resumesCreated}`,
            size: fontSizes.body,
            font: fontFamily,
          }),
        ],
        spacing: { after: 60 },
      })
    );
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `Total AI Sessions: ${metrics.stats.aiSessionsCompleted}`,
            size: fontSizes.body,
            font: fontFamily,
          }),
        ],
        spacing: { after: 60 },
      })
    );
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `Total Interviews Completed: ${metrics.stats.interviewsCompleted}`,
            size: fontSizes.body,
            font: fontFamily,
          }),
        ],
        spacing: { after: 60 },
      })
    );
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `Total Applications Submitted: ${metrics.stats.applicationsSubmitted}`,
            size: fontSizes.body,
            font: fontFamily,
          }),
        ],
        spacing: { after: 60 },
      })
    );
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `Total Time Spent: ${Math.floor(metrics.stats.totalTimeSpent / 60)} hours ${metrics.stats.totalTimeSpent % 60} minutes`,
            size: fontSizes.body,
            font: fontFamily,
          }),
        ],
        spacing: { after: 240 },
      })
    );

    // Footer
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `© ${new Date().getFullYear()} CVSaathi`,
            size: fontSizes.small,
            color: '666666',
            font: fontFamily,
          }),
        ],
        spacing: { before: 480 },
        alignment: AlignmentType.CENTER,
      })
    );

    // Create document
    const doc = new Document({
      sections: [{
        properties: {
          page: {
            size: {
              orientation: 'portrait',
              width: '8.5in',
              height: '11in',
            },
            margin: {
              top: 720,    // 0.5 inch
              right: 720,
              bottom: 720,
              left: 720,
            },
          },
        },
        children,
      }],
    });

    // Generate and download
    const blob = await Packer.toBlob(doc);
    const fullFileName = fileName.endsWith('.docx') ? fileName : `${fileName}.docx`;
    saveAs(blob, fullFileName);
    toast.success('Performance Metrics DOCX downloaded successfully');
  } catch (error: any) {
    console.error('Performance Metrics DOCX export error:', error);
    toast.error('Failed to generate DOCX file. Please try again.');
    throw error;
  }
}

/**
 * Export Interview Performance Report to DOCX format
 */
export async function exportInterviewReportToDocx(
  interviewData: {
    role: string;
    industry: string;
    experienceLevel: string;
    averageScore: number;
    answeredCount: number;
    totalQuestions: number;
    durationMinutes: number;
    summary?: string;
    strengths?: string[];
    improvements?: string[];
    skillGaps?: string[];
    nextSteps?: string[];
    scores?: Record<string, number>;
    scoreExplanations?: Record<string, string>;
    userAnswers?: Array<{
      question: string;
      answer: string;
      feedback?: {
        score?: number;
        strengths?: string[];
        improvements?: string[];
      };
    }>;
  },
  fileName: string = 'Interview_Performance_Report'
): Promise<void> {
  try {
    const fontFamily = 'Calibri';
    const fontSizes = {
      title: 32,
      heading: 24,
      subheading: 18,
      body: 22,
      small: 18,
    };

    const children: (Paragraph | Table)[] = [];

    // Title
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: 'Interview Performance Report',
            bold: true,
            size: fontSizes.title,
            color: '7C3AED',
            font: fontFamily,
          }),
        ],
        spacing: { after: 240 },
        alignment: AlignmentType.CENTER,
      })
    );

    // Interview Details
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: 'Interview Details',
            bold: true,
            size: fontSizes.heading,
            font: fontFamily,
          }),
        ],
        spacing: { before: 240, after: 120 },
      })
    );

    const detailsTable = new Table({
      rows: [
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph('Role')],
              shading: { fill: 'F3F4F6' },
            }),
            new TableCell({
              children: [new Paragraph(interviewData.role || 'N/A')],
            }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph('Industry')],
              shading: { fill: 'F3F4F6' },
            }),
            new TableCell({
              children: [new Paragraph(interviewData.industry || 'N/A')],
            }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph('Experience Level')],
              shading: { fill: 'F3F4F6' },
            }),
            new TableCell({
              children: [new Paragraph(interviewData.experienceLevel || 'N/A')],
            }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph('Date')],
              shading: { fill: 'F3F4F6' },
            }),
            new TableCell({
              children: [new Paragraph(new Date().toLocaleDateString())],
            }),
          ],
        }),
      ],
      width: { size: 100, type: WidthType.PERCENTAGE },
    });

    children.push(detailsTable);

    // Performance Overview
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: 'Performance Overview',
            bold: true,
            size: fontSizes.heading,
            font: fontFamily,
          }),
        ],
        spacing: { before: 360, after: 120 },
      })
    );

    const overviewTable = new Table({
      rows: [
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph('Average Score')],
              shading: { fill: 'F3F4F6' },
            }),
            new TableCell({
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: `${interviewData.averageScore}/100`,
                      bold: true,
                      color: interviewData.averageScore >= 80 ? '16A34A' : interviewData.averageScore >= 60 ? 'CA8A04' : 'DC2626',
                    }),
                  ],
                }),
              ],
            }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph('Questions Completed')],
              shading: { fill: 'F3F4F6' },
            }),
            new TableCell({
              children: [
                new Paragraph(`${interviewData.answeredCount}/${interviewData.totalQuestions}`),
              ],
            }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph('Duration')],
              shading: { fill: 'F3F4F6' },
            }),
            new TableCell({
              children: [new Paragraph(`${interviewData.durationMinutes} minutes`)],
            }),
          ],
        }),
      ],
      width: { size: 100, type: WidthType.PERCENTAGE },
    });

    children.push(overviewTable);

    // Interview Summary
    if (interviewData.summary) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: 'Interview Summary',
              bold: true,
              size: fontSizes.heading,
              font: fontFamily,
            }),
          ],
          spacing: { before: 360, after: 120 },
        })
      );

      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: interviewData.summary,
              size: fontSizes.body,
              font: fontFamily,
            }),
          ],
          spacing: { after: 240 },
        })
      );
    }

    // Strengths
    if (interviewData.strengths && interviewData.strengths.length > 0) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: 'Strengths',
              bold: true,
              size: fontSizes.subheading,
              color: '16A34A',
              font: fontFamily,
            }),
          ],
          spacing: { before: 240, after: 120 },
        })
      );

      interviewData.strengths.forEach((strength) => {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: '✓ ',
                bold: true,
                color: '16A34A',
                size: fontSizes.body,
                font: fontFamily,
              }),
              new TextRun({
                text: strength,
                size: fontSizes.body,
                font: fontFamily,
              }),
            ],
            spacing: { after: 60 },
            indent: { left: 360 },
          })
        );
      });
    }

    // Areas for Improvement
    if (interviewData.improvements && interviewData.improvements.length > 0) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: 'Areas for Improvement',
              bold: true,
              size: fontSizes.subheading,
              color: 'EA580C',
              font: fontFamily,
            }),
          ],
          spacing: { before: 240, after: 120 },
        })
      );

      interviewData.improvements.forEach((improvement) => {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: '• ',
                bold: true,
                color: 'EA580C',
                size: fontSizes.body,
                font: fontFamily,
              }),
              new TextRun({
                text: improvement,
                size: fontSizes.body,
                font: fontFamily,
              }),
            ],
            spacing: { after: 60 },
            indent: { left: 360 },
          })
        );
      });
    }

    // Skill Gaps
    if (interviewData.skillGaps && interviewData.skillGaps.length > 0) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: 'Skill Gaps Identified',
              bold: true,
              size: fontSizes.subheading,
              color: 'CA8A04',
              font: fontFamily,
            }),
          ],
          spacing: { before: 240, after: 120 },
        })
      );

      interviewData.skillGaps.forEach((gap) => {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: '⚠ ',
                bold: true,
                color: 'CA8A04',
                size: fontSizes.body,
                font: fontFamily,
              }),
              new TextRun({
                text: gap,
                size: fontSizes.body,
                font: fontFamily,
              }),
            ],
            spacing: { after: 60 },
            indent: { left: 360 },
          })
        );
      });
    }

    // Recommended Next Steps
    if (interviewData.nextSteps && interviewData.nextSteps.length > 0) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: 'Recommended Next Steps',
              bold: true,
              size: fontSizes.subheading,
              color: '2563EB',
              font: fontFamily,
            }),
          ],
          spacing: { before: 240, after: 120 },
        })
      );

      interviewData.nextSteps.forEach((step) => {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: '→ ',
                bold: true,
                color: '2563EB',
                size: fontSizes.body,
                font: fontFamily,
              }),
              new TextRun({
                text: step,
                size: fontSizes.body,
                font: fontFamily,
              }),
            ],
            spacing: { after: 60 },
            indent: { left: 360 },
          })
        );
      });
    }

    // Detailed Scores
    if (interviewData.scores && Object.keys(interviewData.scores).length > 0) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: 'Detailed Scores',
              bold: true,
              size: fontSizes.heading,
              font: fontFamily,
            }),
          ],
          spacing: { before: 360, after: 120 },
        })
      );

      Object.entries(interviewData.scores).forEach(([key, value]) => {
        const scoreValue = Math.round(value * 10);
        const scoreColor = scoreValue >= 80 ? '16A34A' : scoreValue >= 60 ? 'CA8A04' : 'DC2626';
        const explanation = interviewData.scoreExplanations?.[key];

        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `${key.charAt(0).toUpperCase() + key.slice(1)}: `,
                bold: true,
                size: fontSizes.body,
                font: fontFamily,
              }),
              new TextRun({
                text: `${scoreValue}/100`,
                bold: true,
                color: scoreColor,
                size: fontSizes.body,
                font: fontFamily,
              }),
            ],
            spacing: { after: 60 },
          })
        );

        if (explanation) {
          children.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: explanation,
                  size: fontSizes.small,
                  color: '666666',
                  font: fontFamily,
                }),
              ],
              spacing: { after: 120 },
              indent: { left: 360 },
            })
          );
        }
      });
    }

    // Footer
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `© ${new Date().getFullYear()} CVSaathi`,
            size: fontSizes.small,
            color: '666666',
            font: fontFamily,
          }),
        ],
        spacing: { before: 480 },
        alignment: AlignmentType.CENTER,
      })
    );

    // Create document
    const doc = new Document({
      sections: [{
        properties: {
          page: {
            size: {
              orientation: 'portrait',
              width: '8.5in',
              height: '11in',
            },
            margin: {
              top: 720,
              right: 720,
              bottom: 720,
              left: 720,
            },
          },
        },
        children,
      }],
    });

    // Generate and download
    const blob = await Packer.toBlob(doc);
    const fullFileName = fileName.endsWith('.docx') ? fileName : `${fileName}.docx`;
    saveAs(blob, fullFileName);
    toast.success('Interview Performance Report DOCX downloaded successfully');
  } catch (error: any) {
    console.error('Interview Report DOCX export error:', error);
    toast.error('Failed to generate DOCX file. Please try again.');
    throw error;
  }
}

