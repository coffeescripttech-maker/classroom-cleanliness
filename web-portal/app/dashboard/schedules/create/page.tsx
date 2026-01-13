'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, Camera, Clock, Bell, Timer, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface Camera {
  id: number;
  name: string;
  classroom_name: string;
  status: string;
}

export default function CreateSchedulePage() {
  const router = useRouter();
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    camera_id: '',
    capture_time: '08:00',
    days_of_week: ['1', '2', '3', '4', '5'], // Mon-Fri default
    alarm_enabled: true,
    alarm_duration_seconds: 10,
    alarm_sound: 'default.mp3',
    pre_capture_delay_seconds: 300,
    active: true
  });

  useEffect(() => {
    fetchCameras();
  }, []);

  const fetchCameras = async () => {
    try {
      const response = await fetch('/api/cameras');
      const result = await response.json();
      setCameras(result.data || []);
    } catch (error) {
      console.error('Failed to fetch cameras:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/schedules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          camera_id: parseInt(formData.camera_id),
          days_of_week: formData.days_of_week.join(',')
        })
      });

      if (response.ok) {
        router.push('/dashboard/schedules');
      } else {
        alert('Failed to create schedule');
      }
    } catch (error) {
      console.error('Failed to create schedule:', error);
      alert('Failed to create schedule');
    } finally {
      setLoading(false);
    }
  };

  const toggleDay = (day: string) => {
    setFormData(prev => ({
      ...prev,
      days_of_week: prev.days_of_week.includes(day)
        ? prev.days_of_week.filter(d => d !== day)
        : [...prev.days_of_week, day].sort()
    }));
  };

  const dayLabels = [
    { value: '1', label: 'Monday' },
    { value: '2', label: 'Tuesday' },
    { value: '3', label: 'Wednesday' },
    { value: '4', label: 'Thursday' },
    { value: '5', label: 'Friday' },
    { value: '6', label: 'Saturday' },
    { value: '7', label: 'Sunday' }
  ];

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/dashboard/schedules"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Schedules
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Create Schedule</h1>
        <p className="text-gray-600 mt-1">Set up automated classroom image captures</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
        {/* Schedule Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Schedule Name *
          </label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., Morning Inspection"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Camera Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Camera className="w-4 h-4 inline mr-1" />
            Camera *
          </label>
          <select
            required
            value={formData.camera_id}
            onChange={(e) => setFormData({ ...formData, camera_id: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select a camera</option>
            {cameras.filter(c => c.status === 'active').map((camera) => (
              <option key={camera.id} value={camera.id}>
                {camera.name} - {camera.classroom_name}
              </option>
            ))}
          </select>
          {cameras.filter(c => c.status === 'active').length === 0 && (
            <p className="text-sm text-red-600 mt-1">
              No active cameras available. Please add a camera first.
            </p>
          )}
        </div>

        {/* Capture Time */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Clock className="w-4 h-4 inline mr-1" />
            Capture Time *
          </label>
          <input
            type="time"
            required
            value={formData.capture_time}
            onChange={(e) => setFormData({ ...formData, capture_time: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="text-sm text-gray-500 mt-1">
            Time when the image will be captured
          </p>
        </div>

        {/* Days of Week */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Calendar className="w-4 h-4 inline mr-1" />
            Days of Week *
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {dayLabels.map((day) => (
              <button
                key={day.value}
                type="button"
                onClick={() => toggleDay(day.value)}
                className={`px-4 py-2 rounded-lg border-2 transition-colors ${
                  formData.days_of_week.includes(day.value)
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
                }`}
              >
                {day.label}
              </button>
            ))}
          </div>
          {formData.days_of_week.length === 0 && (
            <p className="text-sm text-red-600 mt-1">Select at least one day</p>
          )}
        </div>

        {/* Alarm Settings */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            <Bell className="w-5 h-5 inline mr-2" />
            Alarm Settings
          </h3>
          
          <div className="space-y-4">
            {/* Enable Alarm */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="alarm_enabled"
                checked={formData.alarm_enabled}
                onChange={(e) => setFormData({ ...formData, alarm_enabled: e.target.checked })}
                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <label htmlFor="alarm_enabled" className="text-sm font-medium text-gray-700">
                Enable alarm before capture
              </label>
            </div>

            {formData.alarm_enabled && (
              <>
                {/* Alarm Duration */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Alarm Duration (seconds)
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="60"
                    value={formData.alarm_duration_seconds}
                    onChange={(e) => setFormData({ ...formData, alarm_duration_seconds: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </>
            )}
          </div>
        </div>

        {/* Pre-Capture Delay */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            <Timer className="w-5 h-5 inline mr-2" />
            Pre-Capture Delay
          </h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Delay (seconds)
            </label>
            <input
              type="number"
              min="0"
              max="600"
              step="30"
              value={formData.pre_capture_delay_seconds}
              onChange={(e) => setFormData({ ...formData, pre_capture_delay_seconds: parseInt(e.target.value) })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-sm text-gray-500 mt-1">
              Time given to students to clean before capture ({Math.floor(formData.pre_capture_delay_seconds / 60)} minutes)
            </p>
          </div>
        </div>

        {/* Active Status */}
        <div className="border-t pt-6">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="active"
              checked={formData.active}
              onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
              className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
            />
            <label htmlFor="active" className="text-sm font-medium text-gray-700">
              Activate schedule immediately
            </label>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-6 border-t">
          <button
            type="submit"
            disabled={loading || formData.days_of_week.length === 0}
            className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
          >
            {loading ? 'Creating...' : 'Create Schedule'}
          </button>
          <Link
            href="/dashboard/schedules"
            className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium text-gray-700"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
