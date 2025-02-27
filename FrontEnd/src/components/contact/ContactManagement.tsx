import { useState } from 'react';
import { Search, Filter, Plus, Phone, Mail, Calendar, Clock, FileText, CheckCircle, Upload, MoreVertical } from 'lucide-react';

interface Contact {
  id: number;
  name: string;
  email: string;
  phone: string;
  lastVisit: string;
  status: 'active' | 'inactive';
  type: 'patient' | 'family' | 'other';
}

interface ContactProfileProps {
  contact: Contact;
  onClose: () => void;
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

interface Contact {
  id: number;
  name: string;
  email: string;
  phone: string;
  lastVisit: string;
  status: 'active' | 'inactive';
  type: 'patient' | 'family' | 'other';
}

interface ContactManagementProps {
  contacts: Contact[];
}

const ContactManagement: React.FC<ContactManagementProps> = ({ contacts }) => {
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

  // Sample contacts data
  // Sample contacts data
  // const contacts: Contact[] = [
  //   {
  //     id: 1,
  //     name: 'Sarah Johnson',
  //     email: 'sarah.j@example.com',
  //     phone: '+1 234 567 8900',
  //     lastVisit: '2024-01-15',
  //     status: 'active',
  //     type: 'patient'
  //   },
  //   {
  //     id: 2,
  //     name: 'Michael Smith',
  //     email: 'michael.s@example.com',
  //     phone: '+1 234 567 8901',
  //     lastVisit: '2024-01-20',
  //     status: 'active',
  //     type: 'patient'
  //   }
  // ];

  return (
    <div className="flex h-[calc(100vh-120px)]">
      {/* Contact List Section */}
      <div className="w-1/3 border-r">
        {/* Search Header */}
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search contacts..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center justify-between mt-4">
            <div className="flex space-x-2">
              <button className="flex items-center px-3 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg">
                <Filter size={16} className="mr-2" />
                Filter
              </button>
              <select className="px-3 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg border-none">
                <option>All Contacts</option>
                <option>Patients</option>
                <option>Family Members</option>
              </select>
            </div>
            <button className="flex items-center px-3 py-2 text-sm text-white bg-blue-600 rounded-lg">
              <Plus size={16} className="mr-2" />
              Add Contact
            </button>
          </div>
        </div>

        {/* Contact List */}
        <div className="overflow-y-auto h-[calc(100%-100px)]">
          {contacts.map((contact) => (
            <div
              key={contact.id}
              onClick={() => setSelectedContact(contact)}
              className={`p-4 border-b cursor-pointer ${selectedContact?.id === contact.id ? 'bg-blue-50' : 'hover:bg-gray-50'
                }`}
            >
              <div className="flex items-center">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-medium">{contact.name.charAt(0)}</span>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-gray-800">{contact.name}</h3>
                  <p className="text-sm text-gray-500">{contact.email}</p>
                  <div className="mt-1 flex items-center text-xs text-gray-500">
                    <span>Last visit: {contact.lastVisit}</span>
                    <span className="mx-2">•</span>
                    <span>{contact.type}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Contact Details Section */}
      <div className="flex-1">
        {selectedContact ? (
          <ContactProfile
            contact={selectedContact}
            onClose={() => setSelectedContact(null)}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            Select a contact to view details
          </div>
        )}
      </div>
    </div>
  );
};

const ContactProfile = ({ contact, onClose }: ContactProfileProps) => {
  const [activeTab, setActiveTab] = useState('overview');
  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'appointments', label: 'Appointments' },
    { id: 'documents', label: 'Documents' },
    { id: 'family', label: 'Family' }
  ];



  return (
    <div className="h-full bg-white">
      <div className="p-6 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-2xl text-blue-600 font-medium">
                {contact.name.charAt(0)}
              </span>
            </div>
            <div className="ml-4">
              <h2 className="text-xl font-semibold text-gray-800">{contact.name}</h2>
              <div className="mt-2 space-x-4">
                <span className="inline-flex items-center text-sm text-gray-500">
                  <Phone size={16} className="mr-2" />
                  {contact.phone}
                </span>
                <span className="inline-flex items-center text-sm text-gray-500">
                  <Mail size={16} className="mr-2" />
                  {contact.email}
                </span>
              </div>
            </div>
          </div>
          <div className="flex space-x-3">
            <button className="px-4 py-2 text-sm text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50">
              Edit Profile
            </button>
            <button className="px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700">
              Book Appointment
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700"
            >
              Close
            </button>
          </div>
        </div>

        <div className="flex space-x-6 mt-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => { 
                console.log(tab.id)
                setActiveTab(tab.id)
               }}
              className={`pb-2 text-sm font-medium border-b-2 ${activeTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <StatCard
                icon={<Calendar className="text-blue-600" />}
                label="Next Appointment"
                value="Jan 25, 2024"
              />
              <StatCard
                icon={<Clock className="text-blue-600" />}
                label="Last Visit"
                value={contact.lastVisit}
              />
              <StatCard
                icon={<FileText className="text-blue-600" />}
                label="Documents"
                value="5"
              />
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-800 mb-3">Medical Information</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Blood Type</span>
                  <span className="text-sm text-gray-800">A+</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Allergies</span>
                  <span className="text-sm text-gray-800">None</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Medical Conditions</span>
                  <span className="text-sm text-gray-800">None reported</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-800 mb-3">Notes</h3>
              <textarea
                className="w-full p-3 border rounded-lg h-24"
                placeholder="Add a note..."
              />
            </div>
          </div>
        )}
        {activeTab === 'appointments' && <AppointmentsTab />}
        {activeTab === 'documents' && <DocumentsTab />}
        {activeTab === 'family' && <FamilyTab />}
      </div>
    </div>
  );
};

const AppointmentsTab = () => {
  const appointments = [
    {
      id: 1,
      date: '2024-02-15',
      time: '10:00 AM',
      doctor: 'Dr. Smith',
      type: 'Check-up',
      status: 'upcoming'
    },
    {
      id: 2,
      date: '2024-01-20',
      time: '2:30 PM',
      doctor: 'Dr. Johnson',
      type: 'Follow-up',
      status: 'completed'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Upcoming Appointments Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">Upcoming Appointments</h3>
          <button className="text-sm text-blue-600 hover:text-blue-700">
            Book New
          </button>
        </div>
        <div className="space-y-4">
          {appointments
            .filter(apt => apt.status === 'upcoming')
            .map(appointment => (
              <div
                key={appointment.id}
                className="flex items-center justify-between p-4 bg-white border rounded-lg"
              >
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-blue-50 rounded-full">
                    <Calendar className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {appointment.type} with {appointment.doctor}
                    </p>
                    <p className="text-sm text-gray-500">
                      {appointment.date} at {appointment.time}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button className="px-3 py-1 text-sm text-gray-600 border rounded-md hover:bg-gray-50">
                    Reschedule
                  </button>
                  <button className="px-3 py-1 text-sm text-red-600 border border-red-200 rounded-md hover:bg-red-50">
                    Cancel
                  </button>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Past Appointments Section */}
      <div>
        <h3 className="text-lg font-medium mb-4">Past Appointments</h3>
        <div className="space-y-4">
          {appointments
            .filter(apt => apt.status === 'completed')
            .map(appointment => (
              <div
                key={appointment.id}
                className="flex items-center justify-between p-4 bg-gray-50 border rounded-lg"
              >
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-gray-100 rounded-full">
                    <CheckCircle className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {appointment.type} with {appointment.doctor}
                    </p>
                    <p className="text-sm text-gray-500">
                      {appointment.date} at {appointment.time}
                    </p>
                  </div>
                </div>
                <button className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800">
                  View Details
                </button>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

const DocumentsTab = () => {
  const documents = [
    {
      id: 1,
      name: 'Medical History.pdf',
      type: 'PDF',
      date: '2024-01-15',
      size: '2.4 MB',
      category: 'Medical Records'
    },
    {
      id: 2,
      name: 'Lab Results.pdf',
      type: 'PDF',
      date: '2024-01-20',
      size: '1.8 MB',
      category: 'Test Results'
    },
    {
      id: 3,
      name: 'Insurance Card.jpg',
      type: 'Image',
      date: '2024-01-10',
      size: '1.2 MB',
      category: 'Insurance'
    }
  ];

  const categories = ['All Documents', 'Medical Records', 'Test Results', 'Insurance', 'Other'];

  return (
    <div className="space-y-6">
      {/* Header with actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <select className="px-3 py-2 border rounded-md text-sm">
            {categories.map(category => (
              <option key={category}>{category}</option>
            ))}
          </select>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search documents..."
              className="pl-9 pr-4 py-2 border rounded-md text-sm w-64"
            />
          </div>
        </div>
        <button className="flex items-center px-4 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700">
          <Upload className="w-4 h-4 mr-2" />
          Upload Document
        </button>
      </div>

      {/* Documents List */}
      <div className="border rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Size</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {documents.map(doc => (
              <tr key={doc.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <FileText className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-900">{doc.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-gray-500">{doc.category}</span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-gray-500">{doc.date}</span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-gray-500">{doc.size}</span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="text-sm text-blue-600 hover:text-blue-700 mr-4">
                    Download
                  </button>
                  <button className="text-sm text-gray-600 hover:text-gray-700">
                    Share
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const FamilyTab = () => {
  const familyMembers = [
    {
      id: 1,
      name: 'John Smith',
      relationship: 'Spouse',
      phone: '+1 234 567 8901',
      email: 'john.smith@example.com'
    },
    {
      id: 2,
      name: 'Emma Smith',
      relationship: 'Daughter',
      phone: '+1 234 567 8902',
      email: 'emma.smith@example.com'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Family Members</h3>
        <button className="flex items-center px-4 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Add Family Member
        </button>
      </div>

      {/* Family Members Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {familyMembers.map(member => (
          <div
            key={member.id}
            className="p-4 border rounded-lg space-y-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-medium">
                    {member.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{member.name}</h4>
                  <p className="text-sm text-gray-500">{member.relationship}</p>
                </div>
              </div>
              <button className="text-gray-400 hover:text-gray-500">
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              <div className="flex items-center text-sm text-gray-500">
                <Phone className="w-4 h-4 mr-2" />
                {member.phone}
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <Mail className="w-4 h-4 mr-2" />
                {member.email}
              </div>
            </div>

            <div className="pt-4 flex space-x-3">
              <button className="flex-1 px-3 py-2 text-sm text-gray-600 border rounded-md hover:bg-gray-50">
                View Profile
              </button>
              <button className="flex-1 px-3 py-2 text-sm text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50">
                Message
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value }: StatCardProps) => (
  <div className="bg-gray-50 rounded-lg p-4">
    <div className="flex items-center">
      <div className="p-2 bg-white rounded-lg">
        {icon}
      </div>
      <div className="ml-3">
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-sm font-semibold text-gray-800">{value}</p>
      </div>
    </div>
  </div>
);

export default ContactManagement;