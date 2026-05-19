import { useStats } from '../hooks/useLibrary';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: 40 }}>
      <p className="t-eyebrow" style={{ marginBottom: 16 }}>{title}</p>
      {children}
    </section>
  );
}

function StatCard({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1 border border-rule bg-paper" style={{ borderRadius: 8, padding: '20px 24px' }}>
      <span className="t-eyebrow">{label}</span>
      <span className="font-display font-semibold text-ink" style={{ fontSize: 32, lineHeight: 1.1, letterSpacing: '-0.02em' }}>
        {value}
      </span>
    </div>
  );
}

function MonthlyChart({ data }: { data: { month: string; count: number }[] }) {
  const max = Math.max(...data.map(d => d.count), 1);
  return (
    <div
      className="border border-rule bg-paper"
      style={{ borderRadius: 8, padding: '24px 24px 16px' }}
    >
      <div className="flex items-end gap-1" style={{ height: 100 }}>
        {data.map((d, i) => (
          <div key={i} className="flex flex-col items-center flex-1 gap-1.5" style={{ minWidth: 0 }}>
            <div
              className="w-full rounded-sm transition-all"
              style={{
                height: d.count > 0 ? `${Math.max((d.count / max) * 84, 4)}px` : '2px',
                background: d.count > 0 ? 'var(--color-ink)' : 'var(--color-rule)',
                opacity: d.count > 0 ? 0.25 + (d.count / max) * 0.65 : 1,
              }}
              title={`${d.month}: ${d.count}`}
            />
            <span
              className="font-sans text-ink-faint truncate w-full text-center"
              style={{ fontSize: 10, letterSpacing: '0.04em' }}
            >
              {d.month}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function BarList({ items, max }: { items: { name: string; count: number }[]; max: number }) {
  if (items.length === 0) {
    return <p className="font-serif italic text-ink-faint" style={{ fontSize: 14 }}>No data yet</p>;
  }
  return (
    <div className="flex flex-col gap-2.5">
      {items.map((item) => (
        <div key={item.name} className="flex items-center gap-3">
          <span className="font-serif text-ink shrink-0" style={{ fontSize: 14, width: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {item.name}
          </span>
          <div className="flex-1 flex items-center gap-2">
            <div className="flex-1 h-1.5 bg-rule rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-ink/40"
                style={{ width: `${(item.count / max) * 100}%` }}
              />
            </div>
            <span className="t-meta tabular-nums shrink-0" style={{ fontSize: 12, width: 20, textAlign: 'right' }}>
              {item.count}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

function FictionSplit({ fiction, nonFiction }: { fiction: number; nonFiction: number }) {
  const total = fiction + nonFiction;
  if (total === 0) {
    return <p className="font-serif italic text-ink-faint" style={{ fontSize: 14 }}>No data yet</p>;
  }
  const fPct = Math.round((fiction / total) * 100);
  const nfPct = 100 - fPct;
  return (
    <div className="flex flex-col gap-3">
      <div className="flex h-3 w-full overflow-hidden rounded-full">
        {fiction > 0 && (
          <div className="h-full bg-ink/50" style={{ width: `${fPct}%` }} title={`Fiction: ${fiction}`} />
        )}
        {nonFiction > 0 && (
          <div className="h-full bg-ink/15" style={{ width: `${nfPct}%` }} title={`Non-fiction: ${nonFiction}`} />
        )}
      </div>
      <div className="flex gap-5">
        <div className="flex items-center gap-2">
          <div className="h-2.5 w-2.5 rounded-full bg-ink/50 shrink-0" />
          <span className="font-serif text-ink-mute" style={{ fontSize: 13 }}>Fiction — {fiction}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2.5 w-2.5 rounded-full bg-ink/15 border border-rule shrink-0" />
          <span className="font-serif text-ink-mute" style={{ fontSize: 13 }}>Non-fiction — {nonFiction}</span>
        </div>
      </div>
    </div>
  );
}

export function InsightsPage() {
  const { data, isLoading } = useStats();

  const dash = '—';
  const pagesDisplay = isLoading ? dash : (data?.totalPagesRead ?? 0).toLocaleString();

  return (
    <main className="px-4 md:px-page-x" style={{ maxWidth: 900, margin: '0 auto', paddingBottom: 64 }}>

      {/* Hero */}
      <div className="text-center" style={{ paddingTop: 48, paddingBottom: 44 }}>
        <p className="t-eyebrow" style={{ marginBottom: 14 }}>Pages read</p>
        <p
          className="font-display font-semibold text-ink"
          style={{ fontSize: 88, lineHeight: 1, letterSpacing: '-0.04em' }}
        >
          {pagesDisplay}
        </p>
      </div>

      {/* Snapshot cards */}
      <Section title="At a glance">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <StatCard label="Currently reading" value={isLoading ? dash : (data?.totalReading ?? 0)} />
          <StatCard label="Volumes finished" value={isLoading ? dash : (data?.totalFinished ?? 0)} />
          <StatCard label="Total in library" value={isLoading ? dash : (data?.totalBooks ?? 0)} />
          <StatCard label="Average rating" value={isLoading ? dash : data?.averageRating ? `${data.averageRating} / 5` : dash} />
          <StatCard label="Added this year" value={isLoading ? dash : (data?.booksThisYear ?? 0)} />
        </div>
      </Section>

      {/* Activity chart */}
      <Section title="Books added — last 12 months">
        {isLoading
          ? <div className="border border-rule bg-paper rounded-lg" style={{ height: 148 }} />
          : <MonthlyChart data={data?.booksByMonth ?? []} />
        }
      </Section>

      {/* Genre + Fiction split */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8" style={{ marginBottom: 40 }}>
        <Section title="Top genres">
          {isLoading
            ? <p className="font-serif italic text-ink-faint" style={{ fontSize: 14 }}>Loading…</p>
            : <BarList items={data?.topGenres ?? []} max={Math.max(...(data?.topGenres ?? []).map(g => g.count), 1)} />
          }
        </Section>

        <Section title="Fiction vs Non-fiction">
          {isLoading
            ? <p className="font-serif italic text-ink-faint" style={{ fontSize: 14 }}>Loading…</p>
            : <FictionSplit fiction={data?.fictionCount ?? 0} nonFiction={data?.nonFictionCount ?? 0} />
          }
        </Section>
      </div>

      {/* Top authors */}
      {!isLoading && (data?.topAuthors ?? []).length > 0 && (
        <Section title="Authors you return to">
          <BarList items={data!.topAuthors} max={Math.max(...data!.topAuthors.map(a => a.count), 1)} />
        </Section>
      )}

    </main>
  );
}
