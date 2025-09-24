"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Eye, SearchIcon } from "lucide-react";
import Link from "next/link";
import CallFor from "@/utilities/CallFor";
import Pagination from "@/components/pagination/Pagination";
import { Check, FilePenLine, Plus, Search, Trash, X } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useRouter } from "next/navigation";
import DeleteDialog from "@/components/DeleteDialog";
import {
  Tooltip,
  TooltipArrow,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const ExternalWareHouse = () => {
  const router = useRouter();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;
  const [searchQuery, setSearchQuery] = useState("");
  const [tempSearchFields, setTempSearchFields] = useState({
    Name: "",
    Phone: "",
  });
  const [sortConfig, setSortConfig] = useState({ key: "", direction: "asc" });
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false); // State for delete dialog
  const [selectedWarhouseID, setSelectedWarhouseID] = useState('')


  useEffect(() => {
    getExternalWareHouseList();
  }, [currentPage, searchQuery]);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleSearch = () => {
    setSearchQuery(tempSearchFields);
    setCurrentPage(1); // Reset to the first page when searching
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
  
  const sortedData = data.length > 0 ? [...data].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === "asc" ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === "asc" ? 1 : -1;
    }
    return 0;
  }) : [];
  

  const getExternalWareHouseList = async () => {
    const payloadData = {
      companyname: searchQuery.Name || "",
      companyemail: searchQuery.Email || "",
      companymobile: searchQuery.Phone || "",
      ownerfullName: searchQuery.City || "",
      paginationFilter: {
        pageNumber: currentPage,
        pageSize: 10
      }
    }
    const response = await CallFor(`v2/account/GetAllExternalDealers`, 'POST', JSON.stringify(payloadData), 'Auth');
    if (response?.status === 200) {
      console.log(response, "response")
      setData(response?.data?.data)
    }
  }

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
      <div className="mb-4 grid grid-cols-1 lg:grid-cols-2 gap-x-10">
        {Object.keys(tempSearchFields).map((field) => (
          <div key={field} className="flex items-center mb-2">
            <label className="w-1/4 font-medium mr-2">{field}</label>
            {field === "CreatedFrom" || field === "Created To" ? (
              <input
                type="date"
                className="border border-gray-300 px-4 py-2 rounded w-3/4"
                value={tempSearchFields[field]}
                onChange={(e) => handleInputChange(field, e.target.value)}
              />
            ) : field === "Log Leve" ? (
              <select
                className="border border-gray-300 px-4 py-2 rounded w-3/4"
                value={tempSearchFields[field]}
                onChange={(e) => handleInputChange(field, e.target.value)}
              >
                <option value=""></option>
                <option value="INFO">INFO</option>
                <option value="DEBUG">DEBUG</option>
                <option value="ERROR">ERROR</option>
              </select>
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
          <SearchIcon size={20} className="pr-1" />
          Search
        </Button>
      </div>

      <div className="flex justify-between items-center mb-4">
        <div className="text-2xl text-orange-400">External Vendor List</div>
        <div className="flex">
          {/* <Link href="/station/portals/Banner/previewbanner">
            <Button color="warning" className="shadow-md me-2">Preview</Button>
          </Link> */}
          <Link href="/station/station/Externalwarehouse/AddExternalWarehouse">
            <Button color="warning" className="shadow-md">
              <Plus size={20} className="pr-1" />
              Add
            </Button>
          </Link>
        </div>
      </div>

      {/* Table */}
      <table className="min-w-full text-left">
        {/* Table headers */}
        <thead>
  <tr>
    <th
      className="px-2 py-2 cursor-pointer"
      onClick={() => handleSort("userId")}
    >
      SR.NO
      {sortConfig.key === "userId"
        ? sortConfig.direction === "asc"
          ? "▲"
          : "▼"
        : ""}
    </th>
    <th
      className="px-2 py-2 cursor-pointer"
      onClick={() => handleSort("companyName")}
    >
      Vendor Name
      {sortConfig.key === "companyName"
        ? sortConfig.direction === "asc"
          ? "▲"
          : "▼"
        : ""}
    </th>
    <th
      className="px-2 py-2 cursor-pointer"
      onClick={() => handleSort("ownerFullName")}
    >
      Owner Name
      {sortConfig.key === "ownerFullName"
        ? sortConfig.direction === "asc"
          ? "▲"
          : "▼"
        : ""}
    </th>
    <th
      className="px-4 py-2 cursor-pointer"
      onClick={() => handleSort("companyMobile")}
    >
      Phone Number
      {sortConfig.key === "companyMobile"
        ? sortConfig.direction === "asc"
          ? "▲"
          : "▼"
        : ""}
    </th>
    <th
      className="px-4 py-2 cursor-pointer"
      onClick={() => handleSort("companyEmail")}
    >
      Email
      {sortConfig.key === "companyEmail"
        ? sortConfig.direction === "asc"
          ? "▲"
          : "▼"
        : ""}
    </th>
    <th className="px-4 py-2 cursor-pointer text-center">ACTION</th>
  </tr>
</thead>

        {/* Table data */}
        <tbody>
          {sortedData.map((item) => (
            <tr key={item.eid}>
              <td className=" px-2 py-2">{item.id}</td>
              <td className=" px-2 py-2">{item.companyName}</td>
              <td className=" px-2 py-2">{item.ownerFullName}</td>
              <td className=" px-2 py-2">{item.companyMobile}</td>
              <td className=" px-2 py-2">{item.companyEmail}</td>
              <td className=" px-2 py-2">
                <div className="text-center">

                   <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Link href={`/station/station/Externalwarehouse/ViewExternalwarehouse/${item.id}`}>
                    <Button className="p-0 mr-2 bg-transparent text-black hover:bg-transparent dark:text-gray-300">
                      <Eye size={20} />
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
                    className="p-0 mr-2 bg-transparent hover:bg-transparent text-black dark:text-gray-300"
                    onClick={() =>
                      router.push(
                        `/station/station/Externalwarehouse/UpdateExternalwarehouse/${item.id}`
                      )
                    }
                  >
                    <FilePenLine size={20}></FilePenLine>
                  </Button>
                            </TooltipTrigger>
                            <TooltipContent color="primary">
                              <p>Edit</p>
                              <TooltipArrow className="fill-primary" />
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                         <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                    className="p-0 bg-transparent hover:bg-transparent text-black dark:text-gray-300"
                    onClick={() => {setSelectedWarhouseID(item.id);setIsDeleteDialogOpen(true);}}
                  >
                    <Trash size={20}></Trash>
                  </Button>
                            </TooltipTrigger>
                            <TooltipContent color="primary">
                              <p>Delete</p>
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
          getExternalWareHouseList(); // Refresh data after deletion
          setIsDeleteDialogOpen(false); // Close delete dialog
        }}
        delUrl={`v2/account/DeleteExternalDealer?Id=${selectedWarhouseID}`} // Pass delete URL
      />
    </div>
  );
};

export default ExternalWareHouse;
