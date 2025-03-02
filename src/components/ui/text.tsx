import * as React from "react"
import { cn } from "@/lib/utils"

interface TextProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children: React.ReactNode
  className?: string
  variant?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "small" | "muted"
  as?: keyof JSX.IntrinsicElements
}

const Text = React.forwardRef<HTMLParagraphElement, TextProps>(
  ({ children, className, variant = "p", as, ...props }, ref) => {
    const Component = as || variant === "p" || variant === "small" || variant === "muted" ? "p" : variant

    const variantClasses = {
      h1: "scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl",
      h2: "scroll-m-20 text-3xl font-semibold tracking-tight",
      h3: "scroll-m-20 text-2xl font-semibold tracking-tight",
      h4: "scroll-m-20 text-xl font-semibold tracking-tight",
      h5: "scroll-m-20 text-lg font-semibold tracking-tight",
      h6: "scroll-m-20 text-base font-semibold tracking-tight",
      p: "leading-7",
      small: "text-sm font-medium leading-none",
      muted: "text-sm text-muted-foreground",
    }

    return (
      <Component
        ref={ref}
        className={cn(variantClasses[variant], className)}
        {...props}
      >
        {children}
      </Component>
    )
  }
)

Text.displayName = "Text"

export { Text }
