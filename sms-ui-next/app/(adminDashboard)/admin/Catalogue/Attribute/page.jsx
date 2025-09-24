"use client";
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Table } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';
import CallFor from '@/utilities/CallFor';
import { Eye, FilePenLine, Trash, Check, X, Search } from "lucide-react";
import Link from "next/link";
import Pagination from "@/components/pagination/Pagination";

import {
  Tooltip,
  TooltipArrow,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import toast from 'react-hot-toast';

function AttributePage() {
  const [attributes, setAttributes] = useState([]);
  const [error, setError] = useState(null);
  const router = useRouter();
  
  // Filter and pagination states
  const [nameFilter, setNameFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize] = useState(10);
  const [isLoading, setIsLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    fetchAttributes();
  }, [page, nameFilter]);

  const fetchAttributes = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const requestBody = {
        name: nameFilter || null,
        paginationFilter: {
          pageNumber: page,
          pageSize: pageSize
        }
      };
      
      const response = await CallFor('v2/Product/GetAttributeList', 'Post', requestBody, 'Auth');
      
      if (response?.data?.data?.data) {
        setAttributes(response.data.data.data);
        setTotalPages(Math.ceil(response.data.data.totalCount / pageSize));
        setTotalCount(response.data.data.totalCount);
      }
    } catch (error) {
      setError('Failed to fetch attributes. Please try again later.');
      console.error('Error fetching attributes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClick = async (id) => {
    try {
      setError(null);
      const response = await CallFor('v2/Product/DeleteAttribute', 'Post', {attributeid: id}, 'Auth');
      if (response) {
        toast.success("Attribute deleted successfully");
        fetchAttributes();
      }
    } catch (error) {
      setError('Failed to delete attribute. Please try again later.');
      toast.error(error);
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
    fetchAttributes();
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Attributes</h1>
        <Button 
          onClick={() => router.push('/admin/Catalogue/Attribute/addattribute')}
          className="bg-primary text-white"
        >
          Add Attribute
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
                placeholder="Enter attribute name..."
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
            <p className="mt-2 text-gray-600">Loading attributes...</p>
          </div>
        ) : (
          <>
            <Table>
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left">Name</th>
                  <th className="px-6 py-3 text-left">Description</th>
                  <th className="px-6 py-3 text-left">Specification</th>
                  <th className="px-6 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {attributes.length > 0 ? (
                  attributes.map((attribute) => (
                    <tr key={attribute.attributeid}>
                      <td className="px-6 py-4">{attribute.attributename}</td>
                      <td className="px-6 py-4">{attribute.description}</td>
                      <td className="px-6 py-4">
                        {attribute.isspecification ? (
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
                                <Link href={`/admin/Catalogue/Attribute/viewattribute/${attribute.attributeid}`}>
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
                                <Link href={`/admin/Catalogue/Attribute/editattribute/${attribute.attributeid}`}>
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
                                  onClick={() => handleDeleteClick(attribute.attributeid)}
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
                    <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                      {nameFilter ? 'No attributes found matching your search.' : 'No attributes found.'}
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
    </div>
  );
}

export default AttributePage;