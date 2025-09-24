"use client";
import React, { useState, useEffect, useRef } from "react";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Search, Check, X } from 'lucide-react';
import Pagination from "@/components/pagination/Pagination";
import CallFor2 from "@/utilities/CallFor2";
import { Checkbox } from "@/components/ui/checkbox";

const ProductList = ({ Id, onProductsAdded, onSelectProducts }) => {
    const [data, setData] = useState([]);
    const [bodyData, setBodyData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [selectedProductIds, setSelectedProductIds] = useState([]);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [isOpen, setIsOpen] = useState(false);

    const [searchFields, setSearchFields] = useState({
        SearchProductName: "",
        SearchCategoryId: "0",
        SearchManufacturerId: "0",
        SearchStoreId: "0",
        SearchVendorId: "0",
        SearchProductTypeId: "0",
    });

    const [sortConfig, setSortConfig] = useState({ key: "", direction: "asc" });

    const [availableCategories, setAvailableCategories] = useState([]);
    const [availableManufacturers, setAvailableManufacturers] = useState([]);
    const [availableStores, setAvailableStores] = useState([]);
    const [availableVendors, setAvailableVendors] = useState([]);
    const [availableProductTypes, setAvailableProductTypes] = useState([]);

    const fetchInitialData = async () => {
        setLoading(true);
        try {
            const response = await CallFor2(
                `Discount/admin-api/ProductAddPopup/${Id}`,
                "GET",
                null,
                "Auth"
            );
            setBodyData(response.data);
            setAvailableCategories(response.data.AvailableCategories);
            setAvailableManufacturers(response.data.AvailableManufacturers);
            setAvailableStores(response.data.AvailableStores);
            setAvailableVendors(response.data.AvailableVendors);
            setAvailableProductTypes(response.data.AvailableProductTypes);
            setLoading(false);
        } catch (error) {
            setError(error);
            setLoading(false);
        }
    };

    const fetchData = async () => {
        if (!bodyData) return;
        setLoading(true);
        try {
            const postData = {
                ...bodyData,
                ...searchFields,
                Page: currentPage,
                PageSize: itemsPerPage,
            };
            const response = await CallFor2(
                `Discount/admin-api/ProductAddPopupList`,
                "POST",
                postData,
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
    }, [Id, isOpen]);

    useEffect(() => {
        if (bodyData && isOpen) {
            fetchData();
        }
    }, [currentPage, itemsPerPage, bodyData, isOpen]);

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
        setSelectedProductIds(prevSelected =>
            prevSelected.includes(id)
                ? prevSelected.filter(item => item !== id)
                : [...prevSelected, id]
        );
    };

    const handleSelectAll = (checked) => {
        if (checked) {
            const visibleProductIds = sortedData.map(item => item.Id);
            setSelectedProductIds(prevSelected => {
                const newSelection = new Set([...prevSelected, ...visibleProductIds]);
                return Array.from(newSelection);
            });
        } else {
            const visibleProductIds = new Set(sortedData.map(item => item.Id));
            setSelectedProductIds(prevSelected =>
                prevSelected.filter(id => !visibleProductIds.has(id))
            );
        }
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

    const handleConfirmSelection = async () => {
        try {
            setLoading(true);
            const response = await CallFor2(
                'Discount/admin-api/ProductAddPopup',
                'POST',
                {
                    DiscountId: parseInt(Id),
                    SelectedProductIds: selectedProductIds
                },
                'Auth'
            );
            
            if (onSelectProducts) {
                onSelectProducts(selectedProductIds);
            }
            
            if (onProductsAdded) {
                onProductsAdded();
            }
            
            setSelectedProductIds([]);
            setIsOpen(false);
            
        } catch (error) {
            console.error('Error calling API:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenChange = (open) => {
        setIsOpen(open);
        if (!open) {
            setSelectedProductIds([]);
            setCurrentPage(1);
            setSearchFields({
                SearchProductName: "",
                SearchCategoryId: "0",
                SearchManufacturerId: "0",
                SearchStoreId: "0",
                SearchVendorId: "0",
                SearchProductTypeId: "0",
            });
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button variant="outline" className="bg-orange-500 text-white hover:bg-orange-600">
                    Add Products
                </Button>
            </DialogTrigger>
            <DialogContent 
                className="
                    fixed 
                    inset-0 
                    w-screen 
                    h-screen 
                    max-w-none 
                    max-h-none
                    rounded-none
                    p-0 
                    transform-none 
                    translate-x-0 
                    translate-y-0
                    !scale-100
                    flex flex-col 
                "
            >
                <div className="flex flex-col h-full bg-white dark:bg-black">
                    {/* Header */}
                    <DialogHeader className="p-6 pb-4 border-b">
                        <div className="flex items-center justify-between">
                            <DialogTitle className="text-xl font-bold text-orange-500">
                                Add Products to Discount
                            </DialogTitle>
                            <DialogClose asChild>
                                <Button variant="ghost" size="sm">
                                    <X className="h-4 w-4" />
                                </Button>
                            </DialogClose>
                        </div>
                    </DialogHeader>

                    {/* Content */}
                    <div className="flex-1 overflow-auto p-6">
                        {/* Search Filters */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Product Name</label>
                                <input
                                    type="text"
                                    placeholder="Search by product name..."
                                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                                    value={searchFields.SearchProductName}
                                    onChange={(e) => handleInputChange("SearchProductName", e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Category</label>
                                <select
                                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
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
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Manufacturer</label>
                                <select
                                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
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
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Store</label>
                                <select
                                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
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
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Vendor</label>
                                <select
                                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                                    value={searchFields.SearchVendorId}
                                    onChange={(e) => handleInputChange("SearchVendorId", e.target.value)}
                                >
                                    {availableVendors.map((vendor) => (
                                        <option key={vendor.Value} value={vendor.Value}>
                                            {vendor.Text}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Product Type</label>
                                <select
                                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
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

                        {/* Search Button */}
                        <div className="mb-6">
                            <Button onClick={handleSearch} className="bg-orange-500 hover:bg-orange-600">
                                <Search className="mr-2 h-4 w-4" /> Search Products
                            </Button>
                        </div>

                        {/* Selection Info */}
                        {selectedProductIds.length > 0 && (
                            <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-md">
                                <span className="text-sm font-medium text-orange-800">
                                    {selectedProductIds.length} product(s) selected
                                </span>
                            </div>
                        )}

                        {/* Products Table */}
                        <div className="border border-gray-200 rounded-lg overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left">
                                                <Checkbox
                                                    checked={sortedData.length > 0 && sortedData.every(item => selectedProductIds.includes(item.Id))}
                                                    onCheckedChange={handleSelectAll}
                                                />
                                            </th>
                                            <th 
                                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                                onClick={() => handleSort("Name")}
                                            >
                                                <div className="flex items-center space-x-1">
                                                    <span>Product Name</span>
                                                    {sortConfig.key === "Name" && (
                                                        <span className="text-orange-500">
                                                            {sortConfig.direction === "asc" ? "▲" : "▼"}
                                                        </span>
                                                    )}
                                                </div>
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Published
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Category
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Price
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {loading ? (
                                            <tr>
                                                <td colSpan="5" className="px-6 py-8 text-center">
                                                    <div className="flex items-center justify-center">
                                                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500"></div>
                                                        <span className="ml-2">Loading products...</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : sortedData.length === 0 ? (
                                            <tr>
                                                <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                                                    No products found. Try adjusting your search criteria.
                                                </td>
                                            </tr>
                                        ) : (
                                            sortedData.map((item) => (
                                                <tr 
                                                    key={item.Id} 
                                                    className={`hover:bg-gray-50 ${selectedProductIds.includes(item.Id) ? 'bg-orange-50' : ''}`}
                                                >
                                                    <td className="px-6 py-4">
                                                        <Checkbox
                                                            checked={selectedProductIds.includes(item.Id)}
                                                            onCheckedChange={() => handleCheckboxChange(item.Id)}
                                                        />
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {item.Name}
                                                        </div>
                                                        {item.Sku && (
                                                            <div className="text-xs text-gray-500">
                                                                SKU: {item.Sku}
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        {item.Published ? (
                                                            <Check className="h-5 w-5 text-green-500" />
                                                        ) : (
                                                            <X className="h-5 w-5 text-red-500" />
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-900">
                                                        {item.CategoryName || 'N/A'}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-900">
                                                        {item.Price ? `$${item.Price}` : 'N/A'}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="mt-6 flex justify-center">
                                <Pagination
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    onPageChange={handlePageChange}
                                />
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <DialogFooter className="p-6 pt-4 border-t bg-gray-50">
                        <div className="flex items-center justify-between w-full">
                            <div className="text-sm text-gray-600">
                                {selectedProductIds.length > 0 && (
                                    <span>{selectedProductIds.length} product(s) selected</span>
                                )}
                            </div>
                            <div className="flex space-x-3">
                                <DialogClose asChild>
                                    <Button variant="outline" disabled={loading}>
                                        Cancel
                                    </Button>
                                </DialogClose>
                                <Button 
                                    onClick={handleConfirmSelection} 
                                    disabled={selectedProductIds.length === 0 || loading}
                                    className="bg-orange-500 hover:bg-orange-600"
                                >
                                    {loading ? 'Adding...' : `Add Selected Products (${selectedProductIds.length})`}
                                </Button>
                            </div>
                        </div>
                    </DialogFooter>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default ProductList;