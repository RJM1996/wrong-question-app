import { useState, useRef, useEffect } from 'react'
import { X, ZoomIn, ZoomOut } from 'lucide-react'

function ImageZoomViewer({ imageUrl, onClose }) {
  const containerRef = useRef(null)
  const [scale, setScale] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const lastTouchDist = useRef(null)
  const lastTouchCenter = useRef(null)
  const isDragging = useRef(false)
  const lastDragPos = useRef({ x: 0, y: 0 })

  // 重置状态
  useEffect(() => {
    setScale(1)
    setPosition({ x: 0, y: 0 })
  }, [imageUrl])

  // 计算两点距离
  function getTouchDistance(touches) {
    const dx = touches[0].clientX - touches[1].clientX
    const dy = touches[0].clientY - touches[1].clientY
    return Math.sqrt(dx * dx + dy * dy)
  }

  // 计算两点中心
  function getTouchCenter(touches) {
    return {
      x: (touches[0].clientX + touches[1].clientX) / 2,
      y: (touches[0].clientY + touches[1].clientY) / 2
    }
  }

  // 触摸开始
  function handleTouchStart(e) {
    if (e.touches.length === 2) {
      lastTouchDist.current = getTouchDistance(e.touches)
      lastTouchCenter.current = getTouchCenter(e.touches)
      isDragging.current = false
    } else if (e.touches.length === 1 && scale > 1) {
      isDragging.current = true
      lastDragPos.current = {
        x: e.touches[0].clientX - position.x,
        y: e.touches[0].clientY - position.y
      }
    }
  }

  // 触摸移动
  function handleTouchMove(e) {
    e.preventDefault()

    if (e.touches.length === 2) {
      const dist = getTouchDistance(e.touches)
      const center = getTouchCenter(e.touches)

      if (lastTouchDist.current) {
        const newScale = Math.max(1, Math.min(4, scale * (dist / lastTouchDist.current)))
        const scaleRatio = newScale / scale
        setPosition(prev => ({
          x: center.x - (center.x - prev.x) * scaleRatio,
          y: center.y - (center.y - prev.y) * scaleRatio
        }))
        setScale(newScale)
      }

      lastTouchDist.current = dist
      lastTouchCenter.current = center
    } else if (e.touches.length === 1 && isDragging.current) {
      setPosition({
        x: e.touches[0].clientX - lastDragPos.current.x,
        y: e.touches[0].clientY - lastDragPos.current.y
      })
    }
  }

  // 触摸结束
  function handleTouchEnd(e) {
    if (e.touches.length < 2) {
      lastTouchDist.current = null
    }
    if (e.touches.length === 0) {
      isDragging.current = false
      if (scale < 1.1) {
        setScale(1)
        setPosition({ x: 0, y: 0 })
      }
    }
  }

  // 双击放大/缩小
  function handleDoubleClick() {
    if (scale > 1.5) {
      setScale(1)
      setPosition({ x: 0, y: 0 })
    } else {
      setScale(2)
    }
  }

  // 缩放按钮
  function zoomIn() {
    setScale(Math.min(4, scale + 0.5))
  }

  function zoomOut() {
    const newScale = Math.max(1, scale - 0.5)
    if (newScale === 1) {
      setPosition({ x: 0, y: 0 })
    }
    setScale(newScale)
  }

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 bg-gray-900 z-50 flex items-center justify-center overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* 关闭按钮 */}
      <button
        className="absolute top-4 right-4 bg-gray-800/80 text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors z-10"
        onClick={onClose}
      >
        <X size={20} />
      </button>

      {/* 缩放控制 */}
      <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-3 z-10">
        <button
          onClick={zoomOut}
          disabled={scale === 1}
          className="bg-gray-800/80 text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-800 disabled:opacity-50 transition-colors"
        >
          <ZoomOut size={20} />
        </button>
        <div className="bg-gray-800/80 text-white px-4 py-2 rounded-full flex items-center justify-center text-sm font-medium min-w-[60px]">
          {Math.round(scale * 100)}%
        </div>
        <button
          onClick={zoomIn}
          disabled={scale === 4}
          className="bg-gray-800/80 text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-800 disabled:opacity-50 transition-colors"
        >
          <ZoomIn size={20} />
        </button>
      </div>

      {/* 提示 */}
      {scale === 1 && (
        <div className="absolute top-1/2 left-0 right-0 text-center text-white/60 text-xs z-10 pointer-events-none" style={{ transform: 'translateY(80px)' }}>
          双指缩放 · 双击放大 · 点击关闭
        </div>
      )}

      {/* 图片 */}
      <img
        src={imageUrl}
        alt="错题"
        className="max-w-full max-h-full object-contain transition-transform duration-100"
        style={{
          transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
          touchAction: 'none'
        }}
        onClick={() => {
          if (scale === 1) onClose()
        }}
        onDoubleClick={handleDoubleClick}
        draggable={false}
      />
    </div>
  )
}

export default ImageZoomViewer