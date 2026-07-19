import { useEffect, useState, useCallback } from 'react';
import {
  AEQUIMENS_STORAGE_EVENT,
  storage,
} from '../data/localStorage';
import type {
  CheckInResult,
  MissionSet,
  Preferences,
  DaySummary,
  Achievement,
  Habit,
  HabitLog,
  MorningCheckIn,
  EveningCheckIn,
  ContextMarker,
  ChallengeParticipation,
  UserProfile,
  PersonalGoal,
  JournalEntry,
  Routine,
  RoutineLog,
  PrivacyLockSettings,
} from '../types';
import { DEFAULT_PREFERENCES, buildMockHistory } from '../data/mockData';
import { DEMO_MODE_ENABLED } from '../config';
import { computeNextStreak, shouldCountTowardStreak } from '../utils/streak';
import { evaluateAchievements } from '../engine/insights';
import { localDateISO } from '../utils/format';

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

// ---------------------------------------------------------------------------
// Custom habits
// ---------------------------------------------------------------------------

export function useHabits() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [logs, setLogs] = useState<HabitLog[]>([]);

  const refresh = useCallback(() => {
    setHabits(storage.getHabits());
    setLogs(storage.getHabitLogs());
  }, []);

  useEffect(() => {
    refresh();
    return subscribeToStorage(refresh);
  }, [refresh]);

  const save = useCallback(
    (habit: Habit) => {
      storage.saveHabit(habit);
      refresh();
    },
    [refresh],
  );

  const remove = useCallback(
    (habitId: string) => {
      storage.deleteHabit(habitId);
      refresh();
    },
    [refresh],
  );

  const toggleLog = useCallback(
    (habitId: string, date: string, completed: boolean) => {
      storage.setHabitLog(habitId, date, completed);
      refresh();
    },
    [refresh],
  );

  const isCompleted = useCallback(
    (habitId: string, date: string) =>
      logs.some((l) => l.habitId === habitId && l.date === date && l.completed),
    [logs],
  );

  /** Consecutive-day miss count for a habit, most-recent-first, ending today. */
  const missedStreak = useCallback(
    (habitId: string, today: string) => {
      let count = 0;
      const [y, m, d] = today.split('-').map(Number);
      const cursor = new Date(y, (m ?? 1) - 1, d ?? 1);
      for (let i = 0; i < 14; i += 1) {
        const dateStr = localDateISO(cursor);
        const log = logs.find((l) => l.habitId === habitId && l.date === dateStr);
        if (log?.completed) break;
        if (log && log.completed === false) count += 1;
        else if (!log && dateStr !== today) count += 1; // no entry counts as a miss for past days
        cursor.setDate(cursor.getDate() - 1);
      }
      return count;
    },
    [logs],
  );

  return { habits, logs, save, remove, toggleLog, isCompleted, missedStreak, refresh };
}

// ---------------------------------------------------------------------------
// Morning / evening check-ins
// ---------------------------------------------------------------------------

export function useMorningCheckIns() {
  const [entries, setEntries] = useState<MorningCheckIn[]>([]);
  const refresh = useCallback(() => setEntries(storage.getMorningCheckIns()), []);
  useEffect(() => {
    refresh();
    return subscribeToStorage(refresh);
  }, [refresh]);
  const save = useCallback(
    (entry: MorningCheckIn) => {
      storage.saveMorningCheckIn(entry);
      refresh();
    },
    [refresh],
  );
  return { entries, save, todayEntry: (date: string) => entries.find((e) => e.date === date) ?? null };
}

export function useEveningCheckIns() {
  const [entries, setEntries] = useState<EveningCheckIn[]>([]);
  const refresh = useCallback(() => setEntries(storage.getEveningCheckIns()), []);
  useEffect(() => {
    refresh();
    return subscribeToStorage(refresh);
  }, [refresh]);
  const save = useCallback(
    (entry: EveningCheckIn) => {
      storage.saveEveningCheckIn(entry);
      refresh();
    },
    [refresh],
  );
  return { entries, save, todayEntry: (date: string) => entries.find((e) => e.date === date) ?? null };
}

// ---------------------------------------------------------------------------
// Context markers
// ---------------------------------------------------------------------------

