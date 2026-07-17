import { Modal } from './Modal';
import { Icon } from './Icon';

interface ConfirmationDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmationDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  destructive = false,
  onConfirm,
  onCancel,
}: ConfirmationDialogProps) {
  return (
    <Modal open={open} onClose={onCancel} size="sm">
      <div className="flex flex-col items-center text-center">
        <div
          className={`mb-4 flex h-12 w-12 items-center justify-center rounded-2xl ${
            destructive ? 'bg-olive-tint text-olive-deep' : 'bg-silver-light text-olive-primary'
          }`}
        >
          <Icon name={destructive ? 'AlertTriangle' : 'Info'} size={22} />
        </div>
        <h2 className="mb-2 text-lg font-semibold text-ink">{title}</h2>
        <p className="mb-6 text-sm leading-relaxed text-ink-soft">{message}</p>
        <div className="flex w-full flex-col gap-2.5 sm:flex-row-reverse">
          <button
            onClick={onConfirm}
            className={
              destructive
                ? 'w-full rounded-2xl bg-olive-deep px-5 py-3 font-semibold text-white transition-all hover:brightness-110'
                : 'btn-primary w-full'
            }
          >
            {confirmLabel}
          </button>
          <button onClick={onCancel} className="btn-secondary w-full">
            {cancelLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
}
