import type {
  Answers,
  CheckInResult,
  Mission,
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
  // --- Added in the wellness-system expansion ---
  habits: 'aequimens.habits', // Habit[]
  habitLogs: 'aequimens.habitLogs', // HabitLog[]
  morningCheckIns: 'aequimens.morningCheckIns', // MorningCheckIn[]
  eveningCheckIns: 'aequimens.eveningCheckIns', // EveningCheckIn[]
  contextMarkers: 'aequimens.contextMarkers', // ContextMarker[]
  challenges: 'aequimens.challenges', // ChallengeParticipation[]
  profile: 'aequimens.profile', // UserProfile
  goals: 'aequimens.goals', // PersonalGoal[]
  journal: 'aequimens.journal', // JournalEntry[]
  routines: 'aequimens.routines', // Routine[]
  routineLogs: 'aequimens.routineLogs', // RoutineLog[]
  privacyLock: 'aequimens.privacyLock', // PrivacyLockSettings
  schemaVersion: 'aequimens.schemaVersion',
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

  // ---- Custom habits ----
  getHabits(): Habit[] {
    return read<Habit[]>(STORAGE_KEYS.habits, []);
  },
  saveHabit(habit: Habit): void {
    const all = storage.getHabits().filter((h) => h.id !== habit.id);
    all.push(habit);
    write(STORAGE_KEYS.habits, all);
  },
  deleteHabit(habitId: string): void {
    const all = storage.getHabits().filter((h) => h.id !== habitId);
    write(STORAGE_KEYS.habits, all);
    const logs = storage.getHabitLogs().filter((l) => l.habitId !== habitId);
    write(STORAGE_KEYS.habitLogs, logs);
  },

  getHabitLogs(): HabitLog[] {
    return read<HabitLog[]>(STORAGE_KEYS.habitLogs, []);
  },
  setHabitLog(habitId: string, date: string, completed: boolean): void {
    const all = storage.getHabitLogs().filter((l) => !(l.habitId === habitId && l.date === date));
    all.push({ habitId, date, completed, completedAt: completed ? new Date().toISOString() : undefined });
    write(STORAGE_KEYS.habitLogs, all);
  },

  // ---- Morning / evening check-ins ----
  getMorningCheckIns(): MorningCheckIn[] {
    return read<MorningCheckIn[]>(STORAGE_KEYS.morningCheckIns, []);
  },
  saveMorningCheckIn(entry: MorningCheckIn): void {
    const all = storage.getMorningCheckIns().filter((e) => e.date !== entry.date);
    all.push(entry);
    all.sort((a, b) => b.date.localeCompare(a.date));
    write(STORAGE_KEYS.morningCheckIns, all);
  },
  getEveningCheckIns(): EveningCheckIn[] {
    return read<EveningCheckIn[]>(STORAGE_KEYS.eveningCheckIns, []);
  },
  saveEveningCheckIn(entry: EveningCheckIn): void {
    const all = storage.getEveningCheckIns().filter((e) => e.date !== entry.date);
    all.push(entry);
    all.sort((a, b) => b.date.localeCompare(a.date));
    write(STORAGE_KEYS.eveningCheckIns, all);
  },

  // ---- Context markers ----
  getContextMarkers(): ContextMarker[] {
    return read<ContextMarker[]>(STORAGE_KEYS.contextMarkers, []);
  },
  saveContextMarker(marker: ContextMarker): void {
    const all = storage.getContextMarkers().filter((m) => m.id !== marker.id);
    all.push(marker);
    write(STORAGE_KEYS.contextMarkers, all);
  },
  deleteContextMarker(id: string): void {
    write(STORAGE_KEYS.contextMarkers, storage.getContextMarkers().filter((m) => m.id !== id));
  },

  // ---- Challenges ----
  getChallenges(): ChallengeParticipation[] {
    return read<ChallengeParticipation[]>(STORAGE_KEYS.challenges, []);
  },
  saveChallenge(challenge: ChallengeParticipation): void {
    const all = storage.getChallenges().filter((c) => c.id !== challenge.id);
    all.push(challenge);
    write(STORAGE_KEYS.challenges, all);
  },


  // ---- Personal profile ----
  getProfile(): UserProfile | null {
    return read<UserProfile | null>(STORAGE_KEYS.profile, null);
  },
  saveProfile(profile: UserProfile): void {
    write(STORAGE_KEYS.profile, profile);
    storage.setOnboarded(true);
  },

  // ---- Personal goals ----
  getGoals(): PersonalGoal[] {
    return read<PersonalGoal[]>(STORAGE_KEYS.goals, []);
  },
  saveGoal(goal: PersonalGoal): void {
    const all = storage.getGoals().filter((item) => item.id !== goal.id);
    all.push(goal);
    write(STORAGE_KEYS.goals, all);
  },
  deleteGoal(id: string): void {
    write(STORAGE_KEYS.goals, storage.getGoals().filter((goal) => goal.id !== id));
  },

  // ---- Private journal ----
  getJournalEntries(): JournalEntry[] {
    return read<JournalEntry[]>(STORAGE_KEYS.journal, []);
  },
  saveJournalEntry(entry: JournalEntry): void {
    const all = storage.getJournalEntries().filter((item) => item.id !== entry.id);
    all.push(entry);
    all.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    write(STORAGE_KEYS.journal, all);
  },
  deleteJournalEntry(id: string): void {
    write(STORAGE_KEYS.journal, storage.getJournalEntries().filter((entry) => entry.id !== id));
  },

  // ---- Reusable routines ----
  getRoutines(): Routine[] {
    return read<Routine[]>(STORAGE_KEYS.routines, []);
  },
  saveRoutine(routine: Routine): void {
    const all = storage.getRoutines().filter((item) => item.id !== routine.id);
    all.push(routine);
    write(STORAGE_KEYS.routines, all);
  },
  deleteRoutine(id: string): void {
    write(STORAGE_KEYS.routines, storage.getRoutines().filter((routine) => routine.id !== id));
    write(STORAGE_KEYS.routineLogs, storage.getRoutineLogs().filter((log) => log.routineId !== id));
  },
  getRoutineLogs(): RoutineLog[] {
    return read<RoutineLog[]>(STORAGE_KEYS.routineLogs, []);
  },
  setRoutineLog(routineId: string, itemId: string, date: string, completed: boolean): void {
    const all = storage.getRoutineLogs().filter(
      (log) => !(log.routineId === routineId && log.itemId === itemId && log.date === date),
    );
    all.push({
      routineId,
      itemId,
      date,
      completed,
      completedAt: completed ? new Date().toISOString() : undefined,
    });
    write(STORAGE_KEYS.routineLogs, all);
  },

  // ---- Privacy lock ----
  getPrivacyLock(): PrivacyLockSettings {
    return read<PrivacyLockSettings>(STORAGE_KEYS.privacyLock, {
      enabled: false,
      autoLockMinutes: 5,
      hideNotificationDetails: true,
    });
  },
  savePrivacyLock(settings: PrivacyLockSettings): void {
    write(STORAGE_KEYS.privacyLock, settings);
  },

  // ---- Schema version ----
  getSchemaVersion(): number {
    return read<number>(STORAGE_KEYS.schemaVersion, 1);
  },
  setSchemaVersion(version: number): void {
    write(STORAGE_KEYS.schemaVersion, version);
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
        STORAGE_KEYS.habits,
        STORAGE_KEYS.habitLogs,
        STORAGE_KEYS.morningCheckIns,
        STORAGE_KEYS.eveningCheckIns,
        STORAGE_KEYS.contextMarkers,
        STORAGE_KEYS.challenges,
        STORAGE_KEYS.journal,
        STORAGE_KEYS.routineLogs,
      ],
      'progress',
    );
  },
  clearAll(): void {
    removeOwnedKeys(Object.values(STORAGE_KEYS), 'all');
  },

  // ---- Export / Import ----
  exportAll(): string {
    const data: Record<string, unknown> = {};
    (Object.entries(STORAGE_KEYS) as [string, string][]).forEach(([name, key]) => {
      data[name] = read(key, null);
    });
    return JSON.stringify({ app: 'aequimens', version: 2, exportedAt: new Date().toISOString(), data }, null, 2);
  },
  /**
   * Imports a previously exported Aequimens backup. Only recognised
   * aequimens.* keys are touched; all other localStorage data is untouched.
   * Returns true on success, false if the payload could not be parsed.
   */
  importAll(json: string): boolean {
    try {
      const parsed = JSON.parse(json) as { app?: string; version?: number; data?: Record<string, unknown> };
      if (parsed.app && parsed.app !== 'aequimens') return false;
      if (parsed.version && parsed.version > 2) return false;
      const data = parsed?.data ?? (parsed as Record<string, unknown>);
      if (!data || typeof data !== 'object') return false;
      (Object.entries(STORAGE_KEYS) as [string, string][]).forEach(([name, key]) => {
        if (name in data && data[name] !== null && data[name] !== undefined) {
          localStorage.setItem(key, JSON.stringify(data[name]));
        }
      });
      notifyStorageChange('import');
      return true;
    } catch {
      return false;
    }
  },
};
