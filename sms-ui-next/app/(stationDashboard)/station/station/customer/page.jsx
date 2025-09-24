"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
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
import { useRouter } from "next/navigation";
import CallFor from "@/utilities/CallFor";
import DeleteDialog from "@/components/DeleteDialog"; // Import DeleteDialog component
import Pagination from "@/components/pagination/Pagination";
import ImportModal from "@/components/Importmodel/importmodel";
import {
  Tooltip,
  TooltipArrow,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Link from "next/link";
const Customer = () => {
  const [exportUrl, setExportUrl] = useState("");
  const [ImportFileUrl, setImportFileUrl] = useState()
  const [sampleFIle, setsampleFile] = useState()

  const [data, setData] = useState([]);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false); // State for delete dialog
  const [selectedUserId, setSelectedUserId] = useState(null); // State for selected user id
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  const [searchQuery, setSearchQuery] = useState("");
  const [tempSearchFields, setTempSearchFields] = useState({
    "Customer Name": "",
    "Special Customer": "",
    "Email Id": "",
    "Contact Number": "",
  });
  const [searchFields, setSearchFields] = useState({
    name: "",
    specialcustomer: false,
    emailid: "",
    contactnumber: "",
  });
  const [sortConfig, setSortConfig] = useState({ key: "", direction: "asc" });
  const router = useRouter();

  const getToken = () => {
    const user = sessionStorage.getItem('token') || null;
    const data = user ? JSON.parse(user) : null;
    return data ? data : null;
}


  // const dataa = {
  //   "uoid": 0,
  //   "desc": null,
  //   "name": null,
  //   "accountstatus": 1,
  //   "specialcustomer": null,
  //   "emailid": null,
  //   "contactnumber": null,
  //   "paginationFilter": {
  //     "pageNumber": 1,
  //     "pageSize": 6
  //   }
  // };

  const getInitialData = async () => {
    try {
      const response = await CallFor(
        'v2/account/GetCustomerByUoid',
        'GET',
        null,
        'Auth'
      );
        setExportUrl(response.data.excelExportApi);
        setImportFileUrl(response.data.excelImportApi)
        setsampleFile(response.data.sampleFile)

      if (response.data) {
        return response.data
      } else {
        console.error("Initial data is null or undefined");
        return null;
      }
    } catch (error) {
      console.error("Error fetching initial data:", error);
      return null;
    }
  };



  const [initialData, setInitialData] = useState(null);

  const fetchData = async (page, searchParams = {}) => {
    console.log('fetchData called with:', page, searchParams);
    setLoading(true);
    try {
      if (!initialData) {
        console.error("Initial data not available");
        setLoading(false);
        return;
      }

      const requestData = {
        ...initialData.model,
        name: searchParams.name || null,
        emailid: searchParams.email || null,
        contactnumber: searchParams.number || null,
        paginationFilter: {
          pageNumber: page,
          pageSize: itemsPerPage
        }
      };

      const response = await CallFor(
        `v2/account/GetCustomerByUoid`,
        "POST",
        requestData,
        "Auth"
      );

      setData(response.data.data);
      setTotalPages(Math.ceil(response.data.totalCount / itemsPerPage));
    } catch (error) {
      console.error('Error in fetchData:', error);
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  const [searchParams, setSearchParams] = useState({
    name: "",
    email: "",
    number: ""
  });

  useEffect(() => {
    const loadInitialData = async () => {
      const data = await getInitialData();
      if (data) {
        setInitialData(data);
        fetchData(currentPage, searchParams);
      } else {
        console.error("Failed to load initial data");
      }
    };
    loadInitialData();
  }, []);

  useEffect(() => {
    if (initialData) {
      fetchData(currentPage);
    }
  }, [currentPage, initialData]);


  // useEffect(() => {
  //   fetchData(currentPage);
  // }, [currentPage]);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    fetchData(pageNumber, searchParams);
  };
  const handleSearch = () => {
    setCurrentPage(1);  
    fetchData(1, searchParams);
  };

const handleInputChange = (field, value) => {
  setSearchParams(prev => ({ ...prev, [field]: value }));
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

 

  const handleExport = async () => {
      try {
        setLoading(true);

        const response = await axios({
          method: 'POST',
          url: exportUrl,
          responseType: 'blob',
          headers: {
            'Authorization': `Bearer ${getToken()}`,
            'Content-Type': 'application/json',
          }, 
        });

        // Check if the response is indeed a blob
        if (response.data instanceof Blob) {
          // Create a blob from the response data
          const blob = new Blob([response.data], { type: response.headers['content-type'] });

          // Create a link element and trigger the download
          const link = document.createElement('a');
          link.href = window.URL.createObjectURL(blob);

          // Try to get the filename from the Content-Disposition header
          const contentDisposition = response.headers['content-disposition'];
          let filename = 'custormerlist.xlsx';
          if (contentDisposition) {
            const filenameMatch = contentDisposition.match(/filename="?(.+)"?/i);
            if (filenameMatch && filenameMatch.length === 2) {
              filename = filenameMatch[1];
            }
          }

          link.download = filename;
          link.click();
        } else {
          console.error('Expected blob response but received:', response.data);
        }

        setLoading(false);
      } catch (error) {
        console.error("Export failed:", error);
        setLoading(false);
      }
  };

 

  //Delete
  const handleDeleteUser = async (userId) => {
    // const delUrl = `v2/users/DeleteUser?uid=${userId}`;
    setSelectedUserId(userId); // Set selected user id
    setIsDeleteDialogOpen(true); // Open delete dialog with selected user id
  };

  const handleCloseDeleteDialog = () => {
    setIsDeleteDialogOpen(false); // Close delete dialog
  };

const handleImportSuccess = (data) => {
  console.log('Import successful:', data);
  // Refresh your customer list or perform any other necessary actions
};

  return (
    <div className="container mx-auto">
      <div className="flex ">
        <SearchIcon className="text-gray-500" size={19} />
        <h1 className="text-[20px] font-semibold mb-4 pl-2">Search</h1>
      </div>
      {/* Search inputs */}
      <div className="mb-4 grid grid-cols-2 lg:grid-cols- gap-x-10">
        <div className="flex items-center mb-2">
          <label className="w-1/4 font-medium mr-2">Name</label>
          <input
            type="text"
            className="border border-gray-300 px-4 py-2 rounded w-3/4"
            value={searchParams.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
          />
        </div>
        <div className="flex items-center mb-2">
          <label className="w-1/4 font-medium mr-2">Email</label>
          <input
            type="text"
            className="border border-gray-300 px-4 py-2 rounded w-3/4"
            value={searchParams.email}
            onChange={(e) => handleInputChange("email", e.target.value)}
          />
        </div>
        <div className="flex items-center mb-2">
          <label className="w-1/4 font-medium mr-2">Number</label>
          <input
            type="text"
            className="border border-gray-300 px-4 py-2 rounded w-3/4"
            value={searchParams.number}
            onChange={(e) => handleInputChange("number", e.target.value)}
          />
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

      <div className=" justify-between flex gap-1 pb-3  ">
        <div className="text-2xl text-orange-400">Customers List</div>
        <div>
          {/* <ImportModal
            title="Import Customer Data"
            acceptedFileTypes=".csv,.xlsx,.xls"
            sampleFileName="Customer_import_sample.csv"
            sampleFileContent={staffSampleContent}
            onImport={handleStaffImport}
            buttonText="Import Customer"
            buttonIcon={<Upload size={20} className="mr-2" />}
          /> */}

           
{/* <ImportModal 
            title="Import Customer Data"
            acceptedFileTypes=".csv,.xlsx,.xls"
            sampleFileUrl={sampleFIle}
            importUrl={ImportFileUrl}
            onImportSuccess={handleImportSuccess}
            buttonText="Import"
            buttonIcon={<Upload size={20} className="mr-2" />}
/>
          <Dialog>
            <DialogTrigger asChild>
              <Button color="destructive" className="shadow-md mx-1 m-2"   onClick={handleExport}
            disabled={loading}>
                {" "}
                <Upload size={20} className="pr-1" />
                Export
              </Button>
            </DialogTrigger>
          
          </Dialog> */}
          <Button
            type="submit"
            color="warning"
            onClick={() => router.push("/station/station/customer/addCustomer")}
          >
            <Plus size={20} />
            Add
          </Button>
        </div>
      </div>

      {/* Table */}
      <table className="min-w-full text-left">
        {/* Table headers */}
        <thead>
          <tr>
            <th
              className="px-2 py-2 cursor-pointer"
              onClick={() => handleSort("uid")}
            >
              SR.NO{" "}
              {sortConfig.key === "uid"
                ? sortConfig.direction === "asc"
                  ? "▲"
                  : "▼"
                : ""}
            </th>
            <th
              className="px-2 py-2 cursor-pointer"
              onClick={() => handleSort("fullname")}
            >
              NAME{" "}
              {sortConfig.key === "fullname"
                ? sortConfig.direction === "asc"
                  ? "▲"
                  : "▼"
                : ""}
            </th>
            <th
              className="px-2 py-2 cursor-pointer"
              onClick={() => handleSort("mobno")}
            >
              Phone No{" "}
              {sortConfig.key === "mobno"
                ? sortConfig.direction === "asc"
                  ? "▲"
                  : "▼"
                : ""}
            </th>
            <th
              className="px-2 py-2 cursor-pointer"
              onClick={() => handleSort("emailid")}
            >
              EMAILID{" "}
              {sortConfig.key === "emailid"
                ? sortConfig.direction === "asc"
                  ? "▲"
                  : "▼"
                : ""}
            </th>
            <th
              className="px-2 py-2 cursor-pointer"
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
          {sortedData.map((item) => (
            <tr key={item.id}>
              <td className="px-2 py-2">{item.uid}</td>
              <td className="px-2 py-2">{item.fullname}</td>
              <td className="px-2 py-2">{item?.mobno}</td>
              <td className="px-2 py-2">{item.emailid}</td>
              <td className="px-2 py-2">
                <div>

                   <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                             <Button
                    className="p-0 mr-2 bg-transparent hover:bg-transparent text-black dark:text-white"
                    onClick={() =>
                      router.push(
                        `/station/station/customer/customerDetail/${item.uid}`
                      )
                    }
                  >
                    <Eye size={20}></Eye>
                  </Button>
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
                    className="p-0 mr-2 bg-transparent hover:bg-transparent text-black dark:text-white"
                    onClick={() =>
                      router.push(
                        `/station/station/customer/editCustomer/${item.uid}`
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
                    className="p-0 bg-transparent hover:bg-transparent text-black dark:text-white"
                    onClick={() => handleDeleteUser(item.uid)} // Open delete dialog on click
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
      {/* Delete Dialog */}
      <DeleteDialog
        isOpen={isDeleteDialogOpen}
        callfor={CallFor}
        onClose={handleCloseDeleteDialog}
        onDelete={() => {
          fetchData(1); // Refresh data after deletion
          setIsDeleteDialogOpen(false); // Close delete dialog
        }}
        delUrl={`v2/users/DeleteUser?uid=${selectedUserId}`} // Pass delete URL
      />
    </div>
  );
};

export default Customer;
