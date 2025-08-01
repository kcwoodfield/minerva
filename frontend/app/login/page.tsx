'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Container,
  Input,
  Button,
  VStack,
  Text,
  Alert,
  AlertIcon,
  FormControl,
  FormLabel,
  useColorModeValue,
} from '@chakra-ui/react';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const bgColor = useColorModeValue('white', 'gray.800');
  const buttonBg = useColorModeValue('blue.500', 'blue.200');
  const buttonColor = useColorModeValue('white', 'gray.800');
  const buttonHoverBg = useColorModeValue('blue.600', 'blue.300');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (data.success) {
        router.push('/');
        router.refresh();
      } else {
        setError('Invalid credentials');
      }
    } catch (err) {
      setError('An error occurred');
    }
  };

  return (
    <Container maxW="xs">
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        mt={8}
      >
        <Box
          bg={bgColor}
          p={8}
          borderRadius="md"
          boxShadow="lg"
          width="100%"
        >
          <VStack
            as="form"
            onSubmit={handleSubmit}
            spacing={4}
            width="100%"
          >
            <FormControl isRequired>
              <FormLabel>Username</FormLabel>
              <Input
              id="username"
              name="username"
              autoComplete="username"
              autoFocus
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Password</FormLabel>
              <Input
              type="password"
              id="password"
                name="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            </FormControl>

            {error && (
              <Alert status="error" mt={2}>
                <AlertIcon />
                {error}
              </Alert>
            )}

            <Button
              type="submit"
              width="100%"
              mt={4}
              mb={2}
              bg={buttonBg}
              color={buttonColor}
              _hover={{
                bg: buttonHoverBg
              }}
            >
              Sign In
            </Button>
          </VStack>
          </Box>
      </Box>
    </Container>
  );
}