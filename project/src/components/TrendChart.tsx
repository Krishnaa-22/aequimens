import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  Cell,
} from 'recharts';
import type { DaySummary } from '../types';
import { formatShortDate } from '../utils/format';

interface TrendChartProps {
  data: DaySummary[];
  dataKey: keyof DaySummary;
  label: string;
  color?: string;
  type?: 'area' | 'line' | 'bar';
  domain?: [number, number];
  unit?: string;
  invert?: boolean; // for stress where lower is better
}

const SILVER_AXIS = '#888E8B';
const OLIVE = '#667A3E';
const SOFT_OLIVE = '#9BAE70';

export function TrendChart({
  data,
  dataKey,
  label,
  color = OLIVE,
  type = 'area',
  domain,
  unit,
  invert,
}: TrendChartProps) {
  const chartData = data
    .map((d) => ({
      date: formatShortDate(d.date),
      value: d[dataKey],
    }))
    .filter((point): point is { date: string; value: number } =>
      typeof point.value === 'number' && Number.isFinite(point.value),
    );

  const gradientId = `grad-${label.replace(/\s+/g, '')}`;

  const tooltipContent = (props: { active?: boolean; payload?: readonly { payload?: { date: string; value: number } }[] }) => {
    if (!props.active || !props.payload?.length) return null;
    const p = props.payload[0].payload;
    if (!p) return null;
    const display = unit ? `${p.value}${unit}` : `${p.value}`;
    return (
      <div className="rounded-xl border border-silver bg-white px-3 py-2 shadow-soft">
        <p className="text-[11px] font-medium text-ink-soft">{p.date}</p>
        <p className="text-sm font-semibold text-ink">
          {label}: {display}
          {invert && p.value >= 65 ? ' (higher = more tension)' : ''}
        </p>
      </div>
    );
  };

  return (
    <div className="h-48 w-full">
      <ResponsiveContainer width="100%" height="100%">
        {type === 'bar' ? (
          <BarChart data={chartData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E6E8E7" vertical={false} />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: SILVER_AXIS }} axisLine={false} tickLine={false} />
            <YAxis
              tick={{ fontSize: 11, fill: SILVER_AXIS }}
              axisLine={false}
              tickLine={false}
              domain={domain ?? [0, 'auto']}
            />
            <Tooltip content={tooltipContent} cursor={{ fill: '#E9EEDC40' }} />
            <Bar dataKey="value" radius={[6, 6, 0, 0]}>
              {chartData.map((entry, i) => (
                <Cell key={i} fill={entry.value >= 65 && invert ? '#888E8B' : color} />
              ))}
            </Bar>
          </BarChart>
        ) : type === 'line' ? (
          <LineChart data={chartData} margin={{ top: 8, right: 12, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E6E8E7" vertical={false} />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: SILVER_AXIS }} axisLine={false} tickLine={false} />
            <YAxis
              tick={{ fontSize: 11, fill: SILVER_AXIS }}
              axisLine={false}
              tickLine={false}
              domain={domain ?? [0, 100]}
            />
            <Tooltip content={tooltipContent} />
            <Line
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={2.5}
              dot={{ r: 3, fill: color, strokeWidth: 0 }}
              activeDot={{ r: 5, fill: color }}
            />
          </LineChart>
        ) : (
          <AreaChart data={chartData} margin={{ top: 8, right: 12, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={SOFT_OLIVE} stopOpacity={0.45} />
                <stop offset="100%" stopColor={SOFT_OLIVE} stopOpacity={0.04} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#E6E8E7" vertical={false} />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: SILVER_AXIS }} axisLine={false} tickLine={false} />
            <YAxis
              tick={{ fontSize: 11, fill: SILVER_AXIS }}
              axisLine={false}
              tickLine={false}
              domain={domain ?? [0, 100]}
            />
            <Tooltip content={tooltipContent} />
            <Area
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={2.5}
              fill={`url(#${gradientId})`}
              dot={{ r: 3, fill: color, strokeWidth: 0 }}
              activeDot={{ r: 5, fill: color }}
            />
          </AreaChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}
