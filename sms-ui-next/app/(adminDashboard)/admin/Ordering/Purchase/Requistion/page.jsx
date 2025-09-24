"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Check,
  Download,
  DownloadIcon,
  Eye,
  Import,
  Mail,
  Plus,
  Search,
  SearchIcon,
  Trash,
  Upload,
  X,
  Receipt
} from "lucide-react";
import {
  Tooltip,
  TooltipArrow,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Pagination from "@/components/pagination/Pagination";
import { useRouter } from "next/navigation";
import Link from "next/link";
import CallFor from "@/utilities/CallFor";
import DeleteDialog from "@/components/DeleteDialog";

const requisition = () => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [organisations, setOrganisations] = useState([]);
  const [searchParams, setSearchParams] = useState({
    dueDate: "",
    orgId: 0,
    requestDate: "",
  });
  

  const router = useRouter();

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    fetchData();
  }, [currentPage, itemsPerPage]);

  const fetchInitialData = async () => {
    try {
      const response = await CallFor("v2/Orders/GetMaterialRequests", "get", null, "Auth");
      setOrganisations(response.data.dropdowns.organisations);
    } catch (error) {
      setError(error);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const body = {
        ...searchParams,
        paginationFilter: {
          pageNumber: currentPage,
          pageSize: itemsPerPage,
        },
      };
      const response = await CallFor("v2/Orders/GetAllMaterialRequests", "post", body, "Auth");
      setData(response.data.data);
      setTotalPages(Math.ceil(response.data.totalRecords / itemsPerPage));
      setLoading(false);
    } catch (error) {
      setError(error);
      setLoading(false);
    }
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleSearch = () => {
    setCurrentPage(1);  // Reset to first page
    fetchData();        // Fetch data based on search parameters
  };

  const handleInputChange = (field, value) => {
  setSearchParams({ ...searchParams, [field]: value });
};
  const handleDeleteUser = (userId) => {
    setSelectedUserId(userId);
    setIsDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setIsDeleteDialogOpen(false);
  };

  return (
    <div className="container mx-auto">
      <div className="flex ">
        <SearchIcon className="text-gray-500" size={19} />
        <h1 className="text-[20px] font-semibold mb-4 pl-2">Search</h1>
      </div>
      {/* Search inputs */}
      <div className="mb-4 grid grid-cols-1 lg:grid-cols-3 gap-x-10">
        <div className="flex items-center mb-2">
          <label className="w-1/4 font-medium mr-2">Request Date</label>
          <input
            type="date"
            className="border border-gray-300 px-4 py-2 rounded w-3/4"
            onChange={(e) => handleInputChange("requestDate", e.target.value)}
          />
        </div>
        <div className="flex items-center mb-2">
          <label className="w-1/4 font-medium mr-2">Due Date</label>
          <input
            type="date"
            className="border border-gray-300 px-4 py-2 rounded w-3/4"
            onChange={(e) => handleInputChange("dueDate", e.target.value)}
          />
        </div>
        <div className="flex items-center mb-2">
          <label className="w-1/4 font-medium mr-2">Organisation</label>
          <select
            className="border border-gray-300 px-4 py-2 rounded w-3/4"
            onChange={(e) => handleInputChange("orgId", parseInt(e.target.value))}
          >
            <option value="0">All</option>
            {organisations.map((org) => (
              <option key={org.id} value={org.id}>
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
        <div className="text-2xl text-orange-400">Requisition</div>
        {/* <div className="">
          <Link href={"/admin/Ordering/Purchase/Requistion/createrequistion"}>
            <Button color="warning" className="shadow-md">
              <Plus size={20} className="pr-1" />
              Add
            </Button>
          </Link>
        </div> */}
      </div>

      {/* Table */}
      <table className="min-w-full text-left">
        <thead>
          <tr>
            <th className="px-2 py-2">#</th>
            <th className="px-2 py-2">DATE</th>
            <th className="px-2 py-2">DUE DATE</th>
            <th className="px-2 py-2">STATION</th>
            <th className="px-2 py-2">NO OF ITEMS</th>
            <th className="px-2 py-2">TOTAL QUANTITY</th>
            <th className="px-2 py-2">STATUS</th>
            <th className="px-2 py-2">ACTION</th>
          </tr>
        </thead>
        <tbody>
  {data && data.length > 0 ? (
    data.map((item) => (
      <tr key={item.id}>
        <td className="px-2 py-2">{item.mrid}</td>
        <td className="px-2 py-2">{item.mrdate.split("T")[0]}</td>
        <td className="px-2 py-2">{item.mrrequireddate.split("T")[0]}</td>
        <td className="px-2 py-2">{item.targetOrgName}</td>
        <td className="px-2 py-2">{item.totalProductItems}</td>
        <td className="px-2 py-2">{item.totalOrderQty}</td>
        <td className="px-2 py-2">
          {item.status == 78 ? (
            <p className="border-2 border-yellow-500 inline-block text-yellow-500 px-2 rounded-full">Pending</p>
          ) : item.status == 79 ? (
            <p className="border-2 border-gray-500 inline-block text-gray-500 px-2 rounded-full">Quote Received</p>
          ) : item.status == 107 ? (
            <p className="border-2 border-red-500 inline-block text-red-500 px-2 rounded-full">Cannot Fulfill</p>
          ) : item.status == 80 ? (
            <p className="border-2 border-green-500 inline-block text-green-500 px-2 rounded-full">PO Created</p>
          ) : item.status == 106 ? (
            <p className="border-2 border-red-500 inline-block text-red-500 px-2 rounded-full">Quote Rejected</p>
          ) : (
            <p className="border-2 border-green-500 inline-block text-green-500 px-2 rounded-full">Unknown</p>
          )}
        </td>
        <td className="px-2 py-2">
          {item.status == 78 ? (
            <div className="flex mb-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link href={`/admin/Ordering/Purchase/Requistion/viewrequistion/${item.mrid}`}>
                      <Button
                        color="warning"
                        className="p-0 dark:text-white text-black text-sm px-1 bg-transparent hover:bg-transparent"
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
                      className="p-0 dark:text-white text-black text-sm px-1 bg-transparent hover:bg-transparent"
                      onClick={() => handleDeleteUser(item.mrid)}
                    >
                      <Trash size={20} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent color="primary">
                    <p>Cancel</p>
                    <TooltipArrow className="fill-primary" />
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          ) : item.status == 79 ? (
            <div className="flex mb-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link href={`/admin/Ordering/Purchase/Requistion/viewacceptquatation/${item.mrid}`}>
                      <Button
                        color="warning"
                        className="p-0 dark:text-white text-black text-sm px-1 bg-transparent hover:bg-transparent"
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
          ) : (
            <div className="flex mb-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link href={`/admin/Ordering/Purchase/Requistion/viewacceptquatation/${item.mrid}`}>
                      <Button
                        color="warning"
                        className="p-0 dark:text-white text-black text-sm px-1 bg-transparent hover:bg-transparent"
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

      {/* Pagination */}
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
          fetchData();
          setIsDeleteDialogOpen(false);
        }}
        delUrl={`v2/Orders/DeleteMaterialRequest?id=${selectedUserId}`}
      />
    </div>
  );
};

export default requisition;      