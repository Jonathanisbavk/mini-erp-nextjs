import { GoogleGenerativeAI } from '@google/generative-ai';

const SYSTEM_INSTRUCTION = `Eres un experto consultor de retail para pequeñas empresas en Latinoamérica.
Analiza los datos de ventas e inventario proporcionados y genera exactamente 3 consejos concretos y accionables (máximo 50 palabras cada uno) para mejorar la rentabilidad o rotación de inventario.

REGLAS ESTRICTAS:
- Responde ÚNICAMENTE con un JSON válido, sin markdown ni backticks
- Usa el formato exacto: { "consejo_ventas": "...", "consejo_inventario": "...", "alerta_critica": "..." }
- Cada consejo debe ser específico a los datos proporcionados, no genérico
- Menciona nombres de productos o cifras concretas cuando sea posible
- Escribe en español profesional`;

export async function POST(request) {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        return Response.json(
            { error: 'GEMINI_API_KEY no está configurada en el servidor' },
            { status: 500 }
        );
    }

    try {
        const body = await request.json();
        const { topProducts, lowStockProducts, monthlySales, totalCustomers } = body;

        // Validate input
        if (!topProducts && !lowStockProducts && !monthlySales) {
            return Response.json(
                { error: 'Se requieren datos de negocio para el análisis' },
                { status: 400 }
            );
        }

        // Build the data summary for the prompt
        const dataSummary = `
DATOS DEL NEGOCIO:

📊 VENTAS DEL MES:
- Ingresos totales: $${monthlySales?.toLocaleString('es-MX') || 0} MXN
- Total de clientes activos: ${totalCustomers || 0}

🏆 TOP 5 PRODUCTOS MÁS VENDIDOS:
${topProducts?.map((p, i) => `${i + 1}. ${p.name} (SKU: ${p.sku}) — ${p.totalSold} unidades vendidas, ingreso: $${p.totalRevenue?.toLocaleString('es-MX')}, margen: ${p.margin}%`).join('\n') || 'Sin datos'}

⚠️ PRODUCTOS CON BAJO STOCK:
${lowStockProducts?.length > 0
                ? lowStockProducts.map(p => `- ${p.name} (SKU: ${p.sku}) — Stock actual: ${p.stock}, Punto de reorden: ${p.reorder_point}`).join('\n')
                : 'Ningún producto con stock bajo'}
`;

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
            model: 'gemini-2.0-flash',
            systemInstruction: SYSTEM_INSTRUCTION,
            generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 500,
                responseMimeType: 'application/json',
            },
        });

        const result = await model.generateContent(dataSummary);
        const responseText = result.response.text();

        // Parse the JSON response
        let insights;
        try {
            insights = JSON.parse(responseText);
        } catch {
            // If JSON parsing fails, try to extract JSON from the response
            const jsonMatch = responseText.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                insights = JSON.parse(jsonMatch[0]);
            } else {
                throw new Error('La IA no devolvió un formato JSON válido');
            }
        }

        // Validate expected fields
        const requiredFields = ['consejo_ventas', 'consejo_inventario', 'alerta_critica'];
        for (const field of requiredFields) {
            if (!insights[field]) {
                insights[field] = 'No se pudo generar este consejo. Intenta de nuevo.';
            }
        }

        return Response.json({ insights, generatedAt: new Date().toISOString() });

    } catch (error) {
        console.error('AI Analysis error:', error);

        const isQuotaError = error.message?.includes('quota') || error.message?.includes('429');
        const isAuthError = error.message?.includes('API_KEY') || error.message?.includes('401');

        return Response.json(
            {
                error: isQuotaError
                    ? 'Se alcanzó el límite de uso de la API de IA. Intenta más tarde.'
                    : isAuthError
                        ? 'La API Key de Gemini no es válida. Verifica la configuración.'
                        : 'Error al generar el análisis. Intenta de nuevo.',
            },
            { status: isQuotaError ? 429 : isAuthError ? 401 : 500 }
        );
    }
}
