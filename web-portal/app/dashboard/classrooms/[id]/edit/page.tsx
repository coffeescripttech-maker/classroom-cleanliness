'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';

interface GradeLevel {
  id: number;
  name: string;
  level: number;
}

interface Section {
  id: number;
  grade_level_id: number;
  name: string;
}

export default function EditClassroomPage() {
  const router = useRouter();
  const params = useParams();
  const classroomId = params.id;
  
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [gradeLevels, setGradeLevels] = useState<GradeLevel[]>([]);
  const [sections, setSections] = useState<Section[]>([]);

  const [formData, setFormData] = useState({
    name: '',
    section_id: '',
    building: '',
    floor: 1,
    capacity: 40,
    active: true
  });

  useEffect(() => {
    fetchClassroom();
    fetchGradeLevels();
    fetchSections();
  }, [classroomId]);

  const fetchClassroom = async () => {
    try {
      const response = await fetch(`/api/classrooms/${classroomId}`);
      const result = await response.json();
      // Handle API response structure { success, data }
      const data = result.data || result;
      setFormData({
        name: data.name || '',
        section_id: data.section_id?.toString() || '',
        building: data.building || '',
        floor: data.floor || 1,
        capacity: data.capacity || 40,
        active: data.active !== undefined ? data.active : true
      });
    } catch (error) {
      console.error('Failed to fetch classroom:', error);
      alert('Failed to load classroom data');
    } finally {
      setFetching(false);
    }
  };

  const fetchGradeLevels = async () => {
    try {
      const response = await fetch('/api/grade-levels');
      const data = await response.json();
      setGradeLevels(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch grade levels:', error);
      setGradeLevels([]);
    }
  };

  const fetchSections = async () => {
    try {
      const response = await fetch('/api/sections');
      const data = await response.json();
      setSections(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch sections:', error);
      setSections([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`/api/classrooms/${classroomId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          section_id: parseInt(formData.section_id),
          active: formData.active ? 1 : 0
        })
      });

      const result = await response.json();

      if (response.ok && result.success) {
        router.push('/dashboard/classrooms');
      } else {
        alert(result.error || 'Failed to update classroom');
      }
    } catch (error) {
      console.error('Failed to update classroom:', error);
      alert('Failed to update classroom');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <Link
          href="/dashboard/classrooms"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Classrooms
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Edit Classroom</h1>
        <p className="text-gray-600 mt-1">Update classroom information</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Classroom Name *
          </label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Section *
          </label>
          <select
            required
            value={formData.section_id}
            onChange={(e) => setFormData({ ...formData, section_id: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select a section</option>
            {sections.map(section => {
              const gradeLevel = gradeLevels.find(g => g.id === section.grade_level_id);
              return (
                <option key={section.id} value={section.id}>
                  {gradeLevel?.name} - {section.name}
                </option>
              );
            })}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Building *
          </label>
          <input
            type="text"
            required
            value={formData.building}
            onChange={(e) => setFormData({ ...formData, building: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Floor *
            </label>
            <input
              type="number"
              required
              min="1"
              value={formData.floor}
              onChange={(e) => setFormData({ ...formData, floor: parseInt(e.target.value) })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Capacity *
            </label>
            <input
              type="number"
              required
              min="1"
              value={formData.capacity}
              onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="active"
            checked={formData.active}
            onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="active" className="text-sm font-medium text-gray-700">
            Active (classroom is in use)
          </label>
        </div>

        <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Save className="w-5 h-5" />
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
          <Link
            href="/dashboard/classrooms"
            className="px-6 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
