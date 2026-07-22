import React from 'react';

interface CompassHUDProps {
  yaw: number;
  pitch: number;
  fov: number;
  onResetView?: () => void;
}

export const CompassHUD: React.FC<CompassHUDProps> = ({ yaw, pitch, fov, onResetView }) => {
  // Normalize yaw to 0..360
  const normalizedYaw = ((yaw % 360) + 360) % 360;

  // Heading cardinal string
  const getCardinal = (heading: number) => {
    if (heading >= 337.5 || heading < 22.5) return 'N';
    if (heading >= 22.5 && heading < 67.5) return 'NE';
    if (heading >= 67.5 && heading < 112.5) return 'E';
    if (heading >= 112.5 && heading < 157.5) return 'SE';
    if (heading >= 157.5 && heading < 202.5) return 'S';
    if (heading >= 202.5 && heading < 247.5) return 'SW';
    if (heading >= 247.5 && heading < 292.5) return 'W';
    return 'NW';
  };

  return (
    <div className="flex items-center gap-3 px-3 py-2 rounded-2xl bg-slate-900/85 text-slate-100 border border-slate-700/60 shadow-xl backdrop-blur-md">
      {/* Rotating Dial */}
      <div
        onClick={onResetView}
        title="Click to reset orientation to North (0°)"
        className="relative w-11 h-11 rounded-full bg-slate-950/80 border border-slate-700 flex items-center justify-center cursor-pointer group hover:border-cyan-400 transition-colors"
      >
        {/* Compass Ring */}
        <div
          className="absolute inset-0 flex items-center justify-center transition-transform duration-75"
          style={{ transform: `rotate(${-normalizedYaw}deg)` }}
        >
          {/* North Pin */}
          <span className="absolute top-1 text-[10px] font-bold text-red-500">N</span>
          {/* South Pin */}
          <span className="absolute bottom-1 text-[9px] font-semibold text-slate-400">S</span>
          {/* East Pin */}
          <span className="absolute right-1.5 text-[9px] font-semibold text-slate-400">E</span>
          {/* West Pin */}
          <span className="absolute left-1.5 text-[9px] font-semibold text-slate-400">W</span>
        </div>

        {/* Static Center Needle */}
        <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 z-10 shadow-sm shadow-cyan-400/80" />
      </div>

      {/* Numerical Heading & Angles */}
      <div className="flex flex-col text-xs font-mono leading-tight">
        <div className="flex items-baseline gap-1.5 font-sans">
          <span className="font-bold text-cyan-400 text-sm tracking-wider">
            {getCardinal(normalizedYaw)}
          </span>
          <span className="text-slate-200 font-mono text-xs">{Math.round(normalizedYaw)}°</span>
        </div>
        <div className="text-[10px] text-slate-400 font-sans flex items-center gap-2">
          <span>Pitch: {Math.round(pitch)}°</span>
          <span>•</span>
          <span>FOV: {Math.round(fov)}°</span>
        </div>
      </div>
    </div>
  );
};