export function useContextMarkers() {
  const [markers, setMarkers] = useState<ContextMarker[]>([]);
  const refresh = useCallback(() => setMarkers(storage.getContextMarkers()), []);
  useEffect(() => {
    refresh();
    return subscribeToStorage(refresh);
  }, [refresh]);
  const save = useCallback(
    (marker: ContextMarker) => {
      storage.saveContextMarker(marker);
      refresh();
    },
    [refresh],
  );
  const remove = useCallback(
    (id: string) => {
      storage.deleteContextMarker(id);
      refresh();
    },
    [refresh],
  );
  const activeOn = useCallback(
    (date: string) =>
      markers.filter((m) => m.startDate <= date && (!m.endDate || m.endDate >= date)),
    [markers],
  );
  return { markers, save, remove, activeOn };
}

// ---------------------------------------------------------------------------
// Challenges
// ---------------------------------------------------------------------------

export function useChallenges() {
  const [challenges, setChallenges] = useState<ChallengeParticipation[]>([]);
  const refresh = useCallback(() => setChallenges(storage.getChallenges()), []);
  useEffect(() => {
    refresh();
    return subscribeToStorage(refresh);
  }, [refresh]);
  const save = useCallback(
    (challenge: ChallengeParticipation) => {
      storage.saveChallenge(challenge);
      refresh();
    },
    [refresh],
  );
  return { challenges, save };
}


// ---------------------------------------------------------------------------
// Profile, goals, journal, routines, and privacy lock
// ---------------------------------------------------------------------------

export function useProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const refresh = useCallback(() => setProfile(storage.getProfile()), []);
  useEffect(() => {
    refresh();
    return subscribeToStorage(refresh);
  }, [refresh]);
  const save = useCallback((value: UserProfile) => {
    storage.saveProfile(value);
    setProfile(value);
  }, []);
  return { profile, save, refresh };
}

export function useGoals() {
  const [goals, setGoals] = useState<PersonalGoal[]>([]);
  const refresh = useCallback(() => setGoals(storage.getGoals()), []);
  useEffect(() => {
    refresh();
    return subscribeToStorage(refresh);
  }, [refresh]);
  const save = useCallback((goal: PersonalGoal) => {
    storage.saveGoal(goal);
    refresh();
  }, [refresh]);
  const remove = useCallback((id: string) => {
    storage.deleteGoal(id);
    refresh();
  }, [refresh]);
  return { goals, save, remove, refresh };
}

export function useJournal() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const refresh = useCallback(() => setEntries(storage.getJournalEntries()), []);
  useEffect(() => {
    refresh();
    return subscribeToStorage(refresh);
  }, [refresh]);
  const save = useCallback((entry: JournalEntry) => {
    storage.saveJournalEntry(entry);
    refresh();
  }, [refresh]);
  const remove = useCallback((id: string) => {
    storage.deleteJournalEntry(id);
    refresh();
  }, [refresh]);
  return { entries, save, remove, refresh };
}

export function useRoutines() {
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [logs, setLogs] = useState<RoutineLog[]>([]);
  const refresh = useCallback(() => {
    setRoutines(storage.getRoutines());
    setLogs(storage.getRoutineLogs());
  }, []);
  useEffect(() => {
    refresh();
    return subscribeToStorage(refresh);
  }, [refresh]);
  const save = useCallback((routine: Routine) => {
    storage.saveRoutine(routine);
    refresh();
  }, [refresh]);
  const remove = useCallback((id: string) => {
    storage.deleteRoutine(id);
    refresh();
  }, [refresh]);
  const toggleItem = useCallback((routineId: string, itemId: string, date: string, completed: boolean) => {
    storage.setRoutineLog(routineId, itemId, date, completed);
    refresh();
  }, [refresh]);
  const isItemCompleted = useCallback((routineId: string, itemId: string, date: string) =>
    logs.some((log) => log.routineId === routineId && log.itemId === itemId && log.date === date && log.completed), [logs]);
  return { routines, logs, save, remove, toggleItem, isItemCompleted, refresh };
}

export function usePrivacyLock() {
  const [settings, setSettings] = useState<PrivacyLockSettings>(storage.getPrivacyLock());
  const refresh = useCallback(() => setSettings(storage.getPrivacyLock()), []);
  useEffect(() => {
    refresh();
    return subscribeToStorage(refresh);
  }, [refresh]);
  const save = useCallback((value: PrivacyLockSettings) => {
    storage.savePrivacyLock(value);
    setSettings(value);
  }, []);
  return { settings, save, refresh };
}
