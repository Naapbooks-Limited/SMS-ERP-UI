import Link from 'next/link'
import React from 'react'

const reports = () => {
  return (

    <>
      <div className=" justify-between flex gap-1 pb-3 ">
        <div className="text-2xl text-orange-400">REPORTS</div>
      </div>
      <div className='flex justify-around'>
        <div className='border border-gray-400 rounded-2xl p-6 w-1/3'>
          <div className='mb-4 text-blue-950 dark:text-white text-lg text-center'>Inventory Reports</div>
          <div className='p-3'>
            <Link href={"/warehouse/reports/receivingReports"}><p className='mb-2'> &#128900; Receiving Report</p></Link>
            <p className='mb-2'> &#128900; Stock Movement-RM</p>
            <p className='mb-2'> &#128900; Low Stock Alert</p>
            <p className='mb-2'> &#128900; Wastage Report-RM</p>
            <p className='mb-2'> &#128900; Daily Inventory Report- RM</p>
            <p className='mb-2'> &#128900; Daily Food Cost</p>
            <p className='mb-2'> &#128900; Current Available Stock-RM</p>
          </div>
        </div>
        <div className='border border-gray-400 rounded-2xl p-6  w-1/3'>
          <div className='mb-4 text-blue-950 dark:text-white text-lg text-center'> Sales Reports</div>
          <div className='p-3'>
            <p className='mb-2'> &#128900; Sales By Order</p>
            <p className='mb-2'> &#128900; Total Sales Report</p>
            <p className='mb-2'> &#128900; Daily Sales Report - WOW / MOM</p>
            <p className='mb-2'> &#128900; Sales Growth Report</p>
            <p className='mb-2'> &#128900; Daily Sales Report</p>
            <p className='mb-2'> &#128900; Best Time of Sales</p>
            <p className='mb-2'> &#128900; Product Wise Sales Growth</p>
            <p className='mb-2'> &#128900; Top Selling Product</p>
            <p className='mb-2'> &#128900; Low Selling Product</p>
          </div>
        </div>
      </div>
    </>
  )
}

export default reports