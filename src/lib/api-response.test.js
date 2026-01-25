
import { apiResponse, apiError } from './api-response';
import { NextResponse } from 'next/server';

// Mock crypto.randomUUID
Object.defineProperty(global, 'crypto', {
    value: {
        randomUUID: () => '1234-5678-9012',
    },
});

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

describe('API Response Helpers', () => {
    it('apiResponse creates a success response', async () => {
        const data = { foo: 'bar' };
        const response = apiResponse(data);
        const json = await response.json();

        expect(json).toEqual({
            success: true,
            data,
            requestId: '1234-5678-9012',
        });
        expect(response.status).toBe(200);
    });

    it('apiResponse includes meta data', async () => {
        const data = [];
        const meta = { page: 1 };
        const response = apiResponse(data, { meta });
        const json = await response.json();

        expect(json.meta).toEqual(meta);
    });

    it('apiError creates an error response', async () => {
        const response = apiError('Something went wrong', 'ERR_TEST', 400);
        const json = await response.json();

        expect(json).toEqual({
            success: false,
            error: {
                message: 'Something went wrong',
                code: 'ERR_TEST',
                details: null,
            },
            requestId: '1234-5678-9012',
        });
        expect(response.status).toBe(400);
    });
});
