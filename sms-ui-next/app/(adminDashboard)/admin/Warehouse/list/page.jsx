"use client"
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Eye,
  FilePenLine,
  Plus,
  Search,
  SearchIcon,
  Trash,
} from "lucide-react";
import { useRouter } from "next/navigation";
import CallFor from "@/utilities/CallFor";
import DeleteDialog from "@/components/DeleteDialog";
import Pagination from "@/components/pagination/Pagination";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipArrow,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Link from "next/link";
const Warehouse = () => {
  const [data, setData] = useState([]);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  const [searchFields, setSearchFields] = useState({
    orgname: "",
    orgemail: "",
    orgmobile: "",
    status: "",
  });

  const [sortConfig, setSortConfig] = useState({ key: "", direction: "asc" });
  const router = useRouter();

  const [bodyData, setBodyData] = useState(null);

  const fetchBodyData = async () => {
    try {
      setLoading(true);
      const response = await CallFor("v2/Organization/OrganizationList", "get", null, "Auth");
      setBodyData(response.data);
      setLoading(false);
    } catch (error) {
      setError(error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBodyData();
  }, []);

  useEffect(() => {
    if (bodyData) {
      fetchData(currentPage, searchFields);
    }
  }, [currentPage, bodyData]);

  const fetchData = async (page, fields) => {
    setLoading(true);
    try {
      const requestBody = {
        "roleid": 4,
        orgname: fields.orgname || null,
        orgemail: fields.orgemail || null,
        orgmobile: fields.orgmobile || null,
        status: fields.status || null,
        paginationFilter: {
          pageNumber: page,
          pageSize: itemsPerPage
        }
      };

      const response = await CallFor(
        `v2/Organization/OrganizationList`,
        "POST",
        JSON.stringify(requestBody),
        "Auth"
      );
      setData(response.data.data);
      setTotalPages(Math.ceil(response.data.totalCount / itemsPerPage));
      setLoading(false);
    } catch (error) {
      setError(error);
      setData([]);
      setTotalPages(0);
      setLoading(false);
    }
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchData(1, searchFields);
  };

  const handleInputChange = (columnName, value) => {
    setSearchFields(prevFields => ({ ...prevFields, [columnName]: value }));
  };

  const handleSort = (columnName) => {
    let direction = "asc";
    if (sortConfig.key === columnName && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key: columnName, direction });
  };

  const handleDeleteUser = (userId) => {
    setSelectedUserId(userId);
    setIsDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setIsDeleteDialogOpen(false);
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

  return (
    <div className="container mx-auto">
      <div className="flex">
        <SearchIcon className="text-gray-500" size={19} />
        <h1 className="text-[20px] font-semibold mb-4 pl-2">Search</h1>
      </div>
      <div className="mb-4 grid grid-cols-1 lg:grid-cols-2 gap-x-10">
        {Object.keys(searchFields).map((field) => (
          <div key={field} className="flex items-center mb-2">
            <label className="w-1/4 font-medium mr-2">
              {field === "orgname" && "Warehouse Name"}
              {field === "orgemail" && "Email"}
              {field === "orgmobile" && "Mobile"}
              {field === "status" && "Status"}
            </label>
            {field === "status" ? (
              <select
                className="border border-gray-300 px-4 py-2 rounded w-3/4"
                onChange={(e) => handleInputChange(field, e.target.value)}
                value={searchFields[field]}
              >
                <option value="">All</option>
                {bodyData?.mastervalues?.status?.mastervalues.map((status) => (
                  <option key={status.mvid} value={status.mvid}>
                    {status.mastervalue1}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                className="border border-gray-300 px-4 py-2 rounded w-3/4"
                value={searchFields[field]}
                onChange={(e) => handleInputChange(field, e.target.value)}
              />
            )}
          </div>
        ))}
      </div>
      <div className="flex justify-center w-full mb-2">
        <Button color="warning" className="shadow-md" onClick={handleSearch}>
          <Search size={20} className="pr-1" />
          Search
        </Button>
      </div>
      <div className="mb-4 flex items-center justify-between">
        <div className="text-2xl text-orange-400">Warehouse List</div>
        <div>
          <Button
            color="warning"
            className="shadow-md"
            onClick={() => router.push("/admin/Warehouse/list/addWareHouse")}
          >
            <Plus size={20} className="pr-1" />
            Add
          </Button>
        </div>
      </div>
      {loading ? (
        <div className="text-center py-4">Loading...</div>
      ) : data.length > 0 ? (
        <table className="min-w-full text-left">
          <thead>
            <tr>
              <th className="px-4 py-2 cursor-pointer">SR.NO</th>
              <th
                className="px-4 py-2 cursor-pointer"
                onClick={() => handleSort("orgname")}
              >
                NAME{" "}
                {sortConfig.key === "orgname"
                  ? sortConfig.direction === "asc"
                    ? "▲"
                    : "▼"
                  : ""}
              </th>
              <th
                className="px-4 py-2 cursor-pointer"
                onClick={() => handleSort("noOfStation")}
              >
                NO OF STATION{" "}
                {sortConfig.key === "noOfStation"
                  ? sortConfig.direction === "asc"
                    ? "▲"
                    : "▼"
                  : ""}
              </th>
              <th
                className="px-4 py-2 cursor-pointer"
                onClick={() => handleSort("address")}
              >
                LOCATION{" "}
                {sortConfig.key === "address"
                  ? sortConfig.direction === "asc"
                    ? "▲"
                    : "▼"
                  : ""}
              </th>
              <th
                className="px-4 py-2 cursor-pointer"
                onClick={() => handleSort("managerName")}
              >
                MANAGER{" "}
                {sortConfig.key === "managerName"
                  ? sortConfig.direction === "asc"
                    ? "▲"
                    : "▼"
                  : ""}
              </th>
              <th
                className="px-4 py-2 cursor-pointer"
                onClick={() => handleSort("status")}
              >
                STATUS{" "}
                {sortConfig.key === "status"
                  ? sortConfig.direction === "asc"
                    ? "▲"
                    : "▼"
                  : ""}
              </th>
              <th className="px-4 py-2">ACTION</th>
            </tr>
          </thead>
          <tbody>
            {sortedData.map((item, index) => (
              <tr key={item.uid}>
                <td className="px-4 py-2">
                  {(currentPage - 1) * itemsPerPage + index + 1}
                </td>
                <td className="px-4 py-2">{item.orgname}</td>
                <td className="px-4 py-2">{item.noOfStation}</td>
                <td className="px-4 py-2">{item.address}</td>
                <td className="px-4 py-2">{item.managerName}</td>
                <td className="px-4 py-2">
                  {item.status == 48 ? (
                    <Badge color="success" variant="outline">
                      Active
                    </Badge>
                  ) : item.status == 49 ? (
                    <Badge color="destructive" variant="outline">
                      Inactive
                    </Badge>
                  ) : (
                    "N/A"
                  )}
                </td>
                <td className="px-4 py-2">
                  <div>
                   


                       <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Link href={`/admin/Warehouse/list/warehouseDeatil/${item.uoid}`}>
                                <Button
                                  color="warning"
                                  className="p-0 dark:text-white text-black text-sm px-1 bg-transparent hover:bg-transparent"
                                >
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

                         <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Link href={`/admin/Warehouse/list/editWarehouse/${item.uoid}`}>
                                <Button
                                  color="warning"
                                  className="p-0 dark:text-white text-black text-sm px-1 bg-transparent hover:bg-transparent"
                                >
                                   <FilePenLine size={20}></FilePenLine>
                                </Button>
                              </Link>
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
                      onClick={() => handleDeleteUser(item.uoid)}
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

                    {/* <Button
                      className="p-0 mr-2 bg-transparent hover:bg-transparent text-black dark:text-gray-300"
                      onClick={() =>
                        router.push(
                          `/admin/Warehouse/list/editWarehouse/${item.uoid}`
                        )
                      }
                    >
                      <FilePenLine size={20}></FilePenLine>
                    </Button> */}
                    
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="text-center py-4 text-gray-500">No data found</div>
      )}
      {data.length > 0 && (
        <div className="flex justify-end mt-4">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}
      <DeleteDialog
        isOpen={isDeleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        callfor={CallFor}
        onDelete={() => {
          fetchData(currentPage, searchFields);
          setIsDeleteDialogOpen(false);
        }}
        delUrl={`v2/Organization/DeleteOrganization?id=${selectedUserId}`}
      />
    </div>
  );
};

export default Warehouse;