import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface Props {
  data: { name: string; min?: number; max?: number; [k: string]: any }[];
  height?: number;
  keys?: { key: string; color: string; label: string }[];
}

export default function SalaryBarChart({
  data,
  height = 280,
  keys = [
    { key: 'min', color: '#94A3B8', label: '起薪 (K)' },
    { key: 'max', color: '#F59E0B', label: '上限 (K)' },
  ],
}: Props) {
  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} barGap={4} margin={{ top: 16, right: 16, bottom: 8, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
          <XAxis
            dataKey="name"
            tick={{ fill: '#475569', fontSize: 12, fontFamily: 'DM Sans' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: '#94A3B8', fontSize: 11, fontFamily: 'DM Sans' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `${v}K`}
          />
          <Tooltip
            contentStyle={{
              borderRadius: 12,
              border: '1px solid #F1F5F9',
              boxShadow: '0 8px 24px rgba(30,41,59,0.08)',
              fontFamily: 'DM Sans',
              fontSize: 13,
            }}
            formatter={(v: number) => [`${v}K`]}
          />
          <Legend wrapperStyle={{ fontFamily: 'DM Sans', fontSize: 12, paddingTop: 8 }} />
          {keys.map((k) => (
            <Bar
              key={k.key}
              dataKey={k.key}
              name={k.label}
              fill={k.color}
              radius={[6, 6, 0, 0]}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
