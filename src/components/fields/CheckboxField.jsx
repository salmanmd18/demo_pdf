import React from 'react'

export default function CheckboxField({ mode, value, onChange }) {
  if (mode === 'preview') {
    return (
      <div className="flex items-center justify-center w-full h-full">
        <input
          type="checkbox"
          className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 cursor-pointer"
          checked={!!value}
          onChange={(e) => onChange(e.target.checked)}
        />
      </div>
    )
  }

  return (
    <div className="field-placeholder w-full h-full flex items-center justify-center text-center">
      <div className="flex flex-col items-center gap-1">
        <div className="text-lg">☑️</div>
        <div className="text-xs font-medium">Checkbox</div>
        <div className={`text-xs px-2 py-1 rounded ${value ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
          {value ? 'Checked' : 'Unchecked'}
        </div>
      </div>
    </div>
  )
}

