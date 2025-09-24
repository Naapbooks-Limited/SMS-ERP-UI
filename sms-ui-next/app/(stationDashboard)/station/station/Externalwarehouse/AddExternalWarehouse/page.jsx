"use client";
import React, { useEffect, useState } from "react";
import { Stepper, Step, StepLabel } from "@/components/ui/steps";
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
import { useMediaQuery } from "@/hooks/use-media-query";
import CallFor from "@/utilities/CallFor";
import { Undo } from "lucide-react";
import Link from "next/link";
import * as Yup from 'yup';

const ExternalDealerForm = () => {
    const router = useRouter();
    const [selectedStateName, setSelectedStateName] = useState("");
    const [selectedCountryName, setSelectedCountryName] = useState("");
    const [activeStep, setActiveStep] = useState(0);
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

    const [errors, setErrors] = useState({});
    const [states, setStates] = useState([]);
    const [countries, setCountries] = useState([]);

    const validationSchema = [
        // First step validation (no changes)
        Yup.object().shape({
            companyName: Yup.string().required("Company Name is required"),
            companyEmail: Yup.string().email("Invalid email").required("Company Email is required"),
            companyMobile: Yup.string()
                .matches(/^[0-9]{10}$/, "Company Mobile must be exactly 10 digits")
                .required("Company Mobile is required"),
        }),
        // Second step validation (updated)
        Yup.object().shape({
            companyAddress: Yup.object().shape({
                address1: Yup.string().required("Address Line 1 is required"),
                city: Yup.string().required("City is required"),
                state: Yup.number().required("State is required"),
                country: Yup.number().required("Country is required"),
                pincode: Yup.string().required("Pincode is required"),
            }),
        }),
        // Third step validation (no changes)
        Yup.object().shape({
            ownerFirstName: Yup.string().required("Owner First Name is required"),
            ownerLastName: Yup.string().required("Owner Last Name is required"),
        }),
    ];

    useEffect(() => {
        // Fetch the dropdown data from the API
        const fetchDropdownData = async () => {
            try {
                const response = await CallFor("v2/account/SaveExternalDealer");
                const data = await response.data;

                // Update the state with the fetched data
                setStates(data.dropdowns.states || []);
                setCountries(data.dropdowns.countries || []);
            } catch (error) {
                reToast({
                    title: "Error",
                    description: "Failed to load form data. Please try again.",
                    variant: "destructive",
                });
            }
        };

        fetchDropdownData();
    }, []);

    const steps = ["Company Information", "Address Information", "Owner Information"];

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
                [name]: name == 'state' || name == 'country' ? Number(value) : value,
            },
        }));
    };

    const validateStep = async () => {
        try {
            await validationSchema[activeStep].validate(formData, { abortEarly: false });
            setErrors({});
            return true;
        } catch (validationErrors) {
            const newErrors = {};
            validationErrors.inner.forEach((error) => {
                newErrors[error.path] = error.message;
            });
            setErrors(newErrors);
            return false;
        }
    };

    const handleNext = async (e) => {
        e.preventDefault();
        const isValid = await validateStep();
        if (isValid) {
            setActiveStep((prevActiveStep) => prevActiveStep + 1);
        }
    };

    const handleBack = (e) => {
        e.preventDefault();
        setActiveStep((prevActiveStep) => prevActiveStep - 1);
    };

    const handleReset = () => {
        setActiveStep(0);
        setFormData({
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
        setErrors({});
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const isValid = await validateStep();
        if (isValid) {
            try {
                const response = await CallFor(
                    "v2/account/SaveExternalDealer",
                    "post",
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
                    reToast.success("Form submitted successfully");
                    router.back();
                } else {
                    reToast.error("Failed to submit form");
                }
            } catch (error) {
                reToast.error("Failed to submit form. Please try again");
            }
        }
    };

    const isTablet = useMediaQuery("(max-width: 1024px)");

    const isNextDisabled = () => {
        if (activeStep == 0) {
            return !(formData.companyName && formData.companyEmail && formData.companyMobile);
        }
        return false;
    };

    return (
        <div className="mt-4">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold mb-4 text-orange-500">
                    Create External Vendor
                </h2>
                <Link href="/station/station/Externalwarehouse">
                    <Button color="warning" className="shadow-md">
                        <Undo size={20}></Undo>
                        Back
                    </Button>
                </Link>
            </div>

            <Stepper current={activeStep} direction={isTablet && "vertical"}>
                {steps.map((label, index) => (
                    <Step key={label}>
                        <StepLabel>{label}</StepLabel>
                    </Step>
                ))}
            </Stepper>

            {activeStep == steps.length ? (
                <>
                    <div className="mt-2 mb-2 font-semibold text-center">
                        All steps completed - you're finished
                    </div>
                    <div className="flex pt-2">
                        <div className="flex-1" />
                        <Button
                            size="xs"
                            variant="outline"
                            color="destructive"
                            className="cursor-pointer"
                            onClick={handleReset}
                        >
                            Reset
                        </Button>
                    </div>
                </>
            ) : (
                <form>
                    <div className="grid grid-cols-12 gap-4">
                        {activeStep == 0 && (
                            <>
                                <div className="col-span-12 mb-4 mt-6">
                                    <h4 className="text-sm font-medium text-default-600">
                                        Enter Company Information
                                    </h4>
                                    <p className="text-xs text-default-600 mt-1">
                                        Fill in the box with correct data
                                    </p>
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
                                    {errors.companyName && <p className="text-red-500 text-xs mt-1">{errors.companyName}</p>}
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
                                    {errors.companyEmail && <p className="text-red-500 text-xs mt-1">{errors.companyEmail}</p>}
                                </div>
                                <div className="col-span-12 lg:col-span-6 flex items-center">
                                    <label className="w-1/3 text-sm font-medium text-default-600">
                                        Company Mobile
                                    </label>
                                    <Input
                                        type="text"
                                        name="companyMobile"
                                        value={formData.companyMobile.replace(/[^0-9]/g,"")}
                                        onChange={handleChange}
                                        placeholder="Company Mobile"
                                    />
                                    {errors.companyMobile && <p className="text-red-500 text-xs mt-1">{errors.companyMobile}</p>}
                                </div>
                            </>
                        )}

                        {activeStep == 1 && (
                            <>
                                <div className="col-span-12 mt-6 mb-4">
                                    <h4 className="text-sm font-medium text-default-600">
                                        Enter Address Information
                                    </h4>
                                    <p className="text-xs text-default-600 mt-1">
                                        Fill in the box with correct data
                                    </p>
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
                                    {errors['companyAddress.address1'] && <p className="text-red-500 text-xs mt-1">{errors['companyAddress.address1']}</p>}
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
                              {/* Country Select */}
<div className="col-span-12 lg:col-span-6 flex items-center">
  <label className="w-1/2 text-sm font-medium text-default-600">
    Country
  </label>
  <Select
    name="country"
    value={formData.companyAddress.country.toString()}
    onValueChange={(value) => {
      handleAddressChange({
        target: { name: "country", value: Number(value) },
      });

      // Reset state when country changes
      setFormData((prevData) => ({
        ...prevData,
        companyAddress: {
          ...prevData.companyAddress,
          state: 0, // reset state
        },
      }));

      const selectedCountry = countries.find(
        (country) => country.id == Number(value)
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
        {countries.map((country) => (
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
  <label className="w-1/2 text-sm font-medium text-default-600">
    State
  </label>
  <Select
    name="state"
    value={formData.companyAddress.state.toString()}
    onValueChange={(value) => {
      handleAddressChange({
        target: { name: "state", value: Number(value) },
      });
      const selectedState = states.find(
        (state) => state.id == Number(value)
      );
      setSelectedStateName(selectedState ? selectedState.name : "");
    }}
    disabled={!formData.companyAddress.country} // disable until country is chosen
    className="dark:text-white"
  >
    <SelectTrigger>
      <SelectValue placeholder="Select a state" />
    </SelectTrigger>
    <SelectContent>
      <ScrollArea className="h-[200px] text-black dark:text-white">
        {states
          .filter(
            (state) =>
              state.countryId == formData.companyAddress.country // filter by selected country
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
                                    {errors['companyAddress.city'] && <p className="text-red-500 text-xs mt-1">{errors['companyAddress.city']}</p>}
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
                                    {errors['companyAddress.pincode'] && <p className="text-red-500 text-xs mt-1">{errors['companyAddress.pincode']}</p>}
                                </div>
                            </>
                        )}

                        {activeStep == 2 && (
                            <>
                                <div className="col-span-12 mt-6 mb-4">
                                    <h4 className="text-sm font-medium text-default-600">
                                        Enter Owner Information
                                    </h4>
                                    <p className="text-xs text-default-600 mt-1">
                                        Fill in the box with correct data
                                    </p>
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
                                    {errors.ownerFirstName && <p className="text-red-500 text-xs mt-1">{errors.ownerFirstName}</p>}
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
                                    {errors.ownerLastName && <p className="text-red-500 text-xs mt-1">{errors.ownerLastName}</p>}
                                </div>
                            </>
                        )}
                    </div>

                    <div className="flex pt-4">
                        {activeStep !== 0 && (
                            <Button
                                size="xs"
                                variant="outline"
                                color="destructive"
                                onClick={handleBack}
                            >
                                Back
                            </Button>
                        )}
                        <div className="flex-1" />
                        <Button
                            size="xs"
                            color="primary"
                            className="cursor-pointer"
                            onClick={activeStep == steps.length - 1 ? handleSubmit : handleNext}
                            disabled={isNextDisabled()}
                        >
                            {activeStep == steps.length - 1 ? "Finish" : "Next"}
                        </Button>
                    </div>
                </form>
            )}
        </div>
    );
};

export default ExternalDealerForm;
                                         