import type {
  Answers,
  CheckInResult,
  MissionSet,
  Preferences,
  DaySummary,
  Achievement,
} from '../types';

const KEYS = {
  checkIns: 'aequimens.checkIns', // CheckInResult[] newest first
  missions: 'aequimens.missions', // MissionSet[] newest first
  streak: 'aequimens.streak',
  preferences: 'aequimens.preferences',
  history: 'aequimens.history', // DaySummary[] oldest -> newest
  achievements: 'aequimens.achievements',
  onboarded: 'aequimens.onboarded',
} as const;

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
  } catch {
    /* storage may be unavailable in private mode */
  }
}

export const storage = {
  // ---- Check-ins ----
  getCheckIns(): CheckInResult[] {
    return read<CheckInResult[]>(KEYS.checkIns, []);
  },
  saveCheckIn(result: CheckInResult): void {
    const all = storage.getCheckIns().filter((c) => c.date !== result.date);
    all.unshift(result);
    write(KEYS.checkIns, all);
  },
  getLatestCheckIn(): CheckInResult | null {
    return storage.getCheckIns()[0] ?? null;
  },
  getCheckInForDate(date: string): CheckInResult | null {
    return storage.getCheckIns().find((c) => c.date === date) ?? null;
  },

  // ---- Answers (kept on latest check-in for "why am I seeing this") ----
  getLatestAnswers(): Answers {
    return storage.getLatestCheckIn()?.answers ?? {};
  },

  // ---- Missions ----
  getMissionSets(): MissionSet[] {
    return read<MissionSet[]>(KEYS.missions, []);
  },
  saveMissionSet(set: MissionSet): void {
    const all = storage.getMissionSets().filter((s) => s.date !== set.date);
    all.unshift(set);
    write(KEYS.missions, all);
  },
  getTodaysMissions(date: string): MissionSet | null {
    return storage.getMissionSets().find((s) => s.date === date) ?? null;
  },
  updateMission(date: string, missionId: string, patch: Partial<{ completed: boolean; name: string }>): void {
    const all = storage.getMissionSets();
    const set = all.find((s) => s.date === date);
    if (!set) return;
    set.missions = set.missions.map((m) => (m.id === missionId ? { ...m, ...patch } : m));
    write(KEYS.missions, all);
  },
  replaceMission(date: string, missionId: string, replacement: import('../types').Mission): void {
    const all = storage.getMissionSets();
    const set = all.find((s) => s.date === date);
    if (!set) return;
    set.missions = set.missions.map((m) => (m.id === missionId ? { ...m, ...replacement, createdAt: new Date().toISOString() } : m));
    write(KEYS.missions, all);
  },

  // ---- Streak ----
  getStreak(): number {
    return read<number>(KEYS.streak, 0);
  },
  setStreak(value: number): void {
    write(KEYS.streak, value);
  },

  // ---- Preferences ----
  getPreferences(): Preferences | null {
    return read<Preferences | null>(KEYS.preferences, null);
  },
  savePreferences(prefs: Preferences): void {
    write(KEYS.preferences, prefs);
  },

  // ---- History (day summaries for charts/calendar) ----
  getHistory(): DaySummary[] {
    return read<DaySummary[]>(KEYS.history, []);
  },
  saveHistory(history: DaySummary[]): void {
    write(KEYS.history, history);
  },
  upsertDaySummary(summary: DaySummary): void {
    const all = storage.getHistory().filter((d) => d.date !== summary.date);
    all.push(summary);
    all.sort((a, b) => a.date.localeCompare(b.date));
    write(KEYS.history, all);
  },

  // ---- Achievements ----
  getAchievements(): Achievement[] {
    return read<Achievement[]>(KEYS.achievements, []);
  },
  saveAchievements(list: Achievement[]): void {
    write(KEYS.achievements, list);
  },

  // ---- Onboarding ----
  hasOnboarded(): boolean {
    return read<boolean>(KEYS.onboarded, false);
  },
  setOnboarded(value: boolean): void {
    write(KEYS.onboarded, value);
  },

  // ---- Danger zone ----
  clearAll(): void {
    Object.values(KEYS).forEach((k) => {
      try {
        localStorage.removeItem(k);
      } catch {
        /* ignore */
      }
    });
  },

  // ---- Export ----
  exportAll(): string {
    const data: Record<string, unknown> = {};
    (Object.entries(KEYS) as [string, string][]).forEach(([name, key]) => {
      data[name] = read(key, null);
    });
    return JSON.stringify(data, null, 2);
  },
};
