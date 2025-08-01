'use client';

import { useState, useRef } from 'react';
import {
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerBody,
  DrawerCloseButton,
  Button,
  Text,
  Box,
  Grid,
  GridItem,
  IconButton,
  useColorModeValue,
  useToast,
  Image as ChakraImage,
  HStack,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  VStack,
} from '@chakra-ui/react';
import { DeleteIcon, EditIcon, StarIcon } from '@chakra-ui/icons';
import { Book } from '@/types/book';
import Image from 'next/image';

interface BookDetailsDrawerProps {
  book: Book;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (book: Book) => void;
  onDelete: (bookId: string) => void;
}

export default function BookDetailsDrawer({ book, isOpen, onClose, onEdit, onDelete }: BookDetailsDrawerProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const toast = useToast();
  const bgColor = useColorModeValue('white', 'gray.800');

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(book.id);
      onClose();
    } catch (error) {
      toast({
        title: 'Error deleting book',
        description: error instanceof Error ? error.message : 'An error occurred',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Drawer
        isOpen={isOpen}
        placement="right"
        onClose={onClose}
        size="xl"
      >
        <DrawerOverlay />
        <DrawerContent bg={bgColor}>
          <DrawerHeader borderBottomWidth="1px">
            <Text fontSize="2xl" fontFamily="Lora">{book.title}</Text>
            {book.subtitle && (
              <Text fontSize="lg" fontFamily="Lora" color="gray.600">{book.subtitle}</Text>
            )}
            {book.rating !== undefined && book.rating !== null && (
              <HStack spacing={1} mt={2}>
                {[...Array(5)].map((_, index) => (
                  <StarIcon
                    key={index}
                    color={index < book.rating! ? "yellow.400" : "gray.200"}
                  />
                ))}
                <Text fontFamily="Lora" ml={2}>({book.rating}/5)</Text>
              </HStack>
            )}
          </DrawerHeader>
          <DrawerCloseButton />
          <DrawerBody>
            <Grid templateColumns="repeat(2, 1fr)" gap={4}>
              <GridItem>
                <Text fontWeight="bold" fontFamily="Lora">Author</Text>
                <Text fontFamily="Lora">{book.author}</Text>
              </GridItem>
              {book.pages && (
                <GridItem>
                  <Text fontWeight="bold" fontFamily="Lora">Pages</Text>
                  <Text fontFamily="Lora">{book.pages}</Text>
                </GridItem>
              )}
              <GridItem>
                <Text fontWeight="bold" fontFamily="Lora">Progress</Text>
                <Text fontFamily="Lora">
                  {book.completed === 0 ? 'Not Started' :
                   book.completed === 100 ? 'Completed' :
                   `In Progress (${book.completed}%)`}
                </Text>
              </GridItem>
              {book.publisher && (
                <GridItem>
                  <Text fontWeight="bold" fontFamily="Lora">Publisher</Text>
                  <Text fontFamily="Lora">{book.publisher}</Text>
                </GridItem>
              )}
              {book.publication_date && (
                <GridItem>
                  <Text fontWeight="bold" fontFamily="Lora">Publication Date</Text>
                  <Text fontFamily="Lora">{book.publication_date}</Text>
                </GridItem>
              )}
              {book.genre && (
                <GridItem>
                  <Text fontWeight="bold" fontFamily="Lora">Genre</Text>
                  <Text fontFamily="Lora">{book.genre}</Text>
                </GridItem>
              )}
              {book.sub_genre && (
                <GridItem>
                  <Text fontWeight="bold" fontFamily="Lora">Sub-Genre</Text>
                  <Text fontFamily="Lora">{book.sub_genre}</Text>
                </GridItem>
              )}
              {book.language && (
                <GridItem>
                  <Text fontWeight="bold" fontFamily="Lora">Language</Text>
                  <Text fontFamily="Lora">{book.language}</Text>
                </GridItem>
              )}
              {book.format && (
                <GridItem>
                  <Text fontWeight="bold" fontFamily="Lora">Format</Text>
                  <Text fontFamily="Lora">{book.format}</Text>
                </GridItem>
              )}
              {book.edition && (
                <GridItem>
                  <Text fontWeight="bold" fontFamily="Lora">Edition</Text>
                  <Text fontFamily="Lora">{book.edition}</Text>
                </GridItem>
              )}
              {book.series_info && (
                <GridItem>
                  <Text fontWeight="bold" fontFamily="Lora">Series</Text>
                  <Text fontFamily="Lora">{book.series_info}</Text>
                </GridItem>
              )}
              <GridItem>
                <Text fontWeight="bold" fontFamily="Lora">Date Added</Text>
                <Text fontFamily="Lora">{new Date(book.date_added).toLocaleDateString()}</Text>
              </GridItem>
              {book.review && (
                <GridItem colSpan={2}>
                  <Text fontWeight="bold" fontFamily="Lora">Review</Text>
                  <Text fontFamily="Lora" whiteSpace="pre-wrap">{book.review}</Text>
                </GridItem>
              )}
              {book.summary && (
                <GridItem colSpan={2}>
                  <Text fontWeight="bold" fontFamily="Lora">Summary</Text>
                  <Text fontFamily="Lora" whiteSpace="pre-wrap">{book.summary}</Text>
                </GridItem>
              )}
            </Grid>
          </DrawerBody>
          <DrawerFooter borderTopWidth="1px">
            <IconButton
              aria-label="Edit book"
              icon={<EditIcon />}
              onClick={() => onEdit(book)}
              mr={3}
              variant="ghost"
            />
            <IconButton
              aria-label="Delete book"
              icon={<DeleteIcon />}
              onClick={() => setIsDeleteAlertOpen(true)}
              isLoading={isDeleting}
              colorScheme="red"
              variant="ghost"
              mr={3}
            />
            <Button onClick={onClose}>Close</Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      <AlertDialog
        isOpen={isDeleteAlertOpen}
        leastDestructiveRef={cancelRef}
        onClose={() => setIsDeleteAlertOpen(false)}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader>
              Delete Book
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to delete &ldquo;{book.title}&rdquo;? This action cannot be undone.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={() => setIsDeleteAlertOpen(false)}>
                Cancel
              </Button>
              <Button
                colorScheme="red"
                onClick={() => {
                  setIsDeleteAlertOpen(false);
                  handleDelete();
                }}
                ml={3}
                isLoading={isDeleting}
              >
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
}