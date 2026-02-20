"use client";

interface RadarChartProps {
  data: {
    label: string;
    value: number; // 0-100
    color?: string;
  }[];
  size?: number;
}

export function RadarChart({ data, size = 280 }: RadarChartProps) {
  const center = size / 2;
  const radius = (size / 2) - 40;
  const levels = 4;
  const angleSlice = (Math.PI * 2) / data.length;

  const getPoint = (index: number, value: number) => {
    const angle = angleSlice * index - Math.PI / 2;
    const r = (value / 100) * radius;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
    };
  };

  const levelLines = Array.from({ length: levels }, (_, i) => {
    const levelRadius = ((i + 1) / levels) * 100;
    const points = data.map((_, idx) => getPoint(idx, levelRadius));
    return points.map((p) => `${p.x},${p.y}`).join(" ");
  });

  const dataPoints = data.map((d, i) => getPoint(i, d.value));
  const dataPath = dataPoints.map((p) => `${p.x},${p.y}`).join(" ");

  const labelPoints = data.map((_, i) => getPoint(i, 115));

  return (
    <div className="flex justify-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Background levels */}
        {levelLines.map((points, i) => (
          <polygon
            key={i}
            points={points}
            fill="none"
            stroke="var(--color-border-card)"
            strokeWidth={i === levels - 1 ? 1.5 : 0.8}
          />
        ))}

        {/* Axis lines */}
        {data.map((_, i) => {
          const p = getPoint(i, 100);
          return (
            <line
              key={i}
              x1={center}
              y1={center}
              x2={p.x}
              y2={p.y}
              stroke="var(--color-border-card)"
              strokeWidth={0.8}
            />
          );
        })}

        {/* Data polygon */}
        <polygon
          points={dataPath}
          fill="color-mix(in srgb, var(--color-primary) 12%, transparent)"
          stroke="var(--color-primary)"
          strokeWidth={2.5}
          strokeLinejoin="round"
        />

        {/* Data points */}
        {dataPoints.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={4}
            fill="white"
            stroke="var(--color-primary)"
            strokeWidth={2.5}
          />
        ))}

        {/* Labels */}
        {data.map((d, i) => {
          const lp = labelPoints[i];
          return (
            <g key={i}>
              <text
                x={lp.x}
                y={lp.y}
                textAnchor="middle"
                dominantBaseline="middle"
                className="text-[13px] font-semibold"
                fill="var(--color-text-secondary)"
              >
                {d.label}
              </text>
              <text
                x={lp.x}
                y={lp.y + 16}
                textAnchor="middle"
                dominantBaseline="middle"
                className="text-[13px] font-bold"
                fill="var(--color-primary)"
              >
                {d.value}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
