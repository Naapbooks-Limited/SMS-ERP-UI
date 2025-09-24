import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from "@/components/ui/button";

const MailBox = ({ isOpen, onClose, recipientEmail }) => {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  if (!isOpen) return null;

  const handleSend = () => {
    // Here you would typically integrate with your email sending service
    console.log('Sending email', { to: recipientEmail, subject, message });
    // After sending, close the mail box
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold dark:text-black">Send Email</h2>
          <Button onClick={onClose} variant="ghost" size="icon">
            <X size={24} />
          </Button>
        </div>
        <div className="mb-4">
          <label className="block mb-2 dark:text-black">To:</label>
          <input
            type="email"
            value={recipientEmail}
            // readOnly
            className="w-full p-2 border rounded"
          />
        </div>
        <div className="mb-4">
          <label className="block mb-2 dark:text-black">Subject:</label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>
        <div className="mb-4">
          <label className="block mb-2 dark:text-black">Message:</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full p-2 border rounded h-32"
          />
        </div>
        <Button onClick={handleSend} className="w-full">
          Send
        </Button>
      </div>
    </div>
  );
};

export default MailBox;