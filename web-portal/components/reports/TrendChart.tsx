'use client';

import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface TrendData {
  date: string;
  avg_score: number;
}

interface TrendChartProps {
  timeRange: string;
  gradeLevel: string;
}

export default function TrendChart({ timeRange, gradeLevel }: TrendChartProps) {
  const [data, setData] = useState<TrendData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrendData();
  }, [timeRange, gradeLevel]);

  const fetchTrendData = async () => {
    try {
      const params = new URLSearchParams({
        timeRange,
        ...(gradeLevel !== 'all' && { gradeLevel })
      });
      
      const response = await fetch(`/api/reports/trends?${params}`);
      const result = await response.json();
      
      if (result.success) {
        setData(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch trend data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="h-64 flex items-center justify-center text-gray-500">Loading...</div>;
  }

  if (data.length === 0) {
    return <div className="h-64 flex items-center justify-center text-gray-500">No data available</div>;
  }

  const formattedData = data.map(item => ({
    date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    'Score': parseFloat((item.avg_score || 0).toString()).toFixed(2),
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={formattedData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis domain={[0, 50]} />
        <Tooltip />
        <Legend />
        <Line 
          type="monotone" 
          dataKey="Score" 
          stroke="#2563eb" 
          strokeWidth={3}
          dot={{ r: 4 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
