import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-full border px-2.5 py-0.5 text-xs font-semibold w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none transition-[color,box-shadow] overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-[#00D09C] text-white [a&]:hover:bg-[#00B386]",
        secondary:
          "border-transparent bg-[#E6FFF9] text-[#00D09C] [a&]:hover:bg-[#00D09C] [a&]:hover:text-white",
        destructive:
          "border-transparent bg-[#FF4444] text-white [a&]:hover:bg-[#DD0000]",
        outline:
          "border-[#E5E5EA] text-[#2D2D44] bg-transparent [a&]:hover:bg-[#F7F7FA]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span"

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
