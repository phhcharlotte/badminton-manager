// src/store/courtStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Court } from '../types';
import { INITIAL_COURTS } from '../data/mockData';

interface CourtStore {
  courts: Court[];
  addCourt: (court: Omit<Court, 'id' | 'createdAt'>) => void;
  updateCourt: (id: string, updates: Partial<Court>) => void;
  deleteCourt: (id: string) => void;
  updatePrice: (id: string, price: number) => void;
  toggleCourtStatus: (id: string) => void;
}

export const useCourtStore = create<CourtStore>()(
  persist(
    (set, get) => ({
      courts: INITIAL_COURTS,

      addCourt: (courtData) => {
        const newCourt: Court = {
          ...courtData,
          id: `c${Date.now()}`,
          createdAt: new Date().toISOString().split('T')[0],
        };
        set((state) => ({ courts: [...state.courts, newCourt] }));
      },

      updateCourt: (id, updates) => {
        set((state) => ({
          courts: state.courts.map((c) => (c.id === id ? { ...c, ...updates } : c)),
        }));
      },

      deleteCourt: (id) => {
        set((state) => ({ courts: state.courts.filter((c) => c.id !== id) }));
      },

      updatePrice: (id, price) => {
        set((state) => ({
          courts: state.courts.map((c) => (c.id === id ? { ...c, pricePerHour: price } : c)),
        }));
      },

      toggleCourtStatus: (id) => {
        set((state) => ({
          courts: state.courts.map((c) =>
            c.id === id ? { ...c, isActive: !c.isActive } : c
          ),
        }));
      },
    }),
    { name: 'court-store' }
  )
);
