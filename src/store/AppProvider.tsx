// src/store/AppProvider.tsx

import React, { useCallback, useEffect, useState } from 'react';
import { AppContext } from './AppContext';
import { BabyProfile, GrowthMeasurement, AppDataSchema } from '../types';
import {
  loadFromStorage,
  saveToStorage,
} from '../storage/storage';
import { CURRENT_SCHEMA_VERSION } from '../storage/migrations';

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [babyProfile, setBabyProfile] = useState<BabyProfile | null>(null);
  const [measurements, setMeasurements] = useState<GrowthMeasurement[]>([]);
  const [storageCorrupted, setStorageCorrupted] = useState(false);

  /**
   * Load persisted data
   */
  const loadAppData = useCallback(async () => {
    const result = await loadFromStorage();

    if (!result.ok) {
      console.log('❌ Storage corrupted');
      setStorageCorrupted(true);
      return;
    }

    const { data } = result;

    setBabyProfile(data.babyProfile);
    setMeasurements(data.measurements);
  }, []);

  /**
   * Save entire schema atomically
   */
  const persist = useCallback(
    async (profile: BabyProfile | null, list: GrowthMeasurement[]) => {
      const schema: AppDataSchema = {
        schemaVersion: CURRENT_SCHEMA_VERSION,
        babyProfile: profile,
        measurements: list,
      };

      await saveToStorage(schema);
    },
    [],
  );

  /**
   * Add measurement
   */
  const addMeasurement = useCallback(
    (m: GrowthMeasurement) => {
      setMeasurements(prev => {
        const updated = [...prev, m];
        persist(babyProfile, updated);
        return updated;
      });
    },
    [babyProfile, persist],
  );

  /**
   * Update measurement
   */
  const updateMeasurement = useCallback(
    (m: GrowthMeasurement) => {
      setMeasurements(prev => {
        const updated = prev.map(item => (item.id === m.id ? m : item));
        persist(babyProfile, updated);
        return updated;
      });
    },
    [babyProfile, persist],
  );

  /**
   * Delete measurement
   */
  const deleteMeasurement = useCallback(
    (id: string) => {
      setMeasurements(prev => {
        const updated = prev.filter(item => item.id !== id);
        persist(babyProfile, updated);
        return updated;
      });
    },
    [babyProfile, persist],
  );

  /**
   * Update baby profile
   */
  const updateProfile = useCallback(
    (profile: BabyProfile) => {
      setBabyProfile(profile);
      persist(profile, measurements);
    },
    [measurements, persist],
  );

  /**
   * Load once on mount
   */
  useEffect(() => {
    loadAppData();
  }, [loadAppData]);

  return (
    <AppContext.Provider
      value={{
        babyProfile,
        measurements,

        loadAppData,
        setBabyProfile: updateProfile,
        addMeasurement,
        updateMeasurement,
        deleteMeasurement,

        // Optional flag for UI:
  
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
