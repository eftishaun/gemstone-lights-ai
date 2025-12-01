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

  const [draggingNode, setDraggingNode] = useState(null)

  const handleCanvasClick = (e) => {
    if (!isDrawing || isPanning || draggingNode) return
    
    const rect = canvasRef.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / zoom - pan.x / zoom
    const y = (e.clientY - rect.top) / zoom - pan.y / zoom
    
    setCurrentSegment([...currentSegment, { x, y }])
  }

  const handleNodeMouseDown = (e, segmentIndex, pointIndex) => {
    e.stopPropagation()
    if (isDrawing || deleteMode) return
    setDraggingNode({ segmentIndex, pointIndex })
  }

  const handleNodeDrag = (e) => {
    if (!draggingNode) return
    
    const rect = canvasRef.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / zoom - pan.x / zoom
    const y = (e.clientY - rect.top) / zoom - pan.y / zoom
    
    setSegments(segments.map((seg, segIdx) => {
      if (segIdx === draggingNode.segmentIndex) {
        return {
          ...seg,
          points: seg.points.map((p, pIdx) => 
            pIdx === draggingNode.pointIndex ? { x, y } : p
          )
        }
      }
      return seg
    }))
  }

  const handleNodeMouseUp = () => {
    setDraggingNode(null)
  }

  const handleWheel = (e) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? 0.9 : 1.1
    const newZoom = Math.min(Math.max(zoom * delta, 0.5), 3)
    setZoom(newZoom)
  }

  const handleMouseDown = (e) => {
    if (draggingNode) return
    if (e.button === 1 || (e.button === 0 && !isDrawing)) {
      setIsPanning(true)
      setLastPanPoint({ x: e.clientX, y: e.clientY })
    }
  }

  const handleMouseMove = (e) => {
    if (draggingNode) {
      handleNodeDrag(e)
      return
    }
    if (isPanning) {
      const dx = e.clientX - lastPanPoint.x
      const dy = e.clientY - lastPanPoint.y
      setPan({ x: pan.x + dx, y: pan.y + dy })
      setLastPanPoint({ x: e.clientX, y: e.clientY })
    }
  }

  const handleMouseUp = () => {
    setIsPanning(false)
    handleNodeMouseUp()
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
      <div className="bg-[#237BC0] text-white px-4 py-3 flex items-center justify-between">
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

      <div className="px-4 py-3 bg-white border-b border-gray-200" style={{ minHeight: '60px' }}>
        {!isDrawing ? (
          <div className="flex gap-2">
            <button
              onClick={handleAddSegment}
              className="flex-1 bg-white border border-gray-300 rounded-lg py-2.5 flex items-center justify-center gap-1.5 text-gray-700 text-sm font-normal"
            >
              <Plus className="w-4 h-4" />
              Add Segment
            </button>
            <button
              onClick={handleDeleteMode}
              disabled={segments.length === 0}
              className={`flex-1 bg-white border rounded-lg py-2.5 flex items-center justify-center gap-1.5 text-sm font-normal ${
                deleteMode ? 'border-red-500 text-red-500 bg-red-50' : 'border-gray-300 text-gray-700'
              } ${segments.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <Trash2 className="w-4 h-4" />
              Delete Segment
            </button>
          </div>
        ) : (
          <button
            onClick={handleDoneDrawing}
            disabled={currentSegment.length < 2}
            className="w-full bg-[#237BC0] text-white rounded-lg py-2.5 text-sm font-medium disabled:opacity-50"
          >
            Done
          </button>
        )}
      </div>

      {/* Spacer to match PixelDensityScreen info banner height */}
      <div className="bg-gray-100 border-b border-gray-300" style={{ minHeight: '44px' }} />

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
              backgroundSize: 'contain',
              backgroundRepeat: 'no-repeat',
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
                    strokeWidth={2 / zoom}
                    className={deleteMode ? "cursor-pointer" : ""}
                  />
                  {segment.points.map((point, i) => (
                    <circle
                      key={i}
                      cx={point.x}
                      cy={point.y}
                      r={4 / zoom}
                      fill={segment.color}
                      stroke="white"
                      strokeWidth={1.5 / zoom}
                      className={deleteMode ? "cursor-pointer" : "cursor-move"}
                      onMouseDown={(e) => handleNodeMouseDown(e, segmentIndex, i)}
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
                    strokeWidth={2 / zoom}
                  />
                  {currentSegment.map((point, i) => (
                    <circle
                      key={i}
                      cx={point.x}
                      cy={point.y}
                      r={4 / zoom}
                      fill={colors[segments.length % colors.length]}
                      stroke="white"
                      strokeWidth={1.5 / zoom}
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
          className="w-full bg-[#237BC0] text-white py-3 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>
  )
}
