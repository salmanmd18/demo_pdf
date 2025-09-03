import React from 'react'

export default function Toolbar({
  mode,
  onToggleMode,
  onAddFieldClick,
  zoom,
  onZoomIn,
  onZoomOut,
  onZoomReset,
  onExport,
  onImport,
  isDraggingFromToolbar,
  setIsDraggingFromToolbar,
  fieldCount,
  onClearAll,
}) {
  const handleDragStart = (e, type) => {
    e.dataTransfer.setData('application/x-field-type', type)
    e.dataTransfer.effectAllowed = 'copy'
    setIsDraggingFromToolbar(true)
    
    // Add visual feedback
    e.target.classList.add('dragging')
  }

  const handleDragEnd = (e) => {
    setIsDraggingFromToolbar(false)
    e.target.classList.remove('dragging')
  }

  const getFieldIcon = (type) => {
    switch (type) {
      case 'text': return '📝'
      case 'checkbox': return '☑️'
      case 'signature': return '✍️'
      default: return '📋'
    }
  }

  return (
    <div className="w-full bg-white border-b border-gray-200 sticky top-0 z-20 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center gap-3">
        {/* Field Type Buttons */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-gray-600 hidden sm:inline">Add Fields:</span>
          {['text', 'checkbox', 'signature'].map((type) => (
            <button
              key={type}
              className="toolbar-button group relative flex items-center gap-2 transition-all duration-200 hover:scale-105 active:scale-95"
              draggable
              onDragStart={(e) => handleDragStart(e, type)}
              onDragEnd={handleDragEnd}
              onClick={() => onAddFieldClick(type)}
              title={`Drag onto PDF or click to add ${type} field`}
            >
              <span className="text-lg">{getFieldIcon(type)}</span>
              <span className="hidden sm:inline capitalize">{type}</span>
              <div className="absolute inset-0 bg-blue-100 opacity-0 group-hover:opacity-20 rounded-md transition-opacity duration-200" />
            </button>
          ))}
        </div>

        {/* Field Count and Management */}
        <div className="flex items-center gap-2 ml-2">
          <span className="text-xs text-gray-600 hidden sm:inline">Fields:</span>
          <div className="text-sm font-medium text-gray-700 bg-gray-100 px-2 py-1 rounded">
            {fieldCount || 0}
          </div>
          {fieldCount > 0 && (
            <button
              className="toolbar-button hover:bg-red-50 hover:border-red-300 hover:text-red-700 text-xs"
              onClick={onClearAll}
              title="Clear all fields"
            >
              🗑️ Clear All
            </button>
          )}
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-2 ml-2">
          <span className="text-xs text-gray-600 hidden sm:inline">Zoom:</span>
          <button 
            className="toolbar-button hover:bg-gray-50" 
            onClick={onZoomOut} 
            title="Zoom out"
          >
            <span className="text-lg">🔍</span>
            <span className="hidden sm:inline ml-1">−</span>
          </button>
          <div className="text-sm text-gray-700 w-16 text-center select-none font-mono">
            {Math.round(zoom * 100)}%
          </div>
          <button 
            className="toolbar-button hover:bg-gray-50" 
            onClick={onZoomIn} 
            title="Zoom in"
          >
            <span className="text-lg">🔍</span>
            <span className="hidden sm:inline ml-1">+</span>
          </button>
          <button 
            className="toolbar-button hover:bg-gray-50" 
            onClick={onZoomReset} 
            title="Reset zoom"
          >
            <span className="text-xs">Reset</span>
          </button>
        </div>

        {/* Import/Export */}
        <div className="flex items-center gap-2 ml-2">
          <button 
            className="toolbar-button hover:bg-green-50 hover:border-green-300" 
            onClick={onExport} 
            title="Export layout JSON"
          >
            <span className="text-sm">💾 Export</span>
          </button>
          <button 
            className="toolbar-button hover:bg-blue-50 hover:border-blue-300" 
            onClick={onImport} 
            title="Import layout JSON"
          >
            <span className="text-sm">📁 Import</span>
          </button>
        </div>

        {/* Mode Toggle */}
        <div className="ml-auto flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-600 hidden sm:inline">Mode:</span>
            <div className={`px-3 py-1.5 rounded-full text-xs font-medium border-2 transition-all duration-200 ${
              mode === 'edit' 
                ? 'bg-blue-50 border-blue-300 text-blue-700 shadow-sm' 
                : 'bg-emerald-50 border-emerald-300 text-emerald-700 shadow-sm'
            }`}>
              {mode === 'edit' ? '✏️ Edit' : '👁️ Preview'}
            </div>
          </div>
          <button
            className={`toolbar-button font-medium transition-all duration-200 ${
              mode === 'edit'
                ? 'bg-emerald-500 text-white border-emerald-500 hover:bg-emerald-600 hover:border-emerald-600'
                : 'bg-blue-500 text-white border-blue-500 hover:bg-blue-600 hover:border-blue-600'
            }`}
            onClick={onToggleMode}
            title={mode === 'edit' ? 'Switch to Preview Mode' : 'Switch to Edit Mode'}
          >
            {mode === 'edit' ? 'Switch to Preview' : 'Switch to Edit'}
          </button>
        </div>
      </div>

      {/* Drag Indicator */}
      {isDraggingFromToolbar && (
        <div className="absolute inset-0 bg-blue-50 border-t-2 border-blue-300 flex items-center justify-center">
          <div className="text-blue-600 font-medium text-sm">
            🎯 Drop field onto PDF page to add it
          </div>
        </div>
      )}
    </div>
  )
}
