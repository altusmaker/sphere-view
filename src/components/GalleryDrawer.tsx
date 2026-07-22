import React from 'react';
import { PanoramaItem } from '../types';
import { Image, Upload, ChevronUp, ChevronDown, Camera, Sparkles, MapPin } from 'lucide-react';

interface GalleryDrawerProps {
  panoramas: PanoramaItem[];
  selectedPanoramaId: string;
  isOpen: boolean;
  onToggleOpen: () => void;
  onSelectPanorama: (panorama: PanoramaItem) => void;
  onUploadClick: () => void;
}

export const GalleryDrawer: React.FC<GalleryDrawerProps> = ({
  panoramas,
  selectedPanoramaId,
  isOpen,
  onToggleOpen,
  onSelectPanorama,
  onUploadClick,
}) => {
  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-30 transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-y-0' : 'translate-y-[calc(100%-48px)]'
      }`}
    >
      <div className="max-w-6xl mx-auto px-4">
        {/* Toggle Drawer Handle */}
        <div className="flex justify-center">
          <button
            onClick={onToggleOpen}
            className="flex items-center gap-2 px-5 py-2 rounded-t-2xl bg-slate-900/90 text-slate-200 border-t border-x border-slate-800 shadow-lg backdrop-blur-xl hover:bg-slate-800 transition-colors text-xs font-semibold"
          >
            <Image className="w-4 h-4 text-cyan-400" />
            <span>360° Photo Locations ({panoramas.length})</span>
            {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>

        {/* Drawer Content */}
        <div className="p-4 rounded-t-2xl bg-slate-900/95 border-t border-slate-800 shadow-2xl backdrop-blur-2xl text-slate-100">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 max-h-56 overflow-y-auto p-1 custom-scrollbar">
            {/* Upload Custom Photo Card */}
            <button
              onClick={onUploadClick}
              className="group flex flex-col items-center justify-center gap-2 p-3 rounded-xl border border-dashed border-cyan-500/40 bg-cyan-500/5 hover:bg-cyan-500/15 hover:border-cyan-400 transition-all text-center min-h-[120px]"
            >
              <div className="p-2.5 rounded-full bg-cyan-500/20 text-cyan-400 group-hover:scale-110 transition-transform">
                <Upload className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold text-cyan-300">Upload 360° Photo</span>
              <span className="text-[10px] text-slate-400">JPG, PNG, WebP</span>
            </button>

            {/* Panorama Items Cards */}
            {panoramas.map((item) => {
              const isSelected = item.id === selectedPanoramaId;
              return (
                <div
                  key={item.id}
                  onClick={() => onSelectPanorama(item)}
                  className={`group relative flex flex-col justify-between p-2.5 rounded-xl border cursor-pointer overflow-hidden transition-all min-h-[120px] ${
                    isSelected
                      ? 'bg-slate-800 border-cyan-400 ring-2 ring-cyan-400/30 shadow-lg shadow-cyan-500/10'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/50'
                  }`}
                >
                  {/* Thumbnail / Category Badge */}
                  <div className="relative w-full h-16 rounded-lg overflow-hidden bg-slate-900">
                    <img
                      src={item.url}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                    <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded text-[9px] font-semibold bg-slate-900/80 text-cyan-300 border border-slate-700">
                      {item.category}
                    </span>
                  </div>

                  {/* Title & Info */}
                  <div className="mt-1.5">
                    <h4 className="text-xs font-semibold text-slate-200 truncate group-hover:text-cyan-300 transition-colors">
                      {item.title}
                    </h4>
                    {item.cameraModel && (
                      <p className="text-[10px] text-slate-400 truncate flex items-center gap-1 mt-0.5">
                        <Camera className="w-2.5 h-2.5 text-slate-500" />
                        <span>{item.cameraModel}</span>
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
