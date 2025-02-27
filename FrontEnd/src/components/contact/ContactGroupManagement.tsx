
// src/components/contact/GroupManagement.tsx
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Contact } from '../../utils/types';
import { Plus } from 'lucide-react';


interface Group {
  id: number;
  name: string;
  description: string;
  members: Contact[];
}

interface GroupManagementProps {
  contacts: Contact[];
}

export const GroupManagement = ({ contacts }: GroupManagementProps) => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedContacts, setSelectedContacts] = useState<number[]>([]);
  const [newGroup, setNewGroup] = useState({ name: '', description: '' });

  const handleCreateGroup = (e: React.FormEvent) => {
    e.preventDefault();
    const groupMembers = contacts.filter(contact => selectedContacts.includes(contact.id));
    setGroups([
      ...groups,
      {
        id: groups.length + 1,
        name: newGroup.name,
        description: newGroup.description,
        members: groupMembers
      }
    ]);
    setIsCreateOpen(false);
    setNewGroup({ name: '', description: '' });
    setSelectedContacts([]);
  };

  return (
    <div>
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="mb-4">
            <Plus size={16} className="mr-2" />
            Create Group
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create New Group</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateGroup} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="groupName">Group Name</Label>
              <Input
                id="groupName"
                value={newGroup.name}
                onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={newGroup.description}
                onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Select Members</Label>
              <div className="max-h-48 overflow-y-auto space-y-2">
                {contacts.map((contact) => (
                  <div key={contact.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`contact-${contact.id}`}
                      checked={selectedContacts.includes(contact.id)}
                      onCheckedChange={(checked) => {
                        setSelectedContacts(
                          checked
                            ? [...selectedContacts, contact.id]
                            : selectedContacts.filter(id => id !== contact.id)
                        );
                      }}
                    />
                    <Label htmlFor={`contact-${contact.id}`}>{contact.name}</Label>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Create Group</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Group List */}
      <div className="space-y-4">
        {groups.map((group) => (
          <div key={group.id} className="border rounded-lg p-4">
            <h3 className="text-lg font-medium">{group.name}</h3>
            <p className="text-sm text-gray-500">{group.description}</p>
            <div className="mt-2">
              <h4 className="text-sm font-medium">Members ({group.members.length})</h4>
              <div className="mt-1 flex flex-wrap gap-2">
                {group.members.map((member) => (
                  <span key={member.id} className="px-2 py-1 bg-gray-100 rounded-full text-sm">
                    {member.name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};