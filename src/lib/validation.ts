
import { z } from 'zod';

// Enhanced validation schemas with security considerations
export const profileValidationSchema = z.object({
  firstName: z.string()
    .min(1, "First name is required")
    .max(50, "First name must be less than 50 characters")
    .regex(/^[a-zA-Z\s\-']+$/, "First name contains invalid characters"),
  lastName: z.string()
    .min(1, "Last name is required")
    .max(50, "Last name must be less than 50 characters")
    .regex(/^[a-zA-Z\s\-']+$/, "Last name contains invalid characters"),
  bio: z.string()
    .max(500, "Bio must be less than 500 characters")
    .optional(),
  location: z.string()
    .max(100, "Location must be less than 100 characters")
    .optional(),
  jobTitle: z.string()
    .max(100, "Job title must be less than 100 characters")
    .optional(),
  company: z.string()
    .max(100, "Company name must be less than 100 characters")
    .optional(),
  experience: z.string()
    .max(1000, "Experience must be less than 1000 characters")
    .optional(),
  skills: z.string()
    .max(500, "Skills must be less than 500 characters")
    .optional(),
  phone: z.string()
    .regex(/^[\+]?[1-9][\d]{0,15}$/, "Please enter a valid phone number")
    .optional()
    .or(z.literal("")),
  linkedin: z.string()
    .url("Please enter a valid LinkedIn URL")
    .optional()
    .or(z.literal("")),
  github: z.string()
    .url("Please enter a valid GitHub URL")
    .optional()
    .or(z.literal("")),
  website: z.string()
    .url("Please enter a valid website URL")
    .optional()
    .or(z.literal("")),
});

export const resumeValidationSchema = z.object({
  name: z.string()
    .min(1, "Resume name is required")
    .max(100, "Resume name must be less than 100 characters")
    .regex(/^[a-zA-Z0-9\s\-_]+$/, "Resume name contains invalid characters"),
  sections: z.object({
    personalInfo: z.object({
      name: z.string().min(1, "Name is required").max(100),
      email: z.string().email("Invalid email address"),
      phone: z.string().optional(),
      location: z.string().max(100).optional(),
      summary: z.string().max(500).optional(),
    }).optional(),
    experience: z.array(z.object({
      title: z.string().max(100),
      company: z.string().max(100),
      duration: z.string().max(50),
      description: z.string().max(1000),
    })).optional(),
    education: z.array(z.object({
      degree: z.string().max(100),
      institution: z.string().max(100),
      year: z.string().max(20),
    })).optional(),
    skills: z.array(z.string().max(50)).optional(),
  }),
});

export const feedbackValidationSchema = z.object({
  message: z.string()
    .min(10, "Feedback must be at least 10 characters")
    .max(1000, "Feedback must be less than 1000 characters"),
  type: z.enum(['general', 'bug', 'feature', 'support']),
});

// Sanitization functions
export const sanitizeInput = (input: string): string => {
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
    .replace(/javascript:/gi, '') // Remove javascript: protocols
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .trim();
};

export const sanitizeHtml = (html: string): string => {
  const temp = document.createElement('div');
  temp.textContent = html;
  return temp.innerHTML;
};
