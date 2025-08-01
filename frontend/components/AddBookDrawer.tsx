"use client"

import React from 'react';
import {
    Drawer,
    DrawerOverlay,
    DrawerContent,
    DrawerHeader,
    DrawerBody,
    DrawerCloseButton,
    Button,
    FormControl,
    FormLabel,
    Input,
    useColorModeValue,
    NumberInput,
    NumberInputField,
    NumberInputStepper,
    NumberIncrementStepper,
    NumberDecrementStepper,
    Grid,
    GridItem,
    HStack,
    Image,
    useColorMode,
    useToast,
    Box,
} from '@chakra-ui/react';
import { Book } from '@/types/book';

interface AddBookDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (book: Omit<Book, 'id' | 'date_added'>) => void;
}

const AddBookDrawer: React.FC<AddBookDrawerProps> = ({ isOpen, onClose, onSave }) => {
    const { colorMode } = useColorMode();
    const [title, setTitle] = React.useState('');
    const [author, setAuthor] = React.useState('');
    const [isbn13, setIsbn13] = React.useState('');
    const [isbn10, setIsbn10] = React.useState('');
    const [publisher, setPublisher] = React.useState('');
    const [publicationDate, setPublicationDate] = React.useState('');
    const [genre, setGenre] = React.useState('');
    const [subGenre, setSubGenre] = React.useState('');
    const [summary, setSummary] = React.useState('');
    const [tags, setTags] = React.useState('');
    const [review, setReview] = React.useState('');
    const [pages, setPages] = React.useState(0);
    const [completion, setCompletion] = React.useState(0);
    const toast = useToast();

    const buttonHoverBg = useColorModeValue('blue.600', 'blue.300');
    const drawerBg = useColorModeValue('white', 'gray.800');

    const handleSubmit = async () => {
        try {
            const bookData: Omit<Book, 'id' | 'date_added'> = {
                title,
                author,
                isbn_13: isbn13,
                isbn_10: isbn10 || undefined,
                publisher: publisher || undefined,
                publication_date: publicationDate || undefined,
                genre: genre || undefined,
                sub_genre: subGenre || undefined,
                summary: summary || undefined,
                tags: tags ? tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [],
                review: review || undefined,
                pages,
                completed: completion,
                rating: 0,
                language: undefined,
                format: undefined,
                edition: undefined,
                cover_image_url: undefined
            };

            await onSave(bookData);

            // Reset form
            setTitle('');
            setAuthor('');
            setIsbn13('');
            setIsbn10('');
            setPublisher('');
            setPublicationDate('');
            setGenre('');
            setSubGenre('');
            setSummary('');
            setTags('');
            setReview('');
            setPages(0);
            setCompletion(0);

            // Close drawer
            onClose();

            // Show success message
            toast({
                title: 'Book created',
                description: `${bookData.title} has been added to your library`,
                status: 'success',
                duration: 3000,
                isClosable: true,
            });
        } catch (error) {
            console.error('Error creating book:', error);
            toast({
                title: 'Error creating book',
                description: error instanceof Error ? error.message : 'An error occurred',
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
        }
    };

    return (
        <Drawer
            isOpen={isOpen}
            placement="right"
            onClose={onClose}
            size="xl"
        >
            <DrawerOverlay />
            <DrawerContent bg={drawerBg}>
                <DrawerHeader borderBottomWidth="1px">
                    <HStack spacing={3}>
                        <Image
                            src={colorMode === 'dark' ? '/logo/minerva-logo-dark.png' : '/logo/minerva-logo.png'}
                            alt="Minerva Logo"
                            boxSize="32px"
                            objectFit="contain"
                        />
                        <span>Add New Book</span>
                    </HStack>
                </DrawerHeader>
                <DrawerCloseButton />
                <DrawerBody py={6}>
                    <Grid templateColumns="repeat(3, 1fr)" gap={4}>
                        <GridItem>
                            <FormControl isRequired>
                                <FormLabel>Title</FormLabel>
                                <Input
                                    placeholder="Enter book title"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                />
                            </FormControl>
                        </GridItem>

                        <GridItem>
                            <FormControl isRequired>
                                <FormLabel>Author</FormLabel>
                                <Input
                                    placeholder="Enter author name"
                                    value={author}
                                    onChange={(e) => setAuthor(e.target.value)}
                                />
                            </FormControl>
                        </GridItem>

                        <GridItem>
                            <FormControl isRequired>
                                <FormLabel>ISBN-13</FormLabel>
                                <Input
                                    placeholder="Enter ISBN-13"
                                    value={isbn13}
                                    onChange={(e) => setIsbn13(e.target.value)}
                                />
                            </FormControl>
                        </GridItem>

                        <GridItem>
                            <FormControl>
                                <FormLabel>ISBN-10</FormLabel>
                                <Input
                                    placeholder="Enter ISBN-10"
                                    value={isbn10}
                                    onChange={(e) => setIsbn10(e.target.value)}
                                />
                            </FormControl>
                        </GridItem>

                        <GridItem>
                            <FormControl>
                                <FormLabel>Publisher</FormLabel>
                                <Input
                                    placeholder="Enter publisher name"
                                    value={publisher}
                                    onChange={(e) => setPublisher(e.target.value)}
                                />
                            </FormControl>
                        </GridItem>

                        <GridItem>
                            <FormControl>
                                <FormLabel>Publication Date</FormLabel>
                                <Input
                                    type="date"
                                    value={publicationDate}
                                    onChange={(e) => setPublicationDate(e.target.value)}
                                />
                            </FormControl>
                        </GridItem>

                        <GridItem>
                            <FormControl>
                                <FormLabel>Genre</FormLabel>
                                <Input
                                    placeholder="Enter genre"
                                    value={genre}
                                    onChange={(e) => setGenre(e.target.value)}
                                />
                            </FormControl>
                        </GridItem>

                        <GridItem>
                            <FormControl>
                                <FormLabel>Sub-Genre</FormLabel>
                                <Input
                                    placeholder="Enter sub-genre"
                                    value={subGenre}
                                    onChange={(e) => setSubGenre(e.target.value)}
                                />
                            </FormControl>
                        </GridItem>

                        <GridItem>
                            <FormControl isRequired>
                                <FormLabel>Pages</FormLabel>
                                <NumberInput
                                    value={pages}
                                    onChange={(_, value) => setPages(value)}
                                    min={0}
                                >
                                    <NumberInputField />
                                    <NumberInputStepper>
                                        <NumberIncrementStepper />
                                        <NumberDecrementStepper />
                                    </NumberInputStepper>
                                </NumberInput>
                            </FormControl>
                        </GridItem>

                        <GridItem colSpan={3}>
                            <FormControl>
                                <FormLabel>Summary</FormLabel>
                                <Input
                                    as="textarea"
                                    rows={4}
                                    resize="vertical"
                                    placeholder="Enter book summary"
                                    value={summary}
                                    onChange={(e) => setSummary(e.target.value)}
                                />
                            </FormControl>
                        </GridItem>

                        <GridItem colSpan={3}>
                            <FormControl>
                                <FormLabel>Tags (comma separated)</FormLabel>
                                <Input
                                    placeholder="Enter tags separated by commas"
                                    value={tags}
                                    onChange={(e) => setTags(e.target.value)}
                                />
                            </FormControl>
                        </GridItem>

                        <GridItem colSpan={3}>
                            <FormControl>
                                <FormLabel>Review</FormLabel>
                                <Input
                                    as="textarea"
                                    rows={4}
                                    resize="vertical"
                                    placeholder="Enter your review"
                                    value={review}
                                    onChange={(e) => setReview(e.target.value)}
                                />
                            </FormControl>
                        </GridItem>

                        <GridItem colSpan={3}>
                            <Box display="flex" justifyContent="flex-end" gap={2} mt={4}>
                                <Button variant="outline" onClick={onClose}>
                                    Cancel
                                </Button>
                                <Button
                                    colorScheme="blue"
                                    onClick={handleSubmit}
                                    _hover={{ bg: buttonHoverBg }}
                                >
                                    Add Book
                                </Button>
                            </Box>
                        </GridItem>
                    </Grid>
                </DrawerBody>
            </DrawerContent>
        </Drawer>
    );
};

export default AddBookDrawer;