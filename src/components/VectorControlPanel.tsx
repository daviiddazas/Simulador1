import React, { useState } from 'react';
import { ForceVector } from '../types';
import { cartesianToSpherical, sphericalToCartesian } from '../utils/physics';
import { Plus, Trash2, Eye, EyeOff, ChevronDown, ChevronUp } from 'lucide-react';

interface VectorControlPanelProps {
  forces: ForceVector[];
  onAddForce: () => void;
  onUpdateForce: (id: string, updated: Partial<ForceVector>) => void;
  onRemoveForce: (id: string) => void;
  onToggleVisibility: (id: string) => void;
  theme?: 'light' | 'dark';
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
  theme = 'dark',
}) => {
  const isLight = theme === 'light';

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
    <div className="space-y-3 font-mono">
      {/* Header */}
      <div
        className={`flex items-center justify-between pb-2 border-b ${
          isLight ? 'border-slate-200' : 'border-slate-800'
        }`}
      >
        <div>
          <h3
            className={`text-sm font-bold uppercase tracking-wider ${
              isLight ? 'text-slate-900' : 'text-slate-100'
            }`}
          >
            Vectores de Fuerza ({forces.length})
          </h3>
          <p className={`text-xs font-sans ${isLight ? 'text-slate-600 font-medium' : 'text-slate-400'}`}>
            Componentes Cartesianas o Magnitud y Ángulos 3D
          </p>
        </div>
        <button
          type="button"
          onClick={onAddForce}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white transition-colors shadow-sm cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          Añadir Fuerza
        </button>
      </div>

      {forces.length === 0 ? (
        <div
          className={`text-center py-6 border border-dashed rounded-xl ${
            isLight
              ? 'border-slate-300 bg-slate-50 text-slate-600'
              : 'border-slate-800 bg-slate-900/40 text-slate-400'
          }`}
        >
          <p className="text-xs mb-2">No hay fuerzas aplicadas actualmente.</p>
          <button
            type="button"
            onClick={onAddForce}
            className="text-xs text-cyan-600 dark:text-cyan-400 hover:underline font-bold"
          >
            + Agregar primera fuerza
          </button>
        </div>
      ) : (
        <div className="space-y-2.5 max-h-[400px] overflow-y-auto pr-1">
          {forces.map((f) => {
            const mode = coordModes[f.id] || 'cartesian';
            const isCollapsed = collapsed[f.id] || false;
            const spherical = cartesianToSpherical(f.x, f.y, f.z);

            return (
              <div
                key={f.id}
                className={`rounded-xl p-3 shadow-md border transition-colors ${
                  isLight
                    ? 'bg-slate-50 border-slate-200 hover:border-slate-300'
                    : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Header */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="w-3.5 h-3.5 rounded-full shrink-0 shadow-xs"
                      style={{ backgroundColor: f.color }}
                    />
                    <input
                      type="text"
                      value={f.name}
                      onChange={(e) => onUpdateForce(f.id, { name: e.target.value })}
                      className={`text-xs font-bold px-1.5 py-0.5 rounded border focus:outline-none w-24 ${
                        isLight
                          ? 'bg-white border-slate-300 text-slate-900 focus:border-cyan-500'
                          : 'bg-slate-800/80 border-slate-700 text-slate-100 focus:border-cyan-400'
                      }`}
                    />
                    <span
                      className={`text-[11px] font-semibold truncate ${
                        isLight ? 'text-slate-700' : 'text-slate-300'
                      }`}
                    >
                      |F| = {spherical.magnitude} N
                    </span>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    {/* Toggle coordinate system */}
                    <button
                      type="button"
                      onClick={() => toggleCoordMode(f.id)}
                      className={`px-1.5 py-0.5 text-[10px] rounded font-bold transition-colors cursor-pointer ${
                        mode === 'spherical'
                          ? isLight
                            ? 'bg-purple-100 text-purple-800 border border-purple-300'
                            : 'bg-purple-900/60 text-purple-300 border border-purple-600/50'
                          : isLight
                          ? 'bg-slate-200 text-slate-700 hover:bg-slate-300 border border-slate-300'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
                      }`}
                      title="Alternar entre Cartesiano (Fx, Fy, Fz) y Esférico (|F|, θ, φ)"
                    >
                      {mode === 'cartesian' ? 'XYZ' : '|F|,θ,φ'}
                    </button>

                    {/* Visibility */}
                    <button
                      type="button"
                      onClick={() => onToggleVisibility(f.id)}
                      className={`p-1 rounded transition-colors cursor-pointer ${
                        f.visible
                          ? isLight
                            ? 'text-slate-700 hover:text-slate-950'
                            : 'text-slate-300 hover:text-white'
                          : 'text-slate-400 hover:text-slate-600 opacity-50'
                      }`}
                      title={f.visible ? 'Ocultar vector' : 'Mostrar vector'}
                    >
                      {f.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    </button>

                    {/* Collapse toggle */}
                    <button
                      type="button"
                      onClick={() => toggleCollapse(f.id)}
                      className={`p-1 rounded transition-colors cursor-pointer ${
                        isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {isCollapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
                    </button>

                    {/* Remove */}
                    <button
                      type="button"
                      onClick={() => onRemoveForce(f.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                      title="Eliminar fuerza"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Body when expanded */}
                {!isCollapsed && (
                  <div
                    className={`mt-3 pt-2.5 border-t space-y-2.5 ${
                      isLight ? 'border-slate-200' : 'border-slate-800'
                    }`}
                  >
                    {mode === 'cartesian' ? (
                      // Cartesian Inputs: Fx, Fy, Fz
                      <div className="space-y-2">
                        {/* Fx */}
                        <div className="flex items-center gap-2">
                          <label className={`text-xs font-bold w-7 ${isLight ? 'text-rose-600' : 'text-rose-400'}`}>
                            Fx:
                          </label>
                          <input
                            type="range"
                            min={-150}
                            max={150}
                            step={1}
                            value={f.x}
                            onChange={(e) => onUpdateForce(f.id, { x: parseFloat(e.target.value) || 0 })}
                            className={`flex-1 h-1.5 rounded-lg appearance-none cursor-pointer accent-rose-500 ${
                              isLight ? 'bg-slate-200' : 'bg-slate-800'
                            }`}
                          />
                          <div className="flex items-center gap-1 w-16">
                            <input
                              type="number"
                              value={f.x}
                              onChange={(e) => onUpdateForce(f.id, { x: parseFloat(e.target.value) || 0 })}
                              className={`w-full text-right text-xs font-bold rounded px-1.5 py-0.5 border focus:outline-none ${
                                isLight
                                  ? 'bg-white text-slate-900 border-slate-300 focus:border-rose-500'
                                  : 'bg-slate-800 text-slate-100 border-slate-700 focus:border-rose-500'
                              }`}
                            />
                            <span className={`text-[10px] font-semibold ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                              N
                            </span>
                          </div>
                        </div>

                        {/* Fy */}
                        <div className="flex items-center gap-2">
                          <label className={`text-xs font-bold w-7 ${isLight ? 'text-emerald-700' : 'text-emerald-400'}`}>
                            Fy:
                          </label>
                          <input
                            type="range"
                            min={-150}
                            max={150}
                            step={1}
                            value={f.y}
                            onChange={(e) => onUpdateForce(f.id, { y: parseFloat(e.target.value) || 0 })}
                            className={`flex-1 h-1.5 rounded-lg appearance-none cursor-pointer accent-emerald-500 ${
                              isLight ? 'bg-slate-200' : 'bg-slate-800'
                            }`}
                          />
                          <div className="flex items-center gap-1 w-16">
                            <input
                              type="number"
                              value={f.y}
                              onChange={(e) => onUpdateForce(f.id, { y: parseFloat(e.target.value) || 0 })}
                              className={`w-full text-right text-xs font-bold rounded px-1.5 py-0.5 border focus:outline-none ${
                                isLight
                                  ? 'bg-white text-slate-900 border-slate-300 focus:border-emerald-500'
                                  : 'bg-slate-800 text-slate-100 border-slate-700 focus:border-emerald-500'
                              }`}
                            />
                            <span className={`text-[10px] font-semibold ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                              N
                            </span>
                          </div>
                        </div>

                        {/* Fz */}
                        <div className="flex items-center gap-2">
                          <label className={`text-xs font-bold w-7 ${isLight ? 'text-blue-700' : 'text-blue-400'}`}>
                            Fz:
                          </label>
                          <input
                            type="range"
                            min={-150}
                            max={150}
                            step={1}
                            value={f.z}
                            onChange={(e) => onUpdateForce(f.id, { z: parseFloat(e.target.value) || 0 })}
                            className={`flex-1 h-1.5 rounded-lg appearance-none cursor-pointer accent-blue-500 ${
                              isLight ? 'bg-slate-200' : 'bg-slate-800'
                            }`}
                          />
                          <div className="flex items-center gap-1 w-16">
                            <input
                              type="number"
                              value={f.z}
                              onChange={(e) => onUpdateForce(f.id, { z: parseFloat(e.target.value) || 0 })}
                              className={`w-full text-right text-xs font-bold rounded px-1.5 py-0.5 border focus:outline-none ${
                                isLight
                                  ? 'bg-white text-slate-900 border-slate-300 focus:border-blue-500'
                                  : 'bg-slate-800 text-slate-100 border-slate-700 focus:border-blue-500'
                              }`}
                            />
                            <span className={`text-[10px] font-semibold ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                              N
                            </span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      // Spherical Inputs: Magnitude, Azimuth, Elevation
                      <div className="space-y-2">
                        {/* Magnitude */}
                        <div className="flex items-center gap-2">
                          <label className={`text-xs font-bold w-7 ${isLight ? 'text-amber-700' : 'text-amber-400'}`}>
                            |F|:
                          </label>
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
                            className={`flex-1 h-1.5 rounded-lg appearance-none cursor-pointer accent-amber-500 ${
                              isLight ? 'bg-slate-200' : 'bg-slate-800'
                            }`}
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
                              className={`w-full text-right text-xs font-bold rounded px-1.5 py-0.5 border focus:outline-none ${
                                isLight
                                  ? 'bg-white text-slate-900 border-slate-300 focus:border-amber-500'
                                  : 'bg-slate-800 text-slate-100 border-slate-700 focus:border-amber-500'
                              }`}
                            />
                            <span className={`text-[10px] font-semibold ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                              N
                            </span>
                          </div>
                        </div>

                        {/* Azimuth θ (XZ plane) */}
                        <div className="flex items-center gap-2">
                          <label className={`text-xs font-bold w-7 ${isLight ? 'text-cyan-700' : 'text-cyan-400'}`}>
                            θ:
                          </label>
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
                            className={`flex-1 h-1.5 rounded-lg appearance-none cursor-pointer accent-cyan-500 ${
                              isLight ? 'bg-slate-200' : 'bg-slate-800'
                            }`}
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
                              className={`w-full text-right text-xs font-bold rounded px-1.5 py-0.5 border focus:outline-none ${
                                isLight
                                  ? 'bg-white text-slate-900 border-slate-300 focus:border-cyan-500'
                                  : 'bg-slate-800 text-slate-100 border-slate-700 focus:border-cyan-500'
                              }`}
                            />
                            <span className={`text-[10px] font-semibold ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                              °
                            </span>
                          </div>
                        </div>

                        {/* Elevation φ (vertical above XZ) */}
                        <div className="flex items-center gap-2">
                          <label className={`text-xs font-bold w-7 ${isLight ? 'text-pink-700' : 'text-pink-400'}`}>
                            φ:
                          </label>
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
                            className={`flex-1 h-1.5 rounded-lg appearance-none cursor-pointer accent-pink-500 ${
                              isLight ? 'bg-slate-200' : 'bg-slate-800'
                            }`}
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
                              className={`w-full text-right text-xs font-bold rounded px-1.5 py-0.5 border focus:outline-none ${
                                isLight
                                  ? 'bg-white text-slate-900 border-slate-300 focus:border-pink-500'
                                  : 'bg-slate-800 text-slate-100 border-slate-700 focus:border-pink-500'
                              }`}
                            />
                            <span className={`text-[10px] font-semibold ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                              °
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Color Swatch Picker */}
                    <div className="flex items-center justify-between pt-1">
                      <span className={`text-[10px] uppercase font-bold ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                        Color:
                      </span>
                      <div className="flex items-center gap-1.5">
                        {COLOR_PALETTE.map((c) => (
                          <button
                            key={c}
                            type="button"
                            onClick={() => onUpdateForce(f.id, { color: c })}
                            className={`w-3.5 h-3.5 rounded-full transition-transform cursor-pointer ${
                              f.color === c
                                ? 'scale-125 ring-2 ring-cyan-500'
                                : 'opacity-70 hover:opacity-100 hover:scale-110'
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
