'use client';

import { useState, useEffect } from 'react';
import { Calendar, Plus, Clock, Camera, Pencil, Trash2, Power, PowerOff } from 'lucide-react';
import Link from 'next/link';

interface Schedule {
  id: number;
  camera_id: number;
  camera_name: string;
  classroom_name: string;
  grade_level: string;
  section_name: string;
  name: string;
  capture_time: string;
  days_of_week: string;
  alarm_enabled: boolean;
  pre_capture_delay_seconds: number;
  active: boolean;
  created_at: string;
}

export default function SchedulesPage() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');

  useEffect(() => {
    fetchSchedules();
  }, [filter]);

  const fetchSchedules = async () => {
    try {
      const url = filter === 'all' 
        ? '/api/schedules'
        : `/api/schedules?active=${filter === 'active'}`;
      
      const response = await fetch(url);
      const result = await response.json();
      setSchedules(result.data || []);
    } catch (error) {
      console.error('Failed to fetch schedules:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this schedule? This cannot be undone.')) return;
    
    try {
      await fetch(`/api/schedules/${id}`, { method: 'DELETE' });
      fetchSchedules();
    } catch (error) {
      console.error('Failed to delete schedule:', error);
    }
  };

  const handleToggleActive = async (id: number, currentActive: boolean) => {
    try {
      const schedule = schedules.find(s => s.id === id);
      if (!schedule) return;

      await fetch(`/api/schedules/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...schedule,
          active: !currentActive
        })
      });
      
      fetchSchedules();
    } catch (error) {
      console.error('Failed to toggle schedule:', error);
    }
  };

  const getDaysDisplay = (daysStr: string) => {
    const dayMap: { [key: string]: string } = {
      '1': 'Mon', '2': 'Tue', '3': 'Wed', '4': 'Thu', '5': 'Fri', '6': 'Sat', '7': 'Sun'
    };
    const days = daysStr.split(',');
    return days.map(d => dayMap[d] || d).join(', ');
  };

  const formatTime = (timeStr: string) => {
    // Convert 24h to 12h format
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Schedule Management</h1>
          <p className="text-gray-600 mt-1">Automate classroom image captures</p>
        </div>
        <Link
          href="/dashboard/schedules/create"
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-5 h-5" />
          Add Schedule
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <Calendar className="w-8 h-8 text-blue-600" />
            <div>
              <div className="text-2xl font-bold text-gray-900">{schedules.length}</div>
              <div className="text-sm text-gray-600">Total Schedules</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <Power className="w-8 h-8 text-green-600" />
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {schedules.filter(s => s.active).length}
              </div>
              <div className="text-sm text-gray-600">Active</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <PowerOff className="w-8 h-8 text-gray-400" />
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {schedules.filter(s => !s.active).length}
              </div>
              <div className="text-sm text-gray-600">Inactive</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg ${
            filter === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          All
        </button>
        <button
          onClick={() => setFilter('active')}
          className={`px-4 py-2 rounded-lg ${
            filter === 'active'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Active
        </button>
        <button
          onClick={() => setFilter('inactive')}
          className={`px-4 py-2 rounded-lg ${
            filter === 'inactive'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Inactive
        </button>
      </div>

      {/* Schedules List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Schedule
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Camera / Classroom
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Days
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {schedules.map((schedule) => (
                <tr key={schedule.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-gray-400" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">{schedule.name}</div>
                        {schedule.alarm_enabled && (
                          <div className="text-xs text-gray-500">🔔 Alarm enabled</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Camera className="w-4 h-4 text-gray-400" />
                      <div>
                        <div className="text-sm text-gray-900">{schedule.camera_name}</div>
                        <div className="text-xs text-gray-500">
                          {schedule.classroom_name} - {schedule.grade_level} {schedule.section_name}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-900">{formatTime(schedule.capture_time)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{getDaysDisplay(schedule.days_of_week)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleToggleActive(schedule.id, schedule.active)}
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                        schedule.active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {schedule.active ? <Power className="w-3 h-3" /> : <PowerOff className="w-3 h-3" />}
                      {schedule.active ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/dashboard/schedules/${schedule.id}/edit`}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Pencil className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(schedule.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {schedules.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No schedules found</h3>
            <p className="text-gray-600 mb-4">Create your first schedule to automate captures</p>
            <Link
              href="/dashboard/schedules/create"
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-5 h-5" />
              Add Schedule
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
