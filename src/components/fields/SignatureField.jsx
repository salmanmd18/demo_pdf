import React, { useEffect, useMemo, useRef } from 'react'
import SignaturePad from 'react-signature-canvas'

export default function SignatureField({ mode, value, onChange, width, height }) {
  const sigRef = useRef(null)
  const containerRef = useRef(null)
  
  // Ensure stable numeric sizes for the canvas to prevent CSS scaling artifacts
  const canvasSize = useMemo(() => ({
    width: Math.max(10, Math.floor(width || 300)),
    height: Math.max(10, Math.floor(height || 100)),
  }), [width, height])

  // Keep the internal canvas resolution in sync with CSS size and devicePixelRatio
  useEffect(() => {
    if (mode !== 'preview') return
    const container = containerRef.current
    if (!container) return
    
    const ro = new ResizeObserver(() => {
      const canvas = container.querySelector('canvas')
      if (!canvas) return
      
      const cssW = container.clientWidth || canvasSize.width
      const cssH = container.clientHeight || canvasSize.height
      const ratio = Math.max(1, window.devicePixelRatio || 1)
      
      if (Math.abs(canvas.width - cssW * ratio) > 1 || Math.abs(canvas.height - cssH * ratio) > 1) {
        // Preserve existing drawing if any via data URL
        const data = !sigRef.current?.isEmpty() ? sigRef.current?.toDataURL('image/png') : null
        canvas.width = Math.floor(cssW * ratio)
        canvas.height = Math.floor(cssH * ratio)
        canvas.style.width = cssW + 'px'
        canvas.style.height = cssH + 'px'
        
        // Clear any existing context and set up clean rendering
        const ctx = canvas.getContext('2d')
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        ctx.setTransform(1, 0, 0, 1, 0, 0)
        ctx.scale(ratio, ratio)
        
        // Restore signature if it existed
        if (data) {
          try { 
            sigRef.current.fromDataURL(data) 
          } catch {}
        }
      }
    })
    ro.observe(container)
    return () => ro.disconnect()
  }, [mode, canvasSize.width, canvasSize.height])

  if (mode === 'preview') {
    const handleEnd = () => {
      try {
        // Use a clean canvas for the data URL to avoid shadow artifacts
        const canvas = sigRef.current?.getCanvas()
        if (canvas) {
          // Create a temporary canvas to clean up the signature
          const tempCanvas = document.createElement('canvas')
          const tempCtx = tempCanvas.getContext('2d')
          
          tempCanvas.width = canvas.width
          tempCanvas.height = canvas.height
          
          // Clear background and draw signature cleanly
          tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height)
          tempCtx.drawImage(canvas, 0, 0)
          
          const dataUrl = tempCanvas.toDataURL('image/png')
          if (onChange) onChange(dataUrl)
        }
      } catch {}
    }

    const handleClear = () => {
      sigRef.current?.clear()
      onChange?.(null)
    }

    // Load previous signature if available
    useEffect(() => {
      if (value && sigRef.current) {
        try {
          sigRef.current.fromDataURL(value)
        } catch {}
      }
    }, [value])

    return (
      <div ref={containerRef} className="w-full h-full border border-gray-300 rounded relative bg-white overflow-hidden shadow-sm">
        <SignaturePad
          ref={sigRef}
          canvasProps={{ 
            className: 'w-full h-full block rounded cursor-crosshair', 
            width: canvasSize.width, 
            height: canvasSize.height,
            style: {
              // Ensure clean rendering without shadows
              filter: 'none',
              boxShadow: 'none',
              textShadow: 'none'
            }
          }}
          penColor="#000000"
          backgroundColor="rgba(255, 255, 255, 0)"
          onEnd={handleEnd}
          // Custom signature pad options for cleaner rendering
          minWidth={1}
          maxWidth={2.5}
          throttle={16}
        />
        
        {/* Signature Status */}
        {value && (
          <div className="absolute top-1 left-1">
            <div className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
              ✓ Signed
            </div>
          </div>
        )}
        
        {/* Clear Button */}
        <div className="absolute top-1 right-1 flex gap-1">
          <button
            type="button"
            className="px-2 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-100 hover:border-gray-400 transition-colors duration-200 shadow-sm"
            onClick={handleClear}
            title="Clear signature"
          >
            Clear
          </button>
        </div>
        
        {/* Instructions */}
        {!value && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-xs text-gray-400 bg-white bg-opacity-80 px-2 py-1 rounded">
              Draw your signature here
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="field-placeholder w-full h-full flex items-center justify-center text-center">
      <div className="flex flex-col items-center gap-1">
        <div className="text-lg">✍️</div>
        <div className="text-xs font-medium">Signature</div>
        {value ? (
          <div className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
            ✓ Signed
          </div>
        ) : (
          <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
            Not signed
          </div>
        )}
      </div>
    </div>
  )
}
