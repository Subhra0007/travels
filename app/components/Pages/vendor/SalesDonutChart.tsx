"use client";

import { useEffect, useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

type EarningsData = {
  name: string;
  value: number;
  color: string;
};

export default function SalesDonutChart({ refreshKey = 0 }: { refreshKey?: number }) {
  const [data, setData] = useState<EarningsData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEarnings = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/vendor/stats?t=${Date.now()}`, { 
          credentials: "include",
          cache: "no-store"
        });
        const data = await res.json();
        if (data.success && data.stats) {
          const { todayEarnings, totalEarnings } = data.stats;
          const otherEarnings = Math.max(0, totalEarnings - todayEarnings);
          
          // Show today's earnings and other earnings for a meaningful donut chart
          const chartData: EarningsData[] = [
            { name: "Today's Earnings", value: todayEarnings, color: "#4f46e5" },
            { name: "Other Earnings", value: otherEarnings, color: "#3b82f6" },
          ];
          setData(chartData);
        }
      } catch (error) {
        console.error("Failed to fetch earnings data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEarnings();
  }, [refreshKey]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value);
  };

  const total = data.reduce((sum, item) => sum + item.value, 0);
  const percentageData = data.map((item) => ({
    ...item,
    percentage: total > 0 ? Math.round((item.value / total) * 100) : 0,
  }));

  return (
    <div className="bg-white p-4 rounded-lg shadow h-full text-gray-900">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-sm">Earnings Overview</h3>
      </div>

      <div className="w-full h-40">
        {loading ? (
          <div className="h-full flex items-center justify-center text-gray-500 text-xs">
            Loading...
          </div>
        ) : data.length === 0 || total === 0 ? (
          <div className="h-full flex items-center justify-center text-gray-500 text-xs">
            No earnings data
          </div>
        ) : (
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
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="mt-4 space-y-1 text-xs">
        {percentageData.map((item, i) => (
          <div key={i} className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span>{item.name}</span>
            </div>
            <span className="font-medium">{formatCurrency(item.value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
