import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '../components/Icon';
import { LogoMark, Wordmark } from '../components/LogoMark';
import { storage } from '../data/localStorage';
import type { CheckInPreference, LifeStage, UserProfile } from '../types';

const GOALS = [
  { id: 'sleep', label: 'Sleep more consistently', icon: 'MoonStar' },
  { id: 'stress', label: 'Handle stress more gently', icon: 'Wind' },
  { id: 'energy', label: 'Feel more energetic', icon: 'Zap' },
  { id: 'screen', label: 'Reduce screen overload', icon: 'Smartphone' },
  { id: 'routine', label: 'Build a steadier routine', icon: 'ListTodo' },
  { id: 'activity', label: 'Move more regularly', icon: 'Footprints' },
  { id: 'hydration', label: 'Improve hydration', icon: 'Droplets' },
  { id: 'outdoor', label: 'Spend more time outdoors', icon: 'TreePine' },
];

const LIFE_STAGES: { id: LifeStage; label: string; icon: string }[] = [
  { id: 'student', label: 'Student', icon: 'GraduationCap' },
  { id: 'professional', label: 'Working professional', icon: 'Briefcase' },
  { id: 'both', label: 'Studying and working', icon: 'ClipboardList' },
  { id: 'other', label: 'Something else', icon: 'Compass' },
];

const CHECK_IN_PREFERENCES: { id: CheckInPreference; label: string; detail: string }[] = [
  { id: 'morning', label: 'Morning', detail: 'Start the day with a short check-in.' },
  { id: 'evening', label: 'Evening', detail: 'Reflect after the day settles.' },
  { id: 'both', label: 'Morning and evening', detail: 'Use both quick check-ins.' },
  { id: 'flexible', label: 'Keep it flexible', detail: 'Check in whenever it suits you.' },
];

