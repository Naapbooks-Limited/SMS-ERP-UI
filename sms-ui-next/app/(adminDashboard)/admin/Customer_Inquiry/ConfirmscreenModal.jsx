import React from 'react';

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button'
import { Download, Info } from 'lucide-react';
import { DialogDescription } from '@radix-ui/react-dialog';

const ConfirmscreenModal = (props) => {
  return (
    <>
      <Dialog open={props.showmodal} onOpenChange={props.setShowModal}>
        <DialogContent>
          <DialogHeader>
            {/* <DialogTitle className="font-medium text-xl text-blue-950 ">
              <div className='border-b-2 border-b-slate-300 border-spacing-1'>
                Import from Excel
              </div>
            </DialogTitle> */}
          </DialogHeader>
          <DialogDescription>
            <div className='text-center'>
              <div>
              <Info size={80} strokeWidth={1} color='#18044e' />
                <span className='text-orange-500 text-2xl' >Are you sure? </span>
              </div>
            </div>
          </DialogDescription>
          <DialogFooter className="mt-8">
            <DialogClose asChild>
              {/* <Button type="submit" variant="outline">
                Disagree
              </Button> */}
            </DialogClose>
            <Button color="destructive" >Cancel</Button>
            <Button color="success" >Yes, Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default ConfirmscreenModal;
