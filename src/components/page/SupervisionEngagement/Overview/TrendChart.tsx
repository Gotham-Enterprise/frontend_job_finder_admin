"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { ApexOptions } from "apexcharts";
import { useTheme } from "@/context/ThemeContext";

const ApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

// Single-series color, validated (dataviz validate_palette.js) against each
// mode's card surface: #006D36 on white, #0E9F5C on gray-800 (#1d2939).
const SERIES_COLOR = { light: "#006D36", dark: "#0E9F5C" };
const SURFACE = { light: "#ffffff", dark: "#1d2939" };
const GRID = { light: "#e4e7ec", dark: "#344054" };
const MUTED_TEXT = { light: "#667085", dark: "#98a2b3" };

const CHART_HEIGHT = 260; // includes the x-axis label band
const MAX_COLUMN_PX = 24;

/** ApexCharts sizes columns in % of the slot; convert the 24px cap to a %. */
function columnWidthPercent(plotWidth: number, slots: number): string {
  if (!plotWidth || !slots) return "40%";
  const slotWidth = plotWidth / slots;
  return `${Math.max(10, Math.min(70, (MAX_COLUMN_PX / slotWidth) * 100)).toFixed(1)}%`;
}

interface TrendChartProps {
  /** Card title — names the single series, so no legend box is needed. */
  title: string;
  subtitle: string;
  /** Tooltip label for the value, e.g. "Messages". */
  valueLabel: string;
  kind: "area" | "bar";
  /** `axisLabel` is the short x-axis tick ("Nov 3"); `label` is the full one for the tooltip. */
  points: { label: string; axisLabel: string; value: number }[];
  /** Holds the previous render dimmed while a new period loads. */
  isRefreshing?: boolean;
}

/**
 * One series over time. Area for continuous counts (messages), columns for
 * discrete events (hires). Separate charts per measure — never a dual axis.
 */
export default function TrendChart({ title, subtitle, valueLabel, kind, points, isRefreshing }: TrendChartProps) {
  const { theme } = useTheme();
  const mode = theme === "dark" ? "dark" : "light";
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => setWidth(Math.round(entry.contentRect.width)));
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const { options, series } = useMemo(() => {
    const max = Math.max(0, ...points.map((p) => p.value));
    // Whole-number ticks: small counts get one tick per unit, larger ones four.
    const tickAmount = Math.max(1, Math.min(4, max));
    // Fewer x labels on narrow cards so dates never collide.
    const maxXLabels = width && width < 480 ? 4 : 7;
    // Column charts keep one category per bar, so blank all but every Nth
    // tick label; the tooltip still names each bar from `points[i].label`.
    const barLabelEvery = Math.max(1, Math.ceil(points.length / maxXLabels));

    const opts: ApexOptions = {
      chart: {
        type: kind,
        background: "transparent",
        fontFamily: "inherit",
        toolbar: { show: false },
        zoom: { enabled: false },
        animations: { enabled: false },
      },
      colors: [SERIES_COLOR[mode]],
      dataLabels: { enabled: false },
      legend: { show: false },
      stroke:
        kind === "area"
          ? { width: 2, curve: "straight", lineCap: "round" }
          : { width: 0 },
      fill: kind === "area" ? { type: "solid", opacity: 0.1 } : { type: "solid", opacity: 1 },
      markers: {
        size: 0,
        strokeColors: SURFACE[mode],
        strokeWidth: 2,
        hover: { size: 5 },
      },
      plotOptions: {
        bar: {
          // ~60px of the width goes to the y-axis labels.
          columnWidth: columnWidthPercent(Math.max(width - 60, 0), points.length),
          borderRadius: 4,
          borderRadiusApplication: "end",
        },
      },
      states: {
        hover: { filter: { type: kind === "bar" ? "lighten" : "none" } },
      },
      grid: {
        borderColor: GRID[mode],
        strokeDashArray: 0,
        xaxis: { lines: { show: false } },
        yaxis: { lines: { show: true } },
        padding: { left: 8, right: 8 },
      },
      xaxis: {
        categories: points.map((p, i) =>
          kind === "bar" && i % barLabelEvery !== 0 ? "" : p.axisLabel
        ),
        // Area charts thin their labels with tickAmount; column charts use
        // the blanked categories above.
        tickAmount: kind === "area" ? Math.min(Math.max(points.length - 1, 1), maxXLabels) : undefined,
        axisBorder: { show: true, color: GRID[mode] },
        axisTicks: { show: false },
        crosshairs: {
          show: kind === "area",
          stroke: { color: MUTED_TEXT[mode], width: 1, dashArray: 0 },
        },
        tooltip: { enabled: false },
        labels: {
          rotate: 0,
          hideOverlappingLabels: true,
          style: { colors: MUTED_TEXT[mode], fontSize: "11px" },
        },
      },
      yaxis: {
        min: 0,
        max: max === 0 ? 1 : undefined,
        tickAmount,
        forceNiceScale: true,
        labels: {
          style: { colors: MUTED_TEXT[mode], fontSize: "11px" },
          formatter: (value: number) => Math.round(value).toLocaleString(),
        },
      },
      tooltip: {
        theme: mode,
        shared: true,
        intersect: false,
        marker: { show: true },
        x: {
          formatter: (_value: number, opts?: { dataPointIndex?: number }) =>
            points[opts?.dataPointIndex ?? -1]?.label ?? String(_value),
        },
        y: {
          formatter: (value: number) => value.toLocaleString(),
          title: { formatter: () => valueLabel },
        },
      },
    };
    return { options: opts, series: [{ name: valueLabel, data: points.map((p) => p.value) }] };
  }, [kind, mode, points, valueLabel, width]);

  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5">
      <h3 className="text-sm font-semibold text-gray-800 dark:text-white">{title}</h3>
      <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">{subtitle}</p>
      <div
        ref={containerRef}
        className={`mt-3 transition-opacity ${isRefreshing ? "opacity-50" : ""}`}
        style={{ minHeight: CHART_HEIGHT }}
      >
        <ApexChart key={`${kind}-${mode}`} type={kind} options={options} series={series} height={CHART_HEIGHT} />
      </div>
    </div>
  );
}
