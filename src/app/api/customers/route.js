import { createServerClient } from '@/lib/supabase/server';

// GET /api/customers — list all customers
export async function GET(request) {
    const supabase = createServerClient();
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');

    let query = supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false });

    if (search) {
        query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,tax_id.ilike.%${search}%`);
    }

    const { data, error } = await query;

    if (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json(data);
}

// POST /api/customers — create a new customer
export async function POST(request) {
    const supabase = createServerClient();
    const body = await request.json();

    const { name, email, phone, address, tax_id, customer_type, credit_limit } = body;

    if (!name) {
        return Response.json({ error: 'El nombre es obligatorio' }, { status: 400 });
    }

    const { data, error } = await supabase
        .from('customers')
        .insert({
            name,
            email: email || null,
            phone: phone || null,
            address: address || null,
            tax_id: tax_id || null,
            customer_type: customer_type || 'retail',
            credit_limit: credit_limit || 0,
        })
        .select()
        .single();

    if (error) {
        if (error.code === '23505') {
            return Response.json({ error: 'Ya existe un cliente con ese email' }, { status: 409 });
        }
        return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json(data, { status: 201 });
}
