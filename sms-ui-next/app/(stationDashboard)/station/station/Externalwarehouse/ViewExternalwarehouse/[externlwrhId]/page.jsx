"use client";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useParams, useRouter } from "next/navigation";
import CallFor from "@/utilities/CallFor";
import { Undo } from "lucide-react";
import Link from "next/link";

const ExternalDealerView = () => {
    const router = useRouter();
    const [dealerData, setDealerData] = useState(null);
    const [states, setStates] = useState([]);
    const [countries, setCountries] = useState([]);
    const param = useParams();

    useEffect(() => {

        fetchDealerData();
        fetchDropdownData();
    }, []);

    const fetchDealerData = async () => {
        try {
            // Replace this with the actual API call to fetch the dealer data
            const response = await CallFor(`v2/account/GetExternalDealerById?Id=${param?.externlwrhId}`, 'GET', null, 'Auth');
            if (response?.status === 200) {
                console.log(response?.data?.data, "responsedata")
                setDealerData(response?.data?.data);
            }
        } catch (error) {
            console.error("Failed to load dealer data", error);
        }
    };

    const fetchDropdownData = async () => {
        try {
            const response = await CallFor("v2/account/SaveExternalDealer");
            const data = await response.data;
            setStates(data.dropdowns.states || []);
            setCountries(data.dropdowns.countries || []);
        } catch (error) {
            console.error("Failed to load form data", error);
        }
    };
    const getStateName = (stateId) => {
        const state = states.find(s => s.id === stateId);
        return state ? state.name : "Unknown";
    };

    const getCountryName = (countryId) => {
        const country = countries.find(c => c.id === countryId);
        return country ? country.name : "Unknown";
    };

    // if (!dealerData) {
    //     return <div>Loading...</div>;
    // }

    return (
        <>
            <div className="mt-4">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold mb-4 text-orange-500">
                        External Vendor Details
                    </h2>
                    <Link href="/station/station/Externalwarehouse">
                        <Button color="warning" className="shadow-md">
                            <Undo size={20}></Undo>
                            Back
                        </Button>
                    </Link>
                </div>

                <ScrollArea className="h-[calc(100vh-200px)] pr-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <section>
                            <h3 className="text-lg font-semibold mb-4">Company Information</h3>
                            <div className="space-y-2">
                                <p className="flex"><strong>Company Name:</strong> {dealerData?.companyName}</p>
                                <p><strong>Company Email:</strong> {dealerData?.companyEmail}</p>
                                <p><strong>Company Mobile:</strong> {dealerData?.companyMobile}</p>
                            </div>
                        </section>

                        <section>
                            <h3 className="text-lg font-semibold mb-4">Owner Information</h3>
                            <div className="space-y-2">
                                <p><strong>Owner First Name:</strong> {dealerData?.ownerFirstName}</p>
                                <p><strong>Owner Last Name:</strong> {dealerData?.ownerLastName}</p>
                            </div>
                        </section>

                        <section>
                            <h3 className="text-lg font-semibold mb-4">Address Information</h3>
                            <div className="space-y-2">
                                <p><strong>Address :</strong> {dealerData?.companyAddress.address1}</p>
                                <p><strong>City:</strong> {dealerData?.companyAddress.city}</p>
                                <p><strong>State:</strong> {getStateName(dealerData?.companyAddress.state)}</p>
                                <p><strong>Country:</strong> {getCountryName(dealerData?.companyAddress.country)}</p>
                                <p><strong>Pincode:</strong> {dealerData?.companyAddress.pincode}</p>
                            </div>
                        </section>

                        {/* <section>
                        <h3 className="text-lg font-semibold mb-4">Additional Information</h3>
                        <div className="space-y-2">
                            <p><strong>Address Identifier:</strong> {dealerData?.companyAddress.addridentifier}</p>
                            <p><strong>Map Location:</strong> {dealerData?.companyAddress.maplocation || "N/A"}</p>
                            <p><strong>Latitude:</strong> {dealerData?.companyAddress.latitude || "N/A"}</p>
                            <p><strong>Longitude:</strong> {dealerData?.companyAddress.longitude || "N/A"}</p>
                        </div>
                    </section> */}
                    </div>
                </ScrollArea>
            </div>
        </>
    );
};

export default ExternalDealerView;