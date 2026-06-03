import * as React from "react"

export const Dialog = ({ children, open, onOpenChange }: any) => {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-lg rounded-2xl bg-white p-8 shadow-2xl animate-in zoom-in-95 duration-200">
        <button
          onClick={() => onOpenChange(false)}
          className="absolute right-4 top-4 rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-900 transition-colors"
        >
          ✕
        </button>
        {children}
      </div>
    </div>
  )
}

export const DialogTrigger = ({ children, onClick, ...props }: any) => {
  return React.cloneElement(children, {
    onClick: onClick,
    ...props
  })
}

export const DialogContent = ({ children, className }: any) => (
  <div className={className}>{children}</div>
)

export const DialogHeader = ({ className, ...props }: any) => (
  <div className={`flex flex-col space-y-2 text-center sm:text-left mb-6 ${className}`} {...props} />
)

export const DialogTitle = ({ className, ...props }: any) => (
  <h2 className={`text-xl font-black text-gray-900 leading-none tracking-tight ${className}`} {...props} />
)

export const DialogDescription = ({ className, ...props }: any) => (
  <p className={`text-sm text-gray-500 font-medium ${className}`} {...props} />
)