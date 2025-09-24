"use client"
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button'
import { Eye, FilePenLine, Plus, Search, SearchIcon, Trash } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import CallFor2 from '@/utilities/CallFor2';
import DeleteDialog from "@/components/DeleteDialog"; // Import DeleteDialog component
import Pagination from "@/components/pagination/Pagination";
import {
  Tooltip,
  TooltipArrow,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";


const CustomTimePicker = ({ value, onChange, className }) => {
    const [hours, setHours] = useState(() => {
        const [hour] = value.split(':');
        return hour ? parseInt(hour, 10) : 0;
    });

    const [minutes, setMinutes] = useState(() => {
        const [, minute] = value.split(':');
        return minute ? parseInt(minute, 10) : 0;
    });

    const [isAM, setIsAM] = useState(() => {
        const [hour] = value.split(':');
        return hour ? parseInt(hour, 10) < 12 : true;
    });

    const handleHourChange = (event) => {
        let newHours = parseInt(event.target.value, 10);
        if (newHours > 12) newHours = 12;
        if (newHours < 0) newHours = 0;
        setHours(newHours);
        updateTime(newHours, minutes, isAM);
    };

    const handleMinuteChange = (event) => {
        let newMinutes = parseInt(event.target.value, 10);
        if (newMinutes > 59) newMinutes = 59;
        if (newMinutes < 0) newMinutes = 0;
        setMinutes(newMinutes);
        updateTime(hours, newMinutes, isAM);
    };

    const toggleAMPM = () => {
        const newIsAM = !isAM;
        setIsAM(newIsAM);
        updateTime(hours, minutes, newIsAM);
    };

    const updateTime = (hours, minutes, isAM) => {
        let formattedHours;
        if (hours === 0) {
            formattedHours = 0; // Keep 0 as is
        } else {
            formattedHours = hours % 12 === 0 ? 12 : hours % 12;
        }

        const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
        const ampm = isAM ? 'AM' : 'PM';
        onChange(`${formattedHours}:${formattedMinutes}${ampm}`);
    };

    return (
        <div className={`flex items-center ${className}`}>
            <input
                type="number"
                value={hours}
                onChange={handleHourChange}
                className="w-12 p-1 border border-gray-300 rounded-md text-center"
            />
            <span className="mx-1">:</span>
            <input
                type="number"
                value={minutes}
                onChange={handleMinuteChange}
                className="w-12 p-1 border border-gray-300 rounded-md text-center"
            />
            <button
                type="button"
                onClick={toggleAMPM}
                className="ml-2 p-1 border border-gray-300 rounded-md"
            >
                {isAM ? 'AM' : 'PM'}
            </button>
        </div>
    );
};





const deleiveryscedule = () => {
  const router = useRouter();
  const [data, setData] = useState([]);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false); // State for delete dialog
  const [selectedUserId, setSelectedUserId] = useState(null); // State for selected user id
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [tempSearchFields, setTempSearchFields] = useState({
    // Name: '',
    "From Time": '',
    "To Time": '',
    Status: ''
  });
  const [searchFields, setSearchFields] = useState({
    "From Time": '',
    "To Time": '',
    Status: ''
  });
  const [sortConfig, setSortConfig] = useState({ key: '', direction: 'asc' });

  // const 

  useEffect(() => {
    getListBody();
  }, [searchFields,page,pageSize ]);

  const getListBody = async () => {
    try {
      setLoading(true);
      const response = await CallFor2('api-fe/DeliverySlotAdminAPI/List', 'GET', null, 'Auth');
      if (response.status === 200) {
        console.log(response.data, "res")
        getDelieveryList(response.data)
        setLoading(false);
      }
    } catch (error) {
      setError(error);
      setLoading(false);
    }
  }

  const getDelieveryList = async () => {
  const formatTime = (time) => {
    if (time.startsWith("0:")) { // Adjust this check based on how time is formatted
      return "0001-01-01T00:00:00";
    }
    // You can add further formatting here if needed
    return time;
  };

  const requestBody = {
    FromTime: searchFields["From Time"] ? formatTime(searchFields["From Time"]) : "0001-01-01T00:00:00",
    ToTime: searchFields["To Time"] ? formatTime(searchFields["To Time"]) : "0001-01-01T00:00:00",
    IsActive: searchFields.Status === "" ? "" : searchFields.Status === "true" ? true : false,
    Start: page - 1,
    Length: pageSize,
  };

  const response = await CallFor2('api-fe/DeliverySlotAdminAPI/List', 'POST', requestBody, 'Auth');
  if (response.status === 200) {
    console.log(response.data.Data, "respo");
    setTotalPages(Math.ceil(response.data.recordsTotal / pageSize));
    setData(response.data.Data);
  }
};


  useEffect(() => {
    setPage(1); // Reset to first page on search
  }, [searchQuery, pageSize]);

  const handlePageChange = (pageNumber) => {
    setPage(pageNumber);
  };

  const handlePageSizeChange = (size) => {
    setPageSize(size);
  };

  const handleSearch = () => {

    console.log(tempSearchFields,"feild")
  setSearchFields(tempSearchFields);
  setSearchQuery(JSON.stringify(tempSearchFields)); // Trigger useEffect
  setPage(1); // Reset to first page on search
  getListBody(); // Fetch the data with the new search parameters
};


  const handleInputChange = (columnName, value) => {
    setTempSearchFields({ ...tempSearchFields, [columnName]: value });
  };


  const handleSort = (columnName) => {
    let direction = 'asc';
    if (sortConfig.key === columnName && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key: columnName, direction });
  };

  const sortedData = [...data].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });

  const filteredData = sortedData.filter(item => {
    for (let key in searchFields) {
      if (searchFields[key] !== '') {
        const itemValue = item[key]?.toString().toLowerCase() || '';
        const searchValue = searchFields[key].toLowerCase();
        if (!itemValue.includes(searchValue)) {
          return false;
        }
      }
    }
    return true;
  });

 
 //Delete
  const handleDeleteUser = async (userId) => {
    // const delUrl = `v2/users/DeleteUser?uid=${userId}`;
    setSelectedUserId(userId); // Set selected user id
    setIsDeleteDialogOpen(true); // Open delete dialog with selected user id
  };

  const handleCloseDeleteDialog = () => {
    setIsDeleteDialogOpen(false); // Close delete dialog
  };

 
  //Delete Over

  return (
    <>
      <div className="container mx-auto">
        <div className="flex ">
          <SearchIcon className="text-gray-500" size={19} />
          <h1 className="text-[20px] font-semibold mb-4 pl-2">Search</h1>
        </div>
        {/* Search inputs */}
        <div className="mb-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
          {Object.keys(tempSearchFields).map((field) => (
              <div key={field} className="flex items-center mb-2">
                
                {field === "Status" ? (
                  <>
                  <label className="w-1/5 font-medium ">{field}</label>
                  <select
                    className="border border-gray-300  py-2  rounded w-3/4"
                    onChange={(e) => handleInputChange(field, e.target.value)}
                  >
                    <option value="">Select Status</option>
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                  </>
                ) : field.includes("Time") ? (
                  <>
                  <label className="w-1/4 font-medium ">{field}</label>
                  <CustomTimePicker
                    value={tempSearchFields[field]}
                    onChange={(newValue) => handleInputChange(field, newValue)}
                    className="w-full"
                  />
                  </>
                ) : (
                  <>
                  <label className="w-1/4 font-medium ">{field}</label>
                  <input
                    type="text"
                    className="border border-gray-300 px-4 py-2 rounded w-3/4"
                    onChange={(e) => handleInputChange(field, e.target.value)}
                  />
                  </>
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
          <div className="text-2xl text-orange-400">Scheduling List</div>
          <Button
            color="warning"
            className="shadow-md"
            onClick={() =>
              router.push(
                "/station/station/delievery_scheduling/adddelieveryscheduling"
              )
            }
          >
            <Plus size={20} className="pr-1" />
            Add
          </Button>
        </div>

        {/* Table */}
        <table className="min-w-full text-left">
          {/* Table headers */}
          <thead>
            <tr>
              <th
                className="px-4 py-2 cursor
-pointer"
                onClick={() => handleSort("Id")}
              >
                SR.NO{" "}
                {sortConfig.key === "Id"
                  ? sortConfig.direction === "asc"
                    ? "▲"
                    : "▼"
                  : ""}
              </th>
              {/* <th
              className="px-4 py-2 cursor-pointer"
              onClick={() => handleSort("title")}
            >
              NAME{" "}
              {sortConfig.key === "title"
                ? sortConfig.direction === "asc"
                  ? "▲"
                  : "▼"
                : ""}
            </th> */}
              <th
                className="px-4 py-2 cursor-pointer"
                onClick={() => handleSort("TimeSlot")}
              >
                Time slot{" "}
                {sortConfig.key === "TimeSlot"
                  ? sortConfig.direction === "asc"
                    ? "▲"
                    : "▼"
                  : ""}
              </th>
              {/* <th
                className="px-4 py-2 cursor-pointer"
                onClick={() => handleSort("DisplayOrder")}
              >
                Display order{" "}
                {sortConfig.key === "DisplayOrder"
                  ? sortConfig.direction === "asc"
                    ? "▲"
                    : "▼"
                  : ""}
              </th> */}
              <th
                className="px-4 py-2 cursor-pointer"
                onClick={() => handleSort("Active")}
              >
                STATUS{" "}
                {sortConfig.key === "Active"
                  ? sortConfig.direction === "asc"
                    ? "▲"
                    : "▼"
                  : ""}
              </th>
              <th
                className="px-4 py-2 cursor-pointer"
              
              >
                Action{" "}
               
              </th>
            </tr>
          </thead>
          {/* Table data */}
          <tbody>
            {data && data.map((item) => (
              <tr key={item.id}>
                <td className="px-4 py-2">{item.Id}</td>
                <td className="px-4 py-2">{item.TimeSlot}</td>
                {/* <td className="px-4 py-2">{item.DisplayOrder}</td> */}
                <td className="px-4 py-2">
                  {item.Active === true ? (
                    <span className="text-white bg-green-500 p-1 rounded-md">
                      Active
                    </span>
                  ) : (
                    <span className="text-white bg-red-500  p-1 rounded-md">
                      Inactive
                    </span>
                  )}
                </td>
                <td className="px-4 py-2">
                  <div>

                     <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                             <Link
                      href={`/station/station/delievery_scheduling/viewdelieveryscheduling/${item.Id}`}
                    >
                      <Button className="p-0 mr-2 bg-transparent hover:bg-transparent text-black  dark:text-white">
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
                              <Button
                      className="p-0 mr-2 bg-transparent hover:bg-transparent text-black  dark:text-white"
                      onClick={() =>
                        router.push(
                          `/station/station/delievery_scheduling/editdelieveryScheduling/${item.Id}`
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
                      className="p-0 bg-transparent hover:bg-transparent text-black  dark:text-white"
                      onClick={() => handleDeleteUser(item.Id)} // Open delete dialog on click
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
            currentPage={page}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      </div>
      {/* Delete Dialog */}
      <DeleteDialog
        isOpen={isDeleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        callfor={CallFor2}
        onDelete={() => {
          getListBody(); // Refresh data after deletion
          setIsDeleteDialogOpen(false); // Close delete dialog
        }}
        delUrl={`api-fe/DeliverySlotAdminAPI/Delete/${selectedUserId}`} // Pass delete URL
      />
    </>
  );
};

export default deleiveryscedule;
