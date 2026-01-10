"use client";

import React from "react";

interface SparklineProps {
    data: { date: string; count: number }[];
    color?: string;
    width?: number;
    height?: number;
}

export function DataSparkline({ data, color = "currentColor", width = 120, height = 40 }: SparklineProps) {
    if (!data || data.length < 2) return null;

    const padding = 4;
    const counts = data.map(d => d.count);
    const max = Math.max(...counts, 1);
    const min = Math.min(...counts);
    const range = max - min || 1;

    const points = data.map((d, i) => {
        const x = (i / (data.length - 1)) * (width - padding * 2) + padding;
        const y = height - ((d.count - min) / range) * (height - padding * 2) - padding;
        return `${x},${y}`;
    }).join(" ");

    return (
        <div className="relative" style={{ width, height }}>
            <svg width={width} height={height} className="overflow-visible">
                <defs>
                    <linearGradient id="gradient-sparkline" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={color} stopOpacity="0.2" />
                        <stop offset="100%" stopColor={color} stopOpacity="0" />
                    </linearGradient>
                </defs>
                <path
                    d={`M ${points} L ${width - padding},${height} L ${padding},${height} Z`}
                    fill="url(#gradient-sparkline)"
                    className="transition-all duration-1000"
                />
                <polyline
                    fill="none"
                    stroke={color}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={points}
                    className="transition-all duration-1000"
                />
            </svg>
        </div>
    );
}
