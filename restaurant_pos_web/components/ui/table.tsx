import * as React from "react"

export const Table = ({ className, ...props }: any) => (
  <div className="relative w-full overflow-auto">
    <table className={`w-full caption-bottom text-sm ${className}`} {...props} />
  </div>
)

export const TableHeader = ({ className, ...props }: any) => (
  <thead className={`[&_tr]:border-b ${className}`} {...props} />
)

export const TableBody = ({ className, ...props }: any) => (
  <tbody className={`[&_tr:last-child]:border-0 ${className}`} {...props} />
)

export const TableRow = ({ className, ...props }: any) => (
  <tr className={`border-b transition-colors hover:bg-gray-100/50 data-[state=selected]:bg-gray-100 ${className}`} {...props} />
)

export const TableHead = ({ className, ...props }: any) => (
  <th className={`h-12 px-4 text-left align-middle font-medium text-gray-500 [&:has([role=checkbox])]:pr-0 ${className}`} {...props} />
)

export const TableCell = ({ className, ...props }: any) => (
  <td className={`p-4 align-middle [&:has([role=checkbox])]:pr-0 ${className}`} {...props} />
)