import React from 'react';
import { CableAnchor, StaticEquilibriumResult } from '../types';
import { Anchor, AlertTriangle, CheckCircle2, Scale } from 'lucide-react';

interface SuspendedSystemPanelProps {
  massKg: number;
  onUpdateMass: (mass: number) => void;
  gravity: number;
  onUpdateGravity: (g: number) => void;
  cableCount: 2 | 3;
  onUpdateCableCount: (count: 2 | 3) => void;
  anchors: CableAnchor[];
  onUpdateAnchor: (id: string, updated: Partial<CableAnchor>) => void;
  equilibriumResult: StaticEquilibriumResult;
}

export const SuspendedSystemPanel: React.FC<SuspendedSystemPanelProps> = ({
  massKg,
  onUpdateMass,
  gravity,
  onUpdateGravity,
  cableCount,
  onUpdateCableCount,
  anchors,
  onUpdateAnchor,
  equilibriumResult,
}) => {
  const weight = massKg * gravity;

  return (
    <div className="space-y-4">
      {/* Mass & Gravity */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 space-y-3">
        <div className="flex items-center justify-between pb-1 border-b border-slate-800/80">
          <div className="flex items-center gap-1.5 text-xs font-mono font-semibold text-slate-200">
            <Scale className="w-3.5 h-3.5 text-cyan-400" />
            Propiedades del Objeto
          </div>
          <span className="text-[11px] font-mono text-rose-400 font-semibold">
            Peso W = {weight.toFixed(1)} N
          </span>
        </div>

        {/* Mass */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-mono text-slate-300 w-16">Masa (m):</label>
          <input
            type="range"
            min={1}
            max={50}
            step={0.5}
            value={massKg}
            onChange={(e) => onUpdateMass(parseFloat(e.target.value) || 1)}
            className="flex-1 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
          />
          <div className="flex items-center gap-1 w-16">
            <input
              type="number"
              min={0.1}
              step={0.5}
              value={massKg}
              onChange={(e) => onUpdateMass(parseFloat(e.target.value) || 1)}
              className="w-full bg-slate-800 text-right text-xs font-mono text-slate-100 rounded px-1.5 py-0.5 border border-slate-700 focus:outline-none focus:border-cyan-500"
            />
            <span className="text-[10px] text-slate-400">kg</span>
          </div>
        </div>

        {/* Gravity presets */}
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-slate-400">Gravedad (g):</span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => onUpdateGravity(9.81)}
              className={`px-2 py-0.5 rounded text-[10px] transition-colors ${
                Math.abs(gravity - 9.81) < 0.05
                  ? 'bg-cyan-900/60 text-cyan-300 border border-cyan-600/50'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              Tierra (9.81)
            </button>
            <button
              type="button"
              onClick={() => onUpdateGravity(1.62)}
              className={`px-2 py-0.5 rounded text-[10px] transition-colors ${
                Math.abs(gravity - 1.62) < 0.05
                  ? 'bg-cyan-900/60 text-cyan-300 border border-cyan-600/50'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              Luna (1.62)
            </button>
            <button
              type="button"
              onClick={() => onUpdateGravity(24.79)}
              className={`px-2 py-0.5 rounded text-[10px] transition-colors ${
                Math.abs(gravity - 24.79) < 0.05
                  ? 'bg-cyan-900/60 text-cyan-300 border border-cyan-600/50'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              Júpiter (24.8)
            </button>
          </div>
        </div>
      </div>

      {/* Cable Selector */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-mono font-semibold text-slate-200">
            <Anchor className="w-3.5 h-3.5 text-blue-400" />
            Configuración de Cables
          </div>
          <div className="flex items-center bg-slate-800 p-0.5 rounded-lg text-xs font-mono">
            <button
              type="button"
              onClick={() => onUpdateCableCount(2)}
              className={`px-2 py-1 rounded-md transition-colors ${
                cableCount === 2 ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              2 Cables
            </button>
            <button
              type="button"
              onClick={() => onUpdateCableCount(3)}
              className={`px-2 py-1 rounded-md transition-colors ${
                cableCount === 3 ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              3 Cables (3D)
            </button>
          </div>
        </div>

        {/* Anchors coordinates */}
        <div className="space-y-2 pt-1">
          {anchors.slice(0, cableCount).map((anchor, idx) => {
            const tension = equilibriumResult.cablesTension?.[idx];
            const isInvalid = tension && !tension.isValid;

            return (
              <div
                key={anchor.id}
                className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-2 space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: anchor.color }} />
                    <span className="text-xs font-mono font-bold text-slate-200">{anchor.name}</span>
                  </div>
                  {tension ? (
                    <span
                      className={`text-xs font-mono font-semibold px-2 py-0.5 rounded ${
                        isInvalid
                          ? 'bg-rose-950/60 text-rose-400 border border-rose-800/50'
                          : 'bg-cyan-950/60 text-cyan-300 border border-cyan-800/50'
                      }`}
                    >
                      T_{idx + 1} = {tension.tension} N {isInvalid && '(Flojo)'}
                    </span>
                  ) : null}
                </div>

                {/* X, Y, Z sliders */}
                <div className="grid grid-cols-3 gap-1.5 pt-1 text-[11px] font-mono">
                  <div>
                    <span className="text-rose-400">X:</span>
                    <input
                      type="number"
                      step={0.1}
                      value={anchor.x}
                      onChange={(e) => onUpdateAnchor(anchor.id, { x: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-slate-900 text-right px-1 py-0.5 rounded border border-slate-800 focus:outline-none focus:border-rose-500 text-slate-200"
                    />
                  </div>
                  <div>
                    <span className="text-emerald-400">Y (Techo):</span>
                    <input
                      type="number"
                      step={0.1}
                      min={2}
                      max={5}
                      value={anchor.y}
                      onChange={(e) => onUpdateAnchor(anchor.id, { y: parseFloat(e.target.value) || 3.5 })}
                      className="w-full bg-slate-900 text-right px-1 py-0.5 rounded border border-slate-800 focus:outline-none focus:border-emerald-500 text-slate-200"
                    />
                  </div>
                  <div>
                    <span className="text-blue-400">Z:</span>
                    <input
                      type="number"
                      step={0.1}
                      value={anchor.z}
                      onChange={(e) => onUpdateAnchor(anchor.id, { z: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-slate-900 text-right px-1 py-0.5 rounded border border-slate-800 focus:outline-none focus:border-blue-500 text-slate-200"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Equilibrium Status Feedback */}
        {equilibriumResult.errorMessage ? (
          <div className="flex items-start gap-2 bg-amber-950/40 border border-amber-800/60 rounded-lg p-2 text-xs text-amber-300 font-mono">
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
            <span>{equilibriumResult.errorMessage}</span>
          </div>
        ) : equilibriumResult.isEquilibrium ? (
          <div className="flex items-center gap-2 bg-emerald-950/40 border border-emerald-800/60 rounded-lg p-2 text-xs text-emerald-300 font-mono">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Equilibrio Estático Perfecto: ΣT + W + F_ext = 0 N</span>
          </div>
        ) : null}
      </div>
    </div>
  );
};
