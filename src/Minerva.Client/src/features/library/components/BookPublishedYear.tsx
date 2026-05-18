import { formatPublicationYear } from '../lib/formatPublicationYear';

interface Props {
  publicationDate?: string;
  className?: string;
}

export function BookPublishedYear({ publicationDate, className = 't-meta truncate' }: Props) {
  const year = formatPublicationYear(publicationDate);
  if (!year) return null;

  return (
    <div className={className} style={{ marginTop: 2 }}>
      {year}
    </div>
  );
}
