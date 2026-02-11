import { createServerClient } from '@/lib/supabase/server';

// GET /api/products — list all products
export async function GET(request) {
    const supabase = createServerClient();
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const category = searchParams.get('category');
    const lowStock = searchParams.get('lowStock');

    let query = supabase
        .from('products')
        .select('*')
        .order('name', { ascending: true });

    if (search) {
        query = query.or(`name.ilike.%${search}%,sku.ilike.%${search}%`);
    }
    if (category) {
        query = query.eq('category', category);
    }
    if (lowStock === 'true') {
        // Products where stock <= reorder_point
        query = query.filter('stock', 'lte', 'reorder_point');
    }

    const { data, error } = await query;

    if (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }

    // Filter low stock in JS since Supabase doesn't support column-to-column comparison easily
    let result = data;
    if (lowStock === 'true' && data) {
        result = data.filter(p => p.stock <= p.reorder_point);
    }

    return Response.json(result);
}

// POST /api/products — create a new product
export async function POST(request) {
    const supabase = createServerClient();
    const body = await request.json();

    const { sku, name, description, category, unit_cost, unit_price, stock, reorder_point } = body;

    if (!sku || !name) {
        return Response.json({ error: 'SKU y nombre son obligatorios' }, { status: 400 });
    }

    const { data, error } = await supabase
        .from('products')
        .insert({
            sku,
            name,
            description: description || null,
            category: category || null,
            unit_cost: unit_cost || 0,
            unit_price: unit_price || 0,
            stock: stock || 0,
            reorder_point: reorder_point || 10,
        })
        .select()
        .single();

    if (error) {
        if (error.code === '23505') {
            return Response.json({ error: 'Ya existe un producto con ese SKU' }, { status: 409 });
        }
        return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json(data, { status: 201 });
}
