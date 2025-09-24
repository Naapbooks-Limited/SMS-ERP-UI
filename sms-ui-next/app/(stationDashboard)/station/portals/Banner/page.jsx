"use client"
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Check, FilePenLine, Plus, Search, Trash, X } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import Link from "next/link";
import Select from 'react-select';
import CallFor2 from "@/utilities/CallFor2";
import DeleteDialog from "@/components/DeleteDialog";
import Pagination from "@/components/pagination/Pagination";
import {
  Tooltip,
  TooltipArrow,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const Banner = () => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;
  const [bodyData, setBodyData] = useState({});
  const [updateTrigger, setUpdateTrigger] = useState(0);
  const [searchFields, setSearchFields] = useState({

    WidgetZoneId: "",
    Active: ""
  });
  const handleUpdate = () => {
    setUpdateTrigger(prev => prev + 1);
  };
  const fetchBodyData = async () => {
    try {
      setLoading(true);
      const response = await CallFor2(`api/AnywhereSliderVendorShopAdminAPI/create`, "get", null, "Auth");
      setBodyData(response.data);
      setLoading(false);
    } catch (error) {
      setError(error);
      setLoading(false);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await CallFor2(`api/AnywhereSliderVendorShopAdminAPI/List`, "post", {
        ...bodyData,
        Page: currentPage,
        PageSize: totalPages,
        Start: (currentPage - 1) * itemsPerPage,
        Length: itemsPerPage,
        SearchName: searchFields.Name,
        SearchWidgetZones: searchFields.WidgetZoneId ? [parseInt(searchFields.WidgetZoneId)] : [],
        SearchActiveId: searchFields.Active ? parseInt(searchFields.Active) : 0
      }, "Auth");
      setData(response.data.Data);
      // setTotalItems(response.data.TotalCount);
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

  // useEffect(() => {
  //   if (Object.keys(bodyData).length > 0) {
  //     fetchData();
  //   }
  // }, [bodyData, page, pageSize, searchFields]);

  useEffect(() => {
    if (bodyData) {
      fetchData();
    }
  }, [currentPage, bodyData]);

 

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchData();
  };

  const handleInputChange = (field, value) => {
    setSearchFields(prev => ({ ...prev, [field]: value }));
  };

  const handleDeleteUser = (userId) => {
    setSelectedUserId(userId);
    setIsDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setIsDeleteDialogOpen(false);
  };

  const widgetZoneOptions = bodyData.AvailableWidgetZones?.map(zone => ({
    value: zone.Value,
    label: zone.Text
  })) || [];

  const activeOptions = [
    { value: "0", label: "All" },
    { value: "1", label: "Active" },
    { value: "2", label: "Inactive" }
  ];

  return (
    <div className="container mx-auto">
    <div className="flex mb-4 items-center">
  <Search className="text-gray-500" size={19} />
  <h1 className="text-[20px] font-semibold pl-2">Search</h1>
</div>

<div className="mb-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
  <div className="flex flex-col">
    <label className="mb-2 font-medium">Widget Zone</label>
    <Select
      options={widgetZoneOptions}
      className="text-black"
      value={widgetZoneOptions.find(
        (option) => option.value === searchFields.WidgetZoneId
      )}
      onChange={(selected) =>
        handleInputChange("WidgetZoneId", selected?.value || "")
      }
      isClearable
    />
  </div>

  <div className="flex flex-col">
    <label className="mb-2 font-medium">Status</label>
    <Select
      options={activeOptions}
      className="text-black"
      value={activeOptions.find(
        (option) => option.value === searchFields.Active
      )}
      onChange={(selected) =>
        handleInputChange("Active", selected?.value || "")
      }
      isClearable
    />
  </div>
</div>


      <div className="flex justify-center mb-4">
        <Button color="warning" className="shadow-md w-28" onClick={handleSearch}>
          <Search size={20} className="pr-1" />
          Search
        </Button>
      </div>

      <div className="flex justify-between items-center mb-4">
        <div className="text-2xl text-orange-400">Banner List</div>
        <div className="flex">
          {/* <Link href="/station/portals/Banner/previewbanner">
            <Button color="warning" className="shadow-md me-2">Preview</Button>
          </Link> */}
          <Link href="/station/portals/Banner/addbanner">
            <Button color="warning" className="shadow-md">
              <Plus size={20} className="pr-1" />
              Add
            </Button>
          </Link>
        </div>
      </div>

      <table className="min-w-full text-left">
        <thead>
          <tr>
            <th className="px-2 py-2">Name</th>
            <th className="px-2 py-2">Widget zone</th>
            <th className="px-2 py-2">ACTIVE</th>
            <th className="px-2 py-2">ACTION</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={item.Id}>
              <td className="px-2 py-2">{item.Name}</td>
              <td className="px-2 py-2">{item.WidgetZoneStr}</td>
              <td className="px-4 py-2">
                {item.Active ? <Check size={20} className="text-success-700" /> : <X size={20} className="text-red-500" />}
              </td>
              <td className="px-4 py-2">
                <div>
                   <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                                 <Link href={`/station/portals/Banner/editbanner/${item.Id}`}>
                    <Button className="p-0 mr-2 bg-transparent hover:bg-transparent text-black dark:text-white">
                      <FilePenLine size={20} />
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
                                <Button onClick={() => handleDeleteUser(item.Id)} className="p-0 mr-2 bg-transparent hover:bg-transparent text-black dark:text-white">
                    <Trash size={20} />
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
        delUrl={`api/AnywhereSliderVendorShopAdminAPI/DeleteSlider/${selectedUserId}`}
      />
    </div>
  );
};

export default Banner;