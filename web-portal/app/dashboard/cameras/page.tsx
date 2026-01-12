'use client';

import { useState, useEffect } from 'react';
import { Camera, Plus, Wifi, WifiOff, CheckCircle, XCircle, Pencil, Trash2, Play } from 'lucide-react';
import Link from 'next/link';

interface CameraDevice {
  id: number;
  classroom_id: number;
  classroom_name: string;
  grade_level: string;
  section_name: string;
  name: string;
  ip_address: string;
  port: number;
  username?: string;
  status: 'active' | 'inactive' | 'error';
  last_capture?: string;
  created_at: string;
}

export default function CamerasPage() {
  const [cameras, setCameras] = useState<CameraDevice[]>([]);
  const [loading, setLoading] = useState(true);
  const [testingCamera, setTestingCamera] = useState<number | null>(null);
  const [testingStream, setTestingStream] = useState<number | null>(null);

  useEffect(() => {
    fetchCameras();
  }, []);

  const fetchCameras = async () => {
    try {
      const response = await fetch('/api/cameras');
      const data = await response.json();
      setCameras(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch cameras:', error);
      setCameras([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this camera? This cannot be undone.')) return;
    try {
      await fetch(`/api/cameras/${id}`, { method: 'DELETE' });
      fetchCameras();
    } catch (error) {
      console.error('Failed to delete camera:', error);
    }
  };

  const handleTestConnection = async (id: number) => {
    setTestingCamera(id);
    try {
      const response = await fetch(`/api/cameras/${id}/test`, { method: 'POST' });
      const result = await response.json();
      
      if (result.success) {
        alert('✓ Camera configuration validated!\n\n' + (result.data?.note || ''));
      } else {
        alert('✗ Configuration validation failed: ' + result.error);
      }
      fetchCameras();
    } catch (error) {
      console.error('Failed to test camera:', error);
      alert('✗ Camera test failed');
    } finally {
      setTestingCamera(null);
    }
  };

  const handleTestStream = async (id: number) => {
    setTestingStream(id);
    try {
      const response = await fetch(`/api/cameras/${id}/test-stream`, { method: 'POST' });
      const result = await response.json();
      
      if (result.success) {
        const data = result.data;
        alert(`✓ RTSP Stream Test Successful!\n\nResolution: ${data.resolution}\nFPS: ${data.fps}\nFrame Captured: Yes`);
      } else {
        alert('✗ RTSP stream test failed:\n\n' + result.error);
      }
      fetchCameras();
    } catch (error) {
      console.error('Failed to test stream:', error);
      alert('✗ Stream test failed. Make sure OpenCV is installed.');
    } finally {
      setTestingStream(null);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'inactive':
        return <WifiOff className="w-5 h-5 text-gray-400" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Wifi className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Camera Management</h1>
          <p className="text-gray-600 mt-1">Manage cameras for automated classroom monitoring</p>
        </div>
        <Link
          href="/dashboard/cameras/create"
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-5 h-5" />
          Add Camera
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <Camera className="w-8 h-8 text-blue-600" />
            <div>
              <div className="text-2xl font-bold text-gray-900">{cameras.length}</div>
              <div className="text-sm text-gray-600">Total Cameras</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-8 h-8 text-green-600" />
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {cameras.filter(c => c.status === 'active').length}
              </div>
              <div className="text-sm text-gray-600">Active</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <WifiOff className="w-8 h-8 text-gray-400" />
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {cameras.filter(c => c.status === 'inactive').length}
              </div>
              <div className="text-sm text-gray-600">Inactive</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <XCircle className="w-8 h-8 text-red-600" />
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {cameras.filter(c => c.status === 'error').length}
              </div>
              <div className="text-sm text-gray-600">Error</div>
            </div>
          </div>
        </div>
      </div>

      {/* Cameras Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cameras.map(camera => (
          <div key={camera.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-lg ${
                  camera.status === 'active' ? 'bg-green-100' :
                  camera.status === 'error' ? 'bg-red-100' : 'bg-gray-100'
                }`}>
                  <Camera className={`w-6 h-6 ${
                    camera.status === 'active' ? 'text-green-600' :
                    camera.status === 'error' ? 'text-red-600' : 'text-gray-600'
                  }`} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{camera.name}</h3>
                  <p className="text-sm text-gray-600">{camera.classroom_name}</p>
                </div>
              </div>
              {getStatusIcon(camera.status)}
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Grade/Section:</span>
                <span className="font-medium text-gray-900">
                  {camera.grade_level} - {camera.section_name}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">IP Address:</span>
                <span className="font-mono text-gray-900">{camera.ip_address}:{camera.port}</span>
              </div>
              {camera.last_capture && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Last Capture:</span>
                  <span className="text-gray-900">
                    {new Date(camera.last_capture).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-gray-200">
              <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(camera.status)}`}>
                {camera.status.charAt(0).toUpperCase() + camera.status.slice(1)}
              </span>
            </div>

            <div className="flex items-center gap-2 mt-4">
              <button
                onClick={() => handleTestConnection(camera.id)}
                disabled={testingCamera === camera.id || testingStream === camera.id}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm"
                title="Validate camera configuration"
              >
                <Wifi className="w-4 h-4" />
                {testingCamera === camera.id ? 'Testing...' : 'Config'}
              </button>
              <button
                onClick={() => handleTestStream(camera.id)}
                disabled={testingCamera === camera.id || testingStream === camera.id}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 text-sm"
                title="Test actual RTSP stream (requires OpenCV)"
              >
                <Play className="w-4 h-4" />
                {testingStream === camera.id ? 'Testing...' : 'Stream'}
              </button>
              <Link
                href={`/dashboard/cameras/${camera.id}/edit`}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                title="Edit camera"
              >
                <Pencil className="w-4 h-4" />
              </Link>
              <button
                onClick={() => handleDelete(camera.id)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                title="Delete camera"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {cameras.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No cameras configured</h3>
          <p className="text-gray-600 mb-4">Add your first camera to start automated monitoring</p>
          <Link
            href="/dashboard/cameras/create"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-5 h-5" />
            Add Camera
          </Link>
        </div>
      )}
    </div>
  );
}
