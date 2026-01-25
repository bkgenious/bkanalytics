import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';

extendZodWithOpenApi(z);

export const LoginSchema = z.object({
    username: z.string().min(1, "Username is required").max(100),
    password: z.string().min(1, "Password is required").max(200)
}).openapi('Login');
