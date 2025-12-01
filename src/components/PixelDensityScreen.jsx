import { useState, useRef } from 'react'
import { ArrowLeft, Plus, Minus, Info, X } from 'lucide-react'

export default function PixelDensityScreen({ image, segments: initialSegments, onBack, onGenerate }) {
  const [segments, setSegments] = useState(
    initialSegments.map(seg => ({ ...seg, density: 10 }))
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

  const handleSegmentClick = (index) => {
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
      <div className="bg-[#2B7FB8] text-white px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-medium">Pixel Density</h1>
        </div>
        {selectedSegment !== null && (
          <div className="flex gap-1.5">
            <button
              onClick={handleDecrease}
              className="w-9 h-8 bg-white text-gray-700 rounded-md flex items-center justify-center"
            >
              <Minus className="w-4 h-4" />
            </button>
            <button
              onClick={handleIncrease}
              className="w-9 h-8 bg-white text-gray-700 rounded-md flex items-center justify-center"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {showInfo && (
        <div className="bg-gray-100 border-b border-gray-300 px-4 py-2.5 flex items-start gap-2">
          <Info className="w-4 h-4 text-gray-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-gray-600 flex-1">
            Tap each line to change the pixel density. Try to choose a density that looks like 9 inch spacing.
          </p>
          <button onClick={() => setShowInfo(false)}>
            <X className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      )}

      {!showInfo && (
        <button
          onClick={() => setShowInfo(true)}
          className="bg-gray-100 border-b border-gray-300 px-4 py-2.5 flex items-start gap-2 w-full text-left"
        >
          <Info className="w-4 h-4 text-gray-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-gray-600 flex-1">
            Tap each line to change the pixel density. Try to choose a density that looks like 9 inch spacing.
          </p>
        </button>
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
                  <g key={segment.id} onClick={() => handleSegmentClick(index)}>
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
          className="w-full bg-[#2B7FB8] text-white py-3 rounded-lg text-sm font-medium"
        >
          Done
        </button>
      </div>
    </div>
  )
}
