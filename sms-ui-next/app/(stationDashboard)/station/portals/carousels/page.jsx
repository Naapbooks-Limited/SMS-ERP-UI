"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Check,
  Eye,
  FilePenLine,
  Plus,
  Search,
  SearchIcon,
  Trash,
  Upload,
} from "lucide-react";
import { useRouter } from "next/navigation";
import DeleteDialog from "@/components/DeleteDialog";
import Pagination from "@/components/pagination/Pagination";
import CallFor2 from "@/utilities/CallFor2";
import {
  Tooltip,
  TooltipArrow,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Link from "next/link";

const Staff = () => {
  const [data, setData] = useState([]);
  const [bodyData, setBodyData] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  const [tempSearchFields, setTempSearchFields] = useState({
    activeId: "0",
    widgetZone: "0",
    dataSource: "0",
  });

  const [searchFields, setSearchFields] = useState({
    activeId: "0",
    widgetZone: "0",
    dataSource: "0",
  });

  const [sortConfig, setSortConfig] = useState({ key: "", direction: "asc" });
  const router = useRouter();
  const userData = JSON.parse(sessionStorage.getItem("userData") || "{}");
  const isAdmin = userData.isadmin === true;
  const roleId = userData.roleid;

  const fetchBodyData = async () => {
    try {
      setLoading(true);
      const response = await CallFor2(`api/OCarouselVendorShopAdminAPI/List`, "get", null, "Auth");
      setBodyData(response.data);
      setLoading(false);
    } catch (error) {
      setError(error);
      setLoading(false);
    }
  };

  const fetchData = async () => {
    if (!bodyData) return; // Don't fetch if bodyData is not available

    setLoading(true);
    try {
      const requestData = {
        ...bodyData,
        Page: currentPage,
        PageSize: itemsPerPage,
        Start: (currentPage - 1) * itemsPerPage,
        Length: itemsPerPage,
        CustomProperties: {},
        // Add search parameters based on the API response structure
        SearchActiveId: parseInt(searchFields.activeId) || 0,
        SearchWidgetZones: searchFields.widgetZone !== "0" ? [parseInt(searchFields.widgetZone)] : [0],
        SearchDataSources: searchFields.dataSource !== "0" ? [parseInt(searchFields.dataSource)] : [0],
      };

      const response = await CallFor2(
        `api/OCarouselVendorShopAdminAPI/List`,
        "POST",
        requestData,
        "Auth"
      );
      setData(response.data.Data);
      setTotalPages(Math.ceil(response.data.recordsTotal / itemsPerPage));
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
      fetchData();
    }
  }, [currentPage, bodyData, searchQuery]);

  useEffect(() => {
    setCurrentPage(1); // Reset to first page on search
  }, [searchQuery]);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleSearch = () => {
    console.log(tempSearchFields, "search");
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

  // Since filtering is now handled by the API, we'll use the data directly
  const displayData = sortedData;

  return (
    <div className="container mx-auto">
      <div className="flex">
        <SearchIcon className="text-gray-500" size={19} />
        <h1 className="text-[20px] font-semibold mb-4 pl-2">Search</h1>
      </div>
      <div className="mb-4 grid grid-cols-1 lg:grid-cols-3 gap-x-10">
        {Object.keys(tempSearchFields).map((field) => (
          <div key={field} className="flex items-center mb-2">
            <label className="w-1/3 font-medium mr-2">
              {field === "activeId" && "Active"}
              {field === "widgetZone" && "Widget Zone"}
              {field === "dataSource" && "Data Source"}
            </label>
            <select
              className="border border-gray-300 px-4 py-2 rounded w-2/3"
              value={tempSearchFields[field]}
              onChange={(e) => handleInputChange(field, e.target.value)}
            >
              {field === "activeId" && (
                <>
                  {bodyData?.AvailableActiveOptions?.map((option) => (
                    <option key={option.Value} value={option.Value}>
                      {option.Text}
                    </option>
                  ))}
                </>
              )}
              {field === "widgetZone" && (
                <>
                  {bodyData?.AvailableWidgetZones?.map((option) => (
                    <option key={option.Value} value={option.Value}>
                      {option.Text}
                    </option>
                  ))}
                </>
              )}
              {field === "dataSource" && (
                <>
                  {bodyData?.AvailableDataSources?.map((option) => (
                    <option key={option.Value} value={option.Value}>
                      {option.Text}
                    </option>
                  ))}
                </>
              )}
            </select>
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
        <div className="text-2xl text-orange-400">Carousel List</div>
        <div>
          <Button
            color="warning"
            className="shadow-md"
            onClick={() => router.push("/station/portals/carousels/addcarousels")}
          >
            <Plus size={20} className="pr-1" />
            Add
          </Button>
        </div>
      </div>
      <table className="min-w-full text-left">
        <thead>
          <tr>
            <th
              className="px-4 py-2 cursor-pointer"
              onClick={() => handleSort("Name")}
            >
              Name
              {sortConfig.key === "Name"
                ? sortConfig.direction === "asc"
                  ? "▲"
                  : "▼"
                : ""}
            </th>
            <th
              className="px-4 py-2 cursor-pointer"
              onClick={() => handleSort("Title")}
            >
              Title
              {sortConfig.key === "Title"
                ? sortConfig.direction === "asc"
                  ? "▲"
                  : "▼"
                : ""}
            </th>
            <th
              className="px-4 py-2 cursor-pointer"
              onClick={() => handleSort("DataSourceTypeStr")}
            >
              Data source type
              {sortConfig.key === "DataSourceTypeStr"
                ? sortConfig.direction === "asc"
                  ? "▲"
                  : "▼"
                : ""}
            </th>
            <th
              className="px-4 py-2 cursor-pointer"
              onClick={() => handleSort("WidgetZoneStr")}
            >
              Widget zone
              {sortConfig.key === "WidgetZoneStr"
                ? sortConfig.direction === "asc"
                  ? "▲"
                  : "▼"
                : ""}
            </th>
            <th
              className="px-4 py-2 cursor-pointer"
              onClick={() => handleSort("DisplayOrder")}
            >
              Display order
              {sortConfig.key === "DisplayOrder"
                ? sortConfig.direction === "asc"
                  ? "▲"
                  : "▼"
                : ""}
            </th>
            <th
              className="px-4 py-2 cursor-pointer"
              onClick={() => handleSort("Active")}
            >
              Active
              {sortConfig.key === "Active"
                ? sortConfig.direction === "asc"
                  ? "▲"
                  : "▼"
                : ""}
            </th>
            <th
              className="px-4 py-2 cursor-pointer"
              onClick={() => handleSort("action")}
            >
              ACTION{" "}
              {sortConfig.key === "action"
                ? sortConfig.direction === "asc"
                  ? "▲"
                  : "▼"
                : ""}
            </th>
          </tr>
        </thead>

        <tbody>
          {displayData.map((item, index) => (
            <tr key={item.uid}>
              <td className="px-4 py-2">{item.Name}</td>
              <td className="px-4 py-2">{item.Title}</td>
              <td className="px-4 py-2">{item.DataSourceTypeStr}</td>
              <td className="px-4 py-2">{item.WidgetZoneStr}</td>
              <td className="px-4 py-2">{item.DisplayOrder}</td>
              <td className="px-4 py-2">
                {item.Active ? (
                  <Check size={20} className="text-success-700" />
                ) : (
                  ""
                )}
              </td>
              <td className="px-4 py-2">
                <div>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          className="p-0 mr-2 bg-transparent hover:bg-transparent text-black dark:text-gray-300"
                          onClick={() =>
                            router.push(
                              `/station/portals/carousels/editcarousels/${item.Id}`
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
                          onClick={() => handleDeleteUser(item.Id)}
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
        callfor={CallFor2}
        onDelete={() => {
          fetchData();
          setIsDeleteDialogOpen(false);
        }}
        delUrl={`api/OCarouselVendorShopAdminAPI/Delete/${selectedUserId}`}
      />
    </div>
  );
};

export default Staff;