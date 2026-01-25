'use client';

import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#64748b'];

/**
 * @param {{ projectsByTool: {name: string, value: number}[], projectsByStatus: {name: string, value: number}[] }} props
 */
export default function AnalyticsCharts({ projectsByTool = [], projectsByStatus = [] }) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Projects by Tool */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Projects by Tool</h3>
                {projectsByTool.length === 0 ? (
                    <p className="text-slate-500 text-center py-8">No data available</p>
                ) : (
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={projectsByTool} layout="vertical" margin={{ left: 50 }}>
                            <XAxis type="number" allowDecimals={false} />
                            <YAxis type="category" dataKey="name" />
                            <Tooltip />
                            <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                )}
            </div>

            {/* Projects by Status */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Projects by Status</h3>
                {projectsByStatus.length === 0 ? (
                    <p className="text-slate-500 text-center py-8">No data available</p>
                ) : (
                    <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                            <Pie
                                data={projectsByStatus}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                            >
                                {projectsByStatus.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                )}
            </div>
        </div>
    );
}
