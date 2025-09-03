import React, { useRef } from 'react'
import SignaturePad from 'react-signature-canvas'

export default function SignatureField({ mode }) {
  const sigRef = useRef(null)

  if (mode === 'preview') {
    return (
      <div className="w-full h-full border border-gray-300 rounded relative bg-white">
        <SignaturePad
          ref={sigRef}
          canvasProps={{ className: 'w-full h-full rounded' }}
          penColor="#0f172a"
        />
        <div className="absolute top-1 right-1 flex gap-1">
          <button
            type="button"
            className="px-2 py-1 text-xs bg-white border border-gray-300 rounded shadow hover:bg-gray-100"
            onClick={() => sigRef.current?.clear()}
          >
            Clear
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="field-placeholder w-full h-full">Signature</div>
  )
}

