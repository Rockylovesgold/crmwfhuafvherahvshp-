"use client";

import { useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { Deal } from "@/lib/db/schema";

interface RevenueChartProps {
  deals: Deal[];
}

export function RevenueChart({ deals }: RevenueChartProps) {
  const data = useMemo(() => {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat("en-US", { month: "short" });

    const months = Array.from({ length: 12 }, (_, index) => {
      const date = new Date(now.getFullYear(), now.getMonth() - 11 + index, 1);
      return {
        key: `${date.getFullYear()}-${date.getMonth()}`,
        month: formatter.format(date),
        revenue: 0,
        forecast: 0,
      };
    });

    const monthMap = new Map(months.map((item) => [item.key, item]));

    for (const deal of deals) {
      const wonDate = new Date(deal.updatedAt);
      const wonKey = `${wonDate.getFullYear()}-${wonDate.getMonth()}`;
      const forecastDate = deal.expectedCloseDate ? new Date(deal.expectedCloseDate) : null;
      const forecastKey = forecastDate
        ? `${forecastDate.getFullYear()}-${forecastDate.getMonth()}`
        : null;

      if (deal.stage === "Won" && monthMap.has(wonKey)) {
        const target = monthMap.get(wonKey);
        if (target) target.revenue += deal.value;
      }

      if (deal.stage !== "Lost" && forecastKey && monthMap.has(forecastKey)) {
        const target = monthMap.get(forecastKey);
        if (target) {
          const weighted = (deal.value * Math.max(0, Math.min(100, deal.probability))) / 100;
          target.forecast += weighted;
        }
      }
    }

    return months.map((item) => ({
      ...item,
      revenue: Math.round(item.revenue),
      forecast: Math.round(item.forecast),
    }));
  }, [deals]);

  const hasData = data.some((point) => point.revenue > 0 || point.forecast > 0);

  if (!hasData) {
    return (
      <div className="flex h-[300px] items-center justify-center rounded-xl border border-border/40 bg-muted/20 text-sm text-muted-foreground">
        No forecast data yet. Add deals with expected close dates to generate a live forecast.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="oklch(0.65 0.24 264)" stopOpacity={0.3} />
            <stop offset="95%" stopColor="oklch(0.65 0.24 264)" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="forecastGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="oklch(0.6 0.26 303)" stopOpacity={0.3} />
            <stop offset="95%" stopColor="oklch(0.6 0.26 303)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.3 0 0 / 0.3)" />
        <XAxis
          dataKey="month"
          tick={{ fill: "oklch(0.65 0 0)", fontSize: 12 }}
          axisLine={{ stroke: "oklch(0.3 0 0 / 0.3)" }}
        />
        <YAxis
          tick={{ fill: "oklch(0.65 0 0)", fontSize: 12 }}
          axisLine={{ stroke: "oklch(0.3 0 0 / 0.3)" }}
          tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "oklch(0.17 0.005 285)",
            border: "1px solid oklch(0.28 0.01 285)",
            borderRadius: "8px",
            color: "oklch(0.93 0 0)",
          }}
          formatter={(value) => [`$${Number(value).toLocaleString()}`, ""]}
        />
        <Area
          type="monotone"
          dataKey="revenue"
          stroke="#80BEFF"
          fill="url(#revenueGrad)"
          strokeWidth={2}
          name="Revenue"
          isAnimationActive
          animationDuration={650}
        />
        <Area
          type="monotone"
          dataKey="forecast"
          stroke="#C0FFFF"
          fill="url(#forecastGrad)"
          strokeWidth={2}
          strokeDasharray="5 5"
          name="Forecast"
          isAnimationActive
          animationDuration={850}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
