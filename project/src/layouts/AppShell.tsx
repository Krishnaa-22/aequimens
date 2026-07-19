import { Navigate, Outlet } from 'react-router-dom';
import { Sidebar, MobileNavigation } from '../components/Navigation';
import { PrivacyLockGate } from '../components/PrivacyLockGate';
import { storage } from '../data/localStorage';
import { ReminderScheduler } from '../components/ReminderScheduler';

export function AppShell() {
  if (!storage.getProfile()) {
    return <Navigate to="/onboarding" replace />;
  }

  return (
    <PrivacyLockGate>
      <ReminderScheduler />
      <div className="flex min-h-screen bg-canvas">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <main className="flex-1 pb-24 md:pb-10">
            <Outlet />
          </main>
          <MobileNavigation />
        </div>
      </div>
    </PrivacyLockGate>
  );
}
