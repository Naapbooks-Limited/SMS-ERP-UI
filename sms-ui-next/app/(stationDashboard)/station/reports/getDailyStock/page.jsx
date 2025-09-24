"use client"
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation';
import CallFor from '@/utilities/CallFor';
import { useForm } from 'react-hook-form';
import { Upload, Undo2 } from 'lucide-react';

const getDailyStock = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(9);
    const [searchQuery, setSearchQuery] = useState();
    const [tempSearchFields, setTempSearchFields] = useState({
        'FromDate': '',
        'Todate': '',
    });

    const [sortConfig, setSortConfig] = useState({ key: '', direction: 'asc' });
    const router = useRouter();
    const userData = JSON.parse(sessionStorage.getItem("userData") || "{}");

    const { formState: { errors }, setError: setFormError, clearErrors } = useForm();

    useEffect(() => {
        if (searchQuery !== undefined) {
            getOrderForReport();
        }
    }, [searchQuery]);

    const getOrderForReport = async () => {
        try {
            setLoading(true);
            setError(null);

            // Format dates to match API requirements
            const fromDate = searchQuery?.FromDate ? new Date(searchQuery.FromDate).toISOString() : '';
            const toDate = searchQuery?.Todate ? new Date(searchQuery.Todate).toISOString() : '';

            const response = await CallFor(
                `v2/Report/GetDailyStock?orgId=${userData?.orgid}&uaId=${userData?.uaid}&from=${fromDate}&to=${toDate}`,
                'GET',
                null,
                'Auth'
            );

            if (response?.status === 200) {
                setData(response.data);
            } else {
                throw new Error('Failed to fetch daily stock data');
            }
        } catch (err) {
            setError(err.message || 'An error occurred while fetching data');
            setData([]);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
    };

    useEffect(() => {
        setPage(1);
    }, [searchQuery, pageSize]);

    const handlePageChange = (pageNumber) => {
        setPage(pageNumber);
    };

    const handleSearch = () => {
        if (tempSearchFields?.FromDate === '' || tempSearchFields?.Todate === '') {
            setFormError('date', {
                type: 'manual',
                message: 'Please select From Date and To Date',
            });
            return;
        }

        // Validate date range
        const fromDate = new Date(tempSearchFields.FromDate);
        const toDate = new Date(tempSearchFields.Todate);
        
        if (fromDate > toDate) {
            setFormError('date', {
                type: 'manual',
                message: 'From Date cannot be later than To Date',
            });
            return;
        }

        setSearchQuery(tempSearchFields);
        clearErrors();
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
        if (!sortConfig.key) return 0;
        
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        
        if (typeof aValue === 'number' && typeof bValue === 'number') {
            return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
        }
        
        const aString = String(aValue).toLowerCase();
        const bString = String(bValue).toLowerCase();
        
        if (aString < bString) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aString > bString) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
    });

    // Calculate pagination
    const startIndex = (page - 1) * pageSize;
    const slicedData = sortedData.slice(startIndex, startIndex + pageSize);
    const totalPages = Math.ceil(sortedData.length / pageSize);

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
            <div className='flex'>
                <h1 className="text-[20px] pl-2 font-semibold mb-4 text-orange-400">Daily Stock Report</h1>
            </div>

            {/* Search inputs */}
            <div className="mb-4 grid grid-cols-1 lg:grid-cols-2 gap-x-10">
                {Object.keys(tempSearchFields).map(field => (
                    <div key={field} className="flex items-center mb-2">
                        <label className="w-1/4 font-semibold mr-2">{field}</label>
                        <input 
                            type='date'
                            className="border border-gray-300 px-4 py-2 rounded w-3/4"
                            onChange={(e) => handleInputChange(field, e.target.value)}
                        />
                    </div>
                ))}
            </div>
            {errors?.date && <span className="text-red-500">{errors?.date?.message}</span>}
            
            <div className="flex justify-center items-center mb-10 lg:mb-1">
                <Button 
                    color="warning" 
                    className="shadow-md w-28" 
                    onClick={handleSearch}
                    disabled={loading}
                >
                    {loading ? 'Loading...' : 'Apply'}
                </Button>
            </div>

            {error && (
                <div className="text-red-500 text-center mb-4">
                    {error}
                </div>
            )}

            <Button color="warning" onClick={() => router.back()} className="bg-blue-500 hover:bg-blue-600 text-white">
                <Undo2 className="mr-2" />
                Back
            </Button>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="min-w-full text-left">
                    <thead>
                        <tr>
                            <th className="px-4 py-2 cursor-pointer" onClick={() => handleSort('id')}>
                                Product Id {sortConfig.key === 'id' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}
                            </th>
                            <th className="px-4 py-2 cursor-pointer" onClick={() => handleSort('date')}>
                                Date {sortConfig.key === 'date' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}
                            </th>
                            <th className="px-4 py-2 cursor-pointer" onClick={() => handleSort('name')}>
                                Product Name {sortConfig.key === 'name' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}
                            </th>
                            <th className="px-4 py-2 cursor-pointer" onClick={() => handleSort('salescount')}>
                                Sales Count {sortConfig.key === 'salescount' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}
                            </th>
                            <th className="px-4 py-2 cursor-pointer" onClick={() => handleSort('purchasecount')}>
                                Purchase Count {sortConfig.key === 'purchasecount' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}
                            </th>
                            <th className="px-4 py-2 cursor-pointer" onClick={() => handleSort('transferinqty')}>
                                Transfer In Qty {sortConfig.key === 'transferinqty' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}
                            </th>
                            <th className="px-4 py-2 cursor-pointer" onClick={() => handleSort('transferoutqty')}>
                                Transfer Out Qty {sortConfig.key === 'transferoutqty' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}
                            </th>
                            <th className="px-4 py-2 cursor-pointer" onClick={() => handleSort('wastageqty')}>
                                Wastage Qty {sortConfig.key === 'wastageqty' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}
                            </th>
                            <th className="px-4 py-2 cursor-pointer" onClick={() => handleSort('cashsales')}>
                                Cash Sales {sortConfig.key === 'cashsales' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}
                            </th>
                            <th className="px-4 py-2 cursor-pointer" onClick={() => handleSort('qrsales')}>
                                QR Sales {sortConfig.key === 'qrsales' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan="10" className="text-center py-4">Loading...</td>
                            </tr>
                        ) : data.length === 0 ? (
                            <tr>
                                <td colSpan="10" className="text-center py-4">No data found</td>
                            </tr>
                        ) : (
                            slicedData.map((item, index) => (
                                <tr key={index} className="hover:bg-gray-50">
                                    <td className="px-2 py-2">{item?.id}</td>
                                    <td className="px-2 py-2">{formatDate(item?.date)}</td>
                                    <td className="px-2 py-2">{item?.name}</td>
                                    <td className="px-2 py-2">{item?.salescount?.toFixed(2)}</td>
                                    <td className="px-2 py-2">{item?.purchasecount?.toFixed(2)}</td>
                                    <td className="px-2 py-2">{item?.transferinqty?.toFixed(2)}</td>
                                    <td className="px-2 py-2">{item?.transferoutqty?.toFixed(2)}</td>
                                    <td className="px-2 py-2">{item?.wastageqty?.toFixed(2)}</td>
                                    <td className="px-2 py-2">{item?.cashsales?.toFixed(2)}</td>
                                    <td className="px-2 py-2">{item?.qrsales?.toFixed(2)}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="flex justify-end mt-4">
                {renderPagination()}
            </div>
        </div>
    );
};

export default getDailyStock;








