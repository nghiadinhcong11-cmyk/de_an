import * as React from "react"

export const Card = ({ className, ...props }: any) => (
  <div className={`rounded-xl border bg-white text-gray-950 shadow-sm ${className}`} {...props} />
)
export const CardHeader = ({ className, ...props }: any) => (
  <div className={`flex flex-col space-y-1.5 p-6 ${className}`} {...props} />
)
export const CardTitle = ({ className, ...props }: any) => (
  <h3 className={`text-2xl font-semibold leading-none tracking-tight ${className}`} {...props} />
)
export const CardDescription = ({ className, ...props }: any) => (
  <p className={`text-sm text-gray-500 ${className}`} {...props} />
)
export const CardContent = ({ className, ...props }: any) => (
  <div className={`p-6 pt-0 ${className}`} {...props} />
)