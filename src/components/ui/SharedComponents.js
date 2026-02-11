'use client';

import { cn } from '@/lib/utils';

export function Modal({ open, onClose, title, children, size = 'md' }) {
    if (!open) return null;

    const sizeClasses = {
        sm: 'max-w-md',
        md: 'max-w-lg',
        lg: 'max-w-2xl',
        xl: 'max-w-4xl',
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className={cn(
                'relative w-full glass-card p-6 animate-slide-up shadow-2xl',
                sizeClasses[size]
            )}>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-surface-100">{title}</h3>
                    <button onClick={onClose} className="btn-ghost text-surface-400 hover:text-surface-200 p-1">
                        ✕
                    </button>
                </div>
                {children}
            </div>
        </div>
    );
}

export function StatusBadge({ color, children }) {
    const classMap = {
        green: 'badge-green',
        amber: 'badge-amber',
        red: 'badge-red',
        blue: 'badge-blue',
    };

    return <span className={classMap[color] || 'badge-blue'}>{children}</span>;
}

export function EmptyState({ icon: Icon, title, description, action }) {
    return (
        <div className="flex flex-col items-center justify-center py-16 text-center">
            {Icon && (
                <div className="w-16 h-16 rounded-2xl bg-surface-800 flex items-center justify-center mb-4">
                    <Icon className="w-8 h-8 text-surface-500" />
                </div>
            )}
            <h3 className="text-lg font-semibold text-surface-300 mb-1">{title}</h3>
            <p className="text-sm text-surface-500 max-w-sm mb-4">{description}</p>
            {action && action}
        </div>
    );
}

export function LoadingSpinner() {
    return (
        <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
        </div>
    );
}

export function DataTable({ columns, data, onRowClick }) {
    return (
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead>
                    <tr className="border-b border-surface-700">
                        {columns.map((col, i) => (
                            <th key={i} className={cn(
                                'px-4 py-3 text-left text-xs font-semibold text-surface-400 uppercase tracking-wider',
                                col.className
                            )}>
                                {col.label}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.map((row, i) => (
                        <tr
                            key={row.id || i}
                            className={cn('table-row', onRowClick && 'cursor-pointer')}
                            onClick={() => onRowClick?.(row)}
                        >
                            {columns.map((col, j) => (
                                <td key={j} className={cn('px-4 py-3 text-sm', col.cellClassName)}>
                                    {col.render ? col.render(row) : row[col.key]}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
