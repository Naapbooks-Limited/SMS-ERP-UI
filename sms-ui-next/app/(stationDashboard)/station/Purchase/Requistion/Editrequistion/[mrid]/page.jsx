"use client";
import CallFor from "@/utilities/CallFor";
import Select from "react-select";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast as reToast } from "react-hot-toast";
import * as yup from "yup";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";

const sharedClasses = {
  border: "border border-zinc-300 dark:border-zinc-700 rounded p-2",
  button: "p-2 rounded",
};

const getStyles = (isDark) => ({
  menu: (provided) => ({
    ...provided,
    backgroundColor: isDark ? "#333" : "#fff",
    color: isDark ? "white" : "#333",
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: isDark
      ? state.isSelected
        ? "#555"
        : "#333"
      : state.isSelected
      ? "#f0f0f0"
      : "#fff",
    color: isDark ? "white" : "#333",
  }),
  control: (provided) => ({
    ...provided,
    backgroundColor: isDark ? "#333" : "#fff",
    color: isDark ? "white" : "#333",
  }),
  singleValue: (provided) => ({
    ...provided,
    color: isDark ? "white" : "#333",
  }),
});

const requisitionSchema = yup.object().shape({
  mrdate: yup.date().required("Requisition date is required"),
  mrrequireddate: yup.date().required("Due date is required").min(yup.ref('mrdate'), "Due date must be after the requisition date"),
  selectedWarehouse: yup.object().nullable(),
  selectedChildOrganization: yup.object().nullable(),
  items: yup.array().of(
    yup.object().shape({
      selectedProductId: yup.object().nullable().required("Product is required"),
      quantities: yup.number().required("Quantity is required").min(1, "Quantity must be at least 1"),
      selectedAttributes: yup.array().of(
        yup.object().shape({
          attributeId: yup.number().nullable(),
          attributeValue: yup.object().nullable()
        }).test('attribute-validation', 'Attribute validation', function(value) {
          const { attributeId, attributeValue } = value || {};
          
          // If both are null/undefined, it's valid (no attribute selected - this is allowed)
          if ((attributeId == null || attributeId == undefined) && (attributeValue == null || attributeValue == undefined)) {
            return true;
          }
          
          // If attributeId is selected but attributeValue is not - this is NOT allowed
          if (attributeId && (!attributeValue || attributeValue == null)) {
            return this.createError({
              path: `${this.path}.attributeValue`,
              message: 'Attribute value is required when attribute is selected'
            });
          }
          
          // If attributeValue is selected but attributeId is not - this shouldn't happen in UI but handle it
          if (attributeValue && (!attributeId || attributeId == null)) {
            return this.createError({
              path: `${this.path}.attributeId`,
              message: 'Attribute is required when attribute value is selected'
            });
          }
          
          // If both are filled, it's valid
          if (attributeId && attributeValue) {
            return true;
          }
          
          return true;
        })
      )
    })
  ).min(1, "At least one item is required")
}).test('warehouse-or-external', 'Either Warehouse or External Vendor must be selected', function(values) {
  if (values.selectedWarehouse && values.selectedChildOrganization) {
    return this.createError({ path: 'selectedWarehouse', message: 'Only one of Warehouse or External Vendor can be selected' });
  }
  if (!values.selectedWarehouse && !values.selectedChildOrganization) {
    return this.createError({ path: 'selectedWarehouse', message: 'Either Warehouse or External Vendor must be selected' });
  }
  return true;
});

const getShortErrorMessage = (errorMessage) => {
  if (typeof errorMessage == 'string') {
    return errorMessage;
  }
  
  if (Array.isArray(errorMessage)) {
    return errorMessage[0];
  }
  
  return "Invalid value";
};

