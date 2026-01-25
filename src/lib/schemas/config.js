import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';

extendZodWithOpenApi(z);

export const ConfigSchema = z.object({
    profile: z.object({
        name: z.string().min(1),
        role: z.string().min(1),
        email: z.string().email(),
        socials: z.object({
            linkedin: z.string().optional().or(z.literal('')),
            github: z.string().optional().or(z.literal('')),
            twitter: z.string().optional().or(z.literal(''))
        }).optional()
    }),
    hero: z.object({
        headline: z.string().min(1),
        subheadline: z.string().optional(),
        ctaPrimary: z.string().optional(),
        ctaSecondary: z.string().optional()
    }),
    about: z.object({
        title: z.string().optional(),
        description: z.string().optional()
    }),
    seo: z.object({
        title: z.string().optional(),
        description: z.string().optional()
    }),
    features: z.object({
        showSkills: z.boolean().default(true),
        showContact: z.boolean().default(true)
    }).optional(),
    skills: z.array(z.object({
        tool: z.string().min(1),
        level: z.number().min(0).max(100),
        description: z.string().optional()
    })).default([])
}).openapi('Config');

export const UpdateConfigSchema = ConfigSchema.partial();
