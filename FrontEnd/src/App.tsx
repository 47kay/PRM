import { useState, Dispatch, SetStateAction } from 'react';
import { 
  Home, 
  Users, 
  MessageSquare, 
  Ticket, 
  Calendar, 
  Settings as SettingsIcon,
  Phone,
} from 'lucide-react';

import './styles/pages.scss';

// Import pages
import Dashboard from './pages/Dashboard';
import Contacts from './pages/Contacts';
import Appointments from './pages/Appointments';
import Tickets from './pages/Tickets';
import Messages from './pages/Messages';
import Settings from './pages/Settings';
import VoIP from './pages/VoIP'; // Import the new VoIP page

// Import VoIP components for global access
import { IncomingCallModal } from './components/voip/IncomingCallModal';
import { CallControls } from './components/voip/CallControls';
import { useVoipStore } from './services/voipService';

interface LayoutProps {
  children: React.ReactNode;
  currentRoute: Route;
  onRouteChange: Dispatch<SetStateAction<Route>>;
}

// Update the Route type to include 'voip'
type Route = 'dashboard' | 'contacts' | 'appointments' | 'tickets' | 'messages' | 'settings' | 'voip';

const App = () => {
  const [currentRoute, setCurrentRoute] = useState<Route>('dashboard');
  const { currentCall } = useVoipStore();

  return (
    <Layout currentRoute={currentRoute} onRouteChange={setCurrentRoute}>
      {renderContent(currentRoute)}
      
      {/* The VoIP components that should be accessible globally */}
      <IncomingCallModal />
      {currentCall && <CallControls />}
    </Layout>
  );
};

// Render the appropriate component based on the current route
const renderContent = (route: Route) => {
  switch (route) {
    case 'dashboard':
      return <Dashboard />;
    case 'contacts':
      return <Contacts />;
    case 'appointments':
      return <Appointments />;
    case 'tickets':
      return <Tickets />;
    case 'messages':
      return <Messages />;
    case 'settings':
      return <Settings />;
    case 'voip':
      return <VoIP />;
    default:
      return <Dashboard />;
  }
};

// Layout Component
const Layout = ({ children, currentRoute, onRouteChange }: LayoutProps) => {
  const { isRegistered, currentCall } = useVoipStore();

  const navigationItems = [
    { route: 'dashboard', label: 'Dashboard', icon: <Home size={20} /> },
    { route: 'contacts', label: 'Contacts', icon: <Users size={20} /> },
    { route: 'appointments', label: 'Appointments', icon: <Calendar size={20} /> },
    { route: 'tickets', label: 'Tickets', icon: <Ticket size={20} /> },
    { route: 'messages', label: 'Messages', icon: <MessageSquare size={20} /> },
    { route: 'voip', label: 'Voice', icon: <Phone size={20} /> }, // Add VoIP navigation
    { route: 'settings', label: 'Settings', icon: <SettingsIcon size={20} /> }
  ] as const;

  return (
    <div className="flex h-full w-full">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg min-h-screen fixed">
        <div className="flex items-center justify-between p-4 border-b">
          <h1 className="text-xl font-bold text-gray-800">Patient RM</h1>
        </div>
        <nav className="p-4">
          {navigationItems.map((item) => (
            <button
              key={item.route}
              onClick={() => onRouteChange(item.route)}
              className={`
                w-full flex items-center px-3 py-2 rounded-lg text-sm mb-1
                ${currentRoute === item.route 
                  ? 'bg-blue-50 text-blue-600' 
                  : 'text-gray-600 hover:bg-gray-50'}
              `}
            >
              <span className="mr-3">{item.icon}</span>
              {item.label}
              
              {/* Show VoIP status indicators */}
              {item.route === 'voip' && (
                <>
                  {isRegistered && (
                    <span className="ml-auto h-2 w-2 rounded-full bg-green-600"></span>
                  )}
                  {currentCall && (
                    <span className="ml-1 h-2 w-2 rounded-full bg-red-600 animate-pulse"></span>
                  )}
                </>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 ml-64">
        <header className="bg-white shadow-sm sticky top-0 z-10">
          <div className="flex items-center justify-between px-6 py-4">
            <h2 className="text-2xl font-semibold text-gray-800">
              {currentRoute.charAt(0).toUpperCase() + currentRoute.slice(1)}
            </h2>
            <div className="flex items-center space-x-4">
              {currentRoute !== 'voip' && (
                <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">
                  {getActionButtonText(currentRoute)}
                </button>
              )}
              <div className="w-10 h-10 rounded-full bg-gray-200"></div>
            </div>
          </div>
        </header>
        <main className="p-6 min-h-[calc(100vh-80px)]">
          {children}
        </main>
      </div>
    </div>
  );
};

// Helper function for action button text
const getActionButtonText = (route: Route): string => {
  switch (route) {
    case 'contacts':
      return 'New Contact';
    case 'appointments':
      return 'New Appointment';
    case 'tickets':
      return 'New Ticket';
    case 'messages':
      return 'New Message';
    case 'voip':
      return 'Place Call';
    default:
      return 'New Item';
  }
};

export default App;