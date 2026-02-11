import { createServerClient } from '@/lib/supabase/server';

// GET /api/customers/[id] — get a single customer with purchase history
export async function GET(request, { params }) {
    const supabase = createServerClient();
    const { id } = params;

    // Fetch customer
    const { data: customer, error } = await supabase
        .from('customers')
        .select('*')
        .eq('id', id)
        .single();

    if (error || !customer) {
        return Response.json({ error: 'Cliente no encontrado' }, { status: 404 });
    }

    // Fetch purchase history
    const { data: invoices } = await supabase
        .from('invoices')
        .select(`
      id, invoice_number, invoice_date, total, status, payment_method,
      invoice_items ( id, quantity, unit_price, subtotal, products:product_id ( name, sku ) )
    `)
        .eq('customer_id', id)
        .order('invoice_date', { ascending: false });

    // Fetch transactions
    const { data: transactions } = await supabase
        .from('transactions')
        .select('*')
        .eq('customer_id', id)
        .order('created_at', { ascending: false });

    return Response.json({ ...customer, invoices: invoices || [], transactions: transactions || [] });
}

// PUT /api/customers/[id] — update a customer
export async function PUT(request, { params }) {
    const supabase = createServerClient();
    const { id } = params;
    const body = await request.json();

    const { data, error } = await supabase
        .from('customers')
        .update({
            name: body.name,
            email: body.email || null,
            phone: body.phone || null,
            address: body.address || null,
            tax_id: body.tax_id || null,
            customer_type: body.customer_type,
            credit_limit: body.credit_limit,
        })
        .eq('id', id)
        .select()
        .single();

    if (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json(data);
}

// DELETE /api/customers/[id] — delete a customer
export async function DELETE(request, { params }) {
    const supabase = createServerClient();
    const { id } = params;

    const { error } = await supabase.from('customers').delete().eq('id', id);

    if (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ success: true });
}
