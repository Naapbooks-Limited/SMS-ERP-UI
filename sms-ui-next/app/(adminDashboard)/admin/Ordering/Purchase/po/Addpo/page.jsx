"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Select from "react-select";
import { Button } from "@/components/ui/button";
import { Undo, Plus, Trash2 } from "lucide-react";
import CallFor from "@/utilities/CallFor";
import { toast as reToast } from "react-hot-toast";
import { useRouter } from "next/navigation";

const ViewCreatePO = () => {
  const router = useRouter();
  const userData = JSON.parse(sessionStorage.getItem("userData") || "{}");
  const Uid = userData.uid;
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

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await CallFor(
        "v2/Orders/SaveOrder",
        "GET",
        null,
        "Auth"
      );
      const { products, organisations, childOrganisations } =
        response.data.dropdowns;

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
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
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

  const removeAttribute = (itemIndex, attrIndex) => {
    const updatedItems = [...formData.items];
    updatedItems[itemIndex].attributes.splice(attrIndex, 1);
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

  const handleRemoveItem = (indexToRemove) => {
    setFormData((prevState) => ({
      ...prevState,
      items: prevState.items.filter((_, index) => index !== indexToRemove),
    }));
  };
  const mapToApiPayload = () => {
    return {
      ordertype: true,
      isfa: null,
      orderno: formData.reqNo || null,
      otherpartyorderno: null,
      orderseriesid: null,
      orderdate: formData.poDate || null,
      orderstatus: null,
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

        router.push("/admin/Ordering/Purchase/po");
      } else {
        reToast.error("Failed to save requisition");
      }
    } catch (error) {
      console.error("Error creating PO:", error);
    }
  };

  return (
    <div className="p-6 bg-zinc-100 dark:bg-zinc-800 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <div className="text-orange-500 text-xl font-semibold">
          PO of Req. #{formData.reqNo}
        </div>
        <Link href="/admin/Ordering/Purchase/po">
          <Button color="warning" className="shadow-md">
            <Undo size={20} className="pr-1" />
            Back
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <label className="font-bold">PO Date</label>
          <input
            type="date"
            name="poDate"
            value={formData.poDate}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label className="font-bold">Due Date</label>
          <input
            type="date"
            name="dueDate"
            value={formData.dueDate}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
          />
        </div>
        {/* <div>
          <label className="font-bold">Req No</label>
          <input
            type="text"
            name="reqNo"
            value={formData.reqNo}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
          />
        </div> */}
        <div>
          <label className="font-bold">Warehouse</label>
          <Select
            options={childOrganizations}
            value={formData.warehouse}
            onChange={(selectedOption) =>
              setFormData((prevState) => ({
                ...prevState,
                warehouse: selectedOption,
              }))
            }
            placeholder="Select Warehouse"
            className="w-full text-black"
          />
        </div>
      </div>

      <div className="mb-6">
        <table className="w-full border-collapse border">
          <thead>
            <tr>
              <th className="border p-2">Sr No</th>
              <th className="border p-2">Select Product</th>
              <th className="border p-2">Attributes</th>
              <th className="border p-2">Quantity</th>
              <th className="border p-2">Price</th>
            </tr>
          </thead>
          <tbody>
          {formData.items.map((item, itemIndex) => (
              <tr key={itemIndex}>
                <td className="border p-2">{itemIndex + 1}</td>
                <td className="border p-2">
                  <Select
                    options={productList}
                    value={item.product}
                    onChange={(selectedOption) =>
                      handleItemChange(itemIndex, "product", selectedOption)
                    }
                    className="text-black"
                  />
                </td>
                <td className="border p-2">
                  {item.attributes.map((attr, attrIndex) => (
                    <div key={attrIndex} className="flex items-center mb-2">
                      <Select
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
                        className="w-1/3 mr-2 text-black"
                      />
                      <Select
                        options={
                          attr.attribute
                            ? item.product.attributes
                                .find((a) => a.id === attr.attribute.value)
                                .subdata.map((sub) => ({
                                  value: sub.id,
                                  label: sub.name,
                                }))
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
                        className="w-1/3 text-black"
                      />
                      {attrIndex > 0 && (
                        <Button
                          onClick={() => removeAttribute(itemIndex, attrIndex)}
                          className="ml-2 p-2 bg-red-500 hover:bg-red-600 text-white"
                        >
                          {/* <Trash2 size={16} /> */}-
                        </Button>
                      )}
                      {attrIndex === item.attributes.length - 1 && (
                        <Button
                          onClick={() => addAttribute(itemIndex)}
                          className="ml-2 p-2"
                        >
                          <Plus size={16} />
                        </Button>
                      )}
                    </div>
                  ))}
                </td>
                <td className="border p-2">
                  <input
                    type="number"
                    name="quantity"
                    value={item.quantity}
                    onChange={(e) =>
                      handleItemChange(itemIndex, "quantity", e.target.value)
                    }
                    className="w-full p-2 border rounded"
                  />
                </td>
                <td className="border p-2">
                  <input
                    type="number"
                    name="price"
                    value={item.price}
                    onChange={(e) =>
                      handleItemChange(itemIndex, "price", e.target.value)
                    }
                    className="w-full p-2 border rounded"
                  />
                </td> 
                <td className="border p-2">
                  {itemIndex > 0 && (
                    <Button
                      onClick={() => handleRemoveItem(itemIndex)}
                      className="bg-red-500 hover:bg-red-600 text-white"
                    >
                      <Trash2 size={16} />
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="text-left mt-2">
          <Button color="primary" onClick={handleAddItem}>
            <Plus size={16} className="mr-1" />
            Add Item
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <label className="font-bold">Comment</label>
          <textarea
            name="comment"
            value={formData.comment}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label className="font-bold ">Total : </label>
          {/* <input
            type="number"
            name="total"
            value={total}
            readOnly
            className="w-full p-2 border rounded"
          /> */}
          {total}
        </div>
      </div>

      <div className="flex justify-end">
        <Button color="primary" className="shadow-md" onClick={handleCreatePO}>
          Save PO
        </Button>
      </div>
    </div>
  );
};

export default ViewCreatePO;
