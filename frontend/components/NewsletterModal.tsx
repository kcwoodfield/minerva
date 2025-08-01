'use client'

import { useState, useEffect } from 'react'
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Button,
  Input,
  VStack,
  Text,
  useToast,
} from '@chakra-ui/react'
import { setCookie, getCookie } from '@/lib/cookies'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export default function NewsletterModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const toast = useToast()

  useEffect(() => {
    // Check if the cookie exists
    const hasSeenModal = getCookie('newsletter_signup')
    if (!hasSeenModal) {
      // Show modal after a short delay
      const timer = setTimeout(() => {
        setIsOpen(true)
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      console.log('Submitting to:', `${API_URL}/api/newsletter/signup`)
      console.log('With data:', { email })

      const response = await fetch(`${API_URL}/api/newsletter/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      console.log('Response status:', response.status)
      const data = await response.json()
      console.log('Response data:', data)

      if (data.success) {
        // Set the cookie for 15 days
        setCookie('newsletter_signup', 'true', 15)

        toast({
          title: 'Success!',
          description: data.message,
          status: 'success',
          duration: 5000,
          isClosable: true,
        })

        setIsOpen(false)
      } else {
        toast({
          title: 'Error',
          description: data.message || 'Something went wrong. Please try again.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        })
      }
    } catch (error) {
      console.error('Error submitting form:', error)
      toast({
        title: 'Error',
        description: 'Something went wrong. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setIsOpen(false)
    // Set cookie even if they just close the modal
    setCookie('newsletter_signup', 'true', 15)
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Stay Updated</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <form onSubmit={handleSubmit}>
            <VStack spacing={4}>
              <Text>
                Sign up to receive updates about new features and improvements to Minerva.
              </Text>
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Button
                type="submit"
                colorScheme="primary"
                width="full"
                isLoading={isLoading}
              >
                Sign Up
              </Button>
            </VStack>
          </form>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}