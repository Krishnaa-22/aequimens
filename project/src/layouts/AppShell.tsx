import { Outlet } from 'react-router-dom';
import { Sidebar, MobileNavigation } from '../components/Navigation';

export function AppShell() {
  return (
    <div className="flex min-h-screen bg-canvas">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <main className="flex-1 pb-24 md:pb-10">
          <Outlet />
        </main>
        <MobileNavigation />
      </div>
    </div>
  );
}
