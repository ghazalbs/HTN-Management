import React from 'react'
import { AlertCircle } from 'lucide-react'

interface InterpretationBoxProps {
  lines: string[]
  variant?: 'info' | 'insight' | 'warning'
}

const variantMap = {
  info: 'bg-blue-50 border-blue-300 text-blue-900',
  insight: 'bg-navy-50 border-navy-300 text-navy-900',
  warning: 'bg-amber-50 border-amber-300 text-amber-900',
}

export function InterpretationBox({ lines, variant = 'info' }: InterpretationBoxProps) {
  return (
    <div className={`rounded-md border p-4 text-sm leading-relaxed ${variantMap[variant]}`}>
      <div className="flex gap-2">
        <AlertCircle size={16} className="mt-0.5 shrink-0 opacity-70" />
        <ul className="space-y-1">
          {lines.map((line, i) => (
            <li key={i}>{line}</li>
          ))}
        </ul>
      </div>
    </div>
  )
}
