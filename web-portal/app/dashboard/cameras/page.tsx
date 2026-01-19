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
  const [streamingCamera, setStreamingCamera] = useState<CameraDevice | null>(null);
  const [streamUrl, setStreamUrl] = useState<string | null>(null);

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

  const handleViewStream = async (camera: CameraDevice) => {
    try {
      const response = await fetch(`/api/cameras/${camera.id}/stream`);
      const result = await response.json();
      
      if (result.success) {
        setStreamingCamera(camera);
        setStreamUrl(result.data.streamUrl);
        
        // Test if stream URL is accessible
        console.log('Stream URL:', result.data.streamUrl);
        
        // Try to fetch the stream to see if it's working
        fetch(result.data.streamUrl)
          .then(r => {
            console.log('Stream response status:', r.status);
            console.log('Stream response headers:', r.headers);
            if (!r.ok) {
              console.error('Stream not accessible:', r.statusText);
            }
          })
          .catch(e => console.error('Stream fetch error:', e));
      } else {
        alert('Failed to get stream URL: ' + result.error);
      }
    } catch (error) {
      console.error('Failed to get stream:', error);
      alert('Failed to start stream. Check console for details.');
    }
  };

  const closeStream = () => {
    setStreamingCamera(null);
    setStreamUrl(null);
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
                onClick={() => handleViewStream(camera)}
                disabled={testingCamera === camera.id || testingStream === camera.id}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 text-sm"
                title="View live RTSP stream"
              >
                <Play className="w-4 h-4" />
                Stream
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

      {/* Live Stream Modal */}
      {streamingCamera && streamUrl && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Live Stream</h2>
                <p className="text-gray-600">{streamingCamera.name} - {streamingCamera.classroom_name}</p>
              </div>
              <button
                onClick={closeStream}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6">
              <div className="bg-black rounded-lg overflow-hidden relative">
                <img
                  src={streamUrl}
                  alt="Live camera stream"
                  className="w-full h-auto"
                  onError={(e) => {
                    console.error('Stream image load error');
                    console.error('Stream URL was:', streamUrl);
                    e.currentTarget.style.display = 'none';
                    const errorDiv = e.currentTarget.nextElementSibling as HTMLElement;
                    if (errorDiv) errorDiv.style.display = 'flex';
                  }}
                  onLoad={() => {
                    console.log('Stream loaded successfully!');
                  }}
                />
                <div 
                  style={{ display: 'none' }}
                  className="absolute inset-0 flex items-center justify-center bg-gray-900 text-white p-8"
                >
                  <div className="text-center">
                    <svg className="w-16 h-16 mx-auto mb-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="text-xl font-bold mb-2">Stream Unavailable</h3>
                    <p className="text-gray-400 mb-4">Unable to connect to camera stream</p>
                    <div className="text-left bg-gray-800 p-4 rounded text-sm">
                      <p className="font-semibold mb-2">Troubleshooting:</p>
                      <ul className="space-y-1 text-gray-300">
                        <li>• Check Python API is running (port 5000)</li>
                        <li>• Verify camera is online and accessible</li>
                        <li>• Check browser console for errors</li>
                        <li>• Ensure mysql-connector-python is installed</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Camera:</span>
                    <span className="ml-2 font-medium">{streamingCamera.name}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Classroom:</span>
                    <span className="ml-2 font-medium">{streamingCamera.classroom_name}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">IP Address:</span>
                    <span className="ml-2 font-mono">{streamingCamera.ip_address}:{streamingCamera.port}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Status:</span>
                    <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${getStatusColor(streamingCamera.status)}`}>
                      {streamingCamera.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end gap-2">
              <button
                onClick={closeStream}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
