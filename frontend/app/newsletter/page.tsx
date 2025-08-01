"use client";

import { useEffect, useState } from "react";
import {
  Box,
  Container,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Spinner,
  Alert,
  AlertIcon,
  Text,
} from "@chakra-ui/react";

interface NewsletterSubscriber {
  email: string;
  created_at: string;
}

export default function NewsletterPage() {
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSubscribers = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api"}/newsletter/list`
        );
        if (!res.ok) throw new Error("Failed to fetch subscribers");
        const data = await res.json();
        setSubscribers(data);
      } catch (err: any) {
        setError(err.message || "An error occurred");
      } finally {
        setLoading(false);
      }
    };
    fetchSubscribers();
  }, []);

  return (
    <Container maxW="container.md" py={8}>
      <Heading as="h1" mb={6} size="lg">
        Newsletter Subscribers
      </Heading>
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minH="200px">
          <Spinner size="xl" />
        </Box>
      ) : error ? (
        <Alert status="error" mb={4}>
          <AlertIcon />
          {error}
        </Alert>
      ) : subscribers.length === 0 ? (
        <Text>No subscribers found.</Text>
      ) : (
        <Box overflowX="auto">
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Email</Th>
                <Th>Signed Up</Th>
              </Tr>
            </Thead>
            <Tbody>
              {subscribers.map((sub) => (
                <Tr key={sub.email}>
                  <Td>{sub.email}</Td>
                  <Td>{new Date(sub.created_at).toLocaleString()}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      )}
    </Container>
  );
}