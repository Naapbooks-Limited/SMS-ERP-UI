import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import React from 'react';
 
const editreturn = () => {
  return (
    <form className="max-w-7xl mx-auto p-6 bg-white dark:bg-black rounded-md shadow-md">
      <div className='flex justify-between items-center mb-6'>
        <div className='text-orange-500 text-2xl bold'>Edit return request details</div>
        {/* <Button color="warning" className="shadow-md">
          <Plus size={20} className="pr-1" />
          Request SKU
        </Button> */}
      </div>
      <div className="grid grid-cols-1 gap-4">
        <div className="flex items-center space-x-4">
          <label htmlFor="productName" className="w-1/4 font-medium dark:text-white text-gray-700">ID</label>
          <div>1</div>
          {/* <input
            type="text"
            id="productName"
            name="productName"
            className="flex-grow p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          /> */}
        </div>
        <div className="flex items-center space-x-4">
          <label htmlFor="shortDescription" className="w-1/4 font-medium dark:text-white text-gray-700">Order#</label>
          <div>1</div>
        </div>
        <div className="flex items-center space-x-4">
          <label htmlFor="fullDescription" className="w-1/4 font-medium dark:text-white text-gray-700">Customer</label>
          <div>1</div>
        </div>
        <div className="flex items-center space-x-4">
          <label htmlFor="sku" className="w-1/4 font-medium dark:text-white text-gray-700">Product</label>
          <div>1</div>
        </div>


        <div className="flex items-center space-x-4">
          <label htmlFor="categories" className="w-1/4 font-medium dark:text-white text-gray-700">Quantity*</label>
          <input
            type="number"
            id="categories"
            name="categories"
            className="flex-grow p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />


        </div>
        <div className="flex items-center space-x-4">
          <label htmlFor="manufactures" className="w-1/4 font-medium dark:text-white text-gray-700">Quantity returned to stock*</label>
          <input
            type="number"
            id="manufactures"
            name="manufactures"
            className="flex-grow p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex space-x-4">
          <label htmlFor="published" className="w-1/4 font-medium dark:text-white text-gray-700">Return request status*</label>
          <select name="" id=""   className="flex-grow p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value=""></option>
            <option value="">d</option>
            <option value="">d</option>
          </select>
        </div>
        {/* Additional Fields */}
        <div className="flex items-center space-x-4">
          <label htmlFor="productTags" className="w-1/4 font-medium dark:text-white text-gray-700">Reason for return*</label>
          <input
            type="text"
            id="productTags"
            name="productTags"
            className="flex-grow p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex items-center space-x-4">
          <label htmlFor="gtin" className="w-1/4 font-medium dark:text-white text-gray-700">Requested action*</label>
          <input
            type="text"
            id="gtin"
            name="gtin"
            className="flex-grow p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex items-center space-x-4">
          <label htmlFor="productType" className="w-1/4 font-medium dark:text-white text-gray-700">Customer comments</label>
          <input
            type="text"
            id="productType"
            name="productType"
            className="flex-grow p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex items-center space-x-4">
          <label htmlFor="productTemplate" className="w-1/4 font-medium dark:text-white text-gray-700">Staff notes</label>
          <input
            type="text"
            id="productTemplate"
            name="productTemplate"
            className="flex-grow p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex items-center space-x-4">
          <label htmlFor="visibleIndividually" className="w-1/4 font-medium dark:text-white text-gray-700">Date</label>
          <div>24/5/2024 12:57PM </div>
        </div>

</div>


<div className='flex justify-end'>
      <Link href={"/station/sales/return"}>  <button type="submit" className="mt-6 me-3  px-3 py-2 bg-[#11357C] text-white rounded-md focus:outline-none ">Cancel</button> </Link>
      <button type="submit" className="mt-6  px-3 py-2 bg-orange-500 text-white rounded-md focus:outline-none " >Save</button>
      </div>

</form>
);
};
 
export default editreturn;
 