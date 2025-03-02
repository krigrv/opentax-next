"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface ToggleProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  defaultPressed?: boolean
  pressed?: boolean
  onPressedChange?: (pressed: boolean) => void
  className?: string
  variant?: "default" | "outline" | "ghost"
  size?: "default" | "sm" | "lg"
  children: React.ReactNode
}

const Toggle = React.forwardRef<HTMLButtonElement, ToggleProps>(
  (
    {
      className,
      variant = "default",
      size = "default",
      pressed: controlledPressed,
      defaultPressed = false,
      onPressedChange,
      children,
      ...props
    },
    ref
  ) => {
    const [uncontrolledPressed, setUncontrolledPressed] = React.useState(defaultPressed)
    
    const isControlled = controlledPressed !== undefined
    const pressed = isControlled ? controlledPressed : uncontrolledPressed
    
    const handleClick = React.useCallback(() => {
      if (!isControlled) {
        setUncontrolledPressed(!pressed)
      }
      onPressedChange?.(!pressed)
    }, [isControlled, onPressedChange, pressed])

    const variantClasses = {
      default: "bg-transparent hover:bg-muted hover:text-muted-foreground",
      outline: "border border-input bg-transparent hover:bg-accent hover:text-accent-foreground",
      ghost: "hover:bg-accent hover:text-accent-foreground",
    }

    const sizeClasses = {
      default: "h-10 px-3",
      sm: "h-9 px-2.5",
      lg: "h-11 px-5",
    }

    return (
      <button
        type="button"
        role="switch"
        aria-pressed={pressed}
        data-state={pressed ? "on" : "off"}
        ref={ref}
        onClick={handleClick}
        className={cn(
          "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
          variantClasses[variant],
          sizeClasses[size],
          pressed && "bg-accent text-accent-foreground",
          className
        )}
        {...props}
      >
        {children}
      </button>
    )
  }
)

Toggle.displayName = "Toggle"

export { Toggle }
