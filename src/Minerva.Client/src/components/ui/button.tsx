import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-md border border-transparent bg-clip-padding font-serif text-[14px] font-semibold whitespace-nowrap transition-[background-color,border-color,color] duration-[140ms] outline-none select-none focus-visible:border-ring active:not-aria-[haspopup]:translate-y-px disabled:cursor-not-allowed disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "bg-accent-terracotta text-white hover:bg-accent-terracotta-deep",
        outline:
          "border-ink bg-transparent text-ink hover:bg-ink hover:text-cream",
        secondary:
          "bg-cream-warm text-ink hover:bg-cream-deep",
        ghost:
          "bg-transparent text-ink hover:bg-cream-warm",
        destructive:
          "bg-accent-terracotta text-white hover:bg-accent-terracotta-deep",
        link: "text-accent-terracotta underline-offset-4 hover:text-accent-terracotta-deep",
      },
      size: {
        default: "h-9 px-[18px] py-[10px]",
        xs:      "h-6 gap-1 px-2 text-[12px]",
        sm:      "h-7 px-3 py-1.5 text-[12.5px]",
        lg:      "h-10 px-6 py-[14px] text-[15px]",
        icon:    "size-9",
        "icon-xs":"size-6",
        "icon-sm":"size-7",
        "icon-lg":"size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
