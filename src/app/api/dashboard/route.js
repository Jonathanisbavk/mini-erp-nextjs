import { createServerClient } from '@/lib/supabase/server';

// GET /api/dashboard — aggregate KPIs for the dashboard
export async function GET() {
    const supabase = createServerClient();

    // Current month boundaries
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();

    // 1. Monthly revenue
    const { data: monthlyInvoices } = await supabase
        .from('invoices')
        .select('total')
        .gte('invoice_date', startOfMonth)
        .neq('status', 'cancelled');

    const monthlyRevenue = (monthlyInvoices || []).reduce((sum, inv) => sum + Number(inv.total), 0);

    // 2. Today's orders count
    const { count: todayOrders } = await supabase
        .from('invoices')
        .select('*', { count: 'exact', head: true })
        .gte('invoice_date', startOfDay)
        .neq('status', 'cancelled');

    // 3. Low stock products count
    const { data: allProducts } = await supabase
        .from('products')
        .select('stock, reorder_point')
        .eq('status', 'active');

    const lowStockCount = (allProducts || []).filter(p => p.stock <= p.reorder_point).length;

    // 4. New customers this month
    const { count: newCustomers } = await supabase
        .from('customers')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startOfMonth);

    // 5. Revenue last 12 months (for chart)
    const monthlyData = [];
    for (let i = 11; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const nextD = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);

        const { data: monthInv } = await supabase
            .from('invoices')
            .select('total')
            .gte('invoice_date', d.toISOString())
            .lt('invoice_date', nextD.toISOString())
            .neq('status', 'cancelled');

        const revenue = (monthInv || []).reduce((sum, inv) => sum + Number(inv.total), 0);
        const monthLabel = d.toLocaleDateString('es-MX', { month: 'short', year: '2-digit' });
        monthlyData.push({ month: monthLabel, revenue });
    }

    // 6. Top 5 selling products
    const { data: invoiceItems } = await supabase
        .from('invoice_items')
        .select('quantity, subtotal, products:product_id ( name, sku, unit_cost )');

    const productMap = {};
    (invoiceItems || []).forEach(item => {
        const key = item.products?.sku || 'unknown';
        if (!productMap[key]) {
            productMap[key] = {
                name: item.products?.name || 'Desconocido',
                sku: key,
                totalSold: 0,
                totalRevenue: 0,
                totalCost: 0,
            };
        }
        productMap[key].totalSold += item.quantity;
        productMap[key].totalRevenue += Number(item.subtotal);
        productMap[key].totalCost += (item.products?.unit_cost || 0) * item.quantity;
    });

    const topProducts = Object.values(productMap)
        .sort((a, b) => b.totalRevenue - a.totalRevenue)
        .slice(0, 5)
        .map(p => ({
            ...p,
            margin: p.totalRevenue > 0
                ? (((p.totalRevenue - p.totalCost) / p.totalRevenue) * 100).toFixed(1)
                : 0,
        }));

    // 7. Recent invoices
    const { data: recentInvoices } = await supabase
        .from('invoices')
        .select(`
      id, invoice_number, total, status, payment_method, invoice_date,
      customers:customer_id ( name )
    `)
        .order('created_at', { ascending: false })
        .limit(5);

    // 8. Total pending balance
    const { data: pendingInvoices } = await supabase
        .from('invoices')
        .select('total')
        .eq('status', 'pending');

    const pendingBalance = (pendingInvoices || []).reduce((sum, inv) => sum + Number(inv.total), 0);

    return Response.json({
        kpis: {
            monthlyRevenue,
            todayOrders: todayOrders || 0,
            lowStockCount,
            newCustomers: newCustomers || 0,
            pendingBalance,
        },
        monthlyData,
        topProducts,
        recentInvoices: recentInvoices || [],
    });
}
