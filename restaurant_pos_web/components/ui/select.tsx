import * as React from "react"

export const Select = ({ children, value, onValueChange, ...props }: any) => {
  return (
    <div className="relative">
      {React.Children.map(children, child => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<any>, { value, onValueChange })
        }
        return child
      })}
    </div>
  )
}

export const SelectTrigger = ({ className, children, value, onValueChange, ...props }: any) => (
  <button
    className={`flex h-10 w-full items-center justify-between rounded-md border border-gray-200 bg-white px-3 py-2 text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    {...props}
  >
    {children}
  </button>
)

export const SelectValue = ({ placeholder, value }: any) => (
  <span>{value || placeholder}</span>
)

export const SelectContent = ({ children, value, onValueChange }: any) => {
  // Simplified: just render a select for now to avoid complex portal/dropdown logic
  return (
    <select
      value={value}
      onChange={(e) => onValueChange(e.target.value)}
      className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
    >
      {children}
    </select>
  )
}

export const SelectItem = ({ value, children }: any) => (
  <option value={value}>{children}</option>
)