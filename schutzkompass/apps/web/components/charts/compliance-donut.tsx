'use client';

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface ComplianceDonutProps {
  score: number; // 0–100
  label: string;
  height?: number;
}

const COLORS = {
  completed: '#0d9488', // teal accent
  remaining: '#e5e7eb', // muted gray
};

export function ComplianceDonut({ score, label, height = 160 }: ComplianceDonutProps) {
  const data = [
    { name: 'Erfüllt', value: score },
    { name: 'Offen', value: 100 - score },
  ];

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: height, height }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius="65%"
              outerRadius="85%"
              paddingAngle={2}
              dataKey="value"
              startAngle={90}
              endAngle={-270}
              strokeWidth={0}
            >
              <Cell fill={COLORS.completed} />
              <Cell fill={COLORS.remaining} />
            </Pie>
            <Tooltip
              content={({ payload }) => {
                if (!payload || payload.length === 0) return null;
                const d = payload[0];
                return (
                  <div className="rounded-lg border bg-card px-3 py-2 text-xs shadow-md">
                    <p>{d.name}: {d.value}%</p>
                  </div>
                );
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        {/* Centered text inside the donut */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <p className="text-2xl font-bold text-primary">{score}%</p>
        </div>
      </div>
      <p className="text-xs text-muted-foreground mt-2">{label}</p>
    </div>
  );
}
