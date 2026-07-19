import { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { ToastProvider } from './components/Toast';
import { ErrorBoundary } from './components/ErrorBoundary';
import { AppShell } from './layouts/AppShell';
import { PWAProvider } from './pwa/PWAProvider';

const SplashPage = lazy(() => import('./pages/SplashPage').then((m) => ({ default: m.SplashPage })));
const WelcomePage = lazy(() => import('./pages/WelcomePage').then((m) => ({ default: m.WelcomePage })));
const OnboardingPage = lazy(() => import('./pages/OnboardingPage').then((m) => ({ default: m.OnboardingPage })));
const CheckInPage = lazy(() => import('./pages/CheckInPage').then((m) => ({ default: m.CheckInPage })));
const ProcessingPage = lazy(() => import('./pages/ProcessingPage').then((m) => ({ default: m.ProcessingPage })));
const SnapshotPage = lazy(() => import('./pages/SnapshotPage').then((m) => ({ default: m.SnapshotPage })));
const DashboardPage = lazy(() => import('./pages/DashboardPage').then((m) => ({ default: m.DashboardPage })));
const MissionsPage = lazy(() => import('./pages/MissionsPage').then((m) => ({ default: m.MissionsPage })));
const ProgressPage = lazy(() => import('./pages/ProgressPage').then((m) => ({ default: m.ProgressPage })));
const InsightsPage = lazy(() => import('./pages/InsightsPage').then((m) => ({ default: m.InsightsPage })));
const SettingsPage = lazy(() => import('./pages/SettingsPage').then((m) => ({ default: m.SettingsPage })));
const BadDayPage = lazy(() => import('./pages/BadDayPage').then((m) => ({ default: m.BadDayPage })));
const DisclaimerPage = lazy(() => import('./pages/DisclaimerPage').then((m) => ({ default: m.DisclaimerPage })));
const HabitsPage = lazy(() => import('./pages/HabitsPage').then((m) => ({ default: m.HabitsPage })));
const MorningCheckInPage = lazy(() => import('./pages/MorningCheckInPage').then((m) => ({ default: m.MorningCheckInPage })));
const EveningCheckInPage = lazy(() => import('./pages/EveningCheckInPage').then((m) => ({ default: m.EveningCheckInPage })));
const TimelinePage = lazy(() => import('./pages/TimelinePage').then((m) => ({ default: m.TimelinePage })));
const ChallengesPage = lazy(() => import('./pages/ChallengesPage').then((m) => ({ default: m.ChallengesPage })));
const QuickResetPage = lazy(() => import('./pages/QuickResetPage').then((m) => ({ default: m.QuickResetPage })));
const MonthlyStoryPage = lazy(() => import('./pages/MonthlyStoryPage').then((m) => ({ default: m.MonthlyStoryPage })));
const GoalsPage = lazy(() => import('./pages/GoalsPage').then((m) => ({ default: m.GoalsPage })));
const JournalPage = lazy(() => import('./pages/JournalPage').then((m) => ({ default: m.JournalPage })));
const RoutinesPage = lazy(() => import('./pages/RoutinesPage').then((m) => ({ default: m.RoutinesPage })));
const ReminderCenterPage = lazy(() => import('./pages/ReminderCenterPage').then((m) => ({ default: m.ReminderCenterPage })));
const ProfilePage = lazy(() => import('./pages/ProfilePage').then((m) => ({ default: m.ProfilePage })));
const PrivacyLockPage = lazy(() => import('./pages/PrivacyLockPage').then((m) => ({ default: m.PrivacyLockPage })));
const SearchPage = lazy(() => import('./pages/SearchPage').then((m) => ({ default: m.SearchPage })));
const BackupPage = lazy(() => import('./pages/BackupPage').then((m) => ({ default: m.BackupPage })));
const HelpPage = lazy(() => import('./pages/HelpPage').then((m) => ({ default: m.HelpPage })));

function RouteLoading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center bg-canvas">
      <div className="text-center">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-silver border-t-olive-primary" />
        <p className="mt-3 text-xs font-medium text-ink-soft">Opening Aequimens…</p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <PWAProvider>
          <BrowserRouter>
            <Suspense fallback={<RouteLoading />}>
              <Routes>
                <Route path="/" element={<SplashPage />} />
                <Route path="/welcome" element={<WelcomePage />} />
                <Route path="/onboarding" element={<OnboardingPage />} />
                <Route path="/check-in" element={<CheckInPage />} />
                <Route path="/processing" element={<ProcessingPage />} />
                <Route path="/snapshot" element={<SnapshotPage />} />
                <Route path="/disclaimer" element={<DisclaimerPage />} />
                <Route path="/bad-day" element={<BadDayPage />} />
                <Route path="/app" element={<AppShell />}>
                  <Route index element={<DashboardPage />} />
                  <Route path="check-in" element={<CheckInPage />} />
                  <Route path="missions" element={<MissionsPage />} />
                  <Route path="progress" element={<ProgressPage />} />
                  <Route path="insights" element={<InsightsPage />} />
                  <Route path="settings" element={<SettingsPage />} />
                  <Route path="bad-day" element={<BadDayPage />} />
                  <Route path="habits" element={<HabitsPage />} />
                  <Route path="morning-check-in" element={<MorningCheckInPage />} />
                  <Route path="evening-check-in" element={<EveningCheckInPage />} />
                  <Route path="timeline" element={<TimelinePage />} />
                  <Route path="challenges" element={<ChallengesPage />} />
                  <Route path="quick-reset" element={<QuickResetPage />} />
                  <Route path="monthly-story" element={<MonthlyStoryPage />} />
                  <Route path="goals" element={<GoalsPage />} />
                  <Route path="journal" element={<JournalPage />} />
                  <Route path="routines" element={<RoutinesPage />} />
                  <Route path="reminders" element={<ReminderCenterPage />} />
                  <Route path="profile" element={<ProfilePage />} />
                  <Route path="privacy-lock" element={<PrivacyLockPage />} />
                  <Route path="search" element={<SearchPage />} />
                  <Route path="backup" element={<BackupPage />} />
                  <Route path="help" element={<HelpPage />} />
                  <Route path="morning" element={<Navigate to="/app/morning-check-in" replace />} />
                  <Route path="evening" element={<Navigate to="/app/evening-check-in" replace />} />
                  <Route path="reset" element={<Navigate to="/app/quick-reset" replace />} />
                  <Route path="story" element={<Navigate to="/app/monthly-story" replace />} />
                </Route>
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </PWAProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
}
