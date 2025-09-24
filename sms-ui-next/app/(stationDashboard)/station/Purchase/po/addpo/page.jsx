"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Undo, X, Plus, Calendar, Package, Building, FileText, ShoppingCart } from "lucide-react";
import CallFor from "@/utilities/CallFor";
import { toast as reToast } from "react-hot-toast";
import { useRouter } from "next/navigation";

const ViewCreatePO = () => {
  const router = useRouter();
  const userData = JSON.parse(sessionStorage.getItem("userData") || "{}");
  const Uid = userData.uid;
  
  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];
  
  const [formData, setFormData] = useState({
    poDate: "",
    dueDate: "",
    reqNo: "",
    warehouse: "",
    items: [
      {
        product: null,
        attributes: [{ attribute: null, value: null }],
        quantity: 0,
        price: 0,
      },
    ],
    comment: "",
  });
  const [productList, setProductList] = useState([]);
  const [total, setTotal] = useState(0);
  const [childOrganizations, setChildOrganizations] = useState([]);
  const [statusList, setStatusList] = useState([]);
  const [completedStatusId, setCompletedStatusId] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await CallFor("v2/Orders/SaveOrder", "GET", null, "Auth");
      const { products, organisations, childOrganisations, status } = response.data.dropdowns;

      setProductList(
        products.map((product) => ({
          value: product.id,
          Pvid: product.pvId,
          label: product.proname,
          attributes: product.attributes,
          price: product.price,
        }))
      );

      setChildOrganizations(
        childOrganisations.map((org) => ({
          value: org.id,
          label: org.name,
          uid: org.uid,
          uaid: org.uaid,
        }))
      );

      // Handle status dropdown
      if (status && status.length > 0) {
        setStatusList(status);
        // Find "Completed" status ID
        const completedStatus = status.find(s => s.name.toLowerCase() === "completed");
        if (completedStatus) {
          setCompletedStatusId(completedStatus.id);
        }
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Date validation
    if ((name === "poDate" || name === "dueDate") && value < today) {
      reToast.error(`${name === "poDate" ? "PO Date" : "Due Date"} cannot be earlier than today`);
      return;
    }
    
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...formData.items];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value,
    };
    if (field === "product") {
      updatedItems[index].price = value.price;
      updatedItems[index].attributes = [{ attribute: null, value: null }];
    }
    setFormData((prevState) => ({
      ...prevState,
      items: updatedItems,
    }));
    calculateTotal(updatedItems);
  };

  const handleAttributeChange = (itemIndex, attrIndex, field, value) => {
    const updatedItems = [...formData.items];
    updatedItems[itemIndex].attributes[attrIndex][field] = value;
    setFormData((prevState) => ({
      ...prevState,
      items: updatedItems,
    }));
  };

  const addAttribute = (itemIndex) => {
    const updatedItems = [...formData.items];
    updatedItems[itemIndex].attributes.push({ attribute: null, value: null });
    setFormData((prevState) => ({
      ...prevState,
      items: updatedItems,
    }));
  };

  const calculateTotal = (items) => {
    const newTotal = items.reduce(
      (sum, item) => sum + item.quantity * item.price,
      0
    );
    setTotal(newTotal);
  };

  const handleAddItem = () => {
    setFormData((prevState) => ({
      ...prevState,
      items: [
        ...prevState.items,
        {
          product: null,
          attributes: [{ attribute: null, value: null }],
          quantity: 0,
          price: 0,
        },
      ],
    }));
  };

  const removeAttribute = (itemIndex, attrIndex) => {
    const updatedItems = [...formData.items];
    updatedItems[itemIndex].attributes.splice(attrIndex, 1);
    setFormData((prevState) => ({
      ...prevState,
      items: updatedItems,
    }));
  };

  const removeItem = (index) => {
    const updatedItems = formData.items.filter((_, i) => i !== index);
    setFormData((prevState) => ({
      ...prevState,
      items: updatedItems,
    }));
    calculateTotal(updatedItems);
  };

  const validateForm = () => {
    if (!formData.poDate) {
      reToast.error("PO Date is required");
      return false;
    }
    if (!formData.dueDate) {
      reToast.error("Due Date is required");
      return false;
    }
    if (!formData.warehouse) {
      reToast.error("Warehouse is required");
      return false;
    }
    if (formData.poDate < today) {
      reToast.error("PO Date cannot be earlier than today");
      return false;
    }
    if (formData.dueDate < today) {
      reToast.error("Due Date cannot be earlier than today");
      return false;
    }
    if (formData.items.some(item => !item.product)) {
      reToast.error("All items must have a product selected");
      return false;
    }
    if (formData.items.some(item => item.quantity <= 0)) {
      reToast.error("All items must have a quantity greater than 0");
      return false;
    }
    return true;
  };

  const mapToApiPayload = () => {
    return {
      ordertype: true,
      isfa: null,
      orderno: formData.reqNo || null,
      otherpartyorderno: null,
      orderseriesid: null,
      orderdate: formData.poDate || null,
      orderstatus: completedStatusId, // Use the completed status ID
      orderterms: null,
      orderremarks: formData.comment || null,
      ordernote: null,
      orderjurisidiction: null,
      ordersupplystate: null,
      orderstate: null,
      orderitemtotal: total || null,
      ordertaxtotal: null,
      orderledgertotal: null,
      orderdiscount: null,
      ordertotal: total || null,
      deliverydate: formData.dueDate || null,
      buyerid: Uid,
      sellerid: formData.warehouse?.uid || null,
      consigneeid: null,
      promocode: null,
      discpercentage: null,
      discamount: null,
      discbasis: null,
      ordertandc: null,
      ordersource: null,
      ordercampaign: null,
      orderdeliverfrom: formData.warehouse?.uaid || null,
      orderdeliverto: formData.warehouse?.uaid || null,
      shippingruleid: null,
      isinternalorder: null,
      orderitems: formData.items.map((item, index) => ({
        oitemsid: 0,
        orderid: null,
        proid: item.product ? item.product.value : null,
        pvid: item.product ? item.product.Pvid : null,
        reqdeliverydate: null,
        expdeliverydate: null,
        itemuom: null,
        itemuomcfactor: null,
        itemselecteduom: null,
        itemqty: item.quantity || 0,
        deliveredqty: null,
        recivedqty: null,
        itemrate: item.price || 0,
        itemamount: item.quantity * item.price || 0,
        itemtaxrate: null,
        itemtaxamount: null,
        itemgrossamt: item.quantity * item.price || 0,
        itemnote: null,
        ledgerid: null,
        isdelivered: null,
        orderitemDetailsModel: item.attributes.map((attr) => ({
          oidid: 0,
          oitemsid: null,
          attributeid: attr.attribute ? attr.attribute.value : null,
          attrvalue: attr.value ? attr.value.value : null,
        })),
      })),
      ordersalescommisions: [],
      ordertaxdetails: [],
      orderattachments: null,
    };
  };

  const handleCreatePO = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      const apiPayload = mapToApiPayload();
      const response = await CallFor(
        "v2/Orders/SaveOrder",
        "POST",
        apiPayload,
        "Auth"
      );
      if (response.data) {
        reToast.success("PO saved successfully!");
        router.push("/station/Purchase/po");
      } else {
        reToast.error("Failed to save requisition");
      }
    } catch (error) {
      console.error("Error creating PO:", error);
      reToast.error("Error creating PO. Please try again.");
    }
  };

  const CustomSelect = ({ options, value, onChange, placeholder, className = "" }) => (
    <select
      value={value?.value || ""}
      onChange={(e) => {
        const selected = options.find(opt => opt.value.toString() === e.target.value);
        onChange(selected);
      }}
      className={`w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors bg-white ${className}`}
    >
      <option value="">{placeholder}</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <ShoppingCart className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Purchase Order</h1>
                <p className="text-sm text-gray-500">PO of Req. #{formData.reqNo}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Link href="/station/Purchase/po">
                <Button className="bg-gray-500 hover:bg-gray-600 text-white">
                  <Undo className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </Link>
              <Button 
                onClick={handleCreatePO}
                className="bg-orange-500 hover:bg-orange-600 text-white shadow-lg"
              >
                Save Purchase Order
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Basic Information Card */}
        <div className="bg-white rounded-xl shadow-sm border mb-6">
          <div className="p-6 border-b">
            <div className="flex items-center space-x-2 mb-2">
              <Calendar className="h-5 w-5 text-orange-500" />
              <h2 className="text-lg font-semibold text-gray-900">Order Information</h2>
            </div>
            <p className="text-sm text-gray-500">Set up basic order details and dates</p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  PO Date <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="date"
                    name="poDate"
                    value={formData.poDate}
                    onChange={handleInputChange}
                    min={today}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Due Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleInputChange}
                  min={today}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Warehouse <span className="text-red-500">*</span>
                </label>
                <CustomSelect
                  options={childOrganizations}
                  value={formData.warehouse}
                  onChange={(selectedOption) =>
                    setFormData((prevState) => ({
                      ...prevState,
                      warehouse: selectedOption,
                    }))
                  }
                  placeholder="Select Warehouse"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Items Section */}
        <div className="bg-white rounded-xl shadow-sm border mb-6">
          <div className="p-6 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Package className="h-5 w-5 text-orange-500" />
                <h2 className="text-lg font-semibold text-gray-900">Order Items</h2>
              </div>
              <Button 
                onClick={handleAddItem}
                className="bg-orange-500 hover:bg-orange-600 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </div>
            <p className="text-sm text-gray-500 mt-1">Add products and configure their attributes</p>
          </div>
          <div className="p-6">
            <div className="space-y-6">
              {formData.items.map((item, itemIndex) => (
                <div key={itemIndex} className="border border-gray-200 rounded-lg p-6 bg-gray-50">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-md font-medium text-gray-900">Item #{itemIndex + 1}</h3>
                    {formData.items.length > 1 && (
                      <Button
                        onClick={() => removeItem(itemIndex)}
                        className="bg-red-500 hover:bg-red-600 text-white p-2"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">Product</label>
                      <CustomSelect
                        options={productList}
                        value={item.product}
                        onChange={(selectedOption) =>
                          handleItemChange(itemIndex, "product", selectedOption)
                        }
                        placeholder="Select Product"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">Quantity</label>
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) =>
                          handleItemChange(itemIndex, "quantity", parseInt(e.target.value) || 0)
                        }
                        min="1"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                        placeholder="0"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">Price</label>
                      <input
                        type="number"
                        value={item.price}
                        onChange={(e) =>
                          handleItemChange(itemIndex, "price", parseFloat(e.target.value) || 0)
                        }
                        min="0"
                        step="0.01"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                        placeholder="0.00"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">Total</label>
                      <div className="w-full p-3 bg-gray-100 border border-gray-300 rounded-lg text-gray-700 font-medium">
                        ${(item.quantity * item.price).toFixed(2)}
                      </div>
                    </div>
                  </div>

                  {/* Attributes Section */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="block text-sm font-medium text-gray-700">Attributes</label>
                      <Button
                        onClick={() => addAttribute(itemIndex)}
                        className="bg-orange-100 hover:bg-orange-200 text-orange-700 text-sm"
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Add Attribute
                      </Button>
                    </div>
                    {item.attributes.map((attr, attrIndex) => (
                      <div key={attrIndex} className="flex items-center space-x-3">
                        <div className="flex-1">
                          <CustomSelect
                            options={
                              item.product
                                ? item.product.attributes.map((a) => ({
                                    value: a.id,
                                    label: a.name,
                                  }))
                                : []
                            }
                            value={attr.attribute}
                            onChange={(selectedOption) =>
                              handleAttributeChange(
                                itemIndex,
                                attrIndex,
                                "attribute",
                                selectedOption
                              )
                            }
                            placeholder="Select Attribute"
                          />
                        </div>
                        <div className="flex-1">
                          <CustomSelect
                            options={
                              attr.attribute && item.product
                                ? item.product.attributes
                                    .find((a) => a.id === attr.attribute.value)
                                    ?.subdata.map((sub) => ({
                                      value: sub.id,
                                      label: sub.name,
                                    })) || []
                                : []
                            }
                            value={attr.value}
                            onChange={(selectedOption) =>
                              handleAttributeChange(
                                itemIndex,
                                attrIndex,
                                "value",
                                selectedOption
                              )
                            }
                            placeholder="Select Value"
                          />
                        </div>
                        {item.attributes.length > 1 && (
                          <Button
                            onClick={() => removeAttribute(itemIndex, attrIndex)}
                            className="bg-red-100 hover:bg-red-200 text-red-700 p-2"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Comments and Total */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Comments */}
          <div className="bg-white rounded-xl shadow-sm border">
            <div className="p-6 border-b">
              <div className="flex items-center space-x-2">
                <FileText className="h-5 w-5 text-orange-500" />
                <h2 className="text-lg font-semibold text-gray-900">Additional Notes</h2>
              </div>
            </div>
            <div className="p-6">
              <textarea
                name="comment"
                value={formData.comment}
                onChange={handleInputChange}
                rows={6}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors resize-none"
                placeholder="Add any additional comments or special instructions..."
              />
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-xl shadow-sm border">
            <div className="p-6 border-b">
              <h2 className="text-lg font-semibold text-gray-900">Order Summary</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Items Count:</span>
                  <span className="font-medium">{formData.items.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total Quantity:</span>
                  <span className="font-medium">
                    {formData.items.reduce((sum, item) => sum + item.quantity, 0)}
                  </span>
                </div>
                <hr className="border-gray-200" />
                <div className="flex justify-between text-lg font-semibold">
                  <span className="text-gray-900">Total Amount:</span>
                  <span className="text-orange-600">${total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewCreatePO;