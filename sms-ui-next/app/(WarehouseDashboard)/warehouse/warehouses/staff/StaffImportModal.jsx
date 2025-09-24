import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Upload, UploadCloud } from "lucide-react";
import CallFor from "@/utilities/CallFor";

const StaffImportModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [file, setFile] = useState(null);
  const [importedData, setImportedData] = useState([]);
  const [baseFileUrl, setBaseFileUrl] = useState('');

  const fetchBaseFileUrl = async () => {
    try {
      const response = await CallFor('v2/users/GetBaseFileUrl', 'GET', null, 'Auth');
      setBaseFileUrl(response.data.baseFileUrl);
    } catch (error) {
      console.error('Error fetching base file URL:', error);
    }
  };

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleImport = async () => {
    if (!file) {
      alert('Please select a file to import');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await CallFor('v2/users/ImportStaffData', 'POST', formData, 'Auth');
      setImportedData(response.data);
    } catch (error) {
      console.error('Error importing staff data:', error);
    }
  };

  const handleSubmit = async () => {
    try {
      await CallFor('v2/users/SubmitImportedStaffData', 'POST', JSON.stringify(importedData), 'Auth');
      alert('Staff data submitted successfully');
      setIsOpen(false);
      setFile(null);
      setImportedData([]);
    } catch (error) {
      console.error('Error submitting imported staff data:', error);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button color="warning" className="shadow-md" onClick={fetchBaseFileUrl}>
            <Upload size={20} className="pr-1" />
            Import
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Import Staff Data</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {baseFileUrl && (
              <Button onClick={() => window.open(baseFileUrl, '_blank')}>
                Download Base File
              </Button>
            )}
            <Input type="file" onChange={handleFileChange} />
            <Button onClick={handleImport} disabled={!file}>
              <UploadCloud className="mr-2 h-4 w-4" /> Import File
            </Button>
            {importedData.length > 0 && (
              <div>
                <h3>Imported Data:</h3>
                <ul>
                  {importedData.map((item, index) => (
                    <li key={index}>{JSON.stringify(item)}</li>
                  ))}
                </ul>
                <Button onClick={handleSubmit}>Submit Imported Data</Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default StaffImportModal;