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
