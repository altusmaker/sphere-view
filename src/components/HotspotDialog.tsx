import React, { useState, useRef } from 'react';
import { Hotspot } from '../types';
import {
  MapPin,
  X,
  ArrowRight,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Image as ImageIcon,
  Move,
  Maximize2,
  Minimize2,
} from 'lucide-react';

interface HotspotDialogProps {
  hotspot: Hotspot | null;
  onClose: () => void;
  onNavigate?: (targetPanoramaId: string) => void;
}

export const HotspotDialog: React.FC<HotspotDialogProps> = ({
  hotspot,
  onClose,
  onNavigate,
}) => {
  const [zoomScale, setZoomScale] = useState<number>(1);
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  // Reset zoom & pan when hotspot changes or modal opens
  React.useEffect(() => {
    setZoomScale(1);
    setPosition({ x: 0, y: 0 });
    setIsExpanded(false);
  }, [hotspot]);

  if (!hotspot) return null;

  const hasImage = Boolean(hotspot.imageUrl);

  // Zoom handlers for image
  const handleZoomIn = () => {
    setZoomScale((prev) => Math.min(4, Math.round((prev + 0.3) * 10) / 10));
  };

  const handleZoomOut = () => {
    setZoomScale((prev) => {
      const next = Math.max(1, Math.round((prev - 0.3) * 10) / 10);
      if (next === 1) setPosition({ x: 0, y: 0 });
      return next;
    });
  };

  const handleResetZoom = () => {
    setZoomScale(1);
    setPosition({ x: 0, y: 0 });
  };

  // Wheel zoom on image
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      handleZoomIn();
    } else {
      handleZoomOut();
    }
  };

  // Drag pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoomScale <= 1) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className={`relative w-full transition-all duration-300 rounded-2xl bg-slate-900 border border-slate-700/80 shadow-2xl overflow-hidden text-slate-100 flex flex-col ${
          hasImage
            ? isExpanded
              ? 'max-w-5xl h-[90vh]'
              : 'max-w-2xl max-h-[85vh]'
            : 'max-w-sm p-5'
        }`}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 z-20 p-2 rounded-xl bg-slate-950/70 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors border border-slate-800"
        >
          <X className="w-4 h-4" />
        </button>

        {/* --- OPTION A: PIN WITH PHOTO IMAGE --- */}
        {hasImage ? (
          <div className="flex flex-col h-full overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between pr-14">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                  <ImageIcon className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-bold">
                      Photo Pin Detail
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-slate-800 text-[10px] text-slate-400 font-mono">
                      Yaw: {hotspot.yaw}° / Pitch: {hotspot.pitch}°
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white">{hotspot.title}</h3>
                </div>
              </div>
            </div>

            {/* Interactive Image Container with Zoom & Drag Pan */}
            <div className="relative flex-1 bg-slate-950 overflow-hidden flex items-center justify-center min-h-[300px]">
              {/* Zoom & Viewport Controls Bar */}
              <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 p-1.5 rounded-xl bg-slate-900/90 border border-slate-800 backdrop-blur-md shadow-lg">
                <button
                  onClick={handleZoomIn}
                  title="Zoom In (+)"
                  className="p-1.5 rounded-lg text-slate-300 hover:text-cyan-300 hover:bg-slate-800 transition-colors"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button
                  onClick={handleZoomOut}
                  title="Zoom Out (-)"
                  className="p-1.5 rounded-lg text-slate-300 hover:text-cyan-300 hover:bg-slate-800 transition-colors"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <button
                  onClick={handleResetZoom}
                  title="Reset Zoom (100%)"
                  className="p-1.5 rounded-lg text-slate-300 hover:text-cyan-300 hover:bg-slate-800 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
                <div className="h-4 w-[1px] bg-slate-800 mx-1" />
                <span className="text-xs font-mono text-cyan-300 px-1 font-semibold">
                  {Math.round(zoomScale * 100)}%
                </span>
                {zoomScale > 1 && (
                  <span className="text-[10px] text-slate-400 flex items-center gap-1 bg-slate-950 px-2 py-0.5 rounded-md border border-slate-800">
                    <Move className="w-3 h-3 text-cyan-400" /> Drag to Pan
                  </span>
                )}
              </div>

              {/* Expand / Minimize Toggle */}
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="absolute top-3 right-14 z-10 p-2 rounded-xl bg-slate-900/90 text-slate-300 hover:text-cyan-300 hover:bg-slate-800 transition-colors border border-slate-800 shadow-lg"
                title={isExpanded ? 'Minimize View' : 'Maximize View'}
              >
                {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>

              {/* Image Stage */}
              <div
                className={`w-full h-full flex items-center justify-center p-2 select-none ${
                  zoomScale > 1 ? (isDragging ? 'cursor-grabbing' : 'cursor-grab') : ''
                }`}
                onWheel={handleWheel}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              >
                <img
                  src={hotspot.imageUrl}
                  alt={hotspot.title}
                  draggable={false}
                  className="max-w-full max-h-full object-contain transition-transform duration-75 rounded-lg shadow-2xl"
                  style={{
                    transform: `translate3d(${position.x}px, ${position.y}px, 0) scale(${zoomScale})`,
                  }}
                />
              </div>
            </div>

            {/* Bottom Caption / Description */}
            {hotspot.description && (
              <div className="p-4 bg-slate-900 border-t border-slate-800 text-xs text-slate-300">
                <p className="leading-relaxed">{hotspot.description}</p>
              </div>
            )}
          </div>
        ) : (
          /* --- OPTION B: SMALL COMPACT TEXT PIN MODULE --- */
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                <MapPin className="w-5 h-5 animate-bounce" />
              </div>
              <div className="pr-6">
                <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-bold">
                  Pinned Detail
                </span>
                <h3 className="text-base font-bold text-white">{hotspot.title}</h3>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80 text-xs leading-relaxed text-slate-300">
              {hotspot.description}
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono pt-1">
              <span>Yaw: {hotspot.yaw}°</span>
              <span>Pitch: {hotspot.pitch}°</span>
            </div>

            {/* Action button if spot is a navigation node */}
            {hotspot.targetPanoramaId && onNavigate && (
              <button
                onClick={() => onNavigate(hotspot.targetPanoramaId!)}
                className="w-full mt-2 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-semibold transition-all shadow-md shadow-cyan-500/20"
              >
                <span>Move to this Location</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
