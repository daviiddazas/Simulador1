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
  theme?: 'light' | 'dark';
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
  theme = 'dark',
}) => {
  const isLight = theme === 'light';
  const weight = massKg * gravity;

  return (
    <div className="space-y-4 font-mono">
      {/* Mass & Gravity Card */}
      <div
        className={`rounded-xl p-3 space-y-3 border shadow-md transition-colors ${
          isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/90 border-slate-800'
        }`}
      >
        <div
          className={`flex items-center justify-between pb-1.5 border-b ${
            isLight ? 'border-slate-200' : 'border-slate-800/80'
          }`}
        >
          <div
            className={`flex items-center gap-1.5 text-xs font-bold ${
              isLight ? 'text-slate-900' : 'text-slate-200'
            }`}
          >
            <Scale className="w-3.5 h-3.5 text-cyan-500" />
            Propiedades del Objeto
          </div>
          <span className={`text-[11px] font-bold ${isLight ? 'text-rose-600' : 'text-rose-400'}`}>
            Peso W = {weight.toFixed(1)} N
          </span>
        </div>

        {/* Mass */}
        <div className="flex items-center gap-2">
          <label className={`text-xs font-bold w-16 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
            Masa (m):
          </label>
          <input
            type="range"
            min={1}
            max={50}
            step={0.5}
            value={massKg}
            onChange={(e) => onUpdateMass(parseFloat(e.target.value) || 1)}
            className={`flex-1 h-1.5 rounded-lg appearance-none cursor-pointer accent-cyan-500 ${
              isLight ? 'bg-slate-200' : 'bg-slate-800'
            }`}
          />
          <div className="flex items-center gap-1 w-16">
            <input
              type="number"
              min={0.1}
              step={0.5}
              value={massKg}
              onChange={(e) => onUpdateMass(parseFloat(e.target.value) || 1)}
              className={`w-full text-right text-xs font-bold rounded px-1.5 py-0.5 border focus:outline-none ${
                isLight
                  ? 'bg-white text-slate-900 border-slate-300 focus:border-cyan-500'
                  : 'bg-slate-800 text-slate-100 border-slate-700 focus:border-cyan-400'
              }`}
            />
            <span className={`text-[10px] font-semibold ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
              kg
            </span>
          </div>
        </div>

        {/* Gravity presets */}
        <div className="flex items-center justify-between text-xs">
          <span className={`font-semibold ${isLight ? 'text-slate-700' : 'text-slate-400'}`}>
            Gravedad (g):
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => onUpdateGravity(9.81)}
              className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors cursor-pointer ${
                Math.abs(gravity - 9.81) < 0.05
                  ? isLight
                    ? 'bg-cyan-100 text-cyan-800 border border-cyan-400'
                    : 'bg-cyan-900/60 text-cyan-300 border border-cyan-600/50'
                  : isLight
                  ? 'bg-slate-200 text-slate-700 hover:bg-slate-300 border border-slate-300'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              Tierra (9.81)
            </button>
            <button
              type="button"
              onClick={() => onUpdateGravity(1.62)}
              className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors cursor-pointer ${
                Math.abs(gravity - 1.62) < 0.05
                  ? isLight
                    ? 'bg-cyan-100 text-cyan-800 border border-cyan-400'
                    : 'bg-cyan-900/60 text-cyan-300 border border-cyan-600/50'
                  : isLight
                  ? 'bg-slate-200 text-slate-700 hover:bg-slate-300 border border-slate-300'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              Luna (1.62)
            </button>
            <button
              type="button"
              onClick={() => onUpdateGravity(24.79)}
              className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors cursor-pointer ${
                Math.abs(gravity - 24.79) < 0.05
                  ? isLight
                    ? 'bg-cyan-100 text-cyan-800 border border-cyan-400'
                    : 'bg-cyan-900/60 text-cyan-300 border border-cyan-600/50'
                  : isLight
                  ? 'bg-slate-200 text-slate-700 hover:bg-slate-300 border border-slate-300'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              Júpiter (24.8)
            </button>
          </div>
        </div>
      </div>

      {/* Cable Configuration Card */}
      <div
        className={`rounded-xl p-3 space-y-3 border shadow-md transition-colors ${
          isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/90 border-slate-800'
        }`}
      >
        <div className="flex items-center justify-between">
          <div
            className={`flex items-center gap-1.5 text-xs font-bold ${
              isLight ? 'text-slate-900' : 'text-slate-200'
            }`}
          >
            <Anchor className="w-3.5 h-3.5 text-blue-500" />
            Configuración de Cables
          </div>
          <div
            className={`flex items-center p-0.5 rounded-lg text-xs ${
              isLight ? 'bg-slate-200' : 'bg-slate-800'
            }`}
          >
            <button
              type="button"
              onClick={() => onUpdateCableCount(2)}
              className={`px-2 py-1 rounded-md transition-colors cursor-pointer ${
                cableCount === 2
                  ? 'bg-blue-600 text-white font-bold shadow-xs'
                  : isLight
                  ? 'text-slate-700 hover:text-slate-950'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              2 Cables
            </button>
            <button
              type="button"
              onClick={() => onUpdateCableCount(3)}
              className={`px-2 py-1 rounded-md transition-colors cursor-pointer ${
                cableCount === 3
                  ? 'bg-blue-600 text-white font-bold shadow-xs'
                  : isLight
                  ? 'text-slate-700 hover:text-slate-950'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              3 Cables (3D)
            </button>
          </div>
        </div>

        {/* Anchors coordinates list */}
        <div className="space-y-2 pt-1">
          {anchors.slice(0, cableCount).map((anchor, idx) => {
            const tension = equilibriumResult.cablesTension?.[idx];
            const isInvalid = tension && !tension.isValid;

            return (
              <div
                key={anchor.id}
                className={`rounded-lg p-2.5 space-y-1.5 border transition-colors ${
                  isLight
                    ? 'bg-white border-slate-200 shadow-xs'
                    : 'bg-slate-950/60 border-slate-800/80'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span
                      className="w-2.5 h-2.5 rounded-full shadow-xs"
                      style={{ backgroundColor: anchor.color }}
                    />
                    <span
                      className={`text-xs font-bold ${
                        isLight ? 'text-slate-900' : 'text-slate-200'
                      }`}
                    >
                      {anchor.name}
                    </span>
                  </div>
                  {tension ? (
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded border ${
                        isInvalid
                          ? isLight
                            ? 'bg-rose-100 text-rose-800 border-rose-300'
                            : 'bg-rose-950/60 text-rose-400 border border-rose-800/50'
                          : isLight
                          ? 'bg-cyan-100 text-cyan-800 border-cyan-300'
                          : 'bg-cyan-950/60 text-cyan-300 border border-cyan-800/50'
                      }`}
                    >
                      T_{idx + 1} = {tension.tension} N {isInvalid && '(Flojo)'}
                    </span>
                  ) : null}
                </div>

                {/* X, Y, Z coordinates */}
                <div className="grid grid-cols-3 gap-1.5 pt-1 text-[11px]">
                  <div>
                    <span className={`font-bold ${isLight ? 'text-rose-600' : 'text-rose-400'}`}>
                      X:
                    </span>
                    <input
                      type="number"
                      step={0.1}
                      value={anchor.x}
                      onChange={(e) => onUpdateAnchor(anchor.id, { x: parseFloat(e.target.value) || 0 })}
                      className={`w-full text-right px-1 py-0.5 rounded border focus:outline-none font-bold ${
                        isLight
                          ? 'bg-slate-50 border-slate-300 text-slate-900 focus:border-rose-500'
                          : 'bg-slate-900 border-slate-800 text-slate-200 focus:border-rose-500'
                      }`}
                    />
                  </div>
                  <div>
                    <span className={`font-bold ${isLight ? 'text-emerald-700' : 'text-emerald-400'}`}>
                      Y (Techo):
                    </span>
                    <input
                      type="number"
                      step={0.1}
                      min={2}
                      max={5}
                      value={anchor.y}
                      onChange={(e) =>
                        onUpdateAnchor(anchor.id, { y: parseFloat(e.target.value) || 3.5 })
                      }
                      className={`w-full text-right px-1 py-0.5 rounded border focus:outline-none font-bold ${
                        isLight
                          ? 'bg-slate-50 border-slate-300 text-slate-900 focus:border-emerald-500'
                          : 'bg-slate-900 border-slate-800 text-slate-200 focus:border-emerald-500'
                      }`}
                    />
                  </div>
                  <div>
                    <span className={`font-bold ${isLight ? 'text-blue-700' : 'text-blue-400'}`}>
                      Z:
                    </span>
                    <input
                      type="number"
                      step={0.1}
                      value={anchor.z}
                      onChange={(e) => onUpdateAnchor(anchor.id, { z: parseFloat(e.target.value) || 0 })}
                      className={`w-full text-right px-1 py-0.5 rounded border focus:outline-none font-bold ${
                        isLight
                          ? 'bg-slate-50 border-slate-300 text-slate-900 focus:border-blue-500'
                          : 'bg-slate-900 border-slate-800 text-slate-200 focus:border-blue-500'
                      }`}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Equilibrium Status Feedback */}
        {equilibriumResult.errorMessage ? (
          <div
            className={`flex items-start gap-2 rounded-lg p-2 text-xs font-semibold border ${
              isLight
                ? 'bg-amber-50 border-amber-300 text-amber-900'
                : 'bg-amber-950/40 border-amber-800/60 text-amber-300'
            }`}
          >
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-500 mt-0.5" />
            <span>{equilibriumResult.errorMessage}</span>
          </div>
        ) : equilibriumResult.isEquilibrium ? (
          <div
            className={`flex items-center gap-2 rounded-lg p-2 text-xs font-semibold border ${
              isLight
                ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                : 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Equilibrio Estático: ΣT + W + F_ext = 0 N</span>
          </div>
        ) : null}
      </div>
    </div>
  );
};
