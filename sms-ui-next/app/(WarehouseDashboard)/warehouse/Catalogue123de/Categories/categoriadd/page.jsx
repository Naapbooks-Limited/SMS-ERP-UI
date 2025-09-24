"use client"
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import React, { useState, useEffect } from 'react'
import { Switch } from "@/components/ui/switch";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import CallFor from '@/utilities/CallFor';
import { toast as reToast } from "react-hot-toast";
import Select from 'react-select';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';

function CategoriAdd() {
    const router = useRouter();

    const validationSchema = Yup.object({
        name: Yup.string().required('Name is required'),
        description: Yup.string().required('Description is required'),
        displayorder: Yup.number()
            .typeError('Display order must be a number')
            .positive('Display order must be a positive number')
            .integer('Display order must be an integer'),
        parentCategory: Yup.object().required('Please select category'),
        categories: Yup.boolean().required('Please select'),
    });

    const { control, handleSubmit, setValue, formState: { errors }, clearErrors } = useForm({
        resolver: yupResolver(validationSchema),
        defaultValues: {
            name: '',
            description: '',
            displayorder: '',
            parentCategory: null,
            categories: false,
        },
    });

    const [options, setOptions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Fetch categories for the dropdown
        const fetchCategories = async () => {
            try {
                const response = await CallFor(
                    `v2/Common/GetCategoryDropDown`,
                    "post",
                    null,
                    "Auth"
                );
                console.log("Fetched categories response:", response.data);

                if (response) {
                    const options = response?.data?.map(category => ({
                        value: category.id,
                        label: category.name
                    }));
                    console.log("Formatted options:", options);
                    setOptions(options);
                } else {
                    throw new Error("Unexpected response format");
                }
            } catch (error) {
                console.error("Error fetching categories:", error);
                setError(error.message);
            }
        };
        fetchCategories();
    }, []);

    const onSubmit = async (data) => {
        const formData = {
            catid: 0,
            catname: data.name,
            catdesc: data.description,
            catfullpath: null,
            ispublished: data.categories,
            parentcatid: data.parentCategory ? data.parentCategory.value : 0,
            displayorder: data.displayorder
        };

        try {
            setLoading(true);
            const response = await CallFor(
                `v2/Common/SaveCategory`,
                "post",
                formData,
                "Auth"
            );
            setLoading(false);

            if (response) {
                reToast.success("Categories saved successfully!");
                router.push("/warehouse/Catalogue/Categories");
            } else {
                reToast.error("Error saving Categories.");
            }
        } catch (error) {
            setError(error);
            setLoading(false);
        }

        console.log('formData', JSON.stringify(formData));
    };

    return (
        <div>
            <form className="max-w-7xl mx-auto p-6 rounded-md shadow-md" onSubmit={handleSubmit(onSubmit)}>
                <div className='flex justify-between items-center mb-6'>
                    <div className='text-orange-500 text-2xl bold'>Categories</div>
                </div>
                <div className="grid grid-cols-1 gap-4">
                    <div>
                        <div className="flex items-center space-x-4">
                            <label htmlFor="productName" className="w-1/4 font-medium dark:text-white text-gray-700">Name*</label>
                            <Controller
                                name="name"
                                control={control}
                                render={({ field }) => (
                                    <input
                                        type="text"
                                        id="productName"
                                        {...field}
                                        className={`flex-grow p-3 border ${errors.name ? "border-red-500" : "border-gray-300"} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                    />
                                )}
                            />
                        </div>
                        {errors.name &&
                            <div className="flex items-center space-x-4">
                                <label className="w-1/4 text-sm font-medium"></label>
                                <div className="text-red-500 text-sm">
                                    {errors.name.message}
                                </div>
                            </div>
                        }
                    </div>
                    <div>

                        <div className="flex items-center space-x-4">
                            <label htmlFor="fullDescription" className="w-1/4 font-medium dark:text-white text-gray-700">Description</label>
                            <Controller
                                name="description"
                                control={control}
                                render={({ field }) => (
                                    <textarea
                                        id="fullDescription"
                                        {...field}
                                        rows="4"
                                        className={`flex-grow p-3 border ${errors.description ? "border-red-500" : "border-gray-300"} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                    ></textarea>
                                )}
                            />
                        </div>
                        {errors.description &&
                            <div className="flex items-center space-x-4">
                                <label className="w-1/4 text-sm font-medium"></label>
                                <div className="text-red-500 text-sm">
                                    {errors.description.message}
                                </div>
                            </div>
                        }
                    </div>
                    <div>
                        <div className="flex items-center space-x-4">
                            <label htmlFor="Displayorder" className="w-1/4 font-medium dark:text-white text-gray-700">Display order</label>
                            <Controller
                                name="displayorder"
                                control={control}
                                render={({ field }) => (
                                    <input
                                        type='number'
                                        id="Displayorder"
                                        {...field}
                                        className={`flex-grow p-3 border ${errors.displayorder ? "border-red-500" : "border-gray-300"} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                    ></input>
                                )}
                            />
                        </div>
                        {errors.displayorder &&
                            <div className="flex items-center space-x-4">
                                <label className="w-1/4 text-sm font-medium"></label>
                                <div className="text-red-500 text-sm">
                                    {errors.displayorder.message}
                                </div>
                            </div>
                        }
                    </div>
                    <div><div className="flex items-center space-x-4">
                        <label htmlFor="parentCategory" className="w-1/4 font-medium dark:text-white text-gray-700">Parent Category</label>
                        <Controller
                            name="parentCategory"
                            control={control}
                            render={({ field }) => (
                                <Select
                                    id="parentCategory"
                                    {...field}
                                    onChange={(value) => { setValue("parentCategory", value); clearErrors('parentCategory') }}
                                    options={options}
                                    className={`flex-grow z-20 text-black ${errors.parentCategory ? " border border-red-500" : ""}`}
                                />
                            )}
                        />
                    </div>
                        {errors.parentCategory &&
                            <div className="flex items-center space-x-4">
                                <label className="w-1/4 text-sm font-medium"></label>
                                <div className="text-red-500 text-sm">
                                    {errors.parentCategory.message}
                                </div>
                            </div>
                        }
                    </div>
                    <div>
                        <div className="flex items-center space-x-4">
                            <label htmlFor="categories" className="w-1/4 font-medium dark:text-white text-gray-700">Is Enabled</label>
                            <Controller
                                name="categories"
                                control={control}
                                render={({ field }) => (
                                    <Switch
                                        checked={field.value}
                                        onCheckedChange={(checked) => setValue("categories", checked)}
                                    />
                                )}
                            />
                        </div>
                        {errors.categories &&
                            <div className="flex items-center space-x-4">
                                <label className="w-1/4 text-sm font-medium"></label>
                                <div className="text-red-500 text-sm">
                                    {errors.categories.message}
                                </div>
                            </div>
                        }
                    </div>
                </div>
                <div className='flex justify-center'>
                    <Link href={"/warehouse/Catalogue/Categories"}>
                        <button type="button" className="mt-6 me-3 px-3 py-2 bg-[#11357C] text-white rounded-md focus:outline-none">Cancel</button>
                    </Link>
                    <button type="submit" className="mt-6 px-3 py-2 bg-orange-500 text-white rounded-md focus:outline-none">Save</button>
                </div>
            </form>
        </div>
    )
}

export default CategoriAdd;
