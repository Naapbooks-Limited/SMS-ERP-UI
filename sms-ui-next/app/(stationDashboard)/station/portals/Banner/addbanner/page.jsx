"use client"
import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import makeAnimated from 'react-select/animated';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import CallFor2 from '@/utilities/CallFor2';
import { toast as reToast } from "react-hot-toast";
import { useRouter } from "next/navigation";
const animatedComponents = makeAnimated();
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload } from "lucide-react";
import * as Yup from 'yup';
import { useFormik } from 'formik';

// Shared Tailwind CSS classes
const inputClasses = "mt-1 block w-full border border-border rounded-md p-2";
const labelClasses = "block text-sm font-bold text-muted-foreground mr-4 w-1/3";
const formGroupClasses = "flex items-center space-x-4";

const SliderCreationForm = () => {
    const logindata = sessionStorage.getItem('userData');
    const userData = JSON.parse(logindata);
    const initialFormData = {
        Name: '',
        VendorId: userData.nopVendorId,
        WidgetZoneStr: null,
        WidgetZoneId: "",
        ShowBackgroundPicture: false,
        BackgroundPictureId: 0,
        DisplayOrder: null,
        Active: false,
        Nav: false,
        AutoPlay: false,
        AutoPlayTimeout: null,
        AutoPlayHoverPause: false,
        LazyLoad: false,
        LazyLoadEager: null,
        StartPosition: null,
        Video: false,
        CreatedOn: "0001-01-01T00:00:00",
        UpdatedOn: "0001-01-01T00:00:00",
        Loop: false,
        Margin: null,
        AnimateOut: null,
        AnimateIn: null,
        SelectedStoreIds: [],
    };

    const [infoOpen, setInfoOpen] = useState(true);
    const [propertiesOpen, setPropertiesOpen] = useState(true);
    const [widgetZones, setWidgetZones] = useState([]);
    const [stores, setStores] = useState([]);
    const [groupedAnimationTypes, setGroupedAnimationTypes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [backgroundPicture, setBackgroundPicture] = useState(null);
    const [backgroundPicturePreview, setBackgroundPicturePreview] = useState(null);
    const router = useRouter();

    const validationSchema = Yup.object().shape({
        Name: Yup.string().required('Name is required'),
        WidgetZoneId: Yup.string().nullable().required('Widget zone is required'),
        DisplayOrder: Yup.number().nullable().required('Display order is required').min(0, 'Display order must be non-negative'),
        AutoPlay: Yup.boolean(),
        AutoPlayTimeout: Yup.number().nullable().when('AutoPlay', {
            is: true,
            then: () => Yup.number().required('Auto Play Timeout is required when Auto Play is enabled').min(0, 'Auto Play Timeout must be non-negative'),
            otherwise: () => Yup.number().nullable()
        }),
        LazyLoad: Yup.boolean(),
        LazyLoadEager: Yup.number().nullable().when('LazyLoad', {
            is: true,
            then: () => Yup.number().required('Lazy Load Eager is required when Lazy Load is enabled').min(0, 'Lazy Load Eager must be non-negative'),
            otherwise: () => Yup.number().nullable()
        }),
        StartPosition: Yup.number().nullable().required('Start position is required').min(0, 'Start position must be non-negative'),
        Margin: Yup.number().nullable().required('Margin is required').min(0, 'Margin must be non-negative'),
        AnimateOut: Yup.string().nullable().required('Animate out is required'),
        AnimateIn: Yup.string().nullable().required('Animate in is required'),
    });

    const formik = useFormik({
        initialValues: initialFormData,
        validationSchema: validationSchema,
        onSubmit: handleSubmit,
    });

    const toggleInfo = () => setInfoOpen(!infoOpen);
    const toggleProperties = () => setPropertiesOpen(!propertiesOpen);

    useEffect(() => {
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
                setStores(response.data.AvailableStores);

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
        fetchData();
    }, []);

    const handlePictureUpload = async (e) => {
        const file = e.target.files[0];
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
                formik.setFieldValue('BackgroundPictureId', response.data.Data.PictureId);
                formik.setFieldValue('CustomUrl', response.data.Data.PictureUrl);
            }
        } catch (error) {
            console.error('Error uploading picture:', error);
            reToast.error('Error uploading picture: ' + error.message);
        }
    };

    const removePicture = () => {
        setBackgroundPicture(null);
        setBackgroundPicturePreview(null);
        formik.setFieldValue('BackgroundPictureId', 0);
    };

    const handleSelectChange = (name, selectedOption) => {
        formik.setFieldValue(name, Array.isArray(selectedOption)
            ? selectedOption.map(option => option.Value)
            : selectedOption.Value
        );
    };

    async function handleSubmit(values, { setSubmitting }) {
        setLoading(true);
        try {
            const body = {
                ...values,
                AvailableStores: stores.map(store => ({
                    ...store,
                    Selected: values.SelectedStoreIds.includes(store.Value)
                })),
                AvailableWidgetZones: widgetZones.map(zone => ({
                    ...zone,
                    Selected: zone.Value === values.WidgetZoneId
                })),
                AvailableAnimationTypes: groupedAnimationTypes.flatMap(group =>
                    group.options.map(option => ({
                        ...option,
                        Selected: option.Value === values.AnimateIn || option.Value === values.AnimateOut
                    }))
                )
            };

            const response = await CallFor2(
                'api/AnywhereSliderVendorShopAdminAPI/CreateSlider',
                'post',
                body,
                'Auth'
            );

            if(response) {
                reToast.success("Add banner successfully!");
                router.push('/station/portals/Banner')
            } else {
                reToast.error("Error");
            }
        } catch (error) {
            setError(error);
            reToast.error("Error: " + error.message);
        } finally {
            setLoading(false);
            setSubmitting(false);
        }
    }

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error.message}</div>;

    return (
        <form onSubmit={formik.handleSubmit}>
        <div>
            <h2 className="text-2xl font-semibold text-orange-400 mb-4">Add Banner</h2>
            <Card>
                <CardHeader onClick={toggleInfo} className="cursor-pointer">
                    <h3 className="text-lg font-bold">Info</h3>
                </CardHeader>
                {infoOpen && (
                    <CardContent>
                        <div className="space-y-4">
                            <div className={formGroupClasses}>
                                <label className={labelClasses}>Name</label>
                                <input
                                    type="text"
                                    name="Name"
                                    value={formik.values.Name}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    className={`${inputClasses} ${formik.touched.Name && formik.errors.Name ? 'border-red-500' : ''}`}
                                />
                                {formik.touched.Name && formik.errors.Name && (
                                    <div className="text-red-500 text-sm mt-1">{formik.errors.Name}</div>
                                )}
                            </div>
                            <div className={formGroupClasses}>
                                <label className={labelClasses}>Widget zone</label>
                                <Select
                                    name="WidgetZoneId"
                                    value={widgetZones.find(zone => zone.Value === formik.values.WidgetZoneId)}
                                    onChange={(selectedOption) => handleSelectChange('WidgetZoneId', selectedOption)}
                                    options={widgetZones}
                                    getOptionLabel={(option) => option.Text}
                                    getOptionValue={(option) => option.Value}
                                    className={`w-full text-black ${formik.touched.WidgetZoneId && formik.errors.WidgetZoneId ? 'border-red-500' : ''}`}
                                />
                                {formik.touched.WidgetZoneId && formik.errors.WidgetZoneId && (
                                    <div className="text-red-500 text-sm mt-1">{formik.errors.WidgetZoneId}</div>
                                )}
                            </div>
                            <div className={formGroupClasses}>
                                <label className={labelClasses}>Background Picture</label>
                                <input
                                    type="checkbox"
                                    name="ShowBackgroundPicture"
                                    checked={formik.values.ShowBackgroundPicture}
                                    onChange={formik.handleChange}
                                    className="mt-1"
                                />
                            </div>
                            {formik.values.ShowBackgroundPicture && (
                                <div className={formGroupClasses}>
                                    <label className={labelClasses}>Background Picture</label>
                                    <div className="flex flex-col items-start">
                                        {!backgroundPicturePreview && (
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
                                            </Label>
                                        )}
                                        {backgroundPicturePreview && (
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
                                    value={formik.values.DisplayOrder}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    className={`${inputClasses} ${formik.touched.DisplayOrder && formik.errors.DisplayOrder ? 'border-red-500' : ''}`}
                                />
                                {formik.touched.DisplayOrder && formik.errors.DisplayOrder && (
                                    <div className="text-red-500 text-sm mt-1">{formik.errors.DisplayOrder}</div>
                                )}
                            </div>
                            <div className={formGroupClasses}>
                                <label className={labelClasses}>Limited to stores</label>
                                <Select
                                    isMulti
                                    components={animatedComponents}
                                    name="SelectedStoreIds"
                                    value={stores.filter(store => formik.values.SelectedStoreIds.includes(store.Value))}
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
                                    checked={formik.values.Active}
                                    onChange={formik.handleChange}
                                    className="mt-1"
                                />
                            </div>
                        </div>
                    </CardContent>
                )}
            </Card>
            <Card className="mt-6">
                <CardHeader onClick={toggleProperties} className="cursor-pointer">
                    <h3 className="text-lg font-bold">Properties</h3>
                </CardHeader>
                {propertiesOpen && (
                    <CardContent>
                        <div className="space-y-4">
                            <div className={formGroupClasses}>
                                <label className={labelClasses}>NAV</label>
                                <input
                                    type="checkbox"
                                    name="Nav"
                                    checked={formik.values.Nav}
                                    onChange={formik.handleChange}
                                    className="mt-1"
                                />
                            </div>
                            <div className={formGroupClasses}>
                                <label className={labelClasses}>Auto play</label>
                                <input
                                    type="checkbox"
                                    name="AutoPlay"
                                    checked={formik.values.AutoPlay}
                                    onChange={formik.handleChange}
                                    className="mt-1"
                                />
                            </div>
                            {formik.values.AutoPlay && (
                                <>
                                    <div className={formGroupClasses}>
                                        <label className={labelClasses}>Auto Play Timeout</label>
                                        <input
                                            type="number"
                                            name="AutoPlayTimeout"
                                            value={formik.values.AutoPlayTimeout}
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            className={`${inputClasses} ${formik.touched.AutoPlayTimeout && formik.errors.AutoPlayTimeout ? 'border-red-500' : ''}`}
                                        />
                                        {formik.touched.AutoPlayTimeout && formik.errors.AutoPlayTimeout && (
                                            <div className="text-red-500 text-sm mt-1">{formik.errors.AutoPlayTimeout}</div>
                                        )}
                                    </div>
                                    <div className={formGroupClasses}>
                                        <label className={labelClasses}>Auto play hover pause</label>
                                        <input
                                            type="checkbox"
                                            name="AutoPlayHoverPause"
                                            checked={formik.values.AutoPlayHoverPause}
                                            onChange={formik.handleChange}
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
                                    checked={formik.values.LazyLoad}
                                    onChange={formik.handleChange}
                                    className="mt-1"
                                />
                            </div>
                            {formik.values.LazyLoad && (
                                <div className={formGroupClasses}>
                                    <label className={labelClasses}>Lazy load Eager</label>
                                    <input
                                        type="number"
                                        name="LazyLoadEager"
                                        value={formik.values.LazyLoadEager}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        className={`${inputClasses} ${formik.touched.LazyLoadEager && formik.errors.LazyLoadEager ? 'border-red-500' : ''}`}
                                    />
                                    {formik.touched.LazyLoadEager && formik.errors.LazyLoadEager && (
                                        <div className="text-red-500 text-sm mt-1">{formik.errors.LazyLoadEager}</div>
                                    )}
                                </div>
                            )}
                            <div className={formGroupClasses}>
                                <label className={labelClasses}>Start position</label>
                                <input
                                    type="number"
                                    name="StartPosition"
                                    value={formik.values.StartPosition}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    className={`${inputClasses} ${formik.touched.StartPosition && formik.errors.StartPosition ? 'border-red-500' : ''}`}
                                />
                                {formik.touched.StartPosition && formik.errors.StartPosition && (
                                    <div className="text-red-500 text-sm mt-1">{formik.errors.StartPosition}</div>
                                )}
                            </div>
                            <div className={formGroupClasses}>
                                <label className={labelClasses}>Margin</label>
                                <input
                                    type="number"
                                    name="Margin"
                                    value={formik.values.Margin}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    className={`${inputClasses} ${formik.touched.Margin && formik.errors.Margin ? 'border-red-500' : ''}`}
                                />
                                {formik.touched.Margin && formik.errors.Margin && (
                                    <div className="text-red-500 text-sm mt-1">{formik.errors.Margin}</div>
                                )}
                            </div>
                            <div className={formGroupClasses}>
                                <label className={labelClasses}>Loop</label>
                                <input
                                    type="checkbox"
                                    name="Loop"
                                    checked={formik.values.Loop}
                                    onChange={formik.handleChange}
                                    className="mt-1"
                                />
                            </div>
                            <div className={formGroupClasses}>
                                <label className={labelClasses}>Animate out</label>
                                <Select
                                    name="AnimateOut"
                                    value={groupedAnimationTypes.flatMap(group => group.options).find(type => type.Value === formik.values.AnimateOut)}
                                    onChange={(selectedOption) => handleSelectChange('AnimateOut', selectedOption)}
                                    options={groupedAnimationTypes}
                                    getOptionLabel={(option) => option.Text}
                                    getOptionValue={(option) => option.Value}
                                    className={`w-full text-black ${formik.touched.AnimateOut && formik.errors.AnimateOut ? 'border-red-500' : ''}`}
                                />
                                {formik.touched.AnimateOut && formik.errors.AnimateOut && (
                                    <div className="text-red-500 text-sm mt-1">{formik.errors.AnimateOut}</div>
                                )}
                            </div>
                            <div className={formGroupClasses}>
                                <label className={labelClasses}>Animate in</label>
                                <Select
                                    name="AnimateIn"
                                    value={groupedAnimationTypes.flatMap(group => group.options).find(type => type.Value === formik.values.AnimateIn)}
                                    onChange={(selectedOption) => handleSelectChange('AnimateIn', selectedOption)}
                                    options={groupedAnimationTypes}
                                    getOptionLabel={(option) => option.Text}
                                    getOptionValue={(option) => option.Value}
                                    className={`w-full text-black ${formik.touched.AnimateIn && formik.errors.AnimateIn ? 'border-red-500' : ''}`}
                                />
                                {formik.touched.AnimateIn && formik.errors.AnimateIn && (
                                    <div className="text-red-500 text-sm mt-1">{formik.errors.AnimateIn}</div>
                                )}
                            </div>
                        </div>
                    </CardContent>
                )}
            </Card>
            <div className="mt-6 flex space-x-4">
                <button
                    type="submit"
                    className="bg-primary text-primary-foreground hover:bg-primary/80 px-4 py-2 rounded"
                    disabled={formik.isSubmitting || loading}
                >
                    {formik.isSubmitting || loading ? 'Saving...' : 'Save'}
                </button>
            </div>
        </div>
    </form>
    );
};

export default SliderCreationForm;