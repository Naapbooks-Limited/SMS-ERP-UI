"use client"
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipArrow,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Check,
  Eye,
  Plus,
  Search,
  SearchIcon,
  Undo2,
  CircleMinus
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import CallFor from "@/utilities/CallFor";
import Pagination from "@/components/pagination/Pagination";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const Delivery = () => {
  const userData = JSON.parse(sessionStorage.getItem("userData") || "{}");
  const uid = userData.uid;
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [searchFields, setSearchFields] = useState({
    voucherNumber: "",
    fromDate: "",
    toDate: "",
    organizationId: ""
  });
  const [organisations, setOrganisations] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: "", direction: "asc" });

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const response = await CallFor(
          "v2/Orders/GetDeliveries",
          "GET",
          null,
          "Auth"
        );
        if (response?.data) {
          setOrganisations(response.data.dropdowns.organisations);
        } else {
          setOrganisations([]);
        }
      } catch (error) {
        console.error("Error fetching initial data:", error);
        setOrganisations([]);
      }
    };

    fetchInitialData();
  }, []);

  useEffect(() => {
    fetchData();
  }, [page, pageSize, uid]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const bodyData = {
        fromDate: searchFields.fromDate,
        toDate: searchFields.toDate,
        targetOrgUid: null,
        targetOrgUoid: searchFields.organizationId,
        voucherNumber: searchFields.voucherNumber,
        paginationFilter: {
          pageNumber: page,
          pageSize: pageSize,
        }
      };

      const response = await CallFor(
        `v2/Orders/GetDeliveriesByBuyerId/${uid}`, "post", bodyData, "Auth"
      );
      setData(response.data.data);
      setTotalPages(Math.ceil(response.data.totalRecords / pageSize));
      setLoading(false);
    } catch (error) {
      setError(error);
      setLoading(false);
    }
  };

  const handlePageChange = (pageNumber) => {
    setPage(pageNumber);
  };

  const handleSearch = () => {
    setPage(1); // Reset to first page when searching
    fetchData();
  };

  const handleInputChange = (field, value) => {
    setSearchFields(prev => ({ ...prev, [field]: value }));
  };

  const handleOrganizationChange = (value) => {
    setSearchFields(prev => ({ ...prev, organizationId: value }));
  };

  const handleSort = (columnName) => {
    let direction = "asc";
    if (sortConfig.key === columnName && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key: columnName, direction });
  };

  const badgeColor = (status) => {
    switch (status) {
      case 103:
        return 'warning';
      case 104:
        return 'success';
      case 105:
        return 'destructive';
      case 108:
        return 'warning';
      default:
        return 'secondary';
    }
  };

  const sortedData = [...data].sort((a, b) => {
    if (sortConfig.key) {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortConfig.direction === "asc"
          ? aValue.localeCompare(bValue, undefined, { sensitivity: 'base' })
          : bValue.localeCompare(aValue, undefined, { sensitivity: 'base' });
      }

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortConfig.direction === "asc" ? aValue - bValue : bValue - aValue;
      }

      return 0;
    }
    return 0;
  });

  return (
    <div className="w-full mx-auto">
      <div className="flex">
        <SearchIcon className="text-gray-500" size={19} />
        <h1 className="text-[20px] font-semibold mb-4 pl-2">Search</h1>
      </div>
      <div className="mb-4 grid grid-cols-1 lg:grid-cols-2 gap-x-10">
        <div className="flex items-center mb-2">
          <label className="w-1/4 font-medium mr-2">VOUCHER #</label>
          <input
            type="text"
            className="border border-gray-300 px-4 py-2 rounded w-3/4"
            onChange={(e) => handleInputChange("voucherNumber", e.target.value)}
            value={searchFields.voucherNumber}
          />
        </div>
        <div className="flex items-center mb-2">
          <label className="w-1/4 font-medium mr-2">From Date</label>
          <input
            type="date"
            className="border border-gray-300 px-4 py-2 rounded w-3/4"
            onChange={(e) => handleInputChange("fromDate", e.target.value)}
            value={searchFields.fromDate}
          />
        </div>
        <div className="flex items-center mb-2">
          <label className="w-1/4 font-medium mr-2">To Date</label>
          <input
            type="date"
            className="border border-gray-300 px-4 py-2 rounded w-3/4"
            onChange={(e) => handleInputChange("toDate", e.target.value)}
            value={searchFields.toDate}
          />
        </div>
        <div className="flex items-center mb-2">
          <label className="w-1/4 font-medium mr-2">Organization</label>
          <Select onValueChange={handleOrganizationChange} value={searchFields.organizationId}>
            <SelectTrigger className="w-3/4 text-black">
              <SelectValue placeholder="Select organization" />
            </SelectTrigger>
            <SelectContent>
              {organisations.map((org) => (
                <SelectItem key={org.uid} value={org.id.toString()}>
                  {org.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex justify-center items-center mb-4">
        <Button
          color="warning"
          className="shadow-md w-28"
          onClick={handleSearch}
        >
          <Search size={20} className="pr-1" />
          Search
        </Button>
      </div>
      <div className="flex justify-between gap-1 pb-3">
        <div className="text-2xl text-orange-400">Delivery</div>
        {/* <div className="">
          <Link href={"/station/Purchase/delievery/Externalvendoe"}>
            <Button color="warning" className="shadow-md">
              <Plus size={20} className="pr-1" /> Add Stock from External Vendor
            </Button>
          </Link>
        </div> */}
      </div>

      <table className="min-w-full text-left">
        <thead>
          <tr>
            <th className="px-2 text-center py-2 cursor-pointer" onClick={() => handleSort("userId")}>
              # {sortConfig.key === "userId" ? (sortConfig.direction === "asc" ? "▲" : "▼") : ""}
            </th>
            <th className="px-2 text-center py-2 cursor-pointer" onClick={() => handleSort("odtid")}>
              PO No. {sortConfig.key === "odtid" ? (sortConfig.direction === "asc" ? "▲" : "▼") : ""}
            </th>
            <th className="px-2 text-center py-2 cursor-pointer" onClick={() => handleSort("orderid")}>
              DATE {sortConfig.key === "orderid" ? (sortConfig.direction === "asc" ? "▲" : "▼") : ""}
            </th>
            <th className="px-2 text-center py-2 cursor-pointer" onClick={() => handleSort("orgname")}>
              WAREHOUSE {sortConfig.key === "orgname" ? (sortConfig.direction === "asc" ? "▲" : "▼") : ""}
            </th>
            <th className="px-2 text-center py-2 cursor-pointer" onClick={() => handleSort("totalDeliverQuantity")}>
              TOTAL QUANTITY {sortConfig.key === "totalDeliverQuantity" ? (sortConfig.direction === "asc" ? "▲" : "▼") : ""}
            </th>
            <th className="px-2 text-center py-2 cursor-pointer" onClick={() => handleSort("totalReceivedQty")}>
              Total Accepted {sortConfig.key === "totalReceivedQty" ? (sortConfig.direction === "asc" ? "▲" : "▼") : ""}
            </th>
            <th className="px-2 text-center py-2 cursor-pointer" onClick={() => handleSort("orderTotalReturnQty")}>
              Total Waste/Return {sortConfig.key === "orderTotalReturnQty" ? (sortConfig.direction === "asc" ? "▲" : "▼") : ""}
            </th>
            <th className="px-2 text-center py-2 cursor-pointer" onClick={() => handleSort("status")}>
              Status {sortConfig.key === "status" ? (sortConfig.direction === "asc" ? "▲" : "▼") : ""}
            </th>
            <th className="px-2 text-center py-2 cursor-pointer">ACTION</th>
          </tr>
        </thead>
        <tbody>
          {sortedData.map((item) => (
            <tr key={item.id}>
              <td className="text-center py-2">{item.odtid}</td>
              <td className="text-center py-2">{item.orderid}</td>
              <td className="text-center py-2">{item.odtdate?.split("T")[0]}</td>
              <td className="text-center py-2 w-[150]">{item.orgname}</td>
              <td className="text-center py-2">{item.totalDeliverQuantity}</td>
              <td className="text-center py-2">{item.totalReceivedQty}</td>
              <td className="text-center py-2">{item.orderTotalReturnQty}</td>
              <td className="text-center py-0">
                <Badge color={badgeColor(item.status)} variant="outline">
                  {item.status === 103 ? "Not delivered" :
                    item.status === 104 ? "Delivered" :
                      item.status === 108 ? "In Transit" :
                        item.status === 105 ? "Rejected" : "Unknown"}
                </Badge>
              </td>
              <td className="py-2">
                {(item.status === 103 || item.status === 108) ? (
                  <div className="flex mb-2">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Link href={`/station/Purchase/delievery/viewdelievery/${item.odtid}`}>
                            <Button
                              color="warning"
                              className="p-0 dark:text-white text-black text-sm px-1 bg-transparent hover:bg-transparent"
                            >
                              <Eye size={15} />
                            </Button>
                          </Link>
                        </TooltipTrigger>
                        <TooltipContent color="primary">
                          <p>View Delivery</p>
                          <TooltipArrow className="fill-primary" />
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Link href={`/station/Purchase/delievery/AcceptStocks/${item.odtid}`}>
                            <Button className="p-0 dark:text-white text-black text-sm px-1 bg-transparent hover:bg-transparent">
                              <Check size={20} />
                            </Button>
                          </Link>
                        </TooltipTrigger>
                        <TooltipContent color="primary">
                          <p>Accept Stocks</p>
                          <TooltipArrow className="fill-primary" />
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                ) : (
                  <div>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Link href={`/station/Purchase/delievery/viewdelievery/${item.odtid}`}>
                            <Button
                              color="warning"
                              className="p-0 dark:text-white text-black text-sm px-1 bg-transparent hover:bg-transparent"
                            >
                              <Eye size={15} />
                            </Button>
                          </Link>
                        </TooltipTrigger>
                        <TooltipContent color="primary">
                          <p>View Delivery</p>
                          <TooltipArrow className="fill-primary" />
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Link href={`/station/Purchase/delievery/Returnstocks/${item.odtid}`}>
                            <Button className="p-0 dark:text-white text-black text-sm px-1 bg-transparent hover:bg-transparent">
                              <Undo2 size={20} />
                            </Button>
                          </Link>
                        </TooltipTrigger>
                        <TooltipContent color="primary">
                          <p>Return Stocks</p><TooltipArrow className="fill-primary" />
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Link href={`/station/Purchase/delievery/Wastagestack/${item.odtid}`}>
                            <Button className="p-0 dark:text-white text-black text-sm px-1 bg-transparent hover:bg-transparent">
                              <CircleMinus size={15} />
                            </Button>
                          </Link>
                        </TooltipTrigger>
                        <TooltipContent color="primary">
                          <p>Wastage Stocks</p>
                          <TooltipArrow className="fill-primary" />
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex justify-end mt-4">
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </div>

      {loading && <div className="text-center mt-4">Loading...</div>}
    </div>
  );
};

export default Delivery;