import { NavLink } from 'react-router-dom';
import { Icon } from './Icon';
import { LogoMark, Wordmark } from './LogoMark';
import type { LucideIcon } from 'lucide-react';

export interface NavItem {
  to: string;
  label: string;
  icon: string;
}

export const NAV_ITEMS: NavItem[] = [
  { to: '/app', label: 'Home', icon: 'LayoutDashboard' },
  { to: '/app/check-in', label: 'Check-In', icon: 'Sparkles' },
  { to: '/app/missions', label: 'Missions', icon: 'ListChecks' },
  { to: '/app/progress', label: 'Progress', icon: 'TrendingUp' },
  { to: '/app/insights', label: 'Insights', icon: 'Lightbulb' },
  { to: '/app/settings', label: 'Settings', icon: 'Settings' },
];

export function Sidebar() {
  return (
    <aside className="hidden w-64 shrink-0 border-r border-silver/60 bg-white/70 backdrop-blur-md md:flex md:flex-col">
      <div className="flex items-center gap-3 px-6 py-6">
        <LogoMark size={40} />
        <Wordmark size={15} className="text-ink" />
      </div>
      <nav className="flex flex-1 flex-col gap-1 px-3 py-2" aria-label="Primary">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/app'}
            className={({ isActive }) =>
              `group flex items-center gap-3 rounded-2xl px-3.5 py-3 text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-olive-tint text-olive-deep shadow-[inset_0_0_0_1px_rgba(155,174,112,0.4)]'
                  : 'text-ink-soft hover:bg-silver-light/60 hover:text-ink'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span className={isActive ? 'text-olive-primary' : 'text-ink-soft group-hover:text-olive-primary'}>
                  <Icon name={item.icon} size={19} />
                </span>
                {item.label}
              </>
            )}
          </NavLink>
        ))}
      </nav>
      <div className="px-5 py-5">
        <div className="rounded-2xl border border-silver bg-olive-tint/40 p-3.5">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-olive-deep">Privacy</p>
          <p className="mt-1 text-xs leading-relaxed text-ink-soft">
            Your data stays on this device. No account required.
          </p>
        </div>
      </div>
    </aside>
  );
}

export function MobileNavigation() {
  const items = NAV_ITEMS.filter((i) => i.to !== '/app/settings');
  return (
    <nav
      className="safe-bottom fixed inset-x-0 bottom-0 z-40 border-t border-silver/60 bg-white/90 backdrop-blur-lg md:hidden"
      aria-label="Primary mobile"
    >
      <div className="mx-auto flex max-w-md items-stretch justify-between px-2">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/app'}
            className={({ isActive }) =>
              `flex flex-1 flex-col items-center gap-1 rounded-xl px-1 py-2.5 text-[10px] font-medium transition-colors ${
                isActive ? 'text-olive-primary' : 'text-ink-soft'
              }`
            }
            aria-label={item.label}
          >
            {({ isActive }) => (
              <>
                <span
                  className={`flex h-9 w-9 items-center justify-center rounded-xl transition-all ${
                    isActive ? 'bg-olive-tint shadow-[inset_0_0_0_1px_rgba(155,174,112,0.5)]' : ''
                  }`}
                >
                  <Icon name={item.icon} size={19} />
                </span>
                {item.label}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

// satisfy import type use
export type { LucideIcon };
