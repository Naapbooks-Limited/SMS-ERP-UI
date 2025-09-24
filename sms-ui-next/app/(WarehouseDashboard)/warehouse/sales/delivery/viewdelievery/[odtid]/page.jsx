"use client";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Undo } from "lucide-react";
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
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    if (params.odtid) fetchData();
  }, [params.odtid]);

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error.message}</div>;
  if (!data) return null;

  return (
    <div className="p-6 bg-white rounded-md max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-semibold text-orange-500">Delivery Details</h1>
        <Link href="/warehouse/sales/delivery">
          <Button className="bg-orange-500 text-white hover:bg-orange-600">
            <Undo size={18} className="mr-2" />
            Back
          </Button>
        </Link>
      </div>

      {/* Info Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-b-2 border-dashed border-black pb-5 mb-6 text-sm">
        <div>
          <span className="font-bold">Delivery No:</span> {params.odtid}
        </div>
        <div>
          <span className="font-bold">Station:</span> {data?.orgname || "N/A"}
        </div>
        <div>
          <span className="font-bold">SO No:</span> {data?.orderid || "N/A"}
        </div>
        <div>
          <span className="font-bold">Total Quantity:</span>{" "}
          {data?.odtitemsmappings.reduce((sum, item) => sum + item.itemqty, 0)}
        </div>
        <div>
          <span className="font-bold">Date:</span>{" "}
          {new Date(data.odtdate).toLocaleDateString()}
        </div>
      </div>

      {/* Table Section */}
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-300 text-sm">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th scope="col" className="py-2 px-4 text-left border">#</th>
              <th scope="col" className="py-2 px-4 text-left border">Product</th>
              <th scope="col" className="py-2 px-4 text-left border">Attributes</th>
              <th scope="col" className="py-2 px-4 text-center border">Quantity</th>
              <th scope="col" className="py-2 px-4 text-center border">Delivered</th>
              <th scope="col" className="py-2 px-4 text-center border">Received</th>
            </tr>
          </thead>
          <tbody>
            {data.odtitemsmappings.map((item, index) => (
              <tr key={item.odtimid} className="hover:bg-gray-50">
                <td className="py-2 px-4 border">{index + 1}</td>
                <td className="py-2 px-4 border">{item.oitems?.proname || "N/A"}</td>
                <td className="py-2 px-4 border">
              {item.oitems?.orderitemdetails.map((attr, i) => (
  <span key={i} className="block">
    {attr.attributename}: <span className="text-orange-500">{attr.attrvalue}</span>
  </span>
))}
                </td>
                <td className="py-2 px-4 border text-center">{item.itemqty}</td>
                <td className="py-2 px-4 border text-center">{item.deliveredqty}</td>
                <td className="py-2 px-4 border text-center">{item.recivedqty}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
