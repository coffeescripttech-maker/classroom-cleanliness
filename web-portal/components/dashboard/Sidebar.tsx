'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Building2,
  Calendar,
  Camera,
  Image as ImageIcon,
  Trophy,
  BarChart3,
  Settings,
  LogOut,
} from 'lucide-react';

interface UserInfo {
  id: number;
  username: string;
  role: string;
  full_name: string;
  classroom_id: number | null;
}

interface NavItem {
  name: string;
  href: string;
  icon: any;
  roles: string[]; // Which roles can see this item
}

const navigation: NavItem[] = [
  { 
    name: 'Dashboard', 
    href: '/dashboard', 
    icon: LayoutDashboard,
    roles: ['admin', 'class_president', 'student']
  },
  { 
    name: 'Classrooms', 
    href: '/dashboard/classrooms', 
    icon: Building2,
    roles: ['admin', 'class_president'] // Students cannot access
  },
  { 
    name: 'Schedules', 
    href: '/dashboard/schedules', 
    icon: Calendar,
    roles: ['admin'] // Only admin can manage schedules
  },
  { 
    name: 'Cameras', 
    href: '/dashboard/cameras', 
    icon: Camera,
    roles: ['admin'] // Only admin can manage cameras
  },
  { 
    name: 'Images', 
    href: '/dashboard/images', 
    icon: ImageIcon,
    roles: ['admin', 'class_president'] // Students cannot view images
  },
  { 
    name: 'Leaderboard', 
    href: '/dashboard/leaderboard', 
    icon: Trophy,
    roles: ['admin', 'class_president', 'student'] // Everyone can see
  },
  { 
    name: 'Reports', 
    href: '/dashboard/reports', 
    icon: BarChart3,
    roles: ['admin', 'class_president'] // Students cannot view reports
  },
  { 
    name: 'Settings', 
    href: '/dashboard/settings', 
    icon: Settings,
    roles: ['admin'] // Only admin can access settings
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<UserInfo | null>(null);
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

  // Filter navigation based on user role
  const visibleNavigation = navigation.filter(item => {
    if (!user) return false;
    return item.roles.includes(user.role);
  });

  return (
    <div className="hidden md:flex md:flex-shrink-0">
      <div className="flex flex-col w-64">
        <div className="flex flex-col flex-grow bg-blue-700 pt-5 pb-4 overflow-y-auto">
          {/* Logo */}
          <div className="flex items-center flex-shrink-0 px-4 mb-5">
            <Building2 className="w-8 h-8 text-white" />
            <span className="ml-2 text-xl font-bold text-white">
              Cleanliness
            </span>
          </div>

          {/* User Info */}
          {!loading && user && (
            <div className="px-4 mb-4">
              <div className="bg-blue-800 rounded-lg p-3">
                <p className="text-sm font-medium text-white">{user.full_name}</p>
                <p className="text-xs text-blue-200 mt-1">
                  {user.role === 'admin' && '👑 Administrator'}
                  {user.role === 'class_president' && '⭐ Class President'}
                  {user.role === 'student' && '👤 Student'}
                </p>
              </div>
            </div>
          )}

          {/* Navigation */}
          <nav className="mt-5 flex-1 px-2 space-y-1">
            {visibleNavigation.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    group flex items-center px-2 py-2 text-sm font-medium rounded-md
                    ${isActive
                      ? 'bg-blue-800 text-white'
                      : 'text-blue-100 hover:bg-blue-600 hover:text-white'
                    }
                  `}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Logout */}
          <div className="flex-shrink-0 px-2">
            <button 
              onClick={handleLogout}
              className="group flex items-center w-full px-2 py-2 text-sm font-medium text-blue-100 rounded-md hover:bg-blue-600 hover:text-white"
            >
              <LogOut className="mr-3 h-5 w-5" />
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
