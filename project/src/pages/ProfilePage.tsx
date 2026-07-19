import { useEffect, useState } from 'react';
import { Icon } from '../components/Icon';
import { useProfile, useToast } from '../hooks';
import type { CheckInPreference, LifeStage, UserProfile } from '../types';

const GOALS = ['sleep', 'stress', 'energy', 'screen', 'routine', 'activity', 'hydration', 'outdoor'];

export function ProfilePage() {
  const { profile, save } = useProfile();
  const { show } = useToast();
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [lifeStage, setLifeStage] = useState<LifeStage>('student');
  const [primaryGoals, setPrimaryGoals] = useState<string[]>([]);
  const [wakeTime, setWakeTime] = useState('07:00');
  const [sleepTime, setSleepTime] = useState('23:00');
  const [checkInPreference, setCheckInPreference] = useState<CheckInPreference>('flexible');

  useEffect(() => {
    if (!profile) return;
    setName(profile.preferredName);
    setAge(String(profile.age));
    setLifeStage(profile.lifeStage);
    setPrimaryGoals(profile.primaryGoals);
    setWakeTime(profile.wakeTime);
    setSleepTime(profile.sleepTime);
    setCheckInPreference(profile.checkInPreference);
  }, [profile]);

  const ageNumber = Number(age);
  const valid = name.trim().length >= 2 && Number.isInteger(ageNumber) && ageNumber >= 13 && ageNumber <= 100;

  const submit = () => {
    if (!valid) return;
    const now = new Date().toISOString();
    const value: UserProfile = {
      preferredName: name.trim(),
      age: ageNumber,
      lifeStage,
      primaryGoals,
      wakeTime,
      sleepTime,
      checkInPreference,
      createdAt: profile?.createdAt ?? now,
      updatedAt: now,
    };
    save(value);
    show('Profile updated', 'success');
  };

  return (
    <div className="mx-auto max-w-2xl px-5 py-8 md:px-8 md:py-10">
      <header className="mb-7">
        <p className="text-xs font-semibold uppercase tracking-wider text-olive-primary">Personal profile</p>
        <h1 className="mt-1 text-2xl font-bold text-ink md:text-3xl">Make Aequimens feel like yours</h1>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">These details stay on this device and are used only for personalisation.</p>
      </header>

      <section className="premium-card p-5 md:p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-xs font-medium text-ink-soft sm:col-span-2">Preferred name
            <input value={name} onChange={(event) => setName(event.target.value)} maxLength={30} className="mt-1.5 w-full rounded-2xl border border-silver bg-white px-4 py-3 text-sm text-ink focus:border-olive-primary focus:outline-none" />
          </label>
          <label className="block text-xs font-medium text-ink-soft">Age
            <input type="number" min={13} max={100} value={age} onChange={(event) => setAge(event.target.value)} className="mt-1.5 w-full rounded-2xl border border-silver bg-white px-4 py-3 text-sm text-ink focus:border-olive-primary focus:outline-none" />
          </label>
          <label className="block text-xs font-medium text-ink-soft">Life stage
            <select value={lifeStage} onChange={(event) => setLifeStage(event.target.value as LifeStage)} className="mt-1.5 w-full rounded-2xl border border-silver bg-white px-4 py-3 text-sm text-ink focus:border-olive-primary focus:outline-none">
              <option value="student">Student</option><option value="professional">Working professional</option><option value="both">Studying and working</option><option value="other">Other</option>
            </select>
          </label>
          <label className="block text-xs font-medium text-ink-soft">Usual wake time
            <input type="time" value={wakeTime} onChange={(event) => setWakeTime(event.target.value)} className="mt-1.5 w-full rounded-2xl border border-silver bg-white px-4 py-3 text-sm text-ink focus:border-olive-primary focus:outline-none" />
          </label>
          <label className="block text-xs font-medium text-ink-soft">Usual sleep time
            <input type="time" value={sleepTime} onChange={(event) => setSleepTime(event.target.value)} className="mt-1.5 w-full rounded-2xl border border-silver bg-white px-4 py-3 text-sm text-ink focus:border-olive-primary focus:outline-none" />
          </label>
          <label className="block text-xs font-medium text-ink-soft sm:col-span-2">Check-in preference
            <select value={checkInPreference} onChange={(event) => setCheckInPreference(event.target.value as CheckInPreference)} className="mt-1.5 w-full rounded-2xl border border-silver bg-white px-4 py-3 text-sm text-ink focus:border-olive-primary focus:outline-none">
              <option value="morning">Morning</option><option value="evening">Evening</option><option value="both">Morning and evening</option><option value="flexible">Flexible</option>
            </select>
          </label>
        </div>

        <div className="mt-5">
          <p className="mb-2 text-xs font-medium text-ink-soft">Main areas you care about</p>
          <div className="flex flex-wrap gap-2">
            {GOALS.map((goal) => {
              const selected = primaryGoals.includes(goal);
              return <button key={goal} type="button" onClick={() => setPrimaryGoals((current) => selected ? current.filter((item) => item !== goal) : [...current, goal].slice(0, 4))} className={`rounded-full border px-3 py-1.5 text-xs font-medium ${selected ? 'border-olive-soft bg-olive-tint text-olive-deep' : 'border-silver bg-white text-ink-soft'}`}>{goal.charAt(0).toUpperCase() + goal.slice(1)}</button>;
            })}
          </div>
        </div>

        <button onClick={submit} disabled={!valid} className="btn-primary mt-7 w-full"><Icon name="Check" size={17} /> Save profile</button>
      </section>
    </div>
  );
}
