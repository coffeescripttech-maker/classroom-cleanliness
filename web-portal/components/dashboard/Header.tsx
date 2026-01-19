'use client';

import React, { useState, useEffect } from 'react';
import { Bell, Search, User, Menu, LogOut, ChevronDown } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface UserInfo {
  id: number;
  username: string;
  role: string;
  full_name: string;
  classroom_id: number | null;
}

export default function Header() {
  const router = useRouter();
  const [user, setUser] = useState<UserInfo | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      }
    } catch (error) {
      console.error('Failed to fetch user:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
      router.refresh();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const getRoleBadge = (role: string) => {
    const badges = {
      admin: 'bg-purple-100 text-purple-800',
      class_president: 'bg-blue-100 text-blue-800',
      student: 'bg-green-100 text-green-800',
    };
    return badges[role as keyof typeof badges] || 'bg-gray-100 text-gray-800';
  };

  const getRoleLabel = (role: string) => {
    const labels = {
      admin: 'Administrator',
      class_president: 'Class President',
      student: 'Student',
    };
    return labels[role as keyof typeof labels] || role;
  };
  return (
    <header className="bg-white shadow-sm z-10">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Mobile menu button */}
        <button className="md:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100">
          <Menu className="h-6 w-6" />
        </button>

        {/* Search */}
        <div className="flex-1 flex justify-center px-2 lg:ml-6 lg:justify-start">
          <div className="max-w-lg w-full lg:max-w-xs">
            <label htmlFor="search" className="sr-only">
              Search
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="search"
                name="search"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Search classrooms..."
                type="search"
              />
            </div>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <button className="p-2 rounded-full text-gray-400 hover:text-gray-500 hover:bg-gray-100 relative">
            <Bell className="h-6 w-6" />
            <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-red-500"></span>
          </button>

          {/* Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100"
            >
              <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
                <User className="h-5 w-5 text-white" />
              </div>
              {!loading && user && (
                <>
                  <div className="hidden md:block text-left">
                    <div className="text-sm font-medium text-gray-700">
                      {user.full_name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {getRoleLabel(user.role)}
                    </div>
                  </div>
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                </>
              )}
            </button>

            {/* Dropdown Menu */}
            {showDropdown && user && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                <div className="px-4 py-3 border-b border-gray-200">
                  <p className="text-sm font-medium text-gray-900">{user.full_name}</p>
                  <p className="text-xs text-gray-500 mt-1">@{user.username}</p>
                  <span className={`inline-block mt-2 px-2 py-1 text-xs font-medium rounded ${getRoleBadge(user.role)}`}>
                    {getRoleLabel(user.role)}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
