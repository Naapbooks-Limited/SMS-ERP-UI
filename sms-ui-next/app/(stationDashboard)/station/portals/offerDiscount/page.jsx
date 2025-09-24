"use client"
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button'
import { Check, Download, Eye, FilePenLine, Plus, Search, SearchIcon, Trash, Upload } from 'lucide-react';
import DeleteDialog from "@/components/DeleteDialog";
import Link from 'next/link';
import CallFor2 from '@/utilities/CallFor2';
import Pagination from "@/components/pagination/Pagination";
import {
  Tooltip,
  TooltipArrow,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
// import Link from "next/link";

const OfferDiscount = () => {

  const [sortColumn, setSortColumn] = useState('Name');
const [sortOrder, setSortOrder] = useState('asc'); // or 'desc'
const [sortConfig, setSortConfig] = useState({ key: 'Name', direction: 'asc' });


  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);

  const [searchFields, setSearchFields] = useState({
    SearchDiscountCouponCode: '',
    SearchDiscountName: '',
    SearchDiscountTypeId: '0',
    SearchStartDate: '',
    SearchEndDate: '',
    IsActiveId: '0'
  });

  const [appliedSearchFields, setAppliedSearchFields] = useState({});

  const fetchData = async () => {
    try {
      setLoading(true);
      const bodyData = {
        ...appliedSearchFields,
        Page: currentPage,
        PageSize: pageSize,
        AvailablePageSizes: "7, 15, 20, 50, 100",
        Draw: null,
        Start: (currentPage - 1) * pageSize,
        Length: pageSize,
        CustomProperties: {}
      };

      const response = await CallFor2(`Discount/admin-api/list`, "post", bodyData, "Auth");
      setData(response.data.Data);
      setTotalPages(Math.ceil(response.data.recordsTotal / pageSize));
      setLoading(false);
    } catch (error) {
      setError(error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentPage, pageSize, appliedSearchFields]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleSearch = () => {
    setCurrentPage(1);
    setAppliedSearchFields(searchFields);
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
  

  const handleSort = (column) => {
    let direction = 'asc';
    if (sortConfig.key === column && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key: column, direction });
  };
  
  
  const sortedData = [...data].sort((a, b) => {
    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];
    
    if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });
  
  
  return (
    <div className="container mx-auto">
      <div className='flex'>
        <SearchIcon className='text-gray-500' size={19} />
        <h1 className="text-[20px] font-semibold mb-4 pl-2">Search</h1>
      </div>

      {/* Search inputs */}
      <div className="mb-4 grid grid-cols-1 lg:grid-cols-2 gap-x-10">
        <div className="flex items-center mb-2">
          <label className="w-1/4 font-medium mr-2">Coupon Code</label>
          <input
            type="text"
            className="border border-gray-300 px-4 py-2 rounded w-3/4"
            value={searchFields.SearchDiscountCouponCode}
            onChange={(e) => handleInputChange('SearchDiscountCouponCode', e.target.value)}
          />
        </div>
        <div className="flex items-center mb-2">
          <label className="w-1/4 font-medium mr-2">Discount Name</label>
          <input
            type="text"
            className="border border-gray-300 px-4 py-2 rounded w-3/4"
            value={searchFields.SearchDiscountName}
            onChange={(e) => handleInputChange('SearchDiscountName', e.target.value)}
          />
        </div>
        <div className="flex items-center mb-2">
          <label className="w-1/4 font-medium mr-2">Discount Type</label>
          <select
            className="border border-gray-300 px-4 py-2 rounded w-3/4"
            value={searchFields.SearchDiscountTypeId}
            onChange={(e) => handleInputChange('SearchDiscountTypeId', e.target.value)}
          >
            <option value="0">All</option>
            <option value="1">Assigned to order total</option>
            <option value="2">Assigned to products</option>
            <option value="5">Assigned to categories</option>
            <option value="6">Assigned to manufacturers</option>
            <option value="10">Assigned to shipping</option>
            <option value="20">Assigned to order subtotal</option>
          </select>
        </div>
        <div className="flex items-center mb-2">
          <label className="w-1/4 font-medium mr-2">Start Date</label>
          <input
            type="date"
            className="border border-gray-300 px-4 py-2 rounded w-3/4"
            value={searchFields.SearchStartDate}
            onChange={(e) => handleInputChange('SearchStartDate', e.target.value)}
          />
        </div>
        <div className="flex items-center mb-2">
          <label className="w-1/4 font-medium mr-2">End Date</label>
          <input
            type="date"
            className="border border-gray-300 px-4 py-2 rounded w-3/4"
            value={searchFields.SearchEndDate}
            onChange={(e) => handleInputChange('SearchEndDate', e.target.value)}
          />
        </div>
        <div className="flex items-center mb-2">
          <label className="w-1/4 font-medium mr-2">Status</label>
          <select
            className="border border-gray-300 px-4 py-2 rounded w-3/4"
            value={searchFields.IsActiveId}
            onChange={(e) => handleInputChange('IsActiveId', e.target.value)}
          >
            <option value="0">All</option>
            <option value="1">Active only</option>
            <option value="2">Inactive only</option>
          </select>
        </div>
      </div>

      <div className="flex justify-center lg:mb-1 mb-3 items-center">
        <Button color="warning" className="shadow-md w-28" onClick={handleSearch}>
          <Search size={20} className='pr-1' />Search
        </Button>
      </div>

      <div className='justify-between flex gap-1 pb-3'>
        <div className='text-2xl text-orange-400'>Offer And Discount List</div>
        <div>
          <Link href="/station/portals/offerDiscount/addofferdiscount">
            <Button color="warning" className="shadow-md"><Plus size={20} className='pr-1' />Add</Button>
          </Link>
        </div>
      </div>

      {/* Table */}
      <table className="min-w-full text-left">
      <thead>
  <tr>
    <th className="px-2 py-2" >
      SR.NO 
    </th>
    <th>
      Coupon
    </th>
    
    <th className="px-2 py-2" onClick={() => handleSort('Name')}>
      NAME {sortConfig.key === 'Name' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}
    </th>
    <th className="px-2 py-2" onClick={() => handleSort('DiscountTypeName')}>
      DISCOUNT TYPE {sortConfig.key === 'DiscountTypeName' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}
    </th>
    <th className="px-2 py-2" onClick={() => handleSort('DiscountAmount')}>
      DISCOUNT (IN) {sortConfig.key === 'DiscountAmount' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}
    </th>
    <th className="px-2 py-2" onClick={() => handleSort('StartDateUtc')}>
      START DATE {sortConfig.key === 'StartDateUtc' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}
    </th>
    <th className="px-2 py-2" onClick={() => handleSort('EndDateUtc')}>
      END DATE {sortConfig.key === 'EndDateUtc' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}
    </th>
    <th className="px-2 py-2" onClick={() => handleSort('TimesUsed')}>
      TIMES USED {sortConfig.key === 'TimesUsed' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}
    </th>
    <th className="px-2 py-2" onClick={() => handleSort('IsActive')}>
      STATUS {sortConfig.key === 'IsActive' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}
    </th>
    <th className="px-2 py-2">ACTION</th>
  </tr>
</thead>


        <tbody>
          {sortedData.map((item, index) => (
            <tr key={item.Id}>
              
              <td className="px-2 py-2">{(currentPage - 1) * pageSize + index + 1}</td>
              <td className="px-2 py-2">{item.CouponCode}</td>
              <td className="px-2 py-2">{item.Name}</td>
              <td className="px-2 py-2 w-[200px]">{item.DiscountTypeName}</td>
              <td className='px-2 py-2'>{item.DiscountAmount}</td>
              <td className='px-2 py-2'>{item.StartDateUtc}</td>
              <td className='px-2 py-2'>{item.EndDateUtc}</td>
              <td className='px-2 py-2'>{item.TimesUsed}</td>
              <td className="px-4 py-2">
                {item.IsActive ? (
                  <Check size={20} className="text-success-700" />
                ) : (
                  ""
                )}
              </td>
              <td className="px-2 py-2">
                <div>
                  <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                                   <Link href={`/station/portals/offerDiscount/viewofferdiscount/${item.Id}`}>
                    <Button className="p-0 mr-2 bg-transparent hover:bg-transparent text-black dark:text-white">
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
                         
                  <Link href={`/station/portals/offerDiscount/editofferdiscount/${item.Id}`}>
                    <Button className="p-0 mr-2 bg-transparent hover:bg-transparent text-black dark:text-white">
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
                              
                  <Button onClick={() => handleDeleteUser(item.Id)} className="p-0 mr-2 bg-transparent hover:bg-transparent text-black dark:text-white">
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
        callfor={CallFor2}
        onDelete={() => {
          fetchData();
          setIsDeleteDialogOpen(false);
        }}
        delUrl={`Discount/admin-api/Delete/${selectedUserId}`}
      />
    </div>
  );
};

export default OfferDiscount;