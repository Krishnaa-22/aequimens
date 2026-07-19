import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '../components/Icon';
import { Modal } from '../components/Modal';
import { storage } from '../data/localStorage';
import { useToast } from '../hooks';
import { todayISO } from '../utils/format';
import {
  decryptBackup,
  encryptBackup,
  inspectBackup,
  isEncryptedBackup,
  type BackupSummary,
} from '../utils/backup';

interface PendingImport {
  plainText: string;
  summary: BackupSummary;
}

function downloadText(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function BackupPage() {
  const navigate = useNavigate();
  const { show } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [exportOpen, setExportOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [working, setWorking] = useState(false);
  const [encryptedFile, setEncryptedFile] = useState<string | null>(null);
  const [importPassword, setImportPassword] = useState('');
  const [importPasswordOpen, setImportPasswordOpen] = useState(false);
  const [pendingImport, setPendingImport] = useState<PendingImport | null>(null);

  const exportPlain = () => {
    downloadText(storage.exportAll(), `aequimens-backup-${todayISO()}.json`);
    show('Backup downloaded', 'success');
  };

  const exportEncrypted = async () => {
    if (password.length < 8) {
      show('Use at least 8 characters for the backup password', 'info');
      return;
    }
    if (password !== confirmPassword) {
      show('The passwords do not match', 'info');
      return;
    }

    setWorking(true);
    try {
      const encrypted = await encryptBackup(storage.exportAll(), password);
      downloadText(encrypted, `aequimens-protected-${todayISO()}.json`);
      setExportOpen(false);
      setPassword('');
      setConfirmPassword('');
      show('Password-protected backup downloaded', 'success');
    } catch (error) {
      show(error instanceof Error ? error.message : 'The backup could not be created', 'info');
    } finally {
      setWorking(false);
    }
  };

  const preparePlainImport = (plainText: string, encrypted: boolean) => {
    try {
      const summary = inspectBackup(plainText, encrypted);
      setPendingImport({ plainText, summary });
    } catch (error) {
      show(error instanceof Error ? error.message : 'That backup could not be read', 'info');
    }
  };

  const handleFile = async (file: File) => {
    try {
      const raw = await file.text();
      if (isEncryptedBackup(raw)) {
        setEncryptedFile(raw);
        setImportPassword('');
        setImportPasswordOpen(true);
      } else {
        preparePlainImport(raw, false);
      }
    } catch {
      show('That backup could not be read', 'info');
    }
  };

  const unlockImport = async () => {
    if (!encryptedFile) return;
    setWorking(true);
    try {
      const plainText = await decryptBackup(encryptedFile, importPassword);
      setImportPasswordOpen(false);
      setEncryptedFile(null);
      setImportPassword('');
      preparePlainImport(plainText, true);
    } catch (error) {
      show(error instanceof Error ? error.message : 'The backup could not be opened', 'info');
    } finally {
      setWorking(false);
    }
  };

  const restore = () => {
    if (!pendingImport) return;
    if (!storage.importAll(pendingImport.plainText)) {
      show('The backup could not be restored', 'info');
      return;
    }
    setPendingImport(null);
    show('Backup restored', 'success');
    navigate('/app', { replace: true });
  };

  return (
    <div className="mx-auto max-w-4xl px-5 py-8 md:px-8 md:py-10">
      <header className="mb-7">
        <p className="text-xs font-semibold uppercase tracking-wider text-olive-primary">Backup & restore</p>
        <h1 className="mt-1 text-2xl font-bold text-ink md:text-3xl">Keep a copy you control</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-soft">
          Backups are created on this device. Aequimens does not upload them or store your password.
        </p>
      </header>

      <div className="grid gap-5 md:grid-cols-2">
        <section className="premium-card p-6">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-olive-tint text-olive-primary">
            <Icon name="FileLock2" size={21} />
          </span>
          <h2 className="mt-4 text-lg font-bold text-ink">Password-protected backup</h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">
            Recommended for journal entries and private reflections. You will need the password to restore it.
          </p>
          <button onClick={() => setExportOpen(true)} className="btn-primary mt-5 w-full text-sm">
            <Icon name="Lock" size={17} /> Create protected backup
          </button>
        </section>

        <section className="premium-card p-6">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-silver-light text-olive-deep">
            <Icon name="Download" size={21} />
          </span>
          <h2 className="mt-4 text-lg font-bold text-ink">Standard backup</h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">
            A readable JSON file for quick transfer. Anyone with the file can view its contents.
          </p>
          <button onClick={exportPlain} className="btn-secondary mt-5 w-full text-sm">
            <Icon name="Download" size={17} /> Download standard backup
          </button>
        </section>
      </div>

      <section className="mt-5 rounded-3xl border border-silver bg-gradient-to-br from-white via-white to-olive-tint/45 p-6 shadow-soft">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-olive-tint text-olive-primary">
              <Icon name="Upload" size={21} />
            </span>
            <div>
              <h2 className="text-lg font-bold text-ink">Restore from a backup</h2>
              <p className="mt-1 max-w-xl text-sm leading-relaxed text-ink-soft">
                A preview appears before anything is restored. Existing Aequimens data with matching storage sections will be replaced.
              </p>
            </div>
          </div>
          <button onClick={() => inputRef.current?.click()} className="btn-secondary shrink-0 text-sm">
            Choose file
          </button>
          <input
            ref={inputRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void handleFile(file);
              event.target.value = '';
            }}
          />
        </div>
      </section>

      <div className="mt-5 rounded-2xl border border-silver/70 bg-silver-light/35 p-4 text-xs leading-relaxed text-ink-soft">
        <strong className="text-ink">Important:</strong> Aequimens cannot recover a forgotten backup password. Keep the file and password separately.
      </div>

      <Modal open={exportOpen} onClose={() => setExportOpen(false)} title="Protect this backup" size="md">
        <div className="space-y-4">
          <p className="text-sm leading-relaxed text-ink-soft">Use a password you can remember. It is never stored by Aequimens.</p>
          <label className="block text-sm font-medium text-ink">
            Password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="new-password"
              className="mt-1.5 w-full rounded-2xl border border-silver bg-white px-4 py-3 text-sm text-ink focus:border-olive-primary focus:outline-none"
            />
          </label>
          <label className="block text-sm font-medium text-ink">
            Confirm password
            <input
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              autoComplete="new-password"
              className="mt-1.5 w-full rounded-2xl border border-silver bg-white px-4 py-3 text-sm text-ink focus:border-olive-primary focus:outline-none"
            />
          </label>
          <button disabled={working} onClick={() => void exportEncrypted()} className="btn-primary w-full text-sm">
            {working ? 'Preparing backup…' : 'Download protected backup'}
          </button>
        </div>
      </Modal>

      <Modal open={importPasswordOpen} onClose={() => setImportPasswordOpen(false)} title="Open protected backup" size="md">
        <div className="space-y-4">
          <p className="text-sm text-ink-soft">Enter the password used when this backup was created.</p>
          <input
            type="password"
            value={importPassword}
            onChange={(event) => setImportPassword(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') void unlockImport();
            }}
            autoFocus
            className="w-full rounded-2xl border border-silver bg-white px-4 py-3 text-sm text-ink focus:border-olive-primary focus:outline-none"
          />
          <button disabled={working || !importPassword} onClick={() => void unlockImport()} className="btn-primary w-full text-sm">
            {working ? 'Opening…' : 'Continue'}
          </button>
        </div>
      </Modal>

      <Modal open={Boolean(pendingImport)} onClose={() => setPendingImport(null)} title="Review backup" size="md">
        {pendingImport && (
          <div>
            <div className="rounded-2xl border border-silver bg-silver-light/35 p-4">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm text-ink-soft">Protection</span>
                <span className="text-sm font-semibold text-ink">{pendingImport.summary.encrypted ? 'Password protected' : 'Standard file'}</span>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-3">
                {[
                  ['Check-ins', pendingImport.summary.counts.checkIns],
                  ['Journal entries', pendingImport.summary.counts.journalEntries],
                  ['Habits', pendingImport.summary.counts.habits],
                  ['Goals', pendingImport.summary.counts.goals],
                  ['Routines', pendingImport.summary.counts.routines],
                ].map(([label, value]) => (
                  <div key={String(label)} className="rounded-xl bg-white p-3">
                    <p className="text-[11px] text-ink-soft">{label}</p>
                    <p className="mt-1 text-lg font-bold text-ink">{value}</p>
                  </div>
                ))}
              </div>
            </div>
            <p className="mt-4 text-xs leading-relaxed text-ink-soft">Only Aequimens-owned storage is restored. Other browser data is untouched.</p>
            <div className="mt-5 flex gap-3">
              <button onClick={() => setPendingImport(null)} className="btn-secondary flex-1 text-sm">Cancel</button>
              <button onClick={restore} className="btn-primary flex-1 text-sm">Restore backup</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
