import { OpenApiGeneratorV3, OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { ProjectSchema, CreateProjectSchema, UpdateProjectSchema, ProjectQuerySchema } from './schemas/project';
import { LoginSchema } from './schemas/auth';
import { ConfigSchema } from './schemas/config';

export const registry = new OpenAPIRegistry();

// Register Schemas
registry.register('Project', ProjectSchema);
registry.register('CreateProject', CreateProjectSchema);
registry.register('UpdateProject', UpdateProjectSchema);
registry.register('Login', LoginSchema);
registry.register('Config', ConfigSchema);

// Register Paths (Manually for now, or infer? Manual is safer for specific next.js routes)
registry.registerPath({
    method: 'get',
    path: '/api/projects',
    summary: 'List Projects',
    description: 'Get a list of projects with filtering and sorting.',
    request: {
        query: ProjectQuerySchema
    },
    responses: {
        200: {
            description: 'List of projects',
            content: {
                'application/json': {
                    schema: {
                        type: 'object',
                        properties: {
                            success: { type: 'boolean' },
                            data: { type: 'array', items: { $ref: '#/components/schemas/Project' } }
                        }
                    }
                }
            }
        }
    }
});

registry.registerPath({
    method: 'post',
    path: '/api/auth',
    summary: 'Login',
    request: {
        body: {
            content: {
                'application/json': {
                    schema: LoginSchema
                }
            }
        }
    },
    responses: {
        200: { description: 'Login successful' },
        401: { description: 'Invalid credentials' }
    }
});

export function getOpenApiSpec() {
    const generator = new OpenApiGeneratorV3(registry.definitions);

    return generator.generateDocument({
        openapi: '3.0.0',
        info: {
            title: 'Portfolio API',
            version: '1.0.0',
            description: 'Enterprise-grade API for Portfolio CMS',
        },
        servers: [{ url: '/api' }],
    });
}
