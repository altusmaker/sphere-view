import React from 'react';
import { FisheyeParams } from '../types';
import { Sliders, RotateCcw, X, Check } from 'lucide-react';

interface AdjustmentsModalProps {
  isOpen: boolean;
  params: FisheyeParams;
  onChange: (newParams: FisheyeParams) => void;
  onReset: () => void;
  onClose: () => void;
}

export const AdjustmentsModal: React.FC<AdjustmentsModalProps> = ({
  isOpen,
  params,
  onChange,
  onReset,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/15 text-amber-400">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold">Fisheye Lens Calibration</h3>
              <p className="text-xs text-slate-400">
                Adjust unrolling parameters for Huawei 360 & fisheye shots
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sliders Form */}
        <div className="space-y-5 my-6 text-xs">
          {/* Lens Radius */}
          <div>
            <div className="flex justify-between mb-1.5 font-medium">
              <span className="text-slate-300">Fisheye Circle Radius</span>
              <span className="text-cyan-400 font-mono">{(params.radius * 100).toFixed(0)}%</span>
            </div>
            <input
              type="range"
              min="0.3"
              max="1.2"
              step="0.01"
              value={params.radius}
              onChange={(e) => onChange({ ...params, radius: parseFloat(e.target.value) })}
              className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
            />
          </div>

          {/* Center X */}
          <div>
            <div className="flex justify-between mb-1.5 font-medium">
              <span className="text-slate-300">Center Offset X</span>
              <span className="text-cyan-400 font-mono">{params.centerX.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0.2"
              max="0.8"
              step="0.005"
              value={params.centerX}
              onChange={(e) => onChange({ ...params, centerX: parseFloat(e.target.value) })}
              className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
            />
          </div>

          {/* Center Y */}
          <div>
            <div className="flex justify-between mb-1.5 font-medium">
              <span className="text-slate-300">Center Offset Y</span>
              <span className="text-cyan-400 font-mono">{params.centerY.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0.2"
              max="0.8"
              step="0.005"
              value={params.centerY}
              onChange={(e) => onChange({ ...params, centerY: parseFloat(e.target.value) })}
              className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
            />
          </div>

          {/* Lens Field Of View Scale */}
          <div>
            <div className="flex justify-between mb-1.5 font-medium">
              <span className="text-slate-300">Optical FOV Expansion</span>
              <span className="text-cyan-400 font-mono">{params.fovScale.toFixed(2)}x</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="1.8"
              step="0.02"
              value={params.fovScale}
              onChange={(e) => onChange({ ...params, fovScale: parseFloat(e.target.value) })}
              className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
            />
          </div>

          {/* Radial Distortion Curve */}
          <div>
            <div className="flex justify-between mb-1.5 font-medium">
              <span className="text-slate-300">Curvature Distortion Correction</span>
              <span className="text-cyan-400 font-mono">{params.distortion.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="-0.5"
              max="0.5"
              step="0.01"
              value={params.distortion}
              onChange={(e) => onChange({ ...params, distortion: parseFloat(e.target.value) })}
              className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
            />
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          <button
            onClick={onReset}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-xl transition-all shadow-md shadow-cyan-400/20"
          >
            <Check className="w-4 h-4" />
            <span>Apply Calibration</span>
          </button>
        </div>
      </div>
    </div>
  );
};
