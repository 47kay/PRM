import { useState } from 'react';
import {
  Plus,
  Search,
  Eye,
  Send,
  X,
} from 'lucide-react';

// Interfaces
interface Ticket {
  id: string;
  subject: string;
  description: string;
  patient: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'high' | 'medium' | 'low';
  category: string;
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
  comments: Comment[];
  auditLog: AuditLogEntry[];
  taggedUsers: string[];
}

interface Comment {
  id: string;
  text: string;
  author: string;
  createdAt: string;
}

interface Staff {
  id: string;
  name: string;
  role: string;
  department: string;
  avatar: string;
}

interface NewTicketData {
  subject: string;
  description: string;
  patient: string;
  priority: 'high' | 'medium' | 'low';
  category: string;
  assignedTo?: string;
  taggedUsers: string[];
}

// Types for audit logs
interface AuditLogEntry {
  id: string;
  ticketId: string;
  action: 'created' | 'updated' | 'commented' | 'status_changed' | 'assigned';
  field?: string;
  oldValue?: string;
  newValue?: string;
  performedBy: string;
  timestamp: string;
}

// Sample Data
const staffMembers: Staff[] = [
  {
    id: '1',
    name: 'Dr. Smith',
    role: 'Doctor',
    department: 'General Medicine',
    avatar: 'S'
  },
  {
    id: '2',
    name: 'Dr. Johnson',
    role: 'Doctor',
    department: 'Pediatrics',
    avatar: 'J'
  },
  {
    id: '3',
    name: 'Nurse Williams',
    role: 'Nurse',
    department: 'General Medicine',
    avatar: 'W'
  },
  {
    id: '4',
    name: 'Dr. Brown',
    role: 'Doctor',
    department: 'Cardiology',
    avatar: 'B'
  }
];

