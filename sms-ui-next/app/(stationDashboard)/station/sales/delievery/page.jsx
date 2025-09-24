"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Eye, Search, SearchIcon } from "lucide-react";
import Link from "next/link";
import CallFor from "@/utilities/CallFor";
import { Badge } from "@/components/ui/badge";
import Pagination from "@/components/pagination/Pagination";
import {
  Tooltip,
  TooltipArrow,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
const Delivery = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [totalPages, setTotalPages] = useState(0);
  const [tempSearchFields, setTempSearchFields] = useState({
    fromDate: "",
    toDate: ""
  });
  const [sortConfig, setSortConfig] = useState({ key: "", direction: "asc" });
  const [organisations, setOrganisations] = useState([]);
  const [initialModel, setInitialModel] = useState(null);

  const badgeColor = (statusname) => {
    switch (statusname.toLowerCase()) {
      case 'delivered':
        return 'success';
      case 'confirmed':
        return 'success';
      case 'not delivered':
        return 'destructive';
      case 'pending':
        return 'warning';
      case 'partially delivered':
        return 'warning';
      default:
        return 'secondary';
    }
  };

  const fetchInitialData = async () => {
    try {
      const response = await CallFor(
        "v2/Orders/GetDeliveries",
        "GET",
        null,
        "Auth"
      );
      if (response?.data) {
        setInitialModel(response.data.model);
        setOrganisations(response.data.dropdowns.organisations);
      } else {
        // Fallback in case data is not as expected
        setOrganisations([]);
      }
    } catch (error) {
      console.error("Error fetching initial data:", error);
      setOrganisations([]); // Handle the error case with an empty array
    }
  };


  const fetchDeliveries = async () => {
    if (!initialModel) return;

    try {
      setLoading(true);
      const response = await CallFor("v2/Orders/GetDeliveries", "POST", {
        ...initialModel,
        fromDate: tempSearchFields.fromDate || initialModel.fromDate,
        toDate: tempSearchFields.toDate || initialModel.toDate,
        targetOrgUid: tempSearchFields.targetOrgUid || initialModel.targetOrgUid,
        paginationFilter: {
          pageNumber: page,
          pageSize: pageSize,
        }
      }, "Auth");
      setData(response.data.data);
      setTotalPages(Math.ceil(response.data.totalRecords / pageSize));

      setLoading(false);
    } catch (error) {
      setError(error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);


  useEffect(() => {
    if (initialModel) {
      fetchDeliveries();
    }
  }, [initialModel, page, pageSize,]);

  const handlePageChange = (pageNumber) => {
    setPage(pageNumber);
  };

  const handleSearch = () => {
    setPage(1); // Reset to first page when searching
    fetchDeliveries();
  };

  const handleInputChange = (field, value) => {
    setTempSearchFields({ ...tempSearchFields, [field]: value });
  };

  const handleSort = (columnName) => {
    let direction = "asc";
    if (sortConfig.key === columnName && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key: columnName, direction });
  };

  const sortedData = [...data].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === "asc" ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === "asc" ? 1 : -1;
    }
    return 0;
  });

  // Calculate total pages based on data length and pageSize



  return (
    <div className="container mx-auto">
      <div className="flex">
        <SearchIcon className="text-gray-500" size={19} />
        <h1 className="text-[20px] font-semibold mb-4 pl-2">Search</h1>
      </div>
      {/* Search inputs */}
      <div className="mb-4 grid grid-cols-1 lg:grid-cols-3 gap-x-10">
        <div className="flex items-center mb-2">
          <label className="w-1/4 font-medium mr-2">From Date</label>
          <input
            type="date"
            className="border border-gray-300 px-4 py-2 rounded w-3/4"
            value={tempSearchFields.fromDate}
            onChange={(e) => handleInputChange("fromDate", e.target.value)}
          />
        </div>
        <div className="flex items-center mb-2">
          <label className="w-1/4 font-medium mr-2">To Date</label>
          <input
            type="date"
            className="border border-gray-300 px-4 py-2 rounded w-3/4"
            value={tempSearchFields.toDate}
            onChange={(e) => handleInputChange("toDate", e.target.value)}
          />
        </div>
        {/* <div className="flex items-center mb-2">
          <label className="w-1/4 font-medium mr-2">Organization</label>
          <select
            className="border border-gray-300 px-4 py-2 rounded w-3/4"
            value={tempSearchFields.targetOrgUid}
            onChange={(e) => handleInputChange("targetOrgUid", e.target.value)}
          >
            <option value="">Select Organization</option>
            {organisations?.map((org) => (
              <option key={org.uid} value={org.uid}>
                {org.name}
              </option>
            ))}
          </select>
        </div> */}
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
        <div className="text-2xl text-orange-400">Deliveries</div>
      </div>

      {/* Table */}
      <table className="min-w-full text-left">
        {/* Table headers */}
        <thead>
          <tr>
            <th
              className="px-2 py-2 cursor-pointer"
              onClick={() => handleSort("odtid")}
            >
              SHIPMENT {" "}
              {sortConfig.key === "odtid"
                ? sortConfig.direction === "asc"
                  ? "▲"
                  : "▼"
                : ""}
            </th>
            <th
              className="px-2 py-2 cursor-pointer"
              onClick={() => handleSort("orderid")}
            >
              ORDER {" "}
              {sortConfig.key === "orderid"
                ? sortConfig.direction === "asc"
                  ? "▲"
                  : "▼"
                : ""}
            </th>
           
            <th
              className="px-2 py-2 cursor-pointer"
              onClick={() => handleSort("odtdate")}
            >
              DATE OF SHIPPED{" "}
              {sortConfig.key === "odtdate"
                ? sortConfig.direction === "asc"
                  ? "▲"
                  : "▼"
                : ""}
            </th>
            <th
              className="px-2 py-2 cursor-pointer"
              onClick={() => handleSort("odtexpdeldate")}
            >
              DATE OF DELIVERY{" "}
              {sortConfig.key === "odtexpdeldate"
                ? sortConfig.direction === "asc"
                  ? "▲"
                  : "▼"
                : ""}
            </th>
            <th
              className="px-2 py-2 cursor-pointer"
              onClick={() => handleSort("statusname")}
            >
              Status{" "}
              {sortConfig.key === "statusname"
                ? sortConfig.direction === "asc"
                  ? "▲"
                  : "▼"
                : ""}
            </th>
            <th className="px-2 py-2">ACTION</th>
          </tr>
        </thead>
        {/* Table data */}
        <tbody>
          {sortedData.map((item) => (
            <tr key={item.id}>
              <td className="px-2 py-2">{item.odtid}</td>
              <td className="px-2 py-2">{item.orderid}</td>

              <td className="px-2 py-2">{item.odtdate?.split("T")[0]}</td>
              <td className="px-2 py-2">{item.odtexpdeldate?.split("T")[0]}</td>
              <td className="px-2 py-2">
                <Badge color={badgeColor(item.statusname)} variant="outline">
                  {item.statusname}
                </Badge>
              </td>
              <td className="px-2 py-2">
                <div className="text-center">
               
               <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                               <Link
                    href={`/station/sales/delievery/viewdelievery/${item.odtid}`}
                  >
                    <Button className="p-0 bg-transparent hover:bg-transparent text-black dark:text-white">
                      <Eye size={20}></Eye>
                    </Button>
                  </Link>
                            </TooltipTrigger>
                            <TooltipContent color="primary">
                              <p>View</p>
                              <TooltipArrow className="fill-primary" />
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        
                          
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      <div className="flex justify-end mt-4">
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
};

export default Delivery;