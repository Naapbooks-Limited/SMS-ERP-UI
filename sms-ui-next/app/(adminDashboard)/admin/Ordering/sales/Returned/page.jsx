"use client"
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button'
import { Eye, FilePenLine, Plus, Search, SearchIcon } from 'lucide-react';
import Link from 'next/link';
import CallFor from '@/utilities/CallFor';
import Pagination from "@/components/pagination/Pagination";
import {
  Tooltip,
  TooltipArrow,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const page = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [organisations, setOrganisations] = useState([]);
  const [orderIds, setOrderIds] = useState([]);
  const [tempSearchFields, setTempSearchFields] = useState({
    "returnDate": "",
    "targetOrgUid": "",
    "orderId": ""
  });
  const [searchFields, setSearchFields] = useState({
    "returnDate": "",
    "targetOrgUid": "",
    "orderId": ""
  });

  // Fetch initial data for dropdowns
  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const response = await CallFor(
        `v2/Orders/GetOrderReturns/true`,
        "get",
        null,
        "Auth"
      );
      setOrganisations(response.data.dropdowns.organisations);
      setOrderIds(response.data.dropdowns.orderIds);
    } catch (error) {
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch returns based on current page and filters
  const fetchReturns = async () => {
    try {
      setLoading(true);
      const requestBody = {
        returnDate: searchFields.returnDate || "0001-01-01T00:00:00",
        targetOrgUid: searchFields.targetOrgUid || null,
        orderId: searchFields.orderId || null,
        paginationFilter: {
          PageNumber: currentPage,
          PageSize: pageSize
        }
      };
      
      const response = await CallFor(
        `v2/Orders/GetOrderReturnsByOrgId/true`,
        "post",
        requestBody,
        "Auth"
      );

      setData(response.data.data);
      setTotalPages(Math.ceil(response.data.count / pageSize));
    } catch (error) {
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  // Effect to fetch initial dropdown data on component mount
  useEffect(() => {
    fetchInitialData();
  }, []);

  // Effect to fetch returns whenever page or search filters change
  useEffect(() => {
    if (organisations.length > 0 && orderIds.length > 0) {
      fetchReturns();
    }
  }, [currentPage, pageSize, searchFields, organisations, orderIds]);

  const handlePageChange = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  const handleSearch = () => {
    setSearchFields(tempSearchFields);
    setCurrentPage(1); // Reset to the first page on a new search
  };

  const handleInputChange = (columnName, value) => {
    setTempSearchFields({ ...tempSearchFields, [columnName]: value });
  };

  return (
    <div className="container mx-auto">
      <div className="flex">
        <SearchIcon className="text-gray-500" size={19} />
        <h1 className="text-[20px] font-semibold mb-4 pl-2">Search</h1>
      </div>
      <div className="mb-4 grid grid-cols-1 lg:grid-cols-2 gap-x-10">
        <div className="flex items-center mb-2">
          <label className="w-1/4 font-medium mr-2">Return Date</label>
          <input
            type="date"
            className="border border-gray-300 px-4 py-2 rounded w-3/4"
            onChange={(e) => handleInputChange("returnDate", e.target.value)}
          />
        </div>
        <div className="flex items-center mb-2">
          <label className="w-1/4 font-medium mr-2">Organisation</label>
          <select
            className="border border-gray-300 px-4 py-2 rounded w-3/4"
            onChange={(e) => handleInputChange('targetOrgUid', e.target.value)}
          >
            <option value="">Select Organisation</option>
            {organisations.map(org => (
              <option key={org.uid} value={org.uid}>{org.name}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center mb-2">
          <label className="w-1/4 font-medium mr-2">Order ID</label>
          <select
            className="border border-gray-300 px-4 py-2 rounded w-3/4"
            onChange={(e) => handleInputChange('orderId', e.target.value)}
          >
            <option value="">Select Order ID</option>
            {orderIds.map(id => (
              <option key={id} value={id}>{id}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="flex justify-center lg:mb-1 mb-3 items-center">
        <Button
          color="warning"
          className="shadow-md w-28"
          onClick={handleSearch}
        >
          <Search size={20} className="pr-1" />
          Search
        </Button>
      </div>

      <div className="justify-between flex gap-1 pb-3">
        <div className="text-2xl text-orange-400">Returns</div>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : error ? (
        <div className="text-center py-8 text-red-500">Error: {error.message}</div>
      ) : (
        <table className="min-w-full text-left">
          <thead>
            <tr>
              <th className="px-2 py-2">ID</th>
              <th className="px-2 py-2">ORDER #</th>
              <th className="px-2 py-2">PRODUCT</th>
              <th className="px-2 py-2 text-center">QUANTITY</th>
              <th className="px-2 py-2 text-center">QTY. RETURNED TO STOCK</th>
              <th className="px-2 py-2">Customer</th>
              <th className="px-2 py-2 text-center">DATE</th>
              <th className="px-2 py-2 text-center">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {data && data.length > 0 ? (
              data.map((item) => {
                const order = item.odtitemsmapping?.odt?.order;
                const product = item.odtitemsmapping?.oitems?.pro;
                // Fix: Extract the order number or ID properly
                const orderNumber = item.odtitemsmapping?.odt?.odtno || item.odtitemsmapping?.odt?.orderid || "-";
                
                return (
                  <tr key={item.returnId}>
                    <td className="px-2 py-2">{item.returnId}</td>
                    <td className="px-2 py-2">{orderNumber}</td>
                    <td className="px-2 py-2 w-[180px]">{product?.proname ?? "-"}</td>
                    <td className="px-2 py-2 text-center">{item.odtitemsmapping?.oitems?.itemqty ?? 0}</td>
                    <td className="px-2 py-2 text-center">{item.returnquantity ?? 0}</td>
                    <td className="px-2 py-2 text-center">{order?.buyerid ?? "-"}</td>
                    <td className="px-2 py-2 text-center">
                      {new Date(item.createddate).toLocaleDateString("en-GB")}
                    </td>
                    <td className="px-2 py-2 text-center">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Link href={`/admin/Ordering/sales/Returned/viewreturns/${item.returnId}`}>
                              <Button
                                color="warning"
                                className="p-0 dark:text-white text-black text-sm px-1 bg-transparent hover:bg-transparent"
                              >
                                <Eye size={15}></Eye>
                              </Button>
                            </Link>
                          </TooltipTrigger>
                          <TooltipContent color="primary">
                            <p>View</p>
                            <TooltipArrow className="fill-primary" />
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                  No data found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}

      <div className="flex justify-end mt-4">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
};

export default page;