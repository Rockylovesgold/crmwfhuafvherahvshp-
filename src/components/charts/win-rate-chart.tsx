"use client";

import { RadialBarChart, RadialBar, ResponsiveContainer } from "recharts";

interface WinRateChartProps {
  rate: number;
}

export function WinRateChart({ rate }: WinRateChartProps) {
  const data = [
    { name: "bg", value: 100, fill: "oklch(0.22 0.008 285)" },
    { name: "rate", value: rate, fill: "oklch(0.65 0.24 264)" },
  ];

  return (
    <div className="relative">
      <ResponsiveContainer width={200} height={200}>
        <RadialBarChart
          cx="50%"
          cy="50%"
          innerRadius="70%"
          outerRadius="100%"
          barSize={16}
          data={data}
          startAngle={90}
          endAngle={-270}
        >
          <RadialBar dataKey="value" cornerRadius={10} />
        </RadialBarChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold glow-text-blue text-primary">{rate}%</span>
        <span className="text-xs text-muted-foreground">Win Rate</span>
      </div>
    </div>
  );
}
