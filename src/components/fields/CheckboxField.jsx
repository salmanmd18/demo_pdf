import React from 'react'

export default function CheckboxField({ mode, value, onChange }) {
  if (mode === 'preview') {
    return (
      <div className="flex items-center justify-center w-full h-full">
        <input
          type="checkbox"
          className="w-4 h-4"
          checked={!!value}
          onChange={(e) => onChange(e.target.checked)}
        />
      </div>
    )
  }

  return (
    <div className="field-placeholder w-full h-full">Checkbox</div>
  )
}

