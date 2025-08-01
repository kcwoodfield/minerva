'use client'

import { CacheProvider } from '@chakra-ui/next-js'
import { ChakraProvider, extendTheme } from '@chakra-ui/react'
import { useState, useEffect } from 'react'
import { fonts } from './fonts'

const theme = extendTheme({
  colors: {
    primary: {
      50: '#f9e9e4',
      100: '#f3d3c9',
      200: '#e7a793',
      300: '#db7b5d',
      400: '#cf4f27',
      500: '#c96442', // Your specified primary color
      600: '#a14f35',
      700: '#793b28',
      800: '#51271b',
      900: '#28130d',
    },
  },
  fonts: {
    body: fonts.lora.style.fontFamily,
    heading: fonts.lora.style.fontFamily,
    mono: fonts.lora.style.fontFamily,
  },
  components: {
    Text: {
      baseStyle: {
        fontFamily: fonts.lora.style.fontFamily,
      },
    },
    Heading: {
      baseStyle: {
        fontFamily: fonts.lora.style.fontFamily,
      },
    },
    Button: {
      baseStyle: {
        fontFamily: fonts.lora.style.fontFamily,
      },
      variants: {
        solid: {
          bg: 'primary.500',
          color: 'white',
          _hover: {
            bg: 'primary.600',
          },
        },
      },
    },
    Input: {
      baseStyle: {
        fontFamily: fonts.lora.style.fontFamily,
      },
    },
    FormLabel: {
      baseStyle: {
        fontFamily: fonts.lora.style.fontFamily,
      },
    },
    Table: {
      baseStyle: {
        fontFamily: fonts.lora.style.fontFamily,
      },
    },
    Th: {
      baseStyle: {
        fontFamily: fonts.lora.style.fontFamily,
      },
    },
    Td: {
      baseStyle: {
        fontFamily: fonts.lora.style.fontFamily,
      },
    },
  },
  config: {
    initialColorMode: 'system',
    useSystemColorMode: true,
  },
  styles: {
    global: (props: any) => ({
      body: {
        bg: props.colorMode === 'dark' ? '#171717' : '#fefffa',
        fontFamily: fonts.lora.style.fontFamily,
      },
      '.search-wrapper': {
        bg: props.colorMode === 'dark' ? 'gray.800' : '#ffffff',
      },
    }),
  },
})

export function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <CacheProvider>
      <ChakraProvider theme={theme}>
        {children}
      </ChakraProvider>
    </CacheProvider>
  )
}