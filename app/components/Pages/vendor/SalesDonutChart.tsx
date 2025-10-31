"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

const data = [
  { name: "Recent Orders", value: 35, color: "#4f46e5" },
  { name: "Pending Payments", value: 15, color: "#06b6d4" },
  { name: "Received Payments", value: 50, color: "#3b82f6" },
];

export default function SalesDonutChart() {
  return (
    <div className="bg-white p-4 rounded-lg shadow h-full text-gray-900">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-sm">Overall Sales</h3>
        <select className="text-xs border p-1 rounded">
          <option>Months</option>
        </select>
      </div>

      <div className="w-full h-40">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={40}
              outerRadius={60}
              paddingAngle={2}
              dataKey="value"
            >
              {data.map((item, i) => (
                <Cell key={i} fill={item.color} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 space-y-1 text-xs">
        {data.map((item, i) => (
          <div key={i} className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span>{item.name}</span>
            </div>
            <span className="font-medium">{item.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
