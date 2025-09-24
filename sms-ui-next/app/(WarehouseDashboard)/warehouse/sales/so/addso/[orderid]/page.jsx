"use client"
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Undo, Truck, Package, MapPin, ExternalLink, AlertCircle, CheckCircle, Clock, Info } from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Select, SelectItem, SelectTrigger, SelectValue, SelectContent } from "@/components/ui/select";
import CallFor from '@/utilities/CallFor';
import { useRouter } from "next/navigation";
import { toast as reToast } from "react-hot-toast";
import * as Yup from 'yup';

const deliverySchema = Yup.object().shape({
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
        }
    };

    const getAttributes = (orderitemdetails) => {
        if (!orderitemdetails || orderitemdetails.length === 0) {
            return <span className="text-gray-400 italic">No attributes</span>;
        }
        return (
            <div className="space-y-1">
                {orderitemdetails.map((detail, index) => (
                    <div key={index} className="flex items-center text-sm">
                        <span className="text-gray-600 font-medium">{detail.attributename || 'Attribute'}</span>
                        <span className="mx-1 text-gray-400">:</span>
                        <span className="text-orange-600 font-medium">{detail.attrvalue}</span>
                    </div>
                ))}
            </div>
        );
    };

    const getDeliveryStatus = (item, index) => {
        const totalDeliveredQty = orderData.orderdeliverytrackingModel?.reduce((sum, delivery) => {
            const match = delivery.odtitemsmappings.find((m) => m.oitemsid === item.oitemsid);
            return sum + (match?.deliveredqty || 0);
        }, 0) || 0;
        
        const remainingQty = item.itemqty - totalDeliveredQty;
        const isFullyDelivered = totalDeliveredQty >= item.itemqty;
        
        if (isFullyDelivered) {
            return { status: 'completed', color: 'text-green-600', bg: 'bg-green-50', icon: CheckCircle };
        } else if (totalDeliveredQty > 0) {
            return { status: 'partial', color: 'text-yellow-600', bg: 'bg-yellow-50', icon: Clock };
        } else {
            return { status: 'pending', color: 'text-gray-600', bg: 'bg-gray-50', icon: Package };
        }
    };

    if (!orderData || !masterValues) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading delivery information...</p>
                </div>
            </div>
        );
    }

    const totalOrderItems = orderData.orderitems.length;
    const totalQuantity = orderData.orderitems.reduce((sum, item) => sum + item.itemqty, 0);
    const totalDeliveredAcrossOrder = orderData.orderitems.reduce((sum, item) => {
        const itemDeliveredQty = orderData.orderdeliverytrackingModel?.reduce((deliverySum, delivery) => {
            const match = delivery.odtitemsmappings.find((m) => m.oitemsid === item.oitemsid);
            return deliverySum + (match?.deliveredqty || 0);
        }, 0) || 0;
        return sum + itemDeliveredQty;
    }, 0);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            {/* Header */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-orange-100 rounded-lg">
                                <Truck className="h-6 w-6 text-orange-600" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Delivery Management</h1>
                                <p className="text-sm text-gray-500">Create and track delivery for order #{params.orderid}</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3">
                            <Link href="/warehouse/sales/so">
                                <Button className="bg-gray-500 hover:bg-gray-600 text-white">
                                    <Undo className="h-4 w-4 mr-2" />
                                    Cancel
                                </Button>
                            </Link>
                            <Button 
                                onClick={handleSubmit}
                                className="bg-orange-500 hover:bg-orange-600 text-white shadow-lg"
                            >
                                <Truck className="h-4 w-4 mr-2" />
                                Save Delivery
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
                {/* Status Banner */}
                <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl shadow-lg text-white p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-bold mb-2">DELIVERY - IN TRANSIT</h2>
                            <p className="text-orange-100">Preparing items for shipment</p>
                        </div>
                        <div className="text-right">
                            <div className="text-2xl font-bold">{totalOrderItems}</div>
                            <div className="text-orange-100 text-sm">Items to process</div>
                        </div>
                    </div>
                </div>

                {/* Order Information */}
                <div className="bg-white rounded-xl shadow-sm border">
                    <div className="p-6 border-b">
                        <div className="flex items-center space-x-2 mb-2">
                            <Info className="h-5 w-5 text-orange-500" />
                            <h2 className="text-lg font-semibold text-gray-900">Order Information</h2>
                        </div>
                        <p className="text-sm text-gray-500">Basic order details and delivery summary</p>
                    </div>
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <div className="bg-gray-50 rounded-lg p-4">
                                <div className="text-sm text-gray-600 mb-1">Delivery To</div>
                                <div className="font-semibold text-gray-900">{orderData.buyerName}</div>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-4">
                                <div className="text-sm text-gray-600 mb-1">Order Date</div>
                                <div className="font-semibold text-gray-900">
                                    {new Date(orderData.orderdate).toLocaleDateString("en-GB")}
                                </div>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-4">
                                <div className="text-sm text-gray-600 mb-1">Total Quantity</div>
                                <div className="font-semibold text-gray-900">{totalQuantity}</div>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-4">
                                <div className="text-sm text-gray-600 mb-1">Already Delivered</div>
                                <div className="font-semibold text-gray-900">{totalDeliveredAcrossOrder}</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Shipping Information */}
                <div className="bg-white rounded-xl shadow-sm border">
                    <div className="p-6 border-b">
                        <div className="flex items-center space-x-2 mb-2">
                            <MapPin className="h-5 w-5 text-orange-500" />
                            <h2 className="text-lg font-semibold text-gray-900">Shipping Details</h2>
                        </div>
                        <p className="text-sm text-gray-500">Configure shipping method and tracking information</p>
                    </div>
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    Shipper
                                </label>
                                <Input
                                    name="odtshipper"
                                    value={masterValues?.odtshipper?.mastervalues[0]?.mastervalue1 || 'Default Shipper'}
                                    disabled
                                    className="bg-gray-50"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    Shipping Method <span className="text-red-500">*</span>
                                </label>
                                <Select
                                    name="odtshiptype"
                                    value={deliveryData.odtshiptype}
                                    onValueChange={(value) => handleSelectChange("odtshiptype", value)}
                                >
                                    <SelectTrigger className={errors.odtshiptype ? "border-red-500" : ""}>
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
                                {errors.odtshiptype && (
                                    <p className="text-red-500 text-xs flex items-center">
                                        <AlertCircle className="h-3 w-3 mr-1" />
                                        {errors.odtshiptype}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    Vehicle Number <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    name="odtvehicleno"
                                    value={deliveryData.odtvehicleno}
                                    onChange={handleInputChange}
                                    placeholder="Enter vehicle number"
                                    className={errors.odtvehicleno ? "border-red-500" : ""}
                                />
                                {errors.odtvehicleno && (
                                    <p className="text-red-500 text-xs flex items-center">
                                        <AlertCircle className="h-3 w-3 mr-1" />
                                        {errors.odtvehicleno}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    AWB Number <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    name="odtawbno"
                                    value={deliveryData.odtawbno}
                                    onChange={handleInputChange}
                                    placeholder="Enter AWB number"
                                    className={errors.odtawbno ? "border-red-500" : ""}
                                />
                                {errors.odtawbno && (
                                    <p className="text-red-500 text-xs flex items-center">
                                        <AlertCircle className="h-3 w-3 mr-1" />
                                        {errors.odtawbno}
                                    </p>
                                )}
                            </div>
                            <div className="md:col-span-2 space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    Tracking URL <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <Input
                                        name="odturl"
                                        value={deliveryData.odturl}
                                        onChange={handleInputChange}
                                        placeholder="Enter tracking URL"
                                        className={`pr-10 ${errors.odturl ? "border-red-500" : ""}`}
                                    />
                                    <ExternalLink className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                </div>
                                {errors.odturl && (
                                    <p className="text-red-500 text-xs flex items-center">
                                        <AlertCircle className="h-3 w-3 mr-1" />
                                        {errors.odturl}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Items for Delivery */}
                <div className="bg-white rounded-xl shadow-sm border">
                    <div className="p-6 border-b">
                        <div className="flex items-center space-x-2 mb-2">
                            <Package className="h-5 w-5 text-orange-500" />
                            <h2 className="text-lg font-semibold text-gray-900">Items for Delivery</h2>
                        </div>
                        <p className="text-sm text-gray-500">Configure quantities for each item in this delivery</p>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Item
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Product & Attributes
                                    </th>
                                    <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Ordered
                                    </th>
                                    <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Delivered
                                    </th>
                                    <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        This Delivery
                                    </th>
                                    <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {orderData.orderitems.map((item, index) => {
                                    const totalDeliveredQty = orderData.orderdeliverytrackingModel?.reduce((sum, delivery) => {
                                        const match = delivery.odtitemsmappings.find((m) => m.oitemsid === item.oitemsid);
                                        return sum + (match?.deliveredqty || 0);
                                    }, 0) || 0;
                                    const remainingQty = item.itemqty - totalDeliveredQty;
                                    const isFullyDelivered = totalDeliveredQty >= item.itemqty;
                                    const statusInfo = getDeliveryStatus(item, index);
                                    const StatusIcon = statusInfo.icon;

                                    return (
                                        <tr key={item.oitemsid} className="hover:bg-gray-50">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-10 w-10 bg-orange-100 rounded-lg flex items-center justify-center">
                                                        <span className="text-orange-600 font-medium">{index + 1}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="space-y-2">
                                                    <div className="font-medium text-gray-900">{item.proname}</div>
                                                    {getAttributes(item.orderitemdetails)}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <div className="text-lg font-semibold text-gray-900">{item.itemqty}</div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700">
                                                    {totalDeliveredQty}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="space-y-2">
                                                    <Input
                                                        type="number"
                                                        min="0"
                                                        max={remainingQty}
                                                        value={
                                                            isFullyDelivered
                                                                ? 0
                                                                : deliveryData.odtitemsmappings[index]?.deliveredqty || ""
                                                        }
                                                        onChange={(e) => handleItemQuantityChange(index, e.target.value)}
                                                        disabled={isFullyDelivered}
                                                        className={`text-center ${
                                                            errors[`odtitemsmappings[${index}].deliveredqty`]
                                                                ? "border-red-500 ring-1 ring-red-300"
                                                                : ""
                                                        } ${isFullyDelivered ? "bg-gray-100 cursor-not-allowed" : ""}`}
                                                        placeholder="0"
                                                    />
                                                    {errors[`odtitemsmappings[${index}].deliveredqty`] ? (
                                                        <p className="text-red-500 text-xs text-center flex items-center justify-center">
                                                            <AlertCircle className="h-3 w-3 mr-1" />
                                                            Max: {remainingQty}
                                                        </p>
                                                    ) : isFullyDelivered ? (
                                                        <p className="text-green-600 text-xs text-center flex items-center justify-center">
                                                            <CheckCircle className="h-3 w-3 mr-1" />
                                                            Fully delivered
                                                        </p>
                                                    ) : (
                                                        <p className="text-gray-500 text-xs text-center">
                                                            Max: {remainingQty}
                                                        </p>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusInfo.bg} ${statusInfo.color}`}>
                                                    <StatusIcon className="h-4 w-4 mr-1" />
                                                    {isFullyDelivered ? 'Complete' : (totalDeliveredQty > 0 ? 'Partial' : 'Pending')}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default DeliveryForm;