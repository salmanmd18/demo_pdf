import React, { useState } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import workerSrc from 'pdfjs-dist/build/pdf.worker.min.js?url'

pdfjs.GlobalWorkerOptions.workerSrc = workerSrc

export default function Thumbnails({ file, activePage, onSelect }) {
  const [numPages, setNumPages] = useState(null)
  
  if (!file) return null
  
  return (
    <div className="w-28 sm:w-32 md:w-36 lg:w-40 shrink-0 overflow-auto bg-white border border-gray-200 rounded-lg p-3 h-[70vh] shadow-sm">
      <div className="sticky top-0 bg-white pb-2 mb-2 border-b border-gray-100">
        <h3 className="text-xs font-medium text-gray-700 uppercase tracking-wide">Pages</h3>
        <div className="text-xs text-gray-500 mt-1">{numPages || '...'} page{numPages !== 1 ? 's' : ''}</div>
      </div>
      
      <Document 
        file={file} 
        onLoadSuccess={({ numPages }) => setNumPages(numPages)}
        loading={
          <div className="text-center text-gray-500 py-4">
            <div className="text-lg mb-2">⏳</div>
            <div className="text-xs">Loading...</div>
          </div>
        }
      >
        {numPages
          ? Array.from(new Array(numPages), (el, index) => {
              const pageNumber = index + 1
              const isActive = activePage === pageNumber
              
              return (
                <button
                  key={`thumb_${pageNumber}`}
                  className={`block w-full mb-3 border rounded-lg overflow-hidden text-left transition-all duration-200 hover:shadow-md ${
                    isActive 
                      ? 'ring-2 ring-blue-500 border-blue-300 bg-blue-50 shadow-md' 
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                  onClick={() => onSelect(pageNumber)}
                  title={`Go to page ${pageNumber}`}
                >
                  <div className="relative">
                    <Page 
                      pageNumber={pageNumber} 
                      width={140} 
                      renderAnnotationLayer={false} 
                      renderTextLayer={false} 
                    />
                    
                    {/* Active page indicator */}
                    {isActive && (
                      <div className="absolute top-1 right-1 bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded-full shadow-sm">
                        ✓
                      </div>
                    )}
                    
                    {/* Page number overlay */}
                    <div className="absolute bottom-1 left-1 bg-black bg-opacity-70 text-white text-xs px-1.5 py-0.5 rounded">
                      {pageNumber}
                    </div>
                  </div>
                  
                  {/* Page label */}
                  <div className={`text-xs px-2 py-2 font-medium ${
                    isActive ? 'text-blue-700' : 'text-gray-600'
                  }`}>
                    Page {pageNumber}
                  </div>
                </button>
              )
            })
          : null}
      </Document>
      
      {/* Empty state */}
      {numPages === 0 && (
        <div className="text-center text-gray-500 py-8">
          <div className="text-2xl mb-2">📄</div>
          <div className="text-xs">No pages found</div>
        </div>
      )}
    </div>
  )
}
