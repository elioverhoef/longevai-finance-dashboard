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

// Simple chart components without complex type issues
export const SimpleBarChart: React.FC<{
  data: any[];
  dataKey: string;
  xAxisKey: string;
  title?: string;
  color?: string;
}> = ({ data, dataKey, xAxisKey, title, color = "#6366f1" }) => (
  <div className="w-full h-80">
    {title && <h3 className="text-lg font-semibold mb-4 text-center">{title}</h3>}
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
        <XAxis dataKey={xAxisKey} />
        <YAxis />
        <Tooltip />
        <Bar dataKey={dataKey} fill={color} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  </div>
);

export const SimplePieChart: React.FC<{
  data: any[];
  dataKey: string;
  nameKey: string;
  title?: string;
  colors?: string[];
}> = ({ data, dataKey, nameKey, title, colors = ["#6366f1", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#ef4444"] }) => (
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
          dataKey={dataKey}
          nameKey={nameKey}
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

export const SimpleLineChart: React.FC<{
  data: any[];
  dataKeys: string[];
  xAxisKey: string;
  title?: string;
  colors?: string[];
}> = ({ data, dataKeys, xAxisKey, title, colors = ["#6366f1", "#ec4899", "#10b981"] }) => (
  <div className="w-full h-80">
    {title && <h3 className="text-lg font-semibold mb-4 text-center">{title}</h3>}
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
        <XAxis dataKey={xAxisKey} />
        <YAxis />
        <Tooltip />
        <Legend />
        {dataKeys.map((key, index) => (
          <Line 
            key={key}
            type="monotone" 
            dataKey={key} 
            stroke={colors[index % colors.length]} 
            strokeWidth={2}
            dot={{ r: 4 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  </div>
);