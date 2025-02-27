import { useState } from 'react';
import { Search, Filter, Plus } from 'lucide-react';

interface Contact {
  id: number;
  name: string;
  email: string;
  phone: string;
  lastVisit: string;
  status: 'active' | 'inactive';
  type: 'patient' | 'family' | 'other';
}

interface ContactListProps {
  onSelectContact: (contact: Contact) => void;
}

const ContactList = ({ onSelectContact }: ContactListProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'patient' | 'family'>('all');

  // Sample contact data - in real app, this would come from an API
  const contacts: Contact[] = [
    {
      id: 1,
      name: 'Sarah Johnson',
      email: 'sarah.j@example.com',
      phone: '+1 234 567 8900',
      lastVisit: '2024-01-15',
      status: 'active',
      type: 'patient'
    },
    {
      id: 2,
      name: 'Michael Smith',
      email: 'michael.s@example.com',
      phone: '+1 234 567 8901',
      lastVisit: '2024-01-20',
      status: 'active',
      type: 'patient'
    },
    {
      id: 3,
      name: 'Emily Davis',
      email: 'emily.d@example.com',
      phone: '+1 234 567 8902',
      lastVisit: '2024-01-18',
      status: 'inactive',
      type: 'family'
    }
  ];

  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         contact.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === 'all' || contact.type === filterType;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="h-full bg-white">
      {/* Search and Filter Header */}
      <div className="p-4 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-3 text-gray-400" size={20} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
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
            <select 
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as 'all' | 'patient' | 'family')}
              className="px-3 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg border-none"
            >
              <option value="all">All Contacts</option>
              <option value="patient">Patients</option>
              <option value="family">Family Members</option>
            </select>
          </div>
          <button className="flex items-center px-3 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700">
            <Plus size={16} className="mr-2" />
            Add Contact
          </button>
        </div>
      </div>

      {/* Contact List */}
      <div className="h-[calc(100%-100px)] overflow-y-auto">
        {filteredContacts.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            No contacts found
          </div>
        ) : (
          filteredContacts.map((contact) => (
            <div
              key={contact.id}
              onClick={() => onSelectContact(contact)}
              className="p-4 border-b cursor-pointer hover:bg-gray-50"
            >
              <div className="flex items-center">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-medium">
                    {contact.name.charAt(0)}
                  </span>
                </div>
                <div className="ml-3 flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-gray-800">{contact.name}</h3>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      contact.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {contact.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">{contact.email}</p>
                  <div className="mt-1 flex items-center text-xs text-gray-500">
                    <span>Last visit: {contact.lastVisit}</span>
                    <span className="mx-2">•</span>
                    <span>{contact.type}</span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ContactList;