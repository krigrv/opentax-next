"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface SheetProps {
  children: React.ReactNode
  className?: string
}

const SheetContext = React.createContext<{
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
  side: "top" | "right" | "bottom" | "left"
  setSide: React.Dispatch<React.SetStateAction<"top" | "right" | "bottom" | "left">>
}>({
  open: false,
  setOpen: () => {},
  side: "right",
  setSide: () => {},
})

const Sheet = ({ children, className }: SheetProps) => {
  const [open, setOpen] = React.useState(false)
  const [side, setSide] = React.useState<"top" | "right" | "bottom" | "left">("right")

  return (
    <SheetContext.Provider value={{ open, setOpen, side, setSide }}>
      <div className={cn("", className)}>
        {children}
      </div>
    </SheetContext.Provider>
  )
}

interface SheetTriggerProps {
  children: React.ReactNode
  className?: string
}

const SheetTrigger = React.forwardRef<
  HTMLButtonElement,
  SheetTriggerProps & React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ children, className, ...props }, ref) => {
  const { setOpen } = React.useContext(SheetContext)

  return (
    <button
      ref={ref}
      onClick={() => setOpen(true)}
      className={cn("inline-flex items-center justify-center", className)}
      {...props}
    >
      {children}
    </button>
  )
})
SheetTrigger.displayName = "SheetTrigger"

interface SheetCloseProps {
  children: React.ReactNode
  className?: string
}

const SheetClose = React.forwardRef<
  HTMLButtonElement,
  SheetCloseProps & React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ children, className, ...props }, ref) => {
  const { setOpen } = React.useContext(SheetContext)

  return (
    <button
      ref={ref}
      onClick={() => setOpen(false)}
      className={cn("inline-flex items-center justify-center", className)}
      {...props}
    >
      {children}
    </button>
  )
})
SheetClose.displayName = "SheetClose"

interface SheetContentProps {
  children: React.ReactNode
  className?: string
  side?: "top" | "right" | "bottom" | "left"
}

const SheetContent = React.forwardRef<
  HTMLDivElement,
  SheetContentProps & React.HTMLAttributes<HTMLDivElement>
>(({ children, className, side: propSide, ...props }, ref) => {
  const { open, setOpen, side: contextSide } = React.useContext(SheetContext)
  const side = propSide || contextSide

  if (!open) return null

  const sideClasses = {
    top: "animate-in slide-in-from-top w-full",
    right: "animate-in slide-in-from-right h-full right-0",
    bottom: "animate-in slide-in-from-bottom w-full bottom-0",
    left: "animate-in slide-in-from-left h-full left-0",
  }

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-black/80 opacity-100 transition-all duration-100 data-[state=closed]:animate-out data-[state=closed]:fade-out"
        onClick={() => setOpen(false)}
      />
      <div
        ref={ref}
        className={cn(
          "fixed z-50 gap-4 bg-background p-6 shadow-lg transition ease-in-out",
          sideClasses[side],
          className
        )}
        {...props}
      >
        <div className="flex flex-col space-y-4">
          {children}
        </div>
      </div>
    </>
  )
})
SheetContent.displayName = "SheetContent"

interface SheetHeaderProps {
  children: React.ReactNode
  className?: string
}

const SheetHeader = React.forwardRef<
  HTMLDivElement,
  SheetHeaderProps & React.HTMLAttributes<HTMLDivElement>
>(({ children, className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("flex flex-col space-y-2 text-center sm:text-left", className)}
      {...props}
    >
      {children}
    </div>
  )
})
SheetHeader.displayName = "SheetHeader"

interface SheetFooterProps {
  children: React.ReactNode
  className?: string
}

const SheetFooter = React.forwardRef<
  HTMLDivElement,
  SheetFooterProps & React.HTMLAttributes<HTMLDivElement>
>(({ children, className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className)}
      {...props}
    >
      {children}
    </div>
  )
})
SheetFooter.displayName = "SheetFooter"

interface SheetTitleProps {
  children: React.ReactNode
  className?: string
}

const SheetTitle = React.forwardRef<
  HTMLHeadingElement,
  SheetTitleProps & React.HTMLAttributes<HTMLHeadingElement>
>(({ children, className, ...props }, ref) => {
  return (
    <h3
      ref={ref}
      className={cn("text-lg font-semibold text-foreground", className)}
      {...props}
    >
      {children}
    </h3>
  )
})
SheetTitle.displayName = "SheetTitle"

interface SheetDescriptionProps {
  children: React.ReactNode
  className?: string
}

const SheetDescription = React.forwardRef<
  HTMLParagraphElement,
  SheetDescriptionProps & React.HTMLAttributes<HTMLParagraphElement>
>(({ children, className, ...props }, ref) => {
  return (
    <p
      ref={ref}
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    >
      {children}
    </p>
  )
})
SheetDescription.displayName = "SheetDescription"

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
}
