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

const DeleteCommonComp = (props) => {
    return (
        <>
            <Dialog open={props.showmodal} onOpenChange={props.setShowModal}>
                <DialogContent>
                    <DialogDescription>
                        <div className=''>
                            <div>
                                <Info size={80} strokeWidth={1} color='#18044e' />
                            </div>
                            <span className='text-orange-500 text-2xl' >Are you sure? </span>
                        </div>
                    </DialogDescription>
                    <DialogFooter className="mt-8">
                        {/* <DialogClose asChild>
                        </DialogClose> */}
                        <Button color="destructive" onClick={() => props.setShowModal(false)}>No, Cancel</Button>
                        <Button color="warning" onClick={props.onClickYesBtn} >Yes, Cancel</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}

export default DeleteCommonComp;
