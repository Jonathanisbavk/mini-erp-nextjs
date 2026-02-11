import { createServerClient } from '@/lib/supabase/server';

// GET /api/invoices/[id] — get invoice detail with items
export async function GET(request, { params }) {
    const supabase = createServerClient();
    const { id } = params;

    const { data, error } = await supabase
        .from('invoices')
        .select(`
      *,
      customers:customer_id ( id, name, email, phone, address, tax_id ),
      invoice_items ( id, quantity, unit_price, subtotal, products:product_id ( id, name, sku ) )
    `)
        .eq('id', id)
        .single();

    if (error || !data) {
        return Response.json({ error: 'Factura no encontrada' }, { status: 404 });
    }

    return Response.json(data);
}

// PATCH /api/invoices/[id] — update invoice status (e.g., cancel)
export async function PATCH(request, { params }) {
    const supabase = createServerClient();
    const { id } = params;
    const body = await request.json();

    if (body.status === 'cancelled') {
        // TODO: implement stock restoration on cancellation
    }

    const { data, error } = await supabase
        .from('invoices')
        .update({ status: body.status })
        .eq('id', id)
        .select()
        .single();

    if (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json(data);
}