// Main Tickets Component
export const Tickets: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>([
    {
      id: '#1234',
      subject: 'Appointment Rescheduling',
      description: 'Need to reschedule my appointment from next week',
      patient: 'Sarah Johnson',
      status: 'open',
      priority: 'medium',
      category: 'Appointments',
      assignedTo: 'Dr. Smith',
      createdAt: '2024-02-14T10:00:00',
      updatedAt: '2024-02-14T10:00:00',
      taggedUsers: [], // Initialize with empty array
      comments: [
        {
          id: '1',
          text: 'I will look into available slots',
          author: 'Dr. Smith',
          createdAt: '2024-02-14T10:30:00'
        }
      ],
      auditLog: [{
        id: Date.now().toString(),
        ticketId: '#1234',
        action: 'created',
        performedBy: 'Current User',
        timestamp: new Date().toISOString()
      }]
    }
  ]);

  const TaggedUsersDisplay = ({ userIds }: { userIds: string[] }) => {
    const getTaggedUserDetails = (userId: string) => {
      return staffMembers.find(staff => staff.id === userId);
    };

    if (userIds.length === 0) {
      return null;
    }

    return (
      <div className="flex flex-wrap gap-1 mt-1">
        {userIds.map(userId => {
          const user = getTaggedUserDetails(userId);
          if (!user) return null;

          return (
            <div
              key={userId}
              className="inline-flex items-center px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full"
            >
              <span className="w-4 h-4 bg-gray-200 rounded-full flex items-center justify-center text-xs mr-1">
                {user.avatar}
              </span>
              <span className="truncate max-w-[100px]">{user.name}</span>
            </div>
          );
        })}
      </div>
    );
  };

  const [showNewTicketModal, setShowNewTicketModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const handleCreateTicket = (newTicketData: NewTicketData) => {
    const ticketId = `#${Date.now()}`;
    const newTicket: Ticket = {
      id: ticketId,
      ...newTicketData,
      status: 'open',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      comments: [],
      auditLog: [{
        id: Date.now().toString(),
        ticketId,
        action: 'created',
        performedBy: 'Current User',
        timestamp: new Date().toISOString()
      }]
    };

    setTickets(current => [...current, newTicket]);
    setShowNewTicketModal(false);
  };

  const handleTicketUpdate = (ticketId: string, updates: Partial<Ticket>) => {
    setTickets(currentTickets =>
      currentTickets.map(ticket => {
        if (ticket.id === ticketId) {
          // Create audit log entries for each changed field
          const newAuditEntries: AuditLogEntry[] = [];

          Object.entries(updates).forEach(([field, value]) => {
            if (field !== 'auditLog' && field !== 'updatedAt') {
              newAuditEntries.push({
                id: Date.now().toString(),
                ticketId,
                action: field === 'status' ? 'status_changed' :
                  field === 'assignedTo' ? 'assigned' : 'updated',
                field,
                oldValue: String(ticket[field as keyof Ticket]),
                newValue: String(value),
                performedBy: 'Current User',
                timestamp: new Date().toISOString()
              });
            }
          });
          return {
            ...ticket,
            ...updates,
            auditLog: [...ticket.auditLog, ...newAuditEntries],
            updatedAt: new Date().toISOString()
          };
        }
        return ticket;
      })
    );
  };


  const filteredTickets = tickets.filter(ticket => {
    const matchesStatus = filterStatus === 'all' || ticket.status === filterStatus;
    const matchesSearch =
      ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.patient.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.id.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'resolved':
        return 'bg-purple-100 text-purple-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-500';
      case 'medium':
        return 'text-yellow-500';
      case 'low':
        return 'text-blue-500';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header and Filters */}
      <div className="p-6 border-b">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Support Tickets</h2>
          <button
            onClick={() => setShowNewTicketModal(true)}
            className="px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            <Plus size={16} className="inline-block mr-2" />
            New Ticket
          </button>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search tickets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Filter */}
          <div className="flex flex-wrap gap-2">
            {['all', 'open', 'in_progress', 'resolved', 'closed'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 text-sm rounded-lg ${filterStatus === status
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-50'
                  }`}
              >
                {status === 'all' ? 'All' :
                  status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tickets Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="border-b">
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Patient</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredTickets.map((ticket) => (
              <tr key={ticket.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm text-gray-500">{ticket.id}</td>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">{ticket.subject}</div>
                  {ticket.assignedTo && (
                    <div className="text-sm text-gray-500">
                      Assigned to {ticket.assignedTo}
                    </div>
                  )}
                  <TaggedUsersDisplay userIds={ticket.taggedUsers} />
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">{ticket.patient}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(ticket.status)}`}>
                    {ticket.status.replace('_', ' ').charAt(0).toUpperCase() + ticket.status.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`text-sm ${getPriorityColor(ticket.priority)}`}>
                    {ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">{ticket.category}</td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {new Date(ticket.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  <button
                    onClick={() => setSelectedTicket(ticket)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <Eye size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredTickets.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No tickets found matching your criteria</p>
          </div>
        )}
      </div>

      {/* Modals */}
      {showNewTicketModal && (
        <NewTicketModal
          onClose={() => setShowNewTicketModal(false)}
          onCreateTicket={handleCreateTicket}
        />
      )}

      {selectedTicket && (
        <TicketDetailsModal
          ticket={selectedTicket}
          onClose={() => setSelectedTicket(null)}
          onUpdateTicket={handleTicketUpdate}
        />
      )}
    </div>
  );
};

// Continue with NewTicketModal, TicketDetailsModal, and export...

