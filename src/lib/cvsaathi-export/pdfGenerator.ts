export interface ResumeDataPortable {
  title: string;
  template: string;
  personalInfo: {
    name: string;
    email: string;
    phone: string;
    location: string;
    linkedin: string;
    summary: string;
  };
  experience: Array<{
    company: string;
    title: string;
    start: string;
    end: string;
    desc: string;
  }>;
  education: Array<{
    school: string;
    degree: string;
    field: string;
    start: string;
    end: string;
    desc: string;
  }>;
  skills: string[];
  projects: Array<{
    name: string;
    description: string;
    link: string;
  }>;
  certifications: Array<{
    name: string;
    issuer: string;
    date: string;
    credentialId: string;
    expiryDate: string;
  }>;
}

export interface LayoutSettings {
  font: 'Arial' | 'Times New Roman' | 'Georgia' | 'Helvetica';
  fontSize: {
    body: 12 | 14 | 16;
    name: 24 | 28 | 32;
    sections: 18 | 20 | 22;
  };
  margins: {
    top: 20 | 30 | 40 | 80;
    bottom: 20 | 30 | 40 | 80;
    left: 20 | 30 | 40 | 80;
    right: 20 | 30 | 40 | 80;
  };
  alignment: {
    header: 'left' | 'center' | 'right';
    text: 'left' | 'justify';
  };
  colors: {
    primary: string;
    secondary: string;
  };
}

export interface ExportOptions {
  format: 'PDF';
  includeWatermark?: boolean;
  watermarkText?: string;
  layout?: LayoutSettings;
}

import resumeExportService from './resumeExportService';

