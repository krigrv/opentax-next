import * as React from "react"
import { cn } from "@/lib/utils"

interface SpacerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "xs" | "sm" | "md" | "lg" | "xl" | number
  axis?: "horizontal" | "vertical"
  className?: string
}

const Spacer = React.forwardRef<HTMLDivElement, SpacerProps>(
  ({ size = "md", axis = "vertical", className, ...props }, ref) => {
    const sizeMap = {
      xs: 4,
      sm: 8,
      md: 16,
      lg: 32,
      xl: 64,
    }

    const height = axis === "horizontal" ? 1 : typeof size === "number" ? size : sizeMap[size]
    const width = axis === "vertical" ? 1 : typeof size === "number" ? size : sizeMap[size]

    return (
      <div
        ref={ref}
        className={cn("flex-shrink-0", className)}
        style={{
          width: width === 1 ? "100%" : `${width}px`,
          height: `${height}px`,
        }}
        {...props}
      />
    )
  }
)

Spacer.displayName = "Spacer"

export { Spacer }
