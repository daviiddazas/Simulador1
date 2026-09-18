import React, { useState } from 'react';
import { ForceVector } from '../types';
import { cartesianToSpherical, sphericalToCartesian } from '../utils/physics';
import { Plus, Trash2, Eye, EyeOff, Sliders, ChevronDown, ChevronUp } from 'lucide-react';

interface VectorControlPanelProps {
  forces: ForceVector[];
  onAddForce: () => void;
  onUpdateForce: (id: string, updated: Partial<ForceVector>) => void;
  onRemoveForce: (id: string) => void;
  onToggleVisibility: (id: string) => void;
}

const COLOR_PALETTE = [
  '#38bdf8', // sky
  '#a855f7', // purple
  '#f97316', // orange
  '#34d399', // emerald
  '#ec4899', // pink
  '#facc15', // yellow
  '#818cf8', // indigo
];

export const VectorControlPanel: React.FC<VectorControlPanelProps> = ({
  forces,
  onAddForce,
  onUpdateForce,
  onRemoveForce,
  onToggleVisibility,
}) => {
  // Store coordinate mode per vector: 'cartesian' | 'spherical'
  const [coordModes, setCoordModes] = useState<Record<string, 'cartesian' | 'spherical'>>({});
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const toggleCoordMode = (id: string) => {
    setCoordModes((prev) => ({
      ...prev,
      [id]: prev[id] === 'spherical' ? 'cartesian' : 'spherical',
    }));
  };

  const toggleCollapse = (id: string) => {
    setCollapsed((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div>
          <h3 className="text-sm font-semibold text-slate-100 uppercase tracking-wider font-mono">
            Vectores de Fuerza ({forces.length})
          </h3>
          <p className="text-xs text-slate-400">Componentes o Magnitud y Ángulos 3D</p>
        </div>
        <button
          type="button"
          onClick={onAddForce}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white transition-colors shadow-sm cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          Añadir Fuerza
        </button>
      </div>

      {forces.length === 0 ? (
        <div className="text-center py-6 border border-dashed border-slate-800 rounded-xl bg-slate-900/40">
          <p className="text-xs text-slate-400 mb-2">No hay fuerzas aplicadas actualmente.</p>
          <button
            type="button"
            onClick={onAddForce}
            className="text-xs text-cyan-400 hover:underline font-mono"
          >
            + Agregar primera fuerza
          </button>
        </div>
      ) : (
        <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
          {forces.map((f, idx) => {
            const mode = coordModes[f.id] || 'cartesian';
            const isCollapsed = collapsed[f.id] || false;
            const spherical = cartesianToSpherical(f.x, f.y, f.z);

            return (
              <div
                key={f.id}
                className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 shadow-md hover:border-slate-700 transition-colors"
              >
                {/* Header */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: f.color }}
                    />
                    <input
                      type="text"
                      value={f.name}
                      onChange={(e) => onUpdateForce(f.id, { name: e.target.value })}
                      className="bg-transparent text-xs font-mono font-bold text-slate-100 hover:bg-slate-800/60 px-1 py-0.5 rounded focus:outline-none focus:bg-slate-800 w-24"
                    />
                    <span className="text-[11px] font-mono text-slate-400">
                      |F| = {spherical.magnitude} N
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    {/* Toggle coordinate system */}
                    <button
                      type="button"
                      onClick={() => toggleCoordMode(f.id)}
                      className={`px-1.5 py-0.5 text-[10px] font-mono rounded transition-colors ${
                        mode === 'spherical'
                          ? 'bg-purple-900/60 text-purple-300 border border-purple-600/40'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                      title="Alternar entre Cartesiano (Fx, Fy, Fz) y Esférico (|F|, θ, φ)"
                    >
                      {mode === 'cartesian' ? 'XYZ' : '|F|,θ,φ'}
                    </button>

                    {/* Visibility */}
                    <button
                      type="button"
                      onClick={() => onToggleVisibility(f.id)}
                      className={`p-1 rounded transition-colors ${
                        f.visible ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-slate-400'
                      }`}
                      title={f.visible ? 'Ocultar vector' : 'Mostrar vector'}
                    >
                      {f.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    </button>

                    {/* Collapse toggle */}
                    <button
                      type="button"
                      onClick={() => toggleCollapse(f.id)}
                      className="p-1 text-slate-400 hover:text-slate-200 rounded transition-colors"
                    >
                      {isCollapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
                    </button>

                    {/* Remove */}
                    <button
                      type="button"
                      onClick={() => onRemoveForce(f.id)}
                      className="p-1 text-slate-500 hover:text-rose-400 rounded transition-colors"
                      title="Eliminar fuerza"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Body when expanded */}
                {!isCollapsed && (
                  <div className="mt-3 pt-2.5 border-t border-slate-800/80 space-y-2.5">
                    {mode === 'cartesian' ? (
                      // Cartesian Inputs: Fx, Fy, Fz
                      <div className="space-y-2">
                        {/* Fx */}
                        <div className="flex items-center gap-2">
                          <label className="text-xs font-mono font-semibold text-rose-400 w-7">Fx:</label>
                          <input
                            type="range"
                            min={-150}
                            max={150}
                            step={1}
                            value={f.x}
                            onChange={(e) => onUpdateForce(f.id, { x: parseFloat(e.target.value) || 0 })}
                            className="flex-1 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
                          />
                          <div className="flex items-center gap-1 w-16">
                            <input
                              type="number"
                              value={f.x}
                              onChange={(e) => onUpdateForce(f.id, { x: parseFloat(e.target.value) || 0 })}
                              className="w-full bg-slate-800 text-right text-xs font-mono text-slate-100 rounded px-1.5 py-0.5 border border-slate-700 focus:outline-none focus:border-rose-500"
                            />
                            <span className="text-[10px] text-slate-500">N</span>
                          </div>
                        </div>

                        {/* Fy */}
                        <div className="flex items-center gap-2">
                          <label className="text-xs font-mono font-semibold text-emerald-400 w-7">Fy:</label>
                          <input
                            type="range"
                            min={-150}
                            max={150}
                            step={1}
                            value={f.y}
                            onChange={(e) => onUpdateForce(f.id, { y: parseFloat(e.target.value) || 0 })}
                            className="flex-1 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                          />
                          <div className="flex items-center gap-1 w-16">
                            <input
                              type="number"
                              value={f.y}
                              onChange={(e) => onUpdateForce(f.id, { y: parseFloat(e.target.value) || 0 })}
                              className="w-full bg-slate-800 text-right text-xs font-mono text-slate-100 rounded px-1.5 py-0.5 border border-slate-700 focus:outline-none focus:border-emerald-500"
                            />
                            <span className="text-[10px] text-slate-500">N</span>
                          </div>
                        </div>

                        {/* Fz */}
                        <div className="flex items-center gap-2">
                          <label className="text-xs font-mono font-semibold text-blue-400 w-7">Fz:</label>
                          <input
                            type="range"
                            min={-150}
                            max={150}
                            step={1}
                            value={f.z}
                            onChange={(e) => onUpdateForce(f.id, { z: parseFloat(e.target.value) || 0 })}
                            className="flex-1 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                          />
                          <div className="flex items-center gap-1 w-16">
                            <input
                              type="number"
                              value={f.z}
                              onChange={(e) => onUpdateForce(f.id, { z: parseFloat(e.target.value) || 0 })}
                              className="w-full bg-slate-800 text-right text-xs font-mono text-slate-100 rounded px-1.5 py-0.5 border border-slate-700 focus:outline-none focus:border-blue-500"
                            />
                            <span className="text-[10px] text-slate-500">N</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      // Spherical Inputs: Magnitude, Azimuth, Elevation
                      <div className="space-y-2">
                        {/* Magnitude */}
                        <div className="flex items-center gap-2">
                          <label className="text-xs font-mono font-semibold text-amber-400 w-7">|F|:</label>
                          <input
                            type="range"
                            min={0}
                            max={200}
                            step={1}
                            value={spherical.magnitude}
                            onChange={(e) => {
                              const newMag = parseFloat(e.target.value) || 0;
                              const cart = sphericalToCartesian(newMag, spherical.azimuthTheta, spherical.elevationPhi);
                              onUpdateForce(f.id, cart);
                            }}
                            className="flex-1 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                          />
                          <div className="flex items-center gap-1 w-16">
                            <input
                              type="number"
                              min={0}
                              value={spherical.magnitude}
                              onChange={(e) => {
                                const newMag = parseFloat(e.target.value) || 0;
                                const cart = sphericalToCartesian(newMag, spherical.azimuthTheta, spherical.elevationPhi);
                                onUpdateForce(f.id, cart);
                              }}
                              className="w-full bg-slate-800 text-right text-xs font-mono text-slate-100 rounded px-1.5 py-0.5 border border-slate-700 focus:outline-none focus:border-amber-500"
                            />
                            <span className="text-[10px] text-slate-500">N</span>
                          </div>
                        </div>

                        {/* Azimuth θ (XZ plane) */}
                        <div className="flex items-center gap-2">
                          <label className="text-xs font-mono font-semibold text-cyan-400 w-7">θ:</label>
                          <input
                            type="range"
                            min={-180}
                            max={180}
                            step={1}
                            value={spherical.azimuthTheta}
                            onChange={(e) => {
                              const newTheta = parseFloat(e.target.value) || 0;
                              const cart = sphericalToCartesian(spherical.magnitude, newTheta, spherical.elevationPhi);
                              onUpdateForce(f.id, cart);
                            }}
                            className="flex-1 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                          />
                          <div className="flex items-center gap-1 w-16">
                            <input
                              type="number"
                              value={spherical.azimuthTheta}
                              onChange={(e) => {
                                const newTheta = parseFloat(e.target.value) || 0;
                                const cart = sphericalToCartesian(spherical.magnitude, newTheta, spherical.elevationPhi);
                                onUpdateForce(f.id, cart);
                              }}
                              className="w-full bg-slate-800 text-right text-xs font-mono text-slate-100 rounded px-1.5 py-0.5 border border-slate-700 focus:outline-none focus:border-cyan-500"
                            />
                            <span className="text-[10px] text-slate-500">°</span>
                          </div>
                        </div>

                        {/* Elevation φ (vertical above XZ) */}
                        <div className="flex items-center gap-2">
                          <label className="text-xs font-mono font-semibold text-pink-400 w-7">φ:</label>
                          <input
                            type="range"
                            min={-90}
                            max={90}
                            step={1}
                            value={spherical.elevationPhi}
                            onChange={(e) => {
                              const newPhi = parseFloat(e.target.value) || 0;
                              const cart = sphericalToCartesian(spherical.magnitude, spherical.azimuthTheta, newPhi);
                              onUpdateForce(f.id, cart);
                            }}
                            className="flex-1 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-pink-500"
                          />
                          <div className="flex items-center gap-1 w-16">
                            <input
                              type="number"
                              value={spherical.elevationPhi}
                              onChange={(e) => {
                                const newPhi = parseFloat(e.target.value) || 0;
                                const cart = sphericalToCartesian(spherical.magnitude, spherical.azimuthTheta, newPhi);
                                onUpdateForce(f.id, cart);
                              }}
                              className="w-full bg-slate-800 text-right text-xs font-mono text-slate-100 rounded px-1.5 py-0.5 border border-slate-700 focus:outline-none focus:border-pink-500"
                            />
                            <span className="text-[10px] text-slate-500">°</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Color Swatch Picker */}
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[10px] text-slate-500 uppercase font-mono">Color:</span>
                      <div className="flex items-center gap-1">
                        {COLOR_PALETTE.map((c) => (
                          <button
                            key={c}
                            type="button"
                            onClick={() => onUpdateForce(f.id, { color: c })}
                            className={`w-3.5 h-3.5 rounded-full transition-transform ${
                              f.color === c ? 'scale-125 ring-1 ring-white' : 'opacity-70 hover:opacity-100'
                            }`}
                            style={{ backgroundColor: c }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
