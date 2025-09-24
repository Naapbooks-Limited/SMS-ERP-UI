"use client"
import React, { useState, useEffect } from "react";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button'
import { Download, Search, Check, Eye, FilePenLine, Trash } from 'lucide-react';
import { DialogDescription } from '@radix-ui/react-dialog';
import Pagination from "@/components/pagination/Pagination";
import CallFor2 from "@/utilities/CallFor2";
import { Checkbox } from "@/components/ui/checkbox";

const ProductListModal = ({ onSelectProducts, cid, onClose }) => {
    console.log(cid, "cid")
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [selectedProductIds, setSelectedProductIds] = useState([]);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [bodyData, setBodyData] = useState(null);
    const [isOpen, setIsOpen] = useState(false);
    const [searchFields, setSearchFields] = useState({
        SearchProductName: "",
        SearchCategoryId: "0",
        SearchManufacturerId: "0",
        SearchStoreId: "0",
        SearchVendorId: "5",    
        SearchProductTypeId: "0",
    });

    const [selectAll, setSelectAll] = useState(false);
    const [sortConfig, setSortConfig] = useState({ key: "", direction: "asc" });

    const [availableCategories, setAvailableCategories] = useState([]);
    const [availableManufacturers, setAvailableManufacturers] = useState([]);
    const [availableStores, setAvailableStores] = useState([]);
    const [availableProductTypes, setAvailableProductTypes] = useState([]);

    const fetchInitialData = async () => {
        try {
            setLoading(true);
            const response = await CallFor2(
                `api/OCarouselVendorShopAdminAPI/ProductAddPopup/${cid}`,
                "GET",
                null,
                "Auth"
            );
            setBodyData(response.data);
            setLoading(false);
        } catch (error) {
            setError(error);
            setLoading(false);
        }
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await CallFor2(
                `api/OCarouselVendorShopAdminAPI/ProductAddPopupList`,
                "POST",
                {
                    ...bodyData,
                    SearchProductName: searchFields.SearchProductName,
                    SearchCategoryId: searchFields.SearchCategoryId,
                    SearchManufacturerId: searchFields.SearchManufacturerId,
                    SearchStoreId: searchFields.SearchStoreId,
                    SearchProductTypeId: searchFields.SearchProductTypeId,
                    Page: currentPage,
                    PageSize: totalPages,
                    Start: (currentPage - 1) * itemsPerPage,
                    Length: itemsPerPage,
                },
                "Auth"
            );
            setData(response.data.Data);
            setTotalPages(Math.ceil(response.data.recordsTotal / itemsPerPage));
            setLoading(false);
        } catch (error) {
            setError(error);
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchInitialData();
        }
    }, [cid, isOpen]);

    useEffect(() => {
        if (bodyData && isOpen) {
            fetchData();
        }
    }, [currentPage, itemsPerPage, bodyData, isOpen]);

    useEffect(() => {
        if (bodyData) {
            setAvailableCategories(bodyData.AvailableCategories || []);
            setAvailableManufacturers(bodyData.AvailableManufacturers || []);
            setAvailableStores(bodyData.AvailableStores || []);
            setAvailableProductTypes(bodyData.AvailableProductTypes || []);
        }
    }, [bodyData]);

    const handleConfirmSelection = async () => {
        try {
            const response = await CallFor2(
                'api/OCarouselVendorShopAdminAPI/ProductAddPopup',
                'POST',
                {
                    OCarouselId: parseInt(cid),
                    SelectedProductIds: selectedProductIds
                },
                'Auth'
            );

            console.log('API Response:', response);
            onSelectProducts(selectedProductIds);
            
            // Close modal and refresh page
            setIsOpen(false);
            if (onClose) onClose();
            
            // Refresh the page after a short delay to ensure modal closes properly
            // setTimeout(() => {
            //     window.location.reload();
            // }, 300);

        } catch (error) {
            console.error('Error calling API:', error);
        }
    };

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const handleSearch = () => {
        setCurrentPage(1);
        fetchData();
    };

    const handleInputChange = (field, value) => {
        setSearchFields({ ...searchFields, [field]: value });
    };

    const handleSort = (columnName) => {
        let direction = "asc";
        if (sortConfig.key === columnName && sortConfig.direction === "asc") {
            direction = "desc";
        }
        setSortConfig({ key: columnName, direction });
    };

    const handleCheckboxChange = (id) => {
        setSelectedProductIds(prevSelected => {
            const newSelected = prevSelected.includes(id)
                ? prevSelected.filter(item => item !== id)
                : [...prevSelected, id];
            
            setSelectAll(newSelected.length === data.length && data.length > 0);
            return newSelected;
        });
    };

    const handleSelectAll = (checked) => {
        setSelectAll(checked);
        if (checked) {
            const allProductIds = data.map(item => item.Id);
            setSelectedProductIds(allProductIds);
        } else {
            setSelectedProductIds([]);
        }
    };

    const sortedData = [...data].sort((a, b) => {
        if (!sortConfig.key) return 0;
        
        const aValue = a[sortConfig.key] || "";
        const bValue = b[sortConfig.key] || "";
        
        if (aValue < bValue) {
            return sortConfig.direction === "asc" ? -1 : 1;
        }
        if (aValue > bValue) {
            return sortConfig.direction === "asc" ? 1 : -1;
        }
        return 0;
    });

    const resetModal = () => {
        setSelectedProductIds([]);
        setSelectAll(false);
        setCurrentPage(1);
        setSearchFields({
            SearchProductName: "",
            SearchCategoryId: "0",
            SearchManufacturerId: "0",
            SearchStoreId: "0",
            SearchVendorId: "5",    
            SearchProductTypeId: "0",
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => {
            setIsOpen(open);
            if (open) resetModal();
        }}>
            <DialogTrigger asChild>
                <Button variant="outline">Open Product List</Button>
            </DialogTrigger>
            <DialogContent className="max-w-[95vw] w-full max-h-[95vh] flex flex-col">
                <DialogHeader className="flex-shrink-0">
                    <DialogTitle>Product List</DialogTitle>
                    <DialogDescription>Search and select products</DialogDescription>
                </DialogHeader>
                
                {/* Search Section - Fixed */}
                <div className="flex-shrink-0 border-b pb-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-4">
                        <div className="flex flex-col">
                            <label className="text-sm font-medium mb-1">Product Name</label>
                            <input
                                type="text"
                                placeholder="Enter product name"
                                className="border p-2 rounded w-full text-sm"
                                value={searchFields.SearchProductName}
                                onChange={(e) => handleInputChange("SearchProductName", e.target.value)}
                            />
                        </div>

                        <div className="flex flex-col">
                            <label className="text-sm font-medium mb-1">Category</label>
                            <select
                                className="border p-2 rounded w-full text-sm"
                                value={searchFields.SearchCategoryId}
                                onChange={(e) => handleInputChange("SearchCategoryId", e.target.value)}
                            >
                                {availableCategories.map((category) => (
                                    <option key={category.Value} value={category.Value}>
                                        {category.Text}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="flex flex-col">
                            <label className="text-sm font-medium mb-1">Manufacturer</label>
                            <select
                                className="border p-2 rounded w-full text-sm"
                                value={searchFields.SearchManufacturerId}
                                onChange={(e) => handleInputChange("SearchManufacturerId", e.target.value)}
                            >
                                {availableManufacturers.map((manufacturer) => (
                                    <option key={manufacturer.Value} value={manufacturer.Value}>
                                        {manufacturer.Text}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="flex flex-col">
                            <label className="text-sm font-medium mb-1">Store</label>
                            <select
                                className="border p-2 rounded w-full text-sm"
                                value={searchFields.SearchStoreId}
                                onChange={(e) => handleInputChange("SearchStoreId", e.target.value)}
                            >
                                {availableStores.map((store) => (
                                    <option key={store.Value} value={store.Value}>
                                        {store.Text}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="flex flex-col">
                            <label className="text-sm font-medium mb-1">Product Type</label>
                            <select
                                className="border p-2 rounded w-full text-sm"
                                value={searchFields.SearchProductTypeId}
                                onChange={(e) => handleInputChange("SearchProductTypeId", e.target.value)}
                            >
                                {availableProductTypes.map((productType) => (
                                    <option key={productType.Value} value={productType.Value}>
                                        {productType.Text}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                    
                    <div className="flex gap-2">
                        <Button onClick={handleSearch} className="w-fit" disabled={loading}>
                            <Search className="mr-2 h-4 w-4" /> 
                            {loading ? "Searching..." : "Search"}
                        </Button>
                        <div className="text-sm text-gray-600 flex items-center">
                            Selected: {selectedProductIds.length} of {data.length}
                        </div>
                    </div>
                </div>

                {/* Table Section - Scrollable */}
                <div className="flex-1 overflow-hidden flex flex-col min-h-0">
                    {loading ? (
                        <div className="flex-1 flex items-center justify-center">
                            <div className="text-center">Loading...</div>
                        </div>
                    ) : error ? (
                        <div className="flex-1 flex items-center justify-center">
                            <div className="text-center text-red-500">Error loading data</div>
                        </div>
                    ) : (
                        <div className="flex-1 overflow-auto border rounded-lg">
                            <table className="min-w-full border-collapse">
                                <thead className="sticky top-0 bg-white dark:bg-gray-800 z-10 border-b">
                                    <tr>
                                        <th className="px-4 py-3 text-left">
                                            <Checkbox
                                                checked={data.length > 0 && selectedProductIds.length === data.length}
                                                onCheckedChange={handleSelectAll}
                                                indeterminate={selectedProductIds.length > 0 && selectedProductIds.length < data.length}
                                            />
                                        </th>
                                        <th 
                                            className="px-4 py-3 text-left cursor-pointer hover:bg-gray-50 select-none" 
                                            onClick={() => handleSort("Name")}
                                        >
                                            <div className="flex items-center gap-1">
                                                Name 
                                                {sortConfig.key === "Name" && (
                                                    <span className="text-blue-500">
                                                        {sortConfig.direction === "asc" ? "▲" : "▼"}
                                                    </span>
                                                )}
                                            </div>
                                        </th>
                                        <th className="px-4 py-3 text-left">Published</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sortedData.length === 0 ? (
                                        <tr>
                                            <td colSpan="3" className="px-4 py-8 text-center text-gray-500">
                                                No products found
                                            </td>
                                        </tr>
                                    ) : (
                                        sortedData.map((item) => (
                                            <tr key={item.Id} className="border-t hover:bg-gray-50 transition-colors">
                                                <td className="px-4 py-3">
                                                    <Checkbox
                                                        checked={selectedProductIds.includes(item.Id)}
                                                        onCheckedChange={() => handleCheckboxChange(item.Id)}
                                                    />
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="font-medium">{item.Name}</div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    {item.Published ? (
                                                        <Check className="text-green-500 h-4 w-4" />
                                                    ) : (
                                                        <span className="text-gray-400 text-sm">Not published</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Footer Section - Fixed */}
                <div className="flex-shrink-0 pt-4 border-t">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={handlePageChange}
                        />
                        <DialogFooter className="gap-2">
                            <DialogClose asChild>
                                <Button 
                                    onClick={handleConfirmSelection} 
                                    disabled={selectedProductIds.length === 0}
                                    className="min-w-[120px]"
                                >
                                    Confirm ({selectedProductIds.length})
                                </Button>
                            </DialogClose>
                            <DialogClose asChild>
                                <Button variant="outline">Cancel</Button>
                            </DialogClose>
                        </DialogFooter>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default ProductListModal;