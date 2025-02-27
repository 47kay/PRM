import React, { useState } from 'react';
import { Phone, Mail, Calendar, Clock, FileText, } from 'lucide-react';
import { Contact } from '../../utils/types';

interface ContactProfileProps {
  contact: Contact;
}

const ContactProfile: React.FC<ContactProfileProps> = ({ contact }) => {
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'appointments', label: 'Appointments' },
    { id: 'documents', label: 'Documents' },
    { id: 'family', label: 'Family' }
  ];

  return (
    <div className="h-full bg-white">
      {/* Contact Header */}
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
          </div>
        </div>

        {/* Profile Tabs */}
        <div className="flex space-x-6 mt-6">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-2 text-sm font-medium border-b-2 ${
                activeTab === tab.id
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
            {/* Quick Stats */}
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

            {/* Medical Information */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-800 mb-3">Medical Information</h3>
              <div className="space-y-2">
                <InfoItem label="Blood Type" value="A+" />
                <InfoItem label="Allergies" value="None" />
                <InfoItem label="Medical Conditions" value="None reported" />
              </div>
            </div>

            {/* Notes */}
            <div>
              <h3 className="text-sm font-medium text-gray-800 mb-3">Notes</h3>
              <textarea
                className="w-full p-3 border rounded-lg h-24"
                placeholder="Add a note..."
              />
            </div>
          </div>
        )}

        {activeTab === 'appointments' && (
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-800 mb-3">Upcoming Appointments</h3>
            {/* Add appointment list here */}
          </div>
        )}

        {activeTab === 'documents' && (
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-800 mb-3">Documents</h3>
            {/* Add documents list here */}
          </div>
        )}

        {activeTab === 'family' && (
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-800 mb-3">Family Members</h3>
            {/* Add family members list here */}
          </div>
        )}
      </div>
    </div>
  );
};

// Stat Card Component
const StatCard = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
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

// Info Item Component
const InfoItem = ({ label, value }: { label: string; value: string }) => (
  <div className="flex justify-between">
    <span className="text-sm text-gray-500">{label}</span>
    <span className="text-sm text-gray-800">{value}</span>
  </div>
);

export default ContactProfile;