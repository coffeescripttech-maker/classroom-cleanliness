'use client';

import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, GraduationCap, Users } from 'lucide-react';

interface GradeLevel {
  id: number;
  name: string;
  level: number;
  school_id: number;
}

interface Section {
  id: number;
  grade_level_id: number;
  name: string;
  room_number?: string;
  grade_level_name?: string;
}

export default function GradesSectionsPage() {
  const [gradeLevels, setGradeLevels] = useState<GradeLevel[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modals
  const [showGradeModal, setShowGradeModal] = useState(false);
  const [showSectionModal, setShowSectionModal] = useState(false);
  const [editingGrade, setEditingGrade] = useState<GradeLevel | null>(null);
  const [editingSection, setEditingSection] = useState<Section | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [gradesRes, sectionsRes] = await Promise.all([
        fetch('/api/grade-levels'),
        fetch('/api/sections')
      ]);
      const grades = await gradesRes.json();
      const sects = await sectionsRes.json();
      setGradeLevels(Array.isArray(grades) ? grades : []);
      setSections(Array.isArray(sects) ? sects : []);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteGrade = async (id: number) => {
    if (!confirm('Delete this grade level? All sections and classrooms will be affected.')) return;
    try {
      await fetch(`/api/grade-levels/${id}`, { method: 'DELETE' });
      fetchData();
    } catch (error) {
      console.error('Failed to delete grade:', error);
    }
  };

  const handleDeleteSection = async (id: number) => {
    if (!confirm('Delete this section? All classrooms will be affected.')) return;
    try {
      await fetch(`/api/sections/${id}`, { method: 'DELETE' });
      fetchData();
    } catch (error) {
      console.error('Failed to delete section:', error);
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Grade Levels & Sections</h1>
        <p className="text-gray-600 mt-1">Manage grade levels and their sections</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Grade Levels */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-semibold">Grade Levels</h2>
            </div>
            <button
              onClick={() => {
                setEditingGrade(null);
                setShowGradeModal(true);
              }}
              className="flex items-center gap-2 bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 text-sm"
            >
              <Plus className="w-4 h-4" />
              Add Grade
            </button>
          </div>
          <div className="p-4 space-y-2">
            {gradeLevels.map(grade => (
              <div key={grade.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100">
                <div>
                  <div className="font-medium text-gray-900">{grade.name}</div>
                  <div className="text-sm text-gray-600">Level {grade.level}</div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setEditingGrade(grade);
                      setShowGradeModal(true);
                    }}
                    className="p-2 text-gray-600 hover:bg-white rounded-lg"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteGrade(grade.id)}
                    className="p-2 text-red-600 hover:bg-white rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
            {gradeLevels.length === 0 && (
              <div className="text-center py-8 text-gray-500">No grade levels yet</div>
            )}
          </div>
        </div>

        {/* Sections */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-green-600" />
              <h2 className="text-lg font-semibold">Sections</h2>
            </div>
            <button
              onClick={() => {
                setEditingSection(null);
                setShowSectionModal(true);
              }}
              className="flex items-center gap-2 bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700 text-sm"
            >
              <Plus className="w-4 h-4" />
              Add Section
            </button>
          </div>
          <div className="p-4 space-y-2 max-h-[600px] overflow-y-auto">
            {sections.map(section => {
              const grade = gradeLevels.find(g => g.id === section.grade_level_id);
              return (
                <div key={section.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100">
                  <div>
                    <div className="font-medium text-gray-900">{section.name}</div>
                    <div className="text-sm text-gray-600">{grade?.name || 'Unknown Grade'}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setEditingSection(section);
                        setShowSectionModal(true);
                      }}
                      className="p-2 text-gray-600 hover:bg-white rounded-lg"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteSection(section.id)}
                      className="p-2 text-red-600 hover:bg-white rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
            {sections.length === 0 && (
              <div className="text-center py-8 text-gray-500">No sections yet</div>
            )}
          </div>
        </div>
      </div>

      {/* Grade Modal */}
      {showGradeModal && (
        <GradeModal
          grade={editingGrade}
          onClose={() => {
            setShowGradeModal(false);
            setEditingGrade(null);
          }}
          onSave={() => {
            setShowGradeModal(false);
            setEditingGrade(null);
            fetchData();
          }}
        />
      )}

      {/* Section Modal */}
      {showSectionModal && (
        <SectionModal
          section={editingSection}
          gradeLevels={gradeLevels}
          onClose={() => {
            setShowSectionModal(false);
            setEditingSection(null);
          }}
          onSave={() => {
            setShowSectionModal(false);
            setEditingSection(null);
            fetchData();
          }}
        />
      )}
    </div>
  );
}

function GradeModal({ grade, onClose, onSave }: { grade: GradeLevel | null; onClose: () => void; onSave: () => void }) {
  const [formData, setFormData] = useState({
    name: grade?.name || '',
    level: grade?.level || 7,
    school_id: grade?.school_id || 1
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = grade ? `/api/grade-levels/${grade.id}` : '/api/grade-levels';
      const method = grade ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        onSave();
      } else {
        alert('Failed to save grade level');
      }
    } catch (error) {
      console.error('Failed to save grade:', error);
      alert('Failed to save grade level');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-xl font-semibold">{grade ? 'Edit' : 'Add'} Grade Level</h3>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Grade Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Grade 7"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Level Number *
            </label>
            <input
              type="number"
              required
              min="1"
              max="12"
              value={formData.level}
              onChange={(e) => setFormData({ ...formData, level: parseInt(e.target.value) })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function SectionModal({ section, gradeLevels, onClose, onSave }: { 
  section: Section | null; 
  gradeLevels: GradeLevel[];
  onClose: () => void; 
  onSave: () => void;
}) {
  const [formData, setFormData] = useState({
    name: section?.name || '',
    grade_level_id: section?.grade_level_id?.toString() || '',
    room_number: section?.room_number || ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = section ? `/api/sections/${section.id}` : '/api/sections';
      const method = section ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          grade_level_id: parseInt(formData.grade_level_id)
        })
      });

      if (response.ok) {
        onSave();
      } else {
        alert('Failed to save section');
      }
    } catch (error) {
      console.error('Failed to save section:', error);
      alert('Failed to save section');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-xl font-semibold">{section ? 'Edit' : 'Add'} Section</h3>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Section Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Section A"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Grade Level *
            </label>
            <select
              required
              value={formData.grade_level_id}
              onChange={(e) => setFormData({ ...formData, grade_level_id: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">Select grade level</option>
              {gradeLevels.map(grade => (
                <option key={grade.id} value={grade.id}>
                  {grade.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Room Number (Optional)
            </label>
            <input
              type="text"
              value={formData.room_number}
              onChange={(e) => setFormData({ ...formData, room_number: e.target.value })}
              placeholder="e.g., 101"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
