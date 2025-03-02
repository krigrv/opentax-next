"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { ChevronDown } from "lucide-react"

interface SelectProps {
  children: React.ReactNode
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  disabled?: boolean
  name?: string
  className?: string
}

const SelectContext = React.createContext<{
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
  disabled?: boolean
  name?: string
}>({
  open: false,
  setOpen: () => {},
})

const Select = React.forwardRef<HTMLDivElement, SelectProps>(
  ({ children, value, defaultValue, onValueChange, disabled, name, className, ...props }, ref) => {
    const [open, setOpen] = React.useState(false)
    const [internalValue, setInternalValue] = React.useState(defaultValue || "")
    
    // Update internal value when controlled value changes
    React.useEffect(() => {
      if (value !== undefined) {
        setInternalValue(value)
      }
    }, [value])
    
    const isControlled = value !== undefined
    const currentValue = isControlled ? value : internalValue
    
    const handleValueChange = React.useCallback((newValue: string) => {
      if (!isControlled) {
        setInternalValue(newValue)
      }
      onValueChange?.(newValue)
    }, [isControlled, onValueChange])

    return (
      <SelectContext.Provider 
        value={{ 
          value: currentValue, 
          defaultValue, 
          onValueChange: handleValueChange, 
          open, 
          setOpen,
          disabled,
          name
        }}
      >
        <div ref={ref} className={cn("relative", className)} {...props}>
          {children}
        </div>
      </SelectContext.Provider>
    )
  }
)
Select.displayName = "Select"

interface SelectTriggerProps {
  className?: string
  children: React.ReactNode
}

const SelectTrigger = React.forwardRef<HTMLButtonElement, SelectTriggerProps>(
  ({ className, children, ...props }, ref) => {
    const { open, setOpen, disabled } = React.useContext(SelectContext)
    
    return (
      <button
        type="button"
        role="combobox"
        aria-expanded={open}
        aria-haspopup="listbox"
        disabled={disabled}
        className={cn(
          "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        onClick={() => setOpen(!open)}
        ref={ref}
        {...props}
      >
        {children}
        <ChevronDown className="h-4 w-4 opacity-50" />
      </button>
    )
  }
)
SelectTrigger.displayName = "SelectTrigger"

interface SelectValueProps {
  placeholder?: string
  className?: string
}

const SelectValue = React.forwardRef<HTMLSpanElement, SelectValueProps>(
  ({ placeholder, className }, ref) => {
    const { value } = React.useContext(SelectContext)
    
    return (
      <span ref={ref} className={cn("block truncate", className)}>
        {value ? value : placeholder}
      </span>
    )
  }
)
SelectValue.displayName = "SelectValue"

interface SelectContentProps {
  className?: string
  children: React.ReactNode
}

const SelectContent = React.forwardRef<HTMLDivElement, SelectContentProps>(
  ({ className, children }, ref) => {
    const { open, setOpen } = React.useContext(SelectContext)
    
    if (!open) return null
    
    // Close dropdown when clicking outside
    React.useEffect(() => {
      const handleOutsideClick = (event: MouseEvent) => {
        if (ref.current && !ref.current.contains(event.target as Node)) {
          setOpen(false)
        }
      }
      
      document.addEventListener('mousedown', handleOutsideClick)
      return () => {
        document.removeEventListener('mousedown', handleOutsideClick)
      }
    }, [ref, setOpen])
    
    return (
      <div
        ref={ref}
        className={cn(
          "absolute z-50 min-w-[8rem] w-full overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md animate-in fade-in-80",
          "mt-1 max-h-60 overflow-auto",
          className
        )}
        role="listbox"
      >
        <div className="p-1">
          {children}
        </div>
      </div>
    )
  }
)
SelectContent.displayName = "SelectContent"

interface SelectItemProps {
  value: string
  disabled?: boolean
  className?: string
}

const SelectItem = React.forwardRef<HTMLDivElement, SelectItemProps>(
  ({ className, children, value, disabled, ...props }, ref) => {
    const { onValueChange, setOpen, value: selectedValue } = React.useContext(SelectContext)
    
    const isSelected = selectedValue === value
    
    const handleClick = () => {
      if (disabled) return
      onValueChange?.(value)
      setOpen(false)
    }
    
    return (
      <div
        ref={ref}
        role="option"
        aria-selected={isSelected}
        data-disabled={disabled ? true : undefined}
        data-selected={isSelected ? true : undefined}
        className={cn(
          "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none",
          "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
          "focus:bg-accent focus:text-accent-foreground",
          "hover:bg-accent hover:text-accent-foreground",
          isSelected && "bg-accent text-accent-foreground",
          disabled && "opacity-50 cursor-not-allowed",
          className
        )}
        onClick={handleClick}
        {...props}
      >
        <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
          {isSelected && (
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          )}
        </span>
        <span className="truncate">{children}</span>
      </div>
    )
  }
)
SelectItem.displayName = "SelectItem"

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem }
