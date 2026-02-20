"use client";

import { Card } from "@/components/ui/Card";

interface DataPoint {
  label: string;
  value: number;
}

interface TrendChartProps {
  title: string;
  data: DataPoint[];
  maxValue?: number;
  color?: string;
  emptyMessage?: string;
}

export function TrendChart({
  title,
  data,
  maxValue = 5,
  color = "bg-primary",
  emptyMessage = "아직 데이터가 없어요",
}: TrendChartProps) {
  if (data.length === 0) {
    return (
      <Card variant="elevated">
        <h3 className="text-[16px] font-bold text-text-primary mb-3 tracking-tight">
          {title}
        </h3>
        <p className="text-[14px] text-text-caption text-center py-6">
          {emptyMessage}
        </p>
      </Card>
    );
  }

  const chartHeight = 120;

  return (
    <Card variant="elevated">
      <h3 className="text-[16px] font-bold text-text-primary mb-4 tracking-tight">
        {title}
      </h3>

      {/* Bar chart */}
      <div className="flex items-end gap-1.5" style={{ height: chartHeight }}>
        {data.map((point, idx) => {
          const height = maxValue > 0 ? (point.value / maxValue) * 100 : 0;
          return (
            <div
              key={idx}
              className="flex-1 flex flex-col items-center justify-end h-full"
            >
              <div
                className={`w-full rounded-t-md ${color} transition-all min-h-[4px]`}
                style={{ height: `${Math.max(height, 4)}%` }}
              />
            </div>
          );
        })}
      </div>

      {/* Labels */}
      <div className="flex gap-1.5 mt-2">
        {data.map((point, idx) => (
          <div key={idx} className="flex-1 text-center">
            <p className="text-[10px] text-text-caption truncate">
              {point.label}
            </p>
          </div>
        ))}
      </div>

      {/* Summary */}
      {data.length >= 2 && (
        <div className="mt-4 pt-3 border-t border-border-card/40">
          {(() => {
            const first = data[0].value;
            const last = data[data.length - 1].value;
            const diff = last - first;

            if (Math.abs(diff) < 0.3) {
              return (
                <p className="text-[13px] text-text-caption text-center">
                  일정한 수준을 유지하고 있어요
                </p>
              );
            }

            return (
              <p className="text-[13px] text-center">
                {diff < 0 ? (
                  <span className="text-success font-medium">
                    점점 편해지고 있어요! 체력이 좋아지고 있는 신호예요
                  </span>
                ) : (
                  <span className="text-text-caption">
                    운동 강도가 조금 높을 수 있어요. 쉬는 날도 중요해요
                  </span>
                )}
              </p>
            );
          })()}
        </div>
      )}
    </Card>
  );
}
