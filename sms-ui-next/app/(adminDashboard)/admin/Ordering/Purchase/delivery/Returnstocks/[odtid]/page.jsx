"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Undo } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast as reToast } from "react-hot-toast";
import CallFor from "@/utilities/CallFor";

function Returnstocks({ params }) {
  const [deliveryData, setDeliveryData] = useState(null);
  const [returnQuantities, setReturnQuantities] = useState({});
  const [returnReasons, setReturnReasons] = useState({});

  const router = useRouter();

  useEffect(() => {
    CallFor(
      `v2/Orders/GetDeliveryById?odtid=${params.odtid}`,
      "get",
      null,
      "Auth"
    )
      .then((response) => response.data)
      .then((data) => {
        setDeliveryData(data);
        const initialQuantities = {};
        const initialReasons = {};
        data.odtitemsmappings.forEach((item) => {
          initialQuantities[item.odtimid] = 0;
          initialReasons[item.odtimid] = "";
        });
        setReturnQuantities(initialQuantities);
        setReturnReasons(initialReasons);
      })
      .catch((error) => console.error("Error fetching data:", error));
  }, [params.odtid]);

  const handleQuantityChange = (odtimid, value) => {
    setReturnQuantities((prev) => ({ ...prev, [odtimid]: value }));
  };

  const handleReasonChange = (odtimid, value) => {
    setReturnReasons((prev) => ({ ...prev, [odtimid]: value }));
  };

  const handleSubmit = async () => {
    const orderReturns = deliveryData.odtitemsmappings
      .map((item) => ({
        ReturnId: 0,
        Odtitemsmappingid: item.odtimid,
        Returnquantity: parseFloat(returnQuantities[item.odtimid]),
        Returnreason: returnReasons[item.odtimid],
        Returnstatus: 1,
        ReturnstatusName: "Pending",
        Createdby: deliveryData.createdby,
        Createddate: new Date().toISOString(),
        Approvedby: null,
        Approveddate: null,
      }))
      .filter((item) => item.Returnquantity > 0);

    const response = await CallFor(
      "v2/Orders/CreateReturn",
      "post",
      { orderReturns },
      "Auth"
    );

    if (response) {
      reToast.success("Return stock update");
      router.push("/admin/Ordering/Purchase/delivery");
    }
  };

  if (!deliveryData) return <div>Loading...</div>;

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <div className="text-orange-500 text-xl font-semibold">
          RETURN STOCK
        </div>
        <Link href="/admin/Ordering/Purchase/delivery">
          <Button color="warning" className="shadow-md">
            <Undo size={20} className="mr-2" />
            Back
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <div>
          <label className="font-bold inline-block w-32">Warehouse</label>
          <span className="text-orange-300">{deliveryData.orgname}</span>
        </div>
        <div>
          <label className="font-bold inline-block w-32">PO No</label>
          <span>{deliveryData.orderno}</span>
        </div>
        <div>
          <label className="font-bold inline-block w-32">Total Quantity</label>
          <span>
            {deliveryData.odtitemsmappings.reduce(
              (total, item) => total + item.itemqty,
              0
            )}
          </span>
        </div>
        <div>
          <label className="font-bold inline-block w-32">Delivery Date</label>
          <input
            type="date"
            className="border border-gray-300 p-2 rounded"
            defaultValue={
              new Date(deliveryData.odtexpdeldate).toISOString().split("T")[0]
            }
          />
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Previous Returns</h2>
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 border">No</th>
              <th className="p-2 border">Product</th>
              <th className="p-2 border">Attributes</th>
              <th className="p-2 border">Quantity in Delivery</th>
              <th className="p-2 border">Returned Quantity</th>
              <th className="p-2 border">Return Reason</th>
            </tr>
          </thead>
          <tbody>
            {deliveryData.odtitemsmappings.map(
              (item) =>
                item.orderReturns &&
                item.orderReturns.map((orderReturn, i) => (
                  <tr key={`${item.odtimid}-return-${i}`}>
                    <td className="p-2 border">{orderReturn.returnId}</td>{" "}
                    {/* Display ReturnId */}
                    <td className="p-2 border">{item.oitems.proname}</td>
                    <td className="p-2 border">
                      {item.bcode ? `Barcode: ${item.bcode}` : ""}
                      {item.fcode ? `Fabric Code: ${item.fcode}` : ""}
                      {item.oitems?.orderitemdetails.map((v) => (
                        <li> {v.attributename + ":" + v.attrvalue} </li>
                      ))}
                    </td>
                    <td className="p-2 border text-center">
                      {item.deliveredqty}
                    </td>
                    <td className="p-2 border text-center">
                      {orderReturn.returnquantity}
                    </td>
                    <td className="p-2 border">{orderReturn.returnreason}</td>
                  </tr>
                ))
            )}
          </tbody>
        </table>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4">Add New Return</h2>
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 border">Product</th>
              <th className="p-2 border">Attributes</th>
              <th className="p-2 border">Quantity in Delivery</th>
              <th className="p-2 border">Return Quantity</th>
              <th className="p-2 border">Return Reason</th>
            </tr>
          </thead>
          <tbody>
            {deliveryData.odtitemsmappings.map((item) => (
              <tr key={item.odtimid}>
                <td className="p-2 border">{item.oitems.proname}</td>
                <td className="p-2 border">
                  {item.bcode ? `Barcode: ${item.bcode}` : ""}
                  {item.fcode ? `Fabric Code: ${item.fcode}` : ""}
                  {item.oitems.orderitemdetails
                    .map(
                      (detail) => `${detail.attributename}: ${detail.attrvalue}`
                    )
                    .join(", ")}
                </td>
                <td className="p-2 border text-center">{item.deliveredqty}</td>
                <td className="p-2 border text-center">
                  <input
                    type="number"
                    className="w-20 p-1 border rounded"
                    value={returnQuantities[item.odtimid]}
                    onChange={(e) =>
                      handleQuantityChange(item.odtimid, e.target.value)
                    }
                    max={item.deliveredqty}
                  />
                </td>
                <td className="p-2 border">
                  <input
                    type="text"
                    className="w-full p-1 border rounded"
                    value={returnReasons[item.odtimid]}
                    onChange={(e) =>
                      handleReasonChange(item.odtimid, e.target.value)
                    }
                    placeholder="Enter reason"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end mt-6">
        <Link href="/admin/Ordering/Purchase/delivery">
          <Button className="bg-gray-300 text-gray-800 mr-2">Cancel</Button>
        </Link>
        <Button color="warning" className="text-white" onClick={handleSubmit}>
          Save
        </Button>
      </div>
    </div>
  );
}

export default Returnstocks;
