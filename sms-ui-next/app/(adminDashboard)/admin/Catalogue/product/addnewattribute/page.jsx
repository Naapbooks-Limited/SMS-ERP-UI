import Link from 'next/link';
import React from 'react'

function page() {
  return (
    <div>
      <div className="flex justify-end">
        <Link href={"/admin/Catalogue/product/productadd"}>
          {" "}
          <button
            type="submit"
            className="mt-6 me-3  px-3 py-2 bg-[#11357C] text-white rounded-md focus:outline-none "
          >
            Cancel
          </button>{" "}
        </Link>
        <button
          type="submit"
          className="mt-6  px-3 py-2 bg-orange-500 text-white rounded-md focus:outline-none "
        >
          Save
        </button>
      </div>
      <div className="p-6 rounded-lg shadow-md space-y-4">
        <h2 className="text-2xl font-bold mb-4 text-orange-500">
          Add a new attribute
        </h2>
        <div className="flex items-center space-x-4">
          <label className="w-1/4 text-sm font-medium ">Attribute</label>
          <select className="w-3/4 mt-1 block p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:border-blue-300">
            <option>1</option>
          </select>
        </div>
        <div className="flex items-center space-x-4">
          <label className="w-1/4 text-sm font-medium ">Text prompt</label>
          <input
            type="text"
            className="w-3/4 mt-1 block p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:border-blue-300"
          />
        </div>
        <div className="flex items-center space-x-4">
          <label className="w-1/4 text-sm font-medium ">Is Required</label>
          <input type="checkbox" />
        </div>

        <div className="flex items-center space-x-4">
          <label className="w-1/4 text-sm font-medium ">Control type</label>
          <select className="w-3/4 mt-1 block p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:border-blue-300">
            <option>1</option>
          </select>
        </div>
        <div className="flex items-center space-x-4">
          <label className="w-1/4 text-sm font-medium ">Display order</label>
          <input
            type="number"
            className="w-1/4 mt-1 block p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:border-blue-300"
          />
        </div>
      </div>

      <div className="p-6 rounded-lg shadow-md space-y-4">
        <h5 className="text-lg font-bold mb-4 text-orange-500">Value</h5>
        <div>
          <h1>
            {" "}
            You need to save the product attribute before you can add values for
            this product attribute page.
          </h1>
        </div>
      </div>
    </div>
  );
}

export default page