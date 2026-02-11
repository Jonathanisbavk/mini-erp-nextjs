'use client';

import { useState } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import { cn } from '@/lib/utils';
import './globals.css';

export default function RootLayout({ children }) {
    const [collapsed, setCollapsed] = useState(false);

    return (
        <html lang="es">
            <head>
                <title>Mini ERP — Sistema de Gestión Empresarial</title>
                <meta name="description" content="Sistema de gestión empresarial con CRM, inventario, facturación y reportes ejecutivos." />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/favicon.ico" />
            </head>
            <body className="min-h-screen">
                <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
                <main
                    className={cn(
                        'transition-all duration-300 min-h-screen',
                        collapsed ? 'ml-[72px]' : 'ml-[260px]'
                    )}
                >
                    {children}
                </main>
            </body>
        </html>
    );
}
