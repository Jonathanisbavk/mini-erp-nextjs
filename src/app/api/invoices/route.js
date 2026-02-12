import { createServerClient } from '@/lib/supabase/server';

// GET /api/invoices — list invoices
export async function GET(request) {
    const supabase = createServerClient();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const customerId = searchParams.get('customer_id');

    let query = supabase
        .from('invoices')
        .select(`
      *,
      customers:customer_id ( id, name, email )
    `)
        .order('created_at', { ascending: false })
        .limit(100);

    if (status) {
        query = query.eq('status', status);
    }
    if (customerId) {
        query = query.eq('customer_id', customerId);
    }

    const { data, error } = await query;

    if (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json(data);
}

// POST /api/invoices — create an order (calls the atomic DB function)
export async function POST(request) {
    const supabase = createServerClient();
    const body = await request.json();

    const { customer_id, payment_method, tax_rate, notes, items } = body;

    // Validation
    if (!customer_id) {
        return Response.json({ error: 'Debe seleccionar un cliente' }, { status: 400 });
    }
    if (!items || !items.length) {
        return Response.json({ error: 'Debe agregar al menos un producto' }, { status: 400 });
    }

    for (const item of items) {
        if (!item.product_id || !item.quantity || item.quantity < 1) {
            return Response.json({ error: 'Cada item debe tener product_id y quantity > 0' }, { status: 400 });
        }
    }

    // Call the atomic database function
    const { data, error } = await supabase.rpc('create_order', {
        p_customer_id: customer_id,
        p_payment_method: payment_method || 'cash',
        p_tax_rate: tax_rate ?? 0.16,
        p_notes: notes || '',
        p_items: items,
    });

    if (error) {
        // Determine appropriate HTTP status from error message
        const isStockError = error.message.includes('Stock insuficiente');
        const isNotFound = error.message.includes('no encontrado');
        const httpStatus = isStockError ? 409 : isNotFound ? 404 : 500;

        return Response.json({ error: error.message }, { status: httpStatus });
    }

    // Fetch the created invoice to get invoice_number for the client
    const { data: invoice } = await supabase
        .from('invoices')
        .select('invoice_number')
        .eq('id', data)
        .single();

    return Response.json({
        invoice_id: data,
        invoice_number: invoice?.invoice_number || null,
    }, { status: 201 });
}
