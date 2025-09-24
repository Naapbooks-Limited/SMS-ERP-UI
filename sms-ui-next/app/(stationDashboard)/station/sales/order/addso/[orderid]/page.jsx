"use client"
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Undo } from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Select, SelectItem, SelectTrigger, SelectValue, SelectContent } from "@/components/ui/select";
import CallFor from '@/utilities/CallFor';
import { useRouter } from "next/navigation";
import { toast as reToast } from "react-hot-toast";
import * as Yup from 'yup';

const deliverySchema = Yup.object().shape({
    // odtshipper: Yup.string().required('Shipper is required'),
    odtshiptype: Yup.string().required('Shipping method is required'),
    odtvehicleno: Yup.string().required('Vehicle number is required'),
    odturl: Yup.string().url('Invalid URL').required('Tracking URL is required'),
    odtawbno: Yup.string().required('AWB number is required'),
    odtitemsmappings: Yup.array().of(
        Yup.object().shape({
            deliveredqty: Yup.number()
                .min(0, 'Quantity must be non-negative')
                .required('Quantity is required')
        })
    )
});

function DeliveryForm({ params }) {
    const router = useRouter();

    const userData = JSON.parse(sessionStorage.getItem("userData") || "{}");
    const Uoid = userData.orgid;
    const [orderData, setOrderData] = useState(null);
    const [deliveryData, setDeliveryData] = useState({
        odtid: 0,
        uoid: Uoid,
        odtdate: new Date().toISOString(),
        odtshipper: "",
        odtno: null,
        odtshiptype: "",
        odtexpdeldate: null,
        odtactualdate: null,
        odtawbno: "",
        odturl: "",
        odtvehicleno: "",
        orderid: params.orderid,
        status: 103,
        odtitemsmappings: []
    });
    const [masterValues, setMasterValues] = useState(null);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        // Fetch order data
        CallFor(`v2/Orders/GetOrderById?orderid=${params.orderid}`, "GET", null, "Auth")
            .then(response => response.data)
            .then(data => {
                setOrderData(data);
                setDeliveryData(prev => ({
                    ...prev,
                    odtitemsmappings: data.orderitems.map(item => ({
                        odtimid: 0,
                        odtid: null,
                        oitemsid: item.oitemsid,
                        deliveredqty: item.deliveredqty || 0,
                        recivedqty: 0,
                        dom: null,
                        doe: null,
                        bcode: null,
                        fcode: null
                    }))
                }));
            });

        // Fetch delivery model and master values
        CallFor("v2/Orders/SaveDelivery", "get", null, "Auth")
            .then(response => response.data)
            .then(data => {
                setMasterValues(data.mastervalues);
            });
    }, [params.orderid]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setDeliveryData(prev => ({ ...prev, [name]: value }));
    };

    const handleItemQuantityChange = (index, value) => {
        const newQuantity = parseFloat(value) || 0;
        const item = orderData.orderitems[index];
        
        // Calculate total delivered quantity across all deliveries
        const totalDeliveredQty = orderData.orderdeliverytrackingModel?.reduce((sum, delivery) => {
            const matchingItem = delivery.odtitemsmappings.find(
                mapping => mapping.oitemsid === item.oitemsid
            );
            return sum + (matchingItem?.deliveredqty || 0);
        }, 0) || 0;
        
        // If item is fully delivered, set quantity to 0
        if (totalDeliveredQty >= item.itemqty) {
            setDeliveryData(prev => ({
                ...prev,
                odtitemsmappings: prev.odtitemsmappings.map((item, i) =>
                    i === index ? { ...item, deliveredqty: 0 } : item
                )
            }));
            return;
        }
        
        // Calculate maximum allowed quantity for this delivery
        const maxAllowedQuantity = item.itemqty - totalDeliveredQty;
        
        // Update the delivery data
        setDeliveryData(prev => ({
            ...prev,
            odtitemsmappings: prev.odtitemsmappings.map((item, i) =>
                i === index ? { ...item, deliveredqty: newQuantity } : item
            )
        }));
        
        // Validate: Quantity in this Delivery <= Quantity - Quantity Delivered
        if (newQuantity > maxAllowedQuantity) {
            setErrors(prev => ({
                ...prev,
                [`odtitemsmappings[${index}].deliveredqty`]: `Quantity cannot exceed ${maxAllowedQuantity}`
            }));
        } else if (newQuantity < 0) {
            setErrors(prev => ({
                ...prev,
                [`odtitemsmappings[${index}].deliveredqty`]: `Quantity cannot be negative`
            }));
        } else {
            // Clear error if valid
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[`odtitemsmappings[${index}].deliveredqty`];
                return newErrors;
            });
        }
    };

    const handleSelectChange = (name, value) => {
        setDeliveryData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async () => {
        try {
            await deliverySchema.validate(deliveryData, { abortEarly: false });
            
            // Additional validation for quantity
            const quantityErrors = {};
            deliveryData.odtitemsmappings.forEach((item, index) => {
                const orderItem = orderData.orderitems[index];
                
                // Calculate total delivered quantity
                const totalDeliveredQty = orderData.orderdeliverytrackingModel?.reduce((sum, delivery) => {
                    const matchingItem = delivery.odtitemsmappings.find(
                        mapping => mapping.oitemsid === orderItem.oitemsid
                    );
                    return sum + (matchingItem?.deliveredqty || 0);
                }, 0) || 0;
                
                const maxAllowedQuantity = orderItem.itemqty - totalDeliveredQty;
                const isFullyDelivered = totalDeliveredQty >= orderItem.itemqty;
                
                if (item.deliveredqty > maxAllowedQuantity) {
                    quantityErrors[`odtitemsmappings[${index}].deliveredqty`] = 
                        `Quantity cannot exceed ${maxAllowedQuantity}`;
                } else if (item.deliveredqty < 0) {
                    quantityErrors[`odtitemsmappings[${index}].deliveredqty`] = `Quantity cannot be negative`;
                } else if (item.deliveredqty === 0 && !isFullyDelivered) {
                    // Only show the error if the item is not fully delivered
                    quantityErrors[`odtitemsmappings[${index}].deliveredqty`] = `Please enter a quantity for delivery`;
                }
            });
    
            if (Object.keys(quantityErrors).length > 0) {
                setErrors(quantityErrors);
                // reToast.error("Please correct the quantity errors before submitting.");
                return;
            }
    
            const response = await CallFor("v2/Orders/SaveDelivery", "Post", deliveryData, "Auth");
    
            if (response) {
                reToast.success("Delivery saved successfully!");
                router.push("/station/sales/order");
            } else {
                reToast.error("Error saving delivery.");
            }
        } catch (validationError) {
            const newErrors = {};
            validationError.inner.forEach(error => {
                newErrors[error.path] = error.message;
            });
            setErrors(newErrors);
            // reToast.error("Please correct the errors before submitting.");
        }
    };

    const getAttributes = (orderitemdetails) => {
        if (!orderitemdetails || orderitemdetails.length === 0) return 'N/A';
        return (
            <div className="space-y-1">
                {orderitemdetails.map((detail, index) => (
                    <div key={index} className="flex items-center">
                        <span className="text-gray-600 font-medium">{detail.attributename || 'Attribute'}</span>
                        <span className="mx-1">:</span>
                        <span className="text-orange-500">{detail.attrvalue}</span>
                    </div>
                ))}
            </div>
        );
    };

    if (!orderData || !masterValues) return <div>Loading...</div>;

    return (
  <div className="p-6 bg-white dark:bg-black rounded-md shadow-md max-w-7xl mx-auto">
    {/* Header */}
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-orange-500 text-2xl font-bold">DELIVERY - IN TRANSIT</h2>
      {/* Optional Back Button */}
      {/* <Link href="/warehouse/sales/so">
        <Button variant="outline" className="shadow">
          <Undo size={18} className="mr-2" /> Back
        </Button>
      </Link> */}
    </div>

    {/* Order Summary */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 text-sm">
      <div>
        <span className="font-semibold text-gray-700 dark:text-gray-300">To:</span>{" "}
        {orderData.sellerName}
      </div>
      <div>
        <span className="font-semibold text-gray-700 dark:text-gray-300">PO Date:</span>{" "}
        {new Date(orderData.orderdate).toLocaleDateString("en-GB")}
      </div>
      <div>
        <span className="font-semibold text-gray-700 dark:text-gray-300">Total Quantity:</span>{" "}
        {orderData.orderitems.reduce((sum, item) => sum + item.itemqty, 0)}
      </div>
    </div>

    {/* Input Fields */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
      <div>
        <label className="block text-sm font-medium mb-1">Shipper</label>
        <Input
          name="odtshipper"
          value={masterValues?.odtshipper?.mastervalues[0].mastervalue1}
          disabled
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Shipping Method</label>
        <Select
          name="odtshiptype"
          value={deliveryData.odtshiptype}
          onValueChange={(value) => handleSelectChange("odtshiptype", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select shipping method" />
          </SelectTrigger>
          <SelectContent>
            {masterValues?.odtshiptype?.mastervalues.map((method) => (
              <SelectItem key={method.mvid} value={method.mvid.toString()}>
                {method.mastervalue1}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.odtshiptype && <p className="text-red-500 text-xs">{errors.odtshiptype}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Vehicle Number</label>
        <Input
          name="odtvehicleno"
          value={deliveryData.odtvehicleno}
          onChange={handleInputChange}
          placeholder="Enter vehicle number"
        />
        {errors.odtvehicleno && <p className="text-red-500 text-xs">{errors.odtvehicleno}</p>}
      </div>

      <div>
         <label className="block text-sm font-medium mb-1">AWB Number</label>
        <Input
          name="odtawbno"
          value={deliveryData.odtawbno}
          onChange={handleInputChange}
          placeholder="Enter AWB number"
        />
        {errors.odtawbno && <p className="text-red-500 text-xs">{errors.odtawbno}</p>}
      </div>
      </div>

      <div className="md:col-span-2 mb-2">
        <label className="block text-sm font-medium mb-1">Tracking URL</label>
        <Input
          name="odturl"
          value={deliveryData.odturl}
          onChange={handleInputChange}
          placeholder="Enter tracking URL"
        />
        {errors.odturl && <p className="text-red-500 text-xs">{errors.odturl}</p>}
    </div>

    {/* Item Table */}
    <div className="overflow-x-auto mb-6">
      <table className="min-w-full text-sm border-collapse">
        <thead className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200">
          <tr>
            <th className="p-3 text-left">Sr No</th>
            <th className="p-3 text-left">Product</th>
            <th className="p-3 text-left">Attributes</th>
            <th className="p-3 text-left">Qty</th>
            <th className="p-3 text-left">Delivered</th>
            <th className="p-3 text-left">This Delivery</th>
          </tr>
        </thead>
        <tbody>
          {orderData.orderitems.map((item, index) => {
            const totalDeliveredQty = orderData.orderdeliverytrackingModel?.reduce((sum, delivery) => {
              const match = delivery.odtitemsmappings.find((m) => m.oitemsid === item.oitemsid);
              return sum + (match?.deliveredqty || 0);
            }, 0) || 0;
            const remainingQty = item.itemqty - totalDeliveredQty;
            const isFullyDelivered = totalDeliveredQty >= item.itemqty;
            return (
              <tr key={item.oitemsid} className="border-t dark:border-gray-700">
                <td className="p-3">{index + 1}</td>
                <td className="p-3">{item.proname}</td>
                <td className="p-3">{getAttributes(item.orderitemdetails)}</td>
                <td className="p-3">{item.itemqty}</td>
                <td className="p-3">
                  <div className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-center">
                    {totalDeliveredQty}
                  </div>
                </td>
                <td className="p-3 w-40">
                  <Input
                    type="number"
                    min="0"
                    max={remainingQty}
                    value={
                      isFullyDelivered
                        ? 0
                        : deliveryData.odtitemsmappings[index].deliveredqty || ""
                    }
                    onChange={(e) => handleItemQuantityChange(index, e.target.value)}
                    disabled={isFullyDelivered}
                    className={`text-sm ${
                      errors[`odtitemsmappings[${index}].deliveredqty`]
                        ? "border-red-500 ring-1 ring-red-300"
                        : ""
                    } ${isFullyDelivered ? "bg-gray-100 cursor-not-allowed" : ""}`}
                  />
                  {errors[`odtitemsmappings[${index}].deliveredqty`] ? (
                    <p className="text-red-500 text-xs">
                      {errors[`odtitemsmappings[${index}].deliveredqty`]}
                    </p>
                  ) : isFullyDelivered ? (
                    <p className="text-gray-500 text-xs">Item fully delivered</p>
                  ) : (
                    <p className="text-gray-500 text-xs">Max: {remainingQty}</p>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>

    {/* Action Buttons */}
    <div className="flex justify-end gap-3">
      <Link href="/station/sales/order">
        <Button variant="outline">Cancel</Button>
      </Link>
      <Button className="bg-orange-500 hover:bg-orange-600 text-white" onClick={handleSubmit}>
        Save
      </Button>
    </div>
  </div>
);

}

export default DeliveryForm;