import React, { useState } from 'react';
import axios from 'axios';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, X, FileText, Download } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Import } from "lucide-react";

const ImportModal = ({
  title = "Import Data",
  acceptedFileTypes = ".csv,.xlsx,.xls",
  sampleFileUrl = "",
  importUrl = "",
  onImportSuccess,
  buttonText = "Import",
  buttonIcon = <Upload size={20} className="mr-2" />,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [file, setFile] = useState(null);
  const [importStatus, setImportStatus] = useState(null);
  const [downloadStatus, setDownloadStatus] = useState(null);


    const getToken = () => {
    const user = sessionStorage.getItem("token") || null;
    const data = user ? JSON.parse(user) : null;
    return data ? data : null;
  };
  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    setFile(selectedFile);
  };

  const handleImport = async () => {
    if (!file) return;

    setImportStatus('importing');
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post(importUrl, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
           Authorization: `Bearer ${getToken()}`,
          // Add any other required headers here, e.g., authorization
        },
      });


      console.log(response,"response")
      setImportStatus('success');
      // if (response) {
      //   onImportSuccess(response.data);
      // }
    } catch (error) {
      setImportStatus('error');
      console.error('Import failed:', error);
    }
  };

  const resetModal = () => {
    setFile(null);
    setImportStatus(null);
    setDownloadStatus(null);
  };

  const handleDownloadSample = async () => {
    setDownloadStatus('downloading');
    try {
      const response = await axios({
        url: sampleFileUrl,
        method: 'GET',
       responseType: 'blob',
  headers: {
    Authorization: `Bearer ${getToken()}`, // Add token here
  },
        // Add any required headers here, e.g., authorization
      });

      const contentDisposition = response.headers['content-disposition'];
      let filename = 'sample_file.xlsx';
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?(.+)"?/i);
        if (filenameMatch && filenameMatch.length === 2) {
          filename = filenameMatch[1];
        }
      }

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setDownloadStatus('success');
    } catch (error) {
      console.error('Download failed:', error);
      setDownloadStatus('error');
    }
  };

  return (
    <>
      <Button onClick={() => setIsOpen(true)} className="shadow-md mr-1 bg-success hover:bg-success">
        <Import size={20} className="mr-2"/>
        {buttonText}
      </Button>

      <Dialog open={isOpen} onOpenChange={(open) => {
        setIsOpen(open);
        if (!open) resetModal();
      }}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {sampleFileUrl && (
              <Button 
                variant="outline" 
                onClick={handleDownloadSample} 
                className="w-full"
                disabled={downloadStatus === 'downloading'}
              >
                <Download size={20} className="mr-2" />
                {downloadStatus === 'downloading' ? 'Downloading...' : 'Download Sample File'}
              </Button>
            )}
            {downloadStatus === 'error' && (
              <Alert variant="destructive">
                <AlertDescription>
                  Error downloading sample file. Please try again.
                </AlertDescription>
              </Alert>
            )}
            <div className="grid items-center gap-4">
              
              <div className="">
                <Input id="file" type="file" onChange={handleFileChange} accept={acceptedFileTypes} />
              </div>
            </div>
            {file && (
              <div className="flex items-center justify-between bg-gray-100 text-black p-2 rounded">
                <div className="flex items-center">
                  <FileText size={20} className="mr-2" />
                  <span className="truncate">{file.name}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setFile(null)}
                >
                  <X size={16} />
                </Button>
              </div>
            )}
          </div>
          {importStatus && (
            <Alert variant={importStatus === 'success' ? 'default' : 'destructive'}>
              <AlertDescription>
                {importStatus === 'importing' && 'Importing data...'}
                {importStatus === 'success' && 'Data imported successfully!'}
                {importStatus === 'error' && 'Error importing data. Please try again.'}
              </AlertDescription>
            </Alert>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleImport} disabled={!file || importStatus === 'importing'}>
              {importStatus === 'importing' ? 'Importing...' : 'Import'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ImportModal;