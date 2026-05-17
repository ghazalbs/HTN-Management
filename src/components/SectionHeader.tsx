import React from 'react'

interface SectionHeaderProps {
  id: string
  title: string
  subtitle?: string
  badge?: string
}

export function SectionHeader({ id, title, subtitle, badge }: SectionHeaderProps) {
  return (
    <div id={id} className="mb-6 scroll-mt-20">
      <div className="flex items-center gap-3 mb-1">
        {badge && (
          <span className="rounded-full bg-navy-900 px-2.5 py-0.5 text-xs font-bold text-white">
            {badge}
          </span>
        )}
        <h2 className="text-xl font-bold text-navy-900">{title}</h2>
      </div>
      {subtitle && <p className="text-sm text-gray-500 leading-relaxed">{subtitle}</p>}
      <div className="mt-3 h-px bg-navy-100" />
    </div>
  )
}
