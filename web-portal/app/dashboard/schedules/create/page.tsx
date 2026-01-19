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
    camera_ids: [] as number[], // Changed to array for multi-select
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
      // API returns array directly, not wrapped in {data: [...]}
      const camerasData = Array.isArray(result) ? result : (result.data || []);
      setCameras(camerasData);
    } catch (error) {
      console.error('Failed to fetch cameras:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create a schedule for each selected camera
      const promises = formData.camera_ids.map(camera_id =>
        fetch('/api/schedules', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...formData,
            camera_id,
            days_of_week: formData.days_of_week.join(',')
          })
        })
      );

      const results = await Promise.all(promises);
      const allSuccessful = results.every(r => r.ok);

      if (allSuccessful) {
        router.push('/dashboard/schedules');
      } else {
        alert('Some schedules failed to create');
      }
    } catch (error) {
      console.error('Failed to create schedules:', error);
      alert('Failed to create schedules');
    } finally {
      setLoading(false);
    }
  };

  const toggleCamera = (cameraId: number) => {
    setFormData(prev => ({
      ...prev,
      camera_ids: prev.camera_ids.includes(cameraId)
        ? prev.camera_ids.filter(id => id !== cameraId)
        : [...prev.camera_ids, cameraId]
    }));
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
          Back to Schedule
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
            Cameras * (Select one or more)
          </label>
          <div className="border border-gray-300 rounded-lg p-4 max-h-64 overflow-y-auto space-y-2">
            {cameras.filter(c => c.status === 'active').length === 0 ? (
              <p className="text-sm text-red-600">
                No active cameras available. Please add a camera first.
              </p>
            ) : (
              cameras.filter(c => c.status === 'active').map((camera) => (
                <label
                  key={camera.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                    formData.camera_ids.includes(camera.id)
                      ? 'bg-blue-50 border-blue-500'
                      : 'bg-white border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={formData.camera_ids.includes(camera.id)}
                    onChange={() => toggleCamera(camera.id)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{camera.name}</div>
                    <div className="text-sm text-gray-600">{camera.classroom_name}</div>
                  </div>
                </label>
              ))
            )}
          </div>
          {formData.camera_ids.length > 0 && (
            <p className="text-sm text-green-600 mt-2">
              ✓ {formData.camera_ids.length} camera{formData.camera_ids.length > 1 ? 's' : ''} selected
            </p>
          )}
          <p className="text-sm text-gray-500 mt-2">
            💡 Tip: Select multiple cameras to apply the same schedule to all of them
          </p>
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
            Cleanup Time (Before Capture)
          </h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cleanup Duration (seconds)
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
              Time given to students to clean BEFORE capture ({Math.floor(formData.pre_capture_delay_seconds / 60)} minutes)
            </p>
            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Timeline Example:</strong> If capture time is 1:00 PM with 5 min cleanup:
              </p>
              <ul className="text-sm text-blue-700 mt-2 space-y-1 ml-4">
                <li>• <strong>12:55 PM</strong> - Alarm plays (warning)</li>
                <li>• <strong>12:55-1:00 PM</strong> - Students clean up (5 minutes)</li>
                <li>• <strong>1:00 PM</strong> - Image captured at scheduled time</li>
              </ul>
            </div>
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
            disabled={loading || formData.days_of_week.length === 0 || formData.camera_ids.length === 0}
            className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
          >
            {loading ? 'Creating...' : `Create Schedule${formData.camera_ids.length > 1 ? 's' : ''} (${formData.camera_ids.length})`}
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
