'use client';

import React, { useEffect, useState } from 'react';
import { 
  Building2, 
  Camera, 
  Image as ImageIcon, 
  TrendingUp,
  Award,
  CheckCircle2,
  AlertCircle,
  Clock
} from 'lucide-react';
import StatsCard from '@/components/dashboard/StatsCard';
import LeaderboardTable from '@/components/leaderboard/LeaderboardTable';
import { DashboardStats, LeaderboardEntry } from '@/types';

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch stats
      const statsRes = await fetch('/api/dashboard/stats');
      const statsData = await statsRes.json();
      
      // Fetch leaderboard
      const leaderboardRes = await fetch('/api/scores/leaderboard?limit=5');
      const leaderboardData = await leaderboardRes.json();
      
      setStats(statsData.data);
      setLeaderboard(leaderboardData.data || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="mt-1 text-sm text-gray-500">
                Classroom Cleanliness Monitoring System
              </p>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Clock className="w-4 h-4" />
              <span>{new Date().toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Total Classrooms"
            value={stats?.total_classrooms || 0}
            icon={<Building2 className="w-6 h-6" />}
            color="blue"
          />
          
          <StatsCard
            title="Active Cameras"
            value={stats?.active_cameras || 0}
            icon={<Camera className="w-6 h-6" />}
            color="green"
          />
          
          <StatsCard
            title="Today's Captures"
            value={stats?.today_captures || 0}
            icon={<ImageIcon className="w-6 h-6" />}
            color="purple"
          />
          
          <StatsCard
            title="Average Score"
            value={stats?.average_score ? `${stats.average_score.toFixed(1)}/50` : '0/50'}
            icon={<TrendingUp className="w-6 h-6" />}
            color="yellow"
          />
        </div>

        {/* Rating Distribution */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Cleanliness Ratings
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <Award className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-600">
                {stats?.excellent_count || 0}
              </div>
              <div className="text-sm text-gray-600">Excellent</div>
            </div>
            
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <CheckCircle2 className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-600">
                {stats?.good_count || 0}
              </div>
              <div className="text-sm text-gray-600">Good</div>
            </div>
            
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <AlertCircle className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-yellow-600">
                {stats?.fair_count || 0}
              </div>
              <div className="text-sm text-gray-600">Fair</div>
            </div>
            
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <AlertCircle className="w-8 h-8 text-red-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-red-600">
                {stats?.poor_count || 0}
              </div>
              <div className="text-sm text-gray-600">Poor</div>
            </div>
          </div>
        </div>

        {/* Top 5 Leaderboard */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                Top 5 Classrooms
              </h2>
              <a 
                href="/leaderboard" 
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                View All →
              </a>
            </div>
          </div>
          <div className="p-6">
            <LeaderboardTable data={leaderboard} loading={false} />
          </div>
        </div>
      </div>
    </div>
  );
}
