import * as React from "react"

export const Select = ({ children, value, onValueChange }: any) => {
  return (
    <div className="relative w-full">
      {React.Children.map(children, child => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<any>, { value, onValueChange })
        }
        return child
      })}
    </div>
  )
}

export const SelectTrigger = ({ className, children, value, onValueChange }: any) => (
  <div className="relative">
    <button
      type="button"
      className={`flex h-11 w-full items-center justify-between rounded-xl border border-gray-100 bg-gray-50 px-4 py-2 text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all ${className}`}
    >
      {children}
      <span className="ml-2 text-gray-400">▼</span>
    </button>
  </div>
)

export const SelectValue = ({ placeholder, value }: any) => (
  <span className="truncate">{value || placeholder}</span>
)

export const SelectContent = ({ children, value, onValueChange }: any) => {
  return (
    <select
      value={value}
      onChange={(e) => onValueChange(e.target.value)}
      className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer z-10"
    >
      <option value="" disabled>Chọn...</option>
      {children}
    </select>
  )
}

export const SelectItem = ({ value, children }: any) => (
  <option value={value}>{children}</option>
)