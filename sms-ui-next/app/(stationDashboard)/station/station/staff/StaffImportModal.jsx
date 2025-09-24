import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, X, FileText, Download } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";

const ImportModal = ({
  title = "Import Data",
  acceptedFileTypes = ".csv,.xlsx,.xls",
  sampleFileName = "import_sample.csv",
  sampleFileContent = "",
  onImport,
  buttonText = "Import",
  buttonIcon = <Upload size={20} className="mr-2" />,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [file, setFile] = useState(null);
  const [importStatus, setImportStatus] = useState(null);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    setFile(selectedFile);
  };

  const handleImport = async () => {
    if (!file) return;

    setImportStatus('importing');
    try {
      await onImport(file);
      setImportStatus('success');
    } catch (error) {
      setImportStatus('error');
      console.error('Import failed:', error);
    }
  };

  const resetModal = () => {
    setFile(null);
    setImportStatus(null);
  };

  const handleDownloadSample = () => {
    const blob = new Blob([sampleFileContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = sampleFileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <Button onClick={() => setIsOpen(true)} className="shadow-md mr-1">
        {buttonIcon}
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
            {sampleFileContent && (
              <Button variant="outline" onClick={handleDownloadSample} className="w-full">
                <Download size={20} className="mr-2" />
                Download Sample File
              </Button>
            )}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="file" className="text-right">
                File
              </Label>
              <div className="col-span-3">
                <Input id="file" type="file" onChange={handleFileChange} accept={acceptedFileTypes} />
              </div>
            </div>
            {file && (
              <div className="flex items-center justify-between bg-gray-100 p-2 rounded">
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