'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import { LoadingSpinner } from '@/components/ui/SharedComponents';
import { formatCurrency } from '@/lib/utils';
import {
    DollarSign,
    ShoppingCart,
    AlertTriangle,
    UserPlus,
    TrendingUp,
} from 'lucide-react';
import {
    BarChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    Area, AreaChart,
} from 'recharts';

export default function DashboardPage() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/dashboard')
            .then(res => res.json())
            .then(setData)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <LoadingSpinner />;
    if (!data) return <div className="p-8 text-surface-400">Error al cargar el dashboard</div>;

    const { kpis, monthlyData, topProducts, recentInvoices } = data;

    const kpiCards = [
        {
            label: 'Ingresos del mes',
            value: formatCurrency(kpis.monthlyRevenue),
            icon: DollarSign,
            gradient: 'from-green-500 to-emerald-500',
            bgGlow: 'shadow-green-500/10',
        },
        {
            label: 'Órdenes hoy',
            value: kpis.todayOrders,
            icon: ShoppingCart,
            gradient: 'from-primary-500 to-violet-500',
            bgGlow: 'shadow-primary-500/10',
        },
        {
            label: 'Productos en alerta',
            value: kpis.lowStockCount,
            icon: AlertTriangle,
            gradient: 'from-amber-500 to-orange-500',
            bgGlow: 'shadow-amber-500/10',
            alert: kpis.lowStockCount > 0,
        },
        {
            label: 'Clientes nuevos',
            value: kpis.newCustomers,
            icon: UserPlus,
            gradient: 'from-blue-500 to-cyan-500',
            bgGlow: 'shadow-blue-500/10',
        },
    ];

    return (
        <div>
            <Header title="Dashboard" subtitle="Resumen ejecutivo de tu negocio" />

            <div className="p-6 space-y-6">
                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                    {kpiCards.map((kpi, i) => (
                        <div
                            key={i}
                            className={`kpi-card animate-slide-up shadow-xl ${kpi.bgGlow}`}
                            style={{ animationDelay: `${i * 100}ms` }}
                        >
                            <div className={`absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r ${kpi.gradient}`} />
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-xs font-semibold text-surface-400 uppercase tracking-wider mb-1">
                                        {kpi.label}
                                    </p>
                                    <p className="text-2xl font-bold text-surface-50">{kpi.value}</p>
                                </div>
                                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${kpi.gradient} flex items-center justify-center shadow-lg`}>
                                    <kpi.icon className="w-5 h-5 text-white" />
                                </div>
                            </div>
                            {kpi.alert && (
                                <p className="mt-2 text-xs text-amber-400 flex items-center gap-1">
                                    <AlertTriangle className="w-3 h-3" /> Requiere atención
                                </p>
                            )}
                        </div>
                    ))}
                </div>

                {/* Charts Row */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                    {/* Revenue Chart */}
                    <div className="xl:col-span-2 glass-card p-6">
                        <h3 className="section-title mb-4">
                            <TrendingUp className="w-5 h-5 text-primary-400" />
                            Ingresos Mensuales
                        </h3>
                        <div className="h-72">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={monthlyData}>
                                    <defs>
                                        <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                    <XAxis dataKey="month" stroke="#64748B" fontSize={12} />
                                    <YAxis stroke="#64748B" fontSize={12} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: '#1E293B',
                                            border: '1px solid #334155',
                                            borderRadius: '12px',
                                            color: '#F8FAFC',
                                        }}
                                        formatter={(value) => [formatCurrency(value), 'Ingresos']}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="revenue"
                                        stroke="#6366F1"
                                        strokeWidth={2}
                                        fill="url(#revenueGradient)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Top Products */}
                    <div className="glass-card p-6">
                        <h3 className="section-title mb-4">
                            <BarChart className="w-5 h-5 text-primary-400" />
                            Top Productos
                        </h3>
                        <div className="space-y-3">
                            {topProducts.map((product, i) => (
                                <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-surface-800/50 hover:bg-surface-800 transition-colors">
                                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500/20 to-primary-600/20 flex items-center justify-center text-xs font-bold text-primary-400">
                                        #{i + 1}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-surface-200 truncate">{product.name}</p>
                                        <p className="text-xs text-surface-500">{product.totalSold} vendidos</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-semibold text-surface-200">{formatCurrency(product.totalRevenue)}</p>
                                        <p className="text-xs text-green-400">{product.margin}% margen</p>
                                    </div>
                                </div>
                            ))}
                            {topProducts.length === 0 && (
                                <p className="text-sm text-surface-500 text-center py-4">Sin datos aún</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Recent Invoices & Pending Balance */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                    <div className="xl:col-span-2 glass-card p-6">
                        <h3 className="section-title mb-4">
                            <FileTextIcon className="w-5 h-5 text-primary-400" />
                            Últimas Facturas
                        </h3>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-surface-700">
                                        <th className="px-4 py-2 text-left text-xs font-semibold text-surface-400 uppercase">Factura</th>
                                        <th className="px-4 py-2 text-left text-xs font-semibold text-surface-400 uppercase">Cliente</th>
                                        <th className="px-4 py-2 text-right text-xs font-semibold text-surface-400 uppercase">Total</th>
                                        <th className="px-4 py-2 text-center text-xs font-semibold text-surface-400 uppercase">Estado</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentInvoices.map(inv => (
                                        <tr key={inv.id} className="table-row">
                                            <td className="px-4 py-3 text-sm font-mono text-primary-400">{inv.invoice_number}</td>
                                            <td className="px-4 py-3 text-sm text-surface-300">{inv.customers?.name || '—'}</td>
                                            <td className="px-4 py-3 text-sm text-right font-semibold text-surface-200">{formatCurrency(inv.total)}</td>
                                            <td className="px-4 py-3 text-center">
                                                <span className={inv.status === 'paid' ? 'badge-green' : inv.status === 'pending' ? 'badge-amber' : 'badge-red'}>
                                                    {inv.status === 'paid' ? 'Pagada' : inv.status === 'pending' ? 'Pendiente' : 'Cancelada'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Summary Card */}
                    <div className="glass-card p-6">
                        <h3 className="section-title mb-4">Resumen Financiero</h3>
                        <div className="space-y-4">
                            <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20">
                                <p className="text-xs text-green-400 font-semibold uppercase mb-1">Ingresos del Mes</p>
                                <p className="text-xl font-bold text-green-400">{formatCurrency(kpis.monthlyRevenue)}</p>
                            </div>
                            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                                <p className="text-xs text-amber-400 font-semibold uppercase mb-1">Saldo Pendiente</p>
                                <p className="text-xl font-bold text-amber-400">{formatCurrency(kpis.pendingBalance)}</p>
                            </div>
                            <div className="p-4 rounded-xl bg-primary-500/10 border border-primary-500/20">
                                <p className="text-xs text-primary-400 font-semibold uppercase mb-1">Órdenes Hoy</p>
                                <p className="text-xl font-bold text-primary-400">{kpis.todayOrders}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function FileTextIcon(props) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
            <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" /><path d="M14 2v4a2 2 0 0 0 2 2h4" /><path d="M10 9H8" /><path d="M16 13H8" /><path d="M16 17H8" />
        </svg>
    );
}
