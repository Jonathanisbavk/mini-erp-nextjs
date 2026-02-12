'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Users,
    Package,
    FileText,
    ShoppingCart,
    ChevronLeft,
    ChevronRight,
    Zap,
    X,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
    { href: '/', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/customers', label: 'Clientes', icon: Users },
    { href: '/inventory', label: 'Inventario', icon: Package },
    { href: '/invoices', label: 'Facturas', icon: FileText },
    { href: '/invoices/new', label: 'Nueva Venta', icon: ShoppingCart, highlight: true },
];

export default function Sidebar({ collapsed, onToggle, mobileOpen, onMobileClose }) {
    const pathname = usePathname();

    return (
        <aside
            className={cn(
                'fixed left-0 top-0 h-screen z-40 flex flex-col',
                'bg-surface-900/95 backdrop-blur-xl border-r border-surface-700/50',
                'transition-all duration-300 ease-in-out',
                // Desktop behavior
                'hidden lg:flex',
                collapsed ? 'lg:w-[72px]' : 'lg:w-[260px]',
                // Mobile behavior
                mobileOpen && '!flex w-[280px]'
            )}
        >
            {/* Logo */}
            <div className="flex items-center justify-between px-5 h-16 border-b border-surface-700/50">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-lg shadow-primary-500/20 flex-shrink-0">
                        <Zap className="w-5 h-5 text-white" />
                    </div>
                    {(!collapsed || mobileOpen) && (
                        <div className="animate-fade-in">
                            <h1 className="text-base font-bold text-surface-100 tracking-tight">Mini ERP</h1>
                            <p className="text-[10px] text-surface-500 uppercase tracking-widest">Jonathan</p>
                        </div>
                    )}
                </div>
                {/* Mobile close button */}
                {mobileOpen && (
                    <button
                        onClick={onMobileClose}
                        className="lg:hidden p-1.5 rounded-lg text-surface-400 hover:text-surface-200 hover:bg-surface-800 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
                {NAV_ITEMS.map(({ href, label, icon: Icon, highlight }) => {
                    const isActive = pathname === href || (href !== '/' && pathname.startsWith(href));
                    return (
                        <Link
                            key={href}
                            href={href}
                            onClick={onMobileClose}
                            className={cn(
                                'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative',
                                isActive
                                    ? 'bg-primary-500/15 text-primary-400'
                                    : highlight
                                        ? 'text-primary-400 hover:bg-primary-500/10'
                                        : 'text-surface-400 hover:bg-surface-800 hover:text-surface-200'
                            )}
                            title={collapsed && !mobileOpen ? label : undefined}
                        >
                            {isActive && (
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-primary-500 rounded-r-full" />
                            )}
                            <Icon className={cn('w-5 h-5 flex-shrink-0', isActive && 'text-primary-400')} />
                            {(!collapsed || mobileOpen) && (
                                <span className={cn('text-sm font-medium animate-fade-in', highlight && !isActive && 'text-primary-400')}>
                                    {label}
                                </span>
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* Collapse toggle — desktop only */}
            <div className="px-3 pb-4 hidden lg:block">
                <button
                    onClick={onToggle}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl
                     text-surface-500 hover:text-surface-300 hover:bg-surface-800
                     transition-all duration-200"
                >
                    {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                    {!collapsed && <span className="text-xs font-medium">Contraer</span>}
                </button>
            </div>
        </aside>
    );
}
