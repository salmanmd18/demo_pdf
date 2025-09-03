import React, { useMemo, useState } from 'react'
import Draggable from 'react-draggable'
import TextField from './fields/TextField.jsx'
import CheckboxField from './fields/CheckboxField.jsx'
import SignatureField from './fields/SignatureField.jsx'

// FieldRenderer is responsible for positioning and draggable behavior
export default function FieldRenderer({ 
  field, 
  mode, 
  pageSize, 
  onDragStop, 
  onValueChange, 
  onDelete, 
  onDuplicate,
  onSelect,
  isSelected
}) {
  const { xPct, yPct, width, height, type, label } = field
  const [showControls, setShowControls] = useState(false)

  // Compute pixel position from percentages and current page size
  const positionPx = useMemo(() => {
    const left = Math.round(((xPct || 0) / 100) * pageSize.width)
    const top = Math.round(((yPct || 0) / 100) * pageSize.height)
    return { left, top }
  }, [xPct, yPct, pageSize.width, pageSize.height])

  const sizePx = useMemo(() => {
    // Width/height are stored in pixels relative to a base 100% scale; we keep them as is
    return {
      width,
      height,
    }
  }, [width, height])

  const getFieldIcon = (type) => {
    switch (type) {
      case 'text': return '📝'
      case 'checkbox': return '☑️'
      case 'signature': return '✍️'
      default: return '📋'
    }
  }

  const content = (() => {
    switch (field.type) {
      case 'text':
        return (
          <TextField
            mode={mode}
            value={field.value}
            onChange={(val) => onValueChange(field.id, val)}
          />
        )
      case 'checkbox':
        return (
          <CheckboxField
            mode={mode}
            value={!!field.value}
            onChange={(val) => onValueChange(field.id, val)}
          />
        )
      case 'signature':
        return (
          <SignatureField
            mode={mode}
            value={field.value}
            onChange={(val) => onValueChange(field.id, val)}
            width={sizePx.width}
            height={sizePx.height}
          />
        )
      default:
        return null
    }
  })()

  const previewPositionStyle = {
    left: positionPx.left,
    top: positionPx.top,
  }

  const baseStyle = {
    width: sizePx.width,
    height: sizePx.height,
  }

  const handleFieldClick = (e) => {
    e.stopPropagation()
    onSelect?.(field.id)
  }

  const fieldBody = (
    <div
      className={`absolute group field-renderer ${
        mode === 'edit' ? 'cursor-move' : ''
      } ${isSelected ? 'ring-2 ring-blue-500 ring-offset-1' : ''}`}
      style={{
        ...(mode === 'edit' ? { left: 0, top: 0 } : previewPositionStyle),
        ...baseStyle,
      }}
      onMouseEnter={() => mode === 'edit' && setShowControls(true)}
      onMouseLeave={() => mode === 'edit' && setShowControls(false)}
      onClick={handleFieldClick}
    >
      {content}
      
      {/* Field Controls (Edit Mode Only) */}
      {mode === 'edit' && showControls && (
        <div className="absolute -top-8 left-0 right-0 flex items-center justify-center gap-1 pointer-events-none">
          <div className="bg-gray-800 text-white text-xs px-2 py-1 rounded flex items-center gap-1 shadow-lg">
            <span>{getFieldIcon(type)}</span>
            <span className="capitalize">{type}</span>
            <button
              className="ml-2 hover:bg-gray-700 rounded px-1"
              onClick={(e) => {
                e.stopPropagation()
                onDuplicate?.(field.id)
              }}
              title="Duplicate field"
            >
              📋
            </button>
            <button
              className="ml-1 hover:bg-gray-700 rounded px-1"
              onClick={(e) => {
                e.stopPropagation()
                onDelete?.(field.id)
              }}
              title="Delete field"
            >
              🗑️
            </button>
          </div>
        </div>
      )}
      
      {/* Field Label (Edit Mode Only) */}
      {mode === 'edit' && (
        <div className="absolute -bottom-6 left-0 right-0 text-center">
          <div className={`text-xs px-2 py-1 rounded border shadow-sm ${
            isSelected 
              ? 'bg-blue-100 text-blue-700 border-blue-300' 
              : 'bg-white text-gray-500 border-gray-200'
          }`}>
            {label || `${type} field`}
          </div>
        </div>
      )}
      
      {/* Selection Indicator */}
      {isSelected && mode === 'edit' && (
        <div className="absolute -top-2 -left-2 bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded-full shadow-sm">
          ✓
        </div>
      )}
    </div>
  )

  if (mode === 'edit') {
    return (
      <Draggable
        key={`${field.id}-${pageSize.width}x${pageSize.height}-${Math.round(positionPx.left)}-${Math.round(positionPx.top)}`}
        bounds="parent"
        defaultPosition={{ x: positionPx.left, y: positionPx.top }}
        grid={[5, 5]}
        onStop={(_, data) => {
          const newXPct = (data.x / pageSize.width) * 100
          const newYPct = (data.y / pageSize.height) * 100
          onDragStop(field.id, newXPct, newYPct)
        }}
        onStart={() => setShowControls(false)}
      >
        {fieldBody}
      </Draggable>
    )
  }

  return fieldBody
}
