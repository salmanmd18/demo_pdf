import React from 'react'

export default function TextField({ mode, value, onChange }) {
  if (mode === 'preview') {
    return (
      <input
        type="text"
        className="w-full h-full border border-gray-300 rounded px-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
      />
    )
  }

  return (
    <div className="field-placeholder w-full h-full">Text</div>
  )
}

