export const Badge = ({ className, variant, ...props }: any) => {
  const variants: any = {
    default: "border-transparent bg-orange-600 text-white hover:bg-orange-600/80",
    secondary: "border-transparent bg-gray-100 text-gray-900 hover:bg-gray-100/80",
    outline: "text-gray-950 border border-gray-200",
    destructive: "border-transparent bg-red-500 text-white hover:bg-red-500/80",
  }
  return (
    <div
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-gray-950 focus:ring-offset-2 ${variants[variant || 'default']} ${className}`}
      {...props}
    />
  )
}