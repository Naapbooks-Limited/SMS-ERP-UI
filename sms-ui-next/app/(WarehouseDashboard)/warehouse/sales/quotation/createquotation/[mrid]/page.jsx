"use client"
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Undo } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from "next/navigation";
import CallFor from "@/utilities/CallFor";
import { toast } from "react-hot-toast";

function ViewQuotation({ params }) {
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await CallFor(`v2/Orders/GetMaterialRequestbyId?mrid=${params.mrid}`, "get", null, "Auth");
        if (response) {
          setData(response.data);
        } else {
          router.push('/warehouse/sales/quotation');
        }
      } catch (error) {
        setErrors(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params.mrid, router]);

  const handleInputChange = (mriid, field, value) => {
    setData(prevData => ({
      ...prevData,
      materialrequestitems: prevData.materialrequestitems.map(item => {
        if (item.mriid === mriid) {
          if (field === 'avialableitemqty') {
            // Ensure available quantity doesn't exceed requested quantity
            const newValue = Math.min(parseFloat(value) || 0, item.itemqty);
            return { ...item, [field]: newValue };
          } else {
            return { ...item, [field]: parseFloat(value) || 0 };
          }
        }
        return item;
      })
    }));
  };

  const updateQuote = async () => {
    try {
      setLoading(true);
      const requestBody = {
        ...data,
        materialrequestitems: data.materialrequestitems.map(item => ({
          ...item,
          avialableitemqty: item.avialableitemqty || item.itemqty,
          price: item.price
        }))
      };

      const response = await CallFor(
        "v2/Orders/UpdateMaterialRequest",
        "post",
        requestBody,
        "Auth"
      );

      if (response) {
        toast.success("Quote Created successfully!");
        router.push('/warehouse/sales/quotation');
      } else {
        toast.error("Failed to update quote. Please try again.");
      }
    } catch (error) {
      console.error("Error updating quote:", error);
      toast.error("An error occurred while updating the quote.");
    } finally {
      setLoading(false);
    }
  };

  const getAttributes = (mridetails) => {
    if (!mridetails || mridetails.length === 0) return 'N/A';
    return (
      <div className="space-y-1">
        {mridetails.map((detail, index) => (
          <div key={index} className="flex items-center">
            <span className="text-gray-600 font-medium">{detail.attributename || 'Attribute'}</span>
            <span className="mx-1">:</span>
            <span className="text-orange-500">{detail.attrvalue}</span>
          </div>
        ))}
      </div>
    );
  };

  const calculateTotalPrice = () => {
    if (!data || !data.materialrequestitems) return 0;
    return data.materialrequestitems.reduce((total, item) => {
      return total + (item.avialableitemqty * item.price);
    }, 0);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (Object.keys(errors).length > 0) {
    return <div>Error: {errors.message || "An error occurred while fetching data."}</div>;
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-orange-500 text-2xl font-semibold">Requisition Details</h1>
        <Link href="/warehouse/sales/quotation">
          <Button variant="outline" className="flex items-center">
            <Undo size={16} className="mr-2" />
            Back
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <span className="font-bold">Req. Date:</span> {new Date(data?.mrdate).toLocaleDateString()}
        </div>
        <div>
          <span className="font-bold">Due Date:</span> {new Date(data?.mrrequireddate).toLocaleDateString()}
        </div>
        <div>
          <span className="font-bold">Source Station:</span> {data?.sourceOrgName || 'N/A'}
        </div>
        <div>
        <span className="font-bold">Status:</span>{" "}
{data?.status == 78 ? (
  <span className="border-2 border-yellow-500 inline-block text-yellow-500 px-2 rounded-full">Pending</span>
) : data?.status == 79 ? (
  <span className="border-2 border-gray-500 inline-block text-gray-500 px-2 rounded-full">QuoteSent</span>
) : data?.status == 106 ? (
  <span className="border-2 border-red-500 inline-block text-red-500 px-2 rounded-full">Quote Rejected</span>
) : data?.status == 80 ? (
  <span className="border-2 border-green-500 inline-block text-green-500 px-2 rounded-full">SO Received</span>
) : data?.status == 107 ? (
  <span className="border-2 border-red-500 inline-block text-red-500 px-2 rounded-full">Cannot Fulfill</span>
) : (
  <span className="border-2 border-gray-500 inline-block text-gray-500 px-2 rounded-full">N/A</span>
)}

        </div>
      </div>

      <h2 className="text-2xl text-orange-400 mt-7 mb-4">Requested Items</h2>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100 dark:text-black">
              <th className="p-2 text-left">#</th>
              <th className="p-2 text-left">Item</th>
              <th className="p-2 text-left">Attributes</th>
              <th className="p-2 text-left">Requested Qty</th>
              <th className="p-2 text-left">Available Qty</th>
              <th className="p-2 text-left">Quoted Price</th>
            </tr>
          </thead>
          <tbody>
            {data?.materialrequestitems.map((item, index) => (
              <tr key={item.mriid} className="border-b">
                <td className="p-2">{index + 1}</td>
                <td className="p-2">{item.proName || 'N/A'}</td>
                <td className="p-2 min-w-[200px]">{getAttributes(item.mridetails)}</td>
                <td className="p-2">{item.itemqty || 'N/A'}</td>
                <td className="p-2">
                  <Input
                    type="number"
                    value={item.avialableitemqty || ''}
                    onChange={(e) => handleInputChange(item.mriid, 'avialableitemqty', e.target.value)}
                    min="0"
                    max={item.itemqty}
                    className="w-full"
                  />
                </td>
                <td className="p-2">
                  <Input
                    type="number"
                    value={item.price || ''}
                    onChange={(e) => handleInputChange(item.mriid, 'price', e.target.value)}
                    min="0"
                    step="0.01"
                    className="w-full"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end items-center mt-6">
        {/* <div className="space-x-4">
          <Button onClick={() => router.push('/warehouse/sales/quotation')} variant="outline">Cancel</Button>
          <Button onClick={updateQuote} className="bg-orange-400 text-white hover:bg-orange-500">Update Quote</Button>
        </div> */}
        <div className="text-right">
          <p className="text-sm font-semibold">Total Price:</p>
          <p className="text-sm text-orange-500 font-bold">{calculateTotalPrice().toFixed(2)}</p>
        </div>
      </div>

      <div className="flex justify-end items-center mt-6">
        <div className="space-x-4">
          <Button onClick={() => router.push('/warehouse/sales/quotation')} variant="outline">Cancel</Button>
          <Button onClick={updateQuote} className="bg-orange-400 text-white hover:bg-orange-500">Confirm Quote</Button>
        </div>
        
      </div>
    </div>
  );
}

export default ViewQuotation;