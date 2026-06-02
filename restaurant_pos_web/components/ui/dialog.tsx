import * as React from "react"

export const Dialog = ({ children, open, onOpenChange }: any) => {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative w-full max-w-lg rounded-lg bg-white p-6 shadow-lg">
        <button
          onClick={() => onOpenChange(false)}
          className="absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100"
        >
          ✕
        </button>
        {children}
      </div>
    </div>
  )
}

export const DialogTrigger = ({ children, asChild, ...props }: any) => {
  return <>{children}</>
}

export const DialogContent = ({ children, className }: any) => (
  <div className={className}>{children}</div>
)

export const DialogHeader = ({ className, ...props }: any) => (
  <div className={`flex flex-col space-y-1.5 text-center sm:text-left ${className}`} {...props} />
)

export const DialogTitle = ({ className, ...props }: any) => (
  <h2 className={`text-lg font-semibold leading-none tracking-tight ${className}`} {...props} />
)

export const DialogDescription = ({ className, ...props }: any) => (
  <p className={`text-sm text-gray-500 ${className}`} {...props} />
)