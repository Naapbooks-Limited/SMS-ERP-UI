"use client"
import { Button } from "@/components/ui/button";
import CallFor from "@/utilities/CallFor";
import { Undo } from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState } from "react";

function viewreturn({ params }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await CallFor(
          `v2/Orders/GetOrderReturnById?returnId=${params.odtid}`,
          "get",
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

    fetchData();
  }, [params.odtid]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!data) return null;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div className="text-orange-500 text-xl font-semibold p-2">
          Returns from PO
        </div>
        <Link href="/admin/Ordering/Purchase/returns">
          <Button color="warning" className="shadow-md">
            <Undo size={20} className="pr-1" />
            Back
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-2 pl-3 pt-3 border-b-2 border-dashed border-black max-w-4xl pb-5 ">
        <div className="pb-3">
          <label className="font-bold inline-block w-1/4 ">PO No </label>
          <label> {data.odtitemsmapping.oitems.orderid}</label>
        </div>
        <div>
          <label className="font-bold inline-block w-1/4 "> Date : </label>
          <label>
            {data.createddate ? new Date(data.createddate).toLocaleDateString() : "No date available"}
          </label>
        </div>
        <div>
          <label className="font-bold inline-block w-1/4 ">Station </label>
          <label> N/A</label>
        </div>
        <div>
          <label className="font-bold inline-block w-1/4 ">
            Return Quantity
          </label>
          <label> {data.returnquantity}</label>
        </div>
      </div>
      <div>
        <div className="pl-5 mt-8">
          <table className="w-full">
            <thead>
              <tr>
                <th className="py-3 px-6 text-center">#</th>
                <th className="py-3 px-6 text-center">Select Product</th>
                <th className="py-3 px-6 text-center">Attributes</th>
                <th className="py-3 px-6 text-center">Quantity</th>
                <th className="py-3 px-6 text-center">TOTAL ACCEPTED</th>
                <th className="py-3 px-6 text-center">TOTAL Return</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="py-3 px-6 text-center">1</td>
                <td className="py-3 px-6 text-center">{data.odtitemsmapping.oitems.pvname}</td>
                <td className="py-3 px-6 text-center">
                  {data.odtitemsmapping.oitems.orderitemdetails.map(detail =>
                    `${detail.attributename}: ${detail.attrvalue}`
                  ).join(', ')}
                </td>
                <td className="py-3 px-6 text-center">{data.odtitemsmapping.oitems.deliveredqty}</td>
                <td className="py-3 px-6 text-center">{data.odtitemsmapping.oitems.recivedqty}</td>
                <td className="py-3 px-6 text-center">{data.returnquantity}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default viewreturn;