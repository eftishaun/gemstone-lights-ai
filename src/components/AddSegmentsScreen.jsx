import { useState, useRef } from 'react'
import { ArrowLeft, Plus, Trash2 } from 'lucide-react'

export default function AddSegmentsScreen({ image, segments: initialSegments, onBack, onNext }) {
  const [segments, setSegments] = useState(initialSegments)
  const [currentSegment, setCurrentSegment] = useState([])
  const [isDrawing, setIsDrawing] = useState(false)
  const [deleteMode, setDeleteMode] = useState(false)
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isPanning, setIsPanning] = useState(false)
  const [lastPanPoint, setLastPanPoint] = useState({ x: 0, y: 0 })
  const canvasRef = useRef(null)

  const colors = ['#22c55e', '#ef4444', '#3b82f6', '#f59e0b', '#8b5cf6']

  const handleCanvasClick = (e) => {
    if (!isDrawing || isPanning) return
    
    const rect = canvasRef.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / zoom - pan.x / zoom
    const y = (e.clientY - rect.top) / zoom - pan.y / zoom
    
    setCurrentSegment([...currentSegment, { x, y }])
  }

  const handleWheel = (e) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? 0.9 : 1.1
    const newZoom = Math.min(Math.max(zoom * delta, 0.5), 3)
    setZoom(newZoom)
  }

  const handleMouseDown = (e) => {
    if (e.button === 1 || (e.button === 0 && !isDrawing)) {
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

  const handleAddSegment = () => {
    setIsDrawing(true)
    setCurrentSegment([])
    setDeleteMode(false)
  }

  const handleDoneDrawing = () => {
    if (currentSegment.length >= 2) {
      setSegments([...segments, {
        id: Date.now(),
        points: currentSegment,
        color: colors[segments.length % colors.length]
      }])
    }
    setCurrentSegment([])
    setIsDrawing(false)
  }

  const handleDeleteMode = () => {
    setDeleteMode(!deleteMode)
    setIsDrawing(false)
  }

  const handleSegmentClick = (index) => {
    if (deleteMode) {
      setSegments(segments.filter((_, i) => i !== index))
    }
  }

  return (
    <div className="h-full flex flex-col bg-gray-50">
      <div className="bg-[#2B7FB8] text-white px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-medium">Add Segments</h1>
        </div>
        {isDrawing && (
          <button onClick={() => { setIsDrawing(false); setCurrentSegment([]) }} className="text-white text-sm">
            Cancel
          </button>
        )}
      </div>

      {!isDrawing && segments.length === 0 && (
        <div className="px-4 py-2.5">
          <button
            onClick={handleAddSegment}
            className="w-full bg-white border border-gray-300 rounded-lg py-2.5 flex items-center justify-center gap-1.5 text-gray-700 text-sm font-normal"
          >
            <Plus className="w-4 h-4" />
            Add Segment
          </button>
        </div>
      )}

      {!isDrawing && segments.length > 0 && (
        <div className="px-4 py-2.5 flex gap-2">
          <button
            onClick={handleAddSegment}
            className={`flex-1 bg-white border rounded-lg py-2.5 flex items-center justify-center gap-1.5 text-sm font-normal ${
              deleteMode ? 'border-gray-300 text-gray-700' : 'border-gray-300 text-gray-700'
            }`}
          >
            <Plus className="w-4 h-4" />
            Add Segment
          </button>
          <button
            onClick={handleDeleteMode}
            className={`flex-1 bg-white border rounded-lg py-2.5 flex items-center justify-center gap-1.5 text-sm font-normal ${
              deleteMode ? 'border-red-500 text-red-500 bg-red-50' : 'border-gray-300 text-gray-700'
            }`}
          >
            <Trash2 className="w-4 h-4" />
            Delete Segment
          </button>
        </div>
      )}

      {isDrawing && (
        <div className="px-4 py-2.5">
          <button
            onClick={handleDoneDrawing}
            disabled={currentSegment.length < 2}
            className="w-full bg-[#2B7FB8] text-white rounded-lg py-2.5 text-sm font-medium disabled:opacity-50"
          >
            Done
          </button>
        </div>
      )}

      <div className="flex-1 relative overflow-hidden">
        <div
          ref={canvasRef}
          onClick={handleCanvasClick}
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className={isDrawing ? "absolute inset-0 cursor-crosshair" : "absolute inset-0 cursor-grab active:cursor-grabbing"}
        >
          <div
            style={{
              transform: `scale(${zoom})`,
              transformOrigin: '0 0',
              width: '100%',
              height: '100%',
              backgroundImage: `url(${image})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              position: 'absolute',
              left: `${pan.x}px`,
              top: `${pan.y}px`
            }}
          >
            <svg className="w-full h-full" style={{ position: 'absolute', top: 0, left: 0 }}>
              {segments.map((segment, segmentIndex) => (
                <g key={segment.id} onClick={(e) => { e.stopPropagation(); handleSegmentClick(segmentIndex) }}>
                  <polyline
                    points={segment.points.map(p => `${p.x},${p.y}`).join(' ')}
                    fill="none"
                    stroke={segment.color}
                    strokeWidth="3"
                    className={deleteMode ? "cursor-pointer" : ""}
                  />
                  {segment.points.map((point, i) => (
                    <circle
                      key={i}
                      cx={point.x}
                      cy={point.y}
                      r="6"
                      fill={segment.color}
                      stroke="white"
                      strokeWidth="2"
                      className={deleteMode ? "cursor-pointer" : ""}
                    />
                  ))}
                </g>
              ))}
              {currentSegment.length > 0 && (
                <g>
                  <polyline
                    points={currentSegment.map(p => `${p.x},${p.y}`).join(' ')}
                    fill="none"
                    stroke={colors[segments.length % colors.length]}
                    strokeWidth="3"
                  />
                  {currentSegment.map((point, i) => (
                    <circle
                      key={i}
                      cx={point.x}
                      cy={point.y}
                      r="6"
                      fill={colors[segments.length % colors.length]}
                      stroke="white"
                      strokeWidth="2"
                    />
                  ))}
                </g>
              )}
            </svg>
          </div>
        </div>
      </div>

      <div className="p-4">
        <button
          onClick={() => onNext(segments)}
          disabled={segments.length === 0}
          className="w-full bg-[#2B7FB8] text-white py-3 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>
  )
}
