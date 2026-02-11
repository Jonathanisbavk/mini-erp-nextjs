'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import { Modal, DataTable, LoadingSpinner, EmptyState, StatusBadge } from '@/components/ui/SharedComponents';
import { formatCurrency, getStockStatus, calcMargin } from '@/lib/utils';
import { PRODUCT_CATEGORIES } from '@/lib/constants';
import { Package, Plus, Search, AlertTriangle, Filter } from 'lucide-react';

export default function InventoryPage() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [showLowStock, setShowLowStock] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);

    const fetchProducts = async () => {
        setLoading(true);
        const params = new URLSearchParams();
        if (search) params.set('search', search);
        if (categoryFilter) params.set('category', categoryFilter);
        const qs = params.toString();
        const res = await fetch(`/api/products${qs ? '?' + qs : ''}`);
        let data = await res.json();
        if (showLowStock && Array.isArray(data)) {
            data = data.filter(p => p.stock <= p.reorder_point);
        }
        setProducts(Array.isArray(data) ? data : []);
        setLoading(false);
    };

    useEffect(() => { fetchProducts(); }, [search, categoryFilter, showLowStock]);

    const handleSave = async (formData) => {
        const url = editingProduct ? `/api/products/${editingProduct.id}` : '/api/products';
        const method = editingProduct ? 'PUT' : 'POST';

        const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData),
        });

        if (res.ok) {
            setShowForm(false);
            setEditingProduct(null);
            fetchProducts();
        } else {
            const err = await res.json();
            alert(err.error || 'Error al guardar');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('¿Estás seguro de eliminar este producto?')) return;
        await fetch(`/api/products/${id}`, { method: 'DELETE' });
        fetchProducts();
    };

    const lowStockCount = products.filter(p => p.stock <= p.reorder_point).length;

    const columns = [
        {
            label: 'Producto',
            render: (row) => (
                <div>
                    <p className="font-medium text-surface-200">{row.name}</p>
                    <p className="text-xs text-surface-500 font-mono">{row.sku}</p>
                </div>
            ),
        },
        { label: 'Categoría', render: (row) => <span className="text-surface-400 text-sm">{row.category || '—'}</span> },
        {
            label: 'Stock',
            render: (row) => {
                const status = getStockStatus(row.stock, row.reorder_point);
                return (
                    <div className="flex items-center gap-2">
                        <span className="font-semibold text-surface-200">{row.stock}</span>
                        <StatusBadge color={status.color}>{status.label}</StatusBadge>
                    </div>
                );
            },
        },
        {
            label: 'Costo',
            render: (row) => <span className="text-surface-400">{formatCurrency(row.unit_cost)}</span>,
        },
        {
            label: 'Precio',
            render: (row) => <span className="text-surface-200 font-semibold">{formatCurrency(row.unit_price)}</span>,
        },
        {
            label: 'Margen',
            render: (row) => {
                const margin = calcMargin(row.unit_cost, row.unit_price);
                return (
                    <span className={margin >= 30 ? 'text-green-400' : margin >= 15 ? 'text-amber-400' : 'text-red-400'}>
                        {margin.toFixed(1)}%
                    </span>
                );
            },
        },
        {
            label: 'Acciones',
            render: (row) => (
                <div className="flex items-center gap-1">
                    <button onClick={(e) => { e.stopPropagation(); setEditingProduct(row); setShowForm(true); }} className="btn-ghost text-xs p-1.5">
                        Editar
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); handleDelete(row.id); }} className="btn-ghost text-red-400 text-xs p-1.5">
                        Eliminar
                    </button>
                </div>
            ),
        },
    ];

    return (
        <div>
            <Header title="Inventario" subtitle="Control de stock y productos" />

            <div className="p-6">
                {/* Alert banner for low stock */}
                {lowStockCount > 0 && !showLowStock && (
                    <div className="mb-4 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between animate-slide-up">
                        <div className="flex items-center gap-3">
                            <AlertTriangle className="w-5 h-5 text-amber-400" />
                            <p className="text-sm text-amber-200">
                                <span className="font-bold">{lowStockCount} producto(s)</span> están por debajo del punto de reorden
                            </p>
                        </div>
                        <button onClick={() => setShowLowStock(true)} className="text-xs font-semibold text-amber-400 hover:text-amber-300 transition-colors">
                            Ver productos →
                        </button>
                    </div>
                )}

                {/* Actions bar */}
                <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
                    <div className="flex items-center gap-3 flex-1">
                        <div className="relative w-72">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
                            <input
                                type="text"
                                placeholder="Buscar por nombre o SKU..."
                                className="input-field pl-10"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
                        </div>
                        <select
                            className="input-field w-48"
                            value={categoryFilter}
                            onChange={e => setCategoryFilter(e.target.value)}
                        >
                            <option value="">Todas las categorías</option>
                            {PRODUCT_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                        <button
                            onClick={() => setShowLowStock(!showLowStock)}
                            className={showLowStock ? 'btn-danger text-xs' : 'btn-secondary text-xs'}
                        >
                            <AlertTriangle className="w-3.5 h-3.5" />
                            {showLowStock ? 'Mostrar todos' : 'Solo bajo stock'}
                        </button>
                    </div>
                    <button onClick={() => { setEditingProduct(null); setShowForm(true); }} className="btn-primary">
                        <Plus className="w-4 h-4" /> Nuevo Producto
                    </button>
                </div>

                {/* Table */}
                <div className="glass-card overflow-hidden">
                    {loading ? (
                        <LoadingSpinner />
                    ) : products.length === 0 ? (
                        <EmptyState
                            icon={Package}
                            title={showLowStock ? 'Sin alertas de stock' : 'Sin productos'}
                            description={showLowStock ? 'Todos los productos tienen stock suficiente' : 'Agrega tu primer producto para comenzar'}
                            action={
                                !showLowStock && (
                                    <button onClick={() => setShowForm(true)} className="btn-primary text-sm">
                                        <Plus className="w-4 h-4" /> Agregar Producto
                                    </button>
                                )
                            }
                        />
                    ) : (
                        <DataTable columns={columns} data={products} />
                    )}
                </div>
            </div>

            {/* Product Form Modal */}
            <Modal
                open={showForm}
                onClose={() => { setShowForm(false); setEditingProduct(null); }}
                title={editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
                size="lg"
            >
                <ProductForm
                    initial={editingProduct}
                    onSave={handleSave}
                    onCancel={() => { setShowForm(false); setEditingProduct(null); }}
                />
            </Modal>
        </div>
    );
}

function ProductForm({ initial, onSave, onCancel }) {
    const [form, setForm] = useState({
        sku: initial?.sku || '',
        name: initial?.name || '',
        description: initial?.description || '',
        category: initial?.category || '',
        unit_cost: initial?.unit_cost || 0,
        unit_price: initial?.unit_price || 0,
        stock: initial?.stock || 0,
        reorder_point: initial?.reorder_point || 10,
        status: initial?.status || 'active',
    });

    const margin = calcMargin(form.unit_cost, form.unit_price);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(form);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-semibold text-surface-400 mb-1">SKU *</label>
                    <input className="input-field font-mono" value={form.sku} onChange={e => setForm({ ...form, sku: e.target.value })} required />
                </div>
                <div>
                    <label className="block text-xs font-semibold text-surface-400 mb-1">Nombre *</label>
                    <input className="input-field" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
                </div>
                <div className="col-span-2">
                    <label className="block text-xs font-semibold text-surface-400 mb-1">Descripción</label>
                    <input className="input-field" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
                </div>
                <div>
                    <label className="block text-xs font-semibold text-surface-400 mb-1">Categoría</label>
                    <select className="input-field" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                        <option value="">Sin categoría</option>
                        {PRODUCT_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-semibold text-surface-400 mb-1">Estado</label>
                    <select className="input-field" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                        <option value="active">Activo</option>
                        <option value="discontinued">Descontinuado</option>
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-semibold text-surface-400 mb-1">Costo unitario</label>
                    <input className="input-field" type="number" step="0.01" value={form.unit_cost} onChange={e => setForm({ ...form, unit_cost: parseFloat(e.target.value) || 0 })} />
                </div>
                <div>
                    <label className="block text-xs font-semibold text-surface-400 mb-1">Precio de venta</label>
                    <input className="input-field" type="number" step="0.01" value={form.unit_price} onChange={e => setForm({ ...form, unit_price: parseFloat(e.target.value) || 0 })} />
                </div>
                <div>
                    <label className="block text-xs font-semibold text-surface-400 mb-1">Stock actual</label>
                    <input className="input-field" type="number" value={form.stock} onChange={e => setForm({ ...form, stock: parseInt(e.target.value) || 0 })} />
                </div>
                <div>
                    <label className="block text-xs font-semibold text-surface-400 mb-1">Punto de reorden</label>
                    <input className="input-field" type="number" value={form.reorder_point} onChange={e => setForm({ ...form, reorder_point: parseInt(e.target.value) || 0 })} />
                </div>
            </div>

            {/* Margin indicator */}
            <div className="p-3 rounded-xl bg-surface-900/50 flex items-center justify-between">
                <span className="text-xs text-surface-400">Margen de ganancia estimado:</span>
                <span className={`text-sm font-bold ${margin >= 30 ? 'text-green-400' : margin >= 15 ? 'text-amber-400' : 'text-red-400'}`}>
                    {margin.toFixed(1)}%
                </span>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-surface-700">
                <button type="button" onClick={onCancel} className="btn-secondary">Cancelar</button>
                <button type="submit" className="btn-primary">Guardar</button>
            </div>
        </form>
    );
}
