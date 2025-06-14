import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AppState } from './types';

// Ensure we import React to fix the useSyncExternalStore issue
import * as React from 'react';

/**
 * Creates a persisted Zustand store with the given implementation function
 */
export function createPersistedStore<T extends AppState>(
  storeImplementation: (set: any, get: any, store: any) => T
) {
  return create<T>()(
    persist(
      storeImplementation,
      {
        name: 'invex-store', // Name for the persisted storage
        partialize: (state) => {
          // Only persist user-independent preferences, not user data
          // User data should come from Supabase, not localStorage
          const { 
            currentUser, 
            pendingSalePayment, 
            products, 
            sales, 
            clients, 
            payments,
            meetings,
            ...rest 
          } = state;
          return {
            // Keep only UI preferences and non-user-specific data
            ...rest,
            // Reset user data to empty arrays for new sessions
            products: [],
            sales: [],
            clients: [],
            payments: [],
            meetings: []
          };
        },
      }
    )
  );
}
