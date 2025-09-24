"use client"
import React, { useEffect, useState } from 'react';
import CallFor2 from '@/utilities/CallFor2';
import Select from 'react-select';
import makeAnimated from 'react-select/animated';
import { useRouter } from "next/navigation";
import { toast as reToast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload } from "lucide-react";
// Shared Tailwind CSS classes
const inputClasses = "mt-1 block w-full border border-border rounded-md p-2";
const labelClasses = "block text-sm font-medium text-muted-foreground mr-4 w-1/3";
const formGroupClasses = "flex items-center space-x-4";

const animatedComponents = makeAnimated();

const AddNewCarousel = () => {

    const logindata = sessionStorage.getItem('userData');
    const userData = JSON.parse(logindata);
    const router = useRouter();
    const [formData, setFormData] = useState({
        Name: "",
        VendorId:userData.nopVendorId,
        Title: "",
        DisplayTitle: false,
        Active: false,
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
    const [stores, setStores] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const response = await CallFor2(
                    `api/OCarouselVendorShopAdminAPI/List`,
                    "get",
                    null,
                    "Auth"
                );

                setWidgetZones(response.data.AvailableWidgetZones);
                setDataSources(response.data.AvailableDataSources);
                setStores(response.data.AvailableStores);
                setLoading(false);
            } catch (error) {
                setError(error);
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        
       
        setFormData(prevState => ({
            ...prevState,
            [name]: type === 'checkbox' ? checked : value
        }));

        <div className={formGroupClasses}>
                <label className={labelClasses}>Widget zone</label>
                <Select
                    name="WidgetZoneId"
                    value={widgetZones.find(zone => zone.Value === formData.WidgetZoneId)}
                    onChange={(selectedOption) => setFormData(prev => ({
                        ...prev,
                        WidgetZoneId: parseInt(selectedOption.Value, 10)
                    }))}
                    options={widgetZones}
                    getOptionLabel={(option) => option.Text}
                    getOptionValue={(option) => option.Value}
                    className="w-full text-black"
                />
            </div>

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
                // Handle error (e.g., show error message to user)
            }
        }
    };


    const removePicture = () => {
        setBackgroundPicture(null);
        setBackgroundPicturePreview(null);
        setFormData(prevState => ({ ...prevState, BackgroundPictureId: 0 }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const submissionData = {
                ...formData,
                AvailableWidgetZones: widgetZones.map(zone => ({
                    ...zone,
                    Selected: zone.Value === formData.WidgetZoneId
                })),
                AvailableDataSources: dataSources.map(source => ({
                    ...source,
                    Selected: source.Value === formData.DataSourceTypeId
                })),
                AvailableStores: stores.map(store => ({
                    ...store,
                    Selected: formData.SelectedStoreIds.includes(store.Value)
                })),
                Locales: [{ LanguageId: 1, Title: null }]
            };

            const response = await CallFor2(
                'api/OCarouselVendorShopAdminAPI/Create',
                'post',
                submissionData,
                'Auth'
            );
            if (response) {
                reToast.success("carousels saved successfully!");
                router.push("/station/portals/carousels");
              } else {
                reToast.error("Error saving user.");
              }

            setLoading(false);
            // Handle successful submission (e.g., show success message, redirect)
        } catch (error) {
            console.error('Error submitting form:', error);
            setError(error);
            setLoading(false);
        }
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error.message}</div>;

    return (
        <form onSubmit={handleSubmit}>
            <div>
                <h2 className="text-2xl font-semibold text-orange-400 mb-4">Add New Carousel</h2>
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
                                value={widgetZones.find(zone => zone.Value === formData.WidgetZoneId)}
                                onChange={(selectedOption) => setFormData(prev => ({
                                    ...prev,
                                    WidgetZoneId: parseInt(selectedOption.Value, 10)
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
                                value={dataSources.find(source => source.Value === formData.DataSourceTypeId)}
                                onChange={(selectedOption) => setFormData(prev => ({
                                    ...prev,
                                    DataSourceTypeId: parseInt(selectedOption.Value, 10)
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
                                </Label>}
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
                                value={formData.CustomCssClass}
                                onChange={handleInputChange}
                                className={inputClasses}
                            />
                        </div>
                    </div>
                </div>
               <div className="mt-6 flex justify-end space-x-4">
  {/* Save Button */}
  <button
    type="submit"
    className="bg-primary text-primary-foreground hover:bg-primary/80 px-4 py-2 rounded shadow-sm transition-colors"
    disabled={loading}
  >
    {loading ? "Saving..." : "Save"}
  </button>

  {/* Back Button */}
  <button
    type="button"
    className="border border-gray-300 text-gray-700 hover:bg-gray-100 px-4 py-2 rounded shadow-sm transition-colors"
    disabled={loading}
    onClick={() => window.history.back()} // Optional back functionality
  >
    Back
  </button>
</div>

            </div>
        </form>
    );
};

export default AddNewCarousel;
