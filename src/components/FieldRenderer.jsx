import React, { useMemo } from 'react'
import Draggable from 'react-draggable'
import TextField from './fields/TextField.jsx'
import CheckboxField from './fields/CheckboxField.jsx'
import SignatureField from './fields/SignatureField.jsx'

// FieldRenderer is responsible for positioning and draggable behavior
export default function FieldRenderer({ field, mode, pageSize, onDragStop, onValueChange }) {
  const { xPct, yPct, width, height } = field

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
        return <SignatureField mode={mode} />
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

  const fieldBody = (
    <div
      className="absolute"
      style={{
        ...(mode === 'edit' ? { left: 0, top: 0 } : previewPositionStyle),
        ...baseStyle,
      }}
    >
      {content}
    </div>
  )

  if (mode === 'edit') {
    return (
      <Draggable
        bounds="parent"
        position={{ x: positionPx.left, y: positionPx.top }}
        onStop={(_, data) => {
          const newXPct = (data.x / pageSize.width) * 100
          const newYPct = (data.y / pageSize.height) * 100
          onDragStop(field.id, newXPct, newYPct)
        }}
      >
        {fieldBody}
      </Draggable>
    )
  }

  return fieldBody
}
