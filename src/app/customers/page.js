'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import { Modal, DataTable, LoadingSpinner, EmptyState, StatusBadge } from '@/components/ui/SharedComponents';
import { formatCurrency, formatShortDate } from '@/lib/utils';
import { CUSTOMER_TYPES } from '@/lib/constants';
import { Users, Plus, Search, DollarSign, Eye } from 'lucide-react';

export default function CustomersPage() {
    const router = useRouter();
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState(null);

    const fetchCustomers = async () => {
        setLoading(true);
        const params = search ? `?search=${encodeURIComponent(search)}` : '';
        const res = await fetch(`/api/customers${params}`);
        const data = await res.json();
        setCustomers(Array.isArray(data) ? data : []);
        setLoading(false);
    };

    useEffect(() => { fetchCustomers(); }, [search]);

    const handleSave = async (formData) => {
        const url = editingCustomer ? `/api/customers/${editingCustomer.id}` : '/api/customers';
        const method = editingCustomer ? 'PUT' : 'POST';

        const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData),
        });

        if (res.ok) {
            setShowForm(false);
            setEditingCustomer(null);
            fetchCustomers();
        } else {
            const err = await res.json();
            alert(err.error || 'Error al guardar');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('¿Estás seguro de eliminar este cliente?')) return;
        await fetch(`/api/customers/${id}`, { method: 'DELETE' });
        fetchCustomers();
    };

    const columns = [
        {
            label: 'Cliente',
            render: (row) => (
                <div>
                    <p className="font-medium text-surface-200">{row.name}</p>
                    <p className="text-xs text-surface-500">{row.email || 'Sin email'}</p>
                </div>
            ),
        },
        {
            label: 'Tipo',
            render: (row) => (
                <StatusBadge color={row.customer_type === 'wholesale' ? 'blue' : 'green'}>
                    {row.customer_type === 'wholesale' ? 'Mayorista' : 'Minorista'}
                </StatusBadge>
            ),
        },
        { label: 'Teléfono', render: (row) => <span className="text-surface-400">{row.phone || '—'}</span> },
        {
            label: 'LTV',
            render: (row) => (
                <div className="flex items-center gap-1">
                    <DollarSign className="w-3 h-3 text-green-400" />
                    <span className="font-semibold text-green-400">{formatCurrency(row.ltv)}</span>
                </div>
            ),
        },
        {
            label: 'Saldo',
            render: (row) => (
                <span className={row.balance > 0 ? 'text-amber-400 font-semibold' : 'text-surface-500'}>
                    {formatCurrency(row.balance)}
                </span>
            ),
        },
        {
            label: 'Acciones',
            render: (row) => (
                <div className="flex items-center gap-1">
                    <button onClick={(e) => { e.stopPropagation(); router.push(`/customers/${row.id}`); }} className="btn-ghost text-xs p-1.5">
                        <Eye className="w-4 h-4" />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); setEditingCustomer(row); setShowForm(true); }} className="btn-ghost text-xs p-1.5">
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
            <Header title="Clientes" subtitle="Gestión de clientes y CRM" />

            <div className="p-6">
                {/* Actions bar */}
                <div className="flex items-center justify-between mb-6">
                    <div className="relative w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
                        <input
                            type="text"
                            placeholder="Buscar por nombre, email o RFC..."
                            className="input-field pl-10"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={() => { setEditingCustomer(null); setShowForm(true); }}
                        className="btn-primary"
                    >
                        <Plus className="w-4 h-4" /> Nuevo Cliente
                    </button>
                </div>

                {/* Table */}
                <div className="glass-card overflow-hidden">
                    {loading ? (
                        <LoadingSpinner />
                    ) : customers.length === 0 ? (
                        <EmptyState
                            icon={Users}
                            title="Sin clientes"
                            description="Agrega tu primer cliente para comenzar"
                            action={
                                <button onClick={() => setShowForm(true)} className="btn-primary text-sm">
                                    <Plus className="w-4 h-4" /> Agregar Cliente
                                </button>
                            }
                        />
                    ) : (
                        <DataTable columns={columns} data={customers} onRowClick={(row) => router.push(`/customers/${row.id}`)} />
                    )}
                </div>
            </div>

            {/* Customer Form Modal */}
            <Modal
                open={showForm}
                onClose={() => { setShowForm(false); setEditingCustomer(null); }}
                title={editingCustomer ? 'Editar Cliente' : 'Nuevo Cliente'}
                size="lg"
            >
                <CustomerForm
                    initial={editingCustomer}
                    onSave={handleSave}
                    onCancel={() => { setShowForm(false); setEditingCustomer(null); }}
                />
            </Modal>
        </div>
    );
}

function CustomerForm({ initial, onSave, onCancel }) {
    const [form, setForm] = useState({
        name: initial?.name || '',
        email: initial?.email || '',
        phone: initial?.phone || '',
        address: initial?.address || '',
        tax_id: initial?.tax_id || '',
        customer_type: initial?.customer_type || 'retail',
        credit_limit: initial?.credit_limit || 0,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(form);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-semibold text-surface-400 mb-1">Nombre *</label>
                    <input className="input-field" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
                </div>
                <div>
                    <label className="block text-xs font-semibold text-surface-400 mb-1">Email</label>
                    <input className="input-field" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                </div>
                <div>
                    <label className="block text-xs font-semibold text-surface-400 mb-1">Teléfono</label>
                    <input className="input-field" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
                </div>
                <div>
                    <label className="block text-xs font-semibold text-surface-400 mb-1">RFC / Tax ID</label>
                    <input className="input-field" value={form.tax_id} onChange={e => setForm({ ...form, tax_id: e.target.value })} />
                </div>
                <div className="col-span-2">
                    <label className="block text-xs font-semibold text-surface-400 mb-1">Dirección</label>
                    <input className="input-field" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} />
                </div>
                <div>
                    <label className="block text-xs font-semibold text-surface-400 mb-1">Tipo</label>
                    <select className="input-field" value={form.customer_type} onChange={e => setForm({ ...form, customer_type: e.target.value })}>
                        {CUSTOMER_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-semibold text-surface-400 mb-1">Límite de crédito</label>
                    <input className="input-field" type="number" step="0.01" value={form.credit_limit} onChange={e => setForm({ ...form, credit_limit: parseFloat(e.target.value) || 0 })} />
                </div>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-surface-700">
                <button type="button" onClick={onCancel} className="btn-secondary">Cancelar</button>
                <button type="submit" className="btn-primary">Guardar</button>
            </div>
        </form>
    );
}
