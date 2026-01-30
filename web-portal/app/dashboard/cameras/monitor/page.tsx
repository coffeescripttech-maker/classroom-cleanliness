'use client';

import { useState, useEffect } from 'react';
import { Maximize2, Minimize2, RefreshCw } from 'lucide-react';

interface Camera {
  id: number;
  name: string;
  classroom_name: string;
  grade_level: string;
  section_name: string;
  status: string;
}

export default function CameraMonitorPage() {
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [loading, setLoading] = useState(true);
  const [fullscreenCamera, setFullscreenCamera] = useState<number | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    fetchCameras();
  }, []);

  const fetchCameras = async () => {
    try {
      const response = await fetch('/api/cameras');
      const data = await response.json();
      
      console.log('API Response:', data); // Debug log
      
      // Handle different response formats
      let cameraList: Camera[] = [];
      if (Array.isArray(data)) {
        cameraList = data;
      } else if (data.data && Array.isArray(data.data)) {
        cameraList = data.data;
      }
      
      // Only show active cameras
      const activeCameras = cameraList.filter((cam: Camera) => cam.status === 'active');
      console.log('Active cameras:', activeCameras); // Debug log
      setCameras(activeCameras);
    } catch (error) {
      console.error('Failed to fetch cameras:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  const toggleFullscreen = (cameraId: number) => {
    if (fullscreenCamera === cameraId) {
      setFullscreenCamera(null);
    } else {
      setFullscreenCamera(cameraId);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading cameras...</p>
        </div>
      </div>
    );
  }

  if (cameras.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-gray-600">No active cameras found</p>
          <a href="/dashboard/cameras" className="mt-4 inline-block text-blue-600 hover:underline">
            Go to Camera Management
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Live Camera Monitor</h1>
            <p className="text-gray-400 text-sm mt-1">
              {cameras.length} Active Camera{cameras.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh All
            </button>
            <a
              href="/dashboard/cameras"
              className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition"
            >
              Back to Cameras
            </a>
          </div>
        </div>
      </div>

      {/* Camera Grid */}
      <div className="flex-1 p-4 overflow-auto">
        {fullscreenCamera ? (
          // Fullscreen single camera
          <div className="h-full">
            {cameras.filter(cam => cam.id === fullscreenCamera).map(camera => (
              <div key={camera.id} className="h-full bg-black rounded-lg overflow-hidden relative">
                <img
                  src={`/api/cameras/${camera.id}/stream?t=${refreshKey}`}
                  alt={camera.name}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    const target = e.currentTarget;
                    target.style.display = 'none';
                    const parent = target.parentElement;
                    if (parent && !parent.querySelector('.error-message')) {
                      const errorDiv = document.createElement('div');
                      errorDiv.className = 'error-message flex items-center justify-center h-full bg-gray-800';
                      errorDiv.innerHTML = `
                        <div class="text-center text-gray-400">
                          <svg class="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                          <p class="text-sm">Camera Offline</p>
                          <p class="text-xs mt-1">Stream unavailable</p>
                        </div>
                      `;
                      parent.appendChild(errorDiv);
                    }
                  }}
                />
                <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/70 to-transparent p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-white font-semibold text-lg">{camera.name}</h3>
                      <p className="text-gray-300 text-sm">
                        {camera.classroom_name} - {camera.grade_level} {camera.section_name}
                      </p>
                    </div>
                    <button
                      onClick={() => toggleFullscreen(camera.id)}
                      className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition"
                    >
                      <Minimize2 className="w-5 h-5 text-white" />
                    </button>
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-white text-sm">
                      <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                      LIVE
                    </span>
                    <span className="text-gray-300 text-sm">
                      {new Date().toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          // Grid view (2x2 or responsive)
          <div className={`grid gap-4 h-full ${
            cameras.length === 1 ? 'grid-cols-1' :
            cameras.length === 2 ? 'grid-cols-2' :
            cameras.length === 3 ? 'grid-cols-2' :
            'grid-cols-2 grid-rows-2'
          }`}>
            {cameras.map((camera) => (
              <div
                key={camera.id}
                className="bg-black rounded-lg overflow-hidden relative group cursor-pointer"
                onClick={() => toggleFullscreen(camera.id)}
              >
                <img
                  src={`/api/cameras/${camera.id}/stream?t=${refreshKey}`}
                  alt={camera.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.currentTarget;
                    target.style.display = 'none';
                    const parent = target.parentElement;
                    if (parent && !parent.querySelector('.error-message')) {
                      const errorDiv = document.createElement('div');
                      errorDiv.className = 'error-message flex items-center justify-center h-full bg-gray-800';
                      errorDiv.innerHTML = `
                        <div class="text-center text-gray-400">
                          <svg class="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                          <p class="text-xs">Camera Offline</p>
                        </div>
                      `;
                      parent.appendChild(errorDiv);
                    }
                  }}
                />
                
                {/* Camera Info Overlay */}
                <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/70 to-transparent p-3">
                  <h3 className="text-white font-semibold">{camera.name}</h3>
                  <p className="text-gray-300 text-sm">
                    {camera.classroom_name}
                  </p>
                </div>

                {/* Live Indicator */}
                <div className="absolute top-3 right-3">
                  <span className="flex items-center gap-1 px-2 py-1 bg-red-600 rounded text-white text-xs font-semibold">
                    <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                    LIVE
                  </span>
                </div>

                {/* Bottom Info */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300 text-xs">
                      {camera.grade_level} - {camera.section_name}
                    </span>
                    <span className="text-gray-400 text-xs">
                      {new Date().toLocaleTimeString()}
                    </span>
                  </div>
                </div>

                {/* Fullscreen Button (shows on hover) */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button className="p-3 bg-white/20 hover:bg-white/30 rounded-full transition">
                    <Maximize2 className="w-6 h-6 text-white" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
