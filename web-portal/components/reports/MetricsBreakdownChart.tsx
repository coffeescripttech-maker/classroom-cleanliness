'use client';

import { useState, useEffect } from 'react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, ResponsiveContainer } from 'recharts';

interface MetricsData {
  metric: string;
  avg_score: number;
}

interface MetricsBreakdownChartProps {
  timeRange: string;
  gradeLevel: string;
}

export default function MetricsBreakdownChart({ timeRange, gradeLevel }: MetricsBreakdownChartProps) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMetricsData();
  }, [timeRange, gradeLevel]);

  const fetchMetricsData = async () => {
    try {
      const params = new URLSearchParams({
        timeRange,
        ...(gradeLevel !== 'all' && { gradeLevel })
      });
      
      const response = await fetch(`/api/reports/statistics?${params}`);
      const result = await response.json();
      
      if (result.success && result.data.metrics) {
        // Transform metrics data for radar chart
        const metricsData = [
          { metric: 'Floor', score: result.data.metrics.floor || 0, fullMark: 10 },
          { metric: 'Furniture', score: result.data.metrics.furniture || 0, fullMark: 10 },
          { metric: 'Trash', score: result.data.metrics.trash || 0, fullMark: 10 },
          { metric: 'Wall', score: result.data.metrics.wall || 0, fullMark: 10 },
          { metric: 'Clutter', score: result.data.metrics.clutter || 0, fullMark: 10 },
        ];
        setData(metricsData);
      }
    } catch (error) {
      console.error('Failed to fetch metrics data:', error);
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

  return (
    <ResponsiveContainer width="100%" height={400}>
      <RadarChart data={data}>
        <PolarGrid />
        <PolarAngleAxis dataKey="metric" />
        <PolarRadiusAxis angle={90} domain={[0, 10]} />
        <Radar name="Average Score" dataKey="score" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} />
        <Legend />
      </RadarChart>
    </ResponsiveContainer>
  );
}
