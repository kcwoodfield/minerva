'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { IconButton, Tooltip, Container, Text, useColorMode } from '@chakra-ui/react';
import { SunIcon, MoonIcon } from '@chakra-ui/icons';

function ThemeToggleContent() {
  const { colorMode, toggleColorMode } = useColorMode();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <Tooltip label={colorMode === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}>
      <IconButton
        aria-label="Toggle theme"
        icon={colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
        onClick={toggleColorMode}
        variant="ghost"
        size="lg"
      />
    </Tooltip>
  );
}

export default function ThemeToggle() {
  return (
    <Container maxW="container.xl" py={4}>
      <ThemeToggleContent />
    </Container>
  );
}