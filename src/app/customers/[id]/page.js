'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import { LoadingSpinner, StatusBadge } from '@/components/ui/SharedComponents';
import { formatCurrency, formatDate, getInvoiceStatus, getPaymentMethodLabel } from '@/lib/utils';
import { ArrowLeft, User, DollarSign, FileText, TrendingUp } from 'lucide-react';

export default function CustomerDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const [customer, setCustomer] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`/api/customers/${id}`)
            .then(res => res.json())
            .then(setCustomer)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) return <LoadingSpinner />;
    if (!customer) return <div className="p-8 text-surface-400">Cliente no encontrado</div>;

    return (
        <div>
            <Header title={customer.name} subtitle="Perfil de cliente" />

            <div className="p-6 space-y-6">
                {/* Back button */}
                <button onClick={() => router.push('/customers')} className="btn-ghost text-sm">
                    <ArrowLeft className="w-4 h-4" /> Volver a Clientes
                </button>

                {/* Customer Info Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="glass-card p-5">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-xl bg-primary-500/20 flex items-center justify-center">
                                <User className="w-5 h-5 text-primary-400" />
                            </div>
                            <h3 className="text-sm font-semibold text-surface-300">Datos del Cliente</h3>
                        </div>
                        <div className="space-y-2 text-sm">
                            <Row label="Email" value={customer.email} />
                            <Row label="Teléfono" value={customer.phone} />
                            <Row label="RFC" value={customer.tax_id} />
                            <Row label="Dirección" value={customer.address} />
                            <Row label="Tipo" value={customer.customer_type === 'wholesale' ? 'Mayorista' : 'Minorista'} />
                        </div>
                    </div>

                    <div className="glass-card p-5">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
                                <TrendingUp className="w-5 h-5 text-green-400" />
                            </div>
                            <h3 className="text-sm font-semibold text-surface-300">Valor del Cliente (LTV)</h3>
                        </div>
                        <p className="text-3xl font-bold text-green-400">{formatCurrency(customer.ltv)}</p>
                        <p className="text-xs text-surface-500 mt-1">Total facturado históricamente</p>
                    </div>

                    <div className="glass-card p-5">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                                <DollarSign className="w-5 h-5 text-amber-400" />
                            </div>
                            <h3 className="text-sm font-semibold text-surface-300">Saldo Pendiente</h3>
                        </div>
                        <p className={`text-3xl font-bold ${customer.balance > 0 ? 'text-amber-400' : 'text-surface-500'}`}>
                            {formatCurrency(customer.balance)}
                        </p>
                        <p className="text-xs text-surface-500 mt-1">
                            Límite: {formatCurrency(customer.credit_limit)}
                        </p>
                    </div>
                </div>

                {/* Purchase History */}
                <div className="glass-card p-6">
                    <h3 className="section-title mb-4">
                        <FileText className="w-5 h-5 text-primary-400" /> Historial de Compras
                    </h3>
                    {customer.invoices?.length === 0 ? (
                        <p className="text-sm text-surface-500 text-center py-8">Este cliente no tiene facturas aún</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-surface-700">
                                        <th className="px-4 py-2 text-left text-xs font-semibold text-surface-400 uppercase">Factura</th>
                                        <th className="px-4 py-2 text-left text-xs font-semibold text-surface-400 uppercase">Fecha</th>
                                        <th className="px-4 py-2 text-left text-xs font-semibold text-surface-400 uppercase">Productos</th>
                                        <th className="px-4 py-2 text-right text-xs font-semibold text-surface-400 uppercase">Total</th>
                                        <th className="px-4 py-2 text-center text-xs font-semibold text-surface-400 uppercase">Estado</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {customer.invoices.map(inv => {
                                        const status = getInvoiceStatus(inv.status);
                                        return (
                                            <tr key={inv.id} className="table-row cursor-pointer" onClick={() => router.push(`/invoices/${inv.id}`)}>
                                                <td className="px-4 py-3 text-sm font-mono text-primary-400">{inv.invoice_number}</td>
                                                <td className="px-4 py-3 text-sm text-surface-400">{formatDate(inv.invoice_date)}</td>
                                                <td className="px-4 py-3 text-sm text-surface-400">
                                                    {inv.invoice_items?.map(item => item.products?.name).filter(Boolean).join(', ') || '—'}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-right font-semibold text-surface-200">{formatCurrency(inv.total)}</td>
                                                <td className="px-4 py-3 text-center">
                                                    <StatusBadge color={status.color}>{status.label}</StatusBadge>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function Row({ label, value }) {
    return (
        <div className="flex justify-between">
            <span className="text-surface-500">{label}</span>
            <span className="text-surface-200 font-medium">{value || '—'}</span>
        </div>
    );
}
