"use client"
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import React from 'react'
import { Switch } from "@/components/ui/switch";
import Link from 'next/link';
import { useRouter } from 'next/navigation';


const addBanner = () => {
    const router = useRouter()

    const handleclick =(e)=>{
        e.preventDefault()
        router.push("/admin/Portal_content")
    }

  return (
    <div>
<form className="max-w-7xl mx-auto p-6 bg-white dark:bg-black   rounded-md shadow-md">
    <div className='flex justify-between items-center mb-6'>
    <div className='text-orange-500 text-2xl bold'>ADD BANNER</div>
     
      {/* <Button color="warning" className="shadow-md">
           <Plus size={20} className="pr-1" />
           Request SKU
          </Button> */}
    </div>
      <div className="grid grid-cols-1 gap-4  ">
        <div className="flex items-center space-x-4">
          <label htmlFor="productName" className="w-1/4 font-medium dark:text-white text-gray-700">Banner Name</label>
          <input
            type="text"
            id="productName"
            name="productName"
            className="flex-grow p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex items-center space-x-4">
          <label htmlFor="categories" className="w-1/4 font-medium dark:text-white  text-gray-700">Image Active/Inactive</label>
                <div>
                <Switch defaultChecked />
              </div>
        </div>
        <div className="flex items-center space-x-4">
          <label htmlFor="fullDescription" className="w-1/4 font-medium dark:text-white text-gray-700">Upload Banner Image</label>
          <div className="flex items-center space-x-4">
          <input
            type="file"
            id="productName"
            name="productName"
            className=" p-3 border  border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
         
        </div>
        </div>
        <div className="flex items-center space-x-4">
         <label htmlFor="sku" className="w-1/4 font-medium dark:text-white text-gray-700">Redirect - to </label>
         <input
            type="text"
            id="productName"
            name="productName"
            className="flex-grow p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

      
      </div>


      
      <div className='flex justify-center'>
      <button type="submit" className="mt-6  px-3 py-2 bg-orange-500 text-white rounded-md focus:outline-none " onClick={handleclick}>Save</button>
      </div>
    </form>

    </div>
  )
}

export default addBanner