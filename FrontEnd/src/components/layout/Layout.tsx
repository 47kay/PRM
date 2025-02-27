import { useState } from 'react';
import { 
  Home, 
  Users, 
  MessageSquare, 
  Ticket, 
  Calendar, 
  Settings as SettingsIcon 
} from 'lucide-react';
import '../../styles/layout.scss';

interface LayoutProps {
  children: React.ReactNode;
  currentRoute: string;
  onRouteChange: (route: string) => void;
}

const Layout = ({ children, currentRoute, onRouteChange }: LayoutProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const navigationItems = [
    { route: 'dashboard', label: 'Dashboard', icon: <Home size={20} /> },
    { route: 'contacts', label: 'Contacts', icon: <Users size={20} /> },
    { route: 'appointments', label: 'Appointments', icon: <Calendar size={20} /> },
    { route: 'tickets', label: 'Tickets', icon: <Ticket size={20} /> },
    { route: 'messages', label: 'Messages', icon: <MessageSquare size={20} /> },
    { route: 'settings', label: 'Settings', icon: <SettingsIcon size={20} /> }
  ] as const;

  const getActionButtonText = (route: string): string => {
    switch (route) {
      case 'contacts':
        return 'New Contact';
      case 'appointments':
        return 'New Appointment';
      case 'tickets':
        return 'New Ticket';
      case 'messages':
        return 'New Message';
      default:
        return 'New Item';
    }
  };

  return (
    <div className="app-layout">
      <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar__header">
          <button 
            className="sidebar__toggle-button" 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            {isSidebarOpen ? 'Close Sidebar' : 'Open Sidebar'}
          </button>
          <h1 className="sidebar__header-logo">Patient RM</h1>
        </div>
        <nav className="sidebar__nav">
          {navigationItems.map((item) => (
            <button
              key={item.route}
              onClick={() => onRouteChange(item.route)}
              className={`sidebar__nav-item ${currentRoute === item.route ? 'active' : ''}`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      <main className="main-content">
        <header className="header">
          <h2 className="header__title">
            {currentRoute.charAt(0).toUpperCase() + currentRoute.slice(1)}
          </h2>
          <div className="header__actions">
            <button className="action-button">
              {getActionButtonText(currentRoute)}
            </button>
            <div className="user-avatar"></div>
          </div>
        </header>

        <div className="content">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;