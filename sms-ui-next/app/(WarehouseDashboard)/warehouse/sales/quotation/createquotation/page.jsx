import { Button } from "@/components/ui/button";
import { Undo } from "lucide-react";
import Link from "next/link";
import React from "react";

function viewquotation() {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div className="text-orange-500 text-xl font-semibold p-2">
          Create Quate for Req. #
        </div>
        <Link href="/warehouse/sales/quotation">
          <Button color="warning" className="shadow-md">
            <Undo size={20} className="pr-1" />
            Back
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-2 p-3">
        <div className="pb-3">
          <label className="font-bold inline-block w-32 ">Req. Date</label>
          <label className="text-orange-300">00121</label>
        </div>
        <div>
          <label className="font-bold inline-block w-32 ">Due Date</label>
          <label> 10-10-10</label>
        </div>
        <div>
          <label className="font-bold inline-block w-32 ">Station</label>
          <label className="text-orange-300">00121</label>
        </div>
        <div>
          <label className="font-bold inline-block w-36 ">Status</label>
          <label>00121</label>
        </div>
      </div>
      <div>
        <div className="py-8 mt-10 mb-7  border-t-2 border-black dark:border-white border-dashed max-w-4xl">
          <table className="border-b border-black dark:border-white">
            <thead>
              <th className="py-3 px-6 text-center">Sr NO</th>
              <th className="py-3 px-6 text-center">Select Product</th>
              <th className="py-3 px-6 text-center">Attributes</th>
              <th className="py-3 px-6 text-center">Requested Quantity</th>
              <th className="py-3 px-6 text-center">Quantity to be send</th>
              <th className="py-3 px-6 text-center">Price</th>
            </thead>
            <tbody>
              <tr>
                <td className="py-3 px-6 text-center">1</td>
                <td className="py-3 px-6 text-center">Blackshirt</td>
                <td className="py-3 px-6 text-center">size:xl color:black</td>
                <td className="py-3 px-6 text-center">05</td>
                <td className="py-3 px-6 text-center">
                  <input className="w-10 border border-black rounded-sm text-center dark:border-white" />
                </td>
                <td className="py-3 px-6 text-center">
                  <input className="w-20 border border-black rounded-sm text-center dark:border-white" />
                </td>
              </tr>
            </tbody>
          </table>
          <div className="flex justify-end mt-3">Total : 595959</div>
        </div>
      </div>
      <div className="flex justify-end">
        <div>
          <Link href="/warehouse/sales/quotation">
            <Button className="text-white bg-blue-950 mr-3 ">Cancel</Button>
          </Link>

          <Button className="text-white bg-orange-400">Conform Quote</Button>
        </div>
      </div>
    </div>
  );
}

export default viewquotation;
