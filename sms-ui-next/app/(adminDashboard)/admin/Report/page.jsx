import { Dot, Minus } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

const report = () => {
  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <div className="text-orange-500 text-2xl bold">REPORTS</div>
      </div>
      <div className="border border-gray-350 rounded-sm ">
        <div className="flex justify-between">
          <p className="text-lg font-semibold text-blue-950 dark:text-white">
            Inventory Reports
          </p>
          <Minus size={20} />
        </div>

        <div className="grid grid-cols-4 p-2">
          <Link href={"/admin/Report/receivingReports"}>
            <div className="border border-orange-400 flex m-1">
              <Dot /> Receiving Report
            </div>
          </Link>

          <div className="border border-orange-400 flex m-1">
            <Dot /> Wastage Report-RM
          </div>
          <div className="border border-orange-400 flex m-1">
            <Dot /> Current Available Stock-RM
          </div>
          <div className="border border-orange-400 flex m-1">
            <Dot /> Stock Movement-RM
          </div>
          <div className="border border-orange-400 flex m-1">
            <Dot /> Daily Inventory Report- RM
          </div>
          <div className="border border-orange-400 flex m-1">
            <Dot /> Low Stock Alert
          </div>
          <div className="border border-orange-400 flex m-1">
            <Dot /> Daily Food Cost
          </div>
        </div>
      </div>

      <div className="border border-gray-350 rounded-sm mt-5">
        <div className="flex justify-between">
          <p className="text-lg font-semibold text-blue-950 dark:text-white">
            Sales Reports
          </p>
          <Minus size={20} />
        </div>

        <div className="grid grid-cols-4 p-2">
          <div className="border border-orange-400 flex m-1">
            <Dot /> Sales By Order
          </div>

          <div className="border border-orange-400 flex m-1">
            <Dot />
            Total Sales Report
          </div>
          <div className="border border-orange-400 flex m-1">
            <Dot /> Daily Sales Report - WOW / MOM
          </div>
          <div className="border border-orange-400 flex m-1">
            <Dot /> Sales Growth Report
          </div>
          <div className="border border-orange-400 flex m-1">
            <Dot /> Daily Sales Report
          </div>
          <div className="border border-orange-400 flex m-1">
            <Dot /> Best Time of Sales
          </div>
          <div className="border border-orange-400 flex m-1">
            <Dot /> Product Wise Sales Growth
          </div>
          <div className="border border-orange-400 flex m-1">
            <Dot /> Top Selling Points
          </div>
          <div className="border border-orange-400 flex m-1">
            <Dot />
            Low Sales Points
          </div>
          <div className="border border-orange-400 flex m-1">
            <Dot /> Top Selling Product
          </div>
          <div className="border border-orange-400 flex m-1">
            <Dot /> Low Selling Product
          </div>
        </div>
      </div>
    </>
  );
}

export default report