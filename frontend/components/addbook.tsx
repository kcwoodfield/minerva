"use client"

import React from 'react';
import { IoAdd } from 'react-icons/io5';
import { IconButton, useDisclosure } from '@chakra-ui/react';
import AddBookDrawer from './AddBookDrawer';

const AddBook: React.FC = () => {
    const { isOpen, onOpen, onClose } = useDisclosure();

    return (
        <>
            <IconButton
                aria-label="Add new book"
                icon={<IoAdd size="24px" />}
                onClick={onOpen}
                ml={4}
                bg="white"
                color="black"
                _hover={{
                    bg: 'gray.50'
                }}
                size="lg"
                isRound
                boxShadow="md"
            />
            <AddBookDrawer
                isOpen={isOpen}
                onClose={onClose}
                onSave={async (bookData) => {
                    try {
                        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api/library'}`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify(bookData),
                        });

                        if (!response.ok) {
                            const errorData = await response.json();
                            throw new Error(errorData.detail || 'Failed to create book');
                        }

                        // Refresh the page to show the new book
                        window.location.reload();
                    } catch (error) {
                        throw error;
                    }
                }}
            />
        </>
    );
};

export default AddBook;