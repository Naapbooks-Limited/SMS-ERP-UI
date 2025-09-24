"use client";
import { Button } from "@/components/ui/button";
import CallFor from "@/utilities/CallFor";
import { Delete, Trash, Undo } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import { toast as reToast } from "react-hot-toast";

function AcceptStocks({ params }) {
  const [deliveryData, setDeliveryData] = useState(null);
  const [acceptedQuantities, setAcceptedQuantities] = useState({});
  const router = useRouter();
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await CallFor(
          `v2/Orders/GetDeliveryById?odtid=${params.odtid}`,
          "get",
          null,
          "Auth"
        );
        const data = await response.data;
        setDeliveryData(data);
        // Initialize acceptedQuantities with the current received quantities
        const initialQuantities = {};
        data.odtitemsmappings.forEach((item) => {
          initialQuantities[item.odtimid] = item.recivedqty;
        });
        setAcceptedQuantities(initialQuantities);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const handleQuantityChange = (odtimid, quantity, deliveredQty) => {
    const parsedQuantity = parseFloat(quantity);
    if (parsedQuantity > deliveredQty) {
      reToast.error(
        "Accepted Quantity should be less than or equal to Quantity in Delivery"
      );
      return;
    }
    setAcceptedQuantities((prev) => ({
      ...prev,
      [odtimid]: parsedQuantity,
    }));
  };
  const acceptReceivedQuantities = async (receivedQuantities) => {
    try {
      const response = await CallFor(
        "v2/Orders/AcceptReceivedQuantities",
        "post",
        receivedQuantities,
        "Auth"
      );
      // console.log('Quantities accepted successfully:', response.data);
      // You might want to update the UI or show a success message here

      if (response) {
        reToast.success("Accepted Quantity");
        router.push("/admin/Ordering/Purchase/delivery");
      }
    } catch (error) {
      console.error("Error accepting quantities:", error);
      // Handle the error, maybe show an error message to the user
    }
  };

  const handleSave = () => {
    const model = deliveryData.odtitemsmappings.map((item) => ({
      OitemsId: item.oitemsid,
      RQty: parseFloat(acceptedQuantities[item.odtimid] || item.recivedqty),
    }));

    const receivedQuantities = {
      AcceptReceivedQtySubModelList: {
        Model: model,
      },
    };

    acceptReceivedQuantities(receivedQuantities);
  };

  if (!deliveryData) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div className="text-orange-500 text-xl font-semibold p-2">
          ACCEPT STOCK
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
          <label className="text-orange-300">{deliveryData.orgname}</label>
        </div>
        <div>
          <label className="font-bold inline-block w-32 ">PO No</label>
          <label>{deliveryData.orderid}</label>
        </div>

        <div>
          <label className="font-bold inline-block w-32 ">Delivery No</label>
          <label>{deliveryData.odtid}</label>
        </div>

        <div>
          <label className="font-bold inline-block w-32 ">Total Quantity</label>
          <label>{deliveryData.orderTotalQty || "N/A"}</label>
        </div>
        <div>
          {/* <label className="font-bold inline-block w-32 pt-5">Delivery Date</label> */}
          {/* <input
            type="date"
            className="border border-black dark:border-white p-2 bg-transparent "
            defaultValue={deliveryData?.odtexpdeldate?.split('T')[0]}
          /> */}
        </div>
      </div>
      <div>
        <div className="py-8 mt-10 mb-7 max-w-4xl">
          <table className="border-black dark:border-white">
            <thead>
              <tr>
                <th className="py-3 px-6 text-center">Sr. No</th>
                <th className="py-3 px-6 text-center">Select Product</th>
                <th className="py-3 px-6 text-center">Attributes</th>
                <th className="py-3 px-6 text-center"> Quantity in Delivery</th>
                <th className="py-3 px-6 text-center">Accepted Quantity</th>
                {/* <th className="py-3 px-6 text-center">ACTION</th> */}
              </tr>
            </thead>
            <tbody>
              {deliveryData.odtitemsmappings.map((item, index) => (
                <tr key={item.odtimid}>
                  <td className="py-3 px-6 text-center">{index + 1}</td>
                  <td className="py-3 px-6 text-center">
                    {item.oitems.proname}
                  </td>
                  <td className="py-3 px-6 text-center">
                    {item.bcode ? `Barcode: ${item.bcode}` : ""}
                    {item.fcode ? `Fabric Code: ${item.fcode}` : ""}
                    {item.oitems?.orderitemdetails.map((v) => (
                      <li> {v.attributename + ":" + v.attrvalue} </li>
                    ))}
                  </td>
                  <td className="py-3 px-6 text-center">{item.deliveredqty}</td>
                  <td className="py-3 px-6 text-center">
                    <input
                      type="number"
                      className="text-center w-20 bg-transparent border border-black dark:border-white rounded-sm"
                      value={acceptedQuantities[item.odtimid]}
                      onChange={(e) =>
                        handleQuantityChange(
                          item.odtimid,
                          e.target.value,
                          item.deliveredqty
                        )
                      }
                    />
                  </td>
                  {/* <td className="py-3 px-6 text-center">
                    <Link href="">
                      <Button className="p-0 bg-red-500 hover:bg-[#1f5081] text-white text-sm px-1">
                        <Trash size={20}></Trash>
                        Delete
                      </Button>
                    </Link>
                  </td> */}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex justify-end">
          <div>
            <Link href="/admin/Ordering/Purchase/delivery">
              <Button className="text-white bg-[#11375C]">Cancel</Button>
            </Link>
            <Button
              onClick={handleSave}
              color={"warning"}
              className="text-white ml-2"
            >
              Save
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AcceptStocks;
