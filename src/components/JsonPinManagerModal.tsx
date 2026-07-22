import React, { useState } from 'react';
import { Hotspot } from '../types';
import {
  FileJson,
  Download,
  Copy,
  Check,
  Upload,
  X,
  RefreshCw,
  Code2,
  FileCode,
  Sparkles,
} from 'lucide-react';

interface JsonPinManagerModalProps {
  isOpen: boolean;
  hotspots: Hotspot[];
  onClose: () => void;
  onImportHotspots: (pins: Hotspot[]) => void;
}

export const JsonPinManagerModal: React.FC<JsonPinManagerModalProps> = ({
  isOpen,
  hotspots,
  onClose,
  onImportHotspots,
}) => {
  const [activeTab, setActiveTab] = useState<'export' | 'import' | 'api'>('export');
  const [copied, setCopied] = useState(false);
  const [importText, setImportText] = useState('');
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const formattedJson = JSON.stringify(hotspots, null, 2);

  // Copy JSON to clipboard
  const handleCopyJson = () => {
    navigator.clipboard.writeText(formattedJson);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Download JSON file
  const handleDownloadJson = () => {
    const blob = new Blob([formattedJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `360_pins_${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Process & Validate JSON string
  const processJsonData = (rawJson: string) => {
    setImportError(null);
    setImportSuccess(null);

    try {
      const parsed = JSON.parse(rawJson);
      if (!Array.isArray(parsed)) {
        throw new Error('JSON root must be an array of pin objects [ { "title": "...", "yaw": 0, ... } ]');
      }

      // Validate objects in array
      const validPins: Hotspot[] = parsed.map((item, index) => {
        if (typeof item.title !== 'string') {
          throw new Error(`Item at index ${index} missing required string property "title"`);
        }
        return {
          id: item.id || `imported-pin-${index}-${Date.now()}`,
          title: item.title,
          description: item.description || 'Imported JSON pin detail',
          yaw: typeof item.yaw === 'number' ? item.yaw : 0,
          pitch: typeof item.pitch === 'number' ? item.pitch : 0,
        };
      });

      onImportHotspots(validPins);
      setImportSuccess(`Successfully loaded ${validPins.length} pin(s) from JSON!`);
      setTimeout(() => {
        setImportSuccess(null);
        onClose();
      }, 1500);
    } catch (err: any) {
      setImportError(err.message || 'Invalid JSON format');
    }
  };

  // File Upload Handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setImportText(content);
        processJsonData(content);
      }
    };
    reader.readAsText(file);
  };

  // Load Preset Demo JSON
  const handleLoadDemoJson = () => {
    const demoPins: Hotspot[] = [
      {
        id: 'demo-1',
        title: 'Entrance Archway',
        description: 'Stone landmark at main square entry',
        yaw: 15,
        pitch: 10,
      },
      {
        id: 'demo-2',
        title: 'Observation Platform',
        description: '360 panoramic view point overlooking city horizon',
        yaw: -110,
        pitch: 25,
      },
      {
        id: 'demo-3',
        title: 'Visitor Information Center',
        description: 'Includes interactive kiosk & public rest area',
        yaw: 135,
        pitch: -15,
      },
    ];
    const demoString = JSON.stringify(demoPins, null, 2);
    setImportText(demoString);
    processJsonData(demoString);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-2xl bg-slate-900 border border-slate-700/80 shadow-2xl overflow-hidden text-slate-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <FileJson className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">360° Pin JSON Manager</h3>
              <p className="text-xs text-slate-400">
                Export, fetch & load pinned details using standard JSON
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

        {/* Navigation Tabs */}
        <div className="flex items-center border-b border-slate-800 bg-slate-950/60 px-5 gap-2">
          <button
            onClick={() => setActiveTab('export')}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'export'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileCode className="w-4 h-4" />
            Current Pins JSON ({hotspots.length})
          </button>
          <button
            onClick={() => setActiveTab('import')}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'import'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Upload className="w-4 h-4" />
            Load / Import JSON File
          </button>
          <button
            onClick={() => setActiveTab('api')}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'api'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code2 className="w-4 h-4" />
            API Fetch Snippet
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {/* TAB 1: EXPORT JSON */}
          {activeTab === 'export' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-400">
                  Live JSON output of pins currently on the 360 photo
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyJson}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? 'Copied!' : 'Copy JSON'}
                  </button>
                  <button
                    onClick={handleDownloadJson}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-semibold transition-colors shadow-md shadow-cyan-500/20"
                  >
                    <Download className="w-3.5 h-3.5 stroke-[2.5]" />
                    Download JSON File
                  </button>
                </div>
              </div>

              <div className="relative rounded-xl bg-slate-950 border border-slate-800 p-4 font-mono text-xs text-cyan-300 overflow-x-auto max-h-72">
                <pre>{formattedJson}</pre>
              </div>
            </div>
          )}

          {/* TAB 2: IMPORT JSON */}
          {activeTab === 'import' && (
            <div className="space-y-4">
              {/* File Dropzone */}
              <div className="border-2 border-dashed border-slate-700 hover:border-cyan-500/60 rounded-xl p-6 text-center bg-slate-950/40 transition-colors">
                <Upload className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-200 mb-1">
                  Upload a .json file containing pin data
                </p>
                <p className="text-[11px] text-slate-400 mb-3">
                  Format: array of objects with <code className="text-cyan-300">title</code>, <code className="text-cyan-300">yaw</code>, and <code className="text-cyan-300">pitch</code>
                </p>
                <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 cursor-pointer border border-slate-700 transition-colors">
                  <span>Browse JSON File</span>
                  <input
                    type="file"
                    accept=".json,application/json"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Textarea Paste JSON */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-300">
                    Or Paste JSON String Below:
                  </label>
                  <button
                    onClick={handleLoadDemoJson}
                    className="flex items-center gap-1 text-[11px] font-medium text-cyan-400 hover:underline"
                  >
                    <Sparkles className="w-3 h-3" />
                    Load Demo Sample Pins
                  </button>
                </div>
                <textarea
                  rows={6}
                  placeholder={`[\n  {\n    "title": "Main Entrance",\n    "description": "Double glass doors",\n    "yaw": 45,\n    "pitch": 12\n  }\n]`}
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition-all resize-none"
                />
              </div>

              {/* Status Messages */}
              {importError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium">
                  {importError}
                </div>
              )}
              {importSuccess && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-medium flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  {importSuccess}
                </div>
              )}

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => processJsonData(importText)}
                  disabled={!importText.trim()}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 font-semibold text-xs transition-colors shadow-lg shadow-cyan-500/25"
                >
                  <RefreshCw className="w-4 h-4 stroke-[2.5]" />
                  Render Pins from JSON
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: API FETCH CODE */}
          {activeTab === 'api' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-300 leading-relaxed">
                You can dynamically fetch pinned details from your backend or a static <code className="text-cyan-300">/pins.json</code> endpoint and pass them into the viewer:
              </p>

              <div className="rounded-xl bg-slate-950 border border-slate-800 p-4 font-mono text-xs text-slate-300 overflow-x-auto space-y-3">
                <div className="text-slate-500">// Fetch pin data from API or JSON file</div>
                <div>
                  <span className="text-purple-400">async function</span> <span className="text-blue-400">load360Pins</span>() {'{'}
                  <br />
                  &nbsp;&nbsp;<span className="text-purple-400">const</span> response = <span className="text-purple-400">await</span> <span className="text-blue-400">fetch</span>(<span className="text-emerald-400">'/api/pins.json'</span>);
                  <br />
                  &nbsp;&nbsp;<span className="text-purple-400">const</span> pinDataList = <span className="text-purple-400">await</span> response.<span className="text-blue-400">json</span>();
                  <br />
                  <br />
                  &nbsp;&nbsp;<span className="text-slate-500">// Initialize 360 viewer with fetched pins</span>
                  <br />
                  &nbsp;&nbsp;viewer.<span className="text-blue-400">setHotspots</span>(pinDataList);
                  <br />
                  {'}'}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-400 flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <span>
                  The 360 viewer automatically re-renders pulse badges and detail modals for any updated JSON pin objects without reloading the WebGL image texture.
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
