// src/storage/storage.ts

import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppDataSchema } from '../types';
import { CURRENT_SCHEMA_VERSION, runMigrations } from './migrations';

const STORAGE_KEY = 'baby-growth-tracker:v1';

/**
 * Load data from AsyncStorage
 * - If missing, returns default structure
 * - If corrupted, returns special flag
 * - Runs migrations if schemaVersion < current
 */
export async function loadFromStorage(): Promise<
  | { ok: true; data: AppDataSchema }
  | { ok: false; error: 'corrupted' }
> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return {
        ok: true,
        data: {
          schemaVersion: CURRENT_SCHEMA_VERSION,
          babyProfile: null,
          measurements: [],
        },
      };
    }

    const parsed = JSON.parse(raw);

    const migrated = runMigrations(parsed);

    return { ok: true, data: migrated };
  } catch (err) {
    console.log('Storage load failed:', err);

    // JSON.parse failure → corrupted JSON
    return { ok: false, error: 'corrupted' };
  }
}

/**
 * Save the entire app data schema
 */
export async function saveToStorage(data: AppDataSchema): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.log('Storage save failed:', err);
  }
}

/**
 * Completely reset storage
 */
export async function clearStorage(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.log('Storage clear failed:', err);
  }
}
