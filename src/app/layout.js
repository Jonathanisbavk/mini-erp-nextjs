'use client';

import { useState } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import { cn } from '@/lib/utils';
import { Menu } from 'lucide-react';
import './globals.css';

export default function RootLayout({ children }) {
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <html lang="es">
            <head>
                <meta charSet="utf-8" />
                <title>Mini ERP — Sistema de Gestión Empresarial</title>
                <meta name="description" content="Sistema de gestión empresarial con CRM, inventario, facturación y reportes ejecutivos." />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/favicon.ico" />
            </head>
            <body className="min-h-screen">
                {/* Mobile overlay */}
                {mobileOpen && (
                    <div
                        className="fixed inset-0 bg-black/50 z-30 lg:hidden"
                        onClick={() => setMobileOpen(false)}
                    />
                )}

                {/* Mobile hamburger */}
                <button
                    onClick={() => setMobileOpen(true)}
                    className="fixed top-4 left-4 z-50 lg:hidden w-10 h-10 rounded-xl bg-surface-800 border border-surface-700 flex items-center justify-center text-surface-300 hover:bg-surface-700 transition-colors"
                    aria-label="Abrir menú"
                >
                    <Menu className="w-5 h-5" />
                </button>

                <Sidebar
                    collapsed={collapsed}
                    onToggle={() => setCollapsed(!collapsed)}
                    mobileOpen={mobileOpen}
                    onMobileClose={() => setMobileOpen(false)}
                />
                <main
                    className={cn(
                        'transition-all duration-300 min-h-screen',
                        'ml-0 lg:ml-[260px]',
                        collapsed && 'lg:ml-[72px]'
                    )}
                >
                    {children}
                </main>
            </body>
        </html>
    );
}
