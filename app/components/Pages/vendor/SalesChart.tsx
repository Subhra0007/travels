"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const data = [
  { name: "Jan", value: 0 },
  { name: "Feb", value: 18000 },
  { name: "Mar", value: 20000 },
  { name: "Apr", value: 15000 },
  { name: "May", value: 30000 },
  { name: "Jun", value: 25000 },
  { name: "Jul", value: 35000 },
  { name: "Aug", value: 42000 },
  { name: "Sep", value: 32000 },
  { name: "Oct", value: 38000 },
  { name: "Nov", value: 30000 },
  { name: "Dec", value: 28000 },
];

export default function SalesChart() {
  return (
    <div className="bg-white p-6 rounded-lg shadow text-gray-800">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">Income</h3>
        <select className="text-sm border p-1 rounded">
          <option>Months</option>
        </select>
      </div>

      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <XAxis dataKey="name" stroke="#888" />
            <YAxis stroke="#888" />
            <Tooltip />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#3b82f6"
              strokeWidth={3}
              fill="url(#incomeGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
