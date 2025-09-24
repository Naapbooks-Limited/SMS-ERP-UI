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
  mrrequireddate: yup.date().required("Due date is required"),
  // ... (rest of the schema remains the same)
  selectedWarehouse: yup.object().nullable().required("Warehouse is required"),
  items: yup
    .array()
    .of(
      yup.object().shape({
        selectedProductId: yup
          .object()
          .nullable()
          .required("Product is required"),
        quantities: yup
          .number()
          .required("Quantity is required")
          .min(1, "Quantity must be at least 1"),
        selectedAttributes: yup
          .array()
          .min(1, "At least one attribute is required")
          .of(
            yup.object().shape({
              attributeId: yup
                .number()
                .nullable()
                .required("Attribute is required"),
            })
          ),
      })
    )
    .min(1, "At least one item is required"),
});

const UpdateRequisition = ({ params }) => {
  const router = useRouter();
  const [items, setItems] = useState([]);
  const [formData, setFormData] = useState({});
  const [productList, setProductList] = useState([]);
  const [warehouseOptions, setWarehouseOptions] = useState([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);
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
        (wh) => wh.value === data.targetwarehouse
      );
      if (selectedWarehouseOption) {
        setSelectedWarehouse(selectedWarehouseOption);
      }

      const initialItems = data.materialrequestitems.map((item) => {
        const selectedProduct = productList.find((p) => p.value === item.proid);

        const selectedAttributes = item.mridetails.map((attr) => ({
          attributeId: attr.attributeid,
          attributeName: attr.attributename,
          attributeValue: {
            value: attr.avid,
            label: attr.attrvalue,
          },
          mridid: attr.mridid,
          mriid: item.mriid,
          mrid: attr.mrid,
          avid: attr.avid, // Ensure we're storing the avid here
        }));

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
        selectedAttributes: [{ attributeId: null, attributeValues: [] }],
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

      if (name === "mrdate") {
        if (value < today) {
          // If selected date is before today, set it to today
          newFormData[name] = today;
          setMinDueDate(today);
        } else {
          newFormData[name] = value;
          setMinDueDate(value);
        }

        // Adjust mrrequireddate if it's now before mrdate
        if (newFormData.mrrequireddate < newFormData[name]) {
          newFormData.mrrequireddate = newFormData[name];
        }
      } else if (name === "mrrequireddate") {
        if (value < newFormData.mrdate) {
          // If selected due date is before req date, set it to req date
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
      avid: null, // Reset avid when attribute changes
    };
    setItems(updatedItems);
  };

  const handleAttributeValueChange = (itemIndex, attrIndex, selectedOption) => {
    const updatedItems = [...items];
    updatedItems[itemIndex].selectedAttributes[attrIndex] = {
      ...updatedItems[itemIndex].selectedAttributes[attrIndex],
      attributeValue: selectedOption,
      avid: selectedOption.value,
      mriid: updatedItems[itemIndex].mriid || 0, // Add this line
    };
    setItems(updatedItems);
  };

  const handleAddAttribute = (itemIndex) => {
    const updatedItems = [...items];
    updatedItems[itemIndex].selectedAttributes.push({
      attributeId: null,
      attributeValues: [],
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
      await requisitionSchema.validate(
        {
          mrdate: formData.mrdate,
          mrrequireddate: formData.mrrequireddate,
          selectedWarehouse,
          items,
        },
        { abortEarly: false }
      );

      const materialRequestItems = items.map((item) => ({
        mriid: item.mriid || 0,
        mrid: parseInt(params.mrid),
        proid: item.selectedProductId.value,
        pvid: item.selectedProductId.valuee,
        price: item.selectedProductId.price,
        itemqty: parseInt(item.quantities),
        itemtargetlocation: selectedWarehouse.uaid,
        itemrequestby: uid,
        itemuom: item.selectedProductId.itemuom,
        itemuomcfactor: 0,
        itemselecteduom: 0,
        mridetails: item.selectedAttributes.map((attr) => ({
          mridid: attr.mridid || 0,
          mriid: item.mriid || 0, // Use the parent mriid here
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
        seriesid: 1,
        mrno: 0,
        sourcewarehouse: orgid,
        targetwarehouse: selectedWarehouse.value,
        mrdate: formData.mrdate,
        mrrequireddate: formData.mrrequireddate,
        ordertandc: "",
        materialrequestitems: materialRequestItems,
        materialattachments: [],
      };

      console.log("Request Body:", JSON.stringify(body, null, 2)); // Log the request body

      const response = await CallFor(
        `v2/Orders/UpdateMaterialRequest`,
        "post",
        body,
        "Auth"
      );

      if (response) {
        reToast.success("Requisition updated successfully!");
        router.push("/admin/Ordering/Purchase/Requistion");
      } else {
        reToast.error("Failed to update requisition");
      }
    } catch (error) {
      console.error("Save error:", error);
      if (error.name === "ValidationError") {
        const newErrors = {};
        error.inner.forEach((err) => {
          if (err.path) {
            newErrors[err.path] = err.message;
          }
        });
        setErrors(newErrors);
      } else {
        reToast.error("An error occurred while saving");
      }
    }
  };

  const styles = getStyles(theme === "dark");
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
                onChange={setSelectedWarehouse}
                className={`z-5 text-black w-3/4}`}
                menuPortalTarget={document.body}
                styles={styles}
              />
            </div>
            {errors.selectedWarehouse && (
              <p className="text-red-500 text-sm">{errors.selectedWarehouse}</p>
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
        .filter(a => !item.selectedAttributes.some((sa, i) => i !== attrIndex && sa.attributeId === a.id))
        .map(a => ({ value: a.id, label: a.name })) || []}
      value={attr.attributeId ? { value: attr.attributeId, label: attr.attributeName } : null}
      onChange={(selectedOption) => handleAttributeChange(index, attrIndex, selectedOption)}
      className={`z-5 text-black w-full mt-1 mr-2 ${errors[`items[${index}].selectedAttributes[${attrIndex}].attributeId`] ? 'border-red-500' : ''}`}
      menuPortalTarget={document.body}
      styles={styles}
      isDisabled={!item.selectedProductId}
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
                options={item.selectedProductId?.attributes.find(a => a.id === attr.attributeId)?.values || []}
                value={attr.attributeValue}
                onChange={(selectedOption) => handleAttributeValueChange(index, attrIndex, selectedOption)}
                className={`z-5 text-black w-full mt-1 ${errors[`items[${index}].selectedAttributes[${attrIndex}].attributeValue`] ? 'border-red-500' : ''}`}
                menuPortalTarget={document.body}
                styles={styles}
                isDisabled={!item.selectedProductId || !attr.attributeId} // Disable if no product or attribute is selected
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
              updatedItems[index].quantities = e.target.value;
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
      {/* Error messages below each input */}
      <tr>
        <td></td>
        <td>{errors[`items[${index}].selectedProductId`] && <p className="text-red-500 text-sm mt-1">{errors[`items[${index}].selectedProductId`]}</p>}</td>
        <td>
          {errors[`items[${index}].selectedAttributes`] && <p className="text-red-500 text-sm mt-1">{errors[`items[${index}].selectedAttributes`]}</p>}
          <button
            onClick={() => handleAddAttribute(index)}
            className="bg-green-500 text-white px-2 ml-2 py-1 rounded mt-2"
            disabled={item.selectedAttributes.length === item.selectedProductId?.attributes.length}
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
        <Link href="/admin/Ordering/Purchase/Requistion">
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