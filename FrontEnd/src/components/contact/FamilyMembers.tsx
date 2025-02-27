import React from 'react';

interface FamilyMember {
  id: number;
  name: string;
  relationship: string;
  phone: string;
  email: string;
}

interface FamilyMembersProps {
  familyMembers: FamilyMember[];
}

const FamilyMembers: React.FC<FamilyMembersProps> = ({ familyMembers }) => {
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4">Family Members</h2>
      {familyMembers.length === 0 ? (
        <p className="text-gray-500">No family members found.</p>
      ) : (
        <table className="w-full">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-4 text-left font-semibold text-gray-600">Name</th>
              <th className="py-2 px-4 text-left font-semibold text-gray-600">Relationship</th>
              <th className="py-2 px-4 text-left font-semibold text-gray-600">Phone</th>
              <th className="py-2 px-4 text-left font-semibold text-gray-600">Email</th>
            </tr>
          </thead>
          <tbody>
            {familyMembers.map((member) => (
              <tr key={member.id} className="border-t">
                <td className="py-3 px-4">{member.name}</td>
                <td className="py-3 px-4">{member.relationship}</td>
                <td className="py-3 px-4">{member.phone}</td>
                <td className="py-3 px-4">{member.email}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default FamilyMembers;