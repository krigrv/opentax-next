import * as React from "react"
import { cn } from "@/lib/utils"

interface DividerProps extends React.HTMLAttributes<HTMLHRElement> {
  className?: string
  orientation?: "horizontal" | "vertical"
  decorative?: boolean
}

const Divider = React.forwardRef<HTMLHRElement, DividerProps>(
  (
    { className, orientation = "horizontal", decorative = true, ...props },
    ref
  ) => {
    return (
      <hr
        ref={ref}
        className={cn(
          "shrink-0 border-[hsl(var(--border))]",
          orientation === "horizontal" ? "h-[1px] w-full" : "h-full w-[1px]",
          className
        )}
        {...props}
        aria-orientation={orientation}
        {...(decorative
          ? { "aria-hidden": true, role: "separator" }
          : { role: "separator" })}
      />
    )
  }
)

Divider.displayName = "Divider"

export { Divider }
