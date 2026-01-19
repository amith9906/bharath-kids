import { useState, useRef, useEffect } from 'react';
import { FiX, FiZoomIn, FiZoomOut, FiRotateCw } from 'react-icons/fi';

const ImageZoom = ({ src, alt, onClose }) => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState(0);
  const containerRef = useRef(null);

  const MIN_SCALE = 0.5;
  const MAX_SCALE = 4;
  const SCALE_STEP = 0.5;

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === '+' || e.key === '=') handleZoomIn();
      if (e.key === '-') handleZoomOut();
    };

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const handleZoomIn = () => {
    setScale((prev) => Math.min(prev + SCALE_STEP, MAX_SCALE));
  };

  const handleZoomOut = () => {
    setScale((prev) => Math.max(prev - SCALE_STEP, MIN_SCALE));
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleReset = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
    setRotation(0);
  };

  const handleMouseDown = (e) => {
    if (scale > 1) {
      setIsDragging(true);
      setStartPos({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - startPos.x,
        y: e.clientY - startPos.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e) => {
    if (e.touches.length === 1 && scale > 1) {
      setIsDragging(true);
      setStartPos({
        x: e.touches[0].clientX - position.x,
        y: e.touches[0].clientY - position.y
      });
    }
  };

  const handleTouchMove = (e) => {
    if (isDragging && e.touches.length === 1) {
      e.preventDefault();
      setPosition({
        x: e.touches[0].clientX - startPos.x,
        y: e.touches[0].clientY - startPos.y
      });
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const handleWheel = (e) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      handleZoomIn();
    } else {
      handleZoomOut();
    }
  };

  const handleDoubleClick = () => {
    if (scale === 1) {
      setScale(2);
    } else {
      handleReset();
    }
  };

  return (
    <div className="image-zoom-overlay" onClick={onClose}>
      {/* Controls */}
      <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleZoomOut();
          }}
          className="p-3 bg-white/20 hover:bg-white/30 rounded-full text-white transition-colors"
          disabled={scale <= MIN_SCALE}
        >
          <FiZoomOut className="w-5 h-5" />
        </button>
        <span className="text-white text-sm font-medium min-w-[60px] text-center">
          {Math.round(scale * 100)}%
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleZoomIn();
          }}
          className="p-3 bg-white/20 hover:bg-white/30 rounded-full text-white transition-colors"
          disabled={scale >= MAX_SCALE}
        >
          <FiZoomIn className="w-5 h-5" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleRotate();
          }}
          className="p-3 bg-white/20 hover:bg-white/30 rounded-full text-white transition-colors"
        >
          <FiRotateCw className="w-5 h-5" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="p-3 bg-white/20 hover:bg-white/30 rounded-full text-white transition-colors"
        >
          <FiX className="w-5 h-5" />
        </button>
      </div>

      {/* Image container */}
      <div
        ref={containerRef}
        className="image-zoom-container"
        onClick={(e) => e.stopPropagation()}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onWheel={handleWheel}
        onDoubleClick={handleDoubleClick}
        style={{ cursor: scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'zoom-in' }}
      >
        <img
          src={src}
          alt={alt}
          draggable={false}
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale}) rotate(${rotation}deg)`,
            transition: isDragging ? 'none' : 'transform 0.2s ease-out'
          }}
        />
      </div>

      {/* Mobile zoom controls at bottom */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 sm:hidden">
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleZoomOut();
          }}
          className="p-4 bg-white/20 hover:bg-white/30 rounded-full text-white"
        >
          <FiZoomOut className="w-6 h-6" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleReset();
          }}
          className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-full text-white text-sm"
        >
          Reset
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleZoomIn();
          }}
          className="p-4 bg-white/20 hover:bg-white/30 rounded-full text-white"
        >
          <FiZoomIn className="w-6 h-6" />
        </button>
      </div>

      {/* Instructions */}
      <div className="absolute bottom-4 left-4 text-white/60 text-xs hidden sm:block">
        Double-click to zoom • Scroll to zoom • Drag to pan • ESC to close
      </div>
    </div>
  );
};

export default ImageZoom;
