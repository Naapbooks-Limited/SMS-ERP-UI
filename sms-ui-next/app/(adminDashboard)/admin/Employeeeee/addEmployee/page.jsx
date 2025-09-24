"use client"
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation'
import React from 'react'

const page = () => {
    const router = useRouter();
    const handlecancelBtn = (e) => {
        e.preventDefault();
        router.push('/admin/Employee')
    }
    return (
        <>
            <div className='text-2xl text-orange-400'>Employee</div>
            <form class="space-y-4">
                <div className='grid grid-cols-2' >
                    <div className="flex items-center mb-4">
                        <label className="w-1/6 font-medium mr-2">First Name*</label>
                        <input
                            type="text"
                            className="border border-gray-300 px-4 py-2 rounded w-3/4"
                            placeholder="Enter First Name"
                        />
                    </div>
                    <div className="flex items-center mb-4">
                        <label className="w-1/6 font-medium mr-2">Last Name*</label>
                        <input
                            type="text"
                            className="border border-gray-300 px-4 py-2 rounded w-3/4"
                            placeholder="Enter Last Name"
                        />
                    </div>

                    <div className="flex items-center mb-4">
                        <label className="w-1/6 font-medium mr-2">Role*</label>
                        <input
                            type="text"
                            className="border border-gray-300 px-4 py-2 rounded w-3/4"
                            placeholder="Enter Role"
                        />
                    </div>

                    <div className="flex items-center mb-4">
                        <label className="w-1/6 font-medium mr-2">Email ID*</label>
                        <input
                            type="email"
                            className="border border-gray-300 px-4 py-2 rounded w-3/4"
                            placeholder="Enter Email ID*"
                        />
                    </div>

                    <div className="flex items-center mb-4">
                        <label className="w-1/6 font-medium mr-2">Mobile No*</label>
                        <input
                            type="text"
                            className="border border-gray-300 px-4 py-2 rounded w-3/4"
                            placeholder="Enter Mobile No "
                        />
                    </div>

                    <div className="flex items-center mb-4">
                        <label className="w-1/6 font-medium mr-2">User ID*</label>
                        <input
                            type="text"
                            className="border border-gray-300 px-4 py-2 rounded w-3/4"
                            placeholder="Enter Mobile No "
                        />
                    </div>

                    <div className="flex items-center mb-4">
                        <label className="w-1/6 font-medium mr-2">Password*</label>
                        <input
                            type="password"
                            className="border border-gray-300 px-4 py-2 rounded w-3/4"
                            placeholder="Enter password "
                        />
                    </div>

                    <div className="flex items-center mb-4">
                        <label className="w-1/6 font-medium mr-2">Confirm Password*</label>
                        <input
                            type="password"
                            className="border border-gray-300 px-4 py-2 rounded w-3/4"
                            placeholder="Confirm Password"
                        />
                    </div>

                    <div className="flex items-center mb-2">
                        <label className="w-1/6 font-medium mr-2">isActive</label>
                        <div>
                            <label class="inline-flex items-center cursor-pointer">
                                <input type="checkbox" class="sr-only peer" />
                                <div class="relative w-11 h-6 bg-orange-600-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-950 border border-black dark:peer-focus:ring-blue-950-800 dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-blue-950 after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-orange-600 after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-blue-950 peer-checked:bg-blue-950"></div>
                            </label>
                        </div>
                    </div>


                </div>

                <div>
                    <div className='text-2xl text-orange-400'>Roles & Rights</div>

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

                <div className='flex justify-end'>
                    <Button className="text-white bg-blue-950 mr-2" onClick={handlecancelBtn}>
                        Cancel
                    </Button>
                    <Button className="text-white bg-orange-400">Save</Button>
                </div>
            </form>
        </>
    )
}

export default page