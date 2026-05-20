import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"

import { cn } from "src/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "w-full min-w-0 rounded-md border border-rule bg-paper px-[14px] py-[11px] font-serif text-[15px] text-ink transition-[border-color,background-color] duration-[140ms] outline-none placeholder:italic placeholder:text-ink-faint focus-visible:border-accent-terracotta focus-visible:bg-paper disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive",
        className
      )}
      {...props}
    />
  )
}

export { Input }
