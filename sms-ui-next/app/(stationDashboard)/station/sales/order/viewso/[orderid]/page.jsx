"use client";
import { Button } from "@/components/ui/button";
import CallFor from "@/utilities/CallFor";
import { Undo, Package, Calendar, MapPin, User, Phone, Mail, Truck, AlertCircle } from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import DeleteDialog from "@/components/DeleteDialog";
import { useRouter } from "next/navigation";

function ViewSO({ params }) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await CallFor(
        `v2/Orders/GetOrderById?orderid=${params.orderid}`,
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

  useEffect(() => {
    fetchData();
  }, [params.orderid]);

  const handleDeleteUser = (userId) => {
    setSelectedUserId(userId);
    setIsDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setIsDeleteDialogOpen(false);
  };

  const getAttributes = (proid) => {
    const item = data.materialRequest?.materialrequestitems.find(
      (item) => item.proid === proid
    );
    if (!item || !item.mridetails) return "N/A";
    return item.mridetails
      .map((detail) => ` ${detail.attributename} : ${detail.attrvalue}`)
      .join(", ");
  };

  const getStatusColor = (status) => {
    if (!status) return 'bg-gray-100 text-gray-800';
    switch (status.toLowerCase()) {
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'shipped': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    if (!amount) return '0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <span className="ml-4 text-lg text-gray-600">Loading order details...</span>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <AlertCircle className="mx-auto text-red-500 mb-4" size={48} />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Error Loading Order</h2>
            <p className="text-gray-600 mb-4">Error: {error.message}</p>
            <Button onClick={fetchData} className="bg-blue-600 hover:bg-blue-700">
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center space-x-4 mb-4 md:mb-0">
            <div className="bg-gradient-to-r from-orange-500 to-red-600 p-3 rounded-xl">
              <Package className="text-white" size={28} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">SO of Req. #{params.orderid}</h1>
              <p className="text-gray-600">Sales Order Details</p>
            </div>
          </div>
          <Link href="/station/sales/order">
            <Button className="bg-orange-500 hover:from-gray-700 hover:to-gray-800 text-white shadow-lg">
              <Undo size={20} className="mr-2" />
              Back
            </Button>
          </Link>
        </div>

        {/* Order Information Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-orange-500">
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">SO No</p>
                <p className="text-lg font-semibold text-gray-800">{params.orderid}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Status</p>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(data?.orderstatusname)}`}>
                  {data?.orderstatusname || 'N/A'}
                </span>
              </div>
            </div>
          </div> */}

          {/* <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">PO Date</p>
                <p className="text-lg font-semibold text-orange-500">{formatDate(data?.orderdate)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Due Date</p>
                <p className="text-lg font-semibold text-gray-800">{formatDate(data?.deliverydate)}</p>
              </div>
            </div>
          </div> */}

          {/* <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Req no</p>
                <p className="text-lg font-semibold text-gray-800">{data?.materialRequest?.mrid || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Warehouse</p>
                <p className="text-lg font-semibold text-orange-500">{data?.materialRequest?.targetOrgName || 'N/A'}</p>
              </div>
            </div>
          </div> */}
        </div>

        {/* Customer & Address Information */}
        {(data?.buyerName || data?.addressDetailsModel) && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Customer Details */}
            {data?.buyerName && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center mb-6">
                  <User className="text-blue-500 mr-3" size={24} />
                  <h2 className="text-2xl font-bold text-gray-800">Customer Information</h2>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <User className="text-gray-400" size={18} />
                    <div>
                      <p className="text-sm text-gray-600">Customer Name</p>
                      <p className="font-semibold text-gray-800">{data.buyerName}</p>
                    </div>
                  </div>
                  {data?.emailId && (
                    <div className="flex items-center space-x-3">
                      <Mail className="text-gray-400" size={18} />
                      <div>
                        <p className="text-sm text-gray-600">Email</p>
                        <p className="font-semibold text-gray-800">{data.emailId}</p>
                      </div>
                    </div>
                  )}
                  {data?.mobno && (
                    <div className="flex items-center space-x-3">
                      <Phone className="text-gray-400" size={18} />
                      <div>
                        <p className="text-sm text-gray-600">Phone</p>
                        <p className="font-semibold text-gray-800">{data.mobno}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Delivery Address */}
            {data?.addressDetailsModel && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center mb-6">
                  <MapPin className="text-green-500 mr-3" size={24} />
                  <h2 className="text-2xl font-bold text-gray-800">Delivery Address</h2>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="space-y-2">
                    {data.addressDetailsModel.address1 && (
                      <p className="font-semibold text-gray-800">{data.addressDetailsModel.address1}</p>
                    )}
                    {data.addressDetailsModel.address2 && (
                      <p className="text-gray-700">{data.addressDetailsModel.address2}</p>
                    )}
                    {(data.addressDetailsModel.city || data.addressDetailsModel.pincode) && (
                      <p className="text-gray-700">
                        {data.addressDetailsModel.city}{data.addressDetailsModel.city && data.addressDetailsModel.pincode ? ', ' : ''}{data.addressDetailsModel.pincode}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Order Items Table */}
        {data?.orderitems && data.orderitems.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Order Items</h2>
            <div className="overflow-x-auto  rounded-md">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-[#113754] text-white">
                    <th className="py-4 px-6 text-left font-semibold text-white border-b">Sr NO</th>
                    <th className="py-4 px-6 text-left font-semibold text-white border-b">Product</th>
                    <th className="py-4 px-6 text-left font-semibold text-white border-b">Attributes</th>
                    <th className="py-4 px-6 text-center font-semibold text-white border-b">Qty Ordered</th>
                    <th className="py-4 px-6 text-center font-semibold text-white border-b">Qty Sent</th>
                    <th className="py-4 px-6 text-right font-semibold text-white border-b">Price</th>
                    <th className="py-4 px-6 text-right font-semibold text-white border-b">Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {data.orderitems.map((item, index) => (
                    <tr key={item.oitemsid} className="hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-6 border-b text-center">{index + 1}</td>
                      <td className="py-4 px-6 border-b">
                        <div className="font-medium text-gray-800">{item.proname}</div>
                        {item.orderitemdetails && item.orderitemdetails.length > 0 && (
                          <div className="text-sm text-gray-600 mt-1">
                            {item.orderitemdetails.map((attr, attrIndex) => (
                              <span key={attrIndex} className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs mr-1 mb-1">
                                {attr.attributename}: #{attr.attrvalue}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-6 border-b text-sm text-gray-600">
                        {getAttributes(item.proid)}
                      </td>
                      <td className="py-4 px-6 border-b text-center font-medium">{item.itemqty}</td>
                      <td className="py-4 px-6 border-b text-center font-medium">{item.deliveredqty || 0}</td>
                      <td className="py-4 px-6 border-b text-right font-medium">{item.itemrate}</td>
                      {/* {formatCurrency(item.itemrate)} */}
                      <td className="py-4 px-6 border-b text-right font-bold text-green-600">{item.itemamount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex justify-end mt-6 pt-4 border-t">
              <div className="text-xl font-bold text-gray-800">
                Total: <span className="text-green-600">{data?.ordertotal}</span>
              </div>
            </div>
          </div>
        )}

        {/* Order Deliveries */}
        {data.orderdeliverytrackingModel && data.orderdeliverytrackingModel.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Order Deliveries</h2>
            {data.orderdeliverytrackingModel.map((delivery, deliveryIndex) => (
              <div key={delivery.odtid} className="mb-8 border border-gray-200 rounded-lg p-6 bg-gray-50">
                <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                  <Truck className="mr-2 text-blue-500" size={20} />
                  Delivery {deliveryIndex + 1}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-white rounded-lg p-3">
                    <span className="text-sm text-gray-600">Delivery Date:</span>
                    <p className="font-semibold text-gray-800">{new Date(delivery.odtdate).toLocaleDateString()}</p>
                  </div>
                  <div className="bg-white rounded-lg p-3">
                    <span className="text-sm text-gray-600">Status:</span>
                    <p className="font-semibold text-gray-800">{delivery.statusname || "N/A"}</p>
                  </div>
                  <div className="bg-white rounded-lg p-3">
                    <span className="text-sm text-gray-600">Shipper:</span>
                    <p className="font-semibold text-gray-800">{delivery.odtshipperName}</p>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse bg-white rounded-lg overflow-hidden">
                    <thead>
                      <tr className="bg-[#113754] text-white">
                        <th className="py-3 px-4 text-left font-semibold">Sr No</th>
                        <th className="py-3 px-4 text-left font-semibold">Product</th>
                        <th className="py-3 px-4 text-left font-semibold">Attributes</th>
                        <th className="py-3 px-4 text-center font-semibold">Qty Ordered</th>
                        <th className="py-3 px-4 text-center font-semibold">Qty Delivered</th>
                        <th className="py-3 px-4 text-center font-semibold">Qty Received</th>
                      </tr>
                    </thead>
                    <tbody>
                      {delivery.odtitemsmappings.map((item, index) => (
                        <tr key={item.odtimid} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4 text-center">{index + 1}</td>
                          <td className="py-3 px-4 font-medium">{item.oitems.proname}</td>
                          <td className="py-3 px-4 text-sm">
                            {item.oitems.orderitemdetails
                              .map((attr) => `${attr.attributename}: #${attr.attrvalue}`)
                              .join(", ")}
                          </td>
                          <td className="py-3 px-4 text-center font-medium">{item.itemqty}</td>
                          {item.deliveredqty != 0 && (
                            <td className="py-3 px-4 text-center font-medium text-blue-600">{item.deliveredqty}</td>
                          )}
                          <td className="py-3 px-4 text-center font-medium text-green-600">{item.recivedqty}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}

        <DeleteDialog
          isOpen={isDeleteDialogOpen}
          onClose={handleCloseDeleteDialog}
          callfor={CallFor}
          onDelete={() => {
            router.push("/station/Purchase/po");
            setIsDeleteDialogOpen(false);
          }}
          delUrl={`v2/Orders/DeleteOrder?id=${selectedUserId}`}
        />
      </div>
    </div>
  );
}

export default ViewSO;