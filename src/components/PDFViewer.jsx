import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import workerSrc from 'pdfjs-dist/build/pdf.worker.min.js?url'
import FieldRenderer from './FieldRenderer.jsx'

// Configure classic worker (pdfjs v3) for Vite
pdfjs.GlobalWorkerOptions.workerSrc = workerSrc

export default function PDFViewer({ 
  file, 
  fields, 
  mode, 
  onDropAddField, 
  onDragStop, 
  onValueChange, 
  onDeleteField,
  onDuplicateField,
  onSelectField,
  selectedField,
  zoom = 1, 
  activePage,
  isDraggingFromToolbar 
}) {
  const containerRef = useRef(null)
  const [numPages, setNumPages] = useState(null)
  const [pageSizes, setPageSizes] = useState({}) // { [pageNumber]: {width, height} }
  const [containerWidth, setContainerWidth] = useState(800)
  const [dragOverPage, setDragOverPage] = useState(null)
  const overlayRos = useRef(new Map())
  const overlayEls = useRef(new Map())
  const pageRefs = useRef(new Map())

  // Track container width to size pages responsively
  useEffect(() => {
    const measure = () => {
      const el = containerRef.current
      if (!el) return
      // Provide some max width constraint
      const width = Math.min(el.clientWidth - 16, 1200)
      setContainerWidth(Math.max(320, width))
    }
    measure()
    const ro = new ResizeObserver(measure)
    if (containerRef.current) ro.observe(containerRef.current)
    return () => ro.disconnect()
  }, [])

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages)
  }

  // Observe overlay size to keep pageSizes accurate without relying on internals
  const getOverlayRef = useCallback((pageNumber) => (el) => {
    const prevEl = overlayEls.current.get(pageNumber)
    if (prevEl && overlayRos.current.get(pageNumber)) {
      overlayRos.current.get(pageNumber).disconnect()
      overlayRos.current.delete(pageNumber)
      overlayEls.current.delete(pageNumber)
    }
    if (el) {
      overlayEls.current.set(pageNumber, el)
      const ro = new ResizeObserver(() => {
        const rect = el.getBoundingClientRect()
        setPageSizes((prev) => ({ ...prev, [pageNumber]: { width: Math.round(rect.width), height: Math.round(rect.height) } }))
      })
      ro.observe(el)
      overlayRos.current.set(pageNumber, ro)
    }
  }, [])

  const handleDragOver = (e, pageNumber) => {
    if (mode !== 'edit') return
    e.preventDefault()
    e.dataTransfer.dropEffect = 'copy'
    setDragOverPage(pageNumber)
  }

  const handleDragLeave = (e, pageNumber) => {
    // Only clear if we're actually leaving the page area
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX
    const y = e.clientY
    
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setDragOverPage(null)
    }
  }

  const handleDrop = (e, pageNumber) => {
    if (mode !== 'edit') return
    e.preventDefault()
    setDragOverPage(null)
    
    const type = e.dataTransfer.getData('application/x-field-type')
    if (!type) return
    
    const overlay = e.currentTarget
    const rect = overlay.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const pageSize = pageSizes[pageNumber]
    if (!pageSize) return
    
    // Convert to percentage coordinates
    const xPct = (x / pageSize.width) * 100
    const yPct = (y / pageSize.height) * 100
    
    onDropAddField(type, pageNumber, xPct, yPct)
  }

  const fieldsByPage = useMemo(() => {
    const map = {}
    for (const f of fields) {
      map[f.page] = map[f.page] || []
      map[f.page].push(f)
    }
    return map
  }, [fields])

  useEffect(() => {
    if (!activePage) return
    const el = pageRefs.current.get(activePage)
    if (el && el.scrollIntoView) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [activePage])

  // Handle clicks on the PDF to deselect fields
  const handlePDFClick = (e) => {
    // Only deselect if clicking on the PDF background, not on fields
    if (e.target.closest('.field-renderer')) return
    onSelectField?.(null)
  }

  return (
    <div className="pdf-container max-w-7xl mx-auto" ref={containerRef}>
      {!file ? (
        <div className="text-center text-gray-600 p-12">
          <div className="text-6xl mb-4">📄</div>
          <div className="text-lg font-medium mb-2">No PDF loaded</div>
          <div className="text-sm text-gray-500">Upload a PDF file to begin building your form</div>
        </div>
      ) : (
        <Document
          file={file}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={(err) => {
            // eslint-disable-next-line no-console
            console.error('Failed to load PDF:', err)
          }}
          error={<div className="text-red-600 text-sm p-4">Failed to load PDF. Please verify the file and try again.</div>}
          loading={
            <div className="text-center text-gray-600 p-12">
              <div className="text-2xl mb-4">⏳</div>
              <div className="text-lg">Loading PDF...</div>
            </div>
          }
        >
          {Array.from(new Array(numPages), (el, index) => {
            const pageNumber = index + 1
            const baseSize = pageSizes[pageNumber] || { width: containerWidth, height: Math.round(containerWidth * 1.294) }
            const pageSize = { width: Math.round(baseSize.width * zoom), height: Math.round(baseSize.height * zoom) }
            const isDragOver = dragOverPage === pageNumber && isDraggingFromToolbar
            
            return (
              <div key={`page_${pageNumber}`} className="relative flex justify-center my-4" ref={(el) => pageRefs.current.set(pageNumber, el)}>
                <div className="relative" style={{ width: Math.round(containerWidth * zoom) }}>
                  {/* PDF Page */}
                  <Page
                    pageNumber={pageNumber}
                    width={Math.round(containerWidth * zoom)}
                    renderAnnotationLayer={false}
                    renderTextLayer={false}
                  />
                  
                  {/* Field Overlay Container */}
                  <div
                    className={`overlay-container overlay-interactive transition-all duration-200 ${
                      isDragOver ? 'ring-4 ring-blue-400 ring-opacity-50' : ''
                    }`}
                    ref={getOverlayRef(pageNumber)}
                    onDragOver={(e) => handleDragOver(e, pageNumber)}
                    onDragLeave={(e) => handleDragLeave(e, pageNumber)}
                    onDrop={(e) => handleDrop(e, pageNumber)}
                    onClick={handlePDFClick}
                  >
                    {/* Drag Over Indicator */}
                    {isDragOver && (
                      <div className="absolute inset-0 bg-blue-50 bg-opacity-30 border-2 border-dashed border-blue-400 rounded flex items-center justify-center pointer-events-none">
                        <div className="text-blue-600 font-medium text-lg">
                          🎯 Drop here to add field
                        </div>
                      </div>
                    )}
                    
                    {/* Page Number Badge */}
                    <div className="absolute top-2 right-2 bg-gray-800 text-white text-xs px-2 py-1 rounded-full opacity-75">
                      Page {pageNumber}
                    </div>
                    
                    {/* Fields */}
                    {fieldsByPage[pageNumber]?.map((field) => (
                      <FieldRenderer
                        key={field.id}
                        field={field}
                        mode={mode}
                        pageSize={pageSize}
                        onDragStop={onDragStop}
                        onValueChange={onValueChange}
                        onDelete={onDeleteField}
                        onDuplicate={onDuplicateField}
                        onSelect={onSelectField}
                        isSelected={selectedField === field.id}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )
          })}
        </Document>
      )}
    </div>
  )
}
