import { useEffect, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Icon } from './Icon';
import { LogoMark, Wordmark } from './LogoMark';

interface NavItem {
  to: string;
  label: string;
  icon: string;
  description?: string;
}

const CORE_ITEMS: NavItem[] = [
  { to: '/app', label: 'Home', icon: 'LayoutDashboard' },
  { to: '/app/check-in', label: 'Check-In', icon: 'Sparkles' },
  { to: '/app/missions', label: 'Missions', icon: 'ListChecks' },
  { to: '/app/progress', label: 'Progress', icon: 'TrendingUp' },
];

const DAILY_ITEMS: NavItem[] = [
  {
    to: '/app/habits',
    label: 'Custom Habits',
    icon: 'CheckCircle',
    description: 'Build and track your own routines',
  },
  {
    to: '/app/morning-check-in',
    label: 'Morning Check-In',
    icon: 'Sunrise',
    description: 'Sleep, energy, and today’s focus',
  },
  {
    to: '/app/evening-check-in',
    label: 'Evening Reflection',
    icon: 'MoonStar',
    description: 'Reflect on what helped today',
  },
  {
    to: '/app/timeline',
    label: 'Timeline & Context',
    icon: 'Calendar',
    description: 'See habits, check-ins, and life context',
  },
];


const PERSONAL_ITEMS: NavItem[] = [
  {
    to: '/app/goals',
    label: 'Personal Goals',
    icon: 'Target',
    description: 'Build a multi-week path around what matters',
  },
  {
    to: '/app/journal',
    label: 'Private Journal',
    icon: 'NotebookPen',
    description: 'Capture context and what helped',
  },
  {
    to: '/app/routines',
    label: 'Routine Builder',
    icon: 'ListTodo',
    description: 'Create repeatable morning and night routines',
  },
  {
    to: '/app/reminders',
    label: 'Reminder Centre',
    icon: 'Bell',
    description: 'Keep prompts useful, not noisy',
  },
];

const EXPLORE_ITEMS: NavItem[] = [
  {
    to: '/app/challenges',
    label: 'Challenges',
    icon: 'Trophy',
    description: 'Join guided wellness challenges',
  },
  {
    to: '/app/quick-reset',
    label: 'Quick Reset',
    icon: 'Wind',
    description: 'Short calming and reset tools',
  },
  {
    to: '/app/monthly-story',
    label: 'Monthly Story',
    icon: 'Award',
    description: 'Your month in a clear, private summary',
  },
  {
    to: '/app/insights',
    label: 'Insights',
    icon: 'Lightbulb',
    description: 'Weekly reflections and personal patterns',
  },
];

const SETTINGS_ITEM: NavItem = { to: '/app/settings', label: 'Settings', icon: 'Settings' };
const PROFILE_ITEM: NavItem = { to: '/app/profile', label: 'Profile', icon: 'CircleUserRound' };
const MOBILE_PRIMARY_ITEMS: NavItem[] = [
  CORE_ITEMS[0],
  CORE_ITEMS[1],
  DAILY_ITEMS[0],
  CORE_ITEMS[3],
];
const MOBILE_MORE_ITEMS: NavItem[] = [
  CORE_ITEMS[2],
  ...DAILY_ITEMS.slice(1),
  ...PERSONAL_ITEMS,
  ...EXPLORE_ITEMS,
  PROFILE_ITEM,
  SETTINGS_ITEM,
];

function SidebarLink({ item }: { item: NavItem }) {
  return (
    <NavLink
      to={item.to}
      end={item.to === '/app'}
      className={({ isActive }) =>
        `group flex items-center gap-3 rounded-2xl px-3.5 py-2.5 text-sm font-medium transition-all duration-200 ${
          isActive
            ? 'bg-olive-tint text-olive-deep shadow-[inset_0_0_0_1px_rgba(155,174,112,0.4)]'
            : 'text-ink-soft hover:bg-silver-light/60 hover:text-ink'
        }`
      }
    >
      {({ isActive }) => (
        <>
          <span className={isActive ? 'text-olive-primary' : 'text-ink-soft group-hover:text-olive-primary'}>
            <Icon name={item.icon} size={18} />
          </span>
          <span className="truncate">{item.label}</span>
        </>
      )}
    </NavLink>
  );
}

function SidebarSection({ label, items }: { label: string; items: NavItem[] }) {
  return (
    <div className="mb-3">
      <p className="mb-1 px-3.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-soft/75">
        {label}
      </p>
      <div className="space-y-0.5">
        {items.map((item) => (
          <SidebarLink key={item.to} item={item} />
        ))}
      </div>
    </div>
  );
}

