import React, { useState } from 'react';
import { Hotspot } from '../types';
import { MapPin, X, Plus, Image as ImageIcon, Upload } from 'lucide-react';

interface AddPinModalProps {
  isOpen: boolean;
  coords: { yaw: number; pitch: number } | null;
  onClose: () => void;
  onAddPin: (pin: Hotspot) => void;
}

export const AddPinModal: React.FC<AddPinModalProps> = ({
  isOpen,
  coords,
  onClose,
  onAddPin,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [yaw, setYaw] = useState<number>(coords ? Math.round(coords.yaw * 10) / 10 : 0);
  const [pitch, setPitch] = useState<number>(coords ? Math.round(coords.pitch * 10) / 10 : 0);

  // Sync coords if changed
  React.useEffect(() => {
    if (coords) {
      setYaw(Math.round(coords.yaw * 10) / 10);
      setPitch(Math.round(coords.pitch * 10) / 10);
    }
  }, [coords]);

  if (!isOpen) return null;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) setImageUrl(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newHotspot: Hotspot = {
      id: `pin-${Date.now()}`,
      title: title.trim(),
      description: description.trim() || (imageUrl ? 'Photo detail view' : 'Custom pinned detail on 360° photo.'),
      imageUrl: imageUrl.trim() || undefined,
      yaw,
      pitch,
    };

    onAddPin(newHotspot);
    setTitle('');
    setDescription('');
    setImageUrl('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-2xl bg-slate-900 border border-slate-700/80 shadow-2xl p-6 text-slate-100 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <MapPin className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Pin Detail on 360° Photo</h3>
              <p className="text-xs text-slate-400">Save a point of interest with text or photo</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Pin Title <span className="text-cyan-400">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g., Main Entrance, Security Cam, Vintage Fountain"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Attach Normal Photo Image (Optional)
            </label>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/... or paste image URL"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="flex-1 px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-all"
                />
                <label className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium cursor-pointer border border-slate-700 transition-colors shrink-0">
                  <Upload className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Upload</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {imageUrl && (
                <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-slate-950 h-32 flex items-center justify-center p-1 group">
                  <img
                    src={imageUrl}
                    alt="Preview"
                    className="max-h-full max-w-full object-contain rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => setImageUrl('')}
                    className="absolute top-2 right-2 p-1 rounded-lg bg-black/70 text-slate-300 hover:text-white hover:bg-rose-600 transition-colors"
                    title="Remove Image"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Pins with images open an interactive viewer module with zoom & pan controls!
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Description / Detail Note
            </label>
            <textarea
              rows={2}
              placeholder="Enter details, instructions, or notes for this spot..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all resize-none"
            />
          </div>

          {/* Coordinates Grid */}
          <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-slate-950/80 border border-slate-800/80">
            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">
                Horizontal (Yaw)
              </label>
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-cyan-300 font-mono">
                <span>{yaw}°</span>
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">
                Vertical (Pitch)
              </label>
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-cyan-300 font-mono">
                <span>{pitch}°</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 text-xs font-semibold text-slate-300 hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs transition-colors shadow-lg shadow-cyan-500/25"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              Save Pin
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
