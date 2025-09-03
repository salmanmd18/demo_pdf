import React, { useCallback, useMemo, useState } from 'react'
import Toolbar from './components/Toolbar.jsx'
import PDFViewer from './components/PDFViewer.jsx'
import { uuid } from './utils/uuid.js'

// Default sizes for fields in pixels
const DEFAULT_SIZES = {
  text: { width: 160, height: 36 },
  checkbox: { width: 24, height: 24 },
  signature: { width: 320, height: 120 },
}

export default function App() {
  const [mode, setMode] = useState('edit') // 'edit' | 'preview'
  const [pdfFile, setPdfFile] = useState(null) // File object
  const [fields, setFields] = useState([])

  const toggleMode = () => setMode((m) => (m === 'edit' ? 'preview' : 'edit'))

  const onFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setPdfFile(file)
    setFields([]) // reset fields when loading a new PDF
  }

  const addFieldAt = useCallback((type, page = 1, xPct = 2, yPct = 2) => {
    const { width, height } = DEFAULT_SIZES[type] || DEFAULT_SIZES.text
    setFields((prev) => [
      ...prev,
      {
        id: uuid(),
        type,
        page,
        xPct,
        yPct,
        width,
        height,
        value: type === 'checkbox' ? false : '',
      },
    ])
  }, [])

  const handleToolbarAddClick = (type) => {
    // Fallback: drop at default position on page 1
    addFieldAt(type, 1, 2, 2)
  }

  const handleDropAddField = (type, page, xPct, yPct) => {
    addFieldAt(type, page, xPct, yPct)
  }

  const handleDragStop = (id, xPct, yPct) => {
    setFields((prev) => prev.map((f) => (f.id === id ? { ...f, xPct, yPct } : f)))
  }

  const handleValueChange = (id, value) => {
    setFields((prev) => prev.map((f) => (f.id === id ? { ...f, value } : f)))
  }

  const fieldCountByType = useMemo(() => {
    return fields.reduce(
      (acc, f) => {
        acc[f.type] = (acc[f.type] || 0) + 1
        return acc
      },
      { text: 0, checkbox: 0, signature: 0 }
    )
  }, [fields])

  return (
    <div className="min-h-screen flex flex-col">
      <Toolbar mode={mode} onToggleMode={toggleMode} onAddFieldClick={handleToolbarAddClick} />

      <main className="max-w-6xl mx-auto w-full px-4 py-6 flex flex-col gap-4">
        <section className="bg-white border border-gray-200 rounded-lg p-4 flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
            <div className="text-sm text-gray-700 font-medium">Upload PDF</div>
            <input
              type="file"
              accept="application/pdf"
              onChange={onFileChange}
              className="text-sm"
            />
            <div className="text-xs text-gray-500 ml-auto">
              Fields: Text {fieldCountByType.text} · Checkbox {fieldCountByType.checkbox} · Signature {fieldCountByType.signature}
            </div>
          </div>
          {!pdfFile && (
            <p className="text-sm text-gray-600">Select a PDF file to start adding fields. Drag field buttons onto the page, or click to add to page 1.</p>
          )}
        </section>

        <PDFViewer
          file={pdfFile}
          fields={fields}
          mode={mode}
          onDropAddField={handleDropAddField}
          onDragStop={handleDragStop}
          onValueChange={handleValueChange}
        />
      </main>
    </div>
  )
}

