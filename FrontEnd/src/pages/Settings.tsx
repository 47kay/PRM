import { useState, ReactNode } from 'react';
import { 
  Building, 
  Bell, 
  CreditCard, 
  Shield, 
  Users, 
  Key, 
  Smartphone, 
  Plus, 
  Check, 
  Lock, 
  UserPlus,
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

// Interfaces
interface NavItemProps {
  icon: ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}

interface TeamMember {
  name: string;
  role: string;
  email: string;
  status: string;
  lastLogin: string;
  permissions: string[];
}

interface Invoice {
  date: string;
  amount: string;
  status: string;
}

interface LoginSession {
  device: string;
  location: string;
  time: string;
  status: string;
}

interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
}

interface Role {
  id: string;
  name: string;
  permissions: string[];
}

// Navigation Item Component
const NavItem = ({ icon, label, active, onClick }: NavItemProps) => (
  <button
    onClick={onClick}
    className={`
      w-full flex items-center px-3 py-2 rounded-lg text-sm
      ${active ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}
    `}
  >
    <span className="mr-3">{icon}</span>
    {label}
  </button>
);

// Main Settings Component
const Settings = () => {
  const [activeTab, setActiveTab] = useState<string>('organization');

  return (
    <div className="flex h-[calc(100vh-120px)]">
      {/* Settings Navigation */}
      <div className="w-64 bg-white rounded-lg shadow mr-6 p-4">
        <nav className="space-y-1">
          <NavItem
            icon={<Building size={20} />}
            label="Organization"
            active={activeTab === 'organization'}
            onClick={() => setActiveTab('organization')}
          />
          <NavItem
            icon={<Users size={20} />}
            label="Team Members"
            active={activeTab === 'team'}
            onClick={() => setActiveTab('team')}
          />
          <NavItem
            icon={<Bell size={20} />}
            label="Notifications"
            active={activeTab === 'notifications'}
            onClick={() => setActiveTab('notifications')}
          />
          <NavItem
            icon={<CreditCard size={20} />}
            label="Billing"
            active={activeTab === 'billing'}
            onClick={() => setActiveTab('billing')}
          />
          <NavItem
            icon={<Shield size={20} />}
            label="Security"
            active={activeTab === 'security'}
            onClick={() => setActiveTab('security')}
          />
        </nav>
      </div>

      {/* Settings Content */}
      <div className="flex-1 bg-white rounded-lg shadow p-6">
        {activeTab === 'organization' && <OrganizationSettings />}
        {activeTab === 'team' && <TeamSettings />}
        {activeTab === 'notifications' && <NotificationSettings />}
        {activeTab === 'billing' && <BillingSettings />}
        {activeTab === 'security' && <SecuritySettings />}
      </div>
    </div>
  );
};

// Organization Settings Component
const OrganizationSettings = () => (
  <div className="space-y-6">
    <h2 className="text-lg font-medium text-gray-800">Organization Settings</h2>
    
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Organization Name
        </label>
        <input
          type="text"
          className="w-full p-2 border rounded-lg"
          defaultValue="Medical Clinic"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Contact Email
        </label>
        <input
          type="email"
          className="w-full p-2 border rounded-lg"
          defaultValue="contact@medicalclinic.com"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Phone Number
        </label>
        <input
          type="tel"
          className="w-full p-2 border rounded-lg"
          defaultValue="+1 234 567 8900"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Address
        </label>
        <textarea
          className="w-full p-2 border rounded-lg"
          rows={3}
          defaultValue="123 Medical Plaza, Suite 100&#10;Los Angeles, CA 90025"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Time Zone
        </label>
        <select className="w-full p-2 border rounded-lg">
          <option>Pacific Time (UTC-8)</option>
          <option>Mountain Time (UTC-7)</option>
          <option>Central Time (UTC-6)</option>
          <option>Eastern Time (UTC-5)</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Business Hours
        </label>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Opening Time</label>
            <select className="w-full p-2 border rounded-lg">
              <option>9:00 AM</option>
              <option>8:00 AM</option>
              <option>7:00 AM</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Closing Time</label>
            <select className="w-full p-2 border rounded-lg">
              <option>5:00 PM</option>
              <option>6:00 PM</option>
              <option>7:00 PM</option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <div className="pt-4">
      <Button>
        Save Changes
      </Button>
    </div>
  </div>
);

