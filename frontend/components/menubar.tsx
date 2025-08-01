"use client"

import React from 'react';
import Image from 'next/image';
import AddBook from "@/components/addbook";
import {
  Box,
  Flex,
  Text,
  useColorModeValue,
  useColorMode,
} from '@chakra-ui/react';
import ThemeToggle from './ThemeToggle';
import Subtitle from './Subtitle';

const MenuBar: React.FC = () => {
    const [isOpen, setIsOpen] = React.useState(false);
    const { colorMode } = useColorMode();
    const [subtitleKey, setSubtitleKey] = React.useState(0);

    const handleLogoClick = () => {
        setSubtitleKey(prev => prev + 1);
    };

    return (
        <Box
            as="header"
            position="static"
            width="100%"
        >
            <Flex
                as="nav"
                align="center"
                justify="space-between"
                wrap="wrap"
                padding="0.75rem 1.5rem"
                mx="auto"
            >
                <Box>
                    <AddBook />
                </Box>
                <Flex
                    direction="column"
                    align="center"
                    gap={2}
                    cursor="pointer"
                    onClick={handleLogoClick}
                >
                    <Image
                        src={colorMode === 'dark' ? '/logo/minerva-logo-dark.png' : '/logo/minerva-logo.png'}
                        alt="Minerva Logo"
                        width={90}
                        height={90}
                    />
                    <Text
                        fontSize="1.75rem"
                        fontWeight="bold"
                        mb={0}
                    >
                        Minerva
                    </Text>
                    <Subtitle key={subtitleKey} />
                </Flex>
                <Box>
                    <ThemeToggle />
                </Box>
            </Flex>
        </Box>
    );
};

export default MenuBar;