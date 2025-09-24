"use client"
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
        const response = await CallFor(`v2/Orders/GetDeliveryById?odtid=${params.odtid}`, "get", null, "Auth");
        const data = await response.data;
        setDeliveryData(data);
        // Initialize acceptedQuantities with the current received quantities
        const initialQuantities = {};
        data.odtitemsmappings.forEach(item => {
          initialQuantities[item.odtimid] = item.recivedqty || 0;
        });
        setAcceptedQuantities(initialQuantities);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [params.odtid]);

  const handleQuantityChange = (odtimid, quantity, deliveredQty) => {
    const parsedQuantity = parseFloat(quantity) || 0;
    if (parsedQuantity > deliveredQty) {
      reToast.error("Accepted Quantity should be less than or equal to Quantity in Delivery");
      return;
    }
    setAcceptedQuantities(prev => ({
      ...prev,
      [odtimid]: parsedQuantity
    }));
  };

  const acceptReceivedQuantities = async (receivedQuantities) => {
    try {
      const response = await CallFor('v2/Orders/AcceptReceivedQuantities', 'post', receivedQuantities, 'Auth');
      
      if (response) {
        reToast.success("Accepted Quantity");
        router.push("/station/Purchase/delievery");
      }
    } catch (error) {
      console.error('Error accepting quantities:', error);
      reToast.error("Error accepting quantities");
    }
  };

  const handleSave = () => {
    const model = deliveryData.odtitemsmappings.map(item => ({
      OitemsId: item.odtimid,
      RQty: parseFloat(acceptedQuantities[item.odtimid] || item.recivedqty || 0)
    }));

    const receivedQuantities = {
      AcceptReceivedQtySubModelList: {
        Model: model
      }
    };

    acceptReceivedQuantities(receivedQuantities);
  };

  // Calculate total quantities
  const calculateTotalQuantity = () => {
    if (!deliveryData?.odtitemsmappings) return 0;
    return deliveryData.odtitemsmappings.reduce((total, item) => total + (item.itemqty || 0), 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  if (!deliveryData) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <div className="text-orange-500 text-xl font-semibold p-2">
          ACCEPT STOCK
        </div>
        <Link href="/station/Purchase/delievery">
          <Button color="warning" className="shadow-md">
            <Undo size={20} className="pr-1" />
            Back
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg mb-6">
        <div className="pb-3">
          <label className="font-bold inline-block w-32">Warehouse:</label>
          <span className="text-orange-600 dark:text-orange-300">{deliveryData.orgname || 'N/A'}</span>
        </div>
        <div className="pb-3">
          <label className="font-bold inline-block w-32">Order No:</label>
          <span>{deliveryData.orderid || 'N/A'}</span>
        </div>
        <div className="pb-3">
          <label className="font-bold inline-block w-32">Delivery No:</label>
          <span>{deliveryData.odtid || 'N/A'}</span>
        </div>
        <div className="pb-3">
          <label className="font-bold inline-block w-32">Status:</label>
          <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-sm text-sm">
            {deliveryData.statusname || 'N/A'}
          </span>
        </div>
        <div className="pb-3">
          <label className="font-bold inline-block w-32">Order Date:</label>
          <span>{formatDate(deliveryData.orderdate)}</span>
        </div>
        <div className="pb-3">
          <label className="font-bold inline-block w-32">Delivery Date:</label>
          <span>{formatDate(deliveryData.odtdate)}</span>
        </div>
        <div className="pb-3">
          <label className="font-bold inline-block w-32">AWB No:</label>
          <span>{deliveryData.odtawbno || 'N/A'}</span>
        </div>
        <div className="pb-3">
          <label className="font-bold inline-block w-32">Vehicle No:</label>
          <span>{deliveryData.odtvehicleno || 'N/A'}</span>
        </div>
        <div className="pb-3">
          <label className="font-bold inline-block w-32">Total Quantity:</label>
          <span className="font-semibold">{calculateTotalQuantity()}</span>
        </div>
        <div className="pb-3">
          <label className="font-bold inline-block w-32">Created By:</label>
          <span>{deliveryData.createdbyname || 'N/A'}</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="py-4">
          <table className="w-full border-collapse border border-gray-300 dark:border-gray-600">
            <thead className="bg-gray-100 dark:bg-gray-700">
              <tr>
                <th className="py-3 px-4 text-center border border-gray-300 dark:border-gray-600">Sr. No</th>
                <th className="py-3 px-4 text-center border border-gray-300 dark:border-gray-600">Product</th>
                <th className="py-3 px-4 text-center border border-gray-300 dark:border-gray-600">Attributes</th>
                <th className="py-3 px-4 text-center border border-gray-300 dark:border-gray-600">Total Quantity</th>
                <th className="py-3 px-4 text-center border border-gray-300 dark:border-gray-600">Delivered Quantity</th>
                <th className="py-3 px-4 text-center border border-gray-300 dark:border-gray-600">Accepted Quantity</th>
                <th className="py-3 px-4 text-center border border-gray-300 dark:border-gray-600">Rate</th>
                <th className="py-3 px-4 text-center border border-gray-300 dark:border-gray-600">Amount</th>
              </tr>
            </thead>
            <tbody>
              {deliveryData.odtitemsmappings.map((item, index) => (
                <tr key={item.odtimid} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="py-3 px-4 text-center border border-gray-300 dark:border-gray-600">{index + 1}</td>
                  <td className="py-3 px-4 text-center border border-gray-300 dark:border-gray-600">
                    <div className="font-medium">{item.oitems?.proname || item.productname || 'N/A'}</div>
                    {item.oitems?.pvname && item.oitems.pvname !== item.oitems.proname && (
                      <div className="text-sm text-gray-600 dark:text-gray-400">({item.oitems.pvname})</div>
                    )}
                  </td>
                  <td className="py-3 px-4 text-left border border-gray-300 dark:border-gray-600">
                    <div className="space-y-1">
                      {item.bcode && (
                        <div className="text-sm"><span className="font-medium">Barcode:</span> {item.bcode}</div>
                      )}
                      {item.fcode && (
                        <div className="text-sm"><span className="font-medium">Fabric Code:</span> {item.fcode}</div>
                      )}
                      {item.oitems?.orderitemdetails?.map((attr, idx) => (
                        <div key={idx} className="text-sm">
                          <span className="font-medium">{attr.attributename}:</span> {attr.attrvalue}
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center border border-gray-300 dark:border-gray-600">
                    {item.itemqty || item.oitems?.itemqty || 0}
                  </td>
                  <td className="py-3 px-4 text-center border border-gray-300 dark:border-gray-600">
                    <span className="font-medium text-blue-600 dark:text-blue-400">
                      {item.deliveredqty || 0}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center border border-gray-300 dark:border-gray-600">
                    <input
                      type="number"
                      min="0"
                      max={item.deliveredqty || 0}
                      step="0.01"
                      className="text-center w-20 bg-transparent border border-gray-400 dark:border-gray-500 rounded-sm px-2 py-1 focus:border-orange-500 focus:outline-none"
                      value={acceptedQuantities[item.odtimid] || 0}
                      onChange={(e) => handleQuantityChange(item.odtimid, e.target.value, item.deliveredqty)}
                    />
                  </td>
                  <td className="py-3 px-4 text-center border border-gray-300 dark:border-gray-600">
                    {item.oitems?.itemrate?.toFixed(2) || '0.00'}
                  </td>
                  <td className="py-3 px-4 text-center border border-gray-300 dark:border-gray-600">
                    <span className="font-medium">
                      {item.oitems?.itemgrossamt?.toFixed(2) || '0.00'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Summary Row */}
        <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="font-bold">Total Items:</label>
              <span className="ml-2">{deliveryData.odtitemsmappings?.length || 0}</span>
            </div>
            <div>
              <label className="font-bold">Total Delivered:</label>
              <span className="ml-2">
                {deliveryData.odtitemsmappings?.reduce((sum, item) => sum + (item.deliveredqty || 0), 0)}
              </span>
            </div>
            <div>
              <label className="font-bold">Total Accepted:</label>
              <span className="ml-2">
                {Object.values(acceptedQuantities).reduce((sum, qty) => sum + (qty || 0), 0)}
              </span>
            </div>
            <div>
              <label className="font-bold">Total Amount:</label>
              <span className="ml-2">
                {deliveryData.odtitemsmappings?.reduce((sum, item) => sum + (item.oitems?.itemgrossamt || 0), 0).toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-6 gap-3">
          <Link href="/station/Purchase/delievery">
            <Button className="text-white bg-gray-600 hover:bg-gray-700">Cancel</Button>
          </Link>
          <Button 
            onClick={handleSave} 
            className="text-white bg-orange-500 hover:bg-orange-600"
            disabled={!deliveryData.odtitemsmappings?.length}
          >
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}

export default AcceptStocks;