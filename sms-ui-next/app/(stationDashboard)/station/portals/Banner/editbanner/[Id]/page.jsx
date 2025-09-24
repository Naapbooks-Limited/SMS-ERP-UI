"use client"
import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import makeAnimated from 'react-select/animated';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import CallFor2 from '@/utilities/CallFor2';
import ProductListModal from '../../additem/page';
import Edititemmodel from '../../edititem/page';
import { toast as reToast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload } from "lucide-react";
const animatedComponents = makeAnimated();
import DeleteDialog from "@/components/DeleteDialog";
import { useRouter } from "next/navigation";
import Pagination from '@/components/pagination/Pagination';

// Shared Tailwind CSS classes
const inputClasses = "mt-1 block w-full border border-border rounded-md p-2";
const labelClasses = "block text-sm font-bold text-muted-foreground mr-4 w-1/3";
const formGroupClasses = "flex items-center space-x-4";
const Editbanner = ({ params }) => {

    const logindata = sessionStorage.getItem('userData');
    const userData = JSON.parse(logindata);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [pageSize, setPageSize] = useState(5);


    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState(null);

    const [formData, setFormData] = useState({
        Name: '',
        VendorId: userData.nopVendorId,
        WidgetZoneStr: null,
        WidgetZoneId: '',
        ShowBackgroundPicture: false,
        BackgroundPictureId: 0,
        DisplayOrder: 0,
        Active: false,
        Nav: false,
        AutoPlay: false,
        AutoPlayTimeout: 0,
        AutoPlayHoverPause: false,
        LazyLoad: false,
        LazyLoadEager: 0,
        StartPosition: 0,
        Video: false,
        CreatedOn: "0001-01-01T00:00:00",
        UpdatedOn: "0001-01-01T00:00:00",
        Loop: false,
        Margin: 0,
        AnimateOut: '',
        AnimateIn: '',
        SelectedStoreIds: [],
    });
    const [OCarouselItemList, setOCarouselItemList] = useState([])
    const [widgetZones, setWidgetZones] = useState([]);
    const [stores, setStores] = useState([]);
    const [groupedAnimationTypes, setGroupedAnimationTypes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [backgroundPicture, setBackgroundPicture] = useState(null);
    const [backgroundPicturePreview, setBackgroundPicturePreview] = useState(null);
    const router = useRouter();

    const body = {
        SliderId: params.Id,
        Page: 1,
        PageSize: 10,
        AvailablePageSizes: null,
        Draw: null,
        Start: 0,
        Length: 10,
        CustomProperties: {}
    }
    const OCarouselItemLists = async (page = 1) => {
        setLoading(true);
        try {
            const body = {
                SliderId: params.Id,
                Page: page,
                PageSize: pageSize,
                AvailablePageSizes: null,
                Draw: null,
                Start: (page - 1) * pageSize,
                Length: pageSize,
                CustomProperties: {}
            };
            const response = await CallFor2(
                `api/AnywhereSliderVendorShopAdminAPI/SliderItemList`,
                "post",
                body,
                "Auth"
            );
            setOCarouselItemList(response.data.Data);
            setTotalPages(Math.ceil(response.data.recordsTotal / pageSize));
            setCurrentPage(page);
            setLoading(false);
        } catch (error) {
            setError(error);
            setLoading(false);
        }
    };
    const handlePageChange = (page) => {
        OCarouselItemLists(page);
    };

    useEffect(() => {
        OCarouselItemLists(1);
    }, [params.id]);

    const refreshCarouselItemList = () => {
        OCarouselItemLists(currentPage);
    };


    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await CallFor2(
                `api/AnywhereSliderVendorShopAdminAPI/create`,
                "get",
                null,
                "Auth"
            );
            setWidgetZones(response.data.AvailableWidgetZones);
            // setWidgetZones(response.data.AvailableWidgetZones);
            setStores(response.data.AvailableStores);

            // Group animation types
            const groupedOptions = response.data.AvailableAnimationTypes.reduce((acc, option) => {
                const group = option.Group ? option.Group.Name : 'Other';
                if (!acc[group]) {
                    acc[group] = [];
                }
                acc[group].push(option);
                return acc;
            }, {});

            setGroupedAnimationTypes(
                Object.entries(groupedOptions).map(([label, options]) => ({
                    label,
                    options
                }))
            );

            setLoading(false);
        } catch (error) {
            setError(error);
            setLoading(false);
        }
    };


    useEffect(() => {



        const fetchBannerData = async () => {
            setLoading(true);
            try {
                const response = await CallFor2(
                    `api/AnywhereSliderVendorShopAdminAPI/Edit/${params.Id}`,
                    "get",
                    null,
                    "Auth"
                );
                setBackgroundPicturePreview(response.data.BackgroundPictureUrl)
                setFormData(response.data);
                setLoading(false);
            } catch (error) {
                setError(error);
                setLoading(false);
            }
        };
        fetchData()
        fetchBannerData();
    }, []);

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
                // Handle error (e.g., show error message to user)
            }
        }
    };

    const removePicture = () => {
        setBackgroundPicture(null);
        setBackgroundPicturePreview(null);
        setFormData(prevState => ({ ...prevState, BackgroundPictureId: 0 }));
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSelectChange = (name, selectedOption) => {
        setFormData(prevState => ({
            ...prevState,
            [name]: Array.isArray(selectedOption)
                ? selectedOption.map(option => option.Value)
                : selectedOption.Value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const body = {
                ...formData,
                AvailableStores: stores.map(store => ({
                    ...store,
                    Selected: formData.SelectedStoreIds.includes(store.Value)
                })),
                AvailableWidgetZones: widgetZones.map(zone => ({
                    ...zone,
                    Selected: zone.Value === formData.WidgetZoneId
                })),
                AvailableAnimationTypes: groupedAnimationTypes.flatMap(group =>
                    group.options.map(option => ({
                        ...option,
                        Selected: option.Value === formData.AnimateIn || option.Value === formData.AnimateOut
                    }))
                )
            };

            const response = await CallFor2(
                'api/AnywhereSliderVendorShopAdminAPI/UpdateSlider',
                'post',
                body,
                'Auth'
            );

            
            if (response) {
                reToast.success("update banner successfully!");
                router.push('/station/portals/Banner')
            } else {
                reToast.error("Error");
            }
        } catch (error) {
            setError(error);
            setLoading(false);
        }
    };



    const handleDeleteUser = (userId) => {
        setSelectedUserId(userId);
        setIsDeleteDialogOpen(true);
    };

    const handleCloseDeleteDialog = () => {
        setIsDeleteDialogOpen(false);
    };



    return (
        <form onSubmit={handleSubmit}>
            <div>
                <h2 className="text-2xl font-semibold text-orange-400 mb-4">Edit Banner</h2>
                <Card>
                    <CardHeader>
                        <h3 className="text-lg font-bold">Info</h3>
                    </CardHeader>
                    <CardContent>
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
                                <label className={labelClasses}>Widget zone</label>
                                <Select
                                    name="WidgetZoneId"
                                    value={widgetZones.find(zone => zone.Value === formData.WidgetZoneId.toString())}
                                    onChange={(selectedOption) => handleSelectChange('WidgetZoneId', selectedOption)}
                                    options={widgetZones}
                                    getOptionLabel={(option) => option.Text}
                                    getOptionValue={(option) => option.Value}
                                    className="w-full text-black"
                                />
                            </div>
                            <div className={formGroupClasses}>
                                <label className={labelClasses}>Background Picture</label>
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
                                       ( <Label>
                  <Button asChild>
                    <div>
                      <Upload className="mr-2 h-4 w-4" /> Choose File
                    </div>
                  </Button>
                  <Input
                    type="file"
                    className="hidden"
                    onChange={handlePictureUpload}
                  />
                </Label> )}
                                        {backgroundPicturePreview &&  
                                        
                                        (
                                            <div className="relative h-36 rounded-xl">
                                              <img
                                                src={backgroundPicturePreview}
                                                alt="Image Preview"
                                                className="w-full h-full border border-gray-300 rounded-md shadow-sm"
                                              />
                                              <button
                                                type="button"
                                                onClick={removePicture}
                                                className="absolute top-[-10px] right-[-10px] w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-sm border border-white focus:outline-none"
                                              >
                                                &times;
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
                                    value={stores.filter(store => formData.SelectedStoreIds.some(id => id == store.Value))}
                                    onChange={(selectedOptions) => handleSelectChange('SelectedStoreIds', selectedOptions)}
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
                    </CardContent>
                </Card>
                <Card className="mt-6">
                    <CardHeader>
                        <h3 className="text-lg font-bold">Properties</h3>
                    </CardHeader>
                    <CardContent>
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
                                <label className={labelClasses}>Margin</label>
                                <input
                                    type="number"
                                    name="Margin"
                                    value={formData.Margin}
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
                                <label className={labelClasses}>Animate out</label>
                                <Select
                                    name="AnimateOut"
                                    value={groupedAnimationTypes.flatMap(group => group.options).find(type => type.Value === formData.AnimateOut)}
                                    onChange={(selectedOption) => handleSelectChange('AnimateOut', selectedOption)}
                                    options={groupedAnimationTypes}
                                    getOptionLabel={(option) => option.Text}
                                    getOptionValue={(option) => option.Value}
                                    className="w-full text-black"
                                />
                            </div>
                            <div className={formGroupClasses}>
                                <label className={labelClasses}>Animate in</label>
                                <Select
                                    name="AnimateIn"
                                    value={groupedAnimationTypes.flatMap(group => group.options).find(type => type.Value === formData.AnimateIn)}
                                    onChange={(selectedOption) => handleSelectChange('AnimateIn', selectedOption)}
                                    options={groupedAnimationTypes}
                                    getOptionLabel={(option) => option.Text}
                                    getOptionValue={(option) => option.Value}
                                    className="w-full text-black"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="p-6 mt-6 bg-card rounded-lg shadow-md">
                    <h3 className="text-lg font-bold mb-3">Banner</h3>
                    <div className="space-y-4">
                        <div className="space-y-4">

                            <section className="mx-auto w-full max-w-7xl px-4 py-4">
                                <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">


                                </div>
                                <div className="mt-6 flex flex-col">
                                    <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                                        <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                                            <div className="overflow-hidden border border-gray-200 md:rounded-lg">
                                                <table className="min-w-full divide-y divide-gray-200">
                                                    <thead className="bg-gray-50">
                                                        <tr className="divide-x divide-gray-200">
                                                            <th
                                                                scope="col"
                                                                className="px-4 py-3.5 text-left text-sm font-normal text-gray-500"
                                                            >
                                                                <span>Picture</span>
                                                            </th>
                                                            <th
                                                                scope="col"
                                                                className="px-12 py-3.5 text-left text-sm font-normal text-gray-500"
                                                            >
                                                                Mobile Picture
                                                            </th>

                                                            <th
                                                                scope="col"
                                                                className="px-4 py-3.5 text-left text-sm font-normal text-gray-500"
                                                            >
                                                                Title
                                                            </th>

                                                            <th
                                                                scope="col"
                                                                className="px-4 py-3.5 text-left text-sm font-normal text-gray-500"
                                                            >
                                                                Display order
                                                            </th>
                                                            <th
                                                                scope="col"
                                                                className="px-4 py-3.5 text-left text-sm font-normal text-gray-500"
                                                            >
                                                                Action
                                                            </th>
                                                            {/* <th scope="col" className="relative px-4 py-3.5">
                                                               <span className="sr-only">Edit</span>
                                                            </th> */}
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-gray-200 ">
                                                        {OCarouselItemList && OCarouselItemList.map((item) => (
                                                            <tr key={item.Id} className="divide-x divide-gray-200">
                                                                <td className="whitespace-nowrap px-4 py-4">
                                                                    <div className="flex items-center">
                                                                        <div className="flex-shrink-0">
                                                                            <img
                                                                                className="h-20 object-cover"
                                                                                src={item.PictureUrl}
                                                                                alt=""
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                                <td className="whitespace px-5 w-1/4 py-4">
                                                                    <div className="flex items-center">
                                                                        <div className="flex-shrink-0">
                                                                            <img
                                                                                className="h-20 object-cover"
                                                                                src={item.MobilePictureUrl}
                                                                                alt=""
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                                <td className="whitespace-nowrap px-4 py-4">
                                                                    <span className="inline-flex px-2 text-xs font-semibold leading-5 ">
                                                                        {item.SliderItemTitle}
                                                                    </span>
                                                                </td>
                                                                <td className="whitespace-nowrap px-4 py-4 text-sm dark:text-white text-gray-500">



                                                                    <span className="inline-flex px-2 text-xs font-semibold leading-5 ">
                                                                        {item.DisplayOrder}
                                                                    </span>

                                                                </td>
                                                                <td className="whitespace-nowrap  py-4 dark:text-white text-sm font-medium  ">

                                                                    <button
                                                                        className="text-white-500 hover:text-white-600 ms-2"
                                                                    >
                                                                        <Edititemmodel Id={item.Id} onRefresh={refreshCarouselItemList} />
                                                                    </button>
                                                                    <Button
                                                                        onClick={(e) => {handleDeleteUser(item.Id),e.preventDefault()}}
                                                                        className="text-white-500 hover:text-white-600 ms-2"
                                                                    >
                                                                        Delete
                                                                    </Button>

                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                            <div className="mt-4">
                                               
                                            </div>
                                        </div>
                                    </div>
                                </div>
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


                            <ProductListModal Id={params.Id} onRefresh={refreshCarouselItemList} />






                        </div>

                    </div>
                </div>



                <div className="mt-6 flex space-x-4">
                    <button
                        type="submit"
                        className="bg-primary text-primary-foreground hover:bg-primary/80 px-4 py-2 rounded"
                        // disabled={loading}
                    >
                         Save
                    </button>
                    <button
                        type="button"
                        className="bg-secondary text-secondary-foreground hover:bg-secondary/80 px-4 py-2 rounded"
                        onClick={() => {/* Handle save and continue edit */ }}
                    >
                        Save and Continue Edit
                    </button>
                </div>
            </div>

            <DeleteDialog
                isOpen={isDeleteDialogOpen}
                onClose={handleCloseDeleteDialog}
                callfor={CallFor2}
                onDelete={() => {
                    OCarouselItemLists()
                    setIsDeleteDialogOpen(false);
                }}
                delUrl={`api/AnywhereSliderVendorShopAdminAPI/SliderItemDelete/${selectedUserId}`}
            />
        </form>
    );
};

export default Editbanner;