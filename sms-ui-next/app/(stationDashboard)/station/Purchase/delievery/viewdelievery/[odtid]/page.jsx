"use client";
import { Button } from "@/components/ui/button";
import { Undo, Package, Truck, Calendar, User, FileText, MapPin, Globe, Hash } from "lucide-react";
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
        setDeliveryData(response.data);
      } catch (error) {
        console.error("Error fetching delivery data:", error);
      }
    };

    fetchData();
  }, [params.odtid]);

  if (!deliveryData) {
    return (
      <div className="p-4 flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading delivery details...</p>
        </div>
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 104: return "bg-green-100 text-green-800 border-green-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const calculateReturnedQty = (item) => {
    if (!item.orderReturns || item.orderReturns.length === 0) return 0;
    return item.orderReturns.reduce((total, returnItem) => total + returnItem.returnquantity, 0);
  };

  const totalDelivered = deliveryData.odtitemsmappings.reduce((total, item) => total + item.deliveredqty, 0);
  const totalReceived = deliveryData.odtitemsmappings.reduce((total, item) => total + item.recivedqty, 0);
  const totalReturned = deliveryData.odtitemsmappings.reduce((total, item) => total + calculateReturnedQty(item), 0);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <Package className="h-8 w-8 text-orange-500" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Purchase Order #{deliveryData.orderid}
                </h1>
                <p className="text-gray-600 dark:text-gray-400">Delivery ODT #{deliveryData.odtno}</p>
              </div>
            </div>
            <Link href="/station/Purchase/delievery">
              <Button className="bg-orange-500 text-white shadow-md hover:bg-orange-600 transition-colors">
                <Undo size={20} className="mr-2" />
                Back to Deliveries
              </Button>
            </Link>
          </div>
        </div>

        {/* Status and Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Status</p>
                <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(deliveryData.status)}`}>
                  {deliveryData.statusname}
                </span>
              </div>
              <Package className="h-8 w-8 text-green-500" />
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Delivered</p>
                <p className="text-2xl font-bold text-orange-500">{totalDelivered}</p>
              </div>
              <Truck className="h-8 w-8 text-orange-500" />
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Received</p>
                <p className="text-2xl font-bold text-green-600">{totalReceived}</p>
              </div>
              <Package className="h-8 w-8 text-green-500" />
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Returned</p>
                <p className="text-2xl font-bold text-red-600">{totalReturned}</p>
              </div>
              <FileText className="h-8 w-8 text-red-500" />
            </div>
          </div>
        </div>

        {/* Delivery Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Basic Information */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <FileText className="h-5 w-5 text-orange-500 mr-2" />
              Order Information
            </h2>
            <div className="space-y-3">
              <div className="flex items-center">
                <Hash className="h-4 w-4 text-gray-400 dark:text-gray-500 mr-3" />
                <span className="font-medium text-gray-700 dark:text-gray-300 w-32">PO Number:</span>
                <span className="text-gray-900 dark:text-white">{deliveryData.orderid}</span>
              </div>
              <div className="flex items-center">
                <Calendar className="h-4 w-4 text-gray-400 dark:text-gray-500 mr-3" />
                <span className="font-medium text-gray-700 dark:text-gray-300 w-32">Order Date:</span>
                <span className="text-gray-900 dark:text-white">
                  {new Date(deliveryData.orderdate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>
              <div className="flex items-center">
                <Calendar className="h-4 w-4 text-gray-400 dark:text-gray-500 mr-3" />
                <span className="font-medium text-gray-700 dark:text-gray-300 w-32">Delivery Date:</span>
                <span className="text-orange-600 font-medium">
                  {new Date(deliveryData.odtdate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>
              <div className="flex items-center">
                <MapPin className="h-4 w-4 text-gray-400 dark:text-gray-500 mr-3" />
                <span className="font-medium text-gray-700 dark:text-gray-300 w-32">Warehouse:</span>
                <span className="text-orange-600 font-medium">{deliveryData.orgname}</span>
              </div>
            </div>
          </div>

          {/* Shipping Information */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <Truck className="h-5 w-5 text-orange-500 mr-2" />
              Shipping Information
            </h2>
            <div className="space-y-3">
              <div className="flex items-center">
                <Truck className="h-4 w-4 text-gray-400 dark:text-gray-500 mr-3" />
                <span className="font-medium text-gray-700 dark:text-gray-300 w-32">Vehicle No:</span>
                <span className="text-gray-900 dark:text-white font-mono">{deliveryData.odtvehicleno || 'N/A'}</span>
              </div>
              <div className="flex items-center">
                <FileText className="h-4 w-4 text-gray-400 dark:text-gray-500 mr-3" />
                <span className="font-medium text-gray-700 dark:text-gray-300 w-32">AWB No:</span>
                <span className="text-gray-900 dark:text-white font-mono">{deliveryData.odtawbno || 'N/A'}</span>
              </div>
              <div className="flex items-center">
                <Globe className="h-4 w-4 text-gray-400 dark:text-gray-500 mr-3" />
                <span className="font-medium text-gray-700 dark:text-gray-300 w-32">Tracking URL:</span>
                {deliveryData.odturl ? (
                  <a 
                    href={deliveryData.odturl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-orange-500 hover:text-orange-600 underline"
                  >
                    Track Shipment
                  </a>
                ) : (
                  <span className="text-gray-500 dark:text-gray-400">N/A</span>
                )}
              </div>
              <div className="flex items-center">
                <User className="h-4 w-4 text-gray-400 dark:text-gray-500 mr-3" />
                <span className="font-medium text-gray-700 dark:text-gray-300 w-32">Created By:</span>
                <span className="text-gray-900 dark:text-white">{deliveryData.createdbyname || 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              <Package className="h-5 w-5 text-orange-500 mr-2" />
              Delivery Items ({deliveryData.odtitemsmappings.length})
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">#</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Specifications</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Delivered</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Received</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Returned</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Rate</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Amount</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {deliveryData.odtitemsmappings.map((item, index) => {
                  const returnedQty = calculateReturnedQty(item);
                  const rate = item.oitems?.itemrate || 0;
                  const amount = item.oitems?.itemamount || 0;
                  
                  return (
                    <tr key={item.odtimid} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white font-medium">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                        <div className="font-medium">{item.productname || "N/A"}</div>
                        {item.bcode && (
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Barcode: {item.bcode}</div>
                        )}
                        {item.fcode && (
                          <div className="text-xs text-gray-500 dark:text-gray-400">Fabric: {item.fcode}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="space-y-1">
                          {item.oitems?.orderitemdetails?.map((detail, i) => (
                            <div key={i} className="flex items-center text-xs">
                              <span className="font-medium text-gray-600 dark:text-gray-400 mr-2">{detail.attributename}:</span>
                              <span className="text-orange-600 bg-orange-50 dark:bg-orange-900/30 px-2 py-1 rounded">
                                {detail.attrvalue}
                              </span>
                            </div>
                          )) || <span className="text-gray-400 dark:text-gray-500">No specifications</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                          {item.deliveredqty}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">
                          {item.recivedqty}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                        {returnedQty > 0 ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300">
                            {returnedQty}
                          </span>
                        ) : (
                          <span className="text-gray-400 dark:text-gray-500">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-900 dark:text-white">
                        {rate.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-medium text-gray-900 dark:text-white">
                        {amount.toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Returns Summary (if any returns exist) */}
        {totalReturned > 0 && (
          <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-red-800 mb-4 flex items-center">
              <FileText className="h-5 w-5 text-red-600 mr-2" />
              Return Details
            </h3>
            <div className="space-y-3">
              {deliveryData.odtitemsmappings.map((item) => 
                item.orderReturns?.map((returnItem, index) => (
                  <div key={`${item.odtimid}-${index}`} className="bg-white rounded border border-red-200 p-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-gray-900">{item.productname}</p>
                        <p className="text-sm text-gray-600">Quantity Returned: {returnItem.returnquantity}</p>
                        <p className="text-sm text-red-600">Reason: {returnItem.returnreason}</p>
                      </div>
                      <div className="text-right text-sm text-gray-500">
                        {new Date(returnItem.createddate).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ViewDelivery;