export function OnboardingPage() {
  const navigate = useNavigate();
  const existing = storage.getProfile();
  const [step, setStep] = useState(1);
  const [name, setName] = useState(existing?.preferredName ?? '');
  const [age, setAge] = useState(existing?.age ? String(existing.age) : '');
  const [lifeStage, setLifeStage] = useState<LifeStage>(existing?.lifeStage ?? 'student');
  const [goals, setGoals] = useState<string[]>(existing?.primaryGoals ?? []);
  const [wakeTime, setWakeTime] = useState(existing?.wakeTime ?? '07:00');
  const [sleepTime, setSleepTime] = useState(existing?.sleepTime ?? '23:00');
  const [preference, setPreference] = useState<CheckInPreference>(
    existing?.checkInPreference ?? 'flexible',
  );
  const [accepted, setAccepted] = useState(false);

  const ageNumber = Number(age);
  const identityValid = name.trim().length >= 2 && Number.isInteger(ageNumber) && ageNumber >= 13 && ageNumber <= 100;
  const canContinue = useMemo(() => {
    if (step === 1) return identityValid;
    if (step === 2) return goals.length > 0;
    if (step === 3) return Boolean(wakeTime && sleepTime && preference);
    return accepted;
  }, [accepted, goals.length, identityValid, preference, sleepTime, step, wakeTime]);

  const toggleGoal = (goal: string) => {
    setGoals((current) =>
      current.includes(goal) ? current.filter((item) => item !== goal) : [...current, goal].slice(0, 4),
    );
  };

  const finish = () => {
    if (!canContinue) return;
    const now = new Date().toISOString();
    const profile: UserProfile = {
      preferredName: name.trim(),
      age: ageNumber,
      lifeStage,
      primaryGoals: goals,
      wakeTime,
      sleepTime,
      checkInPreference: preference,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    };
    storage.saveProfile(profile);
    navigate('/check-in', { replace: true });
  };

  return (
    <div className="min-h-screen bg-canvas px-5 py-6 md:px-8 md:py-10">
      <div className="mx-auto max-w-3xl">
        <header className="mb-7 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <LogoMark size={38} />
            <Wordmark size={13} className="text-ink" />
          </div>
          <span className="chip border-olive-soft/40 bg-olive-tint/60 text-olive-deep">
            <Icon name="Lock" size={13} /> Local only
          </span>
        </header>

        <div className="mb-5 flex items-center gap-2">
          {[1, 2, 3, 4].map((number) => (
            <div key={number} className="flex flex-1 items-center gap-2">
              <div
                className={`h-1.5 flex-1 rounded-full transition-colors ${
                  number <= step ? 'bg-olive-primary' : 'bg-silver-light'
                }`}
              />
            </div>
          ))}
        </div>

        <main className="premium-card overflow-hidden">
          <div className="border-b border-silver/60 bg-gradient-to-br from-olive-tint/70 via-white to-silver-light/40 px-6 py-6 md:px-9 md:py-8">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-olive-primary">
              Step {step} of 4
            </p>
            <h1 className="mt-2 text-2xl font-bold text-ink md:text-3xl">
              {step === 1 && 'Let Aequimens know you'}
              {step === 2 && 'What would you like to improve?'}
              {step === 3 && 'Shape the app around your rhythm'}
              {step === 4 && 'Your privacy comes first'}
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-soft">
              {step === 1 && 'Only a few basics are needed to personalise greetings and suggestions. No medical details are requested.'}
              {step === 2 && 'Choose up to four areas. These guide your home screen and goals, not a diagnosis.'}
              {step === 3 && 'Aequimens will use these times only for local reminders and time-aware actions.'}
              {step === 4 && 'Everything stays in this browser unless you choose to export a backup.'}
            </p>
          </div>

          <div className="px-6 py-7 md:px-9 md:py-9">
            {step === 1 && (
              <div className="space-y-5 animate-fadeIn">
                <label className="block text-sm font-medium text-ink">
                  What should we call you?
                  <input
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Preferred name"
                    maxLength={30}
                    autoComplete="given-name"
                    className="mt-2 w-full rounded-2xl border border-silver bg-white px-4 py-3 text-base text-ink focus:border-olive-primary focus:outline-none"
                  />
                </label>

                <label className="block text-sm font-medium text-ink">
                  Your age
                  <input
                    type="number"
                    min={13}
                    max={100}
                    value={age}
                    onChange={(event) => setAge(event.target.value)}
                    placeholder="Age"
                    className="mt-2 w-full rounded-2xl border border-silver bg-white px-4 py-3 text-base text-ink focus:border-olive-primary focus:outline-none"
                  />
                  <span className="mt-1.5 block text-xs text-ink-soft">Aequimens is designed for people aged 13 and above.</span>
                </label>

                <div>
                  <p className="mb-2 text-sm font-medium text-ink">Which best describes your current life?</p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {LIFE_STAGES.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setLifeStage(item.id)}
                        className={`flex items-center gap-3 rounded-2xl border p-4 text-left transition-all ${
                          lifeStage === item.id
                            ? 'border-olive-soft bg-olive-tint text-olive-deep shadow-soft'
                            : 'border-silver bg-white text-ink hover:border-olive-soft/60'
                        }`}
                      >
                        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/80 text-olive-primary">
                          <Icon name={item.icon} size={18} />
                        </span>
                        <span className="text-sm font-semibold">{item.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="grid gap-3 sm:grid-cols-2 animate-fadeIn">
                {GOALS.map((goal) => {
                  const selected = goals.includes(goal.id);
                  return (
                    <button
                      key={goal.id}
                      type="button"
                      onClick={() => toggleGoal(goal.id)}
                      className={`flex items-center gap-3 rounded-2xl border p-4 text-left transition-all ${
                        selected
                          ? 'border-olive-soft bg-olive-tint text-olive-deep shadow-soft'
                          : 'border-silver bg-white text-ink hover:border-olive-soft/60'
                      }`}
                    >
                      <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${selected ? 'bg-white/80' : 'bg-silver-light/60'} text-olive-primary`}>
                        <Icon name={goal.icon} size={19} />
                      </span>
                      <span className="min-w-0 flex-1 text-sm font-semibold">{goal.label}</span>
                      {selected && <Icon name="CheckCircle" size={18} className="text-olive-primary" />}
                    </button>
                  );
                })}
                <p className="sm:col-span-2 text-xs text-ink-soft">Selected {goals.length}/4</p>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6 animate-fadeIn">
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block text-sm font-medium text-ink">
                    Usual wake-up time
                    <input
                      type="time"
                      value={wakeTime}
                      onChange={(event) => setWakeTime(event.target.value)}
                      className="mt-2 w-full rounded-2xl border border-silver bg-white px-4 py-3 text-base text-ink focus:border-olive-primary focus:outline-none"
                    />
                  </label>
                  <label className="block text-sm font-medium text-ink">
                    Usual sleep time
                    <input
                      type="time"
                      value={sleepTime}
                      onChange={(event) => setSleepTime(event.target.value)}
                      className="mt-2 w-full rounded-2xl border border-silver bg-white px-4 py-3 text-base text-ink focus:border-olive-primary focus:outline-none"
                    />
                  </label>
                </div>

                <div>
                  <p className="mb-2 text-sm font-medium text-ink">Preferred daily check-in rhythm</p>
                  <div className="space-y-2">
                    {CHECK_IN_PREFERENCES.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setPreference(item.id)}
                        className={`flex w-full items-center justify-between rounded-2xl border p-4 text-left transition-all ${
                          preference === item.id
                            ? 'border-olive-soft bg-olive-tint shadow-soft'
                            : 'border-silver bg-white hover:border-olive-soft/60'
                        }`}
                      >
                        <span>
                          <span className="block text-sm font-semibold text-ink">{item.label}</span>
                          <span className="mt-0.5 block text-xs text-ink-soft">{item.detail}</span>
                        </span>
                        <span className={`h-4 w-4 rounded-full border-2 ${preference === item.id ? 'border-olive-primary bg-olive-primary shadow-[inset_0_0_0_3px_white]' : 'border-silver-dark'}`} />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-4 animate-fadeIn">
                {[
                  { icon: 'ShieldCheck', title: 'Local by default', text: 'Your profile, check-ins, journal, habits, and routines stay on this device.' },
                  { icon: 'Download', title: 'Portable when you choose', text: 'You can export a private backup and import it on another device.' },
                  { icon: 'Info', title: 'Wellness, not diagnosis', text: 'Aequimens offers general lifestyle observations and never claims to diagnose or treat conditions.' },
                ].map((item) => (
                  <div key={item.title} className="flex gap-3 rounded-2xl border border-silver bg-white p-4">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-olive-tint text-olive-primary">
                      <Icon name={item.icon} size={18} />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-ink">{item.title}</p>
                      <p className="mt-1 text-xs leading-relaxed text-ink-soft">{item.text}</p>
                    </div>
                  </div>
                ))}

                <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-olive-soft/40 bg-olive-tint/40 p-4">
                  <input
                    type="checkbox"
                    checked={accepted}
                    onChange={(event) => setAccepted(event.target.checked)}
                    className="mt-0.5 h-5 w-5 accent-[#667A3E]"
                  />
                  <span className="text-sm leading-relaxed text-ink-soft">
                    I understand that Aequimens is a general wellness tool and does not replace professional medical or mental-health care.
                  </span>
                </label>
              </div>
            )}

            <div className="mt-8 flex items-center justify-between gap-3 border-t border-silver/60 pt-5">
              <button
                type="button"
                onClick={() => (step > 1 ? setStep((current) => current - 1) : navigate('/welcome'))}
                className="btn-secondary !px-4"
              >
                <Icon name="ArrowLeft" size={17} /> Back
              </button>
              <button
                type="button"
                disabled={!canContinue}
                onClick={() => (step < 4 ? setStep((current) => current + 1) : finish())}
                className="btn-primary !px-5"
              >
                {step < 4 ? 'Continue' : 'Start Aequimens'}
                <Icon name="ArrowRight" size={17} />
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
