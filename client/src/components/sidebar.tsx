import { Link, useLocation } from "wouter";
import { 
  ChartPie, 
  HelpCircle, 
  BookOpen, 
  BarChart3, 
  Tags,
  Settings,
  Download,
  HelpCircle as LifeRing,
  User,
  LogOut,
  GraduationCap
} from "lucide-react";

const Sidebar = () => {
  const [location] = useLocation();

  const isActive = (path: string) => {
    if (path === "/" && location === "/") return true;
    if (path !== "/" && location.startsWith(path)) return true;
    return false;
  };

  const navigationItems = [
    { id: 'dashboard', icon: ChartPie, label: 'Dashboard', path: '/dashboard', count: null },
    { id: 'questions', icon: HelpCircle, label: 'Questions', path: '/questions', count: 1247 },
    { id: 'passages', icon: BookOpen, label: 'Passages', path: '/passages', count: 156 },
    { id: 'analytics', icon: BarChart3, label: 'Analytics', path: '/analytics', count: null },
    { id: 'categories', icon: Tags, label: 'Categories', path: '/categories', count: null }
  ];

  const systemItems = [
    { id: 'settings', icon: Settings, label: 'Settings', path: '/settings' },
    { id: 'export', icon: Download, label: 'Export Data', path: '/export' },
    { id: 'help', icon: LifeRing, label: 'Help & Support', path: '/help' }
  ];

  return (
    <div className="w-64 bg-secondary-900 text-white flex-shrink-0 relative">
      {/* Logo and Brand */}
      <div className="p-6 border-b border-secondary-700">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
            <GraduationCap className="text-xl" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-primary-300">Qudrat Admin</h1>
            <p className="text-secondary-400 text-sm">Question Management</p>
          </div>
        </div>
      </div>
      
      {/* Navigation Menu */}
      <nav className="mt-6 flex-1">
        <div className="px-3 space-y-1">
          {navigationItems.map(({ id, icon: Icon, label, path, count }) => (
            <Link key={id} href={path}>
              <a
                className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  isActive(path)
                    ? 'bg-primary-600 text-white border-r-4 border-primary-300'
                    : 'text-secondary-300 hover:bg-secondary-800 hover:text-white'
                }`}
              >
                <Icon className="mr-3 h-5 w-5" />
                {label}
                {count && (
                  <span className="ml-auto bg-secondary-700 text-secondary-300 px-2 py-0.5 text-xs rounded-full">
                    {count.toLocaleString()}
                  </span>
                )}
              </a>
            </Link>
          ))}
        </div>
        
        {/* Secondary Menu */}
        <div className="mt-8 px-3">
          <h3 className="px-3 text-xs font-semibold text-secondary-400 uppercase tracking-wider">
            System
          </h3>
          <div className="mt-1 space-y-1">
            {systemItems.map(({ id, icon: Icon, label, path }) => (
              <Link key={id} href={path}>
                <a className="text-secondary-300 hover:bg-secondary-800 hover:text-white group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors">
                  <Icon className="mr-3 h-5 w-5" />
                  {label}
                </a>
              </Link>
            ))}
          </div>
        </div>
      </nav>
      
      {/* User Profile */}
      <div className="absolute bottom-0 w-full p-4 border-t border-secondary-700">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
            <User className="text-sm" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">Admin User</p>
            <p className="text-xs text-secondary-400 truncate">Administrator</p>
          </div>
          <button className="text-secondary-400 hover:text-white transition-colors">
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
