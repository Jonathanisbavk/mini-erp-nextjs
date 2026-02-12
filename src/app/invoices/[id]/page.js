'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import { LoadingSpinner, StatusBadge } from '@/components/ui/SharedComponents';
import { formatCurrency, formatDate, getInvoiceStatus, getPaymentMethodLabel } from '@/lib/utils';
import { ArrowLeft, Printer, FileText, User, Package, DollarSign } from 'lucide-react';
import WhatsAppButton from '@/components/ui/WhatsAppButton';

export default function InvoiceDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const [invoice, setInvoice] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`/api/invoices/${id}`)
            .then(res => res.json())
            .then(setInvoice)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) return <LoadingSpinner />;
    if (!invoice) return <div className="p-8 text-surface-400">Factura no encontrada</div>;

    const status = getInvoiceStatus(invoice.status);

    return (
        <div>
            <Header title={`Factura ${invoice.invoice_number}`} subtitle={`Creada el ${formatDate(invoice.created_at)}`} />

            <div className="p-6 space-y-6">
                {/* Back + actions */}
                <div className="flex items-center justify-between">
                    <button onClick={() => router.push('/invoices')} className="btn-ghost text-sm">
                        <ArrowLeft className="w-4 h-4" /> Volver a Facturas
                    </button>
                    <div className="flex items-center gap-2">
                        <WhatsAppButton
                            phone={invoice.customers?.phone}
                            clientName={invoice.customers?.name || 'Cliente'}
                            total={invoice.total}
                            invoiceNumber={invoice.invoice_number}
                            size="sm"
                        />
                        <button onClick={() => window.print()} className="btn-secondary text-sm">
                            <Printer className="w-4 h-4" /> Imprimir
                        </button>
                    </div>
                </div>

                {/* Invoice Card */}
                <div className="glass-card p-8">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-8 pb-6 border-b border-surface-700">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
                                    <FileText className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-surface-100">{invoice.invoice_number}</h2>
                                    <p className="text-sm text-surface-500">{formatDate(invoice.invoice_date)}</p>
                                </div>
                            </div>
                        </div>
                        <div className="text-right">
                            <StatusBadge color={status.color}>{status.label}</StatusBadge>
                            <p className="text-sm text-surface-500 mt-2">
                                {getPaymentMethodLabel(invoice.payment_method)}
                            </p>
                        </div>
                    </div>

                    {/* Customer Info */}
                    <div className="grid grid-cols-2 gap-8 mb-8">
                        <div>
                            <h4 className="text-xs font-semibold text-surface-400 uppercase mb-2 flex items-center gap-1">
                                <User className="w-3.5 h-3.5" /> Cliente
                            </h4>
                            <p className="text-base font-semibold text-surface-200">{invoice.customers?.name || '—'}</p>
                            <p className="text-sm text-surface-400">{invoice.customers?.email || ''}</p>
                            <p className="text-sm text-surface-400">{invoice.customers?.phone || ''}</p>
                            {invoice.customers?.tax_id && (
                                <p className="text-sm text-surface-500 mt-1">RFC: {invoice.customers.tax_id}</p>
                            )}
                            {invoice.customers?.address && (
                                <p className="text-sm text-surface-500">{invoice.customers.address}</p>
                            )}
                        </div>
                        <div className="text-right">
                            <h4 className="text-xs font-semibold text-surface-400 uppercase mb-2">Totales</h4>
                            <div className="space-y-1">
                                <div className="flex justify-end gap-8 text-sm">
                                    <span className="text-surface-400">Subtotal:</span>
                                    <span className="text-surface-200 font-medium w-28 text-right">{formatCurrency(invoice.subtotal)}</span>
                                </div>
                                <div className="flex justify-end gap-8 text-sm">
                                    <span className="text-surface-400">IVA ({(invoice.tax_rate * 100).toFixed(0)}%):</span>
                                    <span className="text-surface-200 font-medium w-28 text-right">{formatCurrency(invoice.tax_amount)}</span>
                                </div>
                                <div className="flex justify-end gap-8 text-lg font-bold border-t border-surface-700 pt-2 mt-2">
                                    <span className="text-surface-200">Total:</span>
                                    <span className="text-primary-400 w-28 text-right">{formatCurrency(invoice.total)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Line Items */}
                    <h4 className="text-xs font-semibold text-surface-400 uppercase mb-3 flex items-center gap-1">
                        <Package className="w-3.5 h-3.5" /> Productos
                    </h4>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-surface-700">
                                    <th className="px-4 py-2 text-left text-xs font-semibold text-surface-400 uppercase">Producto</th>
                                    <th className="px-4 py-2 text-left text-xs font-semibold text-surface-400 uppercase">SKU</th>
                                    <th className="px-4 py-2 text-right text-xs font-semibold text-surface-400 uppercase">Precio</th>
                                    <th className="px-4 py-2 text-right text-xs font-semibold text-surface-400 uppercase">Cantidad</th>
                                    <th className="px-4 py-2 text-right text-xs font-semibold text-surface-400 uppercase">Subtotal</th>
                                </tr>
                            </thead>
                            <tbody>
                                {invoice.invoice_items?.map(item => (
                                    <tr key={item.id} className="table-row">
                                        <td className="px-4 py-3 text-sm font-medium text-surface-200">
                                            {item.products?.name || 'Producto eliminado'}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-surface-500 font-mono">
                                            {item.products?.sku || '—'}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-right text-surface-400">
                                            {formatCurrency(item.unit_price)}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-right text-surface-200 font-semibold">
                                            {item.quantity}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-right text-surface-200 font-semibold">
                                            {formatCurrency(item.subtotal)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Notes */}
                    {invoice.notes && (
                        <div className="mt-6 p-4 rounded-xl bg-surface-900/50">
                            <p className="text-xs font-semibold text-surface-400 uppercase mb-1">Notas</p>
                            <p className="text-sm text-surface-300">{invoice.notes}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
