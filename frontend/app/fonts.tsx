// app/fonts.ts
import { Cormorant_Garamond, Lora } from "next/font/google"

const cormorant_garamond = Cormorant_Garamond({
  subsets: ['latin'],
  variable: '--font-Cormorant_Garamond',
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
})

const lora = Lora({
  subsets: ['latin'],
  variable: '--font-lora',
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
})

export const fonts = {
  cormorant_garamond,
  lora,
}