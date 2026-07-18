import type {
  Answers,
  CheckInResult,
  Mission,
  MissionSet,
  Preferences,
  DaySummary,
  Achievement,
} from '../types';
import { evaluateAchievements } from '../engine/insights';

export const STORAGE_KEYS = {
  checkIns: 'aequimens.checkIns', // CheckInResult[] newest first
  missions: 'aequimens.missions', // MissionSet[] newest first
  streak: 'aequimens.streak',
  lastCountedDate: 'aequimens.lastCountedDate', // local YYYY-MM-DD counted toward streak
  preferences: 'aequimens.preferences',
  history: 'aequimens.history', // DaySummary[] oldest -> newest
  achievements: 'aequimens.achievements',
  onboarded: 'aequimens.onboarded',
} as const;

export const AEQUIMENS_STORAGE_EVENT = 'aequimens-storage-change';

function notifyStorageChange(key: string): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(AEQUIMENS_STORAGE_EVENT, { detail: { key } }));
}

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    notifyStorageChange(key);
  } catch {
    /* storage may be unavailable in private mode */
  }
}

function removeOwnedKeys(keys: readonly string[], eventKey: string): void {
  keys.forEach((key) => {
    try {
      localStorage.removeItem(key);
    } catch {
      /* ignore unavailable storage */
    }
  });
  notifyStorageChange(eventKey);
}

function syncMissionProgress(date: string, set: MissionSet): void {
  const history = storage.getHistory();
  const index = history.findIndex((day) => day.date === date);
  if (index === -1) return;

  const completed = set.missions.filter((mission) => mission.completed).length;
  const updated = [...history];
  updated[index] = {
    ...updated[index],
    missionsCompleted: completed,
    missionsTotal: set.missions.length,
  };

  write(STORAGE_KEYS.history, updated);
  const existingAchievements = storage.getAchievements();
  write(
    STORAGE_KEYS.achievements,
    evaluateAchievements(updated, existingAchievements),
  );
}

export const storage = {
  // ---- Check-ins ----
  getCheckIns(): CheckInResult[] {
    return read<CheckInResult[]>(STORAGE_KEYS.checkIns, []);
  },
  saveCheckIn(result: CheckInResult): void {
    const all = storage.getCheckIns().filter((checkIn) => checkIn.date !== result.date);
    all.push(result);
    all.sort((a, b) => b.date.localeCompare(a.date));
    write(STORAGE_KEYS.checkIns, all);
  },
  getLatestCheckIn(): CheckInResult | null {
    return storage.getCheckIns()[0] ?? null;
  },
  getCheckInForDate(date: string): CheckInResult | null {
    return storage.getCheckIns().find((checkIn) => checkIn.date === date) ?? null;
  },

  // ---- Answers (kept on latest check-in for "why am I seeing this") ----
  getLatestAnswers(): Answers {
    return storage.getLatestCheckIn()?.answers ?? {};
  },

  // ---- Missions ----
  getMissionSets(): MissionSet[] {
    return read<MissionSet[]>(STORAGE_KEYS.missions, []);
  },
  saveMissionSet(set: MissionSet): void {
    const all = storage.getMissionSets().filter((missionSet) => missionSet.date !== set.date);
    all.push(set);
    all.sort((a, b) => b.date.localeCompare(a.date));
    write(STORAGE_KEYS.missions, all);
    syncMissionProgress(set.date, set);
  },
  getTodaysMissions(date: string): MissionSet | null {
    return storage.getMissionSets().find((missionSet) => missionSet.date === date) ?? null;
  },
  updateMission(
    date: string,
    missionId: string,
    patch: Partial<Pick<Mission, 'completed' | 'name'>>,
  ): void {
    const all = storage.getMissionSets();
    const setIndex = all.findIndex((missionSet) => missionSet.date === date);
    if (setIndex === -1) return;

    const current = all[setIndex];
    const updatedSet: MissionSet = {
      ...current,
      missions: current.missions.map((mission) =>
        mission.id === missionId ? { ...mission, ...patch } : mission,
      ),
    };
    const updatedAll = [...all];
    updatedAll[setIndex] = updatedSet;
    write(STORAGE_KEYS.missions, updatedAll);
    syncMissionProgress(date, updatedSet);
  },
  replaceMission(date: string, missionId: string, replacement: Mission): void {
    const all = storage.getMissionSets();
    const setIndex = all.findIndex((missionSet) => missionSet.date === date);
    if (setIndex === -1) return;

    const current = all[setIndex];
    const updatedSet: MissionSet = {
      ...current,
      missions: current.missions.map((mission) =>
        mission.id === missionId
          ? { ...replacement, createdAt: new Date().toISOString() }
          : mission,
      ),
    };
    const updatedAll = [...all];
    updatedAll[setIndex] = updatedSet;
    write(STORAGE_KEYS.missions, updatedAll);
    syncMissionProgress(date, updatedSet);
  },

  // ---- Streak ----
  getStreak(): number {
    return read<number>(STORAGE_KEYS.streak, 0);
  },
  setStreak(value: number): void {
    write(STORAGE_KEYS.streak, value);
  },
  getLastCountedDate(): string | null {
    return read<string | null>(STORAGE_KEYS.lastCountedDate, null);
  },
  setLastCountedDate(date: string): void {
    write(STORAGE_KEYS.lastCountedDate, date);
  },

  // ---- Preferences ----
  getPreferences(): Preferences | null {
    return read<Preferences | null>(STORAGE_KEYS.preferences, null);
  },
  savePreferences(prefs: Preferences): void {
    write(STORAGE_KEYS.preferences, prefs);
  },

  // ---- History (day summaries for charts/calendar) ----
  getHistory(): DaySummary[] {
    return read<DaySummary[]>(STORAGE_KEYS.history, []);
  },
  saveHistory(history: DaySummary[]): void {
    const sorted = [...history].sort((a, b) => a.date.localeCompare(b.date));
    write(STORAGE_KEYS.history, sorted);
  },
  upsertDaySummary(summary: DaySummary): void {
    const all = storage.getHistory().filter((day) => day.date !== summary.date);
    all.push(summary);
    all.sort((a, b) => a.date.localeCompare(b.date));
    write(STORAGE_KEYS.history, all);
  },

  // ---- Achievements ----
  getAchievements(): Achievement[] {
    return read<Achievement[]>(STORAGE_KEYS.achievements, []);
  },
  saveAchievements(list: Achievement[]): void {
    write(STORAGE_KEYS.achievements, list);
  },

  // ---- Onboarding ----
  hasOnboarded(): boolean {
    return read<boolean>(STORAGE_KEYS.onboarded, false);
  },
  setOnboarded(value: boolean): void {
    write(STORAGE_KEYS.onboarded, value);
  },

  // ---- Danger zone ----
  clearProgress(): void {
    removeOwnedKeys(
      [
        STORAGE_KEYS.checkIns,
        STORAGE_KEYS.missions,
        STORAGE_KEYS.streak,
        STORAGE_KEYS.lastCountedDate,
        STORAGE_KEYS.history,
        STORAGE_KEYS.achievements,
      ],
      'progress',
    );
  },
  clearAll(): void {
    removeOwnedKeys(Object.values(STORAGE_KEYS), 'all');
  },

  // ---- Export ----
  exportAll(): string {
    const data: Record<string, unknown> = {};
    (Object.entries(STORAGE_KEYS) as [string, string][]).forEach(([name, key]) => {
      data[name] = read(key, null);
    });
    return JSON.stringify(data, null, 2);
  },
};
