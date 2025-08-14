import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Box,
  useColorModeValue,
  IconButton,
  Tooltip,
} from '@chakra-ui/react';
import { Book } from '@/types/book';
import { ChevronUpIcon, ChevronDownIcon, CloseIcon } from '@chakra-ui/icons';

interface BookTableProps {
  books: Book[];
  onBookClick: (book: Book) => void;
  onSort: (key: keyof Book) => void;
  sortConfig: { key: keyof Book; direction: 'asc' | 'desc' } | null;
  hasFilters: boolean;
  onClearFilters: () => void;
}

export default function BookTable({ books, onBookClick, onSort, sortConfig, hasFilters, onClearFilters }: BookTableProps) {
  const columns: { key: keyof Book; label: string; width: string }[] = [
    { key: 'title', label: 'Title', width: '250px' },
    { key: 'author', label: 'Author', width: '150px' },
    { key: 'genre', label: 'Genre', width: '120px' },
    { key: 'pages', label: 'Pages', width: '80px' },
    { key: 'rating', label: 'Rating', width: '80px' },
    { key: 'completed', label: 'Progress', width: '100px' },
    { key: 'publisher', label: 'Publisher', width: '120px' },
    { key: 'format', label: 'Format', width: '100px' },
    { key: 'date_added', label: 'Added', width: '100px' },
  ];

  const hoverBg = useColorModeValue('gray.50', 'gray.700');
  const bgColor = useColorModeValue('transparent', 'gray.800');
  const headerHoverBg = useColorModeValue('gray.100', 'gray.600');

  return (
    <Box
      bg={bgColor}
      borderRadius="md"
      boxShadow="sm"
      overflow="hidden"
      pb={4}
      mt={6}
    >

      <Table>
        <Thead>
          <Tr>
            {columns.map(col => (
              <Th
                key={col.key}
                fontWeight="600"
                fontSize="0.875rem"
                py={3}
                px={4}
                letterSpacing="0.025em"
                borderBottom="none"
                width={col.width}
                minWidth={col.width}
                maxWidth={col.width}
                cursor="pointer"
                onClick={() => onSort(col.key)}
                _hover={{ bg: headerHoverBg }}
                position="relative"
              >
                <Box display="flex" alignItems="center" gap={2}>
                  {col.label}
                  {sortConfig?.key === col.key && (
                    sortConfig.direction === 'asc' ? <ChevronUpIcon /> : <ChevronDownIcon />
                  )}
                </Box>
              </Th>
            ))}
          </Tr>
        </Thead>
        <Tbody>
          {books.map(book => (
            <Tr
              key={book.id}
              onClick={() => onBookClick(book)}
              cursor="pointer"
              _hover={{
                bg: hoverBg,
                transition: 'background-color 0.2s ease'
              }}
            >
              <Td
                fontWeight="medium"
                borderBottom="none"
                maxWidth="250px"
                whiteSpace="nowrap"
                overflow="hidden"
                textOverflow="ellipsis"
                fontSize="1rem"
                py={3}
                px={4}
              >
                {book.title}
              </Td>
              <Td borderBottom="none" fontSize="1rem" py={3} px={4} maxWidth="150px" whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis">
                {book.author}
              </Td>
              <Td display={{ base: 'none', lg: 'table-cell' }} borderBottom="none" fontSize="1rem" py={3} px={4} maxWidth="120px" whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis">
                {book.genre || '-'}
              </Td>
              <Td display={{ base: 'none', md: 'table-cell' }} borderBottom="none" fontSize="1rem" py={3} px={4}>
                {book.pages}
              </Td>
              <Td display={{ base: 'none', md: 'table-cell' }} borderBottom="none" fontSize="1rem" py={3} px={4}>
                {book.rating ? `${book.rating}/5` : '-'}
              </Td>
              <Td display={{ base: 'none', md: 'table-cell' }} borderBottom="none" fontSize="1rem" py={3} px={4}>
                {book.completed === 0 ? 'Not Started' :
                 book.completed === 100 ? 'Completed' :
                 `In Progress (${book.completed}%)`}
              </Td>
              <Td display={{ base: 'none', xl: 'table-cell' }} borderBottom="none" fontSize="1rem" py={3} px={4} maxWidth="120px" whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis">
                {book.publisher || '-'}
              </Td>
              <Td display={{ base: 'none', xl: 'table-cell' }} borderBottom="none" fontSize="1rem" py={3} px={4} maxWidth="100px" whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis">
                {book.format || '-'}
              </Td>
              <Td display={{ base: 'none', lg: 'table-cell' }} borderBottom="none" fontSize="1rem" py={3} px={4}>
                {new Date(book.date_added).toLocaleDateString()}
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  );
}