"use client"
import { Button } from '@/components/ui/button'
import { Undo } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import React from 'react'

const skuRequestView = () => {

    const router = useRouter();
    return (
      <>
        <div className="flex justify-between items-center mb-6">
          <div className="text-orange-500 text-2xl bold">SKU Request</div>
          <Link href="/admin/Catalogue/Requests">
            <Button color="warning" className="shadow-md">
              <Undo size={20} className="pr-1" />
              Back
            </Button>
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-7 ">
          <div className="">
            <div className="flex items-center mb-4">
              <label className="w-1/6 font-semibold mr-2 text-blue-950 dark:text-white">
                Name
              </label>
              <p className="text-blue-900 dark:text-gray-300 ml-6">
                {" "}
                Digital Smartwatch{" "}
              </p>
            </div>
            <div className="flex items-center mb-4">
              <label className="w-1/6 font-semibold mr-2 text-blue-950 dark:text-white">
                Images
              </label>
              <p className="text-blue-900 dark:text-gray-300 ml-6">
                Images will come here{" "}
              </p>
            </div>

            <div className="flex items-center mb-4">
              <label className="w-1/6 font-semibold mr-2 text-blue-950 dark:text-white">
                Description
              </label>
              <p className="text-blue-900 dark:text-gray-300 ml-6">
                Watch color has to be black
              </p>
            </div>

            <div className="flex items-center mb-4">
              <label className="w-1/6 font-semibold mr-2 text-blue-950 dark:text-white">
                Keywords
              </label>
              <p className="text-blue-900 dark:text-gray-300 ml-6">Watch</p>
            </div>

            <div className="flex items-center mb-4">
              <label className="w-1/6 font-semibold mr-2 text-blue-950 dark:text-white">
                Price
              </label>
              <p className="text-blue-900 dark:text-gray-300 ml-6">10,000-/</p>
            </div>

            <div className="flex items-center mb-4">
              <label className="w-1/6 font-semibold mr-2 text-blue-950 dark:text-white">
                Specification
              </label>
              <p className="text-blue-900 dark:text-gray-300 ml-6">
                Digital Model
              </p>
            </div>
          </div>

          <div className="flex items-center mb-4">
            <label className="w-1/6 font-semibold mr-2 text-blue-950 dark:text-white">
              Status
            </label>
            <p className="text-blue-900 dark:text-gray-300 ml-6 bg-yellow-300">
              Not Added
            </p>
          </div>
        </div>
        <div className="text-end">
          <Button
            className="text-white bg-blue-950 m-2 hover:bg-blue-950"
            onClick={() => router.push("/admin/Catalogue/Requests")}
          >
            Add Product
          </Button>

          <Button className="text-white bg-orange-400 hover:bg-orange-400">
            Reject Request
          </Button>
        </div>
      </>
    );
}

export default skuRequestView