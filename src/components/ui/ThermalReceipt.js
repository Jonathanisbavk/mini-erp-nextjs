'use client';

import { COMPANY_NAME } from '@/lib/constants';

const SEPARATOR = '────────────────────────────────────';
const SEPARATOR_DOUBLE = '════════════════════════════════════';
const SEPARATOR_DOT = '┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄';

function padLine(left, right, width = 40) {
    const spaces = width - left.length - right.length;
    return left + ' '.repeat(Math.max(1, spaces)) + right;
}

function formatMoney(amount) {
    return `S/ ${Number(amount || 0).toFixed(2)}`;
}

function formatTicketDate(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleDateString('es-PE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

/**
 * ThermalReceipt — Ticket térmico 80mm optimizado para impresora ticketera.
 *
 * @param {object} invoice - Datos de la factura con items, customer, totals
 * @param {string} businessName - Nombre del negocio
 * @param {string} ruc - RUC del negocio
 * @param {string} address - Dirección del negocio
 */
export default function ThermalReceipt({
    invoice,
    businessName = COMPANY_NAME,
    ruc = '20XXXXXXXXX',
    address = 'Lima, Perú',
}) {
    if (!invoice) return null;

    const items = invoice.invoice_items || [];
    const customer = invoice.customers;
    const paymentLabels = {
        cash: 'EFECTIVO',
        yape: 'YAPE',
        plin: 'PLIN',
        card: 'TARJETA',
        transfer: 'TRANSFERENCIA',
        credit: 'CRÉDITO/FIADO',
    };

    return (
        <div className="thermal-receipt print-only" id="thermal-receipt">
            {/* ====== HEADER ====== */}
            <div className="receipt-center receipt-bold receipt-lg">
                {businessName}
            </div>
            <div className="receipt-center receipt-sm">
                RUC: {ruc}
            </div>
            <div className="receipt-center receipt-sm">
                {address}
            </div>

            <div className="receipt-separator">{SEPARATOR_DOUBLE}</div>

            {/* ====== INVOICE INFO ====== */}
            <div className="receipt-center receipt-bold">
                COMPROBANTE DE VENTA
            </div>
            <div className="receipt-center receipt-sm">
                {invoice.invoice_number}
            </div>
            <div className="receipt-center receipt-sm">
                {formatTicketDate(invoice.invoice_date || invoice.created_at)}
            </div>

            <div className="receipt-separator">{SEPARATOR}</div>

            {/* ====== CUSTOMER ====== */}
            {customer && (
                <>
                    <div className="receipt-row">
                        <span>Cliente:</span>
                        <span>{customer.name}</span>
                    </div>
                    {customer.tax_id && (
                        <div className="receipt-row">
                            <span>RUC:</span>
                            <span>{customer.tax_id}</span>
                        </div>
                    )}
                    <div className="receipt-separator">{SEPARATOR}</div>
                </>
            )}

            {/* ====== ITEMS ====== */}
            <div className="receipt-row receipt-bold receipt-sm">
                <span>CANT DESCRIPCIÓN</span>
                <span>TOTAL</span>
            </div>
            <div className="receipt-separator">{SEPARATOR_DOT}</div>

            {items.map((item, i) => (
                <div key={item.id || i} className="receipt-item">
                    <div className="receipt-item-name">
                        {item.quantity}x {item.products?.name || 'Producto'}
                    </div>
                    <div className="receipt-row receipt-sm">
                        <span>  @ {formatMoney(item.unit_price)}</span>
                        <span>{formatMoney(item.subtotal)}</span>
                    </div>
                </div>
            ))}

            <div className="receipt-separator">{SEPARATOR}</div>

            {/* ====== TOTALS ====== */}
            <div className="receipt-row">
                <span>Subtotal:</span>
                <span>{formatMoney(invoice.subtotal)}</span>
            </div>
            <div className="receipt-row">
                <span>IGV ({((invoice.tax_rate || 0.18) * 100).toFixed(0)}%):</span>
                <span>{formatMoney(invoice.tax_amount)}</span>
            </div>
            <div className="receipt-separator">{SEPARATOR_DOT}</div>
            <div className="receipt-row receipt-bold receipt-lg">
                <span>TOTAL:</span>
                <span>{formatMoney(invoice.total)}</span>
            </div>

            <div className="receipt-separator">{SEPARATOR}</div>

            {/* ====== PAYMENT ====== */}
            <div className="receipt-row">
                <span>Pago:</span>
                <span>{paymentLabels[invoice.payment_method] || invoice.payment_method}</span>
            </div>
            <div className="receipt-row">
                <span>Estado:</span>
                <span>{invoice.status === 'paid' ? 'PAGADO' : invoice.status === 'pending' ? 'PENDIENTE' : 'CANCELADO'}</span>
            </div>

            {invoice.notes && (
                <div className="receipt-notes">
                    Nota: {invoice.notes}
                </div>
            )}

            <div className="receipt-separator">{SEPARATOR_DOUBLE}</div>

            {/* ====== FOOTER ====== */}
            <div className="receipt-center receipt-bold">
                ¡Gracias por su compra!
            </div>
            <div className="receipt-center receipt-sm">
                Conserve este comprobante
            </div>
            <div className="receipt-center receipt-sm" style={{ marginTop: '8px' }}>
                {businessName} — Sistema POS
            </div>

            {/* Corte visual */}
            <div className="receipt-cut">✂ {SEPARATOR_DOT}</div>
        </div>
    );
}
