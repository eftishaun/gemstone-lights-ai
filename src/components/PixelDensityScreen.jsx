import { useState, useRef } from 'react'
import { ArrowLeft, Info, X } from 'lucide-react'

export default function PixelDensityScreen({ image, segments: initialSegments, onBack, onGenerate }) {
  const [segments, setSegments] = useState(
    initialSegments.map(seg => ({ ...seg, density: 7.6 }))
  )
  const [showInfo, setShowInfo] = useState(true)
  const [selectedSegment, setSelectedSegment] = useState(null)
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isPanning, setIsPanning] = useState(false)
  const [lastPanPoint, setLastPanPoint] = useState({ x: 0, y: 0 })
  const canvasRef = useRef(null)

  const handleIncrease = () => {
    if (selectedSegment !== null) {
      setSegments(segments.map((seg, i) => 
        i === selectedSegment ? { ...seg, density: Math.max(seg.density - 2, 4) } : seg
      ))
    }
  }

  const handleDecrease = () => {
    if (selectedSegment !== null) {
      setSegments(segments.map((seg, i) => 
        i === selectedSegment ? { ...seg, density: Math.min(seg.density + 2, 30) } : seg
      ))
    }
  }

  const handleSegmentClick = (e, index) => {
    e.stopPropagation()
    setSelectedSegment(index)
  }

  const handleWheel = (e) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? 0.9 : 1.1
    const newZoom = Math.min(Math.max(zoom * delta, 0.5), 3)
    setZoom(newZoom)
  }

  const handleMouseDown = (e) => {
    if (e.button === 1 || e.button === 0) {
      setIsPanning(true)
      setLastPanPoint({ x: e.clientX, y: e.clientY })
    }
  }

  const handleMouseMove = (e) => {
    if (isPanning) {
      const dx = e.clientX - lastPanPoint.x
      const dy = e.clientY - lastPanPoint.y
      setPan({ x: pan.x + dx, y: pan.y + dy })
      setLastPanPoint({ x: e.clientX, y: e.clientY })
    }
  }

  const handleMouseUp = () => {
    setIsPanning(false)
  }

  const renderDots = (segment) => {
    const dots = []
    const points = segment.points
    const density = segment.density || 10
    
    for (let i = 0; i < points.length - 1; i++) {
      const start = points[i]
      const end = points[i + 1]
      const distance = Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2))
      const numDots = Math.floor(distance / density)
      
      for (let j = 0; j <= numDots; j++) {
        const t = j / numDots
        const x = start.x + (end.x - start.x) * t
        const y = start.y + (end.y - start.y) * t
        dots.push({ x, y })
      }
    }
    
    return dots
  }

  return (
    <div className="h-full flex flex-col bg-gray-50">
      <div className="bg-[#237BC0] text-white px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-medium">Pixel Density</h1>
        </div>
      </div>

      <div className="px-4 py-3 bg-white border-b border-gray-200" style={{ minHeight: '60px' }}>
        {selectedSegment !== null ? (
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-600 font-medium">Density:</span>
            <input
              type="range"
              min="0"
              max="100"
              value={Math.round(((30 - (segments[selectedSegment]?.density || 10)) / 28) * 100)}
              onChange={(e) => {
                const percentage = parseInt(e.target.value)
                const newDensity = 30 - (percentage / 100 * 28)
                setSegments(segments.map((seg, i) => 
                  i === selectedSegment ? { ...seg, density: newDensity } : seg
                ))
              }}
              className="flex-1 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #237BC0 0%, #237BC0 ${Math.round(((30 - (segments[selectedSegment]?.density || 10)) / 28) * 100)}%, #e5e7eb ${Math.round(((30 - (segments[selectedSegment]?.density || 10)) / 28) * 100)}%, #e5e7eb 100%)`
              }}
            />
            <span className="text-xs text-gray-600 font-medium min-w-[3ch]">
              {Math.round(((30 - (segments[selectedSegment]?.density || 10)) / 28) * 100)}%
            </span>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-xs text-gray-400">Select a line to adjust density</p>
          </div>
        )}
      </div>

      {showInfo && (
        <div className="bg-gray-100 border-b border-gray-300 px-4 py-2.5 flex items-start gap-2">
          <Info className="w-4 h-4 text-gray-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-gray-600 flex-1">
            Tap each line to change the pixel density. Try to choose a density that looks like 9 inch spacing.
          </p>
          <button onClick={() => setShowInfo(false)} className="flex-shrink-0">
            <X className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      )}

      <div className="flex-1 relative overflow-hidden">
        <div
          ref={canvasRef}
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className="absolute inset-0 cursor-grab active:cursor-grabbing"
        >
          <div
            style={{
              transform: `scale(${zoom})`,
              transformOrigin: '0 0',
              width: '100%',
              height: '100%',
              backgroundImage: `url(${image})`,
              backgroundSize: 'contain',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'center',
              position: 'absolute',
              left: `${pan.x}px`,
              top: `${pan.y}px`
            }}
          >
            <svg className="w-full h-full" style={{ position: 'absolute', top: 0, left: 0 }}>
              {segments.map((segment, index) => {
                const dots = renderDots(segment)
                const isSelected = selectedSegment === index
                return (
                  <g key={segment.id} onClick={(e) => handleSegmentClick(e, index)}>
                    {dots.map((dot, i) => (
                      <circle
                        key={i}
                        cx={dot.x}
                        cy={dot.y}
                        r={2 / zoom}
                        fill={segment.color}
                        className="cursor-pointer"
                        opacity={isSelected ? 1 : 0.6}
                      />
                    ))}
                    {segment.points.map((point, i) => (
                      <circle
                        key={`node-${i}`}
                        cx={point.x}
                        cy={point.y}
                        r={isSelected ? 5 / zoom : 4 / zoom}
                        fill={segment.color}
                        stroke="white"
                        strokeWidth={1.5 / zoom}
                        className="cursor-pointer"
                        opacity={isSelected ? 1 : 0.6}
                      />
                    ))}
                  </g>
                )
              })}
            </svg>
          </div>
        </div>
      </div>

      <div className="p-4">
        <button
          onClick={() => onGenerate(segments)}
          className="w-full bg-[#237BC0] text-white py-3 rounded-lg text-sm font-medium"
        >
          Done
        </button>
      </div>
    </div>
  )
}
