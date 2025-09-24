"use client"
import React, { useEffect, useState, useCallback } from 'react';
import CallFor2 from '@/utilities/CallFor2';
import Select from 'react-select';
import makeAnimated from 'react-select/animated';
import { Button } from '@/components/ui/button';
import ProductListModal from '../../additem/page';
import CategoryProductListModal from '../../categoryitem/page';
import { renderTextToSvgTextElement } from '@unovis/ts';
import { toast as reToast } from "react-hot-toast";
import { useRouter } from 'next/navigation';
import Pagination from '@/components/pagination/Pagination';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload } from "lucide-react";

const inputClasses = "mt-1 block w-full border border-border rounded-md p-2";
const labelClasses = "block text-sm font-medium text-muted-foreground mr-4 w-1/3";
const formGroupClasses = "flex items-center space-x-4";

const animatedComponents = makeAnimated();

const EditCarousel = ({ params }) => {
    const logindata = sessionStorage.getItem('userData');
    const userData = JSON.parse(logindata);
    const router = useRouter()

    const [formData, setFormData] = useState({
        Name: "",
        VendorId: userData.nopVendorId,
        Title: "",
        DisplayTitle: true,
        Active: true,
        WidgetZoneId: 1003,
        WidgetZoneStr: null,
        DataSourceTypeId: 100,
        DataSourceTypeStr: null,
        ShowBackgroundPicture: false,
        BackgroundPictureId: 0,
        CustomUrl: null,
        NumberOfItemsToShow: 5,
        AutoPlay: false,
        CustomCssClass: null,
        DisplayOrder: 0,
        Loop: false,
        StartPosition: 0,
        Center: false,
        Nav: false,
        LazyLoad: false,
        LazyLoadEager: 0,
        AutoPlayTimeout: 0,
        AutoPlayHoverPause: false,
        CreatedOn: "0001-01-01T00:00:00",
        UpdatedOn: "0001-01-01T00:00:00",
        OCarouselItemSearchModel: {
            OCarouselId: 0,
            Page: 1,
            PageSize: 10,
            AvailablePageSizes: null,
            Draw: null,
            Start: 0,
            Length: 10,
            CustomProperties: {}
        },
        SelectedStoreIds: [],
        Id: 0,
        CustomProperties: {}
    });

    const [widgetZones, setWidgetZones] = useState([]);
    const [dataSources, setDataSources] = useState([]);
    const [backgroundPicture, setBackgroundPicture] = useState(null);
    const [backgroundPicturePreview, setBackgroundPicturePreview] = useState(null);
    const [OCarouselItemList, setOCarouselItemList] = useState([])
    const [stores, setStores] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [editingItemId, setEditingItemId] = useState(null);
    const [editingDisplayOrder, setEditingDisplayOrder] = useState(null);
    const [showCategoryProductList, setShowCategoryProductList] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [pageSize, setPageSize] = useState(5);

    // Refresh function for modals
    const refreshCarouselItems = useCallback(() => {
        setRefreshTrigger(prev => prev + 1);
    }, []);

    const OCarouselItemLists = useCallback(async (page = currentPage) => {
        if (!params.cid) return;

        setLoading(true);
        try {
            const OCarouselItemListBody = {
                OCarouselId: parseFloat(params.cid),
                Page: page,
                PageSize: pageSize,
                AvailablePageSizes: null,
                Draw: null,
                Start: (page - 1) * pageSize,
                Length: pageSize,
                "CustomProperties": {}
            }

            const response = await CallFor2(
                `api/OCarouselVendorShopAdminAPI/OCarouselItemList`,
                "post",
                OCarouselItemListBody,
                "Auth"
            );

            setOCarouselItemList(response.data.Data || []);
            setTotalPages(Math.ceil(response.data.recordsTotal / pageSize));
            setCurrentPage(page);
            setLoading(false);
        } catch (error) {
            setError(error);
            setLoading(false);
            console.error('Error fetching carousel items:', error);
        }
    }, [params.cid, pageSize, currentPage]);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const response = await CallFor2(
                    `api/OCarouselVendorShopAdminAPI/GetCarouselById/${params.cid}`,
                    "get",
                    null,
                    "Auth"
                );
                setFormData(response.data);
                setWidgetZones(response.data.AvailableWidgetZones || []);
                setDataSources(response.data.AvailableDataSources || []);
                setStores(response.data.AvailableStores || []);
                if (response.data.ShowBackgroundPicture && response.data.CustomUrl) {
                    setBackgroundPicturePreview(response.data.CustomUrl);
                }
                setLoading(false);
            } catch (error) {
                setError(error);
                setLoading(false);
            }
        };

        fetchData();
    }, [params]);

    // Fetch carousel items when component mounts or refreshTrigger changes
    useEffect(() => {
        OCarouselItemLists(1);
    }, [params.cid, refreshTrigger]);

    // Auto-detect if we should show category or product modal
    useEffect(() => {
        const isCategoryDataSource = dataSources.find(
            source => source.Value === formData.DataSourceTypeId.toString()
        )?.Text.toLowerCase().includes('categories');

        setShowCategoryProductList(isCategoryDataSource);
    }, [formData.DataSourceTypeId, dataSources]);

    const handlePageChange = (page) => {
        setCurrentPage(page);
        OCarouselItemLists(page);
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: type === 'checkbox' ? checked : value
        }));

        if (name === 'ShowBackgroundPicture' && !checked) {
            setBackgroundPicture(null);
            setBackgroundPicturePreview(null);
            setFormData(prevState => ({ ...prevState, BackgroundPictureId: 0 }));
        }
    };

    const handlePictureUpload = async (e) => {
        const file = e.target.files[0];
        if (file) {
            setBackgroundPicture(file);
            setBackgroundPicturePreview(URL.createObjectURL(file));

            const formData = new FormData();
            formData.append('picturefile', file);

            try {
                const response = await CallFor2(
                    'api-fe/Account/UploadPicture',
                    'post',
                    formData,
                    'authWithContentTypeMultipart'
                );

                if (response.data) {
                    setFormData(prevState => ({
                        ...prevState,
                        BackgroundPictureId: response.data.Data.PictureId,
                        CustomUrl: response.data.Data.PictureUrl
                    }));
                }
            } catch (error) {
                console.error('Error uploading picture:', error);
                reToast.error('Failed to upload picture');
            }
        }
    };

    const removePicture = () => {
        setBackgroundPicture(null);
        setBackgroundPicturePreview(null);
        setFormData(prevState => ({ ...prevState, BackgroundPictureId: 0, CustomUrl: null }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const submissionData = {
                ...formData,
                AvailableWidgetZones: widgetZones.map(zone => ({
                    ...zone,
                    Selected: zone.Value === formData.WidgetZoneId.toString()
                })),
                AvailableDataSources: dataSources.map(source => ({
                    ...source,
                    Selected: source.Value === formData.DataSourceTypeId.toString()
                })),
                AvailableStores: stores.map(store => ({
                    ...store,
                    Selected: formData.SelectedStoreIds.includes(store.Value)
                })),
                Locales: [{ LanguageId: 1, Title: formData.Title }]
            };

            const response = await CallFor2(
                'api/OCarouselVendorShopAdminAPI/Edit',
                'post',
                submissionData,
                'Auth'
            );
            if (response) {
                reToast.success('Edit carousels successful');
                router.push("/station/portals/carousels")
            }
            console.log('Form submitted successfully:', response);
            setLoading(false);
        } catch (error) {
            console.error('Error submitting form:', error);
            reToast.error('Failed to update carousel');
            setError(error);
            setLoading(false);
        }
    };

    const handleEdit = (item, e) => {
        e.preventDefault();
        setEditingItemId(item.Id);
        setEditingDisplayOrder(item.DisplayOrder);
    };

    const handleCancelEdit = (e) => {
        e.preventDefault();
        setEditingItemId(null);
        setEditingDisplayOrder(null);
    };

    const handleSaveEdit = async (item, e) => {
        e.preventDefault();
        e.stopPropagation();

        try {
            setLoading(true);
            const response = await CallFor2(
                'api/OCarouselVendorShopAdminAPI/OCarouselItemEdit',
                'post',
                {
                    ...item,
                    DisplayOrder: editingDisplayOrder
                },
                'Auth'
            );

            if (response) {
                reToast.success('Display order updated');
                // Update the local state immediately
                setOCarouselItemList(prevList =>
                    prevList.map(i => i.Id === item.Id ? { ...i, DisplayOrder: editingDisplayOrder } : i)
                );
                setEditingItemId(null);
                setEditingDisplayOrder(null);
            }
            setLoading(false);
        } catch (error) {
            console.error('Error updating carousel item:', error);
            reToast.error('Failed to update display order');
            setLoading(false);
        }
    };

    const handleProductSelection = (selectedIds) => {
        console.log('Selected products:', selectedIds);
        // Refresh the carousel items list after product selection
        refreshCarouselItems();
        reToast.success(`${selectedIds.length} products added to carousel`);
    };

    const handleDeleteCarouselItem = async (itemId) => {
        try {
            setLoading(true);
            const response = await CallFor2(
                `api/OCarouselVendorShopAdminAPI/OCarouselItemDelete/${itemId}`,
                "delete",
                null,
                "Auth"
            );

            if (response) {
                reToast.success('Item removed from carousel');
                refreshCarouselItems();
            }
            setLoading(false);
        } catch (error) {
            console.error('Error deleting carousel item:', error);
            reToast.error('Failed to remove item');
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto px-4">
            <form onSubmit={handleSubmit}>
                <div>
                    <h2 className="text-2xl font-semibold text-orange-400 mb-4">Edit Carousel</h2>

                    {/* Info Section */}
                    <div className="p-6 mt-6 bg-card rounded-lg shadow-md">
                        <h3 className="text-lg font-bold mb-3">Info</h3>
                        <div className="space-y-4">
                            <div className={formGroupClasses}>
                                <label className={labelClasses}>Name</label>
                                <input
                                    type="text"
                                    name="Name"
                                    value={formData.Name}
                                    onChange={handleInputChange}
                                    className={inputClasses}
                                />
                            </div>
                            <div className={formGroupClasses}>
                                <label className={labelClasses}>Title</label>
                                <input
                                    type="text"
                                    name="Title"
                                    value={formData.Title}
                                    onChange={handleInputChange}
                                    className={inputClasses}
                                />
                            </div>
                            <div className={formGroupClasses}>
                                <label className={labelClasses}>Display title</label>
                                <input
                                    type="checkbox"
                                    name="DisplayTitle"
                                    checked={formData.DisplayTitle}
                                    onChange={handleInputChange}
                                    className="mt-1"
                                />
                            </div>
                            <div className={formGroupClasses}>
                                <label className={labelClasses}>Widget zone</label>
                                <Select
                                    name="WidgetZoneId"
                                    value={widgetZones.find(zone => zone.Value === formData.WidgetZoneId.toString())}
                                    onChange={(selectedOption) => setFormData(prev => ({
                                        ...prev,
                                        WidgetZoneId: parseInt(selectedOption.Value)
                                    }))}
                                    options={widgetZones}
                                    getOptionLabel={(option) => option.Text}
                                    getOptionValue={(option) => option.Value}
                                    className="w-full text-black"
                                />
                            </div>
                            <div className={formGroupClasses}>
                                <label className={labelClasses}>Data source type</label>
                                <Select
                                    name="DataSourceTypeId"
                                    value={dataSources.find(source => source.Value === formData.DataSourceTypeId.toString())}
                                    onChange={(selectedOption) => setFormData(prev => ({
                                        ...prev,
                                        DataSourceTypeId: parseInt(selectedOption.Value)
                                    }))}
                                    options={dataSources}
                                    getOptionLabel={(option) => option.Text}
                                    getOptionValue={(option) => option.Value}
                                    className="w-full text-black"
                                />
                            </div>
                            <div className={formGroupClasses}>
                                <label className={labelClasses}>Show Background Picture</label>
                                <input
                                    type="checkbox"
                                    name="ShowBackgroundPicture"
                                    checked={formData.ShowBackgroundPicture}
                                    onChange={handleInputChange}
                                    className="mt-1"
                                />
                            </div>
                            {formData.ShowBackgroundPicture && (
                                <div className={formGroupClasses}>
                                    <label className={labelClasses}>Background Picture</label>
                                    <div className="flex flex-col items-start">
                                        {!backgroundPicturePreview &&
                                            <Label>
                                                <Button asChild type="button">
                                                    <div>
                                                        <Upload className="mr-2 h-4 w-4" /> Choose File
                                                    </div>
                                                </Button>
                                                <Input
                                                    type="file"
                                                    className="hidden"
                                                    onChange={handlePictureUpload}
                                                />
                                            </Label>
                                        }
                                        {backgroundPicturePreview && (
                                            <div className="mt-2">
                                                <img src={backgroundPicturePreview} alt="Background Preview" className="max-w-xs max-h-40 object-contain" />
                                                <button
                                                    type="button"
                                                    onClick={removePicture}
                                                    className="mt-2 bg-red-500 text-white px-2 py-1 rounded text-sm"
                                                >
                                                    Remove Picture
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                            <div className={formGroupClasses}>
                                <label className={labelClasses}>Display order</label>
                                <input
                                    type="number"
                                    name="DisplayOrder"
                                    value={formData.DisplayOrder}
                                    onChange={handleInputChange}
                                    className={inputClasses}
                                />
                            </div>
                            <div className={formGroupClasses}>
                                <label className={labelClasses}>Limited to stores</label>
                                <Select
                                    isMulti
                                    components={animatedComponents}
                                    name="SelectedStoreIds"
                                    value={stores.filter(store => formData.SelectedStoreIds.includes(store.Value))}
                                    onChange={(selectedOptions) => setFormData(prev => ({
                                        ...prev,
                                        SelectedStoreIds: selectedOptions.map(option => option.Value)
                                    }))}
                                    options={stores}
                                    getOptionLabel={(option) => option.Text}
                                    getOptionValue={(option) => option.Value}
                                    className="w-full text-black"
                                />
                            </div>
                            <div className={formGroupClasses}>
                                <label className={labelClasses}>Active</label>
                                <input
                                    type="checkbox"
                                    name="Active"
                                    checked={formData.Active}
                                    onChange={handleInputChange}
                                    className="mt-1"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Properties Section */}
                    <div className="p-6 mt-6 bg-card rounded-lg shadow-md">
                        <h3 className="text-lg font-bold mb-3">Properties</h3>
                        <div className="space-y-4">
                            <div className={formGroupClasses}>
                                <label className={labelClasses}>NAV</label>
                                <input
                                    type="checkbox"
                                    name="Nav"
                                    checked={formData.Nav}
                                    onChange={handleInputChange}
                                    className="mt-1"
                                />
                            </div>
                            <div className={formGroupClasses}>
                                <label className={labelClasses}>Auto play</label>
                                <input
                                    type="checkbox"
                                    name="AutoPlay"
                                    checked={formData.AutoPlay}
                                    onChange={handleInputChange}
                                    className="mt-1"
                                />
                            </div>
                            {formData.AutoPlay && (
                                <>
                                    <div className={formGroupClasses}>
                                        <label className={labelClasses}>Auto Play Timeout</label>
                                        <input
                                            type="number"
                                            name="AutoPlayTimeout"
                                            value={formData.AutoPlayTimeout}
                                            onChange={handleInputChange}
                                            className={inputClasses}
                                        />
                                    </div>
                                    <div className={formGroupClasses}>
                                        <label className={labelClasses}>Auto play hover pause</label>
                                        <input
                                            type="checkbox"
                                            name="AutoPlayHoverPause"
                                            checked={formData.AutoPlayHoverPause}
                                            onChange={handleInputChange}
                                            className="mt-1"
                                        />
                                    </div>
                                </>
                            )}
                            <div className={formGroupClasses}>
                                <label className={labelClasses}>Lazy load</label>
                                <input
                                    type="checkbox"
                                    name="LazyLoad"
                                    checked={formData.LazyLoad}
                                    onChange={handleInputChange}
                                    className="mt-1"
                                />
                            </div>
                            {formData.LazyLoad && (
                                <div className={formGroupClasses}>
                                    <label className={labelClasses}>Lazy load Eager</label>
                                    <input
                                        type="number"
                                        name="LazyLoadEager"
                                        value={formData.LazyLoadEager}
                                        onChange={handleInputChange}
                                        className={inputClasses}
                                    />
                                </div>
                            )}
                            <div className={formGroupClasses}>
                                <label className={labelClasses}>Start position</label>
                                <input
                                    type="number"
                                    name="StartPosition"
                                    value={formData.StartPosition}
                                    onChange={handleInputChange}
                                    className={inputClasses}
                                />
                            </div>
                            <div className={formGroupClasses}>
                                <label className={labelClasses}>Loop</label>
                                <input
                                    type="checkbox"
                                    name="Loop"
                                    checked={formData.Loop}
                                    onChange={handleInputChange}
                                    className="mt-1"
                                />
                            </div>
                            <div className={formGroupClasses}>
                                <label className={labelClasses}>Center</label>
                                <input
                                    type="checkbox"
                                    name="Center"
                                    checked={formData.Center}
                                    onChange={handleInputChange}
                                    className="mt-1"
                                />
                            </div>
                            <div className={formGroupClasses}>
                                <label className={labelClasses}>Custom CSS class</label>
                                <input
                                    type="text"
                                    name="CustomCssClass"
                                    value={formData.CustomCssClass || ""}
                                    onChange={handleInputChange}
                                    className={inputClasses}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Carousel Items Section */}
                    <div className="p-6 mt-6 bg-card rounded-lg shadow-md">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold">Carousel Items</h3>
                            <div className="flex gap-2">
                                {!showCategoryProductList && (
                                    <ProductListModal
                                        cid={params.cid}
                                        onSelectProducts={handleProductSelection}
                                    // onClose={refreshCarouselItems}
                                    />
                                )}
                                {showCategoryProductList && (
                                    <CategoryProductListModal
                                        cid={params.cid}
                                        onSelectProducts={handleProductSelection}
                                        onClose={refreshCarouselItems}
                                    />
                                )}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <section className="mx-auto w-full max-w-7xl">
                                <div className="mt-6 flex flex-col">
                                    <div className="overflow-x-auto">
                                        <div className="inline-block min-w-full py-2 align-middle">
                                            <div className="overflow-hidden border border-gray-200 md:rounded-lg">
                                                {loading ? (
                                                    <div className="flex justify-center items-center py-8">
                                                        <div className="text-gray-500">Loading...</div>
                                                    </div>
                                                ) : (
                                                    <table className="min-w-full divide-y divide-gray-200">
                                                        <thead className="bg-gray-50">
                                                            <tr className="divide-x divide-gray-200">
                                                                <th className="px-4 py-3.5 text-left text-sm font-normal text-gray-500">
                                                                    Picture
                                                                </th>
                                                                <th className="px-12 py-3.5 text-left text-sm font-normal text-gray-500">
                                                                    Product
                                                                </th>
                                                                <th className="px-4 py-3.5 text-left text-sm font-normal text-gray-500">
                                                                    View
                                                                </th>
                                                                <th className="px-4 py-3.5 text-left text-sm font-normal text-gray-500">
                                                                    Display Order
                                                                </th>
                                                                <th className="px-4 py-3.5 text-left text-sm font-normal text-gray-500">
                                                                    Action
                                                                </th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-gray-200">
                                                            {OCarouselItemList.length === 0 ? (
                                                                <tr>
                                                                    <td colSpan="5" className="px-4 py-8 text-center text-gray-500">
                                                                        No items in carousel. Use the modal above to add products.
                                                                    </td>
                                                                </tr>
                                                            ) : (
                                                                OCarouselItemList.map((item) => (
                                                                    <tr key={item.Id} className="divide-x divide-gray-200 hover:bg-gray-50">
                                                                        <td className="whitespace-nowrap px-4 py-4">
                                                                            <div className="flex items-center">
                                                                                <div className="flex-shrink-0">
                                                                                    <img
                                                                                        className="h-20 w-20 object-cover rounded"
                                                                                        src={item.PictureUrl || '/placeholder-image.jpg'}
                                                                                        alt={item.ProductName}

                                                                                    />
                                                                                </div>
                                                                            </div>
                                                                        </td>
                                                                        <td className="px-5 py-4 max-w-xs">
                                                                            <div className="text-sm text-gray-900 dark:text-white font-medium">
                                                                                {item.ProductName}
                                                                            </div>
                                                                        </td>
                                                                        <td className="whitespace-nowrap px-4 py-4">
                                                                            <span className="inline-flex rounded-full bg-green-100 px-2 text-xs font-semibold leading-5 text-green-800">
                                                                                Active
                                                                            </span>
                                                                        </td>
                                                                        <td className="whitespace-nowrap px-4 py-4 text-sm dark:text-white text-gray-500">
                                                                            {editingItemId === item.Id ? (
                                                                                <input
                                                                                    type="number"
                                                                                    value={editingDisplayOrder}
                                                                                    onChange={(e) => setEditingDisplayOrder(Number(e.target.value))}
                                                                                    className="w-20 px-2 py-1 border rounded"
                                                                                    min="0"
                                                                                />
                                                                            ) : (
                                                                                item.DisplayOrder
                                                                            )}
                                                                        </td>
                                                                        <td className="whitespace-nowrap px-4 py-4 text-sm font-medium">
                                                                            <div className="flex gap-2">
                                                                                {editingItemId === item.Id ? (
                                                                                    <>
                                                                                        <Button
                                                                                            type="button"
                                                                                            onClick={(e) => handleSaveEdit(item, e)}
                                                                                            className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-xs"
                                                                                            disabled={loading}
                                                                                        >
                                                                                            Save
                                                                                        </Button>
                                                                                        <Button
                                                                                            type="button"
                                                                                            onClick={handleCancelEdit}
                                                                                            className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded text-xs"
                                                                                        >
                                                                                            Cancel
                                                                                        </Button>
                                                                                    </>
                                                                                ) : (
                                                                                    <>
                                                                                        <Button
                                                                                            type="button"
                                                                                            onClick={(e) => handleEdit(item, e)}
                                                                                            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs"
                                                                                        >
                                                                                            Edit
                                                                                        </Button>
                                                                                        <Button
                                                                                            type="button"
                                                                                            onClick={() => handleDeleteCarouselItem(item.Id)}
                                                                                            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs"
                                                                                            disabled={loading}
                                                                                        >
                                                                                            Remove
                                                                                        </Button>
                                                                                    </>
                                                                                )}
                                                                            </div>
                                                                        </td>
                                                                    </tr>
                                                                ))
                                                            )}
                                                        </tbody>
                                                    </table>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Pagination for Carousel Items */}
                                <div className="mt-4 w-full border-gray-300">
                                    <div className="mt-2 flex items-center justify-end">
                                        <div className="space-x-2">
                                            <Pagination
                                                currentPage={currentPage}
                                                totalPages={totalPages}
                                                onPageChange={handlePageChange}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </section>
                        </div>
                    </div>

                    {/* Save Button */}
                    <div className="mt-6 flex space-x-4">
                        <button
                            type="submit"
                            className="bg-primary text-primary-foreground hover:bg-primary/80 px-6 py-2 rounded disabled:opacity-50"
                            disabled={loading}
                        >
                            {loading ? 'Saving...' : 'Save'}
                        </button>
                        <button
                            type="button"
                            onClick={() => router.push("/station/portals/carousels")}
                            className="bg-secondary text-secondary-foreground hover:bg-secondary/80 px-6 py-2 rounded"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default EditCarousel;