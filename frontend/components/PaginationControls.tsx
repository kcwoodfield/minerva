import { HStack, Button, Text, useColorModeValue } from '@chakra-ui/react';
import { ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons';

interface PaginationControlsProps {
  page: number;
  totalPages: number;
  onPageChange: (newPage: number) => void;
}

export default function PaginationControls({ page, totalPages, onPageChange }: PaginationControlsProps) {
  const buttonBg = useColorModeValue('gray.100', 'gray.700');
  const buttonHoverBg = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.600', 'gray.400');

  return (
    <HStack spacing={4}>
      <Button
        size="sm"
        leftIcon={<ChevronLeftIcon />}
        onClick={() => onPageChange(page - 1)}
        isDisabled={page === 1}
        bg={buttonBg}
        _hover={{ bg: buttonHoverBg }}
      >
        Previous
      </Button>

      <Text color={textColor}>
        Page {page} of {totalPages}
      </Text>

      <Button
        size="sm"
        rightIcon={<ChevronRightIcon />}
        onClick={() => onPageChange(page + 1)}
        isDisabled={page === totalPages}
        bg={buttonBg}
        _hover={{ bg: buttonHoverBg }}
      >
        Next
      </Button>
    </HStack>
  );
}