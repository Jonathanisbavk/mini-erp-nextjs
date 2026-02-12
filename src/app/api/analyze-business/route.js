import { GoogleGenerativeAI } from '@google/generative-ai';

const SYSTEM_PROMPT = `Eres un experto consultor de retail para pequeñas empresas en Latinoamérica.
Analiza los datos de ventas e inventario proporcionados y genera exactamente 3 consejos concretos y accionables (máximo 50 palabras cada uno) para mejorar la rentabilidad o rotación de inventario.

REGLAS ESTRICTAS:
- Responde ÚNICAMENTE con un JSON válido, sin markdown, sin backticks, sin explicación adicional
- Usa el formato exacto: { "consejo_ventas": "...", "consejo_inventario": "...", "alerta_critica": "..." }
- Cada consejo debe ser específico a los datos proporcionados, no genérico
- Menciona nombres de productos o cifras concretas cuando sea posible
- Escribe en español profesional`;

export async function POST(request) {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        return Response.json(
            { error: 'GEMINI_API_KEY no está configurada en el servidor. Agrégala en Vercel → Settings → Environment Variables.' },
            { status: 500 }
        );
    }

    try {
        const body = await request.json();
        const { topProducts, lowStockProducts, monthlySales, totalCustomers } = body;

        // Build the data summary for the prompt
        const dataSummary = `
DATOS DEL NEGOCIO:

VENTAS DEL MES:
- Ingresos totales: $${monthlySales || 0} MXN
- Total de clientes activos: ${totalCustomers || 0}

TOP 5 PRODUCTOS MAS VENDIDOS:
${topProducts?.map((p, i) => `${i + 1}. ${p.name} — ${p.totalSold} unidades vendidas, ingreso: $${p.totalRevenue}, margen: ${p.margin}%`).join('\n') || 'Sin datos'}

PRODUCTOS CON BAJO STOCK:
${lowStockProducts?.length > 0
                ? lowStockProducts.map(p => `- ${p.name} — Stock actual: ${p.stock}, Punto de reorden: ${p.reorder_point}`).join('\n')
                : 'Ninguno'}
`;

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

        const result = await model.generateContent({
            contents: [
                {
                    role: 'user',
                    parts: [{ text: SYSTEM_PROMPT + '\n\n' + dataSummary }],
                },
            ],
            generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 500,
            },
        });

        const responseText = result.response.text();

        // Parse the JSON response — try direct parse first, then extract
        let insights;
        try {
            insights = JSON.parse(responseText);
        } catch {
            // Try to extract JSON from markdown code blocks or raw text
            const jsonMatch = responseText.match(/\{[\s\S]*?\}/);
            if (jsonMatch) {
                insights = JSON.parse(jsonMatch[0]);
            } else {
                return Response.json(
                    { error: 'La IA no devolvió JSON válido. Intenta de nuevo.', raw: responseText.substring(0, 200) },
                    { status: 502 }
                );
            }
        }

        // Validate expected fields
        const requiredFields = ['consejo_ventas', 'consejo_inventario', 'alerta_critica'];
        for (const field of requiredFields) {
            if (!insights[field]) {
                insights[field] = 'No se pudo generar este consejo.';
            }
        }

        return Response.json({ insights, generatedAt: new Date().toISOString() });

    } catch (error) {
        console.error('AI Analysis error:', error);

        const msg = error.message || String(error);
        const isQuota = msg.includes('quota') || msg.includes('429') || msg.includes('RATE');
        const isAuth = msg.includes('API_KEY') || msg.includes('401') || msg.includes('403');

        return Response.json(
            {
                error: isQuota
                    ? 'Límite de la API alcanzado. Espera 1 minuto e intenta de nuevo.'
                    : isAuth
                        ? 'API Key inválida. Verifica GEMINI_API_KEY en Vercel → Settings → Environment Variables.'
                        : `Error de IA: ${msg.substring(0, 150)}`,
            },
            { status: isQuota ? 429 : isAuth ? 401 : 500 }
        );
    }
}
