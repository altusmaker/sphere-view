import React from 'react';
import { ProjectionMode } from '../types';
import {
  ZoomIn,
  ZoomOut,
  RotateCw,
  Maximize2,
  Minimize2,
  Upload,
  Camera,
  Sliders,
  MapPin,
  Globe,
  FileJson,
  Code2,
  PlusCircle,
} from 'lucide-react';

interface ControlsOverlayProps {
  projectionMode: ProjectionMode;
  isAutoRotating: boolean;
  showHotspots: boolean;
  isFullscreen: boolean;
  isPinningMode: boolean;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onToggleAutoRotate: () => void;
  onToggleHotspots: () => void;
  onTogglePinningMode: () => void;
  onChangeProjection: (mode: ProjectionMode) => void;
  onOpenAdjustments: () => void;
  onTakeSnapshot: () => void;
  onToggleFullscreen: () => void;
  onUploadClick: () => void;
  onOpenJsonManager: () => void;
  onOpenJsLibrary: () => void;
}

export const ControlsOverlay: React.FC<ControlsOverlayProps> = ({
  projectionMode,
  isAutoRotating,
  showHotspots,
  isFullscreen,
  isPinningMode,
  onZoomIn,
  onZoomOut,
  onToggleAutoRotate,
  onToggleHotspots,
  onTogglePinningMode,
  onChangeProjection,
  onOpenAdjustments,
  onTakeSnapshot,
  onToggleFullscreen,
  onUploadClick,
  onOpenJsonManager,
  onOpenJsLibrary,
}) => {
  const projectionOptions: Array<{ mode: ProjectionMode; label: string; icon: React.ReactNode }> =
    [
      {
        mode: 'equirectangular',
        label: '360° Street View',
        icon: <Globe className="w-4 h-4 text-cyan-400" />,
      },
    ];

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 p-2 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-2xl backdrop-blur-xl text-slate-200">
      {/* Left: Projection Mode Pills & Pin Mode Toggle */}
      <div className="flex items-center gap-1.5 overflow-x-auto">
        <div className="flex items-center gap-1 p-1 bg-slate-950/80 rounded-xl border border-slate-800/80">
          {projectionOptions.map((opt) => {
            const isActive = projectionMode === opt.mode;
            return (
              <button
                key={opt.mode}
                onClick={() => onChangeProjection(opt.mode)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent'
                }`}
              >
                {opt.icon}
                <span>{opt.label}</span>
              </button>
            );
          })}
        </div>

        {/* Pin Detail Mode Toggle Button */}
        <button
          onClick={onTogglePinningMode}
          title={isPinningMode ? 'Click anywhere on photo to place pin' : 'Click to enable Pin Detail Mode'}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
            isPinningMode
              ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-lg shadow-cyan-500/30 animate-pulse'
              : 'bg-slate-950/80 text-cyan-300 border-cyan-500/30 hover:bg-slate-800/80'
          }`}
        >
          <PlusCircle className="w-4 h-4 stroke-[2.5]" />
          <span>{isPinningMode ? 'Click Photo to Pin...' : '+ Add Pin Spot'}</span>
        </button>
      </div>

      {/* Right: Quick Action Controls */}
      <div className="flex items-center gap-1.5">
        {/* JSON Pin Manager */}
        <button
          onClick={onOpenJsonManager}
          title="Export / Fetch / Load Pins via JSON"
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-950/80 text-cyan-300 border border-slate-800/80 hover:bg-slate-800/80 transition-colors text-xs font-medium"
        >
          <FileJson className="w-4 h-4 text-cyan-400" />
          <span className="hidden sm:inline">JSON Pins</span>
        </button>

        {/* Embed JS Library Code */}
        <button
          onClick={onOpenJsLibrary}
          title="Universal JS Library Integration Code"
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-950/80 text-cyan-300 border border-slate-800/80 hover:bg-slate-800/80 transition-colors text-xs font-medium"
        >
          <Code2 className="w-4 h-4 text-cyan-400" />
          <span className="hidden md:inline">Embed JS Code</span>
        </button>

        {/* Zoom In / Out */}
        <div className="flex items-center bg-slate-950/80 rounded-xl border border-slate-800/80 p-0.5">
          <button
            onClick={onZoomIn}
            title="Zoom In (or Mouse Wheel Up)"
            className="p-2 text-slate-300 hover:text-white hover:bg-slate-800/80 rounded-lg transition-colors"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <div className="w-[1px] h-4 bg-slate-800" />
          <button
            onClick={onZoomOut}
            title="Zoom Out (or Mouse Wheel Down)"
            className="p-2 text-slate-300 hover:text-white hover:bg-slate-800/80 rounded-lg transition-colors"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
        </div>

        {/* Hotspots Toggle */}
        <button
          onClick={onToggleHotspots}
          title={showHotspots ? 'Hide Hotspots' : 'Show Hotspots'}
          className={`p-2 rounded-xl border transition-all ${
            showHotspots
              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
              : 'bg-slate-950/80 text-slate-400 border-slate-800/80 hover:text-slate-200 hover:bg-slate-800/80'
          }`}
        >
          <MapPin className="w-4 h-4" />
        </button>

        {/* Auto Rotate Spin */}
        <button
          onClick={onToggleAutoRotate}
          title={isAutoRotating ? 'Pause Auto Rotation' : 'Start Auto Rotation'}
          className={`p-2 rounded-xl border transition-all ${
            isAutoRotating
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 animate-pulse'
              : 'bg-slate-950/80 text-slate-400 border-slate-800/80 hover:text-slate-200 hover:bg-slate-800/80'
          }`}
        >
          <RotateCw className={`w-4 h-4 ${isAutoRotating ? 'animate-spin' : ''}`} />
        </button>

        {/* Snapshot */}
        <button
          onClick={onTakeSnapshot}
          title="Take High Resolution Snapshot"
          className="p-2 rounded-xl bg-slate-950/80 text-slate-300 border border-slate-800/80 hover:text-white hover:bg-slate-800/80 transition-colors"
        >
          <Camera className="w-4 h-4" />
        </button>

        {/* Upload Custom 360 Image */}
        <button
          onClick={onUploadClick}
          title="Upload Custom 360° Photo"
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-cyan-500 text-slate-950 hover:bg-cyan-400 transition-all text-xs font-semibold shadow-md shadow-cyan-500/20"
        >
          <Upload className="w-4 h-4" />
          <span className="hidden md:inline">Upload Photo</span>
        </button>

        {/* Fullscreen */}
        <button
          onClick={onToggleFullscreen}
          title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
          className="p-2 rounded-xl bg-slate-950/80 text-slate-300 border border-slate-800/80 hover:text-white hover:bg-slate-800/80 transition-colors"
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
};
