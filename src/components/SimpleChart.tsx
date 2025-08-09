import React, { useState, useEffect } from 'react';
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
import { Sparkles } from 'lucide-react';

// Enhanced chart components with animations and glassmorphism
interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    color: string;
    name: string;
    value: string | number;
  }>;
  label?: string;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 backdrop-blur-md border border-white/20 rounded-xl p-3 shadow">
        <div className="mb-1 font-semibold text-gray-800">{label}</div>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2 text-sm text-gray-700">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
            <span>
              {entry.name}: <span className="font-semibold">{typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}</span>
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export const SimpleBarChart = <T extends object = { [key: string]: string | number }>({
  data,
  dataKey,
  xAxisKey,
  title,
  color = "#6366f1",
  showAllLabels = false
}: {
  data: T[];
  dataKey: keyof T;
  xAxisKey: keyof T;
  title?: string;
  color?: string;
  showAllLabels?: boolean;
}) => {
  return (
    <div className={`w-full h-80 relative`}>
      {title && (
        <h3 className="text-lg font-semibold mb-4 text-center">{title}</h3>
      )}
      <div className="relative rounded-2xl h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <defs>
              <linearGradient id={`barGradient-${dataKey as string}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.8} />
                <stop offset="100%" stopColor={color} stopOpacity={0.3} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(99, 102, 241, 0.1)" />
            <XAxis 
              dataKey={xAxisKey as string} 
              interval={showAllLabels ? 0 : 'preserveStartEnd'}
              angle={showAllLabels ? -30 : 0}
              textAnchor={showAllLabels ? 'end' : 'middle'}
              height={showAllLabels ? 60 : 40}
              fontSize={12}
              stroke="rgba(99, 102, 241, 0.7)"
              tick={{ fill: 'rgba(99, 102, 241, 0.8)' }}
            />
            <YAxis stroke="rgba(99, 102, 241, 0.7)" tick={{ fill: 'rgba(99, 102, 241, 0.8)' }} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey={dataKey as string} fill={`url(#barGradient-${dataKey as string})`} radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

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
}) => {
  return (
    <div className={`w-full h-80 relative`}>
      {title && (
        <h3 className="text-lg font-semibold mb-4 text-center">{title}</h3>
      )}
      <div className="relative rounded-2xl h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <defs>
              {colors.map((color, index) => (
                <linearGradient key={index} id={`pieGradient-${index}`} x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor={color} stopOpacity={0.8} />
                  <stop offset="100%" stopColor={color} stopOpacity={0.4} />
                </linearGradient>
              ))}
            </defs>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              outerRadius={80}
              innerRadius={30}
              dataKey={dataKey as string}
              nameKey={nameKey as string}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
              labelLine={false}
            >
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={`url(#pieGradient-${index % colors.length})`} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

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
}) => {
  return (
    <div className={`w-full h-80 relative`}>
      {title && (
        <h3 className="text-lg font-semibold mb-4 text-center">{title}</h3>
      )}
      <div className="relative rounded-2xl h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <defs>
              {dataKeys.map((key, index) => (
                <linearGradient key={key as string} id={`lineGradient-${key as string}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={colors[index % colors.length]} stopOpacity={0.8} />
                  <stop offset="100%" stopColor={colors[index % colors.length]} stopOpacity={0.1} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(99, 102, 241, 0.1)" />
            <XAxis dataKey={xAxisKey as string} stroke="rgba(99, 102, 241, 0.7)" tick={{ fill: 'rgba(99, 102, 241, 0.8)' }} />
            <YAxis stroke="rgba(99, 102, 241, 0.7)" tick={{ fill: 'rgba(99, 102, 241, 0.8)' }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ paddingTop: '12px', fontSize: '13px', fontWeight: '500' }} />
            {dataKeys.map((key, index) => (
              <Line 
                key={key as string}
                type="monotone" 
                dataKey={key as string} 
                stroke={colors[index % colors.length]} 
                strokeWidth={2.5}
                dot={{ r: 3.5, fill: colors[index % colors.length], strokeWidth: 2, stroke: '#fff' }}
                activeDot={{ r: 5, fill: colors[index % colors.length], stroke: '#fff', strokeWidth: 2 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export const SimpleStackedBarChart = <T extends object = { [key: string]: string | number }>({
  data,
  dataKeys,
  xAxisKey,
  title,
  colors = ["#10b981", "#f59e0b", "#6366f1"],
  showAllLabels = false
}: {
  data: T[];
  dataKeys: (keyof T)[];
  xAxisKey: keyof T;
  title?: string;
  colors?: string[];
  showAllLabels?: boolean;
}) => {
  return (
    <div className={`w-full h-80 relative`}>
      {title && (
        <h3 className="text-lg font-semibold mb-4 text-center">{title}</h3>
      )}
      <div className="relative rounded-2xl h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <defs>
              {dataKeys.map((key, index) => (
                <linearGradient key={key as string} id={`stackedBarGradient-${key as string}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={colors[index % colors.length]} stopOpacity={0.8} />
                  <stop offset="100%" stopColor={colors[index % colors.length]} stopOpacity={0.3} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(99, 102, 241, 0.1)" />
            <XAxis 
              dataKey={xAxisKey as string} 
              interval={showAllLabels ? 0 : 'preserveStartEnd'}
              angle={showAllLabels ? -30 : 0}
              textAnchor={showAllLabels ? 'end' : 'middle'}
              height={showAllLabels ? 60 : 40}
              fontSize={12}
              stroke="rgba(99, 102, 241, 0.7)"
              tick={{ fill: 'rgba(99, 102, 241, 0.8)' }}
            />
            <YAxis stroke="rgba(99, 102, 241, 0.7)" tick={{ fill: 'rgba(99, 102, 241, 0.8)' }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ paddingTop: '12px', fontSize: '13px', fontWeight: '500' }} />
            {dataKeys.map((key, index) => (
              <Bar key={key as string} dataKey={key as string} stackId="a" fill={`url(#stackedBarGradient-${key as string})`} radius={index === dataKeys.length - 1 ? [6, 6, 0, 0] : 0} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export const SimpleGroupedBarLineChart = <T extends object = { [key: string]: string | number }>({
  data,
  barKeys,
  lineKey,
  xAxisKey,
  title,
  colors = ["#10b981", "#f59e0b"],
  lineColor = "#6366f1",
  showAllLabels = false
}: {
  data: T[];
  barKeys: (keyof T)[];
  lineKey: keyof T;
  xAxisKey: keyof T;
  title?: string;
  colors?: string[];
  lineColor?: string;
  showAllLabels?: boolean;
}) => {
  return (
    <div className={`w-full h-80 relative`}>
      {title && (
        <h3 className="text-lg font-semibold mb-4 text-center">{title}</h3>
      )}
      <div className="relative rounded-2xl h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <defs>
              {barKeys.map((key, index) => (
                <linearGradient key={key as string} id={`groupedBarGradient-${key as string}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={colors[index % colors.length]} stopOpacity={0.8} />
                  <stop offset="100%" stopColor={colors[index % colors.length]} stopOpacity={0.3} />
                </linearGradient>
              ))}
              <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={lineColor} stopOpacity={0.8} />
                <stop offset="100%" stopColor={lineColor} stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(99, 102, 241, 0.1)" />
            <XAxis 
              dataKey={xAxisKey as string} 
              interval={showAllLabels ? 0 : 'preserveStartEnd'}
              angle={showAllLabels ? -30 : 0}
              textAnchor={showAllLabels ? 'end' : 'middle'}
              height={showAllLabels ? 60 : 40}
              fontSize={12}
              stroke="rgba(99, 102, 241, 0.7)"
              tick={{ fill: 'rgba(99, 102, 241, 0.8)' }}
            />
            <YAxis stroke="rgba(99, 102, 241, 0.7)" tick={{ fill: 'rgba(99, 102, 241, 0.8)' }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ paddingTop: '12px', fontSize: '13px', fontWeight: '500' }} />
            {barKeys.map((key, index) => (
              <Bar key={key as string} dataKey={key as string} fill={`url(#groupedBarGradient-${key as string})`} radius={[6, 6, 0, 0]} barSize={28} />
            ))}
            <Line type="monotone" dataKey={lineKey as string} stroke={lineColor} strokeWidth={2.5} dot={{ r: 3.5, fill: lineColor, strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 5, fill: lineColor, stroke: '#fff', strokeWidth: 2 }} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};