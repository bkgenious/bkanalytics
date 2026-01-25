'use client';

/**
 * Homepage - Ultra-Premium Analytics Portfolio
 * Enterprise-grade design with consulting-level polish
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Card from '@/components/ui/Card';

const tools = ['all', 'Power BI', 'Tableau', 'Excel'];

const skills = [
    {
        tool: 'Power BI',
        level: 95,
        description: 'Enterprise dashboards, DAX measures, data modeling, and report optimization'
    },
    {
        tool: 'Tableau',
        level: 90,
        description: 'Interactive visualizations, calculated fields, and server deployment'
    },
    {
        tool: 'Excel',
        level: 98,
        description: 'Power Query, advanced formulas, data analysis, and VBA automation'
    },
];

export default function HomePage() {
    const [projects, setProjects] = useState([]);
    const [metrics, setMetrics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        // Fetch Projects
        const p1 = fetch('/api/projects')
            .then(res => res.json())
            .then(json => {
                if (json.success) {
                    const data = json.data;
                    // Filter published and sort by order
                    const published = data.filter(p => p.status === 'published');
                    const sorted = published.sort((a, b) => (a.order || 0) - (b.order || 0));
                    setProjects(sorted);
                }
            })
            .catch(console.error);

        // Fetch Metrics
        const p2 = fetch('/api/metrics')
            .then(res => res.json())
            .then(json => {
                if (json.success) setMetrics(json.data);
            })
            .catch(console.error);

        Promise.all([p1, p2]).finally(() => setLoading(false));
    }, []);

    const filtered = useMemo(() =>
        filter === 'all' ? projects : projects.filter(p => p.tool === filter),
        [projects, filter]
    );

    const handleFilter = useCallback((t) => setFilter(t), []);

    // Construct Stats for display
    const displayStats = useMemo(() => {
        if (!metrics) return [
            { value: '-', label: 'Loading...' },
            { value: '-', label: 'Loading...' },
            { value: '-', label: 'Loading...' },
            { value: '-', label: 'Loading...' },
        ];

        // 1. Total Live Projects
        const baseStats = [
            { value: metrics.totalProjects || '0', label: 'Published Projects' },
        ];

        // 2. Custom Stats (KPIs)
        if (metrics.customStats?.length > 0) {
            baseStats.push(...metrics.customStats);
        }

        // 3. Years Experience (if > 0)
        if (metrics.experienceYears > 0) {
            baseStats.push({ value: `${metrics.experienceYears}+`, label: 'Years Experience' });
        }

        // 4. Fill with Total Media if we need more cards, or just add it
        // Let's add Total Media if we have fewer than 4 items, or just add it anyway?
        // Let's ensure we have at least 4 items for the grid
        if (baseStats.length < 4) {
            baseStats.push({ value: metrics.totalMedia || '0', label: 'Data Artifacts' });
        }

        return baseStats.slice(0, 4); // Limit to 4 for grid symmetry
    }, [metrics]);

    return (
        <main className="min-h-screen bg-white dark:bg-neutral-950">
            <Header />

            {/* Hero Section */}
            <section className="pt-32 pb-20 lg:pt-40 lg:pb-28 grid-bg">
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <div className="max-w-3xl animate-slide-up">
                        {/* Overline */}
                        <p className="overline mb-5">
                            Data Analytics & Visualization
                        </p>

                        {/* Main Headline */}
                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-neutral-900 dark:text-white leading-[1.08] tracking-tight text-balance">
                            Transforming data into
                            <br />
                            <span className="text-primary-600 dark:text-primary-400">
                                strategic insights
                            </span>
                        </h1>

                        {/* Value Proposition */}
                        <p className="mt-6 text-lg lg:text-xl text-neutral-600 dark:text-neutral-300 leading-relaxed max-w-2xl">
                            I design enterprise-grade dashboards and analytics solutions that help organizations make confident, data-driven decisions.
                        </p>

                        {/* CTAs */}
                        <div className="mt-10 flex flex-wrap gap-4">
                            <a
                                href="#projects"
                                className="btn btn-primary btn-lg"
                            >
                                View Work
                            </a>
                            <a
                                href="#contact"
                                className="btn btn-outline btn-lg"
                            >
                                Get in Touch
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* Metrics Section */}
            <section className="py-16 border-y border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/60">
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-16">
                        {displayStats.map((stat, index) => (
                            <div
                                key={`${stat.label}-${index}`}
                                className="animate-fade-up"
                                style={{ animationDelay: `${index * 100}ms` }}
                            >
                                <div className="metric">{stat.value}</div>
                                <div className="metric-label">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Projects Section */}
            <section id="projects" className="py-20 lg:py-28">
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    {/* Section Header */}
                    <div className="mb-12">
                        <p className="overline mb-3">Selected Work</p>
                        <h2 className="section-header">Featured Projects</h2>
                    </div>

                    {/* Filter Pills */}
                    <div className="flex flex-wrap gap-2 mb-12">
                        {tools.map((tool) => (
                            <button
                                key={tool}
                                onClick={() => handleFilter(tool)}
                                className={`
                                    px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200
                                    ${filter === tool
                                        ? 'bg-primary-600 text-white shadow-sm'
                                        : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                                    }
                                `}
                            >
                                {tool === 'all' ? 'All Work' : tool}
                            </button>
                        ))}
                    </div>

                    {/* Project Grid */}
                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="animate-pulse">
                                    <div className="skeleton aspect-[16/10] rounded-t-lg" />
                                    <div className="p-5 bg-white dark:bg-neutral-900 border border-t-0 border-neutral-200 dark:border-neutral-800 rounded-b-lg">
                                        <div className="skeleton h-5 w-20 mb-3 rounded" />
                                        <div className="skeleton h-6 w-3/4 mb-3 rounded" />
                                        <div className="skeleton h-4 w-full rounded" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="text-center py-24">
                            <div className="flex justify-center space-x-1 mb-5">
                                <div className="w-2 h-12 bg-primary-600/20 dark:bg-primary-400/20 rounded-sm" />
                                <div className="w-2 h-8 bg-primary-500/20 dark:bg-primary-400/15 rounded-sm" />
                                <div className="w-2 h-5 bg-primary-400/20 dark:bg-primary-400/10 rounded-sm" />
                            </div>
                            <p className="text-neutral-500 dark:text-neutral-400 text-lg">
                                {filter === 'all' ? 'No projects yet' : `No ${filter} projects`}
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {filtered.map((project, index) => (
                                <Card key={project.id} project={project} index={index} />
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* Expertise Section */}
            <section id="about" className="py-20 lg:py-28 bg-neutral-50 dark:bg-neutral-900/60">
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <div className="grid lg:grid-cols-2 gap-16 lg:gap-20">
                        {/* Left Column - Description */}
                        <div className="animate-fade-up">
                            <p className="overline mb-3">Expertise</p>
                            <h2 className="section-header mb-6">
                                Data solutions for complex challenges
                            </h2>
                            <p className="text-lg text-neutral-600 dark:text-neutral-300 leading-relaxed mb-5">
                                With over 5 years in data analytics, I help organizations unlock value from their data through powerful visualizations and strategic insights.
                            </p>
                            <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
                                I specialize in creating enterprise dashboards that transform complex datasets into clear, actionable intelligence that drives business decisions.
                            </p>
                        </div>

                        {/* Right Column - Skills */}
                        <div className="space-y-5">
                            {skills.map((skill, index) => (
                                <div
                                    key={skill.tool}
                                    className="insight-card animate-fade-up"
                                    style={{ animationDelay: `${(index + 1) * 100}ms` }}
                                >
                                    <div className="flex justify-between items-center mb-2">
                                        <h3 className="font-semibold text-neutral-900 dark:text-white">
                                            {skill.tool}
                                        </h3>
                                        <span className="text-sm font-semibold text-primary-600 dark:text-primary-400">
                                            {skill.level}%
                                        </span>
                                    </div>
                                    <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-3">
                                        {skill.description}
                                    </p>
                                    <div className="h-1.5 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-primary-600 dark:bg-primary-400 rounded-full transition-all duration-1000 ease-out"
                                            style={{ width: `${skill.level}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Contact Section */}
            <section id="contact" className="py-20 lg:py-28">
                <div className="max-w-2xl mx-auto px-6 lg:px-8 text-center animate-fade-up">
                    <p className="overline mb-3">Contact</p>
                    <h2 className="section-header mb-5">
                        Let&apos;s discuss your data challenges
                    </h2>
                    <p className="text-lg text-neutral-600 dark:text-neutral-300 mb-10 leading-relaxed">
                        Ready to transform your data into insights? I&apos;d love to hear about your project and explore how we can work together.
                    </p>
                    <a
                        href="mailto:contact@example.com"
                        className="btn btn-primary btn-lg inline-flex items-center group"
                    >
                        Start a Conversation
                        <svg
                            className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                    </a>
                </div>
            </section>

            <Footer />
        </main>
    );
}
