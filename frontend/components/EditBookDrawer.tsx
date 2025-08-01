import React from 'react';
import {
    Drawer,
    DrawerOverlay,
    DrawerContent,
    DrawerHeader,
    DrawerFooter,
    DrawerBody,
    DrawerCloseButton,
    Button,
    FormControl,
    FormLabel,
    Input,
    VStack,
    useColorModeValue,
    Grid,
    GridItem,
    HStack,
    Image,
    Text,
    useColorMode,
    NumberInput,
    NumberInputField,
    NumberInputStepper,
    NumberIncrementStepper,
    NumberDecrementStepper,
    Slider,
    SliderTrack,
    SliderFilledTrack,
    SliderThumb,
    Textarea,
} from '@chakra-ui/react';
import { Book } from '../types/book';

interface EditBookDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (book: Book) => void;
    book: Book;
}

const EditBookDrawer: React.FC<EditBookDrawerProps> = ({ isOpen, onClose, onSave, book }) => {
    const [title, setTitle] = React.useState(book.title);
    const [author, setAuthor] = React.useState(book.author);
    const [isbn13, setIsbn13] = React.useState(book.isbn_13);
    const [isbn10, setIsbn10] = React.useState(book.isbn_10 || '');
    const [publisher, setPublisher] = React.useState(book.publisher || '');
    const [publicationDate, setPublicationDate] = React.useState(book.publication_date || '');
    const [genre, setGenre] = React.useState(book.genre || '');
    const [subGenre, setSubGenre] = React.useState(book.sub_genre || '');
    const [summary, setSummary] = React.useState(book.summary || '');
    const [tags, setTags] = React.useState(book.tags?.join(', ') || '');
    const [review, setReview] = React.useState(book.review || '');
    const [pages, setPages] = React.useState(book.pages);
    const [completion, setCompletion] = React.useState(book.completed || 0);
    const [rating, setRating] = React.useState(book.rating || 0);
    const { colorMode } = useColorMode();
    const drawerBg = 'white';
    const buttonHoverBg = useColorModeValue('blue.600', 'blue.300');

    const handleSubmit = async () => {
        const updatedBook: Book = {
            ...book,
            title,
            author,
            isbn_13: isbn13,
            isbn_10: isbn10 || undefined,
            publisher: publisher || undefined,
            publication_date: publicationDate || undefined,
            genre: genre || undefined,
            sub_genre: subGenre || undefined,
            summary: summary || undefined,
            tags: tags.split(',').map(tag => tag.trim()).filter(Boolean),
            review: review || undefined,
            pages,
            completed: completion,
            rating,
        };
        try {
            await onSave(updatedBook);
            onClose();
        } catch (error) {
            console.error('Error saving book:', error);
            // The error handling is done in the parent component
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
                        <Text fontFamily="Lora" fontSize="xl">Edit Book</Text>
                    </HStack>
                </DrawerHeader>
                <DrawerCloseButton />
                <DrawerBody>
                    <Grid templateColumns="repeat(3, 1fr)" gap={4}>
                        <GridItem>
                            <FormControl mb={4}>
                                <FormLabel fontFamily="Lora">Title</FormLabel>
                                <Input
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    fontFamily="Lora"
                                />
                            </FormControl>
                        </GridItem>

                        <GridItem>
                            <FormControl mb={4}>
                                <FormLabel fontFamily="Lora">Author</FormLabel>
                                <Input
                                    value={author}
                                    onChange={(e) => setAuthor(e.target.value)}
                                    fontFamily="Lora"
                                />
                            </FormControl>
                        </GridItem>

                        <GridItem>
                            <FormControl mb={4}>
                                <FormLabel fontFamily="Lora">ISBN-13</FormLabel>
                                <Input
                                    value={isbn13}
                                    onChange={(e) => setIsbn13(e.target.value)}
                                    fontFamily="Lora"
                                />
                            </FormControl>
                        </GridItem>

                        <GridItem>
                            <FormControl mb={4}>
                                <FormLabel fontFamily="Lora">ISBN-10</FormLabel>
                                <Input
                                    value={isbn10}
                                    onChange={(e) => setIsbn10(e.target.value)}
                                    fontFamily="Lora"
                                />
                            </FormControl>
                        </GridItem>

                        <GridItem>
                            <FormControl mb={4}>
                                <FormLabel fontFamily="Lora">Publisher</FormLabel>
                                <Input
                                    value={publisher}
                                    onChange={(e) => setPublisher(e.target.value)}
                                    fontFamily="Lora"
                                />
                            </FormControl>
                        </GridItem>

                        <GridItem>
                            <FormControl mb={4}>
                                <FormLabel fontFamily="Lora">Publication Date</FormLabel>
                                <Input
                                    type="date"
                                    value={publicationDate}
                                    onChange={(e) => setPublicationDate(e.target.value)}
                                    fontFamily="Lora"
                                />
                            </FormControl>
                        </GridItem>

                        <GridItem>
                            <FormControl mb={4}>
                                <FormLabel fontFamily="Lora">Genre</FormLabel>
                                <Input
                                    value={genre}
                                    onChange={(e) => setGenre(e.target.value)}
                                    fontFamily="Lora"
                                />
                            </FormControl>
                        </GridItem>

                        <GridItem>
                            <FormControl mb={4}>
                                <FormLabel fontFamily="Lora">Sub-Genre</FormLabel>
                                <Input
                                    value={subGenre}
                                    onChange={(e) => setSubGenre(e.target.value)}
                                    fontFamily="Lora"
                                />
                            </FormControl>
                        </GridItem>

                        <GridItem>
                            <FormControl mb={4}>
                                <FormLabel fontFamily="Lora">Pages</FormLabel>
                                <NumberInput
                                    value={pages}
                                    onChange={(_, value) => setPages(value)}
                                    min={0}
                                    fontFamily="Lora"
                                >
                                    <NumberInputField />
                                    <NumberInputStepper>
                                        <NumberIncrementStepper />
                                        <NumberDecrementStepper />
                                    </NumberInputStepper>
                                </NumberInput>
                            </FormControl>
                        </GridItem>

                        <GridItem colSpan={1.5}>
                            <FormControl mb={4}>
                                <FormLabel fontFamily="Lora">Rating (0-5)</FormLabel>
                                <NumberInput
                                    value={rating}
                                    onChange={(_, value) => setRating(value)}
                                    min={0}
                                    max={5}
                                    step={0.5}
                                    fontFamily="Lora"
                                >
                                    <NumberInputField />
                                    <NumberInputStepper>
                                        <NumberIncrementStepper />
                                        <NumberDecrementStepper />
                                    </NumberInputStepper>
                                </NumberInput>
                            </FormControl>
                        </GridItem>

                        <GridItem colSpan={1.5}>
                            <FormControl mb={4}>
                                <FormLabel fontFamily="Lora">Completion</FormLabel>
                                <HStack spacing={4} align="center" justify="space-between" mb={2}>
                                    <Text fontFamily="Lora">0%</Text>
                                    <Text fontFamily="Lora">50%</Text>
                                    <Text fontFamily="Lora">100%</Text>
                                </HStack>
                                <Slider
                                    value={completion}
                                    onChange={(value) => setCompletion(value)}
                                    min={0}
                                    max={100}
                                    step={1}
                                    fontFamily="Lora"
                                >
                                    <SliderTrack>
                                        <SliderFilledTrack />
                                    </SliderTrack>
                                    <SliderThumb />
                                </Slider>
                            </FormControl>
                        </GridItem>

                        <GridItem colSpan={3}>
                            <FormControl mb={4}>
                                <FormLabel fontFamily="Lora">Summary</FormLabel>
                                <Textarea
                                    value={summary}
                                    onChange={(e) => setSummary(e.target.value)}
                                    rows={3}
                                    fontFamily="Lora"
                                />
                            </FormControl>
                        </GridItem>

                        <GridItem colSpan={3}>
                            <FormControl mb={4}>
                                <FormLabel fontFamily="Lora">Tags (comma separated)</FormLabel>
                                <Input
                                    value={tags}
                                    onChange={(e) => setTags(e.target.value)}
                                    fontFamily="Lora"
                                />
                            </FormControl>
                        </GridItem>

                        <GridItem colSpan={3}>
                            <FormControl mb={4}>
                                <FormLabel fontFamily="Lora">Review</FormLabel>
                                <Textarea
                                    value={review}
                                    onChange={(e) => setReview(e.target.value)}
                                    rows={3}
                                    fontFamily="Lora"
                                />
                            </FormControl>
                        </GridItem>
                    </Grid>
                </DrawerBody>
                <DrawerFooter borderTopWidth="1px">
                    <Button colorScheme="blue" mr={3} onClick={handleSubmit} fontFamily="Lora">
                        Save
                    </Button>
                    <Button variant="ghost" onClick={onClose} fontFamily="Lora">Cancel</Button>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    );
};

export default EditBookDrawer;