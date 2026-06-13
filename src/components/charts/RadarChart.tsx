import {
  Radar,
  RadarChart as RechartsRadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface RadarDataPoint {
  dimension: string;
  [key: string]: string | number;
}

interface Props {
  data: RadarDataPoint[];
  series: { key: string; color: string; name: string }[];
  height?: number;
}

export default function RadarChart({ data, series, height = 360 }: Props) {
  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsRadarChart data={data} cx="50%" cy="50%" outerRadius="75%">
          <PolarGrid stroke="#CBD5E1" strokeDasharray="3 3" />
          <PolarAngleAxis
            dataKey="dimension"
            tick={{ fill: '#475569', fontSize: 13, fontFamily: 'DM Sans' }}
          />
          <PolarRadiusAxis
            angle={30}
            domain={[0, 5]}
            tick={{ fill: '#94A3B8', fontSize: 10 }}
            axisLine={false}
            tickCount={6}
          />
          {series.map((s) => (
            <Radar
              key={s.key}
              name={s.name}
              dataKey={s.key}
              stroke={s.color}
              fill={s.color}
              fillOpacity={series.length > 1 ? 0.15 : 0.35}
              strokeWidth={2}
            />
          ))}
          {series.length > 1 && (
            <Legend
              wrapperStyle={{ fontFamily: 'DM Sans', fontSize: 13, paddingTop: 16 }}
            />
          )}
        </RechartsRadarChart>
      </ResponsiveContainer>
    </div>
  );
}
