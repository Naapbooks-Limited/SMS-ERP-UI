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
    const [states, setStates] = useState([]);
    const [userRoleTypeId, setUserRoleTypeId] = useState();
    const [isLoading, setIsLoading] = useState(true);
    const [stationData, setStationData] = useState(null);
    const [warehouses, setWarehouses] = useState([]);
    const [uaid, setuaid] = useState();
    const [uid, setuid] = useState();

    const [userorgaddressmappingss, setuserorgaddressmappingss] = useState([]);
    const [filteredStates, setFilteredStates] = useState([]);


    const validationSchema = Yup.object().shape({
        stationName: Yup.string()
            .required("Station Name is required")
            .matches(/^[a-zA-Z0-9\s]+$/, "Station Name should not contain special characters"),
        managerName: Yup.string()
            .required("Manager Name is required")
            .matches(/^[a-zA-Z\s]+$/, "Manager Name should only contain letters and spaces"),
        isActive: Yup.boolean(),
        state: Yup.object()
            .shape({
                value: Yup.number().required("State is required"),
                label: Yup.string().required(),
            })
            .nullable()
            .required("State is required"),
        country: Yup.object()
            .shape({
                value: Yup.number().required("Country is required"),
                label: Yup.string().required(),
            })
            .nullable()
            .required("Country is required"),
        warehouse: Yup.object()
            .shape({
                value: Yup.number().required("Warehouse is required"),
                label: Yup.string().required(),
            })
            .nullable()
            .required("Warehouse is required"),
        adress1: Yup.string()
            .required("Address 1 is required")
            .matches(/^[a-zA-Z0-9\s,.-]+$/, "Address should not contain special characters except , . -"),
        adress2: Yup.string()
            .matches(/^[a-zA-Z0-9\s,.-]*$/, "Address should not contain special characters except , . -"),
        city: Yup.string()
            .required("City is required")
            .matches(/^[a-zA-Z\s]+$/, "City should only contain letters and spaces"),
        email: Yup.string()
            .required("Email is required")
            .matches(
                /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                "Please enter a valid email address"
            ),
        mobileno: Yup.string()
            .matches(/^[0-9]{10}$/, "Mobile number must be exactly 10 digits")
            .required("Mobile number is required"),
       Pincode: Yup.string()
  .matches(/^[A-Za-z0-9\s-]{3,10}$/, "Enter a valid postal code")
  .required("Pincode is required"),


        latitude: Yup.number()
            .typeError("Latitude must be a number")
            .min(-90, "Latitude must be between -90 and 90")
            .max(90, "Latitude must be between -90 and 90"),
        longitude: Yup.number()
            .typeError("Longitude must be a number")
            .min(-180, "Longitude must be between -180 and 180")
            .max(180, "Longitude must be between -180 and 180"),
    });

    const { control, handleSubmit, setValue, formState: { errors }, clearErrors } = useForm({
        resolver: yupResolver(validationSchema),
    });

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
        if (!isLoading && stationData && countries.length > 0 && states.length > 0) {
            populateForm();
        }
    }, [isLoading, stationData, countries, states]);

    const getCountryState = async () => {
        const response = await CallFor(`v2/Organization/SaveOrganizationWithUser`, 'GET', null, 'Auth');
        if (response.status == 200) {
            const transformedCountry = response?.data?.dropdowns?.countries?.map(country => ({
                value: country.id,
                label: country.name
            }));
            setCountries(transformedCountry);

            // Store all states, but don't set filteredStates yet
            const transformedStates = response?.data?.dropdowns?.states?.map(state => ({
                value: state.id,
                label: state.name,
                countryId: state.countryId // keep countryId for filtering
            }));
            setStates(transformedStates);

            const transformedWarehouses = response?.data?.dropdowns?.warehouse?.map(warehouse => ({
                value: warehouse.id,
                label: warehouse.name
            }));
            setWarehouses(transformedWarehouses);


            const roleId = response?.data?.dropdowns?.roles.find((item) => item?.name == 'Station Manager');
            setUserRoleTypeId(roleId?.id);
        }
    };

    const getStationById = async () => {
        const response = await CallFor(`v2/Organization/GetOrganisationById?id=${params.uid}`, 'GET', null, 'Auth');
        if (response.status == 200) {
            setStationData(response.data.data);
        }
    };

    const populateForm = () => {
        if (!stationData) return;

        setValue("stationName", stationData.orgName);
        setValue("email", stationData.orgEmail);
        setValue("mobileno", stationData.orgMobile);
        setValue("adress1", stationData.orgAddress.address1);
        setValue("adress2", stationData.orgAddress.address2);
        setValue("city", stationData.orgAddress.city);
        setuaid(stationData.orgAddress.uaid)
        setuid(stationData.orgAddress.uid)
        setuserorgaddressmappingss(stationData.orgAddress.userorgaddressmappings)

        const matchedCountry = countries.find(c => c.value == stationData.orgAddress.country);
        if (matchedCountry) {
            setValue("country", matchedCountry);
            // Only set filteredStates if country is selected
            setFilteredStates(states.filter(s => s.countryId == matchedCountry.value));
        } else {
            setFilteredStates([]);
        }

        const matchedState = states.find(s => s.value == stationData.orgAddress.state);
        if (matchedState) {
            setValue("state", matchedState);
        }

        const matchedWarehouse = warehouses.find(c => c.value == stationData.parentorgid);
        if (matchedWarehouse) {
            setValue("warehouse", matchedWarehouse);
        }

        setValue("Pincode", stationData.orgAddress.pincode);
        setValue("managerName", stationData.userFullName);
        setValue("isActive", stationData.isActive);
        setValue("latitude", stationData.orgAddress.latitude);
        setValue("longitude", stationData.orgAddress.longitude);
    };

    
    const onSubmit = async (data) => {
        const fullName = data?.managerName || "";
        const nameParts = fullName.split(" ");

        const payloaddata = {
            id: parseInt(params.uid),
            companyName: data?.stationName,
            companyEmail: data?.email,
            companyMobile: data?.mobileno,
            companyAddress: {
                uaid: uaid,
                address1: data?.adress1,
                address2: data?.adress2,
                city: data?.city,
                state: data?.state?.value,
                country: data?.country?.value,
                pincode: data?.Pincode,
                uid: uid,
                addridentifier: null,
                maplocation: null,
                latitude: data?.latitude || null,
                longitude: data?.longitude || null,
                qrcode: null,
                userorgaddressmappings: userorgaddressmappingss
            },
            // userRoleTypeId: 5,
            // userFullName: data?.managerName,
            ownerFirstName: nameParts[0],
            ownerLastName: nameParts[1] || "",
            password: data?.password,
            isActive: data?.isActive,
            parentorgid: data?.warehouse?.value
        }
        const response = await CallFor(`v2/account/UpdateExternalDealer`, 'POST', payloaddata, 'Auth');
        if (response.status == 200) {
            router.push(`/admin/station/list`);     
        }
    };

    if (isLoading) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <form className="max-w-7xl mx-auto p-6 rounded-md shadow-md" onSubmit={handleSubmit(onSubmit)}>
                <div className='flex justify-between items-center mb-6'>
                    <div className='text-orange-500 text-2xl bold'>Update Station</div>
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
                            <label htmlFor="email" className="w-1/4 font-medium dark:text-white text-gray-700"> Email</label>
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
                            <label htmlFor="mobileno" className="w-1/4 font-medium dark:text-white text-gray-700"> Mobile No</label>
                            <Controller
                                name="mobileno"
                                control={control}
                                render={({ field }) => (
                                    <input
                                        type="mobileno"
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
                            <label htmlFor="adress1" className="w-1/4 font-medium dark:text-white text-gray-700"> Address 1</label>
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


                 

                    

                    <div>
                        <div className="flex items-center space-x-4">
                            <label htmlFor="warehouse" className="w-1/4 font-medium dark:text-white text-gray-700">Warehouse</label>
                            <Controller
                                name="warehouse"
                                control={control}
                                render={({ field }) => (
                                    <Select
                                        id="warehouse"
                                        {...field}
                                        onChange={(value) => { setValue("warehouse", value); clearErrors('warehouse') }}
                                        options={warehouses}
                                        className={`flex-grow z-6 text-black ${errors.warehouse ? " border border-red-500" : ""}`}
                                    />
                                )}
                            />
                        </div>
                        {errors.warehouse &&
                            <div className="flex items-center space-x-4">
                                <label className="w-1/4 text-sm font-medium"></label>
                                <div className="text-red-500 text-sm">
                                    {errors.warehouse.message}
                                </div>
                            </div>
                        }
                    </div>

                    
                    <div>
                    <div className="flex items-center space-x-4">
                        <label htmlFor="country" className="w-1/4 font-medium dark:text-white text-gray-700">Country</label>
                        <Controller
                            name="country"
                            control={control}
                            render={({ field }) => (
                                <Select
                                    id="country"
                                    {...field}
                                    options={countries}
                                    onChange={(selectedOption) => {
                                        field.onChange(selectedOption);
                                        clearErrors('country');
                                        if (selectedOption) {
                                            // Filter states only when country is selected
                                            setFilteredStates(states.filter(s => s.countryId == selectedOption.value));
                                            setValue("state", null); // Reset state selection
                                        } else {
                                            setFilteredStates([]);
                                            setValue("state", null);
                                        }
                                    }}
                                    className={`flex-grow  text-black ${errors.country ? "border border-red-500" : ""}`}
                                />
                            )}
                        />
                    </div>
                    {errors.country && (
                        <div className="flex items-center space-x-4">
                            <label className="w-1/4 text-sm font-medium"></label>
                            <div className="text-red-500 text-sm">
                                {errors.country.message}
                            </div>
                        </div>
                    )}
                </div>


                    <div>
                    <div className="flex items-center space-x-4">
                        <label htmlFor="state" className="w-1/4 font-medium dark:text-white text-gray-700">State</label>
                        <Controller
                            name="state"
                            control={control}
                            render={({ field }) => (
                                <Select
                                    id="state"
                                    {...field}
                                    options={filteredStates}
                                    onChange={(selectedOption) => {
                                        field.onChange(selectedOption);
                                        clearErrors('state');
                                    }}
                                    // Disable state dropdown if no country is selected
                                    isDisabled={filteredStates.length == 0}
                                    className={`flex-grow z-4 text-black ${errors.state ? "border border-red-500" : ""}`}
                                />
                            )}
                        />
                    </div>
                    {errors.state && (
                        <div className="flex items-center space-x-4">
                            <label className="w-1/4 text-sm font-medium"></label>
                            <div className="text-red-500 text-sm">
                                {errors.state.message}
                            </div>
                        </div>
                    )}
                </div>



                <div>
                        <div className="flex items-center space-x-4">
                            <label htmlFor="city" className="w-1/4 font-medium dark:text-white text-gray-700">City</label>
                            <Controller
                                name="city"
                                control={control}
                                render={({ field }) => (
                                    <input
                                        type="text"
                                        id="city"
                                        {...field}
                                        className={`flex-grow p-2  border border-gray-300 rounded-md focus:outline-none focus:ring-2 ${errors.city ? "border-red-500" : "focus:ring-blue-500"
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
                            <label htmlFor="Pincode" className="w-1/4 font-medium dark:text-white text-gray-700">Pincode</label>
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
                    <div>
                        <div className="flex items-center space-x-4">
                            <label htmlFor="latitude" className="w-1/4 font-medium dark:text-white text-gray-700">Latitude</label>
                            <Controller
                                name="latitude"
                                control={control}
                                render={({ field }) => (
                                    <input
                                        type="number"
                                        step="any"
                                        id="latitude"
                                        {...field}
                                        className={`flex-grow p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 ${errors.latitude ? "border-red-500" : "focus:ring-blue-500"}`}
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
                    <div>
                        <div className="flex items-center space-x-4">
                            <label htmlFor="longitude" className="w-1/4 font-medium dark:text-white text-gray-700">Longitude</label>
                            <Controller
                                name="longitude"
                                control={control}
                                render={({ field }) => (
                                    <input
                                        type="number"
                                        step="any"
                                        id="longitude"
                                        {...field}
                                        className={`flex-grow p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 ${errors.longitude ? "border-red-500" : "focus:ring-blue-500"}`}
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
                                    ></input>
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
                            <label htmlFor="password" className="w-1/4 font-medium dark:text-white text-gray-700">Set-Password</label>
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

                    {/* <div>
                        <div className="flex items-center space-x-4">
                            <label htmlFor="confirmPassword" className="w-1/4 font-medium dark:text-white text-gray-700">Conform Password</label>
                            <Controller
                                name="confirmPassword"
                                control={control}
                                render={({ field }) => (
                                    <input
                                        type='password'
                                        id="confirmPassword"
                                        {...field}
                                        className={`flex-grow p-3 border ${errors.confirmPassword ? "border-red-500" : "border-gray-300"} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                    />
                                )}
                            />
                        </div>
                        {errors.confirmPassword &&
                            <div className="flex items-center space-x-4">
                                <label className="w-1/4 text-sm font-medium"></label>
                                <div className="text-red-500 text-sm">
                                    {errors.confirmPassword.message}
                                </div>
                            </div>
                        }
                    </div> */}

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
                    <button type="button" onClick={()=>router.back()} className="mt-6 me-3 px-3 py-2 bg-[#11357C] text-white rounded-md focus:outline-none">Cancel</button>
                    <button type="submit" className="mt-6 px-3 py-2 bg-orange-500 text-white rounded-md focus:outline-none">Save</button>
                </div>
            </form>
        </div>
    )
}

export default editwarehouse;
