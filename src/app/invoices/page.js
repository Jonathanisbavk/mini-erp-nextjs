'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import { LoadingSpinner, EmptyState, StatusBadge } from '@/components/ui/SharedComponents';
import { formatCurrency, formatDate, getInvoiceStatus, getPaymentMethodLabel } from '@/lib/utils';
import { FileText, Plus, Filter } from 'lucide-react';

export default function InvoicesPage() {
    const router = useRouter();
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('');

    useEffect(() => {
        const params = statusFilter ? `?status=${statusFilter}` : '';
        fetch(`/api/invoices${params}`)
            .then(res => res.json())
            .then(data => setInvoices(Array.isArray(data) ? data : []))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [statusFilter]);

    return (
        <div>
            <Header title="Facturas" subtitle="Historial de ventas y facturación" />

            <div className="p-6">
                {/* Actions bar */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <select
                            className="input-field w-48"
                            value={statusFilter}
                            onChange={e => setStatusFilter(e.target.value)}
                        >
                            <option value="">Todos los estados</option>
                            <option value="paid">Pagadas</option>
                            <option value="pending">Pendientes</option>
                            <option value="cancelled">Canceladas</option>
                        </select>
                    </div>
                    <button onClick={() => router.push('/invoices/new')} className="btn-primary">
                        <Plus className="w-4 h-4" /> Nueva Venta
                    </button>
                </div>

                {/* Invoices List */}
                <div className="glass-card overflow-hidden">
                    {loading ? (
                        <LoadingSpinner />
                    ) : invoices.length === 0 ? (
                        <EmptyState
                            icon={FileText}
                            title="Sin facturas"
                            description="Crea tu primera venta para comenzar"
                            action={
                                <button onClick={() => router.push('/invoices/new')} className="btn-primary text-sm">
                                    <Plus className="w-4 h-4" /> Nueva Venta
                                </button>
                            }
                        />
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-surface-700">
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-surface-400 uppercase">Factura</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-surface-400 uppercase">Cliente</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-surface-400 uppercase">Fecha</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-surface-400 uppercase">Método</th>
                                        <th className="px-4 py-3 text-right text-xs font-semibold text-surface-400 uppercase">Total</th>
                                        <th className="px-4 py-3 text-center text-xs font-semibold text-surface-400 uppercase">Estado</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {invoices.map(inv => {
                                        const status = getInvoiceStatus(inv.status);
                                        return (
                                            <tr
                                                key={inv.id}
                                                className="table-row cursor-pointer"
                                                onClick={() => router.push(`/invoices/${inv.id}`)}
                                            >
                                                <td className="px-4 py-3">
                                                    <span className="text-sm font-mono text-primary-400">{inv.invoice_number}</span>
                                                </td>
                                                <td className="px-4 py-3 text-sm text-surface-300">
                                                    {inv.customers?.name || '—'}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-surface-400">
                                                    {formatDate(inv.invoice_date)}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-surface-400">
                                                    {getPaymentMethodLabel(inv.payment_method)}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-right font-semibold text-surface-200">
                                                    {formatCurrency(inv.total)}
                                                </td>
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
