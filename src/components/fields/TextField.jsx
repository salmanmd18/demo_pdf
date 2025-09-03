import React from 'react'

export default function TextField({ mode, value, onChange }) {
  if (mode === 'preview') {
    return (
      <input
        type="text"
        className="w-full h-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white placeholder-gray-400"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Enter text here..."
      />
    )
  }

  return (
    <div className="field-placeholder w-full h-full flex items-center justify-center text-center">
      <div className="flex flex-col items-center gap-1">
        <div className="text-lg">📝</div>
        <div className="text-xs font-medium">Text Field</div>
        {value && (
          <div className="text-xs text-gray-500 mt-1 px-2 py-1 bg-gray-100 rounded max-w-full truncate">
            "{value}"
          </div>
        )}
      </div>
    </div>
  )
}

