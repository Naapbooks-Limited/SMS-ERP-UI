"use client"
import { Button } from '@/components/ui/button'
import { Undo2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import React from 'react'

const employeeDetail = () => {
    const router = useRouter();

    return (
        <>
            <div className=' justify-between flex gap-1 pb-3 '>
                <div className='text-2xl text-orange-400'>
                    Employee
                </div>
                <Button color="warning" onClick={() => router.push("/admin/Employee")}>
                    <Undo2 className='mr-2' />
                    Back
                </Button>
            </div>

            <div className='grid grid-cols-2 ml-16' >
                <div className="flex items-center mb-4">
                    <label className="w-1/6 font-medium mr-2">First Name*</label>
                    <p className='text-end'>  PAY</p>
                </div>
                <div className="flex items-center mb-4">
                    <label className="w-1/6 font-medium mr-2">Last Name*</label>
                    <p>RMG</p>
                </div>

                <div className="flex items-center mb-4">
                    <label className="w-1/6 font-medium mr-2">Role*</label>
                    <p>Manager</p>
                </div>

                <div className="flex items-center mb-4">
                    <label className="w-1/6 font-medium mr-2">Email ID*</label>
                    <p>anc@gmail.com</p>
                </div>

                <div className="flex items-center mb-4">
                    <label className="w-1/6 font-medium mr-2">Mobile No*</label>
                    <p>98168267235</p>
                </div>

                <div className="flex items-center mb-4">
                    <label className="w-1/6 font-medium mr-2">User ID*</label>
                    <p>pay12542</p>
                </div>

                <div className="flex items-center mb-4">
                    <label className="w-1/6 font-medium mr-2">Password*</label>
                    <p>123456</p>
                </div>

                <div className="flex items-center mb-4">
                    <label className="w-1/6 font-medium mr-2">Confirm Password*</label>
                    <p>123456</p>
                </div>

                <div className="flex items-center mb-2">
                    <label className="w-1/6 font-medium mr-2">isActive</label>
                    <div>
                        <label class="inline-flex items-center cursor-pointer">
                            <input type="checkbox" class="sr-only peer" />
                            <div class="relative w-11 h-6 bg-orange-600-200 rounded-full peer border border-black peer-focus:ring-4 peer-focus:ring-blue-950 dark:peer-focus:ring-blue-950-800 dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-blue-950 after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-orange-600 after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-blue-950 peer-checked:bg-blue-950"></div>
                        </label>
                    </div>
                </div>
            </div>
            <div>
            <div>
                    <div className='text-2xl text-orange-400 m-4'>Roles & Rights</div>

                    <div>
                        <table>
                            <tbody>
                                <div className='grid grid-cols-6 gap-16'>
                                    <th></th>
                                    <th>All</th>
                                    <th>Create</th>
                                    <th>Read</th>
                                    <th>Update</th>
                                    <th>Delete</th>

                                </div>
                                <div>
                                    <tr className='grid grid-cols-6 gap-16'>
                                        <td className='justify-center'>Station</td>
                                        <td className='justify-center'><input className="ml-5 w-[25px] h-[25px]" type='checkbox' /></td>
                                        <td className='justify-center'><input className="ml-5 w-[25px] h-[25px]" type='checkbox' /></td>
                                        <td className='justify-center'><input className="ml-5 w-[25px] h-[25px]" type='checkbox' /></td>
                                        <td className='justify-center'><input className="ml-5 w-[25px] h-[25px]" type='checkbox' /></td>
                                        <td className='justify-center'><input className="ml-5 w-[25px] h-[25px]" type='checkbox' /></td>
                                    </tr>
                                    <tr className='grid grid-cols-6 gap-16'>
                                        <td>Sales</td>
                                        <td className='justify-center'><input className="ml-5 w-[25px] h-[25px]" type='checkbox' /></td>
                                        <td className='justify-center'><input className="ml-5 w-[25px] h-[25px]" type='checkbox' /></td>
                                        <td className='justify-center'><input className="ml-5 w-[25px] h-[25px]" type='checkbox' /></td>
                                        <td className='justify-center'><input className="ml-5 w-[25px] h-[25px]" type='checkbox' /></td>
                                        <td className='justify-center'><input className="ml-5 w-[25px] h-[25px]" type='checkbox' /></td>
                                    </tr>
                                    <tr className='grid grid-cols-6 gap-16'>
                                        <td>Purchase</td>
                                        <td className='justify-center'><input className="ml-5 w-[25px] h-[25px]" type='checkbox' /></td>
                                        <td className='justify-center'><input className="ml-5 w-[25px] h-[25px]" type='checkbox' /></td>
                                        <td className='justify-center'><input className="ml-5 w-[25px] h-[25px]" type='checkbox' /></td>
                                        <td className='justify-center'><input className="ml-5 w-[25px] h-[25px]" type='checkbox' /></td>
                                        <td className='justify-center'><input className="ml-5 w-[25px] h-[25px]" type='checkbox' /></td>
                                    </tr>
                                    <tr className='grid grid-cols-6 gap-16'>
                                        <td>Catalog</td>
                                        <td className='justify-center'><input className="ml-5 w-[25px] h-[25px]" type='checkbox' /></td>
                                        <td className='justify-center'><input className="ml-5 w-[25px] h-[25px]" type='checkbox' /></td>
                                        <td className='justify-center'><input className="ml-5 w-[25px] h-[25px]" type='checkbox' /></td>
                                        <td className='justify-center'><input className="ml-5 w-[25px] h-[25px]" type='checkbox' /></td>
                                        <td className='justify-center'><input className="ml-5 w-[25px] h-[25px]" type='checkbox' /></td>
                                    </tr>
                                </div>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </>
    )
}

export default employeeDetail