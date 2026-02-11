import { createServerClient } from '@/lib/supabase/server';

// GET /api/products/[id]
export async function GET(request, { params }) {
    const supabase = createServerClient();
    const { id } = params;

    const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

    if (error || !data) {
        return Response.json({ error: 'Producto no encontrado' }, { status: 404 });
    }

    return Response.json(data);
}

// PUT /api/products/[id]
export async function PUT(request, { params }) {
    const supabase = createServerClient();
    const { id } = params;
    const body = await request.json();

    const { data, error } = await supabase
        .from('products')
        .update({
            sku: body.sku,
            name: body.name,
            description: body.description || null,
            category: body.category || null,
            unit_cost: body.unit_cost,
            unit_price: body.unit_price,
            stock: body.stock,
            reorder_point: body.reorder_point,
            status: body.status,
        })
        .eq('id', id)
        .select()
        .single();

    if (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json(data);
}

// DELETE /api/products/[id]
export async function DELETE(request, { params }) {
    const supabase = createServerClient();
    const { id } = params;

    const { error } = await supabase.from('products').delete().eq('id', id);

    if (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ success: true });
}
