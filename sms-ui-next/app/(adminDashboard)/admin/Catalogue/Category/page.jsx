"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Download,
  Eye,
  FilePenLine,
  Plus,
  Search,
  SearchIcon,
  Trash,
  Upload,
  Check,
  X
} from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Link from "next/link";
import CallFor from "@/utilities/CallFor";
import DeleteDialog from "@/components/DeleteDialog"; // Import DeleteDialog component
import Pagination from "@/components/pagination/Pagination"; // Import Pagination component
import {
  Tooltip,
  TooltipArrow,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";


const Categories = () => {
  const [data, setData] = useState([]);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false); // State for delete dialog
  const [selectedUserId, setSelectedUserId] = useState(null); // State for selected user id
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [tempSearchFields, setTempSearchFields] = useState({
    "Category name": "",
    "Is Published": "",
    // "Sub Category": "",
  });
  const [searchFields, setSearchFields] = useState({
    userId: "",
    id: "",
    title: "",
    completed: "",
  });
  const [sortConfig, setSortConfig] = useState({ key: "", direction: "asc" });
  const dataa = {
    catname: "",
    ispublished: null,
  };

  const [filterModel, setFilterModel] = useState({
    catname: null,
    ispublished: null,
    paginationFilter: {
      pageNumber: 1,
      pageSize: pageSize
    }
  });
 const fetchData = async () => {
  setLoading(true);
  try {
    const response = await CallFor(
      `v2/Common/GetCategoryList`,
      "POST",
      filterModel,
      "Auth"
    );

    setData(response.data.data);
    setTotalPages(Math.ceil(response.data.totalCount / filterModel.paginationFilter.pageSize));
    setLoading(false);
  } catch (error) {
    setError(error);
    setLoading(false);
  }
};

  useEffect(() => {
    fetchData();
  }, [filterModel]);

 const handlePageChange = (pageNumber) => {
  setFilterModel(prevState => ({
    ...prevState,
    paginationFilter: {
      ...prevState.paginationFilter,
      pageNumber: pageNumber
    }
  }));
};
  const handlePageSizeChange = (size) => {
    setFilterModel(prevState => ({
      ...prevState,
      paginationFilter: {
        ...prevState.paginationFilter,
        pageSize: size
      }
    }));
  };

  const handleSearch = () => {
    setFilterModel(prevState => ({
      ...prevState,
      catname: tempSearchFields["Category name"] || null,
      ispublished: tempSearchFields["Is Published"] === "" ? null : tempSearchFields["Is Published"] === "true",
      paginationFilter: {
        ...prevState.paginationFilter,
        pageNumber: 1 // Reset to first page on search
      }
    }));
  };

  const handleInputChange = (columnName, value) => {
    setTempSearchFields({ ...tempSearchFields, [columnName]: value });
  };
 
 

  useEffect(() => {
    setPage(1); // Reset to first page on search
  }, [searchQuery, pageSize]);


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
    for (let key in searchFields) {
      if (searchFields[key] !== "") {
        const itemValue = item[key]?.toString().toLowerCase() || "";
        const searchValue = searchFields[key].toLowerCase();
        if (!itemValue.includes(searchValue)) {
          return false;
        }
      }
    }
    return true;
  });

  // Slice the filtered data based on page and pageSize
  const startIndex = (page - 1) * pageSize;
  const slicedData = filteredData.slice(startIndex, startIndex + pageSize);

  // Delete
  const handleDeleteUser = async (userId) => {
    setSelectedUserId(userId); // Set selected user id
    setIsDeleteDialogOpen(true); // Open delete dialog with selected user id
  };

  const handleCloseDeleteDialog = () => {
    setIsDeleteDialogOpen(false); // Close delete dialog
  };

  return (
    <div className="container mx-auto">
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
            {field === "Is Published" ? (
              <select
                className="border border-gray-300 px-4 py-2 rounded w-3/4"
                onChange={(e) => handleInputChange(field, e.target.value)}
              >
                <option value="">All</option>
                <option value="true">Published</option>
                <option value="false">Not Published</option>
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
          <Search size={20} className="pr-1" />
          Search
        </Button>
      </div>

      <div className=" justify-between flex gap-1 pb-3 ">
        <div className="text-2xl text-orange-400">Category List</div>
        <div>
          <Link href={"/admin/Catalogue/Category/categoriadd"}>
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
              className="px-4 py-2 cursor-pointer"
              onClick={() => handleSort("catid")}
            >
              SR.NO{" "}
              {sortConfig.key === "catid"
                ? sortConfig.direction === "asc"
                  ? "▲"
                  : "▼"
                : ""}
            </th>
            <th
              className="px-4 py-2 cursor-pointer"
              onClick={() => handleSort("catname")}
            >
              NAME{" "}
              {sortConfig.key === "catname"
                ? sortConfig.direction === "asc"
                  ? "▲"
                  : "▼"
                : ""}
            </th>
            <th
              className="px-4 py-2 cursor-pointer"
              onClick={() => handleSort("ispublished")}
            >
              PUBLISHED{" "}
              {sortConfig.key === "ispublished"
                ? sortConfig.direction === "asc"
                  ? "▲"
                  : "▼"
                : ""}
            </th>
            <th
              className="px-4 py-2 cursor-pointer"
              onClick={() => handleSort("parentCategoryName")}
            >
              DisplayOrder{" "}
              {sortConfig.key === "parentCategoryName"
                ? sortConfig.direction === "asc"
                  ? "▲"
                  : "▼"
                : ""}
            </th>

            <th className="px-4 py-2">ACTION</th>
          </tr>
        </thead>
        {/* Table data */}
        <tbody>
          {filteredData?.map((item) => (
            <tr key={item.catid}>
              <td className="px-4 py-2">{item.catid}</td>
              <td className="px-4 py-2">{item.catname}</td>
              <td className="px-4 py-2">
                {item.ispublished ? (
                  <Check size={20} className="text-success-700" />
                ) : (
                  <X size={20} className="text-red-500" />
                )}
              </td>
              <td className="px-4 py-2">{item.displayorder || 0}</td>
              <td className="px-4 py-2">
                <div>

                   <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                            
                  <Link
                    href={`/admin/Catalogue/Category/categoriview/${item.catid}`}
                  >
                    <Button className="p-0 mr-2 bg-transparent hover:bg-transparent text-black  dark:text-white  ">
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
                                <Link
                    href={`/admin/Catalogue/Category/categoriedit/${item.catid}`}
                  >
                    <Button className="p-0 mr-2 bg-transparent hover:bg-transparent text-black  dark:text-white  ">
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
                    className="p-0 bg-transparent hover:bg-transparent text-black  dark:text-white "
                    onClick={() => handleDeleteUser(item.catid)} // Open delete dialog on click
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
          currentPage={filterModel.paginationFilter.pageNumber}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          className="flex justify-end"
        />
      </div>

      {/* Delete Dialog */}
      <DeleteDialog
        isOpen={isDeleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        callfor={CallFor}
        onDelete={() => {
          fetchData(); // Refresh data after deletion
          setIsDeleteDialogOpen(false); // Close delete dialog
        }}
        delUrl={`v2/Common/DeleteCategory?Id=${selectedUserId}`} // Pass delete URL
      />
    </div>
  );
};

export default Categories;
