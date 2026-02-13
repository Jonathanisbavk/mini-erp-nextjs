'use client';

import { formatCurrency } from '@/lib/utils';

/**
 * CreditIndicator — Visual progress bar showing customer debt level.
 *
 * 🟢 Verde: Sin deuda / < 30% del límite
 * 🟡 Naranja: 30-80% del límite
 * 🔴 Rojo: > 80% del límite / Bloqueado
 *
 * @param {object} customer - Customer object with balance and credit_limit
 * @param {boolean} compact - Compact mode for inline display
 */
export default function CreditIndicator({ customer, compact = false }) {
    if (!customer) return null;

    const debt = customer.balance || 0;
    const limit = customer.credit_limit || 0;
    const percentage = limit > 0 ? Math.min((debt / limit) * 100, 100) : 0;

    const getStatus = () => {
        if (debt <= 0) return { color: 'green', label: 'Sin deuda', emoji: '✅' };
        if (percentage < 30) return { color: 'green', label: 'Crédito disponible', emoji: '🟢' };
        if (percentage < 80) return { color: 'amber', label: 'Deuda moderada', emoji: '🟡' };
        if (percentage < 100) return { color: 'red', label: 'Cerca del límite', emoji: '🔴' };
        return { color: 'red', label: 'Límite alcanzado', emoji: '🚫' };
    };

    const status = getStatus();

    const barColor = {
        green: 'bg-green-500',
        amber: 'bg-amber-500',
        red: 'bg-red-500',
    }[status.color];

    const textColor = {
        green: 'text-green-400',
        amber: 'text-amber-400',
        red: 'text-red-400',
    }[status.color];

    const bgColor = {
        green: 'bg-green-500/10 border-green-500/20',
        amber: 'bg-amber-500/10 border-amber-500/20',
        red: 'bg-red-500/10 border-red-500/20',
    }[status.color];

    if (compact) {
        return (
            <div className="flex items-center gap-2">
                <span className="text-xs">{status.emoji}</span>
                <div className="flex-1 h-1.5 bg-surface-700 rounded-full overflow-hidden min-w-[60px]">
                    <div
                        className={`h-full ${barColor} rounded-full transition-all duration-500`}
                        style={{ width: `${percentage}%` }}
                    />
                </div>
                <span className={`text-[10px] font-semibold ${textColor} whitespace-nowrap`}>
                    {formatCurrency(debt)} / {formatCurrency(limit)}
                </span>
            </div>
        );
    }

    return (
        <div className={`p-3 rounded-xl border ${bgColor}`}>
            <div className="flex items-center justify-between mb-2">
                <span className={`text-xs font-semibold ${textColor} uppercase tracking-wide`}>
                    {status.emoji} {status.label}
                </span>
                <span className={`text-xs font-mono ${textColor}`}>
                    {percentage.toFixed(0)}%
                </span>
            </div>

            {/* Progress bar */}
            <div className="h-2 bg-surface-700 rounded-full overflow-hidden">
                <div
                    className={`h-full ${barColor} rounded-full transition-all duration-500 ease-out`}
                    style={{ width: `${percentage}%` }}
                />
            </div>

            <div className="flex justify-between mt-2 text-xs">
                <span className="text-surface-500">
                    Deuda: <span className={`font-semibold ${textColor}`}>{formatCurrency(debt)}</span>
                </span>
                <span className="text-surface-500">
                    Límite: <span className="font-semibold text-surface-300">{formatCurrency(limit)}</span>
                </span>
            </div>
        </div>
    );
}
