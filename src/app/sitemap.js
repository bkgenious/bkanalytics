
import { getAllProjects } from '@/lib/db';

export default async function sitemap() {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

    // Static Routes
    const routes = [
        '',
        '/about', // Assuming about page exists or plan to
        '/projects',
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 1,
    }));

    // Dynamic Projects
    // Note: getAllProjects is synchronous in current db.js implementation
    const projects = getAllProjects();

    const projectRoutes = projects
        .filter(project => project.status === 'published')
        .map((project) => ({
            url: `${baseUrl}/projects/${project.id}`,
            lastModified: new Date(project.updatedAt || project.createdAt),
            changeFrequency: 'weekly',
            priority: 0.8,
        }));

    return [...routes, ...projectRoutes];
}
