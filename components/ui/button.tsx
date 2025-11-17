import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-1.5 sm:gap-2 whitespace-nowrap rounded-lg text-xs sm:text-sm font-medium sm:font-semibold transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-3 sm:[&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-[#00D09C] focus-visible:ring-offset-2",
  {
    variants: {
      variant: {
        default: "bg-[#00D09C] text-white hover:bg-[#00B386] shadow-[0_2px_4px_rgba(0,208,156,0.2)]",
        destructive:
          "bg-[#FF4444] text-white hover:bg-[#DD0000]",
        outline:
          "border-2 border-[#00D09C] text-[#00D09C] bg-transparent hover:bg-[#E6FFF9]",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost:
          "text-[#6C6C80] hover:bg-[#F7F7FA]",
        link: "text-[#00D09C] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-8 sm:h-9 px-3 sm:px-4 py-1.5 sm:py-2 has-[>svg]:px-2 sm:has-[>svg]:px-3",
        sm: "h-7 sm:h-8 rounded-lg gap-1 px-2.5 sm:px-3 has-[>svg]:px-2 sm:has-[>svg]:px-2.5 text-xs",
        lg: "h-9 sm:h-10 md:h-11 rounded-lg px-4 sm:px-6 md:px-8 has-[>svg]:px-3 sm:has-[>svg]:px-4 md:has-[>svg]:px-6 text-sm sm:text-base",
        icon: "size-8 sm:size-9",
        "icon-sm": "size-6 sm:size-7",
        "icon-lg": "size-10 sm:size-11",
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
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
