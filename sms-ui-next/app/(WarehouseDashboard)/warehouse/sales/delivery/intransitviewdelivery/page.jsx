import { Button } from "@/components/ui/button";
import { Undo } from "lucide-react";
import Link from "next/link";
import React from "react";

function viewdelivery() {
    return (
      <div>
        <div className="flex justify-between items-center mb-6">
          <div className="text-orange-500 text-xl font-semibold p-2">
            DELIVERY - IN TRANSIT
          </div>
          <Link href="/warehouse/sales/delivery">
            <Button color="warning" className="shadow-md">
              <Undo size={20} className="pr-1" />
              Back
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-3 pl-3 pt-3">
          <div className="pb-3">
            <label className="font-bold inline-block ">To : </label>
            <label> Station 4</label>
          </div>
          <div>
            <label className="font-bold inline-block ">PO Date : </label>
            <label> 10-10-10</label>
          </div>
          <div>
            <label className="font-bold inline-block ">Total Quantity : </label>
            <label> 25</label>
          </div>
        </div>
        <div>
          <div className="pl-10 mt-4">
            <table>
              <thead>
                <th className="py-3 px-6 text-center">Sr NO</th>
                <th className="py-3 px-6 text-center">Product</th>
                <th className="py-3 px-6 text-center">Attributes</th>
                <th className="py-3 px-6 text-center">Quantity</th>
                <th className="py-3 px-6 text-center">Quantity Delivered</th>
                <th className="py-3 px-6 text-center">
                  Quantity in this Delivery
                </th>
              </thead>
              <tbody>
                <tr>
                  <td className="py-3 px-6 text-center">1</td>
                  <td className="py-3 px-6 text-center">Blackshirt</td>
                  <td className="py-3 px-6 text-center">size:xl color:black</td>
                  <td className="py-3 px-6 text-center">05</td>
                  <td className="py-3 px-6 text-center">4</td>
                  <td className="py-3 px-6 text-center">0</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
}

export default viewdelivery;
