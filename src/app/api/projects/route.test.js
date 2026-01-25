
import { GET } from './route';
import { getAllProjects } from '@/lib/db';

// Mock Dependencies
jest.mock('@/lib/db', () => ({
    getAllProjects: jest.fn(),
    createProject: jest.fn(),
}));

jest.mock('@/lib/auth', () => ({
    isAuthenticated: jest.fn(() => false), // Default to public
    validateRequestOrigin: jest.fn(() => true),
}));

// Mock NextResponse
jest.mock('next/server', () => ({
    NextResponse: {
        json: jest.fn((body, init) => ({
            json: async () => body,
            status: init?.status || 200,
            headers: init?.headers,
        })),
    },
}));

describe('GET /api/projects', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('returns published projects by default', async () => {
        // Setup mock data
        const mockProjects = [
            { id: '1', title: 'Project A', status: 'published', createdAt: '2023-01-01' },
            { id: '2', title: 'Project B', status: 'draft', createdAt: '2023-01-02' },
        ];
        getAllProjects.mockReturnValue(mockProjects);

        // Create Request
        const req = {
            url: 'http://localhost/api/projects',
            headers: { get: () => null },
        };

        const res = await GET(req);
        const json = await res.json();

        expect(json.success).toBe(true);
        expect(json.data).toHaveLength(1);
        expect(json.data[0].id).toBe('1');
    });

    it('filters by search query', async () => {
        const mockProjects = [
            { id: '1', title: 'React App', description: 'Web', status: 'published', techStack: [] },
            { id: '2', title: 'Vue App', description: 'Web', status: 'published', techStack: [] },
        ];
        getAllProjects.mockReturnValue(mockProjects);

        const req = {
            url: 'http://localhost/api/projects?search=React',
            headers: { get: () => null },
        };

        const res = await GET(req);
        const json = await res.json();

        expect(json.data).toHaveLength(1);
        expect(json.data[0].title).toBe('React App');
    });

    it('paginates results', async () => {
        const mockProjects = Array(15).fill(null).map((_, i) => ({
            id: String(i),
            title: `Project ${i}`,
            status: 'published',
            createdAt: '2023-01-01',
        }));
        getAllProjects.mockReturnValue(mockProjects);

        // Page 1, Limit 10
        const req = {
            url: 'http://localhost/api/projects?page=1&limit=10',
            headers: { get: () => null },
        };

        const res = await GET(req);
        const json = await res.json();

        expect(json.data).toHaveLength(10);
        expect(json.data[0].id).toBe('0');
        expect(json.data[9].id).toBe('9');

        // Page 2
        const req2 = {
            url: 'http://localhost/api/projects?page=2&limit=10',
            headers: { get: () => null },
        };
        const res2 = await GET(req2);
        const json2 = await res2.json();
        expect(json2.data).toHaveLength(5);
        expect(json2.data[0].id).toBe('10');

    });
});

import { POST } from './route';
import { isAuthenticated } from '@/lib/auth';

describe('POST /api/projects', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('rejects unauthenticated requests', async () => {
        isAuthenticated.mockReturnValue(false);
        const req = {
            url: 'http://localhost/api/projects',
            headers: { get: () => 'http://localhost' }, // Valid origin
        };
        const res = await POST(req);
        const json = await res.json();

        expect(res.status).toBe(401);
        expect(json.success).toBe(false);
    });

    it('validates request body', async () => {
        isAuthenticated.mockReturnValue(true);
        const req = {
            url: 'http://localhost/api/projects',
            headers: { get: () => 'http://localhost' },
            json: async () => ({
                // Missing title, description, to trigger Zod error
                tool: 'React',
            }),
        };
        const res = await POST(req);
        const json = await res.json();

        expect(res.status).toBe(400);
        expect(json.success).toBe(false);
        expect(json.error.code).toBe('VALIDATION_ERROR');
    });
});
