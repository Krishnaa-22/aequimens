import { storage } from './localStorage';

const CURRENT_SCHEMA_VERSION = 2;

/**
 * Lightweight local-data migrations. Existing user data is never cleared.
 * New optional collections simply begin empty until the user creates them.
 */
export function runLocalMigrations(): void {
  const current = storage.getSchemaVersion();
  if (current >= CURRENT_SCHEMA_VERSION) return;

  // Version 2 introduced profile, goals, journal, routines, and privacy-lock
  // collections. No destructive transformation is required because all new
  // fields are optional and have safe empty defaults.
  storage.setSchemaVersion(CURRENT_SCHEMA_VERSION);
}
