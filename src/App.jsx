import React, { useCallback, useMemo, useState, useEffect } from 'react'
import Toolbar from './components/Toolbar.jsx'
import PDFViewer from './components/PDFViewer.jsx'
import Thumbnails from './components/Thumbnails.jsx'
import { uuid } from './utils/uuid.js'

// Default sizes for fields in pixels
const DEFAULT_SIZES = {
  text: { width: 160, height: 36 },
  checkbox: { width: 24, height: 24 },
  signature: { width: 200, height: 80 },
}

export default function App() {
  const [mode, setMode] = useState('edit') // 'edit' | 'preview'
  const [pdfFile, setPdfFile] = useState(null) // File object
  const [pdfUrl, setPdfUrl] = useState(null) // Object URL for robust loading
  const [fields, setFields] = useState([])
  const [zoom, setZoom] = useState(1)
  const [activePage, setActivePage] = useState(1)
  const [isDraggingFromToolbar, setIsDraggingFromToolbar] = useState(false)
  const [selectedField, setSelectedField] = useState(null)
  const importInputId = 'import-layout-input'

  const toggleMode = () => setMode((m) => (m === 'edit' ? 'preview' : 'edit'))

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Only handle shortcuts in edit mode
      if (mode !== 'edit') return
      
      // Ctrl/Cmd + key shortcuts
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case '1':
            e.preventDefault()
            addFieldAt('text', activePage || 1, 15, 15)
            break
          case '2':
            e.preventDefault()
            addFieldAt('checkbox', activePage || 1, 15, 15)
            break
          case '3':
            e.preventDefault()
            addFieldAt('signature', activePage || 1, 15, 15)
            break
          case 'Delete':
            e.preventDefault()
            if (selectedField) {
              deleteField(selectedField)
              setSelectedField(null)
            }
            break
          case 'd':
            e.preventDefault()
            if (selectedField) {
              duplicateField(selectedField)
            }
            break
        }
      }
      
      // Escape to deselect
      if (e.key === 'Escape') {
        setSelectedField(null)
      }
      
      // Space to toggle mode
      if (e.key === ' ' && !e.target.matches('input, textarea')) {
        e.preventDefault()
        toggleMode()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [mode, activePage, selectedField])

  const onFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    // Revoke previous URL if any
    if (pdfUrl) URL.revokeObjectURL(pdfUrl)
    const url = URL.createObjectURL(file)
    setPdfUrl(url)
    setPdfFile(file)
    setFields([]) // reset fields when loading a new PDF
    setActivePage(1)
    setSelectedField(null)
  }

  // Improved field placement with better positioning logic
  const addFieldAt = useCallback((type, page = 1, xPct = 10, yPct = 10) => {
    const { width, height } = DEFAULT_SIZES[type] || DEFAULT_SIZES.text
    
    // Ensure field doesn't go off the page edges
    const clampedXPct = Math.max(2, Math.min(90, xPct))
    const clampedYPct = Math.max(2, Math.min(90, yPct))
    
    const newField = {
      id: uuid(),
      type,
      page,
      xPct: clampedXPct,
      yPct: clampedYPct,
      width,
      height,
      value: type === 'checkbox' ? false : '',
      label: getDefaultLabel(type),
    }
    
    setFields((prev) => [...prev, newField])
    setSelectedField(newField.id)
    
    return newField
  }, [])

  // Get default label for field type
  const getDefaultLabel = (type) => {
    switch (type) {
      case 'text': return 'Text Field'
      case 'checkbox': return 'Checkbox'
      case 'signature': return 'Signature'
      default: return 'Field'
    }
  }

  const handleToolbarAddClick = (type) => {
    // Add field at a more visible position on active page
    addFieldAt(type, activePage || 1, 15, 15)
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

  // Enhanced field management
  const deleteField = (id) => {
    setFields((prev) => prev.filter((f) => f.id !== id))
    if (selectedField === id) {
      setSelectedField(null)
    }
  }

  const duplicateField = (id) => {
    const field = fields.find((f) => f.id === id)
    if (!field) return
    
    const newField = {
      ...field,
      id: uuid(),
      xPct: field.xPct + 5, // Offset slightly from original
      yPct: field.yPct + 5,
      label: `${field.label} (Copy)`,
    }
    setFields((prev) => [...prev, newField])
    setSelectedField(newField.id)
  }

  const selectField = (id) => {
    setSelectedField(id)
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

  const onZoomIn = () => setZoom((z) => Math.min(3, Math.round((z + 0.1) * 10) / 10))
  const onZoomOut = () => setZoom((z) => Math.max(0.5, Math.round((z - 0.1) * 10) / 10))
  const onZoomReset = () => setZoom(1)

  const doExport = () => {
    const payload = {
      version: 1,
      fields,
      meta: { 
        exportedAt: new Date().toISOString(),
        totalFields: fields.length,
        mode: mode,
        pdfFileName: pdfFile?.name || 'unknown'
      },
    }
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `pdf-form-layout-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const doImport = () => {
    const input = document.getElementById(importInputId)
    input?.click()
  }

  const onImportFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const json = JSON.parse(reader.result)
        if (Array.isArray(json)) {
          setFields(json)
        } else if (json && Array.isArray(json.fields)) {
          setFields(json.fields)
        }
      } catch {
        // no-op for demo
      } finally {
        e.target.value = ''
      }
    }
    reader.readAsText(file)
  }

  // Clear all fields
  const clearAllFields = () => {
    if (window.confirm('Are you sure you want to clear all fields? This action cannot be undone.')) {
      setFields([])
      setSelectedField(null)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Toolbar
        mode={mode}
        onToggleMode={toggleMode}
        onAddFieldClick={handleToolbarAddClick}
        zoom={zoom}
        onZoomIn={onZoomIn}
        onZoomOut={onZoomOut}
        onZoomReset={onZoomReset}
        onExport={doExport}
        onImport={doImport}
        isDraggingFromToolbar={isDraggingFromToolbar}
        setIsDraggingFromToolbar={setIsDraggingFromToolbar}
        fieldCount={fields.length}
        onClearAll={clearAllFields}
      />

      <main className="max-w-7xl mx-auto w-full px-4 py-6 flex flex-col gap-4">
        <section className="bg-white border border-gray-200 rounded-lg p-4 flex flex-col gap-3 shadow-sm">
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
            <div className="text-sm text-gray-700 font-medium">Upload PDF</div>
            <input
              type="file"
              accept="application/pdf"
              onChange={onFileChange}
              className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            <input id={importInputId} type="file" accept="application/json" className="hidden" onChange={onImportFileChange} />
            <div className="text-xs text-gray-500 ml-auto">
              Fields: Text {fieldCountByType.text} · Checkbox {fieldCountByType.checkbox} · Signature {fieldCountByType.signature}
            </div>
          </div>
          {!pdfFile && (
            <p className="text-sm text-gray-600">Select a PDF file to start adding fields. Drag field buttons onto the page, or click to add to the current page.</p>
          )}
          
          {/* Keyboard shortcuts help */}
          {pdfFile && mode === 'edit' && (
            <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded border">
              <span className="font-medium">Keyboard shortcuts:</span> Ctrl+1 (Text), Ctrl+2 (Checkbox), Ctrl+3 (Signature), Ctrl+D (Duplicate), Delete, Space (Toggle Mode), Esc (Deselect)
            </div>
          )}
        </section>

        <div className="flex gap-4">
          {/* Sidebar with thumbnails */}
          {pdfFile ? (
            <div className="hidden lg:block">
              <Thumbnails file={pdfUrl || pdfFile} activePage={activePage} onSelect={setActivePage} />
            </div>
          ) : null}

          <div className="flex-1">
            <PDFViewer
              file={pdfUrl || pdfFile}
              fields={fields}
              mode={mode}
              zoom={zoom}
              activePage={activePage}
              onDropAddField={handleDropAddField}
              onDragStop={handleDragStop}
              onValueChange={handleValueChange}
              onDeleteField={deleteField}
              onDuplicateField={duplicateField}
              onSelectField={selectField}
              selectedField={selectedField}
              isDraggingFromToolbar={isDraggingFromToolbar}
            />
          </div>
        </div>
      </main>
    </div>
  )
}
