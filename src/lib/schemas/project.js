import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';

extendZodWithOpenApi(z);

export const ProjectSchema = z.object({
    id: z.string().uuid().optional(),
    title: z.string().min(1, "Title is required").max(100),
    description: z.string().min(10, "Description is too short"), // Removed max for now to allow rich content
    tool: z.enum(['Power BI', 'Tableau', 'Excel']),
    tags: z.array(z.string()).default([]),

    // Media
    thumbnail: z.string().optional().nullable(),
    images: z.array(z.string()).default([]),
    video: z.string().optional().nullable(),
    pdf: z.string().optional().nullable(),
    documents: z.array(z.string()).default([]),

    // Metadata
    embedUrl: z.string().optional().or(z.literal('')),
    metaTitle: z.string().optional(),
    metaDescription: z.string().optional(),
    keywords: z.array(z.string()).default([]),

    status: z.enum(['draft', 'published', 'archived']).default('draft'),
    order: z.number().int().default(0),

    // Scheduling
    publishAt: z.string().datetime().optional().nullable(),

    createdAt: z.string().datetime().optional(),
    updatedAt: z.string().datetime().optional(),
    deletedAt: z.string().datetime().optional()
}).openapi('Project');

export const CreateProjectSchema = ProjectSchema.omit({
    id: true,
    createdAt: true,
    updatedAt: true
}).openapi('CreateProject');

export const UpdateProjectSchema = ProjectSchema.partial().omit({
    id: true,
    createdAt: true,
    updatedAt: true
}).openapi('UpdateProject');

export const ProjectQuerySchema = z.object({
    limit: z.coerce.number().min(1).max(100).default(10),
    page: z.coerce.number().min(1).default(1),
    cursor: z.string().optional(),
    status: z.enum(['draft', 'published', 'archived']).optional(),
    tech: z.string().optional(), // Comma separated
    featured: z.coerce.boolean().optional(),
    sort: z.enum(['date-desc', 'date-asc', 'title-asc']).default('date-desc'),
    search: z.string().optional(),
}).openapi('ProjectQuery');
