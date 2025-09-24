"use client"
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation';
import CallFor from '@/utilities/CallFor';
import { useForm } from 'react-hook-form';
import { Upload, Undo2 } from 'lucide-react';


const orderReport = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    // const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(9);
    const [searchQuery, setSearchQuery] = useState();
    const [tempSearchFields, setTempSearchFields] = useState({
        'FromDate': '',
        'Todate': '',
        // "Warehouse Name": '',
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
    const userData = JSON.parse(sessionStorage.getItem("userData") || "{}");
    const orgid = userData.orgid;

    const { formState: { errors }, setError, clearErrors } = useForm();

    useEffect(() => {
        if (searchQuery !== undefined) {
            getOrderForReport();
        }
    }, [searchQuery]);

    const getOrderForReport = async () => {
        const response = await CallFor(`v2/Report/GetOrders?PageNumber=${page}&PageSize=${pageSize}&OrgId=${orgid}&From=${searchQuery?.FromDate}&To=${searchQuery?.Todate}&UaId=${userData?.uaid}&BuyerId=${userData?.uid}&Createdby=${userData?.uid}&Modifiedby=&Deletedby=&Buyer=&Consignee=&Status=&Placeofsupply=&ProId=149&LedgerId=&oType=true`, 'GET', null, 'Auth');
        if (response?.status === 200) {
            setData(response.data.data);
            setPage(response.data.pageNumber);
            setPageSize(response.data.pageSize);
        }
    }

    const formatDate = (dateString) => {
        const date = new Date(dateString);

        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0'); // getMonth() returns 0-indexed month
        const year = date.getFullYear();

        return `${day}-${month}-${year}`;
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
        if (tempSearchFields?.FromDate === '' || tempSearchFields?.Todate === '') {
            setError('date', {
                type: 'manual',
                message: 'Please select From Date and To Date',
            });
        } else {
            setSearchFields(tempSearchFields);
            setSearchQuery(tempSearchFields); // Trigger useEffect
            clearErrors();
        }
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
        <div className="container mx-auto mb-3">
            <div className='flex '>
                <h1 className="text-[20px] pl-2 font-semibold mb-4 text-orange-400">Products Report</h1>
            </div>

            <div className="mb-4 grid grid-cols-1 lg:grid-cols-2 gap-x-10">
                {Object.keys(tempSearchFields).map(field => (
                    <div key={field} className="flex items-center mb-2">
                        <label className="w-1/4 font-semibold   mr-2">{field}</label>
                        {field === 'FromDate' || field === 'Todate' ? (
                            <input type='date'
                                className="border border-gray-300 px-4 py-2 rounded w-3/4"
                                onChange={(e) => handleInputChange(field, e.target.value)}
                            />
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
            {errors?.date && <span className="text-red-500">{errors?.date?.message}</span>}
            <div className="flex justify-center items-center mb-10 lg:mb-1 ">
                <Button color="warning" className="shadow-md w-28" onClick={handleSearch}>
                    Apply
                </Button>
            </div>
            {/* <div className='text-right'>
                    <Button color="destructive" className="shadow-md my-2 lg:mx-2 mx-2"><Upload size={20} className='pr-1' />Export</Button>
                </div> */}

            <Button color="warning" onClick={() => router.back()} className="bg-blue-500 hover:bg-blue-600 text-white">
                <Undo2 className="mr-2" />
                Back
            </Button>


            {/* Table */}
            <table className="min-w-full text-left">
                {/* Table headers */}
                <thead>
                    <tr>
                        <th className="  px-4 py-2 cursor-pointer" onClick={() => handleSort('id')}>
                            Order No{sortConfig.key === 'id' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}
                        </th>

                        <th className="  px-4 py-2 cursor-pointer" onClick={() => handleSort('username')}>
                            Order Date{sortConfig.key === 'username' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}
                        </th>
                        <th className="  px-4 py-2 cursor-pointer" onClick={() => handleSort('email')}>
                            Order from {sortConfig.key === 'email' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}
                        </th>
                        <th className=" px-4 py-2 cursor-pointer" onClick={() => handleSort('phone')}>
                            Order To {sortConfig.key === 'phone' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}
                        </th>
                        <th className=" px-4 py-2 cursor-pointer" onClick={() => handleSort('phone')}>
                            Product - qty   {sortConfig.key === 'phone' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}
                        </th>
                        <th className=" px-4 py-2 cursor-pointer" onClick={() => handleSort('phone')}>
                            Adress {sortConfig.key === 'phone' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}
                        </th>
                    </tr>
                </thead>
                {/* Table data */}
                <tbody>
                    {data?.map((item, index) => (
                        <tr key={index}>
                            <td className="px-2 py-2">{item?.orderno}</td>
                            <td className="px-2 py-2">{formatDate(item?.orderdate)}</td>
                            <td className="px-2 py-2">{item?.oDeliveryFrom}</td>
                            <td className="px-2 py-2">{item?.oDeliverto}</td>
                            <td className="px-2 py-2">
                                {
                                    item?.orderitems?.map((ordered, index) => {
                                        return (
                                            <>
                                                <p key={index}>{ordered?.proname} - qty({ordered?.itemqty})</p>
                                            </>
                                        )
                                    }
                                    )
                                }
                            </td>
                            <td className="px-2 py-2">{item?.deliveryAddress}</td>
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

export default orderReport;


