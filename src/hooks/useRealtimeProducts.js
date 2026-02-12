'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { supabase } from '@/lib/supabase/client';

/**
 * useRealtimeProducts — Supabase Realtime subscription for the `products` table.
 *
 * Listens for UPDATE events and patches individual products in-place
 * instead of re-fetching the entire list (efficient).
 *
 * Returns:
 * - applyRealtime(products, setProducts) — call once after initial fetch
 * - changedIds — Set of product IDs that just changed (for flash animation)
 * - clearChanged(id) — remove an ID from the changed set after animation ends
 *
 * Usage:
 *   const { subscribe, changedIds, clearChanged } = useRealtimeProducts(products, setProducts);
 *   useEffect(() => { subscribe(); }, [subscribe]);
 */
export function useRealtimeProducts(products, setProducts) {
    const channelRef = useRef(null);
    const [changedIds, setChangedIds] = useState(new Set());

    const subscribe = useCallback(() => {
        // Avoid duplicate subscriptions
        if (channelRef.current) return;

        const channel = supabase
            .channel('realtime-products')
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'products',
                },
                (payload) => {
                    const updated = payload.new;

                    // Patch only the affected product in state
                    setProducts((prev) =>
                        prev.map((p) => (p.id === updated.id ? { ...p, ...updated } : p))
                    );

                    // Track changed ID for flash animation
                    setChangedIds((prev) => new Set(prev).add(updated.id));
                }
            )
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'products',
                },
                (payload) => {
                    setProducts((prev) => [payload.new, ...prev]);
                    setChangedIds((prev) => new Set(prev).add(payload.new.id));
                }
            )
            .on(
                'postgres_changes',
                {
                    event: 'DELETE',
                    schema: 'public',
                    table: 'products',
                },
                (payload) => {
                    setProducts((prev) => prev.filter((p) => p.id !== payload.old.id));
                }
            )
            .subscribe();

        channelRef.current = channel;
    }, [setProducts]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (channelRef.current) {
                supabase.removeChannel(channelRef.current);
                channelRef.current = null;
            }
        };
    }, []);

    // Clear a single changed ID (call after animation ends)
    const clearChanged = useCallback((id) => {
        setChangedIds((prev) => {
            const next = new Set(prev);
            next.delete(id);
            return next;
        });
    }, []);

    return { subscribe, changedIds, clearChanged };
}
