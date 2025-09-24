"use client"
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import CallFor from '@/utilities/CallFor'
import { Undo2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'

const CustomerDetail = ({ params }) => {
    const router = useRouter();
    const [data, setData] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const response = await CallFor(
                    `v2/users/GetUserById?uid=${params.uid}`,
                    "GET",
                    null,
                    "Auth"
                );
                setData(response.data);
            } catch (error) {
                setError(error);
            } finally {
                setLoading(false);
            }
        };

        if (params.uid) {
            fetchData();
        }
    }, [params.uid]);

    if (loading) {
        return <div className="text-center">Loading...</div>;
    }

    if (error) {
        return <div className="text-center text-red-500">Failed to load data</div>;
    }

    return (
        <div className="container mx-auto p-6 bg-white shadow-md rounded-lg dark:bg-gray-800">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-semibold text-orange-500">Customer Details</h1>
                <Button
                    variant="warning"
                    className="flex items-center gap-2"
                    onClick={() => router.push("/station/station/customer")}
                >
                    <Undo2 size={20} />
                    Back
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center">
                    <label className="font-semibold w-1/3 text-blue-900 dark:text-white">First Name</label>
                    <p className="text-blue-900 dark:text-white">: {data.firstname}</p>
                </div>

                <div className="flex items-center">
                    <label className="font-semibold w-1/3 text-blue-900 dark:text-white">Last Name</label>
                    <p className="text-blue-900 dark:text-white">: {data.lastname}</p>
                </div>

                <div className="flex items-center">
                    <label className="font-semibold w-1/3 text-blue-900 dark:text-white">Phone No</label>
                    <p className="text-blue-900 dark:text-white">: {data.mobno}</p>
                </div>

                <div className="flex items-center">
                    <label className="font-semibold w-1/3 text-blue-900 dark:text-white">Email ID</label>
                    <p className="text-blue-900 dark:text-white">: {data.emailid}</p>
                </div>

                <div className="flex items-center">
                    <label className="font-semibold w-1/3 text-blue-900 dark:text-white">Password</label>
                    <p className="text-blue-900 dark:text-white">: {data.password}</p>
                </div>

                <div className="flex items-center">
                    <label className="font-semibold w-1/3 text-blue-900 dark:text-white">Is Active</label>
                    <p className="text-blue-900 dark:text-white">: {data.isActive ? "Yes" : "No"}</p>
                </div>
            </div>
        </div>
    );
}

export default CustomerDetail;
