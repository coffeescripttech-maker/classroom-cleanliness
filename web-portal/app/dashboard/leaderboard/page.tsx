'use client';

import { useState, useEffect } from 'react';
import { Trophy, Medal, Award, TrendingUp, TrendingDown, Minus, Calendar, Filter } from 'lucide-react';

interface LeaderboardEntry {
  rank: number;
  classroom_id: number;
  classroom_name: string;
  grade_level: string;
  section_name: string;
  building: string;
  average_score: number;
  total_analyses: number;
  latest_score: number;
  latest_rating: string;
  trend: 'up' | 'down' | 'stable';
  improvement: number;
}

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [timePeriod, setTimePeriod] = useState('all');
  const [filterGrade, setFilterGrade] = useState('all');
  const [gradeLevels, setGradeLevels] = useState<string[]>([]);

  useEffect(() => {
    fetchLeaderboard();
  }, [timePeriod, filterGrade]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (timePeriod !== 'all') params.append('period', timePeriod);
      if (filterGrade !== 'all') params.append('grade', filterGrade);
      
      const response = await fetch(`/api/leaderboard?${params}`);
      const data = await response.json();
      setLeaderboard(Array.isArray(data) ? data : []);
      
      // Extract unique grade levels
      const grades = Array.from(new Set(data.map((entry: LeaderboardEntry) => entry.grade_level)));
      setGradeLevels(grades as string[]);
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
      setLeaderboard([]);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-8 h-8 text-yellow-500" />;
      case 2:
        return <Medal className="w-8 h-8 text-gray-400" />;
      case 3:
        return <Award className="w-8 h-8 text-amber-600" />;
      default:
        return <div className="w-8 h-8 flex items-center justify-center font-bold text-gray-600">{rank}</div>;
    }
  };

  const getRankBadgeColor = (rank: number) => {
    if (rank === 1) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    if (rank === 2) return 'bg-gray-100 text-gray-800 border-gray-300';
    if (rank === 3) return 'bg-amber-100 text-amber-800 border-amber-300';
    return 'bg-blue-50 text-blue-800 border-blue-200';
  };

  const getRatingColor = (rating: string) => {
    switch (rating) {
      case 'Excellent': return 'bg-green-100 text-green-800';
      case 'Good': return 'bg-blue-100 text-blue-800';
      case 'Fair': return 'bg-yellow-100 text-yellow-800';
      case 'Poor': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTrendIcon = (trend: string, improvement: number) => {
    if (trend === 'up') return <TrendingUp className="w-5 h-5 text-green-600" />;
    if (trend === 'down') return <TrendingDown className="w-5 h-5 text-red-600" />;
    return <Minus className="w-5 h-5 text-gray-400" />;
  };

  if (loading) return <div className="p-6">Loading leaderboard...</div>;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Trophy className="w-8 h-8 text-yellow-500" />
            Cleanliness Leaderboard
          </h1>
          <p className="text-gray-600 mt-1">Rankings based on classroom cleanliness scores</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex items-center gap-2 flex-1">
            <Calendar className="w-5 h-5 text-gray-400" />
            <select
              value={timePeriod}
              onChange={(e) => setTimePeriod(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
          </div>

          <div className="flex items-center gap-2 flex-1">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={filterGrade}
              onChange={(e) => setFilterGrade(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Grades</option>
              {gradeLevels.map(grade => (
                <option key={grade} value={grade}>{grade}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Top 3 Podium */}
      {leaderboard.length >= 3 && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          {/* 2nd Place */}
          <PodiumCard entry={leaderboard[1]} rank={2} />
          {/* 1st Place */}
          <PodiumCard entry={leaderboard[0]} rank={1} />
          {/* 3rd Place */}
          <PodiumCard entry={leaderboard[2]} rank={3} />
        </div>
      )}

      {/* Leaderboard Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rank</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Classroom</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Grade/Section</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Avg Score</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Latest</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Analyses</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Trend</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {leaderboard.map((entry) => (
                <tr key={entry.classroom_id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {getRankIcon(entry.rank)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{entry.classroom_name}</div>
                    <div className="text-sm text-gray-500">{entry.building}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {entry.grade_level} - {entry.section_name}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex flex-col items-center">
                      <span className="text-2xl font-bold text-gray-900">{entry.average_score.toFixed(1)}</span>
                      <span className="text-xs text-gray-500">out of 50</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${getRatingColor(entry.latest_rating)}`}>
                      {entry.latest_rating}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-sm font-medium text-gray-900">{entry.total_analyses}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      {getTrendIcon(entry.trend, entry.improvement)}
                      <span className={`text-sm font-medium ${
                        entry.trend === 'up' ? 'text-green-600' : 
                        entry.trend === 'down' ? 'text-red-600' : 
                        'text-gray-400'
                      }`}>
                        {entry.improvement > 0 ? '+' : ''}{entry.improvement.toFixed(1)}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {leaderboard.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <Trophy className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No data yet</h3>
          <p className="text-gray-600">
            Upload and analyze classroom images to see rankings
          </p>
        </div>
      )}
    </div>
  );
}

function PodiumCard({ entry, rank }: { entry: LeaderboardEntry; rank: number }) {
  const getHeight = () => {
    if (rank === 1) return 'h-64';
    if (rank === 2) return 'h-52';
    return 'h-48';
  };

  const getBgColor = () => {
    if (rank === 1) return 'bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-300';
    if (rank === 2) return 'bg-gradient-to-br from-gray-50 to-gray-100 border-gray-300';
    return 'bg-gradient-to-br from-amber-50 to-amber-100 border-amber-300';
  };

  const order = rank === 1 ? 'order-2' : rank === 2 ? 'order-1' : 'order-3';

  return (
    <div className={`${order} ${getHeight()} ${getBgColor()} border-2 rounded-lg p-4 flex flex-col items-center justify-between transition-all hover:scale-105`}>
      <div className="text-center">
        {rank === 1 && <Trophy className="w-12 h-12 text-yellow-500 mx-auto mb-2" />}
        {rank === 2 && <Medal className="w-10 h-10 text-gray-400 mx-auto mb-2" />}
        {rank === 3 && <Award className="w-10 h-10 text-amber-600 mx-auto mb-2" />}
        <div className="text-4xl font-bold mb-1">{rank}</div>
        <div className="text-xs text-gray-500 uppercase">Place</div>
      </div>
      
      <div className="text-center">
        <div className="font-bold text-gray-900 mb-1">{entry.classroom_name}</div>
        <div className="text-xs text-gray-600 mb-2">{entry.grade_level}</div>
        <div className="text-3xl font-bold text-gray-900">{entry.average_score.toFixed(1)}</div>
        <div className="text-xs text-gray-500">Average Score</div>
      </div>
    </div>
  );
}