// Team Settings Component
const TeamSettings = () => {
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [showEditMemberModal, setShowEditMemberModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);

  const teamMembers: TeamMember[] = [
    { 
      name: 'Dr. John Smith', 
      role: 'Doctor', 
      email: 'john.smith@clinic.com',
      status: 'active',
      lastLogin: '2 hours ago',
      permissions: ['view_patients', 'edit_medical_records']
    },
    { 
      name: 'Sarah Johnson', 
      role: 'Nurse', 
      email: 'sarah.j@clinic.com',
      status: 'active',
      lastLogin: '1 hour ago',
      permissions: ['view_patients', 'update_medical_records']
    }
  ];

  const roles: Role[] = [
    {
      id: '1',
      name: 'Administrator',
      permissions: ['all']
    },
    {
      id: '2',
      name: 'Doctor',
      permissions: ['view_patients', 'edit_medical_records', 'schedule_appointments']
    },
    {
      id: '3',
      name: 'Nurse',
      permissions: ['view_patients', 'update_medical_records']
    },
    {
      id: '4',
      name: 'Receptionist',
      permissions: ['view_patients', 'schedule_appointments']
    }
  ];

  const permissions: Permission[] = [
    {
      id: 'view_patients',
      name: 'View Patients',
      description: 'Can view patient profiles and basic information',
      category: 'Patients'
    },
    {
      id: 'edit_medical_records',
      name: 'Edit Medical Records',
      description: 'Can create and modify patient medical records',
      category: 'Medical Records'
    },
    {
      id: 'schedule_appointments',
      name: 'Schedule Appointments',
      description: 'Can create and modify appointments',
      category: 'Appointments'
    },
    {
      id: 'billing_access',
      name: 'Billing Access',
      description: 'Can view and process billing information',
      category: 'Billing'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium text-gray-800">Team Members</h2>
        <div className="flex space-x-3">
          <Button
            variant="outline"
            onClick={() => setShowRoleModal(true)}
          >
            <Lock className="w-4 h-4 mr-2" />
            Manage Roles
          </Button>
          <Button
            onClick={() => setShowAddMemberModal(true)}
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Add Member
          </Button>
        </div>
      </div>

      {/* Team Members List */}
      <div className="space-y-4">
        {teamMembers.map((member, index) => (
          <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-medium">{member.name.charAt(0)}</span>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-800">{member.name}</h4>
                <p className="text-sm text-gray-500">{member.email}</p>
                <div className="flex items-center mt-1 space-x-2">
                  <span className={`px-2 py-0.5 text-xs rounded-full ${
                    member.status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {member.status}
                  </span>
                  <span className="text-xs text-gray-500">Last login: {member.lastLogin}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="px-3 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                {member.role}
              </span>
              <Button
                variant="ghost"
                onClick={() => {
                  setSelectedMember(member);
                  setShowEditMemberModal(true);
                }}
              >
                Edit
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Member Modal */}
      <AddMemberModal 
        isOpen={showAddMemberModal}
        onClose={() => setShowAddMemberModal(false)}
        roles={roles}
      />

      {/* Edit Member Modal */}
      {selectedMember && (
        <EditMemberModal
          isOpen={showEditMemberModal}
          onClose={() => setShowEditMemberModal(false)}
          member={selectedMember}
          roles={roles}
        />
      )}

      {/* Manage Roles Modal */}
      <ManageRolesModal
        isOpen={showRoleModal}
        onClose={() => setShowRoleModal(false)}
        roles={roles}
        permissions={permissions}
      />
    </div>
  );
};

// Add Member Modal Component
const AddMemberModal = ({ 
  isOpen, 
  onClose, 
  roles 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  roles: Role[];
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
    sendInvite: true
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Team Member</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full p-2 border rounded-lg"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full p-2 border rounded-lg"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role
            </label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full p-2 border rounded-lg"
              required
            >
              <option value="">Select a role</option>
              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="sendInvite"
              checked={formData.sendInvite}
              onCheckedChange={(checked) => 
                setFormData({ ...formData, sendInvite: checked as boolean })
              }
            />
            <label 
              htmlFor="sendInvite"
              className="text-sm text-gray-700"
            >
              Send invitation email
            </label>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              Add Member
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// Edit Member Modal Component
const EditMemberModal = ({
  isOpen,
  onClose,
  member,
  roles
}: {
  isOpen: boolean;
  onClose: () => void;
  member: TeamMember;
  roles: Role[];
}) => {
  const [formData, setFormData] = useState({
    name: member.name,
    email: member.email,
    role: member.role,
    status: member.status
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Team Member</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full p-2 border rounded-lg"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full p-2 border rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role
            </label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full p-2 border rounded-lg"
            >
              {roles.map((role) => (
                <option key={role.id} value={role.name}>
                  {role.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full p-2 border rounded-lg"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              variant="destructive"
              onClick={() => {
                // Handle member deletion
                onClose();
              }}
            >
              Delete Member
            </Button>
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={() => {
              // Handle save changes
              onClose();
            }}>
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Manage Roles Modal Component
const ManageRolesModal = ({
  isOpen,
  onClose,
  roles,
  permissions
}: {
  isOpen: boolean;
  onClose: () => void;
  roles: Role[];
  permissions: Permission[];
}) => {
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [showNewRoleForm, setShowNewRoleForm] = useState(false);

  const permissionsByCategory = permissions.reduce((acc, permission) => {
    if (!acc[permission.category]) {
      acc[permission.category] = [];
    }
    acc[permission.category].push(permission);
    return acc;
  }, {} as Record<string, Permission[]>);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Manage Roles & Permissions</DialogTitle>
        </DialogHeader>
        <div className="flex h-[600px]">
          {/* Roles List */}
          <div className="w-64 border-r pr-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium">Roles</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowNewRoleForm(true)}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="space-y-2">
              {roles.map((role) => (
                <button
                  key={role.id}
                  onClick={() => {
                    setSelectedRole(role);
                    setSelectedPermissions(role.permissions);
                    setShowNewRoleForm(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm ${
                    selectedRole?.id === role.id
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {role.name}
                </button>
              ))}
            </div>
          </div>

          {/* Permissions */}
          <div className="flex-1 pl-4 overflow-y-auto">
            {showNewRoleForm ? (
              <NewRoleForm
                onCancel={() => setShowNewRoleForm(false)}
                permissions={permissions}
                permissionsByCategory={permissionsByCategory}
              />
            ) : selectedRole ? (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">{selectedRole.name} Permissions</h3>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      Clone Role
                    </Button>
                    <Button variant="destructive" size="sm">
                      Delete Role
                    </Button>
                  </div>
                </div>

                {Object.entries(permissionsByCategory).map(([category, perms]) => (
                  <div key={category} className="space-y-3">
                    <h4 className="text-sm font-medium text-gray-700">{category}</h4>
                    <div className="space-y-2">
                      {perms.map((permission) => (
                        <div
                          key={permission.id}
                          className="flex items-start space-x-3 p-2 rounded-lg hover:bg-gray-50"
                        >
                          <Checkbox
                            id={permission.id}
                            checked={selectedPermissions.includes(permission.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedPermissions([...selectedPermissions, permission.id]);
                              } else {
                                setSelectedPermissions(
                                  selectedPermissions.filter((id) => id !== permission.id)
                                );
                              }
                            }}
                          />
                          <div className="flex-1">
                            <label
                              htmlFor={permission.id}
                              className="text-sm font-medium text-gray-700"
                            >
                              {permission.name}
                            </label>
                            <p className="text-sm text-gray-500">{permission.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                <div className="pt-4 flex justify-end">
                  <Button onClick={() => {
                    // Handle save permissions
                  }}>
                    Save Changes
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                Select a role to view and edit permissions
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Notifications Settings Component
const NotificationSettings = () => (
  <div className="space-y-6">
    <h2 className="text-lg font-medium text-gray-800">Notification Settings</h2>

    <div className="space-y-4">
      <div className="flex items-center justify-between p-4 border rounded-lg">
        <div>
          <h4 className="text-sm font-medium text-gray-800">Email Notifications</h4>
          <p className="text-sm text-gray-500">Receive notifications for new appointments</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input type="checkbox" className="sr-only peer" defaultChecked />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer 
                          peer-checked:after:translate-x-full peer-checked:after:border-white 
                          after:content-[''] after:absolute after:top-[2px] after:left-[2px] 
                          after:bg-white after:border after:rounded-full after:h-5 after:w-5 
                          after:transition-all peer-checked:bg-blue-600"></div>
        </label>
      </div>

      <div className="flex items-center justify-between p-4 border rounded-lg">
        <div>
          <h4 className="text-sm font-medium text-gray-800">SMS Notifications</h4>
          <p className="text-sm text-gray-500">Receive text messages for urgent updates</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input type="checkbox" className="sr-only peer" />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer 
                          peer-checked:after:translate-x-full peer-checked:after:border-white 
                          after:content-[''] after:absolute after:top-[2px] after:left-[2px] 
                          after:bg-white after:border after:rounded-full after:h-5 after:w-5 
                          after:transition-all peer-checked:bg-blue-600"></div>
        </label>
      </div>

      <div className="flex items-center justify-between p-4 border rounded-lg">
        <div>
          <h4 className="text-sm font-medium text-gray-800">Browser Notifications</h4>
          <p className="text-sm text-gray-500">Show desktop notifications</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input type="checkbox" className="sr-only peer" defaultChecked />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer 
                          peer-checked:after:translate-x-full peer-checked:after:border-white 
                          after:content-[''] after:absolute after:top-[2px] after:left-[2px] 
                          after:bg-white after:border after:rounded-full after:h-5 after:w-5 
                          after:transition-all peer-checked:bg-blue-600"></div>
        </label>
      </div>
    </div>
  </div>
);

// New Role Form Component
const NewRoleForm = ({
  onCancel,
  permissionsByCategory
}: {
  onCancel: () => void;
  permissions: Permission[];
  permissionsByCategory: Record<string, Permission[]>;
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    permissions: [] as string[]
  });

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">Create New Role</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Role Name
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full p-2 border rounded-lg"
            placeholder="e.g., Senior Doctor"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full p-2 border rounded-lg"
            rows={3}
            placeholder="Describe the role's responsibilities..."
          />
        </div>

        <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-700">
            Permissions
          </label>
          {Object.entries(permissionsByCategory).map(([category, perms]) => (
            <div key={category} className="space-y-3">
              <h4 className="text-sm font-medium text-gray-700">{category}</h4>
              <div className="space-y-2">
                {perms.map((permission) => (
                  <div
                    key={permission.id}
                    className="flex items-start space-x-3 p-2 rounded-lg hover:bg-gray-50"
                  >
                    <Checkbox
                      id={`new-${permission.id}`}
                      checked={formData.permissions.includes(permission.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setFormData({
                            ...formData,
                            permissions: [...formData.permissions, permission.id]
                          });
                        } else {
                          setFormData({
                            ...formData,
                            permissions: formData.permissions.filter(
                              (id) => id !== permission.id
                            )
                          });
                        }
                      }}
                    />
                    <div className="flex-1">
                      <label
                        htmlFor={`new-${permission.id}`}
                        className="text-sm font-medium text-gray-700"
                      >
                        {permission.name}
                      </label>
                      <p className="text-sm text-gray-500">{permission.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={() => {
          // Handle create role
        }}>
          Create Role
        </Button>
      </div>
    </div>
  );
};

// Billing Settings Component
const BillingSettings = () => {
  const [showUpdateCardModal, setShowUpdateCardModal] = useState(false);
  const [showChangePlanModal, setShowChangePlanModal] = useState(false);

  const invoices: Invoice[] = [
    { date: 'Jan 1, 2024', amount: '$49.00', status: 'Paid' },
    { date: 'Dec 1, 2023', amount: '$49.00', status: 'Paid' },
    { date: 'Nov 1, 2023', amount: '$49.00', status: 'Paid' }
  ];

  const plans = [
    {
      name: 'Basic',
      price: '$29',
      features: ['Up to 5 team members', 'Basic features', '5GB storage'],
      current: false
    },
    {
      name: 'Professional',
      price: '$49',
      features: ['Up to 10 team members', 'Advanced features', '20GB storage'],
      current: true
    },
    {
      name: 'Enterprise',
      price: '$99',
      features: ['Unlimited team members', 'All features', 'Unlimited storage'],
      current: false
    }
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-medium text-gray-800">Billing Settings</h2>

      {/* Current Plan */}
      <div className="p-4 border rounded-lg">
        <h3 className="text-sm font-medium text-gray-800 mb-2">Current Plan</h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-2xl font-semibold text-gray-800">Professional Plan</p>
            <p className="text-sm text-gray-500">$49/month • Up to 10 team members</p>
          </div>
          <Button 
            variant="outline"
            onClick={() => setShowChangePlanModal(true)}
          >
            Change Plan
          </Button>
        </div>
      </div>

      {/* Payment Method */}
      <div className="p-4 border rounded-lg">
        <h3 className="text-sm font-medium text-gray-800 mb-4">Payment Method</h3>
        <div className="flex items-center space-x-3">
          <div className="p-2 border rounded bg-gray-50">
            <CreditCard className="w-6 h-6 text-gray-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-800">•••• •••• •••• 4242</p>
            <p className="text-sm text-gray-500">Expires 12/24</p>
          </div>
          <Button
            variant="ghost"
            className="ml-auto"
            onClick={() => setShowUpdateCardModal(true)}
          >
            Update
          </Button>
        </div>
      </div>

      {/* Billing History */}
      <div className="p-4 border rounded-lg">
        <h3 className="text-sm font-medium text-gray-800 mb-4">Billing History</h3>
        <div className="space-y-3">
          {invoices.map((invoice, index) => (
            <div key={index} className="flex items-center justify-between py-2">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gray-50 rounded">
                  <CreditCard className="w-4 h-4 text-gray-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">{invoice.date}</p>
                  <p className="text-sm text-gray-500">{invoice.amount}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                  {invoice.status}
                </span>
                <Button variant="ghost" size="sm">
                  Download
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Update Card Modal */}
      <Dialog open={showUpdateCardModal} onOpenChange={setShowUpdateCardModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Payment Method</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Card Number
              </label>
              <input
                type="text"
                placeholder="•••• •••• •••• ••••"
                className="w-full p-2 border rounded-lg"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expiry Date
                </label>
                <input
                  type="text"
                  placeholder="MM/YY"
                  className="w-full p-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CVC
                </label>
                <input
                  type="text"
                  placeholder="•••"
                  className="w-full p-2 border rounded-lg"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setShowUpdateCardModal(false)}>
                Cancel
              </Button>
              <Button>Update Card</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Change Plan Modal */}
      <Dialog open={showChangePlanModal} onOpenChange={setShowChangePlanModal}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Change Plan</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              {plans.map((plan) => (
                <div
                  key={plan.name}
                  className={`p-4 border rounded-lg ${
                    plan.current ? 'border-blue-500 bg-blue-50' : ''
                  }`}
                >
                  <h4 className="font-medium text-gray-900">{plan.name}</h4>
                  <p className="text-2xl font-bold text-gray-900 mt-2">
                    {plan.price}
                    <span className="text-sm font-normal text-gray-500">/month</span>
                  </p>
                  <ul className="mt-4 space-y-2">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center text-sm">
                        <Check className="w-4 h-4 text-green-500 mr-2" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button
                    className="w-full mt-4"
                    variant={plan.current ? 'outline' : 'default'}
                    disabled={plan.current}
                  >
                    {plan.current ? 'Current Plan' : 'Select Plan'}
                  </Button>
                </div>
              ))}
            </div>
            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setShowChangePlanModal(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Security Settings Component
const SecuritySettings = () => {
  const sessions: LoginSession[] = [
    { device: 'Windows PC', location: 'Los Angeles, US', time: '2 minutes ago', status: 'Current session' },
    { device: 'iPhone 12', location: 'Los Angeles, US', time: '1 day ago', status: 'Signed out' },
    { device: 'MacBook Pro', location: 'Los Angeles, US', time: '3 days ago', status: 'Signed out' }
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-medium text-gray-800">Security Settings</h2>

      <div className="space-y-4">
        {/* Password Change Section */}
        <div className="p-4 border rounded-lg">
          <h3 className="text-sm font-medium text-gray-800 mb-4">Change Password</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Current Password
              </label>
              <input
                type="password"
                className="w-full p-2 border rounded-lg"
                placeholder="Enter current password"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                New Password
              </label>
              <input
                type="password"
                className="w-full p-2 border rounded-lg"
                placeholder="Enter new password"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                className="w-full p-2 border rounded-lg"
                placeholder="Confirm new password"
              />
            </div>
            <Button>
              Update Password
            </Button>
          </div>
        </div>

        {/* Two-Factor Authentication */}
        <div className="p-4 border rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-medium text-gray-800">Two-Factor Authentication</h3>
              <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer 
                            peer-checked:after:translate-x-full peer-checked:after:border-white 
                            after:content-[''] after:absolute after:top-[2px] after:left-[2px] 
                            after:bg-white after:border after:rounded-full after:h-5 after:w-5 
                            after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>

        {/* Login History */}
        <div className="p-4 border rounded-lg">
          <h3 className="text-sm font-medium text-gray-800 mb-4">Login History</h3>
          <div className="space-y-3">
            {sessions.map((session, index) => (
              <div key={index} className="flex items-center justify-between py-2">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <Smartphone size={20} className="text-gray-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">{session.device}</p>
                    <p className="text-xs text-gray-500">{session.location} • {session.time}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  session.status === 'Current session' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {session.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* API Access */}
        <div className="p-4 border rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-medium text-gray-800">API Access</h3>
              <p className="text-sm text-gray-500">Manage your API keys and webhooks</p>
            </div>
            <Button variant="outline">
              Generate New Key
            </Button>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Key size={20} className="text-gray-600" />
                <div>
                  <p className="text-sm font-medium text-gray-800">Production API Key</p>
                  <p className="text-xs text-gray-500">Created on Jan 1, 2024</p>
                </div>
              </div>
              <Button variant="ghost" className="text-red-600 hover:text-red-700">
                Revoke
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;