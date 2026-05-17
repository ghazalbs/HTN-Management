import React from 'react'

interface SummaryCardProps {
  title: string
  children: React.ReactNode
  accent?: 'navy' | 'red' | 'blue' | 'gray'
}

const accentMap = {
  navy: 'border-navy-800 bg-navy-50',
  red: 'border-red-600 bg-red-50',
  blue: 'border-blue-400 bg-blue-50',
  gray: 'border-gray-400 bg-gray-50',
}

export function SummaryCard({ title, children, accent = 'navy' }: SummaryCardProps) {
  return (
    <div className={`rounded-lg border-l-4 p-5 shadow-sm ${accentMap[accent]}`}>
      <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
        {title}
      </h3>
      <div className="text-gray-800">{children}</div>
    </div>
  )
}
