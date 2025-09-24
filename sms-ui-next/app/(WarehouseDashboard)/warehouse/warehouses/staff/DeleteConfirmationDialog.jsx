import React from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const DeleteConfirmationDialog = ({ open, onClose, onConfirm, userName }) => {
  const handleConfirm = () => {
    onConfirm(); // Call the onConfirm function passed from parent (staff.jsx)
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm Delete</DialogTitle>
        </DialogHeader>
        <div>Are you sure you want to delete {userName}?</div>
        <DialogFooter>
          <Button onClick={handleConfirm} color="destructive">
            Confirm
          </Button>
          <Button onClick={onClose}>Cancel</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteConfirmationDialog;
