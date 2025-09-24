"use client"
import { Button } from "@/components/ui/button";
import CallFor from "@/utilities/CallFor";
import { Undo, Package, Calendar, User, FileText, CheckCircle, XCircle, Clock } from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState } from "react";

function ViewReturn({ params }) {
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

  const getStatusBadge = (status) => {
    switch (status) {
      case 1:
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-yellow-100 text-yellow-800">
            <Clock size={14} className="mr-1" />
            Pending
          </span>
        );
      case 2:
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
            <CheckCircle size={14} className="mr-1" />
            Approved
          </span>
        );
      case 3:
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-red-100 text-red-800">
            <XCircle size={14} className="mr-1" />
            Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-800">
            <Clock size={14} className="mr-1" />
            Unknown
          </span>
        );
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <div className="flex items-center">
            <XCircle className="text-red-500 mr-3" size={20} />
            <div>
              <h3 className="text-red-800 font-semibold">Error Loading Data</h3>
              <p className="text-red-600 text-sm mt-1">{error.message}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const returnAmount = data.returnquantity * data.odtitemsmapping.oitems.itemrate;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Package className="text-orange-500 mr-3" size={28} />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Return Details</h1>
                <p className="text-gray-600 mt-1">Return ID: #{data.returnId}</p>
              </div>
            </div>
            <Link href="/station/Purchase/returns">
              <Button className="bg-orange-500 hover:bg-orange-600 text-white shadow-md">
                <Undo size={18} className="mr-2" />
                Back to Returns
              </Button>
            </Link>
          </div>
        </div>

        {/* Return Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">PO Number</p>
                <p className="text-2xl font-bold text-gray-900">#{data.odtitemsmapping.oitems.orderid}</p>
              </div>
              <FileText className="text-blue-500" size={24} />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Return Quantity</p>
                <p className="text-2xl font-bold text-gray-900">{data.returnquantity}</p>
              </div>
              <Package className="text-orange-500" size={24} />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Return Value</p>
                <p className="text-2xl font-bold text-gray-900">{(returnAmount)}</p>
              </div>
              <div className="text-green-500 text-2xl font-bold">₹</div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Status</p>
                <div className="mt-2">{getStatusBadge(data.returnstatus)}</div>
              </div>
              <CheckCircle className="text-green-500" size={24} />
            </div>
          </div>
        </div>

        {/* Return Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Return Details */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <FileText className="mr-2 text-orange-500" size={20} />
              Return Information
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm font-medium text-gray-600">Return Date</span>
                <span className="text-sm text-gray-900">{formatDate(data.createddate)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm font-medium text-gray-600">Created By</span>
                <span className="text-sm text-gray-900">User #{data.createdby}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm font-medium text-gray-600">Approved By</span>
                <span className="text-sm text-gray-900">{data.approvedby || "Pending"}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm font-medium text-gray-600">Approved Date</span>
                <span className="text-sm text-gray-900">{formatDate(data.approveddate)}</span>
              </div>
              <div className="py-2">
                <span className="text-sm font-medium text-gray-600 block mb-2">Return Reason</span>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm text-gray-900">{data.returnreason || "No reason provided"}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Order Details */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Package className="mr-2 text-orange-500" size={20} />
              Order Information
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm font-medium text-gray-600">Order ID</span>
                <span className="text-sm text-gray-900">#{data.odtitemsmapping.oitems.orderid}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm font-medium text-gray-600">Original Quantity</span>
                <span className="text-sm text-gray-900">{data.odtitemsmapping.oitems.itemqty}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm font-medium text-gray-600">Delivered Quantity</span>
                <span className="text-sm text-gray-900">{data.odtitemsmapping.deliveredqty}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm font-medium text-gray-600">Received Quantity</span>
                <span className="text-sm text-gray-900">{data.odtitemsmapping.recivedqty}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm font-medium text-gray-600">Unit Rate</span>
                <span className="text-sm text-gray-900">{(data.odtitemsmapping.oitems.itemrate)}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm font-medium text-gray-600">Total Amount</span>
                <span className="text-sm font-semibold text-gray-900">{(data.odtitemsmapping.oitems.itemamount)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Package className="mr-2 text-orange-500" size={20} />
            Product Details
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="py-4 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                  <th className="py-4 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                  <th className="py-4 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Attributes</th>
                  <th className="py-4 px-6 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Ordered</th>
                  <th className="py-4 px-6 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Delivered</th>
                  <th className="py-4 px-6 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Received</th>
                  <th className="py-4 px-6 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Returned</th>
                  <th className="py-4 px-6 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Rate</th>
                  <th className="py-4 px-6 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Return Value</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr className="hover:bg-gray-50">
                  <td className="py-4 px-6 text-sm text-gray-900">1</td>
                  <td className="py-4 px-6">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{data.odtitemsmapping.oitems.pvname}</div>
                      <div className="text-sm text-gray-500">Product ID: {data.odtitemsmapping.oitems.proid}</div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="space-y-1">
                      {data.odtitemsmapping.oitems.orderitemdetails.map((detail, index) => (
                        <div key={index} className="text-xs bg-gray-100 rounded px-2 py-1 inline-block mr-1">
                          Attr {detail.attributeid}: {detail.attrvalue}
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="py-4 px-6 text-center text-sm text-gray-900">{data.odtitemsmapping.oitems.itemqty}</td>
                  <td className="py-4 px-6 text-center text-sm text-gray-900">{data.odtitemsmapping.deliveredqty}</td>
                  <td className="py-4 px-6 text-center text-sm text-gray-900">{data.odtitemsmapping.recivedqty}</td>
                  <td className="py-4 px-6 text-center">
                    <span className="text-sm font-medium text-red-600">{data.returnquantity}</span>
                  </td>
                  <td className="py-4 px-6 text-right text-sm text-gray-900">{(data.odtitemsmapping.oitems.itemrate)}</td>
                  <td className="py-4 px-6 text-right text-sm font-medium text-gray-900">{(returnAmount)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Return Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-sm font-medium text-blue-600">Total Ordered</div>
              <div className="text-2xl font-bold text-blue-900">{data.odtitemsmapping.oitems.itemqty}</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <div className="text-sm font-medium text-green-600">Total Received</div>
              <div className="text-2xl font-bold text-green-900">{data.odtitemsmapping.recivedqty}</div>
            </div>
            <div className="bg-red-50 rounded-lg p-4">
              <div className="text-sm font-medium text-red-600">Total Returned</div>
              <div className="text-2xl font-bold text-red-900">{data.returnquantity}</div>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <span className="text-lg font-medium text-gray-900">Total Return Value:</span>
              <span className="text-2xl font-bold text-gray-900">{(returnAmount)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ViewReturn;