'use client';

import Link from 'next/link';
import { GraduationCap, Users, Bell, Database, Shield, Palette } from 'lucide-react';

const settingsCategories = [
  {
    name: 'Grades & Sections',
    description: 'Manage grade levels and sections',
    icon: GraduationCap,
    href: '/dashboard/settings/grades-sections',
    color: 'bg-blue-100 text-blue-600'
  },
  {
    name: 'Users & Permissions',
    description: 'Manage admin users and roles',
    icon: Users,
    href: '/dashboard/settings/users',
    color: 'bg-purple-100 text-purple-600'
  },
  {
    name: 'Alarm Settings',
    description: 'Configure alarm sounds and timing',
    icon: Bell,
    href: '/dashboard/settings/alarms',
    color: 'bg-yellow-100 text-yellow-600'
  },
  {
    name: 'System Settings',
    description: 'General system configuration',
    icon: Database,
    href: '/dashboard/settings/system',
    color: 'bg-green-100 text-green-600'
  },
  {
    name: 'Security',
    description: 'Security and authentication settings',
    icon: Shield,
    href: '/dashboard/settings/security',
    color: 'bg-red-100 text-red-600'
  },
  {
    name: 'Appearance',
    description: 'Customize the look and feel',
    icon: Palette,
    href: '/dashboard/settings/appearance',
    color: 'bg-pink-100 text-pink-600'
  }
];

export default function SettingsPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">Manage your system configuration and preferences</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {settingsCategories.map((category) => {
          const Icon = category.icon;
          return (
            <Link
              key={category.name}
              href={category.href}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className={`w-12 h-12 rounded-lg ${category.color} flex items-center justify-center mb-4`}>
                <Icon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{category.name}</h3>
              <p className="text-sm text-gray-600">{category.description}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
