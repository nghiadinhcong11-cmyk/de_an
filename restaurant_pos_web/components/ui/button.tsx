export const Button = ({ className, variant, size, ...props }: any) => {
  const variants: any = {
    default: "bg-orange-600 text-white hover:bg-orange-700",
    outline: "border border-gray-200 bg-white hover:bg-gray-100 text-gray-900",
    ghost: "hover:bg-gray-100 text-gray-900",
    destructive: "bg-red-600 text-white hover:bg-red-700",
  }
  const sizes: any = {
    default: "h-10 px-4 py-2",
    sm: "h-9 rounded-md px-3",
    icon: "h-10 w-10",
  }
  return (
    <button
      className={`inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors disabled:opacity-50 ${variants[variant || 'default']} ${sizes[size || 'default']} ${className}`}
      {...props}
    />
  )
}