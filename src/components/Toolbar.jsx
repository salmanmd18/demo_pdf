import React from 'react'

export default function Toolbar({ mode, onToggleMode, onAddFieldClick }) {
  const handleDragStart = (e, type) => {
    e.dataTransfer.setData('application/x-field-type', type)
    e.dataTransfer.effectAllowed = 'copy'
  }

  return (
    <div className="w-full bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="max-w-6xl mx-auto px-4 py-3 flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-2">
          <button
            className="toolbar-button"
            draggable
            onDragStart={(e) => handleDragStart(e, 'text')}
            onClick={() => onAddFieldClick('text')}
            title="Drag onto PDF or click to add"
          >
            Text
          </button>
          <button
            className="toolbar-button"
            draggable
            onDragStart={(e) => handleDragStart(e, 'checkbox')}
            onClick={() => onAddFieldClick('checkbox')}
            title="Drag onto PDF or click to add"
          >
            Checkbox
          </button>
          <button
            className="toolbar-button"
            draggable
            onDragStart={(e) => handleDragStart(e, 'signature')}
            onClick={() => onAddFieldClick('signature')}
            title="Drag onto PDF or click to add"
          >
            Signature
          </button>
        </div>

        <div className="ml-auto">
          <button
            className={`toolbar-button ${mode === 'edit' ? 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700' : ''}`}
            onClick={onToggleMode}
            title="Toggle Edit/Preview"
          >
            {mode === 'edit' ? 'Edit Mode' : 'Preview Mode'}
          </button>
        </div>
      </div>
    </div>
  )
}

