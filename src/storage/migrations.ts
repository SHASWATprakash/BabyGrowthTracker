// src/storage/migrations.ts
import { AppDataSchema } from '../types';

export const CURRENT_SCHEMA_VERSION = 1;

/**
 * Run all migrations needed to upgrade stored data
 * to the latest schema version.
 */
export function runMigrations(data: any): AppDataSchema {
  let working = { ...data };

  const version = working.schemaVersion ?? 0;

  // If schemaVersion is missing, treat as v0
  if (version < 1) {
    working = migrateToV1(working);
  }

  return working as AppDataSchema;
}

/**
 * Migration to schema version 1
 * This ensures all required fields exist.
 */
function migrateToV1(prev: any): AppDataSchema {
  return {
    schemaVersion: 1,
    babyProfile: prev.babyProfile ?? null,
    measurements: prev.measurements ?? [],
  };
}
