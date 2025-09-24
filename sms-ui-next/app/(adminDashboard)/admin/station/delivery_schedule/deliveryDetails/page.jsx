"use client"
import { Button } from '@/components/ui/button'
import { Undo2 } from 'lucide-react';
import { useRouter } from 'next/navigation'
import React from 'react'

const deliveryDetail = () => {
    const router = useRouter();
    return (
        <>
            <div className=' justify-between flex gap-1 pb-3 '>
                <div className='text-2xl text-orange-400'>
                    New Customers
                </div>
                <Button color="warning" onClick={() => router.push("/admin/station/delivery_schedule")}>
                    <Undo2 className='mr-2' />
                    Back
                </Button>
            </div>

            <div className='ml-16' >
                <div className="flex items-center mb-4">
                    <label className="w-1/6 font-bold mr-2 text-blue-900 dark:text-white">Schedule Name :</label>
                    <p className='text-blue-900 dark:text-white ml-4'>Jay</p>
                </div>
                <div className="flex items-center mb-4">
                    <label className="w-1/6 font-bold mr-2 text-blue-900 dark:text-white">End Time :</label>
                    <p className='text-blue-900 dark:text-white ml-4'>10</p>
                </div>

                <div className="flex items-center mb-4">
                    <label className="w-1/6 font-bold mr-2 text-blue-900 dark:text-white">Start Time :</label>
                    <p className='text-blue-900 dark:text-white ml-4'>Jay@shopmystation.com</p>
                </div>

                <div className="flex items-center mb-4">
                    <label className="w-1/6 font-bold mr-2 text-blue-900 dark:text-white">Days Of Week :</label>
                    <p className='text-blue-900 dark:text-white ml-4'>Monday, Friday, Saturday</p>
                </div>
                <div className="flex items-center mb-4">
                    <label className="w-1/6 font-bold mr-2 text-blue-900 dark:text-white">Is Enabled :</label>
                    <p className='text-blue-900 dark:text-white ml-4'>yes</p>
                </div>
            </div>
        </>
    )
}

export default deliveryDetail