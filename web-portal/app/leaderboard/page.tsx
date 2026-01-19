'use client';

import { useState, useEffect } from 'react';
import { Trophy, Medal, Award } from 'lucide-react';

interface LeaderboardEntry {
  rank: number;
  classroom_name: string;
  grade_level: string;
  section_name: string;
  total_score: number;
  rating: string;
  latest_capture: string;
}

export default function PublicLeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const response = await fetch('/api/leaderboard');
      const data = await response.json();
      if (data.success) {
        setLeaderboard(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="h-8 w-8 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-8 w-8 text-gray-400" />;
    if (rank === 3) return <Award className="h-8 w-8 text-amber-600" />;
    return <span className="text-2xl font-bold text-gray-400">#{rank}</span>;
  };

  const getRatingColor = (rating: string) => {
    const colors = {
      Excellent: 'bg-green-100 text-green-800',
      Good: 'bg-blue-100 text-blue-800',
      Fair: 'bg-yellow-100 text-yellow-800',
      Poor: 'bg-red-100 text-red-800',
    };
    return colors[rating as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Classroom Cleanliness Leaderboard
              </h1>
              <p className="text-gray-600 mt-1">
                Real-time rankings of classroom cleanliness
              </p>
            </div>
            <a
              href="/login"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Sign In
            </a>
          </div>
        </div>
      </header>

      {/* Leaderboard */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading leaderboard...</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* Top 3 Podium */}
            {leaderboard.length >= 3 && (
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8">
                <div className="grid grid-cols-3 gap-4 max-w-4xl mx-auto">
                  {/* 2nd Place */}
                  <div className="text-center pt-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full mb-3">
                      <Medal className="h-8 w-8 text-gray-400" />
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-white">
                      <div className="text-sm opacity-90">2nd Place</div>
                      <div className="font-bold text-lg mt-1">
                        {leaderboard[1].classroom_name}
                      </div>
                      <div className="text-sm opacity-75">
                        {leaderboard[1].grade_level} - {leaderboard[1].section_name}
                      </div>
                      <div className="text-2xl font-bold mt-2">
                        {leaderboard[1].total_score}
                      </div>
                    </div>
                  </div>

                  {/* 1st Place */}
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full mb-3">
                      <Trophy className="h-10 w-10 text-yellow-500" />
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-white">
                      <div className="text-sm opacity-90">🏆 Champion</div>
                      <div className="font-bold text-xl mt-1">
                        {leaderboard[0].classroom_name}
                      </div>
                      <div className="text-sm opacity-75">
                        {leaderboard[0].grade_level} - {leaderboard[0].section_name}
                      </div>
                      <div className="text-3xl font-bold mt-2">
                        {leaderboard[0].total_score}
                      </div>
                    </div>
                  </div>

                  {/* 3rd Place */}
                  <div className="text-center pt-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full mb-3">
                      <Award className="h-8 w-8 text-amber-600" />
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-white">
                      <div className="text-sm opacity-90">3rd Place</div>
                      <div className="font-bold text-lg mt-1">
                        {leaderboard[2].classroom_name}
                      </div>
                      <div className="text-sm opacity-75">
                        {leaderboard[2].grade_level} - {leaderboard[2].section_name}
                      </div>
                      <div className="text-2xl font-bold mt-2">
                        {leaderboard[2].total_score}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Full Rankings */}
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Complete Rankings
              </h2>
              <div className="space-y-3">
                {leaderboard.map((entry) => (
                  <div
                    key={entry.rank}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-16 flex justify-center">
                        {getRankIcon(entry.rank)}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">
                          {entry.classroom_name}
                        </div>
                        <div className="text-sm text-gray-600">
                          {entry.grade_level} - {entry.section_name}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${getRatingColor(
                          entry.rating
                        )}`}
                      >
                        {entry.rating}
                      </span>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-900">
                          {entry.total_score}
                        </div>
                        <div className="text-xs text-gray-500">points</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Login Prompt */}
        <div className="mt-8 text-center">
          <div className="inline-block bg-white rounded-lg shadow-lg p-6">
            <p className="text-gray-700 mb-4">
              Want to see detailed images and reports?
            </p>
            <a
              href="/login"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
            >
              Sign In to View More
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
