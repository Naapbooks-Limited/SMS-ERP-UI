import { Button } from '@/components/ui/button';
import { Plus, Trash } from 'lucide-react';
import Link from 'next/link';
import React from 'react'

function addwastage() {
  return (
    <div>
      <div className="text-orange-500 font-semibold text-2xl">ADD WASTAGE</div>

      <div className="pb-10">
        <lable className="inline-block pr-4">Date</lable>
        <input
          className="w-56 p-2 border border-black dark:border-white rounded-sm"
          type="date"
        />
      </div>

      <div className="py-10">
        <div className="grid items-center grid-cols-3">
          <div>
            <lable className="inline-block pr-4">Product</lable>
            <select className="w-56 p-2 border border-black dark:border-white rounded-sm">
              <option>1hnh</option>
            </select>
          </div>
          <div>
            <lable className="inline-block pr-4">Quantity</lable>
            <input className=" p-2 border border-black dark:border-white rounded-sm" />
          </div>
          <div>
            <lable className="inline-block pr-4">Measurement</lable>
            <select className="w-56 p-2 border border-black dark:border-white rounded-sm">
              <option>1hnh</option>
            </select>
          </div>
        </div>
        <div className="flex items-center py-6">
          <lable className="inline-block pr-4">Reason</lable>
          <input className="w-96 p-2 border border-black dark:border-white rounded-sm" />

          <div className="pl-6">
            <Button color="warning" className="shadow-md">
              <Plus size={20} className="pr-1" />
              Add
            </Button>
          </div>
        </div>
      </div>

      <div className="text-orange-500 font-semibold text-2xl">ADDED</div>
      <div>
        <div className="pl-10 mt-4">
          <table>
            <thead>
              <th className="py-3 px-6 text-center">Sr NO</th>
              <th className="py-3 px-6 text-center">Select Product</th>
              <th className="py-3 px-6 text-center">Quantity</th>
              <th className="py-3 px-6 text-center"> Measurement</th>
              <th className="py-3 px-6 text-center">Action</th>
            </thead>
            <tbody>
              <tr>
                <td className="py-3 px-6 text-center">1</td>
                <td className="py-3 px-6 text-center">Blackshirt</td>
                <td className="py-3 px-6 text-center">size:xl color:black</td>
                <td className="py-3 px-6 text-center">1KG</td>
                <td className="py-3 px-6 text-center">
                  <Trash size={15} />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="flex justify-end">
          <div>
            <Link href="/station/Purchase/returns">
              <Button className="text-white bg-blue-950 mr-3 ">Cancle</Button>
            </Link>

            <Button className="text-white bg-orange-400">Save</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default addwastage