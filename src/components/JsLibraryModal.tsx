import React, { useState } from 'react';
import { Code2, Copy, Check, X, Terminal, Globe, Layers } from 'lucide-react';

interface JsLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const JsLibraryModal: React.FC<JsLibraryModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'html' | 'react' | 'next' | 'jsp'>('html');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const codeSnippets = {
    html: `<!-- 1. Include Three.js & StreetView360 Bundle in <head> -->
<script src="https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/streetview360-viewer@1.2.0/dist/streetview360.min.js"></script>

<!-- 2. Container Div -->
<div id="viewer360" style="width: 100%; height: 500px; position: relative;"></div>

<!-- 3. Initialize with Image & JSON Pins -->
<script>
  const viewer = new StreetView360({
    container: document.getElementById('viewer360'),
    imageUrl: 'https://example.com/streetview.jpg',
    autoRotate: true,
    showHotspots: true,
  });

  // Fetch pins from JSON file and display
  fetch('/data/pins.json')
    .then(res => res.json())
    .then(pins => viewer.setHotspots(pins));
</script>`,
    react: `import React, { useEffect, useRef } from 'react';
import { StreetView360Viewer } from 'streetview360-react';

export function MyStreetViewPage() {
  const [pins, setPins] = React.useState([]);

  useEffect(() => {
    // Fetch pin data list as JSON
    fetch('/api/pins.json')
      .then((res) => res.json())
      .then((data) => setPins(data));
  }, []);

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <StreetView360Viewer
        imageUrl="/images/panorama.jpg"
        hotspots={pins}
        autoRotate={false}
        onHotspotClick={(pin) => alert(pin.title + ': ' + pin.description)}
      />
    </div>
  );
}`,
    next: `'use client';
import dynamic from 'next/dynamic';

// Dynamic import with SSR disabled for Three.js WebGL canvas
const StreetView360 = dynamic(
  () => import('streetview360-react').then((mod) => mod.StreetView360Viewer),
  { ssr: false }
);

export default function Page() {
  return (
    <main className="w-full h-screen">
      <StreetView360
        imageUrl="/360-photo.jpg"
        pinsJsonUrl="/api/pins.json"
      />
    </main>
  );
}`,
    jsp: `<%-- 1. Include Script Libraries in JSP --%>
<script src="\${pageContext.request.contextPath}/static/js/three.min.js"></script>
<script src="\${pageContext.request.contextPath}/static/js/streetview360.min.js"></script>

<%-- 2. 360 Viewport Container --%>
<div id="jsp360Container" style="width: 100%; height: 600px;"></div>

<script>
  document.addEventListener('DOMContentLoaded', function() {
    var viewer = new StreetView360({
      container: document.getElementById('jsp360Container'),
      imageUrl: '\${panoramaUrl}',
      hotspots: JSON.parse('\${pinsJsonString}')
    });
  });
</script>`,
  };

  const currentCode = codeSnippets[activeTab];

  const handleCopy = () => {
    navigator.clipboard.writeText(currentCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-2xl bg-slate-900 border border-slate-700/80 shadow-2xl overflow-hidden text-slate-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-900">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Universal JS Library Integration</h3>
              <p className="text-xs text-slate-400">
                Embed this 360 viewer in React, Next.js, JSP, Vue, or vanilla HTML/JS
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex items-center border-b border-slate-800 bg-slate-950/60 px-5 gap-2">
          {(
            [
              { id: 'html', label: 'HTML / Vanilla JS' },
              { id: 'react', label: 'React' },
              { id: 'next', label: 'Next.js' },
              { id: 'jsp', label: 'JSP / Java Web' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-3 px-4 text-xs font-semibold border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-cyan-400 text-cyan-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Code Output */}
        <div className="p-5 space-y-4 overflow-y-auto">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">
              Copy & paste into your project codebase:
            </span>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-semibold transition-colors shadow-md shadow-cyan-500/20"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied Code!' : 'Copy Code Snippet'}
            </button>
          </div>

          <div className="rounded-xl bg-slate-950 border border-slate-800 p-4 font-mono text-xs text-cyan-300 overflow-x-auto">
            <pre>{currentCode}</pre>
          </div>
        </div>
      </div>
    </div>
  );
};
