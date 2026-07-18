import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './components/Toast';
import { AppShell } from './layouts/AppShell';
import { SplashPage } from './pages/SplashPage';
import { WelcomePage } from './pages/WelcomePage';
import { CheckInPage } from './pages/CheckInPage';
import { ProcessingPage } from './pages/ProcessingPage';
import { SnapshotPage } from './pages/SnapshotPage';
import { DashboardPage } from './pages/DashboardPage';
import { MissionsPage } from './pages/MissionsPage';
import { ProgressPage } from './pages/ProgressPage';
import { InsightsPage } from './pages/InsightsPage';
import { SettingsPage } from './pages/SettingsPage';
import { BadDayPage } from './pages/BadDayPage';
import { DisclaimerPage } from './pages/DisclaimerPage';
import { PWAProvider } from './pwa/PWAProvider';

export default function App() {
  return (
    <ToastProvider>
      <PWAProvider>
        <BrowserRouter>
        <Routes>
          <Route path="/" element={<SplashPage />} />
          <Route path="/welcome" element={<WelcomePage />} />
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
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        </BrowserRouter>
      </PWAProvider>
    </ToastProvider>
  );
}
