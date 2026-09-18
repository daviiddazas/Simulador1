import React, { useState, useMemo } from 'react';
import { ForceVector, CableAnchor, SimulationMode, PresetScenario } from './types';
import { calculateNetForce, solveSuspendedEquilibrium } from './utils/physics';
import { PRESET_SCENARIOS } from './utils/presets';
import { Viewport3D } from './components/Viewport3D';
import { VectorControlPanel } from './components/VectorControlPanel';
import { SuspendedSystemPanel } from './components/SuspendedSystemPanel';
import { SummaryTable } from './components/SummaryTable';
import { StandaloneExportModal } from './components/StandaloneExportModal';
import {
  Layers,
  Compass,
  FileDown,
  Settings2,
  Grid,
  Sliders,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Info,
  Maximize2
} from 'lucide-react';

export default function App() {
  // Mode: 'free' (libre) or 'suspended' (suspendido)
  const [mode, setMode] = useState<SimulationMode>('free');

  // Applied Forces
  const [forces, setForces] = useState<ForceVector[]>([
    { id: 'f1', name: 'F₁', x: 80, y: 0, z: 0, color: '#38bdf8', visible: true },
    { id: 'f2', name: 'F₂', x: -40, y: 0, z: 69.3, color: '#a855f7', visible: true },
    { id: 'f3', name: 'F₃', x: -40, y: 0, z: -69.3, color: '#f97316', visible: true },
  ]);

  // Object & Cable Properties
  const [massKg, setMassKg] = useState<number>(10);
  const [gravity, setGravity] = useState<number>(9.81);
  const [cableCount, setCableCount] = useState<2 | 3>(2);
  const [anchors, setAnchors] = useState<CableAnchor[]>([
    { id: 'c1', name: 'Cable A', x: -2.0, y: 3.5, z: 0.0, color: '#06b6d4' },
    { id: 'c2', name: 'Cable B', x: 2.0, y: 3.5, z: 0.0, color: '#3b82f6' },
    { id: 'c3', name: 'Cable C', x: 0.0, y: 3.5, z: 2.2, color: '#8b5cf6' },
  ]);

  // Visual settings
  const [showGrid, setShowGrid] = useState(true);
  const [showAxes, setShowAxes] = useState(true);
  const [showComponents, setShowComponents] = useState(false);
  const [showLabels, setShowLabels] = useState(true);
  const [vectorScale, setVectorScale] = useState(0.025);

  // UI Panels state
  const [activeTab, setActiveTab] = useState<'vectors' | 'system' | 'summary'>('vectors');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [showScenarioMenu, setShowScenarioMenu] = useState(false);

  // Real-time Physics Calculations
  const objectPos = useMemo(
    () => (mode === 'suspended' ? { x: 0, y: 1.2, z: 0 } : { x: 0, y: 0, z: 0 }),
    [mode]
  );

  const netForceFree = useMemo(() => calculateNetForce(forces), [forces]);

  const equilibriumResult = useMemo(() => {
    if (mode === 'free') {
      return {
        isEquilibrium: netForceFree.magnitude < 0.05,
        netForce: netForceFree,
      };
    }
    return solveSuspendedEquilibrium(
      objectPos,
      massKg,
      gravity,
      forces,
      anchors.slice(0, cableCount)
    );
  }, [mode, objectPos, massKg, gravity, forces, anchors, cableCount, netForceFree]);

  const activeNetForce = mode === 'free' ? netForceFree : equilibriumResult.netForce;

  // Handlers for vectors
  const handleAddForce = () => {
    const palette = ['#38bdf8', '#a855f7', '#f97316', '#34d399', '#ec4899', '#facc15', '#818cf8'];
    const nextIdx = forces.length + 1;
    const newVector: ForceVector = {
      id: `f_${Date.now()}`,
      name: `F_${nextIdx}`,
      x: Math.round((Math.random() * 80 - 40)),
      y: Math.round((Math.random() * 80 - 40)),
      z: Math.round((Math.random() * 80 - 40)),
      color: palette[forces.length % palette.length],
      visible: true,
    };
    setForces((prev) => [...prev, newVector]);
  };

  const handleUpdateForce = (id: string, updated: Partial<ForceVector>) => {
    setForces((prev) => prev.map((f) => (f.id === id ? { ...f, ...updated } : f)));
  };

  const handleRemoveForce = (id: string) => {
    setForces((prev) => prev.filter((f) => f.id !== id));
  };

  const handleToggleVisibility = (id: string) => {
    setForces((prev) => prev.map((f) => (f.id === id ? { ...f, visible: !f.visible } : f)));
  };

  // Handlers for cables
  const handleUpdateAnchor = (id: string, updated: Partial<CableAnchor>) => {
    setAnchors((prev) => prev.map((a) => (a.id === id ? { ...a, ...updated } : a)));
  };

  // Load Preset Scenario
  const handleLoadScenario = (preset: PresetScenario) => {
    setMode(preset.mode);
    setForces(preset.forces);
    setMassKg(preset.objectMass);
    if (preset.cableCount) setCableCount(preset.cableCount);
    if (preset.anchors) setAnchors(preset.anchors);
    setShowScenarioMenu(false);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-950 text-slate-100 font-sans select-none">
      {/* 3D Viewport Main Area */}
      <div className="relative flex-1 h-full min-w-0">
        <Viewport3D
          mode={mode}
          forces={forces}
          netForce={activeNetForce}
          massKg={massKg}
          gravity={gravity}
          anchors={anchors.slice(0, cableCount)}
          equilibriumResult={equilibriumResult}
          showGrid={showGrid}
          showAxes={showAxes}
          showComponents={showComponents}
          showLabels={showLabels}
          vectorScale={vectorScale}
        />

        {/* Top Header Bar inside Viewport */}
        <header className="absolute top-4 left-4 right-4 pointer-events-none flex items-center justify-between z-20">
          <div className="pointer-events-auto flex items-center gap-2 bg-slate-900/85 backdrop-blur-md border border-slate-700/80 px-3.5 py-2 rounded-2xl shadow-xl">
            <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
            <div>
              <h1 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-100">
                Simulador 3D de Física y Vectores
              </h1>
              <span className="text-[10px] text-slate-400 font-mono">
                Three.js • Suma Vectorial y Equilibrio Estático
              </span>
            </div>
          </div>

          <div className="pointer-events-auto flex items-center gap-2">
            {/* Presets Button */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowScenarioMenu(!showScenarioMenu)}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-mono font-medium rounded-xl bg-slate-900/90 hover:bg-slate-800 text-cyan-300 border border-slate-700/80 backdrop-blur-md transition-colors shadow-lg cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>Casos Predefinidos</span>
              </button>

              {showScenarioMenu && (
                <div className="absolute right-0 mt-2 w-72 bg-slate-900/95 border border-slate-700 rounded-2xl p-2 shadow-2xl backdrop-blur-xl z-30 space-y-1 animate-fade-in">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 px-2 py-1 font-semibold">
                    Experimentos de Física
                  </div>
                  {PRESET_SCENARIOS.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => handleLoadScenario(preset)}
                      className="w-full text-left p-2 rounded-xl hover:bg-slate-800/80 transition-colors block text-xs"
                    >
                      <div className="font-semibold text-slate-200 font-mono">{preset.name}</div>
                      <div className="text-[11px] text-slate-400 line-clamp-2 mt-0.5">
                        {preset.description}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Export Standalone HTML Button */}
            <button
              type="button"
              onClick={() => setIsExportModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-mono font-semibold rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white border border-cyan-400/40 backdrop-blur-md transition-colors shadow-lg cursor-pointer"
              title="Descargar código completo index.html autónomo"
            >
              <FileDown className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Exportar index.html</span>
            </button>

            {/* Toggle Sidebar Collapse */}
            <button
              type="button"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 text-slate-300 hover:text-white bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 rounded-xl backdrop-blur-md transition-colors shadow-lg"
              title={isSidebarOpen ? 'Ocultar Panel Lateral' : 'Mostrar Panel Lateral'}
            >
              {isSidebarOpen ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>
        </header>

        {/* Floating Quick Stats Indicator (at top center) */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 pointer-events-none z-10 flex items-center gap-3 bg-slate-900/80 backdrop-blur-md border border-slate-800 px-3.5 py-1.5 rounded-full text-xs font-mono">
          <span className="text-slate-400">Modo:</span>
          <span className="font-bold text-cyan-300 uppercase">
            {mode === 'free' ? 'Objeto Libre' : `Suspendido (${cableCount} Cables)`}
          </span>
          <span className="text-slate-600">•</span>
          <span className="text-slate-400">|F_net|:</span>
          <span className={`font-bold ${activeNetForce.magnitude < 0.05 ? 'text-emerald-400' : 'text-amber-400'}`}>
            {activeNetForce.magnitude.toFixed(1)} N
          </span>
          <span className="text-slate-600">•</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              equilibriumResult.isEquilibrium
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                : 'bg-amber-950 text-amber-300 border border-amber-800'
            }`}
          >
            {equilibriumResult.isEquilibrium ? 'Equilibrio' : 'Dinámico'}
          </span>
        </div>
      </div>

      {/* Control Sidebar HUD */}
      {isSidebarOpen && (
        <aside className="w-96 h-full bg-slate-900/95 backdrop-blur-xl border-l border-slate-800 flex flex-col shadow-2xl z-30">
          {/* Mode Switch Tabs */}
          <div className="p-3 border-b border-slate-800">
            <div className="grid grid-cols-2 p-1 bg-slate-950 rounded-xl text-xs font-mono font-semibold">
              <button
                type="button"
                onClick={() => setMode('free')}
                className={`py-2 rounded-lg transition-all text-center ${
                  mode === 'free'
                    ? 'bg-cyan-600 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                1. Objeto Libre
              </button>
              <button
                type="button"
                onClick={() => setMode('suspended')}
                className={`py-2 rounded-lg transition-all text-center ${
                  mode === 'suspended'
                    ? 'bg-blue-600 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                2. Objeto Suspendido
              </button>
            </div>
          </div>

          {/* Sub Navigation Tabs */}
          <div className="flex border-b border-slate-800 bg-slate-900 text-xs font-mono">
            <button
              type="button"
              onClick={() => setActiveTab('vectors')}
              className={`flex-1 py-2 text-center border-b-2 transition-colors ${
                activeTab === 'vectors'
                  ? 'border-cyan-400 text-cyan-300 font-bold bg-slate-800/40'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Fuerzas ({forces.length})
            </button>
            {mode === 'suspended' && (
              <button
                type="button"
                onClick={() => setActiveTab('system')}
                className={`flex-1 py-2 text-center border-b-2 transition-colors ${
                  activeTab === 'system'
                    ? 'border-blue-400 text-blue-300 font-bold bg-slate-800/40'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                Cables & Masa
              </button>
            )}
            <button
              type="button"
              onClick={() => setActiveTab('summary')}
              className={`flex-1 py-2 text-center border-b-2 transition-colors ${
                activeTab === 'summary'
                  ? 'border-amber-400 text-amber-300 font-bold bg-slate-800/40'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Resultados
            </button>
          </div>

          {/* Scrollable Panel Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {activeTab === 'vectors' && (
              <VectorControlPanel
                forces={forces}
                onAddForce={handleAddForce}
                onUpdateForce={handleUpdateForce}
                onRemoveForce={handleRemoveForce}
                onToggleVisibility={handleToggleVisibility}
              />
            )}

            {activeTab === 'system' && mode === 'suspended' && (
              <SuspendedSystemPanel
                massKg={massKg}
                onUpdateMass={setMassKg}
                gravity={gravity}
                onUpdateGravity={setGravity}
                cableCount={cableCount}
                onUpdateCableCount={setCableCount}
                anchors={anchors}
                onUpdateAnchor={handleUpdateAnchor}
                equilibriumResult={equilibriumResult}
              />
            )}

            {activeTab === 'summary' && (
              <SummaryTable
                mode={mode}
                forces={forces}
                netForce={activeNetForce}
                massKg={massKg}
                gravity={gravity}
                anchors={anchors}
                cableCount={cableCount}
                equilibriumResult={equilibriumResult}
              />
            )}

            {/* Viewport Display Settings (always accessible at bottom of tabs) */}
            <div className="pt-2 border-t border-slate-800">
              <div className="flex items-center gap-1.5 text-xs font-mono font-semibold text-slate-400 mb-2">
                <Settings2 className="w-3.5 h-3.5 text-cyan-400" />
                Opciones de Visualización 3D
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                <label className="flex items-center gap-2 text-slate-300 cursor-pointer bg-slate-950/60 p-2 rounded-lg border border-slate-800/80 hover:border-slate-700">
                  <input
                    type="checkbox"
                    checked={showGrid}
                    onChange={(e) => setShowGrid(e.target.checked)}
                    className="rounded text-cyan-500 accent-cyan-500"
                  />
                  <span>Rejilla (Grid)</span>
                </label>
                <label className="flex items-center gap-2 text-slate-300 cursor-pointer bg-slate-950/60 p-2 rounded-lg border border-slate-800/80 hover:border-slate-700">
                  <input
                    type="checkbox"
                    checked={showAxes}
                    onChange={(e) => setShowAxes(e.target.checked)}
                    className="rounded text-cyan-500 accent-cyan-500"
                  />
                  <span>Ejes XYZ</span>
                </label>
                <label className="flex items-center gap-2 text-slate-300 cursor-pointer bg-slate-950/60 p-2 rounded-lg border border-slate-800/80 hover:border-slate-700">
                  <input
                    type="checkbox"
                    checked={showLabels}
                    onChange={(e) => setShowLabels(e.target.checked)}
                    className="rounded text-cyan-500 accent-cyan-500"
                  />
                  <span>Etiquetas 3D</span>
                </label>
                <label className="flex items-center gap-2 text-slate-300 cursor-pointer bg-slate-950/60 p-2 rounded-lg border border-slate-800/80 hover:border-slate-700">
                  <input
                    type="checkbox"
                    checked={showComponents}
                    onChange={(e) => setShowComponents(e.target.checked)}
                    className="rounded text-cyan-500 accent-cyan-500"
                  />
                  <span>Proyecciones</span>
                </label>
              </div>

              {/* Vector Scaling Slider */}
              <div className="mt-3 bg-slate-950/60 p-2 rounded-lg border border-slate-800/80">
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-1">
                  <span>Escala visual de flechas:</span>
                  <span className="text-slate-200">{(vectorScale * 100).toFixed(1)}%</span>
                </div>
                <input
                  type="range"
                  min={0.01}
                  max={0.05}
                  step={0.005}
                  value={vectorScale}
                  onChange={(e) => setVectorScale(parseFloat(e.target.value))}
                  className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                />
              </div>
            </div>
          </div>

          {/* Quick Footer info */}
          <div className="p-3 border-t border-slate-800 bg-slate-950/70 text-[11px] font-mono text-slate-400 flex items-center justify-between">
            <span>Arrastra para rotar • Rueda para zoom</span>
            <span className="text-cyan-400 font-semibold">ΣF = 0</span>
          </div>
        </aside>
      )}

      {/* Standalone Export Modal */}
      <StandaloneExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
      />
    </div>
  );
}
