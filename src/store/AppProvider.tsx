// src/store/AppProvider.tsx

import React, { useCallback, useEffect, useState } from 'react';
import { AppContext } from './AppContext';
import { BabyProfile, GrowthMeasurement, AppDataSchema } from '../types';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'baby-growth-tracker:v1';

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [babyProfile, setBabyProfile] = useState<BabyProfile | null>(null);
  const [measurements, setMeasurements] = useState<GrowthMeasurement[]>([]);

  /**
   * Load data from storage
   */
  const loadAppData = useCallback(async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);

      if (!raw) return;

      const parsed: AppDataSchema = JSON.parse(raw);

      setBabyProfile(parsed.babyProfile);
      setMeasurements(parsed.measurements);
    } catch (err) {
      console.log('Error loading data:', err);
    }
  }, []);

  /**
   * Save to storage
   */
  const saveData = useCallback(
    async (profile: BabyProfile | null, list: GrowthMeasurement[]) => {
      const data: AppDataSchema = {
        schemaVersion: 1,
        babyProfile: profile,
        measurements: list,
      };
      try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      } catch (err) {
        console.log('Error saving data:', err);
      }
    },
    [],
  );

  /**
   * Add measurement
   */
  const addMeasurement = (m: GrowthMeasurement) => {
    setMeasurements(prev => {
      const updated = [...prev, m];
      saveData(babyProfile, updated);
      return updated;
    });
  };

  /**
   * Update measurement
   */
  const updateMeasurement = (m: GrowthMeasurement) => {
    setMeasurements(prev => {
      const updated = prev.map(item => (item.id === m.id ? m : item));
      saveData(babyProfile, updated);
      return updated;
    });
  };

  /**
   * Delete measurement
   */
  const deleteMeasurement = (id: string) => {
    setMeasurements(prev => {
      const updated = prev.filter(item => item.id !== id);
      saveData(babyProfile, updated);
      return updated;
    });
  };

  /**
   * Save profile change
   */
  const updateProfile = (profile: BabyProfile) => {
    setBabyProfile(profile);
    saveData(profile, measurements);
  };

  /**
   * Load on mount
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
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
