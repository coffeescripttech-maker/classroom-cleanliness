'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Filter, Grid3x3, List, Pencil, Trash2, Building2 } from 'lucide-react';
import Link from 'next/link';

interface Classroom {
  id: number;
  name: string;
  section_id: number;
  section_name: string;
  grade_level: string;
  building: string;
  floor: number;
  capacity: number;
  active: boolean;
  latest_score?: number;
  latest_rating?: string;
}

export default function ClassroomsPage() {
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterGrade, setFilterGrade] = useState('all');

  useEffect(() => {
    fetchClassrooms();
  }, []);

  const fetchClassrooms = async () => {
    try {
      const response = await fetch('/api/classrooms?limit=100'); // Get more items
      const result = await response.json();
      // Handle paginated response structure
      const data = result.data || result;
      setClassrooms(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch classrooms:', error);
      setClassrooms([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this classroom?')) return;

    try {
      await fetch(`/api/classrooms/${id}`, { method: 'DELETE' });
      fetchClassrooms();
    } catch (error) {
      console.error('Failed to delete classroom:', error);
    }
  };

  const filteredClassrooms = Array.isArray(classrooms) ? classrooms.filter(classroom => {
    const matchesSearch = classroom.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         classroom.section_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGrade = filterGrade === 'all' || classroom.grade_level === filterGrade;
    return matchesSearch && matchesGrade;
  }) : [];

  const uniqueGrades = Array.isArray(classrooms) ? Array.from(new Set(classrooms.map(c => c.grade_level))).sort() : [];

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Classrooms</h1>
          <p className="text-gray-600 mt-1">Manage all classroom locations and settings</p>
        </div>
        <Link
          href="/dashboard/classrooms/create"
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Classroom
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search classrooms..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Grade Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={filterGrade}
              onChange={(e) => setFilterGrade(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Grades</option>
              {uniqueGrades.map(grade => (
                <option key={grade} value={grade}>{grade}</option>
              ))}
            </select>
          </div>

          {/* View Mode */}
          <div className="flex items-center gap-2 border border-gray-300 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              <Grid3x3 className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="text-sm text-gray-600">
        Showing {filteredClassrooms.length} of {classrooms.length} classrooms
      </div>

      {/* Classrooms Grid/List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClassrooms.map(classroom => (
            <ClassroomCard
              key={classroom.id}
              classroom={classroom}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Classroom</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Grade/Section</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Capacity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Latest Score</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredClassrooms.map(classroom => (
                <ClassroomRow
                  key={classroom.id}
                  classroom={classroom}
                  onDelete={handleDelete}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {filteredClassrooms.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No classrooms found</h3>
          <p className="text-gray-600 mb-4">
            {searchQuery || filterGrade !== 'all'
              ? 'Try adjusting your filters'
              : 'Get started by adding your first classroom'}
          </p>
          {!searchQuery && filterGrade === 'all' && (
            <Link
              href="/dashboard/classrooms/create"
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-5 h-5" />
              Add Classroom
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

function ClassroomCard({ classroom, onDelete }: { classroom: Classroom; onDelete: (id: number) => void }) {
  const getRatingColor = (rating?: string) => {
    switch (rating) {
      case 'Excellent': return 'bg-green-100 text-green-800';
      case 'Good': return 'bg-blue-100 text-blue-800';
      case 'Fair': return 'bg-yellow-100 text-yellow-800';
      case 'Poor': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">{classroom.name}</h3>
          <p className="text-sm text-gray-600">{classroom.grade_level} - {classroom.section_name}</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/dashboard/classrooms/${classroom.id}/edit`}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Pencil className="w-4 h-4" />
          </Link>
          <button
            onClick={() => onDelete(classroom.id)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Building2 className="w-4 h-4" />
          <span>{classroom.building} - Floor {classroom.floor}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span>Capacity: {classroom.capacity} students</span>
        </div>
      </div>

      {classroom.latest_score !== undefined && (
        <div className="pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Latest Score</span>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-gray-900">{classroom.latest_score}/50</span>
              <span className={`px-2 py-1 rounded text-xs font-medium ${getRatingColor(classroom.latest_rating)}`}>
                {classroom.latest_rating || 'N/A'}
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-gray-200">
        <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
          classroom.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
        }`}>
          {classroom.active ? 'Active' : 'Inactive'}
        </span>
      </div>
    </div>
  );
}

function ClassroomRow({ classroom, onDelete }: { classroom: Classroom; onDelete: (id: number) => void }) {
  const getRatingColor = (rating?: string) => {
    switch (rating) {
      case 'Excellent': return 'bg-green-100 text-green-800';
      case 'Good': return 'bg-blue-100 text-blue-800';
      case 'Fair': return 'bg-yellow-100 text-yellow-800';
      case 'Poor': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4">
        <div className="font-medium text-gray-900">{classroom.name}</div>
      </td>
      <td className="px-6 py-4 text-sm text-gray-600">
        {classroom.grade_level} - {classroom.section_name}
      </td>
      <td className="px-6 py-4 text-sm text-gray-600">
        {classroom.building}, Floor {classroom.floor}
      </td>
      <td className="px-6 py-4 text-sm text-gray-600">
        {classroom.capacity}
      </td>
      <td className="px-6 py-4">
        {classroom.latest_score !== undefined ? (
          <div className="flex items-center gap-2">
            <span className="font-medium">{classroom.latest_score}/50</span>
            <span className={`px-2 py-1 rounded text-xs font-medium ${getRatingColor(classroom.latest_rating)}`}>
              {classroom.latest_rating}
            </span>
          </div>
        ) : (
          <span className="text-sm text-gray-400">No data</span>
        )}
      </td>
      <td className="px-6 py-4">
        <span className={`inline-flex px-2 py-1 rounded text-xs font-medium ${
          classroom.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
        }`}>
          {classroom.active ? 'Active' : 'Inactive'}
        </span>
      </td>
      <td className="px-6 py-4 text-right">
        <div className="flex items-center justify-end gap-2">
          <Link
            href={`/dashboard/classrooms/${classroom.id}/edit`}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Pencil className="w-4 h-4" />
          </Link>
          <button
            onClick={() => onDelete(classroom.id)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}
