"use client";

import React, { useState } from "react";
import { format, parseISO } from "date-fns";

interface TrendChartProps {
    data: { date: string; count: number }[];
    title: string;
    color?: string;
}

export function MainTrendChart({ data, title, color = "#2563eb" }: TrendChartProps) {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    if (!data || data.length === 0) return null;

    const width = 800;
    const height = 300;
    const padding = 40;

    const counts = data.map(d => d.count);
    const max = Math.max(...counts, 5);
    const min = 0;
    const range = max - min;

    const points = data.map((d, i) => {
        const x = (i / (data.length - 1)) * (width - padding * 2) + padding;
        const y = height - ((d.count - min) / range) * (height - padding * 2) - padding;
        return { x, y, ...d };
    });

    const pathD = `M ${points.map(p => `${p.x},${p.y}`).join(" L ")}`;
    const areaD = `${pathD} L ${width - padding},${height - padding} L ${padding},${height - padding} Z`;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
                    {title} <span className="text-slate-200">/ 14 Day Velocity</span>
                </h3>
                {hoveredIndex !== null && (
                    <div className="flex items-center gap-4 animate-fade-in">
                        <div className="flex flex-col items-end">
                            <span className="text-[10px] font-black uppercase text-slate-400">{format(parseISO(data[hoveredIndex].date), "MMM d, yyyy")}</span>
                            <span className="text-sm font-black text-slate-950">{data[hoveredIndex].count} Events</span>
                        </div>
                    </div>
                )}
            </div>

            <div className="relative glass-card rounded-[2.5rem] border-border/40 p-8 overflow-hidden bg-white/20">
                <svg
                    viewBox={`0 0 ${width} ${height}`}
                    className="w-full h-auto overflow-visible"
                >
                    <defs>
                        <linearGradient id="chart-gradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={color} stopOpacity="0.1" />
                            <stop offset="100%" stopColor={color} stopOpacity="0" />
                        </linearGradient>
                    </defs>

                    {/* Grid lines */}
                    {[0, 0.25, 0.5, 0.75, 1].map(v => (
                        <line
                            key={v}
                            x1={padding}
                            y1={height - padding - v * (height - padding * 2)}
                            x2={width - padding}
                            y2={height - padding - v * (height - padding * 2)}
                            stroke="rgba(0,0,0,0.03)"
                            strokeWidth="1"
                        />
                    ))}

                    <path d={areaD} fill="url(#chart-gradient)" className="transition-all duration-700" />
                    <path d={pathD} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="transition-all duration-700" />

                    {points.map((p, i) => (
                        <g key={i}>
                            <circle
                                cx={p.x}
                                cy={p.y}
                                r={hoveredIndex === i ? 6 : 0}
                                fill={color}
                                className="transition-all duration-200"
                            />
                            <rect
                                x={p.x - (width / data.length) / 2}
                                y={0}
                                width={width / data.length}
                                height={height}
                                fill="transparent"
                                onMouseEnter={() => setHoveredIndex(i)}
                                onMouseLeave={() => setHoveredIndex(null)}
                                className="cursor-pointer"
                            />
                        </g>
                    ))}
                </svg>
            </div>
        </div>
    );
}