export function Sidebar() {
  return (
    <aside className="hidden h-screen w-72 shrink-0 border-r border-silver/60 bg-white/75 backdrop-blur-md md:sticky md:top-0 md:flex md:flex-col">
      <div className="flex items-center gap-3 px-6 py-5">
        <LogoMark size={40} />
        <Wordmark size={15} className="text-ink" />
      </div>

      <nav className="min-h-0 flex-1 overflow-y-auto px-3 pb-3" aria-label="Primary">
        <SidebarSection label="Core" items={CORE_ITEMS} />
        <SidebarSection label="Daily tools" items={DAILY_ITEMS} />
        <SidebarSection label="Personal system" items={PERSONAL_ITEMS} />
        <SidebarSection label="Explore" items={EXPLORE_ITEMS} />
      </nav>

      <div className="border-t border-silver/50 px-3 py-3">
        <SidebarLink item={PROFILE_ITEM} />
        <SidebarLink item={SETTINGS_ITEM} />
        <div className="mx-2 mt-3 rounded-2xl border border-silver bg-olive-tint/40 p-3.5">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-olive-deep">Privacy</p>
          <p className="mt-1 text-xs leading-relaxed text-ink-soft">
            Your data stays on this device. No account required.
          </p>
        </div>
      </div>
    </aside>
  );
}

function MobileNavLink({ item, onNavigate }: { item: NavItem; onNavigate?: () => void }) {
  return (
    <NavLink
      to={item.to}
      end={item.to === '/app'}
      onClick={onNavigate}
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
          <span className="max-w-[58px] truncate">{item.label === 'Custom Habits' ? 'Habits' : item.label}</span>
        </>
      )}
    </NavLink>
  );
}

export function MobileNavigation() {
  const [moreOpen, setMoreOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const moreIsActive = MOBILE_MORE_ITEMS.some((item) => location.pathname === item.to);

  useEffect(() => {
    setMoreOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!moreOpen) return;
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMoreOpen(false);
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [moreOpen]);

  return (
    <>
      {moreOpen && (
        <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true" aria-label="More Aequimens tools">
          <button
            type="button"
            aria-label="Close more tools"
            onClick={() => setMoreOpen(false)}
            className="absolute inset-0 bg-ink/35 backdrop-blur-[2px]"
          />
          <div className="safe-bottom absolute inset-x-0 bottom-0 max-h-[78vh] overflow-y-auto rounded-t-[28px] border-t border-silver bg-canvas px-5 pb-7 pt-4 shadow-2xl">
            <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-silver" />
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-olive-primary">More</p>
                <h2 className="mt-0.5 text-xl font-bold text-ink">Your wellness tools</h2>
              </div>
              <button
                type="button"
                onClick={() => setMoreOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-silver bg-white text-ink-soft"
                aria-label="Close"
              >
                <Icon name="X" size={18} />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {MOBILE_MORE_ITEMS.map((item) => (
                <button
                  key={item.to}
                  type="button"
                  onClick={() => navigate(item.to)}
                  className={`flex items-center gap-3 rounded-2xl border p-3.5 text-left transition-all ${
                    location.pathname === item.to
                      ? 'border-olive-soft bg-olive-tint text-olive-deep'
                      : 'border-silver bg-white text-ink hover:border-olive-soft/60'
                  }`}
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-olive-tint text-olive-primary">
                    <Icon name={item.icon} size={18} />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold">{item.label}</span>
                    {item.description && (
                      <span className="mt-0.5 block text-xs leading-relaxed text-ink-soft">{item.description}</span>
                    )}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <nav
        className="safe-bottom fixed inset-x-0 bottom-0 z-40 border-t border-silver/60 bg-white/92 backdrop-blur-lg md:hidden"
        aria-label="Primary mobile"
      >
        <div className="mx-auto flex max-w-md items-stretch justify-between px-1.5">
          {MOBILE_PRIMARY_ITEMS.map((item) => (
            <MobileNavLink key={item.to} item={item} />
          ))}
          <button
            type="button"
            onClick={() => setMoreOpen(true)}
            className={`flex flex-1 flex-col items-center gap-1 rounded-xl px-1 py-2.5 text-[10px] font-medium transition-colors ${
              moreIsActive || moreOpen ? 'text-olive-primary' : 'text-ink-soft'
            }`}
            aria-label="More tools"
            aria-expanded={moreOpen}
          >
            <span
              className={`flex h-9 w-9 items-center justify-center rounded-xl transition-all ${
                moreIsActive || moreOpen
                  ? 'bg-olive-tint shadow-[inset_0_0_0_1px_rgba(155,174,112,0.5)]'
                  : ''
              }`}
            >
              <Icon name="MoreHorizontal" size={19} />
            </span>
            More
          </button>
        </div>
      </nav>
    </>
  );
}
