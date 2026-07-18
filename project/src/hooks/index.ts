import { useEffect, useState, useCallback } from 'react';
import {
  AEQUIMENS_STORAGE_EVENT,
  storage,
} from '../data/localStorage';
import type { CheckInResult, MissionSet, Preferences, DaySummary, Achievement } from '../types';
import { DEFAULT_PREFERENCES, buildMockHistory } from '../data/mockData';
import { DEMO_MODE_ENABLED } from '../config';
import { computeNextStreak, shouldCountTowardStreak } from '../utils/streak';
import { evaluateAchievements } from '../engine/insights';

export { useToast } from './useToast';

function subscribeToStorage(listener: () => void): () => void {
  window.addEventListener(AEQUIMENS_STORAGE_EVENT, listener);
  return () => window.removeEventListener(AEQUIMENS_STORAGE_EVENT, listener);
}

export function useCheckIns() {
  const [checkIns, setCheckIns] = useState<CheckInResult[]>([]);
  const refresh = useCallback(() => setCheckIns(storage.getCheckIns()), []);

  useEffect(() => {
    refresh();
    return subscribeToStorage(refresh);
  }, [refresh]);

  const save = useCallback((result: CheckInResult) => {
    storage.saveCheckIn(result);
    setCheckIns(storage.getCheckIns());
  }, []);

  return { checkIns, save, latest: checkIns[0] ?? null, refresh };
}

export function useTodaysMissions(date: string) {
  const [set, setSet] = useState<MissionSet | null>(null);
  const refresh = useCallback(() => {
    setSet(storage.getTodaysMissions(date));
  }, [date]);

  useEffect(() => {
    refresh();
    return subscribeToStorage(refresh);
  }, [refresh]);

  const update = useCallback(
    (missionId: string, patch: Partial<{ completed: boolean; name: string }>) => {
      storage.updateMission(date, missionId, patch);
      refresh();
    },
    [date, refresh],
  );

  const replace = useCallback(
    (missionId: string, replacement: import('../types').Mission) => {
      storage.replaceMission(date, missionId, replacement);
      refresh();
    },
    [date, refresh],
  );

  const saveSet = useCallback(
    (newSet: MissionSet) => {
      storage.saveMissionSet(newSet);
      refresh();
    },
    [refresh],
  );

  return { set, update, replace, saveSet, refresh };
}

export function useHistory() {
  const [history, setHistory] = useState<DaySummary[]>([]);
  const refresh = useCallback(() => setHistory(storage.getHistory()), []);

  useEffect(() => {
    const stored = storage.getHistory();
    if (stored.length === 0 && DEMO_MODE_ENABLED) {
      const seeded = buildMockHistory();
      storage.saveHistory(seeded);
      setHistory(seeded);
    } else {
      setHistory(stored);
    }
    return subscribeToStorage(refresh);
  }, [refresh]);

  const upsert = useCallback((summary: DaySummary) => {
    storage.upsertDaySummary(summary);
    setHistory(storage.getHistory());
  }, []);

  return { history, upsert, refresh };
}

export function useStreak() {
  const [streak, setStreakState] = useState(0);
  const refresh = useCallback(() => setStreakState(storage.getStreak()), []);

  useEffect(() => {
    refresh();
    return subscribeToStorage(refresh);
  }, [refresh]);

  const set = useCallback((value: number) => {
    storage.setStreak(value);
    setStreakState(value);
  }, []);

  /**
   * Counts a check-in toward the streak for the given local calendar date.
   * A repeated check-in on the same date never increments the streak.
   */
  const countCheckIn = useCallback((date: string) => {
    const lastCounted = storage.getLastCountedDate();
    if (!shouldCountTowardStreak(lastCounted, date)) {
      return storage.getStreak();
    }
    const next = computeNextStreak(storage.getStreak(), lastCounted, date);
    storage.setStreak(next);
    storage.setLastCountedDate(date);
    setStreakState(next);
    return next;
  }, []);

  return { streak, set, countCheckIn, refresh };
}

export function usePreferences() {
  const [prefs, setPrefs] = useState<Preferences>(DEFAULT_PREFERENCES);
  const refresh = useCallback(() => {
    setPrefs(storage.getPreferences() ?? DEFAULT_PREFERENCES);
  }, []);

  useEffect(() => {
    refresh();
    return subscribeToStorage(refresh);
  }, [refresh]);

  const save = useCallback((preferences: Preferences) => {
    storage.savePreferences(preferences);
    setPrefs(preferences);
  }, []);

  return { prefs, save, refresh };
}

export function useAchievements() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const loadStored = useCallback(() => {
    setAchievements(storage.getAchievements());
  }, []);

  useEffect(() => {
    const stored = storage.getAchievements();
    const history = storage.getHistory();
    if (stored.length > 0) {
      setAchievements(stored);
    } else if (history.length > 0) {
      const list = evaluateAchievements(history, stored);
      storage.saveAchievements(list);
      setAchievements(list);
    } else {
      setAchievements([]);
    }
    return subscribeToStorage(loadStored);
  }, [loadStored]);

  const refresh = useCallback(() => {
    const history = storage.getHistory();
    if (history.length === 0) {
      storage.saveAchievements([]);
      setAchievements([]);
      return;
    }
    const list = evaluateAchievements(history, storage.getAchievements());
    storage.saveAchievements(list);
    setAchievements(list);
  }, []);

  return { achievements, refresh };
}
