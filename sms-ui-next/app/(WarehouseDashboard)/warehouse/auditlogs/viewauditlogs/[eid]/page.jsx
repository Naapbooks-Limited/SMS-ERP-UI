"use client"
import { Button } from '@/components/ui/button';
import { Plus, Undo } from 'lucide-react';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { Switch } from "@/components/ui/switch";
import CallFor from '@/utilities/CallFor';

function viewauditlogs({params}) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;
  const [searchQuery, setSearchQuery] = useState("");
  const [tempSearchFields, setTempSearchFields] = useState({
    CreatedFrom: "",
    Message: "",
    "Created To": "",
    "Log Leve": "",
  });
  const [searchFields, setSearchFields] = useState({
    userId: "",
    id: "",
    title: "",
    completed: "",
  });
  const [sortConfig, setSortConfig] = useState({ key: "", direction: "asc" });

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await CallFor(`v2/Common/GetErrorLogsById?id=${params.eid}`, 'get', null, "Auth");
      console.log(response.data.data, "res");
      setData(response.data.data); // Ensure data is an array
      setLoading(false);
    } catch (error) {
      setError(error);
      setLoading(false);
    }
  };



  useEffect(() => {
    fetchData();
  }, []);


    console.log(params.eid)
  
  return (
<div>
  <form className="max-w-7xl mx-auto p-6 bg-white dark:bg-black rounded-md shadow-md">
    <div className="flex justify-between items-center mb-6">
      <div className="text-orange-500 text-2xl font-bold">View log entry details</div>
      <Link  href={"/warehouse/auditlogs"}>
        <Button color="warning" className="shadow-md">
          <Undo size={20} className="pr-1" />
          Back
        </Button>
      </Link>
    </div>

    <div className="space-y-4">
      {/* Log Level */}
      <div className="grid grid-cols-12 gap-4 items-center">
        <label className="col-span-3 font-medium text-gray-700 dark:text-white">Log level:</label>
        <div className="col-span-9">{data?.logLevel}</div>
      </div>

      {/* Short Message */}
      <div className="grid grid-cols-12 gap-4 items-center">
        <label className="col-span-3 font-medium text-gray-700 dark:text-white">Short message:</label>
        <div className="col-span-9">{data.message?.split(".")[0]}</div>
      </div>

      {/* Full Message */}
      <div className="grid grid-cols-12 gap-4 items-center">
        <label className="col-span-3 font-medium text-gray-700 dark:text-white">Full message:</label>
        <div className="col-span-9">{data?.message}</div>
      </div>

      {/* IP Address */}
      <div className="grid grid-cols-12 gap-4 items-center">
        <label className="col-span-3 font-medium text-gray-700 dark:text-white">IP address:</label>
        <div className="col-span-9"></div>
      </div>

      {/* User */}
      <div className="grid grid-cols-12 gap-4 items-center">
        <label className="col-span-3 font-medium text-gray-700 dark:text-white">User:</label>
        <div className="col-span-9">Guest</div>
      </div>

      {/* Page URL */}
      <div className="grid grid-cols-12 gap-4 items-center">
        <label className="col-span-3 font-medium text-gray-700 dark:text-white">Page URL:</label>
        <div className="col-span-9">www.sample.html/products/grocery</div>
      </div>

      {/* Created On */}
      <div className="grid grid-cols-12 gap-4 items-center">
        <label className="col-span-3 font-medium text-gray-700 dark:text-white">Created on:</label>
        <div className="col-span-9">{data?.createdOn}</div>
      </div>
    </div>

    
  </form>
</div>
  )
}

export default viewauditlogs