import React, { useState } from 'react'
import { ChevronUp, ChevronDown } from 'lucide-react'

export interface Column<T> {
  key: keyof T | string
  header: React.ReactNode
  render?: (row: T) => React.ReactNode
  sortable?: boolean
  align?: 'left' | 'right' | 'center'
}

interface DataTableProps<T extends object> {
  columns: Column<T>[]
  data: T[]
  maxRows?: number
  className?: string
}

export function DataTable<T extends object>({
  columns,
  data,
  maxRows,
  className = '',
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortAsc, setSortAsc] = useState(true)

  const handleSort = (key: string) => {
    if (sortKey === key) setSortAsc((a) => !a)
    else { setSortKey(key); setSortAsc(false) }
  }

  const sorted = sortKey
    ? [...data].sort((a, b) => {
        const av = (a as Record<string, unknown>)[sortKey]
        const bv = (b as Record<string, unknown>)[sortKey]
        if (typeof av === 'number' && typeof bv === 'number') {
          return sortAsc ? av - bv : bv - av
        }
        return sortAsc
          ? String(av).localeCompare(String(bv))
          : String(bv).localeCompare(String(av))
      })
    : data

  const visible = maxRows ? sorted.slice(0, maxRows) : sorted

  return (
    <div className={`overflow-x-auto rounded-md border border-gray-200 ${className}`}>
      <table className="min-w-full text-sm">
        <thead className="bg-navy-900 text-white">
          <tr>
            {columns.map((col) => (
              <th
                key={String(col.key)}
                className={`px-3 py-2 font-semibold select-none ${
                  col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'
                } ${col.sortable ? 'cursor-pointer hover:bg-navy-700' : ''}`}
                onClick={col.sortable ? () => handleSort(String(col.key)) : undefined}
              >
                <span className="inline-flex items-center gap-1">
                  {col.header}
                  {col.sortable && sortKey === String(col.key) && (
                    sortAsc ? <ChevronUp size={12} /> : <ChevronDown size={12} />
                  )}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {visible.map((row, i) => (
            <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
              {columns.map((col) => {
                const val = col.render
                  ? col.render(row)
                  : String((row as Record<string, unknown>)[String(col.key)] ?? '')
                return (
                  <td
                    key={String(col.key)}
                    className={`px-3 py-2 text-gray-700 ${
                      col.align === 'right'
                        ? 'text-right'
                        : col.align === 'center'
                        ? 'text-center'
                        : 'text-left'
                    }`}
                  >
                    {val}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
