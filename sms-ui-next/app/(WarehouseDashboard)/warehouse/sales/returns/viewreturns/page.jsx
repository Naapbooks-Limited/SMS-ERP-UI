import { Button } from "@/components/ui/button";
import { Undo } from "lucide-react";
import Link from "next/link";
import React from "react";

function viewreturn() {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div className="text-orange-500 text-xl font-semibold p-2">
          Returns from PO
        </div>
        <Link href="/warehouse/sales/returns">
          <Button color="warning" className="shadow-md">
            <Undo size={20} className="pr-1" />
            Back
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-2 pl-3 pt-3 border-b-2 border-dashed border-black max-w-4xl pb-5 ">
        <div className="pb-3">
          <label className="font-bold inline-block w-1/4 ">PO No </label>
          <label> Station 4</label>
        </div>
        <div>
          <label className="font-bold inline-block w-1/4 "> Date : </label>
          <label> 10-10-10</label>
        </div>
        <div>
          <label className="font-bold inline-block w-1/4 ">Station </label>
          <label> 25</label>
        </div>
        <div>
          <label className="font-bold inline-block w-1/4 ">
            Return Quantity{" "}
          </label>
          <label> 25</label>
        </div>
      </div>
      <div>
        <div className="pl-5 mt-8">
          <table>
            <thead>
              <th className="py-3 px-6 text-center">#</th>
              <th className="py-3 px-6 text-center">Select Product</th>
              <th className="py-3 px-6 text-center">Attributes</th>
              <th className="py-3 px-6 text-center">Quantity</th>
              <th className="py-3 px-6 text-center">Return Quantity</th>
            </thead>
            <tbody>
              <tr>
                <td className="py-3 px-6 text-center">1</td>
                <td className="py-3 px-6 text-center">Blackshirt</td>
                <td className="py-3 px-6 text-center">size:xl color:black</td>
                <td className="py-3 px-6 text-center">05</td>
                <td className="py-3 px-6 text-center">4</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="flex justify-end">
          <div>
            <Link href="/warehouse/sales/returns/addinventory">
              <Button className="text-white bg-orange-400">
                Add to Inventory
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default viewreturn;
