import { useState } from 'react';
import { Icon } from '../components/Icon';
import { lockAequimensNow } from '../utils/security';
import { usePrivacyLock, useToast } from '../hooks';
import { hashPin, isValidPin } from '../utils/security';

export function PrivacyLockPage() {
  const { settings, save } = usePrivacyLock();
  const { show } = useToast();
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [minutes, setMinutes] = useState(settings.autoLockMinutes);
  const [hideDetails, setHideDetails] = useState(settings.hideNotificationDetails);

  const enable = async () => {
    if (!isValidPin(pin) || pin !== confirmPin) {
      show('Use a matching 4–6 digit PIN', 'info');
      return;
    }
    const pinHash = await hashPin(pin);
    save({ enabled: true, pinHash, autoLockMinutes: minutes, hideNotificationDetails: hideDetails });
    setPin('');
    setConfirmPin('');
    show(settings.enabled ? 'Privacy PIN updated' : 'Privacy lock enabled', 'success');
  };

  const updatePreferences = () => {
    save({ ...settings, autoLockMinutes: minutes, hideNotificationDetails: hideDetails });
    show('Lock preferences updated', 'success');
  };

  const disable = () => {
    save({ enabled: false, autoLockMinutes: minutes, hideNotificationDetails: hideDetails });
    show('Privacy lock disabled', 'success');
  };

  return (
    <div className="mx-auto max-w-2xl px-5 py-8 md:px-8 md:py-10">
      <header className="mb-7">
        <p className="text-xs font-semibold uppercase tracking-wider text-olive-primary">Local privacy lock</p>
        <h1 className="mt-1 text-2xl font-bold text-ink md:text-3xl">Add a barrier on shared devices</h1>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">The PIN is hashed and stored locally. It is not a replacement for your phone’s lock or encryption.</p>
      </header>

      <section className="premium-card p-5 md:p-6">
        <div className="flex items-start gap-3 rounded-2xl border border-olive-soft/40 bg-olive-tint/40 p-4">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-olive-primary"><Icon name="ShieldCheck" size={19} /></span>
          <div>
            <p className="text-sm font-semibold text-ink">Status: {settings.enabled ? 'Enabled' : 'Off'}</p>
            <p className="mt-1 text-xs leading-relaxed text-ink-soft">When enabled, Aequimens locks after inactivity or when you choose “Lock now”.</p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <label className="block text-xs font-medium text-ink-soft">{settings.enabled ? 'New PIN' : 'Create PIN'}
            <input type="password" inputMode="numeric" value={pin} onChange={(event) => setPin(event.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="4–6 digits" className="mt-1.5 w-full rounded-2xl border border-silver bg-white px-4 py-3 text-sm tracking-[0.35em] text-ink focus:border-olive-primary focus:outline-none" />
          </label>
          <label className="block text-xs font-medium text-ink-soft">Confirm PIN
            <input type="password" inputMode="numeric" value={confirmPin} onChange={(event) => setConfirmPin(event.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="Repeat PIN" className="mt-1.5 w-full rounded-2xl border border-silver bg-white px-4 py-3 text-sm tracking-[0.35em] text-ink focus:border-olive-primary focus:outline-none" />
          </label>
          <label className="block text-xs font-medium text-ink-soft">Auto-lock after
            <select value={minutes} onChange={(event) => setMinutes(Number(event.target.value))} className="mt-1.5 w-full rounded-2xl border border-silver bg-white px-4 py-3 text-sm text-ink focus:border-olive-primary focus:outline-none">
              {[1, 2, 5, 10, 20, 30].map((value) => <option key={value} value={value}>{value} minute{value === 1 ? '' : 's'}</option>)}
            </select>
          </label>
          <label className="flex items-center justify-between gap-4 rounded-2xl border border-silver bg-white px-4 py-3">
            <span><span className="block text-xs font-medium text-ink">Hide notification details</span><span className="mt-0.5 block text-[11px] text-ink-soft">Use generic reminder text.</span></span>
            <button type="button" role="switch" aria-checked={hideDetails} onClick={() => setHideDetails((value) => !value)} className={`relative h-7 w-12 rounded-full ${hideDetails ? 'bg-olive-primary' : 'bg-silver'}`}><span className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-all ${hideDetails ? 'left-6' : 'left-1'}`} /></button>
          </label>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button onClick={() => void enable()} disabled={!pin || !confirmPin} className="btn-primary flex-1"><Icon name="KeyRound" size={17} /> {settings.enabled ? 'Change PIN' : 'Enable lock'}</button>
          {settings.enabled && <button onClick={updatePreferences} className="btn-secondary flex-1">Save preferences</button>}
        </div>

        {settings.enabled && (
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <button onClick={lockAequimensNow} className="btn-secondary"><Icon name="Lock" size={16} /> Lock now</button>
            <button onClick={disable} className="rounded-2xl border border-silver bg-white px-5 py-3 font-semibold text-olive-deep transition-all hover:border-olive-soft">Disable lock</button>
          </div>
        )}
      </section>
    </div>
  );
}
