import * as React from "react"

export const Tabs = ({ className, defaultValue, children, ...props }: any) => {
  const [value, setValue] = React.useState(defaultValue)
  return (
    <div className={className} {...props}>
      {React.Children.map(children, child => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<any>, { activeValue: value, onValueChange: setValue })
        }
        return child
      })}
    </div>
  )
}

export const TabsList = ({ className, activeValue, onValueChange, children, ...props }: any) => (
  <div className={`inline-flex h-10 items-center justify-center rounded-md bg-gray-100 p-1 text-gray-500 ${className}`} {...props}>
    {React.Children.map(children, child => {
      if (React.isValidElement(child)) {
        return React.cloneElement(child as React.ReactElement<any>, { activeValue, onValueChange })
      }
      return child
    })}
  </div>
)

export const TabsTrigger = ({ className, value, activeValue, onValueChange, ...props }: any) => (
  <button
    onClick={() => onValueChange(value)}
    className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium transition-all focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 ${activeValue === value ? 'bg-white text-gray-950 shadow-sm' : 'hover:bg-gray-200/50'} ${className}`}
    {...props}
  />
)

export const TabsContent = ({ className, value, activeValue, ...props }: any) => (
  activeValue === value ? <div className={`mt-2 focus-visible:outline-none ${className}`} {...props} /> : null
)