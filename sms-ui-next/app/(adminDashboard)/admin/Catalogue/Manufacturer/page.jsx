"use client";
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Table } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';
import CallFor from '@/utilities/CallFor';
import { Eye, FilePenLine, Trash, Check, X, Search } from "lucide-react";
import Link from "next/link";
import DeleteDialog from "@/components/DeleteDialog";
import Pagination from "@/components/pagination/Pagination";

import {
  Tooltip,
  TooltipArrow,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import toast from 'react-hot-toast';

function ManufacturerPage() {
  const [manufacturers, setManufacturers] = useState([]);
  const [error, setError] = useState(null);
  const router = useRouter();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  
  // Filter and pagination states
  const [nameFilter, setNameFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize] = useState(10); // You can make this configurable
  const [isLoading, setIsLoading] = useState(false);
  const [totalCount, settotalCount] = useState(0)

 useEffect(() => {
  fetchManufacturers();
}, [page]); // removed nameFilter here

const fetchManufacturers = async () => {
  try {
    setIsLoading(true);
    setError(null);
    
    const requestBody = {
      manufacturerName: nameFilter || null,
      paginationFilter: {
        pageNumber: page,
        pageSize: pageSize
      }
    };
    
    const response = await CallFor('v2/Common/GetManufactureList', 'Post', requestBody, 'Auth');
    
    if (response?.data?.data?.data) {
      setManufacturers(response.data.data.data);
      setTotalPages(Math.ceil(response.data.data.totalCount / pageSize) || 1);
      settotalCount(response.data.data.totalCount || 0);
    } else {
      setManufacturers([]); // explicitly set empty array if no data
      settotalCount(0);
    }
  } catch (error) {
    setError('Failed to fetch manufacturers. Please try again later.');
    console.error('Error fetching manufacturers:', error);
  } finally {
    setIsLoading(false);
  }
};

  const handleDeleteClick = async (id) => {
  try {
    setError(null);

    const response = await CallFor(
      'v2/Common/DeleteManufacture',
      'Post',
      { id: id },
      'Auth'
    );

    // ✅ Check actual API status
    if (response?.data?.status === true) {
      toast.success(response.data.message || "Manufacturer deleted successfully");
      fetchManufacturers();
    } else {
      toast.error(response?.data?.message || "Failed to delete manufacturer");
    }

  } catch (error) {
    console.error('Error deleting manufacturer:', error);
    setError('Failed to delete manufacturer. Please try again later.');
    toast.error(error?.message || "Delete request failed");
  }
};


  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handleNameFilterChange = (e) => {
    setNameFilter(e.target.value);
    setPage(1); // Reset to first page when filtering
  };

  const handleSearchSubmit = (e) => {
  e.preventDefault();
  setPage(1);
  fetchManufacturers(); // only runs when clicking Search
};

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manufacturers</h1>
        <Button 
          onClick={() => router.push('/admin/Catalogue/Manufacturer/addmanufacturer')}
          className="bg-primary text-white"
        >
          Add Manufacturer
        </Button>
      </div>

      {/* Filter Section */}
      <div className="mb-4 bg-white rounded-lg shadow p-4">
        <form onSubmit={handleSearchSubmit} className="flex gap-4 items-end">
          <div className="flex-1">
            <label htmlFor="nameFilter" className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Name
            </label>
            <div className="relative">
              <Input
                id="nameFilter"
                type="text"
                placeholder="Enter manufacturer name..."
                value={nameFilter}
                onChange={handleNameFilterChange}
                className="pr-10"
              />
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
          </div>
          <Button 
            type="submit" 
            className="bg-primary text-white"
            disabled={isLoading}
          >
            {isLoading ? 'Searching...' : 'Search'}
          </Button>
          {nameFilter && (
            <Button 
              type="button" 
              variant="outline"
              onClick={() => {
                setNameFilter('');
                setPage(1);
              }}
            >
              Clear
            </Button>
          )}
        </form>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="mt-2 text-gray-600">Loading manufacturers...</p>
          </div>
        ) : (
          <>
            <Table>
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left">Name</th>
                  <th className="px-6 py-3 text-left">Status</th>
                  <th className="px-6 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {manufacturers.length > 0 ? (
                  manufacturers.map((manufacturer) => (
                    <tr key={manufacturer.id}>
                      <td className="px-6 py-4">{manufacturer.name}</td>
                      <td className="px-6 py-4">
                        {manufacturer.published ? (
                          <Check size={20} className="text-success-700" />
                        ) : (
                          <X size={20} className="text-red-500" />
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Link href={`/admin/Catalogue/Manufacturer/viewmanufacturer/${manufacturer.id}`}>
                                  <Button className="p-0 mr-2 bg-transparent hover:bg-transparent text-black dark:text-white">
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
                                <Link href={`/admin/Catalogue/Manufacturer/editmanufacturer/${manufacturer.id}`}>
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
                                <Button
                                  className="p-0 bg-transparent hover:bg-transparent text-black dark:text-white"
                                  onClick={() => handleDeleteClick(manufacturer.id)}
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
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="px-6 py-8 text-center text-gray-500">
                      {nameFilter ? 'No manufacturers found matching your search.' : 'No manufacturers found.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>

            {/* Pagination */}
           
              <div className="p-4 flex justify-end border-t">
                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            
          </>
        )}
      </div>

      {/* <DeleteDialog
        isOpen={isDeleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        callfor={CallFor}
        onDelete={() => {
          fetchManufacturers();
          setIsDeleteDialogOpen(false);
        }}
        delUrl={`v2/Common/DeleteManufacture`}
        body={{ id: selectedId }}
      /> */}
    </div>
  );
}

export default ManufacturerPage;