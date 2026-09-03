import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { Loader2 } from "lucide-react"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-full font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-md hover:bg-primary/90 hover:shadow-lg hover:-translate-y-0.5",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90 hover:shadow-md hover:-translate-y-0.5",
        outline:
          "border border-border/60 bg-transparent shadow-sm hover:bg-surface-container hover:text-foreground",
        secondary:
          "bg-surface-container text-foreground shadow-sm hover:bg-surface-container/80 hover:-translate-y-0.5",
        ghost: "hover:bg-surface-container/60 hover:text-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        glass: "bg-surface/80 dark:bg-background/80 backdrop-blur-md border border-border/30 hover:bg-surface dark:hover:bg-background shadow-sm text-foreground",
      },
      size: {
        default: "h-10 px-5 py-2 text-sm", // 40px height
        sm: "h-8 px-3 text-xs", // 32px height
        lg: "h-12 px-8 text-base", // 48px height
        icon: "h-10 w-10", // 40px icon button
        iconSm: "h-8 w-8", // 32px icon button
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  isLoading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, isLoading, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    
    // When using asChild, we don't wrap children directly with Loader to not break Slot injection
    if (asChild) {
      return (
        <Comp
          className={cn(buttonVariants({ variant, size, className }))}
          ref={ref}
          disabled={disabled || isLoading}
          {...props}
        >
          {children}
        </Comp>
      )
    }

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {children}
      </Comp>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
