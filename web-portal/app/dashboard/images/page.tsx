'use client';

import { useState, useEffect } from 'react';
import { Upload, Search, Filter, Calendar, Image as ImageIcon, Sparkles, Download, Trash2, Eye } from 'lucide-react';
import Link from 'next/link';

interface CapturedImage {
  id: number;
  classroom_id: number;
  classroom_name: string;
  grade_level: string;
  section_name: string;
  image_path: string;
  captured_at: string;
  file_size: number;
  has_score: boolean;
  total_score?: number;
  rating?: string;
}

export default function ImagesPage() {
  const [images, setImages] = useState<CapturedImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterClassroom, setFilterClassroom] = useState('all');
  const [filterDate, setFilterDate] = useState('all');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [classrooms, setClassrooms] = useState<any[]>([]);

  useEffect(() => {
    fetchImages();
    fetchClassrooms();
  }, []);

  const fetchImages = async () => {
    try {
      const response = await fetch('/api/images?limit=100');
      const result = await response.json();
      const data = result.data || result;
      setImages(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch images:', error);
      setImages([]);
    } finally {
      setLoading(false);
    }
  };

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

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this image? This cannot be undone.')) return;
    try {
      await fetch(`/api/images/${id}`, { method: 'DELETE' });
      fetchImages();
    } catch (error) {
      console.error('Failed to delete image:', error);
    }
  };

  const filteredImages = images.filter(image => {
    const matchesSearch = image.classroom_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         image.grade_level.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesClassroom = filterClassroom === 'all' || image.classroom_id.toString() === filterClassroom;
    
    let matchesDate = true;
    if (filterDate !== 'all') {
      const imageDate = new Date(image.captured_at);
      const today = new Date();
      if (filterDate === 'today') {
        matchesDate = imageDate.toDateString() === today.toDateString();
      } else if (filterDate === 'week') {
        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        matchesDate = imageDate >= weekAgo;
      } else if (filterDate === 'month') {
        const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
        matchesDate = imageDate >= monthAgo;
      }
    }
    
    return matchesSearch && matchesClassroom && matchesDate;
  });

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Image Gallery</h1>
          <p className="text-gray-600 mt-1">View and manage captured classroom images</p>
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Upload className="w-5 h-5" />
          Upload Image
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by classroom or grade..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={filterClassroom}
              onChange={(e) => setFilterClassroom(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Classrooms</option>
              {classrooms.map(classroom => (
                <option key={classroom.id} value={classroom.id}>
                  {classroom.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-gray-400" />
            <select
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="text-sm text-gray-600">
        Showing {filteredImages.length} of {images.length} images
      </div>

      {/* Image Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredImages.map(image => (
          <ImageCard
            key={image.id}
            image={image}
            onDelete={handleDelete}
            onAnalyze={fetchImages}
          />
        ))}
      </div>

      {filteredImages.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No images found</h3>
          <p className="text-gray-600 mb-4">
            {searchQuery || filterClassroom !== 'all' || filterDate !== 'all'
              ? 'Try adjusting your filters'
              : 'Upload your first classroom image to get started'}
          </p>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <UploadModal
          classrooms={classrooms}
          onClose={() => setShowUploadModal(false)}
          onSuccess={() => {
            setShowUploadModal(false);
            fetchImages();
          }}
        />
      )}
    </div>
  );
}


function ImageCard({ image, onDelete, onAnalyze }: { 
  image: CapturedImage; 
  onDelete: (id: number) => void;
  onAnalyze: () => void;
}) {
  const [analyzing, setAnalyzing] = useState(false);

  const handleAnalyze = async () => {
    setAnalyzing(true);
    try {
      const response = await fetch('/api/images/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image_id: image.id })
      });
      
      if (response.ok) {
        onAnalyze();
      } else {
        alert('Failed to analyze image');
      }
    } catch (error) {
      console.error('Failed to analyze:', error);
      alert('Failed to analyze image');
    } finally {
      setAnalyzing(false);
    }
  };

  const getRatingColor = (rating?: string) => {
    switch (rating) {
      case 'Excellent': return 'bg-green-100 text-green-800';
      case 'Good': return 'bg-blue-100 text-blue-800';
      case 'Fair': return 'bg-yellow-100 text-yellow-800';
      case 'Poor': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      {/* Image */}
      <div className="relative aspect-video bg-gray-100">
        <img
          src={`/uploads/${image.image_path}`}
          alt={image.classroom_name}
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/placeholder-image.png';
          }}
        />
        {image.has_score && (
          <div className="absolute top-2 right-2">
            <span className={`px-2 py-1 rounded text-xs font-medium ${getRatingColor(image.rating)}`}>
              {image.rating}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        <div>
          <h3 className="font-semibold text-gray-900">{image.classroom_name}</h3>
          <p className="text-sm text-gray-600">{image.grade_level} - {image.section_name}</p>
          <p className="text-xs text-gray-500 mt-1">{formatDate(image.captured_at)}</p>
        </div>

        {image.has_score && (
          <div className="pt-3 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Score</span>
              <span className="text-lg font-bold text-gray-900">{image.total_score}/50</span>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 pt-3 border-t border-gray-200">
          <Link
            href={`/dashboard/images/${image.id}`}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm"
          >
            <Eye className="w-4 h-4" />
            View
          </Link>
          
          {!image.has_score && (
            <button
              onClick={handleAnalyze}
              disabled={analyzing}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm"
            >
              <Sparkles className="w-4 h-4" />
              {analyzing ? 'Analyzing...' : 'Analyze'}
            </button>
          )}
          
          <button
            onClick={() => onDelete(image.id)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function UploadModal({ classrooms, onClose, onSuccess }: {
  classrooms: any[];
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [classroomId, setClassroomId] = useState('');
  const [preview, setPreview] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !classroomId) {
      alert('Please select a file and classroom');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('image', selectedFile);
    formData.append('classroom_id', classroomId);

    try {
      const response = await fetch('/api/images/upload', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        onSuccess();
      } else {
        alert('Failed to upload image');
      }
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-xl font-semibold">Upload Classroom Image</h3>
        </div>
        
        <div className="p-6 space-y-4">
          {/* Classroom Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Classroom *
            </label>
            <select
              value={classroomId}
              onChange={(e) => setClassroomId(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Choose a classroom</option>
              {classrooms.map(classroom => (
                <option key={classroom.id} value={classroom.id}>
                  {classroom.name} - {classroom.grade_level} {classroom.section_name}
                </option>
              ))}
            </select>
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Image *
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Preview */}
          {preview && (
            <div className="border border-gray-300 rounded-lg p-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
              <img
                src={preview}
                alt="Preview"
                className="w-full h-64 object-contain bg-gray-50 rounded"
              />
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-200 flex items-center gap-3">
          <button
            onClick={handleUpload}
            disabled={uploading || !selectedFile || !classroomId}
            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {uploading ? 'Uploading...' : 'Upload'}
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
