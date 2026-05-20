import { useEffect, useState } from 'react';
import { Moon, Settings, Upload } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface SettingsMenuProps {
  onNavigate: (page: 'upload') => void;
  className?: string;
}

export function SettingsMenu({ onNavigate, className }: SettingsMenuProps) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const isDark = mounted && resolvedTheme === 'dark';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className={cn('text-ink-mute hover:text-ink', className)}
            aria-label="Settings"
          />
        }
      >
        <Settings className="size-[18px]" strokeWidth={1.75} />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-44 font-serif">
        <DropdownMenuCheckboxItem
          checked={isDark}
          onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
          onSelect={(e) => e.preventDefault()}
        >
          <Moon className="size-4 text-ink-mute" />
          Dark mode
        </DropdownMenuCheckboxItem>
        <DropdownMenuItem
          onSelect={() => onNavigate('upload')}
        >
          <Upload className="size-4 text-ink-mute" />
          Bulk upload
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
