import React from 'react';
import { HelpCircle, Move, ZoomIn, Disc, Upload, X, ShieldCheck, Sparkles } from 'lucide-react';

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InfoModal: React.FC<InfoModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl text-slate-100">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
          <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">360° Street View Guide</h3>
            <p className="text-xs text-slate-400">
              How to navigate 360° panoramic photos & explore locations
            </p>
          </div>
        </div>

        <div className="space-y-4 my-5 text-xs text-slate-300">
          <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <Move className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-white">Interactive 360° Panning</h4>
              <p className="text-slate-400 mt-0.5">
                Click and drag anywhere on the view to look left, right, up, or down. Inertia makes panning smooth.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <ZoomIn className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-white">Zoom In & Zoom Out</h4>
              <p className="text-slate-400 mt-0.5">
                Use your mouse scroll wheel or pinch gesture to zoom in for fine details or zoom out for a wide perspective.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <Disc className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-white">Huawei 360 & Circular Fisheye Unrolling</h4>
              <p className="text-slate-400 mt-0.5">
                Photos taken with Huawei 360, Ricoh Theta, or fisheye cameras are mathematically unwrapped into full spherical Street View scenes using custom GLSL shaders.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <Upload className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-white">Upload Your Own Photos</h4>
              <p className="text-slate-400 mt-0.5">
                Click "Upload Photo" or drag-and-drop any 360° panorama or fisheye camera shot from your device to view it immediately!
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 text-xs font-semibold transition-all shadow-md shadow-cyan-400/20"
        >
          Got it, start exploring!
        </button>
      </div>
    </div>
  );
};
