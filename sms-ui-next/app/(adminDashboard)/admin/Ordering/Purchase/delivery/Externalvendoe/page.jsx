import { Button } from "@/components/ui/button";
import { Undo } from "lucide-react";
import Link from "next/link";
import React from "react";

function viewdelievery() {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div className="text-orange-500 text-xl font-semibold p-2">
          EXTERNAL warehouse STOCK UPDATE
        </div>
        <Link href="/station/Purchase/delievery">
          <Button color="warning" className="shadow-md">
            <Undo size={20} className="pr-1" />
            Back
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-3 p-3">
        <div className="pb-3">
          <label className="font-bold inline-block w-32 ">DATE</label>
          <input
            type="date"
            className="border border-black dark:border-white bg-transparent w-2/4 text-center rounded-sm"
          />
        </div>
        <div>
          <label className="font-bold inline-block w-32 ">PO No</label>
          <select className="border border-black dark:border-white bg-transparent w-1/2 text-center rounded-sm">
            <option></option>
          </select>
          {/* <input
            type="number"
            className="border border-black dark:border-white bg-transparent w-1/2 text-center rounded-sm"
          /> */}
        </div>

        <div>
          <label className="font-bold inline-block w-32 ">Supplier Name</label>
          <input
            type="text"
            className="border border-black dark:border-white bg-transparent w-2/4 text-center rounded-sm"
          />
        </div>
      </div>
      <div>
        <div className="py-8 mt-10 mb-7  border-t-2 border-black dark:border-white border-dashed max-w-4xl">
          <table className=" border-black dark:border-white">
            <thead>
              <th className="py-3 px-6 text-center">#</th>
              <th className="py-3 px-6 text-center">Select Product</th>
              <th className="py-3 px-6 text-center">Attributes</th>
              <th className="py-3 px-6 text-center"> Quantity</th>
              <th className="py-3 px-6 text-center">Total Accepted</th>
              <th className="py-3 px-6 text-center">Total Returned</th>
              <th className="py-3 px-6 text-center">Total Waste</th>
            </thead>
            <tbody>
              <tr>
                <td className="py-3 px-6 text-center">1</td>
                <td className="py-3 px-6 text-center">Blackshirt</td>
                <td className="py-3 px-6 text-center">size:xl color:black</td>
                <td className="py-3 px-6 text-center">05</td>
                <td className="py-3 px-6 text-center">
                  <input
                    type="number"
                    className="border border-black dark:border-white bg-transparent w-1/2 text-center rounded-sm"
                  />
                </td>
                <td className="py-3 px-6 text-center">
                  <input
                    type="number"
                    className=" rounded-sm border border-black dark:border-white bg-transparent w-1/2 text-center"
                  />
                </td>
                <td className="py-3 px-6 text-center">
                  <input
                    type="number"
                    className="border border-black dark:border-white bg-transparent w-1/2 text-center rounded-sm"
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div className="flex justify-end">
        <div>
          <Link href="/admin/Ordering/Purchase/delivery">
            <Button className="text-white bg-[#11375C]">Cancel</Button>
          </Link>
          <Link href="">
            <Button color={"warning"} className="text-white ml-2 ">
              save
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default viewdelievery;
