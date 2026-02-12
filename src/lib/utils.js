/**
 * Format a number as currency (MXN)
 */
export function formatCurrency(amount) {
    return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN',
        minimumFractionDigits: 2,
    }).format(amount || 0);
}

/**
 * Format a date string to locale format
 */
export function formatDate(dateString) {
    if (!dateString) return '—';
    return new Intl.DateTimeFormat('es-MX', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(new Date(dateString));
}

/**
 * Format a date as short date only
 */
export function formatShortDate(dateString) {
    if (!dateString) return '—';
    return new Intl.DateTimeFormat('es-MX', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    }).format(new Date(dateString));
}

/**
 * Get stock status badge info
 */
export function getStockStatus(stock, reorderPoint) {
    if (stock <= 0) return { label: 'Sin stock', color: 'red', level: 'critical' };
    if (stock <= reorderPoint) return { label: 'Stock bajo', color: 'amber', level: 'warning' };
    if (stock <= reorderPoint * 2) return { label: 'Normal', color: 'blue', level: 'normal' };
    return { label: 'Óptimo', color: 'green', level: 'optimal' };
}

/**
 * Get invoice status badge info
 */
export function getInvoiceStatus(status) {
    const map = {
        paid: { label: 'Pagada', color: 'green' },
        pending: { label: 'Pendiente', color: 'amber' },
        cancelled: { label: 'Cancelada', color: 'red' },
    };
    return map[status] || { label: status, color: 'gray' };
}

/**
 * Get payment method label
 */
export function getPaymentMethodLabel(method) {
    const map = {
        cash: 'Efectivo',
        credit: 'Crédito',
        transfer: 'Transferencia',
    };
    return map[method] || method;
}

/**
 * Generate a class string from conditional classes
 */
export function cn(...classes) {
    return classes.filter(Boolean).join(' ');
}

/**
 * Truncate text to a max length
 */
export function truncate(str, maxLen = 50) {
    if (!str) return '';
    return str.length <= maxLen ? str : str.slice(0, maxLen) + '…';
}

/**
 * Calculate profit margin percentage
 */
export function calcMargin(cost, price) {
    if (!price || price === 0) return 0;
    return ((price - cost) / price) * 100;
}

/**
 * Sanitize a phone number: remove spaces, dashes, parentheses, dots, and the leading '+'.
 * If the resulting number has ≤10 digits (no country code), prepend the default code.
 * @param {string} phone - Raw phone number
 * @param {string} defaultCode - Country code without '+' (default: '51' for Peru)
 * @returns {string} Cleaned phone number ready for wa.me
 */
export function sanitizePhone(phone, defaultCode = '51') {
    if (!phone) return '';
    // Strip all non-digit characters
    let cleaned = phone.replace(/[^0-9]/g, '');
    // If 10 digits or fewer, assume local — prepend country code
    if (cleaned.length <= 10) {
        cleaned = defaultCode + cleaned;
    }
    return cleaned;
}

/**
 * Generate a WhatsApp `wa.me` link with a pre-filled professional message.
 * @param {object} params
 * @param {string} params.phone         - Client phone (will be sanitized)
 * @param {string} params.clientName    - Client display name
 * @param {number} params.total         - Invoice total amount
 * @param {string} params.invoiceNumber - e.g. "INV-20260211-001"
 * @param {string} [params.companyName] - Business name (default from constants)
 * @param {string} [params.countryCode] - Fallback country code (default '51')
 * @returns {string} Full wa.me URL or empty string if phone missing
 */
export function generateWhatsAppLink({
    phone,
    clientName,
    total,
    invoiceNumber,
    companyName = 'Mini ERP',
    countryCode = '51',
}) {
    const cleanPhone = sanitizePhone(phone, countryCode);
    if (!cleanPhone) return '';

    const formattedTotal = formatCurrency(total);

    const message =
        `¡Hola ${clientName}! 👋\n\n` +
        `Gracias por tu compra en *${companyName}*.\n` +
        `📄 Aquí tienes tu comprobante:\n\n` +
        `🧾 *Factura:* ${invoiceNumber}\n` +
        `💰 *Total:* ${formattedTotal}\n\n` +
        `Si tienes alguna pregunta, no dudes en escribirnos. ¡Gracias por tu preferencia! 🙌`;

    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}
