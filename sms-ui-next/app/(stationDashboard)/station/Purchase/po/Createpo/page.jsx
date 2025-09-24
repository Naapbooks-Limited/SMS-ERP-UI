import { Button } from "@/components/ui/button";
import { Undo } from "lucide-react";
import Link from "next/link";
import React from "react";

function viewso() {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div className="text-orange-500 text-xl font-semibold p-2">
          PO of Req. #15
        </div>
        <Link href="/station/Purchase/po">
          <Button color="warning" className="shadow-md">
            <Undo size={20} className="pr-1" />
            Back
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-2 p-3">
        <div className="pb-3">
          <label className="font-bold inline-block w-32 ">PO Date</label>
          <label className="text-orange-300">00121</label>
        </div>
        <div>
          <label className="font-bold inline-block w-32 ">Due Date</label>
          <label> 10-10-10</label>
        </div>

        <div>
          <label className="font-bold inline-block w-32 ">Req no</label>
          <label> 10-10-10</label>
        </div>
        <div>
          <label className="font-bold inline-block w-32 ">Warehouse</label>
          <label className="text-orange-300">00121</label>
        </div>
      </div>
      <div>
        <div className="py-8 mt-10 mb-7  border-t-2 border-black dark:border-white border-dashed max-w-4xl">
          <table className="border-b border-black dark:border-white">
            <thead>
              <th className="py-3 px-6 text-center">Sr NO</th>
              <th className="py-3 px-6 text-center">Product</th>
              <th className="py-3 px-6 text-center">Attributes</th>
              <th className="py-3 px-6 text-center"> Requested Quantity</th>
              <th className="py-3 px-6 text-center">Quantity to be Sent</th>
              <th className="py-3 px-6 text-center">Price</th>
              <th className="py-3 px-6 text-center">Cost</th>
            </thead>
            <tbody>
              <tr>
                <td className="py-3 px-6 text-center">1</td>
                <td className="py-3 px-6 text-center">Blackshirt</td>
                <td className="py-3 px-6 text-center">size:xl color:black</td>
                <td className="py-3 px-6 text-center">05</td>
                <td className="py-3 px-6 text-center"></td>
                <td className="py-3 px-6 text-center"></td>
                <td className="py-3 px-6 text-center"></td>
              </tr>
            </tbody>
          </table>
          <div className="flex justify-end mt-3">Total : 595959</div>
        </div>
      </div>
      <div className="flex justify-end">
        <div>
          <Link href="/station/Purchase/po">
            <Button className="text-white bg-[#11375C]">Cancel</Button>
          </Link>
          <Link href="">
            <Button color={"warning"} className="text-white ml-2 ">Conform PO</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default viewso;