export const generateResumeHTML = (
  resume: ResumeDataPortable,
  layout?: LayoutSettings,
  includeWatermark: boolean = false,
  watermarkText: string = 'CVSaathi'
): string => {
  const defaultLayout: LayoutSettings = {
    font: 'Arial',
    fontSize: { body: 14, name: 28, sections: 20 },
    margins: { top: 80, bottom: 80, left: 80, right: 80 },
    alignment: { header: 'center', text: 'justify' },
    colors: { primary: '#2563eb', secondary: '#2563eb' },
  };
  const finalLayout = layout || defaultLayout;

  const getTemplateStyles = (template: string) => {
    switch (template) {
      case 'modern':
        return { primaryColor: '#2563eb', secondaryColor: '#1e40af', headerStyle: 'bold', sectionSpacing: '25px' };
      case 'classic':
        return { primaryColor: '#000000', secondaryColor: '#374151', headerStyle: 'normal', sectionSpacing: '20px' };
      case 'creative':
        return { primaryColor: '#e91e63', secondaryColor: '#c2185b', headerStyle: 'bold', sectionSpacing: '30px' };
      case 'minimalist':
        return { primaryColor: '#333333', secondaryColor: '#666666', headerStyle: 'normal', sectionSpacing: '15px' };
      default:
        return {
          primaryColor: finalLayout.colors.primary,
          secondaryColor: finalLayout.colors.secondary,
          headerStyle: 'bold',
          sectionSpacing: '25px',
        };
    }
  };

  const templateStyles = getTemplateStyles(resume.template);
  const watermarkCSS = includeWatermark
    ? `.watermark{position:fixed;top:50%;left:50%;transform:translate(-50%,-50%) rotate(-45deg);font-size:48px;color:rgba(0,0,0,.1);z-index:-1;pointer-events:none;user-select:none}`
    : '';

  const html = `<!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${resume.title}</title>
    <style>
      @page { margin: ${finalLayout.margins.top}px ${finalLayout.margins.right}px ${finalLayout.margins.bottom}px ${finalLayout.margins.left}px; }
      body { font-family: '${finalLayout.font}', sans-serif; line-height: 1.6; margin: 0; padding: 20px; color: #333; background: #fff; }
      ${watermarkCSS}
      .header { text-align: ${finalLayout.alignment.header}; margin-bottom: 30px; border-bottom: 2px solid ${templateStyles.primaryColor}; padding-bottom: 20px; }
      .name { font-size: ${finalLayout.fontSize.name}px; font-weight: ${templateStyles.headerStyle}; color: ${templateStyles.primaryColor}; margin-bottom: 10px; }
      .contact-info { font-size: ${finalLayout.fontSize.body}px; color: #666; margin-bottom: 5px; }
      .section { margin-bottom: ${templateStyles.sectionSpacing}; }
      .section-title { font-size: ${finalLayout.fontSize.sections}px; font-weight: ${templateStyles.headerStyle}; color: ${templateStyles.primaryColor}; margin-bottom: 15px; text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px solid #eee; padding-bottom: 5px; }
      .experience-item, .education-item, .project-item { margin-bottom: 20px; page-break-inside: avoid; }
      .item-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px; }
      .item-title { font-weight: bold; font-size: ${finalLayout.fontSize.body + 1}px; color: #333; }
      .item-company, .item-school { font-weight: 600; color: ${templateStyles.secondaryColor}; }
      .item-dates { font-style: italic; color: #666; font-size: ${finalLayout.fontSize.body - 1}px; }
      .item-description { text-align: ${finalLayout.alignment.text}; margin-top: 8px; font-size: ${finalLayout.fontSize.body}px; }
      .skills-list { display: flex; flex-wrap: wrap; gap: 8px; }
      .skill-tag { background-color: ${templateStyles.primaryColor}; color: white; padding: 4px 12px; border-radius: 15px; font-size: ${finalLayout.fontSize.body - 1}px; font-weight: 500; }
      .summary { text-align: ${finalLayout.alignment.text}; font-size: ${finalLayout.fontSize.body}px; line-height: 1.7; background-color: #f8f9fa; padding: 15px; border-left: 4px solid ${templateStyles.primaryColor}; margin-bottom: 25px; }
      @media print { body { margin: 0; } .section { page-break-inside: avoid; } }
    </style>
  </head>
  <body>
    ${includeWatermark ? `<div class="watermark">${watermarkText}</div>` : ''}
    <div class="header">
      <div class="name">${resume.personalInfo.name}</div>
      <div class="contact-info">${resume.personalInfo.email}</div>
      <div class="contact-info">${resume.personalInfo.phone}</div>
      <div class="contact-info">${resume.personalInfo.location}</div>
      ${resume.personalInfo.linkedin ? `<div class="contact-info">LinkedIn: ${resume.personalInfo.linkedin}</div>` : ''}
    </div>
    ${resume.personalInfo.summary ? `<div class="section"><div class="section-title">Professional Summary</div><div class="summary">${resume.personalInfo.summary}</div></div>` : ''}
    ${resume.experience.length > 0 ? `<div class="section"><div class="section-title">Professional Experience</div>${resume.experience.map(exp => `<div class="experience-item"><div class="item-header"><div><div class="item-title">${exp.title}</div><div class="item-company">${exp.company}</div></div><div class="item-dates">${exp.start} - ${exp.end}</div></div><div class="item-description">${exp.desc}</div></div>`).join('')}</div>` : ''}
    ${resume.education.length > 0 ? `<div class="section"><div class="section-title">Education</div>${resume.education.map(edu => `<div class="education-item"><div class="item-header"><div><div class="item-title">${edu.degree}</div><div class="item-school">${edu.school}</div>${edu.field ? `<div class="item-company">${edu.field}</div>` : ''}</div><div class="item-dates">${edu.start} - ${edu.end}</div></div>${edu.desc ? `<div class="item-description">${edu.desc}</div>` : ''}</div>`).join('')}</div>` : ''}
    ${resume.skills.length > 0 ? `<div class="section"><div class="section-title">Skills</div><div class="skills-list">${resume.skills.map(s => `<span class="skill-tag">${s}</span>`).join('')}</div></div>` : ''}
    ${resume.projects.length > 0 ? `<div class="section"><div class="section-title">Projects</div>${resume.projects.map(p => `<div class="project-item"><div class="item-header"><div class="item-title">${p.name}</div>${p.link ? `<div class="item-dates"><a href='${p.link}'>View Project</a></div>` : ''}</div><div class="item-description">${p.description}</div></div>`).join('')}</div>` : ''}
    ${resume.certifications && resume.certifications.length > 0 ? `<div class="section"><div class="section-title">Certifications</div>${resume.certifications.map(c => `<div class="certification-item"><div class="item-header"><div class="item-title">${c.name}</div><div class="item-dates">${c.date}</div></div><div class="item-company">${c.issuer}</div>${c.credentialId ? `<div class="item-description">Credential ID: ${c.credentialId}</div>` : ''}${c.expiryDate ? `<div class="item-description">Expires: ${c.expiryDate}</div>` : ''}</div>`).join('')}</div>` : ''}
  </body>
  </html>`;

  return html;
};

export async function exportResumeWeb(
  resume: ResumeDataPortable,
  options: ExportOptions = { format: 'PDF' }
): Promise<void> {
  const html = generateResumeHTML(
    resume,
    options.layout,
    options.includeWatermark ?? false,
    options.watermarkText ?? 'CVSaathi'
  );

  // Try Edge Function first (if configured)
  const safeName = resume.personalInfo.name
    ? resume.personalInfo.name.replace(/\s+/g, '_').toLowerCase()
    : 'resume';
  const fileName = `${safeName}_${Date.now()}.pdf`;
  const url = await resumeExportService.exportPdf(html, fileName);
  if (url) {
    window.open(url, '_blank', 'noopener,noreferrer');
    return;
  }

  // Fallback: open a new window with printable HTML (user can Save as PDF)
  const w = window.open('', '_blank', 'noopener,noreferrer');
  if (w) {
    w.document.write(html);
    w.document.close();
    w.focus();
  } else {
    // As last resort, download HTML file so user can print to PDF manually
    const blob = new Blob([html], { type: 'text/html' });
    const objUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = objUrl;
    a.download = `${safeName}.html`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(objUrl);
  }
}


