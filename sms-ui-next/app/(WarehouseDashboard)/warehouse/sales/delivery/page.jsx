"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
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
  Download,
  DownloadIcon,
  Eye,
  Import,
  Mail,
  Plus,
  RectangleHorizontal,
  Search,
  SearchIcon,
  Trash,
  Undo2,
  Upload,
  CircleMinus
} from "lucide-react";
// import StaffImportModal from './StaffImportModal'

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import CallFor from "@/utilities/CallFor";
import Pagination from "@/components/pagination/Pagination";

const delievery = () => {
  const userData = JSON.parse(sessionStorage.getItem("userData") || "{}");
  const uid = userData.uid;
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [tempSearchFields, setTempSearchFields] = useState({
    "From Date": "",
    "To Date": "",
    // Manager: ''
  });
  const [searchFields, setSearchFields] = useState({
    userId: "",
    id: "",
    title: "",
    completed: "",
  });
  const [sortConfig, setSortConfig] = useState({ key: "", direction: "asc" });
  const router = useRouter();

  const badgeColor = (status) => {
    switch (status) {
      case 103:
        return 'warning';
      case 104:
        return 'success';
      case 105:
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  useEffect(() => {
      const bodyData = {
    fromDate: tempSearchFields["From Date"] || "",
    toDate: tempSearchFields["To Date"] || "",
    voucherNo: tempSearchFields["VOUCHER #"] || "",
    from: tempSearchFields["From"] || "",
    to: tempSearchFields["To"] || "",
    paginationFilter: {
      pageNumber: page,
      pageSize: pageSize,
    }
  };

    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await CallFor(
          `v2/Orders/GetDeliveries`, "post", bodyData, "Auth"
        );
        setData(response.data.data);
        setTotalPages(Math.ceil(response.data.totalRecords / pageSize));
        setLoading(false);
      } catch (error) {
        setError(error);
        setLoading(false);
      }
    };
    fetchData();

  }, [page, pageSize , searchQuery]);

  const handlePageChange = (pageNumber) => {
    setPage(pageNumber);
  };

  const handleSearch = () => {
    setSearchFields(tempSearchFields);
    setSearchQuery(JSON.stringify(tempSearchFields)); // Trigger useEffect
  };

  const handleInputChange = (columnName, value) => {
    setTempSearchFields({ ...tempSearchFields, [columnName]: value });
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

const filteredData = sortedData.filter((item) => {
  // Loop through each field in tempSearchFields (not searchFields)
  for (let key in tempSearchFields) {
    if (tempSearchFields[key] !== "") {
      const itemValue = item[key]?.toString().toLowerCase() || "";
      const searchValue = tempSearchFields[key].toLowerCase();
      if (!itemValue.includes(searchValue)) {
        return false;
      }
    }
  }
  return true;
});

  // Calculate total pages based on filtered data length and pageSize

  return (
    <div className="w-full mx-auto">
      <div className="flex ">
        <SearchIcon className="text-gray-500" size={19} />
        <h1 className="text-[20px] font-semibold mb-4 pl-2">Search</h1>
      </div>
      {/* Search inputs */}
      <div className="mb-4 grid grid-cols-1 lg:grid-cols-2 gap-x-10">
        {/* Search input for each field */}
        {Object.keys(tempSearchFields).map((field) => (
          <div key={field} className="flex items-center mb-2">
            <label className="w-1/4 font-medium mr-2">{field}</label>
           {field === "From Date" || field === "To Date" ? (
  <input
    type="date"
    className="border border-gray-300 px-4 py-2 rounded w-3/4"
    min={field === "To Date" ? tempSearchFields["From Date"] || "" : ""}
    onChange={(e) => handleInputChange(field, e.target.value)}
  />
) : (
  <input
    type="text"
    className="border border-gray-300 px-4 py-2 rounded w-3/4"
    onChange={(e) => handleInputChange(field, e.target.value)}
  />
)}

          </div>
        ))}
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
      <div className="flex justify-between gap-1 pb-3">
        <div className="text-2xl text-orange-400">Delivery</div>
        <div className="">
          {/* <StaffImportModal /> */}
          {/* <Button color="success" className="shadow-md "><DownloadIcon size={20} className='pr-1' />Import</Button>
         
          <Button color="destructive" className="shadow-md my-2 lg:mx-2 mx-2"><Upload size={20} className='pr-1' />Export</Button> */}

          {/* <Link href={"/warehouse/sales/delivery"}>
            <Button color="warning" className="shadow-md">
              <Plus size={20} className="pr-1" /> Add Stock from External Vendor
            </Button>
          </Link> */}
        </div>
      </div>

      {/* Table */}
      <table className="min-w-full text-left">
        {/* Table headers */}
        <thead>
          <tr>
            <th
              className="px-2 text-center py-2 cursor-pointer"
              onClick={() => handleSort("userId")}
            >
              #{" "}
              {sortConfig.key === "userId"
                ? sortConfig.direction === "asc"
                  ? "▲"
                  : "▼"
                : ""}
            </th>
            <th
              className="px-2 text-center py-2 cursor-pointer"
              onClick={() => handleSort("id")}
            >
              PO No.{" "}
              {sortConfig.key === "id"
                ? sortConfig.direction === "asc"
                  ? "▲"
                  : "▼"
                : ""}
            </th>
            <th
              className="px-2 text-center py-2 cursor-pointer "
              onClick={() => handleSort("title")}
            >
              DATE{" "}
              {sortConfig.key === "title"
                ? sortConfig.direction === "asc"
                  ? "▲"
                  : "▼"
                : ""}
            </th>
            <th
              className="px-2 text-center py-2 cursor-pointer"
              onClick={() => handleSort("completed")}
            >
              STATION{" "}
              {sortConfig.key === "completed"
                ? sortConfig.direction === "asc"
                  ? "▲"
                  : "▼"
                : ""}
            </th>
            <th
              className="px-2 text-center py-2 cursor-pointer"
              onClick={() => handleSort("completed")}
            >
              TOTAL QUANTITY{" "}
              {sortConfig.key === "completed"
                ? sortConfig.direction === "asc"
                  ? "▲"
                  : "▼"
                : ""}
            </th>
            <th
              className="px-2 text-center py-2 cursor-pointer"
              onClick={() => handleSort("completed")}
            >
              Total Accepted{" "}
              {sortConfig.key === "completed"
                ? sortConfig.direction === "asc"
                  ? "▲"
                  : "▼"
                : ""}
            </th>
            <th
              className="px-2 text-center py-2 cursor-pointer"
              onClick={() => handleSort("completed")}
            >
              Total Waste/Return{" "}
              {sortConfig.key === "completed"
                ? sortConfig.direction === "asc"
                  ? "▲"
                  : "▼"
                : ""}
            </th>
            <th
              className="px-2 text-center py-2 cursor-pointer"
              onClick={() => handleSort("completed")}
            >
              Status{" "}
              {sortConfig.key === "completed"
                ? sortConfig.direction === "asc"
                  ? "▲"
                  : "▼"
                : ""}
            </th>
            <th
              className="px-2 text-center py-2 cursor-pointer"
              onClick={() => handleSort("completed")}
            >
              ACTION{" "}
              {sortConfig.key === "completed"
                ? sortConfig.direction === "asc"
                  ? "▲"
                  : "▼"
                : ""}
            </th>
          </tr>
        </thead>
        {/* Table data */}
        <tbody>
          {data && data.map((item) => (
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
              <td className="px-2 py-2">
                <Link href={`/warehouse/sales/delivery/viewdelievery/${item.odtid}`}>
                  <Button
                    color="warning"
                    className="p-0 mr-2 text-white text-sm px-2"
                  >
                    <Eye size={15}></Eye> View
                  </Button>
                </Link>
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

export default delievery;
