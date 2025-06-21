import React from 'react';
import { Home, FileText, BookOpen } from 'lucide-react';

const Sidebar = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    { id: 'dashboard', icon: Home, label: 'Dashboard' },
    { id: 'questions', icon: FileText, label: 'Questions' },
    { id: 'passages', icon: BookOpen, label: 'Passages' }
  ];

  return (
    <div className="w-64 bg-white shadow-lg h-screen fixed left-0 top-0">
      <div className="p-6 border-b">
        <h1 className="text-xl font-bold text-gray-800">Qudrat Admin</h1>
        <p className="text-sm text-gray-600">Simple & Clean</p>
      </div>
      
      <nav className="mt-6">
        {menuItems.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`w-full flex items-center px-6 py-3 text-left hover:bg-gray-100 transition-colors ${
              activeTab === id ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600' : 'text-gray-700'
            }`}
          >
            <Icon size={18} className="mr-3" />
            {label}
          </button>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;