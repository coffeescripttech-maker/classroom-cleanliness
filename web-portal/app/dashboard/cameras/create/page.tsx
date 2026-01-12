'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Camera } from 'lucide-react';
import Link from 'next/link';

interface Classroom {
  id: number;
  name: string;
  grade_level: string;
  section_name: string;
}

export default function CreateCameraPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);

  const [formData, setFormData] = useState({
    classroom_id: '',
    name: '',
    ip_address: '',
    port: 554, // RTSP default port
    username: 'admin',
    password: '',
    rtsp_path: '/cam/realmonitor?channel=1&subtype=0', // Dahua default
    status: 'active'
  });

  useEffect(() => {
    fetchClassrooms();
  }, []);

  const fetchClassrooms = async () => {
    try {
      const response = await fetch('/api/classrooms?limit=100');
      const result = await response.json();
      const data = result.data || result;
      setClassrooms(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch classrooms:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/cameras', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          classroom_id: parseInt(formData.classroom_id),
          port: parseInt(formData.port.toString())
        })
      });

      const result = await response.json();

      if (response.ok && result.success) {
        router.push('/dashboard/cameras');
      } else {
        alert(result.error || 'Failed to create camera');
      }
    } catch (error) {
      console.error('Failed to create camera:', error);
      alert('Failed to create camera');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <Link
          href="/dashboard/cameras"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Cameras
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Camera className="w-8 h-8" />
          Add New Camera
        </h1>
        <p className="text-gray-600 mt-1">Configure a new camera for classroom monitoring</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
        {/* Camera Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Camera Name *
          </label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., Camera 101"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Classroom */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Assign to Classroom *
          </label>
          <select
            required
            value={formData.classroom_id}
            onChange={(e) => setFormData({ ...formData, classroom_id: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select a classroom</option>
            {classrooms.map(classroom => (
              <option key={classroom.id} value={classroom.id}>
                {classroom.name} - {classroom.grade_level} {classroom.section_name}
              </option>
            ))}
          </select>
        </div>

        {/* IP Address & Port */}
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              IP Address *
            </label>
            <input
              type="text"
              required
              value={formData.ip_address}
              onChange={(e) => setFormData({ ...formData, ip_address: e.target.value })}
              placeholder="192.168.1.100"
              pattern="^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Port *
            </label>
            <input
              type="number"
              required
              min="1"
              max="65535"
              value={formData.port}
              onChange={(e) => setFormData({ ...formData, port: parseInt(e.target.value) })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">Default RTSP: 554</p>
          </div>
        </div>

        {/* RTSP Path */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            RTSP Path *
          </label>
          <input
            type="text"
            required
            value={formData.rtsp_path}
            onChange={(e) => setFormData({ ...formData, rtsp_path: e.target.value })}
            placeholder="/cam/realmonitor?channel=1&subtype=0"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-500 mt-1">
            Dahua default: /cam/realmonitor?channel=1&subtype=0
          </p>
        </div>

        {/* RTSP URL Preview */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm font-medium text-blue-900 mb-2">RTSP URL Preview:</p>
          <code className="text-sm text-blue-800 break-all">
            rtsp://{formData.username || 'admin'}:****@{formData.ip_address || '192.168.1.100'}:{formData.port}{formData.rtsp_path}
          </code>
        </div>

        {/* Authentication (Required for Dahua) */}
        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Authentication (Required for Dahua CCTV)</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Username *
              </label>
              <input
                type="text"
                required
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder="admin"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password *
              </label>
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="mt-3 bg-yellow-50 border border-yellow-200 rounded p-3 text-sm text-yellow-800">
            <strong>Note:</strong> Default Dahua credentials are usually username: <code>admin</code>, password: <code>admin</code> or your custom password.
          </div>
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Status
          </label>
          <select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <Save className="w-5 h-5" />
            {loading ? 'Creating...' : 'Create Camera'}
          </button>
          <Link
            href="/dashboard/cameras"
            className="px-6 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
