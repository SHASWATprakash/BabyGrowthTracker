// src/store/AppContext.tsx

import React from 'react';
import { BabyProfile, GrowthMeasurement } from '../types';

export interface AppState {
  babyProfile: BabyProfile | null;
  measurements: GrowthMeasurement[];

  // Actions
  loadAppData: () => Promise<void>;
  setBabyProfile: (profile: BabyProfile) => void;
  addMeasurement: (m: GrowthMeasurement) => void;
  updateMeasurement: (m: GrowthMeasurement) => void;
  deleteMeasurement: (id: string) => void;
}

export const AppContext = React.createContext<AppState | undefined>(undefined);

export function useAppContext(): AppState {
  const ctx = React.useContext(AppContext);
  if (!ctx) {
    throw new Error('useAppContext must be used inside AppProvider');
  }
  return ctx;
}
