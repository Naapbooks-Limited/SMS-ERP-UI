"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Mail, Plus, Search, SearchIcon, Trash } from "lucide-react";
import Pagination from "@/components/pagination/Pagination";
import { useRouter } from "next/navigation";
import Link from "next/link";
import CallFor from "@/utilities/CallFor";
import DeleteDialog from "@/components/DeleteDialog";
import {
  Tooltip,
  TooltipArrow,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const PO = () => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 5;

  const [sortColumn, setSortColumn] = useState("orderdate");
  const [sortDirection, setSortDirection] = useState("asc");

  const [organisations, setOrganisations] = useState([]);
  const [filterModel, setFilterModel] = useState({
    orderDate: "",
    deliveryDate: "",
    targetOrgUid: null,
  });

  const router = useRouter();

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const response = await CallFor(
        `v2/Orders/GetOrdersV2`,
        "get",
        null,
        "Auth"
      );
      setOrganisations(response.data.dropdowns.organisations);
      setLoading(false);
    } catch (error) {
      setError(error);
      setLoading(false);
    }
  };

  const fetchFilteredData = async (page) => {
    try {
      setLoading(true);
      const response = await CallFor(
        `v2/Orders/GetOrdersV2/false`,
        "post",

        {
          orderDate: filterModel.orderDate || "0001-01-01T00:00:00",
          deliveryDate: filterModel.deliveryDate || "0001-01-01T00:00:00",
          targetOrgUid: filterModel.targetOrgUid,
          paginationFilter: {
            pageNumber: page,
            pageSize: itemsPerPage,
          },
        },
        "Auth"
      );

      const sortedData = sortData(response.data.data);
      setData(response.data.data);
      setTotalPages(Math.ceil(response.data.totalRecords / itemsPerPage));
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
    fetchFilteredData(currentPage);
  }, [currentPage]);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchFilteredData(1);
  };

  const handleInputChange = (field, value) => {
    setFilterModel({ ...filterModel, [field]: value });
  };

  const handleDeleteUser = (userId) => {
    setSelectedUserId(userId);
    setIsDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setIsDeleteDialogOpen(false);
  };

  const getOrderStatus = (status) => {
    switch (status) {
      case 1:
        return "New";
      case 2:
        return "Confirmed";
      case 3:
        return "Rejected";
      case 4:
        return "Delivered";
      case 104:
        return "Delivered";
      case 108:
        return "In Transit";
      case 103:
        return "Not Delivered";
      case 60:
        return "Completed";
      case 59:
        return "Partially Delivered";
      case 61:
        return "Returned";
      default:
        return "Unknown";
    }
  };

  const getOrderStatusStyle = (status) => {
    switch (status) {
      case 1:
        return " border-2 text-center  fw-1 bg-transprent border-blue-500 text-blue-500";
      case 2:
        return " border-2 text-center  fw-1 bg-transprent border-yellow-500 text-yellow-500";
      case 3:
        return " border-2 text-center  fw-1 bg-transprent border-red-500 text-red-500";
      case 4:
        return " border-2 text-center  fw-1 bg-transprent border-green-500 text-green-500  ";
      case 104:
        return " border-2 text-center  fw-1 bg-transprent border-green-500 text-green-500  ";
      case 108:
        return " border-2 text-center  fw-1 bg-transprent border-yellow-500 text-yellow-500  ";
      case 59:
        return " border-2 text-center  fw-1 bg-transprent border-purple-500 text-purple-400 ";
      case 60:
        return " border-2 text-center   fw-1 bg-transprent border-teal-500 text-teal-500";
      case 61:
        return " border-2 text-center  fw-1 bg-transprent border-orange-500 text-orange-500 ";
      default:
        return " border-2 text-center  fw-1 bg-transprent border-gray-500 text-gray-500";
    }
  };

  const handleSort = (column) => {
    const newDirection =
      sortColumn === column && sortDirection === "asc" ? "desc" : "asc";
    setSortColumn(column);
    setSortDirection(newDirection);
    const sortedData = sortData(data);
    setData(sortedData);
  };

  const sortData = (data) => {
    return data.sort((a, b) => {
      let aValue = a[sortColumn];
      let bValue = b[sortColumn];

      if (sortColumn === "orderdate" || sortColumn === "deliverydate") {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }

      if (sortDirection === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  };

  const OrderStatusCell = ({ status }) => (
    <td className="px-2 py-2">
      <Badge className={getOrderStatusStyle(status)}>
        {getOrderStatus(status)}
      </Badge>
    </td>
  );

  return (
    <div className="container mx-auto">
      <div className="flex ">
        <SearchIcon className="text-gray-500" size={19} />
        <h1 className="text-[20px] font-semibold mb-4 pl-2">Search</h1>
      </div>
      <div className="mb-4 grid grid-cols-1 lg:grid-cols-2 gap-x-10">
        <div className="flex items-center mb-2">
          <label className="w-1/4 font-medium mr-2">Order Date</label>
          <input
            type="date"
            className="border border-gray-300 px-4 py-2 rounded w-3/4"
            onChange={(e) => handleInputChange("orderDate", e.target.value)}
          />
        </div>
        <div className="flex items-center mb-2">
          <label className="w-1/4 font-medium mr-2">Delivery Date</label>
          <input
            type="date"
            className="border border-gray-300 px-4 py-2 rounded w-3/4"
            onChange={(e) => handleInputChange("deliveryDate", e.target.value)}
          />
        </div>
        <div className="flex items-center mb-2">
          <label className="w-1/4 font-medium mr-2">Warehouse</label>
          <select
            className="border border-gray-300 px-4 py-2 rounded w-3/4"
            onChange={(e) => handleInputChange("targetOrgUid", e.target.value)}
          >
            <option value="">Select Warehouse</option>
            {organisations.map((org) => (
              <option key={org.uid} value={org.uid}>
                {org.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="flex justify-center lg:mb-12 mb-3 items-center">
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
        <div className="text-2xl text-orange-400">Purchase Order List</div>
        {/* <div className="">
          <Link href={"/admin/Ordering/Purchase/po/Addpo"}>
            <Button color="warning" className="shadow-md">
              <Plus size={20} className="pr-1" />
              Add PO
            </Button>
          </Link>
        </div> */}
      </div>

      <table className="min-w-full text-left">
        <thead>
          <tr>
            <th className="px-2 py-2 cursor-pointer">#SR</th>
            <th
              className="px-2 py-2 cursor-pointer"
              onClick={() => handleSort("orderdate")}
            >
              DATE
              {sortColumn === "orderdate" &&
                (sortDirection === "asc" ? "▲" : "▼")}
            </th>
            <th
              className="px-2 py-2 cursor-pointer"
              onClick={() => handleSort("mrid")}
            >
              Req. No
              {sortColumn === "mrid" && (sortDirection === "asc" ? "▲" : "▼")}
            </th>
            <th
              className="px-2 py-2 cursor-pointer"
              onClick={() => handleSort("orderdeliverfromname")}
            >
              WAREHOUSE
              {sortColumn === "orderdeliverfromname" &&
                (sortDirection === "asc" ? "▲" : "▼")}
            </th>
            <th
              className="px-2 py-2 cursor-pointer"
              onClick={() => handleSort("totalOrderQty")}
            >
              TOTAL QUANTITY
              {sortColumn === "totalOrderQty" &&
                (sortDirection === "asc" ? "▲" : "▼")}
            </th>
            <th
              className="px-2 py-2 cursor-pointer"
              onClick={() => handleSort("totalReceivedQty")}
            >
              QUOTED QUANTITY
              {sortColumn === "totalReceivedQty" &&
                (sortDirection === "asc" ? "▲" : "▼")}
            </th>
            <th
              className="px-2 py-2 cursor-pointer"
              onClick={() => handleSort("orderstatus")}
            >
              STATUS
              {sortColumn === "orderstatus" &&
                (sortDirection === "asc" ? "▲" : "▼")}
            </th>
            <th className="px-2 py-2">ACTION</th>
          </tr>
        </thead>

       <tbody>
  {data && data.length > 0 ? (
    data.map((item) => (
      <tr key={item.id}>
        <td className="px-2 py-2">{item?.orderid}</td>
        <td className="px-2 py-2">{item?.orderdate}</td>
        <td className="px-2 py-2">{item?.materialRequest?.mrid}</td>
        <td className="px-2 py-2">{item?.orderdeliverfromname}</td>
        <td className="px-2 py-2">{item?.materialRequest?.totalOrderQty}</td>
        <td className="px-2 py-2">{item?.totalReceivedQty ?? 0}</td>
        <OrderStatusCell status={item.orderstatus} />
        <td className="px-2 py-2">
          {item.orderstatus == 1 ? (
            <div className="flex mb-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link href={`/admin/Ordering/Purchase/po/viewpocancle/${item.orderid}`}>
                      <Button
                        color="transprent"
                        className="p-0 text-black dark:text-white text-sm px-2"
                      >
                        <Eye size={15} />
                      </Button>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent color="primary">
                    <p>View</p>
                    <TooltipArrow className="fill-primary" />
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      color="transprent"
                      className="p-0 text-black dark:text-white text-sm"
                      onClick={() => handleDeleteUser(item.orderid)}
                    >
                      <Trash size={20} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent color="primary">
                    <p>Delete</p>
                    <TooltipArrow className="fill-primary" />
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      color="transprent"
                      className="p-0 dark:text-white text-black px-2"
                    >
                      <Mail size={20} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent color="primary">
                    <p>Mail</p>
                    <TooltipArrow className="fill-primary" />
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          ) : (
            <div className="flex mb-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link href={`/admin/Ordering/Purchase/po/viewpocancle/${item.orderid}`}>
                      <Button
                        color="transprent"
                        className="p-0 mr-2 text-black dark:text-white text-sm px-2"
                      >
                        <Eye size={15} />
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
          )}
        </td>
      </tr>
    ))
  ) : (
    <tr>
      <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
        No data found
      </td>
    </tr>
  )}
</tbody>

      </table>

      <div className="flex justify-end mt-4">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </div>

      <DeleteDialog
        isOpen={isDeleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        callfor={CallFor}
        onDelete={() => {
          fetchFilteredData(1);
          setIsDeleteDialogOpen(false);
        }}
        delUrl={`v2/Orders/DeleteOrder?id=${selectedUserId}`}
      />
    </div>
  );
};

export default PO;
