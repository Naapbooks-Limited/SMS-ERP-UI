"use client";
import React, { useEffect, useState } from "react";
import { toast as reToast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useParams, useRouter } from "next/navigation";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import CallFor from "@/utilities/CallFor";
import { Undo } from "lucide-react";
import Link from "next/link";
import * as Yup from 'yup';

const validationSchema = Yup.object().shape({
    companyName: Yup.string().required('Company Name is required'),
    companyEmail: Yup.string().email('Invalid email').required('Company Email is required'),
    companyMobile: Yup.string().matches(/^\d{10}$/, 'Phone number must be 10 digits').required('Company Mobile is required'),
    companyAddress: Yup.object().shape({
        address1: Yup.string().required('Address Line 1 is required'),
        city: Yup.string().required('City is required'),
        state: Yup.number().required('State is required'),
        country: Yup.number().required('Country is required'),
        pincode: Yup.string().matches(/^\d{6}$/, 'Pincode must be 6 digits').required('Pincode is required'),
    }),
    ownerFirstName: Yup.string().required('Owner First Name is required'),
    ownerLastName: Yup.string().required('Owner Last Name is required'),
});

const ExternalDealerEditForm = () => {
    const router = useRouter();
    const [selectedStateName, setSelectedStateName] = useState("");
    const [selectedCountryName, setSelectedCountryName] = useState("");
    const [formData, setFormData] = useState({
        id: "",
        companyName: "",
        companyEmail: "",
        companyMobile: "",
        companyAddress: {
            uaid: 0,
            address1: "",
            address2: "",
            city: "",
            state: 0,
            country: 0,
            pincode: null,
            uid: null,
            addridentifier: null,
            maplocation: null,
            latitude: null,
            longitude: null,
            qrcode: null,
            userorgaddressmappings: null,
        },
        ownerFirstName: "",
        ownerLastName: "",
    });
    const [errors, setErrors] = useState({});

    const [states, setStates] = useState([]);
    const [countries, setCountries] = useState([]);
    const param = useParams();

    useEffect(() => {
        getSaveExternalDealer();
    }, []);

    const getSaveExternalDealer = async () => {
        const response = await CallFor(`v2/account/SaveExternalDealer`, 'GET', null, 'Auth');
        if (response?.status == 200) {
            setStates(response?.data?.dropdowns?.states || []);
            setCountries(response?.data?.dropdowns?.countries || []);
            fetchData();
        }
    }

    const fetchData = async () => {
        try {
            const response = await CallFor(`v2/account/GetExternalDealerById?Id=${param?.externlwrhouId}`, 'GET', null, 'Auth')
            if (response?.status == 200) {
                setFormData({
                    id: response?.data?.data?.id,
                    companyName: response?.data?.data?.companyName,
                    companyEmail: response?.data?.data?.companyEmail,
                    companyMobile: response?.data?.data?.companyMobile,
                    companyAddress: response?.data?.data?.companyAddress,
                    ownerFirstName: response?.data?.data?.ownerFirstName,
                    ownerLastName: response?.data?.data?.ownerLastName,
                });

                const selectedState = states.find(state => state.id == response?.data?.data?.state);
                const selectedCountry = countries.find(country => country.id == response?.data?.data?.country);
                setSelectedStateName(selectedState ? selectedState.name : "");
                setSelectedCountryName(selectedCountry ? selectedCountry.name : "");
            }
        } catch (error) {
            reToast.error("Failed to load form data. Please try again.");
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleAddressChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            companyAddress: {
                ...prevData.companyAddress,
                [name]: value,
            },
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await validationSchema.validate(formData, { abortEarly: false });
            const data = {
                id: formData?.id,
                CompanyName: formData.companyName,
                CompanyEmail: formData.companyEmail,
                CompanyMobile: formData.companyMobile,
                CompanyAddress: {
                    Uaid: formData.companyAddress.uaid,
                    Address1: formData.companyAddress.address1,
                    Address2: formData.companyAddress.address2,
                    City: formData.companyAddress.city,
                    State: parseInt(formData.companyAddress.state),
                    Country: parseInt(formData.companyAddress.country),
                    Pincode: formData.companyAddress.pincode,
                    Uid: formData.companyAddress.uid,
                    Addridentifier: "Office",
                    Maplocation: formData.companyAddress.maplocation,
                    Latitude: formData.companyAddress.latitude,
                    Longitude: formData.companyAddress.longitude,
                    Qrcode: formData.companyAddress.qrcode,
                    UserOrgAddressMappings: formData.companyAddress.userorgaddressmappings,
                },
                OwnerFirstName: formData.ownerFirstName,
                OwnerLastName: formData.ownerLastName,
            }

            const response = await CallFor(
                "v2/account/UpdateExternalDealer",
                "POST",
                JSON.stringify(data),
                "Auth"
            );

            if (response) {
                reToast.success("Form updated successfully");
                router.push("/station/station/Externalwarehouse");
            } else {
                reToast.error("Failed to update form");
            }
        } catch (error) {
            if (error instanceof Yup.ValidationError) {
                const validationErrors = {};
                error.inner.forEach((err) => {
                    validationErrors[err.path] = err.message;
                });
                setErrors(validationErrors);
                reToast.error("Please correct the form errors");
            } else {
                reToast.error("Failed to update form. Please try again");
            }
        }
    };

    return (
        <div className="mt-4">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold mb-4 text-orange-500">
                    Edit External Vendor
                </h2>
                <Link href="/station/station/Externalwarehouse">
                    <Button color="warning" className="shadow-md">
                        <Undo size={20}></Undo>
                        Back
                    </Button>
                </Link>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-12 gap-4">
                    <div className="col-span-12 mb-4">
                        <h4 className="text-sm font-bold text-default-600 dark:text-white ">
                            Company Information
                        </h4>
                    </div>
                    <div className="col-span-12 lg:col-span-6 flex items-center">
                        <label className="w-1/3 dark:text-white text-sm font-medium text-default-600 ">
                            Company Name
                        </label>
                        <Input
                            className='dark:text-gray-300'
                            type="text"
                            name="companyName"
                            value={formData.companyName}
                            onChange={handleChange}
                            placeholder="Company Name"
                        />
                        {errors.companyName && <p className="text-red-500 text-xs mt-1">{errors.companyName}</p>}
                    </div>
                    <div className="col-span-12 lg:col-span-6 flex items-center">
                        <label className="w-1/3 dark:text-white text-sm font-medium text-default-600 ">
                            Company Email
                        </label>
                        <Input
                            className='dark:text-gray-300'
                            type="email"
                            name="companyEmail"
                            value={formData.companyEmail}
                            onChange={handleChange}
                            placeholder="Company Email"
                        />
                        {errors.companyEmail && <p className="text-red-500 text-xs mt-1">{errors.companyEmail}</p>}
                    </div>
                    <div className="col-span-12 lg:col-span-6 flex items-center">
                        <label className="w-1/3 dark:text-white text-sm font-medium text-default-600">
                            Company Mobile
                        </label>
                        <Input
                            className='dark:text-gray-300'
                            type="text"
                            name="companyMobile"
                            value={formData.companyMobile.replace(/[^0-9]/g,"")}
                            onChange={handleChange}
                            placeholder="Company Mobile"
                        />
                        {errors.companyMobile && <p className="text-red-500 text-xs mt-1">{errors.companyMobile}</p>}
                    </div>

                    <div className="col-span-12 mt-6 mb-4">
                        <h4 className="text-sm font-bold  text-default-600">
                            Address Information
                        </h4>
                    </div>
                    <div className="col-span-12 lg:col-span-6 flex items-center">
                        <label className="w-1/3 dark:text-white text-sm font-medium text-default-600">
                            Address Line 1
                        </label>
                        <Input
                            className='dark:text-gray-300'
                            type="text"
                            name="address1"
                            value={formData.companyAddress.address1}
                            onChange={handleAddressChange}
                            placeholder="Address Line 1"
                        />
                        {errors['companyAddress.address1'] && <p className="text-red-500 text-xs mt-1">{errors['companyAddress.address1']}</p>}
                    </div>
                    <div className="col-span-12 lg:col-span-6 flex items-center">
                        <label className="w-1/3 dark:text-white text-sm font-medium text-default-600">
                            Address Line 2
                        </label>
                        <Input
                            className='dark:text-gray-300'
                            type="text"
                            name="address2"
                            value={formData.companyAddress.address2}
                            onChange={handleAddressChange}
                            placeholder="Address Line 2"
                        />
                    </div>

                    {/* Country Select */}
<div className="col-span-12 lg:col-span-6 flex items-center">
  <label className="w-1/2 text-sm font-medium text-default-600 dark:text-white">
    Country
  </label>
  <Select
    name="country"
    value={formData.companyAddress.country.toString()}
    onValueChange={(value) => {
      handleAddressChange({
        target: { name: "country", value: Number(value) },
      });

      // Reset state, city, pincode when country changes
      setFormData((prevData) => ({
        ...prevData,
        companyAddress: {
          ...prevData.companyAddress,
          state: 0,
          city: "",
          pincode: "",
        },
      }));

      const selectedCountry = countries.find(
        (country) => country.id.toString() == value
      );
      setSelectedCountryName(selectedCountry ? selectedCountry.name : "");
    }}
    className="text-black"
  >
    <SelectTrigger>
      <SelectValue placeholder="Select a country" />
    </SelectTrigger>
    <SelectContent>
      <ScrollArea className="h-[200px] text-black dark:text-white">
        {countries?.map((country) => (
          <SelectItem key={country.id} value={country.id.toString()}>
            {country.name}
          </SelectItem>
        ))}
      </ScrollArea>
    </SelectContent>
  </Select>
  {errors["companyAddress.country"] && (
    <p className="text-red-500 text-xs mt-1">
      {errors["companyAddress.country"]}
    </p>
  )}
</div>

{/* State Select */}
<div className="col-span-12 lg:col-span-6 flex items-center">
  <label className="w-1/2 text-sm font-medium text-default-600 dark:text-white">
    State
  </label>
  <Select
    name="state"
    value={formData.companyAddress.state.toString()}
    onValueChange={(value) => {
      handleAddressChange({
        target: { name: "state", value: Number(value) },
      });

      // Reset city & pincode when state changes
      setFormData((prevData) => ({
        ...prevData,
        companyAddress: {
          ...prevData.companyAddress,
          city: "",
          pincode: "",
        },
      }));

      const selectedState = states.find(
        (state) => state.id.toString() == value
      );
      setSelectedStateName(selectedState ? selectedState.name : "");
    }}
    disabled={!formData.companyAddress.country} // disable until country chosen
    className="text-black"
  >
    <SelectTrigger>
      <SelectValue placeholder="Select a state" />
    </SelectTrigger>
    <SelectContent>
      <ScrollArea className="h-[200px] text-black dark:text-white">
        {states
          .filter(
            (state) =>
              state.countryId == formData.companyAddress.country // filter states
          )
          .map((state) => (
            <SelectItem key={state.id} value={state.id.toString()}>
              {state.name}
            </SelectItem>
          ))}
      </ScrollArea>
    </SelectContent>
  </Select>
  {errors["companyAddress.state"] && (
    <p className="text-red-500 text-xs mt-1">
      {errors["companyAddress.state"]}
    </p>
  )}
</div>


                    <div className="col-span-12 lg:col-span-6 flex items-center">
                        <label className="w-1/3 dark:text-white text-sm font-medium text-default-600">
                            City
                        </label>
                        <Input
                            className='dark:text-gray-300'
                            type="text"
                            name="city"
                            value={formData.companyAddress.city}
                            onChange={handleAddressChange}
                            placeholder="City"
                        />
                        {errors['companyAddress.city'] && <p className="text-red-500 text-xs mt-1">{errors['companyAddress.city']}</p>}
                    </div>




                 





                   
                <div className="col-span-12 lg:col-span-6 flex items-center">
                    <label className="w-1/3 dark:text-white text-sm font-medium text-default-600">
                        Pincode
                    </label>
                    <Input
                        className='dark:text-gray-300'
                        type="text"
                        name="pincode"
                        value={formData.companyAddress.pincode}
                        onChange={handleAddressChange}
                        placeholder="Pincode"
                    />
                    {errors['companyAddress.pincode'] && <p className="text-red-500 text-xs mt-1">{errors['companyAddress.pincode']}</p>}
                </div>

                <div className="col-span-12 mt-6 mb-4">
                    <h4 className="text-sm font-bold text-default-600">
                        Owner Information
                    </h4>
                </div>
                <div className="col-span-12 lg:col-span-6 flex items-center">
                    <label className="w-1/3 dark:text-white text-sm font-medium text-default-600">
                        Owner First Name
                    </label>
                    <Input
                        className='dark:text-gray-300'
                        type="text"
                        name="ownerFirstName"
                        value={formData.ownerFirstName}
                        onChange={handleChange}
                        placeholder="Owner First Name"
                    />
                    {errors.ownerFirstName && <p className="text-red-500 text-xs mt-1">{errors.ownerFirstName}</p>}
                </div>
                <div className="col-span-12 lg:col-span-6 flex items-center">
                    <label className="w-1/3 dark:text-white text-sm font-medium text-default-600">
                        Owner Last Name
                    </label>
                    <Input
                        className='dark:text-gray-300'
                        type="text"
                        name="ownerLastName"
                        value={formData.ownerLastName}
                        onChange={handleChange}
                        placeholder="Owner Last Name"
                    />
                    {errors.ownerLastName && <p className="text-red-500 text-xs mt-1">{errors.ownerLastName}</p>}
                </div>
            </div>

            <div className="flex pt-4 justify-end">
                <Button
                    type="submit"
                    size="sm"
                    color="primary"
                    className="cursor-pointer"
                >
                    Update
                </Button>
            </div>
        </form>
    </div>
);
};

export default ExternalDealerEditForm;