import React from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const DeleteDialog = ({ callfor, isOpen, onClose, onDelete, delUrl }) => {
  const handleDelete = async () => {
    try {
      await callfor(delUrl, "POST", null, "Auth");
      onDelete(); // Call onDelete callback to handle success (e.g., refresh data)
      onClose(); // Close the dialog after successful deletion
    } catch (error) {
      console.error("Error deleting item", error);
      // Handle error (e.g., show error message to user)
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
          </DialogHeader>
          <div>Are you sure you want to delete?</div>
          <DialogFooter>
            <Button onClick={handleDelete} color="destructive">
              Confirm
            </Button>
            <Button onClick={onClose}>Cancel</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default DeleteDialog;
