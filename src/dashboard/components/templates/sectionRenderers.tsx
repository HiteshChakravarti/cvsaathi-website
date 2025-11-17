import React from 'react';
import { ResumeData } from '../ResumeBuilderPage';
import { getFontSizeClasses } from './templateUtils';

interface SectionRendererProps {
  sectionId: string;
  resumeData: ResumeData;
  accentColor: string;
  fontSizeClasses: ReturnType<typeof getFontSizeClasses>;
  spacingClass: string;
  templateStyle: 'modern-pro' | 'classic' | 'creative' | 'technical' | 'minimal' | 'modern-two' | 'academic' | 'executive';
}

export function renderSection({
  sectionId,
  resumeData,
  accentColor,
  fontSizeClasses,
  spacingClass,
  templateStyle,
}: SectionRendererProps): React.ReactNode {
  switch (sectionId) {
    case 'summary':
      if (templateStyle === 'creative') {
        return (
          <div className={spacingClass}>
            <h2 
              className={`${fontSizeClasses.h2} font-bold mb-3 px-4 py-2 rounded-lg inline-block`}
              style={{ backgroundColor: accentColor, color: 'white' }}
            >
              Summary
            </h2>
            <p className={`text-gray-700 leading-relaxed ${fontSizeClasses.body} mt-3`}>{resumeData.summary}</p>
          </div>
        );
      }
      if (templateStyle === 'classic' || templateStyle === 'academic' || templateStyle === 'executive') {
        return (
          <div className={spacingClass}>
            <h2 className={`${fontSizeClasses.h2} font-bold mb-3 border-b pb-2`} style={{ borderColor: accentColor, color: accentColor }}>
              {templateStyle === 'academic' ? 'ABSTRACT' : templateStyle === 'executive' ? 'EXECUTIVE SUMMARY' : 'PROFESSIONAL SUMMARY'}
            </h2>
            <p className={`text-gray-700 leading-relaxed ${fontSizeClasses.body} ${templateStyle === 'academic' ? 'text-justify' : ''}`}>{resumeData.summary}</p>
          </div>
        );
      }
      if (templateStyle === 'technical') {
        return (
          <div className={spacingClass}>
            <h2 className={`${fontSizeClasses.h2} font-bold mb-3 uppercase tracking-wider`} style={{ color: accentColor }}>
              &gt; SUMMARY
            </h2>
            <p className={`text-gray-700 leading-relaxed ${fontSizeClasses.body}`}>{resumeData.summary}</p>
          </div>
        );
      }
      if (templateStyle === 'minimal') {
        return (
          <div className={spacingClass}>
            <p className={`text-gray-700 leading-relaxed ${fontSizeClasses.body} font-light`}>{resumeData.summary}</p>
          </div>
        );
      }
      // Default: modern-pro, modern-two
      return (
        <div className={spacingClass}>
          <h2 className={`${fontSizeClasses.h2} font-bold mb-3 uppercase tracking-wide`} style={{ color: accentColor }}>
            Professional Summary
          </h2>
          <p className={`text-gray-700 leading-relaxed ${fontSizeClasses.body}`}>{resumeData.summary}</p>
        </div>
      );

    case 'experience':
      const experienceTitle = templateStyle === 'classic' ? 'PROFESSIONAL EXPERIENCE' : 
                            templateStyle === 'technical' ? '&gt; EXPERIENCE' :
                            templateStyle === 'executive' ? 'PROFESSIONAL EXPERIENCE' :
                            'Experience';
      
      if (templateStyle === 'creative') {
        return (
          <div className={spacingClass}>
            <h2 
              className={`${fontSizeClasses.h2} font-bold mb-4 px-4 py-2 rounded-lg inline-block`}
              style={{ backgroundColor: accentColor, color: 'white' }}
            >
              Experience
            </h2>
            <div className="space-y-5 mt-4">
              {resumeData.experiences.map((exp) => (
                <div 
                  key={exp.id} 
                  className="p-4 rounded-lg border-l-4"
                  style={{ borderLeftColor: accentColor, backgroundColor: `${accentColor}05` }}
                >
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className={`${fontSizeClasses.h3} font-bold`}>{exp.title || 'Job Title'}</h3>
                    {(exp.startDate || exp.endDate) && (
                      <span className={`${fontSizeClasses.small} text-gray-600 font-semibold`}>
                        {exp.startDate || 'Start'} - {exp.current ? 'Present' : exp.endDate || 'End'}
                      </span>
                    )}
                  </div>
                  {exp.company && (
                    <p className={`text-gray-700 mb-2 font-semibold ${fontSizeClasses.body}`}>
                      {exp.company} {exp.location && `• ${exp.location}`}
                    </p>
                  )}
                  {exp.bullets.some(b => b) && (
                    <ul className={`list-disc list-inside space-y-1 text-gray-700 ${fontSizeClasses.body}`}>
                      {exp.bullets.filter(b => b).map((bullet, i) => (
                        <li key={i}>{bullet}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      }
      
      if (templateStyle === 'classic' || templateStyle === 'academic' || templateStyle === 'executive') {
        return (
          <div className={spacingClass}>
            <h2 className={`${fontSizeClasses.h2} font-bold mb-4 ${templateStyle === 'classic' || templateStyle === 'academic' ? 'border-b pb-2' : 'text-center border-b-2 pb-3'} ${templateStyle === 'academic' ? 'text-center' : ''}`} style={{ borderColor: accentColor, color: accentColor }}>
              {experienceTitle}
            </h2>
            <div className="space-y-5">
              {resumeData.experiences.map((exp) => (
                <div key={exp.id} className={templateStyle === 'executive' ? 'border-l-4 pl-6' : ''} style={templateStyle === 'executive' ? { borderLeftColor: accentColor } : {}}>
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className={`${fontSizeClasses.h3} font-bold`}>{exp.title || 'Job Title'}</h3>
                    {(exp.startDate || exp.endDate) && (
                      <span className={`${fontSizeClasses.small} text-gray-600 ${templateStyle === 'executive' ? 'font-semibold' : ''}`}>
                        {exp.startDate || 'Start'} - {exp.current ? 'Present' : exp.endDate || 'End'}
                      </span>
                    )}
                  </div>
                  {exp.company && (
                    <p className={`text-gray-700 mb-2 ${templateStyle === 'classic' ? 'italic font-semibold' : templateStyle === 'executive' ? 'text-lg font-semibold' : 'font-semibold'} ${fontSizeClasses.body}`}>
                      {exp.company} {exp.location && (templateStyle === 'classic' ? `, ${exp.location}` : `• ${exp.location}`)}
                    </p>
                  )}
                  {exp.bullets.some(b => b) && (
                    <ul className={`list-disc list-inside ${templateStyle === 'executive' ? 'space-y-2' : 'space-y-1'} text-gray-700 ${fontSizeClasses.body} ${templateStyle === 'classic' ? 'ml-4' : ''}`}>
                      {exp.bullets.filter(b => b).map((bullet, i) => (
                        <li key={i} className={templateStyle === 'executive' ? 'leading-relaxed' : ''}>{bullet}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      }
      
      if (templateStyle === 'technical') {
        return (
          <div className={spacingClass}>
            <h2 className={`${fontSizeClasses.h2} font-bold mb-4 uppercase tracking-wider`} style={{ color: accentColor }}>
              &gt; EXPERIENCE
            </h2>
            <div className="space-y-5">
              {resumeData.experiences.map((exp) => (
                <div key={exp.id} className="border-l-4 pl-4" style={{ borderLeftColor: accentColor }}>
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className={`${fontSizeClasses.h3} font-bold`}>{exp.title || 'JOB_TITLE'}</h3>
                    {(exp.startDate || exp.endDate) && (
                      <span className={`${fontSizeClasses.small} text-gray-600`}>
                        [{exp.startDate || 'START'} - {exp.current ? 'PRESENT' : exp.endDate || 'END'}]
                      </span>
                    )}
                  </div>
                  {exp.company && (
                    <p className={`text-gray-700 mb-2 font-semibold ${fontSizeClasses.body}`}>
                      {exp.company} {exp.location && `| ${exp.location}`}
                    </p>
                  )}
                  {exp.bullets.some(b => b) && (
                    <ul className={`list-none space-y-1 text-gray-700 ${fontSizeClasses.body}`}>
                      {exp.bullets.filter(b => b).map((bullet, i) => (
                        <li key={i} className="before:content-['•_']" style={{ color: accentColor }}>
                          {bullet}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      }
      
      if (templateStyle === 'minimal') {
        return (
          <div className={spacingClass}>
            <h2 className={`${fontSizeClasses.small} font-normal mb-4 uppercase tracking-widest`} style={{ color: accentColor }}>
              Experience
            </h2>
            <div className="space-y-6">
              {resumeData.experiences.map((exp) => (
                <div key={exp.id}>
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className={`${fontSizeClasses.small} font-normal`}>{exp.title || 'Job Title'}</h3>
                    {(exp.startDate || exp.endDate) && (
                      <span className={`${fontSizeClasses.small} text-gray-500 font-light`}>
                        {exp.startDate || 'Start'} — {exp.current ? 'Present' : exp.endDate || 'End'}
                      </span>
                    )}
                  </div>
                  {exp.company && (
                    <p className={`${fontSizeClasses.small} text-gray-600 mb-2 font-light`}>
                      {exp.company} {exp.location && `, ${exp.location}`}
                    </p>
                  )}
                  {exp.bullets.some(b => b) && (
                    <ul className={`list-none space-y-0.5 text-gray-700 ${fontSizeClasses.small} font-light`}>
                      {exp.bullets.filter(b => b).map((bullet, i) => (
                        <li key={i} className="before:content-['—_'] before:mr-1">
                          {bullet}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      }
      
      // Default: modern-pro, modern-two
      return (
        <div className={spacingClass}>
          <h2 className={`${fontSizeClasses.h2} font-bold mb-4 uppercase tracking-wide`} style={{ color: accentColor }}>
            Experience
          </h2>
          <div className="space-y-5">
            {resumeData.experiences.map((exp) => (
              <div key={exp.id} className="border-l-2 pl-4" style={{ borderColor: accentColor }}>
                <div className="flex justify-between items-baseline mb-1">
                  <h3 className={`${fontSizeClasses.h3} font-semibold`}>{exp.title || 'Job Title'}</h3>
                  {(exp.startDate || exp.endDate) && (
                    <span className={`${fontSizeClasses.small} text-gray-600 font-medium`}>
                      {exp.startDate || 'Start'} - {exp.current ? 'Present' : exp.endDate || 'End'}
                    </span>
                  )}
                </div>
                {exp.company && (
                  <p className={`text-gray-700 mb-2 font-medium ${fontSizeClasses.body}`}>
                    {exp.company} {exp.location && `• ${exp.location}`}
                  </p>
                )}
                {exp.bullets.some(b => b) && (
                  <ul className={`list-disc list-inside space-y-1 text-gray-700 ${fontSizeClasses.body}`}>
                    {exp.bullets.filter(b => b).map((bullet, i) => (
                      <li key={i}>{bullet}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      );

    case 'education':
      const educationTitle = templateStyle === 'classic' || templateStyle === 'academic' || templateStyle === 'executive' ? 'EDUCATION' :
                            templateStyle === 'technical' ? '&gt; EDUCATION' :
                            'Education';
      
      if (templateStyle === 'creative') {
        return (
          <div className={spacingClass}>
            <h2 
              className={`${fontSizeClasses.h2} font-bold mb-4 px-4 py-2 rounded-lg inline-block`}
              style={{ backgroundColor: accentColor, color: 'white' }}
            >
              Education
            </h2>
            <div className="space-y-4 mt-4">
              {resumeData.education.map((edu) => (
                <div 
                  key={edu.id} 
                  className="p-4 rounded-lg border-l-4"
                  style={{ borderLeftColor: accentColor, backgroundColor: `${accentColor}05` }}
                >
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className={`${fontSizeClasses.h3} font-bold`}>{edu.degree || 'Degree'}</h3>
                    {edu.graduationYear && (
                      <span className={`${fontSizeClasses.small} text-gray-600 font-semibold`}>
                        {edu.graduationYear}
                      </span>
                    )}
                  </div>
                  {edu.institution && (
                    <p className={`text-gray-700 font-semibold ${fontSizeClasses.body}`}>{edu.institution}</p>
                  )}
                  {edu.gpa && (
                    <p className={`${fontSizeClasses.small} text-gray-600`}>GPA: {edu.gpa}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      }
      
      if (templateStyle === 'classic' || templateStyle === 'academic' || templateStyle === 'executive') {
        return (
          <div className={spacingClass}>
            <h2 className={`${fontSizeClasses.h2} font-bold mb-4 ${templateStyle === 'classic' || templateStyle === 'academic' ? 'border-b pb-2' : 'text-center border-b-2 pb-3'} ${templateStyle === 'academic' ? 'text-center' : ''}`} style={{ borderColor: accentColor, color: accentColor }}>
              {educationTitle}
            </h2>
            <div className={templateStyle === 'executive' ? 'space-y-5' : 'space-y-4'}>
              {resumeData.education.map((edu) => (
                <div key={edu.id} className={templateStyle === 'executive' ? 'border-l-4 pl-6' : templateStyle === 'academic' ? 'text-center' : ''} style={templateStyle === 'executive' ? { borderLeftColor: accentColor } : {}}>
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className={`${fontSizeClasses.h3} font-bold ${templateStyle === 'academic' ? 'flex-1 text-left' : ''}`}>{edu.degree || 'Degree'}</h3>
                    {edu.graduationYear && (
                      <span className={`${fontSizeClasses.small} text-gray-600 ${templateStyle === 'executive' ? 'font-semibold' : ''}`}>
                        {edu.graduationYear}
                      </span>
                    )}
                  </div>
                  {edu.institution && (
                    <p className={`text-gray-700 ${templateStyle === 'classic' ? 'italic font-semibold' : templateStyle === 'executive' ? 'font-semibold' : templateStyle === 'academic' ? 'mb-2 font-semibold text-left' : 'font-semibold'} ${fontSizeClasses.body}`}>
                      {edu.institution} {edu.location && (templateStyle === 'classic' ? `, ${edu.location}` : `• ${edu.location}`)}
                    </p>
                  )}
                  {edu.gpa && (
                    <p className={`${fontSizeClasses.small} text-gray-600 ${templateStyle === 'academic' ? 'text-left' : ''}`}>GPA: {edu.gpa}</p>
                  )}
                  {edu.honors && edu.honors.length > 0 && templateStyle === 'academic' && (
                    <div className={`${fontSizeClasses.small} text-gray-600 text-left mt-1`}>
                      <span className="font-semibold">Honors: </span>
                      {edu.honors.join(', ')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      }
      
      if (templateStyle === 'technical') {
        return (
          <div className={spacingClass}>
            <h2 className={`${fontSizeClasses.h2} font-bold mb-4 uppercase tracking-wider`} style={{ color: accentColor }}>
              &gt; EDUCATION
            </h2>
            <div className="space-y-4">
              {resumeData.education.map((edu) => (
                <div key={edu.id} className="border-l-4 pl-4" style={{ borderLeftColor: accentColor }}>
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className={`${fontSizeClasses.h3} font-bold`}>{edu.degree || 'DEGREE'}</h3>
                    {edu.graduationYear && (
                      <span className={`${fontSizeClasses.small} text-gray-600`}>
                        [{edu.graduationYear}]
                      </span>
                    )}
                  </div>
                  {edu.institution && (
                    <p className={`text-gray-700 font-semibold ${fontSizeClasses.body}`}>{edu.institution}</p>
                  )}
                  {edu.gpa && (
                    <p className={`${fontSizeClasses.small} text-gray-600`}>GPA: {edu.gpa}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      }
      
      if (templateStyle === 'minimal') {
        return (
          <div className={spacingClass}>
            <h2 className={`${fontSizeClasses.small} font-normal mb-4 uppercase tracking-widest`} style={{ color: accentColor }}>
              Education
            </h2>
            <div className="space-y-4">
              {resumeData.education.map((edu) => (
                <div key={edu.id}>
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className={`${fontSizeClasses.small} font-normal`}>{edu.degree || 'Degree'}</h3>
                    {edu.graduationYear && (
                      <span className={`${fontSizeClasses.small} text-gray-500 font-light`}>
                        {edu.graduationYear}
                      </span>
                    )}
                  </div>
                  {edu.institution && (
                    <p className={`${fontSizeClasses.small} text-gray-600 font-light`}>{edu.institution}</p>
                  )}
                  {edu.gpa && (
                    <p className={`${fontSizeClasses.small} text-gray-500 font-light`}>GPA: {edu.gpa}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      }
      
      // Default: modern-pro, modern-two
      return (
        <div className={spacingClass}>
          <h2 className={`${fontSizeClasses.h2} font-bold mb-4 uppercase tracking-wide`} style={{ color: accentColor }}>
            Education
          </h2>
          <div className="space-y-4">
            {resumeData.education.map((edu) => (
              <div key={edu.id} className="border-l-2 pl-4" style={{ borderColor: accentColor }}>
                <div className="flex justify-between items-baseline mb-1">
                  <h3 className={`${fontSizeClasses.h3} font-semibold`}>{edu.degree || 'Degree'}</h3>
                  {edu.graduationYear && (
                    <span className={`${fontSizeClasses.small} text-gray-600 font-medium`}>
                      {edu.graduationYear}
                    </span>
                  )}
                </div>
                {edu.institution && (
                  <p className={`text-gray-700 font-medium ${fontSizeClasses.body}`}>{edu.institution}</p>
                )}
                {edu.gpa && (
                  <p className={`${fontSizeClasses.small} text-gray-600`}>GPA: {edu.gpa}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      );

    case 'skills':
      const skillsTitle = templateStyle === 'classic' || templateStyle === 'academic' || templateStyle === 'executive' ? 
                         (templateStyle === 'executive' ? 'CORE COMPETENCIES' : templateStyle === 'academic' ? 'TECHNICAL SKILLS' : 'SKILLS') :
                         templateStyle === 'technical' ? '&gt; SKILLS' :
                         'Skills';
      
      if (templateStyle === 'creative') {
        return (
          <div className={spacingClass}>
            <h2 
              className={`${fontSizeClasses.h2} font-bold mb-4 px-4 py-2 rounded-lg inline-block`}
              style={{ backgroundColor: accentColor, color: 'white' }}
            >
              Skills
            </h2>
            <div className="flex flex-wrap gap-2 mt-4">
              {resumeData.technicalSkills.map((skill, i) => (
                <span 
                  key={i} 
                  className={`px-4 py-2 rounded-full ${fontSizeClasses.small} font-bold text-white`}
                  style={{ backgroundColor: accentColor }}
                >
                  {skill}
                </span>
              ))}
              {resumeData.softSkills.map((skill, i) => (
                <span 
                  key={`soft-${i}`} 
                  className={`px-4 py-2 rounded-full ${fontSizeClasses.small} font-bold text-white`}
                  style={{ backgroundColor: accentColor }}
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        );
      }
      
      if (templateStyle === 'technical') {
        return (
          <div className={spacingClass}>
            <h2 className={`${fontSizeClasses.h2} font-bold mb-4 uppercase tracking-wider`} style={{ color: accentColor }}>
              &gt; SKILLS
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {resumeData.technicalSkills.length > 0 && (
                <div>
                  <h3 className={`${fontSizeClasses.small} font-bold mb-2`} style={{ color: accentColor }}>Technical:</h3>
                  <div className="flex flex-wrap gap-2">
                    {resumeData.technicalSkills.map((skill, i) => (
                      <span 
                        key={i} 
                        className={`px-3 py-1 border-2 ${fontSizeClasses.small}`}
                        style={{ borderColor: accentColor, color: accentColor }}
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {resumeData.softSkills.length > 0 && (
                <div>
                  <h3 className={`${fontSizeClasses.small} font-bold mb-2`} style={{ color: accentColor }}>Soft:</h3>
                  <div className="flex flex-wrap gap-2">
                    {resumeData.softSkills.map((skill, i) => (
                      <span 
                        key={`soft-${i}`} 
                        className={`px-3 py-1 border-2 ${fontSizeClasses.small}`}
                        style={{ borderColor: accentColor, color: accentColor }}
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      }
      
      if (templateStyle === 'executive') {
        return (
          <div className={spacingClass}>
            <h2 className={`${fontSizeClasses.h2} font-bold mb-6 text-center uppercase tracking-widest border-b-2 pb-3`} style={{ borderColor: accentColor, color: accentColor }}>
              CORE COMPETENCIES
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {resumeData.technicalSkills.length > 0 && (
                <div>
                  <h3 className={`${fontSizeClasses.small} font-bold mb-2`} style={{ color: accentColor }}>Technical Leadership</h3>
                  <div className="flex flex-wrap gap-2">
                    {resumeData.technicalSkills.map((skill, i) => (
                      <span 
                        key={i} 
                        className={`px-3 py-1 border-2 ${fontSizeClasses.small} font-semibold`}
                        style={{ borderColor: accentColor, color: accentColor }}
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {resumeData.softSkills.length > 0 && (
                <div>
                  <h3 className={`${fontSizeClasses.small} font-bold mb-2`} style={{ color: accentColor }}>Strategic Leadership</h3>
                  <div className="flex flex-wrap gap-2">
                    {resumeData.softSkills.map((skill, i) => (
                      <span 
                        key={`soft-${i}`} 
                        className={`px-3 py-1 border-2 ${fontSizeClasses.small} font-semibold`}
                        style={{ borderColor: accentColor, color: accentColor }}
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      }
      
      if (templateStyle === 'academic') {
        return (
          <div className={spacingClass}>
            <h2 className={`${fontSizeClasses.h2} font-bold mb-4 text-center border-b pb-2`} style={{ borderColor: accentColor, color: accentColor }}>
              TECHNICAL SKILLS
            </h2>
            <div className="flex flex-wrap gap-3 justify-center">
              {resumeData.technicalSkills.map((skill, i) => (
                <span 
                  key={i} 
                  className={`px-3 py-1 border ${fontSizeClasses.small}`}
                  style={{ borderColor: accentColor, color: accentColor }}
                >
                  {skill}
                </span>
              ))}
              {resumeData.softSkills.map((skill, i) => (
                <span 
                  key={`soft-${i}`} 
                  className={`px-3 py-1 border ${fontSizeClasses.small}`}
                  style={{ borderColor: accentColor, color: accentColor }}
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        );
      }
      
      if (templateStyle === 'classic') {
        return (
          <div className={spacingClass}>
            <h2 className={`${fontSizeClasses.h2} font-bold mb-4 border-b pb-2`} style={{ borderColor: accentColor, color: accentColor }}>
              SKILLS
            </h2>
            <div className="flex flex-wrap gap-3">
              {resumeData.technicalSkills.map((skill, i) => (
                <span 
                  key={i} 
                  className={`px-3 py-1 border-2 ${fontSizeClasses.small}`}
                  style={{ borderColor: accentColor, color: accentColor }}
                >
                  {skill}
                </span>
              ))}
              {resumeData.softSkills.map((skill, i) => (
                <span 
                  key={`soft-${i}`} 
                  className={`px-3 py-1 border-2 ${fontSizeClasses.small}`}
                  style={{ borderColor: accentColor, color: accentColor }}
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        );
      }
      
      if (templateStyle === 'minimal') {
        return (
          <div className={spacingClass}>
            <h2 className={`${fontSizeClasses.small} font-normal mb-4 uppercase tracking-widest`} style={{ color: accentColor }}>
              Skills
            </h2>
            <div className="flex flex-wrap gap-2">
              {resumeData.technicalSkills.map((skill, i) => (
                <span key={i} className={`${fontSizeClasses.small} text-gray-700 font-light`}>
                  {skill}{i < resumeData.technicalSkills.length - 1 || resumeData.softSkills.length > 0 ? ',' : ''}
                </span>
              ))}
              {resumeData.softSkills.map((skill, i) => (
                <span key={`soft-${i}`} className={`${fontSizeClasses.small} text-gray-700 font-light`}>
                  {skill}{i < resumeData.softSkills.length - 1 ? ',' : ''}
                </span>
              ))}
            </div>
          </div>
        );
      }
      
      // Default: modern-pro, modern-two
      return (
        <div className={spacingClass}>
          <h2 className={`${fontSizeClasses.h2} font-bold mb-4 uppercase tracking-wide`} style={{ color: accentColor }}>
            Skills
          </h2>
          <div className="flex flex-wrap gap-2">
            {resumeData.technicalSkills.map((skill, i) => (
              <span 
                key={i} 
                className={`px-3 py-1 rounded-full ${fontSizeClasses.small} font-medium`}
                style={{ backgroundColor: `${accentColor}20`, color: accentColor }}
              >
                {skill}
              </span>
            ))}
            {resumeData.softSkills.map((skill, i) => (
              <span 
                key={`soft-${i}`} 
                className={`px-3 py-1 rounded-full ${fontSizeClasses.small} font-medium`}
                style={{ backgroundColor: `${accentColor}20`, color: accentColor }}
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      );

    case 'projects':
      const projectsTitle = templateStyle === 'classic' || templateStyle === 'academic' || templateStyle === 'executive' ? 
                           (templateStyle === 'academic' ? 'RESEARCH & PROJECTS' : templateStyle === 'executive' ? 'KEY INITIATIVES' : 'PROJECTS') :
                           templateStyle === 'technical' ? '&gt; PROJECTS' :
                           'Projects';
      
      if (templateStyle === 'creative') {
        return (
          <div className={spacingClass}>
            <h2 
              className={`${fontSizeClasses.h2} font-bold mb-4 px-4 py-2 rounded-lg inline-block`}
              style={{ backgroundColor: accentColor, color: 'white' }}
            >
              Projects
            </h2>
            <div className="space-y-4 mt-4">
              {resumeData.projects.map((project) => (
                <div 
                  key={project.id} 
                  className="p-4 rounded-lg border-l-4"
                  style={{ borderLeftColor: accentColor, backgroundColor: `${accentColor}05` }}
                >
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className={`${fontSizeClasses.h3} font-bold`}>{project.name || 'Project Name'}</h3>
                    {project.date && (
                      <span className={`${fontSizeClasses.small} text-gray-600 font-semibold`}>{project.date}</span>
                    )}
                  </div>
                  {project.description && (
                    <p className={`text-gray-700 mb-2 ${fontSizeClasses.body}`}>{project.description}</p>
                  )}
                  {project.technologies.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {project.technologies.map((tech, i) => (
                        <span 
                          key={i} 
                          className={`px-3 py-1 rounded-full ${fontSizeClasses.small} font-semibold text-white`}
                          style={{ backgroundColor: accentColor }}
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      }
      
      if (templateStyle === 'classic' || templateStyle === 'academic' || templateStyle === 'executive') {
        return (
          <div className={spacingClass}>
            <h2 className={`${fontSizeClasses.h2} font-bold mb-4 ${templateStyle === 'classic' || templateStyle === 'academic' ? 'border-b pb-2' : 'text-center border-b-2 pb-3'} ${templateStyle === 'academic' ? 'text-center' : ''}`} style={{ borderColor: accentColor, color: accentColor }}>
              {projectsTitle}
            </h2>
            <div className={templateStyle === 'executive' ? 'space-y-5' : 'space-y-4'}>
              {resumeData.projects.map((project) => (
                <div key={project.id} className={templateStyle === 'executive' ? 'border-l-4 pl-6' : templateStyle === 'academic' ? '' : ''} style={templateStyle === 'executive' ? { borderLeftColor: accentColor } : {}}>
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className={`${fontSizeClasses.h3} font-bold ${templateStyle === 'academic' ? 'italic' : ''}`}>{project.name || 'Project Name'}</h3>
                    {project.date && (
                      <span className={`${fontSizeClasses.small} text-gray-600 ${templateStyle === 'executive' ? 'font-semibold' : ''}`}>{project.date}</span>
                    )}
                  </div>
                  {project.description && (
                    <p className={`text-gray-700 mb-2 ${fontSizeClasses.body} ${templateStyle === 'executive' ? 'leading-relaxed' : ''}`}>{project.description}</p>
                  )}
                  {project.technologies.length > 0 && (
                    <div className={`flex flex-wrap gap-2 ${templateStyle === 'academic' ? '' : ''}`}>
                      {project.technologies.map((tech, i) => (
                        <span 
                          key={i} 
                          className={`px-2 py-1 ${templateStyle === 'classic' ? 'border' : 'rounded'} ${fontSizeClasses.small} ${templateStyle === 'academic' ? 'text-gray-600 italic' : 'text-gray-600'}`}
                          style={templateStyle === 'classic' ? { borderColor: accentColor } : {}}
                        >
                          {templateStyle === 'academic' ? tech : tech}
                        </span>
                      ))}
                    </div>
                  )}
                  {templateStyle === 'academic' && project.technologies.length > 0 && (
                    <p className={`${fontSizeClasses.small} text-gray-600 italic`}>
                      Technologies: {project.technologies.join(', ')}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      }
      
      if (templateStyle === 'technical') {
        return (
          <div className={spacingClass}>
            <h2 className={`${fontSizeClasses.h2} font-bold mb-4 uppercase tracking-wider`} style={{ color: accentColor }}>
              &gt; PROJECTS
            </h2>
            <div className="space-y-4">
              {resumeData.projects.map((project) => (
                <div key={project.id} className="border-l-4 pl-4" style={{ borderLeftColor: accentColor }}>
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className={`${fontSizeClasses.h3} font-bold`}>{project.name || 'PROJECT_NAME'}</h3>
                    {project.date && (
                      <span className={`${fontSizeClasses.small} text-gray-600`}>[{project.date}]</span>
                    )}
                  </div>
                  {project.description && (
                    <p className={`text-gray-700 mb-2 ${fontSizeClasses.body}`}>{project.description}</p>
                  )}
                  {project.technologies.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {project.technologies.map((tech, i) => (
                        <span 
                          key={i} 
                          className={`px-2 py-1 border ${fontSizeClasses.small} text-gray-600`}
                          style={{ borderColor: accentColor }}
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      }
      
      if (templateStyle === 'minimal') {
        return (
          <div className={spacingClass}>
            <h2 className={`${fontSizeClasses.small} font-normal mb-4 uppercase tracking-widest`} style={{ color: accentColor }}>
              Projects
            </h2>
            <div className="space-y-4">
              {resumeData.projects.map((project) => (
                <div key={project.id}>
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className={`${fontSizeClasses.small} font-normal`}>{project.name || 'Project Name'}</h3>
                    {project.date && (
                      <span className={`${fontSizeClasses.small} text-gray-500 font-light`}>{project.date}</span>
                    )}
                  </div>
                  {project.description && (
                    <p className={`text-gray-700 mb-2 ${fontSizeClasses.small} font-light`}>{project.description}</p>
                  )}
                  {project.technologies.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {project.technologies.map((tech, i) => (
                        <span key={i} className={`${fontSizeClasses.small} text-gray-500 font-light`}>
                          {tech}{i < project.technologies.length - 1 ? ',' : ''}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      }
      
      // Default: modern-pro, modern-two
      return (
        <div className={spacingClass}>
          <h2 className={`${fontSizeClasses.h2} font-bold mb-4 uppercase tracking-wide`} style={{ color: accentColor }}>
            Projects
          </h2>
          <div className="space-y-4">
            {resumeData.projects.map((project) => (
              <div key={project.id} className="border-l-2 pl-4" style={{ borderColor: accentColor }}>
                <div className="flex justify-between items-baseline mb-1">
                  <h3 className={`${fontSizeClasses.h3} font-semibold`}>{project.name || 'Project Name'}</h3>
                  {project.date && (
                    <span className={`${fontSizeClasses.small} text-gray-600 font-medium`}>{project.date}</span>
                  )}
                </div>
                {project.description && (
                  <p className={`text-gray-700 mb-2 ${fontSizeClasses.body}`}>{project.description}</p>
                )}
                {project.technologies.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {project.technologies.map((tech, i) => (
                      <span key={i} className={`px-2 py-1 rounded bg-gray-100 text-gray-600 ${fontSizeClasses.small}`}>
                        {tech}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      );

    case 'certifications':
      const certTitle = templateStyle === 'classic' || templateStyle === 'academic' || templateStyle === 'executive' ? 
                       (templateStyle === 'executive' ? 'PROFESSIONAL CERTIFICATIONS' : 'CERTIFICATIONS') :
                       templateStyle === 'technical' ? '&gt; CERTIFICATIONS' :
                       templateStyle === 'creative' ? 'Certifications' :
                       'Certifications';
      
      if (templateStyle === 'creative') {
        return (
          <div className={spacingClass}>
            <h2 
              className={`${fontSizeClasses.h2} font-bold mb-4 px-4 py-2 rounded-lg inline-block`}
              style={{ backgroundColor: accentColor, color: 'white' }}
            >
              Certifications
            </h2>
            <ul className={`list-disc list-inside space-y-1 text-gray-700 ${fontSizeClasses.body} mt-4`}>
              {resumeData.certifications.map((cert, i) => (
                <li key={i}>{cert}</li>
              ))}
            </ul>
          </div>
        );
      }
      
      if (templateStyle === 'classic' || templateStyle === 'academic' || templateStyle === 'executive') {
        return (
          <div className={spacingClass}>
            <h2 className={`${fontSizeClasses.h2} font-bold mb-4 ${templateStyle === 'classic' || templateStyle === 'academic' ? 'border-b pb-2' : 'text-center border-b-2 pb-3'} ${templateStyle === 'academic' ? 'text-center' : ''}`} style={{ borderColor: accentColor, color: accentColor }}>
              {certTitle}
            </h2>
            <ul className={`list-disc list-inside ${templateStyle === 'executive' ? 'space-y-2' : 'space-y-1'} text-gray-700 ${fontSizeClasses.body} ${templateStyle === 'classic' ? 'ml-4' : ''}`}>
              {resumeData.certifications.map((cert, i) => (
                <li key={i} className={templateStyle === 'executive' ? 'leading-relaxed' : ''}>{cert}</li>
              ))}
            </ul>
          </div>
        );
      }
      
      if (templateStyle === 'technical') {
        return (
          <div className={spacingClass}>
            <h2 className={`${fontSizeClasses.h2} font-bold mb-4 uppercase tracking-wider`} style={{ color: accentColor }}>
              &gt; CERTIFICATIONS
            </h2>
            <ul className={`list-none space-y-1 text-gray-700 ${fontSizeClasses.body}`}>
              {resumeData.certifications.map((cert, i) => (
                <li key={i} className="before:content-['•_']" style={{ color: accentColor }}>
                  {cert}
                </li>
              ))}
            </ul>
          </div>
        );
      }
      
      if (templateStyle === 'minimal') {
        return (
          <div className={spacingClass}>
            <h2 className={`${fontSizeClasses.small} font-normal mb-4 uppercase tracking-widest`} style={{ color: accentColor }}>
              Certifications
            </h2>
            <ul className={`list-none space-y-0.5 text-gray-700 ${fontSizeClasses.small} font-light`}>
              {resumeData.certifications.map((cert, i) => (
                <li key={i} className="before:content-['—_'] before:mr-1">
                  {cert}
                </li>
              ))}
            </ul>
          </div>
        );
      }
      
      // Default: modern-pro, modern-two
      return (
        <div className={spacingClass}>
          <h2 className={`${fontSizeClasses.h2} font-bold mb-4 uppercase tracking-wide`} style={{ color: accentColor }}>
            Certifications
          </h2>
          <ul className={`list-disc list-inside space-y-1 text-gray-700 ${fontSizeClasses.body}`}>
            {resumeData.certifications.map((cert, i) => (
              <li key={i}>{cert}</li>
            ))}
          </ul>
        </div>
      );

    case 'languages':
      const langTitle = templateStyle === 'classic' || templateStyle === 'academic' || templateStyle === 'executive' ? 'LANGUAGES' :
                        templateStyle === 'technical' ? '&gt; LANGUAGES' :
                        templateStyle === 'creative' ? 'Languages' :
                        'Languages';
      
      if (templateStyle === 'creative') {
        return (
          <div className={spacingClass}>
            <h2 
              className={`${fontSizeClasses.h2} font-bold mb-4 px-4 py-2 rounded-lg inline-block`}
              style={{ backgroundColor: accentColor, color: 'white' }}
            >
              Languages
            </h2>
            <div className="flex flex-wrap gap-2 mt-4">
              {resumeData.languages.map((lang, i) => (
                <span 
                  key={i} 
                  className={`px-4 py-2 rounded-full ${fontSizeClasses.small} font-bold text-white`}
                  style={{ backgroundColor: accentColor }}
                >
                  {lang}
                </span>
              ))}
            </div>
          </div>
        );
      }
      
      if (templateStyle === 'classic' || templateStyle === 'academic' || templateStyle === 'executive') {
        return (
          <div className={spacingClass}>
            <h2 className={`${fontSizeClasses.h2} font-bold mb-4 ${templateStyle === 'classic' || templateStyle === 'academic' ? 'border-b pb-2' : 'text-center border-b-2 pb-3'} ${templateStyle === 'academic' ? 'text-center' : ''}`} style={{ borderColor: accentColor, color: accentColor }}>
              {langTitle}
            </h2>
            <div className={`flex flex-wrap ${templateStyle === 'academic' ? 'gap-3 justify-center' : 'gap-3'}`}>
              {resumeData.languages.map((lang, i) => (
                <span 
                  key={i} 
                  className={`px-3 py-1 border-2 ${fontSizeClasses.small} ${templateStyle === 'executive' ? 'font-semibold' : ''}`}
                  style={{ borderColor: accentColor, color: accentColor }}
                >
                  {lang}
                </span>
              ))}
            </div>
          </div>
        );
      }
      
      if (templateStyle === 'technical') {
        return (
          <div className={spacingClass}>
            <h2 className={`${fontSizeClasses.h2} font-bold mb-4 uppercase tracking-wider`} style={{ color: accentColor }}>
              &gt; LANGUAGES
            </h2>
            <div className="flex flex-wrap gap-2">
              {resumeData.languages.map((lang, i) => (
                <span 
                  key={i} 
                  className={`px-3 py-1 border-2 ${fontSizeClasses.small}`}
                  style={{ borderColor: accentColor, color: accentColor }}
                >
                  {lang}
                </span>
              ))}
            </div>
          </div>
        );
      }
      
      if (templateStyle === 'minimal') {
        return (
          <div className={spacingClass}>
            <h2 className={`${fontSizeClasses.small} font-normal mb-4 uppercase tracking-widest`} style={{ color: accentColor }}>
              Languages
            </h2>
            <div className="flex flex-wrap gap-2">
              {resumeData.languages.map((lang, i) => (
                <span key={i} className={`${fontSizeClasses.small} text-gray-700 font-light`}>
                  {lang}{i < resumeData.languages.length - 1 ? ',' : ''}
                </span>
              ))}
            </div>
          </div>
        );
      }
      
      // Default: modern-pro, modern-two
      return (
        <div className={spacingClass}>
          <h2 className={`${fontSizeClasses.h2} font-bold mb-4 uppercase tracking-wide`} style={{ color: accentColor }}>
            Languages
          </h2>
          <div className="flex flex-wrap gap-2">
            {resumeData.languages.map((lang, i) => (
              <span 
                key={i} 
                className={`px-3 py-1 rounded-full ${fontSizeClasses.small} font-medium`}
                style={{ backgroundColor: `${accentColor}20`, color: accentColor }}
              >
                {lang}
              </span>
            ))}
          </div>
        </div>
      );

    case 'awards':
      const awardsTitle = templateStyle === 'classic' || templateStyle === 'academic' || templateStyle === 'executive' ? 
                         (templateStyle === 'executive' ? 'AWARDS & RECOGNITION' : templateStyle === 'academic' ? 'AWARDS & HONORS' : 'AWARDS') :
                         templateStyle === 'technical' ? '&gt; AWARDS' :
                         templateStyle === 'creative' ? 'Awards' :
                         'Awards';
      
      if (templateStyle === 'creative') {
        return (
          <div className={spacingClass}>
            <h2 
              className={`${fontSizeClasses.h2} font-bold mb-4 px-4 py-2 rounded-lg inline-block`}
              style={{ backgroundColor: accentColor, color: 'white' }}
            >
              Awards
            </h2>
            <ul className={`list-disc list-inside space-y-1 text-gray-700 ${fontSizeClasses.body} mt-4`}>
              {resumeData.awards.map((award, i) => (
                <li key={i}>{award}</li>
              ))}
            </ul>
          </div>
        );
      }
      
      if (templateStyle === 'classic' || templateStyle === 'academic' || templateStyle === 'executive') {
        return (
          <div className={spacingClass}>
            <h2 className={`${fontSizeClasses.h2} font-bold mb-4 ${templateStyle === 'classic' || templateStyle === 'academic' ? 'border-b pb-2' : 'text-center border-b-2 pb-3'} ${templateStyle === 'academic' ? 'text-center' : ''}`} style={{ borderColor: accentColor, color: accentColor }}>
              {awardsTitle}
            </h2>
            <ul className={`list-disc list-inside ${templateStyle === 'executive' ? 'space-y-2' : 'space-y-1'} text-gray-700 ${fontSizeClasses.body} ${templateStyle === 'classic' ? 'ml-4' : ''}`}>
              {resumeData.awards.map((award, i) => (
                <li key={i} className={templateStyle === 'executive' ? 'leading-relaxed' : ''}>{award}</li>
              ))}
            </ul>
          </div>
        );
      }
      
      if (templateStyle === 'technical') {
        return (
          <div className={spacingClass}>
            <h2 className={`${fontSizeClasses.h2} font-bold mb-4 uppercase tracking-wider`} style={{ color: accentColor }}>
              &gt; AWARDS
            </h2>
            <ul className={`list-none space-y-1 text-gray-700 ${fontSizeClasses.body}`}>
              {resumeData.awards.map((award, i) => (
                <li key={i} className="before:content-['•_']" style={{ color: accentColor }}>
                  {award}
                </li>
              ))}
            </ul>
          </div>
        );
      }
      
      if (templateStyle === 'minimal') {
        return (
          <div className={spacingClass}>
            <h2 className={`${fontSizeClasses.small} font-normal mb-4 uppercase tracking-widest`} style={{ color: accentColor }}>
              Awards
            </h2>
            <ul className={`list-none space-y-0.5 text-gray-700 ${fontSizeClasses.small} font-light`}>
              {resumeData.awards.map((award, i) => (
                <li key={i} className="before:content-['—_'] before:mr-1">
                  {award}
                </li>
              ))}
            </ul>
          </div>
        );
      }
      
      // Default: modern-pro, modern-two
      return (
        <div className={spacingClass}>
          <h2 className={`${fontSizeClasses.h2} font-bold mb-4 uppercase tracking-wide`} style={{ color: accentColor }}>
            Awards
          </h2>
          <ul className={`list-disc list-inside space-y-1 text-gray-700 ${fontSizeClasses.body}`}>
            {resumeData.awards.map((award, i) => (
              <li key={i}>{award}</li>
            ))}
          </ul>
        </div>
      );

    default:
      return null;
  }
}

