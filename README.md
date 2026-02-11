# 🚀 Mini ERP — Sistema de Gestión Empresarial

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38B2AC?style=for-the-badge&logo=tailwind-css)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=for-the-badge&logo=supabase)
![Recharts](https://img.shields.io/badge/Recharts-Charts-22C55E?style=for-the-badge)

**Un sistema ERP completo para pequeñas empresas con CRM, inventario inteligente, punto de venta y reportes ejecutivos.**

</div>

---

## ✨ Características

### 📊 Dashboard Ejecutivo
- 4 KPIs en tiempo real (ingresos, órdenes, alertas, clientes)
- Gráfico de ingresos mensuales (últimos 12 meses)
- Top 5 productos más vendidos con margen de ganancia
- Últimas facturas y resumen financiero

### 👥 CRM Light (Gestión de Clientes)
- CRUD completo de clientes
- Cálculo automático del **Valor de Vida del Cliente (LTV)**
- Historial de compras detallado
- Control de saldo y límite de crédito

### 📦 Inventario Inteligente
- Control de stock en tiempo real
- **Alertas automáticas de reorden** cuando el stock baja del umbral
- Filtros por categoría y nivel de stock
- Cálculo de margen de ganancia por producto

### 🛒 Punto de Venta (POS)
- Interfaz de dos columnas optimizada para cajeros
- Búsqueda instantánea de productos por nombre o SKU
- Carrito con controles de cantidad (+/-)
- **Validación de stock en tiempo real** con prevención de sobreventa
- Validación de límite de crédito
- Atajo de teclado: **F9** para facturar

### 🔐 Lógica Atómica de Órdenes
- Transacción PostgreSQL atómica que:
  - ✅ Genera número de factura secuencial
  - ✅ Valida stock con **lock de fila** (`FOR UPDATE`)
  - ✅ Crea factura + items
  - ✅ Descuenta inventario
  - ✅ Registra transacción financiera
  - ✅ Actualiza saldo del cliente (crédito)
  - ✅ Recalcula LTV del cliente

---

## 🛠️ Stack Tecnológico

| Tecnología | Uso |
|---|---|
| **Next.js 14** | Framework React con App Router |
| **Tailwind CSS 3** | Estilos con diseño glassmorphism oscuro |
| **Supabase** | Backend-as-a-Service (PostgreSQL) |
| **Recharts** | Gráficos interactivos |
| **Lucide React** | Iconografía |

---

## 🚀 Instalación

### 1. Clonar el repositorio
```bash
git clone https://github.com/tu-usuario/Mini_ERP_Jonathan.git
cd Mini_ERP_Jonathan
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar Supabase
1. Crea un proyecto en [supabase.com](https://supabase.com)
2. Copia el archivo de ejemplo:
   ```bash
   cp .env.local.example .env.local
   ```
3. Agrega tus credenciales en `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
   ```

### 4. Ejecutar migraciones SQL
En el **SQL Editor** de Supabase, ejecuta en orden:
1. `supabase/migrations/001_initial_schema.sql` — Tablas y triggers
2. `supabase/migrations/002_create_order_function.sql` — Función atómica
3. `supabase/migrations/003_seed_data.sql` — Datos de ejemplo

### 5. Iniciar el servidor de desarrollo
```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000)

---

## 📁 Estructura del Proyecto

```
src/
├── app/                    # Next.js App Router
│   ├── page.js             # Dashboard
│   ├── layout.js           # Root layout + sidebar
│   ├── customers/          # CRM module
│   ├── inventory/          # Inventory module
│   ├── invoices/           # Invoicing + POS
│   └── api/                # API Route Handlers
├── components/
│   ├── layout/             # Sidebar, Header
│   └── ui/                 # Shared components
├── lib/
│   ├── supabase/           # DB clients
│   ├── utils.js            # Helpers
│   └── constants.js        # App constants
supabase/
└── migrations/             # SQL files
```

---

## 🎨 Diseño

- **Tema oscuro** premium con glassmorphism
- Paleta: Indigo primario, Slate para superficies
- Tipografía: Inter (Google Fonts)
- Micro-animaciones y transiciones suaves
- Diseño responsivo para desktop y tablet

---

## 📄 Licencia

MIT — Proyecto de portafolio por Jonathan.