// New Ticket Modal Component
const NewTicketModal = ({
  onClose,
  onCreateTicket
}: {
  onClose?: () => void;
  onCreateTicket: (newTicketData: NewTicketData) => void;
}) => {

  const [formData, setFormData] = useState<NewTicketData>({
    subject: '',
    description: '',
    patient: '',
    priority: 'medium',
    category: '',
    taggedUsers: []
  });

  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Updated staff members array with more details
  const staffMembers: Staff[] = [
    {
      id: '1',
      name: 'Dr. Smith',
      role: 'Doctor',
      department: 'General Medicine',
      avatar: 'S'
    },
    {
      id: '2',
      name: 'Dr. Johnson',
      role: 'Doctor',
      department: 'Pediatrics',
      avatar: 'J'
    },
    {
      id: '3',
      name: 'Nurse Williams',
      role: 'Nurse',
      department: 'General Medicine',
      avatar: 'W'
    },
    {
      id: '4',
      name: 'Dr. Brown',
      role: 'Doctor',
      department: 'Cardiology',
      avatar: 'B'
    }
  ];

  const filteredStaff = staffMembers.filter(staff =>
    staff.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    staff.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
    staff.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleTagUser = (userId: string) => {
    if (!formData.taggedUsers.includes(userId)) {
      setFormData({
        ...formData,
        taggedUsers: [...formData.taggedUsers, userId]
      });
    }
    setSearchTerm('');
    setShowUserDropdown(false);
  };

  const handleRemoveTag = (userId: string) => {
    setFormData({
      ...formData,
      taggedUsers: formData.taggedUsers.filter(id => id !== userId)
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreateTicket(formData);
  };

  const getTaggedUserDetails = (userId: string) => {
    return staffMembers.find(staff => staff.id === userId);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-800">Create New Ticket</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Subject
            </label>
            <input
              type="text"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={4}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Patient
            </label>
            <input
              type="text"
              value={formData.patient}
              onChange={(e) => setFormData({ ...formData, patient: e.target.value })}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* User Tagging Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tag Team Members
            </label>
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setShowUserDropdown(true);
                }}
                onFocus={() => setShowUserDropdown(true)}
                placeholder="Search team members..."
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              {/* Tagged Users Display */}
              {formData.taggedUsers.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.taggedUsers.map(userId => {
                    const user = getTaggedUserDetails(userId);
                    return user ? (
                      <div
                        key={userId}
                        className="flex items-center bg-blue-50 text-blue-700 px-2 py-1 rounded-full text-sm"
                      >
                        <span className="w-5 h-5 bg-blue-200 rounded-full flex items-center justify-center text-xs mr-1">
                          {user.avatar}
                        </span>
                        <span>{user.name}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(userId)}
                          className="ml-1 text-blue-500 hover:text-blue-700"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : null;
                  })}
                </div>
              )}

              {/* User Dropdown */}
              {showUserDropdown && searchTerm && (
                <div className="absolute z-10 w-full mt-1 bg-white rounded-lg shadow-lg border max-h-60 overflow-auto">
                  {filteredStaff.length > 0 ? (
                    filteredStaff.map(staff => (
                      <button
                        key={staff.id}
                        type="button"
                        onClick={() => handleTagUser(staff.id)}
                        className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center"
                      >
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mr-2">
                          {staff.avatar}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{staff.name}</div>
                          <div className="text-xs text-gray-500">{staff.role} • {staff.department}</div>
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-2 text-sm text-gray-500">No team members found</div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div>

          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Priority
            </label>
            <select
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value as 'high' | 'medium' | 'low' })}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select a category</option>
              <option value="Appointments">Appointments</option>
              <option value="Billing">Billing</option>
              <option value="Technical">Technical</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-600 border rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              Create Ticket
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Ticket Details Modal Component
export const TicketDetailsModal = ({ ticket, onClose, onUpdateTicket }: {
  ticket: Ticket;
  onClose: () => void;
  onUpdateTicket: (ticketId: string, updates: Partial<Ticket>) => void;
}) => {
  const [newComment, setNewComment] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [showAssignMenu, setShowAssignMenu] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(ticket.status);
  const [selectedAssignee, setSelectedAssignee] = useState(ticket.assignedTo);
  const [showAddTagModal, setShowAddTagModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const statusOptions = [
    { value: 'open', label: 'Open' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'resolved', label: 'Resolved' },
    { value: 'closed', label: 'Closed' }
  ];

  const staffMembers: Staff[] = [
    { id: '1', name: 'Dr. Smith', role: 'Doctor', department: 'General Medicine', avatar: 'S' },
    { id: '2', name: 'Dr. Johnson', role: 'Doctor', department: 'Pediatrics', avatar: 'J' },
    { id: '3', name: 'Nurse Williams', role: 'Nurse', department: 'General Medicine', avatar: 'W' },
    { id: '4', name: 'Dr. Brown', role: 'Doctor', department: 'Cardiology', avatar: 'B' }
  ];

  const getTaggedUserDetails = (userId: string) => {
    return staffMembers.find(staff => staff.id === userId);
  };

  const handleStatusChange = (newStatus: string) => {
    setSelectedStatus(newStatus as Ticket['status']);
    onUpdateTicket(ticket.id, {
      status: newStatus as Ticket['status'],
      updatedAt: new Date().toISOString()
    });
    setIsEditing(false);
  };

  const handleAssign = (staffMember: Staff) => {
    setSelectedAssignee(staffMember.name);
    onUpdateTicket(ticket.id, {
      assignedTo: staffMember.name,
      updatedAt: new Date().toISOString()
    });
    setShowAssignMenu(false);
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const comment = {
      id: Date.now().toString(),
      text: newComment,
      author: 'Current User',
      createdAt: new Date().toISOString()
    };

    onUpdateTicket(ticket.id, {
      comments: [...ticket.comments, comment],
      updatedAt: new Date().toISOString()
    });

    setNewComment('');
  };

  const handleAddTag = (userId: string) => {
    const updatedTaggedUsers = [...ticket.taggedUsers, userId];
    onUpdateTicket(ticket.id, {
      taggedUsers: updatedTaggedUsers, // Now correctly passing string[]
      updatedAt: new Date().toISOString()
    });
    setShowAddTagModal(false);
  };

  const handleRemoveTag = (userId: string) => {
    const updatedTaggedUsers = ticket.taggedUsers.filter(id => id !== userId);
    onUpdateTicket(ticket.id, {
      taggedUsers: updatedTaggedUsers, // Now correctly passing string[]
      updatedAt: new Date().toISOString()
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
  <div className="flex-1">
    <h3 className="text-lg font-medium text-gray-800">Ticket Details</h3>
    <p className="text-sm text-gray-500">ID: {ticket.id}</p>
  </div>
  
  <div className="flex items-center space-x-4">
    {/* Status Dropdown */}
    <div className="relative">
      <button
        onClick={() => setIsEditing(!isEditing)}
        className={`px-3 py-1 rounded-full text-sm ${
          selectedStatus === 'open' ? 'bg-green-100 text-green-800' :
          selectedStatus === 'in_progress' ? 'bg-blue-100 text-blue-800' :
          selectedStatus === 'resolved' ? 'bg-purple-100 text-purple-800' :
          'bg-gray-100 text-gray-800'
        }`}
      >
        {selectedStatus.replace('_', ' ').charAt(0).toUpperCase() + selectedStatus.slice(1)}
      </button>
      
      {isEditing && (
        <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
          <div className="py-1" role="menu">
            {statusOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleStatusChange(option.value)}
                className={`block w-full text-left px-4 py-2 text-sm ${
                  selectedStatus === option.value ? 'bg-gray-100' : ''
                } hover:bg-gray-50`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>

    {/* Assignment Dropdown */}
    <div className="relative">
      <button
        onClick={() => setShowAssignMenu(!showAssignMenu)}
        className="px-3 py-1 text-sm border rounded-lg hover:bg-gray-50 flex items-center"
      >
        {selectedAssignee ? (
          <span>{selectedAssignee}</span>
        ) : (
          <span className="text-gray-500">Assign</span>
        )}
      </button>

      {showAssignMenu && (
        <div className="absolute right-0 mt-2 w-64 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
          <div className="py-1" role="menu">
            {staffMembers.map((staff) => (
              <button
                key={staff.id}
                onClick={() => handleAssign(staff)}
                className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-50"
              >
                <div>{staff.name}</div>
                <div className="text-xs text-gray-500">{staff.role} - {staff.department}</div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>

    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
      <X size={20} />
    </button>
  </div>
</div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="space-y-6">
            {/* Tagged Users Section */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-gray-700">Tagged Team Members</h4>
                <button
                  onClick={() => setShowAddTagModal(true)}
                  className="text-sm text-blue-600 hover:text-blue-700 flex items-center"
                >
                  <Plus size={16} className="mr-1" />
                  Add Member
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {ticket.taggedUsers?.map(userId => {
                  const user = getTaggedUserDetails(userId);
                  return user ? (
                    <div
                      key={userId}
                      className="flex items-center bg-white border px-3 py-1.5 rounded-full text-sm"
                    >
                      <span className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-xs mr-2">
                        {user.avatar}
                      </span>
                      <span className="text-gray-700">{user.name}</span>
                      <button
                        onClick={() => handleRemoveTag(userId)}
                        className="ml-2 text-gray-400 hover:text-gray-600"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : null;
                })}
                {ticket.taggedUsers?.length === 0 && (
                  <p className="text-sm text-gray-500">No team members tagged</p>
                )}
              </div>
            </div>

            {/* Ticket Information */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Category</p>
                  <p className="mt-1 text-sm text-gray-900">{ticket.category}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Priority</p>
                  <p className={`mt-1 text-sm ${ticket.priority === 'high' ? 'text-red-600' :
                    ticket.priority === 'medium' ? 'text-yellow-600' :
                      'text-blue-600'
                    }`}>
                    {ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Created</p>
                  <p className="mt-1 text-sm text-gray-900">{formatDate(ticket.createdAt)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Last Updated</p>
                  <p className="mt-1 text-sm text-gray-900">{formatDate(ticket.updatedAt)}</p>
                </div>
              </div>
            </div>

            {/* Subject and Description */}
            <div>
              <h4 className="text-base font-medium text-gray-800">{ticket.subject}</h4>
              <p className="mt-2 text-sm text-gray-600">{ticket.description}</p>
            </div>

            {/* Comments Section */}
            <div className="space-y-4">
              <h4 className="text-base font-medium text-gray-800">Comments</h4>
              {ticket.comments.map((comment) => (
                <div key={comment.id} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-medium">
                          {comment.author[0]}
                        </span>
                      </div>
                      <span className="ml-2 text-sm font-medium text-gray-700">
                        {comment.author}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {formatDate(comment.createdAt)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{comment.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>



        {/* Add Comment Form */}
        <div className="mt-6 pt-4 border-t">
          <form onSubmit={handleAddComment} className="flex space-x-3">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center"
              disabled={!newComment.trim()}
            >
              <Send size={16} className="mr-2" />
              Send
            </button>
          </form>
        </div>



        {/* Add Tag Modal */}
        {showAddTagModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-4 w-96">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium">Tag Team Member</h3>
                <button onClick={() => setShowAddTagModal(false)} className="text-gray-500">
                  <X size={20} />
                </button>
              </div>

              <input
                type="text"
                placeholder="Search team members..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-2 border rounded-lg mb-4"
              />

              <div className="max-h-60 overflow-y-auto">
                {staffMembers
                  .filter(staff =>
                    !ticket.taggedUsers?.includes(staff.id) &&
                    (staff.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      staff.role.toLowerCase().includes(searchTerm.toLowerCase()))
                  )
                  .map(staff => (
                    <button
                      key={staff.id}
                      onClick={() => {
                        handleAddTag(staff.id)
                        handleAssign(staff)
                      }}
                      className="w-full text-left p-2 hover:bg-gray-50 rounded-lg flex items-center"
                    >
                      <span className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mr-2">
                        {staff.avatar}
                      </span>
                      <div>
                        <div className="text-sm font-medium">{staff.name}</div>
                        <div className="text-xs text-gray-500">{staff.role} • {staff.department}</div>
                      </div>
                    </button>
                  ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Tickets;