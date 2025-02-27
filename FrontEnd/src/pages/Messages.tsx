import React, { useState } from 'react';
import {
  Search,
  Send,
  Plus,
  Filter,
  Mail,
  Trash2,
  Archive,
  Star,
  Flag,
  MoreVertical,
  Paperclip,
  X
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface Message {
  id: number;
  sender: string;
  subject: string;
  content: string;
  timestamp: string;
  isStarred?: boolean;
  isFlagged?: boolean;
  status: 'read' | 'unread';
  category: 'inbox' | 'sent' | 'archived';
}

interface Attachment {
  name: string;
  size: string;
  type: string;
}

const MessagesContent: React.FC = () => {
  const [messages] = useState<Message[]>([
    {
      id: 1,
      sender: 'John Doe',
      subject: 'Appointment Reminder',
      content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
      timestamp: '2024-02-10 10:30 AM',
      isStarred: true,
      status: 'unread',
      category: 'inbox'
    },
    {
      id: 2,
      sender: 'Jane Smith',
      subject: 'Prescription Refill',
      content: 'Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
      timestamp: '2024-02-09 02:45 PM',
      isFlagged: true,
      status: 'read',
      category: 'inbox'
    },
  ]);

  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [showComposeModal, setShowComposeModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Message['category']>('inbox');
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <div className="w-64 bg-gray-50 p-4 border-r">
        <Button
          onClick={() => setShowComposeModal(true)}
          className="w-full mb-4 bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Message
        </Button>

        <nav className="space-y-1">
          <CategoryButton
            label="Inbox"
            icon={<Mail className="w-4 h-4" />}
            count={3}
            isActive={selectedCategory === 'inbox'}
            onClick={() => setSelectedCategory('inbox')}
          />
          <CategoryButton
            label="Sent"
            icon={<Send className="w-4 h-4" />}
            isActive={selectedCategory === 'sent'}
            onClick={() => setSelectedCategory('sent')}
          />
          <CategoryButton
            label="Archived"
            icon={<Archive className="w-4 h-4" />}
            isActive={selectedCategory === 'archived'}
            onClick={() => setSelectedCategory('archived')}
          />
        </nav>
      </div>

      {/* Message List */}
      <div className="w-80 bg-white border-r overflow-y-auto">
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search messages"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center mt-4 space-x-2">
            <button className="flex items-center px-3 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg">
              <Filter size={16} className="mr-2" />
              Filter
            </button>
            <select className="px-3 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg border-none">
              <option>All Messages</option>
              <option>Unread</option>
              <option>Flagged</option>
              <option>Starred</option>
            </select>
          </div>
        </div>

        <div className="divide-y">
          {messages
            .filter(message => message.category === selectedCategory)
            .map((message) => (
              <MessageListItem
                key={message.id}
                message={message}
                isSelected={selectedMessage?.id === message.id}
                onClick={() => setSelectedMessage(message)}
              />
            ))}
        </div>
      </div>

      {/* Message Content */}
      <div className="flex-1 bg-white overflow-y-auto">
        {selectedMessage ? (
          <MessageDetail
            message={selectedMessage}
            onReply={() => setShowComposeModal(true)}
            onDelete={() => {
              // Handle delete
              setSelectedMessage(null);
            }}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            Select a message to view its content
          </div>
        )}
      </div>

      {/* Compose Modal */}
      <ComposeMessageModal
        isOpen={showComposeModal}
        onClose={() => setShowComposeModal(false)}
        replyTo={selectedMessage}
      />
    </div>
  );
};

const CategoryButton: React.FC<{
  label: string;
  icon: React.ReactNode;
  count?: number;
  isActive: boolean;
  onClick: () => void;
}> = ({ label, icon, count, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center justify-between w-full px-3 py-2 text-sm rounded-lg ${
      isActive
        ? 'bg-blue-50 text-blue-600'
        : 'text-gray-600 hover:bg-gray-100'
    }`}
  >
    <div className="flex items-center">
      {icon}
      <span className="ml-2">{label}</span>
    </div>
    {count !== undefined && (
      <span className="bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full text-xs">
        {count}
      </span>
    )}
  </button>
);

const MessageListItem: React.FC<{
  message: Message;
  isSelected: boolean;
  onClick: () => void;
}> = ({ message, isSelected, onClick }) => (
  <div
    className={`p-4 cursor-pointer ${
      isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'
    } ${message.status === 'unread' ? 'font-semibold' : ''}`}
    onClick={onClick}
  >
    <div className="flex justify-between items-center mb-1">
      <h3 className="text-sm text-gray-900">{message.sender}</h3>
      <div className="flex items-center space-x-2">
        {message.isStarred && <Star className="w-4 h-4 text-yellow-400 fill-current" />}
        {message.isFlagged && <Flag className="w-4 h-4 text-red-500" />}
        <span className="text-xs text-gray-500">{message.timestamp}</span>
      </div>
    </div>
    <p className="text-sm text-gray-600 truncate">{message.subject}</p>
  </div>
);

const MessageDetail: React.FC<{
  message: Message;
  onReply: () => void;
  onDelete: () => void;
}> = ({ message, onReply, onDelete }) => (
  <div className="h-full flex flex-col">
    <div className="p-6 border-b">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">{message.subject}</h2>
          <div className="mt-1 text-sm text-gray-600">
            From: <span className="font-medium">{message.sender}</span>
          </div>
          <div className="text-sm text-gray-500">{message.timestamp}</div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={onReply}
            className="px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            Reply
          </button>
          <button
            onClick={onDelete}
            className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
          >
            <Trash2 className="w-5 h-5" />
          </button>
          <button className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100">
            <Archive className="w-5 h-5" />
          </button>
          <button className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
    <div className="flex-1 p-6 overflow-y-auto">
      <div className="prose max-w-none">
        <p className="text-gray-800 whitespace-pre-wrap">{message.content}</p>
      </div>
    </div>
  </div>
);

const ComposeMessageModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  replyTo?: Message | null;
}> = ({ isOpen, onClose, replyTo }) => {
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  
  const handleAttachmentAdd = () => {
    // Simulate adding an attachment
    const newAttachment = {
      name: 'document.pdf',
      size: '2.4 MB',
      type: 'application/pdf'
    };
    setAttachments([...attachments, newAttachment]);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{replyTo ? 'Reply to Message' : 'New Message'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <input
              type="text"
              placeholder="To:"
              defaultValue={replyTo?.sender}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <input
              type="text"
              placeholder="Subject:"
              defaultValue={replyTo ? `Re: ${replyTo.subject}` : ''}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <textarea
              placeholder="Write your message..."
              rows={8}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Attachments */}
          {attachments.length > 0 && (
            <div className="space-y-2">
              {attachments.map((attachment, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center">
                    <Paperclip className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-600">{attachment.name}</span>
                    <span className="text-xs text-gray-400 ml-2">({attachment.size})</span>
                  </div>
                  <button
                    onClick={() => setAttachments(attachments.filter((_, i) => i !== index))}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-between items-center">
            <div className="flex space-x-2">
              <Button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Send Message
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleAttachmentAdd}
              >
                <Paperclip className="w-4 h-4 mr-2" />
                Attach File
              </Button>
            </div>
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MessagesContent;