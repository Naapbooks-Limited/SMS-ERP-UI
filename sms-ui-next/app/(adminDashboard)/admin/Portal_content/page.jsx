"use client"
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button'
import { Download, DownloadIcon, FilePenLine, Import, Plus, Search, SearchIcon, Trash, Upload } from 'lucide-react';
// import StaffImportModal from './StaffImportModal'
import { Switch } from "@/components/ui/switch"
import { useRouter } from 'next/navigation';
import {
  Tooltip,
  TooltipArrow,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Link from "next/link";
const portalcontent = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(9);
  const [searchQuery, setSearchQuery] = useState('');
  const [tempSearchFields, setTempSearchFields] = useState({
    Name: '',
    "Warehouse name": '',
    Locaton: '',
    Manager: '',
    Status: '',
    // Manager: ''
  });
  const [searchFields, setSearchFields] = useState({
    userId: '',
    id: '',
    title: '',
    completed: ''
  });
  const [sortConfig, setSortConfig] = useState({ key: '', direction: 'asc' });
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`https://jsonplaceholder.typicode.com/todos`);
        setData(response.data);
        setLoading(false);
      } catch (error) {
        setError(error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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
    setSearchFields(tempSearchFields);
    setSearchQuery(JSON.stringify(tempSearchFields)); // Trigger useEffect
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

  // Calculate total pages based on filtered data length and pageSize
  const totalPages = Math.ceil(filteredData.length / pageSize);
  // Calculate starting index for pagination
  const startIndex = (page - 1) * pageSize;
  // Slice the filtered data based on startIndex and pageSize
  const slicedData = filteredData.slice(startIndex, startIndex + pageSize);

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const paginationItems = [];
    const handlePageClick = (pageNumber) => () => handlePageChange(pageNumber);

    paginationItems.push(
      <button key="prev" className="bg-blue-500 text-white px-3 m-1 py-2 rounded mr-2" onClick={handlePageClick(page - 1)} disabled={page === 1}>
        Previous
      </button>
    );

    for (let i = 1; i <= totalPages; i++) {
      if (i === page || (i <= 2) || (i >= totalPages - 1) || (i >= page - 1 && i <= page + 1)) {
        paginationItems.push(
          <button key={i} className={`px-3 py-1 m-1 rounded ${i === page ? 'bg-blue-700 text-white' : 'bg-blue-500 text-white'}`} onClick={handlePageClick(i)}>
            {i}
          </button>
        );
      } else if (paginationItems[paginationItems.length - 1].key !== '...') {
        paginationItems.push(<span key="..." className="px-4 py-2">...</span>);
      }
    }

    paginationItems.push(
      <button key="next" className="bg-blue-500 text-white m-1 px-3 py-1 rounded" onClick={handlePageClick(page + 1)} disabled={page === totalPages}>
        Next
      </button>
    );

    return paginationItems;
  };

  return (
    <div className="container mx-auto">
      <div className='flex '>
        <SearchIcon className='text-gray-500' size={19} />
        <h1 className="text-[20px] font-semibold mb-4 pl-2">SEARCH</h1>
      </div>
      {/* Search inputs */}
      <div className="mb-4 grid grid-cols-1 lg:grid-cols-2 gap-x-10">
        {/* Search input for each field */}
        {Object.keys(tempSearchFields).map(field => (
          <div key={field} className="flex items-center mb-2">
            <label className="w-1/4 font-medium mr-2">{field}</label>
            {field === 'Status' ? (
              <div className="flex items-center">
                <Switch defaultChecked />
              </div>
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
        <Button color="warning" className="shadow-md w-28" onClick={handleSearch}>
          <Search size={20} className='pr-1' />Search
        </Button>
      </div>
      <div className='flex justify-between gap-1 pb-3'>
        <div className='text-2xl text-orange-400'>
          BANNERLIST
        </div>
        <div className=''>
          {/* <StaffImportModal /> */}
          <Button color="warning" className="shadow-md me-2" onClick={() => router.push("/admin/Portal_content/previewBanner")}><DownloadIcon size={20} className='pr-1' />Preview</Button>
          <Button color="warning" className="shadow-md" onClick={() => router.push("/admin/Portal_content/addBanner")} ><Plus size={20} className='pr-1' />Add</Button>
        </div>
      </div>

      {/* Table */}
      <table className="min-w-full text-left">
        {/* Table headers */}
        <thead>
          <tr>
            <th className="px-2 py-2 cursor-pointer" onClick={() => handleSort('userId')}>
              SR.NO {sortConfig.key === 'userId' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}
            </th>
            <th className="px-2 py-2 cursor-pointer" onClick={() => handleSort('id')}>
              BANNERIMAGES {sortConfig.key === 'id' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}
            </th>
            <th className="px-2 py-2 cursor-pointer" onClick={() => handleSort('title')}>
              BANNER NAME {sortConfig.key === 'title' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}
            </th>
            <th className="px-2 py-2 cursor-pointer" onClick={() => handleSort('completed')}>
              ACTIVE/INACTIVE {sortConfig.key === 'completed' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}
            </th>
            <th className="px-2 py-2 cursor-pointer" onClick={() => handleSort('completed')}>
              ACTION {sortConfig.key === 'completed' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}
            </th>
          </tr>
        </thead>
        {/* Table data */}
        <tbody>
          {slicedData.map((item) => (
            <tr key={item.id}>
              <td className="px-2 py-2">{item.userId}</td>
              <td className="px-2 py-2">{item.id}</td>
              <td className="px-2 py-2">{item.title}</td>
              <td className="px-2 py-2">{item.completed.toString()}</td>
              <td>
                <div className='text-center'>
               
                <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button className="p-0 mr-2 bg-transparent hover:bg-transparent text-gray-700  dark:text-white" onClick={()=>router.push("/admin/Portal_content/editBanner")} >
                    <FilePenLine size={15}></FilePenLine>
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
                              <Button className="p-0 mr-2 bg-transparent hover:bg-transparent text-gray-700  dark:text-white">
                    <Trash size={15}></Trash>
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
        {renderPagination()}
      </div>
    </div>
  );
};

export default portalcontent;