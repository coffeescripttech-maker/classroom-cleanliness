'use client';

import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ComparisonData {
  classroom_name: string;
  avg_score: number;
}

interface ComparisonChartProps {
  timeRange: string;
  gradeLevel: string;
}

export default function ComparisonChart({ timeRange, gradeLevel }: ComparisonChartProps) {
  const [data, setData] = useState<ComparisonData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchComparisonData();
  }, [timeRange, gradeLevel]);

  const fetchComparisonData = async () => {
    try {
      const params = new URLSearchParams({
        timeRange,
        ...(gradeLevel !== 'all' && { gradeLevel })
      });
      
      const response = await fetch(`/api/reports/comparison?${params}`);
      const result = await response.json();
      
      if (result.success) {
        setData(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch comparison data:', error);
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
    name: item.classroom_name,
    'Average Score': parseFloat((item.avg_score || 0).toString()).toFixed(2),
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={formattedData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis domain={[0, 50]} />
        <Tooltip />
        <Legend />
        <Bar dataKey="Average Score" fill="#10b981" />
      </BarChart>
    </ResponsiveContainer>
  );
}