const UpdateRequisition = ({ params }) => {
  const router = useRouter();
  const [items, setItems] = useState([]);
  const [formData, setFormData] = useState({});
  const [productList, setProductList] = useState([]);
  const [warehouseOptions, setWarehouseOptions] = useState([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);
  const [childOrganizations, setChildOrganizations] = useState([]);
  const [selectedChildOrganization, setSelectedChildOrganization] = useState(null);
  const [attributeOptions, setAttributeOptions] = useState({});
  const [errors, setErrors] = useState({});
  const userData = JSON.parse(sessionStorage.getItem("userData") || "{}");
  const orgid = userData.orgid;
  const uid = userData.uid;
  const { theme } = useTheme();

  useEffect(() => {
    fetchDropdownData();
    const today = getTodayString();
    setMinReqDate(today);
    setMinDueDate(today);
  }, []);

  const [minReqDate, setMinReqDate] = useState(getTodayString());
  const [minDueDate, setMinDueDate] = useState(getTodayString());

  useEffect(() => {
    if (warehouseOptions.length > 0 && productList.length > 0) {
      fetchRequisitionData();
    }
  }, [warehouseOptions, productList]);

  function getTodayString() {
    const today = new Date();
    return today.toISOString().split("T")[0];
  }

  const fetchDropdownData = async () => {
    try {
      const response = await CallFor(
        `v2/Orders/SaveMaterialRequest`,
        "Get",
        null,
        "Auth"
      );

      setProductList(
        response.data.dropdowns.products.map((product) => ({
          value: product.id,
          valuee: product.pvId,
          price: product.price,
          label: product.proname,
          itemuom: product.prouom,
          attributes: product.attributes.map((attr) => ({
            id: attr.id,
            name: attr.name,
            values: attr.subdata.map((sub) => ({
              value: sub.id,
              label: sub.name,
            })),
          })),
        }))
      );

      const attrOptions = {};
      response.data.dropdowns.products.forEach((product) => {
        product.attributes.forEach((attr) => {
          attrOptions[attr.id] = attr.subdata.map((sub) => ({
            value: sub.id,
            label: sub.name,
          }));
        });
      });
      setAttributeOptions(attrOptions);

      setWarehouseOptions(
        response.data.dropdowns.organisations.map((org) => ({
          value: org.id,
          label: org.name,
          uaid: org.uaid,
        }))
      );

      setChildOrganizations(
        response.data.dropdowns.childOrganisations.map((org) => ({
          value: org.id,
          label: org.name,
          uid: org.uid,
          uaid: org.uaid,
        }))
      );
    } catch (error) {
      console.log(error);
    }
  };

  const fetchRequisitionData = async () => {
    try {
      const response = await CallFor(
        `v2/Orders/GetMaterialRequestbyId?mrid=${params.mrid}`,
        "get",
        null,
        "Auth"
      );
      const data = response.data;

      setFormData({
        mrdate: data.mrdate.split("T")[0],
        mrrequireddate: data.mrrequireddate.split("T")[0],
      });

      const selectedWarehouseOption = warehouseOptions.find(
        (wh) => wh.value == data.targetwarehouse
      );
      if (selectedWarehouseOption) {
        setSelectedWarehouse(selectedWarehouseOption);
      }

      if (!selectedWarehouseOption) {
        const selectedChildOption = childOrganizations.find(
          (ch) => ch.value == data.targetwarehouse
        );
        if (selectedChildOption) {
          setSelectedChildOrganization(selectedChildOption);
        }
      }

      const initialItems = data.materialrequestitems.map((item) => {
        const selectedProduct = productList.find((p) => p.value == item.proid);

        // Only add attributes that have both attributeId and attributeValue
        const selectedAttributes = item.mridetails
          .filter(attr => attr.attributeid && attr.avid) // Filter out incomplete attributes
          .map((attr) => ({
            attributeId: attr.attributeid,
            attributeName: attr.attributename,
            attributeValue: {
              value: attr.avid,
              label: attr.attrvalue,
            },
            mridid: attr.mridid,
            mriid: item.mriid,
            mrid: attr.mrid,
            avid: attr.avid,
          }));

        // If no valid attributes, add one empty attribute slot
        if (selectedAttributes.length == 0) {
          selectedAttributes.push({ attributeId: null, attributeValue: null });
        }

        return {
          id: item.mriid,
          mriid: item.mriid,
          mrid: item.mrid,
          selectedProductId: selectedProduct,
          quantities: item.itemqty,
          selectedAttributes: selectedAttributes,
        };
      });

      setItems(initialItems);
    } catch (error) {
      console.error("Error fetching requisition data:", error);
    }
  };

  const handleAddItem = () => {
    setItems([
      ...items,
      {
        id: items.length + 1,
        selectedProductId: null,
        quantities: "",
        selectedAttributes: [{ attributeId: null, attributeValue: null }],
      },
    ]);
  };

  const handleDeleteItem = (itemId) => {
    const updatedItems = items.filter((item) => item.id !== itemId);
    setItems(updatedItems);
  };

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    const today = getTodayString();

    setFormData((prevFormData) => {
      const newFormData = { ...prevFormData };

      if (name == "mrdate") {
        if (value < today) {
          newFormData[name] = today;
          setMinDueDate(today);
        } else {
          newFormData[name] = value;
          setMinDueDate(value);
        }

        if (newFormData.mrrequireddate < newFormData[name]) {
          newFormData.mrrequireddate = newFormData[name];
        }
      } else if (name == "mrrequireddate") {
        if (value < newFormData.mrdate) {
          newFormData[name] = newFormData.mrdate;
        } else {
          newFormData[name] = value;
        }
      }

      return newFormData;
    });
  };

  const handleAttributeChange = (itemIndex, attrIndex, selectedOption) => {
    const updatedItems = [...items];
    updatedItems[itemIndex].selectedAttributes[attrIndex] = {
      ...updatedItems[itemIndex].selectedAttributes[attrIndex],
      attributeId: selectedOption.value,
      attributeName: selectedOption.label,
      attributeValue: null,
      avid: null,
    };
    setItems(updatedItems);
  };

  const handleAttributeValueChange = (itemIndex, attrIndex, selectedOption) => {
    const updatedItems = [...items];
    updatedItems[itemIndex].selectedAttributes[attrIndex] = {
      ...updatedItems[itemIndex].selectedAttributes[attrIndex],
      attributeValue: selectedOption,
      avid: selectedOption.value,
      mriid: updatedItems[itemIndex].mriid || 0,
    };
    setItems(updatedItems);
  };

  const handleAddAttribute = (itemIndex) => {
    const updatedItems = [...items];
    updatedItems[itemIndex].selectedAttributes.push({
      attributeId: null,
      attributeValue: null,
    });
    setItems(updatedItems);
  };

  const handleRemoveAttribute = (itemIndex, attrIndex) => {
    const updatedItems = [...items];
    updatedItems[itemIndex].selectedAttributes.splice(attrIndex, 1);
    setItems(updatedItems);
  };

  const handleSave = async () => {
    try {
      setErrors({});

      if (selectedWarehouse && selectedChildOrganization) {
        reToast.error("Please select either Warehouse or External Vendor, not both");
        return;
      }

      if (!selectedWarehouse && !selectedChildOrganization) {
        reToast.error("Please select either Warehouse or External Vendor");
        return;
      }

      await requisitionSchema.validate(
        {
          mrdate: formData.mrdate,
          mrrequireddate: formData.mrrequireddate,
          selectedWarehouse: selectedWarehouse,
          selectedChildOrganization: selectedChildOrganization,
          items,
        },
        { abortEarly: false }
      );

      const targetLocation = selectedWarehouse || selectedChildOrganization;

      // Additional validation for items
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        
        // Check if any attribute has attributeId but no attributeValue
        for (let j = 0; j < item.selectedAttributes.length; j++) {
          const attr = item.selectedAttributes[j];
          if (attr.attributeId && !attr.attributeValue) {
            reToast.error(`Please select attribute value for item ${i + 1}`);
            return;
          }
        }
      }

      const materialRequestItems = items.map((item) => ({
        mriid: item.mriid || 0,
        mrid: parseInt(params.mrid),
        proid: item.selectedProductId.value,
        pvid: item.selectedProductId.valuee,
        price: item.selectedProductId.price,
        itemqty: parseInt(item.quantities),
        itemtargetlocation: targetLocation.uaid,
        itemrequestby: uid,
        itemuom: item.selectedProductId.itemuom == 0 ? null : item.selectedProductId.itemuom,
        itemuomcfactor: 0,
        itemselecteduom: 0,
        // Only include attributes that have both attributeId and attributeValue
        mridetails: item.selectedAttributes
          .filter(attr => attr.attributeId && attr.attributeValue)
          .map((attr) => ({
            mridid: attr.mridid || 0,
            mriid: item.mriid || 0,
            mrid: parseInt(params.mrid),
            attributeid: attr.attributeId,
            attrvalue: attr.attributeValue?.label || "",
            avid: attr.avid,
          })),
      }));

      const body = {
        mrid: parseInt(params.mrid),
        mrtype: true,
        uoid: orgid,
        seriesid: null,
        mrno: 0,
        sourcewarehouse: orgid,
        targetwarehouse: targetLocation.value,
        mrdate: formData.mrdate,
        mrrequireddate: formData.mrrequireddate,
        ordertandc: "",
        materialrequestitems: materialRequestItems,
        materialattachments: [],
      };

      console.log("Request Body:", JSON.stringify(body, null, 2));

      const response = await CallFor(
        `v2/Orders/UpdateMaterialRequest`,
        "post",
        body,
        "Auth"
      );

      if (response) {
        reToast.success("Requisition updated successfully!");
        router.push("/station/Purchase/Requistion");
      } else {
        reToast.error("Failed to update requisition");
      }
    } catch (error) {
      console.error("Save error:", error);
      if (error.name == "ValidationError") {
        error.inner.forEach((err) => {
          reToast.error(err.message);
        });
        
        const newErrors = {};
        error.inner.forEach((err) => {
          if (err.path) {
            newErrors[err.path] = err.message;
          }
        });
        setErrors(newErrors);
      } else {
        reToast.error(error.message || "An error occurred while saving");
      }
    }
  };

  const handleWarehouseChange = (selected) => {
    setSelectedWarehouse(selected);
    setSelectedChildOrganization(null);
    setErrors((prev) => ({ ...prev, selectedLocation: "" }));
  };

  const handleExternalVendorChange = (selected) => {
    setSelectedChildOrganization(selected);
    setSelectedWarehouse(null);
    setErrors((prev) => ({ ...prev, selectedLocation: "" }));
  };

  const styles = getStyles(theme == "dark");
  
  return (
    <div className="p-6 bg-zinc-100 dark:bg-zinc-800 min-h-screen relative">
      <div className="max-w-7xl mx-auto rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold mb-4 text-orange-500">
            Edit Requisition
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="flex items-center">
            <label className="text-sm font-medium mb-1 w-1/4">Req. Date</label>
            <input
              type="date"
              className={`${sharedClasses.border} ${
                errors.mrdate ? "border-red-500" : ""
              }`}
              name="mrdate"
              value={formData.mrdate || ""}
              onChange={handleDateChange}
              min={minReqDate}
            />
            {errors.mrdate && (
              <p className="text-red-500 text-sm">{errors.mrdate}</p>
            )}
          </div>
          <div className="flex items-center">
            <label className="text-sm font-medium mb-1 w-1/4">Due Date</label>
            <input
              type="date"
              className={`${sharedClasses.border} ${
                errors.mrrequireddate ? "border-red-500" : ""
              }`}
              name="mrrequireddate"
              value={formData.mrrequireddate || ""}
              onChange={handleDateChange}
              min={minDueDate}
            />
            {errors.mrrequireddate && (
              <p className="text-red-500 text-sm">{errors.mrrequireddate}</p>
            )}
          </div>
          <div className="flex items-center">
            <label className="text-sm font-medium mb-1 w-1/4">Warehouse</label>
            <div className="w-3/4">
              <Select
                options={warehouseOptions}
                value={selectedWarehouse}
                onChange={handleWarehouseChange}
                className={`z-5 text-black w-3/4}`}
                menuPortalTarget={document.body}
                styles={styles}
              />
            </div>
            {errors.selectedLocation && !selectedChildOrganization && (
              <p className="text-red-500 text-sm">{errors.selectedLocation}</p>
            )}
          </div>
          <div className="flex items-center">
            <label className="text-sm font-medium mb-1 w-1/4">External Vendor</label>
            <div className="w-3/4">
              <Select
                options={childOrganizations}
                value={selectedChildOrganization}
                onChange={handleExternalVendorChange}
                className={`z-5 text-black w-3/4}`}
                menuPortalTarget={document.body}
                styles={styles}
              />
            </div>
            {errors.selectedLocation && !selectedWarehouse && (
              <p className="text-red-500 text-sm">{errors.selectedLocation}</p>
            )}
          </div>
        </div>
        
        <h3 className="text-xl font-bold text-orange-500 mb-4">
          Requested Items
        </h3>
        
        <table className="w-full mb-6">
          <thead>
            <tr>
              <th className="text-left p-2">#</th>
              <th className="text-left p-2">Select Items</th>
              <th className="text-left p-2">Attributes</th>
              <th className="text-left p-2">Attribute Values</th>
              <th className="text-left p-2">Quantity</th>
              <th className="text-left p-2"></th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <React.Fragment key={index}>
                <tr>
                  <td className="p-2">{index + 1}</td>
                  <td className="p-2">
                    <Select
                      options={productList}
                      value={item.selectedProductId}
                      onChange={(selectedOption) => {
                        const updatedItems = [...items];
                        updatedItems[index].selectedProductId = selectedOption;
                        updatedItems[index].selectedAttributes = [{ attributeId: null, attributeValue: null }];
                        setItems(updatedItems);
                      }}
                      className={`z-5 text-black dark:bg-transparent w-full ${errors[`items[${index}].selectedProductId`] ? 'border-red-500' : ''}`}
                      menuPortalTarget={document.body}
                      styles={styles}
                    />
                  </td>
                  <td className="p-2">
                    {item.selectedAttributes.map((attr, attrIndex) => (
                      <div key={attrIndex} className="flex items-center">
                        <Select
                          options={item.selectedProductId?.attributes
                            .filter(a => !item.selectedAttributes.some((sa, i) => i != attrIndex && sa.attributeId == a.id))
                            .map(a => ({ value: a.id, label: a.name })) || []}
                          value={attr.attributeId ? { value: attr.attributeId, label: attr.attributeName } : null}
                          onChange={(selectedOption) => handleAttributeChange(index, attrIndex, selectedOption)}
                          className={`z-5 text-black w-full mt-1 mr-2 ${errors[`items[${index}].selectedAttributes[${attrIndex}].attributeId`] ? 'border-red-500' : ''}`}
                          menuPortalTarget={document.body}
                          styles={styles}
                          isDisabled={!item.selectedProductId}
                          isClearable={true}
                          placeholder="Select attribute (optional)"
                        />
                        {attrIndex > 0 && (
                          <button
                            onClick={() => handleRemoveAttribute(index, attrIndex)}
                            className="bg-red-500 text-white px-2 py-1 rounded ml-2"
                          >
                            x
                          </button>
                        )}
                      </div>
                    ))}
                  </td>
                  <td className="p-2">
                    {item.selectedAttributes.map((attr, attrIndex) => (
                      <div key={attrIndex}>
                        <Select
                          options={item.selectedProductId?.attributes.find(a => a.id == attr.attributeId)?.values || []}
                          value={attr.attributeValue}
                          onChange={(selectedOption) => handleAttributeValueChange(index, attrIndex, selectedOption)}
                          className={`z-5 text-black w-full mt-1 ${errors[`items[${index}].selectedAttributes[${attrIndex}].attributeValue`] ? 'border-red-500' : ''}`}
                          menuPortalTarget={document.body}
                          styles={styles}
                          isDisabled={!item.selectedProductId || !attr.attributeId}
                          isClearable={true}
                          placeholder="Select value"
                        />
                      </div>
                    ))}
                  </td>
                  <td className="p-2">
                    <input
                      type="number"
                      value={item.quantities}
                      onChange={(e) => {
                        const updatedItems = [...items];
                        updatedItems[index].quantities = e.target.value.replace(/[^0-9]/g, "");
                        setItems(updatedItems);
                      }}
                      className={`border p-2 w-36 ${errors[`items[${index}].quantities`] ? 'border-red-500' : ''}`}
                      placeholder="Quantity"
                    />
                  </td>
                  <td className="p-2">
                    <button
                      className="bg-red-500 text-white px-4 py-2 rounded"
                      onClick={() => handleDeleteItem(item.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
                <tr>
                  <td></td>
                  <td>{errors[`items[${index}].selectedProductId`] && <p className="text-red-500 text-sm mt-1">{errors[`items[${index}].selectedProductId`]}</p>}</td>
                  <td>
                    {errors[`items[${index}].selectedAttributes`] && <p className="text-red-500 text-sm mt-1">{errors[`items[${index}].selectedAttributes`]}</p>}
                    <button
                      onClick={() => handleAddAttribute(index)}
                      className="bg-green-500 text-white px-2 ml-2 py-1 rounded mt-2"
                      disabled={item.selectedAttributes.length == item.selectedProductId?.attributes.length}
                    >
                      +
                    </button>
                  </td>
                  <td>
                    {item.selectedAttributes.map((attr, attrIndex) => (
                      <div key={attrIndex}>
                        {errors[`items[${index}].selectedAttributes[${attrIndex}].attributeValue`] && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors[`items[${index}].selectedAttributes[${attrIndex}].attributeValue`]}
                          </p>
                        )}
                      </div>
                    ))}
                  </td>
                  <td>
                    {errors[`items[${index}].quantities`] && (
                      <p className="text-red-500 text-xs mt-1">
                        {getShortErrorMessage(errors[`items[${index}].quantities`])}
                      </p>
                    )}
                  </td>
                  <td></td>
                </tr>
              </React.Fragment>
            ))}
          </tbody>
        </table>
        
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded mb-4"
          onClick={handleAddItem}
        >
          Add Item
        </button>
      </div>

      <div className="flex justify-end mt-6">
        <Link href="/station/Purchase/Requistion">
          <Button className="bg-blue-950 text-white mr-2">Cancel</Button>
        </Link>
        <Button onClick={handleSave} className="bg-orange-400 text-white">
          Update
        </Button>
      </div>
    </div>
  );
};

export default UpdateRequisition;