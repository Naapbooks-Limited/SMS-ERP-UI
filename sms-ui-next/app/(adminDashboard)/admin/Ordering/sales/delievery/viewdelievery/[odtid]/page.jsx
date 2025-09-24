"use client";
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Undo } from 'lucide-react';
import Link from "next/link";
import CallFor from "@/utilities/CallFor";

export default function ViewDelivery({ params }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await CallFor(
          `v2/Orders/GetDeliveryById?odtid=${params.odtid}`,
          "GET",
          null,
          "Auth"
        );
        setData(response.data);
        setLoading(false);
      } catch (error) {
        setError(error);
        setLoading(false);
      }
    };

    if (params.odtid) {
      fetchData();
    }
  }, [params.odtid]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!data) return null;

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <div className="text-orange-500 text-xl font-semibold">
          Delivery Details
        </div>
        <Link href="/admin/Ordering/sales/delievery">
          <Button color="warning" className="shadow-md">
            <Undo size={20} className="mr-2" />
            Back
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 border-b-2 border-dashed border-black pb-5 mb-6">
        <div>
          <span className="font-bold">Delivery No: </span>
          <span>{params.odtid}</span>
        </div>
        <div>
          <span className="font-bold">Station: </span>
          {/* <span>{data?.orgname}</span> */}
        </div>
        <div>
          <span className="font-bold">SO No: </span>
          <span>{data?.orderid}</span>
        </div>
        <div>
          <span className="font-bold">Total Quantity: </span>
          <span>{data?.odtitemsmappings?.reduce((sum, item) => sum + item.itemqty, 0) || 0}</span>
        </div>
        <div>
          <span className="font-bold">Date: </span>
          <span>{data?.odtdate ? new Date(data.odtdate).toLocaleDateString() : ''}</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="">
              <th className="py-3 px-6 text-left">#</th>
              <th className="py-3 px-6 text-left">Product</th>
              <th className="py-3 px-6 text-left">Attributes</th>
              <th className="py-3 px-6 text-center">Quantity</th>
              <th className="py-3 px-6 text-center">Total Accepted</th>
              <th className="py-3 px-6 text-center">Total Received</th>
            </tr>
          </thead>
          <tbody>
            {data?.odtitemsmappings?.map((item, index) => (
              <tr key={item.odtimid}>
                <td className="py-3 px-6">{index + 1}</td>
                <td className="py-3 px-6">{item.oitems?.proname}</td>
                <td className="py-3 px-6">
                  {item.oitems?.orderitemdetails?.map(attr => 
                    `${attr.attributename}: ${attr.attrvalue}`
                  ).join(', ')}
                </td>
                <td className="py-3 px-6 text-center">{item.itemqty}</td>
                <td className="py-3 px-6 text-center">{item.deliveredqty}</td>
                <td className="py-3 px-6 text-center">{item.recivedqty}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
