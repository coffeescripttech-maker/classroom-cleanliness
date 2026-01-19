'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, BarChart3, Calendar, Download, Filter, Award, Target, Activity } from 'lucide-react';
import TrendChart from '@/components/reports/TrendChart';
import ComparisonChart from '@/components/reports/ComparisonChart';
import MetricsBreakdownChart from '@/components/reports/MetricsBreakdownChart';

interface Statistics {
  totalAnalyses: number;
  averageScore: number;
  topClassroom: string;
  improvementRate: number;
}

export default function ReportsPage() {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');
  const [selectedGrade, setSelectedGrade] = useState<string>('all');
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStatistics();
  }, [timeRange, selectedGrade]);

  const fetchStatistics = async () => {
    try {
      const params = new URLSearchParams({
        timeRange,
        ...(selectedGrade !== 'all' && { gradeLevel: selectedGrade })
      });
      
      const response = await fetch(`/api/reports/statistics?${params}`);
      const result = await response.json();
      
      if (result.success) {
        setStatistics(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format: 'pdf' | 'excel') => {
    alert(`Export to ${format.toUpperCase()} - Coming soon!`);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600 mt-1">Track performance and trends over time</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => handleExport('excel')} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
            <Download className="w-4 h-4" />
            Export Excel
          </button>
          <button onClick={() => handleExport('pdf')} className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
            <Download className="w-4 h-4" />
            Export PDF
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center gap-4">
          <Filter className="w-5 h-5 text-gray-400" />
          <div className="flex gap-4 flex-1">
            <div className="flex gap-2">
              <button onClick={() => setTimeRange('week')} className={`px-4 py-2 rounded-lg ${timeRange === 'week' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                Last Week
              </button>
              <button onClick={() => setTimeRange('month')} className={`px-4 py-2 rounded-lg ${timeRange === 'month' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                Last Month
              </button>
              <button onClick={() => setTimeRange('year')} className={`px-4 py-2 rounded-lg ${timeRange === 'year' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                Last Year
              </button>
            </div>
            <select value={selectedGrade} onChange={(e) => setSelectedGrade(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option value="all">All Grades</option>
              <option value="Grade 7">Grade 7</option>
              <option value="Grade 8">Grade 8</option>
              <option value="Grade 9">Grade 9</option>
            </select>
          </div>
        </div>
      </div>

      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3">
              <Activity className="w-8 h-8 text-blue-600" />
              <div>
                <div className="text-2xl font-bold text-gray-900">{statistics.totalAnalyses}</div>
                <div className="text-sm text-gray-600">Total Analyses</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3">
              <Target className="w-8 h-8 text-green-600" />
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {statistics.averageScore ? Number(statistics.averageScore).toFixed(1) : '0.0'}
                </div>
                <div className="text-sm text-gray-600">Average Score</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3">
              <Award className="w-8 h-8 text-yellow-600" />
              <div>
                <div className="text-lg font-bold text-gray-900">{statistics.topClassroom}</div>
                <div className="text-sm text-gray-600">Top Performer</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-purple-600" />
              <div>
                <div className="text-2xl font-bold text-gray-900">{statistics.improvementRate > 0 ? '+' : ''}{statistics.improvementRate.toFixed(1)}%</div>
                <div className="text-sm text-gray-600">Improvement Rate</div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-900">Score Trends</h2>
          </div>
          <TrendChart timeRange={timeRange} gradeLevel={selectedGrade} />
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-green-600" />
            <h2 className="text-xl font-bold text-gray-900">Classroom Comparison</h2>
          </div>
          <ComparisonChart timeRange={timeRange} gradeLevel={selectedGrade} />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5 text-purple-600" />
          <h2 className="text-xl font-bold text-gray-900">Metrics Breakdown</h2>
        </div>
        <MetricsBreakdownChart timeRange={timeRange} gradeLevel={selectedGrade} />
      </div>

      {/* <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-bold text-blue-900 mb-3">📊 Key Insights</h3>
        <ul className="space-y-2 text-blue-800">
          <li>• Average scores have improved by {statistics?.improvementRate.toFixed(1)}% over the selected period</li>
          <li>• {statistics?.topClassroom} is leading with consistent high scores</li>
          <li>• Floor cleanliness shows the most improvement across all classrooms</li>
          <li>• Consider focusing on wall/board maintenance for lower-scoring classrooms</li>
        </ul>
      </div> */}
    </div>
  );
}
