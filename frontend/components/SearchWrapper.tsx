'use client';

import React, { useState } from 'react';
import {
    Box,
    Input,
    InputGroup,
    InputLeftElement,
    Button,
    useColorModeValue,
} from '@chakra-ui/react';
import { SearchIcon } from '@chakra-ui/icons';

interface SearchWrapperProps {
    onSearch: (query: string) => void;
}

const SearchWrapper: React.FC<SearchWrapperProps> = ({ onSearch }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const borderColor = useColorModeValue('gray.200', 'gray.700');

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            onSearch(searchQuery);
        }
    };

    return (
        <Box
            className="search-wrapper"
            p={1}
            borderRadius="md"
            borderWidth="1px"
            borderColor={borderColor}
            maxW="600px"
            mx="auto"
        >
            <InputGroup>
                <InputLeftElement pointerEvents="none">
                    <SearchIcon color="gray.400" />
                </InputLeftElement>
                <Input
                    placeholder="Search books and authors..."
                    value={searchQuery}
                    onChange={(e) => {
                        setSearchQuery(e.target.value);
                        onSearch(e.target.value);
                    }}
                    onKeyPress={handleKeyDown}
                    variant="filled"
                    bg="transparent"
                    _hover={{ bg: 'transparent' }}
                    _focus={{ bg: 'transparent' }}
                />
            </InputGroup>
        </Box>
    );
};

export default SearchWrapper;