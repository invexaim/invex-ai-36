
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
          // Only persist the data, not the user info
          // This ensures data is available locally but we rely on Supabase for the authoritative source
          const { currentUser, pendingSalePayment, ...rest } = state;
          return rest;
        },
      }
    )
  );
}
