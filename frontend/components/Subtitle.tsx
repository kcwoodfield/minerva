'use client';

import { Text, useColorModeValue } from '@chakra-ui/react';
import { useEffect, useState } from 'react';

const subtitles = [
  'A Library Worth the Gods',
  'Read Like a God',
  'The Moonlit Library of Thought',
  'A Labyrinth of Pages'
];

export default function Subtitle() {
  const [subtitle, setSubtitle] = useState('');
  const mutedColor = useColorModeValue('gray.600', 'gray.400');
  const hoverColor = useColorModeValue('gray.800', 'gray.200');

  const getRandomSubtitle = () => {
    const randomIndex = Math.floor(Math.random() * subtitles.length);
    return subtitles[randomIndex];
  };

  useEffect(() => {
    setSubtitle(getRandomSubtitle());
  }, []);

  return (
    <Text
      fontSize="1rem"
      letterSpacing="0.025em"
      mt={-0.5}
      color={mutedColor}
      transition="all 0.2s ease"
      _hover={{
        opacity: 0.8,
        transform: 'scale(1.02)',
        color: hoverColor
      }}
    >
      {subtitle}
    </Text>
  );
}