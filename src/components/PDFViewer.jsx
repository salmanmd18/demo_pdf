import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import FieldRenderer from './FieldRenderer.jsx'

// Configure PDF.js worker from pdfjs-dist for Vite builds
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.js',
  import.meta.url
).toString()

export default function PDFViewer({ file, fields, mode, onDropAddField, onDragStop, onValueChange }) {
  const containerRef = useRef(null)
  const [numPages, setNumPages] = useState(null)
  const [pageSizes, setPageSizes] = useState({}) // { [pageNumber]: {width, height} }
  const [containerWidth, setContainerWidth] = useState(800)

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

  const onPageRenderSuccess = useCallback((page, pageNumber) => {
    // Page viewport adjusted to our width; we can compute height via scale ratio
    try {
      const original = page._pageInfo?.view || [0, 0, page.originalWidth, page.originalHeight]
      const origWidth = original[2]
      const origHeight = original[3]
      const scale = containerWidth / origWidth
      setPageSizes((prev) => ({
        ...prev,
        [pageNumber]: { width: Math.round(origWidth * scale), height: Math.round(origHeight * scale) },
      }))
    } catch (e) {
      // Fallback: measure canvas element
      const canvas = document.querySelector(`.react-pdf__Page[data-page-number='${pageNumber}'] canvas`)
      if (canvas) {
        setPageSizes((prev) => ({ ...prev, [pageNumber]: { width: canvas.width, height: canvas.height } }))
      }
    }
  }, [containerWidth])

  const handleDragOver = (e) => {
    if (mode !== 'edit') return
    e.preventDefault()
    e.dataTransfer.dropEffect = 'copy'
  }

  const handleDrop = (e, pageNumber) => {
    if (mode !== 'edit') return
    e.preventDefault()
    const type = e.dataTransfer.getData('application/x-field-type')
    if (!type) return
    const overlay = e.currentTarget
    const rect = overlay.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const pageSize = pageSizes[pageNumber]
    if (!pageSize) return
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

  return (
    <div className="pdf-container max-w-6xl mx-auto" ref={containerRef}>
      {!file ? (
        <div className="text-gray-600 text-sm p-6">Upload a PDF to begin.</div>
      ) : (
        <Document file={file} onLoadSuccess={onDocumentLoadSuccess} onLoadError={console.error}>
          {Array.from(new Array(numPages), (el, index) => {
            const pageNumber = index + 1
            const pageSize = pageSizes[pageNumber] || { width: containerWidth, height: Math.round(containerWidth * 1.294) }
            return (
              <div key={`page_${pageNumber}`} className="relative flex justify-center my-3">
                <div className="relative" style={{ width: containerWidth }}>
                  <Page
                    pageNumber={pageNumber}
                    width={containerWidth}
                    renderAnnotationLayer={false}
                    renderTextLayer={false}
                    onRenderSuccess={(page) => onPageRenderSuccess(page, pageNumber)}
                  />
                  <div
                    className={`overlay-container overlay-interactive`}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, pageNumber)}
                    style={{ width: pageSize.width, height: pageSize.height }}
                  >
                    {fieldsByPage[pageNumber]?.map((field) => (
                      <FieldRenderer
                        key={field.id}
                        field={field}
                        mode={mode}
                        pageSize={pageSize}
                        onDragStop={onDragStop}
                        onValueChange={onValueChange}
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
