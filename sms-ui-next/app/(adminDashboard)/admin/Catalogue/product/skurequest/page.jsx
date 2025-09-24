import Link from 'next/link';
import React from 'react'

export default function page() {
  return (
    <div>
      <div className="p-6 rounded-lg shadow-md space-y-4">
        <h2 className="text-xl font-bold mb-4 text-orange-500">
          SKU attribute
        </h2>
        <div className="flex items-center space-x-4">
          <label className="w-1/4 text-sm font-medium ">Name</label>
          <input
            type="text"
            className="w-3/4 mt-1 block p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:border-blue-300"
          />
        </div>

        <div className="flex items-center space-x-4">
          <label className="w-1/4 text-sm font-medium ">Images</label>
        </div>

        <div className="flex items-center space-x-4">
          <label className="w-1/4 text-sm font-medium ">Category</label>
          <input
            type="text"
            className="w-3/4 mt-1 block p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:border-blue-300"
          />
        </div>

        <div className="flex items-center space-x-4">
          <label className="w-1/4 text-sm font-medium ">Description</label>
          <input
            type="text"
            className="w-3/4 mt-1 block p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:border-blue-300"
          />
        </div>

        <div className="flex items-center space-x-4">
          <label className="w-1/4 text-sm font-medium ">Keywords</label>
          <input
            type="text"
            className="w-3/4 mt-1 block p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:border-blue-300"
          />
        </div>

        <div className="flex items-center space-x-4">
          <label className="w-1/4 text-sm font-medium ">Price</label>
          <input
            type="text"
            className="w-3/4 mt-1 block p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:border-blue-300"
          />
        </div>

        <div className="flex items-center space-x-4">
          <label className="w-1/4 text-sm font-medium ">Specification</label>
          <input
            type="text"
            className="w-3/4 mt-1 block p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:border-blue-300"
          />
        </div>
      </div>
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
          Send SKU Request
        </button>
      </div>
    </div>
  );
}
