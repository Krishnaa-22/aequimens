import { useState } from 'react';
import { Icon } from '../components/Icon';

const STEPS = [
  { icon: 'Sparkles', title: 'Check in', detail: 'Answer a short set of questions about mood, energy, stress, sleep, and daily rhythm.' },
  { icon: 'Compass', title: 'See what may be influencing today', detail: 'Aequimens connects your answers with likely lifestyle contributors without making a diagnosis.' },
  { icon: 'ListChecks', title: 'Take a few small actions', detail: 'Your daily plan stays intentionally short, so it is easier to follow.' },
  { icon: 'Calendar', title: 'Track what helped', detail: 'Habits, routines, context, and reflections build a clearer picture over time.' },
  { icon: 'Lightbulb', title: 'Discover your patterns', detail: 'Personal insights unlock only after enough real check-in days exist.' },
];

const FAQ = [
  {
    question: 'What does the wellness score mean?',
    answer: 'It is a simple summary of what you logged that day. It is not a medical score, diagnosis, or measure of your worth.',
  },
  {
    question: 'Why do some charts and insights stay locked?',
    answer: 'Aequimens waits for enough real entries before showing trends. This avoids conclusions based on one or two unusual days.',
  },
  {
    question: 'What is the difference between missions, habits, goals, and routines?',
    answer: 'Missions are short actions suggested for today. Habits are actions you choose to repeat. Goals describe a longer-term direction. Routines group several repeatable steps together.',
  },
  {
    question: 'Where is my data stored?',
    answer: 'Your profile and wellness records stay in this browser on this device. No account is required. Use Backup & Restore before clearing browser data or moving devices.',
  },
  {
    question: 'Does the PIN encrypt my data?',
    answer: 'No. The PIN is a privacy barrier for shared devices. Use a password-protected backup when moving or storing a copy of your data.',
  },
  {
    question: 'How reliable are reminders?',
    answer: 'Reminder settings work best while the installed app or browser is allowed to run. Browser and phone power-saving rules can limit exact background delivery.',
  },
  {
    question: 'Can Aequimens replace professional support?',
    answer: 'No. Aequimens supports general wellness reflection and daily habits. It does not diagnose, treat, or replace qualified medical or mental-health care.',
  },
];

export function HelpPage() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="mx-auto max-w-5xl px-5 py-8 md:px-8 md:py-10">
      <header className="mb-7">
        <p className="text-xs font-semibold uppercase tracking-wider text-olive-primary">Guide</p>
        <h1 className="mt-1 text-2xl font-bold text-ink md:text-3xl">How Aequimens works</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-soft">
          Aequimens is designed to help you understand your own days, not compare you with anyone else.
        </p>
      </header>

      <section className="relative overflow-hidden rounded-[32px] bg-olive-shine p-6 text-white shadow-soft-lg md:p-8">
        <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="relative grid gap-4 md:grid-cols-5">
          {STEPS.map((step, index) => (
            <div key={step.title} className="rounded-2xl border border-white/15 bg-white/8 p-4 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/12"><Icon name={step.icon} size={18} /></span>
                <span className="text-xs font-bold text-white/45">0{index + 1}</span>
              </div>
              <h2 className="mt-4 text-sm font-bold">{step.title}</h2>
              <p className="mt-2 text-xs leading-relaxed text-white/70">{step.detail}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="mt-6 grid gap-5 lg:grid-cols-[0.82fr_1.18fr]">
        <section className="premium-card p-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-olive-primary">The simple daily flow</p>
          <div className="mt-5 space-y-4">
            {[
              ['Morning', 'Map sleep, energy, and your main focus.'],
              ['During the day', 'Complete missions, habits, routines, or add context when it matters.'],
              ['Evening', 'Record what helped and what felt difficult.'],
              ['Over time', 'Review patterns built from your own history.'],
            ].map(([label, detail], index) => (
              <div key={label} className="flex gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-olive-tint text-xs font-bold text-olive-deep">{index + 1}</span>
                <div>
                  <p className="text-sm font-semibold text-ink">{label}</p>
                  <p className="mt-1 text-xs leading-relaxed text-ink-soft">{detail}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="premium-card p-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-olive-primary">Common questions</p>
          <div className="mt-4 divide-y divide-silver/60">
            {FAQ.map((item, index) => {
              const isOpen = open === index;
              return (
                <div key={item.question}>
                  <button
                    type="button"
                    onClick={() => setOpen(isOpen ? null : index)}
                    className="flex w-full items-center justify-between gap-4 py-4 text-left"
                    aria-expanded={isOpen}
                  >
                    <span className="text-sm font-semibold text-ink">{item.question}</span>
                    <Icon name="ChevronDown" size={17} className={`shrink-0 text-olive-primary transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {isOpen && <p className="pb-4 pr-8 text-sm leading-relaxed text-ink-soft">{item.answer}</p>}
                </div>
              );
            })}
          </div>
        </section>
      </div>

      <section className="mt-5 rounded-3xl border border-silver bg-gradient-to-br from-silver-metallic via-white to-olive-tint/40 p-6 shadow-soft">
        <div className="flex items-start gap-4">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-olive-primary shadow-soft"><Icon name="ShieldCheck" size={20} /></span>
          <div>
            <h2 className="text-base font-bold text-ink">Private by default</h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">No account is required. Search, reports, journals, and backups are handled on your device unless you personally move a backup file elsewhere.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
