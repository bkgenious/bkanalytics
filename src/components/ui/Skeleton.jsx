export default function Skeleton({ className, ...props }) {
    return (
        <div
            className={`animate-pulse rounded-md bg-slate-200 dark:bg-slate-800 ${className}`}
            {...props}
        />
    );
}

export function CardSkeleton() {
    return (
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
            <Skeleton className="aspect-video w-full rounded-none" />
            <div className="p-4 space-y-3">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
            </div>
        </div>
    );
}

export function TableRowSkeleton({ cols = 4 }) {
    return (
        <div className="flex items-center space-x-4 py-4 animate-pulse">
            {Array.from({ length: cols }).map((_, i) => (
                <Skeleton key={i} className="h-4 w-full" />
            ))}
        </div>
    );
}
