"use client"
import { Button } from "@/components/ui/button";
import CallFor from "@/utilities/CallFor";
import { 
  Undo, 
  Package, 
  Truck, 
  Calendar, 
  User, 
  FileText, 
  MapPin, 
  Globe, 
  Hash, 
  Building, 
  Phone, 
  Mail, 
  CreditCard, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Eye,
  Download,
  ArrowUpDown
} from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import DeleteDialog from "@/components/DeleteDialog";
import { useRouter } from "next/navigation";

function ViewSO({params}) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const router = useRouter();

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await CallFor(
        `v2/Orders/GetOrderById?orderid=${params.orderid}`, "get", null, "Auth"
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400 text-lg">Loading purchase order details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg">
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Error Loading Order</h2>
          <p className="text-gray-600 dark:text-gray-400">{error.message}</p>
          <Button onClick={fetchData} className="mt-4 bg-orange-500 hover:bg-orange-600">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 1: return <Clock className="h-5 w-5 text-yellow-500" />;
      case 4: return <CheckCircle className="h-5 w-5 text-green-500" />;
      default: return <AlertCircle className="h-5 w-5 text-blue-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 1: return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case 4: return "bg-green-100 text-green-800 border-green-200";
      default: return "bg-blue-100 text-blue-800 border-blue-200";
    }
  };

  const getAttributes = (proid) => {
    const item = data?.materialRequest?.materialrequestitems?.find(item => item.proid === proid);
    if (!item || !item.mridetails) return 'N/A';
    return (
      <div className="space-y-1">
        {item.mridetails.map((detail, index) => (
          <div key={index} className="flex items-center text-xs">
            <span className="text-gray-600 dark:text-gray-400 font-medium mr-2">{detail.attributename}:</span>
            <span className="text-orange-600 bg-orange-50 dark:bg-orange-900/30 px-2 py-1 rounded">
              {detail.attrvalue}
            </span>
          </div>
        ))}
      </div>
    );
  };

  const calculateTotalReturns = () => {
    if (!data.orderdeliverytrackingModel) return 0;
    return data.orderdeliverytrackingModel.reduce((total, delivery) => {
      return total + delivery.odtitemsmappings.reduce((subTotal, item) => {
        return subTotal + (item.orderReturns?.reduce((returnTotal, returnItem) => 
          returnTotal + returnItem.returnquantity, 0) || 0);
      }, 0);
    }, 0);
  };

  const totalReturns = calculateTotalReturns();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="flex justify-between items-start">
            <div className="flex items-center space-x-4">
              <div className="bg-orange-100 dark:bg-orange-900/30 p-3 rounded-lg">
                <Package className="h-8 w-8 text-orange-500" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Purchase Order #{params.orderid}
                </h1>
                <div className="flex items-center mt-2 space-x-4">
                  <div className="flex items-center">
                    {getStatusIcon(data?.orderstatus)}
                    <span className={`ml-2 px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(data?.orderstatus)}`}>
                      {data?.orderstatusname}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Created on {data?.orderdate ? new Date(data.orderdate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    }) : 'N/A'}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex space-x-3">
              {/* <Button variant="outline" className="shadow-sm">
                <Download size={18} className="mr-2" />
                Export
              </Button> */}
              <Link href="/station/Purchase/po">
                <Button className="bg-orange-500 text-white shadow-md hover:bg-orange-600 transition-colors">
                  <Undo size={20} className="mr-2" />
                  Back
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Amount</p>
                <p className="text-2xl font-bold text-green-600">{data?.ordertotal?.toLocaleString() || '0'}</p>
              </div>
              <CreditCard className="h-8 w-8 text-green-500" />
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Items</p>
                <p className="text-2xl font-bold text-blue-600">{data?.orderitems?.length || 0}</p>
              </div>
              <Package className="h-8 w-8 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Received Qty</p>
                <p className="text-2xl font-bold text-orange-600">{data?.totalReceivedQty || 0}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-orange-500" />
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Deliveries</p>
                <p className="text-2xl font-bold text-purple-600">{data?.orderdeliverytrackingModel?.length || 0}</p>
              </div>
              <Truck className="h-8 w-8 text-purple-500" />
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Returns</p>
                <p className="text-2xl font-bold text-red-600">{totalReturns}</p>
              </div>
              <ArrowUpDown className="h-8 w-8 text-red-500" />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'overview', label: 'Overview', icon: FileText },
                { id: 'items', label: 'Order Items', icon: Package },
                { id: 'deliveries', label: 'Deliveries', icon: Truck },
                { id: 'vendor', label: 'Vendor Details', icon: Building }
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                      activeTab === tab.id
                        ? 'border-orange-500 text-orange-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Order Information */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                      <FileText className="h-5 w-5 text-orange-500 mr-2" />
                      Order Information
                    </h3>
                    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-700 dark:text-gray-300">PO Date:</span>
                        <span className="text-orange-600 font-medium">{data?.orderdate?.split("T")[0]}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-700 dark:text-gray-300">Due Date:</span>
                        <span className="text-gray-900 dark:text-white">{data?.deliverydate?.split("T")[0]}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-700 dark:text-gray-300">Status:</span>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(data?.orderstatus)}`}>
                          {data?.orderstatusname}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-700 dark:text-gray-300">Req No:</span>
                        <span className="text-gray-900 dark:text-white">{data?.materialRequest?.mrid}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-700 dark:text-gray-300">Warehouse:</span>
                        <span className="text-orange-600 font-medium">{data?.materialRequest?.targetOrgName}</span>
                      </div>
                    </div>
                  </div>

                  {/* Financial Summary */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                      <CreditCard className="h-5 w-5 text-orange-500 mr-2" />
                      Financial Summary
                    </h3>
                    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-700 dark:text-gray-300">Items Total:</span>
                        <span className="text-gray-900 dark:text-white">{data?.orderitemtotal?.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-700 dark:text-gray-300">Tax Total:</span>
                        <span className="text-gray-900 dark:text-white">{data?.ordertaxtotal?.toLocaleString()}</span>
                      </div>
                      <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-gray-900 dark:text-white">Grand Total:</span>
                          <span className="text-lg font-bold text-green-600">{data?.ordertotal?.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Delivery Address */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                    <MapPin className="h-5 w-5 text-orange-500 mr-2" />
                    Delivery Address
                  </h3>
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                    {data?.addressDetailsModel ? (
                      <div className="space-y-2">
                        <div className="font-medium text-gray-900 dark:text-white">
                          {data.addressDetailsModel.address1}
                        </div>
                        {data.addressDetailsModel.address2 && (
                          <div className="text-gray-700 dark:text-gray-300">
                            {data.addressDetailsModel.address2}
                          </div>
                        )}
                        <div className="text-gray-700 dark:text-gray-300">
                          {data.addressDetailsModel.city}, {data.addressDetailsModel.pincode}
                        </div>
                      </div>
                    ) : (
                      <div className="text-gray-500 dark:text-gray-400">No address details available</div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Items Tab */}
            {activeTab === 'items' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Order Items ({data?.orderitems?.length || 0})
                  </h3>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Total Value: {data?.ordertotal?.toLocaleString()}
                  </div>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-900">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">#</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Product</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Specifications</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Requested</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Ordered</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Rate</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {data?.orderitems?.map((item, index) => (
                        <tr key={item.oitemsid} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                            {index + 1}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <div className="font-medium text-gray-900 dark:text-white">{item.proname}</div>
                            {item.pvname && item.pvname !== item.proname && (
                              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{item.pvname}</div>
                            )}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            {getAttributes(item.proid)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                              {item.requestedItemqty || 'N/A'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300">
                              {item.itemqty}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-900 dark:text-white">
                            {item.itemrate?.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-medium text-gray-900 dark:text-white">
                            {item.itemamount?.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Deliveries Tab */}
            {activeTab === 'deliveries' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Order Deliveries ({data?.orderdeliverytrackingModel?.length || 0})
                  </h3>
                </div>

                {data?.orderdeliverytrackingModel?.length > 0 ? (
                  <div className="space-y-6">
                    {data.orderdeliverytrackingModel.map((delivery, deliveryIndex) => (
                      <div key={delivery.odtid} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                        <div className="bg-gray-50 dark:bg-gray-900 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center space-x-4">
                              <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                                Delivery #{delivery.odtno}
                              </h4>
                              <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(delivery.status)}`}>
                                {delivery.statusname}
                              </span>
                            </div>
                            <Link href={`/station/Purchase/delievery/viewdelievery/${delivery.odtid}`}>
                              <Button variant="outline" size="sm">
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </Button>
                            </Link>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                              <span className="text-sm text-gray-600 dark:text-gray-400">
                                {new Date(delivery.odtdate).toLocaleDateString()}
                              </span>
                            </div>
                            {delivery.odtshipperName && (
                              <div className="flex items-center">
                                <Truck className="h-4 w-4 text-gray-400 mr-2" />
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                  {delivery.odtshipperName}
                                </span>
                              </div>
                            )}
                            {delivery.odtawbno && (
                              <div className="flex items-center">
                                <Hash className="h-4 w-4 text-gray-400 mr-2" />
                                <span className="text-sm text-gray-600 dark:text-gray-400 font-mono">
                                  {delivery.odtawbno}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="p-6">
                          <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                              <thead className="bg-gray-50 dark:bg-gray-900">
                                <tr>
                                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">#</th>
                                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Product</th>
                                  <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Ordered</th>
                                  <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Delivered</th>
                                  <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Received</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {delivery.odtitemsmappings.map((item, index) => (
                                  <tr key={item.odtimid}>
                                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{index + 1}</td>
                                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{item.oitems.proname}</td>
                                    <td className="px-4 py-3 text-sm text-center">{item.itemqty}</td>
                                    <td className="px-4 py-3 text-sm text-center">{item.deliveredqty}</td>
                                    <td className="px-4 py-3 text-sm text-center">{item.recivedqty}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Truck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No deliveries yet</h3>
                    <p className="text-gray-500 dark:text-gray-400">Deliveries will appear here once they are created.</p>
                  </div>
                )}
              </div>
            )}

            {/* Vendor Tab */}
            {activeTab === 'vendor' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                    <Building className="h-5 w-5 text-orange-500 mr-2" />
                    Vendor Information
                  </h3>
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 space-y-3">
                    <div className="flex items-center">
                      <Building className="h-4 w-4 text-gray-400 mr-3" />
                      <span className="font-medium text-gray-700 dark:text-gray-300 w-24">Company:</span>
                      <span className="text-gray-900 dark:text-white">{data?.orgname}</span>
                    </div>
                    <div className="flex items-center">
                      <User className="h-4 w-4 text-gray-400 mr-3" />
                      <span className="font-medium text-gray-700 dark:text-gray-300 w-24">Contact:</span>
                      <span className="text-gray-900 dark:text-white">{data?.sellerName}</span>
                    </div>
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 text-gray-400 mr-3" />
                      <span className="font-medium text-gray-700 dark:text-gray-300 w-24">Email:</span>
                      <span className="text-gray-900 dark:text-white">{data?.emailId}</span>
                    </div>
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 text-gray-400 mr-3" />
                      <span className="font-medium text-gray-700 dark:text-gray-300 w-24">Phone:</span>
                      <span className="text-gray-900 dark:text-white">{data?.mobno}</span>
                    </div>
                    <div className="flex items-center">
                      <Globe className="h-4 w-4 text-gray-400 mr-3" />
                      <span className="font-medium text-gray-700 dark:text-gray-300 w-24">Organization:</span>
                      <span className="text-gray-900 dark:text-white">{data?.orgname}</span>
                    </div>
                  </div>
                </div>

                {/* Additional Vendor Details */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                    <MapPin className="h-5 w-5 text-orange-500 mr-2" />
                    Vendor Address
                  </h3>
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 space-y-3">
                    {data?.addressDetailsModel ? (
                      <>
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 text-gray-400 mr-3" />
                          <span className="font-medium text-gray-700 dark:text-gray-300 w-24">Address 1:</span>
                          <span className="text-gray-900 dark:text-white">{data.addressDetailsModel.address1}</span>
                        </div>
                        {data.addressDetailsModel.address2 && (
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 text-gray-400 mr-3 opacity-0" />
                            <span className="font-medium text-gray-700 dark:text-gray-300 w-24">Address 2:</span>
                            <span className="text-gray-900 dark:text-white">{data.addressDetailsModel.address2}</span>
                          </div>
                        )}
                        <div className="flex items-center">
                          <Building className="h-4 w-4 text-gray-400 mr-3" />
                          <span className="font-medium text-gray-700 dark:text-gray-300 w-24">City:</span>
                          <span className="text-gray-900 dark:text-white">{data.addressDetailsModel.city}</span>
                        </div>
                        <div className="flex items-center">
                          <Hash className="h-4 w-4 text-gray-400 mr-3" />
                          <span className="font-medium text-gray-700 dark:text-gray-300 w-24">Pincode:</span>
                          <span className="text-gray-900 dark:text-white">{data.addressDetailsModel.pincode}</span>
                        </div>
                      </>
                    ) : (
                      <div className="text-gray-500 dark:text-gray-400">No address details available</div>
                    )}
                  </div>
                </div>

                {/* Order Details */}
                <div className="lg:col-span-2">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                    <FileText className="h-5 w-5 text-orange-500 mr-2" />
                    Order Processing Details
                  </h3>
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Created By</span>
                        <div className="mt-1 flex items-center">
                          <User className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-gray-900 dark:text-white">{data?.createdbyname}</span>
                        </div>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Created Date</span>
                        <div className="mt-1 flex items-center">
                          <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-gray-900 dark:text-white">
                            {data?.orderdate ? new Date(data.orderdate).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            }) : 'N/A'}
                          </span>
                        </div>
                      </div>
                      {data?.approvedbyname && (
                        <>
                          <div>
                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Approved By</span>
                            <div className="mt-1 flex items-center">
                              <User className="h-4 w-4 text-gray-400 mr-2" />
                              <span className="text-gray-900 dark:text-white">{data.approvedbyname}</span>
                            </div>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Approved Date</span>
                            <div className="mt-1 flex items-center">
                              <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                              <span className="text-gray-900 dark:text-white">
                                {data.approveddate ? new Date(data.approveddate).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                }) : 'N/A'}
                              </span>
                            </div>
                          </div>
                        </>
                      )}
                    </div>

                    {data?.orderremarks && (
                      <div className="mt-4">
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Remarks</span>
                        <div className="mt-1 text-gray-900 dark:text-white bg-white dark:bg-gray-800 rounded p-3">
                          {data.orderremarks}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="mt-6 flex justify-end space-x-3">
              {data?.orderstatus === 1 && (
                <Button 
                  className="bg-red-500 hover:bg-red-600 text-white" 
                  onClick={() => handleDeleteUser(data?.orderid)}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Cancel PO
                </Button>
              )}
              {/* <Button 
                variant="outline" 
                onClick={() => window.print()}
                className="border-gray-300 dark:border-gray-600"
              >
                <Download className="h-4 w-4 mr-2" />
                Export Details
              </Button> */}
            </div>
          </div>
        </div>

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