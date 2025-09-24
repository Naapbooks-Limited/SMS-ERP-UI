"use client";
import { Button } from "@/components/ui/button";
import { Undo } from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import CallFor from "@/utilities/CallFor";
function ViewDelivery({ params }) {
  const [deliveryData, setDeliveryData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await CallFor(
          `v2/Orders/GetDeliveryById?odtid=${params.odtid}`,
          "get",
          null,
          "Auth"
        );
        // const data = await response.json();
        setDeliveryData(response.data);
      } catch (error) {
        console.error("Error fetching delivery data:", error);
      }
    };

    fetchData();
  }, []);

  if (!deliveryData) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div className="text-orange-500 text-xl font-semibold p-2">
          PO of Req. #{deliveryData.orderid}
        </div>
        <Link href="/admin/Ordering/Purchase/delivery">
          <Button color="warning" className="shadow-md">
            <Undo size={20} className="pr-1" />
            Back
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-2 p-3">
        <div className="pb-3">
          <label className="font-bold inline-block w-32 ">Warehouse</label>
          <label className="text-orange-500">{deliveryData.orgname}</label>
        </div>
        <div>
          <label className="font-bold inline-block w-32 ">PO No</label>
          <label>{deliveryData.orderno}</label>
        </div>
        <div>
          <label className="font-bold inline-block w-32 ">Total Quantity</label>
          <label>
            {deliveryData.odtitemsmappings.reduce(
              (total, item) => total + item.deliveredqty,
              0
            )}
          </label>
        </div>
        <div>
          <label className="font-bold inline-block w-32 ">Date</label>
          <label className="text-orange-500">
            {new Date(deliveryData.odtdate).toLocaleDateString()}
          </label>
        </div>
      </div>
      <div>
        <div className="py-8 mt-10 mb-7  border-t-2 border-black dark:border-white border-dashed max-w-4xl">
          <table className=" border-black dark:border-white">
            <thead>
              <tr>
                <th className="py-3 px-6 text-center">#</th>
                <th className="py-3 px-6 text-center">Product</th>
                <th className="py-3 px-6 text-center">Attributes</th>
                <th className="py-3 px-6 text-center"> Quantity</th>
                <th className="py-3 px-6 text-center">Total Accepted</th>
                <th className="py-3 px-6 text-center">Total Returned</th>
                <th className="py-3 px-6 text-center">Total Waste</th>
              </tr>
            </thead>
            <tbody>
              {deliveryData.odtitemsmappings.map((item, index) => (
                <tr key={item.odtimid}>
                  <td className="py-3 px-6 text-center">{index + 1}</td>
                  <td className="py-3 px-6 text-center">
                    {item.productname || "N/A"}
                  </td>
                  <td className="py-3 px-6 text-center">
                    {item.bcode ? `Barcode: ${item.bcode}` : ""}
                    {item.fcode ? `Fabric Code: ${item.fcode}` : ""}
                    {item.oitems?.orderitemdetails.map((v) => (
                      <li> {v.attributename + ":" + v.attrvalue} </li>
                    ))}
                  </td>
                  <td className="py-3 px-6 text-center">{item.deliveredqty}</td>
                  <td className="py-3 px-6 text-center">{item.recivedqty}</td>
                  <td className="py-3 px-6 text-center">N/A</td>
                  <td className="py-3 px-6 text-center">N/A</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default ViewDelivery;
