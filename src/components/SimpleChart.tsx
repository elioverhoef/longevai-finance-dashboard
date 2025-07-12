import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend
} from 'recharts';

// Simple chart components with generic type for data
export const SimpleBarChart = <T extends object = { [key: string]: string | number }>({
  data,
  dataKey,
  xAxisKey,
  title,
  color = "#6366f1"
}: {
  data: T[];
  dataKey: keyof T;
  xAxisKey: keyof T;
  title?: string;
  color?: string;
}) => (
  <div className="w-full h-80">
    {title && <h3 className="text-lg font-semibold mb-4 text-center">{title}</h3>}
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
        <XAxis dataKey={xAxisKey as string} />
        <YAxis />
        <Tooltip />
        <Bar dataKey={dataKey as string} fill={color} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  </div>
);

export const SimplePieChart = <T extends object = { [key: string]: string | number }>({
  data,
  dataKey,
  nameKey,
  title,
  colors = ["#6366f1", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#ef4444"]
}: {
  data: T[];
  dataKey: keyof T;
  nameKey: keyof T;
  title?: string;
  colors?: string[];
}) => (
  <div className="w-full h-80">
    {title && <h3 className="text-lg font-semibold mb-4 text-center">{title}</h3>}
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          outerRadius={80}
          fill="#8884d8"
          dataKey={dataKey as string}
          nameKey={nameKey as string}
          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  </div>
);

export const SimpleLineChart = <T extends object = { [key: string]: string | number }>({
  data,
  dataKeys,
  xAxisKey,
  title,
  colors = ["#6366f1", "#ec4899", "#10b981"]
}: {
  data: T[];
  dataKeys: (keyof T)[];
  xAxisKey: keyof T;
  title?: string;
  colors?: string[];
}) => (
  <div className="w-full h-80">
    {title && <h3 className="text-lg font-semibold mb-4 text-center">{title}</h3>}
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
        <XAxis dataKey={xAxisKey as string} />
        <YAxis />
        <Tooltip />
        <Legend />
        {dataKeys.map((key, index) => (
          <Line 
            key={key as string}
            type="monotone" 
            dataKey={key as string} 
            stroke={colors[index % colors.length]} 
            strokeWidth={2}
            dot={{ r: 4 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  </div>
);