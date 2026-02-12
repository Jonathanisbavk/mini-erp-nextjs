'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import { LoadingSpinner, StatusBadge } from '@/components/ui/SharedComponents';
import { formatCurrency, getStockStatus } from '@/lib/utils';
import { PAYMENT_METHODS, TAX_RATE } from '@/lib/constants';
import {
    ShoppingCart, Search, Plus, Minus, Trash2, CreditCard,
    User, AlertCircle, CheckCircle, X
} from 'lucide-react';
import WhatsAppButton from '@/components/ui/WhatsAppButton';

export default function NewInvoicePage() {
    const router = useRouter();
    const [customers, setCustomers] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [lastInvoice, setLastInvoice] = useState(null);

    // Form state
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [customerSearch, setCustomerSearch] = useState('');
    const [productSearch, setProductSearch] = useState('');
    const [cart, setCart] = useState([]);
    const [paymentMethod, setPaymentMethod] = useState('cash');
    const [notes, setNotes] = useState('');

    useEffect(() => {
        Promise.all([
            fetch('/api/customers').then(r => r.json()),
            fetch('/api/products').then(r => r.json()),
        ]).then(([custs, prods]) => {
            setCustomers(Array.isArray(custs) ? custs : []);
            setProducts(Array.isArray(prods) ? prods.filter(p => p.status === 'active') : []);
        }).catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    // Keyboard shortcut: F9 to submit
    useEffect(() => {
        const handler = (e) => {
            if (e.key === 'F9') {
                e.preventDefault();
                handleSubmit();
            }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [cart, selectedCustomer]);

    const addToCart = (product) => {
        setCart(prev => {
            const existing = prev.find(item => item.product_id === product.id);
            if (existing) {
                if (existing.quantity >= product.stock) {
                    setError(`Stock insuficiente para "${product.name}". Disponible: ${product.stock}`);
                    setTimeout(() => setError(null), 3000);
                    return prev;
                }
                return prev.map(item =>
                    item.product_id === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }
            if (product.stock <= 0) {
                setError(`"${product.name}" no tiene stock disponible`);
                setTimeout(() => setError(null), 3000);
                return prev;
            }
            return [...prev, {
                product_id: product.id,
                name: product.name,
                sku: product.sku,
                unit_price: product.unit_price,
                quantity: 1,
                stock: product.stock,
            }];
        });
    };

    const updateQuantity = (productId, delta) => {
        setCart(prev => prev.map(item => {
            if (item.product_id !== productId) return item;
            const newQty = item.quantity + delta;
            if (newQty <= 0) return null;
            if (newQty > item.stock) {
                setError(`Stock máximo disponible: ${item.stock}`);
                setTimeout(() => setError(null), 3000);
                return item;
            }
            return { ...item, quantity: newQty };
        }).filter(Boolean));
    };

    const removeFromCart = (productId) => {
        setCart(prev => prev.filter(item => item.product_id !== productId));
    };

    const subtotal = cart.reduce((sum, item) => sum + item.unit_price * item.quantity, 0);
    const taxAmount = Math.round(subtotal * TAX_RATE * 100) / 100;
    const total = subtotal + taxAmount;

    const handleSubmit = async () => {
        if (!selectedCustomer) {
            setError('Debe seleccionar un cliente');
            setTimeout(() => setError(null), 3000);
            return;
        }
        if (cart.length === 0) {
            setError('Debe agregar al menos un producto');
            setTimeout(() => setError(null), 3000);
            return;
        }

        // Credit limit check
        if (paymentMethod === 'credit') {
            const newBalance = (selectedCustomer.balance || 0) + total;
            if (selectedCustomer.credit_limit > 0 && newBalance > selectedCustomer.credit_limit) {
                setError(`Excede el límite de crédito. Límite: ${formatCurrency(selectedCustomer.credit_limit)}, Saldo actual: ${formatCurrency(selectedCustomer.balance)}`);
                setTimeout(() => setError(null), 5000);
                return;
            }
        }

        setSubmitting(true);
        setError(null);

        try {
            const res = await fetch('/api/invoices', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    customer_id: selectedCustomer.id,
                    payment_method: paymentMethod,
                    tax_rate: TAX_RATE,
                    notes,
                    items: cart.map(item => ({
                        product_id: item.product_id,
                        quantity: item.quantity,
                    })),
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || 'Error al crear la factura');
                setSubmitting(false);
                return;
            }

            setLastInvoice({
                id: data.invoice_id,
                invoiceNumber: data.invoice_number || `INV-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-???`,
                total,
                customerName: selectedCustomer.name,
                customerPhone: selectedCustomer.phone,
            });
            setSuccess(`Factura creada exitosamente`);
        } catch (err) {
            setError('Error de conexión. Intente de nuevo.');
            setSubmitting(false);
        }
    };

    // Filtered lists
    const filteredCustomers = customers.filter(c =>
        c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
        (c.email && c.email.toLowerCase().includes(customerSearch.toLowerCase()))
    );

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
        p.sku.toLowerCase().includes(productSearch.toLowerCase())
    );

    if (loading) return <LoadingSpinner />;

    return (
        <div>
            <Header title="Punto de Venta" subtitle="Crear nueva factura — F9 para facturar" />

            {/* Notifications */}
            {error && (
                <div className="mx-6 mt-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3 animate-slide-up">
                    <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                    <p className="text-sm text-red-300">{error}</p>
                    <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-300">
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}
            {success && (
                <div className="mx-6 mt-4 p-4 rounded-xl bg-green-500/10 border border-green-500/20 animate-slide-up">
                    <div className="flex items-center gap-3 mb-3">
                        <CheckCircle className="w-5 h-5 text-green-400" />
                        <p className="text-sm text-green-300 font-medium">{success}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        {lastInvoice && (
                            <WhatsAppButton
                                phone={lastInvoice.customerPhone}
                                clientName={lastInvoice.customerName}
                                total={lastInvoice.total}
                                invoiceNumber={lastInvoice.invoiceNumber}
                                size="sm"
                            />
                        )}
                        {lastInvoice && (
                            <button
                                onClick={() => router.push(`/invoices/${lastInvoice.id}`)}
                                className="btn-secondary text-xs"
                            >
                                Ver Factura
                            </button>
                        )}
                    </div>
                </div>
            )}

            <div className="p-6 grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Left: Product Selection */}
                <div className="xl:col-span-2 space-y-4">
                    {/* Customer Selection */}
                    <div className="glass-card p-4">
                        <label className="text-xs font-semibold text-surface-400 uppercase mb-2 block">
                            <User className="w-3.5 h-3.5 inline mr-1" /> Cliente
                        </label>
                        {selectedCustomer ? (
                            <div className="flex items-center justify-between p-3 rounded-xl bg-primary-500/10 border border-primary-500/20">
                                <div>
                                    <p className="font-medium text-surface-200">{selectedCustomer.name}</p>
                                    <p className="text-xs text-surface-500">{selectedCustomer.email || 'Sin email'} · Saldo: {formatCurrency(selectedCustomer.balance)}</p>
                                </div>
                                <button onClick={() => setSelectedCustomer(null)} className="btn-ghost text-xs p-1">
                                    <X className="w-4 h-4" /> Cambiar
                                </button>
                            </div>
                        ) : (
                            <div>
                                <input
                                    type="text"
                                    placeholder="Buscar cliente..."
                                    className="input-field mb-2"
                                    value={customerSearch}
                                    onChange={e => setCustomerSearch(e.target.value)}
                                    autoFocus
                                />
                                <div className="max-h-36 overflow-y-auto space-y-1">
                                    {filteredCustomers.slice(0, 8).map(c => (
                                        <button
                                            key={c.id}
                                            onClick={() => { setSelectedCustomer(c); setCustomerSearch(''); }}
                                            className="w-full text-left p-2 rounded-lg hover:bg-surface-700/50 transition-colors"
                                        >
                                            <p className="text-sm font-medium text-surface-200">{c.name}</p>
                                            <p className="text-xs text-surface-500">{c.email || '—'}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Product Grid */}
                    <div className="glass-card p-4">
                        <div className="flex items-center justify-between mb-3">
                            <label className="text-xs font-semibold text-surface-400 uppercase">Productos</label>
                            <div className="relative w-64">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
                                <input
                                    type="text"
                                    placeholder="Buscar producto o SKU..."
                                    className="input-field pl-9 py-2 text-sm"
                                    value={productSearch}
                                    onChange={e => setProductSearch(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-[50vh] overflow-y-auto">
                            {filteredProducts.map(product => {
                                const stockInfo = getStockStatus(product.stock, product.reorder_point);
                                const inCart = cart.find(i => i.product_id === product.id);
                                return (
                                    <button
                                        key={product.id}
                                        onClick={() => addToCart(product)}
                                        disabled={product.stock <= 0}
                                        className={`text-left p-3 rounded-xl border transition-all duration-200 ${inCart
                                            ? 'bg-primary-500/10 border-primary-500/30'
                                            : product.stock <= 0
                                                ? 'bg-surface-800/30 border-surface-700/30 opacity-50 cursor-not-allowed'
                                                : 'bg-surface-800/50 border-surface-700/30 hover:border-surface-600 hover:bg-surface-800'
                                            }`}
                                    >
                                        <p className="text-sm font-medium text-surface-200 truncate">{product.name}</p>
                                        <p className="text-xs text-surface-500 font-mono">{product.sku}</p>
                                        <div className="flex items-center justify-between mt-2">
                                            <span className="text-sm font-bold text-primary-400">{formatCurrency(product.unit_price)}</span>
                                            <StatusBadge color={stockInfo.color}>{product.stock}</StatusBadge>
                                        </div>
                                        {inCart && (
                                            <div className="mt-1.5 text-xs text-primary-400 font-semibold">
                                                ✓ {inCart.quantity} en carrito
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Right: Cart & Checkout */}
                <div className="space-y-4">
                    <div className="glass-card p-4 sticky top-20">
                        <h3 className="text-sm font-bold text-surface-300 uppercase mb-3 flex items-center gap-2">
                            <ShoppingCart className="w-4 h-4 text-primary-400" />
                            Carrito ({cart.length})
                        </h3>

                        {cart.length === 0 ? (
                            <p className="text-sm text-surface-500 text-center py-8">Agrega productos al carrito</p>
                        ) : (
                            <div className="space-y-2 max-h-60 overflow-y-auto mb-4">
                                {cart.map(item => (
                                    <div key={item.product_id} className="flex items-center gap-2 p-2 rounded-lg bg-surface-800/50">
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-surface-200 truncate">{item.name}</p>
                                            <p className="text-xs text-surface-500">{formatCurrency(item.unit_price)} c/u</p>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={() => updateQuantity(item.product_id, -1)}
                                                className="w-7 h-7 rounded-lg bg-surface-700 hover:bg-surface-600 flex items-center justify-center transition-colors"
                                            >
                                                <Minus className="w-3 h-3" />
                                            </button>
                                            <span className="w-8 text-center text-sm font-semibold text-surface-200">{item.quantity}</span>
                                            <button
                                                onClick={() => updateQuantity(item.product_id, 1)}
                                                className="w-7 h-7 rounded-lg bg-surface-700 hover:bg-surface-600 flex items-center justify-center transition-colors"
                                            >
                                                <Plus className="w-3 h-3" />
                                            </button>
                                        </div>
                                        <div className="text-right w-20">
                                            <p className="text-sm font-semibold text-surface-200">{formatCurrency(item.unit_price * item.quantity)}</p>
                                        </div>
                                        <button onClick={() => removeFromCart(item.product_id)} className="text-red-400 hover:text-red-300 p-1">
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Totals */}
                        <div className="border-t border-surface-700 pt-3 space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-surface-400">Subtotal</span>
                                <span className="text-surface-200">{formatCurrency(subtotal)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-surface-400">IVA ({(TAX_RATE * 100).toFixed(0)}%)</span>
                                <span className="text-surface-200">{formatCurrency(taxAmount)}</span>
                            </div>
                            <div className="flex justify-between text-lg font-bold border-t border-surface-700 pt-2">
                                <span className="text-surface-200">Total</span>
                                <span className="text-primary-400">{formatCurrency(total)}</span>
                            </div>
                        </div>

                        {/* Payment Method */}
                        <div className="mt-4">
                            <label className="text-xs font-semibold text-surface-400 uppercase mb-2 block">
                                <CreditCard className="w-3.5 h-3.5 inline mr-1" /> Método de Pago
                            </label>
                            <div className="grid grid-cols-3 gap-2">
                                {PAYMENT_METHODS.map(pm => (
                                    <button
                                        key={pm.value}
                                        onClick={() => setPaymentMethod(pm.value)}
                                        className={`py-2 px-3 rounded-xl text-xs font-medium transition-all ${paymentMethod === pm.value
                                            ? 'bg-primary-500/20 border border-primary-500/40 text-primary-400'
                                            : 'bg-surface-800 border border-surface-700 text-surface-400 hover:border-surface-600'
                                            }`}
                                    >
                                        {pm.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Notes */}
                        <div className="mt-3">
                            <input
                                type="text"
                                placeholder="Notas (opcional)"
                                className="input-field text-sm py-2"
                                value={notes}
                                onChange={e => setNotes(e.target.value)}
                            />
                        </div>

                        {/* Submit */}
                        <button
                            onClick={handleSubmit}
                            disabled={submitting || cart.length === 0 || !selectedCustomer}
                            className="btn-primary w-full mt-4 py-3 text-base"
                        >
                            {submitting ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <ShoppingCart className="w-5 h-5" />
                                    Facturar — {formatCurrency(total)}
                                </>
                            )}
                        </button>
                        <p className="text-[10px] text-surface-600 text-center mt-2">Presiona F9 para facturar rápidamente</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
