"use client";
import React, { useEffect, useState } from "react";
import { toast as reToast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
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

const ExternalDealerEditForm = () => {
    const router = useRouter();
    const [selectedStateName, setSelectedStateName] = useState("");
    const [selectedCountryName, setSelectedCountryName] = useState("");
    const [formData, setFormData] = useState({
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

    const [states, setStates] = useState([]);
    const [countries, setCountries] = useState([]);

    useEffect(() => {
        // Fetch the dropdown data and existing dealer data from the API
        const fetchData = async () => {
            try {
                const [dropdownResponse, dealerResponse] = await Promise.all([
                    CallFor("v2/account/SaveExternalDealer"),
                    CallFor("v2/account/GetExternalDealer/1") // Assuming '1' is the dealer ID, replace with actual ID
                ]);

                const dropdownData = dropdownResponse.data;
                const dealerData = dealerResponse.data;

                // Update the state with the fetched data
                setStates(dropdownData.dropdowns.states || []);
                setCountries(dropdownData.dropdowns.countries || []);

                // Populate form data with existing dealer information
                setFormData({
                    companyName: dealerData.companyName,
                    companyEmail: dealerData.companyEmail,
                    companyMobile: dealerData.companyMobile,
                    companyAddress: dealerData.companyAddress,
                    ownerFirstName: dealerData.ownerFirstName,
                    ownerLastName: dealerData.ownerLastName,
                });

                // Set selected state and country names
                const selectedState = states.find(state => state.id === dealerData.companyAddress.state);
                const selectedCountry = countries.find(country => country.id === dealerData.companyAddress.country);
                setSelectedStateName(selectedState ? selectedState.name : "");
                setSelectedCountryName(selectedCountry ? selectedCountry.name : "");

            } catch (error) {
                reToast.error("Failed to load form data. Please try again.");
            }
        };

        fetchData();
    }, []);

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
            const response = await CallFor(
                "v2/account/UpdateExternalDealer",
                "put",
                {
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
                        Addridentifier: formData.companyName,
                        Maplocation: formData.companyAddress.maplocation,
                        Latitude: formData.companyAddress.latitude,
                        Longitude: formData.companyAddress.longitude,
                        Qrcode: formData.companyAddress.qrcode,
                        UserOrgAddressMappings: formData.companyAddress.userorgaddressmappings,
                    },
                    OwnerFirstName: formData.ownerFirstName,
                    OwnerLastName: formData.ownerLastName,
                },
                "Auth"
            );

            if (response) {
                reToast.success("Form updated successfully");
                router.push("/station/Purchase/Externalwarehouse");
            } else {
                reToast.error("Failed to update form");
            }
        } catch (error) {
            reToast.error("Failed to update form. Please try again");
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
                        <h4 className="text-sm font-medium text-default-600">
                            Company Information
                        </h4>
                    </div>
                    <div className="col-span-12 lg:col-span-6 flex items-center">
                        <label className="w-1/3 text-sm font-medium text-default-600">
                            Company Name
                        </label>
                        <Input
                            type="text"
                            name="companyName"
                            value={formData.companyName}
                            onChange={handleChange}
                            placeholder="Company Name"
                        />
                    </div>
                    <div className="col-span-12 lg:col-span-6 flex items-center">
                        <label className="w-1/3 text-sm font-medium text-default-600">
                            Company Email
                        </label>
                        <Input
                            type="email"
                            name="companyEmail"
                            value={formData.companyEmail}
                            onChange={handleChange}
                            placeholder="Company Email"
                        />
                    </div>
                    <div className="col-span-12 lg:col-span-6 flex items-center">
                        <label className="w-1/3 text-sm font-medium text-default-600">
                            Company Mobile
                        </label>
                        <Input
                            type="tel"
                            name="companyMobile"
                            value={formData.companyMobile}
                            onChange={handleChange}
                            placeholder="Company Mobile"
                        />
                    </div>

                    <div className="col-span-12 mt-6 mb-4">
                        <h4 className="text-sm font-medium text-default-600">
                            Address Information
                        </h4>
                    </div>
                    <div className="col-span-12 lg:col-span-6 flex items-center">
                        <label className="w-1/3 text-sm font-medium text-default-600">
                            Address Line 1
                        </label>
                        <Input
                            type="text"
                            name="address1"
                            value={formData.companyAddress.address1}
                            onChange={handleAddressChange}
                            placeholder="Address Line 1"
                        />
                    </div>
                    <div className="col-span-12 lg:col-span-6 flex items-center">
                        <label className="w-1/3 text-sm font-medium text-default-600">
                            Address Line 2
                        </label>
                        <Input
                            type="text"
                            name="address2"
                            value={formData.companyAddress.address2}
                            onChange={handleAddressChange}
                            placeholder="Address Line 2"
                        />
                    </div>
                    <div className="col-span-12 lg:col-span-6 flex items-center">
                        <label className="w-1/3 text-sm font-medium text-default-600">
                            City
                        </label>
                        <Input
                            type="text"
                            name="city"
                            value={formData.companyAddress.city}
                            onChange={handleAddressChange}
                            placeholder="City"
                        />
                    </div>
                    <div className="col-span-12 lg:col-span-6 flex items-center">
                        <label className="w-1/2 text-sm font-medium text-default-600">
                            State
                        </label>
                        <Select
                            name="state"
                            value={formData.companyAddress.state.toString()}
                            onValueChange={(value) => {
                                handleAddressChange({
                                    target: { name: "state", value },
                                });
                                const selectedState = states.find(state => state.id.toString() === value);
                                setSelectedStateName(selectedState ? selectedState.name : "");
                            }}
                            className="text-black"
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select a state" />
                            </SelectTrigger>
                            <SelectContent>
                                <ScrollArea className="h-[200px] text-black">
                                    {states.map((state) => (
                                        <SelectItem key={state.id} value={state.id.toString()}>
                                            {state.name}
                                        </SelectItem>
                                    ))}
                                </ScrollArea>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="col-span-12 lg:col-span-6 flex items-center">
                        <label className="w-1/2 text-sm font-medium text-default-600">
                            Country
                        </label>
                        <Select
                            name="country"
                            value={formData.companyAddress.country.toString()}
                            onValueChange={(value) => {
                                handleAddressChange({
                                    target: { name: "country", value },
                                });
                                const selectedCountry = countries.find(country => country.id.toString() === value);
                                setSelectedCountryName(selectedCountry ? selectedCountry.name : "");
                            }}
                            className="text-black"
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select a country" />
                            </SelectTrigger>
                            <SelectContent>
                                <ScrollArea className="h-[200px] text-black">
                                    {countries.map((country) => (
                                        <SelectItem key={country.id} value={country.id.toString()}>
                                            {country.name}
                                        </SelectItem>
                                    ))}
                                </ScrollArea>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="col-span-12 lg:col-span-6 flex items-center">
                        <label className="w-1/3 text-sm font-medium text-default-600">
                            Pincode
                        </label>
                        <Input
                            type="text"
                            name="pincode"
                            value={formData.companyAddress.pincode}
                            onChange={handleAddressChange}
                            placeholder="Pincode"
                        />
                    </div>

                    <div className="col-span-12 mt-6 mb-4">
                        <h4 className="text-sm font-medium text-default-600">
                            Owner Information
                        </h4>
                    </div>
                    <div className="col-span-12 lg:col-span-6 flex items-center">
                        <label className="w-1/3 text-sm font-medium text-default-600">
                            Owner First Name
                        </label>
                        <Input
                            type="text"
                            name="ownerFirstName"
                            value={formData.ownerFirstName}
                            onChange={handleChange}
                            placeholder="Owner First Name"
                        />
                    </div>
                    <div className="col-span-12 lg:col-span-6 flex items-center">
                        <label className="w-1/3 text-sm font-medium text-default-600">
                            Owner Last Name
                        </label>
                        <Input
                            type="text"
                            name="ownerLastName"
                            value={formData.ownerLastName}
                            onChange={handleChange}
                            placeholder="Owner Last Name"
                        />
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