import * as React from "react"

export const Avatar = ({ className, ...props }: any) => (
  <div className={`relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full ${className}`} {...props} />
)

export const AvatarFallback = ({ className, ...props }: any) => (
  <div className={`flex h-full w-full items-center justify-center rounded-full bg-gray-100 ${className}`} {...props} />
)