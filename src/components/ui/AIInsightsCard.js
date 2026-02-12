'use client';

import { useState } from 'react';
import { Sparkles, TrendingUp, Package, AlertTriangle, Loader2, RefreshCw } from 'lucide-react';

const INSIGHT_CARDS = [
    {
        key: 'consejo_ventas',
        title: 'Estrategia de Ventas',
        icon: TrendingUp,
        gradient: 'from-blue-500 to-indigo-600',
        bgGlow: 'bg-blue-500/10',
        borderColor: 'border-blue-500/20',
        iconColor: 'text-blue-400',
    },
    {
        key: 'consejo_inventario',
        title: 'Optimización de Inventario',
        icon: Package,
        gradient: 'from-emerald-500 to-teal-600',
        bgGlow: 'bg-emerald-500/10',
        borderColor: 'border-emerald-500/20',
        iconColor: 'text-emerald-400',
    },
    {
        key: 'alerta_critica',
        title: 'Alerta Crítica',
        icon: AlertTriangle,
        gradient: 'from-amber-500 to-orange-600',
        bgGlow: 'bg-amber-500/10',
        borderColor: 'border-amber-500/20',
        iconColor: 'text-amber-400',
    },
];

/**
 * AIInsightsCard — Gemini-powered business intelligence panel.
 *
 * @param {object} props
 * @param {object} props.dashboardData - The full dashboard data object (topProducts, kpis, etc.)
 */
export default function AIInsightsCard({ dashboardData }) {
    const [insights, setInsights] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [generatedAt, setGeneratedAt] = useState(null);

    // Load cached insights on mount
    useEffect(() => {
        if (typeof window === 'undefined') return;

        try {
            const cached = localStorage.getItem('ai_insights');
            if (cached) {
                const { data, date } = JSON.parse(cached);
                // Check if less than 24 hours old
                const isFresh = (new Date() - new Date(date)) < 24 * 60 * 60 * 1000;
                if (isFresh) {
                    setInsights(data);
                    setGeneratedAt(date);
                }
            }
        } catch (e) {
            console.error('Error parsing cached insights', e);
            // Clear invalid cache
            localStorage.removeItem('ai_insights');
        }
    }, []);

    const handleAnalyze = async (forceRefresh = false) => {
        setLoading(true);
        setError(null);

        try {
            // Prepare low-stock products from dashboard context
            const lowStockProducts = dashboardData?.topProducts
                ?.filter(p => p.totalSold > 0)
                ?.slice(0, 5) || [];

            const res = await fetch('/api/analyze-business', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    topProducts: dashboardData?.topProducts || [],
                    lowStockProducts,
                    monthlySales: dashboardData?.kpis?.monthlyRevenue || 0,
                    totalCustomers: dashboardData?.kpis?.newCustomers || 0,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Error al generar análisis');
            }

            setInsights(data.insights);
            setGeneratedAt(data.generatedAt);

            // Save to cache
            localStorage.setItem('ai_insights', JSON.stringify({
                data: data.insights,
                date: data.generatedAt
            }));
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Initial state — show CTA button
    if (!insights && !loading && !error) {
        return (
            <div className="glass-card p-6">
                <div className="text-center py-4">
                    <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/25">
                        <Sparkles className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-surface-100 mb-1">
                        Consultor de Negocios IA
                    </h3>
                    <p className="text-sm text-surface-500 mb-5 max-w-xs mx-auto">
                        Analiza tus ventas e inventario con inteligencia artificial para obtener recomendaciones estratégicas
                    </p>
                    <button
                        onClick={() => handleAnalyze(true)}
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl
                                   bg-gradient-to-r from-violet-500 to-purple-600
                                   hover:from-violet-400 hover:to-purple-500
                                   text-white font-semibold text-sm
                                   shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40
                                   transition-all duration-300 active:scale-[0.98]"
                    >
                        <Sparkles className="w-4 h-4" />
                        Generar Reporte Inteligente
                    </button>
                </div>
            </div>
        );
    }

    // Loading state
    if (loading) {
        return (
            <div className="glass-card p-6">
                <div className="text-center py-8">
                    <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-violet-500/20 to-purple-600/20 flex items-center justify-center animate-pulse">
                        <Loader2 className="w-7 h-7 text-violet-400 animate-spin" />
                    </div>
                    <h3 className="text-base font-semibold text-surface-200 mb-1">
                        Analizando tendencias de mercado...
                    </h3>
                    <p className="text-xs text-surface-500">
                        Procesando datos de ventas, inventario y clientes
                    </p>
                    <div className="mt-4 flex items-center justify-center gap-1.5">
                        {[0, 1, 2].map(i => (
                            <div
                                key={i}
                                className="w-2 h-2 rounded-full bg-violet-400"
                                style={{
                                    animation: `pulseSoft 1.4s infinite ${i * 0.2}s`,
                                }}
                            />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="glass-card p-6">
                <div className="text-center py-4">
                    <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-red-500/10 flex items-center justify-center">
                        <AlertTriangle className="w-6 h-6 text-red-400" />
                    </div>
                    <p className="text-sm text-red-300 mb-4">{error}</p>
                    <button
                        onClick={() => handleAnalyze(true)}
                        className="btn-secondary text-sm"
                    >
                        <RefreshCw className="w-4 h-4" /> Reintentar
                    </button>
                </div>
            </div>
        );
    }

    // Results state
    return (
        <div className="glass-card p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                        <Sparkles className="w-4.5 h-4.5 text-white" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-surface-100">Reporte IA</h3>
                        {generatedAt && (
                            <p className="text-[10px] text-surface-500">
                                {new Date(generatedAt).toLocaleString('es-MX')}
                            </p>
                        )}
                    </div>
                </div>
                <button
                    onClick={() => handleAnalyze(true)}
                    className="p-2 rounded-lg hover:bg-surface-700/50 transition-colors text-surface-400 hover:text-surface-200"
                    title="Regenerar análisis"
                >
                    <RefreshCw className="w-4 h-4" />
                </button>
            </div>

            {/* Insight Cards */}
            <div className="space-y-3">
                {INSIGHT_CARDS.map((card, index) => {
                    const Icon = card.icon;
                    const text = insights?.[card.key] || 'Sin datos disponibles';
                    return (
                        <div
                            key={card.key}
                            className={`p-4 rounded-xl ${card.bgGlow} border ${card.borderColor}
                                        transition-all duration-300 animate-slide-up`}
                            style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'both' }}
                        >
                            <div className="flex items-start gap-3">
                                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${card.gradient} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                                    <Icon className="w-4 h-4 text-white" />
                                </div>
                                <div>
                                    <h4 className={`text-xs font-semibold ${card.iconColor} uppercase tracking-wide mb-1`}>
                                        {card.title}
                                    </h4>
                                    <p className="text-sm text-surface-200 leading-relaxed">
                                        {text}
                                    </p>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
