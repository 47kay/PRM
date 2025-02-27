import React from 'react';
import { Home, Users, Calendar, Settings } from 'lucide-react';

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick: () => void;
}

const NavItem = ({ icon, label, active = false, onClick }: NavItemProps) => {
  return (
    <div 
      onClick={onClick}
      className={`
        flex items-center px-4 py-3 mb-2 rounded-lg cursor-pointer
        ${active ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}
      `}
    >
      <div className="flex items-center">
        {icon}
        <span className="ml-3 font-medium">{label}</span>
      </div>
    </div>
  );
};

interface SidebarProps {
  currentRoute: string;
  onRouteChange: (route: string) => void;
}

const Sidebar = ({ currentRoute, onRouteChange }: SidebarProps) => {
  return (
    <div className="w-64 bg-white shadow-lg">
      <div className="flex items-center justify-between p-4 border-b">
        <h1 className="text-xl font-bold text-gray-800">Patient RM</h1>
      </div>
      
      <nav className="p-4">
        <NavItem 
          icon={<Home size={20} />} 
          label="Dashboard" 
          active={currentRoute === 'dashboard'} 
          onClick={() => onRouteChange('dashboard')}
        />
        <NavItem 
          icon={<Users size={20} />} 
          label="Contacts" 
          active={currentRoute === 'contacts'} 
          onClick={() => onRouteChange('contacts')}
        />
        <NavItem 
          icon={<Calendar size={20} />} 
          label="Appointments" 
          active={currentRoute === 'appointments'} 
          onClick={() => onRouteChange('appointments')}
        />
        <NavItem 
          icon={<Settings size={20} />} 
          label="Settings" 
          active={currentRoute === 'settings'} 
          onClick={() => onRouteChange('settings')}
        />
      </nav>
    </div>
  );
};

export default Sidebar;