import { useStats } from '../hooks/useLibrary';

function StatCard({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div
      className="flex flex-col gap-1 border border-rule bg-paper"
      style={{ borderRadius: 8, padding: '20px 24px' }}
    >
      <span className="t-eyebrow">{label}</span>
      <span className="font-display font-semibold text-ink" style={{ fontSize: 32, lineHeight: 1.1, letterSpacing: '-0.02em' }}>
        {value}
      </span>
    </div>
  );
}

function HeroStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center" style={{ paddingTop: 48, paddingBottom: 40 }}>
      <p className="t-eyebrow" style={{ marginBottom: 14 }}>{label}</p>
      <p
        className="font-display font-semibold text-ink"
        style={{ fontSize: 88, lineHeight: 1, letterSpacing: '-0.04em' }}
      >
        {value}
      </p>
    </div>
  );
}

export function InsightsPage() {
  const { data, isLoading } = useStats();

  const pagesDisplay = isLoading ? '—' : (data?.totalPagesRead ?? 0).toLocaleString();
  const finished     = isLoading ? '—' : String(data?.totalFinished ?? 0);
  const reading      = isLoading ? '—' : String(data?.totalReading ?? 0);
  const total        = isLoading ? '—' : String(data?.totalBooks ?? 0);
  const avgRating    = isLoading ? '—' : data?.averageRating ? `${data.averageRating} / 5` : '—';
  const thisYear     = isLoading ? '—' : String(data?.booksThisYear ?? 0);

  return (
    <main className="px-page-x" style={{ maxWidth: 860, margin: '0 auto' }}>
      <HeroStat label="Pages read" value={pagesDisplay} />

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3" style={{ paddingBottom: 48 }}>
        <StatCard label="Currently reading" value={reading} />
        <StatCard label="Volumes finished" value={finished} />
        <StatCard label="Total in library" value={total} />
        <StatCard label="Average rating" value={avgRating} />
        <StatCard label="Added this year" value={thisYear} />
      </div>
    </main>
  );
}
