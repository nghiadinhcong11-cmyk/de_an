import * as React from "react"

export const Select = ({ children, value, onValueChange }: any) => {
  return (
    <div className="relative w-full">
      {React.Children.map(children, child => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<any>, { value, onValueChange, parentChildren: children })
        }
        return child
      })}
    </div>
  )
}

export const SelectTrigger = ({ className, children, value, onValueChange, parentChildren }: any) => (
  <div className="relative">
    <div
      className={`flex h-11 w-full items-center justify-between rounded-xl border border-gray-100 bg-gray-50 px-4 py-2 text-sm font-bold text-gray-900 focus-within:ring-2 focus-within:ring-orange-500 transition-all ${className}`}
    >
      {React.Children.map(children, child => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<any>, { value, parentChildren })
        }
        return child
      })}
      <span className="ml-2 text-gray-400">▼</span>
    </div>
  </div>
)

export const SelectValue = ({ placeholder, value, parentChildren }: any) => {
  let displayValue = placeholder;

  if (value && parentChildren) {
    // Try to find the matching SelectItem text
    React.Children.forEach(parentChildren, (child: any) => {
      if (child.type === SelectContent) {
        React.Children.forEach(child.props.children, (item: any) => {
          if (item && item.props && item.props.value === value) {
            displayValue = item.props.children;
          }
        });
      }
    });
  }

  return <span className="truncate">{displayValue}</span>;
}

export const SelectContent = ({ children, value, onValueChange }: any) => {
  return (
    <select
      value={value || ""}
      onChange={(e) => onValueChange(e.target.value)}
      className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer z-10"
      style={{ colorScheme: 'light dark' }}
    >
      <option value="" disabled hidden>Chọn...</option>
      {children}
    </select>
  )
}

export const SelectItem = ({ value, children }: any) => (
  <option value={value} className="bg-white text-gray-900">{children}</option>
)