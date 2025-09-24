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
                [`odtitemsmappings[${index}].deliveredqty`]: `Quantity cannot exceed ${maxAllowedQuantity} (Quantity - Quantity Delivered)`
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
                        `Quantity cannot exceed ${maxAllowedQuantity} (Quantity - Quantity Delivered)`;
                } else if (item.deliveredqty < 0) {
                    quantityErrors[`odtitemsmappings[${index}].deliveredqty`] = `Quantity cannot be negative`;
                } else if (item.deliveredqty === 0 && !isFullyDelivered) {
                    // Only show the error if the item is not fully delivered
                    quantityErrors[`odtitemsmappings[${index}].deliveredqty`] = `Please enter a quantity for delivery`;
                }
            });
    
            if (Object.keys(quantityErrors).length > 0) {
                setErrors(quantityErrors);
                reToast.error("Please correct the quantity errors before submitting.");
                return;
            }
    
            const response = await CallFor("v2/Orders/SaveDelivery", "Post", deliveryData, "Auth");
    
            if (response) {
                reToast.success("Delivery saved successfully!");
                router.push("/warehouse/sales/so");
            } else {
                reToast.error("Error saving delivery.");
            }
        } catch (validationError) {
            const newErrors = {};
            validationError.inner.forEach(error => {
                newErrors[error.path] = error.message;
            });
            setErrors(newErrors);
            reToast.error("Please correct the errors before submitting.");
        }
    };

    if (!orderData || !masterValues) return <div>Loading...</div>;

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div className="text-orange-500 text-xl font-semibold">
                    DELIVERY - IN TRANSIT
                </div>
                {/* <Link href="/warehouse/sales/so">
                    <Button variant="outline" className="shadow-md">
                        <Undo size={20} className="mr-2" />
                        Back
                    </Button>
                </Link> */}
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6">
                <div>
                    <label className="font-bold">To: </label>
                    <span>{orderData.sellerName}</span>
                </div>
                <div>
                    <label className="font-bold">PO Date: </label>
                    <span>{new Date(orderData.orderdate).toLocaleDateString()}</span>
                </div>
                <div>
                    <label className="font-bold">Total Quantity: </label>
                    <span>
                        {orderData.orderitems.reduce(
                            (sum, item) => sum + item.itemqty,
                            0
                        )}
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                    <label className="font-bold block mb-2">Shipper:</label>
                    <Input
                        type="text"
                        name="odtshipper"
                        value={masterValues?.odtshipper?.mastervalues[0].mastervalue1}
                        list="shipper-list"
                        className="w-full text-black dark:text-white h-10 border rounded-md"
                     
                    />
                </div>
                <div>
                    <label className="font-bold block mb-2">Shipping Method:</label>
                    <Select
                        name="odtshiptype"
                        value={deliveryData.odtshiptype}
                        onValueChange={(value) =>
                            handleSelectChange("odtshiptype", value)
                        }
                        className="text-black dark:text-white"
                    >
                        <SelectTrigger className="w-full text-black dark:text-white">
                            <SelectValue placeholder="Select a shipping method" />
                        </SelectTrigger>
                        <SelectContent>
                            {masterValues?.odtshiptype?.mastervalues.map((method) => (
                                <SelectItem key={method.mvid} value={method.mvid.toString()}>
                                    {method.mastervalue1}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {errors.odtshiptype && (
                        <p className="text-red-500 text-sm">{errors.odtshiptype}</p>
                    )}
                </div>
                <div>
                    <label className="font-bold block mb-2">Vehicle Number:</label>
                    <Input
                        name="odtvehicleno"
                        value={deliveryData.odtvehicleno}
                        onChange={handleInputChange}
                        placeholder="Enter vehicle number"
                    />
                    {errors.odtvehicleno && (
                        <p className="text-red-500 text-sm">{errors.odtvehicleno}</p>
                    )}
                </div>
                <div>
                    <label className="font-bold block mb-2">Tracking URL:</label>
                    <Input
                        name="odturl"
                        value={deliveryData.odturl}
                        onChange={handleInputChange}
                        placeholder="Enter tracking URL"
                    />
                    {errors.odturl && (
                        <p className="text-red-500 text-sm">{errors.odturl}</p>
                    )}
                </div>
                <div>
                    <label className="font-bold block mb-2">AWB Number:</label>
                    <Input
                        name="odtawbno"
                        value={deliveryData.odtawbno}
                        onChange={handleInputChange}
                        placeholder="Enter AWB number"
                    />
                    {errors.odtawbno && (
                        <p className="text-red-500 text-sm">{errors.odtawbno}</p>
                    )}
                </div>
            </div>

            <table className="w-full mb-6">
                <thead>
                    <tr>
                        <th className="py-3 px-6 text-left">Sr NO</th>
                        <th className="py-3 px-6 text-left">Product</th>
                        <th className="py-3 px-6 text-left">Attributes</th>
                        <th className="py-3 px-6 text-left">Quantity</th>
                        <th className="py-3 px-6 text-left">Quantity Delivered</th>
                        <th className="py-3 px-6 text-left">Quantity in this Delivery</th>
                    </tr>
                </thead>
                <tbody>
                    {orderData.orderitems.map((item, index) => {
                        // Calculate total delivered quantity by summing up all deliveries
                        const totalDeliveredQty = orderData.orderdeliverytrackingModel?.reduce((sum, delivery) => {
                            const matchingItem = delivery.odtitemsmappings.find(
                                mapping => mapping.oitemsid === item.oitemsid
                            );
                            return sum + (matchingItem?.deliveredqty || 0);
                        }, 0) || 0;
                        
                        // Calculate remaining quantity that can be delivered
                        const remainingQty = item.itemqty - totalDeliveredQty;
                        
                        // Check if item is fully delivered
                        const isFullyDelivered = totalDeliveredQty >= item.itemqty;
                        
                        return (
                            <tr key={item.oitemsid}>
                                <td className="py-3 px-6">{index + 1}</td>
                                <td className="py-3 px-6">{item.proname}</td>
                                <td className="py-3 px-6">
                                    {item.orderitemdetails
                                        .map(
                                            (detail) => `${detail.attributename}:${detail.attrvalue}`
                                        )
                                        .join(", ")}
                                </td>
                                <td className="py-3 px-6">{item.itemqty}</td>
                                <td className="py-3 px-6">
                                    <div className="w-20 rounded-xl border bg-gray-100 text-center py-2 dark:bg-transparent dark:border-white">
                                        {totalDeliveredQty}
                                    </div>
                                </td>
                                <td className="py-3 px-6">
                                    <Input
                                        type="number"
                                        min="0"
                                        max={remainingQty}
                                        value={isFullyDelivered ? 0 : (deliveryData.odtitemsmappings[index].deliveredqty || '')}
                                        onChange={(e) => handleItemQuantityChange(index, e.target.value)}
                                        disabled={isFullyDelivered}
                                        className={`w-20 ${
                                            errors[`odtitemsmappings[${index}].deliveredqty`]
                                                ? "border-red-500"
                                                : ""
                                        } ${isFullyDelivered ? "bg-gray-100 cursor-not-allowed" : ""}`}
                                    />
                                    {errors[`odtitemsmappings[${index}].deliveredqty`] && (
                                        <p className="text-red-500 text-sm">
                                            {errors[`odtitemsmappings[${index}].deliveredqty`]}
                                        </p>
                                    )}
                                    {!errors[`odtitemsmappings[${index}].deliveredqty`] && !isFullyDelivered && (
                                        <p className="text-gray-500 text-xs">
                                            Max: {remainingQty}
                                        </p>
                                    )}
                                    {isFullyDelivered && (
                                        <p className="text-gray-500 text-xs">
                                            Item fully delivered
                                        </p>
                                    )}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>

            <div className="flex justify-end">
                <Link href="/warehouse/sales/so">
                    <Button variant="outline" className="mr-3">
                        Cancel
                    </Button>
                </Link>
                <Button onClick={handleSubmit} className="bg-orange-400 text-white">
                    Save
                </Button>
            </div>
        </div>
    );
}

export default DeliveryForm;