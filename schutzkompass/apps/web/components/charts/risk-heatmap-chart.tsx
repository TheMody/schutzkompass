'use client';

import React from 'react';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ZAxis,
} from 'recharts';
import { RISK_LEVEL_COLORS, type RiskLevel } from '@schutzkompass/shared';
import { calculateRiskScore } from '@/lib/services/risk-scoring';

interface HeatmapDataPoint {
  likelihood: number;
  impact: number;
  count: number;
  riskLevel: RiskLevel;
}

interface RiskHeatmapChartProps {
  entries: Array<{ likelihood: number; impact: number }>;
  width?: number;
  height?: number;
}

export function RiskHeatmapChart({ entries, height = 300 }: RiskHeatmapChartProps) {
  // Aggregate entries into cells
  const cellMap = new Map<string, HeatmapDataPoint>();
  for (const e of entries) {
    const key = `${e.likelihood}-${e.impact}`;
    if (!cellMap.has(key)) {
      const { riskLevel } = calculateRiskScore({ likelihood: e.likelihood, impact: e.impact });
      cellMap.set(key, {
        likelihood: e.likelihood,
        impact: e.impact,
        count: 0,
        riskLevel,
      });
    }
    cellMap.get(key)!.count++;
  }

  const data = [...cellMap.values()];

  return (
    <ResponsiveContainer width="100%" height={height}>
      <ScatterChart margin={{ top: 10, right: 10, bottom: 30, left: 10 }}>
        <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
        <XAxis
          type="number"
          dataKey="impact"
          name="Auswirkung"
          domain={[0.5, 5.5]}
          ticks={[1, 2, 3, 4, 5]}
          label={{ value: 'Auswirkung →', position: 'bottom', offset: 10, fontSize: 12 }}
          tick={{ fontSize: 11 }}
        />
        <YAxis
          type="number"
          dataKey="likelihood"
          name="Wahrscheinlichkeit"
          domain={[0.5, 5.5]}
          ticks={[1, 2, 3, 4, 5]}
          label={{
            value: 'Wahrscheinlichkeit →',
            angle: -90,
            position: 'insideLeft',
            offset: -5,
            fontSize: 12,
          }}
          tick={{ fontSize: 11 }}
        />
        <ZAxis type="number" dataKey="count" range={[100, 600]} name="Anzahl" />
        <Tooltip
          content={({ payload }) => {
            if (!payload || payload.length === 0) return null;
            const d = payload[0].payload as HeatmapDataPoint;
            return (
              <div className="rounded-lg border bg-card px-3 py-2 text-xs shadow-md">
                <p className="font-medium">
                  W={d.likelihood}, A={d.impact}
                </p>
                <p>
                  Risikostufe:{' '}
                  <span style={{ color: RISK_LEVEL_COLORS[d.riskLevel] }} className="font-semibold">
                    {d.riskLevel}
                  </span>
                </p>
                <p>{d.count} Risiko(en)</p>
              </div>
            );
          }}
        />
        <Scatter data={data}>
          {data.map((d, idx) => (
            <Cell key={idx} fill={RISK_LEVEL_COLORS[d.riskLevel]} fillOpacity={0.8} />
          ))}
        </Scatter>
      </ScatterChart>
    </ResponsiveContainer>
  );
}
