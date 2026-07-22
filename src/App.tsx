import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Viewer360 } from './components/Viewer360';
import { CompassHUD } from './components/CompassHUD';
import { ControlsOverlay } from './components/ControlsOverlay';
import { GalleryDrawer } from './components/GalleryDrawer';
import { AdjustmentsModal } from './components/AdjustmentsModal';
import { HotspotDialog } from './components/HotspotDialog';
import { InfoModal } from './components/InfoModal';
import { AddPinModal } from './components/AddPinModal';
import { JsonPinManagerModal } from './components/JsonPinManagerModal';
import { JsLibraryModal } from './components/JsLibraryModal';
import { SAMPLE_PANORAMAS } from './utils/samplePanoramas';
import { PanoramaItem, ProjectionMode, FisheyeParams, Hotspot } from './types';
import {
  Globe,
  Camera,
  MapPin,
  HelpCircle,
  Sparkles,
  Layers,
  Upload,
  CheckCircle2,
  FileJson,
  Code2,
} from 'lucide-react';

export default function App() {
  // Panoramas State
  const [panoramas, setPanoramas] = useState<PanoramaItem[]>(SAMPLE_PANORAMAS);
  const [activePanorama, setActivePanorama] = useState<PanoramaItem>(SAMPLE_PANORAMAS[0]);

  // Viewer Camera & State
  const [yaw, setYaw] = useState<number>(activePanorama.initialYaw || 0);
  const [pitch, setPitch] = useState<number>(activePanorama.initialPitch || 0);
  const [fov, setFov] = useState<number>(activePanorama.initialFov || 75);
  const [projectionMode, setProjectionMode] = useState<ProjectionMode>(
    activePanorama.projectionMode
  );
  const [fisheyeParams, setFisheyeParams] = useState<FisheyeParams>(
    activePanorama.fisheyeParams || {
      radius: 0.92,
      centerX: 0.5,
      centerY: 0.5,
      fovScale: 1.0,
      distortion: 0.1,
    }
  );

  const [isAutoRotating, setIsAutoRotating] = useState<boolean>(false);
  const [showHotspots, setShowHotspots] = useState<boolean>(true);
  const [showCompass, setShowCompass] = useState<boolean>(true);

  // Pin Mode & Pinning State
  const [isPinningMode, setIsPinningMode] = useState<boolean>(false);
  const [selectedPinCoords, setSelectedPinCoords] = useState<{ yaw: number; pitch: number } | null>(null);
  const [isAddPinModalOpen, setIsAddPinModalOpen] = useState<boolean>(false);

  // JSON Manager & JS Library Modals State
  const [isJsonManagerOpen, setIsJsonManagerOpen] = useState<boolean>(false);
  const [isJsLibraryOpen, setIsJsLibraryOpen] = useState<boolean>(false);

  // UI Modals & Drawers
  const [isGalleryOpen, setIsGalleryOpen] = useState<boolean>(true);
  const [isAdjustmentsOpen, setIsAdjustmentsOpen] = useState<boolean>(false);
  const [isInfoOpen, setIsInfoOpen] = useState<boolean>(false);
  const [activeHotspot, setActiveHotspot] = useState<Hotspot | null>(null);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [uploadSuccessToast, setUploadSuccessToast] = useState<string | null>(null);

  // File Input Ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle Panorama Switch
  const handleSelectPanorama = (item: PanoramaItem) => {
    setActivePanorama(item);
    setYaw(item.initialYaw || 0);
    setPitch(item.initialPitch || 0);
    setFov(item.initialFov || 75);
    setProjectionMode(item.projectionMode);
    if (item.fisheyeParams) {
      setFisheyeParams(item.fisheyeParams);
    }
  };

  // View Angles Update Callback from Viewer360
  const handleViewChange = useCallback(
    (state: { yaw: number; pitch: number; fov: number }) => {
      setYaw(state.yaw);
      setPitch(state.pitch);
      setFov(state.fov);
    },
    []
  );

  // Pin Placement Handler (from Raycasting in Viewer360)
  const handleSelectPinCoords = (coords: { yaw: number; pitch: number }) => {
    setSelectedPinCoords(coords);
    setIsAddPinModalOpen(true);
    setIsPinningMode(false);
  };

  // Add New Hotspot Pin
  const handleAddPin = (newPin: Hotspot) => {
    const updatedHotspots = [...(activePanorama.hotspots || []), newPin];
    const updatedPanorama = { ...activePanorama, hotspots: updatedHotspots };

    setActivePanorama(updatedPanorama);
    setPanoramas((prev) =>
      prev.map((p) => (p.id === activePanorama.id ? updatedPanorama : p))
    );

    setUploadSuccessToast(`Added pin "${newPin.title}"!`);
    setTimeout(() => setUploadSuccessToast(null), 3500);
  };

  // Import / Replace Hotspots from JSON
  const handleImportHotspots = (newHotspots: Hotspot[]) => {
    const updatedPanorama = { ...activePanorama, hotspots: newHotspots };
    setActivePanorama(updatedPanorama);
    setPanoramas((prev) =>
      prev.map((p) => (p.id === activePanorama.id ? updatedPanorama : p))
    );

    setUploadSuccessToast(`Loaded ${newHotspots.length} pin(s) from JSON!`);
    setTimeout(() => setUploadSuccessToast(null), 3500);
  };

  // Zoom Actions
  const handleZoomIn = () => {
    setFov((prev) => Math.max(30, prev - 10));
  };

  const handleZoomOut = () => {
    setFov((prev) => Math.min(110, prev + 10));
  };

  // Reset Orientation to North
  const handleResetOrientation = () => {
    setYaw(0);
    setPitch(0);
  };

  // Take High Res Snapshot
  const handleTakeSnapshot = () => {
    const canvas = document.querySelector('canvas');
    if (!canvas) return;

    const image = canvas.toDataURL('image/jpeg', 0.95);
    const link = document.createElement('a');
    link.href = image;
    link.download = `360_snapshot_${activePanorama.title.toLowerCase().replace(/\s+/g, '_')}.jpg`;
    link.click();
  };

  // Toggle Fullscreen
  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true));
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().then(() => setIsFullscreen(false));
      }
    }
  };

  // Handle File Upload (Drag & Drop or Button)
  const handleFileUpload = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file (JPG, PNG, WebP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (!result) return;

      const newItem: PanoramaItem = {
        id: `custom-${Date.now()}`,
        title: file.name.replace(/\.[^/.]+$/, ''),
        subtitle: 'User uploaded photo',
        category: 'Custom',
        url: result,
        projectionMode: 'equirectangular',
        initialYaw: 0,
        initialPitch: 0,
        initialFov: 75,
        cameraModel: 'Uploaded Photo',
      };

      setPanoramas((prev) => [newItem, ...prev]);
      handleSelectPanorama(newItem);

      setUploadSuccessToast(`Uploaded "${newItem.title}"!`);
      setTimeout(() => setUploadSuccessToast(null), 4000);
    };

    reader.readAsDataURL(file);
  };

  // Drop Event Handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  return (
    <div
      className="relative w-screen h-screen overflow-hidden bg-slate-950 font-sans text-slate-100 select-none"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleFileUpload(e.target.files[0]);
          }
        }}
      />

      {/* Main 360° WebGL Viewport */}
      <Viewer360
        imageUrl={activePanorama.url}
        projectionMode={projectionMode}
        fisheyeParams={fisheyeParams}
        yaw={yaw}
        pitch={pitch}
        fov={fov}
        isAutoRotating={isAutoRotating}
        autoRotateSpeed={0.5}
        showHotspots={showHotspots}
        hotspots={activePanorama.hotspots}
        isPinningMode={isPinningMode}
        onViewChange={handleViewChange}
        onHotspotClick={(spot) => setActiveHotspot(spot)}
        onSelectPinCoords={handleSelectPinCoords}
      />

      {/* Pin Mode Banner Overlay when active */}
      {isPinningMode && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-cyan-500 text-slate-950 font-bold text-xs shadow-2xl border border-cyan-300 backdrop-blur-md animate-pulse">
          <MapPin className="w-4 h-4 animate-bounce shrink-0" />
          <span>Click anywhere on the 360° photo to drop a detail pin!</span>
          <button
            onClick={() => setIsPinningMode(false)}
            className="ml-2 px-2 py-0.5 rounded-md bg-slate-950/20 text-slate-950 hover:bg-slate-950/40 text-[10px] font-black uppercase transition-colors"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Top Header Floating Navigation Bar */}
      <header className="absolute top-4 left-4 right-4 z-30 pointer-events-none flex items-center justify-between">
        {/* Brand & Location Title Pill */}
        <div className="pointer-events-auto flex items-center gap-3 p-2 pr-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-2xl backdrop-blur-xl">
          <div className="p-2.5 rounded-xl bg-cyan-500 text-slate-950 font-black shadow-md shadow-cyan-500/30">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold tracking-tight text-white">
                {activePanorama.title}
              </h1>
              {activePanorama.category && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                  {activePanorama.category}
                </span>
              )}
            </div>
            {activePanorama.locationName && (
              <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3 text-cyan-400 shrink-0" />
                <span>{activePanorama.locationName}</span>
                {activePanorama.cameraModel && (
                  <>
                    <span className="text-slate-600">•</span>
                    <span className="text-slate-400">{activePanorama.cameraModel}</span>
                  </>
                )}
              </p>
            )}
          </div>
        </div>

        {/* Top Right Tools: Compass & Help */}
        <div className="pointer-events-auto flex items-center gap-2">
          {/* Compass HUD */}
          {showCompass && (
            <CompassHUD
              yaw={yaw}
              pitch={pitch}
              fov={fov}
              onResetView={handleResetOrientation}
            />
          )}

          {/* Guide / Info Button */}
          <button
            onClick={() => setIsInfoOpen(true)}
            title="How to navigate & use fisheye mode"
            className="p-3 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 shadow-xl backdrop-blur-xl transition-all"
          >
            <HelpCircle className="w-5 h-5 text-cyan-400" />
          </button>
        </div>
      </header>

      {/* Center Toast Notification for Uploads */}
      {uploadSuccessToast && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-500/90 text-slate-950 font-semibold text-xs shadow-2xl backdrop-blur-md animate-bounce">
          <CheckCircle2 className="w-4 h-4" />
          <span>{uploadSuccessToast}</span>
        </div>
      )}

      {/* Floating Bottom Toolbar Overlay */}
      <div className="absolute bottom-16 left-4 right-4 z-30 pointer-events-none flex justify-center">
        <div className="pointer-events-auto w-full max-w-2xl">
          <ControlsOverlay
            projectionMode={projectionMode}
            isAutoRotating={isAutoRotating}
            showHotspots={showHotspots}
            isFullscreen={isFullscreen}
            isPinningMode={isPinningMode}
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
            onToggleAutoRotate={() => setIsAutoRotating(!isAutoRotating)}
            onToggleHotspots={() => setShowHotspots(!showHotspots)}
            onTogglePinningMode={() => setIsPinningMode(!isPinningMode)}
            onChangeProjection={(mode) => setProjectionMode(mode)}
            onOpenAdjustments={() => setIsAdjustmentsOpen(true)}
            onTakeSnapshot={handleTakeSnapshot}
            onToggleFullscreen={handleToggleFullscreen}
            onUploadClick={() => fileInputRef.current?.click()}
            onOpenJsonManager={() => setIsJsonManagerOpen(true)}
            onOpenJsLibrary={() => setIsJsLibraryOpen(true)}
          />
        </div>
      </div>

      {/* Sample Locations Drawer */}
      <GalleryDrawer
        panoramas={panoramas}
        selectedPanoramaId={activePanorama.id}
        isOpen={isGalleryOpen}
        onToggleOpen={() => setIsGalleryOpen(!isGalleryOpen)}
        onSelectPanorama={handleSelectPanorama}
        onUploadClick={() => fileInputRef.current?.click()}
      />

      {/* Add Pin Modal */}
      <AddPinModal
        isOpen={isAddPinModalOpen}
        coords={selectedPinCoords}
        onClose={() => setIsAddPinModalOpen(false)}
        onAddPin={handleAddPin}
      />

      {/* JSON Pin Manager Modal */}
      <JsonPinManagerModal
        isOpen={isJsonManagerOpen}
        hotspots={activePanorama.hotspots || []}
        onClose={() => setIsJsonManagerOpen(false)}
        onImportHotspots={handleImportHotspots}
      />

      {/* Universal JS Library Code Modal */}
      <JsLibraryModal
        isOpen={isJsLibraryOpen}
        onClose={() => setIsJsLibraryOpen(false)}
      />

      {/* Fisheye Lens Calibration Modal */}
      <AdjustmentsModal
        isOpen={isAdjustmentsOpen}
        params={fisheyeParams}
        onChange={(newParams) => setFisheyeParams(newParams)}
        onReset={() =>
          setFisheyeParams({
            radius: 0.92,
            centerX: 0.5,
            centerY: 0.5,
            fovScale: 1.0,
            distortion: 0.1,
          })
        }
        onClose={() => setIsAdjustmentsOpen(false)}
      />

      {/* Hotspot Info Dialog */}
      <HotspotDialog
        hotspot={activeHotspot}
        onClose={() => setActiveHotspot(null)}
      />

      {/* Help & Guide Modal */}
      <InfoModal isOpen={isInfoOpen} onClose={() => setIsInfoOpen(false)} />
    </div>
  );
}
