"use client"
import React, { useState, useEffect } from 'react'
import { Switch } from "@/components/ui/switch";
import { useRouter, useParams } from 'next/navigation';
import CallFor from '@/utilities/CallFor';
import Select from 'react-select';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';

function editwarehouse({params}) {
    const router = useRouter();
    const [countries, setCountries] = useState([]);
    const [allStates, setAllStates] = useState([]);
    const [filteredStates, setFilteredStates] = useState([]);
    const [userRoleTypeId, setUserRoleTypeId] = useState();
    const [isLoading, setIsLoading] = useState(true);
    const [stationData, setStationData] = useState(null);
    const [warehouses, setWarehouses] = useState([]);
    const [userorgaddressmappingss, setuserorgaddressmappingss] = useState([]);

     const userData = JSON.parse(sessionStorage.getItem("userData") || "{}");
  const Uid = userData.uid;
  const orgid = userData.orgid


    const validationSchema = Yup.object().shape({
        stationName: Yup.string().required("Station Name is required"),
        managerName: Yup.string().required("Manager Name is required"),
        password: Yup.string()
            .min(6, "Password must be at least 6 characters"),
        isActive: Yup.boolean(),
        country: Yup.object()
            .shape({
                value: Yup.number().required("Country is required"),
                label: Yup.string().required(),
            })
            .nullable()
            .required("Country is required"),
        state: Yup.object()
            .shape({
                value: Yup.number().required("State is required"),
                label: Yup.string().required(),
            })
            .nullable()
            .required("State is required"),
        adress1: Yup.string().required("Address 1 is required"),
        adress2: Yup.string(),
        city: Yup.string().required("City is required"),
        Pincode: Yup.string()
            .matches(/^[0-9]{6}$/, "Pincode must be exactly 6 digits")
            .required("Pincode is required"),
        email: Yup.string()
            .email("Invalid email format")
            .required("Email is required"),
        mobileno: Yup.string()
            .matches(/^[0-9]{10}$/, "Mobile number must be exactly 10 digits")
            .required("Mobile number is required"),
        latitude: Yup.string(),
        longitude: Yup.string(),
    });

    const { control, handleSubmit, setValue, watch, formState: { errors }, clearErrors } = useForm({
        resolver: yupResolver(validationSchema),
        defaultValues: {
            isActive: false,
            latitude: "",
            longitude: ""
        }
    });

    const selectedCountry = watch("country");

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            await getCountryState();
            if (params.uid) {
                await getStationById();
            }
            setIsLoading(false);
        };
        fetchData();
    }, [params.uid]);

    useEffect(() => {
        if (!isLoading && stationData && countries.length > 0 && allStates.length > 0) {
            populateForm();
        }
    }, [isLoading, stationData, countries, allStates]);

    // Filter states when country changes
    useEffect(() => {
        if (selectedCountry) {
            const filtered = allStates.filter(state => state.countryId === selectedCountry.value);
            const transformedStates = filtered.map(state => ({
                value: state.id,
                label: state.name
            }));
            setFilteredStates(transformedStates);
        } else {
            setFilteredStates([]);
        }
    }, [selectedCountry, allStates]);

    const getCountryState = async () => {
        const response = await CallFor(`v2/Organization/SaveOrganizationWithUser`, 'GET', null, 'Auth');
        if (response.status === 200) {
            const transformedCountry = response?.data?.dropdowns?.countries?.map(country => ({
                value: country.id,
                label: country.name
            }));
            setCountries(transformedCountry);
            
            // Store all states for filtering
            setAllStates(response?.data?.dropdowns?.states || []);

            const roleId = response?.data?.dropdowns?.roles.find((item) => item?.name === 'Station Manager');
            setUserRoleTypeId(roleId?.id);
        }
    };

    const getStationById = async () => {
        const response = await CallFor(`v2/Organization/GetOrganisationById?id=${params.uid}`, 'GET', null, 'Auth');
        if (response.status === 200) {
            setStationData(response.data.data);
        }
    };

    const populateForm = () => {
        if (!stationData) return;

        setValue("stationName", stationData.orgName || "");
        setValue("email", stationData.orgEmail || "");
        setValue("mobileno", stationData.orgMobile || "");
        setValue("adress1", stationData.orgAddress?.address1 || "");
        setValue("adress2", stationData.orgAddress?.address2 || "");
        setValue("city", stationData.orgAddress?.city || "");

        setuserorgaddressmappingss(stationData.orgAddress?.userorgaddressmappings || []);

        // Set latitude and longitude from existing data
        setValue("latitude", stationData.orgAddress?.latitude || "");
        setValue("longitude", stationData.orgAddress?.longitude || "");

        const matchedCountry = countries.find(c => c.value === stationData.orgAddress?.country);
        
        if (matchedCountry) {
            setValue("country", matchedCountry);
            
            // Filter states for the matched country and then find the matching state
            const countryStates = allStates.filter(state => state.countryId === matchedCountry.value);
            const transformedStates = countryStates.map(state => ({
                value: state.id,
                label: state.name
            }));
            setFilteredStates(transformedStates);
            
            const matchedState = transformedStates.find(s => s.value === stationData.orgAddress?.state);
            if (matchedState) {
                setValue("state", matchedState);
            } else {
                console.warn("Matching state not found for country:", matchedCountry.label);
            }
        } else {
            console.warn("Matching country not found in dropdown options");
        }
        
        setValue("warehouse", stationData.parentorgid || null);
        setValue("Pincode", stationData.orgAddress?.pincode || "");
        setValue("managerName", stationData.userFullName || "");
        setValue("isActive", stationData.isActive || false);
        
        // Set password field to empty for security - user can enter new password if needed
        setValue("password", "");
    };

    const onSubmit = async (data) => {
        const fullName = data?.managerName || "";
        const nameParts = fullName.split(" ");

        const payloaddata = {
            id: parseInt(params.uid),
            orgName: data?.stationName,
            orgEmail: data?.email,
            orgMobile: data?.mobileno,
            orgAddress: {
                uaid: 0,
                address1: data?.adress1,
                address2: data?.adress2,
                city: data?.city,
                state: data?.state?.value,
                country: data?.country?.value,
                pincode: data?.Pincode,
                uid: 0,
                addridentifier: null,
                maplocation: null,
                latitude: data?.latitude || null,
                longitude: data?.longitude || null,
                qrcode: null,
                userorgaddressmappings: userorgaddressmappingss
            },
            userRoleTypeId: userRoleTypeId || 5,
            userFullName: data?.managerName,
            userFirstName: nameParts[0],
            userLastName: nameParts[1] || "",
            isActive: data?.isActive,
            password: data?.password,
            parentorgid: data?.warehouse,
            uoid: orgid,
        }
        const response = await CallFor(`v2/Organization/UpdateOrganization`, 'POST', payloaddata, 'Auth');
        if (response) {
            router.push(`/admin/Warehouse/list`);
        }
    };

    if (isLoading) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <form className="max-w-7xl mx-auto p-6 rounded-md shadow-md" onSubmit={handleSubmit(onSubmit)}>
                <div className='flex justify-between items-center mb-6'>
                    <div className='text-orange-500 text-2xl bold'>Edit Station</div>
                </div>
                <div className="grid grid-cols-1 gap-4">
                    <div>
                        <div className="flex items-center space-x-4">
                            <label htmlFor="productName" className="w-1/4 font-medium dark:text-white text-gray-700">Station Name *</label>
                            <Controller
                                name="stationName"
                                control={control}
                                render={({ field }) => (
                                    <input
                                        type="text"
                                        id="productName"
                                        {...field}
                                        className="flex-grow p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                )}
                            />
                        </div>
                        {errors.stationName &&
                            <div className="flex items-center space-x-4">
                                <label className="w-1/4 text-sm font-medium"></label>
                                <div className="text-red-500 text-sm">
                                    {errors.stationName.message}
                                </div>
                            </div>
                        }
                    </div>

                    <div>
                        <div className="flex items-center space-x-4">
                            <label htmlFor="managerName" className="w-1/4 font-medium dark:text-white text-gray-700">Manager Name *</label>
                            <Controller
                                name="managerName"
                                control={control}
                                render={({ field }) => (
                                    <input
                                        type='text'
                                        id="managerName"
                                        {...field}
                                        className={`flex-grow p-3 border ${errors.managerName ? "border-red-500" : "border-gray-300"} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                    />
                                )}
                            />
                        </div>
                        {errors.managerName &&
                            <div className="flex items-center space-x-4">
                                <label className="w-1/4 text-sm font-medium"></label>
                                <div className="text-red-500 text-sm">
                                    {errors.managerName.message}
                                </div>
                            </div>
                        }
                    </div>

                    <div>
                        <div className="flex items-center space-x-4">
                            <label htmlFor="email" className="w-1/4 font-medium dark:text-white text-gray-700">Email *</label>
                            <Controller
                                name="email"
                                control={control}
                                render={({ field }) => (
                                    <input
                                        type="email"
                                        id="email"
                                        {...field}
                                        className="flex-grow p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                )}
                            />
                        </div>
                        {errors.email &&
                            <div className="flex items-center space-x-4">
                                <label className="w-1/4 text-sm font-medium"></label>
                                <div className="text-red-500 text-sm">
                                    {errors.email.message}
                                </div>
                            </div>
                        }
                    </div>

                    <div>
                        <div className="flex items-center space-x-4">
                            <label htmlFor="mobileno" className="w-1/4 font-medium dark:text-white text-gray-700">Mobile No *</label>
                            <Controller
                                name="mobileno"
                                control={control}
                                render={({ field }) => (
                                    <input
                                        type="text"
                                        id="mobileno"
                                        {...field}
                                        className="flex-grow p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                )}
                            />
                        </div>
                        {errors.mobileno &&
                            <div className="flex items-center space-x-4">
                                <label className="w-1/4 text-sm font-medium"></label>
                                <div className="text-red-500 text-sm">
                                    {errors.mobileno.message}
                                </div>
                            </div>
                        }
                    </div>

                    <div>
                        <div className="flex items-center space-x-4">
                            <label htmlFor="password" className="w-1/4 font-medium dark:text-white text-gray-700">Set Password</label>
                            <Controller
                                name="password"
                                control={control}
                                render={({ field }) => (
                                    <input
                                        type='password'
                                        id="password"
                                        {...field}
                                        className={`flex-grow p-3 border ${errors.password ? "border-red-500" : "border-gray-300"} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                    />
                                )}
                            />
                        </div>
                        {errors.password &&
                            <div className="flex items-center space-x-4">
                                <label className="w-1/4 text-sm font-medium"></label>
                                <div className="text-red-500 text-sm">
                                    {errors.password.message}
                                </div>
                            </div>
                        }
                    </div>

                    <div>
                        <div className="flex items-center space-x-4">
                            <label htmlFor="adress1" className="w-1/4 font-medium dark:text-white text-gray-700">Address 1 *</label>
                            <Controller
                                name="adress1"
                                control={control}
                                render={({ field }) => (
                                    <input
                                        type="text"
                                        id="adress1"
                                        {...field}
                                        className={`flex-grow p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 ${errors.adress1 ? "border-red-500" : "focus:ring-blue-500"
                                            }`}
                                    />
                                )}
                            />
                        </div>
                        {errors.adress1 &&
                            <div className="flex items-center space-x-4">
                                <label className="w-1/4 text-sm font-medium"></label>
                                <div className="text-red-500 text-sm">
                                    {errors.adress1.message}
                                </div>
                            </div>
                        }
                    </div>

                    <div>
                        <div className="flex items-center space-x-4">
                            <label htmlFor="adress2" className="w-1/4 font-medium dark:text-white text-gray-700">Address 2</label>
                            <Controller
                                name="adress2"
                                control={control}
                                render={({ field }) => (
                                    <input
                                        type="text"
                                        id="adress2"
                                        {...field}
                                        className={`flex-grow p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 ${errors.adress2 ? "border-red-500" : "focus:ring-blue-500"
                                            }`}
                                    />
                                )}
                            />
                        </div>
                        {errors.adress2 &&
                            <div className="flex items-center space-x-4">
                                <label className="w-1/4 text-sm font-medium"></label>
                                <div className="text-red-500 text-sm">
                                    {errors.adress2.message}
                                </div>
                            </div>
                        }
                    </div>

                    {/* Country field moved up */}
                    <div>
                        <div className="flex items-center space-x-4">
                            <label htmlFor="country" className="w-1/4 font-medium dark:text-white text-gray-700">Country *</label>
                            <Controller
                                name="country"
                                control={control}
                                render={({ field }) => (
                                    <Select
                                        id="country"
                                        {...field}
                                        options={countries}
                                        onChange={(selectedOption) => {
                                            setValue("country", selectedOption);
                                            setValue("state", null); // Clear state when country changes
                                            clearErrors('country');
                                        }}
                                        className={`flex-grow text-black ${errors.country ? "border border-red-500" : ""}`}
                                        placeholder="Select Country"
                                    />
                                )}
                            />
                        </div>
                        {errors.country &&
                            <div className="flex items-center space-x-4">
                                <label className="w-1/4 text-sm font-medium"></label>
                                <div className="text-red-500 text-sm">
                                    {errors.country.message}
                                </div>
                            </div>
                        }
                    </div>

                    {/* State field - now filtered based on country */}
                    <div>
                        <div className="flex items-center space-x-4">
                            <label htmlFor="state" className="w-1/4 font-medium dark:text-white text-gray-700">State *</label>
                            <Controller
                                name="state"
                                control={control}
                                render={({ field }) => (
                                    <Select
                                        id="state"
                                        {...field}
                                        options={filteredStates}
                                        onChange={(selectedOption) => {
                                            setValue("state", selectedOption);
                                            clearErrors('state');
                                        }}
                                        className={`flex-grow z-5 text-black ${errors.state ? "border border-red-500" : ""}`}
                                        placeholder={selectedCountry ? "Select State" : "Please select a country first"}
                                        isDisabled={!selectedCountry}
                                    />
                                )}
                            />
                        </div>
                        {errors.state &&
                            <div className="flex items-center space-x-4">
                                <label className="w-1/4 text-sm font-medium"></label>
                                <div className="text-red-500 text-sm">
                                    {errors.state.message}
                                </div>
                            </div>
                        }
                    </div>

                    <div>
                        <div className="flex items-center space-x-4">
                            <label htmlFor="city" className="w-1/4 font-medium dark:text-white text-gray-700">City *</label>
                            <Controller
                                name="city"
                                control={control}
                                render={({ field }) => (
                                    <input
                                        type="text"
                                        id="city"
                                        {...field}
                                        className={`flex-grow p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 ${errors.city ? "border-red-500" : "focus:ring-blue-500"
                                            }`}
                                    />
                                )}
                            />
                        </div>
                        {errors.city &&
                            <div className="flex items-center space-x-4">
                                <label className="w-1/4 text-sm font-medium"></label>
                                <div className="text-red-500 text-sm">
                                    {errors.city.message}
                                </div>
                            </div>
                        }
                    </div>

                    <div>
                        <div className="flex items-center space-x-4">
                            <label htmlFor="Pincode" className="w-1/4 font-medium dark:text-white text-gray-700">Pincode *</label>
                            <Controller
                                name="Pincode"
                                control={control}
                                render={({ field }) => (
                                    <input
                                        type="text"
                                        id="Pincode"
                                        {...field}
                                        className={`flex-grow p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 ${errors.Pincode ? "border-red-500" : "focus:ring-blue-500"
                                            }`}
                                    />
                                )}
                            />
                        </div>
                        {errors.Pincode &&
                            <div className="flex items-center space-x-4">
                                <label className="w-1/4 text-sm font-medium"></label>
                                <div className="text-red-500 text-sm">
                                    {errors.Pincode.message}
                                </div>
                            </div>
                        }
                    </div>

                    {/* New Latitude field */}
                    <div>
                        <div className="flex items-center space-x-4">
                            <label htmlFor="latitude" className="w-1/4 font-medium dark:text-white text-gray-700">Latitude</label>
                            <Controller
                                name="latitude"
                                control={control}
                                render={({ field }) => (
                                    <input
                                        type="text"
                                        id="latitude"
                                        {...field}
                                        placeholder="e.g., 23.0225"
                                        className="flex-grow p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                )}
                            />
                        </div>
                        {errors.latitude &&
                            <div className="flex items-center space-x-4">
                                <label className="w-1/4 text-sm font-medium"></label>
                                <div className="text-red-500 text-sm">
                                    {errors.latitude.message}
                                </div>
                            </div>
                        }
                    </div>

                    {/* New Longitude field */}
                    <div>
                        <div className="flex items-center space-x-4">
                            <label htmlFor="longitude" className="w-1/4 font-medium dark:text-white text-gray-700">Longitude</label>
                            <Controller
                                name="longitude"
                                control={control}
                                render={({ field }) => (
                                    <input
                                        type="text"
                                        id="longitude"
                                        {...field}
                                        placeholder="e.g., 72.5714"
                                        className="flex-grow p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                )}
                            />
                        </div>
                        {errors.longitude &&
                            <div className="flex items-center space-x-4">
                                <label className="w-1/4 text-sm font-medium"></label>
                                <div className="text-red-500 text-sm">
                                    {errors.longitude.message}
                                </div>
                            </div>
                        }
                    </div>

                    <div>
                        <div className="flex items-center space-x-4">
                            <label htmlFor="isActive" className="w-1/4 font-medium dark:text-white text-gray-700">Is Active</label>
                            <Controller
                                name="isActive"
                                control={control}
                                render={({ field }) => (
                                    <Switch
                                        checked={field.value}
                                        onCheckedChange={(checked) => setValue("isActive", checked)}
                                    />
                                )}
                            />
                        </div>
                        {errors.isActive &&
                            <div className="flex items-center space-x-4">
                                <label className="w-1/4 text-sm font-medium"></label>
                                <div className="text-red-500 text-sm">
                                    {errors.isActive.message}
                                </div>
                            </div>
                        }
                    </div>
                </div>
                <div className='flex justify-center'>
                    <button type="button" onClick={()=>{router.back()}} className="mt-6 me-3 px-3 py-2 bg-[#11357C] text-white rounded-md focus:outline-none">Cancel</button>
                    <button type="submit" className="mt-6 px-3 py-2 bg-orange-500 text-white rounded-md focus:outline-none">Save</button>
                </div>
            </form>
        </div>
    )
}

export default editwarehouse;