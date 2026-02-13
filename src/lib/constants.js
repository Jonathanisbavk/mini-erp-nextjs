export const COMPANY_NAME = 'Mini ERP';
export const DEFAULT_COUNTRY_CODE = '51'; // Peru

export const TAX_RATE = 0.16;

export const PAYMENT_METHODS = [
    { value: 'cash', label: 'Efectivo', icon: '💵' },
    { value: 'yape', label: 'Yape', icon: '📱' },
    { value: 'plin', label: 'Plin', icon: '📲' },
    { value: 'card', label: 'Tarjeta', icon: '💳' },
    { value: 'transfer', label: 'Transferencia', icon: '🏦' },
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
