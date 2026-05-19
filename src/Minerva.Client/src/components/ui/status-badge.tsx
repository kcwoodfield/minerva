import { cn } from '@/lib/utils';

type Status = 'unread' | 'reading' | 'finished';

const STATUS_DOT: Record<Status, string> = {
  reading:  '#4A7BA7',
  finished: '#5C7A4F',
  unread:   '#9C9789',
};

const STATUS_LABEL: Record<Status, string> = {
  reading:  'Reading',
  finished: 'Finished',
  unread:   'Unread',
};

export function getStatus(completed: number): Status {
  if (completed >= 100) return 'finished';
  if (completed > 0) return 'reading';
  return 'unread';
}

interface StatusBadgeProps {
  completed: number;
  className?: string;
}

export function StatusBadge({ completed, className }: StatusBadgeProps) {
  const status = getStatus(completed);
  return (
    <span className={cn('inline-flex items-center gap-2 font-serif text-caption italic text-ink-mute', className)}>
      <span
        className="inline-block rounded-full"
        style={{ width: 6, height: 6, background: STATUS_DOT[status], flexShrink: 0 }}
      />
      {STATUS_LABEL[status]}
    </span>
  );
}

export function ArchivedBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center font-serif text-caption italic text-ink-faint',
        className,
      )}
    >
      Archived
    </span>
  );
}
