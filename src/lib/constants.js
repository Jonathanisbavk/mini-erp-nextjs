export const TAX_RATE = 0.16;

export const PAYMENT_METHODS = [
    { value: 'cash', label: 'Efectivo' },
    { value: 'credit', label: 'Crédito' },
    { value: 'transfer', label: 'Transferencia' },
];

export const CUSTOMER_TYPES = [
    { value: 'retail', label: 'Minorista' },
    { value: 'wholesale', label: 'Mayorista' },
];

export const PRODUCT_CATEGORIES = [
    'Electrónica',
    'Periféricos',
    'Accesorios',
    'Almacenamiento',
    'Audio',
    'Software',
    'Redes',
    'Otros',
];

export const INVOICE_STATUSES = {
    paid: 'Pagada',
    pending: 'Pendiente',
    cancelled: 'Cancelada',
};

export const NAV_ITEMS = [
    { href: '/', label: 'Dashboard', icon: 'LayoutDashboard' },
    { href: '/customers', label: 'Clientes', icon: 'Users' },
    { href: '/inventory', label: 'Inventario', icon: 'Package' },
    { href: '/invoices', label: 'Facturas', icon: 'FileText' },
    { href: '/invoices/new', label: 'Nueva Venta', icon: 'ShoppingCart' },
];
