import { ReactNode } from 'react';
import { 
  Users, 
  Calendar, 
  MessageSquare, 
  Ticket,
  TrendingUp,
  TrendingDown,
  Clock
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend
} from 'recharts';

interface PatientData {
  month: string;
  patients: number;
  appointments: number;
}

interface RevenueData {
  month: string;
  revenue: number;
}

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
  icon: ReactNode;
}

interface ActivityItemProps {
  title: string;
  description: string;
  time: string;
}

interface AppointmentItemProps {
  name: string;
  time: string;
  doctor: string;
  type: string;
}

// Sample data for charts
const patientData: PatientData[] = [
  { month: 'Jan', patients: 65, appointments: 120 },
  { month: 'Feb', patients: 78, appointments: 144 },
  { month: 'Mar', patients: 82, appointments: 150 },
  { month: 'Apr', patients: 95, appointments: 180 },
  { month: 'May', patients: 102, appointments: 190 },
  { month: 'Jun', patients: 108, appointments: 205 }
];

const revenueData: RevenueData[] = [
  { month: 'Jan', revenue: 12500 },
  { month: 'Feb', revenue: 15000 },
  { month: 'Mar', revenue: 14000 },
  { month: 'Apr', revenue: 16500 },
  { month: 'May', revenue: 17800 },
  { month: 'Jun', revenue: 19200 }
];

const Dashboard = () => {
  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Patients"
          value="2,546"
          change="+12.5%"
          trend="up"
          icon={<Users className="text-blue-600" />}
        />
        <StatCard
          title="Appointments"
          value="48"
          change="+2.5%"
          trend="up"
          icon={<Calendar className="text-purple-600" />}
        />
        <StatCard
          title="Active Tickets"
          value="156"
          change="-5.2%"
          trend="down"
          icon={<Ticket className="text-yellow-600" />}
        />
        <StatCard
          title="Messages"
          value="32"
          change="+8.1%"
          trend="up"
          icon={<MessageSquare className="text-green-600" />}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Patient & Appointment Trends</h3>
            <select className="text-sm border rounded-lg p-2">
              <option>Last 6 months</option>
              <option>Last year</option>
            </select>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={patientData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="patients" 
                  stroke="#3B82F6" 
                  name="Patients"
                />
                <Line 
                  type="monotone" 
                  dataKey="appointments" 
                  stroke="#8B5CF6" 
                  name="Appointments"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Revenue Overview</h3>
            <select className="text-sm border rounded-lg p-2">
              <option>Last 6 months</option>
              <option>Last year</option>
            </select>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip 
                  formatter={(value: number) => `$${value.toLocaleString()}`}
                />
                <Bar 
                  dataKey="revenue" 
                  fill="#3B82F6" 
                  name="Revenue"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Activity and Upcoming Appointments */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Recent Activity</h3>
            <button className="text-sm text-blue-600 hover:text-blue-700">View all</button>
          </div>
          <div className="space-y-4">
            <ActivityItem 
              title="New Patient Registration"
              description="Sarah Johnson has registered as a new patient"
              time="2 hours ago"
            />
            <ActivityItem 
              title="Appointment Scheduled"
              description="Dr. Smith - Dental Check-up with Mike Peters"
              time="3 hours ago"
            />
            <ActivityItem 
              title="Ticket Resolved"
              description="Billing inquiry #2234 has been resolved"
              time="5 hours ago"
            />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Upcoming Appointments</h3>
            <button className="text-sm text-blue-600 hover:text-blue-700">View all</button>
          </div>
          <div className="space-y-4">
            <AppointmentItem
              name="Sarah Johnson"
              time="10:00 AM"
              doctor="Dr. Smith"
              type="Check-up"
            />
            <AppointmentItem
              name="Michael Brown"
              time="11:30 AM"
              doctor="Dr. Wilson"
              type="Consultation"
            />
            <AppointmentItem
              name="Emily Davis"
              time="2:00 PM"
              doctor="Dr. Smith"
              type="Follow-up"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, change, trend, icon }: StatCardProps) => {
  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-medium text-gray-500">{title}</h3>
          <p className="text-2xl font-semibold text-gray-800">{value}</p>
        </div>
        <div className="p-3 bg-blue-50 rounded-lg">
          {icon}
        </div>
      </div>
      <div className="flex items-center text-sm">
        {trend === 'up' ? (
          <TrendingUp size={16} className="text-green-500 mr-1" />
        ) : (
          <TrendingDown size={16} className="text-red-500 mr-1" />
        )}
        <span className={trend === 'up' ? 'text-green-600' : 'text-red-600'}>
          {change}
        </span>
        <span className="ml-2 text-gray-500">vs last month</span>
      </div>
    </div>
  );
};

const ActivityItem = ({ title, description, time }: ActivityItemProps) => {
  return (
    <div className="flex items-start space-x-4">
      <div className="w-2 h-2 mt-2 bg-blue-600 rounded-full"></div>
      <div className="flex-1">
        <h4 className="text-sm font-medium text-gray-800">{title}</h4>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
      <span className="text-xs text-gray-400">{time}</span>
    </div>
  );
};

const AppointmentItem = ({ name, time, doctor, type }: AppointmentItemProps) => {
  return (
    <div className="flex items-center justify-between p-4 border rounded-lg">
      <div className="flex items-center space-x-4">
        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
          <span className="text-blue-600 font-medium">{name.charAt(0)}</span>
        </div>
        <div>
          <h4 className="text-sm font-medium text-gray-800">{name}</h4>
          <p className="text-sm text-gray-500">{doctor} • {type}</p>
        </div>
      </div>
      <div className="flex items-center">
        <Clock size={16} className="text-gray-400 mr-2" />
        <span className="text-sm text-gray-600">{time}</span>
      </div>
    </div>
  );
};

export default Dashboard;