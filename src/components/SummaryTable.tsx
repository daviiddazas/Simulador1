import React from 'react';
import { ForceVector, SimulationMode, StaticEquilibriumResult, CableAnchor } from '../types';
import { cartesianToSpherical } from '../utils/physics';
import { CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';

interface SummaryTableProps {
  mode: SimulationMode;
  forces: ForceVector[];
  netForce: { x: number; y: number; z: number; magnitude: number };
  massKg: number;
  gravity: number;
  anchors: CableAnchor[];
  cableCount: 2 | 3;
  equilibriumResult: StaticEquilibriumResult;
  theme?: 'light' | 'dark';
}

export const SummaryTable: React.FC<SummaryTableProps> = ({
  mode,
  forces,
  netForce,
  massKg,
  gravity,
  anchors,
  cableCount,
  equilibriumResult,
  theme = 'dark',
}) => {
  const isLight = theme === 'light';
  const isEquilibrium = mode === 'free' ? netForce.magnitude < 0.05 : equilibriumResult.isEquilibrium;
  const weight = massKg * gravity;
  const theoreticalAccel = (netForce.magnitude / massKg).toFixed(2);

  return (
    <div
      className={`rounded-xl p-3 shadow-lg space-y-3 font-mono border transition-colors ${
        isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900/95 border-slate-800 text-slate-100'
      }`}
    >
      {/* Equilibrium Status Banner */}
      <div
        className={`flex items-center justify-between px-3 py-2 rounded-lg border text-xs ${
          isEquilibrium
            ? isLight
              ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
              : 'bg-emerald-950/50 border-emerald-700/60 text-emerald-300'
            : isLight
            ? 'bg-amber-50 border-amber-300 text-amber-900'
            : 'bg-amber-950/50 border-amber-700/60 text-amber-300'
        }`}
      >
        <div className="flex items-center gap-2">
          {isEquilibrium ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
          )}
          <div>
            <span className="font-bold text-xs">
              {isEquilibrium ? 'EQUILIBRIO ESTÁTICO (ΣF = 0)' : 'NO EN EQUILIBRIO'}
            </span>
            <div className={`text-[10px] ${isLight ? 'text-slate-600 font-sans' : 'opacity-80'}`}>
              {isEquilibrium
                ? 'La suma vectorial de todas las fuerzas se anula. Aceleración a = 0 m/s².'
                : `Fuerza neta residual = ${netForce.magnitude} N. Aceleración a = ${theoreticalAccel} m/s².`}
            </div>
          </div>
        </div>

        <div className="text-right">
          <span className={`text-[10px] block ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>|F_net|</span>
          <span className="font-bold text-sm">{netForce.magnitude} N</span>
        </div>
      </div>

      {/* Forces Breakdown Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-[11px] text-left border-collapse">
          <thead>
            <tr
              className={`border-b ${
                isLight ? 'border-slate-200 text-slate-700 bg-slate-50' : 'border-slate-800 text-slate-400'
              }`}
            >
              <th className="py-1 px-1.5 font-bold">Fuerza / Vector</th>
              <th className={`py-1 px-1.5 text-right font-bold ${isLight ? 'text-rose-600' : 'text-rose-400'}`}>
                Fx (N)
              </th>
              <th className={`py-1 px-1.5 text-right font-bold ${isLight ? 'text-emerald-700' : 'text-emerald-400'}`}>
                Fy (N)
              </th>
              <th className={`py-1 px-1.5 text-right font-bold ${isLight ? 'text-blue-700' : 'text-blue-400'}`}>
                Fz (N)
              </th>
              <th className={`py-1 px-1.5 text-right font-bold ${isLight ? 'text-slate-900' : 'text-slate-200'}`}>
                |F| (N)
              </th>
              <th className={`py-1 px-1.5 text-right ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>θ (Azim)</th>
              <th className={`py-1 px-1.5 text-right ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>φ (Elev)</th>
            </tr>
          </thead>
          <tbody className={`divide-y ${isLight ? 'divide-slate-200' : 'divide-slate-800/60'}`}>
            {/* Suspended Mode: Weight Row */}
            {mode === 'suspended' && (
              <tr className={isLight ? 'bg-rose-50/50 text-rose-900' : 'bg-slate-950/40 text-rose-300'}>
                <td className="py-1.5 px-1.5 flex items-center gap-1.5 font-bold">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  Peso (W = mg)
                </td>
                <td className="py-1.5 px-1.5 text-right font-medium">0.0</td>
                <td className="py-1.5 px-1.5 text-right font-medium">-{weight.toFixed(1)}</td>
                <td className="py-1.5 px-1.5 text-right font-medium">0.0</td>
                <td className="py-1.5 px-1.5 text-right font-bold">{weight.toFixed(1)}</td>
                <td className={`py-1.5 px-1.5 text-right ${isLight ? 'text-slate-500' : 'text-slate-500'}`}>0°</td>
                <td className={`py-1.5 px-1.5 text-right ${isLight ? 'text-slate-500' : 'text-slate-500'}`}>-90°</td>
              </tr>
            )}

            {/* Suspended Mode: Cable Tensions */}
            {mode === 'suspended' &&
              equilibriumResult.cablesTension?.slice(0, cableCount).map((c, idx) => {
                const u = c.unitVector;
                const fx = (c.tension * u.x).toFixed(1);
                const fy = (c.tension * u.y).toFixed(1);
                const fz = (c.tension * u.z).toFixed(1);
                const color = anchors[idx]?.color || '#38bdf8';
                const spherical = cartesianToSpherical(parseFloat(fx), parseFloat(fy), parseFloat(fz));

                return (
                  <tr
                    key={c.cableId}
                    className={`transition-colors ${
                      isLight ? 'hover:bg-slate-50 text-slate-800' : 'hover:bg-slate-800/30 text-slate-200'
                    }`}
                  >
                    <td className="py-1.5 px-1.5 flex items-center gap-1.5 font-semibold">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                      {c.cableName} (Tensión)
                    </td>
                    <td className={`py-1.5 px-1.5 text-right ${isLight ? 'text-rose-700' : 'text-rose-300'}`}>{fx}</td>
                    <td className={`py-1.5 px-1.5 text-right ${isLight ? 'text-emerald-700' : 'text-emerald-300'}`}>{fy}</td>
                    <td className={`py-1.5 px-1.5 text-right ${isLight ? 'text-blue-700' : 'text-blue-300'}`}>{fz}</td>
                    <td
                      className={`py-1.5 px-1.5 text-right font-bold ${
                        isLight ? 'text-cyan-800' : 'text-cyan-300'
                      }`}
                    >
                      {c.tension}
                    </td>
                    <td className={`py-1.5 px-1.5 text-right ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                      {spherical.azimuthTheta}°
                    </td>
                    <td className={`py-1.5 px-1.5 text-right ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                      {spherical.elevationPhi}°
                    </td>
                  </tr>
                );
              })}

            {/* Applied Forces */}
            {forces.map((f) => {
              const spherical = cartesianToSpherical(f.x, f.y, f.z);
              return (
                <tr
                  key={f.id}
                  className={`transition-colors ${
                    isLight ? 'hover:bg-slate-50 text-slate-800' : 'hover:bg-slate-800/30 text-slate-200'
                  } ${!f.visible ? 'opacity-40 italic' : ''}`}
                >
                  <td className="py-1.5 px-1.5 flex items-center gap-1.5 font-semibold">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: f.color }} />
                    {f.name} {!f.visible && '(Oculto)'}
                  </td>
                  <td className={`py-1.5 px-1.5 text-right ${isLight ? 'text-rose-700' : 'text-rose-300'}`}>
                    {f.x.toFixed(1)}
                  </td>
                  <td className={`py-1.5 px-1.5 text-right ${isLight ? 'text-emerald-700' : 'text-emerald-300'}`}>
                    {f.y.toFixed(1)}
                  </td>
                  <td className={`py-1.5 px-1.5 text-right ${isLight ? 'text-blue-700' : 'text-blue-300'}`}>
                    {f.z.toFixed(1)}
                  </td>
                  <td className={`py-1.5 px-1.5 text-right font-bold ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>
                    {spherical.magnitude}
                  </td>
                  <td className={`py-1.5 px-1.5 text-right ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                    {spherical.azimuthTheta}°
                  </td>
                  <td className={`py-1.5 px-1.5 text-right ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                    {spherical.elevationPhi}°
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            {/* Resultant / Net Force row */}
            <tr
              className={`border-t-2 font-bold ${
                isLight
                  ? 'border-slate-300 bg-amber-50 text-amber-950'
                  : 'border-slate-700 bg-amber-950/20 text-amber-300'
              }`}
            >
              <td className="py-2 px-1.5 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Fuerza Neta (F_net)
              </td>
              <td className={`py-2 px-1.5 text-right ${isLight ? 'text-rose-700' : 'text-rose-400'}`}>
                {netForce.x.toFixed(1)}
              </td>
              <td className={`py-2 px-1.5 text-right ${isLight ? 'text-emerald-700' : 'text-emerald-400'}`}>
                {netForce.y.toFixed(1)}
              </td>
              <td className={`py-2 px-1.5 text-right ${isLight ? 'text-blue-700' : 'text-blue-400'}`}>
                {netForce.z.toFixed(1)}
              </td>
              <td className={`py-2 px-1.5 text-right text-base ${isLight ? 'text-amber-800' : 'text-amber-400'}`}>
                {netForce.magnitude.toFixed(1)} N
              </td>
              <td colSpan={2} className={`py-2 px-1.5 text-right font-medium ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                {isEquilibrium ? 'Equilibrado' : 'Desbalanceado'}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};
