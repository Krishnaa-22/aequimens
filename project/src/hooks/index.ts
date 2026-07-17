import { useEffect, useState, useCallback } from 'react';
import { storage } from '../data/localStorage';
import type { CheckInResult, MissionSet, Preferences, DaySummary, Achievement } from '../types';
import { DEFAULT_PREFERENCES } from '../data/mockData';
import { buildMockHistory } from '../data/mockData';

export { useToast } from '../components/Toast';

export function useCheckIns() {
  const [checkIns, setCheckIns] = useState<CheckInResult[]>([]);
  useEffect(() => {
    setCheckIns(storage.getCheckIns());
  }, []);
  const save = useCallback((result: CheckInResult) => {
    storage.saveCheckIn(result);
    setCheckIns(storage.getCheckIns());
  }, []);
  return { checkIns, save, latest: checkIns[0] ?? null };
}

export function useTodaysMissions(date: string) {
  const [set, setSet] = useState<MissionSet | null>(null);
  const refresh = useCallback(() => {
    setSet(storage.getTodaysMissions(date));
  }, [date]);
  useEffect(() => {
    refresh();
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
  useEffect(() => {
    const stored = storage.getHistory();
    if (stored.length === 0) {
      const seeded = buildMockHistory();
      storage.saveHistory(seeded);
      setHistory(seeded);
    } else {
      setHistory(stored);
    }
  }, []);
  const refresh = useCallback(() => setHistory(storage.getHistory()), []);
  const upsert = useCallback((summary: DaySummary) => {
    storage.upsertDaySummary(summary);
    setHistory(storage.getHistory());
  }, []);
  return { history, upsert, refresh };
}

export function useStreak() {
  const [streak, setStreak] = useState(0);
  useEffect(() => {
    setStreak(storage.getStreak());
  }, []);
  const set = useCallback((value: number) => {
    storage.setStreak(value);
    setStreak(value);
  }, []);
  return { streak, set };
}

export function usePreferences() {
  const [prefs, setPrefs] = useState<Preferences>(DEFAULT_PREFERENCES);
  useEffect(() => {
    const stored = storage.getPreferences();
    if (stored) setPrefs(stored);
  }, []);
  const save = useCallback((p: Preferences) => {
    storage.savePreferences(p);
    setPrefs(p);
  }, []);
  return { prefs, save };
}

export function useAchievements() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  useEffect(() => {
    const stored = storage.getAchievements();
    if (stored.length > 0) {
      setAchievements(stored);
    } else {
      import('../engine/insights').then(({ evaluateAchievements }) => {
        const list = evaluateAchievements(storage.getHistory());
        storage.saveAchievements(list);
        setAchievements(list);
      });
    }
  }, []);
  const refresh = useCallback(() => {
    import('../engine/insights').then(({ evaluateAchievements }) => {
      const list = evaluateAchievements(storage.getHistory());
      storage.saveAchievements(list);
      setAchievements(list);
    });
  }, []);
  return { achievements, refresh };
}
