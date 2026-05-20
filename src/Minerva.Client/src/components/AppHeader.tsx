import { useCallback, useEffect, useState, type MouseEvent } from 'react';
import { Menu, Plus } from 'lucide-react';
import { Logo } from '@/components/logo';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from '@/components/ui/sheet';
import { AddBookDrawer } from '@/features/library/components/AddBookDrawer';
import { cn } from '@/lib/utils';

export type AppPage = 'library' | 'insights' | 'upload';

const ADD_BOOK_SHORTCUT_KEY = 'b';

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;
  return target.isContentEditable;
}

function isAddBookShortcut(e: KeyboardEvent): boolean {
  if (e.altKey || e.shiftKey || e.key.toLowerCase() !== ADD_BOOK_SHORTCUT_KEY) return false;
  return e.metaKey || e.ctrlKey;
}

function NavLink({
  label,
  page,
  current,
  onClick,
  className,
}: {
  label: string;
  page: AppPage;
  current: AppPage;
  onClick: (p: AppPage) => void;
  className?: string;
}) {
  const active = page === current;
  const href =
    page === 'upload' ? '/upload' : page === 'insights' ? '#insights' : '#';
  return (
    <a
      href={href}
      onClick={(e) => {
        e.preventDefault();
        onClick(page);
      }}
      className={cn('font-serif text-sm transition-colors', className)}
      style={{
        color: active ? 'var(--color-ink)' : 'var(--color-ink-mute)',
        fontWeight: active ? 500 : 400,
        textDecoration: 'none',
        paddingBottom: 2,
        borderBottom: active ? '1px solid var(--color-ink)' : '1px solid transparent',
      }}
    >
      {label}
    </a>
  );
}

interface AppHeaderProps {
  page: AppPage;
  tagline: string;
  onNavigate: (page: AppPage) => void;
  onGoHome: (e: MouseEvent<HTMLAnchorElement>) => void;
  onTaglineClick: () => void;
}

export function AppHeader({
  page,
  tagline,
  onNavigate,
  onGoHome,
  onTaglineClick,
}: AppHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [addBookOpen, setAddBookOpen] = useState(false);

  const navigate = (p: AppPage) => {
    onNavigate(p);
    setMenuOpen(false);
  };

  const openAddBook = useCallback(() => {
    setMenuOpen(false);
    setAddBookOpen(true);
  }, []);

  useEffect(() => {
    if (page !== 'library') return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (!isAddBookShortcut(e) || isEditableTarget(e.target)) return;
      e.preventDefault();
      openAddBook();
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [page, openAddBook]);

  return (
    <header className="border-b border-rule-soft bg-cream">
      <div className="flex items-center justify-between gap-3 px-4 py-4 md:px-page-x md:py-5">
        <div className="flex min-w-0 flex-1 items-center gap-3 md:gap-5">
          <div className="flex min-w-0 items-center gap-2">
            <a href="/" onClick={onGoHome} className="shrink-0" style={{ textDecoration: 'none' }}>
              <Logo size="lg" />
            </a>
            <div className="min-w-0">
              <a href="/" onClick={onGoHome} style={{ textDecoration: 'none' }}>
                <h1
                  className="font-display font-semibold text-ink leading-none truncate"
                  style={{ fontSize: 22, letterSpacing: '-0.01em' }}
                >
                  Minerva
                </h1>
              </a>
              <button
                type="button"
                onClick={onTaglineClick}
                className="hidden font-serif italic text-ink-mute cursor-pointer text-left transition-colors hover:text-ink sm:block"
                style={{ fontSize: 12, marginTop: 2, background: 'none', border: 'none', padding: 0 }}
                title="Another thought"
              >
                <span className="line-clamp-1">{tagline}</span>
              </button>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-4" style={{ marginLeft: 8 }}>
            <NavLink label="Library" page="library" current={page} onClick={navigate} />
            <NavLink label="Upload" page="upload" current={page} onClick={navigate} />
            <NavLink label="Insights" page="insights" current={page} onClick={navigate} />
          </nav>
        </div>

        <div className="hidden md:flex items-center gap-1 shrink-0">
          <ThemeToggle />
          {page === 'library' && (
            <Button type="button" onClick={openAddBook} aria-keyshortcuts="Meta+B">
              <Plus className="size-[15px]" />
              Add Book
            </Button>
          )}
        </div>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="md:hidden shrink-0 text-ink-mute hover:text-ink"
          aria-label="Open menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(true)}
        >
          <Menu className="size-5" strokeWidth={1.75} />
        </Button>
      </div>

      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetContent side="left" className="w-[min(100%,300px)] border-r border-rule p-0">
          <div className="flex flex-col h-full">
            <div className="border-b border-rule-soft px-6 pt-8 pb-5 pr-14">
              <p className="t-eyebrow mb-1">Navigation</p>
              <SheetTitle
                className="font-display font-semibold text-ink"
                style={{ fontSize: 22, letterSpacing: '-0.01em' }}
              >
                Minerva
              </SheetTitle>
              <SheetDescription className="sr-only">
                Main navigation and app actions
              </SheetDescription>
              <p className="mt-2 font-serif italic text-ink-mute text-[13px] leading-snug">
                {tagline}
              </p>
            </div>

            <nav className="flex flex-col gap-1 px-4 py-4" aria-label="Main">
              {(
                [
                  ['library', 'Library'],
                  ['upload', 'Upload'],
                  ['insights', 'Insights'],
                ] as const
              ).map(([p, label]) => {
                const active = page === p;
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => navigate(p)}
                    className={cn(
                      'rounded-sm px-3 py-3 text-left font-serif text-[15px] transition-colors',
                      active
                        ? 'bg-cream-warm text-ink font-medium'
                        : 'text-ink-mute hover:bg-cream-warm hover:text-ink',
                    )}
                  >
                    {label}
                  </button>
                );
              })}
            </nav>

            <div className="mt-auto border-t border-rule-soft px-4 py-5 space-y-4">
              <div className="flex items-center justify-between px-1">
                <span className="t-meta">Appearance</span>
                <ThemeToggle />
              </div>

              {page === 'library' && (
                <Button type="button" className="w-full" onClick={openAddBook}>
                  <Plus className="size-4" />
                  Add Book
                </Button>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {page === 'library' && (
        <AddBookDrawer
          open={addBookOpen}
          onOpenChange={setAddBookOpen}
          showTrigger={false}
        />
      )}
    </header>
  );
}
