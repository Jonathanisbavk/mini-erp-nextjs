'use client';

import { Search, Bell } from 'lucide-react';

export default function Header({ title, subtitle }) {
    return (
        <header className="h-16 flex items-center justify-between px-6 border-b border-surface-700/50 bg-surface-900/50 backdrop-blur-sm sticky top-0 z-30">
            <div>
                <h2 className="text-lg font-bold text-surface-100">{title}</h2>
                {subtitle && <p className="text-xs text-surface-500">{subtitle}</p>}
            </div>
            <div className="flex items-center gap-3">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
                    <input
                        type="text"
                        placeholder="Buscar..."
                        className="bg-surface-800/80 border border-surface-700 rounded-xl pl-9 pr-4 py-2
                       text-sm text-surface-200 placeholder-surface-500
                       focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500/50
                       w-64 transition-all duration-200"
                    />
                </div>
                <button className="relative p-2 rounded-xl text-surface-400 hover:text-surface-200 hover:bg-surface-800 transition-colors">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse-soft" />
                </button>
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-xs font-bold text-white shadow-lg shadow-primary-500/20">
                    J
                </div>
            </div>
        </header>
    );
}
